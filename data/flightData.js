// 航班数据
export const FLIGHTS = [
  // 港澳台 HMT
  {
    id: 'TFU-3U8501-HKG',
    region: 'HMT',
    flightNo: '3U8501',
    airlineCode: '3U',
    destination: {
      iata: 'HKG',
      airportZh: '香港国际',
      airportEn: 'Hong Kong Intl'
    },
    schedule: {
      depTimeLocal: '08:30',
      days: '每天'
    },
    acType: 'A320neo',
    remarks: '正在执行',
    codeshare: [
      {
        flightNo: 'CA451',
        airlineCode: 'CA'
      },
      {
        flightNo: 'LH763',
        airlineCode: 'LH'
      }
    ],
    country: {
      zh: '中国香港',
      en: 'Hong Kong SAR'
    }
  },
  // 亚洲 ASIA
  {
    id: 'TFU-NH823-HND',
    region: 'ASIA',
    flightNo: 'NH823',
    airlineCode: 'NH',
    destination: {
      iata: 'HND',
      airportZh: '东京羽田',
      airportEn: 'Tokyo Haneda'
    },
    schedule: {
      depTimeLocal: '09:15',
      days: '每天'
    },
    acType: 'B787-9',
    remarks: '正在执行',
    codeshare: [
      {
        flightNo: 'MU5746',
        airlineCode: 'MU'
      },
      {
        flightNo: 'OZ6742',
        airlineCode: 'OZ'
      }
    ],
    country: {
      zh: '日本',
      en: 'Japan'
    }
  }
];
