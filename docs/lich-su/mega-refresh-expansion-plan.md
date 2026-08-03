# 🏯 Mega-refresh + mở rộng vô hạn — kế hoạch (Iron Man 2026-07-22)

Chỉ đạo gốc (7 mục, có 2 mục đánh số "4"):
1. Bản đồ CHƯA đủ tên Việt Nam qua từng thời kỳ (4000 năm) → phủ đủ.
2. Panel lớp bản đồ ("topup") ĐANG CHE "Dòng thời gian" → sửa.
3. Mỗi lớp phủ hiển thị **icon** riêng thay cho chỉ chấm tròn.
4a. "Mẹ VNAH" phân mảnh nhiều lớp → **gom**; gộp lớp phủ giảm trùng. Mỗi nhân vật phải có **ảnh thật/tượng** (thông tin công cộng, không sợ bản quyền).
5. Gom "Cương vực Việt cổ" + lớp bản đồ qua từng thời kỳ.
4b. Rất nhiều chiến dịch/trận đánh/kháng chiến/khởi nghĩa → tìm đủ. **Không dừng** khi còn phát hiện nhân vật (anh hùng, danh nhân, AHLLVTND, AHLĐ, AHLLCAND, Mẹ VNAH, tướng lĩnh, quan thanh liêm, thành hoàng, tiến sĩ, trạng nguyên…). Xích Quỷ→nay, tên đường, vẽ bản đồ từ Xích Quỷ. Tự tải PDF + đọc/viết lại. Coding + research workflow, spawn agents song song. Không dừng đến khi hết.

---

## 📍 Nền hiện tại (đã scout 2026-07-22)
- **Render**: 69 lớp phủ đều là `circle` paint layer — **0 icon/symbol cho điểm dữ liệu**. Có sẵn field `loai` (195 giá trị free-text, nhiều synonym trùng) đủ để lái `icon-image` `match`. `src/main.ts:1980-1990`, `OVERLAYS[]` hardcode `1057-1946`.
- **Panel che timeline**: `#layer-control` `position:absolute; z-index:10; max-height:calc(100vh - --panel-top - 1.25rem)` KHÔNG trừ chiều cao `#timeline-bar` (footer `position:static`) → panel cao đè lên timeline. `src/style.css:159-171, 1419-1424, 1561-1565`.
- **Thời kỳ/cương vực**: HAI hệ độc lập — `ERAS[]` (3 mốc hành chính, radio `name=era`, `src/main.ts:26-45`) và `initCuongVuc()` (5 polygon huyền sử Xích Quỷ→Vạn Xuân, radio `name=cuongvuc`, `367-446`). Chưa có model thời-gian chung. **Gap polygon ~1300 năm (602→1887): thiếu Nam Việt, Bắc thuộc, Đại Cồ Việt, Đại Việt, Đại Nam.**
- **Ảnh**: **0/1156 entry có field ảnh**. Chỉ có `nhan_hinh_dung` (45 mục) = chuỗi disclaimer text, không phải URL.
- **Popup**: `personOverlayPopup`/`eventOverlayPopup` `1027-1055` — text thuần, không ảnh.
- **Dữ liệu**: 69 file / **1156 mục** (827 reviewed · 280 draft · 49 no-status). Mẹ VNAH: **4 người + 1 tượng đài, rải 2 file** (`me-vnah-ahld.json` thực chất 8/11 là AHLĐ). **6 id trùng chéo file** (3 genuine-dup + 3 false-collision khác người cùng slug). `validate_overlays.mjs` chỉ check id-unique **trong từng file**, không xuyên file.

---

## Phase 0 — Guardrail (opus/sonnet) · chặn hồi quy trước khi refactor
- P0.1 `validate_overlays.mjs`: thêm check **id unique XUYÊN 69 file** (root cause của trùng lặp). Fix 6 id trùng (`dang-van-ngu`, `vu-due`, `hoang-tich-chu` = gom; `nguyen-van-ty`, `pham-tuan`, `doan-khue` = đổi slug người-khác).
- P0.2 Regen `existing_entities.txt` (scratchpad `extract_entities2.mjs`, đã gộp figures/). Snapshot count = 1156 để đối chiếu sau merge (không được rơi mục).
- ✅ Done khi: validator báo được dup xuyên file; `npm run build` xanh; count khớp.

