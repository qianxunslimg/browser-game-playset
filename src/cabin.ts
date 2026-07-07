import * as THREE from "three";

type BlockKind = "wood" | "stone" | "leaf" | "glass" | "lamp" | "chest" | "furnace" | "bed";
type ResourceKind = BlockKind | "stick" | "berry" | "hide" | "meat" | "cookedMeat" | "bone" | "coal" | "ironOre" | "iron";
type HarvestKind = "tree" | "stone" | "bush" | "stick" | "pebble" | "crate" | "deer" | "boar" | "wolf" | "zombie" | "coal" | "iron";
type ToolKind = "axe" | "campfire" | "bow" | "pickaxe" | "armor";
type WeatherKind = "clear" | "rain" | "coldSnap";
type ProjectKind = "rainBarrel" | "trapline" | "watchPost";
type ExpeditionKind = "forest" | "mine" | "hunt";
type CampEventKind = "quietWatch" | "mushroomBloom" | "supplyCache" | "wolfTracks" | "coldFront";
type BlueprintStage = "porch" | "light" | "hedge" | "workshop" | "rest" | "secure" | "freeform";
type PackRecipeKind = "fieldMeal" | "campKit" | "trailKit" | "repairKit" | "winterKit";
type CabinCommandKind = "forage" | "build" | "guard" | "routine";
type ShelterNeed = "dryness" | "warmth" | "noise" | "morale";

interface GuideTarget {
  title: string;
  x: number;
  z: number;
  color: number;
  distance: number;
}

interface MiniMapMarker {
  title: string;
  x: number;
  z: number;
  kind: "player" | "home" | "resource" | "event" | "danger" | "project";
  active?: boolean;
}

interface CabinCommandCard {
  kind: CabinCommandKind;
  title: string;
  detail: string;
  tag: string;
  ready: boolean;
  recommended: boolean;
}

interface SurvivalStats {
  health: number;
  hunger: number;
  armor: number;
  cold: number;
  wolfPressure: number;
  day: number;
  isNight: boolean;
}

interface ShelterVitals {
  dryness: number;
  warmth: number;
  noise: number;
  morale: number;
}

interface CabinPlacedBlockSave {
  kind: BlockKind;
  x: number;
  z: number;
}

interface CabinSaveState {
  version: 1;
  savedAt: number;
  selected: BlockKind;
  resources: Record<ResourceKind, number>;
  acquired: Record<ResourceKind, number>;
  harvested: Record<HarvestKind, number>;
  crafted: Record<ToolKind, boolean>;
  stats: SurvivalStats;
  shelter: ShelterVitals;
  placedBlocks: CabinPlacedBlockSave[];
  target: { x: number; z: number };
  dayProgress: number;
  mapRevealed: boolean;
  mapChecks: number;
  sleptNights: number;
  safeNightSecured: boolean;
  coldSnapsManaged: number;
  projects: Record<ProjectKind, boolean>;
  expeditions: Record<ExpeditionKind, number>;
  stewardMode: boolean;
  stewardActions: number;
  autopilotActions: number;
  blueprintMode: boolean;
  blueprintActions: number;
  blueprintPieces: number;
  packPrepared: number;
  provisions: number;
  smartActions: number;
  autoPickupCount: number;
  activeEvent: CampEventKind;
  eventActions: number;
  eventHistory: string[];
  commandActions: number;
  commandHistory: string[];
  lastCommandPlan: string;
  routineActions: number;
  routinePlan: string;
  routineHistory: string[];
  shelterFixes: number;
  lastTip: string;
}

interface CabinDebugState {
  mode: "cabin";
  blocks: number;
  selected: BlockKind;
  selectedTitle: string;
  selectedCost: string;
  heldPreview: string;
  handRigVisible: boolean;
  handRigTool: string;
  handRigMotion: string;
  handRigParts: number;
  quickSlots: string[];
  landmarkLabels: number;
  resources: Record<ResourceKind, number>;
  acquired: Record<ResourceKind, number>;
  placedCounts: Record<BlockKind, number>;
  harvested: Record<HarvestKind, number>;
  crafted: Record<ToolKind, boolean>;
  smartActions: number;
  autoPickupCount: number;
  goalsCompleted: number;
  goalIdsDone: string[];
  nextGoal: string;
  stats: SurvivalStats;
  shelter: ShelterVitals;
  shelterGrade: string;
  shelterPlan: string;
  shelterFocus: string;
  shelterFixes: number;
  weather: WeatherKind;
  campScore: number;
  mapRevealed: boolean;
  mapChecks: number;
  sleptNights: number;
  safeNightSecured: boolean;
  coldSnapsManaged: number;
  projects: Record<ProjectKind, boolean>;
  expeditions: Record<ExpeditionKind, number>;
  stewardMode: boolean;
  stewardActions: number;
  autopilotMode: boolean;
  autopilotActions: number;
  blueprintMode: boolean;
  blueprintStage: BlueprintStage;
  blueprintActions: number;
  blueprintPieces: number;
  blueprintGhosts: number;
  packOpen: boolean;
  packActions: number;
  packPrepared: number;
  packReady: number;
  packRecipes: string[];
  provisions: number;
  securityScore: number;
  introVisible: boolean;
  introWorldLabelsHidden: boolean;
  introBeaconHidden: boolean;
  introBlueprintHidden: boolean;
  introBriefItems: number;
  reticleVisible: boolean;
  reticlePrompt: string;
  actionRingCharge: number;
  autosaves: number;
  saveRestored: boolean;
  saveBlocks: number;
  saveAgeSec: number;
  cabinAtmospherePieces: number;
  chimneySmokePuffs: number;
  warmWindowGlows: number;
  mapFocusMode: boolean;
  minimapMarkers: number;
  guideTitle: string;
  guideDistance: number;
  guideTrailDots: number;
  fireflyCount: number;
  nearbyHint: string;
  nearbyAction: string;
  nearbyActionDistance: number;
  nearbyMarkerVisible: boolean;
  nearbyTargetTitle: string;
  nearbyInteractions: number;
  lastNearbyAction: string;
  harvestPopupCount: number;
  lastHarvestPopup: string;
  toolSwingVisible: boolean;
  toolSwingCount: number;
  lastToolSwing: string;
  shelterAuraVisible: boolean;
  shelterAuraTone: string;
  shelterAuraRings: number;
  wolfTrailVisible: boolean;
  wolfTrailPrints: number;
  survivalVignette: string;
  focusTitle: string;
  focusDetail: string;
  focusRisk: string;
  focusRoute: string;
  focusText: string;
  activeEvent: CampEventKind;
  eventTitle: string;
  eventHistory: string[];
  eventActions: number;
  eventBeaconVisible: boolean;
  safetyPlan: string;
  commandMode: boolean;
  commandActions: number;
  commandCards: CabinCommandCard[];
  commandHistory: string[];
  lastCommandPlan: string;
  commandRisk: string;
  routineMode: boolean;
  routineActions: number;
  routinePlan: string;
  routineHistory: string[];
  dayProgress: number;
  target: { x: number; y: number; z: number };
  camera: { x: number; y: number; z: number };
}

declare global {
  interface Window {
    __cabinBuilderDebug?: {
      state: () => CabinDebugState;
      place: (x: number, z: number, kind?: BlockKind) => CabinDebugState;
      harvest: (type?: HarvestKind) => CabinDebugState;
      eatBerry: () => CabinDebugState;
      craftAxe: () => CabinDebugState;
      craftCampfire: () => CabinDebugState;
      craftBow: () => CabinDebugState;
      craftPickaxe: () => CabinDebugState;
      craftArmor: () => CabinDebugState;
      cookMeat: () => CabinDebugState;
      smeltIron: () => CabinDebugState;
      scoutMap: () => CabinDebugState;
      sleepNight: () => CabinDebugState;
      forceWeather: (kind?: WeatherKind) => CabinDebugState;
      forceColdSnap: () => CabinDebugState;
      buildProject: (kind?: ProjectKind) => CabinDebugState;
      expedition: (kind?: ExpeditionKind) => CabinDebugState;
      toggleSteward: () => CabinDebugState;
      toggleAutopilot: (force?: boolean) => CabinDebugState;
      blueprintBuild: (pieces?: number) => CabinDebugState;
      togglePack: (force?: boolean) => CabinDebugState;
      packCraft: (kind?: PackRecipeKind) => CabinDebugState;
      start: () => CabinDebugState;
      interact: () => CabinDebugState;
      toggleMap: (force?: boolean) => CabinDebugState;
      stewardTick: () => CabinDebugState;
      forceEvent: (kind?: CampEventKind) => CabinDebugState;
      command: (kind?: CabinCommandKind) => CabinDebugState;
      smartAction: () => CabinDebugState;
      autoSurvive: (steps?: number) => CabinDebugState;
      forceNight: () => CabinDebugState;
      removeLast: () => CabinDebugState;
    };
  }
}

const MATERIALS: Record<BlockKind, { name: string; color: number; roughness: number; metalness?: number; opacity?: number }> = {
  wood: { name: "木墙", color: 0x9b6438, roughness: 0.86 },
  stone: { name: "石基", color: 0x78818a, roughness: 0.92 },
  leaf: { name: "树篱", color: 0x4fa85f, roughness: 0.78 },
  glass: { name: "窗格", color: 0x9ddfff, roughness: 0.22, opacity: 0.42 },
  lamp: { name: "营灯", color: 0xffd36a, roughness: 0.36, metalness: 0.1 },
  chest: { name: "木箱", color: 0x8a5730, roughness: 0.84 },
  furnace: { name: "熔炉", color: 0x595f63, roughness: 0.92 },
  bed: { name: "床铺", color: 0xbe6159, roughness: 0.72 },
};

const RESOURCE_LABELS: Record<ResourceKind, string> = {
  wood: "木材",
  stone: "石头",
  leaf: "纤维",
  glass: "碎晶",
  lamp: "灯芯",
  chest: "箱具",
  furnace: "炉件",
  bed: "床铺",
  stick: "木棍",
  berry: "浆果",
  hide: "兽皮",
  meat: "生肉",
  cookedMeat: "烤肉",
  bone: "骨头",
  coal: "煤炭",
  ironOre: "铁矿",
  iron: "铁锭",
};

const TOOL_LABELS: Record<ToolKind, string> = {
  axe: "石斧",
  campfire: "篝火",
  bow: "木弓",
  pickaxe: "石镐",
  armor: "皮甲",
};

const WEATHER_LABELS: Record<WeatherKind, string> = {
  clear: "晴",
  rain: "雨",
  coldSnap: "寒潮",
};

const PROJECT_LABELS: Record<ProjectKind, string> = {
  rainBarrel: "雨桶",
  trapline: "陷阱线",
  watchPost: "哨塔",
};

const EXPEDITION_LABELS: Record<ExpeditionKind, string> = {
  forest: "林线",
  mine: "矿脊",
  hunt: "猎径",
};

const BLUEPRINT_LABELS: Record<BlueprintStage, string> = {
  porch: "门廊",
  light: "照明",
  hedge: "树篱",
  workshop: "工坊",
  rest: "床位",
  secure: "围护",
  freeform: "自由扩建",
};

const PACK_RECIPES: Array<{
  kind: PackRecipeKind;
  title: string;
  detail: string;
  cost: Partial<Record<ResourceKind, number>>;
}> = [
  { kind: "fieldMeal", title: "口粮包", detail: "补给 +2，饥饿和生命回升。", cost: { berry: 1, cookedMeat: 1 } },
  { kind: "campKit", title: "营地套件", detail: "补给 +1，补一枚营灯，适合扩建。", cost: { wood: 2, stone: 1, stick: 1 } },
  { kind: "trailKit", title: "巡径包", detail: "补给 +1，复核夜狼路径并降低狼压。", cost: { bone: 1, stick: 1, berry: 1 } },
  { kind: "repairKit", title: "修补包", detail: "补给 +1，修墙补篱并提高生命。", cost: { hide: 1, leaf: 2 } },
  { kind: "winterKit", title: "保温包", detail: "补给 +1，寒冷下降。", cost: { coal: 1, leaf: 1 } },
];

const HARVEST_LABELS: Record<HarvestKind, string> = {
  tree: "松木",
  stone: "石堆",
  bush: "浆果",
  stick: "木棍",
  pebble: "石子",
  crate: "补给",
  deer: "鹿群",
  boar: "野猪",
  wolf: "夜狼",
  zombie: "游荡者",
  coal: "煤矿",
  iron: "铁矿",
};

const HARVEST_COLORS: Record<HarvestKind, number> = {
  tree: 0x8fdc78,
  stone: 0xd8e1e6,
  bush: 0xff8794,
  stick: 0xd9a46d,
  pebble: 0xd8e1e6,
  crate: 0xffd560,
  deer: 0xf2c18a,
  boar: 0xd29370,
  wolf: 0xbddcff,
  zombie: 0xa9ff94,
  coal: 0x87929c,
  iron: 0xffad7d,
};

const CAMP_EVENT_DEFS: Record<CampEventKind, {
  title: string;
  label: string;
  detail: string;
  color: number;
  glow: number;
  position: [number, number];
}> = {
  quietWatch: {
    title: "晨雾巡查",
    label: "巡",
    detail: "营地暂稳，适合补墙、补灯和整理背包。",
    color: 0x9fd7e6,
    glow: 0x4fa7b8,
    position: [-1.8, 4.2],
  },
  mushroomBloom: {
    title: "雨后蘑菇",
    label: "食",
    detail: "林线冒出可食菌，补给和浆果增加。",
    color: 0xff6f88,
    glow: 0xffb0c0,
    position: [3.8, 3.25],
  },
  supplyCache: {
    title: "旧路补给",
    label: "补",
    detail: "旧木箱被翻出，适合扩营和制工具。",
    color: 0xffd560,
    glow: 0xfff0a8,
    position: [-6.5, 4.2],
  },
  wolfTracks: {
    title: "狼踪逼近",
    label: "狼",
    detail: "夜狼开始绕营，哨塔和弓能压住风险。",
    color: 0x8ec7ff,
    glow: 0xd9efff,
    position: [-6.6, -5.3],
  },
  coldFront: {
    title: "寒锋压林",
    label: "寒",
    detail: "冷空气穿过林地，篝火、床铺和熔炉变关键。",
    color: 0xc8f5ff,
    glow: 0xffffff,
    position: [0.7, -6.4],
  },
};

const RESOURCE_ORDER: ResourceKind[] = ["wood", "stone", "stick", "leaf", "berry", "hide", "meat", "cookedMeat", "coal", "ironOre", "iron", "glass", "lamp"];
const BLOCK_KEYS = Object.keys(MATERIALS) as BlockKind[];
const GRID_LIMIT = 9;
const DAY_LENGTH_MS = 72_000;
const CABIN_SAVE_KEY = "brain-bloom-cabin-save-v1";

const BUILD_COSTS: Record<BlockKind, Partial<Record<ResourceKind, number>>> = {
  wood: { wood: 1 },
  stone: { stone: 1 },
  leaf: { leaf: 1 },
  glass: { glass: 1 },
  lamp: { wood: 1, stone: 1, lamp: 1 },
  chest: { wood: 3 },
  furnace: { stone: 4, coal: 1 },
  bed: { wood: 2, hide: 1 },
};

const PROJECT_COSTS: Record<ProjectKind, Partial<Record<ResourceKind, number>>> = {
  rainBarrel: { wood: 2, glass: 1 },
  trapline: { wood: 2, stick: 2, bone: 1 },
  watchPost: { wood: 4, stone: 2, lamp: 1 },
};

const INITIAL_RESOURCES: Record<ResourceKind, number> = {
  wood: 3,
  stone: 1,
  leaf: 1,
  glass: 0,
  lamp: 1,
  chest: 0,
  furnace: 0,
  bed: 0,
  stick: 0,
  berry: 1,
  hide: 0,
  meat: 0,
  cookedMeat: 0,
  bone: 0,
  coal: 0,
  ironOre: 0,
  iron: 0,
};

const HARVEST_ZERO: Record<HarvestKind, number> = {
  tree: 0,
  stone: 0,
  bush: 0,
  stick: 0,
  pebble: 0,
  crate: 0,
  deer: 0,
  boar: 0,
  wolf: 0,
  zombie: 0,
  coal: 0,
  iron: 0,
};

const PROJECT_ZERO: Record<ProjectKind, boolean> = {
  rainBarrel: false,
  trapline: false,
  watchPost: false,
};

const EXPEDITION_ZERO: Record<ExpeditionKind, number> = {
  forest: 0,
  mine: 0,
  hunt: 0,
};

const AUTO_BUILD_PLAN: Record<BlockKind, Array<[number, number]>> = {
  wood: [[-2, 4], [-1, 4], [0, 4], [1, 4]],
  stone: [[-2, 5], [-1, 5], [0, 5]],
  leaf: [[-3, 4], [-3, 5], [-3, 6], [-2, 6], [-1, 6]],
  glass: [[1, 4], [2, 4]],
  lamp: [[-1, 5], [1, 5]],
  chest: [[2, 5], [2, 6]],
  furnace: [[0, 6], [1, 6]],
  bed: [[-1, 6], [0, 6]],
};

interface GoalContext {
  resources: Record<ResourceKind, number>;
  acquired: Record<ResourceKind, number>;
  placedCounts: Record<BlockKind, number>;
  harvested: Record<HarvestKind, number>;
  crafted: Record<ToolKind, boolean>;
  stats: SurvivalStats;
  campScore: number;
  mapRevealed: boolean;
  mapChecks: number;
  sleptNights: number;
  safeNightSecured: boolean;
  coldSnapsManaged: number;
  projects: Record<ProjectKind, boolean>;
  expeditions: Record<ExpeditionKind, number>;
  stewardMode: boolean;
  stewardActions: number;
  provisions: number;
  securityScore: number;
}

const GOALS: Array<{
  id: string;
  title: string;
  description: string;
  check: (context: GoalContext) => boolean;
}> = [
  {
    id: "forage",
    title: "拾荒开局",
    description: "木棍 2 / 石头 2",
    check: ({ acquired }) => acquired.stick >= 2 && acquired.stone >= 2,
  },
  {
    id: "first-tree",
    title: "砍倒树木",
    description: "采集 1 棵松树",
    check: ({ harvested }) => harvested.tree >= 1,
  },
  {
    id: "stone-axe",
    title: "制作石斧",
    description: "木棍 2 / 石头 2",
    check: ({ crafted }) => crafted.axe,
  },
  {
    id: "campfire",
    title: "点起篝火",
    description: "木材 3 / 石头 2",
    check: ({ crafted }) => crafted.campfire,
  },
  {
    id: "porch",
    title: "搭出门廊",
    description: "放置 3 段木墙",
    check: ({ placedCounts }) => placedCounts.wood >= 3,
  },
  {
    id: "camp-light",
    title: "点亮营地",
    description: "放置 1 盏营灯",
    check: ({ placedCounts }) => placedCounts.lamp >= 1,
  },
  {
    id: "hedge",
    title: "圈出树篱",
    description: "放置 4 段树篱",
    check: ({ placedCounts }) => placedCounts.leaf >= 4,
  },
  {
    id: "food",
    title: "备好口粮",
    description: "收集 3 颗浆果",
    check: ({ acquired }) => acquired.berry >= 3,
  },
  {
    id: "safe-night",
    title: "守住夜色",
    description: "夜晚生命保持 70+",
    check: ({ placedCounts, safeNightSecured, stats }) => safeNightSecured || (stats.isNight && stats.health >= 70 && placedCounts.lamp >= 1),
  },
  {
    id: "wood-bow",
    title: "制作木弓",
    description: "木棍 2 / 纤维 1",
    check: ({ crafted }) => crafted.bow,
  },
  {
    id: "first-hunt",
    title: "猎到生肉",
    description: "猎杀 1 只野物",
    check: ({ harvested }) => harvested.deer + harvested.boar + harvested.wolf >= 1,
  },
  {
    id: "cooked-meat",
    title: "烤熟肉排",
    description: "在篝火旁烤肉",
    check: ({ acquired }) => acquired.cookedMeat >= 1,
  },
  {
    id: "hide-armor",
    title: "穿上皮甲",
    description: "兽皮 2 / 骨头 1",
    check: ({ crafted }) => crafted.armor,
  },
  {
    id: "stone-pickaxe",
    title: "制作石镐",
    description: "木棍 2 / 石头 3",
    check: ({ crafted }) => crafted.pickaxe,
  },
  {
    id: "furnace",
    title: "点燃熔炉",
    description: "放置 1 座熔炉",
    check: ({ placedCounts }) => placedCounts.furnace >= 1,
  },
  {
    id: "iron-ingot",
    title: "炼出铁锭",
    description: "铁矿 2 / 煤炭 1",
    check: ({ acquired }) => acquired.iron >= 1,
  },
  {
    id: "storage",
    title: "整理木箱",
    description: "放置 1 个木箱",
    check: ({ placedCounts }) => placedCounts.chest >= 1,
  },
  {
    id: "bed",
    title: "铺好床位",
    description: "放置 1 张床铺",
    check: ({ placedCounts }) => placedCounts.bed >= 1,
  },
  {
    id: "map-scout",
    title: "侦察地图",
    description: "标出煤矿 / 铁矿 / 野径",
    check: ({ mapRevealed, mapChecks }) => mapRevealed && mapChecks >= 1,
  },
  {
    id: "cold-snap",
    title: "扛过寒潮",
    description: "寒潮中保持体温稳定",
    check: ({ coldSnapsManaged }) => coldSnapsManaged >= 1,
  },
  {
    id: "sleep-night",
    title: "睡过长夜",
    description: "床铺跳过 1 个夜晚",
    check: ({ sleptNights }) => sleptNights >= 1,
  },
  {
    id: "comfort-camp",
    title: "稳固营地",
    description: "营地评分达到 86",
    check: ({ campScore }) => campScore >= 86,
  },
  {
    id: "rain-barrel",
    title: "接雨储备",
    description: "建造 1 个雨桶",
    check: ({ projects }) => projects.rainBarrel,
  },
  {
    id: "trapline",
    title: "布置陷阱线",
    description: "木棍 / 骨头换长期肉源",
    check: ({ projects }) => projects.trapline,
  },
  {
    id: "watch-post",
    title: "架起哨塔",
    description: "夜狼路径可提前预警",
    check: ({ projects }) => projects.watchPost,
  },
  {
    id: "steward",
    title: "托管营地",
    description: "管家完成 3 次维护",
    check: ({ stewardActions, stewardMode }) => stewardMode && stewardActions >= 3,
  },
  {
    id: "forest-expedition",
    title: "林线远征",
    description: "派出 1 次林线远征",
    check: ({ expeditions }) => expeditions.forest >= 1,
  },
  {
    id: "mine-expedition",
    title: "矿脊远征",
    description: "派出 1 次矿脊远征",
    check: ({ expeditions }) => expeditions.mine >= 1,
  },
  {
    id: "hunt-expedition",
    title: "猎径远征",
    description: "派出 1 次猎径远征",
    check: ({ expeditions }) => expeditions.hunt >= 1,
  },
  {
    id: "secure-loop",
    title: "自持据点",
    description: "安全评分达到 120",
    check: ({ securityScore }) => securityScore >= 120,
  },
];

const clampStat = (value: number) => Math.round(THREE.MathUtils.clamp(value, 0, 100));

