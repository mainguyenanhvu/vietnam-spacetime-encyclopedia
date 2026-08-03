# SCHEMA — mô hình dữ liệu thống nhất

Đặc tả một mô hình dữ liệu cho toàn dự án. Trạng thái: **đặc tả đích**, chưa di trú xong. Việc còn lại nằm ở [`PLAN.md`](../PLAN.md) mục 2.

Số liệu trong file này đo bằng script kiểm kê chạy ngày **2026-08-03** trên 98 file, 4.531 mục, 8.134.365 byte.

---

## 1. Vì sao ba tầng chứ không một schema phẳng

Đã thử ép một schema chung. Không được, và có bằng chứng: **chỉ trường `ten` đạt ≥80%** trên toàn bộ 4.531 mục (83,6%). Trường phổ biến thứ hai là `nguon` — 68,4%.

Con số đó không nói dữ liệu bẩn. Nó nói dự án đang chứa **ba loại thực thể khác nhau về bản chất**, và ép chúng vào một bảng sẽ sinh ra hàng chục cột rỗng.

| Tầng | Là gì | File | Mục | Đặc điểm |
|---|---|---|---|---|
| **`diem`** | Nhân vật, địa điểm, sự kiện — thứ đặt được lên bản đồ | `overlays/` 34 file | 2.347 (52%) | Có `lat`/`lon`. Core 11 trường đạt 85–100% **ngay trong tầng này** |
| **`ho_so`** | Trang bách khoa của một tỉnh | `provinces/` 34 file | 34 | Một bản ghi mỗi file, lồng sâu, **không có toạ độ** |
| **`tac_pham`** | Thơ, ca dao, phim, nhạc, câu hỏi, mốc thời gian | `literature/` `media/` `documentaries/` `games/` `timeline/` `story/` | ~1.100 | Mỗi miền một bộ trường riêng, chỉ chung khái niệm nguồn |

Ngoài ba tầng là **`hinh_hoc`** — `boundaries/` và `geo/`, 6 file / 263 mục, chuẩn GeoJSON `FeatureCollection`. Không ép vào ba tầng trên; giữ chuẩn GeoJSON vì đó là thứ MapLibre đọc trực tiếp.

---

## 2. Trường lõi — bắt buộc ở cả ba tầng

```jsonc
{
  "id":         "ly-thai-to",     // slug không dấu, duy nhất TRONG file
  "ten":        "Lý Thái Tổ",     // có dấu đầy đủ. Mất dấu = lỗi dữ liệu
  "nguon":      ["Tên nguồn — https://url"],   // mảng chuỗi, ≥1 phần tử
  "trang_thai": "draft"           // "draft" | "reviewed"
}
```

**`nguon` là tên duy nhất.** Không còn `sources`. Không còn `nguon_chinh`. Không còn `nguon` kiểu chuỗi.

Khuôn mỗi phần tử: `"Tên nguồn — https://url"` — dấu gạch ngang dài `—` có khoảng trắng hai bên. Đây là khuôn schema, không phải văn xuôi, nên quy tắc "tránh em-dash" không áp dụng ở đây.

**Nguồn cấp file được phép** khi một nguồn phủ hết mọi mục trong file (`streets/`, `timeline/nien-hieu.json`, `media/nhac-yeu-nuoc.json` — 622 mục). Khi đó khai ở khối bọc ngoài, và mục con không cần lặp lại:

```jsonc
{
  "ghi_chu": "…",
  "ngay_cap_nhat": "2026-08-03",
  "nguon": ["OpenStreetMap — https://www.openstreetmap.org/copyright"],
  "items": [ /* … */ ]
}
```

`ngay_cap_nhat` là tên duy nhất cho ngày cập nhật. Không còn `cap_nhat`. Hai file đang có **cả hai** (`bao-vat-quoc-gia.json`, `di-tich-qgdb.json`) — phải kiểm giá trị có lệch không trước khi bỏ một cái.

---

## 3. Tầng `diem`

Ngoài trường lõi:

