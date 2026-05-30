import type { Language } from "../types";
import type { TarotDeckCard, TarotRank, TarotSuit } from "./tarotDeck";

type LocalTarotKnowledge = {
  cardId: string;
  sourceBasis: string;
  visualFocusEn: string[];
  visualFocusZh: string[];
  coreMeaningsEn: string[];
  coreMeaningsZh: string[];
  reflectiveAnglesEn: string[];
  reflectiveAnglesZh: string[];
  groundedSuggestionsEn: string[];
  groundedSuggestionsZh: string[];
};

const sourceBasis =
  "Local synthesis based on the public-domain Rider-Waite-Smith imagery and A. E. Waite's The Pictorial Key to the Tarot; use as symbolic reference, not prediction.";

const majorKnowledge: Record<string, Omit<LocalTarotKnowledge, "cardId" | "sourceBasis">> = {
  fool: item(
    ["traveller at a cliff edge", "small bundle", "white dog", "open sky"],
    ["悬崖边的旅人", "小包袱", "白狗", "开阔天空"],
    ["beginning before certainty", "risk", "freedom", "not yet knowing the cost"],
    ["尚未确定前的开始", "风险", "自由", "还没有看清代价"],
    ["Where are you stepping before you have proof?", "What feels alive but underprepared?"],
    ["你正在哪件事上先迈步、后确认？", "什么让你觉得有生命力，但准备还不充分？"],
    ["Keep the new impulse, but name one practical boundary before moving.", "Ask what would make this risk more conscious."],
    ["保留新的冲动，但在行动前说清一个实际边界。", "问问自己：怎样做能让这个风险更清醒？"]
  ),
  magician: item(
    ["raised wand", "tools on the table", "one hand pointing down", "flowers"],
    ["举起的权杖", "桌上的工具", "一手指向地面", "花朵"],
    ["will becoming action", "available tools", "focused attention", "making something real"],
    ["意志变成行动", "可用工具", "聚焦注意力", "让事情成形"],
    ["What resource is already in your hands?", "Where does intention need a concrete method?"],
    ["你手里已经有什么资源？", "哪里需要把意图变成具体方法？"],
    ["Choose one tool or next action instead of waiting for the perfect moment.", "Check whether you are using skill or trying to control too much."],
    ["先选一个工具或下一步，不必等完美时机。", "留意你是在运用能力，还是想控制太多。"]
  ),
  "high-priestess": item(
    ["seated figure", "veil", "moon", "scroll"],
    ["静坐的人物", "帷幕", "月亮", "卷轴"],
    ["intuition", "hidden knowledge", "silence", "waiting before disclosure"],
    ["直觉", "隐藏知识", "安静", "揭示前的等待"],
    ["What do you already sense but have not said?", "What needs privacy before it becomes clear?"],
    ["你已经感觉到、但还没说出口的是什么？", "什么需要先被安静保留，才会变清楚？"],
    ["Do not force the answer. Write down the signal you keep dismissing.", "Separate intuition from fear by naming evidence for each."],
    ["不要硬逼答案，先写下你一直忽略的信号。", "把直觉和恐惧分开：分别列出它们的依据。"]
  ),
  empress: item(
    ["lush garden", "wheat", "cushions", "crowned woman"],
    ["丰盛花园", "麦穗", "软垫", "戴冠女性"],
    ["care", "growth", "body", "receiving", "creative abundance"],
    ["照顾", "生长", "身体", "接收", "创造性的丰盛"],
    ["Where does this question ask for care rather than force?", "What is trying to grow if given enough conditions?"],
    ["这个问题哪里需要照顾，而不是用力推进？", "如果条件足够，什么正在试着生长？"],
    ["Name the condition that would help growth: time, rest, support, money, space, or permission.", "Notice whether giving and receiving are balanced."],
    ["说出帮助生长的条件：时间、休息、支持、金钱、空间或允许。", "留意付出和接收是否失衡。"]
  ),
  emperor: item(
    ["stone throne", "armor", "scepter", "mountains"],
    ["石头王座", "盔甲", "权杖", "山脉"],
    ["structure", "authority", "boundary", "responsibility", "control"],
    ["结构", "权威", "边界", "责任", "控制"],
    ["What structure would protect rather than harden you?", "Where do you need a clearer boundary?"],
    ["什么结构能保护你，而不是让你变僵硬？", "哪里需要更清楚的边界？"],
    ["Turn a vague pressure into a rule, limit, or concrete agreement.", "Check whether control is serving safety or fear."],
    ["把模糊压力变成规则、限制或具体约定。", "分辨控制是在服务安全感，还是服务恐惧。"]
  ),
  hierophant: item(
    ["teacher figure", "two followers", "keys", "ritual gesture"],
    ["导师形象", "两位追随者", "钥匙", "仪式手势"],
    ["tradition", "permission", "learning", "belonging", "shared rules"],
    ["传统", "许可", "学习", "归属", "共同规则"],
    ["Whose approval is shaping this question?", "What rule are you following, and did you choose it?"],
    ["谁的认可正在影响这个问题？", "你正在遵守什么规则？它是你选的吗？"],
    ["Separate useful guidance from inherited obedience.", "Ask whether you need a mentor, a community, or more freedom from one."],
    ["区分有用的指导和继承来的服从。", "问问自己需要导师、社群，还是需要从某种规则里松开。"]
  ),
  lovers: item(
    ["two figures", "angel", "mountain", "tree and serpent"],
    ["两个人物", "天使", "山峰", "树与蛇"],
    ["choice", "desire", "relationship", "values alignment", "exposure"],
    ["选择", "欲望", "关系", "价值一致", "袒露"],
    ["What value is being tested by this choice?", "Where is desire asking for honesty?"],
    ["这个选择正在测试什么价值？", "欲望在哪里要求你诚实？"],
    ["Do not reduce the choice to pros and cons; name the value each path asks you to live by.", "Notice what you would choose if nobody rewarded you."],
    ["不要只列利弊，也说出每条路要求你活出什么价值。", "留意如果没有人奖励你，你会怎样选择。"]
  ),
  chariot: item(
    ["charioteer", "two sphinxes", "armor", "city behind"],
    ["战车上的人", "两只狮身人面像", "盔甲", "身后的城市"],
    ["direction", "discipline", "will under pressure", "movement", "control"],
    ["方向", "纪律", "压力下的意志", "移动", "控制"],
    ["What are you trying to steer in two directions at once?", "What would disciplined movement look like here?"],
    ["你正试图同时驾驭哪两个方向？", "在这里，有纪律的推进会是什么样？"],
    ["Pick the direction before increasing speed.", "Use pressure as information, not as the driver."],
    ["先选方向，再加速。", "把压力当信息，不要让压力来驾驶。"]
  ),
  strength: item(
    ["woman and lion", "gentle hands", "infinity sign", "open landscape"],
    ["女人与狮子", "温柔的手", "无限符号", "开阔风景"],
    ["soft power", "patience", "taming impulse", "body wisdom", "courage"],
    ["柔软的力量", "耐心", "安抚冲动", "身体智慧", "勇气"],
    ["What could soften without giving up?", "Which impulse needs care before action?"],
    ["什么可以变柔软，但不等于放弃？", "哪个冲动需要先被照顾，再行动？"],
    ["Try patience as active strength, not passivity.", "Speak to the reactive part before letting it decide."],
    ["把耐心理解成主动的力量，而不是被动。", "先和反应强烈的部分对话，再让它做决定。"]
  ),
  hermit: item(
    ["lantern", "staff", "snowy height", "solitary figure"],
    ["提灯", "手杖", "雪地高处", "独行者"],
    ["solitude", "search", "inner light", "distance", "withdrawal"],
    ["独处", "寻找", "内在微光", "距离", "退后"],
    ["What can only be heard when you step back?", "Is withdrawal protecting wisdom or avoiding contact?"],
    ["退后一步时，什么才听得见？", "撤退是在保护智慧，还是回避接触？"],
    ["Create a short interval away from noise before deciding.", "Bring back one insight rather than disappearing completely."],
    ["在决定前给自己一小段远离噪音的时间。", "带回一个洞见，而不是完全消失。"]
  ),
  "wheel-of-fortune": item(
    ["turning wheel", "four creatures", "sphinx", "rising and falling figures"],
    ["转动的轮", "四个生物", "狮身人面像", "升降的人物"],
    ["cycle", "timing", "change", "pattern", "uncertainty"],
    ["周期", "时机", "变化", "模式", "不确定"],
    ["What cycle is repeating?", "What is changing that you cannot fully control?"],
    ["什么周期正在重复？", "什么变化不是你能完全控制的？"],
    ["Look for the pattern before blaming yourself.", "Adjust timing instead of forcing certainty."],
    ["先看模式，不要急着责备自己。", "调整时机，而不是强迫确定性。"]
  ),
  justice: item(
    ["scales", "sword", "seated judge", "pillars"],
    ["天平", "剑", "坐着的审判者", "柱子"],
    ["fairness", "decision", "consequence", "truth", "accountability"],
    ["公平", "决定", "后果", "真相", "承担"],
    ["What consequence are you ready to own?", "What fact needs to be weighed without drama?"],
    ["你准备承担哪个后果？", "哪个事实需要被冷静衡量？"],
    ["Write the decision criteria before asking what you want.", "Include fairness to yourself as well as others."],
    ["先写判断标准，再问自己想要什么。", "公平也要包括对你自己公平。"]
  ),
  "hanged-man": item(
    ["upside-down figure", "halo", "bound foot", "calm expression"],
    ["倒吊的人", "光环", "被绑住的脚", "平静表情"],
    ["pause", "suspension", "new angle", "surrender", "stuckness with insight"],
    ["暂停", "悬置", "新角度", "交出控制", "卡住中的洞见"],
    ["What changes if you stop trying to solve it immediately?", "What perspective becomes visible from the uncomfortable position?"],
    ["如果先不急着解决，什么会改变？", "从这个不舒服的位置，什么新视角出现了？"],
    ["Use the pause to gather perspective, not to punish yourself.", "Ask what can be released for now."],
    ["把暂停用来获得视角，而不是惩罚自己。", "问问此刻可以先放下什么。"]
  ),
  death: item(
    ["skeleton rider", "fallen figures", "rising sun", "river"],
    ["骷髅骑士", "倒下的人物", "升起的太阳", "河流"],
    ["ending", "transition", "release", "clearing", "irreversible change"],
    ["结束", "过渡", "释放", "清理", "不可逆的变化"],
    ["What is already ending even if you have not named it?", "What becomes possible after release?"],
    ["什么其实已经在结束，只是你还没命名？", "释放之后，什么才可能出现？"],
    ["Name what is over, what remains, and what needs ritual closure.", "Do not confuse grief with a wrong decision."],
    ["说清什么结束了、什么仍在、什么需要仪式性的收尾。", "不要把哀伤误认为决定错误。"]
  ),
  temperance: item(
    ["angel pouring between cups", "one foot in water", "path", "sun"],
    ["天使在杯间倒水", "一脚入水", "小路", "太阳"],
    ["blending", "moderation", "rhythm", "healing through proportion", "integration"],
    ["调和", "适度", "节奏", "比例中的修复", "整合"],
    ["What needs to be mixed slowly rather than decided sharply?", "Where is the right proportion missing?"],
    ["什么需要慢慢调和，而不是立刻切开？", "哪里缺少合适比例？"],
    ["Reduce intensity and test a middle rhythm.", "Look for the smallest adjustment that changes the whole balance."],
    ["降低强度，试一个中间节奏。", "找那个能改变整体平衡的最小调整。"]
  ),
  devil: item(
    ["chained figures", "torch", "horned figure", "dark pedestal"],
    ["被链住的人", "火把", "有角形象", "黑色台座"],
    ["attachment", "habit", "desire", "shame", "constraint"],
    ["依附", "习惯", "欲望", "羞耻", "束缚"],
    ["What feels binding but also familiar?", "Where does shame keep the chain in place?"],
    ["什么既束缚你，又让你熟悉？", "羞耻在哪里让锁链继续存在？"],
    ["Name the payoff of the pattern before trying to break it.", "Look for the part of the chain that is actually loose."],
    ["在打破模式前，先承认它带来的好处。", "看看锁链哪一环其实已经松了。"]
  ),
  tower: item(
    ["lightning", "falling figures", "burning crown", "broken tower"],
    ["闪电", "坠落的人", "燃烧的王冠", "破裂的塔"],
    ["collapse", "shock", "truth breaking through", "false structure falling", "release"],
    ["坍塌", "震动", "真相冲破", "虚假结构倒下", "释放"],
    ["What structure can no longer hold?", "What truth arrived abruptly?"],
    ["什么结构已经撑不住了？", "什么真相突然抵达？"],
    ["Protect what is alive, not what is already cracking.", "After the shock, separate real danger from wounded pride."],
    ["保护还活着的东西，而不是保护已经裂开的外壳。", "震动之后，区分真实危险和受伤的自尊。"]
  ),
  star: item(
    ["woman pouring water", "stars", "open ground", "bird"],
    ["倒水的女性", "星星", "开阔土地", "鸟"],
    ["hope", "repair", "openness", "guidance", "gentle renewal"],
    ["希望", "修复", "敞开", "指引", "温柔更新"],
    ["What feels quietly repairable?", "Where can you be more open without exposing everything?"],
    ["什么仍然可以被安静地修复？", "哪里可以更敞开，但不必完全暴露？"],
    ["Choose one small restorative act.", "Let hope be practical: water, rest, contact, honesty."],
    ["选择一个小的修复行动。", "让希望变得具体：水、休息、联系、诚实。"]
  ),
  moon: item(
    ["moonlit path", "dog and wolf", "crayfish", "towers"],
    ["月光下的小路", "狗与狼", "小龙虾", "两座塔"],
    ["fear", "projection", "dream", "confusion", "instinct"],
    ["恐惧", "投射", "梦", "混乱", "本能"],
    ["What are you filling in because the path is dim?", "Which fear might be a projection?"],
    ["因为道路昏暗，你正在自行补全什么？", "哪个恐惧可能是投射？"],
    ["Delay final judgment until you have more light.", "Track body signals, but verify the story attached to them."],
    ["在更多信息出现前，先延后最终判断。", "记录身体信号，但核对你附加在上面的故事。"]
  ),
  sun: item(
    ["child on horse", "sunflowers", "bright sun", "wall"],
    ["骑马的孩子", "向日葵", "明亮太阳", "墙"],
    ["clarity", "joy", "visibility", "energy", "simple truth"],
    ["清晰", "喜悦", "被看见", "能量", "简单真相"],
    ["What becomes simple when it is seen plainly?", "Where is joy giving reliable information?"],
    ["当事情被照亮时，什么变得简单？", "喜悦在哪里提供可靠信息？"],
    ["Let clarity simplify the next step.", "Notice whether being seen feels nourishing or exposing."],
    ["让清晰把下一步变简单。", "留意被看见是滋养你，还是让你紧张。"]
  ),
  judgement: item(
    ["angel trumpet", "rising figures", "open coffins", "mountains"],
    ["天使号角", "站起的人", "打开的棺木", "山脉"],
    ["calling", "review", "awakening", "reckoning", "return"],
    ["召唤", "回顾", "觉醒", "清算", "回返"],
    ["What part of you is being called back to life?", "What past chapter needs review before you move on?"],
    ["你身上哪个部分正在被重新唤醒？", "哪段过去需要复盘后才能继续？"],
    ["Review without self-punishment.", "Ask what decision would honor what you now know."],
    ["复盘，但不要自我惩罚。", "问问什么决定能尊重你现在知道的东西。"]
  ),
  world: item(
    ["dancing figure", "wreath", "four creatures", "two wands"],
    ["舞动的人物", "花环", "四个生物", "两根权杖"],
    ["completion", "integration", "arrival", "wholeness", "threshold after completion"],
    ["完成", "整合", "抵达", "完整", "完成后的新门槛"],
    ["What has come full circle?", "What can be integrated before the next beginning?"],
    ["什么已经走完一圈？", "在下一个开始前，什么可以被整合？"],
    ["Mark the completion before rushing onward.", "Gather the lessons into one principle you can carry."],
    ["先承认完成，再急着往前。", "把经验收束成一条可以带走的原则。"]
  )
};

