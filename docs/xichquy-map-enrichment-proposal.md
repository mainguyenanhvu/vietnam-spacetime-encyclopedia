# Đề xuất làm giàu lớp «Cương vực Việt cổ» (Xích Quỷ → Văn Lang → Âu Lạc)

## 0. Bối cảnh

Lớp «Cương vực Việt cổ» đã có trong `public/data/geo/co-truong-viet-co.json` (commit 613601b, 2026-07-19), phủ 4 thời kỳ: Xích Quỷ, Văn Lang, Âu Lạc, Vạn Xuân — mỗi thời kỳ 1 polygon phỏng dựng thô, có `muc_do_tin_cay` (huyen-su/su-lieu), `nguon`, cảnh báo "KHÔNG phải bản đồ chủ quyền". Chất lượng nền đã tốt. Tài liệu này khảo cứu thêm để **làm giàu** (không thay thế) lớp đó — dựa trên các nguồn thật đã fetch (KHÔNG Wikipedia, dùng `html.duckduckgo.com`/`lite.duckduckgo.com` để tìm URL rồi WebFetch trực tiếp trang nguồn).

**Ràng buộc §1 (Chủ quyền)** của dự án: Hoàng Sa & Trường Sa thuộc Việt Nam phải hiển thị nhất quán mọi lớp, mọi thời kỳ. Cương vực cổ trong tài liệu này **chỉ mang tính minh hoạ giáo dục về lịch sử/huyền sử**, không phải và không được dùng làm căn cứ cho bất kỳ yêu sách/tuyên bố lãnh thổ hiện đại nào — kể cả khi mô tả huyền sử ghi cương vực Xích Quỷ rộng tới Động Đình Hồ, Ba Thục (nay thuộc Trung Quốc).

## 1. Tóm tắt 3 thời kỳ + tính chất nguồn

| Thời kỳ | Niên đại (theo sử/huyền sử) | Tính chất | Độ tin cậy cương vực |
|---|---|---|---|
| **Xích Quỷ** (Kinh Dương Vương) | ĐVSKTT gán ≈2879 TCN | **Huyền sử** — tên "Xích Quỷ" **không xuất hiện trong bất kỳ sử liệu nào trước năm 1479**; lần đầu ghi trong ĐVSKTT của Ngô Sĩ Liên | Rất thấp — ranh giới "đông giáp Nam Hải, tây giáp Ba Thục, bắc giáp Động Đình Hồ, nam giáp Hồ Tôn" bị nhiều nhà nghiên cứu cho là **trùng địa bàn nước Sở thời Xuân Thu–Chiến Quốc**, không phải cương vực một nhà nước Việt cổ có thật |
| **Văn Lang** (Hùng Vương) | ≈TK VII TCN – 258 TCN | **Dã sử/truyền thuyết có cốt lõi khảo cổ** — khớp văn hoá Đông Sơn (đồng thau, trống đồng) | Trung bình — có sử liệu nhất quán (Việt sử lược, ĐVSKTT, VN sử lược) về việc **chia 15 bộ**, nhưng ranh giới đường biên ngoài + tên đủ 15 bộ chưa được kiểm chứng qua nguồn phi-Wikipedia trong đợt khảo cứu này |
| **Âu Lạc** (An Dương Vương) | ≈257–179 TCN | **Sử liệu có bằng chứng khảo cổ vững** cho **trung tâm chính trị** (thành Cổ Loa) | Cao cho vị trí + quy mô thành Cổ Loa (đo đạc khảo cổ cụ thể); vẫn thấp cho đường biên toàn lãnh thổ Âu Lạc (đặc biệt phần sáp nhập Âu Việt) |

## 2. Mô tả cương vực theo nguồn đã fetch thật

### 2.1 Xích Quỷ — vì sao nên siết chặt cảnh báo hơn nữa

Nguồn: `tailieu.vn/doc/nuoc-xich-quy-viet-so-nghi-van-nguon-goc-601088.html` ("Nước Xích Quỷ — Việt - Sở, những nghi vấn nguồn gốc").

