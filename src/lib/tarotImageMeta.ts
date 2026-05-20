export type TarotImageMeta = {
  id: string;
  number: number;
  nameEn: string;
  nameZh: string;
  imagePath: string;
  commonsFileUrl: string;
  author: string;
  year: string;
  license: string;
  creditLine: string;
  aliases?: string[];
};

const creditLine =
  "Rider-Waite-Smith tarot image by Pamela Colman Smith, public domain via Wikimedia Commons.";

export const majorArcanaImageMeta: TarotImageMeta[] = [
  major("fool", 0, "The Fool", "愚人", "00-fool.jpg", "RWS_Tarot_00_Fool.jpg", ["the-fool"]),
  major("magician", 1, "The Magician", "魔术师", "01-magician.jpg", "RWS_Tarot_01_Magician.jpg", ["the-magician"]),
  major("high-priestess", 2, "The High Priestess", "女祭司", "02-high-priestess.jpg", "RWS_Tarot_02_High_Priestess.jpg", ["the-high-priestess"]),
  major("empress", 3, "The Empress", "皇后", "03-empress.jpg", "RWS_Tarot_03_Empress.jpg", ["the-empress"]),
  major("emperor", 4, "The Emperor", "皇帝", "04-emperor.jpg", "RWS_Tarot_04_Emperor.jpg", ["the-emperor"]),
  major("hierophant", 5, "The Hierophant", "教皇", "05-hierophant.jpg", "RWS_Tarot_05_Hierophant.jpg", ["the-hierophant"]),
  major("lovers", 6, "The Lovers", "恋人", "06-lovers.jpg", "RWS_Tarot_06_Lovers.jpg", ["the-lovers"]),
  major("chariot", 7, "The Chariot", "战车", "07-chariot.jpg", "RWS_Tarot_07_Chariot.jpg", ["the-chariot"]),
  major("strength", 8, "Strength", "力量", "08-strength.jpg", "RWS_Tarot_08_Strength.jpg"),
  major("hermit", 9, "The Hermit", "隐士", "09-hermit.jpg", "RWS_Tarot_09_Hermit.jpg", ["the-hermit"]),
  major("wheel-of-fortune", 10, "Wheel of Fortune", "命运之轮", "10-wheel-of-fortune.jpg", "RWS_Tarot_10_Wheel_of_Fortune.jpg"),
  major("justice", 11, "Justice", "正义", "11-justice.jpg", "RWS_Tarot_11_Justice.jpg"),
  major("hanged-man", 12, "The Hanged Man", "倒吊人", "12-hanged-man.jpg", "RWS_Tarot_12_Hanged_Man.jpg", ["the-hanged-man"]),
  major("death", 13, "Death", "死神", "13-death.jpg", "RWS_Tarot_13_Death.jpg"),
  major("temperance", 14, "Temperance", "节制", "14-temperance.jpg", "RWS_Tarot_14_Temperance.jpg"),
  major("devil", 15, "The Devil", "恶魔", "15-devil.jpg", "RWS_Tarot_15_Devil.jpg", ["the-devil"]),
  major("tower", 16, "The Tower", "高塔", "16-tower.jpg", "RWS_Tarot_16_Tower.jpg", ["the-tower"]),
  major("star", 17, "The Star", "星星", "17-star.jpg", "RWS_Tarot_17_Star.jpg", ["the-star"]),
  major("moon", 18, "The Moon", "月亮", "18-moon.jpg", "RWS_Tarot_18_Moon.jpg", ["the-moon"]),
  major("sun", 19, "The Sun", "太阳", "19-sun.jpg", "RWS_Tarot_19_Sun.jpg", ["the-sun"]),
  major("judgement", 20, "Judgement", "审判", "20-judgement.jpg", "RWS_Tarot_20_Judgement.jpg", ["judgment"]),
  major("world", 21, "The World", "世界", "21-world.jpg", "RWS_Tarot_21_World.jpg", ["the-world"])
];

