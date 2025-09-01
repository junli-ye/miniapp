import { flights as PROCESSED_FLIGHTS, lastUpdated, ALLIANCES } from '../../data/flightLoader';

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

// 获取多语言文本，容错
function getText(item, field, lang) {
  if (!item) return '';
  if (!field) {
    return lang === 'zh' ? (item.zh || item.en || '') : (item.en || item.zh || '');
  }
  return lang === 'zh' ? (item[field + 'Zh'] || item[field] || '') : (item[field + 'En'] || item[field] || '');
}

Page({
  data: {
    lastUpdated: lastUpdated,
    regions: REGIONS,
    currentRegion: 'ASIA',
    flights: [],            // visible (filtered) list
    originalFlights: [],    // source of truth
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
    const source = Array.isArray(PROCESSED_FLIGHTS) ? PROCESSED_FLIGHTS : [];
    this.setData({ originalFlights: source, flights: source });
    this.initFilters();
    this.filterFlights();
  },

  // 初始化筛选项
  initFilters() {
    const { lang, originalFlights } = this.data;
    const countries = unique(originalFlights.map(f => getText(f.country, '', lang)).filter(Boolean));
    const airlines = unique(originalFlights.map(f => getText(f.airline, 'name', lang)).filter(Boolean));
    const days = unique(originalFlights.map(f => (f.schedule && f.schedule.days) || '').filter(Boolean));
    
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
      this.initFilters();
      this.filterFlights();
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
    this.setData({ selectedCountry: val === (this.data.lang === 'zh' ? '全部' : 'All') ? '' : val }, () => {
      this.filterFlights()
    })
  },
  // 航司筛选
  onAirlineChange(e) {
    const idx = e.detail.value
    const val = this.data.airlineList[idx]
    this.setData({ selectedAirline: val === (this.data.lang === 'zh' ? '全部' : 'All') ? '' : val }, () => {
      this.filterFlights()
    })
  },
  // 班期筛选
  onDaysChange(e) {
    const idx = e.detail.value
    const val = this.data.daysList[idx]
    this.setData({ selectedDays: val === (this.data.lang === 'zh' ? '全部' : 'All') ? '' : val }, () => {
      this.filterFlights()
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ loading: true })
    // restore from original then filter
    this.setData({ flights: this.data.originalFlights }, () => {
      this.filterFlights();
      wx.stopPullDownRefresh();
      this.setData({ loading: false });
    });
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

  // 筛选方法
  filterFlights() {
    this.setData({ loading: true });

    const { currentRegion, selectedCountry, selectedAirline, selectedDays, lang, originalFlights } = this.data;
    let filtered = (originalFlights || []).filter(f => f.region === currentRegion);

    if (selectedCountry || selectedAirline || selectedDays) {
      filtered = filtered.filter(f => {
        const countryMatch = !selectedCountry || getText(f.country, '', lang) === selectedCountry;
        const airlineMatch = !selectedAirline || getText(f.airline, 'name', lang) === selectedAirline;
        const daysMatch = !selectedDays || ((f.schedule && f.schedule.days) === selectedDays);
        return countryMatch && airlineMatch && daysMatch;
      });
    }

    filtered.sort((a, b) => ((a.schedule && a.schedule.depTimeLocal) || '').localeCompare((b.schedule && b.schedule.depTimeLocal) || ''));

    this.setData({ flights: filtered, loading: false });
  }
});
