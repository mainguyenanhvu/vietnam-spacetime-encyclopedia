// Hub «VIỆT NAM TRONG TÔI» — 2 tab:
//  1) Danh nhân & Phim tài liệu (lọc theo tỉnh) + mục quốc gia (Bác Hồ, Đại
//     tướng Võ Nguyên Giáp, Mẹ VN Anh hùng, Anh hùng LLVTND, Ngô Quyền, Hùng Vương)
//  2) Nhạc yêu nước / quê hương đương đại (playlist «Việt Nam trong tôi»)
//
// Module tự chứa: initQuocGia() tự tạo nút + panel bằng JS. Nhúng youtube-nocookie
// (chỉ khi youtube_id khớp 11 ký tự). iframe loading="lazy" + chỉ render tỉnh đang
// chọn để không tải hàng trăm player cùng lúc.

interface Phim {
  tinh: string;
  ten: string;
  youtube_id: string;
  kenh_loai: string;
  trang_thai: string;
  figure_id?: string;
}
interface PhimQuocGia {
  chu_de?: string;
  ten: string;
  youtube_id: string;
  kenh_loai: string;
  figure_id?: string;
}
interface PhimData {
  ghi_chu?: string;
  quoc_gia?: PhimQuocGia[];
  danh_nhan: Phim[];
}
interface NhacPhienBan { the_hien: string; youtube_id: string; kenh: string; kenh_loai: string }
interface NhacItem {
  id: string;
  ten: string;
  the_loai?: string;
  the_hien?: string;
  ghi_chu?: string;
  youtube_id?: string;
  kenh?: string;
  kenh_loai?: string;
  phien_ban?: NhacPhienBan[];
}
interface NhacData { ghi_chu?: string; items: NhacItem[] }

const PHIM_URL = `${import.meta.env.BASE_URL}data/documentaries/phim-tai-lieu.json`;
const NHAC_URL = `${import.meta.env.BASE_URL}data/media/nhac-yeu-nuoc.json`;

// Tên hiển thị 34 tỉnh (chỉ để hiển thị — danh nhân gom theo slug).
const TINH_TEN: Record<string, string> = {
  "ha-noi": "Hà Nội", "bac-ninh": "Bắc Ninh", "cao-bang": "Cao Bằng", "lang-son": "Lạng Sơn",
  "thai-nguyen": "Thái Nguyên", "tuyen-quang": "Tuyên Quang", "lao-cai": "Lào Cai", "lai-chau": "Lai Châu",
  "dien-bien": "Điện Biên", "son-la": "Sơn La", "phu-tho": "Phú Thọ", "hai-phong": "Hải Phòng",
  "hung-yen": "Hưng Yên", "ninh-binh": "Ninh Bình", "quang-ninh": "Quảng Ninh", "thanh-hoa": "Thanh Hoá",
  "nghe-an": "Nghệ An", "ha-tinh": "Hà Tĩnh", "quang-tri": "Quảng Trị", "hue": "Huế",
  "da-nang": "Đà Nẵng", "quang-ngai": "Quảng Ngãi", "gia-lai": "Gia Lai", "khanh-hoa": "Khánh Hòa",
  "dak-lak": "Đắk Lắk", "lam-dong": "Lâm Đồng", "tay-ninh": "Tây Ninh", "dong-nai": "Đồng Nai",
  "thanh-pho-ho-chi-minh": "TP Hồ Chí Minh", "vinh-long": "Vĩnh Long", "dong-thap": "Đồng Tháp",
  "can-tho": "Cần Thơ", "an-giang": "An Giang", "ca-mau": "Cà Mau",
};

const KENH_BADGE: Record<string, string> = {
  state: "🏛️ Đài/cơ quan nhà nước",
  verified: "✅ Kênh tích xanh",
  "official-name": "🎤 Kênh «Official»",
  topic: "🎵 Art Track",
  khac: "⚠️ Chưa rõ chính chủ",
};

