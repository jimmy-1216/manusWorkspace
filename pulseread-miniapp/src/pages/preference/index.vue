<template>
  <view class="preference-page">
    <!-- 导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-title">偏好设置</text>
      </view>
    </view>

    <scroll-view class="content-scroll" scroll-y>
      <!-- 降噪档位 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">🎚️ 降噪档位</text>
          <text class="section-desc">控制每日资讯密度</text>
        </view>
        <view class="noise-list">
          <view
            v-for="level in NOISE_LEVEL_CONFIGS"
            :key="level.key"
            class="noise-item"
            :class="{ selected: currentNoiseLevel === level.key }"
            @tap="handleNoiseLevelChange(level.key)"
          >
            <view class="noise-left">
              <text class="noise-icon">{{ level.icon }}</text>
              <view class="noise-info">
                <view class="noise-name-row">
                  <text class="noise-name">{{ level.label }}</text>
                  <view v-if="level.recommended" class="recommended-badge">推荐</view>
                </view>
                <text class="noise-desc">{{ level.description }}</text>
              </view>
            </view>
            <view class="noise-right">
              <text class="noise-count">{{ level.dailyCount }}</text>
              <view v-if="currentNoiseLevel === level.key" class="check-mark">✓</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 领域订阅 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">📰 领域订阅</text>
          <text class="section-desc">选择你感兴趣的领域</text>
        </view>
        <view class="domain-grid">
          <view
            v-for="domain in DOMAIN_CONFIGS"
            :key="domain.key"
            class="domain-card"
            :class="{ selected: subscribedDomains.includes(domain.key) }"
            :style="subscribedDomains.includes(domain.key) ? { borderColor: domain.color, backgroundColor: domain.bgColor } : {}"
            @tap="handleDomainToggle(domain.key)"
          >
            <text class="domain-icon">{{ domain.icon }}</text>
            <text class="domain-name" :style="subscribedDomains.includes(domain.key) ? { color: domain.color } : {}">
              {{ domain.label }}
            </text>
            <text class="domain-desc">{{ domain.description }}</text>
            <view v-if="subscribedDomains.includes(domain.key)" class="domain-check"
              :style="{ backgroundColor: domain.color }">✓</view>
          </view>
        </view>
      </view>

      <!-- 专属雷达词 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">📡 专属雷达词</text>
          <text class="section-desc">命中即置顶，穿透所有降噪</text>
        </view>

        <!-- 添加雷达词 -->
        <view class="radar-input-wrap">
          <input
            v-model="newRadarWord"
            class="radar-input"
            placeholder="输入关键词，如：GPT-5、新能源"
            @confirm="handleAddRadarWord"
          />
          <view class="add-btn" :class="{ active: newRadarWord.trim() }" @tap="handleAddRadarWord">
            添加
          </view>
        </view>

        <!-- 已添加的雷达词 -->
        <view v-if="radarWords.length > 0" class="radar-tags">
          <view
            v-for="word in radarWords"
            :key="word"
            class="radar-tag"
          >
            <text class="radar-word">{{ word }}</text>
            <text class="radar-delete" @tap="handleRemoveRadarWord(word)">×</text>
          </view>
        </view>
        <view v-else class="radar-empty">
          <text>还没有雷达词，添加后命中即置顶</text>
        </view>

        <!-- 推荐词库 -->
        <view class="suggested-section">
          <text class="suggested-title">推荐词库</text>
          <view class="suggested-tags">
            <view
              v-for="word in suggestedWords"
              :key="word"
              class="suggested-tag"
              :class="{ added: radarWords.includes(word) }"
              @tap="handleSuggestedWord(word)"
            >
              <text>{{ radarWords.includes(word) ? '✓ ' : '+ ' }}{{ word }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 地区偏好 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">🌍 地区偏好</text>
          <text class="section-desc">设置默认地区筛选</text>
        </view>
        <view class="region-options">
          <view
            v-for="r in regionOptions"
            :key="r.key"
            class="region-option"
            :class="{ selected: (preference.regionPref || 'all') === r.key }"
            @tap="handleRegionPrefChange(r.key)"
          >
            <text class="region-option-icon">{{ r.icon }}</text>
            <text class="region-option-label">{{ r.label }}</text>
            <text class="region-option-desc">{{ r.desc }}</text>
          </view>
        </view>
      </view>

      <!-- 情绪过滤 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">😊 情绪过滤</text>
          <text class="section-desc">屏蔽特定情绪倾向的资讯</text>
        </view>
        <view class="sentiment-list">
          <view
            v-for="s in sentimentOptions"
            :key="s.key"
            class="sentiment-item"
            :class="{ blocked: (preference.blockedSentiments || []).includes(s.key) }"
            @tap="handleSentimentToggle(s.key)"
          >
            <view class="sentiment-left">
              <text class="sentiment-icon">{{ s.icon }}</text>
              <view class="sentiment-info">
                <text class="sentiment-name">{{ s.label }}</text>
                <text class="sentiment-desc">{{ s.desc }}</text>
              </view>
            </view>
            <view class="sentiment-status" :class="{ blocked: (preference.blockedSentiments || []).includes(s.key) }">
              {{ (preference.blockedSentiments || []).includes(s.key) ? '✕ 已屏蔽' : '未屏蔽' }}
            </view>
          </view>
        </view>
      </view>

      <!-- 阅读偏好 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">⚙️ 阅读偏好</text>
        </view>
        <view class="settings-list">
          <view class="setting-item">
            <view class="setting-left">
              <text class="setting-icon">🌐</text>
              <view class="setting-info">
                <text class="setting-name">自动翻译</text>
                <text class="setting-desc">国际资讯自动 AI 翻译</text>
              </view>
            </view>
            <switch
              :checked="preference.enableAutoTranslate"
              color="#1DB954"
              @change="handleToggleTranslate"
            />
          </view>
          <view class="setting-item">
            <view class="setting-left">
              <text class="setting-icon">🔔</text>
              <view class="setting-info">
                <text class="setting-name">重要资讯通知</text>
                <text class="setting-desc">行业地震级别资讯推送</text>
              </view>
            </view>
            <switch
              :checked="preference.enableNotification"
              color="#1DB954"
              @change="handleToggleNotification"
            />
          </view>
          <view class="setting-item">
            <view class="setting-left">
              <text class="setting-icon">📖</text>
              <view class="setting-info">
                <text class="setting-name">阅读模式</text>
                <text class="setting-desc">{{ preference.readingMode === 'comfortable' ? '舒适模式' : '紧凑模式' }}</text>
              </view>
            </view>
            <view class="mode-toggle" @tap="handleToggleReadingMode">
              <text class="mode-text">{{ preference.readingMode === 'comfortable' ? '舒适' : '紧凑' }}</text>
              <text class="mode-arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部安全区 -->
      <view style="height: 120rpx;"></view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { DomainType, NoiseLevel } from '@/types'
import { usePreferenceStore } from '@/stores/preference'
import { DOMAIN_CONFIGS, NOISE_LEVEL_CONFIGS, SUGGESTED_RADAR_WORDS } from '@/utils/constants'
import { getStatusBarHeight, showToast } from '@/utils'

const preferenceStore = usePreferenceStore()
const statusBarHeight = ref(getStatusBarHeight())
const newRadarWord = ref('')

const regionOptions = [
  { key: 'all' as const, label: '全部地区', icon: '🌍', desc: '国内外资讯不限' },
  { key: 'domestic' as const, label: '仅国内', icon: '🇨🇳', desc: '只看国内相关资讯' },
  { key: 'international' as const, label: '仅国际', icon: '🌐', desc: '只看国际相关资讯' },
]

const sentimentOptions = [
  { key: 'negative', label: '负面情绪', icon: '😟', desc: '过滤带有负面倾向的资讯' },
  { key: 'positive', label: '正面情绪', icon: '😊', desc: '过滤带有正面倾向的资讯' },
  { key: 'neutral', label: '中性情绪', icon: '😐', desc: '过滤中性客观的资讯' },
]

const preference = computed(() => preferenceStore.preference)
const currentNoiseLevel = computed(() => preferenceStore.preference.noiseLevel)
const subscribedDomains = computed(() => preferenceStore.preference.domains)
const radarWords = computed(() => preferenceStore.preference.radarWords)

// 推荐词库（排除已添加的）
const suggestedWords = computed(() =>
  SUGGESTED_RADAR_WORDS.filter(w => !radarWords.value.includes(w)).slice(0, 12)
)

function handleNoiseLevelChange(level: NoiseLevel) {
  preferenceStore.setNoiseLevel(level)
  showToast(`已切换至「${NOISE_LEVEL_CONFIGS.find(n => n.key === level)?.label}」`, 'success')
}

function handleDomainToggle(domain: DomainType) {
  preferenceStore.toggleDomain(domain)
}

function handleAddRadarWord() {
  const word = newRadarWord.value.trim()
  if (!word) return
  preferenceStore.addRadarWord(word)
  newRadarWord.value = ''
}

function handleRemoveRadarWord(word: string) {
  uni.showModal({
    title: '删除雷达词',
    content: `确定删除「${word}」？`,
    success: (res) => {
      if (res.confirm) {
        preferenceStore.removeRadarWord(word)
      }
    },
  })
}

function handleSuggestedWord(word: string) {
  if (radarWords.value.includes(word)) {
    preferenceStore.removeRadarWord(word)
  } else {
    preferenceStore.addRadarWord(word)
  }
}

function handleToggleTranslate(e: any) {
  preferenceStore.updatePreference({ enableAutoTranslate: e.detail.value })
}

function handleToggleNotification(e: any) {
  preferenceStore.updatePreference({ enableNotification: e.detail.value })
}

function handleToggleReadingMode() {
  const newMode = preference.value.readingMode === 'comfortable' ? 'compact' : 'comfortable'
  preferenceStore.updatePreference({ readingMode: newMode })
}

function handleRegionPrefChange(region: import('@/types').RegionType) {
  preferenceStore.setRegionPref(region)
  const label = regionOptions.find(r => r.key === region)?.label || region
  showToast(`已切换至「${label}」`, 'success')
}

function handleSentimentToggle(sentiment: string) {
  preferenceStore.toggleBlockedSentiment(sentiment)
}
</script>

<style lang="scss" scoped>
.preference-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 导航栏 */
.nav-bar {
  background: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  padding: 16rpx 24rpx 20rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #1a1a1a;
}

/* 内容滚动 */
.content-scroll {
  height: calc(100vh - 88px - 100rpx);
}

/* 分区 */
.section {
  margin: 24rpx 24rpx 0;
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  padding: 24rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6rpx;
}

.section-desc {
  font-size: 24rpx;
  color: #999;
}

/* 降噪档位列表 */
.noise-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.noise-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  border-radius: 12rpx;
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
  gap: 16rpx;
  flex: 1;
}

