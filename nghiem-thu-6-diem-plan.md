# Kế hoạch xử lý 6 điểm nghiệm thu của Iron Man (2026-07-19)

> Phản hồi sau nghiệm thu v2.0. 3 bug render + 2 mở rộng dữ liệu + 1 đại tu UI.
> Ràng buộc bất biến: chủ quyền Hoàng Sa/Trường Sa mọi lớp; mỗi mục dữ liệu có `nguon[]`;
> KHÔNG dùng Wikipedia làm nguồn nội dung danh nhân/sử; ISO 8601; số phân tách kiểu Âu (ngữ cảnh Việt).
> Sandbox chặn WebGL → chỉ verify được logic/data/validator/build; render do Iron Man nghiệm thu cuối.

## Chẩn đoán (đã soi code thật)
1. **Màu tỉnh «tất cả 1 màu»** — ROOT CAUSE: `colorExprFor` (main.ts ~L188) dùng
   `["at", ["%", ["id"], N], ["literal", pal]]` → style-spec báo *Expected array<color> but found array<string,10>*
   → `setPaintProperty("fill-color", ...)` bị **từ chối im lặng** → giữ `eraColorExpr` mặc định (1 màu chủ đạo).
   FIX: bọc `["to-color", …]`. Đã test `createExpression` → success, id 0/1/5/12/37 ra 5 màu khác nhau.
2. **Sông & núi chưa đủ** — `song-nui.json` 22 sông + 18 núi, **toàn `Point`** (chỉ nhãn chữ, không thấy dòng sông).
   FIX: thêm lớp **đường sông (LineString)** cho ~12 sông lớn + tăng số núi + style rõ hơn, mặc định dễ thấy.
3. **Danh nhân 4000 năm chưa đủ** — 301 mục theo tỉnh + 34 mục 4 overlay. Bổ sung overlay danh nhân theo triều (Lý/Trần/Hồ/Lê/Mạc/Trịnh-Nguyễn/Nguyễn/cận đại). Delegate research (nguồn chính thống).
4. **Trận đánh/khởi nghĩa chưa đủ** — chỉ 1 sa-đồ Bạch Đằng. Thêm overlay **chiến dịch – trận đánh – khởi nghĩa** toàn thời đại (điểm bản đồ + năm + kết quả + nguồn). Delegate research.
5. **Nam tiến che bản đồ** — `nam-tien-fill` opacity 0.72 đè kín; panel aside che map. FIX: giảm opacity, nhấn "mặt trận hiện tại" (bước mới sáng, bước cũ mờ), viền tiến trình, panel thành thanh dưới không đè bản đồ.
6. **UI cổ điển/lỗi thời** — đại tu `style.css`: hệ thống thiết kế hiện đại (typography scale, token màu, control bo tròn, panel kính mờ, responsive, motion nhẹ). GIỮ nguyên logic render chủ quyền.

## Sóng thực thi
- **Sóng 1 — Fix render chắc chắn (tôi làm, verify bằng build):** #1 (to-color), #5 (nam-tien redesign + panel), #2 (đường sông + núi).
- **Sóng 2 — Đại tu UI #6 (tôi làm):** style.css design system + topbar/panel/popup/layer-control hiện đại.
- **Sóng 3 — Mở rộng dữ liệu #3/#4 (delegate research agents, nền):** overlay danh nhân theo triều + overlay chiến dịch/trận đánh/khởi nghĩa. Agent trả toạ độ + facts nguồn chính thống; tôi ghi file + validator.

## Tiến độ (2026-07-19)
- ✅ **Sóng 1** — commit `39d3d89`: #1 to-color, #2 đường sông LineString (19 sông + 26 núi), #5 Nam tiến giảm opacity + viền mặt trận.
- ✅ **Sóng 2** — commit `312e06b`: #6 đại tu UI (design token, topbar gradient, panel kính mờ, popup/timeline/scrollbar hiện đại).
- ✅ **Sóng 3** — commit `05bec73`: #4 `chien-dich-tran-danh.json` (17 trận/khởi nghĩa 938–1975; 9 reviewed, 8 draft) + #3 `danh-nhan-cac-trieu.json` (11 danh nhân các triều/văn hoá/y học; 4 reviewed, 7 draft). Toạ độ soát qua 2 research agent (OSM Nominatim). Cả 2 sạch Wikipedia, vào STRICT_SOURCE.

