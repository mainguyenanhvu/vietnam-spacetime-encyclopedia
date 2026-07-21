# Đề xuất mô hình dữ liệu: "Tên đường/phố đặt theo danh nhân"

## 1. Vấn đề & mục tiêu

Dự án hiện có ~1183 danh nhân trong `public/data/overlays/*.json` (mỗi mục: `id`, `ten`, `lon`, `lat`, `mo_ta`, `nguon`, ...). Yêu cầu: hiển thị **các con đường/phố VN đặt theo tên danh nhân**, liên kết ngược tới mục danh nhân tương ứng (VD: click "Lê Lợi" → thấy danh sách/bản đồ các đường "Lê Lợi" trên cả nước).

Ràng buộc cứng:
- Site tĩnh (Vite + TS + MapLibre), host GitHub Pages, **$0**, không backend.
- Mọi dữ liệu phải build sẵn thành JSON tĩnh, dung lượng phải hợp lý cho GitHub Pages.
- Vấn đề khớp N-N: một tên (VD "Trần Hưng Đạo") tồn tại ở hàng chục tỉnh/thành, mỗi đường lại gồm nhiều đoạn (way) trong OSM.

## 2. Khảo nguồn dữ liệu — kết quả THẬT đã kiểm chứng

### 2.1 OpenStreetMap / Overpass API — khả thi, đã fetch thành công

Thử 3 lần qua WebFetch:

1. `overpass-api.de` với truy vấn dùng `area["name"="Hà Nội"]` → **504 Gateway Timeout** (truy vấn `area` phải geocode trước, chậm/hay time out qua WebFetch).
2. `overpass-api.de` với bbox trực tiếp quanh Hà Nội, tên "Lê Lợi" → trả về JSON hợp lệ nhưng `elements: []` (rỗng — Hà Nội không có nhiều đường tên này, hoặc bbox chưa trúng).
3. `overpass.kumi.systems` (mirror) với bbox quanh trung tâm TP.HCM, tên "Lê Lợi" → **thành công**, trả về 24 phần tử `way`. Ví dụ 1 phần tử thật:

```json
{
  "type": "way",
  "id": 35114072,
  "bounds": {
    "minlat": 10.7719661,
    "minlon": 106.6989634,
    "maxlat": 10.7731147,
    "maxlon": 106.7000909
  },
  "tags": {
    "highway": "tertiary",
    "lanes": "2",
    "name": "Lê Lợi",
    "oneway": "yes",
    "surface": "asphalt"
  }
}
```

**Kết luận khảo sát:**
- Overpass **khả thi**, trả JSON có cấu trúc ổn định: `elements[]` mỗi phần tử có `type`, `id`, `bounds`, `tags{highway, name, ...}`, và nếu dùng `out geom;` sẽ có thêm mảng toạ độ đường (`geometry` hoặc `nodes`+geom lồng trong `out geom`).
- **1 con đường thực tế = NHIỀU way segments** trong OSM (đây là 24 đoạn cho ~1.2 km đường Lê Lợi, HCM) → bắt buộc phải gộp (group by `name` + khu vực hành chính) khi build, không dùng thẳng 1 way = 1 đường.
- Endpoint `overpass-api.de` chính hay time out với query lớn/`area`; mirror `overpass.kumi.systems` phản hồi tốt hơn trong lần thử này. Nên thử nhiều mirror + retry khi build thật (danh sách mirror công khai: overpass-api.de, overpass.kumi.systems, lz4.overpass-api.de, overpass.openstreetmap.ru...).
- **Giấy phép: ODbL** (Open Database License) — response Overpass tự kèm dòng: *"The data included in this document is from www.openstreetmap.org. The data is made available under ODbL."* → bắt buộc ghi nguồn "© OpenStreetMap contributors" + link giấy phép ODbL ở phần nguồn/footer nếu dùng dữ liệu này, tương tự cách trang đang ghi `nguon` cho các overlay khác.

### 2.2 Cổng HĐND / nghị quyết đặt tên đường

Không có API tập trung, mỗi tỉnh/thành ra nghị quyết riêng dạng PDF/văn bản rời rạc → **không khả thi để tự động hoá** trong phạm vi dự án này. Có thể dùng làm nguồn tham chiếu thủ công sau này cho một số trường hợp nổi bật, không phải nguồn chính.

### 2.3 Rủi ro đã xác định

