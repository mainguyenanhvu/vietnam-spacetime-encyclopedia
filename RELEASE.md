# RELEASE — việc đã hoàn thành

Nhật ký những gì ĐÃ XONG, có bằng chứng. Việc còn lại nằm ở [`PLAN.md`](PLAN.md) — file kế hoạch duy nhất của dự án.

Quy tắc: một hạng mục chỉ được chuyển từ `PLAN.md` sang đây khi có **bằng chứng kiểm chứng được** — số commit, cổng validator xanh, hoặc kết quả đo. "Trông có vẻ xong" không đủ.

Tổng hợp từ 17 file kế hoạch rời rạc của các phiên 2026-07-17 → 2026-07-26, gộp ngày **2026-08-03**.

---

## Ảnh chụp hiện trạng — 2026-08-03

| Chỉ số | Giá trị | Đo bằng |
|---|---|---|
| File dữ liệu | **98** (.json + .geojson) | kiểm kê `public/data/**` |
| Tổng mục | **4.531** | như trên |
| Dung lượng dữ liệu | **8.134.365 byte** (7,76 MB) | như trên |
| Lớp phủ bản đồ | **34 file / 2.347 mục** (52% toàn bộ) | như trên |
| Lỗi parse JSON · BOM | **0 · 0** | như trên |
| Cổng dữ liệu | **12/12 xanh** | `npm run validate` |
| Bất biến chủ quyền, mức hiển thị | **13/13 thời kỳ xanh** | `npm run verify:chuquyen` — Chrome headless |
| Type check | **exit 0** | `npx tsc --noEmit` |
| Mục thiếu nguồn cấp mục | 898 (19,8%) — trong đó 622 có nguồn cấp file | kiểm kê schema |

Ba file `boundaries/*.geojson` đều có đủ 5 feature chủ quyền: **Hoàng Sa, Trường Sa, Thổ Chu, Bạch Long Vĩ, Phú Quý** — đúng bất biến §1.

---

## Dữ liệu

### Huyền sử · danh nhân
- Đợt 1 Huyền sử khai quốc + Tứ bất tử + Hải đội Hoàng Sa — `huyen-su-khai-quoc.json` (~10 mục). Lớp này giữ riêng ở Phase 3 vì chứa nội dung chủ quyền.
- Đợt 2 Anh hùng chống Bắc thuộc — `khoi-nghia-bac-thuoc.json`, 8 mục, commit `68d3b67`.
- Đợt 3 Khoa bảng — `khoa-bang-danh-nhan.json`, 9 mục.
- Đợt 5 Danh tướng kháng chiến — `danh-tuong-khang-chien.json`, 7 mục.
- Dọn 25 link Wikipedia khỏi `di-tich-qgdb.json`.
- Sóng 3 (`05bec73`): `chien-dich-tran-danh.json` 17 trận + `danh-nhan-cac-trieu.json` 11 danh nhân, sạch Wikipedia.
- v2.2 (`fe8d4f6`): +36 danh nhân (24 anh hùng cận–hiện đại, 12 trạng nguyên). Cương vực Việt cổ 4 thời kỳ (`613601b`).
- Sóng mở rộng 2026-07-20 (`1ad9576` + `3d243ed`): +51 mục / 4 lớp — khởi nghĩa kháng chiến 20, danh nhân văn hoá cận hiện đại 15, thành hoàng danh thần 6, trạng nguyên khoa bảng +10.
- Sóng 19 (`4cfba92`): +37 danh nhân, 3 lớp mới.

### Chiến dịch mở rộng vô hạn
- Sóng 1–19 cộng các sóng chuyên đề: Đình–Đền–Miếu · Phi vật thể–Chùa–Lăng · Nhà cổ–Hang–Bảo tàng · Trường–Thuỷ lợi–Biển đảo · Khảo cổ–Dinh thự · Chiến tranh + Danh hiệu cổ · Danh thắng + Kỷ lục · Kiến trúc Pháp + Làng nghề · Thương cảng–VQG–Đường HCM trên biển.
- CSDL đi từ 476 lên hơn 1.443 tên trong loạt sóng này, nay là 4.531 mục.
- Nhật ký từng sóng: xem lịch sử git và `docs/lich-su/expansion-campaign-plan.md`.

### Phim tài liệu · nhạc · địa danh
- Track A/B/D/E/F/G/H: nhạc quê hương, playlist yêu nước, tìm phim YouTube 121/137, hub UI, merge 200/255, 12 phim quốc gia, tab địa danh Google Maps. Commit `0f35efb`, `eaa93e3`+`cde9e55`, `d101647`+`d1340d6`, `04e6b55`.
- Chỉ nhúng `youtube-nocookie` đã kiểm oEmbed = 200.

### Ảnh · media
- 34/34 tỉnh có ảnh Commons xác thực qua API.
- Nhiều đợt bổ sung ảnh: +155, +83, +4, +31. Popup ảnh + legend (`7d9a782`).
- Bảo vật quốc gia 36 mục · Nam tiến 12 mốc · bản đồ Taberd 1838.

### Ranh giới lịch sử
- Georeference **1490 (Hồng Đức)** và **1838 (Đại Nam)**, wire lên selector thời kỳ — commit `e38b458`.
- Phán quyết nguồn cho toàn bộ các thời kỳ: xem `docs/ranh-gioi-1887-1895-phan-quyet.md`.

### Hợp nhất lớp (Phase 3)
- Lô 0–4: **69 → 29 lớp**, commit `b4451d4` → `5d8a128`.
- Gom UI còn **8 cụm accordion** (`ce8e9ab`).
- Dọn STRICT_SOURCE 67 → 27 tên (`2fb6b29`). Gộp cụm di sản `di-tich-cach-mang` + `danh-thang` (`6ca0418`).
- Bỏ lớp chia theo vùng miền, chỉ chia theo lĩnh vực.

### Cổng §9 — duyệt nội dung
- Toàn bộ 152 draft khảo sát trong đợt 2026-07-25 đã được nâng: 30 mục 🟢🟡 rồi 122 mục 🔴 nhạy cảm.
- Kết quả: **0 draft trên toàn bộ overlay** tại thời điểm commit `46e3a8c`.
- Hồ sơ quyết định giữ ở `docs/lich-su/` — **các con số trong đó đã lỗi thời, đừng đối chiếu**.

### Tên đường
- Builder tên đường + wire bản đồ (`4d8132f`): pilot **1.137 liên kết / 459 danh nhân**.
- Chọn Phương án A — bảng liên kết tĩnh + centroid qua Overpass, không vẽ hình học đầy đủ.

---

