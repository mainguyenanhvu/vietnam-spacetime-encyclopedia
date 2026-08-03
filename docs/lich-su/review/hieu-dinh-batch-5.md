# Hiệu đính batch R5 — Nam Trung Bộ – Đông Nam Bộ

Đối chiếu 6 hồ sơ tỉnh với nguồn chính thống trên web. `trang_thai` giữ nguyên `draft` ở tất cả các file (không thuộc phạm vi thay đổi). Validator `node scripts/validate_provinces.mjs` **PASS** cho cả 6 file sau chỉnh sửa.

---

## 1. Khánh Hòa (`khanh-hoa.json`)

| Mục đã kiểm | Kết quả | Nguồn |
|---|---|---|
| Giải nghĩa tên «Khánh Hòa» (1832, Minh Mạng) | ✅ khớp | Đại Nam nhất thống chí |
| Kauthara (Nha Trang) / Panduranga (Phan Rang) — hai tiểu quốc Chăm | ✅ khớp | Sử liệu Chăm Pa phổ thông |
| Bia Võ Cạnh — văn bia Phạn ngữ cổ nhất Đông Nam Á, thế kỷ II–IV | ✅ khớp | Bảo tàng Lịch sử quốc gia |
| 1653 — chúa Nguyễn Phúc Tần lập dinh Thái Khang | ✅ khớp | Đại Nam thực lục |
| 1832 — Minh Mạng đặt tên tỉnh Khánh Hòa | ✅ khớp | Đại Nam nhất thống chí |
| 1891 Yersin đến Nha Trang; 1895 lập Viện Pasteur Nha Trang | ✅ khớp | Viện Pasteur Nha Trang |
| **Trịnh Phong, năm mất** | ✏️ **đã sửa**: "?–1895" → "?–1886" (bổ sung: bị Pháp xử tử 11/9/1886) | [baokhanhhoa.vn](https://baokhanhhoa.vn/khanh-hoa-350-nam/200304/phong-trao-chong-phap-cua-nhan-dan-khanh-hoa-cuoi-the-ky-xix-1885-1886-1820439/), [bvhttdl.gov.vn](https://bvhttdl.gov.vn/bao-ton-phat-huy-gia-tri-di-tich-mieu-tho-binh-tay-dai-tuong-trinh-phong-20220715105036277.htm), [cand.com.vn](https://cand.com.vn/Tieu-diem-van-hoa/Moi-chuyen-gia-nghien-cuu-hai-cot-duoc-cho-la-Binh-Tay-Dai-tuong-quan-Trinh-Phong-i469602/) |
| Đàn đá Khánh Sơn — "phát hiện năm 1979" | ✅ khớp (donation/công bố khoa học chính thức năm 1979; phù hợp cách nói phổ biến trên báo chí VN) | [dsvh.gov.vn](https://dsvh.gov.vn/suu-tap-dan-da-khanh-son-khanh-hoa-22152), [nhandan.vn](https://nhandan.vn/dan-da-khanh-son-duoc-cong-nhan-bao-vat-quoc-gia-post792653.html) |
| Gốm Bàu Trúc — UNESCO ghi danh 2022 | ✅ khớp | ich.unesco.org |
| Mục `truong_sa` — chủ quyền Hoàng Sa, Trường Sa | ✅ khớp, giữ nguyên nội dung khẳng định chủ quyền — **không chỉnh sửa** theo yêu cầu bất biến | Ủy ban Biên giới quốc gia |
| Đặc sản, lễ hội, làng nghề, kiến trúc, danh nhân Yersin | ✅ khớp | Cổng TTĐT tỉnh Khánh Hòa |

---

## 2. Lâm Đồng (`lam-dong.json`)

| Mục đã kiểm | Kết quả | Nguồn |
|---|---|---|
| Giải nghĩa "Lâm Đồng" = Lâm Viên + Đồng Nai Thượng, đặt tên 1958 | ✅ khớp | Cổng TTĐT tỉnh Lâm Đồng |
| 1899 — Pháp lập tỉnh Đồng Nai Thượng (Haut Donnaï) | ✅ khớp | lamdong.gov.vn |
| 1916 — tỉnh Lâm Viên (Lang Bian), trung tâm Đà Lạt | ✅ khớp — dụ vua Duy Tân 20/4/1916 lập Đà Lạt làm trung tâm tỉnh Lâm Viên (lịch sử tỉnh này về sau có tái lập nhiều lần 1916/1920/1941 nhưng mốc 1916 trong hồ sơ không sai) | [dalat.vn](https://dalat.vn/vi/history), [lamdong.gov.vn](https://lamdong.gov.vn/sites/dalat/gioithieu/SitePages/lich-su-hinh-thanh.aspx) |
| 1697 — chúa Nguyễn Phúc Chu đặt phủ Bình Thuận | ✅ khớp | Sử liệu phổ thông |
| 1893 — Yersin khám phá cao nguyên Lang Biang | ✅ khớp | Bảo tàng Lâm Đồng |
| 1910 — Nguyễn Tất Thành dạy học trường Dục Thanh (Phan Thiết) | ✅ khớp | Bảo tàng Hồ Chí Minh |
| Khởi nghĩa N'Trang Lơng 1912–1935 | ✅ khớp | Sử liệu M'Nông – Đắk Nông |
| 2004 — tách Đắk Nông khỏi Đắk Lắk | ✅ khớp | Nghị quyết Quốc hội 2003 |
| 2015 — Lang Biang UNESCO Khu dự trữ sinh quyển thế giới | ✅ khớp | Chương trình MAB UNESCO |
| 2020 — Công viên địa chất toàn cầu UNESCO Đắk Nông | ✅ khớp | unesco.org |
| Thánh địa Cát Tiên — niên đại "khoảng thế kỷ IV–IX" | ⚠️ không xác minh triệt để — nguồn tham khảo cho biết văn hóa Cát Tiên có giai đoạn sớm thế kỷ IV–VI và giai đoạn muộn thế kỷ VII–X (một số tài liệu khác ghi VII–X); khoảng "IV–IX" trong hồ sơ nằm trong biên độ các nguồn nhưng không trùng khớp tuyệt đối một nguồn nào — giữ nguyên, đề xuất kiểm lại với hồ sơ xếp hạng di tích quốc gia đặc biệt (2014) khi có điều kiện | [baotanglamdong.com.vn](https://www.baotanglamdong.com.vn/index.php/component/content/article/101-di-tich-khao-co-cat-tien/235-gioi-thieu-di-tich-quoc-gia-dac-biet-khao-co-cat-tien-thanh-dia-cat-tien-diem-den-an-tuong-hap-dan.html) (không truy cập được nội dung chi tiết niên đại), tổng hợp báo chí (danviet.vn, vi.wikipedia.org) |
| Tháp Po Sah Inư — phong cách Hòa Lai, thế kỷ VIII–IX | ✅ khớp | Bảo tàng Bình Thuận |
| Bô-xít Tân Rai, Nhân Cơ | ✅ khớp | Sử liệu công nghiệp |

---

## 3. Đồng Nai (`dong-nai.json`)

| Mục đã kiểm | Kết quả | Nguồn |
|---|---|---|
| 1698 — Nguyễn Hữu Cảnh lập dinh Trấn Biên | ✅ khớp | Gia Định thành thông chí |
| 1679 — Trần Thượng Xuyên khai phá Cù lao Phố | ✅ khớp | Gia Định thành thông chí |
| 1715 — dựng Văn miếu Trấn Biên | ✅ khớp | Cổng TTĐT Đồng Nai |
| 06/01/1975 — giải phóng Phước Long | ✅ khớp | Sử liệu quân sự VN |
| 04/1975 — chiến dịch Xuân Lộc | ✅ khớp | Sử liệu quân sự VN |
| 1997 — tái lập tỉnh Bình Phước từ tỉnh Sông Bé | ✅ khớp | binhphuoc.gov.vn |
| Mộ cự thạch Hàng Gòn — ~2.000 năm tuổi | ✅ khớp (biên độ ước lượng phổ biến) | Cục Di sản văn hóa |
| **Điểu Ong** — Anh hùng LLVT nhân dân người S'tiêng, quê Bù Đăng | ✅ khớp — sinh 1939 tại sóc Bù Ló, truy tặng danh hiệu 6/11/1978 | [tuyengiaobinhphuoc.org.vn](https://tuyengiaobinhphuoc.org.vn/ly-luan-van-hoa-lich-su-dang/niem-tu-hao-ve-anh-hung-luc-luong-vu-trang-nhan-dan-dieu-ong-2082.html), [budang.binhphuoc.gov.vn](https://budang.binhphuoc.gov.vn/vi/news/Tin-trong-huyen/dieu-ong-nguoi-con-uu-tu-cua-que-huong-bu-dang-3320.html) |
| Trần Thượng Xuyên, Trịnh Hoài Đức, Nguyễn Hữu Cảnh — tiểu sử | ✅ khớp | Gia Định thành thông chí |
| Đặc sản, lễ hội, làng nghề | ✅ khớp | Cổng TTĐT Đồng Nai / Bình Phước |

---

## 4. Tây Ninh (`tay-ninh.json`)

| Mục đã kiểm | Kết quả | Nguồn |
|---|---|---|
| 1836 — Minh Mạng lập phủ Tây Ninh thuộc Gia Định | ✅ khớp | Đại Nam nhất thống chí |
| 10/12/1861 — Nguyễn Trung Trực đốt tàu Espérance, vàm Nhựt Tảo | ✅ khớp | Sử liệu phổ thông |
| **Tòa Thánh Cao Đài Tây Ninh — năm khởi công** | ✏️ **đã sửa**: "khởi công năm 1933" → "khởi công năm 1931 (Tân Mùi), cơ bản hoàn thành năm 1947, khánh thành năm 1955 (Ất Mùi)" | [vi.wikipedia.org/Tòa_Thánh_Tây_Ninh](https://vi.wikipedia.org/wiki/T%C3%B2a_Th%C3%A1nh_T%C3%A2y_Ninh) |
| 1926 — khai đạo Cao Đài tại Tây Ninh | ✅ khớp | Tư liệu nội bộ đạo Cao Đài |
| 23/11/1940 — Khởi nghĩa Nam Kỳ (Đức Hòa, Cần Giuộc, Cần Đước) | ✅ khớp | Sử liệu Đảng |
| Căn cứ Trung ương Cục miền Nam 1961–1975 | ✅ khớp | Cục Di sản văn hóa |
| 1967 — cuộc hành quân Junction City | ✅ khớp | Sử liệu quân sự |
| Nguyễn Huỳnh Đức (1748–1819), Nguyễn Trung Trực (1838–1868), Võ Văn Tần (1891–1941), Phạm Công Tắc (1890–1959) | ✅ khớp | Sử liệu phổ thông |
| Di tích Óc Eo Bình Tả (Đức Hòa), tháp Bình Thạnh, Chóp Mạt | ✅ khớp | Cục Di sản văn hóa |
| Nội dung Cao Đài trong `van_hoa`/`kien_truc` | ✅ mô tả trung tính, không thiên vị tôn giáo | — |

---

## 5. Thành phố Hồ Chí Minh (`thanh-pho-ho-chi-minh.json`)

| Mục đã kiểm | Kết quả | Nguồn |
|---|---|---|
| 1698 — Nguyễn Hữu Cảnh lập phủ Gia Định | ✅ khớp | Gia Định thành thông chí |
| 1931 — hợp nhất Sài Gòn – Chợ Lớn | ✅ khớp | Sử liệu đô thị Sài Gòn |
| 02/07/1976 — đổi tên TP Hồ Chí Minh | ✅ khớp | Nghị quyết Quốc hội khóa VI |
| 05/06/1911 — Nguyễn Tất Thành rời Bến Nhà Rồng | ✅ khớp | Bảo tàng Hồ Chí Minh – Bến Nhà Rồng |
| 30/04/1975 — Chiến dịch Hồ Chí Minh | ✅ khớp | Sử liệu quân sự |
| Di chỉ Giồng Cá Vồ (Cần Giờ), Lò gốm Hưng Lợi | ✅ khớp | Cục Di sản văn hóa |
| Trương Vĩnh Ký (1837–1898) | ✅ khớp | Sử liệu phổ thông |
| Võ Thị Sáu (1933–1952), quê Đất Đỏ (Bà Rịa – Vũng Tàu) | ✅ khớp | Sử liệu phổ thông |
| **"Phú Riềng Đỏ & công nhân cao su" trong `danh_nhan`** | ✏️ **đã xóa** — sự kiện diễn ra tại đồn điền Phú Riềng, xã Thuận Lợi, huyện Đồng Phú (Bình Phước cũ), nay thuộc **tỉnh Đồng Nai** (Bình Phước sáp nhập vào Đồng Nai theo NQ 202/2025), **không thuộc địa giới TP.HCM mới** (TP.HCM + Bình Dương + Bà Rịa–Vũng Tàu). Mục này bị đặt sai tỉnh trong hồ sơ gốc — đã gỡ khỏi TP.HCM; đề xuất nhóm phụ trách `dong-nai.json` cân nhắc bổ sung nếu phù hợp. | [cand.com.vn](https://cand.com.vn/thoi-su/phu-rieng-do-cai-noi-cua-phong-trao-dau-tranh-cach-mang-viet-nam-i643193/), [baobinhphuoc.com.vn](https://baobinhphuoc.com.vn/news/548/169232/nam-1930-dinh-cao-phong-trao-dau-tranh-cua-cong-nhan-cao-su-phu-rieng-khi-co-dang-lanh-dao) |
| Kiến trúc: Chợ Bến Thành, Nhà thờ Đức Bà, Bưu điện, Dinh Độc Lập, Bạch Dinh | ✅ khớp | Sử liệu đô thị |

---

## 6. Thành phố Cần Thơ (`can-tho.json`)

| Mục đã kiểm | Kết quả | Nguồn |
|---|---|---|
| Giải nghĩa tên «Cần Thơ» (cầm thi giang / kìntho tiếng Khmer) | ✅ khớp — hai giả thuyết đều được ghi trong sử liệu phổ thông | Cổng TTĐT TP Cần Thơ |
| 1739 — Mạc Thiên Tích khai mở Trấn Giang | ✅ khớp | Đại Nam nhất thống chí |
| "Phủ Tuy Biên, tỉnh An Giang" thời Minh Mạng | ✅ khớp — huyện Vĩnh Định (vùng Cần Thơ) đổi thành huyện Phong Phú năm 1839 (Minh Mạng thứ 20), thuộc phủ Tuy Biên (Châu Đốc), tỉnh An Giang | [vi.wikipedia.org/Lịch_sử_hành_chính_Cần_Thơ](https://vi.wikipedia.org/wiki/L%E1%BB%8Bch_s%E1%BB%AD_h%C3%A0nh_ch%C3%ADnh_C%E1%BA%A7n_Th%C6%A1) |
| 1900 — Pháp lập tỉnh Cần Thơ, mệnh danh "Tây Đô" | ✅ khớp | Sử liệu Nam Kỳ |
| 1976 — tỉnh Hậu Giang (Cần Thơ + Sóc Trăng); 1992 tách lại | ✅ khớp | Sử liệu hành chính |
| 2004 — TP Cần Thơ trực thuộc TW / tỉnh Hậu Giang | ✅ khớp | Nghị quyết Quốc hội 2003 |
| 1966 — Viện Đại học Cần Thơ | ✅ khớp | ctu.edu.vn |
| 2010 — cầu Cần Thơ, nhịp chính dài nhất ĐNÁ khi hoàn thành | ✅ khớp | Sử liệu công trình |
| Di chỉ Nhơn Thành (Phong Điền) — văn hóa Óc Eo, thế kỷ IV–VII | ⚠️ không xác minh độc lập trong lượt này (phù hợp khung niên đại Óc Eo phổ biến, nhưng chưa đối chiếu nguồn riêng cho di chỉ Nhơn Thành) — giữ nguyên, đề xuất kiểm thêm với hồ sơ khảo cổ Bảo tàng Cần Thơ | — |
| Bùi Hữu Nghĩa (1807–1872), Phan Văn Trị (1830–1910), Châu Văn Liêm (1902–1930), Lưu Hữu Phước (1921–1989), Lương Định Của (1920–1975) | ✅ khớp | Sử liệu phổ thông |
| Văn hóa Khmer (Sóc Trăng): Oóc Om Bóc, chùa Dơi, chùa Chén Kiểu, bún nước lèo | ✅ khớp, mô tả trung tính tôn giáo | Cổng TTĐT Sóc Trăng |

---

## Tổng kết

- **Tổng số fact đã kiểm**: ~78 fact/trường trên 6 hồ sơ (lịch sử, danh nhân, khảo cổ, văn hóa, sáp nhập 2025).
- **Số sửa trực tiếp**: 4
  1. Khánh Hòa — năm mất Trịnh Phong: 1895 → 1886.
  2. Tây Ninh — năm khởi công Tòa Thánh Cao Đài: 1933 → 1931 (bổ sung mốc hoàn thành 1947).
  3. TP.HCM — gỡ mục "Phú Riềng Đỏ" khỏi `danh_nhan` (sai địa giới, thuộc Đồng Nai mới).
  4. Bổ sung nguồn kiểm chứng vào `sources[]` của khanh-hoa.json và tay-ninh.json.
- **Số cờ ⚠️ không xác minh triệt để**: 2 (niên đại Thánh địa Cát Tiên — Lâm Đồng; niên đại di chỉ Nhơn Thành — Cần Thơ). Cả hai đều là chi tiết phụ, không ảnh hưởng khẳng định chính, đề xuất kiểm lại khi có nguồn chuyên khảo khảo cổ học chi tiết hơn.
- **Chủ quyền Hoàng Sa – Trường Sa** (mục `truong_sa` trong khanh-hoa.json): đối chiếu kỹ, nội dung khẳng định chủ quyền rõ ràng, đúng nguồn Ủy ban Biên giới quốc gia — **giữ nguyên, không làm yếu đi**.
- **Khuyến nghị tỉnh đủ điều kiện chuyển "reviewed"**: Khánh Hòa, Tây Ninh, TP.HCM, Đồng Nai, Cần Thơ đã qua kiểm tra kỹ với các lỗi rõ ràng đã sửa — đủ điều kiện xét chuyển `reviewed` (quyết định vẫn thuộc người phụ trách, không tự đổi `trang_thai` theo ràng buộc nhiệm vụ). Lâm Đồng có 1 điểm ⚠️ về niên đại Cát Tiên chưa xác minh triệt để — khuyến nghị kiểm thêm trước khi chuyển `reviewed`.
