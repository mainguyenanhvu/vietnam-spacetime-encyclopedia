// Mốc lịch sử đính lên thanh thời gian.
//
// public/data/timeline/moc-lich-su.json đã có 62 mốc nhưng trước nay không
// module nào đọc tới — dữ liệu nằm không. Chỗ này nối nó vào thanh trượt:
// mỗi mốc thành một vạch đứng đặt đúng vị trí năm của nó, và khi kéo thanh
// trượt thì hiện một note nhỏ ngay phía trên giới thiệu mốc trong thời kỳ đó.
//
// ── ĐỢT SỬA 2026-08-25 · hai lỗi đo được, không phải cảm nhận ────────────
// (a) 201 mốc chỉ có 124 VỊ TRÍ PIXEL khác nhau trên rãnh 1136px, 160/200
//     khoảng cách dưới 6px. Vạch nằm sau trong DOM ăn cú bấm, nên phần lớn
//     mốc KHÔNG bấm tới được. Nay gom thành CỤM: mỗi vạch cách nhau tối
//     thiểu KHOANG_TOI_THIEU px, và ô chọn trong note đi tới mọi mốc.
// (b) Thanh trượt chỉ có 13 nấc mà kho có 201 mốc → 83 mốc cùng rơi vào nấc
//     "Đại Việt". Bấm mốc Ngọc Hồi – Đống Đa (1789, Tây Sơn) mà nhãn hiện
//     "Đại Việt · Lê sơ — cương vực ~1490" là NÓI SAI, không chỉ là không
//     đổi. Không bịa thêm nấc: nay note tự khai triều đại THẬT của năm đó
//     (đọc nien-hieu.json) và khai luôn bản đồ đang hiện cương vực nào.
//
// 🔴 Vì sao phải có bảng `namKy` truyền từ ngoài vào: thanh trượt đánh chỉ số
// theo THỜI KỲ (0..12), không theo năm. Muốn đặt năm 1288 vào đúng chỗ thì
// phải biết mỗi thời kỳ chiếm đoạn năm nào trên rãnh. Bảng đó là RANH GIỚI
// PHÂN ĐOẠN của thanh trượt, KHÔNG phải lời khẳng định về niên đại của từng
// nhà nước — niên đại thật nằm ở nhãn thời kỳ (PERIODS[i].nhan).

import { esc } from "./util/html";
import { escVan } from "./popup-noi-dung";
import { fetchJson } from "./util/fetch";
import { str, num, oneOf, rec, itemsOf } from "./types/parse";

const LOAI = [
  "trieu-dai",
  "khoi-nghia",
  "khang-chien",
  "tran-danh",
  "tac-pham",
  "su-kien",
] as const;
type LoaiMoc = (typeof LOAI)[number];

const NHAN_LOAI: Record<LoaiMoc, string> = {
  "trieu-dai": "Triều đại",
  "khoi-nghia": "Khởi nghĩa",
  "khang-chien": "Kháng chiến",
  "tran-danh": "Trận đánh",
  "tac-pham": "Tác phẩm",
  "su-kien": "Sự kiện",
};

/** Một lát niên hiệu: triều đại + vua + niên hiệu, kèm đoạn năm. */
interface NienHieu {
  trieu_dai: string;
  vua: string;
  nien_hieu: string;
  tu_nam: number;
  den_nam: number;
}

const parseNienHieu = (raw: unknown): NienHieu => {
  const r = rec(raw);
  return {
    trieu_dai: str(r.trieu_dai),
    vua: str(r.vua),
    // `nien_hieu` có thể là null trong dữ liệu (thời truyền thuyết) — str() lo.
    nien_hieu: str(r.nien_hieu),
    tu_nam: num(r.tu_nam) ?? 0,
    den_nam: num(r.den_nam) ?? 0,
  };
};

interface Moc {
  id: string;
  nam: number;
  nam_hien_thi: string;
  ten: string;
  loai: LoaiMoc;
  mo_ta: string;
  ghi_chu: string;
  nguon: string;
}

