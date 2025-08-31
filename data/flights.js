// 从数据加载器导入并直接导出
export * from './flightLoader';

// 获取航司所属联盟
const getAirlineAlliance = (code) => {
  const starAlliance = ['CA', 'NH', 'OZ', 'LH', 'UA', 'ET', 'TG', 'SQ'];
  const skyteam = ['MU', 'AF', 'KL', 'KE'];
  const oneworld = ['AA', 'BA', 'CX', 'JL'];
  
  if (starAlliance.includes(code)) return 'STAR';
  if (skyteam.includes(code)) return 'SKYTEAM';
  if (oneworld.includes(code)) return 'ONEWORLD';
  return null;
};

// 处理航班数据，添加联盟信息
const processFlightData = (flight) => {
  // 处理主航班联盟信息
  const alliance = getAirlineAlliance(flight.airline.code);
  if (alliance) {
    flight.airline.alliance = alliance;
  }
  
  // 处理代码共享航班联盟信息
  if (flight.codeshare && flight.codeshare.length) {
    flight.codeshare = flight.codeshare.map(share => {
      const shareAlliance = getAirlineAlliance(share.airline.code);
      if (shareAlliance) {
        share.airline.alliance = shareAlliance;
      }
      return share;
    });
  }
  
  return flight;
};