const suitKnowledge: Record<TarotSuit, { visualEn: string[]; visualZh: string[]; coreEn: string[]; coreZh: string[] }> = {
  cups: {
    visualEn: ["cups", "water", "emotional atmosphere", "receiving or withholding"],
    visualZh: ["杯子", "水", "情绪氛围", "接收或保留"],
    coreEn: ["feelings", "relationships", "needs", "care", "emotional exchange"],
    coreZh: ["感受", "关系", "需要", "照顾", "情感交换"]
  },
  wands: {
    visualEn: ["staffs", "fire-like movement", "growth", "gesture and direction"],
    visualZh: ["权杖", "火一般的动势", "生长", "姿态与方向"],
    coreEn: ["desire", "energy", "initiative", "creative drive", "action"],
    coreZh: ["欲望", "能量", "主动性", "创造驱力", "行动"]
  },
  swords: {
    visualEn: ["swords", "air and sky", "posture under tension", "cuts or boundaries"],
    visualZh: ["宝剑", "空气与天空", "张力下的姿态", "切割或边界"],
    coreEn: ["thought", "truth", "conflict", "judgment", "mental pressure"],
    coreZh: ["想法", "真相", "冲突", "判断", "精神压力"]
  },
  pentacles: {
    visualEn: ["pentacles", "earth", "work", "body and material conditions"],
    visualZh: ["星币", "土地", "工作", "身体与物质条件"],
    coreEn: ["resources", "body", "money", "practice", "security"],
    coreZh: ["资源", "身体", "金钱", "练习", "安全感"]
  }
};

