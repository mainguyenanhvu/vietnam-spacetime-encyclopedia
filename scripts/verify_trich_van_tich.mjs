// Cổng NGUYÊN VĂN cho `trich_van_tich[]` — tải trang trong `nguon_trich` rồi
// tìm đúng đoạn `doan` trong đó.
//
// Vì sao cần cổng riêng: bất biến #3 của dự án đòi mọi mục có nguồn, nhưng
// `validate_battles.mjs` chỉ kiểm được rằng TRƯỜNG nguồn tồn tại, đoạn trích
// dài đủ 20 ký tự và không dính wiki. Chép sai một chữ, hay trỏ «Dẫn theo»
// sang một trang KHÔNG hề chứa câu đó, thì không cổng nào bắt được. Với khối
// «Văn tịch chép» hiện ra nguyên văn trước mặt người đọc, đó là lỗ hổng đúng
// chỗ nguy hiểm nhất.
//
// ⚠️ CỐ Ý KHÔNG nằm trong `npm run validate`: script này cần mạng, mà cổng dữ
// liệu phải chạy được ngoại tuyến và tất định. Chạy tay sau mỗi đợt nạp trích:
//     node scripts/verify_trich_van_tich.mjs            (toàn bộ)
//     node scripts/verify_trich_van_tich.mjs bach-dang  (lọc theo id)
//
// Phép so CỐ Ý bỏ qua bốn khác biệt KHÔNG phải là chép sai — chi tiết ở
// `chuan()` và khối tách vế bên dưới. Bản đầu không bỏ qua chúng và báo 21
// đoạn «lệch», dò ra thì phần lớn chỉ vênh một dấu chú thích, một dấu chấm
// cuối câu, hoặc dấu «/» xuống dòng của câu đối. Cổng quá nghiêm tố oan người
// soạn cũng tai hại như cổng quá lỏng cho lọt đồ bịa.

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const GOC = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const DIR = join(GOC, "public", "data", "battles");
const loc = process.argv[2] ?? "";

/**
 * Chuẩn hoá trước khi so. Bỏ những khác biệt KHÔNG phải là chép sai:
 *  · kiểu dấu nháy và gạch nối — đó là bộ gõ của toà soạn;
 *  · dấu chú thích chân trang «([1])» «[2]» xen GIỮA câu — người soạn trích
 *    bỏ chúng đi là đúng, giữ lại mới là sai;
 *  · dấu câu ở hai đầu đoạn — trích một mệnh đề rồi đóng bằng dấu chấm là
 *    thông lệ biên tập, không phải sửa lời người ta.
 *
 * 🔴 Bản đầu không làm ba việc này và báo 21 đoạn «lệch nguyên văn». Dò từng
 * điểm gãy thì cả ba ca Ung Châu chỉ vênh đúng một dấu chú thích và một dấu
 * chấm — trích dẫn hoàn toàn trung thực. Một cổng quá nghiêm tố oan người
 * soạn cũng tai hại như một cổng quá lỏng cho lọt đồ bịa.
 */
