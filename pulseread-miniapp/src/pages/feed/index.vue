<template>
  <view class="feed-page">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-left">
          <image class="logo-icon" src="/static/logo.png" mode="aspectFit" />
          <text class="logo-text">微澜</text>
          <text class="logo-sub">PulseRead</text>
        </view>
        <view class="nav-right">
          <view class="realtime-dot">
            <view class="dot-pulse"></view>
            <text class="realtime-text">实时</text>
          </view>
          <view class="noise-btn" @tap="showNoisePicker = true">
            <text class="noise-icon">{{ currentNoiseLevelConfig.icon }}</text>
            <text class="noise-label">{{ currentNoiseLevelConfig.label }}</text>
            <text class="noise-count">{{ filteredArticles.length }}条</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <!-- 地区切换 -->
      <view class="region-tabs">
        <view
          v-for="region in REGION_CONFIGS"
          :key="region.key"
          class="region-tab"
          :class="{ active: selectedRegion === region.key }"
          @tap="handleRegionChange(region.key as RegionType)"
        >
          {{ region.label }}
        </view>
      </view>

      <!-- 领域胶囊 -->
      <scroll-view class="domain-scroll" scroll-x>
        <view class="domain-tabs">
          <view
            v-for="domain in subscribedDomains"
            :key="domain.key"
            class="domain-tab"
            :class="{ active: selectedDomain === domain.key }"
            :style="selectedDomain === domain.key ? { backgroundColor: domain.color, borderColor: domain.color } : {}"
            @tap="handleDomainChange(domain.key)"
          >
            <text>{{ domain.icon }} {{ domain.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 新资讯提示条 -->
    <view v-if="newCount > 0" class="new-articles-bar" @tap="handleNewArticles">
      <text class="new-icon">✦</text>
      <text class="new-text">有 {{ newCount }} 条新资讯</text>
      <text class="new-action">点击查看</text>
      <text class="new-close" @tap.stop="clearNewCount">×</text>
    </view>

    <!-- 文章列表 -->
    <scroll-view
      class="article-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="handleRefresh"
      @scrolltolower="handleLoadMore"
      :style="{ height: listHeight }"
    >
      <!-- 骨架屏 -->
      <template v-if="isLoading && articles.length === 0">
        <view v-for="i in 5" :key="i" class="skeleton-card">
          <view class="skeleton-tag"></view>
          <view class="skeleton-title"></view>
          <view class="skeleton-summary"></view>
          <view class="skeleton-summary short"></view>
          <view class="skeleton-meta"></view>
        </view>
      </template>

      <!-- 文章卡片 -->
      <template v-else>
        <template v-for="(article, idx) in filteredArticles" :key="article.id">
          <ArticleCard
            :article="article"
            @tap="handleArticleTap"
            @like="handleLike"
            @collect="handleCollect"
          />
          <!-- Free 用户每 5 条插入广告 -->
          <view v-if="userStore.userInfo?.memberLevel === 'free' && (idx + 1) % 5 === 0" :key="'ad-' + idx" class="ad-card">
            <view class="ad-badge">广告</view>
            <text class="ad-title">升级 Pro，解锁无限资讯</text>
            <text class="ad-desc">无限阅读 · 无广告 · 数据导出 · 无限雷达词</text>
            <view class="ad-btn">立即升级 ¥99/月</view>
          </view>
        </template>

        <!-- 空状态 -->
        <view v-if="filteredArticles.length === 0 && !isLoading" class="empty-state">
          <text class="empty-icon">🔍</text>
          <text class="empty-title">暂无符合条件的资讯</text>
          <text class="empty-desc">尝试调低降噪档位或切换领域</text>
          <view class="empty-btn" @tap="showNoisePicker = true">调整降噪档位</view>
        </view>

        <!-- 加载更多 -->
        <view v-if="isLoading && articles.length > 0" class="loading-more">
          <text>加载中...</text>
        </view>
        <view v-if="!hasMore && articles.length > 0" class="no-more">
          <text>— 已加载全部资讯 —</text>
        </view>
      </template>
    </scroll-view>

    <!-- 降噪档位选择器（底部弹出） -->
    <uni-popup ref="noisePickerRef" type="bottom" :mask-click="true" @change="handlePopupChange">
      <NoiseLevelPicker
        v-model="currentNoiseLevel"
        @close="showNoisePicker = false"
      />
    </uni-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import type { RegionType, DomainType } from '@/types'
import { useFeedStore } from '@/stores/feed'
import { usePreferenceStore } from '@/stores/preference'
import { useUserStore } from '@/stores/user'
import { DOMAIN_CONFIGS, REGION_CONFIGS } from '@/utils/constants'
import { getStatusBarHeight } from '@/utils'
import ArticleCard from '@/components/feed/ArticleCard.vue'
import NoiseLevelPicker from '@/components/common/NoiseLevelPicker.vue'

const feedStore = useFeedStore()
const preferenceStore = usePreferenceStore()
const userStore = useUserStore()

const statusBarHeight = ref(getStatusBarHeight())
const showNoisePicker = ref(false)
const noisePickerRef = ref()

// 使用 storeToRefs 保持响应性
const { filteredArticles, articles, isLoading, isRefreshing, hasMore, newCount, selectedRegion, selectedDomain } = storeToRefs(feedStore)

const currentNoiseLevelConfig = computed(() => preferenceStore.currentNoiseLevelConfig)
const currentNoiseLevel = computed({
  get: () => preferenceStore.preference.noiseLevel,
  set: (val) => preferenceStore.setNoiseLevel(val),
})

// 已订阅的领域
const subscribedDomains = computed(() =>
  DOMAIN_CONFIGS.filter(d => preferenceStore.preference.domains.includes(d.key))
)

// 列表高度计算
const listHeight = computed(() => {
  const navHeight = statusBarHeight.value + 88 + 96 + (newCount > 0 ? 72 : 0)
  return `calc(100vh - ${navHeight}px - 100rpx)`
})

// 监听 showNoisePicker 变化
watch(showNoisePicker, (val) => {
  if (val) {
    noisePickerRef.value?.open()
  } else {
    noisePickerRef.value?.close()
  }
})

function handlePopupChange(e: any) {
  if (!e.show) showNoisePicker.value = false
}

function handleRegionChange(region: RegionType) {
  feedStore.setRegion(region)
}

function handleDomainChange(domain: DomainType) {
  feedStore.setDomain(domain === selectedDomain ? 'all' : domain)
}

function handleArticleTap(article: any) {
  uni.navigateTo({ url: `/pages/article/index?id=${article.id}` })
}

function handleLike(articleId: number) {
  feedStore.toggleLike(articleId)
}

function handleCollect(articleId: number) {
  feedStore.toggleCollect(articleId)
}

async function handleRefresh() {
  await feedStore.loadArticles(true)
  uni.stopPullDownRefresh()
}

async function handleLoadMore() {
  if (!isLoading.value && hasMore.value) {
    await feedStore.loadArticles()
  }
}

function handleNewArticles() {
  feedStore.clearNewCount()
  // 滚动到顶部
  uni.pageScrollTo({ scrollTop: 0, duration: 300 })
}

function clearNewCount() {
  feedStore.clearNewCount()
}

onMounted(async () => {
  await feedStore.loadArticles(true)
})

onPullDownRefresh(async () => {
  await feedStore.loadArticles(true)
  uni.stopPullDownRefresh()
})

onReachBottom(async () => {
  await feedStore.loadArticles()
})
</script>

<style lang="scss" scoped>
.feed-page {
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx 20rpx;
  height: 88rpx;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.logo-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
}

.logo-text {
  font-size: 34rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.logo-sub {
  font-size: 22rpx;
  color: #999;
  font-weight: 400;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.realtime-dot {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.dot-pulse {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #1DB954;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.realtime-text {
  font-size: 22rpx;
  color: #1DB954;
}

.noise-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 20rpx;
  background: #f0fdf4;
  border: 1rpx solid #bbf7d0;
  border-radius: 999rpx;

  &:active {
    background: #dcfce7;
  }
}

.noise-icon {
  font-size: 24rpx;
}

.noise-label {
  font-size: 24rpx;
  color: #16a34a;
  font-weight: 500;
}

.noise-count {
  font-size: 20rpx;
  color: #999;
}

/* 筛选栏 */
.filter-bar {
  background: #ffffff;
  padding: 16rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.region-tabs {
  display: flex;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.region-tab {
  padding: 8rpx 24rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  color: #666;
  background: #f5f5f5;
  transition: all 0.2s;

  &.active {
    background: #1DB954;
    color: #ffffff;
    font-weight: 500;
  }
}

.domain-scroll {
  white-space: nowrap;
}

.domain-tabs {
  display: flex;
  gap: 12rpx;
}

.domain-tab {
  display: inline-flex;
  align-items: center;
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  color: #666;
  background: #f5f5f5;
  border: 1rpx solid transparent;
  white-space: nowrap;
  transition: all 0.2s;

  &.active {
    color: #ffffff;
    font-weight: 500;
  }
}

/* 新资讯提示条 */
.new-articles-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-bottom: 1rpx solid #bbf7d0;
  gap: 12rpx;
}

.new-icon {
  font-size: 20rpx;
  color: #1DB954;
}

.new-text {
  font-size: 26rpx;
  color: #16a34a;
  font-weight: 500;
  flex: 1;
}

.new-action {
  font-size: 24rpx;
  color: #1DB954;
  text-decoration: underline;
}

.new-close {
  font-size: 32rpx;
  color: #999;
  padding: 4rpx 8rpx;
}

/* 文章列表 */
.article-list {
  padding-top: 20rpx;
}

/* 骨架屏 */
.skeleton-card {
  background: #ffffff;
  border-radius: 16rpx;
  margin: 0 24rpx 20rpx;
  padding: 24rpx;
  animation: shimmer 1.5s infinite;
}

.skeleton-tag {
  width: 120rpx;
  height: 36rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  margin-bottom: 16rpx;
}

.skeleton-title {
  width: 100%;
  height: 40rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
}

.skeleton-summary {
  width: 100%;
  height: 32rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  margin-bottom: 8rpx;

  &.short {
    width: 70%;
  }
}

.skeleton-meta {
  width: 200rpx;
  height: 28rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  margin-top: 16rpx;
}

@keyframes shimmer {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 48rpx;
  gap: 20rpx;
}

.empty-icon {
  font-size: 80rpx;
}

.empty-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
}

.empty-btn {
  margin-top: 16rpx;
  padding: 20rpx 48rpx;
  background: #1DB954;
  color: #fff;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 500;
}

/* 加载更多 */
.loading-more, .no-more {
  text-align: center;
  padding: 32rpx;
  font-size: 24rpx;
  color: #bbb;
}

/* 广告卡片 */
.ad-card {
  margin: 0 24rpx 20rpx;
  padding: 32rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #FFF7E6 0%, #FFE7BA 100%);
  position: relative;
}

.ad-badge {
  position: absolute;
  top: 16rpx;
  right: 20rpx;
  font-size: 20rpx;
  color: #bbb;
  background: rgba(255,255,255,0.6);
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
}

.ad-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #FA8C16;
  margin-bottom: 12rpx;
}

.ad-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 24rpx;
}

.ad-btn {
  display: inline-block;
  padding: 12rpx 36rpx;
  background: #FA8C16;
  color: #fff;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 600;
}
</style>
