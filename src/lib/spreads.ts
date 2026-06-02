import type { SpreadId, SpreadPosition, TarotSpread } from "../types";

export type { SpreadId, SpreadPosition, TarotSpread } from "../types";

const oneCardDeepDive: TarotSpread = {
  id: "one-card-deep-dive",
  nameZh: "单牌深入",
  nameEn: "One-Card Deep Dive",
  descriptionZh: "用一张牌靠近问题最先露出的入口，适合还没有清晰形状的感受。",
  descriptionEn: "Use one card to approach the first doorway into a question that has not fully taken shape.",
  recommendedForZh: "问题还比较模糊、想理解当下状态、没有明确二选一或时间线时。",
  recommendedForEn: "Vague questions, general states, and questions without a clear binary choice or timeline.",
  type: "simple",
  positions: [
    {
      id: "doorway",
      order: 1,
      titleZh: "当前问题的入口",
      titleEn: "Doorway into the Question",
      positionQuestionZh: "这件事最先该看哪一块？",
      positionQuestionEn: "What part should you look at first?",
      agentGoalZh:
        "你只负责帮助用户找到这个问题的入口。请把用户的原问题、之前所有输入、这张牌的画面细节和当前牌位放在一起看，但只聚焦一个小入口：这个问题现在最需要被靠近的部分是什么。不要泛泛谈人生，不要直接给最终答案。可以点明一两个具体方向，但要保持开放。",
      agentGoalEn:
        "You only help the user find the doorway into this question. Use the original question, all prior user inputs, this card's visual details, and the current position, but focus on one small doorway: the part of the question that most needs to be approached now. Do not generalize about the user's whole life or give a final answer. You may name one or two concrete directions while keeping them open.",
      layout: { x: 50, y: 52 }
    }
  ]
};