- Luận điểm chính: *"địa bàn 'nước' Xích Quỷ chính là địa bàn của khối Bách Việt ở phía Nam sông Dương Tử"* — tức bản thân mô tả 4 mốc biên giới nhiều khả năng là **vay mượn địa giới nước Sở** (thời Xuân Thu–Chiến Quốc), không phải ghi chép về một quốc gia Việt cổ có ranh giới thật.
- Quan trọng hơn: tài liệu chỉ ra **các bộ sử Việt trước năm 1479 (trước ĐVSKTT của Ngô Sĩ Liên) không hề nhắc tới Xích Quỷ** — cho thấy đây là chi tiết được bổ sung muộn vào chính sử.
- Phả hệ Đế Minh → Kinh Dương Vương → Lạc Long Quân được cho là bắt nguồn từ **truyền thuyết dân gian Mường**, mang tính biểu tượng giải thích nguồn gốc dân tộc hơn là ghi chép địa lý.

→ Đây là dữ kiện **mạnh hơn** những gì `ghi_chu` hiện tại của `xich-quy` đang nêu (hiện chỉ nói "có nghiên cứu cho rằng trùng địa giới nước Sở", chưa nêu điểm "không xuất hiện trước 1479"). Nên bổ sung câu này vào `ghi_chu` khi có dịp sửa file chính (xem §4).

Đối chiếu thêm nguồn `vinadia.org` (Trần Trọng Kim, *Việt Nam sử lược*, Họ Hồng Bàng) — mô tả 4 mốc *"phía bắc tới sông Dương Tử (cả vùng hồ Động Đình), phía nam tới nước Hồ Tôn (Chiêm Thành), phía đông là Đông Hải, phía tây là Ba Thục"* — khớp với `ghi_chu` hiện có, xác nhận đây là công thức được lặp lại xuyên suốt các bộ sử/dã sử VN kể từ ĐVSKTT, không phải một khảo sát địa lý độc lập.

### 2.2 Văn Lang — xác nhận "15 bộ" nhưng CHƯA xác minh được danh sách 15 tên

Nguồn: `vinadia.org` (Trần Trọng Kim) + PDF `thuvienbinhduong.org.vn/.../NƯỚC VĂN LANG – VUA HÙNG HAY HÙNG VƯƠNG.pdf`.

- Cả hai nguồn xác nhận Hùng Vương *"chia nước ra làm 15 bộ"*, ranh giới ngoài mô tả ước lệ theo 4 hướng (đông/nam giáp biển, tây/bắc giáp núi/Ba Thục) — **không nguồn nào trong đợt khảo cứu này liệt kê đủ tên 15 bộ** kèm dẫn chứng đáng tin (chỉ tìm thấy 1 bài blog cá nhân liệt kê tên — không đạt chuẩn nguồn "chính sử + cổng nhà nước + học giả" của dự án nên **không dùng**).
- Khuyến nghị: **chưa vẽ ranh giới 15 bộ lên bản đồ** ở đợt này. Muốn làm, cần tra trực tiếp nguyên văn ĐVSKTT Ngoại kỷ (bản dịch Viện Sử học) hoặc Lĩnh Nam chích quái — việc này cần fetch từ một bản dịch có chú giải học thuật, không phải blog, để tránh dựng ranh giới 15 vùng dựa trên nguồn không kiểm chứng được.

### 2.3 Âu Lạc / Cổ Loa — dữ liệu khảo cổ cụ thể, có thể làm giàu popup ngay

Nguồn: `baotanglichsuquocgia.vn/vi/Articles/3096/62046/thanh-co-loa-kinh-djo-nuoc-au-lac.html` (Bảo tàng Lịch sử Quốc gia) + `dsvh.gov.vn`, `sovhtt.hanoi.gov.vn`, `thanhcoloa.vn` (Sở VHTT Hà Nội / Cục Di sản văn hoá / cổng du lịch chính thức di tích).

