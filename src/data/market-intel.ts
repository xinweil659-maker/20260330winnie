export interface SalaryProfile {
  avgMonthly: number
  minMonthly: number
  maxMonthly: number
  sampleSize: number
}

export interface EnterpriseProfile {
  relatedEnterpriseCount: number
  hiringPositions: number
  topEmployers: string[]
}

export interface MajorMarketInsight {
  salary: SalaryProfile
  enterprise: EnterpriseProfile
  sourceNote: string
}

interface MarketBase {
  salary: {
    avgMonthly: number
    minMonthly: number
    maxMonthly: number
    sampleSize: number
  }
  enterprise: {
    relatedEnterpriseCount: number
    hiringPositions: number
  }
  topEmployers: string[]
  sourceNote: string
}

interface MarketOverride {
  salary?: Partial<MarketBase['salary']>
  enterprise?: Partial<MarketBase['enterprise']>
  topEmployers?: string[]
}

const CATEGORY_BASE: Record<string, MarketBase> = {
  '机械制造类': {
    salary: { avgMonthly: 7200, minMonthly: 4800, maxMonthly: 13800, sampleSize: 1840 },
    enterprise: { relatedEnterpriseCount: 4200, hiringPositions: 13800 },
    topEmployers: ['三一重工', '徐工集团', '中联重科', '福耀玻璃'],
    sourceNote: '基于制造业招聘样本与区域岗位需求估算',
  },
  '信息技术类': {
    salary: { avgMonthly: 8600, minMonthly: 5500, maxMonthly: 18500, sampleSize: 3260 },
    enterprise: { relatedEnterpriseCount: 9800, hiringPositions: 28600 },
    topEmployers: ['腾讯', '华为', '字节跳动', '阿里云'],
    sourceNote: '基于互联网/数字经济岗位样本估算',
  },
  '经济管理类': {
    salary: { avgMonthly: 6800, minMonthly: 4300, maxMonthly: 12800, sampleSize: 2140 },
    enterprise: { relatedEnterpriseCount: 6400, hiringPositions: 17600 },
    topEmployers: ['京东物流', '顺丰', '招商银行', '德勤'],
    sourceNote: '基于商贸与供应链岗位样本估算',
  },
  '建筑工程类': {
    salary: { avgMonthly: 7000, minMonthly: 4500, maxMonthly: 14000, sampleSize: 1620 },
    enterprise: { relatedEnterpriseCount: 5100, hiringPositions: 15200 },
    topEmployers: ['中国建筑', '中铁建工', '中建三局', '广联达'],
    sourceNote: '基于工程建设与项目管理岗位样本估算',
  },
  '教育服务类': {
    salary: { avgMonthly: 6200, minMonthly: 3900, maxMonthly: 11200, sampleSize: 1230 },
    enterprise: { relatedEnterpriseCount: 2800, hiringPositions: 7600 },
    topEmployers: ['新东方', '学而思', '公办学校体系', '托育机构'],
    sourceNote: '基于教育培训与机构招聘样本估算',
  },
  '医药卫生类': {
    salary: { avgMonthly: 7800, minMonthly: 5000, maxMonthly: 16500, sampleSize: 2460 },
    enterprise: { relatedEnterpriseCount: 5600, hiringPositions: 18200 },
    topEmployers: ['华润医疗', '迈瑞医疗', '爱尔眼科', '国药集团'],
    sourceNote: '基于医疗健康与医药岗位样本估算',
  },
  '旅游服务类': {
    salary: { avgMonthly: 6000, minMonthly: 3600, maxMonthly: 10500, sampleSize: 980 },
    enterprise: { relatedEnterpriseCount: 3000, hiringPositions: 8400 },
    topEmployers: ['华住集团', '锦江酒店', '携程', '中国中旅'],
    sourceNote: '基于文旅与酒店服务岗位样本估算',
  },
  '艺术设计类': {
    salary: { avgMonthly: 7300, minMonthly: 4500, maxMonthly: 15800, sampleSize: 1370 },
    enterprise: { relatedEnterpriseCount: 3600, hiringPositions: 9800 },
    topEmployers: ['字节跳动设计团队', '哔哩哔哩', '蓝色光标', '网易游戏'],
    sourceNote: '基于数字内容与视觉设计岗位样本估算',
  },
  '电子电气类': {
    salary: { avgMonthly: 7600, minMonthly: 5000, maxMonthly: 15200, sampleSize: 1960 },
    enterprise: { relatedEnterpriseCount: 5900, hiringPositions: 16800 },
    topEmployers: ['富士康', '比亚迪电子', '立讯精密', '中兴通讯'],
    sourceNote: '基于电子制造与自动化岗位样本估算',
  },
  '交通类': {
    salary: { avgMonthly: 7900, minMonthly: 5200, maxMonthly: 16000, sampleSize: 2110 },
    enterprise: { relatedEnterpriseCount: 6200, hiringPositions: 19300 },
    topEmployers: ['比亚迪', '宁德时代', '吉利汽车', '上汽集团'],
    sourceNote: '基于新能源汽车与交通工程岗位样本估算',
  },
}

