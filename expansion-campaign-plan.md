# 🏯 Chiến dịch mở rộng vô hạn — danh nhân · sự kiện · bản đồ (chỉ đạo Iron Man 2026-07-20)

> Mệnh lệnh: **không dừng khi còn tìm được** nhân vật/sử liệu Việt Nam từ thời Xích Quỷ → nay.
> Chạy theo **sóng song song** (agent sonnet, mỗi agent 1 file mới → không đụng nhau).
> Người điều phối (main) gộp → đăng ký layer → validator → commit từng sóng → lặp.

## Nguyên tắc bất biến (bám §1 + §9 của `vietnam-encyclopedia-plan.md`)
1. 🇻🇳 Chủ quyền Hoàng Sa/Trường Sa mọi lớp (không đụng — chỉ thêm overlay điểm).
2. 📚 Mỗi mục có `nguon[]` ≥1 nguồn **NGOÀI Wikipedia**. Nguồn ưu tiên: cổng nhà nước
   (chinhphu.vn, qdnd.vn, cand.com.vn, nhandan.vn, dangcongsan.vn, dsvh.gov.vn,
   bảo tàng, cổng tỉnh `*.gov.vn`, Văn Miếu–Quốc Tử Giám, Ngô Đức Thọ — Các nhà khoa bảng VN).
   **TUYỆT ĐỐI KHÔNG dùng Wikipedia** kể cả làm nguồn phụ.
3. ✅ Đúng sự thật, tích cực, giáo dục, đúng pháp luật VN.
4. ⚖️ **Cổng §9**: nội dung nhạy cảm (chiến tranh, chủ đề tranh luận) → `trang_thai:"draft"`,
   chờ Iron Man kiểm sử. **Mặc định MỌI mục mới = `draft`.**

## Hợp đồng dữ liệu (agent PHẢI tuân — validate_overlays.mjs ép cứng)
File overlay: `{ "ghi_chu": "...", "ngay_cap_nhat": "2026-07-20", "sources": ["cổng A", "cổng B"], "items": [ ... ] }`

Mỗi item:
```json
{
  "id": "kebab-khong-dau-duy-nhat",
  "ten": "Tên đầy đủ (có dấu)",
  "lon": 105.85, "lat": 21.03,          // SỐ, trong bbox VN 102–118 / 7–24
  "loai": "nhom-phan-loai",              // để tô màu; tự đặt nhóm hợp lý
  "nam_hien_thi": "1911–1990 / thế kỷ 15 / …",
  "mo_ta": "2–3 câu: công trạng, vì sao được tôn vinh (theo chính sử).",
  "dia_diem": "Quê/đền/tượng đài — xã, huyện, tỉnh",
  "do_tin_cay_toa_do": "cao|trung|thap",  // 'cao' nếu toạ độ đúng tượng đài/đền; 'trung/thap' nếu chỉ tới huyện/tỉnh
  "trang_thai": "draft",
  "nguon": ["Cổng X — tiêu đề bài — https://... (URL đã fetch được, KHÔNG bịa)"]
}
```
Quy tắc toạ độ: lấy toạ độ **tượng đài / đền thờ / khu lưu niệm / quê** qua tra cứu; nếu chỉ biết tới cấp huyện/tỉnh → đặt toạ độ trung tâm huyện/tỉnh và `do_tin_cay_toa_do:"trung"` hoặc `"thap"`. Đừng để 2 item trùng toạ độ y hệt (lệch nhẹ nếu cùng địa điểm).

## Dedup (BẮT BUỘC trước khi thêm)
- Danh sách 476 tên đã có: `C:\Users\maing\AppData\Local\Temp\claude\D--projects-vietnam-encyclopedia\be2bfa13-5296-4a68-8dc0-454c2ab665c4\scratchpad\existing_entities.txt`
- So khớp sau khi bỏ dấu + thường hoá. Nếu người đã có → KHÔNG thêm lại.
- Nếu một nhân vật hợp phạm vi agent khác hơn → nhường, ghi chú trong báo cáo.

## Mẫu file để bắt chước cấu trúc
`public/data/overlays/thanh-hoang-danh-than.json` (nhỏ, đúng schema).

## Kiểm chứng (agent tự chạy trước khi báo cáo)
`node scripts/validate_overlays.mjs` → phải in `✅` (exit 0). Nếu đỏ, sửa file của mình tới khi xanh.