| Trường | Kiểu | Hiện có | Ghi chú |
|---|---|---|---|
| `lat`, `lon` | number | 100% | WGS84, độ thập phân |
| `loai` | string | 100% | Tập giá trị đóng theo lớp — xem §6 |
| `do_tin_cay_toa_do` | `"cao"` \| `"trung"` \| `"thap"` | 97,9% | **Tên duy nhất.** `geo/` đang gọi `muc_do_tin_cay` — phải đổi |
| `mo_ta` | string | 96,3% | 2–4 câu, viết lại, không chép nguyên văn nguồn |
| `dia_diem` | string | 96,0% | Địa chỉ theo nguồn |
| `nam_hien_thi` | string | 85,0% | **Luôn là chuỗi.** `to-nghe-danh-than.json` đang có 14 mục kiểu số — phải ép kiểu |
| `xep_hang` | string | — | Cấp + số QĐ + ngày. Không tra được → đúng chuỗi `"chưa xác minh được"` |
| `anh`, `anh_nguon`, `anh_giay_phep`, `anh_muc` | string | 23,8% | Bộ bốn, có thì phải đủ bốn |
| `ai_generated`, `nhan_canh_bao` | boolean, string | — | Bắt buộc nếu ảnh do AI sinh — xem `image-generation-spec.xml` |
| `thuoc_cum` | string | — | Tên cụm/quần thể mẹ, nếu mục là điểm thành phần — xem §3.1 |
| `trung_unesco` | boolean | — | `true` nếu mục nằm trong một di sản đã có ở `unesco.json` |
| `nhom` | string[] | — | Cho người thuộc nhiều lĩnh vực (Quang Trung: quân sự + vua) |

### 3.1 Cụm di tích — `thuoc_cum`

Rất nhiều di tích quốc gia đặc biệt được xếp hạng **theo cụm**, bằng **một quyết định duy nhất** cho cả quần thể. Ví dụ: Quyết định 2383/QĐ-TTg ngày 09/12/2013 xếp hạng "Di tích lịch sử Đường Trường Sơn – Đường Hồ Chí Minh" gồm 37 điểm trải 11 tỉnh.

Mô hình đã chọn: **giữ bản ghi con**, mỗi hạng mục thành phần là một mục riêng có `thuoc_cum` trỏ về tên cụm mẹ. Không gộp thành bản ghi cụm kèm `hang_muc[]`.

Lý do: hạng mục con có địa chỉ khác nhau thật, và người dùng tìm theo tên con ("chùa Một Mái", "đồi A1") nhiều hơn tên cụm.

Ràng buộc đi kèm:
- `xep_hang` phải ghi rõ quyết định là **của cụm**, không phải của riêng điểm đó. Gán số quyết định của cụm cho từng điểm như thể mỗi điểm được xếp hạng riêng là **làm sai hồ sơ xếp hạng**.
- **Gộp** khi danh sách nguồn tách một di tích duy nhất theo đơn vị hành chính. Đã gặp: VQG Cát Tiên bị tách thành 8 dòng theo xã, ATK Định Hoá thành 5 dòng, Tây Thiên–Tam Đảo thành 2, Đôi bờ Hiền Lương thành 2. Phân biệt: hạng mục con **có tên riêng** thì giữ riêng; cùng một tên chỉ khác xã thì gộp.
- `trung_unesco: true` khi cụm mẹ là di sản thế giới đã có trong `unesco.json`. Ba cụm rơi vào diện này: Quần thể di tích Cố đô Huế, Cố đô Hoa Lư, Tràng An–Tam Cốc–Bích Động.

`do_tin_cay_toa_do` là một cam kết, không phải trang trí. `"cao"` nghĩa là nguồn cho toạ độ cụ thể của chính di tích. `"trung"` là suy từ địa chỉ cấp xã. `"thap"` là chỉ biết cấp huyện/tỉnh. **Không bao giờ ghi chính xác hơn nguồn cho phép** — 34% CSDL nằm trong cụm dưới 500 m, và cách xử lý đúng là gom cụm khi hiển thị, không phải bịa toạ độ đẹp hơn.

