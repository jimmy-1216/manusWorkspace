<template>
  <view class="search-page">
    <!-- 搜索栏 -->
    <view class="search-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          v-model="keyword"
          class="search-input"
          placeholder="搜索资讯、关键词..."
          :focus="inputFocused"
          @input="handleInput"
          @confirm="handleSearch"
        />
        <text v-if="keyword" class="clear-btn" @tap="clearSearch">×</text>
      </view>
      <text v-if="keyword || inputFocused" class="cancel-btn" @tap="handleCancel">取消</text>
    </view>

    <!-- 搜索结果 -->
    <scroll-view v-if="hasSearched" class="result-list" scroll-y>
      <view v-if="isSearching" class="searching-state">
        <view class="loading-spinner"></view>
        <text>搜索中...</text>
      </view>

      <template v-else>
        <view v-if="searchResults.length === 0" class="empty-result">
          <text class="empty-icon">🔍</text>
          <text class="empty-title">未找到相关资讯</text>
          <text class="empty-desc">换个关键词试试？</text>
        </view>

        <view v-else>
          <view class="result-count">
            <text>找到 <text class="count-num">{{ searchResults.length }}</text> 条相关资讯</text>
          </view>
          <ArticleCard
            v-for="article in searchResults"
            :key="article.id"
            :article="article"
            @tap="handleArticleTap"
            @like="handleLike"
            @collect="handleCollect"
          />
        </view>
      </template>
    </scroll-view>

    <!-- 默认状态（搜索历史 + 热门搜索） -->
    <scroll-view v-else class="default-content" scroll-y>
      <!-- 搜索历史 -->
      <view v-if="searchHistory.length > 0" class="history-section">
        <view class="section-header">
          <text class="section-title">搜索历史</text>
          <text class="clear-history" @tap="clearHistory">清除</text>
        </view>
        <view class="tag-cloud">
          <view
            v-for="item in searchHistory"
            :key="item"
            class="history-tag"
            @tap="handleTagSearch(item)"
          >
            <text class="history-icon">🕐</text>
            <text>{{ item }}</text>
          </view>
        </view>
      </view>

      <!-- 热门搜索 -->
      <view class="hot-section">
        <view class="section-header">
          <text class="section-title">🔥 热门搜索</text>
        </view>
        <view class="hot-list">
          <view
            v-for="(word, idx) in HOT_SEARCH_WORDS"
            :key="word"
            class="hot-item"
            @tap="handleTagSearch(word)"
          >
            <view class="hot-rank" :class="{ top3: idx < 3 }">{{ idx + 1 }}</view>
            <text class="hot-word">{{ word }}</text>
            <view v-if="idx < 3" class="hot-badge">热</view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { onShow } from '@dcloudio/uni-app'
import type { Article } from '@/types'
import { MOCK_ARTICLES, HOT_SEARCH_WORDS } from '@/utils/mockData'
import { getStatusBarHeight } from '@/utils'
import { STORAGE_KEYS } from '@/utils/constants'
import { useFeedStore } from '@/stores/feed'
import ArticleCard from '@/components/feed/ArticleCard.vue'

const feedStore = useFeedStore()
// 使用 storeToRefs 获取响应式 articles，与 Feed 页共享同一份数据
const { articles: storeArticles } = storeToRefs(feedStore)
const statusBarHeight = ref(getStatusBarHeight())
const keyword = ref('')
const inputFocused = ref(false)
const hasSearched = ref(false)
const isSearching = ref(false)
const searchResults = ref<Article[]>([])
const searchHistory = ref<string[]>([])

onShow(() => {
  loadHistory()
})

function loadHistory() {
  const stored = uni.getStorageSync(STORAGE_KEYS.SEARCH_HISTORY)
  if (stored) {
    try {
      searchHistory.value = JSON.parse(stored)
    } catch {}
  }
}

function saveHistory(word: string) {
  const history = searchHistory.value.filter(h => h !== word)
  history.unshift(word)
  searchHistory.value = history.slice(0, 10)
  uni.setStorageSync(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(searchHistory.value))
}