Số liệu khảo cổ cụ thể (chưa có trong `ghi_chu` hiện tại, vốn chỉ nói chung "3 vòng thành, trống đồng, xưởng đúc mũi tên"):
- Thành **Ngoại**: chu vi hơn 8 km, cao trung bình 3–4 m.
- Thành **Trung**: chu vi 6,58 km, 5 cửa (Đông, Nam, Bắc, Tây Bắc, Tây Nam).
- Thành **Nội**: chu vi 1,65 km, hình chữ nhật, cao trung bình 5 m.
- Khu trung tâm hành chính lõi: **≈2 km²**.
- Bằng chứng đúc tại chỗ: khuôn đúc mũi tên đồng tìm thấy trong tầng văn hoá Cổ Loa (giai đoạn Đông Sơn sắt).
- Khu di tích được công nhận **Di tích Quốc gia đặc biệt**, vùng bảo vệ rộng **860,4 ha** (theo `thanhcoloa.vn`), thuộc Đông Anh, Hà Nội.

Các nguồn này **không** nói gì thêm về đường biên toàn lãnh thổ Âu Lạc ngoài vị trí Cổ Loa — xác nhận đúng cách diễn giải hiện tại của file: khảo cổ chỉ chứng minh vững chắc **trung tâm chính trị**, không chứng minh đường biên lãnh thổ.

## 3. Đề xuất cách làm giàu bản đồ

Ưu tiên theo độ tin cậy nguồn / rủi ro thấp → cao:

**A. (Khuyến nghị, rủi ro thấp) Thêm feature con "Cổ Loa — lõi di tích khảo cổ"**
- Một điểm/polygon nhỏ, riêng biệt, đặt **chồng lên** polygon "Âu Lạc" hiện có (không thay polygon cũ) — thể hiện tương phản rõ: vùng nhỏ có bằng chứng khảo cổ cụ thể (Cổ Loa) *bên trong* vùng lớn là phỏng dựng lãnh thổ (Âu Lạc).
- `muc_do_tin_cay: "trung-binh"` (khác 2 mức hiện có `huyen-su`/`su-lieu`) — vị trí Cổ Loa là địa điểm hiện đại có thật, không tranh cãi, nhưng polygon vẽ ở đây vẫn là ước lượng thô từ số đo chu vi thành (không phải toạ độ khảo sát GIS chính thức) nên không thể xếp "cao".
- Popup mang đúng số liệu ở §2.3 (3 vòng thành + chu vi + diện tích + 860,4 ha) — nội dung cụ thể hơn hẳn ghi chú chung hiện tại, giúp người dùng thấy rõ ranh giới "biết chắc" (Cổ Loa) khác ranh giới "phỏng đoán" (toàn Âu Lạc) như thế nào.
- Đã tạo **draft** `public/data/geo/xichquy-vanlang-aulac.draft.geojson` (xem §4) minh hoạ hình dạng dữ liệu đề xuất — **CẦN REVIEW toạ độ trước khi wire**, vì polygon dựng từ ước lượng chu vi thành, không phải khảo sát địa hình.

**B. (Khuyến nghị) Siết lại `ghi_chu` của Xích Quỷ trong file chính**
- Bổ sung câu: *"Tên 'Xích Quỷ' không xuất hiện trong sử liệu Việt trước năm 1479 — lần đầu được Ngô Sĩ Liên ghi vào ĐVSKTT; phả hệ Đế Minh–Kinh Dương Vương có gốc truyền thuyết dân gian Mường."* — nguồn `tailieu.vn` (mục §2.1). Đây là sửa **file chính** `co-truong-viet-co.json`, ngoài phạm vi task này (task chỉ cho phép nghiên cứu + draft), nên chỉ đề xuất ở đây để main/Iron Man cân nhắc khi wire.

**C. (Chưa làm — cần thêm nguồn) Lớp 15 bộ Văn Lang**
- KHÔNG khuyến nghị vẽ ở đợt này. Lý do: chỉ xác nhận được **số lượng** (15 bộ) qua nguồn đủ tin cậy, chưa xác nhận được **danh sách tên + vị trí từng bộ** qua nguồn đạt chuẩn dự án (chính sử/cổng nhà nước/học giả — không blog cá nhân, không Wikipedia).
- Việc cần làm trước khi thử lại: fetch trực tiếp bản dịch có chú giải của ĐVSKTT Ngoại kỷ hoặc Lĩnh Nam chích quái (qua thư viện số của Viện Nghiên cứu Hán Nôm/Thư viện Quốc gia nếu có bản online), thay vì tìm qua DuckDuckGo rồi lấy nguồn thứ cấp không rõ gốc.

