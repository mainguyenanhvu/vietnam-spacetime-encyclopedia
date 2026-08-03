# Kế hoạch gộp lớp phủ — loại bỏ chia theo VÙNG MIỀN, chỉ chia theo LĨNH VỰC

Trạng thái: CHỈ LẬP KẾ HOẠCH, chưa sửa file nào.

## 0. Cách đếm (verify)

Script: `scratchpad/audit_layers.mjs` (đọc UTF-8 qua `fs.readFileSync(..., 'utf8')`, ghi kết quả ra
`scratchpad/audit_layers_report.json` để tránh mất dấu tiếng Việt khi in ra console).

```
node audit_layers.mjs
→ DONE totalItems=1921 totalDraft=358 totalFiles=33
```

Khớp chính xác với snapshot PROGRESS.md ("33 lớp phủ / 1921 mục — 358 draft"). Không lệch.

Đối chiếu thêm bằng `src/main.ts`: khối `OVERLAY_GROUPS` (dòng 1917-1926) — nhóm UI có tên
**"Nữ danh nhân · Dân tộc · Vùng miền"** (dòng 1921, icon 👩) chứa đúng 3 lớp
`nu-danh-nhan-lich-su`, `danh-nhan-dan-toc-thieu-so`, `danh-nhan-nam-bo`. Và entry OVERLAYS của
`danh-nhan-nam-bo` (dòng 1654-1662) có `label: "🌾 Danh nhân vùng miền (Nam Bộ · Thừa Thiên Huế)"`
— tên trong code TỰ NHẬN là "vùng miền". Đây là bằng chứng độc lập xác nhận phát hiện dưới đây.

---

## 1. BẢNG KIỂM KÊ 33 LỚP

