// Chạy MỌI cổng dữ liệu trong scripts/ theo quy ước tên `validate_*.mjs`.
// Chạy: node scripts/run_validators.mjs   (hoặc: npm run validate)
//
// Vì sao tự phát hiện thay vì liệt kê tay: workflow CI trước đây liệt kê từng
// validator một, và đã bỏ sót thật — validate_nguon_cam.mjs (cổng chặn nguồn
// bị bác) nằm trong repo nhưng CI không hề gọi, nên suốt thời gian đó nó không
// bảo vệ được gì. Quy ước tên là thứ khó quên hơn một danh sách.
//
// Chạy hết rồi mới thoát, không dừng ở cổng đỏ đầu tiên: sửa dữ liệu thì biết
// một lượt tất cả chỗ hỏng vẫn hơn là sửa một chỗ rồi chạy lại để lòi ra chỗ
// sau.
import { readdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const DIR = dirname(fileURLToPath(import.meta.url));
const TOI = basename(fileURLToPath(import.meta.url));

const validators = readdirSync(DIR)
  .filter((f) => f.startsWith("validate_") && f.endsWith(".mjs") && f !== TOI)
  .sort();

if (validators.length === 0) {
  console.error("❌ Không tìm thấy validator nào trong scripts/ — kiểm tra lại quy ước tên.");
  process.exit(1);
}

const hong = [];
for (const f of validators) {
  const r = spawnSync(process.execPath, [join(DIR, f)], { stdio: "inherit" });
  if (r.status !== 0) hong.push(f);
}

console.log(`\n${validators.length - hong.length}/${validators.length} cổng dữ liệu xanh`);
if (hong.length) {
  console.error(`❌ đỏ: ${hong.join(", ")}`);
  process.exit(1);
}
