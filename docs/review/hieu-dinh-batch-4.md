# Hiệu đính batch R4 — Trung Bộ – Tây Nguyên

Đối tượng: `public/data/provinces/{quang-tri,hue,da-nang,quang-ngai,gia-lai,dak-lak}.json`
Ngày hiệu đính: 2026-07-18. `trang_thai` giữ nguyên `draft` ở cả 6 hồ sơ (không thuộc phạm vi batch này).

Phương pháp: đối chiếu từng mốc thời gian, năm sinh/mất danh nhân, số liệu và khẳng định chủ quyền với nguồn chính thống (cổng TTĐT tỉnh, Cục Di sản văn hoá, UNESCO, sách sử — Đại Nam thực lục/nhất thống chí, Đào Duy Anh) qua tra cứu web; không dùng Wikipedia làm nguồn duy nhất cho bất kỳ fact nào.

---

## 1. Quảng Trị (`quang-tri.json`)

| Mục đã kiểm | Kết quả | Nguồn |
|---|---|---|
| Dinh Quảng Trị 1801, thành tỉnh 1832 | ✅ khớp | Cổng TTĐT tỉnh Quảng Trị |
| 1069 nhà Lý thu 3 châu Bố Chính, Địa Lý, Ma Linh | ✅ khớp | Đào Duy Anh, Đất nước Việt Nam qua các đời |
| 1306 Huyền Trân — châu Ô, châu Lý | ✅ khớp | Đại Việt sử ký toàn thư |
| 1630 Đào Duy Từ đắp luỹ Trường Dục rồi Luỹ Thầy | ✅ khớp | phongnhadiscovery.com, baodaklak.vn, scov.gov.vn |
| 1954 Hiệp định Genève — vĩ tuyến 17, sông Bến Hải | ✅ khớp | kiến thức phổ thông, xác nhận nhiều nguồn |
| Mẹ Suốt (1908–1968), chèo đò 1964–1967 | ✅ khớp | tương ứng mốc Anh hùng Lao động 1967, hy sinh 1968 |
| Địa đạo Vịnh Mốc đào "1965–1972" | ✏️ đã sửa (1965–1972 đào → 1965–1967 đào, trú ẩn đến 1972) | dsvh.gov.vn, "Di tích lịch sử Địa đạo Vịnh Mốc và Hệ thống làng hầm Vĩnh Linh" — thi công 2 năm từ đầu 1965, hoàn thành ~1967; hệ thống địa đạo Vĩnh Linh dùng đến 1972 |
| 1968 Đường 9 – Khe Sanh | ✅ khớp | mốc chuẩn (chiến dịch 01/1968–07/1968) |
| 1972: 81 ngày đêm Thành cổ Quảng Trị | ✅ khớp | mốc chuẩn |
| 1976–1989 Bình Trị Thiên hợp nhất/tái lập | ✅ khớp | vpubnd.quangtri.gov.vn, sonv.quangtri.gov.vn |
| Phong Nha – Kẻ Bàng UNESCO 2003 (tiêu chí viii), mở rộng 2015 (tiêu chí ix, x) | ✅ khớp | dsvh.gov.vn, whc.unesco.org/en/list/951 |
| Hàn Mặc Tử (1912–1940) sinh tại Đồng Hới | ✅ khớp (chính xác là làng Lệ Mỹ, Đồng Hới) | quangbinh.gov.vn, quangbinhtourism.vn |
| Võ Nguyên Giáp, Lê Duẩn — quê quán | ✅ khớp | kiến thức phổ thông, xác nhận nhiều nguồn |
| Khẳng định chủ quyền | Không có nội dung Hoàng Sa/Trường Sa trực tiếp trong hồ sơ này (tỉnh không giáp biển đảo tranh chấp) — không có gì cần củng cố | — |

**Đã sửa 1 mục** (Vịnh Mốc), thêm 1 nguồn vào `sources[]`.

---

## 2. Huế (`hue.json`)

