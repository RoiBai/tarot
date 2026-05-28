export type TarotSuit = "swords" | "wands" | "cups" | "pentacles";
export type TarotRank = "ace" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "page" | "knight" | "queen" | "king";

export type TarotDeckCard = {
  id: string;
  arcana: "major" | "minor";
  suit?: TarotSuit;
  rank?: TarotRank;
  number?: number;
  nameEn: string;
  nameZh: string;
  imagePath: string;
  keywordsZh: string[];
  keywordsEn: string[];
  shortMeaningZh: string;
  shortMeaningEn: string;
};

const majorNames = [
  ["fool", "The Fool", "愚人", "00-fool.jpg", ["开始", "风险", "自由", "门槛", "尚未准备好"], ["beginning", "risk", "freedom", "threshold", "not ready yet"]],
  ["magician", "The Magician", "魔术师", "01-magician.jpg", ["意志", "工具", "注意力", "让事情成形", "能力"], ["will", "tools", "attention", "making real", "skill"]],
  ["high-priestess", "The High Priestess", "女祭司", "02-high-priestess.jpg", ["安静", "直觉", "隐藏感受", "等待", "尚未说出"], ["silence", "intuition", "hidden feeling", "waiting", "not yet spoken"]],
  ["empress", "The Empress", "皇后", "03-empress.jpg", ["照顾", "身体", "生长", "接收", "丰盛"], ["care", "body", "growth", "receiving", "abundance"]],
  ["emperor", "The Emperor", "皇帝", "04-emperor.jpg", ["结构", "控制", "边界", "权威", "秩序"], ["structure", "control", "boundary", "authority", "order"]],
  ["hierophant", "The Hierophant", "教皇", "05-hierophant.jpg", ["规则", "传统", "认可", "学习", "归属"], ["rule", "tradition", "approval", "learning", "belonging"]],
  ["lovers", "The Lovers", "恋人", "06-lovers.jpg", ["选择", "欲望", "关系", "一致", "价值"], ["choice", "desire", "relationship", "alignment", "values"]],
  ["chariot", "The Chariot", "战车", "07-chariot.jpg", ["方向", "自律", "压力", "前进", "控制"], ["direction", "discipline", "pressure", "movement", "control"]],
  ["strength", "Strength", "力量", "08-strength.jpg", ["温柔的力量", "耐心", "身体", "克制", "柔软"], ["soft power", "patience", "body", "restraint", "tenderness"]],
  ["hermit", "The Hermit", "隐士", "09-hermit.jpg", ["独处", "寻找", "距离", "内在光", "退后"], ["solitude", "search", "distance", "inner light", "withdrawal"]],
  ["wheel-of-fortune", "Wheel of Fortune", "命运之轮", "10-wheel-of-fortune.jpg", ["循环", "变化", "时机", "模式", "不确定"], ["cycle", "change", "timing", "pattern", "uncertainty"]],
  ["justice", "Justice", "正义", "11-justice.jpg", ["公平", "后果", "决定", "衡量", "承担"], ["fairness", "consequence", "decision", "measure", "accountability"]],
  ["hanged-man", "The Hanged Man", "倒吊人", "12-hanged-man.jpg", ["暂停", "放下控制", "新角度", "卡住", "等待"], ["pause", "surrender", "new angle", "stuckness", "waiting"]],
  ["death", "Death", "死神", "13-death.jpg", ["结束", "放手", "转变", "失去", "清空"], ["ending", "release", "transition", "loss", "clearing"]],
  ["temperance", "Temperance", "节制", "14-temperance.jpg", ["调和", "平衡", "慢慢混合", "节奏", "不过度"], ["blending", "balance", "slow mixing", "rhythm", "not too much"]],
  ["devil", "The Devil", "恶魔", "15-devil.jpg", ["依附", "习惯", "羞耻", "欲望", "束缚"], ["attachment", "habit", "shame", "desire", "constraint"]],
  ["tower", "The Tower", "高塔", "16-tower.jpg", ["崩塌", "震动", "真相", "断裂", "释放"], ["collapse", "shock", "truth", "break", "release"]],
  ["star", "The Star", "星星", "17-star.jpg", ["希望", "修复", "敞开", "指引", "温柔"], ["hope", "repair", "openness", "guidance", "gentleness"]],
  ["moon", "The Moon", "月亮", "18-moon.jpg", ["恐惧", "投射", "梦", "混乱", "本能"], ["fear", "projection", "dream", "confusion", "instinct"]],
  ["sun", "The Sun", "太阳", "19-sun.jpg", ["清晰", "快乐", "暴露", "能量", "被看见"], ["clarity", "joy", "exposure", "energy", "being seen"]],
  ["judgement", "Judgement", "审判", "20-judgement.jpg", ["召唤", "回顾", "醒来", "返回", "决定"], ["calling", "review", "awakening", "return", "decision"]],
  ["world", "The World", "世界", "21-world.jpg", ["完成", "整合", "抵达", "完整", "门槛"], ["completion", "integration", "arrival", "wholeness", "threshold"]]
] as const;

