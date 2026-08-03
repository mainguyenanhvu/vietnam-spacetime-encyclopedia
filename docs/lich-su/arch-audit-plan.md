# Kiểm toán kiến trúc & chất lượng mã — vietnam_encyclopedia

- **Ngày**: 2026-07-26 · **Commit gốc**: `ec43b69` + working tree (`src/main.ts` đang bị agent khác sửa)
- **`src/main.ts` tại thời điểm quét: 2746 dòng** (brief ghi 2632 — file đã dài thêm ~114 dòng trong lúc kiểm toán). **Mọi số dòng dưới đây lấy từ bản 2746 dòng**; nếu agent song song commit tiếp, số dòng sẽ trôi — hãy `grep` theo đoạn code trích dẫn thay vì tin số dòng tuyệt đối.
- **Chỉ đọc**: không sửa file nào trong repo.
- **Bản 2** (bổ sung sau khi main gửi 3 dữ kiện mới): (a) lỗi fontstack → §3 mục mới + §5 + bước **B0b**; (b) 7 sink XSS & `as T` → **§4b** + bước **B13b**; (c) không có server ở 5173 → sửa định nghĩa `V3`, thêm `V4` + bước **B-1**, viết lại §9 quanh smoke test CDP. Tất cả đều đã kiểm chứng lại tại chỗ, không chép lại lời main.

---

## 🟢 Không có lỗi phá dữ liệu

Đã soi 13 script có `writeFileSync`. **Không script nào ghi đè sai/mất dữ liệu.** Hai điểm cần biết nhưng KHÔNG khẩn cấp:

- `scripts/gen_song_nui.mjs:121` — script **duy nhất** dùng đường dẫn TƯƠNG ĐỐI: `writeFileSync("public/data/geo/song-nui.json", …)`. 12 script kia đều `join(ROOT, …)`. Chạy từ thư mục khác → ghi nhầm chỗ hoặc `ENOENT`, không hỏng dữ liệu gốc.
- `scripts/add_missing_islands.mjs:74` + `merge_islands.mjs:68` ghi `JSON.stringify(layer)` **không format** đè lên file boundary 1.1 MB đang pretty-print → git diff thành 1 dòng khổng lồ. `add_missing_islands` có lọc idempotent (dòng 58–60) nên chạy lại không nhân đôi đảo. An toàn về dữ liệu.
- `scripts/regeocode.mjs:247,284–293` làm rất chuẩn: kiểm tra round-trip trước khi ghi, không khớp thì vá theo text từng field. Không có vấn đề.

---

## 1. BẢN ĐỒ KIẾN TRÚC — `src/main.ts` (2746 dòng)

23 khối chức năng. `main.ts` hiện đảm nhiệm **8 vai trò khác nhau** cùng lúc: cấu hình dữ liệu, khởi tạo bản đồ, quản lý trạng thái, dựng DOM, dựng HTML popup, điều phối module con, quản lý vòng đời WebGL, và định tuyến panel.

| # | Khối | Dòng | Nội dung | Phụ thuộc |
|---|------|------|----------|-----------|
| 1 | Import + cấu hình thời kỳ | 1–141 | `Era`/`ERAS` (3 lớp ranh giới, 22–49) · `Period`/`PERIODS` (13 thời kỳ, 56–76) · `KY_COLORS` · `eraColorExpr()` · `HEIGHT_3D` · `NGUON_DU_LIEU` · `VIETNAM_BOUNDS` | — (dữ liệu thuần) |
| 2 | Khởi tạo bản đồ | 143–195 | `new maplibregl.Map()` (style inline, basemap CARTO no-label) · 2 control · đồng bộ `--topbar-h` bằng MutationObserver | maplibre |
| 3 | **Trạng thái toàn cục** | 197–204 | `currentEra`, `currentPeriod`, `hoveredId`, `is3D`, `showLabels`, `colorMode` — 6 biến module-level, không đóng gói | — |
| 4 | Tô màu + nhãn tỉnh | 205–251 | `PALETTES` · `colorExprFor()` · `applyColorMode()` · `applyLabels()` | 3 |
| 5 | Lớp sông–núi | 253–362 | `showSongNui` · `applySongNui()` · `initSongNui()` (fetch + 4 layer) | map |
| 6 | Bản đồ cổ Taberd 1838 | 364–404 | `TABERD_URL/CORNERS` · `applyTaberd()` · `setTaberdOpacity()` | map |
| 7 | Cương vực Việt cổ | 406–538 | `initCuongVuc()` (fetch + 3 layer + 2 popup handler) · `applyCuongVuc()` | map, `esc` |
| 8 | **Nam tiến** (tính năng đủ lớn để tách hẳn) | 540–751 | `NamTienMoc` · `initNamTien()` · `setNamTienStep()` · `namTienStop/Play()` · `activateNamTien()` · `buildNamTienUI()` (tự tạo nút + panel) · `renderNamTienPanel()` | map, `fetchJson`, `slugify`, `esc`, `VIETNAM_BOUNDS` |
| 9 | `map.on("load")` | 753–890 | Đăng ký icon · vòng lặp 3 era × 4 layer (fill/line/3d/label) + 3 handler mỗi layer · nhãn chủ quyền HS-TS · gọi init khối 5,7,8 · `setPeriod` · `buildTimeline` · `buildLayerControl` | 1,4,5,7,8,14,18 |
| 10 | Chế độ 3D | 892–926 | `landmarks3d` lazy · `ensureLandmarks3D()` · `setMode3D()` | `./landmarks3d` |
| 11 | Focus 1 tỉnh (R7) | 929–981 | `focusMode` · `focusLayerIds()` · `clearFocusFilters()` · `extendBounds()` · `boundsOfFeature()` · `enterFocus()` · `exitFocus()` | map, 1 |
| 12 | Trình xem mô hình 3D trong panel tỉnh (R4) | 983–1047 | `activeModel3DDispose` · `buildModel3DPanel()` (gallery + nhúng Sketchfab) | `./models3d` |
| 13 | Khởi động 8 module phụ | 1049–1056 | `initGame/Quiz/Story/Olympia/Battle/Journey/QuocGia/Timeline` | 8 module |
| 14 | Điều phối era/period | 1058–1098 | `setEra()` · `setPeriod()` · `buildTimeline()` | 1,3,4,7,11 |
| 15 | **Kiểu + popup builder lớp phủ** | 1101–1193 | `OverlayItem` · `OverlayConf` · `photoImgBlock` · `photoAttrBlock` · `personOverlayPopup` · `universalPersonPopup` · `eventOverlayPopup` | `esc` |
| 16 | **Bảng 33 lớp phủ** | 1195–1692 | `OVERLAYS: OverlayConf[]` — **498 dòng dữ liệu thuần**, 18/33 lớp có popup inline riêng | 15 |
| 17 | Icon emoji + nạp lớp phủ | 1694–1807 | `emojiToImageData()` · `registerOverlayIcons()` · `overlayLoaded` · `bindOverlayInteractions()` · `toggleOverlay()` | map, 16 |
| 18 | Lớp tên đường danh nhân | 1809–1921 | `StreetLink` · `DUONG_DANH_NHAN_ICON` · `applyStreets()` (bản sao gần như y hệt của `toggleOverlay`) | map |
| 19 | Panel điều khiển lớp | 1923–2022 | `OVERLAY_GROUPS` (8 cụm) · `buildLayerControl()` — sinh 1 chuỗi HTML 55 dòng + 2 event delegate | 1,16,18 |
| 20 | **Hồ sơ tỉnh** | 2025–2320 | `SLUG_ALIASES` · `slugify()` · `ProvinceProfile` · `profileCache` · `loadProfile()` · `esc()` · `list()` · `profileHtml()` · `showProvincePanel()` (**180 dòng**) · handler `#panel-close` | 11,12,21,22,23 |
| 21 | Thư viện văn thơ | 2322–2508 | 5 interface · `literatureCache` · `fetchJson()` · `loadLiterature()` · `poemHtml/anecdoteHtml/hcmPoemHtml/caDaoHtml/baiHatHtml` | `esc`,`list` |
| 22 | Thư viện ảnh | 2511–2568 | `MediaImage` · `MUC_LABEL` · `LICENSE_LABEL` · `loadMedia()` · `mediaImgHtml()` | `esc` |
| 23 | Nhân vật 3D + niên hiệu + `openLibrary` | 2571–2746 | `HistFigure` · `loadFigures()` · `disposeFigures()` · `mountFigureInto()` · `figureCardHtml()` · `NienHieuItem` · `wireNienHieuLookup()` · `openLibrary()` (50 dòng HTML) | `./figures3d` |

**Đọc ra từ bản đồ này:**
- Khối 16 (498 dòng) + 15 (93) + 19 (100) = **691 dòng = 25% file chỉ để mô tả lớp phủ**. Không phụ thuộc `map`, tách được ngay, rủi ro ~0.
- Khối 20+21+22+23 = **721 dòng = 26%** là UI panel tỉnh & thư viện, chỉ phụ thuộc `esc`/`list`/`fetchJson`.
- Khối 8 (212 dòng) là một tính năng độc lập hoàn chỉnh nhưng nằm giữa file, xen giữa "bản đồ cổ" và `map.on("load")`.
- Nếu tách 16+15+19+20+21+22+23+8 → `main.ts` còn **~1120 dòng**, và đó mới đúng là "khởi tạo bản đồ + điều phối".
- Khối 18 (`applyStreets`, 113 dòng) là bản copy của khối 17 (`toggleOverlay`) với dữ liệu khác. Xem §5.

---

## 2. LỖI LOGIC THẬT

Mỗi mục đều có input cụ thể tái hiện được. Xếp theo mức nghiêm trọng.

### L1 🔴 Ẩn panel vòng qua hàm dispose → rò WebGL context

`src/journey.ts:141` dispose đúng, nhưng module khác ẩn panel **trực tiếp bằng `hidden = true`**:

```ts
// journey.ts:141
function closePanel(): void {
  disposeFigure();                       // ← chỉ chạy khi bấm nút × của journey
  const panel = document.getElementById("journey-panel");
  if (panel) panel.hidden = true;
}
// battle.ts:58-71 / quocgia.ts:257 / timeline.ts:77
function hideOtherPanels(): void {
  for (const id of [..., "journey-panel"]) {
    const p = document.getElementById(id);
    if (p) p.hidden = true;              // ← KHÔNG gọi disposeFigure()
  }
}
```