const twoChoice: TarotSpread = {
  id: "two-choice",
  nameZh: "二选一牌阵",
  nameEn: "Two-Choice Spread",
  descriptionZh: "把一个选择拆成：我现在在哪里、A 的牵引、B 的牵引，以及两条路径可能放大的主题。",
  descriptionEn: "Separate a decision into two paths: yourself, option A, option B, and what each path may bring into view.",
  recommendedForZh: "适合 A/B 选择、是否要做某事、留下或离开、两个方案都各有吸引和压力时。",
  recommendedForEn: "A/B decisions, choice difficulty, and questions that already contain 'should I' or 'or'.",
  type: "simple",
  positions: [
    {
      id: "querent-state",
      order: 1,
      titleZh: "求问者当前状态",
      titleEn: "The querent's current state",
      positionQuestionZh: "面对 A/B，你现在是什么状态？",
      positionQuestionEn: "What state are you in with A/B?",
      agentGoalZh:
        "你只负责观察求问者当前状态。必须结合：1. 用户提出的原问题；2. 用户在本次对话里所有输入；3. A/B 的具体内容；4. 当前牌位问题；5. 当前抽到的牌和用户看到的画面。请细致分析用户面对选择时的位置、情绪、身体反应、动机、犹豫和隐含标准。不要替用户选 A 或 B，但可以点出：用户可能正在被什么拉住、避开什么、真正想确认什么。",
      agentGoalEn:
        "You only observe the querent's current state. Use: 1. the original question; 2. all user inputs in this conversation; 3. the concrete A/B options; 4. this position question; 5. the drawn card and what the user noticed. Analyze the user's position, emotion, bodily reaction, motive, hesitation, and hidden criteria. Do not choose A or B for the user, but you may name what may be pulling them, what they may be avoiding, and what they may be trying to confirm.",
      layout: { x: 50, y: 18 }
    },
    {
      id: "option-a-situation",
      order: 2,
      titleZh: "A 选项周围的情况",
      titleEn: "The situation around option A",
      positionQuestionZh: "选 A 会带来什么？",
      positionQuestionEn: "What would option A bring?",
      agentGoalZh:
        "你只负责从 A 选项的角度看问题。请结合原问题、所有用户输入、A 的具体内容、当前牌和牌位，分析 A 带来的吸引、压力、期待、代价、机会、风险、未说出口的理由和用户对 A 的投射。不要比较 B，除非是为了说明 A 的边界。",
      agentGoalEn:
        "You only read from option A's angle. Use the original question, all user inputs, the concrete option A, this card, and this position to analyze A's attraction, pressure, expectation, cost, opportunity, risk, unspoken reasons, and the user's projection onto A. Do not compare with B except to clarify A's boundary.",
      layout: { x: 28, y: 46, rotate: -4 }
    },
    {
      id: "option-b-situation",
      order: 3,
      titleZh: "B 选项周围的情况",
      titleEn: "The situation around option B",
      positionQuestionZh: "选 B 会带来什么？",
      positionQuestionEn: "What would option B bring?",
      agentGoalZh:
        "你只负责从 B 选项的角度看问题。请结合原问题、所有用户输入、B 的具体内容、当前牌和牌位，分析 B 带来的吸引、压力、期待、代价、机会、风险、未说出口的理由和用户对 B 的投射。不要比较 A，除非是为了说明 B 的边界。",
      agentGoalEn:
        "You only read from option B's angle. Use the original question, all user inputs, the concrete option B, this card, and this position to analyze B's attraction, pressure, expectation, cost, opportunity, risk, unspoken reasons, and the user's projection onto B. Do not compare with A except to clarify B's boundary.",
      layout: { x: 72, y: 46, rotate: 4 }
    },
    {
      id: "option-a-development",
      order: 4,
      titleZh: "A 可能放大的方向",
      titleEn: "How option A may develop",
      positionQuestionZh: "走 A 这边，接下来要留意什么？",
      positionQuestionEn: "With option A, what should you notice next?",
      agentGoalZh:
        "你只负责观察 A 的发展方向。不要预测未来。请根据原问题、用户输入、A 的具体内容、当前牌与已完成牌位，说明如果当前模式继续，A 可能放大的主题、节奏、成本、机会、关系变化或自我要求。可以给出温和建议，但要用“可能”“值得留意”而不是绝对判断。",
      agentGoalEn:
        "You only observe option A's development. Do not predict the future. Based on the original question, user inputs, option A, this card, and completed positions, name the themes, pace, costs, opportunities, relationship shifts, or self-demands A may amplify if the current pattern continues. You may offer gentle suggestions using open language, not certainty.",
      layout: { x: 28, y: 76, rotate: 3 }
    },
    {
      id: "option-b-development",
      order: 5,
      titleZh: "B 可能放大的方向",
      titleEn: "How option B may develop",
      positionQuestionZh: "走 B 这边，接下来要留意什么？",
      positionQuestionEn: "With option B, what should you notice next?",
      agentGoalZh:
        "你只负责观察 B 的发展方向。不要预测未来。请根据原问题、用户输入、B 的具体内容、当前牌与已完成牌位，说明如果当前模式继续，B 可能放大的主题、节奏、成本、机会、关系变化或自我要求。可以给出温和建议，但要用“可能”“值得留意”而不是绝对判断。",
      agentGoalEn:
        "You only observe option B's development. Do not predict the future. Based on the original question, user inputs, option B, this card, and completed positions, name the themes, pace, costs, opportunities, relationship shifts, or self-demands B may amplify if the current pattern continues. You may offer gentle suggestions using open language, not certainty.",
      layout: { x: 72, y: 76, rotate: -3 }
    }
  ]
};

