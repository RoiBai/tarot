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
      positionQuestionZh: "这个问题最先想让你看见什么？",
      positionQuestionEn: "What does this question first want you to notice?",
      agentGoalZh:
        "你是一个专门帮助用户找到问题入口的 Agent。你只关注：这张牌如何让用户看见这个问题最先需要被靠近的一小块。不要分析整个人生。不要给答案。通过短问题帮助用户找到这个问题真正触碰到的部分。",
      agentGoalEn:
        "You are an agent focused on helping the user find the doorway into their question. Your only concern is how this card helps the user notice the first small part of the question that needs to be approached. Do not analyze the user's whole life. Do not give an answer. Use short questions to help the user find what the question first touches.",
      layout: { x: 50, y: 52 }
    }
  ]
};

const twoChoice: TarotSpread = {
  id: "two-choice",
  nameZh: "二选一牌阵",
  nameEn: "Two-Choice Spread",
  descriptionZh: "把一个选择拆成两个方向，看见自己、A、B，以及两条路各自可能放大的主题。",
  descriptionEn: "Separate a decision into two paths: yourself, option A, option B, and what each path may bring into view.",
  recommendedForZh: "正在 A/B 之间犹豫、想比较两个方向，或问题里已经出现“要不要”“还是”。",
  recommendedForEn: "A/B decisions, choice difficulty, and questions that already contain 'should I' or 'or'.",
  type: "simple",
  positions: [
    {
      id: "querent-state",
      order: 1,
      titleZh: "求问者自身的状况",
      titleEn: "The querent's current state",
      positionQuestionZh: "在这个选择面前，你现在处在什么状态？",
      positionQuestionEn: "What state are you in as you stand before this choice?",
      agentGoalZh:
        "你是一个专门观察求问者当前状态的 Agent。你只关注用户面对 A/B 选择时自己的位置、情绪、身体反应、动机和犹豫。不要替用户选择。",
      agentGoalEn:
        "You are the agent of the querent's current state. Focus only on the user's position, emotions, bodily reaction, motives, and hesitation when facing the A/B choice. Do not choose for the user.",
      layout: { x: 50, y: 18 }
    },
    {
      id: "option-a-situation",
      order: 2,
      titleZh: "与 A 的状况",
      titleEn: "The situation around option A",
      positionQuestionZh: "选择 A 时，什么正在靠近你？",
      positionQuestionEn: "When choosing option A, what is moving toward you?",
      agentGoalZh:
        "你是一个专门分析 A 选择的 Agent。你只从 A 的角度看用户的吸引、压力、期待、风险和未说出口的理由。",
      agentGoalEn:
        "You are the agent of option A. Look only from the angle of option A: attraction, pressure, expectation, risk, and unspoken reasons.",
      layout: { x: 28, y: 46, rotate: -4 }
    },
    {
      id: "option-b-situation",
      order: 3,
      titleZh: "与 B 的状况",
      titleEn: "The situation around option B",
      positionQuestionZh: "选择 B 时，什么正在靠近你？",
      positionQuestionEn: "When choosing option B, what is moving toward you?",
      agentGoalZh:
        "你是一个专门分析 B 选择的 Agent。你只从 B 的角度看用户的吸引、压力、期待、风险和未说出口的理由。",
      agentGoalEn:
        "You are the agent of option B. Look only from the angle of option B: attraction, pressure, expectation, risk, and unspoken reasons.",
      layout: { x: 72, y: 46, rotate: 4 }
    },
    {
      id: "option-a-development",
      order: 4,
      titleZh: "A 的未来发展",
      titleEn: "How option A may develop",
      positionQuestionZh: "如果沿着 A 走下去，这条路可能让你看见什么？",
      positionQuestionEn: "If you keep walking with option A, what might this path bring into view?",
      agentGoalZh:
        "你是一个专门观察 A 的发展方向的 Agent。你不预测未来，只帮助用户想象 A 可能放大的主题、代价、节奏或机会。",
      agentGoalEn:
        "You are the agent of option A's development. Do not predict the future. Help the user imagine the themes, costs, pace, or opportunities option A may amplify.",
      layout: { x: 28, y: 76, rotate: 3 }
    },
    {
      id: "option-b-development",
      order: 5,
      titleZh: "B 的未来发展",
      titleEn: "How option B may develop",
      positionQuestionZh: "如果沿着 B 走下去，这条路可能让你看见什么？",
      positionQuestionEn: "If you keep walking with option B, what might this path bring into view?",
      agentGoalZh:
        "你是一个专门观察 B 的发展方向的 Agent。你不预测未来，只帮助用户想象 B 可能放大的主题、代价、节奏或机会。",
      agentGoalEn:
        "You are the agent of option B's development. Do not predict the future. Help the user imagine the themes, costs, pace, or opportunities option B may amplify.",
      layout: { x: 72, y: 76, rotate: -3 }
    }
  ]
};

