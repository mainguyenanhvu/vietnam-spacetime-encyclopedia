# Kiểm toán chất lượng toạ độ toàn DB (32 lớp / 1921 mục)

Trạng thái: CHỈ ĐO, KHÔNG SỬA. Không đụng `public/data/**`, không chạy git.
Dữ liệu máy đọc được: `toa-do-clusters.json` (cùng thư mục). Script đo: `toa_do_audit.mjs`, `analyze_placeholder_smell.mjs`, `find_cao_placeholder.mjs`, `crosstab_smelly.mjs`.

## 0. Cách đo
- Đọc toàn bộ 32 file overlay (UTF-8), lấy 1921/1921 mục có `lon`/`lat` số.
- Đối chiếu tỉnh bằng point-in-polygon (ray casting, xử lý cả lỗ khoét) trên `public/data/boundaries/vn-34-tinh-2025.geojson` (39 feature — một số tỉnh có 2 polygon: đất liền + cụm đảo).
- ⚠️ **Giới hạn quan trọng**: "tâm tỉnh" trong báo cáo này là **tâm hình hộp bao (bounding-box centroid)** của polygon — xấp xỉ thô, KHÔNG phải centroid diện tích chuẩn hay toạ độ hành chính chính thức. Chỉ đủ để phát hiện nghi vấn, không dùng để khẳng định một toạ độ "chắc chắn là placeholder".
- Cụm gần trùng dùng ngưỡng 500m, gộp bắc cầu (transitive) qua thuật toán union-find trên khoảng cách haversine.

## 1. CỤM TRÙNG CHÍNH XÁC (cùng lon/lat tuyệt đối)
**87 cụm / 209 mục** (tăng so với 112 cụm tôi báo hôm trước — con số cũ đó làm tròn 3 chữ số thập phân nên gộp nhầm vài điểm gần-nhưng-không-hệt vào; số 87 này là đo CHÍNH XÁC không làm tròn).

Phân tách bằng tín hiệu mới — so `dia_diem` (địa chỉ text) giữa các mục trong cùng cụm:
- **72 cụm / 155 mục — CÙNG 1 ĐỊA ĐIỂM THẬT**: các mục tả cùng một di tích/bảo tàng/quần thể (ví dụ 5 bảo vật quốc gia cùng khai quật ở Đông Sơn, 4 vua Lý cùng thờ ở Đền Đô). Toạ độ trùng là ĐÚNG, không phải lỗi.
- **15 cụm / 54 mục — NGHI TOẠ ĐỘ PLACEHOLDER**: các mục ghi `dia_diem` khác hẳn nhau (khác xã/huyện) nhưng lại chung đúng 1 cặp lon/lat — dấu hiệu ai đó dùng toạ độ "tâm thành phố/huyện" làm placeholder cho nhiều người/sự kiện khác nhau.

⚠️ Đây là heuristic tự động (so text `dia_diem` khác nhau ≥60% số mục trong cụm) — đã tự kiểm tay và thấy MỘT PHẦN là báo động giả (ví dụ cụm "Lai Xá" hay "Làng Mông Phụ, Đường Lâm" — dia_diem viết khác nhau nhưng thực ra cùng 1 làng nhỏ, toạ độ đúng). Hai cụm sau là báo động THẬT, đã xem tay xác nhận:

**Cụm nặng nhất — nghi placeholder xác nhận:**
1. **(105.5225448, 18.6727977) — "tâm" Nam Đàn, Nghệ An — 7 mục**: Khởi nghĩa Mai Thúc Loan, Mai Thiếu Đế, Phan Bội Châu, Khu lưu niệm Phan Bội Châu, Đình Hoành Sơn, Đền thờ Vua Mai, Đình Trung Cần — 6/7 dia_diem khác xã trong huyện Nam Đàn, cách nhau thật sự vài km, bị gộp về 1 điểm.
2. **(107.5909, 16.4637) — "tâm" TP Huế — 6 mục**: Bùi Huy Tín, phong trào chống thuế Trung Kỳ 1908, Trịnh Công Sơn, **Diệp Văn Kỳ**, Đạm Phương nữ sử, Lê Tâm — 6 người/sự kiện không liên quan, một số còn hoạt động chính ở nơi khác (Diệp Văn Kỳ: sinh Huế nhưng hoạt động ở Sài Gòn/Cao Lãnh) — toạ độ chỉ là "TP Huế" chung chung.
3. Chuỗi nhỏ hơn: (105.3187342,18.9127862) Đô Lương/Nghệ An 4 mục khác xã; (105.97,9.6) TP Sóc Trăng (nay Cần Thơ) 3 mục — khả năng vẫn cùng thành phố nhỏ, mức tin cậy thấp hơn 2 cụm trên.

