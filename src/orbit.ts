import * as THREE from "three";

type SatelliteKind = "laser" | "shield" | "collector";
type ResourceKind = "scrap" | "energy" | "core";
type ProtocolKind = "lens" | "salvage" | "aegis" | "capacitor" | "repair" | "formation";
type FormationKind = "intercept" | "bulwark" | "salvage" | "overcharge";
type OrbitEventKind = "calm" | "solarWind" | "meteorShower" | "ionStorm" | "pirateRaid";
type OrbitLaneKind = "outer" | "middle" | "inner" | "supply";
type OrbitCommandKind = "intercept" | "brace" | "salvage";

interface Satellite {
  id: number;
  kind: SatelliteKind;
  level: number;
  angle: number;
  radius: number;
  group: THREE.Group;
}

interface OrbitPressure {
  lane: OrbitLaneKind;
  title: string;
  pressure: number;
  hint: string;
}

interface OrbitCommandCard {
  kind: OrbitCommandKind;
  title: string;
  detail: string;
  tag: string;
  ready: boolean;
}

interface OrbitDebugState {
  mode: "orbit";
  satellites: number;
  byKind: Record<SatelliteKind, number>;
  highestLevel: number;
  wave: number;
  kills: number;
  coreHp: number;
  shield: number;
  resources: Record<ResourceKind, number>;
  protocolCount: number;
  protocols: string[];
  protocolLevels: Record<ProtocolKind, number>;
  autoProtocolPicks: number;
  formationMode: boolean;
  formationActions: number;
  activeFormation: FormationKind;
  formationTitle: string;
  formationHistory: string[];
  activeOrbitEvent: OrbitEventKind;
  orbitEventTitle: string;
  orbitEventHistory: string[];
  orbitEventActions: number;
  orbitEventMarkers: number;
  commandMode: boolean;
  commandActions: number;
  commandSavedClicks: number;
  commandCards: OrbitCommandCard[];
  commandHistory: string[];
  lastCommandPlan: string;
  pressureHotspot: OrbitLaneKind;
  pressureTitle: string;
  pressureScore: number;
  orbitPressure: string;
  pressureMarkers: number;
  nextOrbitEventTitle: string;
  projectedThreat: number;
  projectedDefense: number;
  riskGrade: string;
  goalsCompleted: number;
  goalIdsDone: string[];
  nextGoal: string;
  tacticActions: number;
  combatLog: string;
  target: { x: number; y: number; z: number };
  camera: { x: number; y: number; z: number };
}

declare global {
  interface Window {
    __orbitDefenseDebug?: {
      state: () => OrbitDebugState;
      deploy: (kind?: SatelliteKind) => OrbitDebugState;
      upgrade: () => OrbitDebugState;
      forceWave: () => OrbitDebugState;
      tactic: () => OrbitDebugState;
      command: (kind?: OrbitCommandKind) => OrbitDebugState;
      formation: (kind?: FormationKind) => OrbitDebugState;
      chooseProtocol: (kind?: ProtocolKind) => OrbitDebugState;
      autoRun: (steps?: number) => OrbitDebugState;
    };
  }
}

const SATELLITES: Record<SatelliteKind, { name: string; color: number; cost: Partial<Record<ResourceKind, number>> }> = {
  laser: { name: "激光卫星", color: 0xff6b7a, cost: { scrap: 45, energy: 1 } },
  shield: { name: "护盾卫星", color: 0x73c7ff, cost: { scrap: 55, core: 1 } },
  collector: { name: "回收卫星", color: 0xffd36a, cost: { scrap: 35 } },
};

const RESOURCE_LABELS: Record<ResourceKind, string> = {
  scrap: "残骸",
  energy: "能量",
  core: "核心件",
};

const RESOURCE_ORDER: ResourceKind[] = ["scrap", "energy", "core"];
const SATELLITE_ORDER: SatelliteKind[] = ["laser", "shield", "collector"];
const PROTOCOL_ORDER: ProtocolKind[] = ["lens", "salvage", "aegis", "capacitor", "repair", "formation"];
const PROTOCOLS: Record<ProtocolKind, { title: string; description: string }> = {
  lens: { title: "磁轨透镜", description: "激光火力 +18%" },
  salvage: { title: "残骸税", description: "每次击落额外回收残骸" },
  aegis: { title: "蔚蓝壁垒", description: "护盾卫星和回盾更强" },
  capacitor: { title: "电容阵列", description: "迎击后额外补能" },
  repair: { title: "维修蜂群", description: "波后自动修核心" },
  formation: { title: "星链编队", description: "多卫星互相增幅" },
};

const FORMATIONS: Record<
  FormationKind,
  { title: string; description: string; color: number; attack: number; shield: number; salvage: number; energyCost: number }
> = {
  intercept: { title: "拦截扇面", description: "激光火力提高，适合高威胁波。", color: 0xff6b7a, attack: 1.16, shield: 1, salvage: 1, energyCost: 0 },
  bulwark: { title: "护盾环阵", description: "护盾结算更厚，适合漏伤压力。", color: 0x73c7ff, attack: 0.96, shield: 1.22, salvage: 1, energyCost: 0 },
  salvage: { title: "回收拖网", description: "回收更多残骸，适合补经济。", color: 0xffd36a, attack: 0.92, shield: 0.98, salvage: 1.36, energyCost: 0 },
  overcharge: { title: "过载脉冲", description: "短时火力暴涨，但每波耗能。", color: 0xbe78ff, attack: 1.3, shield: 0.92, salvage: 1.06, energyCost: 1 },
};

const ORBIT_EVENTS: Record<
  OrbitEventKind,
  { title: string; detail: string; color: number; threatMultiplier: number; threatBonus: number; attackMultiplier: number; shieldMultiplier: number; scrapBonus: number; energyBonus: number }
> = {
  calm: { title: "静默轨道", detail: "入侵强度正常。", color: 0x9fb3c7, threatMultiplier: 1, threatBonus: 0, attackMultiplier: 1, shieldMultiplier: 1, scrapBonus: 0, energyBonus: 0 },
  solarWind: { title: "太阳风顺流", detail: "光束增益，额外补能。", color: 0xffd36a, threatMultiplier: 0.96, threatBonus: 0, attackMultiplier: 1.12, shieldMultiplier: 1, scrapBonus: 0, energyBonus: 2 },
  meteorShower: { title: "陨石雨", detail: "威胁上升，但残骸回收增加。", color: 0xff8f5a, threatMultiplier: 1.08, threatBonus: 14, attackMultiplier: 1, shieldMultiplier: 0.98, scrapBonus: 5, energyBonus: 0 },
  ionStorm: { title: "离子风暴", detail: "火力受扰，护盾更吃香。", color: 0x73c7ff, threatMultiplier: 1.04, threatBonus: 8, attackMultiplier: 0.88, shieldMultiplier: 1.18, scrapBonus: 0, energyBonus: 1 },
  pirateRaid: { title: "掠夺者突袭", detail: "敌群更凶，击落奖励更高。", color: 0xbe78ff, threatMultiplier: 1.14, threatBonus: 18, attackMultiplier: 1, shieldMultiplier: 1, scrapBonus: 3, energyBonus: 0 },
};