const pastPresentFuture: TarotSpread = {
  id: "past-present-future",
  nameZh: "过去现在未来",
  nameEn: "Past / Present / Future",
  descriptionZh: "顺着时间看问题从哪里来、现在如何呈现，以及如果继续这样可能走向哪里。",
  descriptionEn: "Look along time: where the question came from, how it appears now, and where the current pattern may lead.",
  recommendedForZh: "问题正在变化、包含最近/现在/下一步，或想理解一个阶段从哪里来。",
  recommendedForEn: "Changing situations, recent shifts, next steps, stages, and questions about where something came from.",
  type: "simple",
  positions: [
    {
      id: "past",
      order: 1,
      titleZh: "过去：这个问题从哪里来？",
      titleEn: "Past: where did this question come from?",
      positionQuestionZh: "这个问题从哪里来？",
      positionQuestionEn: "Where did this question come from?",
      agentGoalZh: "你是一个专门观察问题来源的 Agent。你只关注这个问题过去的痕迹、来源、旧模式、已经积累的东西。",
      agentGoalEn:
        "You are the agent of the question's origin. Focus only on past traces, sources, old patterns, and what has accumulated.",
      layout: { x: 25, y: 52, rotate: -5 }
    },
    {
      id: "present",
      order: 2,
      titleZh: "现在：它现在如何呈现？",
      titleEn: "Present: how is it appearing now?",
      positionQuestionZh: "它现在如何呈现？",
      positionQuestionEn: "How is it appearing now?",
      agentGoalZh: "你是一个专门观察问题当前状态的 Agent。你只关注这个问题现在如何出现：场景、身体、关系、阻力、矛盾。",
      agentGoalEn:
        "You are the agent of the present state. Focus only on how the question appears now: scene, body, relationship, resistance, and contradiction.",
      layout: { x: 50, y: 52 }
    },
    {
      id: "future",
      order: 3,
      titleZh: "未来：如果继续这样，它可能走向哪里？",
      titleEn: "Future: where might it go if this continues?",
      positionQuestionZh: "如果继续这样，它可能走向哪里？",
      positionQuestionEn: "If this continues, where might it lead your attention?",
      agentGoalZh:
        "你是一个专门观察可能走向的 Agent。你不预测未来，只帮助用户看见如果当前模式继续，它可能会把注意力带向哪里。",
      agentGoalEn:
        "You are the agent of possible direction. Do not predict the future. Help the user see where attention may be carried if the current pattern continues.",
      layout: { x: 75, y: 52, rotate: 5 }
    }
  ]
};

