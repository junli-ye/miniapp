import { flights as PROCESSED_FLIGHTS, lastUpdated, ALLIANCES } from '../../data/flightLoader';

const REGIONS = [
  { key: 'ASIA', name: '亚洲', nameEn: 'Asia' },
  { key: 'EME', name: '欧洲和中东', nameEn: 'Europe & Middle East' },
  { key: 'NA', name: '美洲', nameEn: 'America' },
  { key: 'OCEANIA', name: '大洋洲', nameEn: 'Oceania' }, // 新增大洋洲
  { key: 'AFRICA', name: '非洲', nameEn: 'Africa' },
  { key: 'HMT', name: '港澳台地区', nameEn: 'Hong Kong/Macau/Taiwan' }
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
    weekdays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], // 新增
    selectedCountry: '',
    selectedAirline: '',
    selectedDays: '',
    loading: false,
    showBackTop: false,
    filterPanelVisible: false, // 筛选面板显示状态
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
    
    // 原有的班期数据
    const originalDays = unique(originalFlights.map(f => (f.schedule && f.schedule.days) || '').filter(Boolean));
    
    // 根据语言设置星期选项
    const weekdays = lang === 'zh' ? 
      ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] :
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // 合并原有班期和星期选项
    const allDays = [
      lang === 'zh' ? '全部' : 'All',
      ...weekdays,        // 添加多语言星期选项
      ...originalDays     // 保留原有班期（如"135", "每天"等）
    ];

    this.setData({
      countryList: [lang === 'zh' ? '全部' : 'All', ...countries],
      airlineList: [lang === 'zh' ? '全部' : 'All', ...airlines],
      daysList: allDays,  // 使用合并后的列表
      weekdays: weekdays  // 更新 weekdays 以供匹配逻辑使用
    });
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
        const airlineMatch = !selectedAirline || getText(f.airline, 'name', lang) === selectedAirlineair;
        
        // 改进的班期匹配逻辑
        let daysMatch = true;
        if (selectedDays) {
          const scheduleStr = (f.schedule && f.schedule.days) || '';
          daysMatch = this.matchesSchedule(scheduleStr, selectedDays);
        }
        
        return countryMatch && airlineMatch && daysMatch;
      });
    }

    filtered.sort((a, b) => ((a.schedule && a.schedule.depTimeLocal) || '').localeCompare((b.schedule && b.schedule.depTimeLocal) || ''));

    this.setData({ flights: filtered, loading: false });
  },

  // 显示联系信息弹窗
  showContactInfo() {
    const { lang } = this.data;
    wx.showModal({
      title: lang === 'zh' ? '联系我们' : 'Contact Us',
      content: lang === 'zh' ? 
        '邮箱：me@junliye.fr\n\n点击确定复制邮箱地址' : 
        'Email: me@junliye.fr\n\nTap OK to copy email address',
      confirmText: lang === 'zh' ? '复制邮箱' : 'Copy Email',
      cancelText: lang === 'zh' ? '取消' : 'Cancel',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: 'me@junliye.fr',
            success: () => {
              wx.showToast({
                title: lang === 'zh' ? '邮箱已复制' : 'Email copied',
                icon: 'success',
                duration: 2000
              });
            }
          });
        }
      }
    });
  },

  // 新增班期匹配方法
  matchesSchedule(scheduleStr, selectedDays) {
    if (!scheduleStr || !selectedDays) return true;
    
    // 如果选择的是原有的班期格式（如"135", "每天"），直接匹配
    if (scheduleStr === selectedDays) {
      return true;
    }
    
    // 支持中英文星期映射
    const weekdayMap = {
      // 中文映射
      '周一': '1', '周二': '2', '周三': '3', '周四': '4', 
      '周五': '5', '周六': '6', '周日': '7',
      // 英文映射
      'Monday': '1', 'Tuesday': '2', 'Wednesday': '3', 'Thursday': '4',
      'Friday': '5', 'Saturday': '6', 'Sunday': '7'
    };
    
    const targetNum = weekdayMap[selectedDays];
    if (!targetNum) {
      return false; // 未知的选择
    }
    
    // 处理常见的班期格式
    if (scheduleStr === '每天' || scheduleStr === '7' || scheduleStr === '1234567') {
      return true; // 每天运行的航班匹配所有星期
    }
    
    // 检查数字格式班期（如 "135" 表示周一三五）
    return scheduleStr.includes(targetNum);
  }
});