const rankKnowledge: Record<TarotRank, { visualEn: string[]; visualZh: string[]; coreEn: string[]; coreZh: string[]; suggestionEn: string; suggestionZh: string }> = {
  ace: rank(["single emblem", "offered hand"], ["单一象征物", "伸出的手"], ["seed", "beginning", "raw potential"], ["种子", "开始", "原始潜能"], "Treat this as a beginning that needs a container.", "把它看作一个需要容器的开始。"),
  "02": rank(["two figures or two forces", "mirroring"], ["两个人物或两股力量", "映照"], ["choice", "relationship", "balancing two sides"], ["选择", "关系", "平衡两边"], "Name both sides before forcing agreement.", "先说出两边，再急着求一致。"),
  "03": rank(["three-part scene", "development"], ["三方场景", "发展"], ["growth", "collaboration", "next step"], ["发展", "协作", "下一步"], "Look for the third element that changes the pattern.", "寻找能改变模式的第三个元素。"),
  "04": rank(["stable shape", "pause or enclosure"], ["稳定形状", "停顿或封闭"], ["stability", "rest", "structure"], ["稳定", "休息", "结构"], "Ask whether stability is support or stagnation.", "问问稳定是在支持你，还是让你停滞。"),
  "05": rank(["disruption", "loss or conflict"], ["扰动", "失落或冲突"], ["friction", "lack", "challenge"], ["摩擦", "缺口", "挑战"], "Find the concrete lack instead of naming everything as failure.", "找具体缺口，不要把一切都叫失败。"),
  "06": rank(["exchange or movement after difficulty", "adjustment"], ["困难后的交换或移动", "调整"], ["transition", "repair", "redistribution"], ["过渡", "修复", "重新分配"], "Notice what wants to be rebalanced after strain.", "留意压力之后什么需要重新平衡。"),
  "07": rank(["defensive posture", "many possibilities"], ["防守姿态", "许多可能性"], ["choice", "defense", "testing"], ["选择", "防守", "测试"], "Reduce the options or name what you are defending.", "减少选项，或说清你在防守什么。"),
  "08": rank(["repetition", "constraint or practice"], ["重复", "限制或练习"], ["movement", "practice", "pattern"], ["推进", "练习", "模式"], "Look at what repeated behavior is training in you.", "看看重复行为正在训练你成为什么。"),
  "09": rank(["near completion", "solitary figure"], ["接近完成", "独自的人物"], ["culmination", "burden", "self-contained state"], ["临近完成", "负担", "自成一体"], "Ask what is almost finished and what still weighs on you.", "问问什么快完成了，什么仍压着你。"),
  "10": rank(["full scene", "overflow or completion"], ["完整场景", "满溢或完成"], ["completion", "consequence", "fullness"], ["完成", "后果", "满溢"], "Separate completion from the cost of carrying it.", "区分完成本身和承载它的代价。"),
  page: rank(["young messenger", "learning posture"], ["年轻信使", "学习姿态"], ["message", "curiosity", "beginner mind"], ["消息", "好奇", "初学者心态"], "Approach this as learning, not as proof of competence.", "把它当学习，而不是能力证明。"),
  knight: rank(["mounted figure", "movement"], ["骑士", "移动"], ["pursuit", "impulse", "active direction"], ["追求", "冲动", "主动方向"], "Check the pace before following the impulse.", "跟随冲动前，先检查速度。"),
  queen: rank(["seated sovereign", "inner relationship to the suit"], ["坐着的掌权者", "与该元素的内在关系"], ["inner authority", "care", "maturity"], ["内在权威", "照顾", "成熟"], "Use mature receptivity rather than over-functioning.", "用成熟的接收力，而不是过度负责。"),
  king: rank(["throne", "outer authority over the suit"], ["王座", "对该元素的外在掌权"], ["responsibility", "leadership", "external authority"], ["责任", "领导", "外在权威"], "Turn insight into a boundary, decision, or responsibility.", "把洞见变成边界、决定或责任。")
};

