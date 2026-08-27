# RELEASE — việc đã hoàn thành

Nhật ký những gì ĐÃ XONG, có bằng chứng. Việc còn lại nằm ở [`PLAN.md`](PLAN.md) — file kế hoạch duy nhất của dự án.

Quy tắc: một hạng mục chỉ được chuyển từ `PLAN.md` sang đây khi có **bằng chứng kiểm chứng được** — số commit, cổng validator xanh, hoặc kết quả đo. "Trông có vẻ xong" không đủ.

Tổng hợp từ 17 file kế hoạch rời rạc của các phiên 2026-07-17 → 2026-07-26, gộp ngày **2026-08-03**.

---

## 2026-08-27 — Mở rộng 16 agent song song, hai ca: +608 mục lớp phủ, sa đồ phủ kín 267/267, và một cổng bị bịt lỗ

| Chỉ số | Giá trị | Đo bằng |
|---|---|---|
| Mục lớp phủ | **2.903 → 3.511** (+608), chạm **32/35 lớp** | đếm `items[]` từng file |
| File dữ liệu · tổng mục | **351 → 378** · **6.087 → 6.722** | `_index/catalog.json` |
| Sa đồ chiến dịch | **240 → 267** (+27), **phủ kín 267/267** | `battles/_index.json` |
| Trận trong lớp phủ THIẾU sa đồ | **14 → 0** | đối chiếu id lớp phủ ↔ `battles/` |
| Trích văn tịch nguyên văn | **167 → 242 đoạn** / **90 → 153 trận** | `verify_trich_van_tich.mjs` |
| Trích dẫn cổng KHÔNG đối chiếu được | **7 → 0** | `verify_trich_van_tich.mjs` |
| Sa đồ còn nền trơn (thiếu `dia_hinh`) | **1 → 0** | quét `battles/*.json` |
| id trùng xuyên 35 lớp | **0** | `validate_overlays.mjs` |
| Cổng dữ liệu | **14/14 xanh** | `npm run validate` |
| Chủ quyền Hoàng Sa – Trường Sa | **13/13 thời kỳ**, kể cả khi bật 35 lớp phủ | `verify_chu_quyen.mjs` (probe Chrome) |
| Build | `tsc` exit 0 · `vite build` xanh | `npm run build` |

**Lớp mở rộng mạnh nhất**: di sản phi vật thể +37 (27→64) · bảo vật quốc gia +36 · di tích cấp tỉnh +35 · Mẹ VNAH +30 · di tích cách mạng +28 · anh hùng cận-hiện đại +24 · danh nhân văn hoá +24 · công trình kỷ lục +22 (14→36, lớp mỏng nhất cũ) · nghệ nhân di sản +22 · nghĩa sĩ Cần Vương +22. **Ba lớp không chạm**: `ban-do-co` (cần ảnh quét, không phải việc tra cứu), `unesco` (đã đủ), `khoa-bang-danh-nhan` (167 mục, đã dày).

**Sửa dữ liệu cũ có bằng chứng**: 5 di tích quốc gia đặc biệt bị gắn nhầm `dot: 10` → **`dot: 11`** (ATK II Hiệp Hòa, Căn cứ Cái Chanh, Đền An Xá, Đình Hạ Hiệp, Gành Đá Đĩa). Đối chiếu raw HTML `xaydungchinhsach.chinhphu.vn`: đợt 11 = QĐ 2280/QĐ-TTg 31/12/2020 đúng 7 di tích, đợt 10 = 7 di tích. Sau sửa: đợt 10 = 7, đợt 11 = 7, tổng lớp = 153 khớp danh sách chính thức. Mỗi mục có `ghi_chu_bien_tap` ghi rõ căn cứ.

**Cổng `verify_trich_van_tich.mjs` bịt hai lỗ hổng** (`scripts/verify_trich_van_tich.mjs`):
1. Toàn bộ trích dẫn nguồn `qdnd.vn` báo "không tải được" — CDN chống bot trả 302 trỏ về chính URL kèm `Set-Cookie` thử thách, `curl -L` không giữ cookie nên lặp tới trần 50 hop. **Và exit code vẫn 0** → cổng im lặng cho qua đúng thứ nó không với tới. Vá bằng cookie jar (`-b`/`-c`) + UA trình duyệt đầy đủ, cộng khối tổng kết cuối in riêng danh sách "CHƯA được máy đối chiếu".
2. Sau khi (1) thông, lộ ra một báo động giả: bước `.replace(/<[^>]+>/g, " ")` biến thẻ đóng sát dấu câu (`…1968</a>, mũi…`) thành `1968 , mũi` — lệch khỏi trang thật, **tố oan một đoạn trích chính xác**. Vá bằng `.replace(/\s+([,.;:!?…])/g, "$1")` đặt trong `tai()` (dọn rác do chính bước lột thẻ tạo ra), **cố ý KHÔNG đặt trong `chuan()`** vì `chuan()` áp cho cả hai vế — thêm luật ở đó là nới tiêu chuẩn so khớp cho mọi đoạn trích.
Kết quả sau vá: **213 khớp · 0 lệch · 0 không tải được**, kiểm hồi quy không ca nào tụt.

**Phát hiện về chất lượng dữ liệu do agent sinh — đo được, không phải cảm tính.** Mọi agent tự soát lại việc mình vừa báo là xanh cả 4 cổng đều tìm ra lỗi thật: **22% · 23% · 31% · 31% · 38% · 67%**. Chi tiết cơ chế, hạng mục rủi ro xếp hạng, và các luật rút ra: xem khối đợt 2026-08-27 trong `PLAN.md`.

**Ca chiều — soát chéo có hệ thống.** Ca sáng đo tỉ lệ sai bằng **tự soát**; ca chiều đổi sang **soát chéo**: mỗi agent soát việc của agent khác, theo một file luật chung (`LUAT-DOT2.md`, 13 mục) phát trước khi làm thay vì nhắc miệng giữa chừng. Tỉ lệ sai tụt rõ và tụt có lý do:

| Khối soát chéo | Tỉ lệ sai | Ghi chú |
|---|---|---|
| 56 danh hiệu `anh-hung-can-hien-dai` | **1,8%** (1/56) | bậc 3 cho 20/24 mục |
| 21 danh hiệu `danh-nhan-van-hoa` + `bao-tang` | **4,8%** (1/21) | lỗi duy nhất là một Giải thưởng Hồ Chí Minh không có thật |
| 22 danh hiệu dtts · nghệ nhân · danh y | **13,6%** (3/22) | **0/17 lỗi ở danh hiệu**; cả 3 lỗi ở địa chỉ/số đo/tuổi |
| 53 mục tín ngưỡng | **17%** (9/53) | |
| 27 file sa đồ | **15%** (4/27) | gồm một ca bịa "Đặc khu Quảng Ninh 20/4/1979" |
| 21 khẳng định `tri-thuc-khoa-hoc` | **~25%** | lỗi dồn ở tên cơ quan và số "hơn X" thổi phồng |
| 43 mục quân sự · vua chúa (tự soát) | **46,5%** (20/43) | tự soát vẫn cao hơn soát chéo |

**Kết luận đáng giữ: danh hiệu nhà nước hoá ra là hạng mục ĐÚNG nhất khi được soát bằng bậc 3, không phải sai nhất.** Ca sáng xếp nó rủi ro số 1 vì ba ca bịa; ca chiều soát 17 khẳng định danh hiệu ở một khối thì **đúng 17/17**, và lỗi rơi hết sang địa chỉ cấp thôn, số đo, tuổi — tức hạng mục #3–#4. Lý do: danh hiệu có **văn bản gốc kiểm được** (Quyết định Chủ tịch nước, Quyết định Bộ VHTTDL có danh sách tên đầy đủ), còn "thôn Dê Dàng" hay "86 tuổi" thì không có văn bản nào để đối chiếu. **Hạng mục nguy hiểm không phải hạng mục quan trọng nhất, mà là hạng mục KHÔNG CÓ NGUỒN ĐÓNG để đối chiếu.**

**Bốn ca đáng ghi lại:**
- `ha-quang-voc` — được gán "truy tặng Anh hùng LLVTND"; đọc toàn văn bài `nhandan.vn` thì chữ "Anh hùng" chỉ nằm trong tiêu đề mô tả **đơn vị** ("đặc công Rừng Sác Anh hùng"), không phải danh hiệu cá nhân. Và `ghi_chu_bien_tap` cũ **cũng đã bị nhiễm lỗi bịa** — nó tự khẳng định "nguồn xác nhận được truy tặng". Ghi chú biên tập không miễn nhiễm.
- `le-van-cong` — mức tạ ghi 181kg, nguồn ghi 183kg. 181,5kg là kỷ lục Incheon 2014. **Con số có thật, gắn nhầm sự kiện** — không cổng nào bắt được.
- `bui-hien` — năm sinh ghi 1919, nguồn ghi nguyên văn "(1909 – 2009)". Sai 10 năm.
- `to-ngoc-thanh` — ghi "42 tập dân ca"; nguồn có "12 tập phổ biến" + "30 tập chuyên đề" và **không có số 42 nào**. Agent tự cộng rồi ghi như số đọc được.

**Ba mục bị xoá theo một luật sai, cứu lại được cả ba.** Luật cũ "trang trống → xoá" bị bác sau ca `mod.gov.vn` (đặt cookie rồi `window.location.reload()`, curl thấy rỗng trong khi trang đầy đủ). Luật mới: chỉ xoá khi **NXDOMAIN xác nhận bằng cả `nslookup` lẫn `curl`**, hoặc **trang mở được nhưng không nhắc đối tượng**. Áp lại: `dao-nguyen-pho` (SSL hết hạn + nginx trả 404 giả cho non-browser — domain sống ở 27.71.228.229), `le-khiet` (404 một URL, domain sống), `nguyen-van-giap` (NXDOMAIN thật, nhưng tìm được nguồn thay của GS Đinh Xuân Lâm). Cả ba viết lại dày hơn bản cũ, và `dao-nguyen-pho` còn phát hiện **nguồn nhà nước tự vênh năm mất 1907/1908** — đã nêu cả hai theo bất biến #4.

**Va chạm ghi song song — và cổng nào bắt được nó.** Ba file bị hai agent cùng ghi (`di-san-phi-vat-the`, `huyen-su-khai-quoc`, `nghe-nhan-di-san`) do phân việc chồng nhau. Các agent tự phát hiện và tự rút. Bài học kỹ thuật đáng giữ, do `khoabang-suthan` rút ra: **grep `entries-index.json` KHÔNG đủ khi nhiều agent chạy song song** — index là ảnh chụp cũ, không thấy file vừa bị sửa sống trên đĩa. `validate_overlays.mjs` quét file sống mới là cổng thật.

**Quyết định của chủ dự án — tầng §9 mới.** 10 mục thiếu niên cứu người 2023–2026 (8/10 còn sống, ghi họ tên thật + lớp + trường) không khớp tầng nào trong T1–T5. Chủ dự án quyết **giữ nguyên, nêu tên thật, cho publish**. Đã nâng 10 mục `draft → reviewed` (lần nâng hợp lệ duy nhất của đợt — `docs/lich-su/four-track-plan.md` quy định việc nâng là của chủ dự án), mở **tầng T6 = trẻ vị thành niên còn sống, tên thật**, đăng ký 8 mục vào `docs/section9-sensitive.json` (181 → 192 dòng).

---

## 2026-08-26 — Sa đồ diễn như phim · một trình dựng duy nhất · bản đồ cổ phủ được lên bản đồ

