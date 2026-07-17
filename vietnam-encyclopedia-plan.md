# 📘 KẾ HOẠCH TỔNG THỂ — Từ điển bách khoa Việt Nam theo không gian–thời gian trên bản đồ

> **File plan duy nhất của dự án** (mọi cập nhật gộp về đây). v2 — 2026-07-17.
> Repo: https://github.com/mainguyenanhvu/vietnam-spacetime-encyclopedia
> Live: https://mainguyenanhvu.github.io/vietnam-spacetime-encyclopedia/
> Research chi tiết: `docs/research/*.md`

---

## 1. Mục tiêu & nguyên tắc bất biến

Website giáo dục mã nguồn mở: bản đồ tương tác Việt Nam + trục thời gian lịch sử (khởi thủy → Văn Lang/Âu Lạc → Bắc thuộc → Đại Việt các triều đại → Pháp thuộc → 1945–1975 → 63 tỉnh → **34 tỉnh/thành từ 1/7/2025**). Click tỉnh → trang bách khoa đầy đủ.

**Nguyên tắc bất biến (mọi phase):**
1. 🇻🇳 **Chủ quyền**: Hoàng Sa & Trường Sa thuộc Việt Nam, hiển thị trên MỌI lớp, MỌI thời kỳ (Luật Đo đạc và bản đồ 2018). Đã thực thi từ v0.2: 2 quần đảo là feature riêng, tô màu nổi bật.
2. 📚 **Trích dẫn bắt buộc**: mọi mục dữ liệu có `sources[]`; nguồn chính thống VN (chinhphu.vn, GSO/NSO, NXB Chính trị quốc gia Sự thật, NXB Giáo dục, Viện Sử học, Cục Di sản văn hóa…).
3. ✅ **Đúng sự thật lịch sử**; nội dung tích cực, giáo dục, đúng pháp luật VN.
4. 💰 **$0 hosting** — kiến trúc static-first.

## 2. Hai chế độ người dùng

| | 🧑 **Người lớn / học sinh lớn** | 🧒 **Thiếu nhi** |
|---|---|---|
| Giao diện | Bản đồ dữ liệu đầy đủ, trích dẫn, số liệu | Màu tươi sáng, hoạt hoạ vui vẻ, chữ to, ít chữ nhiều hình |
| Nội dung | Toàn bộ hồ sơ bách khoa | Kể chuyện qua 2 nhân vật dẫn truyện + games |
| Tương tác | Layers, timeline, tra cứu, quiz 4 bậc | Phiêu lưu theo cốt truyện, mini-games, huy hiệu |
| Kỹ thuật | route `/#/kham-pha` | route `/#/thieu-nhi`; cùng codebase, theme + content filter |

Chuyển chế độ ngay màn hình chào (chọn nhân vật = vào chế độ thiếu nhi).

## 3. Cốt truyện chế độ thiếu nhi — «Hành trình Con Rồng Cháu Tiên»

