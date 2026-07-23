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
1. [ĐANG] 3a agent phân tích (bg) ∥ 2b-i tôi dựng GeoJSON.
2. 2b-ii wire main.ts + verify + commit.
3. 3b execute hợp nhất (dựa map 3a) + verify + commit — theo lô nhỏ, mỗi lô 1 commit.
4. Vét niche (số 3) — sau cùng.