const parseMoc = (raw: unknown): Moc => {
  const r = rec(raw);
  return {
    id: str(r.id),
    nam: num(r.nam) ?? 0,
    // `nam_hien_thi` là chuỗi vì có "179 TCN", "thế kỷ X" — đừng ép về số.
    nam_hien_thi: str(r.nam_hien_thi) || str(r.nam),
    ten: str(r.ten),
    loai: oneOf(r.loai, LOAI, "su-kien"),
    mo_ta: str(r.mo_ta),
    ghi_chu: str(r.ghi_chu),
    // Chỉ hiện nguồn đầu — note là chỗ giới thiệu nhanh, không phải thư mục.
    nguon: str((Array.isArray(r.nguon) ? r.nguon[0] : r.nguon) ?? ""),
  };
};

let DS: Moc[] = [];
/** Chỉ số thời kỳ của từng mốc, tính sẵn 1 lần lúc nạp. */
let kyCuaMoc: number[] = [];
/** Vị trí 0..1 trên rãnh của từng mốc. */
let viTriMoc: number[] = [];

let NH: NienHieu[] = [];
/** Nhãn từng thời kỳ, để note khai được bản đồ đang hiện cái gì. */
let tenKy: string[] = [];

let namKy: number[] = [];
let namKet = 0;
let datPeriodNgoai: (i: number) => void = () => {};

let kyHienTai = -1;
let chiSoTrongKy = 0;
/** Handler bấm vạch chỉ gắn MỘT lần — veVach() nay chạy lại mỗi lần đổi bề ngang. */
let daGanClick = false;

/**
 * Năm → chỉ số thời kỳ chứa nó. Năm trước mốc đầu tiên kẹp về 0, sau mốc
 * cuối kẹp về thời kỳ cuối.
 */
function kyChuaNam(nam: number): number {
  for (let i = namKy.length - 1; i >= 0; i--) if (nam >= namKy[i]) return i;
  return 0;
}

/** Năm → vị trí 0..1 dọc rãnh thanh trượt. */
function viTriTheoNam(nam: number): number {
  const het = namKy.length - 1;
  if (het <= 0) return 0;
  const i = kyChuaNam(nam);
  const dau = namKy[i];
  const cuoi = i + 1 < namKy.length ? namKy[i + 1] : namKet;
  const phan = cuoi > dau ? (nam - dau) / (cuoi - dau) : 0;
  return Math.min(1, Math.max(0, (i + phan) / het));
}

/**
 * Mọi lát niên hiệu phủ năm `nam`.
 *
 * Trả về MẢNG chứ không phải một giá trị là có chủ ý: 1533–1592 nhà Mạc và
 * nhà Lê Trung Hưng cùng tồn tại, 1527–1592 lại chồng thêm nhà Lê sơ vừa mất.
 * Chọn một triều cho gọn là đúng cái lỗi bất biến #4 cấm.
 */
function nienHieuTaiNam(nam: number): NienHieu[] {
  return NH.filter((x) => nam >= x.tu_nam && nam <= x.den_nam);
}

/** Dòng "🏛️ triều đại · vua · niên hiệu" của riêng mốc, KHÔNG phải của bản đồ. */
function dongTrieuDai(nam: number): string {
  const lat = nienHieuTaiNam(nam);
  if (!lat.length) return "";
  // Gom theo triều: một triều có thể có nhiều niên hiệu phủ cùng năm.
  const theoTrieu = new Map<string, NienHieu[]>();
  for (const x of lat) {
    const cu = theoTrieu.get(x.trieu_dai);
    if (cu) cu.push(x);
    else theoTrieu.set(x.trieu_dai, [x]);
  }
  const phan = [...theoTrieu.entries()].map(([trieu, ds]) => {
    const chiTiet = ds
      .map((x) => [x.vua, x.nien_hieu ? `niên hiệu ${x.nien_hieu}` : ""].filter(Boolean).join(" · "))
      .filter(Boolean)
      .join(" / ");
    return `<b>${esc(trieu)}</b>${chiTiet ? ` — ${esc(chiTiet)}` : ""}`;
  });
  const songSong =
    theoTrieu.size > 1
      ? `<br/><span class="moc-song-song">⚠️ ${theoTrieu.size} triều song song trong năm này — chính sử chép cả hai, dự án không chọn một bên.</span>`
      : "";
  return `<p class="moc-trieu">🏛️ ${phan.join(" &nbsp;·&nbsp; ")}${songSong}</p>`;
}