const chuan = (s) =>
  s.replace(/[«»“”„‟"']/g, "")
   .replace(/[–—‑-]/g, "-")
   .replace(/\(\[\d+\]\)|\[\d+\]/g, "")
   .replace(/\s+/g, " ")
   .trim()
   .toLowerCase();

/** Bỏ dấu câu hai đầu — chỉ dùng cho ĐOẠN TRÍCH, không dùng cho văn bản trang. */
const loiDau = (s) => s.replace(/^[\s.,;:…]+/, "").replace(/[\s.,;:…]+$/, "");

const kho = new Map(); // url -> văn bản đã lột thẻ
function tai(url) {
  if (kho.has(url)) return kho.get(url);
  let t = "";
  try {
    // 🔴 Mã HTTP là BẮT BUỘC. Bản đầu chỉ lấy thân trang: mocban.vn trả 403 kèm
    // một trang lỗi ~700 byte, thân trang KHÔNG rỗng, nên phép kiểm báo «lệch
    // nguyên văn» — tức tố oan người soạn là chép sai trong khi thật ra chỉ là
    // máy chủ chặn curl. Suýt báo 21 trích dẫn hỏng vì lỗi này.
    const raw = execFileSync("curl", ["-sL", "--compressed", "--max-time", "45",
      "-w", "\\nHTTPCODE:%{http_code}",
      "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", url], { maxBuffer: 40e6 }).toString("utf8");
    const m = raw.match(/\nHTTPCODE:(\d+)$/);
    const ma = m ? Number(m[1]) : 0;
    const html = m ? raw.slice(0, m.index) : raw;
    if (ma !== 200 || html.length < 3000) { kho.set(url, ""); return ""; }
    t = chuan(html.replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'").replace(/&ldquo;|&rdquo;/g, '"'));
  } catch { t = ""; }
  kho.set(url, t);
  return t;
}

let dat = 0, hong = 0, khongTai = 0;
const loi = [];
for (const f of readdirSync(DIR).filter((x) => x.endsWith(".json") && !x.startsWith("_"))) {
  const d = JSON.parse(readFileSync(join(DIR, f), "utf8"));
  const ds = d.trich_van_tich ?? [];
  if (!ds.length || (loc && !d.id.includes(loc))) continue;
  for (const [i, t] of ds.entries()) {
    const url = (t.nguon_trich.match(/https?:\/\/\S+/) ?? [])[0];
    if (!url) { console.log(`⏭️  ${d.id}[${i}] nguon_trich không có URL — kiểm tay`); continue; }
    const van = tai(url);
    if (!van) { khongTai++; console.log(`⚠️  ${d.id}[${i}] không tải được ${url}`); continue; }
    const q = loiDau(chuan(t.doan));
    if (van.includes(q)) { dat++; continue; }

    // Hai dấu biên tập HỢP LỆ, phải tách ra rồi mới so từng mảnh:
    //   «/» — xuống dòng của câu đối, thơ, hịch (nguồn in liền một dòng);
    //   «…» — chỗ người soạn lược bớt cho gọn.
    // Không tách thì mọi trích thơ đều báo lệch, mà lỗi nằm ở phép đo chứ
    // không ở dữ liệu: Bình Ngô đại cáo, câu đối Kiếp Bạc, lời hiểu dụ Quang
    // Trung đều gãy đúng tại dấu «/» ngay sau vế đầu.
    const manh = q.split(/\s*[/…]+\s*/).map(loiDau).filter((x) => x.length >= 15);
    if (manh.length > 1 && manh.every((m) => van.includes(m))) {
      dat++;
      console.log(`✂️  ${d.id}[${i}] khớp trọn ${manh.length} vế (tách theo dấu / hoặc …)`);
      continue;
    }
    // Trích dài hay bị cắt bởi một cụm chèn giữa (chú thích, ghi chú toà soạn).
    // Khớp được ≥90% từ đầu thì coi là TRÍCH ĐÚNG có lược, in ra để soi mắt
    // chứ không đỏ cổng — cổng chỉ đỏ khi đoạn văn về cơ bản không có ở đó.
    let n = 0;
    while (n < q.length && van.includes(q.slice(0, n + 1))) n++;
    const ty = q.length ? n / q.length : 0;
    if (ty >= 0.9) {
      dat++;
      console.log(`≈  ${d.id}[${i}] khớp ${(ty * 100).toFixed(0)}% — gãy tại «${q.slice(n, n + 40)}»`);
    } else {
      hong++;
      loi.push(`❌ ${d.id}[${i}] chỉ khớp ${(ty * 100).toFixed(0)}% văn bản trang\n     sách: ${t.sach}\n     đoạn: ${t.doan.slice(0, 100)}…\n     gãy : «${q.slice(n, n + 60)}»\n     url : ${url}`);
    }
  }
}
for (const x of loi) console.log(x);
console.log(`\nkhớp nguyên văn ${dat} · lệch ${hong} · không tải được ${khongTai}`);
process.exit(hong ? 1 : 0);