| # | File | Mục | Draft | Tiêu chí | Nhận xét |
|---|---|---|---|---|---|
| 1 | anh-hung-can-hien-dai.json | 91 | 0 | Lĩnh vực (AH LLVT/quân đội hiện đại) | 12 loai con, đều theo vai trò không theo miền |
| 2 | bao-tang.json | 16 | 16 | Lĩnh vực (thiết chế bảo tàng) | 1 loai duy nhất `bao-tang` |
| 3 | bao-vat-quoc-gia.json | 36 | 0 | Cấp xếp hạng (sổ bảo vật QG) | Giữ riêng theo quyết định đã chốt |
| 4 | chi-si-cach-mang.json | 47 | 0 | Lĩnh vực (phong trào yêu nước đầu TK20) | Có sẵn loai `chi-si-nam-ky` (2) — vùng miền lọt vào bên trong 1 giá trị `loai`, không phải tiêu chí file |
| 5 | chien-dich-tran-danh.json | 80 | 0 | Lĩnh vực (sự kiện quân sự, event-schema) | loai theo thời kỳ/tính chất trận đánh |
| 6 | cong-trinh-ky-luc.json | 14 | 14 | Lĩnh vực (công trình kỹ thuật kỷ lục) | cầu/hầm/cáp treo/thuỷ điện |
| 7 | danh-nhan-cac-trieu.json | 11 | 0 | **Hỗn hợp** (vua/văn học/y học/khai phá trộn) | TODO cũ Phase 3 "tách per-item" chưa làm — không phải vùng miền nhưng cùng loại vấn đề |
| 8 | danh-nhan-dan-toc-thieu-so.json | 56 | 0 | **Hỗn hợp theo dân tộc** (không phải lĩnh vực, không hẳn vùng miền) | Trộn AH, trí thức, thủ lĩnh, văn nghệ sĩ, nghệ nhân, nhà CM — xem CÂU HỎI |
| 9 | **danh-nhan-nam-bo.json** | 39 | 0 | **VÙNG MIỀN** (xác nhận) | 20 mục Nam Bộ (chi-si/khai-hoang/hoc-gia) + 19 mục `danh-nhan-hue` trộn; tên label chính là "vùng miền" |
| 10 | danh-nhan-quan-su-co-trung-dai.json | 82 | 0 | Lĩnh vực (quân sự cổ-trung đại) | loai theo triều đại/vai trò |
| 11 | danh-nhan-van-hoa-can-hien-dai.json | 90 | 0 | Lĩnh vực (văn hoá nghệ thuật) | 20 loai con (văn học, hội hoạ, âm nhạc, báo chí…) |
| 12 | danh-thang-thien-nhien.json | 77 | 77 | Lĩnh vực (địa hình/thắng cảnh) | đèo/thác/núi/hồ/vịnh/đảo/VQG/khu DTSQ |
| 13 | danh-y-luong-y.json | 15 | 0 | Lĩnh vực (y học cổ truyền) | |
| 14 | di-san-phi-vat-the.json | 27 | 27 | Cấp xếp hạng (sổ di sản phi vật thể) | Giữ riêng theo quyết định |
| 15 | **di-tich-cach-mang.json** | 50 | 12 | **TÊN SAI LỆCH NỘI DUNG** | 11 vuon-quoc-gia + 9 danh-thang lẫn vào (do Phase 3 lô 5 gộp nhầm), chỉ 5 mục thật sự "di-tich-cach-mang" |
| 16 | di-tich-qgdb.json | 152 | 0 | Cấp xếp hạng (sổ QG đặc biệt) | Giữ riêng theo quyết định |
| 17 | di-tich-quoc-gia.json | 258 | 164 | Cấp xếp hạng (sổ QG thường) | Giữ riêng theo quyết định |
| 18 | huyen-su-khai-quoc.json | 10 | 0 | Lĩnh vực (huyền sử + chủ quyền) | Giữ riêng theo quyết định (chứa Hải đội Hoàng Sa) |
| 19 | khoa-bang-danh-nhan.json | 160 | 0 | Lĩnh vực (khoa bảng/quan lại) | 23 loai con, đã gộp mạnh ở Phase 3 |
| 20 | le-hoi-truyen-thong.json | 64 | 22 | Lĩnh vực (lễ hội) | |
| 21 | me-vnah.json | 14 | 0 | Lĩnh vực (danh hiệu Bà mẹ VNAH) | |
| 22 | nghe-nhan-di-san.json | 104 | 0 | Lĩnh vực (nghệ nhân di sản) | |
| 23 | nghia-si-can-vuong.json | 40 | 0 | Lĩnh vực (phong trào Cần Vương) | |
| 24 | nha-the-thao-lich-su.json | 17 | 0 | Lĩnh vực (thể thao) | |
| 25 | nu-danh-nhan-lich-su.json | 38 | 0 | **Hỗn hợp theo giới tính** (không phải lĩnh vực, không phải vùng miền) | Trộn nữ tướng/nữ sĩ/nữ AH/nữ khoa học gia — xem CÂU HỎI |
| 26 | su-than-ngoai-giao.json | 25 | 0 | Lĩnh vực (ngoại giao) | |
| 27 | thanh-hoang-danh-than.json | 45 | 12 | Lĩnh vực (tín ngưỡng thành hoàng) | |
| 28 | thien-su-cao-tang.json | 25 | 0 | Lĩnh vực (Phật giáo) | |
| 29 | thieu-nien-anh-hung.json | 22 | 0 | Lĩnh vực (thiếu niên anh hùng) | |
| 30 | to-nghe-danh-than.json | 62 | 14 | Lĩnh vực (tổ nghề/làng nghề) | "lang-nghe"(35) là loại hình nghề, không phải nhóm theo tỉnh |
| 31 | tri-thuc-khoa-hoc-tk20.json | 87 | 0 | Lĩnh vực (trí thức khoa học TK20) | |
| 32 | unesco.json | 13 | 0 | Cấp xếp hạng (di sản thế giới) | Giữ riêng theo quyết định |
| 33 | vua-hoang-de.json | 54 | 0 | Lĩnh vực (vương triều/hoàng gia) | |

**Tổng: 1921 mục, 358 draft — khớp báo cáo, không lệch.**

---

## 2. LỚP CHIA THEO VÙNG MIỀN

Chỉ **1 lớp** đúng tiêu chí (miền/tỉnh/lưu vực):

