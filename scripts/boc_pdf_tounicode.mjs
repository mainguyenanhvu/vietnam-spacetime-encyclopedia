// Bóc chữ ra khỏi PDF văn bản mà KHÔNG cài thêm gói nào — chỉ dùng zlib có sẵn.
//
// Chạy: node scripts/boc_pdf_tounicode.mjs <tep.pdf> [tep-ra.txt]
//
// Vì sao cần: PDF sách của các NXB thường nhúng font CID — chuỗi trong content
// stream là mã glyph <0030 00AF ...> chứ không phải Unicode, nên mọi cách bóc
// thô đều ra ký tự rác. Script này gom bảng /ToUnicode của các font rồi dịch
// ngược. Bản «Nhật ký trong tù» (NXB Chính trị quốc gia Sự thật, 2015) dùng
// đường này để lấy 62 bài nạp ngày 2026-08-04.
//
// Ba cái bẫy đã trả giá để biết, đừng gỡ ra:
//  1. Object chứa bảng /ToUnicode không tự khai gì trong dict — phải bung hết
//     stream rồi mới biết cái nào là cmap.
//  2. KHÔNG xuống dòng theo mọi lệnh định vị chữ. Chữ trong ngoặc kép của sách
//     in bằng font khác, mỗi lần đổi font là một lệnh Td ngay giữa câu — ngắt
//     dòng ở đó thì câu thơ vỡ làm đôi. Chỉ ngắt khi toạ độ Y đổi; T* ép ngắt.
//  3. Số chú thích chân trang in xen giữa câu; khâu cắt câu ở tầng trên phải
//     nối lại, script này cố ý giữ nguyên hiện trạng của trang.
import { readFileSync, writeFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const [tepVao, tepRa = "pdf-boc.txt"] = process.argv.slice(2);
if (!tepVao) {
  console.error("Thiếu tham số. Dùng: node scripts/boc_pdf_tounicode.mjs <tep.pdf> [tep-ra.txt]");
  process.exit(1);
}
const buf = readFileSync(tepVao);
const lat = buf.toString("latin1");

/** Bung stream của một object nếu bung được, trả latin1. */
function streamCua(vitri) {
  const s = lat.indexOf("stream", vitri);
  if (s < 0) return null;
  let d = s + 6;
  if (buf[d] === 0x0d) d++;
  if (buf[d] === 0x0a) d++;
  const e = lat.indexOf("endstream", d);
  if (e < 0) return null;
  const tho = buf.subarray(d, e);
  try {
    return inflateSync(tho).toString("latin1");
  } catch {
    return tho.toString("latin1");
  }
}

// --- 1. Gom mọi bảng ToUnicode thành một bảng chung.
// Gộp chung được vì cả file dùng cùng bộ font nhúng; chỗ nào đụng nhau thì giữ
// bản gặp trước và đếm lại để biết có nguy cơ sai không.
const anhXa = new Map();
let dung = 0, soBang = 0;
const reObj = /(\d+) 0 obj/g;
let m;
const viTriObj = new Map();
while ((m = reObj.exec(lat))) viTriObj.set(m[1], m.index);

const hexRa = (h) => {
  let s = "";
  for (let i = 0; i + 3 < h.length + 1; i += 4) s += String.fromCharCode(parseInt(h.slice(i, i + 4), 16));
  return s;
};

// Object chứa bảng ToUnicode KHÔNG tự khai gì trong dict của nó (chỉ có
// /Filter /Length), nên không lọc trước được — phải bung hết rồi mới biết.
const dsStream = new Map();
for (const [id, vt] of viTriObj) dsStream.set(id, streamCua(vt));

for (const [, st] of dsStream) {
  if (!st || !/begincmap|beginbf/.test(st)) continue;
  soBang++;
  for (const blk of st.match(/beginbfchar([\s\S]*?)endbfchar/g) ?? []) {
    for (const [, a, b] of blk.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      const k = parseInt(a, 16);
      const v = hexRa(b);
      if (anhXa.has(k) && anhXa.get(k) !== v) dung++;
      else anhXa.set(k, v);
    }
  }
  for (const blk of st.match(/beginbfrange([\s\S]*?)endbfrange/g) ?? []) {
    for (const [, a, b, c] of blk.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      const lo = parseInt(a, 16), hi = parseInt(b, 16), goc = parseInt(c, 16);
      for (let k = lo; k <= hi && k - lo < 65536; k++) {
        const v = String.fromCharCode(goc + (k - lo));
        if (anhXa.has(k) && anhXa.get(k) !== v) dung++;
        else anhXa.set(k, v);
      }
    }
  }
}
console.log(`bảng ToUnicode: ${soBang} · mã ánh xạ được: ${anhXa.size} · đụng độ: ${dung}`);

// --- 2. Duyệt content stream, dịch chuỗi hex qua bảng.
const doi = (hex) => {
  let s = "";
  for (let i = 0; i + 1 < hex.length; i += 4) {
    const k = parseInt(hex.slice(i, i + 4), 16);
    s += anhXa.get(k) ?? "";
  }
  return s;
};

const trang = [];
for (const [, st] of dsStream) {
  if (!st || !/\bTf\b/.test(st) || !/Tj|TJ/.test(st)) continue;
  let ra = "";
  // KHÔNG xuống dòng theo mọi lệnh định vị. Chữ trong ngoặc kép của sách được
  // in bằng font khác, mỗi lần đổi font là một lệnh Td mới NGAY TRONG một câu —
  // cắt dòng ở đó thì câu thơ vỡ làm đôi (đã đo được ở bài 32, 39, 50…).
  // Chỉ xuống dòng khi TOẠ ĐỘ Y thật sự đổi.
  let y = null, yTruoc = null, epXuong = false;
  const soCuoi = (s, n) => {
    const t = s.trim().split(/\s+/).map(Number);
    return t.slice(-n);
  };
  for (const tok of st.matchAll(/([-\d.\s]*)(Tm|Td|TD|T\*)|(<[0-9A-Fa-f\s]*>|\[[^\]]*\])\s*(Tj|TJ)|(BT|ET)/g)) {
    if (tok[2]) {
      // T* = "xuống dòng kế" theo khoảng cách dòng (TL) mà ta không theo dõi,
      // nên không so toạ độ được — coi thẳng là ngắt dòng, đúng nghĩa của nó.
      if (tok[2] === "T*") { epXuong = true; continue; }
      if (tok[2] === "Tm") y = soCuoi(tok[1], 6)[5];
      else { const [, ty] = soCuoi(tok[1], 2); if (Number.isFinite(ty)) y = (y ?? 0) + ty; }
      continue;
    }
    if (tok[5]) continue;
    const t = tok[3];
    if (!t) continue;
    let chu = "";
    if (t.startsWith("<")) chu = doi(t.replace(/[<>\s]/g, ""));
    else for (const h of t.matchAll(/<([0-9A-Fa-f\s]*)>/g)) chu += doi(h[1].replace(/\s/g, ""));
    if (!chu) continue;
    if (epXuong || (yTruoc !== null && y !== null && Math.abs(y - yTruoc) > 1)) ra += "\n";
    epXuong = false;
    ra += chu;
    yTruoc = y;
  }
  ra = ra.replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n").trim();
  if (ra.length > 20) trang.push(ra);
}
const toan = trang.join("\n\n=== TRANG ===\n\n");
writeFileSync(tepRa, toan, "utf8");
console.log(`bóc được ${trang.length} trang có chữ · ${toan.length} ký tự → ${tepRa}`);
console.log("\n--- mẫu 20 dòng ---");
console.log(toan.split("\n").slice(0, 20).join("\n"));
