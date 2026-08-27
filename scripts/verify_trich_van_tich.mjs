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
import { readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

/**
 * Bảng thực thể HTML có TÊN; thực thể SỐ (&#237; &#xED;) giải bằng công thức
 * trong `tai()`.
 *
 * 🔴 Vì sao phải giải ĐỦ chứ không chỉ &nbsp;/&amp;: một số toà soạn mã hoá cả
 * chữ có dấu (baochinhphu.vn, baocaobang.vn trả «N&ocirc;ng Văn V&acirc;n»).
 * Không giải thì văn bản trang đọc ra là rác, và cổng báo «không thấy nguyên
 * văn» cho một trích dẫn hoàn toàn trung thực — tố oan người soạn.
 */
const TEN = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’",
  laquo: "«", raquo: "»", hellip: "…", ndash: "–", mdash: "—", deg: "°",
  agrave: "à", aacute: "á", acirc: "â", atilde: "ã",
  egrave: "è", eacute: "é", ecirc: "ê", igrave: "ì", iacute: "í",
  ograve: "ò", oacute: "ó", ocirc: "ô", otilde: "õ",
  ugrave: "ù", uacute: "ú", yacute: "ý", ntilde: "ñ", ccedil: "ç",
};

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
   // ð (U+00F0) → đ (U+0111): nhandan.vn mã hoá chữ «đ» thành `&#240;`, tức
   // sai thực thể ở phía toà soạn. Chữ họ ĐỊNH viết vẫn là «đ», nên gộp về
   // một — nếu không, mọi trích dẫn từ nhandan có chữ đ đều báo lệch oan.
   .replace(/ð/g, "đ").replace(/Ð/g, "Đ")
   .replace(/\(\[\d+\]\)|\[\d+\]/g, "")
   .replace(/\s+/g, " ")
   .trim()
   .toLowerCase();

/** Bỏ dấu câu hai đầu — chỉ dùng cho ĐOẠN TRÍCH, không dùng cho văn bản trang. */
const loiDau = (s) => s.replace(/^[\s.,;:…]+/, "").replace(/[\s.,;:…]+$/, "");

// Cookie jar dùng chung cho mọi lượt tải trong một lần chạy script.
//
// 🔴 VÌ SAO CẦN: một số toà soạn (qdnd.vn) đứng sau CDN chống bot (mlytics).
// Hạ tầng này trả 302 trỏ VỀ CHÍNH URL vừa gọi, kèm Set-Cookie thử thách; gọi
// lại mà không mang cookie đó thì bị trả 302 y hệt lần trước — curl -L cứ thế
// lặp cho tới khi chạm trần 50 lần chuyển hướng rồi bỏ cuộc. Trang KHÔNG hề
// lỗi hay chặn hẳn, chỉ là chưa qua được đúng một vòng bắt tay mà trình duyệt
// thật làm tự động. Một cookie jar — nhận Set-Cookie ở hop 1, gửi lại ở hop
// 2 — là đủ để qua vòng đó; `curl -L` tự dùng cookie đã nhận cho các hop kế
// tiếp trong CÙNG một lệnh, không cần logic bổ sung nào khác.
// Phát hiện thực tế: 7/206 trích trong đợt sau-1887 (toàn bộ đều là qdnd.vn)
// từng báo «không tải được» chỉ vì thiếu đúng cookie jar này — không phải vì
// trích sai hay trang chết.
const COOKIE_JAR = join(tmpdir(), `verify-trich-van-tich-${process.pid}.cookies`);