export const flights = [
  // 港澳台 HMT
  {
    id: 'TFU-3U8501-HKG',
    region: 'HMT',
    flightNo: '3U8501',
    airline: { code: '3U', nameZh: '四川航空', nameEn: 'Sichuan Airlines', logo: '/images/airlines/3U.png' },
    destination: { iata: 'HKG', airportZh: '香港国际', countryZh: '中国香港', airportEn: 'Hong Kong Intl', countryEn: 'Hong Kong SAR' },
    schedule: { depTimeLocal: '08:30', days: '每天' },
    acType: 'A320neo',
    remarks: '正在执行',
    codeshare: [
      {
        flightNo: 'CA451',
        airline: { code: 'CA', nameZh: '中国国际航空', nameEn: 'Air China', logo: '/images/airlines/CA.png' }
      },
      {
        flightNo: 'LH763',
        airline: { code: 'LH', nameZh: '汉莎航空', nameEn: 'Lufthansa', logo: '/images/airlines/CA.png' }
      }
    ],
    country: { zh: '中国香港', en: 'Hong Kong SAR' }
  },
  {
    id: 'TFU-CA451-TPE',
    region: 'HMT',
    flightNo: 'CA451',
    airline: { code: 'CA', nameZh: '中国国际航空', nameEn: 'Air China', logo: '/images/airlines/CA.png' },
    destination: { iata: 'TPE', airportZh: '桃园国际', countryZh: '中国台湾', airportEn: 'Taoyuan Intl', countryEn: 'Taiwan' },
    schedule: { depTimeLocal: '09:45', days: '246' },
    acType: 'A321',
    remarks: '季节性',
    codeshare: [],
    country: { zh: '中国台湾', en: 'Taiwan' }
  },
  // 欧洲和中东 EME
  {
    id: 'TFU-LH8789-FRA',
    region: 'EME',
    flightNo: 'LH8789',
    airline: { code: 'LH', nameZh: '汉莎航空', nameEn: 'Lufthansa', logo: '/images/LH.png' },
    destination: { iata: 'FRA', airportZh: '法兰克福', countryZh: '德国', airportEn: 'Frankfurt', countryEn: 'Germany' },
    schedule: { depTimeLocal: '01:30', days: '357' },
    acType: 'A350-900',
    remarks: '计划',
    codeshare: [],
    country: { zh: '德国', en: 'Germany' }
  },
  {
    id: 'TFU-TK7233-IST',
    region: 'EME',
    flightNo: 'TK7233',
    airline: { code: 'TK', nameZh: '土耳其航空', nameEn: 'Turkish Airlines', logo: '/images/TK.png' },
    destination: { iata: 'IST', airportZh: '伊斯坦布尔', countryZh: '土耳其', airportEn: 'Istanbul', countryEn: 'Turkey' },
    schedule: { depTimeLocal: '23:45', days: '246' },
    acType: 'B787-9',
    remarks: '计划',
    codeshare: [],
    country: { zh: '土耳其', en: 'Turkey' }
  },
  // 亚洲 ASIA
  {
    id: 'TFU-NH823-HND',
    region: 'ASIA',
    flightNo: 'NH823',
    airline: { code: 'NH', nameZh: '全日空', nameEn: 'ANA', logo: '/images/NH.png' },
    destination: { iata: 'HND', airportZh: '东京羽田', countryZh: '日本', airportEn: 'Tokyo Haneda', countryEn: 'Japan' },
    schedule: { depTimeLocal: '09:15', days: '每天' },
    acType: 'B787-9',
    remarks: '正在执行',
    codeshare: [
      {
        flightNo: 'MU5746',
        airline: { code: 'MU', nameZh: '东方航空', nameEn: 'China Eastern', logo: '../images/airlines/MU.png' }
      },
      {
        flightNo: 'JL5064',
        airline: { code: 'JL', nameZh: '日本航空', nameEn: 'Japan Airlines', logo: '../images/airlines/JL.png' }
      },
      {
        flightNo: 'OZ6742',
        airline: { code: 'OZ', nameZh: '韩亚航空', nameEn: 'Asiana Airlines', logo: '../images/airlines/OZ.png' }
      }
    ],
    country: { zh: '日本', en: 'Japan' }
  },
  {
    id: 'TFU-OZ334-ICN',
    region: 'ASIA',
    flightNo: 'OZ334',
    airline: { code: 'OZ', nameZh: '韩亚航空', nameEn: 'Asiana Airlines', logo: '/images/OZ.png' },
    destination: { iata: 'ICN', airportZh: '首尔仁川', countryZh: '韩国', airportEn: 'Seoul Incheon', countryEn: 'South Korea' },
    schedule: { depTimeLocal: '10:30', days: '1234567' },
    acType: 'A321',
    remarks: '正在执行',
    codeshare: [],
    country: { zh: '韩国', en: 'South Korea' }
  },
  {
    id: 'TFU-SQ879-SIN',
    region: 'ASIA',
    flightNo: 'SQ879',
    airline: { code: 'SQ', nameZh: '新加坡航空', nameEn: 'Singapore Airlines', logo: '/images/SQ.png' },
    destination: { iata: 'SIN', airportZh: '樟宜', countryZh: '新加坡', airportEn: 'Changi', countryEn: 'Singapore' },
    schedule: { depTimeLocal: '00:30', days: '357' },
    acType: 'B787-10',
    remarks: '计划',
    codeshare: [],
    country: { zh: '新加坡', en: 'Singapore' }
  },
  // 美洲 NA
  {
    id: 'TFU-UA878-SFO',
    region: 'NA',
    flightNo: 'UA878',
    airline: { code: 'UA', nameZh: '美联航', nameEn: 'United Airlines', logo: '../images/airlines/UA.png' },
    destination: { iata: 'SFO', airportZh: '旧金山', countryZh: '美国', airportEn: 'San Francisco', countryEn: 'United States' },
    schedule: { depTimeLocal: '13:45', days: '246' },
    acType: 'B787-9',
    remarks: '计划',
    codeshare: [
      {
        flightNo: 'SQ2365',
        airline: { code: 'SQ', nameZh: '新加坡航空', nameEn: 'Singapore Airlines', logo: '../images/airlines/SQ.png' }
      },
      {
        flightNo: 'LH7721',
        airline: { code: 'LH', nameZh: '汉莎航空', nameEn: 'Lufthansa', logo: '../images/airlines/LH.png' }
      }
    ],
    country: { zh: '美国', en: 'United States' }
  },
  // 非洲 AFRICA
  {
    id: 'TFU-ET685-ADD',
    region: 'AFRICA',
    flightNo: 'ET685',
    airline: { code: 'ET', nameZh: '埃塞俄比亚航空', nameEn: 'Ethiopian Airlines', logo: '/images/ET.png' },
    destination: { iata: 'ADD', airportZh: '亚的斯亚贝巴', countryZh: '埃塞俄比亚', airportEn: 'Addis Ababa', countryEn: 'Ethiopia' },
    schedule: { depTimeLocal: '23:55', days: '24' },
    acType: 'B787-8',
    remarks: '季节性',
    codeshare: [],
    country: { zh: '埃塞俄比亚', en: 'Ethiopia' }
  }
].map(processFlightData);
