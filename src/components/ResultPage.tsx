import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  GraduationCap, MapPin, Building2, Briefcase,
  TrendingUp, Users, Rocket, Compass, BookOpen,
  Award, Target, Calendar, Lightbulb, ChevronRight,
  FileText, MonitorPlay, Sparkles, Zap, Database,
  CheckCircle2, Clock, ArrowUpRight, Download,
  Share2, RefreshCw, Activity, Brain, MessageSquare, ArrowRight, FileSearch
} from 'lucide-react'
import { majors } from '@/data/majors'
import { regions } from '@/data/regions'
import { industryOptions, regionPolicyMap } from '@/data/industries'
import type { SurveyFormData, DisplayMode, AnalysisMode, ModelConfig } from '@/types'
import {
  getKnowledgeForMajor,
  extractPolicyHighlights,
  extractPolicyTrends,
  categoryNames,
  getKnowledgeBaseStats,
} from '@/data/knowledge'
import { getMajorMarketInsight, type MajorMarketInsight } from '@/data/market-intel'

import type { PolicyDoc, TrainingPlan } from '@/data/knowledge/types'

interface CategoryKnowledgeMapping {
  searchKeywords: string[]
  policyCategories: string[]
  trainingCollegeKeywords: string[]
  keyStats?: { label: string; value: string }[]
  trendKeywords: string[]
}

interface ChatMessage {
  role: 'assistant' | 'user'
  content: string
}

interface NarrativeStat {
  label: string
  value: string
}

interface TimelineItem {
  year: string
  desc: string
}

interface StudyPlanItem {
  title: string
  desc: string
}

interface CompetitionItem {
  name: string
  desc: string
}

interface PracticeItem {
  title: string
  desc: string
}

interface HybridNarratives {
  aiSummary?: string
  majorOverview?: string
  skillDetailsByName: Record<string, string>
  regionPolicyById: Record<string, string>
  regionStatsById: Record<string, NarrativeStat[]>
  regionTalentPoliciesById: Record<string, string[]>
  industryById: Record<string, string>
  industryHighlightsById: Record<string, string[]>
  industryMetricsById: Record<string, NarrativeStat[]>
  industryTimelineById: Record<string, TimelineItem[]>
  recommendedCerts: string[]
  studyPlan: StudyPlanItem[]
  competitions: CompetitionItem[]
  practiceAdvice: PracticeItem[]
}

interface ResultPageProps {
  data: SurveyFormData
  displayMode: DisplayMode
  analysisMode: AnalysisMode
  modelConfig: ModelConfig
  onRetake: () => void
  onHome: () => void
}

function createEmptyHybridNarratives(): HybridNarratives {
  return {
    skillDetailsByName: {},
    regionPolicyById: {},
    regionStatsById: {},
    regionTalentPoliciesById: {},
    industryById: {},
    industryHighlightsById: {},
    industryMetricsById: {},
    industryTimelineById: {},
    recommendedCerts: [],
    studyPlan: [],
    competitions: [],
    practiceAdvice: [],
  }
}