**Input**: bấm `🏛️ Hành trình lịch sử` (mount 1 `THREE.WebGLRenderer`) → bấm `⚔️ Sa đồ chiến dịch` → lặp lại 16 lần.
**Hành vi sai**: `activeFigure` không bao giờ được dispose → mỗi vòng rò 1 WebGL context. Chrome giới hạn ~16 context/tab → `WARNING: Too many active WebGL contexts. Oldest context will be lost` → **canvas của bản đồ MapLibre chính là context cũ nhất, bản đồ trắng xoá**, phải F5.
Cùng lỗi với `province-panel`: `olympia.ts:103` và `battle.ts:59` ẩn nó mà không gọi `activeModel3DDispose()` / `disposeFigures()` (`main.ts:987, 2597`).
**Sửa**: xem bước **B2** — registry panel có callback `onHide`.

### L2 🔴 Olympia: nút "Bỏ qua" biến mất → kẹt cứng vòng 2

`src/olympia.ts:294–307` — nút skip được `c.appendChild(skip)` **một lần**, nhưng `render()` bên trong (dòng 232–288) ghi đè `c.innerHTML` mỗi lần bấm "Mở hàng ngang":

```ts
  render();                       // dòng 289
  const skip = document.createElement("button");
  …
  c.appendChild(skip);            // dòng 307 — chỉ chạy 1 lần
```
```ts
  const render = (): void => { … c.innerHTML = `…`; …   // xoá sạch skip
    document.getElementById("ol-open")?.addEventListener("click", () => {
      if (opened < puzzle.hang_ngang.length) opened += 1;
      render();                                          // ← skip mất vĩnh viễn
```

**Input**: mở 🏔️ Leo núi → hết vòng 1 → vòng 2 bấm `🔓 Mở hàng ngang 1`.
**Hành vi sai**: nút `Bỏ qua (0 điểm) →` biến mất và không bao giờ quay lại. Nếu người chơi không đoán được từ khoá thì **không còn cách nào sang vòng 3** — phải tải lại trang, mất toàn bộ điểm. Nghịch lý: đoán sai càng nhiều (mở gợi ý) thì càng bị kẹt.
**Sửa**: chuyển nút skip vào chuỗi template của `render()` và gắn listener trong `render()`.

### L3 🟠 `toggleOverlay` không chống chồng lệnh → `addSource` ném lỗi

`src/main.ts:1745–1807`:

```ts
async function toggleOverlay(id: string, on: boolean): Promise<void> {
  if (overlayLoaded.has(id)) { …setLayoutProperty…; return; }
  if (!on) return;
  const conf = OVERLAYS.find((o) => o.id === id);
  const data = await fetchJson<{ items: OverlayItem[] }>(conf.file);   // 1748
  …
  map.addSource(layerId, { … });                                       // 1768
  …
  overlayLoaded.add(id);                                               // 1806
}
```

`overlayLoaded.add(id)` chỉ chạy ở **cuối**; giữa `await` (1748) và nó không có cờ "đang tải".

- **Input A** — tick `🏛️ Di tích quốc gia` (402 kB, tải ~1 s) rồi bỏ tick ngay: lần 2 rơi vào `if (!on) return` → khi lần 1 xong, lớp phủ **vẫn được vẽ lên bản đồ** trong khi checkbox đang bỏ tick. Trạng thái UI và bản đồ lệch nhau, và không tắt được vì lần bấm sau chỉ `setLayoutProperty(…, "none")` → thực ra tắt được, nhưng người dùng thấy lớp tự bật lên.
- **Input B** — tick / bỏ tick / tick nhanh 3 lần: hai lời gọi cùng vượt qua `overlayLoaded.has()` → cùng chạy `map.addSource("overlay-di-tich-quoc-gia")` → MapLibre ném `Error: There is already a source with ID "overlay-di-tich-quoc-gia"`. Vì gọi bằng `void toggleOverlay(…)` (dòng 2010) nên đây là **unhandled promise rejection**, và `bindOverlayInteractions` bị gắn 2 lần → popup mở đôi.

`src/main.ts:1829–1920` `applyStreets()` có y hệt lỗi này (`streetsLoaded = true` ở dòng 1920).
**Sửa**: `const overlayInFlight = new Set<string>()`; vào hàm thì `if (overlayInFlight.has(id)) return;` + `add`, `finally { delete }`; sau khi `await` xong đọc lại trạng thái checkbox để quyết định `visibility`.

### L4 🟠 `hoveredId` dùng chung cho 3 era → tỉnh sáng vĩnh viễn

`src/main.ts:199, 823–832`:

```ts
let hoveredId: number | string | undefined;      // 199 — chỉ có id, KHÔNG có source
…
map.on("mousemove", layerId, (e) => {
  if (hoveredId !== undefined)
    map.setFeatureState({ source: era.id, id: hoveredId }, { hover: false });  // 824
  hoveredId = f.id;
```

`setLayoutProperty(…, "none")` **không kích hoạt `mouseleave`**.
**Input**: rê chuột lên "Nghệ An" ở lớp 34 tỉnh (feature id 5 của source `era-34` được set `hover:true`) → **giữ nguyên chuột**, kéo thanh trượt dòng thời gian sang "63 tỉnh".
**Hành vi sai**: `era-34-fill` bị ẩn, không có `mouseleave`, `hoveredId` vẫn = 5. Rê chuột trong lớp 63 tỉnh → dòng 824 xoá hover của `{source:"era-63", id:5}` (một tỉnh **khác**, không liên quan), còn `{source:"era-34", id:5}` kẹt `hover:true` mãi. Quay về lớp 34 tỉnh → Nghệ An sáng đậm (`fill-opacity` 0.55 thay vì 0.25) và **nhô cao 75000 m ở chế độ 3D** (`HEIGHT_3D` dòng 120–125) dù chuột ở nơi khác.
**Sửa**: `let hovered: { source: string; id: string | number } | null = null;` và xoá trong `setEra()`.

### L5 🟠 Lớp cương vực / Nam tiến không hiện nếu người dùng bấm nhanh hơn `fetch`

`src/main.ts:406–517` (`initCuongVuc`) và `555–635` (`initNamTien`) thêm layer với `visibility:"none"` + filter `__none__`, rồi **không áp lại trạng thái hiện tại**:

```ts
      map.addLayer({ id: "cuong-vuc-fill", …, filter: ["==", ["get","id"], "__none__"],
                     layout: { visibility: "none" } … });
      …
    })
    .catch(() => {});                    // 517 — kết thúc, không gọi applyCuongVuc()
```

So sánh: `initSongNui` **có** xử lý đúng ở dòng 357 → `if (showSongNui) applySongNui(true);`. Hai hàm kia thiếu.