export const minorArcanaImageMeta: TarotImageMeta[] = [
  ...minorSuit("cups", "Cups", "圣杯", "Cups", "cups", [
    "Ace of Cups", "Two of Cups", "Three of Cups", "Four of Cups", "Five of Cups", "Six of Cups", "Seven of Cups",
    "Eight of Cups", "Nine of Cups", "Ten of Cups", "Page of Cups", "Knight of Cups", "Queen of Cups", "King of Cups"
  ], [
    "圣杯一", "圣杯二", "圣杯三", "圣杯四", "圣杯五", "圣杯六", "圣杯七",
    "圣杯八", "圣杯九", "圣杯十", "圣杯侍从", "圣杯骑士", "圣杯皇后", "圣杯国王"
  ]),
  ...minorSuit("wands", "Wands", "权杖", "Wands", "wands", [
    "Ace of Wands", "Two of Wands", "Three of Wands", "Four of Wands", "Five of Wands", "Six of Wands", "Seven of Wands",
    "Eight of Wands", "Nine of Wands", "Ten of Wands", "Page of Wands", "Knight of Wands", "Queen of Wands", "King of Wands"
  ], [
    "权杖一", "权杖二", "权杖三", "权杖四", "权杖五", "权杖六", "权杖七",
    "权杖八", "权杖九", "权杖十", "权杖侍从", "权杖骑士", "权杖皇后", "权杖国王"
  ]),
  ...minorSuit("swords", "Swords", "宝剑", "Swords", "swords", [
    "Ace of Swords", "Two of Swords", "Three of Swords", "Four of Swords", "Five of Swords", "Six of Swords", "Seven of Swords",
    "Eight of Swords", "Nine of Swords", "Ten of Swords", "Page of Swords", "Knight of Swords", "Queen of Swords", "King of Swords"
  ], [
    "宝剑一", "宝剑二", "宝剑三", "宝剑四", "宝剑五", "宝剑六", "宝剑七",
    "宝剑八", "宝剑九", "宝剑十", "宝剑侍从", "宝剑骑士", "宝剑皇后", "宝剑国王"
  ]),
  ...minorSuit("pentacles", "Pentacles", "星币", "Pents", "pentacles", [
    "Ace of Pentacles", "Two of Pentacles", "Three of Pentacles", "Four of Pentacles", "Five of Pentacles", "Six of Pentacles", "Seven of Pentacles",
    "Eight of Pentacles", "Nine of Pentacles", "Ten of Pentacles", "Page of Pentacles", "Knight of Pentacles", "Queen of Pentacles", "King of Pentacles"
  ], [
    "星币一", "星币二", "星币三", "星币四", "星币五", "星币六", "星币七",
    "星币八", "星币九", "星币十", "星币侍从", "星币骑士", "星币皇后", "星币国王"
  ], ["钱币", "金币"])
];

export const tarotImageMeta: TarotImageMeta[] = [...majorArcanaImageMeta, ...minorArcanaImageMeta];

export function getTarotImageSrc(imagePath: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}${imagePath.replace(/^\//, "")}`;
}

export function findTarotImageMeta(cardIdOrName: string): TarotImageMeta | undefined {
  const key = normalizeCardKey(cardIdOrName);
  return tarotImageMeta.find((card) => {
    const aliases = [card.id, card.nameEn, card.nameZh, ...(card.aliases || [])];
    return aliases.some((alias) => normalizeCardKey(alias) === key);
  });
}

function major(
  id: string,
  number: number,
  nameEn: string,
  nameZh: string,
  fileName: string,
  commonsFile: string,
  aliases: string[] = []
): TarotImageMeta {
  return baseMeta(id, number, nameEn, nameZh, `/cards/rws/major/${fileName}`, commonsFile, aliases);
}

function minorSuit(
  suitId: string,
  suitEn: string,
  suitZh: string,
  commonsPrefix: string,
  folder: string,
  namesEn: string[],
  namesZh: string[],
  zhSuitAliases: string[] = []
): TarotImageMeta[] {
  return namesEn.map((nameEn, index) => {
    const number = index + 1;
    const rankId = rankSlug(number);
    const id = `${rankId}-of-${suitId}`;
    const fileName = `${String(number).padStart(2, "0")}-${rankId}-of-${suitId}.jpg`;
    const commonsFile = `${commonsPrefix}${String(number).padStart(2, "0")}.jpg`;
    const nameZh = namesZh[index];
    const rankAliases = rankAlias(number);
    const aliases = [
      `${suitEn} ${number}`,
      `${number} of ${suitEn}`,
      ...rankAliases.en.map((rank) => `${rank} of ${suitEn}`),
      ...rankAliases.zh.flatMap((rank) => [rank + suitZh, suitZh + rank]),
      ...zhSuitAliases.flatMap((aliasSuit) => rankAliases.zh.flatMap((rank) => [rank + aliasSuit, aliasSuit + rank]))
    ];
    return baseMeta(id, number, nameEn, nameZh, `/cards/rws/minor/${folder}/${fileName}`, commonsFile, aliases);
  });
}

function baseMeta(
  id: string,
  number: number,
  nameEn: string,
  nameZh: string,
  imagePath: string,
  commonsFile: string,
  aliases: string[] = []
): TarotImageMeta {
  return {
    id,
    number,
    nameEn,
    nameZh,
    imagePath,
    commonsFileUrl: `https://commons.wikimedia.org/wiki/File:${commonsFile}`,
    author: "Pamela Colman Smith",
    year: "1909/1910",
    license: "Public domain",
    creditLine,
    aliases
  };
}

function normalizeCardKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/[\s_\-·:：'"“”‘’（）()]/g, "");
}

function rankSlug(number: number): string {
  if (number === 1) return "ace";
  if (number === 11) return "page";
  if (number === 12) return "knight";
  if (number === 13) return "queen";
  if (number === 14) return "king";
  return String(number);
}

function rankAlias(number: number): { en: string[]; zh: string[] } {
  const en = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
  const zh = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "侍从", "骑士", "皇后", "国王"];
  return {
    en: [en[number - 1], String(number)],
    zh: [zh[number - 1]]
  };
}
