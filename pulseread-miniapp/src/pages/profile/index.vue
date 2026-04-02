<template>
  <view class="profile-page">
    <!-- 导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-title">我的</text>
        <view class="settings-btn" @tap="handleSettings">
          <text class="settings-icon">⚙️</text>
        </view>
      </view>
    </view>

    <scroll-view class="content-scroll" scroll-y>
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <view v-if="isLoggedIn && userInfo" class="user-info">
          <image class="avatar" :src="userInfo.avatar || defaultAvatar" mode="aspectFill" />
          <view class="user-detail">
            <text class="username">{{ userInfo.nickname }}</text>
            <view class="member-badge" :class="userInfo.memberLevel">
              <text>{{ memberLevelText }}</text>
            </view>
          </view>
          <view class="edit-btn" @tap="handleEditProfile">
            <text>编辑</text>
          </view>
        </view>

        <view v-else class="login-prompt" @tap="handleLogin">
          <view class="default-avatar">
            <text>👤</text>
          </view>
          <view class="login-info">
            <text class="login-title">登录 / 注册</text>
            <text class="login-desc">登录后享受完整功能</text>
          </view>
          <text class="login-arrow">›</text>
        </view>

        <!-- 数据统计 -->
        <view v-if="isLoggedIn && userInfo" class="stats-row">
          <view class="stat-item">
            <text class="stat-num">{{ userInfo.stats.readCount }}</text>
            <text class="stat-label">已读</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-num">{{ userInfo.stats.collectCount }}</text>
            <text class="stat-label">收藏</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-num">{{ userInfo.stats.followDays }}</text>
            <text class="stat-label">连续天数</text>
          </view>
        </view>
      </view>

      <!-- 会员升级卡片（Free 用户显示） -->
      <view v-if="!isLoggedIn || userInfo?.memberLevel === 'free'" class="pro-card" @tap="handleUpgradePro">
        <view class="pro-left">
          <text class="pro-icon">⚡</text>
          <view class="pro-info">
            <text class="pro-title">升级 Pro 会员</text>
            <text class="pro-desc">无限资讯 · 无广告 · 数据导出</text>
          </view>
        </view>
        <view class="pro-btn">
          <text>¥99/月</text>
        </view>
      </view>

      <!-- 功能菜单 -->
      <view class="menu-section">
        <view class="menu-group">
          <view class="menu-item" @tap="handleCollects">
            <view class="menu-left">
              <text class="menu-icon">⭐</text>
              <text class="menu-name">我的收藏</text>
            </view>
            <view class="menu-right">
              <text v-if="isLoggedIn && userInfo" class="menu-badge">{{ userInfo.stats.collectCount }}</text>
              <text class="menu-arrow">›</text>
            </view>
          </view>
          <view class="menu-item" @tap="handleReadHistory">
            <view class="menu-left">
              <text class="menu-icon">📖</text>
              <text class="menu-name">阅读历史</text>
            </view>
            <view class="menu-right">
              <text class="menu-arrow">›</text>
            </view>
          </view>
        </view>

        <view class="menu-group">
          <view class="menu-item" @tap="handleFeedback">
            <view class="menu-left">
              <text class="menu-icon">💬</text>
              <text class="menu-name">意见反馈</text>
            </view>
            <view class="menu-right">
              <text class="menu-arrow">›</text>
            </view>
          </view>
          <view class="menu-item" @tap="handleAbout">
            <view class="menu-left">
              <text class="menu-icon">ℹ️</text>
              <text class="menu-name">关于微澜</text>
            </view>
            <view class="menu-right">
              <text class="menu-version">v1.0.0</text>
              <text class="menu-arrow">›</text>
            </view>
          </view>
        </view>

        <!-- 账号管理 -->
        <view v-if="isLoggedIn" class="menu-group">
          <view class="menu-item" @tap="handleLogout">
            <view class="menu-left">
              <text class="menu-icon">🚿</text>
              <text class="menu-name">退出登录</text>
            </view>
            <view class="menu-right">
              <text class="menu-arrow">›</text>
            </view>
          </view>
          <view class="menu-item danger" @tap="handleDeleteAccount">
            <view class="menu-left">
              <text class="menu-icon">⚠️</text>
              <text class="menu-name danger-text">注销账号</text>
            </view>
            <view class="menu-right">
              <text class="menu-version">30天冷静期</text>
              <text class="menu-arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部版权 -->
      <view class="footer">
        <text class="footer-text">微澜 PulseRead · AI 驱动的资讯聚合</text>
        <text class="footer-version">v1.0.0</text>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { getStatusBarHeight, showToast } from '@/utils'

const userStore = useUserStore()
const statusBarHeight = ref(getStatusBarHeight())

const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=pulseread'

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo)

const memberLevelText = computed(() => {
  const level = userInfo.value?.memberLevel
  if (level === 'pro') return '⚡ Pro 会员'
  if (level === 'enterprise') return '🏢 企业版'
  return '免费版'
})

onShow(() => {
  // 仅从本地存储刷新用户状态，不自动注入 mock 用户
  userStore.initFromStorage()
})

function handleLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

function handleEditProfile() {
  uni.showModal({
    title: '编辑个人信息',
    content: '功能开发中，敬请期待',
    showCancel: false,
    confirmText: '知道了',
  })
}

