import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import {
  Search, ChevronDown, MapPin, Building2, GraduationCap,
  Type, MonitorPlay, Sparkles, Check, Cpu, Zap, CheckCircle2, Circle, ArrowLeft
} from 'lucide-react'
import { majors, majorCategories } from '@/data/majors'
import { regions, regionGroups } from '@/data/regions'
import { industryOptions } from '@/data/industries'
import type { SurveyFormData, DisplayMode, AnalysisMode, ModelConfig } from '@/types'

interface SurveyPageProps {
  onSubmit: (data: SurveyFormData, mode: DisplayMode) => void
  onHome: () => void
  analysisMode: AnalysisMode
  modelConfig: ModelConfig
  onAnalysisModeChange: (mode: AnalysisMode) => void
  onModelConfigSave: (config: ModelConfig) => void
}

export function SurveyPage({
  onSubmit,
  onHome,
  analysisMode,
  modelConfig,
  onAnalysisModeChange,
  onModelConfigSave,
}: SurveyPageProps) {
  const [selectedMajor, setSelectedMajor] = useState('')
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [majorSearch, setMajorSearch] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [showRegionSelect, setShowRegionSelect] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showModelConfigDialog, setShowModelConfigDialog] = useState(false)
  const [modelDraft, setModelDraft] = useState<ModelConfig>(modelConfig)
  const [modelFormError, setModelFormError] = useState('')

  const selectedMajorObj = useMemo(
    () => majors.find(m => m.id === selectedMajor),
    [selectedMajor]
  )

  const filteredMajors = useMemo(() => {
    if (!majorSearch) return majors
    const search = majorSearch.toLowerCase()
    return majors.filter(m =>
      m.name.toLowerCase().includes(search) ||
      m.category.toLowerCase().includes(search) ||
      m.keywords.some(k => k.toLowerCase().includes(search))
    )
  }, [majorSearch])

  const groupedMajors = useMemo(() => {
    const groups: Record<string, typeof majors> = {}
    filteredMajors.forEach(m => {
      if (!groups[m.category]) groups[m.category] = []
      groups[m.category].push(m)
    })
    return groups
  }, [filteredMajors])

  useEffect(() => {
    setModelDraft(modelConfig)
  }, [modelConfig.apiUrl, modelConfig.apiKey, modelConfig.model])

  const switchToLocalMode = () => {
    onAnalysisModeChange('local')
  }

  const switchToModelMode = () => {
    setModelFormError('')
    setModelDraft(modelConfig)
    setShowModelConfigDialog(true)
  }

  const saveModelConfig = () => {
    const apiUrl = modelDraft.apiUrl.trim()
    if (!apiUrl) {
      setModelFormError('请输入 API URL')
      return
    }

    onModelConfigSave({
      apiUrl,
      apiKey: modelDraft.apiKey.trim(),
      model: modelDraft.model.trim() || 'deepseek-chat',
    })
    onAnalysisModeChange('model')
    setModelFormError('')
    setShowModelConfigDialog(false)
  }

  const toggleRegion = (id: string) => {
    if (id === 'quanguo') {
      setSelectedRegions(['quanguo'])
      return
    }
    setSelectedRegions(prev => {
      const next = prev.filter(r => r !== 'quanguo')
      if (next.includes(id)) return next.filter(r => r !== id)
      return [...next, id]
    })
  }

  const toggleIndustry = (id: string) => {
    setSelectedIndustries(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const canSubmit = selectedMajor && selectedRegions.length > 0

  const handleSubmitClick = () => {
    if (!canSubmit) return
    setShowSubmitDialog(true)
  }

  const handleConfirmSubmit = (mode: DisplayMode) => {
    setShowSubmitDialog(false)
    onSubmit(
      {
        majorId: selectedMajor,
        regionIds: selectedRegions,
        industryIds: selectedIndustries.length > 0 ? selectedIndustries : ['policy', 'enterprise', 'employment', 'salary', 'frontier', 'future'],
      },
      mode
    )
  }

  const selectedRegionNames = selectedRegions.map(id => {
    if (id === 'quanguo') return '全国'
    return regions.find(r => r.id === id)?.name ?? id
  })

  const completedSteps = [
    !!selectedMajor,
    selectedRegions.length > 0,
    selectedIndustries.length > 0 || true,
  ]

  return (
    <div className="min-h-[calc(100vh-52px)] tech-grid-bg">
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <div className="mb-4 fade-in-up space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={onHome}
              className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />返回首页
            </Button>

            <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={switchToLocalMode}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${analysisMode === 'local' ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <span className="inline-flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" />本地模式</span>
              </button>
              <button
                type="button"
                onClick={switchToModelMode}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${analysisMode === 'model' ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <span className="inline-flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" />大模型模式</span>
              </button>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-black text-white mb-2">智能测评问卷</h1>
            <p className="text-sm text-slate-500">选择你的专业、目标地域和行业维度，AI 将为你生成专属就业指导报告</p>
            <p className="text-xs mt-2 text-slate-500">
              当前数据模式：
              <span className={`ml-1 font-medium ${analysisMode === 'local' ? 'text-cyan-300' : 'text-purple-300'}`}>
                {analysisMode === 'local' ? '本地知识库' : '知识库 + 大模型'}
              </span>
            </p>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center gap-2 fade-in-up" style={{ animationDelay: '0.05s' }}>
          {['专业选择', '地域选择', '行业维度'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                completedSteps[i]
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : i === completedSteps.findIndex(x => !x)
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                    : 'bg-slate-800/50 text-slate-600 border border-slate-700/50'
              }`}>
                {completedSteps[i] ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{step}</span>
              </div>
              {i < 2 && <div className={`w-6 h-px ${completedSteps[i] ? 'bg-cyan-500/30' : 'bg-slate-700'}`} />}
            </div>
          ))}
        </div>

        {/* Major Selection */}
        <div className="glow-card rounded-2xl p-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">选择你的专业</h2>
              <p className="text-xs text-slate-500">必选项 · 涵盖全校所有专业</p>
            </div>
            <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/20">
              REQUIRED
            </span>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜索专业名称或类别..."
              value={majorSearch}
              onChange={e => setMajorSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl input-dark text-sm"
            />
            {majorSearch && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cyan-400 font-mono">
                {filteredMajors.length} 结果
              </span>
            )}
          </div>

          {/* Major Preview */}
          {selectedMajorObj && (
            <div className="relative rounded-xl overflow-hidden h-44 mb-4 bg-gradient-to-br from-cyan-900/40 via-slate-900/80 to-purple-900/30 flex items-center justify-center border border-cyan-500/10">
              <div className="absolute inset-0 tech-grid-bg opacity-30" />
              <div className="absolute top-3 left-3 text-[10px] text-cyan-500/40 font-mono">MAJOR_SELECTED</div>
              <div className="absolute top-3 right-3 flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-cyan-400/30 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-purple-400/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="w-2 h-2 rounded-full bg-blue-400/30 animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
              <div className="absolute bottom-3 right-3 w-16 h-16 border border-cyan-500/10 rounded-full" />
              <div className="absolute bottom-6 right-10 w-10 h-10 border border-purple-500/10 rounded-lg rotate-45" />

              <div className="relative text-center z-10">
                <div className="text-4xl mb-2 opacity-80">{getMajorEmoji(selectedMajorObj.category)}</div>
                <p className="text-white text-lg font-bold">{selectedMajorObj.name}</p>
                <p className="text-cyan-300/60 text-xs mt-1 font-mono">{selectedMajorObj.category} // {selectedMajorObj.id.toUpperCase()}</p>
              </div>
            </div>
          )}

          {/* Major List */}
          <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-700/50 bg-slate-900/50">
            {majorCategories.map(cat => {
              const catMajors = groupedMajors[cat]
              if (!catMajors || catMajors.length === 0) return null
              const isExpanded = expandedCategory === cat || majorSearch
              return (
                <div key={cat} className="border-b border-slate-800/50 last:border-b-0">
                  <button
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-800/30 hover:bg-slate-800/50 transition cursor-pointer"
                    onClick={() => setExpandedCategory(isExpanded && !majorSearch ? null : cat)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getMajorEmoji(cat)}</span>
                      <span className="text-xs font-medium text-slate-300">{cat}</span>
                      <span className="text-[10px] text-slate-500 font-mono px-1.5 py-0.5 rounded bg-slate-800">{catMajors.length}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {isExpanded && (
                    <div className="divide-y divide-slate-800/30">
                      {catMajors.map(major => (
                        <button
                          key={major.id}
                          onClick={() => setSelectedMajor(major.id)}
                          className={`w-full px-4 py-2.5 text-left text-sm transition cursor-pointer hover:bg-cyan-500/5 ${
                            selectedMajor === major.id
                              ? 'bg-cyan-500/10 text-cyan-300 font-medium border-l-2 border-cyan-400'
                              : 'text-slate-400 border-l-2 border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{major.name}</span>
                            {selectedMajor === major.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Region Selection */}
        <div className="glow-card rounded-2xl p-6 fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center">
              <MapPin className="w-4.5 h-4.5 text-purple-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">选择目标地域</h2>
              <p className="text-xs text-slate-500">必选项 · 可多选，行业信息与地域联动</p>
            </div>
            <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/20">
              REQUIRED
            </span>
          </div>

          <button
            onClick={() => setShowRegionSelect(true)}
            className="w-full px-4 py-3 rounded-xl input-dark text-left text-sm cursor-pointer flex items-center justify-between"
          >
            <span className={selectedRegions.length > 0 ? 'text-slate-200' : 'text-slate-500'}>
              {selectedRegions.length > 0
                ? selectedRegionNames.join(' / ')
                : '点击选择目标地域...'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {selectedRegions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedRegionNames.map(name => (
                <span key={name} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 text-xs border border-purple-500/15">
                  <MapPin className="w-3 h-3" />{name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Industry Selection */}
        <div className="glow-card rounded-2xl p-6 fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">行业信息维度</h2>
              <p className="text-xs text-slate-500">可选项 · 默认全选所有维度</p>
            </div>
            <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/50 text-slate-400 border border-slate-600/50">
              OPTIONAL
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4 ml-12">选择你关注的行业信息维度，与地域信息联动分析</p>

          <div className="chip-grid">
            {industryOptions.map(opt => {
              const isSelected = selectedIndustries.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleIndustry(opt.id)}
                  className={`tag-chip-dark rounded-xl p-4 text-left cursor-pointer transition ${
                    isSelected ? 'selected' : ''
                  }`}
                >
                  <div className="text-lg mb-1.5">{opt.icon}</div>
                  <div className="text-xs font-semibold text-slate-300">{opt.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{opt.description}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="pb-10">
          <Button
            onClick={handleSubmitClick}
            disabled={!canSubmit}
            className="w-full py-5 text-base font-bold rounded-xl cyber-btn-primary cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Zap className="w-5 h-5 mr-2" />
            提交并生成 AI 分析报告
          </Button>
          {!canSubmit && (
            <p className="text-center text-xs text-slate-600 mt-2 font-mono">
              [!] 请先完成专业选择和地域选择
            </p>
          )}
        </div>
      </main>

      {/* Region Dialog */}
      <Dialog open={showRegionSelect} onOpenChange={setShowRegionSelect}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-[#0d1325] border-slate-700/50 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <MapPin className="w-5 h-5 text-purple-400" />
              地域选择
            </DialogTitle>
            <DialogDescription className="text-slate-500">可选择全国或具体城市，选择"全国"展示国家层面战略部署</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <button
              onClick={() => toggleRegion('quanguo')}
              className={`w-full p-4 rounded-xl border text-left cursor-pointer transition flex items-center gap-3 ${
                selectedRegions.includes('quanguo')
                  ? 'border-cyan-500/40 bg-cyan-500/10'
                  : 'border-slate-700/50 bg-slate-800/30 hover:border-cyan-500/20'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-lg">
                🌏
              </div>
              <div className="flex-1">
                <p className="font-medium text-white text-sm">全国</p>
                <p className="text-xs text-slate-500">展示国家层面战略方针部署</p>
              </div>
              {selectedRegions.includes('quanguo') && <Check className="w-4 h-4 text-cyan-400" />}
            </button>

            {Object.entries(regionGroups).map(([groupName, groupRegions]) => (
              <div key={groupName}>
                <p className="text-xs font-medium text-slate-500 mb-2 px-1 uppercase tracking-wider">{groupName}</p>
                <div className="grid grid-cols-3 gap-2">
                  {groupRegions.map(region => (
                    <button
                      key={region.id}
                      onClick={() => toggleRegion(region.id)}
                      className={`px-3 py-2 rounded-lg border text-xs text-center cursor-pointer transition ${
                        selectedRegions.includes(region.id)
                          ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-medium'
                          : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-cyan-500/20'
                      }`}
                    >
                      {region.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
                确认选择
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Model Config Dialog */}
      <Dialog open={showModelConfigDialog} onOpenChange={setShowModelConfigDialog}>
        <DialogContent className="max-w-md bg-[#0d1325] border-slate-700/50 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-white">配置大模型 API</DialogTitle>
            <DialogDescription className="text-slate-500">
              请填写 API URL、API Key 和模型名。保存后将启用“知识库 + 大模型”模式。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <p className="text-xs text-slate-400 mb-1.5">API URL <span className="text-rose-400">*</span></p>
              <input
                value={modelDraft.apiUrl}
                onChange={(e) => setModelDraft(prev => ({ ...prev, apiUrl: e.target.value }))}
                placeholder="例如：https://api.deepseek.com/chat/completions"
                className="w-full h-10 px-3 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40"
              />
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1.5">API Key</p>
              <input
                value={modelDraft.apiKey}
                onChange={(e) => setModelDraft(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="例如：sk-xxxx"
                className="w-full h-10 px-3 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40"
              />
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1.5">模型名</p>
              <input
                value={modelDraft.model}
                onChange={(e) => setModelDraft(prev => ({ ...prev, model: e.target.value }))}
                placeholder="例如：deepseek-chat"
                className="w-full h-10 px-3 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40"
              />
            </div>

            {modelFormError && <p className="text-[11px] text-rose-300">{modelFormError}</p>}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModelConfigDialog(false)}
              className="cursor-pointer bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              取消
            </Button>
            <Button onClick={saveModelConfig} className="cursor-pointer bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-500/90 hover:to-blue-500/90">
              保存并启用大模型模式
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="max-w-md bg-[#0d1325] border-slate-700/50 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-center text-white">选择呈现方式</DialogTitle>
            <DialogDescription className="text-center text-slate-500">
              选择你希望查看就业指导报告的方式
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <button
              onClick={() => handleConfirmSubmit('text')}
              className="w-full p-5 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition cursor-pointer text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/15 flex items-center justify-center group-hover:border-cyan-500/30 transition">
                  <Type className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">文字呈现</p>
                  <p className="text-xs text-slate-500">图文并茂的完整分析报告</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => handleConfirmSubmit('digital-human')}
              className="w-full p-5 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-purple-500/30 hover:bg-purple-500/5 transition cursor-pointer text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/15 flex items-center justify-center group-hover:border-purple-500/30 transition">
                  <MonitorPlay className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">智能问答助手</p>
                  <p className="text-xs text-slate-500">AI 智能问答报告</p>
                </div>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function getMajorEmoji(category: string): string {
  const map: Record<string, string> = {
    '机械制造类': '\u{1F527}', '信息技术类': '\u{1F4BB}', '经济管理类': '\u{1F4CA}',
    '建筑工程类': '\u{1F3D7}\uFE0F', '教育服务类': '\u{1F4DA}', '医药卫生类': '\u{1F3E5}',
    '旅游服务类': '\u2708\uFE0F', '艺术设计类': '\u{1F3A8}', '电子电气类': '\u26A1', '交通类': '\u{1F697}',
  }
  return map[category] ?? '\u{1F4D6}'
}
