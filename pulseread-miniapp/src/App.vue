<script lang="ts" setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { usePreferenceStore } from '@/stores/preference'

const userStore = useUserStore()
const preferenceStore = usePreferenceStore()

onLaunch(() => {
  // 初始化用户状态
  userStore.initFromStorage()
  // 初始化偏好设置
  preferenceStore.initFromStorage()

  // 判断是否需要 Onboarding
  const hasOnboarded = uni.getStorageSync('has_onboarded')
  if (!hasOnboarded) {
    uni.reLaunch({ url: '/pages/onboarding/index' })
  }
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
/* 引入全局样式 */
@import './uni.scss';

/* 全局重置 */
page {
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  color: #1a1a1a;
  font-size: 28rpx;
  line-height: 1.6;
}

/* 全局通用类 */
.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.flex-1 {
  flex: 1;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-ellipsis-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.text-ellipsis-3 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 卡片样式 */
.card {
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

/* 绿色按钮 */
.btn-primary {
  background: #1DB954;
  color: #ffffff;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 600;
  text-align: center;
  padding: 24rpx 0;
  border: none;
  
  &:active {
    background: #17A348;
    opacity: 0.9;
  }
}

/* 标签样式 */
.tag {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
  font-weight: 500;
}

.tag-tech {
  background: #E6F4FF;
  color: #1677FF;
}

.tag-finance {
  background: #FFF7E6;
  color: #FA8C16;
}

.tag-policy {
  background: #F6FFED;
  color: #52C41A;
}

.tag-commerce {
  background: #FFF0F6;
  color: #EB2F96;
}

.tag-ai {
  background: #F0F5FF;
  color: #2F54EB;
}

.tag-positive {
  background: #F6FFED;
  color: #52C41A;
}

.tag-negative {
  background: #FFF1F0;
  color: #FF4D4F;
}

.tag-neutral {
  background: #FAFAFA;
  color: #8C8C8C;
}
</style>