const pastPresentFuture: TarotSpread = {
  id: "past-present-future",
  nameZh: "过去 / 现在 / 可能走向",
  nameEn: "Past / Present / Future",
  descriptionZh: "沿时间线看问题从哪里来、现在如何出现、如果模式继续可能把注意力带向哪里。",
  descriptionEn: "Look along time: where the question came from, how it appears now, and where the current pattern may lead.",
  recommendedForZh: "适合变化中的关系、阶段转换、最近发生的事、想理解来龙去脉和下一层变化时。",
  recommendedForEn: "Changing situations, recent shifts, next steps, stages, and questions about where something came from.",
  type: "simple",
  positions: [
    {
      id: "past",
      order: 1,
      titleZh: "过去：问题从哪里来",
      titleEn: "Past: where did this question come from?",
      positionQuestionZh: "这件事是从哪里开始变重的？",
      positionQuestionEn: "Where did this start to feel heavier?",
      agentGoalZh:
        "你只负责观察问题的来源。结合原问题、所有用户输入、当前牌和用户看到的画面，寻找过去的痕迹、旧解释、重复模式、未完成情绪或已经积累的东西。不要把过去说成命运，只说明它如何仍在影响现在。",
      agentGoalEn:
        "You only observe the question's origin. Use the original question, all user inputs, this card, and the user's visual observation to find past traces, old interpretations, repeated patterns, unfinished emotions, or accumulated pressure. Do not frame the past as fate; name how it may still affect the present.",
      layout: { x: 25, y: 52, rotate: -5 }
    },
    {
      id: "present",
      order: 2,
      titleZh: "现在：问题如何出现",
      titleEn: "Present: how is it appearing now?",
      positionQuestionZh: "它现在具体卡在哪里？",
      positionQuestionEn: "Where is it stuck right now?",
      agentGoalZh:
        "你只负责观察问题的当前状态。结合原问题、所有用户输入、当前牌和用户看到的画面，分析现在可见的场景、身体反应、关系位置、阻力、矛盾和用户正在承受的具体压力。请避免抽象词堆叠，要落到用户已说过的内容。",
      agentGoalEn:
        "You only observe the present state. Use the original question, all user inputs, this card, and the user's observation to analyze the visible scene, bodily reaction, relationship position, resistance, contradiction, and concrete pressure now. Avoid vague abstractions; ground the reading in what the user has said.",
      layout: { x: 50, y: 52 }
    },
    {
      id: "future",
      order: 3,
      titleZh: "可能走向：如果模式继续",
      titleEn: "Future: where might it go if this continues?",
      positionQuestionZh: "如果继续这样，接下来最该留意什么？",
      positionQuestionEn: "If this continues, what should you notice next?",
      agentGoalZh:
        "你只负责观察可能走向。不要预测未来。结合原问题、所有用户输入、当前牌和前两个牌位，说明如果现在的模式继续，可能先浮现什么主题、选择、代价、机会或需要被看见的部分。可以给出方向提示，但不要说成必然。",
      agentGoalEn:
        "You only observe possible direction. Do not predict the future. Use the original question, all user inputs, this card, and the previous two positions to name what theme, choice, cost, opportunity, or unseen part may emerge first if the current pattern continues. Offer direction without certainty.",
      layout: { x: 75, y: 52, rotate: 5 }
    }
  ]
};

