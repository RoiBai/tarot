export type CardSymbol = {
  id: string;
  cardId: string;
  labelEn: string;
  labelZh: string;
  possibleDirectionsEn: string[];
  possibleDirectionsZh: string[];
  shortPromptEn: string;
  shortPromptZh: string;
};

type SymbolSeed = [string, string, string, string[], string[]];

const commonEn = ["attention", "threshold", "tension", "possibility", "unease"];
const commonZh = ["注意力", "门槛", "张力", "可能性", "不安"];

const seeds: Record<string, SymbolSeed[]> = {
  fool: [
    s("figure", "figure", "人物", ["beginning", "risk", "freedom", "innocence", "not looking down"], ["开始", "风险", "自由", "天真", "没有低头看"]),
    s("dog", "dog", "狗", ["warning", "companionship", "instinct", "protection", "unease"], ["提醒", "陪伴", "本能", "保护", "不安"]),
    s("cliff", "cliff", "悬崖", ["risk", "threshold", "unknown", "one step away", "fear of falling"], ["风险", "门槛", "未知", "只差一步", "害怕坠落"]),
    s("white-rose", "white rose", "白玫瑰", ["desire", "innocence", "offering", "fragile hope"], ["愿望", "纯真", "献出", "脆弱的希望"]),
    s("bundle", "bundle", "行囊", ["what is carried", "past experience", "hidden burden", "small preparation"], ["携带之物", "过去经验", "隐藏负担", "小小准备"]),
    s("zero", "number zero", "数字 0", ["beginning", "undefined", "blankness", "open possibility", "not yet named"], ["开始", "未定义", "空白", "开放可能", "尚未命名"]),
    s("sky", "sky", "天空", ["openness", "distance", "dream", "not grounded yet"], ["开阔", "距离", "梦", "尚未落地"])
  ],
  magician: [
    s("raised-hand", "raised hand", "举起的手", ["intention", "claiming power", "calling attention", "direction"], ["意图", "拿回力量", "召唤注意", "方向"]),
    s("table-tools", "table tools", "桌上的工具", ["available resources", "skills", "preparation", "choice of method"], ["可用资源", "技能", "准备", "方法选择"]),
    s("infinity", "infinity sign", "无限符号", ["continuity", "loop", "potential", "repeating power"], ["连续", "循环", "潜能", "重复的力量"]),
    s("flowers", "flowers", "花", ["growth", "beauty", "results", "cultivation"], ["生长", "美", "结果", "培育"]),
    s("wand", "wand", "魔杖", ["focus", "will", "signal", "beginning action"], ["专注", "意志", "信号", "开始行动"])
  ],
  "high-priestess": [
    s("veil", "veil", "帷幕", ["hiddenness", "privacy", "threshold", "not yet revealed"], ["隐藏", "隐私", "门槛", "尚未显露"]),
    s("pillars", "pillars", "柱子", ["opposites", "boundary", "between two sides", "held tension"], ["对立", "边界", "两边之间", "被承托的张力"]),
    s("scroll", "scroll", "卷轴", ["kept knowledge", "unspoken truth", "memory", "study"], ["保存的知识", "未说的真相", "记忆", "学习"]),
    s("moon", "moon", "月亮", ["intuition", "cycles", "uncertainty", "quiet feeling"], ["直觉", "周期", "不确定", "安静的感受"]),
    s("water", "water / hidden background", "水 / 隐藏背景", ["depth", "emotion", "what is behind", "slow knowing"], ["深处", "情绪", "背后的东西", "慢慢知道"])
  ],
  empress: group("empress", [["crown", "crown", "冠冕"], ["wheat", "wheat", "麦穗"], ["cushion", "cushion", "软垫"], ["forest", "forest", "森林"], ["river", "river", "河流"]], ["care", "growth", "receiving", "body", "ripening"], ["照料", "生长", "接收", "身体", "成熟"]),
  emperor: group("emperor", [["throne", "throne", "王座"], ["armor", "armor", "盔甲"], ["mountains", "mountains", "山"], ["scepter", "scepter", "权杖"], ["red-robe", "red robe", "红袍"]], ["structure", "boundary", "control", "protection", "authority"], ["结构", "边界", "控制", "保护", "权威"]),
  hierophant: group("hierophant", [["keys", "keys", "钥匙"], ["pillars", "pillars", "柱子"], ["raised-hand", "raised hand", "举起的手"], ["students", "students", "学生"], ["triple-crown", "triple crown", "三重冠"]], ["tradition", "permission", "teaching", "belonging", "inherited rule"], ["传统", "许可", "教导", "归属", "继承的规则"]),
  lovers: group("lovers", [["two-figures", "two figures", "两个人"], ["angel", "angel", "天使"], ["tree", "tree", "树"], ["mountain", "mountain", "山"], ["sun", "sun", "太阳"]], ["choice", "relationship", "witness", "values", "exposure"], ["选择", "关系", "见证", "价值", "显露"]),
  chariot: group("chariot", [["chariot", "chariot", "战车"], ["sphinxes", "sphinxes", "狮身人面像"], ["armor", "armor", "盔甲"], ["city", "city behind", "身后的城市"], ["canopy", "star canopy", "星幕"]], ["direction", "tension", "will", "leaving", "protection"], ["方向", "张力", "意志", "离开", "保护"]),
  strength: group("strength", [["lion", "lion", "狮子"], ["hand", "gentle hand", "温柔的手"], ["infinity", "infinity sign", "无限符号"], ["white-dress", "white dress", "白衣"], ["flowers", "flowers", "花环"]], ["gentleness", "courage", "taming", "patience", "trust"], ["温柔", "勇气", "安抚", "耐心", "信任"]),
  hermit: group("hermit", [["lantern", "lantern", "灯"], ["staff", "staff", "手杖"], ["mountain", "mountain", "山"], ["cloak", "cloak", "斗篷"], ["snow", "snow / blank ground", "雪 / 空白地面"]], ["distance", "searching", "privacy", "small light", "slowness"], ["距离", "寻找", "隐私", "小光", "缓慢"]),
  "wheel-of-fortune": group("wheel-of-fortune", [["wheel", "wheel", "轮"], ["letters", "letters", "字母"], ["sphinx", "sphinx", "狮身人面像"], ["snake", "snake", "蛇"], ["four-corners", "four corner figures", "四角生物"]], ["cycle", "chance", "pattern", "turning", "return"], ["循环", "偶然", "模式", "转动", "回返"]),
  justice: group("justice", [["scales", "scales", "天平"], ["sword", "sword", "剑"], ["curtain", "curtain", "帘幕"], ["crown", "crown", "冠"], ["square-seat", "square seat", "方正座椅"]], ["fairness", "truth", "decision", "consequence", "measure"], ["公平", "真相", "决定", "后果", "衡量"]),
  "hanged-man": group("hanged-man", [["hanging-figure", "hanging figure", "倒挂的人"], ["halo", "halo", "光环"], ["tree", "tree", "树"], ["crossed-leg", "crossed leg", "交叉的腿"], ["bound-foot", "bound foot", "被绑住的脚"]], ["pause", "reversal", "waiting", "surrender", "new angle"], ["暂停", "倒转", "等待", "放下控制", "新角度"]),
  death: group("death", [["horse", "white horse", "白马"], ["banner", "black banner", "黑旗"], ["sunrise", "sunrise", "日出"], ["fallen-crown", "fallen crown", "倒下的冠"], ["river", "river", "河流"]], ["ending", "transition", "release", "change of form", "new light"], ["结束", "过渡", "放手", "形式改变", "新的光"]),
  temperance: group("temperance", [["cups", "two cups", "两个杯子"], ["water-flow", "flowing water", "流动的水"], ["one-foot-water", "one foot in water", "一只脚在水中"], ["path", "path", "小路"], ["sun", "sun / crown", "太阳 / 光冠"]], ["mixing", "balance", "pacing", "repair", "proportion"], ["调和", "平衡", "节奏", "修复", "比例"]),
  devil: group("devil", [["chains", "chains", "锁链"], ["torch", "torch", "火把"], ["horns", "horns", "角"], ["two-figures", "two figures", "两个人"], ["dark-background", "dark background", "黑暗背景"]], ["attachment", "habit", "bargain", "desire", "uneasy reward"], ["依附", "习惯", "交换", "欲望", "不安的回报"]),
  tower: group("tower", [["tower", "tower", "高塔"], ["lightning", "lightning", "闪电"], ["falling-figures", "falling figures", "坠落的人"], ["crown", "crown", "王冠"], ["fire", "fire", "火"]], ["structure", "interruption", "shock", "truth breaking in", "collapse"], ["结构", "打断", "震动", "真相闯入", "崩塌"]),
  star: group("star", [["star", "star", "星星"], ["water-pouring", "water pouring", "倒出的水"], ["figure", "figure", "人物"], ["land-water", "land and water", "陆地与水"], ["bird-tree", "bird / tree", "鸟 / 树"]], ["hope", "release", "vulnerability", "balance", "life returning"], ["希望", "释放", "脆弱", "平衡", "生命回返"]),
  moon: group("moon", [["moon", "moon", "月亮"], ["dog-wolf", "dog and wolf", "狗和狼"], ["path", "path", "小路"], ["water", "water", "水"], ["crayfish", "crayfish", "小龙虾"]], ["uncertainty", "instinct", "unknown route", "depth", "emerging"], ["不确定", "本能", "未知路线", "深处", "浮现"]),
  sun: group("sun", [["sun", "sun", "太阳"], ["child", "child", "孩子"], ["horse", "horse", "马"], ["wall", "wall", "墙"], ["sunflowers", "sunflowers", "向日葵"]], ["clarity", "warmth", "visibility", "joy", "simple truth"], ["清晰", "温暖", "可见", "喜悦", "简单真相"]),
  judgement: group("judgement", [["angel", "angel", "天使"], ["trumpet", "trumpet", "号角"], ["rising-figures", "rising figures", "站起的人"], ["coffins", "coffins", "棺木"], ["mountains", "mountains", "远山"]], ["calling", "awakening", "answering", "return", "reckoning"], ["召唤", "醒来", "回应", "回返", "清算"]),
  world: group("world", [["wreath", "wreath", "花环"], ["dancer", "dancer", "舞者"], ["four-corners", "four corner figures", "四角生物"], ["wands", "two wands", "两根杖"], ["ribbon", "ribbon", "丝带"]], ["completion", "integration", "movement", "belonging", "whole pattern"], ["完成", "整合", "移动", "归属", "整体图案"])
};

export const cardSymbols: CardSymbol[] = Object.entries(seeds).flatMap(([cardId, items]) =>
  items.map(([id, labelEn, labelZh, directionsEn, directionsZh]) => ({
    id,
    cardId,
    labelEn,
    labelZh,
    possibleDirectionsEn: directionsEn,
    possibleDirectionsZh: directionsZh,
    shortPromptEn: `The ${labelEn} may open directions such as ${directionsEn.slice(0, 4).join(", ")}.`,
    shortPromptZh: `「${labelZh}」可能打开的方向包括：${directionsZh.slice(0, 4).join("、")}。`
  }))
);

export function getSymbolsForCard(cardId: string): CardSymbol[] {
  return cardSymbols.filter((symbol) => symbol.cardId === cardId);
}

function s(id: string, labelEn: string, labelZh: string, en: string[] = commonEn, zh: string[] = commonZh): SymbolSeed {
  return [id, labelEn, labelZh, en, zh];
}

function group(cardId: string, labels: Array<[string, string, string]>, en: string[], zh: string[]): SymbolSeed[] {
  return labels.map(([id, labelEn, labelZh], index) => s(id, labelEn, labelZh, rotate(en, index), rotate(zh, index)));
}

function rotate(values: string[], offset: number): string[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}
