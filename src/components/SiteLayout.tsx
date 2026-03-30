import { useLocation, useNavigate } from '../hooks/useRouter'
import { Button } from '@/components/ui/button'
import {
  Cpu, Brain, ArrowRight, Home, ClipboardList, FileBarChart,
  Sparkles
} from 'lucide-react'

const navItems = [
  { path: '/', label: '首页', icon: <Home className="w-4 h-4" /> },
  { path: '/survey', label: '智能测评', icon: <ClipboardList className="w-4 h-4" /> },
]

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const isHome = pathname === '/'
  const isSurvey = pathname === '/survey'
  const isResult = pathname.startsWith('/result')

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100">
      {/* Global Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-cyan-500/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center pulse-ring">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-white">形势与政策</span>
              <span className="hidden sm:inline text-[10px] text-cyan-400/70 font-mono px-2 py-0.5 rounded-full bg-cyan-500/5 border border-cyan-500/10">AI AGENT</span>
            </div>
          </button>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map(item => {
              const isActive = pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              )
            })}
            {isResult && (
              <button
                onClick={() => navigate('/survey')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 cursor-pointer"
              >
                <FileBarChart className="w-4 h-4" />
                <span className="hidden sm:inline">解读报告</span>
              </button>
            )}
          </div>

          {/* CTA */}
          {!isSurvey && (
            <Button
              onClick={() => navigate('/survey')}
              size="sm"
              className="cyber-btn-primary rounded-lg text-xs px-4 py-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              {isResult ? '重新测评' : '开始测评'}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
          {isSurvey && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot" />
              <span className="text-xs text-emerald-400 font-medium hidden sm:inline">填写中</span>
            </div>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <main className="pt-[52px]">
        {children}
      </main>

      {/* Global Footer (only on non-survey pages) */}
      {!isSurvey && (
        <footer className="border-t border-slate-800/50 py-8 mt-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-600" />
                <span className="text-sm text-slate-600">形势与政策 — AI 就业导航智能体</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-slate-700">
                <span>融合国家政策方针</span>
                <span className="text-slate-800">|</span>
                <span>AI 多维分析</span>
                <span className="text-slate-800">|</span>
                <span>助力学生就业</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