## Việc của main (mỗi sóng, KHÔNG phải việc agent)
1. Thêm tên file mới vào `STRICT_SOURCE` trong `scripts/validate_overlays.mjs`.
2. Đăng ký layer trong mảng `OVERLAYS` (`src/main.ts`, ~L1023): id/label/file/circleColor/nguon/popup.
3. Cross-file dedup theo tên; validator + `tsc && vite build`; commit + push sóng.
4. Trích xuất lại `existing_entities.txt`; mở sóng kế; lặp tới khi agent báo "cạn".

## Sóng 1 (đang chạy — 6 agent sonnet, mỗi agent 1 file mới)
| Agent | File mới | Phạm vi |
|---|---|---|
| A1 | `anh-hung-llvt-cand.json` | Anh hùng LLVT nhân dân + Anh hùng CAND (liệt sĩ tiêu biểu, tượng đài) |
| A2 | `tuong-linh-hien-dai.json` | Tướng lĩnh QĐND hiện đại (Đại tướng → Trung tướng tiêu biểu) |
| A3 | `tien-si-tieu-bieu.json` | Tiến sĩ/bác học tiêu biểu (Văn Miếu 82 bia, nhà sử/toán/y học) |
| A4 | `chien-dich-tran-danh-bo-sung.json` | Chiến dịch/trận đánh bổ sung toàn thời đại (DRAFT §9) |
| A5 | `quan-thanh-liem.json` | Quan thanh liêm & người có công các triều |
| A6 | `me-vnah-ahld.json` | Mẹ VN Anh hùng + Anh hùng Lao động tiêu biểu |

## Sóng kế (backlog, mở dần)
- Thành hoàng/danh thần theo vùng (mở rộng); tiến sĩ/trạng nguyên còn lại.
- Tên đường/tên phố (đặt theo danh nhân) — cần chốt cách thể hiện.
- Làm giàu «Cương vực Việt cổ» (georef bản đồ cổ) — track địa lý, khó, tách riêng.
- Nhân vật văn hoá/khoa học còn thiếu; anh hùng lao động các ngành.

## 📓 Nhật ký thực thi (state resumable — cập nhật mỗi sóng)

> Ngân hàng tên đã có: `existing_entities.txt` (scratchpad). **WebSearch cạn phiên 2026-07-20**
> → agent định tuyến discovery qua **skill `web-crawl` render `google.com/search`** (ổn định
> nhất, gần như không CAPTCHA), fallback DDG-lite. Tail-discovery sâu nên để **phiên mới**
> (WebSearch reset). Mọi mục mới = `draft`, chờ Iron Man kiểm sử (§9).

