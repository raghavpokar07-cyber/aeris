# AERIS — Intelligent Air Quality Companion

Express/MongoDB backend and browser preview for pollution-aware daily planning.

## Repository structure

- `backend/` — Express REST API, MongoDB models, Open-Meteo integration, and configurable OpenRouter AI

## Backend setup

1. Install Node.js 20+.
2. Create a MongoDB Atlas cluster or run MongoDB locally.
3. In Atlas, create a database user and allow access only from your backend host.
4. Copy `backend/.env.example` to `backend/.env`.
5. Set `MONGODB_URI` and a strong random `JWT_SECRET`.
6. Optionally set `AI_API_KEY`, `AI_MODEL`, and `AI_PROVIDER=openrouter`.
7. Run:

```powershell
cd backend
npm install
npm test
npm start
```

The API listens on `http://localhost:4000`. The health endpoint is `GET /api/health`.
The health response reports the live MongoDB state, for example `{"status":"ok","database":"connected"}`.

## Deploy to Vercel and Render

- Import this repository into Vercel as a static site from the repository root. `vercel.json` serves `preview.html` at `/` and proxies `/api/*` to Render.
- Create a Render Blueprint from the repository root; `render.yaml` configures the backend service and health check.
- Set the Render `MONGODB_URI` to the production MongoDB connection string and configure the required CORS origin and Google OAuth client ID. Add AI, WAQI, and OpenAQ credentials in Render's environment settings as needed. Do not commit `backend/.env`.
- Add the deployed Vercel origin to the Google OAuth client's authorized JavaScript origins. Keep any credentials in the hosting providers' environment-variable settings, not in GitHub.
- The Render free plan may sleep when idle, so the first API request after inactivity can take longer.

## Browser preview

The interactive browser preview uses the API and MongoDB-backed account. It includes a world AQI map alongside the hourly Air Trends chart, and combines the daily plan with home-protection actions:

```powershell
cd "C:\Users\Raghav\OneDrive\Desktop\URBAN AI"
python -m http.server 5500
```

Open `http://127.0.0.1:5500/preview.html`. Create an account or sign in to use the saved Plan + Home checklist, AERIS conversations, household profile, and impact tracker. The dashboard includes city search, optional browser geolocation, live AQI, current weather, and a speedometer whose categories match the AQI scale. Air Trends combines a world map of live model-grid estimates with the latest 24 hourly AQI, PM2.5, or PM10 readings. Selecting a map point or city updates the live reading and chart. AQI-matched character illustrations use the Good, Moderate, Poor, Very Poor, and Severe thresholds. Selected cities are saved to the signed-in profile; without an account, the browser remembers the city locally.

Plan + Home combines the pollution-aware daily plan and indoor-protection checklist. Impact shows completion counts for both; checklist completion is not presented as measured indoor-air improvement.

Data persistence:

- Daily plan, daily completed actions, and indoor checklist progress: `/api/plans/*`
- Family and lifestyle preferences: `/api/profile`
- Assistant history: `/api/ai/chat` and `/api/conversations/*`
- Impact records: `/api/impact/*`
- Authentication session: JWT stored in browser local storage
- City search: `GET /api/air-quality/search-location?q=<city>` (OpenStreetMap Nominatim/Overpass with Open-Meteo fallback; state searches include city options where available)
- World AQI map: `GET /api/air-quality/map` (multi-location Open-Meteo model-grid estimates)
- Current weather: `GET /api/weather/current?lat=<latitude>&lon=<longitude>` (Open-Meteo)
- Hourly air history: `GET /api/air-quality/history?lat=<latitude>&lon=<longitude>` (Open-Meteo)

## Tests

```powershell
cd backend
npm test
```

## Live data and limits

- Real current/forecast air-quality and weather data comes from Open-Meteo. The world map samples 17 named cities; these are model-grid estimates, not official station readings or a continuous pollution heatmap.
- OpenStreetMap supplies map tiles and geocoding; map tiles are attributed in-app. Google Places/Maps APIs are not configured and no Google API key is required.
- City search returns the full available city/district/state/country hierarchy. A state query can return major cities in that region plus the state-level result; search for a specific city for city-level AQI.
- Hourly trends use provider model-grid values; missing readings remain missing and are not interpolated.
- No fake AQI or pollutant values are used.
- AQI-category companion images are supplied by the user. An unused Open Peeps asset is CC0; see `assets/OPEN_PEEPS_LICENSE.txt`.
- OpenRouter is optional; when no AI key is configured, the backend supplies explicit rule-based fallback guidance rather than a fabricated AI answer.
- Nearby stations and route-level pollution require provider support and are shown as unavailable where not provided.
- Impact records are estimates and are labeled as such. Plan and home progress counts completed actions; the app has no indoor AQI sensor and does not infer a pollution reduction from checklist completion.
- Browser preview CORS origins are set in `backend/.env`; the default project configuration allows ports `5500` on `localhost` and `127.0.0.1`.
