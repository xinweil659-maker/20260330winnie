// 知识库类型定义

export interface TrainingPlan {
  /** 学院名称 */
  college: string
  /** 子方案名称（如"匠心班"、"卓越班"等） */
  sub?: string
  /** 提取的文本内容 */
  content: string
  /** 来源文件类型 */
  source: 'pdf' | 'xlsx'
}

export interface PolicyDoc {
  /** 政策分类 */
  category: string
  /** 文件名（去除扩展名） */
  fileName: string
  /** 提取的文本内容 */
  content: string
  /** 来源文件类型 */
  source: 'docx' | 'pdf'
}

export interface SearchResult {
  type: 'training' | 'policy'
  source: string
  title: string
  category?: string
  snippet: string
  relevanceScore: number
}

export interface KnowledgeBaseMeta {
  generatedAt: string
  version: string
  totalTrainingPlans: number
  totalPolicyDocs: number
}
