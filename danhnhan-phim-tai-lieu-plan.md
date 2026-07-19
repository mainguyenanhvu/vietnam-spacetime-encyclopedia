# Kế hoạch: Danh nhân theo tỉnh → Phim tài liệu YouTube

**Ngày**: 2026-07-18 · **Trạng thái**: đang chạy

## Mục tiêu
Dựng danh sách danh nhân/anh hùng theo 34 tỉnh (hợp nhất 2025), tìm phim tài liệu YouTube chính thống cho mỗi người, nhúng vào site (hub quốc gia + cross-link thẻ tỉnh).

## Nguồn gốc & phát hiện
- Mỗi hồ sơ tỉnh **đã có sẵn** mảng `danh_nhan[]` → 137 danh nhân, phủ đủ 34 tỉnh.
- Tỉnh mỏng (<5): lai-chau(1), lao-cai(2), son-la(2), tuyen-quang(2), khanh-hoa(3), lam-dong(3), phu-tho(3), quang-ngai(3), quang-ninh(3), thai-nguyen(3), tp-hcm(3)…

## Quyết định người dùng (đã chốt)
- Chuẩn kênh nhạc: «bản hay nhất hiện có» (gắn nhãn không chính chủ).
- 32 bài quê hương: ĐÃ điền youtube_id + commit `0f35efb`.
- 19 bài playlist "Việt Nam trong tôi": khu nhạc yêu nước quốc gia mới (mặc định, gộp 4 bản "Một Vòng VN").
- Phim tài liệu: phạm vi = MỞ RỘNG (option 2) + tạo danh sách danh nhân theo tỉnh rồi tìm YouTube.

## Các track
| Track | Việc | Ai làm | Trạng thái |
|---|---|---|---|
| A | 32 youtube_id nhạc quê hương | main | ✅ commit 0f35efb |
| B | 19 bài nhạc yêu nước (playlist) → nhac-yeu-nuoc.json + UI | main | ✅ commit eaa93e3 + cde9e55 |
| C | Mở rộng danh nhân/tỉnh (có nguồn) | research agents ×5 (bg) | 🔄 4/5 xong (~101 mới); Nam Bộ đang chạy |
| D | YouTube doc search 137 danh nhân sẵn có | main (Chrome) | ✅ 121/137 có phim (oEmbed 200) |
| E | phim-tai-lieu.json + validator + UI hub «Việt Nam trong tôi» | main | ✅ commit eaa93e3 + cde9e55 |
| F | 12 phim đã verify (8 nv cổ + HCM/VNG/Mẹ VNAH/AH LLVTND) | main | ✅ gộp vào quoc_gia[] |
| G | Merge expansions → danh-nhan.json + search phim cho danh nhân mới | main | ✅ commit d101647 + d1340d6 (200/255 có phim) |
| H | #2 ảnh: tab Địa danh nhúng Google Maps (150 địa danh) | main | ✅ commit 04e6b55 |

## Việc còn (sau agent Nam Bộ)
1. Gộp 137 danh nhân sẵn có + ~5 lô mở rộng → `danh-nhan.json` (đủ tiểu sử + nguồn, trang_thai draft).
2. Cập nhật UI hub đọc danh-nhan.json: hiện MỌI danh nhân/tỉnh (tiểu sử) + nhúng phim nếu có.
3. Search YouTube phim cho danh nhân mới (batched, kỹ thuật như track D).
4. Validator cho danh-nhan.json + commit.
5. ⚠️ Caveat từ agent: WebSearch hết quota giữa chừng → nhiều nguồn là tên cơ quan (không deep-link) + đối chiếu Wikipedia → GIỮ draft, cần người soát.

## Việc người dùng còn chờ (khác YouTube)
- ✅ Kiểm thử 4 test — Iron Man xác nhận ĐẠT hết (2026-07-18).

## ĐỢT 2 — 6 hạng mục mới (Iron Man 2026-07-18)
| # | Việc | Ghi chú pháp lý/khả thi | Trạng thái |
|---|---|---|---|
| 1 | Ảnh thật địa danh/nhân vật | ⚠️ «công cộng» ≠ hết bản quyền; CHỈ Commons license tự do + nhúng Maps/YouTube; KHÔNG tải ảnh báo/web | ✅ Maps (04e6b55) + 29 ảnh Commons xác thực API (cf4c4ab); images.json 45→74 |
| 2 | 3D đẹp + động tự nhiên | Iron Man chọn: NHÚNG model Sketchfab CC + nâng cấp Three.js | ✅ 4 model CC (5333252) + hoạt cảnh thủ tục 8 bộ phận (a527495): trâu/voi thở-phe phẩy, chim vỗ cánh bay, phở bốc khói, trái cây đung đưa. Test headless 8/8 PASS |
| 3 | Mở rộng danh nhân 4000 năm + thêm phim; **phim state → reviewed** | | ✅ rule (4a49944) + 46 danh nhân mới (cf4c4ab); danh-nhan.json 255→301 (draft, cần soát nguồn) |
| 4 | Dòng thời gian 4000 năm (2879 TCN → nay) | 106 mốc có nguồn nhà nước | ✅ commit bbafc04 |
| 5 | Bản đồ: chọn bảng màu tô tỉnh + nhãn tên tỉnh/sông/núi | ⚠️ nhãn TỰ RENDER (không mở nhãn basemap → lòi địa danh TQ) | ✅ tô màu + nhãn TỈNH (d366d08) + nhãn SÔNG/NÚI 22+18 (cf4c4ab, song-nui.json, chủ quyền trên cùng qua beforeId) |
| 6 | Tính năng backlog còn lại | | ✅ Bảo vật QG overlay (36, dsvh.gov.vn) + Nam tiến animation (12 mốc, phủ 34 tỉnh) + Taberd 1838 georef (image source, opacity) + validate_overlays vào CI (e84af6e). ⚠️ toạ độ góc Taberd XẤP XỈ — tinh chỉnh trên production |