- **Độ phủ OSM ở VN không đều**: tốt ở trung tâm TP lớn (HCM, Hà Nội, Huế, Đà Nẵng), thưa ở thị trấn nhỏ/nông thôn → danh sách "đường mang tên X" sẽ thiên lệch về đô thị lớn, không đại diện đầy đủ thực tế ngoài đời.
- **Khớp tên**: cần chuẩn hoá bỏ dấu, bỏ tiền tố "Đường/Phố/Phường", xử lý trùng tên với địa danh không phải người (VD "Hai Bà Trưng" là tên đôi, "Bà Triệu" ok, nhưng vài tên trùng với địa danh/khái niệm chung chung — cần whitelist thủ công cho các trường hợp mơ hồ).
- **Trùng lặp/nhiễu OSM**: sai chính tả, viết tắt khác nhau ("Trần Hưng Đạo" vs "Tran Hung Dao" vs "Đường Trần Hưng Đạo"), đường đổi tên nhưng OSM chưa cập nhật.
- **Dung lượng**: nếu tải geometry đầy đủ (mọi toạ độ từng đoạn đường) cho hàng trăm danh nhân trên cả nước, dữ liệu có thể lên hàng chục MB — không hợp lý cho GitHub Pages nếu bundle chung vào build chính.
- **Overpass usage policy**: không nên gọi Overpass trực tiếp từ trình duyệt người dùng lúc runtime (rate limit công cộng, không đảm bảo uptime cho production) — chỉ nên dùng Overpass ở **bước build offline**, kết quả đóng gói thành JSON tĩnh commit vào repo.

## 3. Phương án mô hình dữ liệu

### Phương án A — Bảng liên kết thống kê (danh_nhan_id ↔ danh sách đường, không lưu hình học)

Build offline: với mỗi danh nhân, query Overpass theo tên (chuẩn hoá), gộp các way cùng tên trong cùng 1 tỉnh/thành thành "1 con đường", chỉ lưu **1 điểm centroid đại diện** + tên tỉnh/thành + số đoạn.

```json
{
  "danh_nhan_id": "le-loi",
  "duong": [
    { "tinh_thanh": "TP. Hồ Chí Minh", "ten_duong_osm": "Lê Lợi", "so_doan": 24, "lon": 106.6995, "lat": 10.7725 },
    { "tinh_thanh": "Hà Nội", "ten_duong_osm": "Lê Lợi", "so_doan": 3, "lon": 105.85, "lat": 21.02 }
  ],
  "nguon": "© OpenStreetMap contributors, ODbL — https://www.openstreetmap.org/copyright"
}
```

- **Build**: script Node/Python offline, gọi Overpass theo từng tên danh nhân (đã chuẩn hoá) trên toàn quốc, gộp theo `name` + tỉnh chứa bbox, tính centroid = trung bình toạ độ.
- **Ưu**: nhẹ nhất (mỗi mục vài trăm byte), không cần vẽ line, tái dùng đúng format point overlay hiện có (`id/ten/lon/lat`) → hiển thị như 1 pin phụ hoặc chỉ liệt kê text "X con đường mang tên [Y] tại: TP.HCM, Hà Nội...".
- **Nhược**: không có hình dạng thật của đường trên bản đồ, chỉ là điểm đại diện.
- **Dung lượng ước tính**: ~1183 danh nhân, giả sử ~30–40% có đường trùng tên (tên phổ biến, thường là nhân vật rất nổi tiếng) → ~400 người × trung bình 3–5 thành phố → ~1500–2000 bản ghi × ~150 byte ≈ **250–350 KB tổng**. Rất nhẹ.
- **Công sức**: trung bình — 1 script build (Overpass batch + chuẩn hoá tên + gộp centroid), 1 lượt review thủ công tên mơ hồ.

### Phương án B — Lớp GeoJSON hình học đầy đủ (vẽ đường thật trên bản đồ)

Build offline: query Overpass `out geom;` lấy toàn bộ toạ độ từng way, gộp thành LineString/MultiLineString theo tên+khu vực, xuất GeoJSON layer riêng, thêm `properties.danh_nhan_id` để link.

- **Ưu**: trực quan nhất — vẽ được đúng hình dạng con đường trên bản đồ MapLibre, cảm giác "bách khoa bản đồ" đúng nghĩa.
- **Nhược**:
  - Dung lượng lớn hơn nhiều bậc — mỗi con đường thật có thể vài trăm điểm toạ độ; nhân với hàng trăm danh nhân × nhiều đoạn/thành phố → dễ vượt vài chục MB nếu không simplify.
  - Cần thêm bước simplify hình học (Douglas-Peucker qua turf.js/mapshaper) để giảm số điểm, tăng độ phức tạp build.
  - Cần tách file theo layer/khu vực và lazy-load (không nhét vào bundle chính) để tránh chậm trang.
  - Công sức build cao hơn hẳn: gộp topology các way liền kề đúng thứ tự, xử lý đường đứt đoạn qua giao lộ.
