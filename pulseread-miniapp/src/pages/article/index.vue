<template>
  <view class="article-page">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-back" @tap="handleBack">
          <text class="back-icon">‹</text>
          <text class="back-text">返回</text>
        </view>
        <view class="nav-tags">
          <view v-if="article" class="domain-tag" :style="{ color: domainConfig?.color, backgroundColor: domainConfig?.bgColor }">
            {{ domainConfig?.label }}
          </view>
          <view v-if="article?.isAiTranslated" class="ai-tag">AI译</view>
        </view>
        <view class="nav-right">
          <view class="collect-btn" @tap="handleCollect">
            <text>{{ article?.isCollected ? '⭐' : '☆' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-state">
      <view class="loading-spinner"></view>
      <text>加载中...</text>
    </view>

    <!-- 文章内容 -->
    <scroll-view v-else-if="article" class="content-scroll" scroll-y>
      <!-- 文章头部信息 -->
      <view class="article-header">
        <view class="header-meta">
          <text class="source-text">{{ article.source }}</text>
          <text class="time-text">{{ article.publishTime }}</text>
        </view>
        <text class="article-title">{{ article.title }}</text>
        <view class="header-badges">
          <view class="score-badge" :style="{ color: scoreColor }">
            <text class="score-label">AI 重要性评分</text>
            <text class="score-value">{{ article.aiScore }}</text>
          </view>
          <view v-if="article.sentiment" class="sentiment-badge"
            :style="{ color: sentimentConfig?.color, backgroundColor: sentimentConfig?.bgColor }">
            {{ sentimentConfig?.label }}
          </view>
          <view v-for="word in article.radarWords" :key="word" class="radar-badge">
            📡 {{ word }}
          </view>
        </view>
      </view>

      <!-- 免责声明 -->
      <view v-if="article.domain === 'finance'" class="disclaimer finance">
        <text>⚠️ 免责声明：本文内容仅供参考，不构成任何投资建议。投资有风险，入市需谨慎。</text>
      </view>
      <view v-else-if="article.domain === 'policy'" class="disclaimer policy">
        <text>⚠️ 声明：本文为政策资讯摘要，具体条款请以官方发布为准。</text>
      </view>
      <view v-else-if="article.domain === 'commerce'" class="disclaimer commerce">
        <text>⚠️ 声明：本文为商业资讯，不代表平台立场，请独立判断。</text>
      </view>

      <!-- Tab 切换 -->
      <view class="content-tabs">
        <view
          v-for="tab in contentTabs"
          :key="tab.key"
          class="content-tab"
          :class="{ active: activeTab === tab.key }"
          @tap="activeTab = tab.key"
        >
          {{ tab.label }}
        </view>
      </view>

      <!-- AI 提炼内容 -->
      <view v-if="activeTab === 'ai'" class="tab-content">
        <!-- AI 核心摘要 -->
        <view class="ai-summary-card">
          <view class="ai-card-header">
            <text class="ai-card-icon">🤖</text>
            <text class="ai-card-title">AI 核心摘要</text>
          </view>
          <text class="ai-summary-text">{{ article.aiSummary || article.summary }}</text>

          <!-- 要点列表 -->
          <view v-if="article.aiKeyPoints?.length" class="key-points">
            <view v-for="(point, idx) in article.aiKeyPoints" :key="idx" class="key-point">
              <text class="point-num">{{ idx + 1 }}</text>
              <text class="point-text">{{ point }}</text>
            </view>
          </view>

          <!-- 标签 -->
          <view v-if="article.tags?.length" class="article-tags">
            <view v-for="tag in article.tags" :key="tag" class="article-tag">#{{ tag }}</view>
          </view>
        </view>

        <!-- 快捷提问 -->
        <view class="quick-questions">
          <text class="section-title">快捷提问</text>
          <view class="question-list">
            <view
              v-for="question in quickQuestions"
              :key="question"
              class="question-item"
              @tap="handleQuickQuestion(question)"
            >
              <text class="question-text">{{ question }}</text>
              <text class="question-arrow">›</text>
            </view>
          </view>
        </view>

        <!-- 知识溯源树 -->
        <view class="knowledge-tree-section">
          <view class="section-header" @tap="toggleKnowledgeTree">
            <view class="section-header-left">
              <text class="tree-icon">🌳</text>
              <text class="section-title">知识溯源树</text>
            </view>
            <text class="expand-btn">{{ showKnowledgeTree ? '收起' : '展开' }}</text>
          </view>
          <view v-if="showKnowledgeTree && article.knowledgeTree?.length" class="tree-content">
            <view v-for="node in article.knowledgeTree" :key="node.id" class="tree-node root-node">
              <view class="node-content">
                <text class="node-title">{{ node.title }}</text>
                <text class="node-desc">{{ node.description }}</text>
                <text v-if="node.date" class="node-date">{{ node.date }}</text>
              </view>
              <view v-if="node.children?.length" class="node-children">
                <view v-for="child in node.children" :key="child.id" class="tree-node child-node">
                  <view class="node-connector"></view>
                  <view class="node-content">
                    <text class="node-title">{{ child.title }}</text>
                    <text class="node-desc">{{ child.description }}</text>
                    <text v-if="child.date" class="node-date">{{ child.date }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view v-else-if="showKnowledgeTree" class="tree-empty">
            <text>暂无溯源数据</text>
          </view>
        </view>

        <!-- AI 对话区域 -->
        <view class="ai-chat-section">
          <text class="section-title">AI 深度问答</text>
          <view v-if="chatMessages.length" class="chat-messages">
            <view
              v-for="(msg, idx) in chatMessages"
              :key="idx"
              class="chat-message"
              :class="msg.role"
            >
              <text class="message-text">{{ msg.content }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 原文内容 -->
      <view v-if="activeTab === 'original'" class="tab-content">
        <view class="original-content">
          <text class="original-text">{{ article.content || article.summary }}</text>
        </view>
      </view>

      <!-- 双语对照 -->
      <view v-if="activeTab === 'bilingual'" class="tab-content">
        <view class="bilingual-content">
          <view class="bilingual-section">
            <view class="bilingual-label">
              <text class="lang-flag">🇨🇳</text>
              <text class="lang-name">中文</text>
            </view>
            <text class="bilingual-text">{{ article.content || article.summary }}</text>
          </view>
          <view class="bilingual-divider"></view>
          <view class="bilingual-section">
            <view class="bilingual-label">
              <text class="lang-flag">🇺🇸</text>
              <text class="lang-name">English</text>
            </view>
            <text class="bilingual-text en">{{ article.contentEn || 'English content not available.' }}</text>
          </view>
        </view>
      </view>

      <!-- 底部安全区 -->
      <view class="bottom-safe"></view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view v-if="article" class="bottom-bar" :style="{ paddingBottom: safeAreaBottom + 'px' }">
      <view class="bottom-actions">
        <view class="bottom-action" @tap="handleLike">
          <text class="action-icon">{{ article.isLiked ? '👍' : '👍' }}</text>
          <text class="action-label" :class="{ active: article.isLiked }">有用</text>
        </view>
        <view class="bottom-action" @tap="handleFeedback">
          <text class="action-icon">🚩</text>
          <text class="action-label">纠错</text>
        </view>
        <view class="bottom-action" @tap="handleShare">
          <text class="action-icon">↗</text>
          <text class="action-label">分享</text>
        </view>
      </view>

      <!-- AI 问答输入框 -->
      <view class="chat-input-bar">
        <input
          v-model="chatInput"
          class="chat-input"
          placeholder="输入你的问题..."
          :adjust-position="true"
          @confirm="handleSendMessage"
        />
        <view class="send-btn" :class="{ active: chatInput.trim() }" @tap="handleSendMessage">
          <text>发送</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { Article } from '@/types'
import { MOCK_ARTICLES, QUICK_QUESTIONS } from '@/utils/mockData'
import { getDomainConfig, getSentimentConfig, getScoreColor, getStatusBarHeight, getSafeAreaBottom, showToast } from '@/utils'
import { useFeedStore } from '@/stores/feed'

const feedStore = useFeedStore()

const statusBarHeight = ref(getStatusBarHeight())
const safeAreaBottom = ref(getSafeAreaBottom())
const article = ref<Article | null>(null)
const isLoading = ref(true)
const activeTab = ref<'ai' | 'original' | 'bilingual'>('ai')
const showKnowledgeTree = ref(false)
const chatInput = ref('')
const chatMessages = ref<Array<{ role: 'user' | 'ai'; content: string }>>([])

const contentTabs = [
  { key: 'ai', label: '🤖 AI 提炼' },
  { key: 'original', label: '📄 原文' },
  { key: 'bilingual', label: '🌐 双语' },
]

const domainConfig = computed(() => article.value ? getDomainConfig(article.value.domain) : null)
const sentimentConfig = computed(() => article.value ? getSentimentConfig(article.value.sentiment) : null)
const scoreColor = computed(() => article.value ? getScoreColor(article.value.aiScore) : '#999')

const quickQuestions = computed(() => {
  if (!article.value) return QUICK_QUESTIONS.default
  return QUICK_QUESTIONS[article.value.domain] || QUICK_QUESTIONS.default
})

onLoad((options) => {
  const id = parseInt(options?.id || '1')
  loadArticle(id)
})

function loadArticle(id: number) {
  isLoading.value = true
  setTimeout(() => {
    // 优先从 feedStore 加载（保持收藏/点赞状态同步），回退到 MOCK_ARTICLES
    const fromStore = feedStore.articles.find(a => a.id === id)
    article.value = fromStore || MOCK_ARTICLES.find(a => a.id === id) || MOCK_ARTICLES[0]
    isLoading.value = false
  }, 500)
}

function handleBack() {
  uni.navigateBack()
}

function handleCollect() {
  if (article.value) {
    feedStore.toggleCollect(article.value.id)
    article.value.isCollected = !article.value.isCollected
    showToast(article.value.isCollected ? '已收藏' : '已取消收藏', 'success')
  }
}

function handleLike() {
  if (article.value) {
    feedStore.toggleLike(article.value.id)
    article.value.isLiked = !article.value.isLiked
    showToast(article.value.isLiked ? '已点赞' : '已取消', 'success')
  }
}

function handleFeedback() {
  uni.showModal({
    title: '纠错反馈',
    editable: true,
    placeholderText: '请描述问题...',
    success: (res) => {
      if (res.confirm && res.content) {
        showToast('感谢反馈！', 'success')
      }
    },
  })
}

function handleShare() {
  uni.showShareMenu({ withShareTicket: true })
}

function toggleKnowledgeTree() {
  showKnowledgeTree.value = !showKnowledgeTree.value
}

function handleQuickQuestion(question: string) {
  chatInput.value = question
  handleSendMessage()
}

function handleSendMessage() {
  const msg = chatInput.value.trim()
  if (!msg) return

  chatMessages.value.push({ role: 'user', content: msg })
  chatInput.value = ''

  // 模拟 AI 回复
  setTimeout(() => {
    chatMessages.value.push({
      role: 'ai',
      content: `关于"${msg}"，根据文章内容分析：这是一个关于 ${article.value?.title} 的问题。AI 正在深度分析中，实际项目中将调用后端 AI 接口返回真实答案。`,
    })
  }, 1000)
}
</script>

<style lang="scss" scoped>
.article-page {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
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

.nav-back {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx;
}

.back-icon {
  font-size: 40rpx;
  color: #1a1a1a;
  line-height: 1;
}

.back-text {
  font-size: 28rpx;
  color: #1a1a1a;
}

.nav-tags {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex: 1;
  justify-content: center;
}

.domain-tag {
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.ai-tag {
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  background: #f0f5ff;
  color: #2f54eb;
}

.nav-right {
  display: flex;
  align-items: center;
}

.collect-btn {
  font-size: 40rpx;
  padding: 8rpx;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400rpx;
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

/* 内容滚动区 */
.content-scroll {
  flex: 1;
  height: calc(100vh - 88px - 200rpx);
}

/* 文章头部 */
.article-header {
  background: #ffffff;
  padding: 32rpx 24rpx 24rpx;
  margin-bottom: 16rpx;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.source-text {
  font-size: 24rpx;
  color: #1DB954;
  font-weight: 500;
}

.time-text {
  font-size: 24rpx;
  color: #bbb;
}

.article-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.5;
  margin-bottom: 20rpx;
}

.header-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  align-items: center;
}

.score-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 16rpx;
  background: rgba(29, 185, 84, 0.08);
  border-radius: 999rpx;
}

.score-label {
  font-size: 20rpx;
  opacity: 0.7;
}

.score-value {
  font-size: 28rpx;
  font-weight: 700;
}

.sentiment-badge {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.radar-badge {
  padding: 6rpx 16rpx;
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 999rpx;
  font-size: 22rpx;
}

/* Tab 切换 */
.content-tabs {
  display: flex;
  background: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 16rpx;
}

.content-tab {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #999;
  position: relative;
  transition: all 0.2s;

  &.active {
    color: #1DB954;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 48rpx;
      height: 4rpx;
      background: #1DB954;
      border-radius: 2rpx;
    }
  }
}

/* Tab 内容 */
.tab-content {
  padding: 0 0 32rpx;
}

/* AI 摘要卡片 */
.ai-summary-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  margin: 0 24rpx 24rpx;
  border-left: 6rpx solid #1DB954;
}

.ai-card-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.ai-card-icon {
  font-size: 32rpx;
}

.ai-card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.ai-summary-text {
  display: block;
  font-size: 28rpx;
  color: #333;
  line-height: 1.7;
  margin-bottom: 20rpx;
}

.key-points {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.key-point {
  display: flex;
  gap: 16rpx;
  align-items: flex-start;
}

.point-num {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #1DB954;
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4rpx;
}

.point-text {
  font-size: 26rpx;
  color: #444;
  line-height: 1.6;
  flex: 1;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.article-tag {
  padding: 6rpx 16rpx;
  background: #f5f5f5;
  color: #666;
  border-radius: 999rpx;
  font-size: 22rpx;
}

/* 快捷提问 */
.quick-questions {
  margin: 0 24rpx 24rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16rpx;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.question-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: #ffffff;
  border-radius: 12rpx;
  border: 1rpx solid #e8f5e9;
  transition: all 0.2s;

  &:active {
    background: #f0fdf4;
    border-color: #1DB954;
  }
}

.question-text {
  font-size: 26rpx;
  color: #333;
  flex: 1;
}

.question-arrow {
  font-size: 32rpx;
  color: #1DB954;
}

/* 知识溯源树 */
.knowledge-tree-section {
  margin: 0 24rpx 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.tree-icon {
  font-size: 32rpx;
}

.expand-btn {
  font-size: 26rpx;
  color: #1DB954;
}

.tree-content {
  padding: 24rpx;
}

.tree-node {
  margin-bottom: 16rpx;
}

.root-node > .node-content {
  background: #f0fdf4;
  border-left: 4rpx solid #1DB954;
  padding: 16rpx 20rpx;
  border-radius: 0 12rpx 12rpx 0;
}

.node-children {
  margin-left: 32rpx;
  margin-top: 12rpx;
}

.child-node {
  display: flex;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.node-connector {
  width: 2rpx;
  background: #d1fae5;
  margin-left: 16rpx;
}

.child-node > .node-content {
  flex: 1;
  background: #fafafa;
  border-left: 3rpx solid #86efac;
  padding: 12rpx 16rpx;
  border-radius: 0 8rpx 8rpx 0;
}

.node-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6rpx;
}

.node-desc {
  display: block;
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}

.node-date {
  display: block;
  font-size: 20rpx;
  color: #bbb;
  margin-top: 6rpx;
}

.tree-empty {
  padding: 32rpx;
  text-align: center;
  color: #bbb;
  font-size: 26rpx;
}

/* AI 对话 */
.ai-chat-section {
  margin: 0 24rpx 24rpx;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 16rpx;
}

.chat-message {
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  max-width: 85%;

  &.user {
    align-self: flex-end;
    background: #1DB954;
    color: #fff;
    border-bottom-right-radius: 4rpx;
  }

  &.ai {
    align-self: flex-start;
    background: #ffffff;
    color: #333;
    border-bottom-left-radius: 4rpx;
    border: 1rpx solid #e8e8e8;
  }
}

.message-text {
  font-size: 26rpx;
  line-height: 1.6;
}

/* 原文内容 */
.original-content {
  background: #ffffff;
  margin: 0 24rpx;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
}

.original-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
}

/* 双语对照 */
.bilingual-content {
  margin: 0 24rpx;
}

.bilingual-section {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.bilingual-label {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.lang-flag {
  font-size: 32rpx;
}

.lang-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}

.bilingual-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;

  &.en {
    font-family: Georgia, serif;
  }
}

.bilingual-divider {
  height: 1rpx;
  background: #f0f0f0;
  margin: 8rpx 0;
}

/* 底部安全区 */
.bottom-safe {
  height: 200rpx;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1rpx solid #f0f0f0;
  padding: 16rpx 24rpx;
}

.bottom-actions {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
}

.bottom-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 32rpx;
  border-radius: 12rpx;

  &:active {
    background: #f5f5f5;
  }
}

.action-icon {
  font-size: 36rpx;
}

.action-label {
  font-size: 22rpx;
  color: #999;

  &.active {
    color: #1DB954;
  }
}

/* 聊天输入框 */
.chat-input-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #f5f7fa;
  border-radius: 999rpx;
  padding: 12rpx 12rpx 12rpx 24rpx;
}

.chat-input {
  flex: 1;
  font-size: 28rpx;
  color: #1a1a1a;
  background: transparent;
  border: none;
  outline: none;
}

.send-btn {
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

/* 免责声明 */
.disclaimer {
  margin: 0 24rpx 16rpx;
  padding: 20rpx 28rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  line-height: 1.6;

  &.finance {
    background: #FFF7E6;
    color: #D48806;
  }
  &.policy {
    background: #E6F4FF;
    color: #1677FF;
  }
  &.commerce {
    background: #F9F0FF;
    color: #722ED1;
  }
}
</style>