---

## 4. Tầng `ho_so` — trang tỉnh

Một bản ghi mỗi file, không có mảng bọc ngoài. 14 trường:

```
slug · ten · trang_thai · giai_nghia_ten · ten_thoi_ky[] · tong_quan
lich_su[] · khao_co[] · van_hoa{} · danh_nhan[] · truyen_thuyet[]
bien_so_xe[] · sap_nhap_2025 · nguon[]
```

Ba biến thể hiện có: 25 file đủ 14 trường · 4 file thiếu `truyen_thuyet` (`can-tho`, `dong-nai`, `dong-thap`, `lao-cai`) · 4 file thiếu `khao_co` (`cao-bang`, `dien-bien`, `hung-yen`, `tuyen-quang`). `khanh-hoa.json` có thêm `truong_sa{}` — **giữ nguyên**, đó là nội dung chủ quyền, không phải trường thừa.

---

## 5. Tầng `tac_pham`

Trường lõi cộng thêm:

| Trường | Ghi chú |
|---|---|
| `tac_gia` | Có thể trống với ca dao, tục ngữ |
| `the_loai` | Tập giá trị đóng theo miền |
| `thoi_ky` | |
| `nguyen_van` | ⚠️ `nhat-ky-thu-chien-tranh.json` có **58/84 mục (69%) là mảng rỗng** — cần rà lại |
| `loi_binh` | Lời giải nghĩa. Không suy đoán — nguồn không nói thì để trống |
| `ban_quyen` | Bản quyền **dịch giả** tách khỏi bản quyền **tác giả**. Thơ chữ Hán hết hạn bảo hộ vẫn có thể có bản dịch còn bảo hộ |
| `lien_quan_tinh[]` | Mảng slug tỉnh. **Tên duy nhất** cho quan hệ với tỉnh — các miền khác đang dùng `tinh`, `tinh_34` |

---

## 6. Tập giá trị đóng

`loai` phải nằm trong tập đã khai của lớp đó, không được để agent tự đặt giá trị mới — giá trị lệch làm popup hiển thị sai. Tập giá trị khai trong `catalog.json`, validator kiểm.

Tương tự với `trang_thai` (`draft` | `reviewed`), `do_tin_cay_toa_do` (`cao` | `trung` | `thap`), `anh_giay_phep` (enum trong `validate_media.mjs`).

---

## 7. Khoá ngoại — chính thức hoá, không khử

Kiểm kê tìm thấy **26 giá trị `id`** và **34 giá trị `slug`** dùng lại ở nhiều file. Trùng trong cùng một file: **0**.

Đây không phải lỗi. Đây là khoá ngoại đang hoạt động không chính thức:

- `id = "bach-dang-938"` nối `battles/` ↔ `journey/hanh-trinh.json` ↔ `overlays/chien-dich-tran-danh.json` — một trận đánh nhìn từ ba miền.
- `id = "tran-hung-dao"` nối `figures/figures-3d.json` ↔ `overlays/danh-nhan-quan-su-co-trung-dai.json`.
- `slug = "hue"` nối `media/images.json` ↔ `provinces/hue.json` ↔ `story/chapters.json`.

**Quy tắc**: `id` duy nhất **trong một file**. Dùng lại `id` giữa các file nghĩa là "cùng một thực thể, nhìn từ miền khác" — đó là chủ ý và phải được giữ. `entries-index.json` khai chúng ra để tra được cả hai chiều.

---

## 8. Hình học — GeoJSON

`boundaries/*.geojson` có **hai tiểu schema trộn trong `properties`**:

- 87–93% feature (tỉnh/thành): khoá tiếng Việt **có dấu cách** — `"Tỉnh thành mới"`, `"Tỉnh thành cũ"`, `"GRDP 2024 (tỷ VND)"`, `"Thu ngân sách 2024 (tỷ VND)"`, `"Diện tích (km2)"`, `"Dân số"`, `"ĐVHC cấp xã"`, `"TT hành chính"`.
- 7–13% feature (đảo, quần đảo chủ quyền): snake_case — `ten`, `loai`, `chu_quyen`, `thuoc_tinh_34`, `thuoc_tinh_63`.