function clearHistory() {
  uni.showModal({
    title: '清除搜索历史',
    content: '确定要清除所有搜索历史吗？',
    success: (res) => {
      if (res.confirm) {
        searchHistory.value = []
        uni.removeStorageSync(STORAGE_KEYS.SEARCH_HISTORY)
      }
    },
  })
}

function handleInput() {
  if (!keyword.value) {
    hasSearched.value = false
    searchResults.value = []
  }
}

async function handleSearch() {
  const kw = keyword.value.trim()
  if (!kw) return

  hasSearched.value = true
  isSearching.value = true
  saveHistory(kw)

  await new Promise(resolve => setTimeout(resolve, 600))

  // 优先从 store 中的文章搜索，保持点赞/收藏状态一致；若 store 为空则回退到 MOCK_ARTICLES
  const source = storeArticles.value.length > 0 ? storeArticles.value : MOCK_ARTICLES
  searchResults.value = source.filter(a =>
    a.title.includes(kw) ||
    a.summary.includes(kw) ||
    a.tags?.some(t => t.includes(kw)) ||
    a.source.includes(kw)
  )

  isSearching.value = false
}

function handleTagSearch(word: string) {
  keyword.value = word
  handleSearch()
}

function clearSearch() {
  keyword.value = ''
  hasSearched.value = false
  searchResults.value = []
}

function handleCancel() {
  clearSearch()
  inputFocused.value = false
}

function handleArticleTap(article: Article) {
  uni.navigateTo({ url: `/pages/article/index?id=${article.id}` })
}

function handleLike(articleId: number) {
  feedStore.toggleLike(articleId)
}

function handleCollect(articleId: number) {
  feedStore.toggleCollect(articleId)
}
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 搜索栏 */
.search-bar {
  background: #ffffff;
  padding: 16rpx 24rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 999rpx;
  padding: 16rpx 24rpx;
  gap: 12rpx;
}

.search-icon {
  font-size: 28rpx;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #1a1a1a;
  background: transparent;
  border: none;
}

.clear-btn {
  font-size: 36rpx;
  color: #bbb;
  padding: 4rpx 8rpx;
}

.cancel-btn {
  font-size: 28rpx;
  color: #1DB954;
  flex-shrink: 0;
  padding: 8rpx;
}

/* 搜索中状态 */
.searching-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  gap: 24rpx;
  color: #999;
  font-size: 28rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f0f0f0;
  border-top-color: #1DB954;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 结果列表 */
.result-list {
  height: calc(100vh - 120px);
  padding-top: 16rpx;
}

.result-count {
  padding: 16rpx 24rpx;
  font-size: 24rpx;
  color: #999;

  .count-num {
    color: #1DB954;
    font-weight: 600;
  }
}

/* 空结果 */
.empty-result {
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

/* 默认内容 */
.default-content {
  height: calc(100vh - 120px);
  padding: 24rpx;
}

/* 搜索历史 */
.history-section, .hot-section {
  margin-bottom: 40rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.clear-history {
  font-size: 24rpx;
  color: #999;
  padding: 8rpx;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.history-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: #ffffff;
  border-radius: 999rpx;
  font-size: 26rpx;
  color: #333;
  border: 1rpx solid #e8e8e8;

  &:active {
    background: #f0fdf4;
    border-color: #1DB954;
  }
}

.history-icon {
  font-size: 22rpx;
  opacity: 0.6;
}

/* 热门搜索 */
.hot-list {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.hot-item {
  display: flex;
  align-items: center;
  padding: 24rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
  gap: 20rpx;
  transition: all 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f5f5f5;
  }
}

.hot-rank {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  background: #f0f0f0;
  color: #999;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;

  &.top3 {
    background: #1DB954;
    color: #ffffff;
  }
}

.hot-word {
  flex: 1;
  font-size: 28rpx;
  color: #1a1a1a;
}

.hot-badge {
  padding: 4rpx 12rpx;
  background: #fff1f0;
  color: #ff4d4f;
  border-radius: 6rpx;
  font-size: 20rpx;
  font-weight: 600;
}
</style>