const minorOverrides: Record<string, Partial<Omit<LocalTarotKnowledge, "cardId" | "sourceBasis">>> = {
  "cups-05": {
    visualFocusEn: ["cloaked figure", "three spilled cups", "two cups still standing", "bridge and river"],
    visualFocusZh: ["披斗篷的人", "三个倒下的杯子", "两个仍立着的杯子", "桥与河"],
    coreMeaningsEn: ["grief", "disappointment", "fixation on loss", "unseen remaining support"],
    coreMeaningsZh: ["哀伤", "失望", "被失去吸住", "还没看见的剩余支持"],
    reflectiveAnglesEn: ["What loss is taking up the whole frame?", "What is still standing behind you?"],
    reflectiveAnglesZh: ["哪种失去占满了整个画面？", "你身后仍然站着什么？"],
    groundedSuggestionsEn: ["Let the disappointment be named, then deliberately look for the two cups still available."],
    groundedSuggestionsZh: ["先允许失望被命名，再有意识地看一眼仍然可用的两个杯子。"]
  },
  "swords-09": {
    visualFocusEn: ["person awake in bed", "nine swords on the wall", "covered face", "night setting"],
    visualFocusZh: ["床上醒着的人", "墙上的九把剑", "遮住脸", "夜晚场景"],
    coreMeaningsEn: ["anxiety", "night thoughts", "guilt", "mental repetition"],
    coreMeaningsZh: ["焦虑", "夜里的念头", "内疚", "反复思考"],
    reflectiveAnglesEn: ["Which thought returns when everything is quiet?", "What part is fact and what part is punishment?"],
    reflectiveAnglesZh: ["安静下来时，哪个念头反复回来？", "哪一部分是事实，哪一部分是自我惩罚？"],
    groundedSuggestionsEn: ["Write the fear as one sentence, then mark what evidence you actually have."],
    groundedSuggestionsZh: ["把恐惧写成一句话，再标出你实际拥有的证据。"]
  },
  "wands-03": {
    visualFocusEn: ["figure looking outward", "three wands", "ships in the distance"],
    visualFocusZh: ["向外看的身影", "三根权杖", "远处的船"],
    coreMeaningsEn: ["waiting for results", "expansion", "distance", "planning beyond the current shore"],
    coreMeaningsZh: ["等待结果", "扩展", "距离", "从当前岸边向外规划"],
    reflectiveAnglesEn: ["What have you already set in motion?", "What are you waiting to see return?"],
    reflectiveAnglesZh: ["你已经把什么推向远方？", "你正在等什么回应回来？"],
    groundedSuggestionsEn: ["Use the waiting time to decide what signal would count as enough information."],
    groundedSuggestionsZh: ["利用等待期决定：什么信号出现，就算信息足够。"]
  },
  "cups-queen": {
    visualFocusEn: ["queen holding ornate cup", "water throne", "closed cup", "shoreline"],
    visualFocusZh: ["王后托着华丽杯子", "水边王座", "封闭的杯", "岸线"],
    coreMeaningsEn: ["emotional containment", "empathy", "soft boundary", "care with discernment"],
    coreMeaningsZh: ["情绪容器", "共情", "柔软边界", "有分辨的照顾"],
    reflectiveAnglesEn: ["What feeling needs a container instead of immediate action?", "Where can care include a boundary?"],
    reflectiveAnglesZh: ["哪种感受需要容器，而不是立刻行动？", "哪里可以一边照顾，一边有边界？"],
    groundedSuggestionsEn: ["Offer care in a defined form rather than absorbing the whole emotional field."],
    groundedSuggestionsZh: ["用明确形式提供照顾，不要吸收整个情绪场。"]
  }
};

