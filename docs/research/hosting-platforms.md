# Research 0.1 — Free hosting platforms (2026-07-17)

**Decision: Cloudflare Pages (primary) · GitHub Pages (backup/bootstrap) · Cloudflare R2 (large media).**

| Platform | Bandwidth/mo | Build limits | Storage/file size | Functions (free) | Commercial use |
|---|---|---|---|---|---|
| GitHub Pages | Soft cap 100 GB/mo | ~10 builds/hr | Site ≤1 GB; files >100 MiB blocked | None | Prohibited for primarily-commercial sites |
| **Cloudflare Pages** | **Unlimited** (fair-use) | 500 builds/mo | 20.000 files, 25 MiB/file | Workers free quota (100k req/day) | Allowed |
| Vercel Hobby | 100 GB | 45 min/build | ≤100 MB CLI upload | 1M invocations | Non-commercial only |
| Netlify Free | 300 credits/mo (blended, từ 09/2025) | credit-metered | n/a | credit-metered | Allowed |
| Render static | ~5 GB/mo (low confidence) | pooled minutes | n/a | n/a | — |
| Surge | không công bố | không công bố | ~300 MB anecdotal | None | Allowed |
| Firebase Spark | ~10 GB/mo (chưa xác minh trực tiếp) | n/a | 10 GB | 2M invocations | Allowed |

Nguồn: docs.github.com/en/pages (limits), developers.cloudflare.com/pages/platform/limits, vercel.com/docs/limits, netlify.com/pricing, render.com/docs/free — truy cập 2026-07-17.

## Ghi chú hiệu năng Việt Nam
- Cloudflare có PoP tại **Hà Nội (HAN) và TP.HCM (SGN)** — nền tảng duy nhất có PoP trong nước (medium confidence, cần xác minh lại blog.cloudflare.com).
- Các nền tảng khác thường route qua Singapore.

## Chiến lược asset lớn
- App shell + GeoJSON nhỏ → Cloudflare Pages.
- glTF / video / ảnh lớn → **Cloudflare R2** (10 GB free, egress $0).
- Dataset gốc có phiên bản → GitHub Releases (không giới hạn bandwidth).

## Điểm chưa chắc chắn
- Firebase pricing page 404 khi fetch; Render 5 GB từ search snippet; Surge không có limit chính thức. Không ảnh hưởng quyết định.
