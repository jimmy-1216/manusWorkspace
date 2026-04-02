<template>
  <view class="login-page">
    <!-- 返回按钮 -->
    <view class="nav-back" :style="{ paddingTop: statusBarHeight + 'px' }" @tap="handleBack">
      <text class="back-icon">‹</text>
    </view>

    <!-- Logo 区域 -->
    <view class="logo-section">
      <view class="logo-wrap">
        <text class="logo-icon">🌊</text>
        <view class="logo-glow"></view>
      </view>
      <text class="logo-title">微澜 PulseRead</text>
      <text class="logo-subtitle">AI 驱动的资讯聚合阅读</text>
    </view>

    <!-- 登录方式 -->
    <view class="login-section">
      <!-- 微信一键登录 -->
      <view class="wx-login-btn" @tap="handleWxLogin">
        <text class="wx-icon">💬</text>
        <text class="wx-text">微信一键登录</text>
      </view>

      <!-- 分割线 -->
      <view class="divider">
        <view class="divider-line"></view>
        <text class="divider-text">或使用手机号登录</text>
        <view class="divider-line"></view>
      </view>

      <!-- 手机号登录 -->
      <view class="phone-form">
        <view class="input-group">
          <text class="input-prefix">+86</text>
          <input
            v-model="phone"
            class="phone-input"
            type="number"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </view>

        <view class="code-group">
          <input
            v-model="code"
            class="code-input"
            type="number"
            placeholder="验证码"
            maxlength="6"
          />
          <view
            class="send-code-btn"
            :class="{ disabled: !canSendCode || countdown > 0 }"
            @tap="handleSendCode"
          >
            <text>{{ countdown > 0 ? `${countdown}s` : '获取验证码' }}</text>
          </view>
        </view>

        <view
          class="phone-login-btn"
          :class="{ active: canLogin }"
          @tap="handlePhoneLogin"
        >
          <text>登录 / 注册</text>
        </view>
      </view>
    </view>

    <!-- 协议说明 -->
    <view class="agreement">
      <text class="agreement-text">登录即代表同意</text>
      <text class="agreement-link" @tap="handleUserAgreement">《用户协议》</text>
      <text class="agreement-text">和</text>
      <text class="agreement-link" @tap="handlePrivacyPolicy">《隐私政策》</text>
    </view>

    <!-- 游客模式 -->
    <view class="guest-btn" @tap="handleGuestMode">
      <text>暂不登录，以游客模式体验</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { getStatusBarHeight, showToast } from '@/utils'
import { STORAGE_KEYS } from '@/utils/constants'

const userStore = useUserStore()
const statusBarHeight = ref(getStatusBarHeight())

const phone = ref('')
const code = ref('')
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

const canSendCode = computed(() => /^1[3-9]\d{9}$/.test(phone.value))
const canLogin = computed(() => canSendCode.value && code.value.length === 6)

function handleBack() {
  uni.navigateBack()
}

function handleWxLogin() {
  uni.showLoading({ title: '登录中...', mask: true })
  // 模拟微信登录
  setTimeout(() => {
    uni.hideLoading()
    userStore.useMockUser()
    uni.setStorageSync(STORAGE_KEYS.HAS_ONBOARDED, true)
    showToast('登录成功', 'success')
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/feed/index' })
    }, 500)
  }, 1500)
}

function handleSendCode() {
  if (!canSendCode.value || countdown.value > 0) return

  showToast('验证码已发送', 'success')
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (countdownTimer) clearInterval(countdownTimer)
    }
  }, 1000)
}

function handlePhoneLogin() {
  if (!canLogin.value) return

  uni.showLoading({ title: '登录中...', mask: true })
  setTimeout(() => {
    uni.hideLoading()
    userStore.useMockUser()
    uni.setStorageSync(STORAGE_KEYS.HAS_ONBOARDED, true)
    showToast('登录成功', 'success')
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/feed/index' })
    }, 500)
  }, 1200)
}