## Còn lại / gated (nghiệm thu cuối)
- **Render**: sandbox chặn WebGL → Iron Man kiểm mắt 6 điểm trên production (màu tỉnh, đường sông, Nam tiến, UI, 2 overlay mới).
- **Toạ độ draft cần soát POI**: nhiều mục trung/thấp (Nguyễn Du, Lê Hữu Trác, Hồ Xuân Hương, Đào Duy Từ, Tân Sở, Rạch Gầm, Bãi Sậy, Hương Khê…) — chờ nâng cấp qua cổng Sở VHTTDL/Google Maps.
- **Mở rộng tiếp #3/#4** nếu Iron Man muốn: còn nhiều danh nhân/trận đánh có thể bổ sung theo đợt.

## v2.2 — Nghiệm thu vòng 2 (2026-07-19, feedback mới)

Feedback mới của Iron Man (6 điểm sửa lại) + mệnh lệnh mở rộng vô hạn
(«không dừng khi còn tìm được nhân vật/sử liệu… vẽ bản đồ từ thời Xích Quỷ,
tự tải/đọc PDF, spawn agent song song»). Xác minh render bằng **Chrome thật
qua claude-in-chrome** (không còn mù WebGL như trước).

- ✅ **#1 mới — Khung «Lớp bản đồ» tràn màn hình** (regression do thêm lớp phủ):
  nhóm gập `<details>` + cuộn trong panel + danh sách lớp phủ cuộn riêng.
  **Đã kiểm mắt: panel gọn, không tràn.** (commit `fe8d4f6`)
- ✅ **#5 mới — Ô Nam tiến che GIỮA bản đồ** (là *panel*, không phải fill):
  neo trái (đè Lào/biển) + ẩn layer-control khi mở + fitBounds chừa lề trái
  360px. **Đã kiểm mắt: toàn bộ VN hiện rõ bên phải panel.** (`fe8d4f6`)
- ✅ **#2 — sông/núi «chưa đủ»**: 19→38 sông, 26→42 núi; thêm `nui-markers`
  (▲ allow-overlap luôn hiện). **Đã kiểm mắt: đường sông xanh hiện rõ.**
  Marker núi chờ nghiệm thu production. (`fe8d4f6`)
- ✅ **#3/#4 — mở rộng nhân vật**: +24 anh hùng cận–hiện đại, +12 trạng nguyên
  = **36 danh nhân mới** (2 research agent song song, nguồn ngoài Wikipedia,
  trạng thái draft chờ soát URL). (`fe8d4f6`)
- ✅ **«Vẽ bản đồ VN từ thời Xích Quỷ»**: lớp `Cương vực Việt cổ` 4 thời kỳ
  (Xích Quỷ huyền sử → Văn Lang → Âu Lạc → Vạn Xuân), nét đứt + cảnh báo
  học thuật, popup nguồn. (commit `613601b`) — render chờ nghiệm thu production.
- ⏳ **#6 UI hiện đại**: đã đại tu ở v2.1; topbar/panel kính mờ nhìn hiện đại
  trên Chrome thật. Chưa đổi thêm — chờ Iron Man chỉ điểm cụ thể nếu còn cổ.

**Chưa làm (đợt sau, theo mệnh lệnh «không dừng»)**: tên đường/phố; thành hoàng
làng; thêm tiến sĩ/trạng nguyên (còn ~40 vị); soát toạ độ draft về mức xã/đền;
tự tải & đọc PDF sử liệu để bổ sung. WebSearch quota cạn giữa phiên → cần đợt
sau khi quota reset để gắn URL nguồn cụ thể cho 36 mục draft.

**Lỗi môi trường ghi nhận**: reload nhiều lần làm cạn WebGL context của Chrome
→ bản đồ trắng dù build xanh; khắc phục tạm bằng `window resize` repaint hoặc
tab mới. KHÔNG phải lỗi code (build + 9 validator luôn xanh).

## Tiêu chí done
- `node scripts/validate_overlays.mjs` + 9 validator xanh; `npm run build` xanh.
- Mỗi mục dữ liệu mới: ≥1 nguồn ngoài Wikipedia; toạ độ trong bbox + soát tỉnh.
- Commit từng sóng; cập nhật plan + memory. Render nghiệm thu cuối bởi Iron Man.
