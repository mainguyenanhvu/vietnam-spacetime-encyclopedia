// Mốc lịch sử đính lên thanh thời gian.
//
// public/data/timeline/moc-lich-su.json đã có 62 mốc nhưng trước nay không
// module nào đọc tới — dữ liệu nằm không. Chỗ này nối nó vào thanh trượt:
// mỗi mốc thành một vạch đứng đặt đúng vị trí năm của nó, và khi kéo thanh
// trượt thì hiện một note nhỏ ngay phía trên giới thiệu mốc trong thời kỳ đó.
//
// 🔴 Vì sao phải có bảng `namKy` truyền từ ngoài vào: thanh trượt đánh chỉ số
// theo THỜI KỲ (0..12), không theo năm. Muốn đặt năm 1288 vào đúng chỗ thì
// phải biết mỗi thời kỳ chiếm đoạn năm nào trên rãnh. Bảng đó là RANH GIỚI
// PHÂN ĐOẠN của thanh trượt, KHÔNG phải lời khẳng định về niên đại của từng
// nhà nước — niên đại thật nằm ở nhãn thời kỳ (PERIODS[i].nhan).

import { esc } from "./util/html";
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

let namKy: number[] = [];
let namKet = 0;
let datPeriodNgoai: (i: number) => void = () => {};

let kyHienTai = -1;
let chiSoTrongKy = 0;

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

function veVach(): void {
  const host = document.getElementById("moc-ticks");
  if (!host) return;
  // Vạch là ĐỒ HOẠ TRANG TRÍ, không vào thứ tự tab: 62 nút tab qua được là
  // cực hình cho người dùng bàn phím. Mọi mốc vẫn tới được bằng bàn phím qua
  // thanh trượt (chọn thời kỳ) + hai nút ◂ ▸ trong note (chọn mốc trong kỳ) —
  // đây là ngoại lệ "điều khiển tương đương" của WCAG 2.5.8.
  host.innerHTML = DS.map((m, i) => {
    const nhan = `${m.nam_hien_thi} — ${m.ten}`;
    return `<span class="moc-tick" data-i="${i}" data-loai="${esc(m.loai)}"
      style="--x:${viTriMoc[i].toFixed(4)}" title="${esc(nhan)}"></span>`;
  }).join("");
  host.addEventListener("click", (ev) => {
    const t = (ev.target as HTMLElement).closest<HTMLElement>(".moc-tick");
    if (!t) return;
    const i = Number(t.dataset.i);
    if (!Number.isFinite(i) || !DS[i]) return;
    const ky = kyCuaMoc[i];
    datPeriodNgoai(ky);
    // datPeriodNgoai đã gọi capNhatMoc và đặt chiSoTrongKy = 0; chỉnh lại cho
    // đúng mốc vừa bấm.
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
    <p class="moc-ten">${esc(m.ten)}</p>
    ${m.mo_ta ? `<p class="moc-mo-ta">${esc(m.mo_ta)}</p>` : ""}
    ${
      // `ghi_chu` là chỗ ghi hai nguồn chính thống vênh nhau. Đây là nội dung
      // phải HIỆN RA cho người đọc, không phải ghi chú nội bộ (quy tắc #4).
      m.ghi_chu ? `<p class="moc-venh">⚠️ ${esc(m.ghi_chu)}</p>` : ""
    }
    ${m.nguon ? `<p class="moc-nguon">${esc(m.nguon)}</p>` : ""}`;
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
  /** Năm khép lại đoạn cuối cùng. */
  namKet: number;
  datPeriod: (i: number) => void;
}

export async function initMocLichSu(cfg: CauHinhMoc): Promise<void> {
  namKy = cfg.namKy;
  namKet = cfg.namKet;
  datPeriodNgoai = cfg.datPeriod;

  const d = await fetchJson("data/timeline/moc-lich-su.json", itemsOf(parseMoc));
  if (!d) return;
  DS = d.items.filter((m) => m.id && m.ten);
  DS.sort((a, b) => a.nam - b.nam);
  kyCuaMoc = DS.map((m) => kyChuaNam(m.nam));
  viTriMoc = DS.map((m) => viTriTheoNam(m.nam));

  veVach();

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