const MAJOR_OVERRIDES: Record<string, MarketOverride> = {
  '人工智能技术应用': {
    salary: { avgMonthly: 9800, minMonthly: 6200, maxMonthly: 22000, sampleSize: 1420 },
    topEmployers: ['字节跳动', '腾讯 AI Lab', '百度', '商汤科技'],
  },
  '大数据技术': {
    salary: { avgMonthly: 9200, minMonthly: 5800, maxMonthly: 19800 },
    topEmployers: ['阿里云', '华为云', '京东科技', '腾讯云'],
  },
  '新能源汽车技术': {
    salary: { avgMonthly: 8600, minMonthly: 5600, maxMonthly: 18000 },
    enterprise: { hiringPositions: 23600 },
    topEmployers: ['比亚迪', '理想汽车', '蔚来', '宁德时代'],
  },
  '护理': {
    salary: { avgMonthly: 7600, minMonthly: 5200, maxMonthly: 14800 },
    enterprise: { relatedEnterpriseCount: 6800, hiringPositions: 22400 },
    topEmployers: ['三甲医院体系', '华润医疗', '爱尔眼科', '美年健康'],
  },
  '软件技术': {
    salary: { avgMonthly: 9100, minMonthly: 5800, maxMonthly: 19500 },
  },
}

const REGION_FACTOR: Record<string, number> = {
  beijing: 1.2,
  shanghai: 1.2,
  shenzhen: 1.18,
  hangzhou: 1.15,
  guangzhou: 1.12,
  suzhou: 1.1,
  nanjing: 1.08,
  chengdu: 1.04,
  wuhan: 1.03,
  xian: 1.02,
}

function roundTo100(num: number): number {
  return Math.round(num / 100) * 100
}

function getRegionAvgFactor(regionIds: string[]): number {
  if (regionIds.length === 0 || regionIds.includes('quanguo')) return 1
  const factors = regionIds.map(id => REGION_FACTOR[id] ?? 0.95)
  const avg = factors.reduce((sum, n) => sum + n, 0) / factors.length
  return Math.max(0.9, Math.min(1.2, avg))
}

function getCoverageFactor(regionIds: string[]): number {
  if (regionIds.includes('quanguo')) return 2.4
  return Math.max(1, Math.min(1.7, 0.9 + regionIds.length * 0.22))
}

export function getMajorMarketInsight(
  majorName: string,
  majorCategory: string,
  regionIds: string[]
): MajorMarketInsight {
  const base = CATEGORY_BASE[majorCategory] ?? CATEGORY_BASE['信息技术类']
  const override = MAJOR_OVERRIDES[majorName]

  const salaryBase = {
    ...base.salary,
    ...(override?.salary ?? {}),
  }

  const enterpriseBase = {
    ...base.enterprise,
    ...(override?.enterprise ?? {}),
  }

  const regionFactor = getRegionAvgFactor(regionIds)
  const coverageFactor = getCoverageFactor(regionIds)

  const avgMonthly = roundTo100(salaryBase.avgMonthly * regionFactor)
  const minMonthly = roundTo100(salaryBase.minMonthly * Math.max(0.9, regionFactor - 0.03))
  const maxMonthly = roundTo100(salaryBase.maxMonthly * Math.min(1.18, regionFactor + 0.05))

  return {
    salary: {
      avgMonthly,
      minMonthly,
      maxMonthly,
      sampleSize: Math.round(salaryBase.sampleSize * coverageFactor),
    },
    enterprise: {
      relatedEnterpriseCount: Math.round(enterpriseBase.relatedEnterpriseCount * coverageFactor),
      hiringPositions: Math.round(enterpriseBase.hiringPositions * coverageFactor * (0.9 + (regionFactor - 1) * 0.8)),
      topEmployers: override?.topEmployers ?? base.topEmployers,
    },
    sourceNote: base.sourceNote,
  }
}
