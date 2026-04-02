// ============================================================
// PulseRead 微澜 - 核心类型定义
// ============================================================

/** 领域类型 */
export type DomainType = 'tech' | 'finance' | 'policy' | 'commerce'

/** 地区类型 */
export type RegionType = 'all' | 'domestic' | 'international'

/** 降噪档位 */
export type NoiseLevel = 'open' | 'focus' | 'major' | 'quake'

/** 情绪倾向 */
export type SentimentType = 'positive' | 'negative' | 'neutral'

/** 领域配置 */
export interface DomainConfig {
  key: DomainType
  label: string
  icon: string
  description: string
  color: string
  bgColor: string
}

/** 降噪档位配置 */
export interface NoiseLevelConfig {
  key: NoiseLevel
  label: string
  icon: string
  description: string
  scoreThreshold: number
  dailyCount: string
  recommended?: boolean
}

/** 新闻文章 */
export interface Article {
  id: number
  title: string
  summary: string
  content?: string
  contentEn?: string          // 英文原文
  domain: DomainType
  region: RegionType
  source: string
  sourceUrl?: string
  publishTime: string         // 发布时间（相对）
  publishAt?: string          // 发布时间（绝对）
  aiScore: number             // AI 重要性评分 0-100
  sentiment: SentimentType    // 情绪倾向
  radarWords?: string[]       // 命中的雷达词
  tags?: string[]             // 标签
  isAiTranslated?: boolean    // 是否 AI 翻译
  likeCount: number
  collectCount: number
  isLiked?: boolean
  isCollected?: boolean
  // AI 提炼
  aiSummary?: string
  aiKeyPoints?: string[]
  aiQuestions?: string[]
  // 知识溯源树
  knowledgeTree?: KnowledgeNode[]
}

/** 知识溯源树节点 */
export interface KnowledgeNode {
  id: string
  title: string
  description: string
  date?: string
  children?: KnowledgeNode[]
}

/** 用户信息 */
export interface UserInfo {
  id: string
  nickname: string
  avatar: string
  phone?: string
  email?: string
  memberLevel: 'free' | 'pro' | 'enterprise'
  memberExpireAt?: string
  stats: {
    readCount: number
    collectCount: number
    likeCount: number
    followDays: number
  }
}

/** 搜索历史 */
export interface SearchHistory {
  keyword: string
  searchAt: string
}

/** 偏好设置 */
export interface UserPreference {
  noiseLevel: NoiseLevel
  domains: DomainType[]
  regions: RegionType[]
  radarWords: string[]
  enableNotification: boolean
  enableAutoTranslate: boolean
  readingMode: 'comfortable' | 'compact'
  regionPref: RegionType
  blockedSentiments: string[]
}

/** API 响应格式 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/** 分页参数 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/** 分页响应 */
export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
