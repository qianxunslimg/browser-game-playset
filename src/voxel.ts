import * as THREE from "three";

type VoxelKind = "dirt" | "stone" | "ore" | "crystal";
type BuildKind = "stone" | "bridge" | "turret" | "drill" | "reactor";
type ResourceKind = "rock" | "ore" | "crystal" | "alloy" | "energy" | "data";
type TechKind = "scanner" | "excavator" | "reactor" | "armor" | "rail";
type VeinKind = "rockPocket" | "orePocket" | "crystalBloom" | "unstableRift";
type RaidEventKind = "quiet" | "droneSwarm" | "shieldedMiner" | "crystalStorm";
type BuildPlanStage = "bridge" | "defense" | "drill" | "reactor" | "freeform";
type WorkOrderKind = "mine" | "refine" | "build";

interface BuildPlanNode {
  kind: BuildKind;
  x: number;
  z: number;
  stage: BuildPlanStage;
}

interface WorkOrderCard {
  kind: WorkOrderKind;
  title: string;
  detail: string;
  tag: string;
  ready: boolean;
}

interface ExcavationHint {
  title: string;
  x: number;
  z: number;
  color: number;
  reason: string;
}

interface VoxelDebugState {
  mode: "voxel";
  voxels: number;
  mined: Record<VoxelKind, number>;
  resources: Record<ResourceKind, number>;
  acquired: Record<ResourceKind, number>;
  built: Record<BuildKind, number>;
  blueprintMode: boolean;
  blueprintActions: number;
  buildPlanMode: boolean;
  buildPlanStage: BuildPlanStage;
  planGhosts: number;
  logisticsLinks: number;
  powerGrid: number;
  lastBuildPlan: string;
  workOrderMode: boolean;
  workOrderActions: number;
  workOrderCards: WorkOrderCard[];
  workOrderHistory: string[];
  lastWorkOrderPlan: string;
  excavationFocus: string;
  excavationHints: string[];
  excavationMarkers: number;
  blockedPlanNodes: number;
  materialShortage: string;
  scanMode: boolean;
  scanActions: number;
  activeVein: VeinKind;
  veinTitle: string;
  veinMarkers: number;
  veinCharges: number;
  veinBonus: Record<ResourceKind, number>;
  activeRaidEvent: RaidEventKind;
  raidEventTitle: string;
  raidEventHistory: string[];
  raidEventActions: number;
  techCount: number;
  techLevels: Record<TechKind, number>;
  techNames: string[];
  workshopScore: number;
  threatScore: number;
  lastReport: string;
  goalsCompleted: number;
  goalIdsDone: string[];
  nextGoal: string;
  coreHp: number;
  raid: number;
  depth: number;
  selected: BuildKind;
  target: { x: number; y: number; z: number };
  camera: { x: number; y: number; z: number };
}

declare global {
  interface Window {
    __voxelForgeDebug?: {
      state: () => VoxelDebugState;
      mine: (kind?: VoxelKind) => VoxelDebugState;
      refine: () => VoxelDebugState;
      build: (kind?: BuildKind) => VoxelDebugState;
      workOrder: (kind?: WorkOrderKind) => VoxelDebugState;
      scan: (kind?: VeinKind) => VoxelDebugState;
      blueprint: (steps?: number) => VoxelDebugState;
      research: (kind?: TechKind) => VoxelDebugState;
      smartAction: () => VoxelDebugState;
      autoRun: (steps?: number) => VoxelDebugState;
      forceRaid: () => VoxelDebugState;
    };
  }
}

const VOXEL_META: Record<VoxelKind, { name: string; color: number; yield: Partial<Record<ResourceKind, number>> }> = {
  dirt: { name: "土", color: 0x6b4d2e, yield: { rock: 1 } },
  stone: { name: "岩", color: 0x6f7b84, yield: { rock: 2 } },
  ore: { name: "矿", color: 0xb06b38, yield: { ore: 2, rock: 1 } },
  crystal: { name: "晶", color: 0x56d7ff, yield: { crystal: 1, energy: 1 } },
};

const BUILD_META: Record<BuildKind, { name: string; color: number; cost: Partial<Record<ResourceKind, number>> }> = {
  stone: { name: "岩块", color: 0x8b969d, cost: { rock: 2 } },
  bridge: { name: "桥板", color: 0xb8834c, cost: { rock: 2, alloy: 1 } },
  turret: { name: "晶炮", color: 0x5ee7ff, cost: { alloy: 2, crystal: 1, energy: 1 } },
  drill: { name: "矿钻", color: 0xffb45f, cost: { rock: 4, alloy: 2, energy: 1 } },
  reactor: { name: "能量塔", color: 0x8c7dff, cost: { alloy: 3, crystal: 2, energy: 2 } },
};

const RESOURCE_LABELS: Record<ResourceKind, string> = {
  rock: "碎岩",
  ore: "矿石",
  crystal: "晶体",
  alloy: "合金",
  energy: "能量",
  data: "蓝图",
};

const TECH_META: Record<TechKind, { name: string; description: string }> = {
  scanner: { name: "脉冲扫描", description: "挖矿额外产出蓝图数据" },
  excavator: { name: "深钻齿轮", description: "矿钻每轮追加矿石和碎岩" },
  reactor: { name: "晶核稳压", description: "能量塔和晶炮防守更强" },
  armor: { name: "核心护甲", description: "矿袭漏伤降低" },
  rail: { name: "轨桥工法", description: "桥板提供额外防守评分" },
};

const VEIN_META: Record<VeinKind, { title: string; color: number; target: VoxelKind[]; bonus: Partial<Record<ResourceKind, number>> }> = {
  rockPocket: { title: "碎岩空腔", color: 0xa9b8bf, target: ["stone", "dirt"], bonus: { rock: 2, data: 1 } },
  orePocket: { title: "富矿口袋", color: 0xffa95f, target: ["ore"], bonus: { ore: 2, alloy: 1, data: 1 } },
  crystalBloom: { title: "晶簇花园", color: 0x62ecff, target: ["crystal"], bonus: { crystal: 1, energy: 2, data: 1 } },
  unstableRift: { title: "躁动裂隙", color: 0xff5fd8, target: ["ore", "crystal"], bonus: { crystal: 1, data: 3 } },
};

const RAID_EVENT_META: Record<
  RaidEventKind,
  { title: string; color: number; threatMultiplier: number; threatBonus: number; damageMultiplier: number; dataReward: number; enemyCount: number }
> = {
  quiet: { title: "静默回波", color: 0x8fa2ad, threatMultiplier: 1, threatBonus: 0, damageMultiplier: 1, dataReward: 0, enemyCount: 4 },
  droneSwarm: { title: "碎钻蜂群", color: 0xff6f6f, threatMultiplier: 1.04, threatBonus: 4, damageMultiplier: 0.85, dataReward: 1, enemyCount: 7 },
  shieldedMiner: { title: "护盾矿兽", color: 0xffc15a, threatMultiplier: 1.08, threatBonus: 6, damageMultiplier: 1.02, dataReward: 2, enemyCount: 5 },
  crystalStorm: { title: "晶尘风暴", color: 0xbe78ff, threatMultiplier: 1.1, threatBonus: 8, damageMultiplier: 0.9, dataReward: 3, enemyCount: 8 },
};

const RESOURCE_ORDER: ResourceKind[] = ["rock", "ore", "crystal", "alloy", "energy", "data"];
const BUILD_ORDER: BuildKind[] = ["stone", "bridge", "turret", "drill", "reactor"];
const TECH_ORDER: TechKind[] = ["scanner", "excavator", "reactor", "armor", "rail"];
const GRID = 13;

const BUILD_PLAN: BuildPlanNode[] = [
  { kind: "bridge", x: 2, z: -1, stage: "bridge" },
  { kind: "bridge", x: 2, z: 0, stage: "bridge" },
  { kind: "bridge", x: 2, z: 1, stage: "bridge" },
  { kind: "turret", x: -1, z: 1, stage: "defense" },
  { kind: "turret", x: 1, z: -1, stage: "defense" },
  { kind: "drill", x: -3, z: 2, stage: "drill" },
  { kind: "drill", x: 3, z: -3, stage: "drill" },
  { kind: "reactor", x: 1, z: 1, stage: "reactor" },
  { kind: "reactor", x: -1, z: -1, stage: "reactor" },
];