const YT = /^[A-Za-z0-9_-]{11}$/;

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function embed(vid: string, title: string): string {
  if (!YT.test(vid)) return `<p class="muted">⚠️ Video không hợp lệ.</p>`;
  return `<div class="qg-embed"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/${vid}" title="${esc(title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
}

function badge(kenh_loai: string, draft?: boolean): string {
  const k = KENH_BADGE[kenh_loai] ?? "";
  return `<div class="qg-badges">${k ? `<span class="qg-badge qg-badge-${esc(kenh_loai)}">${k}</span>` : ""}${
    draft ? `<span class="qg-badge qg-draft">Bản nháp — chờ duyệt</span>` : ""
  }</div>`;
}

let phim: PhimData | null = null;
let nhac: NhacData | null = null;
let phimByTinh: Map<string, Phim[]> | null = null;

function buildIndex(): void {
  if (!phim) return;
  phimByTinh = new Map();
  for (const d of phim.danh_nhan) {
    const arr = phimByTinh.get(d.tinh) ?? [];
    arr.push(d);
    phimByTinh.set(d.tinh, arr);
  }
}

function phimCard(ten: string, vid: string, kenh_loai: string, draft: boolean): string {
  return `<article class="qg-card">
    <h4>${esc(ten)}</h4>
    ${badge(kenh_loai, draft)}
    ${embed(vid, ten)}
  </article>`;
}

function renderQuocGiaSection(): string {
  if (!phim?.quoc_gia?.length) return "";
  const cards = phim.quoc_gia
    .filter((q) => YT.test(q.youtube_id))
    .map((q) => phimCard(q.ten, q.youtube_id, q.kenh_loai, true))
    .join("");
  return `<section class="qg-section"><h3>🇻🇳 Danh nhân & chủ đề tiêu biểu toàn quốc</h3><div class="qg-grid">${cards}</div></section>`;
}

function renderTinh(slug: string): string {
  const list = phimByTinh?.get(slug) ?? [];
  if (!list.length) return `<p class="muted">Chưa có phim tài liệu cho tỉnh này.</p>`;
  const cards = list.map((d) => phimCard(d.ten, d.youtube_id, d.kenh_loai, d.trang_thai === "draft")).join("");
  return `<div class="qg-grid">${cards}</div>`;
}

function renderPhimTab(host: HTMLElement): void {
  const provinces = Object.keys(TINH_TEN)
    .filter((s) => (phimByTinh?.get(s)?.length ?? 0) > 0)
    .sort((a, b) => TINH_TEN[a].localeCompare(TINH_TEN[b], "vi"));
  const opts = provinces
    .map((s) => `<option value="${s}">${esc(TINH_TEN[s])} (${phimByTinh?.get(s)?.length ?? 0})</option>`)
    .join("");
  host.innerHTML = `
    <p class="qg-note">Phim tài liệu do bên thứ ba sản xuất, nhúng từ YouTube. Bản nháp — chờ người duyệt xác thực. Chủ quyền Hoàng Sa & Trường Sa của Việt Nam.</p>
    ${renderQuocGiaSection()}
    <section class="qg-section">
      <h3>🎖️ Danh nhân theo tỉnh</h3>
      <label class="qg-select-label">Chọn tỉnh:
        <select id="qg-tinh-select"><option value="">— Chọn tỉnh —</option>${opts}</select>
      </label>
      <div id="qg-tinh-content"><p class="muted">Chọn một tỉnh để xem phim tài liệu danh nhân.</p></div>
    </section>`;
  const sel = host.querySelector<HTMLSelectElement>("#qg-tinh-select");
  const content = host.querySelector<HTMLElement>("#qg-tinh-content");
  sel?.addEventListener("change", () => {
    if (!content) return;
    content.innerHTML = sel.value ? renderTinh(sel.value) : `<p class="muted">Chọn một tỉnh để xem phim tài liệu danh nhân.</p>`;
  });
}

function nhacCard(it: NhacItem): string {
  const head = `<h4>${esc(it.ten)}${it.the_hien && it.the_hien !== "—" ? ` <span class="muted">— ${esc(it.the_hien)}</span>` : ""}</h4>`;
  if (Array.isArray(it.phien_ban) && it.phien_ban.length) {
    const vers = it.phien_ban
      .filter((p) => YT.test(p.youtube_id))
      .map((p) => `<div class="qg-version">${badge(p.kenh_loai)}<p class="qg-version-by">${esc(p.the_hien)}</p>${embed(p.youtube_id, it.ten + " — " + p.the_hien)}</div>`)
      .join("");
    return `<article class="qg-card qg-card-multi">${head}<p class="qg-multi-note">${it.phien_ban.length} phiên bản</p>${vers}</article>`;
  }
  if (it.youtube_id && YT.test(it.youtube_id)) {
    return `<article class="qg-card">${head}${badge(it.kenh_loai ?? "khac")}${embed(it.youtube_id, it.ten)}</article>`;
  }
  return "";
}

function renderNhacTab(host: HTMLElement): void {
  if (!nhac?.items?.length) {
    host.innerHTML = `<p class="muted">Chưa có dữ liệu nhạc.</p>`;
    return;
  }
  const cards = nhac.items.map(nhacCard).join("");
  host.innerHTML = `<p class="qg-note">Nguồn: playlist «Việt Nam trong tôi» (người dùng tuyển chọn). Chỉ nhúng, không chép lời (Điều 25 Luật SHTT).</p><div class="qg-grid">${cards}</div>`;
}

function closePanel(): void {
  const panel = document.getElementById("quocgia-panel");
  if (panel) panel.hidden = true;
}
function hideOtherPanels(): void {
  for (const id of ["game-panel", "quiz-panel", "story-panel", "library-panel", "olympia-panel", "battle-panel", "journey-panel"]) {
    const p = document.getElementById(id);
    if (p) p.hidden = true;
  }
}

function switchTab(which: "phim" | "nhac"): void {
  const body = document.getElementById("quocgia-body");
  if (!body) return;
  for (const t of ["phim", "nhac"]) {
    document.getElementById(`qg-tab-${t}`)?.classList.toggle("active", t === which);
  }
  if (which === "phim") renderPhimTab(body);
  else renderNhacTab(body);
}

async function loadAll(): Promise<void> {
  const body = document.getElementById("quocgia-body");
  if (body) body.innerHTML = `<p class="muted">Đang tải…</p>`;
  try {
    if (!phim) {
      const r = await fetch(PHIM_URL);
      if (r.ok) { phim = (await r.json()) as PhimData; buildIndex(); }
    }
    if (!nhac) {
      const r = await fetch(NHAC_URL);
      if (r.ok) nhac = (await r.json()) as NhacData;
    }
    switchTab("phim");
  } catch {
    if (body) body.innerHTML = `<p class="muted">⚠️ Chưa tải được dữ liệu — kiểm tra kết nối và thử lại.</p>`;
  }
}

function buildDom(): { btn: HTMLButtonElement } {
  const btn = document.createElement("button");
  btn.id = "quocgia-btn";
  btn.type = "button";
  btn.textContent = "🇻🇳 Việt Nam trong tôi";
  btn.title = "Danh nhân, phim tài liệu & nhạc yêu nước theo tỉnh";
  const nav = document.getElementById("topbar-nav");
  if (nav) nav.appendChild(btn);
  else document.body.appendChild(btn);

  const panel = document.createElement("aside");
  panel.id = "quocgia-panel";
  panel.hidden = true;
  panel.innerHTML = `
    <button id="quocgia-close" aria-label="Đóng">×</button>
    <div class="qg-tabs">
      <button type="button" id="qg-tab-phim" class="qg-tab active">🎖️ Danh nhân & Phim tài liệu</button>
      <button type="button" id="qg-tab-nhac" class="qg-tab">🎵 Nhạc yêu nước</button>
    </div>
    <div id="quocgia-body"></div>`;
  const app = document.getElementById("app") ?? document.body;
  app.appendChild(panel);
  return { btn };
}

export function initQuocGia(): void {
  if (document.getElementById("quocgia-panel")) return;
  const { btn } = buildDom();
  btn.addEventListener("click", () => {
    hideOtherPanels();
    const panel = document.getElementById("quocgia-panel");
    if (panel) panel.hidden = false;
    if (!phim || !nhac) void loadAll();
  });
  document.getElementById("quocgia-close")?.addEventListener("click", closePanel);
  document.getElementById("qg-tab-phim")?.addEventListener("click", () => switchTab("phim"));
  document.getElementById("qg-tab-nhac")?.addEventListener("click", () => switchTab("nhac"));
}
