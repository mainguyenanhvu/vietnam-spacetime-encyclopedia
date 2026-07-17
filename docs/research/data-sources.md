# Research 0.2 — Nguồn dữ liệu chính thống (2026-07-17)

## Nguồn nội dung theo chủ đề

| Chủ đề | Nguồn | URL | Ghi chú |
|---|---|---|---|
| Sáp nhập 2025 (63→34) | Nghị quyết 202/2025/QH15 (Báo Chính phủ) | xaydungchinhsach.chinhphu.vn | ✅ 34 đơn vị (28 tỉnh + 6 TP), 11 giữ nguyên, hiệu lực 2025-07-01 |
| Văn bản pháp lý gốc | vanban.chinhphu.vn; mirror thuvienphapluat.vn | — | ✅ Trích dẫn bản chinhphu.vn làm chuẩn |
| Thống kê dân số/kinh tế | Niên giám thống kê 2025 (GSO/NSO) | nso.gov.vn | ⚠️ SSL lỗi khi fetch; niên giám có phụ lục quy đổi số liệu 2020–2025 về ranh giới 34 tỉnh |
| Địa lý hành chính lịch sử | Đào Duy Anh, *Đất nước Việt Nam qua các đời*; Đại Nam nhất thống chí | bản in NXB | ✅ Nguồn học thuật chuẩn; kiểm tra bản quyền trước khi trích |
| Anh hùng dân tộc | Danh sách 14 vị (Bộ VHTTDL 2013) | vietnamnet.vn (tóm tắt), nguoikesu.com (aggregator) | ⚠️ nguoikesu là nguồn tư nhân — đối chiếu chính sử |
| Anh hùng LLVT / Mẹ VNAH | Bộ Quốc phòng, qdnd.vn, cổng TTĐT từng tỉnh | — | ❌ Chưa fetch — follow-up theo tỉnh |
| Biển số xe | Thông tư 79/2024/TT-BCA, Phụ lục 2 | thuvienphapluat.vn (summary) | ⚠️ Biển cũ vẫn hợp lệ (grandfathered) — cần toggle trước/sau |
| Mã bưu chính | mabuuchinh.vn (Bộ KH&CN); QĐ 2334/QĐ-BKHCN | mabuuchinh.vn | ✅ Chính thức, có PDF tải về |
| Văn hoá (đặc sản, trang phục, kiến trúc, phương ngữ) | Cục Di sản văn hóa (dsvh.gov.vn), Sở VHTTDL từng tỉnh, vietnam.travel | — | ❌ Cần pass riêng theo tỉnh |

## Geodata

| Dataset | Phạm vi | License | Trạng thái |
|---|---|---|---|
| GADM v4.1 | Trước 2025, level 0–2 | Academic/non-commercial, cấm redistribute | ✅ reachable — ❌ license không phù hợp repo mở |
| Open Development VN (MONRE) | Có Hoàng Sa & Trường Sa | CC-BY-SA-4.0 | ✅ nhưng dữ liệu 2009–2016 (chỉ dùng cho thời kỳ cũ) |
| **nguyenduy1133/Free-GIS-Data** | **63 VÀ 34 tỉnh, có Hoàng Sa/Trường Sa** | "please cite repo" | ✅ Ứng viên chính cho 34 tỉnh; đối chiếu NQ 202/2025/QH15 |
| ThangLeQuoc/vietnamese-provinces-database | 34 tỉnh, 3.321 xã/phường | MIT | ✅ Tốt cho tên đơn vị hành chính |
| OSM (Overpass, admin_level=4) | Cập nhật liên tục | ODbL | Nguồn "sống" nhanh nhất; query: `area["ISO3166-1"="VN"]->.vn; rel(area.vn)[admin_level=4]; out geom;` |
| HDX/OCHA COD-AB | Level 0–2 | — | ⚠️ Fetch fail — verify lại |

**Đường dẫn dẫn xuất nếu thiếu 34-tỉnh chuẩn:** dissolve polygon 63 tỉnh theo bảng sáp nhập trong NQ 202/2025/QH15 (ground truth).

## Tuân thủ pháp lý & chủ quyền
- **Luật Đo đạc và bản đồ 2018 (27/2018/QH14)** — congbao.chinhphu.vn ✅.
- Hoàng Sa, Trường Sa **bắt buộc** hiển thị thuộc Việt Nam trên mọi bản đồ, mọi thời kỳ. Mức phạt tham khảo: 30–40 triệu đ (bản đồ thiếu/sai), 40–50 triệu đ (xuất nhập khẩu sản phẩm sai chủ quyền) — xác minh lại full-text trước khi công bố claim.
- Checklist trước publish: kiểm tra từng layer (GADM/OSM/GitHub) hiển thị đúng hai quần đảo.

## Follow-up
1. Fetch danhmuchanhchinh.gso.gov.vn + bản gốc TT 79/2024/TT-BCA.
2. Pass văn hoá theo tỉnh (Sở VHTTDL, Cục Di sản).
3. Retry HDX + Niên giám GSO; tìm file crosswalk 63→34 chính thức.
