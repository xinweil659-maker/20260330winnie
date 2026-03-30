export interface Region {
  id: string
  name: string
  type: 'national' | 'province' | 'city'
}

export const nationalRegions: Region = { id: 'quanguo', name: '全国', type: 'national' }

export const regions: Region[] = [
  // 直辖市
  { id: 'beijing', name: '北京', type: 'city' },
  { id: 'shanghai', name: '上海', type: 'city' },
  { id: 'tianjin', name: '天津', type: 'city' },
  { id: 'chongqing', name: '重庆', type: 'city' },
  // 四川省
  { id: 'chengdu', name: '成都', type: 'city' },
  { id: 'mianyang', name: '绵阳', type: 'city' },
  { id: 'deyang', name: '德阳', type: 'city' },
  { id: 'yibin', name: '宜宾', type: 'city' },
  { id: 'nanchong', name: '南充', type: 'city' },
  { id: 'leshan', name: '乐山', type: 'city' },
  // 广东省
  { id: 'guangzhou', name: '广州', type: 'city' },
  { id: 'shenzhen', name: '深圳', type: 'city' },
  { id: 'dongguan', name: '东莞', type: 'city' },
  { id: 'foshan', name: '佛山', type: 'city' },
  { id: 'zhuhai', name: '珠海', type: 'city' },
  // 浙江省
  { id: 'hangzhou', name: '杭州', type: 'city' },
  { id: 'ningbo', name: '宁波', type: 'city' },
  { id: 'wenzhou', name: '温州', type: 'city' },
  // 江苏省
  { id: 'nanjing', name: '南京', type: 'city' },
  { id: 'suzhou', name: '苏州', type: 'city' },
  { id: 'wuxi', name: '无锡', type: 'city' },
  // 湖北省
  { id: 'wuhan', name: '武汉', type: 'city' },
  { id: 'yichang', name: '宜昌', type: 'city' },
  // 湖南省
  { id: 'changsha', name: '长沙', type: 'city' },
  // 陕西省
  { id: 'xian', name: '西安', type: 'city' },
  // 山东省
  { id: 'jinan', name: '济南', type: 'city' },
  { id: 'qingdao', name: '青岛', type: 'city' },
  // 河南省
  { id: 'zhengzhou', name: '郑州', type: 'city' },
  // 福建省
  { id: 'fuzhou', name: '福州', type: 'city' },
  { id: 'xiamen', name: '厦门', type: 'city' },
  // 辽宁省
  { id: 'shenyang', name: '沈阳', type: 'city' },
  { id: 'dalian', name: '大连', type: 'city' },
  // 云南省
  { id: 'kunming', name: '昆明', type: 'city' },
  // 贵州省
  { id: 'guiyang', name: '贵阳', type: 'city' },
  // 安徽省
  { id: 'hefei', name: '合肥', type: 'city' },
  // 江西省
  { id: 'nanchang', name: '南昌', type: 'city' },
  // 广西
  { id: 'nanning', name: '南宁', type: 'city' },
  // 海南省
  { id: 'haikou', name: '海口', type: 'city' },
  // 甘肃省
  { id: 'lanzhou', name: '兰州', type: 'city' },
  // 河北省
  { id: 'shijiazhuang', name: '石家庄', type: 'city' },
  // 山西省
  { id: 'taiyuan', name: '太原', type: 'city' },
  // 内蒙古
  { id: 'hohhot', name: '呼和浩特', type: 'city' },
  // 吉林省
  { id: 'changchun', name: '长春', type: 'city' },
  // 黑龙江
  { id: 'haerbin', name: '哈尔滨', type: 'city' },
]

export const regionGroups = {
  '直辖市': regions.filter(r => ['beijing', 'shanghai', 'tianjin', 'chongqing'].includes(r.id)),
  '四川省': regions.filter(r => ['chengdu', 'mianyang', 'deyang', 'yibin', 'nanchong', 'leshan'].includes(r.id)),
  '广东省': regions.filter(r => ['guangzhou', 'shenzhen', 'dongguan', 'foshan', 'zhuhai'].includes(r.id)),
  '浙江省': regions.filter(r => ['hangzhou', 'ningbo', 'wenzhou'].includes(r.id)),
  '江苏省': regions.filter(r => ['nanjing', 'suzhou', 'wuxi'].includes(r.id)),
  '湖北省': regions.filter(r => ['wuhan', 'yichang'].includes(r.id)),
  '其他城市': regions.filter(r => !['beijing', 'shanghai', 'tianjin', 'chongqing', 'chengdu', 'mianyang', 'deyang', 'yibin', 'nanchong', 'leshan', 'guangzhou', 'shenzhen', 'dongguan', 'foshan', 'zhuhai', 'hangzhou', 'ningbo', 'wenzhou', 'nanjing', 'suzhou', 'wuxi', 'wuhan', 'yichang'].includes(r.id)),
}
