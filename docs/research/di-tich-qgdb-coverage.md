# Coverage: Di tích quốc gia đặc biệt (overlay `di-tich-qgdb.json`)

## Tổng số theo nguồn chuẩn

- **Danh mục chính thức đối chiếu**: dsvh.gov.vn (Cục Di sản văn hoá) cung cấp danh mục đầy đủ, có đánh số thứ tự, cho **đợt 1–9 (2009–2018) = 107 di tích** — nguồn: https://dsvh.gov.vn/danh-muc-di-tich-quoc-gia-dac-biet-1752 (trang này CHƯA được cập nhật thêm đợt 10 trở đi tại thời điểm truy cập).
- Để phủ đợt 10–19 (2020–2026), dùng danh sách tổng hợp trên cổng chính sách Chính phủ: https://xaydungchinhsach.chinhphu.vn/danh-sach-di-tich-quoc-gia-dac-biet-119260211160043009.htm — tự nhận tổng **153 di tích** qua đợt 1–19, tức đợt 10–19 cộng thêm **46 di tích** (7+7+5+5+2+3+6+5+4+2). Cộng dồn: 107 + 46 = **153** — khớp với số tổng do trang này công bố.
- Đợt 19 (2026, Quyết định số 266/QĐ-TTg ngày 11/02/2026 do Phó Thủ tướng Mai Văn Chính ký, xếp hạng "Quần thể di tích đình, chùa, từ chỉ Thổ Hà" và "Nhà ngục Kon Tum") đã được xác minh độc lập qua báo chí chính thống: nhandan.vn và TTXVN/VietnamPlus.
- **Ghi nhận sai lệch giữa nguồn**: một kết quả tìm kiếm (không phải trang danh mục chính thức) nêu con số "158 di tích qua 18 đợt" — con số này KHÔNG khớp với danh mục đối chiếu chi tiết theo từng đợt (107 + 44 [đợt 10–18, chưa tính đợt 19] = 151). Theo hướng dẫn escalation, đã ưu tiên danh mục có thể đối chiếu chi tiết từng đợt/từng tên (153, tính cả đợt 19) làm chuẩn thay vì con số tổng hợp không kiểm chứng được (158). Chênh lệch 158 so với 153 (~5 di tích) chưa xác định được nguyên nhân — có thể do cách đếm phân điểm bổ sung khác nhau (ví dụ đợt bổ sung 23 điểm tại Điện Biên Phủ hoặc 9 điểm tại Đường Trường Sơn được đếm rời trong một số thống kê).

**Tổng số dùng làm chuẩn đối chiếu: 153 di tích** (đợt 1–19, tính đến Quyết định 266/QĐ-TTg 11/02/2026).

## Số đã phủ trong file (bản ráp cuối 2026-07-18)

**152 / 153 di tích** (99,3%) có toạ độ WGS84, mỗi item có ≥1 nguồn chính thống (dsvh.gov.vn / chinhphu.vn / baochinhphu.vn / nhandan.vn), toạ độ đã qua kiểm tra nằm trong khung Việt Nam (kinh độ 102–118, vĩ độ 7–24), khử trùng lặp theo tên (0 trùng), sắp theo năm → tên. Hai mục từng thiếu đã được bổ sung ở bước ráp cuối bằng toạ độ đại diện có ghi chú:
- **Tháp Bình Sơn** (đợt 6, 2015) — toạ độ trung tâm xã Tam Sơn, huyện Sông Lô cũ (OSM/Photon).
- **Chiến thắng Chương Thiện** (đợt 4, 2013) — toạ độ trung tâm TP Vị Thanh, Hậu Giang cũ (OSM/Photon).

## Danh sách thiếu (1 di tích)

| # | Tên di tích | Đợt | Năm | Tỉnh cũ | Lý do thiếu |
|---|---|---|---|---|---|
| 1 | Những địa điểm Khởi nghĩa Yên Thế | 2 | 2012 | Bắc Giang (nay Bắc Ninh) | Không tìm được toạ độ đáng tin cậy cho đồn Phồn Xương/đền Hoàng Hoa Thám: Wikipedia không có toạ độ, Nominatim bị 429 toàn phiên, Photon/Overpass không có kết quả khớp. Không bịa toạ độ — bổ sung ở lượt cập nhật kế tiếp (di tích đa điểm quanh thị trấn Phồn Xương, huyện Yên Thế). |

## Ghi chú về chất lượng toạ độ

- Phần lớn item dùng toạ độ POI cụ thể (đền/chùa/tháp/bảo tàng) từ Nominatim, Wikipedia infobox, hoặc Wikidata.
- Một số item (đánh dấu rõ trong trường `ghi_chu` của từng item) chỉ có toạ độ trung tâm hành chính cấp xã/huyện do không tìm được điểm di tích cụ thể trên OSM/Wikipedia trong thời gian xử lý — không sai vị trí lớn (thường lệch dưới vài km) nhưng chưa phải toạ độ chính xác tuyệt đối của công trình.
- Các di tích trải nhiều tỉnh (Đường Trường Sơn - Đường Hồ Chí Minh và đợt bổ sung, Đường Hồ Chí Minh trên biển, Vườn Quốc gia Cát Tiên) dùng 1 toạ độ đại diện + `tinh_34` liệt kê đủ các tỉnh mới liên quan, có ghi chú giải thích.
- Trường `tinh_34` áp dụng đúng bảng ánh xạ 63→34 tỉnh/thành theo Nghị quyết 202/2025/QH15 (hiệu lực 1/7/2025).

## Nguồn dữ liệu

- Danh mục/xếp hạng: dsvh.gov.vn, xaydungchinhsach.chinhphu.vn, baochinhphu.vn (đợt 17, 18), nhandan.vn + vietnamplus.vn (đợt 19).
- Toạ độ: Nominatim (OpenStreetMap), Wikipedia tiếng Việt (infobox), Wikidata, OpenStreetMap trực tiếp.
