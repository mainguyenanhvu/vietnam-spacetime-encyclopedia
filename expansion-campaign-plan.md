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

## 📓 Nhật ký thực thi (state resumable — cập nhật mỗi sóng)

> Ngân hàng tên đã có: `existing_entities.txt` (scratchpad). **WebSearch cạn phiên 2026-07-20**
> → agent định tuyến discovery qua **skill `web-crawl` render `google.com/search`** (ổn định
> nhất, gần như không CAPTCHA), fallback DDG-lite. Tail-discovery sâu nên để **phiên mới**
> (WebSearch reset). Mọi mục mới = `draft`, chờ Iron Man kiểm sử (§9).

| Sóng | Commit | Lớp phủ mới | +Mục | DB names |
|---|---|---|---|---|
| Backfill URL | `cf64291` | (nâng 31 draft→reviewed) | — | 476 |
| 1 | `8cbf159` | anh-hung-llvt-cand · tuong-linh-hien-dai · tien-si-tieu-bieu · quan-thanh-liem · me-vnah-ahld · chien-dich-tran-danh-bo-sung | 91 | 567 |
| 2 | `86d46e8` | vua-hoang-de · vo-tuong-trung-dai · van-nghe-si-khoa-hoc | 44 | 611 |
| 3 | `ebbd812` | tran-danh-khoi-nghia-bo-sung-2 · chi-si-cach-mang · to-nghe-danh-than | 50 | 661 |
| 4 | `2b36a50` | khoa-bang-bo-sung · anh-hung-liet-si-bo-sung · vua-chua-bo-sung | 46 | 707 |
| 5 | `59386f5` | hoang-toc-tieu-bieu · thanh-hoang-vung-mien · nha-giao-hoc-gia | 50 | 757 |
| 6 | `6b924f6` | di-tich-cach-mang · nghe-nhan-di-san · danh-tuong-chong-phap | 48 | 805 |
| 7 | (this) | le-hoi-truyen-thong · lang-nghe-truyen-thong · danh-thang-di-san-thien-nhien | 64 | 869 |

**⛔ Điểm dừng phiên 2026-07-20 (sau Sóng 7):** mọi công cụ tìm kiếm (WebSearch cạn;
Google/Bing/DDG qua web-crawl đều CAPTCHA/429) → **discovery thực sự bị chặn** = «không
tìm thêm được» theo nghĩa công cụ. Backlog rẻ còn lại (nghề Huế/Hội An/Nga Sơn, thêm khoa
bảng, thêm trận đánh) chờ **phiên mới reset search**. Ưu tiên người: duyệt §9 + soát toạ độ.

**Việc cần người (Iron Man) khi có thời gian:**
- Duyệt §9 & nâng `draft`→`reviewed` (đặc biệt nội dung chiến tranh, chủ đề nhạy cảm).
- Soát toạ độ: nhiều mục sóng 2–4 ở cấp xã/huyện (`trung`/`thap`) — cần geocode chính xác đền/lăng/khu lưu niệm trước khi bỏ badge draft.
- Backlog rẻ: thêm vua Trần/chúa Trịnh còn lại (cùng trang đền Đông Triều/Lam Kinh đã xác minh).
- Quyết định: mô hình hiển thị **tên đường/phố**; ưu tiên **làm giàu bản đồ Xích Quỷ**?