Khoá có dấu cách không dùng trực tiếp làm tên thuộc tính JS hay tên cột SQL được. **Đích**: đổi sang snake_case, giữ nhãn hiển thị tiếng Việt trong bảng nhãn riêng.

🔴 **Bất biến khi đụng vào các file này**: cả ba file đều phải giữ đủ 5 feature chủ quyền — **Hoàng Sa, Trường Sa, Thổ Chu, Bạch Long Vĩ, Phú Quý**. `scripts/audit_sovereignty.mjs` gác việc này và CI chạy nó như bước riêng, bắt buộc.

---

## 9. Chỉ mục — `public/data/_index/`

Sinh ra, không viết tay.

| File | Cấp | Dùng để |
|---|---|---|
| `catalog.json` | file | Định hướng: file nào chứa gì, bao nhiêu mục, khối bọc ngoài hình gì, trường nguồn tên gì, sha256 |
| `entries-index.json` | mục | Tra một mục trong ~4.500 mục mà không mở 98 file. Kèm khối `trung_ten[]` và `trung_toa_do[]` để dò trùng |

```bash
node scripts/build_catalog.mjs
node scripts/build_entries_index.mjs
```

`scripts/validate_catalog_freshness.mjs` so sha256 và **chặn cổng dữ liệu** khi chỉ mục lệch khỏi file thật. Chỉ mục chết còn tệ hơn không có chỉ mục — nó nói dối một cách tự tin.

Ý tưởng lấy từ [PageIndex](https://github.com/VectifyAI/PageIndex): thay vì tìm kiếm theo độ tương đồng vector, cho tác nhân **đọc chỉ mục rút gọn trước, chỉ mở nguồn khi đã khoanh vùng**. Cái đáng học không phải "cây phân cấp" — dữ liệu ở đây không lồng cấp như PDF — mà là registry tĩnh `id → {tên, mô tả ngắn, đường dẫn}` cộng thói quen đọc chỉ mục trước. Vector DB bị loại vì cần server, trái ràng buộc không-backend.

---

## 10. Đường di trú

Làm theo thứ tự. Mỗi bước chạy `npm run validate` trước khi sang bước sau.

1. **Chỉ mục** — `catalog.json` + `entries-index.json` + cổng gác. *(đang làm)*
2. **Thống nhất tên trường nguồn** — `sources` → `nguon` ở 6 file `literature/`; `nguon_chinh` → `nguon` ở 2 file overlay; `nguon` chuỗi → mảng ở `games/` và `streets/`.
3. **Thống nhất khái niệm bị đặt nhiều tên** — `muc_do_tin_cay` → `do_tin_cay_toa_do`; `cap_nhat` → `ngay_cap_nhat`; `tinh` / `tinh_34` → `lien_quan_tinh[]`.
4. **Ép kiểu** — `nam_hien_thi` về chuỗi ở `to-nghe-danh-than.json` (14 mục).
5. **Bổ sung trường lõi thiếu** — `id` cho `di-tich-qgdb`, `unesco`, `bao-vat-quoc-gia`. `unesco.json` lệch nặng nhất, thiếu 6 trường lõi.
6. **Khoá GeoJSON** → snake_case, kèm bảng nhãn hiển thị.
7. **Wrapper thống nhất** — `items[]` cho mọi file dạng danh sách. Ngoại lệ giữ nguyên: `features` (chuẩn GeoJSON), 4 mảng song song của `games/olympia-questions.json` (bốn vòng thi là bốn tập khác nhau, không phải một danh sách).

Bước 2–6 đụng dữ liệu thật. Theo quy tắc dự án: agent viết ra scratchpad, main hợp nhất sau dry-run đối chiếu chéo. Không agent nào ghi thẳng vào `public/data/`.
