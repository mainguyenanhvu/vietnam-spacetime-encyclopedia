# Chiến dịch mở rộng theo TRỤC THỜI GIAN × LĨNH VỰC (2026-07-23)

## Bối cảnh
Trục "tỉnh mỏng" đã bão hoà. Chuyển sang lấp lỗ hổng **niên đại**. Khảo sát 1429 mục:

| Thời kỳ | Số mục | Trạng thái |
|---|---|---|
| 01 Hùng Vương/Văn Lang (…–200 TCN) | 3 | ⚠️ rất mỏng |
| 02 Trưng-Triệu (200 TCN–40) | 2 | ⚠️ rất mỏng |
| 03 Bắc thuộc II-III (40–544) | 7 | ⚠️ mỏng |
| 04 Vạn Xuân→Tự chủ (544–939) | 14 | mỏng |
| 05 Ngô-Đinh-Tiền Lê (939–1009) | 5 | ⚠️ mỏng |
| 12 Tây Sơn (1788–1802) | 13 | mỏng so tầm vóc |
| 14 Pháp thuộc | 347 | dày |
| 17 Sau 1975 | 268 | dày |

→ Trước 1009 chỉ **31 mục / ~2700 năm**. Đây là vỉa §9-an toàn (tiền hiện đại, có đền thờ, nguồn cổng tỉnh).

## Nguyên tắc (bất biến)
- Nguồn CHỈ cổng nhà nước: `.gov.vn`, Cục Di sản (dsvh.gov.vn), báo Đảng tỉnh, Nhân Dân/TTXVN/VOV/Báo Văn hóa. **Cấm Wikipedia/blog/hội tư nhân.**
- Mỗi mục mới `trang_thai: "draft"` chờ duyệt §9.
- Toạ độ: ưu tiên đền/di tích thờ; không rõ → `do_tin_cay_toa_do:"thap"` + `dia_diem` ghi xã/huyện/tỉnh để geocode sau.
- Dedup theo coreName trước khi ingest (đối chiếu danh sách tên đã có).

## Sóng 1 — 4 cell song song (research agents)
- **A. Nữ tướng & bộ tướng Hai Bà Trưng** (40–43) → nu-danh-nhan-lich-su + danh-nhan-quan-su-co-trung-dai
- **B. Anh hùng chống Bắc thuộc & tự chủ** (111 TCN–938) → danh-nhan-quan-su-co-trung-dai
- **C. Ngô–Đinh–Tiền Lê: vua/tướng/12 sứ quân** (939–1009) → vua-hoang-de + danh-nhan-quan-su-co-trung-dai
- **D. Danh tướng & văn thần Tây Sơn** (1771–1802) → danh-nhan-quan-su-co-trung-dai + su-than-ngoai-giao

## Sóng 2 (sau khi sóng 1 ingest xong)
- E. Thiền sư/cao tăng Lý-Trần chưa có → thien-su-cao-tang
- F. Sứ thần bang giao Lý-Trần-Lê chưa có → su-than-ngoai-giao
- G. Danh y – lương y cổ-trung đại chưa có → danh-y-luong-y

## Verify
- `node scripts/validate_overlays.mjs` xanh · `npm run build` · commit từng cell.
