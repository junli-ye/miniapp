// Prefer generated module; otherwise fall back to the editable JSON source.
let FLIGHTS_INTERNAL = [];
try {
  // Try generated file first (produced by scripts/json-to-js.js)
  // eslint-disable-next-line global-require
  const gen = require('./flightData.generated');
  FLIGHTS_INTERNAL = gen && gen.FLIGHTS ? gen.FLIGHTS : [];
} catch (e) {
  try {
    // eslint-disable-next-line global-require
    FLIGHTS_INTERNAL = require('./flights.json');
  } catch (e2) {
    console.warn('No flight data found in generated module or flights.json');
    FLIGHTS_INTERNAL = [];
  }
}

export const FLIGHTS = FLIGHTS_INTERNAL;
