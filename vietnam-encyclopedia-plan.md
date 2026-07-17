# Kế hoạch dự án — Từ điển bách khoa Việt Nam theo không gian–thời gian trên bản đồ

> Plan file (orchestration). Status: DRAFT v1 — 2026-07-17.
> Repo target: `mainguyenanhvu/vietnam-spacetime-encyclopedia` (public).
> Deploy target: free tier (final choice pending platform research — leading candidates: Cloudflare Pages / GitHub Pages).

## 1. Goal

Website giáo dục mã nguồn mở, miễn phí hosting, hiển thị **bản đồ tương tác Việt Nam** với trục **thời gian lịch sử**:
người dùng kéo timeline → ranh giới hành chính thay đổi (khởi thủy → Văn Lang/Âu Lạc → Bắc thuộc → Đại Việt → Nhà Nguyễn → Pháp thuộc → 1945–1975 → 63 tỉnh → 34 tỉnh/thành 2025), click tỉnh → trang bách khoa đầy đủ.

**Nội dung mỗi tỉnh:** tên qua các thời kỳ; quá trình chia tách/sáp nhập; địa lý tự nhiên; lịch sử & di chỉ khảo cổ; văn hoá – xã hội – dân số – kinh tế; đặc sản; trang phục; tiếng địa phương; kiến trúc đặc trưng; biển số xe; postcode; danh nhân; anh hùng dân tộc; anh hùng LLVT; mẹ Việt Nam anh hùng; truyền thuyết; hình ảnh thực tế / phục dựng 3D / animation.

**Ràng buộc pháp lý (bắt buộc):** đúng luật pháp VN, đúng chủ quyền (Hoàng Sa, Trường Sa thuộc Việt Nam trên mọi bản đồ), đúng sự thật lịch sử, trích dẫn nguồn chính thống (chinhphu.vn, GSO, NXB Chính trị quốc gia Sự thật, NXB Giáo dục, Viện Sử học…). Mọi entry nội dung PHẢI có trường `sources[]`.

## 2. Architecture (proposed)

- **Static-first, no backend.** Toàn bộ dữ liệu là JSON/GeoJSON trong repo → deploy free, dễ kiểm chứng nguồn, dễ đóng góp qua PR.
- **Stack:** Vite + TypeScript + MapLibre GL JS (2D map + extrusion 3D), timeline slider tự viết; Three.js chỉ dùng cho module phục dựng 3D (glTF viewer) khi cần.
- **Data model:**
  - `data/boundaries/<period>.geojson` — ranh giới theo thời kỳ (63 tỉnh, 34 tỉnh, các thời kỳ lịch sử).
  - `data/provinces/<slug>.json` — hồ sơ bách khoa từng tỉnh (schema chuẩn, có `sources[]`).
  - `data/timeline/events.json` — sự kiện chia tách/sáp nhập/đổi tên (machine-readable: from → to, văn bản pháp lý).
- **Media:** ảnh/3D/video lớn → offload (chiến lược chốt sau khi có kết quả research: R2/jsDelivr/GitHub Releases).
- **i18n:** tiếng Việt là ngôn ngữ chính (client-facing); tiếng Anh phase sau.

## 3. Phases & subtasks

### Phase 0 — Nền móng (sprint hiện tại)
| # | Subtask | Model route | Done when |
|---|---------|-------------|-----------|
| 0.1 | Research free hosting platforms | research agent | ✅ report với citation |
| 0.2 | Research nguồn dữ liệu chính thống + geodata 63/34 tỉnh | research agent | ✅ report với citation |
| 0.3 | Phân tích repo mẫu holetexvn/vietnam-3d-map | general-purpose | ✅ report stack/data |
| 0.4 | Tạo repo GitHub + scaffold Vite/TS/MapLibre | main | repo public, CI deploy chạy |
| 0.5 | Bản đồ 34 tỉnh render được + click hiện tên | main | prototype chạy trên URL public |

### Phase 1 — Dữ liệu lõi
- Schema JSON hồ sơ tỉnh (`province.schema.json`) + validator (CI).
- GeoJSON 63-tỉnh + 34-tỉnh + bảng ánh xạ sáp nhập 2025 (theo nghị quyết).
- Timeline slider: chuyển layer ranh giới theo thời kỳ.
- 3–5 tỉnh mẫu có hồ sơ đầy đủ (pilot: Hà Nội, Huế, TP.HCM, Phú Thọ, Cà Mau).

### Phase 2 — Nội dung & media
- Pipeline thu thập nội dung có kiểm chứng (research agents → citation bắt buộc → reviewer agent).
- Ảnh thực tế (nguồn CC/công vụ), phục dựng 3D (glTF), animation biến động lãnh thổ.
- Trang danh nhân / anh hùng / mẹ VNAH (dữ liệu cấu trúc, tra cứu chéo).

### Phase 3 — Tính năng nâng cao (đề xuất mới)
- **"Cỗ máy thời gian"**: animation morph ranh giới giữa các thời kỳ.
- **So sánh 2 thời kỳ** song song (split-screen).
- **Quiz/gamification** giáo dục (đoán tỉnh, ghép tên cũ–mới).
- **"Hôm nay trong lịch sử"** theo địa phương.
- **Tra cứu ngược**: nhập tên xã/huyện cũ → thuộc tỉnh nào qua từng thời kỳ.
- **Bản đồ chuyên đề**: dân số, kinh tế, di sản UNESCO, làng nghề.
- Chia sẻ deep-link từng tỉnh/thời kỳ (URL state).

## 4. Verification gates
- CI: schema validation cho mọi file dữ liệu; link-check `sources[]`.
- Mỗi PR nội dung: reviewer agent kiểm tra citation + sự thật lịch sử.
- Bản đồ: test hiển thị Hoàng Sa – Trường Sa ở mọi zoom/thời kỳ.
- qa-testing agent trước mỗi release.

## 5. Open decisions
- [ ] Hosting platform (chờ 0.1).
- [ ] Nguồn GeoJSON 34 tỉnh (chờ 0.2).
- [ ] Reuse code repo mẫu hay chỉ tham khảo (chờ 0.3).
- [ ] Tên miền tùy chỉnh (hỏi Iron Man sau khi có prototype).