export function getTarotKnowledge(card?: TarotDeckCard): LocalTarotKnowledge | null {
  if (!card) return null;
  if (card.arcana === "major") {
    const major = majorKnowledge[card.id];
    if (!major) return null;
    return { cardId: card.id, sourceBasis, ...major };
  }
  if (!card.suit || !card.rank) return null;
  const suit = suitKnowledge[card.suit];
  const rankInfo = rankKnowledge[card.rank];
  const base: LocalTarotKnowledge = {
    cardId: card.id,
    sourceBasis,
    visualFocusEn: [...rankInfo.visualEn, ...suit.visualEn],
    visualFocusZh: [...rankInfo.visualZh, ...suit.visualZh],
    coreMeaningsEn: [...rankInfo.coreEn, ...suit.coreEn].slice(0, 7),
    coreMeaningsZh: [...rankInfo.coreZh, ...suit.coreZh].slice(0, 7),
    reflectiveAnglesEn: [
      `How does ${rankInfo.coreEn[0]} appear through ${suit.coreEn[0]} here?`,
      `What concrete ${suit.coreEn[0]} pattern does this card point toward?`
    ],
    reflectiveAnglesZh: [
      `这里的“${rankInfo.coreZh[0]}”如何通过“${suit.coreZh[0]}”出现？`,
      `这张牌指向了怎样具体的${suit.coreZh[0]}模式？`
    ],
    groundedSuggestionsEn: [rankInfo.suggestionEn],
    groundedSuggestionsZh: [rankInfo.suggestionZh]
  };
  return { ...base, ...(minorOverrides[card.id] || {}) };
}