| Sóng | Commit | Lớp phủ mới | +Mục | DB names |
|---|---|---|---|---|
| Backfill URL | `cf64291` | (nâng 31 draft→reviewed) | — | 476 |
| 1 | `8cbf159` | anh-hung-llvt-cand · tuong-linh-hien-dai · tien-si-tieu-bieu · quan-thanh-liem · me-vnah-ahld · chien-dich-tran-danh-bo-sung | 91 | 567 |
| 2 | `86d46e8` | vua-hoang-de · vo-tuong-trung-dai · van-nghe-si-khoa-hoc | 44 | 611 |
| 3 | `ebbd812` | tran-danh-khoi-nghia-bo-sung-2 · chi-si-cach-mang · to-nghe-danh-than | 50 | 661 |
| 4 | `2b36a50` | khoa-bang-bo-sung · anh-hung-liet-si-bo-sung · vua-chua-bo-sung | 46 | 707 |
| 5 | `59386f5` | hoang-toc-tieu-bieu · thanh-hoang-vung-mien · nha-giao-hoc-gia | 50 | 757 |
| 6 | `6b924f6` | di-tich-cach-mang · nghe-nhan-di-san · danh-tuong-chong-phap | 48 | 805 |
| 7 | `20e6bf8` | le-hoi-truyen-thong · lang-nghe-truyen-thong · danh-thang-di-san-thien-nhien | 64 | 869 |
| 8 | `e8407df` | anh-hung-llvt-bo-sung · anh-hung-lao-dong-khoa-hoc | 37 | 906 |
| 8b (enrich) | `99249c8` | làm giàu `di-tich-qgdb.json`: 152 mục thêm mo_ta + draft-flag | 0 | 906 |
| 9 | `08bd6b0` | su-than-ngoai-giao · danh-y-luong-y · nu-danh-nhan-lich-su | 39 | 945 |
| 10 | `a1dd16b` | doanh-nhan-yeu-nuoc · danh-nhan-dan-toc-thieu-so · thieu-nien-anh-hung | 51 | 996 |
| 11 | `6d4c7d8` | nghe-si-san-khau-dien-anh · hoa-si-dieu-khac (agent nhà-báo chết giữa chừng — dời sóng sau) | 39 | 1035 |
| 12 | `bc727dc` | nha-bao-xuat-ban · thien-su-cao-tang (agent kiến-trúc-sư chết giữa chừng — Chrome tiếp) | 31 | 1066 |
| 13 | `691366a` | kien-truc-su-ky-su (6 KTS + 6 kỹ sư) — **discovery qua Chrome→Google, KHÔNG CAPTCHA** | 12 | 1078 |
| 14 | `df56c3b` | khoa-bang-bo-sung-3 · danh-nhan-quan-su-co-trung-dai · nha-the-thao-lich-su — agent WebFetch→DDG-lite (không WebSearch) | 33 | 1111 |
| 15 | `550888b` | khoa-bang-bo-sung-4 · thu-linh-khoi-nghia-co-dai · dich-gia-ngon-ngu-hoc | 36 | 1147 |
| 16 | `59b63e3` | khoa-bang-mien-trung · danh-nhan-nam-bo · danh-than-trieu-nguyen — DDG-lite bắt đầu CAPTCHA (html/ ổn hơn) | 36 | 1183 |
| 17 | `44a1c35` | khoa-bang-thanh-hoa · nghia-si-can-vuong (−3 dup) · tri-thuc-khoa-hoc-tk20 — nhánh 1/4 «làm hết 4 mục» | 32 | 1215 |
| §9 | `954fd9c` | nâng 754 mục an toàn draft→reviewed; giữ 181 nhạy cảm + 32 Sóng17 draft (nhánh 2/4) | 0 | 1215 |
| Xích Quỷ | `74afcf3` | wire lõi Cổ Loa + siết ghi_chú Xích Quỷ «Cương vực Việt cổ» (nhánh 4/4) | 0 | 1215 |
| 18 | `d4a8e64` | chua-nguyen-trinh · nghe-nhan-lang-nghe-bo-sung · khoa-bang-nam-trung-bo (DDG CAPTCHA hạn chế) | 30 | 1245 |
| Tên đường (fix) | `c7d00e2` `d23daa0` | matchKey phân biệt thanh điệu (Bình≠Bính, Thủy≡Thuỷ) + tra nguồn 6 cặp lệch thanh | 0 | 1245 |
| Tên đường (wire) | `4d8132f` | builder quét figures/ + alias OSM-sai-dấu + header/mirror fetch 3 TP + bỏ tiền tố «Phố/Đường» → pilot **1137 liên kết / 459 danh nhân** (HN·HCM·ĐN); lớp bản đồ toggle | 0 | 1245 |
| 19 | `4cfba92` | danh-nhan-thua-thien-hue · nu-danh-nhan-bo-sung · danh-nhan-mien-nui-phia-bac — 3 agent WebFetch-only, không CAPTCHA | 37 | 1443* |

> *DB 1443 = ngân hàng dedup mới (1156 overlay + 301 figures + 137 tỉnh, unique). Overpass fix header User-Agent (dẹp 406) + 5 mirror khiến fetch cả 3 TP ổn định trở lại.

**⛔ Điểm dừng phiên 2026-07-20 (sau Sóng 7):** mọi công cụ tìm kiếm (WebSearch cạn;
Google/Bing/DDG qua web-crawl đều CAPTCHA/429) → **discovery thực sự bị chặn** = «không
tìm thêm được» theo nghĩa công cụ. Backlog rẻ còn lại (nghề Huế/Hội An/Nga Sơn, thêm khoa
bảng, thêm trận đánh) chờ **phiên mới reset search**. Ưu tiên người: duyệt §9 + soát toạ độ.