**Input**: mở trang, trong ~300 ms đầu (trước khi `co-truong-viet-co.json` về) kéo thanh trượt sang "Văn Lang".
**Hành vi sai**: `setPeriod()` → `applyCuongVuc("van-lang")` chạy, mọi `map.getLayer(...)` đều `false` → không làm gì. Khi fetch xong, layer được thêm ở trạng thái ẩn. **Bản đồ trống, nhãn ghi "Văn Lang" mà không có polygon nào** — phải đổi thời kỳ đi rồi quay lại. Tái hiện chắc chắn với Network throttling "Slow 3G".
Tương tự Nam tiến: nút `🧭 Nam tiến` được tạo bởi `buildNamTienUI()` (dòng 634, chạy sau fetch #1) nhưng source `nam-tien` được thêm bởi fetch #2 (1.16 MB, dòng 563). Bấm nút trong khoảng giữa → panel mở, bấm ▶ chạy hết 12 mốc mà bản đồ không đổi gì.
**Sửa**: cuối mỗi `.then()` gọi lại `applyCuongVuc(PERIODS[currentPeriod].kind === "cuongvuc" ? … : "off")` / `if (!panelHidden) activateNamTien(true)`.

### L6 🟠 Silhouette trò chơi bị Trường Sa/Hoàng Sa kéo giãn 5,4 lần

`src/game.ts:120–150` tính bbox từ **toàn bộ** `f.rings`, trong khi tâm lại lấy từ ring lớn nhất:

```ts
  for (const ring of f.rings)          // 125 — TẤT CẢ polygon
    for (const [x, y] of ring) { if (x < minX) minX = x; … }
```

Đo thật trên `vn-34-tinh-2025.geojson`:

| Tỉnh | Số polygon | bbox toàn bộ (lon) | bbox đất liền (lon) | Giãn |
|---|---|---|---|---|
| Khánh Hoà | 342 | 108,55 → **116,94** | 108,55 → 109,44 | **5,37×** |
| Đà Nẵng | 23 | 107,21 → **112,74** | 107,21 → 108,74 | 3,62× |
| TP HCM | 2 | 106,33 → 107,57 (lat 8,65→11,50) | lat 10,32→11,50 | 2,29× |

**Input**: ngày mà `hashDate(todayStr()) % 34` trỏ vào Khánh Hoà.
**Hành vi sai**: SVG được scale vừa bbox 8,4° → hình dáng đất liền Khánh Hoà co lại còn ~19% chiều rộng khung, phần còn lại là hàng trăm chấm li ti của quần đảo Trường Sa. **Câu đố hôm đó gần như không đoán được.** Ảnh hưởng 3/34 ngày ≈ 9%.
**Cùng gốc**: `main.ts:959–964 boundsOfFeature()` → bấm `🔍 Chỉ xem tỉnh này` cho Khánh Hoà thì `fitBounds` bao cả Biển Đông, `maxZoom: 9` vô nghĩa — trái hẳn mục đích "zoom sâu để đi vào chi tiết" ghi ở comment dòng 931.
**Sửa**: bỏ qua ring có diện tích bbox < 1% ring chính khi tính khung nhìn/hình bóng (vẫn vẽ chúng — chủ quyền phải giữ, chỉ không cho chúng quyết định scale).

### L7 🟡 Olympia: đồng hồ chạy tiếp khi panel bị module khác ẩn

`src/olympia.ts:525–530` chỉ đăng ký "ẩn + `clearTimer()`" cho 5 nút **có sẵn trong `index.html`**:

```ts
  for (const id of ["threed-btn", "story-btn", "game-btn", "quiz-btn", "library-btn"]) {
```

`battle-btn`, `journey-btn`, `timeline-btn`, `quocgia-btn`, `namtien-btn` do JS tạo sau nên không có trong danh sách — nhưng `hideOtherPanels()` của các module đó **có** ẩn `olympia-panel`.
**Input**: đang trả lời câu 3 vòng Khởi động (còn 12 s) → bấm `⚔️ Sa đồ chiến dịch`.
**Hành vi sai**: `timerId` vẫn chạy; sau 12 s `answerKhoiDong(null, q)` tự chấm **sai** câu đó trên DOM đang ẩn. Quay lại Leo núi thì câu hỏi đã bị tính hết giờ dù người chơi chưa đọc xong.

### L8 🟡 `pickSession` xoá sạch ưu tiên thẻ đến hạn — SM-2 không hoạt động

`src/quiz.ts:170–176`:

```ts
  const due = cards.filter((c) => reviews[c.id] && reviews[c.id].due <= today);
  const unseen = cards.filter((c) => !reviews[c.id]);
  return shuffle([...due, ...shuffle(unseen)]).slice(0, SESSION_SIZE);   // 175
```

`shuffle()` bọc ngoài **trộn lẫn `due` vào `unseen`** rồi mới cắt 10 → thẻ đến hạn không hề được ưu tiên.
**Input**: ngân hàng sinh ra **89 thẻ** (đã tính thật từ `vn-34-tinh-2025.geojson`: 34 tỉnh → 21 thẻ `hopthanh` + 34 `sapnhap` + 34 `tthc`; không có id trùng). Hôm nay có 3 thẻ đến hạn.
**Hành vi sai**: xác suất một thẻ đến hạn lọt vào phiên = 10/89 ≈ **11%**. Người dùng gần như không bao giờ gặp lại thẻ mình trả lời sai — đúng cái mà dòng comment 1–4 và câu "câu sai quay lại ngay hôm sau" (dòng 203) hứa hẹn.
**Sửa**: `return [...shuffle(due), ...shuffle(unseen)].slice(0, SESSION_SIZE);`

### L9 🟡 `kid-mode` dính lại trên `<body>` vĩnh viễn

`src/story.ts:131` thêm class, `:153` chỉ gỡ khi bấm nút × của story:

```ts
    document.body.classList.add("kid-mode");        // 131
```

Mọi `hideOtherPanels()` khác ẩn `story-panel` mà không gỡ class.
**Input**: bấm `🐉 Thiếu nhi` → bấm `🎮 Đoán Tỉnh Xưa`.
**Hành vi sai**: topbar giữ gradient cam-đỏ trẻ em (`style.css:485–487 body.kid-mode #topbar`) suốt phiên. Nhẹ về hậu quả, nhưng lộ rõ vấn đề kiến trúc chung với L1.

### L10 🟡 Bấm 📖 Thư viện không đóng các panel mới

`src/main.ts:2699–2702` (`openLibrary`) chỉ ẩn 3 panel:

```ts
  for (const id of ["game-panel", "quiz-panel", "story-panel"]) {
```

Trong khi app có **11 panel**. Độ phủ `hideOtherPanels` của từng module (trên tổng 10 panel còn lại):

| Nguồn | Ẩn được | Sót |
|---|---|---|
| `main.openLibrary:2699` | 3/10 | olympia, battle, journey, quocgia, timeline, namtien, province |
| `game.ts:43`, `quiz.ts:46` | 3/10 | như trên |
| `story.ts:127` | 3/10 | như trên |
| `olympia.ts:103` | 5/10 | battle, journey, quocgia, timeline, namtien |
| `journey.ts:148` | 6/10 | quocgia, timeline, namtien, province |
| `battle.ts:59` | 7/10 | quocgia, timeline, namtien |
| `quocgia.ts:258` | 7/10 | province, timeline, namtien |
| `timeline.ts:78` | 8/10 | province, namtien |
| Nam tiến (`main.ts:702`) | 0/10 | tất cả |

**Không module nào ẩn `timeline-panel` hay `namtien-panel`.**
**Input**: bấm `🕰️ Dòng thời gian` → bấm `📖 Thư viện`.
**Hành vi sai**: hai panel chồng lên nhau. Đây là hệ quả trực tiếp của việc mỗi module tự giữ một danh sách hard-code — 9 danh sách, không danh sách nào đúng.

### L11 🔵 Cửa sổ "Kỷ lục mới!" hiện cả khi chỉ bằng kỷ lục cũ

`src/olympia.ts:477–478`:

```ts
  const best = saveHighScore(totalScore);       // best = max(cũ, totalScore)
  const isRecord = totalScore >= best && totalScore > 0;
```

`saveHighScore` đã trả về `max()` nên `totalScore >= best` luôn đúng khi `totalScore >= kỷ lục cũ`.
**Input**: kỷ lục cũ 180, chơi lại đúng 180 điểm → hiện "🏆 Kỷ lục mới!". Cosmetic.

### L12 🔵 `URL.revokeObjectURL` gọi ngay sau `click()`

`src/game.ts:236–240` — thu hồi blob URL đồng bộ ngay sau `a.click()`. Chrome ổn; Firefox/Safari có thể huỷ tải xuống. Nên `setTimeout(…, 0)` hoặc revoke ở lần export sau.

---

## 3. LỖI TIỀM ẨN

**Race khi nạp JSON bất đồng bộ**
- L3, L5 ở trên là hai ca nặng nhất — đã tính vào lỗi thật vì tái hiện được.
- `main.ts:2253` `void Promise.all([loadProfile, loadLiterature, loadMedia, loadFigures]).then(…)` — **không có `.catch()`**. `profileHtml()` (2095) gọi thẳng `p.ten_thoi_ky.map()` và `p.danh_nhan.map()` không guard. Đã kiểm 34/34 file hồ sơ tỉnh đều đủ 8 khoá bắt buộc và đúng kiểu mảng → **hôm nay không nổ**, nhưng một file hồ sơ mới thiếu `ten_thoi_ky` sẽ làm `.then()` ném lỗi âm thầm, panel kẹt mãi ở "Đang tải hồ sơ bách khoa…" mà console chỉ có unhandled rejection. Validator hiện chưa chặn được? — `validate_provinces.mjs` có chạy trong CI, cần xác nhận nó kiểm đúng 8 khoá này.
- `main.ts:2253` gọi lại 4 loader mỗi lần bấm tỉnh; 3 loader có cache nhưng `loadProfile` cache theo slug — ổn.
- `story.ts:135` `void fetch(dataUrl)` chạy **vô điều kiện** mỗi lần bấm nút, kể cả khi `story` đã nạp (các module khác đều `if (data) { render(); return; }`). Thêm 1 request thừa mỗi lần mở.

**Xử lý lỗi fetch**
- Tốt: `battle/journey/timeline/game/quiz/olympia/story` đều `if (!r.ok) throw` + `.catch()` hiện thông báo tiếng Việt.
- `main.ts:507/517` `initCuongVuc` `.catch(() => {})` — nuốt lỗi hoàn toàn, không log, không báo người dùng. `initSongNui:359` ít nhất có comment giải thích.
- `quocgia.ts:275–299` `loadAll()` bọc 4 fetch trong **một** `try` — nếu `phim` lỗi thì `nhac`/`diadanh` không được thử, và `catch` ghi đè toàn bộ body bằng thông báo lỗi dù `danhnhan` đã nạp thành công.
- `main.ts:1748` `fetchJson` trả `null` khi lỗi → `toggleOverlay` bỏ tick checkbox (1752–1756). Nhưng nếu file có JSON hợp lệ mà **thiếu khoá `items`**, `data` truthy còn `data.items.map` (1762) ném `TypeError`. Đã kiểm 33/33 file overlay đều có `items` là mảng, `ten` là string, `lon`/`lat` là số hữu hạn → hôm nay an toàn.

**Rò bộ nhớ / WebGL**
- L1 là ca chính.
- `models3d.ts:654–673` và `figures3d.ts:867–885` dispose rất kỹ (huỷ RAF, `io.disconnect()`, `ro.disconnect()`, gỡ 4 pointer listener, `traverse` dispose geometry+material, `renderer.dispose()`, gỡ canvas). **Thiếu duy nhất `renderer.forceContextLoss()`** — `dispose()` không bảo đảm trả context ngay trên Chrome; với trần ~16 context/tab và L1 chưa sửa thì đây là giọt nước tràn ly. Thêm 1 dòng mỗi file.
- `landmarks3d.ts:208–219`: renderer dùng chung canvas của MapLibre, sống suốt vòng đời trang, **không có đường dispose**. Chấp nhận được vì chỉ tạo 1 lần (`ensureLandmarks3D` có cờ `landmarks3dLoading`), nhưng `createLandmarks3D` cũng không có cách gỡ 2 custom layer.
- `main.ts:191–194`: `MutationObserver` + `resize` listener giữ ở scope module (có comment giải thích) — đúng.
- `main.ts:1725–1733 bindOverlayInteractions` gắn 3 listener × 2 layer cho **mỗi** lớp phủ; không bao giờ gỡ. Bật hết 33 lớp = 198 listener. Không rò (không lặp lại) nhưng nếu sửa L3 sai hướng thì sẽ nhân đôi.
- `olympia.ts` `timerId` — xem L7.
- `main.ts:651` `namTienTimer = window.setInterval(…, 1600)` — `namTienStop()` được gọi khi đóng panel bằng nút × (dòng 708) và khi tắt qua nút toggle (699), nhưng **không** khi panel bị ẩn bởi module khác (không module nào ẩn `namtien-panel`, nên hiện tại chưa xảy ra — sẽ xảy ra ngay khi B2 gom panel lại).

**Truy cập mảng ngoài biên**
- `tsconfig` **không bật `noUncheckedIndexedAccess`** → mọi `arr[i]` được coi là chắc chắn có giá trị. Các chỗ nguy hiểm đều đã có guard thủ công: `session[sessionIndex]` (quiz 224, guard 183), `kdList[kdIndex]` (olympia 161, guard 157), `vdList[vdIndex]` (434, guard 412), `namTienMoc[Math.max(0, namTienStep)]` (main 736, guard 735). Không tìm thấy ca thật nào vượt biên.
- `game.ts:103` `polys.reduce((a,b) => …)` **không có initial value** → ném `TypeError` nếu một feature có `coordinates: []`. Dữ liệu hiện tại không có; là quả mìn cho geojson tương lai.
- `models3d.ts:527` `MODELS3D.find(...) ?? MODELS3D[0]` — nếu mảng rỗng thì `def` là `undefined` mà TS không cảnh báo. Chỉ lý thuyết.

**Fontstack sai → mất TOÀN BỘ lớp (dữ kiện (a), đã vá, nhưng kiến trúc chưa chặn tái diễn)**

`main.ts:147` khai `glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf"` — endpoint này chỉ phục vụ **2 fontstack**: `"Open Sans Semibold"` và `"Noto Sans Regular"`. MapLibre gom mọi fontstack của **cùng một source** vào một lượt `getGlyphs` rồi `await Promise.all` → **một reject làm cả tile errored**, kéo theo cả layer `line` vốn không cần font nào.

Trạng thái hiện tại (đã kiểm 2026-07-26 — bản vá đã vào):
```
main.ts:307  "text-font": ["Open Sans Semibold"]   ✅
main.ts:331  "text-font": ["Noto Sans Regular"]    ✅ (trước là "Open Sans Bold" → 404)
main.ts:350  "text-font": ["Open Sans Semibold"]   ✅
main.ts:811  "text-font": ["Open Sans Semibold"]   ✅
main.ts:873  "text-font": ["Open Sans Semibold"]   ✅
```

**Vì sao kiến trúc hiện tại không chặn được**: 5 chuỗi literal rải khắp file, không hằng số, không type. `tsc` coi `["Open Sans Bold"]` là `string[]` hợp lệ; `npm run build` xanh; lỗi chỉ lộ khi mở trình duyệt và nhìn đúng lớp đó. Không validator nào đọc `src/main.ts` để đối chiếu fontstack. Ai thêm symbol layer mới sẽ tái diễn y hệt.
→ Chặn bằng **B0b** (hằng số + union type, `tsc` bắt lúc biên dịch) và **S1** trong smoke test (bắt `404 …/font/…` lúc chạy). Hai lớp, vì type chỉ chặn được literal trong repo, còn smoke test bắt cả trường hợp endpoint đổi chính sách.

**`parseFloat`/`Number` trên dữ liệu thiếu**
- `main.ts:2151` `num()`:
  ```ts
  const num = (v: string | number | undefined) =>
    v === undefined || v === "" ? "—" : Number(String(v).replace(",", ".")).toLocaleString("vi-VN");
  ```
  `.replace(",", ".")` chỉ đổi **dấu phẩy đầu tiên**. Với `"9888,91"` (định dạng thật trong dữ liệu) → `9888.91` ✅. Với `"1,234,56"` → `"1.234,56"` → `NaN` → hiện chữ **"NaN"** trên panel. **Đã chạy `num()` trên toàn bộ 5 trường số × 39 feature của `vn-34-tinh-2025.geojson`: 0 kết quả NaN** → không phải lỗi thật hôm nay, nhưng chỉ cần một tỉnh mới nhập "1,234,567" là hỏng. Ngoài ra `num(null)` → `Number("null")` → `"NaN"`; 3 file boundary hiện không có giá trị `null` nào (đã kiểm).
- `main.ts:1896` `Number(p.so_doan)` và `1888 Number(p.osm_sai_dau)` — thuộc tính GeoJSON qua MapLibre có thể là string; `Number()` xử lý được, không guard `NaN` nhưng chỉ hiển thị.
- `olympia.ts:91` `Number(localStorage.getItem(...))` → `Number(null)` = 0, `Number("abc")` = `NaN` → `Number.isFinite` chặn. Đúng.
- `main.ts:2657` `Number(input?.value)` có validate đầy đủ (integer, ≠ 0, −2879..1945). Tốt.

---

## 4. TYPE SAFETY

**`npx tsc --noEmit` → sạch, exit code 0.** (chạy thật lúc 2026-07-26)

**`tsconfig.json` hiện tại** — đã bật: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `isolatedModules`, `noEmit`. `skipLibCheck: true`.

**Chưa bật** (đề xuất, theo thứ tự lợi/hại):

| Cờ | Lợi | Chi phí ước tính |
|---|---|---|
| `noUncheckedIndexedAccess` | Bắt mọi `arr[i]`/`Record[k]` phải xử lý `undefined` — trực tiếp phòng lớp lỗi ở §3 | ~40–60 lỗi mới, phần lớn thêm `?? fallback`. **Nên bật SAU khi tách module**, không phải bây giờ |
| `exactOptionalPropertyTypes` | Phân biệt "thiếu khoá" vs "khoá = undefined" — hợp với schema JSON đầy trường `?` | ~10 lỗi |
| `noPropertyAccessFromIndexSignature` | Buộc `p["Tỉnh thành mới"]` thay vì `p.tenKhongTonTai` | thấp |

**Mức lan của `any`: giả thiết trong brief KHÔNG đúng.**

```
: any  |  as any  |  <any>   →  0 kết quả trên toàn bộ src/
```

Lối thoát kiểu thật sự đang dùng là hai loại khác:

| Loại | Số lần | Ở đâu | Vì sao |
|---|---|---|---|
| `as never` | **14** (toàn bộ trong `main.ts`) | `map.addLayer({…} as never, before)` (dòng 296, 314, 334, 356, 438, 449, 468, 606, 618, 631) và `map.setFilter(id, f as never)` (531, 536, 642, 645) | Kiểu `LayerSpecification` của maplibre 4.x quá chặt với biểu thức dựng động |
| `as unknown as ExpressionSpecification` | 3 | 282 (`size`), 428 (`color`), 233 (`to-color`) | như trên |
| `as OverlayItem & { … }` | **10** | các popup builder, 1142–1338 | `OverlayItem` (1103–1116) chỉ khai báo 11 trường chung; mỗi lớp phủ lại có schema riêng (`nam_hien_thi`, `noi_tho`, `cong_trang`, `do_tin_cay_toa_do`, `ket_qua`, `chi_huy`, `noi_luu_giu`…) nên mỗi popup tự nới kiểu tại chỗ |
| `f.properties as Record<string, string>` | 4 | 474, 493, 1729, 1896 | GeoJSON properties không có kiểu |

Tổng casts `as`: `main.ts` 52, các file khác 1–10.

**Đề xuất bộ type cho schema JSON — đặt ở đâu**

Tạo **`src/types/data.ts`** (chỉ `interface`/`type`, không import runtime — an toàn tuyệt đối, `import type` tree-shake sạch):

```ts
// src/types/data.ts
/** Trường chung của MỌI mục lớp phủ (giao của 33 schema). */
export interface OverlayBase { ten: string; lon: number; lat: number; … }
/** Hợp của mọi trường tuỳ chọn đang được popup đọc — thay cho 10 lần `as OverlayItem & {…}`. */
export interface OverlayItem extends OverlayBase {
  nam_hien_thi?: string; thoi_ky?: string; dia_diem?: string; noi_tho?: string;
  mo_ta?: string; cong_trang?: string; ket_qua?: string; chi_huy?: string;
  noi_luu_giu?: string; do_tin_cay_toa_do?: "cao" | "trung" | "thap"; …
}
export interface ProvinceProfile { … }   // chuyển từ main.ts:2045
export interface Poem { … } export interface Anecdote { … }   // main.ts:2324, 2341
export interface MediaImage { … } export interface HistFigure { … }
```

Gộp tất cả trường tuỳ chọn vào **một** `OverlayItem` sẽ xoá được cả 10 cast inline, và mỗi popup builder chỉ đọc trường mình cần. Đây là bước phụ trợ miễn phí của **B9a**.

Với 14 `as never`: **đừng đụng vào**. Đó là hạn chế của type maplibre, không phải lỗi dự án; thay bằng type helper tự viết sẽ tốn hơn 100 dòng cho 0 lợi ích thực. Chỉ nên gom một helper nhỏ `addLayerLoose(map, spec, before?)` nếu muốn giảm nhiễu thị giác — không bắt buộc.

### 4b. Trả lời dữ kiện (b): 7 sink XSS và `as T` là CÙNG MỘT gốc

`sec-audit` đúng, và hai phát hiện đó **không phải hai lỗi — là một**: giữa JSON và HTML **không tồn tại ranh giới kiểu nào**.

```ts
async function fetchJson<T>(path: string): Promise<T | null> {   // main.ts:2400
  const res = await fetch(`${import.meta.env.BASE_URL}${path}`);
  return res.ok ? ((await res.json()) as T) : null;              // ← `as T`: 0 kiểm tra
}
const esc = (s: string) => s.replace(/&/g, "&amp;")…             // main.ts:2085
```

Chuỗi nhân quả: `as T` tuyên bố `p.dot` là `number` → `tsc` tin → tác giả thấy "số thì escape làm gì" → viết `${p.dot}` → nhưng JSON thật có thể trả string → **sink XSS**. `esc()` cũng không cứu được vì `esc(p.dot)` sẽ bị `tsc` từ chối (`number` không gán được cho `string`), nên tác giả buộc phải hoặc bỏ `esc` hoặc viết `esc(String(...))` — và bản vá hiện tại đang chọn vế thứ hai.

**Kiểm chứng tại chỗ 2026-07-26** (đang có agent #11 vá song song, nên trạng thái hỗn hợp):
- ✅ đã vá: `main.ts:1226` → `esc(String(p.dot))` · `main.ts:2559` → `esc(LICENSE_LABEL[m.giay_phep] ?? String(m.giay_phep ?? ""))`
- ❌ còn hở: `battle.ts:254` → `<b>Năm:</b> ${b.nam}` · `olympia.ts:342` → `độ khó ${q.do_kho ?? ttIndex + 1}`

**`esc(String(x))` chỉ là băng dán.** Nó vá 7 chỗ hôm nay; trường thứ 8 thêm vào tháng sau lại lọt, vì **không có gì trong `tsc` bắt được** — đúng như câu hỏi của main đặt ra.

#### Đặt ranh giới ở đâu, và làm sao `tsc` bắt được lần sau

**Một chỗ duy nhất: `fetchJson` bắt buộc nhận hàm parse.** Không có đường nào khác để JSON vào app.

- **`src/types/parse.ts`** (mới, ~50 dòng, 0 dependency — **không** đề xuất zod: thêm 60 kB runtime cho web tĩnh là không đáng):
  ```ts
  /** Ép mọi giá trị JSON về string an toàn cho HTML. Số/null/undefined đều ra string. */
  export const str = (v: unknown, fallback = ""): string =>
    v == null ? fallback : typeof v === "string" ? v : String(v);
  export const arr = <T>(v: unknown, item: (x: unknown) => T): T[] =>
    Array.isArray(v) ? v.map(item) : [];
  export const numOrNull = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) ? v : null;
  ```
- **`src/types/data.ts`** — mỗi schema một hàm `parseX(raw: unknown): X`. Điểm mấu chốt: **mọi trường sẽ đi vào HTML đều khai kiểu `string`**, kể cả trường "vốn là số":
  ```ts
  export interface OverlayItem {
    ten: string; lon: number; lat: number;
    dot?: string;         // ← string, KHÔNG phải number, dù JSON ghi 3
    nam_hien_thi?: string; do_tin_cay_toa_do?: "cao" | "trung" | "thap";
    …
  }
  export const parseOverlayItem = (raw: unknown): OverlayItem => { … dot: str(r.dot) … };
  ```
- **`fetchJson` đổi chữ ký** (B13b):
  ```ts
  export async function fetchJson<T>(path: string, parse: (raw: unknown) => T): Promise<T | null>
  ```
  Bỏ hẳn `as T`. Quên truyền `parse` → **lỗi biên dịch**, không phải lỗi runtime.

**Cơ chế `tsc` bắt được trường mới** — ba lớp, lớp nào cũng chặn lúc biên dịch:

1. **`esc(s: string)` giữ nguyên chữ ký hẹp.** Vì `parseX` đã ép mọi trường hiển thị thành `string`, `esc(item.dot)` biên dịch được ngay — **`esc(String(...))` trở nên thừa**. Ngược lại, ai khai một trường mới kiểu `number` rồi định `esc()` nó sẽ bị `tsc` chặn tại chỗ, buộc phải quay lại khai đúng thành `string` trong `parseX`.
2. **`noUncheckedIndexedAccess` (B20)** làm mọi `LICENSE_LABEL[m.giay_phep]` thành `string | undefined` → buộc có fallback, đúng chỗ mà `main.ts:2559` vừa phải vá tay.
3. **Branded type cho HTML** (tuỳ chọn, +10 dòng, chặn triệt để nhất):
   ```ts
   export type Html = string & { readonly __html: unique symbol };
   export const esc = (s: string): Html => (…) as Html;
   export const raw = (s: string): Html => s as Html;   // lối thoát PHẢI viết rõ ra
   export const html = (parts: TemplateStringsArray, ...v: Html[]): Html => …
   ```
   Với template tag `html\`…\``, mọi `${}` phải có kiểu `Html`. Nhét thẳng `${b.nam}` (string thường) → **`tsc` báo lỗi**. Muốn cố tình chèn HTML thô thì phải gõ `raw(...)` — hiện rõ trong diff, `grep raw\\(` là ra hết. Đây là câu trả lời triệt để cho "làm sao lần sau không phải chờ audit thủ công", nhưng phải chuyển ~60 template literal nên đề xuất làm **sau** Sprint 3, khi file đã tách nhỏ.

**Khuyến nghị**: làm lớp 1 + 2 (B13b + B20) — đủ để `tsc` chặn, chi phí ~120 dòng. Lớp 3 chỉ làm nếu sau này còn phát hiện thêm sink.

---

## 5. TRÙNG LẶP

### 5a. `src/`

| Logic | Lặp ở | Số bản | Gom vào |
|---|---|---|---|
| **`esc()` — escape HTML 5 ký tự, GIỐNG HỆT NHAU** | `main.ts:2085`, `battle.ts:50`, `game.ts:34`, `journey.ts:32`, `olympia.ts:58`, `quiz.ts:37`, `quocgia.ts:88`, `story.ts:25`, `timeline.ts:26` | **9** | `src/util/html.ts` |
| **`hideOtherPanels()`** — 9 danh sách hard-code khác nhau, không cái nào đúng (xem L10) | `main.ts:2699`, `game.ts:42`, `quiz.ts:45`, `story.ts:127`, `olympia.ts:102`, `battle.ts:58`, `journey.ts:147`, `quocgia.ts:257`, `timeline.ts:77` | **9** | `src/panels.ts` (registry) |
| **`shuffle<T>()`** — Fisher-Yates y hệt | `quiz.ts:108`, `story.ts:50`, `olympia.ts:66` | 3 | `src/util/rand.ts` |
| **`todayStr()`** — format `YYYY-MM-DD` y hệt | `game.ts:50`, `quiz.ts:53` (+ `quiz.ts:58 addDays` dùng lại cùng 3 dòng format) | 3 | `src/util/date.ts` |
| **fetch + `!r.ok` + `.json()` + `.catch()`** | `main.ts:2400 fetchJson<T>` (bản chuẩn) · `battle.ts:301` · `journey.ts:193` · `timeline.ts:111` · `story.ts:135` · `quocgia.ts:280,284,288,292` · `olympia.ts:494` · `game.ts:86` · `quiz.ts:119` | **12** | export `fetchJson` từ `src/util/fetch.ts` |
| **`sourcesHtml(nguon[])` → `<details><summary>📚 Nguồn</summary><ul>`** | `journey.ts:80`, `timeline.ts:32`, `quocgia.ts:142`, `main.ts:2092 list()` | 4 | `src/util/html.ts` |
| **Regex YouTube ID `^[A-Za-z0-9_-]{11}$` + iframe `youtube-nocookie`** | `quocgia.ts:86,91` · `main.ts:2488,2497` | 2 | `src/util/youtube.ts` |
| **Khối cảnh báo `do_tin_cay_toa_do !== "cao"` — 8 dòng HTML y hệt** | `main.ts:1149, 1172, 1188, 1262, 1314, 1374, 1404, 1431` | **8** | 1 helper trong `src/overlays-config.ts` |
| **`toggleOverlay` vs `applyStreets`** — cùng khung: cờ loaded → `setLayoutProperty` / fetch → `addSource` → `addLayer` circle → `addLayer` symbol → bind 3 handler × 2 layer | `main.ts:1745` và `main.ts:1829` | 2 | `applyStreets` nên trở thành một `OverlayConf` đặc biệt hoặc dùng chung hàm `mountPointLayer()` |
| **Tạo nút + panel `<aside>` + nút ×** — 6 module lặp gần y hệt 15 dòng | `olympia.ts:500`, `battle.ts:313`, `journey.ts:161`, `quocgia.ts:301`, `timeline.ts:86`, `main.ts:689` (Nam tiến) | 6 | `src/panels.ts: createPanel(id, label, title)` |
| **`TINH_TEN` (34 tỉnh)** trong `quocgia.ts:66–76` | trùng thông tin với `vn-34-tinh-2025.geojson` + tên file trong `public/data/provinces/` | 1 | Nên sinh từ dữ liệu, không hard-code |
| **Literal fontstack** `["Open Sans Semibold"]` / `["Noto Sans Regular"]` — chuỗi ma thuật, gõ sai 1 ký tự là mất cả lớp (§3) | `main.ts:307, 331, 350, 811, 873` | **5** | `src/map-fonts.ts` — hằng số + union type (**B0b**) |

Ước tính gom hết `src/`: **−330 dòng**, và sửa luôn L1/L7/L9/L10 như hệ quả.

### 5b. `scripts/` (21 file)

| Idiom | Số file | Danh sách |
|---|---|---|
| `const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")` | **15** | add_missing_islands, audit_sovereignty, gen_phap_thuoc_layer, gen_section9, gen_section9_tiers, gen_timeline_events, regeocode, validate_battles, validate_documentaries, validate_figures, validate_journey, validate_literature, validate_media, validate_overlays, validate_provinces |
| `const read = (p) => JSON.parse(readFileSync(p, "utf8"))` | **13** | add_missing_islands, audit_sovereignty, gen_phap_thuoc_layer, gen_timeline_events, merge_islands, + 8 validator |
| Bộ đếm lỗi `errors[]`/`fail()` + `process.exit(1)` | **14** / **11** | mỗi validator tự định nghĩa lại `fail(where, msg)` với format khác nhau |
| `isWiki = /wikipedia\.org|wikimedia\.org/i` | **5** | validate_battles, validate_figures, validate_journey, validate_literature, validate_overlays — **`validate_figures.mjs:22` còn thêm `\bwiki\b`**, tức 5 file có 2 định nghĩa khác nhau cho cùng một quy tắc dự án |
| Chuẩn hoá bỏ dấu `normalize("NFD")` | 3 | `build_street_names.mjs:130` (duyệt từng ký tự), `commons_photos.mjs:71`, `regeocode.mjs:62` — **3 cách viết khác nhau** |
| bbox Việt Nam | **2 giá trị mâu thuẫn** | `validate_overlays.mjs:17` → `102–118 / 7–24` (gồm hải đảo) · `validate_documentaries.mjs:182–183` → `102–110 / 8–24` (loại hải đảo). Một điểm ở Trường Sa hợp lệ với validator này, sai với validator kia |

**Đề xuất `scripts/lib/`** (3 file nhỏ, không thêm dependency):
- `scripts/lib/paths.mjs` → `ROOT`, `P(...)`, `readJson(p)`, `writeJson(p, data)` (luôn `JSON.stringify(…, null, 2) + "\n"` — sửa luôn vấn đề ghi 1 dòng ở §🟢)
- `scripts/lib/report.mjs` → `createReporter()` trả `{ fail, warn, done }` với format thống nhất + `process.exit(errors ? 1 : 0)`
- `scripts/lib/vn.mjs` → **một** `deaccent()`, **một** `slugify()` (phải khớp bit-for-bit với `main.ts:2031`, gồm cả `SLUG_ALIASES`), **một** `VN_BBOX` + `inBbox()` — buộc phải chốt 102–118/7–24 vs 102–110/8–24

⚠️ **Rủi ro cần biết trước**: `slugify` trong `main.ts:2031` dùng `SLUG_ALIASES = { "TP HCM": "thanh-pho-ho-chi-minh" }`. Đã kiểm: **34/34 tên tỉnh trong `vn-34-tinh-2025.geojson` map đúng sang 34 file hồ sơ**; bỏ alias thì "TP HCM" → `tp-hcm` và hỏng cả hồ sơ tỉnh lẫn Nam tiến. Bản dùng chung phải giữ nguyên alias.

---

## 6. CODE CHẾT (chỉ liệt kê — không xoá)

**Xác nhận chết** (đã grep toàn repo gồm `index.html`):

| Mục | Vị trí | Ghi chú |
|---|---|---|
| `export` thừa trên `FIGURES3D` | `figures3d.ts:722` | Được dùng **nội bộ** (dòng 750) nhưng không file nào import → bỏ `export` là đủ, đừng xoá const |
| Cụm UI "🖼️ Mức tư liệu ảnh" | `main.ts:1981–1988` | 3 `<div>` tĩnh ("📷 Có ảnh chân dung" / "📄 Có tư liệu/hồ sơ" / "📍 Vị trí theo nơi cư trú") — **không phải input, không handler, không lọc gì cả**. Là chú giải giả dạng bộ lọc. Người dùng sẽ bấm vào và không có gì xảy ra |
| `OverlayItem.anh_muc` | `main.ts:1115` khai báo | Không nơi nào đọc (grep `anh_muc` chỉ ra 1 kết quả) — có lẽ định dùng cho cụm UI ngay trên |
| `story.ts:23,123` biến `dataUrl` | gán rồi dùng — **không chết** | (kiểm lại: dùng ở 135) |

**Nghi ngờ — cần người quyết, không tự xoá**:

| Mục | Vị trí | Vì sao nghi ngờ |
|---|---|---|
| `public/data/geo/xichquy-vanlang-aulac.draft.geojson` (3,6 kB) | không được `fetch` ở bất kỳ file `.ts` nào | Tên có `.draft.` — có thể là tư liệu đang soạn, cũng có thể là rác từ Phase 2b |
| `interface Landmarks3D` (`landmarks3d.ts:16`), `Model3DHandle` (`models3d.ts:511`), `FigureHandle`, `Figure3DDef`, `Model3DDef`, `ModelGroup`, `SketchfabCc`, `OceanMesh` | export nhưng không file nào import | Đây là **type công khai của module** — giữ là hợp lý về mặt API, không phải rác |
| `PALETTES` khoá `"ruc-ro"`/`"pastel"` mỗi bảng 10 màu | `main.ts:206–207` | 34 tỉnh chia 10 màu theo `["%", ["id"], 10]` → nhiều tỉnh kề nhau trùng màu. Không chết, nhưng không đạt mục đích "tô màu phân biệt tỉnh" |

**CSS: KHÔNG có class chết.** Máy quét ban đầu báo 13 nghi phạm; kiểm tay từng cái thì **toàn bộ đều là dương tính giả**:
- `story-lac`, `story-au` → sinh động bằng `story-${cls}` (`story.ts:64`)
- `qg-badge-state`, `qg-badge-khac` → `qg-badge-${esc(kenh_loai)}` (`quocgia.ts:98`)
- `tl-badge-dung-nuoc` … `tl-badge-hien-dai` (6 cái) → `tl-badge-${esc(e.loai)}` (`timeline.ts:46`)
- `maplibregl-popup-content|tip|close-button` → class của thư viện maplibre

Còn 134/147 class khác đều có tham chiếu literal. **Không đề xuất dọn CSS.**

---

## 7. HIỆU NĂNG BUILD

### Số đo thật (`npm run build`, vite 5.4.21, 2026-07-26)

```
dist/index.html                         2.29 kB │ gzip:   0.96 kB
dist/assets/index-CxJ2Id3Z.css         91.48 kB │ gzip:  14.64 kB
dist/assets/landmarks3d-CvlkfX-7.js     9.83 kB │ gzip:   3.80 kB
dist/assets/models3d-Dxhtp9-f.js       10.00 kB │ gzip:   3.95 kB
dist/assets/figures3d-C54c8kpc.js      11.32 kB │ gzip:   4.13 kB
dist/assets/three.module-DEMruVgS.js  518.13 kB │ gzip: 129.99 kB
dist/assets/index-l1EcM2iR.js         919.41 kB │ gzip: 255.05 kB
✓ 23 modules transformed. ✓ built in 5.59s
(!) Some chunks are larger than 500 kB
```

### three.js: ĐÃ tách rồi — không còn gì để lấy

Đã kiểm bằng grep trên `dist/`:
```
dist/assets/index-l1EcM2iR.js       : 0 lần khớp "THREE.REVISION|WebGLRenderer"
dist/assets/three.module-DEMruVgS.js: 6 lần
```
`three` **chỉ** nằm trong chunk riêng và chỉ được tải khi người dùng bấm 3D / mở mô hình (3 điểm `await import()`: `main.ts:901, 993, 2611`). Câu hỏi trong brief ("three.js chỉ cần khi vào màn 3D?") — **đúng, và đã làm rồi**. Đề xuất tách thêm `three` = 0 kB tiết kiệm.

### maplibre: nằm trong `index.js`, tách được nhưng KHÔNG giảm byte lần đầu

`node_modules/maplibre-gl/dist/maplibre-gl.js` = 784 kB → chiếm phần lớn 919 kB của `index.js`; phần mã dự án còn lại ~110–120 kB.

`maplibre` cần ngay từ lúc paint đầu (bản đồ là toàn bộ trang) nên **không thể lazy-load**. Lợi ích của `manualChunks` ở đây là **cache**, không phải kích thước:

```ts
// vite.config.ts
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: { maplibre: ["maplibre-gl"] },
      },
    },
  },
});
```

- Trước: mỗi lần sửa 1 dòng `main.ts` → khách quay lại phải tải lại **919 kB (255 kB gzip)**.
- Sau: chỉ tải lại chunk app **~120 kB (~35 kB gzip)**; **~800 kB (~220 kB gzip) của maplibre nằm yên trong cache**.
- Lần tải đầu: **0 kB thay đổi** (thậm chí +~200 byte overhead của thêm 1 request). Đừng kỳ vọng gì hơn.
- Phụ: cảnh báo ">500 kB" biến mất.

### Lỗ hổng hiệu năng THẬT lớn hơn build nhiều: dữ liệu nạp lúc khởi động

Đây mới là chỗ đáng làm.

| Nguồn | Kích thước | Khi nào tải | Có cần không? |
|---|---|---|---|
| `vn-34-tinh-2025.geojson` | **1,164 kB** | `map.on("load")` dòng 757 | ✅ era mặc định |
| `vn-63-tinh-truoc-2025.geojson` | **1,186 kB** | `map.on("load")` dòng 757 | ❌ chỉ khi chọn thời kỳ 63 tỉnh |
| `vn-phap-thuoc-1887-1945.geojson` | **1,188 kB** | `map.on("load")` dòng 757 | ❌ chỉ khi chọn thời kỳ Pháp thuộc |
| `vn-34-tinh-2025.geojson` **lần 2** | **1,164 kB** | `initNamTien` dòng 553 — `fetch()` riêng, không phải map source | ❌ chỉ khi mở panel Nam tiến |
| `song-nui.json` | 43 kB | `initSongNui` dòng 265 | ❌ lớp mặc định tắt |
| `co-truong-viet-co.json` | 19 kB | `initCuongVuc` dòng 411 | ⚠️ cần nếu chọn thời kỳ cổ |
| `nam-tien.json` | 9 kB | `initNamTien` dòng 556 | ❌ |

Vòng lặp `main.ts:747–752` thêm **cả 3** era source ngay lúc `load`; MapLibre nạp dữ liệu GeoJSON ngay khi source được thêm, **không đợi layer hiện**. Cộng với lần fetch thứ hai của Nam tiến:

> **~4,77 MB JSON được tải + parse trong khi chỉ 1,16 MB là cần thiết.** Tiết kiệm được **~3,6 MB (≈ −75%)**, tức khoảng **−700 kB sau gzip** — gấp **3 lần** toàn bộ bundle JS gzip hiện tại (255 kB).

Ngoài ra `initNamTien` còn dựng thêm một source `nam-tien` **nhân bản 34 polygon tỉnh** trong bộ nhớ, cho một tính năng nằm sau nút bấm.

**Việc cần làm** (chi tiết ở B13/B14):
1. `map.on("load")` chỉ `addSource` cho `ERAS[currentEra]`; `setEra()` thêm source khi lần đầu chuyển tới era đó. → −2,37 MB
2. `initNamTien()` chuyển thành lazy: nút được tạo ngay, dữ liệu chỉ nạp ở lần mở panel đầu tiên. → −1,17 MB
3. Nếu chưa muốn đụng logic: chỉ cần **gzip/brotli phía host** (Cloudflare Pages bật sẵn) đã đưa 4,77 MB xuống ~950 kB — nhưng chi phí parse JSON trên thiết bị yếu vẫn còn nguyên.

---

## 8. KẾ HOẠCH TÁI CẤU TRÚC

Nguyên tắc: **không viết lại `main.ts`**. Mỗi bước độc lập, tự verify, sắp xếp an toàn nhất trước. `V` = lệnh kiểm chứng.

- `V1` = `npx tsc --noEmit && npm run build` (bắt buộc mọi bước)
- `V2` = `node scripts/validate_overlays.mjs && node scripts/validate_provinces.mjs && node scripts/validate_figures.mjs` (bước nào đụng dữ liệu/slug)
- `V3` = **tự khởi động server rồi thao tác theo kịch bản ở cột "Verify"**.
  ⚠️ **Đã kiểm 2026-07-26: KHÔNG có dev server nào chạy ở cổng 5173** (`netstat` → 0 kết quả). Mọi bước `V3` phải tự chạy `npm run dev` (hoặc `npm run build && npm run preview`) trước, và tự tắt sau. Không bước nào được giả định có sẵn server.
- `V4` = `node --experimental-websocket scripts/smoke.mjs` — smoke test tự động qua CDP (xem **B-1** và §9). Node trong repo là **v20.18.1** (`.nvmrc` = 20) nên **bắt buộc cờ `--experimental-websocket`**; Node ≥ 22 thì bỏ được.

⚠️ **Chặn trước**: `src/main.ts` đang có thay đổi chưa commit của agent khác. **Chốt (commit/stash) trước khi bắt đầu B4 trở đi.**

| # | Bước | File đụng tới | ~Dòng đổi | Rủi ro | Verify |
|---|---|---|---|---|---|
| **B-1** | **Hạ tầng smoke test (làm TRƯỚC mọi bước khác)** — chuyển `cdp.mjs` từ scratchpad vào `scripts/smoke.mjs`, cho nó tự `spawn` `vite preview` + tự tắt; thêm `"smoke": "node --experimental-websocket scripts/smoke.mjs"`. **Kèm 1 dòng hook bắt buộc** trong `main.ts` sau dòng 174: `if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__map = map;` | `scripts/smoke.mjs` mới (+~40 sửa từ bản có sẵn), `main.ts` +1, `package.json` +1 | ~45 | 🟢 thấp — không đụng logic chạy thật | `npm run smoke` phải in `console errors: (khong co)`, `HTTP >=400: (khong co)` và chụp được ảnh |
| **B0** | `manualChunks: { maplibre: ["maplibre-gl"] }` | `vite.config.ts` | +6 | 🟢 rất thấp | `V1` + output phải có `maplibre-*.js` ~800 kB và `index-*.js` ~120 kB |
| **B0b** | **Chốt fontstack bằng type** (dữ kiện mới (a)) — `src/map-fonts.ts`: `export const GLYPHS_URL`, `export type FontStack = readonly ["Open Sans Semibold"] \| readonly ["Noto Sans Regular"]`, `export const FONT_LABEL/FONT_MARKER`. Thay 5 literal `"text-font"` rải rác (`main.ts:307, 331, 350, 811, 873`) bằng hằng số; hàm `symbolLayer()` nhận tham số kiểu `FontStack` | `map-fonts.ts` mới (+18), `main.ts` (~12) | ~30 | 🟢 thấp | `V1` — thử đổi tạm một chỗ thành `["Open Sans Bold"]`, **`tsc` PHẢI báo lỗi**; nếu vẫn xanh thì type chưa chặn được, làm lại. Rồi `V4` |
| **B1** | Tạo `src/util/html.ts` (`esc`, `list`, `sourcesHtml`); xoá 9 bản `esc` local | 10 file | −45 / +20 | 🟢 thấp — `noUnusedLocals` bắt sót ngay | `V1` (tsc fail nếu quên xoá) + `V3`: mở 1 popup lớp phủ, 1 hồ sơ tỉnh |
| **B2** | Sửa **L2** (nút Bỏ qua vào trong `render()`) | `olympia.ts` | ~12 | 🟢 thấp | `V3`: Leo núi → vòng 2 → mở 3 hàng ngang → nút Bỏ qua vẫn còn và bấm được |
| **B3** | Sửa **L8** (`pickSession` giữ ưu tiên due) | `quiz.ts:175` | 1 | 🟢 thấp | `V3`: trả lời sai 3 thẻ → `localStorage.quiz_reviews` sửa `due` về hôm nay → phiên mới phải chứa cả 3 |
| **B4** | Sửa **L4** (`hovered = {source,id}`, xoá trong `setEra`) | `main.ts:199,823-832,1060` | ~14 | 🟢 thấp | `V3`: rê chuột lên 1 tỉnh, kéo thanh trượt sang era khác rồi quay lại — tỉnh đó không được sáng |
| **B5** | Sửa **L5** (áp lại trạng thái cuối `.then` của `initCuongVuc`/`initNamTien`) | `main.ts:~510, ~625` | ~8 | 🟢 thấp | `V3`: DevTools → Slow 3G → reload → kéo slider sang "Văn Lang" ngay → polygon phải hiện khi dữ liệu về |
| **B6** | Sửa **L3** (`overlayInFlight` Set cho `toggleOverlay` + `applyStreets`) | `main.ts:1745,1829` | ~24 | 🟡 vừa — đụng luồng bật/tắt 33 lớp | `V3`: tick/bỏ tick/tick nhanh 3 lần lớp "Di tích quốc gia", console không có lỗi, checkbox khớp bản đồ |
| **B7** | Sửa **L11**, **L12**, thêm `renderer.forceContextLoss()` | `olympia.ts:477`, `game.ts:240`, `models3d.ts:672`, `figures3d.ts:884` | ~8 | 🟢 thấp | `V1` + `V3`: mở/đóng 20 lần mô hình 3D, console không có cảnh báo WebGL |
| **B8** | Tạo `src/util/fetch.ts` (`fetchJson<T>`), thay 12 chỗ hand-roll | 9 file | −60 / +25 | 🟡 vừa — mỗi chỗ có thông báo lỗi tiếng Việt riêng, phải giữ nguyên | `V1` + `V3`: chặn mạng, mở lần lượt 8 panel, mỗi panel phải hiện đúng thông báo lỗi cũ |
| **B9** | Tạo `src/panels.ts` — `registerPanel(id, onHide?)` + `showOnly(id)`; chuyển 5 panel trong `index.html` | `panels.ts` mới, `main.ts`, `game/quiz/story.ts` | +40 / −35 | 🟡 vừa | `V3`: mở lần lượt Thư viện/Game/Quiz/Thiếu nhi — luôn chỉ 1 panel hiện; `document.body.className` không còn `kid-mode` sau khi rời Thiếu nhi (**sửa L9**) |
| **B10** | Chuyển 6 panel do JS tạo sang registry, kèm `onHide` = dispose/clearTimer (**sửa L1, L7, L10**) | `olympia/battle/journey/quocgia/timeline.ts` + Nam tiến trong `main.ts` | −55 / +30 | 🟠 cao — chạm mọi module UI, dễ sót callback | `V3`: (a) Hành trình ↔ Sa đồ 20 lần, `performance.memory` / console không cảnh báo WebGL; (b) Leo núi giữa câu → Sa đồ → quay lại, đồng hồ đã dừng; (c) Dòng thời gian → Thư viện, chỉ 1 panel |
| **B11** | Sửa **L6**: bỏ ring nhỏ khi tính khung nhìn (silhouette + `boundsOfFeature`) | `game.ts:120-131`, `main.ts:959-964` | ~18 | 🟡 vừa — không được xoá polygon khỏi bản vẽ (chủ quyền) | `V3`: ép `hashDate` ra Khánh Hoà (sửa tạm `todayStr`) → hình bóng nhận ra được; bấm "Chỉ xem tỉnh này" cho Khánh Hoà → zoom vào đất liền |
| **B12** | **Tách `src/overlays-config.ts`**: chuyển nguyên khối 15+16+19-data (`OverlayItem`, `OverlayConf`, 3 popup builder, `photoImgBlock/AttrBlock`, `OVERLAYS`, `OVERLAY_GROUPS`) — **di chuyển, không sửa logic** | `main.ts` (−570), `overlays-config.ts` (+575) | 570 (di chuyển) + ~10 (import) | 🟡 vừa — khối lượng lớn nhưng cơ học; không phụ thuộc `map` | `V1` + `V3`: bật thử 5 lớp phủ bất kỳ, popup và màu chấm giống trước. **`git diff --stat` phải cho thấy gần như chỉ là move** |
| **B13** | Gộp 10 cast `as OverlayItem & {…}` + khối cảnh báo `do_tin_cay_toa_do` (8 bản) vào 1 type + 1 helper | `overlays-config.ts`, `src/types/data.ts` mới | −60 / +35 | 🟡 vừa | `V1` + `V3`: popup của lớp có `do_tin_cay_toa_do: "thap"` vẫn hiện cảnh báo ⚠️ |
| **B13b** | **Ranh giới kiểu cho JSON** (dữ kiện mới (b)) — `src/util/fetch.ts`: đổi `fetchJson<T>` thành `fetchJson<T>(path, parse: (raw: unknown) => T)`; thêm `src/types/parse.ts` với `str()`, `numStr()`, `arr()`. Mọi trường vào HTML đi qua `str()` → trả `string`, nên **quên `esc()` sẽ không còn là lỗ số**; và `esc(s: string)` từ chối `number` lúc biên dịch | `util/fetch.ts`, `types/parse.ts` mới, 9 nơi gọi | −20 / +70 | 🟠 cao — chạm mọi đường nạp dữ liệu | `V1` + `V4`; thêm `str()` cho 1 trường rồi sửa JSON thành số → phải thấy cảnh báo runtime, không phải HTML hỏng |
| **B14** | **Lazy Nam tiến** — không nạp 1,16 MB lúc khởi động | `main.ts:555-635, 670` | ~20 | 🟡 vừa — phải nối với B5 | `V3`: DevTools Network, reload → **không** có request `vn-34-tinh-2025.geojson` lần 2; bấm 🧭 Nam tiến → mới có, animation chạy đúng |
| **B15** | **Lazy 2 era còn lại** — chỉ `addSource` era đang hiện | `main.ts:747-752, 1060` | ~30 | 🟠 cao — đụng focus filter, `applyColorMode`, `applyLabels`, `landmarks3d` (`beforeId: "era-phapthuoc-fill"`) | `V3`: Network reload chỉ có 1 file boundary; đổi qua đủ 13 thời kỳ, mỗi lần ranh giới + nhãn + màu + 3D đều đúng; bấm 3D ở era Pháp thuộc phải thấy lớp biển |
| **B16** | **Tách `src/namtien.ts`** (khối 8) | `main.ts` (−212), `namtien.ts` (+220) | 212 (di chuyển) | 🟡 vừa | `V1` + `V3`: panel Nam tiến chạy đủ 12 mốc, ▶/⏸/◀ đúng |
| **B17** | **Tách `src/library.ts`** (khối 21+22+23: thư viện văn thơ, ảnh, niên hiệu, `openLibrary`) | `main.ts` (−420), `library.ts` (+430) | 420 (di chuyển) | 🟡 vừa — `mediaImgHtml`/`figureCardHtml` còn được `showProvincePanel` dùng → phải export | `V1` + `V3`: mở Thư viện, tra niên hiệu năm 1010 và năm −200, xem 1 bài thơ có `ban_dich` |
| **B18** | **Tách `src/province-panel.ts`** (khối 20 + phần 3D nhân vật) | `main.ts` (−300), file mới (+310) | 300 (di chuyển) | 🟠 cao — phụ thuộc `focusMode`, `enterFocus`, `activeModel3DDispose`, `disposeFigures` (trạng thái chung với khối 11,12) → phải truyền vào hoặc export từ `main` | `V1` + `V3`: bấm 3 tỉnh khác nhau + 1 quần đảo; thử focus/bỏ focus; mở mô hình 3D rồi đổi tỉnh (không rò context) |
| **B19** | `scripts/lib/{paths,report,vn}.mjs` + chuyển 9 validator sang dùng | 12 file `scripts/` | −180 / +90 | 🟡 vừa — **phải chốt bbox 102–118/7–24 vs 102–110/8–24 và giữ `SLUG_ALIASES`** | `V2` + chạy cả 9 validator, output phải **giống hệt** trước khi đổi (`node … > before.txt`, so `diff`) |
| **B20** | Bật `noUncheckedIndexedAccess` | `tsconfig.json` + fallout | ~50 | 🟠 cao | `V1`; **chỉ làm SAU B12/B16/B17/B18**, khi file đã nhỏ và lỗi dễ đọc |

**Sau B12+B16+B17+B18: `main.ts` từ 2746 → ~1120 dòng.**

Gợi ý gom thành sprint:
- **Sprint 0 (hạ tầng, làm trước tiên)**: B-1, B0, B0b. ~80 dòng. Có smoke test rồi thì 17 bước sau mới verify được rẻ.
- **Sprint 1 (rẻ, sửa lỗi thật)**: B1 → B7. Tổng ~85 dòng, sửa L2, L3, L4, L5, L8, L11, L12.
- **Sprint 2 (kiến trúc panel)**: B8 → B11. Sửa L1, L6, L7, L9, L10 — đây là nhóm rủi ro cao nhất, nên làm liền mạch một phiên.
- **Sprint 3 (thu nhỏ main.ts)**: B12 → B18 (B13b nên đi liền sau B8). Chủ yếu là di chuyển; nên commit **từng bước một** để `git bisect` dùng được.
- **Sprint 4 (dọn hạ tầng)**: B19, B20.

---

## 9. ĐỀ XUẤT TEST

**Hiện trạng**: 0 test runner. "Test" = 9 validator `.mjs` chạy trong `.github/workflows` + `npm run build`. Toàn bộ logic UI không có gì bảo vệ — và §2 cho thấy 12 lỗi thật đã lọt qua.

### Có nên thêm Vitest? — **Có, nhưng phạm vi hẹp, và làm SAU B1/B8**

Lý do "sau": testing 9 bản sao `esc()` là vô nghĩa; phải có `src/util/*` trước.

**Chi phí**: `npm i -D vitest` (~5 MB, không cần jsdom nếu chỉ test hàm thuần), thêm `"test": "vitest run"`, **~130 dòng test**. Không đụng vite config (vitest đọc `vite.config.ts` sẵn).

**Chỉ test hàm thuần đã tồn tại** (10 hàm, đều là logic thật, đều đã từng hoặc đang sai):

| Hàm | Vị trí | Ca cần chốt |
|---|---|---|
| `slugify` | `main.ts:2031` | `"TP HCM"` → `thanh-pho-ho-chi-minh` (alias!) · `"Thừa Thiên Huế"` · `"Đắk Lắk"` → `dak-lak` · **test bảo vệ: toàn bộ 34 tên trong `vn-34-tinh-2025.geojson` phải map ra 34 file trong `public/data/provinces/`** — chính test này chặn được hồi quy khi B19 gom `slugify` dùng chung |
| `esc` | sau B1 | 5 ký tự + chuỗi rỗng + chuỗi tiếng Việt có dấu |
| `num` | `main.ts:2151` | `"9888,91"` → `"9.888,91"` · `undefined` → `"—"` · **`"1,234,56"` → hiện trả `"NaN"`, chốt hành vi mong muốn** |
| `pickSession` | `quiz.ts:170` | thẻ due phải nằm đầu — **test này đã bắt được L8** |
| `applyAnswer` (SM-2) | `quiz.ts:91` | đúng 3 lần: interval 1→3→~8; sai: reset về 1, `ef` không dưới 1,3 |
| `haversineKm`, `bearingArrow` | `game.ts:65,76` | Hà Nội→TP HCM ≈ 1150 km; hướng phải là ⬇️ |
| `hashDate` | `game.ts:56` | tất định: cùng chuỗi → cùng số; 365 ngày liên tiếp phải phủ ≥ 25/34 tỉnh (chống lệch phân phối) |
| `normalize` | `olympia.ts:311` | `"  Bạch   Đằng "` → `"bạch đằng"` |
| `silhouetteSvg` bbox | `game.ts:120` | sau B11: Khánh Hoà `blowup ≤ 1.2×` — **chốt L6 không tái phát** |

**Không đề xuất**: jsdom hay Playwright. jsdom không có WebGL nên vô dụng với MapLibre; Playwright thì tải ~300 MB browser — trong khi dữ kiện (c) cho thấy có đường rẻ hơn nhiều, xem ngay dưới.

### Smoke test qua CDP — RẺ HƠN và bắt được lớp lỗi mà Vitest KHÔNG với tới

Đã đọc `scratchpad/cdp.mjs` do `song-nui-fix` để lại. Đánh giá: **đây đúng là nền tảng rẻ nhất, nên làm TRƯỚC Vitest.**

Vì sao nó hợp:
- **0 dependency.** Dùng `WebSocket` built-in của Node + `fetch` + `child_process.spawn`. Không `npm i` gì cả.
- **Có WebGL thật**: `--enable-unsafe-swiftshader --use-angle=swiftshader` → MapLibre render được trong headless, chạy được cả trên CI runner không GPU.
- Đã thu sẵn đúng 3 tín hiệu cần: `Log.entryAdded` + `Runtime.consoleAPICalled` (error/warning), `Network.responseReceived` status ≥ 400, và `Page.captureScreenshot`.
- Probe chạy JS thật trong trang: `m.getLayer(id)`, `m.getLayoutProperty(id,'visibility')`, `m.queryRenderedFeatures({layers:[id]}).length` — tức **kiểm được lớp có VẼ RA THẬT không**, chứ không chỉ "hàm có được gọi không".

**Đúng lớp lỗi này chặn được** — và Vitest thì không:
- **Dữ kiện (a)** (fontstack 404 → mất cả lớp): `netFail` bắt ngay `404 …/font/Open Sans Bold/0-255.pbf`, và `rendered: 0` tố cáo lớp biến mất. Một hàm thuần không bao giờ thấy được điều này.
- **L1/L5/L7** (rò WebGL, layer thêm sau khi fetch xong, panel chồng nhau): đều là hành vi runtime nhiều bước.
- **L3** (`addSource` ném lỗi khi tick nhanh): `consoleErrs` bắt được.

**3 việc phải làm để dùng được** (đã kiểm, không phải phỏng đoán):
1. ⚠️ **`window.map` KHÔNG tồn tại.** `main.ts:143` khai báo `const map` ở scope module, không gắn lên `window`; grep `window.map|globalThis` trên toàn `src/` → **0 kết quả**. Probe hiện tại sẽ trả `{ fatal: "window.map khong ton tai" }`. Cần **đúng 1 dòng** trong `main.ts`, chỉ ở DEV nên không lộ ra bản production:
   ```ts
   if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__map = map;
   ```
2. **Script phải tự dựng server.** Không có gì chạy ở 5173 (đã kiểm) và `cdp.mjs` mặc định trỏ `localhost:5199`. Cho `smoke.mjs` tự `spawn("npm", ["run","preview"])`, đợi cổng mở, chạy xong thì `kill`.
3. **Node 20 cần cờ.** `.nvmrc` = 20, local `v20.18.1` → `node --experimental-websocket scripts/smoke.mjs`. Header của `cdp.mjs` đã ghi đúng điều này.

**Bộ smoke đề xuất (~6 kịch bản, mỗi cái 10–20 dòng probe)** — chạy tuần tự trong 1 lần mở Chrome:

| # | Kịch bản | Khẳng định |
|---|---|---|
| S1 | Tải trang, đợi `map.once('idle')` | 0 console error · 0 HTTP ≥ 400 · **đặc biệt 0 request `…/font/…` lỗi** (chốt dữ kiện (a)) |
| S2 | Tick lần lượt 33 checkbox lớp phủ | mỗi lớp `queryRenderedFeatures().length > 0` · không lớp nào 404 · 0 console error (chốt **L3** + kiểm tra #1/#3 ở dưới) |
| S3 | Duyệt hết 13 thời kỳ trên slider | mỗi thời kỳ có ≥ 1 layer visible; thời kỳ `cuongvuc` phải có polygon (chốt **L5**) |
| S4 | Rê chuột 1 tỉnh → đổi era → quay lại | không feature nào còn `hover: true` (chốt **L4**) |
| S5 | Mở/đóng Hành trình ↔ Sa đồ 20 vòng | đếm `WebGLRenderingContext` còn sống; 0 cảnh báo "Too many active WebGL contexts" (chốt **L1**) |
| S6 | Mở lần lượt 11 panel | luôn đúng 1 panel `!hidden`; `document.body.className` không còn `kid-mode` (chốt **L9, L10**) |

Chi phí: **~180 dòng `scripts/smoke.mjs`**, 0 dependency, chạy ~40 s. Thêm 1 step vào `.github/workflows` sau `npm run build`.

### Kết luận thứ tự ưu tiên (đã sửa theo dữ kiện (c))

1. **`scripts/smoke.mjs` (B-1) — làm trước hết.** Rẻ nhất, chặn đúng những lỗi mà repo này thực sự mắc phải (10/12 lỗi ở §2 là hành vi runtime, không phải hàm thuần).
2. **4 kiểm tra validator** ở trên — vẫn rẻ, chặn "thêm dữ liệu lệch mã".
3. **Vitest — cuối cùng, và chỉ khi đã có `src/util/*`.** Nó chỉ với tới 2/12 lỗi (**L8** `pickSession`, **L6** bbox silhouette). Có giá trị thật khi refactor `slugify`/`esc` ở B1/B19, nhưng **không** phải thứ đáng làm đầu tiên.

### Thêm 4 kiểm tra vào validator `.mjs` (rẻ hơn test, chặn đúng lớp lỗi của dự án này)

Đây là các ràng buộc **giữa mã và dữ liệu** mà unit test không với tới. Thêm vào `scripts/validate_overlays.mjs` (đọc `src/main.ts` bằng regex, giống cách `validate_figures.mjs:35` đã làm với `src/figures3d.ts`):

1. **Mọi `OVERLAYS[].file` phải tồn tại và parse được.** Hiện validator chỉ quét thư mục `public/data/overlays/`, không đối chiếu với danh sách trong mã → gõ sai một đường dẫn thì CI xanh, người dùng tick checkbox và không có gì xảy ra (đúng nhánh `fetchJson → null` ở `main.ts:1749`, im lặng bỏ tick).
2. **Mọi id trong `OVERLAY_GROUPS` phải có trong `OVERLAYS`.** `buildLayerControl:1971` lọc câm (`g.ids.filter(id => OVERLAYS.some(...))`) — gõ sai id thì lớp đó lặng lẽ rơi vào "Khác" hoặc biến mất.
3. **Số lớp phủ trong mã = số file trong thư mục.** Hôm nay khớp: **33 = 33**. Một file mới thêm vào `public/data/overlays/` mà quên khai báo trong `OVERLAYS` sẽ không bao giờ lên bản đồ.
4. **`OverlayItem` bắt buộc**: `ten` là string, `lon`/`lat` là số hữu hạn trong bbox — validator đã có; bổ sung **`ten` không rỗng** và **cảnh báo khi `anh` không bắt đầu bằng `https://`** (khớp với cổng chặn ở `main.ts:1132`, hiện chỉ chặn ở runtime — ảnh sai schema sẽ im lặng biến mất khỏi popup).

Thêm 1 kiểm tra vào `validate_provinces.mjs` nếu chưa có: **8 khoá bắt buộc của `ProvinceProfile`** (`ten, trang_thai, giai_nghia_ten, tong_quan, ten_thoi_ky[], lich_su, danh_nhan[], sources`) — đây chính là hợp đồng mà `profileHtml()` giả định, và là mìn ở §3. Hiện 34/34 file đều đạt (đã kiểm tay).

**Thứ tự khuyến nghị**: 4 kiểm tra validator trước (rẻ, 0 dependency, chặn ngay lớp lỗi phổ biến nhất của repo này là "thêm dữ liệu mới lệch mã"), Vitest sau B1/B8.