- **`danh-nhan-nam-bo.json`** (39 mục, 0 draft):
  - `ghi_chu` trong file ghi rõ: *"Danh nhân khai hoang, chí sĩ chống Pháp & học giả **Nam Bộ**... [Phase 3 lô4: hợp nhất 1 lớp → nhóm «Danh nhân **vùng miền** (Nam Bộ · Thừa Thiên Huế)»]"*.
  - `label` trong `src/main.ts:1655`: `"🌾 Danh nhân vùng miền (Nam Bộ · Thừa Thiên Huế)"`.
  - Nội dung: 20 mục Nam Bộ (`loai`: chi-si 15, khai-hoang 3, hoc-gia 2) + 19 mục Huế (`loai`: `danh-nhan-hue` toàn bộ 19).
  - Đây chính là hậu quả sáp nhập Phase 3 lô 2 ("danh-nhan-vung-mien: primary danh-nhan-nam-bo ← danh-nhan-thua-thien-hue") — gộp 2 file theo VÙNG thành 1 file theo VÙNG lớn hơn, thay vì phân loại theo lĩnh vực ngay từ đầu.

**Không tìm thấy** lớp nào khác chia theo tỉnh/miền/lưu vực trong 32 file còn lại — không có filename hay `ghi_chu` nào khác nhắc "miền", "vùng", "tỉnh X" làm tiêu chí tổ chức (kiểm bằng cách đọc toàn bộ 33 `ghi_chu` + tên file).

**Ranh giới mập mờ đã loại trừ đúng theo quy tắc constraint** (không tính vùng miền):
- `to-nghe-danh-than.json` — "làng nghề" là loại hình di sản thủ công (địa hình cụ thể), không phải gom theo tỉnh/miền.
- `danh-thang-thien-nhien.json` — địa hình cụ thể (đèo/thác/vịnh/đảo…), tiêu chí chủ quyền/địa lý học thuật, không phải phân vùng hành chính.
- `huyen-su-khai-quoc.json` — chủ quyền biển đảo, không phải vùng miền.

---

## 3. LỚP TÊN SAI LỆCH NỘI DUNG

- **`di-tich-cach-mang.json`** (50 mục, 12 draft): tên file/id gợi ý "di tích cách mạng" nhưng thực tế:
  - `nha-tu` 6, `di-tich-cach-mang` 5, `luu-niem-cach-mang` 2, `can-cu-khang-chien` 9,
    `duong-ho-chi-minh-tren-bien` 8 → **30 mục đúng chủ đề cách mạng/kháng chiến**.
  - `vuon-quoc-gia` 11, `danh-thang` 9 → **20 mục không liên quan cách mạng**, là di sản thiên nhiên
    (do Phase 3 lô 5 gộp nhầm `danh-thang-di-san-thien-nhien.json` vào `di-tich-cach-mang.json` thay
    vì vào `danh-thang-thien-nhien.json`).
  - `label` trong main.ts đã trung thực hơn tên file: `"🚩 Di tích cách mạng · Danh thắng · Di sản
    thiên nhiên"` (dòng 1471) — tức code đã "biết" đây là 3 chủ đề trộn, chỉ chưa tách.
  - Đây **không phải vấn đề vùng miền**, nhưng nằm trong cùng đợt dọn dẹp taxonomy nên nêu ra.

Không phát hiện lớp nào khác bị sai lệch tên tương tự (label vs nội dung khớp nhau ở 32 file còn lại).

---

## 4. TAXONOMY ĐÍCH — đề xuất

**32 lớp** (33 hiện tại − 1 lớp `danh-nhan-nam-bo` bị xoá, 39 mục phân về lớp lĩnh vực có sẵn;
không tạo lớp mới nào). Nếu Iron Man đồng ý xử lý luôn `danh-nhan-cac-trieu` (câu hỏi Q3) thì còn **31 lớp**.

Các lớp lĩnh vực nhận thêm mục (giữ tên, chỉ mở rộng `loai`):

| Lớp đích | `loai` hợp nhất thêm | Số mục nhận |
|---|---|---|
| `nghia-si-can-vuong.json` | thêm giá trị loai hiện có (`thu-linh`/`danh-tuong-chong-phap`) | +8 |
| `chi-si-cach-mang.json` | thêm vào `duy-tan-dong-du` (+1), `nha-cach-mang-tien-boi` (+7), tag mới `chi-si-hue` cho ngo-kha (+1) | +9 |
| `khoa-bang-danh-nhan.json` | thêm vào `danh-than`/`quan-dai-than` (+5), tag mới cho quan chúa Nguyễn TK17-18 (+2) | +7 |
| `danh-nhan-van-hoa-can-hien-dai.json` | thêm vào `van-hoc` (+8), `hoi-hoa` (+2), `nha-bao` (+1) | +11 |
| `tri-thuc-khoa-hoc-tk20.json` | thêm vào `nha-giao` | +1 |
| `danh-nhan-quan-su-co-trung-dai.json` | tag mới `khai-hoang` (⚠️ xem Q1) | +2 |
| `thanh-hoang-danh-than.json` | thêm vào `thanh-hoang` (⚠️ xem Q1) | +1 |

