import { useState, useCallback } from 'react'
import type { SurveyFormData, DisplayMode, AnalysisMode, ModelConfig } from '@/types'

interface AppState {
  surveyData: SurveyFormData | null
  displayMode: DisplayMode
  analysisMode: AnalysisMode
  modelConfig: ModelConfig
}

const DEFAULT_MODEL_CONFIG: ModelConfig = {
  apiUrl: '',
  apiKey: '',
  model: 'deepseek-chat',
}

const MODE_CACHE_KEY = 'analysis-mode-cache'

function readModeCache(): Pick<AppState, 'analysisMode' | 'modelConfig'> {
  try {
    const raw = window.sessionStorage.getItem(MODE_CACHE_KEY)
    if (!raw) return { analysisMode: 'local', modelConfig: DEFAULT_MODEL_CONFIG }
    const parsed = JSON.parse(raw) as Partial<Pick<AppState, 'analysisMode' | 'modelConfig'>>
    return {
      analysisMode: parsed.analysisMode === 'model' ? 'model' : 'local',
      modelConfig: {
        apiUrl: parsed.modelConfig?.apiUrl ?? '',
        apiKey: parsed.modelConfig?.apiKey ?? '',
        model: parsed.modelConfig?.model || 'deepseek-chat',
      },
    }
  } catch {
    return { analysisMode: 'local', modelConfig: DEFAULT_MODEL_CONFIG }
  }
}

function persistModeCache(next: Pick<AppState, 'analysisMode' | 'modelConfig'>) {
  window.sessionStorage.setItem(MODE_CACHE_KEY, JSON.stringify(next))
}

export function useAppState() {
  const cached = readModeCache()

  const [state, setState] = useState<AppState>({
    surveyData: null,
    displayMode: 'text',
    analysisMode: cached.analysisMode,
    modelConfig: cached.modelConfig,
  })

  const setSurveyResult = useCallback((data: SurveyFormData, mode: DisplayMode) => {
    setState(prev => ({ ...prev, surveyData: data, displayMode: mode }))
  }, [])

  const setAnalysisMode = useCallback((mode: AnalysisMode) => {
    setState(prev => {
      const next = { ...prev, analysisMode: mode }
      persistModeCache({ analysisMode: next.analysisMode, modelConfig: next.modelConfig })
      return next
    })
  }, [])

  const setModelConfig = useCallback((config: ModelConfig) => {
    setState(prev => {
      const next = {
        ...prev,
        modelConfig: {
          apiUrl: config.apiUrl.trim(),
          apiKey: config.apiKey.trim(),
          model: config.model.trim() || 'deepseek-chat',
        },
      }
      persistModeCache({ analysisMode: next.analysisMode, modelConfig: next.modelConfig })
      return next
    })
  }, [])

  const clearSurvey = useCallback(() => {
    setState(prev => ({ ...prev, surveyData: null }))
  }, [])

  return { ...state, setSurveyResult, clearSurvey, setAnalysisMode, setModelConfig }
}
