import { SiteLayout } from './components/SiteLayout'
import { HomePage } from './components/HomePage'
import { SurveyPage } from './components/SurveyPage'
import { ResultPage } from './components/ResultPage'
import { useRouter, useLocation } from './hooks/useRouter'
import { useAppState } from './hooks/useAppState'
import { useEffect } from 'react'
import type { AnalysisMode, ModelConfig } from '@/types'

function App() {
  const { pathname } = useLocation()
  const router = useRouter()
  const {
    surveyData,
    displayMode,
    analysisMode,
    modelConfig,
    setSurveyResult,
    clearSurvey,
    setAnalysisMode,
    setModelConfig,
  } = useAppState()

  const readCachedResult = () => {
    try {
      const raw = window.sessionStorage.getItem('survey-result-cache')
      if (!raw) return null
      return JSON.parse(raw) as {
        surveyData: NonNullable<typeof surveyData>
        displayMode: typeof displayMode
        analysisMode?: AnalysisMode
        modelConfig?: ModelConfig
      }
    } catch {
      return null
    }
  }

  const cached = readCachedResult()
  const resolvedSurveyData = surveyData ?? cached?.surveyData ?? null
  const resolvedDisplayMode = surveyData ? displayMode : (cached?.displayMode ?? displayMode)
  const resolvedAnalysisMode = cached?.analysisMode ?? analysisMode
  const resolvedModelConfig = cached?.modelConfig ?? modelConfig

  // Redirect to home on initial load with no hash
  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#/')
    }
  }, [])

  const handleStartSurvey = () => router.navigate('/survey')

  const handleSubmitSurvey = (data: Parameters<typeof setSurveyResult>[0], mode: Parameters<typeof setSurveyResult>[1]) => {
    // 先缓存，避免切路由时 state 尚未就绪导致回落首页
    window.sessionStorage.setItem('survey-result-cache', JSON.stringify({
      surveyData: data,
      displayMode: mode,
      analysisMode,
      modelConfig,
    }))
    setSurveyResult(data, mode)
    router.navigate('/result')
  }

  const handleGoHome = () => router.navigate('/')

  // Render page based on pathname
  let page: React.ReactNode

  if (pathname === '/' || pathname === '') {
    page = <HomePage onStart={handleStartSurvey} />
  } else if (pathname === '/survey') {
    page = (
      <SurveyPage
        onSubmit={handleSubmitSurvey}
        onHome={handleGoHome}
        analysisMode={analysisMode}
        modelConfig={modelConfig}
        onAnalysisModeChange={setAnalysisMode}
        onModelConfigSave={setModelConfig}
      />
    )
  } else if (pathname === '/result' && resolvedSurveyData) {
    page = (
      <ResultPage
        data={resolvedSurveyData}
        displayMode={resolvedDisplayMode}
        analysisMode={resolvedAnalysisMode}
        modelConfig={resolvedModelConfig}
        onRetake={() => {
          clearSurvey()
          window.sessionStorage.removeItem('survey-result-cache')
          router.navigate('/survey')
        }}
        onHome={handleGoHome}
      />
    )
  } else {
    // 404 — redirect to home
    page = <HomePage onStart={handleStartSurvey} />
  }

  return (
    <SiteLayout>
      {page}
    </SiteLayout>
  )
}

export default App
