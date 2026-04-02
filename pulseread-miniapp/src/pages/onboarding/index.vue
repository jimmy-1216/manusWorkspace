<template>
  <view class="onboarding-page">
    <!-- 步骤指示器 -->
    <view class="step-indicator" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view v-for="i in 3" :key="i" class="step-dot" :class="{ active: currentStep >= i, current: currentStep === i }"></view>
    </view>

    <!-- 步骤内容 -->
    <swiper
      class="step-swiper"
      :current="currentStep - 1"
      :disable-touch="true"
      :duration="300"
    >
      <!-- 步骤 1：产品介绍 -->
      <swiper-item>
        <view class="step-content">
          <view class="step-hero">
            <view class="hero-icon-wrap">
              <text class="hero-main-icon">🌊</text>
              <view class="hero-glow"></view>
            </view>
            <text class="hero-title">微澜 PulseRead</text>
            <text class="hero-subtitle">AI 驱动的跨领域资讯聚合</text>
          </view>

          <view class="feature-list">
            <view v-for="feature in step1Features" :key="feature.icon" class="feature-item">
              <view class="feature-icon-wrap">
                <text class="feature-icon">{{ feature.icon }}</text>
              </view>
              <view class="feature-info">
                <text class="feature-title">{{ feature.title }}</text>
                <text class="feature-desc">{{ feature.desc }}</text>
              </view>
            </view>
          </view>
        </view>
      </swiper-item>

      <!-- 步骤 2：选择领域 -->
      <swiper-item>
        <view class="step-content">
          <view class="step-header">
            <text class="step-title">选择你感兴趣的领域</text>
            <text class="step-desc">至少选择 1 个，后续可随时调整</text>
          </view>

          <view class="domain-grid">
            <view
              v-for="domain in DOMAIN_CONFIGS"
              :key="domain.key"
              class="domain-card"
              :class="{ selected: selectedDomains.includes(domain.key) }"
              :style="selectedDomains.includes(domain.key) ? { borderColor: domain.color, backgroundColor: domain.bgColor } : {}"
              @tap="toggleDomain(domain.key)"
            >
              <text class="domain-icon">{{ domain.icon }}</text>
              <text class="domain-name" :style="selectedDomains.includes(domain.key) ? { color: domain.color } : {}">
                {{ domain.label }}
              </text>
              <text class="domain-desc">{{ domain.description }}</text>
              <view v-if="selectedDomains.includes(domain.key)" class="domain-check"
                :style="{ backgroundColor: domain.color }">✓</view>
            </view>
          </view>
        </view>
      </swiper-item>

      <!-- 步骤 3：设置降噪档位 -->
      <swiper-item>
        <view class="step-content">
          <view class="step-header">
            <text class="step-title">设置你的降噪档位</text>
            <text class="step-desc">控制每日资讯密度，后续可随时调整</text>
          </view>

          <view class="noise-list">
            <view
              v-for="level in NOISE_LEVEL_CONFIGS"
              :key="level.key"
              class="noise-item"
              :class="{ selected: selectedNoiseLevel === level.key }"
              @tap="selectedNoiseLevel = level.key"
            >
              <view class="noise-left">
                <text class="noise-icon">{{ level.icon }}</text>
                <view class="noise-info">
                  <view class="noise-name-row">
                    <text class="noise-name">{{ level.label }}</text>
                    <view v-if="level.recommended" class="recommended-badge">推荐</view>
                  </view>
                  <text class="noise-desc">{{ level.description }}</text>
                  <text class="noise-count">{{ level.dailyCount }}</text>
                </view>
              </view>
              <view v-if="selectedNoiseLevel === level.key" class="check-mark">✓</view>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <!-- 底部操作区 -->
    <view class="bottom-actions" :style="{ paddingBottom: safeAreaBottom + 'px' }">
      <view v-if="currentStep > 1" class="back-btn" @tap="handleBack">
        <text>上一步</text>
      </view>
      <view
        class="next-btn"
        :class="{ disabled: !canProceed }"
        @tap="handleNext"
      >
        <text>{{ currentStep === 3 ? '开始使用微澜 🚀' : '下一步' }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { DomainType, NoiseLevel } from '@/types'
import { DOMAIN_CONFIGS, NOISE_LEVEL_CONFIGS, STORAGE_KEYS } from '@/utils/constants'
import { usePreferenceStore } from '@/stores/preference'
import { useUserStore } from '@/stores/user'
import { getStatusBarHeight, getSafeAreaBottom } from '@/utils'

const preferenceStore = usePreferenceStore()
const userStore = useUserStore()

const statusBarHeight = ref(getStatusBarHeight())
const safeAreaBottom = ref(getSafeAreaBottom())
const currentStep = ref(1)
const selectedDomains = ref<DomainType[]>(['tech', 'finance'])
const selectedNoiseLevel = ref<NoiseLevel>('focus')

const step1Features = [
  { icon: '🎚️', title: '4 档降噪滑块', desc: '从视野全开到行业地震，精准控制信息密度' },
  { icon: '📡', title: '专属雷达词', desc: '关键词命中即置顶，穿透所有降噪档位' },
  { icon: '🤖', title: 'AI 深度提炼', desc: '核心摘要、要点提取、快捷问答一键获取' },
  { icon: '🌐', title: '国内外双轨', desc: '科技、财经、政策、商情四大领域全覆盖' },
]

const canProceed = computed(() => {
  if (currentStep.value === 2) return selectedDomains.value.length > 0
  return true
})

function toggleDomain(domain: DomainType) {
  const idx = selectedDomains.value.indexOf(domain)
  if (idx >= 0) {
    if (selectedDomains.value.length > 1) {
      selectedDomains.value.splice(idx, 1)
    }
  } else {
    selectedDomains.value.push(domain)
  }
}

function handleBack() {
  if (currentStep.value > 1) currentStep.value--
}

function handleNext() {
  if (!canProceed.value) return

  if (currentStep.value < 3) {
    currentStep.value++
  } else {
    // 完成 Onboarding
    finishOnboarding()
  }
}

function finishOnboarding() {
  // 保存偏好设置
  preferenceStore.updatePreference({
    domains: selectedDomains.value,
    noiseLevel: selectedNoiseLevel.value,
  })

  // 使用 mock 用户
  userStore.useMockUser()

  // 标记已完成 Onboarding
  uni.setStorageSync(STORAGE_KEYS.HAS_ONBOARDED, true)

  // 跳转到主页
  uni.reLaunch({ url: '/pages/feed/index' })
}
</script>

<style lang="scss" scoped>
.onboarding-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

/* 步骤指示器 */
.step-indicator {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx 0 16rpx;
}

.step-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #e0e0e0;
  transition: all 0.3s;

  &.active {
    background: #1DB954;
  }

  &.current {
    width: 32rpx;
    border-radius: 6rpx;
  }
}

