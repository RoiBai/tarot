import type { Language } from "../types";

const GENERIC_ANCHORS = new Set([
  "emotion",
  "emotions",
  "feeling",
  "feelings",
  "need",
  "needs",
  "problem",
  "question",
  "issue",
  "thing",
  "things",
  "part",
  "parts",
  "self",
  "inner truth",
  "inner need",
  "情绪",
  "需求",
  "问题",
  "事情",
  "东西",
  "部分",
  "感受",
  "内心",
  "真正",
  "隐藏"
]);

const EN_STOPWORDS = new Set([
  "about",
  "after",
  "again",
  "also",
  "and",
  "are",
  "because",
  "been",
  "but",
  "can",
  "could",
  "did",
  "does",
  "dont",
  "feel",
  "felt",
  "for",
  "from",
  "had",
  "has",
  "have",
  "how",
  "into",
  "just",
  "know",
  "like",
  "maybe",
  "not",
  "now",
  "that",
  "the",
  "then",
  "there",
  "this",
  "was",
  "what",
  "when",
  "where",
  "which",
  "with",
  "would",
  "you",
  "your"
]);

const ZH_STOPWORDS = [
  "我不知道",
  "不知道",
  "但是",
  "只是",
  "因为",
  "所以",
  "如果",
  "好像",
  "感觉",
  "觉得",
  "每次",
  "想到",
  "证明",
  "最近",
  "这个",
  "那个",
  "问题",
  "自己",
  "什么",
  "怎么",
  "可能",
  "需要",
  "一个",
  "一些",
  "时候",
  "事情",
  "部分",
  "里面",
  "真的",
  "没有",
  "还是",
  "就是",
  "很",
  "会",
  "也",
  "都",
  "就",
  "在",
  "和",
  "的",
  "了",
  "吗",
  "呢"
];

export function sanitizeWordAnchors(
  candidates: string[] | undefined,
  sourceText: string,
  language: Language
): string[] {
  const source = sourceText.toLowerCase();
  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const candidate of candidates || []) {
    const anchor = normalizeAnchor(candidate, language);
    if (!anchor) continue;
    const key = anchor.toLowerCase();
    if (seen.has(key) || GENERIC_ANCHORS.has(key)) continue;
    if (language === "en" && anchor.split(/\s+/).length > 4) continue;
    if (language === "zh" && [...anchor].length > 8) continue;
    if (source && source.length > 6 && !source.includes(key) && !containsCjk(anchor)) {
      continue;
    }
    seen.add(key);
    cleaned.push(anchor);
    if (cleaned.length === 5) break;
  }

  return cleaned;
}

export function extractFallbackWordAnchors(text: string, language: Language): string[] {
  if (language === "zh" || containsCjk(text)) {
    return extractChineseAnchors(text);
  }
  return extractEnglishAnchors(text);
}

function extractChineseAnchors(text: string): string[] {
  let working = text;
  for (const stopword of ZH_STOPWORDS) {
    working = working.replaceAll(stopword, " ");
  }

  const phrases = working
    .split(/[\s，。！？、；：,.!?;:"“”'()（）《》【】]+/g)
    .flatMap((part) => part.match(/[\u4e00-\u9fffA-Za-z0-9]{2,8}/g) || [])
    .map((part) => normalizeAnchor(part, "zh"))
    .filter(Boolean);

  const boosted = [
    ...matchChinesePattern(text, /([\u4e00-\u9fff]{2,6})(?:就|会|让我|让我觉得)?很?(紧张|害怕|困惑|焦虑|生气|难过|沉重)/g),
    ...matchChinesePattern(text, /(失败|申请学校|不够好|被困住|逃开|选择|消息|场景|标准|期待|证明)/g),
    ...phrases
  ];

  return sanitizeWordAnchors(boosted, text, "zh").slice(0, 5);
}

function extractEnglishAnchors(text: string): string[] {
  const rawWords = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'\s-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  const meaningful = rawWords.filter((word) => word.length > 2 && !EN_STOPWORDS.has(word.replace(/'/g, "")));
  const phrases: string[] = [];

  for (let index = 0; index < rawWords.length - 1; index += 1) {
    const pair = `${rawWords[index]} ${rawWords[index + 1]}`;
    if (pair === "not enough" || pair === "school application") phrases.push(pair);
  }

  for (let index = 0; index < meaningful.length - 1; index += 1) {
    if (phrases.length >= 4) break;
    phrases.push(`${meaningful[index]} ${meaningful[index + 1]}`);
  }

  const candidates = [...phrases, ...meaningful];
  return sanitizeWordAnchors(candidates, text, "en").slice(0, 5);
}

function matchChinesePattern(text: string, pattern: RegExp): string[] {
  const matches: string[] = [];
  for (const match of text.matchAll(pattern)) {
    const capture = match[2] || match[1] || match[0];
    if (capture) matches.push(capture);
  }
  return matches;
}

function normalizeAnchor(value: string, language: Language): string {
  const trimmed = value
    .trim()
    .replace(/^["'“”‘’「」『』《》【】]+|["'“”‘’「」『』《》【】]+$/g, "")
    .replace(/[，。！？、；：,.!?;:()[\]{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!trimmed) return "";
  if (language === "zh" || containsCjk(trimmed)) {
    return trimmed.replace(/^(很|更|最|被|把|对|给|和|与|的)+/g, "").replace(/(的|了|着)$/g, "");
  }
  return trimmed;
}

function containsCjk(value: string): boolean {
  return /[\u4e00-\u9fff]/.test(value);
}
