# PROGRESS — mega-refresh + mở rộng vô hạn

Kế hoạch chi tiết: [`mega-refresh-expansion-plan.md`](../mega-refresh-expansion-plan.md) · khởi tạo 2026-07-22.

## Trạng thái phase
| Phase | Nội dung | Trạng thái | Verify |
|---|---|---|---|
| 0 | Guardrail validator xuyên-file + snapshot count | ✅ xong | validator+audit+build xanh |
| 1 | UI: z-index timeline (✅) + icon lớp phủ (✅) | ✅ xong | build+validate xanh; emoji→canvas verified; render đầy đủ chờ Iron Man test local (sandbox chặn basemap) |
| 2 | Gom cương vực + thời kỳ + tên nước 4000 năm | ⬜ | — |
| 3 | Dedup & gom 69→~25 lớp; tách Mẹ VNAH | ⬜ | — |
| 4 | Ảnh nhân vật (chờ quyết nguồn) | ⬜ blocked | — |
| 5 | Mở rộng vô hạn (sóng agent) | ⬜ | — |

## Baseline (2026-07-22, commit 60f3608)
- 69 lớp phủ / **1156 mục** (827 reviewed · 280 draft · 49 no-status). DB dedup 1443 (gồm figures).
- 0 ảnh, 0 icon; timeline bị panel che; cương vực + thời kỳ tách rời; gap polygon 602→1887.

## Quyết định đã chốt
- ✅ Nguồn ảnh nhân vật (2026-07-22): **cổng nhà nước/bảo tàng/báo chí ưu tiên + Wikimedia Commons bổ khuyết**. Commons = kho media, tách khỏi bài chữ Wikipedia (vẫn cấm). Field `anh`/`anh_nguon`/`anh_giấy_phép`, tham chiếu URL ổn định.

## Blocker / watch
- WebSearch cạn (session-tied) → dùng Chrome-seed + WebFetch cho Phase 5.
- Merge (Phase 3) phải xong TRƯỚC khi chạy sóng mở rộng (Phase 5) để tránh xung đột file.
