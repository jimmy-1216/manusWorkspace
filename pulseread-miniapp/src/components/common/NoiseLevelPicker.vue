<template>
  <!-- 降噪档位选择器 -->
  <view class="noise-picker">
    <view class="picker-header">
      <text class="picker-title">降噪强度</text>
      <text class="picker-close" @tap="$emit('close')">×</text>
    </view>

    <view class="level-list">
      <view
        v-for="level in NOISE_LEVEL_CONFIGS"
        :key="level.key"
        class="level-item"
        :class="{ selected: modelValue === level.key }"
        @tap="handleSelect(level.key)"
      >
        <view class="level-left">
          <text class="level-icon">{{ level.icon }}</text>
          <view class="level-info">
            <view class="level-name-row">
              <text class="level-name">{{ level.label }}</text>
              <view v-if="level.recommended" class="recommended-badge">推荐</view>
            </view>
            <text class="level-desc">{{ level.description }}</text>
          </view>
        </view>
        <view class="level-right">
          <text class="level-count">{{ level.dailyCount }}</text>
          <view v-if="modelValue === level.key" class="check-icon">✓</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { NoiseLevel } from '@/types'
import { NOISE_LEVEL_CONFIGS } from '@/utils/constants'

defineProps<{
  modelValue: NoiseLevel
}>()

const emit = defineEmits<{
  'update:modelValue': [value: NoiseLevel]
  close: []
}>()

function handleSelect(key: NoiseLevel) {
  emit('update:modelValue', key)
  emit('close')
}
</script>

<style lang="scss" scoped>
.noise-picker {
  background: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 0 0 40rpx;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.picker-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.picker-close {
  font-size: 40rpx;
  color: #999;
  line-height: 1;
  padding: 8rpx;
}

.level-list {
  padding: 16rpx 24rpx;
}

.level-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 20rpx;
  border-radius: 16rpx;
  margin-bottom: 12rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s;
  background: #fafafa;

  &.selected {
    background: #f0fdf4;
    border-color: #1DB954;
  }

  &:active {
    opacity: 0.8;
  }
}

.level-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.level-icon {
  font-size: 44rpx;
  width: 60rpx;
  text-align: center;
}

.level-info {
  flex: 1;
}

.level-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 6rpx;
}

.level-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.recommended-badge {
  padding: 2rpx 10rpx;
  background: #1DB954;
  color: #fff;
  border-radius: 999rpx;
  font-size: 18rpx;
  font-weight: 500;
}

.level-desc {
  font-size: 24rpx;
  color: #999;
}

.level-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.level-count {
  font-size: 24rpx;
  color: #999;
}

.check-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #1DB954;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 700;
}
</style>
