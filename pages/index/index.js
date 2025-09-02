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
    error: false,
  },

  onLoad() {
    // prefer cloud data; fall back to local processed flights
    this.loadFlights(false).then(() => {
      this.initFilters();
      this.filterFlights();
    }).catch(() => {
      // ensure UI still initializes with fallback
      const source = Array.isArray(PROCESSED_FLIGHTS) ? PROCESSED_FLIGHTS : [];
      this.setData({ originalFlights: source, flights: source }, () => {
        this.initFilters();
        this.filterFlights();
      });
    });
  },

  // load flights from cloud with caching and fallback
  async loadFlights(force = false) {
    this.setData({ loading: true, error: false });
    const cacheKey = 'cachedFlights';
    try {
      const cached = wx.getStorageSync(cacheKey) || null;
      const now = Date.now();
      const maxAge = 1000 * 60 * 60; // 1 hour
      if (!force && cached && (now - (cached.fetchedAt || 0) < maxAge) && Array.isArray(cached.flights)) {
        this.setData({ originalFlights: cached.flights, flights: cached.flights, lastUpdated: cached.lastUpdated || this.data.lastUpdated, loading: false });
        return;
      }

      // call cloud function
      const region = this.data.currentRegion || '';
      const page = 1;
      const pageSize = 200; // reasonable upper bound
      const res = await wx.cloud.callFunction({ name: 'getFlights3', data: { region, page, pageSize } });
      if (res && res.result && !res.result.error && Array.isArray(res.result.flights)) {
        const flights = res.result.flights;
        const last = res.result.lastUpdated || new Date().toISOString();
        wx.setStorageSync(cacheKey, { flights, total: res.result.total || flights.length, lastUpdated: last, fetchedAt: Date.now() });
        this.setData({ originalFlights: flights, flights, lastUpdated: last, loading: false });
        return;
      }

      // fallback to processed local data
      throw new Error((res && res.result && res.result.message) || 'invalid cloud response');
    } catch (err) {
      console.warn('loadFlights failed, falling back to local data:', err);
      const source = Array.isArray(PROCESSED_FLIGHTS) ? PROCESSED_FLIGHTS : [];
      this.setData({ originalFlights: source, flights: source, loading: false, error: true });
      throw err;
    }
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
    this.setData({ currentRegion: region, loading: true }, () => {
      // reload cloud data for the new region
      this.loadFlights(true).then(() => {
        this.initFilters();
        this.filterFlights();
      }).catch(() => {
        this.initFilters();
        this.filterFlights();
      });
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
    // pull from cloud
    this.loadFlights(true).then(() => {
      this.initFilters();
      this.filterFlights();
      wx.stopPullDownRefresh();
      this.setData({ loading: false });
    }).catch(() => {
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
