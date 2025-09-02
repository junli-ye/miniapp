# Mini Flight Schedule (WeChat Mini Program)

Simple WeChat Mini Program that displays flight schedules. Data is authored in JSON and served to the mini program via a Cloud Function (recommended) with a local JS fallback for offline or build-time use.

## Project layout (important files)
- `data/flights.json` — editable source of flight data (single source of truth).
- `data/flightData.generated.js` — generated runtime module (if used).
- `data/flightLoader.js` — normalizes/enriches flight objects for local fallback.
- `data/constants.js` — airlines / alliances metadata and `lastUpdated`.
- `scripts/json-to-js.js` — generator script (JSON → JS module) used in older workflow.
- `cloudfunctions/getFlights3/index.js` — cloud function that queries `flights` and `airlines` collections and returns enriched results.
- `pages/index/index.js` — main page; now loads data via cloud function with caching and local fallback.

## Quick start (development)
Prerequisites: Node.js (for scripts) and WeChat Developer Tool.

1. Open this project in WeChat Developer Tool.
2. Enable Cloud Development and select your environment (envId).
3. Deploy cloud functions:

```bash
# In WeChat DevTools: right-click each cloudfunctions/* folder -> Upload and Deploy
```

4. Ensure `app.js` initializes `wx.cloud.init()` (this project already adds it).
5. Run the mini program in the DevTools. The main page will call `getFlights3` to load data.

## Updating flight data
Preferred workflow (cloud-backed, recommended):

1. Edit `data/flights.json` locally.
2. Import to Cloud Database (two options):
   - Use cloud control panel -> Database -> Import JSON to `flights` collection. OR
   - Use a provided `importFlights` cloud function (if present) and call it with `data` payload.
3. Test `getFlights3` in cloud functions test panel to confirm results.
4. In the mini program, trigger a pull-to-refresh to fetch updated data, or clear local cache (cachedFlights) to force refresh.

Optional local-only workflow (if you prefer generated module):
1. Run the generator script (if present) to produce `data/flightData.generated.js` from `data/flights.json`.
```bash
node scripts/json-to-js.js
```
2. Recompile in DevTools and preview.

## Cloud function contract
- Name: `getFlights3`
- Input: `{ region?: string, page?: number, pageSize?: number }`
- Output: `{ flights: Array, total: number, page: number, pageSize: number, lastUpdated: ISOString }` or `{ error: true, message: '...' }`

## Troubleshooting
- Error `Cannot find module 'wx-server-sdk'`: do NOT add `package.json` or `node_modules` into cloud function folder. The platform provides `wx-server-sdk`. If you see this:
  - Make sure you deployed the function to the cloud (not running local debug).
  - Use the cloud control panel test runner to verify. If control panel also fails, contact platform support.
- Error `Cloud API isn't enabled, please call wx.cloud.init first`: ensure `wx.cloud.init()` is called in `app.js` (already configured here).
- If flights don't appear: check Cloud DB `flights` collection in console; ensure `airlineCode` values match `airlines` collection codes.

## Next steps (recommended)
- Add a small `importFlights` cloud function for one-click uploads from `flights.json`.
- Add a `scripts/validate-data.js` to validate `flights.json` before import.
- Add CI step to run validation and optionally import to Cloud DB or generate `flightData.generated.js`.

## Contact / notes
If you want, I can: add `importFlights` and `validate-data` scripts, or wire CI (GitHub Actions) to automate validation and data deployment.
