# 🏯 Chiến dịch mở rộng vô hạn — danh nhân · sự kiện · bản đồ (chỉ đạo Iron Man 2026-07-20)

> Mệnh lệnh: **không dừng khi còn tìm được** nhân vật/sử liệu Việt Nam từ thời Xích Quỷ → nay.
> Chạy theo **sóng song song** (agent sonnet, mỗi agent 1 file mới → không đụng nhau).
> Người điều phối (main) gộp → đăng ký layer → validator → commit từng sóng → lặp.

## Nguyên tắc bất biến (bám §1 + §9 của `vietnam-encyclopedia-plan.md`)
1. 🇻🇳 Chủ quyền Hoàng Sa/Trường Sa mọi lớp (không đụng — chỉ thêm overlay điểm).
2. 📚 Mỗi mục có `nguon[]` ≥1 nguồn **NGOÀI Wikipedia**. Nguồn ưu tiên: cổng nhà nước
   (chinhphu.vn, qdnd.vn, cand.com.vn, nhandan.vn, dangcongsan.vn, dsvh.gov.vn,
   bảo tàng, cổng tỉnh `*.gov.vn`, Văn Miếu–Quốc Tử Giám, Ngô Đức Thọ — Các nhà khoa bảng VN).
   **TUYỆT ĐỐI KHÔNG dùng Wikipedia** kể cả làm nguồn phụ.
3. ✅ Đúng sự thật, tích cực, giáo dục, đúng pháp luật VN.
4. ⚖️ **Cổng §9**: nội dung nhạy cảm (chiến tranh, chủ đề tranh luận) → `trang_thai:"draft"`,
   chờ Iron Man kiểm sử. **Mặc định MỌI mục mới = `draft`.**

## Hợp đồng dữ liệu (agent PHẢI tuân — validate_overlays.mjs ép cứng)
File overlay: `{ "ghi_chu": "...", "ngay_cap_nhat": "2026-07-20", "sources": ["cổng A", "cổng B"], "items": [ ... ] }`

Mỗi item:
```json
{
  "id": "kebab-khong-dau-duy-nhat",
  "ten": "Tên đầy đủ (có dấu)",
  "lon": 105.85, "lat": 21.03,          // SỐ, trong bbox VN 102–118 / 7–24
  "loai": "nhom-phan-loai",              // để tô màu; tự đặt nhóm hợp lý
  "nam_hien_thi": "1911–1990 / thế kỷ 15 / …",
  "mo_ta": "2–3 câu: công trạng, vì sao được tôn vinh (theo chính sử).",
  "dia_diem": "Quê/đền/tượng đài — xã, huyện, tỉnh",
  "do_tin_cay_toa_do": "cao|trung|thap",  // 'cao' nếu toạ độ đúng tượng đài/đền; 'trung/thap' nếu chỉ tới huyện/tỉnh
  "trang_thai": "draft",
  "nguon": ["Cổng X — tiêu đề bài — https://... (URL đã fetch được, KHÔNG bịa)"]
}
```
Quy tắc toạ độ: lấy toạ độ **tượng đài / đền thờ / khu lưu niệm / quê** qua tra cứu; nếu chỉ biết tới cấp huyện/tỉnh → đặt toạ độ trung tâm huyện/tỉnh và `do_tin_cay_toa_do:"trung"` hoặc `"thap"`. Đừng để 2 item trùng toạ độ y hệt (lệch nhẹ nếu cùng địa điểm).

## Dedup (BẮT BUỘC trước khi thêm)
- Danh sách 476 tên đã có: `C:\Users\maing\AppData\Local\Temp\claude\D--projects-vietnam-encyclopedia\be2bfa13-5296-4a68-8dc0-454c2ab665c4\scratchpad\existing_entities.txt`
- So khớp sau khi bỏ dấu + thường hoá. Nếu người đã có → KHÔNG thêm lại.
- Nếu một nhân vật hợp phạm vi agent khác hơn → nhường, ghi chú trong báo cáo.

## Mẫu file để bắt chước cấu trúc
`public/data/overlays/thanh-hoang-danh-than.json` (nhỏ, đúng schema).

## Kiểm chứng (agent tự chạy trước khi báo cáo)
`node scripts/validate_overlays.mjs` → phải in `✅` (exit 0). Nếu đỏ, sửa file của mình tới khi xanh.

## Việc của main (mỗi sóng, KHÔNG phải việc agent)
1. Thêm tên file mới vào `STRICT_SOURCE` trong `scripts/validate_overlays.mjs`.
2. Đăng ký layer trong mảng `OVERLAYS` (`src/main.ts`, ~L1023): id/label/file/circleColor/nguon/popup.
3. Cross-file dedup theo tên; validator + `tsc && vite build`; commit + push sóng.
4. Trích xuất lại `existing_entities.txt`; mở sóng kế; lặp tới khi agent báo "cạn".

## Sóng 1 (đang chạy — 6 agent sonnet, mỗi agent 1 file mới)
| Agent | File mới | Phạm vi |
|---|---|---|
| A1 | `anh-hung-llvt-cand.json` | Anh hùng LLVT nhân dân + Anh hùng CAND (liệt sĩ tiêu biểu, tượng đài) |
| A2 | `tuong-linh-hien-dai.json` | Tướng lĩnh QĐND hiện đại (Đại tướng → Trung tướng tiêu biểu) |
| A3 | `tien-si-tieu-bieu.json` | Tiến sĩ/bác học tiêu biểu (Văn Miếu 82 bia, nhà sử/toán/y học) |
| A4 | `chien-dich-tran-danh-bo-sung.json` | Chiến dịch/trận đánh bổ sung toàn thời đại (DRAFT §9) |
| A5 | `quan-thanh-liem.json` | Quan thanh liêm & người có công các triều |
| A6 | `me-vnah-ahld.json` | Mẹ VN Anh hùng + Anh hùng Lao động tiêu biểu |

## Sóng kế (backlog, mở dần)
- Thành hoàng/danh thần theo vùng (mở rộng); tiến sĩ/trạng nguyên còn lại.
- Tên đường/tên phố (đặt theo danh nhân) — cần chốt cách thể hiện.
- Làm giàu «Cương vực Việt cổ» (georef bản đồ cổ) — track địa lý, khó, tách riêng.
- Nhân vật văn hoá/khoa học còn thiếu; anh hùng lao động các ngành.
