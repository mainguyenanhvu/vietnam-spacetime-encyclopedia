# Research — Lưu trữ media nhiều GB tại $0 (2026-07-17)

**Quyết định: Combo A** — Wikimedia Commons (ảnh CC/PD, ∞) + Cloudflare R2 (10 GB, egress $0) + Backblaze B2 (10 GB, egress $0 qua Cloudflare Bandwidth Alliance) + Hugging Face Datasets (glTF/video lớn, best-effort) + GitHub Releases (bản gốc versioned, 2 GB/file, ∞ tổng).

| Dịch vụ | Storage free | Egress | Ghi chú |
|---|---|---|---|
| Cloudflare R2 | 10 GB | $0 luôn | S3 API — developers.cloudflare.com/r2/pricing |
| Backblaze B2 | 10 GB | $0 qua Cloudflare (Bandwidth Alliance) | backblaze.com/cloud-storage/pricing |
| Wikimedia Commons | ∞ (media tự do bản quyền) | WMF CDN | Giải quyết luôn licensing; WMF khuyến nghị tải về thay vì hotlink |
| Hugging Face Datasets | best-effort, không cap công bố (500 GB/file max) | CDN | huggingface.co/docs/hub/storage-limits — không SLA |
| GitHub Releases | ∞ tổng, 2 GiB/file | không giới hạn công bố | Cho download bản gốc, không dùng như CDN |
| Internet Archive | ~∞ | ~∞ | Mirror lưu trữ dài hạn, latency cao |
| Firebase Storage | ❌ hết free từ 09/2024 (đòi Blaze) | — | firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024 |
| Netlify Large Media | ❌ deprecated 2023-09-01 | — | — |
| Supabase 1 GB, Codeberg ~750 MB, Cloudinary 25 credits | quá nhỏ | — | loại |
| Bunny.net | không có free tier (trial 14 ngày) | — | fallback trả phí rẻ |

**Map tiles:** PMTiles single-file trên R2 + Protomaps Cloudflare Worker (docs.protomaps.com/deploy/cloudflare) — không cần tile server.
**Quy ước:** manifest JSON `media-id → origin URL` để quản lý đa nguồn.

⚠️ Chưa chắc chắn: sức chứa dài hạn của HF (best-effort); độ bền hotlink Wikimedia. Chi tiết + 12 nguồn: xem report agent trong lịch sử dự án.
