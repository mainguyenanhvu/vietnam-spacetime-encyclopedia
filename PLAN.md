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

## Trạng thái hiện tại — 2026-08-05

98 file dữ liệu · **4.531 mục** · 7,76 MB · 34 lớp phủ (2.347 mục, 52%) · 12/12 cổng dữ liệu xanh · smoke 9 đạt/0 hỏng · chủ quyền 13/13 thời kỳ · `tsc` exit 0.

| Chiến dịch đang mở | Trạng thái |
|---|---|
| Thiết kế lại UI 2 chế độ (người lớn · trẻ em) | 🔄 đang làm |
| Cơ sở dữ liệu thống nhất + chỉ mục tĩnh | 🔄 đang làm |
| Gom bảng "Muôn xã Muôn phường" | ⏸ chờ quyết định giấy phép |
| Duyệt cổng §9 — 442 draft | ⏸ chờ người soát |
| Ranh giới lịch sử 602–1887 | ⛔ chặn bởi nguồn |

---

## 1. Giao diện — thiết kế lại 2 chế độ

**Đích**: chế độ **người lớn** (sang trọng, tinh tế, tối giản, học Material 3) và chế độ **trẻ em** (vui nhộn, hoạt hình, nhiều màu). Chuyển bằng `:root[data-che-do]`, **không tách 2 file CSS**.

Vì sao dùng biến CSS chứ không 2 file: `body.kid-mode` (`story.ts:131-133`) đã chứng minh cơ chế class-trên-body chạy ổn trong production. 11 panel + control đã tham chiếu `var(--*)` ở khối `style.css:1351-1651`. Tách 2 file sẽ nhân đôi 1.864 dòng và mọi bugfix layout phải sửa hai lần.

### ✅ Nền móng đã xong
Token hai chế độ (`src/theme.css`), nút chuyển + `localStorage` (`src/chedo.ts`), tokenise `style.css` (236 → 4 hex), thang cỡ chữ và khoảng cách, audit tương phản trên trình duyệt thật. Chi tiết và số đo: `RELEASE.md`.

### Còn lại
- [ ] **Chế độ trẻ em mới phủ được phần khung.** Topbar, nút, panel, bo góc, thang chữ đã đổi. Còn: giảm mật độ chữ trong hồ sơ tỉnh, minh hoạ thay khối chữ dài, ngôn ngữ đơn giản hơn cho `mo_ta`. Đây là việc **nội dung**, không phải CSS. **L**
- [ ] **Audit tương phản phần còn lại.** Mới đo topbar và nút. Chưa đo: 11 panel nổi, badge, popup MapLibre, khung quiz/olympia ở chế độ trẻ em. **M**
- [ ] **4 mã hex chưa lên token**, đều là màu ngữ nghĩa dùng một lần: `#fce7f3` (nền nhân vật Âu Lạc trong truyện), `#a84d08` (biến thể đã chỉnh tương phản của `.story-retry`, chưa đo lại xem `--luu-chu` có đủ không), `#fef2f2` (`.qg-badge-khac`, sát `--sai-nen` nhưng không trùng — cố ý không gộp hai giá trị khác nhau), `#7c3aed` (nhãn «huyền sử» ở `.lc-tag`). **S**
- [ ] **`body.kid-mode` của `story.ts` giờ chồng lấn với `data-che-do`.** Hai cơ chế cùng nói về "trẻ em" — quyết định giữ cả hai (một là chế độ toàn cục, một là panel truyện) hay hợp nhất. **S**
- [ ] Icon riêng cho mỗi lớp phủ thay chấm tròn `circle`. 6 icon đã đặc tả ở `docs/image-generation-spec.xml` (I01–I06). **M** — ⚠️ phạm vi thu hẹp từ 2026-08-04: ở chế độ 3D icon phẳng đã được thay bằng mô hình khối, việc này giờ chỉ còn cho chế độ 2D.
- [x] ~~Thanh trượt dòng thời gian, cụm control MapLibre, đầu bảng lớp còn dáng mặc định.~~ Xong 2026-08-04 — xem khối "ĐẠI TU HÌNH THỨC" cuối `style.css`.
- [ ] **Chế độ tối** — hệ token đã sẵn sàng, thêm `:root[data-che-do="toi"]` là chạy. Chưa làm vì chưa có yêu cầu. **M**

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
- [ ] `#province-panel` swap `innerHTML` toàn bộ mà không có `aria-live` bao ngoài. **S**
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
- [ ] `di-tich-qgdb` / `unesco` / `bao-vat-quoc-gia` thiếu trường `id`. `unesco.json` lệch nặng nhất — thiếu 6 trường lõi. **S**
- [ ] `to-nghe-danh-than.json` trộn kiểu `nam_hien_thi`: 54 mục chuỗi, **14 mục số**. **S**
- [ ] 🔴 **`chien-dich-tran-danh.json` có 11 giá trị `loai`, trong đó hai CẶP ĐỒNG NGHĨA** — đo 2026-08-05: `chong-phap` 8 ⟷ `khang-phap` 21 · `chong-my` 4 ⟷ `khang-my` 62. Cùng một khái niệm mang hai tên, nên bất kỳ bộ lọc nào theo `loai` cũng đang bỏ sót âm thầm. Đây đúng là bẫy #12. Chốt một tên rồi di trú, **đừng** để agent sau tự chọn. Bảy giá trị còn lại: `giu-nuoc` 29 · `bao-ve-bien-gioi` 18 · `can-dai` 9 · `trung-dai` 5 · `cach-mang` 5 · `khoi-nghia` 4 · `hien-dai` 3. **S/M**
- [ ] `bao-vat-quoc-gia.json` + `di-tich-qgdb.json` có **cả `cap_nhat` lẫn `ngay_cap_nhat`** — kiểm hai giá trị có lệch không. **S**

