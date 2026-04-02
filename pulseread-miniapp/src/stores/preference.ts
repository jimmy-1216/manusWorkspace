import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserPreference, NoiseLevel, DomainType } from '@/types'
import { STORAGE_KEYS, NOISE_LEVEL_CONFIGS } from '@/utils/constants'

const DEFAULT_PREFERENCE: UserPreference = {
  noiseLevel: 'focus',
  domains: ['tech', 'finance'],
  regions: ['all'],
  radarWords: ['GPT-5', 'OpenAI'],
  enableNotification: true,
  enableAutoTranslate: true,
  readingMode: 'comfortable',
  regionPref: 'all',
  blockedSentiments: [],
}

export const usePreferenceStore = defineStore('preference', () => {
  const preference = ref<UserPreference>({ ...DEFAULT_PREFERENCE })

  const currentNoiseLevelConfig = computed(() =>
    NOISE_LEVEL_CONFIGS.find(n => n.key === preference.value.noiseLevel)!
  )

  /** 从本地存储初始化 */
  function initFromStorage() {
    const stored = uni.getStorageSync(STORAGE_KEYS.PREFERENCE)
    if (stored) {
      try {
        preference.value = { ...DEFAULT_PREFERENCE, ...JSON.parse(stored) }
      } catch {}
    }
  }

  /** 保存到本地存储 */
  function saveToStorage() {
    uni.setStorageSync(STORAGE_KEYS.PREFERENCE, JSON.stringify(preference.value))
  }

  /** 设置降噪档位 */
  function setNoiseLevel(level: NoiseLevel) {
    preference.value.noiseLevel = level
    saveToStorage()
  }

  /** 切换领域订阅 */
  function toggleDomain(domain: DomainType) {
    const idx = preference.value.domains.indexOf(domain)
    if (idx >= 0) {
      if (preference.value.domains.length > 1) {
        preference.value.domains.splice(idx, 1)
      } else {
        uni.showToast({ title: '至少保留一个领域', icon: 'none' })
        return
      }
    } else {
      preference.value.domains.push(domain)
    }
    saveToStorage()
  }

  /** 添加雷达词 */
  function addRadarWord(word: string) {
    const trimmed = word.trim()
    if (!trimmed) return
    if (preference.value.radarWords.includes(trimmed)) {
      uni.showToast({ title: '该雷达词已存在', icon: 'none' })
      return
    }
    if (preference.value.radarWords.length >= 20) {
      uni.showToast({ title: '最多添加 20 个雷达词', icon: 'none' })
      return
    }
    preference.value.radarWords.push(trimmed)
    saveToStorage()
  }

  /** 删除雷达词 */
  function removeRadarWord(word: string) {
    const idx = preference.value.radarWords.indexOf(word)
    if (idx >= 0) {
      preference.value.radarWords.splice(idx, 1)
      saveToStorage()
    }
  }

  /** 设置地区偏好 */
  function setRegionPref(region: import('@/types').RegionType) {
    preference.value.regionPref = region
    saveToStorage()
  }

  /** 切换屏蔽情绪 */
  function toggleBlockedSentiment(sentiment: string) {
    const idx = preference.value.blockedSentiments.indexOf(sentiment)
    if (idx >= 0) {
      preference.value.blockedSentiments.splice(idx, 1)
    } else {
      preference.value.blockedSentiments.push(sentiment)
    }
    saveToStorage()
  }

  /** 更新偏好设置 */
  function updatePreference(data: Partial<UserPreference>) {
    preference.value = { ...preference.value, ...data }
    saveToStorage()
  }

  /** 重置为默认设置 */
  function resetToDefault() {
    preference.value = { ...DEFAULT_PREFERENCE }
    saveToStorage()
  }

  return {
    preference,
    currentNoiseLevelConfig,
    initFromStorage,
    setNoiseLevel,
    toggleDomain,
    addRadarWord,
    removeRadarWord,
    updatePreference,
    setRegionPref,
    toggleBlockedSentiment,
    resetToDefault,
  }
})