## 2. CỤM GẦN TRÙNG (<500m, bắc cầu) — CHƯA đo lần trước
**208 cụm / 656 mục — 34% của cả DB nằm trong một cụm <500m với ít nhất 1 mục khác.**
- 47 cụm chỉ gồm các cặp trùng-chính-xác-với-nhau (không có mục lệch số).
- **161 cụm có ít nhất 1 cặp KHÁC toạ độ nhưng cách nhau <500m** — ở mức zoom toàn quốc, các pin này chồng khít lên nhau, người dùng chỉ thấy 1 chấm.
- Đây là quy mô THẬT của vấn đề UX bản đồ — lớn hơn nhiều so với 209 mục trùng tuyệt đối.

## 3. ĐỐI CHIẾU `do_tin_cay_toa_do`
- Trong 15 cụm nghi-placeholder (54 mục): `cao`=7, `trung`=30, `thấp`=14, khác=3.
- Xem tay 7 mục khai "cao": **6/7 vẫn đúng** (chúng có địa chỉ cụ thể thật — bảo tàng/di tích có số nhà, hoặc cùng 1 làng nhỏ như Lai Xá/Đường Lâm) — heuristic tự động gắn nhầm.
- **Chỉ 1 mục khai sai độ tin cậy rõ ràng: "Diệp Văn Kỳ"** (`danh-nhan-van-hoa-can-hien-dai.json`) — khai `do_tin_cay_toa_do: "cao"` nhưng toạ độ chỉ là tâm TP Huế dùng chung với 5 người khác, trong khi chính `mo_ta`/`dia_diem` của mục này thừa nhận hoạt động chính ở nơi khác.
- Kết luận: DB nhìn chung **trung thực về độ tin cậy** — vấn đề không phải khai man hàng loạt, mà là **toạ độ thô bị gộp chung** ở một số cụm cụ thể.

## 4. PHÂN BỐ THEO LỚP (nặng nhất — số tuyệt đối, cụm trùng chính xác)
| Lớp | Tổng mục | Mục trùng-chính-xác | Mục trong cụm <500m |
|---|---|---|---|
| bao-vat-quoc-gia.json | 36 | 23 (64%) | 31 (86%) |
| khoa-bang-danh-nhan.json | 167 | 21 | 71 |
| di-tich-qgdb.json | 152 | 20 | 60 |
| danh-nhan-van-hoa-can-hien-dai.json | 101 | 16 | 52 |
| chien-dich-tran-danh.json | 80 | 13 | 34 |
| danh-nhan-dan-toc-thieu-so.json | 56 | 13 | 18 |
| di-tich-quoc-gia.json | 258 | 12 | 73 |
| vua-hoang-de.json | 54 | 4 | **42 (78%)** |

Xác nhận đúng nghi ngờ ban đầu của main: **các lớp nhân vật** (khoa-bang, văn hoá, dân tộc thiểu số, quân sự cổ trung đại) chiếm phần lớn — quê quán sử liệu thường chỉ biết tới cấp huyện/tỉnh. Nhưng `bao-vat-quoc-gia` (86% near-dup) và `vua-hoang-de` (78%) cao NHẤT theo tỷ lệ — phần lớn ở đây là **cùng 1 bảo tàng / cùng 1 lăng miếu thờ chung nhiều vua** (hợp lệ), không phải lỗi.

## 5. ĐIỂM NGOÀI ĐẤT LIỀN
- Whitelist đảo/chủ quyền hợp lệ (Hoàng Sa, Trường Sa, Gạc Ma, Cồn Cỏ, Lý Sơn, Cù Lao Chàm, cột mốc biên giới...): **26 mục**, không gắn cờ.
- **52 mục nằm ngoài mọi polygon tỉnh, không có từ khoá đảo/chủ quyền** → nhưng xem tay TOÀN BỘ 52 mục: **không có mục nào là lỗi toạ độ rõ ràng** (không có điểm rơi sang Trung Quốc/Campuchia/biển xa một cách vô lý). Tất cả đều là địa danh sát bờ biển, mũi đất, đảo nhỏ ven bờ, hoặc đúng trên đường biên giới (đền/bến tàu/hải đăng/vịnh — Đồ Sơn, Vân Đồn, Sầm Sơn, Cà Mau, Nha Trang, Phú Quốc, biên giới Lào Cai/Hà Giang…) — polygon tỉnh trong `vn-34-tinh-2025.geojson` bị đơn giản hoá đường bờ biển/biên giới cho nhẹ file, nên các điểm sát mép bị tính là "ngoài". **Đây là hạn chế của thuật toán kiểm tra, không phải lỗi dữ liệu.** Riêng "Thác Bản Giốc" nằm đúng trên biên giới Việt–Trung — không phải lỗi (thác thật sự nằm trên đường biên) nhưng đáng note vì là điểm nhạy cảm chủ quyền.
- Tác dụng phụ tìm được ngoài phạm vi toạ độ: 2 mục ở `di-tich-qgdb.json`/`di-tich-quoc-gia.json` ("Gành Đá Đĩa", "Hải đăng Đại Lãnh") ghi tỉnh "Đắk Lắk" — không phải lỗi, mà do sáp nhập 2025 Phú Yên→Đắk Lắk, các mục khác trong DB đã ghi chú "(trước: Phú Yên)" nhất quán.

