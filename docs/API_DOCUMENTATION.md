# API Documentation

## Feeds

POST /api/feeds/upload/:cityId
- Upload a GTFS zip file for a city.

POST /api/feeds/register-rt/:cityId
- Register a GTFS-RT feed URL for the given city.

GET /api/feeds/list
- Returns registered city feeds.

## Prediction

GET /api/prediction/station?station=<name>&hour=<0-23>
- Returns a crowd prediction for a station.

## Carbon

POST /api/carbon/estimate
- Body: { route: { segments: [{ mode, distance }] } }
- Returns estimated CO₂ per route.

## Localization

GET /api/localization/detect?country=IN
- Returns language & currency suggestions for the given ISO country code.

## Real-time
Socket.io events:
- 'disruption_alert' - disruption payload
- 'crowd_update' - crowd info per segment
- 'position_update' - position updates
- 'gtfs_vehicle_position' - vehicle positions from GTFS-RT

## External Services (recommended)

- **Reverse Geocoding:** Nominatim (OpenStreetMap) — used for reverse geocoding & country detection. Config: `NOMINATIM_URL` (optional)
- **IP Location:** ipapi.co — used for auto-detect fallback. Config: `IPAPI_URL`
- **Weather:** OpenWeatherMap — set `OPENWEATHER_API_KEY` to enable weather-based disruption signals.
- **Exchange Rates:** exchangerate.host — `EXCHANGERATE_API_URL` (defaults to public host)
- **Carbon Intensity:** CO2Signal — `CO2SIGNAL_API_KEY` (optional)

Add these values to your `.env` (or environment) to enable integrations used by the backend services in `backend/services/`.

## External Helper Endpoints

GET /api/external/reverse?lat=<>&lon=<> - Reverse geocode via Nominatim
GET /api/external/weather?lat=<>&lon=<> - Current weather (OpenWeatherMap)
GET /api/external/convert?amount=<>&from=<>&to=<> - Currency conversion via exchangerate.host
GET /api/external/ip?ip=<> - Lookup IP -> location via ipapi.co