Kèm theo (mục 3, không phải vùng miền nhưng làm cùng đợt nếu được duyệt):
- `danh-thang-thien-nhien.json`: +20 mục (vuon-quoc-gia 11 + danh-thang 9) từ `di-tich-cach-mang.json` → 97 mục.
- `di-tich-cach-mang.json`: còn lại 30 mục thuần cách mạng/kháng chiến.

Tất cả các lớp "sổ đăng ký nhà nước" (`unesco`, `bao-vat-quoc-gia`, `di-tich-qgdb`, `di-tich-quoc-gia`,
`di-san-phi-vat-the`) và các cụm đã chốt (`huyen-su-khai-quoc`) **giữ nguyên, không đụng**.

---

## 5. BẢN ĐỒ DI CHUYỂN (39 mục của danh-nhan-nam-bo.json)

Quy tắc quyết định khi 1 mục có thể về nhiều lớp: **ưu tiên lĩnh vực hoạt động chính** ghi trong
`mo_ta`/`loai` gốc, thời kỳ quyết định giữa "kháng Pháp cổ điển" (→ Cần Vương) và "cách mạng/Đảng"
(→ chi-si-cách-mạng); nghề nghiệp chính (văn/hoạ/quan lại) quyết định giữa văn hoá và khoa bảng.

| id gốc | ten | loai gốc | → Lớp đích | Lý do |
|---|---|---|---|---|
| phan-cong-hon, nguyen-van-qua, doan-van-cu, phan-ngoc-tong, do-thua-luong-do-thua-tu, le-can-nguyen-giao, nguyen-huu-huan-thu-khoa, phan-ton-phan-liem | (8 người) | chi-si | `nghia-si-can-vuong.json` | Kháng Pháp vũ trang 1861-1885, cùng thời/tính chất với lớp Cần Vương hiện có |
| nguyen-quang-dieu, truong-gia-mo | 2 | chi-si/hoc-gia | `chi-si-cach-mang.json` (loai `duy-tan-dong-du`) | Tham gia phong trào Đông Du/Duy Tân — khớp loai có sẵn |
| chau-van-liem, pham-hung, nguyen-thi-dinh, nguyen-thai-binh-sinh-vien, huynh-van-nghe, ung-van-khiem | 6 | chi-si | `chi-si-cach-mang.json` (loai `nha-cach-mang-tien-boi`) | Cán bộ Đảng/cách mạng 1920s+ |
| ngo-kha | 1 | danh-nhan-hue | `chi-si-cach-mang.json` | Nhà giáo — nhà cách mạng bị thủ tiêu 1973 |
| huynh-man-dat | 1 | hoc-gia | `khoa-bang-danh-nhan.json` | Quan triều Nguyễn + nhà thơ |
| than-trong-hue, dang-van-hoa, ton-that-dan, nguyen-dinh-hoe | 4 | danh-nhan-hue | `khoa-bang-danh-nhan.json` | Đại thần triều Nguyễn TK19-20 |
| nguyen-khoa-dang, nguyen-khoa-chiem | 2 | danh-nhan-hue | `khoa-bang-danh-nhan.json` | Quan văn thời chúa Nguyễn TK17-18 |
| thanh-tinh, tran-thanh-mai, nguyen-khoa-diem, phan-van-dat, nguyen-khoa-vy, tran-thanh-dich, hoang-phu-ngoc-tuong, buu-dinh | 8 | danh-nhan-hue | `danh-nhan-van-hoa-can-hien-dai.json` (loai `van-hoc`) | Nhà thơ/nhà văn |
| nguyen-khoa-toan, pham-dang-tri | 2 | danh-nhan-hue | `danh-nhan-van-hoa-can-hien-dai.json` (loai `hoi-hoa`) | Hoạ sĩ |
| hai-trieu | 1 | danh-nhan-hue | `danh-nhan-van-hoa-can-hien-dai.json` (loai `nha-bao`) | Nhà báo/lý luận |
| ho-dac-diem | 1 | danh-nhan-hue | `tri-thuc-khoa-hoc-tk20.json` (loai `nha-giao`) | Giáo sư luật, cách mạng |
| nguyen-van-ton-dieu-bat, chau-thi-te | 2 | khai-hoang | `danh-nhan-quan-su-co-trung-dai.json` ⚠️ Q1 | Công thần mở cõi/đào kênh thời chúa Nguyễn |
| do-cong-tuong | 1 | khai-hoang | `thanh-hoang-danh-than.json` ⚠️ Q1 | Được vua sắc phong, dân lập đền thờ — giống thành hoàng hơn khai hoang thuần |

