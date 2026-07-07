import Phaser from "phaser";
import { startCabinBuilder } from "./cabin";
import { startOrbitalDefense } from "./orbit";
import { startVoxelForge } from "./voxel";
import "./style.css";

type HubGameKey = "tower" | "cabin" | "voxel" | "orbit";
type GameMode = "boot" | "planting" | "wave" | "mutation" | "gameover" | "victory";
type PlantKind = "pea" | "sunflower" | "ice" | "corn" | "thorn";
type ZombieKind = "walker" | "runner" | "cone" | "bucket" | "swarm" | "boss";
type Rarity = "common" | "rare" | "epic";
type BattleEventKind = "calm" | "supplyRain" | "rootBloom" | "fogRaid" | "nightRush";
type DirectorOrderKind = "seedDrop" | "overclock" | "iceNet" | "shieldWall" | "carePackage";
type BattleIntentKind = "stabilize" | "economy" | "burst";
type BuildFocusKind = "control" | "blast" | "economy" | "fireline" | "hybrid";
type WaveContractKind = "perfect" | "hold" | "bounty" | "hunt";
type OpsCardKind = "pressure" | "fill" | "intent";
type FocusCommandKind = "start" | "cruise" | "startWave" | "steward" | "pressure" | "ops" | "mutation" | "none";
type WavePlanKind = "training" | "armor" | "rush" | "swarm" | "siege" | "boss";

interface DebugApi {
  state: () => DebugState;
  start: () => DebugState;
  plant: (kind: PlantKind, plotIndex: number) => DebugState;
  autoGarden: () => DebugState;
  startWave: () => DebugState;
  toggleBattlePlan: () => DebugState;
  runBattlePlan: () => DebugState;
  campaign: () => DebugState;
  opsDeck: () => DebugState;
  opsCard: (index?: number) => DebugState;
  intent: (kind?: BattleIntentKind) => DebugState;
  focusCommand: () => DebugState;
  focusLoop: (ticks?: number) => DebugState;
  handsFree: (ticks?: number) => DebugState;
  toggleCruise: () => DebugState;
  autoCruise: (steps?: number) => DebugState;
  directorOrder: () => DebugState;
  forceMutation: () => DebugState;
  resolveMutation: (choiceIndex?: number) => DebugState;
  resolveAllMutations: () => DebugState;
}

interface HubGameEntry {
  key: HubGameKey;
  eyebrow: string;
  title: string;
  summary: string;
  href: string;
  tags: string[];
  cta: string;
}

const HUB_GAMES: HubGameEntry[] = [
  {
    key: "tower",
    eyebrow: "塔防肉鸽",
    title: "脑花守卫",
    summary: "种植、守线、免手巡航，把一波波尸潮压成真正的构筑选择。",
    href: "?game=tower",
    tags: ["低操作", "自动管家", "波次构筑"],
    cta: "守住脑花",
  },
  {
    key: "cabin",
    eyebrow: "3D 生存",
    title: "林间小屋",
    summary: "砍树、采矿、点火、筑墙，在狼压和寒潮里守住自己的小屋。",
    href: "?game=cabin",
    tags: ["森林探索", "营地建造", "寒夜事件"],
    cta: "进入林地",
  },
  {
    key: "voxel",
    eyebrow: "体素工坊",
    title: "深岩工坊",
    summary: "向地下开采矿脉，铺电网、炼材料、架炮台，保住核心。",
    href: "?game=voxel",
    tags: ["挖矿", "蓝图", "地底防守"],
    cta: "下井开工",
  },
  {
    key: "orbit",
    eyebrow: "轨道防御",
    title: "星环防线",
    summary: "部署卫星编队，围绕核心穿梭开火，挡住外层轨道入侵。",
    href: "?game=orbit",
    tags: ["3D 轨道", "编队", "核心防线"],
    cta: "启动星环",
  },
];

interface DebugState {
  mode: GameMode;
  wave: number;
  zombies: number;
  plants: number;
  brainHp: number;
  sun: number;
  wallArmor: number;
  gameSpeed: number;
  autoWave: boolean;
  autoGarden: boolean;
  autoStrategy: boolean;
  commandMode: boolean;
  campaignMode: boolean;
  campaignActions: number;
  campaignSavedClicks: number;
  campaignPlan: string;
  campaignHistory: string[];
  campaignDetails: string[];
  waveDecisionBudget: number;
  waveDecisionUsed: number;
  lowTouchDirectorMode: boolean;
  directorLoopActions: number;
  operationLoad: number;
  operationLedger: string;
  targetRatioBand: string;
  targetRatioLow: number;
  targetRatioHigh: number;
  balanceRatio: number;
  balanceClamp: string;
  balanceSunLocked: number;
  balancePressureMultiplier: number;
  focusCommandMode: boolean;
  focusCommandTitle: string;
  focusCommandDetail: string;
  focusCommandRisk: string;
  focusCommandText: string;
  focusCommandKind: FocusCommandKind;
  focusCommandActions: number;
  focusCommandSavings: number;
  focusLoopMode: boolean;
  focusLoopActions: number;
  focusLoopSavings: number;
  focusLoopLast: string;
  handsFreeMode: boolean;
  handsFreeActions: number;
  handsFreeSavings: number;
  handsFreeStreak: number;
  handsFreeLast: string;
  decisionBurden: number;
  battlePlanMode: boolean;
  cruiseMode: boolean;
  cruiseActions: number;
  commandActions: number;
  planActions: number;
  savedClicks: number;
  combatFeedMode: boolean;
  combatFeed: string[];
  waveDamageDone: number;
  waveKills: number;
  waveSunGained: number;
  mvpPlant: string;
  plantContributions: string[];
  visiblePlantBadges: number;
  tacticalQueueMode: boolean;
  queueActions: number;
  queueSavedClicks: number;
  queueLastPlan: string;
  queueHistory: string[];
  balanceVerdict: string;
  nextAdvice: string;
  balanceAdjustments: number;
  balanceLastAdjustment: string;
  intentMode: boolean;
  intentActions: number;
  activeIntent: BattleIntentKind;
  intentCards: string[];
  intentHistory: string[];
  lastIntentPlan: string;
  intentSavings: number;
  opsDeckMode: boolean;
  opsDeckActions: number;
  opsCards: string[];
  laneFocus: string;
  routePressure: number;
  rhythm: string;
  tempoChanges: number;
  lastTempoPlan: string;
  perfectWaves: number;
  waveGrade: string;
  pressureTier: string;
  waveLeaks: number;
  activeBattleEvent: BattleEventKind;
  battleEventTitle: string;
  battleEventHistory: string[];
  battleEventTriggers: number;
  battleEventSpawnExtra: number;
  battleEventSunYieldBonus: number;
  battleEventDamageMultiplier: number;
  battleEventSpeedMultiplier: number;
  wavePlanKind: WavePlanKind;
  wavePlanTitle: string;
  wavePlanCounter: string;
  wavePlanMix: string;
  wavePlanHistory: string[];
  balanceLedger: string;
  fairnessDebt: number;
  mercyBank: number;
  contractMode: boolean;
  activeContract: WaveContractKind;
  contractTitle: string;
  contractGoal: string;
  contractProgress: string;
  contractHistory: string[];
  contractCompleted: number;
  contractRewards: number;
  contractStreak: number;
  gardenerPlacements: number;
  autoStrategyPicks: number;
  directorAssists: number;
  directorFieldOrders: number;
  directorSeedDrops: number;
  directorOverclocks: number;
  directorCarePackages: number;
  directorLastOrder: string;
  directorOrderHistory: string[];
  directorNote: string;
  adaptiveIntensity: number;
  intensityHistory: string[];
  intensityReason: string;
  tacticalBrief: string;
  threatScore: number;
  defenseScore: number;
  buildFocusKind: BuildFocusKind;
  buildFocusTitle: string;
  buildFocusAdvice: string;
  buildFocusScore: number;
  runRules: string[];
  choiceTitles: string[];
  pendingMutations: number;
  currentMutationPlant: number | null;
  plantLevels: number[];
  pathNodes: number;
  plots: number;
  kills: number;
}

declare global {
  interface Window {
    __orbitBastionDebug?: DebugApi;
  }
}

interface Point {
  x: number;
  y: number;
}

interface FocusCommand {
  kind: FocusCommandKind;
  title: string;
  detail: string;
  risk: string;
  color: number;
  savings: number;
}

interface PlantDefinition {
  name: string;
  icon: string;
  cost: number;
  color: number;
  accent: number;
  range: number;
  damage: number;
  fireDelay: number;
  splash: number;
  pierce: number;
  slow: number;
  sunYield: number;
  description: string;
}

interface Plant {
  id: number;
  kind: PlantKind;
  x: number;
  y: number;
  plotIndex: number;
  level: number;
  range: number;
  damage: number;
  fireDelay: number;
  cooldown: number;
  splash: number;
  pierce: number;
  slow: number;
  slowDuration: number;
  multishot: number;
  critChance: number;
  sunYield: number;
  sunTimer: number;
  auraDamage: number;
  auraSlow: number;
  solarHaste: number;
  mutations: string[];
  sprite: Phaser.GameObjects.Container;
  rangeRing: Phaser.GameObjects.Arc;
  badge: Phaser.GameObjects.Text;
  damageDone: number;
  kills: number;
}

interface Zombie {
  id: number;
  kind: ZombieKind;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  value: number;
  targetIndex: number;
  slowUntil: number;
  slowMultiplier: number;
  eventAlpha: number;
  sprite: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Image;
  hpBar: Phaser.GameObjects.Rectangle;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  splash: number;
  pierce: number;
  slow: number;
  slowDuration: number;
  color: number;
  ttl: number;
  ownerId: number;
  sprite: Phaser.GameObjects.Arc;
}

interface Mutation {
  title: string;
  rarity: Rarity;
  description: string;
  rule?: string;
  apply: () => Plant[];
}

interface PlantCard {
  kind: PlantKind;
  bg: Phaser.GameObjects.Rectangle;
  container: Phaser.GameObjects.Container;
}

interface PlotView {
  pad: Phaser.GameObjects.Rectangle;
  dot: Phaser.GameObjects.Arc;
}

interface OpsCard {
  kind: OpsCardKind;
  title: string;
  detail: string;
  color: number;
}

interface IntentCard {
  kind: BattleIntentKind;
  title: string;
  detail: string;
  tag: string;
  color: number;
  recommended: boolean;
}

interface BuildFocus {
  kind: BuildFocusKind;
  title: string;
  advice: string;
  score: number;
  color: number;
}

interface WaveContract {
  kind: WaveContractKind;
  title: string;
  goal: string;
  reward: number;
  color: number;
}

interface WavePlan {
  kind: WavePlanKind;
  title: string;
  mix: ZombieKind[];
  counter: string;
  lane: string;
  pressure: number;
  color: number;
}

interface RoutePressure {
  title: string;
  label: string;
  pathIndex: number;
  score: number;
  need: string;
  color: number;
}

const WIDTH = 1280;
const HEIGHT = 720;
const MAX_WAVE = 12;

const COLORS = {
  bg: 0x071017,
  soil: 0x27321e,
  path: 0x3a2e2a,
  pathEdge: 0x8a6a45,
  green: 0x6dff9a,
  lime: 0xb8ff64,
  cyan: 0x32d4ff,
  blue: 0x6aa5ff,
  yellow: 0xffd560,
  orange: 0xff9b3d,
  red: 0xff5470,
  pink: 0xff5cb8,
  purple: 0xa574ff,
  white: 0xf4fbff,
  panel: 0x101922,
};

const PATH: Point[] = [
  { x: -70, y: 168 },
  { x: 126, y: 168 },
  { x: 126, y: 318 },
  { x: 340, y: 318 },
  { x: 340, y: 134 },
  { x: 608, y: 134 },
  { x: 608, y: 470 },
  { x: 884, y: 470 },
  { x: 884, y: 250 },
  { x: 1100, y: 250 },
  { x: 1100, y: 560 },
  { x: 1238, y: 560 },
];

const PLOTS: Point[] = [
  { x: 72, y: 108 },
  { x: 206, y: 112 },
  { x: 246, y: 224 },
  { x: 76, y: 424 },
  { x: 222, y: 418 },
  { x: 328, y: 552 },
  { x: 444, y: 232 },
  { x: 500, y: 112 },
  { x: 510, y: 390 },
  { x: 520, y: 586 },
  { x: 716, y: 112 },
  { x: 732, y: 286 },
  { x: 730, y: 584 },
  { x: 842, y: 360 },
  { x: 958, y: 136 },
  { x: 1016, y: 372 },
  { x: 1018, y: 642 },
  { x: 1184, y: 412 },
  { x: 1190, y: 646 },
  { x: 428, y: 478 },
];

const PLANT_DEFS: Record<PlantKind, PlantDefinition> = {
  pea: {
    name: "豌豆射手",
    icon: "P",
    cost: 55,
    color: 0x72ff78,
    accent: 0x1f8f42,
    range: 270,
    damage: 22,
    fireDelay: 760,
    splash: 0,
    pierce: 0,
    slow: 0,
    sunYield: 0,
    description: "稳定远程输出",
  },
  sunflower: {
    name: "向日葵",
    icon: "S",
    cost: 50,
    color: 0xffd94a,
    accent: 0xff8c2b,
    range: 210,
    damage: 0,
    fireDelay: 1200,
    splash: 0,
    pierce: 0,
    slow: 0,
    sunYield: 18,
    description: "产阳光经济",
  },
  ice: {
    name: "寒冰豌豆",
    icon: "I",
    cost: 80,
    color: 0x7de8ff,
    accent: 0x2e72ff,
    range: 235,
    damage: 10,
    fireDelay: 1050,
    splash: 0,
    pierce: 0,
    slow: 0.46,
    sunYield: 0,
    description: "减速控场",
  },
  corn: {
    name: "玉米投手",
    icon: "C",
    cost: 105,
    color: 0xffcb4d,
    accent: 0xff7b36,
    range: 300,
    damage: 34,
    fireDelay: 1300,
    splash: 58,
    pierce: 0,
    slow: 0,
    sunYield: 0,
    description: "范围爆炸",
  },
  thorn: {
    name: "地刺藤",
    icon: "T",
    cost: 70,
    color: 0xb6ff5d,
    accent: 0x356e28,
    range: 125,
    damage: 8,
    fireDelay: 420,
    splash: 0,
    pierce: 99,
    slow: 0.18,
    sunYield: 0,
    description: "近路陷阱",
  },
};

const RARITY_COLORS: Record<Rarity, number> = {
  common: 0xc8e8ff,
  rare: COLORS.cyan,
  epic: COLORS.purple,
};

const PLANT_TEXTURES: Record<PlantKind, string> = {
  pea: "plant-pea",
  sunflower: "plant-sunflower",
  ice: "plant-ice",
  corn: "plant-corn",
  thorn: "plant-thorn",
};

const ZOMBIE_TEXTURES: Record<ZombieKind, string> = {
  walker: "zombie-walker",
  runner: "zombie-runner",
  cone: "zombie-cone",
  bucket: "zombie-bucket",
  swarm: "zombie-swarm",
  boss: "zombie-boss",
};

const BATTLE_EVENT_DEFS: Record<BattleEventKind, {
  title: string;
  label: string;
  brief: string;
  color: number;
}> = {
  calm: {
    title: "常规推进",
    label: "稳",
    brief: "标准尸潮，按当前阵容推进。",
    color: COLORS.green,
  },
  supplyRain: {
    title: "补给雨",
    label: "补",
    brief: "阳光雨落下，向日葵本波额外产出。",
    color: COLORS.yellow,
  },
  rootBloom: {
    title: "藤蔓疯长",
    label: "藤",
    brief: "路径附近植物获得火力和地刺脉冲。",
    color: COLORS.lime,
  },
  fogRaid: {
    title: "薄雾突袭",
    label: "雾",
    brief: "前锋藏在雾里，前几只速度更快。",
    color: COLORS.cyan,
  },
  nightRush: {
    title: "夜袭压迫",
    label: "夜",
    brief: "尸潮加量加速，跑尸和群尸更多。",
    color: COLORS.purple,
  },
};

class GardenScene extends Phaser.Scene {
  private mode: GameMode = "boot";
  private sun = 180;
  private brainHp = 100;
  private maxBrainHp = 100;
  private wave = 0;
  private simTime = 0;
  private gameSpeed = 1;
  private autoWave = true;
  private autoGarden = true;
  private autoStrategy = true;
  private commandMode = true;
  private campaignMode = true;
  private campaignActions = 0;
  private campaignSavedClicks = 0;
  private campaignPlan = "战役管家待命：每波压成 1 个主决策。";
  private campaignHistory: string[] = [];
  private waveDecisionBudget = 1;
  private waveDecisionUsed = 0;
  private lowTouchDirectorMode = true;
  private directorLoopActions = 0;
  private operationLoad = 0;
  private operationLedger = "低操作待命：开局后每波压成 1 个主决策。";
  private targetRatioBand = "目标 1.02-1.24";
  private balanceClamp = "未校准";
  private balanceSunLocked = 0;
  private balancePressureMultiplier = 1;
  private focusCommandMode = true;
  private focusCommandActions = 0;
  private focusCommandSavings = 0;
  private focusLoopMode = true;
  private focusLoopActions = 0;
  private focusLoopSavings = 0;
  private focusLoopLast = "待命";
  private nextFocusLoopAt = 0;
  private handsFreeMode = true;
  private handsFreeActions = 0;
  private handsFreeSavings = 0;
  private handsFreeStreak = 0;
  private handsFreeLast = "待命";
  private nextHandsFreeAt = 0;
  private battlePlanMode = true;
  private cruiseMode = false;
  private cruiseActions = 0;
  private commandActions = 0;
  private planActions = 0;
  private savedClicks = 0;
  private combatFeedMode = true;
  private combatFeed: string[] = ["战斗复盘待命：开波后自动记录伤害、击杀和救场。"];
  private waveDamageDone = 0;
  private waveKills = 0;
  private waveSunGained = 0;
  private lastMvpPlant = "暂无";
  private tacticalQueueMode = true;
  private queueActions = 0;
  private queueSavedClicks = 0;
  private queueLastPlan = "待命";
  private queueHistory: string[] = [];
  private balanceVerdict = "未评估";
  private nextAdvice = "先开局";
  private balanceAdjustments = 0;
  private balanceLastAdjustment = "待命";
  private intentMode = true;
  private intentActions = 0;
  private activeIntent: BattleIntentKind = "stabilize";
  private intentHistory: string[] = [];
  private lastIntentPlan = "开局稳线：先压入口和终点漏防";
  private intentSavings = 0;
  private opsDeckMode = true;
  private opsDeckActions = 0;
  private opsCards: string[] = ["压入口", "补火力", "稳节奏"];
  private laneFocus = "入口";
  private routePressure = 0;
  private rhythm = "稳扎推进";
  private tempoChanges = 0;
  private lastTempoPlan = "待命";
  private perfectWaves = 0;
  private currentWaveLeaks = 0;
  private lastWaveGrade = "待战";
  private pressureTier = "普通";
  private activeBattleEvent: BattleEventKind = "calm";
  private battleEventHistory: string[] = [];
  private battleEventTriggers = 0;
  private battleEventSpawnExtra = 0;
  private battleEventSunYieldBonus = 0;
  private battleEventDamageMultiplier = 1;
  private battleEventSpeedMultiplier = 1;
  private activeWavePlan: WavePlan = {
    kind: "training",
    title: "开局试探",
    mix: ["walker"],
    counter: "补豌豆，观察路线",
    lane: "入口",
    pressure: 18,
    color: COLORS.green,
  };
  private wavePlanHistory: string[] = [];
  private fairnessDebt = 0;
  private mercyBank = 0;
  private balanceLedger = "账本 初始：等待首波表现";
  private contractMode = true;
  private activeContract: WaveContractKind = "perfect";
  private contractHistory: string[] = [];
  private contractCompleted = 0;
  private contractRewards = 0;
  private contractStreak = 0;
  private waveStartBrain = 100;
  private waveStartArmor = 0;
  private runRules: string[] = [];
  private globalDamageMultiplier = 1;
  private globalFireDelayMultiplier = 1;
  private zombieSpeedMultiplier = 1;
  private bountyBonus = 0;
  private wallArmor = 0;
  private gardenerPlacements = 0;
  private autoStrategyPicks = 0;
  private directorAssists = 0;
  private directorFieldOrders = 0;
  private directorSeedDrops = 0;
  private directorOverclocks = 0;
  private directorCarePackages = 0;
  private directorWaveOrders = 0;
  private nextDirectorOrderAt = 0;
  private directorOrderHistory: string[] = [];
  private directorLastOrder = "待命";
  private directorNote = "稳定";
  private adaptiveIntensity = 1;
  private intensityHistory: string[] = ["1.00 初始"];
  private intensityReason = "初始";
  private kills = 0;
  private score = 0;
  private nextPlantId = 1;
  private nextZombieId = 1;
  private selectedKind: PlantKind = "pea";
  private seedArmed = true;
  private selectedPlant: Plant | null = null;
  private currentMutationPlant: Plant | null = null;
  private currentChoices: Mutation[] = [];
  private spawnTarget = 0;
  private spawned = 0;
  private nextSpawnAt = 0;
  private spawnDelay = 900;
  private plotOccupants = new Map<number, Plant>();
  private plants: Plant[] = [];
  private zombies: Zombie[] = [];
  private projectiles: Projectile[] = [];
  private cards: PlantCard[] = [];
  private plotViews: PlotView[] = [];
  private hoverPlotIndex: number | null = null;
  private pathGraphics!: Phaser.GameObjects.Graphics;
  private planLayer!: Phaser.GameObjects.Container;
  private eventLayer!: Phaser.GameObjects.Container;
  private plotLayer!: Phaser.GameObjects.Container;
  private placementGhost!: Phaser.GameObjects.Container;
  private ghostImage!: Phaser.GameObjects.Image;
  private ghostRing!: Phaser.GameObjects.Arc;
  private startLayer!: Phaser.GameObjects.Container;
  private mutationLayer!: Phaser.GameObjects.Container;
  private startWaveButton!: Phaser.GameObjects.Container;
  private autoWaveTimer: Phaser.Time.TimerEvent | null = null;
  private autoStrategyTimer: Phaser.Time.TimerEvent | null = null;
  private speedText!: Phaser.GameObjects.Text;
  private battlePlanText!: Phaser.GameObjects.Text;
  private opsDeckPanel!: Phaser.GameObjects.Container;
  private opsDeckTitle!: Phaser.GameObjects.Text;
  private intentCardTexts: Phaser.GameObjects.Text[] = [];
  private intentCardBgs: Phaser.GameObjects.Rectangle[] = [];
  private opsDeckCardTexts: Phaser.GameObjects.Text[] = [];
  private opsDeckCardBgs: Phaser.GameObjects.Rectangle[] = [];
  private combatFeedPanel!: Phaser.GameObjects.Container;
  private combatFeedTitle!: Phaser.GameObjects.Text;
  private combatFeedSummary!: Phaser.GameObjects.Text;
  private combatFeedLines: Phaser.GameObjects.Text[] = [];
  private focusCommandPanel!: Phaser.GameObjects.Container;
  private focusCommandBg!: Phaser.GameObjects.Rectangle;
  private focusCommandTitleText!: Phaser.GameObjects.Text;
  private focusCommandDetailText!: Phaser.GameObjects.Text;
  private focusCommandMetaText!: Phaser.GameObjects.Text;
  private autoWaveText!: Phaser.GameObjects.Text;
  private autoGardenText!: Phaser.GameObjects.Text;
  private autoStrategyText!: Phaser.GameObjects.Text;
  private cruiseText!: Phaser.GameObjects.Text;
  private hud!: {
    sun: Phaser.GameObjects.Text;
    wave: Phaser.GameObjects.Text;
    brain: Phaser.GameObjects.Text;
    brainBar: Phaser.GameObjects.Rectangle;
    mode: Phaser.GameObjects.Text;
    score: Phaser.GameObjects.Text;
    inspector: Phaser.GameObjects.Text;
  };

  constructor() {
    super("garden");
  }

  preload() {
    (Object.keys(PLANT_TEXTURES) as PlantKind[]).forEach((kind) => {
      this.load.image(PLANT_TEXTURES[kind], `/assets/plants/${kind}.svg`);
    });
    (Object.keys(ZOMBIE_TEXTURES) as ZombieKind[]).forEach((kind) => {
      this.load.image(ZOMBIE_TEXTURES[kind], `/assets/zombies/${kind}.png`);
    });
    this.load.image("brain", "/assets/ui/brain.svg");
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.drawArena();
    this.eventLayer = this.add.container(0, 0).setDepth(5);
    this.planLayer = this.add.container(0, 0).setDepth(6);
    this.createHud();
    this.createPlots();
    this.createPlantCards();
    this.createPlacementGhost();
    this.createStartWaveButton();
    this.createPlayControls();
    this.createOpsDeckPanel();
    this.createCombatFeedPanel();
    this.createFocusCommandPanel();
    this.createMutationLayer();
    this.createStartLayer();
    this.input.on("pointermove", () => this.updatePlacementGhost());
    this.input.on("pointerdown", (_pointer: Phaser.Input.Pointer, objects: Phaser.GameObjects.GameObject[]) => {
      if (objects.length === 0) this.cancelSelection();
    });
    this.input.keyboard?.on("keydown-ESC", () => this.cancelSelection());
    this.installDebugApi();
    this.updateHud();
  }

  update(_time: number, deltaMs: number) {
    const delta = Math.min(deltaMs / 1000, 0.033) * this.gameSpeed;
    this.simTime += delta * 1000;
    if (this.mode === "wave") {
      this.updateSpawning(this.simTime);
      this.updatePlants(delta, this.simTime);
      this.updateProjectiles(delta, this.simTime);
      this.updateZombies(delta, this.simTime);
      this.updateWaveDirector(this.simTime);
      this.checkWaveClear();
    }
    this.updateFocusLoop(this.simTime);
    this.updateHandsFreeLoop(this.simTime);
    this.updatePlacementGhost();
    this.updateHud();
  }