export const majorArcanaDeck: TarotDeckCard[] = majorNames.map(([id, nameEn, nameZh, file, keywordsZh, keywordsEn], number) => ({
  id,
  arcana: "major",
  number,
  nameEn,
  nameZh,
  imagePath: `/cards/rws/major/${file}`,
  keywordsZh: [...keywordsZh],
  keywordsEn: [...keywordsEn],
  shortMeaningZh: `《${nameZh}》常让人想到${keywordsZh.slice(0, 4).join("、")}。`,
  shortMeaningEn: `${nameEn} often brings up ${keywordsEn.slice(0, 4).join(", ")}.`
}));

const suits: Record<TarotSuit, { en: string; zh: string; folder: string; keywordsZh: string[]; keywordsEn: string[] }> = {
  swords: {
    en: "Swords",
    zh: "宝剑",
    folder: "swords",
    keywordsZh: ["想法", "判断", "压力", "真相", "冲突"],
    keywordsEn: ["thought", "judgment", "pressure", "truth", "conflict"]
  },
  wands: {
    en: "Wands",
    zh: "权杖",
    folder: "wands",
    keywordsZh: ["欲望", "能量", "行动", "生长", "方向"],
    keywordsEn: ["desire", "energy", "action", "growth", "direction"]
  },
  cups: {
    en: "Cups",
    zh: "圣杯",
    folder: "cups",
    keywordsZh: ["感受", "照顾", "需要", "关系", "接收"],
    keywordsEn: ["feeling", "care", "need", "relationship", "receiving"]
  },
  pentacles: {
    en: "Pentacles",
    zh: "星币",
    folder: "pentacles",
    keywordsZh: ["身体", "资源", "练习", "安全感", "日常"],
    keywordsEn: ["body", "resources", "practice", "security", "daily life"]
  }
};

export const ranks: Array<{ rank: TarotRank; index: number; en: string; zh: string; fileRank: string; keywordsZh: string[]; keywordsEn: string[] }> = [
  { rank: "ace", index: 1, en: "Ace", zh: "王牌", fileRank: "ace", keywordsZh: ["开始", "种子"], keywordsEn: ["seed", "beginning"] },
  { rank: "02", index: 2, en: "Two", zh: "2", fileRank: "2", keywordsZh: ["关系", "选择"], keywordsEn: ["relation", "choice"] },
  { rank: "03", index: 3, en: "Three", zh: "3", fileRank: "3", keywordsZh: ["发展", "下一步"], keywordsEn: ["development", "next step"] },
  { rank: "04", index: 4, en: "Four", zh: "4", fileRank: "4", keywordsZh: ["稳定", "停住"], keywordsEn: ["stability", "pause"] },
  { rank: "05", index: 5, en: "Five", zh: "5", fileRank: "5", keywordsZh: ["冲突", "缺口"], keywordsEn: ["conflict", "lack"] },
  { rank: "06", index: 6, en: "Six", zh: "6", fileRank: "6", keywordsZh: ["调整", "过渡"], keywordsEn: ["adjustment", "transition"] },
  { rank: "07", index: 7, en: "Seven", zh: "7", fileRank: "7", keywordsZh: ["选择", "防守"], keywordsEn: ["choice", "defense"] },
  { rank: "08", index: 8, en: "Eight", zh: "8", fileRank: "8", keywordsZh: ["重复", "推进"], keywordsEn: ["repetition", "movement"] },
  { rank: "09", index: 9, en: "Nine", zh: "9", fileRank: "9", keywordsZh: ["临近", "负担"], keywordsEn: ["near completion", "burden"] },
  { rank: "10", index: 10, en: "Ten", zh: "10", fileRank: "10", keywordsZh: ["结果", "满溢"], keywordsEn: ["result", "fullness"] },
  { rank: "page", index: 11, en: "Page", zh: "侍从", fileRank: "page", keywordsZh: ["消息", "学习"], keywordsEn: ["message", "learning"] },
  { rank: "knight", index: 12, en: "Knight", zh: "骑士", fileRank: "knight", keywordsZh: ["移动", "冲动"], keywordsEn: ["movement", "impulse"] },
  { rank: "queen", index: 13, en: "Queen", zh: "王后", fileRank: "queen", keywordsZh: ["照顾", "内在权威"], keywordsEn: ["care", "inner authority"] },
  { rank: "king", index: 14, en: "King", zh: "国王", fileRank: "king", keywordsZh: ["承担", "外在权威"], keywordsEn: ["responsibility", "outer authority"] }
];

