// Ngày tháng dùng chung cho phần lưu tiến trình trong localStorage.
// Cả game.ts lẫn quiz.ts đều cần ĐÚNG một định dạng: khoá tiến trình theo ngày
// và so sánh chuỗi `due <= today` nên phải là ISO `YYYY-MM-DD` theo giờ ĐỊA
// PHƯƠNG (không dùng toISOString — nó quy về UTC, lệch ngày với người dùng ở
// múi giờ +07).

/** Ngày hôm nay theo giờ địa phương, định dạng `YYYY-MM-DD`. */
export function todayStr(): string {
  return ymd(new Date());
}

/** Ngày cách hôm nay `days` ngày (âm = quá khứ), định dạng `YYYY-MM-DD`. */
export function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return ymd(d);
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
