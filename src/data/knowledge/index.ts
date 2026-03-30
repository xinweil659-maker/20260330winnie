// 知识库索引与搜索工具
// 提供按专业/行业/关键词检索知识库的能力

import type { TrainingPlan, PolicyDoc, SearchResult, KnowledgeBaseMeta } from './types'
import knowledgeData from './knowledge-data.json'

const trainingPlans: TrainingPlan[] = knowledgeData.trainingPlans
const policyDocs: PolicyDoc[] = knowledgeData.policyDocs

/**
 * 根据关键词搜索知识库
 * @param query 搜索关键词（支持空格/逗号分隔多个词）
 * @param limit 最大返回结果数
 */
export function searchKnowledgeBase(query: string, limit = 10): SearchResult[] {
  const keywords = query.toLowerCase().split(/[\s,，、]+/).filter(Boolean)
  if (keywords.length === 0) return []

  const results: SearchResult[] = []

  for (const plan of trainingPlans) {
    const text = `${plan.college} ${plan.sub || ''} ${plan.content}`.toLowerCase()
    const score = keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0)
    if (score > 0) {
      results.push({
        type: 'training',
        source: plan.source,
        title: plan.sub ? `${plan.college} - ${plan.sub}` : plan.college,
        category: plan.college,
        snippet: plan.content.substring(0, 200).replace(/\s+/g, ' '),
        relevanceScore: score
      })
    }
  }

  for (const doc of policyDocs) {
    const text = `${doc.category} ${doc.fileName} ${doc.content}`.toLowerCase()
    const score = keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0)
    if (score > 0) {
      results.push({
        type: 'policy',
        source: doc.source,
        title: doc.fileName,
        category: doc.category,
        snippet: doc.content.substring(0, 200).replace(/\s+/g, ' '),
        relevanceScore: score
      })
    }
  }

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit)
}

/**
 * 按类别获取政策文件
 */
export function getPoliciesByCategory(category: string): PolicyDoc[] {
  return policyDocs.filter(d => d.category === category)
}

/**
 * 按学院获取人才培养方案
 */
export function getTrainingPlansByCollege(college: string): TrainingPlan[] {
  return trainingPlans.filter(p => p.college.includes(college))
}

/**
 * 获取与特定专业相关的政策和人培方案
 */