  private drawArena() {
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, COLORS.bg);
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x284456, 0.18);
    for (let x = 0; x <= WIDTH; x += 64) grid.lineBetween(x, 0, x, HEIGHT);
    for (let y = 0; y <= HEIGHT; y += 64) grid.lineBetween(0, y, WIDTH, y);

    this.pathGraphics = this.add.graphics();
    this.pathGraphics.setDepth(1);
    this.pathGraphics.lineStyle(96, COLORS.pathEdge, 0.42);
    this.strokePath(this.pathGraphics);
    this.pathGraphics.lineStyle(76, COLORS.path, 1);
    this.strokePath(this.pathGraphics);
    this.pathGraphics.lineStyle(2, 0xf5d497, 0.28);
    this.strokePath(this.pathGraphics);

    const brain = this.add.container(PATH[PATH.length - 1].x - 24, PATH[PATH.length - 1].y);
    brain.setDepth(4);
    brain.add(this.add.image(0, 0, "brain").setDisplaySize(92, 92));
    brain.add(this.add.text(0, 58, "脑子", { color: "#ffd8ec", fontSize: "16px", fontStyle: "800" }).setOrigin(0.5));
  }

  private strokePath(graphics: Phaser.GameObjects.Graphics) {
    graphics.beginPath();
    graphics.moveTo(PATH[0].x, PATH[0].y);
    for (const point of PATH.slice(1)) graphics.lineTo(point.x, point.y);
    graphics.strokePath();
  }

  private createHud() {
    this.add.rectangle(WIDTH / 2, 38, WIDTH, 76, 0x08131d, 0.88).setDepth(100);
    this.add.rectangle(WIDTH / 2, HEIGHT - 50, WIDTH, 100, 0x07111a, 0.92).setDepth(100);
    this.add.text(22, 15, "脑花守卫", {
      color: "#f4fbff",
      fontSize: "24px",
      fontStyle: "900",
    }).setDepth(101);
    this.hud = {
      sun: this.add.text(220, 18, "阳光 0", { color: "#ffd560", fontSize: "18px", fontStyle: "800" }).setDepth(101),
      wave: this.add.text(338, 18, "波次 0/9", { color: "#6dff9a", fontSize: "18px", fontStyle: "800" }).setDepth(101),
      brain: this.add.text(480, 18, "脑子 100", { color: "#ff8fca", fontSize: "18px", fontStyle: "800" }).setDepth(101),
      brainBar: this.add.rectangle(600, 52, 220, 12, COLORS.pink, 0.96).setOrigin(0, 0.5).setDepth(101),
      mode: this.add.text(22, 48, "准备种植", { color: "#9bc9d9", fontSize: "13px" }).setDepth(101),
      score: this.add.text(840, 18, "分数 0 · 击杀 0", { color: "#dcefff", fontSize: "15px" }).setDepth(101),
      inspector: this.add.text(840, 42, "", {
        color: "#9bc9d9",
        fontSize: "12px",
        wordWrap: { width: 252 },
      }).setDepth(101),
    };
    this.add.rectangle(598, 52, 224, 16).setStrokeStyle(1, COLORS.pink, 0.54).setOrigin(0, 0.5).setDepth(101);
  }

  private createPlots() {
    this.plotLayer = this.add.container(0, 0);
    this.plotLayer.setDepth(8);
    PLOTS.forEach((plot, index) => {
      const pad = this.add.rectangle(plot.x, plot.y, 64, 64, COLORS.soil, 0.78)
        .setStrokeStyle(2, 0x7ca65a, 0.64)
        .setInteractive({ useHandCursor: true });
      const dot = this.add.circle(plot.x, plot.y, 5, 0x9eca69, 0.7);
      pad.on("pointerdown", () => this.handlePlotClick(index));
      pad.on("pointerover", () => {
        this.hoverPlotIndex = index;
        this.updatePlotHighlights();
        this.updatePlacementGhost();
      });
      pad.on("pointerout", () => {
        if (this.hoverPlotIndex === index) this.hoverPlotIndex = null;
        this.updatePlotHighlights();
        this.updatePlacementGhost();
      });
      this.plotViews.push({ pad, dot });
      this.plotLayer.add([pad, dot]);
    });
  }

  private createPlantCards() {
    const kinds = Object.keys(PLANT_DEFS) as PlantKind[];
    kinds.forEach((kind, index) => {
      const def = PLANT_DEFS[kind];
      const x = 116 + index * 154;
      const bg = this.add.rectangle(0, 0, 132, 70, 0x101b24, 0.94)
        .setStrokeStyle(2, kind === this.selectedKind ? COLORS.yellow : 0x58707b, 0.78)
        .setInteractive({ useHandCursor: true });
      const icon = this.add.image(-45, -5, PLANT_TEXTURES[kind]).setDisplaySize(50, 50);
      const name = this.add.text(-12, -23, def.name, { color: "#f4fbff", fontSize: "14px", fontStyle: "900" });
      const cost = this.add.text(-12, -2, `${def.cost} 阳光`, { color: "#ffd560", fontSize: "13px", fontStyle: "800" });
      const desc = this.add.text(-12, 18, def.description, { color: "#8fb4c0", fontSize: "11px" });
      const container = this.add.container(x, HEIGHT - 50, [bg, icon, name, cost, desc]);
      container.setDepth(110);
      container.setSize(132, 70);
      container.setInteractive({ useHandCursor: true });
      bg.on("pointerdown", () => this.selectSeedKind(kind));
      container.on("pointerdown", () => this.selectSeedKind(kind));
      this.cards.push({ kind, bg, container });
    });
  }

  private createPlacementGhost() {
    this.ghostRing = this.add.circle(0, 0, PLANT_DEFS[this.selectedKind].range, 0xffffff, 0)
      .setStrokeStyle(2, COLORS.yellow, 0.32);
    this.ghostImage = this.add.image(0, -2, PLANT_TEXTURES[this.selectedKind]).setDisplaySize(74, 74);
    this.placementGhost = this.add.container(0, 0, [this.ghostRing, this.ghostImage]);
    this.placementGhost.setDepth(135);
    this.placementGhost.setVisible(false);
  }

  private selectSeedKind(kind: PlantKind) {
    if (this.mode === "mutation" || this.mode === "gameover" || this.mode === "victory") return;
    if (this.mode === "boot") this.beginRun();
    this.selectedKind = kind;
    this.seedArmed = true;
    this.selectedPlant = null;
    this.updateCardState();
    this.updatePlantSelection();
    this.updatePlotHighlights();
    this.updatePlacementGhost();
  }

  private cancelSelection() {
    if (this.mode === "mutation" || this.mode === "gameover" || this.mode === "victory") return;
    this.selectedPlant = null;
    this.seedArmed = false;
    this.updateCardState();
    this.updatePlantSelection();
    this.updatePlotHighlights();
    this.updatePlacementGhost();
  }

  private createStartWaveButton() {
    const start = () => this.startNextWave();
    const bg = this.add.rectangle(0, 0, 150, 46, 0x113927, 0.96)
      .setStrokeStyle(2, COLORS.green, 0.84)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(0, 0, "开始下一波", { color: "#dffff0", fontSize: "15px", fontStyle: "900" })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.startWaveButton = this.add.container(WIDTH - 104, 36, [bg, text]);
    this.startWaveButton.setDepth(120);
    this.startWaveButton.setSize(150, 46);
    this.startWaveButton.setInteractive({ useHandCursor: true });
    bg.on("pointerdown", start);
    text.on("pointerdown", start);
    this.startWaveButton.on("pointerdown", start);
    this.startWaveButton.setVisible(false);
  }

  private createPlayControls() {
    const y = 92;
    const makeButton = (x: number, width: number, label: string, onClick: () => void) => {
      const bg = this.add.rectangle(0, 0, width, 34, 0x101b24, 0.94)
        .setStrokeStyle(1, 0x6e8791, 0.78)
        .setInteractive({ useHandCursor: true });
      const text = this.add.text(0, 0, label, {
        color: "#dcefff",
        fontSize: "13px",
        fontStyle: "900",
      }).setOrigin(0.5);
      const button = this.add.container(x, y, [bg, text]);
      button.setDepth(121);
      button.setSize(width, 34);
      button.setInteractive({ useHandCursor: true });
      bg.on("pointerdown", onClick);
      button.on("pointerdown", onClick);
      return { text };
    };

    const cruise = makeButton(WIDTH - 564, 78, "巡航关", () => this.toggleCruiseMode());
    const plan = makeButton(WIDTH - 480, 78, "计划开", () => this.toggleBattlePlan());
    const garden = makeButton(WIDTH - 396, 78, "园丁开", () => this.toggleAutoGarden());
    const strategy = makeButton(WIDTH - 312, 78, "策略开", () => this.toggleAutoStrategy());
    const auto = makeButton(WIDTH - 218, 92, "导演开波", () => this.toggleAutoWave());
    const speed = makeButton(WIDTH - 104, 62, "1x", () => this.toggleSpeed());
    this.cruiseText = cruise.text;
    this.battlePlanText = plan.text;
    this.autoGardenText = garden.text;
    this.autoStrategyText = strategy.text;
    this.autoWaveText = auto.text;
    this.speedText = speed.text;
    this.updateControlState();
  }

  private createOpsDeckPanel() {
    const bg = this.add.rectangle(0, 0, 410, 138, 0x08131d, 0.78)
      .setStrokeStyle(1, COLORS.cyan, 0.42)
      .setInteractive({ useHandCursor: true });
    this.opsDeckTitle = this.add.text(-194, -60, "作战手牌", {
      color: "#dff9ff",
      fontSize: "12px",
      fontStyle: "900",
    }).setOrigin(0, 0.5);
    const hint = this.add.text(188, -60, "点预案 / 点手牌", {
      color: "#fff2bd",
      fontSize: "11px",
      fontStyle: "900",
    }).setOrigin(1, 0.5);
    this.opsDeckPanel = this.add.container(WIDTH - 246, 184, [bg, this.opsDeckTitle, hint]);
    this.opsDeckPanel.setDepth(123);
    this.opsDeckPanel.setSize(410, 138);
    bg.on("pointerdown", () => this.executeOpsDeck("手牌"));

    const intents: BattleIntentKind[] = ["stabilize", "economy", "burst"];
    intents.forEach((kind, i) => {
      const x = -132 + i * 132;
      const card = this.add.rectangle(x, -24, 120, 34, 0x101b24, 0.88)
        .setStrokeStyle(1, COLORS.cyan, 0.36)
        .setInteractive({ useHandCursor: true });
      const text = this.add.text(x - 52, -35, "", {
        color: "#f4fbff",
        fontSize: "11px",
        fontStyle: "900",
        lineSpacing: 2,
        wordWrap: { width: 104 },
      }).setOrigin(0, 0);
      card.on("pointerdown", (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.executeBattleIntent(kind, "预案卡");
      });
      this.intentCardBgs.push(card);
      this.intentCardTexts.push(text);
      this.opsDeckPanel.add([card, text]);
    });

    for (let i = 0; i < 3; i += 1) {
      const x = -132 + i * 132;
      const card = this.add.rectangle(x, 40, 120, 54, 0x101b24, 0.86)
        .setStrokeStyle(1, COLORS.green, 0.36)
        .setInteractive({ useHandCursor: true });
      const text = this.add.text(x - 52, 22, "", {
        color: "#f4fbff",
        fontSize: "11px",
        fontStyle: "900",
        lineSpacing: 2,
        wordWrap: { width: 104 },
      }).setOrigin(0, 0);
      card.on("pointerdown", (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.executeOpsCard(i, "手牌卡");
      });
      this.opsDeckCardBgs.push(card);
      this.opsDeckCardTexts.push(text);
      this.opsDeckPanel.add([card, text]);
    }
    this.updateOpsDeckPanel();
  }

  private createCombatFeedPanel() {
    const bg = this.add.rectangle(0, 0, 410, 118, 0x08131d, 0.74)
      .setStrokeStyle(1, COLORS.yellow, 0.32);
    this.combatFeedTitle = this.add.text(-194, -48, "战斗复盘", {
      color: "#fff2bd",
      fontSize: "12px",
      fontStyle: "900",
    }).setOrigin(0, 0.5);
    this.combatFeedSummary = this.add.text(188, -48, "待命", {
      color: "#dff9ff",
      fontSize: "11px",
      fontStyle: "900",
    }).setOrigin(1, 0.5);
    this.combatFeedPanel = this.add.container(WIDTH - 246, 336, [bg, this.combatFeedTitle, this.combatFeedSummary]);
    this.combatFeedPanel.setDepth(122);
    for (let i = 0; i < 4; i += 1) {
      const line = this.add.text(-190, -28 + i * 25, "", {
        color: "#c8dfeb",
        fontSize: "11px",
        fontStyle: "850",
        wordWrap: { width: 370 },
      }).setOrigin(0, 0);
      this.combatFeedLines.push(line);
      this.combatFeedPanel.add(line);
    }
    this.updateCombatFeedPanel();
  }

  private createFocusCommandPanel() {
    const run = () => this.executeFocusCommand("焦点指令");
    this.focusCommandBg = this.add.rectangle(0, 0, 462, 86, 0x0a1716, 0.9)
      .setStrokeStyle(2, COLORS.yellow, 0.72);
    const label = this.add.text(-214, -29, "下一步", {
      color: "#fff2bd",
      fontSize: "12px",
      fontStyle: "900",
    }).setOrigin(0, 0.5);
    this.focusCommandTitleText = this.add.text(-214, -7, "进入战役", {
      color: "#f7fff4",
      fontSize: "18px",
      fontStyle: "900",
    }).setOrigin(0, 0.5);
    this.focusCommandDetailText = this.add.text(-214, 20, "铺守门阵并交给管家", {
      color: "#c8dfeb",
      fontSize: "12px",
      fontStyle: "850",
      wordWrap: { width: 284 },
    }).setOrigin(0, 0.5);
    this.focusCommandMetaText = this.add.text(214, 0, "开局 · 省 4 步", {
      color: "#dff9ff",
      fontSize: "12px",
      fontStyle: "900",
      align: "right",
      wordWrap: { width: 126 },
    }).setOrigin(1, 0.5);
    this.focusCommandPanel = this.add.container(WIDTH / 2 - 24, HEIGHT - 154, [
      this.focusCommandBg,
      label,
      this.focusCommandTitleText,
      this.focusCommandDetailText,
      this.focusCommandMetaText,
    ]);
    this.focusCommandPanel.setDepth(126);
    this.focusCommandPanel.setSize(462, 86);
    this.focusCommandPanel.setInteractive({ useHandCursor: true });
    this.focusCommandPanel.on("pointerdown", run);
    this.updateFocusCommandPanel();
  }

  private createStartLayer() {
    const veil = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x03070d, 0.68).setOrigin(0);
    const panel = this.add.rectangle(0, 0, 640, 320, 0x101922, 0.94).setStrokeStyle(2, COLORS.green, 0.65);
    const title = this.add.text(0, -120, "脑花守卫", {
      color: "#f4fbff",
      fontSize: "44px",
      fontStyle: "900",
    }).setOrigin(0.5);
    const sub = this.add.text(0, -70, "路径塔防 · 植物卡牌 · 每波一次策略抉择", {
      color: "#9fd7e6",
      fontSize: "16px",
    }).setOrigin(0.5);
    const copy = this.add.text(0, -24, "默认启用作战计划：自动补种、强化、评估压力；想彻底托管再点巡航。", {
      color: "#d8edf4",
      fontSize: "15px",
    }).setOrigin(0.5);
    const buttonBg = this.add.rectangle(-300, 66, 150, 54, 0x245b34, 0.98)
      .setStrokeStyle(2, COLORS.lime, 0.9)
      .setInteractive({ useHandCursor: true });
    const buttonText = this.add.text(-300, 66, "种子包", {
      color: "#f5ffe8",
      fontSize: "17px",
      fontStyle: "900",
    }).setOrigin(0.5);
    buttonBg.on("pointerdown", () => this.beginRun());
    const cabinBg = this.add.rectangle(-100, 66, 150, 54, 0x163853, 0.98)
      .setStrokeStyle(2, COLORS.cyan, 0.9)
      .setInteractive({ useHandCursor: true });
    const cabinText = this.add.text(-100, 66, "林间求生", {
      color: "#e8f8ff",
      fontSize: "17px",
      fontStyle: "900",
    }).setOrigin(0.5);
    cabinBg.on("pointerdown", () => {
      window.location.search = "?game=cabin";
    });
    const voxelBg = this.add.rectangle(100, 66, 150, 54, 0x3a244b, 0.98)
      .setStrokeStyle(2, COLORS.purple, 0.9)
      .setInteractive({ useHandCursor: true });
    const voxelText = this.add.text(100, 66, "深岩工坊", {
      color: "#f4ebff",
      fontSize: "17px",
      fontStyle: "900",
    }).setOrigin(0.5);
    voxelBg.on("pointerdown", () => {
      window.location.search = "?game=voxel";
    });
    const orbitBg = this.add.rectangle(300, 66, 150, 54, 0x3d1f34, 0.98)
      .setStrokeStyle(2, COLORS.pink, 0.9)
      .setInteractive({ useHandCursor: true });
    const orbitText = this.add.text(300, 66, "星环防线", {
      color: "#ffe6f4",
      fontSize: "17px",
      fontStyle: "900",
    }).setOrigin(0.5);
    orbitBg.on("pointerdown", () => {
      window.location.search = "?game=orbit";
    });
    this.startLayer = this.add.container(WIDTH / 2, HEIGHT / 2, [veil, panel, title, sub, copy, buttonBg, buttonText, cabinBg, cabinText, voxelBg, voxelText, orbitBg, orbitText]);
    this.startLayer.setDepth(300);
  }

  private createMutationLayer() {
    this.mutationLayer = this.add.container(0, 0);
    this.mutationLayer.setDepth(240);
    this.mutationLayer.setVisible(false);
  }

  private beginRun() {
    if (this.mode !== "boot") return this.getDebugState();
    this.mode = "planting";
    this.startLayer.setVisible(false);
    this.startWaveButton.setVisible(true);
    this.seedArmed = true;
    this.plantStarterGarden();
    if (this.battlePlanMode && !this.runRules.includes("作战计划")) this.runRules.push("作战计划");
    if (this.commandMode && !this.runRules.includes("指挥官节奏")) this.runRules.push("指挥官节奏");
    if (this.campaignMode && !this.runRules.includes("战役管家")) this.runRules.push("战役管家");
    if (this.tacticalQueueMode && !this.runRules.includes("战术队列")) this.runRules.push("战术队列");
    if (this.intentMode && !this.runRules.includes("作战预案")) this.runRules.push("作战预案");
    if (this.focusCommandMode && !this.runRules.includes("焦点指令")) this.runRules.push("焦点指令");
    if (this.handsFreeMode && !this.runRules.includes("免手波次")) this.runRules.push("免手波次");
    this.balanceVerdict = this.getBalanceVerdict(1);
    this.nextAdvice = this.getNextAdvice(1);
    this.activeWavePlan = this.getWavePlan(1);
    this.updateOperationLedger("开局", 1);
    this.queueLastPlan = `开局：守门阵就绪 · ${this.balanceVerdict}`;
    if (this.campaignMode) {
      this.runCampaignSteward("开局");
    } else {
      this.executeBattleIntent(this.pickRecommendedIntent(1), "开局预案");
      this.applyTempoGovernor(1, "开局");
      this.refreshOpsDeck("开局", true);
    }
    this.renderThreatMarkers(1);
    this.toast(WIDTH / 2, 96, "守门阵已铺好；指挥官会自动补位、拿卡、开波。", COLORS.green);
    this.scheduleAutoWave();
    return this.getDebugState();
  }

  private plantStarterGarden() {
    if (this.plants.length > 0) return;
    const starters: Array<{ kind: PlantKind; plotIndex: number }> = [
      { kind: "sunflower", plotIndex: 1 },
      { kind: "pea", plotIndex: 2 },
      { kind: "ice", plotIndex: 6 },
      { kind: "thorn", plotIndex: 13 },
    ];
    for (const starter of starters) {
      this.placePlant(starter.kind, starter.plotIndex, true);
    }
    this.selectedKind = "corn";
    this.seedArmed = true;
    this.updateCardState();
  }

  private startNextWave(source: "manual" | "auto" | "cruise" = "manual") {
    if (this.mode === "boot") this.beginRun();
    if (this.mode !== "planting") return this.getDebugState();
    if (this.wave >= MAX_WAVE) return this.getDebugState();

    if (source !== "manual") {
      this.commandActions += 1;
      this.savedClicks += 1;
      if (!this.runRules.includes("指挥官节奏")) this.runRules.push("指挥官节奏");
    }
    this.waveDecisionBudget = this.campaignMode ? 1 : 3;
    this.waveDecisionUsed = 0;
    this.updateOperationLedger(source === "manual" ? "手动开波" : "自动开波", Math.min(MAX_WAVE, this.wave + 1));
    if (this.campaignMode) {
      this.runCampaignSteward(source === "manual" ? "手动开波前" : "管家开波前");
    } else if (this.tacticalQueueMode) {
      this.runTacticalQueue("开波前");
    } else {
      if (this.battlePlanMode) this.runBattlePlan("开波前");
      else this.runAutoGarden("开波前");
      this.balanceWaveDirector();
    }
    if (!this.campaignMode && this.intentMode) this.executeBattleIntent(this.pickRecommendedIntent(Math.min(MAX_WAVE, this.wave + 1)), "开波预案");
    this.autoWaveTimer?.remove(false);
    this.autoWaveTimer = null;
    this.mode = "wave";
    this.wave += 1;
    this.currentWaveLeaks = 0;
    this.waveDamageDone = 0;
    this.waveKills = 0;
    this.waveSunGained = 0;
    this.waveStartBrain = this.brainHp;
    this.waveStartArmor = this.wallArmor;
    this.directorWaveOrders = 0;
    this.nextDirectorOrderAt = this.simTime + 1250;
    this.balancePressureMultiplier = 1;
    this.pressureTier = this.getPressureTier(this.wave);
    this.spawned = 0;
    const baseSpawnTarget = this.wave === MAX_WAVE ? 26 : 5 + this.wave * 3;
    this.spawnTarget = Math.max(4, Math.round(baseSpawnTarget * (0.92 + this.adaptiveIntensity * 0.08)));
    this.spawnDelay = Math.max(450, 1120 - this.wave * 45);
    this.activateBattleEvent(this.pickBattleEvent(this.wave));
    this.activateWavePlan(this.wave);
    this.applyBalanceGovernor();
    this.balanceVerdict = this.getBalanceVerdict(this.wave);
    this.nextAdvice = this.getNextAdvice(this.wave);
    this.updateOperationLedger("波次运行", this.wave);
    this.applyTempoGovernor(this.wave, "开波");
    this.refreshOpsDeck("开波", true);
    this.activateWaveContract();
    if (this.commandMode || this.cruiseMode) this.runDirectorFieldOrder("开波调度");
    this.nextSpawnAt = this.simTime + 350;
    this.startWaveButton.setVisible(false);
    this.renderThreatMarkers(this.wave);
    this.addCombatFeed(`第 ${this.wave} 波开打 · ${this.pressureTier} · ${BATTLE_EVENT_DEFS[this.activeBattleEvent].title}`, this.wave === MAX_WAVE ? COLORS.red : COLORS.green);
    this.toast(WIDTH / 2, 96, `第 ${this.wave} 波来了 · ${this.pressureTier} · ${BATTLE_EVENT_DEFS[this.activeBattleEvent].title}`, this.wave === MAX_WAVE ? COLORS.red : COLORS.green);
    return this.getDebugState();
  }

  private handlePlotClick(index: number) {
    if (this.mode === "boot" || this.mode === "mutation" || this.mode === "gameover" || this.mode === "victory") return;
    const existing = this.plotOccupants.get(index);
    if (existing) {
      this.selectedPlant = existing;
      this.seedArmed = false;
      this.updatePlantSelection();
      this.updateCardState();
      this.updatePlacementGhost();
      return;
    }
    if (!this.seedArmed) {
      this.toast(PLOTS[index].x, PLOTS[index].y - 46, "先选种子", COLORS.yellow);
      return;
    }
    this.placePlant(this.selectedKind, index);
  }

  private placePlant(kind: PlantKind, plotIndex: number, free = false) {
    if (this.mode === "boot") this.beginRun();
    if (this.mode === "mutation" || this.mode === "gameover" || this.mode === "victory") return this.getDebugState();
    if (this.plotOccupants.has(plotIndex) || !PLOTS[plotIndex]) return this.getDebugState();

    const def = PLANT_DEFS[kind];
    if (!free && this.sun < def.cost) {
      this.toast(PLOTS[plotIndex].x, PLOTS[plotIndex].y - 46, "阳光不足", COLORS.red);
      return this.getDebugState();
    }
    if (!free) this.sun -= def.cost;

    const plot = PLOTS[plotIndex];
    const rangeRing = this.add.circle(plot.x, plot.y, def.range, 0xffffff, 0)
      .setStrokeStyle(1, def.color, 0.2)
      .setVisible(false)
      .setDepth(7);
    const sprite = this.createPlantSprite(kind, plot.x, plot.y);
    const badge = this.add.text(plot.x + 24, plot.y - 34, "", {
      color: "#071017",
      backgroundColor: "#ffd560",
      fontSize: "13px",
      fontStyle: "900",
      padding: { x: 5, y: 2 },
    }).setOrigin(0.5).setDepth(42).setVisible(false);

    const plant: Plant = {
      id: this.nextPlantId++,
      kind,
      x: plot.x,
      y: plot.y,
      plotIndex,
      level: 1,
      range: def.range,
      damage: def.damage,
      fireDelay: def.fireDelay,
      cooldown: Phaser.Math.Between(120, 520),
      splash: def.splash,
      pierce: def.pierce,
      slow: def.slow,
      slowDuration: 1250,
      multishot: 1,
      critChance: 0,
      sunYield: def.sunYield,
      sunTimer: 700,
      auraDamage: kind === "thorn" ? def.damage : 0,
      auraSlow: kind === "thorn" ? def.slow : 0,
      solarHaste: 0,
      mutations: [],
      sprite,
      rangeRing,
      badge,
      damageDone: 0,
      kills: 0,
    };

    this.plants.push(plant);
    this.plotOccupants.set(plotIndex, plant);
    this.selectedPlant = null;
    this.updatePlantSelection();
    this.updatePlotHighlights();
    this.updatePlacementGhost();
    this.burst(plot.x, plot.y, def.color, 10);
    this.updateCardState();
    return this.getDebugState();
  }

  private runAutoGarden(reason: string) {
    if (!this.autoGarden || this.mode !== "planting") return this.getDebugState();
    const before = this.plants.length;
    const budget = Math.min(this.sun, 180 + this.wave * 18);
    let spent = 0;
    const plan = this.getAutoGardenPlan();
    for (const item of plan) {
      if (this.sun < PLANT_DEFS[item.kind].cost || spent + PLANT_DEFS[item.kind].cost > budget) continue;
      const plotIndex = this.findOpenPlot(item.plots);
      if (plotIndex === null) continue;
      const previousSun = this.sun;
      this.placePlant(item.kind, plotIndex);
      if (this.sun < previousSun) {
        spent += previousSun - this.sun;
        this.gardenerPlacements += 1;
      }
      if (this.plants.length - before >= (this.wave <= 1 ? 2 : 1)) break;
    }
    const placed = this.plants.length - before;
    if (placed > 0) this.toast(WIDTH / 2, 126, `自动园丁：${reason}补种 ${placed} 棵`, COLORS.lime);
    return this.getDebugState();
  }

  private runBattlePlan(reason: string) {
    if (!this.battlePlanMode || !["planting", "wave"].includes(this.mode)) return this.getDebugState();
    let actions = 0;
    if (this.mode === "planting") {
      const beforePlants = this.plants.length;
      this.runAutoGarden(reason);
      if (this.plants.length > beforePlants) actions += this.plants.length - beforePlants;
    }

    const nextWave = Math.min(MAX_WAVE, this.wave + 1);
    const threat = this.getThreatScore(nextWave);
    let safety = this.getDefenseScore();
    const upgradeBudget = Math.min(this.sun, 90 + nextWave * 18);
    let spent = 0;
    while (this.plants.length > 0 && spent < upgradeBudget && safety < threat * 1.08) {
      const plant = this.pickPlanUpgradeTarget();
      if (!plant) break;
      const cost = this.getUpgradeCost(plant);
      if (this.sun < cost || spent + cost > upgradeBudget) break;
      this.sun -= cost;
      spent += cost;
      this.upgradePlantByPlan(plant);
      actions += 1;
      safety = this.getDefenseScore();
    }

    if (safety < threat * 0.96 && this.sun >= 38) {
      const spend = Math.min(this.sun, 38 + nextWave * 4);
      this.sun -= spend;
      const armor = Math.round(spend * 0.62);
      this.wallArmor += armor;
      actions += 1;
      this.toast(WIDTH / 2, 154, `作战计划：预购护盾 +${armor}`, COLORS.cyan);
    }

    if (actions > 0) {
      this.planActions += actions;
      this.savedClicks += actions;
      this.runRules = this.runRules.includes("作战计划") ? this.runRules : [...this.runRules, "作战计划"];
      this.toast(WIDTH / 2, 126, `作战计划：${reason}完成 ${actions} 项，少点 ${actions} 次`, COLORS.lime);
    }
    this.renderThreatMarkers(nextWave);
    return this.getDebugState();
  }

  private pickPlanUpgradeTarget() {
    return [...this.plants].sort((a, b) => {
      const priority = (plant: Plant) =>
        this.getPlantPower(plant) +
        (plant.kind === "ice" && this.wave >= 3 ? 42 : 0) +
        (plant.kind === "corn" && this.wave >= 5 ? 38 : 0) +
        (plant.kind === "thorn" && this.wave >= 4 ? 34 : 0) +
        (plant.kind === "sunflower" && this.wave <= 4 ? 28 : 0) -
        plant.level * 18;
      return priority(b) - priority(a);
    })[0] ?? null;
  }

  private getUpgradeCost(plant: Plant) {
    return Math.round(34 + plant.level * 12 + (plant.kind === "corn" ? 8 : 0));
  }

  private upgradePlantByPlan(plant: Plant) {
    plant.level += 1;
    plant.damage = plant.damage > 0 ? plant.damage * 1.1 + 4 : plant.damage;
    plant.auraDamage += plant.auraDamage > 0 ? 2.2 : 0;
    plant.range += plant.level % 2 === 0 ? 7 : 0;
    plant.fireDelay *= 0.965;
    plant.sunYield += plant.sunYield > 0 && plant.level % 2 === 1 ? 2 : 0;
    plant.rangeRing.setRadius(plant.range);
    plant.badge.setText("计");
    plant.badge.setVisible(true);
    this.pulsePlant(plant, 1.14);
    this.burst(plant.x, plant.y, COLORS.lime, 5);
  }

  private getAutoGardenPlan(): Array<{ kind: PlantKind; plots: number[] }> {
    const counts = (kind: PlantKind) => this.plants.filter((plant) => plant.kind === kind).length;
    const plan: Array<{ kind: PlantKind; plots: number[] }> = [];
    if (counts("corn") < 1) plan.push({ kind: "corn", plots: [10, 12, 14, 7, 15] });
    if (counts("pea") < 2) plan.push({ kind: "pea", plots: [0, 3, 4, 5, 8, 11] });
    if (counts("ice") < 2 && this.wave >= 1) plan.push({ kind: "ice", plots: [7, 10, 11, 14, 15] });
    if (counts("thorn") < 2 && this.wave >= 2) plan.push({ kind: "thorn", plots: [13, 15, 17, 18] });
    if (counts("sunflower") < 2 && this.wave <= 4) plan.push({ kind: "sunflower", plots: [4, 7, 9, 12] });
    plan.push(
      { kind: "pea", plots: [3, 5, 8, 11, 12, 14, 16] },
      { kind: "corn", plots: [12, 14, 16, 18] },
      { kind: "ice", plots: [10, 11, 15, 17] },
    );
    return plan;
  }

  private summonPlant(kind: PlantKind, preferredPlots: number[]) {
    const plotIndex = this.findOpenPlot(preferredPlots);
    if (plotIndex === null) return [];
    const beforeId = this.nextPlantId;
    const previousMode = this.mode;
    this.mode = "planting";
    this.placePlant(kind, plotIndex, true);
    this.mode = previousMode;
    const plant = this.plants.find((candidate) => candidate.id >= beforeId && candidate.plotIndex === plotIndex);
    return plant ? [plant] : [];
  }

  private duplicateBestPlant() {
    const source = [...this.plants].sort((a, b) => this.getPlantPower(b) - this.getPlantPower(a))[0];
    if (!source) return [];
    const plotIndex = this.findOpenPlot(this.getPlotOrderNear(source.x, source.y));
    if (plotIndex === null) return [];
    const beforeId = this.nextPlantId;
    const previousMode = this.mode;
    this.mode = "planting";
    this.placePlant(source.kind, plotIndex, true);
    this.mode = previousMode;
    const clone = this.plants.find((candidate) => candidate.id >= beforeId && candidate.plotIndex === plotIndex);
    if (!clone) return [];

    clone.level = Math.max(1, source.level - 1);
    clone.range = source.range;
    clone.damage = source.damage * 0.82;
    clone.fireDelay = source.fireDelay * 1.08;
    clone.splash = source.splash;
    clone.pierce = source.pierce;
    clone.slow = source.slow;
    clone.slowDuration = source.slowDuration;
    clone.multishot = source.multishot;
    clone.critChance = source.critChance;
    clone.sunYield = source.sunYield > 0 ? Math.max(8, source.sunYield - 4) : 0;
    clone.auraDamage = source.auraDamage * 0.82;
    clone.auraSlow = source.auraSlow;
    clone.solarHaste = source.solarHaste * 0.7;
    clone.mutations = [...source.mutations.slice(-2), "复制插枝"];
    clone.rangeRing.setRadius(clone.range);
    return [clone];
  }

  private findOpenPlot(preferredPlots: number[]) {
    const seen = new Set<number>();
    const order = [...preferredPlots, ...PLOTS.map((_plot, index) => index)];
    for (const index of order) {
      if (seen.has(index)) continue;
      seen.add(index);
      if (!PLOTS[index] || this.plotOccupants.has(index)) continue;
      return index;
    }
    return null;
  }

  private getPlotOrderNear(x: number, y: number) {
    return PLOTS
      .map((plot, index) => ({ index, distance: Phaser.Math.Distance.Between(x, y, plot.x, plot.y) }))
      .sort((a, b) => a.distance - b.distance)
      .map((item) => item.index);
  }

  private getPlantPower(plant: Plant) {
    return plant.damage * plant.multishot + plant.auraDamage * 8 + plant.splash * 0.35 + plant.sunYield * 2 + plant.range * 0.05 + plant.level * 8;
  }

  private getNearestPathDistance(x: number, y: number) {
    return PATH.reduce((best, point) => Math.min(best, Phaser.Math.Distance.Between(x, y, point.x, point.y)), Infinity);
  }

  private getBattleEventPlantMultiplier(plant: Plant) {
    if (this.activeBattleEvent !== "rootBloom") return 1;
    return this.getNearestPathDistance(plant.x, plant.y) <= 190 ? this.battleEventDamageMultiplier : 1.04;
  }

  private getGardenPower() {
    return this.plants.reduce((sum, plant) => sum + this.getPlantPower(plant), 0);
  }

  private balanceWaveDirector() {
    const nextWave = this.wave + 1;
    const expected = this.getThreatScore(nextWave);
    const power = this.getDefenseScore();
    if (power >= expected) {
      this.directorNote = "稳定";
      return;
    }

    const gap = expected - power;
    const shield = Math.min(32, 12 + Math.floor(gap / 28));
    const supply = Math.min(95, 35 + Math.floor(gap / 6));
    this.wallArmor += shield;
    this.sun += supply;
    this.directorAssists += 1;
    this.directorNote = `补助 护盾+${shield} 阳光+${supply}`;
    this.toast(WIDTH / 2, 156, `战局导演：${this.directorNote}`, COLORS.cyan);
  }

  private runTacticalQueue(reason: string) {
    if (!this.tacticalQueueMode || !["planting", "wave"].includes(this.mode)) return this.getDebugState();
    const before = {
      plants: this.plants.length,
      planActions: this.planActions,
      savedClicks: this.savedClicks,
      directorAssists: this.directorAssists,
      armor: this.wallArmor,
      sun: this.sun,
    };
    const nextWave = Math.min(MAX_WAVE, this.wave + 1);
    const steps: string[] = [];

    if (this.mode === "planting") {
      if (this.battlePlanMode) this.runBattlePlan(reason);
      else this.runAutoGarden(reason);
      if (this.plants.length > before.plants) steps.push(`补位 ${this.plants.length - before.plants}`);
      if (this.planActions > before.planActions) steps.push(`强化/护盾 ${this.planActions - before.planActions}`);
    }

    const afterPlanDefense = this.getDefenseScore();
    const threat = this.getThreatScore(nextWave);
    if (afterPlanDefense < threat * 0.98) {
      this.balanceWaveDirector();
      if (this.directorAssists > before.directorAssists) steps.push("补给校准");
    }

    this.balanceVerdict = this.getBalanceVerdict(nextWave);
    this.nextAdvice = this.getNextAdvice(nextWave);
    const tempoChanged = this.applyTempoGovernor(nextWave, reason);
    if (tempoChanged) steps.push("节奏调度");
    this.refreshOpsDeck(reason, true);
    if (steps.length === 0) steps.push(this.balanceVerdict.includes("优势") ? "保持阵型" : "观察压力");

    const savedDelta = this.savedClicks - before.savedClicks;
    const assistDelta = this.directorAssists - before.directorAssists;
    this.queueActions += 1;
    this.queueSavedClicks += Math.max(1, savedDelta + assistDelta + (tempoChanged ? 1 : 0));
    this.queueLastPlan = `${reason}：${steps.join(" / ")} · ${this.balanceVerdict}`;
    this.queueHistory.push(this.queueLastPlan);
    if (this.queueHistory.length > 6) this.queueHistory.shift();
    if (!this.runRules.includes("战术队列")) this.runRules.push("战术队列");
    this.toast(WIDTH / 2, 214, `战术队列：${steps.join(" / ")}`, COLORS.cyan);
    return this.getDebugState();
  }

  private runCampaignSteward(reason: string) {
    if (!this.campaignMode || this.mode === "gameover" || this.mode === "victory") return this.getDebugState();
    if (this.mode === "boot") {
      this.beginRun();
      return this.getDebugState();
    }
    const before = {
      queue: this.queueActions,
      queueSaved: this.queueSavedClicks,
      intent: this.intentActions,
      intentSaved: this.intentSavings,
      director: this.directorFieldOrders,
      plan: this.planActions,
      plants: this.plants.length,
      armor: this.wallArmor,
      sun: this.sun,
      savedClicks: this.savedClicks,
    };
    const nextWave = Math.min(MAX_WAVE, this.mode === "wave" ? this.wave : this.wave + 1);
    const steps: string[] = [];

    if (this.mode === "mutation") {
      this.chooseMutation(this.getRecommendedChoiceIndex(), "auto");
      steps.push("自动拿推荐卡");
    }

    if (this.mode === "planting") {
      this.runTacticalQueue(`${reason}整备`);
      if (this.queueActions > before.queue) steps.push("整备队列");
    }

    if (this.mode === "wave") {
      const pressure = this.getLivePressureScore();
      if (pressure >= 58 || this.wallArmor < 14) {
        const beforeDirector = this.directorFieldOrders;
        this.executePressureOpsCard(`${reason}波中`);
        if (this.directorFieldOrders > beforeDirector) steps.push("波中压线");
      } else if (this.getDefenseScore() < this.getThreatScore(this.wave) * 0.95) {
        const beforeDirector = this.directorFieldOrders;
        this.runDirectorFieldOrder(`${reason}补救`);
        if (this.directorFieldOrders > beforeDirector) steps.push("导演救场");
      } else {
        steps.push("观察收尾");
      }
    }

    if (this.intentMode && this.mode !== "mutation") {
      const intentBefore = this.intentActions;
      const intent = this.pickRecommendedIntent(nextWave);
      this.executeBattleIntent(intent, `${reason}预案`);
      if (this.intentActions > intentBefore) steps.push(`预案${this.getIntentTitle(intent)}`);
    }

    if (this.mode === "planting" && nextWave <= 2 && this.sun < PLANT_DEFS.corn.cost) {
      const reserve = PLANT_DEFS.corn.cost - this.sun + 18;
      this.sun += reserve;
      steps.push(`插手预算+${Math.round(reserve)}`);
    }

    const placed = this.plants.length - before.plants;
    const planned = this.planActions - before.plan;
    const armor = Math.max(0, Math.round(this.wallArmor - before.armor));
    const sunDelta = Math.round(this.sun - before.sun);
    if (placed > 0) steps.push(`补位${placed}`);
    if (planned > 0) steps.push(`强化${planned}`);
    if (armor > 0) steps.push(`护盾+${armor}`);
    if (sunDelta > 20 && this.mode !== "wave") steps.push(`补给+${sunDelta}`);

    const saved =
      Math.max(0, this.queueSavedClicks - before.queueSaved) +
      Math.max(0, this.intentSavings - before.intentSaved) +
      Math.max(0, this.directorFieldOrders - before.director) * 2 +
      Math.max(0, this.savedClicks - before.savedClicks);
    this.campaignActions += 1;
    this.directorLoopActions += 1;
    this.campaignSavedClicks += Math.max(1, saved + Math.min(3, steps.length));
    this.waveDecisionUsed = Math.min(this.waveDecisionBudget, this.waveDecisionUsed + 1);
    const uniqueSteps = [...new Set(steps)].slice(0, 5);
    this.updateOperationLedger(reason, nextWave);
    this.campaignPlan = `${reason}：${uniqueSteps.length > 0 ? uniqueSteps.join(" / ") : "保持阵型"} · ${this.getBalanceVerdict(nextWave)} · ${this.operationLedger} · ${this.getWaveContract(this.activeContract, Math.max(1, nextWave)).title}`;
    this.campaignHistory.push(this.campaignPlan);
    if (this.campaignHistory.length > 7) this.campaignHistory.shift();
    if (!this.runRules.includes("战役管家")) this.runRules.push("战役管家");
    this.addCombatFeed(`战役管家：${this.campaignPlan}`, COLORS.cyan);
    this.toast(WIDTH / 2, 294, `战役管家：本波 ${this.waveDecisionUsed}/${this.waveDecisionBudget} 决策`, COLORS.cyan);
    this.refreshOpsDeck(reason, true);
    return this.getDebugState();
  }

  private getIntentTitle(kind: BattleIntentKind) {
    return {
      stabilize: "稳线",
      economy: "滚经济",
      burst: "强杀",
    }[kind];
  }

  private pickRecommendedIntent(nextWave = this.wave + 1): BattleIntentKind {
    const ratio = this.getBalanceRatio(nextWave);
    const livePressure = this.mode === "wave" ? this.getLivePressureScore() : 0;
    const sunflowerCount = this.plants.filter((plant) => plant.kind === "sunflower").length;
    if (livePressure >= 64 || ratio < 1.04 || this.currentWaveLeaks > 0 || (this.wave > 0 && this.wallArmor < 10)) return "stabilize";
    if (this.mode !== "wave" && nextWave <= 5 && ratio >= 1.12 && sunflowerCount < 3) return "economy";
    if (ratio >= 1.48 || (nextWave >= 5 && ratio >= 1.18)) return "burst";
    return "stabilize";
  }

  private getIntentCards(nextWave = this.wave + 1): IntentCard[] {
    const recommended = this.pickRecommendedIntent(nextWave);
    const ratio = this.getBalanceRatio(nextWave);
    const livePressure = this.mode === "wave" ? this.getLivePressureScore() : this.routePressure;
    const sunflowerCount = this.plants.filter((plant) => plant.kind === "sunflower").length;
    return [
      {
        kind: "stabilize",
        title: "稳线",
        detail: ratio < 1.04 ? "护盾兜底并压漏防" : "保入口和终点",
        tag: `压${Math.round(livePressure)} · 盾${Math.ceil(this.wallArmor)}`,
        color: COLORS.cyan,
        recommended: recommended === "stabilize",
      },
      {
        kind: "economy",
        title: "滚经济",
        detail: sunflowerCount < 3 ? "补向日葵或增产" : "悬赏和补给滚阳光",
        tag: `葵${sunflowerCount} · 阳光${Math.floor(this.sun)}`,
        color: COLORS.yellow,
        recommended: recommended === "economy",
      },
      {
        kind: "burst",
        title: "强杀",
        detail: "升级主力并清前锋",
        tag: `${this.getBalanceVerdict(nextWave)} · ${this.laneFocus}`,
        color: COLORS.red,
        recommended: recommended === "burst",
      },
    ];
  }

  private executeBattleIntent(kind = this.pickRecommendedIntent(), reason = "作战预案") {
    if (this.mode === "boot") {
      this.beginRun();
      return this.getDebugState();
    }
    if (this.mode === "gameover" || this.mode === "victory") return this.getDebugState();
    this.activeIntent = kind;
    this.intentActions += 1;
    if (!this.runRules.includes("作战预案")) this.runRules.push("作战预案");
    const before = {
      plants: this.plants.length,
      planActions: this.planActions,
      armor: this.wallArmor,
      sun: this.sun,
      savedClicks: this.savedClicks,
      directorFieldOrders: this.directorFieldOrders,
    };
    const steps: string[] = [];

    if (kind === "stabilize") {
      this.applyStabilizeIntent(reason, steps);
    } else if (kind === "economy") {
      this.applyEconomyIntent(steps);
    } else {
      this.applyBurstIntent(steps);
    }

    const deltas = [
      this.plants.length > before.plants ? `补位${this.plants.length - before.plants}` : "",
      this.planActions > before.planActions ? `计划${this.planActions - before.planActions}` : "",
      this.wallArmor > before.armor ? `护盾+${Math.round(this.wallArmor - before.armor)}` : "",
      this.sun > before.sun && kind !== "economy" ? `阳光+${Math.round(this.sun - before.sun)}` : "",
      this.directorFieldOrders > before.directorFieldOrders ? "救场" : "",
    ].filter(Boolean);
    const summary = steps.length > 0 ? steps.join(" / ") : deltas.join(" / ") || "保持预案";
    const saved = Math.max(1, steps.length + Math.max(0, this.savedClicks - before.savedClicks));
    this.intentSavings += saved;
    this.savedClicks += 1;
    this.queueSavedClicks += 1;
    this.lastIntentPlan = `${this.getIntentTitle(kind)}：${summary}`;
    this.intentHistory.push(this.lastIntentPlan);
    if (this.intentHistory.length > 6) this.intentHistory.shift();
    this.addCombatFeed(`作战预案：${this.lastIntentPlan}`, kind === "burst" ? COLORS.red : kind === "economy" ? COLORS.yellow : COLORS.cyan);
    this.toast(WIDTH / 2, 244, `${reason}：${this.lastIntentPlan}`, kind === "burst" ? COLORS.red : kind === "economy" ? COLORS.yellow : COLORS.cyan);
    this.refreshOpsDeck(reason, true);
    return this.getDebugState();
  }

  private applyStabilizeIntent(reason: string, steps: string[]) {
    const nextWave = Math.min(MAX_WAVE, this.mode === "wave" ? this.wave : this.wave + 1);
    const threat = this.getThreatScore(nextWave);
    const defense = this.getDefenseScore();
    if (this.mode === "planting" && defense < threat * 1.08 && this.sun >= 28) {
      const spend = Math.min(this.sun, 30 + nextWave * 5);
      this.sun -= spend;
      const armor = Math.round(spend * 0.58);
      this.wallArmor += armor;
      steps.push(`预购护盾+${armor}`);
    }
    if (this.mode === "planting" && this.battlePlanMode && this.getDefenseScore() < threat * 1.16) {
      const beforePlan = this.planActions;
      this.runBattlePlan("稳线预案");
      if (this.planActions > beforePlan) steps.push(`补强${this.planActions - beforePlan}`);
    }
    if (this.mode === "wave") {
      const order: DirectorOrderKind = this.getLivePressureScore() >= 55 && this.zombies.length > 0 ? "iceNet" : "shieldWall";
      if (this.applyDirectorOrder(order, reason)) {
        this.directorAssists += 1;
        this.directorFieldOrders += 1;
        this.directorWaveOrders += 1;
        this.savedClicks += 2;
        steps.push(order === "iceNet" ? "冰网前锋" : "护盾兜底");
      }
    }
  }

  private applyEconomyIntent(steps: string[]) {
    const sunflowerCount = this.plants.filter((plant) => plant.kind === "sunflower").length;
    const defenseReserve = this.wave <= 0 ? 170 : 125;
    if (this.mode === "planting" && sunflowerCount < 3 && this.sun >= PLANT_DEFS.sunflower.cost + defenseReserve) {
      const beforePlants = this.plants.length;
      const plot = this.findOpenPlot([4, 7, 9, 12, 1, 5]);
      if (plot !== null) this.placePlant("sunflower", plot);
      if (this.plants.length > beforePlants) {
        this.gardenerPlacements += 1;
        steps.push("补向日葵");
      }
    }
    const sunflower = [...this.plants]
      .filter((plant) => plant.kind === "sunflower")
      .sort((a, b) => a.sunYield - b.sunYield || a.level - b.level)[0];
    if (sunflower && sunflower.sunYield < PLANT_DEFS.sunflower.sunYield + 8) {
      sunflower.sunYield += 1;
      sunflower.badge.setText("经");
      sunflower.badge.setVisible(true);
      this.pulsePlant(sunflower, 1.12);
      steps.push("葵增产");
    }
    if (this.bountyBonus < 8) {
      this.bountyBonus += 1;
      steps.push("悬赏+1");
    }
  }

  private applyBurstIntent(steps: string[]) {
    const targets = [...this.plants]
      .sort((a, b) => this.getPlantPower(b) - this.getPlantPower(a))
      .slice(0, this.wave >= 5 ? 2 : 1);
    let upgraded = 0;
    for (const plant of targets) {
      const cost = Math.min(this.sun, Math.round(this.getUpgradeCost(plant) * 0.72));
      if (cost < 18) continue;
      this.sun -= cost;
      this.upgradePlantByPlan(plant);
      plant.badge.setText("爆");
      upgraded += 1;
    }
    if (upgraded > 0) steps.push(`主力升级x${upgraded}`);
    if (this.mode === "wave" && this.zombies.length > 0) {
      const targetsToHit = [...this.zombies]
        .sort((a, b) => this.getZombieProgress(b) - this.getZombieProgress(a))
        .slice(0, 3);
      for (const zombie of targetsToHit) {
        this.damageZombie(zombie, 14 + this.wave * 2, COLORS.red);
        if (zombie.sprite.active) this.burst(zombie.x, zombie.y, COLORS.red, 6);
      }
      steps.push(`斩前锋x${targetsToHit.length}`);
    }
  }

  private recordQueueAutoPick(choiceTitle: string) {
    this.queueActions += 1;
    this.queueSavedClicks += 1;
    this.queueLastPlan = `自动选卡：${choiceTitle} · ${this.getBalanceVerdict()}`;
    this.queueHistory.push(this.queueLastPlan);
    if (this.queueHistory.length > 6) this.queueHistory.shift();
    if (!this.runRules.includes("战术队列")) this.runRules.push("战术队列");
  }

  private applyBalanceGovernor() {
    const ratio = this.getBalanceRatio(this.wave);
    const band = this.getTargetRatioBand(this.wave);
    this.targetRatioBand = `目标 ${band.low.toFixed(2)}-${band.high.toFixed(2)}`;
    if (ratio > band.high && this.wave >= 2) {
      const fairnessScale = this.fairnessDebt < 0 ? 0.45 : this.fairnessDebt >= 2 ? 1.12 : 0.82;
      const defense = this.getDefenseScore();
      const threatBefore = this.getThreatScore(this.wave);
      const targetThreat = defense / band.target;
      const threatGap = Math.max(0, targetThreat - threatBefore);
      const spawnCap = Math.min(34, 10 + this.wave * 5);
      const exactExtra = Math.ceil(threatGap / 48);
      const extra = Math.min(spawnCap, Math.max(1, Math.ceil(exactExtra * fairnessScale)));
      this.spawnTarget += extra;
      this.spawnDelay = Math.max(400, this.spawnDelay * (ratio >= band.high + 0.72 ? 0.84 : 0.91));
      if (ratio >= band.high + 0.92) this.battleEventSpeedMultiplier = Number((this.battleEventSpeedMultiplier * 1.05).toFixed(2));
      let afterRatio = this.getBalanceRatio(this.wave);
      let lockedSun = 0;
      if (afterRatio > band.high) {
        const remainingGap = Math.max(0, this.getDefenseScore() / band.target - this.getThreatScore(this.wave));
        const boost = Number(Math.min(2.25, Math.max(this.balancePressureMultiplier, 1 + remainingGap / 520)).toFixed(2));
        this.balancePressureMultiplier = boost;
        this.battleEventSpeedMultiplier = Number(Math.max(this.battleEventSpeedMultiplier, 1 + (boost - 1) * 0.26).toFixed(2));
        afterRatio = this.getBalanceRatio(this.wave);
      }
      if (afterRatio > band.high) {
        const targetDefense = this.getThreatScore(this.wave) * band.target;
        const surplusDefense = Math.max(0, this.getDefenseScore() - targetDefense);
        const minReserve = this.wave <= 3 ? 80 : 58;
        lockedSun = Math.min(Math.max(0, Math.floor(this.sun - minReserve)), Math.ceil(surplusDefense / 0.55));
        if (lockedSun > 0) {
          this.sun -= lockedSun;
          this.balanceSunLocked += lockedSun;
          afterRatio = this.getBalanceRatio(this.wave);
        }
      }
      this.balanceAdjustments += 1;
      const pressureText = this.balancePressureMultiplier > 1 ? `/精英x${this.balancePressureMultiplier.toFixed(2)}` : "";
      const lockText = lockedSun > 0 ? `/锁阳光${lockedSun}` : "";
      this.balanceLastAdjustment = ratio >= band.high + 0.92 ? `溢出夹紧 +${extra}${pressureText}${lockText}` : `溢出夹紧 +${extra}${pressureText}${lockText}`;
      this.balanceClamp = `${ratio.toFixed(2)}→${afterRatio.toFixed(2)} / ${this.targetRatioBand}`;
      this.balanceLedger = `账本 加压：${this.balanceClamp} · 公平债${this.fairnessDebt.toFixed(1)} · ${this.balanceLastAdjustment}`;
      this.pressureTier = `${this.pressureTier} · 加压`;
      this.toast(WIDTH / 2, 242, `平衡导演：压回目标带 +${extra}${lockedSun > 0 ? ` 锁${lockedSun}` : ""}`, COLORS.orange);
      return;
    }
    if (ratio < band.low) {
      const gap = band.low - ratio;
      const armor = 10 + Math.floor(gap * 48);
      const supply = 24 + Math.floor(gap * 70);
      this.wallArmor += armor;
      this.sun += supply;
      this.mercyBank += armor + Math.round(supply * 0.35);
      this.balanceAdjustments += 1;
      const afterRatio = this.getBalanceRatio(this.wave);
      this.balanceLastAdjustment = `低于目标 护盾+${armor}/阳光+${supply}`;
      this.balanceClamp = `${ratio.toFixed(2)}→${afterRatio.toFixed(2)} / ${this.targetRatioBand}`;
      this.balanceLedger = `账本 缓压：${this.balanceClamp} · 怜悯库${Math.round(this.mercyBank)} · ${this.balanceLastAdjustment}`;
      this.toast(WIDTH / 2, 242, `平衡导演：补回目标带 护盾+${armor} 阳光+${supply}`, COLORS.cyan);
      return;
    }
    this.balanceLastAdjustment = "保持曲线";
    this.balanceClamp = `${ratio.toFixed(2)} / ${this.targetRatioBand}`;
    this.balanceLedger = `账本 稳态：${this.balanceClamp} · 公平债${this.fairnessDebt.toFixed(1)} · 怜悯库${Math.round(this.mercyBank)}`;
  }

  private updateWaveDirector(time: number) {
    if (!this.commandMode && !this.cruiseMode && !this.battlePlanMode) return;
    if (time < this.nextDirectorOrderAt || this.directorWaveOrders >= 3) return;
    const pressure = this.getLivePressureScore();
    const needsHelp =
      pressure >= 58 ||
      this.getDefenseScore() < this.getThreatScore(this.wave) * 0.9 ||
      (this.wallArmor <= 10 && this.getLeadZombieProgressRatio() > 0.62) ||
      (this.activeBattleEvent === "fogRaid" && this.zombies.length >= 2);
    if (!needsHelp) {
      this.nextDirectorOrderAt = time + 1200;
      return;
    }
    this.runDirectorFieldOrder("波中调度");
    this.nextDirectorOrderAt = time + 2100;
  }

  private runDirectorFieldOrder(reason: string) {
    if (this.mode === "gameover" || this.mode === "victory") return this.getDebugState();
    const order = this.pickDirectorOrder();
    this.executeDirectorOrder(order, reason);
    return this.getDebugState();
  }

  private executeDirectorOrder(order: DirectorOrderKind, reason: string) {
    const handled = this.applyDirectorOrder(order, reason);
    if (!handled) return false;
    this.directorAssists += 1;
    this.directorFieldOrders += 1;
    if (this.mode === "wave") this.directorWaveOrders += 1;
    this.savedClicks += 2;
    if (!this.runRules.includes("战局导演")) this.runRules.push("战局导演");
    return true;
  }

  private pickDirectorOrder(): DirectorOrderKind {
    const defense = this.getDefenseScore();
    const threat = this.getThreatScore(Math.max(1, this.wave));
    const lead = this.getLeadZombieProgressRatio();
    const hasOpenPlot = PLOTS.some((_, index) => !this.plotOccupants.has(index));
    if (lead > 0.72 || this.wallArmor < 12) return "shieldWall";
    if (this.zombies.length >= 3 && (lead > 0.42 || this.activeBattleEvent === "fogRaid")) return "iceNet";
    if (hasOpenPlot && (this.plants.length < Math.min(9, 5 + Math.floor(this.wave / 2)) || defense < threat * 0.86)) return "seedDrop";
    if (this.plants.length > 0 && defense < threat * 1.08) return "overclock";
    return "carePackage";
  }

  private applyDirectorOrder(order: DirectorOrderKind, reason: string) {
    if (order === "seedDrop") return this.applyDirectorSeedDrop(reason);
    if (order === "overclock") return this.applyDirectorOverclock(reason);
    if (order === "iceNet") return this.applyDirectorIceNet(reason);
    if (order === "shieldWall") return this.applyDirectorShieldWall(reason);
    return this.applyDirectorCarePackage(reason);
  }

  private applyDirectorSeedDrop(reason: string) {
    const nextKind: PlantKind =
      this.wave >= 5 && !this.plants.some((plant) => plant.kind === "corn") ? "corn" :
      this.wave >= 3 && this.plants.filter((plant) => plant.kind === "ice").length < 2 ? "ice" :
      this.plants.filter((plant) => plant.kind === "thorn").length < 1 && this.wave >= 2 ? "thorn" :
      "pea";
    const preferred = nextKind === "ice" ? [7, 10, 11, 14, 15] : nextKind === "corn" ? [10, 12, 14, 16, 18] : nextKind === "thorn" ? [13, 15, 17, 18] : [0, 3, 4, 5, 8, 11, 12];
    const plants = this.summonPlant(nextKind, preferred);
    if (plants.length === 0) return this.applyDirectorOverclock(reason);
    this.directorSeedDrops += 1;
    this.recordDirectorOrder(`空投${PLANT_DEFS[nextKind].name}`);
    this.toast(WIDTH / 2, 184, `${reason}：空投${PLANT_DEFS[nextKind].name}，少一次补位`, COLORS.green);
    return true;
  }

  private applyDirectorOverclock(reason: string) {
    if (this.plants.length === 0) return this.applyDirectorCarePackage(reason);
    const targets = [...this.plants]
      .sort((a, b) => this.getPlantPower(b) - this.getPlantPower(a))
      .slice(0, this.wave >= 5 ? 2 : 1);
    for (const plant of targets) {
      this.upgradePlantByPlan(plant);
      plant.badge.setText("令");
    }
    this.directorOverclocks += targets.length;
    this.recordDirectorOrder(`火力超频 x${targets.length}`);
    this.toast(WIDTH / 2, 184, `${reason}：核心火力超频 x${targets.length}`, COLORS.lime);
    return true;
  }

  private applyDirectorIceNet(reason: string) {
    const targets = [...this.zombies]
      .sort((a, b) => this.getZombieProgress(b) - this.getZombieProgress(a))
      .slice(0, 4);
    if (targets.length === 0) return this.applyDirectorCarePackage(reason);
    for (const zombie of targets) {
      this.applySlow(zombie, 0.44, 1450, this.simTime);
      this.damageZombie(zombie, 8 + this.wave * 1.5, COLORS.cyan);
      this.burst(zombie.x, zombie.y, COLORS.cyan, 8);
    }
    this.recordDirectorOrder(`临时冰网 x${targets.length}`);
    this.toast(WIDTH / 2, 184, `${reason}：临时冰网锁住前锋 x${targets.length}`, COLORS.cyan);
    return true;
  }

  private applyDirectorShieldWall(reason: string) {
    const armor = 18 + Math.min(28, this.wave * 3);
    this.wallArmor += armor;
    this.recordDirectorOrder(`应急护盾 +${armor}`);
    this.toast(WIDTH / 2, 184, `${reason}：应急护盾 +${armor}`, COLORS.cyan);
    return true;
  }

  private applyDirectorCarePackage(reason: string) {
    const ratio = this.getBalanceRatio(Math.max(1, this.wave));
    const band = this.getTargetRatioBand(Math.max(1, this.wave));
    if (ratio > band.high + 0.06) {
      this.directorCarePackages += 1;
      this.recordDirectorOrder("补给转巡线");
      this.toast(WIDTH / 2, 184, `${reason}：局面已强，补给转巡线`, COLORS.yellow);
      return true;
    }
    const supply = 44 + Math.min(80, this.wave * 9);
    this.sun += supply;
    this.directorCarePackages += 1;
    this.recordDirectorOrder(`补给包 +${supply}`);
    this.toast(WIDTH / 2, 184, `${reason}：补给包 +${supply} 阳光`, COLORS.yellow);
    return true;
  }

  private recordDirectorOrder(label: string) {
    this.directorLastOrder = label;
    this.directorNote = label;
    this.directorOrderHistory.push(label);
    if (this.directorOrderHistory.length > 6) this.directorOrderHistory.shift();
    this.addCombatFeed(`导演救场：${label}`, COLORS.cyan);
  }

  private getLeadZombieProgressRatio() {
    if (this.zombies.length === 0) return 0;
    const pathLength = this.getPathLength();
    const lead = Math.max(...this.zombies.map((zombie) => this.getZombieProgress(zombie)));
    return lead / Math.max(1, pathLength);
  }

  private getPathLength() {
    let length = 0;
    for (let i = 1; i < PATH.length; i += 1) {
      length += Phaser.Math.Distance.Between(PATH[i - 1].x, PATH[i - 1].y, PATH[i].x, PATH[i].y);
    }
    return length;
  }

  private getLivePressureScore() {
    return Math.round(
      this.zombies.length * 9 +
        this.getLeadZombieProgressRatio() * 100 +
        Math.max(0, 24 - this.wallArmor) +
        Math.max(0, this.waveStartBrain - this.brainHp) * 2 +
        (this.activeBattleEvent === "nightRush" ? 12 : 0),
    );
  }

  private getThreatScore(nextWave = this.wave + 1) {
    const base = (215 + nextWave * 58 + Math.max(0, nextWave - 4) * 34 + Math.max(0, nextWave - 8) * 48) * this.adaptiveIntensity;
    if (this.mode !== "wave" || nextWave !== this.wave) return Math.round(base);
    const normalSpawnTarget = Math.round((this.wave === MAX_WAVE ? 26 : 5 + this.wave * 3) * (0.92 + this.adaptiveIntensity * 0.08));
    const extraSpawnLoad = Math.max(0, this.spawnTarget - normalSpawnTarget) * 48;
    const eventLoad =
      this.battleEventSpawnExtra * 38 +
      Math.max(0, this.battleEventSpeedMultiplier - 1) * 300 +
      Math.max(0, this.battleEventDamageMultiplier - 1) * 180;
    const balancePressureLoad = Math.max(0, this.balancePressureMultiplier - 1) * 520;
    return Math.round(base + extraSpawnLoad + eventLoad + balancePressureLoad);
  }

  private getDefenseScore() {
    return Math.round(this.getGardenPower() + this.wallArmor * 3 + this.sun * 0.55);
  }

  private getBalanceRatio(nextWave = this.wave + 1) {
    return this.getDefenseScore() / Math.max(1, this.getThreatScore(Math.min(MAX_WAVE, nextWave)));
  }

  private getTargetRatioBand(nextWave = this.wave + 1) {
    const wave = Math.min(MAX_WAVE, Math.max(1, nextWave));
    if (wave >= MAX_WAVE) return { low: 0.96, high: 1.14, target: 1.05 };
    if (wave <= 2) return { low: 1.04, high: 1.28, target: 1.16 };
    if (this.activeWavePlan.kind === "rush" || this.activeWavePlan.kind === "siege") return { low: 1.0, high: 1.18, target: 1.09 };
    return { low: 1.02, high: 1.22, target: 1.12 };
  }

  private updateOperationLedger(reason: string, nextWave = Math.min(MAX_WAVE, this.mode === "wave" ? this.wave : this.wave + 1)) {
    const manualLoad =
      1 +
      (this.autoWave ? 0 : 1) +
      (this.autoGarden ? 0 : 2) +
      (this.autoStrategy ? 0 : 1) +
      (this.campaignMode ? 0 : 2);
    this.operationLoad = this.lowTouchDirectorMode ? Math.min(1, manualLoad) : manualLoad;
    const delegated = Math.max(0, manualLoad - this.operationLoad) + this.waveDecisionBudget + Math.min(3, this.directorFieldOrders);
    this.operationLedger = `低操作 ${reason}：玩家${this.operationLoad}决策 · 管家代办${delegated}步 · 第${nextWave}波`;
    if (!this.runRules.includes("低操作导演")) this.runRules.push("低操作导演");
  }

  private getBalanceVerdict(nextWave = this.wave + 1) {
    const ratio = this.getBalanceRatio(nextWave);
    const band = this.getTargetRatioBand(nextWave);
    if (this.mode === "wave" && this.getLivePressureScore() >= 72) return `高压 ${ratio.toFixed(2)}x`;
    if (ratio > band.high) return `溢出 ${ratio.toFixed(2)}x`;
    if (ratio >= band.low) return `目标 ${ratio.toFixed(2)}x`;
    if (ratio >= band.low - 0.12) return `临界 ${ratio.toFixed(2)}x`;
    return `吃紧 ${ratio.toFixed(2)}x`;
  }

  private getNextAdvice(nextWave = this.wave + 1) {
    const counts = (kind: PlantKind) => this.plants.filter((plant) => plant.kind === kind).length;
    if (this.mode === "wave") {
      const pressure = this.getLivePressureScore();
      if (pressure >= 72) return "波中高压，导演优先冰网/护盾";
      if (this.zombies.length > 0) return "继续观察前锋，必要时自动救场";
      return "本波接近收尾，准备自动拿卡";
    }
    if (this.getBalanceRatio(nextWave) < 0.94) return "下波偏弱，队列会先补位和护盾";
    if (counts("ice") < 1 && nextWave >= 3) return "建议补寒冰，压跑尸速度";
    if (counts("thorn") < 1 && nextWave >= 4) return "建议补地刺，封住拐点";
    if (counts("corn") < 1 && nextWave >= 5) return "建议补玉米，处理群尸";
    if (this.sun > 150 && this.plants.some((plant) => plant.level < 3)) return "阳光充足，优先自动强化核心植物";
    return this.autoWave ? "队列可自动开波，玩家只需改思路" : "手动节奏，开波前队列仍会整备";
  }

  private getRoutePressureProfile(nextWave = this.wave + 1): RoutePressure[] {
    const eventWeight =
      this.activeBattleEvent === "nightRush" ? 12 :
      this.activeBattleEvent === "fogRaid" ? 9 :
      this.activeBattleEvent === "rootBloom" ? -4 :
      0;
    const lead = this.mode === "wave" ? Math.round(this.getLeadZombieProgressRatio() * 35) : 0;
    const leakWeight = this.currentWaveLeaks * 12 + Math.max(0, this.waveStartBrain - this.brainHp) * 0.8;
    const hasIce = this.plants.some((plant) => plant.kind === "ice");
    const hasCorn = this.plants.some((plant) => plant.kind === "corn");
    const hasThorn = this.plants.some((plant) => plant.kind === "thorn");
    const profile: RoutePressure[] = [
      {
        title: "入口",
        label: "入",
        pathIndex: 1,
        score: 26 + nextWave * 3 + (this.activeBattleEvent === "fogRaid" ? 16 : 0),
        need: hasIce ? "稳住前锋" : "补寒冰",
        color: COLORS.green,
      },
      {
        title: "上弯",
        label: "弯",
        pathIndex: 4,
        score: 30 + nextWave * 4 + (nextWave >= 3 ? 12 : 0) + (!hasIce && nextWave >= 3 ? 10 : 0),
        need: hasIce ? "补输出" : "减速",
        color: COLORS.cyan,
      },
      {
        title: "中庭",
        label: "中",
        pathIndex: 6,
        score: 28 + nextWave * 5 + (nextWave >= 5 ? 16 : 0) + (!hasCorn && nextWave >= 5 ? 12 : 0),
        need: hasCorn ? "保溅射" : "补玉米",
        color: COLORS.yellow,
      },
      {
        title: "终点",
        label: "尾",
        pathIndex: 10,
        score: 34 + nextWave * 4 + lead + leakWeight + (!hasThorn && nextWave >= 4 ? 10 : 0),
        need: this.wallArmor >= 24 ? "压漏防" : "补护盾",
        color: COLORS.pink,
      },
    ];
    return profile
      .map((item) => ({
        ...item,
        score: Math.round(Phaser.Math.Clamp(item.score + eventWeight - this.wallArmor * 0.08, 8, 99)),
      }))
      .sort((a, b) => b.score - a.score);
  }

  private getOpsCards(nextWave = this.wave + 1): OpsCard[] {
    const hotspot = this.getRoutePressureProfile(nextWave)[0];
    const ratio = this.getBalanceRatio(nextWave);
    const counts = (kind: PlantKind) => this.plants.filter((plant) => plant.kind === kind).length;
    const fillCard =
      ratio < 0.94 ? { kind: "fill" as const, title: "补偿", detail: "护盾/阳光兜底", color: COLORS.cyan } :
      counts("ice") < 1 && nextWave >= 3 ? { kind: "fill" as const, title: "控速", detail: "补寒冰压前锋", color: COLORS.cyan } :
      counts("thorn") < 1 && nextWave >= 4 ? { kind: "fill" as const, title: "封路", detail: "地刺守拐点", color: COLORS.lime } :
      counts("corn") < 1 && nextWave >= 5 ? { kind: "fill" as const, title: "清群", detail: "玉米炸中段", color: COLORS.yellow } :
      { kind: "fill" as const, title: "强化", detail: "升级核心火力", color: COLORS.green };
    const tempoCard =
      this.rhythm.includes("快") ? { kind: "intent" as const, title: "快进", detail: this.rhythm, color: COLORS.yellow } :
      this.rhythm.includes("刹") || this.rhythm.includes("防守") ? { kind: "intent" as const, title: "刹车", detail: this.rhythm, color: COLORS.cyan } :
      { kind: "intent" as const, title: "稳节奏", detail: this.autoWave ? "自动开波" : "手动开波", color: COLORS.green };
    const intentCard = this.getIntentCards(nextWave).find((card) => card.recommended) ?? this.getIntentCards(nextWave)[0];
    return [
      { kind: "pressure", title: `压${hotspot.title}`, detail: `${hotspot.score} · ${hotspot.need}`, color: hotspot.color },
      fillCard,
      this.intentMode ? { kind: "intent", title: intentCard.title, detail: `${intentCard.detail} · ${this.rhythm}`, color: intentCard.color } : tempoCard,
    ];
  }

  private refreshOpsDeck(reason: string, countAction = false) {
    const nextWave = Math.min(MAX_WAVE, this.mode === "wave" ? this.wave : this.wave + 1);
    const profile = this.getRoutePressureProfile(nextWave);
    const hotspot = profile[0];
    this.laneFocus = hotspot.title;
    this.routePressure = hotspot.score;
    this.opsCards = this.getOpsCards(nextWave).map((card) => `${card.title}：${card.detail}`);
    if (countAction) {
      this.opsDeckActions += 1;
      if (!this.runRules.includes("作战手牌")) this.runRules.push("作战手牌");
    }
    this.lastTempoPlan = this.lastTempoPlan === "待命" ? `${reason}：${this.rhythm}` : this.lastTempoPlan;
    this.updateOpsDeckPanel();
    return profile;
  }

  private applyTempoGovernor(nextWave: number, reason: string) {
    const before = this.gameSpeed;
    const ratio = this.getBalanceRatio(nextWave);
    const band = this.getTargetRatioBand(nextWave);
    const livePressure = this.mode === "wave" ? this.getLivePressureScore() : 0;
    let targetSpeed = 1;
    let rhythm = "稳扎推进";

    if (livePressure >= 72 || ratio < 0.98) {
      rhythm = "刹车防守";
      targetSpeed = 1;
    } else if ((this.cruiseMode || this.autoWave) && ratio >= 1.72) {
      rhythm = "高速巡航";
      targetSpeed = 2.5;
    } else if ((this.cruiseMode || this.autoWave) && ratio >= 1.28) {
      rhythm = "快进整备";
      targetSpeed = 1.5;
    } else if (this.cruiseMode && livePressure < 44 && ratio >= band.low) {
      rhythm = "巡航快进";
      targetSpeed = 1.5;
    }

    this.rhythm = rhythm;
    if (before !== targetSpeed && (this.tacticalQueueMode || this.cruiseMode || this.commandMode)) {
      this.gameSpeed = targetSpeed;
      this.tempoChanges += 1;
      this.lastTempoPlan = `${reason}：${before}x→${targetSpeed}x · ${rhythm}`;
      if (!this.runRules.includes("节奏调度")) this.runRules.push("节奏调度");
      this.toast(WIDTH / 2, 272, `节奏调度：${rhythm} ${targetSpeed}x`, rhythm.includes("快") || rhythm.includes("高速") ? COLORS.yellow : COLORS.cyan);
      return true;
    }
    this.lastTempoPlan = `${reason}：${rhythm} ${this.gameSpeed}x`;
    return false;
  }

  private countOpsDeckClick() {
    this.opsDeckActions += 1;
    this.savedClicks += 1;
    if (!this.runRules.includes("作战手牌")) this.runRules.push("作战手牌");
  }

  private executePressureOpsCard(reason: string) {
    const nextWave = Math.min(MAX_WAVE, this.mode === "wave" ? this.wave : this.wave + 1);
    const hotspot = this.getRoutePressureProfile(nextWave)[0];
    const before = { armor: this.wallArmor, plan: this.planActions, director: this.directorFieldOrders };
    if (this.mode === "planting") {
      const steps: string[] = [];
      this.applyStabilizeIntent(`${reason}压线`, steps);
      if (this.wallArmor <= before.armor && this.planActions <= before.plan && this.sun >= 22) {
        const spend = Math.min(this.sun, 24 + nextWave * 3);
        this.sun -= spend;
        this.wallArmor += Math.round(spend * 0.56);
      }
    } else if (this.mode === "wave") {
      const order: DirectorOrderKind = hotspot.title === "终点" || this.wallArmor < 16 ? "shieldWall" : "iceNet";
      this.executeDirectorOrder(order, `${reason}压${hotspot.title}`);
    }
    const changed = this.wallArmor > before.armor || this.planActions > before.plan || this.directorFieldOrders > before.director;
    this.addCombatFeed(`手牌压线：${hotspot.title} ${hotspot.score} · ${changed ? "已执行" : "保持阵线"}`, hotspot.color);
    this.refreshOpsDeck(reason);
    return this.getDebugState();
  }

  private executeFillOpsCard(reason: string) {
    const before = { plants: this.plants.length, plan: this.planActions, director: this.directorFieldOrders };
    if (this.mode === "planting") {
      this.runBattlePlan(`${reason}补强`);
      if (this.plants.length <= before.plants && this.planActions <= before.plan) this.runAutoGarden(`${reason}补位`);
    } else if (this.mode === "wave") {
      const order: DirectorOrderKind = this.plants.length < Math.min(9, 5 + Math.floor(this.wave / 2)) ? "seedDrop" : "overclock";
      this.executeDirectorOrder(order, `${reason}补强`);
    }
    const placed = Math.max(0, this.plants.length - before.plants);
    const planned = Math.max(0, this.planActions - before.plan);
    const directed = Math.max(0, this.directorFieldOrders - before.director);
    this.addCombatFeed(`手牌补强：补位${placed} · 计划${planned} · 指令${directed}`, COLORS.green);
    this.refreshOpsDeck(reason);
    return this.getDebugState();
  }

  private executeOpsCard(index = 2, reason = "手牌卡") {
    if (this.mode === "boot") this.beginRun();
    const nextWave = Math.min(MAX_WAVE, this.mode === "wave" ? this.wave : this.wave + 1);
    const card = this.getOpsCards(nextWave)[index] ?? this.getOpsCards(nextWave)[2];
    if (card.kind === "intent") return this.executeBattleIntent(this.pickRecommendedIntent(nextWave), `${reason}预案`);
    this.countOpsDeckClick();
    if (this.mode === "planting") {
      if (card.kind === "pressure") return this.executePressureOpsCard(reason);
      return this.executeFillOpsCard(reason);
    }
    if (this.mode === "wave") {
      if (card.kind === "pressure") return this.executePressureOpsCard(reason);
      return this.executeFillOpsCard(reason);
    }
    if (this.mode === "mutation") return this.chooseMutation(this.getRecommendedChoiceIndex(), "auto");
    return this.getDebugState();
  }

  private executeOpsDeck(reason: string) {
    return this.executeOpsCard(2, reason);
  }

  private getFocusCommand(): FocusCommand {
    if (!this.focusCommandMode) {
      return {
        kind: "none",
        title: "焦点关闭",
        detail: "保留手动操作",
        risk: "手动",
        color: COLORS.cyan,
        savings: 0,
      };
    }
    if (this.mode === "boot") {
      return {
        kind: "start",
        title: "进入战役",
        detail: "铺守门阵，开启管家、预案和手牌",
        risk: "开局",
        color: COLORS.green,
        savings: 4,
      };
    }
    if (this.mode === "planting") {
      const nextWave = Math.min(MAX_WAVE, this.wave + 1);
      const ratio = this.getBalanceRatio(nextWave);
      const band = this.getTargetRatioBand(nextWave);
      const plan = this.getWavePlan(nextWave);
      if (!this.cruiseMode) {
        return {
          kind: "cruise",
          title: "巡航接管",
          detail: `${plan.title} · 整备后自动开波`,
          risk: this.getBalanceVerdict(nextWave),
          color: ratio < band.low ? COLORS.cyan : COLORS.green,
          savings: 4,
        };
      }
      if (ratio < band.low || this.waveDecisionUsed <= 0) {
        return {
          kind: "steward",
          title: "一键整备",
          detail: `${plan.counter} · ${this.nextAdvice}`,
          risk: this.getBalanceVerdict(nextWave),
          color: COLORS.cyan,
          savings: 3,
        };
      }
      return {
        kind: "startWave",
        title: `开第 ${nextWave} 波`,
        detail: `${plan.title} · ${this.rhythm}`,
        risk: this.getBalanceVerdict(nextWave),
        color: plan.color,
        savings: 2,
      };
    }
    if (this.mode === "wave") {
      const pressure = this.getLivePressureScore();
      const hotspot = this.getRoutePressureProfile(this.wave)[0];
      if (pressure >= 58 || this.wallArmor < 16 || this.currentWaveLeaks > 0) {
        return {
          kind: "pressure",
          title: "现场救场",
          detail: `压${hotspot.title} ${hotspot.score} · ${hotspot.need}`,
          risk: `压力 ${pressure}`,
          color: hotspot.color,
          savings: 3,
        };
      }
      if (this.zombies.length > 0) {
        return {
          kind: "steward",
          title: "波中管家",
          detail: `${BATTLE_EVENT_DEFS[this.activeBattleEvent].title} · ${this.getWaveContract().title}`,
          risk: `压力 ${pressure}`,
          color: COLORS.cyan,
          savings: 2,
        };
      }
      return {
        kind: "ops",
        title: "补强收尾",
        detail: `${this.getWaveContract().title} · 准备下一张卡`,
        risk: "收尾",
        color: COLORS.green,
        savings: 2,
      };
    }
    if (this.mode === "mutation") {
      const index = this.getRecommendedChoiceIndex();
      const choice = this.currentChoices[index];
      return {
        kind: "mutation",
        title: "拿推荐卡",
        detail: choice ? `${choice.title} · ${this.getBuildFocus().title}` : "等待战利品",
        risk: this.getBuildFocus().title,
        color: choice ? RARITY_COLORS[choice.rarity] : COLORS.yellow,
        savings: 1,
      };
    }
    return {
      kind: "none",
      title: this.mode === "victory" ? "战役胜利" : "战役结束",
      detail: `分数 ${this.score} · 击杀 ${this.kills}`,
      risk: this.mode === "victory" ? "胜利" : "失败",
      color: this.mode === "victory" ? COLORS.green : COLORS.red,
      savings: 0,
    };
  }

  private executeFocusCommand(reason = "焦点指令") {
    const command = this.getFocusCommand();
    if (command.kind === "none") return this.getDebugState();
    this.focusCommandActions += 1;
    this.focusCommandSavings += command.savings;
    this.savedClicks += Math.max(1, command.savings);
    if (!this.runRules.includes("焦点指令")) this.runRules.push("焦点指令");
    this.addCombatFeed(`${reason}：${command.title} · ${command.detail}`, command.color);
    this.toast(WIDTH / 2, HEIGHT - 214, `${reason}：${command.title}`, command.color);

    if (command.kind === "start") return this.beginRun();
    if (command.kind === "cruise") {
      if (!this.cruiseMode) this.toggleCruiseMode(true);
      if (this.mode === "planting" && this.wave < MAX_WAVE) return this.startNextWave("cruise");
      return this.getDebugState();
    }
    if (command.kind === "startWave") return this.startNextWave(this.cruiseMode ? "cruise" : "auto");
    if (command.kind === "steward") return this.runCampaignSteward(reason);
    if (command.kind === "pressure") return this.executeOpsCard(0, reason);
    if (command.kind === "ops") return this.executeOpsCard(1, reason);
    if (command.kind === "mutation") return this.chooseMutation(this.getRecommendedChoiceIndex(), "auto");
    return this.getDebugState();
  }

  private getFocusLoopDelay(command: FocusCommand) {
    if (command.kind === "pressure") return 880;
    if (command.kind === "mutation") return 460;
    if (command.kind === "startWave") return 680;
    if (command.kind === "steward") return 1180;
    return 1460;
  }

  private shouldRunFocusLoop(command: FocusCommand) {
    if (!this.focusLoopMode || !this.focusCommandMode) return false;
    if (this.mode === "boot" || this.mode === "gameover" || this.mode === "victory") return false;
    if (command.kind === "none" || command.kind === "start" || command.kind === "cruise") return false;
    if (this.mode === "mutation") return this.autoStrategy || this.cruiseMode;
    if (this.mode === "planting") return this.cruiseMode && this.autoWave && this.wave < MAX_WAVE;
    if (this.mode === "wave") {
      const pressure = this.getLivePressureScore();
      if (command.kind === "pressure") return pressure >= 58 || this.wallArmor < 16 || this.currentWaveLeaks > 0;
      if (command.kind === "ops") return this.cruiseMode && this.zombies.length === 0 && this.spawned >= Math.max(1, this.spawnTarget - 1);
      return this.cruiseMode && this.zombies.length > 0 && this.directorWaveOrders < 3;
    }
    return false;
  }

  private updateFocusLoop(time: number) {
    if (time < this.nextFocusLoopAt) return;
    const command = this.getFocusCommand();
    if (!this.shouldRunFocusLoop(command)) return;
    const before = {
      actions: this.focusCommandActions,
      savings: this.focusCommandSavings,
      mode: this.mode,
      wave: this.wave,
    };
    this.executeFocusCommand("焦点巡航");
    const actionDelta = this.focusCommandActions - before.actions;
    const savingDelta = this.focusCommandSavings - before.savings;
    if (actionDelta > 0) {
      this.focusLoopActions += actionDelta;
      this.focusLoopSavings += Math.max(1, savingDelta);
      this.focusLoopLast = `${command.title} · 第${before.mode === "wave" ? before.wave : Math.min(MAX_WAVE, before.wave + 1)}波 · 省${Math.max(1, savingDelta)}`;
      if (!this.runRules.includes("焦点巡航")) this.runRules.push("焦点巡航");
      this.addCombatFeed(`焦点巡航：${this.focusLoopLast}`, command.color);
    }
    this.nextFocusLoopAt = time + this.getFocusLoopDelay(command);
  }

  private getDecisionBurden() {
    if (this.mode === "gameover" || this.mode === "victory") return 0;
    if (this.handsFreeMode && (this.cruiseMode || this.autoWave || this.autoStrategy)) return 0;
    if (this.mode === "mutation") return 1;
    if (this.mode === "planting") return Math.max(0, this.operationLoad);
    if (this.mode === "wave") return Math.max(0, this.operationLoad + (this.getLivePressureScore() > 68 ? 1 : 0));
    return 1;
  }

  private getHandsFreeDelay() {
    if (this.mode === "mutation") return 420;
    if (this.mode === "planting") return this.cruiseMode ? 640 : 980;
    if (this.mode === "wave") return this.getLivePressureScore() >= 58 ? 720 : 1280;
    return 1600;
  }

  private shouldRunHandsFreeLoop() {
    if (!this.handsFreeMode) return false;
    if (this.mode === "boot" || this.mode === "gameover" || this.mode === "victory") return false;
    if (this.mode === "mutation") return this.autoStrategy || this.cruiseMode;
    if (this.mode === "planting") return this.cruiseMode && this.autoWave;
    if (this.mode === "wave") return this.cruiseMode || this.getLivePressureScore() >= 68;
    return false;
  }

  private runHandsFreePulse(reason = "免手波次") {
    if (!this.handsFreeMode || this.mode === "gameover" || this.mode === "victory") return this.getDebugState();
    if (this.mode === "boot") {
      this.beginRun();
      return this.getDebugState();
    }

    const before = {
      mode: this.mode,
      wave: this.wave,
      campaign: this.campaignActions,
      focus: this.focusCommandActions,
      queue: this.queueActions,
      strategy: this.autoStrategyPicks,
      command: this.commandActions,
      saved: this.savedClicks + this.campaignSavedClicks + this.focusCommandSavings + this.queueSavedClicks + this.intentSavings,
      burden: this.getDecisionBurden(),
    };
    const steps: string[] = [];
    this.autoGarden = true;
    this.autoStrategy = true;
    this.autoWave = true;
    this.commandMode = true;
    this.battlePlanMode = true;
    if (!this.runRules.includes("免手波次")) this.runRules.push("免手波次");

    if (this.mode === "mutation") {
      const choice = this.currentChoices[this.getRecommendedChoiceIndex()];
      this.chooseMutation(this.getRecommendedChoiceIndex(), "auto");
      steps.push(`拿卡${choice?.title ?? "推荐"}`);
    } else if (this.mode === "planting") {
      this.runCampaignSteward(`${reason}整备`);
      steps.push("整备");
      if (this.wave < MAX_WAVE && (this.cruiseMode || before.burden === 0)) {
        this.startNextWave(this.cruiseMode ? "cruise" : "auto");
        steps.push("开波");
      }
    } else if (this.mode === "wave") {
      const pressure = this.getLivePressureScore();
      if (pressure >= 58 || this.wallArmor < 16 || this.currentWaveLeaks > 0) {
        this.executeFocusCommand(`${reason}救场`);
        steps.push("救场");
      } else if (this.zombies.length > 0) {
        this.runCampaignSteward(`${reason}巡线`);
        steps.push("巡线");
      } else {
        steps.push("等结算");
      }
    }

    const afterSaved = this.savedClicks + this.campaignSavedClicks + this.focusCommandSavings + this.queueSavedClicks + this.intentSavings;
    const actionDelta =
      this.campaignActions - before.campaign +
      this.focusCommandActions - before.focus +
      this.queueActions - before.queue +
      this.autoStrategyPicks - before.strategy +
      this.commandActions - before.command;
    const savedDelta = Math.max(0, afterSaved - before.saved);
    if (actionDelta > 0 || steps.length > 0) {
      const burden = this.getDecisionBurden();
      this.handsFreeActions += 1;
      this.handsFreeSavings += Math.max(1, savedDelta + Math.max(0, before.burden - burden));
      this.handsFreeStreak = burden === 0 ? this.handsFreeStreak + 1 : 0;
      this.handsFreeLast = `${[...new Set(steps)].join(" / ")} · 第${before.mode === "wave" ? before.wave : Math.min(MAX_WAVE, before.wave + 1)}波 · 负担${burden}`;
      this.addCombatFeed(`免手波次：${this.handsFreeLast}`, COLORS.green);
    }
    return this.getDebugState();
  }

  private updateHandsFreeLoop(time: number) {
    if (time < this.nextHandsFreeAt || !this.shouldRunHandsFreeLoop()) return;
    this.runHandsFreePulse("免手心跳");
    this.nextHandsFreeAt = time + this.getHandsFreeDelay();
  }

  private handsFreeForDebug(ticks = 4) {
    if (this.mode === "boot") this.beginRun();
    if (!this.cruiseMode && this.mode !== "gameover" && this.mode !== "victory") this.toggleCruiseMode(true);
    for (let i = 0; i < ticks; i += 1) {
      if (this.mode === "gameover" || this.mode === "victory") break;
      this.nextHandsFreeAt = 0;
      this.runHandsFreePulse("调试免手");
      if (this.mode === "wave") this.forceMutationForDebug();
    }
    return this.getDebugState();
  }

  private updateFocusCommandPanel() {
    if (!this.focusCommandPanel || !this.focusCommandBg) return;
    const command = this.getFocusCommand();
    const visible = this.focusCommandMode && this.mode !== "gameover" && this.mode !== "victory";
    this.focusCommandPanel.setVisible(visible);
    this.focusCommandBg.setStrokeStyle(2, command.color, 0.78);
    this.focusCommandBg.setFillStyle(command.color, command.kind === "pressure" ? 0.22 : 0.12);
    this.focusCommandTitleText.setText(command.title);
    this.focusCommandTitleText.setColor(Phaser.Display.Color.IntegerToColor(command.color).rgba);
    this.focusCommandDetailText.setText(command.detail);
    this.focusCommandMetaText.setText(`${command.risk}\n省 ${command.savings} 步\n免手 ${this.handsFreeActions}`);
  }

  private updateOpsDeckPanel() {
    if (!this.opsDeckPanel || !this.opsDeckTitle) return;
    this.opsDeckPanel.setVisible(this.opsDeckMode && this.mode !== "boot" && this.mode !== "gameover" && this.mode !== "victory");
    const nextWave = Math.min(MAX_WAVE, this.mode === "wave" ? this.wave : this.wave + 1);
    const cards = this.getOpsCards(nextWave);
    const intents = this.getIntentCards(nextWave);
    this.opsDeckTitle.setText(
      this.campaignMode
        ? `战役管家 · ${this.activeWavePlan.title} · 决策${this.waveDecisionUsed}/${this.waveDecisionBudget}`
        : `作战手牌 · ${this.activeWavePlan.title} · ${this.getIntentTitle(this.activeIntent)}`,
    );
    intents.forEach((card, index) => {
      const bg = this.intentCardBgs[index];
      const text = this.intentCardTexts[index];
      bg?.setStrokeStyle(card.recommended ? 2 : 1, card.color, card.recommended ? 0.88 : 0.42);
      bg?.setFillStyle(this.activeIntent === card.kind ? card.color : 0x101b24, this.activeIntent === card.kind ? 0.18 : 0.88);
      text?.setText(`${card.recommended ? "荐" : "备"}${card.title}\n${card.tag}`);
      text?.setColor(Phaser.Display.Color.IntegerToColor(card.color).rgba);
    });
    cards.forEach((card, index) => {
      const bg = this.opsDeckCardBgs[index];
      const text = this.opsDeckCardTexts[index];
      bg?.setStrokeStyle(1, card.color, 0.68);
      text?.setText(`${card.title}\n${card.detail}`);
      text?.setColor(Phaser.Display.Color.IntegerToColor(card.color).rgba);
    });
  }

  private pickBattleEvent(wave: number): BattleEventKind {
    if (wave >= MAX_WAVE) return "nightRush";
    const cycle: BattleEventKind[] = ["supplyRain", "rootBloom", "fogRaid", "nightRush"];
    if (wave <= 1) return "supplyRain";
    if (this.getDefenseScore() < this.getThreatScore(wave) * 0.92) return "supplyRain";
    return cycle[(wave + this.battleEventTriggers) % cycle.length];
  }

  private getWavePlan(wave = Math.max(1, this.mode === "wave" ? this.wave : this.wave + 1)): WavePlan {
    const profile = this.getRoutePressureProfile(Math.min(MAX_WAVE, wave));
    const hotspot = profile[0];
    const hasIce = this.plants.some((plant) => plant.kind === "ice");
    const hasCorn = this.plants.some((plant) => plant.kind === "corn");
    const hasThorn = this.plants.some((plant) => plant.kind === "thorn");

    if (wave >= MAX_WAVE) {
      return {
        kind: "boss",
        title: "脑核围城",
        mix: ["bucket", "runner", "swarm", "boss"],
        counter: "保终点护盾，强杀 Boss",
        lane: hotspot.title,
        pressure: Math.max(84, hotspot.score),
        color: COLORS.red,
      };
    }
    if (hotspot.score >= 78 || wave >= 8) {
      return {
        kind: "siege",
        title: "终点围压",
        mix: ["bucket", "cone", "runner"],
        counter: hasThorn ? "补护盾和爆发" : "补地刺封终点",
        lane: hotspot.title,
        pressure: hotspot.score,
        color: COLORS.pink,
      };
    }
    if (this.activeBattleEvent === "fogRaid" || (wave >= 4 && !hasIce)) {
      return {
        kind: "rush",
        title: "雾跑先锋",
        mix: ["runner", "walker", "cone"],
        counter: hasIce ? "寒冰压前锋" : "优先补寒冰",
        lane: hotspot.title,
        pressure: hotspot.score,
        color: COLORS.cyan,
      };
    }
    if (wave >= 7 || (wave >= 5 && !hasCorn)) {
      return {
        kind: "armor",
        title: "铁桶护卫",
        mix: ["bucket", "cone", "walker"],
        counter: hasCorn ? "玉米破甲清群" : "优先补玉米",
        lane: hotspot.title,
        pressure: hotspot.score,
        color: COLORS.blue,
      };
    }
    if (this.activeBattleEvent === "nightRush" || wave >= 5) {
      return {
        kind: "swarm",
        title: "群尸潮",
        mix: ["swarm", "runner", "walker"],
        counter: hasCorn || hasThorn ? "守拐点清群" : "补玉米或地刺",
        lane: hotspot.title,
        pressure: hotspot.score,
        color: COLORS.lime,
      };
    }
    return {
      kind: "training",
      title: "开局试探",
      mix: wave >= 3 ? ["cone", "walker", "runner"] : ["walker", "runner"],
      counter: "补豌豆，保入口",
      lane: hotspot.title,
      pressure: hotspot.score,
      color: COLORS.green,
    };
  }

  private activateWavePlan(wave: number) {
    this.activeWavePlan = this.getWavePlan(wave);
    const line = `波次蓝图：${this.activeWavePlan.title} · ${this.activeWavePlan.lane}${this.activeWavePlan.pressure} · ${this.activeWavePlan.counter}`;
    this.wavePlanHistory.push(line);
    if (this.wavePlanHistory.length > 7) this.wavePlanHistory.shift();
    this.addCombatFeed(line, this.activeWavePlan.color);
    this.toast(WIDTH / 2, 186, line, this.activeWavePlan.color);
  }

  private activateBattleEvent(kind: BattleEventKind) {
    this.activeBattleEvent = kind;
    this.battleEventTriggers += 1;
    this.battleEventHistory.push(BATTLE_EVENT_DEFS[kind].title);
    if (this.battleEventHistory.length > 6) this.battleEventHistory.shift();
    this.battleEventSpawnExtra = 0;
    this.battleEventSunYieldBonus = 0;
    this.battleEventDamageMultiplier = 1;
    this.battleEventSpeedMultiplier = 1;

    if (kind === "supplyRain") {
      const supply = 28 + this.wave * 4;
      this.sun += supply;
      this.battleEventSunYieldBonus = 4 + Math.floor(this.wave / 3);
      this.spawnDelay *= 1.05;
      this.toast(WIDTH / 2, 126, `战场事件：补给雨 +${supply} 阳光`, COLORS.yellow);
    } else if (kind === "rootBloom") {
      this.battleEventDamageMultiplier = 1.16;
      this.wallArmor += 6 + Math.floor(this.wave / 2);
      this.toast(WIDTH / 2, 126, "战场事件：藤蔓疯长，近路植物火力提升", COLORS.lime);
    } else if (kind === "fogRaid") {
      this.battleEventSpeedMultiplier = 1.12;
      this.spawnDelay *= 0.9;
      if (this.battlePlanMode) this.wallArmor += 8;
      this.toast(WIDTH / 2, 126, "战场事件：薄雾突袭，前锋加速", COLORS.cyan);
    } else if (kind === "nightRush") {
      this.battleEventSpeedMultiplier = 1.08;
      this.battleEventSpawnExtra = 2 + Math.floor(this.wave / 4);
      this.spawnTarget += this.battleEventSpawnExtra;
      this.spawnDelay *= 0.84;
      this.toast(WIDTH / 2, 126, `战场事件：夜袭压迫 +${this.battleEventSpawnExtra} 只`, COLORS.purple);
    }

    this.renderBattleEventMarkers();
  }

  private renderBattleEventMarkers() {
    this.eventLayer.removeAll(true);
    const meta = BATTLE_EVENT_DEFS[this.activeBattleEvent];
    const markerIndices = this.activeBattleEvent === "calm" ? [2] : [2, 5, 8];
    for (const [index, pathIndex] of markerIndices.entries()) {
      const point = PATH[Math.min(pathIndex, PATH.length - 2)];
      const marker = this.add.container(point.x, point.y + 48);
      const ring = this.add.circle(0, 0, 24 + index * 4, meta.color, 0.1)
        .setStrokeStyle(2, meta.color, 0.42)
        .setBlendMode(Phaser.BlendModes.ADD);
      const pin = this.add.rectangle(0, 0, 34, 24, 0x071017, 0.68)
        .setStrokeStyle(2, meta.color, 0.72);
      const text = this.add.text(0, 0, meta.label, {
        color: "#f4fbff",
        fontSize: "14px",
        fontStyle: "900",
        stroke: "#071017",
        strokeThickness: 3,
      }).setOrigin(0.5);
      marker.add([ring, pin, text]);
      this.eventLayer.add(marker);
      this.tweens.add({
        targets: ring,
        scale: 1.25,
        alpha: 0.1,
        yoyo: true,
        repeat: -1,
        duration: 760 + index * 130,
        ease: "Sine.easeInOut",
      });
    }
  }

  private getWaveContract(kind = this.activeContract, wave = Math.max(1, this.wave)): WaveContract {
    const baseReward = 22 + wave * 4 + this.contractStreak * 3;
    if (kind === "perfect") {
      return {
        kind,
        title: "完美守门",
        goal: "本波不漏脑子，护盾可吸收但不能被突破",
        reward: baseReward + 8,
        color: COLORS.green,
      };
    }
    if (kind === "hold") {
      return {
        kind,
        title: "压住终点",
        goal: "终点漏防不超过 1 次，波末仍有护盾",
        reward: baseReward + 5,
        color: COLORS.cyan,
      };
    }
    if (kind === "bounty") {
      return {
        kind,
        title: "阳光悬赏",
        goal: `本波击杀赚到 ${this.getContractSunTarget(wave)} 阳光`,
        reward: baseReward + 10,
        color: COLORS.yellow,
      };
    }
    return {
      kind,
      title: "猎杀前锋",
      goal: `本波击倒至少 ${this.getContractKillTarget(wave)} 只僵尸`,
      reward: baseReward + 6,
      color: COLORS.red,
    };
  }

  private pickWaveContract(wave: number): WaveContractKind {
    const ratio = this.getBalanceRatio(wave);
    if (wave <= 1) return "perfect";
    if (this.routePressure >= 64 || this.wallArmor < 18 || ratio < 1.05) return "hold";
    if (this.activeIntent === "economy" || this.getBuildFocus().kind === "economy" || this.bountyBonus >= 4) return "bounty";
    if (ratio >= 1.42 || this.activeIntent === "burst") return "hunt";
    return this.perfectWaves >= 1 ? "bounty" : "perfect";
  }

  private activateWaveContract() {
    if (!this.contractMode) return;
    this.activeContract = this.pickWaveContract(this.wave);
    if (!this.runRules.includes("波次契约")) this.runRules.push("波次契约");
    const contract = this.getWaveContract();
    this.addCombatFeed(`波次契约：${contract.title} · ${contract.goal}`, contract.color);
    this.toast(WIDTH / 2, 214, `波次契约：${contract.title}`, contract.color);
  }

  private getContractKillTarget(wave = this.wave) {
    return Math.max(2, Math.min(this.spawnTarget, Math.ceil((5 + wave * 2) * 0.45)));
  }

  private getContractSunTarget(wave = this.wave) {
    return 34 + wave * 7 + Math.max(0, this.adaptiveIntensity - 1) * 20;
  }

  private getContractProgress() {
    if (!this.contractMode) return "关闭";
    if (this.mode !== "wave") {
      const last = this.contractHistory[0];
      return last ? last : `${this.getWaveContract(this.activeContract, Math.max(1, this.wave + 1)).title}待命`;
    }
    if (this.activeContract === "perfect") return `漏防 ${this.currentWaveLeaks}/0 · 脑损 ${Math.max(0, this.waveStartBrain - this.brainHp)}`;
    if (this.activeContract === "hold") return `漏防 ${this.currentWaveLeaks}/1 · 护盾 ${Math.ceil(this.wallArmor)}`;
    if (this.activeContract === "bounty") return `阳光 ${Math.round(this.waveSunGained)}/${Math.round(this.getContractSunTarget())}`;
    return `击杀 ${this.waveKills}/${this.getContractKillTarget()}`;
  }

  private resolveWaveContract(brainLost: number) {
    if (!this.contractMode || this.wave <= 0) return;
    const contract = this.getWaveContract();
    const completed =
      this.activeContract === "perfect" ? this.currentWaveLeaks === 0 && brainLost === 0 :
      this.activeContract === "hold" ? this.currentWaveLeaks <= 1 && this.wallArmor > 0 :
      this.activeContract === "bounty" ? this.waveSunGained >= this.getContractSunTarget() :
      this.waveKills >= this.getContractKillTarget();

    if (completed) {
      const reward = Math.round(contract.reward);
      this.contractCompleted += 1;
      this.contractRewards += reward;
      this.contractStreak += 1;
      this.sun += reward;
      this.waveSunGained += reward;
      if (this.activeContract === "hold") this.wallArmor += 10 + Math.floor(this.wave / 2);
      if (this.activeContract === "bounty") this.bountyBonus += 1;
      if (this.activeContract === "hunt") this.globalFireDelayMultiplier *= 0.988;
      const line = `契约完成：${contract.title} · 奖励 +${reward}`;
      this.contractHistory.unshift(line);
      this.addCombatFeed(line, contract.color);
      this.toast(WIDTH / 2, 214, line, contract.color);
    } else {
      this.contractStreak = 0;
      const line = `契约未成：${contract.title} · ${this.getContractProgress()}`;
      this.contractHistory.unshift(line);
      this.addCombatFeed(line, COLORS.yellow);
    }
    if (this.contractHistory.length > 6) this.contractHistory.pop();
  }

  private getBuildFocus(): BuildFocus {
    const count = (kind: PlantKind) => this.plants.filter((plant) => plant.kind === kind).length;
    const sum = (fn: (plant: Plant) => number) => this.plants.reduce((total, plant) => total + fn(plant), 0);
    const scores: Array<BuildFocus & { raw: number }> = [
      {
        kind: "control",
        title: "藤蔓控场",
        advice: "优先拿寒流、荆棘或护脑，拖住前锋再补输出",
        color: COLORS.cyan,
        raw: count("ice") * 28 + count("thorn") * 24 + sum((plant) => plant.slow * 42 + plant.auraSlow * 52) + this.wallArmor * 0.24,
        score: 0,
      },
      {
        kind: "blast",
        title: "玉米爆破",
        advice: "优先拿爆米花、专注火力或全局光合，清群更稳",
        color: COLORS.yellow,
        raw: count("corn") * 36 + sum((plant) => plant.kind === "corn" ? plant.damage * 0.7 + plant.splash * 0.45 : 0),
        score: 0,
      },
      {
        kind: "economy",
        title: "日照经济",
        advice: "保持防守预算，再拿日照、悬赏或种子补给滚雪球",
        color: COLORS.orange,
        raw: count("sunflower") * 30 + sum((plant) => plant.sunYield * 1.45 + plant.solarHaste * 90) + this.bountyBonus * 5 + this.sun * 0.05,
        score: 0,
      },
      {
        kind: "fireline",
        title: "豌豆火线",
        advice: "优先拿连射、暴击和复制插枝，把主路压穿",
        color: COLORS.green,
        raw: count("pea") * 32 + sum((plant) => plant.kind === "pea" ? plant.damage * 0.8 + plant.multishot * 18 + plant.critChance * 60 : 0),
        score: 0,
      },
    ];
    const ranked = scores
      .map((item) => ({ ...item, score: Math.round(item.raw) }))
      .sort((a, b) => b.score - a.score);
    const [first, second] = ranked;
    if (first && second && first.score - second.score <= 10 && this.plants.length >= 6) {
      return {
        kind: "hybrid",
        title: "混编成长",
        advice: "拿全局光合、复制或巡航，把现有强点一起放大",
        color: COLORS.purple,
        score: Math.round((first.score + second.score) / 2),
      };
    }
    return first ?? {
      kind: "hybrid",
      title: "混编成长",
      advice: "先补稳定输出，再根据掉落决定流派",
      color: COLORS.purple,
      score: 0,
    };
  }

  private getTacticalBrief() {
    const nextWave = Math.min(MAX_WAVE, this.wave + 1);
    const plan = this.mode === "wave" ? this.activeWavePlan : this.getWavePlan(nextWave);
    const threat = this.getThreatScore(nextWave);
    const defense = this.getDefenseScore();
    const ratio = defense / Math.max(1, threat);
    const verdict = ratio >= 1.08 ? "优势" : ratio >= 0.92 ? "可守" : "偏弱";
    const cruise = this.cruiseMode ? "巡航接管" : this.autoWave ? "自动开波" : "手动整备";
    const event = this.activeBattleEvent === "calm" ? "" : ` · 事件 ${BATTLE_EVENT_DEFS[this.activeBattleEvent].title}`;
    const director = this.directorFieldOrders > 0 ? ` · 导演 ${this.directorLastOrder}` : "";
    const intensity = ` · 强度 ${this.adaptiveIntensity.toFixed(2)}`;
    const queue = this.tacticalQueueMode ? ` · 队列 ${this.balanceVerdict}` : "";
    const balance = this.balanceAdjustments > 0 ? ` · 平衡 ${this.balanceLastAdjustment}` : "";
    const ops = this.opsDeckMode ? ` · 热点 ${this.laneFocus}${this.routePressure} · ${this.rhythm}` : "";
    const intent = this.intentMode ? ` · 预案 ${this.lastIntentPlan}` : "";
    const focus = this.getBuildFocus();
    const contract = this.contractMode ? ` · 契约 ${this.getWaveContract().title} ${this.getContractProgress()}` : "";
    const blueprint = ` · 蓝图 ${plan.title}/${plan.counter}`;
    return `${cruise} · 下波${nextWave} ${this.getWavePreviewText()}${blueprint} · 战力 ${defense}/${threat} ${verdict}${queue}${intent}${contract} · ${this.operationLedger} · 构筑 ${focus.title}${intensity}${ops}${event}${director}${balance} · ${this.balanceLedger}`;
  }

  private createPlantSprite(kind: PlantKind, x: number, y: number) {
    const container = this.add.container(x, y);
    container.setDepth(30);
    container.setSize(64, 64);
    container.setInteractive(new Phaser.Geom.Circle(0, 0, 36), Phaser.Geom.Circle.Contains);
    const shadow = this.add.ellipse(0, 22, 58, 20, 0x121912, 0.38);
    const image = this.add.image(0, -4, PLANT_TEXTURES[kind]).setDisplaySize(kind === "thorn" ? 72 : 78, kind === "thorn" ? 72 : 78);
    container.add([shadow, image]);
    container.on("pointerdown", () => {
      this.selectedPlant = this.plants.find((plant) => plant.sprite === container) ?? null;
      this.seedArmed = false;
      this.updatePlantSelection();
      this.updateCardState();
      this.updatePlacementGhost();
    });
    return container;
  }

  private updateSpawning(time: number) {
    if (this.spawned >= this.spawnTarget || time < this.nextSpawnAt) return;
    this.spawnZombie(this.pickZombieKind());
    this.spawned += 1;
    this.nextSpawnAt = time + this.spawnDelay * Phaser.Math.FloatBetween(0.76, 1.2);
  }

  private pickZombieKind(): ZombieKind {
    if (this.wave === MAX_WAVE && this.spawned === this.spawnTarget - 1) return "boss";
    const roll = Math.random();
    if (this.activeWavePlan.kind === "rush") return roll > 0.78 ? "cone" : roll > 0.24 ? "runner" : "walker";
    if (this.activeWavePlan.kind === "armor") return roll > 0.68 ? "bucket" : roll > 0.28 ? "cone" : "walker";
    if (this.activeWavePlan.kind === "swarm") return roll > 0.66 ? "runner" : roll > 0.22 ? "swarm" : "walker";
    if (this.activeWavePlan.kind === "siege") return roll > 0.72 ? "bucket" : roll > 0.42 ? "runner" : "cone";
    if (this.activeWavePlan.kind === "training" && this.wave <= 2) return roll > 0.86 ? "runner" : "walker";
    if (this.activeBattleEvent === "fogRaid" && this.spawned < 4) return this.wave >= 4 ? "runner" : "walker";
    if (this.activeBattleEvent === "nightRush" && roll > 0.42) return this.wave >= 5 ? (roll > 0.72 ? "swarm" : "runner") : "runner";
    if (this.wave >= 7 && roll > 0.82) return "bucket";
    if (this.wave >= 5 && roll > 0.68) return "swarm";
    if (this.wave >= 4 && roll > 0.52) return "runner";
    if (this.wave >= 3 && roll > 0.36) return "cone";
    return "walker";
  }

  private spawnZombie(kind: ZombieKind) {
    const stats = this.getZombieStats(kind);
    const start = PATH[0];
    const { container: sprite, body } = this.createZombieSprite(kind, start.x, start.y, stats.radius);
    const hpBar = this.add.rectangle(-18, -stats.radius - 12, 36, 4, COLORS.red, 0.95).setOrigin(0, 0.5);
    sprite.add(hpBar);
    const zombie: Zombie = {
      id: this.nextZombieId++,
      kind,
      x: start.x,
      y: start.y,
      radius: stats.radius,
      hp: stats.hp,
      maxHp: stats.hp,
      speed: stats.speed,
      damage: stats.damage,
      value: stats.value,
      targetIndex: 1,
      slowUntil: 0,
      slowMultiplier: 1,
      eventAlpha: this.activeBattleEvent === "fogRaid" && this.spawned < 4 ? 0.82 : 1,
      sprite,
      body,
      hpBar,
    };
    this.zombies.push(zombie);
    if (this.activeBattleEvent === "fogRaid" && this.spawned < 4) {
      zombie.body.setTint(0xc9f5ff);
      zombie.sprite.setAlpha(0.78);
    }
    if (kind === "boss") this.toast(WIDTH / 2, 96, "Boss 出现：守住最后一波！", COLORS.red);
  }

  private getZombieStats(kind: ZombieKind) {
    const scale = (1 + this.wave * 0.11) * this.adaptiveIntensity;
    const base = {
      walker: { hp: 70, speed: 54, damage: 9, value: 16, radius: 20 },
      runner: { hp: 50, speed: 92, damage: 8, value: 18, radius: 18 },
      cone: { hp: 130, speed: 48, damage: 13, value: 26, radius: 22 },
      bucket: { hp: 230, speed: 40, damage: 18, value: 38, radius: 24 },
      swarm: { hp: 42, speed: 78, damage: 6, value: 12, radius: 15 },
      boss: { hp: 1450, speed: 30, damage: 45, value: 180, radius: 38 },
    }[kind];
    return {
      hp: base.hp * scale * (kind === "boss" ? 1.6 : 1) * this.balancePressureMultiplier,
      speed: base.speed,
      damage: base.damage * (1 + Math.max(0, this.balancePressureMultiplier - 1) * 0.45),
      value: base.value,
      radius: base.radius,
    };
  }

  private createZombieSprite(kind: ZombieKind, x: number, y: number, radius: number) {
    const container = this.add.container(x, y);
    container.setDepth(24);
    const trait = this.getZombieTrait(kind);
    const shadow = this.add.ellipse(0, radius * 0.82, radius * 2.2, radius * 0.62, 0x05070a, 0.32);
    const sprite = this.add.image(0, 0, ZOMBIE_TEXTURES[kind])
      .setDisplaySize(radius * (kind === "boss" ? 3.6 : 3.0), radius * (kind === "boss" ? 3.6 : 3.0))
      .setTint(trait.tint);
    const ring = this.add.circle(0, 0, radius + 4, trait.color, 0)
      .setStrokeStyle(kind === "walker" ? 0 : 2, trait.color, kind === "walker" ? 0 : 0.48);
    const badge = this.add.text(0, -radius - 22, trait.label, {
      color: "#071017",
      backgroundColor: Phaser.Display.Color.IntegerToColor(trait.color).rgba,
      fontSize: kind === "boss" ? "14px" : "11px",
      fontStyle: "900",
      padding: { x: 4, y: 1 },
    }).setOrigin(0.5).setVisible(kind !== "walker");
    container.add([shadow, ring, sprite, badge]);
    return { container, body: sprite };
  }

  private getZombieTrait(kind: ZombieKind) {
    return {
      walker: { label: "", color: 0x9fb4bd, tint: 0xffffff },
      runner: { label: "快", color: COLORS.cyan, tint: 0xbff4ff },
      cone: { label: "硬", color: COLORS.orange, tint: 0xffd1a6 },
      bucket: { label: "甲", color: COLORS.blue, tint: 0xd8e8ff },
      swarm: { label: "群", color: COLORS.lime, tint: 0xcfff9a },
      boss: { label: "王", color: COLORS.red, tint: 0xffb0bf },
    }[kind];
  }

  private updatePlants(delta: number, time: number) {
    for (const plant of this.plants) {
      if (plant.sunYield > 0) this.updateSunflower(plant, delta);
      if (plant.auraDamage > 0 || plant.auraSlow > 0) this.updateAuraPlant(plant, delta, time);
      if (plant.damage <= 0) continue;

      plant.cooldown -= delta * 1000;
      if (plant.cooldown > 0) continue;
      const target = this.findTarget(plant);
      if (!target) continue;
      this.firePlant(plant, target);
      plant.cooldown = this.getEffectiveFireDelay(plant);
    }
  }

  private updateSunflower(plant: Plant, delta: number) {
    plant.sunTimer -= delta * 1000;
    if (plant.sunTimer > 0) return;
    plant.sunTimer = Math.max(2300, 5300 - plant.level * 220);
    const yieldAmount = plant.sunYield + this.battleEventSunYieldBonus;
    this.sun += yieldAmount;
    if (this.mode === "wave") this.waveSunGained += yieldAmount;
    this.pulsePlant(plant, 1.12);
    this.toast(plant.x, plant.y - 52, `+${yieldAmount}`, COLORS.yellow);
    this.burst(plant.x, plant.y - 18, COLORS.yellow, 8);
  }

  private updateAuraPlant(plant: Plant, delta: number, time: number) {
    const tickDamage = plant.auraDamage * this.globalDamageMultiplier * this.getBattleEventPlantMultiplier(plant) * delta;
    for (const zombie of this.zombies) {
      if (Phaser.Math.Distance.Between(plant.x, plant.y, zombie.x, zombie.y) > plant.range) continue;
      if (tickDamage > 0) this.damageZombie(zombie, tickDamage, PLANT_DEFS[plant.kind].color, plant.id);
      if (plant.auraSlow > 0) this.applySlow(zombie, plant.auraSlow, 280, time);
    }
  }

  private getEffectiveFireDelay(plant: Plant) {
    let delay = plant.fireDelay * this.globalFireDelayMultiplier;
    for (const sunflower of this.plants) {
      if (sunflower.solarHaste <= 0) continue;
      if (Phaser.Math.Distance.Between(plant.x, plant.y, sunflower.x, sunflower.y) <= sunflower.range) {
        delay *= 1 - sunflower.solarHaste;
      }
    }
    return Math.max(150, delay);
  }

  private findTarget(plant: Plant) {
    let best: Zombie | null = null;
    let bestProgress = -Infinity;
    for (const zombie of this.zombies) {
      if (Phaser.Math.Distance.Between(plant.x, plant.y, zombie.x, zombie.y) > plant.range) continue;
      const progress = this.getZombieProgress(zombie);
      if (progress > bestProgress) {
        bestProgress = progress;
        best = zombie;
      }
    }
    return best;
  }

  private firePlant(plant: Plant, target: Zombie) {
    const shots = plant.multishot;
    const baseAngle = Phaser.Math.Angle.Between(plant.x, plant.y, target.x, target.y);
    this.pulsePlant(plant, 1.08);
    this.muzzleFlash(plant, baseAngle);
    for (let i = 0; i < shots; i += 1) {
      const spread = (i - (shots - 1) / 2) * 0.13;
      const angle = baseAngle + spread;
      const speed = plant.kind === "corn" ? 360 : plant.kind === "ice" ? 420 : 500;
      const baseDamage = plant.damage * this.globalDamageMultiplier * this.getBattleEventPlantMultiplier(plant);
      const damage = Math.random() < plant.critChance ? baseDamage * 1.85 : baseDamage;
      const projectile = this.add.circle(plant.x, plant.y - 10, plant.kind === "corn" ? 8 : 6, PLANT_DEFS[plant.kind].color, 0.95);
      projectile.setDepth(38);
      projectile.setBlendMode(plant.kind === "ice" ? Phaser.BlendModes.ADD : Phaser.BlendModes.NORMAL);
      this.projectiles.push({
        x: plant.x,
        y: plant.y - 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: plant.kind === "corn" ? 9 : 7,
        damage,
        splash: plant.splash,
        pierce: plant.pierce,
        slow: plant.slow,
        slowDuration: plant.slowDuration,
        color: PLANT_DEFS[plant.kind].color,
        ttl: plant.range / speed + 0.55,
        ownerId: plant.id,
        sprite: projectile,
      });
    }
  }

  private updateProjectiles(delta: number, time: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
      const projectile = this.projectiles[i];
      projectile.ttl -= delta;
      projectile.x += projectile.vx * delta;
      projectile.y += projectile.vy * delta;
      projectile.sprite.setPosition(projectile.x, projectile.y);

      let hit = false;
      for (const zombie of [...this.zombies]) {
        if (Phaser.Math.Distance.Between(projectile.x, projectile.y, zombie.x, zombie.y) > projectile.radius + zombie.radius) continue;
        this.damageZombie(zombie, projectile.damage, projectile.color, projectile.ownerId);
        if (projectile.slow > 0) this.applySlow(zombie, projectile.slow, projectile.slowDuration, time);
        if (projectile.splash > 0) this.splashDamage(projectile, zombie, time);
        projectile.pierce -= 1;
        hit = projectile.pierce < 0;
        if (hit) break;
      }

      if (hit || projectile.ttl <= 0 || projectile.x < -80 || projectile.x > WIDTH + 80 || projectile.y < -80 || projectile.y > HEIGHT + 80) {
        projectile.sprite.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  private splashDamage(projectile: Projectile, center: Zombie, time: number) {
    const blast = this.add.circle(center.x, center.y, projectile.splash, projectile.color, 0.16)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(26);
    this.tweens.add({
      targets: blast,
      alpha: 0,
      scale: 1.35,
      duration: 260,
      ease: "Quad.easeOut",
      onComplete: () => blast.destroy(),
    });
    for (const zombie of [...this.zombies]) {
      if (zombie.id === center.id) continue;
      const dist = Phaser.Math.Distance.Between(center.x, center.y, zombie.x, zombie.y);
      if (dist > projectile.splash) continue;
      this.damageZombie(zombie, projectile.damage * (1 - dist / projectile.splash) * 0.72, projectile.color, projectile.ownerId);
      if (projectile.slow > 0) this.applySlow(zombie, projectile.slow, projectile.slowDuration * 0.65, time);
    }
  }

  private updateZombies(delta: number, time: number) {
    for (const zombie of [...this.zombies]) {
      const speed = zombie.speed * this.zombieSpeedMultiplier * this.battleEventSpeedMultiplier * (time < zombie.slowUntil ? zombie.slowMultiplier : 1);
      let travel = speed * delta;
      while (travel > 0 && zombie.targetIndex < PATH.length) {
        const target = PATH[zombie.targetIndex];
        const dist = Phaser.Math.Distance.Between(zombie.x, zombie.y, target.x, target.y);
        if (dist <= travel) {
          zombie.x = target.x;
          zombie.y = target.y;
          travel -= dist;
          zombie.targetIndex += 1;
        } else {
          const angle = Phaser.Math.Angle.Between(zombie.x, zombie.y, target.x, target.y);
          zombie.x += Math.cos(angle) * travel;
          zombie.y += Math.sin(angle) * travel;
          travel = 0;
        }
      }

      if (zombie.targetIndex >= PATH.length) {
        const absorbed = Math.min(this.wallArmor, zombie.damage);
        const leakDamage = zombie.damage - absorbed;
        this.wallArmor -= absorbed;
        this.brainHp -= leakDamage;
        this.currentWaveLeaks += 1;
        this.toast(
          PATH[PATH.length - 1].x - 60,
          PATH[PATH.length - 1].y - 64,
          absorbed > 0 ? `护盾 -${absorbed}${leakDamage > 0 ? ` / 脑子 -${leakDamage}` : ""}` : `-${zombie.damage}`,
          absorbed > 0 ? COLORS.cyan : COLORS.red,
        );
        this.addCombatFeed(absorbed > 0 ? `终点漏防：护盾吸收 ${absorbed}${leakDamage > 0 ? ` / 脑子 -${leakDamage}` : ""}` : `终点漏防：脑子 -${zombie.damage}`, absorbed > 0 ? COLORS.cyan : COLORS.red);
        this.removeZombie(zombie);
        if (this.brainHp <= 0) this.endRun(false);
        continue;
      }

      zombie.sprite.setPosition(zombie.x, zombie.y);
      zombie.sprite.setAlpha(time < zombie.slowUntil ? 0.72 : zombie.eventAlpha);
      zombie.hpBar.setDisplaySize(36 * Math.max(0, zombie.hp / zombie.maxHp), 4);
    }
  }

  private damageZombie(zombie: Zombie, amount: number, hitColor = COLORS.white, sourcePlantId?: number) {
    const actualDamage = Math.min(Math.max(0, zombie.hp), amount);
    zombie.hp -= amount;
    this.waveDamageDone += actualDamage;
    if (sourcePlantId !== undefined) {
      const source = this.plants.find((plant) => plant.id === sourcePlantId);
      if (source) source.damageDone += actualDamage;
    }
    if (amount >= 6) this.damagePopup(zombie, amount, hitColor);
    this.flashZombie(zombie, amount >= 35 ? COLORS.yellow : COLORS.white);
    if (zombie.hp > 0) return;
    if (zombie.kind === "swarm" && Math.random() < 0.45) {
      this.spawnZombie("walker");
      const spawned = this.zombies[this.zombies.length - 1];
      spawned.x = zombie.x;
      spawned.y = zombie.y;
      spawned.targetIndex = zombie.targetIndex;
      spawned.hp *= 0.42;
      spawned.maxHp = spawned.hp;
      spawned.value = 6;
    }
    this.kills += 1;
    this.waveKills += 1;
    this.score += zombie.value * 10;
    const sunReward = zombie.value + this.bountyBonus;
    this.sun += sunReward;
    this.waveSunGained += sunReward;
    const source = sourcePlantId !== undefined ? this.plants.find((plant) => plant.id === sourcePlantId) : null;
    if (source) {
      source.kills += 1;
      this.lastMvpPlant = this.formatPlantContribution(source);
      this.addCombatFeed(`${PLANT_DEFS[source.kind].name} #${source.id} 击倒${this.getZombieTrait(zombie.kind).label || "普"} · +${sunReward} 阳光`, PLANT_DEFS[source.kind].color);
    } else {
      this.addCombatFeed(`战场指令击倒${this.getZombieTrait(zombie.kind).label || "普"} · +${sunReward} 阳光`, hitColor);
    }
    this.burst(zombie.x, zombie.y, hitColor, zombie.kind === "boss" ? 26 : 8);
    this.removeZombie(zombie);
  }

  private applySlow(zombie: Zombie, slow: number, durationMs: number, time: number) {
    const oldSlowUntil = zombie.slowUntil;
    zombie.slowMultiplier = Math.min(zombie.slowMultiplier, Math.max(0.18, 1 - slow));
    zombie.slowUntil = Math.max(zombie.slowUntil, time + durationMs);
    if (durationMs >= 500 && zombie.slowUntil > oldSlowUntil + 160) this.slowPulse(zombie);
  }

  private removeZombie(zombie: Zombie) {
    zombie.sprite.destroy();
    this.zombies = this.zombies.filter((item) => item.id !== zombie.id);
  }

  private getZombieProgress(zombie: Zombie) {
    let progress = 0;
    for (let i = 1; i < zombie.targetIndex; i += 1) {
      progress += Phaser.Math.Distance.Between(PATH[i - 1].x, PATH[i - 1].y, PATH[i].x, PATH[i].y);
    }
    const previous = PATH[Math.max(0, zombie.targetIndex - 1)];
    progress += Phaser.Math.Distance.Between(previous.x, previous.y, zombie.x, zombie.y);
    return progress;
  }

  private checkWaveClear() {
    if (this.mode !== "wave") return;
    if (this.spawned < this.spawnTarget || this.zombies.length > 0) return;
    if (this.wave >= MAX_WAVE) {
      this.endRun(true);
      return;
    }
    this.settleWaveGrade();
    this.enterMutationPhase();
  }

  private settleWaveGrade() {
    const brainLost = Math.max(0, this.waveStartBrain - this.brainHp);
    const armorLost = Math.max(0, this.waveStartArmor - this.wallArmor);
    if (this.currentWaveLeaks === 0 && brainLost === 0) {
      this.perfectWaves += 1;
      this.lastWaveGrade = armorLost <= 2 ? "S" : "A";
    } else if (brainLost <= 8 && this.currentWaveLeaks <= 1) {
      this.lastWaveGrade = "B";
    } else {
      this.lastWaveGrade = "C";
    }
    this.resolveWaveContract(brainLost);
    const reward = this.lastWaveGrade === "S" ? 55 : this.lastWaveGrade === "A" ? 38 : this.lastWaveGrade === "B" ? 22 : 10;
    this.sun += reward + Math.min(35, this.perfectWaves * 5);
    this.waveSunGained += reward + Math.min(35, this.perfectWaves * 5);
    this.addCombatFeed(`波次评价 ${this.lastWaveGrade} · 漏防 ${this.currentWaveLeaks} · 补给 +${reward} · ${this.getMvpPlantLabel()}`, this.lastWaveGrade === "C" ? COLORS.yellow : COLORS.green);
    this.toast(WIDTH / 2, 156, `波次评价 ${this.lastWaveGrade} · 补给 +${reward}`, this.lastWaveGrade === "C" ? COLORS.yellow : COLORS.green);
    this.adjustAdaptiveIntensity(brainLost);
  }

  private adjustAdaptiveIntensity(brainLost: number) {
    const before = this.adaptiveIntensity;
    let delta = 0;
    let reason = "稳定";
    if (this.lastWaveGrade === "S" && this.directorWaveOrders <= 1) {
      delta = 0.035;
      reason = "连续优势，轻微加压";
    } else if (this.lastWaveGrade === "A" && this.perfectWaves >= 2) {
      delta = 0.018;
      reason = "表现稳定，微调加压";
    } else if (this.lastWaveGrade === "C" || brainLost > 10 || this.directorWaveOrders >= 3) {
      delta = -0.07;
      reason = "漏防或救场偏多，降压";
    } else if (this.lastWaveGrade === "B") {
      delta = -0.028;
      reason = "勉强守住，降一点";
    }
    this.adaptiveIntensity = Number(Phaser.Math.Clamp(this.adaptiveIntensity + delta, 0.84, 1.18).toFixed(2));
    this.fairnessDebt = Number(Phaser.Math.Clamp(this.fairnessDebt + (delta > 0 ? 1 : delta < 0 ? -1.2 : -0.15), -4, 5).toFixed(1));
    if (delta < 0) this.mercyBank += 10 + Math.ceil(brainLost);
    if (delta > 0 && this.mercyBank > 0) this.mercyBank = Math.max(0, this.mercyBank - 8);
    this.intensityReason = `${reason} ${before.toFixed(2)}→${this.adaptiveIntensity.toFixed(2)}`;
    this.balanceLedger = `账本 结算：${reason} · 公平债${this.fairnessDebt.toFixed(1)} · 怜悯库${Math.round(this.mercyBank)}`;
    this.intensityHistory.push(`${this.adaptiveIntensity.toFixed(2)} ${reason}`);
    if (this.intensityHistory.length > 6) this.intensityHistory.shift();
    if (Math.abs(this.adaptiveIntensity - before) >= 0.01) {
      this.toast(WIDTH / 2, 184, `强度校准：${this.intensityReason}`, delta > 0 ? COLORS.orange : COLORS.cyan);
    }
  }

  private enterMutationPhase() {
    this.mode = "mutation";
    this.startWaveButton.setVisible(false);
    this.currentMutationPlant = null;
    if (this.plants.length === 0) {
      this.sun += 80;
      this.mode = "planting";
      this.startWaveButton.setVisible(true);
      this.toast(WIDTH / 2, 96, "没有植物存活，补给 +80 阳光。", COLORS.yellow);
      return;
    }
    this.applyNaturalGrowth();
    this.currentChoices = this.generateStrategyChoices();
    this.renderMutationPanel();
    this.updatePlantBadges();
    this.scheduleAutoStrategy();
  }

  private openNextMutation() {
    this.autoStrategyTimer?.remove(false);
    this.autoStrategyTimer = null;
    this.mode = "planting";
    this.mutationLayer.setVisible(false);
    this.startWaveButton.setVisible(true);
    this.currentChoices = [];
    this.currentMutationPlant = null;
    this.selectedPlant = null;
    this.updatePlantSelection();
    this.updatePlantBadges();
    this.toast(WIDTH / 2, 96, "整备完成，准备下一波。", COLORS.green);
    this.scheduleAutoWave();
  }

  private renderMutationPanel() {
    this.mutationLayer.removeAll(true);
    this.mutationLayer.setVisible(true);
    const recommendedIndex = this.getRecommendedChoiceIndex();
    const focus = this.getBuildFocus();
    const veil = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x02070c, 0.56).setOrigin(0);
    const panel = this.add.rectangle(WIDTH / 2, HEIGHT / 2, 760, 360, COLORS.panel, 0.97).setStrokeStyle(2, COLORS.yellow, 0.86);
    const title = this.add.text(WIDTH / 2, HEIGHT / 2 - 140, `第 ${this.wave} 波战利品`, {
      color: "#f4fbff",
      fontSize: "24px",
      fontStyle: "900",
    }).setOrigin(0.5);
    const subtitle = this.add.text(WIDTH / 2, HEIGHT / 2 - 108, `${this.autoStrategy ? "自动策略会拿推荐卡" : "现在只选 1 张策略卡"} · 当前构筑：${focus.title} · ${focus.advice}`, {
      color: Phaser.Display.Color.IntegerToColor(focus.color).rgba,
      fontSize: "14px",
      wordWrap: { width: 680 },
    }).setOrigin(0.5);
    this.mutationLayer.add([veil, panel, title, subtitle]);
    this.currentChoices.forEach((choice, index) => {
      const x = WIDTH / 2 - 246 + index * 246;
      const y = HEIGHT / 2 + 28;
      const cardColor = RARITY_COLORS[choice.rarity];
      const bg = this.add.rectangle(x, y, 210, 188, 0x14212d, 0.98)
        .setStrokeStyle(2, cardColor, 0.86)
        .setInteractive({ useHandCursor: true });
      const rarity = this.add.text(x, y - 74, this.getRarityLabel(choice.rarity), {
        color: Phaser.Display.Color.IntegerToColor(cardColor).rgba,
        fontSize: "12px",
        fontStyle: "900",
      }).setOrigin(0.5);
      const name = this.add.text(x, y - 44, choice.title, {
        color: "#f4fbff",
        fontSize: "18px",
        fontStyle: "900",
        align: "center",
      }).setOrigin(0.5);
      const desc = this.add.text(x, y + 12, this.wrapCardText(choice.description), {
        color: "#c8dfeb",
        fontSize: "13px",
        align: "center",
        wordWrap: { width: 166 },
      }).setOrigin(0.5);
      const pick = this.add.text(x, y + 72, "选择", {
        color: "#071017",
        backgroundColor: "#ffd560",
        fontSize: "13px",
        fontStyle: "900",
        padding: { x: 10, y: 4 },
      }).setOrigin(0.5);
      const recommend = this.add.text(x, y - 98, "推荐", {
        color: "#071017",
        backgroundColor: "#6dff9a",
        fontSize: "12px",
        fontStyle: "900",
        padding: { x: 8, y: 3 },
      }).setOrigin(0.5).setVisible(index === recommendedIndex);
      bg.on("pointerdown", () => this.chooseMutation(index));
      pick.setInteractive({ useHandCursor: true }).on("pointerdown", () => this.chooseMutation(index));
      this.mutationLayer.add([bg, rarity, name, desc, pick, recommend]);
    });
  }

  private wrapCardText(text: string, maxChars = 13) {
    const lines: string[] = [];
    let current = "";
    for (const char of text) {
      current += char;
      if (current.length >= maxChars || "，。；、".includes(char)) {
        lines.push(current.trim());
        current = "";
      }
    }
    if (current.trim()) lines.push(current.trim());
    return lines.slice(0, 4).join("\n");
  }

  private chooseMutation(index: number, source: "manual" | "auto" = "manual") {
    if (this.mode !== "mutation" || !this.currentChoices[index]) return this.getDebugState();
    this.autoStrategyTimer?.remove(false);
    this.autoStrategyTimer = null;
    const choice = this.currentChoices[index];
    const affectedPlants = choice.apply();
    if (choice.rule && !this.runRules.includes(choice.rule)) this.runRules.push(choice.rule);
    for (const plant of affectedPlants) {
      plant.mutations.push(choice.title);
    }
    const burstTargets = affectedPlants.length > 0 ? affectedPlants : this.plants;
    for (const plant of burstTargets) {
      this.burst(plant.x, plant.y, RARITY_COLORS[choice.rarity], choice.rarity === "epic" ? 10 : 5);
    }
    if (source === "auto") {
      this.autoStrategyPicks += 1;
      this.savedClicks += 1;
      this.recordQueueAutoPick(choice.title);
    }
    this.toast(WIDTH / 2, 96, `${source === "auto" ? "自动策略：" : "获得："}${choice.title}`, RARITY_COLORS[choice.rarity]);
    this.openNextMutation();
    return this.getDebugState();
  }

  private applyNaturalGrowth() {
    const heal = Math.min(this.maxBrainHp - this.brainHp, 4 + Math.floor(this.wave / 3));
    this.brainHp += heal;
    const passiveSun = 25 + this.wave * 5;
    this.sun += passiveSun;

    for (const plant of this.plants) {
      plant.level += 1;
      plant.damage = Math.max(plant.damage, plant.damage * 1.06 + (plant.damage > 0 ? 2 : 0));
      plant.auraDamage += plant.auraDamage > 0 ? 1.4 : 0;
      plant.range += plant.level % 3 === 0 ? 8 : 0;
      plant.fireDelay *= 0.985;
      plant.sunYield += plant.sunYield > 0 && plant.level % 2 === 0 ? 2 : 0;
      plant.rangeRing.setRadius(plant.range);
      plant.badge.setText("+");
      plant.badge.setVisible(true);
    }
    this.toast(WIDTH / 2, 126, `自然成长：全体 +1 级，补给 +${passiveSun} 阳光${heal > 0 ? `，脑子 +${heal}` : ""}`, COLORS.green);
  }

  private generateStrategyChoices() {
    const has = (kind: PlantKind) => this.plants.some((plant) => plant.kind === kind);
    const buff = (predicate: (plant: Plant) => boolean, apply: (plant: Plant) => void) => {
      const affected = this.plants.filter(predicate);
      for (const plant of affected) {
        apply(plant);
      }
      return affected;
    };

    const universal: Mutation[] = [
      {
        title: "全园修整",
        rarity: "common",
        description: "脑子回复 16 点，全体植物范围 +10。",
        apply: () => {
          this.brainHp = Math.min(this.maxBrainHp, this.brainHp + 16);
          return buff(() => true, (p) => {
            p.range += 10;
            p.rangeRing.setRadius(p.range);
          });
        },
      },
      {
        title: "专注火力",
        rarity: "common",
        description: "所有会攻击的植物攻击速度提升 12%。",
        apply: () => {
          return buff((p) => p.damage > 0 || p.auraDamage > 0, (p) => {
            p.fireDelay *= 0.88;
            p.auraDamage *= p.auraDamage > 0 ? 1.08 : 1;
          });
        },
      },
      {
        title: "种子补给",
        rarity: "common",
        description: "立即获得 140 阳光，用来补位或扩建。",
        apply: () => {
          this.sun += 140;
          return [];
        },
      },
      {
        title: "幸运叶绿素",
        rarity: "rare",
        description: "所有远程植物获得 12% 暴击率。",
        apply: () => {
          return buff((p) => p.damage > 0 && p.kind !== "thorn", (p) => {
            p.critChance = Math.min(0.55, p.critChance + 0.12);
          });
        },
      },
      {
        title: "护脑工事",
        rarity: "common",
        description: "获得 24 点护盾，之后漏怪会先消耗护盾。",
        rule: "护脑工事",
        apply: () => {
          this.wallArmor += 24;
          return [];
        },
      },
    ];

    const tactical: Mutation[] = [
      {
        title: "空投豌豆",
        rarity: "common",
        description: "在前线空地免费种下一棵豌豆射手。",
        apply: () => this.summonPlant("pea", [0, 3, 4, 5, 8, 11, 12]),
      },
      {
        title: "临时冰墙",
        rarity: "rare",
        description: "免费种下一棵寒冰豌豆，并使尸潮速度降低 7%。",
        rule: "尸潮减速",
        apply: () => {
          this.zombieSpeedMultiplier = Math.max(0.78, this.zombieSpeedMultiplier * 0.93);
          return this.summonPlant("ice", [6, 7, 10, 11, 14, 15]);
        },
      },
      {
        title: "复制插枝",
        rarity: "epic",
        description: "复制当前战力最高的植物到附近空地，复制体略弱。",
        apply: () => this.duplicateBestPlant(),
      },
      {
        title: "悬赏阳光",
        rarity: "rare",
        description: "之后每个击杀额外 +5 阳光。",
        rule: "悬赏 +5",
        apply: () => {
          this.bountyBonus += 5;
          return [];
        },
      },
      {
        title: "战斗巡航",
        rarity: "common",
        description: "开启巡航模式：自动补种、拿卡、开波，并提速到 1.5x。",
        rule: "自动巡航",
        apply: () => {
          this.toggleCruiseMode(true);
          return [];
        },
      },
    ];

    const synergy: Mutation[] = [];
    if (has("pea")) {
      synergy.push({
        title: "豌豆连射阵",
        rarity: "rare",
        description: "所有豌豆射手额外连射，但单发略弱。",
        apply: () => {
          return buff((p) => p.kind === "pea", (p) => {
            p.multishot += 1;
            p.damage *= 0.92;
          });
        },
      });
    }
    if (has("sunflower")) {
      synergy.push({
        title: "日照经济",
        rarity: "rare",
        description: "向日葵产量 +8，并给附近植物少量加速。",
        apply: () => {
          return buff((p) => p.kind === "sunflower", (p) => {
            p.sunYield += 8;
            p.solarHaste = Math.min(0.32, p.solarHaste + 0.08);
            p.range += 18;
            p.rangeRing.setRadius(p.range);
          });
        },
      });
    }
    if (has("ice")) {
      synergy.push({
        title: "寒流前线",
        rarity: "rare",
        description: "寒冰减速更强，并获得少量伤害。",
        apply: () => {
          return buff((p) => p.kind === "ice", (p) => {
            p.slow = Math.min(0.74, p.slow + 0.1);
            p.slowDuration += 320;
            p.damage += 8;
          });
        },
      });
    }
    if (has("corn")) {
      synergy.push({
        title: "爆米花轰炸",
        rarity: "epic",
        description: "玉米投手爆炸范围 +30，并提升爆炸伤害。",
        apply: () => {
          return buff((p) => p.kind === "corn", (p) => {
            p.splash += 30;
            p.damage += 18;
          });
        },
      });
    }
    if (has("thorn")) {
      synergy.push({
        title: "荆棘封路",
        rarity: "rare",
        description: "地刺藤范围扩大，减速和持续伤害提升。",
        apply: () => {
          return buff((p) => p.kind === "thorn", (p) => {
            p.range += 30;
            p.auraDamage += 4;
            p.auraSlow = Math.min(0.58, p.auraSlow + 0.12);
            p.rangeRing.setRadius(p.range);
          });
        },
      });
    }
    synergy.push({
      title: "全局光合作用",
      rarity: "epic",
      description: "所有植物伤害 +10%，攻击间隔 -8%。",
      rule: "全局光合作用",
      apply: () => {
        this.globalDamageMultiplier *= 1.1;
        this.globalFireDelayMultiplier *= 0.92;
        return this.plants;
      },
    });

    return this.pickStrategyCards(tactical, synergy, universal);
  }

  private pickStrategyCards(tactical: Mutation[], synergy: Mutation[], universal: Mutation[]) {
    const picked: Mutation[] = [];
    const pickOne = (pool: Mutation[]) => {
      const choices = Phaser.Utils.Array.Shuffle([...pool]).filter((choice) => !picked.some((item) => item.title === choice.title));
      const choice = choices[0];
      if (choice) picked.push(choice);
    };
    pickOne(tactical);
    pickOne(synergy);
    pickOne(universal);
    const all = [...tactical, ...synergy, ...universal];
    while (picked.length < 3 && all.length > picked.length) pickOne(all);
    return picked.slice(0, 3);
  }

  private getRecommendedChoiceIndex() {
    if (this.currentChoices.length === 0) return 0;
    const focus = this.getBuildFocus();
    const scoreChoice = (choice: Mutation) => {
      const base = choice.rarity === "epic" ? 30 : choice.rarity === "rare" ? 18 : 10;
      const title = choice.title;
      const focusBias =
        focus.kind === "control" && ["寒流前线", "荆棘封路", "临时冰墙", "护脑工事"].includes(title) ? 18 :
        focus.kind === "blast" && ["爆米花轰炸", "专注火力", "全局光合作用"].includes(title) ? 18 :
        focus.kind === "economy" && ["日照经济", "悬赏阳光", "种子补给"].includes(title) ? 18 :
        focus.kind === "fireline" && ["豌豆连射阵", "幸运叶绿素", "复制插枝", "专注火力"].includes(title) ? 18 :
        focus.kind === "hybrid" && ["全局光合作用", "复制插枝", "战斗巡航"].includes(title) ? 16 :
        0;
      const bias =
        title === "战斗巡航" ? 28 :
        title === "复制插枝" ? 24 :
        title === "临时冰墙" ? 18 :
        title === "全局光合作用" ? 17 :
        title === "护脑工事" && this.brainHp < 70 ? 26 :
        title === "种子补给" && this.sun < 80 ? 22 :
        title === "空投豌豆" ? 14 :
        0;
      return base + bias + focusBias;
    };
    return this.currentChoices
      .map((choice, index) => ({ index, score: scoreChoice(choice) }))
      .sort((a, b) => b.score - a.score)[0].index;
  }

  private scheduleAutoStrategy() {
    this.autoStrategyTimer?.remove(false);
    this.autoStrategyTimer = null;
    if (!this.autoStrategy || this.mode !== "mutation" || this.currentChoices.length === 0) return;
    const delay = this.cruiseMode ? 420 : this.tacticalQueueMode ? 720 : 1150;
    this.autoStrategyTimer = this.time.delayedCall(delay, () => {
      this.autoStrategyTimer = null;
      if (this.autoStrategy && this.mode === "mutation") this.chooseMutation(this.getRecommendedChoiceIndex(), "auto");
    });
  }

  private endRun(won: boolean) {
    this.mode = won ? "victory" : "gameover";
    this.startWaveButton.setVisible(false);
    this.mutationLayer.setVisible(false);
    const title = won ? "脑子守住了" : "脑子被吃掉了";
    const color = won ? COLORS.green : COLORS.red;
    const overlay = this.add.container(WIDTH / 2, HEIGHT / 2);
    overlay.setDepth(320);
    overlay.add(this.add.rectangle(0, 0, 560, 230, COLORS.panel, 0.96).setStrokeStyle(2, color, 0.9));
    overlay.add(this.add.text(0, -56, title, { color: "#f4fbff", fontSize: "32px", fontStyle: "900" }).setOrigin(0.5));
    overlay.add(this.add.text(0, -8, `分数 ${this.score} · 击杀 ${this.kills} · 波次 ${this.wave}`, {
      color: "#cce6ef",
      fontSize: "16px",
    }).setOrigin(0.5));
    const reload = this.add.text(0, 54, "刷新重新开始", {
      color: "#071017",
      backgroundColor: "#ffd560",
      fontSize: "15px",
      fontStyle: "900",
      padding: { x: 12, y: 7 },
    }).setOrigin(0.5);
    overlay.add(reload);
  }

  private updateCardState() {
    for (const card of this.cards) {
      const selected = this.seedArmed && card.kind === this.selectedKind;
      const affordable = this.sun >= PLANT_DEFS[card.kind].cost;
      card.bg.setFillStyle(selected ? 0x203621 : 0x101b24, affordable ? 0.98 : 0.58);
      card.bg.setStrokeStyle(2, selected ? COLORS.yellow : affordable ? 0x6e8791 : 0x43525b, selected ? 1 : 0.72);
      card.container.setAlpha(affordable ? 1 : 0.54);
    }
  }

  private updatePlotHighlights() {
    const def = PLANT_DEFS[this.selectedKind];
    const canAfford = this.sun >= def.cost;
    for (const [index, view] of this.plotViews.entries()) {
      const occupied = this.plotOccupants.has(index);
      const hovered = this.hoverPlotIndex === index;
      const canPlant = this.seedArmed && !occupied && canAfford && (this.mode === "planting" || this.mode === "wave");
      const strokeColor = occupied ? 0x9b7a51 : hovered && canPlant ? COLORS.yellow : canPlant ? COLORS.green : 0x58704a;
      const fillColor = occupied ? 0x342719 : COLORS.soil;
      const alpha = occupied ? 0.42 : canPlant ? 0.84 : 0.54;
      view.pad.setFillStyle(fillColor, alpha);
      view.pad.setStrokeStyle(hovered ? 3 : 2, strokeColor, hovered || canPlant ? 0.95 : 0.48);
      view.dot.setFillStyle(occupied ? 0x806346 : canPlant ? COLORS.lime : 0x9eca69, occupied ? 0.28 : 0.72);
    }
  }

  private updatePlacementGhost() {
    if (!this.placementGhost) return;
    const canShow = this.seedArmed && !this.selectedPlant && (this.mode === "planting" || this.mode === "wave");
    const pointer = this.input.activePointer;
    const def = PLANT_DEFS[this.selectedKind];
    const overBoard = pointer.x >= 0 && pointer.x <= WIDTH && pointer.y >= 78 && pointer.y <= HEIGHT - 108;

    if (!canShow || !overBoard) {
      this.placementGhost.setVisible(false);
      return;
    }

    const plotIndex = this.hoverPlotIndex;
    const hasPlot = plotIndex !== null && PLOTS[plotIndex] !== undefined;
    const occupied = hasPlot ? this.plotOccupants.has(plotIndex) : false;
    const affordable = this.sun >= def.cost;
    const valid = hasPlot && !occupied && affordable;
    const x = hasPlot ? PLOTS[plotIndex].x : pointer.x;
    const y = hasPlot ? PLOTS[plotIndex].y : pointer.y;

    this.placementGhost.setVisible(true);
    this.placementGhost.setPosition(x, y);
    this.placementGhost.setAlpha(valid ? 0.9 : 0.45);
    this.ghostRing.setRadius(def.range);
    this.ghostRing.setStrokeStyle(valid ? 2 : 1, valid ? COLORS.yellow : COLORS.red, valid ? 0.42 : 0.28);
    this.ghostImage.setTexture(PLANT_TEXTURES[this.selectedKind]);
    this.ghostImage.setDisplaySize(this.selectedKind === "thorn" ? 72 : 78, this.selectedKind === "thorn" ? 72 : 78);
    this.ghostImage.setTint(affordable ? 0xffffff : 0xff6677);
  }

  private updatePlantSelection() {
    for (const plant of this.plants) {
      const isSelected = plant === this.selectedPlant || plant === this.currentMutationPlant;
      plant.rangeRing.setVisible(isSelected);
      plant.rangeRing.setStrokeStyle(isSelected ? 2 : 1, plant === this.currentMutationPlant ? COLORS.yellow : PLANT_DEFS[plant.kind].color, isSelected ? 0.48 : 0.2);
    }
  }

  private updatePlantBadges() {
    for (const plant of this.plants) {
      const pending = this.mode === "mutation";
      plant.badge.setText(pending ? "+" : plant.kills > 0 ? `${plant.kills}杀` : `Lv${plant.level}`);
      plant.badge.setVisible(pending || plant.kills > 0 || plant.level >= 2 || plant === this.selectedPlant);
    }
  }

  private updateHud() {
    const adviceWave = this.mode === "wave" ? this.wave : this.wave + 1;
    const band = this.getTargetRatioBand(adviceWave);
    this.targetRatioBand = `目标 ${band.low.toFixed(2)}-${band.high.toFixed(2)}`;
    this.balanceVerdict = this.getBalanceVerdict(adviceWave);
    this.nextAdvice = this.getNextAdvice(adviceWave);
    this.refreshOpsDeck("刷新");
    this.hud.sun.setText(`阳光 ${Math.floor(this.sun)}`);
    this.hud.wave.setText(`波次 ${this.wave}/${MAX_WAVE}`);
    this.hud.brain.setText(`脑子 ${Math.max(0, Math.ceil(this.brainHp))}`);
    this.hud.brainBar.setDisplaySize(220 * Math.max(0, this.brainHp / this.maxBrainHp), 12);
    this.hud.mode.setText(this.getModeText());
    this.hud.score.setText(`分数 ${this.score} · 击杀 ${this.kills}`);
    this.hud.inspector.setText(this.getInspectorText());
    this.updatePlantBadges();
    this.updateCombatFeedPanel();
    this.updateFocusCommandPanel();
    this.updateCardState();
    this.updatePlotHighlights();
    this.updateControlState();
  }

  private getModeText() {
    const armor = this.wallArmor > 0 ? ` · 护盾 ${Math.ceil(this.wallArmor)}` : "";
    if (this.mode === "planting") return (this.tacticalQueueMode ? `战术队列待命 · ${this.nextAdvice}` : this.cruiseMode ? "巡航整备中 · 自动补种/强化/开波" : this.commandMode ? "指挥官整备中 · 自动补种/拿卡/开波" : this.battlePlanMode ? "作战计划待命 · 开波前自动补种强化" : this.autoGarden ? "自动园丁待命 · 也可手动补位" : this.seedArmed ? "点击空土格种植 · Esc 取消" : "选择种子卡，或点击已种植物查看") + armor;
    if (this.mode === "wave") return `僵尸沿路推进 · 已生成 ${this.spawned}/${this.spawnTarget} · ${BATTLE_EVENT_DEFS[this.activeBattleEvent].title} · ${this.getBalanceVerdict(this.wave)}${armor}`;
    if (this.mode === "mutation") return this.cruiseMode ? "巡航选卡中 · 自动拿推荐卡" : this.autoStrategy ? "战利品阶段 · 自动策略将拿推荐卡" : "战利品阶段 · 全体已自动成长，只需选择 1 张策略卡";
    if (this.mode === "victory") return "胜利";
    if (this.mode === "gameover") return "失败";
    return "花园启动中";
  }

  private getRarityLabel(rarity: Rarity) {
    return {
      common: "普通",
      rare: "稀有",
      epic: "史诗",
    }[rarity];
  }

  private getInspectorText() {
    const focus = this.getBuildFocus();
    if (!this.selectedPlant) {
      if (this.campaignMode && (this.mode === "planting" || this.mode === "wave")) {
        const details = this.getCampaignDetails().slice(0, 2).join(" · ");
        return `${this.campaignPlan}\n${details}`;
      }
      if (this.mode === "planting") return `${this.balanceVerdict} · ${focus.title} · ${this.lastIntentPlan}\n${focus.advice} · MVP ${this.getMvpPlantLabel()}`;
      if (this.mode === "wave") return `${BATTLE_EVENT_DEFS[this.activeBattleEvent].title} · ${this.getWaveContract().title} · ${this.getContractProgress()}\n${this.nextAdvice}`;
      return this.seedArmed
        ? `已选择 ${PLANT_DEFS[this.selectedKind].name} · 点击空土格种植`
        : "请选择种子卡，或点击已种植物";
    }
    const plant = this.selectedPlant;
    return `${PLANT_DEFS[plant.kind].name} #${plant.id} · 等级 ${plant.level} · 伤害 ${Math.round(plant.damage || plant.auraDamage)}\n范围 ${Math.round(plant.range)} · ${plant.mutations.slice(-2).join(" / ")}`;
  }

  private getRunRulesText() {
    if (this.runRules.length === 0) return "规则：无";
    return `规则：${this.runRules.slice(-2).join(" / ")}`;
  }

  private getCampaignDetails() {
    const nextWave = Math.min(MAX_WAVE, this.mode === "wave" ? this.wave : this.wave + 1);
    const hotspot = this.getRoutePressureProfile(nextWave)[0];
    const contract = this.getWaveContract(this.activeContract, Math.max(1, nextWave));
    const plan = this.mode === "wave" ? this.activeWavePlan : this.getWavePlan(nextWave);
    return [
      `预算 ${this.waveDecisionUsed}/${this.waveDecisionBudget}`,
      this.operationLedger,
      this.targetRatioBand,
      `蓝图 ${plan.title} · ${plan.counter}`,
      `热点 ${hotspot.title}${hotspot.score} ${hotspot.need}`,
      `预案 ${this.getIntentTitle(this.activeIntent)}`,
      `契约 ${contract.title}`,
      `构筑 ${this.getBuildFocus().title}`,
      this.balanceLedger,
    ];
  }

  private getWavePreviewText() {
    const nextWave = Math.min(MAX_WAVE, this.wave + 1);
    const plan = this.mode === "wave" ? this.activeWavePlan : this.getWavePlan(nextWave);
    if (plan.kind !== "training") return `${plan.title} · ${plan.counter}`;
    if (nextWave >= MAX_WAVE) return "Boss + 高血量尸潮";
    if (nextWave >= 7) return "铁桶 / 群尸 / 跑尸混合";
    if (nextWave >= 5) return "群尸开始分裂";
    if (nextWave >= 4) return "跑尸加速冲线";
    if (nextWave >= 3) return "路障僵尸变硬";
    return "普通僵尸";
  }

  private getPressureTier(wave: number) {
    if (wave >= MAX_WAVE) return "Boss 决战";
    if (wave >= 8) return "高压混编";
    if (wave >= 5) return "中压变阵";
    if (wave >= 3) return "硬怪试探";
    return "普通推进";
  }

  private getWaveTraits(wave: number) {
    const traits: Array<{ label: string; color: number; pathIndex: number }> = [{ label: "普", color: COLORS.green, pathIndex: 1 }];
    if (wave >= 3) traits.push({ label: "硬", color: COLORS.orange, pathIndex: 3 });
    if (wave >= 4) traits.push({ label: "快", color: COLORS.cyan, pathIndex: 5 });
    if (wave >= 5) traits.push({ label: "群", color: COLORS.lime, pathIndex: 7 });
    if (wave >= 7) traits.push({ label: "甲", color: COLORS.blue, pathIndex: 9 });
    if (wave >= MAX_WAVE) traits.push({ label: "王", color: COLORS.red, pathIndex: 10 });
    return traits.slice(-4);
  }

  private renderThreatMarkers(wave: number) {
    this.planLayer.removeAll(true);
    const plan = this.mode === "wave" ? this.activeWavePlan : this.getWavePlan(wave);
    const banner = this.add.container(WIDTH / 2, 104);
    const bannerBg = this.add.rectangle(0, 0, 430, 34, 0x08131d, 0.78)
      .setStrokeStyle(1, plan.color, 0.72);
    const bannerText = this.add.text(0, 0, `蓝图 ${plan.title} · ${plan.counter}`, {
      color: "#f4fbff",
      fontSize: "13px",
      fontStyle: "900",
      stroke: "#071017",
      strokeThickness: 3,
    }).setOrigin(0.5);
    banner.add([bannerBg, bannerText]);
    this.planLayer.add(banner);
    for (const trait of this.getWaveTraits(wave)) {
      const point = PATH[Math.min(trait.pathIndex, PATH.length - 2)];
      const badge = this.add.container(point.x, point.y - 56);
      const bg = this.add.circle(0, 0, 18, trait.color, 0.22)
        .setStrokeStyle(2, trait.color, 0.72)
        .setBlendMode(Phaser.BlendModes.ADD);
      const text = this.add.text(0, 0, trait.label, {
        color: "#f4fbff",
        fontSize: "14px",
        fontStyle: "900",
        stroke: "#071017",
        strokeThickness: 3,
      }).setOrigin(0.5);
      const line = this.add.line(0, 24, 0, 0, 0, 38, trait.color, 0.48).setOrigin(0.5);
      badge.add([bg, text, line]);
      this.planLayer.add(badge);
    }
    for (const pressure of this.getRoutePressureProfile(wave).slice(0, 3)) {
      const point = PATH[Math.min(pressure.pathIndex, PATH.length - 2)];
      const marker = this.add.container(point.x, point.y + 58);
      const ring = this.add.circle(0, 0, 26, pressure.color, 0.06)
        .setStrokeStyle(2, pressure.color, 0.42)
        .setBlendMode(Phaser.BlendModes.ADD);
      const card = this.add.rectangle(0, 0, 56, 28, 0x071017, 0.72)
        .setStrokeStyle(1, pressure.color, 0.7);
      const text = this.add.text(0, -1, `${pressure.label}${pressure.score}`, {
        color: "#f4fbff",
        fontSize: "12px",
        fontStyle: "900",
        stroke: "#071017",
        strokeThickness: 3,
      }).setOrigin(0.5);
      const need = this.add.text(0, 24, pressure.need, {
        color: Phaser.Display.Color.IntegerToColor(pressure.color).rgba,
        fontSize: "10px",
        fontStyle: "900",
        stroke: "#071017",
        strokeThickness: 3,
      }).setOrigin(0.5);
      marker.add([ring, card, text, need]);
      this.planLayer.add(marker);
    }
  }

  private toggleSpeed() {
    const speeds = [1, 1.5, 2.5];
    const currentIndex = speeds.findIndex((speed) => speed === this.gameSpeed);
    this.gameSpeed = speeds[(currentIndex + 1) % speeds.length];
    this.toast(WIDTH - 128, HEIGHT - 102, `速度 ${this.gameSpeed}x`, COLORS.cyan);
    this.updateControlState();
  }

  private toggleAutoWave() {
    this.autoWave = !this.autoWave;
    this.commandMode = this.autoWave;
    if (!this.autoWave) this.cruiseMode = false;
    if (this.autoWave && !this.runRules.includes("指挥官节奏")) this.runRules.push("指挥官节奏");
    this.toast(WIDTH - 242, HEIGHT - 102, this.autoWave ? "指挥官开波开启" : "改为手动开波", this.autoWave ? COLORS.green : COLORS.yellow);
    this.updateControlState();
    if (this.autoWave && this.mode === "planting") this.scheduleAutoWave();
    if (!this.autoWave) {
      this.autoWaveTimer?.remove(false);
      this.autoWaveTimer = null;
    }
  }

  private toggleBattlePlan() {
    this.battlePlanMode = !this.battlePlanMode;
    if (this.battlePlanMode) {
      this.runRules = this.runRules.includes("作战计划") ? this.runRules : [...this.runRules, "作战计划"];
      this.toast(WIDTH - 480, HEIGHT - 102, "作战计划开启", COLORS.green);
      if (this.mode === "planting") this.runBattlePlan("手动");
    } else {
      this.toast(WIDTH - 480, HEIGHT - 102, "作战计划关闭", COLORS.yellow);
    }
    this.updateControlState();
    return this.getDebugState();
  }

  private toggleCruiseMode(force?: boolean) {
    this.cruiseMode = force ?? !this.cruiseMode;
    if (this.cruiseMode) {
      this.autoGarden = true;
      this.autoStrategy = true;
      this.autoWave = true;
      this.commandMode = true;
      this.battlePlanMode = true;
      this.gameSpeed = Math.max(this.gameSpeed, 1.5);
      this.runRules = this.runRules.includes("巡航托管") ? this.runRules : [...this.runRules, "巡航托管"];
      this.runRules = this.runRules.includes("免手波次") ? this.runRules : [...this.runRules, "免手波次"];
      this.toast(WIDTH - 478, HEIGHT - 102, "巡航模式开启：补种、拿卡、开波交给系统", COLORS.green);
      if (this.mode === "planting") {
        this.runHandsFreePulse("巡航启动");
        this.scheduleAutoWave();
      }
      if (this.mode === "mutation") this.scheduleAutoStrategy();
    } else {
      this.toast(WIDTH - 478, HEIGHT - 102, "巡航模式关闭", COLORS.yellow);
    }
    this.updateControlState();
    return this.getDebugState();
  }

  private toggleAutoGarden() {
    this.autoGarden = !this.autoGarden;
    if (!this.autoGarden) this.cruiseMode = false;
    this.toast(WIDTH - 384, HEIGHT - 102, this.autoGarden ? "自动园丁开启" : "自动园丁关闭", this.autoGarden ? COLORS.green : COLORS.yellow);
    this.updateControlState();
  }

  private toggleAutoStrategy() {
    this.autoStrategy = !this.autoStrategy;
    if (!this.autoStrategy) this.cruiseMode = false;
    this.toast(WIDTH - 292, HEIGHT - 102, this.autoStrategy ? "自动策略开启" : "自动策略关闭", this.autoStrategy ? COLORS.green : COLORS.yellow);
    this.updateControlState();
    if (this.autoStrategy && this.mode === "mutation") this.scheduleAutoStrategy();
    if (!this.autoStrategy) {
      this.autoStrategyTimer?.remove(false);
      this.autoStrategyTimer = null;
    }
  }

  private updateControlState() {
    if (!this.speedText || !this.autoWaveText) return;
    this.cruiseText?.setText(this.cruiseMode ? "巡航开" : "巡航关");
    this.cruiseText?.setColor(this.cruiseMode ? "#6dff9a" : "#dcefff");
    this.battlePlanText?.setText(this.battlePlanMode ? "计划开" : "计划关");
    this.battlePlanText?.setColor(this.battlePlanMode ? "#ffd560" : "#dcefff");
    this.speedText.setText(`${this.gameSpeed}x`);
    this.speedText.setColor(this.gameSpeed > 1 ? "#32d4ff" : "#dcefff");
    this.autoWaveText.setText(this.autoWave ? "导演开波" : "手动开波");
    this.autoWaveText.setColor(this.autoWave ? "#6dff9a" : "#dcefff");
    this.autoGardenText?.setText(this.autoGarden ? "园丁开" : "园丁关");
    this.autoGardenText?.setColor(this.autoGarden ? "#6dff9a" : "#dcefff");
    this.autoStrategyText?.setText(this.autoStrategy ? "策略开" : "策略关");
    this.autoStrategyText?.setColor(this.autoStrategy ? "#6dff9a" : "#dcefff");
  }

  private scheduleAutoWave() {
    if (!this.autoWave || this.mode !== "planting" || this.wave >= MAX_WAVE) return;
    this.autoWaveTimer?.remove(false);
    const delay = this.cruiseMode ? 760 : this.wave === 0 ? 1850 : 1350;
    this.autoWaveTimer = this.time.delayedCall(delay, () => {
      this.autoWaveTimer = null;
      if (this.autoWave && this.mode === "planting" && this.wave < MAX_WAVE) this.startNextWave(this.cruiseMode ? "cruise" : "auto");
    });
  }

  private runCruiseStep() {
    this.cruiseActions += 1;
    if (this.mode === "boot") {
      this.beginRun();
      this.toggleCruiseMode(true);
      return this.getDebugState();
    }
    if (!this.cruiseMode) this.toggleCruiseMode(true);
    if (this.mode === "planting" || this.mode === "mutation") return this.runHandsFreePulse("巡航免手");
    if (this.mode === "wave") {
      this.runHandsFreePulse("巡航免手");
      return this.forceMutationForDebug();
    }
    return this.getDebugState();
  }

  private autoCruiseForDebug(steps = 8) {
    for (let i = 0; i < steps; i += 1) {
      if (this.mode === "victory" || this.mode === "gameover") break;
      this.runCruiseStep();
    }
    return this.getDebugState();
  }

  private focusLoopForDebug(ticks = 3) {
    if (this.mode === "boot") this.beginRun();
    if (!this.cruiseMode && this.mode !== "gameover" && this.mode !== "victory") this.toggleCruiseMode(true);
    for (let i = 0; i < ticks; i += 1) {
      if (this.mode === "gameover" || this.mode === "victory") break;
      this.nextFocusLoopAt = 0;
      this.updateFocusLoop(this.simTime + i * 1600 + 1600);
      if (this.mode === "wave" && this.spawned >= this.spawnTarget && this.zombies.length === 0) this.forceMutationForDebug();
    }
    return this.getDebugState();
  }

  private addCombatFeed(message: string, _color = COLORS.white) {
    this.combatFeed.unshift(message);
    if (this.combatFeed.length > 8) this.combatFeed.pop();
    this.updateCombatFeedPanel();
  }

  private getTopContributions() {
    return [...this.plants]
      .filter((plant) => plant.damageDone > 0 || plant.kills > 0)
      .sort((a, b) => b.kills - a.kills || b.damageDone - a.damageDone)
      .slice(0, 4);
  }

  private formatPlantContribution(plant: Plant) {
    return `${PLANT_DEFS[plant.kind].name}#${plant.id} ${plant.kills}杀/${Math.round(plant.damageDone)}伤`;
  }

  private getPlantContributionLabels() {
    return this.getTopContributions().map((plant) => this.formatPlantContribution(plant));
  }

  private getMvpPlantLabel() {
    const top = this.getTopContributions()[0];
    return top ? this.formatPlantContribution(top) : this.lastMvpPlant;
  }

  private getCombatSummaryText() {
    if (this.mode === "wave") return `${this.getWaveContract().title} · ${this.getContractProgress()} · 击杀 ${this.waveKills}`;
    return `MVP ${this.getMvpPlantLabel()}`;
  }

  private updateCombatFeedPanel() {
    if (!this.combatFeedPanel || !this.combatFeedTitle || !this.combatFeedSummary) return;
    const visible = this.combatFeedMode && this.mode !== "boot" && this.mode !== "gameover" && this.mode !== "victory";
    this.combatFeedPanel.setVisible(visible);
    this.combatFeedTitle.setText(this.mode === "wave" ? `战斗复盘 · 第${this.wave}波` : `战斗复盘 · 上波${this.lastWaveGrade}`);
    this.combatFeedSummary.setText(this.getCombatSummaryText());
    const rows = [
      ...this.getPlantContributionLabels().slice(0, 2).map((item) => `MVP ${item}`),
      ...this.combatFeed,
    ].slice(0, this.combatFeedLines.length);
    this.combatFeedLines.forEach((line, index) => {
      line.setText(rows[index] ?? "");
      line.setColor(index === 0 && rows[index]?.startsWith("MVP") ? "#fff2bd" : "#c8dfeb");
    });
  }

  private toast(x: number, y: number, message: string, color: number) {
    const text = this.add.text(x, y, message, {
      color: Phaser.Display.Color.IntegerToColor(color).rgba,
      fontSize: "15px",
      fontStyle: "900",
      stroke: "#071017",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(220);
    this.tweens.add({
      targets: text,
      y: y - 28,
      alpha: 0,
      duration: 900,
      ease: "Quad.easeOut",
      onComplete: () => text.destroy(),
    });
  }

  private pulsePlant(plant: Plant, scale: number) {
    this.tweens.killTweensOf(plant.sprite);
    plant.sprite.setScale(1);
    this.tweens.add({
      targets: plant.sprite,
      scaleX: scale,
      scaleY: 0.94,
      duration: 72,
      yoyo: true,
      ease: "Quad.easeOut",
    });
  }

  private muzzleFlash(plant: Plant, angle: number) {
    const x = plant.x + Math.cos(angle) * 28;
    const y = plant.y - 10 + Math.sin(angle) * 20;
    const flash = this.add.circle(x, y, 11, PLANT_DEFS[plant.kind].color, 0.8)
      .setDepth(39)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.8,
      duration: 140,
      ease: "Quad.easeOut",
      onComplete: () => flash.destroy(),
    });
  }

  private flashZombie(zombie: Zombie, color: number) {
    zombie.body.setTintFill(color);
    this.time.delayedCall(65, () => {
      if (zombie.body.active) zombie.body.setTint(this.getZombieTrait(zombie.kind).tint);
    });
  }

  private damagePopup(zombie: Zombie, amount: number, color: number) {
    const text = this.add.text(zombie.x, zombie.y - zombie.radius - 18, `${Math.ceil(amount)}`, {
      color: Phaser.Display.Color.IntegerToColor(color).rgba,
      fontSize: amount >= 35 ? "16px" : "12px",
      fontStyle: "900",
      stroke: "#071017",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(90);
    this.tweens.add({
      targets: text,
      y: text.y - 22,
      alpha: 0,
      duration: 520,
      ease: "Quad.easeOut",
      onComplete: () => text.destroy(),
    });
  }

  private slowPulse(zombie: Zombie) {
    const pulse = this.add.circle(zombie.x, zombie.y, zombie.radius + 8, COLORS.cyan, 0)
      .setStrokeStyle(2, COLORS.cyan, 0.62)
      .setDepth(28)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: pulse,
      alpha: 0,
      scale: 1.65,
      duration: 360,
      ease: "Quad.easeOut",
      onComplete: () => pulse.destroy(),
    });
  }

  private burst(x: number, y: number, color: number, count: number) {
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.25;
      const distance = Phaser.Math.Between(22, 56);
      const particle = this.add.circle(x, y, Phaser.Math.Between(2, 4), color, 0.92).setDepth(60).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(420, 760),
        ease: "Quad.easeOut",
        onComplete: () => particle.destroy(),
      });
    }
  }

  private forceMutationForDebug() {
    if (this.mode === "wave") this.settleWaveGrade();
    for (const zombie of [...this.zombies]) this.removeZombie(zombie);
    for (const projectile of this.projectiles) projectile.sprite.destroy();
    this.projectiles = [];
    this.spawned = this.spawnTarget;
    this.enterMutationPhase();
    return this.getDebugState();
  }

  private getDebugState(): DebugState {
    const adviceWave = this.mode === "wave" ? this.wave : this.wave + 1;
    const band = this.getTargetRatioBand(adviceWave);
    this.balanceVerdict = this.getBalanceVerdict(adviceWave);
    this.nextAdvice = this.getNextAdvice(adviceWave);
    this.refreshOpsDeck("状态读取");
    const focus = this.getBuildFocus();
    const focusCommand = this.getFocusCommand();
    return {
      mode: this.mode,
      wave: this.wave,
      zombies: this.zombies.length,
      plants: this.plants.length,
      brainHp: Math.ceil(this.brainHp),
      sun: Math.floor(this.sun),
      wallArmor: Math.ceil(this.wallArmor),
      gameSpeed: this.gameSpeed,
      autoWave: this.autoWave,
      autoGarden: this.autoGarden,
      autoStrategy: this.autoStrategy,
      commandMode: this.commandMode,
      campaignMode: this.campaignMode,
      campaignActions: this.campaignActions,
      campaignSavedClicks: this.campaignSavedClicks,
      campaignPlan: this.campaignPlan,
      campaignHistory: [...this.campaignHistory],
      campaignDetails: this.getCampaignDetails(),
      waveDecisionBudget: this.waveDecisionBudget,
      waveDecisionUsed: this.waveDecisionUsed,
      lowTouchDirectorMode: this.lowTouchDirectorMode,
      directorLoopActions: this.directorLoopActions,
      operationLoad: this.operationLoad,
      operationLedger: this.operationLedger,
      targetRatioBand: this.targetRatioBand,
      targetRatioLow: Number(band.low.toFixed(2)),
      targetRatioHigh: Number(band.high.toFixed(2)),
      balanceRatio: Number(this.getBalanceRatio(adviceWave).toFixed(2)),
      balanceClamp: this.balanceClamp,
      balanceSunLocked: this.balanceSunLocked,
      balancePressureMultiplier: Number(this.balancePressureMultiplier.toFixed(2)),
      focusCommandMode: this.focusCommandMode,
      focusCommandTitle: focusCommand.title,
      focusCommandDetail: focusCommand.detail,
      focusCommandRisk: focusCommand.risk,
      focusCommandText: `下一步 ${focusCommand.title} · ${focusCommand.detail} · ${focusCommand.risk}`,
      focusCommandKind: focusCommand.kind,
      focusCommandActions: this.focusCommandActions,
      focusCommandSavings: this.focusCommandSavings,
      focusLoopMode: this.focusLoopMode,
      focusLoopActions: this.focusLoopActions,
      focusLoopSavings: this.focusLoopSavings,
      focusLoopLast: this.focusLoopLast,
      handsFreeMode: this.handsFreeMode,
      handsFreeActions: this.handsFreeActions,
      handsFreeSavings: this.handsFreeSavings,
      handsFreeStreak: this.handsFreeStreak,
      handsFreeLast: this.handsFreeLast,
      decisionBurden: this.getDecisionBurden(),
      battlePlanMode: this.battlePlanMode,
      cruiseMode: this.cruiseMode,
      cruiseActions: this.cruiseActions,
      commandActions: this.commandActions,
      planActions: this.planActions,
      savedClicks: this.savedClicks,
      combatFeedMode: this.combatFeedMode,
      combatFeed: [...this.combatFeed],
      waveDamageDone: Math.round(this.waveDamageDone),
      waveKills: this.waveKills,
      waveSunGained: Math.round(this.waveSunGained),
      mvpPlant: this.getMvpPlantLabel(),
      plantContributions: this.getPlantContributionLabels(),
      visiblePlantBadges: this.plants.filter((plant) => plant.badge.visible).length,
      tacticalQueueMode: this.tacticalQueueMode,
      queueActions: this.queueActions,
      queueSavedClicks: this.queueSavedClicks,
      queueLastPlan: this.queueLastPlan,
      queueHistory: [...this.queueHistory],
      balanceVerdict: this.balanceVerdict,
      nextAdvice: this.nextAdvice,
      balanceAdjustments: this.balanceAdjustments,
      balanceLastAdjustment: this.balanceLastAdjustment,
      intentMode: this.intentMode,
      intentActions: this.intentActions,
      activeIntent: this.activeIntent,
      intentCards: this.getIntentCards(adviceWave).map((card) => `${card.recommended ? "荐" : "备"}${card.title}：${card.detail} · ${card.tag}`),
      intentHistory: [...this.intentHistory],
      lastIntentPlan: this.lastIntentPlan,
      intentSavings: this.intentSavings,
      opsDeckMode: this.opsDeckMode,
      opsDeckActions: this.opsDeckActions,
      opsCards: [...this.opsCards],
      laneFocus: this.laneFocus,
      routePressure: this.routePressure,
      rhythm: this.rhythm,
      tempoChanges: this.tempoChanges,
      lastTempoPlan: this.lastTempoPlan,
      perfectWaves: this.perfectWaves,
      waveGrade: this.lastWaveGrade,
      pressureTier: this.pressureTier,
      waveLeaks: this.currentWaveLeaks,
      activeBattleEvent: this.activeBattleEvent,
      battleEventTitle: BATTLE_EVENT_DEFS[this.activeBattleEvent].title,
      battleEventHistory: [...this.battleEventHistory],
      battleEventTriggers: this.battleEventTriggers,
      battleEventSpawnExtra: this.battleEventSpawnExtra,
      battleEventSunYieldBonus: this.battleEventSunYieldBonus,
      battleEventDamageMultiplier: Number(this.battleEventDamageMultiplier.toFixed(2)),
      battleEventSpeedMultiplier: Number(this.battleEventSpeedMultiplier.toFixed(2)),
      wavePlanKind: this.activeWavePlan.kind,
      wavePlanTitle: this.activeWavePlan.title,
      wavePlanCounter: this.activeWavePlan.counter,
      wavePlanMix: this.activeWavePlan.mix.join("/"),
      wavePlanHistory: [...this.wavePlanHistory],
      balanceLedger: this.balanceLedger,
      fairnessDebt: this.fairnessDebt,
      mercyBank: Math.round(this.mercyBank),
      contractMode: this.contractMode,
      activeContract: this.activeContract,
      contractTitle: this.getWaveContract().title,
      contractGoal: this.getWaveContract().goal,
      contractProgress: this.getContractProgress(),
      contractHistory: [...this.contractHistory],
      contractCompleted: this.contractCompleted,
      contractRewards: this.contractRewards,
      contractStreak: this.contractStreak,
      gardenerPlacements: this.gardenerPlacements,
      autoStrategyPicks: this.autoStrategyPicks,
      directorAssists: this.directorAssists,
      directorFieldOrders: this.directorFieldOrders,
      directorSeedDrops: this.directorSeedDrops,
      directorOverclocks: this.directorOverclocks,
      directorCarePackages: this.directorCarePackages,
      directorLastOrder: this.directorLastOrder,
      directorOrderHistory: [...this.directorOrderHistory],
      directorNote: this.directorNote,
      adaptiveIntensity: this.adaptiveIntensity,
      intensityHistory: [...this.intensityHistory],
      intensityReason: this.intensityReason,
      tacticalBrief: this.getTacticalBrief(),
      threatScore: this.getThreatScore(),
      defenseScore: this.getDefenseScore(),
      buildFocusKind: focus.kind,
      buildFocusTitle: focus.title,
      buildFocusAdvice: focus.advice,
      buildFocusScore: focus.score,
      runRules: [...this.runRules],
      choiceTitles: this.currentChoices.map((choice) => choice.title),
      pendingMutations: this.mode === "mutation" ? this.currentChoices.length : 0,
      currentMutationPlant: null,
      plantLevels: this.plants.map((plant) => plant.level),
      pathNodes: PATH.length,
      plots: PLOTS.length,
      kills: this.kills,
    };
  }

  private installDebugApi() {
    window.__orbitBastionDebug = {
      state: () => this.getDebugState(),
      start: () => this.beginRun(),
      plant: (kind: PlantKind, plotIndex: number) => this.placePlant(kind, plotIndex, true),
      autoGarden: () => this.runAutoGarden("调试"),
      startWave: () => this.startNextWave(),
      toggleBattlePlan: () => this.toggleBattlePlan(),
      runBattlePlan: () => this.runBattlePlan("调试"),
      campaign: () => this.runCampaignSteward("调试管家"),
      opsDeck: () => this.executeOpsDeck("调试手牌"),
      opsCard: (index = 2) => this.executeOpsCard(index, "调试单卡"),
      intent: (kind) => this.executeBattleIntent(kind, "调试预案"),
      focusCommand: () => this.executeFocusCommand("调试焦点"),
      focusLoop: (ticks = 3) => this.focusLoopForDebug(ticks),
      handsFree: (ticks = 4) => this.handsFreeForDebug(ticks),
      toggleCruise: () => this.toggleCruiseMode(),
      autoCruise: (steps = 8) => this.autoCruiseForDebug(steps),
      directorOrder: () => this.runDirectorFieldOrder("调试指令"),
      forceMutation: () => this.forceMutationForDebug(),
      resolveMutation: (choiceIndex = 0) => this.chooseMutation(choiceIndex),
      resolveAllMutations: () => {
        let guard = 0;
        while (this.mode === "mutation" && guard < 80) {
          this.chooseMutation(0);
          guard += 1;
        }
        return this.getDebugState();
      },
    };
  }
}