- **Nhân vật**: hai anh em song sinh — bé trai **Lạc** và bé gái **Âu** (gợi từ Lạc Long Quân – Âu Cơ, "con Rồng cháu Tiên").
- **Khởi truyện**: trong viện bảo tàng, hai em chạm vào **trống đồng Đông Sơn** kỳ diệu; chim Lạc trên mặt trống bay ra, mỗi nhịp trống mở một **cánh cổng không–thời gian**.
- **Cơ chế hoá thân**: đến mỗi vùng đất/thời kỳ, Lạc và Âu **hoá thân vào trang phục dân tộc bản địa** (dần đủ 54 dân tộc — Kinh, Tày, Thái, Mường, H'Mông, Ê Đê, Chăm, Khmer…), học chào bằng tiếng địa phương, nếm đặc sản, gặp danh nhân/anh hùng, nghe truyền thuyết.
- **Sưu tập**: mỗi tỉnh hoàn thành = 1 **hạt ngọc Lạc Việt** + thẻ trang phục dân tộc; đủ bộ vùng → mở khoá animation đặc biệt (múa xòe, đua ghe ngo, quan họ…).
- **Giọng kể**: tích cực, vui vẻ, khuyến khích ("Giỏi quá! Bạn đã biết vì sao gọi là Hà Nội — thành phố trong sông!").
- Sản xuất: minh hoạ 2D vector (SVG/Lottie animation) → nhẹ, phù hợp static site; thiết kế nhân vật cần artist hoặc AI-assisted + hiệu đính văn hoá (trang phục phải đúng — kiểm chứng với nguồn Bảo tàng Dân tộc học VN).

## 4. Kiến trúc kỹ thuật

- **Stack**: Vite + TypeScript + MapLibre GL JS; Three.js chỉ cho module 3D (glTF viewer). Không backend — tiến trình người dùng lưu `localStorage`.
- **Hosting** (theo research `hosting-platforms.md`, `storage-options.md`):
  - Site: GitHub Pages (hiện tại) → **Cloudflare Pages** (bandwidth ∞, PoP Hà Nội/HCMC) khi có tài khoản.
  - **Kiến trúc media nhiều GB, $0** (combo A): ảnh tư liệu CC/公 → **Wikimedia Commons** (∞, giải quyết luôn bản quyền); tiles bản đồ → **PMTiles trên Cloudflare R2** (10 GB, egress $0); tràn → **Backblaze B2** (10 GB, egress $0 qua Cloudflare); glTF/video lớn → **Hugging Face Datasets** (public, best-effort); bản gốc versioned → **GitHub Releases** (2 GB/file, ∞ tổng).
  - Manifest JSON ánh xạ media-ID → origin (một lớp lookup duy nhất).
- **Dữ liệu**:
  - `public/data/boundaries/*.geojson` — mỗi thời kỳ 1 lớp (✅ đã có 63 & 34).
  - `public/data/provinces/<slug>.json` — hồ sơ bách khoa (schema + validator CI).
  - `public/data/timeline/events.json` — đồ thị kế thừa tỉnh (from→to, văn bản pháp lý, ngày hiệu lực) — mô hình CHGIS: `(place, name, valid_from, valid_to, parent)`.
  - `public/data/quiz/*.json`, `public/data/story/*.json` — câu hỏi & cốt truyện.

## 5. Ngân hàng lớp bản đồ (user chọn chồng lớp) — từ benchmark `edu-features-games.md`

**✅ Đã có:** ranh giới 34 tỉnh (2025) · ranh giới 63 tỉnh (1976–2025) · quần đảo Hoàng Sa–Trường Sa (màu riêng).

**Hành chính–chính trị:** kinh đô các triều đại (năm dựng/mất) · thành cổ, citadel (Cổ Loa, Lũy Thầy) · ranh giới các kỳ Pháp thuộc (Bắc/Trung/Nam Kỳ).
**Quân sự:** trận đánh lớn (Bạch Đằng, Đống Đa, Điện Biên Phủ…) · chiến tuyến theo thời gian · đường Trường Sơn.
**Kinh tế:** làng nghề (icon sản phẩm) · thương cảng cổ & con đường tơ lụa biển · đường thiên lý · đường sắt/quốc lộ thời thuộc địa.
**Văn hoá–xã hội:** di sản UNESCO (vật thể + phi vật thể) · lễ hội theo tháng âm lịch (filter lịch) · bản đồ ẩm thực đặc sản · trang phục & dân tộc (54 dân tộc — layer lãnh thổ văn hoá kiểu Native-Land) · phương ngữ (isogloss) · di chỉ khảo cổ (thumbnail hiện vật).
**Con người:** quê quán danh nhân/anh hùng theo thời kỳ · dòng Nam tiến (mũi tên di cư) · di dân 1954/1975.
**Tự nhiên–meta:** bão lịch sử đổ bộ (IBTrACS/NOAA public domain, từ repo 2025Typhoon của lqtue) · biển số xe & postcode (lớp hiện đại) · overlay bản đồ cổ georeferenced với **thanh trượt opacity** (pattern David Rumsey/VMA).

UI: panel layer (đã có khung) — radio thời kỳ + checkbox overlay; legend động; mỗi layer ghi rõ nguồn.

## 6. Hệ thống quiz «vừa học vừa chơi»

- **Định dạng**: click-đúng-tỉnh (Seterra) · gọi-tên-cũ (đảo chiều) · sắp xếp dòng thời gian (kéo-thả triều đại) · ghép ảnh→tỉnh (trang phục/món ăn/địa danh) · **«Đoán Tỉnh Xưa» daily puzzle kiểu Worldle** (silhouette + gợi ý thời kỳ, feedback khoảng cách-hướng, share emoji grid không spoiler).
- **Thang độ khó 4 bậc** (chuẩn VioEdu): Nhận biết → Thông hiểu → Vận dụng → Vận dụng cao.
- **Spaced repetition không cần server**: SM-2 rút gọn trên `localStorage` (interval, ease, next_due); streak đếm ngày kiểu Duolingo (loss-aversion); power-up kiểu Quizizz (50-50, gợi ý) giới hạn/ngày.
- Nội dung câu hỏi sinh từ chính data hồ sơ tỉnh → không bao giờ lệch nguồn.

## 7. Games giáo dục (xếp hạng impact/effort)

1. **Đoán Tỉnh Xưa** (daily, cao/thấp) — viral + retention, build đầu tiên.
2. **Đua Click Tỉnh** (cao/thấp) — timed, 3 mức, toggle 63/34/triều đại.
3. **Quiz Timeline Morph** (cao/vừa) — đóng băng năm bất kỳ, hỏi "vùng này tên gì, ai trị vì?".
4. **Hành trình Con Rồng Cháu Tiên** (vừa/vừa) — game cốt truyện thiếu nhi (§3), quest theo tỉnh, mở khoá thẻ dân tộc.
5. **Ghép cặp tên xưa–nay** (vừa/thấp) — memory match, hợp thiếu nhi.
6. **Săn huy hiệu Làng nghề & Ẩm thực** (vừa/vừa) — sưu tập badge theo vùng.
7. **Sắp xếp trận đánh** (thấp/thấp).
8. **Nghe giọng đoán miền** (thấp/cao) — cần audio bản quyền, để sau.
Thiếu nhi thêm: tô màu bản đồ tỉnh, xếp hình (jigsaw) lãnh thổ theo thời kỳ, "tìm chim Lạc" ẩn trong tranh.

## 8. Lộ trình

| Phase | Nội dung | Trạng thái |
|---|---|---|
| 0 | Nền móng: research, repo, scaffold, deploy | ✅ 2026-07-17 |
| 1 | **Bản đồ 2 thời kỳ 63⇄34 + layer control + panel tỉnh + chủ quyền HS-TS** | ✅ 2026-07-17 (v0.2) |
| 2 | Schema hồ sơ tỉnh + validator CI; 5 tỉnh pilot (Hà Nội, Huế, TP.HCM, Phú Thọ, Cà Mau); đồ thị kế thừa 63→34 từ NQ 202/2025/QH15 | ⏭️ tiếp theo |
| 3 | Quiz engine (SM-2 localStorage) + game #1 Đoán Tỉnh Xưa + #2 Đua Click | — |
| 4 | Chế độ thiếu nhi: màn chào chọn nhân vật, cốt truyện Lạc & Âu 5 tỉnh pilot, minh hoạ SVG/Lottie | — |
| 5 | Overlay layers đợt 1 (UNESCO, làng nghề, trận đánh, bão IBTrACS) + bản đồ cổ opacity slider | — |
| 6 | Ranh giới tiền-1976 (Pháp thuộc, triều Nguyễn…) — cần số hoá/nguồn học thuật; animation morph timeline | — |
| 7 | Media pipeline (Commons/R2/B2/HF) + 3D glTF di tích + Cloudflare Pages migration | — |
| 8 | 34 tỉnh đầy đủ hồ sơ + 54 dân tộc + phủ toàn bộ games | — |

## 9. Cổng kiểm chứng (verification gates)
- CI: build + schema validation + link-check `sources[]`.
- **Test chủ quyền tự động**: mọi lớp ranh giới phải chứa feature Hoàng Sa & Trường Sa (fail CI nếu thiếu).
- Reviewer agent cho mọi PR nội dung (đối chiếu nguồn); qa-testing agent trước release.
- Nội dung thiếu nhi: thêm cổng "văn hoá chính xác" (trang phục dân tộc đúng — đối chiếu Bảo tàng Dân tộc học).

## 10. 🔄 Tự phản biện liên tục (cập nhật mỗi sprint)

**Điểm yếu hiện tại (2026-07-17):**
1. ⚠️ **License dữ liệu lqtue**: LacaProvinceMap không có LICENSE → đang dùng theo chỉ đạo "lấy + cite", nhưng cần xin phép chính thức (mở issue/email) — *chờ Iron Man duyệt vì là liên hệ đối ngoại*. Phương án B: tự dựng từ OSM (ODbL).
2. ⚠️ **Số liệu GRDP/dân số 2024 trong popup chưa có nguồn gốc rõ** (lqtue không ghi provenance) → Phase 2 thay bằng số GSO/Niên giám 2025 có trích dẫn, giữ lqtue chỉ cho ranh giới.
3. ⚠️ **Ranh giới lịch sử tiền-1976 chưa tồn tại dạng số** — rủi ro lớn nhất toàn dự án (phải số hoá từ atlas giấy, cần cố vấn sử học). Đã xếp Phase 6 riêng.
4. ⚠️ Trường Sa 341 polygon làm file nặng (~1,1 MB/lớp) → cần lọc đảo quá nhỏ/simplify + chuyển PMTiles.
5. ⚠️ OSM raster tile policy không dành cho traffic lớn → khi lên Cloudflare, tự host PMTiles basemap (Protomaps).
6. ❌ Chưa có: SEO/OpenGraph per-tỉnh, accessibility (WCAG), chế độ offline (PWA), tiếng Anh, analytics tôn trọng riêng tư. → backlog.
7. ❌ Câu chữ thiếu nhi cần chuyên gia giáo dục tiểu học hiệu đính (thuê/nhờ cộng đồng).
8. 🤔 Mô hình đóng góp cộng đồng (PR nội dung) chưa có CONTRIBUTING.md + template — viết ở Phase 2.

**Quyết định đã chốt:** stack Vite+TS+MapLibre · geodata lqtue (ranh giới) + Free-GIS-Data (đảo) · hosting GH Pages → Cloudflare · media combo Commons/R2/B2/HF · repo mẫu holetexvn chỉ tham khảo (no license).

## 11. Nguồn trích dẫn dữ liệu đang dùng (runtime hiển thị trong app)
- Ranh giới 63/34 tỉnh: Lê Quang Tuệ — github.com/lqtue/LacaProvinceMap (chờ xác nhận license).
- Quần đảo Hoàng Sa & Trường Sa: Free-GIS-Data — github.com/nguyenduy1133/Free-GIS-Data.
- Danh mục sáp nhập: Nghị quyết 202/2025/QH15 — chinhphu.vn.
- Nền bản đồ: © OpenStreetMap contributors (ODbL).