export function formatTarotKnowledgeForPrompt(card: TarotDeckCard | undefined, language: Language): string {
  const knowledge = getTarotKnowledge(card);
  if (!knowledge || !card) return language === "zh" ? "暂无本地牌义资料。" : "No local card knowledge available.";
  const zh = language === "zh";
  const lines = zh
    ? [
        `本地牌义资料：${card.nameZh} / ${card.nameEn}`,
        `资料来源基准：${knowledge.sourceBasis}`,
        `画面可观察元素：${knowledge.visualFocusZh.join("；")}`,
        `核心关键词：${knowledge.coreMeaningsZh.join("；")}`,
        `可追问角度：${knowledge.reflectiveAnglesZh.join("；")}`,
        `可参考的温和建议：${knowledge.groundedSuggestionsZh.join("；")}`
      ]
    : [
        `Local card knowledge: ${card.nameEn} / ${card.nameZh}`,
        `Source basis: ${knowledge.sourceBasis}`,
        `Observable visual elements: ${knowledge.visualFocusEn.join("; ")}`,
        `Core keywords: ${knowledge.coreMeaningsEn.join("; ")}`,
        `Reflective angles: ${knowledge.reflectiveAnglesEn.join("; ")}`,
        `Grounded suggestions: ${knowledge.groundedSuggestionsEn.join("; ")}`
      ];
  return lines.join("\n");
}

export function getDisplayKeywords(card: TarotDeckCard, language: Language): string[] {
  const knowledge = getTarotKnowledge(card);
  if (!knowledge) return language === "zh" ? card.keywordsZh : card.keywordsEn;
  const values = language === "zh" ? knowledge.coreMeaningsZh : knowledge.coreMeaningsEn;
  return values.slice(0, 5);
}

function item(
  visualFocusEn: string[],
  visualFocusZh: string[],
  coreMeaningsEn: string[],
  coreMeaningsZh: string[],
  reflectiveAnglesEn: string[],
  reflectiveAnglesZh: string[],
  groundedSuggestionsEn: string[],
  groundedSuggestionsZh: string[]
): Omit<LocalTarotKnowledge, "cardId" | "sourceBasis"> {
  return { visualFocusEn, visualFocusZh, coreMeaningsEn, coreMeaningsZh, reflectiveAnglesEn, reflectiveAnglesZh, groundedSuggestionsEn, groundedSuggestionsZh };
}

function rank(
  visualEn: string[],
  visualZh: string[],
  coreEn: string[],
  coreZh: string[],
  suggestionEn: string,
  suggestionZh: string
) {
  return { visualEn, visualZh, coreEn, coreZh, suggestionEn, suggestionZh };
}
