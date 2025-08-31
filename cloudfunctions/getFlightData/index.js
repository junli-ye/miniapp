const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 获取航班数据
exports.main = async (event, context) => {
  try {
    // 获取基础数据
    const [alliancesRes, airlinesRes, flightsRes] = await Promise.all([
      db.collection('alliances').get(),
      db.collection('airlines').get(),
      db.collection('flights').get()
    ])

    const alliances = {}
    alliancesRes.data.forEach(item => {
      alliances[item._id] = item
    })

    const airlines = {}
    airlinesRes.data.forEach(item => {
      airlines[item._id] = item
    })

    // 处理航班数据
    const flights = flightsRes.data.map(flight => {
      // 添加航空公司信息
      const airline = airlines[flight.airlineCode]
      if (!airline) return null

      // 处理代码共享航班
      if (flight.codeshare && flight.codeshare.length) {
        flight.codeshare = flight.codeshare
          .map(share => {
            const codeshareAirline = airlines[share.airlineCode]
            if (!codeshareAirline) return null
            return {
              ...share,
              airline: codeshareAirline
            }
          })
          .filter(Boolean)
      }

      return {
        ...flight,
        airline
      }
    }).filter(Boolean)

    return {
      success: true,
      data: {
        lastUpdated: new Date().toISOString().split('T')[0],
        alliances,
        flights
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