const celticPositions: SpreadPosition[] = [
  {
    id: "present-core",
    order: 1,
    titleZh: "当前核心",
    titleEn: "Present Situation / Core of the Question",
    positionQuestionZh: "这件事现在最核心的部分是什么？",
    positionQuestionEn: "What is the core of this right now?",
    agentGoalZh: "你只负责当前核心：问题现在可见的状态、张力、事实和用户站在其中的位置。请用用户输入和当前牌把核心说具体。",
    agentGoalEn: "Focus only on the present core: the visible state, tension, facts, and where the user stands inside it. Use the user's words and this card to make the core concrete.",
    layout: { x: 34, y: 50 }
  },
  {
    id: "crossing-influence",
    order: 2,
    titleZh: "阻碍 / 交叉影响",
    titleEn: "Obstacle / Crossing Influence",
    positionQuestionZh: "现在最卡住你的是什么？",
    positionQuestionEn: "What is blocking this right now?",
    agentGoalZh: "你只负责交叉影响：阻碍、摩擦、矛盾、压力或让事情卡住的条件。不要解决它，先把它看清楚。",
    agentGoalEn: "Focus only on the crossing influence: obstacle, friction, contradiction, pressure, or the condition that blocks movement. Do not solve it too quickly; first make it visible.",
    layout: { x: 34, y: 50, rotate: 90, overlap: true }
  },
  {
    id: "root",
    order: 3,
    titleZh: "根基 / 隐藏基础",
    titleEn: "Root / Hidden Foundation",
    positionQuestionZh: "这件事下面还有什么原因？",
    positionQuestionEn: "What else is underneath this?",
    agentGoalZh: "你只负责根基：未说出口的恐惧、旧信念、身体压力、情绪来源或未命名的需要。请从牌面和用户输入推测，但保持开放。",
    agentGoalEn: "Focus only on the root: unspoken fear, old belief, bodily pressure, emotional source, or unnamed need. Infer from the card and user input while staying open.",
    layout: { x: 34, y: 78 }
  },
  {
    id: "past-influence",
    order: 4,
    titleZh: "过去影响",
    titleEn: "Past Influence",
    positionQuestionZh: "过去的什么还在影响它？",
    positionQuestionEn: "What from the past still affects this?",
    agentGoalZh: "你只负责过去影响：旧事件、记忆、重复解释、未完成情绪或曾经形成的防御方式。",
    agentGoalEn: "Focus only on past influence: previous events, memories, repeated interpretations, unfinished emotions, or defenses formed before.",
    layout: { x: 17, y: 50 }
  },
  {
    id: "conscious-aim",
    order: 5,
    titleZh: "显意识目标",
    titleEn: "Conscious Aim / What the User Thinks They Want",
    positionQuestionZh: "你现在最想要的是什么？",
    positionQuestionEn: "What do you want most right now?",
    agentGoalZh: "你只负责显意识目标：用户能说出口的愿望、目标、理想、证明自己的方式，或讲给自己的故事。",
    agentGoalEn: "Focus only on conscious aim: the wish, goal, ideal, self-proof, or story the user can name.",
    layout: { x: 34, y: 22 }
  },
  {
    id: "near-development",
    order: 6,
    titleZh: "近期发展",
    titleEn: "Near Development",
    positionQuestionZh: "接下来最可能先变的是什么？",
    positionQuestionEn: "What may shift first next?",
    agentGoalZh: "你只负责近期发展。不要预测未来，只观察如果当前模式继续，下一层可见变化、新张力或先露出的部分。",
    agentGoalEn: "Focus only on near development. Do not predict the future; observe the next visible shift, new tension, or first emerging layer if the current pattern continues.",
    layout: { x: 51, y: 50 }
  },
  {
    id: "self-position",
    order: 7,
    titleZh: "用户自身位置",
    titleEn: "The User's Own Position",
    positionQuestionZh: "你在这件事里扮演什么角色？",
    positionQuestionEn: "What role are you playing in this?",
    agentGoalZh: "你只负责用户自身位置：态度、能动性、回避、欲望、自我形象或正在扮演的角色。请把它说得具体但不责备。",
    agentGoalEn: "Focus only on the user's own position: attitude, agency, avoidance, desire, self-image, or role. Be concrete without blaming.",
    layout: { x: 78, y: 85 }
  },
  {
    id: "external-influence",
    order: 8,
    titleZh: "外部影响",
    titleEn: "External Influence / Others or Systems",
    positionQuestionZh: "外部有哪些人或条件在影响它？",
    positionQuestionEn: "What outside people or conditions affect this?",
    agentGoalZh: "你只负责外部影响：人、关系、系统、期待、环境、社会规则或物质条件。不要把外部影响全部心理化。",
    agentGoalEn: "Focus only on external influence: people, relationships, systems, expectations, environment, social rules, or material conditions. Do not turn all external pressure into inner psychology.",
    layout: { x: 78, y: 61 }
  },
  {
    id: "hopes-fears",
    order: 9,
    titleZh: "希望与恐惧",
    titleEn: "Hopes and Fears",
    positionQuestionZh: "你最期待什么？最担心什么？",
    positionQuestionEn: "What do you hope for? What do you fear?",
    agentGoalZh: "你只负责希望与恐惧：渴望和害怕之间的张力。不要急着化解它，先让两边都被听见。",
    agentGoalEn: "Focus only on hopes and fears: the tension between longing and fear. Do not resolve it too quickly; let both sides be heard.",
    layout: { x: 78, y: 37 }
  },
  {
    id: "possible-outcome",
    order: 10,
    titleZh: "可能结果 / 浮现方向",
    titleEn: "Possible Outcome / Emerging Direction",
    positionQuestionZh: "把牌放在一起看，方向是什么？",
    positionQuestionEn: "Seen together, what direction appears?",
    agentGoalZh: "你只负责可能结果。不要预测命运。请综合前面所有位置，只说当前牌阵正在聚向的方向、主题和下一步值得留意的地方。",
    agentGoalEn: "Focus only on possible outcome. Do not predict fate. Synthesize previous positions only to name the direction, theme, and next thing worth noticing.",
    layout: { x: 78, y: 13 }
  }
];