**Không phải lỗi, đừng "sửa"**: 26 id + 34 slug trùng chéo file là **có chủ ý** — chúng đang hoạt động như khoá ngoại giữa các miền (`bach-dang-938` nối 3 miền; `slug="hue"` nối media/provinces/story). Việc cần làm là **chính thức hoá** chúng, không phải khử trùng.

---

## 3. Nội dung — làm đầy

### Chặn bởi con người
- [ ] **442 draft chờ cổng §9** — khối lượng lớn nhất còn treo. Cần soát tay nội dung nhạy cảm (chiến tranh, chính trị, liệt sĩ). **L**
- [ ] **155 phim + 301 tiểu sử** ở trường `phim_trang_thai` (khác `trang_thai` overlay đã xử lý xong) — không file nào sau nhắc lại, cần xác nhận còn treo hay đã bỏ theo dõi. **M**

### Lỗi dữ kiện cần tra nguồn — từ `docs/lich-su/audit-findings.md`, chưa có bằng chứng đã sửa
- [ ] `le-nhan-kiet` khoa Tân Sửu: 1651 hay 1661 — can chi lệch. **S**
- [ ] `duong-van-manh` + `tran-hoang-na`: năm sinh/mất lệch tuổi hy sinh khai báo. **S**
- [ ] `bien-gioi-tay-nam-1978-1979`: ba mốc năm mâu thuẫn (1978 / 1977–79 / 1975–78). **S**
- [ ] `nguyen-an-nien`, `trieu-kim-van`: năm mất = 2026, cần xác nhận nguồn. **S**
- [ ] ~10 mục lệch `loai`/file. ⚠️ Nhiều file nguồn **đã bị gộp ở Phase 3** — kiểm lại tên file/id sau merge trước khi áp, có thể một phần đã tự giải quyết. **S/M**
- [ ] Trùng người ↔ sự kiện: 4/8 mục `khoi-nghia-bac-thuoc` trùng bản sự kiện đầy đủ ở file khác · `thai-phien` ↔ `duy-tan-1916` · Không Lộ vs Nguyễn Minh Không (một hay hai người — cần tra sử) · ~8 di tích trùng `di-tich-qgdb` ↔ `unesco` (Hạ Long, **Phong Nha lệch ~18 km**, Huế, Hội An, Mỹ Sơn, Hoàng thành TL, Thành nhà Hồ, Tràng An) · Nữ TNXP Đồng Lộc ↔ Võ Thị Tần trùng marker. **M**
- [ ] `di-tich-qgdb.json` header ghi toạ độ lấy từ Wikipedia/Wikidata — vi phạm nguyên tắc không-Wikipedia dù chỉ dùng cho toạ độ. Tái tính qua Nominatim / dsvh.gov.vn. **M**

