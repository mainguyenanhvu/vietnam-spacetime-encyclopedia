# Nguồn ngoài do chủ dự án chia sẻ

Nơi lưu vĩnh viễn các link chủ dự án gửi trong quá trình làm việc. Không xoá mục nào khỏi file này — nếu một nguồn hết giá trị thì đánh dấu ⛔ kèm lý do, giữ nguyên dòng.

## 2026-08-03 — chiến dịch 8 hạng mục

| # | Nguồn | URL | Dùng cho | Trạng thái |
|---|---|---|---|---|
| 1 | PageIndex — VectifyAI | https://github.com/VectifyAI/PageIndex | Học cách tổ chức files + folders + memory/index, áp dụng cho repo | 🔄 đang nghiên cứu |
| 2 | Google Sheet (htmlview, công khai) | https://docs.google.com/spreadsheets/d/1OFqIrxXHR-fY58NH4c272o9pNHPhlQcBrVhwuq9vcs0/htmlview | Gom nội dung vào cơ sở dữ liệu dự án | 🔄 đang đọc |

### Ghi chú kỹ thuật

- Sheet ID: `1OFqIrxXHR-fY58NH4c272o9pNHPhlQcBrVhwuq9vcs0`
- Xuất CSV một tab: `https://docs.google.com/spreadsheets/d/1OFqIrxXHR-fY58NH4c272o9pNHPhlQcBrVhwuq9vcs0/export?format=csv&gid=<GID>`
- Xuất toàn bộ dạng xlsx: `.../export?format=xlsx`

---

## 2026-09-19 — chiến dịch học bản đồ lịch sử: 2 nguồn chủ dự án gửi + 20 nguồn tự tìm

**Mức xác minh** — đọc cột này trước khi tin một dòng:
`✅ tự kiểm` = phiên chính tự gọi API / mở trang · `📋 agent` = agent nghiên cứu mở trang rồi báo cáo · `⚠️ chưa kiểm` = chưa ai mở.

### A. Hai nguồn chủ dự án gửi

