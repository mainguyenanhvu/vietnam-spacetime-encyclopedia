# 📘 KẾ HOẠCH TỔNG THỂ — Từ điển bách khoa Việt Nam theo không gian–thời gian trên bản đồ

> **File plan duy nhất của dự án** (mọi cập nhật gộp về đây). v3 — 2026-07-17 (sau vòng phản biện độc lập, xem §10).
> Repo: https://github.com/mainguyenanhvu/vietnam-spacetime-encyclopedia
> Live: https://mainguyenanhvu.github.io/vietnam-spacetime-encyclopedia/
> Research chi tiết: `docs/research/*.md`

---

## 1. Mục tiêu & nguyên tắc bất biến

Website giáo dục mã nguồn mở: bản đồ tương tác Việt Nam + trục thời gian lịch sử (khởi thủy → Văn Lang/Âu Lạc → Bắc thuộc → Đại Việt các triều đại → Pháp thuộc → 1945–1975 → 63 tỉnh → **34 tỉnh/thành từ 1/7/2025**). Click tỉnh → trang bách khoa đầy đủ.

**Nguyên tắc bất biến (mọi phase):**
1. 🇻🇳 **Chủ quyền**: Hoàng Sa & Trường Sa thuộc Việt Nam, hiển thị trên MỌI lớp, MỌI thời kỳ (Luật Đo đạc và bản đồ 2018). Đã thực thi từ v0.2: 2 quần đảo là feature riêng, tô màu nổi bật.
2. 📚 **Trích dẫn bắt buộc**: mọi mục dữ liệu có `sources[]`; nguồn chính thống VN (chinhphu.vn, GSO/NSO, NXB Chính trị quốc gia Sự thật, NXB Giáo dục, Viện Sử học, Cục Di sản văn hóa…). **Chính sách Wikipedia (chỉ đạo Iron Man 2026-07-17): wiki là nguồn mở không kiểm duyệt — chỉ dùng làm nguồn dẫn đường/bổ trợ, KHÔNG BAO GIỜ là nguồn duy nhất; validator CI fail nếu một mục chỉ có nguồn wiki.**
2b. ©️ **Bản quyền văn học**: tác phẩm hết bảo hộ (tác giả mất >50 năm) mới đăng toàn văn; tác phẩm còn bảo hộ chỉ trích ≤8 dòng kèm nguồn (Điều 25 Luật SHTT) — validator CI ép cứng.
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

**MVP retention loop (chốt sau phản biện):** bản đồ 2 thời kỳ + hồ sơ tỉnh (chế độ người lớn) + game «Đoán Tỉnh Xưa». Chế độ thiếu nhi là sản phẩm thứ hai — chỉ khởi động khi MVP đã ship và đo được.