## Đã xong đợt 2 (2026-07-18, phiên song song)
- 3 agent nền: ảnh Commons (31→29 xác thực qua Commons API imageinfo, loại 2 file bịa), danh nhân (46), geodata sông/núi (40).
- Kiểm URL ảnh: CDN upload.wikimedia.org bị rate-limit 429 → xác thực qua **Commons API** (nguồn chuẩn, trả URL canonical + license thật).
- Verify: validate_documentaries + validate_media xanh; tsc + vite build xanh; **test hoạt cảnh Three.js headless 8/8 PASS** (bundle esbuild → so sánh transform theo t).
- ⚠️ Không kiểm được map trong sandbox: basemap CARTO bị chặn tải tiles → map.on('load') không chạy. Code song-nui đã xác minh qua tsc/build/validator + data load 200 JSON; render nhãn cần verify trên production (nơi user đã test đạt trước đó).

## Phiên 2026-07-19 — sửa hiển thị + backlog #6
- **Lỗi legend che topbar (e69a789)**: 5 module chèn nút vào #topbar-nav lúc chạy → topbar 2 hàng (83px) nhưng panel ghim top:3.5rem (56px) → đè. Sửa: top panel = var(--topbar-h)+0.5rem, đồng bộ bằng **MutationObserver** (ResizeObserver bị chặn khi tab nền) + resize; topbar z-index:30. Kiểm chứng browser: panel 91px, hết đè.
- **#6 (e84af6e)**: Bảo vật QG (overlay đợt 2, 36 mục) + Nam tiến (12 mốc, nt_step gắn runtime qua slugify, lộ dần bắc→nam) + Taberd 1838 (image source georef xấp xỉ + opacity slider, chèn dưới nhãn → chủ quyền trên cùng) + validate_overlays.mjs.
- ⚠️ Sandbox chặn WebGL → không render map trực tiếp được (styleLoaded=false ngay cả offline style). Kiểm chứng: enrich 34/34 tỉnh (browser thật), reveal đơn điệu 18→34 (node), tsc+build+8 validator+audit_sovereignty xanh. **Cần nghiệm thu production**: nhãn/pin/animation render + **tinh chỉnh 4 góc Taberd** (đối chiếu bờ biển). Toạ độ góc trong `TABERD_CORNERS` (main.ts) dễ sửa.
- 8 điểm toạ độ bảo vật độ tin cậy thấp (Lam Kinh, Hoa Lư, BT Hoàng gia Nam Hồng… — xem NOTES agent) cần soát; Nam tiến: phần cao nguyên (Gia Lai/Đắk Lắk/Lâm Đồng) gán mốc lowland sớm — có caveat UI.

## Còn lại sau phiên (đợt tiếp)
- Soát nguồn 46+ danh nhân draft (gắn URL cổng tỉnh/bảo tàng khi WebSearch có quota lại); soát 2 điểm tin cậy thấp (quê Vũ Văn Dũng, Dã Tượng).
- #6 backlog: Bảo vật quốc gia pins, Nam tiến animation, overlay đợt 2, Taberd georef (cần quyết định/dữ liệu — chưa "không bị chặn").
- Mở rộng danh nhân đợt lớn hơn (hiện 301) + ảnh Commons cho tỉnh còn thiếu (11 tỉnh agent A chưa tìm được).

## Quy tắc mới (đã chốt)
- Phim `kenh_loai=state` (VTV/QPVN/HTV/đài tỉnh/báo-thông tấn nhà nước) = KHÔNG cần người duyệt → `trang_thai=reviewed` (phim); tiểu sử vẫn có thể draft riêng.
- 3D: ưu tiên nhúng Sketchfab CC (license tự do), fallback Three.js thủ công + hoạt cảnh.
- Ảnh: chỉ Commons/PD/CC + nhúng; tuyệt đối không rehost ảnh có bản quyền.

## Ràng buộc (bắt buộc)
- Chỉ nhúng youtube-nocookie, video đã kiểm oEmbed=200.
- Danh nhân: đã mất & được tôn vinh rộng rãi; tránh nhân vật gây tranh cãi/đang sống nhạy cảm.
- Mỗi danh nhân ≥1 nguồn ngoài Wikipedia; quê map đúng slug 34 tỉnh (theo sáp nhập 2025).
- Phim hiện đại/chính trị: chỉ nhúng + chú thích trung tính + nguồn; trang_thai draft chờ người duyệt.
- Chủ quyền Hoàng Sa/Trường Sa: không đổi.

## Định nghĩa hoàn thành
- `danh-nhan.json` (danh sách đầy đủ theo tỉnh, có nguồn) + `phim-tai-lieu.json` (chỉ mục có phim thật, oEmbed 200).
- Validator mới `validate_documentaries.mjs` xanh trong CI.
- UI: hub "Danh nhân & Phim tài liệu" + cross-link trên panel tỉnh.
- tsc + vite build xanh; commit từng chunk.