**D. (KHÔNG khuyến nghị) Vẽ riêng lãnh thổ "Âu Việt" tiền sáp nhập**
- `ghi_chu` của Âu Lạc hiện tại đã nhắc Âu Việt (Việt Bắc: Cao Bằng, Lạng Sơn) sáp nhập vào Văn Lang. Vẽ polygon riêng cho Âu Việt sẽ đụng vùng địa lý trải sang **Quảng Tây (Trung Quốc) hiện đại** theo một số cách hiểu về Bách Việt/Âu Việt cổ — rủi ro chủ quyền/nhạy cảm chính trị cao hơn hẳn 3 thời kỳ đã có (vốn chỉ nằm gọn trong lãnh thổ VN hiện đại, trừ Xích Quỷ vốn đã có cảnh báo huyền sử rất rõ). Khuyến nghị: nếu làm, phải có disclaimer riêng mạnh hơn nữa và nên hỏi Iron Man trước, không tự ý thêm.

## 4. Draft GeoJSON đã tạo

File: `public/data/geo/xichquy-vanlang-aulac.draft.geojson` (đuôi `.draft.geojson` để không bị app/validator build đụng vào).

Nội dung: 1 Feature — "Cổ Loa — lõi di tích khảo cổ (An Dương Vương)", geometry Polygon nhỏ ước lượng quanh khu vực Cổ Loa (Đông Anh, Hà Nội — vị trí địa lý hiện đại có thật, không tranh cãi), `properties` gồm `ten`, `nien_dai`, `do_tin_cay: "trung-binh"`, `tinh_chat: "khảo cổ xác nhận trung tâm, ranh giới ước lượng"`, `nguon` (3 nguồn ở §2.3), `ghi_chu` (số đo 3 vòng thành + 860,4 ha + cảnh báo toạ độ ước lượng, không phải khảo sát GIS).

**CẦN REVIEW trước khi wire**: toạ độ polygon là ước lượng của tôi từ mô tả chu vi bằng chữ (không có toạ độ GIS chính thức trong 3 nguồn đã fetch) — nên coi là khung sườn minh hoạ, cần đối chiếu ảnh vệ tinh/bản đồ di tích chính thức (vd. bản đồ khoanh vùng bảo vệ kèm quyết định xếp hạng di tích) trước khi đưa vào production.

## 5. Rủi ro & khuyến nghị

- **Rủi ro sử liệu lớn nhất**: nếu wire thêm dữ liệu mà không giữ đúng phân tầng độ tin cậy (huyền sử/dã sử/sử liệu/khảo cổ), người xem dễ hiểu lầm toàn bộ 4 thời kỳ đều "chắc chắn như nhau" — nhất là Xích Quỷ, vốn có nguy cơ cao nhất do trùng lặp địa giới với nước Sở cổ và niên đại 2879 TCN là suy đoán muộn.
- **Rủi ro chủ quyền lớn nhất**: mô tả huyền sử Xích Quỷ có mốc "bắc giáp Động Đình Hồ, tây giáp Ba Thục" — các địa danh này nay thuộc Trung Quốc. Lớp bản đồ **phải** tiếp tục ghi rõ đây là biểu tượng huyền sử gốc Bách Việt, KHÔNG phải yêu sách lãnh thổ, và không được đặt cạnh/liên hệ trực tiếp với các lớp chủ quyền Hoàng Sa–Trường Sa theo cách gây hiểu lầm hai loại "ranh giới" tương đương nhau.
- **Khuyến nghị**: 
  - Mục A (Cổ Loa) — có thể wire sau khi Iron Man duyệt toạ độ polygon draft (rủi ro thấp, nguồn tốt).
  - Mục B (siết ghi_chu Xích Quỷ) — nên làm cùng lúc sửa file chính, rủi ro thấp, chỉ là thêm câu cảnh báo.
  - Mục C (15 bộ) — hoãn, cần vòng nghiên cứu nguồn khác trước.
  - Mục D (Âu Việt riêng) — không làm trừ khi Iron Man chỉ đạo rõ và chấp nhận rủi ro nhạy cảm.
- Toàn bộ mục A–D **chưa wire vào `src/main.ts`/`co-truong-viet-co.json`** theo đúng phạm vi task — chờ Iron Man duyệt.