| Phase | Nội dung | Size | Trạng thái |
|---|---|---|---|
| 0 | Nền móng: research, repo, scaffold, deploy | S | ✅ 2026-07-17 |
| 1 | Bản đồ 2 thời kỳ 63⇄34 + layer control + chủ quyền HS-TS + audit CI | M | ✅ 2026-07-17 (v0.2) |
| 2 | Schema hồ sơ tỉnh + validator CI; 5 tỉnh pilot; đồ thị kế thừa 63→34 (`events.json`) | M | ✅ 2026-07-17 (v0.3) |
| 2c | **Thư viện văn học**: thơ yêu nước (PD toàn văn / còn bản quyền chỉ trích ≤8 dòng), giai thoại Trạng nguyên, «Lịch sử nước ta» (HCM 1942, PD — văn bản đối chiếu 2 nguồn), cross-link theo tỉnh, validator nguồn trong CI | M | ✅ 2026-07-17 (v0.5) |
| 2b | Spike ranh giới tiền-1976 → **thành sản phẩm luôn**: lớp Pháp thuộc 1887–1945 (Bắc/Trung/Nam Kỳ 25/19/19, kiểm chứng đa nguồn; đảo gắn theo Dụ 10/1938 & NĐ 21/12/1933; assertion cứng trong script gen). Kết luận spike: ranh giới lịch sử theo phép xấp xỉ địa giới hiện đại KHẢ THI, có disclaimer; ranh giới chính xác từng thời kỳ cần số hoá bản đồ cổ (Phase 6) | S | ✅ 2026-07-17 (v0.8) |
| 3 | Quiz engine (SM-2 localStorage) + game #1 Đoán Tỉnh Xưa + metric giáo dục (completion rate, không PII) | M | ✅ 2026-07-17 (v0.7–0.8: game + quiz SM-2; ngân hàng 89 thẻ tự sinh = 34 thủ phủ + 24 hợp thành + 31 sáp-nhập-ngược — QA xác nhận 0 thẻ trùng đáp án) |
| 4 | Overlay «wow» đợt 1: Taberd 1838 viewer ✅; **lớp phủ UNESCO** (13 điểm) ✅; **Tra cứu niên hiệu** trong Thư viện (146 mục, −2879→1945, không khoảng trống, đối chiếu chéo nguoikesu.com) ✅ 2026-07-18; **lớp phủ Di tích QGĐB** (geocode đa lô qua OSM/Wikipedia) 🟡 đang ráp; còn: pin Bảo vật quốc gia (237), georeference Taberd | M | 🟡 |
| 4b | **Chế độ 3D** (fill-extrusion MapLibre — tỉnh nổi khối, đảo tháp đỏ chủ quyền, hover nhô cao, click bay camera; cảm hứng holetexvn/vietnam-3d-map, KHÔNG dùng code gốc vì repo không có license) ✅ 2026-07-18 | S | ✅ |
| 5b | **Vòng hiệu đính agent đợt 1** — 34/34 hồ sơ đối chiếu nguồn chính thống, 23 lỗi fact đã sửa (nặng nhất: nhầm bến Vàm Lũng với điểm tập kết 1954), 6 báo cáo docs/review/hieu-dinh-batch-1..6.md; chờ NGƯỜI DUYỆT xác nhận các cờ ⚠️ để nâng trang_thai lên reviewed | M | ✅ |
| 5 | **34/34 hồ sơ tỉnh** ✅ 2026-07-18 (v1.0): 29 hồ sơ mới do 6 batch song song biên soạn, validator 34/34 pass, tất cả trạng thái draft chờ vòng người kiểm chứng; overlay đợt 2 (làng nghề, trận đánh, bão) còn lại | L | 🟡 nội dung ✅ / hiệu đính ⏳ |
| 6 | Ranh giới lịch sử đầy đủ (số hoá bản đồ cổ) + animation morph + Nam tiến | L | — |
| 7 | Media pipeline (Commons/R2/B2/HF) + PMTiles + Cloudflare Pages migration (**chờ tài khoản Cloudflare của Iron Man**) | M | ⏸ blocked |
| 8 | Chế độ thiếu nhi: **khung + cốt truyện Lạc & Âu 5 chương** ✅ 2026-07-18 (chữ + theme, thử thách + ngọc Lạc Việt, no-PII); art trang phục 54 dân tộc **chưa sản xuất** — chờ chỉ định người hiệu đính văn hoá (gate §9) | XL | 🟡 |

