export const industryOptions = [
  { id: 'policy', name: '政策信息', icon: '📜', description: '相关国家及地方政策方针' },
  { id: 'enterprise', name: '企业信息', icon: '🏢', description: '相关企业数量、龙头企业' },
  { id: 'employment', name: '聘用信息', icon: '💼', description: '人才需求、技能要求、学历要求' },
  { id: 'salary', name: '薪资信息', icon: '💰', description: '平均薪资、薪资范围' },
  { id: 'frontier', name: '最新前沿', icon: '🚀', description: '行业最新发展动态' },
  { id: 'future', name: '未来进展', icon: '🔮', description: '行业未来发展趋势与部署' },
] as const

export type IndustryId = typeof industryOptions[number]['id']

export const regionPolicyMap: Record<string, string> = {
  'quanguo': '国家战略部署',
  'beijing': '京津冀协同发展战略',
  'shanghai': '长三角一体化发展战略',
  'shenzhen': '粤港澳大湾区建设',
  'chengdu': '成渝地区双城经济圈建设',
  'wuhan': '长江中游城市群发展',
  'hangzhou': '数字经济创新发展试验区',
  'guangzhou': '粤港澳大湾区建设',
  'xian': '西部大开发战略 / 一带一路',
  'kunming': '面向南亚东南亚辐射中心',
  'haikou': '海南自由贸易港建设',
}