**Việc cần người (Iron Man) khi có thời gian:**
- Duyệt §9 & nâng `draft`→`reviewed` (đặc biệt nội dung chiến tranh, chủ đề nhạy cảm).
- Soát toạ độ: nhiều mục sóng 2–4 ở cấp xã/huyện (`trung`/`thap`) — cần geocode chính xác đền/lăng/khu lưu niệm trước khi bỏ badge draft.
- Backlog rẻ: thêm vua Trần/chúa Trịnh còn lại (cùng trang đền Đông Triều/Lam Kinh đã xác minh).
- Quyết định: mô hình hiển thị **tên đường/phố**; ưu tiên **làm giàu bản đồ Xích Quỷ**?

**Sóng «Đình–Đền–Miếu–Lễ hội–Thành hoàng» (2026-07-25, lệnh «resume và thêm lễ hội, đền thờ, thành hoàng, đình đền miếu mạo»):**
- 4 agent song song → 53 ứng viên, nạp **53/53** (14 lễ hội · 12 thành hoàng/danh thần · 13 đình · 14 đền/miếu). le-hoi 42→56 · thanh-hoang 33→45 · di-tich-quoc-gia 94→121. DB dedup 1856→**1909**.
- Mọi mục `draft`, nguồn cổng nhà nước/báo nhà nước, không Wikipedia. 3 gate xanh.
- Phân xử 15 cờ TRÙNG: noise token (Đình Kiền Bái≠Đinh Kiến, Phan Đà≠Phan Đăng Lưu) + cặp site-vs-event/deity hợp lệ theo tiền lệ (Đền Bảo Hà + lễ hội; Đền Và + Tản Viên; Đền Mẫu Âu Cơ + Quốc Mẫu Âu Cơ).
- Agent tự loại đúng các bẫy quần thể: Đền Bà Triệu/An Phụ/Độc Cước/Võ Miếu/Tân Trào/Cổ Loa/Ngọc Canh (đều trong hồ sơ qgdb đã có).
- HOÃN chờ sóng sau (nguồn chưa đạt/chưa tra): Đình Thụy Phiêu (đình cổ nhất VN, chờ nguồn xác nhận QĐ 52/2001), Lễ hội Đền Đô, chọi trâu Hải Lựu, Kỳ Yên Gia Lộc, Xên Mường, Kin Pang Then, Đống Đa Tây Sơn, Chúa Nguyệt Hồ/Bà Năm Phương/Ông Hoàng Bơ (chỉ nguồn hầu đồng), Đền Sinh–Đền Hóa, Đền Đại Cại, đình Diềm/Đồng Kỵ/Thanh Hà/Lâu Thượng. **Gap mới phát hiện: làng cổ Đường Lâm CHƯA có trong DB.**