.noise-icon {
  font-size: 40rpx;
}

.noise-info {
  flex: 1;
}

.noise-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 4rpx;
}

.noise-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.recommended-badge {
  padding: 2rpx 10rpx;
  background: #1DB954;
  color: #fff;
  border-radius: 999rpx;
  font-size: 18rpx;
}

.noise-desc {
  font-size: 22rpx;
  color: #999;
}

.noise-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.noise-count {
  font-size: 22rpx;
  color: #bbb;
}

.check-mark {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #1DB954;
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 领域网格 */
.domain-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.domain-card {
  position: relative;
  padding: 24rpx 20rpx;
  border-radius: 16rpx;
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
  font-size: 44rpx;
  margin-bottom: 12rpx;
}

.domain-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
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
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 雷达词输入 */
.radar-input-wrap {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  padding: 12rpx 12rpx 12rpx 24rpx;
}

.radar-input {
  flex: 1;
  font-size: 28rpx;
  color: #1a1a1a;
  background: transparent;
}

.add-btn {
  padding: 14rpx 28rpx;
  border-radius: 999rpx;
  background: #e0e0e0;
  font-size: 26rpx;
  color: #999;
  font-weight: 500;
  transition: all 0.2s;

  &.active {
    background: #1DB954;
    color: #ffffff;
  }
}

/* 雷达词标签 */
.radar-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.radar-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 20rpx;
  background: #f0fdf4;
  border: 1rpx solid #bbf7d0;
  border-radius: 999rpx;
}

