# PLAN — kế hoạch duy nhất của dự án

> **Đây là file kế hoạch DUY NHẤT.** Không tạo thêm file `*-plan.md` nữa. Việc đã xong chuyển sang [`RELEASE.md`](RELEASE.md). Kế hoạch cũ nằm ở `docs/lich-su/` — đọc để hiểu lịch sử quyết định, **không đối chiếu số liệu** vì chúng đã lỗi thời.

Gộp từ 17 file kế hoạch rời của các phiên 2026-07-17 → 2026-07-26. Cập nhật **2026-08-05**.

---

## 🔴 Bất biến — kiểm trước mọi thay đổi dữ liệu

1. **Chủ quyền.** Quần đảo **Hoàng Sa** và **Trường Sa** phải hiển thị trên **mọi bản đồ, mọi thời kỳ**. Một thay đổi layer, style, hay bbox làm mất chúng là lỗi chặn phát hành, không phải chi tiết thẩm mỹ.
2. **Tuân thủ pháp luật**, gồm Luật Đo đạc và Bản đồ 2018. Vẽ ranh giới là bề mặt pháp lý.
3. **Trích dẫn bắt buộc.** Mọi mục mang trường nguồn trỏ tới nguồn chính thống. **Không nguồn thì không xuất bản.** Không bịa ngày, số quyết định, hay số liệu dân số để lấp chỗ trống — để trống và gắn cờ.
4. **Chính xác lịch sử hơn hấp dẫn tự sự.** Nguồn mâu thuẫn thì trình bày mâu thuẫn, không lặng lẽ chọn bản gọn hơn.
5. **Mục nhạy cảm** liệt ở `docs/section9-sensitive.json` — đọc trước khi sửa bất cứ thứ gì nó nêu.
6. **Thà không vẽ còn hơn vẽ đoán.** Chỉ số hoá ranh giới thời kỳ có nguồn atlas đủ tin cậy.

---

## Trạng thái hiện tại — 2026-08-06

252 file dữ liệu · **5.345 mục** · 33 lớp phủ · **13/13 cổng dữ liệu xanh** · smoke 9 đạt/0 hỏng · chủ quyền 13/13 thời kỳ · `tsc` exit 0.

**Sa đồ 240/241 trận** · **Hành trình lịch sử 22 chặng** (phân kỳ đủ 5 nhóm) · **22 mô hình nhân vật/hiện vật 3D**.

⚠️ Khối này lỗi thời rất nhanh. Số cũ ghi 4.531 mục / 34 lớp / 12 cổng, sai cả ba, và tôi đã có lần đề xuất làm lại một việc đã xong vì tin vào nó. **Đếm lại trước khi trích.**

| Chiến dịch đang mở | Trạng thái |
|---|---|
| Thiết kế lại UI 2 chế độ (người lớn · trẻ em) | 🔄 đang làm |
| Cơ sở dữ liệu thống nhất + chỉ mục tĩnh | 🔄 đang làm |
| Gom bảng "Muôn xã Muôn phường" | ⏸ chờ quyết định giấy phép |
| Duyệt cổng §9 | ✅ 2026-08-11 nâng 1.413 (nguyên tắc chủ dự án); còn 16 giữ chủ ý + 155 video kênh ngoài nhà nước |
| Ranh giới lịch sử 602–1887 | ⛔ chặn bởi nguồn |

---

## 1. Giao diện — thiết kế lại 2 chế độ

**Đích**: chế độ **người lớn** (sang trọng, tinh tế, tối giản, học Material 3) và chế độ **trẻ em** (vui nhộn, hoạt hình, nhiều màu). Chuyển bằng `:root[data-che-do]`, **không tách 2 file CSS**.

Vì sao dùng biến CSS chứ không 2 file: `body.kid-mode` (`story.ts:131-133`) đã chứng minh cơ chế class-trên-body chạy ổn trong production. 11 panel + control đã tham chiếu `var(--*)` ở khối `style.css:1351-1651`. Tách 2 file sẽ nhân đôi 1.864 dòng và mọi bugfix layout phải sửa hai lần.

### ✅ Nền móng đã xong
Token hai chế độ (`src/theme.css`), nút chuyển + `localStorage` (`src/chedo.ts`), tokenise `style.css` (236 → 4 hex), thang cỡ chữ và khoảng cách, audit tương phản trên trình duyệt thật. Chi tiết và số đo: `RELEASE.md`.

### ✅ Đợt "học Google Maps" 2026-08-11 — đã áp, đã nghiệm thu Chrome thật
- **Thanh chip nhóm lớp phủ** (`src/chip-bar.ts`): hàng chip full-width TRONG `#topbar` (ResizeObserver tự cộng vào `--topbar-h` nên panel nổi không cần biết gì). Chip bật/tắt CẢ cụm bằng cách dispatch `change` vào checkbox có sẵn — không nhân đôi đường toggleOverlay. Bẫy đã vấp: `display: inline-flex` của `.chip` đè quy tắc `[hidden]` của trình duyệt → chip "Tắt hết" hiện cả khi chưa lớp nào bật; phải khai lại `.chip[hidden]{display:none}`.
- **Ô tìm kiếm thành viên thuốc sáng cố định** + kính lúp SVG data-URI (hex `#79706a` là ngoại lệ có chủ ý — SVG trong CSS không đọc được `var()`). Đã bỏ emoji 🔍 trong placeholder của `search.ts` vì đúp icon.
- **Icon lớp phủ theo thuật toán va chạm** (`ICON_VA_CHAM_THEO_ZOOM` trong main.ts): dưới zoom 9,5 icon chồng lấn tự ẩn (vòng tròn + vùng bấm giữ nguyên), từ 9,5 hiện đủ. Áp cả lớp tên đường.
- **Tách điểm trùng khi render** (`tachDiemTrung` trong main.ts): lưới 11 m, vòng xoáy góc vàng ≤~65 m, chỉ dời HÌNH HỌC GeoJSON — properties giữ lat/lon nguồn nguyên vẹn. Chữa hai bệnh cùng lúc: điểm sau đè điểm trước không bấm được, và mô hình 3D khử trùng theo khoá 5 chữ số nuốt mất mục sau.
- Nghiệm thu: `verify:chuquyen` 13/13 xanh SAU thay đổi; mắt thường xác nhận nhãn Hoàng Sa + Trường Sa khi bật 5 lớp; bấm chip bật đủ 5 lớp; bấm điểm jitter mở đúng popup («Di chỉ khảo cổ Làng Cả»).

### 🔜 Gom 34 nguồn → 1 nguồn cluster — ĐÃ THIẾT KẾ, chưa thi công
Chi phí cấu trúc còn lại (34 nguồn + 68 lớp) chỉ chữa được bằng gom nguồn + cluster toàn cục. **Chặn bởi**: `capNhatMoHinhDiem()` (mô hình 3D) đọc/ghi từng lớp `overlay-${id}` riêng (visibility, paint, queryRenderedFeatures theo danh sách lớp) — gom nguồn là phải viết lại tích hợp 3D, mà 3D chỉ nghiệm thu được trên Chrome GPU thật. Thiết kế đề xuất: 1 nguồn `overlay-gop` (cluster:true) + 4 lớp (cluster / đếm / điểm / icon), màu = mega-expression `["match",["get","lop"], …confExpr từng lớp]` (expression lồng được), popup = 1 handler đọc prop `lop` → conf. Làm ở phiên riêng, nghiệm thu 3D đầy đủ. **L**

### Còn lại
- [ ] **Chế độ trẻ em mới phủ được phần khung.** Topbar, nút, panel, bo góc, thang chữ đã đổi. Còn: giảm mật độ chữ trong hồ sơ tỉnh, minh hoạ thay khối chữ dài, ngôn ngữ đơn giản hơn cho `mo_ta`. Đây là việc **nội dung**, không phải CSS. **L**
- [ ] **Audit tương phản phần còn lại.** Mới đo topbar và nút. Chưa đo: 11 panel nổi, badge, popup MapLibre, khung quiz/olympia ở chế độ trẻ em. **M**
- [x] ~~**4 mã hex chưa lên token.**~~ **XONG 2026-08-11** (commit `99e4fac`) — 4 token mới trong `theme.css` (`--truyen-au-lac-nen`, `--story-retry-chu`, `--qg-badge-khac-nen`, `--nhan-huyen-su`), style.css hết hex giá trị.
- [x] ~~**`body.kid-mode` chồng lấn `data-che-do`.**~~ **QUYẾT 2026-08-11: GIỮ CẢ HAI.** Chúng KHÔNG cùng nghĩa: `data-che-do` là chế độ toàn cục người dùng chọn; `body.kid-mode` là trạng thái CỤC BỘ khi panel truyện đang mở (story.ts bật lúc mở, tắt lúc đóng — kể cả người lớn mở truyện vẫn được khung truyện thiếu nhi). Hợp nhất sẽ làm mất ca "người lớn đọc truyện cho con". Đừng mở lại trừ khi đổi UX truyện.
- [ ] Icon riêng cho mỗi lớp phủ thay chấm tròn `circle`. 6 icon đã đặc tả ở `docs/image-generation-spec.xml` (I01–I06). **M** — ⚠️ phạm vi thu hẹp từ 2026-08-04: ở chế độ 3D icon phẳng đã được thay bằng mô hình khối, việc này giờ chỉ còn cho chế độ 2D.
- [x] ~~Thanh trượt dòng thời gian, cụm control MapLibre, đầu bảng lớp còn dáng mặc định.~~ Xong 2026-08-04 — xem khối "ĐẠI TU HÌNH THỨC" cuối `style.css`.
- [ ] **Chế độ tối** — hệ token sẵn sàng. **Yêu cầu ĐÃ CÓ** (chỉ thị «làm hết» 2026-08-11) nhưng cố ý chưa ship trong phiên đó: mọi chế độ của dự án đều đã qua audit tương phản đo thật từng cặp màu, một palette tối chưa đo mà ship là phá kỷ luật đó. Việc gồm: bảng token tối + đổi nút chuyển thành chu kỳ 3 chế độ + đo tương phản như hai chế độ kia. **M**

### Không đụng vào khi redesign
`panels.ts` (sổ đăng ký 11 panel, học từ bug rò WebGL thật) · cơ chế `--topbar-h` đồng bộ động (`main.ts:210-218`) · ràng buộc chủ quyền trong style bản đồ (nền không nhãn, glyph tự host) · ARIA combobox của `search.ts`.

### Điểm nối JS↔CSS — đổi tên là vỡ
| Selector | JS phụ thuộc | Vỡ gì |
|---|---|---|
| `#app`, `#topbar-nav` | 7 module dùng làm neo `appendChild` | **Rủi ro cao nhất** — 6 panel động + ô tìm kiếm không gắn vào DOM được nữa |
| `--topbar-h` | `main.ts:212` `setProperty` | `--panel-top`/`--panel-maxh` — định vị của cả 11 panel |
| `.model3d-stage`, `.fig3d-stage` | `main.ts:1060`, `2384-2386` | Three.js đọc kích thước container qua class này → canvas co về 0px |
| `.active` | 9 điểm ở main/quocgia/timeline | Tái dùng ngữ nghĩa khác nhau ở ≥5 nơi |
| `.ol-right`/`.ol-wrong` | `olympia.ts` 189, 369, 446 | Phải sửa 3 chỗ đồng thời |
| `body.kid-mode` | `story.ts:131,133` | Toàn bộ cơ chế theme trẻ em hiện tại |
| `.muted` | `quiz.ts:188` query theo class chung | Utility class dùng lại nhiều nơi, phạm vi ảnh hưởng khó lường |

### Khả năng tiếp cận còn thiếu
- [x] ~~11 `<aside>` panel thiếu `role="dialog"`, `aria-modal`, không trả focus khi đóng.~~ Xong 2026-08-04 trong `panels.ts`: `role=dialog` + `aria-label` (ưu tiên `data-nhan`, vì 4 panel nạp nội dung không đồng bộ nên lúc mở còn rỗng) + đưa tiêu điểm vào panel khi mở + trả tiêu điểm ở `hideAllPanels()`. Đăng ký nốt library/game/quiz panel. **CỐ Ý KHÔNG làm focus trap**: các panel này không modal, bản đồ sau lưng vẫn kéo/bấm được — nhốt tiêu điểm trong hộp thoại không modal là bẫy người dùng bàn phím vào chỗ chuột thì đi ra được. Đừng "sửa" lại.
- [x] ~~`#province-panel` thiếu `aria-live`.~~ **XONG 2026-08-11** (commit `99e4fac`) — `#panel-content` mang `aria-live="polite"`.
- [x] ~~`<input id="timeline">` thiếu `aria-valuetext`.~~ Xong 2026-08-04 — đặt trong `setPeriod()`, đọc lên tên thời kỳ.
- [x] ~~Chưa có link "bỏ qua tới bản đồ" đầu trang.~~ Xong 2026-08-04. Lưu ý khi kiểm bằng harness headless: cửa sổ không có tiêu điểm thì `:focus` KHÔNG khớp dù `document.activeElement` đã đúng — phải bật `Emulation.setFocusEmulationEnabled`.
- [x] ~~Nối `public/icon.svg` + `public/manifest.webmanifest` vào `<head>`.~~ Kiểm lại 2026-08-04: **đã có sẵn** ở `index.html` dòng 11–12, mục này ghi thừa.

---

## 2. Cơ sở dữ liệu thống nhất

**Phát hiện quyết định**: không thể ép một schema phẳng. Chỉ trường `ten` đạt ≥80% trên toàn bộ 4.531 mục (83,6%). Phải thiết kế **ba tầng**:

| Tầng | Phạm vi | Đặc điểm |
|---|---|---|
| **Điểm** — nhân vật/địa điểm có toạ độ | overlays, 2.347 mục (52%) | Core 11 trường đạt 85–100% ngay trong tầng: `ten` `lat` `lon` `loai` `nguon` 100% · `do_tin_cay_toa_do` `trang_thai` 97,9% · `mo_ta` 96,3% · `dia_diem` 96% · `id` 93% · `nam_hien_thi` 85% |
| **Hồ sơ** — trang tỉnh | provinces, 34 mục | 1 bản ghi/file, lồng sâu, không toạ độ |
| **Tác phẩm/media** | literature, media, documentaries, games, timeline | Mỗi miền bộ trường riêng, chỉ chung khái niệm nguồn |

### Việc
- [ ] **Chỉ mục tĩnh** `public/data/_index/catalog.json` (cấp file) + `entries-index.json` (cấp mục, ~4.500 phần tử phẳng) + `validate_catalog_freshness.mjs` chặn chỉ mục chết. Theo mô hình PageIndex: **cho agent đọc chỉ mục rút gọn trước, chỉ mở file gốc khi đã khoanh vùng**. 🔄 đang làm
- [ ] Thống nhất tên trường nguồn. Hiện overlay dùng `nguon`, literature 6/8 file dùng `sources` còn 2/8 dùng `nguon`, `games` dùng `nguon` **kiểu chuỗi** thay vì mảng, `streets` `nguon` chuỗi cấp file. **M**
- [ ] Thống nhất tên khái niệm bị đặt nhiều tên: `do_tin_cay_toa_do` (overlay) ≡ `muc_do_tin_cay` (geo) · nguồn cấp file `sources[]` (32/34) vs `nguon_chinh[]` (2/34) · wrapper `items[]` vs `events` vs `features` vs `lien_ket` vs 4 mảng song song ở games. **M**
- [ ] **Khoá GeoJSON có dấu cách.** `boundaries/*.geojson` nhóm tỉnh dùng `"Tỉnh thành mới"`, `"GRDP 2024 (tỷ VND)"`, `"Diện tích (km2)"` — không dùng trực tiếp làm tên thuộc tính JS/SQL được. Map lại tên. **M**
- [x] ~~`di-tich-qgdb`/`unesco`/`bao-vat` thiếu `id`.~~ **XONG 2026-08-11** (`cebb209`+`dbecb25`): bao-vat hoá ra ĐÃ có id từ trước (số PLAN lỗi thời); thêm 152+13 id cho hai file kia. Bài học: 4 id mới va id cũ xuyên file (Văn Miếu, Côn Sơn–Kiếp Bạc, Phong Nha, Thành Nhà Hồ) — cổng validator bắt được; quy tắc «id mới nhường id cũ», unesco mang hậu tố `-unesco`.
- [x] ~~`to-nghe` trộn kiểu `nam_hien_thi`.~~ **XONG 2026-08-11** (`cebb209`) — 14 mục số → chuỗi.
- [x] ~~🔴 **`chien-dich-tran-danh.json` hai CẶP `loai` ĐỒNG NGHĨA** — `chong-phap` 8 ⟷ `khang-phap` 21 · `chong-my` 4 ⟷ `khang-my` 62.~~ **ĐÃ XONG từ commit `1dc1b73`** — đếm lại 2026-08-06: `chong-phap` = **0**, `chong-my` = 0, còn `khang-phap` 37 · `khang-my` 66. Mục này đã lỗi thời khi tôi đọc nó và tôi suýt cử agent làm lại. **Đếm trước khi tin.**
- [x] ~~`cap_nhat` lẫn `ngay_cap_nhat`.~~ **XONG 2026-08-11** (`cebb209`) — hai giá trị LỆCH thật (7-19 vs 7-26; 7-18 vs 8-03), `ngay_cap_nhat` mới hơn ở cả hai, 0 code đọc `cap_nhat` → đã bỏ trường cũ.

**Không phải lỗi, đừng "sửa"**: 26 id + 34 slug trùng chéo file là **có chủ ý** — chúng đang hoạt động như khoá ngoại giữa các miền (`bach-dang-938` nối 3 miền; `slug="hue"` nối media/provinces/story). Việc cần làm là **chính thức hoá** chúng, không phải khử trùng.

---

## 3. Nội dung — làm đầy

### Chặn bởi con người
- [x] ~~**442 draft chờ cổng §9.**~~ **XỬ XONG 2026-08-11 — và con số 442 lỗi thời: đếm thật là 1.429.** Chủ dự án ra nguyên tắc «nguồn chính thống là được duyệt» + «làm hết»: nâng **1.413 → reviewed**; GIỮ draft đúng 16 mục = 2 khớp `section9-sensitive.json` + 14 `cong-trinh-ky-luc` (treo Q3). Cổng validate 13/13 + audit chủ quyền đạt sau nâng.
- [ ] **`phim_trang_thai` — đếm lại 2026-08-11**: 200 mục mang trường này trong `figures/danh-nhan.json`, trong đó **155 draft, TOÀN BỘ là kênh ngoài nhà nước** (0 kênh state còn draft — quy tắc 13 không tự duyệt được). 301 tiểu sử (`trang_thai`) đã nâng trong đợt §9 2026-08-11. Còn treo THẬT: 155 video kênh verified/khác chờ người duyệt. **M**

### Lỗi dữ kiện — TRA XONG 2026-08-06. Trong 8 mục, chỉ 5 là lỗi thật.
- [x] ~~`le-nhan-kiet` khoa Tân Sửu 1651 hay 1661~~ → **1661** (1651 là Tân Mão; bản ghi tự mâu thuẫn giữa can chi và năm dương). Đã sửa `nam_hien_thi` + `mo_ta`.
- [x] ~~`tran-hoang-na` lệch tuổi hy sinh~~ → 1962 **→ 1964**, khớp «tháng 8/1964» và tuổi 15 trong chính nguồn.
- [ ] ⛔ `duong-van-manh` **KHÔNG TRA ĐƯỢC** — nguồn gốc tự mâu thuẫn (14 ≠ 16 tuổi) và mọi nguồn lặp y hệt, không có số thay thế. Để nguyên, **đừng đoán**. **S**
- [x] ~~`bien-gioi-tay-nam-1978-1979` ba mốc năm mâu thuẫn~~ → **không phải chọn 1 trong 3.** `nam: 1978` tự mâu thuẫn với `nam_hien_thi: "1977–1979"` trong CÙNG bản ghi (đã sửa → 1977). Còn «1977–1979» (mốc chiến tranh chính thức) và «1975–1978» (mốc thống kê thiệt hại do xâm phạm lẻ tẻ) **đều đúng** — chính nguồn Bảo tàng LSQG dùng cả hai cho hai mục đích trong cùng bài. **Giữ cả hai, đừng ép về một.**
- [x] ~~`nguyen-an-nien`, `trieu-kim-van` năm mất 2026~~ → **KHÔNG PHẢI LỖI**, mất thật (8/4/2026 và 24/6/2026), khớp tuổi thọ, đúng nguồn đã trích.
- [x] ~~Phong Nha lệch ~18 km giữa `di-tich-qgdb` và `unesco`~~ → sửa về đúng toạ độ **đã có nguồn** trong `unesco.json` (106.283, 17.53), không bịa số mới. **Bảy cặp trùng còn lại lệch lớn nhất 1,9 km (Tràng An), phần lớn dưới 500 m — KHÔNG phải lỗi, đừng "sửa".**
- [x] ~~Không Lộ vs Nguyễn Minh Không~~ → tranh luận sử học **chưa ngã ngũ**, ngay nguồn nhà nước cũng không kết luận. Giữ hai mục tách riêng theo phe «hai người» (căn cứ niên đại + đời vua phục vụ) và thêm `ghi_chu_bien_tap` ở cả hai. **Đừng gộp mà cũng đừng coi là đã kết luận.**
- [x] ~~Nữ TNXP Đồng Lộc ↔ Võ Thị Tần trùng marker~~ → đã tự giải quyết sau đợt bỏ mục gộp, cách nhau 3,75 km.
- [ ] ⚠️ Phát hiện phụ chưa xử: **9 nữ TNXP Đồng Lộc còn lại dùng chung một toạ độ giữ chỗ**, lệch 1,6–2 km khỏi cụm thật. Không khẩn, nêu để người duyệt §9 biết. **S**
- [ ] ~10 mục lệch `loai`/file. ⚠️ Nhiều file nguồn **đã bị gộp ở Phase 3** — kiểm lại tên file/id sau merge trước khi áp, có thể một phần đã tự giải quyết. **S/M**
- [ ] Trùng người ↔ sự kiện: 4/8 mục `khoi-nghia-bac-thuoc` trùng bản sự kiện đầy đủ ở file khác · `thai-phien` ↔ `duy-tan-1916` · Không Lộ vs Nguyễn Minh Không (một hay hai người — cần tra sử) · ~8 di tích trùng `di-tich-qgdb` ↔ `unesco` (Hạ Long, **Phong Nha lệch ~18 km**, Huế, Hội An, Mỹ Sơn, Hoàng thành TL, Thành nhà Hồ, Tràng An) · Nữ TNXP Đồng Lộc ↔ Võ Thị Tần trùng marker. **M**
- [ ] `di-tich-qgdb.json` header ghi toạ độ lấy từ Wikipedia/Wikidata — vi phạm nguyên tắc không-Wikipedia dù chỉ dùng cho toạ độ. Tái tính qua Nominatim / dsvh.gov.vn. **M**

### Lớp còn mỏng — đếm lại 2026-08-11, danh sách cũ SAI GẦN HẾT
Số thật: `nghia-si-can-vuong` **48** · `thanh-hoang-danh-than` **46** · `nha-the-thao-lich-su` **28** (VĐV Olympic đã bổ sung đợt 2026-08-11) · `danh-y-luong-y` **16** (Tuệ Tĩnh + Hải Thượng Lãn Ông đã có mục riêng từ trước) · `khoa-bang-nam-trung-bo` + `dich-gia-ngon-ngu-hoc` **không tồn tại** (đã gộp Phase 3 vào khoa-bang-danh-nhan 167 / danh-nhan-van-hoa 106). Lớp mỏng cuối `me-vnah` **14 → 25** cùng ngày (agent bồi 11 Mẹ, nguồn Bộ Công an/CA tỉnh/đài tỉnh/SK&ĐS; 9 ứng viên bị loại vì nguồn yếu/mâu thuẫn — kỷ luật giữ nguyên). **KHÔNG còn lớp nào dưới ngưỡng 15.**

### Thơ văn Hồ Chí Minh — hai mục CỐ Ý không nạp, đã truy hai lượt (2026-08-04)

Ghi ở đây để đừng ai đi tra lượt thứ ba rồi nạp bù.

**Quy thuộc tồn nghi — ĐÃ XỬ, đừng mở lại (chủ dự án quyết 2026-08-04: «giữ hết»).**
- `Dân cày` và `Công nhân` (báo Việt Nam Độc Lập, 1941) trước bị để ngoài vì báo Cao Bằng ký **«Khuyết danh»** và không mục nào trong danh sách bút danh chính thức gắn với hai bài. Nay **đã nạp** vào nhóm riêng `nhom: "ton-nghi"` — có cảnh báo cấp nhóm trong thư viện và cảnh báo trong từng mục, `tac_gia` để đúng chữ "Khuyết danh", không nhận là tác phẩm của Bác.
- **Điều kiện chuyển sang nhóm thường**: một mục trong danh sách bút danh chính thức ghi đích danh bài, hoặc một nguồn chính thống khác khẳng định tác giả. Chưa có thì để nguyên nhóm `ton-nghi`. Đừng suy từ việc "báo ấy hầu như chỉ Bác viết".
- Đối chiếu: `Phụ nữ` và `Trẻ con` nằm ở nhóm thường vì `tulieuvankien` xác nhận đích danh bút danh «Kim Oanh» (số 104, 1/9/1941) và «Bé Con» (số 106, 21/9/1941) ký dưới đúng hai bài đó.
- Bài chúc Tết **1943** (niên đại tranh luận): chủ dự án quyết **giữ**, kèm nguyên cảnh báo hai nguồn vênh nhau. Không còn là câu hỏi bỏ ngỏ.

**Ngục trung nhật ký — ĐÃ XONG 2026-08-04, đừng cử lô tra mới.** 117 mục phủ kín 133 số bài của tập, lấy từ bản PDF NXB Chính trị quốc gia Sự thật 2015 (font CID, phải qua bảng `/ToUnicode` — công cụ bóc ở `scripts/boc_pdf_tounicode.mjs`, chạy lại ra đúng từng byte). Ba bài không nạp: bài 1 và 108 đã có sẵn dưới tên khác, bài 101 «Liễu Châu ngục» nguyên bản chỉ có đầu đề không có thơ. **Đừng đi tra web cho tập này** — đã chứng minh ngõ đó chỉ dẫn tới nguồn bị cấm hoặc PDF ảnh quét.

**Không tìm được nguyên văn trên nguồn chính thống.**
- `Trẻ chăn trâu` (21/11/1942). Lượt đầu tưởng do công cụ chặn; lượt hai crawl thô vượt được lỗi redirect của `qdnd.vn` và thấy trang **thật sự chỉ có một câu giới thiệu podcast**, không có bài thơ. Đây là thiếu thật, không phải lỗi công cụ.
- `Tầm hữu vị ngộ`. Chỉ có trên thivien.net và blog cá nhân — nguồn bị cấm.

---