**Sóng «Phi vật thể–Chùa cổ–Lăng mộ–Vét hoãn» (2026-07-25, lệnh «mở sóng tiếp, tự tìm keywords»):**
- **LỚP MỚI `di-san-phi-vat-the`** (đăng ký src/main.ts, màu tím UNESCO/hồng QG, validator STRICT_SOURCE): đủ **17 danh hiệu UNESCO** (nhã nhạc 2003 → tranh Đông Hồ khẩn cấp 12/2025) + 8 phi vật thể QG diễn xướng (hò khoan Lệ Thủy, hát Dô, hát Dặm Quyển Sơn, hò Đồng Tháp, rối nước Đào Thục, ca Huế, xẩm, trống quân) = 25 mục.
- 4 agent song song → 64 ứng viên, nạp **64/64**: phi-vat-the 0→25 · di-tich-quoc-gia 121→152 (13 chùa: Đậu, Tiêu, Tôn Thạnh, Hội Khánh, Thập Tháp Di Đà, Hòe Nhai, Bà Tấm…; 13 lăng mộ/làng cổ: **Làng cổ Đường Lâm** (lấp gap), đền-lăng Ngô Quyền, mộ Trương Định, Thủ Khoa Huân, lăng Mạc Cửu, lăng đá Dinh Hương + họ Ngọ, mộ Nguyễn Hữu Cảnh, Bùi Hữu Nghĩa, Phan Bội Châu Huế, Phan Châu Trinh, Nguyễn Huỳnh Đức, từ đường Nguyễn Khuyến; 5 đình/đền vét hoãn: **Đình Thụy Phiêu 1531** ✓, đình Diềm, Đồng Kỵ, Đền Sinh–Hóa, Đại Cại) · le-hoi 56→64 (Đền Đô, chọi trâu Hải Lựu, Kỳ Yên Gia Lộc, Xên Mường, Kin Pang Then, Đống Đa–Tây Sơn, Gò Tháp, rước pháo Đồng Kỵ). DB dedup 1909→**1972**.
- Phân xử 13 cờ TRÙNG (allowlist): site-vs-practice (Hội Gióng/Vía Bà UNESCO vs lễ hội đã có — mo_ta ghi rõ «danh hiệu»), site-vs-person (6 lăng mộ vs nhân vật, tiền lệ Nguyễn Xí), noise bỏ dấu (Chùa Đậu≠Chùa Dâu, Hát Dô≠Đồng Dương, Đền Đô≠Đông Cuông).
- Geo-check dải tỉnh: 6 cảnh báo đều false alarm (matcher bắt tên tỉnh trong ghi chú sáp nhập 2025); Hà Tiên/Tân An/Mai Châu/Quy Nhơn/Bạc Liêu/Bàu Trúc đều đúng toạ độ.
- Agent tự loại bẫy quần thể: Thoại Ngọc Hầu (hồ sơ núi Sam), Võ Thị Sáu (Côn Đảo), lăng vua Nguyễn (Cố đô Huế), lăng vua Đinh–Lê (Hoa Lư), chùa Thiên Mụ/Côn Sơn/Quỳnh Lâm (quần thể UNESCO/QGĐB).
- HOÃN còn lại: hát ví phường vải, nghệ thuật Chèo (không có điểm neo thuyết phục), trống quân các tỉnh khác, hò khoan ngoài Lệ Thủy, chùa Chuông + 6 chùa khác (nguồn xếp hạng chưa đọc được), Nguyễn Công Trứ (chưa xác minh QĐ), Nguyễn Trung Trực Rạch Giá (nguy cơ trùng đình thần đã có).
- Mọi mục `draft` chờ §9. 3 gate xanh (validate + audit chủ quyền 12 đảo + build 25s).

**Sóng «Nhà cổ–Hang động–Bảo tàng» (2026-07-25, «tiếp»):**
- **LỚP MỚI `bao-tang`** (16 mục, màu cyan, main.ts + validator): LSQG (20 bảo vật QG), Quân sự VN (toà mới Đại lộ Thăng Long 11/2024, 4 bảo vật gồm xe tăng 843 + MiG-21 4324/5121), HCM + chi nhánh Bến Nhà Rồng, Dân tộc học, Mỹ thuật, Chứng tích Chiến tranh, LS TP.HCM, Điêu khắc Chăm ĐN, Cổ vật Cung đình Huế, Quang Trung, ĐBP, Đắk Lắk, VH các dân tộc VN (Thái Nguyên), Phụ nữ VN, Hà Nội.
- di-tich-quoc-gia 152→173 (+21): 11 nhà cổ/công trình — Huỳnh Thủy Lê, dinh thự họ Vương Sà Phìn, Nhà Trăm Cột, Trần Văn Hổ + Trần Công Vàng, **Ga Đà Lạt**, Văn miếu Diên Khánh, **đền-mộ Nguyễn Công Trứ** (vét hoãn 2 sóng thành công), Nhà Lớn Long Sơn, nhà cổ Huỳnh Phủ, trụ sở UBND TP.HCM; 10 hang động — **động Từ Thức, Ngườm Ngao, Thẩm Khuyên–Thẩm Hai** (răng Homo erectus), hang Bua, hang Muối + hang Chổ (VH Hòa Bình), Phượng Hoàng–suối Mỏ Gà, động Nàng Tiên, Sơn Mộc Hương, Tiên Sơn Lai Châu.
- DB dedup 1972→**2009**. 5 cờ TRÙNG phân xử: Ga Đà Lạt⊂«Con Gà Đà Lạt» (chuỗi con kernel!), Văn Miếu-QTG cắt «-» còn core "van mieu", 2 site-vs-person, Bến Nhà Rồng=chi nhánh riêng. 1 lỗi agent sửa tay: do_tin_cay «trung bình»→«trung».
- Hoãn: cầu Hàm Rồng (quần thể?), Quốc Học Huế, nhà cổ Hội An (quần thể), 11 hang (Kính Chủ/Am Tiên/Tiên Sơn PN… đều bẫy quần thể đúng), bảo tàng tỉnh nhỏ + tư nhân (Áo Dài).
- 3 gate xanh. Vỉa sau: cầu-chợ-thương cảng cổ, đảo/cửa biển lịch sử, vườn quốc gia-khu bảo tồn?, trường học lịch sử (Quốc Học Huế, Bưởi–Chu Văn An…), công trình thuỷ lợi cổ (kênh Vĩnh Tế…).

