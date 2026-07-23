# Kế hoạch: Phase 3 (hợp nhất lớp) ∥ Phase 2b (georeference) — song song

**Quyết định Iron Man (2026-07-23):** Làm Phase 3 song song Phase 2b, xong rồi vét niche (số 3).
**Nút thắt cốt lõi (data-driven):** DB 1.284 mục / 69 lớp — lớp "mỏng" do **PHÂN MẢNH** (trùng chéo tên 67–92%), không do thiếu người.

## Nguyên tắc chống xung đột
- Cả Phase 3 và 2b đều sửa `src/main.ts` → **KHÔNG sửa main.ts song song**.
- Song song phần độc lập: **Phase 3 phân tích data** ∥ **2b dựng GeoJSON**.
- Tuần tự hoá sửa main.ts: (1) 2b wire cương vực → (2) Phase 3 rewrite OVERLAYS config.
- Mọi thay đổi qua: validate_overlays + audit_sovereignty + build phải xanh; data mới = draft.

## Phase 2b — Georeference (tôi làm, self-contained)
- **2b-i (data):** Tạo `public/data/periods/dai-viet-1490.geojson` + `dai-nam-1838.geojson` — polygon biên giới trace XẤP XỈ theo bờ biển/sông hiện đại, **trích dẫn bản đồ gốc** (Hồng Đức bản đồ 1490; Đại Nam nhất thống toàn đồ 1838). Ghi rõ `do_tin_cay` + nguồn. KHÔNG blob mơ hồ (Iron Man đã bác).
- **2b-ii (wire):** Nối vào `applyCuongVuc()` / PERIODS trong main.ts (hook đã có từ Phase 2a). Sovereignty audit phải xanh (không cắt đảo trọng yếu ngoài phạm vi lịch sử — xử lý honest theo mốc thời gian).
- Sớm nhất: Văn Lang/Âu Lạc/Vạn Xuân = KHÔNG có nguồn biên → chỉ điểm kinh đô (đã chốt).

## Phase 3 — Hợp nhất (agent phân tích trước, tôi execute)
- **3a (phân tích, agent read-only):** Đề xuất map 69→~25 lớp gom theo chủ đề; liệt kê **trùng chéo-tên** (cùng người khác tên/khác file, vd Lê Lợi↔Lê Thái Tổ); xác định người đa-nhóm cần trường `nhom`.
- **3b (execute, tôi + verify):** Gộp file theo map; thêm `nhom[]` cho người đa danh mục (1 mục, hiện ở nhiều lớp, KHÔNG nhân bản); rewrite OVERLAYS + layer-control trong main.ts; validator + build xanh.
- Rủi ro: merge sai người → mất dữ liệu. Mọi merge phải có bằng chứng; giữ backup git mỗi bước.

## Thứ tự thực thi
1. [✅] 3a agent phân tích → cand-merge-map.json (24 nhóm) + cand-crossname-dups.json (5) + cand-nhom-multi.json (9).
2. [✅] 2b-i+ii: 2 polygon 1490+1838 wire lên selector (commit e38b458).
3. [✅] 3b lô 0: gỡ 5 trùng chéo-tên do sóng mở rộng gây (commit b4451d4).
4. [✅] 3b lô 1: 4 nhóm 2-file → 65 lớp (commit ee1bc25).
5. [✅] 3b lô 2: 4 nhóm nhân vật cùng schema → 50 lớp (ce4bd2d).
6. [✅] 3b lô 3: nhóm sự kiện → **47 lớp** (938195b).
7. [✅] 3b lô 4: 5 nhóm (2 lệch-schema dùng universalPersonPopup + 3 cùng-schema) → **29 lớp** (commit 5d8a128). Dedup coreName, 0 trùng.
8. [✅] Dọn STRICT_SOURCE: 67→27 tên (commit 2fb6b89).
9. [CHỜ IRON MAN] Cụm di sản nhà nước (di-tich-qgdb/bao-vat/unesco/di-tich-cach-mang/danh-thang) + huyen-su-khai-quoc + danh-nhan-cac-trieu: TÔI ĐỀ XUẤT GIỮ RIÊNG (xem "DEVIATION" dưới). Nếu gộp thì -6 lớp → ~23.
10. nhom[] cho 9 người đa danh mục — HOÃN (DB đã dedup toàn cục, không có mục nhân bản để gộp; cần render logic cross-layer = feature riêng).
11. Vét niche (số 3) — sau cùng.

