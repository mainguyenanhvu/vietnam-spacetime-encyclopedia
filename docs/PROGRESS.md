# PROGRESS — mega-refresh + mở rộng vô hạn

Kế hoạch chiến dịch hiện hành: [`chien-dich-tong-luc-2026-07-26-plan.md`](../chien-dich-tong-luc-2026-07-26-plan.md)
Nhật ký từng sóng: [`expansion-campaign-plan.md`](../expansion-campaign-plan.md) · recipe hợp nhất: [`phase3-2b-parallel-plan.md`](../phase3-2b-parallel-plan.md)
Cập nhật 2026-07-26 sau chiến dịch tổng lực (11 agent song song).

## Trạng thái phase
| Phase | Nội dung | Trạng thái | Verify |
|---|---|---|---|
| 0 | Guardrail validator xuyên-file | ✅ xong | 10 cổng xanh (thêm `validate_no_html`) |
| 1 | UI: z-index + icon lớp phủ | ✅ xong | Lớp sông núi đã hiển thị, kiểm bằng Chrome CDP |
| 2a | Gom 1 selector thời kỳ | ✅ xong | tsc+vite+validator xanh |
| 2b | Đường biên chính xác có nguồn | 🟡 có tiến triển | Xem mục «Ranh giới» dưới |
| 3 | Dedup & hợp nhất lớp | 🟡 gần xong | Đã bỏ lớp vùng miền. Còn: tách per-item `danh-nhan-cac-trieu`, `nhom[]` cho 9 người đa danh mục |
| 4 | Ảnh nhân vật | 🟡 một phần | 91 ảnh mới ĐÃ SOẠN, **chưa gộp** (xem Việc dở dang) |
| 5 | Mở rộng vô hạn | 🔄 sóng 1→11 | Sóng 11: +28 folklore, +56 địa danh, +38 văn học |

## Snapshot 2026-07-26 (đã commit + push tới `64aedd4`)
- **2.005 mục / 33 lớp** overlay · 442 draft chờ cổng §9.
- Thư viện văn học: 20 thơ HCM · 18 thơ yêu nước · 16 giai thoại khoa bảng · 10 thơ về Bác.
- Vỉa **đã đóng sổ**: 36/36 vườn quốc gia · 11/11 khu DTSQ · 17/17 di sản phi vật thể UNESCO · `di-tich-quoc-gia.json` (thử 17 mẫu, 17/17 đã có — không còn là mỏ mới).

## Việc dở dang — nhặt lên là chạy tiếp được
1. **91 ảnh nhân vật** ở `scratchpad/song11_anh_nhan_vat.json` (+ 8 mục ngờ vực riêng). Phủ ảnh 142 → 226/1.040. Dùng schema `anh`/`anh_nguon`/`anh_giay_phep`/`anh_muc` + `nhan_vat_id`. Chưa có script gộp.
2. **`scratchpad/image-generation-spec.md`** — 16 ảnh cần sinh (8 bối cảnh/huyền sử, 6 icon lớp, 2 phục dựng trang phục). Đã tự rà: không dòng nào sinh chân dung người có thật.
3. **5 mục HOÃN** ở `scratchpad/song11_dia_danh_tinh.json`: 2 chợ phiên, 1 phố cổ, 2 công trình tiêu biểu — chờ quyết định có mở lớp «chợ truyền thống» không (cộng 12 mục chợ treo từ sóng 10).
4. **6 diff chưa áp** trong scratchpad, tên tự giải thích. Quan trọng nhất: `DIFF-1-cat-3.6MB-json-luc-khoi-dong.md` — `map.on("load")` đang nạp 4,70 MB JSON khi chỉ cần 1,17 MB (−75%, ≈ −700 kB gzip). Kèm bẫy `landmarks3d.ts:281` (`beforeId` trỏ `era-phapthuoc-fill` sẽ thành `undefined` khi era nạp lười → lớp biển che hết đất liền).
5. **`scripts/smoke.mjs`** — 9 kịch bản qua Chrome CDP, 0 dependency. Hiện đỏ 4/9, đều nằm ngoài phạm vi đã sửa. **Đừng bật gác cổng CI trước khi áp DIFF-1 + DIFF-6.** Kịch bản `S2b-1` kỳ vọng đỏ vĩnh viễn — nó là thí nghiệm đối chứng hành vi Chrome, phải đánh dấu BỎ QUA.