const celticPositions: SpreadPosition[] = [
  {
    id: "present-core",
    order: 1,
    titleZh: "当前状态 / 问题核心",
    titleEn: "Present Situation / Core of the Question",
    positionQuestionZh: "这个问题现在真正呈现出来的样子是什么？",
    positionQuestionEn: "What is the real shape of this question as it appears now?",
    agentGoalZh: "你是当前状态的 Agent。只关注用户的问题现在正在发生什么：可见状态、当前张力，以及用户此刻站在什么里面。",
    agentGoalEn:
      "You are the agent of the present situation. Focus only on what is currently happening in the user's question: the visible state, current tension, and what the user is standing inside now.",
    layout: { x: 34, y: 50 }
  },
  {
    id: "crossing-influence",
    order: 2,
    titleZh: "阻碍 / 交叉影响",
    titleEn: "Obstacle / Crossing Influence",
    positionQuestionZh: "什么正在横在这个问题中间？",
    positionQuestionEn: "What is crossing the middle of this question?",
    agentGoalZh: "你是交叉影响的 Agent。只关注横在当前状态中的阻碍、摩擦、矛盾或压力。",
    agentGoalEn:
      "You are the agent of the crossing influence. Focus only on the obstacle, friction, contradiction, or pressure crossing the current situation.",
    layout: { x: 34, y: 50, rotate: 90, overlap: true }
  },
  {
    id: "root",
    order: 3,
    titleZh: "潜意识根基 / 问题底层",
    titleEn: "Root / Hidden Foundation",
    positionQuestionZh: "这个问题底下更深的根是什么？",
    positionQuestionEn: "What deeper root is underneath this question?",
    agentGoalZh: "你是根基的 Agent。只关注问题底下隐藏的基础：未说出口的恐惧、旧信念、身体压力、情绪根源或未命名的需要。",
    agentGoalEn:
      "You are the agent of the root. Focus only on the hidden foundation: unspoken fear, old belief, bodily pressure, emotional root, or unnamed need underneath the question.",
    layout: { x: 34, y: 78 }
  },
  {
    id: "past-influence",
    order: 4,
    titleZh: "过去影响",
    titleEn: "Past Influence",
    positionQuestionZh: "过去有什么仍在影响这个问题？",
    positionQuestionEn: "What from the past is still influencing this question?",
    agentGoalZh: "你是过去影响的 Agent。只关注用户可能从之前带来的东西：过去事件、旧解释、重复模式、记忆或未完成的情绪残留。",
    agentGoalEn:
      "You are the agent of the past influence. Focus only on what the user may be carrying from before: previous events, old interpretations, repeated patterns, memory, or unfinished emotional residue.",
    layout: { x: 17, y: 50 }
  },
  {
    id: "conscious-aim",
    order: 5,
    titleZh: "显意识目标 / 用户以为自己想要的",
    titleEn: "Conscious Aim / What the User Thinks They Want",
    positionQuestionZh: "你以为自己最想要的是什么？",
    positionQuestionEn: "What do you believe you want most?",
    agentGoalZh: "你是显意识目标的 Agent。只关注用户以为自己想要什么、能够说出口的目标、正在伸手够向的理想，或关于这个问题讲给自己的故事。",
    agentGoalEn:
      "You are the agent of conscious aim. Focus only on what the user believes they want, the goal they can name, the ideal they are reaching for, or the story they tell themselves about this question.",
    layout: { x: 34, y: 22 }
  },
  {
    id: "near-development",
    order: 6,
    titleZh: "近期发展",
    titleEn: "Near Development",
    positionQuestionZh: "如果这个问题继续展开，近期可能先出现什么变化？",
    positionQuestionEn: "If this question keeps unfolding, what visible shift may appear first?",
    agentGoalZh: "你是近期发展的 Agent。不要预测未来。只关注如果当前模式继续，下一层可见变化、新浮现的张力，或可能先露出的部分。",
    agentGoalEn:
      "You are the agent of near development. Do not predict the future. Focus on the next visible shift, emerging tension, or likely next layer if the current pattern continues.",
    layout: { x: 51, y: 50 }
  },
  {
    id: "self-position",
    order: 7,
    titleZh: "用户自身位置",
    titleEn: "The User's Own Position",
    positionQuestionZh: "你自己在这个问题里站在哪里？",
    positionQuestionEn: "Where do you stand inside this question?",
    agentGoalZh: "你是用户自身位置的 Agent。只关注用户如何参与这个问题：态度、能动性、回避、欲望、自我形象，或正在扮演的角色。",
    agentGoalEn:
      "You are the agent of self-position. Focus only on how the user participates in the question: attitude, agency, avoidance, desire, self-image, or the role they are playing.",
    layout: { x: 78, y: 85 }
  },
  {
    id: "external-influence",
    order: 8,
    titleZh: "外部环境 / 他人或系统影响",
    titleEn: "External Influence / Others or Systems",
    positionQuestionZh: "这个问题周围有什么外部力量？",
    positionQuestionEn: "What external forces surround this question?",
    agentGoalZh: "你是外部影响的 Agent。只关注围绕这个问题的人、关系、系统、期待、环境、社会规则或物质条件。",
    agentGoalEn:
      "You are the agent of external influence. Focus only on people, relationships, systems, expectations, environment, social rules, or material conditions surrounding the question.",
    layout: { x: 78, y: 61 }
  },
  {
    id: "hopes-fears",
    order: 9,
    titleZh: "希望与恐惧",
    titleEn: "Hopes and Fears",
    positionQuestionZh: "你最希望什么，又最害怕什么？",
    positionQuestionEn: "What do you most hope for, and what do you most fear?",
    agentGoalZh: "你是希望与恐惧的 Agent。关注用户渴望的东西和害怕会发生的东西之间的张力。不要太快化解它。",
    agentGoalEn:
      "You are the agent of hopes and fears. Focus on the tension between what the user longs for and what they are afraid will happen. Do not resolve it too quickly.",
    layout: { x: 78, y: 37 }
  },
  {
    id: "possible-outcome",
    order: 10,
    titleZh: "可能结果 / 暂时浮现的方向",
    titleEn: "Possible Outcome / Emerging Direction",
    positionQuestionZh: "把整个牌阵放在一起看，现在浮现出的方向是什么？",
    positionQuestionEn: "When the whole spread is held together, what direction is appearing now?",
    agentGoalZh: "你是可能结果的 Agent。不要预测命运。只关注当前面所有位置一起被看见时浮现出的方向，帮助用户看见这副牌阵正在聚向什么。",
    agentGoalEn:
      "You are the agent of possible outcome. Do not predict fate. Focus on the direction that appears when all previous positions are considered. Help the user see what the spread is gathering toward.",
    layout: { x: 78, y: 13 }
  }
];

export const celticCrossSpread: TarotSpread = {
  id: "celtic-cross",
  nameZh: "凯尔特十字",
  nameEn: "Celtic Cross",
  descriptionZh: "传统十张牌深度牌阵，从问题核心一路看见根基、外部影响、希望恐惧与暂时浮现的方向。",
  descriptionEn:
    "A traditional ten-card deep reading that follows the core question through roots, influences, hopes, fears, and an emerging direction.",
  recommendedForZh: "适合你想做更深入、更完整的分析，愿意慢慢走完十个牌位时。",
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
    /\b(left|right)\s*\/\s*(left|right)\b/i,
    /选择|抉择|决定|纠结|比较|还是|或者|要不要|继续还是放弃|留下还是离开|二选一|选哪|该不该|是否|要不要分手|要不要辞职|要不要继续/
  ];

  const timeMarkers = [
    /\b(recently|currently|now|next|future|past|before|after|stage|phase|change|changing|shift|pattern|develop|development|timeline|where.*came from|where.*going|what.*next)\b/i,
    /过去|现在|未来|最近|近期|下一步|阶段|变化|转变|发展|趋势|走向|从哪里来|会怎样|后来|以前|接下来|之后|之前|目前|当前|如果继续/
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