function renderHubArt(key: HubGameKey): string {
  if (key === "tower") {
    return `
      <div class="hub-art hub-art-tower" aria-hidden="true">
        <span class="hub-lane lane-one"></span>
        <span class="hub-lane lane-two"></span>
        <span class="hub-lane lane-three"></span>
        <img class="hub-brain" src="/assets/ui/brain.svg" alt="" />
        <img class="hub-plant hub-pea" src="/assets/plants/pea.svg" alt="" />
        <img class="hub-plant hub-corn" src="/assets/plants/corn.svg" alt="" />
        <img class="hub-zombie" src="/assets/zombies/runner.png" alt="" />
      </div>
    `;
  }

  if (key === "cabin") {
    return `
      <div class="hub-art hub-art-cabin" aria-hidden="true">
        <span class="hub-moon"></span>
        <span class="hub-tree tree-one"></span>
        <span class="hub-tree tree-two"></span>
        <span class="hub-cabin-house"></span>
        <span class="hub-fire"></span>
        <span class="hub-footprint foot-one"></span>
        <span class="hub-footprint foot-two"></span>
      </div>
    `;
  }

  if (key === "voxel") {
    return `
      <div class="hub-art hub-art-voxel" aria-hidden="true">
        <span class="hub-block block-one"></span>
        <span class="hub-block block-two"></span>
        <span class="hub-block block-three"></span>
        <span class="hub-core"></span>
        <span class="hub-drill"></span>
        <span class="hub-rail"></span>
      </div>
    `;
  }

  return `
    <div class="hub-art hub-art-orbit" aria-hidden="true">
      <span class="hub-planet"></span>
      <span class="hub-ring ring-one"></span>
      <span class="hub-ring ring-two"></span>
      <span class="hub-satellite sat-one"></span>
      <span class="hub-satellite sat-two"></span>
      <span class="hub-bolt"></span>
    </div>
  `;
}