export function getRelatedDocs(majorKeywords: string[], limit = 5): {
  policies: PolicyDoc[]
  plans: TrainingPlan[]
} {
  const keywordStr = majorKeywords.join(' ').toLowerCase()

  const relatedPolicies = policyDocs
    .map(doc => {
      const text = `${doc.category} ${doc.fileName} ${doc.content}`.toLowerCase()
      const score = majorKeywords.reduce((acc, kw) => acc + (text.includes(kw.toLowerCase()) ? 1 : 0), 0)
      return { doc, score }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.doc)

  const relatedPlans = trainingPlans
    .map(plan => {
      const text = `${plan.college} ${plan.sub || ''} ${plan.content}`.toLowerCase()
      const score = majorKeywords.reduce((acc, kw) => acc + (text.includes(kw.toLowerCase()) ? 1 : 0), 0)
      return { plan, score }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.plan)

  return { policies: relatedPolicies, plans: relatedPlans }
}

/**
 * 获取知识库统计信息
 */
export function getKnowledgeBaseStats(): KnowledgeBaseMeta {
  return {
    generatedAt: knowledgeData.meta.generatedAt,
    version: knowledgeData.meta.version,
    totalTrainingPlans: trainingPlans.length,
    totalPolicyDocs: policyDocs.length
  }
}

/** 政策分类显示名映射 */
export const categoryNames: Record<string, string> = {
  '顶级政策': '国家级政策',
  '汽车类': '汽车行业政策',
  '人工智能类': '人工智能政策',
  '数字媒体类': '数字媒体政策',
  '文旅类': '文旅行业政策',
  '物流与供应链类': '物流与供应链政策',
  '医疗类': '医疗健康政策'
}

/** 所有政策分类 */
export const policyCategories = Object.keys(categoryNames)

// ============================================================
// 专业类别 → 知识库关联映射
// ============================================================

interface CategoryKnowledgeMapping {
  /** 搜索知识库用的关键词 */
  searchKeywords: string[]
  /** 匹配的政策分类优先级（从高到低） */
  policyCategories: string[]
  /** 匹配的人才培养方案学院关键词 */
  trainingCollegeKeywords: string[]
  /** 该领域政策中的核心数据（从政策文本中提取） */
  keyStats?: { label: string; value: string }[]
  /** 政策趋势关键词 */
  trendKeywords: string[]
}

const categoryKnowledgeMap: Record<string, CategoryKnowledgeMapping> = {
  '机械制造类': {
    searchKeywords: ['汽车', '机械', '制造', '智能制造', '新能源'],
    policyCategories: ['汽车类', '顶级政策'],
    trainingCollegeKeywords: ['汽车学院'],
    keyStats: [
      { label: '2025年汽车销量目标', value: '3,230万辆' },
      { label: '新能源汽车销量', value: '1,550万辆' },
      { label: '数字化研发工具普及率', value: '>95%' },
    ],
    trendKeywords: ['智能网联', '数字化转型', '新能源汽车', '智能制造'],
  },
  '交通类': {
    searchKeywords: ['汽车', '新能源汽车', '电池', '充电', '智能网联'],
    policyCategories: ['汽车类', '顶级政策'],
    trainingCollegeKeywords: ['汽车学院'],
    keyStats: [
      { label: '2025年汽车销量目标', value: '3,230万辆' },
      { label: '新能源汽车销量', value: '1,550万辆' },
      { label: '汽车出口增速', value: '持续增长' },
    ],
    trendKeywords: ['新能源汽车', '智能网联', '充换电', '动力电池'],
  },
  '信息技术类': {
    searchKeywords: ['人工智能', '大数据', '数据', '数字化', '云计算', '信息技术'],
    policyCategories: ['人工智能类', '顶级政策'],
    trainingCollegeKeywords: ['人工智能与大数据学院'],
    keyStats: [
      { label: '数字经济规模', value: '50万亿元+' },
      { label: '人才缺口（2028）', value: '800万+' },
      { label: '数据要素市场增速', value: '>20%' },
    ],
    trendKeywords: ['人工智能+', '数据要素', '云计算', '工业互联网'],
  },
  '经济管理类': {
    searchKeywords: ['物流', '供应链', '金融', '数字化', '中小企业'],
    policyCategories: ['物流与供应链类', '顶级政策'],
    trainingCollegeKeywords: ['智慧物流与供应链学院'],
    keyStats: [
      { label: '数智供应链领军企业', value: '100家' },
      { label: '全社会物流成本', value: '持续降低' },
      { label: '供应链数字化率', value: '显著提升' },
    ],
    trendKeywords: ['数智供应链', '物流降本', '供应链金融', '场景应用'],
  },
  '医药卫生类': {
    searchKeywords: ['医疗', '卫生', '护理', '养老', '健康', '康复', '医药'],
    policyCategories: ['医疗类', '顶级政策'],
    trainingCollegeKeywords: ['卫生健康学院'],
    keyStats: [
      { label: '医药工业数智化', value: '2025-2030' },
      { label: '医养结合试点', value: '全国推进' },
      { label: '银发经济规模', value: '快速增长' },
    ],
    trendKeywords: ['医养结合', '数智医疗', '康复医疗', '银发经济'],
  },
  '旅游服务类': {
    searchKeywords: ['旅游', '文旅', '文化', '酒店', '景区'],
    policyCategories: ['文旅类', '数字媒体类', '顶级政策'],
    trainingCollegeKeywords: ['数字文旅学院'],
    keyStats: [
      { label: '文旅消费增长', value: '显著提升' },
      { label: '智慧旅游试点', value: '全面推进' },
      { label: '文旅+百业融合', value: '深度发展' },
    ],
    trendKeywords: ['智慧旅游', '文旅融合', '沉浸式体验', '数字化'],
  },
  '艺术设计类': {
    searchKeywords: ['数字媒体', '动漫', '文化', '媒体融合', '创意'],
    policyCategories: ['数字媒体类', '文旅类', '顶级政策'],
    trainingCollegeKeywords: ['数字媒体学院'],
    keyStats: [
      { label: '媒体融合规划', value: '十五五' },
      { label: '数字消费增长', value: '高速发展' },
      { label: 'AI+视听产业', value: '2025-2029' },
    ],
    trendKeywords: ['媒体融合', '数字内容', 'AI创作', '网络出版'],
  },
}

/** 未映射的默认配置 */
const defaultKnowledgeMapping: CategoryKnowledgeMapping = {
  searchKeywords: ['发展', '就业', '人才'],
  policyCategories: ['顶级政策'],
  trainingCollegeKeywords: [],
  trendKeywords: ['高质量发展', '就业优先', '数字化转型'],
}

/**
 * 根据专业类别获取关联的政策文档和培养方案
 */
export function getKnowledgeForMajor(
  majorName: string,
  majorCategory: string,
  majorKeywords: string[]
): {
  /** 相关政策文档（按相关度排序） */
  policies: PolicyDoc[]
  /** 相关培养方案 */
  plans: TrainingPlan[]
  /** 所属映射配置 */
  mapping: CategoryKnowledgeMapping
} {
  const mapping = categoryKnowledgeMap[majorCategory] || defaultKnowledgeMapping
  const searchKws = [...mapping.searchKeywords, ...majorKeywords]
  // 优先分类列表（索引越小越优先）
  const categoryPriority: Record<string, number> = {}
  mapping.policyCategories.forEach((cat, i) => { categoryPriority[cat] = i })
  categoryPriority['顶级政策'] = mapping.policyCategories.length // 顶级政策排在专业分类之后

  // 搜索相关政策（分类匹配加权 + 文本匹配 + 非相关分类降权）
  const policies = policyDocs
    .map(doc => {
      const text = `${doc.category} ${doc.fileName} ${doc.content}`.toLowerCase()
      const textScore = searchKws.reduce((acc, kw) => acc + (text.includes(kw.toLowerCase()) ? 1 : 0), 0)
      // 标题匹配额外加权（标题出现关键词说明更直接相关）
      const titleText = doc.fileName.toLowerCase()
      const titleBonus = searchKws.reduce((acc, kw) => acc + (titleText.includes(kw.toLowerCase()) ? 2 : 0), 0)
      // 分类优先级加权
      const catBonus = categoryPriority[doc.category] !== undefined ? (10 - categoryPriority[doc.category]) * 3 : 0
      // 非目标分类降权：标题不含关键词且分类不在目标列表中的弱相关文档
      const irrelevantPenalty = (!catBonus && !titleBonus) ? -8 : 0
      return { doc, score: textScore + titleBonus + catBonus + irrelevantPenalty }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(r => r.doc)

  // 搜索相关培养方案
  const plans = mapping.trainingCollegeKeywords.length > 0
    ? trainingPlans.filter(p =>
        mapping.trainingCollegeKeywords.some(k => p.college.includes(k))
      ).slice(0, 3)
    : []

  return { policies, plans, mapping }
}

/**
 * 从政策文档内容中提取关键信息摘要
 */
export function extractPolicyHighlights(docs: PolicyDoc[], maxHighlights = 5): {
  title: string
  category: string
  highlights: string[]
}[] {
  return docs.slice(0, maxHighlights).map(doc => {
    const content = doc.content
    const highlights: string[] = []

    // 提取带编号的要点（如 "一、xxx" "（一）xxx"）
    const sections = content.match(/[一二三四五六七八九十]+[、．.][^\n]{10,80}/g)
    if (sections) highlights.push(...sections.slice(0, 3).map(s => s.trim()))

    // 提取关键数据（含数字的句子）
    const dataSentences = content.match(/[^。！？\n]{5,60}[0-9]+[万亿%％][^。！？\n]{0,20}/g)
    if (dataSentences) highlights.push(...dataSentences.slice(0, 2).map(s => s.trim()))

    return {
      title: doc.fileName,
      category: doc.category,
      highlights: [...new Set(highlights)].slice(0, 4),
    }
  })
}

/**
 * 从政策文档中提取趋势/前沿信息
 */
export function extractPolicyTrends(docs: PolicyDoc[]): {
  date: string
  title: string
  desc: string
  source: string
}[] {
  return docs.slice(0, 6).map(doc => {
    // 日期解析：优先 "2025年" → 年份范围 → 任意有效年份
    let date = '2025'
    const yFromName = doc.fileName.match(/^(?:\s*GBT?\s*)?(\d{4})\s*年/)
    if (yFromName) {
      const mMatch = doc.fileName.match(/(\d{4})\s*年\s*(\d{1,2})\s*月/)
      date = mMatch ? mMatch[1] + '.' + mMatch[2] : yFromName[1]
    } else {
      const rMatch = doc.fileName.match(/[（(](\d{4})[—\-～~](\d{4})[）)]/)
      if (rMatch) date = rMatch[1] + '-' + rMatch[2].slice(-2)
      else {
        const years = doc.fileName.match(/(\d{4})/g) || []
        const valid = years.find(y => parseInt(y) >= 2024 && parseInt(y) <= 2030)
        if (valid) date = valid
      }
    }

    // 标题：去掉括号内容和标准号前缀
    let title = doc.fileName
      .replace(/^GBT?\s*\d+[-—]\d+\s*《?/, '')   // 去掉 "GBT45653-2025《"
      .replace(/》$/, '')                           // 去掉尾部 "》"
      .replace(/[（(][^）)]*[）)]/g, '')            // 去掉括号内容
      .replace(/\s+/g, '')
      .substring(0, 30)

    // 摘要提取：智能多级回退
    const text = doc.content.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ')

    let desc = ''

    // 1. "主要目标" / "重点任务" 后的内容（通常含关键数据）
    const goalSec = text.match(/(?:主要目标|重点任务|重点举措|总体要求)[：:]\s*([^一二三四五六七八九十]{5,200})/)
    if (goalSec) {
      desc = goalSec[1].trim().replace(/\s+/g, ' ').substring(0, 100)
    }

    // 2. "到XXXX年" 目标（含具体数字更有说服力）
    if (!desc) {
      const goalYear = text.match(/到\d+年[^。]{10,100}(?:。)/)
      if (goalYear) desc = goalYear[0]
    }

    // 3. 第一段编号要点（完整提取，不截断）
    if (!desc) {
      const numberedSec = text.match(/[一二三四五六七八九十]+[、．.]\s*[^\n]{10,100}(?:。)/)
      if (numberedSec) desc = numberedSec[0]
    }

    // 4. 含核心数据的句子
    if (!desc) {
      const dataSentence = text.match(/[^。！？\n]{5,50}[0-9]+[万亿%％][^。！？\n]{0,30}[。！？]/)
      if (dataSentence) desc = dataSentence[0]
    }

    // 5. 文档开头段落（确保不截断到半个词）
    if (!desc) {
      const firstSentence = text.match(/[^。！？\n]{10,150}(?:[。！？])/)
      desc = firstSentence ? firstSentence[0] : text.substring(0, 100) + '...'
    }

    return {
      date,
      title,
      desc: desc.substring(0, 100),
      source: doc.category,
    }
  })
}