**8+2+6+1+1+4+2+8+2+1+1+2+1 = 39.** Khớp tổng.

---

## 6. RỦI RO

1. **Trùng `id` khi gộp**: `id` hiện tại đã unique xuyên 33 file (theo validator). Khi merge 39 mục
   của `danh-nhan-nam-bo` vào 7 file khác, phải chạy lại full-repo id-dedup check (giống
   `scratchpad/merge_song10.mjs` mẫu) — rủi ro thấp vì tên người Nam Bộ/Huế ít trùng tên với các lớp
   quân sự cổ-trung đại hay khoa bảng, nhưng **phải chạy máy, không suy đoán**.
2. **Mất khả năng lọc riêng "Nam Bộ" / "Huế"**: người dùng hiện có thể bật/tắt riêng lớp
   `danh-nhan-nam-bo` để xem chỉ danh nhân 2 vùng này trên bản đồ. Sau khi xoá lớp, họ **KHÔNG còn
   cách lọc theo vùng miền này nữa** — đây chính là hệ quả trực tiếp của yêu cầu "bỏ vùng miền, chỉ
   giữ lĩnh vực". Cần Iron Man xác nhận đây là điều muốn (đã stated rõ trong goal, coi như đã chốt).
3. **`src/main.ts` cần sửa 3 chỗ**:
   - Xoá entry `OVERLAYS` id `danh-nhan-nam-bo` (dòng 1653-1662).
   - `OVERLAY_GROUPS` dòng 1921: nhóm hiện có 3 lớp, xoá `danh-nhan-nam-bo` → còn 2 lớp
     (`nu-danh-nhan-lich-su`, `danh-nhan-dan-toc-thieu-so`) → **tên nhóm phải đổi**, bỏ chữ
     "Vùng miền" (vd còn `"Nữ danh nhân · Dân tộc thiểu số"`) vì không còn lớp vùng miền nào trong đó.
   - Nếu tách `di-tich-cach-mang` (mục 4): sửa `circleColor` match-expression (dòng 1474+, hiện
     match theo `loai` `danh-thang`/`vuon-quoc-gia`) và cập nhật `label` dòng 1471 (bỏ "Danh thắng ·
     Di sản thiên nhiên" khỏi label, chỉ còn "Di tích cách mạng").
4. **`STRICT_SOURCE`** (`scripts/validate_overlays.mjs:22-57`): xoá `"danh-nhan-nam-bo.json"` khỏi
   danh sách (dòng 50). Không cần thêm tên mới — 7 file đích đều đã có sẵn trong `STRICT_SOURCE`.
5. **Popup schema đồng nhất**: tất cả 7 file đích + `danh-nhan-nam-bo` đều dùng `personOverlayPopup`
   (kiểm bằng grep `popup:` quanh mỗi entry) — **không có rủi ro lệch schema thờ-tự/sự kiện** như các
   lô Phase 3 trước. An toàn để gộp trực tiếp mà không cần `universalPersonPopup`.
6. **`ghi_chu`/`sources[]`**: khi 39 mục chuyển file, `nguon[]` từng mục đã có sẵn (giữ nguyên), chỉ
   cần append các nguồn cấp-file độc-nhất của `danh-nhan-nam-bo.json` (18 nguồn liệt kê trong
   `sources[]`) vào `sources[]` của từng file đích nhận mục tương ứng, tránh mất provenance.
7. **`do_tin_cay_toa_do: "thap"`**: 2 mục Huế (`pham-dang-tri`, `tran-thanh-dich`) có độ tin cậy toạ
   độ thấp — không liên quan việc gộp nhưng nên gắn cờ dọn ở đợt QA toạ độ kế tiếp.

---

## 7. CÂU HỎI CHO CHỦ DỰ ÁN

**Q1 — 3 mục "khai-hoang" (Đỗ Công Tường, Nguyễn Văn Tồn, Châu Thị Tế) không có lớp lĩnh vực khớp sẵn.**
- A) Gộp cả 3 vào `danh-nhan-quan-su-co-trung-dai.json` (thêm tag `khai-hoang`) — đơn giản, 1 đích,
  nhưng Đỗ Công Tường không phải quân sự (ông là dân thường được thần thánh hoá vì chết thay dân
  mùa dịch, vua sắc phong).
