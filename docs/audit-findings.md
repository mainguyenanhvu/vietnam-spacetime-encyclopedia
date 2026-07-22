# Kiểm toán độ chính xác lớp phủ (2026-07-22)

Nguồn: 6 agent sonnet song song, mỗi agent 1 cụm (read-only). Chỉ đạo Iron Man: "kiểm tra toàn bộ thông tin cho chính xác". Tổng ~1050+ mục / 62 file đã soát.

**Kết luận lớn:** kỷ luật nguồn (KHÔNG Wikipedia cho nội dung) **rất tốt** — 0 vi phạm nội dung toàn bộ. Vấn đề chủ yếu là: vài lỗi ngày/can-chi, một số `loai` lệch với mô tả, và **trùng lặp người↔sự kiện** (nhất là cụm khởi nghĩa Bắc thuộc).

---

## ✅ ĐÃ SỬA (commit này)
- `me-vnah-ahld.json` trộn Mẹ VNAH + AHLĐ → tách `me-vnah.json` (đã xong, commit trước).
- **[FACTUAL]** `anh-hung-liet-si-bo-sung.json` / dang-dinh-ho: Điện Biên Phủ "30/4/1954" → **7/5/1954**.
- **[FACTUAL]** `khoa-bang-thanh-hoa.json` / khuong-cong-phuc: "Canh Tý (780)" → **Canh Thân (780)** (780 = Canh Thân; khớp anh trai Khương Công Phụ ở file khác).

## 🔴 FACTUAL — cần xác minh nguồn rồi sửa (KHÔNG đoán)
- `khoa-bang-thanh-hoa.json` / le-nhan-kiet: "khoa Tân Sửu (1651)" — Tân Sửu = **1661** (1651 = Tân Mão). Chưa rõ năm hay can-chi sai → tra nguồn.
- `thieu-nien-anh-hung.json` / duong-van-manh: "1930–1944" vs "hy sinh tuổi 16" (lệch). / tran-hoang-na: "1949–1962" vs "tuổi 15" (lệch). → tra nguồn năm sinh/mất.
- `chien-dich-tran-danh-bo-sung.json` / bien-gioi-tay-nam-1978-1979: 3 mốc năm mâu thuẫn trong 1 mục (1978 / 1977–1979 / 1975–1978) → chốt 1 khoảng.
- Recency-check (năm mất = 2026, xác nhận nguồn): `kien-truc-su-ky-su`/nguyen-an-nien; `danh-nhan-mien-nui-phia-bac`/trieu-kim-van.

## 🟡 MISCATEGORIZED — `loai`/file lệch với chính mô tả (sửa an toàn, low-risk)
- `anh-hung-can-hien-dai.json` / tran-van-on: `ah-llvt` nhưng là **liệt sĩ** học sinh (không phải AHLLVTND) → đổi loai liệt sĩ.
- `hoang-toc-tieu-bieu.json` / nguyen-phuc-tan: `vua-hoang-de` nhưng là **chúa Nguyễn** → `chua-nguyen`.
- `chua-nguyen-trinh.json` / nguyen-huu-dat, hoang-ngu-phuc: `danh-than` nhưng mô tả ghi "**Danh tướng**" → đổi loai võ quan.
- `tien-si-tieu-bieu.json` / phan-huy-chu (chỉ Tú tài), nguyen-thiep (không thi Hội): không phải Tiến sĩ → chuyển sang `nha-giao-hoc-gia`.
- `khoa-bang-danh-nhan.json` / nguyen-trai: `danh-nhan-van-hoa` — nới scope (minor).
- `van-nghe-si-khoa-hoc.json` (catch-all): 4 hoạ sĩ (Tô Ngọc Vân, Nguyễn Sáng, Bùi Xuân Phái, Nguyễn Phan Chánh) → `hoa-si-dieu-khac`; 3 nhạc sĩ (Đỗ Nhuận, Nguyễn Văn Tý, Phan Huỳnh Điểu) → `nghe-si-san-khau-dien-anh`. (Đang xé lẻ "bộ tứ Nghiêm–Liên–Sáng–Phái".)
- `hoa-si-dieu-khac.json`: 3 kiến trúc sư (Nguyễn Cao Luyện, Huỳnh Tấn Phát, Ngô Viết Thụ) → `kien-truc-su-ky-su`.
- `danh-y-luong-y.json` / to-nghe-dai-yen-ngoc-hoa (Ngọc Hoa công chúa): tổ nghề, không phải danh y → `to-nghe-danh-than`. / Văn Cao (danh-nhan-van-hoa) chủ yếu là nhạc sĩ (borderline).