function handleGuestMode() {
  userStore.useMockUser()
  uni.setStorageSync(STORAGE_KEYS.HAS_ONBOARDED, true)
  uni.reLaunch({ url: '/pages/feed/index' })
}

function handleUserAgreement() {
  showToast('用户协议开发中', 'none')
}

function handlePrivacyPolicy() {
  showToast('隐私政策开发中', 'none')
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 48rpx;
}

/* 返回按钮 */
.nav-back {
  align-self: flex-start;
  padding: 16rpx 0 0;
}

.back-icon {
  font-size: 56rpx;
  color: #1a1a1a;
  line-height: 1;
  padding: 8rpx;
}

/* Logo 区域 */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0 64rpx;
}

.logo-wrap {
  position: relative;
  margin-bottom: 32rpx;
}

.logo-icon {
  font-size: 120rpx;
  display: block;
  text-align: center;
}

.logo-glow {
  position: absolute;
  bottom: -16rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 100rpx;
  height: 24rpx;
  background: radial-gradient(ellipse, rgba(29, 185, 84, 0.25), transparent);
  border-radius: 50%;
}

.logo-title {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 12rpx;
}

.logo-subtitle {
  font-size: 26rpx;
  color: #999;
}

/* 登录区域 */
.login-section {
  width: 100%;
}

/* 微信登录按钮 */
.wx-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  width: 100%;
  padding: 32rpx 0;
  background: #07C160;
  border-radius: 999rpx;
  margin-bottom: 40rpx;
  transition: all 0.2s;

  &:active {
    background: #06AD56;
    transform: scale(0.98);
  }
}

.wx-icon {
  font-size: 36rpx;
}

.wx-text {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 600;
}

/* 分割线 */
.divider {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: #e8e8e8;
}

.divider-text {
  font-size: 24rpx;
  color: #bbb;
  white-space: nowrap;
}

/* 手机号表单 */
.phone-form {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.input-group {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 16rpx;
  padding: 0 24rpx;
  border: 1rpx solid #e8e8e8;
}

.input-prefix {
  font-size: 28rpx;
  color: #333;
  padding-right: 16rpx;
  border-right: 1rpx solid #e0e0e0;
  margin-right: 16rpx;
}

.phone-input {
  flex: 1;
  font-size: 30rpx;
  color: #1a1a1a;
  padding: 28rpx 0;
  background: transparent;
}

.code-group {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.code-input {
  flex: 1;
  font-size: 30rpx;
  color: #1a1a1a;
  padding: 28rpx 24rpx;
  background: #f5f7fa;
  border-radius: 16rpx;
  border: 1rpx solid #e8e8e8;
}

.send-code-btn {
  padding: 28rpx 24rpx;
  background: #f0fdf4;
  border: 1rpx solid #bbf7d0;
  border-radius: 16rpx;
  font-size: 26rpx;
  color: #1DB954;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;

  &.disabled {
    background: #f5f5f5;
    border-color: #e0e0e0;
    color: #bbb;
  }

  &:active:not(.disabled) {
    background: #dcfce7;
  }
}

.phone-login-btn {
  padding: 32rpx 0;
  border-radius: 999rpx;
  background: #e0e0e0;
  font-size: 32rpx;
  color: #999;
  font-weight: 600;
  text-align: center;
  transition: all 0.2s;

  &.active {
    background: #1DB954;
    color: #ffffff;

    &:active {
      background: #17A348;
      transform: scale(0.98);
    }
  }
}

/* 协议说明 */
.agreement {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 40rpx;
  gap: 4rpx;
}

.agreement-text {
  font-size: 22rpx;
  color: #bbb;
}

.agreement-link {
  font-size: 22rpx;
  color: #1DB954;
}

/* 游客模式 */
.guest-btn {
  margin-top: 32rpx;
  padding: 16rpx 32rpx;
  font-size: 26rpx;
  color: #999;
  text-decoration: underline;

  &:active {
    color: #666;
  }
}
</style>