**Sóng «Trường học–Thuỷ lợi–Biển đảo» (2026-07-25, tiếp mạch «tự tìm keywords»):**
- di-tich-quoc-gia 173→195 (+22). Trường học (6): Quốc Học Huế, Dục Thanh, Bưởi–Chu Văn An, **Trường dạy làm báo Huỳnh Thúc Kháng** (DT QG 2019), CĐ Sư phạm Đà Lạt (Lycée Yersin), Trường Nguyễn Ái Quốc Tuyên Quang. Thuỷ lợi/kênh (7): kênh Vĩnh Tế, Thoại Hà, đập Đồng Cam, **kênh Nhà Lê** (từ 983, Lê Hoàn), Chợ Gạo, Xáng Xà No, cầu ngói Chợ Thượng. Biển đảo (9): **bộ 3 chủ quyền Lý Sơn — Âm Linh Tự + mộ lính Hoàng Sa, đình An Vĩnh, đình An Hải**; Hòn Đá Bạc, Hòn Khoai, vạn An Thạnh + đền công chúa Bàn Tranh (Phú Quý), hải đăng Ba Làng An, Mũi Cà Mau.
- DB dedup 2009→**2031**. Chỉ 2 cờ TRÙNG (site-vs-person Huỳnh Thúc Kháng; noise «an vinh»⊂«nguyen vAN VINH»). Geo-check: cảnh báo Lý Sơn/Phú Quý là đảo ngoài dải đất liền — đúng thật.
- Hoãn: Đông Kinh Nghĩa Thục (không hồ sơ di tích riêng), Collège Mỹ Tho/Cần Thơ/Pétrus Ký, Quốc Tử Giám Huế + cầu Trường Tiền (quần thể Cố đô), bãi cọc Bạch Đằng (nghi QGĐB), Kê Gà, Cù Lao Chàm, đập Nha Trinh Chăm, Vũng Rô + Vàm Lũng (tàu Không số — vỉa riêng?), Thắng Tam Vũng Tàu.
- 3 gate xanh. 4 sóng trong ngày: +53 +64 +37 +22 = **176 mục mới**, 2 lớp mới, DB dedup 1856→2031.

**Sóng «Khảo cổ–Dinh thự» (2026-07-25):**
- di-tich-quoc-gia 195→216 (+21). Khảo cổ (12): **Gò Mun** (lấp mắt xích chuỗi Phùng Nguyên→Đồng Đậu→Gò Mun→Đông Sơn), Làng Cả, Sơn Vi, Quỳnh Văn, Bàu Tró, An Sơn, Dốc Chùa, Giồng Cá Vồ, Cái Bèo, Tràng Kênh, hang Dơi Bắc Sơn, hang Ngườm Sâu. Dinh thự (9): Bạch Dinh, Dinh I + II Đà Lạt, biệt điện Bảo Đại BMT, **dinh Hoàng A Tưởng Bắc Hà**, biệt thự Bảo Đại Đồ Sơn, Lầu Ông Hoàng, Dinh Thầy Thím + Dinh Cô (site-vs-event với lễ hội đã có).
- DB dedup 2031→**2052**. 2 cờ TRÙNG đều site-vs-event thiết kế sẵn. Hoãn: Hoa Lộc/Đa Bút/Mái đá Điều/Cồn Ràng (nguồn), Toà Khâm sứ (quần thể Huế), Dinh Tỉnh trưởng ĐL, biệt điện hồ Lắk.
- **Vỉa §9-nhạy-cảm ĐỂ DÀNH cho Iron Man quyết**: nghĩa trang Trường Sơn/Đường 9, sân bay Tà Cơn, Dốc Miếu–Cồn Tiên, K9 Đá Chông, bến Vũng Rô (tàu Không số). 3 gate xanh.
- NGÀY 25/7 tổng: 5 sóng, **+197 mục draft**, 2 lớp mới, di-tich-quoc-gia 94→216, DB dedup 1856→2052.