export const celticCrossSpread: TarotSpread = {
  id: "celtic-cross",
  nameZh: "凯尔特十字",
  nameEn: "Celtic Cross",
  descriptionZh: "十张牌的深入牌阵，追踪问题的核心、根基、影响、希望恐惧与浮现方向。",
  descriptionEn:
    "A traditional ten-card deep reading that follows the core question through roots, influences, hopes, fears, and an emerging direction.",
  recommendedForZh: "适合复杂问题、关系或人生阶段，需要更完整地看见内外因素与发展方向时。",
  recommendedForEn: "For a deeper, slower reading when you want a more complete view across ten positions.",
  type: "celtic",
  positions: celticPositions
};

export const simpleSpreads: TarotSpread[] = [oneCardDeepDive, twoChoice, pastPresentFuture];
export const tarotSpreads: TarotSpread[] = [...simpleSpreads, celticCrossSpread];

export const spreadsById: Record<SpreadId, TarotSpread> = tarotSpreads.reduce(
  (accumulator, spread) => ({ ...accumulator, [spread.id]: spread }),
  {} as Record<SpreadId, TarotSpread>
);

export function getSpread(spreadId: SpreadId): TarotSpread {
  return spreadsById[spreadId];
}

export function createPositionReadings(spread: TarotSpread) {
  return spread.positions
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((position, index) => ({
      spreadId: spread.id,
      positionId: position.id,
      positionOrder: position.order,
      positionTitleZh: position.titleZh,
      positionTitleEn: position.titleEn,
      positionQuestionZh: position.positionQuestionZh,
      positionQuestionEn: position.positionQuestionEn,
      agentGoalZh: position.agentGoalZh,
      agentGoalEn: position.agentGoalEn,
      dialogue: [],
      status: index === 0 ? ("active" as const) : ("empty" as const),
      turnCount: 0
    }));
}

export function recommendSimpleSpread(question: string): SpreadId {
  const value = question.trim().toLowerCase();
  const binaryMarkers = [
    /\b(or|versus|vs\.?|either|whether|choice|choose|decision|decide)\b/i,
    /\ba\s+or\s+b\b/i,
    /\b(a|option a)\s*(\/|vs\.?|or)\s*(b|option b)\b/i,
    /\b(should|could|do)\s+i\b/i,
    /\b(stay|leave)\s+or\s+(stay|leave)\b/i,
    /二选一|选择|选项|决定|纠结|留下|离开|该不该|要不要|A\/B|a\/b|A or B/i
  ];
  const timeMarkers = [
    /\b(recently|currently|now|next|future|past|before|after|stage|phase|change|changing|shift|pattern|develop|development|timeline|where.*came from|where.*going|what.*next)\b/i,
    /过去|现在|未来|最近|阶段|变化|发展|下一步|走向|模式|从哪里来|会如何/i
  ];

  const binaryScore = countMatches(binaryMarkers, value);
  const timeScore = countMatches(timeMarkers, value);

  if (binaryScore > 0 && binaryScore >= timeScore) return "two-choice";
  if (timeScore > 0) return "past-present-future";
  return "one-card-deep-dive";
}

function countMatches(patterns: RegExp[], value: string): number {
  return patterns.reduce((score, pattern) => score + (pattern.test(value) ? 1 : 0), 0);
}

export function positionTitle(position: SpreadPosition, language: "en" | "zh") {
  return language === "zh" ? position.titleZh : position.titleEn;
}
