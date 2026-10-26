# Agricultural feasibility dashboard

`/geoai` now loads `src/pages/LandFeasibility.vue`. The previous `GeoAIService.vue` remains in the repository for comparison/rollback but is not routed. Existing site navigation, authentication pages, opportunities and other route components are unchanged.

The new page consumes `feasibility-1` results from the updated Express router. It never recalculates crop suitability in the browser. If connected to an old backend it asks for a new-format analysis instead of silently displaying conflicting recommendations.

Run `npm ci`, then set `VITE_API_URL=http://127.0.0.1:5019/api` and run `npm run dev -- --host 127.0.0.1 --port 5179 --strictPort` against the isolated backend preview. Production uses the existing API host unless `VITE_API_URL` is explicitly configured. Use the production backend address, never the localhost preview address, for a production build.

`npm run build` is the production compilation check. Satellite tiles and Leaflet load from existing public map providers; a failed map does not prevent coordinate-based analysis. The page includes English, French and Arabic/RTL text, responsive layouts, print styles and a JSON download preserving inputs and assumptions.

Financial fields are explicitly editable scenarios, not automatically sourced market quotations. Crop-specific spacing, timing, costs, yield, prices and water demand must be entered rather than inferred from coordinates. See the backend release guide for model scope, deployment order, security prerequisites and rollback.