## Ranh giới lịch sử — phán quyết nguồn (2026-07-26)
- **ĐỦ**: 1490 + 1838 (đã georef) · **Pháp–Thanh 1887/1895 = ưu tiên 1** · 1999/2009 (tin cậy cao nhất nhưng trùng lớp 34/63 tỉnh).
- **ĐỦ MỘT PHẦN** (chỉ vẽ điểm/sự kiện, KHÔNG vẽ đường biên): Bắc thuộc · Lý 1075–84 · Hồ 1405 · Mạc 1540 · Tụ Long 1725–28.
- **KHÔNG ĐỦ**: Xích Quỷ · Văn Lang · Âu Lạc · **Nam Việt (Triệu)** · Trần.
- 🔴 **Lý 1075–76 đánh Ung–Khâm–Liêm rồi RÚT, không sáp nhập.** Chỉ được là marker sự kiện quân sự. Vẽ thành lãnh thổ là sai sử liệu.
- Ví dụ «vươn lên phía bắc» đúng nghĩa là **Tụ Long** (Vị Xuyên ↔ phủ Khai Hoá, Vân Nam), có văn bia mốc sông Đổ Chú 1728. Thiếu toạ độ nên chưa đặt điểm được.
- Nội dung đường biên nằm ở **Điều 3** công ước 1887, không phải Điều 2. Kinh tuyến chạy qua **mũi đông đảo Trà Cổ**; **105°43' Paris = 108°03' Greenwich**.
- ⚠️ Kinh tuyến 105°43' — ghi ở dạng **«không render như ranh giới biển khi chưa có xác nhận của Uỷ ban Biên giới quốc gia»**, KHÔNG ghi như khẳng định lịch sử. Vịnh Bắc Bộ phân định bằng Hiệp định 2000.
- ⛔ Cấm dùng con số «750 km² / 3/4 châu Tụ Long» — chỉ có ở mirror Wikipedia và blog.
- Hai PDF đã tải về scratchpad nhưng **đều là bản quét, không có lớp chữ**: `DeClercq_Tome17_1886-1887.pdf` (659 trang, CCITTFax) và `BienGioi_VN-TQ_UBBGQG.pdf` (48 trang, JPEG — ảnh JPEG thì rút ra đọc bằng mắt được, chưa làm).

## Vỉa đã đóng — có bằng chứng, ĐỪNG cử agent vào lại
- **Ảnh từ cổng thông tin nhà nước và báo chí Việt Nam**: không khai thác được dưới chuẩn giấy phép hiện tại. Đây là rào cản HỆ THỐNG, không phải tìm chưa kỹ — khác Commons (mỗi file một giấy phép), web chính quyền và báo chí VN gần như đồng loạt tuyên bố «All Rights Reserved» toàn trang. Đã kiểm: cổng tỉnh Lạng Sơn (đền Chu Văn An) ghi rõ bản quyền toàn trang · VietnamPlus/TTXVN «cấm sao chép dưới mọi hình thức nếu không có chấp thuận bằng văn bản» · báo Lâm Đồng link 404. Muốn dùng nguồn này phải chuyển sang **xin phép trực tiếp từng Sở / toà soạn** — việc khác hẳn, không phải việc của agent tìm ảnh.
- **82 bia tiến sĩ Văn Miếu trên Commons**: category «Steles in Vietnam» chủ yếu là bia Chăm Mỹ Sơn và bia chùa lẻ, KHÔNG phải bia theo khoa thi. Cần catalogue đã xuất bản.
- **Bảo tàng Lịch sử quốc gia / Mỹ thuật Việt Nam trên Commons**: 0 khớp, chưa số hoá hiện vật gắn tên nhân vật.
- **Tra ảnh theo trường `dia_diem`**: sai ~75%. Địa điểm ngắn/chung chung khớp rời rạc từng từ — «Phủ Trịnh» ăn nhầm sang phường «Phú Trinh» Phan Thiết. Chỉ dùng khi tên đủ dài và riêng.
- **`di-tich-quoc-gia.json` làm nguồn folklore**: thử 17 đền/hang, 17/17 đã có sẵn trong DB.
- ⚠️ Ghi nhận rời: cổng Sở VHTTDL Phú Thọ trả **lỗi chứng chỉ SSL, domain trỏ sang site lạ**. Không cố vượt qua. Có thể là cấu hình sai hoặc dấu hiệu rủi ro — chỉ ghi lại.

## Bài học về CỔNG KIỂM TRA — ba lần nói sai trong một đợt
Một cổng xanh mà chưa tự kiểm chứng thì không đáng tin hơn việc không có cổng. Mỗi cổng phải chứng minh bằng một ca **dương tính biết trước**.
1. **S7 xanh giả** — đo byte GeoJSON lúc khởi động, báo 0,07 MB. Thực tế MapLibre nạp GeoJSON trong **web worker**, miền `Network` của CDP gắn vào page target không thấy. Đã đổi tên kịch bản thành đúng điều nó chứng minh được và ghi giới hạn trong mã.
2. **S1 mù** — lọc chuỗi `/font/` để bắt 404 glyph, nhưng sau khi tự host đường dẫn thành `/fonts/`. Cổng mất tác dụng đúng lúc cần nhất. Đã đổi thành `/fonts?/`.
3. **S2 đỏ giả** — phân biệt nhả-tự-nguyện bằng cờ `__tuNguyen` mà không gì trong ứng dụng gán cờ đó; three.js gọi `loseContext()` ngầm qua extension. Mọi lần nhả ĐÚNG CÁCH bị đếm thành rò. Đã bọc `getExtension`. Sau khi sửa: 20 tạo / 20 tự nguyện nhả / **0 bị thu hồi** — bản vá vốn đã đúng từ đầu.