const kho = new Map(); // url -> văn bản đã lột thẻ
function tai(url) {
  if (kho.has(url)) return kho.get(url);
  let t = "";
  try {
    // 🔴 Mã HTTP là BẮT BUỘC. Bản đầu chỉ lấy thân trang: mocban.vn trả 403 kèm
    // một trang lỗi ~700 byte, thân trang KHÔNG rỗng, nên phép kiểm báo «lệch
    // nguyên văn» — tức tố oan người soạn là chép sai trong khi thật ra chỉ là
    // máy chủ chặn curl. Suýt báo 21 trích dẫn hỏng vì lỗi này.
    //
    // UA đầy đủ (kèm AppleWebKit/Chrome/Safari) + cookie jar (-b/-c cùng một
    // file): UA rút gọn cũ không đủ để qua vài CDN chống bot coi nó là máy;
    // đối chiếu tay từng cho thấy UA đầy đủ + cookie jar cùng lúc mới tải
    // được qdnd.vn, nên giữ cả hai thay vì đoán riêng cái nào đủ.
    const raw = execFileSync("curl", ["-sL", "--compressed", "--max-time", "45",
      "-w", "\\nHTTPCODE:%{http_code}",
      "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      "-b", COOKIE_JAR, "-c", COOKIE_JAR,
      url], { maxBuffer: 40e6 }).toString("utf8");
    const m = raw.match(/\nHTTPCODE:(\d+)$/);
    const ma = m ? Number(m[1]) : 0;
    const html = m ? raw.slice(0, m.index) : raw;
    if (ma !== 200 || html.length < 3000) { kho.set(url, ""); return ""; }
    t = chuan(html.replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      // 🔴 DỌN RÁC DO CHÍNH DÒNG TRÊN TẠO RA — không phải nới tiêu chuẩn so
      // khớp. Thay MỌI thẻ bằng một khoảng trắng là đúng cho thẻ nằm giữa hai
      // chữ (ví dụ "<b>giữ</b> vững" → "giữ vững" vẫn cần cách), nhưng một thẻ
      // đóng nằm SÁT một dấu câu (ca thật: qdnd.vn viết "...1968</a>, mũi..."
      // — link bọc ngày tháng, đóng ngay trước dấu phẩy, KHÔNG có khoảng
      // trắng trong mã nguồn) thì bước trên để lại "1968 , mũi" — thừa một
      // khoảng trắng mà trang thật không hề có. `chuan()` chỉ gộp NHIỀU
      // khoảng trắng thành một, không xoá khoảng trắng sát trước dấu câu, nên
      // nếu để nguyên thì văn bản TRANG lệch khỏi văn bản trang THẬT ngay tại
      // điểm đó — tố oan một đoạn trích hoàn toàn chính xác (ca thật:
      // mau-than-hue-1968[0], sau khi thêm cookie jar mới lộ ra vì trước đó
      // trang này luôn "không tải được" nên chưa từng bị soi tới dòng này).
      // Dùng `\s+` chứ không phải một dấu cách đơn: thẻ có thể nằm sau một
      // xuống dòng hoặc thụt lề trong mã nguồn trang, để lại "\n  ," — bản
      // một-dấu-cách sẽ trượt đúng những ca đó, và trượt IM LẶNG.
      // Cố tình đặt Ở ĐÂY (trong `tai()`, ngay sau bước lột thẻ) chứ không
      // phải trong `chuan()`: đây là bước phục hồi văn bản TRANG về đúng như
      // người đọc thấy, không phải nới tập khác biệt được bỏ qua khi SO
      // KHỚP — `chuan()` áp cho cả trang lẫn đoạn trích và khối đầu file đã
      // liệt kê rõ bốn khác biệt nó cố ý bỏ qua; thêm luật vào đó là nới tiêu
      // chuẩn so khớp cho mọi đoạn trích, không phải thứ cần ở đây.
      .replace(/\s+([,.;:!?…])/g, "$1")
      .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
      .replace(/&([a-zA-Z]+);/g, (m, t) => TEN[t.toLowerCase()] ?? m));
  } catch { t = ""; }
  kho.set(url, t);
  return t;
}