const overrides: Record<string, Partial<Pick<TarotDeckCard, "keywordsZh" | "keywordsEn" | "shortMeaningZh" | "shortMeaningEn">>> = {
  "swords-09": {
    keywordsZh: ["不安", "夜里的念头", "反复担心", "内疚", "难以放下"],
    keywordsEn: ["unease", "night thoughts", "repeated worry", "guilt", "hard to put down"]
  },
  "wands-03": {
    keywordsZh: ["远方", "等待结果", "扩展", "下一步", "站在原地看远处"],
    keywordsEn: ["distance", "waiting for results", "expansion", "next step", "looking outward"]
  },
  "cups-queen": {
    keywordsZh: ["照顾", "情绪容器", "柔软边界", "共情", "自我关怀"],
    keywordsEn: ["care", "emotional container", "soft boundary", "empathy", "self-care"]
  }
};

export const minorArcanaDeck: TarotDeckCard[] = (Object.keys(suits) as TarotSuit[]).flatMap((suit) =>
  ranks.map((rank) => {
    const suitInfo = suits[suit];
    const id = `${suit}-${rank.rank}`;
    const nameEn = `${rank.en} of ${suitInfo.en}`;
    const nameZh = `${suitInfo.zh}${rank.zh}`;
    const fileName = `${String(rank.index).padStart(2, "0")}-${rank.fileRank}-of-${suit}.jpg`;
    const base: TarotDeckCard = {
      id,
      arcana: "minor",
      suit,
      rank: rank.rank,
      nameEn,
      nameZh,
      imagePath: `/cards/rws/minor/${suitInfo.folder}/${fileName}`,
      keywordsZh: [...rank.keywordsZh, ...suitInfo.keywordsZh].slice(0, 5),
      keywordsEn: [...rank.keywordsEn, ...suitInfo.keywordsEn].slice(0, 5),
      shortMeaningZh: "",
      shortMeaningEn: ""
    };
    const merged = { ...base, ...(overrides[id] || {}) };
    return {
      ...merged,
      shortMeaningZh: merged.shortMeaningZh || `《${nameZh}》常让人想到${merged.keywordsZh.slice(0, 4).join("、")}。`,
      shortMeaningEn: merged.shortMeaningEn || `${nameEn} often brings up ${merged.keywordsEn.slice(0, 4).join(", ")}.`
    };
  })
);

export const tarotDeck: TarotDeckCard[] = [...majorArcanaDeck, ...minorArcanaDeck];

export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}${path.replace(/^\//, "")}`;
}

export function findDeckCard(value: string): TarotDeckCard | undefined {
  const key = normalize(value);
  return tarotDeck.find((card) =>
    [card.id, card.nameEn, card.nameZh, card.nameEn.replace(/^The /, "")].some((candidate) => normalize(candidate) === key)
  );
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/^the\s+/, "").replace(/[\s_-]/g, "");
}