## Quyết định đã chốt
- **Không Wikipedia** làm nguồn thông tin, kể cả nguồn phụ. Commons chỉ làm kho **ảnh**.
- **Không sinh ảnh chân dung người có thật.** Sinh ảnh chỉ cho bối cảnh, huyền sử, icon, phục dựng — luôn gắn nhãn «hình dung nghệ thuật».
- **Agent không ghi vào repo** ở các sóng dữ liệu; main hợp nhất sau dry-run đối chiếu chéo. Ngoại lệ có kiểm soát: agent thi công code được cấp vùng file riêng, không chồng lấn.
- **Dò trùng phải so CỤM DANH TỪ RIÊNG**, không chỉ so tên mục. «Sự tích núi Tô Thị» = «Nàng Tô Thị».
- Bỏ lớp chia theo **vùng miền**; chỉ chia theo **lĩnh vực**.
- `xep_hang` bắt buộc: cấp + số QĐ + ngày, trích từ nguồn đã fetch; không tra được thì ghi «chưa xác minh được».
- Cụm `di-tich-qgdb` / `bao-vat-quoc-gia` / `unesco` giữ riêng, popup khác nhau.

## Bẫy kỹ thuật đã gặp — đừng vấp lại
- **PowerShell 5.1 `Set-Content -Encoding UTF8` LUÔN ghi BOM** → `JSON.parse` chết. Ghi JSON bằng Node.
- **`node -e` với chữ tiếng Việt mất output** trong môi trường này. Viết file `.mjs` rồi chạy.
- **Fontstack**: endpoint glyph `demotiles.maplibre.org` chỉ phục vụ `Open Sans Semibold` và `Noto Sans Regular`. Dùng stack khác → 404 → MapLibre gom mọi fontstack của CÙNG source vào một `Promise.all`, một reject làm hỏng **toàn bộ lớp**, kể cả lớp line không cần font.
- **`renderer.dispose()` KHÔNG trả WebGL context về trình duyệt** — phải gọi thêm `forceContextLoss()`. Nhưng đừng gọi trong `landmarks3d.ts` (dùng chung canvas với MapLibre).
- **Xoá/đổi tên file dữ liệu thì phải quét tham chiếu TOÀN REPO**, không chỉ `src/` — `scripts/commons_photos.mjs` từng giữ tham chiếu mồ côi.
- Schema **thư viện** dùng `sources` ở từng mục; schema **overlay** dùng `nguon`. Đừng nhầm.

## Blocker / chờ chủ dự án
- 🤔 Mở PDF `DeClercq_Tome17` hoặc `BienGioi_VN-TQ_UBBGQG` bằng mắt, cho số trang phần Công ước 26/6/1887 (Điều 3).
- 🤔 Mua **Đào Duy Anh, «Đất nước Việt Nam qua các đời»** — không có nó thì Bắc thuộc/Lý/Hồ/Mạc mãi ở mức «đủ một phần».
- 🤔 **Site deploy ở đâu?** `public/_headers` chỉ có tác dụng trên Cloudflare Pages; GitHub Pages không cho đặt header → CSP vô hiệu.
- 🤔 **Nâng Vite 6.4.3?** 5.4.21 dính GHSA-fx2h-pf6j-xcff (CVSS 7.5) + rò hash NTLMv2, cả hai đặc thù Windows, chỉ ảnh hưởng khi chạy dev server (`npm audit --omit=dev` = 0).
- 🤔 Email cá nhân trong User-Agent: `scripts/regeocode.mjs:17`, `scripts/commons_photos.mjs:17`. Repo công khai.
- 🤔 Mở lớp «chợ truyền thống» không (17 mục đang treo)?
- 📌 **442 draft** chờ cổng §9 — nên xen một lô duyệt giữa các sóng.
- 📌 Chất lượng toạ độ: **34% DB nằm trong cụm dưới 500 m** (208 cụm/656 mục). Chỉ 13 mục là placeholder sửa được bằng máy; phần lớn cần **clustering/jitter khi render**, KHÔNG được bịa toạ độ chính xác hơn nguồn. Chi tiết: `scratchpad/toa-do-audit.md`.

## Cổng nghiệm thu
```
node scripts/validate_overlays.mjs      node scripts/validate_no_html.mjs
node scripts/audit_sovereignty.mjs      npx tsc --noEmit
npm run build
```
Đụng vùng nào chạy thêm validator vùng đó (10 script trong `scripts/`).
