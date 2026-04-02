import type { DomainConfig, NoiseLevelConfig } from '@/types'

/** 领域配置 */
export const DOMAIN_CONFIGS: DomainConfig[] = [
  {
    key: 'tech',
    label: '科技',
    icon: '💻',
    description: '前沿技术、AI、芯片、云计算',
    color: '#1677FF',
    bgColor: '#E6F4FF',
  },
  {
    key: 'finance',
    label: '财经',
    icon: '📈',
    description: '宏观经济、股市、投融资',
    color: '#FA8C16',
    bgColor: '#FFF7E6',
  },
  {
    key: 'policy',
    label: '政策',
    icon: '🏛️',
    description: '监管政策、法律法规、贸易',
    color: '#52C41A',
    bgColor: '#F6FFED',
  },
  {
    key: 'commerce',
    label: '商情',
    icon: '📋',
    description: '招投标、商业情报、竞争分析',
    color: '#EB2F96',
    bgColor: '#FFF0F6',
  },
]

/** 降噪档位配置 */
export const NOISE_LEVEL_CONFIGS: NoiseLevelConfig[] = [
  {
    key: 'open',
    label: '视野全开',
    icon: '📶',
    description: '全部资讯，不过滤',
    scoreThreshold: 0,
    dailyCount: '200+ 条/天',
  },
  {
    key: 'focus',
    label: '核心聚焦',
    icon: '🎯',
    description: 'AI 评分 60 分以上',
    scoreThreshold: 60,
    dailyCount: '约 80 条/天',
    recommended: true,
  },
  {
    key: 'major',
    label: '重大事件',
    icon: '🔥',
    description: 'AI 评分 75 分以上',
    scoreThreshold: 75,
    dailyCount: '约 30 条/天',
  },
  {
    key: 'quake',
    label: '行业地震',
    icon: '⚡',
    description: 'AI 评分 88 分以上',
    scoreThreshold: 88,
    dailyCount: '约 5 条/天',
  },
]

/** 推荐雷达词 */
export const SUGGESTED_RADAR_WORDS = [
  'GPT-5', 'OpenAI', 'A股', '新能源', '半导体',
  '大模型', '美联储', '招投标', '政策监管', '芯片',
  '人工智能', '降息', '碳中和', '数字经济',
]

/** 快捷提问模板（按领域） */
export const QUICK_QUESTIONS: Record<string, string[]> = {
  tech: [
    '这项技术的商业化落地难点？',
    '国内有哪些类似竞争者？',
    '对开发者意味着什么？',
    '技术指标提升了多少？',
  ],
  finance: [
    '这件事对 A 股有什么影响？',
    '用一句话总结核心观点',
    '有哪些相关背景信息？',
    '哪些行业板块会受益？',
  ],
  policy: [
    '这项政策的执行时间表？',
    '对哪些企业影响最大？',
    '与之前政策有何不同？',
    '合规要求有哪些？',
  ],
  commerce: [
    '这个项目的招标条件？',
    '有哪些潜在竞争对手？',
    '项目的商业价值分析',
    '类似项目有哪些参考？',
  ],
  default: [
    '用一句话总结核心观点',
    '有哪些相关背景信息？',
    '这件事对市场有什么影响？',
    '有哪些相关企业或竞争对手？',
  ],
}

/** 情绪标签配置 */
export const SENTIMENT_CONFIG = {
  positive: { label: '利好', color: '#52C41A', bgColor: '#F6FFED' },
  negative: { label: '利空', color: '#FF4D4F', bgColor: '#FFF1F0' },
  neutral: { label: '中性', color: '#8C8C8C', bgColor: '#FAFAFA' },
}

/** 地区配置 */
export const REGION_CONFIGS = [
  { key: 'all', label: '全部' },
  { key: 'domestic', label: '国内' },
  { key: 'international', label: '国际' },
]

/** 存储 Key */
export const STORAGE_KEYS = {
  HAS_ONBOARDED: 'has_onboarded',
  USER_INFO: 'user_info',
  USER_TOKEN: 'user_token',
  PREFERENCE: 'user_preference',
  SEARCH_HISTORY: 'search_history',
  READ_HISTORY: 'read_history',
}