- B) Tách: Đỗ Công Tường → `thanh-hoang-danh-than.json` (đúng bản chất thờ tự dân gian được sắc
  phong); Nguyễn Văn Tồn (Thống chế) + Châu Thị Tế (phu nhân Thoại Ngọc Hầu, công trình đào kênh)
  → `danh-nhan-quan-su-co-trung-dai.json`.
- **Khuyến nghị: B** — đúng bản chất từng người hơn, chỉ 3 mục nên chi phí tách rất thấp.

**Q2 — `danh-nhan-dan-toc-thieu-so.json` (56 mục) và `nu-danh-nhan-lich-su.json` (38 mục) là 2 lớp
cắt ngang nhiều lĩnh vực (gom theo dân tộc / theo giới tính), không phải lĩnh vực, cũng không hẳn
là "vùng miền" theo định nghĩa yêu cầu (miền/tỉnh/lưu vực).**
- A) Giữ nguyên 2 lớp này — ngoài phạm vi yêu cầu hiện tại (chỉ nói bỏ vùng miền).
- B) Tách per-item theo lĩnh vực giống cách xử lý `danh-nhan-nam-bo`, xoá luôn 2 lớp "cắt ngang"
  còn lại để toàn bộ 32 lớp đều thuần lĩnh vực.
- **Khuyến nghị: A** — yêu cầu gốc chỉ nhắm vùng miền; ép tách thêm 94 mục nữa là mở rộng phạm vi
  ngoài những gì được giao, và 2 lớp này phục vụ mục đích tra cứu hợp lệ khác (nhìn theo dân tộc/
  giới tính là góc nhìn hợp lệ, khác bản chất với việc chia bản đồ theo địa lý hành chính).
  Nêu ra để Iron Man tự quyết vì đụng phạm vi.

**Q3 — `danh-nhan-cac-trieu.json` (11 mục, hỗn hợp vua/văn học/y học/khai phá) có TODO cũ từ
Phase 3 ("tách per-item, LÀM CUỐI") chưa thực hiện. Có nên xử lý luôn trong đợt gộp lần này không?**
- A) Làm luôn — cùng bản chất "lớp hỗn hợp cần tách", tiện thể dọn dứt điểm, giảm còn 31 lớp cuối.
- B) Để riêng — không phải vùng miền, ngoài phạm vi yêu cầu, tránh trộn 2 việc trong 1 lần commit.
- **Khuyến nghị: B** — giữ đợt này tập trung đúng 1 việc (vùng miền) để dễ verify/rollback; làm Q3
  thành đợt kế tiếp riêng.

**Q4 — Sau khi tách `di-tich-cach-mang.json` (mục 3), tên file/label có cần đổi để phản ánh đúng
nội dung còn lại (30 mục thuần cách mạng/kháng chiến, không còn vườn QG/danh thắng)?**
- A) Giữ tên file `di-tich-cach-mang.json`, chỉ sửa `label` trong main.ts (bỏ "Danh thắng · Di sản
  thiên nhiên") — ít việc, không đổi `STRICT_SOURCE`/references.
- B) Đổi tên file (vd `di-tich-khang-chien.json`) để khớp nội dung thực — sạch hơn nhưng phải sửa
  `STRICT_SOURCE`, `OVERLAYS.file`, `OVERLAY_GROUPS` reference.
- **Khuyến nghị: A** — đủ để hết "sai lệch", tránh rung chuyển thêm các chỗ tham chiếu tên file.