| Chỉ số | Giá trị | Đo bằng |
|---|---|---|
| Trận dùng trình dựng tổng quát | **240/240** (trước: 239) | `validate_battles.mjs` |
| Dòng gỡ khỏi `battle.ts` | **−133** | `git diff --stat` |
| Khoá `buoc[].hien` được cổng đối chiếu | **2.456** trên 240 hồ sơ · **0 lệch** | `validate_battles.mjs` |
| Tấm bản đồ cổ phủ được lên bản đồ | **2** · **4 điểm neo** render | probe Chrome |
| Nút dưới 44px (sa đồ · hành trình · topbar) | **15 → 0** | `getBoundingClientRect()` Chrome |
| Cổng dữ liệu | **14/14 xanh** | `npm run validate` |
| Chủ quyền hiển thị | **13/13 thời kỳ** | `npm run verify:chuquyen` |
| Type check · build | **exit 0 · xanh** | `npx tsc --noEmit` · `npm run build` |

### 1. `src/bandoco.ts` — bản đồ cổ georef thành LỚP DỮ LIỆU

Trước: đúng một tấm Taberd 1838 gắn cứng trong `main.ts` — URL ảnh và 4 góc là
hằng số TypeScript. Thêm tấm thứ hai nghĩa là sửa mã. Nay danh sách đọc từ
`media/ban-do-co.json`: tấm nào mang khối `georef` là tự xuất hiện trong bảng lớp,
**thêm tấm mới chỉ còn là việc dữ liệu**. Kèm điểm neo «tên xưa ↔ tên nay» bấm ra
popup và thanh độ mờ riêng từng tấm. Nạp lười: chỉ fetch khi người dùng mở mục.

Tấm thứ hai nạp trong đợt này — Vandermaelen 1827 «Partie de la Cochinchine» —
phải quy đổi kinh tuyến: lưới in trên tờ theo **kinh tuyến Paris**, cộng 2,337° ra
Greenwich. Đối chiếu kiểm tra: Nha Trang trên tờ ra 109,24°Đ, thực tế 109,19°.
`validate_media.mjs` gác khối `georef` — 4 góc phải nằm trong khung Đông Nam Á,
bắt buộc khai `can_cu` (đo lưới thế nào) và `ghi_chu` cảnh báo, và hiện chỉ chấp
nhận `do_chinh_xac: "xap-xi"` vì chưa tấm nào đạt mức trắc địa.

🔴 **Một lỗi chủ quyền THẬT bắt được bằng trình duyệt, không phải bằng đọc mã.**
Bản đầu chèn raster trước `${ERAS[0].id}-label`. Lớp đó **sinh lười**: lúc mở trang
chỉ `era-34` tồn tại, nên hàm trả `undefined` và MapLibre chèn ảnh scan **lên trên
cùng** — phủ mất nhãn Hoàng Sa / Trường Sa. Đo được: raster @20–21 còn
`chu-quyen-labels` @19. `tsc` xanh, console sạch, cổng dữ liệu xanh — không thứ nào
thấy được. Chữa bằng `truocLopNhan()`: tra lớp **symbol đầu tiên của style hiện
tại** ngay lúc bật tấm (nền bản đồ dự án không có nhãn nào, nên lớp symbol đầu tiên
luôn là nhãn dự án tự vẽ). Đo lại: raster @5–6, `chu-quyen-labels` @21, hai quần đảo
vẫn render khi bật cả hai tấm phủ.

### 2. Sa đồ diễn như phim — 5 hiệu ứng, tất cả tắt được

- **Camera thu phóng theo bước**: mỗi bước lượn vào cụm phần tử đang hiện. Chỉ là
  `transform` CSS trên `<g class="sd-cam">` nên toạ độ dữ liệu và thuật toán xếp
  nhãn (`getBBox` đo hệ toạ độ cục bộ) không hề biết đến nó. Trần hệ số **1,5** đo
  bằng mắt trên Điện Biên Phủ: 1,75 zoom sát tới mức nửa khung là đất trống.
- **Nút ▶ Phát** tự chuyển bước 5 giây/bước; mọi thao tác tay dừng nó; đứng ở bước
  cuối mà bấm Phát thì chiếu lại từ đầu.
- **Vạch hành quân** chạy dọc thân mũi tên — tối đa 3 mũi/bước vì `dashoffset` tốn
  paint (không compositor-only).
- **Pop-in «xuất trận»** cho phần tử MỚI hiện ở bước này (mũi tên đã có animation vẽ
  dần riêng, không chồng hai hiệu ứng).
- **Chớp giao chiến + rung khung** khi mũi tên có phe cắm tới gần (<95 đơn vị) một
  khối phe kia đang hiện. Suy từ dữ liệu sẵn có, **không thêm trường mới**; ngưỡng
  khoảng cách chính là phép né ca «mũi tên rút lui» — rút thì không chĩa vào ai.

`prefers-reduced-motion: reduce` tắt sạch cả năm; camera nhảy thẳng, không bay lượn.

### 3. Gỡ trình dựng vẽ tay — và dựng cổng thay chỗ nó

`bach-dang-938` là hồ sơ cuối cùng còn dùng SVG vẽ tay riêng. Bản đó thiếu cả 4 thủ
pháp làm đẹp lẫn `veNenNhan()`, và mọi hiệu ứng mới đều bỏ qua nó. Chuyển thành 4
khối `dia_hinh` + 9 `phan_tu` theo đúng lối `bach-dang-981` và `bach-dang-1288` đã
dùng cho cùng cốt truyện; **`coc-ngam`/`coc-lo` gộp về MỘT bãi cọc** — ngầm hay lộ
là việc của con nước, không phải hai vật thể. Dải rừng hai bờ có căn cứ trong chính
trích văn tịch của hồ sơ («cây cối um tùm che lấp bờ bến» — Cương mục). Nội dung 5
bước, nguồn, trích văn tịch giữ nguyên từng ký tự.

Gỡ được **133 dòng** `battle.ts`. Nhưng gỡ trình dựng tạo ra hai kiểu hỏng **CÂM**,
nên `validate_battles.mjs` nhận hai luật mới thay chỗ:

1. `sa_do_kieu` **phải** là `"tong-quat"` — thiếu trường thì render RỖNG, console sạch;
2. mọi khoá `buoc[].hien` phải có trong `phan_tu[]` — gõ sai một khoá thì phần tử đó
   lặng lẽ không hiện, dữ liệu vẫn hợp lệ hoàn toàn.

Đo lúc thêm cổng: **240 hồ sơ / 2.456 khoá `hien` — 0 lệch.**

**Vòng đo đầu bắt 2 cặp nhãn chồng nhau** vì nhãn «Bãi cọc vạt nhọn bịt sắt, đóng
ngầm dưới lòng sông» dài ~500px trên khung 1000px. Rút gọn nhãn + nới bố cục, đo
lại còn 0. Quét lô mẫu 18/240 trận trải đều năm 40→1288 (nạp lại trang mỗi 6 trận,
theo bài học cũ về trang nặng dần): tất cả đúng số bước / số lớp, console sạch.

### 4. Hành trình → Màn B đúng trận

Nút «Xem sa đồ trận này» trong một chặng hành trình trước đây bấm hộ nút mở Màn A —
người dùng rơi vào danh sách 240 trận và phải tự tìm. Nay `journey.ts` phát
`CustomEvent("sado:mo-tran")` kèm `battle_id`; `battle.ts` đã nghe sẵn từ trước.

### 5. CSS mồ côi — và cái nó làm lộ ra

`journey.ts` nay chỉ phát class `jn-*`, `battle.ts` chỉ phát `sd-*`, nên 9 bộ chọn
trong `style.css` không còn mã nào sinh ra. Xoá. **Giữ lại đúng hai thứ PLAN đã
cảnh báo**: `.journey-stage` (figures3d đọc kích thước container qua nó — mất là
canvas Three.js co về 0px) và `.tide-indicator`.

🔴 Xoá xong lộ ra chuyện lớn hơn: **`2.75rem` không phải 44px.** `theme.css` đặt
`html { font-size: 0.94rem }` nên 1rem = 15,04px và 2.75rem ra 41,4px. `style.css`
đã sửa từ 2026-08-05, nhưng ba file khai LẠI khối vùng chạm bằng `rem` trần — mỗi
file kèm một chú thích nói mình đang theo «luật 44px». Đo Chrome thật:

| Khối | Trước | Sau |
|---|---|---|
| `sado.css` — 5 chấm bước + 4 nút điều khiển + nút quay lại | 41×41 (`min-height` 41,36px) | **44×44** |
| `hanhtrinh.css` — ◀ ▶ | 41×41 | **44×44** |
| `hanhtrinh.css` — «Toàn bộ lộ trình» | 422×41 | **422×44** |
| `theme.css` — menu «Khám phá» | 101×41 | **101×44** |
| `theme.css` — ô chọn thời kỳ | 249×41 | **249×44** |

Nay không còn `min-height: 2.75rem` trần nào trong `src/*.css`.

---
## 2026-08-25 — Chú giải từ khó cho trẻ em + lớp phủ «Bản đồ cổ»

| Chỉ số | Giá trị | Đo bằng |
|---|---|---|
| File dữ liệu | **348** (+1) | `catalog.json` sau `build:index` |
| Tổng mục | **5.628** (+35) | như trên |
| Lớp phủ bản đồ | **35** (+1) | bảng lớp trên màn hình |
| Bảng từ khó trẻ em | **187 cụm** · đánh dấu **4.779** lượt | đo trên 5.111 khối `mo_ta`/`cong_trang`/`loi_binh` |
| Bản đồ cổ | **19 tấm** (+1) · **34 điểm neo** · **15 địa điểm** | `validate_media.mjs` |
| Cổng dữ liệu | **13/13 xanh** | `npm run validate` |
| Chủ quyền — dữ liệu · hiển thị | **xanh · 13/13 thời kỳ** | `audit_sovereignty.mjs` · `verify:chuquyen` |
| Type check · build | **exit 0 · xanh** | `npx tsc --noEmit` · `npm run build` |

### 1. `src/tu-kho-tre-em.ts` — chú giải từ khó bấm-ra-xem

`tu-vung-tre-em.ts` đã đổi NHÃN lớp phủ sang tiếng trẻ em, nhưng phần chữ nặng nhất vẫn nguyên: `mo_ta` của 5.111 khối văn viết bằng ngôn ngữ hồ sơ di sản. Viết lại 5.111 khối là việc nhiều tháng; chú giải TỪ làm được ngay và **không đụng một chữ nào của bản gốc** — người lớn vẫn đọc đúng câu văn cũ, chế độ người lớn trả về đúng `esc()` không thêm một byte.

Bảng **187 cụm**, chọn theo ba luật **đo trên dữ liệu thật** chứ không liệt kê theo trí nhớ:

1. **Chỉ nhận cụm đa âm tiết** — loại «phủ» (285 lần), «châu» (273), «tổng» (247), «trấn» (163), «lộ» (98), «then» (51), «chèo» (21) vì đa nghĩa. Chú giải sai tệ hơn không chú giải.
2. **Nghĩa phải đúng trong MỌI ngữ cảnh của kho** — «duy tân» viết bao được cả phong trào lẫn niên hiệu vua nên giữ; từ nào không bao được thì bỏ.
3. **Có mặt thật ≥2 lần.**

⚠️ **Lượt soát khớp giả bắt được ba lỗi tên riêng bị chú giải như từ chung**: «Nhà thơ Nguyễn **Thế Kỷ**», «châu Nam **Bố Chính**», «Vân **Nam tiến** đánh». Vá bằng `hoaLienTruoc()` — bỏ qua cụm viết hoa nằm giữa chuỗi chữ hoa, **cố ý không nhận dấu chấm** làm chỗ nối vì sau dấu chấm là câu mới, chữ hoa ở đó là hoa đầu câu. Cắt thêm 5 mục không bao được ngữ cảnh, nới nghĩa «kỵ binh» (còn dùng cho đơn vị cơ động nhanh) và «thái y» (còn là «Thái y viện»).