### Cần xác minh trạng thái, chưa rõ xong hay chưa
- [x] ~~`expansion-thoigian-plan.md` 6 cell A–G không có bằng chứng trạng thái.~~ **Đếm 2026-08-11**: danh-nhan-quan-su-co-trung-dai **92** · thien-su-cao-tang **26** · su-than-ngoai-giao **25** · danh-y-luong-y **16** — cả 4 file đích đều dày gấp nhiều lần chỉ tiêu cell gốc; các cell coi như phủ xong qua các sóng sau, không cần truy vết từng cell nữa.
- [ ] `abc-tri-an-plan.md` mục "16 geocode flagged" **tự mâu thuẫn nội bộ**: dòng cuối ghi "chưa làm" nhưng nội dung trên cho thấy 13/16 là false-positive đã kết luận + 3/16 đã sửa = 16/16 xong. Xác nhận lại trước khi coi là việc còn treo. **S hoặc 0**

### Chưa nối dây — có dữ liệu thật nhưng UI không đọc
- [x] ~~`public/data/timeline/events.json` (34 mục, nguồn NQ 202/2025/QH15) — không module TS nào đọc.~~ Nối dây 2026-08-04: panel tỉnh (thời kỳ 34 tỉnh) hiện dải «Hợp nhất A + B — Nghị quyết 202/2025/QH15, hiệu lực 1/7/2025» kèm link cổng Chính phủ. Nạp lười một lần, tra theo trường `to`.
- [x] ~~`di-tich-quoc-gia-candidates.json` 11 mục chờ chọn.~~ **ĐÃ XỬ TỪ LÂU, mục này lỗi thời** — kiểm 2026-08-11: lớp `di-tich-quoc-gia.json` tồn tại (258 mục), 9/11 candidates đã trong đó; 2 mục còn lại (ATK Chợ Đồn, Chương Thiện) bị LOẠI CÓ CHỦ Ý vì là QGĐB đã có sẵn ở `di-tich-qgdb` (commit `959cc3c`). Không còn gì để làm.

### Nguồn ngoài đang xem xét
### Mỏ dữ liệu di tích — 2.445 mục cần tra nguồn

Nguồn danh mục: bảng cộng đồng "Muôn xã Muôn phường", 5.094 dòng, phân loại theo phường/xã sau sáp nhập 2025. Bóc được **3.386 mục**, đối chiếu với 34 file overlay:

| | Số mục | Tỉ lệ |
|---|---|---|
| Đã có trong CSDL | 319 | 9,4% |
| — trong đó khớp thật (không phải khớp nhầm sang bài nhân vật) | 296 | |
| Khớp một phần, cần người soát | 622 | 18,4% |
| **Còn thiếu — mỏ dữ liệu** | **2.445** | **72,2%** |

Phân loại phần còn thiếu: di tích lịch sử văn hoá 2.122 · **di tích quốc gia đặc biệt 196** · công trình kiến trúc 98 · danh thắng 29.

✅ **Quyết định đã chốt (2026-08-03)**: dùng làm **danh mục gợi ý**, tự đi tra nguồn chính thống cho từng mục. Bảng là draft **không trích dẫn nguồn từng mục** và tác giả yêu cầu liên hệ trước khi dùng — nên dữ liệu vào CSDL phải do ta tự tra. Mục nào không tra được nguồn chính thống thì không nạp.

Checklist ở `docs/backlog/di-tich-can-tra-nguon.json` (2.445 mục) và `di-tich-da-co-doi-chieu.json` (319 mục). **Đây là CHECKLIST, không phải dữ liệu** — không nạp thẳng vào `public/data/`.

#### ✅ 196 di tích QGĐB — tra nguồn xong cả 3 lô

🔴 **Phát hiện quan trọng nhất của cả chiến dịch: 196 "mục thiếu" thực ra chỉ là khoảng 45 di tích QGĐB thật.** Phần lớn là **hạng mục thành phần** của một cụm đã được xếp hạng bằng **một quyết định duy nhất**. Nạp thẳng theo danh sách gốc sẽ tạo ra 8 bản ghi "VQG Cát Tiên", 5 bản ghi "ATK Định Hoá", và gán số quyết định của cụm cho từng điểm như thể mỗi điểm được xếp hạng riêng — **sai hồ sơ xếp hạng**.

| Lô | Mục gốc | Bản ghi sau gộp |
|---|---|---|
| 1 — QN, HN, QB, BN, LĐ, ĐN… | 66 | 57 |
| 2 — ĐB, HY, NA, HP, TN… | 65 | 61 |
| 3 — Huế, NB, QT, CB… | 65 | 63 |
| **Tổng** | **196** | **181 bản ghi / 33 cụm mẹ / 14 di tích độc lập** |

Kết quả ở `docs/backlog/lo{1,2,3}-ket-qua.json` và `lo{1,2,3}-khong-tra-duoc.json`.

**Chất lượng — đo bằng script, không ước lượng:** 0 mục thiếu nguồn · 0 mục thiếu số quyết định · **0 Wikipedia** · 0 trùng tên giữa các bản ghi · 26 mục đã gắn cờ `trung_unesco`.

**Toạ độ: 1/181 mục có lat/lon.** Quyết định xếp hạng mô tả địa giới hành chính chứ không có toạ độ — hạn chế của loại nguồn, không phải thiếu sót của người tra. Phân bố `do_tin_cay_toa_do`: cao 1 · trung 54 · thấp 126.

⚠️ **Lỗi đã bắt và sửa khi kiểm:** cụm "Đường Trường Sơn" bị tách làm hai vì một lô dùng gạch nối `-`, lô kia dùng gạch ngang `–` — 15 bản ghi bị lạc khỏi cụm. Đã chuẩn hoá về `–` (khớp cách viết của dsvh.gov.vn), cụm giờ gom đủ 28 bản ghi. **Bài học: tên cụm là khoá nhóm, phải chuẩn hoá dấu câu trước khi gộp.**

**Quyết định mô hình (mặc định đã chọn, đổi được):** giữ **bản ghi con** kèm trường `thuoc_cum` trỏ về cụm mẹ, thay vì gộp thành bản ghi cụm kèm `hang_muc[]`. Lý do: các hạng mục con có địa chỉ khác nhau thật và người dùng tìm theo tên con ("chùa Một Mái") nhiều hơn tên cụm. Trường `xep_hang` ghi rõ đây là quyết định **của cụm**.

**Ngoại lệ đã gộp** vì thật sự là một di tích bị tách theo đơn vị hành chính: VQG Cát Tiên (8 dòng → 1) · Tây Thiên–Tam Đảo (2 → 1) · ATK Định Hoá (5 → 1) · Đôi bờ Hiền Lương (2 → 1).

🔴 **16 mục lô 3 trùng UNESCO** — Quần thể Cố đô Huế (11), Cố đô Hoa Lư (11 mục nhưng nằm trong vùng lõi Tràng An), Tràng An–Tam Cốc–Bích Động (3). Dự án đã có sẵn ~8 di tích trùng giữa `di-tich-qgdb` và `unesco`. **Không tạo bản ghi độc lập** — gắn `trung_unesco: true` và liên kết.

- [x] ~~Dry-run đối chiếu chéo với `entries-index.json` trước khi nạp.~~ **XONG 2026-08-06** — trùng tên chính xác mới×cũ: 4 · trùng nội bộ 181×181: **0** · biến thể y/i: 0 · toạ độ <200 m: 0. Còn ~14 cặp «chứa cụm từ» cần người soát (Hồ Hoàn Kiếm–Đền Ngọc Sơn, Văn Miếu–QTG, Đền Trần–Chùa Phổ Minh, Cát Bà, **Cát Tiên — 2 cụm mới trỏ cùng 1 điểm cũ, nghi một vườn bị tách hai hồ sơ**).
- [ ] 🔴 **Toạ độ: mâu thuẫn trong chính hồ sơ đã giải — nhưng vẫn chặn cách nạp.** Đếm thật 2026-08-06: **1/181 mục có lat+lon dùng được** (Trấn Hải Thành). 180 mục kia `lat=null/lon=null` mà **vẫn** mang `do_tin_cay_toa_do` trung(54)/thấp(126) — trường này đang dùng như nhãn «độ chi tiết địa lý mà nguồn mô tả», dự phòng cho bước geocode sau, **không phải** đánh giá độ tin cậy của một con số đã có. Không phải lỗi dữ liệu, chỉ là hai trường dễ đọc nhầm thành mâu thuẫn.
   **Nhưng phát hiện quan trọng hơn**: `di-tich-qgdb.json` hiện tại (152 mục) đã dùng mô hình **1 toạ độ/cụm + `diem_thanh_phan[]` không toạ độ cho điểm con**. Đối chiếu 47 đơn vị cấp cụm của bộ 181 với 152 mục cũ: 6 khớp chính xác + 30 khớp lỏng đã CÓ toạ độ sẵn → **chỉ 11/47 thật sự cần tra toạ độ mới**, không phải 180. Lớp phủ vẫn khả thi; sai là ở **độ hạt** nếu nạp phẳng theo bản ghi con. **M**