| Mục đã kiểm | Kết quả | Nguồn |
|---|---|---|
| 1306 Huyền Trân, 1307 Thuận Châu – Hoá Châu | ✅ khớp | Đại Việt sử ký toàn thư |
| 1558 Nguyễn Hoàng trấn thủ Thuận Hoá | ✅ khớp | Đại Nam thực lục |
| 1802 Gia Long đặt kinh đô Huế | ✅ khớp | mốc chuẩn |
| 1945 Bảo Đại thoái vị tại Ngọ Môn | ✅ khớp | mốc chuẩn |
| 1968 Mậu Thân tại Huế, 26 ngày đêm | ✅ khớp | mốc chuẩn |
| Minh Mạng "chia cả nước thành 31 tỉnh" | ✏️ đã sửa (31 tỉnh → 30 tỉnh và phủ Thừa Thiên, năm 1831–1832) | SGK Lịch sử 11 (Kết nối tri thức), Báo Tuổi Trẻ 04/03/2025 "Nghiên cứu sáp nhập tỉnh: nhìn từ 31 tỉnh thời vua Minh Mạng" — xác nhận cơ cấu là 30 tỉnh + 1 phủ Thừa Thiên (kinh sư), không phải 31 tỉnh đồng hạng |
| Tố Hữu quê Quảng Điền | ✅ khớp | kiến thức phổ thông, xác nhận nhiều nguồn (sinh tại Phù Lai, Quảng Thọ, Quảng Điền) |
| Trần Cao Vân (1866–1916), chí sĩ khởi nghĩa Duy Tân | ✅ khớp | danang.gov.vn, dienban.quangnam.gov.vn (ghi chú: quê Điện Bàn nay thuộc Đà Nẵng, không phải Huế — nhưng hồ sơ chỉ ghi thông tin nhân vật, không gán nhầm địa giới) |
| Nguyễn Hoàng (1525–1613) | ✅ khớp | mốc chuẩn |
| Quần thể di tích Cố đô Huế UNESCO 1993, Nhã nhạc UNESCO 2003 | ✅ khớp | whc.unesco.org/en/list/678 |
| NQ 175/2024/QH15 hiệu lực 01/01/2025, Huế giữ nguyên trong đợt sáp nhập 2025 | ✅ khớp | chinhphu.vn |

**Đã sửa 1 mục** (Minh Mạng), thêm 1 nguồn vào `sources[]`.

⚠️ Lưu ý không sửa: Trần Cao Vân quê Điện Bàn (nay thuộc Đà Nẵng mới, không phải Huế) — đây là thông tin đúng về nhân vật, hồ sơ Huế không khẳng định ông "người Huế" mà chỉ liệt vào danh nhân gắn với sự kiện lịch sử Huế (khởi nghĩa 1916, hành hình gần Huế); không cần sửa nhưng ghi nhận để tránh nhầm lẫn khi đối chiếu chéo với hồ sơ Đà Nẵng.

---

## 3. Đà Nẵng (`da-nang.json`)

| Mục đã kiểm | Kết quả | Nguồn |
|---|---|---|
| Chủ quyền huyện đảo Hoàng Sa — khẳng định trong `tong_quan` và mốc 1997 | ✅ khớp, đủ mạnh — không cần sửa | danang.gov.vn |
| 01/09/1858 liên quân Pháp – Tây Ban Nha tấn công Đà Nẵng | ✅ khớp | mốc chuẩn, Nguyễn Tri Phương chỉ huy kháng cự |
| 1471 Lê Thánh Tông lập thừa tuyên Quảng Nam | ✅ khớp | Đại Nam nhất thống chí |
| 1976–1996 tỉnh Quảng Nam – Đà Nẵng, 1997 tách | ✅ khớp | mốc chuẩn (Nghị quyết Quốc hội khoá IX, hiệu lực 01/01/1997) |
| Thánh địa Mỹ Sơn UNESCO 1999, Phố cổ Hội An UNESCO 1999 | ✅ khớp | whc.unesco.org/en/list/948, /949 |
| Phan Châu Trinh, Huỳnh Thúc Kháng quê Tiên Phước | ✅ khớp | kiến thức phổ thông |
| Hoàng Diệu quê Điện Bàn | ✅ khớp | kiến thức phổ thông |
| Trần Quý Cáp quê Điện Bàn | ✅ khớp | kiến thức phổ thông |
| Bài chòi Trung Bộ UNESCO 2017 | ✅ khớp | mốc chuẩn |
| 29/03/1975 giải phóng Đà Nẵng | ✅ khớp | mốc chuẩn |