Nối **16 sink**: 10 popup lớp phủ, `tong_quan` + `giai_nghia_ten` + 4 danh sách kể chuyện của hồ sơ tỉnh, Nam tiến, thẻ phim giáo dục. `listKho()` **tách riêng khỏi `list()`** vì cùng hàm đó dựng cả danh sách NGUỒN — gạch chân chú giải giữa một dòng trích dẫn là làm hỏng chính cái đang được trích.

An toàn XSS: dò trên chuỗi THÔ rồi mới `esc()` từng đoạn, nên cụm không cắt vỡ được chuỗi thực thể HTML.

**Nghiệm thu Chrome thật**: hồ sơ Hà Nội **13 chú giải**, khối nguồn **0 nút**; popup Hoành Sơn Quan bung đúng thẻ 💡; đổi sang chế độ người lớn gỡ sạch markup, câu trở về nguyên văn «Chùa dựng thời kinh đô Thăng Long.».

### 2. Lớp phủ «Bản đồ cổ» — địa danh xưa đặt đúng vị trí thật

19 tấm bản đồ cổ trong `media/ban-do-co.json` trước nay chỉ sống trong Thư viện dưới dạng chữ: **0/18 mục có toạ độ**, chưa tấm nào lên bản đồ.

- **`diem_neo[]`** — mỗi bản đồ khai những địa danh nó GHI TRÊN MẶT GIẤY, kèm nơi đó là gì ngày nay và toạ độ thật. **34 điểm neo.** Toạ độ Hoàng Sa/Trường Sa lấy đúng hằng số `audit_sovereignty.mjs` đang dùng.
- **Gom theo ĐỊA ĐIỂM, không theo bản đồ** — quyết định đến từ việc nhìn bản đồ thật: 12 tấm cùng gọi tên quần đảo Hoàng Sa, để mỗi tấm một điểm thì 12 chấm chồng khít; `tachDiemTrung` chỉ dời ≤65 m nên ở zoom thường 11/12 tấm bấm không tới. Gom còn **15 địa điểm**, mỗi điểm mang danh sách mọi bản đồ từng ghi tên nơi đó. Màu **vàng** = nơi có hơn một phía cùng ghi tên.
- **Bổ sung tra cứu**: Hoài Đức phủ toàn đồ (1831) mở vỉa ra ngoài mảng chủ quyền · «Đại Hải» của Hồng Đức bản đồ, KHÔNG neo vào Bãi Cát Vàng vì mô tả dải cát chỉ đến qua bản chép đời sau · Bản Quốc Địa Đồ **vênh niên đại 1881 ↔ 1853 (Khải đồng thuyết ước), GIỮ CẢ HAI** · Hải Quốc Đồ Chí ghi rõ chỗ vênh «Vạn Lý Trường Sa»/«Thiên Lý Thạch Đường» chưa phân định được tên nào ứng quần đảo nào.
- ⚠️ **KHÔNG CÓ BẢN ĐỒ NÀO TRƯỚC THẾ KỶ XV** — nghề vẽ bản đồ nhà nước ở Việt Nam bắt đầu từ Hồng Đức bản đồ (1490). Văn Lang, Âu Lạc, Bắc thuộc, Lý – Trần không để lại bản đồ nào, và dự án KHÔNG dựng bản đồ phỏng đoán để lấp chỗ trống.
- **Cổng mới** trong `validate_media.mjs`: điểm neo phải đủ `ten_xua`/`ten_nay`/`ghi_chu`, toạ độ trong khung Biển Đông – Đông Dương, `do_tin_cay ∈ {cao|trung|thap}`; tệp lớp phủ sinh ra phải khớp bản gốc. **Đã thử ca dương tính cả hai — cổng đỏ đúng chỗ.**

🔴 **Lỗi chỉ Chrome thật mới lộ**: MapLibre chuỗi hoá mọi giá trị **lồng** trong feature `properties`, nên `ban_do_ghi[]` tới hàm dựng popup dưới dạng chuỗi JSON, `arr()` trả mảng rỗng và popup hiện **«Xem 0 tấm bản đồ»**. Không lỗi console, `tsc` xanh, `build` xanh. Vá bằng `goSerialize()` ở tầng parse.

**Nghiệm thu Chrome thật**: mũi nam Hải Nam gom **5 tấm** (1635·1717·1737·1904·1905), Hoàng Sa gom **12 tấm** (1613→1881) đủ 12 dòng; chú giải từ khó trẻ em chạy luôn trong popup («cương vực?»); console sạch.

**Commit**: `d7fd76b` (chú giải từ khó) · `80c7911` (bản đồ cổ).

---

## 2026-08-24 — Hướng dẫn thao tác cho trẻ em + chủ đề «Sách học ngày xưa»

| Chỉ số | Giá trị | Đo bằng |
|---|---|---|
| File dữ liệu | **347** (+2) | `catalog.json` sau `build:index` |
| Tổng mục | **5.593** (+43) | như trên |
| Chủ đề thư viện | **15** (+1) · **765 tác phẩm** | thấy trên màn hình thư viện |
| Cổng dữ liệu | **13/13 xanh** | `npm run validate` |
| Chủ quyền — dữ liệu · hiển thị | **xanh · 13/13 thời kỳ** | `audit_sovereignty.mjs` · `verify:chuquyen` |
| Type check · build | **exit 0 · xanh** | `npx tsc --noEmit` · `npm run build` |

### 1. `src/huong-dan.ts` — «Cầm tay chỉ việc» + «Sổ tay thám hiểm»

Lỗ hổng đóng lại: chế độ trẻ em trước đó chỉ đổi màu và cỡ chữ. `grep -rn "tour\|onboard\|huong-dan\|welcome" src/` ra **0** — không có một cơ chế chỉ đường nào, đứa trẻ mở trang lên là đối diện bản đồ 34 lớp phủ và thanh trượt 4000 năm.

- **10 bước cầm tay chỉ việc**: lớp che khoét sáng đúng phần tử THẬT trên màn hình + bong bóng lời Lạc & Âu. **Không có nút «Tiếp»** — mỗi bước nghe một sự kiện thật của ứng dụng và chỉ qua khi người dùng tự làm được.
- **Sổ tay 17 nhiệm vụ** (`#huongdan-panel`, panel thứ 12): cảm biến chạy nền từ lúc nạp trang, nên việc trẻ tự mò ra trước khi mở sổ tay vẫn được tính. Tiến độ trong `localStorage`, không PII.
- **Chữ hai bản**: `loiBe` cho trẻ, `loiNguoiLon` cho người lớn; đổi chế độ giữa chừng thì vẽ lại đúng bản. Lời mời lần đầu CHỈ hiện ở chế độ trẻ em.
- `pointer-events: none` trên lớp che là **ràng buộc**, không phải tinh chỉnh: bỏ đi là chặn chính thao tác mà bước hướng dẫn đang bảo trẻ làm.

**Ba lỗi bắt được bằng Chrome thật, không phải bằng đọc mã** — cả ba đều build xanh, `tsc` xanh, và đều hỏng khi chạy:

| Lỗi | Triệu chứng | Nguyên nhân |
|---|---|---|
| Bước «bấm vào tỉnh» bất khả thi | Bước trước vừa bảo kéo về thời Âu Lạc, mà thời ấy KHÔNG có tỉnh nào — bấm chỉ ra popup cương vực | Thứ tự bước sai. Đảo «bấm bản đồ» lên trước, và nhận CẢ popup cương vực làm bằng chứng |
| Bấm vạch mốc không tính là «kéo thanh thời gian» | Thời kỳ đổi thật mà bước vẫn treo | `moc-lich-su.ts` gán thẳng `.value` rồi gọi `setPeriod` — KHÔNG bắn `input`. Thêm cảm biến quan sát chữ `#period-label` |
| Huy hiệu nhảy **1/17** ngay khi mở trang | Chưa ai làm gì đã có một nhiệm vụ tick | Nhãn thời kỳ đổi từ «Đang tải dữ liệu…» sang tên thời kỳ — cảm biến đọc đó là người dùng đổi thời kỳ. Lấy lại mốc so sánh khi chữ cũ còn là chỗ giữ chỗ |

Nghiệm thu trên Chrome thật (dev server): mời lần đầu → 10 bước → bước 1 xong bằng cú bấm vào Tây Ninh, bước 2 xong bằng cú bấm VẠCH MỐC (đường trước đây hỏng), bước 3 xong bằng chip «Di sản & Di tích»; sổ tay 5/17 rồi 6/17; đổi sang chế độ người lớn thì bảng vẽ lại đúng bản chữ người lớn; console sạch; nhãn **Hoàng Sa + Trường Sa** hiện đủ trong mọi ảnh chụp.

### 2. Chủ đề thư viện thứ 15 — «Sách học ngày xưa» (26 mục)

- `sgk-xua-tho.json` — **17 bài thơ nguyên văn**, từ Pháp Thuận (915–990) tới Thâm Tâm (1917–1950). Toàn bộ đã hết thời hạn bảo hộ.
- `sach-hoc-xua.json` — **9 bộ sách** dạng giới thiệu: Quốc văn giáo khoa thư · Luân lý giáo khoa thư · Việt Nam sử lược · Quốc văn trích diễm · Việt Nam văn học sử yếu · Việt Nam thi văn hợp tuyển · Cổ học tinh hoa · Tục ngữ phong dao · Truyện cổ nước Nam.
- `ca-dao-tuc-ngu.json` **127 → 143**: 16 bài ca dao – tục ngữ vỡ lòng. Lỗ hổng tìm ra bằng cách đếm chứ không phải đoán — 121/127 mục cũ đều neo theo tỉnh, nên toàn bộ ca dao phổ quát (*Công cha như núi Thái Sơn*, *Bầu ơi thương lấy bí cùng*, *Con cò mà đi ăn đêm*, *Thằng Bờm*…) thiếu sạch.
- Hai trường mới trên lược đồ `Poem`: `sach_xua` (bộ sách đã in bài này) và `giai_nghia[]` (từ khó → nghĩa, hiện ra bằng `<details>` — thơ cổ dày chữ Hán-Việt, không giải nghĩa thì trẻ đọc hết bài vẫn không hiểu).

**Cổng bản quyền mới trong `validate_literature.mjs`**: chủ đề này in NGUYÊN VĂN thơ đầu thế kỷ XX nên ranh giới bản quyền là chỗ dễ vượt nhất kho. Validator đọc năm mất từ chuỗi `tac_gia` và đỏ cổng nếu > 1975 (Điều 27 Luật SHTT: đời tác giả + 50 năm). Trần Tuấn Khải †1983, Thế Lữ †1989, Vũ Đình Liên †1996 vì thế không thể lọt vào tệp này.

Nguồn: Báo Sài Gòn Giải Phóng · Báo Thế giới và Việt Nam · NXB Trẻ · Báo Công an Nhân dân · NXB Chính trị quốc gia Sự thật · Báo Hưng Yên · Báo Dân Việt · Tạp chí Công dân và Khuyến học · Báo Pháp Luật TP HCM · VietNamNet · Báo Người Lao Động — không mục nào dựa vào wiki hay kho thơ cộng đồng.

---

## Ảnh chụp hiện trạng — 2026-08-11 (cuối phiên «làm hết kế hoạch»)

| Chỉ số | Giá trị | Đo bằng |
|---|---|---|
| File dữ liệu | **344** | `catalog.json` (build:index tươi) |
| Tổng mục | **5.398** | như trên |
| Trận đánh / mốc thời gian | **251 / 196** | đếm file |
| Cổng dữ liệu | **13/13 xanh, exit 0** | `npm run validate` |
| Chủ quyền hiển thị | **13/13 thời kỳ** | `verify:chuquyen` (trên Vite 6) |
| Smoke | **9 đạt · 0 hỏng** | `npm run smoke` (trên Vite 6) |
| Draft §9 còn giữ | **16 CHỦ Ý** (2 sensitive-list + 14 chờ Q3) + 155 video kênh ngoài nhà nước | script promote9 |
| URL ảnh sống | **551/551 sau vá** (548 sống + 3 vá từ hỏng) | quét tuần tự 1,1 s/URL |
| npm audit prod | **0 lỗ hổng** | `npm audit --omit=dev` |

