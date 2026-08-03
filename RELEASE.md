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