/* 步骤轮播 */
.step-swiper {
  flex: 1;
  height: calc(100vh - 200rpx);
}

.step-content {
  height: 100%;
  padding: 0 32rpx;
  overflow-y: auto;
}

/* 步骤 1 Hero */
.step-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0 40rpx;
}

.hero-icon-wrap {
  position: relative;
  margin-bottom: 32rpx;
}

.hero-main-icon {
  font-size: 120rpx;
  display: block;
  text-align: center;
}

.hero-glow {
  position: absolute;
  bottom: -20rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 120rpx;
  height: 30rpx;
  background: radial-gradient(ellipse, rgba(29, 185, 84, 0.3), transparent);
  border-radius: 50%;
}

.hero-title {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 12rpx;
  text-align: center;
}

.hero-subtitle {
  display: block;
  font-size: 28rpx;
  color: #999;
  text-align: center;
}

/* 功能列表 */
.feature-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx;
  background: #f9fafb;
  border-radius: 16rpx;
  border: 1rpx solid #f0f0f0;
}

.feature-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: #f0fdf4;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon {
  font-size: 40rpx;
}

.feature-info {
  flex: 1;
}

.feature-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6rpx;
}

.feature-desc {
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
}

/* 步骤标题 */
.step-header {
  padding: 32rpx 0 32rpx;
  text-align: center;
}

.step-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12rpx;
}

.step-desc {
  font-size: 26rpx;
  color: #999;
}

/* 领域网格 */
.domain-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.domain-card {
  position: relative;
  padding: 28rpx 20rpx;
  border-radius: 20rpx;
  border: 2rpx solid #f0f0f0;
  background: #fafafa;
  transition: all 0.2s;

  &.selected {
    border-width: 2rpx;
  }

  &:active {
    opacity: 0.8;
  }
}

.domain-icon {
  display: block;
  font-size: 52rpx;
  margin-bottom: 16rpx;
}

.domain-name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8rpx;
}

.domain-desc {
  display: block;
  font-size: 20rpx;
  color: #999;
  line-height: 1.5;
}

.domain-check {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 降噪档位列表 */
.noise-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.noise-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  border-radius: 16rpx;
  border: 2rpx solid #f0f0f0;
  background: #fafafa;
  transition: all 0.2s;

  &.selected {
    background: #f0fdf4;
    border-color: #1DB954;
  }

  &:active {
    opacity: 0.8;
  }
}

.noise-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.noise-icon {
  font-size: 48rpx;
  width: 60rpx;
  text-align: center;
}

.noise-info {
  flex: 1;
}

.noise-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 6rpx;
}

.noise-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.recommended-badge {
  padding: 2rpx 12rpx;
  background: #1DB954;
  color: #fff;
  border-radius: 999rpx;
  font-size: 18rpx;
}

.noise-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 4rpx;
}

.noise-count {
  font-size: 22rpx;
  color: #bbb;
}

.check-mark {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: #1DB954;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 底部操作区 */
.bottom-actions {
  padding: 24rpx 32rpx;
  display: flex;
  gap: 16rpx;
  background: #ffffff;
  border-top: 1rpx solid #f0f0f0;
}

.back-btn {
  padding: 28rpx 40rpx;
  border-radius: 999rpx;
  border: 1rpx solid #e0e0e0;
  font-size: 30rpx;
  color: #666;
  font-weight: 500;
  text-align: center;

  &:active {
    background: #f5f5f5;
  }
}

.next-btn {
  flex: 1;
  padding: 28rpx;
  border-radius: 999rpx;
  background: #1DB954;
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 600;
  text-align: center;
  transition: all 0.2s;

  &:active {
    background: #17A348;
    transform: scale(0.98);
  }

  &.disabled {
    background: #e0e0e0;
    color: #999;
  }
}
</style>
