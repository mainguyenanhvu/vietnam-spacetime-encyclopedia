# Research — Phân tích 21 repos của github.com/lqtue (2026-07-17)

Profile: data journalist/GIS dev (VnExpress Spotlight). Repos giá trị nhất:

## LacaProvinceMap ⭐ (relevance 3/3) — ĐÃ DÙNG
- `new.geojson`: 34 MultiPolygon (~112 KB), props: Tỉnh thành mới/cũ (crosswalk 63→34!), TT hành chính, GRDP 2024, Thu ngân sách 2024, Diện tích, Dân số, ĐVHC cấp xã.
- `old.geojson`: 63 Polygon (~130 KB), cùng schema.
- Raw: `https://raw.githubusercontent.com/lqtue/LacaProvinceMap/main/{new,old}.geojson`
- ⚠️ **KHÔNG có Hoàng Sa/Trường Sa** → dự án đã tự ghép từ Free-GIS-Data (script `merge_islands.mjs`).
- ⚠️ **Không LICENSE, không provenance** → citation bắt buộc + cần xin phép chính thức (pending); plan B: dựng lại từ OSM (ODbL).

## phuongnao (3/3 — pattern UX)
- Leaflet SPA tra cứu phường/xã sau sáp nhập theo tên hoặc GPS; boundaries từ OSM (ODbL). Không license → chỉ mô phỏng pattern, không copy code.

## historical_maps / VMA (3/3 — pattern UX)
- lqtue.github.io/VMA: overlay bản đồ cổ Sài Gòn georeferenced + **opacity slider** — đúng pattern "không gian–thời gian" cần cho Phase 5. Source không public.

## 2025Typhoon (2/3 — dữ liệu bão)
- `typhoon_landfalls.csv` (từ 1945), `historical_tracks.geojson` — nguồn IBTrACS/NOAA (public domain) → dùng được cho layer bão, cite NOAA + repo. ❌ Tránh các file ranh giới GADM trong repo (GADM cấm redistribute).

## road-orientations (2/3 — MIT ✅)
- MapLibre + Overpass; **MIT — được copy code hợp pháp** (pattern setup MapLibre, basemap CARTO/Esri, Turf).

## Còn lại
greenest-ward (GEE/GeoPandas, pre-print), environmental-data-hub, cangiomap (MBTiles), RiverTracking, forks Spotlight (HanoiAQ…) — relevance 0–2, tham khảo.

**Citation đang dùng trong app:** "Dữ liệu ranh giới 63/34 tỉnh: Lê Quang Tuệ (github.com/lqtue/LacaProvinceMap)".