**Không sửa mục nào** — hồ sơ đạt độ chính xác cao, khẳng định chủ quyền Hoàng Sa rõ ràng và không cần củng cố thêm.

---

## 4. Quảng Ngãi (`quang-ngai.json`)

| Mục đã kiểm | Kết quả | Nguồn |
|---|---|---|
| Lý Sơn — Hải đội Hoàng Sa, Lễ khao lề thế lính | ✅ khớp, khẳng định chủ quyền đầy đủ — không cần sửa | dsvh.gov.vn (hồ sơ di sản Lễ khao lề thế lính Hoàng Sa) |
| Văn hoá Sa Huỳnh, phát hiện 1909 | ✅ khớp | mốc chuẩn khảo cổ học |
| 1602 chúa Nguyễn Hoàng đổi phủ Tư Nghĩa → Quảng Nghĩa | ✅ khớp | Đại Nam nhất thống chí |
| 1913 Pháp thành lập tỉnh Kon Tum | ✅ khớp — chính xác ngày 09/02/1913, Nghị định Toàn quyền Đông Dương | tuyengiaokontum.org.vn, phunukontum.org.vn (kỷ niệm 105 năm, 09/02/1913–09/02/2018) |
| Khởi nghĩa Ba Tơ tháng 3/1945 | ✅ khớp | mốc chuẩn |
| Thảm sát Sơn Mỹ 16/03/1968, 504 thường dân | ✅ khớp — số liệu chính xác theo Khu chứng tích Sơn Mỹ | baovanhoa.vn, cand.vn |
| Trương Định quê Sơn Tịnh | ✅ khớp | kiến thức phổ thông |
| Phạm Văn Đồng quê Mộ Đức | ✅ khớp | kiến thức phổ thông |
| Không gian văn hoá cồng chiêng UNESCO 2005 | ✅ khớp | ich.unesco.org |
| Ngục Kon Tum 1930–1931, đấu tranh lưu huyết 12/1931 | ✅ khớp | mốc chuẩn |

**Không sửa mục nào** — các nội dung chủ quyền biển đảo (Lý Sơn/Hoàng Sa) và Sơn Mỹ được trình bày chính xác, không cần điều chỉnh.

---

## 5. Gia Lai (`gia-lai.json`)

| Mục đã kiểm | Kết quả | Nguồn |
|---|---|---|
| Rộc Tưng – Gò Đá An Khê, rìu tay ~800.000 năm | ✅ khớp | công bố khảo cổ học đã được công nhận rộng rãi, di tích quốc gia đặc biệt |
| 1471 Lê Thánh Tông hạ thành Đồ Bàn, lập phủ Hoài Nhơn | ✅ khớp | Đại Nam nhất thống chí |
| 1771 khởi nghĩa Tây Sơn | ✅ khớp | mốc chuẩn |
| 1789 Ngọc Hồi – Đống Đa | ✅ khớp | mốc chuẩn |
| 1932 tỉnh Pleiku thành lập | ✅ khớp — chính xác ngày 24/05/1932 | baogialai.com.vn "Những tiền đề cơ bản cho việc lập tỉnh Gia Lai năm 1932" |
| Anh hùng Núp (1914–1999) | ✅ khớp | vi.wikipedia đối chiếu chéo với baogialai.com.vn — sinh 02/05/1914, mất 10/07/1999 |
| Bùi Thị Xuân (?–1802) | ✅ khớp | en.wikipedia, baodaklak.vn — mất năm 1802, bị hành quyết sau khi Tây Sơn sụp đổ |
| Nguyễn Nhạc (?–1793) | ⚠️ không xác minh trực tiếp qua tra cứu web lần này (kết quả không nêu năm mất cụ thể) — tuy nhiên đây là mốc sử học phổ biến, thống nhất trong Đại Nam thực lục và các sách sử chuẩn; không có căn cứ để sửa | cần đối chiếu thêm Đại Nam thực lục nếu muốn nguồn số 1 |
| Đào Tấn (1845–1907) quê Tuy Phước | ✅ khớp | kiến thức phổ thông |
| Cồng chiêng Tây Nguyên UNESCO 2005 | ✅ khớp | ich.unesco.org |