## 9. Cổng kiểm chứng (verification gates)
- CI: build + schema validation + link-check `sources[]`.
- ✅ **Kiểm toán chủ quyền tự động trong CI** (`scripts/audit_sovereignty.mjs`, chạy trước build — thiếu là fail deploy): 12 đảo/quần đảo trọng yếu phải có polygon trong MỌI lớp ranh giới — Hoàng Sa, Trường Sa (2 cụm), Phú Quốc, Thổ Chu, Côn Đảo, Bạch Long Vĩ, Cát Bà, Cồn Cỏ, Lý Sơn, Phú Quý, Hòn Khoai. Đã bắt được và sửa 3 đảo thiếu (Thổ Chu, Bạch Long Vĩ, Phú Quý — `scripts/add_missing_islands.mjs`). Danh mục sẽ mở rộng dần (Cô Tô, Cù Lao Chàm, Nam Du, Hòn Mê…).
- ✅ **Validator hồ sơ tỉnh trong CI** (`scripts/validate_provinces.mjs`): schema bắt buộc + `sources[]` không rỗng + trạng thái `draft|reviewed` — hồ sơ AI-soạn phải mang badge «Bản nháp» trên UI cho tới khi có người kiểm chứng.
- Reviewer agent cho mọi PR nội dung (đối chiếu nguồn); qa-testing agent trước release.
- **Cổng chủ đề nhạy cảm** (phản biện #6): danh sách chủ đề cần người duyệt (Tây Sơn–Nguyễn, khung thuộc địa, di dân 1954/1975, nhân vật tranh luận) — bám sát SGK/chính sử NXB Giáo dục, không diễn giải riêng; mọi đoạn thuộc danh sách phải `reviewed` mới hiển thị không badge.
- **Cổng trẻ em** (phản biện #7): route thiếu nhi không thu thập PII, không tracker bên thứ ba (Luật Trẻ em 2016); tiến trình chỉ localStorage + nút xuất/nhập file.
- **Cổng văn hoá dân tộc** (phản biện #3): trang phục/tập tục 54 dân tộc phải có người hiệu đính được chỉ định danh tính TRƯỚC khi sản xuất art; đối chiếu Bảo tàng Dân tộc học VN.
- **Cổng license media** (phản biện #9): manifest license per-asset, check CI như pattern audit chủ quyền.
- **Cổng nền bản đồ (basemap)** (sự cố 2026-07-18, Iron Man phát hiện): audit chủ quyền phải phủ CẢ nền bản đồ bên thứ ba, không chỉ dữ liệu GeoJSON của dự án. Tile OSM mặc định render nhãn địa danh phi pháp do nước ngoài đặt trên Biển Đông (vd. «Tam Sa») → vi phạm Luật Đo đạc và bản đồ 2018. Quy tắc bất biến: **chỉ dùng basemap KHÔNG NHÃN** (hiện tại: CARTO light_nolabels); nhãn chủ quyền «Quần đảo Hoàng Sa/Trường Sa (Việt Nam)» do dự án tự render, luôn hiển thị ở mọi thời kỳ và mọi chế độ 2D/3D. Khi đổi nhà cung cấp basemap phải kiểm tra bằng mắt khu vực Biển Đông trước khi ship.

## 10. 🔄 Tự phản biện liên tục (cập nhật mỗi sprint)

**Điểm yếu hiện tại (2026-07-17):**
1. 🔄 **License dữ liệu lqtue**: đã mở issue xin phép chính thức (github.com/lqtue/LacaProvinceMap/issues/1, được Iron Man duyệt) — chờ phản hồi. Phương án B nếu từ chối: tự dựng từ OSM (ODbL).
1b. ⚠️ **Đường biên giới trên biển, thềm lục địa, vùng đặc quyền kinh tế (EEZ)**: CHƯA hiển thị — tuyệt đối không vẽ từ nguồn không chính thức (rủi ro pháp lý cao nhất). Cần research riêng: đường cơ sở 1982, đường cơ sở Vịnh Bắc Bộ công bố 02/2025, Hiệp định phân định Vịnh Bắc Bộ 2000, UNCLOS — chỉ render khi có toạ độ từ văn bản chính thức (Công báo/Bộ Ngoại giao). Biên giới đất liền hiện dùng theo dữ liệu ranh giới tỉnh (OSM-derived) — cần đối chiếu bản đồ biên giới chính thức khi có.
2. ⚠️ **Số liệu GRDP/dân số 2024 trong popup chưa có nguồn gốc rõ** (lqtue không ghi provenance) → Phase 2 thay bằng số GSO/Niên giám 2025 có trích dẫn, giữ lqtue chỉ cho ranh giới.
3. ⚠️ **Ranh giới lịch sử tiền-1976 chưa tồn tại dạng số** — rủi ro lớn nhất toàn dự án (phải số hoá từ atlas giấy, cần cố vấn sử học). Đã xếp Phase 6 riêng.
4. ⚠️ Trường Sa 341 polygon làm file nặng (~1,1 MB/lớp) → cần lọc đảo quá nhỏ/simplify + chuyển PMTiles.
5. ⚠️ OSM raster tile policy không dành cho traffic lớn → khi lên Cloudflare, tự host PMTiles basemap (Protomaps).
6. ❌ Chưa có: SEO/OpenGraph per-tỉnh, accessibility (WCAG), chế độ offline (PWA), tiếng Anh, analytics tôn trọng riêng tư. → backlog.
7. ❌ Câu chữ thiếu nhi cần chuyên gia giáo dục tiểu học hiệu đính (thuê/nhờ cộng đồng).
8. 🤔 Mô hình đóng góp cộng đồng (PR nội dung) chưa có CONTRIBUTING.md + template — viết ở Phase 2.

**Vòng phản biện độc lập 2026-07-17 (reviewer agent, 14 findings) — phản hồi:**
- 🔴 #1 Kinh tế sản xuất nội dung → ✅ tiếp thu: 5 tỉnh pilot đã làm end-to-end làm mẫu đo; Phase 5 chỉ lập lịch sau khi đo giờ/tỉnh thực tế. Hồ sơ AI-draft phải qua vòng người kiểm chứng (badge draft).
- 🔴 #2 Dual-mode nhân đôi scope → ✅ tiếp thu: MVP = chế độ người lớn; thiếu nhi dời xuống Phase 8, chỉ chạy khi MVP có số liệu.
- 🔴 #3 Trang phục 54 dân tộc → ✅ thành cổng cứng trong §9 (người hiệu đính chỉ định trước khi sản xuất art).
- 🔴 #4 Roadmap không sizing → ✅ đã thêm cột Size S/M/L/XL.
- 🔴 #5 Rủi ro lớn nhất xếp cuối → ✅ thêm Phase 2b: spike khả thi ranh giới tiền-1976 TRƯỚC Phase 3.
- 🔴 #6 Chủ đề lịch sử nhạy cảm → ✅ thành cổng trong §9 (bám chính sử/SGK, danh sách chủ đề cần duyệt).
- 🔴 #7 Trẻ em/PII → ✅ thành cổng trong §9 (no PII, no tracker, export localStorage).
- 🔴 #8 Metric giáo dục → ✅ gắn vào Phase 3: đo completion-rate quiz không PII.
- 🟡 #9 License media → ✅ cổng manifest trong §9 (thực thi ở Phase 7).
- 🟡 #10 PMTiles quá muộn → ✅ dời lên Phase 7 + quy tắc: không thêm GeoJSON layer >500 KB mới cho tới khi migrate.
- 🟡 #11 localStorage mất dữ liệu → ✅ thêm nút xuất/nhập tiến trình (Phase 3).
- 🟡 #12 25 layer không cắt MVP → ✅ Phase 4 chỉ 3 lớp wow; còn lại backlog.
- 🟡 #13 SEO/a11y/i18n → ⏳ chấp nhận nợ, tách thành workstream riêng khi MVP ship (SEO per-tỉnh cần pre-render — ghi nhận sớm).
- 🟡 #14 Ai phân xử PR nhạy cảm → ⏳ tạm thời: maintainer + reviewer agent; sẽ mời cố vấn sử học khi có cộng đồng.

**Quyết định đã chốt:** stack Vite+TS+MapLibre · geodata lqtue (ranh giới) + Free-GIS-Data (đảo) · hosting GH Pages → Cloudflare · media combo Commons/R2/B2/HF · repo mẫu holetexvn chỉ tham khảo (no license) · MVP = người lớn + Đoán Tỉnh Xưa · spike tiền-1976 trước quiz.

## 11. Nguồn trích dẫn dữ liệu đang dùng (runtime hiển thị trong app)
- Ranh giới 63/34 tỉnh: Lê Quang Tuệ — github.com/lqtue/LacaProvinceMap (chờ xác nhận license).
- Quần đảo Hoàng Sa & Trường Sa: Free-GIS-Data — github.com/nguyenduy1133/Free-GIS-Data.
- Danh mục sáp nhập: Nghị quyết 202/2025/QH15 — chinhphu.vn.
- Nền bản đồ: © OpenStreetMap contributors (ODbL).
