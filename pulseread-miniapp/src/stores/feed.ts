import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Article, DomainType, RegionType } from '@/types'
import { MOCK_ARTICLES } from '@/utils/mockData'
import { usePreferenceStore } from './preference'

export const useFeedStore = defineStore('feed', () => {
  const preferenceStore = usePreferenceStore()

  const articles = ref<Article[]>([])
  const isLoading = ref(false)
  const isRefreshing = ref(false)
  const hasMore = ref(true)
  const page = ref(1)

  // 筛选条件
  const selectedRegion = ref<RegionType>('all')
  const selectedDomain = ref<DomainType | 'all'>('all')
  const newCount = ref(3) // 新资讯数量提示

  /** 过滤后的文章列表（根据降噪档位、地区、领域，雷达词命中的文章强制置顶） */
  const filteredArticles = computed(() => {
    const { noiseLevel, domains, radarWords, blockedSentiments } = preferenceStore.preference
    const scoreMap = { open: 0, focus: 60, major: 75, quake: 88 }
    const minScore = scoreMap[noiseLevel]

    const base = articles.value.filter(article => {
      // 降噪过滤（雷达词命中的文章穿透降噪档位）
      const isRadarHit = radarWords.length > 0 && article.radarWords?.some(w => radarWords.includes(w))
      if (!isRadarHit && article.aiScore < minScore) return false
      // 地区过滤
      if (selectedRegion.value !== 'all' && article.region !== selectedRegion.value) return false
      // 领域过滤（全部 or 选中领域）
      if (selectedDomain.value !== 'all' && article.domain !== selectedDomain.value) return false
      // 偏好领域过滤
      if (!domains.includes(article.domain)) return false
      // 情绪过滤
      if (blockedSentiments && blockedSentiments.length > 0 && blockedSentiments.includes(article.sentiment)) return false
      return true
    })

    // 雷达词命中的文章强制置顶
    const radarHits = base.filter(a => a.radarWords?.some(w => radarWords.includes(w)))
    const rest = base.filter(a => !a.radarWords?.some(w => radarWords.includes(w)))
    return [...radarHits, ...rest]
  })

  /** 加载资讯列表 */
  async function loadArticles(refresh = false) {
    if (isLoading.value) return
    if (refresh) {
      page.value = 1
      hasMore.value = true
      isRefreshing.value = true
    }
    if (!hasMore.value) return

    isLoading.value = true
    try {
      // 使用 mock 数据（实际项目中替换为 API 调用）
      await new Promise(resolve => setTimeout(resolve, 800))
      const mockData = [...MOCK_ARTICLES]

      if (refresh) {
        articles.value = mockData
      } else {
        articles.value = [...articles.value, ...mockData]
      }
      hasMore.value = false // mock 数据只有一页
      page.value++
    } finally {
      isLoading.value = false
      isRefreshing.value = false
    }
  }

  /** 切换地区 */
  function setRegion(region: RegionType) {
    selectedRegion.value = region
  }

  /** 切换领域 */
  function setDomain(domain: DomainType | 'all') {
    selectedDomain.value = domain
  }

  /** 点赞/取消点赞 */
  function toggleLike(articleId: number) {
    const article = articles.value.find(a => a.id === articleId)
    if (article) {
      article.isLiked = !article.isLiked
      article.likeCount += article.isLiked ? 1 : -1
    }
  }

  /** 收藏/取消收藏 */
  function toggleCollect(articleId: number) {
    const article = articles.value.find(a => a.id === articleId)
    if (article) {
      article.isCollected = !article.isCollected
      article.collectCount += article.isCollected ? 1 : -1
    }
  }

  /** 清除新资讯提示 */
  function clearNewCount() {
    newCount.value = 0
  }

  return {
    articles,
    filteredArticles,
    isLoading,
    isRefreshing,
    hasMore,
    selectedRegion,
    selectedDomain,
    newCount,
    loadArticles,
    setRegion,
    setDomain,
    toggleLike,
    toggleCollect,
    clearNewCount,
  }
})