let dat = 0, hong = 0, khongTai = 0;
const loi = [];
// Danh sách riêng cho khối tổng kết cuối — xem lý do ở khối in cuối file:
// "không tải được" đi qua cổng (exit code) y hệt "đã khớp", nên phải nổi bật
// lên bằng mắt thường chứ không được chìm giữa hàng trăm dòng log khác.
const khongTaiDs = [];
for (const f of readdirSync(DIR).filter((x) => x.endsWith(".json") && !x.startsWith("_"))) {
  const d = JSON.parse(readFileSync(join(DIR, f), "utf8"));
  const ds = d.trich_van_tich ?? [];
  if (!ds.length || (loc && !d.id.includes(loc))) continue;
  for (const [i, t] of ds.entries()) {
    const url = (t.nguon_trich.match(/https?:\/\/\S+/) ?? [])[0];
    if (!url) { console.log(`⏭️  ${d.id}[${i}] nguon_trich không có URL — kiểm tay`); continue; }
    const van = tai(url);
    if (!van) {
      khongTai++;
      khongTaiDs.push(`${d.id}[${i}] — ${url}`);
      console.log(`⚠️  ${d.id}[${i}] không tải được ${url}`);
      continue;
    }
    const q = loiDau(chuan(t.doan));
    if (van.includes(q)) { dat++; continue; }

    // Hai dấu biên tập HỢP LỆ, phải tách ra rồi mới so từng mảnh:
    //   «/» — xuống dòng của câu đối, thơ, hịch (nguồn in liền một dòng);
    //   «…» — chỗ người soạn lược bớt cho gọn.
    // Không tách thì mọi trích thơ đều báo lệch, mà lỗi nằm ở phép đo chứ
    // không ở dữ liệu: Bình Ngô đại cáo, câu đối Kiếp Bạc, lời hiểu dụ Quang
    // Trung đều gãy đúng tại dấu «/» ngay sau vế đầu.
    // `...` gõ bằng ba chấm ASCII cũng là dấu lược, y hệt «…» — bản đầu chỉ
    // tách «…» nên bach-dang-981 và nam-ky-khoi-nghia-1940 báo lệch oan.
    const manh = q.split(/\s*(?:[/…]+|\.{2,})\s*/).map(loiDau).filter((x) => x.length >= 15);
    if (manh.length > 1 && manh.every((m) => van.includes(m))) {
      dat++;
      console.log(`✂️  ${d.id}[${i}] khớp trọn ${manh.length} vế (tách theo dấu lược / xuống dòng)`);
      continue;
    }

    /**
     * Chốt cuối: tách theo CÂU rồi đòi mọi câu ≥25 ký tự phải có nguyên văn
     * trên trang.
     *
     * Vì sao vẫn nghiêm: mỗi câu có nghĩa vẫn phải khớp từng chữ; thứ được
     * tha chỉ là cách người soạn NỐI các câu lại — nhãn biên tập («Phiên âm:»,
     * «Dịch thơ:»), chỗ lược, hay hai câu lấy cách nhau trong bài.
     * Ca thật đã gặp: `ham-tu-chuong-duong-1285` ghép phiên âm Hán–Việt với
     * bản dịch thơ trong một đoạn — cả bốn câu đều có trên trang cand.vn, chỉ
     * là không nằm liền nhau.
     */
    const cau = q.split(/(?<=[.!?])\s+|\s*:\s*/).map(loiDau).filter((x) => x.length >= 25);
    if (cau.length > 1 && cau.every((m) => van.includes(m))) {
      dat++;
      console.log(`📎 ${d.id}[${i}] khớp trọn ${cau.length} câu (đoạn ghép từ nhiều chỗ trong bài)`);
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

// Khối tổng kết CUỐI, tách bạch khỏi log — KHÔNG lẫn vào exit code.
//
// 🔴 VÌ SAO in khối riêng thay vì tin vào dòng ⚠️ rải trong log: "không tải
// được" đi qua cổng (process.exit) y hệt "đã khớp" — script chỉ đỏ khi có
// "lệch" thật (xem lý do ở đầu file: cổng cần chạy tay, đỏ vì rớt mạng sẽ
// khiến người soát hết tin cổng). Nghĩa là một đoạn CHƯA từng được máy đối
// chiếu có thể lặng lẽ trôi qua như một đoạn ĐÃ kiểm đúng nếu người đọc chỉ
// liếc dòng tổng "lệch 0" mà không đọc hết log. Khối này buộc phải đập vào
// mắt, liệt kê đích danh từng mục, để người soát biết đây là việc CÒN NỢ chứ
// không phải việc đã xong.
if (khongTaiDs.length) {
  const vach = "═".repeat(72);
  console.log(`\n${vach}`);
  console.log(`⚠️  ${khongTaiDs.length} ĐOẠN CHƯA ĐƯỢC MÁY ĐỐI CHIẾU (trang không tải được)`);
  console.log(`    Đây KHÔNG phải bằng chứng đoạn sai, cũng KHÔNG phải bằng chứng đoạn`);
  console.log(`    đúng — máy đơn giản là chưa xác nhận được. Người soát phải tự mở`);
  console.log(`    từng URL dưới đây và đối chiếu bằng mắt trước khi coi là đã kiểm:`);
  for (const x of khongTaiDs) console.log(`    · ${x}`);
  console.log(vach);
}

// Dọn cookie jar tạm — không để lại rác trong thư mục temp của hệ thống.
try { rmSync(COOKIE_JAR, { force: true }); } catch {}

process.exit(hong ? 1 : 0);