function handleSettings() {
  uni.showModal({
    title: '设置',
    content: '功能开发中，敬请期待',
    showCancel: false,
    confirmText: '知道了',
  })
}

function handleUpgradePro() {
  uni.showModal({
    title: '升级 Pro 会员',
    content: '解锁无限资讯、无广告体验、数据导出等高级功能\n\n¥99/月 或 ¥799/年',
    confirmText: '立即升级',
    success: (res) => {
      if (res.confirm) {
        uni.showModal({
          title: '支付',
          content: '支付功能开发中，敬请期待',
          showCancel: false,
          confirmText: '知道了',
        })
      }
    },
  })
}

function handleCollects() {
  uni.navigateTo({ url: '/pages/collects/index' }).catch(() => {
    uni.showModal({
      title: '我的收藏',
      content: '功能开发中，敬请期待',
      showCancel: false,
      confirmText: '知道了',
    })
  })
}

function handleReadHistory() {
  uni.navigateTo({ url: '/pages/history/index' }).catch(() => {
    uni.showModal({
      title: '阅读历史',
      content: '功能开发中，敬请期待',
      showCancel: false,
      confirmText: '知道了',
    })
  })
}

function handleFeedback() {
  uni.showModal({
    title: '意见反馈',
    editable: true,
    placeholderText: '请输入你的建议或问题...',
    success: (res) => {
      if (res.confirm && res.content) {
        showToast('感谢你的反馈！', 'success')
      }
    },
  })
}

function handleAbout() {
  uni.showModal({
    title: '关于微澜 PulseRead',
    content: 'AI 驱动的跨领域资讯聚合与降噪阅读工具\n\n版本：v1.0.0\n\n覆盖科技、财经、政策、商情四大领域，智能降噪，让你只看最重要的资讯。',
    showCancel: false,
    confirmText: '知道了',
  })
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
      }
    },
  })
}

function handleDeleteAccount() {
  uni.showModal({
    title: '注销账号',
    content: '注销后您的账号将进入 30 天冷静期，期间重新登录可取消注销。冷静期结束后，所有数据将被永久删除，包括：\n\n• 阅读历史\n• 收藏内容\n• 雷达词配置\n• 偏好设置\n• 会员权益',
    confirmText: '确认注销',
    confirmColor: '#FF4D4F',
    success: (res) => {
      if (res.confirm) {
        showToast('注销申请已提交，30天冷静期开始', 'none')
        setTimeout(() => {
          userStore.logout()
        }, 1500)
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.profile-page {
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

.nav-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.settings-btn {
  padding: 8rpx;
}

.settings-icon {
  font-size: 36rpx;
}

/* 内容滚动 */
.content-scroll {
  height: calc(100vh - 88px - 100rpx);
}

/* 用户卡片 */
.user-card {
  background: #ffffff;
  margin: 24rpx 24rpx 0;
  border-radius: 20rpx;
  padding: 32rpx 24rpx 0;
  overflow: hidden;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 3rpx solid #e8e8e8;
}

.user-detail {
  flex: 1;
}

.username {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8rpx;
}

.member-badge {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 500;
  background: #f5f5f5;
  color: #999;

  &.pro {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    color: #92400e;
  }

  &.enterprise {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    color: #1e40af;
  }
}

.edit-btn {
  padding: 12rpx 28rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 999rpx;
  font-size: 26rpx;
  color: #666;
}

/* 登录提示 */
.login-prompt {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.default-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
}

.login-info {
  flex: 1;
}

.login-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6rpx;
}

.login-desc {
  font-size: 24rpx;
  color: #999;
}

.login-arrow {
  font-size: 40rpx;
  color: #bbb;
}

/* 数据统计 */
.stats-row {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-top: 1rpx solid #f5f5f5;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.stat-num {
  font-size: 36rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
}

.stat-divider {
  width: 1rpx;
  height: 48rpx;
  background: #f0f0f0;
}

/* Pro 卡片 */
.pro-card {
  margin: 16rpx 24rpx 0;
  background: linear-gradient(135deg, #1DB954, #17A348);
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:active {
    opacity: 0.9;
  }
}

.pro-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.pro-icon {
  font-size: 40rpx;
}

.pro-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.pro-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #ffffff;
}

.pro-desc {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.pro-btn {
  padding: 12rpx 24rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.4);
  font-size: 26rpx;
  color: #ffffff;
  font-weight: 600;
}

/* 菜单组 */
.menu-section {
  margin: 24rpx 24rpx 0;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.menu-group {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
  transition: all 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f5f5f5;
  }

  &.danger:active {
    background: #fff1f0;
  }
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.menu-icon {
  font-size: 36rpx;
}

.menu-name {
  font-size: 28rpx;
  color: #1a1a1a;
}

.danger-text {
  color: #ff4d4f;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.menu-badge {
  padding: 4rpx 14rpx;
  background: #f5f5f5;
  border-radius: 999rpx;
  font-size: 22rpx;
  color: #999;
}

.menu-version {
  font-size: 24rpx;
  color: #bbb;
}

.menu-arrow {
  font-size: 36rpx;
  color: #bbb;
}

/* 底部版权 */
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 24rpx 32rpx;
  gap: 8rpx;
}

.footer-text {
  font-size: 22rpx;
  color: #bbb;
}

.footer-version {
  font-size: 20rpx;
  color: #ddd;
}
</style>
