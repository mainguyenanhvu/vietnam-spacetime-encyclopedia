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
| G | Merge expansions → danh-nhan.json + search phim cho danh nhân mới | main | ☐ chờ agent Nam Bộ |

## Việc còn (sau agent Nam Bộ)
1. Gộp 137 danh nhân sẵn có + ~5 lô mở rộng → `danh-nhan.json` (đủ tiểu sử + nguồn, trang_thai draft).
2. Cập nhật UI hub đọc danh-nhan.json: hiện MỌI danh nhân/tỉnh (tiểu sử) + nhúng phim nếu có.
3. Search YouTube phim cho danh nhân mới (batched, kỹ thuật như track D).
4. Validator cho danh-nhan.json + commit.
5. ⚠️ Caveat từ agent: WebSearch hết quota giữa chừng → nhiều nguồn là tên cơ quan (không deep-link) + đối chiếu Wikipedia → GIỮ draft, cần người soát.

## Việc người dùng còn chờ (khác YouTube)
- «Dùng Claude Design sinh ảnh» — CHƯA bắt đầu.
- «Hỏi từng câu để kiểm thử tính năng + tiêu chuẩn» — CHƯA bắt đầu (interactive).

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