Phiên 2026-08-11 (11 commit `21e0f7c`→`83b7b67`): UI học Google Maps (chip bar · search pill · permalink) · thuật toán bản đồ (va chạm icon theo zoom · tách điểm trùng render-time) · +52 mục dữ liệu 4 agent + 15 video giáo dục · §9 nâng 1.413 · meta-CSP · Vite 6.4.3 · id cho 2 sổ đăng ký · 4 hex cuối lên token · aria-live hồ sơ tỉnh · email cá nhân ra khỏi User-Agent.

---

## Ảnh chụp hiện trạng — 2026-08-03

| Chỉ số | Giá trị | Đo bằng |
|---|---|---|
| File dữ liệu | **98** (.json + .geojson) | kiểm kê `public/data/**` |
| Tổng mục | **4.531** | như trên |
| Dung lượng dữ liệu | **8.134.365 byte** (7,76 MB) | như trên |
| Lớp phủ bản đồ | **34 file / 2.347 mục** (52% toàn bộ) | như trên |
| Lỗi parse JSON · BOM | **0 · 0** | như trên |
| Cổng dữ liệu | **12/12 xanh** | `npm run validate` |
| Bất biến chủ quyền, mức hiển thị | **13/13 thời kỳ xanh** | `npm run verify:chuquyen` — Chrome headless |
| Type check | **exit 0** | `npx tsc --noEmit` |
| Mục thiếu nguồn cấp mục | 898 (19,8%) — trong đó 622 có nguồn cấp file | kiểm kê schema |

Ba file `boundaries/*.geojson` đều có đủ 5 feature chủ quyền: **Hoàng Sa, Trường Sa, Thổ Chu, Bạch Long Vĩ, Phú Quý** — đúng bất biến §1.

---

## Dữ liệu

### Huyền sử · danh nhân
- Đợt 1 Huyền sử khai quốc + Tứ bất tử + Hải đội Hoàng Sa — `huyen-su-khai-quoc.json` (~10 mục). Lớp này giữ riêng ở Phase 3 vì chứa nội dung chủ quyền.
- Đợt 2 Anh hùng chống Bắc thuộc — `khoi-nghia-bac-thuoc.json`, 8 mục, commit `68d3b67`.
- Đợt 3 Khoa bảng — `khoa-bang-danh-nhan.json`, 9 mục.
- Đợt 5 Danh tướng kháng chiến — `danh-tuong-khang-chien.json`, 7 mục.
- Dọn 25 link Wikipedia khỏi `di-tich-qgdb.json`.
- Sóng 3 (`05bec73`): `chien-dich-tran-danh.json` 17 trận + `danh-nhan-cac-trieu.json` 11 danh nhân, sạch Wikipedia.
- v2.2 (`fe8d4f6`): +36 danh nhân (24 anh hùng cận–hiện đại, 12 trạng nguyên). Cương vực Việt cổ 4 thời kỳ (`613601b`).
- Sóng mở rộng 2026-07-20 (`1ad9576` + `3d243ed`): +51 mục / 4 lớp — khởi nghĩa kháng chiến 20, danh nhân văn hoá cận hiện đại 15, thành hoàng danh thần 6, trạng nguyên khoa bảng +10.
- Sóng 19 (`4cfba92`): +37 danh nhân, 3 lớp mới.

### Chiến dịch mở rộng vô hạn
- Sóng 1–19 cộng các sóng chuyên đề: Đình–Đền–Miếu · Phi vật thể–Chùa–Lăng · Nhà cổ–Hang–Bảo tàng · Trường–Thuỷ lợi–Biển đảo · Khảo cổ–Dinh thự · Chiến tranh + Danh hiệu cổ · Danh thắng + Kỷ lục · Kiến trúc Pháp + Làng nghề · Thương cảng–VQG–Đường HCM trên biển.
- CSDL đi từ 476 lên hơn 1.443 tên trong loạt sóng này, nay là 4.531 mục.
- Nhật ký từng sóng: xem lịch sử git và `docs/lich-su/expansion-campaign-plan.md`.

### Phim tài liệu · nhạc · địa danh
- Track A/B/D/E/F/G/H: nhạc quê hương, playlist yêu nước, tìm phim YouTube 121/137, hub UI, merge 200/255, 12 phim quốc gia, tab địa danh Google Maps. Commit `0f35efb`, `eaa93e3`+`cde9e55`, `d101647`+`d1340d6`, `04e6b55`.
- Chỉ nhúng `youtube-nocookie` đã kiểm oEmbed = 200.

### Ảnh · media
- 34/34 tỉnh có ảnh Commons xác thực qua API.
- Nhiều đợt bổ sung ảnh: +155, +83, +4, +31. Popup ảnh + legend (`7d9a782`).
- Bảo vật quốc gia 36 mục · Nam tiến 12 mốc · bản đồ Taberd 1838.

### Ranh giới lịch sử
- Georeference **1490 (Hồng Đức)** và **1838 (Đại Nam)**, wire lên selector thời kỳ — commit `e38b458`.
- Phán quyết nguồn cho toàn bộ các thời kỳ: xem `docs/ranh-gioi-1887-1895-phan-quyet.md`.

### Hợp nhất lớp (Phase 3)
- Lô 0–4: **69 → 29 lớp**, commit `b4451d4` → `5d8a128`.
- Gom UI còn **8 cụm accordion** (`ce8e9ab`).
- Dọn STRICT_SOURCE 67 → 27 tên (`2fb6b29`). Gộp cụm di sản `di-tich-cach-mang` + `danh-thang` (`6ca0418`).
- Bỏ lớp chia theo vùng miền, chỉ chia theo lĩnh vực.

### Cổng §9 — duyệt nội dung
- Toàn bộ 152 draft khảo sát trong đợt 2026-07-25 đã được nâng: 30 mục 🟢🟡 rồi 122 mục 🔴 nhạy cảm.
- Kết quả: **0 draft trên toàn bộ overlay** tại thời điểm commit `46e3a8c`.
- Hồ sơ quyết định giữ ở `docs/lich-su/` — **các con số trong đó đã lỗi thời, đừng đối chiếu**.

### Tên đường
- Builder tên đường + wire bản đồ (`4d8132f`): pilot **1.137 liên kết / 459 danh nhân**.
- Chọn Phương án A — bảng liên kết tĩnh + centroid qua Overpass, không vẽ hình học đầy đủ.

---

## Giao diện · 3D

