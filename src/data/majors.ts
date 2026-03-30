export interface Major {
  id: string
  name: string
  category: string
  keywords: string[]
}

export const majors: Major[] = [
  // 机械制造类
  { id: 'qiche-weixiu', name: '汽车维修', category: '机械制造类', keywords: ['汽车', '维修', '检测', '发动机'] },
  { id: 'jixie-zhizao', name: '机械制造与自动化', category: '机械制造类', keywords: ['机械', '自动化', '数控', '制造'] },
  { id: 'jixie-sheji', name: '机械设计与制造', category: '机械制造类', keywords: ['设计', 'CAD', '机械', '制图'] },
  { id: 'nume-kongzhi', name: '数控技术', category: '机械制造类', keywords: ['数控', 'CNC', '编程', '加工'] },
  { id: 'mochuang-shiyong', name: '模具设计与制造', category: '机械制造类', keywords: ['模具', '注塑', '冲压', '设计'] },
  { id: 'gongye-jixie', name: '工业机器人技术', category: '机械制造类', keywords: ['机器人', '自动化', 'PLC', '智能'] },
  // 信息技术类
  { id: 'jisuanji-yingyong', name: '计算机应用技术', category: '信息技术类', keywords: ['编程', '软件开发', '数据库', '网络'] },
  { id: 'ruanjian-jishu', name: '软件技术', category: '信息技术类', keywords: ['编程', 'Java', 'Python', '开发'] },
  { id: 'wangluo-gongcheng', name: '网络工程技术', category: '信息技术类', keywords: ['网络', '路由器', '交换机', '安全'] },
  { id: 'dianzi-shangwu', name: '电子商务', category: '信息技术类', keywords: ['电商', '运营', '营销', '平台'] },
  { id: 'dashuju-jishu', name: '大数据技术', category: '信息技术类', keywords: ['大数据', '分析', 'Hadoop', '数据'] },
  { id: 'rengong-zhineng', name: '人工智能技术应用', category: '信息技术类', keywords: ['AI', '机器学习', '深度学习', '算法'] },
  // 经济管理类
  { id: 'kuaiji', name: '会计', category: '经济管理类', keywords: ['财务', '会计', '审计', '税务'] },
  { id: 'jinrong-guanli', name: '金融管理', category: '经济管理类', keywords: ['金融', '银行', '证券', '投资'] },
  { id: 'shichang-yingxiao', name: '市场营销', category: '经济管理类', keywords: ['营销', '策划', '品牌', '推广'] },
  { id: 'wuliu-guanli', name: '物流管理', category: '经济管理类', keywords: ['物流', '仓储', '供应链', '配送'] },
  { id: 'guanli-gongcheng', name: '工商企业管理', category: '经济管理类', keywords: ['管理', '企业', '人力资源', '行政'] },
  // 建筑工程类
  { id: 'jianzhu-gongcheng', name: '建筑工程技术', category: '建筑工程类', keywords: ['建筑', '施工', '工程', '设计'] },
  { id: 'zhuangshi-sheji', name: '建筑装饰工程技术', category: '建筑工程类', keywords: ['装饰', '设计', '施工', '材料'] },
  { id: 'gongcheng-zaojia', name: '工程造价', category: '建筑工程类', keywords: ['造价', '预算', '结算', '工程'] },
  { id: 'tujian-gongcheng', name: '土木工程检测技术', category: '建筑工程类', keywords: ['检测', '材料', '结构', '质量'] },
  // 教育服务类
  { id: 'xueqian-jiaoyu', name: '学前教育', category: '教育服务类', keywords: ['幼儿', '教育', '保育', '教学'] },
  { id: 'xiaoxue-jiaoyu', name: '小学教育', category: '教育服务类', keywords: ['小学', '教育', '教学', '课程'] },
  { id: 'tiyu-jiaoyu', name: '体育教育', category: '教育服务类', keywords: ['体育', '运动', '健身', '教学'] },
  // 医药卫生类
  { id: 'huli', name: '护理', category: '医药卫生类', keywords: ['护理', '医疗', '临床', '健康'] },
  { id: 'yaopin-shengchan', name: '药品生产技术', category: '医药卫生类', keywords: ['药品', '生产', '制药', '质检'] },
  { id: 'kouqiang-yixue', name: '口腔医学技术', category: '医药卫生类', keywords: ['口腔', '义齿', '修复', '技术'] },
  // 旅游服务类
  { id: 'lvyou-guanli', name: '旅游管理', category: '旅游服务类', keywords: ['旅游', '导游', '酒店', '景区'] },
  { id: 'jiudian-guanli', name: '酒店管理与数字化运营', category: '旅游服务类', keywords: ['酒店', '前厅', '客房', '数字化'] },
  // 艺术设计类
  { id: 'guanggao-sheji', name: '广告设计与制作', category: '艺术设计类', keywords: ['广告', '设计', '创意', '视觉'] },
  { id: 'huanjing-yishu', name: '环境艺术设计', category: '艺术设计类', keywords: ['环境', '室内', '景观', '设计'] },
  { id: 'shuzi-meiye', name: '数字媒体艺术设计', category: '艺术设计类', keywords: ['数字', '媒体', '动画', '视频'] },
  // 电子电气类
  { id: 'dianzi-jishu', name: '应用电子技术', category: '电子电气类', keywords: ['电子', '电路', 'PCB', '嵌入式'] },
  { id: 'dianqi-zi-donghua', name: '电气自动化技术', category: '电子电气类', keywords: ['电气', 'PLC', '自动化', '控制'] },
  { id: 'xinxi-xianshi', name: '电子信息工程技术', category: '电子电气类', keywords: ['信息', '通信', '信号', '处理'] },
  // 交通类
  { id: 'che-liang-gongcheng', name: '新能源汽车技术', category: '交通类', keywords: ['新能源', '电动汽车', '电池', '充电'] },
  { id: 'daolu-yunshu', name: '道路与桥梁工程技术', category: '交通类', keywords: ['道路', '桥梁', '施工', '检测'] },
]

export const majorCategories = [...new Set(majors.map(m => m.category))]