## Sóng 6 — Chiến tranh (A+B theo lệnh Iron Man) + Danh hiệu cổ (2026-07-26)

**Kết quả**: +25 draft → `di-tich-quoc-gia.json` 216→241. Commit sau 3 gate xanh.

**Lô chiến tranh (15)** — vỉa §9-nhạy-cảm được Iron Man duyệt mở («Làm A và B»):
nghĩa trang LSQG Trường Sơn + Đường 9, sân bay Tà Cơn, căn cứ Làng Vây, Dốc Miếu–Cồn Tiên (hàng rào McNamara), K9 Đá Chông, bến Vũng Rô, cầu Hàm Rồng, phà Long Đại, Sơn Mỹ, Xẻo Quýt (→ GỠ: trùng «Xẻo Quít» trong di-tich-cach-mang.json), Cò Nòi, địa đạo Kỳ Anh, địa đạo Long Phước, Nước Oa.
- Loại 1 trùng thật tại dry-run: Tà Thiết = «Căn cứ Bộ Chỉ huy QGP miền Nam» (di-tich-qgdb).
- Hoãn 4: A Bia (thiếu nguồn nhà nước), Khe Gát (nghi điểm thành phần Đường Trường Sơn), Núi Bà Đen (không tách bạch), TW Cục (đã có).

**Lô danh hiệu cổ (11→11)**:
- An Nam tứ đại khí đủ 4/4: tháp Báo Thiên, chuông Quy Điền, vạc Phổ Minh (coexistence với Đền Trần–Chùa Phổ Minh, mo_ta mở đầu phân biệt bảo khí), tượng Phật Quỳnh Lâm.
- Thăng Long tứ trấn hoàn tất: + đền Kim Liên (Cao Sơn Đại Vương, trấn Nam) — false positive «Kim Liên» vs khu lưu niệm HCM Nghệ An → allowlist.
- Nam thiên đệ tam động Địch Lộng; Hoa Lư tứ trấn: chùa động Thiên Tôn; làng khoa bảng Mộ Trạch + Hành Thiện + Tam Sơn; danh hương Đại Mỗ.
- Hoãn chuẩn: Hương Tích/Bích Động (quần thể), 3 làng Cót–La–Canh (thiếu nguồn), Thành Đông, tứ đại đỉnh đèo (danh hiệu hiện đại — để lô sau).

**Bài học kernel mới**: biến thể chính tả «Quýt/Quít» lọt strip-accent («quyt»≠«quit») — validator cross-file id bắt được, đã gỡ tay. Cân nhắc thêm bảng biến thể y/i vào kernel nếu tái diễn.

## Sóng 7+8 — Danh thắng thiên nhiên + Điểm cực & Công trình kỷ lục (2026-07-26)

