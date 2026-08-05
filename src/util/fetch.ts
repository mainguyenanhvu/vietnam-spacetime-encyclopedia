/**
 * Nạp JSON và ÉP QUA HÀM PARSE. Không còn `as T`.
 *
 * Vì sao `parse` là tham số BẮT BUỘC chứ không phải tuỳ chọn: bản cũ ký
 * `fetchJson<T>(path): Promise<T | null>` rồi `(await res.json()) as T` — một
 * lời khai không ai kiểm. Chuỗi nhân quả của lỗi: `as T` tuyên bố `nam` là
 * `number` → `tsc` tin → người viết thấy "số thì escape làm gì" → `${o.nam}` →
 * JSON thật trả chuỗi → sink XSS. Bắt buộc truyền `parse` biến "quên ép kiểu"
 * từ lỗi runtime im lặng thành lỗi biên dịch.
 *
 * Trả null khi HTTP lỗi, mạng lỗi, hoặc JSON hỏng — mọi nơi gọi đều đã có nhánh
 * xử lý null nên hành vi cũ giữ nguyên.
 */
export async function fetchJson<T>(
  path: string,
  parse: (raw: unknown) => T,
): Promise<T | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}${path}`);
    if (!res.ok) return null;
    return parse(await res.json());
  } catch {
    return null;
  }
}
