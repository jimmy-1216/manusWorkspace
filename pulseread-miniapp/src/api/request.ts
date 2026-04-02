import type { ApiResponse } from '@/types'
import { STORAGE_KEYS } from '@/utils/constants'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.pulseread.app'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: Record<string, any>
  headers?: Record<string, string>
  loading?: boolean
}

/** 统一请求封装 */
export function request<T = any>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, headers = {}, loading = false } = options

  const token = uni.getStorageSync(STORAGE_KEYS.USER_TOKEN)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  headers['Content-Type'] = 'application/json'

  if (loading) {
    uni.showLoading({ title: '加载中...', mask: true })
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: headers,
      success: (res) => {
        if (loading) uni.hideLoading()
        const response = res.data as ApiResponse<T>
        if (res.statusCode === 200 && response.code === 0) {
          resolve(response.data)
        } else {
          const msg = response?.message || '请求失败'
          uni.showToast({ title: msg, icon: 'none' })
          reject(new Error(msg))
        }
      },
      fail: (err) => {
        if (loading) uni.hideLoading()
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
        reject(err)
      },
    })
  })
}

export const http = {
  get: <T>(url: string, data?: Record<string, any>, options?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'GET', data, ...options }),

  post: <T>(url: string, data?: Record<string, any>, options?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'POST', data, ...options }),

  put: <T>(url: string, data?: Record<string, any>, options?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'PUT', data, ...options }),

  delete: <T>(url: string, data?: Record<string, any>, options?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'DELETE', data, ...options }),
}