## DEVIATION khỏi "gộp mạnh 24 nhóm" — 3 cụm tôi đề xuất GIỮ RIÊNG (lý do data-quality):
- **Cụm di sản** (UNESCO · bảo vật QG · di tích QGĐB · di tích cách mạng · danh thắng thiên nhiên): 5 **sổ đăng ký di sản nhà nước** riêng biệt, mỗi lớp popup riêng (xếp hạng/đợt/nơi lưu giữ/hạng mục). Gộp dưới universalPopup làm MẤT dữ liệu đăng ký chuẩn. → giữ 5 lớp.
- **huyen-su-khai-quoc** (🐉): chứa **Hải đội Hoàng Sa = nội dung chủ quyền** + Tứ bất tử. Gộp vào "thành hoàng" chôn nội dung chủ quyền. → giữ riêng.
- **danh-nhan-cac-trieu** (11 mục thờ-schema): bộ danh nhân BIỂU TƯỢNG có chủ đích (Nguyễn Du, Trần Nhân Tông, Lê Hữu Trác...), giàu noi_tho. Tách per-item = trùng chéo tên cao (nhóm dễ trùng nhất) + lệch schema. → giữ nguyên.
Nếu Iron Man muốn ép gộp: cụm di sản có thể gộp 2 lớp person-schema (di-tich-cach-mang + danh-thang) an toàn, giữ 3 sổ chính thức riêng.

## ⚠️ VẤN ĐỀ SCHEMA (quan trọng cho các lô còn lại)
Lớp dùng 2 schema khác nhau — KHÔNG gộp lẫn dưới 1 popup nếu lệch:
- **Schema nhân vật**: `nam_hien_thi` · `dia_diem` · `mo_ta` (personOverlayPopup).
- **Schema thờ tự**: `thoi_ky` · `noi_tho` · `cong_trang` (popup tùy biến — khoi-nghia-bac-thuoc, khoa-bang-danh-nhan, danh-tuong-khang-chien).
- **Schema sự kiện**: `nam` · `ket_qua` · `chi_huy` · `dia_diem`.
→ GIẢI PHÁP cho nhóm lệch: thêm hàm `universalPersonPopup` fallback `nam_hien_thi ?? thoi_ky ?? nam` · `dia_diem ?? noi_tho` · `mo_ta ?? cong_trang`, gán cho primary nhóm lệch RỒI mới gộp. (Đã kiểm chứng: lô 1-3 chỉ gộp nhóm CÙNG schema nên an toàn.)

## NHÓM CÒN LẠI (đều LỆCH schema → cần universalPersonPopup trước khi gộp):
- **khoa-bang-quan-lai** (11→1): primary **khoa-bang-danh-nhan** (thờ-schema) ← khoa-bang-bo-sung, -3, -4, mien-trung, nam-trung-bo, thanh-hoa, trang-nguyen-khoa-bang, tien-si-tieu-bieu, quan-thanh-liem, danh-than-trieu-nguyen (đa số person-schema). ⚠️ dedup kỹ + universalPopup.
- **danh-tuong-quan-su** (5→1): primary **danh-nhan-quan-su-co-trung-dai** (person) ← danh-tuong-khang-chien (thờ), vo-tuong-trung-dai (person), thu-linh-khoi-nghia-co-dai (person), khoi-nghia-bac-thuoc (thờ). → universalPopup.
- **thanh-hoang-tin-nguong** (3→1): primary **thanh-hoang-danh-than** ← thanh-hoang-vung-mien, huyen-su-khai-quoc (custom).
- **to-nghe-lang-nghe** (3→1): primary **to-nghe-danh-than** ← nghe-nhan-lang-nghe-bo-sung, lang-nghe-truyen-thong (địa điểm).
- **danh-nhan-vung-mien** (2→1): primary **danh-nhan-nam-bo** ← danh-nhan-thua-thien-hue (person — có thể gộp ngay như lô 2).
- **di-san-di-tich-bao-vat** (5→1): di-tich-qgdb ← di-tich-cach-mang, bao-vat-quoc-gia, danh-thang-di-san-thien-nhien, unesco. ⚠️ MỖI file popup TÙY BIẾN riêng (hang_muc/noi_luu_giu...) — KHÓ nhất; cân nhắc GIỮ RIÊNG bao-vat + unesco, chỉ gộp di-tich + danh-thang; hoặc chuẩn hoá.
- Giữ NGUYÊN: me-vnah, thieu-nien-anh-hung, su-than-ngoai-giao, thien-su-cao-tang, danh-y-luong-y, nghe-nhan-di-san, le-hoi-truyen-thong, nha-the-thao-lich-su.
- **TÁCH per-item CUỐI**: danh-nhan-cac-trieu → phân về nhóm theo loai (dedup chéo tên).

## SAU HỢP NHẤT: thêm `nhom[]` cho 9 người (cand-nhom-multi.json) + logic render; dọn STRICT_SOURCE.

## Quyết định Iron Man: "GỘP MẠNH HƠN" (24 nhóm + tách file hỗn hợp per-item + nhom[])

