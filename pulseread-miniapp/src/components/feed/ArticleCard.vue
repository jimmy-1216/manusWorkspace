<template>
  <!-- 新闻卡片组件 -->
  <view class="article-card" @tap="handleTap">
    <!-- 雷达词命中标签 -->
    <view v-if="article.radarWords?.length" class="radar-badge">
      <text class="radar-icon">📡</text>
      <text class="radar-text">{{ article.radarWords.join('、') }}</text>
    </view>

    <!-- 卡片主体 -->
    <view class="card-body">
      <!-- 顶部标签行 -->
      <view class="tag-row">
        <view class="domain-tag" :style="{ color: domainConfig.color, backgroundColor: domainConfig.bgColor }">
          <text>{{ domainConfig.icon }} {{ domainConfig.label }}</text>
        </view>
        <view v-if="article.region === 'international'" class="region-tag">国际</view>
        <view v-else-if="article.region === 'domestic'" class="region-tag domestic">国内</view>
        <view v-if="article.isAiTranslated" class="ai-tag">AI译</view>
        <view class="sentiment-tag" :style="{ color: sentimentConfig.color, backgroundColor: sentimentConfig.bgColor }">
          {{ sentimentConfig.label }}
        </view>
      </view>

      <!-- 标题 -->
      <text class="article-title">{{ article.title }}</text>

      <!-- 摘要 -->
      <text class="article-summary">{{ article.summary }}</text>

      <!-- 底部信息行 -->
      <view class="meta-row">
        <view class="meta-left">
          <text class="source-text">{{ article.source }}</text>
          <text class="time-text">{{ article.publishTime }}</text>
        </view>
        <view class="score-badge" :style="{ color: scoreColor }">
          <text class="score-label">AI</text>
          <text class="score-value">{{ article.aiScore }}</text>
        </view>
      </view>

      <!-- 操作栏 -->
      <view class="action-row">
        <view class="action-btn" @tap.stop="handleLike">
          <text class="action-icon">{{ article.isLiked ? '👍' : '👍' }}</text>
          <text class="action-text" :class="{ active: article.isLiked }">
            {{ article.likeCount > 0 ? article.likeCount : '有用' }}
          </text>
        </view>
        <view class="action-btn" @tap.stop="handleCollect">
          <text class="action-icon">{{ article.isCollected ? '⭐' : '☆' }}</text>
          <text class="action-text" :class="{ active: article.isCollected }">
            {{ article.collectCount > 0 ? article.collectCount : '收藏' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { Article } from '@/types'
import { getDomainConfig, getSentimentConfig, getScoreColor } from '@/utils'

const props = defineProps<{
  article: Article
}>()

const emit = defineEmits<{
  tap: [article: Article]
  like: [articleId: number]
  collect: [articleId: number]
}>()

const domainConfig = computed(() => getDomainConfig(props.article.domain))
const sentimentConfig = computed(() => getSentimentConfig(props.article.sentiment))
const scoreColor = computed(() => getScoreColor(props.article.aiScore))

function handleTap() {
  emit('tap', props.article)
}

function handleLike() {
  emit('like', props.article.id)
}

function handleCollect() {
  emit('collect', props.article.id)
}
</script>

<style lang="scss" scoped>
.article-card {
  background: #ffffff;
  border-radius: 16rpx;
  margin: 0 24rpx 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  transition: all 0.2s;

  &:active {
    transform: scale(0.99);
    box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.04);
  }
}

/* 雷达词命中标签 */
.radar-badge {
  display: flex;
  align-items: center;
  padding: 10rpx 24rpx;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-bottom: 1rpx solid #bbf7d0;

  .radar-icon {
    font-size: 22rpx;
    margin-right: 8rpx;
  }

  .radar-text {
    font-size: 22rpx;
    color: #16a34a;
    font-weight: 500;
  }
}

/* 卡片主体 */
.card-body {
  padding: 24rpx;
}

/* 标签行 */
.tag-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.domain-tag {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 14rpx;
  border-radius: 6rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.region-tag {
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
  background: #f0f0f0;
  color: #666;

  &.domestic {
    background: #fff7e6;
    color: #d46b08;
  }
}

.ai-tag {
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
  background: #f0f5ff;
  color: #2f54eb;
}

.sentiment-tag {
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
  font-weight: 500;
}

/* 标题 */
.article-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.5;
  margin-bottom: 12rpx;
}

/* 摘要 */
.article-summary {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 底部元信息 */
.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.source-text {
  font-size: 22rpx;
  color: #999;
}

.time-text {
  font-size: 22rpx;
  color: #bbb;
}

.score-badge {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 4rpx 12rpx;
  background: rgba(29, 185, 84, 0.08);
  border-radius: 999rpx;

  .score-label {
    font-size: 18rpx;
    font-weight: 600;
    opacity: 0.7;
  }

  .score-value {
    font-size: 24rpx;
    font-weight: 700;
  }
}

/* 操作栏 */
.action-row {
  display: flex;
  align-items: center;
  gap: 32rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f5f5f5;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  transition: all 0.2s;

  &:active {
    background: #f5f5f5;
  }
}

.action-icon {
  font-size: 28rpx;
}

.action-text {
  font-size: 24rpx;
  color: #999;

  &.active {
    color: #1DB954;
    font-weight: 500;
  }
}
</style>