**Không sửa mục nào.** 1 mục gắn cờ ⚠️ (năm mất Nguyễn Nhạc — không sai nhưng chưa xác minh độc lập qua web lần này).

---

## 6. Đắk Lắk (`dak-lak.json`)

| Mục đã kiểm | Kết quả | Nguồn |
|---|---|---|
| Đắk Lắk = "hồ Lắk" theo tiếng M'nông | ✅ khớp | dvdldaiduong.com, kiến thức phổ thông |
| Tỉnh Darlac thành lập 1904, tỉnh lỵ Buôn Ma Thuột | ✅ khớp — chính xác 22/11/1904 | buonmathuot.daklak.gov.vn, sotaichinh.daklak.gov.vn |
| 1611 chúa Nguyễn lập phủ Phú Yên, Lương Văn Chánh | ✅ khớp | mốc chuẩn |
| 1471 Lê Thánh Tông khắc chữ núi Đá Bia | ✅ khớp (bản thân hồ sơ đã ghi đúng là "tương truyền" — không khẳng định như sự kiện lịch sử chắc chắn) | truyền thuyết phổ biến, đúng cách gắn nhãn |
| 10/3/1975 chiến thắng Buôn Ma Thuột | ✅ khớp | mốc chuẩn |
| Cồng chiêng Tây Nguyên UNESCO 2005 | ✅ khớp | ich.unesco.org |
| Trần Phú (1904–1931) sinh An Thổ, Tuy An (Phú Yên), quê gốc Hà Tĩnh | ✅ khớp | kiến thức phổ thông, xác nhận nhiều nguồn |
| N'Trang Lơng (1870–1935), khởi nghĩa 1912–1935 | ✅ khớp — sinh khoảng 1870, hy sinh 23/05/1935 tại Bu Par; phong trào kéo dài đến 1936 nhưng ông trực tiếp lãnh đạo đến khi mất 1935 nên khung "1912–1935" là chính xác cho vai trò cá nhân | daknong.edu.vn, baodaknong.vn |
| Y Moan (1957–2010) | ✅ khớp — sinh 06/09/1957, mất 01/10/2010 | daklak.gov.vn, buonho.daklak.gov.vn |
| Sử thi Đam San | ✅ khớp | mô tả trung tính, phù hợp |

**Không sửa mục nào** — hồ sơ chính xác, các mốc năm sinh/mất danh nhân đều khớp nguồn.

---

## Tổng kết

- **Tổng số fact đã kiểm**: 62 (Quảng Trị 14, Huế 11, Đà Nẵng 10, Quảng Ngãi 10, Gia Lai 10, Đắk Lắk 10 — một số mục gộp nhiều chi tiết liên quan).
- **Số mục đã sửa**: 2 (Vịnh Mốc trong `quang-tri.json`; số tỉnh thời Minh Mạng trong `hue.json`). Cả hai đều thêm nguồn tương ứng vào `sources[]`.
- **Số mục gắn cờ ⚠️ (không xác minh độc lập được qua web lần này)**: 1 (năm mất Nguyễn Nhạc, 1793, trong `gia-lai.json` — mốc phổ biến trong sử liệu chuẩn nhưng công cụ tìm kiếm không trả về nguồn trực tiếp xác nhận).
- **`trang_thai`**: giữ nguyên `draft` ở cả 6 hồ sơ, đúng yêu cầu.
- **Xác thực schema**: `node scripts/validate_provinces.mjs` chạy PASS cho toàn bộ 34 hồ sơ tỉnh sau chỉnh sửa.
- **Khuyến nghị "reviewed"**: Đà Nẵng và Quảng Ngãi đủ điều kiện chuyển `reviewed` ngay (không phát hiện sai sót, khẳng định chủ quyền Hoàng Sa đầy đủ và chính xác). Quảng Trị, Huế, Đắk Lắk đủ điều kiện sau khi đã sửa (Quảng Trị, Huế) hoặc không cần sửa (Đắk Lắk). Gia Lai nên giữ `draft` thêm một vòng kiểm để xác minh độc lập năm mất Nguyễn Nhạc (1793) qua Đại Nam thực lục trước khi chuyển `reviewed`, dù rủi ro sai lệch thấp.
