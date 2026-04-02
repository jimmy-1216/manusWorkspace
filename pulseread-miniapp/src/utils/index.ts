import type { DomainType, NoiseLevel, SentimentType } from '@/types'
import { DOMAIN_CONFIGS, NOISE_LEVEL_CONFIGS, SENTIMENT_CONFIG } from './constants'

/** 获取领域配置 */
export function getDomainConfig(domain: DomainType) {
  return DOMAIN_CONFIGS.find(d => d.key === domain) || DOMAIN_CONFIGS[0]
}

/** 获取降噪档位配置 */
export function getNoiseLevelConfig(level: NoiseLevel) {
  return NOISE_LEVEL_CONFIGS.find(n => n.key === level) || NOISE_LEVEL_CONFIGS[1]
}

/** 获取情绪配置 */
export function getSentimentConfig(sentiment: SentimentType) {
  return SENTIMENT_CONFIG[sentiment]
}

/** 获取 AI 评分颜色 */
export function getScoreColor(score: number): string {
  if (score >= 88) return '#1DB954'
  if (score >= 75) return '#FA8C16'
  if (score >= 60) return '#1890FF'
  return '#8C8C8C'
}

/** 格式化数字（超过 1000 显示 k） */
export function formatCount(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}w`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return String(count)
}

/** 防抖 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}

/** 节流 */
export function throttle<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let lastTime = 0
  return function (...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn(...args)
    }
  }
}

/** 获取系统状态栏高度 */
export function getStatusBarHeight(): number {
  const systemInfo = uni.getSystemInfoSync()
  return systemInfo.statusBarHeight || 44
}

/** 获取安全区域底部高度 */
export function getSafeAreaBottom(): number {
  const systemInfo = uni.getSystemInfoSync()
  return systemInfo.safeAreaInsets?.bottom || 0
}

/** 显示 Toast */
export function showToast(title: string, icon: 'success' | 'error' | 'loading' | 'none' = 'none') {
  uni.showToast({ title, icon, duration: 2000 })
}

/** 显示 Loading */
export function showLoading(title = '加载中...') {
  uni.showLoading({ title, mask: true })
}

/** 隐藏 Loading */
export function hideLoading() {
  uni.hideLoading()
}

/** 复制到剪贴板 */
export function copyToClipboard(text: string) {
  uni.setClipboardData({
    data: text,
    success: () => showToast('已复制', 'success'),
  })
}

/** 分享文章 */
export function shareArticle(title: string, url?: string) {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline'],
  })
}