## 🟠 TAXONOMY — cần field `nhom` (để Phase 3, 1 người nhiều vai)
- `danh-tuong-khang-chien.json` / **quang-trung** (Hoàng đế Quang Trung) + **le-loi** (Lê Thái Tổ): đang ở file "danh tướng", KHÔNG xuất hiện ở lớp "vua/hoàng đế" → người xem lớp hoàng đế không thấy. Cần nhom vừa tướng vừa vua.
- `vua-chua-bo-sung.json`: Trịnh Kiểm/Tùng/Cương (chúa) dùng chung tag `vua-chua` với vua thật → chuẩn hoá.

## 🔵 DUP — trùng người↔sự kiện (dedup, gắn cross-ref thay vì kể 2 lần)
- **Nặng nhất:** `khoi-nghia-bac-thuoc.json` — 4/8 mục trùng bản sự kiện đầy đủ ở file khác: Hai Bà Trưng (↔khoi-nghia-khang-chien), Lý Bí/Lý Nam Đế, Phùng Hưng/Bố Cái, Triệu Quang Phục/Triệu Việt Vương (↔tran-danh-khoi-nghia-bo-sung-2).
- thai-phien (`chi-si-cach-mang`) ↔ duy-tan-1916 (`tran-danh-khoi-nghia-bo-sung-2`).
- **Cần tra sử:** Không Lộ (`thien-su-cao-tang`) vs Nguyễn Minh Không (`to-nghe-danh-than`) — dân gian hay nhập 1 («Không Lộ – Minh Không»); xác nhận DB cố ý tách 2 người thật.
- ~8 di tích trùng giữa `di-tich-qgdb.json` ↔ `unesco.json` (Hạ Long, Phong Nha ~lệch 18km, Huế, Hội An, Mỹ Sơn, Hoàng thành TL, Thành nhà Hồ, Tràng An) → cross-ref + reconcile toạ độ.
- Nữ TNXP Ngã ba Đồng Lộc (nhóm) ↔ Võ Thị Tần (cá nhân) trùng marker.
- Cross-ref pattern chuẩn: ngo-quyen trong khoi-nghia-bac-thuoc đã trỏ `bach-dang-938.json` — nên nhân rộng.

## ⚪ SOURCE / POLICY
- **`di-tich-qgdb.json`**: header ghi toạ độ lấy từ **Wikipedia/Wikidata** (chỉ toạ độ, không phải nội dung) — lệch luật "KHÔNG Wikipedia" + memory [[feedback-wikipedia-khong-dang-tin]]. → tái tính toạ độ từ Nominatim/dsvh.gov.vn.
- `di-tich-qgdb.json` (152), `unesco.json` (13), `bao-vat-quoc-gia.json` (36 — không trang_thai): thiếu `id` → sinh id để dedup/link được.
- Nguồn mỏng (1 citation/mục) nhiều file — không vi phạm nhưng nên đa dạng: nha-giao-hoc-gia (nhandan.vn), thieu-nien-anh-hung (1 series bảo tàng), một số trang-nguyen dùng site gia phả.

## 📉 THIN — lớp quá ít mục (Iron Man: "số lượng còn quá ít") → mục tiêu Phase 5
- Nhỏ nhất: khoa-bang-nam-trung-bo (6, 100% draft), nghia-si-can-vuong (9), me-vnah (5 sau tách), thanh-hoang-danh-than (6), nha-the-thao-lich-su (8 — thiếu VĐV huy chương Olympic), danh-y-luong-y (8 — **thiếu Tuệ Tĩnh & Hải Thượng Lãn Ông** dạng mục riêng), dich-gia-ngon-ngu-hoc (9).
- Đây là mục tiêu chính của sóng mở rộng (Phase 5): mỗi lớp nâng lên dày dặn hơn.

---
_Trạng thái: 6/6 agent xong (2026-07-22). ~1050 mục soát. 0 vi phạm nguồn nội dung. 2 lỗi factual đã sửa; còn lại là danh sách việc cho pass sửa hệ thống + Phase 3 (gom/nhom) + Phase 5 (mở rộng)._
