# Kế hoạch: Bản đồ huyền sử – danh nhân – văn hoá Việt Nam (xuyên thời đại)

> Yêu cầu (2026-07-19, Iron Man): dựng bộ dữ liệu **từ thời Xích Quỷ / Lộc Tục / Lạc Long Quân** trải suốt lịch sử — danh nhân, anh hùng, tướng, trạng nguyên, tiến sĩ; thần thoại, giai thoại, truyền kỳ; vè, ca dao, thành ngữ, tục ngữ; thay đổi trang phục/phong tục/tập tục; thần linh, thành hoàng; đội quân (hải đội Hoàng Sa, Trường Sa); thầy cô giáo, quan thanh liêm; người có công được nhân dân thờ phụng; **Tứ bất tử**; các cuộc khởi nghĩa, kháng chiến — **gán lên bản đồ Việt Nam**, mọi mục **xác minh nguồn chính thống**.

## Nguyên tắc bất biến (áp cho MỌI mục)
- **Nguồn chính thống, ≥1 nguồn NGOÀI Wikipedia** mỗi mục. Với huyền sử/truyền kỳ, "chính thống" = chính sử + kinh điển: **Đại Việt Sử Ký Toàn Thư (ĐVSKTT)**, **Lĩnh Nam Chích Quái**, **Việt Điện U Linh**, **Đại Nam Nhất Thống Chí**, + cổng di sản nhà nước (Cục Di sản Văn hoá `dsvh.gov.vn`, cổng bảo tàng/tỉnh, hồ sơ xếp hạng di tích).
- **Chủ quyền**: nhãn Hoàng Sa/Trường Sa luôn tiếng Việt; hải đội Hoàng Sa là mục chủ quyền trọng điểm (Luật Đo đạc & bản đồ 2018).
- **Gán bản đồ**: mỗi nhân vật huyền sử/lịch sử neo vào **nơi thờ phụng / di tích gốc** (đền, lăng, phủ) có toạ độ xác minh (bài học v1.9: validate_overlays bbox KHÔNG bắt sai-tỉnh → phải soát toạ độ thực).
- **trang_thai**: `reviewed` chỉ khi nguồn đã đối chiếu; còn lại `draft`.
- Toạ độ trong bbox 102–118 / 7–24; id duy nhất; nhãn "không phải chân dung xác thực" nếu render hình dung.

## Cơ chế kỹ thuật (đã có sẵn)
- Overlay điểm: thêm `public/data/overlays/<slug>.json` `{ghi_chu, sources, items:[{id,ten,lon,lat,nguon[],...}]}` + 1 `OverlayConf` trong `src/main.ts` (`OVERLAYS[]`). UI toggle tự sinh.
- `validate_overlays.mjs`: bbox + id trùng + nguồn. **Thêm file mới vào `STRICT_SOURCE`** để ép ≥1 nguồn ngoài wiki mỗi mục.
- Danh nhân theo tỉnh: `public/data/figures/danh-nhan.json` (301 mục). Nhân vật 3D: `figures-3d.json` (validate_figures — nhãn hình dung bắt buộc).

## Phân kỳ (mỗi đợt = 1+ overlay, nguồn xác minh, validator xanh, commit riêng)

### ✅ Đợt 1 — Huyền sử khai quốc + Tứ bất tử + Hải đội Hoàng Sa  ← LÀM TRONG PHIÊN NÀY
Overlay mới `huyen-su-khai-quoc.json`. ~10 mục, neo vào nơi thờ:
1. Kinh Dương Vương (Lộc Tục) — Lăng & đền Kinh Dương Vương, Á Lữ, Thuận Thành, Bắc Ninh. (Xích Quỷ = quốc hiệu, ghi chú rõ.)
2. Lạc Long Quân — Đền Nội Bình Đà, Thanh Oai, Hà Nội.
3. Âu Cơ — Đền Mẫu Âu Cơ, Hiền Lương, Hạ Hoà, Phú Thọ.
4. Hùng Vương — Khu di tích Đền Hùng, Việt Trì, Phú Thọ (DTQG đặc biệt).
5. An Dương Vương (Thục Phán) — Cổ Loa, Đông Anh, Hà Nội (bắc cầu huyền sử→sử; Âu Lạc).
6. Tản Viên Sơn Thánh (Sơn Tinh) — Đền Và, Sơn Tây, Hà Nội. [Tứ bất tử]
7. Phù Đổng Thiên Vương (Thánh Gióng) — Đền Phù Đổng, Gia Lâm, Hà Nội (DTQG đặc biệt). [Tứ bất tử]
8. Chử Đồng Tử — Đền Đa Hoà, Khoái Châu, Hưng Yên. [Tứ bất tử]
9. Mẫu Liễu Hạnh — Quần thể Phủ Dày, Vụ Bản, Nam Định. [Tứ bất tử]
10. Hải đội Hoàng Sa (kiêm quản Bắc Hải/Trường Sa) — Âm Linh Tự & Nhà trưng bày Hải đội Hoàng Sa, đảo Lý Sơn, Quảng Ngãi. Lễ Khao lề thế lính Hoàng Sa (DSVH phi vật thể QG). **[chủ quyền]**

### ⏳ Đợt 2 — Anh hùng dựng/giữ nước & khởi nghĩa chống Bắc thuộc
Hai Bà Trưng (Mê Linh), Bà Triệu (Hậu Lộc, Thanh Hoá), Lý Nam Đế (Vạn Xuân), Triệu Quang Phục, Mai Thúc Loan, Phùng Hưng, Ngô Quyền (Bạch Đằng 938) → overlay `khoi-nghia-bac-thuoc.json`.

### ⏳ Đợt 3 — Trạng nguyên/tiến sĩ + thầy giáo + quan thanh liêm
Chu Văn An, Mạc Đĩnh Chi, Nguyễn Trãi, Nguyễn Bỉnh Khiêm, Lê Quý Đôn, Nguyễn Khuyến; Văn Miếu – 82 bia tiến sĩ (Ký ức Thế giới UNESCO). Quan thanh liêm: Tô Hiến Thành, Nguyễn Công Trứ…

### ⏳ Đợt 4 — Thần linh, thành hoàng, phong tục/trang phục, folklore vùng
Thành hoàng tiêu biểu; tín ngưỡng thờ Mẫu (DSVH nhân loại UNESCO); đổi thay trang phục (áo giao lĩnh→áo tứ thân→áo dài); ca dao/tục ngữ gắn địa danh.

### ⏳ Đợt 5 — Khởi nghĩa & kháng chiến lớn (lớp sự kiện)
Lam Sơn, Tây Sơn, kháng Nguyên-Mông, kháng Pháp/Mỹ — tái dùng `battles/` + `journey/` hoặc overlay sự kiện.

## Tiêu chí "done" mỗi đợt
1. File JSON + OverlayConf (nếu overlay mới) + STRICT_SOURCE.
2. Mỗi mục: ≥1 nguồn ngoài wiki + toạ độ nơi thờ đã soát.
3. `node scripts/validate_overlays.mjs` (+ toàn bộ 9 validator) xanh; `npm run build` xanh.
4. Commit + push; cập nhật plan + memory.

## Còn lại / gated
- Toạ độ cần soát thực (không tin bbox). Nếu WebSearch hết quota → dùng WebFetch cổng nhà nước + OSM Nominatim, đánh dấu độ tin cậy.
- Nghiệm thu render trên production (WebGL bị chặn trong sandbox) — Iron Man kiểm ở cuối.
