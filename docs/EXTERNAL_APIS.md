# Recommended Free External APIs

This project uses and recommends the following *free* (or freemium) APIs for core functionality. Each entry includes the use case, a short note about limits, and where to configure it in the project.

## Geocoding / Reverse Geocoding
- Service: **Nominatim (OpenStreetMap)** or **Photon**
- Use case: Reverse-geocode coordinates to a human-readable address and detect country codes for localization and currency selection.
- Notes: Both services are free. Public instances have rate limits — self-host or use a paid provider for production scale.
- Where to configure: frontend `CitySelector` uses reverse geocoding; backend `geocodeService` (see `backend/services/geocodeService.js`).

## Weather
- Service: **Open-Meteo** (BEST CHOICE)
  - No API key, free for reasonable use, supports current/hourly/daily/historical forecasts.
  - Why it’s perfect: No signup, widely used in open-source and academic projects, data sources include ECMWF and NOAA.
  - Where to configure: `backend/services/openMeteoService.js` and endpoint `GET /api/external/weather-open-meteo?lat=&lon=`.

## Routing / Maps / Traffic
- Service: **OSRM** (Open Source Routing Machine) — primary free choice
  - Routing for car/bike/walk. No key required and based on OpenStreetMap data.
  - Example: `https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}`
  - Where to configure: `backend/services/osrmService.js` and endpoint `GET /api/external/route/osrm?sLat=&sLon=&eLat=&eLon=`.

- Service: **GraphHopper public demo** (alternate)
  - Free demo endpoint (rate-limited). Good for testing routing where you cannot or won't self-host OSRM.
  - Where to configure: `backend/services/graphhopperService.js` and endpoint `GET /api/external/route/graphhopper?sLat=&sLon=&eLat=&eLon=`.

- Note on traffic data: Traffic (live speeds) is not truly free — licensed datasets such as TomTom/Here/Google are required for accurate live traffic. For hackathons or prototypes, simulate traffic using historical averages or simple multipliers on routing durations.

## Maps & Tiles
- Service: **OpenStreetMap tiles** (tile servers like tile.openstreetmap.org)
- Use case: Map tiles displayed in the frontend (`MapOverlay` uses OSM tiles).
- Notes: Respect tile usage policy; consider a tile provider or self-hosting for production.

## Currency Exchange
- Service: **Frankfurter.app** (BEST)
  - No key required; uses European Central Bank rates; stable and free.
  - Example: `https://api.frankfurter.app/latest?from=USD&to=INR`
  - Where to configure: `backend/services/frankfurterService.js` and endpoint `GET /api/external/convert/frankfurter`.

## IP → Location
- Service: **ipwho.is** (STRONGLY RECOMMENDED)
  - No key; returns country, city, ISP, lat/lon. Example: `https://ipwho.is/`
  - Alternate: `https://freegeoip.app/json/`
  - Where to configure: `backend/services/ipwhoService.js` and endpoint `GET /api/external/ipwho`.

## CO₂ / Grid Carbon
- Service: **ElectricityMap** (public endpoints where available)
  - Country/region-level carbon intensity where available. Some regions have open endpoints; others may require API keys.
  - Where to configure: `backend/services/electricityMapService.js` and endpoint `GET /api/external/co2/electricitymap?zone=`.

- Service: **Our World in Data (OWID)** (STATIC + RELIABLE)
  - Country-level CO₂ datasets (CSV / JSON) suitable for static or aggregated reporting.
  - Where to configure: `backend/services/owidService.js` and endpoint `GET /api/external/co2/owid?country=`.

## Public Transport (GTFS / GTFS-RT)
- Service: **OpenMobilityData / TransitFeeds**
  - Aggregated GTFS static feeds worldwide; many feeds are public and free.
  - Use case: Upload GTFS static packages or register GTFS-RT feed URLs via existing feed endpoints.

## Reverse Geocoding
- Service: **Nominatim (still the best)** or **Photon**
  - Nominatim is free but has usage policy; include a `User-Agent` header or email and respect rate limits.
  - Photon is OSM-based and somewhat less strict: `https://photon.komoot.io/reverse`
  - Where to configure: `backend/services/geocodeService.js` and frontend `CitySelector`.

---

**Short answer:** Yes — all of the services you listed (Open-Meteo, OSRM, GraphHopper demo, Frankfurter, ipwho.is, ElectricityMap/OWID, OpenMobilityData, Nominatim/Photon) are fully free to use for prototyping. For production, prefer self-hosting (OSRM, tiles) or paid tiers for higher volume and reliable SLAs. Please respect per-provider usage policies (Nominatim requires `User-Agent`/contact info).