/** Khoảng cách tối thiểu giữa hai vạch, tính bằng px. */
const KHOANG_TOI_THIEU = 7;

/** Một cụm vạch: các mốc quá sát nhau gộp về một vạch bấm được. */
interface Cum {
  dai: number[];
}

/**
 * Chia mốc thành cụm theo BỀ RỘNG THẬT của rãnh.
 *
 * `DS` đã sắp theo năm và `viTriTheoNam` đơn điệu không giảm theo năm, nên duyệt
 * tuần tự là đủ — không cần sắp lại theo pixel.
 */
function chiaCum(rong: number): Cum[] {
  const px = (i: number): number => 9.5 + viTriMoc[i] * (rong - 19);
  const ra: Cum[] = [];
  let dang: number[] = [];
  let xNeo = -Infinity;
  for (let i = 0; i < DS.length; i++) {
    if (dang.length && px(i) - xNeo < KHOANG_TOI_THIEU) {
      dang.push(i);
      continue;
    }
    if (dang.length) ra.push({ dai: dang });
    dang = [i];
    xNeo = px(i);
  }
  if (dang.length) ra.push({ dai: dang });
  return ra;
}

function veVach(): void {
  const host = document.getElementById("moc-ticks");
  if (!host) return;
  // Vạch là ĐỒ HOẠ TRANG TRÍ, không vào thứ tự tab: 62 nút tab qua được là
  // cực hình cho người dùng bàn phím. Mọi mốc vẫn tới được bằng bàn phím qua
  // thanh trượt (chọn thời kỳ) + hai nút ◂ ▸ trong note (chọn mốc trong kỳ) —
  // đây là ngoại lệ "điều khiển tương đương" của WCAG 2.5.8.
  const rong = host.getBoundingClientRect().width;
  // Rãnh chưa có bề ngang (panel còn ẩn) → để ResizeObserver gọi lại.
  if (rong < 40) return;
  host.innerHTML = chiaCum(rong)
    .map((c) => {
      const dau = c.dai[0];
      const m = DS[dau];
      const nhan = c.dai
        .slice(0, 6)
        .map((j) => `${DS[j].nam_hien_thi} — ${DS[j].ten}`)
        .join("\n");
      const them = c.dai.length > 6 ? `\n… và ${c.dai.length - 6} mốc nữa` : "";
      return `<span class="moc-tick" data-i="${dau}" data-n="${c.dai.length}" data-loai="${esc(m.loai)}"
        style="--x:${viTriMoc[dau].toFixed(4)}" title="${esc(nhan + them)}"></span>`;
    })
    .join("");
  if (daGanClick) return;
  daGanClick = true;
  host.addEventListener("click", (ev) => {
    const t = (ev.target as HTMLElement).closest<HTMLElement>(".moc-tick");
    if (!t) return;
    const i = Number(t.dataset.i);
    if (!Number.isFinite(i) || !DS[i]) return;
    const ky = kyCuaMoc[i];
    datPeriodNgoai(ky);
    // datPeriodNgoai đã gọi capNhatMoc và đặt chiSoTrongKy = 0; chỉnh lại cho
    // đúng mốc vừa bấm. Vạch nay là CỤM, `data-i` là mốc đầu cụm — các mốc
    // còn lại trong cụm tới được bằng ô chọn/hai nút ◂ ▸ trong note.
    const trongKy = DS.map((_, j) => j).filter((j) => kyCuaMoc[j] === ky);
    chiSoTrongKy = Math.max(0, trongKy.indexOf(i));
    veNote(true);
  });
}

