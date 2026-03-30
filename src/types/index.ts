export interface SurveyFormData {
  majorId: string
  regionIds: string[]
  industryIds: string[]
}

export interface ModelConfig {
  apiUrl: string
  apiKey: string
  model: string
}

export type ViewMode = 'home' | 'survey' | 'result'
export type DisplayMode = 'text' | 'digital-human'
export type AnalysisMode = 'local' | 'model'
