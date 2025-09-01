const fs = require('fs');
const path = require('path');

const input = path.join(__dirname, '..', 'data', 'flights.json');
const output = path.join(__dirname, '..', 'data', 'flightData.generated.js');

const data = JSON.parse(fs.readFileSync(input, 'utf8'));
const js = `// Generated from data/flights.json - do not edit by hand\nexport const FLIGHTS = ${JSON.stringify(data, null, 2)};\n`;
fs.writeFileSync(output, js, 'utf8');
console.log('Generated', output);
