import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import WebSocket from 'ws';

const rootDir = process.cwd();
const chromeBin = process.env.CHROME_BIN || '/usr/bin/google-chrome';
const viteBin = path.join(rootDir, 'node_modules', '.bin', 'vite');
const screenshotDir = path.join(rootDir, 'artifacts');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

function spawnLogged(command, args, label, extraEnv = {}) {
  const child = spawn(command, args, {
    cwd: rootDir,
    env: { ...process.env, ...extraEnv },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (data) => process.stdout.write(`[${label}] ${data}`));
  child.stderr.on('data', (data) => process.stderr.write(`[${label}] ${data}`));
  return child;
}

async function stopProcess(child) {
  if (!child || child.killed || child.exitCode !== null) return;

  child.kill('SIGTERM');
  const exited = new Promise((resolve) => child.once('exit', resolve));
  await Promise.race([exited, sleep(2_000)]);
  if (child.exitCode === null) {
    child.kill('SIGKILL');
    await Promise.race([exited, sleep(1_000)]);
  }
}

async function waitForHttp(url, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(250);
  }

  throw new Error(`Timed out waiting for ${url}: ${lastError?.message || 'no response'}`);
}

async function getJson(url, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(250);
  }

  throw new Error(`Timed out fetching ${url}: ${lastError?.message || 'no response'}`);
}

function connectCdp(webSocketDebuggerUrl) {
  const ws = new WebSocket(webSocketDebuggerUrl);
  let nextId = 1;
  const pending = new Map();

  ws.on('message', (raw) => {
    const message = JSON.parse(raw.toString());
    if (!message.id) return;
    const request = pending.get(message.id);
    if (!request) return;

    pending.delete(message.id);
    if (message.error) {
      request.reject(new Error(`${message.error.message}: ${message.error.data || ''}`));
      return;
    }
    request.resolve(message.result);
  });

  const ready = new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });

  return {
    async send(method, params = {}) {
      await ready;
      const id = nextId++;
      ws.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
      });
    },
    close() {
      ws.close();
    },
  };
}

async function evaluate(cdp, expression, timeoutMs = 8_000) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
    timeout: timeoutMs,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Runtime.evaluate failed');
  }
  return result.result.value;
}

async function click(cdp, x, y) {
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none' });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  await sleep(180);
}

async function keyTap(cdp, key) {
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key, text: key });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key });
  await sleep(120);
}

function countPngColors(buffer) {
  const text = buffer.toString('latin1');
  const idatCount = (text.match(/IDAT/g) || []).length;
  const uniqueBytes = new Set(buffer).size;
  return { idatCount, uniqueBytes };
}

async function captureAndCheck(cdp, viewport, label) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.deviceScaleFactor,
    mobile: viewport.mobile,
  });
  await sleep(500);

  const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  const screenshotPath = path.join(screenshotDir, `verify-${label}.png`);
  await mkdir(path.dirname(screenshotPath), { recursive: true });
  await writeFile(screenshotPath, Buffer.from(screenshot.data, 'base64'));

  const png = await readFile(screenshotPath);
  const { idatCount, uniqueBytes } = countPngColors(png);
  if (png.length < 10_000 || idatCount < 1 || uniqueBytes < 64) {
    throw new Error(`Screenshot looks blank: ${label} bytes=${png.length}, idat=${idatCount}, unique=${uniqueBytes}`);
  }

  return screenshotPath;
}