## RECIPE mỗi lô (đã kiểm chứng ở lô 1) — an toàn, atomic:
1. Script: gộp items file phụ → **file CHÍNH có sẵn** (giữ tên+entry OVERLAYS), dedup id + tên chính xác; append sources vào file chính; `unlinkSync` file phụ.
2. main.ts: **gỡ entry OVERLAYS của các file phụ** + đổi `label` file chính = nhãn nhóm. (Tất cả lớp nhân vật dùng `popup: personOverlayPopup`; lớp sự kiện dùng `eventOverlayPopup`; đừng trộn 2 loại popup — nhóm chien-dich-tran-danh dùng event.)
3. verify: `npm run build` (bắt lỗi cú pháp mảng) + `node scripts/validate_overlays.mjs` + `node scripts/audit_sovereignty.mjs` → phải xanh.
4. commit 1 lô. Scripts mẫu: scratchpad/merge_batch1.mjs, fix_crossdups.mjs.

## CÁC NHÓM CÒN LẠI (file CHÍNH in đậm = giữ tên):
- **khoa-bang-quan-lai** (11→1): **khoa-bang-danh-nhan** ← bo-sung, bo-sung-3, bo-sung-4, mien-trung, nam-trung-bo, thanh-hoa, trang-nguyen-khoa-bang, tien-si-tieu-bieu, quan-thanh-liem, danh-than-trieu-nguyen. ⚠️ RỦI RO TRÙNG TÊN CAO — dedup kỹ.
- **danh-tuong-quan-su** (5→1): **danh-nhan-quan-su-co-trung-dai** ← danh-tuong-khang-chien, vo-tuong-trung-dai, thu-linh-khoi-nghia-co-dai, khoi-nghia-bac-thuoc.
- **anh-hung-llvt-hien-dai** (5→1): **anh-hung-can-hien-dai** ← anh-hung-llvt-cand, anh-hung-llvt-bo-sung, anh-hung-liet-si-bo-sung, tuong-linh-hien-dai.
- **tri-thuc-khoa-hoc** (5→1): **tri-thuc-khoa-hoc-tk20** ← nha-giao-hoc-gia, anh-hung-lao-dong-khoa-hoc, dich-gia-ngon-ngu-hoc, kien-truc-su-ky-su.
- **van-nghe-si** (5→1): **danh-nhan-van-hoa-can-hien-dai** ← van-nghe-si-khoa-hoc, hoa-si-dieu-khac, nghe-si-san-khau-dien-anh, nha-bao-xuat-ban.
- **di-san-di-tich-bao-vat** (5→1): **di-tich-qgdb** ← di-tich-cach-mang, bao-vat-quoc-gia, danh-thang-di-san-thien-nhien, unesco. ⚠️ popup TÙY BIẾN (unesco/bao-vat/di-tich khác nhau) — cân nhắc giữ riêng bao-vat/unesco nếu popup khó gộp; hoặc chuẩn hoá popup.
- **chien-dich-tran-danh** (4→1): **chien-dich-tran-danh** ← chien-dich-tran-danh-bo-sung, khoi-nghia-khang-chien, tran-danh-khoi-nghia-bo-sung-2. Dùng `eventOverlayPopup`.
- **vua-chua-hoang-toc** (4→1): **vua-hoang-de** ← vua-chua-bo-sung, chua-nguyen-trinh, hoang-toc-tieu-bieu.
- **thanh-hoang-tin-nguong** (3→1): **thanh-hoang-danh-than** ← thanh-hoang-vung-mien, huyen-su-khai-quoc.
- **to-nghe-lang-nghe** (3→1): **to-nghe-danh-than** ← nghe-nhan-lang-nghe-bo-sung, lang-nghe-truyen-thong.
- **danh-nhan-vung-mien** (2→1): **danh-nhan-nam-bo** ← danh-nhan-thua-thien-hue.
- Giữ NGUYÊN (1 file): me-vnah, thieu-nien-anh-hung, su-than-ngoai-giao, thien-su-cao-tang, danh-y-luong-y, nghe-nhan-di-san, le-hoi-truyen-thong, nha-the-thao-lich-su.
- **can-xem-lai / TÁCH per-item**: danh-nhan-cac-trieu (hỗn hợp vua/văn/y/thần) → phân từng mục về đúng nhóm theo `loai`, dedup chéo tên (Lý Thái Tổ, Trần Nhân Tông, Lê Thánh Tông... đã có ở nhóm khác). LÀM CUỐI.

## SAU HỢP NHẤT:
- Thêm `nhom[]` cho 9 người đa danh mục (cand-nhom-multi.json): Quang Trung, Lê Lợi (vua+tướng); Phan Đình Phùng (khoa bảng+Cần Vương); Nguyễn Trung Trực; Bùi Thị Xuân; Hoàng Văn Thụ; Ngô Đức Kế; Trịnh Hoài Đức; Phạm Tu. → cần render logic cho nhom[] (1 mục hiện ở nhiều lớp khi lọc).
- Dọn STRICT_SOURCE trong validate_overlays.mjs (bỏ tên file đã xoá).
- Iron Man test `npm run dev` (sandbox chặn basemap).
