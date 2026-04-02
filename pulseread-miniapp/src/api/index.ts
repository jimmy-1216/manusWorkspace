import { http } from './request'
import type { Article, UserInfo, UserPreference, PaginationParams, PaginationResponse } from '@/types'

/** 资讯相关 API */
export const articleApi = {
  /** 获取资讯列表 */
  getList: (params: PaginationParams & {
    domain?: string
    region?: string
    noiseLevel?: string
    keyword?: string
  }) => http.get<PaginationResponse<Article>>('/api/articles', params),

  /** 获取资讯详情 */
  getDetail: (id: number) => http.get<Article>(`/api/articles/${id}`),

  /** 点赞 */
  like: (id: number) => http.post<{ likeCount: number }>(`/api/articles/${id}/like`),

  /** 取消点赞 */
  unlike: (id: number) => http.delete<{ likeCount: number }>(`/api/articles/${id}/like`),

  /** 收藏 */
  collect: (id: number) => http.post<{ collectCount: number }>(`/api/articles/${id}/collect`),

  /** 取消收藏 */
  uncollect: (id: number) => http.delete<{ collectCount: number }>(`/api/articles/${id}/collect`),

  /** 纠错反馈 */
  feedback: (id: number, content: string) =>
    http.post(`/api/articles/${id}/feedback`, { content }),

  /** AI 问答 */
  aiChat: (id: number, question: string) =>
    http.post<{ answer: string }>(`/api/articles/${id}/chat`, { question }),
}

/** 搜索相关 API */
export const searchApi = {
  /** 搜索资讯 */
  search: (keyword: string, params?: PaginationParams) =>
    http.get<PaginationResponse<Article>>('/api/search', { keyword, ...params }),

  /** 获取热门搜索 */
  getHotWords: () => http.get<string[]>('/api/search/hot'),
}

/** 用户相关 API */
export const userApi = {
  /** 微信登录 */
  wxLogin: (code: string) =>
    http.post<{ token: string; userInfo: UserInfo }>('/api/auth/wx-login', { code }),

  /** 手机号登录 */
  phoneLogin: (phone: string, code: string) =>
    http.post<{ token: string; userInfo: UserInfo }>('/api/auth/phone-login', { phone, code }),

  /** 发送验证码 */
  sendCode: (phone: string) => http.post('/api/auth/send-code', { phone }),

  /** 获取用户信息 */
  getProfile: () => http.get<UserInfo>('/api/user/profile'),

  /** 更新用户信息 */
  updateProfile: (data: Partial<UserInfo>) => http.put<UserInfo>('/api/user/profile', data),

  /** 获取收藏列表 */
  getCollects: (params?: PaginationParams) =>
    http.get<PaginationResponse<Article>>('/api/user/collects', params),

  /** 获取阅读历史 */
  getReadHistory: (params?: PaginationParams) =>
    http.get<PaginationResponse<Article>>('/api/user/read-history', params),
}

/** 偏好设置相关 API */
export const preferenceApi = {
  /** 获取偏好设置 */
  get: () => http.get<UserPreference>('/api/preference'),

  /** 更新偏好设置 */
  update: (data: Partial<UserPreference>) => http.put<UserPreference>('/api/preference', data),
}