export function startCabinBuilder(root: HTMLElement) {
  root.replaceChildren();
  root.className = "cabin-shell";

  const canvasWrap = document.createElement("div");
  canvasWrap.className = "cabin-canvas";
  root.append(canvasWrap);

  const hud = document.createElement("div");
  hud.className = "cabin-hud";
  hud.innerHTML = `
    <div class="cabin-topline">
      <div class="cabin-title">林间小屋</div>
      <div class="cabin-clock" data-clock>第 1 天 08:00</div>
    </div>
    <div class="cabin-vitals">
      <div class="cabin-bar health"><span>生命</span><b data-health-bar></b><em data-health-value>100</em></div>
      <div class="cabin-bar hunger"><span>饥饿</span><b data-hunger-bar></b><em data-hunger-value>78</em></div>
      <div class="cabin-bar cold"><span>寒冷</span><b data-cold-bar></b><em data-cold-value>12</em></div>
      <div class="cabin-bar threat"><span>狼压</span><b data-threat-bar></b><em data-threat-value>0</em></div>
    </div>
    <div class="cabin-stat" data-stat="blocks">营地 0</div>
    <div class="cabin-tools" data-tools></div>
    <div class="cabin-resources" data-resources></div>
    <div class="cabin-map" data-map></div>
    <div class="cabin-shelter" data-shelter></div>
    <div class="cabin-systems" data-systems></div>
    <div class="cabin-plan" data-plan>营地计划装载中</div>
    <div class="cabin-goals" data-goals></div>
    <div class="cabin-tip" data-tip>先捡木棍和石子，再砍树、采浆果、点灯过夜。</div>
    <div class="cabin-actions">
      <button type="button" data-smart>执行任务</button>
      <button type="button" data-autopilot>自走营地</button>
      <button type="button" data-blueprint>蓝图铺设</button>
      <button type="button" data-pack>背包</button>
      <button type="button" data-craft-axe>制石斧</button>
      <button type="button" data-craft-bow>制木弓</button>
      <button type="button" data-craft-campfire>点篝火</button>
      <button type="button" data-cook>烤肉</button>
      <button type="button" data-scout>侦察</button>
      <button type="button" data-sleep>睡觉</button>
      <button type="button" data-steward>托管</button>
      <button type="button" data-expedition>远征</button>
      <button type="button" data-eat>吃浆果</button>
      <a class="cabin-link" href="/">游戏大厅</a>
    </div>
  `;
  root.append(hud);

  const minimap = document.createElement("div");
  minimap.className = "cabin-minimap";
  root.append(minimap);

  const focusPanel = document.createElement("div");
  focusPanel.className = "cabin-focus";
  root.append(focusPanel);

  const commandPanel = document.createElement("div");
  commandPanel.className = "cabin-command";
  commandPanel.innerHTML = `
    <div class="cabin-command-head">
      <strong>营地指令</strong>
      <span data-cabin-command-grade>待命</span>
    </div>
    <div class="cabin-command-cards" data-cabin-command-cards></div>
  `;
  root.append(commandPanel);

  const intro = document.createElement("div");
  intro.className = "cabin-intro";
  intro.innerHTML = `
    <div class="cabin-intro-main">
      <div class="cabin-intro-mark">林</div>
      <h1>林间小屋</h1>
      <p>晨雾压着树线，炉火还没稳，第一夜很快会来。</p>
      <div class="cabin-intro-grid">
        <span>采集</span>
        <span>建造</span>
        <span>守夜</span>
        <span>远征</span>
      </div>
      <div class="cabin-intro-brief">
        <strong>第一夜剧本</strong>
        <span>搜木棍和石子</span>
        <span>制石斧再砍树</span>
        <span>天黑前点火</span>
        <span>标出狼径和矿脊</span>
      </div>
      <button type="button" data-cabin-start>开始游戏</button>
      <div class="cabin-intro-save">进度会自动保存在本地浏览器</div>
    </div>
  `;
  root.append(intro);

  const reticle = document.createElement("div");
  reticle.className = "cabin-reticle";
  reticle.innerHTML = `
    <div class="cabin-reticle-ring" data-cabin-reticle-ring></div>
    <div class="cabin-reticle-dot"></div>
    <div class="cabin-reticle-prompt" data-cabin-reticle-prompt>营地</div>
  `;
  root.append(reticle);

  const inventory = document.createElement("div");
  inventory.className = "cabin-inventory";
  root.append(inventory);

  const handPanel = document.createElement("div");
  handPanel.className = "cabin-hand";
  root.append(handPanel);

  const packPanel = document.createElement("div");
  packPanel.className = "cabin-pack";
  packPanel.hidden = true;
  root.append(packPanel);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8bc7ff);
  scene.fog = new THREE.Fog(0x8bc7ff, 16, 46);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvasWrap.append(renderer.domElement);

  const ambient = new THREE.HemisphereLight(0xdff6ff, 0x273c20, 2.1);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xfff1c8, 2.4);
  sun.position.set(8, 12, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);

  const target = new THREE.Vector3(-1.6, 1.35, 3.8);
  const cameraState = { theta: Math.PI * 0.23, phi: 1.14, radius: 10.8 };
  const stats: SurvivalStats = { health: 100, hunger: 78, armor: 8, cold: 12, wolfPressure: 0, day: 1, isNight: false };
  const shelter: ShelterVitals = { dryness: 62, warmth: 48, noise: 24, morale: 58 };
  let selected: BlockKind = "wood";
  let dragging = false;
  let movedDuringDrag = false;
  let lastPointer = { x: 0, y: 0 };
  let lastTip = "先捡木棍和石子，再砍树、采浆果、点灯过夜。";
  let dayProgress = 0.28;
  let forcedDayProgress: number | null = null;
  let weather: WeatherKind = "clear";
  let weatherOverrideUntil = 0;
  let mapRevealed = false;
  let mapChecks = 0;
  let sleptNights = 0;
  let safeNightSecured = false;
  let coldSnapsManaged = 0;
  let stewardMode = false;
  let stewardActions = 0;
  let autopilotMode = false;
  let autopilotActions = 0;
  let blueprintMode = true;
  let blueprintActions = 0;
  let blueprintPieces = 0;
  let packOpen = false;
  let packActions = 0;
  let packPrepared = 0;
  let provisions = 0;
  let introVisible = true;
  let mapFocusMode = false;
  let nextStewardAt = performance.now() + 2_500;
  let nextAutopilotAt = performance.now() + 1_200;
  let activeEvent: CampEventKind = "quietWatch";
  let eventActions = 0;
  let lastEventAtAction = -1;
  let commandMode = true;
  let commandActions = 0;
  let lastCommandPlan = "等待营火。";
  let routineMode = true;
  let routineActions = 0;
  let routinePlan = "晨间巡线：补食物、铺蓝图、压狼径。";
  let shelterFixes = 0;
  const eventHistory: string[] = [];
  const commandHistory: string[] = [];
  const routineHistory: string[] = [];
  let lastCycle = dayProgress;
  let autosaves = 0;
  let lastSaveAt = 0;
  let lastSavedBlocks = 0;
  let saveRestored = false;
  const startTime = performance.now();
  let lastFrame = performance.now();

  const blockMaterials = createMaterials();
  const blocks = new Map<string, THREE.Mesh>();
  const projectGroups = new Map<ProjectKind, THREE.Group>();
  const placedBlocks: THREE.Mesh[] = [];
  const blueprintMarkerViews: Array<{ kind: BlockKind; key: string; mesh: THREE.Mesh }> = [];
  const placedCounts: Record<BlockKind, number> = { wood: 0, stone: 0, leaf: 0, glass: 0, lamp: 0, chest: 0, furnace: 0, bed: 0 };
  const resources: Record<ResourceKind, number> = { ...INITIAL_RESOURCES };
  const acquired: Record<ResourceKind, number> = { ...INITIAL_RESOURCES };
  const harvested: Record<HarvestKind, number> = { ...HARVEST_ZERO };
  const crafted: Record<ToolKind, boolean> = { axe: false, campfire: false, bow: false, pickaxe: false, armor: false };
  const projects: Record<ProjectKind, boolean> = { ...PROJECT_ZERO };
  const expeditions: Record<ExpeditionKind, number> = { ...EXPEDITION_ZERO };
  let smartActions = 0;
  let autoPickupCount = 0;
  let nearbyInteractions = 0;
  let lastNearbyAction = "准星待命：靠近资源后按 E。";
  let lastHarvestPopup = "待命";
  let toolSwingCount = 0;
  let lastToolSwing = "待命";
  let toolSwingUntil = 0;
  let handRigTool = "木墙";
  let handRigMotion = "待命";
  let handRigSwingUntil = 0;
  let survivalVignette = "平稳";
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hover = createHoverMarker();
  const harvestables: THREE.Object3D[] = [];
  const harvestPopups: Array<{ sprite: THREE.Sprite; bornAt: number; ttl: number; baseY: number }> = [];
  let heldPreview: THREE.Mesh | null = null;
  const player = createPlayer();
  const handRig = createHandRig();
  const campfire = createCampfire();
  const wolf = createWolf();
  const shelterAura = createShelterAura();
  const toolSwing = createToolSwing();
  const wolfTrail = createWolfTrail();
  const weatherRig = createWeatherRig();
  const fireflies = createFireflies();
  const mapMarkers = createMapMarkers();
  const eventBeacon = createEventBeacon();
  const guideTrail = createGuideTrail();
  const nearbyMarker = createNearbyMarker();
  const blueprintMarkers = createBlueprintMarkers();
  const landmarkLabels: THREE.Sprite[] = [];
  const cabinAtmosphere: THREE.Object3D[] = [];
  const chimneySmoke: THREE.Mesh[] = [];
  const warmWindowGlows: THREE.Mesh[] = [];

  scene.add(hover);
  scene.add(camera);
  camera.add(handRig);
  createTerrain(scene);
  createCabin(scene);
  createTrees(scene);
  createStonePiles(scene);
  createOrePiles(scene);
  createBerryBushes(scene);
  createAnimals(scene);
  createPickups(scene);
  createCampDetails(scene);
  scene.add(player);
  scene.add(campfire);
  scene.add(wolf);
  scene.add(shelterAura);
  scene.add(toolSwing);
  scene.add(wolfTrail);
  scene.add(weatherRig);
  scene.add(fireflies);
  scene.add(mapMarkers);
  scene.add(eventBeacon);
  scene.add(guideTrail);
  scene.add(nearbyMarker);
  scene.add(blueprintMarkers);
  triggerCampEvent("quietWatch", "开局", false);
  restoreCabinSnapshot();
  createInventory();
  updateCamera();
  installEvents();
  installDebugApi();
  updateHud();
  animate();

  function createMaterials() {
    const result = {} as Record<BlockKind, THREE.MeshStandardMaterial>;
    for (const kind of BLOCK_KEYS) {
      const meta = MATERIALS[kind];
      result[kind] = new THREE.MeshStandardMaterial({
        color: meta.color,
        roughness: meta.roughness,
        metalness: meta.metalness ?? 0,
        transparent: Boolean(meta.opacity),
        opacity: meta.opacity ?? 1,
      });
    }
    return result;
  }

  function createTerrain(targetScene: THREE.Scene) {
    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(24, 0.35, 24),
      new THREE.MeshStandardMaterial({ color: 0x4f8f4d, roughness: 0.9 }),
    );
    ground.position.y = -0.22;
    ground.receiveShadow = true;
    targetScene.add(ground);

    const grid = new THREE.GridHelper(18, 18, 0xd9f1bd, 0x315c3a);
    grid.position.y = 0.01;
    targetScene.add(grid);

    const pathMaterial = new THREE.MeshStandardMaterial({ color: 0x9b7a50, roughness: 0.95 });
    for (let z = -8; z <= 1; z += 1) addPathSlab(targetScene, -3, z, pathMaterial);
    for (let x = -3; x <= 4; x += 1) addPathSlab(targetScene, x, 1, pathMaterial);

    const pond = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.7, 0.06, 24),
      new THREE.MeshStandardMaterial({ color: 0x377ca5, roughness: 0.48, metalness: 0.05 }),
    );
    pond.position.set(6.4, 0.03, -1.2);
    pond.scale.z = 0.55;
    pond.receiveShadow = true;
    targetScene.add(pond);

    for (let i = 0; i < 34; i += 1) {
      const grass = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.45 + (i % 3) * 0.08, 4),
        new THREE.MeshStandardMaterial({ color: i % 2 ? 0x69b55a : 0x3f7f43, roughness: 0.9 }),
      );
      const angle = i * 2.14;
      const radius = 4.5 + (i % 7);
      grass.position.set(Math.cos(angle) * radius, 0.23, Math.sin(angle) * radius);
      grass.rotation.y = angle;
      grass.castShadow = true;
      targetScene.add(grass);
    }

    const horizonMaterial = new THREE.MeshStandardMaterial({ color: 0x24492d, roughness: 0.92 });
    for (let i = 0; i < 18; i += 1) {
      const tree = new THREE.Group();
      const angle = i * 0.72;
      const radius = 15.5 + (i % 4) * 0.6;
      tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.24, 1.25, 6),
        new THREE.MeshStandardMaterial({ color: 0x5b3922, roughness: 0.9 }),
      );
      trunk.position.y = 0.62;
      tree.add(trunk);
      const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.95 + (i % 3) * 0.16, 1.8, 7), horizonMaterial);
      leaves.position.y = 1.65;
      tree.add(leaves);
      tree.scale.setScalar(0.9 + (i % 5) * 0.08);
      targetScene.add(tree);
    }
  }

  function addPathSlab(targetScene: THREE.Scene, x: number, z: number, material: THREE.Material) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(1, 0.08, 1), material);
    slab.position.set(x, 0.04, z);
    slab.receiveShadow = true;
    targetScene.add(slab);
  }

  function createCabin(targetScene: THREE.Scene) {
    const wallMaterial = blockMaterials.wood;
    const stoneMaterial = blockMaterials.stone;
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x5f2f28, roughness: 0.82 });
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2118, roughness: 0.88 });

    for (let x = -2; x <= 2; x += 1) {
      addStaticBlock(targetScene, x, 0.5, 3, wallMaterial);
      addStaticBlock(targetScene, x, 1.5, 3, wallMaterial);
      addStaticBlock(targetScene, x, 0.5, -1, wallMaterial);
      addStaticBlock(targetScene, x, 1.5, -1, wallMaterial);
    }
    for (let z = -1; z <= 3; z += 1) {
      addStaticBlock(targetScene, -2, 0.5, z, wallMaterial);
      addStaticBlock(targetScene, 2, 0.5, z, wallMaterial);
      addStaticBlock(targetScene, -2, 1.5, z, wallMaterial);
      addStaticBlock(targetScene, 2, 1.5, z, wallMaterial);
    }
    addStaticBlock(targetScene, 0, 0.5, 3.04, doorMaterial);
    addStaticBlock(targetScene, 0, 1.5, 3.04, blockMaterials.glass);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.9, 2.25, 4), roofMaterial);
    roof.position.set(0, 3.3, 1);
    roof.rotation.y = Math.PI * 0.25;
    roof.castShadow = true;
    targetScene.add(roof);

    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.1, 0.55), stoneMaterial);
    chimney.position.set(1.25, 4.05, 0.25);
    chimney.castShadow = true;
    targetScene.add(chimney);

    const windowGlowMaterial = new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.48, depthWrite: false });
    for (const x of [-1.25, 1.25]) {
      const glow = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.42, 0.045), windowGlowMaterial.clone());
      glow.position.set(x, 1.55, 3.56);
      glow.userData.warmGlow = true;
      targetScene.add(glow);
      warmWindowGlows.push(glow);
      cabinAtmosphere.push(glow);
    }

    const smokeMaterial = new THREE.MeshBasicMaterial({ color: 0xd8efe6, transparent: true, opacity: 0.24, depthWrite: false });
    for (let i = 0; i < 7; i += 1) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.18 + i * 0.018, 10, 8), smokeMaterial.clone());
      puff.position.set(1.25 + Math.sin(i) * 0.1, 4.75 + i * 0.18, 0.25 + Math.cos(i * 1.7) * 0.08);
      puff.userData.smokeSeed = i * 1.37;
      targetScene.add(puff);
      chimneySmoke.push(puff);
      cabinAtmosphere.push(puff);
    }

    for (const [x, z] of [
      [-1.72, 3.78],
      [1.72, 3.78],
    ] as Array<[number, number]>) {
      const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.28, 8), blockMaterials.lamp);
      lantern.position.set(x, 1.16, z);
      lantern.castShadow = true;
      targetScene.add(lantern);
      const glow = new THREE.PointLight(0xffbf6a, 0.9, 4);
      glow.position.copy(lantern.position);
      targetScene.add(glow);
      cabinAtmosphere.push(lantern, glow);
    }

    const lamp = new THREE.PointLight(0xffc66d, 2.8, 9);
    lamp.position.set(-0.9, 2.18, 3.35);
    targetScene.add(lamp);
    const lampMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), blockMaterials.lamp);
    lampMesh.position.copy(lamp.position);
    lampMesh.castShadow = true;
    targetScene.add(lampMesh);
  }

  function createTrees(targetScene: THREE.Scene) {
    [
      [-7, -5],
      [-7, 5],
      [6, -6],
      [7, 4],
      [0, -7],
      [-9, -1],
      [3, 7],
    ].forEach(([x, z], index) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);
      tree.userData.harvest = "tree";
      tree.userData.baseScale = tree.scale.clone();

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.34, 1.8, 8),
        new THREE.MeshStandardMaterial({ color: 0x6e4324, roughness: 0.9 }),
      );
      trunk.position.y = 0.9;
      trunk.castShadow = true;
      tree.add(trunk);

      for (let layer = 0; layer < 3; layer += 1) {
        const leaves = new THREE.Mesh(
          new THREE.ConeGeometry(1.45 - layer * 0.24 + (index % 2) * 0.08, 1.55, 8),
          blockMaterials.leaf,
        );
        leaves.position.y = 1.85 + layer * 0.72;
        leaves.castShadow = true;
        tree.add(leaves);
      }

      attachWorldLabel(tree, "tree", 4.15);
      harvestables.push(tree);
      targetScene.add(tree);
    });
  }

  function createStonePiles(targetScene: THREE.Scene) {
    const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x737b82, roughness: 0.94 });
    [
      [4, -5],
      [-5, 1],
      [5, 5],
    ].forEach(([x, z], index) => {
      const pile = new THREE.Group();
      pile.position.set(x, 0.12, z);
      pile.userData.harvest = "stone";
      pile.userData.baseScale = pile.scale.clone();
      for (let i = 0; i < 4; i += 1) {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32 + i * 0.045), stoneMaterial);
        rock.position.set((i - 1.4) * 0.32, 0.22 + i * 0.04, (i % 2) * 0.28);
        rock.rotation.set(index * 0.4 + i, i * 0.7, index * 0.2);
        rock.castShadow = true;
        rock.receiveShadow = true;
        pile.add(rock);
      }
      attachWorldLabel(pile, "stone", 1.05);
      harvestables.push(pile);
      targetScene.add(pile);
    });
  }

  function createOrePiles(targetScene: THREE.Scene) {
    const coalMaterial = new THREE.MeshStandardMaterial({ color: 0x20262b, roughness: 0.88 });
    const ironMaterial = new THREE.MeshStandardMaterial({ color: 0x8e5a45, roughness: 0.82, metalness: 0.12 });
    [
      [-8, 2.8, "coal", coalMaterial],
      [6.8, -3.8, "iron", ironMaterial],
      [7.2, 6.2, "iron", ironMaterial],
    ].forEach(([x, z, kind, material], index) => {
      const pile = new THREE.Group();
      pile.position.set(Number(x), 0.12, Number(z));
      pile.userData.harvest = kind;
      pile.userData.baseScale = pile.scale.clone();
      for (let i = 0; i < 5; i += 1) {
        const ore = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24 + i * 0.035), material as THREE.Material);
        ore.position.set((i - 2) * 0.24, 0.18 + i * 0.035, (i % 2) * 0.22);
        ore.rotation.set(index + i * 0.4, i * 0.9, index * 0.2);
        ore.castShadow = true;
        ore.receiveShadow = true;
        pile.add(ore);
      }
      attachWorldLabel(pile, kind as HarvestKind, 1.02);
      harvestables.push(pile);
      targetScene.add(pile);
    });
  }

  function createAnimals(targetScene: THREE.Scene) {
    addAnimal(targetScene, "deer", -7.4, -2.6, 0xb78a55, 0.82);
    addAnimal(targetScene, "boar", 5.8, 2.9, 0x6b4734, 0.74);
    addAnimal(targetScene, "zombie", -5.7, 6.7, 0x5f8b68, 0.86);
  }

  function addAnimal(targetScene: THREE.Scene, kind: Extract<HarvestKind, "deer" | "boar" | "zombie">, x: number, z: number, color: number, scale: number) {
    const animal = new THREE.Group();
    animal.position.set(x, 0, z);
    animal.scale.setScalar(scale);
    animal.userData.harvest = kind;
    animal.userData.baseScale = animal.scale.clone();

    const bodyMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.78 });
    const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x211c18, roughness: 0.86 });
    const body = new THREE.Mesh(kind === "zombie" ? new THREE.BoxGeometry(0.46, 0.9, 0.34) : new THREE.BoxGeometry(0.95, 0.45, 0.38), bodyMaterial);
    body.position.y = kind === "zombie" ? 0.72 : 0.54;
    body.castShadow = true;
    animal.add(body);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.3), bodyMaterial);
    head.position.set(kind === "zombie" ? 0 : 0.58, kind === "zombie" ? 1.28 : 0.78, 0);
    head.castShadow = true;
    animal.add(head);

    for (const lx of kind === "zombie" ? [-0.14, 0.14] : [-0.3, 0.32]) {
      for (const lz of [-0.12, 0.12]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.44, 0.12), darkMaterial);
        leg.position.set(lx, 0.24, lz);
        leg.castShadow = true;
        animal.add(leg);
      }
    }

    if (kind === "deer") {
      for (const side of [-1, 1]) {
        const antler = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.025, 0.48, 6), darkMaterial);
        antler.position.set(0.72, 1.0, side * 0.11);
        antler.rotation.z = -0.55;
        animal.add(antler);
      }
    }
    if (kind === "zombie") {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: 0x9dff7a }));
      eye.position.set(0.18, 1.34, -0.16);
      animal.add(eye);
    }

    attachWorldLabel(animal, kind, kind === "zombie" ? 1.82 : 1.28);
    harvestables.push(animal);
    targetScene.add(animal);
  }

  function createBerryBushes(targetScene: THREE.Scene) {
    const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x2f7f3b, roughness: 0.86 });
    const berryMaterial = new THREE.MeshStandardMaterial({ color: 0xd93f53, roughness: 0.62 });
    [
      [-4.5, -4],
      [3.5, 3.2],
      [8, 0.4],
    ].forEach(([x, z], index) => {
      const bush = new THREE.Group();
      bush.position.set(x, 0.18, z);
      bush.userData.harvest = "bush";
      bush.userData.baseScale = bush.scale.clone();
      const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 1), leafMaterial);
      body.scale.set(1.25, 0.72, 1.05);
      body.castShadow = true;
      bush.add(body);
      for (let i = 0; i < 5; i += 1) {
        const berry = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), berryMaterial);
        berry.position.set(Math.cos(i * 1.7 + index) * 0.48, 0.28 + (i % 2) * 0.18, Math.sin(i * 1.7) * 0.38);
        berry.castShadow = true;
        bush.add(berry);
      }
      attachWorldLabel(bush, "bush", 1.22);
      harvestables.push(bush);
      targetScene.add(bush);
    });
  }

  function createPickups(targetScene: THREE.Scene) {
    const stickMaterial = new THREE.MeshStandardMaterial({ color: 0x85552f, roughness: 0.92 });
    const pebbleMaterial = new THREE.MeshStandardMaterial({ color: 0xa0a7a8, roughness: 0.9 });
    const crateMaterial = new THREE.MeshStandardMaterial({ color: 0x8a5730, roughness: 0.86 });

    [
      [-2.8, -3.8, "stick"],
      [-4.4, 2.6, "stick"],
      [1.4, -5.8, "stick"],
      [2.9, -2.6, "pebble"],
      [-6.3, -1.2, "pebble"],
      [4.6, 2.4, "pebble"],
    ].forEach(([x, z, kind], index) => {
      const pickup = new THREE.Group();
      pickup.position.set(Number(x), 0.16, Number(z));
      pickup.userData.harvest = kind;
      pickup.userData.pickup = true;
      pickup.userData.baseScale = pickup.scale.clone();
      if (kind === "stick") {
        const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 0.82, 7), stickMaterial);
        stick.rotation.set(Math.PI * 0.5, index * 0.9, Math.PI * 0.18);
        stick.castShadow = true;
        pickup.add(stick);
      } else {
        const pebble = new THREE.Mesh(new THREE.DodecahedronGeometry(0.19), pebbleMaterial);
        pebble.rotation.set(index, index * 0.42, 0.1);
        pebble.castShadow = true;
        pickup.add(pebble);
      }
      attachWorldLabel(pickup, kind as HarvestKind, 0.78);
      harvestables.push(pickup);
      targetScene.add(pickup);
    });

    const crate = new THREE.Group();
    crate.position.set(-6.5, 0.32, 4.2);
    crate.userData.harvest = "crate";
    crate.userData.pickup = true;
    crate.userData.baseScale = crate.scale.clone();
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.55, 0.75), crateMaterial);
    box.castShadow = true;
    box.receiveShadow = true;
    crate.add(box);
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.08, 0.12), blockMaterials.stone);
    strap.position.y = 0.3;
    strap.castShadow = true;
    crate.add(strap);
    attachWorldLabel(crate, "crate", 0.92);
    harvestables.push(crate);
    targetScene.add(crate);
  }

  function createCampDetails(targetScene: THREE.Scene) {
    const wood = new THREE.MeshStandardMaterial({ color: 0x8a5730, roughness: 0.86 });
    const rope = new THREE.MeshStandardMaterial({ color: 0xdac381, roughness: 0.82 });
    const cloth = new THREE.MeshStandardMaterial({ color: 0xd46a66, roughness: 0.72 });

    for (const [x, z, rotation] of [
      [-3.8, 3.55, 0.22],
      [-3.05, 3.38, 0.18],
      [-2.3, 3.22, 0.12],
      [2.65, 4.08, -0.18],
      [3.35, 3.86, -0.24],
      [4.05, 3.56, -0.3],
    ] as Array<[number, number, number]>) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.88, 7), wood);
      post.position.set(x, 0.44, z);
      post.rotation.z = rotation;
      post.castShadow = true;
      targetScene.add(post);
    }

    for (const [x, z, width, rotation] of [
      [-3.05, 3.42, 1.5, 0.18],
      [3.36, 3.82, 1.5, -0.24],
    ] as Array<[number, number, number, number]>) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(width, 0.07, 0.08), rope);
      rail.position.set(x, 0.72, z);
      rail.rotation.y = rotation;
      rail.castShadow = true;
      targetScene.add(rail);
    }

    for (let i = 0; i < 5; i += 1) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.86, 8), wood);
      log.position.set(1.72 + (i % 2) * 0.16, 0.18 + Math.floor(i / 2) * 0.18, 4.95 + i * 0.09);
      log.rotation.set(Math.PI * 0.5, 0.2 + i * 0.34, Math.PI * 0.52);
      log.castShadow = true;
      targetScene.add(log);
    }

    const clothesLine = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.035, 0.035), rope);
    clothesLine.position.set(4.4, 1.28, -1.65);
    clothesLine.rotation.y = -0.42;
    targetScene.add(clothesLine);
    for (const offset of [-0.48, 0.16, 0.58]) {
      const rag = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.035), cloth);
      rag.position.set(4.4 + offset, 1.02, -1.65 - offset * 0.32);
      rag.rotation.y = -0.42;
      rag.castShadow = true;
      targetScene.add(rag);
    }

    const sign = new THREE.Group();
    sign.position.set(-3.85, 0, 1.15);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.9, 7), wood);
    pole.position.y = 0.45;
    sign.add(pole);
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.32, 0.08), wood);
    board.position.set(0.28, 0.82, 0);
    board.castShadow = true;
    sign.add(board);
    attachWorldLabel(sign, "crate", 1.35);
    targetScene.add(sign);
  }

  function createWolf() {
    const wolfGroup = new THREE.Group();
    const fur = new THREE.MeshStandardMaterial({ color: 0x38434b, roughness: 0.78 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x182027, roughness: 0.86 });
    const eye = new THREE.MeshBasicMaterial({ color: 0xffdf77 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.48, 0.42), fur);
    body.position.y = 0.55;
    body.castShadow = true;
    wolfGroup.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.32), fur);
    head.position.set(0.62, 0.72, 0);
    head.castShadow = true;
    wolfGroup.add(head);
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.16, 0.2), dark);
    snout.position.set(0.9, 0.68, 0);
    wolfGroup.add(snout);
    for (const z of [-0.09, 0.09]) {
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), eye);
      glow.position.set(0.78, 0.76, z);
      wolfGroup.add(glow);
    }
    for (const x of [-0.32, 0.32]) {
      for (const z of [-0.16, 0.16]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.45, 0.13), dark);
        leg.position.set(x, 0.24, z);
        leg.castShadow = true;
        wolfGroup.add(leg);
      }
    }
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.6, 7), fur);
    tail.position.set(-0.58, 0.72, 0);
    tail.rotation.z = Math.PI * 0.62;
    tail.castShadow = true;
    wolfGroup.add(tail);
    wolfGroup.position.set(-8, 0, -8);
    wolfGroup.visible = true;
    return wolfGroup;
  }

  function createWolfTrail() {
    const group = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({
      color: 0x9ed8ff,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    });
    for (let i = 0; i < 16; i += 1) {
      const print = new THREE.Mesh(new THREE.CircleGeometry(0.13, 10), material.clone());
      print.rotation.x = -Math.PI * 0.5;
      print.scale.set(1.2, 0.54, 1);
      print.userData.trailIndex = i;
      group.add(print);
    }
    group.visible = false;
    return group;
  }

  function createWeatherRig() {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: 0x9ed8ff,
      emissive: 0x244a5f,
      emissiveIntensity: 0.35,
      roughness: 0.28,
      transparent: true,
      opacity: 0.62,
    });
    for (let i = 0; i < 72; i += 1) {
      const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.012, 0.82, 5), material.clone());
      const seed = i * 37.7;
      drop.userData.seed = seed;
      drop.position.set(Math.sin(seed) * 9, 5 - (i % 12) * 0.45, Math.cos(seed * 1.7) * 9);
      drop.rotation.set(0.24, 0, -0.22);
      group.add(drop);
    }
    group.visible = false;
    return group;
  }

  function createFireflies() {
    const group = new THREE.Group();
    for (let i = 0; i < 34; i += 1) {
      const seed = i * 19.37;
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.045 + (i % 3) * 0.012, 8, 6),
        new THREE.MeshBasicMaterial({ color: i % 4 === 0 ? 0xa8ebff : 0xffef8a, transparent: true, opacity: 0.58, depthWrite: false }),
      );
      const radius = 2.5 + (i % 9) * 0.72;
      glow.userData.seed = seed;
      glow.userData.baseX = Math.cos(seed) * radius;
      glow.userData.baseZ = 2.2 + Math.sin(seed * 1.3) * radius;
      glow.position.set(glow.userData.baseX, 0.9 + (i % 5) * 0.28, glow.userData.baseZ);
      group.add(glow);
    }
    return group;
  }

  function createMapMarkers() {
    const group = new THREE.Group();
    const markerData = [
      { x: -8, z: 2.8, color: 0x1f252a, glow: 0x8aa0af },
      { x: 6.8, z: -3.8, color: 0xc07a54, glow: 0xffad7d },
      { x: 3.5, z: 3.2, color: 0xd93f53, glow: 0xff8a9b },
      { x: -6.6, z: -5.3, color: 0x9ed8ff, glow: 0xa8ebff },
    ];
    for (const marker of markerData) {
      const flag = new THREE.Group();
      flag.position.set(marker.x, 0.02, marker.z);
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.045, 1.15, 7),
        new THREE.MeshStandardMaterial({ color: 0xf0d18b, roughness: 0.64 }),
      );
      pole.position.y = 0.58;
      pole.castShadow = true;
      flag.add(pole);

      const banner = new THREE.Mesh(
        new THREE.BoxGeometry(0.54, 0.34, 0.05),
        new THREE.MeshStandardMaterial({ color: marker.color, emissive: marker.glow, emissiveIntensity: 0.18, roughness: 0.5 }),
      );
      banner.position.set(0.28, 1.02, 0);
      banner.castShadow = true;
      flag.add(banner);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.46, 0.018, 6, 24),
        new THREE.MeshBasicMaterial({ color: marker.glow, transparent: true, opacity: 0.64 }),
      );
      ring.rotation.x = Math.PI * 0.5;
      ring.position.y = 0.05;
      flag.add(ring);
      group.add(flag);
    }
    group.visible = false;
    return group;
  }

  function createBlueprintMarkers() {
    const group = new THREE.Group();
    const seen = new Set<string>();
    for (const kind of BLOCK_KEYS) {
      for (const [x, z] of AUTO_BUILD_PLAN[kind]) {
        const key = `${x},${z}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const material = new THREE.MeshBasicMaterial({
          color: MATERIALS[kind].color,
          transparent: true,
          opacity: 0.18,
          depthWrite: false,
        });
        const marker = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.04, 0.92), material);
        marker.position.set(x, 0.075, z);
        marker.userData.kind = kind;
        group.add(marker);
        blueprintMarkerViews.push({ kind, key, mesh: marker });
      }
    }
    return group;
  }

  function updateBlueprintMarkers() {
    blueprintMarkers.visible = blueprintMode && !introVisible;
    let visible = 0;
    for (const view of blueprintMarkerViews) {
      const occupied = blocks.has(view.key);
      view.mesh.visible = blueprintMode && !introVisible && !occupied;
      if (view.mesh.visible) visible += 1;
      const material = view.mesh.material;
      if (material instanceof THREE.MeshBasicMaterial) {
        material.opacity = occupied ? 0.04 : 0.18;
      }
    }
    return visible;
  }

  function createEventBeacon() {
    const group = new THREE.Group();
    group.visible = false;
    return group;
  }

  function createGuideTrail() {
    const group = new THREE.Group();
    for (let i = 0; i < 9; i += 1) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.72, depthWrite: false }),
      );
      dot.userData.guideDot = true;
      dot.userData.dotIndex = i;
      group.add(dot);
    }
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.028, 8, 36),
      new THREE.MeshBasicMaterial({ color: 0xffd560, transparent: true, opacity: 0.86, depthWrite: false }),
    );
    ring.rotation.x = Math.PI * 0.5;
    ring.userData.guideRing = true;
    group.add(ring);

    const label = createLabelSprite("下步", 0xffd560);
    label.userData.guideLabel = true;
    group.add(label);
    return group;
  }

  function createNearbyMarker() {
    const group = new THREE.Group();
    group.visible = false;

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.035, 8, 42),
      new THREE.MeshBasicMaterial({ color: 0xffd560, transparent: true, opacity: 0.88, depthWrite: false }),
    );
    ring.rotation.x = Math.PI * 0.5;
    ring.userData.nearbyRing = true;
    group.add(ring);

    const outer = new THREE.Mesh(
      new THREE.TorusGeometry(1.02, 0.018, 8, 42),
      new THREE.MeshBasicMaterial({ color: 0x9dffb1, transparent: true, opacity: 0.44, depthWrite: false }),
    );
    outer.rotation.x = Math.PI * 0.5;
    outer.userData.nearbyOuter = true;
    group.add(outer);

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.46, 1.85, 10, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffd560, transparent: true, opacity: 0.16, depthWrite: false }),
    );
    beam.position.y = 0.94;
    beam.userData.nearbyBeam = true;
    group.add(beam);

    const label = createLabelSprite("E", 0xffd560);
    label.position.y = 1.9;
    label.scale.set(1.15, 0.44, 1);
    label.userData.nearbyLabel = true;
    group.add(label);

    return group;
  }

  function createLabelSprite(text: string, color: number) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 96;
    const context = canvas.getContext("2d");
    if (context) {
      const cssColor = `#${color.toString(16).padStart(6, "0")}`;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgba(6, 18, 22, 0.78)";
      context.strokeStyle = cssColor;
      context.lineWidth = 4;
      context.beginPath();
      context.roundRect(10, 16, 236, 58, 12);
      context.fill();
      context.stroke();
      context.fillStyle = "#f5fbff";
      context.font = "900 34px system-ui, -apple-system, Segoe UI, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(text, 128, 45);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
    sprite.scale.set(2.8, 1.05, 1);
    return sprite;
  }

  function createPopupSprite(text: string, color: number) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 86;
    const context = canvas.getContext("2d");
    if (context) {
      const cssColor = `#${color.toString(16).padStart(6, "0")}`;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgba(5, 17, 18, 0.72)";
      context.strokeStyle = cssColor;
      context.lineWidth = 4;
      context.beginPath();
      context.roundRect(12, 12, 232, 54, 12);
      context.fill();
      context.stroke();
      context.fillStyle = "#f8fff1";
      context.font = "900 28px system-ui, -apple-system, Segoe UI, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(text, 128, 39, 210);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.75, 0.6, 1);
    return sprite;
  }

  function createWorldLabelSprite(text: string, color: number) {
    const canvas = document.createElement("canvas");
    canvas.width = 192;
    canvas.height = 72;
    const context = canvas.getContext("2d");
    if (context) {
      const cssColor = `#${color.toString(16).padStart(6, "0")}`;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgba(8, 22, 18, 0.66)";
      context.strokeStyle = cssColor;
      context.lineWidth = 3;
      context.beginPath();
      context.roundRect(12, 14, 168, 44, 10);
      context.fill();
      context.stroke();
      context.fillStyle = "#f7fff4";
      context.font = "900 26px system-ui, -apple-system, Segoe UI, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(text, 96, 36);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
    sprite.scale.set(1.02, 0.38, 1);
    return sprite;
  }

  function attachWorldLabel(parent: THREE.Object3D, kind: HarvestKind, y: number) {
    const label = createWorldLabelSprite(HARVEST_LABELS[kind], HARVEST_COLORS[kind]);
    label.position.set(0, y, 0);
    label.userData.baseY = y;
    label.userData.labelOffset = landmarkLabels.length * 0.47;
    parent.add(label);
    landmarkLabels.push(label);
  }

  function renderCampEvent(kind: CampEventKind) {
    const meta = CAMP_EVENT_DEFS[kind];
    eventBeacon.clear();
    eventBeacon.visible = true;
    eventBeacon.position.set(meta.position[0], 0.08, meta.position[1]);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.82, 0.035, 8, 42),
      new THREE.MeshBasicMaterial({ color: meta.glow, transparent: true, opacity: 0.78 }),
    );
    ring.rotation.x = Math.PI * 0.5;
    ring.userData.pulse = true;
    eventBeacon.add(ring);

    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.18, 0.018, 8, 42),
      new THREE.MeshBasicMaterial({ color: meta.color, transparent: true, opacity: 0.42 }),
    );
    outerRing.rotation.x = Math.PI * 0.5;
    outerRing.userData.spin = true;
    eventBeacon.add(outerRing);

    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.42, 1.85, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: meta.color, transparent: true, opacity: 0.18, depthWrite: false }),
    );
    pillar.position.y = 0.95;
    eventBeacon.add(pillar);

    const icon = new THREE.Mesh(
      kind === "coldFront" ? new THREE.OctahedronGeometry(0.32, 0) : new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: meta.color, emissive: meta.glow, emissiveIntensity: 0.55, roughness: 0.44 }),
    );
    icon.position.y = 0.76;
    icon.rotation.set(0.3, 0.2, 0.1);
    icon.castShadow = true;
    icon.userData.float = true;
    eventBeacon.add(icon);

    const label = createLabelSprite(meta.title, meta.color);
    label.position.set(0, 2.05, 0);
    eventBeacon.add(label);
  }

  function updateCampEventVisual(now: number) {
    if (!eventBeacon.visible) return;
    for (const child of eventBeacon.children) {
      if (child.userData.spin) child.rotation.z = now * 0.0011;
      if (child.userData.pulse) {
        const pulse = 1 + Math.sin(now * 0.004) * 0.08;
        child.scale.set(pulse, pulse, pulse);
      }
      if (child.userData.float) {
        child.position.y = 0.76 + Math.sin(now * 0.003) * 0.08;
        child.rotation.y += 0.012;
      }
    }
  }

  function updateWorldLabels(now: number) {
    for (const label of landmarkLabels) {
      label.visible = !introVisible;
      const baseY = Number(label.userData.baseY ?? label.position.y);
      const offset = Number(label.userData.labelOffset ?? 0);
      label.position.y = baseY + Math.sin(now * 0.0022 + offset) * 0.04;
    }
  }

  function updateGuideTrail(now: number) {
    const guide = getGuideTarget();
    const distance = Math.hypot(guide.x - target.x, guide.z - target.z);
    guideTrail.visible = !introVisible && distance > 0.8;
    const dotCount = Math.min(9, Math.max(3, Math.round(distance)));
    for (const child of guideTrail.children) {
      if (child.userData.guideDot) {
        const index = Number(child.userData.dotIndex ?? 0);
        const progress = (index + 1) / (dotCount + 1);
        child.visible = !introVisible && index < dotCount;
        child.position.set(
          THREE.MathUtils.lerp(target.x, guide.x, progress),
          0.12 + Math.sin(now * 0.006 + index * 0.7) * 0.045,
          THREE.MathUtils.lerp(target.z, guide.z, progress),
        );
        const material = child instanceof THREE.Mesh ? child.material : null;
        if (material instanceof THREE.MeshBasicMaterial) {
          material.color.setHex(guide.color);
          material.opacity = 0.32 + progress * 0.5;
        }
      } else if (child.userData.guideRing) {
        child.visible = !introVisible;
        child.position.set(guide.x, 0.09, guide.z);
        const pulse = 1 + Math.sin(now * 0.005) * 0.08;
        child.scale.set(pulse, pulse, pulse);
        const material = child instanceof THREE.Mesh ? child.material : null;
        if (material instanceof THREE.MeshBasicMaterial) {
          material.color.setHex(guide.color);
          material.opacity = 0.68 + Math.sin(now * 0.004) * 0.16;
        }
      } else if (child.userData.guideLabel) {
        child.visible = !introVisible && distance > 1.2;
        child.position.set(guide.x, 2.15 + Math.sin(now * 0.0024) * 0.06, guide.z);
      }
    }
  }

  function updateNearbyMarker(now: number) {
    const nearby = getNearbyHarvestable(3.2);
    nearbyMarker.visible = !introVisible && Boolean(nearby);
    if (!nearby) return;

    const position = new THREE.Vector3();
    nearby.object.getWorldPosition(position);
    nearbyMarker.position.set(position.x, 0.1, position.z);
    nearbyMarker.scale.setScalar(nearby.distance <= 2.35 ? 1 : 0.78);

    const color = HARVEST_COLORS[nearby.kind];
    for (const child of nearbyMarker.children) {
      if (child.userData.nearbyRing || child.userData.nearbyOuter || child.userData.nearbyBeam) {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
          child.material.color.setHex(color);
          child.material.opacity =
            child.userData.nearbyBeam ? 0.12 + Math.sin(now * 0.006) * 0.035 :
            child.userData.nearbyOuter ? 0.34 + Math.sin(now * 0.005) * 0.08 :
            0.72 + Math.sin(now * 0.007) * 0.12;
        }
      }
      if (child.userData.nearbyRing || child.userData.nearbyOuter) {
        const pulse = 1 + Math.sin(now * 0.006 + Number(child.userData.nearbyOuter ? 1.2 : 0)) * 0.08;
        child.scale.set(pulse, pulse, pulse);
      }
      if (child.userData.nearbyLabel) {
        child.position.y = 1.72 + Math.sin(now * 0.004) * 0.08;
      }
    }
  }

  function updateWolfTrail(now: number) {
    const pressureVisible = stats.isNight || activeEvent === "wolfTracks" || stats.wolfPressure > Math.max(8, stats.armor * 0.5);
    wolfTrail.visible = !introVisible && pressureVisible;
    if (!wolfTrail.visible) return;

    const fromX = activeEvent === "wolfTracks" ? CAMP_EVENT_DEFS.wolfTracks.position[0] : wolf.position.x;
    const fromZ = activeEvent === "wolfTracks" ? CAMP_EVENT_DEFS.wolfTracks.position[1] : wolf.position.z;
    const dx = target.x - fromX;
    const dz = target.z - fromZ;
    const length = Math.max(0.001, Math.hypot(dx, dz));
    const sideX = -dz / length;
    const sideZ = dx / length;
    const angle = Math.atan2(dz, dx);
    const pressure = THREE.MathUtils.clamp((stats.wolfPressure + (activeEvent === "wolfTracks" ? 24 : 0)) / 100, 0.18, 1);

    for (const child of wolfTrail.children) {
      if (!(child instanceof THREE.Mesh)) continue;
      const index = Number(child.userData.trailIndex ?? 0);
      const progress = (index + 1) / (wolfTrail.children.length + 1);
      const stagger = index % 2 === 0 ? -1 : 1;
      child.position.set(
        THREE.MathUtils.lerp(fromX, target.x, progress) + sideX * stagger * 0.18,
        0.035,
        THREE.MathUtils.lerp(fromZ, target.z, progress) + sideZ * stagger * 0.18,
      );
      child.rotation.set(-Math.PI * 0.5, 0, -angle + stagger * 0.18);
      child.visible = progress > 0.08 && progress < 0.94;
      const material = child.material;
      if (material instanceof THREE.MeshBasicMaterial) {
        material.color.setHex(activeEvent === "wolfTracks" ? 0xbddcff : 0x6f8796);
        material.opacity = THREE.MathUtils.clamp(0.1 + pressure * 0.44 - progress * 0.16 + Math.sin(now * 0.004 + index) * 0.04, 0.08, 0.58);
      }
    }
  }

  function updateHarvestPopups(now: number) {
    for (let i = harvestPopups.length - 1; i >= 0; i -= 1) {
      const popup = harvestPopups[i];
      const progress = (now - popup.bornAt) / popup.ttl;
      if (progress >= 1) {
        scene.remove(popup.sprite);
        const material = popup.sprite.material;
        if (material instanceof THREE.SpriteMaterial) {
          material.map?.dispose();
          material.dispose();
        }
        harvestPopups.splice(i, 1);
        continue;
      }
      popup.sprite.position.y = popup.baseY + progress * 0.72;
      popup.sprite.scale.setScalar(1 + progress * 0.18);
      const material = popup.sprite.material;
      if (material instanceof THREE.SpriteMaterial) {
        material.opacity = THREE.MathUtils.clamp(1 - progress, 0, 1);
      }
    }
  }

  function getShelterAuraTone() {
    if (weather === "coldSnap" || stats.cold >= 46) return "寒冷";
    if (stats.wolfPressure > stats.armor || (activeEvent === "wolfTracks" && stats.wolfPressure >= 36)) return "狼压";
    if (computeShelterGrade() === "危险") return "破屋";
    if (computeShelterGrade() === "安稳") return "安稳";
    return "可住";
  }

  function updateShelterAura(now: number) {
    shelterAura.visible = !introVisible;
    if (!shelterAura.visible) return;
    const tone = getShelterAuraTone();
    const color =
      tone === "狼压" ? 0x9ed8ff :
      tone === "寒冷" ? 0xc8f5ff :
      tone === "破屋" ? 0xff9273 :
      tone === "安稳" ? 0x7be495 :
      0xffd560;
    const urgency =
      tone === "狼压" ? THREE.MathUtils.clamp(stats.wolfPressure / 100, 0.28, 0.86) :
      tone === "寒冷" ? THREE.MathUtils.clamp(stats.cold / 100, 0.24, 0.78) :
      tone === "破屋" ? 0.58 :
      0.32;

    for (const child of shelterAura.children) {
      if (!(child instanceof THREE.Mesh)) continue;
      const index = Number(child.userData.auraIndex ?? 0);
      const pulse = 1 + Math.sin(now * (0.0018 + index * 0.00045) + index) * (0.035 + urgency * 0.045);
      child.scale.set(pulse, pulse, pulse);
      const material = child.material;
      if (material instanceof THREE.MeshBasicMaterial) {
        material.color.setHex(color);
        material.opacity = THREE.MathUtils.clamp(0.08 + urgency * 0.2 - index * 0.025 + Math.sin(now * 0.002 + index) * 0.025, 0.06, 0.34);
      }
    }
  }

  function triggerToolSwing(type: HarvestKind, sourceObject?: THREE.Object3D | null) {
    if (introVisible) return;
    const source = sourceObject ?? findHarvestableByKind(type);
    const position = new THREE.Vector3();
    if (source) source.getWorldPosition(position);
    else position.set(target.x + 0.8, 0.2, target.z - 0.6);
    const angle = Math.atan2(position.x - target.x, position.z - target.z);
    toolSwing.position.set(
      target.x + Math.sin(angle) * 0.46,
      0.1,
      target.z + Math.cos(angle) * 0.46,
    );
    toolSwing.rotation.set(0, angle, 0);
    toolSwing.visible = true;
    toolSwingUntil = performance.now() + 420;
    handRigSwingUntil = toolSwingUntil;
    toolSwingCount += 1;
    lastToolSwing = `${HARVEST_LABELS[type]}挥动 ${toolSwingCount}`;
    handRigMotion = lastToolSwing;
    for (const child of toolSwing.children) {
      if (!(child instanceof THREE.Mesh)) continue;
      const material = child.material;
      if (material instanceof THREE.MeshBasicMaterial) {
        material.color.setHex(HARVEST_COLORS[type]);
        material.opacity = 0.88;
      }
    }
  }

  function updateToolSwing(now: number) {
    if (!toolSwing.visible) return;
    const remaining = Math.max(0, toolSwingUntil - now);
    const progress = 1 - remaining / 420;
    if (remaining <= 0) {
      toolSwing.visible = false;
      return;
    }
    toolSwing.scale.setScalar(0.82 + progress * 0.62);
    toolSwing.rotation.z = -0.45 + progress * 1.15;
    for (const child of toolSwing.children) {
      if (!(child instanceof THREE.Mesh)) continue;
      const index = Number(child.userData.swingIndex ?? 0);
      child.position.x = 0.18 + index * 0.1 + progress * 0.18;
      const material = child.material;
      if (material instanceof THREE.MeshBasicMaterial) {
        material.opacity = THREE.MathUtils.clamp(0.92 - progress * 0.84 - index * 0.06, 0.06, 0.92);
      }
    }
  }

  function getHandToolForHarvest(type: HarvestKind) {
    if (type === "tree") return crafted.axe ? TOOL_LABELS.axe : "徒手劈木";
    if (type === "stone" || type === "coal" || type === "iron") return crafted.pickaxe ? TOOL_LABELS.pickaxe : "徒手敲石";
    if (type === "deer" || type === "boar" || type === "wolf" || type === "zombie") return crafted.bow ? TOOL_LABELS.bow : "短矛";
    if (type === "crate") return "撬棍";
    return "徒手拾取";
  }

  function updateHandRig(now: number) {
    handRig.visible = !introVisible;
    if (!handRig.visible) return;
    const nearby = getNearbyHarvestable(2.6);
    const tool = nearby ? getHandToolForHarvest(nearby.kind) : MATERIALS[selected].name;
    const swingProgress = Math.max(0, Math.min(1, (handRigSwingUntil - now) / 420));
    const bob = Math.sin(now * 0.0032) * 0.018;
    handRig.position.set(0.82, -0.68 + bob - swingProgress * 0.08, -1.28 + swingProgress * 0.18);
    handRig.rotation.set(-0.32 - swingProgress * 0.55, -0.42 + swingProgress * 0.24, 0.12 + swingProgress * 0.42);
    handRigTool = tool;
    if (swingProgress <= 0 && handRigMotion !== "待命") handRigMotion = "待命";

    for (const child of handRig.children) {
      if (!(child instanceof THREE.Mesh)) continue;
      const part = child.userData.handPart;
      const isTool = Boolean(nearby);
      child.visible =
        part === "sleeve" ||
        part === "hand" ||
        (part === "build" && !isTool) ||
        ((part === "handle" || part === "tool") && isTool) ||
        (part === "ember" && (tool === TOOL_LABELS.bow || selected === "lamp"));
      if (part === "build") {
        child.material = blockMaterials[selected];
        child.scale.setScalar(canAfford(selected) ? 1 : 0.72);
      }
      if (part === "tool" && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.color.setHex(nearby ? HARVEST_COLORS[nearby.kind] : 0xd8e1e6);
        child.scale.set(tool === TOOL_LABELS.pickaxe ? 0.82 : tool === TOOL_LABELS.bow ? 0.42 : 1, tool === TOOL_LABELS.bow ? 2.6 : 1, 1);
      }
    }
  }

  function updateSurvivalVignette() {
    const danger = THREE.MathUtils.clamp((stats.wolfPressure - stats.armor + 18) / 82, 0, 0.28);
    const cold = THREE.MathUtils.clamp((stats.cold - 34) / 58, 0, 0.22);
    const hunger = THREE.MathUtils.clamp((42 - stats.hunger) / 42, 0, 0.18);
    root.style.setProperty("--cabin-danger-alpha", danger.toFixed(3));
    root.style.setProperty("--cabin-cold-alpha", cold.toFixed(3));
    root.style.setProperty("--cabin-hunger-alpha", hunger.toFixed(3));
    survivalVignette =
      danger > 0.18 ? "狼压逼近" :
      cold > 0.14 ? "寒意压屏" :
      hunger > 0.12 ? "饥饿发暗" :
      "平稳";
  }

  function createProjectGroup(kind: ProjectKind) {
    const group = new THREE.Group();
    if (kind === "rainBarrel") {
      group.position.set(1.85, 0.04, 4.62);
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.42, 0.72, 12),
        new THREE.MeshStandardMaterial({ color: 0x6a4326, roughness: 0.82 }),
      );
      barrel.position.y = 0.36;
      barrel.castShadow = true;
      barrel.receiveShadow = true;
      group.add(barrel);
      const water = new THREE.Mesh(
        new THREE.CylinderGeometry(0.31, 0.31, 0.035, 12),
        new THREE.MeshStandardMaterial({ color: 0x9ddfff, roughness: 0.2, transparent: true, opacity: 0.74 }),
      );
      water.position.y = 0.74;
      group.add(water);
    } else if (kind === "trapline") {
      group.position.set(-4.2, 0.03, 3.15);
      const ropeMaterial = new THREE.MeshStandardMaterial({ color: 0xe6d38b, roughness: 0.76 });
      const stakeMaterial = new THREE.MeshStandardMaterial({ color: 0x7a4a2a, roughness: 0.86 });
      for (const x of [-0.45, 0.45]) {
        const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.64, 7), stakeMaterial);
        stake.position.set(x, 0.32, 0);
        stake.castShadow = true;
        group.add(stake);
      }
      const rope = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.055, 0.055), ropeMaterial);
      rope.position.y = 0.48;
      group.add(rope);
      const snare = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.018, 6, 18), ropeMaterial);
      snare.rotation.x = Math.PI * 0.5;
      snare.position.set(0, 0.08, 0.18);
      group.add(snare);
    } else {
      group.position.set(-2.8, 0.04, 2.4);
      const wood = new THREE.MeshStandardMaterial({ color: 0x8a5730, roughness: 0.82 });
      for (const x of [-0.25, 0.25]) {
        for (const z of [-0.25, 0.25]) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 1.35, 7), wood);
          leg.position.set(x, 0.68, z);
          leg.castShadow = true;
          group.add(leg);
        }
      }
      const deck = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.1, 0.82), wood);
      deck.position.y = 1.24;
      deck.castShadow = true;
      group.add(deck);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), blockMaterials.lamp);
      lamp.position.y = 1.5;
      group.add(lamp);
      const glow = new THREE.PointLight(0xffc66d, 1.2, 5);
      glow.position.y = 1.48;
      group.add(glow);
    }
    return group;
  }

  function createCampfire() {
    const fireGroup = new THREE.Group();
    fireGroup.position.set(-0.8, 0.08, 4.9);
    fireGroup.visible = false;
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x744625, roughness: 0.88 });
    const coalMaterial = new THREE.MeshStandardMaterial({ color: 0x232323, roughness: 0.92 });
    const flameMaterial = new THREE.MeshStandardMaterial({ color: 0xff9d37, emissive: 0xff6d1f, emissiveIntensity: 1.25, roughness: 0.42 });

    for (let i = 0; i < 3; i += 1) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.85, 8), woodMaterial);
      log.position.y = 0.12;
      log.rotation.set(Math.PI * 0.5, i * 1.05, Math.PI * 0.5);
      log.castShadow = true;
      fireGroup.add(log);
    }
    const coal = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.44, 0.12, 12), coalMaterial);
    coal.position.y = 0.08;
    coal.receiveShadow = true;
    fireGroup.add(coal);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.7, 8), flameMaterial);
    flame.position.y = 0.54;
    flame.castShadow = true;
    fireGroup.add(flame);
    const glow = new THREE.PointLight(0xff8b3d, 2.5, 7);
    glow.position.set(0, 0.7, 0);
    fireGroup.add(glow);
    return fireGroup;
  }

  function createShelterAura() {
    const group = new THREE.Group();
    group.position.set(0, 0.1, 1);
    for (let i = 0; i < 3; i += 1) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.1 + i * 0.72, 0.024, 8, 72),
        new THREE.MeshBasicMaterial({ color: 0x7be495, transparent: true, opacity: 0.16, depthWrite: false }),
      );
      ring.rotation.x = Math.PI * 0.5;
      ring.userData.auraIndex = i;
      group.add(ring);
    }
    group.visible = false;
    return group;
  }

  function createToolSwing() {
    const group = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({ color: 0xffd560, transparent: true, opacity: 0.85, depthWrite: false });
    for (let i = 0; i < 3; i += 1) {
      const slash = new THREE.Mesh(new THREE.BoxGeometry(0.78 - i * 0.12, 0.045, 0.045), material.clone());
      slash.position.set(0.18 + i * 0.1, 0.94 + i * 0.12, -0.18 + i * 0.04);
      slash.rotation.set(0.12, 0, -0.68 + i * 0.22);
      slash.userData.swingIndex = i;
      group.add(slash);
    }
    group.visible = false;
    return group;
  }

  function createHandRig() {
    const group = new THREE.Group();
    group.position.set(0.82, -0.68, -1.28);
    group.rotation.set(-0.32, -0.42, 0.12);

    const sleeve = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.2, 0.58),
      new THREE.MeshStandardMaterial({ color: 0x315d78, roughness: 0.74 }),
    );
    sleeve.position.set(0, -0.02, 0.18);
    sleeve.rotation.x = -0.18;
    sleeve.userData.handPart = "sleeve";
    group.add(sleeve);

    const hand = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.16, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xe0aa73, roughness: 0.62 }),
    );
    hand.position.set(0, 0.02, -0.18);
    hand.userData.handPart = "hand";
    group.add(hand);

    const buildPreview = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), blockMaterials[selected]);
    buildPreview.position.set(0.02, 0.1, -0.42);
    buildPreview.rotation.set(0.34, 0.55, -0.18);
    buildPreview.userData.handPart = "build";
    group.add(buildPreview);

    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.035, 0.78, 7),
      new THREE.MeshStandardMaterial({ color: 0x7a4b2b, roughness: 0.86 }),
    );
    handle.position.set(0.03, 0.1, -0.42);
    handle.rotation.set(0.92, 0.12, -0.25);
    handle.visible = false;
    handle.userData.handPart = "handle";
    group.add(handle);

    const toolHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.14, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xd8e1e6, roughness: 0.7, metalness: 0.08 }),
    );
    toolHead.position.set(0.06, 0.32, -0.72);
    toolHead.rotation.set(0.48, 0.08, -0.32);
    toolHead.visible = false;
    toolHead.userData.handPart = "tool";
    group.add(toolHead);

    const ember = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xffd560, transparent: true, opacity: 0.88 }),
    );
    ember.position.set(0.06, 0.34, -0.74);
    ember.visible = false;
    ember.userData.handPart = "ember";
    group.add(ember);

    group.visible = false;
    return group;
  }

  function createPlayer() {
    const avatar = new THREE.Group();
    const coat = new THREE.MeshStandardMaterial({ color: 0x315d78, roughness: 0.74 });
    const skin = new THREE.MeshStandardMaterial({ color: 0xe0aa73, roughness: 0.62 });
    const pack = new THREE.MeshStandardMaterial({ color: 0x6b4f31, roughness: 0.9 });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.5, 6, 10), coat);
    body.position.y = 0.72;
    body.castShadow = true;
    avatar.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 10), skin);
    head.position.y = 1.22;
    head.castShadow = true;
    avatar.add(head);
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 0.12), pack);
    backpack.position.set(0, 0.78, 0.24);
    backpack.castShadow = true;
    avatar.add(backpack);
    const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.62, 7), pack);
    torch.position.set(0.28, 0.76, -0.08);
    torch.rotation.z = -0.35;
    torch.castShadow = true;
    avatar.add(torch);
    const ember = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), blockMaterials.lamp);
    ember.position.set(0.39, 1.08, -0.1);
    avatar.add(ember);
    heldPreview = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), blockMaterials[selected]);
    heldPreview.position.set(0.36, 0.86, -0.2);
    heldPreview.rotation.set(0.25, 0.45, -0.18);
    heldPreview.castShadow = true;
    avatar.add(heldPreview);
    return avatar;
  }

  function addStaticBlock(targetScene: THREE.Scene, x: number, y: number, z: number, material: THREE.Material) {
    const block = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
    block.position.set(x, y, z);
    block.castShadow = true;
    block.receiveShadow = true;
    targetScene.add(block);
  }

  function createHoverMarker() {
    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(1.04, 0.08, 1.04),
      new THREE.MeshBasicMaterial({ color: 0xffdf6e, transparent: true, opacity: 0.45 }),
    );
    marker.visible = false;
    return marker;
  }

  function createInventory() {
    BLOCK_KEYS.forEach((kind, index) => {
      const button = document.createElement("button");
      button.className = "cabin-slot";
      button.type = "button";
      button.dataset.kind = kind;
      button.title = costText(kind);
      button.innerHTML = `<span class="cabin-slot-key">${index + 1}</span><span class="cabin-swatch" style="background:#${MATERIALS[kind].color.toString(16).padStart(6, "0")}"></span><span>${MATERIALS[kind].name}</span><small>${costText(kind)}</small>`;
      button.addEventListener("click", () => {
        selected = kind;
        updateHud();
      });
      inventory.append(button);
    });
  }

  function costText(kind: BlockKind) {
    return costTextFrom(BUILD_COSTS[kind]);
  }

  function costTextFrom(cost: Partial<Record<ResourceKind, number>>) {
    return Object.entries(cost)
      .map(([resource, amount]) => `${RESOURCE_LABELS[resource as ResourceKind]} ${amount}`)
      .join(" / ");
  }

  function updateHud() {
    const blueprintGhosts = updateBlueprintMarkers();
    const guide = getGuideTarget();
    updateHeldPreview();
    syncIntro();
    renderMiniMap(guide);
    updateReticle(guide);
    updateCommandPanel();
    renderFocusPanel(guide);
    inventory.querySelectorAll<HTMLButtonElement>(".cabin-slot").forEach((button) => {
      const kind = button.dataset.kind as BlockKind;
      button.classList.toggle("active", kind === selected);
      button.disabled = !canAfford(kind);
    });

    const campScore = computeCampScore();
    hud.querySelector("[data-stat='blocks']")!.textContent =
      `营地 ${placedBlocks.length}  防护 ${stats.armor}  舒适 ${campScore}  小屋 ${computeShelterGrade()}  天气 ${WEATHER_LABELS[weather]}`;
    hud.querySelector("[data-tools]")!.innerHTML =
      (Object.keys(crafted) as ToolKind[])
        .filter((kind) => crafted[kind])
        .map((kind) => `<span><b>${TOOL_LABELS[kind]}</b> 已就绪</span>`)
        .join("") || "<span><b>工具</b> 徒手</span>";
    const alwaysVisible: ResourceKind[] = ["wood", "stone", "berry"];
    const visibleResources = RESOURCE_ORDER
      .filter((kind) => resources[kind] > 0 || alwaysVisible.includes(kind))
    const resourceSummary = visibleResources
      .slice(0, 10)
      .map((kind) => `<span><b>${RESOURCE_LABELS[kind]}</b> ${resources[kind]}</span>`);
    if (visibleResources.length > resourceSummary.length) {
      resourceSummary.push(`<span><b>余料</b> +${visibleResources.length - resourceSummary.length}</span>`);
    }
    hud.querySelector("[data-resources]")!.innerHTML = resourceSummary.join("");
    hud.querySelector("[data-map]")!.innerHTML = mapRevealed
      ? `<span>北坡煤</span><span>东岭铁</span><span>南湾浆果</span><span>夜狼径</span>`
      : `<span>地图未侦察</span>`;
    hud.querySelector("[data-shelter]")!.innerHTML = renderShelterPanel();
    const systemSummary = [
      `<span><b>管家</b> ${stewardMode ? "托管中" : "待命"}</span>`,
      `<span><b>自走</b> ${autopilotMode ? `${autopilotActions} 步` : "待命"}</span>`,
      `<span><b>蓝图</b> ${BLUEPRINT_LABELS[getBlueprintStage()]} ${blueprintPieces}</span>`,
      `<span><b>日程</b> ${routineActions > 0 ? `${routineActions} 轮` : "待命"}</span>`,
      `<span><b>背包</b> ${packReadyCount()} 个可做</span>`,
      `<span><b>维护</b> ${stewardActions}</span>`,
      `<span><b>补给</b> ${provisions}</span>`,
      `<span><b>安全</b> ${computeSecurityScore()}</span>`,
      ...Object.entries(projects)
        .filter(([, active]) => active)
        .map(([kind]) => `<span><b>${PROJECT_LABELS[kind as ProjectKind]}</b> 已建</span>`),
      ...Object.entries(expeditions)
        .filter(([, count]) => count > 0)
        .map(([kind, count]) => `<span><b>${EXPEDITION_LABELS[kind as ExpeditionKind]}</b> ${count}</span>`),
    ];
    const systemVisible = systemSummary.slice(0, 8);
    if (systemSummary.length > systemVisible.length) {
      systemVisible.push(`<span><b>更多</b> +${systemSummary.length - systemVisible.length}</span>`);
    }
    hud.querySelector("[data-systems]")!.innerHTML = systemVisible.join("");
    hud.querySelector("[data-plan]")!.textContent = `${getSafetyPlan()} · ${getDailyRoutinePlan()}`;
    const doneGoalIds = new Set(getDoneGoals().map((goal) => goal.id));
    const completedTail = GOALS.filter((goal) => doneGoalIds.has(goal.id)).slice(-2);
    const pendingHead = GOALS.filter((goal) => !doneGoalIds.has(goal.id)).slice(0, 3);
    const visibleGoals = pendingHead.length > 0 ? [...completedTail, ...pendingHead] : GOALS.slice(-4);
    hud.querySelector("[data-goals]")!.innerHTML = visibleGoals
      .map((goal) => {
        const done = goal.check(goalContext());
        return `<div class="${done ? "done" : ""}"><span>${done ? "✓" : "·"}</span><strong>${goal.title}</strong><small>${goal.description}</small></div>`;
      })
      .join("");
    hud.querySelector("[data-tip]")!.textContent = lastTip;
    hud.querySelector("[data-clock]")!.textContent = `第 ${stats.day} 天 ${formatClock(dayProgress)}${stats.isNight ? " 夜" : ""}`;
    handPanel.innerHTML = `
      <div class="cabin-hand-main">
        <span class="cabin-swatch" style="background:#${MATERIALS[selected].color.toString(16).padStart(6, "0")}"></span>
        <strong>手持 ${handRigTool}</strong>
        <small>${handRigTool === MATERIALS[selected].name ? costText(selected) : handRigMotion}</small>
      </div>
      <div class="cabin-hand-row">
        <span>${CAMP_EVENT_DEFS[activeEvent].title}</span>
        <span>${guide.title} ${guide.distance}m</span>
        <span>${getNearbyActionText()}</span>
      </div>
      <div class="cabin-hand-row cabin-hand-last">
        <span>${lastNearbyAction}</span>
        <span>就近 ${nearbyInteractions}</span>
        <span>${canAfford(selected) ? "可建造" : "缺材料"}</span>
      </div>
    `;
    setBar("health", stats.health);
    setBar("hunger", stats.hunger);
    setBar("cold", stats.cold);
    setBar("threat", stats.wolfPressure);
    const eatButton = hud.querySelector<HTMLButtonElement>("[data-eat]");
    if (eatButton) eatButton.disabled = resources.berry <= 0 || stats.hunger >= 100;
    const axeButton = hud.querySelector<HTMLButtonElement>("[data-craft-axe]");
    if (axeButton) {
      axeButton.disabled = crafted.axe || resources.stick < 2 || resources.stone < 2;
      axeButton.textContent = crafted.axe ? "石斧已备" : "制石斧";
    }
    const bowButton = hud.querySelector<HTMLButtonElement>("[data-craft-bow]");
    if (bowButton) {
      bowButton.disabled = crafted.bow || resources.stick < 2 || resources.leaf < 1;
      bowButton.textContent = crafted.bow ? "木弓已备" : "制木弓";
    }
    const campfireButton = hud.querySelector<HTMLButtonElement>("[data-craft-campfire]");
    if (campfireButton) {
      campfireButton.disabled = crafted.campfire || resources.wood < 3 || resources.stone < 2;
      campfireButton.textContent = crafted.campfire ? "篝火已燃" : "点篝火";
    }
    const cookButton = hud.querySelector<HTMLButtonElement>("[data-cook]");
    if (cookButton) cookButton.disabled = !crafted.campfire || resources.meat <= 0;
    const scoutButton = hud.querySelector<HTMLButtonElement>("[data-scout]");
    if (scoutButton) {
      scoutButton.disabled = mapRevealed && mapChecks > 1;
      scoutButton.textContent = mapRevealed ? "地图已绘" : "侦察";
    }
    const sleepButton = hud.querySelector<HTMLButtonElement>("[data-sleep]");
    if (sleepButton) sleepButton.disabled = placedCounts.bed < 1 || !stats.isNight;
    const stewardButton = hud.querySelector<HTMLButtonElement>("[data-steward]");
    if (stewardButton) stewardButton.textContent = stewardMode ? "托管中" : "托管";
    const autopilotButton = hud.querySelector<HTMLButtonElement>("[data-autopilot]");
    if (autopilotButton) {
      autopilotButton.textContent = autopilotMode ? `自走中 ${autopilotActions}` : "自走营地";
      autopilotButton.classList.toggle("active", autopilotMode);
    }
    const blueprintButton = hud.querySelector<HTMLButtonElement>("[data-blueprint]");
    if (blueprintButton) {
      blueprintButton.textContent = blueprintMode ? `蓝图 ${blueprintGhosts}` : "蓝图关";
      blueprintButton.classList.toggle("active", blueprintMode);
    }
    const packButton = hud.querySelector<HTMLButtonElement>("[data-pack]");
    if (packButton) {
      packButton.textContent = packOpen ? `背包 ${packReadyCount()}` : "背包";
      packButton.classList.toggle("active", packOpen);
    }
    const expeditionButton = hud.querySelector<HTMLButtonElement>("[data-expedition]");
    if (expeditionButton) expeditionButton.disabled = !mapRevealed || stats.health < 35;
    const smartButton = hud.querySelector<HTMLButtonElement>("[data-smart]");
    if (smartButton) smartButton.textContent = `执行任务：${getNextGoal()?.title ?? "巡逻"}`;
    renderPackPanel();
    saveCabinSnapshot(placedBlocks.length !== lastSavedBlocks);
  }

  function renderShelterPanel() {
    const rows = [
      { label: "干燥", value: shelter.dryness, tone: shelter.dryness < 50 ? "bad" : shelter.dryness > 72 ? "good" : "warn" },
      { label: "余温", value: shelter.warmth, tone: shelter.warmth < 50 ? "bad" : shelter.warmth > 72 ? "good" : "warn" },
      { label: "噪音", value: shelter.noise, tone: shelter.noise > 58 ? "bad" : shelter.noise < 30 ? "good" : "warn", invert: true },
      { label: "士气", value: shelter.morale, tone: shelter.morale < 54 ? "bad" : shelter.morale > 74 ? "good" : "warn" },
    ];
    return `
      <div class="cabin-shelter-head">
        <strong>屋况 ${computeShelterGrade()}</strong>
        <span>${getShelterFocus()}</span>
      </div>
      <div class="cabin-shelter-plan">${getShelterPlan()}</div>
      <div class="cabin-shelter-grid">
        ${rows
          .map(
            (row) => `
              <div class="cabin-shelter-row ${row.tone}">
                <span>${row.label}</span>
                <b style="--value:${Math.round(row.value)}%"></b>
                <em>${Math.round(row.value)}</em>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  }

  function renderPackPanel() {
    packPanel.hidden = !packOpen;
    if (!packOpen) return;
    const rows = PACK_RECIPES.map((recipe) => {
      const ready = canAffordCost(recipe.cost);
      return `<div class="${ready ? "ready" : ""}">
        <strong>${recipe.title}</strong>
        <span>${costTextFrom(recipe.cost)}</span>
        <small>${recipe.detail}</small>
      </div>`;
    }).join("");
    packPanel.innerHTML = `
      <div class="cabin-pack-head">
        <strong>背包 / 制作台</strong>
        <button type="button" data-pack-close>收起</button>
      </div>
      <div class="cabin-pack-summary">可做 ${packReadyCount()} · 已整理 ${packPrepared} · 补给 ${provisions}</div>
      <div class="cabin-pack-recipes">${rows}</div>
      <button type="button" data-pack-craft ${packReadyCount() <= 0 ? "disabled" : ""}>一键整理</button>
    `;
    packPanel.querySelector<HTMLButtonElement>("[data-pack-close]")?.addEventListener("click", () => togglePack(false));
    packPanel.querySelector<HTMLButtonElement>("[data-pack-craft]")?.addEventListener("click", () => preparePack());
  }

  function togglePack(force?: boolean) {
    packOpen = force ?? !packOpen;
    lastTip = packOpen ? "背包打开：可用材料会亮起，能一键整理成口粮、巡径包或保温包。" : "背包收起。";
    updateHud();
  }

  function packReadyCount() {
    return PACK_RECIPES.filter((recipe) => canAffordCost(recipe.cost)).length;
  }

  function preparePack(kind?: PackRecipeKind) {
    packActions += 1;
    packOpen = true;
    const recipe = kind
      ? PACK_RECIPES.find((item) => item.kind === kind && canAffordCost(item.cost))
      : PACK_RECIPES.find((item) => canAffordCost(item.cost));
    if (!recipe) {
      lastTip = "背包整理：材料不够，先采集、狩猎或远征。";
      updateHud();
      return;
    }
    spendCost(recipe.cost);
    applyPackRecipe(recipe.kind);
    packPrepared += 1;
    lastTip = `背包整理：做好${recipe.title}。${recipe.detail}`;
    updateHud();
  }

  function applyPackRecipe(kind: PackRecipeKind) {
    if (kind === "fieldMeal") {
      provisions += 2;
      stats.hunger = clampStat(stats.hunger + 18);
      stats.health = clampStat(stats.health + 4);
      shelter.morale = clampStat(shelter.morale + 5);
      return;
    }
    if (kind === "campKit") {
      provisions += 1;
      gain("lamp", 1);
      stats.cold = clampStat(stats.cold - 4);
      shelter.warmth = clampStat(shelter.warmth + 6);
      shelter.noise = clampStat(shelter.noise - 4);
      return;
    }
    if (kind === "trailKit") {
      provisions += 1;
      mapRevealed = true;
      mapMarkers.visible = true;
      stats.wolfPressure = clampStat(stats.wolfPressure - 10);
      shelter.noise = clampStat(shelter.noise - 8);
      return;
    }
    if (kind === "repairKit") {
      provisions += 1;
      stats.health = clampStat(stats.health + 10);
      stats.armor = Math.max(stats.armor, computeArmor());
      shelter.dryness = clampStat(shelter.dryness + 10);
      return;
    }
    provisions += 1;
    stats.cold = clampStat(stats.cold - 18);
    shelter.warmth = clampStat(shelter.warmth + 12);
  }

  function getCommandRisk() {
    if (weather === "coldSnap" || stats.cold >= 56) return "寒冷";
    if (stats.isNight || stats.wolfPressure >= stats.armor) return "狼踪";
    if (stats.hunger <= 45) return "饥饿";
    if (computeShelterGrade() === "危险") return "屋况";
    if (!mapRevealed) return "迷路";
    if (computeSecurityScore() < 86) return "防线";
    return "扩建";
  }

  function getRecommendedCommand(): CabinCommandKind {
    const risk = getCommandRisk();
    if (
      routineMode &&
      (stats.hunger <= 54 ||
        stats.cold >= 48 ||
        stats.isNight ||
        stats.wolfPressure >= stats.armor ||
        Boolean(getShelterNeed()) ||
        (!mapRevealed && computeCampScore() >= 70))
    ) return "routine";
    if (risk === "寒冷" || risk === "狼踪" || stats.isNight) return "guard";
    if (computeCampScore() < 86 || getBlueprintStage() !== "freeform") return "build";
    if (risk === "饥饿" || resources.berry < 2 || provisions < 2) return "forage";
    return "guard";
  }

  function pickForageTarget(): HarvestKind {
    if (stats.hunger <= 50 || resources.berry < 2) return "bush";
    if (acquired.stick < 2 || resources.stick < 2) return "stick";
    if (acquired.stone < 2 || resources.stone < 2) return "pebble";
    if (activeEvent === "supplyCache") return "crate";
    if (activeEvent === "mushroomBloom") return "bush";
    if (activeEvent === "coldFront") return resources.coal < 1 ? "coal" : "tree";
    if (activeEvent === "wolfTracks") return crafted.bow ? "wolf" : "bush";
    if (resources.wood < 3) return "tree";
    if (resources.coal < 1 && crafted.pickaxe) return "coal";
    if (resources.ironOre < 2 && crafted.pickaxe) return "iron";
    return "tree";
  }

  function getNextProjectKind(): ProjectKind | null {
    if (!projects.rainBarrel) return "rainBarrel";
    if (!projects.trapline) return "trapline";
    if (!projects.watchPost) return "watchPost";
    return null;
  }

  function pickProjectFallback(kind: ProjectKind): HarvestKind {
    const cost = PROJECT_COSTS[kind];
    if ((cost.wood ?? 0) > resources.wood) return "tree";
    if ((cost.stick ?? 0) > resources.stick) return "stick";
    if ((cost.stone ?? 0) > resources.stone) return "stone";
    if ((cost.glass ?? 0) > resources.glass) return "stone";
    if ((cost.bone ?? 0) > resources.bone) return crafted.bow ? "wolf" : "zombie";
    if ((cost.lamp ?? 0) > resources.lamp) return "crate";
    return "tree";
  }

  function getDailyRoutinePlan() {
    const steps: string[] = [];
    if (stats.hunger <= 54) steps.push(resources.berry > 0 ? "吃浆果" : "巡林找食");
    if (weather === "coldSnap" || stats.cold >= 48) steps.push(packReadyCount() > 0 ? "备保温包" : "补炉火");
    if (stats.isNight || stats.wolfPressure >= stats.armor) steps.push(mapRevealed ? "守夜巡逻" : "侦察狼径");
    const shelterNeed = getShelterNeed();
    if (steps.length < 3 && shelterNeed) steps.push(getShelterNeedLabel(shelterNeed));
    if (getBlueprintStage() !== "freeform" || computeCampScore() < 92) steps.push("铺蓝图");
    if (steps.length < 3 && packReadyCount() > 0) steps.push("整理背包");
    if (steps.length < 3) steps.push(mapRevealed ? "巡林采集" : "侦察地图");
    const title =
      stats.isNight ? "夜巡日程" :
      weather === "coldSnap" || stats.cold >= 48 ? "寒潮日程" :
      stats.hunger <= 54 ? "补给日程" :
      shelterNeed ? "屋况日程" :
      getBlueprintStage() !== "freeform" ? "扩建日程" :
      "晨间日程";
    return `${title}：${steps.slice(0, 3).join(" → ")}`;
  }

  function getCabinCommandCards(): CabinCommandCard[] {
    const recommended = getRecommendedCommand();
    const forageTarget = pickForageTarget();
    const project = getNextProjectKind();
    const stage = getBlueprintStage();
    const guardDetail =
      !mapRevealed ? "先侦察狼径和矿点" :
      stats.isNight && placedCounts.bed > 0 ? "睡过长夜恢复状态" :
      weather === "coldSnap" || stats.cold > 52 ? "保温、补给、压寒冷" :
      stewardMode ? "管家维护营地循环" :
      "开启管家巡逻";
    return [
      {
        kind: "forage",
        title: "巡林采集",
        detail: `补${HARVEST_LABELS[forageTarget]}，兼顾食物和工具料`,
        tag: `${CAMP_EVENT_DEFS[activeEvent].title} · ${getGuideTarget().distance}m`,
        ready: true,
        recommended: recommended === "forage",
      },
      {
        kind: "build",
        title: "蓝图加固",
        detail: stage === "freeform" && project ? `建造${PROJECT_LABELS[project]}` : `铺设${BLUEPRINT_LABELS[stage]}阶段`,
        tag: `营地${computeCampScore()} · 安全${computeSecurityScore()}`,
        ready: true,
        recommended: recommended === "build",
      },
      {
        kind: "guard",
        title: "守夜调度",
        detail: guardDetail,
        tag: `${getCommandRisk()} · 狼压${stats.wolfPressure} · 寒冷${stats.cold}`,
        ready: true,
        recommended: recommended === "guard",
      },
      {
        kind: "routine",
        title: "日程总管",
        detail: getDailyRoutinePlan(),
        tag: `省点${routineActions} · ${routineHistory.length > 0 ? routineHistory.at(-1) : "待命"}`,
        ready: routineMode,
        recommended: recommended === "routine",
      },
    ];
  }

  function getFocusSignal(guide = getGuideTarget()) {
    const cards = getCabinCommandCards();
    const card = cards.find((item) => item.recommended) ?? cards[0];
    const risk = getCommandRisk();
    const route = `${guide.title} ${guide.distance}m`;
    const tone =
      risk === "寒冷" || risk === "狼踪" || risk === "屋况" ? "danger" :
      card.kind === "build" ? "build" :
      card.kind === "forage" ? "forage" :
      "steady";
    return {
      title: card.title,
      detail: card.detail,
      risk,
      route,
      tone,
      text: `下一步 ${card.title} · ${card.detail} · ${risk} · ${route}`,
    };
  }

  function renderFocusPanel(guide = getGuideTarget()) {
    const focus = getFocusSignal(guide);
    focusPanel.className = `cabin-focus ${focus.tone}`;
    focusPanel.innerHTML = `
      <button type="button" data-cabin-focus-action>
        <span>下一步</span>
        <strong>${focus.title}</strong>
        <small>${focus.detail}</small>
      </button>
      <div>
        <span>风险 ${focus.risk}</span>
        <span>目标 ${focus.route}</span>
        <span>${getSafetyPlan()}</span>
      </div>
    `;
  }

  function executeCabinCommand(kind: CabinCommandKind) {
    commandMode = true;
    commandActions += 1;
    if (introVisible) startCabinGame();
    const card = getCabinCommandCards().find((item) => item.kind === kind) ?? getCabinCommandCards()[0];
    if (kind === "routine") {
      executeDailyRoutine();
    } else if (kind === "forage") {
      harvestResource(pickForageTarget());
    } else if (kind === "build") {
      const project = getNextProjectKind();
      if (getBlueprintStage() !== "freeform" || computeCampScore() < 92) {
        runBlueprintBuild(3);
      } else if (project) {
        if (canAffordCost(PROJECT_COSTS[project])) buildProject(project);
        else harvestResource(pickProjectFallback(project));
      } else if (packReadyCount() > 0) {
        preparePack();
      } else {
        runBlueprintBuild(2);
      }
    } else if (stats.hunger < 45 && resources.berry > 0) {
      eatBerry();
    } else if (resources.meat > 0 && crafted.campfire) {
      cookMeat();
    } else if (!mapRevealed) {
      scoutMap();
    } else if (stats.isNight && placedCounts.bed > 0) {
      sleepNight();
    } else if ((weather === "coldSnap" || stats.cold > 52) && packReadyCount() > 0) {
      preparePack("winterKit");
    } else if (!stewardMode) {
      toggleSteward();
    } else {
      performStewardAction();
    }
    recordCabinCommand(card);
    updateHud();
    return getDebugState();
  }

  function executeDailyRoutine() {
    routineActions += 1;
    const steps: string[] = [];
    if (stats.hunger <= 54) {
      if (resources.berry > 0) {
        eatBerry();
        steps.push("吃浆果");
      } else {
        harvestResource("bush");
        steps.push("巡林找食");
      }
    }
    if (weather === "coldSnap" || stats.cold >= 48) {
      if (packReadyCount() > 0) {
        preparePack("winterKit");
        steps.push("保温包");
      } else if (!crafted.campfire) {
        craftCampfire();
        steps.push("点篝火");
      } else {
        stats.cold = clampStat(stats.cold - 8);
        shelter.warmth = clampStat(shelter.warmth + 8);
        steps.push("烤火");
      }
    }
    if (steps.length < 3 && (stats.isNight || stats.wolfPressure >= stats.armor)) {
      if (!mapRevealed) {
        scoutMap();
        steps.push("侦察狼径");
      } else if (!stewardMode) {
        toggleSteward();
        steps.push("开管家");
      } else {
        performStewardAction();
        steps.push("巡逻维护");
      }
    }
    const shelterNeed = getShelterNeed();
    if (steps.length < 3 && shelterNeed) {
      steps.push(applyShelterFix(shelterNeed));
    }
    if (steps.length < 3 && (getBlueprintStage() !== "freeform" || computeCampScore() < 92)) {
      runBlueprintBuild(2);
      steps.push("铺蓝图");
    }
    if (steps.length < 3 && packReadyCount() > 0) {
      preparePack();
      steps.push("整理背包");
    }
    if (steps.length < 3) {
      harvestResource(pickForageTarget());
      steps.push("巡林采集");
    }
    shelter.noise = clampStat(shelter.noise - 5);
    shelter.morale = clampStat(shelter.morale + 6);
    routinePlan = `日程总管：${steps.join(" → ")}`;
    routineHistory.push(routinePlan);
    if (routineHistory.length > 6) routineHistory.shift();
    lastTip = routinePlan;
  }

  function recordCabinCommand(card: CabinCommandCard) {
    lastCommandPlan = card.kind === "routine" && routineActions > 0 ? routinePlan : `${card.title}：${card.detail}`;
    commandHistory.push(lastCommandPlan);
    if (commandHistory.length > 7) commandHistory.shift();
  }

  function updateCommandPanel() {
    const cards = getCabinCommandCards();
    commandPanel.querySelector("[data-cabin-command-grade]")!.textContent =
      `${getCommandRisk()} · ${getSafetyPlan().split(" · ")[2]}`;
    commandPanel.querySelector("[data-cabin-command-cards]")!.innerHTML = cards
      .map(
        (card) => `
          <button type="button" class="cabin-command-card ${card.ready ? "ready" : ""} ${card.recommended ? "recommended" : ""}" data-cabin-command="${card.kind}">
            <span>${card.title}</span>
            <strong>${card.detail}</strong>
            <small>${card.tag}</small>
          </button>
        `,
      )
      .join("");
  }

  function setBar(kind: "health" | "hunger" | "cold" | "threat", value: number) {
    const bar = hud.querySelector<HTMLElement>(`[data-${kind}-bar]`);
    const label = hud.querySelector<HTMLElement>(`[data-${kind}-value]`);
    if (!bar || !label) return;
    bar.style.width = `${THREE.MathUtils.clamp(value, 0, 100)}%`;
    label.textContent = String(Math.round(value));
  }

  function updateHeldPreview() {
    if (!heldPreview) return;
    heldPreview.material = blockMaterials[selected];
    heldPreview.scale.setScalar(canAfford(selected) ? 1 : 0.72);
    heldPreview.visible = true;
    updateHandRig(performance.now());
  }

  function updateReticle(guide = getGuideTarget()) {
    const prompt = reticle.querySelector<HTMLElement>("[data-cabin-reticle-prompt]");
    const ring = reticle.querySelector<HTMLElement>("[data-cabin-reticle-ring]");
    const markers = getMiniMapMarkers(guide);
    const nearest = getNearbyHint(markers);
    const action = getNearbyActionText();
    const canBuild = canAfford(selected);
    const charge = canBuild ? Math.min(92, 38 + computeCampScore() * 0.38) : 18;
    reticle.classList.toggle("ready", canBuild);
    reticle.classList.toggle("blocked", !canBuild);
    if (prompt) prompt.textContent = `${action} · ${nearest}`;
    if (ring) ring.style.setProperty("--charge", `${charge}%`);
  }

  function syncIntro() {
    intro.hidden = !introVisible;
    root.classList.toggle("cabin-started", !introVisible);
    for (const label of landmarkLabels) label.visible = !introVisible;
    if (introVisible) {
      eventBeacon.visible = false;
      guideTrail.visible = false;
    } else if (eventBeacon.children.length > 0) {
      eventBeacon.visible = true;
    }
  }

  function startCabinGame() {
    if (!introVisible) return;
    introVisible = false;
    lastTip = "晨雾散开：按当前引导采集、扩建、守住第一夜。";
    syncIntro();
    updateWorldLabels(performance.now());
    updateGuideTrail(performance.now());
    updateShelterAura(performance.now());
    updateHud();
  }

  function toggleMapFocus(force?: boolean) {
    mapFocusMode = force ?? !mapFocusMode;
    if (mapFocusMode && !mapRevealed) scoutMap();
    else {
      lastTip = mapFocusMode ? "地图展开：资源、事件和夜狼径已标出。" : "地图收起，保留右上角小地图。";
      updateHud();
    }
  }

  function withGuideDistance(targetData: Omit<GuideTarget, "distance">): GuideTarget {
    return {
      ...targetData,
      distance: Math.max(1, Math.round(Math.hypot(targetData.x - target.x, targetData.z - target.z))),
    };
  }

  function getGuideTarget(): GuideTarget {
    if (stats.cold >= 56) return withGuideDistance({ title: "回到炉火", x: -0.8, z: 4.9, color: 0xffa94c });
    if (stats.hunger <= 38) return withGuideDistance({ title: "找浆果", x: 3.5, z: 3.2, color: 0xff8794 });
    if (stats.wolfPressure >= stats.armor) return withGuideDistance({ title: "压住狼径", x: -6.6, z: -5.3, color: 0x9ed8ff });
    const shelterNeed = getShelterNeed();
    if (shelterNeed === "dryness") return withGuideDistance({ title: "修屋顶", x: 0.2, z: 3.4, color: 0xa8ebff });
    if (shelterNeed === "warmth") return withGuideDistance({ title: "添炉火", x: -0.8, z: 4.9, color: 0xffa94c });
    if (shelterNeed === "noise") return withGuideDistance({ title: "静音巡线", x: -6.6, z: -5.3, color: 0x9ed8ff });
    if (shelterNeed === "morale") return withGuideDistance({ title: "整理床铺", x: -1.2, z: 5.1, color: 0xffd560 });

    const next = getNextGoal();
    switch (next?.id) {
      case "forage":
        return withGuideDistance(acquired.stick < 2
          ? { title: "拾木棍", x: -2.8, z: -3.8, color: 0xd9a46d }
          : { title: "拾石子", x: 2.9, z: -2.6, color: 0xd8e1e6 });
      case "first-tree":
      case "porch":
      case "storage":
      case "rain-barrel":
        return withGuideDistance({ title: "砍松木", x: -7, z: -5, color: 0x8fdc78 });
      case "stone-axe":
      case "campfire":
      case "stone-pickaxe":
        return withGuideDistance(resources.stick < 2
          ? { title: "拾木棍", x: -4.4, z: 2.6, color: 0xd9a46d }
          : { title: "敲石堆", x: 4, z: -5, color: 0xd8e1e6 });
      case "camp-light":
      case "hedge":
      case "furnace":
      case "bed":
      case "comfort-camp":
        return withGuideDistance({ title: "补蓝图", x: -1.2, z: 5.1, color: 0xffd560 });
      case "food":
      case "wood-bow":
        return withGuideDistance({ title: "采灌木", x: 3.5, z: 3.2, color: 0xff8794 });
      case "safe-night":
      case "cold-snap":
      case "sleep-night":
        return withGuideDistance({ title: "守炉火", x: -0.8, z: 4.9, color: 0xffa94c });
      case "first-hunt":
      case "cooked-meat":
      case "hide-armor":
        return withGuideDistance({ title: "走猎径", x: -7.4, z: -2.6, color: 0xf2c18a });
      case "iron-ingot":
      case "mine-expedition":
        return withGuideDistance({ title: "东岭铁矿", x: 6.8, z: -3.8, color: 0xffad7d });
      case "map-scout":
      case "forest-expedition":
        return withGuideDistance({ title: "爬上哨点", x: -2.8, z: 2.4, color: 0xa8ebff });
      case "trapline":
      case "hunt-expedition":
        return withGuideDistance({ title: "布陷阱线", x: -4.2, z: 3.15, color: 0xe6d38b });
      case "watch-post":
      case "secure-loop":
      case "steward":
        return withGuideDistance({ title: "架哨塔", x: -2.8, z: 2.4, color: 0xffd560 });
      default: {
        const event = CAMP_EVENT_DEFS[activeEvent];
        return withGuideDistance({ title: event.title, x: event.position[0], z: event.position[1], color: event.color });
      }
    }
  }

  function getMiniMapMarkers(guide = getGuideTarget()): MiniMapMarker[] {
    const markers: MiniMapMarker[] = [
      { title: "你", x: target.x, z: target.z, kind: "player" },
      { title: "小屋", x: 0, z: 1, kind: "home" },
      { title: guide.title, x: guide.x, z: guide.z, kind: "event", active: true },
    ];
    const event = CAMP_EVENT_DEFS[activeEvent];
    markers.push({ title: event.title, x: event.position[0], z: event.position[1], kind: activeEvent === "wolfTracks" ? "danger" : "event" });
    if (mapRevealed || mapFocusMode) {
      markers.push(
        { title: "煤", x: -8, z: 2.8, kind: "resource" },
        { title: "铁", x: 6.8, z: -3.8, kind: "resource" },
        { title: "浆果", x: 3.5, z: 3.2, kind: "resource" },
        { title: "狼径", x: -6.6, z: -5.3, kind: "danger" },
      );
    }
    if (projects.rainBarrel) markers.push({ title: "雨桶", x: 1.85, z: 4.62, kind: "project" });
    if (projects.trapline) markers.push({ title: "陷阱", x: -4.2, z: 3.15, kind: "project" });
    if (projects.watchPost) markers.push({ title: "哨塔", x: -2.8, z: 2.4, kind: "project" });
    return markers;
  }

  function mapPercent(value: number) {
    return THREE.MathUtils.clamp(((value + 10) / 20) * 100, 4, 96);
  }

  function getNearbyHint(markers = getMiniMapMarkers()) {
    const nearest = markers
      .filter((marker) => marker.kind !== "player")
      .map((marker) => ({ marker, distance: Math.hypot(marker.x - target.x, marker.z - target.z) }))
      .sort((a, b) => a.distance - b.distance)[0];
    return nearest ? `${nearest.marker.title} ${Math.max(1, Math.round(nearest.distance))}m` : "营地";
  }

  function getNearbyHarvestable(maxDistance = 2.35) {
    const position = new THREE.Vector3();
    return harvestables
      .filter((object) => Boolean(object.parent) && Boolean(object.userData.harvest))
      .map((object) => {
        object.getWorldPosition(position);
        return {
          object,
          kind: object.userData.harvest as HarvestKind,
          distance: Math.hypot(position.x - target.x, position.z - target.z),
        };
      })
      .filter((item) => item.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)[0] ?? null;
  }

  function getNearbyActionText() {
    const nearby = getNearbyHarvestable();
    if (nearby) return `E ${nearby.object.userData.pickup ? "拾取" : "采集"}${HARVEST_LABELS[nearby.kind]} ${nearby.distance.toFixed(1)}m`;
    if (canAfford(selected)) return `左键建造${MATERIALS[selected].name}`;
    return `缺 ${costText(selected)}`;
  }

  function renderMiniMap(guide = getGuideTarget()) {
    const markers = getMiniMapMarkers(guide);
    minimap.classList.toggle("expanded", mapFocusMode);
    const dots = markers
      .map((marker) => {
        const x = mapPercent(marker.x);
        const z = mapPercent(marker.z);
        const classes = ["cabin-map-dot", marker.kind, marker.active ? "active" : ""].filter(Boolean).join(" ");
        return `<span class="${classes}" style="left:${x}%;top:${z}%;" title="${marker.title}">${marker.title.slice(0, 1)}</span>`;
      })
      .join("");
    minimap.innerHTML = `
      <div class="cabin-minimap-head">
        <strong>${guide.title}</strong>
        <span>${guide.distance}m</span>
      </div>
      <div class="cabin-minimap-field">${dots}<i></i></div>
      <div class="cabin-minimap-foot">${getNearbyHint(markers)}</div>
    `;
  }

  function installEvents() {
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", onKeyDown);
    intro.querySelector<HTMLButtonElement>("[data-cabin-start]")?.addEventListener("click", () => startCabinGame());
    minimap.addEventListener("click", () => toggleMapFocus());
    focusPanel.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-cabin-focus-action]");
      if (!button) return;
      executeCabinCommand(getRecommendedCommand());
    });
    hud.querySelector<HTMLButtonElement>("[data-smart]")?.addEventListener("click", () => performSmartAction());
    hud.querySelector<HTMLButtonElement>("[data-autopilot]")?.addEventListener("click", () => toggleAutopilot());
    hud.querySelector<HTMLButtonElement>("[data-blueprint]")?.addEventListener("click", () => runBlueprintBuild(4));
    hud.querySelector<HTMLButtonElement>("[data-pack]")?.addEventListener("click", () => togglePack());
    hud.querySelector<HTMLButtonElement>("[data-eat]")?.addEventListener("click", () => eatBerry());
    hud.querySelector<HTMLButtonElement>("[data-craft-axe]")?.addEventListener("click", () => craftAxe());
    hud.querySelector<HTMLButtonElement>("[data-craft-bow]")?.addEventListener("click", () => craftBow());
    hud.querySelector<HTMLButtonElement>("[data-craft-campfire]")?.addEventListener("click", () => craftCampfire());
    hud.querySelector<HTMLButtonElement>("[data-cook]")?.addEventListener("click", () => cookMeat());
    hud.querySelector<HTMLButtonElement>("[data-scout]")?.addEventListener("click", () => scoutMap());
    hud.querySelector<HTMLButtonElement>("[data-sleep]")?.addEventListener("click", () => sleepNight());
    hud.querySelector<HTMLButtonElement>("[data-steward]")?.addEventListener("click", () => toggleSteward());
    hud.querySelector<HTMLButtonElement>("[data-expedition]")?.addEventListener("click", () => sendNextExpedition());
    commandPanel.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-cabin-command]");
      if (!button) return;
      executeCabinCommand(button.dataset.cabinCommand as CabinCommandKind);
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
      cameraState.phi = THREE.MathUtils.clamp(cameraState.phi + dy * 0.004, 0.38, 1.22);
      lastPointer = { x: event.clientX, y: event.clientY };
      updateCamera();
    });
    renderer.domElement.addEventListener("pointerup", (event) => {
      dragging = false;
      renderer.domElement.releasePointerCapture(event.pointerId);
      if (movedDuringDrag) return;
      if (event.button === 2) removeBlockAtPointer(event);
      else placeBlockAtPointer(event);
    });
    renderer.domElement.addEventListener(
      "wheel",
      (event) => {
        cameraState.radius = THREE.MathUtils.clamp(cameraState.radius + event.deltaY * 0.01, 8, 28);
        updateCamera();
      },
      { passive: true },
    );
  }

  function onKeyDown(event: KeyboardEvent) {
    if (introVisible && (event.key === "Enter" || event.key === " ")) {
      startCabinGame();
      return;
    }
    if (event.key.toLowerCase() === "m") {
      toggleMapFocus();
      return;
    }
    const index = Number(event.key) - 1;
    if (index >= 0 && index < BLOCK_KEYS.length) {
      selected = BLOCK_KEYS[index];
      updateHud();
      return;
    }
    if (event.key.toLowerCase() === "e") {
      if (!interactNearbyHarvestable()) eatBerry();
      return;
    }
    if (event.key.toLowerCase() === "q") {
      performSmartAction();
      return;
    }
    const step = event.shiftKey ? 1.1 : 0.55;
    if (event.key.toLowerCase() === "w") target.z -= step;
    if (event.key.toLowerCase() === "s") target.z += step;
    if (event.key.toLowerCase() === "a") target.x -= step;
    if (event.key.toLowerCase() === "d") target.x += step;
    target.x = THREE.MathUtils.clamp(target.x, -5.5, 5.5);
    target.z = THREE.MathUtils.clamp(target.z, -5.5, 5.5);
    updateCamera();
  }

  function updateHover(event: PointerEvent) {
    const point = getGroundPoint(event);
    if (!point) {
      hover.visible = false;
      return;
    }
    hover.visible = true;
    hover.position.set(point.x, 0.06, point.z);
    const material = hover.material;
    if (material instanceof THREE.MeshBasicMaterial) {
      material.color.setHex(canAfford(selected) ? MATERIALS[selected].color : 0xff6b6b);
      material.opacity = canAfford(selected) ? 0.46 : 0.28;
    }
  }

  function placeBlockAtPointer(event: PointerEvent) {
    if (harvestAtPointer(event)) return;
    const point = getGroundPoint(event);
    if (!point) return;
    placeBlock(point.x, point.z, selected);
  }

  function harvestAtPointer(event: PointerEvent) {
    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(harvestables, true);
    const hit = hits[0]?.object;
    if (!hit) return false;
    const root = findHarvestRoot(hit);
    if (!root) return false;
    harvestResource(root.userData.harvest, root);
    recordNearbyInteraction(root.userData.harvest, 0, Boolean(root.userData.pickup), "点击");
    if (root.userData.pickup) removeHarvestable(root);
    else pulseObject(root);
    updateHud();
    return true;
  }

  function recordNearbyInteraction(kind: HarvestKind, distance: number, pickup: boolean, source = "E") {
    nearbyInteractions += 1;
    const action = pickup ? "拾取" : "采集";
    lastNearbyAction = `${source} ${action}${HARVEST_LABELS[kind]} ${distance.toFixed(1)}m`;
  }

  function interactNearbyHarvestable() {
    if (introVisible) startCabinGame();
    const nearby = getNearbyHarvestable();
    if (!nearby) {
      lastTip = canAfford(selected)
        ? `附近没有可采集物；左键地面可以放置${MATERIALS[selected].name}。`
        : `${MATERIALS[selected].name}材料不足：需要 ${costText(selected)}`;
      updateHud();
      return false;
    }
    harvestResource(nearby.kind, nearby.object);
    recordNearbyInteraction(nearby.kind, nearby.distance, Boolean(nearby.object.userData.pickup));
    if (nearby.object.userData.pickup) {
      removeHarvestable(nearby.object);
      autoPickupCount += 1;
    } else {
      pulseObject(nearby.object);
    }
    lastTip = `就近交互：${HARVEST_LABELS[nearby.kind]} ${nearby.distance.toFixed(1)}m，资源已结算。`;
    updateHud();
    return true;
  }

  function findHarvestRoot(object: THREE.Object3D) {
    let current: THREE.Object3D | null = object;
    while (current) {
      if (current.userData.harvest) return current;
      current = current.parent;
    }
    return null;
  }

  function findHarvestableByKind(type: HarvestKind) {
    const position = new THREE.Vector3();
    return harvestables
      .filter((object) => Boolean(object.parent) && object.userData.harvest === type)
      .map((object) => {
        object.getWorldPosition(position);
        return { object, distance: Math.hypot(position.x - target.x, position.z - target.z) };
      })
      .sort((left, right) => left.distance - right.distance)[0]?.object ?? null;
  }

  function spawnHarvestPopup(type: HarvestKind, text: string, sourceObject?: THREE.Object3D | null) {
    if (introVisible) return;
    const source = sourceObject ?? findHarvestableByKind(type);
    const position = new THREE.Vector3();
    if (source) source.getWorldPosition(position);
    else {
      const guide = getGuideTarget();
      position.set(guide.x, 0.4, guide.z);
    }
    const sprite = createPopupSprite(text, HARVEST_COLORS[type]);
    sprite.position.set(position.x, Math.max(1.15, position.y + 1.1), position.z);
    scene.add(sprite);
    harvestPopups.push({ sprite, bornAt: performance.now(), ttl: 1_350, baseY: sprite.position.y });
    while (harvestPopups.length > 9) {
      const old = harvestPopups.shift();
      if (!old) break;
      scene.remove(old.sprite);
      const material = old.sprite.material;
      if (material instanceof THREE.SpriteMaterial) {
        material.map?.dispose();
        material.dispose();
      }
    }
    lastHarvestPopup = `${HARVEST_LABELS[type]}：${text}`;
  }

  function harvestResource(type: HarvestKind, sourceObject?: THREE.Object3D | null) {
    harvested[type] += 1;
    let rewardText = HARVEST_LABELS[type];
    if (type === "tree") {
      const woodGain = crafted.axe ? 6 : 4;
      gain("wood", woodGain);
      gain("leaf", 1);
      gain("stick", 1);
      rewardText = `木材 +${woodGain} / 纤维 +1`;
      lastTip = crafted.axe ? "石斧劈开松木：木材 +6，纤维 +1，木棍 +1" : "砍下松木：木材 +4，纤维 +1，木棍 +1";
    } else if (type === "stone") {
      gain("stone", 3);
      if (harvested.stone % 2 === 0) gain("glass", 1);
      rewardText = harvested.stone % 2 === 0 ? "石头 +3 / 碎晶 +1" : "石头 +3";
      lastTip = harvested.stone % 2 === 0 ? "敲开岩石：石头 +3，碎晶 +1" : "敲开岩石：石头 +3";
    } else if (type === "bush") {
      gain("berry", 2);
      gain("leaf", 1);
      stats.hunger = clampStat(stats.hunger + 4);
      rewardText = "浆果 +2 / 纤维 +1";
      lastTip = "采到浆果：浆果 +2，纤维 +1";
    } else if (type === "stick") {
      gain("stick", 1);
      gain("wood", 1);
      rewardText = "木棍 +1 / 木材 +1";
      lastTip = "拾起木棍：木棍 +1，木材 +1";
    } else if (type === "pebble") {
      gain("stone", 1);
      rewardText = "石头 +1";
      lastTip = "拾起石子：石头 +1";
    } else if (type === "deer") {
      gain("meat", crafted.bow ? 2 : 1);
      gain("hide", 1);
      stats.hunger = clampStat(stats.hunger - (crafted.bow ? 1 : 5));
      rewardText = `生肉 +${crafted.bow ? 2 : 1} / 兽皮 +1`;
      lastTip = crafted.bow ? "木弓猎到鹿：生肉 +2，兽皮 +1" : "徒手追猎太费劲：生肉 +1，兽皮 +1";
    } else if (type === "boar") {
      gain("meat", 2);
      gain("hide", 1);
      gain("bone", 1);
      if (!crafted.armor) stats.health = clampStat(stats.health - 6);
      rewardText = "生肉 +2 / 骨头 +1";
      lastTip = crafted.armor ? "皮甲挡住野猪冲撞：生肉 +2，兽皮 +1，骨头 +1" : "猎到野猪但被顶伤：生肉 +2，兽皮 +1，骨头 +1";
    } else if (type === "wolf") {
      gain("hide", 2);
      gain("bone", 1);
      stats.health = clampStat(stats.health - (crafted.bow ? 4 : 12));
      stats.wolfPressure = clampStat(stats.wolfPressure - 18);
      rewardText = "兽皮 +2 / 狼压 -18";
      lastTip = "击退野狼：兽皮 +2，骨头 +1，狼压下降";
    } else if (type === "zombie") {
      gain("bone", 2);
      gain("hide", 1);
      stats.health = clampStat(stats.health - (crafted.armor ? 3 : 10));
      rewardText = "骨头 +2 / 兽皮 +1";
      lastTip = "消灭游荡者：骨头 +2，兽皮 +1";
    } else if (type === "coal") {
      gain("coal", crafted.pickaxe ? 2 : 1);
      rewardText = `煤炭 +${crafted.pickaxe ? 2 : 1}`;
      lastTip = crafted.pickaxe ? "石镐敲下煤块：煤炭 +2" : "徒手刮下煤块：煤炭 +1";
    } else if (type === "iron") {
      if (!crafted.pickaxe) {
        gain("stone", 1);
        rewardText = "石头 +1";
        lastTip = "铁矿太硬了，先制作石镐；只敲下石头 +1";
      } else {
        gain("ironOre", 2);
        rewardText = "铁矿 +2";
        lastTip = "开采铁矿：铁矿 +2";
      }
    } else {
      gain("lamp", 1);
      gain("berry", 1);
      gain("coal", 1);
      rewardText = "灯芯 +1 / 煤炭 +1";
      lastTip = "搜到补给箱：灯芯 +1，浆果 +1，煤炭 +1";
    }
    triggerToolSwing(type, sourceObject);
    spawnHarvestPopup(type, rewardText, sourceObject);
    updateHud();
  }

  function gain(resource: ResourceKind, amount: number) {
    resources[resource] += amount;
    acquired[resource] += amount;
  }

  function removeHarvestable(object: THREE.Object3D) {
    const index = harvestables.indexOf(object);
    if (index >= 0) harvestables.splice(index, 1);
    object.parent?.remove(object);
  }

  function eatBerry() {
    if (resources.berry <= 0) {
      lastTip = "没有浆果了，去灌木丛找吃的。";
      updateHud();
      return;
    }
    if (stats.hunger >= 100) {
      lastTip = "现在不饿，浆果先留着。";
      updateHud();
      return;
    }
    resources.berry -= 1;
    stats.hunger = clampStat(stats.hunger + 24);
    stats.health = clampStat(stats.health + 3);
    lastTip = "吃下浆果：饥饿 +24，生命 +3";
    updateHud();
  }

  function craftAxe() {
    if (crafted.axe) {
      lastTip = "石斧已经做好了，继续砍树收益更高。";
      updateHud();
      return;
    }
    if (resources.stick < 2 || resources.stone < 2) {
      lastTip = "制作石斧需要木棍 2 和石头 2。";
      updateHud();
      return;
    }
    resources.stick -= 2;
    resources.stone -= 2;
    crafted.axe = true;
    lastTip = "制作石斧：之后砍树木材收益提高。";
    updateHud();
  }

  function craftCampfire() {
    if (crafted.campfire) {
      lastTip = "篝火已经点燃，夜里会压住狼群。";
      updateHud();
      return;
    }
    if (resources.wood < 3 || resources.stone < 2) {
      lastTip = "点篝火需要木材 3 和石头 2。";
      updateHud();
      return;
    }
    resources.wood -= 3;
    resources.stone -= 2;
    crafted.campfire = true;
    campfire.visible = true;
    stats.health = clampStat(stats.health + 2);
    lastTip = "篝火点起来了：夜晚狼压降低。";
    updateHud();
  }

  function craftBow() {
    if (crafted.bow) {
      lastTip = "木弓已经做好了，可以更稳地猎鹿和野狼。";
      updateHud();
      return;
    }
    if (resources.stick < 2 || resources.leaf < 1) {
      lastTip = "制作木弓需要木棍 2 和纤维 1。";
      updateHud();
      return;
    }
    resources.stick -= 2;
    resources.leaf -= 1;
    crafted.bow = true;
    lastTip = "制作木弓：狩猎收益提高，受伤更少。";
    updateHud();
  }

  function craftPickaxe() {
    if (crafted.pickaxe) {
      lastTip = "石镐已经做好了，可以去敲煤矿和铁矿。";
      updateHud();
      return;
    }
    if (resources.stick < 2 || resources.stone < 3) {
      lastTip = "制作石镐需要木棍 2 和石头 3。";
      updateHud();
      return;
    }
    resources.stick -= 2;
    resources.stone -= 3;
    crafted.pickaxe = true;
    lastTip = "制作石镐：铁矿终于能采了。";
    updateHud();
  }

  function craftArmor() {
    if (crafted.armor) {
      lastTip = "皮甲已经穿上了，夜里更扛打。";
      updateHud();
      return;
    }
    if (resources.hide < 2 || resources.bone < 1) {
      lastTip = "制作皮甲需要兽皮 2 和骨头 1。";
      updateHud();
      return;
    }
    resources.hide -= 2;
    resources.bone -= 1;
    crafted.armor = true;
    stats.armor = computeArmor();
    lastTip = "穿上皮甲：狼群和游荡者伤害降低。";
    updateHud();
  }

  function cookMeat() {
    if (!crafted.campfire) {
      lastTip = "先点起篝火，生肉才能烤熟。";
      updateHud();
      return;
    }
    if (resources.meat <= 0) {
      lastTip = "没有生肉，先去猎鹿或野猪。";
      updateHud();
      return;
    }
    resources.meat -= 1;
    gain("cookedMeat", 1);
    stats.hunger = clampStat(stats.hunger + 32);
    stats.health = clampStat(stats.health + 6);
    lastTip = "烤熟了一块肉：饥饿 +32，生命 +6。";
    updateHud();
  }

  function smeltIron() {
    if (placedCounts.furnace < 1) {
      lastTip = "先放置熔炉，再冶炼铁矿。";
      updateHud();
      return;
    }
    if (resources.ironOre < 2 || resources.coal < 1) {
      lastTip = "炼铁需要铁矿 2 和煤炭 1。";
      updateHud();
      return;
    }
    resources.ironOre -= 2;
    resources.coal -= 1;
    gain("iron", 1);
    lastTip = "熔炉炼出铁锭：铁锭 +1。";
    updateHud();
  }

  function buildProject(kind: ProjectKind) {
    if (projects[kind]) {
      lastTip = `${PROJECT_LABELS[kind]}已经建好，营地会持续受益。`;
      updateHud();
      return;
    }
    const cost = PROJECT_COSTS[kind];
    if (!canAffordCost(cost)) {
      lastTip = `${PROJECT_LABELS[kind]}材料不足：需要 ${costTextFrom(cost)}`;
      updateHud();
      return;
    }
    spendCost(cost);
    projects[kind] = true;
    const group = createProjectGroup(kind);
    projectGroups.set(kind, group);
    scene.add(group);
    if (kind === "rainBarrel") {
      provisions += 2;
      lastTip = "建好雨桶：雨天会补浆果和远征补给，饥饿消耗降低。";
    } else if (kind === "trapline") {
      gain("meat", 1);
      provisions += 1;
      lastTip = "布好陷阱线：营地开始有被动肉源，托管时会自动收陷阱。";
    } else {
      stats.wolfPressure = clampStat(stats.wolfPressure - 18);
      lastTip = "架起哨塔：夜狼路径提前预警，安全评分上升。";
    }
    stats.armor = computeArmor();
    updateHud();
  }

  function pickCampEvent() {
    if (weather === "coldSnap" || stats.cold > 54) return "coldFront";
    if (stats.isNight && stats.wolfPressure > 32) return "wolfTracks";
    const cycle: CampEventKind[] = ["supplyCache", "mushroomBloom", "wolfTracks", "quietWatch", "coldFront"];
    return cycle[(smartActions + stats.day + eventActions) % cycle.length];
  }

  function maybeAdvanceCampEvent(reason: string) {
    const shouldTrigger = eventActions === 0 || (smartActions > 0 && smartActions % 10 === 0 && lastEventAtAction !== smartActions);
    if (!shouldTrigger) return;
    lastEventAtAction = smartActions;
    triggerCampEvent(pickCampEvent(), reason);
  }

  function triggerCampEvent(kind: CampEventKind, reason = "林地变化", countAction = true) {
    activeEvent = kind;
    const meta = CAMP_EVENT_DEFS[kind];
    if (countAction) {
      eventActions += 1;
      eventHistory.push(meta.title);
      if (eventHistory.length > 6) eventHistory.shift();
    } else if (eventHistory.length === 0) {
      eventHistory.push(meta.title);
    }
    applyCampEvent(kind);
    renderCampEvent(kind);
    lastTip = `${reason}：${meta.title}。${meta.detail}`;
    updateLighting();
    updateWeatherVisual(performance.now());
    updateWolfTrail(performance.now());
    updateSurvivalVignette();
    updateHud();
  }

  function applyCampEvent(kind: CampEventKind) {
    if (kind === "quietWatch") {
      stats.wolfPressure = clampStat(stats.wolfPressure - 5);
      stats.cold = clampStat(stats.cold - 3);
      shelter.noise = clampStat(shelter.noise - 8);
      shelter.morale = clampStat(shelter.morale + 4);
      return;
    }
    if (kind === "mushroomBloom") {
      gain("berry", projects.rainBarrel ? 3 : 2);
      gain("leaf", 1);
      provisions += 1;
      stats.hunger = clampStat(stats.hunger + 4);
      shelter.dryness = clampStat(shelter.dryness - 6);
      shelter.morale = clampStat(shelter.morale + 3);
      return;
    }
    if (kind === "supplyCache") {
      gain("stick", 1);
      gain("stone", 1);
      gain("wood", 2);
      if (!crafted.campfire) gain("coal", 1);
      if (placedCounts.lamp < 1) gain("lamp", 1);
      provisions += 1;
      shelter.noise = clampStat(shelter.noise + 5);
      shelter.morale = clampStat(shelter.morale + 5);
      return;
    }
    if (kind === "wolfTracks") {
      const warningRelief = (mapRevealed ? 8 : 0) + (projects.watchPost ? 18 : 0) + (crafted.bow ? 7 : 0);
      stats.wolfPressure = clampStat(stats.wolfPressure + Math.max(4, 24 - warningRelief));
      shelter.noise = clampStat(shelter.noise + Math.max(3, 12 - Math.floor(warningRelief / 4)));
      shelter.morale = clampStat(shelter.morale - 5);
      if (projects.trapline) {
        gain("bone", 1);
        provisions += 1;
      }
      return;
    }
    weather = "coldSnap";
    weatherOverrideUntil = performance.now() + 13_000;
    const warmth = computeWarmth();
    stats.cold = clampStat(Math.max(stats.cold, 52 - warmth * 0.18));
    shelter.warmth = clampStat(shelter.warmth - 12 + (crafted.campfire ? 8 : 0));
    shelter.dryness = clampStat(shelter.dryness - 8);
    if (crafted.campfire) stats.health = clampStat(stats.health + 2);
    if (placedCounts.bed > 0 && warmth >= 48) coldSnapsManaged = Math.max(coldSnapsManaged, 1);
  }

  function toggleSteward() {
    stewardMode = !stewardMode;
    nextStewardAt = performance.now() + 900;
    lastTip = stewardMode ? "营地管家接手：会自动吃饭、收陷阱、派远征和压狼压。" : "营地管家待命。";
    updateHud();
  }

  function toggleAutopilot(force?: boolean) {
    autopilotMode = force ?? !autopilotMode;
    nextAutopilotAt = performance.now() + 600;
    lastTip = autopilotMode ? "自走营地启动：任务链会持续推进，缺料会自动采集。" : "自走营地暂停，改为手动安排。";
    updateHud();
  }

  function performStewardAction() {
    stewardActions += 1;
    if (resources.meat > 0 && crafted.campfire && (stats.hunger < 88 || provisions < 3)) {
      cookMeat();
      provisions += 1;
      lastTip = "管家维护：把生肉烤成补给，后续远征少掉状态。";
      updateHud();
      return;
    }
    if (stats.hunger < 72 && resources.berry > 0) {
      eatBerry();
      lastTip = "管家维护：饥饿偏低，自动吃掉一份浆果。";
      updateHud();
      return;
    }
    if (projects.trapline && stewardActions % 2 === 0) {
      gain("meat", 1);
      if (stewardActions % 4 === 0) gain("hide", 1);
      provisions += 1;
      lastTip = "管家维护：检查陷阱线，收回肉和皮。";
      updateHud();
      return;
    }
    if (projects.rainBarrel && (weather === "rain" || stewardActions % 3 === 0)) {
      gain("berry", 1);
      provisions += 1;
      stats.hunger = clampStat(stats.hunger + 3);
      lastTip = "管家维护：雨桶蓄水，浆果和远征补给增加。";
      updateHud();
      return;
    }
    if (projects.watchPost) {
      stats.wolfPressure = clampStat(stats.wolfPressure - 14);
      stats.cold = clampStat(stats.cold - 5);
      shelter.noise = clampStat(shelter.noise - 10);
      shelter.warmth = clampStat(shelter.warmth + 3);
      shelter.morale = clampStat(shelter.morale + 2);
      lastTip = "管家维护：哨塔巡逻压住狼群，也提醒补火保温。";
      updateHud();
      return;
    }
    shelter.noise = clampStat(shelter.noise - 3);
    shelter.morale = clampStat(shelter.morale + 1);
    lastTip = "管家维护：巡查营地，暂时没有紧急事项。";
    updateHud();
  }

  function sendNextExpedition() {
    if (expeditions.forest < 1) return sendExpedition("forest");
    if (expeditions.mine < 1) return sendExpedition("mine");
    if (expeditions.hunt < 1) return sendExpedition("hunt");
    return sendExpedition(stewardActions % 3 === 0 ? "mine" : stewardActions % 2 === 0 ? "hunt" : "forest");
  }

  function sendExpedition(kind: ExpeditionKind) {
    if (!mapRevealed) {
      scoutMap();
      return;
    }
    if (kind === "mine" && !crafted.pickaxe) {
      lastTip = "矿脊远征需要石镐，否则只能在边缘敲碎石。";
      updateHud();
      return;
    }
    if (kind === "hunt" && !crafted.bow) {
      lastTip = "猎径远征最好先备好木弓。";
      updateHud();
      return;
    }
    expeditions[kind] += 1;
    if (provisions > 0) provisions -= 1;
    else stats.hunger = clampStat(stats.hunger - 8);

    const safety = computeSecurityScore();
    const risk = Math.max(0, 44 - safety * 0.22 - (crafted.armor ? 8 : 0));
    if (risk > 0) stats.health = clampStat(stats.health - risk);

    if (kind === "forest") {
      gain("wood", 4);
      gain("leaf", 2);
      gain("stick", 2);
      gain("berry", projects.rainBarrel ? 2 : 1);
      lastTip = "林线远征带回木材、纤维和浆果。";
    } else if (kind === "mine") {
      gain("stone", 3);
      gain("coal", 2);
      gain("ironOre", 2);
      if (projects.watchPost) gain("glass", 1);
      lastTip = "矿脊远征带回石头、煤炭和铁矿。";
    } else {
      gain("meat", projects.trapline ? 3 : 2);
      gain("hide", 1);
      gain("bone", 1);
      provisions += projects.trapline ? 2 : 1;
      lastTip = "猎径远征带回肉、兽皮和骨头。";
    }
    updateHud();
  }

  function scoutMap() {
    mapChecks += 1;
    if (!mapRevealed) {
      mapRevealed = true;
      mapMarkers.visible = true;
      gain("coal", 1);
      gain("berry", 1);
      lastTip = "侦察完营地周边：标出煤矿、铁矿、浆果和夜狼路径。";
    } else {
      stats.wolfPressure = clampStat(stats.wolfPressure - 6);
      lastTip = "复查地图：避开夜狼路径，狼压下降。";
    }
    updateHud();
  }

  function sleepNight() {
    if (placedCounts.bed < 1) {
      lastTip = "没有床铺，夜里只能硬守。";
      updateHud();
      return;
    }
    if (!stats.isNight) {
      forcedDayProgress = 0.88;
      updateTime(performance.now());
      updateSurvival(120);
    }
    sleptNights += 1;
    safeNightSecured = true;
    stats.day += 1;
    forcedDayProgress = 0.24;
    dayProgress = 0.24;
    lastCycle = dayProgress;
    weather = "clear";
    weatherOverrideUntil = performance.now() + 8_000;
    stats.health = clampStat(stats.health + 22);
    stats.hunger = clampStat(stats.hunger - 8);
    stats.cold = clampStat(stats.cold - 36);
    stats.wolfPressure = clampStat(stats.wolfPressure - 42);
    updateTime(performance.now());
    updateLighting();
    lastTip = "睡过长夜：清晨醒来，生命回升，寒冷和狼压退去。";
    updateHud();
  }

  function forceWeather(kind: WeatherKind = "rain") {
    weather = kind;
    weatherOverrideUntil = performance.now() + 16_000;
    if (kind === "coldSnap") stats.cold = Math.max(stats.cold, 34);
    updateSurvival(kind === "coldSnap" ? 800 : 240);
    updateLighting();
    updateWeatherVisual(performance.now());
    updateShelterAura(performance.now());
    updateSurvivalVignette();
    lastTip = kind === "coldSnap" ? "寒潮压进林地：靠篝火、床铺和围墙稳住体温。" : `天气转为${WEATHER_LABELS[kind]}。`;
    updateHud();
  }

  function forceColdSnap() {
    forcedDayProgress = 0.86;
    updateTime(performance.now());
    forceWeather("coldSnap");
  }

  function getBlueprintStage(): BlueprintStage {
    if (placedCounts.wood < 3) return "porch";
    if (placedCounts.lamp < 1) return "light";
    if (placedCounts.leaf < 4) return "hedge";
    if (placedCounts.furnace < 1 || placedCounts.chest < 1) return "workshop";
    if (placedCounts.bed < 1) return "rest";
    if (computeCampScore() < 92 || !projects.watchPost) return "secure";
    return "freeform";
  }

  function getBlueprintSequence(): Array<{ kind: BlockKind; target: number; fallback: HarvestKind }> {
    return [
      { kind: "wood", target: 3, fallback: "tree" },
      { kind: "lamp", target: 1, fallback: resources.lamp > 0 ? "stone" : "crate" },
      { kind: "leaf", target: 4, fallback: "bush" },
      { kind: "furnace", target: 1, fallback: resources.coal > 0 ? "stone" : "coal" },
      { kind: "chest", target: 1, fallback: "tree" },
      { kind: "bed", target: 1, fallback: "deer" },
      { kind: "glass", target: 1, fallback: "stone" },
      { kind: "stone", target: 1, fallback: "stone" },
    ];
  }

  function placeBlueprintPiece(kind: BlockKind) {
    const spot = findAutoBuildSpot(kind);
    if (!spot) {
      lastTip = "蓝图周边没有空位，拆一点或换位置再继续。";
      updateHud();
      return false;
    }
    const before = placedBlocks.length;
    const placed = placeBlock(spot[0], spot[1], kind);
    if (placed && placedBlocks.length > before) {
      blueprintPieces += 1;
      return true;
    }
    return false;
  }

  function buildBlueprintBatch(kind: BlockKind, targetCount: number, fallback: HarvestKind, maxPieces = 3) {
    blueprintActions += 1;
    let placed = 0;
    while (placedCounts[kind] < targetCount && placed < maxPieces) {
      if (!canAfford(kind)) {
        if (placed === 0) harvestResource(fallback);
        else {
          lastTip = `蓝图铺设：${MATERIALS[kind].name}材料用完，已铺 ${placed} 块。`;
          updateHud();
        }
        return;
      }
      if (!placeBlueprintPiece(kind)) return;
      placed += 1;
    }
    if (placed > 0) {
      lastTip = `蓝图铺设：${BLUEPRINT_LABELS[getBlueprintStage()]}阶段补上 ${placed} 块。`;
      updateHud();
    }
  }

  function runBlueprintBuild(maxPieces = 4) {
    blueprintActions += 1;
    let placed = 0;
    for (const item of getBlueprintSequence()) {
      while (placedCounts[item.kind] < item.target && placed < maxPieces) {
        if (!canAfford(item.kind)) {
          if (placed === 0) harvestResource(item.fallback);
          else {
            lastTip = `蓝图铺设暂停：材料耗尽，已补 ${placed} 块。`;
            updateHud();
          }
          return;
        }
        if (!placeBlueprintPiece(item.kind)) return;
        placed += 1;
      }
      if (placed >= maxPieces) break;
    }
    if (placed === 0) {
      blueprintMode = !blueprintMode;
      lastTip = blueprintMode ? "蓝图地垫已显示，照着亮格扩建。" : "蓝图地垫已隐藏，保留手动建造。";
    } else {
      lastTip = `蓝图铺设：一口气补上 ${placed} 块，当前阶段 ${BLUEPRINT_LABELS[getBlueprintStage()]}。`;
    }
    updateHud();
  }

  function performSmartAction() {
    if (introVisible) {
      introVisible = false;
      syncIntro();
    }
    smartActions += 1;
    maybeAdvanceCampEvent("任务推进");
    const next = getNextGoal();
    if (!next) {
      lastTip = "营地循环已跑通：可以继续扩建，或等夜色加压。";
      updateHud();
      return;
    }

    if (acquired.stick < 2) return harvestResource("stick");
    if (acquired.stone < 2) return harvestResource("pebble");
    if (harvested.tree < 1) return harvestResource("tree");
    if (!crafted.axe) {
      if (resources.stick < 2) return harvestResource("stick");
      if (resources.stone < 2) return harvestResource("pebble");
      craftAxe();
      return;
    }
    if (!crafted.campfire) {
      if (resources.wood < 3) return harvestResource("tree");
      if (resources.stone < 2) return harvestResource("stone");
      craftCampfire();
      return;
    }
    if (placedCounts.wood < 3) return buildBlueprintBatch("wood", 3, "tree");
    if (placedCounts.lamp < 1) return buildBlueprintBatch("lamp", 1, resources.lamp > 0 ? "stone" : "crate", 1);
    if (placedCounts.leaf < 4) return buildBlueprintBatch("leaf", 4, "bush");
    if (acquired.berry < 3) return harvestResource("bush");
    if (!stats.isNight) {
      forcedDayProgress = 0.88;
      updateTime(performance.now());
      updateSurvival(16);
      updateLighting();
      lastTip = "扎营等到夜晚：检查篝火、营灯和树篱。";
      updateHud();
      return;
    }
    if (!crafted.bow) {
      if (resources.stick < 2) return harvestResource("stick");
      if (resources.leaf < 1) return harvestResource("bush");
      craftBow();
      return;
    }
    if (harvested.deer + harvested.boar + harvested.wolf < 1) return harvestResource("deer");
    if (resources.meat > 0 && acquired.cookedMeat < 1) {
      cookMeat();
      return;
    }
    if (!crafted.armor) {
      if (resources.hide < 2) return harvestResource(harvested.boar < 1 ? "boar" : "wolf");
      if (resources.bone < 1) return harvestResource("zombie");
      craftArmor();
      return;
    }
    if (!crafted.pickaxe) {
      if (resources.stick < 2) return harvestResource("stick");
      if (resources.stone < 3) return harvestResource("stone");
      craftPickaxe();
      return;
    }
    if (placedCounts.furnace < 1) return buildBlueprintBatch("furnace", 1, resources.coal > 0 ? "stone" : "coal", 1);
    if (acquired.coal < 1) return harvestResource("coal");
    if (acquired.ironOre < 2) return harvestResource("iron");
    if (acquired.iron < 1) {
      smeltIron();
      return;
    }
    if (placedCounts.chest < 1) return buildBlueprintBatch("chest", 1, "tree", 1);
    if (placedCounts.bed < 1) {
      if (resources.wood < 2) return harvestResource("tree");
      if (resources.hide < 1) return harvestResource("deer");
      return buildBlueprintBatch("bed", 1, "deer", 1);
    }
    if (!mapRevealed) {
      scoutMap();
      return;
    }
    if (coldSnapsManaged < 1) {
      if (stats.hunger < 45 && resources.meat > 0) {
        cookMeat();
        return;
      }
      forceColdSnap();
      return;
    }
    if (sleptNights < 1) {
      if (!stats.isNight) {
        forcedDayProgress = 0.88;
        updateTime(performance.now());
        updateSurvival(300);
        updateLighting();
        lastTip = "入夜了：床铺已经备好，可以跳过最冷的后半夜。";
        updateHud();
        return;
      }
      sleepNight();
      return;
    }
    if (computeCampScore() < 86) {
      if (placedCounts.glass < 1) return buildBlueprintBatch("glass", 1, "stone", 1);
      if (placedCounts.stone < 1) return buildBlueprintBatch("stone", 1, "stone", 1);
      return buildBlueprintBatch("leaf", placedCounts.leaf + 1, "bush", 1);
    }
    if (!projects.rainBarrel) {
      if (resources.wood < 2) return harvestResource("tree");
      if (resources.glass < 1) return harvestResource("stone");
      buildProject("rainBarrel");
      return;
    }
    if (!projects.trapline) {
      if (resources.wood < 2) return harvestResource("tree");
      if (resources.stick < 2) return harvestResource("stick");
      if (resources.bone < 1) return harvestResource("zombie");
      buildProject("trapline");
      return;
    }
    if (!projects.watchPost) {
      if (resources.wood < 4) return harvestResource("tree");
      if (resources.stone < 2) return harvestResource("stone");
      if (resources.lamp < 1) return harvestResource("crate");
      buildProject("watchPost");
      return;
    }
    if (!stewardMode) {
      toggleSteward();
      return;
    }
    if (stewardActions < 3) {
      performStewardAction();
      return;
    }
    if (expeditions.forest < 1) {
      sendExpedition("forest");
      return;
    }
    if (expeditions.mine < 1) {
      sendExpedition("mine");
      return;
    }
    if (expeditions.hunt < 1) {
      sendExpedition("hunt");
      return;
    }
    if (computeSecurityScore() < 120) {
      performStewardAction();
      return;
    }
    lastTip = `当前任务：${next.title}`;
    updateHud();
  }

  function ensureAndPlace(kind: BlockKind, fallback: HarvestKind) {
    if (!canAfford(kind)) {
      harvestResource(fallback);
      return;
    }
    const spot = findAutoBuildSpot(kind);
    if (!spot) {
      lastTip = "营地附近没有空位，手动拆一点再继续扩建。";
      updateHud();
      return;
    }
    placeBlock(spot[0], spot[1], kind);
  }

  function findAutoBuildSpot(kind: BlockKind) {
    for (const spot of AUTO_BUILD_PLAN[kind]) {
      if (!blocks.has(`${spot[0]},${spot[1]}`)) return spot;
    }
    for (let z = 4; z <= 7; z += 1) {
      for (let x = -4; x <= 3; x += 1) {
        if (!blocks.has(`${x},${z}`)) return [x, z] as [number, number];
      }
    }
    return null;
  }

  function collectNearbyPickups() {
    let collected = 0;
    for (const object of [...harvestables]) {
      if (!object.userData.pickup) continue;
      const dx = object.position.x - target.x;
      const dz = object.position.z - target.z;
      if (Math.hypot(dx, dz) > 1.25) continue;
      harvestResource(object.userData.harvest, object);
      removeHarvestable(object);
      collected += 1;
    }
    if (collected > 0) {
      autoPickupCount += collected;
      lastTip = `靠近拾取：自动收起 ${collected} 个资源点`;
      updateHud();
    }
  }

  function removeBlockAtPointer(event: PointerEvent) {
    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(placedBlocks, false);
    const hit = hits[0]?.object;
    if (!(hit instanceof THREE.Mesh)) return;
    removeBlock(hit);
  }

  function getGroundPoint(event: PointerEvent) {
    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);
    const hitPoint = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(groundPlane, hitPoint)) return null;
    const x = THREE.MathUtils.clamp(Math.round(hitPoint.x), -GRID_LIMIT, GRID_LIMIT);
    const z = THREE.MathUtils.clamp(Math.round(hitPoint.z), -GRID_LIMIT, GRID_LIMIT);
    return { x, z };
  }

  function updatePointer(event: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function placeBlock(x: number, z: number, kind: BlockKind, free = false) {
    if (!free && !canAfford(kind)) {
      lastTip = `${MATERIALS[kind].name}材料不足：需要 ${costText(kind)}`;
      updateHud();
      return false;
    }
    const key = `${x},${z}`;
    if (blocks.has(key)) removeBlock(blocks.get(key)!);
    if (!free) spendResources(kind);
    const block = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), blockMaterials[kind]);
    block.position.set(x, 0.5, z);
    block.castShadow = true;
    block.receiveShadow = true;
    block.userData.kind = kind;
    scene.add(block);
    blocks.set(key, block);
    placedBlocks.push(block);
    if (kind === "lamp") {
      const light = new THREE.PointLight(0xffc66d, 2.4, 8);
      light.position.set(0, 0.95, 0);
      block.add(light);
      block.scale.set(0.72, 0.72, 0.72);
    } else if (kind === "chest") {
      block.scale.set(0.9, 0.55, 0.72);
      const band = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.08, 0.12), blockMaterials.stone);
      band.position.y = 0.58;
      block.add(band);
    } else if (kind === "furnace") {
      block.scale.set(0.9, 0.88, 0.9);
      const mouth = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.28, 0.04),
        new THREE.MeshBasicMaterial({ color: 0xff8b3d, transparent: true, opacity: 0.78 }),
      );
      mouth.position.set(0, 0.05, -0.52);
      block.add(mouth);
      const glow = new THREE.PointLight(0xff8b3d, 1.6, 5);
      glow.position.set(0, 0.2, -0.5);
      block.add(glow);
    } else if (kind === "bed") {
      block.scale.set(1.2, 0.32, 1.7);
      const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.18, 0.32), blockMaterials.glass);
      pillow.position.set(0, 0.62, -0.42);
      block.add(pillow);
    }
    placedCounts[kind] += 1;
    stats.armor = computeArmor();
    lastTip = `放置 ${MATERIALS[kind].name}`;
    if (!free) updateHud();
    return true;
  }

  function removeBlock(block: THREE.Mesh) {
    const key = `${Math.round(block.position.x)},${Math.round(block.position.z)}`;
    const kind = block.userData.kind as BlockKind | undefined;
    blocks.delete(key);
    const index = placedBlocks.indexOf(block);
    if (index >= 0) placedBlocks.splice(index, 1);
    scene.remove(block);
    block.geometry.dispose();
    if (kind) {
      placedCounts[kind] = Math.max(0, placedCounts[kind] - 1);
      refundResources(kind);
      stats.armor = computeArmor();
      lastTip = `拆除 ${MATERIALS[kind].name}，返还材料`;
    }
    updateHud();
  }

  function canAfford(kind: BlockKind) {
    return canAffordCost(BUILD_COSTS[kind]);
  }

  function canAffordCost(cost: Partial<Record<ResourceKind, number>>) {
    return Object.entries(cost).every(([resource, amount]) => resources[resource as ResourceKind] >= amount);
  }

  function spendResources(kind: BlockKind) {
    spendCost(BUILD_COSTS[kind]);
  }

  function spendCost(cost: Partial<Record<ResourceKind, number>>) {
    for (const [resource, amount] of Object.entries(cost)) {
      resources[resource as ResourceKind] -= amount;
    }
  }

  function refundResources(kind: BlockKind) {
    for (const [resource, amount] of Object.entries(BUILD_COSTS[kind])) {
      resources[resource as ResourceKind] += amount;
    }
  }

  function isObjectRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  function copyNumberRecord<T extends string>(target: Record<T, number>, source: unknown) {
    if (!isObjectRecord(source)) return;
    for (const key of Object.keys(target) as T[]) {
      const value = source[key];
      if (typeof value === "number" && Number.isFinite(value)) target[key] = Math.round(value);
    }
  }

  function copyBooleanRecord<T extends string>(target: Record<T, boolean>, source: unknown) {
    if (!isObjectRecord(source)) return;
    for (const key of Object.keys(target) as T[]) {
      if (typeof source[key] === "boolean") target[key] = source[key];
    }
  }

  function isBlockKind(value: unknown): value is BlockKind {
    return typeof value === "string" && BLOCK_KEYS.includes(value as BlockKind);
  }

  function isCampEventKind(value: unknown): value is CampEventKind {
    return typeof value === "string" && value in CAMP_EVENT_DEFS;
  }

  function makeCabinSave(): CabinSaveState {
    return {
      version: 1,
      savedAt: Date.now(),
      selected,
      resources: { ...resources },
      acquired: { ...acquired },
      harvested: { ...harvested },
      crafted: { ...crafted },
      stats: { ...stats },
      shelter: { ...shelter },
      placedBlocks: placedBlocks.map((block) => ({
        kind: block.userData.kind as BlockKind,
        x: Math.round(block.position.x),
        z: Math.round(block.position.z),
      })),
      target: { x: Number(target.x.toFixed(2)), z: Number(target.z.toFixed(2)) },
      dayProgress: Number(dayProgress.toFixed(3)),
      mapRevealed,
      mapChecks,
      sleptNights,
      safeNightSecured,
      coldSnapsManaged,
      projects: { ...projects },
      expeditions: { ...expeditions },
      stewardMode,
      stewardActions,
      autopilotActions,
      blueprintMode,
      blueprintActions,
      blueprintPieces,
      packPrepared,
      provisions,
      smartActions,
      autoPickupCount,
      activeEvent,
      eventActions,
      eventHistory: [...eventHistory],
      commandActions,
      commandHistory: [...commandHistory],
      lastCommandPlan,
      routineActions,
      routinePlan,
      routineHistory: [...routineHistory],
      shelterFixes,
      lastTip,
    };
  }

  function saveCabinSnapshot(force = false) {
    const now = performance.now();
    if (!force && lastSaveAt > 0 && now - lastSaveAt < 20_000) return;
    try {
      const snapshot = makeCabinSave();
      localStorage.setItem(CABIN_SAVE_KEY, JSON.stringify(snapshot));
      autosaves += 1;
      lastSaveAt = now;
      lastSavedBlocks = snapshot.placedBlocks.length;
    } catch {
      lastTip = "本地快照写入失败，但本轮进度仍在内存中。";
    }
  }

  function restoreCabinSnapshot() {
    let snapshot: unknown;
    try {
      const raw = localStorage.getItem(CABIN_SAVE_KEY);
      if (!raw) return;
      snapshot = JSON.parse(raw);
    } catch {
      return;
    }
    if (!isObjectRecord(snapshot) || snapshot.version !== 1) return;
    const save = snapshot as Partial<CabinSaveState>;

    if (isBlockKind(save.selected)) selected = save.selected;
    copyNumberRecord(resources, save.resources);
    copyNumberRecord(acquired, save.acquired);
    copyNumberRecord(harvested, save.harvested);
    copyBooleanRecord(crafted, save.crafted);
    if (save.stats) Object.assign(stats, save.stats);
    if (save.shelter) Object.assign(shelter, save.shelter);

    mapRevealed = Boolean(save.mapRevealed);
    mapChecks = Math.max(0, Math.round(save.mapChecks ?? mapChecks));
    sleptNights = Math.max(0, Math.round(save.sleptNights ?? sleptNights));
    safeNightSecured = Boolean(save.safeNightSecured);
    coldSnapsManaged = Math.max(0, Math.round(save.coldSnapsManaged ?? coldSnapsManaged));
    stewardMode = Boolean(save.stewardMode);
    stewardActions = Math.max(0, Math.round(save.stewardActions ?? stewardActions));
    autopilotActions = Math.max(0, Math.round(save.autopilotActions ?? autopilotActions));
    blueprintMode = save.blueprintMode ?? blueprintMode;
    blueprintActions = Math.max(0, Math.round(save.blueprintActions ?? blueprintActions));
    blueprintPieces = Math.max(0, Math.round(save.blueprintPieces ?? blueprintPieces));
    packPrepared = Math.max(0, Math.round(save.packPrepared ?? packPrepared));
    provisions = Math.max(0, Math.round(save.provisions ?? provisions));
    smartActions = Math.max(0, Math.round(save.smartActions ?? smartActions));
    autoPickupCount = Math.max(0, Math.round(save.autoPickupCount ?? autoPickupCount));
    commandActions = Math.max(0, Math.round(save.commandActions ?? commandActions));
    routineActions = Math.max(0, Math.round(save.routineActions ?? routineActions));
    shelterFixes = Math.max(0, Math.round(save.shelterFixes ?? shelterFixes));
    lastCommandPlan = typeof save.lastCommandPlan === "string" ? save.lastCommandPlan : lastCommandPlan;
    routinePlan = typeof save.routinePlan === "string" ? save.routinePlan : routinePlan;
    lastTip = typeof save.lastTip === "string" ? `读取本地快照：${save.lastTip}` : "读取本地营地快照。";

    copyBooleanRecord(projects, save.projects);
    copyNumberRecord(expeditions, save.expeditions);
    for (const kind of Object.keys(projects) as ProjectKind[]) {
      if (projects[kind] && !projectGroups.has(kind)) {
        const group = createProjectGroup(kind);
        projectGroups.set(kind, group);
        scene.add(group);
      }
    }

    if (typeof save.dayProgress === "number" && Number.isFinite(save.dayProgress)) {
      dayProgress = THREE.MathUtils.clamp(save.dayProgress, 0, 0.99);
      lastCycle = dayProgress;
    }
    if (save.target && typeof save.target.x === "number" && typeof save.target.z === "number") {
      target.x = THREE.MathUtils.clamp(save.target.x, -5.5, 5.5);
      target.z = THREE.MathUtils.clamp(save.target.z, -5.5, 5.5);
    }
    if (isCampEventKind(save.activeEvent)) activeEvent = save.activeEvent;
    eventActions = Math.max(0, Math.round(save.eventActions ?? eventActions));
    eventHistory.splice(0, eventHistory.length, ...(Array.isArray(save.eventHistory) ? save.eventHistory.slice(-6) : eventHistory));
    commandHistory.splice(0, commandHistory.length, ...(Array.isArray(save.commandHistory) ? save.commandHistory.slice(-7) : commandHistory));
    routineHistory.splice(0, routineHistory.length, ...(Array.isArray(save.routineHistory) ? save.routineHistory.slice(-6) : routineHistory));

    for (const block of save.placedBlocks ?? []) {
      if (!block || !isBlockKind(block.kind)) continue;
      if (!Number.isFinite(block.x) || !Number.isFinite(block.z)) continue;
      placeBlock(Math.round(block.x), Math.round(block.z), block.kind, true);
    }
    stats.armor = computeArmor();
    if (mapRevealed) mapMarkers.visible = true;
    renderCampEvent(activeEvent);
    eventBeacon.visible = !introVisible;
    saveRestored = true;
    lastSavedBlocks = placedBlocks.length;
  }

  function computeArmor() {
    return Math.min(88, (crafted.armor ? 24 : 8) + placedCounts.stone * 5 + placedCounts.leaf * 2 + placedCounts.lamp * 8 + (projects.watchPost ? 6 : 0));
  }

  function computeWarmth() {
    return Math.min(
      92,
      (crafted.campfire ? 26 : 0) +
        placedCounts.wood * 3 +
        placedCounts.stone * 4 +
        placedCounts.glass * 3 +
        placedCounts.lamp * 10 +
        placedCounts.furnace * 8 +
        placedCounts.bed * 14 +
        (projects.watchPost ? 6 : 0),
    );
  }

  function computeCampScore() {
    return clampStat(
      18 +
        placedCounts.wood * 4 +
        placedCounts.stone * 5 +
        placedCounts.leaf * 3 +
        placedCounts.glass * 4 +
        placedCounts.lamp * 13 +
        placedCounts.chest * 10 +
        placedCounts.furnace * 12 +
        placedCounts.bed * 18 +
        (crafted.campfire ? 12 : 0) +
        (mapRevealed ? 6 : 0) +
        (projects.rainBarrel ? 8 : 0) +
        (projects.trapline ? 10 : 0) +
        (projects.watchPost ? 14 : 0),
    );
  }

  function computeShelterGrade() {
    const average = (shelter.dryness + shelter.warmth + shelter.morale + Math.max(0, 100 - shelter.noise)) / 4;
    if (average >= 82) return "安稳";
    if (average >= 64) return "可住";
    if (average >= 46) return "潮冷";
    return "危险";
  }

  function getShelterPlan() {
    if (shelter.dryness < 50) return "先补屋顶/床铺，雨天会加速寒冷";
    if (shelter.warmth < 50) return "先补炉火/营灯，夜里体温掉得快";
    if (shelter.noise > 58) return "先收拾噪音，狼群会更快靠近";
    if (shelter.morale < 54) return "先整理背包和床铺，日程效率偏低";
    return "营地状态稳定，可以扩建或远征";
  }

  function getShelterNeed(): ShelterNeed | null {
    if (shelter.dryness < 50) return "dryness";
    if (shelter.warmth < 50) return "warmth";
    if (shelter.noise > 58) return "noise";
    if (shelter.morale < 54) return "morale";
    return null;
  }

  function getShelterNeedLabel(need: ShelterNeed) {
    if (need === "dryness") return "修屋顶";
    if (need === "warmth") return "补炉火";
    if (need === "noise") return "静音巡线";
    return "整理床铺";
  }

  function applyShelterFix(need: ShelterNeed) {
    const label = getShelterNeedLabel(need);
    if (need === "dryness") {
      if (canAffordCost(PACK_RECIPES.find((recipe) => recipe.kind === "repairKit")!.cost)) {
        preparePack("repairKit");
      } else if (resources.wood >= 1 && resources.leaf >= 1) {
        resources.wood -= 1;
        resources.leaf -= 1;
        shelter.dryness = clampStat(shelter.dryness + 12);
        stats.cold = clampStat(stats.cold - 4);
        lastTip = "屋况维护：补屋顶、塞墙缝，雨天不再直灌床铺。";
        updateHud();
      } else {
        harvestResource(resources.wood < 1 ? "tree" : "bush");
      }
    } else if (need === "warmth") {
      if (canAffordCost(PACK_RECIPES.find((recipe) => recipe.kind === "winterKit")!.cost)) {
        preparePack("winterKit");
      } else if (crafted.campfire) {
        if (resources.coal > 0) resources.coal -= 1;
        shelter.warmth = clampStat(shelter.warmth + 14);
        stats.cold = clampStat(stats.cold - 10);
        lastTip = "屋况维护：添柴压火，余温回到小屋里。";
        updateHud();
      } else {
        craftCampfire();
      }
    } else if (need === "noise") {
      if (!mapRevealed) scoutMap();
      shelter.noise = clampStat(shelter.noise - 12);
      stats.wolfPressure = clampStat(stats.wolfPressure - 8);
      lastTip = "屋况维护：收起响动工具，沿狼径静音巡线。";
      updateHud();
    } else if (canAffordCost(PACK_RECIPES.find((recipe) => recipe.kind === "fieldMeal")!.cost)) {
      preparePack("fieldMeal");
    } else if (resources.berry > 0 && stats.hunger < 100) {
      eatBerry();
      shelter.morale = clampStat(shelter.morale + 6);
      lastTip = "屋况维护：吃点浆果、整理火边，士气回升。";
      updateHud();
    } else {
      shelter.morale = clampStat(shelter.morale + 10);
      stats.health = clampStat(stats.health + 3);
      lastTip = "屋况维护：整理床铺和背包，营地节奏稳下来。";
      updateHud();
    }
    shelterFixes += 1;
    return label;
  }

  function getShelterFocus() {
    const scores = [
      { label: "干燥", score: shelter.dryness },
      { label: "余温", score: shelter.warmth },
      { label: "噪音", score: 100 - shelter.noise },
      { label: "士气", score: shelter.morale },
    ].sort((left, right) => left.score - right.score);
    return `短板 ${scores[0].label}`;
  }

  function computeSecurityScore() {
    return Math.round(
      THREE.MathUtils.clamp(
        computeCampScore() * 0.55 +
          stats.armor +
          (mapRevealed ? 8 : 0) +
          (projects.rainBarrel ? 6 : 0) +
          (projects.trapline ? 14 : 0) +
          (projects.watchPost ? 30 : 0) +
          Math.min(18, stewardActions * 2) -
          stats.wolfPressure * 0.18 -
          stats.cold * 0.08 +
          shelter.dryness * 0.08 +
          shelter.warmth * 0.1 +
          shelter.morale * 0.08 -
          shelter.noise * 0.14,
        0,
        160,
      ),
    );
  }

  function getSafetyPlan() {
    const event = CAMP_EVENT_DEFS[activeEvent];
    const next = getNextGoal();
    const risk =
      stats.cold >= 56 ? "先保温" :
      stats.wolfPressure >= stats.armor ? "先压狼压" :
      stats.hunger <= 38 ? "先补食物" :
      computeShelterGrade() === "危险" ? "先稳小屋" :
      computeSecurityScore() < 86 ? "先补防护" :
      "可以扩建";
    return `${event.title} · ${risk} · ${computeShelterGrade()} · 蓝图${BLUEPRINT_LABELS[getBlueprintStage()]} · 下步 ${next?.title ?? "自由巡逻"}`;
  }

  function pulseObject(object: THREE.Object3D) {
    const base = object.userData.baseScale as THREE.Vector3 | undefined;
    if (!base) return;
    object.scale.copy(base).multiplyScalar(1.1);
    window.setTimeout(() => {
      object.scale.copy(base);
    }, 120);
  }

  function updateCamera() {
    const x = target.x + Math.sin(cameraState.theta) * Math.sin(cameraState.phi) * cameraState.radius;
    const y = target.y + Math.cos(cameraState.phi) * cameraState.radius;
    const z = target.z + Math.cos(cameraState.theta) * Math.sin(cameraState.phi) * cameraState.radius;
    camera.position.set(x, y, z);
    camera.lookAt(target);
    player.position.set(target.x, 0, target.z);
    player.rotation.y = cameraState.theta + Math.PI;
    collectNearbyPickups();
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const dt = Math.min(now - lastFrame, 80);
    lastFrame = now;
    updateTime(now);
    updateWeather(now);
    if (stewardMode && now >= nextStewardAt) {
      performStewardAction();
      nextStewardAt = now + 4_000;
    }
    if (autopilotMode && now >= nextAutopilotAt) {
      autopilotActions += 1;
      performSmartAction();
      nextAutopilotAt = now + (getNextGoal() ? 780 : 1_800);
    }
    updateSurvival(dt);
    updateWolf(now);
    updateLighting();
    updateWeatherVisual(now);
    updateFireflies(now);
    updateCabinAtmosphere(now);
    updateCampEventVisual(now);
    updateWorldLabels(now);
    updateGuideTrail(now);
    updateNearbyMarker(now);
    updateWolfTrail(now);
    updateHarvestPopups(now);
    updateShelterAura(now);
    updateToolSwing(now);
    updateHandRig(now);
    updateSurvivalVignette();
    renderer.render(scene, camera);
  }

  function updateTime(now: number) {
    if (forcedDayProgress !== null) {
      dayProgress = forcedDayProgress;
    } else {
      dayProgress = (((now - startTime) % DAY_LENGTH_MS) / DAY_LENGTH_MS + 0.28) % 1;
      if (dayProgress < lastCycle && lastCycle - dayProgress > 0.35) stats.day += 1;
      lastCycle = dayProgress;
    }
    stats.isNight = dayProgress < 0.18 || dayProgress > 0.78;
  }

  function updateWeather(now: number) {
    if (now < weatherOverrideUntil) return;
    if (stats.day >= 3 && stats.isNight && stats.day % 3 === 0) {
      weather = "coldSnap";
    } else if (dayProgress > 0.44 && dayProgress < 0.66) {
      weather = "rain";
    } else {
      weather = "clear";
    }
  }

  function updateSurvival(dt: number) {
    const warmth = computeWarmth();
    const campScore = computeCampScore();
    const drynessTarget = THREE.MathUtils.clamp(
      58 + placedCounts.wood * 4 + placedCounts.glass * 8 + placedCounts.bed * 7 + (projects.rainBarrel ? 8 : 0) - (weather === "rain" ? 34 : weather === "coldSnap" ? 16 : 0),
      0,
      100,
    );
    const warmthTarget = THREE.MathUtils.clamp(34 + warmth * 0.72 + placedCounts.lamp * 4 + placedCounts.bed * 5 - (stats.isNight ? 8 : 0), 0, 100);
    const noiseTarget = THREE.MathUtils.clamp(
      18 + Math.max(0, stats.wolfPressure - stats.armor) * 0.34 + (stats.isNight ? 9 : 0) + (weather === "rain" ? 4 : 0) - (projects.watchPost ? 8 : 0) - Math.min(14, stewardActions * 0.7),
      0,
      100,
    );
    const moraleTarget = THREE.MathUtils.clamp(48 + campScore * 0.28 + provisions * 2 + placedCounts.bed * 7 - stats.cold * 0.22 - shelter.noise * 0.18, 0, 100);
    shelter.dryness = clampStat(THREE.MathUtils.lerp(shelter.dryness, drynessTarget, 0.04));
    shelter.warmth = clampStat(THREE.MathUtils.lerp(shelter.warmth, warmthTarget, 0.05));
    shelter.noise = clampStat(THREE.MathUtils.lerp(shelter.noise, noiseTarget, 0.035));
    shelter.morale = clampStat(THREE.MathUtils.lerp(shelter.morale, moraleTarget, 0.035));
    const weatherCold = weather === "coldSnap" ? 70 : weather === "rain" ? 30 : 10;
    const nightCold = stats.isNight ? 26 : 0;
    const coldTarget = Math.max(0, weatherCold + nightCold - warmth - campScore * 0.12 - shelter.dryness * 0.08 - shelter.warmth * 0.12);
    stats.cold = clampStat(THREE.MathUtils.lerp(stats.cold, coldTarget, weather === "coldSnap" ? 0.07 : 0.035));
    const foodRelief = (projects.rainBarrel ? 0.00022 : 0) + (projects.trapline ? 0.00018 : 0);
    stats.hunger = clampStat(stats.hunger - dt * Math.max(0.0007, 0.0013 + (stats.cold > 55 ? 0.0008 : 0) - foodRelief - shelter.morale * 0.000002));
    const campfireRelief = crafted.campfire ? 12 : 0;
    const weatherPressure = weather === "coldSnap" ? 14 : weather === "rain" ? 6 : 0;
    const projectRelief = (projects.trapline ? 6 : 0) + (projects.watchPost ? 18 : 0);
    const nightPressure = stats.isNight ? Math.max(0, 42 + weatherPressure + shelter.noise * 0.16 - campfireRelief - projectRelief - placedCounts.lamp * 28 - placedCounts.leaf * 3 - placedCounts.stone * 1.5) : 0;
    stats.wolfPressure = clampStat(THREE.MathUtils.lerp(stats.wolfPressure, nightPressure, 0.035));
    if (stats.hunger <= 0) stats.health = clampStat(stats.health - dt * 0.004);
    if (stats.cold > 76) stats.health = clampStat(stats.health - (stats.cold - 76) * dt * 0.00055);
    if (stats.wolfPressure > stats.armor) stats.health = clampStat(stats.health - (stats.wolfPressure - stats.armor) * dt * 0.00035);
    stats.armor = computeArmor();
    if (stats.isNight && stats.health >= 70 && placedCounts.lamp >= 1) safeNightSecured = true;
    if (weather === "coldSnap" && stats.health >= 70 && stats.cold <= 58 && warmth >= 48 && placedCounts.bed >= 1) {
      coldSnapsManaged = Math.max(coldSnapsManaged, 1);
    }
    updateSurvivalVignette();
    if (Math.floor(performance.now() / 500) % 2 === 0) updateHud();
  }

  function updateWolf(now: number) {
    const pressure = stats.wolfPressure / 100;
    const radius = THREE.MathUtils.lerp(10.5, 5.2, pressure);
    const angle = now * 0.00042;
    wolf.position.set(target.x + Math.cos(angle) * radius, 0, target.z + Math.sin(angle * 0.9) * radius);
    wolf.scale.setScalar(0.95 + pressure * 0.28);
    wolf.lookAt(target.x, 0.45, target.z);
  }

  function updateLighting() {
    const sunArc = Math.sin(dayProgress * Math.PI);
    const daylight = THREE.MathUtils.clamp(THREE.MathUtils.smoothstep(sunArc, 0.16, 0.95), 0.06, 1);
    const skyDay = new THREE.Color(0x8bc7ff);
    const skyNight = new THREE.Color(0x10213a);
    const skyRain = new THREE.Color(0x5d7f86);
    const skyCold = new THREE.Color(0xc8ddeb);
    const weatherTint = weather === "coldSnap" ? skyCold : weather === "rain" ? skyRain : skyDay;
    const sky = new THREE.Color().lerpColors(skyNight, weatherTint, daylight);
    scene.background = sky;
    scene.fog = new THREE.Fog(sky, weather === "clear" ? 16 : 11, weather === "clear" ? 46 : 34);
    const weatherDim = weather === "clear" ? 1 : weather === "rain" ? 0.82 : 0.72;
    ambient.intensity = (0.72 + daylight * 1.5) * weatherDim;
    sun.intensity = (0.4 + daylight * 2.2) * weatherDim;
    sun.position.x = 8 + Math.sin(dayProgress * Math.PI * 2) * 3;
    sun.position.y = 4 + daylight * 10;
  }

  function updateWeatherVisual(now: number) {
    weatherRig.visible = weather !== "clear";
    if (!weatherRig.visible) return;
    weatherRig.position.set(target.x, 0, target.z);
    const isCold = weather === "coldSnap";
    for (const child of weatherRig.children) {
      if (!(child instanceof THREE.Mesh)) continue;
      const seed = Number(child.userData.seed ?? 0);
      const fall = (now * (isCold ? 0.00008 : 0.00018) + seed * 0.013) % 1;
      child.position.y = 5.4 - fall * 5.2;
      child.position.x = Math.sin(seed + now * 0.00034) * (isCold ? 8.4 : 9.2);
      child.position.z = Math.cos(seed * 1.7 + now * 0.0002) * (isCold ? 8.4 : 9.2);
      child.rotation.z = isCold ? Math.sin(now * 0.001 + seed) * 0.65 : -0.22;
      child.scale.setScalar(isCold ? 0.72 : 1);
      const material = child.material;
      if (material instanceof THREE.MeshStandardMaterial) {
        material.color.setHex(isCold ? 0xe8f9ff : 0x9ed8ff);
        material.emissive.setHex(isCold ? 0x6e93a3 : 0x244a5f);
        material.opacity = isCold ? 0.82 : 0.62;
      }
    }
  }

  function updateFireflies(now: number) {
    const nightGlow = stats.isNight ? 1 : 0.42;
    const weatherGlow = weather === "clear" ? 1 : weather === "rain" ? 0.72 : 0.9;
    fireflies.visible = nightGlow * weatherGlow > 0.18;
    for (const child of fireflies.children) {
      if (!(child instanceof THREE.Mesh)) continue;
      const seed = Number(child.userData.seed ?? 0);
      const baseX = Number(child.userData.baseX ?? child.position.x);
      const baseZ = Number(child.userData.baseZ ?? child.position.z);
      child.position.x = baseX + Math.sin(now * 0.0008 + seed) * 0.42;
      child.position.z = baseZ + Math.cos(now * 0.0007 + seed * 0.7) * 0.38;
      child.position.y = 0.88 + Math.sin(now * 0.0015 + seed) * 0.48 + (seed % 5) * 0.1;
      const pulse = 0.72 + Math.sin(now * 0.004 + seed) * 0.28;
      child.scale.setScalar(0.82 + pulse * 0.42);
      const material = child.material;
      if (material instanceof THREE.MeshBasicMaterial) {
        material.opacity = THREE.MathUtils.clamp(0.18 + pulse * 0.48 * nightGlow * weatherGlow, 0.16, 0.78);
      }
    }
  }

  function updateCabinAtmosphere(now: number) {
    for (const puff of chimneySmoke) {
      const seed = Number(puff.userData.smokeSeed ?? 0);
      const lift = (now * 0.00012 + seed * 0.13) % 1;
      puff.position.x = 1.25 + Math.sin(now * 0.0008 + seed) * 0.16;
      puff.position.y = 4.68 + lift * 1.36;
      puff.position.z = 0.25 + Math.cos(now * 0.0006 + seed) * 0.12;
      puff.scale.setScalar(0.72 + lift * 1.05);
      const material = puff.material;
      if (material instanceof THREE.MeshBasicMaterial) {
        material.opacity = (0.26 - lift * 0.17) * (introVisible ? 1 : 0.78);
      }
    }
    for (const glow of warmWindowGlows) {
      const pulse = 0.42 + Math.sin(now * 0.0022 + glow.position.x) * 0.08;
      const material = glow.material;
      if (material instanceof THREE.MeshBasicMaterial) material.opacity = pulse;
    }
  }

  function formatClock(progress: number) {
    const hour = Math.floor((progress * 24 + 5) % 24);
    const minute = Math.floor(((progress * 24 + 5) % 1) * 60);
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  function goalContext(): GoalContext {
    return {
      resources,
      acquired,
      placedCounts,
      harvested,
      crafted,
      stats,
      campScore: computeCampScore(),
      mapRevealed,
      mapChecks,
      sleptNights,
      safeNightSecured,
      coldSnapsManaged,
      projects,
      expeditions,
      stewardMode,
      stewardActions,
      provisions,
      securityScore: computeSecurityScore(),
    };
  }

  function getDoneGoals() {
    return GOALS.filter((goal) => goal.check(goalContext()));
  }

  function getNextGoal() {
    return GOALS.find((goal) => !goal.check(goalContext()));
  }

  function getDebugState(): CabinDebugState {
    const doneGoals = getDoneGoals();
    const nextGoal = getNextGoal();
    const guide = getGuideTarget();
    const focus = getFocusSignal(guide);
    const mapMarkersForDebug = getMiniMapMarkers(guide);
    const nearbyHarvestable = getNearbyHarvestable();
    const markerHarvestable = getNearbyHarvestable(3.2);
    return {
      mode: "cabin",
      blocks: placedBlocks.length,
      selected,
      selectedTitle: MATERIALS[selected].name,
      selectedCost: costText(selected),
      heldPreview: heldPreview?.visible ? MATERIALS[selected].name : "无",
      handRigVisible: handRig.visible,
      handRigTool,
      handRigMotion,
      handRigParts: handRig.children.length,
      quickSlots: BLOCK_KEYS.map((kind, index) => `${index + 1}:${MATERIALS[kind].name}`),
      landmarkLabels: landmarkLabels.length,
      resources: { ...resources },
      acquired: { ...acquired },
      placedCounts: { ...placedCounts },
      harvested: { ...harvested },
      crafted: { ...crafted },
      smartActions,
      autoPickupCount,
      goalsCompleted: doneGoals.length,
      goalIdsDone: doneGoals.map((goal) => goal.id),
      nextGoal: nextGoal?.id ?? "freeplay",
      stats: { ...stats },
      shelter: { ...shelter },
      shelterGrade: computeShelterGrade(),
      shelterPlan: getShelterPlan(),
      shelterFocus: getShelterFocus(),
      shelterFixes,
      weather,
      campScore: computeCampScore(),
      mapRevealed,
      mapChecks,
      sleptNights,
      safeNightSecured,
      coldSnapsManaged,
      projects: { ...projects },
      expeditions: { ...expeditions },
      stewardMode,
      stewardActions,
      autopilotMode,
      autopilotActions,
      blueprintMode,
      blueprintStage: getBlueprintStage(),
      blueprintActions,
      blueprintPieces,
      blueprintGhosts: updateBlueprintMarkers(),
      packOpen,
      packActions,
      packPrepared,
      packReady: packReadyCount(),
      packRecipes: PACK_RECIPES.filter((recipe) => canAffordCost(recipe.cost)).map((recipe) => recipe.title),
      provisions,
      securityScore: computeSecurityScore(),
      introVisible,
      introWorldLabelsHidden: introVisible && landmarkLabels.every((label) => !label.visible),
      introBeaconHidden: introVisible && !eventBeacon.visible,
      introBlueprintHidden: introVisible && !blueprintMarkers.visible,
      introBriefItems: intro.querySelectorAll(".cabin-intro-brief span").length,
      reticleVisible: !introVisible,
      reticlePrompt: reticle.querySelector("[data-cabin-reticle-prompt]")?.textContent || "",
      actionRingCharge: Number.parseInt(reticle.querySelector<HTMLElement>("[data-cabin-reticle-ring]")?.style.getPropertyValue("--charge") || "0", 10),
      autosaves,
      saveRestored,
      saveBlocks: lastSavedBlocks,
      saveAgeSec: lastSaveAt > 0 ? Math.round((performance.now() - lastSaveAt) / 1000) : -1,
      cabinAtmospherePieces: cabinAtmosphere.length,
      chimneySmokePuffs: chimneySmoke.length,
      warmWindowGlows: warmWindowGlows.length,
      mapFocusMode,
      minimapMarkers: mapMarkersForDebug.length,
      guideTitle: guide.title,
      guideDistance: guide.distance,
      guideTrailDots: guideTrail.children.filter((child) => child.userData.guideDot && child.visible).length,
      fireflyCount: fireflies.children.length,
      nearbyHint: getNearbyHint(mapMarkersForDebug),
      nearbyAction: getNearbyActionText(),
      nearbyActionDistance: nearbyHarvestable ? Number(nearbyHarvestable.distance.toFixed(2)) : -1,
      nearbyMarkerVisible: nearbyMarker.visible,
      nearbyTargetTitle: markerHarvestable ? HARVEST_LABELS[markerHarvestable.kind] : "无",
      nearbyInteractions,
      lastNearbyAction,
      harvestPopupCount: harvestPopups.length,
      lastHarvestPopup,
      toolSwingVisible: toolSwing.visible,
      toolSwingCount,
      lastToolSwing,
      shelterAuraVisible: shelterAura.visible,
      shelterAuraTone: getShelterAuraTone(),
      shelterAuraRings: shelterAura.children.length,
      wolfTrailVisible: wolfTrail.visible,
      wolfTrailPrints: wolfTrail.children.filter((child) => child.visible).length,
      survivalVignette,
      focusTitle: focus.title,
      focusDetail: focus.detail,
      focusRisk: focus.risk,
      focusRoute: focus.route,
      focusText: focus.text,
      activeEvent,
      eventTitle: CAMP_EVENT_DEFS[activeEvent].title,
      eventHistory: [...eventHistory],
      eventActions,
      eventBeaconVisible: eventBeacon.visible,
      safetyPlan: getSafetyPlan(),
      commandMode,
      commandActions,
      commandCards: getCabinCommandCards(),
      commandHistory: [...commandHistory],
      lastCommandPlan,
      commandRisk: getCommandRisk(),
      routineMode,
      routineActions,
      routinePlan: routineActions > 0 ? routinePlan : getDailyRoutinePlan(),
      routineHistory: [...routineHistory],
      dayProgress: Number(dayProgress.toFixed(2)),
      target: { x: Number(target.x.toFixed(2)), y: Number(target.y.toFixed(2)), z: Number(target.z.toFixed(2)) },
      camera: {
        x: Number(camera.position.x.toFixed(2)),
        y: Number(camera.position.y.toFixed(2)),
        z: Number(camera.position.z.toFixed(2)),
      },
    };
  }

  function installDebugApi() {
    window.__cabinBuilderDebug = {
      state: () => getDebugState(),
      place: (x, z, kind = selected) => {
        placeBlock(Math.round(x), Math.round(z), kind);
        return getDebugState();
      },
      harvest: (type = "tree") => {
        harvestResource(type);
        return getDebugState();
      },
      eatBerry: () => {
        eatBerry();
        return getDebugState();
      },
      craftAxe: () => {
        craftAxe();
        return getDebugState();
      },
      craftCampfire: () => {
        craftCampfire();
        return getDebugState();
      },
      craftBow: () => {
        craftBow();
        return getDebugState();
      },
      craftPickaxe: () => {
        craftPickaxe();
        return getDebugState();
      },
      craftArmor: () => {
        craftArmor();
        return getDebugState();
      },
      cookMeat: () => {
        cookMeat();
        return getDebugState();
      },
      smeltIron: () => {
        smeltIron();
        return getDebugState();
      },
      scoutMap: () => {
        scoutMap();
        return getDebugState();
      },
      sleepNight: () => {
        sleepNight();
        return getDebugState();
      },
      forceWeather: (kind = "rain") => {
        forceWeather(kind);
        return getDebugState();
      },
      forceColdSnap: () => {
        forceColdSnap();
        return getDebugState();
      },
      buildProject: (kind = "rainBarrel") => {
        buildProject(kind);
        return getDebugState();
      },
      expedition: (kind = "forest") => {
        sendExpedition(kind);
        return getDebugState();
      },
      toggleSteward: () => {
        toggleSteward();
        return getDebugState();
      },
      toggleAutopilot: (force) => {
        toggleAutopilot(force);
        return getDebugState();
      },
      blueprintBuild: (pieces = 4) => {
        runBlueprintBuild(pieces);
        return getDebugState();
      },
      togglePack: (force) => {
        togglePack(force);
        return getDebugState();
      },
      packCraft: (kind) => {
        preparePack(kind);
        return getDebugState();
      },
      start: () => {
        startCabinGame();
        return getDebugState();
      },
      interact: () => {
        interactNearbyHarvestable();
        return getDebugState();
      },
      toggleMap: (force) => {
        toggleMapFocus(force);
        return getDebugState();
      },
      stewardTick: () => {
        performStewardAction();
        return getDebugState();
      },
      forceEvent: (kind = "supplyCache") => {
        triggerCampEvent(kind, "调试事件");
        return getDebugState();
      },
      command: (kind = "forage") => executeCabinCommand(kind),
      smartAction: () => {
        performSmartAction();
        return getDebugState();
      },
      autoSurvive: (steps = 18) => {
        for (let i = 0; i < steps; i += 1) performSmartAction();
        return getDebugState();
      },
      forceNight: () => {
        forcedDayProgress = 0.88;
        updateTime(performance.now());
        updateSurvival(16);
        updateLighting();
        safeNightSecured = stats.health >= 70 && placedCounts.lamp >= 1;
        updateHud();
        return getDebugState();
      },
      removeLast: () => {
        const block = placedBlocks.at(-1);
        if (block) removeBlock(block);
        return getDebugState();
      },
    };
  }
}