**2 LỚP MỚI**: `danh-thang-thien-nhien.json` (🏞 #059669, 40 mục) + `cong-trinh-ky-luc.json` (🌉 #d97706, 14 mục). Đăng ký main.ts + validator STRICT_SOURCE. Vỉa do Iron Man gợi ý: ngã ba Đông Dương, điểm cực, 9 cửa Cửu Long, cầu/cáp treo kỷ lục.

**Danh thắng (40)**: tứ đại đỉnh đèo đủ 4 (Ô Quy Hồ, Khau Phạ, Pha Đin, Mã Pí Lèng — xếp hạng độc lập trong vùng CVĐC Đồng Văn) + đèo Lũng Lô (tiếp vận ĐBP) + đèo Cả; 6 thác (Dray Nur, Đray Sáp, Pongour, Datanla, Voi, Dải Yếm); 4 núi (Ngọc Linh, Cấm, Chứa Chan, Mẫu Sơn); 4 hồ (Lắk, Thác Bà, Biển Hồ T'Nưng, Xuân Hương); 3 vịnh (Xuân Đài, Lăng Cô, Vân Phong); mũi Đôi–Hòn Đầu (cực Đông), đảo Cồn Cỏ, cù lao Thới Sơn; 5 điểm cực/mốc (cột cờ Lũng Cú, A Pa Chải mốc 0, ngã ba Đông Dương Bờ Y, mũi Sa Vĩ, Lũng Pô mốc 92 — mo_ta khẳng định chủ quyền); **9 cửa Cửu Long** đủ bộ, gồm cửa Ba Thắc đã bồi lấp (bản ghi lịch sử) + cống Ba Lai 2002.

**Kỷ lục (14)**: cầu Mỹ Thuận/Cần Thơ (kể cả sự cố 2007, 55 người hy sinh)/Nhật Tân/Bãi Cháy/Rồng; hầm Hải Vân/Thủ Thiêm/Đèo Cả; cáp treo Fansipan (coexistence với núi, mở đầu phân biệt) + Hòn Thơm; thuỷ điện Hoà Bình/Sơn La; đường dây 500kV mạch 1; Cầu Vàng. Quy ước: kỷ lục PHẢI kèm mốc thời gian.

**Phân xử**: 2 allow (hồ Xuân Hương ≠ nữ sĩ; cáp treo ≠ núi Fansipan). Geo-check 2 false alarm (Lũng Lô ranh Yên Bái–Sơn La; Hòn Thơm ngoài dải đất liền Kiên Giang). Agent tự bắt 2 trùng ngoài trap (hồ Núi Cốc, vịnh Vĩnh Hy) + hoãn chuẩn Lang Biang/Tà Xùa/Núi Đôi Quản Bạ (quần thể/nguồn), Prenn/Cam Ly/Gia Long/Thác Bạc/đèo Ngoạn Mục (nguồn), thuỷ điện Lai Châu (không giữ kỷ lục riêng).

**Lưu ý nguồn**: cell-kyluc dùng lẫn Tuổi Trẻ/Thanh Niên/Dân Việt/VnExpress — báo chính thống trong nước nhưng ngoài danh mục «cổng nhà nước + báo Đảng» gốc; mỗi mục đều có ≥1 nguồn nhà nước đi kèm. Cần Iron Man xác nhận ở §9 có chấp nhận nhóm báo này không.

## Sóng 9 — Kiến trúc Pháp đô thị + Làng nghề truyền thống (2026-07-26)

**Kết quả**: +26 draft — `di-tich-quoc-gia.json` 241→252 (12 kiến trúc Pháp) + `to-nghe-danh-than.json` 48→62 (14 làng nghề).

**Kiến trúc Pháp (12)**: Bưu điện Trung tâm SG, Nhà hát TP.HCM, Toà án ND TP.HCM, Dinh Gia Long (nay Bảo tàng TP.HCM), ga Hà Nội (Hàng Cỏ), Bắc Bộ phủ (19/8/1945), tháp nước Hàng Đậu, toà ĐH Đông Dương, trụ sở Bộ Ngoại giao (Sở Tài chính Đông Dương), nhà thờ Cửa Bắc, Nhà hát TP Hải Phòng, cầu Trường Tiền (Huế).
- Hoãn: UBND TP.HCM + Trường Bưởi (agent tự bắt — ĐÃ có trong DB, scan chính sót); Continental/Metropole (tư nhân, chưa thấy xếp hạng); 2 toà Ngân hàng Đông Dương (thiếu nguồn).
- Allow: dinh-gia-long ≠ vua Gia Long (site-vs-person, kernel bỏ tiền tố «dinh»).

**Làng nghề (14)**: Ngũ Xã, nón Chuông, quạt-mộc Chàng Sơn, gốm Thanh Hà, thổ cẩm Mỹ Nghiệp, tranh làng Sình, chạm bạc Đồng Xâm, thêu ren Văn Lâm, chiếu cói Nga Sơn, mộc La Xuyên, đá Ninh Vân, tăm hương Quảng Phú Cầu, gốm Hương Canh, mộc Kim Bồng.
- Allow coexistence LÀNG vs bản ghi NGƯỜI tiền hiền/tổ nghề: Thanh Hà, Kim Bồng (tiền lệ Nguyễn Xí).
- Hoãn: Phước Kiều (cần soát chồng bản ghi tiền hiền), muối Sa Huỳnh/Bạc Liêu (chưa tra), lưu ý 2 mục Mỹ Nghiệp/Đồng Xâm KHÔNG khẳng định danh hiệu DSPVT quốc gia vì chưa xác minh được văn bản.

**Geo-check**: thêm nhu cầu nhận diện «Sài Gòn – Gia Định» — 4 mục SG matcher không nhận tỉnh, đã soát tay (chụm Quận 1 đúng).