- **Công sức**: cao — cần thêm pipeline simplify + lazy-load layer theo viewport/zoom.

### Phương án C — Chỉ số thống kê thuần (không có toạ độ, chỉ đếm)

Build offline: đếm số đường trùng tên qua Overpass, chỉ lưu con số + danh sách tên tỉnh/thành dạng text, không có toạ độ, không vẽ gì trên bản đồ.

```json
{ "danh_nhan_id": "le-loi", "so_duong": 27, "tinh_thanh": ["TP.HCM", "Hà Nội", "Huế", "..."] }
```

- **Ưu**: nhẹ nhất tuyệt đối (vài chục byte/người), build đơn giản nhất (không cần gộp centroid, không cần xử lý toạ độ).
- **Nhược**: mất hoàn toàn giá trị "bản đồ" — chỉ là 1 dòng text kiểu "Có 27 đường mang tên Lê Lợi trên cả nước tại: ...". Không tận dụng được thế mạnh MapLibre của dự án.
- **Công sức**: thấp nhất.

## 4. Khuyến nghị

**Chọn Phương án A (bảng liên kết + centroid đại diện)** làm bản build đầu tiên (v1):

- Cân bằng tốt nhất giữa giá trị hiển thị (vẫn có pin trên bản đồ, vẫn liên kết được danh nhân ↔ thành phố có đường mang tên) và chi phí (dung lượng nhẹ, build đơn giản, tái dùng format overlay có sẵn).
- Phương án C quá nghèo nàn cho một dự án bản đồ; Phương án B đúng đắn về mặt trực quan nhưng chi phí/rủi ro dung lượng + độ phức tạp build không tương xứng với giá trị tăng thêm ở giai đoạn này — có thể để làm **giai đoạn 2** (nâng cấp từ A lên B cho một số danh nhân/thành phố tiêu biểu, tải GeoJSON riêng theo yêu cầu — lazy load khi người dùng zoom vào 1 thành phố cụ thể, không bundle toàn quốc).

### Các bước triển khai nếu Iron Man đồng ý phương án A

1. **Trích & chuẩn hoá tên**: quét toàn bộ `public/data/overlays/*.json`, lấy `ten`, chuẩn hoá bỏ dấu + loại các phần phụ (chức danh, năm sinh/mất) để ra "tên đường có thể" cho từng danh nhân. Review thủ công loại bỏ tên trùng với danh từ chung/địa danh (VD tên quá phổ biến không đặc trưng).
2. **Build script offline** (Node hoặc Python, không chạy trong browser):
   - Với mỗi tên đã chuẩn hoá, gọi Overpass (`way["highway"]["name"="..."]` toàn quốc hoặc theo từng vùng để tránh timeout), có retry + xoay vòng qua nhiều mirror.
   - Gộp các `way` cùng `name` nằm trong cùng 1 tỉnh/thành (reverse-geocode centroid bbox qua Nominatim hoặc bảng ranh giới tỉnh có sẵn) → 1 bản ghi "1 con đường tại 1 tỉnh".
   - Tính centroid = trung bình toạ độ bbox các way trong nhóm.
   - Tôn trọng usage policy Overpass: giãn cách request (không song song ồ ạt), chạy 1 lần offline, cache kết quả thô trước khi xử lý tiếp.
3. **Xuất JSON tĩnh** theo cấu trúc mục 3 (Phương án A), 1 file gộp hoặc chia theo nhóm overlay hiện có, kèm `nguon: "© OpenStreetMap contributors, ODbL"`.
4. **UI**: trong popup/chi tiết danh nhân hiện có, nếu tồn tại bản ghi liên kết → hiển thị "N con đường mang tên [X] tại: [danh sách tỉnh/thành]" + (tuỳ chọn) render các centroid như 1 layer pin phụ có thể bật/tắt.
5. **QA thủ công**: rà một mẫu ngẫu nhiên (~30 danh nhân) đối chiếu thực tế để phát hiện match sai (tên trùng ngẫu nhiên, không phải do đặt theo danh nhân đó).

## 5. Trả lời nhanh cho Iron Man

- **OSM/Overpass khả thi?** Có — đã fetch thành công, ví dụ thật ở mục 2.1. Cần dùng mirror + bbox thay vì `area` để tránh timeout, và chỉ gọi ở bước build offline (không gọi runtime từ site production).
- **Phương án khuyến nghị:** A — bảng liên kết tĩnh + centroid đại diện (không vẽ hình học đầy đủ).
- **Rủi ro lớn nhất:** khớp tên sai/mơ hồ (tên phổ biến trùng địa danh, viết tắt khác nhau trong OSM) — cần 1 vòng review thủ công sau khi build tự động, không thể tin tưởng 100% tự động.