.radar-word {
  font-size: 26rpx;
  color: #16a34a;
  font-weight: 500;
}

.radar-delete {
  font-size: 32rpx;
  color: #86efac;
  line-height: 1;
}

.radar-empty {
  padding: 24rpx;
  text-align: center;
  font-size: 24rpx;
  color: #bbb;
  background: #fafafa;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
}

/* 推荐词库 */
.suggested-section {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
}

.suggested-title {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.suggested-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.suggested-tag {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  background: #f5f5f5;
  color: #666;
  border: 1rpx solid #e8e8e8;
  transition: all 0.2s;

  &.added {
    background: #f0fdf4;
    color: #16a34a;
    border-color: #bbf7d0;
  }

  &:active {
    opacity: 0.7;
  }
}

/* 设置列表 */
.settings-list {
  display: flex;
  flex-direction: column;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.setting-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.setting-icon {
  font-size: 36rpx;
}

.setting-info {
  flex: 1;
}

.setting-name {
  display: block;
  font-size: 28rpx;
  color: #1a1a1a;
  font-weight: 500;
  margin-bottom: 4rpx;
}

.setting-desc {
  font-size: 22rpx;
  color: #999;
}

.mode-toggle {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: #f5f5f5;
  border-radius: 999rpx;
}

.mode-text {
  font-size: 24rpx;
  color: #666;
}

.mode-arrow {
  font-size: 28rpx;
  color: #bbb;
}

/* 地区偏好 */
.region-options {
  display: flex;
  gap: 12rpx;
}

.region-option {
  flex: 1;
  padding: 24rpx 16rpx;
  border-radius: 12rpx;
  border: 2rpx solid #f0f0f0;
  background: #fafafa;
  text-align: center;
  transition: all 0.2s;

  &.selected {
    background: #f0fdf4;
    border-color: #1DB954;
  }

  &:active {
    opacity: 0.8;
  }
}

.region-option-icon {
  display: block;
  font-size: 44rpx;
  margin-bottom: 8rpx;
}

.region-option-label {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4rpx;
}

.region-option-desc {
  display: block;
  font-size: 20rpx;
  color: #999;
}

/* 情绪过滤 */
.sentiment-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.sentiment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  border-radius: 12rpx;
  border: 2rpx solid #f0f0f0;
  background: #fafafa;
  transition: all 0.2s;

  &.blocked {
    background: #FFF2F0;
    border-color: #FF4D4F;
  }

  &:active {
    opacity: 0.8;
  }
}

.sentiment-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.sentiment-icon {
  font-size: 40rpx;
}

.sentiment-info {
  flex: 1;
}

.sentiment-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4rpx;
}

.sentiment-desc {
  font-size: 22rpx;
  color: #999;
}

.sentiment-status {
  font-size: 22rpx;
  color: #bbb;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: #f5f5f5;

  &.blocked {
    color: #FF4D4F;
    background: #FFCCC7;
    font-weight: 500;
  }
}
</style>
