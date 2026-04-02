# PulseRead 微澜 - 微信小程序端

> AI 驱动的跨领域资讯聚合与降噪阅读工具

## 技术栈

| 技术 | 版本 | 说明 |
|---|---|---|
| uni-app | 3.x | 跨端框架，编译至微信小程序 |
| Vue 3 | 3.4.x | Composition API + `<script setup>` |
| TypeScript | 5.x | 全量类型覆盖 |
| Pinia | 2.x | 状态管理 |
| Vite | 5.x | 构建工具 |
| uni-ui | 1.5.x | 官方 UI 组件库 |

## 项目结构

```
src/
├── pages/
│   ├── onboarding/index.vue   # 3步引导页
│   ├── feed/index.vue         # 发现页（主页）
│   ├── article/index.vue      # 文章详情页
│   ├── search/index.vue       # 搜索页
│   ├── preference/index.vue   # 偏好设置页
│   ├── profile/index.vue      # 个人中心页
│   └── login/index.vue        # 登录/注册页
├── components/
│   ├── feed/ArticleCard.vue   # 新闻卡片组件
│   └── common/
│       └── NoiseLevelPicker.vue  # 降噪档位选择器
├── stores/
│   ├── user.ts                # 用户状态
│   ├── preference.ts          # 偏好设置状态
│   └── feed.ts                # 资讯 Feed 状态
├── api/
│   ├── request.ts             # HTTP 请求封装
│   └── index.ts               # API 接口定义
├── utils/
│   ├── constants.ts           # 常量配置
│   ├── mockData.ts            # Mock 数据
│   └── index.ts               # 工具函数
├── types/
│   └── index.ts               # TypeScript 类型定义
├── App.vue                    # 根组件
├── main.ts                    # 入口文件
├── pages.json                 # 路由配置
├── manifest.json              # 小程序配置
└── uni.scss                   # 全局样式变量
```

## 核心功能实现

### 1. 4 档降噪滑块
- 视野全开（0分+）/ 核心聚焦（60分+）/ 重大事件（75分+）/ 行业地震（88分+）
- 前端内存级实时过滤，无需后端请求
- 对应 `stores/preference.ts` 中的 `noiseLevel` 状态

### 2. 专属雷达词
- 用户自定义关键词，命中即强制置顶
- 支持最多 20 个雷达词
- 对应 `stores/preference.ts` 中的 `radarWords` 状态

### 3. 文章详情 3 Tab
- AI 提炼（摘要 + 要点 + 快捷提问 + 知识溯源树 + AI 对话）
- 原文内容
- 双语对照（中英文）

### 4. Onboarding 3步引导
- 步骤 1：产品功能介绍
- 步骤 2：选择感兴趣领域
- 步骤 3：设置降噪档位

## 开发与构建

```bash
# 安装依赖
npm install

# 开发（微信小程序）
npm run dev:mp-weixin

# 构建（微信小程序）
npm run build:mp-weixin

# 开发（H5 预览）
npm run dev:h5
```

## 接入后端

目前所有数据使用 `src/utils/mockData.ts` 中的 Mock 数据。接入真实后端时：

1. 修改 `src/api/request.ts` 中的 `BASE_URL`
2. 将 `src/stores/feed.ts` 中的 Mock 调用替换为 `articleApi.getList()`
3. 将 `src/pages/article/index.vue` 中的 Mock 替换为 `articleApi.getDetail(id)`

## 颜色规范

| 颜色 | 用途 | 值 |
|---|---|---|
| 主绿色 | 品牌色、按钮、选中态 | `#1DB954` |
| 科技蓝 | 科技领域标签 | `#1677FF` |
| 财经橙 | 财经领域标签 | `#FA8C16` |
| 政策绿 | 政策领域标签 | `#52C41A` |
| 商情粉 | 商情领域标签 | `#EB2F96` |
| 利好绿 | 正面情绪 | `#52C41A` |
| 利空红 | 负面情绪 | `#FF4D4F` |