function mocTrongKy(ky: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < DS.length; i++) if (kyCuaMoc[i] === ky) out.push(i);
  return out;
}

/**
 * Dòng khai BẢN ĐỒ đang hiện cương vực nào.
 *
 * Đây là lời vá cho chỗ vênh không tránh được: thanh trượt có 13 nấc, kho có
 * 201 mốc. Mốc năm 1789 nằm cùng nấc với cương vực ~1490 vì dự án CHƯA có bản
 * đồ cương vực năm 1789 — nói thẳng ra vẫn hơn để người đọc tưởng bản đồ đang
 * vẽ đúng năm đó.
 */
function dongBanDo(): string {
  const ten = tenKy[kyHienTai];
  if (!ten) return "";
  return `<p class="moc-ban-do">🗺️ Bản đồ đang hiện: ${esc(ten)}</p>`;
}

function veNote(hien: boolean): void {
  const note = document.getElementById("moc-note");
  if (!note) return;
  const trongKy = mocTrongKy(kyHienTai);
  if (!hien || trongKy.length === 0) {
    note.hidden = true;
    note.innerHTML = "";
    danhDauVachDangChon(-1);
    return;
  }
  chiSoTrongKy = Math.min(Math.max(0, chiSoTrongKy), trongKy.length - 1);
  const iMoc = trongKy[chiSoTrongKy];
  const m = DS[iMoc];
  const nhieu = trongKy.length > 1;
  note.hidden = false;
  // Ô chọn: đường đi tới MỌI mốc của thời kỳ trong một cử chỉ. Hai nút ◂ ▸
  // một mình là không đủ — thời kỳ Đại Việt có 83 mốc, bấm ▸ 82 lần thì thôi.
  const oChon = nhieu
    ? `<select class="moc-chon" aria-label="Chọn mốc trong thời kỳ">${trongKy
        .map(
          (j, k) =>
            `<option value="${k}"${k === chiSoTrongKy ? " selected" : ""}>${esc(
              DS[j].nam_hien_thi,
            )} — ${esc(DS[j].ten)}</option>`,
        )
        .join("")}</select>`
    : "";
  note.innerHTML = `
    <div class="moc-dau">
      <span class="moc-chip" data-loai="${esc(m.loai)}">${esc(NHAN_LOAI[m.loai])}</span>
      <span class="moc-nam">${esc(m.nam_hien_thi)}</span>
      ${
        nhieu
          ? `<span class="moc-dieu-huong">
               <button type="button" class="moc-nut" data-buoc="-1" aria-label="Mốc trước">◂</button>
               <span class="moc-dem">${chiSoTrongKy + 1}/${trongKy.length}</span>
               <button type="button" class="moc-nut" data-buoc="1" aria-label="Mốc sau">▸</button>
             </span>`
          : ""
      }
      <button type="button" class="moc-dong" aria-label="Đóng giới thiệu mốc">×</button>
    </div>
    ${oChon}
    <p class="moc-ten">${esc(m.ten)}</p>
    ${dongTrieuDai(m.nam)}
    ${m.mo_ta ? `<p class="moc-mo-ta">${escVan(m.mo_ta)}</p>` : ""}
    ${
      // `ghi_chu` là chỗ ghi hai nguồn chính thống vênh nhau. Đây là nội dung
      // phải HIỆN RA cho người đọc, không phải ghi chú nội bộ (quy tắc #4).
      m.ghi_chu ? `<p class="moc-venh">⚠️ ${escVan(m.ghi_chu)}</p>` : ""
    }
    ${m.nguon ? `<p class="moc-nguon">${esc(m.nguon)}</p>` : ""}
    ${dongBanDo()}`;
  danhDauVachDangChon(iMoc);
}

