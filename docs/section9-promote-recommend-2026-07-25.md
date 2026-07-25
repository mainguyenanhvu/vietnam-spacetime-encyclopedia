# §9 — Khuyến nghị nâng draft→reviewed (2026-07-25)

> Sau đèn xanh "làm tất cả" của Iron Man, tôi đã **đọc nội dung + đếm nguồn** từng draft
> của các lớp phi-SENS. Nhưng thao tác đổi `trang_thai` bị **classifier auto-mode chặn**
> (đúng: đây là ký duyệt nội dung nhạy cảm). Bảng dưới để Iron Man duyệt lô rồi tôi chạy.
>
> Tổng draft hiện tại: **152**. Đề xuất chia 3 nhóm.

---

## 🟢 NHÓM A — nên nâng ngay (14 mục, đã soát nội dung + có nguồn, phi-chính-trị)

| File | id | Tên | Lý do an toàn |
|---|---|---|---|
| thien-su-cao-tang | `thich-tri-tinh` | HT Thích Trí Tịnh | Tăng sĩ, phi chính trị |
| vua-hoang-de | `duy-tan` | Vua Duy Tân | Hoàng đế lịch sử |
| vua-hoang-de | `thanh-thai` | Vua Thành Thái | Hoàng đế lịch sử |
| di-tich-quoc-gia | `cau-long-bien` | Cầu Long Biên | Công trình Pháp cổ |
| di-tich-quoc-gia | `nha-hat-lon-ha-noi` | Nhà hát Lớn HN | Kiến trúc Pháp cổ |
| nha-the-thao-lich-su | `le-van-tiet` | Lê Văn Tiết | VĐV bóng bàn |
| nha-the-thao-lich-su | `nguyen-van-thuyet` | Nguyễn Văn Thuyết | VĐV điền kinh |
| tri-thuc-khoa-hoc-tk20 | `dang-thai-mai` | Đặng Thai Mai | Học giả văn hoá |
| tri-thuc-khoa-hoc-tk20 | `cao-xuan-huy` | Cao Xuân Huy | Nhà nghiên cứu triết học |
| tri-thuc-khoa-hoc-tk20 | `dang-van-ngu` | Đặng Văn Ngữ | BS ký sinh trùng |
| tri-thuc-khoa-hoc-tk20 | `nguyen-truc-luyen` | Nguyễn Trực Luyện | Kiến trúc sư |
| danh-nhan-van-hoa-can-hien-dai | `nguyen-sang` | Nguyễn Sáng | Hoạ sĩ |
| danh-nhan-van-hoa-can-hien-dai | `tran-huu-tuoc` | Trần Hữu Tước | BS Tai-Mũi-Họng |
| danh-nhan-van-hoa-can-hien-dai | `duong-bich-lien` | Dương Bích Liên | Hoạ sĩ |

## 🟡 NHÓM B — BIÊN GIỚI, chờ Iron Man cân (13 mục — có yếu tố chính trị/quân sự/liệt sĩ)

| File | id | Tên | Vì sao treo |
|---|---|---|---|
| di-tich-quoc-gia | `den-tho-bac-ho-luong-tam` | Đền thờ Bác Hồ | Thờ Hồ Chí Minh |
| nha-the-thao-lich-su | `bui-luong` | Bùi Lương | Có trong section9-sensitive.json (T1) |
| tri-thuc-khoa-hoc-tk20 | `nguyen-dinh-tu` | Nguyễn Đình Tứ | Nguyên Uỷ viên Bộ Chính trị |
| tri-thuc-khoa-hoc-tk20 | `vu-dinh-cu` | Vũ Đình Cự | Nguyên Phó CT Quốc hội |
| tri-thuc-khoa-hoc-tk20 | `pham-song` | Phạm Song | Nguyên Bộ trưởng Y tế |
| tri-thuc-khoa-hoc-tk20 | `nguyen-trong-nhan` | Nguyễn Trọng Nhân | Nguyên Bộ trưởng Y tế |
| tri-thuc-khoa-hoc-tk20 | `nguyen-ngoc-bich-ky-su` | Nguyễn Ngọc Bích | «Kỹ sư phá cầu» Khu 9 (quân sự) |
| danh-nhan-van-hoa-can-hien-dai | `pham-ngoc-thach` | Phạm Ngọc Thạch | Bộ trưởng Y tế đầu tiên VNDCCH |
| danh-nhan-van-hoa-can-hien-dai | `to-ngoc-van` | Tô Ngọc Vân | Hy sinh ở Điện Biên Phủ 1954 |
| danh-nhan-van-hoa-can-hien-dai | `ta-quang-buu` | Tạ Quang Bửu | Nguyên Bộ trưởng ĐH |
| danh-nhan-van-hoa-can-hien-dai | `xuan-thuy` | Xuân Thủy | Nhà báo/nhà ngoại giao cách mạng |
| nu-danh-nhan-lich-su | *(cả 5)* | Hoàng Ngân, Tạ Thị Kiều, Tôn Nữ Ngọc Toản, Nguyễn Việt Hồng, Huỳnh Thị Chấu | Cách mạng/liệt sĩ/quân y |

## 🔴 NHÓM C — TIER-SENS, soát kỹ từng mục (≈125 mục — KHÔNG duyệt lô)

Toàn bộ các lớp: `anh-hung-can-hien-dai` (29) · `chi-si-cach-mang` (16) ·
`chien-dich-tran-danh` (16) · `di-tich-cach-mang` (14) · `danh-nhan-dan-toc-thieu-so` (13, phần khởi nghĩa/tướng) ·
`me-vnah` (10) · `danh-nhan-nam-bo` (17, phần cách mạng) · `thieu-nien-anh-hung` (4) ·
`nghia-si-can-vuong` (3). Chi tiết ở `section9-care-tiers-2026-07-25.md`.

---

## Cách chạy sau khi Iron Man duyệt
- OK Nhóm A → tôi chạy script nâng 14 id (đã dựng sẵn, chờ bỏ chặn/cho phép).
- Chọn thêm id nào ở Nhóm B → tôi thêm vào danh sách rồi chạy 1 lần, qua gate validate+build.
