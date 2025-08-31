import { FLIGHTS } from './flightData';

// 获取所有航班数据
export function getAllFlights() {
  return FLIGHTS;
}

// 按地区获取航班数据
export function getFlightsByRegion(region) {
  return FLIGHTS.filter(flight => flight.region === region);
}

// 按航空公司代码获取航班数据
export function getFlightsByAirline(airlineCode) {
  return FLIGHTS.filter(flight => flight.airlineCode === airlineCode);
}

// 按目的地获取航班数据
export function getFlightsByDestination(iata) {
  return FLIGHTS.filter(flight => flight.destination.iata === iata);
}

// 获取独特的目的地列表
export function getUniqueDestinations() {
  return Array.from(new Set(FLIGHTS.map(flight => flight.destination.iata)));
}

// 获取所有在运营的航班数量
export function getActiveFlightsCount() {
  return FLIGHTS.filter(flight => flight.remarks === '正在执行').length;
}

// 获取按地区分类的航班统计
export function getFlightsByRegionStats() {
  const stats = {};
  FLIGHTS.forEach(flight => {
    if (!stats[flight.region]) {
      stats[flight.region] = 0;
    }
    stats[flight.region]++;
  });
  return stats;
}