const BUILD_STAGE_LABELS: Record<BuildPlanStage, string> = {
  bridge: "跨隙",
  defense: "防线",
  drill: "采掘",
  reactor: "供能",
  freeform: "自由扩建",
};

interface GoalContext {
  mined: Record<VoxelKind, number>;
  resources: Record<ResourceKind, number>;
  acquired: Record<ResourceKind, number>;
  built: Record<BuildKind, number>;
  coreHp: number;
  raid: number;
  depth: number;
  techCount: number;
}

const GOALS: Array<{ id: string; title: string; description: string; check: (context: GoalContext) => boolean }> = [
  { id: "first-rock", title: "破开岩层", description: "累计获得 6 份碎岩", check: ({ acquired }) => acquired.rock >= 6 },
  { id: "ore-pocket", title: "找到矿脉", description: "累计采到 4 份矿石", check: ({ acquired }) => acquired.ore >= 4 },
  { id: "crystal-vein", title: "点亮晶脉", description: "累计采到 2 枚晶体", check: ({ acquired }) => acquired.crystal >= 2 },
  { id: "refine", title: "精炼合金", description: "累计炼出 3 份合金", check: ({ acquired }) => acquired.alloy >= 3 },
  { id: "bridge", title: "跨过裂隙", description: "建造 2 块桥板", check: ({ built }) => built.bridge >= 2 },
  { id: "turret", title: "架起晶炮", description: "建造 1 座晶炮", check: ({ built }) => built.turret >= 1 },
  { id: "drill", title: "启动矿钻", description: "建造 1 台矿钻", check: ({ built }) => built.drill >= 1 },
  { id: "reactor", title: "立起能量塔", description: "建造 1 座能量塔", check: ({ built }) => built.reactor >= 1 },
  { id: "research", title: "装载研究", description: "装载 3 项工坊协议", check: ({ techCount }) => techCount >= 3 },
  { id: "raid", title: "守住矿袭", description: "核心生命保持 70+", check: ({ coreHp, raid, built }) => raid >= 1 && coreHp >= 70 && built.turret >= 1 },
  { id: "raid-3", title: "稳住三轮", description: "守住 3 次矿袭", check: ({ coreHp, raid, built }) => raid >= 3 && coreHp >= 70 && built.turret >= 1 },
];

