> ⚠️ **GIỚI HẠN ĐÁNH GIÁ**: Chrome extension (`claude-in-chrome`) báo "Browser extension is not connected" khi gọi `tabs_context_mcp`. Theo quy tắc escalation, không thử lại nhiều lần — chuyển hẳn sang đánh giá dựa trên đọc code. **Toàn bộ báo cáo dưới đây dựa trên đọc `index.html`, `src/main.ts` (2736 dòng), `src/style.css` (1637 dòng), `src/olympia.ts/battle.ts/journey.ts/quocgia.ts/timeline.ts/game.ts/quiz.ts/story.ts`, và output `dist/` đã build sẵn — CHƯA xem giao diện thật chạy trong trình duyệt.** Mọi phát hiện đều neo vào `file:line` cụ thể; những chỗ cần xác nhận thị giác (wrap dòng, độ cao topbar thực tế, tile bản đồ) được đánh dấu rõ "cần xem trực tiếp".

---

## 1. ẤN TƯỢNG ĐẦU (suy luận từ code, chưa xem màn hình thật)

Người dùng mở trang thấy: topbar đỏ-vàng sơn mài với tiêu đề song ngữ Việt + emoji cờ, và **11 nút** xếp ngang trong `#topbar-nav` (`index.html:19-22` + 6 nút được `game.ts`/`olympia.ts`/`battle.ts`/`journey.ts`/`quocgia.ts`/`timeline.ts` tự chèn thêm lúc chạy — xem §2, mục 🔴 #1). Bên dưới là bản đồ toàn màn hình, panel "🗺️ Lớp bản đồ" nổi góc trái luôn hiện sẵn (không có nút ẩn/hiện), thanh dòng thời gian ở đáy. Trong 10 giây đầu, người dùng thấy được: đây là bản đồ Việt Nam có thể chọn thời kỳ lịch sử và bật/tắt các lớp dữ liệu — nhưng KHÔNG có ô tìm kiếm nào để tìm một địa danh/nhân vật cụ thể trong 1921 điểm, và mật độ nút ở topbar + panel lớp phủ luôn-mở có nguy cơ gây ngợp ngay từ giây đầu.

---

## 2. PHÁT HIỆN

### 🔴 #1 — Topbar phình tới 11 nút, không phân cấp, không xem trước
- **Nơi xảy ra**: `index.html:19-22` (5 nút tĩnh: 3D, Thiếu nhi, Đoán Tỉnh Xưa, Ôn tập, Thư viện) + 6 nút được chèn động vào cùng `#topbar-nav` lúc runtime: `namtien-btn` (`main.ts:681-682`), `quocgia-btn` "🇻🇳 Việt Nam trong tôi" (`quocgia.ts:302-308`), `timeline-btn` "🕰️ Dòng thời gian" (`timeline.ts:86-92`), `battle-btn` "⚔️ Sa đồ chiến dịch" (`battle.ts:313-318`), `journey-btn` "🏛️ Hành trình lịch sử" (`journey.ts:162-168`), `olympia-btn` "🏔️ Leo núi" (`olympia.ts:501-508`).
- **Vì sao là vấn đề**: 11 pill-button cùng cấp, không nhóm, không icon-only/overflow menu. CSS chỉ có `flex-wrap: wrap` (`style.css:61`) — không có breakpoint xử lý riêng. Comment trong chính CSS (`style.css:2-4`) đã thừa nhận topbar từng "xuống 2 hàng" gây bug che nút, nhưng thiết kế hiện tại có thể cần 3-4 hàng ở màn hình hẹp, không chỉ 2 như comment giả định.
- **Cách sửa cụ thể**: Gom 11 nút vào 2-3 cụm có ý nghĩa (VD: "Khám phá" = 3D/Nam tiến/Dòng thời gian, "Trò chơi" = Đoán tỉnh/Ôn tập/Leo núi, "Đọc thêm" = Thư viện/Thiếu nhi/Sa đồ/Hành trình/Việt Nam trong tôi) hiển thị qua 1 dropdown/menu mỗi cụm thay vì nút rời. Hoặc: giữ 3-4 nút chính, dồn phần còn lại vào 1 nút "☰ Thêm" mở menu dọc.
- **Công sức**: M (đổi cấu trúc DOM topbar + CSS dropdown, không đụng logic từng tính năng).

### 🔴 #2 — `#layer-control` đè lên `NavigationControl` của MapLibre ở góc trái-trên
- **Nơi xảy ra**: `map.addControl(new maplibregl.NavigationControl(), "top-left")` (`main.ts:176`) đặt nút zoom +/− và la bàn ở góc trên-trái của `#map` (mặc định cách mép ~10px). `#layer-control` được tạo bởi `buildLayerControl()` và gắn vào `#app` (`main.ts:2011: document.getElementById("app")?.appendChild(el)`), với CSS `position: absolute; top: var(--panel-top); left: 0.75rem` (`style.css:160-162`) — `--panel-top` ≈ `topbar-h (3.5rem=56px) + 0.75rem(12px)` ≈ 68px, còn `#map` bắt đầu ngay dưới topbar nên NavigationControl nằm ở khoảng y≈66px. Hai control gần như trùng toạ độ góc trái-trên, và panel không có cơ chế ẩn/hiện (luôn render từ `buildLayerControl()` gọi trong `map.on("load")`, không có toggle nào trong code) — nghĩa là **mỗi lần tải trang, panel lớp bản đồ luôn che nút zoom/la bàn**.
- **Vì sao là vấn đề**: Người dùng không bấm được zoom +/− hoặc xoay la bàn vì bị panel kính-mờ đè lên; đây là core interaction của một app bản đồ.
- **Cách sửa cụ thể**: Dời `NavigationControl` sang `"top-right"` hoặc `"bottom-right"` (đổi tham số ở `main.ts:176`, 1 dòng), hoặc thêm padding-left cho control bằng CSS để tránh vùng `#layer-control` chiếm. Cần xác nhận lại bằng mắt sau khi sửa vì đây là suy luận toạ độ từ code, không phải đo trực tiếp.
- **Công sức**: S.

### 🟠 #3 — Không có ô tìm kiếm cho 1921 điểm / 33 lớp
- Xem chi tiết ở §3 (MẬT ĐỘ THÔNG TIN). Xác nhận từ code: `main.ts` không có bất kỳ input tìm kiếm text nào (grep `search|tìm kiếm` chỉ ra các biến thể của MapLibre style `filter` — lọc theo thời kỳ/nam-tien-step, không phải lọc theo từ khoá người dùng nhập).
- **Công sức**: M-L (tuỳ độ phức tạp).

### 🟠 #4 — Không bật `cluster: true` cho bất kỳ nguồn GeoJSON điểm nào
- **Nơi xảy ra**: mọi `map.addSource(layerId, { type: "geojson", ... })` cho lớp phủ (`main.ts:1758-1768`, `main.ts:1856-1859`) không có tham số `cluster`. Với 33 lớp × trung bình ~58 điểm/lớp (1921 tổng), khi bật nhiều lớp cùng lúc ở mức zoom thấp, các marker chồng lên nhau dày đặc, bán kính chấm chỉ 5px (`main.ts:1776`) hoặc 3.5px (`main.ts:1865`).
- **Vì sao là vấn đề**: Người dùng bật 2-3 lớp cùng lúc (điều panel cho phép tự do, không giới hạn số lớp bật) → bản đồ ở mức zoom quốc gia sẽ là một đám chấm chồng khít, không phân biệt được, và chấm 5px là mục tiêu chạm cực nhỏ trên di động (xem §5).
- **Cách sửa cụ thể**: Bật `cluster: true, clusterRadius: 40-50` cho các nguồn có >30 điểm, thêm layer `circle` hiển thị số lượng cụm (pattern chuẩn của MapLibre "Cluster" example), tách hiển thị điểm lẻ khi zoom > ngưỡng.
- **Công sức**: M mỗi lớp cần cluster (áp dụng lặp lại theo pattern, nhưng phải test lại tương tác click/popup vì click vào cluster khác click vào điểm — `bindOverlayInteractions` ở `main.ts:1715` cần nhánh xử lý cluster).

### 🟠 #5 — Bundle JS ban đầu nặng dù phần lớn tính năng phụ ít dùng
- **Đo được**: `dist/assets/index-*.js` = 908 KB (brief ghi 919 kB/gzip 255 kB), tách riêng đã có `three.module-*.js` 508 KB (đã lazy — xem điểm tốt bên dưới).
- **Nguyên nhân trong `index.js`**: `main.ts:9-16` import tĩnh (không phải `import()`) toàn bộ `game.ts` (353 dòng), `quiz.ts` (285), `story.ts` (155), `olympia.ts` (550), `battle.ts` (332), `journey.ts` (211), `quocgia.ts` (340), `timeline.ts` (125) = **2351 dòng** logic tính năng phụ luôn nằm trong bundle chính, dù người dùng có thể chỉ xem bản đồ mà không mở trò chơi/Olympia/sa đồ nào.
- **Điểm tốt cần ghi nhận**: `three.js` (models3d/landmarks3d/figures3d) ĐÃ được code-split đúng cách qua `await import("./landmarks3d")` (`main.ts:891`), `await import("./models3d")` (`main.ts:983`), `await import("./figures3d")` (`main.ts:2595`) — chỉ tải khi bật 3D/xem mô hình. Không cần sửa phần này.
- **Cách sửa cụ thể**: Đổi `import { initGame } from "./game"` v.v. (`main.ts:9-16`) + lệnh gọi `initGame()`... thành `document.getElementById("game-btn")?.addEventListener("click", async () => { const { initGame } = await import("./game"); initGame(); })`, tương tự cho quiz/story/olympia/battle/journey/quocgia/timeline. Timeline có thể cần giữ eager nếu hiển thị ngay trên trang chủ — kiểm tra trước khi tách.
- **Công sức**: M (8 module, mỗi cái đổi cách gọi init + xử lý "gọi lần đầu vs lần sau").

### 🟡 #6 — Không có phím Escape để đóng panel đang mở
- **Nơi xảy ra**: Toàn bộ `src/*.ts` chỉ có 1 listener `keydown` duy nhất (`main.ts:2680`, cho input năm ở công cụ niên hiệu) — không có `Escape` handler nào cho 11 panel nổi (`#province-panel`, `#library-panel`, `#game-panel`, `#quiz-panel`, `#story-panel`, `#olympia-panel`, `#battle-panel`, `#journey-panel`, `#quocgia-panel`, `#timeline-panel`, `#namtien-panel`).
- **Vì sao là vấn đề**: Người dùng dùng bàn phím phải rê chuột/Tab tới đúng nút × để đóng, vi phạm kỳ vọng chuẩn (Esc đóng dialog) và WCAG 2.1.2 (No Keyboard Trap tuy không hẳn trap, nhưng thiếu lối thoát nhanh).
- **Cách sửa cụ thể**: Thêm 1 listener chung `document.addEventListener("keydown", e => { if (e.key === "Escape") closeAllOpenPanels(); })` gọi hàm đóng panel đang `hidden=false`/hiển thị.
- **Công sức**: S.

### 🟡 #7 — `period-label` không có `aria-live`, thay đổi thời kỳ không được đọc cho screen reader
- **Nơi xảy ra**: `index.html:29` `<span id="period-label">Đang tải dữ liệu…</span>`, được cập nhật động khi kéo slider `#timeline` (thanh dòng thời gian, `index.html:27-28`) nhưng không có `aria-live="polite"`.
- **Vì sao là vấn đề**: Người dùng screen reader kéo thanh trượt 13 thời kỳ sẽ không nghe được tên thời kỳ vừa chuyển sang.
- **Cách sửa cụ thể**: Thêm `aria-live="polite"` vào span này trong `index.html:29`.
- **Công sức**: S (1 dòng).

### 🟡 #8 — Chấm marker 5px/3.5px là mục tiêu chạm quá nhỏ trên di động
- **Nơi xảy ra**: `"circle-radius": 5` (`main.ts:1776`, halo cho hầu hết lớp phủ, đường kính thực 10px), `"circle-radius": 3.5` (`main.ts:1865`, lớp tên đường danh nhân, đường kính 7px), `"circle-radius": 7` (`main.ts:452`, ranh giới cương vực cổ).
- **Vì sao là vấn đề**: WCAG 2.5.8 khuyến nghị vùng chạm tối thiểu 24×24px (AA), lý tưởng 44×44px. 7-10px là quá nhỏ để chạm chính xác trên màn hình điện thoại, đặc biệt khi nhiều điểm chồng nhau (liên quan #4).
- **Cách sửa cụ thể**: Không cần phóng to hình tròn hiển thị (sẽ rối hình ảnh), nhưng có thể thêm 1 layer `circle` trong suốt bán kính lớn hơn (~12-14px) chỉ để mở rộng vùng bắt sự kiện `click`/`touchstart`, giữ nguyên layer hiển thị nhỏ.
- **Công sức**: S-M.

### 🟡 #9 — Panel lớp phủ dài (33 lớp, nhóm accordion lồng) không có cách "tắt hết"/"bật nhóm vừa xem"
- **Nơi xảy ra**: `buildLayerControl()` (`main.ts:1927-1996`), mỗi lớp là 1 checkbox riêng trong accordion `<details class="lc-group">`, không có nút "Tắt tất cả lớp phủ" hay "chỉ bật nhóm này".
- **Vì sao là vấn đề**: Người xem sau khi bật thử nhiều lớp để so sánh sẽ khó dọn lại về trạng thái sạch; phải tick từng ô.
- **Cách sửa cụ thể**: Thêm 1 nút nhỏ cạnh badge `${OVERLAYS.length}` (`main.ts:1957`) gọi hàm tắt hết checkbox `name=overlay` + `toggleOverlay(id,false)` cho từng lớp đang bật.
- **Công sức**: S.

---

## 3. MẬT ĐỘ THÔNG TIN (1921 điểm / 33 lớp / 13 thời kỳ / 34 tỉnh / 7 thư viện / 121 phim / 74 ảnh)

Cơ chế tìm một thứ cụ thể hiện tại, dựa trên code:
1. **Duyệt thủ công qua panel lớp phủ** — mở accordion nhóm chủ đề (5 nhóm: `OVERLAY_GROUPS`, `main.ts:~1915-1925`), tick từng lớp, rồi bấm từng chấm trên bản đồ để xem popup. Không có cách nào để gõ tên và nhảy thẳng tới.
2. **Slider thời kỳ** (`#timeline`, `index.html:27-28`) chỉ lọc theo trục thời gian, không lọc theo loại nội dung hay tên.
3. **Hub "🇻🇳 Việt Nam trong tôi"** (`quocgia.ts`) có `<select>` chọn tỉnh/nhân vật (`qg-select-label select`, `style.css:1139`) — đây là dropdown, hoạt động cho *một tập dữ liệu* (danh nhân/phim) nhưng không phải tìm kiếm toàn cục qua cả 33 lớp.
4. **Bản đồ dòng thời gian riêng** (`timeline.ts`) có bộ lọc dạng pill theo loại sự kiện (`tl-filter`, `style.css:1239`) — cũng chỉ trong phạm vi module đó, không liên kết với lớp phủ trên bản đồ chính.

→ **Không có 1 điểm tìm kiếm hợp nhất** cho toàn bộ 1921 điểm. Đây là khoảng trống lớn nhất của sản phẩm ở quy mô này.

**Đề xuất cơ chế (ưu tiên impact/effort)**:
- **(a) Ô tìm kiếm nổi trên bản đồ** (kiểu thanh search MapLibre thường thấy góc trên): gõ tên địa danh/nhân vật → fetch song song toàn bộ `data.items` đã tải (hoặc build 1 index tổng hợp lúc build-time từ 33 file JSON) → autocomplete danh sách kết quả → click để bay tới toạ độ + tự bật lớp chứa điểm đó + mở popup. Công sức L nhưng impact cao nhất, giải quyết luôn nỗi lo "1921 điểm không tìm được gì cụ thể".
- **(b) Cluster hoá bản đồ** (đã nêu #4) giảm rối mắt khi bật nhiều lớp cùng lúc — tiền đề để search (a) hoạt động mượt (bay tới điểm giữa cụm dày sẽ dễ nhìn hơn nếu có cluster).
- **(c) Bộ đếm "đang bật N/33 lớp, hiện M điểm"** nhỏ trong layer-control, giúp người dùng ý thức được họ đang xem bao nhiêu, tránh bật tràn lan không kiểm soát — effort S, có thể làm ngay không chờ (a).
- **(d) "Lớp phủ gợi ý theo thời kỳ đang chọn"**: khi trượt sang 1 thời kỳ, tự đề xuất (không tự bật) 2-3 lớp liên quan nhất (VD thời Nguyễn → gợi ý "dinh thự cổ", "danh hiệu cổ") thay vì để 33 lớp bình đẳng mọi lúc.

---

## 4. MOBILE

⚠️ Không mở được trình duyệt (extension chưa kết nối) nên **không đo được** ở 390×844 / 360×800 thực tế. Dưới đây là rủi ro suy ra từ code, cần người xác nhận lại bằng mắt:

- **Topbar 11 nút** (#1 ở trên) nhiều khả năng tràn 3+ hàng ở 360px, đẩy bản đồ xuống thấp đáng kể trước khi người dùng cuộn/tương tác gì — CSS không có media query riêng cho topbar ở màn hẹp (`style.css` toàn file chỉ có 2 `@media`, dòng 926 và 1623, không cái nào nhắm topbar).
- **`#layer-control` rộng `min(280px, 80vw)`** (`style.css:163`) ở 360px = 288px, chiếm ~80% chiều ngang màn hình — cộng với việc panel luôn mở sẵn (không toggle), trên điện thoại gần như che nửa bản đồ ngay khi vào trang.
- **`#namtien-panel` neo trái `min(340px, 88vw)`** (`style.css:1277`) ở 360px ≈ 317px — cũng chiếm gần hết bề ngang, và đồng thời `#layer-control` bị ẩn khi Nam Tiến mở (theo comment `style.css:1271-1272`) nên ít nhất không chồng 2 panel — điểm này ổn.
- **`#quocgia-panel` rộng `min(940px, 96vw)`** (`style.css:1077`) dùng `qg-grid` với `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` (`style.css:1149`) — ở 360px mỗi thẻ card chỉ còn 1 cột (~350px), có khả năng ổn, nhưng cần xem trực tiếp vì thẻ card có `.qg-embed` iframe 16:9 (YouTube) có thể đẩy chiều cao card lớn, cuộn dài.
- **Chưa xác nhận được**: chữ tiếng Việt có dấu có bị vỡ dòng xấu (mất dấu, cắt giữa từ) ở nút nav hay `select` trong quocgia hub hay không — cần xem bằng mắt.

---

## 5. ACCESSIBILITY

- ✅ **Focus ring rõ ràng**: `:focus-visible { outline: 2px solid var(--c-gold-500) }` (`style.css:1540-1544`) áp dụng toàn cục — tốt, không cần sửa.
- ✅ **`prefers-reduced-motion` được tôn trọng** (`style.css:1623-1636`) — tắt animation/transition cho người nhạy chuyển động.
- ✅ **Nút đóng panel đều có `aria-label="Đóng"`**: xác nhận ở cả HTML tĩnh (`index.html:32,36,40,44,48`) lẫn panel dựng động (`main.ts:690`, `olympia.ts:514`, `battle.ts:324`, `journey.ts:174`, `quocgia.ts:315`, `timeline.ts:99`) — nhất quán, không cần sửa.
- 🟡 **Thiếu Escape để đóng** — đã nêu #6.
- 🟡 **`period-label` thiếu `aria-live`** — đã nêu #7.
- 🟡 **Vùng chạm marker bản đồ 7-10px** — đã nêu #8, dưới ngưỡng WCAG 2.5.8 (24px) lẫn khuyến nghị chung (44px).
- 🟡 **Checkbox/radio trong layer-control không có `aria-describedby`** trỏ tới ghi chú cảnh báo (`lc-note`, `main.ts:1953`: "Cương vực cổ là phỏng dựng xấp xỉ...") — người dùng screen reader tick vào radio thời kỳ sẽ không nghe được cảnh báo độ chính xác ngay cạnh đó.
- ⚠️ **Chưa kiểm được** (cần trình duyệt thật): độ tương phản đo bằng công cụ (axe/Lighthouse), thao tác bàn phím thuần tuý trên bản thân bản đồ MapLibre (pan bằng phím mũi tên là hành vi mặc định của MapLibre nên nhiều khả năng ổn, nhưng chưa xác nhận `Tab` có nhảy được vào các marker/point layer hay không — về bản chất canvas WebGL của MapLibre, các điểm KHÔNG phải DOM element nên **không thể Tab tới từng marker bằng bàn phím** — đây là hạn chế cố hữu của kiến trúc canvas-render, không phải bug có thể sửa nhanh, cần cân nhắc thêm 1 "danh sách dạng bảng" thay thế cho người dùng bàn phím/screen reader nếu muốn đạt AA đầy đủ).

---

## 6. HIỆU NĂNG CẢM NHẬN

- **Đã đo**: `index.js` ~919 kB (gzip 255 kB) + `three.module.js` 518 kB (gzip 130 kB) tải riêng khi vào 3D. Trên mạng 3G Việt Nam (~750 kbps thực tế phổ biến ở vùng phủ sóng yếu), 255 kB gzip ban đầu vẫn mất khoảng 3-5 giây chỉ để tải JS trước khi tương tác được — với người dùng học sinh/sinh viên dùng 4G giá rẻ hoặc wifi trường học chập chờn, đây là thời gian chờ trắng màn hình thực tế đáng kể.
- **three.js đã lazy-load đúng cách** (điểm tốt, xem #5) — không cần động vào.
- **8 module tính năng phụ (2351 dòng) đang eager-load** — đây là phần lớn nhất có thể cắt khỏi bundle đầu, xem cách sửa cụ thể ở #5.
- **Đề xuất bổ sung ngoài code-split**: `maplibre-gl` bản thân đã là phần nặng nhất còn lại trong `index.js` sau khi tách 8 module trên (maplibre-gl full thường ~700-800 kB chưa gzip) — không thể tránh vì là core, nhưng có thể cân nhắc dùng bản `maplibre-gl` "light"/loại bỏ phần RTL text-plugin nếu không cần (kiểm tra `package.json` xem có đang import thêm rtl-text plugin không cần cho tiếng Việt).
- **34 hồ sơ tỉnh + 1921 điểm dữ liệu JSON**: các file này fetch theo yêu cầu (lazy theo lớp, `fetchJson(conf.file)` ở `main.ts:1748`) — đây là điểm tốt, không tải hết 33 file cùng lúc lúc khởi động.

---

## 7. TOP 10 VIỆC NÊN LÀM (xếp theo tác động/công sức)

1. **Sửa `NavigationControl` bị `#layer-control` che** (#2) — S, chặn tương tác cơ bản, sửa 1 dòng (`main.ts:176`).
2. **Thêm nút "Tắt tất cả lớp phủ"** (#9) — S, giảm ngay cảm giác rối khi thử nhiều lớp.
3. **Thêm phím Escape đóng panel** (#6) — S, chuẩn UX/a11y cơ bản còn thiếu.
4. **Thêm `aria-live` cho `period-label`** (#7) — S, 1 dòng, vá lỗ hổng a11y rõ.
5. **Tách 8 module tính năng phụ khỏi bundle chính bằng `import()` động** (#5) — M, giảm trực tiếp thời gian tải trắng màn hình lần đầu, ảnh hưởng MỌI người dùng.
6. **Gọn topbar 11 nút thành 3 cụm/menu** (#1) — M, sửa vấn đề ngợp thị giác + nguy cơ vỡ layout mobile ngay từ màn hình đầu.
7. **Bật `cluster: true` cho các lớp phủ >30 điểm** (#4) — M, cần thiết trước khi làm search vì giảm rối khi nhiều lớp bật cùng lúc.
8. **Mở rộng vùng chạm marker (invisible hit-circle lớn hơn)** (#8) — S-M, cải thiện trải nghiệm chạm trên điện thoại — nhóm người dùng chính.
9. **Xây ô tìm kiếm hợp nhất qua 33 lớp/1921 điểm** (§3-a) — L, tác động lớn nhất về lâu dài nhưng công sức cao nhất, nên làm sau khi có cluster (#7) làm nền.
10. **Kiểm tra thực tế trên trình duyệt ở 390px/360px** khi Chrome extension kết nối lại — xác nhận lại toàn bộ suy luận ở §4 (topbar wrap, panel overlap) trước khi commit vào roadmap chính thức.

---
*Ghi chú công sức: S = <2h, M = nửa ngày-1 ngày, L = nhiều ngày/cần thiết kế lại.*
