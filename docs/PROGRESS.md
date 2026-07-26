# PROGRESS — mega-refresh + mở rộng vô hạn

Kế hoạch chi tiết: [`mega-refresh-expansion-plan.md`](../mega-refresh-expansion-plan.md) · khởi tạo 2026-07-22 · cập nhật 2026-07-26 (sau sóng 10).
Nhật ký từng sóng mở rộng: [`expansion-campaign-plan.md`](../expansion-campaign-plan.md) · recipe hợp nhất: [`phase3-2b-parallel-plan.md`](../phase3-2b-parallel-plan.md).

## Trạng thái phase
| Phase | Nội dung | Trạng thái | Verify |
|---|---|---|---|
| 0 | Guardrail validator xuyên-file + snapshot count | ✅ xong | validator+audit+build xanh |
| 1 | UI: z-index timeline + icon lớp phủ | ✅ xong | build+validate xanh; render đầy đủ chờ Iron Man test local (sandbox chặn basemap) |
| 2a | Gom 1 selector thời kỳ (13 thời kỳ) + tên nước | ✅ xong | tsc+vite+validator xanh (46979d3) |
| 2b | Đường biên chính xác có nguồn | 🔴 chờ quyết | Không có dataset sẵn; chỉ georef được 2 bản đồ gốc (Đại Việt 1490, Đại Nam 1838); era sớm không có nguồn biên |
| 3 | Dedup & hợp nhất lớp 69→33 | 🟡 gần xong | Mọi cụm nhân vật lớn đã gộp. Còn: tách per-item `danh-nhan-cac-trieu.json`, gộp `huyen-su-khai-quoc`, thêm `nhom[]` cho 9 người đa danh mục (cần render logic), dọn STRICT_SOURCE |
| 4 | Ảnh nhân vật | 🟡 một phần | Nguồn đã chốt (xem dưới); đã nạp một số đợt ảnh |
| 5 | Mở rộng vô hạn (sóng agent) | 🔄 đang chạy | **Đã xong sóng 1→10**. Sóng 10 (2026-07-26): +56 mục, 4 agent |
| Q1 | Tách Mẹ VNAH + kiểm toán 62 lớp + sửa 2 factual | ✅ xong | validator+build xanh; `docs/audit-findings.md` |

## Snapshot 2026-07-26 (sau sóng 10, chưa commit)
- **33 lớp phủ / 1921 mục** — 1514 reviewed · **358 draft** (chờ cổng §9).
- Vỉa đã **đóng sổ, không mở lại**: 36/36 vườn quốc gia · 11/11 khu dự trữ sinh quyển thế giới · 17/17 di sản phi vật thể UNESCO · thương cảng–chợ–cầu cổ có xếp hạng.

## Quyết định đã chốt
- **Nguồn ảnh nhân vật** (2026-07-22): cổng nhà nước/bảo tàng/báo chí ưu tiên + Wikimedia Commons bổ khuyết. Commons = kho media, tách khỏi bài chữ Wikipedia (vẫn cấm). Field `anh`/`anh_nguon`/`anh_giay_phep`.
- **Tách hay gộp bản ghi trùng tư cách** (2026-07-26, phương án B): **tách** bản ghi riêng khi thực thể khác nhau (VQG Núi Chúa ≠ khu DTSQ Núi Chúa — ranh giới khác); **chèn vào `mo_ta` bản ghi cũ** khi cùng một thực thể đã mang danh hiệu (Cù Lao Chàm, Cát Bà, Mũi Cà Mau, VQG Cát Tiên).
- **Cụm `di-tich-qgdb` / `bao-vat-quoc-gia` / `unesco` / `di-tich-cach-mang`**: cố ý giữ riêng, popup khác nhau — đừng gộp lại.
- **`xep_hang` bắt buộc** (từ sóng 10): mỗi mục ghi cấp + số QĐ + ngày, trích từ nguồn đã fetch; không tra được thì ghi «chưa xác minh được», không bịa số.

## Quy trình nạp một sóng (main làm, đã kiểm chứng ở sóng 10)
1. Tái tạo `docs/existing_entities.txt` (quét đệ quy toàn `public/data/**`).
2. Agent soạn file ứng viên trong scratchpad, tự chạy self-check, KHÔNG ghi vào repo.
3. **Dry-run `scratchpad/merge_song10.mjs`** — đối chiếu chéo cả 33 file: trùng id / trùng tên bỏ dấu / trùng toạ độ / `loai` ngoài tập lớp đích. *Bước này bắt được lỗi mà self-check của agent không thấy.*
4. `--apply` → thêm file mới vào `STRICT_SOURCE` + đăng ký layer trong `src/main.ts` (nếu có lớp mới).
5. 3 gate: `validate_overlays.mjs` · `audit_sovereignty.mjs` · `npm run build`.
6. Cập nhật nhật ký sóng trong `expansion-campaign-plan.md` + file này, rồi commit.

## Blocker / watch
- ⚠️ **`unesco.json` chưa vào được STRICT_SOURCE** — 13 mục dùng schema cũ, không có `nguon[]` riêng. Cần backfill nguồn từng mục (TODO đã ghi trong `scripts/validate_overlays.mjs`).
- 🤔 **Chờ Iron Man quyết**: (a) 12 mục chợ chưa xếp hạng ở `scratchpad/song10_A1_chua_xep_hang.json` — mở lớp «chợ truyền thống» hay bỏ; (b) 2 mục cấp tỉnh/thành đang nằm trong lớp `di-tich-quoc-gia`; (c) báo chính thống ngoài báo Đảng có hợp lệ không (ảnh hưởng lớp `cong-trinh-ky-luc` từ sóng 7).
- 📌 **358 draft** đang chờ cổng §9 — nên xen một lô duyệt giữa các sóng thay vì để phình tiếp.
- Merge (Phase 3) phần còn lại nên xong trước khi mở sóng có lớp mới, tránh xung đột file.