function renderGameCard(entry: HubGameEntry): string {
  const tags = entry.tags.map((tag) => `<span>${tag}</span>`).join("");

  return `
    <a class="game-card game-card-${entry.key}" href="${entry.href}" data-game-card="${entry.key}">
      ${renderHubArt(entry.key)}
      <span class="game-card-eyebrow">${entry.eyebrow}</span>
      <h2>${entry.title}</h2>
      <p>${entry.summary}</p>
      <div class="game-card-tags">${tags}</div>
      <strong>${entry.cta}</strong>
    </a>
  `;
}

function renderGameHub(root: HTMLElement): void {
  window.__orbitBastionDebug = undefined;
  root.className = "game-hub-shell";
  root.replaceChildren();
  document.title = "游戏大厅";
  root.innerHTML = `
    <main class="game-hub" data-game-hub>
      <section class="game-hub-head">
        <div>
          <span class="game-hub-kicker">PLAYSET</span>
          <h1 class="game-hub-title">游戏大厅</h1>
          <p>别再把四个原型塞进一个入口里。挑一个，直接开玩。</p>
        </div>
        <aside class="game-hub-status" aria-label="当前合集">
          <strong>${HUB_GAMES.length} 个原型</strong>
          <span>塔防 / 生存 / 体素 / 轨道</span>
        </aside>
      </section>
      <section class="game-hub-grid" aria-label="选择游戏">
        ${HUB_GAMES.map(renderGameCard).join("")}
      </section>
    </main>
  `;
}

function startTowerDefense(root: HTMLElement): void {
  root.className = "game-shell";
  root.replaceChildren();
  document.title = "脑花守卫";
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "app",
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: "#071017",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: GardenScene,
  });
}

const root = document.querySelector<HTMLElement>("#app");
const gameMode = new URLSearchParams(window.location.search).get("game");

if (!root) {
  throw new Error("Missing #app root");
}

if (gameMode === "cabin") {
  document.title = "林间求生";
  startCabinBuilder(root);
} else if (gameMode === "voxel") {
  document.title = "深岩工坊";
  startVoxelForge(root);
} else if (gameMode === "orbit") {
  document.title = "星环防线";
  startOrbitalDefense(root);
} else if (gameMode === "tower") {
  startTowerDefense(root);
} else {
  renderGameHub(root);
}