export function startVoxelForge(root: HTMLElement) {
  root.replaceChildren();
  root.className = "voxel-shell";

  const canvasWrap = document.createElement("div");
  canvasWrap.className = "voxel-canvas";
  root.append(canvasWrap);

  const hud = document.createElement("div");
  hud.className = "voxel-hud";
  hud.innerHTML = `
    <div class="voxel-title">深岩工坊</div>
    <div class="voxel-stat" data-core>核心 100 · 深度 1</div>
    <div class="voxel-resources" data-resources></div>
    <div class="voxel-techs" data-techs></div>
    <div class="voxel-goals" data-goals></div>
    <div class="voxel-tip" data-tip>挖矿、精炼、搭桥、架炮，守住地底核心。</div>
    <div class="voxel-actions">
      <button type="button" data-blueprint>蓝图托管</button>
      <button type="button" data-scan>矿脉扫描</button>
      <button type="button" data-smart>执行工序</button>
      <button type="button" data-refine>精炼</button>
      <a class="voxel-link" href="/">游戏大厅</a>
      <a class="voxel-link" href="/?game=cabin">林间求生</a>
    </div>
  `;
  root.append(hud);

  const commandPanel = document.createElement("div");
  commandPanel.className = "voxel-command";
  commandPanel.innerHTML = `
    <div class="voxel-command-head">
      <strong>工序指挥</strong>
      <span data-voxel-grade>待命</span>
    </div>
    <div class="voxel-survey" data-voxel-survey></div>
    <div class="voxel-cards" data-voxel-cards></div>
  `;
  root.append(commandPanel);

  const hotbar = document.createElement("div");
  hotbar.className = "voxel-hotbar";
  root.append(hotbar);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x16202d);
  scene.fog = new THREE.Fog(0x16202d, 16, 44);

  const camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 0.1, 120);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvasWrap.append(renderer.domElement);

  const ambient = new THREE.HemisphereLight(0x9ee7ff, 0x20140f, 1.5);
  scene.add(ambient);
  const keyLight = new THREE.DirectionalLight(0xffd7a1, 2.2);
  keyLight.position.set(8, 14, 8);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const target = new THREE.Vector3(0, 0.8, 0);
  const cameraState = { theta: Math.PI * 0.23, phi: 1.03, radius: 15.5 };
  let selected: BuildKind = "stone";
  let dragging = false;
  let movedDuringDrag = false;
  let lastPointer = { x: 0, y: 0 };
  let lastTip = "挖矿、精炼、搭桥、架炮，守住地底核心。";
  let blueprintMode = false;
  let blueprintActions = 0;
  let buildPlanMode = true;
  let workOrderMode = true;
  let workOrderActions = 0;
  let lastWorkOrderPlan = "等待矿脉扫描。";
  let lastBuildPlan = "跨隙蓝图待命";
  let scanMode = true;
  let scanActions = 0;
  let activeVein: VeinKind = "rockPocket";
  let veinCharges = 0;
  let lastScanAtBlueprint = -1;
  let activeRaidEvent: RaidEventKind = "quiet";
  let raidEventActions = 0;
  let lastReport = "工坊待命。";
  let coreHp = 100;
  let depth = 1;
  let raid = 0;

  const resources: Record<ResourceKind, number> = { rock: 2, ore: 0, crystal: 0, alloy: 0, energy: 1, data: 0 };
  const acquired: Record<ResourceKind, number> = { ...resources };
  const veinBonus: Record<ResourceKind, number> = { rock: 0, ore: 0, crystal: 0, alloy: 0, energy: 0, data: 0 };
  const raidEventHistory: RaidEventKind[] = [];
  const workOrderHistory: string[] = [];
  const mined: Record<VoxelKind, number> = { dirt: 0, stone: 0, ore: 0, crystal: 0 };
  const built: Record<BuildKind, number> = { stone: 0, bridge: 0, turret: 0, drill: 0, reactor: 0 };
  const techLevels: Record<TechKind, number> = { scanner: 0, excavator: 0, reactor: 0, armor: 0, rail: 0 };
  const voxelMaterials = createVoxelMaterials();
  const buildMaterials = createBuildMaterials();
  const voxels = new Map<string, THREE.Mesh>();
  const builtBlocks = new Map<string, THREE.Mesh>();
  const voxelMeshes: THREE.Mesh[] = [];
  const buildMeshes: THREE.Mesh[] = [];
  const enemies: THREE.Group[] = [];
  const scanMarkers: THREE.Group[] = [];
  const buildPlanMarkers: THREE.Group[] = [];
  const scanMarkerGroup = new THREE.Group();
  const buildPlanGroup = new THREE.Group();
  const logisticsGroup = new THREE.Group();
  const excavationHintGroup = new THREE.Group();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hover = createHoverMarker();

  scene.add(hover);
  scene.add(scanMarkerGroup);
  scene.add(buildPlanGroup);
  scene.add(logisticsGroup);
  scene.add(excavationHintGroup);
  createCavern();
  createVoxelField();
  refreshBuildPlanMarkers();
  refreshVeinMarkers(false);
  refreshExcavationHints();
  createCore();
  createHotbar();
  installEvents();
  installDebugApi();
  updateCamera();
  updateHud();
  animate();

  function createVoxelMaterials() {
    const result = {} as Record<VoxelKind, THREE.MeshStandardMaterial>;
    for (const kind of Object.keys(VOXEL_META) as VoxelKind[]) {
      result[kind] = new THREE.MeshStandardMaterial({
        color: VOXEL_META[kind].color,
        roughness: kind === "crystal" ? 0.36 : 0.9,
        emissive: kind === "crystal" ? new THREE.Color(0x154a66) : new THREE.Color(0x000000),
        emissiveIntensity: kind === "crystal" ? 0.7 : 0,
      });
    }
    return result;
  }

  function createBuildMaterials() {
    const result = {} as Record<BuildKind, THREE.MeshStandardMaterial>;
    for (const kind of BUILD_ORDER) {
      result[kind] = new THREE.MeshStandardMaterial({
        color: BUILD_META[kind].color,
        roughness: kind === "turret" ? 0.38 : 0.82,
        emissive: kind === "turret" ? new THREE.Color(0x114d66) : new THREE.Color(0x000000),
        emissiveIntensity: kind === "turret" ? 0.6 : 0,
      });
    }
    return result;
  }

  function createCavern() {
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(22, 0.35, 22),
      new THREE.MeshStandardMaterial({ color: 0x302a25, roughness: 0.94 }),
    );
    floor.position.y = -0.24;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(20, 20, 0x5c6d72, 0x3c494d);
    grid.position.y = 0.02;
    scene.add(grid);

    const pitMaterial = new THREE.MeshStandardMaterial({ color: 0x111820, roughness: 0.96 });
    for (let z = -4; z <= 4; z += 1) {
      const pit = new THREE.Mesh(new THREE.BoxGeometry(1, 0.12, 1), pitMaterial);
      pit.position.set(2, 0.03, z);
      pit.receiveShadow = true;
      scene.add(pit);
    }

    for (let i = 0; i < 18; i += 1) {
      const stalagmite = new THREE.Mesh(
        new THREE.ConeGeometry(0.18 + (i % 3) * 0.04, 0.7 + (i % 4) * 0.18, 5),
        new THREE.MeshStandardMaterial({ color: 0x516066, roughness: 0.92 }),
      );
      const angle = i * 2.38;
      const radius = 6.2 + (i % 5);
      stalagmite.position.set(Math.cos(angle) * radius, 0.35, Math.sin(angle) * radius);
      stalagmite.castShadow = true;
      scene.add(stalagmite);
    }
  }

  function createVoxelField() {
    for (let x = -6; x <= 6; x += 1) {
      for (let z = -6; z <= 6; z += 1) {
        if (Math.abs(x) <= 1 && Math.abs(z) <= 1) continue;
        if (Math.abs(x - 2) <= 1 && Math.abs(z) <= 4) continue;
        const dist = Math.hypot(x, z);
        if (dist < 3.2 && (x + z) % 2 === 0) continue;
        const kind = pickVoxelKind(x, z, dist);
        addVoxel(x, z, kind);
      }
    }
  }

  function pickVoxelKind(x: number, z: number, dist: number): VoxelKind {
    if ((x === -5 && z === 3) || (x === 5 && z === -4) || (Math.abs(x) === 6 && z === 1)) return "crystal";
    if ((x + z * 2) % 5 === 0 || dist > 6.5) return "ore";
    if ((x * 3 + z) % 4 === 0) return "stone";
    return "dirt";
  }

  function addVoxel(x: number, z: number, kind: VoxelKind) {
    const height = kind === "crystal" ? 1.22 : kind === "ore" ? 1.05 : 0.92;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.96, height, 0.96), voxelMaterials[kind]);
    mesh.position.set(x, height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.kind = kind;
    mesh.userData.baseScale = mesh.scale.clone();
    voxels.set(`${x},${z}`, mesh);
    voxelMeshes.push(mesh);
    scene.add(mesh);
  }

  function createCore() {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 1.05, 0.42, 12), buildMaterials.stone);
    base.position.set(0, 0.21, 0);
    base.castShadow = true;
    scene.add(base);

    const core = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.72, 0),
      new THREE.MeshStandardMaterial({ color: 0xffd56a, emissive: 0xff9f2f, emissiveIntensity: 1.35, roughness: 0.42 }),
    );
    core.position.set(0, 1.08, 0);
    core.castShadow = true;
    scene.add(core);

    const light = new THREE.PointLight(0xffb45f, 3.2, 11);
    light.position.set(0, 1.4, 0);
    scene.add(light);
  }

  function createHoverMarker() {
    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(1.04, 0.08, 1.04),
      new THREE.MeshBasicMaterial({ color: 0x5ee7ff, transparent: true, opacity: 0.5 }),
    );
    marker.visible = false;
    return marker;
  }

  function getBuildPlanStage(): BuildPlanStage {
    if (built.bridge < 2) return "bridge";
    if (built.turret < 1) return "defense";
    if (built.drill < 1) return "drill";
    if (built.reactor < 1) return "reactor";
    return "freeform";
  }

  function createPlanLabelSprite(text: string, color: number) {
    const canvas = document.createElement("canvas");
    canvas.width = 192;
    canvas.height = 72;
    const context = canvas.getContext("2d");
    if (context) {
      const cssColor = `#${color.toString(16).padStart(6, "0")}`;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgba(6, 16, 22, 0.72)";
      context.strokeStyle = cssColor;
      context.lineWidth = 3;
      context.beginPath();
      context.roundRect(12, 14, 168, 44, 8);
      context.fill();
      context.stroke();
      context.fillStyle = "#f4fbff";
      context.font = "900 24px system-ui, -apple-system, Segoe UI, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(text, 96, 36);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
    sprite.scale.set(1.1, 0.42, 1);
    return sprite;
  }

  function clearGroupObjects(group: THREE.Group, store?: THREE.Group[]) {
    if (store) store.splice(0);
    for (const child of [...group.children]) {
      group.remove(child);
      child.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material.dispose();
        } else if (object instanceof THREE.Sprite) {
          const material = object.material;
          material.map?.dispose();
          material.dispose();
        }
      });
    }
  }

  function refreshBuildPlanMarkers() {
    clearGroupObjects(buildPlanGroup, buildPlanMarkers);
    const stage = getBuildPlanStage();
    if (!buildPlanMode) {
      refreshLogisticsLinks();
      return 0;
    }
    let visible = 0;
    for (const node of BUILD_PLAN) {
      const occupied = builtBlocks.has(`${node.x},${node.z}`);
      const blocked = voxels.has(`${node.x},${node.z}`);
      if (occupied) continue;
      const meta = BUILD_META[node.kind];
      const isActive = stage === node.stage || (stage === "freeform" && node.stage === "reactor");
      const group = new THREE.Group();
      group.position.set(node.x, 0.09, node.z);
      group.userData.node = node;

      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(0.92, 0.045, 0.92),
        new THREE.MeshBasicMaterial({
          color: meta.color,
          transparent: true,
          opacity: blocked ? 0.1 : isActive ? 0.34 : 0.17,
          depthWrite: false,
        }),
      );
      group.add(pad);

      const frame = new THREE.Mesh(
        new THREE.TorusGeometry(0.48, 0.018, 6, 4),
        new THREE.MeshBasicMaterial({ color: meta.color, transparent: true, opacity: isActive ? 0.82 : 0.4 }),
      );
      frame.rotation.x = Math.PI * 0.5;
      frame.rotation.z = Math.PI * 0.25;
      group.add(frame);

      const label = createPlanLabelSprite(blocked ? "先挖" : BUILD_STAGE_LABELS[node.stage], meta.color);
      label.position.y = 1.0;
      group.add(label);

      buildPlanGroup.add(group);
      buildPlanMarkers.push(group);
      visible += 1;
    }
    lastBuildPlan = `${BUILD_STAGE_LABELS[stage]}蓝图 · 待建 ${visible}`;
    refreshLogisticsLinks();
    return visible;
  }

  function refreshLogisticsLinks() {
    clearGroupObjects(logisticsGroup);
    const builtItems = [...buildMeshes].filter((mesh) => {
      const kind = mesh.userData.kind as BuildKind | undefined;
      return kind === "turret" || kind === "drill" || kind === "reactor" || kind === "bridge";
    });
    for (const mesh of builtItems) {
      const dx = mesh.position.x;
      const dz = mesh.position.z;
      const length = Math.max(0.2, Math.hypot(dx, dz));
      const color = mesh.userData.kind === "reactor" ? 0x9b8cff : mesh.userData.kind === "drill" ? 0xffb45f : 0x5ee7ff;
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, 0.045, length),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.42 }),
      );
      line.position.set(dx / 2, 0.1, dz / 2);
      line.rotation.y = Math.atan2(dx, dz);
      logisticsGroup.add(line);
    }
  }

  function getBlockedPlanNodes() {
    return BUILD_PLAN.filter((node) => !builtBlocks.has(`${node.x},${node.z}`) && voxels.has(`${node.x},${node.z}`)).length;
  }

  function getNextBuildKind(): BuildKind {
    const stage = getBuildPlanStage();
    return stage === "bridge" ? "bridge" : stage === "defense" ? "turret" : stage === "drill" ? "drill" : stage === "reactor" ? "reactor" : "reactor";
  }

  function getMaterialShortage(kind = getNextBuildKind()) {
    const missing = Object.entries(BUILD_META[kind].cost)
      .map(([resource, amount]) => {
        const current = resources[resource as ResourceKind];
        return current >= amount ? null : `${RESOURCE_LABELS[resource as ResourceKind]}-${amount - current}`;
      })
      .filter(Boolean);
    return missing.length > 0 ? missing.join("/") : "材料就绪";
  }

  function pickMineKindForShortage(): VoxelKind {
    const shortage = getMaterialShortage();
    if (shortage.includes("晶体") || shortage.includes("能量")) return "crystal";
    if (shortage.includes("矿石") || shortage.includes("合金")) return "ore";
    if (shortage.includes("碎岩")) return resources.rock < 2 ? "dirt" : "stone";
    const next = getNextGoal();
    if (next?.id === "crystal-vein" || next?.id === "reactor" || next?.id === "turret") return "crystal";
    if (next?.id === "ore-pocket" || next?.id === "refine") return "ore";
    return activeVein === "crystalBloom" ? "crystal" : activeVein === "orePocket" || activeVein === "unstableRift" ? "ore" : "stone";
  }

  function findVoxelTarget(kind: VoxelKind) {
    const preferred = voxelMeshes.filter((mesh) => mesh.userData.kind === kind);
    const pool = preferred.length > 0 ? preferred : voxelMeshes;
    return [...pool].sort((a, b) => Math.hypot(a.position.x, a.position.z) - Math.hypot(b.position.x, b.position.z))[0] ?? null;
  }

  function getExcavationHints(): ExcavationHint[] {
    const hints: ExcavationHint[] = [];
    for (const node of BUILD_PLAN) {
      const key = `${node.x},${node.z}`;
      const blocked = voxels.get(key);
      if (!blocked || builtBlocks.has(key)) continue;
      hints.push({
        title: `${BUILD_STAGE_LABELS[node.stage]}清障`,
        x: node.x,
        z: node.z,
        color: BUILD_META[node.kind].color,
        reason: `先挖开再建${BUILD_META[node.kind].name}`,
      });
      if (hints.length >= 2) break;
    }
    const mineKind = pickMineKindForShortage();
    const targetVoxel = findVoxelTarget(mineKind);
    if (targetVoxel) {
      hints.push({
        title: `${VOXEL_META[mineKind].name}层优先`,
        x: Math.round(targetVoxel.position.x),
        z: Math.round(targetVoxel.position.z),
        color: VOXEL_META[mineKind].color,
        reason: getMaterialShortage(),
      });
    }
    if (hints.length === 0) {
      const next = getNextGoal();
      hints.push({
        title: next?.title ?? "自由扩建",
        x: 0,
        z: 0,
        color: 0x5ee7ff,
        reason: lastReport,
      });
    }
    return hints.slice(0, 3);
  }

  function getWorkOrderCards(): WorkOrderCard[] {
    const nextBuild = getNextBuildKind();
    const shortage = getMaterialShortage(nextBuild);
    const blocked = getBlockedPlanNodes();
    const mineKind = pickMineKindForShortage();
    const canRefine = resources.ore >= 2;
    return [
      {
        kind: "mine",
        title: blocked > 0 ? "清障采掘" : "定向采掘",
        detail: blocked > 0 ? `清掉 ${blocked} 个蓝图阻挡点` : `优先挖${VOXEL_META[mineKind].name}层补材料`,
        tag: `${VEIN_META[activeVein].title} · ${veinCharges} 次`,
        ready: voxelMeshes.length > 0,
      },
      {
        kind: "refine",
        title: "精炼补料",
        detail: canRefine ? "矿石转合金并产出蓝图" : "缺矿石，先挖富矿口袋",
        tag: `矿石${resources.ore} · 合金${resources.alloy}`,
        ready: canRefine,
      },
      {
        kind: "build",
        title: "蓝图施工",
        detail: shortage === "材料就绪" ? `建造${BUILD_META[nextBuild].name}` : shortage,
        tag: `${BUILD_STAGE_LABELS[getBuildPlanStage()]} · 电网${getPowerGridScore()}`,
        ready: shortage === "材料就绪" && getBlockedPlanNodes() < 4,
      },
    ];
  }

  function executeWorkOrder(kind: WorkOrderKind) {
    workOrderMode = true;
    workOrderActions += 1;
    const card = getWorkOrderCards().find((item) => item.kind === kind) ?? getWorkOrderCards()[0];
    if (kind === "refine") {
      if (resources.ore >= 2) refineAlloy();
      else {
        if (activeVein !== "orePocket") scanVein("orePocket");
        mineKind("ore");
      }
    } else if (kind === "build") {
      const nextBuild = getNextBuildKind();
      if (getMaterialShortage(nextBuild) !== "材料就绪") ensureResourcesFor(nextBuild);
      else buildNext(nextBuild);
    } else {
      const blockedNode = BUILD_PLAN.find((node) => !builtBlocks.has(`${node.x},${node.z}`) && voxels.has(`${node.x},${node.z}`));
      const blockedMesh = blockedNode ? voxels.get(`${blockedNode.x},${blockedNode.z}`) : null;
      if (blockedMesh) mineMesh(blockedMesh);
      else {
        const targetKind = pickMineKindForShortage();
        if (preferredVeinForGoal(getNextGoal()?.id ?? "") && veinCharges <= 0) scanVein(preferredVeinForGoal(getNextGoal()?.id ?? "") ?? activeVein);
        mineKind(targetKind);
      }
    }
    recordWorkOrder(card);
    refreshExcavationHints();
    updateHud();
    return getDebugState();
  }

  function recordWorkOrder(card: WorkOrderCard) {
    lastWorkOrderPlan = `${card.title}：${card.detail}`;
    workOrderHistory.push(lastWorkOrderPlan);
    if (workOrderHistory.length > 7) workOrderHistory.shift();
  }

  function refreshExcavationHints() {
    clearGroupObjects(excavationHintGroup);
    const hints = getExcavationHints();
    for (const hint of hints) {
      const group = new THREE.Group();
      group.position.set(hint.x, 0.14, hint.z);
      group.userData.baseY = 0.14;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.62, 0.026, 8, 32),
        new THREE.MeshBasicMaterial({ color: hint.color, transparent: true, opacity: 0.72 }),
      );
      ring.rotation.x = Math.PI * 0.5;
      const pin = new THREE.Mesh(
        new THREE.ConeGeometry(0.13, 0.52, 8),
        new THREE.MeshBasicMaterial({ color: hint.color, transparent: true, opacity: 0.76 }),
      );
      pin.position.y = 0.58;
      const label = createPlanLabelSprite(hint.title, hint.color);
      label.position.y = 1.28;
      group.add(ring, pin, label);
      excavationHintGroup.add(group);
    }
    return hints.length;
  }

  function updateWorkOrderPanel() {
    const stage = getBuildPlanStage();
    const cards = getWorkOrderCards();
    const hints = getExcavationHints();
    commandPanel.querySelector("[data-voxel-grade]")!.textContent =
      `${BUILD_STAGE_LABELS[stage]} · ${getMaterialShortage()}`;
    commandPanel.querySelector("[data-voxel-survey]")!.innerHTML = hints
      .map((hint) => `<div><span><i style="background:#${hint.color.toString(16).padStart(6, "0")}"></i>${hint.title}</span><b>${Math.hypot(hint.x, hint.z).toFixed(0)}m</b><small>${hint.reason}</small></div>`)
      .join("");
    commandPanel.querySelector("[data-voxel-cards]")!.innerHTML = cards
      .map(
        (card) => `
          <button type="button" class="voxel-card ${card.ready ? "ready" : ""}" data-work-order="${card.kind}">
            <span>${card.title}</span>
            <strong>${card.detail}</strong>
            <small>${card.tag}</small>
          </button>
        `,
      )
      .join("");
  }

  function getPowerGridScore() {
    return Math.round(
      built.reactor * 34 +
        built.turret * 16 +
        built.drill * 12 +
        built.bridge * 4 +
        logisticsGroup.children.length * 3 +
        techLevels.reactor * 10 +
        techLevels.rail * 6,
    );
  }

  function createHotbar() {
    for (const kind of BUILD_ORDER) {
      const button = document.createElement("button");
      button.className = "voxel-slot";
      button.type = "button";
      button.dataset.kind = kind;
      button.innerHTML = `<span class="voxel-swatch" style="background:#${BUILD_META[kind].color.toString(16).padStart(6, "0")}"></span><span>${BUILD_META[kind].name}</span><small>${costText(kind)}</small>`;
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
    hud.querySelector<HTMLButtonElement>("[data-blueprint]")?.addEventListener("click", () => runBlueprint(8));
    hud.querySelector<HTMLButtonElement>("[data-scan]")?.addEventListener("click", () => scanVein());
    hud.querySelector<HTMLButtonElement>("[data-smart]")?.addEventListener("click", () => runWorkOrder(4));
    hud.querySelector<HTMLButtonElement>("[data-refine]")?.addEventListener("click", () => refineAlloy());
    commandPanel.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-work-order]");
      if (!button) return;
      executeWorkOrder(button.dataset.workOrder as WorkOrderKind);
    });
    renderer.domElement.addEventListener("contextmenu", (event) => event.preventDefault());
    renderer.domElement.addEventListener("pointerdown", (event) => {
      dragging = true;
      movedDuringDrag = false;
      lastPointer = { x: event.clientX, y: event.clientY };
      renderer.domElement.setPointerCapture(event.pointerId);
    });
    renderer.domElement.addEventListener("pointermove", (event) => {
      updateHover(event);
      if (!dragging) return;
      const dx = event.clientX - lastPointer.x;
      const dy = event.clientY - lastPointer.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) movedDuringDrag = true;
      cameraState.theta -= dx * 0.006;
      cameraState.phi = THREE.MathUtils.clamp(cameraState.phi + dy * 0.004, 0.4, 1.24);
      lastPointer = { x: event.clientX, y: event.clientY };
      updateCamera();
    });
    renderer.domElement.addEventListener("pointerup", (event) => {
      dragging = false;
      renderer.domElement.releasePointerCapture(event.pointerId);
      if (movedDuringDrag) return;
      if (event.button === 2) buildSelectedAtPointer(event);
      else mineAtPointer(event);
    });
    renderer.domElement.addEventListener("wheel", (event) => {
      cameraState.radius = THREE.MathUtils.clamp(cameraState.radius + event.deltaY * 0.01, 9, 28);
      updateCamera();
    }, { passive: true });
  }

  function onKeyDown(event: KeyboardEvent) {
    const index = Number(event.key) - 1;
    if (index >= 0 && index < BUILD_ORDER.length) {
      selected = BUILD_ORDER[index];
      updateHud();
      return;
    }
    if (event.key.toLowerCase() === "q") {
      smartAction();
      return;
    }
    const step = event.shiftKey ? 1.05 : 0.55;
    if (event.key.toLowerCase() === "w") target.z -= step;
    if (event.key.toLowerCase() === "s") target.z += step;
    if (event.key.toLowerCase() === "a") target.x -= step;
    if (event.key.toLowerCase() === "d") target.x += step;
    target.x = THREE.MathUtils.clamp(target.x, -5.5, 5.5);
    target.z = THREE.MathUtils.clamp(target.z, -5.5, 5.5);
    updateCamera();
  }

  function updatePointer(event: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function mineAtPointer(event: PointerEvent) {
    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(voxelMeshes, false);
    const mesh = hits[0]?.object;
    if (!(mesh instanceof THREE.Mesh)) return;
    mineMesh(mesh);
  }

  function buildSelectedAtPointer(event: PointerEvent) {
    const point = getGroundPoint(event);
    if (!point) return;
    buildAt(point.x, point.z, selected);
  }

  function getGroundPoint(event: PointerEvent) {
    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);
    const hitPoint = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(groundPlane, hitPoint)) return null;
    return {
      x: THREE.MathUtils.clamp(Math.round(hitPoint.x), -6, 6),
      z: THREE.MathUtils.clamp(Math.round(hitPoint.z), -6, 6),
    };
  }

  function updateHover(event: PointerEvent) {
    const point = getGroundPoint(event);
    if (!point) {
      hover.visible = false;
      return;
    }
    hover.visible = true;
    hover.position.set(point.x, 0.06, point.z);
  }

  function mineKind(kind: VoxelKind) {
    const mesh = voxelMeshes.find((candidate) => candidate.userData.kind === kind);
    if (!mesh) {
      lastTip = `附近没有${VOXEL_META[kind].name}可挖。`;
      updateHud();
      return;
    }
    mineMesh(mesh);
  }

  function scanVein(kind = pickScanVein()) {
    scanMode = true;
    scanActions += 1;
    activeVein = kind;
    const markers = refreshVeinMarkers(true);
    veinCharges = Math.max(2, markers + (kind === "unstableRift" ? 2 : 1));
    lastScanAtBlueprint = blueprintActions;
    gain("data", kind === "unstableRift" ? 2 : 1);
    lastTip = `脉冲扫描锁定${VEIN_META[kind].title}：下 ${veinCharges} 次匹配采掘有额外产出。`;
    lastReport = `扫描 ${scanActions}：${VEIN_META[kind].title} · 标记 ${markers} 处`;
    pulseAt(0, 0, VEIN_META[kind].color);
    updateHud();
  }

  function pickScanVein(): VeinKind {
    const next = getNextGoal();
    if (next?.id === "first-rock") return "rockPocket";
    if (next?.id === "ore-pocket" || next?.id === "refine") return "orePocket";
    if (next?.id === "crystal-vein" || next?.id === "turret" || next?.id === "reactor") return "crystalBloom";
    if (next?.id === "raid" || next?.id === "raid-3") return "unstableRift";
    if (resources.crystal < 2 || resources.energy < 2) return "crystalBloom";
    if (resources.ore < 3 || resources.alloy < 2) return "orePocket";
    if (resources.data < 3) return "unstableRift";
    return scanActions % 3 === 0 ? "rockPocket" : scanActions % 3 === 1 ? "orePocket" : "crystalBloom";
  }

  function shouldScanBeforeAction() {
    if (!scanMode) return false;
    const next = getNextGoal();
    if (!next) return false;
    const preferred = preferredVeinForGoal(next.id);
    if (preferred && activeVein !== preferred) return true;
    if (veinCharges > 0) return false;
    if (scanActions === 0) return true;
    if (blueprintActions > 0 && blueprintActions % 6 === 0 && lastScanAtBlueprint !== blueprintActions) return true;
    return false;
  }

  function preferredVeinForGoal(goalId: string): VeinKind | null {
    if (goalId === "first-rock") return "rockPocket";
    if (goalId === "ore-pocket" || goalId === "refine") return "orePocket";
    if (goalId === "crystal-vein" || goalId === "turret" || goalId === "reactor") return "crystalBloom";
    if (goalId === "raid" || goalId === "raid-3") return "unstableRift";
    return null;
  }

  function refreshVeinMarkers(resetPulse: boolean) {
    clearScanMarkers();
    const meta = VEIN_META[activeVein];
    const targets = findVeinTargets(activeVein);
    for (const point of targets) createScanMarker(point.x, point.z, meta.color);
    if (resetPulse) {
      for (const point of targets) pulseAt(point.x, point.z, meta.color);
    }
    return targets.length;
  }

  function clearScanMarkers() {
    for (const marker of scanMarkers.splice(0)) {
      scanMarkerGroup.remove(marker);
      marker.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material.dispose();
        }
      });
    }
  }

  function findVeinTargets(kind: VeinKind) {
    const meta = VEIN_META[kind];
    const primary = voxelMeshes.filter((mesh) => meta.target.includes(mesh.userData.kind as VoxelKind));
    const candidates = (primary.length > 0 ? primary : voxelMeshes).slice();
    candidates.sort((left, right) => {
      const leftScore = Math.hypot(left.position.x, left.position.z) + ((left.position.x * 13 + left.position.z * 7) % 3);
      const rightScore = Math.hypot(right.position.x, right.position.z) + ((right.position.x * 13 + right.position.z * 7) % 3);
      return leftScore - rightScore;
    });
    return candidates.slice(0, 5).map((mesh) => ({ x: Math.round(mesh.position.x), z: Math.round(mesh.position.z) }));
  }

  function createScanMarker(x: number, z: number, color: number) {
    const group = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.58, 0.04, 8, 30),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.86 }),
    );
    ring.rotation.x = Math.PI * 0.5;
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.18, 1.35, 8, 1, true),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.22, side: THREE.DoubleSide }),
    );
    beam.position.y = 0.72;
    const pin = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.2, 0),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.82 }),
    );
    pin.position.y = 1.42;
    group.position.set(x, 0.12, z);
    group.userData.baseY = 0.12;
    group.add(ring, beam, pin);
    scanMarkers.push(group);
    scanMarkerGroup.add(group);
  }

  function applyVeinBonus(kind: VoxelKind, x: number, z: number): Partial<Record<ResourceKind, number>> {
    const meta = VEIN_META[activeVein];
    if (veinCharges <= 0 || !meta.target.includes(kind)) return {};
    veinCharges -= 1;
    const bonus = meta.bonus;
    for (const [resource, amount] of Object.entries(bonus)) {
      gain(resource as ResourceKind, amount);
      veinBonus[resource as ResourceKind] += amount;
    }
    pulseAt(x, z, meta.color);
    if (veinCharges <= 0) refreshVeinMarkers(false);
    return bonus;
  }

  function mineMesh(mesh: THREE.Mesh) {
    const kind = mesh.userData.kind as VoxelKind;
    mined[kind] += 1;
    for (const [resource, amount] of Object.entries(VOXEL_META[kind].yield)) {
      gain(resource as ResourceKind, amount);
    }
    const bonus = applyVeinBonus(kind, mesh.position.x, mesh.position.z);
    if (kind === "ore" || kind === "crystal" || techLevels.scanner > 0) gain("data", 1 + techLevels.scanner);
    depth = Math.max(depth, 1 + Math.floor((mined.stone + mined.ore + mined.crystal) / 5));
    pulseAt(mesh.position.x, mesh.position.z, VOXEL_META[kind].color);
    removeVoxel(mesh);
    const bonusText = Object.keys(bonus).length > 0 ? `；${VEIN_META[activeVein].title}加成：${gainText(bonus)}` : "";
    lastTip = `挖开${VOXEL_META[kind].name}层：${gainText(VOXEL_META[kind].yield)}${bonusText}`;
    updateHud();
  }

  function removeVoxel(mesh: THREE.Mesh) {
    const key = `${Math.round(mesh.position.x)},${Math.round(mesh.position.z)}`;
    voxels.delete(key);
    const index = voxelMeshes.indexOf(mesh);
    if (index >= 0) voxelMeshes.splice(index, 1);
    scene.remove(mesh);
    mesh.geometry.dispose();
  }

  function refineAlloy() {
    if (resources.ore < 2) {
      lastTip = "精炼需要矿石 2。";
      updateHud();
      return;
    }
    resources.ore -= 2;
    gain("alloy", 1);
    gain("data", 1);
    lastTip = "熔炉吐出一块合金。";
    pulseAt(-1, -1, 0xffb45f);
    maybeAutoResearch();
    updateHud();
  }

  function smartAction() {
    const next = getNextGoal();
    if (!next) {
      lastTip = "工坊进入自由建造：继续挖深层矿脉或扩防线。";
      updateHud();
      return;
    }
    if (shouldScanBeforeAction()) return scanVein();
    if (acquired.rock < 6) return mineKind(resources.rock < 2 ? "dirt" : "stone");
    if (acquired.ore < 4) return mineKind("ore");
    if (acquired.crystal < 2) return mineKind("crystal");
    if (acquired.alloy < 3) {
      if (resources.ore < 2) return mineKind("ore");
      refineAlloy();
      return;
    }
    if (built.bridge < 2) return buildNext("bridge");
    if (built.turret < 1) {
      if (resources.alloy < 2) {
        if (resources.ore < 2) return mineKind("ore");
        refineAlloy();
        return;
      }
      if (resources.crystal < 1 || resources.energy < 1) return mineKind("crystal");
      return buildNext("turret");
    }
    if (built.drill < 1) {
      ensureResourcesFor("drill");
      if (canAfford("drill")) return buildNext("drill");
      return;
    }
    if (built.reactor < 1) {
      ensureResourcesFor("reactor");
      if (canAfford("reactor")) return buildNext("reactor");
      return;
    }
    if (techCount() < 3) {
      if (!maybeAutoResearch()) mineKind(resources.crystal < 1 ? "crystal" : "ore");
      return;
    }
    if (raid < 3) {
      forceRaid();
      return;
    }
    lastTip = `当前工序：${next.title}`;
    updateHud();
  }

  function runWorkOrder(steps: number) {
    workOrderMode = true;
    for (let i = 0; i < steps; i += 1) {
      const card = getWorkOrderCards().find((item) => item.ready) ?? getWorkOrderCards()[0];
      workOrderActions += 1;
      recordWorkOrder(card);
      smartAction();
    }
    updateHud();
  }

  function runBlueprint(steps: number) {
    blueprintMode = true;
    buildPlanMode = true;
    workOrderMode = true;
    for (let i = 0; i < steps; i += 1) {
      blueprintActions += 1;
      if (i % 4 === 0) {
        const card = getWorkOrderCards().find((item) => item.ready) ?? getWorkOrderCards()[0];
        workOrderActions += 1;
        recordWorkOrder(card);
      }
      smartAction();
      operateDrills();
    }
    refreshBuildPlanMarkers();
    lastReport = `蓝图托管 ${blueprintActions} 步 · ${lastBuildPlan} · 工坊 ${getWorkshopScore()} / 威胁 ${getThreatScore()}`;
    updateHud();
  }

  function ensureResourcesFor(kind: BuildKind) {
    for (const [resource, amount] of Object.entries(BUILD_META[kind].cost)) {
      const current = resources[resource as ResourceKind];
      if (current >= amount) continue;
      if (resource === "rock") return mineKind(current < 2 ? "dirt" : "stone");
      if (resource === "ore") return mineKind("ore");
      if (resource === "alloy") {
        if (resources.ore < 2) return mineKind("ore");
        refineAlloy();
        return;
      }
      if (resource === "crystal" || resource === "energy") return mineKind("crystal");
    }
  }

  function buildNext(kind: BuildKind) {
    if (!canAfford(kind)) {
      lastTip = `${BUILD_META[kind].name}材料不足：需要 ${costText(kind)}`;
      updateHud();
      return;
    }
    const spot = findBuildSpot(kind);
    if (!spot) {
      lastTip = "工坊附近没有空位。";
      updateHud();
      return;
    }
    buildAt(spot[0], spot[1], kind);
  }

  function buildAt(x: number, z: number, kind: BuildKind) {
    if (voxels.has(`${x},${z}`) || builtBlocks.has(`${x},${z}`)) {
      lastTip = "先挖空这里，再建造。";
      updateHud();
      return;
    }
    if (!canAfford(kind)) {
      lastTip = `${BUILD_META[kind].name}材料不足：需要 ${costText(kind)}`;
      updateHud();
      return;
    }
    for (const [resource, amount] of Object.entries(BUILD_META[kind].cost)) {
      resources[resource as ResourceKind] -= amount;
    }
    const mesh = createBuildMesh(kind);
    mesh.position.set(x, kind === "turret" ? 0.78 : 0.22, z);
    mesh.userData.kind = kind;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    built[kind] += 1;
    builtBlocks.set(`${x},${z}`, mesh);
    buildMeshes.push(mesh);
    scene.add(mesh);
    if (kind === "drill") operateDrills();
    if (kind === "reactor") gain("energy", 2);
    refreshBuildPlanMarkers();
    refreshLogisticsLinks();
    lastTip = `建造 ${BUILD_META[kind].name}`;
    maybeAutoResearch();
    updateHud();
  }

  function createBuildMesh(kind: BuildKind) {
    if (kind === "stone" || kind === "bridge") {
      return new THREE.Mesh(new THREE.BoxGeometry(0.92, kind === "bridge" ? 0.22 : 0.46, 0.92), buildMaterials[kind]);
    }
    if (kind === "turret") {
      const turret = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.78, 0.78), buildMaterials.turret);
      const light = new THREE.PointLight(0x66e8ff, 1.8, 6);
      light.position.set(0, 0.72, 0);
      turret.add(light);
      return turret;
    }
    if (kind === "drill") {
      const drill = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.46, 0.9, 8), buildMaterials.drill);
      drill.rotation.z = Math.PI * 0.5;
      const bit = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.48, 8), buildMaterials.stone);
      bit.position.x = 0.58;
      bit.rotation.z = -Math.PI * 0.5;
      drill.add(bit);
      return drill;
    }
    const reactor = new THREE.Mesh(new THREE.OctahedronGeometry(0.58, 0), buildMaterials.reactor);
    const light = new THREE.PointLight(0x9b8cff, 2.4, 8);
    light.position.set(0, 0.8, 0);
    reactor.add(light);
    return reactor;
  }

  function findBuildSpot(kind: BuildKind) {
    const planned = BUILD_PLAN
      .filter((node) => node.kind === kind)
      .map((node) => [node.x, node.z] as [number, number]);
    const preferred: Array<[number, number]> = planned.length > 0 ? planned : kind === "bridge"
      ? [[2, -1], [2, 0], [2, 1], [2, 2]]
      : kind === "turret"
        ? [[-1, 1], [1, -1], [-2, 0], [0, -2]]
        : kind === "drill"
          ? [[-3, 2], [3, -3], [-4, -1], [4, 2]]
          : kind === "reactor"
            ? [[1, 1], [-1, -1], [0, 2]]
            : [[-1, -1], [1, 1], [0, 2]];
    for (const [x, z] of preferred) {
      if (!voxels.has(`${x},${z}`) && !builtBlocks.has(`${x},${z}`)) return [x, z] as [number, number];
    }
    for (let z = -3; z <= 3; z += 1) {
      for (let x = -3; x <= 3; x += 1) {
        if (!voxels.has(`${x},${z}`) && !builtBlocks.has(`${x},${z}`)) return [x, z] as [number, number];
      }
    }
    return null;
  }

  function forceRaid() {
    raid += 1;
    activeRaidEvent = pickRaidEvent();
    raidEventActions += 1;
    raidEventHistory.push(activeRaidEvent);
    const event = RAID_EVENT_META[activeRaidEvent];
    const threat = getThreatScore();
    const defense = getWorkshopScore();
    const damage = Math.max(0, Math.ceil(((threat - defense) / 7) * event.damageMultiplier));
    coreHp = Math.max(0, coreHp - damage);
    spawnRaidEnemies(activeRaidEvent);
    gain("data", 1 + raid + event.dataReward);
    lastReport = `矿袭 ${raid} · ${event.title}：威胁 ${threat} / 工坊 ${defense} / 漏伤 ${damage}`;
    lastTip = damage > 0 ? `${event.title}突破外圈：核心 -${damage}` : `${event.title}被晶炮和能量塔压住，核心无损。`;
    maybeAutoResearch();
    updateHud();
  }

  function pickRaidEvent(): RaidEventKind {
    if (raid <= 1) return "droneSwarm";
    if (raid === 2) return "shieldedMiner";
    if (raid === 3) return "crystalStorm";
    return raid % 3 === 1 ? "droneSwarm" : raid % 3 === 2 ? "shieldedMiner" : "crystalStorm";
  }

  function spawnRaidEnemies(kind: RaidEventKind) {
    for (const enemy of enemies.splice(0)) scene.remove(enemy);
    const meta = RAID_EVENT_META[kind];
    for (let i = 0; i < meta.enemyCount; i += 1) {
      const enemy = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.DodecahedronGeometry(kind === "shieldedMiner" ? 0.34 : 0.27, 0),
        new THREE.MeshStandardMaterial({ color: meta.color, emissive: meta.color, emissiveIntensity: 0.34, roughness: 0.65 }),
      );
      enemy.add(body);
      if (kind === "shieldedMiner") {
        const shield = new THREE.Mesh(
          new THREE.TorusGeometry(0.42, 0.035, 8, 18),
          new THREE.MeshBasicMaterial({ color: 0xffe3a3, transparent: true, opacity: 0.62 }),
        );
        shield.rotation.x = Math.PI * 0.5;
        enemy.add(shield);
      }
      const angle = i * ((Math.PI * 2) / meta.enemyCount);
      const radius = kind === "crystalStorm" ? 5.3 + (i % 2) * 0.35 : 4.5 + (i % 3) * 0.22;
      enemy.position.set(Math.cos(angle) * radius, 0.46, Math.sin(angle) * radius);
      enemy.userData.eventKind = kind;
      enemies.push(enemy);
      scene.add(enemy);
    }
  }

  function canAfford(kind: BuildKind) {
    return Object.entries(BUILD_META[kind].cost).every(([resource, amount]) => resources[resource as ResourceKind] >= amount);
  }

  function gain(resource: ResourceKind, amount: number) {
    resources[resource] += amount;
    acquired[resource] += amount;
  }

  function operateDrills() {
    if (built.drill <= 0) return;
    const oreGain = built.drill * (1 + techLevels.excavator);
    const rockGain = built.drill * (2 + techLevels.excavator);
    gain("ore", oreGain);
    gain("rock", rockGain);
    gain("data", built.drill);
    lastTip = `矿钻轰鸣：矿石 +${oreGain}，碎岩 +${rockGain}`;
    pulseAt(-3, 2, BUILD_META.drill.color);
  }

  function techCount() {
    return TECH_ORDER.reduce((sum, kind) => sum + techLevels[kind], 0);
  }

  function maybeAutoResearch(kind?: TechKind) {
    if (resources.data < 3) return false;
    const choice = kind ?? pickResearch();
    resources.data -= 3;
    techLevels[choice] += 1;
    lastTip = `装载研究：${TECH_META[choice].name}，${TECH_META[choice].description}`;
    lastReport = `研究 ${TECH_META[choice].name} Lv.${techLevels[choice]}`;
    updateHud();
    return true;
  }

  function pickResearch() {
    if (built.drill > 0 && techLevels.excavator < 2) return "excavator";
    if (built.reactor > 0 && techLevels.reactor < 2) return "reactor";
    if (raid > 0 && techLevels.armor < 2) return "armor";
    if (built.bridge >= 2 && techLevels.rail < 1) return "rail";
    return TECH_ORDER.find((kind) => techLevels[kind] === 0) ?? "scanner";
  }

  function getWorkshopScore() {
    return Math.round(
      built.turret * (42 + techLevels.reactor * 10) +
        built.reactor * (34 + techLevels.reactor * 12) +
        built.bridge * (5 + techLevels.rail * 8) +
        built.drill * 6 +
        resources.energy * 5 +
        getPowerGridScore() * 0.28 +
        techCount() * 7,
    );
  }

  function getThreatScore() {
    const event = RAID_EVENT_META[activeRaidEvent];
    return Math.round((52 + raid * 28 + depth * 8) * event.threatMultiplier + event.threatBonus);
  }

  function costText(kind: BuildKind) {
    return Object.entries(BUILD_META[kind].cost)
      .map(([resource, amount]) => `${RESOURCE_LABELS[resource as ResourceKind]} ${amount}`)
      .join(" / ");
  }

  function gainText(yieldMap: Partial<Record<ResourceKind, number>>) {
    return Object.entries(yieldMap)
      .map(([resource, amount]) => `${RESOURCE_LABELS[resource as ResourceKind]} +${amount}`)
      .join("，");
  }

  function pulseAt(x: number, z: number, color: number) {
    const pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 10, 8),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75 }),
    );
    pulse.position.set(x, 0.75, z);
    scene.add(pulse);
    window.setTimeout(() => scene.remove(pulse), 180);
  }

  function updateHud() {
    const planGhosts = refreshBuildPlanMarkers();
    refreshExcavationHints();
    updateWorkOrderPanel();
    hud.querySelector("[data-core]")!.textContent =
      `核心 ${coreHp} · 深度 ${depth} · 矿袭 ${raid} · ${RAID_EVENT_META[activeRaidEvent].title} · 工坊 ${getWorkshopScore()}/${getThreatScore()} · 电网 ${getPowerGridScore()}`;
    hud.querySelector("[data-resources]")!.innerHTML = RESOURCE_ORDER
      .map((kind) => `<span><b>${RESOURCE_LABELS[kind]}</b> ${resources[kind]}</span>`)
      .join("");
    hud.querySelector("[data-techs]")!.innerHTML =
      TECH_ORDER.filter((kind) => techLevels[kind] > 0)
        .map((kind) => `<span><b>${TECH_META[kind].name}</b> Lv.${techLevels[kind]}</span>`)
        .join("") || "<span><b>研究</b> 未装载</span>";
    hud.querySelector("[data-goals]")!.innerHTML = GOALS
      .map((goal) => {
        const done = goal.check(goalContext());
        return `<div class="${done ? "done" : ""}"><span>${done ? "✓" : "·"}</span><strong>${goal.title}</strong><small>${goal.description}</small></div>`;
      })
      .join("");
    hud.querySelector("[data-tip]")!.textContent = lastTip;
    hud.querySelector<HTMLButtonElement>("[data-blueprint]")!.textContent = blueprintMode ? `蓝图托管 ${blueprintActions}` : `蓝图 ${BUILD_STAGE_LABELS[getBuildPlanStage()]} ${planGhosts}`;
    hud.querySelector<HTMLButtonElement>("[data-scan]")!.textContent = `扫描：${VEIN_META[activeVein].title} ${veinCharges}`;
    hud.querySelector<HTMLButtonElement>("[data-smart]")!.textContent = `执行工序：${getNextGoal()?.title ?? "自由挖掘"}`;
    hud.querySelector<HTMLButtonElement>("[data-refine]")!.disabled = resources.ore < 2;
    hotbar.querySelectorAll<HTMLButtonElement>(".voxel-slot").forEach((button) => {
      const kind = button.dataset.kind as BuildKind;
      button.classList.toggle("active", selected === kind);
      button.disabled = !canAfford(kind);
    });
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
    const time = performance.now() * 0.001;
    for (const enemy of enemies) {
      const eventKind = enemy.userData.eventKind as RaidEventKind | undefined;
      enemy.rotation.y += eventKind === "droneSwarm" ? 0.045 : 0.02;
      enemy.position.y = 0.46 + Math.sin(time * (eventKind === "crystalStorm" ? 4.2 : 3) + enemy.position.x) * 0.08;
    }
    for (const marker of scanMarkers) {
      marker.rotation.y += 0.018;
      const scale = 1 + Math.sin(time * 3.4 + marker.position.x) * 0.08;
      marker.scale.setScalar(scale);
      marker.position.y = marker.userData.baseY + Math.sin(time * 2.2 + marker.position.z) * 0.04;
    }
    for (const marker of buildPlanMarkers) {
      marker.rotation.y = Math.sin(time * 1.4 + marker.position.x) * 0.04;
      const scale = 1 + Math.sin(time * 2.1 + marker.position.z) * 0.035;
      marker.scale.setScalar(scale);
    }
    for (const marker of excavationHintGroup.children) {
      marker.rotation.y += 0.018;
      marker.position.y = Number(marker.userData.baseY ?? 0.14) + Math.sin(time * 2.5 + marker.position.x) * 0.035;
    }
    for (const mesh of buildMeshes) {
      const kind = mesh.userData.kind as BuildKind | undefined;
      if (kind === "drill") mesh.rotation.x += 0.045 + techLevels.excavator * 0.01;
      if (kind === "reactor") {
        mesh.rotation.y += 0.018;
        mesh.position.y = 0.78 + Math.sin(time * 2.2) * 0.05;
      }
    }
    renderer.render(scene, camera);
  }

  function goalContext(): GoalContext {
    return { mined, resources, acquired, built, coreHp, raid, depth, techCount: techCount() };
  }

  function getDoneGoals() {
    return GOALS.filter((goal) => goal.check(goalContext()));
  }

  function getNextGoal() {
    return GOALS.find((goal) => !goal.check(goalContext()));
  }

  function getDebugState(): VoxelDebugState {
    const doneGoals = getDoneGoals();
    const nextGoal = getNextGoal();
    const hints = getExcavationHints();
    return {
      mode: "voxel",
      voxels: voxelMeshes.length,
      mined: { ...mined },
      resources: { ...resources },
      acquired: { ...acquired },
      built: { ...built },
      blueprintMode,
      blueprintActions,
      buildPlanMode,
      buildPlanStage: getBuildPlanStage(),
      planGhosts: refreshBuildPlanMarkers(),
      logisticsLinks: logisticsGroup.children.length,
      powerGrid: getPowerGridScore(),
      lastBuildPlan,
      workOrderMode,
      workOrderActions,
      workOrderCards: getWorkOrderCards(),
      workOrderHistory: [...workOrderHistory],
      lastWorkOrderPlan,
      excavationFocus: hints[0]?.title ?? "自由扩建",
      excavationHints: hints.map((hint) => `${hint.title}:${hint.reason}`),
      excavationMarkers: excavationHintGroup.children.length,
      blockedPlanNodes: getBlockedPlanNodes(),
      materialShortage: getMaterialShortage(),
      scanMode,
      scanActions,
      activeVein,
      veinTitle: VEIN_META[activeVein].title,
      veinMarkers: scanMarkers.length,
      veinCharges,
      veinBonus: { ...veinBonus },
      activeRaidEvent,
      raidEventTitle: RAID_EVENT_META[activeRaidEvent].title,
      raidEventHistory: raidEventHistory.map((kind) => RAID_EVENT_META[kind].title),
      raidEventActions,
      techCount: techCount(),
      techLevels: { ...techLevels },
      techNames: TECH_ORDER.filter((kind) => techLevels[kind] > 0).map((kind) => `${TECH_META[kind].name} Lv.${techLevels[kind]}`),
      workshopScore: getWorkshopScore(),
      threatScore: getThreatScore(),
      lastReport,
      goalsCompleted: doneGoals.length,
      goalIdsDone: doneGoals.map((goal) => goal.id),
      nextGoal: nextGoal?.id ?? "freeplay",
      coreHp,
      raid,
      depth,
      selected,
      target: { x: Number(target.x.toFixed(2)), y: Number(target.y.toFixed(2)), z: Number(target.z.toFixed(2)) },
      camera: {
        x: Number(camera.position.x.toFixed(2)),
        y: Number(camera.position.y.toFixed(2)),
        z: Number(camera.position.z.toFixed(2)),
      },
    };
  }

  function installDebugApi() {
    window.__voxelForgeDebug = {
      state: () => getDebugState(),
      mine: (kind = "stone") => {
        mineKind(kind);
        return getDebugState();
      },
      refine: () => {
        refineAlloy();
        return getDebugState();
      },
      build: (kind = selected) => {
        buildNext(kind);
        return getDebugState();
      },
      workOrder: (kind = "mine") => executeWorkOrder(kind),
      scan: (kind) => {
        scanVein(kind);
        return getDebugState();
      },
      blueprint: (steps = 12) => {
        runBlueprint(steps);
        return getDebugState();
      },
      research: (kind) => {
        maybeAutoResearch(kind);
        return getDebugState();
      },
      smartAction: () => {
        smartAction();
        return getDebugState();
      },
      autoRun: (steps = 18) => {
        runWorkOrder(steps);
        return getDebugState();
      },
      forceRaid: () => {
        forceRaid();
        return getDebugState();
      },
    };
  }
}
