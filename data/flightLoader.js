import { ALLIANCES, AIRLINES, lastUpdated } from './constants';
import { FLIGHTS } from './flightData';

// 处理航班数据
const processFlightData = (flight) => {
  // 添加航空公司完整信息
  const airline = AIRLINES[flight.airlineCode];
  if (!airline) {
    console.warn(`Airline not found: ${flight.airlineCode}`);
    return null;
  }
  flight.airline = airline;

  // 处理代码共享航班
  if (flight.codeshare && flight.codeshare.length) {
    flight.codeshare = flight.codeshare
      .map(share => {
        const codeshareAirline = AIRLINES[share.airlineCode];
        if (!codeshareAirline) {
          console.warn(`Codeshare airline not found: ${share.airlineCode}`);
          return null;
        }
        return {
          ...share,
          airline: codeshareAirline
        };
      })
      .filter(Boolean); // 移除无效的代码共享航班
  }

  return flight;
};

// 导出处理后的数据
export { ALLIANCES, lastUpdated };
export const flights = FLIGHTS.map(processFlightData).filter(Boolean); // 移除无效的航班
