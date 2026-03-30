import { Button } from '@/components/ui/button'
import {
  Cpu, Brain, TrendingUp, Briefcase, Sparkles, ArrowRight, BookOpen,
  BarChart3, Users, MapPin, Zap, MessageSquare, Shield, GraduationCap,
  ChevronRight, Globe, Database, Layers
} from 'lucide-react'

interface HomePageProps {
  onStart: () => void
}

export function HomePage({ onStart }: HomePageProps) {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-tech-bg relative min-h-[calc(100vh-52px)] flex items-center justify-center overflow-hidden">
        {/* Animated Orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Grid Overlay */}
        <div className="absolute inset-0 tech-grid-bg opacity-50" />

        {/* Scan Line */}
        <div className="absolute inset-0 scan-line pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm mb-8 fade-in-up">
            <Brain className="w-4 h-4" />
            <span>《形势与政策》课程 · AI 智能辅助平台</span>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-tight fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="text-white">AI 驱动</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent glow-text">
              未来职业导航
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-4 max-w-2xl mx-auto leading-relaxed fade-in-up" style={{ animationDelay: '0.2s' }}>
            融合<span className="text-cyan-300">国家政策方针</span>与<span className="text-purple-300">行业大数据</span>，
            AI 多维分析为你提供精准的
            <span className="text-white font-medium">学业规划</span>与<span className="text-white font-medium">就业指导</span>
          </p>

          {/* Typing Effect */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-10 fade-in-up font-mono" style={{ animationDelay: '0.3s' }}>
            <span className="text-cyan-500">&gt;</span>
            <span className="typing-cursor">正在为你的未来精准导航</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button onClick={onStart} size="lg" className="cyber-btn-primary rounded-xl text-base px-8 py-4 cursor-pointer">
              <Sparkles className="w-5 h-5 mr-2" />
              开始智能测评
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <a href="#features" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-slate-400 hover:text-white transition text-base cursor-pointer">
              <BookOpen className="w-5 h-5" />
              了解更多
            </a>
          </div>

          {/* Floating Tech Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-16 fade-in-up" style={{ animationDelay: '0.5s' }}>
            {[
              { label: '37+ 专业覆盖', icon: <GraduationCap className="w-3.5 h-3.5" /> },
              { label: '50+ 城市数据', icon: <MapPin className="w-3.5 h-3.5" /> },
              { label: '实时政策同步', icon: <Shield className="w-3.5 h-3.5" /> },
              { label: 'AI 深度分析', icon: <Brain className="w-3.5 h-3.5" /> },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-400 text-xs">
                {badge.icon}
                {badge.label}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <a href="#stats" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 animate-bounce cursor-pointer">
          <span className="text-xs">SCROLL</span>
          <div className="w-px h-6 bg-gradient-to-b from-cyan-500/50 to-transparent" />
        </a>
      </section>

      {/* Data Stats Section */}
      <section id="stats" className="relative py-20 overflow-hidden">
        <div className="tech-divider" />
        <div className="max-w-6xl mx-auto px-6 pt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="glow-card rounded-2xl p-6 text-center neon-border" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent count-up">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 mt-2">{stat.label}</div>
                <div className="text-xs text-emerald-400 mt-1 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.growth}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="relative py-20 hex-pattern">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="section-label mx-auto mb-4">
              <Zap className="w-3.5 h-3.5" />
              CORE FEATURES
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              六大核心<span className="text-cyan-400">智能</span>模块
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">基于 AI 大模型和大数据分析，为你提供全方位就业指导</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {coreFeatures.map((feature, i) => (
              <div key={i} className="glow-card rounded-2xl p-6 neon-border group cursor-pointer" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.bg}`}>
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                <div className="flex items-center gap-1 mt-4 text-xs text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>了解更多</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Chat Preview */}
      <section className="relative py-20">
        <div className="tech-divider mb-16" />
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="section-label mx-auto mb-4">
              <MessageSquare className="w-3.5 h-3.5" />
              AI DIALOG
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              智能对话<span className="text-purple-400">引导</span>
            </h2>
            <p className="text-slate-500">像和朋友聊天一样，AI 智能体了解你的需求</p>
          </div>

          {/* Chat Mockup */}
          <div className="glow-card rounded-2xl p-6 data-stream">
            <div className="space-y-4">
              {/* Bot Message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                  <Cpu className="w-4 h-4 text-white" />
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
                  <p className="text-sm text-slate-300">
                    你好！我是你的 AI 就业导航助手。请选择你的<span className="text-cyan-400 font-medium">专业</span>、
                    <span className="text-purple-400 font-medium">目标地域</span>和
                    <span className="text-blue-400 font-medium">行业方向</span>，
                    我会为你生成一份专属的就业指导报告。
                  </p>
                </div>
              </div>

              {/* User Message */}
              <div className="flex gap-3 justify-end">
                <div className="bg-purple-500/15 border border-purple-500/15 rounded-2xl rounded-tr-sm px-4 py-3 max-w-md">
                  <p className="text-sm text-slate-300">
                    我是<span className="text-cyan-400 font-medium">汽车维修专业</span>的学生，
                    想去<span className="text-purple-400 font-medium">成都</span>发展
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 text-xs text-white">
                  U
                </div>
              </div>

              {/* Bot Response */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                  <Cpu className="w-4 h-4 text-white" />
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    已收到！成都正在打造世界级汽车产业集群，2024年汽车产业产值突破2000亿元。
                    让我为你深度分析成都地区<span className="text-cyan-400">汽车维修</span>行业的
                    <span className="text-amber-400">政策环境</span>、
                    <span className="text-emerald-400">企业需求</span>、
                    <span className="text-blue-400">薪资水平</span>等信息...
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">分析中</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">数据加载完成</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">生成报告</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Majors */}
      <section className="relative py-20">
        <div className="tech-divider mb-16" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="section-label mx-auto mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              HOT MAJORS
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              热门专业<span className="text-amber-400">趋势</span>
            </h2>
            <p className="text-slate-500">当前就业市场最热门的专业方向及需求趋势</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hotMajors.map((item, i) => (
              <div key={i} className="glow-card rounded-xl p-5 group cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />{item.trend}
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm mb-1">{item.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{item.category}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Users className="w-3 h-3" />需求量
                  </div>
                  <div className="text-xs font-mono text-cyan-400">{item.demand}</div>
                </div>
                <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full bar-animate"
                    style={{ width: `${item.barWidth}%`, animationDelay: `${i * 0.2}s` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20">
        <div className="tech-divider mb-16" />
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="section-label mx-auto mb-4">
              <Layers className="w-3.5 h-3.5" />
              WORKFLOW
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              三步获取<span className="text-cyan-400">专属</span>报告
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workflowSteps.map((step, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px">
                    <div className="h-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30" />
                    <div className="absolute top-1/2 left-0 w-2 h-2 -translate-y-1/2 rounded-full bg-cyan-400 animate-pulse" />
                  </div>
                )}
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 relative">
                    {step.icon}
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative py-20">
        <div className="tech-divider mb-16" />
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="section-label mx-auto mb-4">
              <Database className="w-3.5 h-3.5" />
              DATA SOURCES
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              多维数据<span className="text-blue-400">融合</span>
            </h2>
            <p className="text-slate-500">调用权威数据源，确保信息准确可靠</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dataSources.map((src, i) => (
              <div key={i} className="glow-card rounded-xl p-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-lg bg-slate-800/80 flex items-center justify-center mb-3 text-slate-400">
                  {src.icon}
                </div>
                <p className="text-xs font-medium text-white">{src.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="glow-card rounded-3xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                开启你的<span className="text-cyan-400">智能</span>职业规划
              </h2>
              <p className="text-slate-400 mb-8">
                AI 已为你准备好了一切，只需三步即可获取专属就业指导报告
              </p>
              <Button onClick={onStart} size="lg" className="cyber-btn-primary rounded-xl text-base px-10 py-4 cursor-pointer">
                <Brain className="w-5 h-5 mr-2" />
                立即开始
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const stats = [
  { value: '37+', label: '专业覆盖', growth: '持续扩展中' },
  { value: '50+', label: '城市数据', growth: '全国主要城市' },
  { value: '1.2M+', label: '就业数据', growth: '实时更新' },
  { value: '98.6%', label: '分析准确率', growth: '持续优化' },
]

const coreFeatures = [
  {
    icon: <Shield className="w-6 h-6 text-cyan-400" />,
    title: '国家政策解读',
    desc: '实时汇集国家及地方最新政策方针，深度解读行业发展方向与人才需求趋势',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: <MapPin className="w-6 h-6 text-purple-400" />,
    title: '地域产业分析',
    desc: '覆盖全国50+城市，分析各地产业布局、人才政策和薪资水平',
    bg: 'bg-purple-500/10',
  },
  {
    icon: <Briefcase className="w-6 h-6 text-blue-400" />,
    title: '企业信息查询',
    desc: '展示相关企业数量、龙头企业信息、产业集聚状况等关键数据',
    bg: 'bg-blue-500/10',
  },
  {
    icon: <Users className="w-6 h-6 text-emerald-400" />,
    title: '人才需求画像',
    desc: '分析学历要求、技能需求、薪资水平，构建精准人才需求画像',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-amber-400" />,
    title: '行业趋势预测',
    desc: '基于大数据分析，预测行业未来发展趋势和就业前景',
    bg: 'bg-amber-500/10',
  },
  {
    icon: <Brain className="w-6 h-6 text-pink-400" />,
    title: 'AI 个性推荐',
    desc: '综合你的专业和地域偏好，AI 智能推荐最优学习规划和就业路径',
    bg: 'bg-pink-500/10',
  },
]

const hotMajors = [
  { emoji: '\u{1F697}', name: '新能源汽车技术', category: '交通类', trend: '+32%', demand: '12,800/年', barWidth: 92 },
  { emoji: '\u{1F4BB}', name: '人工智能技术应用', category: '信息技术类', trend: '+45%', demand: '18,500/年', barWidth: 98 },
  { emoji: '\u{1F916}', name: '工业机器人技术', category: '机械制造类', trend: '+28%', demand: '9,200/年', barWidth: 78 },
  { emoji: '\u{1F4CA}', name: '大数据技术', category: '信息技术类', trend: '+38%', demand: '15,300/年', barWidth: 88 },
]

const workflowSteps = [
  { icon: <GraduationCap className="w-8 h-8 text-cyan-400" />, title: '选择信息', desc: '选择专业、目标地域和行业维度' },
  { icon: <Cpu className="w-8 h-8 text-purple-400" />, title: 'AI 分析', desc: '智能体进行多维数据交叉分析' },
  { icon: <BarChart3 className="w-8 h-8 text-emerald-400" />, title: '获取报告', desc: '生成专属就业指导报告' },
]

const dataSources = [
  { icon: <BookOpen className="w-5 h-5" />, label: '国家政策文件' },
  { icon: <Layers className="w-5 h-5" />, label: '行业规章标准' },
  { icon: <MapPin className="w-5 h-5" />, label: '地方人才政策' },
  { icon: <Database className="w-5 h-5" />, label: '地区发展数据' },
  { icon: <Globe className="w-5 h-5" />, label: '企业信息数据库' },
  { icon: <BarChart3 className="w-5 h-5" />, label: '薪资调查报告' },
  { icon: <GraduationCap className="w-5 h-5" />, label: '人才培养方案' },
  { icon: <TrendingUp className="w-5 h-5" />, label: '就业市场数据' },
]