- [ ] ⚠️ Hai lỗ hổng lộ ra khi rà tay 30 cặp khớp lỏng: «Bạch Đằng» đã có trong CSDL **có thể là trận 938/981 chứ không chắc 1288** · **«Đường Trường Sơn – HCM» (28 bản ghi con, 11 tỉnh) là một TUYẾN chứ không phải điểm** — gán một toạ độ là sai kiểu hình học, không phải thiếu dữ liệu. Cần bàn riêng trước khi nạp. **M**
- [x] ~~Xác minh 5 điểm agent tự gắn cờ nghi ngờ.~~ **4/5 xong 2026-08-06**, tra bằng `dsvh.gov.vn` thật: «Chùa Trình» = Chùa Bí Thượng ✅ · «Ngọa Vân» đã tự giải đúng từ trước · Văn Miếu **10/05/2012** (hai trang dsvh độc lập cùng ghi) · Núi Trường Lệ **QĐ 1954/QĐ-TTg 31/12/2019** — nay có nguồn dsvh, không còn chỉ mỗi báo tỉnh.
- [x] ~~⛔ 11/26 điểm Điện Biên thuộc đợt 2009 hay 2015.~~ **GỠ CHỐT ca đêm 2026-08-12**: agent truy được **nguyên văn danh sách 23 điểm bổ sung QĐ 2367/QĐ-TTg 23/12/2015** qua 2 nguồn nhà nước khớp chéo (dsvh.gov.vn + TTXVN) — lưu tại `docs/research/dien-bien-phu-23-diem-bo-sung-2015.json`. 15 mục checklist khớp trực tiếp đợt 2015; 11 điểm nổi tiếng (A1, Him Lam, Hồng Cúm, hầm Đờ Cát, C1-C2, cầu Mường Thanh, Bản Kéo, E1, Noong Nhai, Sở chỉ huy Mường Phăng) = đợt 2009 **bằng loại trừ** (văn bản gốc 1272/QĐ-TTg kèm phụ lục vẫn chưa tìm được — ghi rõ là suy luận). Còn treo duy nhất: Cứ điểm 310 (Claudien) không khớp danh sách nào. Tổng 22+23=45 điểm khớp số liệu nhandan/dsvh. **S**
- [x] ~~16 mục lô 3 trùng UNESCO đã gắn `trung_unesco` chưa.~~ Kiểm 2026-08-06: con số thật là **25** (Huế 11 + Hoa Lư 11 + Tràng An 3), brief ghi 16 là ước lượng ban đầu. **100% đã gắn đúng**, không sót mục nào. Cộng Hoàng thành Thăng Long ở lô 1 = 26, khớp.
- [x] ~~Hai mục hoá ra KHÔNG phải QGĐB cần tách.~~ Kiểm 2026-08-06: đã nằm sẵn trong `lo1/lo3-khong-tra-duoc.json`, **không có trong bộ 181** — vòng tra nguồn đã xử đúng từ đầu, mục này ghi thừa.
- [ ] **Hai mục hoá ra KHÔNG phải QGĐB**, đưa vào lớp di tích quốc gia thường: Nhà 48 Hàng Ngang (QĐ 54/VH-QĐ 29/4/1979) và Hang Ngườm Bốc (QĐ 02/2004/QĐ-BVHTT 09/01/2004 — **và danh sách gốc còn ghi sai tỉnh**, thật ra ở Cao Bằng chứ không phải Tuyên Quang). **S**
- [ ] 2.122 di tích lịch sử văn hoá — **CHIẾN DỊCH MỞ 2026-08-11.** Sàng trùng-tên-chính-xác toàn DB: còn **2.114**. Phân bố dày nhất: Hà Nội 597 · Huế 138 · Hải Dương cũ 118 · TP.HCM 104 · Thái Bình cũ 91 · Nghệ An 91. **Wave 1 XONG 2026-08-11** (commit `e72b7a3` `0d3327b` `fc6ce0d`): 135 mục xử → **27 lên lớp bản đồ** (Huế 5 · Hải Dương 4 · Hà Nội 18, đều nguồn nhà nước đã fetch + toạ độ tin được) · **56 vào kho** `docs/backlog/wave1-ditich-cho-xu-ly.json` (42 can_xac_minh kèm số QĐ mồi tra · 10 cap_tinh · 4 cho_toa_do) · 46 không tra được · 6 trùng bắt đúng. `di-tich-quoc-gia` 258→285. **Bài học Wave 1**: (1) blog tổng hợp chilinhquetoi.com là nguồn xám nhưng số QĐ của nó là mồi đối chiếu dsvh cực nhanh — đừng vứt, đừng nạp thẳng; (2) Nominatim khớp GIẢ dày đặc ở xã sáp nhập 2025 (2 lần cùng rơi «Trạm Y tế Phong Xuân», «Hương Điền»≠«Điền Hương») — chỉ nhận khớp POI đúng tên; (3) checklist gốc có ≥4 lỗi gán sai đơn vị hành chính — rà lại script sinh checklist trước Wave 2; (4) agent phân hạng nguồn [WF-gov]/[WF]/[WS-only] ngay trong báo cáo giúp phân luồng nhanh — đưa vào brief mẫu các wave sau. **Wave 2 XONG 2026-08-11** (commit `20df9ba` `9ffa415`): 135 mục xử → **32 lên bản đồ** (TP.HCM 8 · Thái Bình cũ 3 · Nghệ An 21 — lô Nghệ An tốt nhất chiến dịch nhờ brief bắt buộc nhãn nguồn) · 41 vào kho · 63 không tra được (trong đó ~29 có mồi QĐ chờ lượt fetch bổ sung) · 2 trùng bắt đúng · +4 lỗi checklist mới phát hiện (Ngô→NGUYỄN Quang Bích, Đông Quan→Đông Á, Điện Ngọc Hoàng Tân Định→Đa Kao, Nguyễn Tiềm lệch xã). Nút thắt hạ tầng lặp lại: cert/DNS .gov.vn cấp xã (Nghệ An, Thái Bình) chết hàng loạt → nhiều mục kẹt ở synopsis; giải pháp đã dùng: proxy đọc (tiền lệ) hoặc chờ lượt fetch riêng. `di-tich-quoc-gia` **307** · `di-tich-cap-tinh` **20**. ✅ **Câu hỏi A/B chốt 2026-08-11: chủ dự án chọn A — lớp «di-tich-cap-tinh» ĐÃ MỞ** (commit `fbe2384`, lớp phủ 33→34): 10 mục Huế từ kho + 5 mục cấp-tỉnh di trú khỏi lớp quốc gia; các wave sau nạp cấp-tỉnh THẲNG vào lớp này, kho cap_tinh chỉ còn cho ca thiếu nguồn/toạ độ. **Vét kho + Wave 3 CHẠY SONG SONG, XONG 2026-08-11** (commit `ddf88c2` `4faa206`, 9 agent song song): **61 mục lên bản đồ trong một phiên** — vét kho 49 (Huế–Nghệ An 12 · Hà Nội 8 · Hải Dương 14 · TP.HCM 14 · Nam Định 1) + Wave 3 lát B 12 (Tây Hồ + Đông Anh). `di-tich-quoc-gia` **355** · `di-tich-cap-tinh` **33**. Số thật trước khi cắt lô (đếm lại — PLAN cũ ghi 552/70/63 đều lệch): Hà Nội còn 623 · Nam Định cũ 73 · Hà Nam cũ 65. **Kho v2**: cho_toa_do **52** (toàn mục nguồn-ĐẠT chỉ thiếu toạ độ: 37 lát A + 4 HCM + 3 Thái Bình + 3 Nam Định…) · can_xac_minh **141** (leads NĐ/HNam/HN kèm số QĐ mồi) · khong_tim_thay **63** (mảng mới, có lý do từng mục). **Bài học mới**: (5) Overpass thay Nominatim làm đường geocode chính (POI + số nhà — 3 hội quán Chợ Lớn khớp đúng số nhà) nhưng PHẢI soát tay khớp giả (6 ca chợ/bến đò/trạm xăng trùng tên đình) và endpoint hay 504 → chạy nền nhịp 9s; (6) bug chuẩn hoá **đ→d** (NFD không tách chữ Đ) làm trượt guard hàng loạt — đã sửa trong mọi script neo; (7) danh sách tổng hợp SVHTT TP.HCM (svhtt.hochiminhcity.gov.vn — bản KHÔNG www) là nguồn vàng cho toàn bộ di tích HCM; (8) hungyen.gov.vn mirror nội dung thaibinh.gov.vn cũ, kết hợp r.jina.ai = đường vòng chuẩn cho Thái Bình (domain gốc chặn tầng mạng, IP 113.160.201.60); (9) tayho360.vn / donganh360.vn là cổng UBND phường/xã thật — mạng «X360» đáng thử ở quận huyện khác; (10) checklist thêm 4 lỗi nhãn: 3 mục gắn `dtlsqgdb` sai (Mạch Tràng QG 1997 · Cầu Cả-Uy Như cấp TP 2003 · Thư Cưu cấp TP 2011 — chỉ nằm trong vùng bảo vệ Cổ Loa) + «Đảo Thục»→Đào Thục; ngược lại «Yên Trung» cho đền Đinh Bạt Tụy hoá ra ĐÚNG (tên xã mới 2025) — agent báo lỗi mới là bên nhầm. **Nợ chuyển phiên sau**: lượt geocode 52 mục cho_toa_do (chờ Overpass vắng tải) · phân xử 2 điểm Quỳnh Đôi vênh ~8 km kinh độ (`ho-tung-mau` 105.600 vs `dinh-lang-quynh-doi` 105.684) · 4 xung đột treo có hồ sơ: Liễu Tràng (cấp tỉnh/QG), Huề Trì (3 mốc 1974/1984/2017), Liễu Giai (gộp/tách đền-đình), Tảo Dương (1982/1985). Còn ~1.700 mục checklist chưa xử. **CA ĐÊM 11→12/8 (lệnh «làm đến 07:00») — XONG, 40 đợt commit `50876ec`→`e3ac2ad`**: Wave 4-16 quét **28 lát tỉnh** (~700 mục checklist xử thêm), kho `wave1-ditich-cho-xu-ly.json` **121→538 cho_toa_do · 340→496 can_xac_minh · 166→271 đóng-có-lý-do** — toàn bộ nguồn-đạt chờ MỘT lượt geocode ban ngày (Overpass sập trọn đêm, máy quét 0/49; lô HCM có sẵn số nhà). **Phát hiện lớn nhất**: (a) LỖI PIPELINE CSV — 7 dòng «Sóc Trăng» thực là di tích Huế bị ghép chéo cột ten↔don_vi (dải 1445-1474) + don_vi «Vĩnh Tường»(VP) gán Cù Lao Dung → RÀ SCRIPT SINH CHECKLIST trước wave sau; (b) chuỗi lỗ hổng DB lộ ra và đã vào kho: cụm QGĐB Yên Thế 548/2012 · Kim Bình 2499/2016 · XVNT 1959/QĐ-TTg 11/9/2025 (đợt 18 — mới nhất VN) · Phủ Dầy · Lăng miếu Triệu Tường · chùa Tổ Man Nương · tháp Tường Long · chùa Dư Hàng · Thạch Động + Mũi Nai · bãi đá cổ Sa Pa + đền Thượng LC + Mường Hoa · đền Chu Văn An Phượng Hoàng · **bia chủ quyền Trường Sa 1956 (ƯU TIÊN — bất di bất dịch #1)**; (c) ĐÓNG 4 NỢ PLAN: Tứ Trấn (chìa 93/QĐ-TTg 18/01/2022) · Sở Ấn Loát = 2 hồ sơ in tiền riêng (Trung Bộ Huế ≠ TW Tuyên Quang; + Chi Nê HB = bộ 3) · Trung đoàn 33 nâng QG 4248/QĐ-BVHTTDL 2024 (fetch xác nhận) · trả diem_thanh_phan ATK 13 + Kha Sơn 7 + KN-1917 3 (kèm nợ mới: nhà Mạc 5 · lăng Lý 11 · Phố Hiến 16 · Yên Thế 23 · Kim Bình 52 · Sầm Sơn 5 · Bạch Đằng 7 · Đông Triều 11 · Cố đô Huế 14 · Côn Đảo · K20 4 · Quỳnh Lưu · Đồng Khởi); (d) **HỆ QĐ-ĐỢT** thành công cụ đối chiếu: 1288/16-11-1988 ≥11 mục 4 tỉnh · 100/21-1-1989 4 tỉnh · 993/28-9-1990 3 tỉnh (chốt biến thể ngày Yersin) · 97/21-1-1992 · 43/7-1-1993 · 2015/16-12-1993 · 3211/12-12-1994 + 2233/26-6-1995 (củng cố số nghi NA↔BG/HD) · 188/13-2-1995 CB↔HT · 1568/20-4-1995 (giải nghi án AI gán chéo) · 24/1/1998 SL · 01/4-1-1999 3 đình ĐN · 12/2/1999 3 tỉnh · 28/12/2001 3 tỉnh · 51/27-12-2001 lần 4 (**đình Ngô Nội BN ghi 27/1 gần chắc SAI ngày**) · 02/2004 hai ngày vênh (9/1 CB vs 19/1 ĐT — đối chiếu) · 3/8/2007 · 22/1/2009 · 20/8/2013 3 tỉnh · 07/01/2020 lần 6 · 27/10/2020 5 số 4 tỉnh · 24/2/2023 chuỗi 392-397 4 tỉnh · 12/2/2026 (319 Trần Phú + 325 Vị Khê); đợt QGĐB: 548=7 hồ sơ · 1419=4 · 2408=3 · 2499=3 · 1954=4 · 2082=2 · 1820/2018=kép (Ngũ Hành Sơn + 9 điểm Trường Sơn) · 2383+2367; (e) **BỘ QUY TẮC PHÂN ĐỊNH 12 HỆ** ≠ xếp hạng di tích: hạng bảo tàng (16 ca) · Geopark/UNESCO-thiên-nhiên · OCOP · điểm du lịch · DSVH phi vật thể · cây di sản · bảo vật (có thể CAO hơn công trình chứa — ca chuông Thần chung) · biệt thự nhóm-1 HN · kỷ lục VietKings · bảo trợ Liên hiệp UNESCO-hội · sắc phong triều đình · xếp hạng tiền-1945 (Nghị định Toàn quyền 1925 — hết pháp lý) · QĐ tu bổ/thành lập; (f) **PHÉP THỬ NIÊN ĐẠI hậu tố QĐ**: BVHTTDL chỉ từ 2007 (BVHTT trước đó, kể cả trước 1995) — bắt 3 số giả; danh sách đen: 15/2003 (ổ nhiễm Wikipedia 4 mục 2 tỉnh); (g) ATK/vùng QGĐB = CẤU TRÚC 2 LỚP (điểm chính thức trong QĐ cụm ≠ di tích độc lập cùng huyện) — cấm gộp bừa; (h) checklist: don_vi = tên xã mới 2025 HỢP LỆ (đa số ca «vênh» wave trước được giải oan: Yên Trung, Phú Xuyên↔Yên Lãng, Gia Sàng, Tam Thắng…) nhưng có 4 lỗi don_vi THẬT (thành nhà Mạc LS · Hưng Ký-Mai Sau lệch quận · Trương Công Hy Điện Bàn↔Núi Thành · nghi Giáp Ba NĐ) + 2 nghi NHẦM TỈNH (Ngườm Bốc→CB đã xác nhận đúng chỗ; 2 chùa «Huế» chỉ có ở Móng Cái) + lỗi gõ (Đồn→Đền Phố Ràng · Trạm Than→Thản · Đoàn Văn Cừ→Cự · Ngọc Giao→Dao · Phất→Phúc Lộc · Đền→Đồn Cả Phan Bá Vành) + ~15 cặp dòng trùng nội bộ đã gộp; (i) nguồn vàng mới: **PDF danh mục kiểm kê 271 di tích Cao Bằng kèm đủ số QĐ** (mẫu «văn bản kiểm kê tỉnh» — SĂN cho mọi tỉnh) · bacninh.gov.vn từng-di-tích · lichsudangbo + sovhttdl.haiphong · nahang.tuyenquang · danh sách 185 di tích SVHTT-HCM · muinaihatienresort danh-sách-9 · trungtambaotonditichquocgiacondao; (j) hạ tầng chết thêm: bacgiang + kiengiang + thuathienhue/hue + soctrang + quyhoach.laocai DNS toàn cụm · haiduong + dienbien + namdinh + nam-đàn + phutho cert · baoquangbinh + baodongkhoi + biengioibienbentre + ditichkhanhhoa ECONNREFUSED · **r.jina.ai HẾT vượt được chặn thaibinh (422) → Wayback** · 2 domain di sản BỊ CHIẾM DỤNG (baohoabinh URL cũ → hoinhabaobacninh; dulichsoctrang.org → trang cá cược) — cảnh giác; (k) cảnh báo biên tập mới: chùa Phổ Quang PT **cháy 10/2024** (bảo vật bàn thờ Phật đá) — mo_ta phải nêu hiện trạng (cùng lớp đền Lưu Xá). Chuẩn kho mới: di tích thập niên 60-90 chấp nhận «năm chắc, số trống». Hàng chờ còn ~1.100 mục (HN 481 sau đợt 4 · Huế 69 · HD 41 · QN/NB/NA còn dư · các tỉnh Tây Nguyên - Nam Bộ chưa chạm: Gia Lai · Ninh Thuận · Tiền Giang · Cần Thơ · Trà Vinh · Cà Mau · Bạc Liêu · Long An · Vĩnh Long · Tây Ninh · Quảng Ngãi · Kon Tum · Bình Dương · Bình Phước · Đắk Nông · Yên Bái · Bắc Kạn · Lai Châu · Hậu Giang). **VÒNG PHỤ CUỐI CA (wave 17-19, đợt commit 43-53 `2a38827`→`b0d6f11`) — XONG 05:00 12/8**: quét thêm **10 lát** (Đắk Lắk · Gia Lai · Phú Yên cũ · An Giang · Tiền Giang cũ · Cần Thơ · Trà Vinh cũ · Bạc Liêu cũ · Đắk Nông cũ · Cà Mau · Long An cũ — ~100 mục), kho chốt ca **v61: 599 cho_toa_do · 540 can_xac_minh · 282 đóng** (đầu ca 121/340/166). Phát hiện thêm: (l) sổ QĐ-đợt PHÂN 2 DẠNG — «số liền kề» (833-834 ngày 3/3/2009 ĐL+TV — giải luôn nghi án hậu tố thác Thuỷ Tiên; 10-11/2005 ĐN; 42-43/2007 LA; 819-823 9/3/2017; chuỗi 51-52-53 cuối 12/2001 khép kín nhờ Ô Tà Sóc AG; 07/01/2020 lên ×7 dải 31-50; 29/12/2017 lên 3 tỉnh dải 5387-5398) vs «1 QĐ nhiều di tích» (774/QĐ-BT 21/6/1993 CT ×2 · 30/2000/QĐ-BVHTT 24/11/2000 BL ×3 + nghi xuyên CM ×2); đợt 921-QĐ/BT 20/7/1994 CHỐT số + hậu tố (Ao Bà Om — và DB đang THIẾU Ao Bà Om lớp di tích!), 5 tỉnh; đợt mới: 18/6/1997 PY ×2 · 9/1/1990 TV+AG · 964/1-4-2014 BL «3 di tích» (đẻ mồi đình Tân Hưng BL ≠ đình Tân Hưng CM) · nghi 2/6/2011 (1710 CM + 1713 AG) · nghi 4/8/1992 (Hồng Anh CM + Hoà Thạnh AG); (m) TINH CHỈNH phép thử niên đại: VÙNG XÁM giao thời ~7-8/2007 (42-43/2007/QĐ-BVHTT ký 3/8/2007 hợp lệ; BVHTTDL sớm nhất gặp 27/8/2007) — lệch quanh mốc này không kết tội; đầu 1990s có dạng số cụt «154-QĐ»; (n) 2 mẫu rác mới vào bộ lọc: số GIẤY PHÉP WEB (789/GP-BTTTT) và số-TRÙNG-NĂM («2005/QĐ-BVHTT» 2005, «53/2011» = 53/2001 gõ sai); kỹ thuật mới: BÁC số bằng tra ngược (2244 hoá ra Đà Lạt 2009); (o) lỗi don_vi thật lên **8** — 3 ca mới: Bình Kiển→Tuy An Bắc (PY, ghép chéo cột), Bắc→Đông Gia Nghĩa (Bon Cây Xoài ĐN), «Bình Thành» = TÊN DI TÍCH làm don_vi (LA→đúng Đức Huệ); + lỗi SỐ HIỆU ĐẢO trong tên (dinh Ông Thẻ 2↔3 AG); công cụ don_vi mới: đối chiếu **NQ sắp xếp xã THEO TỈNH** (AG 1654 · ĐN/LĐ 1671 · LA/TN 1682 — brief sau kèm đúng số NQ tỉnh); ca quý: phường mới tên «Phú Yên», chuỗi đổi tên 2 bậc An Nhựt Tân→Tân Bình→Nhựt Tảo; (p) FAMOUS-MÀ-TRỐNG ×3 (Đồng Nọc Nạng · biệt khu Hải Yến - Bình Hưng · Vàm Nhựt Tảo) — DB miền Tây mỏng thật; mạch mới: đấu tranh nông dân (Nọc Nạng + khởi nghĩa Bảy Thưa AG 12 cơ sở thờ tự) · chuỗi Nguyễn Sinh Sắc lên 5 điểm · chuỗi Trần Phú 2 đầu (mộ HT + nơi sinh thành An Thổ PY) · cụm liên hoàn Xứ ủy Nam Bộ - TW Cục CÀ MAU 29 điểm/7 huyện (nợ diem_thanh_phan; ≠ căn cứ Xứ ủy Nhơn Hoà Lập LA ≠ Ban Tuyên huấn HCM — 3 thực thể họ «Xứ ủy»); mẫu «công trình kỷ niệm mới ≠ di tích gốc» ×2 (tượng đài N'Trang Lơng Gia Nghĩa · tượng đài tàu Tập kết Sông Đốc) và «2 thực thể cùng tên» ×3 (Bu Prăng · N'Trang Lơng · Kampong/Kompong Chrây); nợ nội bộ mới: figure N'Trang Lơng TRÙNG 2 bản (dak-lak + lam-dong); (q) nguồn vàng mới: **danh mục di tích Long An cũ svhttdl.tayninh.gov.vn** (phủ toàn tỉnh) · camauditich.edu.vn từng-di-tích (xác minh chủ quản để nâng bậc) · caselaw.vn (CSDL pháp luật — TOÀN VĂN QĐ) · mẹo hạ tầng: SUBDOMAIN sống khi domain gốc chết (dulich.daknong) + URL pop_up lọt cert chết (svhttdl.tiengiang) + dsvh.gov.vn CHẬP CHỜN (cứ retry); hạ tầng chết mới: cụm *.phuyen.gov.vn DNS (mẫu domain tỉnh cũ TẮT DẦN sau sáp nhập — cảnh giác các tỉnh cũ khác) · camau.gov.vn SSL (MỒI HẠNG NHẤT — trang riêng từng di tích, lấp ~5 số) · travinh ECONNREFUSED cả cụm · tiengiang cert *.vbgis.vn lệch miền · baoapbac DNS. Hàng chờ còn **~1.660** (HN 520 · Huế 117 · HD 84 · HCM 77 · QN 62 · NB 59 · NA 52…; đã CẠN các lát ≤10: GL/ĐL/PY/AG/TG/CT/TV/BL/ĐN/CM/LA/BĐ cũ…).
- [ ] 622 mục khớp một phần — cần người soát. Cảnh báo: thuật toán bỏ dấu làm "làng" và "lăng" trùng thành "lang" → có khớp giả. **M**
- [ ] Chất lượng bảng nguồn đã đo: 15 nhóm nhảy số thứ tự (40 dòng lệch cascade) · 1 mã tỉnh sai (`DL-B102`, xã Đồng Xuân — suy được là Phú Yên cũ nhưng **không bịa mã thay thế** vì `DL-P102` đã là mã thật của xã Sông Hinh) · 4 mục thiếu số thứ tự · 1.996/3.327 đơn vị chưa có mục nào.

---

## 4. Ranh giới lịch sử

**Phán quyết nguồn** (chi tiết: `docs/ranh-gioi-1887-1895-phan-quyet.md`):

| Mức | Thời kỳ |
|---|---|
| **ĐỦ** | 1490 · 1838 (đã georef) · Pháp–Thanh 1887/1895 (ưu tiên 1) · 1999/2009 (tin cậy nhất nhưng trùng lớp 34/63 tỉnh) |
| **ĐỦ MỘT PHẦN** — chỉ vẽ điểm, **không vẽ đường biên** | Bắc thuộc · Lý 1075–84 · Hồ 1405 · Mạc 1540 · Tụ Long 1725–28 |
| **KHÔNG ĐỦ** | Xích Quỷ · Văn Lang · Âu Lạc · Nam Việt (Triệu) · Trần |

- 🔴 **Lý 1075–76 đánh Ung–Khâm–Liêm rồi RÚT, không sáp nhập.** Chỉ được là marker sự kiện quân sự. Vẽ thành lãnh thổ là sai sử liệu.
- Ví dụ "vươn lên phía bắc" đúng nghĩa là **Tụ Long** (Vị Xuyên ↔ phủ Khai Hoá, Vân Nam), có văn bia mốc sông Đổ Chú 1728. Thiếu toạ độ nên chưa đặt điểm được.
- Nội dung đường biên nằm ở **Điều 3** công ước 1887, không phải Điều 2. Kinh tuyến chạy qua **mũi đông đảo Trà Cổ**; **105°43′ Paris = 108°03′ Greenwich**.
- ⚠️ Kinh tuyến 105°43′ ghi dạng "không render như ranh giới biển khi chưa có xác nhận của Uỷ ban Biên giới quốc gia" — **không ghi như khẳng định lịch sử**. Vịnh Bắc Bộ phân định bằng Hiệp định 2000.
- ⛔ Cấm dùng con số "750 km² / ¾ châu Tụ Long" — chỉ có ở mirror Wikipedia và blog.

**Việc**
- [ ] Polygon 602–1887 (Nam Việt, Bắc thuộc, Đại Cồ Việt, Đại Việt, Đại Nam) — ⛔ chặn bởi thiếu atlas đủ tin cậy. **L**
- [ ] Lớp "15 bộ Văn Lang" — ⛔ chặn bởi nguồn (cần ĐVSKTT Ngoại kỷ bản dịch có chú giải, không phải blog). **M**
- [ ] Animation morph ranh giới qua các thời kỳ. **L**
- [ ] Hai PDF sử liệu (`DeClercq_Tome17_1886-1887.pdf`, `BienGioi_VN-TQ_UBBGQG.pdf`) — ⚠️ **2026-08-11: KHÔNG còn trên đĩa** (tìm khắp Downloads/Documents/D:/projects = 0 khớp; phiên cũ tải về thư mục tạm đã dọn). Muốn đọc Điều 3 Công ước 1887 (câu hỏi Q5) phải TẢI LẠI trước — DeClercq nằm trên Gallica/BnF.

---

## 5. Kỹ thuật

### Bảy bản vá cứu từ phiên 2026-07-26 — phán quyết đã đối chiếu mã hiện tại

| Bản vá | Việc | Phán quyết |
|---|---|---|
| **1a** era nạp lười | `map.on("load")` `addSource` cả 3 era vô điều kiện | ✅ **ĐÃ ÁP** — cùng bản vá `landmarks3d.ts` và cổng gác `verify_chu_quyen.mjs` |
| 1b Nam tiến nạp lười | | ✅ **ĐÃ ÁP** — `ensureNamTienGeo()` đã có |
| 2 `forceContextLoss` | | ✅ **ĐÃ ÁP** — `figures3d.ts`, `models3d.ts` |
| **3** fontstack union type | 5 literal `"text-font"` rải rác `main.ts` | ✅ **ĐÃ ÁP** 2026-08-05 — `src/map-fonts.ts` |
| **4** `fetchJson` bỏ `as T` | Gốc của 7+ sink XSS | ✅ **ĐÃ ÁP** 2026-08-05 — `types/parse.ts` + `util/fetch.ts`, gộp luôn `fetchJsonSafe` của `search.ts` |
| **5** tách `overlays-config.ts` | Khối nay ~750 dòng, lớn hơn lúc viết bản vá | ✅ **ĐÃ ÁP** 2026-08-05 — `src/overlays-config.ts` 629 dòng, `main.ts` 3.363 → 2.943 |
| 6a panel registry | | ✅ **ĐÃ ÁP** cho battle/olympia/story/namtien |
| **6b** `esc()` dedup | 4 file còn giữ bản `esc` cục bộ | ✅ **ĐÃ ÁP** 2026-08-05 — 9 bản sao (kể cả `escHtml` khác tên của `search.ts`) về 1 |
| **7** `npm run smoke` | | ✅ **ĐÃ ÁP** 2026-08-05 — `smoke` + `verify:chuquyen` đã là bước chặn trong `deploy.yml` |

🔴 **Bẫy kiểu đã bắt được nhờ DIFF-4** (đo trên dữ liệu thật, không phải suy đoán): `nam` khai `string | number` nhưng thật ra 513 số + 35 chuỗi; `xep_hang` khai `number` nhưng 82/104 giá trị là **chuỗi**, có mục là cả một câu văn dài. Lời khai kiểu trong `main.ts` sai với chính dữ liệu của dự án — đó là lý do `esc()` bị bỏ qua ở những trường "vốn là số". Nay mọi trường hiển thị đều ép về `string` ở hàm parse.

✅ **Bẫy `landmarks3d.ts:281` đã vá cùng commit** — đổi từ ghim `era-phapthuoc-fill` sang dò lớp era đang có theo thứ tự vẽ thật. Cùng lúc phát hiện **nửa thứ hai của cùng cái bẫy**: `ensureEra` phải truyền `beforeId = "chu-quyen-labels"`, nếu không lớp era sinh ra sau sẽ chèn lên trên và **phủ mất nhãn Hoàng Sa / Trường Sa** — không lỗi console, không cổng dữ liệu nào bắt được.

### Cổng gác mới — `npm run verify:chuquyen`

Chrome headless riêng (swiftshader, WebGL thật), không phụ thuộc cửa sổ nào. Quét cả 13 thời kỳ, kiểm 3 điều: nhãn chủ quyền render được · mọi lớp era nằm dưới `chu-quyen-labels` · era nạp lười 1/3 nguồn. **13/13 xanh**, và đã tự chứng minh biết đỏ bằng ca dương tính (bỏ `beforeId` → V2 đỏ đúng chỗ).

✅ **Đã gắn vào CI 2026-08-05** — `deploy.yml` chạy `verify:chuquyen` rồi `smoke` sau bước build, đều là bước CHẶN. Tra bảng runner-images cùng ngày: `ubuntu-24.04` (= `ubuntu-latest`) có sẵn Google Chrome 150 ở `/usr/bin/google-chrome`; hai script đã nới danh sách dò đường dẫn và tự thêm `--no-sandbox` khi thấy biến `CI`.

⚠️ Vẫn **cố ý không** gắn vào `npm run validate`: cổng đó phải chạy được ở máy không có Chrome và trong vài giây, còn hai cổng này mất ~1–2 phút mỗi lượt.

⚠️ Bản đầu của cổng này **đỏ giả 10/13** vì đòi đủ 5 đảo ở mọi thời kỳ. Ba đảo Thổ Chu / Bạch Long Vĩ / Phú Quý sống trong file ranh giới tỉnh, mà thời kỳ cổ không có lớp ranh giới nào — chúng chưa bao giờ được **vẽ** ở đó. Lý do đã ghi trong đầu file script để không ai sửa ngược.

- [x] ~~`S2b-1` bị chấm như một cổng gác nên luôn đỏ~~ — 2026-08-03: đổi sang `ok = null` (BỎ QUA). Vẫn in ra con số context bị thu hồi, không cộng vào tổng hỏng.
- [x] ~~**`scripts/smoke.mjs` đỏ 4/9**~~ — 2026-08-03: **9 đạt · 0 hỏng · 1 bỏ qua / 10 kịch bản**. Ba kịch bản còn lại xanh nhờ DIFF-1a + sổ đăng ký panel đã áp trước đó; `S2b-1` là ca bỏ qua có chủ ý. Giờ đã đủ điều kiện cân nhắc gắn `smoke` + `verify:chuquyen` vào cổng CI.
- [ ] **Toạ độ**: 34% CSDL nằm trong cụm dưới 500 m (208 cụm / 656 mục). Chỉ 13 mục là placeholder sửa được bằng máy; phần lớn cần **clustering/jitter khi render**. **Không được bịa toạ độ chính xác hơn nguồn.** **L**
- [x] ~~**CSP vô hiệu trên GitHub Pages.**~~ **XONG 2026-08-11** (`0d220b4`) — meta-CSP cùng policy `_headers` trừ `frame-ancestors` (meta không hỗ trợ). Nghiệm thu Chrome: bản đồ/tile/worker/21 iframe chạy, console 0 vi phạm. Câu hỏi Q6 coi như đã xử theo phương án meta; muốn cả frame-ancestors thì vẫn cần Cloudflare.
- [x] ~~Email cá nhân hardcode trong User-Agent 2 script.~~ **XONG 2026-08-11** (commit `ff8f856`) — thay bằng URL repo công khai, thoả chính sách UA của Wikimedia/Nominatim. Grep toàn `scripts/ src/ public/` = 0 khớp còn lại.
- [x] ~~Nâng Vite 5.4.21 → 6.4.3.~~ **XONG 2026-08-11** (`d8dde5d`) — build xanh · smoke 9/0 · verify:chuquyen 13/13 · audit prod 0 lỗ hổng.
- [x] ~~`unesco.json` thiếu `nguon[]` riêng, chưa STRICT_SOURCE.~~ Kiểm 2026-08-11: 13/13 mục ĐÃ có `nguon` riêng từ trước (số PLAN lỗi thời) — chỉ còn thiếu cổng; đã thêm vào STRICT_SOURCE (`cebb209`) + id (`dbecb25`).
- [x] ~~Gộp **91 ảnh nhân vật** đã soạn (phủ ảnh 142 → 226/1.040). Chưa có script gộp.~~ **Mục này đã lỗi thời — kiểm lại 2026-08-05**: file cứu về có **195** bản ghi (không phải 91), và cả 195 **đã nằm trong dữ liệu**, URL khớp bản đã soạn từng ký tự. Độ phủ thật hiện là **558/2.347 mục lớp phủ (23,8%)**, không phải 226/1.040. 0 mục thiếu `anh_nguon`, 0 thiếu `anh_giay_phep`, 0 ảnh nằm ngoài `upload.wikimedia.org` (CSP chỉ cho host này).
- [x] ~~**Chưa kiểm được 558 URL ảnh.**~~ **XONG 2026-08-11** — quét tuần tự 1,1 s/URL đúng chính sách: **548/551 sống · 0 dính 429 · 3 hỏng ĐÃ VÁ** (2 URL `/thumb/` thiếu hậu tố kích cỡ → về ảnh gốc; 1 URL thiếu cặp thư mục hash `/5/57/` → tra Commons API ra URL đúng). Thumb 320px của 3 file này trả 400 — đặc thù file scan, dùng ảnh gốc + `loading=lazy`.

---

## 6. Vỉa đã đóng — có bằng chứng, ĐỪNG cử agent vào lại

- **Ảnh từ cổng thông tin nhà nước và báo chí Việt Nam**: rào cản **hệ thống**, không phải tìm chưa kỹ. Khác Commons (mỗi file một giấy phép), web chính quyền và báo chí VN gần như đồng loạt tuyên bố "All Rights Reserved" toàn trang. Đã kiểm: cổng Lạng Sơn ghi rõ bản quyền toàn trang · VietnamPlus/TTXVN cấm sao chép dưới mọi hình thức nếu không có chấp thuận bằng văn bản · báo Lâm Đồng 404. Muốn dùng phải **xin phép trực tiếp từng Sở / toà soạn** — việc khác hẳn.
- **82 bia tiến sĩ Văn Miếu trên Commons**: category "Steles in Vietnam" chủ yếu là bia Chăm Mỹ Sơn và bia chùa lẻ, **không** phải bia theo khoa thi. Cần catalogue đã xuất bản.
- **Bảo tàng Lịch sử quốc gia / Mỹ thuật Việt Nam trên Commons**: 0 khớp, chưa số hoá hiện vật gắn tên nhân vật.
- **Tra ảnh theo trường `dia_diem`**: sai ~75%. Địa điểm ngắn khớp rời rạc từng từ — "Phủ Trịnh" ăn nhầm sang phường "Phú Trinh" Phan Thiết. Chỉ dùng khi tên đủ dài và riêng.
- **`di-tich-quoc-gia.json` làm nguồn folklore**: thử 17 đền/hang, 17/17 đã có sẵn.
- ⚠️ Cổng Sở VHTTDL Phú Thọ trả **lỗi chứng chỉ SSL, domain trỏ sang site lạ**. Không cố vượt qua.

---

## 7. Quyết định đã chốt — bất biến

1. **Không Wikipedia** làm nguồn nội dung, kể cả nguồn phụ. Commons chỉ làm kho **ảnh**.
2. Không bịa dữ liệu. Không nguồn thì không có mục.
3. **Không sinh ảnh chân dung người có thật.** Sinh ảnh chỉ cho bối cảnh, huyền sử, icon, phục dựng — luôn gắn nhãn "hình dung nghệ thuật". Đặc tả: `docs/image-generation-spec.xml`.
4. **Agent không ghi thẳng vào repo** ở các sóng dữ liệu — viết ra scratchpad, main hợp nhất sau dry-run đối chiếu chéo. Ngoại lệ có kiểm soát: agent thi công code được cấp vùng file riêng, không chồng lấn.
5. Mục dữ liệu mới mặc định `trang_thai: "draft"`, chờ cổng §9.
6. **Dò trùng phải so CỤM DANH TỪ RIÊNG**, không chỉ so tên mục. "Sự tích núi Tô Thị" = "Nàng Tô Thị".
7. Bỏ lớp chia theo **vùng miền**; chỉ chia theo **lĩnh vực**.
8. `xep_hang` bắt buộc: cấp + số QĐ + ngày, trích từ nguồn đã fetch. Không tra được thì ghi "chưa xác minh được" — **tuyệt đối không bịa số**.
9. Cụm `di-tich-qgdb` / `bao-vat-quoc-gia` / `unesco` giữ riêng, popup khác nhau — đây là ba **sổ đăng ký nhà nước**, gộp sẽ mất dữ liệu đăng ký chuẩn.
10. Schema **thư viện** dùng `sources` ở từng mục; schema **overlay** dùng `nguon`. Đừng nhầm. *(Đang thống nhất — xem mục 2.)*
11. Toạ độ: ưu tiên tượng đài / đền / khu lưu niệm. Chỉ biết cấp huyện/tỉnh → `do_tin_cay_toa_do` = trung/thấp.
12. Ảnh chỉ dùng Commons/PD/CC + nhúng. **Không rehost ảnh có bản quyền.**
13. Phim tài liệu: chỉ nhúng `youtube-nocookie` đã kiểm oEmbed = 200. Kênh nhà nước (`kenh_loai=state`) auto `reviewed`, còn lại chờ người duyệt.
14. Tên đường: **Phương án A** — bảng liên kết tĩnh + centroid qua Overpass. Không vẽ hình học đầy đủ ở v1.
15. Cương vực Việt cổ chỉ mang tính minh hoạ giáo dục, **không** dùng làm căn cứ yêu sách lãnh thổ hiện đại. Không đặt cạnh lớp chủ quyền Hoàng Sa–Trường Sa theo cách gây hiểu lầm hai loại "ranh giới" tương đương.
16. **Static JSON/GeoJSON in-repo, không backend.** Đây là thứ giữ cho hosting miễn phí. Không thêm phụ thuộc server mà không nói rõ.

---

## 8. Bẫy kỹ thuật — đừng vấp lại

1. **PowerShell 5.1 `Set-Content -Encoding UTF8` LUÔN ghi BOM** → `JSON.parse` chết. Ghi JSON bằng Node.
2. **`node -e` với chữ tiếng Việt mất output** trong môi trường này. Viết file `.mjs` rồi chạy.
3. **Fontstack**: endpoint glyph `demotiles.maplibre.org` chỉ phục vụ `Open Sans Semibold` và `Noto Sans Regular`. Dùng stack khác → 404 → MapLibre gom mọi fontstack của **cùng một source** vào một `Promise.all`, một reject làm hỏng **toàn bộ lớp**, kể cả lớp line không cần font. Đây là nguyên nhân gốc khiến "lớp sông núi không hiển thị" lặp lại nhiều đợt.
4. **`renderer.dispose()` KHÔNG trả WebGL context về trình duyệt** — phải gọi thêm `forceContextLoss()`. Nhưng đừng gọi trong `landmarks3d.ts` (dùng chung canvas với MapLibre).
5. **Xoá/đổi tên file dữ liệu thì phải quét tham chiếu TOÀN REPO**, không chỉ `src/`.
6. `colorExprFor` dùng `["at", ["%",["id"],N], ["literal", pal]]` không bọc `["to-color", …]` → style-spec từ chối `setPaintProperty` **im lặng** → giữ màu mặc định.
7. **`validate_overlays.mjs` kiểm bbox KHÔNG bắt được sai tỉnh.** Bbox pass không có nghĩa toạ độ đúng.
8. `matchKey` khớp tên đường OSM cần phân biệt thanh điệu (Bình ≠ Bính, Thủy ≡ Thuỷ). Nới lỏng sai sẽ match nhầm người khác.
9. **Overpass API**: `area["name"=...]` dễ 504, phải geocode trước. Dùng bbox + mirror `overpass.kumi.systems` ổn hơn. Một con đường thật = **nhiều** `way` segment, phải gộp theo tên + khu vực.
10. 🔴 **Ba lần cổng kiểm tra tự nói sai trong một đợt.** (a) Đo byte GeoJSON lúc khởi động bỏ sót vì MapLibre nạp trong **web worker**, miền `Network` của CDP gắn vào page target không thấy. (b) Lọc chuỗi `/font/` lỗi thời sau khi tự host đổi path thành `/fonts/` — cổng mất tác dụng đúng lúc cần nhất. (c) Cờ `__tuNguyen` phân biệt nhả context sai vì three.js gọi `loseContext()` ngầm qua extension. **Một cổng xanh mà chưa tự chứng minh bằng một ca dương tính biết trước thì không đáng tin hơn việc không có cổng.**
11. **Dedup tự thân của agent không đủ.** Luôn cần script gộp đối chiếu chéo toàn bộ file dry-run trước khi nạp — đã bắt được lỗi khác hoa/thường và trùng toạ độ khít mà 4 vòng tự kiểm của agent đều lọt.
12. `loai` lệch tập theo từng lớp — chuẩn hoá tập giá trị cho phép trước khi agent ghi.
13. Biến thể chính tả y/i (Quýt/Quít) lọt qua strip-accent kernel dò trùng ("quyt" ≠ "quit").
14. Reload nhiều lần trong Chrome test làm **cạn WebGL context** → bản đồ trắng dù build xanh. Không phải lỗi code.
15. **Sandbox agent chặn WebGL hoàn toàn** + chặn tải tile CARTO → không nghiệm thu map trong agent được. Phải nghiệm thu ở Chrome thật.
16. **Bản quyền dịch giả tách khỏi bản quyền tác giả.** Thơ chữ Hán public-domain vẫn có thể có bản dịch thơ còn bảo hộ → dùng dịch nghĩa văn xuôi khi không chắc.
17. Danh mục Commons trả 0 file trông như vỉa rỗng thực ra có thể là **sai quy ước tên category** (`Category:Dong Thap` không dấu, không chữ "Province"). Sửa truy vấn trước khi kết luận.
18. 🔴 **Harness đo bản đồ tự nói sai — ba ca mới, cùng họ với bẫy #10.**
    (a) `querySourceFeatures` **chỉ trả feature trong khung nhìn**. Kịch bản duyệt nhiều lớp, nhảy tới lớp trước rồi hỏi lớp sau, sẽ nhận 0 feature và chấm là hỏng. Đọc `getSource(id)._data` mới độc lập với viewport.
    (b) Gieo payload thử vào **đúng một mục** rồi bấm marker: cú bấm rơi trúng mục khác (điểm chồng nhau ở zoom xa), popup trả về là của mục sạch, và phép thử «đạt» mà chẳng chứng minh gì. Gieo vào **mọi** mục thì bấm trúng ai cũng là ca hợp lệ.
    (c) Quét URL ảnh bằng nhiều luồng song song vào Wikimedia → **429 hàng loạt**, trông y hệt «ảnh chết». Báo cáo đó mà tin là đi sửa hàng trăm mục lành. Quét chậm, tuần tự, và phân biệt 429 với 404.
19. **Google Sheets**: `/export?format=csv` trả **401**; `/gviz/tq?tqx=out:csv` **mở**. Lấy tab khác bằng `&sheet=<tên URL-encoded>`.
20. 🔴 **`npm run build:index` từng dựng catalog TRƯỚC chỉ mục sa đồ**, nên `validate_catalog_freshness` đỏ ngay sau khi vừa dựng lại chỉ mục — lệnh đó chưa bao giờ ra được catalog tươi khi thư mục `battles/` đổi. Đã đảo thứ tự (sado → catalog → entries) ngày 2026-08-06. Thêm bước sinh file mới thì **kiểm lại thứ tự phụ thuộc**.
21. 🔴 **Ba bẫy đo mô hình 3D — cùng họ với #10 và #18.**
    (a) `import("three")` trong `Runtime.evaluate` **không phân giải được**: Vite chỉ viết lại định danh trần ở khâu biến đổi mã nguồn, không phải lúc chạy. Đo hộp bao bằng tay từ `geometry.attributes.position` + `matrixWorld.elements`.
    (b) `ctx2d.drawImage(canvasWebGL)` trả khung **TRẮNG TRƠN** vì `WebGLRenderer` không đặt `preserveDrawingBuffer`. Lượt đầu cho 0% hiển thị trên **CẢ 8 mô hình cũ đang chạy tốt** — nhóm đối chứng là thứ bắt được lỗi phép đo. Chụp bằng `Page.captureScreenshot` của CDP (ảnh hợp thành) mới đúng.
    (c) **Kích thước ảnh chỉ chứng minh «có gì đó được vẽ».** Câu «ngôi sao có đúng chỗ không» phải MỞ ẢNH RA XEM — và xem **nhiều góc**: lá cờ Ba Đình có sao dựng đúng nhưng chỉ ở một mặt, ba góc đầu đều thấy vải đỏ trơn. Một góc thiếu sao suýt làm tôi bắt làm lại một bản vá vốn đã đúng.
22. **`ShapeGeometry` là mặt phẳng 0 độ dày** → ở góc nhìn gần song song thì diện tích chiếu gần 0 và chi tiết biến mất. `DoubleSide` KHÔNG cứu được vì đây là vấn đề góc chiếu, không phải mặt sau. Dùng `ExtrudeGeometry` cho chi tiết phải luôn thấy.
23. **`cyl()` luôn đối xứng quanh TÂM**, không phải quanh một đầu. Đặt `position` theo ý «đây là điểm nối» thực ra đặt điểm giữa; xoay lệch hai trục cùng lúc thì đầu gần trôi khỏi chỗ nối. Dùng nhóm có gốc ở một đầu (quy ước `makeSword`/`makeSpear`/`makeRod`).

---

## 9. Cổng nghiệm thu

```bash
npm run validate         # 12 cổng dữ liệu — run_validators.mjs tự phát hiện mọi validate_*.mjs
npx tsc --noEmit         # type check
npm run build            # tsc + vite build
node scripts/audit_sovereignty.mjs   # chủ quyền mức DỮ LIỆU — CI chạy riêng, bắt buộc
npm run verify:chuquyen  # chủ quyền mức HIỂN THỊ, 13 thời kỳ (cần Chrome) — CI chặn
npm run smoke            # 10 kịch bản qua CDP (cần Chrome) — CI chặn
```

**Một build xanh KHÔNG chứng minh bản đồ đúng.** Đụng bản đồ hay ranh giới thì phải **mở trình duyệt, nhìn bằng mắt, xác nhận Hoàng Sa + Trường Sa còn hiện**. Đụng cảnh 3D thì render, xem console sạch và khung hình không tụt trên laptop tầm trung.

---

## 10. Chỉ thị chủ dự án 2026-08-05 — chương trình đang chạy

Chủ dự án giao 13 hạng mục. Tiến độ ở đây, chi tiết kỹ thuật ở `RELEASE.md`.

| # | Việc | Trạng thái |
|---|---|---|
| 1 | Bỏ qua GitHub Actions khi hết quota — gói miễn phí, không nâng cấp | ✅ `deploy.yml` thêm `paths-ignore` cho `**/*.md` + `docs/**`: push chỉ sửa tài liệu không còn đốt phút nào. **Quy ước: không đuổi theo lỗi CI do hết quota.** |
| 2 | Màu sắc | ✅ chốt, không đụng nữa |
| 3 | Zoom sâu thì 3D tự thành 2D | ✅ Xong. Nguyên nhân: `setEra` tắt hẳn lớp khối từ zoom 7,5. Nay khối sống ở **mọi** mức zoom; cái lo thật (mặt khối che mặt đất) chữa bằng `fill-extrusion-opacity` giảm dần 0,85 → 0,28. |
| 4 | Icon trên bản đồ 3D phải là 3D, đúng cỡ, bấm được | ✅ **XONG 2026-08-05.** Vùng bấm 3 → 12 px, đo lại sau khi thay mô hình: popup vẫn mở. **12 nguyên mẫu theo loại đối tượng** (đền · chùa · tháp Chăm · thành · bia rùa · lăng · trận · bảo tàng · núi · nghề · tượng · cầu) thay cho 5 kiểu dùng chung. Kiểu gánh nhiều nhất **72,6 % → 27,2 %**. |
| 5 | Học cách dựng mô hình 3D cho đối tượng lớp phủ | ✅ **XONG 2026-08-05** — `src/mohinh-lop-phu.ts` (mới, 586 dòng). Dáng gánh phần nhận dạng chứ không phải màu. Lệnh vẽ 27 → ≤12: mỗi mẫu nướng thành một `BufferGeometry` màu-vào-đỉnh, 12 kiểu chung một material. |
| 6 | Mốc dòng thời gian: gắn vị trí, hiện note khi kéo; đủ 4000 năm | ✅ **XONG 2026-08-05.** `src/moc-lich-su.ts` + `.css`: vạch đính theo năm, note bung khi kéo, ◂ ▸ đi hết mốc trong kỳ, bấm vạch nhảy đúng thời kỳ. **62 → 181 mốc, phủ đủ 13/13 đoạn** (trước đó 7 đoạn trống, nửa đầu 4000 năm trắng). Đo Chrome thật: vạch năm 602 rơi 491,1 px / lý thuyết 491,1 px — lệch 0. Nhóm huyền sử: `nam` chỉ là khoá sắp xếp, `nam_hien_thi` (thứ duy nhất hiện ra) ghi rõ «không có năm xác định». |
| 7 | Ngục trung nhật ký xếp theo thứ tự bài | ✅ Xong |
| 8 | Thư viện: chế độ đọc kiểu Kindle, chế độ lật, mở rộng cửa sổ, tuỳ chỉnh, bỏ biểu tượng thừa, sắp theo chủ đề + thời gian/tác giả, link trang tỉnh, bổ sung tác phẩm | ✅ **XONG 2026-08-05.** `src/thuvien.ts` (1.470 dòng) + `.css` (671); `main.ts` 3.051 → 2.467. 14 tab chủ đề kèm số lượng · 3 bộ sắp xếp · khung đọc chỉnh cỡ chữ/giãn dòng/phông/nền/cột · lật trang · phóng 560→1100 px · nút mở trang tỉnh · 0 emoji trang trí còn sót. **+144 tác phẩm** (705 mục). Người thi công ĐO trước khi viết hàm so sánh và dữ liệu bác giả định: 157 mục không có trường năm nào, 0/127 ca dao có tác giả → ô «sắp theo tác giả» tự tắt ở chủ đề khuyết danh thay vì cho thứ tự vô nghĩa. |
| 9 | Hành trình lịch sử | ✅ **XONG 2026-08-06. 6 → 22 chặng**, phân kỳ đủ 5 nhóm (Dựng nước 1 · Bắc thuộc 5 · Kỷ nguyên độc lập 8 · Nhà Nguyễn–Pháp thuộc 4 · Thời hiện đại 4). 🔴 **Chỗ nghẽn KHÔNG phải thiếu nội dung** như mục này từng ghi: `validate_journey.mjs` đòi `figure_id` có builder thật và chỉ có **8 builder, tất cả trước năm 1800** — viết bao nhiêu chặng cũng không nạp được. Mở khoá bằng 14 builder mới (xem #13b). Lấp hai mảng trống lớn nhất: trước Ngô Quyền (chỉ có mỗi Hùng Vương) và sau Quang Trung (**trắng hoàn toàn**, mất cả TK XIX lẫn XX). 4 chặng TK20 dựng quanh **hiện vật** thay chân dung — quyết định của chủ dự án 2026-08-06. |
| 10 | Sa đồ chiến dịch | ✅ **XONG 2026-08-06. 136 → 240/241.** Đợt 8 chạy 5 lô song song (A trước 1802 · B 1802–1921 · C 1946–1965 · D 1966–1974 · E 1975–1984 nhạy cảm). **1 mục duy nhất bỏ**: `khoi-nghia-doi-an-lang-son-1921` — chính overlay tự khai nguồn «RẤT ÍT, chỉ một dòng tóm tắt». Không đợt nào phải quay lại sửa nội dung. Dry-run độc lập của main trên cả 105 file: 0 lỗi. |
| 13b | 22 mô hình nhân vật/hiện vật 3D | ✅ **XONG 2026-08-06, 8 → 22.** 10 nhân vật (Bà Triệu · Lý Bí · Mai Thúc Loan · Lê Hoàn · Lý Thường Kiệt · Trần Nhân Tông · Nguyễn Ánh · Trương Định · Hàm Nghi · Phan Bội Châu) + **4 hiện vật thay chân dung TK20** (tàu Latouche-Tréville · lễ đài Ba Đình · pháo Điện Biên · xe tăng 390). |
| 11 | Lớp phủ chia theo lĩnh vực/chủ đề/giai đoạn, **không chia theo giới tính** | ✅ **XONG 2026-08-05.** Lớp `nu-danh-nhan-lich-su` và nhóm «Nữ danh nhân · Dân tộc thiểu số» đã bỏ; 34 → 33 lớp. 38 mục về 8 lớp lĩnh vực. 4 vụ trùng người (Võ Thị Sáu, Út Tịch, Hoàng Thiều Hoa, Xuân Nương) tự kiểm xác nhận — không chép sang, không xoá bản cũ. Mục gộp «Mười nữ liệt sĩ Đồng Lộc» bỏ vì 9/10 đã có bản cá nhân; chuyển Võ Thị Tần sang cho đủ 10. Thêm `loai: bieu-tuong-khang-chien` cho 2 người chưa tra ra danh hiệu chính thức — gán `anh-hung-llvt` cho họ là khẳng định danh hiệu nhà nước mà nguồn không nói. |
| 12 | UI lag khi di chuyển | 🔄 **Tìm ra một nguồn tải lớn, đã cắt; chưa tuyên bố hết lag.** Đo bằng cách bọc `queryRenderedFeatures` rồi ĐẾM (fps ở harness này vô nghĩa, nhưng số lời gọi thì tất định): 30 lần rê chuột → **240 lời gọi** khi không lớp phủ, **4.200** khi bật 33 lớp = **140 lần dò mỗi `mousemove`**, mà `mousemove` bắn ~60 lần/giây. Kéo bản đồ tốn **0** — chốt chữ ký khung nhìn vẫn tốt. Nghĩa là giật nằm ở RÊ CHUỘT chứ không phải kéo bản đồ; suốt trước đó tôi đo fps lúc kéo, tức đo nhầm chỗ. Nguyên nhân: `mouseenter`/`mouseleave` gắn theo TỪNG lớp, MapLibre dò riêng cho mỗi lượt đăng ký. Gộp về một handler + một lượt dò → **270 lời gọi**, ít hơn 15,6 lần. **Còn lại**: 33 nguồn GeoJSON + 33 lớp vòng tròn + 33 lớp icon vẫn là chi phí cấu trúc chưa đụng (gom nguồn / clustering / LOD), và cần đo trên máy có GPU thật mới biết người dùng cảm nhận ra sao. |
| 13 | Nâng cấp bản đồ 3D | ✅ **XONG 2026-08-05** cùng #4/#5. Sửa thêm một lỗi thật bắt được bằng ẢNH DỰNG chứ không phải đọc mã: `queryRenderedFeatures` chỉ thấy thứ ĐÃ VẼ nên nhảy Hà Nội → Huế thì 38 điểm có vòng tròn mà 0 mô hình; `map.areTilesLoaded()` không bắt được vì ngay sau `jumpTo` nó vẫn trả `true`. Chữa bằng lượt quét bù 600 ms chỉ sau cú nhảy xa. |

- [ ] **CSS mồ côi sau khi làm lại Hành trình** (`style.css` ~984–1052): `.journey-narration`, `.journey-scene`, `.journey-context`, `.journey-battle-btn` không còn mã nào phát ra. **CỐ Ý CHƯA XOÁ**: `.journey-counter` và `.journey-stage` VẪN dùng, và `.journey-controls` nằm chung bộ chọn với `.battle-controls` (dòng 983 và 1712) nên xoá chọn lọc dễ vỡ vùng chạm 44px của sa đồ. Xoá thì phải nghiệm thu lại cả hai màn. **S**

✅ ~~**LỚP TRẬN ĐÁNH LỆCH NẶNG VỀ TK XX** — 1789–1858 chỉ 1 mục.~~ **Số liệu này ĐÃ LỖI THỜI và suýt gây cử agent trùng lần nữa (2026-08-11).** Đợt ≥60 mục đã chạy xong từ trước: agent đếm trực tiếp file được **34 mục 1785–1858** (đủ Phan Bá Vành ×3, Nông Văn Vân ×3, Lê Văn Khôi ×2, Cao Bá Quát ×3, Lê Duy Lương ×2, Tây Sơn cuối ×7, 3 cuộc chiến Việt–Xiêm…), TK1–6 cũng kín. Đợt 2026-08-11 nạp thêm 10 mục vỉa MỚI (chống cướp biển Tàu Ô 1802–1849 ×8 theo visithue.vn trích Đại Nam thực lục — đã fetch xác minh cả 8 sự kiện; Trường Lũy 1819; cứu Vạn Tượng 1827–28) → **251 mục**. Vỉa trận đánh cận đại coi như no; còn thiếu thì là TK7–9 và các trận lẻ Lê–Mạc.

⚠️ **Trùng toạ độ KHÍT làm một mục không bấm được và mất mô hình 3D.** `main.ts` khử trùng mô hình theo khoá toạ độ làm tròn 5 chữ số (≈1 m). Không cổng nào bắt được: dữ liệu hợp lệ hoàn toàn, chỉ là một mục âm thầm không tới được. Quét 2026-08-05 ra **8 chùm CÓ SẴN từ trước**; đã gỡ 6, gộp 1 trùng nội dung thật (hai mục Hai Bà Trưng tại đền Hát Môn), giữ 2 chùm có lý do (Đồ Bàn 1377 ⟷ Trà Bàn 1471 cùng MỘT toà thành thật cách nhau 94 năm; Củ Chi 1965 ⟷ 1967 tra ra Bến Súc nhưng chỉ có nguồn Wikipedia/blog nên TỪ CHỐI dùng).
   **Nguyên tắc**: một điểm SAI CHỖ tệ hơn hai điểm chồng nhau — chồng nhau thì thấy được, sai chỗ thì không. Đừng rải toạ độ ngẫu nhiên để làm sạch cảnh báo.
   **Và**: vị trí chấm quyết định bởi TÊN mục, không phải nơi giao tranh chính. Ca 1592 «Hạ thành Thăng Long» từng suýt bị dời 68 km sang Hải Dương vì trận thuỷ chiến quyết định ở đó — nhưng người tra «hạ thành Thăng Long» mà thấy nó ở Hải Dương thì bản đồ đang nói dối họ. Cặp `mac-dang-dung-soan-ngoi-1527` ⟷ `ha-thanh-thang-long-diet-mac-1592` cách 76 m là CỐ Ý sau quyết định đó, không phải lỗi mới.
   ⚠️ Dò trùng phải so **mọi cặp**, kể cả mục mới với NHAU — không chỉ mới-với-cũ. Lỗ hổng này của tôi từng suýt để 7 mục chồng một điểm ở Hà Nội lọt vào repo.

🔴 **`2.75rem` KHÔNG phải 44px.** `theme.css` đặt `html { font-size: 0.94rem }` nên 1rem = 15,04px và `2.75rem` chỉ ra **41,4px** — đo trên Chrome được 41px. Khối CSS mang tên «VÙNG CHẠM TỐI THIỂU 44px» ở `style.css` chưa bao giờ đạt 44px kể từ khi ra đời, và nó chi phối nút sa đồ, hành trình, quiz, panel. Đã đổi 10 chỗ sang `max(2.75rem, 44px)` ngày 2026-08-05 (đo lại: nút dưới 44px **170 → 0**). **Đừng viết lại thành `rem` trần.**

⚠️ **Nghiệm thu trình duyệt trong harness này KHÔNG tất định — và có MỘT nguồn sai hệ thống đã truy ra.** Đo 2026-08-05: 5 lượt chạy cùng một bộ sa đồ cho 0/8/1/2/0 "hỏng", mỗi lượt chỉ ra file khác; `npm run smoke` hỏng lượt đầu rồi 9 đạt/0 hỏng lượt sau; fps hai lượt cùng cấu hình lệch tới 1,9×.
   **Nguồn sai hệ thống**: probe mở cả 135 sa đồ TUẦN TỰ TRONG MỘT TAB. Tới cuối danh sách (theo thứ tự chữ cái) trang đã nặng nên hai file gần cuối — `tran-thi-nai-1792` và `tran-thi-nai-1801` — hỏng ở CẢ HAI lượt, trông y như lỗi thật. Chạy RIÊNG hai file đó với thời gian chờ dài hơn: **cả hai dựng đủ 4 và 5 bước, console sạch**. Không phải lỗi dữ liệu, không phải lỗi renderer.
   **Quy tắc**: lượt hỏng lặp lại chưa đủ để kết luận là lỗi thật — phải chạy RIÊNG file đó mới biết. Và probe nên nạp lại trang định kỳ thay vì dồn 135 lượt vào một tab. Tín hiệu đáng tin hơn số đếm: console có sạch không (sạch ở mọi lượt).

🔴 **THAM CHIẾU TỈNH: dùng slug lấy từ TÊN FILE trong `provinces/`, KHÔNG phải tên trong geojson.** Dự án có hai khoá cho TP HCM — `boundaries/vn-34-tinh-2025.geojson` ghi «TP HCM» (→ `tp-hcm`), còn trang tỉnh là `provinces/thanh-pho-ho-chi-minh.json` (→ `thanh-pho-ho-chi-minh`). `validate_slug_tinh.mjs` lọc theo tên file, nên ghi `tp-hcm` là bản ghi **vô hình** trên trang tỉnh. 2026-08-05 tôi đã vá NGƯỢC 2 mục theo geojson rồi phải sửa lại — đừng lặp lại. Cũng đừng ghi tên hiển thị («Quảng Ninh») vào chỗ đợi slug.

🔴 **Thanh thời gian: 7/13 đoạn TRỐNG mốc.** Đo ngày 2026-08-05 sau khi nối dây, chia 4000 năm thành 13 đoạn: Xích Quỷ 0 · Văn Lang 0 · Âu Lạc 0 · Nam Việt 0 · Giao Chỉ/Bắc thuộc I–II 0 · Vạn Xuân 0 · Bắc thuộc III→Tự chủ 4 · Đại Cồ Việt 3 · Đại Việt **31** · Đại Nam 13 · Pháp thuộc 10 · 1945–2025 **1** · từ 1/7/2025 **0**.
   Nghĩa là **toàn bộ lịch sử trước năm 602 không có một mốc nào** — kéo thanh trượt qua nửa đầu 4000 năm thì không hiện gì. Đây đúng là chỗ chủ dự án nói "chưa đủ cho 4000 năm", nay có số. Đợt tra cứu đang chạy đã nhận thứ tự ưu tiên mới: trước-602 trước nhất, rồi 1945–2025, rồi mốc sắp xếp 34 tỉnh (lấy số nghị quyết từ `timeline/events.json`, đừng tra lại rồi ghi số khác).

- [x] ~~🔴 **Tương phản chữ sa đồ chưa đạt 4,5:1.**~~ **XONG 2026-08-06 — và hoá ra hỏng HAI ca, không phải một.**
   Lượt trước chỉ đo bảng màu mặc định ở chế độ trẻ em rồi kết luận «chế độ người lớn đạt hết». Đo lại đủ 4 tổ hợp (2 chế độ × ngoại xâm/nội chiến), **đọc token thẳng từ `theme.css`** thay vì chép tay hex:
   · ❌ trẻ em · ngoại xâm `--dung-chu` #15803d → 4,38 bờ / 4,11 sông
   · ❌ **người lớn · nội chiến** `--nhan` #b3791f → **3,33 / 3,23** ← tệ hơn hẳn, chưa ai đo
   · ✅ người lớn · ngoại xâm 5,06 / 4,91 · ✅ trẻ em · nội chiến 4,97 / 4,67
   Chữa bằng 2 token mới trong `theme.css` (`--sd-ta-chu-ngoai-xam` #166534, `--sd-ta-chu-noi-chien` #92400e), đè đúng hai ca hỏng trong `sado.css`, **không** hạ tối `--dung-chu`/`--nhan` vì quiz/olympia/badge dùng chúng trên nền sáng hơn.
   Nghiệm thu Chrome thật: trẻ em 6,22 / 5,84. **Halo giữ nhưng nay chỉ là lớp phụ — lấy halo làm bằng chứng đạt ngưỡng là sai, lượt trước mắc đúng lỗi đó.**
   Phạm vi thật hẹp hơn tưởng: **chỉ bản vẽ tay `bach-dang-938`** dùng `--sd-ta-chu` làm màu chữ; trình dựng tổng quát dùng `--chu` trên quầng `--mat` (15:1).

⚠️ **`loai_xung_dot` — số 0/240 ĐÃ LỖI THỜI.** Đếm lại 2026-08-11: **62/251 mục** đã khai (31 nội-chiến + 22 ngoại-xâm trước đợt, +9 mục mới theo đúng thông lệ: khởi nghĩa Nguyễn = nội-chiến, chống Xiêm/cướp biển = ngoại-xâm; riêng ca cứu Vạn Tượng 1827 CỐ Ý không gán vì chiến sự ngoài lãnh thổ — chờ người duyệt). Bảng màu nội chiến giờ CÓ dữ liệu bật. Phần dưới của mục này (nguyên tắc không tự gán đại trà) vẫn đúng cho ~189 mục còn lại. `battle.ts` dựng sẵn cả một bảng màu riêng cho nội chiến vì cặp «đúng/sai» xanh-đỏ *«đọc như phán xét đạo đức một bên»* — nhưng Mạc–Lê, Trịnh–Nguyễn, Lê Duy Lương, Nông Văn Vân đang bị tô xanh «đúng» cho một bên và đỏ «sai» cho bên kia, đúng thứ bảng màu kia sinh ra để tránh.
   **Chưa tự gán**: phân loại một cuộc khởi nghĩa nông dân thời Nguyễn là «nội chiến» hay «khởi nghĩa» là quyết định biên tập có sức nặng, không phải việc máy. Ca vá `--sd-ta-chu-noi-chien` ở chế độ người lớn hiện là **bản vá ngủ** cho tới khi có file bật cờ. **M**

⚠️ **Chưa đo được lag thật.** Harness headless chạy trên swiftshader (GPU phần mềm) nên **mọi** cấu hình đều tụt xuống 3–6 fps, kể cả 2D không lớp phủ — sàn đó nuốt mất thứ cần đo. Chỉ so tương đối được: lớp phủ tốn ~21%, chế độ 3D tốn ~23%, cộng gần như tuyến tính, **không điểm nghẽn bất thường nào lộ ra**. Muốn tìm nguyên nhân thật phải đo trên máy có GPU thật (Chrome Performance panel), việc harness này không làm được.

Chi phí cấu trúc đã biết, chưa tối ưu: bật hết lớp phủ là **34 nguồn GeoJSON + 34 lớp vòng tròn + 34 lớp icon**, mỗi lớp một lượt vẽ.

---

## 11. Chờ chủ dự án quyết

| # | Câu hỏi | Chặn việc gì |
|---|---|---|
| ~~1~~ | ~~Bảng "Muôn xã Muôn phường"~~ | ✅ **Đã trả lời 2026-08-03**: dùng làm danh mục gợi ý, tự tra nguồn chính thống |
| ~~9~~ | ~~Chính sử bản in (ĐVSKTT, Cương Mục, Đại Nam thực lục) có phải nguồn hợp lệ?~~ | ✅ **Đã trả lời 2026-08-05: HỢP LỆ.** Ba sóng trước hụt chỉ tiêu (62/250 mốc, 21/120 trận, 44/150 tác phẩm) đều vì cùng lý do này. Ghi nguồn in theo mẫu `"Đại Việt sử ký toàn thư — Bản kỷ, quyển V"`: nêu kỷ + quyển, KHÔNG kèm URL. **Quyển/kỷ tra được, số trang thì không** (mỗi bản in một khác) — không chắc quyển nào thì ghi tên sách + đời vua rồi đặt `can_tra_them`, bịa một số quyển nghe hợp lý là lỗi nặng hơn để trống. |
| 2 | Mở lớp "chợ truyền thống"? 17 mục đang treo (chợ Rồng, Đà Lạt, Cồn, Hàn, Viềng, Đông Ba, Đầm, 3 chợ nổi, Thành Thị Nại, cầu Bình Lợi) | 17 mục chưa xếp hạng |
| 3 | Nguồn báo chí ngoài báo Đảng (Tuổi Trẻ, Thanh Niên, Dân Việt, VnExpress) có được dùng cho `cong-trinh-ky-luc` không? Treo qua 2 sóng | Lớp công trình kỷ lục |
| 4 | Mua **Đào Duy Anh — "Đất nước Việt Nam qua các đời"**? Không có thì Bắc thuộc/Lý/Hồ/Mạc mãi ở mức "đủ một phần" | Ranh giới lịch sử |
| 5 | Mở PDF `DeClercq_Tome17` hoặc `BienGioi_VN-TQ_UBBGQG` bằng mắt cho số trang Điều 3 Công ước 26/6/1887 | Ranh giới Pháp–Thanh |
| 6 | Chuyển sang Cloudflare Pages (để CSP có tác dụng) hay giữ GitHub Pages và dùng `<meta>` CSP? | Bảo mật + media pipeline |
| 7 | Email cá nhân trong User-Agent 2 script — repo công khai. Thay bằng gì? | Riêng tư |
| 8 | Art trang phục 54 dân tộc cho chế độ thiếu nhi — ai hiệu đính văn hoá? | Chế độ trẻ em |