| Nguồn | Phán quyết | Vì sao | Mức |
|---|---|---|---|
| [soiqualang/vietnam_map_history](https://github.com/soiqualang/vietnam_map_history) | ⛔ **KHÔNG dùng dữ liệu** | `license: null` → mặc định giữ toàn quyền. Bỏ hoang từ 2021-02-23, demo `dev.dothanhlong.org` chết (ECONNREFUSED). 2 sao, 0 fork. | ✅ tự kiểm |
| [maparchive.vn](https://maparchive.vn/) · [lqtue/vietnam-map-archive](https://github.com/lqtue/vietnam-map-archive) | ⛔ **KHÔNG làm `sources[]`** · ✅ dùng làm công cụ tra | Dự án tình nguyện cá nhân, không cơ quan nhà nước / đại học. Mã MIT, push 2026-09-18 nên vẫn sống. Giá trị thật: nó trỏ về 4 kho có định danh. | ✅ tự kiểm (license, ngày push) |

**`vietnam_map_history` thật sự là gì** (tên gọi đánh lừa): một tệp `1vn_tinh_full_dis.geojson` 288 feature = ranh giới tỉnh **ngày nay**, thuộc tính chỉ có `ten_vi` / `ten_eng` / `igds_color` — **không năm, không nguồn**; cộng 72 ảnh atlas quét georef bằng GDAL rồi phục vụ qua GeoServer ImageMosaic + WMS TimeDimension. Tức **"lật ảnh raster theo năm"**, không phải polygon tra cứu được thuộc tính theo thời kỳ. 📋 agent

- ❌ **Thiếu hẳn Hoàng Sa – Trường Sa** trong dữ liệu lẫn mã. Trượt bất biến #1. Không nhập nguyên trạng trong mọi trường hợp. 📋 agent *(agent tự hạ mức khẳng định vì tệp 1,38 MB có thể bị công cụ cắt — nhưng không có dấu hiệu ngược lại)*
- ❌ Không dẫn nguồn từng tấm; README chỉ nhắc `lichsunuocvietnam.com`, `trithucvn.net`. Trượt bất biến #3.
- ✅ **Thứ lấy được**: công thức georef `gdal_translate -gcp ×5 … | gdalwarp -r near -tps`. Kèm một bài học ngược về kiến trúc.

**`maparchive.vn` — cái đáng lấy và cái đã đóng:**

- ✅ **Bốn kho gốc nó tổng hợp lại** (đây mới là mỏ; trỏ `sources[]` về đây, không trỏ về maparchive): **BnF Gallica** 468 bản ghi · **Humazur** (Université Côte d'Azur) 2.827 · **David Rumsey** 53 · **Library of Congress** 48. 📋 agent
- ✅ Nội dung kho: bản đồ đô thị Pháp thuộc (Sài Gòn, Huế, Hà Nội, Hải Phòng, Đà Nẵng) · địa hình 1:25.000 Bắc Kỳ – Thanh Hoá (1903–1943) · 1:50.000 quân đội Mỹ (1966–1984). Niên đại 1799–1989.
- ⛔ **VỈA ĐÃ ĐÓNG — không có một tư liệu Hoàng Sa / Trường Sa nào.** Kiểm ba đường độc lập: sitemap hơn 1.000 URL không khớp từ khoá nào · blog pipeline không nhắc · gọi thẳng `https://maparchive.vn/api/search?q=hoang+sa` trả `"total":{"maps":0,...}`. **Đừng cử agent vào đây tìm chủ quyền.** 📋 agent
- ⚠️ Số tổng bản đồ **vênh giữa 3 trang cùng site**: 514 (changelog) / 536 (blog) / 583 (trang chủ). Trích thì kèm trang + ngày truy cập, đừng chọn một số.
- ⚠️ Bản quyền tách **ba lớp**: mã MIT · dữ liệu archive CC-BY-4.0 · **ảnh quét gốc theo quyền viện lưu trữ gốc** (phải tra riêng từng viện).

### B. Kỹ thuật học được — đã đối chiếu với kho hiện tại

| Kỹ thuật của họ | Phán quyết cho dự án này |
|---|---|
| **Layer Stack** — chồng nhiều lớp, 3 chế độ Stacked / Lens / Side-by-side, opacity từng lớp, nhớ trạng thái vào localStorage | ✅ **Đáng làm.** Hiện `bandoco.ts` chỉ có một tấm phủ + một thanh mờ. |
| **GCP propagation** — georef ~10% tấm "hạt giống" rồi lan affine sang tấm liền kề, sai số dưới 1% trên chuỗi 500 tấm, có xử lý đổi datum | ❌ **Không áp được.** Kho ta là 19 tấm **rời rạc** trải 1490–1905, không phải chuỗi lưới đều. Ghi lại để khỏi ai đi làm. |
| **IIIF + deep zoom** (mỗi tấm một image service) | 🤔 Đáng, nhưng vướng phụ thuộc — xem mục D. |
| **Six-layer spatial model** (L1 bản đồ lịch sử → L6 chú thích cộng đồng) | 🤔 Liên quan `models3d` / `landmarks3d`, chưa xét kỹ. |

### C. Nguồn tự tìm — đã gọi `api.github.com` xác minh

**Ranh giới hành chính VN** — ⚠️ *kho ta đã có đủ 3 tệp ranh giới, và cả ba đều mang feature riêng «Quần đảo Hoàng Sa» + «Quần đảo Trường Sa» (đo 2026-09-19). Nhóm này để đối chiếu, không phải để thay.*

| Repo | License | Sao | Chủ quyền | Ghi chú |
|---|---|---|---|---|
| [thanglequoc/vietnamese-provinces-database](https://github.com/thanglequoc/vietnamese-provinces-database) | MIT | 1.798 | ⚠️ **chưa kiểm** | 34 tỉnh 2025 + 3.321 xã/phường; gốc là bản đồ NXB Tài nguyên Môi trường & Bản đồ VN. **Phải tự mở geojson Đà Nẵng / Khánh Hoà đo bbox trước khi dùng.** |
| [nguyenduy1133/Free-GIS-Data](https://github.com/nguyenduy1133/Free-GIS-Data) | ⚠️ **không có** | 24 | ✅ README nêu rõ có Paracel + Spratly | Không license → không nhập. |
| [adminvsrm/GISData](https://github.com/adminvsrm/GISData) | ⚠️ **không có** | 8 | ✅ README nêu rõ có | Không license → không nhập. |
| [wmgeolab/geoBoundaries](https://github.com/wmgeolab/geoBoundaries) | CC-BY 4.0 | 409 | ⚠️ chưa kiểm (Git LFS) | Chuẩn học thuật, ADM0–ADM2 toàn cầu. |

**Bản đồ lịch sử / gazetteer**

| Repo | License | Sao | Ghi chú |
|---|---|---|---|
| [aourednik/historical-basemaps](https://github.com/aourednik/historical-basemaps) | **GPL-3.0** (copyleft) | 814 | GeoJSON biên giới theo năm mốc, có trường `BORDERPRECISION`. ⚠️ Tỉ lệ toàn cầu → **nhiều khả năng không vẽ nổi đảo nhỏ**. GPL trên dữ liệu là nghĩa vụ phải cân nhắc trước. |
| [WorldHistoricalGazetteer/gazetteer-of-the-world](https://github.com/WorldHistoricalGazetteer/gazetteer-of-the-world) | BSD-3-Clause | 1 | Địa danh lịch sử dạng **ĐIỂM** kèm mốc thời gian — hợp để đối chiếu tên địa danh cổ, không thay được lớp ranh giới. |
| OpenHistoricalMap | ⚠️ license tầng dữ liệu chưa tự kiểm | — | ⚠️ **Họ tự thừa nhận chưa giải xong bài toán vùng tranh chấp** (issue #553). Là bài học cảnh báo, không phải khuôn mẫu để sao chép. |

**Dữ liệu VN máy đọc được**

| Repo | License | Sao | Ghi chú |
|---|---|---|---|
| [daohoangson/dvhcvn](https://github.com/daohoangson/dvhcvn) | GPL-3.0 | 338 | 3 cấp hành chính từ Tổng cục Thống kê, push 2026-09-19. Chỉ tên / mã, không geometry. |
| [ds4v/NomNaOCR](https://github.com/ds4v/NomNaOCR) | MIT | 148 | **2.953 trang chữ Nôm** đã gán nhãn — gồm **Đại Việt Sử Ký Toàn Thư**, Truyện Kiều (3 bản), Lục Vân Tiên. Đáng xét cho lớp văn tịch. |
| [dvhcvn/data](https://github.com/dvhcvn/data) | ⚠️ không có | 6 | Đơn vị hành chính **qua từng năm** — đúng nhu cầu dò tách / nhập, nhưng **không có geometry**. |
| [madnh/hanhchinhvn](https://github.com/madnh/hanhchinhvn) | ⚠️ không có | 402 | ⛔ Ngừng cập nhật từ 2023-08, không theo kịp sáp nhập 2025. |

**Thư viện bản đồ – thời gian**

| Repo | License | Sao | Hợp MapLibre 4.7.1? |
|---|---|---|---|
| [allmaps/allmaps](https://github.com/allmaps/allmaps) (`@allmaps/maplibre`) | repo `null` · gói npm **MIT** | 141 | ❌ **KHÔNG** — gói đòi `maplibre-gl: ^5.16`, và còn ở **beta** (`1.0.0-beta.43`). ✅ tự kiểm qua npm registry. |
| [maplibre/maplibre-gl-compare](https://github.com/maplibre/maplibre-gl-compare) | ISC | 55 | ✅ chính chủ MapLibre, nhưng push cuối 2023-01. Cần **2 instance bản đồ**. |
| [opengeos/maplibre-gl-swipe](https://github.com/opengeos/maplibre-gl-swipe) | MIT | 9 | ✅ push 2026-09-16, năng động hơn bản chính chủ. |
| [opengeos/maplibre-gl-time-slider](https://github.com/opengeos/maplibre-gl-time-slider) | MIT | 7 | ✅ push 2026-09-04. Ta đã tự có thanh thời gian — chỉ để tham khảo. |
| [OpenHistoricalMap/maplibre-gl-dates](https://github.com/OpenHistoricalMap/maplibre-gl-dates) | **CC0-1.0** | 16 | ✅ push 2026-09-14. Lọc lớp theo ngày. ✅ tự kiểm. |

### D. ⛔ Đã loại và vì sao — đừng mở lại nếu không có dữ kiện mới

- **GADM** — license chỉ cho phi thương mại **và cấm phân phối lại**. Repo này lưu GeoJSON tĩnh công khai → vi phạm ngay từ đầu.
- **`@allmaps/maplibre`** — ✅ tự kiểm: đòi `maplibre-gl ^5.16`, ta ghim 4.7.1. Nhập nó = ép nâng major MapLibre, kéo theo 5 gói beta. **Không đáng** — MapLibre đã có sẵn source `image` nhận 4 góc, và `src/bandoco.ts` đang chạy đúng cơ chế đó. **Thiếu là DỮ LIỆU, không phải thư viện.**
- **Chronas** — không license, tự nhận là bản beta viết lại lần 2.
- **GeaCron** — không mã nguồn mở, không có repo để kiểm.
- **Leaflet-IIIF** — chỉ chạy trên Leaflet.
- **maparchive.vn cho tư liệu Hoàng Sa / Trường Sa** — kiểm 3 đường, đều 0. Xem mục A.

### E. Việc còn để ngỏ

- Tự tải geojson Đà Nẵng / Khánh Hoà của `thanglequoc/vietnamese-provinces-database` đo bbox xác nhận hai quần đảo — bước chặn trước khi nhập bất kỳ ranh giới nào.
- Gallica: endpoint SRU trả **403** khi agent gọi thô. Phải thử qua giao diện web hoặc IIIF manifest trực tiếp. **403 là triệu chứng của công cụ, không phải bằng chứng kho rỗng** (bẫy đã ghi ở `PLAN.md`).
