import { flights, lastUpdated, ALLIANCES } from '../../data/flightLoader';

const REGIONS = [
  { key: 'ASIA', name: '亚洲', nameEn: 'Asia' },
  { key: 'HMT', name: '港澳台', nameEn: 'H/M/T' },
  { key: 'EME', name: '欧洲和中东', nameEn: 'Europe & Middle East' },
  { key: 'NA', name: '美洲', nameEn: 'America' },
  { key: 'AFRICA', name: '非洲', nameEn: 'Africa' }
]

// 帮助函数
function unique(arr) {
  return Array.from(new Set(arr))
}

// 获取多语言文本
function getText(item, field, lang) {
  return lang === 'zh' ? item[field + 'Zh'] : item[field + 'En']
}

Page({
  data: {
    lastUpdated,
    regions: REGIONS,
    currentRegion: 'ASIA',
    flights: [],
    lang: 'zh',
    ALLIANCES, // 航空联盟数据
    countryList: [],
    airlineList: [],
    daysList: [],
    selectedCountry: '',
    selectedAirline: '',
    selectedDays: '',
    loading: false,
    showBackTop: false,
    filterPanelVisible: true, // 筛选面板显示状态
  },

  onLoad() {
    this.initFilters()
    this.filterFlights()
  },

  // 初始化筛选项
  initFilters() {
    const { lang } = this.data
    const countries = unique(flights.map(f => getText(f.country, '', lang)))
    const airlines = unique(flights.map(f => getText(f.airline, 'name', lang)))
    const days = unique(flights.map(f => f.schedule.days))
    
    this.setData({
      countryList: [lang === 'zh' ? '全部' : 'All', ...countries],
      airlineList: [lang === 'zh' ? '全部' : 'All', ...airlines],
      daysList: [lang === 'zh' ? '全部' : 'All', ...days]
    })
  },

  // 切换语言
  switchLang() {
    const newLang = this.data.lang === 'zh' ? 'en' : 'zh'
    this.setData({ lang: newLang }, () => {
      // 重新初始化筛选器选项
      this.initFilters()
      // 重新筛选以更新显示
      this.filterFlights()
    })
  },

  // 切换区域
  switchRegion(e) {
    const { region } = e.currentTarget.dataset
    this.setData({ currentRegion: region }, () => {
      this.filterFlights()
    })
  },

  // 国家筛选
  onCountryChange(e) {
    const idx = e.detail.value
    const val = this.data.countryList[idx]
    this.setData({ selectedCountry: val === '全部' ? '' : val }, () => {
      this.filterFlights()
    })
  },
  // 航司筛选
  onAirlineChange(e) {
    const idx = e.detail.value
    const val = this.data.airlineList[idx]
    this.setData({ selectedAirline: val === '全部' ? '' : val }, () => {
      this.filterFlights()
    })
  },
  // 班期筛选
  onDaysChange(e) {
    const idx = e.detail.value
    const val = this.data.daysList[idx]
    this.setData({ selectedDays: val === '全部' ? '' : val }, () => {
      this.filterFlights()
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ loading: true })
    this.filterFlights()
    wx.stopPullDownRefresh()
    this.setData({ loading: false })
  },

  // 页面滚动
  onPageScroll(e) {
    const showBackTop = e.scrollTop > 200
    if (showBackTop !== this.data.showBackTop) {
      this.setData({ showBackTop })
    }
  },

  // 返回顶部
  backToTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },

  // 切换筛选面板显示状态
  toggleFilterPanel() {
    this.setData({
      filterPanelVisible: !this.data.filterPanelVisible
    })
  },

  // 清除筛选条件
  clearFilters() {
    this.setData({
      selectedCountry: '',
      selectedAirline: '',
      selectedDays: ''
    }, () => {
      this.filterFlights()
    })
  },

  // 优化后的筛选方法
  filterFlights() {
    this.setData({ loading: true })
    
    const { currentRegion, selectedCountry, selectedAirline, selectedDays, lang } = this.data
    let filtered = flights.filter(f => f.region === currentRegion)
    
    // 优化筛选逻辑，支持中英文
    if (selectedCountry || selectedAirline || selectedDays) {
      filtered = filtered.filter(f => {
        const countryMatch = !selectedCountry || 
          getText(f.country, '', lang) === selectedCountry
        const airlineMatch = !selectedAirline || 
          getText(f.airline, 'name', lang) === selectedAirline
        const daysMatch = !selectedDays || f.schedule.days === selectedDays
        
        return countryMatch && airlineMatch && daysMatch
      })
    }

    // 优化排序
    filtered.sort((a, b) => a.schedule.depTimeLocal.localeCompare(b.schedule.depTimeLocal))
    
    this.setData({ 
      flights: filtered,
      loading: false
    })
  }
})