- Sóng 1 (`39d3d89`): sửa màu tỉnh (`to-color`), đường sông LineString 19 sông + 26 núi, giảm opacity Nam tiến.
- Sóng 2 (`312e06b`): đại tu `style.css`.
- v2.2 (`fe8d4f6`): sửa panel tràn màn hình, Nam tiến che giữa bản đồ; sông/núi lên 38/42.
- R1–R10 xong trong một phiên 2026-07-18: focus 1 tỉnh · 9 model 3D low-poly · Olympia 4 vòng · ca dao và bài hát 34/34 tỉnh · ảnh Commons + validator giấy phép · 8 nhân vật 3D · sa đồ Bạch Đằng 938 · hành trình hoá thân 6 chặng.
- Dòng thời gian 4000 năm — 106 mốc. Tô màu + nhãn tỉnh, sông, núi.
- Sổ đăng ký 11 panel (`panels.ts`) với `MutationObserver` bắt cả đường ẩn không hợp tác.
- Khả năng tiếp cận: vùng chạm tối thiểu 44×44 px toàn bộ nút · `:focus-visible` với `--c-focus` tính riêng để đạt 3,45–3,70:1 · `prefers-reduced-motion` · combobox tìm kiếm đạt chuẩn ARIA đầy đủ.
- Sửa lỗi lớp sông núi không hiển thị — nguyên nhân gốc là fontstack 404 (xem bẫy #3 trong `PLAN.md`).
- 7 sink XSS đã bịt, CSP đã kiểm chứng. 12 lỗi logic. Nam tiến nạp lười.

---

## Hạ tầng · cổng kiểm tra

- **Phase 0 Guardrail**: validator id-unique xuyên file, `docs/existing_entities.txt` làm ngân hàng dò trùng.
- **11 cổng dữ liệu**, `run_validators.mjs` **tự phát hiện** mọi `scripts/validate_*.mjs` — thêm validator mới không cần sửa CI. Trước đây liệt kê tay và đã bỏ sót `validate_nguon_cam.mjs`.
- `audit_sovereignty.mjs` chạy như bước riêng, bắt buộc, trong `.github/workflows/deploy.yml`.
- `validate_nguon_cam.mjs`: 2 mức đỏ/cảnh báo, miễn trừ Commons và `anh_nguon`. Lần quét đầu bắt 98 + 57.
- Thêm `di-tich-quoc-gia` + `di-tich-qgdb` vào STRICT_SOURCE.
- Tự host glyph tại `public/fonts/` — 9 dải Unicode, thay endpoint demo đã có nguy cơ chết.
- Deploy: **GitHub Pages** qua `.github/workflows/deploy.yml`.

---

## Phiên 2026-08-03

- **Đặc tả sinh ảnh sang XML** — `docs/image-generation-spec.xml` v2.0. XML hợp lệ đã parse kiểm chứng: 16 ảnh (10 `<anh>` + 6 `<icon>`), 4 điều `<cam>` mức chặn, checklist duyệt 5 mục, thêm khối `<huong_dan_cho_claude>`.
- **Gộp 17 file kế hoạch** thành `PLAN.md` + `RELEASE.md` này. Từ nay chỉ dùng một file kế hoạch.
- **Cứu việc dở dang phiên 2026-07-26** — 605 file / 85 MB gồm 91 ảnh nhân vật chưa gộp, 7 bản vá chưa áp, 4 tài liệu audit. `docs/PROGRESS.md` cũ trỏ tới đường dẫn scratchpad đã bị dọn; nay đã sao lưu lại được.
- **Chốt câu hỏi treo "deploy ở đâu"** — GitHub Pages, đọc thẳng từ file CI. Hệ quả: `public/_headers` chỉ có tác dụng trên Cloudflare, CSP hiện **vô hiệu**.
- **Nối `icon.svg` + `manifest.webmanifest`** vào `<head>`. Cả hai đã tồn tại từ 2026-07-25 nhưng chưa bao giờ được gắn `<link>`. Kiểm chứng bằng build thật với `BASE_PATH` của CI: href được viết lại đúng thành `/vietnam-spacetime-encyclopedia/…`.
- **Hệ thiết kế hai chế độ** — `src/theme.css`: token trên `:root[data-che-do="nguoi-lon"|"tre-em"]`, thang chữ 8 bậc, thang khoảng cách bội số 4 px, bảng trạng thái, 6 token badge. `src/chedo.ts`: nút chuyển, lưu `localStorage`, đồng bộ `meta[theme-color]`, `aria-pressed`.
- **Vá 2 lỗi runtime xác nhận còn sống**:
  - Olympia vòng 2 — nút "Bỏ qua" biến mất ngay lần mở gợi ý đầu tiên vì `render()` gán lại `innerHTML` xoá sạch con, mà nút được `appendChild` một lần bên ngoài. Người chơi kẹt lại vòng 2 nếu không đoán ra từ khoá. Đã đưa nút vào trong `render()`.
  - `province-panel` chưa bao giờ được `registerPanel` — nó nằm trong `PANEL_IDS` nhưng observer không chạy, nên khi module khác ẩn panel qua `showOnly()` thì mô hình Three.js giữ nguyên WebGL context. Đây là nửa còn lại của lỗi rò context đã vá cho journey/battle/olympia.
- **Đối chiếu bảng "Muôn xã Muôn phường"** — 3.386 mục bóc được, 319 đã có, **2.445 còn thiếu** (196 là di tích quốc gia đặc biệt). Chốt phương án: dùng làm danh mục gợi ý, tự tra nguồn chính thống.
- **Tra nguồn 196 di tích quốc gia đặc biệt** — 3 lô song song, kết quả **181 bản ghi / 33 cụm mẹ / 14 di tích độc lập**, ở `docs/backlog/lo{1,2,3}-ket-qua.json`. Đo bằng script: **0 thiếu nguồn · 0 thiếu số quyết định · 0 Wikipedia · 0 trùng tên**. 26 mục gắn cờ `trung_unesco`. Toạ độ 1/181 — quyết định xếp hạng không chứa lat/lon.
- **`docs/SCHEMA.md`** — đặc tả mô hình dữ liệu ba tầng (`diem` / `ho_so` / `tac_pham`) cộng `hinh_hoc`, kèm đường di trú 7 bước.

### Chỉ mục tĩnh — mô hình PageIndex

- `public/data/_index/catalog.json` (71 KB) — một phần tử mỗi file dữ liệu: số mục, hình khối bọc ngoài, tên trường nguồn, sha256, mô tả một dòng.
- `public/data/_index/entries-index.json` (2,0 MB) — mảng phẳng **4.531 mục**, 2.390 mục có toạ độ, kèm khối `trung_ten[]` (**585 nhóm**) và `trung_toa_do[]` (**419 cặp dưới 200 m**) để dò trùng.
- `scripts/validate_catalog_freshness.mjs` chặn chỉ mục chết bằng sha256. **Cổng dữ liệu 11 → 12**, `run_validators.mjs` tự phát hiện, không phải sửa CI.
- Cổng đã tự chứng minh bằng **ca dương tính biết trước**: đổi 1 byte trong `geo/song-nui.json` → validator đỏ đúng như kỳ vọng, rồi hoàn nguyên bằng `git cat-file blob` (không dùng `git checkout` vì `core.autocrlf` sẽ ghi đè CRLF làm lệch byte), xác minh sha256 + `git hash-object` + `git diff --numstat` rỗng.
- `npm run build:index` và `npm run smoke` thêm vào `package.json`.

### Giao diện hai chế độ — đã nghiệm thu bằng số đo trên trình duyệt thật

| Đo | Người lớn | Trẻ em |
|---|---|---|
| Tương phản `h1` topbar | 11,73:1 | 5,18:1 (chữ lớn, ngưỡng 3) |
| Tương phản phụ đề | 8,27:1 | 5,18:1 |
| Tương phản nút topbar | 6,82:1 | 7,31:1 |
| Bo góc | 14 px | 26 px |
| Cỡ chữ nền | 0,94 rem | 1,08 rem |

- `style.css` tokenise xong: **236 → 4 mã hex sống** (4 mã còn lại là màu ngữ nghĩa một lần dùng, đã ghi lý do). 63 lượt dùng tên biến cũ → 0. `git diff --stat`: +397 −443.
- **Bất biến #1 xác nhận trên trình duyệt thật, cả hai chế độ**: `querySourceFeatures` trả đủ **Hoàng Sa, Trường Sa, Thổ Chu, Bạch Long Vĩ, Phú Quý** ở nguồn `era-34`, cộng Hoàng Sa + Trường Sa ở nguồn `chu-quyen` riêng. Canvas 1920×718, style đã tải xong — không phải ảnh chụp, mà là truy vấn feature đã render.

### Nạp lười ranh giới era + cổng gác chủ quyền

- `map.on("load")` trước đây nạp cả 3 era vô điều kiện — **4,70 MB GeoJSON lúc mở trang khi chỉ cần 1,17 MB**. Tách thành `ensureEra()` gọi từ `setEra()`. Đo được: **1/3 nguồn era** tồn tại lúc mở trang.
- 🔴 Vá **hai nửa của cùng một bẫy thứ tự lớp**. `landmarks3d.ts:281` ghim `era-phapthuoc-fill` làm `beforeId` — đúng một cách tình cờ vì trước đây cả 3 era luôn tồn tại. Và `ensureEra` phải truyền `beforeId = "chu-quyen-labels"`, nếu không lớp era sinh sau sẽ **phủ mất nhãn Hoàng Sa / Trường Sa**. Cả hai đều im lặng: không lỗi console, không cổng dữ liệu nào bắt được.
- **`scripts/verify_chu_quyen.mjs`** — Chrome headless riêng (swiftshader, WebGL thật), quét 13 thời kỳ. Thay cho việc "mở trình duyệt nhìn bằng mắt" vốn không chạy lại được và trong phiên này còn không làm được (tab chạy nền bị hãm `requestAnimationFrame`). **13/13 xanh**, đã chứng minh biết đỏ bằng ca dương tính.

### Ba lỗi bắt được nhờ tự đo, không phải nhờ build xanh

1. **Gradient topbar trẻ em bản đầu chỉ đạt 2,15:1** với chữ trắng — hỏng nặng ngưỡng 4,5:1. Đẩy sắc độ sâu hơn, giữ đủ ba màu cam → đỏ → tím, đo lại 5,07 · 6,00 · 6,71:1.
2. **Nút topbar chế độ trẻ em đạt 4,60:1** với nền mờ 8% — qua ngưỡng nhưng biên mỏng tới mức một lần chỉnh gradient là trượt. Đổi sang viên thuốc trắng đặc, chữ nâu cam đậm: 7,31:1.
3. 🔴 **Chrome không làm mới kiểu dáng của phần tử có `transition` trên `color`/`background` khi đổi chế độ.** Đo được: biến đã đúng, rule đã hết khớp, nhưng giá trị tính ra vẫn là của chế độ cũ — trễ đúng một nhịp, trong khi `font-size` (không nằm trong danh sách transition) đổi ngay. Đã bỏ `color`/`background` khỏi cả 5 khai báo `transition` trong `style.css`; phản hồi di chuột giữ lại qua `transform` + `box-shadow`. Kiểm chứng: bấm chuyển 4 lần liên tiếp, cả hai chiều đều đúng.

---

## Phiên 2026-08-04

Bốn việc chủ dự án giao sau khi khảo sát lại trang. Commit `3591342` (3D + hình thức + a11y).

### Biểu tượng lớp phủ ở chế độ 3D — dựng thành mô hình khối

Chủ dự án: *"ở 3D, các biểu tượng vẫn chưa được chuyển dạng, vẫn ở 2D"*.

Đo trước khi sửa, bằng Chrome headless có WebGL thật:

| Mức phóng | Chấm phẳng vẽ ra | Mô hình 3D dựng ra |
|---|---|---|
| 4,69 (mặc định khi bấm 3D) | **152** | **0** |
| 9,50 | 7 | 7 |
| 12,0 | 2 | 2 |

Gốc lỗi: `capNhatMoHinhDiem()` thoát sớm khi `dangDiorama()` — mà cảnh diorama chính là cảnh hiện ra ngay khi bấm nút 3D. Mô hình chỉ sống từ zoom 7,5 trở lên, gần như không ai xuống tới đó.

- Bỏ nhánh thoát sớm — 3D bật là dựng mô hình ở **mọi** mức phóng.
- Chiều cao biểu kiến co theo zoom: **20 px** ở tầm cả nước → **46 px** ở tầm phố. Bản sửa đầu giữ nguyên 46 px và **hỏng theo cách khác**: 152 mô hình cao 46 px dựng lên một dải đất rộng 350 px thì che kín chính đất nước, thấy rõ trên ảnh chụp. Đây là lý do phải chụp lại sau mỗi lần sửa chứ không tin vào lập luận.
- Icon phẳng nhường chỗ khi 3D bật; vòng tròn ở lại và thu từ `r5` xuống `r3` — nó tụt xuống vai trò chân đế và **vùng bấm**, vì mô hình Three.js không nhận sự kiện bấm của MapLibre. Điểm vượt trần vẫn còn vòng tròn nên không mục nào biến mất khỏi bản đồ.
- Đổi `clone()` sang **`InstancedMesh`**: một ngôi chùa 8 mảnh × 400 điểm là 3.200 lệnh vẽ mỗi khung hình, gom lại còn 8. Nhờ đó nâng trần **120 → 400** mô hình. Ma trận chỉ nạp lại khi mức phóng đổi hoặc tập điểm đổi, không phải mỗi khung hình.
- `map.moveLayer("landmarks-3d")` sau mỗi lần thêm lớp phủ — lớp thêm sau vẽ sau, không đẩy lên thì vòng tròn phẳng đè lên chân mô hình.

### Hình thức

- **Thanh trượt dòng thời gian** — control chạm nhiều nhất mà thô nhất trang: một vạch 4 px với nút mặc định của hệ điều hành. Dựng lại rãnh 7 px bo tròn, phần đã đi qua sáng lên theo `--tien-do` do `setPeriod()` đặt, nút 19 px viền nâu có quầng sáng khi di chuột/bàn phím.
- **Cụm control MapLibre** — hộp trắng vuông mặc định đứng cạnh panel kính mờ bo 14 px. Cho về cùng ngôn ngữ: kính mờ, bo 10 px, hover nhuộm màu brand.
- **Thước tỉ lệ chuyển trái-dưới → phải-dưới.** Bảng lớp cao gần hết cột trái nên thước nằm lọt phía sau, đo trên ảnh chỉ thò ra vài pixel mép dưới.
- **Ghi chú pháp lý cương vực** từ bốn dòng chữ cam trôi nổi thành callout có khung — cùng lượng chữ nhưng đọc ra ngay là lời chú chứ không phải lỗi.
- Đầu bảng lớp có gạch chân; nhãn «THỜI KỲ» và ô chọn thời kỳ dựng lại.

### Hoàn thiện tính năng

- **Nối dây `timeline/events.json`** (34 sự kiện, NQ 202/2025/QH15). File có đủ số nghị quyết, ngày hiệu lực và link cổng Chính phủ nhưng **không module TS nào đọc tới** — panel tỉnh nói "hợp thành từ A và B" mà không nói theo văn bản nào, trái bất biến mọi mục phải dẫn về nguồn chính thống. Nay hiện: «Hợp nhất An Giang + Kiên Giang — Nghị quyết 202/2025/QH15, hiệu lực 1/7/2025» kèm link. Kiểm bằng cú bấm thật trên canvas headless.
- **11 panel nổi thành hộp thoại thật** — `role=dialog`, `aria-label`, đưa tiêu điểm vào panel khi mở, trả tiêu điểm ở `hideAllPanels()` (đích của phím Esc). Đăng ký nốt `library`/`game`/`quiz` panel, trước nay không module nào đăng ký chúng.
  - `aria-label` đọc `data-nhan` **trước** `h2`: bốn panel trong `index.html` nạp nội dung không đồng bộ, lúc mở còn rỗng nên đọc `h2` ra chuỗi rỗng rồi rơi về id — đo được trình đọc màn hình sẽ đọc lên "library-panel".
  - **Cố ý không làm focus trap**, `aria-modal=false`: các panel này không modal, bản đồ sau lưng vẫn kéo/bấm được. Nhốt tiêu điểm trong hộp thoại không modal là bẫy người dùng bàn phím vào chỗ mà chuột thì đi ra được.
- **Link "bỏ qua tới bản đồ"** — trước phải Tab qua logo, ô tìm kiếm và 4 nút mới chạm được bản đồ.
- **`aria-valuetext` cho thanh trượt** — đọc tên thời kỳ thay vì "3 trên 12".
- Thư viện chia mục thơ văn của Bác theo trường `nhom`.

### Một phép đo sai, ghi lại để lần sau khỏi mất công

Lần đầu kiểm link "bỏ qua" báo **hỏng**: link không vào khung hình khi nhận tiêu điểm. Probe kỹ thì `document.activeElement` **đúng là** link, nhưng `a.matches(':focus')` trả `false`. Nguyên nhân: cửa sổ Chrome headless không có tiêu điểm hệ điều hành nên `:focus` không khớp. Bật `Emulation.setFocusEmulationEnabled` thì `matchFocus: true` và link nằm ở `top: 7,5 px` — đúng như thiết kế. **Lỗi ở phép đo, không ở trang.**

---

## Thư viện thơ văn Hồ Chí Minh — 2026-08-04

Chủ dự án: *"những bài thơ Bác viết vẫn chưa đủ, hãy sưu tập đầy đủ đi"*, và sau đó xác nhận lại nguyên tắc quyết định mọi thứ ở đây: **tác phẩm của Bác được dùng rộng rãi, không có bản quyền đối với toàn dân** (mất 1969, hết hạn bảo hộ tại Việt Nam từ 2020).

**31 → 185 tác phẩm**, chia sáu mục trong thư viện:

| Mục | Số bài | Ghi chú |
|---|---|---|
| 📓 Ngục trung nhật ký | 117 | **phủ kín 133 số bài của tập** — xem mục dưới |
| 🖋️ Thơ khác | 27 | gồm 2 bài báo Việt Nam Độc Lập 1941 đã xác minh bút danh |
| 🎊 Thơ chúc Tết & mừng xuân | 24 | **liền mạch 1942 → 1969** |
| 🏮 Thư & thơ Trung thu gửi thiếu nhi | 7 | mảng hợp chế độ trẻ em nhất |
| 📜 Văn chính luận · thư · lời kêu gọi | 8 | 5 mục đã lên toàn văn |
| ❓ Tồn nghi — chưa xác định tác giả | 2 | tách hẳn, có cảnh báo cấp nhóm |

---

## Phiên 2026-08-05

### Phiếu UI-A đóng — tông đỏ topbar

Phiếu gồm ba mục. Mở lại thì **mục 1 (logo) và mục 3 (ô tìm kiếm) đã làm xong từ commit `21238b0`** ngày 03-08 — chính thân commit đó ghi là tách riêng tông đỏ để làm sau, nhưng phiếu không ai đóng. Đã nghiệm thu lại bằng ảnh chụp chứ không bằng việc đọc CSS: logo SVG đảo màu đúng ở cả hai chế độ, ô tìm kiếm khi focus giữ nền tối 16% + viền vàng + quầng sáng, không loé trắng.

Mục 2 dựng thử **bốn tông thẳng trên trang thật** (ghi đè `--mat-nghich` qua CDP rồi chụp), chủ dự án chọn **A — đỏ quốc kỳ `#b02020 → #8a1616`**.

Nền sáng lên thì mọi lớp chữ sáng nằm trên nó đều tụt tương phản. Số đo lấy từ màu đã tính trong trang, không phải từ hằng số trong file:

| Lớp | Trên `#8b1a1a` (cũ) | Trên `#b02020` (mới) | Ngưỡng |
|---|---|---|---|
| Tiêu đề `--mat` | 9,13:1 | **6,72:1** | 4,5:1 |
| Chữ nút `--chu-tren-nghich` | 6,44:1 | **4,74:1** | 4,5:1 |
| Sao logo + viền ô tìm, nếu giữ `--nhan-sang` | 4,02:1 | **2,95:1** ❌ | 3:1 |
| …sau khi đổi sang `--nhan-mo` | — | **4,74:1** ✅ | 3:1 |

Vàng thếp `--nhan-sang` (`#d4a24e`) rơi xuống dưới ngưỡng 3:1 của WCAG 1.4.11 cho hình khối phi văn bản — ngôi sao trên logo và viền báo "ô đang nhập" đều mờ đi. **Không nâng sáng thẳng `--nhan-sang`**: nó còn dùng ở 14 chỗ khác, phần lớn trên nền sáng nơi nó vốn đã chỉ ~2,3:1, nên nâng toàn cục là chữa topbar rồi làm hỏng thanh thời gian và panel. Thay bằng `--nhan-mo` (`#f2d399`) ở đúng ba quy tắc nằm trên dải đỏ — đây đã sẵn là bậc "vàng trên nền tối" của bảng màu, chính là giá trị của `--chu-tren-nghich`.

Kèm theo, **một lỗi có sẵn được sửa nhờ đi qua đây**: ở chế độ trẻ em, viền ô tìm kiếm khi focus lấy `--nhan-sang` = `#a855f7` (tím) đặt trên dải cam–đỏ–tím, đo được **1,31:1** — gần như vô hình. Đổi sang `--nhan-mo` (`#ddd6fe`) lên **3,73:1**.

Sửa đúng 4 file: `theme.css` (gradient + 2 quy tắc logo), `style.css` (viền focus), `chedo.ts` (`MAU_THANH` — nguồn thật của màu thanh trình duyệt theo chế độ), `index.html` (`meta[theme-color]`).

⚠️ **Bẫy đo đạc, ghi lại để lần sau đừng mắc lại.** Chrome headless không có cửa sổ hoạt động nên `:focus` **không khớp** — lượt chụp đầu tiên trả về đúng trạng thái nghỉ (nền 8%, `box-shadow: none`) trong khi tôi tưởng đã nghiệm thu được trạng thái đang nhập. Phải bật `Emulation.setFocusEmulationEnabled` trước khi điều hướng. Không có bước này thì mọi ảnh chụp trạng thái focus từ trước tới nay đều là ảnh giả.

❌ **Còn lệch, cố ý không đụng tới trong phiếu này**: `public/manifest.webmanifest` khai `theme_color: #6d1414` và `public/icon.svg` tô nền `#6d1414` — cả hai lấy chặng TỐI của gradient cũ, đã lệch với `index.html` từ trước phiên này. Đây là màu của biểu tượng ứng dụng khi cài PWA, không phải topbar; gộp vào đây là mở rộng phạm vi phiếu.

Nghiệm thu: `npm run build` exit 0 (chạy `tsc`) · `npm run validate` **12/12 cổng xanh** · Chrome headless chụp lại hai chế độ, console sạch.

### Năm văn kiện từ bản trích lên toàn văn

Tuyên ngôn Độc lập nằm trong thư viện với **đúng 4 dòng** — văn kiện quan trọng nhất cả bộ sưu tập. Lý do ghi hồi trước là "mục dẫn đọc", không phải bản quyền, nhưng kết quả vẫn là cắt cụt tác phẩm không cần cắt.

| Mục | Trước | Sau | Nguồn |
|---|---|---|---|
| Tuyên ngôn Độc lập | 4 | **30 đoạn** | Nhân Dân — tư liệu Ban Tuyên giáo TW / HCM Toàn tập T.4 |
| Di chúc | 4 | **30 đoạn** | hochiminh.vn — bản công bố 1969 |
| Lời kêu gọi thi đua ái quốc | 7 | **42 dòng** | CAND — đăng lại Cứu quốc số 968, 24/6/1948 |
| Lời kêu gọi toàn quốc kháng chiến | 4 | **9 dòng** | QĐND |
| Thư gửi các học sinh 1945 | 3 | **9 đoạn** | Nhân Dân |

**Bảy mục giữ nguyên bản trích, không chắp vá.** Đáng ghi nhất: *Bài nói tại Đền Hùng* được xác nhận là **nói chuyện ứng khẩu, không có văn bản viết** — mọi nguồn chỉ lưu đúng một câu. Đó là bản chất tư liệu chứ không phải thiếu sót của dự án.

### Ranh giới xử lý chữ nghi sai — áp nhất quán cho cả bộ sưu tập

| Tình huống | Xử lý | Ca thật gặp trong phiên |
|---|---|---|
| Nguồn in ra thứ **không tồn tại** | sửa + ghi lại cả hai bản | «Việt Nam Cộng hòa Dân chủ» → «Việt Nam Dân chủ Cộng hòa» (Tuyên ngôn ĐL) · «phấm khởi» → «phấn khởi» (chúc Tết 1950) · «hằng hái» → «hăng hái» (Di chúc) |
| Hai dạng **đều lưu hành** | giữ nguyên + ghi cả hai | «Sự thực/Sự thật» · «tính mạng/tính mệnh» · «sẽ/để» (chúc Tết 1946) |
| Một nguồn, nghi mà không đối chiếu được | **giữ nguyên** | «binh quyền» (chúc Tết 1945) |

Quốc hiệu bị đảo là ca nghiêm trọng nhất: đây là tên nước trong chính văn kiện khai sinh ra nó, mà «Việt Nam Cộng hòa» lại là quốc hiệu của một thực thể khác. Ba căn cứ để kết luận lỗi in chứ không phải dị bản: chưa từng tồn tại thực thể tên đó · đoạn kết **cùng bài trên chính trang ấy** ghi đúng · tra chéo cổng nhà nước đều ra dạng chuẩn.

«Hằng hái» ban đầu **giữ nguyên** vì chỉ có một ca; sửa sau khi lô Trung thu bắt được đúng lỗi đó lần thứ hai trên cùng hệ thống báo. Hai ca độc lập cùng dạng mới đủ.

### Lỗi dữ liệu bắt được nhờ đối chiếu chéo, không cổng nào bắt được

- **Chúc Tết 1953 thiếu một câu.** `hochiminh.vn` in 11 dòng; hai nguồn Nhân Dân in 12, trong đó một nguồn dẫn thẳng *Báo Nhân Dân số 95, 11–15/2/1953, tr.1*. Lấy bản 12 dòng, giữ «kết đoàn» vì hai trong ba nguồn ghi vậy.
- **Lời bình bài 1944 sai bối cảnh** — ghi Bác «còn hoạt động bí mật», thực ra Tết Giáp Thân Người đã ra tù và giữ chức Phó chủ tịch Việt Nam cách mạng đồng minh hội.

### Bốn chỗ vênh nêu ra thay vì giấu

Mỗi chỗ đều ghi **điều kiện cụ thể để về sau phân xử được**, không chỉ dán nhãn "chưa rõ".

- **Niên đại bài chúc Tết Quý Mùi 1943.** `hochiminh.vn` xếp vào tuyển tập thơ chúc Tết của Bác; «Hồ Chí Minh — Biên niên tiểu sử» Tập 2 chép Người bị giam ở Quảng Tây 27/8/1942 → 10/9/1943, đúng Tết Quý Mùi đang bị áp giải sang nhà giam Liễu Châu, và 3.252 dòng biên niên **không nhắc bài này** dù có nhắc bài 1942 và 1944. Lô tra đề nghị gỡ hẳn — **không theo**: biên niên **im lặng** không phải biên niên **phủ nhận**, và xoá mục chính là chọn bản gọn hơn, trái bất biến §1.4. Giữ lại, đổi tên thành «niên đại đang tranh luận», gỡ mọi khẳng định khỏi `thoi_ky`/`loi_binh`, nêu cả hai phía trong ghi chú hiện ra cho người đọc. Chủ dự án chốt **giữ** ngày 2026-08-04.
- Cặp dòng lặp trong bài 1943 · «binh quyền» bài 1945 · nơi đăng bài 1945.

### Ngục trung nhật ký: 55 → 117 bài, phủ kín cả tập

Ngõ web bế tắc thật, không phải tra hời hợt: một lô tra ~25 lượt trên đúng danh sách nguồn được phép rồi báo **0 bài**. Toàn văn tập thơ trên mạng chỉ có hai dạng — nguồn bị cấm (thivien, wikisource, blog), hoặc PDF ảnh quét trên cổng .gov.vn mà máy không có OCR để đọc.

Lô đó đề nghị nới chính sách: dẫn nguồn dù chưa mở đọc được. **Từ chối** — dẫn một URL mình chưa đọc chính là bịa nguồn, đúng thứ bất biến §3 cấm.

Đường vòng: nguồn mà 39 bài nạp trước đang dẫn hoá ra là **PDF có lớp chữ thật** — «Nhật ký trong tù» (tái bản), NXB Chính trị quốc gia Sự thật 2015, 212 trang, đăng trong Không gian văn hoá Hồ Chí Minh của một trường thuộc Sở GD-ĐT TP.HCM. Mọi cách bóc thô đều ra ký tự rác vì PDF dùng **font CID**: chuỗi trong file là mã glyph, phải đi qua bảng `/ToUnicode` mới ra chữ. Viết bằng `zlib` có sẵn trong Node, không cài thêm gì vào máy.

**Ba lỗi bóc bắt được trước khi nạp** — cổng dữ liệu không bắt nổi loại lỗi này, chỉ đối chiếu mới thấy:

| Lỗi | Hậu quả nếu bỏ qua | Cách sửa |
|---|---|---|
| Xuống dòng theo mọi lệnh định vị chữ | Chữ trong ngoặc kép in khác font → câu thơ vỡ làm đôi | Chỉ ngắt dòng khi toạ độ Y đổi; `T*` ép ngắt |
| Số chú thích chân trang in giữa câu | «Thảm đạm kinh doanh» / «1» / «trúc lộ phu;» thành hai dòng | Nối lại khi mảnh trước không kết thúc bằng dấu câu |
| Ngày tháng sách in dưới đầu đề | «18-11» thành một câu thơ | Tách sang `thoi_ky` |

Kiểm chứng bằng **55 bài đã có** (lấy từ SGK và bản Viện Văn học, nguồn độc lập): 46 bài khớp từng câu. Phần còn lại là 1 bài không thuộc 133 bài của tập, và **ba chỗ dị bản thật** giữa hai bản in nhà nước — «đông hàn/đông tàn» và «cách kiện cường/cánh khẩn trương» (Tự miễn) · «ngận/hẩn thống khổ» · «thuỵ thời/thụy thì». Nêu cả hai bản trong ghi chú, không sửa chữ đã nạp.

**Kiểm chéo bằng nguồn thứ hai.** Lô tra web tuy chỉ ra được 2 bài nhưng 2 bài đó thành phép thử độc lập cho cả đường ống bóc PDF: «Dạ bán văn khốc phu» khớp **4/4 câu** với bản đọc thẳng trên `hanoimoi.vn`; «Dương Đào bệnh trọng» khớp 4/4, chỉ khác ở chỗ sách đóng ngoặc kép thành ngữ «Thành hỏa trì ngư». Lô đó cũng cảnh báo có thể lẫn «Dạ bán» với «Dạ bán văn khốc phu» — đối chiếu bản sách cho thấy **hai bài khác nhau thật**, bài 100 và bài 65, đã nạp riêng.

Bốn bài liên quan tới sĩ quan Quốc dân Đảng Trung Hoa (Tưởng Giới Thạch · Lương Hoa Thịnh · Hầu Chí Minh · khoa viên họ Trần) đều mang sẵn chú thích của chính cuốn sách nói rõ nhân vật là ai. Chỗ dễ nhầm nhất — **Hầu Chí Minh là chủ nhiệm Cục chính trị Chiến khu IV, không phải Hồ Chí Minh** — được nói thẳng trong ghi chú của bài 128, nơi tên hai người đứng gần nhau nhất.

Bản quyền bản dịch lần này biết chắc thay vì đoán, vì sách in tên dịch giả từng bài: **24 bài Nam Trân đơn danh** (mất 1967, hết bảo hộ) chép nguyên bản dịch thơ; **38 bài** dịch giả còn bảo hộ (Huệ Chi, Đỗ Văn Hỷ, Băng Thanh, Nguyễn Sĩ Lâm, Hoàng Trung Thông, Trần Đắc Thọ, Văn Trực - Văn Phụng) thì không chép, thay bằng bản dịch nghĩa văn xuôi dự án tự viết từ phiên âm Hán-Việt và nói rõ trong ghi chú. Bản dịch nghĩa của chính cuốn sách cũng không chép — đó là dịch phẩm của người biên soạn.

Ba bài không nạp: **bài 1** và **bài 108** dự án đã có (khớp hụt vì hai bài đó không có đầu đề); **bài 101 «Liễu Châu ngục»** thì chú thích của chính cuốn sách ghi *nguyên bản chỉ có đầu đề, không có thơ* — không có nguyên văn thì không nạp, kể cả khi biết chắc bài đó tồn tại.

### Nhóm «tồn nghi» — cách giữ tư liệu mà không nhận nhầm tác giả

«Dân cày» và «Công nhân» **có** nguyên văn trên báo Cao Bằng nhưng nguồn ghi «Khuyết danh», và dò chéo danh sách bút danh chính thức trên `tulieuvankien.dangcongsan.vn` không mục nào khớp. Ban đầu để ngoài dự án: có văn bản mà thiếu quy thuộc thì nạp vào là **bịa quy thuộc**.

Chủ dự án quyết **«giữ hết»** — nên hai bài vào một nhóm thứ sáu `nhom: "ton-nghi"` thay vì trộn với thơ đã xác minh. Ba lớp cảnh báo, chồng lên nhau vì người đọc có thể dừng ở bất kỳ lớp nào:

1. tiêu đề nhóm — «❓ Tồn nghi — thơ trên báo Việt Nam Độc Lập, chưa xác định tác giả»;
2. một đoạn cảnh báo cấp nhóm nói rõ vì sao chúng ở đây (đăng trên tờ báo của Bác) và vì sao **không** đủ để nhận là của Bác;
3. trong từng mục: `ten` gắn «chưa xác định tác giả», `tac_gia` để đúng chữ «Khuyết danh», `ghi_chu_dich` đối chiếu thẳng với «Trẻ con»/«Phụ nữ» — hai bài đó vào nhóm thường **vì** `tulieuvankien` xác nhận đích danh bút danh «Kim Oanh» (số 104, 1/9/1941) và «Bé Con» (số 106, 21/9/1941).

Điều kiện chuyển sang nhóm thường ghi thẳng trong `ghi_chu_bien_tap`, không để người sau phải đoán.

Còn hai mục vẫn không nạp được: «Trẻ chăn trâu» và «Tầm hữu vị ngộ» — không có nguyên văn trên nguồn được phép. Đây là thiếu **văn bản**, khác hẳn thiếu **quy thuộc**, nên không có nhóm nào chứa được.

### Bẫy công cụ — ghi lại vì tốn của phiên này ba lượt tra lặp

`WebFetch` chạy prompt qua một model tóm tắt, và model đó **tự từ chối trả nguyên văn dài** viện bản quyền — kể cả với cổng nhà nước công khai và tác phẩm đã hết hạn bảo hộ. Nặng nhất: gọi vào trang Di chúc của `hochiminh.vn` thì nó trả về **bản dịch tiếng Anh tóm tắt** thay vì nguyên văn tiếng Việt.

Đo được trên cùng một trang `hochiminh.vn`: một agent dùng WebFetch kết luận "không lấy được"; một agent lấy văn bản thô lấy đủ **21 bài**.

Nhưng **không phải ca nào cũng là lỗi công cụ**: «Trẻ chăn trâu» crawl thô vượt được lỗi redirect của `qdnd.vn` rồi thấy trang **thật sự chỉ có một câu giới thiệu podcast**. Phải kiểm chứ đừng mặc định.

Tải thẳng mã HTML gốc (không qua trình render) còn dùng để tách bạch **«nguồn in sai»** khỏi **«công cụ crawl làm hỏng»** — cách này xác định được `hochiminh.vn` đúng là in «phấm khởi» và «binh quyền», và xác định cặp dòng lặp bài 1943 nằm trong chính nguồn.

### Hai trường ghi chú tách bạch

`ghi_chu_dich` **render ra trang** cho người đọc; `ghi_chu_bien_tap` chỉ nằm trong JSON, dặn người/agent sửa dữ liệu về sau. Khai cả hai trong `interface Poem`, trong đó `ghi_chu_bien_tap` có chú thích nói rõ nó **cố ý không render** — nhét câu «ĐỪNG SỬA» vào `ghi_chu_dich` là nói với nhầm người.

### Đóng nốt phiếu «7 DIFF cứu từ phiên 26-07» — năm bản vá còn lại

Bốn bản vá đã áp từ trước (1a, 1b, 2, 6a). Phiên này áp nốt **3, 4, 5, 6b, 7**.

#### DIFF-3 · chốt fontstack bằng kiểu

Năm chuỗi `"text-font"` rời rạc trong `main.ts` gom về `src/map-fonts.ts`. Điểm đáng ghi: **hằng số trần không đủ**. Ba trong năm lời gọi `map.addLayer` ép cả object literal bằng `as never`, mà `as never` nuốt sạch kiểm tra kiểu bên trong — gõ `["Open Sans Bold"]` ở đó vẫn biên dịch xanh. Đối số của một lời gọi **hàm** thì vẫn được kiểm bình thường, nên fontstack đi qua `textFont(FONT_LABEL)` rồi spread vào `layout`.

Vì sao spread chứ không bọc cả object: bọc qua một generic làm mất suy luận tuple của biểu thức MapLibre — `["get", "ten"]` tụt xuống `string[]` và style-spec từ chối. Hai chỗ không có `as never` đỏ ngay lượt đầu, đó là cách phát hiện.

Bước phủ định đã chạy: đổi tạm một chỗ **bên trong `as never`** thành `["Open Sans Bold"]` → `tsc` đỏ đúng chỗ, `TS2820` ở dòng 412.

#### DIFF-4 · ranh giới kiểu cho JSON

`fetchJson<T>(path)` cũ trả `(await res.json()) as T` — một lời khai không ai kiểm. Nay `fetchJson(path, parse)` có tham số parse **bắt buộc**: quên là lỗi biên dịch, không phải lỗi runtime. Thêm `src/types/parse.ts` (`str` `num` `strs` `arr` `oneOf` `rec` `itemsOf`) và `src/util/fetch.ts`. Chuyển cả 16 nơi gọi, gồm `fetchJsonSafe` — bản sao thứ hai của cùng lỗi, nằm trong `search.ts`.

**Đo trên dữ liệu thật trước khi viết, và số đo đổi cách làm.** Lời khai kiểu trong `main.ts` sai với chính dữ liệu của dự án:

| Trường | Khai trong `main.ts` | Thật trong JSON |
|---|---|---|
| `nam` | `string \| number` | 513 số · 35 chuỗi («Thời Hùng Vương») |
| `xep_hang` | `number` | 22 số · **82 chuỗi**, có mục là cả một câu văn |
| `dot` | `number` | 188 số |

Đây chính là chuỗi nhân quả đẻ ra 7 sink XSS: khai `number` → `tsc` tin → người viết thấy "số thì escape làm gì" → bỏ `esc()`. Nay mọi trường **sẽ đi vào HTML** đều khai `string` và ép ở hàm parse, kể cả trường vốn là số. Nhờ đó `esc(o.nam)` biên dịch được tự nhiên và 31 chỗ `esc(String(...))` rút còn `esc(...)` — `tsc` giữ lại đúng 5 chỗ thật sự là số.

Kèm theo, 10 chỗ `as OverlayItem & { … }` biến mất. Mỗi chỗ khai một tập trường khác nhau, không chỗ nào là nguồn sự thật; nay `interface OverlayItem` có đủ 22 trường. Và `f.properties as unknown as OverlayItem` ở trình xử lý click đổi thành `parseOverlayItem(f.properties)` — cast chỉ là lời khai, parse mới là ép kiểu thật.

**Hai bước phủ định đã chạy:**

1. Bỏ tham số `parse` ở một nơi gọi → `tsc` đỏ (`TS2554`).
2. Ca dương tính đầu-cuối: gieo `3"><script>window.__BIDOT=1</script>` vào trường `dot` của **mọi** mục `bao-vat-quoc-gia.json`, chạy Chrome headless, bấm marker thật. Kết quả: `properties.dot` kiểu `string` · 0 thẻ `<script>` trong popup · `window.__BIDOT` vẫn `undefined` · popup chứa chuỗi `&lt;script&gt;`. Dữ liệu được khôi phục trong `finally`.

   ⚠️ Lượt đầu của phép thử này **vô nghĩa mà trông như có ý nghĩa**: gieo payload vào đúng một mục thì cú bấm rơi trúng marker khác (mục chồng nhau ở zoom xa) và popup trả về là của mục sạch. Gieo vào mọi mục thì bấm trúng ai cũng là ca thử hợp lệ.

#### DIFF-5 · tách `overlays-config.ts`

629 dòng khai báo 34 lớp phủ + ba hàm dựng popup rời khỏi `main.ts` (**3.363 → 2.943 dòng**). Thuần di chuyển; thay đổi thật duy nhất là gom 9 bản sao dải cảnh báo toạ độ về `canhBaoToaDo(muc, doiTuong)` — tham số `doiTuong` giữ nguyên chữ hiển thị của từng lớp («Toạ độ nơi thờ», «Toạ độ quê/khu lưu niệm», «Toạ độ đền/đình»), vì đó là thông tin thật chứ không phải dị bản ngẫu nhiên.

Chứng minh là *chuyển* chứ không phải *viết lại*: bóc bảng `OVERLAYS` ở `HEAD` và ở file mới rồi so `id`/`label`/`icon`/`file`/`nguon`/`popup` của từng lớp — **34/34 lớp khớp từng ký tự**.

Nghiệm thu chạy: bật cả 34 lớp trong Chrome headless → 34/34 dựng được nguồn + lớp; bấm marker 5 lớp → popup dựng đủ nội dung; console sạch. `tsc` không bắt được lỗi ở đây (bảng lớp phủ là dữ liệu thuần — gõ sai đường dẫn file vẫn biên dịch xanh), nên bước này không bỏ được.

⚠️ Bẫy trong chính phép nghiệm thu: `querySourceFeatures` **chỉ trả feature trong khung nhìn**. Lượt đầu, sau khi nhảy tới lớp trước thì ba lớp sau trả 0 feature và bị chấm là hỏng. Đọc `getSource(id)._data` mới độc lập với viewport.

#### DIFF-6b · gom `esc()`

9 bản sao y hệt về 1. Bản thứ 9 là `escHtml` trong `search.ts` — **cùng thân hàm, khác tên**, nên mọi lượt dò trùng trước đều bỏ sót.

#### DIFF-7 · smoke + chủ quyền thành cổng chặn của CI

`deploy.yml` nay chạy `npm run verify:chuquyen` rồi `npm run smoke` sau bước build, cả hai đều **chặn deploy**. Điều kiện bật đã đủ: smoke 9 đạt/0 hỏng, chủ quyền 13/13 thời kỳ.

Trước khi gắn có tra thật chứ không đoán: bảng `actions/runner-images` cho thấy `ubuntu-24.04` (= `ubuntu-latest`) có sẵn **Google Chrome 150**. Hai script nới danh sách dò đường dẫn sang `/usr/bin/google-chrome` và tự thêm `--no-sandbox --disable-dev-shm-usage` **khi thấy biến `CI`** — ở máy thật không bỏ sandbox, vì profile là thư mục tạm nhưng trang được nạp vẫn là mã thật.

Vẫn cố ý **không** gắn vào `npm run validate`: cổng đó phải chạy được ở máy không có Chrome và xong trong vài giây.

### 91 ảnh nhân vật — hoá ra đã nạp xong từ trước

Mục này trong `PLAN.md` ghi «91 ảnh, chưa có script gộp, phủ ảnh 142 → 226/1.040». Dry-run đối chiếu chéo cho thấy cả ba con số đều lỗi thời: file cứu về có **195** bản ghi, và **195/195 đã nằm trong dữ liệu với URL khớp từng ký tự**. Độ phủ thật hiện là **558/2.347 mục lớp phủ (23,8%)**. 0 mục thiếu `anh_nguon`, 0 thiếu `anh_giay_phep`, 0 ảnh nằm ngoài `upload.wikimedia.org` (CSP của trang chỉ cho host này).

⚠️ **Chưa kiểm được 558 URL ảnh còn sống hay không, và phép đo đầu tiên là phép đo hỏng.** Quét bằng 8 luồng song song → Wikimedia trả **429** cho 543/558. Đó là tự mình bị chặn tốc độ, không phải ảnh chết — báo cáo "543 ảnh chết" mà tin là sẽ dẫn tới đi sửa 543 mục lành. Lấy mẫu lại 30 URL tuần tự, nghỉ 400 ms: **24 sống · 6 vẫn 429 · 0 mục 404**. Muốn con số thật thì phải quét chậm (≥1 s/URL) với User-Agent có địa chỉ liên hệ theo đúng chính sách của Wikimedia.

### Ngục trung nhật ký xếp lại theo đúng thứ tự của tập

117 mục trước đây nằm theo thứ tự biên soạn, **không có trường thứ tự nào**. Số bài chuẩn lấy từ bản bóc PDF NXB Chính trị quốc gia Sự thật 2015 (phiên 04-08), dãy 1–134.

Khớp bằng **nội dung Hán–Việt** chứ không bằng tên: một bài có tới ba kiểu tên (chữ Hán, phiên âm, tên bản dịch), khớp tên là mời lỗi vào nhà. Điều kiện: ít nhất **hai** câu Hán–Việt của mục cùng nằm trong thân bài chuẩn — một câu chưa đủ vì các bài trong tập dùng lại nhiều cụm giống nhau. Kết quả **116/117**, không bài chuẩn nào bị gán cho hai mục.

Mục thứ 117 — «Tân xuất ngục, học đăng sơn» — **cố ý không có số bài**. Dò cả năm từ khoá trong bản chuẩn đều không thấy: tập kết thúc ở bài 134 «Kết luận», còn bài này làm sau khi ra tù và thường in kèm như phụ lục. Gán cho nó một con số là bịa ra thứ tự mà nguồn không có. Lý do ghi vào `ghi_chu_bien_tap`, một câu cho người đọc vào `ghi_chu_dich`; mục xếp cuối nhóm.

Sắp xếp làm ở **cả hai chỗ**: thứ tự mảng trong file, và một lượt `sort` theo `so_bai` trong `hcmWorksHtml`. Chỉ dựa vào thứ tự file thì một lượt sửa dữ liệu chèn mục vào giữa sẽ lặng lẽ phá thứ tự mà không ai thấy.

Số bài hiện ra trên giao diện để thứ tự là thứ **nhìn thấy được**. Chữ dùng `--chu-mem`: đo được `--nhan` trên `--mat-3` chỉ đạt **3,33:1** ở chế độ người lớn, dưới ngưỡng 4,5:1 của WCAG 1.4.3. `--chu-mem` đạt 5,55:1 (người lớn) · 5,39:1 (trẻ em). Không thêm mã hex mới.

### Bản đồ 3D — hai lỗi được báo, chẩn đoán bằng số đo

**Zoom sâu thì 3D tự thành 2D.** `setEra` tắt hẳn lớp khối từ `ZOOM_TRA_NEN_3D = 7.5` và bật lớp tô phẳng thay thế. Lo ngại ban đầu có thật — mặt trên khối là tấm phẳng đục kín cả tỉnh, che hết đường sá — nhưng cách chữa sai: bỏ 3D thay vì cho nhìn xuyên qua. Nay khối sống ở **mọi** mức zoom với độ trong nội suy theo zoom (0,85 ở zoom 6 → 0,28 ở zoom 11); nền bản đồ và tên tỉnh bật lại khi phóng sâu để còn định vị.

**Không bấm được icon ở 3D.** Đo TRƯỚC khi sửa: bấm đúng tâm marker thì popup **vẫn mở** — cơ chế không hỏng. Hỏng ở kích thước: vòng bấm bán kính **3** (đường kính 6 px), mà lớp icon phẳng bị ẩn ở 3D nên người dùng nhắm vào khối Three.js, còn đích thật là cái chấm 6 px dưới chân nó. WCAG 2.5.8 đòi đích tối thiểu 24×24 ⇒ bán kính ≥ 12. Tách vai trò để giữ cả hai yêu cầu: phần tô để độ trong 0,18 (chỉ còn là bóng dưới chân mô hình), viền mảnh vẽ chân đế — vùng bấm của MapLibre tính theo **bán kính**, không theo độ trong, nên đích vẫn đủ 24 px dù mắt chỉ thấy một vòng nhạt. Đo lại sau khi sửa: bán kính 12, popup mở.

⚠️ **Lag thì KHÔNG đo được, và điều đó phải nói thẳng.** Harness chạy Chrome headless trên swiftshader (GPU phần mềm) nên sàn hiệu năng nuốt hết thứ cần đo: 2D không lớp phủ 5,6 fps · 3D không lớp phủ 4,3 · 3D bật hết 34 lớp 3,0 · 2D bật hết 4,4. Chỉ kết luận được phần tương đối — lớp phủ tốn ~21%, 3D tốn ~23%, gần như cộng tuyến tính, **không điểm nghẽn bất thường nào lộ ra**. Đã bỏ một lượt phí chắc chắn (dựng lại tới 400 mô hình sau mỗi `moveend` dù khung nhìn gần như không đổi), nhưng **không tuyên bố đó là nguyên nhân chính**. Muốn biết thật phải đo trên máy có GPU thật.

### 62 mốc lịch sử — và vì sao không phải 150–250 như đặt hàng

Sóng nghiên cứu được giao nhắm 150–250 mốc, trả về **62**. Lý do đưa ra kiểm được và đúng: `overlays/chien-dich-tran-danh.json` **đã có 168 mục** phủ sâu tới cấp tiểu đoàn cho khởi nghĩa/kháng chiến/trận đánh, nên khoảng trống thật của ba nhóm đó rất hẹp — kết quả là 8 + 1 + 2 mục. Phần lớn công dồn vào hai chỗ thật sự trống: **tác phẩm kinh điển 34 mục** (CSDL trước đó **không có mục nào**) và **triều đại 17 mục** bù năm KẾT THÚC, vì `dong-thoi-gian.json` trước chỉ có năm bắt đầu.

Dừng ở 62 là chọn «không bịa năm» thay vì chọn đủ số. Bốn tác phẩm bị bỏ hẳn vì chỉ tra được trên nguồn bị cấm: Cung oán ngâm khúc · Hoàng Lê nhất thống chí · Lĩnh Nam chích quái · Nam dược thần hiệu (chỉ có bản khắc in 1922, không rõ năm soạn gốc thế kỷ 14).

**Dry-run trước khi nạp** — bẫy #11 nói rõ dedup tự thân của agent không đủ: 0 mục thiếu nguồn · 0 nguồn bị bác · 0 trùng id · 0 thiếu năm · 0 toạ độ ngoài bbox Việt Nam. Bộ dò trùng của tôi báo 8 «nghi trùng», soát tay thì cả 8 là **dương tính giả** do khớp cụm con — «Nhà **Đinh** kết **thúc**» ăn nhầm sang «**Đinh** Văn **Thức**». Ghi lại để lần sau siết điều kiện khớp thay vì tin con số thô.

**8 chỗ hai nguồn chính thống vênh nhau, đã ghi vào `ghi_chu` chứ không chọn bản gọn hơn**: Vạn Xuân kết thúc 602 hay 603 · Lê Trung Hưng kết thúc 1788 (niên hiệu Chiêu Thống) hay 1789 (Ngọc Hồi–Đống Đa, lệch do giáp Tết âm lịch) · Hoàng Việt luật lệ bản khắc 1813 hay ban hành 1815 · Việt Nam sử lược viết 1919 in 1921 hay 1920 · Gia Định thành thông chí chưa thống nhất năm hoàn thành.

⚠️ **Dữ liệu đã nạp nhưng CHƯA NỐI DÂY** — chưa module TS nào đọc `moc-lich-su.json`. Phần UI (note nhỏ hiện phía trên thanh thời gian khi kéo, đính mốc vào vị trí tương ứng) là việc còn lại của hạng mục #6.