function danhDauVachDangChon(iMoc: number): void {
  const host = document.getElementById("moc-ticks");
  if (!host) return;
  host.querySelectorAll<HTMLElement>(".moc-tick.dang-chon").forEach((el) =>
    el.classList.remove("dang-chon"),
  );
  if (iMoc >= 0)
    host.querySelector<HTMLElement>(`.moc-tick[data-i="${iMoc}"]`)?.classList.add("dang-chon");
}

/**
 * Gọi mỗi lần thời kỳ đổi. `hien` = false lúc khởi động để note không tự bung
 * ra che bản đồ khi người dùng chưa đụng vào thanh trượt.
 */
export function capNhatMoc(period: number, hien: boolean): void {
  if (period !== kyHienTai) chiSoTrongKy = 0;
  kyHienTai = period;
  veNote(hien);
}

export interface CauHinhMoc {
  /** Năm bắt đầu mỗi đoạn trên rãnh — cùng số phần tử với PERIODS. */
  namKy: number[];
  /** Nhãn từng thời kỳ (PERIODS[i].nhan) — note dùng để khai bản đồ đang hiện gì. */
  tenKy: string[];
  /** Năm khép lại đoạn cuối cùng. */
  namKet: number;
  datPeriod: (i: number) => void;
}

export async function initMocLichSu(cfg: CauHinhMoc): Promise<void> {
  namKy = cfg.namKy;
  tenKy = cfg.tenKy;
  namKet = cfg.namKet;
  datPeriodNgoai = cfg.datPeriod;

  // Niên hiệu nạp SONG SONG và không chặn: thiếu nó thì note mất một dòng,
  // không đáng để mốc lịch sử không hiện được.
  void fetchJson("data/timeline/nien-hieu.json", itemsOf(parseNienHieu)).then((n) => {
    if (n) NH = n.items;
  });

  const d = await fetchJson("data/timeline/moc-lich-su.json", itemsOf(parseMoc));
  if (!d) return;
  DS = d.items.filter((m) => m.id && m.ten);
  DS.sort((a, b) => a.nam - b.nam);
  kyCuaMoc = DS.map((m) => kyChuaNam(m.nam));
  viTriMoc = DS.map((m) => viTriTheoNam(m.nam));

  veVach();
  // Chia cụm phụ thuộc BỀ RỘNG THẬT của rãnh, nên phải vẽ lại khi bề rộng đổi:
  // mở/thu bảng lớp, xoay máy, đổi cỡ cửa sổ. Không có cái này thì cụm tính
  // theo bề rộng lúc khởi động sẽ sai suốt phần đời còn lại của trang.
  const rIndicator = document.getElementById("moc-ticks");
  if (rIndicator && typeof ResizeObserver !== "undefined") {
    let rongCu = 0;
    new ResizeObserver(() => {
      const r = Math.round(rIndicator.getBoundingClientRect().width);
      // Ngưỡng 4px chặn vòng lặp vẽ-lại vì sai số làm tròn.
      if (Math.abs(r - rongCu) < 4) return;
      rongCu = r;
      veVach();
      if (!document.getElementById("moc-note")?.hidden) veNote(true);
    }).observe(rIndicator);
  }

  document.getElementById("moc-note")?.addEventListener("change", (ev) => {
    const o = (ev.target as HTMLElement).closest<HTMLSelectElement>(".moc-chon");
    if (!o) return;
    const k = Number(o.value);
    if (!Number.isFinite(k)) return;
    chiSoTrongKy = k;
    veNote(true);
  });

  document.getElementById("moc-note")?.addEventListener("click", (ev) => {
    const el = ev.target as HTMLElement;
    if (el.closest(".moc-dong")) {
      veNote(false);
      return;
    }
    const nut = el.closest<HTMLElement>(".moc-nut");
    if (!nut) return;
    const trongKy = mocTrongKy(kyHienTai);
    if (!trongKy.length) return;
    const buoc = Number(nut.dataset.buoc) || 0;
    chiSoTrongKy = (chiSoTrongKy + buoc + trongKy.length) % trongKy.length;
    veNote(true);
  });
}