## Phase 1 — Sửa UI nhanh (sonnet) · độc lập, rủi ro thấp
- P1.1 (#2) z-index: `#timeline-bar` `position:relative; z-index:20` (luôn trên panel), + panel `max-height` trừ thêm chiều cao footer. ≤20 dòng CSS.
- P1.2 (#3) Icon: thêm `nhom` (nhóm chuẩn hoá) → bảng icon. Cách nhẹ nhất: **symbol layer song song** trên cùng source, `icon-image` = `["match",["get","nhom"],…]`; nạp icon qua `styleimagemissing`/`map.on("load")`. Bộ ~20 icon (SVG data-URI hoặc emoji-to-canvas) cho: vua, tướng, khoa bảng, nữ danh nhân, thiền sư, anh hùng, Mẹ VNAH, trận đánh, di tích, lễ hội, làng nghề, danh y, nghệ sĩ, ngoại giao… Circle giữ lại làm halo nền.
- ✅ Done khi: panel không còn che timeline (screenshot); mỗi lớp hiện icon đúng nhóm.

## Phase 2 — Gom Cương vực + Thời kỳ (opus thiết kế · sonnet impl) (#5, #1)
- P2.1 Model thời-gian chung `ERAS_UNIFIED[]`: mỗi kỷ nguyên = {id, tên_nước, nhãn, khoảng_năm, polygon_file, màu}. Gộp `ERAS` + `cuong-vuc` thành **1 radio group** duy nhất, trượt Xích Quỷ→nay.
- P2.2 Bổ sung polygon "phỏng dựng học thuật" cho gap: Nam Việt, Giao Chỉ/Bắc thuộc, Đại Cồ Việt, Đại Việt, Đại Nam (nhãn rõ "PHỎNG DỰNG", nguồn nhà nước/atlas, không phải yêu sách chủ quyền).
- P2.3 Hiển thị **tên nước theo thời kỳ** (nhãn động khi chọn era).
- ✅ Done khi: 1 selector phủ liền mạch 4000 năm; mỗi era hiện tên nước + cương vực; build xanh; audit chủ quyền xanh.

## Phase 3 — Gom & dedup lớp phủ (opus điều phối · sonnet impl) (#4a-gom)
- P3.1 Hợp nhất 69 → ~25 file theo cụm (giữ **mọi** mục, thêm field `nhom` + `vung_mien`, chuẩn hoá `loai`):
  khoa bảng 9→1 · nữ danh nhân 2→1 · vua chúa/hoàng tộc 6→1 · tướng lĩnh 4→1-2 · anh hùng LLVT 5→1-2 · danh nhân vùng 6→1 · trận đánh/khởi nghĩa 6→2 · nghệ nhân/làng nghề 4→2 · thành hoàng 2→1.
- P3.2 **Tách+gom Mẹ VNAH**: file mới `me-vnah.json` gom 4 người + tượng đài; 8 AHLĐ trả về `anh-hung-lao-dong.json`.
- P3.3 Dedup 3 genuine-dup; resolve 5 di tích trùng bằng cross-ref key.
- P3.4 Cập nhật `OVERLAYS[]` + gom nhóm trong layer-control (accordion theo cụm).
- ✅ Done khi: tổng mục ≥1156 (không rơi), giữ nguyên draft/reviewed, validator xuyên-file xanh, build xanh, mọi lớp toggle được, HCMC/tên đường không hỏng.

## Phase 4 — Ảnh nhân vật (sonnet) (#4a-ảnh) · ⏳ CHỜ QUYẾT NGUỒN
- Thêm schema `anh` (URL), `anh_nguon`, `anh_giấy_phép`. Popup render `<img>` + attribution + lazy-load. Mặc định **tham chiếu URL ổn định** (không tải nặng vào repo; cache sau nếu cần).
- Nguồn ảnh: **chờ Iron Man quyết** (câu hỏi bên dưới) — đụng luật "không Wikipedia".
- ✅ Done khi: popup hiện ảnh khi có; % phủ ảnh được log mỗi cụm.

## Phase 5 — Mở rộng vô hạn (sonnet agents nền, song song) (#4b)
- Route: WebSearch cạn (session-tied) → **Chrome-seed tên+URL cổng → agent WebFetch từng URL** (WebFetch không dính quota). PDF: agent tự tải + đọc (Read PDF) + viết lại JSON.
- Sóng vào **cấu trúc file MỚI** (sau Phase 3), mọi mục = `draft`, nguồn cổng nhà nước, KHÔNG Wikipedia, qua validator+audit+build mỗi commit.
- Ưu tiên độ đầy đủ: (a) trận đánh/chiến dịch/khởi nghĩa/kháng chiến còn thiếu (Lam Sơn umbrella, Vị Xuyên, biên giới 1979 chi tiết…); (b) đủ hạng anh hùng (AHLLCAND riêng, thêm Mẹ VNAH tiêu biểu vùng miền); (c) khoa bảng/trạng nguyên/tiến sĩ còn sót theo tỉnh; (d) thành hoàng/tổ nghề; (e) tên đường rollout tỉnh khác.
- **Loop-until-dry**: dừng khi K=2 sóng liên tiếp không ra mục mới (log rõ cái bị bỏ, không cắt im lặng).
- ✅ Done khi: mỗi sóng thêm N mục draft mới đã dedup + có nguồn; dừng khi cạn.

---

## Thứ tự & phụ thuộc
- Phase 0 → (1 ∥ 2) → 3 → (4 ∥ 5). Phase 3 (merge file) PHẢI xong trước Phase 5 (nếu không, agent thêm mục vào file sắp bị gộp → xung đột).
- Phase 1 & 2 chạy song song với 0/3 (đụng `src/main.ts` khác vùng — cẩn thận merge).

## Cổng CI mỗi commit
`node scripts/validate_overlays.mjs` ✅ · `node scripts/audit_sovereignty.mjs` ✅ · `npm run build` ✅

## Model routing
- haiku: quét, rename, scaffold icon, commit msg.
- sonnet: impl 1 file, sinh data, agent research WebFetch, sửa CSS/popup.
- opus: thiết kế model thời-gian, điều phối merge 69→25, validator xuyên-file, audit chủ quyền.
