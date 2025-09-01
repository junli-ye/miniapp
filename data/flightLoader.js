import { ALLIANCES, AIRLINES, lastUpdated } from './constants';
import { FLIGHTS } from './flightData';

// 处理航班数据，提供容错并标准化结构
const processFlightData = (flightRaw) => {
  const flight = Object.assign({}, flightRaw); // shallow copy

  // Ensure nested shapes exist
  flight.destination = flight.destination || { iata: flight.destinationIATA || '', airportZh: flight.destinationAirportZh || '', airportEn: flight.destinationAirportEn || '' };
  flight.schedule = flight.schedule || { depTimeLocal: flight.depTimeLocal || '', days: flight.days || '' };
  flight.country = flight.country || { zh: flight.countryZh || '', en: flight.countryEn || '' };

  // Attach airline info with fallback
  const airlineInfo = AIRLINES[flight.airlineCode];
  if (airlineInfo) {
    flight.airline = airlineInfo;
  } else {
    console.warn(`Airline not found: ${flight.airlineCode}`);
    flight.airline = { code: flight.airlineCode || '', nameZh: flight.airlineCode || '', nameEn: flight.airlineCode || '', logo: '' };
  }

  // Codeshare processing with fallback
  if (Array.isArray(flight.codeshare)) {
    flight.codeshare = flight.codeshare.map(cs => {
      const csAirline = AIRLINES[cs.airlineCode] || { code: cs.airlineCode || '', nameZh: cs.airlineCode || '', nameEn: cs.airlineCode || '', logo: '' };
      return { ...cs, airline: csAirline };
    });
  } else {
    flight.codeshare = [];
  }

  return flight;
};

// 导出处理后的数据
export { ALLIANCES, lastUpdated };
export const flights = Array.isArray(FLIGHTS) ? FLIGHTS.map(processFlightData).filter(Boolean) : []; // 移除无效的航班