## Maps & Tiles
- Service: **OpenStreetMap tiles** (tile servers like tile.openstreetmap.org)
- Use case: Map tiles displayed in the frontend (we already use OSM tiles in `MapOverlay`).
- Notes: Respect tile usage policy; consider a tile provider or self-hosting for production.

## Currency
- Service: **Frankfurter.app** (free)
- Use case: Convert fares or display local currency amounts.
- Where to configure: `backend/services/frankfurterService.js` and endpoint `GET /api/external/convert/frankfurter`.

## IP Location
- Service: **ipwho.is** (free)
- Use case: IP-based location auto-detection fallback.
- Where to configure: `backend/services/ipwhoService.js` and endpoint `GET /api/external/ipwho`.

## CO₂ / Grid Carbon
- Service: **Our World in Data (OWID)** and optionally **ElectricityMap** (some features may require keys)
- Use case: Country-level CO₂ and emissions data to refine carbon footprint estimates.
- Where to configure: `backend/services/owidService.js` and endpoint `GET /api/external/co2/owid?country=`.

## Transport Feeds
- Service: **OpenMobilityData (GTFS)** — aggregate of GTFS sources and dataset feeds
- Use case: Source GTFS static feeds; register or upload GTFS packages with our existing feed upload endpoints.

---

**Short answer:** Yes — all of the services you listed are free to use for prototyping and many are fully free even for production with rate limits/usage policies considered. For production reliability, self-host (OSRM, tiles), monitor usage, and cache results server-side.

## IP -> Location
- Service: **ipapi.co** (free tier) or **ipinfo.io**
- Use case: Quick city/country detection for auto-detection fallback when geolocation isn't available.
- Where to configure: backend `localizationService` or frontend `CitySelector`.

## Routing / Traffic
- Service: **OpenRouteService** (free API key) or **Mapbox** (free tier)
- Use case: Blend live route travel time with traffic for dynamic ETAs and multimodal routing where GTFS lacks coverage.
- Notes: OpenRouteService has generous free tier for prototyping.
- Where to configure: backend route cost/time blending (e.g., `services/routeIntegrator.js`) and frontend map overlays.

## Weather (Disruption Signals)
- Service: **OpenWeatherMap** (free tier)
- Use case: Detect severe weather to inform disruption alerts (rain, storms, etc.).
- Where to configure: backend `services/weatherService.js`.
- Env: `OPENWEATHER_API_KEY`

## Exchange Rates / Currency
- Service: **exchangerate.host** (free)
- Use case: Convert fares to local currency and show currency symbol based on user location.
- Where to configure: backend `services/exchangeRateService.js` and frontend currency formatting.

## Carbon Intensity / Grid Carbon Data
- Service: **CO2Signal** or country-specific APIs (e.g., `carbonintensity.org.uk` for UK)
- Use case: Provide accurate carbon impact by considering local grid intensity when reporting CO₂ savings.
- Where to configure: backend `services/carbonIntensityService.js`.
- Env (optional): `CO2SIGNAL_API_KEY`

## Transit Feeds & Agency APIs
- Examples:
  - **Transport for London (TfL) API** — Free (register for a key) — GTFS and real-time endpoints
  - **MTA (NYC)** — GTFS/GTFS-RT feeds (some require registration)
  - **Indian Railways API (IRCTC/Setu)** — Registration required
- Use case: Register GTFS-RT endpoints in the Back-end (`POST /api/feeds/register-rt/:cityId`) or upload GTFS zip files.

## Notes on Production
- Most public/free endpoints have rate limits. Consider caching (NodeCache / Redis), request backoff, and obtaining production API keys or self-hosted solutions where necessary.

---

## Example environment variables (add to `.env`)
```
OPENWEATHER_API_KEY=your_openweather_key
EXCHANGERATE_API_URL=https://api.exchangerate.host
IPAPI_URL=https://ipapi.co
CO2SIGNAL_API_KEY=your_co2signal_key
OPENROUTESERVICE_API_KEY=your_openrouteservice_key
```

For quick integration examples see `backend/services/*`.

---

## Quick curl examples

Reverse geocode (backend proxy):
```bash
curl "http://localhost:5000/api/external/reverse?lat=19.0760&lon=72.8777"
```

Weather lookup (backend proxy):
```bash
curl "http://localhost:5000/api/external/weather?lat=19.0760&lon=72.8777"
```

Currency conversion (backend proxy):
```bash
curl "http://localhost:5000/api/external/convert?amount=100&from=USD&to=INR"
```

IP lookup (backend proxy):
```bash
curl "http://localhost:5000/api/external/ip"
```

Note: These examples use the local backend proxy endpoints so your front-end does not need to hold API keys directly. For high-volume production, consider server-side caching and rate-limiting.