export function ResultPage({ data, displayMode, analysisMode, modelConfig, onRetake, onHome }: ResultPageProps) {
  const [activeTab, setActiveTab] = useState('major')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({})
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [chatError, setChatError] = useState('')
  const [isEnhancingReport, setIsEnhancingReport] = useState(false)
  const [hybridNarratives, setHybridNarratives] = useState<HybridNarratives>(createEmptyHybridNarratives())

  const major = majors.find(m => m.id === data.majorId)
  const majorName = major?.name ?? ''
  const regionNames = data.regionIds.map(id => {
    if (id === 'quanguo') return '全国'
    return regions.find(r => r.id === id)?.name ?? id
  })
  const regionNamesText = regionNames.join('、')
  const regionPathText = regionNames.join(' / ')
  const industryNames = data.industryIds.map(id =>
    industryOptions.find(o => o.id === id)?.name ?? id
  )

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleSkill = (id: string) => {
    setExpandedSkills(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const tabs = [
    { id: 'major', label: '专业分析', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'region', label: '地域分析', icon: <MapPin className="w-4 h-4" /> },
    { id: 'industry', label: '行业信息', icon: <Building2 className="w-4 h-4" /> },
    { id: 'career', label: '就业建议', icon: <Briefcase className="w-4 h-4" /> },
  ]

  const generatedTime = new Date().toLocaleString('zh-CN')
  const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`
  const envApiUrl = (import.meta.env.VITE_LLM_API_URL as string | undefined)?.trim() ?? ''
  const envApiKey = (import.meta.env.VITE_LLM_API_KEY as string | undefined)?.trim() ?? ''
  const envModel = (import.meta.env.VITE_LLM_MODEL as string | undefined)?.trim() || 'deepseek-chat'
  const llmApiUrl = modelConfig.apiUrl.trim() || envApiUrl
  const llmApiKey = modelConfig.apiKey.trim() || envApiKey
  const llmModel = modelConfig.model.trim() || envModel
  const isModelMode = analysisMode === 'model'
  const hasModelConfig = isModelMode && llmApiUrl.length > 0 && llmApiKey.length > 0
  const shouldUseOnlineContent = isModelMode && hasModelConfig

  // 从知识库查询相关数据
  const { policies: relatedPolicies, plans: trainingPlans, mapping } = getKnowledgeForMajor(
    major?.name ?? '',
    major?.category ?? '',
    major?.keywords ?? []
  )
  const policyHighlights = extractPolicyHighlights(relatedPolicies, 4)
  const policyTrends = extractPolicyTrends(relatedPolicies)
  const kbStats = getKnowledgeBaseStats()
  const knowledgeScale = kbStats.totalPolicyDocs + kbStats.totalTrainingPlans
  const relatedPolicyCategories = [...new Set(relatedPolicies.map(p => p.category))]
  const dataSourceCount = relatedPolicyCategories.length + trainingPlans.length + 1
  const marketInsight = getMajorMarketInsight(majorName, major?.category ?? '', data.regionIds)

  const quickQuestions = [
    '这个专业平均薪资和薪资范围是多少？',
    '相关企业数量和招岗人数怎么样？',
    '有哪些龙头企业值得重点关注？',
    '我应该优先补哪些技能？',
  ]

  useEffect(() => {
    if (!hasModelConfig) {
      setHybridNarratives(createEmptyHybridNarratives())
      setIsEnhancingReport(false)
      return
    }

    let cancelled = false

    const enhance = async () => {
      setIsEnhancingReport(true)
      try {
        const skills = major?.keywords ?? ['专业技能', '实践能力', '创新能力']
        const prompt = [
          '请基于用户输入、知识库摘要和行业数据，生成就业分析 JSON（禁止 markdown、禁止解释性前后缀）。',
          '必须返回如下结构：',
          '{',
          '  "aiSummary": "",',
          '  "majorOverview": "",',
          '  "skillDetailsByName": {"技能名": "能力要求说明"},',
          '  "recommendedCerts": ["证书1", "证书2"],',
          '  "regionPolicyById": {"regionId": "战略定位"},',
          '  "regionStatsById": {"regionId": [{"label": "", "value": ""}]},',
          '  "regionTalentPoliciesById": {"regionId": ["政策点1", "政策点2"]},',
          '  "industryById": {"industryId": "该维度综合结论"},',
          '  "industryHighlightsById": {"industryId": ["要点1", "要点2", "要点3"]},',
          '  "industryMetricsById": {"industryId": [{"label": "", "value": ""}]},',
          '  "industryTimelineById": {"future": [{"year": "", "desc": ""}]},',
          '  "studyPlan": [{"title": "", "desc": ""}],',
          '  "competitions": [{"name": "", "desc": ""}],',
          '  "practiceAdvice": [{"title": "", "desc": ""}]',
          '}',
          '约束：',
          '1) 所有字段尽量填满，数组至少 3 条。',
          '2) 内容必须可执行，避免空泛形容词。',
          '3) 语言为简体中文。',
          `专业：${majorName || '未知'}；类别：${major?.category ?? '未知'}；核心技能：${skills.join('、')}。`,
          `目标地域：${regionNamesText}（regionId=${data.regionIds.join('、')}）。`,
          `行业维度（industryId）：${data.industryIds.join('、')}。`,
          `知识库政策数量：${relatedPolicies.length}；政策分类：${relatedPolicyCategories.join('、') || '暂无'}。`,
          `趋势关键词：${mapping.trendKeywords.join('、')}。`,
          `离线样本：平均月薪${formatCurrency(marketInsight.salary.avgMonthly)}，区间${formatCurrency(marketInsight.salary.minMonthly)}-${formatCurrency(marketInsight.salary.maxMonthly)}，相关企业${marketInsight.enterprise.relatedEnterpriseCount}家，招岗${marketInsight.enterprise.hiringPositions}人。`,
        ].join('\n')

        const text = await requestModelReply({
          apiUrl: llmApiUrl,
          apiKey: llmApiKey,
          model: llmModel,
          question: prompt,
          history: [],
          contextPrompt: '你是就业指导分析助手。当前任务是在线生成完整报告数据，只输出合法 JSON。',
        })

        const parsed = parseHybridNarratives(text)
        if (!cancelled) {
          setHybridNarratives(parsed ?? createEmptyHybridNarratives())
        }
      } catch {
        if (!cancelled) {
          setHybridNarratives(createEmptyHybridNarratives())
        }
      } finally {
        if (!cancelled) setIsEnhancingReport(false)
      }
    }

    void enhance()
    return () => {
      cancelled = true
    }
  }, [
    hasModelConfig,
    llmApiUrl,
    llmApiKey,
    llmModel,
    majorName,
    major?.category,
    major?.keywords,
    regionNamesText,
    data.regionIds,
    data.industryIds,
    relatedPolicies.length,
    relatedPolicyCategories,
    mapping.trendKeywords,
    marketInsight.salary.avgMonthly,
    marketInsight.salary.minMonthly,
    marketInsight.salary.maxMonthly,
    marketInsight.enterprise.relatedEnterpriseCount,
    marketInsight.enterprise.hiringPositions,
  ])

  useEffect(() => {
    setChatMessages([
      {
        role: 'assistant',
        content: !isModelMode
          ? `你好，当前为本地模式：我会使用离线市场数据与上传知识库，为你分析${majorName || '当前专业'}在${regionNamesText}的就业信息。`
          : hasModelConfig
            ? `你好，当前为大模型模式（${llmModel}）：报告各模块和问答都会实时在线生成。你可以直接提问。`
            : '你好，当前为大模型模式，但缺少 API URL 或 API Key，请先返回问卷页右上角完成配置。',
      },
    ])
  }, [isModelMode, hasModelConfig, llmModel, major?.id, majorName, regionNamesText, regionPathText])

  const handleSendQuestion = async (question: string) => {
    const content = question.trim()
    if (!content || isChatLoading) return

    setChatError('')
    setChatMessages(prev => [...prev, { role: 'user', content }])
    setChatInput('')
    setIsChatLoading(true)

    try {
      if (isModelMode) {
        if (!hasModelConfig) {
          const tip = '大模型模式下必须先配置 API URL 与 API Key。'
          setChatError(tip)
          setChatMessages(prev => [...prev, { role: 'assistant', content: tip }])
          return
        }

        const reply = await requestModelReply({
          apiUrl: llmApiUrl,
          apiKey: llmApiKey,
          model: llmModel,
          question: content,
          history: chatMessages.slice(-6),
          contextPrompt: `你是一名职业规划与就业指导助手。请结合专业与地域信息给出简洁、可执行建议。当前专业：${majorName || '未知'}；专业类别：${major?.category ?? '未知'}；关注地域：${regionNamesText}。回答使用简体中文，优先给出结论和行动建议。`,
        })
        setChatMessages(prev => [...prev, { role: 'assistant', content: reply }])
        return
      }

      const localReply = generateDigitalHumanReply(content, {
        majorName: major?.name ?? '',
        regionNames,
        marketInsight,
        policyCount: relatedPolicies.length,
        trendKeywords: mapping.trendKeywords,
        topPolicyTitle: policyTrends[0]?.title,
        knowledgeScale,
      })
      setChatMessages(prev => [...prev, { role: 'assistant', content: localReply }])
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : '请求失败，请稍后重试'
      setChatError(errMsg)
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: isModelMode ? `在线模型请求失败：${errMsg}` : `请求失败：${errMsg}` },
      ])
    } finally {
      setIsChatLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-52px)] tech-grid-bg">
      {/* Page Sub-header */}
      <div className="border-b border-slate-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white truncate">AI 就业指导报告</h1>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{major?.name} // {regionNames.join(' / ')} // {reportId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot" />
              <span className="text-[10px] text-emerald-400 font-medium">已生成</span>
            </div>
            <Badge variant="outline" className="hidden sm:flex bg-slate-800/50 border-slate-700 text-slate-400 text-xs">
              {displayMode === 'text' ? <><FileText className="w-3 h-3 mr-1" />文字模式</> : <><MonitorPlay className="w-3 h-3 mr-1" />智能问答</>}
            </Badge>
            <Badge className={`hidden sm:flex text-xs ${isModelMode ? 'bg-purple-500/15 border-purple-500/25 text-purple-300' : 'bg-cyan-500/15 border-cyan-500/25 text-cyan-300'}`}>
              {isModelMode ? '大模型模式' : '本地模式'}
            </Badge>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Digital Human Mode -> Chat Interaction */}
        {displayMode === 'digital-human' && (
          <div className="digital-human-container p-5 sm:p-6 fade-in-up space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <MonitorPlay className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white">智能问答助手</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge className="bg-purple-500/15 border-purple-500/20 text-purple-400 text-[10px]">
                  在线问答
                </Badge>
                <Badge className={`text-[10px] ${isModelMode ? (hasModelConfig ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300' : 'bg-amber-500/15 border-amber-500/25 text-amber-300') : 'bg-cyan-500/15 border-cyan-500/25 text-cyan-300'}`}>
                  {isModelMode ? (hasModelConfig ? `全量在线模型：${llmModel}` : '大模型未配置') : '离线数据+知识库'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-slate-800/35 border border-slate-700/50 text-center">
                <p className="text-lg font-black text-cyan-400 font-mono">{formatCurrency(marketInsight.salary.avgMonthly)}</p>
                <p className="text-[10px] text-slate-500">平均月薪</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/35 border border-slate-700/50 text-center">
                <p className="text-lg font-black text-purple-400 font-mono">{marketInsight.enterprise.relatedEnterpriseCount.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500">相关企业数</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/35 border border-slate-700/50 text-center">
                <p className="text-lg font-black text-blue-400 font-mono">{marketInsight.enterprise.hiringPositions.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500">招岗人数</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-[#0b1120] overflow-hidden">
              <div className="max-h-72 overflow-y-auto p-3 space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div key={`${msg.role}-${idx}`} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[90%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                        msg.role === 'assistant'
                          ? 'bg-slate-800/80 border border-slate-700/60 text-slate-300'
                          : 'bg-cyan-500/15 border border-cyan-500/25 text-cyan-200'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] px-3 py-2 rounded-xl text-xs leading-relaxed bg-slate-800/80 border border-slate-700/60 text-slate-400">
                      AI 正在思考中...
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-700/50 p-3 space-y-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {quickQuestions.map(q => (
                    <button
                      key={q}
                      onClick={() => handleSendQuestion(q)}
                      disabled={isChatLoading}
                      className="px-2.5 py-1 rounded-lg text-[10px] bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:border-cyan-500/30 hover:text-cyan-300 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    void handleSendQuestion(chatInput)
                  }}
                >
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isChatLoading}
                    placeholder="输入你关心的问题，例如：这个专业在成都薪资怎么样？"
                    className="flex-1 h-10 px-3 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={isChatLoading || !chatInput.trim()}
                    className="h-10 px-3 rounded-lg bg-gradient-to-r from-cyan-500/80 to-blue-500/80 text-white text-xs font-semibold hover:from-cyan-500 hover:to-blue-500 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="inline-flex items-center gap-1">
                      {isChatLoading ? '发送中' : '发送'} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                </form>

                {chatError && (
                  <p className="text-[10px] text-rose-300/90">模型接口异常：{chatError}</p>
                )}
                {isModelMode && !hasModelConfig && (
                  <p className="text-[10px] text-amber-300/90">当前为大模型模式：请先配置 API URL 与 API Key，配置完成后报告各模块将实时在线生成。</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Report Summary Card */}
        <div className="glow-card rounded-2xl p-5 sm:p-6 neon-border fade-in-up">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-black text-white mb-1">{major?.name} — 就业指导报告</h2>
              <p className="text-xs text-slate-500 mb-3">
                基于 AI 多维分析 · 结合国家政策与行业数据生成
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400 text-[10px] font-mono">
                  <GraduationCap className="w-3 h-3 mr-1" />{major?.name}
                </Badge>
                {regionNames.map(name => (
                  <Badge key={name} className="bg-purple-500/10 border-purple-500/20 text-purple-400 text-[10px] font-mono">
                    <MapPin className="w-3 h-3 mr-1" />{name}
                  </Badge>
                ))}
                {industryNames.map(name => (
                  <Badge key={name} className="bg-blue-500/10 border-blue-500/20 text-blue-400 text-[10px] font-mono">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          {/* Report Meta */}
          <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-wrap items-center gap-4 text-[10px] text-slate-600 font-mono">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{generatedTime}</span>
            <span className="flex items-center gap-1"><Database className="w-3 h-3" />{dataSourceCount} 数据源 · {relatedPolicies.length} 政策文件</span>
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" />置信度 {(85 + relatedPolicies.length * 2).toFixed(1)}%</span>
            <div className="ml-auto flex items-center gap-2">
              <button className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition cursor-pointer">
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition cursor-pointer">
                <Download className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Analysis Summary */}
        <div className="glow-card rounded-2xl p-5 fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">AI 综合研判</h3>
            <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[10px] ml-auto">
              {isEnhancingReport ? '增强中' : 'COMPLETED'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {shouldUseOnlineContent
              ? (hybridNarratives.aiSummary || (isEnhancingReport ? '正在实时生成 AI 综合研判...' : '在线模型未返回综合研判，请稍后重试。'))
              : `综合${regionNames.join('、')}地区${major?.name}相关产业数据分析，已检索到${relatedPolicies.length}份相关政策文件，涵盖${relatedPolicyCategories.map(c => categoryNames[c] ?? c).join('、')}等领域。建议重点关注${mapping.trendKeywords.slice(0, 2).join('、')}和${mapping.trendKeywords.slice(2, 4).join('、')}方向。`}
          </p>
        </div>

        {/* Alumni Community Ticker */}
        <div className="glow-card rounded-2xl p-5 fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">校友实时关注</h3>
              <p className="text-[10px] text-slate-600 font-mono mt-0.5">COMMUNITY LIVE TICKER</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot" />
              <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
            </div>
          </div>

          {/* Ticker Row 1 - Major + Region Combos */}
          <div className="mb-3">
            <p className="text-[10px] text-slate-600 mb-2 flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />热门专业 × 地域组合
            </p>
            <div className="relative overflow-hidden">
              <div className="flex gap-3 animate-ticker-left">
                {[...tickerDataMajorRegion, ...tickerDataMajorRegion].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-800/50 whitespace-nowrap shrink-0 hover:border-purple-500/20 transition">
                    <GraduationCap className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="text-[11px] text-slate-300 font-medium">{item.major}</span>
                    <span className="text-slate-700">·</span>
                    <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
                    <span className="text-[11px] text-slate-300 font-medium">{item.region}</span>
                    <span className="text-[9px] text-slate-600 font-mono">{item.count}人关注</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ticker Row 2 - Industry Hot */}
          <div className="mb-3">
            <p className="text-[10px] text-slate-600 mb-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />热门行业方向
            </p>
            <div className="relative overflow-hidden">
              <div className="flex gap-3 animate-ticker-right">
                {[...tickerDataIndustry, ...tickerDataIndustry].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-800/50 whitespace-nowrap shrink-0 hover:border-amber-500/20 transition">
                    <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="text-[11px] text-slate-300 font-medium">{item.industry}</span>
                    <span className={`px-1 py-0.5 rounded text-[8px] font-bold font-mono ${item.tag === 'HOT' ? 'bg-red-500/15 text-red-400' : 'bg-cyan-500/15 text-cyan-400'}`}>{item.tag}</span>
                    <span className="text-[9px] text-slate-600 font-mono">{item.count}人想了解</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ticker Row 3 - What they want to know */}
          <div>
            <p className="text-[10px] text-slate-600 mb-2 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />大家都在关注
            </p>
            <div className="relative overflow-hidden">
              <div className="flex gap-3 animate-ticker-left-slow">
                {[...tickerDataInterest, ...tickerDataInterest].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-800/50 whitespace-nowrap shrink-0 hover:border-cyan-500/20 transition">
                    <Lightbulb className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="text-[11px] text-slate-300">{item.text}</span>
                    <span className="text-[9px] text-slate-600 font-mono">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 bg-slate-900/80 rounded-xl p-1 border border-slate-800/50 h-auto">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center justify-center gap-1.5 py-2.5 text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-500/30 rounded-lg cursor-pointer text-slate-500 data-[state=active]:shadow-none"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab 1: Major Analysis */}
          <TabsContent value="major" className="fade-in">
            <div className="space-y-5">
              <div className="glow-card rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                  </div>
                  <CardTitle className="text-base font-bold text-white">{major?.name} — 专业概况</CardTitle>
                </div>
                <CardContent className="p-0 space-y-4">
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {shouldUseOnlineContent
                      ? (hybridNarratives.majorOverview || (isEnhancingReport ? '正在生成专业概况...' : '在线模型未返回专业概况。'))
                      : generateMajorOverview(major?.name ?? '', major?.category ?? '', trainingPlans)}
                  </p>
                  <Separator className="bg-slate-800/50" />

                  {/* Core Skills */}
                  <div>
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-500" />
                      核心技能要求
                    </h4>
                    <p className="text-[11px] text-slate-500 mb-2">点击技能项可展开查看能力要求细节</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(major?.keywords ?? ['专业技能', '实践能力', '创新能力']).map((skill, i) => {
                        const skillKey = `${major?.id ?? 'major'}-${i}-${skill}`
                        const isSkillExpanded = expandedSkills[skillKey] === true
                        const skillDetail = shouldUseOnlineContent
                          ? (hybridNarratives.skillDetailsByName[skill] || '正在生成该技能的在线能力要求...')
                          : generateSkillDetail(skill, major?.category ?? '', major?.name ?? '')

                        return (
                          <button
                            key={skillKey}
                            type="button"
                            onClick={() => toggleSkill(skillKey)}
                            className="w-full text-left p-3 rounded-xl bg-slate-800/40 border border-slate-800/50 hover:border-cyan-500/30 transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <ChevronRight className={`w-3.5 h-3.5 text-cyan-500 transition-transform ${isSkillExpanded ? 'rotate-90' : ''}`} />
                              <span className="text-xs text-slate-200 font-medium">{skill}</span>
                            </div>
                            {isSkillExpanded && (
                              <p className="mt-2.5 pl-6 text-[11px] leading-relaxed text-slate-400">{skillDetail}</p>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <Separator className="bg-slate-800/50" />

                  {/* Certifications */}
                  <div>
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      建议考取证书
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(shouldUseOnlineContent
                        ? (hybridNarratives.recommendedCerts.length > 0 ? hybridNarratives.recommendedCerts : ['正在实时生成证书建议...'])
                        : generateCerts(major?.category ?? '')
                      ).map((cert, i) => (
                        <Badge key={i} className="bg-amber-500/8 border-amber-500/15 text-amber-400 text-[10px] px-2.5 py-1 font-normal">
                          <CheckCircle2 className="w-3 h-3 mr-1" />{cert}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-slate-800/50" />

                  {/* Employability Radar (Simulated) */}
                  <div>
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-500" />
                      就业竞争力评估
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: '市场需求', value: 92, color: 'from-cyan-500 to-blue-500' },
                        { label: '薪资水平', value: 78, color: 'from-emerald-500 to-teal-500' },
                        { label: '发展空间', value: 85, color: 'from-purple-500 to-pink-500' },
                        { label: '竞争激烈度', value: 65, color: 'from-amber-500 to-orange-500' },
                      ].map((item, i) => (
                        <div key={i} className="text-center p-3 rounded-xl bg-slate-800/30 border border-slate-800/40">
                          <div className="text-lg font-black font-mono bg-gradient-to-r bg-clip-text text-transparent text-white">
                            {item.value}
                            <span className="text-xs text-slate-600">%</span>
                          </div>
                          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${item.color} rounded-full progress-glow`}
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1.5">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Region Analysis */}
          <TabsContent value="region" className="fade-in">
            <div className="space-y-5">
              {data.regionIds.map(regionId => {
                const regionName = regionId === 'quanguo' ? '全国' : regions.find(r => r.id === regionId)?.name ?? regionId
                const isExpanded = expandedSections[`region-${regionId}`] !== false
                return (
                  <div key={regionId} className="glow-card rounded-2xl overflow-hidden">
                    {/* Region Header */}
                    <button
                      onClick={() => toggleSection(`region-${regionId}`)}
                      className="w-full p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-800/20 transition"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-base font-bold text-white">{regionName} — 地域分析</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-4">
                        {/* Strategic Positioning */}
                        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-emerald-500/10">
                          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                            <Compass className="w-4 h-4 text-emerald-400" />
                            战略定位
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {shouldUseOnlineContent
                              ? (hybridNarratives.regionPolicyById[regionId] || (isEnhancingReport ? '正在实时生成该地域的战略定位...' : '在线模型未返回该地域战略定位。'))
                              : generateRegionPolicy(regionId, major?.name ?? '')}
                          </p>
                        </div>

                        <Separator className="bg-slate-800/50" />

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {(shouldUseOnlineContent
                            ? (hybridNarratives.regionStatsById[regionId] ?? [])
                            : generateRegionStats(regionId)
                          ).map((stat, i) => (
                            <div key={i} className="text-center p-3 rounded-xl bg-slate-800/30 border border-slate-800/40">
                              <div className="text-xl font-black text-cyan-400 font-mono">{stat.value}</div>
                              <div className="text-[10px] text-slate-500 mt-1">{stat.label}</div>
                            </div>
                          ))}
                          {shouldUseOnlineContent && (hybridNarratives.regionStatsById[regionId]?.length ?? 0) === 0 && (
                            <div className="col-span-2 sm:col-span-4 text-center text-[10px] text-slate-600 py-2">
                              {isEnhancingReport ? '正在实时生成地域指标...' : '在线模型未返回该地域指标'}
                            </div>
                          )}
                        </div>

                        <Separator className="bg-slate-800/50" />

                        {/* Talent Policy */}
                        <div>
                          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-400" />
                            人才引进政策
                          </h4>
                          <ul className="space-y-2">
                            {(shouldUseOnlineContent
                              ? (hybridNarratives.regionTalentPoliciesById[regionId] ?? [])
                              : generateTalentPolicy(regionId)
                            ).map((policy, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-400">
                                <ChevronRight className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                <span className="leading-relaxed">{policy}</span>
                              </li>
                            ))}
                            {shouldUseOnlineContent && (hybridNarratives.regionTalentPoliciesById[regionId]?.length ?? 0) === 0 && (
                              <li className="text-[10px] text-slate-600">{isEnhancingReport ? '正在实时生成人才政策...' : '在线模型未返回该地域人才政策。'}</li>
                            )}
                          </ul>
                        </div>

                        {/* Regional Development Score */}
                        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800/40">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                              区域产业发展指数
                            </span>
                            <span className="text-xs font-mono text-cyan-400">82/100</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full progress-glow" style={{ width: '82%' }} />
                          </div>
                          <div className="flex justify-between mt-2 text-[10px] text-slate-600">
                            <span>产业基础</span>
                            <span>人才供给</span>
                            <span>政策支持</span>
                            <span>发展前景</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </TabsContent>

          {/* Tab 3: Industry Info */}
          <TabsContent value="industry" className="fade-in">
            <div className="space-y-5">
              {data.industryIds.map(indId => {
                const opt = industryOptions.find(o => o.id === indId)
                if (!opt) return null
                const isExpanded = expandedSections[`ind-${indId}`] !== false
                return (
                  <div key={indId} className="glow-card rounded-2xl overflow-hidden">
                    <button
                      onClick={() => toggleSection(`ind-${indId}`)}
                      className="w-full p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-800/20 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{opt.icon}</span>
                        <span className="text-base font-bold text-white">{opt.name}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                        {renderIndustryContent(
                          indId,
                          data,
                          major?.name ?? '',
                          relatedPolicies,
                          policyHighlights,
                          policyTrends,
                          mapping,
                          marketInsight,
                          {
                            shouldUseOnlineContent,
                            isEnhancingReport,
                            summary: hybridNarratives.industryById[indId],
                            highlights: hybridNarratives.industryHighlightsById[indId],
                            metrics: hybridNarratives.industryMetricsById[indId],
                            timeline: hybridNarratives.industryTimelineById[indId],
                          }
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </TabsContent>

          {/* Tab 4: Career Advice */}
          <TabsContent value="career" className="fade-in">
            <div className="space-y-5">
              {/* Employment Preparation */}
              <div className="glow-card rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                  </div>
                  <CardTitle className="text-base font-bold text-white">就业准备建议</CardTitle>
                </div>
                <CardContent className="p-0 space-y-5">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-500" />
                      学习规划
                    </h4>
                    <div className="space-y-2.5">
                      {(shouldUseOnlineContent ? hybridNarratives.studyPlan : generateStudyPlan(major?.name ?? '', major?.category ?? '')).map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800/40">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-cyan-400 shrink-0 mt-0.5 font-mono">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{item.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                      {shouldUseOnlineContent && hybridNarratives.studyPlan.length === 0 && (
                        <p className="text-[10px] text-slate-600">{isEnhancingReport ? '正在实时生成学习规划...' : '在线模型未返回学习规划。'}</p>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-slate-800/50" />

                  <div>
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      推荐竞赛与证书
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {shouldUseOnlineContent
                        ? hybridNarratives.competitions.map((comp, i) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/40 group hover:border-amber-500/20 transition">
                            <div className="flex items-center gap-2 mb-1">
                              <Award className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-bold text-white">{comp.name}</span>
                            </div>
                            <p className="text-[10px] text-slate-500">{comp.desc}</p>
                          </div>
                        ))
                        : generateCompetitions(major?.category ?? '').map((comp, i) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/40 group hover:border-amber-500/20 transition">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-base">{comp.icon}</span>
                              <span className="text-xs font-bold text-white">{comp.name}</span>
                              <ArrowUpRight className="w-3 h-3 text-slate-600 ml-auto opacity-0 group-hover:opacity-100 transition" />
                            </div>
                            <p className="text-[10px] text-slate-500">{comp.desc}</p>
                          </div>
                        ))}
                      {shouldUseOnlineContent && hybridNarratives.competitions.length === 0 && (
                        <p className="text-[10px] text-slate-600 sm:col-span-2">{isEnhancingReport ? '正在实时生成推荐竞赛与证书...' : '在线模型未返回推荐竞赛与证书。'}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Practice Advice */}
              <div className="glow-card rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/15 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-teal-400" />
                  </div>
                  <CardTitle className="text-base font-bold text-white">专业实践建议</CardTitle>
                </div>
                <CardContent className="p-0 space-y-3">
                  {shouldUseOnlineContent
                    ? hybridNarratives.practiceAdvice.map((advice, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-slate-800/40 to-transparent border border-slate-800/40 group hover:border-teal-500/15 transition">
                        <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/15 flex items-center justify-center shrink-0">
                          <Lightbulb className="w-4 h-4 text-teal-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{advice.title}</p>
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{advice.desc}</p>
                        </div>
                      </div>
                    ))
                    : generatePracticeAdvice(major?.name ?? '', regionNames).map((advice, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-slate-800/40 to-transparent border border-slate-800/40 group hover:border-teal-500/15 transition">
                        <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/15 flex items-center justify-center shrink-0">
                          <advice.icon className="w-4 h-4 text-teal-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{advice.title}</p>
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{advice.desc}</p>
                        </div>
                      </div>
                    ))}
                  {shouldUseOnlineContent && hybridNarratives.practiceAdvice.length === 0 && (
                    <p className="text-[10px] text-slate-600">{isEnhancingReport ? '正在实时生成专业实践建议...' : '在线模型未返回专业实践建议。'}</p>
                  )}
                </CardContent>
              </div>

              {/* Policy Connection */}
              <div className="rounded-2xl p-5 sm:p-6 relative overflow-hidden glow-card border-0">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-blue-500/5" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                <div className="relative">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/15 to-purple-500/15 border border-cyan-500/15 flex items-center justify-center shrink-0">
                      <Lightbulb className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-2">政策与你的未来息息相关</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        党和国家的路线方针政策是行业发展的"指挥棒"，对行业、所学专业的未来发展具有重要的指引作用。
                        学懂弄通相关政策方针，对于今后的就业意义重大，将为你的未来发展提供理论和实践上的指导。
                        希望通过这份报告，你能深刻感受到国家政策与个人发展的紧密联系。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-800/40">
                <Zap className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-slate-500 flex-1">想要更详细的个性化指导？可以重新调整参数或咨询专业老师。</p>
                <div className="flex items-center gap-1.5">
                  <Button onClick={onHome} variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white cursor-pointer">
                    返回首页
                  </Button>
                  <Button onClick={onRetake} variant="ghost" size="sm" className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer">
                    重新测评 <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// ============================================================
// Data Generation Functions (Demo/Simulation)
// ============================================================

function generateMajorOverview(name: string, category: string, plans: TrainingPlan[]): string {
  // 从培养方案中提取简介
  let planSummary = ''
  if (plans.length > 0) {
    const content = plans[0].content.replace(/\s+/g, ' ')
    // 尝试提取专业培养目标的段落
    const goalMatch = content.match(/(?:培养目标|本专业培养|专业培养)[^\n]{20,200}/)
    if (goalMatch) {
      planSummary = goalMatch[0].substring(0, 150).replace(/[。，,]$/, '') + '。'
    }
  }

  const overviews: Record<string, string> = {
    '机械制造类': planSummary
      ? `${name}：${planSummary}当前我国汽车产业加速向智能化、电动化转型，据《汽车行业稳增长工作方案》，2025年力争实现汽车销量3230万辆左右，其中新能源汽车约1550万辆。《汽车行业数字化转型实施方案》提出到2027年研发设计工具普及率超95%，关键工序数控化率超70%。`
      : `${name}专业是现代制造业的核心支撑。据《汽车行业稳增长工作方案》，2025年力争实现汽车销量3230万辆左右，新能源汽车约1550万辆。《汽车行业数字化转型实施方案》提出到2027年关键工序数控化率超70%，行业对复合型技能人才需求持续旺盛。`,
    '交通类': planSummary
      ? `${name}：${planSummary}据《智能网联汽车准入和路上通行试点实施指南》及《汽车行业稳增长工作方案》，新能源汽车及智能网联汽车正处于快速发展期，2025年新能源汽车销量目标约1550万辆，行业对新能源及智能网联方向人才需求巨大。`
      : `${name}专业紧贴新能源汽车产业发展趋势。据《汽车行业稳增长工作方案》，2025年新能源汽车销量目标约1550万辆，同比增长约20%。《智能网联汽车准入和路上通行试点实施指南》的发布为行业人才提供了更广阔的发展空间。`,
    '信息技术类': planSummary
      ? `${name}：${planSummary}据《国务院关于深入实施"人工智能+"行动的意见》及《国家人工智能产业综合标准化体系建设指南》，人工智能产业正处于快速发展期。数字中国建设整体布局持续推进，为该专业毕业生提供广阔的就业空间。`
      : `${name}专业紧贴数字经济时代需求。据《国务院关于深入实施"人工智能+"行动的意见》，国家大力推进人工智能与各行业深度融合。《数字中国建设整体布局规划》明确提出数字中国建设的整体框架，IT人才需求持续增长。`,
    '经济管理类': planSummary
      ? `${name}：${planSummary}据《加快数智供应链发展专项行动计划》及《有效降低全社会物流成本行动方案》，供应链数字化、智能化改造正在深入推进，计划到2030年培育100家左右全国数智供应链领军企业。`
      : `${name}专业培养具备现代经济管理能力的高素质人才。据《加快数智供应链发展专项行动计划》，到2030年将培育100家左右全国数智供应链领军企业。《有效降低全社会物流成本行动方案》提出深化供应链创新与应用，为经济管理类人才创造大量新岗位。`,
    '医药卫生类': planSummary
      ? `${name}：${planSummary}据《医药工业数智化转型实施方案（2025—2030年）》《关于促进和规范"人工智能+医疗卫生"应用发展的实施意见》及《医养结合示范项目工作方案》，医疗健康产业正在加速数智化转型。`
      : `${name}专业是医疗卫生服务体系的重要支撑。据《医药工业数智化转型实施方案（2025—2030年）》，医药工业将全面迈向数智化；《关于促进和规范"人工智能+医疗卫生"应用发展的实施意见》推动AI赋能医疗；《医养结合示范项目工作方案》加速医养融合，行业人才需求持续增长。`,
    '旅游服务类': planSummary
      ? `${name}：${planSummary}据《关于进一步培育新增长点繁荣文化和旅游消费的若干措施》及《智慧旅游创新发展行动计划》，着力把文化旅游业培育成为支柱产业，深化"文旅+百业"融合。`
      : `${name}专业紧贴文旅产业发展需求。据《关于进一步培育新增长点繁荣文化和旅游消费的若干措施》，国家着力把文化旅游业培育成为支柱产业。《智慧旅游创新发展行动计划》推动文旅数字化升级，《中华人民共和国旅游法》为行业发展提供法律保障。`,
    '艺术设计类': planSummary
      ? `${name}：${planSummary}据《数字中国建设整体布局规划》《"十五五"中国报业媒体融合技术发展规划》及《北京市促进"人工智能+视听"产业高质量发展行动方案（2025-2029年）》，数字内容产业迎来快速发展期。`
      : `${name}专业紧贴数字内容产业发展趋势。据《"十五五"中国报业媒体融合技术发展规划》，媒体融合正在向纵深推进；《数字中国建设整体布局规划》加速数字内容创新；《北京市促进"人工智能+视听"产业高质量发展行动方案（2025-2029年）》为数字创意产业注入新动能。`,
    '建筑工程类': `${name}专业是城乡建设的重要支撑。2025年政府工作报告强调推动高质量发展，新型城镇化和城市更新需求旺盛。绿色建筑、智能建造、BIM技术等新兴领域人才需求增长明显，行业正经历向数字化建造的转型。`,
  }
  return overviews[category] ?? (planSummary
    ? `${name}：${planSummary}相关行业持续发展和技术进步，该专业毕业生在就业市场中具有较强竞争力。建议在校期间注重理论与实践结合，提升专业技能和数字化素养。`
    : `${name}专业培养适应经济社会发展需要的高素质技术技能人才。相关行业持续发展和技术进步，对复合型、创新型技术人才的需求日益增长。建议在校期间注重理论与实践结合，不断提升专业技能和数字化素养。`
  )
}

function generateSkillDetail(skill: string, category: string, majorName: string): string {
  const normalizedSkill = skill.replace(/\s+/g, '')

  const detailedTemplates: { keywords: string[]; detail: string }[] = [
    {
      keywords: ['汽车'],
      detail: '需要系统掌握整车构造与关键总成（底盘、车身、电气）工作原理，能够阅读维修手册和技术公告，完成车型识别、系统分解与标准化作业流程执行。',
    },
    {
      keywords: ['维修'],
      detail: '需要具备“故障现象确认—原因分析—维修实施—复检交付”的完整能力，熟悉工单规范、维修质量控制与安全操作要求，能够独立处理常见故障。',
    },
    {
      keywords: ['检测', '诊断'],
      detail: '需要掌握常用检测设备与诊断软件的使用方法，能基于数据流、故障码和实测参数进行判定，形成可追溯的检测结论与整改建议。',
    },
    {
      keywords: ['发动机', '动力总成'],
      detail: '需要理解发动机机械结构、燃油系统、点火/喷射控制和排放后处理逻辑，能完成性能检测、常见故障定位及关键部件维护保养。',
    },
    {
      keywords: ['新能源', '电池', '电驱'],
      detail: '需要掌握动力电池、电机电控和高压安全规范，能够进行绝缘检测、热管理排查和基础BMS数据分析，满足新能源岗位上岗要求。',
    },
    {
      keywords: ['数据', '分析'],
      detail: '需要具备数据采集、清洗、可视化和结论表达能力，能够将业务问题转化为分析指标，形成支持决策的分析报告。',
    },
    {
      keywords: ['沟通', '协作', '团队'],
      detail: '需要在跨岗位协作中准确表达技术问题，能进行进度同步、风险沟通与客户说明，确保任务在时间、质量和成本之间达到平衡。',
    },
    {
      keywords: ['创新', '项目'],
      detail: '需要具备从问题定义、方案设计到验证迭代的完整项目实践能力，能够使用行业工具完成小型课题或实训项目并沉淀成果。',
    },
  ]

  const matched = detailedTemplates.find(item => item.keywords.some(k => normalizedSkill.includes(k)))
  if (matched) return matched.detail

  const categoryFallback: Record<string, string> = {
    '机械制造类': `建议围绕“机械基础 + 工艺实践 + 设备维护”提升${skill}能力，重点训练识图、工艺执行和现场问题处理能力。`,
    '交通类': `建议围绕“车辆系统认知 + 故障诊断 + 安全规范”提升${skill}能力，强化整车检测和标准化维修流程。`,
    '信息技术类': `建议围绕“编程基础 + 工程实践 + 数据思维”提升${skill}能力，形成可交付的项目作品与代码质量意识。`,
    '经济管理类': `建议围绕“业务理解 + 数据分析 + 经营协同”提升${skill}能力，强化业务决策支持与执行闭环。`,
    '医药卫生类': `建议围绕“专业规范 + 临床/实训技能 + 服务沟通”提升${skill}能力，确保流程合规与服务质量。`,
    '旅游服务类': `建议围绕“服务流程 + 运营组织 + 应急处理”提升${skill}能力，强化现场执行与客户体验管理。`,
    '艺术设计类': `建议围绕“设计表达 + 工具实现 + 项目复盘”提升${skill}能力，形成作品集与商业落地能力。`,
  }

  return categoryFallback[category]
    ?? `在${majorName || '该专业'}学习中，建议按“知识理解—工具应用—项目实战”三步持续提升${skill}能力，并通过实习或项目验证学习成果。`
}

function generateCerts(category: string): string[] {
  const map: Record<string, string[]> = {
    '机械制造类': ['AutoCAD认证工程师', '数控车工（高级）', '电工上岗证', '汽车维修技师', '工业机器人操作员'],
    '信息技术类': ['软件设计师（中级）', '华为HCIA/HCIP认证', '阿里云/腾讯云认证', 'Python/C++等级证书', 'Web前端开发工程师'],
    '经济管理类': ['初级会计师', '银行从业资格', '证券从业资格', '人力资源管理师', '市场营销师'],
    '建筑工程类': ['二级建造师', 'BIM建模师', '造价员', '安全员C证', '测量员'],
    '教育服务类': ['教师资格证', '普通话等级证书', '心理咨询师', '保育员证书', '计算机二级'],
    '医药卫生类': ['护士执业资格证', '执业药师', '药品检验员', '健康管理师', '营养师'],
    '旅游服务类': ['导游资格证', '酒店管理师', '会展策划师', '茶艺师', '调酒师'],
    '艺术设计类': ['平面设计师', 'Adobe认证', '室内设计师', '数字媒体设计师', 'UI/UX设计师'],
    '电子电气类': ['电工进网作业许可证', '电子设计工程师', 'PLC编程认证', '嵌入式系统工程师', '弱电工程师'],
    '交通类': ['新能源汽车维修师', '二手车评估师', '汽车检测维修技师', '机动车驾驶证', '道路运输从业资格证'],
  }
  return map[category] ?? ['相关职业资格证书', '计算机等级证书', '英语等级证书', '专业技师等级证']
}

function generateRegionPolicy(regionId: string, majorName: string): string {
  const nationalText = `从国家层面来看，党的二十大报告明确指出要"实施就业优先战略"，将就业置于宏观政策层面的突出位置。当前，国家正大力推进新型工业化、数字经济、绿色低碳等战略方向。2025年政府工作报告强调"推动高质量发展"，出台了一系列促进就业的政策措施。《"十四五"就业促进规划》明确要完善高校毕业生等重点群体就业支持体系，推动产教融合、校企合作。在${majorName}领域，国家通过"职业教育提质培优行动计划"等举措，持续加大对技术技能人才培养的支持力度。`

  const regionTexts: Record<string, string> = {
    'chengdu': '成都是成渝地区双城经济圈的核心城市，正加快建设全国重要先进制造业基地和西部科技创新中心。2024年成都GDP突破2.2万亿元，汽车产业产值超2000亿元。成都高度重视人才引进，出台了"蓉漂计划""成都人才新政"等系列政策，为高校毕业生提供购房补贴、落户便利、创业扶持等优惠。',
    'beijing': '北京作为首都，正在建设国际科技创新中心，2024年GDP超4.4万亿元。北京出台了多项人才引进政策，包括工作居住证制度、积分落户等。在科技研发、高端制造、人工智能等领域，北京汇聚了大量龙头企业和科研机构。',
    'shanghai': '上海正加快建设"五个中心"，深入推进长三角一体化发展，2024年GDP超4.7万亿元。上海推出"海聚英才"等人才计划，在先进制造、人工智能、生物医药等领域具有突出的产业优势和就业吸引力。',
    'shenzhen': '深圳作为中国特色社会主义先行示范区，是创新创业高地，2024年GDP超3.4万亿元。深圳出台"鹏城优才"等人才政策，提供丰厚的住房补贴和创业支持，在电子信息、新能源汽车、人工智能等领域拥有华为、比亚迪、腾讯等世界级企业。',
  }

  if (regionId === 'quanguo') return nationalText
  return regionTexts[regionId] ?? `${regionPolicyMap[regionId] ?? '该地区'}积极贯彻落实国家就业优先战略，出台了系列促进高校毕业生就业的政策措施，包括人才引进、住房保障、创业扶持等方面，为${majorName}等相关专业毕业生提供了良好的就业环境和发展机遇。`
}

function generateRegionStats(regionId: string): { value: string; label: string }[] {
  const stats: Record<string, { value: string; label: string }[]> = {
    'quanguo': [
      { value: '1158万', label: '2024高校毕业生' },
      { value: '78.3%', label: '整体就业率' },
      { value: '6427元', label: '平均起薪/月' },
      { value: '+12.6%', label: '人才需求增速' },
    ],
    'chengdu': [
      { value: '52.6万', label: '2024高校毕业生' },
      { value: '82.1%', label: '本地就业率' },
      { value: '5800元', label: '平均起薪/月' },
      { value: '+18.3%', label: '人才需求增速' },
    ],
  }
  return stats[regionId] ?? [
    { value: '30万+', label: '年度毕业生' },
    { value: '80%+', label: '就业率' },
    { value: '5500元', label: '平均起薪/月' },
    { value: '+15%', label: '人才需求增速' },
  ]
}

function generateTalentPolicy(regionId: string): string[] {
  const policies: Record<string, string[]> = {
    'quanguo': [
      '高校毕业生到基层就业享受学费补偿和国家助学贷款代偿政策',
      '自主创业可申请最高20万元创业担保贷款',
      '参加职业技能培训可按规定享受职业培训补贴',
      '灵活就业高校毕业生可享受社保补贴',
      '实施"百万就业见习岗位募集计划"提供见习机会',
    ],
    'chengdu': [
      '本科学历以上可直接落户成都，享受"先落户后就业"政策',
      '来蓉求职应届毕业生可申请免费青年人才驿站住宿（最长15天）',
      '符合条件的本科及以上学历毕业生可申请人才安居补贴',
      '在成都企业就业的技术技能人才可申请技能提升补贴',
      '鼓励高校毕业生到基层单位就业，享受专项扶持政策',
    ],
  }
  return policies[regionId] ?? [
    '实施人才引进计划，为高校毕业生提供落户便利',
    '提供住房保障和购房补贴等人才安居政策',
    '设立创业扶持基金，支持高校毕业生创新创业',
    '搭建校企合作平台，促进毕业生与企业精准对接',
    '开展职业技能提升行动，提高毕业生就业竞争力',
  ]
}

function generateStudyPlan(majorName: string, _category: string): { title: string; desc: string }[] {
  return [
    { title: '夯实专业基础', desc: `系统学习${majorName}核心课程，注重理论与实践结合。建议制定每日学习计划，利用课余时间深入钻研专业知识，建立完整的知识体系。` },
    { title: '培养核心技能', desc: '根据行业需求，重点掌握1-2项核心专业技能。建议通过在线课程、实训项目等方式提升实操能力，关注行业最新技术动态和工具。' },
    { title: '拓展综合素质', desc: '培养沟通能力、团队协作能力和问题解决能力。积极参加社团活动、社会实践活动，全面提升综合素养和职场适应能力。' },
    { title: '明确职业方向', desc: '通过行业调研、企业参观、校友交流等方式了解就业方向，在大二前明确职业目标，并有针对性地进行能力储备和证书考取。' },
  ]
}

function generateCompetitions(category: string): { icon: string; name: string; desc: string }[] {
  const map: Record<string, { icon: string; name: string; desc: string }[]> = {
    '机械制造类': [
      { icon: '🏆', name: '全国职业院校技能大赛', desc: '机械相关赛项，含金量高，企业高度认可' },
      { icon: '🔧', name: '全国大学生机械创新设计大赛', desc: '锻炼创新设计能力，展示技术实力' },
      { icon: '🤖', name: '中国机器人技能大赛', desc: '面向智能制造领域的重要赛事' },
      { icon: '📋', name: '"挑战杯"大学生课外学术科技作品竞赛', desc: '综合类科技竞赛，含金量极高' },
    ],
    '信息技术类': [
      { icon: '💻', name: '全国职业院校技能大赛', desc: '软件/网络/大数据等相关赛项' },
      { icon: '🤖', name: '全国大学生数学建模竞赛', desc: '锻炼逻辑思维和算法能力' },
      { icon: '📱', name: '"互联网+"大学生创新创业大赛', desc: '培养创新意识，连接创业资源' },
      { icon: '🏆', name: '蓝桥杯全国软件和信息技术专业人才大赛', desc: 'IT领域专业赛事，企业认可度高' },
    ],
  }
  return map[category] ?? [
    { icon: '🏆', name: '全国职业院校技能大赛', desc: '各专业均设有相关赛项，含金量高' },
    { icon: '📋', name: '"挑战杯"大学生课外学术科技作品竞赛', desc: '综合类科技竞赛' },
    { icon: '💡', name: '"互联网+"大学生创新创业大赛', desc: '培养创新创业能力' },
    { icon: '📝', name: '全国大学生创新创业训练计划', desc: '国家级创新创业项目' },
  ]
}

function generatePracticeAdvice(majorName: string, regionNames: string[]): { icon: typeof Lightbulb; title: string; desc: string }[] {
  const regionStr = regionNames.join('、')
  return [
    {
      icon: Calendar,
      title: '寒暑假社会实践',
      desc: `充分利用寒暑假时间，到${regionStr}等地的相关企业进行参观学习和短期实践。建议提前联系目标企业人力资源部门，争取获得实践机会。重点关注行业龙头企业和快速成长的创新型企业。`,
    },
    {
      icon: Briefcase,
      title: '专业实习规划',
      desc: `建议在大二下学期开始着手寻找实习机会。优先选择${regionStr}地区与${majorName}对口的企业进行实习，实习时长建议不少于3个月。通过实习深入了解行业运作模式和岗位要求。`,
    },
    {
      icon: Building2,
      title: '就业单位选择',
      desc: `建议从企业规模、发展前景、薪资福利、个人成长空间等多维度综合考量。优先关注行业龙头企业及具有发展潜力的中小企业。${regionStr}地区的产业集群效应明显，建议充分利用地域优势。`,
    },
    {
      icon: Lightbulb,
      title: '建立职业网络',
      desc: `积极参加行业展会、技术论坛和校友活动，建立职业人脉网络。关注目标企业招聘信息，提前做好简历和面试准备。建议在实习期间就与用人单位建立良好关系，为未来就业打下基础。`,
    },
  ]
}

function formatCurrency(value: number): string {
  return Math.round(value).toLocaleString('zh-CN')
}

async function requestModelReply(params: {
  apiUrl: string
  apiKey?: string
  model: string
  question: string
  history: ChatMessage[]
  contextPrompt: string
}): Promise<string> {
  const { apiUrl, apiKey, model, question, history, contextPrompt } = params

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: contextPrompt },
        ...history.map(item => ({ role: item.role, content: item.content })),
        { role: 'user', content: question },
      ],
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errText.slice(0, 180)}`)
  }

  const payload: unknown = await response.json()
  const answer = extractModelAnswer(payload)
  if (!answer) {
    throw new Error('接口返回成功，但未解析到回答内容')
  }

  return answer
}

function extractModelAnswer(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const root = payload as Record<string, unknown>

  const choices = root.choices
  if (Array.isArray(choices) && choices.length > 0) {
    const first = choices[0] as Record<string, unknown>
    const message = first?.message
    if (message && typeof message === 'object') {
      const content = (message as Record<string, unknown>).content
      if (typeof content === 'string' && content.trim()) return content.trim()
    }
  }

  const text = root.output_text
  if (typeof text === 'string' && text.trim()) return text.trim()

  const output = root.output
  if (typeof output === 'string' && output.trim()) return output.trim()
  if (output && typeof output === 'object') {
    const outputText = (output as Record<string, unknown>).text
    if (typeof outputText === 'string' && outputText.trim()) return outputText.trim()
  }

  const data = root.data
  if (data && typeof data === 'object') {
    const answer = (data as Record<string, unknown>).answer
    if (typeof answer === 'string' && answer.trim()) return answer.trim()
  }

  return null
}

function parseHybridNarratives(raw: string): HybridNarratives | null {
  const jsonStr = extractFirstJsonObject(raw)
  if (!jsonStr) return null

  try {
    const parsed = JSON.parse(jsonStr) as Partial<HybridNarratives>
    return {
      aiSummary: typeof parsed.aiSummary === 'string' ? parsed.aiSummary : undefined,
      majorOverview: typeof parsed.majorOverview === 'string' ? parsed.majorOverview : undefined,
      regionPolicyById: isRecordOfString(parsed.regionPolicyById) ? parsed.regionPolicyById : {},
      industryById: isRecordOfString(parsed.industryById) ? parsed.industryById : {},
    }
  } catch {
    return null
  }
}

function extractFirstJsonObject(text: string): string | null {
  const trimmed = text.trim()
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed

  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  return candidate.slice(start, end + 1)
}

function isRecordOfString(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.values(value).every(v => typeof v === 'string')
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function parseStringArrayRecord(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const record: Record<string, string[]> = {}
  for (const [key, rawItems] of Object.entries(value)) {
    record[key] = parseStringArray(rawItems)
  }
  return record
}

function parseNarrativeStatArray(value: unknown): NarrativeStat[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
    .map(item => ({
      label: typeof item.label === 'string' ? item.label : '',
      value: typeof item.value === 'string' ? item.value : '',
    }))
    .filter(item => item.label.length > 0 && item.value.length > 0)
}

function parseNarrativeStatRecord(value: unknown): Record<string, NarrativeStat[]> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const record: Record<string, NarrativeStat[]> = {}
  for (const [key, rawItems] of Object.entries(value)) {
    record[key] = parseNarrativeStatArray(rawItems)
  }
  return record
}

function parseTimelineArray(value: unknown): TimelineItem[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
    .map(item => ({
      year: typeof item.year === 'string' ? item.year : '',
      desc: typeof item.desc === 'string' ? item.desc : '',
    }))
    .filter(item => item.year.length > 0 && item.desc.length > 0)
}

function parseTimelineRecord(value: unknown): Record<string, TimelineItem[]> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const record: Record<string, TimelineItem[]> = {}
  for (const [key, rawItems] of Object.entries(value)) {
    record[key] = parseTimelineArray(rawItems)
  }
  return record
}

function parseStudyPlanArray(value: unknown): StudyPlanItem[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
    .map(item => ({
      title: typeof item.title === 'string' ? item.title : '',
      desc: typeof item.desc === 'string' ? item.desc : '',
    }))
    .filter(item => item.title.length > 0 && item.desc.length > 0)
}

function parseCompetitionArray(value: unknown): CompetitionItem[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
    .map(item => ({
      name: typeof item.name === 'string' ? item.name : '',
      desc: typeof item.desc === 'string' ? item.desc : '',
    }))
    .filter(item => item.name.length > 0 && item.desc.length > 0)
}

function parsePracticeArray(value: unknown): PracticeItem[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
    .map(item => ({
      title: typeof item.title === 'string' ? item.title : '',
      desc: typeof item.desc === 'string' ? item.desc : '',
    }))
    .filter(item => item.title.length > 0 && item.desc.length > 0)
}

function generateDigitalHumanReply(
  question: string,
  params: {
    majorName: string
    regionNames: string[]
    marketInsight: MajorMarketInsight
    policyCount: number
    trendKeywords: string[]
    topPolicyTitle?: string
    knowledgeScale: number
  }
): string {
  const q = question.toLowerCase()
  const { majorName, regionNames, marketInsight, policyCount, trendKeywords, topPolicyTitle, knowledgeScale } = params
  const regionText = regionNames.join('、')

  if (['薪资', '工资', '待遇', '月薪', '收入', '年薪'].some(k => q.includes(k))) {
    return `${majorName}在${regionText}的岗位样本显示：平均月薪约${formatCurrency(marketInsight.salary.avgMonthly)}元，常见区间约${formatCurrency(marketInsight.salary.minMonthly)}-${formatCurrency(marketInsight.salary.maxMonthly)}元。按年度折算，建议以${formatCurrency(marketInsight.salary.avgMonthly * 12)}元/年作为求职谈薪参考。`
  }

  if (['企业', '公司', '龙头', '岗位', '招岗', '招聘'].some(k => q.includes(k))) {
    return `目前相关企业约${marketInsight.enterprise.relatedEnterpriseCount.toLocaleString()}家，近期招岗约${marketInsight.enterprise.hiringPositions.toLocaleString()}人。重点可关注${marketInsight.enterprise.topEmployers.slice(0, 3).join('、')}等龙头单位。`
  }

  if (['政策', '趋势', '方向', '前沿'].some(k => q.includes(k))) {
    return `当前已匹配到${policyCount}份政策文件（知识库总量${knowledgeScale}份文档）。趋势关键词集中在${trendKeywords.slice(0, 4).join('、')}，最近重点政策为《${topPolicyTitle ?? '相关产业规划'}》。`
  }

  if (['技能', '学习', '准备', '提升'].some(k => q.includes(k))) {
    return `建议按“基础能力 + 项目实战 + 行业认证”三步走：先夯实${majorName}核心课程，再通过实习/项目提升可交付能力，同时结合岗位方向补齐证书与工具链。你也可以继续问我“先学什么技能最值”。`
  }

  return `我可以从四个角度继续给你建议：1）薪资区间与谈薪参考，2）企业数量与招岗趋势，3）龙头企业与投递优先级，4）技能提升路径。你可以直接输入你最关心的一项。`
}

function renderIndustryContent(
  indId: string,
  data: SurveyFormData,
  majorName: string,
  policies: PolicyDoc[],
  highlights: { title: string; category: string; highlights: string[] }[],
  trends: { date: string; title: string; desc: string; source: string }[],
  mapping: CategoryKnowledgeMapping,
  marketInsight: MajorMarketInsight,
  online?: {
    shouldUseOnlineContent: boolean
    isEnhancingReport: boolean
    summary?: string
    highlights?: string[]
    metrics?: NarrativeStat[]
    timeline?: TimelineItem[]
  }
) {
  const regionNames = data.regionIds.map(id => {
    if (id === 'quanguo') return '全国'
    return regions.find(r => r.id === id)?.name ?? id
  }).join('、')
  const shouldUseOnlineContent = online?.shouldUseOnlineContent === true
  const overviewLine = online?.summary?.trim()
  const onlineHighlights = online?.highlights ?? []
  const onlineMetrics = online?.metrics ?? []
  const onlineTimeline = online?.timeline ?? []

  switch (indId) {
    case 'policy':
      return (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            {shouldUseOnlineContent
              ? (overviewLine || (online?.isEnhancingReport ? '正在实时生成该维度分析...' : '在线模型未返回该维度总结。'))
              : (
                <>
                  基于知识库检索，已为<span className="text-cyan-400 font-medium">{majorName}</span>匹配到
                  <span className="text-amber-400 font-mono">{policies.length}</span>份相关政策文件，涵盖
                  {policies.length > 0
                    ? policies.slice(0, 5).map(p => categoryNames[p.category] ?? p.category).filter((v, i, a) => a.indexOf(v) === i).join('、')
                    : '多个行业领域'
                  }。
                  {data.regionIds.includes('quanguo') ? '' : `在${regionNames}，地方政策与国家战略相衔接，为产业发展提供了有力支撑。`}
                </>
              )}
          </p>
          {/* 政策文件列表 - 仅本地模式显示 */}
          {!shouldUseOnlineContent && policies.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-500" />
                相关政策文件（共{policies.length}份）
              </h4>
              {policies.slice(0, 8).map((doc, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800/40 group hover:border-cyan-500/15 transition">
                  <div className="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold text-[10px] font-mono shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{doc.fileName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-slate-700/50 border-slate-600/50 text-slate-400 text-[8px] px-1.5 py-0">{categoryNames[doc.category] ?? doc.category}</Badge>
                      <span className="text-[9px] text-slate-600">{doc.content.length}字</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 shrink-0 opacity-0 group-hover:opacity-100 transition" />
                </div>
              ))}
            </div>
          )}
          {/* 政策要点摘要 */}
          {((shouldUseOnlineContent && onlineHighlights.length > 0) || (!shouldUseOnlineContent && highlights.length > 0 && highlights[0].highlights.length > 0)) && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border border-cyan-500/10">
              <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                政策要点摘录
              </h4>
              <ul className="space-y-2">
                {(shouldUseOnlineContent
                  ? onlineHighlights
                  : highlights.slice(0, 3).flatMap(h => h.highlights.slice(0, 2))
                ).map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-slate-400 leading-relaxed">
                    <ChevronRight className="w-3 h-3 text-cyan-500 mt-0.5 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )

    case 'enterprise':
      return (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            {shouldUseOnlineContent
              ? (overviewLine || (online?.isEnhancingReport ? '正在实时生成企业维度分析...' : '在线模型未返回企业维度总结。'))
              : `${regionNames}地区与${majorName}相关的产业生态较完善，企业端需求活跃：`}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {(shouldUseOnlineContent
              ? onlineMetrics
              : [
                { label: '相关企业总数', value: `${marketInsight.enterprise.relatedEnterpriseCount.toLocaleString()}家` },
                { label: '近期招岗人数', value: `${marketInsight.enterprise.hiringPositions.toLocaleString()}人` },
                { label: '龙头企业数量', value: `${marketInsight.enterprise.topEmployers.length}家` },
                { label: '政策覆盖文件', value: `${policies.length}份` },
                { label: '重点趋势方向', value: `${mapping.trendKeywords.length}项` },
                { label: '岗位样本规模', value: `${marketInsight.salary.sampleSize.toLocaleString()}条` },
              ]
            ).map((stat, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-slate-800/30 border border-slate-800/40">
                <div className="text-lg font-black text-cyan-400 font-mono">{stat.value}</div>
                <div className="text-[10px] text-slate-500">{stat.label}</div>
              </div>
            ))}
            {shouldUseOnlineContent && onlineMetrics.length === 0 && (
              <div className="col-span-2 sm:col-span-3 text-center text-[10px] text-slate-600 py-2">
                {online?.isEnhancingReport ? '正在实时生成企业指标...' : '在线模型未返回企业指标。'}
              </div>
            )}
          </div>

          {shouldUseOnlineContent ? (
            <div>
              <h4 className="text-xs font-bold text-white mb-2">企业洞察要点</h4>
              <div className="space-y-2">
                {onlineHighlights.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/30 border border-slate-800/40">
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-500 mt-0.5 shrink-0" />
                    <span className="text-[10px] text-slate-300 leading-relaxed">{item}</span>
                  </div>
                ))}
                {onlineHighlights.length === 0 && (
                  <p className="text-[10px] text-slate-600">{online?.isEnhancingReport ? '正在实时生成企业洞察要点...' : '在线模型未返回企业洞察要点。'}</p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div>
                <h4 className="text-xs font-bold text-white mb-2">代表性龙头企业</h4>
                <div className="space-y-2">
                  {marketInsight.enterprise.topEmployers.map((name, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-800/30">
                      <div className="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold text-[10px] font-mono">{i + 1}</div>
                      <span className="text-xs text-slate-300">{name}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-600 ml-auto" />
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-600">数据说明：{marketInsight.sourceNote}</p>
            </>
          )}
        </div>
      )

    case 'employment':
      return (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            {shouldUseOnlineContent
              ? (overviewLine || (online?.isEnhancingReport ? '正在实时生成就业维度分析...' : '在线模型未返回就业维度总结。'))
              : `${regionNames}地区对${majorName}专业人才需求旺盛：`}
          </p>
          <div className="space-y-2.5">
            {shouldUseOnlineContent
              ? onlineHighlights.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800/40">
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-500 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-300 mt-0.5 leading-relaxed">{item}</p>
                  </div>
                </div>
              ))
              : [
                { title: '人才需求状况', value: '年需求量约 8,000 人，同比增长 15.2%', icon: <Users className="w-3.5 h-3.5 text-cyan-500" /> },
                { title: '学历要求', value: '大专 65% / 本科 30% / 硕士及以上 5%', icon: <GraduationCap className="w-3.5 h-3.5 text-purple-500" /> },
                { title: '技能要求', value: '需持有 1-2 项职业资格证书，熟练掌握核心专业技能', icon: <Target className="w-3.5 h-3.5 text-amber-500" /> },
                { title: '在校成绩', value: '专业课平均分 70 分以上，无挂科记录者优先', icon: <Award className="w-3.5 h-3.5 text-emerald-500" /> },
                { title: '经验要求', value: '应届生 40% / 1-3年 35% / 3年以上 25%', icon: <Calendar className="w-3.5 h-3.5 text-blue-500" /> },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800/40">
                  {item.icon}
                  <div>
                    <p className="text-xs font-bold text-white">{item.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{item.value}</p>
                  </div>
                </div>
              ))}
            {shouldUseOnlineContent && onlineHighlights.length === 0 && (
              <p className="text-[10px] text-slate-600">{online?.isEnhancingReport ? '正在实时生成就业要点...' : '在线模型未返回就业要点。'}</p>
            )}
          </div>
        </div>
      )

    case 'salary': {
      const salary = marketInsight.salary
      const yearlyAvg = salary.avgMonthly * 12
      const middleBandStart = Math.round((salary.minMonthly + salary.avgMonthly) / 2 / 100) * 100
      const middleBandEnd = Math.round((salary.avgMonthly + salary.maxMonthly) / 2 / 100) * 100

      return (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            {shouldUseOnlineContent
              ? (overviewLine || (online?.isEnhancingReport ? '正在实时生成薪资维度分析...' : '在线模型未返回薪资维度总结。'))
              : `${regionNames}地区${majorName}专业薪资画像（基于${salary.sampleSize.toLocaleString()}条岗位样本估算）：`}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {(shouldUseOnlineContent
              ? onlineMetrics.slice(0, 3).map((m, i) => ({ label: m.label, value: m.value, unit: '', color: i === 0 ? 'text-slate-400' : i === 1 ? 'text-cyan-400' : 'text-emerald-400' }))
              : [
                { label: '最低薪资', value: formatCurrency(salary.minMonthly), unit: '元/月', color: 'text-slate-400' },
                { label: '平均薪资', value: formatCurrency(salary.avgMonthly), unit: '元/月', color: 'text-cyan-400' },
                { label: '高位薪资', value: formatCurrency(salary.maxMonthly), unit: '元/月', color: 'text-emerald-400' },
              ]
            ).map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-slate-800/30 border border-slate-800/40">
                <div className={`text-2xl font-black font-mono ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] text-slate-500">{stat.unit}</div>
                <div className="text-[10px] text-slate-600 mt-1">{stat.label}</div>
              </div>
            ))}
            {shouldUseOnlineContent && onlineMetrics.length < 3 && (
              <div className="col-span-3 text-center text-[10px] text-slate-600 py-2">
                {online?.isEnhancingReport ? '正在实时生成薪资核心指标...' : '在线模型未返回足够的薪资指标。'}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/40">
              <p className="text-[10px] text-slate-500">建议期望年薪</p>
              <p className="text-sm font-bold text-cyan-400 font-mono">{formatCurrency(yearlyAvg)} 元/年</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/40">
              <p className="text-[10px] text-slate-500">主流薪资区间</p>
              <p className="text-sm font-bold text-purple-400 font-mono">{formatCurrency(middleBandStart)} - {formatCurrency(middleBandEnd)} 元/月</p>
            </div>
          </div>

          {/* Salary Distribution */}
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800/40">
            <h4 className="text-xs font-bold text-white mb-3">薪资分布</h4>
            <div className="space-y-2.5">
              {[
                { range: `${formatCurrency(salary.minMonthly)}-${formatCurrency(middleBandStart)}元`, percent: 34, color: 'from-slate-500 to-slate-400' },
                { range: `${formatCurrency(middleBandStart)}-${formatCurrency(middleBandEnd)}元`, percent: 41, color: 'from-cyan-500 to-blue-500' },
                { range: `${formatCurrency(middleBandEnd)}-${formatCurrency(salary.maxMonthly)}元`, percent: 18, color: 'from-blue-500 to-purple-500' },
                { range: `${formatCurrency(salary.maxMonthly)}元以上`, percent: 7, color: 'from-emerald-500 to-teal-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 w-36 shrink-0 font-mono">{item.range}</span>
                  <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 w-8 text-right font-mono">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    case 'frontier': {
      // 统计各分类政策数量
      const catCountMap = new Map<string, number>()
      policies.forEach(p => {
        catCountMap.set(p.category, (catCountMap.get(p.category) || 0) + 1)
      })
      const catCounts = [...catCountMap.entries()].sort((a, b) => b[1] - a[1])
      const totalChars = policies.reduce((s, p) => s + p.content.length, 0)

      return (
        <div className="space-y-4">
          {/* 数据概览卡片 */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/15 text-center">
              <p className="text-lg font-bold text-cyan-400 font-mono">{policies.length}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">政策文件</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/15 text-center">
              <p className="text-lg font-bold text-purple-400 font-mono">{catCounts.length}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">覆盖领域</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/15 text-center">
              <p className="text-lg font-bold text-blue-400 font-mono">{totalChars > 10000 ? (totalChars / 10000).toFixed(1) + '万' : (totalChars / 1000).toFixed(1) + 'k'}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">文本分析量</p>
            </div>
          </div>

          {/* 分类标签云 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] text-slate-600">涉及领域：</span>
            {catCounts.map(([cat, count]) => (
              <Badge key={cat} className="text-[9px] px-2 py-0.5 font-normal bg-slate-700/40 border-slate-600/30 text-slate-400">
                {categoryNames[cat] ?? cat}
                <span className="ml-1 text-cyan-400 font-mono">{count}</span>
              </Badge>
            ))}
          </div>

          {/* 政策动态时间线 */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-cyan-400" />
                最新政策动态
              </p>
              <span className="text-[8px] text-slate-600">数据来源：政策知识库</span>
            </div>
            {trends.slice(0, 6).map((item, i) => {
              const isNew = i === 0
              return (
                <div
                  key={i}
                  className={`relative flex gap-3 p-3 rounded-xl border transition-all ${
                    isNew
                      ? 'bg-gradient-to-r from-cyan-500/8 to-blue-500/5 border-cyan-500/20'
                      : 'bg-slate-800/30 border-slate-800/40 group hover:border-cyan-500/15 hover:bg-slate-800/50'
                  }`}
                >
                  {/* 时间线圆点 */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold font-mono ${
                      isNew
                        ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30'
                        : 'bg-slate-700/50 text-slate-500'
                    }`}>
                      {isNew ? <Zap className="w-3 h-3" /> : i + 1}
                    </div>
                    {i < Math.min(trends.length, 6) - 1 && (
                      <div className={`w-px flex-1 mt-1 ${isNew ? 'bg-cyan-500/15' : 'bg-slate-700/30'}`} />
                    )}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-white leading-tight">{item.title}</p>
                      {isNew && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono bg-cyan-500/20 text-cyan-400">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] text-slate-600 font-mono">{item.date}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-700/40 text-slate-400">
                        {categoryNames[item.source] ?? item.source}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              )
            })}
            {trends.length === 0 && (
              <div className="text-center py-8">
                <FileSearch className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-600">暂无相关政策动态数据</p>
              </div>
            )}
          </div>

          {/* 趋势关键词 */}
          {mapping.trendKeywords.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-800/40">
              <div className="flex items-center gap-1.5 mb-2.5">
                <TrendingUp className="w-3 h-3 text-purple-400" />
                <p className="text-[10px] text-slate-400 font-bold">行业趋势关键词</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {mapping.trendKeywords.map((kw, i) => (
                  <Badge
                    key={kw}
                    className={`text-[9px] px-2.5 py-0.5 font-normal border ${
                      i < 2
                        ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                        : i < 4
                          ? 'bg-purple-500/8 border-purple-500/15 text-purple-400'
                          : 'bg-slate-700/40 border-slate-600/30 text-slate-500'
                    }`}
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 核心数据指标 */}
          {mapping.keyStats && mapping.keyStats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {mapping.keyStats.map((stat, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-800/30 border border-slate-800/40 text-center">
                  <p className="text-xs font-bold text-cyan-400 font-mono">{stat.value}</p>
                  <p className="text-[9px] text-slate-600 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    case 'future': {
      // 从知识库政策中提取时间线和目标
      const futureItems = policies.slice(0, 5).map(doc => {
        const content = doc.content.replace(/\s+/g, ' ')
        // 提取 "到XXXX年" 的目标
        const goalMatch = content.match(/到(\d{4})年[^\n。]{5,80}(?:。)/)
        if (!goalMatch) return null
        return {
          year: goalMatch[1],
          desc: goalMatch[0].substring(2, 100),
          source: doc.fileName,
        }
      }).filter(Boolean).slice(0, 3) as { year: string; desc: string; source: string }[]

      // 如果没有提取到足够数据，使用默认趋势
      const defaultFutureItems = futureItems.length < 2 ? [
        { year: '2025-2026', desc: '产业结构优化升级，智能化、绿色化转型加速，预计新增就业岗位显著增加。', source: '行业发展趋势' },
        { year: '2026-2028', desc: '产业集群效应进一步凸显，高端技术人才需求快速增长，产业链上下游协同发展。', source: '行业发展趋势' },
        { year: '2028-2030', desc: '基本建成现代化产业体系，行业技术达到国际先进水平，人才结构向高素质、复合型转变。', source: '行业发展趋势' },
      ] : []
      const displayItems = [...futureItems, ...defaultFutureItems].slice(0, 3)
      const borderColors = ['border-cyan-500', 'border-blue-500', 'border-purple-500']

      return (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            {shouldUseOnlineContent
              ? (overviewLine || (online?.isEnhancingReport ? '正在实时生成未来趋势分析...' : '在线模型未返回未来趋势总结。'))
              : `${majorName}行业未来发展趋势（来源：知识库政策文件目标规划）：`}
          </p>
          <div className="space-y-3">
            {displayItems.map((item, i) => (
              <div key={i} className="relative pl-8 pb-4 last:pb-0">
                <div className={`absolute left-0 top-1 w-3 h-3 rounded-full bg-slate-900 border-2 ${borderColors[i] ?? 'border-cyan-500'} shadow-lg`} />
                {i < Math.max(displayItems.length - 1, 0) && <div className={`absolute left-[5px] top-4 w-px h-full ${borderColors[i] ?? 'border-cyan-500'}/30`} />}
                <p className="text-xs font-bold text-white font-mono">{item.year}</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                {item.source && item.source !== '行业发展趋势' && (
                  <p className="text-[8px] text-slate-700 mt-1 font-mono truncate">来源：{item.source}</p>
                )}
              </div>
            ))}
            {shouldUseOnlineContent && displayItems.length === 0 && (
              <p className="text-[10px] text-slate-600">{online?.isEnhancingReport ? '正在实时生成未来趋势时间线...' : '在线模型未返回未来趋势时间线。'}</p>
            )}
          </div>
          {shouldUseOnlineContent ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border border-cyan-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-bold text-white">在线发展建议</span>
              </div>
              <ul className="space-y-2">
                {onlineHighlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-slate-400 leading-relaxed">
                    <ChevronRight className="w-3 h-3 text-cyan-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
                {onlineHighlights.length === 0 && (
                  <li className="text-[10px] text-slate-600">{online?.isEnhancingReport ? '正在实时生成发展建议...' : '在线模型未返回发展建议。'}</li>
                )}
              </ul>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border border-cyan-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-bold text-white">发展建议</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                建议在校期间密切关注{mapping.trendKeywords.slice(0, 3).join('、')}等方向的发展趋势，
                提前布局热门技能方向，适应行业转型升级对复合型人才的需求。
                {regionNames}地区的产业政策为个人发展提供了良好机遇，建议抓住政策红利期。
              </p>
              {mapping.keyStats && mapping.keyStats.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {mapping.keyStats.map((stat, i) => (
                    <span key={i} className="px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[9px] font-mono">
                      {stat.label}: {stat.value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )
    }

    default:
      return <p className="text-xs text-slate-500">暂无数据</p>
  }
}

// ============================================================
// Alumni Community Ticker Data (Demo/Simulation)
// ============================================================

const tickerDataMajorRegion = [
  { major: '计算机应用技术', region: '深圳', count: 1283 },
  { major: '新能源汽车维修', region: '成都', count: 856 },
  { major: '大数据与会计', region: '上海', count: 742 },
  { major: '机电一体化', region: '北京', count: 698 },
  { major: '人工智能技术应用', region: '杭州', count: 654 },
  { major: '电子商务', region: '广州', count: 621 },
  { major: '工业机器人', region: '苏州', count: 587 },
  { major: '建筑工程技术', region: '武汉', count: 543 },
  { major: '护理', region: '重庆', count: 512 },
  { major: '学前教育', region: '成都', count: 498 },
  { major: '数字媒体技术', region: '北京', count: 467 },
  { major: '汽车检测与维修', region: '西安', count: 423 },
]

const tickerDataIndustry = [
  { industry: '人工智能与大数据', tag: 'HOT', count: 2156 },
  { industry: '新能源汽车制造', tag: 'HOT', count: 1893 },
  { industry: '智能制造', tag: 'NEW', count: 1456 },
  { industry: '数字贸易与电商', tag: '', count: 1234 },
  { industry: '集成电路与芯片', tag: 'NEW', count: 1122 },
  { industry: '生物医药', tag: '', count: 987 },
  { industry: '绿色低碳技术', tag: 'NEW', count: 876 },
  { industry: '网络安全', tag: 'HOT', count: 843 },
  { industry: '金融科技', tag: '', count: 765 },
  { industry: '工业互联网', tag: 'NEW', count: 698 },
]

const tickerDataInterest = [
  { text: '"成都的互联网行业薪资真实情况怎样？"', time: '2分钟前' },
  { text: '"新能源汽车维修前景真的好吗？"', time: '5分钟前' },
  { text: '"深圳和杭州哪个更适合IT毕业生？"', time: '8分钟前' },
  { text: '"会计专业还能找到工作吗？"', time: '12分钟前' },
  { text: '"人工智能专业需要考研吗？"', time: '15分钟前' },
  { text: '"机电一体化去哪些企业比较好？"', time: '20分钟前' },
  { text: '"学前教育还有没有出路？"', time: '25分钟前' },
  { text: '"工业机器人操作员考证难不难？"', time: '30分钟前' },
  { text: '"建筑行业未来会被AI取代吗？"', time: '35分钟前' },
  { text: '"护理专业去三甲医院要什么条件？"', time: '38分钟前' },
]