### Lớp còn mỏng
`khoa-bang-nam-trung-bo` (6) · `nghia-si-can-vuong` (9) · `me-vnah` (5) · `thanh-hoang-danh-than` (6) · `nha-the-thao-lich-su` (8, thiếu VĐV huy chương Olympic) · `danh-y-luong-y` (8, thiếu Tuệ Tĩnh và Hải Thượng Lãn Ông riêng) · `dich-gia-ngon-ngu-hoc` (9). Một phần có thể đã bù gián tiếp qua sóng sau — **đếm lại số hiện tại trước khi cử agent**. **M**

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
- [ ] `docs/lich-su/expansion-thoigian-plan.md` 6 cell A–G (nữ tướng Hai Bà Trưng, Ngô–Đinh–Tiền Lê, Tây Sơn, thiền sư Lý–Trần, sứ thần, danh y cổ trung đại) — **file duy nhất không có bằng chứng trạng thái**. Đếm nội dung thật trong `danh-nhan-quan-su-co-trung-dai.json`, `thien-su-cao-tang.json`, `su-than-ngoai-giao.json`, `danh-y-luong-y.json`. **M**
- [ ] `abc-tri-an-plan.md` mục "16 geocode flagged" **tự mâu thuẫn nội bộ**: dòng cuối ghi "chưa làm" nhưng nội dung trên cho thấy 13/16 là false-positive đã kết luận + 3/16 đã sửa = 16/16 xong. Xác nhận lại trước khi coi là việc còn treo. **S hoặc 0**

### Chưa nối dây — có dữ liệu thật nhưng UI không đọc
- [x] ~~`public/data/timeline/events.json` (34 mục, nguồn NQ 202/2025/QH15) — không module TS nào đọc.~~ Nối dây 2026-08-04: panel tỉnh (thời kỳ 34 tỉnh) hiện dải «Hợp nhất A + B — Nghị quyết 202/2025/QH15, hiệu lực 1/7/2025» kèm link cổng Chính phủ. Nạp lười một lần, tra theo trường `to`.
- [ ] `docs/di-tich-quoc-gia-candidates.json` — 11 di tích cấp quốc gia đủ nguồn dsvh.gov.vn, chờ chọn: (a) tạo lớp mới `di-tich-quoc-gia.json` + wire `main.ts`, hay (b) tách vào lớp có sẵn. **S**

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

