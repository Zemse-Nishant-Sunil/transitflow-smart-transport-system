# Feature Roadmap & Implementation Notes

This document outlines how the new global and intelligence features are scaffolded and next steps for full implementation.

## Priority Work

1. GTFS + GTFS-RT
   - Validate GTFS ingestion (parsing schedules, stops, trips)
   - Store parsed data in a persistent DB (Postgres/PostGIS preferred)
   - Add feed monitoring & failure alerts
   - Integrate with free external services for enrichment (geocoding, weather, exchange rates, carbon intensity) using `backend/services/*` helpers

2. Crowd Prediction
   - Export training datasets from `analyticsService` to train time-series models
   - Create scheduled training jobs and model artifacts
   - Replace heuristic predictor with trained model (TF.js or server-side model)

3. Localization & Currency
   - Add full translations and front-end i18n integration
   - Add currency formatting and conversion via external API

4. Offline Mode
   - Add service worker with Workbox
   - Cache important GTFS static files and last-planned routes

5. Personalized Profiles
   - Add user profiles and preference storage
   - Add recommendations API endpoint and client personalization logic

6. Map Overlays & Live Markers
   - Implement vehicle markers using Socket.io events from `gtfsRealtimeService`
   - Cluster markers and animate movement

7. API & Docs
   - Expand API_DOCUMENTATION.md with examples
   - Add Postman collection and OpenAPI spec

---

For developer tasks, see issues and PR templates in the repository.