## Giao diện · 3D

- Sóng 1 (`39d3d89`): sửa màu tỉnh (`to-color`), đường sông LineString 19 sông + 26 núi, giảm opacity Nam tiến.
- Sóng 2 (`312e06b`): đại tu `style.css`.
- v2.2 (`fe8d4f6`): sửa panel tràn màn hình, Nam tiến che giữa bản đồ; sông/núi lên 38/42.
- R1–R10 xong trong một phiên 2026-07-18: focus 1 tỉnh · 9 model 3D low-poly · Olympia 4 vòng · ca dao và bài hát 34/34 tỉnh · ảnh Commons + validator giấy phép · 8 nhân vật 3D · sa đồ Bạch Đằng 938 · hành trình hoá thân 6 chặng.
- Dòng thời gian 4000 năm — 106 mốc. Tô màu + nhãn tỉnh, sông, núi.
- Sổ đăng ký 11 panel (`panels.ts`) với `MutationObserver` bắt cả đường ẩn không hợp tác.
- Khả năng tiếp cận: vùng chạm tối thiểu 44×44 px toàn bộ nút · `:focus-visible` với `--c-focus` tính riêng để đạt 3,45–3,70:1 · `prefers-reduced-motion` · combobox tìm kiếm đạt chuẩn ARIA đầy đủ.
- Sửa lỗi lớp sông núi không hiển thị — nguyên nhân gốc là fontstack 404 (xem bẫy #3 trong `PLAN.md`).
- 7 sink XSS đã bịt, CSP đã kiểm chứng. 12 lỗi logic. Nam tiến nạp lười.

---

## Hạ tầng · cổng kiểm tra

- **Phase 0 Guardrail**: validator id-unique xuyên file, `docs/existing_entities.txt` làm ngân hàng dò trùng.
- **11 cổng dữ liệu**, `run_validators.mjs` **tự phát hiện** mọi `scripts/validate_*.mjs` — thêm validator mới không cần sửa CI. Trước đây liệt kê tay và đã bỏ sót `validate_nguon_cam.mjs`.
- `audit_sovereignty.mjs` chạy như bước riêng, bắt buộc, trong `.github/workflows/deploy.yml`.
- `validate_nguon_cam.mjs`: 2 mức đỏ/cảnh báo, miễn trừ Commons và `anh_nguon`. Lần quét đầu bắt 98 + 57.
- Thêm `di-tich-quoc-gia` + `di-tich-qgdb` vào STRICT_SOURCE.
- Tự host glyph tại `public/fonts/` — 9 dải Unicode, thay endpoint demo đã có nguy cơ chết.
- Deploy: **GitHub Pages** qua `.github/workflows/deploy.yml`.

---

## Phiên 2026-08-03

- **Đặc tả sinh ảnh sang XML** — `docs/image-generation-spec.xml` v2.0. XML hợp lệ đã parse kiểm chứng: 16 ảnh (10 `<anh>` + 6 `<icon>`), 4 điều `<cam>` mức chặn, checklist duyệt 5 mục, thêm khối `<huong_dan_cho_claude>`.
- **Gộp 17 file kế hoạch** thành `PLAN.md` + `RELEASE.md` này. Từ nay chỉ dùng một file kế hoạch.
- **Cứu việc dở dang phiên 2026-07-26** — 605 file / 85 MB gồm 91 ảnh nhân vật chưa gộp, 7 bản vá chưa áp, 4 tài liệu audit. `docs/PROGRESS.md` cũ trỏ tới đường dẫn scratchpad đã bị dọn; nay đã sao lưu lại được.
- **Chốt câu hỏi treo "deploy ở đâu"** — GitHub Pages, đọc thẳng từ file CI. Hệ quả: `public/_headers` chỉ có tác dụng trên Cloudflare, CSP hiện **vô hiệu**.
- **Nối `icon.svg` + `manifest.webmanifest`** vào `<head>`. Cả hai đã tồn tại từ 2026-07-25 nhưng chưa bao giờ được gắn `<link>`. Kiểm chứng bằng build thật với `BASE_PATH` của CI: href được viết lại đúng thành `/vietnam-spacetime-encyclopedia/…`.
- **Hệ thiết kế hai chế độ** — `src/theme.css`: token trên `:root[data-che-do="nguoi-lon"|"tre-em"]`, thang chữ 8 bậc, thang khoảng cách bội số 4 px, bảng trạng thái, 6 token badge. `src/chedo.ts`: nút chuyển, lưu `localStorage`, đồng bộ `meta[theme-color]`, `aria-pressed`.
- **Vá 2 lỗi runtime xác nhận còn sống**:
  - Olympia vòng 2 — nút "Bỏ qua" biến mất ngay lần mở gợi ý đầu tiên vì `render()` gán lại `innerHTML` xoá sạch con, mà nút được `appendChild` một lần bên ngoài. Người chơi kẹt lại vòng 2 nếu không đoán ra từ khoá. Đã đưa nút vào trong `render()`.
  - `province-panel` chưa bao giờ được `registerPanel` — nó nằm trong `PANEL_IDS` nhưng observer không chạy, nên khi module khác ẩn panel qua `showOnly()` thì mô hình Three.js giữ nguyên WebGL context. Đây là nửa còn lại của lỗi rò context đã vá cho journey/battle/olympia.
- **Đối chiếu bảng "Muôn xã Muôn phường"** — 3.386 mục bóc được, 319 đã có, **2.445 còn thiếu** (196 là di tích quốc gia đặc biệt). Chốt phương án: dùng làm danh mục gợi ý, tự tra nguồn chính thống.
- **Tra nguồn 196 di tích quốc gia đặc biệt** — 3 lô song song, kết quả **181 bản ghi / 33 cụm mẹ / 14 di tích độc lập**, ở `docs/backlog/lo{1,2,3}-ket-qua.json`. Đo bằng script: **0 thiếu nguồn · 0 thiếu số quyết định · 0 Wikipedia · 0 trùng tên**. 26 mục gắn cờ `trung_unesco`. Toạ độ 1/181 — quyết định xếp hạng không chứa lat/lon.
- **`docs/SCHEMA.md`** — đặc tả mô hình dữ liệu ba tầng (`diem` / `ho_so` / `tac_pham`) cộng `hinh_hoc`, kèm đường di trú 7 bước.

### Chỉ mục tĩnh — mô hình PageIndex

- `public/data/_index/catalog.json` (71 KB) — một phần tử mỗi file dữ liệu: số mục, hình khối bọc ngoài, tên trường nguồn, sha256, mô tả một dòng.
- `public/data/_index/entries-index.json` (2,0 MB) — mảng phẳng **4.531 mục**, 2.390 mục có toạ độ, kèm khối `trung_ten[]` (**585 nhóm**) và `trung_toa_do[]` (**419 cặp dưới 200 m**) để dò trùng.
- `scripts/validate_catalog_freshness.mjs` chặn chỉ mục chết bằng sha256. **Cổng dữ liệu 11 → 12**, `run_validators.mjs` tự phát hiện, không phải sửa CI.
- Cổng đã tự chứng minh bằng **ca dương tính biết trước**: đổi 1 byte trong `geo/song-nui.json` → validator đỏ đúng như kỳ vọng, rồi hoàn nguyên bằng `git cat-file blob` (không dùng `git checkout` vì `core.autocrlf` sẽ ghi đè CRLF làm lệch byte), xác minh sha256 + `git hash-object` + `git diff --numstat` rỗng.
- `npm run build:index` và `npm run smoke` thêm vào `package.json`.

### Giao diện hai chế độ — đã nghiệm thu bằng số đo trên trình duyệt thật

| Đo | Người lớn | Trẻ em |
|---|---|---|
| Tương phản `h1` topbar | 11,73:1 | 5,18:1 (chữ lớn, ngưỡng 3) |
| Tương phản phụ đề | 8,27:1 | 5,18:1 |
| Tương phản nút topbar | 6,82:1 | 7,31:1 |
| Bo góc | 14 px | 26 px |
| Cỡ chữ nền | 0,94 rem | 1,08 rem |

- `style.css` tokenise xong: **236 → 4 mã hex sống** (4 mã còn lại là màu ngữ nghĩa một lần dùng, đã ghi lý do). 63 lượt dùng tên biến cũ → 0. `git diff --stat`: +397 −443.
- **Bất biến #1 xác nhận trên trình duyệt thật, cả hai chế độ**: `querySourceFeatures` trả đủ **Hoàng Sa, Trường Sa, Thổ Chu, Bạch Long Vĩ, Phú Quý** ở nguồn `era-34`, cộng Hoàng Sa + Trường Sa ở nguồn `chu-quyen` riêng. Canvas 1920×718, style đã tải xong — không phải ảnh chụp, mà là truy vấn feature đã render.

### Nạp lười ranh giới era + cổng gác chủ quyền

- `map.on("load")` trước đây nạp cả 3 era vô điều kiện — **4,70 MB GeoJSON lúc mở trang khi chỉ cần 1,17 MB**. Tách thành `ensureEra()` gọi từ `setEra()`. Đo được: **1/3 nguồn era** tồn tại lúc mở trang.
- 🔴 Vá **hai nửa của cùng một bẫy thứ tự lớp**. `landmarks3d.ts:281` ghim `era-phapthuoc-fill` làm `beforeId` — đúng một cách tình cờ vì trước đây cả 3 era luôn tồn tại. Và `ensureEra` phải truyền `beforeId = "chu-quyen-labels"`, nếu không lớp era sinh sau sẽ **phủ mất nhãn Hoàng Sa / Trường Sa**. Cả hai đều im lặng: không lỗi console, không cổng dữ liệu nào bắt được.
- **`scripts/verify_chu_quyen.mjs`** — Chrome headless riêng (swiftshader, WebGL thật), quét 13 thời kỳ. Thay cho việc "mở trình duyệt nhìn bằng mắt" vốn không chạy lại được và trong phiên này còn không làm được (tab chạy nền bị hãm `requestAnimationFrame`). **13/13 xanh**, đã chứng minh biết đỏ bằng ca dương tính.

### Ba lỗi bắt được nhờ tự đo, không phải nhờ build xanh

1. **Gradient topbar trẻ em bản đầu chỉ đạt 2,15:1** với chữ trắng — hỏng nặng ngưỡng 4,5:1. Đẩy sắc độ sâu hơn, giữ đủ ba màu cam → đỏ → tím, đo lại 5,07 · 6,00 · 6,71:1.
2. **Nút topbar chế độ trẻ em đạt 4,60:1** với nền mờ 8% — qua ngưỡng nhưng biên mỏng tới mức một lần chỉnh gradient là trượt. Đổi sang viên thuốc trắng đặc, chữ nâu cam đậm: 7,31:1.
3. 🔴 **Chrome không làm mới kiểu dáng của phần tử có `transition` trên `color`/`background` khi đổi chế độ.** Đo được: biến đã đúng, rule đã hết khớp, nhưng giá trị tính ra vẫn là của chế độ cũ — trễ đúng một nhịp, trong khi `font-size` (không nằm trong danh sách transition) đổi ngay. Đã bỏ `color`/`background` khỏi cả 5 khai báo `transition` trong `style.css`; phản hồi di chuột giữ lại qua `transform` + `box-shadow`. Kiểm chứng: bấm chuyển 4 lần liên tiếp, cả hai chiều đều đúng.

---

## Phiên 2026-08-04

Bốn việc chủ dự án giao sau khi khảo sát lại trang. Commit `3591342` (3D + hình thức + a11y).

### Biểu tượng lớp phủ ở chế độ 3D — dựng thành mô hình khối

Chủ dự án: *"ở 3D, các biểu tượng vẫn chưa được chuyển dạng, vẫn ở 2D"*.

Đo trước khi sửa, bằng Chrome headless có WebGL thật:

| Mức phóng | Chấm phẳng vẽ ra | Mô hình 3D dựng ra |
|---|---|---|
| 4,69 (mặc định khi bấm 3D) | **152** | **0** |
| 9,50 | 7 | 7 |
| 12,0 | 2 | 2 |

Gốc lỗi: `capNhatMoHinhDiem()` thoát sớm khi `dangDiorama()` — mà cảnh diorama chính là cảnh hiện ra ngay khi bấm nút 3D. Mô hình chỉ sống từ zoom 7,5 trở lên, gần như không ai xuống tới đó.

- Bỏ nhánh thoát sớm — 3D bật là dựng mô hình ở **mọi** mức phóng.
- Chiều cao biểu kiến co theo zoom: **20 px** ở tầm cả nước → **46 px** ở tầm phố. Bản sửa đầu giữ nguyên 46 px và **hỏng theo cách khác**: 152 mô hình cao 46 px dựng lên một dải đất rộng 350 px thì che kín chính đất nước, thấy rõ trên ảnh chụp. Đây là lý do phải chụp lại sau mỗi lần sửa chứ không tin vào lập luận.
- Icon phẳng nhường chỗ khi 3D bật; vòng tròn ở lại và thu từ `r5` xuống `r3` — nó tụt xuống vai trò chân đế và **vùng bấm**, vì mô hình Three.js không nhận sự kiện bấm của MapLibre. Điểm vượt trần vẫn còn vòng tròn nên không mục nào biến mất khỏi bản đồ.
- Đổi `clone()` sang **`InstancedMesh`**: một ngôi chùa 8 mảnh × 400 điểm là 3.200 lệnh vẽ mỗi khung hình, gom lại còn 8. Nhờ đó nâng trần **120 → 400** mô hình. Ma trận chỉ nạp lại khi mức phóng đổi hoặc tập điểm đổi, không phải mỗi khung hình.
- `map.moveLayer("landmarks-3d")` sau mỗi lần thêm lớp phủ — lớp thêm sau vẽ sau, không đẩy lên thì vòng tròn phẳng đè lên chân mô hình.

### Hình thức

- **Thanh trượt dòng thời gian** — control chạm nhiều nhất mà thô nhất trang: một vạch 4 px với nút mặc định của hệ điều hành. Dựng lại rãnh 7 px bo tròn, phần đã đi qua sáng lên theo `--tien-do` do `setPeriod()` đặt, nút 19 px viền nâu có quầng sáng khi di chuột/bàn phím.
- **Cụm control MapLibre** — hộp trắng vuông mặc định đứng cạnh panel kính mờ bo 14 px. Cho về cùng ngôn ngữ: kính mờ, bo 10 px, hover nhuộm màu brand.
- **Thước tỉ lệ chuyển trái-dưới → phải-dưới.** Bảng lớp cao gần hết cột trái nên thước nằm lọt phía sau, đo trên ảnh chỉ thò ra vài pixel mép dưới.
- **Ghi chú pháp lý cương vực** từ bốn dòng chữ cam trôi nổi thành callout có khung — cùng lượng chữ nhưng đọc ra ngay là lời chú chứ không phải lỗi.
- Đầu bảng lớp có gạch chân; nhãn «THỜI KỲ» và ô chọn thời kỳ dựng lại.

### Hoàn thiện tính năng

- **Nối dây `timeline/events.json`** (34 sự kiện, NQ 202/2025/QH15). File có đủ số nghị quyết, ngày hiệu lực và link cổng Chính phủ nhưng **không module TS nào đọc tới** — panel tỉnh nói "hợp thành từ A và B" mà không nói theo văn bản nào, trái bất biến mọi mục phải dẫn về nguồn chính thống. Nay hiện: «Hợp nhất An Giang + Kiên Giang — Nghị quyết 202/2025/QH15, hiệu lực 1/7/2025» kèm link. Kiểm bằng cú bấm thật trên canvas headless.
- **11 panel nổi thành hộp thoại thật** — `role=dialog`, `aria-label`, đưa tiêu điểm vào panel khi mở, trả tiêu điểm ở `hideAllPanels()` (đích của phím Esc). Đăng ký nốt `library`/`game`/`quiz` panel, trước nay không module nào đăng ký chúng.
  - `aria-label` đọc `data-nhan` **trước** `h2`: bốn panel trong `index.html` nạp nội dung không đồng bộ, lúc mở còn rỗng nên đọc `h2` ra chuỗi rỗng rồi rơi về id — đo được trình đọc màn hình sẽ đọc lên "library-panel".
  - **Cố ý không làm focus trap**, `aria-modal=false`: các panel này không modal, bản đồ sau lưng vẫn kéo/bấm được. Nhốt tiêu điểm trong hộp thoại không modal là bẫy người dùng bàn phím vào chỗ mà chuột thì đi ra được.
- **Link "bỏ qua tới bản đồ"** — trước phải Tab qua logo, ô tìm kiếm và 4 nút mới chạm được bản đồ.
- **`aria-valuetext` cho thanh trượt** — đọc tên thời kỳ thay vì "3 trên 12".
- Thư viện chia mục thơ văn của Bác theo trường `nhom`.

### Một phép đo sai, ghi lại để lần sau khỏi mất công

Lần đầu kiểm link "bỏ qua" báo **hỏng**: link không vào khung hình khi nhận tiêu điểm. Probe kỹ thì `document.activeElement` **đúng là** link, nhưng `a.matches(':focus')` trả `false`. Nguyên nhân: cửa sổ Chrome headless không có tiêu điểm hệ điều hành nên `:focus` không khớp. Bật `Emulation.setFocusEmulationEnabled` thì `matchFocus: true` và link nằm ở `top: 7,5 px` — đúng như thiết kế. **Lỗi ở phép đo, không ở trang.**

---

## Thư viện thơ văn Hồ Chí Minh — 2026-08-04

Chủ dự án: *"những bài thơ Bác viết vẫn chưa đủ, hãy sưu tập đầy đủ đi"*, và sau đó xác nhận lại nguyên tắc quyết định mọi thứ ở đây: **tác phẩm của Bác được dùng rộng rãi, không có bản quyền đối với toàn dân** (mất 1969, hết hạn bảo hộ tại Việt Nam từ 2020).

**31 → 185 tác phẩm**, chia sáu mục trong thư viện:

| Mục | Số bài | Ghi chú |
|---|---|---|
| 📓 Ngục trung nhật ký | 117 | **phủ kín 133 số bài của tập** — xem mục dưới |
| 🖋️ Thơ khác | 27 | gồm 2 bài báo Việt Nam Độc Lập 1941 đã xác minh bút danh |
| 🎊 Thơ chúc Tết & mừng xuân | 24 | **liền mạch 1942 → 1969** |
| 🏮 Thư & thơ Trung thu gửi thiếu nhi | 7 | mảng hợp chế độ trẻ em nhất |
| 📜 Văn chính luận · thư · lời kêu gọi | 8 | 5 mục đã lên toàn văn |
| ❓ Tồn nghi — chưa xác định tác giả | 2 | tách hẳn, có cảnh báo cấp nhóm |

---

## Phiên 2026-08-05

### Phiếu UI-A đóng — tông đỏ topbar

Phiếu gồm ba mục. Mở lại thì **mục 1 (logo) và mục 3 (ô tìm kiếm) đã làm xong từ commit `21238b0`** ngày 03-08 — chính thân commit đó ghi là tách riêng tông đỏ để làm sau, nhưng phiếu không ai đóng. Đã nghiệm thu lại bằng ảnh chụp chứ không bằng việc đọc CSS: logo SVG đảo màu đúng ở cả hai chế độ, ô tìm kiếm khi focus giữ nền tối 16% + viền vàng + quầng sáng, không loé trắng.

Mục 2 dựng thử **bốn tông thẳng trên trang thật** (ghi đè `--mat-nghich` qua CDP rồi chụp), chủ dự án chọn **A — đỏ quốc kỳ `#b02020 → #8a1616`**.

Nền sáng lên thì mọi lớp chữ sáng nằm trên nó đều tụt tương phản. Số đo lấy từ màu đã tính trong trang, không phải từ hằng số trong file:

| Lớp | Trên `#8b1a1a` (cũ) | Trên `#b02020` (mới) | Ngưỡng |
|---|---|---|---|
| Tiêu đề `--mat` | 9,13:1 | **6,72:1** | 4,5:1 |
| Chữ nút `--chu-tren-nghich` | 6,44:1 | **4,74:1** | 4,5:1 |
| Sao logo + viền ô tìm, nếu giữ `--nhan-sang` | 4,02:1 | **2,95:1** ❌ | 3:1 |
| …sau khi đổi sang `--nhan-mo` | — | **4,74:1** ✅ | 3:1 |

Vàng thếp `--nhan-sang` (`#d4a24e`) rơi xuống dưới ngưỡng 3:1 của WCAG 1.4.11 cho hình khối phi văn bản — ngôi sao trên logo và viền báo "ô đang nhập" đều mờ đi. **Không nâng sáng thẳng `--nhan-sang`**: nó còn dùng ở 14 chỗ khác, phần lớn trên nền sáng nơi nó vốn đã chỉ ~2,3:1, nên nâng toàn cục là chữa topbar rồi làm hỏng thanh thời gian và panel. Thay bằng `--nhan-mo` (`#f2d399`) ở đúng ba quy tắc nằm trên dải đỏ — đây đã sẵn là bậc "vàng trên nền tối" của bảng màu, chính là giá trị của `--chu-tren-nghich`.

Kèm theo, **một lỗi có sẵn được sửa nhờ đi qua đây**: ở chế độ trẻ em, viền ô tìm kiếm khi focus lấy `--nhan-sang` = `#a855f7` (tím) đặt trên dải cam–đỏ–tím, đo được **1,31:1** — gần như vô hình. Đổi sang `--nhan-mo` (`#ddd6fe`) lên **3,73:1**.

Sửa đúng 4 file: `theme.css` (gradient + 2 quy tắc logo), `style.css` (viền focus), `chedo.ts` (`MAU_THANH` — nguồn thật của màu thanh trình duyệt theo chế độ), `index.html` (`meta[theme-color]`).

⚠️ **Bẫy đo đạc, ghi lại để lần sau đừng mắc lại.** Chrome headless không có cửa sổ hoạt động nên `:focus` **không khớp** — lượt chụp đầu tiên trả về đúng trạng thái nghỉ (nền 8%, `box-shadow: none`) trong khi tôi tưởng đã nghiệm thu được trạng thái đang nhập. Phải bật `Emulation.setFocusEmulationEnabled` trước khi điều hướng. Không có bước này thì mọi ảnh chụp trạng thái focus từ trước tới nay đều là ảnh giả.

❌ **Còn lệch, cố ý không đụng tới trong phiếu này**: `public/manifest.webmanifest` khai `theme_color: #6d1414` và `public/icon.svg` tô nền `#6d1414` — cả hai lấy chặng TỐI của gradient cũ, đã lệch với `index.html` từ trước phiên này. Đây là màu của biểu tượng ứng dụng khi cài PWA, không phải topbar; gộp vào đây là mở rộng phạm vi phiếu.

Nghiệm thu: `npm run build` exit 0 (chạy `tsc`) · `npm run validate` **12/12 cổng xanh** · Chrome headless chụp lại hai chế độ, console sạch.

### Năm văn kiện từ bản trích lên toàn văn

Tuyên ngôn Độc lập nằm trong thư viện với **đúng 4 dòng** — văn kiện quan trọng nhất cả bộ sưu tập. Lý do ghi hồi trước là "mục dẫn đọc", không phải bản quyền, nhưng kết quả vẫn là cắt cụt tác phẩm không cần cắt.

| Mục | Trước | Sau | Nguồn |
|---|---|---|---|
| Tuyên ngôn Độc lập | 4 | **30 đoạn** | Nhân Dân — tư liệu Ban Tuyên giáo TW / HCM Toàn tập T.4 |
| Di chúc | 4 | **30 đoạn** | hochiminh.vn — bản công bố 1969 |
| Lời kêu gọi thi đua ái quốc | 7 | **42 dòng** | CAND — đăng lại Cứu quốc số 968, 24/6/1948 |
| Lời kêu gọi toàn quốc kháng chiến | 4 | **9 dòng** | QĐND |
| Thư gửi các học sinh 1945 | 3 | **9 đoạn** | Nhân Dân |

**Bảy mục giữ nguyên bản trích, không chắp vá.** Đáng ghi nhất: *Bài nói tại Đền Hùng* được xác nhận là **nói chuyện ứng khẩu, không có văn bản viết** — mọi nguồn chỉ lưu đúng một câu. Đó là bản chất tư liệu chứ không phải thiếu sót của dự án.

### Ranh giới xử lý chữ nghi sai — áp nhất quán cho cả bộ sưu tập

| Tình huống | Xử lý | Ca thật gặp trong phiên |
|---|---|---|
| Nguồn in ra thứ **không tồn tại** | sửa + ghi lại cả hai bản | «Việt Nam Cộng hòa Dân chủ» → «Việt Nam Dân chủ Cộng hòa» (Tuyên ngôn ĐL) · «phấm khởi» → «phấn khởi» (chúc Tết 1950) · «hằng hái» → «hăng hái» (Di chúc) |
| Hai dạng **đều lưu hành** | giữ nguyên + ghi cả hai | «Sự thực/Sự thật» · «tính mạng/tính mệnh» · «sẽ/để» (chúc Tết 1946) |
| Một nguồn, nghi mà không đối chiếu được | **giữ nguyên** | «binh quyền» (chúc Tết 1945) |

Quốc hiệu bị đảo là ca nghiêm trọng nhất: đây là tên nước trong chính văn kiện khai sinh ra nó, mà «Việt Nam Cộng hòa» lại là quốc hiệu của một thực thể khác. Ba căn cứ để kết luận lỗi in chứ không phải dị bản: chưa từng tồn tại thực thể tên đó · đoạn kết **cùng bài trên chính trang ấy** ghi đúng · tra chéo cổng nhà nước đều ra dạng chuẩn.

«Hằng hái» ban đầu **giữ nguyên** vì chỉ có một ca; sửa sau khi lô Trung thu bắt được đúng lỗi đó lần thứ hai trên cùng hệ thống báo. Hai ca độc lập cùng dạng mới đủ.

### Lỗi dữ liệu bắt được nhờ đối chiếu chéo, không cổng nào bắt được

- **Chúc Tết 1953 thiếu một câu.** `hochiminh.vn` in 11 dòng; hai nguồn Nhân Dân in 12, trong đó một nguồn dẫn thẳng *Báo Nhân Dân số 95, 11–15/2/1953, tr.1*. Lấy bản 12 dòng, giữ «kết đoàn» vì hai trong ba nguồn ghi vậy.
- **Lời bình bài 1944 sai bối cảnh** — ghi Bác «còn hoạt động bí mật», thực ra Tết Giáp Thân Người đã ra tù và giữ chức Phó chủ tịch Việt Nam cách mạng đồng minh hội.

### Bốn chỗ vênh nêu ra thay vì giấu

Mỗi chỗ đều ghi **điều kiện cụ thể để về sau phân xử được**, không chỉ dán nhãn "chưa rõ".

- **Niên đại bài chúc Tết Quý Mùi 1943.** `hochiminh.vn` xếp vào tuyển tập thơ chúc Tết của Bác; «Hồ Chí Minh — Biên niên tiểu sử» Tập 2 chép Người bị giam ở Quảng Tây 27/8/1942 → 10/9/1943, đúng Tết Quý Mùi đang bị áp giải sang nhà giam Liễu Châu, và 3.252 dòng biên niên **không nhắc bài này** dù có nhắc bài 1942 và 1944. Lô tra đề nghị gỡ hẳn — **không theo**: biên niên **im lặng** không phải biên niên **phủ nhận**, và xoá mục chính là chọn bản gọn hơn, trái bất biến §1.4. Giữ lại, đổi tên thành «niên đại đang tranh luận», gỡ mọi khẳng định khỏi `thoi_ky`/`loi_binh`, nêu cả hai phía trong ghi chú hiện ra cho người đọc. Chủ dự án chốt **giữ** ngày 2026-08-04.
- Cặp dòng lặp trong bài 1943 · «binh quyền» bài 1945 · nơi đăng bài 1945.

### Ngục trung nhật ký: 55 → 117 bài, phủ kín cả tập

Ngõ web bế tắc thật, không phải tra hời hợt: một lô tra ~25 lượt trên đúng danh sách nguồn được phép rồi báo **0 bài**. Toàn văn tập thơ trên mạng chỉ có hai dạng — nguồn bị cấm (thivien, wikisource, blog), hoặc PDF ảnh quét trên cổng .gov.vn mà máy không có OCR để đọc.

Lô đó đề nghị nới chính sách: dẫn nguồn dù chưa mở đọc được. **Từ chối** — dẫn một URL mình chưa đọc chính là bịa nguồn, đúng thứ bất biến §3 cấm.

Đường vòng: nguồn mà 39 bài nạp trước đang dẫn hoá ra là **PDF có lớp chữ thật** — «Nhật ký trong tù» (tái bản), NXB Chính trị quốc gia Sự thật 2015, 212 trang, đăng trong Không gian văn hoá Hồ Chí Minh của một trường thuộc Sở GD-ĐT TP.HCM. Mọi cách bóc thô đều ra ký tự rác vì PDF dùng **font CID**: chuỗi trong file là mã glyph, phải đi qua bảng `/ToUnicode` mới ra chữ. Viết bằng `zlib` có sẵn trong Node, không cài thêm gì vào máy.

**Ba lỗi bóc bắt được trước khi nạp** — cổng dữ liệu không bắt nổi loại lỗi này, chỉ đối chiếu mới thấy:

| Lỗi | Hậu quả nếu bỏ qua | Cách sửa |
|---|---|---|
| Xuống dòng theo mọi lệnh định vị chữ | Chữ trong ngoặc kép in khác font → câu thơ vỡ làm đôi | Chỉ ngắt dòng khi toạ độ Y đổi; `T*` ép ngắt |
| Số chú thích chân trang in giữa câu | «Thảm đạm kinh doanh» / «1» / «trúc lộ phu;» thành hai dòng | Nối lại khi mảnh trước không kết thúc bằng dấu câu |
| Ngày tháng sách in dưới đầu đề | «18-11» thành một câu thơ | Tách sang `thoi_ky` |

Kiểm chứng bằng **55 bài đã có** (lấy từ SGK và bản Viện Văn học, nguồn độc lập): 46 bài khớp từng câu. Phần còn lại là 1 bài không thuộc 133 bài của tập, và **ba chỗ dị bản thật** giữa hai bản in nhà nước — «đông hàn/đông tàn» và «cách kiện cường/cánh khẩn trương» (Tự miễn) · «ngận/hẩn thống khổ» · «thuỵ thời/thụy thì». Nêu cả hai bản trong ghi chú, không sửa chữ đã nạp.

**Kiểm chéo bằng nguồn thứ hai.** Lô tra web tuy chỉ ra được 2 bài nhưng 2 bài đó thành phép thử độc lập cho cả đường ống bóc PDF: «Dạ bán văn khốc phu» khớp **4/4 câu** với bản đọc thẳng trên `hanoimoi.vn`; «Dương Đào bệnh trọng» khớp 4/4, chỉ khác ở chỗ sách đóng ngoặc kép thành ngữ «Thành hỏa trì ngư». Lô đó cũng cảnh báo có thể lẫn «Dạ bán» với «Dạ bán văn khốc phu» — đối chiếu bản sách cho thấy **hai bài khác nhau thật**, bài 100 và bài 65, đã nạp riêng.

Bốn bài liên quan tới sĩ quan Quốc dân Đảng Trung Hoa (Tưởng Giới Thạch · Lương Hoa Thịnh · Hầu Chí Minh · khoa viên họ Trần) đều mang sẵn chú thích của chính cuốn sách nói rõ nhân vật là ai. Chỗ dễ nhầm nhất — **Hầu Chí Minh là chủ nhiệm Cục chính trị Chiến khu IV, không phải Hồ Chí Minh** — được nói thẳng trong ghi chú của bài 128, nơi tên hai người đứng gần nhau nhất.

Bản quyền bản dịch lần này biết chắc thay vì đoán, vì sách in tên dịch giả từng bài: **24 bài Nam Trân đơn danh** (mất 1967, hết bảo hộ) chép nguyên bản dịch thơ; **38 bài** dịch giả còn bảo hộ (Huệ Chi, Đỗ Văn Hỷ, Băng Thanh, Nguyễn Sĩ Lâm, Hoàng Trung Thông, Trần Đắc Thọ, Văn Trực - Văn Phụng) thì không chép, thay bằng bản dịch nghĩa văn xuôi dự án tự viết từ phiên âm Hán-Việt và nói rõ trong ghi chú. Bản dịch nghĩa của chính cuốn sách cũng không chép — đó là dịch phẩm của người biên soạn.

Ba bài không nạp: **bài 1** và **bài 108** dự án đã có (khớp hụt vì hai bài đó không có đầu đề); **bài 101 «Liễu Châu ngục»** thì chú thích của chính cuốn sách ghi *nguyên bản chỉ có đầu đề, không có thơ* — không có nguyên văn thì không nạp, kể cả khi biết chắc bài đó tồn tại.

### Nhóm «tồn nghi» — cách giữ tư liệu mà không nhận nhầm tác giả

«Dân cày» và «Công nhân» **có** nguyên văn trên báo Cao Bằng nhưng nguồn ghi «Khuyết danh», và dò chéo danh sách bút danh chính thức trên `tulieuvankien.dangcongsan.vn` không mục nào khớp. Ban đầu để ngoài dự án: có văn bản mà thiếu quy thuộc thì nạp vào là **bịa quy thuộc**.

Chủ dự án quyết **«giữ hết»** — nên hai bài vào một nhóm thứ sáu `nhom: "ton-nghi"` thay vì trộn với thơ đã xác minh. Ba lớp cảnh báo, chồng lên nhau vì người đọc có thể dừng ở bất kỳ lớp nào:

1. tiêu đề nhóm — «❓ Tồn nghi — thơ trên báo Việt Nam Độc Lập, chưa xác định tác giả»;
2. một đoạn cảnh báo cấp nhóm nói rõ vì sao chúng ở đây (đăng trên tờ báo của Bác) và vì sao **không** đủ để nhận là của Bác;
3. trong từng mục: `ten` gắn «chưa xác định tác giả», `tac_gia` để đúng chữ «Khuyết danh», `ghi_chu_dich` đối chiếu thẳng với «Trẻ con»/«Phụ nữ» — hai bài đó vào nhóm thường **vì** `tulieuvankien` xác nhận đích danh bút danh «Kim Oanh» (số 104, 1/9/1941) và «Bé Con» (số 106, 21/9/1941).

Điều kiện chuyển sang nhóm thường ghi thẳng trong `ghi_chu_bien_tap`, không để người sau phải đoán.

Còn hai mục vẫn không nạp được: «Trẻ chăn trâu» và «Tầm hữu vị ngộ» — không có nguyên văn trên nguồn được phép. Đây là thiếu **văn bản**, khác hẳn thiếu **quy thuộc**, nên không có nhóm nào chứa được.

### Bẫy công cụ — ghi lại vì tốn của phiên này ba lượt tra lặp

`WebFetch` chạy prompt qua một model tóm tắt, và model đó **tự từ chối trả nguyên văn dài** viện bản quyền — kể cả với cổng nhà nước công khai và tác phẩm đã hết hạn bảo hộ. Nặng nhất: gọi vào trang Di chúc của `hochiminh.vn` thì nó trả về **bản dịch tiếng Anh tóm tắt** thay vì nguyên văn tiếng Việt.

Đo được trên cùng một trang `hochiminh.vn`: một agent dùng WebFetch kết luận "không lấy được"; một agent lấy văn bản thô lấy đủ **21 bài**.

Nhưng **không phải ca nào cũng là lỗi công cụ**: «Trẻ chăn trâu» crawl thô vượt được lỗi redirect của `qdnd.vn` rồi thấy trang **thật sự chỉ có một câu giới thiệu podcast**. Phải kiểm chứ đừng mặc định.

Tải thẳng mã HTML gốc (không qua trình render) còn dùng để tách bạch **«nguồn in sai»** khỏi **«công cụ crawl làm hỏng»** — cách này xác định được `hochiminh.vn` đúng là in «phấm khởi» và «binh quyền», và xác định cặp dòng lặp bài 1943 nằm trong chính nguồn.

### Hai trường ghi chú tách bạch

`ghi_chu_dich` **render ra trang** cho người đọc; `ghi_chu_bien_tap` chỉ nằm trong JSON, dặn người/agent sửa dữ liệu về sau. Khai cả hai trong `interface Poem`, trong đó `ghi_chu_bien_tap` có chú thích nói rõ nó **cố ý không render** — nhét câu «ĐỪNG SỬA» vào `ghi_chu_dich` là nói với nhầm người.

### Đóng nốt phiếu «7 DIFF cứu từ phiên 26-07» — năm bản vá còn lại

Bốn bản vá đã áp từ trước (1a, 1b, 2, 6a). Phiên này áp nốt **3, 4, 5, 6b, 7**.

#### DIFF-3 · chốt fontstack bằng kiểu

Năm chuỗi `"text-font"` rời rạc trong `main.ts` gom về `src/map-fonts.ts`. Điểm đáng ghi: **hằng số trần không đủ**. Ba trong năm lời gọi `map.addLayer` ép cả object literal bằng `as never`, mà `as never` nuốt sạch kiểm tra kiểu bên trong — gõ `["Open Sans Bold"]` ở đó vẫn biên dịch xanh. Đối số của một lời gọi **hàm** thì vẫn được kiểm bình thường, nên fontstack đi qua `textFont(FONT_LABEL)` rồi spread vào `layout`.

Vì sao spread chứ không bọc cả object: bọc qua một generic làm mất suy luận tuple của biểu thức MapLibre — `["get", "ten"]` tụt xuống `string[]` và style-spec từ chối. Hai chỗ không có `as never` đỏ ngay lượt đầu, đó là cách phát hiện.

Bước phủ định đã chạy: đổi tạm một chỗ **bên trong `as never`** thành `["Open Sans Bold"]` → `tsc` đỏ đúng chỗ, `TS2820` ở dòng 412.

#### DIFF-4 · ranh giới kiểu cho JSON

`fetchJson<T>(path)` cũ trả `(await res.json()) as T` — một lời khai không ai kiểm. Nay `fetchJson(path, parse)` có tham số parse **bắt buộc**: quên là lỗi biên dịch, không phải lỗi runtime. Thêm `src/types/parse.ts` (`str` `num` `strs` `arr` `oneOf` `rec` `itemsOf`) và `src/util/fetch.ts`. Chuyển cả 16 nơi gọi, gồm `fetchJsonSafe` — bản sao thứ hai của cùng lỗi, nằm trong `search.ts`.

**Đo trên dữ liệu thật trước khi viết, và số đo đổi cách làm.** Lời khai kiểu trong `main.ts` sai với chính dữ liệu của dự án:

| Trường | Khai trong `main.ts` | Thật trong JSON |
|---|---|---|
| `nam` | `string \| number` | 513 số · 35 chuỗi («Thời Hùng Vương») |
| `xep_hang` | `number` | 22 số · **82 chuỗi**, có mục là cả một câu văn |
| `dot` | `number` | 188 số |

Đây chính là chuỗi nhân quả đẻ ra 7 sink XSS: khai `number` → `tsc` tin → người viết thấy "số thì escape làm gì" → bỏ `esc()`. Nay mọi trường **sẽ đi vào HTML** đều khai `string` và ép ở hàm parse, kể cả trường vốn là số. Nhờ đó `esc(o.nam)` biên dịch được tự nhiên và 31 chỗ `esc(String(...))` rút còn `esc(...)` — `tsc` giữ lại đúng 5 chỗ thật sự là số.

Kèm theo, 10 chỗ `as OverlayItem & { … }` biến mất. Mỗi chỗ khai một tập trường khác nhau, không chỗ nào là nguồn sự thật; nay `interface OverlayItem` có đủ 22 trường. Và `f.properties as unknown as OverlayItem` ở trình xử lý click đổi thành `parseOverlayItem(f.properties)` — cast chỉ là lời khai, parse mới là ép kiểu thật.

**Hai bước phủ định đã chạy:**

1. Bỏ tham số `parse` ở một nơi gọi → `tsc` đỏ (`TS2554`).
2. Ca dương tính đầu-cuối: gieo `3"><script>window.__BIDOT=1</script>` vào trường `dot` của **mọi** mục `bao-vat-quoc-gia.json`, chạy Chrome headless, bấm marker thật. Kết quả: `properties.dot` kiểu `string` · 0 thẻ `<script>` trong popup · `window.__BIDOT` vẫn `undefined` · popup chứa chuỗi `&lt;script&gt;`. Dữ liệu được khôi phục trong `finally`.

   ⚠️ Lượt đầu của phép thử này **vô nghĩa mà trông như có ý nghĩa**: gieo payload vào đúng một mục thì cú bấm rơi trúng marker khác (mục chồng nhau ở zoom xa) và popup trả về là của mục sạch. Gieo vào mọi mục thì bấm trúng ai cũng là ca thử hợp lệ.

#### DIFF-5 · tách `overlays-config.ts`

629 dòng khai báo 34 lớp phủ + ba hàm dựng popup rời khỏi `main.ts` (**3.363 → 2.943 dòng**). Thuần di chuyển; thay đổi thật duy nhất là gom 9 bản sao dải cảnh báo toạ độ về `canhBaoToaDo(muc, doiTuong)` — tham số `doiTuong` giữ nguyên chữ hiển thị của từng lớp («Toạ độ nơi thờ», «Toạ độ quê/khu lưu niệm», «Toạ độ đền/đình»), vì đó là thông tin thật chứ không phải dị bản ngẫu nhiên.

Chứng minh là *chuyển* chứ không phải *viết lại*: bóc bảng `OVERLAYS` ở `HEAD` và ở file mới rồi so `id`/`label`/`icon`/`file`/`nguon`/`popup` của từng lớp — **34/34 lớp khớp từng ký tự**.

Nghiệm thu chạy: bật cả 34 lớp trong Chrome headless → 34/34 dựng được nguồn + lớp; bấm marker 5 lớp → popup dựng đủ nội dung; console sạch. `tsc` không bắt được lỗi ở đây (bảng lớp phủ là dữ liệu thuần — gõ sai đường dẫn file vẫn biên dịch xanh), nên bước này không bỏ được.

⚠️ Bẫy trong chính phép nghiệm thu: `querySourceFeatures` **chỉ trả feature trong khung nhìn**. Lượt đầu, sau khi nhảy tới lớp trước thì ba lớp sau trả 0 feature và bị chấm là hỏng. Đọc `getSource(id)._data` mới độc lập với viewport.

#### DIFF-6b · gom `esc()`

9 bản sao y hệt về 1. Bản thứ 9 là `escHtml` trong `search.ts` — **cùng thân hàm, khác tên**, nên mọi lượt dò trùng trước đều bỏ sót.

#### DIFF-7 · smoke + chủ quyền thành cổng chặn của CI

`deploy.yml` nay chạy `npm run verify:chuquyen` rồi `npm run smoke` sau bước build, cả hai đều **chặn deploy**. Điều kiện bật đã đủ: smoke 9 đạt/0 hỏng, chủ quyền 13/13 thời kỳ.

Trước khi gắn có tra thật chứ không đoán: bảng `actions/runner-images` cho thấy `ubuntu-24.04` (= `ubuntu-latest`) có sẵn **Google Chrome 150**. Hai script nới danh sách dò đường dẫn sang `/usr/bin/google-chrome` và tự thêm `--no-sandbox --disable-dev-shm-usage` **khi thấy biến `CI`** — ở máy thật không bỏ sandbox, vì profile là thư mục tạm nhưng trang được nạp vẫn là mã thật.

Vẫn cố ý **không** gắn vào `npm run validate`: cổng đó phải chạy được ở máy không có Chrome và xong trong vài giây.

### 91 ảnh nhân vật — hoá ra đã nạp xong từ trước

Mục này trong `PLAN.md` ghi «91 ảnh, chưa có script gộp, phủ ảnh 142 → 226/1.040». Dry-run đối chiếu chéo cho thấy cả ba con số đều lỗi thời: file cứu về có **195** bản ghi, và **195/195 đã nằm trong dữ liệu với URL khớp từng ký tự**. Độ phủ thật hiện là **558/2.347 mục lớp phủ (23,8%)**. 0 mục thiếu `anh_nguon`, 0 thiếu `anh_giay_phep`, 0 ảnh nằm ngoài `upload.wikimedia.org` (CSP của trang chỉ cho host này).

⚠️ **Chưa kiểm được 558 URL ảnh còn sống hay không, và phép đo đầu tiên là phép đo hỏng.** Quét bằng 8 luồng song song → Wikimedia trả **429** cho 543/558. Đó là tự mình bị chặn tốc độ, không phải ảnh chết — báo cáo "543 ảnh chết" mà tin là sẽ dẫn tới đi sửa 543 mục lành. Lấy mẫu lại 30 URL tuần tự, nghỉ 400 ms: **24 sống · 6 vẫn 429 · 0 mục 404**. Muốn con số thật thì phải quét chậm (≥1 s/URL) với User-Agent có địa chỉ liên hệ theo đúng chính sách của Wikimedia.