- [ ] Dry-run đối chiếu chéo với `entries-index.json` trước khi nạp. **M**
- [ ] Xác minh 5 điểm agent tự gắn cờ nghi ngờ: "Chùa Trình" Yên Tử có phải Chùa Bí Thượng · "Ngọc Vân" hay "Ngọa Vân" · ngày ký Văn Miếu 10 hay 12/05/2012 · 11/26 điểm Điện Biên chưa rõ thuộc đợt 2009 hay 2015 · số QĐ Núi Trường Lệ (chỉ có ở báo tỉnh). **S**
- [ ] **Hai mục hoá ra KHÔNG phải QGĐB**, đưa vào lớp di tích quốc gia thường: Nhà 48 Hàng Ngang (QĐ 54/VH-QĐ 29/4/1979) và Hang Ngườm Bốc (QĐ 02/2004/QĐ-BVHTT 09/01/2004 — **và danh sách gốc còn ghi sai tỉnh**, thật ra ở Cao Bằng chứ không phải Tuyên Quang). **S**
- [ ] 2.122 di tích lịch sử văn hoá — đợt sau, sau khi pipeline QGĐB chứng minh chất lượng **L**
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
- [ ] Hai PDF sử liệu đã tải nhưng **đều là bản quét không có lớp chữ**: `DeClercq_Tome17_1886-1887.pdf` (659 trang, CCITTFax) và `BienGioi_VN-TQ_UBBGQG.pdf` (48 trang, JPEG — ảnh JPEG thì đọc bằng mắt được, chưa làm).

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
- [ ] **CSP vô hiệu**: deploy là GitHub Pages, `public/_headers` chỉ có tác dụng trên Cloudflare. Chuyển sang `<meta http-equiv="Content-Security-Policy">` hoặc đổi hosting. **S**
- [ ] Email cá nhân hardcode trong User-Agent: `scripts/regeocode.mjs:17`, `scripts/commons_photos.mjs:17`. Repo công khai. **S**
- [ ] Nâng Vite 5.4.21 → 6.4.3 — GHSA-fx2h-pf6j-xcff (CVSS 7,5) + rò hash NTLMv2. Cả hai đặc thù Windows, chỉ ảnh hưởng khi chạy dev server (`npm audit --omit=dev` = 0). **S**
- [ ] `unesco.json` 13 mục dùng schema cũ, thiếu `nguon[]` riêng, chưa vào STRICT_SOURCE. **S**
- [x] ~~Gộp **91 ảnh nhân vật** đã soạn (phủ ảnh 142 → 226/1.040). Chưa có script gộp.~~ **Mục này đã lỗi thời — kiểm lại 2026-08-05**: file cứu về có **195** bản ghi (không phải 91), và cả 195 **đã nằm trong dữ liệu**, URL khớp bản đã soạn từng ký tự. Độ phủ thật hiện là **558/2.347 mục lớp phủ (23,8%)**, không phải 226/1.040. 0 mục thiếu `anh_nguon`, 0 thiếu `anh_giay_phep`, 0 ảnh nằm ngoài `upload.wikimedia.org` (CSP chỉ cho host này).
- [ ] **Chưa kiểm được 558 URL ảnh còn sống hay không.** Lượt quét đầu dùng 8 luồng song song → Wikimedia trả **429** cho 543/558; đó là lỗi phép đo, không phải ảnh chết. Lượt hai lấy mẫu 30 URL tuần tự (nghỉ 400 ms) được 24 sống · 6 vẫn 429 · **0 mục 404**. Muốn có con số thật thì phải quét chậm (≥1 s/URL, User-Agent có địa chỉ liên hệ theo đúng chính sách của Wikimedia) và chạy nền. **S**

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
| 4 | Icon trên bản đồ 3D phải là 3D, đúng cỡ, bấm được | 🔄 Vùng bấm xong: bán kính 3 → **12** (đích 24×24 px, WCAG 2.5.8), đo xác nhận popup mở. **Còn lại**: mô hình khối mới có 5 kiểu dùng chung cho mọi lớp — cần bộ mô hình riêng theo loại đối tượng. |
| 5 | Học cách dựng mô hình 3D cho đối tượng lớp phủ | ⬜ chưa bắt đầu |
| 6 | Mốc dòng thời gian: gắn vị trí, hiện note khi kéo; đủ 4000 năm | 🔄 **Dữ liệu xong, CHƯA NỐI DÂY.** `timeline/moc-lich-su.json` 62 mốc đã nạp (triều đại 17 · khởi nghĩa 8 · kháng chiến 1 · trận đánh 2 · tác phẩm 34), 31/62 có toạ độ. **Chưa module TS nào đọc file này** — còn phải dựng note nhỏ trên thanh thời gian + đính vị trí. |
| 7 | Ngục trung nhật ký xếp theo thứ tự bài | ✅ Xong |
| 8 | Thư viện: chế độ đọc kiểu Kindle, chế độ lật, mở rộng cửa sổ, tuỳ chỉnh, bỏ biểu tượng thừa, sắp theo chủ đề + thời gian/tác giả, link trang tỉnh, bổ sung tác phẩm | 🔄 hai sóng đang chạy: đặc tả UI · mở rộng nội dung + gán chủ đề + liên kết tỉnh |
| 9 | Hành trình lịch sử: thiếu mốc, UI lỗi thời | 🔄 sóng đặc tả UI đang chạy |
| 10 | Sa đồ chiến dịch: thiếu chiến dịch/trận đánh, UI lỗi thời. Đích: học **toàn bộ** trận đánh 4000 năm qua sa đồ | 🔄 hai sóng đang chạy: đặc tả UI · mở rộng dữ liệu |
| 11 | Lớp phủ chia theo lĩnh vực/chủ đề/giai đoạn, **không chia theo giới tính** | ⬜ chưa bắt đầu. Lớp `nu-danh-nhan-lich-su` phải giải thể, phân bổ lại theo lĩnh vực. |
| 12 | UI lag khi di chuyển | 🔄 Đã bỏ lượt dựng lại mô hình khi khung nhìn không đổi đáng kể. **Chưa chứng minh được đây là nguyên nhân chính** — xem cảnh báo dưới. |
| 13 | Nâng cấp bản đồ 3D | ⬜ chưa bắt đầu |