## 6. PHÂN LOẠI HƯỚNG XỬ LÝ (theo yêu cầu)

**A. Sửa được bằng máy/tra cứu lại** — ưu tiên cao nhất, phạm vi nhỏ, rõ ràng:
- 2 cụm placeholder xác nhận tay: Nam Đàn/Nghệ An (7 mục) + Huế (6 mục) = **13 mục**. Mỗi mục đã có `dia_diem` chi tiết tới xã/phường trong text — tra lại toạ độ theo `dia_diem` là khả thi.
- ⚠️ Lưu ý: audit này CHỈ bắt được placeholder khi ≥2 mục dùng CHUNG 1 toạ độ. Một mục đứng ONE MÌNH ở toạ độ "tâm tỉnh" (không ai dùng chung) thì KHÔNG bị phát hiện — con số 13 là **cận dưới**, quy mô thật có thể lớn hơn nhưng cần cách đo khác (so `dia_diem` cấp xã với toạ độ, không dựa vào trùng lặp).

**B. Chỉ hạ `do_tin_cay_toa_do` cho trung thực** — phạm vi rất nhỏ:
- **1 mục**: "Diệp Văn Kỳ" (`danh-nhan-van-hoa-can-hien-dai.json`) — hạ từ `cao` xuống `trung` hoặc `thấp`, vì toạ độ hiện tại chỉ là tâm TP Huế dùng chung 5 người khác trong khi ông hoạt động chính ở nơi khác.
- 46/54 mục trong các cụm nghi-placeholder đã tự khai `trung`/`thấp`/rỗng — đã trung thực, không cần sửa.

**C. Cần giải pháp hiển thị (clustering/jitter khi render) — bucket LỚN NHẤT:**
- **~643 mục còn lại trong 208 cụm <500m** (656 mục cụm <500m trừ 13 mục nhóm A đã xác định sửa máy được) — phần lớn là quê quán/di tích mà sử liệu THẬT SỰ chỉ ghi tới cấp xã/huyện, và nhiều làng/di tích ở nông thôn Việt Nam thực sự chỉ cách nhau vài trăm mét. Bịa toạ độ chính xác hơn nguồn là **tệ hơn** để nguyên — giải pháp đúng là bản đồ tự cụm điểm (marker clustering) hoặc toả nhẹ (jitter bán kính nhỏ, ví dụ 50-100m) khi hiển thị ở mức zoom xa, không phải sửa số liệu.
- Riêng `bao-vat-quoc-gia` (31 mục, 86%) và `vua-hoang-de` (42 mục, 78%) gần như chắc chắn thuộc nhóm này — đa số là cùng 1 bảo tàng/1 lăng miếu, đúng về mặt sử liệu.

## 5 CỤM NẶNG NHẤT (tóm tắt cho main)
1. Nam Đàn, Nghệ An (105.5225,18.6728) — 7 mục — **nghi placeholder, nên sửa máy**.
2. TP Huế (107.5909,16.4637) — 6 mục — **nghi placeholder, nên sửa máy + hạ tin cậy Diệp Văn Kỳ**.
3. Đông Sơn/Ngọc Lũ, Hà Nội (105.858,21.027) — 5 mục bảo vật quốc gia — hợp lệ, cùng nơi khai quật.
4. Mỹ Sơn/Trà Kiệu, Đà Nẵng (108.223,16.06) — 5 mục bảo vật Champa — hợp lệ, cùng bảo tàng.
5. Óc Eo, An Giang (105.1535,10.2558) — 4 mục bảo vật Óc Eo — hợp lệ, cùng di chỉ khảo cổ.

## KHUYẾN NGHỊ ƯU TIÊN
1. Làm ngay nhóm A (13 mục, 2 cụm) — chi phí thấp, tra lại toạ độ theo `dia_diem` xã/phường đã có sẵn trong data.
2. Hạ tin cậy 1 mục "Diệp Văn Kỳ" — 1 dòng sửa.
3. KHÔNG cố sửa số cho nhóm C (~643 mục) — đề xuất một hạng mục kỹ thuật riêng: bật marker-clustering ở `src/main.ts` khi zoom xa (đã có tiền lệ tương tự cho các lớp dày như di-tich-quoc-gia 258 mục). Đây là việc `src/`, ngoài phạm vi tôi.
4. Nếu main muốn số liệu chính xác hơn cho nhóm C, cần một đợt riêng: so `dia_diem` cấp xã của TỪNG mục (không chỉ mục trùng lặp) với toạ độ, ước lượng bằng cách khác — quy mô ước tính hàng trăm mục, không làm được trong đợt "đo nhanh" này.