const ORBIT_LANES: Record<OrbitLaneKind, { title: string; color: number; radius: number; angle: number }> = {
  outer: { title: "外环火线", color: 0xff6b7a, radius: 5.72, angle: Math.PI * 0.16 },
  middle: { title: "中环拦截", color: 0xffd36a, radius: 4.35, angle: Math.PI * 0.72 },
  inner: { title: "近地护盾", color: 0x73c7ff, radius: 2.62, angle: Math.PI * 1.2 },
  supply: { title: "回收补给", color: 0x8ef7ad, radius: 3.46, angle: Math.PI * 1.68 },
};

const GOALS: Array<{ id: string; title: string; description: string; check: () => boolean }> = [];

export function startOrbitalDefense(root: HTMLElement) {
  root.replaceChildren();
  root.className = "orbit-shell";

  const canvasWrap = document.createElement("div");
  canvasWrap.className = "orbit-canvas";
  root.append(canvasWrap);

  const hud = document.createElement("div");
  hud.className = "orbit-hud";
  hud.innerHTML = `
    <div class="orbit-title">星环防线</div>
    <div class="orbit-stat" data-stat>核心 100 · 护盾 35 · 波次 0</div>
    <div class="orbit-resources" data-resources></div>
    <div class="orbit-protocols" data-protocols></div>
    <div class="orbit-goals" data-goals></div>
    <div class="orbit-tip" data-tip>卫星自动绕行开火；你只需要部署、升级和迎击。</div>
    <div class="orbit-actions">
      <button type="button" data-tactic>执行战术</button>
      <button type="button" data-formation>战术编队</button>
      <button type="button" data-wave>迎击</button>
      <a class="orbit-link" href="./">游戏大厅</a>
      <a class="orbit-link" href="?game=cabin">林间求生</a>
      <a class="orbit-link" href="?game=voxel">深岩工坊</a>
    </div>
  `;
  root.append(hud);

  const commandPanel = document.createElement("div");
  commandPanel.className = "orbit-command";
  commandPanel.innerHTML = `
    <div class="orbit-command-head">
      <strong>轨道指挥</strong>
      <span data-command-grade>待命</span>
    </div>
    <div class="orbit-threat" data-command-threat></div>
    <div class="orbit-cards" data-command-cards></div>
  `;
  root.append(commandPanel);

  const hotbar = document.createElement("div");
  hotbar.className = "orbit-hotbar";
  root.append(hotbar);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050912);
  scene.fog = new THREE.Fog(0x050912, 18, 56);

  const camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 0.1, 140);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvasWrap.append(renderer.domElement);

  const ambient = new THREE.HemisphereLight(0xcfe8ff, 0x130816, 1.25);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffffff, 2.5);
  sun.position.set(8, 10, 9);
  sun.castShadow = true;
  scene.add(sun);

  const target = new THREE.Vector3(0, 0.5, 0);
  const cameraState = { theta: Math.PI * 0.22, phi: 1.0, radius: 14.5 };
  const resources: Record<ResourceKind, number> = { scrap: 130, energy: 4, core: 2 };
  const protocolLevels: Record<ProtocolKind, number> = {
    lens: 0,
    salvage: 0,
    aegis: 0,
    capacitor: 0,
    repair: 0,
    formation: 0,
  };
  const satellites: Satellite[] = [];
  const drones: THREE.Group[] = [];
  const debris: THREE.Mesh[] = [];
  const effects: Array<{ object: THREE.Object3D; ttl: number; maxTtl: number }> = [];
  const clock = new THREE.Clock();
  let nextSatelliteId = 1;
  let selected: SatelliteKind = "laser";
  let wave = 0;
  let kills = 0;
  let coreHp = 100;
  let shield = 35;
  let tacticActions = 0;
  let autoProtocolPicks = 0;
  let formationMode = true;
  let formationActions = 0;
  let activeFormation: FormationKind = "intercept";
  let lastFormationAtTactic = -1;
  let activeOrbitEvent: OrbitEventKind = "calm";
  let orbitEventActions = 0;
  let commandMode = true;
  let commandActions = 0;
  let commandSavedClicks = 0;
  let lastCommandPlan = "等待入侵航道数据。";
  let pendingProtocolChoices: ProtocolKind[] = [];
  const formationHistory: string[] = [];
  const orbitEventHistory: string[] = [];
  const commandHistory: string[] = [];
  let combatLog = "等待第一波入侵。";
  let lastTip = "卫星自动绕行开火；你只需要部署、升级和迎击。";
  let dragging = false;
  let movedDuringDrag = false;
  let lastPointer = { x: 0, y: 0 };

  const planet = createPlanet();
  const shieldShell = createShieldShell();
  const eventMarkerGroup = new THREE.Group();
  const pressureMarkerGroup = new THREE.Group();
  scene.add(planet);
  scene.add(shieldShell);
  scene.add(eventMarkerGroup);
  scene.add(pressureMarkerGroup);
  createStarField();
  createRings();
  createDebrisBelt();
  renderOrbitEventMarkers();
  renderPressureMarkers();
  createHotbar();
  defineGoals();
  installEvents();
  installDebugApi();
  updateCamera();
  updateHud();
  animate();

  function defineGoals() {
    GOALS.splice(
      0,
      GOALS.length,
      { id: "laser-grid", title: "铺设火力网", description: "部署 2 颗激光卫星", check: () => countKind("laser") >= 2 },
      { id: "shield-node", title: "建立护盾节点", description: "部署 1 颗护盾卫星", check: () => countKind("shield") >= 1 },
      { id: "recycler", title: "回收残骸", description: "部署 1 颗回收卫星", check: () => countKind("collector") >= 1 },
      { id: "upgrade", title: "升级主炮", description: "任意卫星升到 2 级", check: () => highestLevel() >= 2 },
      { id: "protocols", title: "选择协议", description: "自动装载 3 项星环协议", check: () => protocolCount() >= 3 },
      { id: "command", title: "轨道指挥", description: "使用 2 次战术指挥卡", check: () => commandActions >= 2 },
      { id: "raid-1", title: "击退第一波", description: "清理 1 次入侵", check: () => wave >= 1 && coreHp >= 85 },
      { id: "raid-3", title: "稳定星环", description: "清理 3 次入侵", check: () => wave >= 3 && coreHp >= 70 },
    );
  }

  function createPlanet() {
    const group = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(1.55, 36, 24),
      new THREE.MeshStandardMaterial({ color: 0x315f9c, roughness: 0.62, metalness: 0.05 }),
    );
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const core = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.62, 0),
      new THREE.MeshStandardMaterial({ color: 0xffd36a, emissive: 0xff8f2e, emissiveIntensity: 1.2, roughness: 0.38 }),
    );
    core.position.y = 2.05;
    core.castShadow = true;
    group.add(core);

    const glow = new THREE.PointLight(0xffb45f, 2.8, 9);
    glow.position.set(0, 2.4, 0);
    group.add(glow);

    const landMaterial = new THREE.MeshStandardMaterial({ color: 0x5ca874, roughness: 0.78, metalness: 0.02 });
    for (let i = 0; i < 9; i += 1) {
      const land = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18 + (i % 3) * 0.05, 1), landMaterial);
      const angle = i * 1.37;
      land.position.set(Math.cos(angle) * 1.42, Math.sin(i * 2.1) * 0.82, Math.sin(angle) * 1.42);
      land.scale.set(1.9, 0.45, 0.8);
      land.lookAt(0, 0, 0);
      group.add(land);
    }
    return group;
  }

  function createShieldShell() {
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(2.14, 32, 18),
      new THREE.MeshBasicMaterial({ color: 0x73c7ff, wireframe: true, transparent: true, opacity: 0.16 }),
    );
    shell.visible = true;
    return shell;
  }

  function createStarField() {
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xdff7ff });
    for (let i = 0; i < 90; i += 1) {
      const star = new THREE.Mesh(new THREE.SphereGeometry(0.018 + (i % 3) * 0.006, 6, 4), starMaterial);
      const theta = i * 2.399;
      const phi = Math.acos(2 * ((i * 37) % 91) / 91 - 1);
      const radius = 24 + (i % 11);
      star.position.set(
        Math.sin(phi) * Math.cos(theta) * radius,
        Math.cos(phi) * radius * 0.55 + 5,
        Math.sin(phi) * Math.sin(theta) * radius,
      );
      scene.add(star);
    }
  }

  function createRings() {
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x6fdcff, transparent: true, opacity: 0.18 });
    for (const radius of [2.6, 3.45, 4.35]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.012, 8, 96), ringMaterial);
      ring.rotation.x = Math.PI * 0.5;
      scene.add(ring);
    }
    const dangerRing = new THREE.Mesh(
      new THREE.TorusGeometry(5.65, 0.02, 8, 96),
      new THREE.MeshBasicMaterial({ color: 0xff6b7a, transparent: true, opacity: 0.22 }),
    );
    dangerRing.rotation.x = Math.PI * 0.5;
    scene.add(dangerRing);
  }

  function createDebrisBelt() {
    const material = new THREE.MeshStandardMaterial({ color: 0x9fb3c7, roughness: 0.82, metalness: 0.12 });
    for (let i = 0; i < 24; i += 1) {
      const shard = new THREE.Mesh(new THREE.DodecahedronGeometry(0.045 + (i % 4) * 0.015, 0), material);
      const angle = i * 0.72;
      const radius = 5.2 + (i % 5) * 0.18;
      shard.position.set(Math.cos(angle) * radius, -0.35 + (i % 6) * 0.12, Math.sin(angle) * radius);
      shard.rotation.set(i * 0.3, i * 0.7, i * 0.2);
      debris.push(shard);
      scene.add(shard);
    }
  }

  function createHotbar() {
    for (const kind of SATELLITE_ORDER) {
      const button = document.createElement("button");
      button.className = "orbit-slot";
      button.type = "button";
      button.dataset.kind = kind;
      button.innerHTML = `<span class="orbit-swatch" style="background:#${SATELLITES[kind].color.toString(16).padStart(6, "0")}"></span><span>${SATELLITES[kind].name}</span><small>${costText(kind)}</small>`;
      button.addEventListener("click", () => {
        selected = kind;
        updateHud();
      });
      hotbar.append(button);
    }
  }

  function installEvents() {
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", onKeyDown);
    hud.querySelector<HTMLButtonElement>("[data-tactic]")?.addEventListener("click", () => runTactic());
    hud.querySelector<HTMLButtonElement>("[data-formation]")?.addEventListener("click", () => setFormation());
    hud.querySelector<HTMLButtonElement>("[data-wave]")?.addEventListener("click", () => resolveWave());
    commandPanel.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-command]");
      if (!button) return;
      executeCommandCard(button.dataset.command as OrbitCommandKind);
    });
    renderer.domElement.addEventListener("pointerdown", (event) => {
      dragging = true;
      movedDuringDrag = false;
      lastPointer = { x: event.clientX, y: event.clientY };
      renderer.domElement.setPointerCapture(event.pointerId);
    });
    renderer.domElement.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const dx = event.clientX - lastPointer.x;
      const dy = event.clientY - lastPointer.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) movedDuringDrag = true;
      cameraState.theta -= dx * 0.006;
      cameraState.phi = THREE.MathUtils.clamp(cameraState.phi + dy * 0.004, 0.4, 1.22);
      lastPointer = { x: event.clientX, y: event.clientY };
      updateCamera();
    });
    renderer.domElement.addEventListener("pointerup", (event) => {
      dragging = false;
      renderer.domElement.releasePointerCapture(event.pointerId);
      if (!movedDuringDrag) deploy(selected);
    });
    renderer.domElement.addEventListener("wheel", (event) => {
      cameraState.radius = THREE.MathUtils.clamp(cameraState.radius + event.deltaY * 0.01, 9, 26);
      updateCamera();
    }, { passive: true });
  }

  function onKeyDown(event: KeyboardEvent) {
    const index = Number(event.key) - 1;
    if (index >= 0 && index < SATELLITE_ORDER.length) {
      selected = SATELLITE_ORDER[index];
      updateHud();
      return;
    }
    if (event.key.toLowerCase() === "q") {
      runTactic();
      return;
    }
    const step = event.shiftKey ? 0.75 : 0.42;
    if (event.key.toLowerCase() === "w") target.z -= step;
    if (event.key.toLowerCase() === "s") target.z += step;
    if (event.key.toLowerCase() === "a") target.x -= step;
    if (event.key.toLowerCase() === "d") target.x += step;
    target.x = THREE.MathUtils.clamp(target.x, -2.5, 2.5);
    target.z = THREE.MathUtils.clamp(target.z, -2.5, 2.5);
    updateCamera();
  }

  function deploy(kind: SatelliteKind) {
    if (!canAfford(kind)) {
      lastTip = `${SATELLITES[kind].name}材料不足：需要 ${costText(kind)}`;
      updateHud();
      return;
    }
    for (const [resource, amount] of Object.entries(SATELLITES[kind].cost)) {
      resources[resource as ResourceKind] -= amount;
    }
    const orbitIndex = satellites.length % 3;
    const satellite: Satellite = {
      id: nextSatelliteId,
      kind,
      level: 1,
      angle: nextSatelliteId * 1.72,
      radius: [2.6, 3.45, 4.35][orbitIndex],
      group: createSatelliteMesh(kind),
    };
    nextSatelliteId += 1;
    satellites.push(satellite);
    scene.add(satellite.group);
    updateSatellitePosition(satellite, 0);
    lastTip = `部署 ${SATELLITES[kind].name}`;
    updateHud();
  }

  function createSatelliteMesh(kind: SatelliteKind) {
    const group = new THREE.Group();
    const color = SATELLITES[kind].color;
    const body = new THREE.Mesh(
      kind === "shield" ? new THREE.OctahedronGeometry(0.28, 0) : new THREE.BoxGeometry(0.42, 0.28, 0.28),
      new THREE.MeshStandardMaterial({ color, emissive: new THREE.Color(color).multiplyScalar(0.35), emissiveIntensity: 0.7, roughness: 0.42 }),
    );
    body.castShadow = true;
    group.add(body);
    if (kind !== "shield") {
      const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xdfefff, roughness: 0.5 });
      const left = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.58), wingMaterial);
      const right = left.clone();
      left.position.x = -0.34;
      right.position.x = 0.34;
      group.add(left, right);
    }
    if (kind === "laser") {
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.06, 0.52, 10),
        new THREE.MeshStandardMaterial({ color: 0xffd7de, emissive: 0xff6b7a, emissiveIntensity: 0.7, roughness: 0.32 }),
      );
      barrel.rotation.z = Math.PI * 0.5;
      barrel.position.x = 0.38;
      group.add(barrel);
    } else if (kind === "shield") {
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.018, 8, 32),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.72 }),
      );
      halo.rotation.x = Math.PI * 0.5;
      group.add(halo);
    } else {
      const dish = new THREE.Mesh(
        new THREE.ConeGeometry(0.24, 0.28, 14),
        new THREE.MeshStandardMaterial({ color: 0xffefb6, emissive: 0xffbd58, emissiveIntensity: 0.35, roughness: 0.5 }),
      );
      dish.rotation.z = -Math.PI * 0.5;
      dish.position.x = 0.36;
      group.add(dish);
    }
    const light = new THREE.PointLight(color, kind === "laser" ? 1.4 : 1, 4);
    group.add(light);
    return group;
  }

  function upgradeWeakest() {
    const targetSatellite = [...satellites].sort((a, b) => a.level - b.level)[0];
    if (!targetSatellite) {
      lastTip = "先部署卫星，再升级。";
      updateHud();
      return;
    }
    const cost = 55 + targetSatellite.level * 25;
    if (resources.scrap < cost || resources.energy < 1) {
      lastTip = `升级需要残骸 ${cost} 和能量 1。`;
      updateHud();
      return;
    }
    resources.scrap -= cost;
    resources.energy -= 1;
    targetSatellite.level += 1;
    targetSatellite.group.scale.setScalar(1 + targetSatellite.level * 0.12);
    lastTip = `${SATELLITES[targetSatellite.kind].name} 升到 ${targetSatellite.level} 级`;
    updateHud();
  }

  function resolveWave() {
    wave += 1;
    activateOrbitEvent(pickOrbitEventForWave(wave));
    if (formationMode && (formationActions === 0 || tacticActions - lastFormationAtTactic >= 3)) setFormation(pickFormation(), false);
    const event = ORBIT_EVENTS[activeOrbitEvent];
    const formation = FORMATIONS[activeFormation];
    const threat = estimateThreatFor(wave, activeOrbitEvent);
    if (formation.energyCost > 0 && resources.energy > 0) resources.energy -= formation.energyCost;
    const attack = satellites.reduce((sum, satellite) => {
      if (satellite.kind === "laser") return sum + 42 * satellite.level * attackMultiplier() * event.attackMultiplier;
      if (satellite.kind === "collector") return sum + 10 * satellite.level * protocolFormationMultiplier() * formation.attack * event.attackMultiplier;
      return sum + 5 * satellite.level;
    }, 0);
    const shieldPower =
      shield +
      satellites
        .filter((satellite) => satellite.kind === "shield")
        .reduce((sum, satellite) => sum + (34 + protocolLevels.aegis * 10) * satellite.level * formation.shield * event.shieldMultiplier, 0);
    const defense = attack + shieldPower;
    const leak = Math.max(0, threat - defense);
    if (leak > 0) {
      const shieldLoss = Math.min(shield, Math.ceil(leak * 0.65));
      shield -= shieldLoss;
      coreHp = Math.max(0, coreHp - Math.ceil((leak - shieldLoss) * 0.45));
    } else {
      shield = Math.min(140, shield + 12 + countKind("shield") * 8 + protocolLevels.aegis * 5);
    }
    const waveKills = Math.max(4, Math.floor(Math.min(threat, defense) / 22));
    kills += waveKills;
    resources.scrap += Math.round(waveKills * (12 + countKind("collector") * 3 + protocolLevels.salvage * 3 + event.scrapBonus) * formation.salvage);
    resources.energy += 1 + Math.floor(countKind("collector") / 2) + protocolLevels.capacitor + event.energyBonus;
    if (wave % 2 === 0) resources.core += 1;
    if (protocolLevels.repair > 0 && coreHp < 100) coreHp = Math.min(100, coreHp + protocolLevels.repair * 4);
    spawnDrones(waveKills);
    drawCombatEffects(leak);
    const hotspot = getOrbitPressure()[0];
    combatLog = `威胁 ${threat} · 火力 ${Math.round(attack)} · 护盾 ${Math.round(shieldPower)} · 漏伤 ${leak} · ${event.title} · ${formation.title} · 热点 ${hotspot.title}${hotspot.pressure}`;
    chooseBestProtocol();
    lastTip = leak > 0 ? `第 ${wave} 波漏伤 ${leak}，核心 ${coreHp}` : `第 ${wave} 波清空，回收 ${waveKills} 份残骸`;
    renderPressureMarkers();
    updateHud();
  }

  function spawnDrones(count: number) {
    for (const drone of drones.splice(0)) scene.remove(drone);
    for (let i = 0; i < Math.min(10, count); i += 1) {
      const drone = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.TetrahedronGeometry(0.22 + (i % 3) * 0.03, 0),
        new THREE.MeshStandardMaterial({ color: 0xa574ff, emissive: 0x351266, emissiveIntensity: 0.8, roughness: 0.54 }),
      );
      drone.add(body);
      const angle = (Math.PI * 2 * i) / Math.min(10, count);
      drone.position.set(Math.cos(angle) * 6.0, 0.4 + (i % 3) * 0.28, Math.sin(angle) * 6.0);
      drones.push(drone);
      scene.add(drone);
    }
  }

  function runTactic() {
    tacticActions += 1;
    lastCommandPlan = pickCommandCard().detail;
    if (formationMode && (formationActions === 0 || tacticActions - lastFormationAtTactic >= 4)) setFormation(pickFormation(), false);
    if (countKind("laser") < 2) return deployOrRaid("laser");
    if (countKind("shield") < 1) return deployOrRaid("shield");
    if (countKind("collector") < 1) return deployOrRaid("collector");
    if (highestLevel() < 2) {
      if (!canUpgradeWeakest()) return resolveWave();
      return upgradeWeakest();
    }
    if (wave < 3) return resolveWave();
    if (coreHp < 90 && resources.scrap >= 60) {
      resources.scrap -= 60;
      coreHp = Math.min(100, coreHp + 10);
      shield = Math.min(120, shield + 18);
      lastTip = "维修核心并重整护盾。";
      updateHud();
      return;
    }
    lastTip = "星环进入巡航：继续升级或迎击高阶入侵。";
    updateHud();
  }

  function deployOrRaid(kind: SatelliteKind) {
    if (canAfford(kind)) {
      deploy(kind);
      return;
    }
    if (satellites.length > 0) {
      lastTip = `${SATELLITES[kind].name}缺料，先迎击回收残骸。`;
      resolveWave();
      return;
    }
    lastTip = `${SATELLITES[kind].name}材料不足：需要 ${costText(kind)}`;
    updateHud();
  }

  function autoRun(steps: number) {
    for (let i = 0; i < steps; i += 1) {
      if (i > 0 && i % 4 === 2) {
        executeCommandCard(pickCommandCard().kind);
        continue;
      }
      runTactic();
    }
    return getDebugState();
  }

  function executeCommandCard(kind: OrbitCommandKind) {
    commandMode = true;
    commandActions += 1;
    const beforeWave = wave;
    const beforeSatellites = satellites.length;
    const card = getCommandCards().find((item) => item.kind === kind) ?? pickCommandCard();
    const hotspot = getOrbitPressure()[0];

    if (kind === "brace") {
      setFormation("bulwark", false);
      if (countKind("shield") < 2 && canAfford("shield")) {
        deploy("shield");
        commandSavedClicks += 3;
      } else if ((coreHp < 96 || shield < 72 || hotspot.pressure > 68) && resources.scrap >= 45) {
        resources.scrap -= 45;
        coreHp = Math.min(100, coreHp + 8);
        shield = Math.min(145, shield + 24 + protocolLevels.aegis * 4);
        addShockwave(ORBIT_LANES.inner.color);
        lastTip = "指挥卡：核心维修，护盾重压。";
        commandSavedClicks += 4;
      } else {
        resolveWave();
        commandSavedClicks += 2;
      }
    } else if (kind === "salvage") {
      setFormation("salvage", false);
      if (countKind("collector") < 2 && canAfford("collector")) {
        deploy("collector");
        commandSavedClicks += 3;
      } else if (resources.energy < 3 && resources.scrap >= 35) {
        resources.scrap -= 35;
        resources.energy += 2 + protocolLevels.capacitor;
        lastTip = "指挥卡：回收拖网换取应急能量。";
        commandSavedClicks += 3;
      } else {
        resolveWave();
        commandSavedClicks += 2;
      }
    } else {
      setFormation(hotspot.pressure > 82 && resources.energy >= 2 ? "overcharge" : "intercept", false);
      if (countKind("laser") < 3 && canAfford("laser")) {
        deploy("laser");
        commandSavedClicks += 3;
      } else if (canUpgradeWeakest()) {
        upgradeWeakest();
        commandSavedClicks += 3;
      } else {
        resolveWave();
        commandSavedClicks += 2;
      }
    }

    lastCommandPlan = `${card.title}：${card.detail}`;
    commandHistory.push(`${card.title}${beforeWave === wave ? "整备" : `迎击${wave}`}`);
    if (commandHistory.length > 7) commandHistory.shift();
    if (satellites.length > beforeSatellites) lastCommandPlan += "，已补轨道节点";
    renderPressureMarkers();
    updateHud();
    return getDebugState();
  }

  function setFormation(kind = pickFormation(), countAction = true) {
    formationMode = true;
    activeFormation = kind;
    formationActions += 1;
    lastFormationAtTactic = tacticActions;
    formationHistory.push(FORMATIONS[kind].title);
    if (formationHistory.length > 6) formationHistory.shift();
    applyFormationLayout();
    addShockwave(FORMATIONS[kind].color);
    lastTip = `战术编队：${FORMATIONS[kind].title}。${FORMATIONS[kind].description}`;
    if (countAction) tacticActions += 1;
    updateHud();
  }

  function pickFormation(): FormationKind {
    if (coreHp < 82 || shield < 42) return "bulwark";
    if (resources.scrap < 110 || countKind("collector") > 0 && resources.energy >= 2 && wave < 3) return "salvage";
    if (countKind("laser") >= 2 && resources.energy >= 3 && wave >= 2) return "overcharge";
    return "intercept";
  }

  function applyFormationLayout() {
    const lanes: Record<FormationKind, Record<SatelliteKind, number>> = {
      intercept: { laser: 2.58, shield: 3.42, collector: 4.28 },
      bulwark: { shield: 2.56, laser: 3.36, collector: 4.28 },
      salvage: { collector: 2.64, laser: 3.48, shield: 4.26 },
      overcharge: { laser: 2.82, collector: 3.38, shield: 3.96 },
    };
    const offsets: Record<SatelliteKind, number> = { laser: 0, shield: 0.22, collector: 0.44 };
    for (const satellite of satellites) {
      satellite.radius = lanes[activeFormation][satellite.kind] + (satellite.id % 3) * 0.08;
      satellite.angle += offsets[satellite.kind];
      satellite.group.scale.setScalar(1 + satellite.level * 0.12 + (activeFormation === "overcharge" && satellite.kind === "laser" ? 0.08 : 0));
    }
  }

  function estimateThreatFor(waveNumber: number, eventKind: OrbitEventKind) {
    const event = ORBIT_EVENTS[eventKind];
    return Math.round((65 + waveNumber * 45) * event.threatMultiplier + event.threatBonus);
  }

  function estimateAttackFor(eventKind: OrbitEventKind, formationKind = activeFormation) {
    const event = ORBIT_EVENTS[eventKind];
    const formation = FORMATIONS[formationKind];
    return satellites.reduce((sum, satellite) => {
      if (satellite.kind === "laser") return sum + 42 * satellite.level * (1 + protocolLevels.lens * 0.18) * protocolFormationMultiplier() * formation.attack * event.attackMultiplier;
      if (satellite.kind === "collector") return sum + 10 * satellite.level * protocolFormationMultiplier() * formation.attack * event.attackMultiplier;
      return sum + 5 * satellite.level;
    }, 0);
  }

  function estimateShieldPowerFor(eventKind: OrbitEventKind, formationKind = activeFormation) {
    const event = ORBIT_EVENTS[eventKind];
    const formation = FORMATIONS[formationKind];
    return (
      shield +
      satellites
        .filter((satellite) => satellite.kind === "shield")
        .reduce((sum, satellite) => sum + (34 + protocolLevels.aegis * 10) * satellite.level * formation.shield * event.shieldMultiplier, 0)
    );
  }

  function getProjectedBattle() {
    const nextWave = wave + 1;
    const nextEvent = pickOrbitEventForWave(nextWave);
    const threat = estimateThreatFor(nextWave, nextEvent);
    const attack = estimateAttackFor(nextEvent);
    const shieldPower = estimateShieldPowerFor(nextEvent);
    const defense = Math.round(attack + shieldPower);
    return {
      nextWave,
      nextEvent,
      threat,
      attack: Math.round(attack),
      shieldPower: Math.round(shieldPower),
      defense,
      deficit: Math.max(0, threat - defense),
    };
  }

  function pressureScore(value: number) {
    return Math.round(THREE.MathUtils.clamp(value, 0, 99));
  }

  function getOrbitPressure(): OrbitPressure[] {
    const projected = getProjectedBattle();
    const event = ORBIT_EVENTS[projected.nextEvent];
    const highest = highestLevel();
    const laserReadiness = countKind("laser") * 40 + protocolLevels.lens * 18 + highest * 6 + (activeFormation === "intercept" ? 24 : 0);
    const shieldReadiness = shield + countKind("shield") * 42 + protocolLevels.aegis * 14 + (activeFormation === "bulwark" ? 28 : 0);
    const salvageReadiness = resources.scrap + countKind("collector") * 36 + protocolLevels.salvage * 22 + (activeFormation === "salvage" ? 26 : 0);
    const energyReadiness = resources.energy * 22 + protocolLevels.capacitor * 16 - FORMATIONS[activeFormation].energyCost * 12;
    const eventHeat = event.threatBonus + (projected.nextEvent === "pirateRaid" ? 20 : 0) + (projected.nextEvent === "meteorShower" ? 14 : 0);
    const pressure: OrbitPressure[] = [
      {
        lane: "outer",
        title: ORBIT_LANES.outer.title,
        pressure: pressureScore(projected.threat * 0.42 + eventHeat - laserReadiness),
        hint: countKind("laser") < 3 ? "补激光火力网" : "升级主炮或切拦截",
      },
      {
        lane: "middle",
        title: ORBIT_LANES.middle.title,
        pressure: pressureScore(projected.threat * 0.3 + projected.deficit * 0.45 - laserReadiness * 0.28 - shieldReadiness * 0.18 + (projected.nextEvent === "ionStorm" ? 24 : 0)),
        hint: highest < 2 ? "先升最弱卫星" : "用编队压住中环",
      },
      {
        lane: "inner",
        title: ORBIT_LANES.inner.title,
        pressure: pressureScore(projected.deficit + (100 - coreHp) * 0.58 + Math.max(0, 66 - shieldReadiness) + (projected.nextEvent === "pirateRaid" ? 18 : 0)),
        hint: countKind("shield") < 2 ? "补护盾节点" : "维修核心并蓄盾",
      },
      {
        lane: "supply",
        title: ORBIT_LANES.supply.title,
        pressure: pressureScore(Math.max(0, 122 - salvageReadiness) + Math.max(0, 58 - energyReadiness) + (countKind("collector") < 1 ? 36 : 0) + (projected.nextEvent === "meteorShower" ? 10 : 0)),
        hint: countKind("collector") < 2 ? "补回收卫星" : "切回收拖网补经济",
      },
    ];
    return pressure.sort((a, b) => b.pressure - a.pressure);
  }

  function getRiskGrade(score: number) {
    if (score >= 82) return "危急";
    if (score >= 58) return "吃紧";
    if (score >= 32) return "可控";
    return "富余";
  }

  function pressureSummary() {
    return getOrbitPressure()
      .slice(0, 3)
      .map((item) => `${item.title}${item.pressure}`)
      .join("/");
  }

  function getCommandCards(): OrbitCommandCard[] {
    const projected = getProjectedBattle();
    const hotspot = getOrbitPressure()[0];
    return [
      {
        kind: "intercept",
        title: "接敌整备",
        detail: countKind("laser") < 3 ? "补激光节点，外环先削薄" : highestLevel() < 3 ? "升级最弱卫星，压下中环缺口" : "切拦截扇面后迎击",
        tag: `${ORBIT_EVENTS[projected.nextEvent].title} · 威胁${projected.threat}`,
        ready: hotspot.lane === "outer" || projected.deficit > 0,
      },
      {
        kind: "brace",
        title: "护盾压舱",
        detail: countKind("shield") < 2 ? "补护盾节点，近地圈兜漏" : coreHp < 96 || shield < 72 ? "维修核心并蓄盾" : "护盾环阵吃下高压波",
        tag: `${ORBIT_LANES.inner.title} · ${shield}`,
        ready: hotspot.lane === "inner" || hotspot.lane === "middle" || coreHp < 90 || shield < 60,
      },
      {
        kind: "salvage",
        title: "回收扩张",
        detail: countKind("collector") < 2 ? "补回收卫星，降低后续缺料" : resources.energy < 3 ? "用残骸换应急能量" : "回收拖网滚经济",
        tag: `残骸${resources.scrap} · 能量${resources.energy}`,
        ready: hotspot.lane === "supply" || resources.scrap < 115 || resources.energy < 3,
      },
    ];
  }

  function pickCommandCard() {
    const cards = getCommandCards();
    const hotspot = getOrbitPressure()[0];
    const projected = getProjectedBattle();
    if (hotspot.lane === "inner" || hotspot.lane === "middle" || projected.deficit > 42 || coreHp < 86 || shield < 48) return cards[1];
    if (hotspot.lane === "supply" || countKind("collector") < 1 || resources.scrap < 95) return cards[2];
    return cards[0];
  }

  function updateCommandPanel() {
    const pressures = getOrbitPressure();
    const hotspot = pressures[0];
    const projected = getProjectedBattle();
    const recommended = pickCommandCard();
    commandPanel.querySelector("[data-command-grade]")!.textContent =
      `${getRiskGrade(hotspot.pressure)} · 下波 ${ORBIT_EVENTS[projected.nextEvent].title}`;
    commandPanel.querySelector("[data-command-threat]")!.innerHTML = pressures
      .slice(0, 3)
      .map((item) => {
        const lane = ORBIT_LANES[item.lane];
        return `<div><span><i style="background:#${lane.color.toString(16).padStart(6, "0")}"></i>${item.title}</span><b>${item.pressure}</b><small>${item.hint}</small></div>`;
      })
      .join("");
    commandPanel.querySelector("[data-command-cards]")!.innerHTML = getCommandCards()
      .map(
        (card) => `
          <button type="button" class="orbit-card ${card.ready ? "ready" : ""} ${card.kind === recommended.kind ? "recommended" : ""}" data-command="${card.kind}">
            <span>${card.title}</span>
            <strong>${card.detail}</strong>
            <small>${card.tag}</small>
          </button>
        `,
      )
      .join("");
  }

  function renderPressureMarkers() {
    pressureMarkerGroup.clear();
    getOrbitPressure()
      .slice(0, 3)
      .forEach((item, index) => {
        const lane = ORBIT_LANES[item.lane];
        const arc = Math.PI * THREE.MathUtils.clamp(0.38 + item.pressure / 118, 0.38, 1.12);
        const marker = new THREE.Group();
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(lane.radius, 0.018 + item.pressure / 2800, 8, 72, arc),
          new THREE.MeshBasicMaterial({ color: lane.color, transparent: true, opacity: THREE.MathUtils.clamp(0.22 + item.pressure / 160, 0.24, 0.82) }),
        );
        const beaconAngle = lane.angle + arc * 0.54;
        const beacon = new THREE.Mesh(
          new THREE.ConeGeometry(0.08 + index * 0.012, 0.52 + item.pressure / 170, 8),
          new THREE.MeshBasicMaterial({ color: lane.color, transparent: true, opacity: 0.68 }),
        );
        ring.rotation.x = Math.PI * 0.5;
        ring.rotation.z = lane.angle;
        beacon.position.set(Math.cos(beaconAngle) * lane.radius, 0.48 + index * 0.18, Math.sin(beaconAngle) * lane.radius);
        marker.add(ring, beacon);
        pressureMarkerGroup.add(marker);
      });
  }

  function pickOrbitEventForWave(waveNumber: number): OrbitEventKind {
    if (waveNumber === 1) return "solarWind";
    if (waveNumber === 2) return "meteorShower";
    if (waveNumber === 3) return "pirateRaid";
    if (waveNumber % 4 === 0) return "ionStorm";
    if (waveNumber % 3 === 0) return "pirateRaid";
    return waveNumber % 2 === 0 ? "meteorShower" : "solarWind";
  }

  function activateOrbitEvent(kind: OrbitEventKind) {
    activeOrbitEvent = kind;
    orbitEventActions += 1;
    orbitEventHistory.push(ORBIT_EVENTS[kind].title);
    if (orbitEventHistory.length > 6) orbitEventHistory.shift();
    renderOrbitEventMarkers();
    lastTip = `轨道事件：${ORBIT_EVENTS[kind].title}。${ORBIT_EVENTS[kind].detail}`;
  }

  function renderOrbitEventMarkers() {
    eventMarkerGroup.clear();
    const event = ORBIT_EVENTS[activeOrbitEvent];
    const count = activeOrbitEvent === "calm" ? 2 : 4;
    for (let i = 0; i < count; i += 1) {
      const marker = new THREE.Group();
      const angle = i * ((Math.PI * 2) / count) + 0.38;
      const radius = 5.75 + (i % 2) * 0.18;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.22 + i * 0.015, 0.014, 8, 24),
        new THREE.MeshBasicMaterial({ color: event.color, transparent: true, opacity: 0.72 }),
      );
      ring.rotation.x = Math.PI * 0.5;
      const flare = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.48, 6),
        new THREE.MeshBasicMaterial({ color: event.color, transparent: true, opacity: 0.58 }),
      );
      flare.position.y = 0.36;
      marker.position.set(Math.cos(angle) * radius, 0.26 + (i % 3) * 0.16, Math.sin(angle) * radius);
      marker.add(ring, flare);
      eventMarkerGroup.add(marker);
    }
  }

  function countKind(kind: SatelliteKind) {
    return satellites.filter((satellite) => satellite.kind === kind).length;
  }

  function highestLevel() {
    return satellites.reduce((max, satellite) => Math.max(max, satellite.level), 0);
  }

  function protocolCount() {
    return PROTOCOL_ORDER.reduce((sum, kind) => sum + protocolLevels[kind], 0);
  }

  function byKind() {
    return {
      laser: countKind("laser"),
      shield: countKind("shield"),
      collector: countKind("collector"),
    };
  }

  function canAfford(kind: SatelliteKind) {
    return Object.entries(SATELLITES[kind].cost).every(([resource, amount]) => resources[resource as ResourceKind] >= amount);
  }

  function canUpgradeWeakest() {
    const targetSatellite = [...satellites].sort((a, b) => a.level - b.level)[0];
    if (!targetSatellite) return false;
    return resources.scrap >= 55 + targetSatellite.level * 25 && resources.energy >= 1;
  }

  function attackMultiplier() {
    return (1 + protocolLevels.lens * 0.18) * protocolFormationMultiplier() * FORMATIONS[activeFormation].attack;
  }

  function protocolFormationMultiplier() {
    return 1 + Math.max(0, satellites.length - 2) * protocolLevels.formation * 0.035;
  }

  function costText(kind: SatelliteKind) {
    return Object.entries(SATELLITES[kind].cost)
      .map(([resource, amount]) => `${RESOURCE_LABELS[resource as ResourceKind]} ${amount}`)
      .join(" / ");
  }

  function updateHud() {
    hud.querySelector("[data-stat]")!.textContent =
      `核心 ${coreHp} · 护盾 ${shield} · 波次 ${wave} · ${ORBIT_EVENTS[activeOrbitEvent].title} · ${FORMATIONS[activeFormation].title} · 击落 ${kills}`;
    hud.querySelector("[data-resources]")!.innerHTML = RESOURCE_ORDER
      .map((kind) => `<span><b>${RESOURCE_LABELS[kind]}</b> ${resources[kind]}</span>`)
      .join("");
    hud.querySelector("[data-protocols]")!.innerHTML =
      PROTOCOL_ORDER.filter((kind) => protocolLevels[kind] > 0)
        .map((kind) => `<span><b>${PROTOCOLS[kind].title}</b> Lv.${protocolLevels[kind]}</span>`)
        .join("") || "<span><b>协议</b> 未装载</span>";
    hud.querySelector("[data-goals]")!.innerHTML = GOALS
      .map((goal) => {
        const done = goal.check();
        return `<div class="${done ? "done" : ""}"><span>${done ? "✓" : "·"}</span><strong>${goal.title}</strong><small>${goal.description}</small></div>`;
      })
      .join("");
    hud.querySelector("[data-tip]")!.textContent = lastTip;
    hud.querySelector<HTMLButtonElement>("[data-tactic]")!.textContent = `执行战术：${getNextGoal()?.title ?? "巡航升级"}`;
    hud.querySelector<HTMLButtonElement>("[data-formation]")!.textContent = `编队：${FORMATIONS[activeFormation].title}`;
    hotbar.querySelectorAll<HTMLButtonElement>(".orbit-slot").forEach((button) => {
      const kind = button.dataset.kind as SatelliteKind;
      button.classList.toggle("active", selected === kind);
      button.disabled = !canAfford(kind);
    });
    updateCommandPanel();
    renderPressureMarkers();
    updateShieldShell();
  }

  function chooseBestProtocol(kind?: ProtocolKind) {
    pendingProtocolChoices = kind ? [kind] : makeProtocolChoices();
    const choice = kind ?? pickProtocol(pendingProtocolChoices);
    protocolLevels[choice] += 1;
    autoProtocolPicks += 1;
    pendingProtocolChoices = [];
    lastTip = `装载协议：${PROTOCOLS[choice].title}，${PROTOCOLS[choice].description}`;
    updateHud();
  }

  function makeProtocolChoices() {
    const start = (wave + kills + protocolCount()) % PROTOCOL_ORDER.length;
    return [0, 2, 4].map((offset) => PROTOCOL_ORDER[(start + offset) % PROTOCOL_ORDER.length]);
  }

  function pickProtocol(choices: ProtocolKind[]) {
    if (coreHp < 86 && choices.includes("repair")) return "repair";
    if (shield < 55 && choices.includes("aegis")) return "aegis";
    if (resources.scrap < 90 && choices.includes("salvage")) return "salvage";
    if (resources.energy < 2 && choices.includes("capacitor")) return "capacitor";
    if (countKind("laser") >= 2 && choices.includes("lens")) return "lens";
    return choices.find((kind) => protocolLevels[kind] === 0) ?? choices[0];
  }

  function updateSatellitePosition(satellite: Satellite, dt: number) {
    satellite.angle += dt * (0.34 + satellite.level * 0.035) * (satellite.kind === "collector" ? 0.82 : 1);
    satellite.group.position.set(Math.cos(satellite.angle) * satellite.radius, 0.35 + Math.sin(satellite.angle * 1.8) * 0.18, Math.sin(satellite.angle) * satellite.radius);
    satellite.group.lookAt(planet.position);
  }

  function updateShieldShell() {
    const material = shieldShell.material;
    if (!(material instanceof THREE.MeshBasicMaterial)) return;
    shieldShell.visible = shield > 0 || countKind("shield") > 0;
    shieldShell.scale.setScalar(1 + shield / 280 + protocolLevels.aegis * 0.04);
    material.opacity = THREE.MathUtils.clamp(0.08 + shield / 600 + protocolLevels.aegis * 0.025, 0.08, 0.34);
  }

  function drawCombatEffects(leak: number) {
    const lasers = satellites.filter((satellite) => satellite.kind === "laser");
    lasers.slice(0, 5).forEach((satellite, index) => {
      const drone = drones[index % Math.max(1, drones.length)];
      const end = drone?.position ?? new THREE.Vector3(Math.cos(index) * 5.7, 0.7, Math.sin(index) * 5.7);
      addBeam(satellite.group.position, end, SATELLITES.laser.color);
    });
    if (countKind("shield") > 0 || shield > 0) addShockwave(leak > 0 ? 0xff6b7a : 0x73c7ff);
  }

  function addBeam(from: THREE.Vector3, to: THREE.Vector3, color: number) {
    const geometry = new THREE.BufferGeometry().setFromPoints([from.clone(), to.clone()]);
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.78 });
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    effects.push({ object: line, ttl: 0.42, maxTtl: 0.42 });
  }

  function addShockwave(color: number) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.08 + shield / 140, 0.025, 8, 80),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 }),
    );
    ring.rotation.x = Math.PI * 0.5;
    scene.add(ring);
    effects.push({ object: ring, ttl: 0.62, maxTtl: 0.62 });
  }

  function updateEffects(dt: number) {
    for (let i = effects.length - 1; i >= 0; i -= 1) {
      const effect = effects[i];
      effect.ttl -= dt;
      const alpha = THREE.MathUtils.clamp(effect.ttl / effect.maxTtl, 0, 1);
      effect.object.traverse((child) => {
        const material = (child as THREE.Mesh | THREE.Line).material;
        if (material instanceof THREE.Material && "opacity" in material) material.opacity = alpha * 0.78;
      });
      if (effect.ttl > 0) continue;
      scene.remove(effect.object);
      effect.object.traverse((child) => {
        const mesh = child as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material;
        if (material instanceof THREE.Material) material.dispose();
      });
      effects.splice(i, 1);
    }
  }

  function updateCamera() {
    const x = target.x + Math.sin(cameraState.theta) * Math.sin(cameraState.phi) * cameraState.radius;
    const y = target.y + Math.cos(cameraState.phi) * cameraState.radius;
    const z = target.z + Math.cos(cameraState.theta) * Math.sin(cameraState.phi) * cameraState.radius;
    camera.position.set(x, y, z);
    camera.lookAt(target);
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.033);
    planet.rotation.y += dt * 0.55;
    shieldShell.rotation.y -= dt * 0.32;
    for (const satellite of satellites) updateSatellitePosition(satellite, dt);
    for (let i = 0; i < debris.length; i += 1) {
      debris[i].rotation.x += dt * (0.4 + (i % 3) * 0.08);
      debris[i].rotation.y += dt * 0.28;
    }
    for (const drone of drones) {
      drone.rotation.x += 0.018;
      drone.rotation.y += 0.026;
    }
    for (const marker of eventMarkerGroup.children) {
      marker.rotation.y += dt * 0.85;
      marker.position.y += Math.sin(clock.elapsedTime * 2.4 + marker.position.x) * 0.0008;
    }
    pressureMarkerGroup.rotation.y += dt * 0.06;
    updateEffects(dt);
    renderer.render(scene, camera);
  }

  function getDoneGoals() {
    return GOALS.filter((goal) => goal.check());
  }

  function getNextGoal() {
    return GOALS.find((goal) => !goal.check());
  }

  function getDebugState(): OrbitDebugState {
    const doneGoals = getDoneGoals();
    const nextGoal = getNextGoal();
    const projected = getProjectedBattle();
    const pressure = getOrbitPressure();
    const hotspot = pressure[0];
    return {
      mode: "orbit",
      satellites: satellites.length,
      byKind: byKind(),
      highestLevel: highestLevel(),
      wave,
      kills,
      coreHp,
      shield,
      resources: { ...resources },
      protocolCount: protocolCount(),
      protocols: PROTOCOL_ORDER.filter((kind) => protocolLevels[kind] > 0).map((kind) => `${PROTOCOLS[kind].title} Lv.${protocolLevels[kind]}`),
      protocolLevels: { ...protocolLevels },
      autoProtocolPicks,
      formationMode,
      formationActions,
      activeFormation,
      formationTitle: FORMATIONS[activeFormation].title,
      formationHistory: [...formationHistory],
      activeOrbitEvent,
      orbitEventTitle: ORBIT_EVENTS[activeOrbitEvent].title,
      orbitEventHistory: [...orbitEventHistory],
      orbitEventActions,
      orbitEventMarkers: eventMarkerGroup.children.length,
      commandMode,
      commandActions,
      commandSavedClicks,
      commandCards: getCommandCards(),
      commandHistory: [...commandHistory],
      lastCommandPlan,
      pressureHotspot: hotspot.lane,
      pressureTitle: hotspot.title,
      pressureScore: hotspot.pressure,
      orbitPressure: pressureSummary(),
      pressureMarkers: pressureMarkerGroup.children.length,
      nextOrbitEventTitle: ORBIT_EVENTS[projected.nextEvent].title,
      projectedThreat: projected.threat,
      projectedDefense: projected.defense,
      riskGrade: getRiskGrade(hotspot.pressure),
      goalsCompleted: doneGoals.length,
      goalIdsDone: doneGoals.map((goal) => goal.id),
      nextGoal: nextGoal?.id ?? "freeplay",
      tacticActions,
      combatLog,
      target: { x: Number(target.x.toFixed(2)), y: Number(target.y.toFixed(2)), z: Number(target.z.toFixed(2)) },
      camera: {
        x: Number(camera.position.x.toFixed(2)),
        y: Number(camera.position.y.toFixed(2)),
        z: Number(camera.position.z.toFixed(2)),
      },
    };
  }

  function installDebugApi() {
    window.__orbitDefenseDebug = {
      state: () => getDebugState(),
      deploy: (kind = selected) => {
        deploy(kind);
        return getDebugState();
      },
      upgrade: () => {
        upgradeWeakest();
        return getDebugState();
      },
      forceWave: () => {
        resolveWave();
        return getDebugState();
      },
      tactic: () => {
        runTactic();
        return getDebugState();
      },
      command: (kind) => executeCommandCard(kind ?? pickCommandCard().kind),
      formation: (kind) => {
        setFormation(kind);
        return getDebugState();
      },
      chooseProtocol: (kind) => {
        chooseBestProtocol(kind);
        return getDebugState();
      },
      autoRun: (steps = 12) => autoRun(steps),
    };
  }
}