⚠️ **Chưa đo được lag thật.** Harness headless chạy trên swiftshader (GPU phần mềm) nên **mọi** cấu hình đều tụt xuống 3–6 fps, kể cả 2D không lớp phủ — sàn đó nuốt mất thứ cần đo. Chỉ so tương đối được: lớp phủ tốn ~21%, chế độ 3D tốn ~23%, cộng gần như tuyến tính, **không điểm nghẽn bất thường nào lộ ra**. Muốn tìm nguyên nhân thật phải đo trên máy có GPU thật (Chrome Performance panel), việc harness này không làm được.

Chi phí cấu trúc đã biết, chưa tối ưu: bật hết lớp phủ là **34 nguồn GeoJSON + 34 lớp vòng tròn + 34 lớp icon**, mỗi lớp một lượt vẽ.

---

## 11. Chờ chủ dự án quyết

| # | Câu hỏi | Chặn việc gì |
|---|---|---|
| ~~1~~ | ~~Bảng "Muôn xã Muôn phường"~~ | ✅ **Đã trả lời 2026-08-03**: dùng làm danh mục gợi ý, tự tra nguồn chính thống |
| 2 | Mở lớp "chợ truyền thống"? 17 mục đang treo (chợ Rồng, Đà Lạt, Cồn, Hàn, Viềng, Đông Ba, Đầm, 3 chợ nổi, Thành Thị Nại, cầu Bình Lợi) | 17 mục chưa xếp hạng |
| 3 | Nguồn báo chí ngoài báo Đảng (Tuổi Trẻ, Thanh Niên, Dân Việt, VnExpress) có được dùng cho `cong-trinh-ky-luc` không? Treo qua 2 sóng | Lớp công trình kỷ lục |
| 4 | Mua **Đào Duy Anh — "Đất nước Việt Nam qua các đời"**? Không có thì Bắc thuộc/Lý/Hồ/Mạc mãi ở mức "đủ một phần" | Ranh giới lịch sử |
| 5 | Mở PDF `DeClercq_Tome17` hoặc `BienGioi_VN-TQ_UBBGQG` bằng mắt cho số trang Điều 3 Công ước 26/6/1887 | Ranh giới Pháp–Thanh |
| 6 | Chuyển sang Cloudflare Pages (để CSP có tác dụng) hay giữ GitHub Pages và dùng `<meta>` CSP? | Bảo mật + media pipeline |
| 7 | Email cá nhân trong User-Agent 2 script — repo công khai. Thay bằng gì? | Riêng tư |
| 8 | Art trang phục 54 dân tộc cho chế độ thiếu nhi — ai hiệu đính văn hoá? | Chế độ trẻ em |