async function main() {
  const vitePort = await getFreePort();
  const cdpPort = await getFreePort();
  const appUrl = `http://127.0.0.1:${vitePort}`;
  const profileDir = await mkdtemp(path.join(tmpdir(), 'browser-game-playset-chrome-'));

  let vite;
  let chrome;
  let browser;
  let cdp;

  try {
    vite = spawnLogged(viteBin, ['--host', '127.0.0.1', '--port', String(vitePort), '--strictPort'], 'vite');
    await waitForHttp(appUrl);

    chrome = spawnLogged(
      chromeBin,
      [
        '--headless=new',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--enable-unsafe-swiftshader',
        '--disable-background-networking',
        '--disable-extensions',
        '--disable-sync',
        '--mute-audio',
        '--no-first-run',
        '--no-default-browser-check',
        '--remote-debugging-address=127.0.0.1',
        `--remote-debugging-port=${cdpPort}`,
        `--user-data-dir=${profileDir}`,
        '--window-size=1280,720',
        'about:blank',
      ],
      'chrome',
    );

    const version = await getJson(`http://127.0.0.1:${cdpPort}/json/version`);
    browser = connectCdp(version.webSocketDebuggerUrl);
    const { targetId } = await browser.send('Target.createTarget', { url: appUrl });
    const pages = await getJson(`http://127.0.0.1:${cdpPort}/json/list`);
    const page = pages.find((candidate) => candidate.id === targetId || candidate.url.startsWith(appUrl));
    if (!page?.webSocketDebuggerUrl) throw new Error(`Could not find CDP page for ${appUrl}`);

    cdp = connectCdp(page.webSocketDebuggerUrl);
    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.send('Page.navigate', { url: appUrl });
    await sleep(1_500);

    const hubState = await evaluate(
      cdp,
      `(() => {
        const cards = Array.from(document.querySelectorAll('[data-game-card]')).map((node) => ({
          game: node.getAttribute('data-game-card'),
          href: node.getAttribute('href'),
          text: (node.textContent || '').replace(/\\s+/g, ' ').trim(),
        }));
        return {
          title: document.title,
          hasHub: Boolean(document.querySelector('[data-game-hub]')),
          heading: document.querySelector('.game-hub-title')?.textContent || '',
          cardCount: cards.length,
          games: cards.map((card) => card.game),
          hrefs: cards.map((card) => card.href),
          hasCanvas: Boolean(document.querySelector('canvas')),
          hasTowerDebug: Boolean(window.__orbitBastionDebug),
        };
      })()`,
    );
    const expectedHubGames = ['tower', 'cabin', 'voxel', 'orbit'];
    if (
      !hubState.hasHub ||
      !hubState.title.includes('游戏大厅') ||
      !hubState.heading.includes('游戏大厅') ||
      hubState.cardCount !== expectedHubGames.length ||
      hubState.hasCanvas ||
      hubState.hasTowerDebug ||
      expectedHubGames.some((game) => !hubState.games.includes(game)) ||
      expectedHubGames.some((game) => !hubState.hrefs.some((href) => href?.includes(`game=${game}`)))
    ) {
      throw new Error(`Game hub did not render as the root entry: ${JSON.stringify(hubState)}`);
    }

    const hubScreenshot = await captureAndCheck(
      cdp,
      { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false },
      'game-hub-1280x720',
    );

    await cdp.send('Page.navigate', { url: `${appUrl}/?game=tower` });
    await sleep(1_500);

    const bootState = await evaluate(cdp, `Boolean(window.__orbitBastionDebug && document.querySelector('canvas'))`);
    if (!bootState) throw new Error('Phaser debug hook or canvas was not created');

    await click(cdp, 410, 426);
    const openedState = await evaluate(cdp, `window.__orbitBastionDebug.state()`);
    if (openedState.mode !== 'planting') {
      throw new Error(`Start button did not open planting mode: ${JSON.stringify(openedState)}`);
    }
    if (openedState.plants < 4) {
      throw new Error(`Starter garden was not planted automatically: ${JSON.stringify(openedState)}`);
    }
    if (
      !openedState.autoGarden ||
      !openedState.autoStrategy ||
      !openedState.autoWave ||
      !openedState.commandMode ||
      !openedState.campaignMode ||
      openedState.campaignActions < 1 ||
      openedState.campaignSavedClicks < 1 ||
      !openedState.campaignPlan.includes('开局') ||
      !Array.isArray(openedState.campaignHistory) ||
      openedState.campaignHistory.length < 1 ||
      !Array.isArray(openedState.campaignDetails) ||
      !openedState.campaignDetails.some((item) => item.includes('预算')) ||
      !openedState.campaignDetails.some((item) => item.includes('低操作')) ||
      !openedState.campaignDetails.some((item) => item.includes('目标')) ||
      !openedState.campaignDetails.some((item) => item.includes('蓝图')) ||
      !openedState.campaignDetails.some((item) => item.includes('账本')) ||
      openedState.waveDecisionBudget !== 1 ||
      openedState.waveDecisionUsed !== 1 ||
      !openedState.lowTouchDirectorMode ||
      openedState.operationLoad > 1 ||
      !openedState.operationLedger.includes('低操作') ||
      !openedState.targetRatioBand.includes('目标') ||
      typeof openedState.targetRatioLow !== 'number' ||
      typeof openedState.targetRatioHigh !== 'number' ||
      typeof openedState.balanceRatio !== 'number' ||
      !openedState.focusCommandMode ||
      !openedState.focusCommandTitle ||
      !openedState.focusCommandText.includes(openedState.focusCommandTitle) ||
      !openedState.focusCommandDetail ||
      !openedState.focusCommandRisk ||
      !openedState.focusCommandKind ||
      typeof openedState.focusCommandActions !== 'number' ||
      typeof openedState.focusCommandSavings !== 'number' ||
      !openedState.focusLoopMode ||
      typeof openedState.focusLoopActions !== 'number' ||
      typeof openedState.focusLoopSavings !== 'number' ||
      !openedState.focusLoopLast ||
      !openedState.handsFreeMode ||
      typeof openedState.handsFreeActions !== 'number' ||
      typeof openedState.handsFreeSavings !== 'number' ||
      typeof openedState.handsFreeStreak !== 'number' ||
      !openedState.handsFreeLast ||
      typeof openedState.decisionBurden !== 'number' ||
      openedState.directorLoopActions < 1 ||
      !openedState.battlePlanMode ||
      !openedState.tacticalQueueMode ||
      !openedState.opsDeckMode ||
      !openedState.combatFeedMode ||
      !Array.isArray(openedState.combatFeed) ||
      openedState.combatFeed.length < 1 ||
      typeof openedState.waveDamageDone !== 'number' ||
      typeof openedState.waveKills !== 'number' ||
      typeof openedState.waveSunGained !== 'number' ||
      !openedState.mvpPlant ||
      !Array.isArray(openedState.plantContributions) ||
      openedState.opsDeckActions < 1 ||
      !Array.isArray(openedState.opsCards) ||
      openedState.opsCards.length !== 3 ||
      !openedState.opsCards.some((item) => item.includes('压')) ||
      !openedState.laneFocus ||
      openedState.routePressure < 1 ||
      !openedState.rhythm ||
      !openedState.lastTempoPlan ||
      !openedState.runRules.includes('作战计划') ||
      !openedState.runRules.includes('指挥官节奏') ||
      !openedState.runRules.includes('战役管家') ||
      !openedState.runRules.includes('低操作导演') ||
      !openedState.runRules.includes('免手波次') ||
      !openedState.runRules.includes('战术队列') ||
      !openedState.runRules.includes('作战手牌') ||
      !openedState.balanceVerdict ||
      !openedState.nextAdvice ||
      !openedState.queueLastPlan.includes('开局') ||
      !openedState.buildFocusKind ||
      !openedState.buildFocusTitle ||
      !openedState.buildFocusAdvice ||
      openedState.buildFocusScore < 1 ||
      !openedState.tacticalBrief.includes('构筑') ||
      !openedState.contractMode ||
      !openedState.contractTitle ||
      !openedState.contractGoal ||
      !openedState.contractProgress ||
      !openedState.intentMode ||
      openedState.intentActions < 1 ||
      !openedState.activeIntent ||
      !Array.isArray(openedState.intentCards) ||
      openedState.intentCards.length !== 3 ||
      !openedState.intentCards.some((item) => item.includes('荐')) ||
      !Array.isArray(openedState.intentHistory) ||
      openedState.intentHistory.length < 1 ||
      !openedState.lastIntentPlan ||
      openedState.intentSavings < 1 ||
      !openedState.runRules.includes('作战预案') ||
      !openedState.runRules.includes('焦点指令') ||
      openedState.directorFieldOrders !== 0 ||
      openedState.directorLastOrder !== '待命' ||
      !Array.isArray(openedState.directorOrderHistory) ||
      openedState.adaptiveIntensity !== 1 ||
      !Array.isArray(openedState.intensityHistory) ||
      openedState.intensityHistory.length < 1 ||
      openedState.wavePlanKind !== 'training' ||
      !openedState.wavePlanTitle ||
      !openedState.wavePlanCounter ||
      !openedState.wavePlanMix ||
      !Array.isArray(openedState.wavePlanHistory) ||
      !openedState.balanceLedger.includes('账本') ||
      !openedState.tacticalBrief.includes('低操作') ||
      typeof openedState.fairnessDebt !== 'number' ||
      typeof openedState.mercyBank !== 'number' ||
      !openedState.tacticalBrief.includes('蓝图')
    ) {
      throw new Error(`Low-click automation should be enabled by default: ${JSON.stringify(openedState)}`);
    }

    const placements = [
      { card: [578, 670], plot: [732, 286] },
    ];
    for (const placement of placements) {
      await click(cdp, placement.card[0], placement.card[1]);
      await click(cdp, placement.plot[0], placement.plot[1]);
    }

    const plantedState = await evaluate(cdp, `window.__orbitBastionDebug.state()`);
    if (plantedState.plants !== openedState.plants + 1) {
      throw new Error(`Mouse placement failed after starter garden: ${JSON.stringify({ openedState, plantedState })}`);
    }

    await click(cdp, 1176, 36);
    await sleep(2_500);

    const state = await evaluate(
      cdp,
      `(() => {
        const canvas = document.querySelector('canvas');
        return {
          hasCanvas: Boolean(canvas),
          width: canvas?.width || 0,
          height: canvas?.height || 0,
          ...window.__orbitBastionDebug.state(),
        };
      })()`,
    );

    if (!state.hasCanvas || state.width < 640 || state.height < 360) {
      throw new Error(`Canvas dimensions look wrong: ${JSON.stringify(state)}`);
    }
    if (state.mode !== 'wave') {
      throw new Error(`Expected wave mode after planting and starting wave: ${JSON.stringify(state)}`);
    }
    if (
      state.zombies < 1 ||
      state.plants < plantedState.plants ||
      state.gardenerPlacements < 1 ||
      state.planActions < 1 ||
      !state.campaignMode ||
      state.campaignActions < openedState.campaignActions + 1 ||
      state.campaignSavedClicks <= openedState.campaignSavedClicks ||
      !state.campaignPlan.includes('开波前') ||
      !state.campaignPlan.includes('低操作') ||
      !state.campaignDetails.some((item) => item.includes('热点')) ||
      !state.campaignDetails.some((item) => item.includes('低操作')) ||
      !state.campaignDetails.some((item) => item.includes('目标')) ||
      !state.campaignDetails.some((item) => item.includes('蓝图')) ||
      !state.campaignDetails.some((item) => item.includes('账本')) ||
      state.waveDecisionBudget !== 1 ||
      state.waveDecisionUsed !== 1 ||
      !state.lowTouchDirectorMode ||
      state.directorLoopActions <= openedState.directorLoopActions ||
      state.operationLoad > 1 ||
      !state.operationLedger.includes('低操作') ||
      !state.targetRatioBand.includes('目标') ||
      typeof state.targetRatioLow !== 'number' ||
      typeof state.targetRatioHigh !== 'number' ||
      typeof state.balanceRatio !== 'number' ||
      !state.balanceClamp ||
      state.balanceClamp === '未校准' ||
      !state.balanceClamp.includes('目标') ||
      !state.focusCommandMode ||
      !state.focusCommandTitle ||
      !state.focusCommandDetail ||
      !state.focusCommandRisk ||
      !state.focusCommandText.includes(state.focusCommandTitle) ||
      !state.focusCommandKind ||
      typeof state.focusCommandActions !== 'number' ||
      typeof state.focusCommandSavings !== 'number' ||
      !state.focusLoopMode ||
      typeof state.focusLoopActions !== 'number' ||
      typeof state.focusLoopSavings !== 'number' ||
      !state.focusLoopLast ||
      !state.handsFreeMode ||
      typeof state.handsFreeActions !== 'number' ||
      typeof state.handsFreeSavings !== 'number' ||
      typeof state.handsFreeStreak !== 'number' ||
      !state.handsFreeLast ||
      typeof state.decisionBurden !== 'number' ||
      state.queueActions < 1 ||
      state.queueSavedClicks < 1 ||
      !state.combatFeedMode ||
      !Array.isArray(state.combatFeed) ||
      state.combatFeed.length < 2 ||
      !state.combatFeed.some((item) => item.includes('第 1 波')) ||
      state.waveDamageDone <= 0 ||
      typeof state.waveSunGained !== 'number' ||
      typeof state.waveKills !== 'number' ||
      !state.mvpPlant ||
      !Array.isArray(state.plantContributions) ||
      !Array.isArray(state.queueHistory) ||
      state.queueHistory.length < 1 ||
      !state.queueLastPlan.includes('开波前') ||
      !state.opsDeckMode ||
      state.opsDeckActions < openedState.opsDeckActions + 1 ||
      !Array.isArray(state.opsCards) ||
      state.opsCards.length !== 3 ||
      !state.opsCards.some((item) => item.includes('压')) ||
      !state.laneFocus ||
      state.routePressure < 1 ||
      !state.rhythm ||
      !state.lastTempoPlan ||
      !state.balanceVerdict ||
      !state.nextAdvice ||
      state.savedClicks < 1 ||
      !state.buildFocusKind ||
      !state.buildFocusTitle ||
      !state.buildFocusAdvice ||
      state.buildFocusScore < 1 ||
      !state.tacticalBrief.includes('构筑') ||
      !state.contractMode ||
      !state.activeContract ||
      !state.contractTitle ||
      !state.contractGoal ||
      !state.contractProgress ||
      !state.tacticalBrief.includes('契约') ||
      !state.runRules.includes('波次契约') ||
      !state.combatFeed.some((item) => item.includes('波次契约')) ||
      !state.intentMode ||
      state.intentActions < openedState.intentActions + 1 ||
      !state.activeIntent ||
      !Array.isArray(state.intentCards) ||
      state.intentCards.length !== 3 ||
      !state.intentCards.some((item) => item.includes('荐')) ||
      !Array.isArray(state.intentHistory) ||
      state.intentHistory.length < 2 ||
      !state.lastIntentPlan ||
      state.intentSavings < openedState.intentSavings + 1 ||
      state.directorFieldOrders < 1 ||
      state.directorAssists < 1 ||
      !state.directorLastOrder ||
      state.directorLastOrder === '待命' ||
      !Array.isArray(state.directorOrderHistory) ||
      state.directorOrderHistory.length < 1 ||
      !state.runRules.includes('战局导演') ||
      !state.runRules.includes('战役管家') ||
      !state.runRules.includes('低操作导演') ||
      !state.runRules.includes('免手波次') ||
      !state.runRules.includes('战术队列') ||
      !state.runRules.includes('作战手牌') ||
      !state.runRules.includes('焦点指令') ||
      state.adaptiveIntensity < 0.84 ||
      state.adaptiveIntensity > 1.18 ||
      !state.tacticalBrief.includes('强度') ||
      !state.tacticalBrief.includes('热点') ||
      !state.tacticalBrief.includes('构筑') ||
      !state.tacticalBrief.includes('契约') ||
      !state.commandMode ||
      !state.autoWave ||
      !state.battlePlanMode ||
      !state.runRules.includes('作战计划') ||
      !state.pressureTier ||
      !state.activeBattleEvent ||
      !state.battleEventTitle ||
      state.battleEventTriggers < 1 ||
      !Array.isArray(state.battleEventHistory) ||
      state.battleEventHistory.length < 1 ||
      !state.wavePlanTitle ||
      !state.wavePlanCounter ||
      !state.wavePlanMix ||
      !Array.isArray(state.wavePlanHistory) ||
      state.wavePlanHistory.length < 1 ||
      !state.balanceLedger.includes('账本') ||
      !state.balanceLedger.includes('目标') ||
      typeof state.fairnessDebt !== 'number' ||
      typeof state.mercyBank !== 'number' ||
      !state.tacticalBrief.includes('蓝图') ||
      !state.tacticalBrief.includes('低操作') ||
      state.brainHp <= 0 ||
      state.pathNodes < 10 ||
      state.plots < 15
    ) {
      throw new Error(`Path defense state did not advance as expected: ${JSON.stringify(state)}`);
    }

    const focusCommandState = await evaluate(cdp, `window.__orbitBastionDebug.focusCommand()`);
    if (
      focusCommandState.focusCommandActions <= state.focusCommandActions ||
      focusCommandState.focusCommandSavings <= state.focusCommandSavings ||
      focusCommandState.savedClicks <= state.savedClicks ||
      !focusCommandState.focusCommandTitle ||
      !focusCommandState.focusCommandDetail ||
      !focusCommandState.focusCommandText.includes(focusCommandState.focusCommandTitle) ||
      !focusCommandState.runRules.includes('焦点指令') ||
      !focusCommandState.combatFeed.some((item) => item.includes('焦点'))
    ) {
      throw new Error(`Focus command did not execute a real low-click action: ${JSON.stringify({ state, focusCommandState })}`);
    }

    const focusLoopState = await evaluate(cdp, `window.__orbitBastionDebug.focusLoop(4)`);
    if (
      !focusLoopState.focusLoopMode ||
      focusLoopState.focusLoopActions <= focusCommandState.focusLoopActions ||
      focusLoopState.focusLoopSavings <= focusCommandState.focusLoopSavings ||
      focusLoopState.focusCommandActions <= focusCommandState.focusCommandActions ||
      focusLoopState.savedClicks <= focusCommandState.savedClicks ||
      !focusLoopState.focusLoopLast ||
      focusLoopState.focusLoopLast === '待命' ||
      !focusLoopState.runRules.includes('焦点巡航') ||
      !focusLoopState.combatFeed.some((item) => item.includes('焦点巡航'))
    ) {
      throw new Error(`Focus loop did not execute real autopilot ticks: ${JSON.stringify({ focusCommandState, focusLoopState })}`);
    }

    const handsFreeState = await evaluate(cdp, `window.__orbitBastionDebug.handsFree(4)`);
    if (
      !handsFreeState.handsFreeMode ||
      handsFreeState.handsFreeActions <= focusLoopState.handsFreeActions ||
      handsFreeState.handsFreeSavings <= focusLoopState.handsFreeSavings ||
      handsFreeState.decisionBurden !== 0 ||
      !handsFreeState.handsFreeLast ||
      handsFreeState.handsFreeLast === '待命' ||
      !handsFreeState.runRules.includes('免手波次') ||
      !handsFreeState.combatFeed.some((item) => item.includes('免手波次'))
    ) {
      throw new Error(`Hands-free wave steward did not execute real low-touch pulses: ${JSON.stringify({ focusLoopState, handsFreeState })}`);
    }

    const forcedDirector = await evaluate(cdp, `window.__orbitBastionDebug.directorOrder()`);
    if (
      forcedDirector.directorFieldOrders < state.directorFieldOrders + 1 ||
      forcedDirector.savedClicks < state.savedClicks + 2 ||
      forcedDirector.directorOrderHistory.length < state.directorOrderHistory.length ||
      forcedDirector.directorLastOrder === state.directorLastOrder && forcedDirector.directorFieldOrders === state.directorFieldOrders
    ) {
      throw new Error(`Director field order did not execute as a real low-click action: ${JSON.stringify({ state, forcedDirector })}`);
    }

    const forcedOpsDeck = await evaluate(cdp, `window.__orbitBastionDebug.opsDeck()`);
    if (
      forcedOpsDeck.opsDeckActions <= forcedDirector.opsDeckActions ||
      forcedOpsDeck.savedClicks <= forcedDirector.savedClicks ||
      !forcedOpsDeck.runRules.includes('作战手牌') ||
      !Array.isArray(forcedOpsDeck.opsCards) ||
      forcedOpsDeck.opsCards.length !== 3 ||
      forcedOpsDeck.routePressure < 1 ||
      !forcedOpsDeck.laneFocus ||
      !forcedOpsDeck.rhythm
    ) {
      throw new Error(`Ops deck did not execute as a real one-click command: ${JSON.stringify({ forcedDirector, forcedOpsDeck })}`);
    }

    const forcedPressureCard = await evaluate(cdp, `window.__orbitBastionDebug.opsCard(0)`);
    if (
      forcedPressureCard.opsDeckActions <= forcedOpsDeck.opsDeckActions ||
      forcedPressureCard.savedClicks <= forcedOpsDeck.savedClicks ||
      !forcedPressureCard.combatFeed.some((item) => item.includes('手牌压线')) ||
      !forcedPressureCard.runRules.includes('作战手牌')
    ) {
      throw new Error(`Pressure ops card did not execute its own action: ${JSON.stringify({ forcedOpsDeck, forcedPressureCard })}`);
    }

    const forcedFillCard = await evaluate(cdp, `window.__orbitBastionDebug.opsCard(1)`);
    if (
      forcedFillCard.opsDeckActions <= forcedPressureCard.opsDeckActions ||
      forcedFillCard.savedClicks <= forcedPressureCard.savedClicks ||
      !forcedFillCard.combatFeed.some((item) => item.includes('手牌补强')) ||
      !forcedFillCard.runRules.includes('作战手牌')
    ) {
      throw new Error(`Fill ops card did not execute its own action: ${JSON.stringify({ forcedPressureCard, forcedFillCard })}`);
    }

    await click(cdp, 1166, 160);
    const uiIntent = await evaluate(cdp, `window.__orbitBastionDebug.state()`);
    if (
      uiIntent.intentActions <= forcedFillCard.intentActions ||
      uiIntent.intentSavings <= forcedFillCard.intentSavings ||
      uiIntent.activeIntent !== 'burst' ||
      !uiIntent.lastIntentPlan.includes('强杀') ||
      uiIntent.intentCards.length !== 3 ||
      !uiIntent.intentCards.some((item) => item.includes('荐')) ||
      !uiIntent.runRules.includes('作战预案')
    ) {
      throw new Error(`Battle intent card did not execute from the canvas UI: ${JSON.stringify({ forcedFillCard, uiIntent })}`);
    }

    const forcedIntent = await evaluate(cdp, `window.__orbitBastionDebug.intent('burst')`);
    if (
      forcedIntent.intentActions <= uiIntent.intentActions ||
      forcedIntent.intentSavings <= uiIntent.intentSavings ||
      forcedIntent.activeIntent !== 'burst' ||
      !forcedIntent.lastIntentPlan.includes('强杀') ||
      forcedIntent.intentCards.length !== 3 ||
      !forcedIntent.intentCards.some((item) => item.includes('荐')) ||
      !forcedIntent.runRules.includes('作战预案')
    ) {
      throw new Error(`Battle intent did not execute as a real one-click plan: ${JSON.stringify({ uiIntent, forcedIntent })}`);
    }

    const waveScreenshot = await captureAndCheck(
      cdp,
      { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false },
      'wave-1280x720',
    );

    const mutationState = await evaluate(cdp, `window.__orbitBastionDebug.forceMutation()`);
    if (
      mutationState.mode !== 'mutation' ||
      mutationState.pendingMutations !== 3 ||
      mutationState.currentMutationPlant !== null ||
      !Array.isArray(mutationState.choiceTitles) ||
      mutationState.choiceTitles.length !== 3 ||
      !mutationState.buildFocusTitle ||
      !mutationState.buildFocusAdvice ||
      mutationState.buildFocusScore < 1 ||
      !mutationState.tacticalBrief.includes('构筑') ||
      !mutationState.contractMode ||
      !mutationState.contractTitle ||
      !mutationState.contractGoal ||
      mutationState.contractHistory.length < 1 ||
      mutationState.contractCompleted < 1 ||
      mutationState.contractRewards < 1
    ) {
      throw new Error(`One-choice strategy reward was not created: ${JSON.stringify(mutationState)}`);
    }
    const tacticalTitles = ['空投豌豆', '临时冰墙', '复制插枝', '悬赏阳光', '战斗巡航'];
    if (!tacticalTitles.includes(mutationState.choiceTitles[0])) {
      throw new Error(`First reward should be a tactical low-click card: ${JSON.stringify(mutationState)}`);
    }
    const autoPicksBefore = mutationState.autoStrategyPicks;

    const mutationScreenshot = await captureAndCheck(
      cdp,
      { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false },
      'mutation-1280x720',
    );

    await sleep(1_500);

    const resolvedState = await evaluate(cdp, `window.__orbitBastionDebug.state()`);
    if (
      !['planting', 'wave'].includes(resolvedState.mode) ||
      resolvedState.pendingMutations !== 0 ||
      resolvedState.autoStrategyPicks <= autoPicksBefore ||
      resolvedState.plants < state.plants ||
      resolvedState.plantLevels.slice(0, state.plants).some((level) => level < 2)
    ) {
      throw new Error(`Automatic strategy reward or automatic plant growth failed: ${JSON.stringify(resolvedState)}`);
    }
    if (
      resolvedState.mode === 'wave' &&
      !(
        (resolvedState.cruiseMode && resolvedState.autoWave) ||
        (resolvedState.commandMode && resolvedState.autoWave)
      )
    ) {
      throw new Error(`Auto-started wave should only happen through command or cruise mode: ${JSON.stringify(resolvedState)}`);
    }

    const beforeCruise = await evaluate(cdp, `window.__orbitBastionDebug.state()`);
    const afterCruise = await evaluate(cdp, `window.__orbitBastionDebug.autoCruise(9)`);
    if (
      !afterCruise.cruiseMode ||
      !afterCruise.autoWave ||
      !afterCruise.autoGarden ||
      !afterCruise.autoStrategy ||
      !afterCruise.battlePlanMode ||
      afterCruise.gameSpeed < 1.5 ||
      afterCruise.cruiseActions < beforeCruise.cruiseActions + 9 ||
      !afterCruise.campaignMode ||
      afterCruise.campaignActions < beforeCruise.campaignActions + 3 ||
      afterCruise.campaignSavedClicks <= beforeCruise.campaignSavedClicks ||
      afterCruise.campaignHistory.length < 3 ||
      !afterCruise.campaignPlan ||
      !afterCruise.campaignDetails.some((item) => item.includes('预算')) ||
      !afterCruise.campaignDetails.some((item) => item.includes('低操作')) ||
      !afterCruise.campaignDetails.some((item) => item.includes('目标')) ||
      afterCruise.waveDecisionBudget !== 1 ||
      afterCruise.waveDecisionUsed !== 1 ||
      !afterCruise.lowTouchDirectorMode ||
      afterCruise.directorLoopActions < beforeCruise.directorLoopActions + 3 ||
      afterCruise.operationLoad > 1 ||
      !afterCruise.operationLedger.includes('低操作') ||
      !afterCruise.targetRatioBand.includes('目标') ||
      typeof afterCruise.targetRatioLow !== 'number' ||
      typeof afterCruise.targetRatioHigh !== 'number' ||
      typeof afterCruise.balanceRatio !== 'number' ||
      afterCruise.balanceRatio > afterCruise.targetRatioHigh + 0.08 ||
      !afterCruise.balanceClamp ||
      afterCruise.balanceClamp === '未校准' ||
      !afterCruise.balanceClamp.includes('目标') ||
      typeof afterCruise.balanceSunLocked !== 'number' ||
      typeof afterCruise.balancePressureMultiplier !== 'number' ||
      !afterCruise.focusCommandMode ||
      !afterCruise.focusCommandTitle ||
      !afterCruise.focusCommandDetail ||
      !afterCruise.focusCommandRisk ||
      !afterCruise.focusCommandText.includes(afterCruise.focusCommandTitle) ||
      !afterCruise.focusCommandKind ||
      afterCruise.focusCommandActions < focusLoopState.focusCommandActions ||
      afterCruise.focusCommandSavings < focusLoopState.focusCommandSavings ||
      afterCruise.focusLoopActions < focusLoopState.focusLoopActions ||
      afterCruise.focusLoopSavings < focusLoopState.focusLoopSavings ||
      !afterCruise.focusLoopLast ||
      afterCruise.handsFreeActions < handsFreeState.handsFreeActions ||
      afterCruise.handsFreeSavings < handsFreeState.handsFreeSavings ||
      !afterCruise.handsFreeLast ||
      afterCruise.decisionBurden !== 0 ||
      afterCruise.commandActions < beforeCruise.commandActions + 3 ||
      afterCruise.queueActions < beforeCruise.queueActions + 3 ||
      afterCruise.queueSavedClicks < beforeCruise.queueSavedClicks + 3 ||
      afterCruise.queueHistory.length < 3 ||
      !afterCruise.queueHistory.some((item) => item.includes('自动选卡')) ||
      !afterCruise.queueLastPlan ||
      !afterCruise.combatFeedMode ||
      !Array.isArray(afterCruise.combatFeed) ||
      afterCruise.combatFeed.length < 3 ||
      typeof afterCruise.waveDamageDone !== 'number' ||
      typeof afterCruise.waveSunGained !== 'number' ||
      !afterCruise.mvpPlant ||
      afterCruise.mvpPlant === '暂无' ||
      !Array.isArray(afterCruise.plantContributions) ||
      afterCruise.plantContributions.length < 1 ||
      afterCruise.visiblePlantBadges < 3 ||
      !afterCruise.opsDeckMode ||
      afterCruise.opsDeckActions < beforeCruise.opsDeckActions + 3 ||
      !Array.isArray(afterCruise.opsCards) ||
      afterCruise.opsCards.length !== 3 ||
      !afterCruise.opsCards.some((item) => item.includes('压')) ||
      !afterCruise.laneFocus ||
      afterCruise.routePressure < 1 ||
      !afterCruise.rhythm ||
      !afterCruise.lastTempoPlan ||
      afterCruise.tempoChanges < 1 ||
      !afterCruise.balanceVerdict ||
      !afterCruise.nextAdvice ||
      afterCruise.balanceAdjustments < 1 ||
      !afterCruise.balanceLastAdjustment ||
      !afterCruise.intentMode ||
      afterCruise.intentActions < beforeCruise.intentActions + 3 ||
      afterCruise.intentSavings < beforeCruise.intentSavings + 3 ||
      afterCruise.intentHistory.length < 3 ||
      !afterCruise.lastIntentPlan ||
      afterCruise.intentCards.length !== 3 ||
      !afterCruise.intentCards.some((item) => item.includes('荐')) ||
      afterCruise.directorFieldOrders < beforeCruise.directorFieldOrders + 3 ||
      afterCruise.directorAssists < beforeCruise.directorAssists + 3 ||
      afterCruise.intensityHistory.length <= beforeCruise.intensityHistory.length ||
      afterCruise.intensityHistory.length < 3 ||
      !afterCruise.intensityReason.includes('→') ||
      afterCruise.wave < beforeCruise.wave + 3 ||
      afterCruise.autoStrategyPicks < beforeCruise.autoStrategyPicks + 3 ||
      afterCruise.gardenerPlacements < beforeCruise.gardenerPlacements + 1 ||
      afterCruise.planActions < beforeCruise.planActions + 1 ||
      afterCruise.savedClicks < beforeCruise.savedClicks + 1 ||
      !['S', 'A', 'B', 'C'].includes(afterCruise.waveGrade) ||
      !afterCruise.runRules.includes('巡航托管') ||
      !afterCruise.runRules.includes('免手波次') ||
      !afterCruise.runRules.includes('战役管家') ||
      !afterCruise.runRules.includes('低操作导演') ||
      !afterCruise.runRules.includes('作战计划') ||
      !afterCruise.runRules.includes('作战手牌') ||
      !afterCruise.runRules.includes('作战预案') ||
      !afterCruise.runRules.includes('节奏调度') ||
      !afterCruise.tacticalBrief.includes('巡航') ||
      !afterCruise.tacticalBrief.includes('热点') ||
      !afterCruise.tacticalBrief.includes('预案') ||
      !afterCruise.tacticalBrief.includes('构筑') ||
      !afterCruise.tacticalBrief.includes('契约') ||
      !afterCruise.contractMode ||
      afterCruise.contractHistory.length < 3 ||
      afterCruise.contractCompleted < beforeCruise.contractCompleted + 1 ||
      afterCruise.contractRewards <= beforeCruise.contractRewards ||
      !afterCruise.contractProgress ||
      !afterCruise.buildFocusTitle ||
      !afterCruise.buildFocusAdvice ||
      afterCruise.buildFocusScore < 1 ||
      afterCruise.battleEventTriggers < 3 ||
      afterCruise.battleEventHistory.length < 3 ||
      !afterCruise.battleEventTitle ||
      afterCruise.battleEventSpeedMultiplier <= 0 ||
      afterCruise.battleEventDamageMultiplier <= 0 ||
      !afterCruise.wavePlanTitle ||
      !afterCruise.wavePlanCounter ||
      !afterCruise.wavePlanMix ||
      !Array.isArray(afterCruise.wavePlanHistory) ||
      afterCruise.wavePlanHistory.length <= beforeCruise.wavePlanHistory.length ||
      !afterCruise.balanceLedger.includes('账本') ||
      !afterCruise.balanceLedger.includes('目标') ||
      typeof afterCruise.fairnessDebt !== 'number' ||
      typeof afterCruise.mercyBank !== 'number' ||
      !afterCruise.tacticalBrief.includes('蓝图') ||
      !afterCruise.tacticalBrief.includes('低操作') ||
      afterCruise.defenseScore <= 0 ||
      afterCruise.threatScore <= 0 ||
      afterCruise.brainHp <= 0
    ) {
      throw new Error(`Tower cruise automation failed: ${JSON.stringify({ beforeCruise, afterCruise })}`);
    }
    await sleep(1_000);

    const mobileScreenshot = await captureAndCheck(
      cdp,
      { width: 844, height: 390, deviceScaleFactor: 2, mobile: true },
      '844x390',
    );
    const mobileLayout = await evaluate(
      cdp,
      `(() => {
        const rect = document.querySelector('canvas')?.getBoundingClientRect();
        return {
          innerWidth,
          innerHeight,
          left: rect?.left || 0,
          right: rect?.right || 0,
          top: rect?.top || 0,
          bottom: rect?.bottom || 0,
          width: rect?.width || 0,
          height: rect?.height || 0,
        };
      })()`,
    );
    if (
      mobileLayout.width < 250 ||
      mobileLayout.height < 140 ||
      mobileLayout.left < -1 ||
      mobileLayout.right > mobileLayout.innerWidth + 1
    ) {
      throw new Error(`Mobile canvas layout looks wrong: ${JSON.stringify(mobileLayout)}`);
    }

    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.send('Page.navigate', { url: `${appUrl}/?game=cabin` });
    await sleep(1_500);

    const cabinBoot = await evaluate(
      cdp,
      `(() => {
        const canvas = document.querySelector('canvas');
        const state = window.__cabinBuilderDebug?.state();
        return {
          hasCanvas: Boolean(canvas),
          width: canvas?.width || 0,
          height: canvas?.height || 0,
          slotKeys: document.querySelectorAll('.cabin-slot-key').length,
          commandCards: document.querySelectorAll('.cabin-command-card').length,
          recommendedCommands: document.querySelectorAll('.cabin-command-card.recommended').length,
          commandText: document.querySelector('.cabin-command')?.textContent || '',
          statText: document.querySelector('.cabin-stat')?.textContent || '',
          shelterText: document.querySelector('.cabin-shelter')?.textContent || '',
          shelterRows: document.querySelectorAll('.cabin-shelter-row').length,
          systemsText: document.querySelector('.cabin-systems')?.textContent || '',
          handText: document.querySelector('.cabin-hand')?.textContent || '',
          introText: document.querySelector('.cabin-intro')?.textContent || '',
          introBriefItems: document.querySelectorAll('.cabin-intro-brief span').length,
          reticleOpacity: getComputedStyle(document.querySelector('.cabin-reticle')).opacity,
          reticleText: document.querySelector('.cabin-reticle')?.textContent || '',
          minimapText: document.querySelector('.cabin-minimap')?.textContent || '',
          focusText: document.querySelector('.cabin-focus')?.textContent || '',
          focusOpacity: getComputedStyle(document.querySelector('.cabin-focus')).opacity,
          focusButtons: document.querySelectorAll('.cabin-focus [data-cabin-focus-action]').length,
          focusMetaItems: document.querySelectorAll('.cabin-focus > div span').length,
          saveInfo: (() => {
            try {
              const save = JSON.parse(localStorage.getItem('brain-bloom-cabin-save-v1') || 'null');
              return {
                version: save?.version,
                blocks: save?.placedBlocks?.length,
                hasResources: Boolean(save?.resources?.wood),
                savedAt: save?.savedAt,
              };
            } catch {
              return null;
            }
          })(),
          state,
        };
      })()`,
    );
    if (!cabinBoot.hasCanvas || cabinBoot.width < 640 || cabinBoot.height < 360 || cabinBoot.state?.mode !== 'cabin') {
      throw new Error(`Cabin builder did not boot correctly: ${JSON.stringify(cabinBoot)}`);
    }
    if (!cabinBoot.state.resources || !cabinBoot.state.stats || !Array.isArray(cabinBoot.state.goalIdsDone)) {
      throw new Error(`Cabin survival state is missing resources, stats, or goals: ${JSON.stringify(cabinBoot.state)}`);
    }
    if (
      cabinBoot.state.autopilotMode !== false ||
      cabinBoot.state.autopilotActions !== 0 ||
      !cabinBoot.state.blueprintMode ||
      !cabinBoot.state.blueprintStage ||
      cabinBoot.state.blueprintGhosts !== 0 ||
      !cabinBoot.state.introBlueprintHidden ||
      cabinBoot.state.packOpen !== false ||
      cabinBoot.state.packActions !== 0 ||
      cabinBoot.state.packPrepared !== 0 ||
      !Array.isArray(cabinBoot.state.packRecipes) ||
      !cabinBoot.state.activeEvent ||
      !cabinBoot.state.eventTitle ||
      !Array.isArray(cabinBoot.state.eventHistory) ||
      cabinBoot.state.eventHistory.length < 1 ||
      cabinBoot.state.eventBeaconVisible ||
      !cabinBoot.state.commandMode ||
      cabinBoot.state.commandActions !== 0 ||
      !Array.isArray(cabinBoot.state.commandCards) ||
      cabinBoot.state.commandCards.length !== 4 ||
      !cabinBoot.state.commandCards.some((item) => item.recommended) ||
      !cabinBoot.state.commandCards.some((item) => item.kind === 'routine') ||
      !cabinBoot.state.commandRisk ||
      !cabinBoot.state.lastCommandPlan ||
      !cabinBoot.state.shelter ||
      typeof cabinBoot.state.shelter.dryness !== 'number' ||
      typeof cabinBoot.state.shelter.warmth !== 'number' ||
      typeof cabinBoot.state.shelter.noise !== 'number' ||
      typeof cabinBoot.state.shelter.morale !== 'number' ||
      !cabinBoot.state.shelterGrade ||
      !cabinBoot.state.shelterPlan ||
      !cabinBoot.state.shelterFocus ||
      cabinBoot.state.shelterFixes !== 0 ||
      !cabinBoot.state.routineMode ||
      cabinBoot.state.routineActions !== 0 ||
      !cabinBoot.state.routinePlan ||
      !Array.isArray(cabinBoot.state.routineHistory) ||
      cabinBoot.commandCards !== 4 ||
      cabinBoot.recommendedCommands < 1 ||
      !cabinBoot.commandText.includes('营地指令') ||
      !cabinBoot.commandText.includes('日程总管') ||
      !cabinBoot.statText.includes('小屋') ||
      cabinBoot.shelterRows !== 4 ||
      !cabinBoot.shelterText.includes('屋况') ||
      !cabinBoot.shelterText.includes('干燥') ||
      !cabinBoot.shelterText.includes('余温') ||
      !cabinBoot.shelterText.includes('噪音') ||
      !cabinBoot.shelterText.includes('士气') ||
      !cabinBoot.shelterText.includes(cabinBoot.state.shelterFocus) ||
      !cabinBoot.state.introBeaconHidden ||
      !cabinBoot.state.safetyPlan ||
      !cabinBoot.state.introVisible ||
      !cabinBoot.state.introWorldLabelsHidden ||
      cabinBoot.state.introBriefItems !== 4 ||
      cabinBoot.state.reticleVisible ||
      cabinBoot.reticleOpacity !== '0' ||
      cabinBoot.introBriefItems !== 4 ||
      cabinBoot.state.autosaves < 1 ||
      cabinBoot.state.saveBlocks !== 0 ||
      !cabinBoot.saveInfo ||
      cabinBoot.saveInfo.version !== 1 ||
      cabinBoot.saveInfo.blocks !== 0 ||
      !cabinBoot.saveInfo.hasResources ||
      cabinBoot.state.cabinAtmospherePieces < 10 ||
      cabinBoot.state.chimneySmokePuffs < 6 ||
      cabinBoot.state.warmWindowGlows < 2 ||
      cabinBoot.state.mapFocusMode ||
      cabinBoot.state.minimapMarkers < 4 ||
      !cabinBoot.state.guideTitle ||
      cabinBoot.state.guideDistance < 1 ||
      cabinBoot.state.guideTrailDots !== 0 ||
      cabinBoot.state.fireflyCount < 20 ||
      !cabinBoot.state.nearbyHint ||
      !cabinBoot.state.nearbyAction ||
      typeof cabinBoot.state.nearbyActionDistance !== 'number' ||
      typeof cabinBoot.state.nearbyMarkerVisible !== 'boolean' ||
      !cabinBoot.state.nearbyTargetTitle ||
      typeof cabinBoot.state.nearbyInteractions !== 'number' ||
      !cabinBoot.state.lastNearbyAction ||
      typeof cabinBoot.state.harvestPopupCount !== 'number' ||
      !cabinBoot.state.lastHarvestPopup ||
      typeof cabinBoot.state.toolSwingVisible !== 'boolean' ||
      typeof cabinBoot.state.toolSwingCount !== 'number' ||
      !cabinBoot.state.lastToolSwing ||
      typeof cabinBoot.state.shelterAuraVisible !== 'boolean' ||
      !cabinBoot.state.shelterAuraTone ||
      typeof cabinBoot.state.shelterAuraRings !== 'number' ||
      typeof cabinBoot.state.wolfTrailVisible !== 'boolean' ||
      typeof cabinBoot.state.wolfTrailPrints !== 'number' ||
      !cabinBoot.state.survivalVignette ||
      !cabinBoot.state.focusTitle ||
      !cabinBoot.state.focusDetail ||
      !cabinBoot.state.focusRisk ||
      !cabinBoot.state.focusRoute ||
      !cabinBoot.state.focusText.includes('下一步') ||
      cabinBoot.focusButtons !== 1 ||
      cabinBoot.focusMetaItems !== 3 ||
      !cabinBoot.focusText.includes(cabinBoot.state.focusTitle) ||
      cabinBoot.focusOpacity !== '0' ||
      cabinBoot.state.selectedTitle !== '木墙' ||
      !cabinBoot.state.selectedCost.includes('木材') ||
      cabinBoot.state.heldPreview !== '木墙' ||
      typeof cabinBoot.state.handRigVisible !== 'boolean' ||
      !cabinBoot.state.handRigTool ||
      !cabinBoot.state.handRigMotion ||
      cabinBoot.state.handRigParts < 6 ||
      !Array.isArray(cabinBoot.state.quickSlots) ||
      cabinBoot.state.quickSlots.length !== 8 ||
      cabinBoot.state.landmarkLabels < 20 ||
      cabinBoot.slotKeys !== 8 ||
      !cabinBoot.handText.includes('手持 木墙') ||
      !cabinBoot.introText.includes('林间小屋') ||
      !cabinBoot.introText.includes('第一夜剧本') ||
      !cabinBoot.introText.includes('制石斧再砍树') ||
      !cabinBoot.introText.includes('开始游戏') ||
      !cabinBoot.minimapText.includes(cabinBoot.state.guideTitle)
    ) {
      throw new Error(`Cabin camp event, hotbar, or world label state is missing at boot: ${JSON.stringify(cabinBoot)}`);
    }

    const cabinIntroScreenshot = await captureAndCheck(
      cdp,
      { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false },
      'cabin-intro-1280x720',
    );

    const cabinStarted = await evaluate(cdp, `window.__cabinBuilderDebug.start()`);
    if (
      cabinStarted.introVisible ||
      cabinStarted.mapFocusMode ||
      cabinStarted.minimapMarkers < 4 ||
      cabinStarted.guideTrailDots < 3 ||
      cabinStarted.blueprintGhosts < 5 ||
      !cabinStarted.eventBeaconVisible ||
      !cabinStarted.reticleVisible ||
      !cabinStarted.reticlePrompt ||
      cabinStarted.actionRingCharge < 1 ||
      !cabinStarted.shelterAuraVisible ||
      cabinStarted.shelterAuraRings < 3 ||
      !cabinStarted.shelterAuraTone ||
      !cabinStarted.handRigVisible ||
      cabinStarted.handRigParts < 6 ||
      !cabinStarted.handRigTool ||
      !cabinStarted.focusText.includes('下一步') ||
      !cabinStarted.focusText.includes(cabinStarted.focusTitle) ||
      !cabinStarted.focusRoute.includes(`${cabinStarted.guideDistance}m`) ||
      cabinStarted.introWorldLabelsHidden ||
      cabinStarted.introBeaconHidden ||
      cabinStarted.introBlueprintHidden
    ) {
      throw new Error(`Cabin start overlay did not hide cleanly or navigation state is missing: ${JSON.stringify(cabinStarted)}`);
    }

    for (let i = 0; i < 6; i += 1) await keyTap(cdp, 'a');
    for (let i = 0; i < 5; i += 1) await keyTap(cdp, 'w');
    const beforeNearbyInteract = await evaluate(cdp, `window.__cabinBuilderDebug.state()`);
    if (
      !beforeNearbyInteract.nearbyAction.includes('E') ||
      !beforeNearbyInteract.nearbyAction.includes('石堆') ||
      beforeNearbyInteract.nearbyActionDistance < 0 ||
      beforeNearbyInteract.nearbyActionDistance > 2.35 ||
      !beforeNearbyInteract.reticlePrompt.includes('石堆') ||
      !beforeNearbyInteract.nearbyMarkerVisible ||
      beforeNearbyInteract.nearbyTargetTitle !== '石堆'
    ) {
      throw new Error(`Cabin reticle did not acquire the nearby resource target: ${JSON.stringify(beforeNearbyInteract)}`);
    }
    await keyTap(cdp, 'e');
    const afterNearbyInteract = await evaluate(cdp, `window.__cabinBuilderDebug.state()`);
    const cabinHandAfterInteract = await evaluate(cdp, `document.querySelector('.cabin-hand')?.textContent || ''`);
    if (
      afterNearbyInteract.harvested.stone <= beforeNearbyInteract.harvested.stone ||
      afterNearbyInteract.resources.stone <= beforeNearbyInteract.resources.stone ||
      afterNearbyInteract.nearbyInteractions <= beforeNearbyInteract.nearbyInteractions ||
      !afterNearbyInteract.lastNearbyAction.includes('石堆') ||
      !afterNearbyInteract.lastNearbyAction.includes('E') ||
      afterNearbyInteract.harvestPopupCount < 1 ||
      !afterNearbyInteract.lastHarvestPopup.includes('石堆') ||
      !afterNearbyInteract.toolSwingVisible ||
      afterNearbyInteract.toolSwingCount <= beforeNearbyInteract.toolSwingCount ||
      !afterNearbyInteract.lastToolSwing.includes('石堆') ||
      !afterNearbyInteract.handRigVisible ||
      !afterNearbyInteract.handRigMotion.includes('石堆') ||
      afterNearbyInteract.handRigParts < 6 ||
      !afterNearbyInteract.nearbyAction.includes('石堆') ||
      !cabinHandAfterInteract.includes(afterNearbyInteract.handRigTool) ||
      !cabinHandAfterInteract.includes(afterNearbyInteract.lastNearbyAction)
    ) {
      throw new Error(`Cabin E key did not harvest the nearby resource: ${JSON.stringify({ beforeNearbyInteract, afterNearbyInteract, cabinHandAfterInteract })}`);
    }

    const focusClick = await evaluate(
      cdp,
      `(() => {
        const before = window.__cabinBuilderDebug.state();
        document.querySelector('[data-cabin-focus-action]')?.click();
        const after = window.__cabinBuilderDebug.state();
        return { before, after, domText: document.querySelector('.cabin-focus')?.textContent || '' };
      })()`,
    );
    if (
      focusClick.after.commandActions <= focusClick.before.commandActions ||
      focusClick.after.smartActions < focusClick.before.smartActions ||
      !focusClick.after.focusText.includes('下一步') ||
      !focusClick.domText.includes(focusClick.after.focusTitle)
    ) {
      throw new Error(`Cabin focus action did not execute the recommended command: ${JSON.stringify(focusClick)}`);
    }

    const beforeAutoSurvive = focusClick.after;
    const afterAutoSurvive = await evaluate(cdp, `window.__cabinBuilderDebug.autoSurvive(90)`);
    if (
      afterAutoSurvive.smartActions < beforeAutoSurvive.smartActions + 70 ||
      afterAutoSurvive.blocks < 10 ||
      afterAutoSurvive.goalsCompleted < 30 ||
      afterAutoSurvive.nextGoal !== 'freeplay' ||
      !afterAutoSurvive.crafted.axe ||
      !afterAutoSurvive.crafted.campfire ||
      !afterAutoSurvive.crafted.bow ||
      !afterAutoSurvive.crafted.pickaxe ||
      !afterAutoSurvive.crafted.armor ||
      afterAutoSurvive.harvested.deer + afterAutoSurvive.harvested.boar + afterAutoSurvive.harvested.wolf < 1 ||
      afterAutoSurvive.acquired.cookedMeat < 1 ||
      afterAutoSurvive.acquired.iron < 1 ||
      afterAutoSurvive.placedCounts.furnace < 1 ||
      afterAutoSurvive.placedCounts.chest < 1 ||
      afterAutoSurvive.placedCounts.bed < 1 ||
      !afterAutoSurvive.mapRevealed ||
      afterAutoSurvive.mapChecks < 1 ||
      afterAutoSurvive.sleptNights < 1 ||
      afterAutoSurvive.coldSnapsManaged < 1 ||
      !afterAutoSurvive.safeNightSecured ||
      afterAutoSurvive.campScore < 86 ||
      !afterAutoSurvive.projects.rainBarrel ||
      !afterAutoSurvive.projects.trapline ||
      !afterAutoSurvive.projects.watchPost ||
      !afterAutoSurvive.stewardMode ||
      afterAutoSurvive.stewardActions < 3 ||
      afterAutoSurvive.blueprintActions < 4 ||
      afterAutoSurvive.blueprintPieces < 8 ||
      afterAutoSurvive.blueprintStage !== 'freeform' ||
      afterAutoSurvive.blueprintGhosts < 1 ||
      afterAutoSurvive.packReady < 1 ||
      afterAutoSurvive.autosaves < cabinBoot.state.autosaves + 1 ||
      afterAutoSurvive.saveBlocks < 8 ||
      afterAutoSurvive.introVisible ||
      afterAutoSurvive.minimapMarkers < 8 ||
      !afterAutoSurvive.guideTitle ||
      afterAutoSurvive.guideDistance < 1 ||
      afterAutoSurvive.guideTrailDots < 3 ||
      afterAutoSurvive.fireflyCount < 20 ||
      !afterAutoSurvive.nearbyHint ||
      !afterAutoSurvive.nearbyAction ||
      typeof afterAutoSurvive.nearbyActionDistance !== 'number' ||
      typeof afterAutoSurvive.nearbyMarkerVisible !== 'boolean' ||
      !afterAutoSurvive.nearbyTargetTitle ||
      typeof afterAutoSurvive.nearbyInteractions !== 'number' ||
      !afterAutoSurvive.lastNearbyAction ||
      typeof afterAutoSurvive.harvestPopupCount !== 'number' ||
      !afterAutoSurvive.lastHarvestPopup ||
      typeof afterAutoSurvive.toolSwingVisible !== 'boolean' ||
      typeof afterAutoSurvive.toolSwingCount !== 'number' ||
      !afterAutoSurvive.lastToolSwing ||
      !afterAutoSurvive.handRigVisible ||
      !afterAutoSurvive.handRigTool ||
      afterAutoSurvive.handRigParts < 6 ||
      !afterAutoSurvive.shelterAuraVisible ||
      !afterAutoSurvive.shelterAuraTone ||
      afterAutoSurvive.shelterAuraRings < 3 ||
      typeof afterAutoSurvive.wolfTrailVisible !== 'boolean' ||
      typeof afterAutoSurvive.wolfTrailPrints !== 'number' ||
      !afterAutoSurvive.survivalVignette ||
      !afterAutoSurvive.focusTitle ||
      !afterAutoSurvive.focusDetail ||
      !afterAutoSurvive.focusRisk ||
      !afterAutoSurvive.focusRoute.includes(`${afterAutoSurvive.guideDistance}m`) ||
      !afterAutoSurvive.focusText.includes('下一步') ||
      !afterAutoSurvive.focusText.includes(afterAutoSurvive.focusTitle) ||
      !afterAutoSurvive.heldPreview ||
      afterAutoSurvive.quickSlots.length !== 8 ||
      afterAutoSurvive.landmarkLabels < 20 ||
      afterAutoSurvive.eventActions < 4 ||
      afterAutoSurvive.eventHistory.length < 4 ||
      !afterAutoSurvive.eventBeaconVisible ||
      !afterAutoSurvive.safetyPlan.includes('下步') ||
      !afterAutoSurvive.commandMode ||
      afterAutoSurvive.commandCards.length !== 4 ||
      !afterAutoSurvive.commandCards.some((item) => item.recommended) ||
      !afterAutoSurvive.commandCards.some((item) => item.kind === 'routine') ||
      !afterAutoSurvive.commandRisk ||
      !afterAutoSurvive.shelter ||
      !afterAutoSurvive.shelterGrade ||
      !afterAutoSurvive.shelterPlan ||
      !afterAutoSurvive.shelterFocus ||
      typeof afterAutoSurvive.shelterFixes !== 'number' ||
      afterAutoSurvive.shelter.warmth < 35 ||
      afterAutoSurvive.shelter.morale < 35 ||
      !afterAutoSurvive.routineMode ||
      !afterAutoSurvive.routinePlan ||
      afterAutoSurvive.expeditions.forest < 1 ||
      afterAutoSurvive.expeditions.mine < 1 ||
      afterAutoSurvive.expeditions.hunt < 1 ||
      afterAutoSurvive.securityScore < 120 ||
      !afterAutoSurvive.goalIdsDone.includes('forage') ||
      !afterAutoSurvive.goalIdsDone.includes('stone-axe') ||
      !afterAutoSurvive.goalIdsDone.includes('campfire') ||
      !afterAutoSurvive.goalIdsDone.includes('safe-night') ||
      !afterAutoSurvive.goalIdsDone.includes('wood-bow') ||
      !afterAutoSurvive.goalIdsDone.includes('iron-ingot') ||
      !afterAutoSurvive.goalIdsDone.includes('bed') ||
      !afterAutoSurvive.goalIdsDone.includes('map-scout') ||
      !afterAutoSurvive.goalIdsDone.includes('cold-snap') ||
      !afterAutoSurvive.goalIdsDone.includes('sleep-night') ||
      !afterAutoSurvive.goalIdsDone.includes('comfort-camp') ||
      !afterAutoSurvive.goalIdsDone.includes('rain-barrel') ||
      !afterAutoSurvive.goalIdsDone.includes('trapline') ||
      !afterAutoSurvive.goalIdsDone.includes('watch-post') ||
      !afterAutoSurvive.goalIdsDone.includes('steward') ||
      !afterAutoSurvive.goalIdsDone.includes('forest-expedition') ||
      !afterAutoSurvive.goalIdsDone.includes('mine-expedition') ||
      !afterAutoSurvive.goalIdsDone.includes('hunt-expedition') ||
      !afterAutoSurvive.goalIdsDone.includes('secure-loop') ||
      afterAutoSurvive.stats.health < 70 ||
      afterAutoSurvive.stats.cold > 45
    ) {
      throw new Error(`Cabin one-button survival loop failed: ${JSON.stringify({ beforeAutoSurvive, afterAutoSurvive })}`);
    }

    const cabinCommandState = await evaluate(cdp, `window.__cabinBuilderDebug.command('guard')`);
    if (
      cabinCommandState.commandActions <= afterAutoSurvive.commandActions ||
      cabinCommandState.commandHistory.length < 1 ||
      !cabinCommandState.lastCommandPlan.includes('守夜调度') ||
      cabinCommandState.commandCards.length !== 4 ||
      !cabinCommandState.commandCards.some((item) => item.recommended) ||
      !cabinCommandState.commandRisk
    ) {
      throw new Error(`Cabin command card did not execute as a real one-click command: ${JSON.stringify({ afterAutoSurvive, cabinCommandState })}`);
    }

    const cabinRoutineState = await evaluate(cdp, `window.__cabinBuilderDebug.command('routine')`);
    if (
      cabinRoutineState.commandActions <= cabinCommandState.commandActions ||
      cabinRoutineState.routineActions <= cabinCommandState.routineActions ||
      cabinRoutineState.routineHistory.length < 1 ||
      !cabinRoutineState.routinePlan.includes('日程总管') ||
      !cabinRoutineState.lastCommandPlan.includes('日程总管') ||
      cabinRoutineState.shelter.noise > cabinCommandState.shelter.noise ||
      cabinRoutineState.shelter.morale < cabinCommandState.shelter.morale ||
      cabinRoutineState.shelterFixes <= cabinCommandState.shelterFixes ||
      cabinRoutineState.commandCards.length !== 4 ||
      !cabinRoutineState.commandCards.some((item) => item.kind === 'routine')
    ) {
      throw new Error(`Cabin daily routine card did not execute real actions: ${JSON.stringify({ cabinCommandState, cabinRoutineState })}`);
    }

    const cabinMapState = await evaluate(cdp, `window.__cabinBuilderDebug.toggleMap(true)`);
    if (!cabinMapState.mapFocusMode || !cabinMapState.mapRevealed || cabinMapState.minimapMarkers < afterAutoSurvive.minimapMarkers) {
      throw new Error(`Cabin minimap focus mode did not reveal the route layer: ${JSON.stringify({ afterAutoSurvive, cabinMapState })}`);
    }

    const beforeAutopilot = await evaluate(cdp, `window.__cabinBuilderDebug.state()`);
    const autopilotEnabled = await evaluate(cdp, `window.__cabinBuilderDebug.toggleAutopilot(true)`);
    await sleep(1_650);
    const afterAutopilot = await evaluate(cdp, `window.__cabinBuilderDebug.state()`);
    if (
      !autopilotEnabled.autopilotMode ||
      !afterAutopilot.autopilotMode ||
      afterAutopilot.autopilotActions <= beforeAutopilot.autopilotActions ||
      afterAutopilot.smartActions <= beforeAutopilot.smartActions
    ) {
      throw new Error(`Cabin autopilot did not advance the survival loop: ${JSON.stringify({ beforeAutopilot, autopilotEnabled, afterAutopilot })}`);
    }

    const forcedWolfEvent = await evaluate(cdp, `window.__cabinBuilderDebug.forceEvent('wolfTracks')`);
    if (
      forcedWolfEvent.activeEvent !== 'wolfTracks' ||
      forcedWolfEvent.eventTitle !== '狼踪逼近' ||
      forcedWolfEvent.eventActions <= afterAutopilot.eventActions ||
      !forcedWolfEvent.eventHistory.includes('狼踪逼近') ||
      !forcedWolfEvent.eventBeaconVisible ||
      !forcedWolfEvent.wolfTrailVisible ||
      forcedWolfEvent.wolfTrailPrints < 8 ||
      forcedWolfEvent.shelter.noise < afterAutopilot.shelter.noise ||
      forcedWolfEvent.shelter.morale > afterAutopilot.shelter.morale
    ) {
      throw new Error(`Cabin forced camp event did not apply: ${JSON.stringify({ afterAutopilot, forcedWolfEvent })}`);
    }

    const beforeEat = await evaluate(cdp, `window.__cabinBuilderDebug.state()`);
    const afterEat = await evaluate(cdp, `window.__cabinBuilderDebug.eatBerry()`);
    if (
      beforeEat.stats.hunger < 100 &&
      (afterEat.resources.berry !== beforeEat.resources.berry - 1 || afterEat.stats.hunger < beforeEat.stats.hunger)
    ) {
      throw new Error(`Cabin berry eating failed: ${JSON.stringify({ beforeEat, afterEat })}`);
    }

    const beforePack = await evaluate(cdp, `window.__cabinBuilderDebug.state()`);
    const afterPack = await evaluate(cdp, `window.__cabinBuilderDebug.packCraft()`);
    if (
      !afterPack.packOpen ||
      afterPack.packActions < beforePack.packActions + 1 ||
      afterPack.packPrepared < beforePack.packPrepared + 1 ||
      afterPack.provisions <= beforePack.provisions ||
      afterPack.packReady > beforePack.packReady
    ) {
      throw new Error(`Cabin backpack crafting did not consume resources and increase provisions: ${JSON.stringify({ beforePack, afterPack })}`);
    }

    const cabinPackScreenshot = await captureAndCheck(
      cdp,
      { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false },
      'cabin-pack-1280x720',
    );
    await evaluate(cdp, `(() => {
      window.__cabinBuilderDebug.togglePack(false);
      window.__cabinBuilderDebug.toggleMap(false);
      return window.__cabinBuilderDebug.state();
    })()`);

    const cabinScreenshot = await captureAndCheck(
      cdp,
      { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false },
      'cabin-1280x720',
    );

    const coldSnapState = await evaluate(cdp, `window.__cabinBuilderDebug.forceColdSnap()`);
    if (
      coldSnapState.weather !== 'coldSnap' ||
      coldSnapState.stats.cold > 60 ||
      coldSnapState.coldSnapsManaged < 1 ||
      !coldSnapState.mapRevealed ||
      coldSnapState.campScore < 86 ||
      coldSnapState.securityScore < 120 ||
      !coldSnapState.shelterGrade ||
      !coldSnapState.shelterPlan ||
      !coldSnapState.shelterFocus ||
      typeof coldSnapState.shelterFixes !== 'number' ||
      typeof coldSnapState.shelter.dryness !== 'number' ||
      typeof coldSnapState.shelter.warmth !== 'number' ||
      coldSnapState.shelterAuraTone !== '寒冷' ||
      !coldSnapState.survivalVignette ||
      !coldSnapState.safetyPlan.includes(coldSnapState.shelterGrade)
    ) {
      throw new Error(`Cabin cold-snap weather visual state failed: ${JSON.stringify(coldSnapState)}`);
    }
    const cabinColdScreenshot = await captureAndCheck(
      cdp,
      { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false },
      'cabin-cold-1280x720',
    );

    await keyTap(cdp, 'w');
    const afterMove = await evaluate(cdp, `window.__cabinBuilderDebug.state()`);
    if (!(afterMove.target.z < coldSnapState.target.z)) {
      throw new Error(`Cabin survivor target did not respond to keyboard movement: ${JSON.stringify({ coldSnapState, afterMove })}`);
    }

    const cabinMobileScreenshot = await captureAndCheck(
      cdp,
      { width: 844, height: 390, deviceScaleFactor: 2, mobile: true },
      'cabin-844x390',
    );
    const cabinMobileLayout = await evaluate(
      cdp,
      `(() => {
        const rect = document.querySelector('canvas')?.getBoundingClientRect();
        const hud = document.querySelector('.cabin-hud')?.getBoundingClientRect();
        const actions = document.querySelector('.cabin-actions')?.getBoundingClientRect();
        const hotbar = document.querySelector('.cabin-inventory')?.getBoundingClientRect();
        return {
          innerWidth,
          innerHeight,
          left: rect?.left || 0,
          right: rect?.right || 0,
          top: rect?.top || 0,
          bottom: rect?.bottom || 0,
          width: rect?.width || 0,
          height: rect?.height || 0,
          hudBottom: hud?.bottom || 0,
          actionsBottom: actions?.bottom || 0,
          hotbarTop: hotbar?.top || innerHeight,
        };
      })()`,
    );
    if (
      cabinMobileLayout.width < 250 ||
      cabinMobileLayout.height < 140 ||
      cabinMobileLayout.left < -1 ||
      cabinMobileLayout.right > cabinMobileLayout.innerWidth + 1 ||
      cabinMobileLayout.top < -1 ||
      cabinMobileLayout.bottom > cabinMobileLayout.innerHeight + 1 ||
      cabinMobileLayout.hudBottom > cabinMobileLayout.hotbarTop - 8 ||
      cabinMobileLayout.actionsBottom > cabinMobileLayout.hotbarTop - 8
    ) {
      throw new Error(`Cabin mobile canvas layout looks wrong: ${JSON.stringify(cabinMobileLayout)}`);
    }

    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.send('Page.navigate', { url: `${appUrl}/?game=voxel` });
    await sleep(1_500);

    const voxelBoot = await evaluate(
      cdp,
      `(() => {
        const canvas = document.querySelector('canvas');
        const state = window.__voxelForgeDebug?.state();
        return {
          hasCanvas: Boolean(canvas),
          width: canvas?.width || 0,
          height: canvas?.height || 0,
          workCards: document.querySelectorAll('.voxel-card').length,
          readyWorkCards: document.querySelectorAll('.voxel-card.ready').length,
          surveyRows: document.querySelectorAll('.voxel-survey div').length,
          commandText: document.querySelector('.voxel-command')?.textContent || '',
          state,
        };
      })()`,
    );
    if (!voxelBoot.hasCanvas || voxelBoot.width < 640 || voxelBoot.height < 360 || voxelBoot.state?.mode !== 'voxel') {
      throw new Error(`Voxel forge did not boot correctly: ${JSON.stringify(voxelBoot)}`);
    }
    if (!voxelBoot.state.resources || !voxelBoot.state.mined || !Array.isArray(voxelBoot.state.goalIdsDone)) {
      throw new Error(`Voxel forge state is missing resources, mined, or goals: ${JSON.stringify(voxelBoot.state)}`);
    }
    if (
      !voxelBoot.state.scanMode ||
      !voxelBoot.state.buildPlanMode ||
      voxelBoot.state.buildPlanStage !== 'bridge' ||
      voxelBoot.state.planGhosts < 6 ||
      voxelBoot.state.logisticsLinks !== 0 ||
      voxelBoot.state.powerGrid !== 0 ||
      !voxelBoot.state.lastBuildPlan.includes('跨隙') ||
      !voxelBoot.state.activeVein ||
      !voxelBoot.state.veinTitle ||
      voxelBoot.state.veinMarkers < 3 ||
      voxelBoot.state.activeRaidEvent !== 'quiet' ||
      !voxelBoot.state.raidEventTitle
    ) {
      throw new Error(`Voxel forge scan or raid event state is missing at boot: ${JSON.stringify(voxelBoot.state)}`);
    }
    if (
      !voxelBoot.state.workOrderMode ||
      voxelBoot.state.workOrderActions !== 0 ||
      !Array.isArray(voxelBoot.state.workOrderCards) ||
      voxelBoot.state.workOrderCards.length !== 3 ||
      voxelBoot.state.excavationMarkers < 1 ||
      !Array.isArray(voxelBoot.state.excavationHints) ||
      voxelBoot.state.excavationHints.length < 1 ||
      voxelBoot.state.blockedPlanNodes < 1 ||
      !voxelBoot.state.materialShortage ||
      voxelBoot.workCards !== 3 ||
      voxelBoot.readyWorkCards < 1 ||
      voxelBoot.surveyRows < 1 ||
      !voxelBoot.commandText.includes('工序指挥')
    ) {
      throw new Error(`Voxel forge work-order layer is missing at boot: ${JSON.stringify(voxelBoot)}`);
    }

    const beforeVoxelRun = await evaluate(cdp, `window.__voxelForgeDebug.state()`);
    const afterVoxelRun = await evaluate(cdp, `window.__voxelForgeDebug.blueprint(64)`);
    if (
      afterVoxelRun.voxels >= beforeVoxelRun.voxels ||
      afterVoxelRun.goalsCompleted < 11 ||
      afterVoxelRun.nextGoal !== 'freeplay' ||
      afterVoxelRun.resources.alloy < 0 ||
      !afterVoxelRun.blueprintMode ||
      afterVoxelRun.blueprintActions < beforeVoxelRun.blueprintActions + 48 ||
      !afterVoxelRun.buildPlanMode ||
      afterVoxelRun.buildPlanStage !== 'freeform' ||
      afterVoxelRun.planGhosts < 1 ||
      afterVoxelRun.logisticsLinks < 4 ||
      afterVoxelRun.powerGrid < 60 ||
      !afterVoxelRun.lastBuildPlan.includes('自由') ||
      !afterVoxelRun.workOrderMode ||
      afterVoxelRun.workOrderActions < beforeVoxelRun.workOrderActions + 8 ||
      afterVoxelRun.workOrderHistory.length < 3 ||
      !afterVoxelRun.lastWorkOrderPlan ||
      afterVoxelRun.workOrderCards.length !== 3 ||
      afterVoxelRun.excavationMarkers < 1 ||
      !afterVoxelRun.excavationFocus ||
      !afterVoxelRun.materialShortage ||
      afterVoxelRun.scanActions < beforeVoxelRun.scanActions + 3 ||
      afterVoxelRun.veinMarkers < 1 ||
      afterVoxelRun.veinBonus.data < 3 ||
      afterVoxelRun.built.bridge < 2 ||
      afterVoxelRun.built.turret < 1 ||
      afterVoxelRun.built.drill < 1 ||
      afterVoxelRun.built.reactor < 1 ||
      afterVoxelRun.techCount < 3 ||
      afterVoxelRun.workshopScore <= afterVoxelRun.threatScore ||
      afterVoxelRun.raid < 3 ||
      afterVoxelRun.raidEventActions < 3 ||
      afterVoxelRun.raidEventHistory.length < 3 ||
      !afterVoxelRun.raidEventHistory.includes('晶尘风暴') ||
      afterVoxelRun.coreHp < 70 ||
      !afterVoxelRun.goalIdsDone.includes('drill') ||
      !afterVoxelRun.goalIdsDone.includes('reactor') ||
      !afterVoxelRun.goalIdsDone.includes('research') ||
      !afterVoxelRun.goalIdsDone.includes('raid-3')
    ) {
      throw new Error(`Voxel forge blueprint loop failed: ${JSON.stringify({ beforeVoxelRun, afterVoxelRun })}`);
    }

    const forcedVoxelWork = await evaluate(cdp, `window.__voxelForgeDebug.workOrder('mine')`);
    if (
      forcedVoxelWork.workOrderActions <= afterVoxelRun.workOrderActions ||
      forcedVoxelWork.workOrderHistory.length < afterVoxelRun.workOrderHistory.length ||
      forcedVoxelWork.workOrderCards.length !== 3 ||
      forcedVoxelWork.excavationMarkers < 1 ||
      !forcedVoxelWork.excavationFocus ||
      !forcedVoxelWork.materialShortage
    ) {
      throw new Error(`Voxel forge work order did not execute as a real one-click command: ${JSON.stringify({ afterVoxelRun, forcedVoxelWork })}`);
    }

    const voxelScreenshot = await captureAndCheck(
      cdp,
      { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false },
      'voxel-1280x720',
    );

    await keyTap(cdp, 'w');
    const afterVoxelMove = await evaluate(cdp, `window.__voxelForgeDebug.state()`);
    if (!(afterVoxelMove.target.z < afterVoxelRun.target.z)) {
      throw new Error(`Voxel target did not respond to keyboard movement: ${JSON.stringify({ afterVoxelRun, afterVoxelMove })}`);
    }

    const voxelMobileScreenshot = await captureAndCheck(
      cdp,
      { width: 844, height: 390, deviceScaleFactor: 2, mobile: true },
      'voxel-844x390',
    );
    const voxelMobileLayout = await evaluate(
      cdp,
      `(() => {
        const rect = document.querySelector('canvas')?.getBoundingClientRect();
        return {
          innerWidth,
          innerHeight,
          left: rect?.left || 0,
          right: rect?.right || 0,
          top: rect?.top || 0,
          bottom: rect?.bottom || 0,
          width: rect?.width || 0,
          height: rect?.height || 0,
        };
      })()`,
    );
    if (
      voxelMobileLayout.width < 250 ||
      voxelMobileLayout.height < 140 ||
      voxelMobileLayout.left < -1 ||
      voxelMobileLayout.right > voxelMobileLayout.innerWidth + 1 ||
      voxelMobileLayout.top < -1 ||
      voxelMobileLayout.bottom > voxelMobileLayout.innerHeight + 1
    ) {
      throw new Error(`Voxel mobile canvas layout looks wrong: ${JSON.stringify(voxelMobileLayout)}`);
    }

    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.send('Page.navigate', { url: `${appUrl}/?game=orbit` });
    await sleep(1_500);

    const orbitBoot = await evaluate(
      cdp,
      `(() => {
        const canvas = document.querySelector('canvas');
        const state = window.__orbitDefenseDebug?.state();
        return {
          hasCanvas: Boolean(canvas),
          width: canvas?.width || 0,
          height: canvas?.height || 0,
          state,
        };
      })()`,
    );
    if (!orbitBoot.hasCanvas || orbitBoot.width < 640 || orbitBoot.height < 360 || orbitBoot.state?.mode !== 'orbit') {
      throw new Error(`Orbital defense did not boot correctly: ${JSON.stringify(orbitBoot)}`);
    }
    if (!orbitBoot.state.resources || !orbitBoot.state.byKind || !Array.isArray(orbitBoot.state.goalIdsDone)) {
      throw new Error(`Orbital defense state is missing resources, satellites, or goals: ${JSON.stringify(orbitBoot.state)}`);
    }
    if (
      !orbitBoot.state.formationMode ||
      orbitBoot.state.activeFormation !== 'intercept' ||
      !orbitBoot.state.formationTitle ||
      !Array.isArray(orbitBoot.state.formationHistory) ||
      orbitBoot.state.activeOrbitEvent !== 'calm' ||
      !orbitBoot.state.orbitEventTitle ||
      orbitBoot.state.orbitEventMarkers < 2
    ) {
      throw new Error(`Orbital defense formation or event state missing at boot: ${JSON.stringify(orbitBoot.state)}`);
    }
    if (
      !orbitBoot.state.commandMode ||
      !Array.isArray(orbitBoot.state.commandCards) ||
      orbitBoot.state.commandCards.length !== 3 ||
      !orbitBoot.state.orbitPressure ||
      orbitBoot.state.pressureMarkers < 3 ||
      !orbitBoot.state.nextOrbitEventTitle ||
      orbitBoot.state.projectedThreat <= 0 ||
      orbitBoot.state.projectedDefense <= 0
    ) {
      throw new Error(`Orbital defense command layer missing at boot: ${JSON.stringify(orbitBoot.state)}`);
    }
    const orbitCommandDom = await evaluate(
      cdp,
      `(() => ({
        cards: document.querySelectorAll('.orbit-card').length,
        recommended: document.querySelectorAll('.orbit-card.recommended').length,
        threats: document.querySelectorAll('.orbit-threat div').length,
      }))()`,
    );
    if (orbitCommandDom.cards !== 3 || orbitCommandDom.recommended < 1 || orbitCommandDom.threats < 3) {
      throw new Error(`Orbital defense command DOM missing: ${JSON.stringify(orbitCommandDom)}`);
    }

    const beforeOrbit = await evaluate(cdp, `window.__orbitDefenseDebug.state()`);
    const afterOrbit = await evaluate(cdp, `window.__orbitDefenseDebug.autoRun(12)`);
    if (
      afterOrbit.satellites < 4 ||
      afterOrbit.byKind.laser < 2 ||
      afterOrbit.byKind.shield < 1 ||
      afterOrbit.byKind.collector < 1 ||
      afterOrbit.highestLevel < 2 ||
      afterOrbit.wave < 3 ||
      afterOrbit.kills < 10 ||
      afterOrbit.coreHp < 70 ||
      afterOrbit.protocolCount < 3 ||
      afterOrbit.autoProtocolPicks < 3 ||
      afterOrbit.formationActions < 3 ||
      afterOrbit.formationHistory.length < 3 ||
      !afterOrbit.formationTitle ||
      afterOrbit.orbitEventActions < 3 ||
      afterOrbit.orbitEventHistory.length < 3 ||
      !afterOrbit.orbitEventHistory.includes('掠夺者突袭') ||
      afterOrbit.orbitEventMarkers < 4 ||
      !afterOrbit.combatLog.includes('威胁') ||
      !afterOrbit.combatLog.includes('热点') ||
      !afterOrbit.combatLog.includes(afterOrbit.formationTitle) ||
      !afterOrbit.combatLog.includes(afterOrbit.orbitEventTitle) ||
      afterOrbit.goalsCompleted < 8 ||
      afterOrbit.nextGoal !== 'freeplay' ||
      afterOrbit.commandActions < 3 ||
      afterOrbit.commandSavedClicks < 6 ||
      afterOrbit.commandHistory.length < 3 ||
      !afterOrbit.lastCommandPlan ||
      !afterOrbit.pressureTitle ||
      typeof afterOrbit.pressureScore !== 'number' ||
      !afterOrbit.riskGrade ||
      afterOrbit.pressureMarkers < 3 ||
      afterOrbit.tacticActions < beforeOrbit.tacticActions + 8
    ) {
      throw new Error(`Orbital defense automation loop failed: ${JSON.stringify({ beforeOrbit, afterOrbit })}`);
    }

    const orbitScreenshot = await captureAndCheck(
      cdp,
      { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false },
      'orbit-1280x720',
    );

    await keyTap(cdp, 'w');
    const afterOrbitMove = await evaluate(cdp, `window.__orbitDefenseDebug.state()`);
    if (!(afterOrbitMove.target.z < afterOrbit.target.z)) {
      throw new Error(`Orbit target did not respond to keyboard movement: ${JSON.stringify({ afterOrbit, afterOrbitMove })}`);
    }

    const orbitMobileScreenshot = await captureAndCheck(
      cdp,
      { width: 844, height: 390, deviceScaleFactor: 2, mobile: true },
      'orbit-844x390',
    );
    const orbitMobileLayout = await evaluate(
      cdp,
      `(() => {
        const rect = document.querySelector('canvas')?.getBoundingClientRect();
        return {
          innerWidth,
          innerHeight,
          left: rect?.left || 0,
          right: rect?.right || 0,
          top: rect?.top || 0,
          bottom: rect?.bottom || 0,
          width: rect?.width || 0,
          height: rect?.height || 0,
        };
      })()`,
    );
    if (
      orbitMobileLayout.width < 250 ||
      orbitMobileLayout.height < 140 ||
      orbitMobileLayout.left < -1 ||
      orbitMobileLayout.right > orbitMobileLayout.innerWidth + 1 ||
      orbitMobileLayout.top < -1 ||
      orbitMobileLayout.bottom > orbitMobileLayout.innerHeight + 1
    ) {
      throw new Error(`Orbit mobile canvas layout looks wrong: ${JSON.stringify(orbitMobileLayout)}`);
    }

    console.log(
      `[verify] ok ${appUrl} tower=${resolvedState.mode}/wave${resolvedState.wave}/plants${resolvedState.plants}/garden${resolvedState.gardenerPlacements}/campaign${afterCruise.campaignActions}-${afterCruise.campaignSavedClicks}-${afterCruise.waveDecisionUsed}/${afterCruise.waveDecisionBudget}/touch${afterCruise.operationLoad}-${afterCruise.directorLoopActions}/ratio${afterCruise.balanceRatio}-${afterCruise.targetRatioLow}-${afterCruise.targetRatioHigh}/band${afterCruise.targetRatioBand}/clamp${afterCruise.balanceClamp}/pressure${afterCruise.balancePressureMultiplier}/lock${afterCruise.balanceSunLocked}/command${afterCruise.commandActions}/queue${afterCruise.queueActions}-${afterCruise.queueSavedClicks}-${afterCruise.balanceVerdict}/ops${afterCruise.opsDeckActions}-${afterCruise.laneFocus}${afterCruise.routePressure}-${afterCruise.rhythm}/intent${afterCruise.intentActions}-${afterCruise.activeIntent}-${afterCruise.intentSavings}/build${afterCruise.buildFocusTitle}-${afterCruise.buildFocusScore}/contract${afterCruise.contractCompleted}-${afterCruise.contractRewards}-${afterCruise.contractTitle}/review${afterCruise.combatFeed.length}-${afterCruise.mvpPlant}-${afterCruise.visiblePlantBadges}/tempo${afterCruise.tempoChanges}-${afterCruise.lastTempoPlan}/balance${afterCruise.balanceAdjustments}-${afterCruise.balanceLastAdjustment}/director${afterCruise.directorFieldOrders}-${afterCruise.directorLastOrder}/intensity${afterCruise.adaptiveIntensity}/blueprint${afterCruise.wavePlanTitle}-${afterCruise.wavePlanKind}/ledger${afterCruise.fairnessDebt}-${afterCruise.mercyBank}/plan${afterCruise.planActions}/saved${afterCruise.savedClicks}/grade${afterCruise.waveGrade}/event${afterCruise.battleEventTriggers}-${afterCruise.battleEventTitle}/strategy${resolvedState.autoStrategyPicks}/cruiseWave${afterCruise.wave}/cruiseActions${afterCruise.cruiseActions} cabinBlocks=${afterAutoSurvive.blocks}/goals${afterAutoSurvive.goalsCompleted}/smart${afterAutoSurvive.smartActions}/focus${afterAutoSurvive.focusTitle}-${afterAutoSurvive.focusRisk}-${afterAutoSurvive.focusRoute}/camp${afterAutoSurvive.campScore}/security${afterAutoSurvive.securityScore}/shelter${afterAutoSurvive.shelterGrade}-${afterAutoSurvive.shelter.dryness}-${afterAutoSurvive.shelter.warmth}-${afterAutoSurvive.shelter.noise}-${afterAutoSurvive.shelter.morale}-${afterAutoSurvive.shelterFixes}/blueprint${afterAutoSurvive.blueprintPieces}-${afterAutoSurvive.blueprintStage}/pack${afterPack.packPrepared}-${afterPack.provisions}/event${forcedWolfEvent.eventActions}-${forcedWolfEvent.eventTitle}/guide${afterAutoSurvive.guideTitle}-${afterAutoSurvive.guideDistance}/map${cabinMapState.minimapMarkers}-${cabinMapState.mapFocusMode}/fireflies${afterAutoSurvive.fireflyCount}/hotbar${afterAutoSurvive.quickSlots.length}/labels${afterAutoSurvive.landmarkLabels}/command${cabinCommandState.commandActions}-${cabinCommandState.commandRisk}/routine${cabinRoutineState.routineActions}-${cabinRoutineState.routineHistory.length}-${cabinRoutineState.shelterFixes}/autopilot${afterAutopilot.autopilotActions}/steward${afterAutoSurvive.stewardActions}/exp${afterAutoSurvive.expeditions.forest}-${afterAutoSurvive.expeditions.mine}-${afterAutoSurvive.expeditions.hunt}/sleep${afterAutoSurvive.sleptNights}/cold${afterAutoSurvive.stats.cold} voxelGoals=${afterVoxelRun.goalsCompleted}/raid${afterVoxelRun.raid}-${afterVoxelRun.raidEventTitle}/core${afterVoxelRun.coreHp}/tech${afterVoxelRun.techCount}/blueprint${afterVoxelRun.blueprintActions}-${afterVoxelRun.buildPlanStage}-${afterVoxelRun.planGhosts}/grid${afterVoxelRun.powerGrid}-${afterVoxelRun.logisticsLinks}/scan${afterVoxelRun.scanActions}-${afterVoxelRun.veinTitle}/work${afterVoxelRun.workOrderActions}-${afterVoxelRun.excavationFocus}-${afterVoxelRun.materialShortage}/order${forcedVoxelWork.workOrderActions}-${forcedVoxelWork.excavationFocus} orbitGoals=${afterOrbit.goalsCompleted}/wave${afterOrbit.wave}-${afterOrbit.orbitEventTitle}/formation${afterOrbit.formationActions}-${afterOrbit.formationTitle}/command${afterOrbit.commandActions}-${afterOrbit.pressureTitle}${afterOrbit.pressureScore}-${afterOrbit.riskGrade}/pressure${afterOrbit.orbitPressure}/core${afterOrbit.coreHp} screenshots=${hubScreenshot},${waveScreenshot},${mutationScreenshot},${mobileScreenshot},${cabinIntroScreenshot},${cabinPackScreenshot},${cabinScreenshot},${cabinColdScreenshot},${cabinMobileScreenshot},${voxelScreenshot},${voxelMobileScreenshot},${orbitScreenshot},${orbitMobileScreenshot}`,
    );
  } finally {
    cdp?.close();
    browser?.close();
    await stopProcess(chrome);
    await stopProcess(vite);
    await rm(profileDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(`[verify] ${error.stack || error.message}`);
  process.exit(1);
});
