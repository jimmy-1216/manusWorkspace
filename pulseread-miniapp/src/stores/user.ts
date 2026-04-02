import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import { STORAGE_KEYS } from '@/utils/constants'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>('')
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)

  /** 从本地存储初始化 */
  function initFromStorage() {
    const storedToken = uni.getStorageSync(STORAGE_KEYS.USER_TOKEN)
    const storedUser = uni.getStorageSync(STORAGE_KEYS.USER_INFO)
    if (storedToken) token.value = storedToken
    if (storedUser) {
      try {
        userInfo.value = JSON.parse(storedUser)
      } catch {}
    }
  }

  /** 登录成功后设置用户信息 */
  function setUser(newToken: string, info: UserInfo) {
    token.value = newToken
    userInfo.value = info
    uni.setStorageSync(STORAGE_KEYS.USER_TOKEN, newToken)
    uni.setStorageSync(STORAGE_KEYS.USER_INFO, JSON.stringify(info))
  }

  /** 更新用户信息 */
  function updateUserInfo(info: Partial<UserInfo>) {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
      uni.setStorageSync(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo.value))
    }
  }

  /** 退出登录 */
  function logout() {
    token.value = ''
    userInfo.value = null
    uni.removeStorageSync(STORAGE_KEYS.USER_TOKEN)
    uni.removeStorageSync(STORAGE_KEYS.USER_INFO)
    uni.reLaunch({ url: '/pages/login/index' })
  }

  /** 使用 Mock 用户（演示模式） */
  function useMockUser() {
    const mockUser: UserInfo = {
      id: 'mock_001',
      nickname: '微澜用户',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pulseread',
      memberLevel: 'free',
      stats: {
        readCount: 128,
        collectCount: 23,
        likeCount: 45,
        followDays: 7,
      },
    }
    userInfo.value = mockUser
    token.value = 'mock_token'
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    initFromStorage,
    setUser,
    updateUserInfo,
    logout,
    useMockUser,
  }
})
