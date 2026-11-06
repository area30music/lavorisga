// ==========================================
// CONFIGURAZIONE FIREBASE HARDCODED
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAVbSA7g_08qp3C4KVXPqaPGf1YCqsT7Ag",
  authDomain: "workflow-sga.firebaseapp.com",
  projectId: "workflow-sga",
  storageBucket: "workflow-sga.firebasestorage.app"
};

// Numero di versione: lo aumento io a ogni consegna. Si vede in Impostazioni Generali.
const APP_VERSION = 3;
const APP_VERSION_DATE = "03/11/2026";

// ==========================================
// CHIAVE IMGBB (FOTO 4K)
// La chiave NON e' piu' scritta nel codice: si inserisce una volta sola in Impostazioni Cloud
// e viene salvata su Firebase (workflow_sga_settings/config, campo imgbbKey), cosi' tutti i dispositivi la leggono da li'.
// ==========================================
let IMGBB_API_KEY = "";
try { IMGBB_API_KEY = localStorage.getItem('workflow_sga_imgbb_key') || ""; } catch (e) {}

// ==========================================
// STILI DINAMICI PER ZOOM TESTO FLUIDO
// ==========================================
const zoomStyles = document.createElement('style');
zoomStyles.innerHTML = `
  body:not(.master-mode) .card-dropzone { font-size: var(--app-font-size, 15px); }
  body.master-mode .card-dropzone { font-size: var(--master-font-size, 24px); }
  
  .card-dropzone > div { font-size: 1em !important; padding: 0.8em !important; }
  .card-dropzone > div .text-sm { font-size: 1.15em !important; line-height: 1.3 !important; }
  .card-dropzone > div .text-xs { font-size: 0.9em !important; line-height: 1.3 !important; }
  .card-dropzone > div .text-\\[11px\\] { font-size: 0.8em !important; line-height: 1.2 !important; }
  .card-dropzone > div .text-\\[10px\\] { font-size: 0.75em !important; line-height: 1.2 !important; }
  
  .card-dropzone > div svg { width: 1.1em !important; height: 1.1em !important; }
  .card-dropzone > div .h-14 { height: 3.5em !important; }
  .card-dropzone > div .w-14 { width: 3.5em !important; }
  .card-dropzone > div .px-2 { padding-left: 0.5em !important; padding-right: 0.5em !important; }
  .card-dropzone > div .py-0\\.5 { padding-top: 0.2em !important; padding-bottom: 0.2em !important; }
`;
document.head.appendChild(zoomStyles);

const phoneStyles = document.createElement('style');
phoneStyles.id = 'phoneStyles';
// Tutte le regole sono limitate a html[data-view="phone"]: su iPad e PC non si attivano mai.
phoneStyles.textContent = `
html[data-view="phone"] body { height: 100dvh; }

/* Intestazione compatta */
html[data-view="phone"] header { padding: 6px 10px; gap: 6px; }
html[data-view="phone"] header > div:nth-child(1) { order: 1; }
html[data-view="phone"] header > div:nth-child(3) { order: 2; margin-left: auto; }
html[data-view="phone"] header > div:nth-child(2) { order: 3; flex: 1 1 100%; max-width: none; margin: 0; }
html[data-view="phone"] #companyLogoContainer { width: 84px !important; height: 36px !important; }
html[data-view="phone"] #liveClockWidget { display: none; }
html[data-view="phone"] header .w-px { display: none; }
html[data-view="phone"] header > div:nth-child(3) { gap: 6px; flex-wrap: nowrap; }
html[data-view="phone"] header > div:nth-child(3) > * { margin: 0 !important; }
html[data-view="phone"] header > div:nth-child(3) > button { padding: 8px 10px; }
html[data-view="phone"] header > div:nth-child(3) > button:not(:last-child) { font-size: 0; gap: 0; }

/* Bacheca: una colonna per schermata, scorri col dito */
html[data-view="phone"] #board { padding: 8px; gap: 10px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
html[data-view="phone"] #board > * { flex: 0 0 90vw; width: 90vw !important; min-width: 0 !important; max-width: 90vw !important; scroll-snap-align: center; }

/* Finestre a tutto schermo */
html[data-view="phone"] #detailModal,
html[data-view="phone"] #addCardModal,
html[data-view="phone"] #settingsModal,
html[data-view="phone"] #subSettingsModal,
html[data-view="phone"] #clientHistoryModal { padding: 0 !important; }
html[data-view="phone"] #detailModal > div,
html[data-view="phone"] #addCardModal > div,
html[data-view="phone"] #settingsModal > div,
html[data-view="phone"] #subSettingsModal > div,
html[data-view="phone"] #clientHistoryModal > div { width: 100% !important; max-width: 100% !important; height: 100dvh; max-height: 100dvh !important; border-radius: 0 !important; }

/* Pulsanti in fondo alla commessa: su due righe, tutti raggiungibili */
html[data-view="phone"] #detailFooter { flex-direction: column; padding: 10px; gap: 8px; }
html[data-view="phone"] #detailFooter > div { width: 100%; flex-wrap: wrap; gap: 8px; }
html[data-view="phone"] #detailFooter button { flex: 1 1 calc(50% - 8px); justify-content: center; padding: 10px 8px; white-space: nowrap; }

/* Articoli: ogni riga diventa una scheda con i campi uno sotto l'altro */
html[data-view="phone"] #articlesTable { min-width: 0 !important; width: 100%; display: block; }
html[data-view="phone"] #articlesTableHead { display: none; }
html[data-view="phone"] #articlesTableBody { display: block; }
html[data-view="phone"] #articlesTableBody tr { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px 8px; padding: 10px 2px; align-items: end; border-bottom: 1px solid rgba(51, 65, 85, 0.6); }
html[data-view="phone"] #articlesTableBody td { display: block; padding: 0 !important; text-align: left !important; min-width: 0; }
html[data-view="phone"] #articlesTableBody td:nth-child(1) { order: 1; grid-column: span 2; }
html[data-view="phone"] #articlesTableBody td:nth-child(2) { order: 2; grid-column: span 3; }
html[data-view="phone"] #articlesTableBody td:nth-child(11) { order: 3; grid-column: span 1; text-align: right !important; }
html[data-view="phone"] #articlesTableBody td:nth-child(3) { order: 4; grid-column: 1 / -1; }
html[data-view="phone"] #articlesTableBody td:nth-child(4) { order: 5; grid-column: span 2; }
html[data-view="phone"] #articlesTableBody td:nth-child(5) { order: 6; grid-column: span 2; }
html[data-view="phone"] #articlesTableBody td:nth-child(6) { order: 7; grid-column: span 2; }
html[data-view="phone"] #articlesTableBody td:nth-child(7) { order: 8; grid-column: span 2; }
html[data-view="phone"] #articlesTableBody td:nth-child(8) { order: 9; grid-column: span 2; }
html[data-view="phone"] #articlesTableBody td:nth-child(9) { order: 10; grid-column: span 2; }
html[data-view="phone"] #articlesTableBody td:nth-child(10) { order: 11; grid-column: 1 / -1; text-align: right !important; }
html[data-view="phone"] #articlesTableBody td:nth-child(n+2):nth-child(-n+10)::before { display: block; font-size: 10px; line-height: 1.2; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; font-family: ui-sans-serif, system-ui, sans-serif; font-weight: 600; }
html[data-view="phone"] #articlesTableBody td:nth-child(2)::before { content: 'Codice'; }
html[data-view="phone"] #articlesTableBody td:nth-child(3)::before { content: 'Descrizione'; }
html[data-view="phone"] #articlesTableBody td:nth-child(4)::before { content: 'Q.tà'; }
html[data-view="phone"] #articlesTableBody td:nth-child(5)::before { content: 'Prezzo un.'; }
html[data-view="phone"] #articlesTableBody td:nth-child(6)::before { content: 'Sconto %'; }
html[data-view="phone"] #articlesTableBody td:nth-child(7)::before { content: 'IVA %'; }
html[data-view="phone"] #articlesTableBody td:nth-child(8)::before { content: 'Tot. netto'; }
html[data-view="phone"] #articlesTableBody td:nth-child(9)::before { content: 'Un. ivato'; }
html[data-view="phone"] #articlesTableBody td:nth-child(10)::before { content: 'Tot. ivato'; }

/* Elenchi delle impostazioni: niente altezza fissa, usano tutto lo schermo */
html[data-view="phone"] #settingsClientsList, html[data-view="phone"] #settingsArticlesList, html[data-view="phone"] #settingsJobTypesList, html[data-view="phone"] #settingsMachinesList, html[data-view="phone"] #archiveSettingsList { max-height: none !important; overflow: visible !important; }
`;
document.head.appendChild(phoneStyles);

const masterAlertStyles = document.createElement('style');
masterAlertStyles.id = 'masterAlertStyles';
// Avviso scadenze molto piu' grande SOLO in Master View (proiettore). Altrove resta identico.
masterAlertStyles.textContent = `
body.master-mode #arcadeAlertModal > div { max-width: min(94vw, 3500px) !important; padding: clamp(1rem, 2vw, 5rem) !important; max-height: 96vh; overflow-y: auto; }
body.master-mode #arcadeAlertModal h2 { font-size: clamp(2rem, 3.6vw, 9rem); line-height: 1.1; }
body.master-mode #arcadeAlertModal p.uppercase { font-size: clamp(1.1rem, 1.8vw, 4.8rem); }
body.master-mode #arcadeAlertModal svg { width: clamp(3rem, 5vw, 13rem); height: clamp(3rem, 5vw, 13rem); }
body.master-mode #arcadeAlertModal button svg { width: clamp(1.5rem, 2.4vw, 6rem); height: clamp(1.5rem, 2.4vw, 6rem); }
body.master-mode #arcadeAlertList { max-height: 44vh; }
body.master-mode #arcadeAlertList h4 { font-size: clamp(1.4rem, 2.3vw, 6rem); line-height: 1.2; }
body.master-mode #arcadeAlertList p, body.master-mode #arcadeAlertList span.font-mono { font-size: clamp(1rem, 1.5vw, 4rem); line-height: 1.25; }
body.master-mode #arcadeAlertList > div { padding: clamp(0.6rem, 1vw, 2.6rem); }
body.master-mode #arcadeAlertModal button.uppercase { font-size: clamp(1.2rem, 2vw, 5.2rem); }
body.master-mode #liveClockWidget { font-size: clamp(1.3rem, 2.3vw, 6rem); padding: 0.3em 0.7em; gap: 0.5em; }
body.master-mode #liveClockWidget svg { width: 1.1em; height: 1.1em; }
body.master-mode #masterCounter { font-size: clamp(1rem, 1.5vw, 4rem); }
body.master-mode #masterCounter .mc-pill { background: #0f172a; border: 1px solid #334155; color: #cbd5e1; border-radius: 0.6em; padding: 0.2em 0.7em; white-space: nowrap; }
body.master-mode #masterCounter .mc-pill b { color: #fff; margin-left: 0.3em; }
body.master-mode #masterCounter .mc-alert { color: #64748b; }
body.master-mode #masterCounter .mc-red { background: #7f1d1d; border-color: #ef4444; color: #fecaca; }
body.master-mode #masterCounter .mc-amber { background: #78350f; border-color: #f59e0b; color: #fde68a; }
html[data-view="phone"] #trashList { max-height: none !important; overflow: visible !important; }
html[data-view="phone"] #globalFilterType, html[data-view="phone"] #globalFilterDeadline { min-width: 0; max-width: 30%; text-overflow: ellipsis; flex-shrink: 1; }
html[data-view="phone"] #globalSearchInput { min-width: 0; }
`;
document.head.appendChild(masterAlertStyles);

// ==========================================
// TABELLA ARTICOLI su iPad e PC: tutto su una riga; codice e descrizione vanno a capo e la riga cresce in altezza
// Su iPhone resta il layout a schede (regole in phoneStyles).
// ==========================================
(function () {
  const sel = (suffix) => ['tablet', 'pc'].map(m => 'html[data-view="' + m + '"] ' + suffix).join(', ');
  const css = `
${sel('#articlesTable')} { min-width: 0 !important; width: 100%; table-layout: fixed; }
${sel('#articlesTableHead th:nth-child(1)')} { width: 46px; padding-left: 2px; padding-right: 2px; }
${sel('#articlesTableHead th:nth-child(2)')} { width: 15%; }
${sel('#articlesTableHead th:nth-child(4)')} { width: 52px; }
${sel('#articlesTableHead th:nth-child(5)')} { width: 76px; }
${sel('#articlesTableHead th:nth-child(6)')} { width: 56px; }
${sel('#articlesTableHead th:nth-child(7)')} { width: 46px; }
${sel('#articlesTableHead th:nth-child(8)')} { width: 78px; }
${sel('#articlesTableHead th:nth-child(9)')} { width: 78px; }
${sel('#articlesTableHead th:nth-child(10)')} { width: 86px; }
${sel('#articlesTableHead th:nth-child(11)')} { width: 56px; }
${sel('#articlesTableHead th')} { padding-left: 4px; padding-right: 4px; }
${sel('#articlesTableBody td')} { padding-left: 2px !important; padding-right: 2px !important; vertical-align: top; }
${sel('#articlesTableBody td:nth-child(n+4)')} { vertical-align: middle; }
${sel('#articlesTableBody td:nth-child(8), #articlesTableBody td:nth-child(9), #articlesTableBody td:nth-child(10)')} { white-space: nowrap; font-size: 11px; }
`;
  const st = document.createElement('style');
  st.id = 'articleTableStyles';
  // righe alternate: una un po' piu chiara dell'altra, uguale su tutti i dispositivi (il colore al passaggio del mouse resta)
  const zebra = `
html[data-view] #articlesTableBody tr { border-radius: 8px; }
html[data-view] #articlesTableBody tr:nth-child(even):not(:hover) { background-color: rgba(148, 163, 184, 0.10); }
html[data-view="phone"] #articlesTableBody tr { padding-left: 8px !important; padding-right: 8px !important; }
`;
  st.textContent = css + zebra;
  document.head.appendChild(st);
})();

// ==========================================
// MODALITA' DI VISIONE (per dispositivo): Automatico, iPhone, iPad, PC
// ==========================================
function getViewMode() {
  try { const m = localStorage.getItem('sga_view_mode'); return ['auto', 'phone', 'tablet', 'pc'].indexOf(m) >= 0 ? m : 'auto'; } catch (e) { return 'auto'; }
}
function resolveViewMode() {
  const m = getViewMode();
  if (m !== 'auto') return m;
  const w = window.innerWidth || document.documentElement.clientWidth || 1200;
  return w <= 640 ? 'phone' : (w <= 1100 ? 'tablet' : 'pc');
}
function applyViewMode() {
  document.documentElement.setAttribute('data-view', resolveViewMode());
  if (typeof autoGrowAllDescs === 'function') setTimeout(autoGrowAllDescs, 60);
}
function setViewMode(mode) {
  try { localStorage.setItem('sga_view_mode', mode); } catch (e) {}
  applyViewMode();
  playSound('success');
  if (typeof activeSubSettingsType !== 'undefined' && activeSubSettingsType === 'viewmode') openSubSettings('viewmode');
}
applyViewMode();
window.addEventListener('resize', () => { if (getViewMode() === 'auto') applyViewMode(); });

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
// Cache offline gestita da Firebase (IndexedDB): sostituisce la copia in localStorage
db.enablePersistence({ synchronizeTabs: true }).catch((e) => console.warn('Cache offline non attiva:', e.code));
const auth = firebase.auth();


// ==========================================
// SICUREZZA TESTI: escape HTML
// ==========================================
function esc(v) {
  if (v === null || v === undefined) return '';
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
// Per testi dentro onclick="fn('...')": prima escape JS, poi escape HTML
function jsArg(v) {
  if (v === null || v === undefined) return '';
  return esc(String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'"));
}

// ==========================================
// VARIABILI GLOBALI
// ==========================================
let isMasterMode = false;
let autoScrollId = null;
let autoScrollDir = 1;
let autoScrollPause = 0;
let lastScrollTime = 0;
let isAutoScrollPaused = false;
let masterScrollSpeed = 0.08;

window.editingClientId = null;
window.editingArticleIdx = null; 
window.tempLabelArticles = [];
window.tempFreeLabelArticles = [];

let arcadeTimer = null;
let sirenInterval = null;
let activeLabelCardId = null;

const DEFAULT_COLUMNS_CONFIG = [
  { id: "prev-da-fare", label: "Prev. da fare", color: "bg-orange-600/20 border-orange-500/50 text-orange-400", border: "border-l-4 border-l-orange-500", hexDefault: "#c2410c" },
  { id: "prev-inviato", label: "Prev. inviato", color: "bg-amber-600/20 border-amber-500/50 text-amber-400", border: "border-l-4 border-l-amber-500", hexDefault: "#d97706" },
  { id: "da-ordinare", label: "Da ordinare", color: "bg-rose-600/20 border-rose-500/50 text-rose-400", border: "border-l-4 border-l-rose-500", hexDefault: "#e11d48" },
  { id: "ordinato", label: "Ordinato", color: "bg-pink-600/20 border-pink-500/50 text-pink-400", border: "border-l-4 border-l-pink-500", hexDefault: "#db2777" },
  { id: "da-lavorare", label: "Magazzino / Da lavorare", color: "bg-violet-600/20 border-violet-500/50 text-violet-400", border: "border-l-4 border-l-violet-500", hexDefault: "#7c3aed" },
  { id: "in-lavorazione", label: "In lavorazione", color: "bg-cyan-600/20 border-cyan-500/50 text-cyan-400", border: "border-l-4 border-l-cyan-500", hexDefault: "#0891b2" },
  { id: "lavorato-da-bollettare", label: "Lavorato da bollettare", color: "bg-emerald-600/20 border-emerald-500/50 text-emerald-400", border: "border-l-4 border-l-emerald-500", hexDefault: "#059669" },
  { id: "bollettato-da-consegnare", label: "Bollettato da consegnare", color: "bg-teal-600/20 border-teal-500/50 text-teal-400", border: "border-l-4 border-l-teal-500", hexDefault: "#0d9488" },
  { id: "fatturato", label: "Fatturato", color: "bg-blue-600/20 border-blue-500/50 text-blue-400", border: "border-l-4 border-l-blue-500", hexDefault: "#2563eb" }
];

const DEFAULT_MSG_TEMPLATE = `Buongiorno {SALUTO},\n\nquesto è il sistema di automazione di SGA Studio Grafico Associato.\n\nVolevamo comunicarle che l'ordine da lei effettuato ("{TITOLO}"){ARTICOLI}\n\nè pronto per il ritiro.\n\nCordiali saluti,\nSGA Studio Grafico Associato`;

let COLUMNS_CONFIG = JSON.parse(JSON.stringify(DEFAULT_COLUMNS_CONFIG));
let USER_ALARMS = []; 
let CLIENTS_DB = [];
let ARTICLES_DB = [];
const JOB_TYPES_DEFAULT = ["Stampa Digitale / Banner", "Abbigliamento / Ricamo", "Insegne & Vetrofanie", "Etichette & Adesivi", "Grafica / Progettazione", "Altro"];
let JOB_TYPES_DB = JOB_TYPES_DEFAULT.slice();
let MACHINES_DB = ["Roland TrueVIS SG2-540", "Epson SureColor T7200", "Epson F1000 DTF", "Xerox PrimeLink C9200", "Happy Japan HCH Embroidery"];
let masterFontSizePx = 24; 
let appFontSizePx = 15;
let sharedCompanyLogo = "";
let sharedMsgTemplate = "";
let activeSubSettingsType = null;
let globalSearchQuery = "";
let globalFilterJobType = "";
let globalFilterDeadline = "";
let activeNotifyCard = null;

// ==========================================
// AUTENTICAZIONE E AVVIO
// ==========================================
auth.onAuthStateChanged((user) => {
  const loginScreen = document.getElementById('loginScreen');
  if (user) {
    loginScreen.classList.add('hidden');
    init();
  } else {
    loginScreen.classList.remove('hidden');
    lucide.createIcons();
  }
});

function handleLogin(event) {
  event.preventDefault();
  playSound('success');
  
  const email = document.getElementById('loginEmail').value.trim();
  const pwInput = document.getElementById('loginPassword').value.trim();
  const errorMsg = document.getElementById('loginError');
  
  auth.signInWithEmailAndPassword(email, pwInput)
    .then(() => {
      errorMsg.classList.add('hidden');
      document.getElementById('loginPassword').value = '';
    })
    .catch((error) => {
      console.error(error);
      playSound('alert');
      errorMsg.classList.remove('hidden');
      document.getElementById('loginPassword').value = '';
    });
}

function logoutApp() {
  showInAppConfirm("Vuoi disconnetterti da SGA Workflow?", () => { auth.signOut(); }, 'Disconnetti');
}

// Controllo Archivio Automatico (prudente)
// Archivia solo se la commessa e' DAVVERO in Fatturato da piu' di 7 giorni, contando dall'ultimo passaggio in Fatturato.
// Se manca la data del passaggio, non archivia: la registra adesso e riparte il conteggio.
function checkAutoArchive() {
  const now = Date.now();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  let changed = false;
  let archivedCount = 0;

  state.cards.forEach(card => {
    if (!card || card.stage !== 'fatturato') return;
    if (!Array.isArray(card.history)) card.history = [];
    const last = [...card.history].reverse().find(h => h && h.stage === 'fatturato' && h.timestamp);
    if (!last) {
      card.history.push({ stage: 'fatturato', label: 'Data di ingresso in Fatturato registrata', timestamp: new Date().toISOString() });
      changed = true;
      syncCardToCloud(card);
      return;
    }
    const t = new Date(last.timestamp).getTime();
    if (isNaN(t)) return;
    if ((now - t) > SEVEN_DAYS) {
      card.stage = 'archiviato';
      card.history.push({ stage: 'archiviato', label: 'Archiviata automaticamente (7+ giorni in Fatturato)', timestamp: new Date().toISOString() });
      changed = true;
      archivedCount++;
      syncCardToCloud(card);
    }
  });

  if (changed) saveLocal();
  if (archivedCount > 0) showToast(archivedCount + (archivedCount === 1 ? ' commessa archiviata' : ' commesse archiviate') + ' (dopo 7 giorni in Fatturato)');
}

// Riporta una commessa dall'archivio a "Fatturato"
function restoreArchivedCard(cardId) {
  const card = state.cards.find(c => c && c.id === cardId);
  if (!card) return;
  card.stage = 'fatturato';
  if (!Array.isArray(card.history)) card.history = [];
  card.history.push({ stage: 'fatturato', label: 'Ripristinata dall\'archivio', timestamp: new Date().toISOString() });
  saveLocal();
  syncCardToCloud(card);
  const list = document.getElementById('archiveSettingsList');
  if (list) { const si = document.getElementById('archiveSearchInput'); list.innerHTML = renderArchiveList(si ? si.value : ''); lucide.createIcons(); }
  renderBoard();
  showToast('Commessa ripristinata in Fatturato');
}

// ==========================================
// FILTRO SCADENZE, AVVISI SULLA LAVAGNA
// ==========================================
function localIsoDate(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), g = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + g;
}

function cardMatchesDeadline(c) {
  const mode = globalFilterDeadline;
  if (!mode) return true;
  if (mode === 'senza') return !c.deliveryDate;
  if (!c.deliveryDate) return false;
  if (c.stage === 'bollettato-da-consegnare' || c.stage === 'fatturato') return false;
  const d = new Date(c.deliveryDate); d.setHours(0, 0, 0, 0);
  if (isNaN(d.getTime())) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (mode === 'scadute') return diff < 0;
  if (mode === 'oggi') return diff === 0;
  if (mode === '7giorni') return diff >= 0 && diff <= 7;
  if (mode === 'settimana') {
    const dow = (today.getDay() + 6) % 7; // lunedi = 0
    const toSunday = 6 - dow;
    return diff >= 0 && diff <= toSunday;
  }
  return true;
}

function handleGlobalDeadlineChange() {
  const el = document.getElementById('globalFilterDeadline');
  globalFilterDeadline = el ? el.value : '';
  renderBoard();
}

function resetAllFilters() {
  globalSearchQuery = ''; globalFilterJobType = ''; globalFilterDeadline = '';
  const s = document.getElementById('globalSearchInput'); if (s) s.value = '';
  const t = document.getElementById('globalFilterType'); if (t) t.value = '';
  const d = document.getElementById('globalFilterDeadline'); if (d) d.value = '';
  const cb = document.getElementById('btnClearSearch'); if (cb) cb.classList.add('hidden');
  renderBoard();
}

function rescueOrphanCards() {
  const known = new Set(COLUMNS_CONFIG.map(c => c.id));
  let n = 0;
  state.cards.forEach(c => {
    if (c && c.stage && c.stage !== 'archiviato' && !known.has(c.stage)) {
      c.stage = COLUMNS_CONFIG[0].id;
      if (!Array.isArray(c.history)) c.history = [];
      c.history.push({ stage: c.stage, label: 'Recuperata: la fase originale non esisteva piu\'', timestamp: new Date().toISOString() });
      syncCardToCloud(c);
      n++;
    }
  });
  if (n) { saveLocal(); renderBoard(); showToast(n + (n === 1 ? ' commessa recuperata' : ' commesse recuperate')); }
}

function updateBoardWarning(renderedCount) {
  const box = document.getElementById('boardWarning');
  if (!box) return;
  if (isMasterMode) { box.classList.add('hidden'); box.innerHTML = ''; return; }
  const known = new Set(COLUMNS_CONFIG.map(c => c.id));
  const active = state.cards.filter(c => c && c.stage !== 'archiviato' && known.has(c.stage));
  const orphans = state.cards.filter(c => c && c.stage && c.stage !== 'archiviato' && !known.has(c.stage));
  const filtersOn = !!(globalSearchQuery || globalFilterJobType || globalFilterDeadline);
  const hidden = filtersOn ? Math.max(0, active.length - renderedCount) : 0;
  let html = '';
  if (hidden > 0) {
    html += `<div class="flex items-center justify-between gap-2 bg-amber-950/60 border border-amber-700/60 text-amber-200 text-xs rounded-lg px-3 py-2">
      <span><b>${hidden}</b> ${hidden === 1 ? 'commessa nascosta' : 'commesse nascoste'} dai filtri attivi.</span>
      <button onclick="resetAllFilters()" class="shrink-0 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-2.5 py-1 rounded cursor-pointer">Mostra tutte</button>
    </div>`;
  }
  if (orphans.length > 0) {
    html += `<div class="flex items-center justify-between gap-2 bg-red-950/60 border border-red-700/60 text-red-200 text-xs rounded-lg px-3 py-2 ${html ? 'mt-2' : ''}">
      <span><b>${orphans.length}</b> ${orphans.length === 1 ? 'commessa non appare' : 'commesse non appaiono'} in nessuna colonna.</span>
      <button onclick="rescueOrphanCards()" class="shrink-0 bg-red-600 hover:bg-red-500 text-white font-semibold px-2.5 py-1 rounded cursor-pointer">Recupera</button>
    </div>`;
  }
  box.innerHTML = html;
  box.classList.toggle('hidden', !html);
}

// ==========================================
// COMMESSE FERME
// ==========================================
function getStaleDays() {
  let v = 7;
  try { v = parseInt(localStorage.getItem('sga_stale_days'), 10); } catch (e) {}
  return (isNaN(v) || v < 1) ? 7 : v;
}

function staleInfo(card) {
  if (!card || ['fatturato', 'bollettato-da-consegnare', 'archiviato'].includes(card.stage)) return 0;
  let ref = card.createdAt;
  if (Array.isArray(card.history) && card.history.length) {
    const last = card.history[card.history.length - 1];
    if (last && last.timestamp) ref = last.timestamp;
  }
  const t = new Date(ref).getTime();
  if (isNaN(t)) return 0;
  const days = Math.floor((Date.now() - t) / 86400000);
  return days >= getStaleDays() ? days : 0;
}

// ==========================================
// CESTINO (le commesse eliminate restano 30 giorni)
// ==========================================
function moveCardToTrash(card) {
  if (!db || !card) return;
  const entry = { kind: 'trash_card', cardId: card.id, cardTitle: card.title || 'Senza titolo', clientName: card.client || '', deletedAt: new Date().toISOString(), card: card };
  const size = JSON.stringify(entry).length;
  if (size > 900000) {
    entry.card = Object.assign({}, card, { attachments: [], photos: [] });
    entry.photosTrimmed = true;
  }
  db.collection('workflow_sga_settings').doc('trash_' + card.id).set(entry).catch(e => {
    console.error(e);
    showToast('⚠️ Non sono riuscito a mettere la commessa nel cestino');
  });
}

async function loadTrashList() {
  const el = document.getElementById('trashList');
  if (!el) return;
  if (!db) { el.innerHTML = '<p class="text-xs text-slate-500 italic py-4 text-center">Cestino non disponibile in modalità locale.</p>'; return; }
  try {
    const snap = await db.collection('workflow_sga_settings').where('kind', '==', 'trash_card').get();
    const now = Date.now(); const THIRTY = 30 * 86400000;
    const items = [];
    snap.docs.forEach(d => {
      const x = d.data();
      const t = new Date(x.deletedAt).getTime();
      if (!isNaN(t) && now - t > THIRTY) { d.ref.delete().catch(() => {}); return; }
      items.push(x);
    });
    items.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
    window.__trashItems = items;
    renderTrashList();
  } catch (e) {
    console.error(e);
    el.innerHTML = '<p class="text-xs text-red-400 py-4 text-center">Impossibile leggere il cestino.</p>';
  }
}

function renderTrashList() {
  const el = document.getElementById('trashList');
  if (!el) return;
  const items = window.__trashItems || [];
  if (!items.length) { el.innerHTML = '<p class="text-xs text-slate-500 italic py-4 text-center">Il cestino è vuoto.</p>'; return; }
  el.innerHTML = items.map(x => {
    const left = Math.max(0, 30 - Math.floor((Date.now() - new Date(x.deletedAt).getTime()) / 86400000));
    return `<div class="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center gap-2">
      <div class="min-w-0">
        <h5 class="text-sm font-bold text-slate-200 truncate">${esc(x.cardTitle)}</h5>
        <div class="text-[10px] text-slate-400 mt-0.5">Cliente: <span class="text-indigo-300 font-semibold">${esc(x.clientName || 'N/D')}</span> | Eliminata il ${new Date(x.deletedAt).toLocaleDateString('it-IT')} | ancora ${left} gg${x.photosTrimmed ? ' | senza foto' : ''}</div>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button onclick="restoreFromTrash('${esc(x.cardId)}')" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1.5 rounded font-semibold cursor-pointer">Ripristina</button>
        <button onclick="purgeTrashItem('${esc(x.cardId)}')" class="text-slate-600 hover:text-red-400 p-1.5 cursor-pointer" title="Elimina definitivamente"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
      </div>
    </div>`;
  }).join('');
  lucide.createIcons();
}

async function restoreFromTrash(cardId) {
  const x = (window.__trashItems || []).find(i => i.cardId === cardId);
  if (!x || !x.card) return;
  const card = sanitizeCard(x.card);
  if (!card) { showToast('Commessa nel cestino non valida'); return; }
  if (!Array.isArray(card.history)) card.history = [];
  card.history.push({ stage: card.stage, label: 'Ripristinata dal cestino', timestamp: new Date().toISOString() });
  try {
    await db.collection('workflow_sga_cards').doc(card.id).set(card);
    await db.collection('workflow_sga_settings').doc('trash_' + cardId).delete();
  } catch (e) { console.error(e); showToast('⚠️ Ripristino non riuscito'); return; }
  if (!state.cards.find(c => c.id === card.id) && card.stage !== 'archiviato') { state.cards.push(card); saveLocal(); renderBoard(); }
  window.__trashItems = (window.__trashItems || []).filter(i => i.cardId !== cardId);
  renderTrashList();
  showToast('Commessa ripristinata');
}

function purgeTrashItem(cardId) {
  showInAppConfirm('Eliminare definitivamente questa commessa? Non si potrà più recuperare.', async () => {
    try { await db.collection('workflow_sga_settings').doc('trash_' + cardId).delete(); } catch (e) { console.error(e); }
    window.__trashItems = (window.__trashItems || []).filter(i => i.cardId !== cardId);
    renderTrashList();
  }, 'Elimina');
}

// ==========================================
// PROMEMORIA BACKUP SETTIMANALE
// ==========================================
function markBackupDone() {
  const iso = new Date().toISOString();
  try { localStorage.setItem('sga_last_backup', iso); } catch (e) {}
  if (db) db.collection('workflow_sga_settings').doc('config').set({ lastBackupAt: iso }, { merge: true }).catch(() => {});
}

function maybeRemindBackup() {
  if (isMasterMode || getViewMode() === 'phone' || resolveViewMode() === 'phone') return;
  try { if (sessionStorage.getItem('sga_backup_asked')) return; } catch (e) {}
  let last = 0, snooze = 0;
  try { last = new Date(localStorage.getItem('sga_last_backup') || 0).getTime() || 0; snooze = parseInt(localStorage.getItem('sga_backup_snooze') || '0', 10) || 0; } catch (e) {}
  const now = Date.now();
  if (now < snooze) return;
  if (now - last < 7 * 86400000) return;
  try { sessionStorage.setItem('sga_backup_asked', '1'); } catch (e) {}
  const days = last ? Math.floor((now - last) / 86400000) : null;
  showInAppConfirm(days === null ? 'Non risulta nessun backup. Scarico adesso una copia di sicurezza di tutte le commesse?' : 'L\'ultimo backup è di ' + days + ' giorni fa. Scarico adesso una copia di sicurezza?', () => { exportBackup(); }, 'Scarica backup', 'Backup settimanale');
  try { localStorage.setItem('sga_backup_snooze', String(now + 24 * 3600000)); } catch (e) {}
}

// ==========================================
// RIEPILOGO DELLA GIORNATA (stampa)
// ==========================================
function printDailySummary() {
  const NONE = 'Nessuna macchina assegnata';
  const cards = state.cards.filter(c => c && (c.stage === 'da-lavorare' || c.stage === 'in-lavorazione'));
  const groups = {};
  cards.forEach(c => { const k = c.machine || NONE; (groups[k] = groups[k] || []).push(c); });
  const keys = Object.keys(groups).sort((a, b) => a === NONE ? 1 : b === NONE ? -1 : a.localeCompare(b));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const stageName = (id) => { const s = COLUMNS_CONFIG.find(x => x.id === id); return s ? s.label : id; };
  const rows = (list) => list.slice().sort((a, b) => {
    const da = a.deliveryDate ? new Date(a.deliveryDate).getTime() : Infinity;
    const db_ = b.deliveryDate ? new Date(b.deliveryDate).getTime() : Infinity;
    return da - db_;
  }).map(c => {
    let cons = '—', flag = '';
    if (c.deliveryDate) {
      const d = new Date(c.deliveryDate); d.setHours(0, 0, 0, 0);
      cons = d.toLocaleDateString('it-IT');
      const diff = Math.round((d - today) / 86400000);
      if (diff < 0) flag = ' <b style="color:#b91c1c">SCADUTA</b>'; else if (diff === 0) flag = ' <b style="color:#b45309">OGGI</b>';
    }
    const arts = (c.articles || []).filter(a => a && (a.desc || a.code)).map(a => esc((a.qty || '') + ' x ' + (a.desc || a.code))).join('<br>');
    return `<tr><td>${cons}${flag}</td><td>${esc(c.client || '')}</td><td>${esc(c.orderRef || '')}</td><td><b>${esc(c.title || '')}</b><br><small>${esc(c.jobType || '')}</small></td><td>${arts}</td><td>${esc(c.jobNotes || '')}</td><td>${esc(stageName(c.stage))}</td></tr>`;
  }).join('');
  const body = keys.length ? keys.map(k => `<h2>${esc(k)} <small>(${groups[k].length})</small></h2><table><thead><tr><th>Consegna</th><th>Cliente</th><th>Rif. ordine</th><th>Lavorazione</th><th>Articoli</th><th>Note</th><th>Stato</th></tr></thead><tbody>${rows(groups[k])}</tbody></table>`).join('') : '<p>Nessuna commessa in "Da lavorare" o "In lavorazione".</p>';
  const w = window.open('', '_blank');
  if (!w) { showToast('Il browser ha bloccato la finestra di stampa'); return; }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Riepilogo giornata</title><style>
    @page { size: A4 landscape; margin: 10mm; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #111; }
    h1 { font-size: 18px; margin: 0 0 4px; } h2 { font-size: 14px; margin: 14px 0 4px; border-bottom: 2px solid #111; padding-bottom: 2px; }
    small { color: #555; font-weight: normal; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    th, td { border: 1px solid #999; padding: 4px 5px; text-align: left; vertical-align: top; }
    th { background: #eee; } tr { page-break-inside: avoid; }
  </style></head><body><h1>Riepilogo della giornata</h1><div>${today.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — ${cards.length} commesse da lavorare</div>${body}</body></html>`);
  w.document.close();
  setTimeout(() => { try { w.focus(); w.print(); } catch (e) {} }, 400);
}

function patchSettingsMenu() {
  const btns = document.querySelectorAll('button, div[onclick]');
  btns.forEach(btn => {
    const onclickAttr = btn.getAttribute('onclick');
    if (onclickAttr && (onclickAttr.includes("openSubSettings('colors')") || onclickAttr.includes('openSubSettings("colors")'))) {
      
      const headings = btn.querySelectorAll('h4, .font-bold');
      headings.forEach(h => {
        h.innerText = "Stampa Etichetta Colli Libera";
      });
      
      const paragraphs = btn.querySelectorAll('p, span');
      paragraphs.forEach(p => {
        if (p.innerText.toLowerCase().includes('cromat') || p.innerText.toLowerCase().includes('fasi') || p.innerText.toLowerCase().includes('colore') || p.innerText.toLowerCase().includes('colonne')) {
          p.innerText = "Genera etichette colli per spedizioni o imballi slegati.";
        }
      });
      
      const i = btn.querySelector('i');
      if (i) {
         i.setAttribute('data-lucide', 'printer');
         const iconWrapper = i.parentElement;
         if (iconWrapper) {
           iconWrapper.classList.remove('text-indigo-400', 'bg-indigo-900/50', 'text-purple-400', 'bg-purple-900/50');
           iconWrapper.classList.add('text-blue-400', 'bg-blue-900/50');
         }
      }
    }
  });
  if (window.lucide) lucide.createIcons();
}

function init() {
  loadUserSettings();
  loadState();
  
  let localMigrated = false;
  state.cards.forEach(c => { 
    if (c.stage === 'lavorato') { 
      c.stage = 'lavorato-da-bollettare'; 
      localMigrated = true; 
    } 
    if (c.stage === 'consegnato') { 
      c.stage = 'bollettato-da-consegnare'; 
      localMigrated = true; 
    } 
    if (c.stage === 'magazzino') {
      c.stage = 'da-lavorare';
      if (!Array.isArray(c.history)) c.history = [];
      c.history.push({ stage: 'da-lavorare', label: 'Spostata da "In magazzino" a "Magazzino / Da lavorare" (colonne unite)', timestamp: new Date().toISOString() });
      localMigrated = true;
    }
  });
  
  state.cards.sort((a,b) => (a.order || 0) - (b.order || 0));
  
  if (localMigrated) { 
    saveLocal(); 
    state.cards.forEach(c => syncCardToCloud(c)); 
  }
  
  checkAutoArchive();
  setInterval(checkAutoArchive, 60 * 60 * 1000);
  
  patchSettingsMenu();
  
  renderBoard();
  updateCloudStatus(true);
  listenToCloudUpdates();
  lucide.createIcons();

  // Dopo un aggiornamento automatico o un riavvio, il PC del proiettore torna da solo in Master View
  try {
    if (localStorage.getItem('sga_master_mode') === '1' && !isMasterMode) toggleMasterMode();
  } catch(e) {}
}

// ==========================================
// FUNZIONI CORE (Orologio, Suoni, Avvisi)
// ==========================================
function setSyncStatus(status) {
  const el = document.getElementById('syncIndicator');
  if (!el) return;
  
  if (status === 'typing') {
    el.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin text-amber-400"></i> <span class="text-amber-400">Modifica in corso...</span>';
    el.classList.remove('opacity-0');
    el.classList.add('opacity-100');
    lucide.createIcons();
  } else if (status === 'saved') {
    el.innerHTML = '<i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i> <span class="text-emerald-400">Salvato in Cloud</span>';
    el.classList.remove('opacity-0');
    el.classList.add('opacity-100');
    lucide.createIcons();
    
    if (window.syncStatusTimer) clearTimeout(window.syncStatusTimer);
    
    window.syncStatusTimer = setTimeout(() => {
      el.classList.remove('opacity-100');
      el.classList.add('opacity-0');
    }, 2500);
  }
}

function showToast(message) {
  let toast = document.getElementById('customToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'customToast';
    toast.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[300] bg-slate-800/95 backdrop-blur-md text-emerald-400 font-bold px-8 py-5 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-emerald-500/30 flex items-center justify-center gap-4 transition-all duration-300 opacity-0 pointer-events-none scale-90 text-lg';
    document.body.appendChild(toast);
  }
  
  toast.innerHTML = `<i data-lucide="check-circle-2" class="w-8 h-8"></i> <span>${message}</span>`;
  lucide.createIcons();
  
  void toast.offsetWidth;
  
  toast.classList.remove('opacity-0', 'scale-90');
  toast.classList.add('opacity-100', 'scale-100');
  
  if (window.toastTimer) clearTimeout(window.toastTimer);
  
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('opacity-100', 'scale-100');
    toast.classList.add('opacity-0', 'scale-90');
  }, 2000);
}

function updateLiveClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  const timeEl = document.getElementById('headerClockTime');
  const dateEl = document.getElementById('headerClockDate');
  
  if (timeEl) timeEl.innerText = timeStr;
  if (dateEl) dateEl.innerText = dateStr;
  
  checkScheduledAlarms(now);
  
  if (timeStr === "08:00:00") {
    window.location.reload(true);
  }
}
setInterval(updateLiveClock, 1000);

let lastTriggeredMinute = "";

function checkScheduledAlarms(now) {
  if (!USER_ALARMS || USER_ALARMS.length === 0) return;
  
  const currentDay = now.getDay();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;
  
  if (now.getSeconds() === 0 && lastTriggeredMinute !== currentTimeStr) {
    USER_ALARMS.forEach(alarm => {
      if (alarm.active && Array.isArray(alarm.days) && alarm.days.includes(currentDay) && alarm.time === currentTimeStr) {
        lastTriggeredMinute = currentTimeStr;
        triggerAlarmAlert();
      }
    });
  }
}

function triggerAlarmAlert() {
  const urgentCards = state.cards.filter(card => {
    if (card.stage === 'bollettato-da-consegnare' || card.stage === 'fatturato' || card.stage === 'archiviato') return false;
    if (!card.deliveryDate) return false;
    
    const delivery = new Date(card.deliveryDate);
    delivery.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const diffDays = Math.ceil((delivery - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });
  
  // Solo commesse con una data di consegna (scadute, oggi, entro 7 giorni). Se non ce ne sono, l'avviso non compare.
  urgentCards.sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
  if (urgentCards.length > 0) {
    showArcadeAlert(urgentCards);
  }
}

let audioCtx = null;

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playSound(type) {
  try {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    if (type === 'click') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'close') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'success') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'alert') {
      if (sirenInterval) clearInterval(sirenInterval);
      let startTime = Date.now();
      sirenInterval = setInterval(() => {
        if (Date.now() - startTime > 2500) {
          clearInterval(sirenInterval);
          sirenInterval = null;
          return;
        }
        try {
          const sNow = audioCtx.currentTime;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(350, sNow);
          osc.frequency.linearRampToValueAtTime(880, sNow + 0.35);
          osc.frequency.linearRampToValueAtTime(350, sNow + 0.7);
          gain.gain.setValueAtTime(0.25, sNow);
          gain.gain.linearRampToValueAtTime(0.01, sNow + 0.7);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(sNow);
          osc.stop(sNow + 0.7);
        } catch(e){}
      }, 700);
    } else if (type === 'delete') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {
    console.error(e);
  }
}

let state = { cards: [] };
let activeCardId = null;
let currentGalleryIndex = 0;
let tempFormFile = null;

function confirmDeletion(message, onConfirmCallback) {
  playSound('click');
  document.getElementById('deleteConfirmText').innerText = message;
  const confirmBtn = document.getElementById('btnConfirmDelete');
  
  confirmBtn.onclick = () => {
    playSound('delete');
    onConfirmCallback();
    closeModal('deleteConfirmModal');
  };
  
  openModal('deleteConfirmModal');
  lucide.createIcons();
}

function loadCompanyLogo() {
  const defaultIcon = document.getElementById('logoDefaultIcon');
  const logoImg = document.getElementById('logoImageDisplay');
  const logoContainer = document.getElementById('companyLogoContainer');
  
  let faviconLink = document.querySelector("link[rel~='icon']");
  if (!faviconLink) {
    faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    document.head.appendChild(faviconLink);
  }
  
  if (sharedCompanyLogo) {
    if (defaultIcon) defaultIcon.classList.add('hidden');
    if (logoImg) {
      logoImg.src = sharedCompanyLogo;
      logoImg.classList.remove('hidden');
    }
    if (logoContainer) {
      logoContainer.classList.remove('bg-indigo-600');
      logoContainer.style.background = 'transparent';
    }
    
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const size = 64;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const scale = Math.min(size / img.width, size / img.height);
      const x = (size / 2) - ((img.width * scale) / 2);
      const y = (size / 2) - ((img.height * scale) / 2);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      faviconLink.href = canvas.toDataURL('image/png');
    };
    img.src = sharedCompanyLogo;
  } else {
    if (defaultIcon) defaultIcon.classList.remove('hidden');
    if (logoImg) logoImg.classList.add('hidden');
    if (logoContainer) logoContainer.className = "relative group cursor-pointer bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-900/20 flex items-center justify-center overflow-hidden shrink-0";
    faviconLink.href = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🖨️</text></svg>";
  }
}

function uploadCompanyLogo(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    sharedCompanyLogo = e.target.result;
    localStorage.setItem('workflow_sga_company_logo', sharedCompanyLogo);
    loadCompanyLogo();
    playSound('success');
    
    if (db) {
      db.collection('workflow_sga_settings').doc('config').set({ companyLogo: sharedCompanyLogo }, { merge: true }).catch(e => console.error(e));
    }
    showToast("Logo caricato!");
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function removeCompanyLogo() {
  confirmDeletion(`Logo Aziendale Condiviso`, () => {
    sharedCompanyLogo = "";
    localStorage.removeItem('workflow_sga_company_logo');
    loadCompanyLogo();
    
    if (db) {
      db.collection('workflow_sga_settings').doc('config').set({ companyLogo: "" }, { merge: true }).catch(e => console.error(e));
    }
    openSubSettings('logo');
  });
}

// Colonna "In magazzino" unita a "Da lavorare": toglie la vecchia colonna dalle impostazioni salvate sul dispositivo
function normalizeColumnsConfig(cols) {
  if (!Array.isArray(cols) || !cols.length) return JSON.parse(JSON.stringify(DEFAULT_COLUMNS_CONFIG));
  const out = cols.filter(c => c && c.id !== 'magazzino');
  out.forEach(c => { if (c.id === 'da-lavorare' && (!c.label || c.label === 'Da lavorare')) c.label = 'Magazzino / Da lavorare'; });
  return out;
}

function loadUserSettings() {
  const localLogo = localStorage.getItem('workflow_sga_company_logo');
  if (localLogo) sharedCompanyLogo = localLogo;
  
  const localMsg = localStorage.getItem('workflow_sga_msg_template');
  if (localMsg) {
    sharedMsgTemplate = localMsg;
  } else {
    sharedMsgTemplate = DEFAULT_MSG_TEMPLATE;
  }
  
  const savedCols = localStorage.getItem('workflow_sga_columns_config');
  if (savedCols) {
    try {
      const parsedCols = JSON.parse(savedCols);
      COLUMNS_CONFIG = normalizeColumnsConfig(parsedCols);
    } catch(e) {
      COLUMNS_CONFIG = JSON.parse(JSON.stringify(DEFAULT_COLUMNS_CONFIG));
    }
  } else {
    COLUMNS_CONFIG = JSON.parse(JSON.stringify(DEFAULT_COLUMNS_CONFIG));
  }
  
  const savedAlarms = localStorage.getItem('workflow_sga_alarms');
  if (savedAlarms) {
    try {
      USER_ALARMS = JSON.parse(savedAlarms);
    } catch(e){
      USER_ALARMS = [];
    }
  }
  
  const savedClients = localStorage.getItem('workflow_sga_clients_db');
  if (savedClients) {
    try {
      CLIENTS_DB = JSON.parse(savedClients);
    } catch(e) {
      CLIENTS_DB = [];
    }
  }
  
  const savedArticles = localStorage.getItem('workflow_sga_articles_db');
  if (savedArticles) {
    try {
      ARTICLES_DB = JSON.parse(savedArticles);
    } catch(e){
      ARTICLES_DB = [];
    }
  }
  
  const savedMachines = localStorage.getItem('workflow_sga_machines_db');
  if (savedMachines) {
    try {
      MACHINES_DB = JSON.parse(savedMachines);
    } catch(e){}
  }
  
  const savedJobTypes = localStorage.getItem('workflow_sga_jobtypes_db');
  if (savedJobTypes) {
    try {
      const jt = JSON.parse(savedJobTypes);
      if (Array.isArray(jt) && jt.length) JOB_TYPES_DB = jt.filter(x => typeof x === 'string' && x.trim());
    } catch(e){}
  }
  
  const savedMasterFont = localStorage.getItem('workflow_sga_master_fontsize_px');
  if (savedMasterFont) masterFontSizePx = parseInt(savedMasterFont);
  applyMasterFontSize(masterFontSizePx);
  
  const savedAppFont = localStorage.getItem('workflow_sga_app_fontsize_px');
  if (savedAppFont) appFontSizePx = parseInt(savedAppFont);
  applyAppFontSize(appFontSizePx);

  loadCompanyLogo();
  populateMachinesDropdowns();
  populateJobTypeSelects();
  populateGlobalFilterDropdown();
  populateClientSelectors();
}

function applyMasterFontSize(pxVal) {
  masterFontSizePx = pxVal;
  document.documentElement.style.setProperty('--master-font-size', pxVal + 'px');
  const rangeEl = document.getElementById('masterFontRange');
  const valEl = document.getElementById('masterFontSizeVal');
  if (rangeEl) rangeEl.value = pxVal;
  if (valEl) valEl.innerText = pxVal + 'px';
}

function previewMasterFontSize(pxVal) {
  applyMasterFontSize(parseInt(pxVal));
}

function resetMasterFont() {
  playSound('click');
  applyMasterFontSize(24);
}

function applyAppFontSize(pxVal) {
  appFontSizePx = pxVal;
  document.documentElement.style.setProperty('--app-font-size', pxVal + 'px');
  const rangeEl = document.getElementById('appFontRange');
  const valEl = document.getElementById('appFontSizeVal');
  if (rangeEl) rangeEl.value = pxVal;
  if (valEl) valEl.innerText = pxVal + 'px';
}

function previewAppFontSize(pxVal) {
  applyAppFontSize(parseInt(pxVal));
}

function resetAppFont() {
  playSound('click');
  applyAppFontSize(15);
}

function updateMasterSpeed(val) {
  masterScrollSpeed = parseFloat(val);
}

function syncClientsToCloud() {
  if (db) {
    db.collection('workflow_sga_settings').doc('clients').set({ db: CLIENTS_DB }).catch(err => console.error(err));
  }
}

function syncArticlesToCloud() {
  if (db) {
    db.collection('workflow_sga_settings').doc('articles').set({ db: ARTICLES_DB }).catch(err => console.error(err));
  }
}

function registerClientAdvanced(name, referent, email, whatsapp) {
  if (!name || !name.trim()) return;
  const cleanName = name.trim();
  const cleanRef = referent ? referent.trim() : '';
  
  const existing = CLIENTS_DB.find(c => c.name.toLowerCase() === cleanName.toLowerCase() && (c.referent || '').toLowerCase() === cleanRef.toLowerCase());
  
  if (existing) {
    if (email && !existing.email) existing.email = email.trim();
    if (whatsapp && !existing.whatsapp) existing.whatsapp = whatsapp.trim();
  } else {
    const newId = 'crm_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    CLIENTS_DB.push({
      id: newId,
      name: cleanName,
      referent: cleanRef,
      email: email ? email.trim() : '',
      whatsapp: whatsapp ? whatsapp.trim() : ''
    });
  }
  
  CLIENTS_DB.sort((a,b) => a.name.localeCompare(b.name));
  localStorage.setItem('workflow_sga_clients_db', JSON.stringify(CLIENTS_DB));
  populateClientSelectors();
  syncClientsToCloud();
}

function populateClientSelectors() {
  const editSelector = document.getElementById('editClientSelector');
  const formSelector = document.getElementById('formClientSelector');
  let optionsHtml = `<option value="">-- Seleziona dal CRM --</option>`;
  
  CLIENTS_DB.forEach(c => {
    let label = esc(c.name);
    if (c.referent) label += ` (${esc(c.referent)})`;
    optionsHtml += `<option value="${c.id}">${label}</option>`;
  });
  
  if (editSelector) {
    editSelector.innerHTML = optionsHtml;
    editSelector.value = '';
  }
  if (formSelector) {
    formSelector.innerHTML = optionsHtml;
    formSelector.value = '';
  }
}

function autofillClientFromSelect(clientId, prefix) {
  if (!clientId) return;
  playSound('click');
  const c = CLIENTS_DB.find(client => client.id === clientId);
  if (!c) return;
  
  const titleEl = document.getElementById(prefix + 'Title');
  const refEl = document.getElementById(prefix + 'Referent');
  const emailEl = document.getElementById(prefix + 'Email');
  const waEl = document.getElementById(prefix + 'Whatsapp');
  
  if (titleEl) titleEl.value = c.name || '';
  if (refEl) refEl.value = c.referent || '';
  if (emailEl) emailEl.value = c.email || '';
  if (waEl) waEl.value = c.whatsapp || '';
  
  const sugContainer = document.getElementById(prefix + 'ClientSuggestions');
  if (sugContainer) sugContainer.classList.add('hidden');
  
  if (prefix === 'edit') {
    saveCardEdits(true);
  }
}

function handleClientInput(query, containerId, refInputId, emailInputId, waInputId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const q = query.toLowerCase().trim();
  if (!q) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }
  
  const matches = CLIENTS_DB.filter(c => c.name.toLowerCase().includes(q) || (c.referent && c.referent.toLowerCase().includes(q)));
  if (matches.length === 0) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }
  
  container.innerHTML = matches.map(m => `
    <div onclick="selectClientSuggestion('${jsArg(m.name)}', '${jsArg(m.referent)}', '${jsArg(m.email)}', '${jsArg(m.whatsapp)}', '${containerId}', '${refInputId}', '${emailInputId}', '${waInputId}')" class="px-3 py-2 hover:bg-indigo-600/30 text-slate-200 cursor-pointer text-xs border-b border-slate-800/60 last:border-0 truncate">
      <span class="font-bold text-white">${esc(m.name)}</span> ${m.referent ? `<span class="text-indigo-300">(${esc(m.referent)})</span>` : ''}
    </div>
  `).join('');
  
  container.classList.remove('hidden');
}

function selectClientSuggestion(name, referent, email, whatsapp, containerId, refInputId, emailInputId, waInputId) {
  const clientInputId = containerId === 'formClientSuggestions' ? 'formTitle' : 'editTitle';
  document.getElementById(clientInputId).value = name;
  
  if (refInputId && document.getElementById(refInputId)) document.getElementById(refInputId).value = referent || '';
  if (emailInputId && document.getElementById(emailInputId)) document.getElementById(emailInputId).value = email || '';
  if (waInputId && document.getElementById(waInputId)) document.getElementById(waInputId).value = whatsapp || '';
  
  document.getElementById(containerId).classList.add('hidden');
  
  if (containerId === 'editClientSuggestions') {
    saveCardEdits(true);
  }
}

function populateMachinesDropdowns() {
  const selects = [document.getElementById('formMachine'), document.getElementById('editMachine')];
  selects.forEach(select => {
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = `<option value="">Nessuno / Manuale</option>` + MACHINES_DB.map(m => `<option value="${m}">${m}</option>`).join('');
    select.value = currentVal;
  });
}

function populateGlobalFilterDropdown() {
  const select = document.getElementById('globalFilterType');
  if (!select) return;
  
  let typesSet = new Set();
  state.cards.forEach(c => {
    if (c.jobType) typesSet.add(c.jobType);
  });
  
  select.innerHTML = `<option value="">Tutte le lavorazioni</option>` + Array.from(typesSet).map(t => `<option value="${t}" ${globalFilterJobType === t ? 'selected' : ''}>${t}</option>`).join('');
}

function handleGlobalSearch(val) {
  globalSearchQuery = val.trim().toLowerCase();
  const clearBtn = document.getElementById('btnClearSearch');
  if (clearBtn) {
    if (globalSearchQuery) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }
  renderBoard();
}

function handleGlobalFilterChange() {
  globalFilterJobType = document.getElementById('globalFilterType').value;
  renderBoard();
}

function clearGlobalSearch() {
  document.getElementById('globalSearchInput').value = '';
  globalSearchQuery = '';
  document.getElementById('btnClearSearch').classList.add('hidden');
  renderBoard();
}

function openSettingsModal() {
  patchSettingsMenu();
  openModal('settingsModal');
  updateVersionLabel();
}

function renderArchiveList(query = '') {
  const q = query.toLowerCase().trim();
  let archived = state.cards.filter(c => c.stage === 'archiviato');
  
  if (q) {
    archived = archived.filter(c => (c.title||'').toLowerCase().includes(q) || (c.client||'').toLowerCase().includes(q) || (c.jobType||'').toLowerCase().includes(q) || (c.orderRef||'').toLowerCase().includes(q));
  }
  
  archived.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  if (archived.length === 0) return '<p class="text-xs text-slate-500 italic py-4 text-center">Nessuna commessa in archivio.</p>';
  
  return archived.map(c => `
    <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 hover:border-slate-500/50 transition-colors group flex justify-between items-center">
      <div onclick="openDetail('${c.id}')" class="flex-1 cursor-pointer">
        <h5 class="text-sm font-bold text-slate-200 group-hover:text-white transition-colors flex items-center gap-2 flex-wrap">${esc(c.title)}
          ${c.jobType ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-medium ${getJobTypeClass(c.jobType)}">${esc(c.jobType)}</span>` : ''}
          ${c.orderRef ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">Rif. ${esc(c.orderRef)}</span>` : ''}
        </h5>
        <div class="text-[10px] text-slate-400 mt-0.5">Inserimento: ${new Date(c.createdAt).toLocaleDateString('it-IT')}</div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="openDetail('${c.id}')" class="text-slate-600 hover:text-indigo-400 p-1.5 transition-colors cursor-pointer" title="Apri Dettaglio"><i data-lucide="external-link" class="w-4 h-4"></i></button>
        <button onclick="restoreArchivedCard('${c.id}')" class="text-slate-600 hover:text-emerald-400 p-1.5 transition-colors cursor-pointer" title="Riporta in Fatturato"><i data-lucide="undo-2" class="w-4 h-4"></i></button>
        <button onclick="deleteArchivedCard('${c.id}')" class="text-slate-600 hover:text-red-400 p-1.5 transition-colors cursor-pointer" title="Elimina Definitivamente"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
      </div>
    </div>
  `).join('');
}

function filterArchive(val) {
  const list = document.getElementById('archiveSettingsList');
  if (list) {
    list.innerHTML = renderArchiveList(val);
    lucide.createIcons();
  }
}

// ------------------------------------------
// ETICHETTA COLLI LIBERA
// ------------------------------------------
function renderFreeLabelTable() {
  const tbody = document.getElementById('freeLabelArticlesBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  window.tempFreeLabelArticles.forEach((art, idx) => {
    tbody.innerHTML += `
      <tr class="border-b border-slate-800/50 hover:bg-slate-900/50">
        <td class="py-1 pr-1"><input type="text" value="${esc(art.code)}" onchange="updateFreeLabelRow(${idx}, 'code', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-xs font-mono focus:border-indigo-500 outline-none"></td>
        <td class="py-1 px-1"><input type="text" value="${esc(art.desc)}" onchange="updateFreeLabelRow(${idx}, 'desc', this.value)" placeholder="Materiale..." class="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-xs focus:border-indigo-500 outline-none"></td>
        <td class="py-1 px-1"><input type="number" min="1" value="${art.qty}" onchange="updateFreeLabelRow(${idx}, 'qty', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-xs text-center focus:border-indigo-500 outline-none"></td>
        <td class="py-1 px-1"><input type="number" min="1" value="${art.packageNum}" onchange="updateFreeLabelRow(${idx}, 'packageNum', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-xs text-center focus:border-indigo-500 outline-none"></td>
        <td class="py-1 pl-1 text-center"><button onclick="removeFreeLabelRow(${idx})" class="text-red-400 hover:text-red-300 cursor-pointer"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button></td>
      </tr>
    `;
  });
  lucide.createIcons();
}

function addFreeLabelRow() {
  if (!window.tempFreeLabelArticles) {
    window.tempFreeLabelArticles = [];
  }
  window.tempFreeLabelArticles.push({ code: '', desc: '', qty: 1, packageNum: 1 });
  renderFreeLabelTable();
}

function updateFreeLabelRow(idx, field, val) {
  if (field === 'qty' || field === 'packageNum') {
    window.tempFreeLabelArticles[idx][field] = parseInt(val) || 1;
  } else {
    window.tempFreeLabelArticles[idx][field] = val;
  }
}

function removeFreeLabelRow(idx) {
  window.tempFreeLabelArticles.splice(idx, 1);
  renderFreeLabelTable();
}

// ------------------------------------------
// PANNELLO SOTTO-IMPOSTAZIONI
// ------------------------------------------
function openSubSettings(type) {
  activeSubSettingsType = type;
  if (type === 'archive') {
    loadArchivedCards().then(() => {
      const list = document.getElementById('archiveSettingsList');
      if (list && activeSubSettingsType === 'archive') {
        const si = document.getElementById('archiveSearchInput');
        list.innerHTML = renderArchiveList(si ? si.value : '');
        lucide.createIcons();
      }
    });
  }
  const titleEl = document.getElementById('subSettingsTitle');
  const contentEl = document.getElementById('subSettingsContent');
  contentEl.innerHTML = '';
  
  const saveBtn = document.querySelector('button[onclick="saveSubSettings()"]') || document.getElementById('btnSaveSubSettings');
  if (saveBtn) {
    if (type === 'colors') {
      saveBtn.classList.add('hidden');
      saveBtn.style.display = 'none';
    } else {
      saveBtn.classList.remove('hidden');
      saveBtn.style.display = '';
    }
  }
  
  if (type === 'crm') {
    window.editingClientId = null;
    titleEl.innerHTML = `<i data-lucide="users" class="w-5 h-5 text-indigo-400"></i> Gestione Clienti (CRM)`;
    contentEl.innerHTML = `
      <div class="space-y-4">
        <p class="text-xs text-slate-400">Gestisci l'anagrafica clienti con azienda, referente, email e WhatsApp:</p>
        <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2.5">
          <h5 class="text-xs font-bold text-indigo-400 uppercase">Aggiungi / Modifica Cliente</h5>
          <div class="grid grid-cols-2 gap-2">
            <input type="text" id="crmModalName" placeholder="Azienda / Cliente *" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500">
            <input type="text" id="crmModalRef" placeholder="Referente" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500">
          </div>
          <div class="grid grid-cols-2 gap-2">
            <input type="email" id="crmModalEmail" placeholder="Email" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500">
            <input type="text" id="crmModalWa" placeholder="WhatsApp" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500">
          </div>
          <button type="button" id="btnSaveCrmClient" onclick="addClientFromSettings()" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded font-semibold w-full cursor-pointer transition-colors">Salva Cliente in Archivio</button>
        </div>
        <div class="relative w-full">
          <i data-lucide="search" class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400"></i>
          <input type="text" id="settingsClientsSearch" autocomplete="off" oninput="filterSettingsClients()" placeholder="Cerca cliente (nome, referente, email)..." class="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500">
        </div>
        <div id="settingsClientsList" class="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          ${renderCrmSettingsList()}
        </div>
      </div>`;
  } else if (type === 'articles') {
    window.editingArticleIdx = null;
    titleEl.innerHTML = `<i data-lucide="shopping-cart" class="w-5 h-5 text-emerald-400"></i> Gestione Articoli Base`;
    contentEl.innerHTML = `
      <div class="space-y-4">
        <p class="text-xs text-slate-400">Gestisci gli articoli frequenti per l'autocompilazione rapida dei preventivi:</p>
        <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2.5">
          <h5 class="text-xs font-bold text-emerald-400 uppercase">Inserisci / Modifica Articolo</h5>
          <div class="grid grid-cols-4 gap-2">
            <input type="text" id="artModalCode" placeholder="Codice" class="col-span-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono">
            <input type="text" id="artModalDesc" placeholder="Descrizione Articolo *" class="col-span-2 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500">
            <input type="number" step="any" id="artModalPrice" placeholder="Prezzo € *" class="col-span-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 text-right">
          </div>
          <button type="button" id="btnSaveArticle" onclick="addArticleFromSettings()" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-2 rounded font-semibold w-full cursor-pointer transition-colors">Salva Articolo nel Database</button>
        </div>
        <div class="relative w-full">
          <i data-lucide="search" class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400"></i>
          <input type="text" id="settingsArticlesSearch" autocomplete="off" oninput="filterSettingsArticles()" placeholder="Cerca articolo (codice o descrizione)..." class="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500">
        </div>
        <div id="settingsArticlesList" class="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          ${renderArticlesSettingsList()}
        </div>
      </div>`;
  } else if (type === 'archive') {
    titleEl.innerHTML = `<i data-lucide="archive" class="w-5 h-5 text-slate-400"></i> Archivio Commesse`;
    contentEl.innerHTML = `
      <div class="space-y-4">
        <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center gap-2 flex-wrap">
          <div>
            <p class="text-xs font-bold text-slate-200 uppercase tracking-wider">Gestione Dati & Report</p>
            <p class="text-[10px] text-slate-400 mt-0.5">Memoria Locale Usata: <span id="storageUsageIndicator" class="font-mono font-bold text-emerald-400">Calcolo...</span></p>
          </div>
          <button onclick="playSound('click'); printArchiveReport();" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-transform">
            <i data-lucide="printer" class="w-4 h-4"></i> Stampa Report Fatturato
          </button>
        </div>
        <div class="relative w-full">
          <i data-lucide="search" class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400"></i>
          <input type="text" id="archiveSearchInput" oninput="filterArchive(this.value)" placeholder="Cerca nell'archivio..." class="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-500">
        </div>
        <div id="archiveSettingsList" class="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          ${renderArchiveList()}
        </div>
      </div>`;
    setTimeout(() => {
      updateStorageIndicator();
      lucide.createIcons();
    }, 50);
  } else if (type === 'messages') {
    titleEl.innerHTML = `<i data-lucide="message-square" class="w-5 h-5 text-pink-400"></i> Testo Notifiche (WhatsApp / Email)`;
    contentEl.innerHTML = `
      <div class="space-y-4">
        <p class="text-xs text-slate-400">Personalizza il testo inviato ai clienti per il ritiro merce. Usa le variabili magiche:</p>
        <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px] text-indigo-300">
          <div><strong class="text-pink-400 text-xs">{SALUTO}</strong> -> "Nome Referente della ditta Azienda"</div>
          <div><strong class="text-pink-400 text-xs">{TITOLO}</strong> -> Titolo della commessa</div>
          <div><strong class="text-pink-400 text-xs">{ARTICOLI}</strong> -> Elenco articoli in lista</div>
        </div>
        <textarea id="msgTemplateText" rows="10" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-pink-500 font-sans leading-relaxed">${sharedMsgTemplate}</textarea>
      </div>`;
  } else if (type === 'viewmode') {
    titleEl.innerHTML = `<i data-lucide="smartphone" class="w-5 h-5 text-teal-400"></i> Modalità di visione`;
    const cur = getViewMode();
    const names = { phone: 'iPhone', tablet: 'iPad', pc: 'PC / Mac' };
    const opt = (id, label, desc) => `
      <button type="button" onclick="setViewMode('${id}')" class="w-full text-left p-3 rounded-xl border ${cur === id ? 'border-teal-500 bg-teal-950/40' : 'border-slate-800 bg-slate-950 hover:border-slate-600'} cursor-pointer flex items-start gap-3">
        <span class="mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 ${cur === id ? 'border-teal-400 bg-teal-400' : 'border-slate-600'}"></span>
        <span><span class="block text-sm font-bold text-slate-100">${label}</span><span class="block text-xs text-slate-400">${desc}</span></span>
      </button>`;
    contentEl.innerHTML = `
      <div class="space-y-2">
        <p class="text-xs text-slate-400">La scelta vale solo per questo dispositivo: sull'iPhone la fai una volta e resta. Gli altri dispositivi non cambiano.</p>
        ${opt('auto', 'Automatico', 'Si adatta alla larghezza dello schermo (ora: ' + names[resolveViewMode()] + ')')}
        ${opt('phone', 'iPhone', 'Una colonna alla volta, finestre a tutto schermo, articoli uno sotto l\'altro.')}
        ${opt('tablet', 'iPad', 'Come la versione PC (nessuna differenza per ora).')}
        ${opt('pc', 'PC / Mac', 'La versione completa a schermo largo.')}
      </div>`;
  } else if (type === 'trash') {
    titleEl.innerHTML = `<i data-lucide="trash-2" class="w-5 h-5 text-red-400"></i> Cestino`;
    contentEl.innerHTML = `
      <div class="space-y-3">
        <p class="text-xs text-slate-400">Le commesse eliminate restano qui per 30 giorni: puoi ripristinarle.</p>
        <div id="trashList" class="space-y-2 max-h-[420px] overflow-y-auto pr-1"><p class="text-xs text-slate-500 italic py-4 text-center">Caricamento...</p></div>
      </div>`;
    setTimeout(loadTrashList, 30);
  } else if (type === 'jobtypes') {
    titleEl.innerHTML = `<i data-lucide="layers" class="w-5 h-5 text-orange-400"></i> Tipi di Lavorazione`;
    contentEl.innerHTML = `
      <div class="space-y-3">
        <p class="text-xs text-slate-400">Questo elenco compare nel menu "Tipo Lavorazione" delle commesse. Puoi rinominare una voce scrivendoci sopra, aggiungerne di nuove o toglierle.</p>
        <div class="flex gap-2">
          <input type="text" id="newJobTypeInput" placeholder="Nuova lavorazione (es. Ricamo cappellini)..." onkeydown="if(event.key==='Enter'){event.preventDefault(); addJobType();}" class="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500">
          <button type="button" onclick="addJobType()" class="bg-orange-600 hover:bg-orange-500 text-white text-xs px-3 py-2 rounded font-semibold cursor-pointer">Aggiungi</button>
        </div>
        <div id="settingsJobTypesList" class="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          ${JOB_TYPES_DB.map((t, idx) => `
            <div class="flex items-center gap-2 bg-slate-950 p-1.5 rounded border border-slate-800 text-xs">
              <input type="text" value="${esc(t)}" onchange="renameJobType(${idx}, this.value)" class="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500">
              <button onclick="removeJobType(${idx})" class="text-red-400 hover:text-red-300 p-1 cursor-pointer" title="Togli dall'elenco"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
            </div>
          `).join('')}
        </div>
        <button type="button" onclick="resetJobTypes()" class="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer">Ripristina l'elenco originale</button>
      </div>`;
  } else if (type === 'machines') {
    titleEl.innerHTML = `<i data-lucide="cpu" class="w-5 h-5 text-cyan-400"></i> Gestione Macchinari`;
    contentEl.innerHTML = `
      <div class="space-y-3">
        <p class="text-xs text-slate-400">Aggiungi o rimuovi i macchinari utilizzati:</p>
        <div class="flex gap-2">
          <input type="text" id="newMachineInput" placeholder="Nuovo macchinario (es. Roland SG2)..." class="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500">
          <button type="button" onclick="addMachine()" class="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-3 py-2 rounded font-semibold cursor-pointer">Aggiungi</button>
        </div>
        <div id="settingsMachinesList" class="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          ${MACHINES_DB.map((m, idx) => `
            <div class="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 text-xs">
              <span class="text-slate-200 font-medium">${m}</span>
              <button onclick="removeMachine(${idx})" class="text-red-400 hover:text-red-300 p-1 cursor-pointer"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
            </div>
          `).join('')}
        </div>
      </div>`;
  } else if (type === 'logo') {
    titleEl.innerHTML = `<i data-lucide="image" class="w-5 h-5 text-indigo-400"></i> Logo Aziendale`;
    contentEl.innerHTML = `
      <div class="space-y-3">
        <p class="text-xs text-slate-400">Carica il logo in PNG trasparente.</p>
        <div class="flex items-center gap-4">
          <div id="subSettingsLogoBox" class="w-32 h-14 bg-slate-950 border border-slate-700 rounded flex items-center justify-center overflow-hidden">
            ${sharedCompanyLogo ? `<img src="${sharedCompanyLogo}" class="max-h-full max-w-full object-contain">` : '<span class="text-[10px] text-slate-500">Nessun Logo</span>'}
          </div>
          <div class="flex gap-2">
            <label class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded font-semibold cursor-pointer transition-colors flex items-center gap-1.5">
              <i data-lucide="upload" class="w-3.5 h-3.5"></i> Carica Logo PNG
              <input type="file" accept="image/png, image/jpeg" class="hidden" onchange="uploadCompanyLogo(event); openSubSettings('logo');">
            </label>
            <button onclick="removeCompanyLogo();" class="bg-slate-800 hover:bg-slate-700 text-red-400 text-xs px-3 py-2 rounded font-semibold transition-colors cursor-pointer">Rimuovi</button>
          </div>
        </div>
      </div>`;
  } else if (type === 'alarms') {
    titleEl.innerHTML = `<i data-lucide="alarm-clock" class="w-5 h-5 text-indigo-400"></i> Gestione Sveglie Alert Scadenze`;
    contentEl.innerHTML = `
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <p class="text-xs text-slate-400">Crea sveglie per visualizzare l'avviso delle scadenze.</p>
          <button onclick="playSound('click'); addAlarmRule(); openSubSettings('alarms');" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded font-semibold flex items-center gap-1 cursor-pointer">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Aggiungi Sveglia
          </button>
        </div>
        <div id="alarmsListContainer" class="space-y-3 max-h-60 overflow-y-auto pr-1"></div>
      </div>`;
    setTimeout(renderAlarmsList, 50);
  } else if (type === 'colors') {
    titleEl.innerHTML = `<i data-lucide="printer" class="w-5 h-5 text-blue-400"></i> Stampa Etichetta Colli Libera`;
    window.tempFreeLabelArticles = [{code: '', desc: '', qty: 1, packageNum: 1}];
    contentEl.innerHTML = `
      <div class="space-y-4">
        <p class="text-xs text-slate-400">Genera etichette colli per spedizioni o imballi slegati dalle commesse.</p>
        <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-3">
            <div class="grid grid-cols-2 gap-2">
                <input type="text" id="freeLabelClient" placeholder="Destinatario / Azienda *" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 outline-none">
                <input type="text" id="freeLabelReferent" placeholder="Referente (Opzionale)" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 outline-none">
            </div>
            <div class="grid grid-cols-2 gap-2">
                <input type="text" id="freeLabelOrderRef" placeholder="Rif. Ordine (Opzionale)" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 outline-none">
                <input type="text" id="freeLabelNotes" placeholder="Note / Riferimenti" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 outline-none">
            </div>
            
            <div class="pt-2">
                <h5 class="text-xs font-bold text-slate-300 mb-2">Contenuto Colli</h5>
                <table class="w-full text-left text-xs">
                    <thead>
                      <tr class="text-slate-400 border-b border-slate-700">
                        <th class="pb-1">Codice</th>
                        <th class="pb-1">Descrizione</th>
                        <th class="pb-1 w-12 text-center">Q.tà</th>
                        <th class="pb-1 w-12 text-center">Collo</th>
                        <th class="pb-1 w-8"></th>
                      </tr>
                    </thead>
                    <tbody id="freeLabelArticlesBody"></tbody>
                </table>
                <button onclick="addFreeLabelRow()" class="mt-2 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 rounded bg-indigo-900/30 cursor-pointer">+ Aggiungi Riga Articolo</button>
            </div>
        </div>
        <button onclick="printFreeLabels()" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2">
          <i data-lucide="printer" class="w-4 h-4"></i> Genera e Scarica Etichetta
        </button>
      </div>
    `;
    setTimeout(() => {
      renderFreeLabelTable();
    }, 50);
  } else if (type === 'zoom') {
    titleEl.innerHTML = `<i data-lucide="type" class="w-5 h-5 text-indigo-400"></i> Visualizzazione & Zoom Caratteri`;
    contentEl.innerHTML = `
      <div class="space-y-5">
        <div class="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div class="flex justify-between items-center">
            <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider">Zoom Programmazione</h4>
            <span id="appFontSizeVal" class="font-mono text-indigo-400 font-bold text-xs bg-slate-900 px-2.5 py-1 rounded border border-slate-800">${appFontSizePx}px</span>
          </div>
          <input type="range" id="appFontRange" min="12" max="24" value="${appFontSizePx}" step="1" oninput="previewAppFontSize(this.value)" class="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-900 rounded-lg">
        </div>
        <div class="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div class="flex justify-between items-center">
            <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Zoom Master View</h4>
            <span id="masterFontSizeVal" class="font-mono text-emerald-400 font-bold text-xs bg-slate-900 px-2.5 py-1 rounded border border-slate-800">${masterFontSizePx}px</span>
          </div>
          <input type="range" id="masterFontRange" min="16" max="50" value="${masterFontSizePx}" step="1" oninput="previewMasterFontSize(this.value)" class="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-900 rounded-lg">
        </div>
      </div>`;
  }
  openModal('subSettingsModal');
  lucide.createIcons();
}

function closeSubSettings() {
  closeModal('subSettingsModal');
  activeSubSettingsType = null;
}

function filterSettingsClients() {
  const box = document.getElementById('settingsClientsList');
  if (!box) return;
  box.innerHTML = renderCrmSettingsList();
  lucide.createIcons();
}

function renderCrmSettingsList() {
  const qEl = document.getElementById('settingsClientsSearch');
  const q = qEl ? qEl.value.trim().toLowerCase() : '';
  const list = q ? CLIENTS_DB.filter(c => [c.name, c.referent, c.email, c.whatsapp].some(v => String(v || '').toLowerCase().includes(q))) : CLIENTS_DB;
  if (CLIENTS_DB.length === 0) return '<p class="text-xs text-slate-500 italic py-2">Nessun cliente in archivio.</p>';
  if (list.length === 0) return '<p class="text-xs text-slate-500 italic py-2">Nessun cliente trovato.</p>';
  return list.map(c => `
    <div onclick="loadClientForEdit('${c.id}')" class="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800 text-xs hover:border-indigo-500/50 cursor-pointer transition-colors group">
      <div>
        <span class="text-white font-bold">${esc(c.name)}</span> ${c.referent ? `<span class="text-indigo-300">(${esc(c.referent)})</span>` : ''}
        <div class="text-[10px] text-slate-400">${c.email ? 'Email: ' + esc(c.email) : ''} ${c.whatsapp ? '| WA: ' + esc(c.whatsapp) : ''}</div>
      </div>
      <div class="flex items-center gap-0.5 shrink-0"><button onclick="event.stopPropagation(); openClientHistory('${c.id}')" class="text-slate-500 hover:text-indigo-300 p-1 cursor-pointer transition-colors" title="Storico lavori del cliente"><i data-lucide="history" class="w-4 h-4"></i></button><button onclick="event.stopPropagation(); removeClient('${c.id}')" class="text-slate-600 group-hover:text-red-400 hover:!text-red-300 p-1 cursor-pointer transition-colors"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button></div>
    </div>
  `).join('');
}

function loadClientForEdit(clientId) {
  playSound('click');
  window.editingClientId = clientId;
  const c = CLIENTS_DB.find(client => client.id === clientId);
  if(!c) return;
  
  document.getElementById('crmModalName').value = c.name || '';
  document.getElementById('crmModalRef').value = c.referent || '';
  document.getElementById('crmModalEmail').value = c.email || '';
  document.getElementById('crmModalWa').value = c.whatsapp || '';
  
  const btn = document.getElementById('btnSaveCrmClient');
  btn.innerText = "Aggiorna Cliente";
  btn.classList.replace('bg-indigo-600', 'bg-emerald-600');
  btn.classList.replace('hover:bg-indigo-500', 'hover:bg-emerald-500');
}

function addClientFromSettings() {
  const name = document.getElementById('crmModalName').value.trim();
  const ref = document.getElementById('crmModalRef').value.trim();
  const email = document.getElementById('crmModalEmail').value.trim();
  const wa = document.getElementById('crmModalWa').value.trim();
  
  if (!name) return showInAppNotice("Inserisci almeno il nome del cliente/azienda.");
  
  const isDuplicate = CLIENTS_DB.find(c => c.name.toLowerCase() === name.toLowerCase() && (c.referent || '').toLowerCase() === ref.toLowerCase() && c.id !== window.editingClientId);
  if (isDuplicate) {
    playSound('alert');
    return showInAppNotice(`Esiste già il referente "${ref || 'Nessuno'}" per l'azienda "${name}".\nModifica la voce esistente per non creare duplicati.`);
  }
  
  if (window.editingClientId) {
    const idx = CLIENTS_DB.findIndex(c => c.id === window.editingClientId);
    if(idx >= 0) {
      CLIENTS_DB[idx] = { id: window.editingClientId, name, referent: ref, email, whatsapp: wa };
    }
    CLIENTS_DB.sort((a,b) => a.name.localeCompare(b.name));
    localStorage.setItem('workflow_sga_clients_db', JSON.stringify(CLIENTS_DB)); 
    window.editingClientId = null;
    populateClientSelectors();
    syncClientsToCloud();
  } else {
    registerClientAdvanced(name, ref, email, wa);
  }
  
  openSubSettings('crm');
  playSound('success');
}

function removeClient(clientId) {
  const c = CLIENTS_DB.find(client => client.id === clientId);
  if(!c) return;
  confirmDeletion(`Cliente dal CRM: ${c.name}`, () => {
    CLIENTS_DB = CLIENTS_DB.filter(client => client.id !== clientId);
    localStorage.setItem('workflow_sga_clients_db', JSON.stringify(CLIENTS_DB));
    populateClientSelectors();
    syncClientsToCloud();
    openSubSettings('crm');
  });
}

function addMachine() {
  const input = document.getElementById('newMachineInput');
  if (!input || !input.value.trim()) return;
  
  const mName = input.value.trim();
  if (!MACHINES_DB.includes(mName)) {
    MACHINES_DB.push(mName);
    localStorage.setItem('workflow_sga_machines_db', JSON.stringify(MACHINES_DB));
    populateMachinesDropdowns();
    openSubSettings('machines');
    playSound('success');
  }
  input.value = '';
}

function removeMachine(idx) {
  const m = MACHINES_DB[idx];
  confirmDeletion(`Macchinario: ${m}`, () => {
    MACHINES_DB.splice(idx, 1);
    localStorage.setItem('workflow_sga_machines_db', JSON.stringify(MACHINES_DB));
    populateMachinesDropdowns();
    openSubSettings('machines');
  });
}

function saveSubSettings() {
  if (activeSubSettingsType === 'alarms') {
    localStorage.setItem('workflow_sga_alarms', JSON.stringify(USER_ALARMS));
  }
  else if (activeSubSettingsType === 'zoom') {
    localStorage.setItem('workflow_sga_master_fontsize_px', masterFontSizePx);
    localStorage.setItem('workflow_sga_app_fontsize_px', appFontSizePx);
  }
  else if (activeSubSettingsType === 'messages') {
    const newTemplate = document.getElementById('msgTemplateText').value;
    sharedMsgTemplate = newTemplate;
    localStorage.setItem('workflow_sga_msg_template', sharedMsgTemplate);
    if (db) {
      db.collection('workflow_sga_settings').doc('config').set({ msgTemplate: sharedMsgTemplate }, { merge: true }).catch(e => console.error(e));
    }
  }
  playSound('success');
  closeSubSettings();
  showToast("Impostazioni salvate con successo!");
}

function resetDefaultSettings() {
  showInAppConfirm("Vuoi ripristinare tutti i valori predefiniti?", () => {
    COLUMNS_CONFIG = JSON.parse(JSON.stringify(DEFAULT_COLUMNS_CONFIG));
    USER_ALARMS = [];
    masterFontSizePx = 24;
    appFontSizePx = 15;
    sharedMsgTemplate = DEFAULT_MSG_TEMPLATE;
    
    localStorage.removeItem('workflow_sga_columns_config');
    localStorage.removeItem('workflow_sga_alarms');
    localStorage.removeItem('workflow_sga_master_fontsize_px');
    localStorage.removeItem('workflow_sga_app_fontsize_px');
    localStorage.removeItem('workflow_sga_msg_template');
    
    applyMasterFontSize(24);
    applyAppFontSize(15);
    closeModal('settingsModal');
    renderBoard();
    showInAppNotice("Ripristino completato.", "Fatto", 'ok');
  }, 'Ripristina');
}

function showArcadeAlert(cards) {
  playSound('alert');
  const listEl = document.getElementById('arcadeAlertList');
  listEl.innerHTML = '';
  
  cards.forEach(card => {
    const stageObj = COLUMNS_CONFIG.find(c => c.id === card.stage);
    const stageName = stageObj ? stageObj.label : card.stage;
    let timeText = '';
    let badgeColor = 'bg-orange-600 text-white';
    
    if (card.deliveryDate) {
      const delivery = new Date(card.deliveryDate);
      delivery.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);
      const diffDays = Math.ceil((delivery - today) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        timeText = `SCADUTA da ${Math.abs(diffDays)} giorni!`;
        badgeColor = 'bg-red-600 text-white animate-pulse';
      } else if (diffDays === 0) {
        timeText = 'Scade OGGI!';
        badgeColor = 'bg-red-600 text-white animate-pulse';
      } else if (diffDays <= 3) {
        timeText = `Scade tra ${diffDays} giorni (URGENTE)`;
        badgeColor = 'bg-amber-600 text-white';
      } else {
        timeText = `Scade tra ${diffDays} giorni`;
        badgeColor = 'bg-yellow-600 text-slate-950 font-bold';
      }
    } else {
      timeText = 'In Lavorazione';
      badgeColor = 'bg-indigo-600 text-white';
    }
    
    const item = document.createElement('div');
    item.className = "bg-black/70 border-2 border-red-500/60 p-4 rounded-xl flex justify-between items-center gap-4 shadow-lg";
    item.innerHTML = `
      <div class="overflow-hidden space-y-1">
        <h4 class="font-bold text-lg text-white truncate">${esc(card.title)}</h4>
        <p class="text-sm text-slate-300">Cliente: <span class="text-indigo-300">${esc(card.client || 'N/D')}</span> | Stato: <span class="text-yellow-300">${stageName}</span></p>
      </div>
      <div class="shrink-0 text-right space-y-1">
        <span class="text-xs px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider ${badgeColor}">${timeText}</span>
      </div>
    `;
    listEl.appendChild(item);
  });
  
  document.getElementById('arcadeAlertModal').classList.remove('hidden');
  lucide.createIcons();
  startAlertListScroll();
  
  const progressBar = document.getElementById('arcadeProgressBar');
  if (progressBar) {
    progressBar.style.transition = 'none';
    progressBar.style.width = '100%';
    setTimeout(() => {
      progressBar.style.transition = 'width 60s linear';
      progressBar.style.width = '0%';
    }, 50);
  }
  
  if (arcadeTimer) clearTimeout(arcadeTimer);
  arcadeTimer = setTimeout(() => {
    closeArcadeAlert();
  }, 60000); 
}

// Scorrimento automatico dell'elenco nell'avviso quando le commesse non ci stanno tutte
// (pausa agli estremi; si ferma se tocchi, usi la rotella o trascini)
let alertScrollRaf = null;
function stopAlertListScroll() {
  if (alertScrollRaf) cancelAnimationFrame(alertScrollRaf);
  alertScrollRaf = null;
}
function startAlertListScroll() {
  stopAlertListScroll();
  const list = document.getElementById('arcadeAlertList');
  if (!list) return;
  list.scrollTop = 0;
  let dir = 1, pause = 2500, last = 0, stopped = false;
  const halt = () => { stopped = true; stopAlertListScroll(); };
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(ev => list.addEventListener(ev, halt, { once: true, passive: true }));
  const speed = isMasterMode ? 0.07 : 0.04; // px per ms
  function step(ts) {
    if (stopped) return;
    if (!last) last = ts;
    const dt = Math.min(ts - last, 100);
    last = ts;
    if (list.scrollHeight > list.clientHeight + 2) {
      if (pause > 0) { pause -= dt; }
      else {
        list.scrollTop += speed * dt * dir;
        if (dir === 1 && list.scrollTop >= list.scrollHeight - list.clientHeight - 1) { dir = -1; pause = 2000; }
        else if (dir === -1 && list.scrollTop <= 0) { dir = 1; pause = 2500; }
      }
    }
    alertScrollRaf = requestAnimationFrame(step);
  }
  alertScrollRaf = requestAnimationFrame(step);
}

function closeArcadeAlert() {
  stopAlertListScroll();
  playSound('close');
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  document.getElementById('arcadeAlertModal').classList.add('hidden');
  if (arcadeTimer) {
    clearTimeout(arcadeTimer);
    arcadeTimer = null;
  }
}

function togglePlayPauseMaster() {
  isAutoScrollPaused = !isAutoScrollPaused;
  const icon = document.getElementById('masterPlayPauseIcon');
  const text = document.getElementById('masterPlayPauseText');
  
  if (isAutoScrollPaused) {
    if(icon) {
      icon.setAttribute('data-lucide', 'play');
      icon.classList.replace('text-amber-400', 'text-emerald-400');
    }
    if(text) text.innerText = 'Play';
  } else {
    if(icon) {
      icon.setAttribute('data-lucide', 'pause');
      icon.classList.replace('text-emerald-400', 'text-amber-400');
    }
    if(text) text.innerText = 'Pausa';
  }
  lucide.createIcons();
}

function toggleMasterMode() {
  isMasterMode = !isMasterMode;
  const body = document.body;
  const board = document.getElementById('board');
  const backBtns = document.querySelectorAll('.master-back-btn');
  
  if (isMasterMode) {
    body.classList.add('master-mode');
    backBtns.forEach(el => { el.classList.remove('hidden'); el.style.display = 'flex'; });
    isAutoScrollPaused = false;
    renderBoard();
    startAutoScroll();
  } else {
    body.classList.remove('master-mode');
    backBtns.forEach(el => { el.classList.add('hidden'); el.style.display = 'none'; });
    stopAutoScroll();
    if(board) board.scrollLeft = 0;
    renderBoard();
  }
  try { localStorage.setItem('sga_master_mode', isMasterMode ? '1' : '0'); } catch(e) {}
}

function startAutoScroll() {
  stopAutoScroll();
  autoScrollDir = 1;
  autoScrollPause = 0;
  const board = document.getElementById('board');
  
  function step(timestamp) {
    if (!isMasterMode) return;
    if (!lastScrollTime) lastScrollTime = timestamp;
    const elapsed = timestamp - lastScrollTime;
    
    if (isAutoScrollPaused) {
      lastScrollTime = timestamp;
      autoScrollId = requestAnimationFrame(step);
      return;
    }
    
    if (board) {
      const activeCols = board.querySelectorAll('.board-column');
      activeCols.forEach(col => {
        const dropzone = col.querySelector('.card-dropzone');
        if (dropzone && dropzone.scrollHeight > dropzone.clientHeight) {
          if (!dropzone.dataset.vDir) dropzone.dataset.vDir = 1;
          if (!dropzone.dataset.vPause) dropzone.dataset.vPause = 0;
          
          let vPause = parseFloat(dropzone.dataset.vPause);
          if (vPause > 0) {
            dropzone.dataset.vPause = vPause - elapsed;
          } else {
            let vDir = parseInt(dropzone.dataset.vDir);
            const pxToScrollV = (elapsed * masterScrollSpeed * 0.6);
            dropzone.scrollTop += (pxToScrollV * vDir);
            
            if (vDir === 1 && dropzone.scrollTop >= (dropzone.scrollHeight - dropzone.clientHeight - 2)) {
              dropzone.dataset.vDir = -1;
              dropzone.dataset.vPause = 2000;
            } else if (vDir === -1 && dropzone.scrollTop <= 0) {
              dropzone.dataset.vDir = 1;
              dropzone.dataset.vPause = 2000;
            }
          }
        }
      });
      
      if (board.scrollWidth > board.clientWidth) {
        if (autoScrollPause > 0) {
          autoScrollPause -= elapsed;
        } else {
          const pxToScroll = elapsed * masterScrollSpeed;
          board.scrollLeft += (pxToScroll * autoScrollDir);
          
          if (autoScrollDir === 1 && board.scrollLeft >= (board.scrollWidth - board.clientWidth - 2)) {
            autoScrollDir = -1;
            autoScrollPause = 2500;
          } else if (autoScrollDir === -1 && board.scrollLeft <= 0) {
            autoScrollDir = 1;
            autoScrollPause = 2500;
          }
        }
      }
    }
    
    lastScrollTime = timestamp;
    autoScrollId = requestAnimationFrame(step);
  }
  
  autoScrollId = requestAnimationFrame(step);
}

function stopAutoScroll() {
  if (autoScrollId) cancelAnimationFrame(autoScrollId);
  autoScrollId = null;
  lastScrollTime = 0;
}

function updateCloudStatus(isOnline) {
  const statusEl = document.getElementById('cloudStatus');
  let hasImgbb = IMGBB_API_KEY && IMGBB_API_KEY.trim() !== "" && IMGBB_API_KEY !== "INSERISCI_QUI_LA_TUA_CHIAVE_IMGBB";
  
  if (isOnline) {
    const hqIcon = hasImgbb ? `<span class="ml-1 px-1 bg-emerald-900 text-emerald-200 rounded text-[9px] font-bold border border-emerald-700">4K ON</span>` : '';
    statusEl.innerHTML = `<i data-lucide="wifi" class="w-3 h-3 text-emerald-500"></i> <span class="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">Cloud Attivo${hqIcon}</span>`;
  } else {
    statusEl.innerHTML = `<i data-lucide="hard-drive" class="w-3 h-3 text-slate-400"></i> <span class="text-slate-400 hover:text-slate-200 transition-colors">Modalità Locale</span>`;
  }
  lucide.createIcons();
}

function listenToCloudUpdates() {
  if (!db) return;
  
  db.collection('workflow_sga_settings').doc('config').onSnapshot((doc) => {
    if (doc.exists) {
      const data = doc.data();
      if (data.companyLogo !== undefined && data.companyLogo !== sharedCompanyLogo) {
        sharedCompanyLogo = data.companyLogo;
        localStorage.setItem('workflow_sga_company_logo', sharedCompanyLogo);
        loadCompanyLogo();
      }
      if (Array.isArray(data.jobTypes) && data.jobTypes.length && JSON.stringify(data.jobTypes) !== JSON.stringify(JOB_TYPES_DB)) {
        JOB_TYPES_DB = data.jobTypes.filter(x => typeof x === 'string' && x.trim());
        localStorage.setItem('workflow_sga_jobtypes_db', JSON.stringify(JOB_TYPES_DB));
        populateJobTypeSelects();
        if (activeSubSettingsType === 'jobtypes') openSubSettings('jobtypes');
      }
      if (typeof data.imgbbKey === 'string' && data.imgbbKey.trim() !== IMGBB_API_KEY) {
        IMGBB_API_KEY = data.imgbbKey.trim();
        try { localStorage.setItem('workflow_sga_imgbb_key', IMGBB_API_KEY); } catch (e) {}
        updateCloudStatus(true);
      }
      if (data.lastBackupAt) { try { localStorage.setItem('sga_last_backup', data.lastBackupAt); } catch (e) {} }
      if (data.msgTemplate !== undefined && data.msgTemplate !== sharedMsgTemplate) {
        sharedMsgTemplate = data.msgTemplate;
        localStorage.setItem('workflow_sga_msg_template', sharedMsgTemplate);
        const msgArea = document.getElementById('msgTemplateText');
        if (msgArea) msgArea.value = sharedMsgTemplate;
      }
    }
  });
  
  db.collection('workflow_sga_settings').doc('clients').onSnapshot((doc) => {
    if (doc.exists) {
      const data = doc.data();
      if (data.db && Array.isArray(data.db)) {
        CLIENTS_DB = data.db;
        localStorage.setItem('workflow_sga_clients_db', JSON.stringify(CLIENTS_DB));
        populateClientSelectors();
        if (activeSubSettingsType === 'crm') {
          openSubSettings('crm');
        }
      }
    } else {
      syncClientsToCloud();
    }
  });
  
  db.collection('workflow_sga_settings').doc('articles').onSnapshot((doc) => {
    if (doc.exists) {
      const data = doc.data();
      if (data.db && Array.isArray(data.db)) {
        ARTICLES_DB = data.db;
        localStorage.setItem('workflow_sga_articles_db', JSON.stringify(ARTICLES_DB));
        if (activeSubSettingsType === 'articles') {
          openSubSettings('articles');
        }
      }
    } else {
      syncArticlesToCloud();
    }
  });
  
  db.collection('workflow_sga_cards').where('stage', '!=', 'archiviato').onSnapshot((snapshot) => {
    let needsMigration = false;
    const magMigrated = new Set();
    const activeMap = new Map();

    snapshot.docs.forEach((d) => {
      let docData = d.data();
      if (!docData.id) docData.id = d.id;
      if (docData.stage === 'magazzino') magMigrated.add(docData.id);
      if (docData.stage === 'lavorato') {
        docData.stage = 'lavorato-da-bollettare';
        needsMigration = true;
      } else if (docData.stage === 'consegnato') {
        docData.stage = 'bollettato-da-consegnare';
        needsMigration = true;
      }
      activeMap.set(docData.id, sanitizeCard(docData));
    });

    // Le archiviate restano in memoria solo se l'archivio e' stato aperto
    const keepArchived = window.__archivedLoaded
      ? state.cards.filter(c => c && c.stage === 'archiviato' && !activeMap.has(c.id))
      : [];
    state.cards = [...activeMap.values(), ...keepArchived];
    state.cards.sort((a,b) => (a.order || 0) - (b.order || 0) || new Date(b.createdAt) - new Date(a.createdAt));

    const board = document.getElementById('board');
    const currentScroll = board ? board.scrollLeft : 0;

    // Dati confermati dal server: la vecchia copia locale non serve piu'
    if (!snapshot.metadata.fromCache) {
      try { localStorage.removeItem('workflow_sga_state'); } catch(e) {}
    }

    saveLocal();

    if (needsMigration) {
      state.cards.forEach(c => syncCardToCloud(c));
    }
    if (magMigrated.size) {
      // colonne unite: le commesse che erano "In magazzino" passano a "Magazzino / Da lavorare" nel cloud
      state.cards.filter(c => magMigrated.has(c.id)).forEach(c => syncCardToCloud(c));
      showToast(magMigrated.size + (magMigrated.size === 1 ? ' commessa spostata' : ' commesse spostate') + ' in "Magazzino / Da lavorare"');
    }
    if (!window.__firstCardsSnapshotDone) {
      window.__firstCardsSnapshotDone = true;
      checkAutoArchive();
      setTimeout(maybeRemindBackup, 6000);
    }

    populateGlobalFilterDropdown();

    if (isMasterMode && board) {
      board.scrollLeft = currentScroll;
    }
  }, (err) => {
    console.error(err);
    showToast('⚠️ Errore di sincronizzazione con il cloud');
  });
}

function syncCardToCloud(card) {
  if (!db || !card) return;
  db.collection('workflow_sga_cards').doc(card.id).set(card, { merge: true }).catch(err => {
    console.error(err);
    showToast('⚠️ Salvataggio sul cloud NON riuscito. Controlla la connessione.');
  });
}

// Carica le commesse archiviate solo quando servono (archivio, report, backup)
function loadArchivedCards() {
  if (!db) return Promise.resolve();
  return db.collection('workflow_sga_cards').where('stage', '==', 'archiviato').get().then((snap) => {
    const activeCards = state.cards.filter(c => c && c.stage !== 'archiviato');
    const activeIds = new Set(activeCards.map(c => c.id));
    const archived = snap.docs.map(d => sanitizeCard(d.data())).filter(c => c && !activeIds.has(c.id));
    state.cards = [...activeCards, ...archived];
    window.__archivedLoaded = true;
  }).catch((e) => {
    console.error(e);
    showToast("⚠️ Impossibile caricare l'archivio");
  });
}

function syncDeleteToCloud(cardId) {
  if (!db || !cardId) return;
  db.collection('workflow_sga_cards').doc(cardId).delete().catch(e => console.error(e));
}

function compressImage(file, maxWidth, maxHeight, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


function convertPdfToImage(file, scaleFactor, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        const typedarray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: scaleFactor });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

async function extractArticlesArubaLegacy(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let items = [];
    let inProductsSection = false;
    let lastItemY = null;
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      let rowsMap = {};
      
      textContent.items.forEach(item => {
        let str = item.str.trim();
        if (!str) return;
        let y = Math.round(item.transform[5]);
        let x = Math.round(item.transform[4]);
        let foundY = Object.keys(rowsMap).find(yKey => Math.abs(parseFloat(yKey) - y) <= 5);
        let targetY = foundY !== undefined ? foundY : y;
        
        if (!rowsMap[targetY]) rowsMap[targetY] = [];
        rowsMap[targetY].push({ text: str, x: x });
      });
      
      let sortedYKeys = Object.keys(rowsMap).sort((a, b) => parseFloat(b) - parseFloat(a));
      
      for (let yKey of sortedYKeys) {
        let rowItems = rowsMap[yKey];
        rowItems.sort((a, b) => a.x - b.x);
        for (let q = rowItems.length - 1; q > 0; q--) {
          if (rowItems[q].text.trim() === '%' && /^[-+]?\d+([.,]\d+)?$/.test(rowItems[q - 1].text.trim())) {
            rowItems[q - 1].text = rowItems[q - 1].text.trim() + ' %';
            rowItems.splice(q, 1);
          }
        }
        let rowTextFull = rowItems.map(r => r.text).join(' ');
        let lower = rowTextFull.toLowerCase();
        
        if (inProductsSection && (lower.includes('metodo di pagamento') || lower.includes('totale imponibile') || lower.includes('totale documento'))) {
          inProductsSection = false;
          break;
        }
        
        if (lower.includes('prodotti e servizi')) {
          inProductsSection = true;
          continue;
        }
        
        if (inProductsSection) {
          if (lower.includes('descrizione') && lower.includes('prezzo')) continue;
          
          let moneyItems = rowItems.filter(r => r.text.includes('€') || r.text.match(/^(\d{1,3}(\.\d{3})*|\d+)[,\.]\d{2}$/));
          
          if (moneyItems.length >= 1) {
            let unitPriceItem = moneyItems[0];
            let priceVal = parseFloat(unitPriceItem.text.replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.'));
            let qty = 1;
            let possibleQtys = rowItems.filter(r => r.x < unitPriceItem.x && r.text.match(/^\d+$/));
            
            if (possibleQtys.length > 0) {
              qty = parseInt(possibleQtys[possibleQtys.length - 1].text);
            }
            
            let tax = 22;
            // IVA = percentuale senza segno (lo sconto ha il segno: -60,00 %)
            let taxItem = rowItems.filter(r => r.text.includes('%') && !/^[-+]/.test(r.text.trim())).pop();
            if (taxItem) {
              let taxMatch = taxItem.text.match(/(\d+)\s*%/);
              if (taxMatch) tax = parseInt(taxMatch[1]);
            }
            // Sconto (o maggiorazione) della riga: colonna SC/MG, es. -60,00 %
            let rowDiscount = 0;
            const scItem = rowItems.find(r => /^[-+]\s?\d+([.,]\d+)?\s*%$/.test(r.text.trim()));
            if (scItem) {
              const sv = parseFloat(scItem.text.replace('%', '').replace(/\s/g, '').replace(',', '.'));
              if (isFinite(sv) && sv < 0 && sv >= -100) rowDiscount = Math.abs(sv);
              else if (isFinite(sv) && sv > 0) priceVal = Math.round(priceVal * (1 + sv / 100) * 10000) / 10000;
            }
            
            let rightBoundX = possibleQtys.length > 0 ? possibleQtys[possibleQtys.length - 1].x : unitPriceItem.x;
            let descItems = rowItems.filter(r => r.x < rightBoundX);
            
            if (descItems.length > 0 && descItems[0].text.match(/^\d+$/)) {
              descItems.shift();
            }
            
            let desc = descItems.map(r => r.text).join(' ').trim();
            if (desc) {
              const it = { code: '', desc: desc, qty: qty, price: priceVal, tax: tax };
              if (rowDiscount > 0) it.discount = rowDiscount;
              items.push(it);
              lastItemY = parseFloat(yKey);
            }
          } else if (items.length > 0 && lastItemY !== null && (lastItemY - parseFloat(yKey)) < 22 && lastItemY - parseFloat(yKey) > 0 && !/^\d+$/.test(rowItems[0].text) && rowTextFull.length < 160 && !rowItems.some(r => r.text.includes('%'))) {
            // riga di sola descrizione: continuazione dell'articolo precedente
            items[items.length - 1].desc += ' ' + rowTextFull.trim();
            lastItemY = parseFloat(yKey);
          }
        }
      }
    }
    
    if (items.length === 0) {
      items.push({ code: '', desc: 'Preventivo: ' + file.name, qty: 1, price: 0, tax: 22 });
    }
    return items;
  } catch (e) {
    return [{ code: '', desc: 'Preventivo: ' + file.name, qty: 1, price: 0, tax: 22 }];
  }
}

// ==========================================
// IMPORT INTELLIGENTE ORDINI / PREVENTIVI (gratuito, nel browser)
// 1) formato Aruba (invariato)  2) tabelle con intestazione (layout di qualsiasi cliente)
// 3) riconoscimento a righe  4) segnaposto con il nome del file
// ==========================================
async function getPdfRows(pdf) {
  const allRows = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const rows = [];
    tc.items.forEach(it => {
      const str = (it.str || '').trim();
      if (!str) return;
      const y = it.transform[5], x = it.transform[4], w = it.width || 0;
      let row = rows.find(r => Math.abs(r.y - y) <= 4);
      if (!row) { row = { y: y, items: [] }; rows.push(row); }
      row.items.push({ text: str, x: x, w: w });
    });
    rows.sort((a, b) => b.y - a.y);
    rows.forEach(r => {
      r.items.sort((a, b) => a.x - b.x);
      r.text = r.items.map(i => i.text).join(' ');
      r.page = p;
      allRows.push(r);
    });
  }
  return allRows;
}

function parseItNumber(s) {
  if (s === null || s === undefined) return NaN;
  let t = String(s).replace(/[€\s]/g, '').replace(/%$/, '');
  if (!/^-?[\d.,]+$/.test(t) || !/\d/.test(t)) return NaN;
  if (t.indexOf(',') !== -1) t = t.replace(/\./g, '').replace(',', '.');
  else if ((t.match(/\./g) || []).length > 1) t = t.replace(/\./g, '');
  const v = parseFloat(t);
  return isNaN(v) ? NaN : v;
}

function classifyHeaderToken(raw) {
  const t = (raw || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!t) return null;
  if (/^(q\.?t[àa]|qt[àa]|q\.?ta|quantit|qty|quantity|pz\b|pezzi|n\.? ?pezzi|nr\.? ?pz)/.test(t)) return 'qty';
  if (/(prezzo|unitar|price|p\.? ?u\.?$|€ ?\/)/.test(t)) return 'price';
  if (/^(sconto|sc\.|sc\b|disc|% ?sc)/.test(t)) return 'discount';
  if (/^(iva|% ?iva|aliq|vat)/.test(t)) return 'tax';
  if (/^(importo|totale|tot\.|amount|total|valore|netto)/.test(t)) return 'total';
  if (/^(descri|prodott|articol|denomin|servizi|lavoraz|oggetto|item|dettagli)/.test(t)) return 'desc';
  if (/^(cod|sku|rif|ref)/.test(t)) return 'code';
  if (/^(u\.? ?m\.?$|um$|unit[àa]$)/.test(t)) return 'um';
  return null;
}

function buildHeaderColumns(row) {
  const toks = [];
  row.items.forEach(it => {
    const last = toks[toks.length - 1];
    if (last && (it.x - (last.x + last.w)) < 6) {
      last.text += ' ' + it.text;
      last.w = (it.x + it.w) - last.x;
    } else {
      toks.push({ text: it.text, x: it.x, w: it.w });
    }
  });
  const cols = [];
  toks.forEach(tk => {
    const type = classifyHeaderToken(tk.text);
    if (type && !cols.find(c => c.type === type)) cols.push({ type: type, x: tk.x, w: tk.w });
  });
  return cols;
}

function isValidHeader(cols) {
  return cols.length >= 2 && cols.some(c => c.type === 'desc') && cols.some(c => ['qty', 'price', 'total'].includes(c.type));
}

const IMPORT_NUMERIC_COLS = ['qty', 'price', 'discount', 'tax', 'total'];
const IMPORT_STOP_REGEX = /totale\s+(imponibile|documento|merce|ordine|fattura|iva|netto|generale|complessivo)|imponibile|metodo di pagamento|condizioni di pagamento|modalit[àa] di pagamento|\biban\b|riepilogo iva/i;

function assignRowToColumns(row, cols) {
  const cell = {};
  const numCols = cols.filter(c => IMPORT_NUMERIC_COLS.includes(c.type));
  const txtCols = cols.filter(c => !IMPORT_NUMERIC_COLS.includes(c.type));
  const firstNumX = numCols.length ? Math.min(...numCols.map(c => c.x)) : Infinity;
  row.items.forEach(it => {
    let target = null;
    const isNum = !isNaN(parseItNumber(it.text)) && numCols.length && (it.x + it.w) > firstNumX - 15;
    if (isNum) {
      let best = Infinity;
      const ic = it.x + it.w / 2, ir = it.x + it.w;
      numCols.forEach(c => {
        const d = Math.min(Math.abs(ic - (c.x + c.w / 2)), Math.abs(ir - (c.x + c.w)), Math.abs(it.x - c.x));
        if (d < best) { best = d; target = c; }
      });
      if (best > 60) target = null;
    }
    if (!target && txtCols.length) {
      const cand = txtCols.filter(c => c.x <= it.x + 12);
      target = cand.length ? cand[cand.length - 1] : txtCols[0];
    }
    if (!target) target = cols[0];
    (cell[target.type] = cell[target.type] || []).push(it);
  });
  return cell;
}

function cellToArticle(cell) {
  const txt = k => (cell[k] || []).map(i => i.text).join(' ').trim();
  const num = k => {
    const v = (cell[k] || []).map(i => parseItNumber(i.text)).filter(v => !isNaN(v));
    return v.length ? v[0] : NaN;
  };
  const desc = txt('desc');
  const code = txt('code');
  let qty = num('qty'), price = num('price'), total = num('total'), tax = num('tax'), disc = num('discount');
  if (isNaN(price) && isNaN(total)) return null;
  if (!desc && !code) return null;
  if (isNaN(qty) || qty <= 0) qty = 1;
  if (isNaN(price)) price = total / qty;
  if (isNaN(tax) || tax < 0 || tax > 30) tax = 22;
  const art = { code: code, desc: desc || code, qty: qty, price: Math.round(price * 10000) / 10000, tax: tax };
  if (!isNaN(disc) && disc > 0 && disc <= 100) art.discount = disc;
  return art;
}

function extractArticlesByHeader(rows) {
  let cols = null;
  const items = [];
  let lastRow = null;
  for (const row of rows) {
    if (!cols) {
      const c = buildHeaderColumns(row);
      if (isValidHeader(c)) { cols = c; lastRow = row; }
      continue;
    }
    if (IMPORT_STOP_REGEX.test(row.text)) {
      if (items.length > 0) break;
      continue;
    }
    const maybeHeader = buildHeaderColumns(row);
    if (isValidHeader(maybeHeader)) { cols = maybeHeader; lastRow = row; continue; }

    const art = cellToArticle(assignRowToColumns(row, cols));
    if (art) {
      items.push(art);
    } else if (items.length > 0 && lastRow && lastRow.page === row.page && (lastRow.y - row.y) < 22) {
      // riga di sola descrizione: continuazione dell'articolo precedente
      const onlyText = row.items.every(i => isNaN(parseItNumber(i.text)));
      if (onlyText && row.text.length < 160) items[items.length - 1].desc += ' ' + row.text;
    }
    lastRow = row;
  }
  return items;
}

function extractArticlesHeuristic(rows) {
  const SKIP = /(totale|imponibile|\biva\b|p\.? ?iva|c\.? ?f\.?|iban|\btel\b|fax|\bpec\b|\bcap\b|spedizione|bollo|acconto|scadenza|pagamento|banca)/i;
  const MONEY = /^-?(\d{1,3}(\.\d{3})+|\d+),\d{2}$/;
  const items = [];
  rows.forEach(row => {
    if (SKIP.test(row.text)) return;
    const money = row.items.filter(i => MONEY.test(i.text.replace(/[€\s]/g, '')));
    if (!money.length) return;
    const firstMoneyX = money[0].x;
    const left = row.items.filter(i => i.x < firstMoneyX - 1);
    if (!left.length) return;
    const intTokens = left.filter(i => /^\d+([,.]0+)?$/.test(i.text));
    let qty = 1;
    let qtyItem = null;
    if (intTokens.length) {
      qtyItem = intTokens[intTokens.length - 1];
      qty = parseInt(qtyItem.text, 10) || 1;
    }
    let descItems = left.filter(i => i !== qtyItem);
    if (descItems.length && /^\d+$/.test(descItems[0].text)) descItems.shift();
    const desc = descItems.map(i => i.text).join(' ').trim();
    if ((desc.match(/[A-Za-zÀ-ÿ]/g) || []).length < 3) return;
    const vals = money.map(m => parseItNumber(m.text));
    let price = vals[0];
    if (vals.length >= 2 && qty > 1 && Math.abs(vals[0] * qty - vals[vals.length - 1]) > 0.02 * Math.max(1, vals[vals.length - 1])) {
      price = vals[vals.length - 1] / qty;
    }
    items.push({ code: '', desc: desc, qty: qty, price: Math.round(price * 10000) / 10000, tax: 22 });
  });
  return items;
}

function extractOrderMeta(rows) {
  const meta = {};
  for (const row of rows) {
    const t = row.text;
    if (!meta.orderRef) {
      const m = t.match(/(?:ordine(?: di acquisto| cliente)?|order(?: no\.?| number)?|preventivo|offerta|conferma d['’]ordine|rif\.? ?ordine)\s*(?:n\.?|nr\.?|n°|no\.?|num\.?|numero|#)?\s*[:\-]?\s*([A-Z0-9\/\-_.]*\d[A-Z0-9\/\-_.]*)/i);
      if (m && m[1].length <= 25) meta.orderRef = m[1].replace(/[.\-_\/]+$/, '');
    }
    if (!meta.deliveryDate) {
      const d = t.match(/consegna[^0-9]{0,30}(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/i);
      if (d) {
        const dd = parseInt(d[1], 10), mm = parseInt(d[2], 10);
        const yy = d[3].length === 2 ? '20' + d[3] : d[3];
        if (dd >= 1 && dd <= 31 && mm >= 1 && mm <= 12) {
          meta.deliveryDate = `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
        }
      }
    }
    if (meta.docNet === undefined) {
      const n = t.match(/imponibile[^\d]{0,15}(-?\d{1,3}(?:\.\d{3})*,\d{2})/i);
      if (n) meta.docNet = parseItNumber(n[1]);
    }
  }
  return meta;
}


// ==========================================
// LETTORI SPECIFICI PER CLIENTE (ordini): Sabelt e Omler
// Si attivano solo se nel PDF si riconosce il cliente; altrimenti resta tutto come prima.
// ==========================================
const IT_DATE_RE = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;

function itDateToIso(str) {
  const m = String(str || '').match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (!m) return '';
  const dd = parseInt(m[1], 10), mm = parseInt(m[2], 10);
  const yy = m[3].length === 2 ? '20' + m[3] : m[3];
  if (dd < 1 || dd > 31 || mm < 1 || mm > 12) return '';
  return yy + '-' + String(mm).padStart(2, '0') + '-' + String(dd).padStart(2, '0');
}

function detectSupplierLayout(rows) {
  const all = rows.map(r => r.text).join('\n');
  if (/SABELT/i.test(all) && /Ordine\s*fornitore/i.test(all)) return 'sabelt';
  if (/O\.\s?M\.\s?LER/i.test(all) && /Ordine\s*d\s*['’`]?\s*acquisto/i.test(all)) return 'omler';
  return '';
}

function minIsoDate(list) {
  const ok = list.filter(Boolean).sort();
  return ok.length ? ok[0] : '';
}

// SABELT: Riga | Articolo | Nome | Quantita' UM | Consegna | Valuta | Prezzo | Unita' di prezzo | Sconto | Importo
function explodeRowWords(row) {
  // Divide ogni blocco di testo in parole, con la posizione stimata: cosi' la lettura non dipende
  // da come la versione di pdf.js raggruppa il testo (es. "200,00 nr" in un blocco o in due)
  const words = [];
  row.items.forEach(it => {
    const txt = String(it.text || '');
    const len = Math.max(1, txt.length);
    const w = it.w || 0;
    const re = /\S+/g;
    let m;
    while ((m = re.exec(txt)) !== null) {
      words.push({ text: m[0], x: it.x + (w * m.index / len), w: w * m[0].length / len });
    }
  });
  words.sort((a, b) => a.x - b.x);
  return words;
}

function extractSabeltOrder(rows) {
  const meta = {};
  const items = [];
  const dates = [];

  // Riferimento ordine: "Ordine OF00049323 del 15/10/2026"
  for (let i = 0; i < rows.length - 1; i++) {
    const r = rows[i];
    if (r.items.length && /^Ordine$/i.test(r.items[0].text) && r.items.some(x => /^Data$/i.test(x.text))) {
      const nr = rows[i + 1];
      const ws = explodeRowWords(nr);
      const num = ws[0];
      const dt = ws.find(x => IT_DATE_RE.test(x.text));
      if (num) meta.orderRef = 'Ordine ' + num.text + (dt ? ' del ' + dt.text : '');
      break;
    }
  }
  if (!meta.orderRef) {
    const all = rows.map(r => r.text).join('\n');
    const m = all.match(/\b(OF\d{6,})\b/);
    const d = all.match(/\bOF\d{6,}\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/);
    if (m) meta.orderRef = 'Ordine ' + m[1] + (d ? ' del ' + d[1] : '');
  }

  const NUM_RE = /^\d{1,3}(?:\.\d{3})*,\d{1,3}$/;
  let started = false, ended = false;
  let cur = null; // { item, qtyX, lastY }
  for (const row of rows) {
    const t = row.text;
    if (!started) {
      if (/\bRiga\b/.test(t) && /Articolo/.test(t) && /Importo/.test(t)) started = true;
      continue;
    }
    if (/Vogliate indicare|^\s*Buyer\b/.test(t)) ended = true;
    if (/\bTOTALE\b/.test(t)) {
      const tot = t.match(/(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/);
      if (tot) meta.docNet = parseItNumber(tot[1]);
      break;
    }
    if (ended) continue;

    const ws = explodeRowWords(row);
    const di = ws.findIndex(w => IT_DATE_RE.test(w.text));
    // riga articolo: "<riga> <codice> ... <quantita> <UM> <data consegna> EUR <prezzo> <unita prezzo> <sconto> <importo>"
    const head = ws.filter(w => w.x < 150).map(w => w.text);
    const mh = head.length >= 2 && /^\d+$/.test(head[0]) && /^[A-Za-z0-9][A-Za-z0-9\-_.\/]*$/.test(head[1]);
    let qi = -1;
    if (di > 0) {
      let k = di - 1;
      if (/^[A-Za-z]{1,4}$/.test(ws[k].text)) k--;          // unita' di misura (nr, pz...)
      if (k >= 0 && NUM_RE.test(ws[k].text)) qi = k;
    }
    if (mh && qi >= 0) {
      const qtyW = ws[qi];
      const qty = parseItNumber(qtyW.text);
      const eurIdx = ws.findIndex((w, i) => i > di && /^[A-Z]{3}$/.test(w.text));
      const nums = (eurIdx >= 0 ? ws.slice(eurIdx + 1) : []).map(w => parseItNumber(w.text)).filter(v => !isNaN(v));
      let price = NaN, disc = 0, amount = NaN;
      if (nums.length >= 4) {
        price = nums[0] / (nums[1] > 0 ? nums[1] : 1);
        disc = Math.abs(nums[2]);
        amount = nums[3];
      } else if (nums.length >= 1) {
        price = nums[0];
        amount = nums[nums.length - 1];
      }
      if (isNaN(price) && !isNaN(amount) && qty > 0) price = amount / qty;
      if (isNaN(price)) continue;
      // descrizione = parole tra il codice e la quantita'; salta il numero di versione (colonna stretta a ridosso del codice)
      const descWords = ws.filter(w => w.x >= 150 && w.x < qtyW.x - 2 && !(/^\d+$/.test(w.text) && w.x < 190));
      const art = {
        code: head[1],
        desc: descWords.map(w => w.text).join(' ').trim() || head[1],
        qty: (isNaN(qty) || qty <= 0) ? 1 : qty,
        price: Math.round(price * 10000) / 10000,
        tax: 22
      };
      if (disc > 0 && disc <= 100) art.discount = disc;
      items.push(art);
      dates.push(itDateToIso(ws[di].text));
      cur = { item: art, qtyX: qtyW.x, lastY: row.y };
    } else if (cur && ws.length && ws.every(w => w.x >= 150 && w.x < cur.qtyX - 2) && (cur.lastY - row.y) < 20 && (cur.lastY - row.y) > 0) {
      cur.item.desc += ' ' + ws.map(w => w.text).join(' ');
      cur.lastY = row.y;
    } else {
      cur = null;
    }
  }
  meta.deliveryDate = minIsoDate(dates);
  return { items: items, meta: meta };
}

// OMLER (O.M.LER 2000 s.r.l e O.M.LER s.r.l.): Pos. | Cod. Articolo | Descrizione | ... | U.M. | Quantita' | Prezzo | Sconti | Importo | Consegna
function extractOmlerOrder(rows) {
  const meta = {};
  const items = [];
  const dates = [];

  // Riferimento ordine: "Ordine 3713/OF del 27/10/2026" (numero documento + data documento)
  for (let i = 0; i < rows.length - 1; i++) {
    const r = rows[i];
    if (!(/Numero\s*doc/i.test(r.text) && /Data\s*doc/i.test(r.text))) continue;
    const hw = explodeRowWords(r);
    const hNum = hw.find(w => /^Numero$/i.test(w.text));
    const hDat = hw.find((w, k) => /^Data$/i.test(w.text) && hw[k + 1] && /^doc/i.test(hw[k + 1].text));
    if (!hNum || !hDat) continue;
    // i valori possono stare su una o due righe sotto l'intestazione (es. il numero di pagina e' un po' piu' in alto)
    let nw = [];
    for (let k = 1; k <= 4 && rows[i + k]; k++) {
      if (r.y - rows[i + k].y < 30) nw = nw.concat(explodeRowWords(rows[i + k]));
    }
    const closest = (hx, test) => nw.filter(test).sort((a, b) => Math.abs(a.x - hx) - Math.abs(b.x - hx))[0];
    const num = closest(hNum.x, w => /\d/.test(w.text) && w.text.length <= 20 && !IT_DATE_RE.test(w.text));
    const dat = closest(hDat.x, w => IT_DATE_RE.test(w.text));
    if (num) meta.orderRef = 'Ordine ' + num.text + (dat ? ' del ' + dat.text : '');
    break;
  }

  let cols = null; // { descX, descEnd, umX }
  let cur = null;  // { item, lastY }
  for (const row of rows) {
    const t = row.text;
    if (!cols) {
      if (/\bPos\b/.test(t) && /Cod\.\s*Articolo/i.test(t) && /Importo/i.test(t)) {
        const hw = explodeRowWords(row);
        const d = hw.find(w => /^Descrizione/i.test(w.text));
        const u = hw.find(w => /^U\.?\s?M\.?$/i.test(w.text));
        if (d && u) {
          // la colonna descrizione finisce dove inizia la prima colonna successiva (Comm., Gruppo o U.M.)
          const ends = hw.filter(w => w.x > d.x + 20 && /^(Comm\.?|Gruppo|U\.?\s?M\.?)$/i.test(w.text)).map(w => w.x);
          cols = { descX: d.x, descEnd: Math.min.apply(null, ends.concat([u.x])) - 3, umX: u.x };
        }
      }
      continue;
    }
    if (/Totale documento/i.test(t)) {
      const tot = t.match(/(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/);
      if (tot) meta.docNet = parseItNumber(tot[1]);
      break;
    }
    if (/Sconti\/maggiorazioni|Spese di (trasporto|incasso|imballo)/i.test(t)) { cur = null; continue; }

    const ws = explodeRowWords(row);
    const first = ws[0];
    const dateW = ws.find(w => IT_DATE_RE.test(w.text));
    const isArticleRow = first && /^\d+$/.test(first.text) && first.x < 60 && dateW;
    if (isArticleRow) {
      const nums = ws.filter(w => w.x >= cols.umX - 5 && !IT_DATE_RE.test(w.text)).map(w => parseItNumber(w.text)).filter(v => !isNaN(v));
      if (nums.length < 3) { cur = null; continue; }
      const qty = nums[0], price = nums[1], amount = nums[nums.length - 1];
      let disc = 0;
      if (nums.length >= 4) disc = Math.abs(nums[2]);
      else if (qty * price > 0 && Math.abs(qty * price - amount) > 0.02) disc = Math.round((1 - amount / (qty * price)) * 10000) / 100;
      const codeW = ws.slice(1).find(w => w.x < cols.descX - 3);
      const code = codeW && codeW.text !== '-' ? codeW.text : '';
      const descW = ws.filter(w => w.x >= cols.descX - 5 && w.x < cols.descEnd);
      const art = {
        code: code,
        desc: descW.map(w => w.text).join(' ').trim() || code || 'Articolo',
        qty: qty > 0 ? qty : 1,
        price: Math.round(price * 10000) / 10000,
        tax: 22
      };
      if (disc > 0 && disc <= 100) art.discount = disc;
      items.push(art);
      dates.push(itDateToIso(dateW.text));
      cur = { item: art, lastY: row.y };
    } else if (cur && ws.length && ws.every(w => w.x >= cols.descX - 5 && w.x < cols.descEnd) && (cur.lastY - row.y) < 20 && (cur.lastY - row.y) > 0) {
      cur.item.desc += ' ' + ws.map(w => w.text).join(' ');
      cur.lastY = row.y;
    } else {
      cur = null;
    }
  }
  meta.deliveryDate = minIsoDate(dates);
  return { items: items, meta: meta };
}

function extractSupplierOrder(rows) {
  const kind = detectSupplierLayout(rows);
  if (kind === 'sabelt') return extractSabeltOrder(rows);
  if (kind === 'omler') return extractOmlerOrder(rows);
  return null;
}

async function extractArticlesFromArubaPdf(file) {
  const T0 = performance.now();
  // Lettura delle righe del PDF (serve per i layout non Aruba e per i dati dell'ordine)
  let rows = [];
  try {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    rows = await getPdfRows(pdf);
  } catch (e) { rows = []; }
  const T1 = performance.now();

  // 0) Ordini di clienti riconosciuti (Sabelt, Omler): lettore dedicato
  try {
    const supKind = rows.length ? detectSupplierLayout(rows) : '';
    if (supKind) console.log('[TEMPI-SGA] cliente riconosciuto: ' + supKind);
    const sup = supKind ? extractSupplierOrder(rows) : null;
    if (supKind && sup && sup.items.length === 0) console.log('[TEMPI-SGA] cliente riconosciuto ma nessuna riga letta: uso il lettore generico');
    if (sup && sup.items.length > 0) {
      console.log('[TEMPI-SGA] lettore cliente: ' + sup.items.length + ' articoli');
      const supMeta = {};
      if (sup.meta.orderRef) supMeta.orderRef = sup.meta.orderRef;
      if (sup.meta.deliveryDate) supMeta.deliveryDate = sup.meta.deliveryDate;
      if (sup.meta.docNet !== undefined && !isNaN(sup.meta.docNet)) supMeta.docNet = sup.meta.docNet;
      return { articles: sup.items.map(a => Object.assign({}, a)), meta: supMeta };
    }
  } catch (e) { console.error('Lettore cliente non riuscito, uso quello generico', e); }

  // 1) Formato Aruba: logica originale (con sconto e descrizioni su piu' righe)
  const legacy = await extractArticlesArubaLegacy(file);
  console.log('[TEMPI-SGA] lettore: righe PDF ' + Math.round(T1 - T0) + ' ms | lettore Aruba ' + Math.round(performance.now() - T1) + ' ms');
  const isPlaceholder = legacy.length === 1 && String(legacy[0].desc || '').indexOf('Preventivo: ') === 0 && !legacy[0].price;

  let items = [];
  if (!isPlaceholder) {
    items = legacy;
  } else if (rows.length) {
    try {
      // 2) tabella con intestazione, 3) riconoscimento a righe
      items = extractArticlesByHeader(rows);
      if (items.length === 0) items = extractArticlesHeuristic(rows);
    } catch (e) { items = []; }
  }
  if (items.length === 0) items = legacy; // 4) segnaposto

  let meta = {};
  try { meta = extractOrderMeta(rows); } catch (e) { meta = {}; }
  const star = applyStarCodes(items.map(a => Object.assign({}, a)));
  if (star.warn) meta.starWarn = star.warn;
  return { articles: star.items, meta: meta };
}

// Preventivi Aruba fatti da noi: la descrizione inizia con *CODICE* - descrizione
// Il codice (anche con spazi: *Tarvisio Man*) va nella colonna codice, il resto resta descrizione.
// Se la riga ha il formato incompleto (asterisco senza chiusura) resta com'e' e viene segnalata.
function applyStarCodes(items) {
  let warn = 0;
  const re = /^\s*\*\s*([^*\n]{1,30}?)\s*\*\s*[-\u2013\u2014\u2212]\s*([\s\S]+)$/;
  const out = items.map(a => {
    const d = String(a.desc || '');
    if (!/^\s*\*/.test(d)) return a;
    const m = d.match(re);
    if (m && m[1].trim() && m[2].trim()) return Object.assign({}, a, { code: m[1].trim(), desc: m[2].trim() });
    warn++;
    return a;
  });
  return { items: out, warn };
}

// Confronta il totale imponibile letto dal PDF con la somma degli articoli importati
function checkImportTotals(items, meta) {
  const base = checkImportTotalsBase(items, meta);
  if (meta && meta.starWarn) {
    const w = '⚠️ ' + meta.starWarn + (meta.starWarn === 1 ? ' riga inizia' : ' righe iniziano') + ' con un asterisco ma il codice non è nel formato *CODICE* - descrizione (massimo 30 caratteri tra gli asterischi). Le ho lasciate come sono.';
    return base ? w + '\n\n' + base : w;
  }
  return base;
}

function checkImportTotalsBase(items, meta) {
  const m = meta;
  if (!m || m.docNet === undefined || isNaN(m.docNet)) return '';
  if (!items.some(a => a.price > 0)) return '';
  const sum = items.reduce((s, a) => s + (parseFloat(a.qty) || 0) * (parseFloat(a.price) || 0) * (1 - (parseFloat(a.discount) || 0) / 100), 0);
  if (Math.abs(sum - m.docNet) <= 0.05) return '';
  return `⚠️ Controlla gli articoli importati.\nTotale imponibile letto dal documento: € ${m.docNet.toFixed(2)}\nSomma degli articoli importati: € ${sum.toFixed(2)}\n(può mancare qualche riga o uno sconto)`;
}


// Rete di sicurezza: il nuovo lettore non deve mai bloccare l'inserimento o il caricamento di un documento
async function extractArticlesSafe(file) {
  const fallback = () => ({ articles: [{ code: '', desc: 'Preventivo: ' + file.name, qty: 1, price: 0, tax: 22 }], meta: {} });
  try {
    const result = await Promise.race([
      extractArticlesFromArubaPdf(file),
      new Promise((resolve) => setTimeout(() => resolve(null), 20000))
    ]);
    if (!result || !Array.isArray(result.articles) || result.articles.length === 0) return fallback();
    // Copia pulita: solo numeri e testi, nessun valore che Firebase possa rifiutare
    const clean = result.articles.map(a => {
      const o = {
        code: String(a.code || ''),
        desc: String(a.desc || ''),
        qty: Number.isFinite(parseFloat(a.qty)) ? parseFloat(a.qty) : 1,
        price: Number.isFinite(parseFloat(a.price)) ? parseFloat(a.price) : 0,
        tax: Number.isFinite(parseFloat(a.tax)) ? parseFloat(a.tax) : 22
      };
      const d = parseFloat(a.discount);
      if (Number.isFinite(d) && d > 0) o.discount = d;
      return o;
    });
    return { articles: clean, meta: result.meta || {} };
  } catch (e) {
    console.error('Lettura PDF non riuscita:', e);
    return fallback();
  }
}


// Avviso interno al programma (al posto della finestra di Chrome)
function showInAppNotice(message, title, tone) {
  const old = document.getElementById('sgaNotice');
  if (old) old.remove();
  const box = document.createElement('div');
  box.id = 'sgaNotice';
  box.className = 'fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4';
  const inner = document.createElement('div');
  const isOk = tone === 'ok';
  inner.className = 'max-w-md w-full bg-slate-900 border ' + (isOk ? 'border-emerald-500/40' : 'border-amber-500/40') + ' rounded-2xl shadow-2xl p-5 space-y-3';
  const h = document.createElement('div');
  h.className = (isOk ? 'text-emerald-300' : 'text-amber-300') + ' font-bold text-base';
  h.textContent = title || (isOk ? 'Fatto' : 'Attenzione');
  const m = document.createElement('div');
  m.className = 'text-slate-200 text-sm whitespace-pre-line';
  m.textContent = String(message || '').replace(/^\u26a0\ufe0f\s*/, '');
  const b = document.createElement('button');
  b.className = 'w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg cursor-pointer';
  b.textContent = 'OK, ho capito';
  b.onclick = () => box.remove();
  inner.appendChild(h); inner.appendChild(m); inner.appendChild(b);
  box.appendChild(inner);
  document.body.appendChild(box);
}


// Domanda di conferma interna (al posto della finestra di Chrome): l'azione parte solo se premi Conferma
function showInAppConfirm(message, onConfirm, confirmLabel, title) {
  const old = document.getElementById('sgaConfirm');
  if (old) old.remove();
  const box = document.createElement('div');
  box.id = 'sgaConfirm';
  box.className = 'fixed inset-0 z-[410] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4';
  const inner = document.createElement('div');
  inner.className = 'max-w-md w-full bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl p-5 space-y-4';
  const h = document.createElement('div');
  h.className = 'text-indigo-300 font-bold text-base';
  h.textContent = title || 'Conferma';
  const m = document.createElement('div');
  m.className = 'text-slate-200 text-sm whitespace-pre-line';
  m.textContent = String(message || '');
  const row = document.createElement('div');
  row.className = 'flex gap-2';
  const no = document.createElement('button');
  no.className = 'flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg cursor-pointer';
  no.textContent = 'Annulla';
  no.onclick = () => box.remove();
  const yes = document.createElement('button');
  yes.className = 'flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg cursor-pointer';
  yes.textContent = confirmLabel || 'Conferma';
  yes.onclick = () => { box.remove(); try { onConfirm(); } catch (e) { console.error(e); } };
  row.appendChild(no); row.appendChild(yes);
  inner.appendChild(h); inner.appendChild(m); inner.appendChild(row);
  box.appendChild(inner);
  document.body.appendChild(box);
}

// Avviso se si prova a chiudere o ricaricare la pagina mentre un allegato sta ancora caricando
window.addEventListener('beforeunload', function (e) {
  const busy = (state.cards || []).some(c => isCardUploading(c));
  if (busy) { e.preventDefault(); e.returnValue = ''; return ''; }
});

// Caricamento allegato in secondo piano: la commessa compare subito, la rotellina sparisce a fine invio
const UPLOAD_MAX_MS = 3 * 60 * 1000;
function isCardUploading(card) {
  return !!(card && card.uploading && (Date.now() - card.uploading) < UPLOAD_MAX_MS);
}
function refreshUploadingUI(card) {
  try {
    if (typeof renderBoard === 'function') renderBoard();
    if (card && card.id === activeCardId) {
      renderAttachments(card);
      renderArticlesTable(card);
    }
  } catch (e) { console.error(e); }
}
async function finishBackgroundUpload(cardId, imgData, imgbbKey, keepSpinner) {
  let photo = null;
  let imgbbFailed = false;
  let imgbbReason = '';
  try {
    if (imgData) {
      if (imgbbKey) {
        try {
          const formData = new FormData();
          formData.append('image', imgData.split(',')[1]);
          const tU = performance.now();
          const response = await fetch('https://api.imgbb.com/1/upload?key=' + imgbbKey, { method: 'POST', body: formData });
          let data = null;
          try { data = await response.json(); } catch (je) { data = null; }
          console.log('[TEMPI-SGA] invio a ImgBB: ' + Math.round(performance.now() - tU) + ' ms (stato ' + response.status + ', immagine ' + Math.round(imgData.length / 1024) + ' KB)');
          if (data && data.success) photo = { image: data.data.url, rotation: 0 };
          else {
            const apiMsg = data && data.error && (data.error.message || data.error) ? String(data.error.message || data.error) : '';
            throw new Error('Risposta ImgBB: stato ' + response.status + (apiMsg ? ' - ' + apiMsg : ''));
          }
        } catch (e) {
          console.error(e);
          imgbbReason = (e && e.message ? e.message : String(e)) + ' | immagine ' + Math.round(imgData.length / 1024) + ' KB';
          // Come in origine: se ImgBB non risponde, l'immagine resta nella commessa in alta qualita'
          imgbbFailed = true;
          photo = { image: imgData, rotation: 0 };
        }
      } else {
        photo = { image: imgData, rotation: 0 };
      }
    }
  } catch (e) { console.error(e); }

  const card = state.cards.find(c => c.id === cardId);
  if (!card) {
    if (imgbbFailed) showInAppNotice("Il documento non è stato caricato sul server ImgBB.");
    return;
  }
  if (!Array.isArray(card.photos)) card.photos = [];
  if (photo) card.photos.push(photo);
  if (!keepSpinner) delete card.uploading;
  try {
    if (db) {
      const upd = { photos: card.photos };
      if (!keepSpinner) upd.uploading = firebase.firestore.FieldValue.delete();
      await db.collection('workflow_sga_cards').doc(cardId).set(upd, { merge: true });
    }
  } catch (e) {
    console.error(e);
    showToast('\u26a0\ufe0f Salvataggio allegato NON riuscito. Controlla la connessione.');
  }
  refreshUploadingUI(card);
  if (imgbbFailed) {
    showInAppNotice(
      'Il documento della commessa "' + (card.title || 'Senza titolo') + '" non è stato caricato sul server ImgBB.\n\n' +
      "L'allegato è comunque stato salvato dentro la commessa, in alta qualità. Se vuoi caricarlo anche su ImgBB, eliminalo e riallegalo più tardi." +
      (imgbbReason ? "\n\nDettaglio tecnico: " + imgbbReason : ''),
      'Caricamento su ImgBB non riuscito'
    );
  }
}

function sanitizeCard(card) {
  if (!card) return null;
  
  if (!Array.isArray(card.photos)) card.photos = [];
  card.photos = card.photos.map(p => {
    if (typeof p === 'string') return { image: p, rotation: 0 };
    if (!p.rotation) p.rotation = 0;
    return p;
  });
  
  if (!Array.isArray(card.history)) card.history = [];
  if (card.order === undefined) card.order = 0;
  if (!card.referent) card.referent = '';
  if (!card.email) card.email = '';
  if (!card.whatsapp) card.whatsapp = '';
  if (!card.machine) card.machine = '';
  if (!card.orderRef) card.orderRef = '';
  if (!Array.isArray(card.checklist)) card.checklist = [];
  
  if (card.stage === 'lavorato') card.stage = 'lavorato-da-bollettare';
  if (card.stage === 'consegnato') card.stage = 'bollettato-da-consegnare';
  if (card.stage === 'magazzino') {
    card.stage = 'da-lavorare';
    card.history.push({ stage: 'da-lavorare', label: 'Spostata da "In magazzino" a "Magazzino / Da lavorare" (colonne unite)', timestamp: new Date().toISOString() });
  }
  
  if (!Array.isArray(card.articles)) {
    card.articles = [];
    if (card.notes && card.notes.trim()) {
      card.articles.push({ code: '', desc: card.notes, qty: 1, price: 0, tax: 22, discount: 0 });
    }
  } else {
    card.articles = card.articles.map(art => {
      if (art.tax === undefined) art.tax = 22;
      if (art.discount === undefined) art.discount = 0;
      return art;
    });
  }
  
  return card;
}

function loadState() {
  state = { cards: [] };
  return;
  const saved = localStorage.getItem('workflow_sga_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.cards)) {
        state.cards = parsed.cards.map(c => sanitizeCard(c)).filter(c => c !== null);
      } else {
        state = { cards: [] };
      }
    } catch(e) {
      state = { cards: [] };
    }
  } else {
    state = { cards: [] };
  }
}

function saveLocal() {
  // Le commesse vivono su Firebase (con cache offline propria): qui ridisegniamo soltanto
  renderBoard();
}

async function exportBackup() {
  await loadArchivedCards();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "workflow_sga_backup.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
  markBackupDone();
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const importedState = JSON.parse(e.target.result);
      if (importedState && Array.isArray(importedState.cards)) {
        let count = 0;
        importedState.cards.forEach(card => {
           const safeCard = sanitizeCard(card);
           if (safeCard) {
             safeCard.id = 'c' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
             state.cards.push(safeCard);
             syncCardToCloud(safeCard);
             if (safeCard.client) {
               registerClientAdvanced(safeCard.client, safeCard.referent, safeCard.email, safeCard.whatsapp);
             }
             count++;
           }
        });
        state.cards.sort((a,b) => (a.order || 0) - (b.order || 0));
        saveLocal();
        playSound('success');
        showInAppNotice(`Backup ripristinato con successo! Importate ${count} commesse.`, 'Fatto', 'ok');
      }
    } catch(err) {
      showInAppNotice("Errore lettura file.");
    }
  };
  reader.readAsText(file);
  event.target.value = ''; 
}

// Contatore in alto, solo Master View: commesse per colonna + scadute/oggi
function updateMasterCounter() {
  const box = document.getElementById('masterCounter');
  if (!box) return;
  if (!isMasterMode) { box.innerHTML = ''; return; }
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let overdue = 0, dueToday = 0;
  const active = (state.cards || []).filter(c => c && c.stage !== 'archiviato');
  active.forEach(c => {
    if (!c.deliveryDate || c.stage === 'bollettato-da-consegnare' || c.stage === 'fatturato') return;
    const d = new Date(c.deliveryDate); d.setHours(0, 0, 0, 0);
    if (isNaN(d.getTime())) return;
    const diff = Math.round((d - today) / 86400000);
    if (diff < 0) overdue++; else if (diff === 0) dueToday++;
  });
  const pills = COLUMNS_CONFIG.map(col => ({ col, n: active.filter(c => c.stage === col.id).length })).filter(x => x.n > 0)
    .map(x => `<span class="mc-pill">${esc(x.col.label)} <b>${x.n}</b></span>`).join('');
  box.innerHTML = pills
    + `<span class="mc-pill mc-alert ${overdue ? 'mc-red' : ''}">Scadute <b>${overdue}</b></span>`
    + `<span class="mc-pill mc-alert ${dueToday ? 'mc-amber' : ''}">Oggi <b>${dueToday}</b></span>`;
}

function renderBoard() {
  const board = document.getElementById('board');
  if (!board) return;
  updateMasterCounter();
  board.innerHTML = '';
  
  if (!state || !Array.isArray(state.cards)) {
    state = { cards: [] };
  }
  
  let columnsToRender = COLUMNS_CONFIG;
  if (isMasterMode) {
    columnsToRender = COLUMNS_CONFIG.filter(col => state.cards.some(c => c && c.stage === col.id));
    if (columnsToRender.length === 0) {
      board.innerHTML = `
        <div class="w-full flex flex-col items-center justify-center text-slate-500 py-20">
          <i data-lucide="check-circle-2" class="w-16 h-16 mb-4 text-emerald-500/50"></i>
          <h2 class="text-2xl font-bold">Nessuna commessa attiva.</h2>
        </div>`;
      lucide.createIcons();
      return;
    }
  }
  
  let renderedCount = 0;
  columnsToRender.forEach(col => {
    let colCards = state.cards.filter(c => c && c.stage === col.id);
    
    if (globalSearchQuery) {
      colCards = colCards.filter(c => {
        const t = (c.title || '').toLowerCase();
        const cl = (c.client || '').toLowerCase();
        const ref = (c.referent || '').toLowerCase();
        const oref = (c.orderRef || '').toLowerCase();
        const jt = (c.jobType || '').toLowerCase();
        const mach = (c.machine || '').toLowerCase();
        const idMatch = c.id && c.id.toLowerCase().includes(globalSearchQuery);
        
        return t.includes(globalSearchQuery) || cl.includes(globalSearchQuery) || ref.includes(globalSearchQuery) || oref.includes(globalSearchQuery) || jt.includes(globalSearchQuery) || mach.includes(globalSearchQuery) || idMatch;
      });
    }
    
    if (globalFilterJobType) {
      colCards = colCards.filter(c => c.jobType === globalFilterJobType);
    }
    if (globalFilterDeadline) colCards = colCards.filter(cardMatchesDeadline);
    renderedCount += colCards.length;
    
    colCards.sort((a,b) => (a.order || 0) - (b.order || 0));
    
    const colEl = document.createElement('div');
    colEl.className = `board-column flex flex-col h-full bg-slate-900/60 rounded-xl border border-slate-800 shrink-0 overflow-hidden`;
    
    colEl.innerHTML = `
      <div class="p-3 border-b border-slate-800 ${col.color} ${col.border} flex justify-between items-center bg-opacity-30">
        <h3 class="font-bold uppercase tracking-wide truncate max-w-[80%]">${col.label}</h3>
        <span class="font-semibold bg-slate-950/60 px-2 py-0.5 rounded-full shadow-inner">${colCards.length}</span>
      </div>
      <div class="flex-1 overflow-y-auto p-2 space-y-2 card-dropzone" data-col="${col.id}" ondragover="allowDrop(event)" ondrop="handleDrop(event)">
        ${colCards.map(card => createCardHTML(card)).join('')}
      </div>`;
      
    board.appendChild(colEl);
  });
  
  updateBoardWarning(renderedCount);
  lucide.createIcons();
}

function getContrastTextColor(hexColor) {
  if (!hexColor) return '#f8fafc';
  let c = hexColor.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
  return ((r * 299 + g * 587 + b * 114) / 1000) >= 128 ? '#0f172a' : '#f8fafc';
}

function getSavedLabelPackageCount(card) {
  const items = card && card.labelPackages && Array.isArray(card.labelPackages.items)
    ? card.labelPackages.items
    : [];
  const packageNumbers = items
    .filter(item => item && item.desc && item.desc.trim())
    .map(item => Math.max(1, parseInt(item.packageNum, 10) || 1));
  return new Set(packageNumbers).size;
}

function createCardHTML(card) {
  if (!card) return '';
  const badgeStyle = getJobTypeClass(card.jobType);
  let isUrgent = false;
  
  if (card.deliveryDate && card.stage !== 'bollettato-da-consegnare' && card.stage !== 'fatturato' && card.stage !== 'archiviato') {
    const delivery = new Date(card.deliveryDate);
    delivery.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (Math.ceil((delivery - today) / (1000 * 60 * 60 * 24)) <= 7) isUrgent = true;
  }
  
  let customCardStyle = '', customTextStyle = '', customSubTextStyle = 'text-slate-400', baseCardClass = 'bg-slate-900 border border-slate-800';
  
  if (card.customColor && card.customColor !== '') {
    const contrastColor = getContrastTextColor(card.customColor);
    customCardStyle = `background-color: ${card.customColor}; border-color: ${card.customColor};`;
    customTextStyle = `color: ${contrastColor};`;
    baseCardClass = 'border shadow-md';
    customSubTextStyle = contrastColor === '#0f172a' ? 'text-slate-800 font-semibold' : 'text-slate-200';
  }
  
  const deliveryHTML = card.deliveryDate ? `
    <div class="flex items-center gap-1.5 mt-1 mb-1 font-bold ${isUrgent && !card.customColor ? 'text-red-400 bg-red-950/40 border border-red-900/60 animate-pulse' : ''} px-2 py-1 rounded w-fit text-xs" style="${card.customColor ? `background: rgba(0,0,0,0.15); ${customTextStyle}` : ''}">
      <i data-lucide="calendar" class="w-3.5 h-3.5"></i> Consegna: ${new Date(card.deliveryDate).toLocaleDateString('it-IT')}
    </div>` : '';
    
  const machineBadgeHTML = card.machine ? `
    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 mt-1">
      <i data-lucide="cpu" class="w-3 h-3"></i> ${esc(card.machine)}
    </span>` : '';
    
  const thumbnailHTML = card.photos && card.photos.length > 0 ? `
    <div class="mt-2 flex gap-1 overflow-hidden h-14">
      ${card.photos.map(p => `
        <div class="w-14 h-14 shrink-0 overflow-hidden rounded border border-slate-700 bg-slate-900 flex items-center justify-center">
          <img src="${p.image}" style="transform: rotate(${p.rotation || 0}deg);" class="min-w-full min-h-full object-cover bg-white">
        </div>`).join('')}
    </div>` : '';
  
  const referentHTML = card.referent ? `
    <div class="truncate text-xs flex items-center gap-1.5 ${customSubTextStyle}">
      <i data-lucide="user" class="w-3.5 h-3.5 shrink-0"></i> 
      <span class="text-indigo-300 font-semibold">${esc(card.referent)}</span>
    </div>` : '';
    
  const orderRefHTML = card.orderRef ? `
    <div class="mt-1">
      <span class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">Rif: ${esc(card.orderRef)}</span>
    </div>` : '';
  
  const checklistTotal = Array.isArray(card.checklist) ? card.checklist.length : 0;
  const checklistDone = checklistTotal ? card.checklist.filter(i => i.done).length : 0;
  const checklistBadgeHTML = checklistTotal ? `
    <div class="mt-1">
      <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono ${checklistDone === checklistTotal ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-slate-800 text-slate-300 border-slate-700'}">
        <i data-lucide="check-square" class="w-3 h-3"></i> ${checklistDone}/${checklistTotal}
      </span>
    </div>` : '';

  const notesBadgeHTML = (card.jobNotes && String(card.jobNotes).trim()) ? `
    <div class="mt-1">
      <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] bg-amber-950 text-amber-300 border-amber-800">
        <i data-lucide="sticky-note" class="w-3 h-3"></i> Note
      </span>
    </div>` : '';

  const staleDays = staleInfo(card);
  const staleBadgeHTML = staleDays ? `
    <div class="mt-1">
      <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] bg-yellow-950 text-yellow-300 border-yellow-700" title="Nessun movimento da ${staleDays} giorni">
        <i data-lucide="hourglass" class="w-3 h-3"></i> Ferma da ${staleDays} gg
      </span>
    </div>` : '';

  const uploadingBadgeHTML = isCardUploading(card) ? `
    <div class="mt-1">
      <span class="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-indigo-500/40 bg-indigo-950/60 text-indigo-300 text-[10px] font-semibold">
        <span class="inline-block w-3 h-3 rounded-full border-2 border-indigo-300 border-t-transparent animate-spin"></span> Caricamento allegato...
      </span>
    </div>` : '';

  const cardIdShort = card.id ? card.id.slice(-4).toUpperCase() : '0000';
  
  const notifyIconHTML = (card.stage === 'bollettato-da-consegnare' && (card.email || card.whatsapp)) ? `
    <button onclick="event.stopPropagation(); triggerNotifyById('${card.id}')" class="ml-2 p-1 bg-emerald-500/20 hover:bg-emerald-500/50 text-emerald-400 rounded cursor-pointer transition-colors" title="Invia Notifica Pronto Ritiro">
      <i data-lucide="mail" class="w-3.5 h-3.5"></i>
    </button>` : '';
    
  const savedPackageCount = getSavedLabelPackageCount(card);
  const printLabelIconHTML = (card.stage === 'lavorato-da-bollettare' || savedPackageCount > 0) ? `
    <span class="ml-2 inline-flex items-center gap-1">
      <button onclick="event.stopPropagation(); openLabelPrintModal('${card.id}')" class="p-1 bg-blue-500/20 hover:bg-blue-500/50 text-blue-400 rounded cursor-pointer transition-colors" title="${savedPackageCount > 0 ? 'Ristampa o modifica etichette colli' : 'Stampa etichette colli'}">
        <i data-lucide="printer" class="w-3.5 h-3.5"></i>
      </button>
      ${savedPackageCount > 0 ? `<span class="px-1.5 py-0.5 rounded bg-blue-950/70 border border-blue-500/40 text-blue-300 text-[10px] font-semibold">${savedPackageCount} ${savedPackageCount === 1 ? 'collo' : 'colli'}</span>` : ''}
    </span>` : '';

  return `
    <div draggable="true" ondragstart="handleDragStart(event)" id="card-${card.id}" data-id="${card.id}" onclick="${isMasterMode ? '' : `playSound('click'); openDetail('${card.id}')`}" style="${customCardStyle}" class="${baseCardClass} hover:border-indigo-500/50 p-3.5 rounded-lg shadow-md cursor-pointer transition-all active:scale-95 space-y-2 group relative ${isUrgent ? 'card-urgent' : ''}">
      <div class="flex justify-between items-start gap-1">
        <span class="px-2 py-0.5 rounded font-medium text-[11px] ${badgeStyle}">${esc(card.jobType || 'Generico')}</span>
        <span class="text-xs" style="${card.customColor ? customTextStyle : 'color: #64748b;'}">${card.createdAt ? new Date(card.createdAt).toLocaleDateString('it-IT', {day: 'numeric', month: 'short'}) : ''}</span>
      </div>
      <h4 class="font-bold text-sm leading-snug truncate transition-colors" style="${card.customColor ? customTextStyle : 'color: #f8fafc;'}">${esc(card.title || 'Senza Titolo')}</h4>
      
      ${referentHTML}
      ${orderRefHTML}
      ${uploadingBadgeHTML}
      ${checklistBadgeHTML}
      ${notesBadgeHTML}
      ${staleBadgeHTML}
      ${machineBadgeHTML}
      ${deliveryHTML}
      ${thumbnailHTML}
      
      <div class="pt-2 border-t flex justify-between items-center text-xs" style="${card.customColor ? 'border-color: rgba(0,0,0,0.15);' : 'border-color: #1e293b;'}" onclick="event.stopPropagation()">
        <div class="flex items-center gap-1">
          <span class="font-mono text-[11px]" style="${card.customColor ? customTextStyle : 'color: #475569;'}">#${cardIdShort}</span>
          ${notifyIconHTML}
          ${printLabelIconHTML}
          <div class="hide-in-master flex items-center bg-black/20 rounded ml-2">
            <button onclick="moveCardVertical('${card.id}', -1)" class="p-0.5 hover:bg-black/30 rounded px-1.5 cursor-pointer" title="Sposta su" style="${card.customColor ? customTextStyle : 'color: #cbd5e1;'}">▲</button>
            <button onclick="moveCardVertical('${card.id}', 1)" class="p-0.5 hover:bg-black/30 rounded px-1.5 cursor-pointer" title="Sposta giù" style="${card.customColor ? customTextStyle : 'color: #cbd5e1;'}">▼</button>
          </div>
        </div>
        <div class="flex gap-1.5 hide-in-master">
          <button onclick="moveCardStep('${card.id}', -1)" class="p-1 rounded bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" title="Indietro"><i data-lucide="chevron-left" class="w-4 h-4"></i></button>
          <button onclick="moveCardStep('${card.id}', 1)" class="p-1 rounded bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" title="Avanti"><i data-lucide="chevron-right" class="w-4 h-4"></i></button>
        </div>
      </div>
    </div>`;
}

function moveCardVertical(cardId, direction) {
  playSound('click');
  const card = state.cards.find(c => c.id === cardId);
  if (!card) return;
  
  const colCards = state.cards.filter(c => c.stage === card.stage);
  colCards.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  const currentIndex = colCards.findIndex(c => c.id === cardId);
  const targetIndex = currentIndex + direction;
  
  if (targetIndex >= 0 && targetIndex < colCards.length) {
    const tempOrder = colCards[currentIndex].order;
    colCards[currentIndex].order = colCards[targetIndex].order;
    colCards[targetIndex].order = tempOrder;
    
    if (colCards[currentIndex].order === colCards[targetIndex].order) {
      colCards[currentIndex].order = targetIndex;
      colCards[targetIndex].order = currentIndex;
    }
    saveLocal();
    syncCardToCloud(colCards[currentIndex]);
    syncCardToCloud(colCards[targetIndex]);
  }
}

function getJobTypeClass(type) {
  switch (type) {
    case 'Stampa Digitale / Banner': return 'bg-blue-900/40 text-blue-300 border border-blue-800';
    case 'Abbigliamento / Ricamo': return 'bg-purple-900/40 text-purple-300 border border-purple-800';
    case 'Insegne & Vetrofanie': return 'bg-amber-900/40 text-amber-300 border border-amber-800';
    case 'Etichette & Adesivi': return 'bg-teal-900/40 text-teal-300 border border-teal-800';
    case 'Grafica / Progettazione': return 'bg-rose-900/40 text-rose-300 border border-rose-800';
    case 'Altro': case '': case undefined: case null: return 'bg-slate-800 text-slate-300 border border-slate-700';
    default: {
      // tipi aggiunti da te: colore stabile scelto in base al nome
      const pal = [
        'bg-orange-900/40 text-orange-300 border border-orange-800',
        'bg-lime-900/40 text-lime-300 border border-lime-800',
        'bg-sky-900/40 text-sky-300 border border-sky-800',
        'bg-fuchsia-900/40 text-fuchsia-300 border border-fuchsia-800',
        'bg-emerald-900/40 text-emerald-300 border border-emerald-800',
        'bg-red-900/40 text-red-300 border border-red-800'
      ];
      let h = 0; const s = String(type);
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
      return pal[h % pal.length];
    }
  }
}

function allowDrop(ev) {
  ev.preventDefault();
}

function handleDragStart(ev) {
  ev.dataTransfer.setData("text/plain", ev.target.dataset.id);
}

function handleDrop(ev) {
  ev.preventDefault();
  const cardId = ev.dataTransfer.getData("text");
  const targetColId = ev.currentTarget.dataset.col;
  if (cardId && targetColId) {
    changeCardStage(cardId, targetColId);
  }
}

function moveCardStep(cardId, direction) {
  const card = state.cards.find(c => c.id === cardId);
  if (!card) return;
  const currentIndex = COLUMNS_CONFIG.findIndex(col => col.id === card.stage);
  let targetIndex = currentIndex + direction;
  
  if (targetIndex >= 0 && targetIndex < COLUMNS_CONFIG.length) {
    changeCardStage(cardId, COLUMNS_CONFIG[targetIndex].id);
  }
}

function changeCardStage(cardId, targetStageId) {
  const card = state.cards.find(c => c.id === cardId);
  if (card && card.stage !== targetStageId) {
    playSound('click');
    card.stage = targetStageId;
    card.order = Date.now();
    
    const stageLabel = COLUMNS_CONFIG.find(col => col.id === targetStageId)?.label || targetStageId;
    
    if (!Array.isArray(card.history)) card.history = [];
    card.history.push({ stage: targetStageId, label: stageLabel, timestamp: new Date().toISOString() });
    
    saveLocal();
    syncCardToCloud(card);
    
    if (targetStageId === 'bollettato-da-consegnare') {
      checkAndTriggerClientNotification(card);
    }
  }
}

function triggerNotifyById(id) {
  playSound('click');
  const card = state.cards.find(c => c.id === id);
  if (card) checkAndTriggerClientNotification(card);
}

function checkAndTriggerClientNotification(card) {
  if (!card.whatsapp && !card.email && !card.client) return;
  
  activeNotifyCard = card;
  document.getElementById('notifyClientName').innerText = card.client || 'N/D';
  document.getElementById('notifyClientRef').innerText = card.referent || 'Nessun referente';
  document.getElementById('notifyClientWa').innerText = card.whatsapp || 'Non disponibile';
  document.getElementById('notifyClientEmail').innerText = card.email || 'Non disponibile';
  
  const btnWa = document.getElementById('btnSendWa');
  const btnEmail = document.getElementById('btnSendEmail');
  
  if (card.whatsapp) {
    btnWa.classList.remove('opacity-50', 'pointer-events-none');
  } else {
    btnWa.classList.add('opacity-50', 'pointer-events-none');
  }
  
  if (card.email) {
    btnEmail.classList.remove('opacity-50', 'pointer-events-none');
  } else {
    btnEmail.classList.add('opacity-50', 'pointer-events-none');
  }
  
  openModal('clientNotifyModal');
  lucide.createIcons();
}

function getNotificationMessage(card) {
  let template = sharedMsgTemplate || DEFAULT_MSG_TEMPLATE;
  let saluto = "";
  
  if (card.referent && card.client) {
    saluto = `${card.referent} della ditta ${card.client}`;
  } else if (card.referent) {
    saluto = `${card.referent}`;
  } else if (card.client) {
    saluto = `ditta ${card.client}`;
  } else {
    saluto = `Cliente`;
  }
  
  let articlesList = "";
  if (card.articles && card.articles.length > 0) {
    const validArticles = card.articles.filter(a => a.desc && a.desc.trim() !== "");
    if (validArticles.length > 0) {
      articlesList = "\n" + validArticles.map(a => `- ${a.qty || 1} pezzi ${a.desc.trim()}`).join('\n');
    }
  }
  
  return template.replace(/{SALUTO}/g, saluto)
                 .replace(/{TITOLO}/g, card.title || '')
                 .replace(/{ARTICOLI}/g, articlesList);
}

function sendWhatsAppNotification() {
  if (!activeNotifyCard || !activeNotifyCard.whatsapp) return;
  const msgTesto = getNotificationMessage(activeNotifyCard);
  const msg = encodeURIComponent(msgTesto);
  let phone = activeNotifyCard.whatsapp.replace(/[^0-9+]/g, '');
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  closeModal('clientNotifyModal');
}

function sendEmailNotification() {
  if (!activeNotifyCard || !activeNotifyCard.email) return;
  const msgTesto = getNotificationMessage(activeNotifyCard);
  const subject = encodeURIComponent(`Avviso: Ordine pronto per il ritiro - ${activeNotifyCard.title}`);
  const body = encodeURIComponent(msgTesto);
  window.location.href = `mailto:${activeNotifyCard.email}?subject=${subject}&body=${body}`;
  closeModal('clientNotifyModal');
}

function checkNewCustomJobType(val) {
  const customInput = document.getElementById('formCustomJobType');
  if (val === 'custom') {
    customInput.classList.remove('hidden');
    customInput.required = true;
  } else {
    customInput.classList.add('hidden');
    customInput.required = false;
    customInput.value = '';
  }
}

function checkEditCustomJobType(val) {
  const customInput = document.getElementById('editCustomJobType');
  if (val === 'custom') {
    customInput.classList.remove('hidden');
  } else {
    customInput.classList.add('hidden');
    customInput.value = '';
  }
}

function resetCardCustomColor() {
  const card = state.cards.find(c => c.id === activeCardId);
  if (card) {
    card.customColor = "";
    const colDef = COLUMNS_CONFIG.find(col => col.id === card.stage);
    const colorInput = document.getElementById('editCardColor');
    colorInput.value = colDef ? colDef.hexDefault : '#4f46e5';
    colorInput.dataset.defaultColor = colorInput.value;
    
    saveLocal();
    syncCardToCloud(card);
    setSyncStatus('saved');
    showToast("Colore personalizzato rimosso.");
  }
}

function handleFormFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  tempFormFile = file;
  const previewEl = document.getElementById('formFilePreview');
  previewEl.innerText = `Selezionato: ${file.name}`;
  previewEl.classList.remove('hidden');
}

// ==========================================
// CONTROLLO DUPLICATI: stesso cliente + stesso riferimento ordine
// ==========================================
function normKey(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, ' '); }

function findDuplicateOrder(clientName, orderRef, excludeId) {
  const c = normKey(clientName), r = normKey(orderRef);
  if (!c || !r) return null;
  return state.cards.find(x => x && x.id !== excludeId && x.stage !== 'archiviato' && normKey(x.title || x.client) === c && normKey(x.orderRef) === r) || null;
}

function askDuplicateRef(ref, other) {
  return new Promise((resolve) => {
    const old = document.getElementById('sgaDupChoice');
    if (old) old.remove();
    const box = document.createElement('div');
    box.id = 'sgaDupChoice';
    box.className = 'fixed inset-0 z-[460] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4';
    const stage = (COLUMNS_CONFIG.find(c => c.id === other.stage) || {}).label || other.stage;
    box.innerHTML = `<div class="max-w-md w-full bg-slate-900 border border-amber-500/50 rounded-2xl shadow-2xl p-5 space-y-3">
      <div class="text-amber-300 font-bold text-base">⚠️ Attenzione: due commesse con lo stesso riferimento ordine</div>
      <div class="text-sm text-slate-300">Per <b>${esc(other.title || other.client)}</b> esiste già una commessa aperta con riferimento <b class="font-mono">${esc(other.orderRef)}</b> (in "${esc(stage)}", inserita il ${other.createdAt ? new Date(other.createdAt).toLocaleDateString('it-IT') : '-'}).<br>Se l'ordine è lo stesso puoi cambiare il riferimento qui sotto: la nuova commessa nascerà già con quello.</div>
      <input id="dupRefInput" type="text" value="${esc(ref)}" class="w-full bg-slate-950 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-amber-400">
      <div class="flex flex-col gap-2 pt-1">
        <button type="button" data-v="confirm" class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg cursor-pointer">Conferma con il riferimento scritto sopra</button>
        <button type="button" data-v="force" class="bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm font-semibold px-4 py-2.5 rounded-lg cursor-pointer">Crea comunque con quello uguale</button>
        <button type="button" data-v="cancel" class="bg-transparent border border-slate-600 hover:bg-slate-800 text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-lg cursor-pointer">Annulla</button>
      </div></div>`;
    box.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]');
      if (!b) return;
      const val = document.getElementById('dupRefInput').value.trim();
      box.remove();
      resolve({ action: b.dataset.v, ref: val });
    });
    document.body.appendChild(box);
    setTimeout(() => { const i = document.getElementById('dupRefInput'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 50);
  });
}

// Restituisce il riferimento da usare, oppure null se l'utente annulla
async function resolveOrderRefDuplicate(clientName, orderRef, excludeId) {
  let ref = orderRef;
  for (let guard = 0; guard < 10; guard++) {
    const other = findDuplicateOrder(clientName, ref, excludeId);
    if (!other) return ref;
    const r = await askDuplicateRef(ref, other);
    if (r.action === 'cancel') return null;
    if (r.action === 'force') return ref;
    ref = r.ref;   // confermato: il controllo riparte sul nuovo riferimento
  }
  return ref;
}

async function createNewCard(event) {
  event.preventDefault();
  if (window.__creatingCard) return;
  window.__creatingCard = true;
  try {
    await createNewCardInner();
  } catch (e) {
    console.error(e);
    showInAppNotice("Errore durante la creazione della commessa: " + (e && e.message ? e.message : e));
  } finally {
    window.__creatingCard = false;
    const sb = document.querySelector('#newCardForm button[type="submit"]');
    if (sb) { sb.disabled = false; if (sb.dataset.oldText) sb.innerHTML = sb.dataset.oldText; }
  }
}

async function createNewCardInner() {
  playSound('success');
  const sb = document.querySelector('#newCardForm button[type="submit"]');
  if (sb) { sb.dataset.oldText = sb.innerHTML; sb.disabled = true; sb.textContent = 'Sto leggendo il documento...'; }
  
  const title = document.getElementById('formTitle').value.trim();
  const client = title;
  const referent = document.getElementById('formReferent') ? document.getElementById('formReferent').value.trim() : '';
  const email = document.getElementById('formEmail') ? document.getElementById('formEmail').value.trim() : '';
  const whatsapp = document.getElementById('formWhatsapp') ? document.getElementById('formWhatsapp').value.trim() : '';
  const machine = document.getElementById('formMachine') ? document.getElementById('formMachine').value : '';
  let deliveryDate = document.getElementById('formDeliveryDate') ? document.getElementById('formDeliveryDate').value : '';
  let orderRef = document.getElementById('formOrderRef') ? document.getElementById('formOrderRef').value.trim() : '';
  
  let jobType = document.getElementById('formJobType').value;
  if (jobType === 'custom') jobType = document.getElementById('formCustomJobType').value.trim() || 'Altro';
  
  const initialStage = document.getElementById('formInitialStage').value;
  const initialStageLabel = COLUMNS_CONFIG.find(col => col.id === initialStage)?.label || 'Prev. da fare';
  const initialNote = document.getElementById('formNotes') ? document.getElementById('formNotes').value.trim() : '';
  
  if (!title) return;
  if (client) registerClientAdvanced(client, referent, email, whatsapp);

  let extractedArticles = [];
  let extractedMeta = {};
  let initialPhotos = [];
  
  let pendingImgData = '';
  let pendingImgbbKey = null;

  if (tempFormFile) {
    pendingImgbbKey = IMGBB_API_KEY && IMGBB_API_KEY !== "INSERISCI_QUI_LA_TUA_CHIAVE_IMGBB" ? IMGBB_API_KEY : null;
    try {
      if (tempFormFile.type === 'application/pdf') {
        // Conversione in immagine in parallelo alla lettura degli articoli
        const imgPromise = convertPdfToImage(tempFormFile, pendingImgbbKey ? 3.0 : 2.0, pendingImgbbKey ? 0.90 : 0.8).catch(() => "");
        const ex = await extractArticlesSafe(tempFormFile);
        extractedArticles = ex.articles;
        extractedMeta = ex.meta || {};
        pendingImgData = await imgPromise;
      } else {
        pendingImgData = await compressImage(tempFormFile, pendingImgbbKey ? 2400 : 1600, pendingImgbbKey ? 2400 : 1600, pendingImgbbKey ? 0.90 : 0.8);
      }
    } catch(e) { console.error(e); }
  }
  
  let importNote = '';
  if (extractedArticles.length > 0) {
    if (!orderRef && extractedMeta.orderRef) orderRef = extractedMeta.orderRef;
    if (!deliveryDate && extractedMeta.deliveryDate) deliveryDate = extractedMeta.deliveryDate;
    importNote = checkImportTotals(extractedArticles, extractedMeta);
  }

  if (orderRef) {
    const okRef = await resolveOrderRefDuplicate(title, orderRef, null);
    if (okRef === null) return;   // annullato: il modulo resta com'e'
    orderRef = okRef;
  }

  if (extractedArticles.length === 0) {
    extractedArticles = initialNote ? [{ code: '', desc: initialNote, qty: 1, price: 0, tax: 22 }] : [];
  }

  const newCard = {
    id: 'c' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
    title, client, referent, email, whatsapp, orderRef, machine, jobType, deliveryDate,
    articles: extractedArticles,
    stage: initialStage,
    order: Date.now(),
    createdAt: new Date().toISOString(),
    photos: initialPhotos,
    history: [{ stage: initialStage, label: `Inserito in "${initialStageLabel}"`, timestamp: new Date().toISOString() }]
  };
  if (pendingImgData) newCard.uploading = Date.now();

  // Copia pulita: elimina eventuali valori non salvabili (undefined, NaN, proprieta' extra)
  const cleanCard = JSON.parse(JSON.stringify(newCard));
  state.cards.unshift(cleanCard);
  saveLocal();
  syncCardToCloud(cleanCard);
  populateGlobalFilterDropdown();
  
  document.getElementById('newCardForm').reset();
  document.getElementById('formClientSelector').value = '';
  document.getElementById('formCustomJobType').classList.add('hidden');
  document.getElementById('formFilePreview').classList.add('hidden');
  tempFormFile = null;
  
  closeModal('addCardModal');
  showToast("Commessa creata con successo!");
  if (pendingImgData) finishBackgroundUpload(cleanCard.id, pendingImgData, pendingImgbbKey);
  if (importNote) showInAppNotice(importNote, 'Controlla gli articoli importati');
}

function saveCardEdits(silent = false) {
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card) return;
  
  card.title = document.getElementById('editTitle').value.trim();
  card.client = card.title;
  card.referent = document.getElementById('editReferent').value.trim();
  card.email = document.getElementById('editEmail').value.trim();
  card.whatsapp = document.getElementById('editWhatsapp').value.trim();
  card.machine = document.getElementById('editMachine').value;
  card.orderRef = document.getElementById('editOrderRef') ? document.getElementById('editOrderRef').value.trim() : '';
  
  if (card.client) {
    registerClientAdvanced(card.client, card.referent, card.email, card.whatsapp);
  }
  
  card.deliveryDate = document.getElementById('editDeliveryDate').value;
  
  const colorInput = document.getElementById('editCardColor');
  const selectedColor = colorInput.value.toLowerCase();
  const defaultColor = colorInput.dataset.defaultColor ? colorInput.dataset.defaultColor.toLowerCase() : "";
  
  if (selectedColor === defaultColor) {
    card.customColor = "";
  } else {
    card.customColor = colorInput.value;
  }
  
  let newJobType = document.getElementById('editJobType').value;
  if (newJobType === 'custom') {
    newJobType = document.getElementById('editCustomJobType').value.trim() || card.jobType;
  }
  card.jobType = newJobType;
  const jobNotesEl = document.getElementById('editJobNotes');
  if (jobNotesEl) card.jobNotes = jobNotesEl.value;
  
  saveLocal();
  syncCardToCloud(card);
  populateGlobalFilterDropdown();
  setSyncStatus('saved');
  
  if (!silent) {
    playSound('success');
    showToast("Anagrafica aggiornata con successo!");
  }
}

function saveArticlesEdits(silent = false) { 
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card) return; 
  saveLocal();
  syncCardToCloud(card);
  setSyncStatus('saved');
  if (!silent) {
    playSound('success');
    showToast("Articoli salvati con successo!");
  }
}

function calculateArticleAmounts(art) {
  const qty = parseFloat(art.qty) || 0;
  const price = parseFloat(art.price) || 0;
  const taxRate = parseFloat(art.tax) || 22;
  const parsedDiscount = parseFloat(art.discount);
  const discountRate = Number.isFinite(parsedDiscount) ? Math.min(100, Math.max(0, parsedDiscount)) : 0;
  const originalNet = qty * price;
  const discountAmount = originalNet * discountRate / 100;
  const rowTotalNet = originalNet - discountAmount;
  const taxAmount = rowTotalNet * taxRate / 100;
  const unitTaxPrice = price * (1 - discountRate / 100) * (1 + taxRate / 100);
  const rowTotalTaxed = rowTotalNet + taxAmount;
  return { qty, price, taxRate, discountRate, discountAmount, rowTotalNet, taxAmount, unitTaxPrice, rowTotalTaxed };
}

function normalizeArticleDiscount(input) {
  const idx = parseInt(input.dataset.index);
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card || !card.articles[idx]) return;
  const parsedDiscount = parseFloat(input.value);
  const discount = Number.isFinite(parsedDiscount) ? Math.min(100, Math.max(0, parsedDiscount)) : 0;
  input.value = discount;
  card.articles[idx].discount = discount;
  updateArticleField(input);
}

// La descrizione dell'articolo si allarga da sola in altezza: si vede sempre tutto il testo
function autoGrowDesc(el) {
  if (!el || !el.offsetWidth) return;
  el.style.height = 'auto';
  el.style.height = (el.scrollHeight + 2) + 'px';
}
function autoGrowAllDescs() {
  document.querySelectorAll('#articlesTableBody textarea[data-field="desc"], #articlesTableBody textarea[data-field="code"]').forEach(autoGrowDesc);
}
(function () {
  let t = null;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(autoGrowAllDescs, 150); });
})();

function renderArticlesTable(card) {
  const tbody = document.getElementById('articlesTableBody');
  tbody.innerHTML = '';
  
  if (!card.articles || card.articles.length === 0) {
    card.articles = [{ code: '', desc: '', qty: '', price: '', tax: 22, discount: 0 }];
  }
  
  card.articles.forEach((art, idx) => {
    const amounts = calculateArticleAmounts(art);
    const rowTotalNet = amounts.rowTotalNet;
    const unitTaxPrice = amounts.unitTaxPrice;
    const rowTotalTaxed = amounts.rowTotalTaxed;
    
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-900/50 transition-colors";
    
    tr.innerHTML = `
      <td class="py-1.5 px-1 text-center align-middle">
        <div class="flex items-center justify-center gap-0.5 bg-slate-900 rounded p-0.5 border border-slate-800">
          <button onclick="moveArticleRowVertical(${idx}, -1)" class="hover:bg-slate-800 text-slate-300 text-xs px-1 rounded cursor-pointer">▲</button>
          <button onclick="moveArticleRowVertical(${idx}, 1)" class="hover:bg-slate-800 text-slate-300 text-xs px-1 rounded cursor-pointer">▼</button>
        </div>
      </td>
      <td class="py-1.5 px-1 relative">
        <textarea rows="1" spellcheck="false" data-field="code" data-index="${idx}" autocomplete="off" oninput="updateArticleField(this); autoGrowDesc(this); handleArticleCodeAutocomplete(this.value, ${idx})" onkeydown="if(event.key===\'Enter\'){event.preventDefault();}" onchange="saveArticlesEdits(true); refreshSaveArticleIcons()" class="block w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs leading-snug focus:outline-none focus:border-indigo-500 resize-none overflow-hidden" style="min-height:28px;word-break:break-word">${esc(art.code || '')}</textarea>
        <div id="articleCodeSuggestions-${idx}" class="hidden absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-600 rounded shadow-xl z-50 max-h-32 overflow-y-auto min-w-[200px]"></div>
      </td>
      <td class="py-1.5 px-1 relative">
        <textarea rows="1" spellcheck="false" data-field="desc" data-index="${idx}" autocomplete="off" oninput="updateArticleField(this); autoGrowDesc(this); handleArticleAutocomplete(this.value, ${idx})" onkeydown="if(event.key==='Enter'){event.preventDefault();}" onchange="saveArticlesEdits(true); refreshSaveArticleIcons()" class="block w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs leading-snug focus:outline-none focus:border-indigo-500 resize-none overflow-hidden" style="min-height:28px">${esc(art.desc || '')}</textarea>
        <div id="articleSuggestions-${idx}" class="hidden absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-600 rounded shadow-xl z-50 max-h-32 overflow-y-auto min-w-[250px]"></div>
      </td>
      <td class="py-1.5 px-1">
        <input type="number" step="any" value="${art.qty !== undefined ? art.qty : ''}" data-field="qty" data-index="${idx}" oninput="updateArticleField(this)" onchange="saveArticlesEdits(true)" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs text-center focus:outline-none">
      </td>
      <td class="py-1.5 px-1">
        <input type="number" step="any" value="${art.price !== undefined ? art.price : ''}" data-field="price" data-index="${idx}" oninput="updateArticleField(this)" onchange="saveArticlesEdits(true)" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs text-right focus:outline-none">
      </td>
      <td class="py-1.5 px-1">
        <input type="number" min="0" max="100" step="0.01" value="${art.discount !== undefined ? art.discount : 0}" data-field="discount" data-index="${idx}" oninput="updateArticleField(this)" onchange="normalizeArticleDiscount(this); saveArticlesEdits(true)" class="w-full bg-slate-900 border border-slate-700 rounded px-1 py-1 text-slate-200 text-xs text-center focus:outline-none" title="Sconto percentuale sulla riga">
      </td>
      <td class="py-1.5 px-1">
        <input type="number" step="any" value="${art.tax !== undefined ? art.tax : 22}" data-field="tax" data-index="${idx}" oninput="updateArticleField(this)" onchange="saveArticlesEdits(true)" class="w-full bg-slate-900 border border-slate-700 rounded px-1 py-1 text-slate-200 text-xs text-center focus:outline-none">
      </td>
      <td class="py-1.5 px-1 text-right font-mono text-slate-300 align-middle">
        <span id="row-net-${idx}">€ ${rowTotalNet.toFixed(2)}</span>
      </td>
      <td class="py-1.5 px-1 text-right font-mono text-slate-300 align-middle">
        <span id="row-unit-taxed-${idx}">€ ${unitTaxPrice.toFixed(2)}</span>
      </td>
      <td class="py-1.5 px-2 text-right font-mono font-bold text-slate-300 align-middle">
        <span id="row-total-${idx}">€ ${rowTotalTaxed.toFixed(2)}</span>
      </td>
      <td class="py-1.5 px-1 text-center align-middle">
        <div class="flex items-center justify-center gap-0.5 flex-wrap">
          <button type="button" data-saveart="${idx}" onclick="saveArticleToDb(${idx})" class="text-emerald-400 hover:text-emerald-300 p-1 cursor-pointer" title="Salva negli Articoli base" style="display:none"><i data-lucide="bookmark-plus" class="w-3.5 h-3.5"></i></button>
          <button onclick="removeArticleRow(${idx})" class="text-red-400 hover:text-red-300 p-1 cursor-pointer"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  calculateGrandTotals();
  lucide.createIcons();
  refreshSaveArticleIcons();
  requestAnimationFrame(autoGrowAllDescs);
}

// Icona "salva negli Articoli base": compare solo se codice/descrizione non sono ancora nel database
function isArticleKnown(art) {
  const c = String(art.code || '').trim().toLowerCase();
  const d = String(art.desc || '').trim().toLowerCase();
  return ARTICLES_DB.some(a => (c && a.code && String(a.code).trim().toLowerCase() === c) || (d && a.desc && String(a.desc).trim().toLowerCase() === d));
}

function refreshSaveArticleIcons() {
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card || !card.articles) return;
  document.querySelectorAll('#articlesTableBody button[data-saveart]').forEach(btn => {
    const art = card.articles[parseInt(btn.dataset.saveart, 10)];
    const show = !!(art && String(art.desc || '').trim() && !isArticleKnown(art));
    btn.style.display = show ? '' : 'none';
  });
}

function saveArticleToDb(idx) {
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card || !card.articles || !card.articles[idx]) return;
  const art = card.articles[idx];
  const code = String(art.code || '').trim();
  const desc = String(art.desc || '').trim();
  if (!desc) return showInAppNotice("Scrivi almeno la descrizione dell'articolo.");
  const dup = code ? ARTICLES_DB.find(a => a.code && String(a.code).trim().toLowerCase() === code.toLowerCase()) : null;
  if (dup) { showInAppNotice('Esiste già un articolo base con il codice "' + code + '" (' + dup.desc + '). Non l\'ho duplicato.'); refreshSaveArticleIcons(); return; }
  const price = parseFloat(art.price);
  ARTICLES_DB.push({ code, desc, price: Number.isFinite(price) ? price : 0 });
  ARTICLES_DB.sort((a, b) => String(a.desc).localeCompare(String(b.desc)));
  try { localStorage.setItem('workflow_sga_articles_db', JSON.stringify(ARTICLES_DB)); } catch (e) {}
  syncArticlesToCloud();
  playSound('success');
  if (!(price > 0)) showInAppNotice('Articolo salvato negli Articoli base con prezzo 0 €. Correggi il prezzo da Impostazioni > Gestione Articoli.', 'Salvato', 'ok');
  else showToast('Articolo salvato negli Articoli base');
  refreshSaveArticleIcons();
}

function handleArticleCodeAutocomplete(query, idx) {
  const container = document.getElementById(`articleCodeSuggestions-${idx}`);
  if(!query.trim()) {
    container.classList.add('hidden');
    return;
  }
  
  const q = query.toLowerCase();
  const matches = ARTICLES_DB.filter(a => (a.code && a.code.toLowerCase().includes(q)) || (a.desc && a.desc.toLowerCase().includes(q)));
  
  if(matches.length === 0) {
    container.classList.add('hidden');
    return;
  }
  
  container.innerHTML = matches.map(m => `
    <div onclick="selectArticleSuggestion('${jsArg(m.code)}', '${jsArg(m.desc)}', ${m.price}, ${idx})" class="px-2 py-1.5 hover:bg-indigo-600/50 cursor-pointer text-xs border-b border-slate-700 last:border-0">
      <div class="font-bold text-white">${esc(m.desc)}</div>
      <div class="text-[10px] text-slate-400 font-mono">Cod: ${esc(m.code || 'N/D')} | Prezzo base: € ${m.price}</div>
    </div>
  `).join('');
  
  container.classList.remove('hidden');
}

function handleArticleAutocomplete(query, idx) {
  const container = document.getElementById(`articleSuggestions-${idx}`);
  if(!query.trim()) {
    container.classList.add('hidden');
    return;
  }
  
  const q = query.toLowerCase();
  const matches = ARTICLES_DB.filter(a => a.desc.toLowerCase().includes(q) || (a.code && a.code.toLowerCase().includes(q)));
  
  if(matches.length === 0) {
    container.classList.add('hidden');
    return;
  }
  
  container.innerHTML = matches.map(m => `
    <div onclick="selectArticleSuggestion('${jsArg(m.code)}', '${jsArg(m.desc)}', ${m.price}, ${idx})" class="px-2 py-1.5 hover:bg-indigo-600/50 cursor-pointer text-xs border-b border-slate-700 last:border-0">
      <div class="font-bold text-white">${esc(m.desc)}</div>
      <div class="text-[10px] text-slate-400 font-mono">Cod: ${esc(m.code || 'N/D')} | Prezzo base: € ${m.price}</div>
    </div>
  `).join('');
  
  container.classList.remove('hidden');
}

function selectArticleSuggestion(code, desc, price, idx) {
  const card = state.cards.find(c => c.id === activeCardId);
  if(!card || !card.articles[idx]) return;
  
  card.articles[idx].code = code;
  card.articles[idx].desc = desc;
  card.articles[idx].price = price;
  
  if (!card.articles[idx].qty) {
    card.articles[idx].qty = 1;
  }
  
  renderArticlesTable(card);
  saveLocal();
  syncCardToCloud(card);
  playSound('click');
  setSyncStatus('saved');
}

function moveArticleRowVertical(idx, direction) {
  playSound('click');
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card || !card.articles) return;
  
  const targetIdx = idx + direction;
  
  if (targetIdx >= 0 && targetIdx < card.articles.length) { 
    const temp = card.articles[idx];
    card.articles[idx] = card.articles[targetIdx];
    card.articles[targetIdx] = temp; 
    
    renderArticlesTable(card);
    saveLocal();
    syncCardToCloud(card);
    setSyncStatus('saved');
  }
}

function updateArticleField(input) {
  setSyncStatus('typing');
  
  const idx = parseInt(input.dataset.index);
  const field = input.dataset.field;
  const card = state.cards.find(c => c.id === activeCardId);
  
  if (!card || !card.articles[idx]) return; 
  card.articles[idx][field] = input.value;

  if (field === 'code' && input.value.trim() !== '') {
    const match = ARTICLES_DB.find(a => a.code && a.code.toLowerCase() === input.value.trim().toLowerCase());
    if (match && card.articles[idx].desc !== match.desc) {
      card.articles[idx].desc = match.desc;
      card.articles[idx].price = match.price;
      
      if (!card.articles[idx].qty) {
        card.articles[idx].qty = 1;
      }
      
      renderArticlesTable(card);
      saveLocal();
      syncCardToCloud(card);
      playSound('success');
      setSyncStatus('saved');
      return; 
    }
  }

  if (['qty', 'price', 'tax', 'discount'].includes(field)) {
    const amounts = calculateArticleAmounts(card.articles[idx]);
    
    document.getElementById(`row-net-${idx}`).innerText = `€ ${amounts.rowTotalNet.toFixed(2)}`;
    document.getElementById(`row-unit-taxed-${idx}`).innerText = `€ ${amounts.unitTaxPrice.toFixed(2)}`;
    document.getElementById(`row-total-${idx}`).innerText = `€ ${amounts.rowTotalTaxed.toFixed(2)}`;
    
    calculateGrandTotals();
  }
}

function calculateGrandTotals() {
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card || !card.articles) return;
  
  let grandSubtotal = 0;
  let grandDiscount = 0;
  let grandTax = 0;
  let grandTotalTaxed = 0;
  
  card.articles.forEach(art => {
    const amounts = calculateArticleAmounts(art);
    grandSubtotal += amounts.rowTotalNet;
    grandDiscount += amounts.discountAmount;
    grandTax += amounts.taxAmount;
    grandTotalTaxed += amounts.rowTotalTaxed;
  });
  
  document.getElementById('grandDiscountDisplay').innerText = `€ ${grandDiscount.toFixed(2)}`;
  document.getElementById('grandSubtotalDisplay').innerText = `€ ${grandSubtotal.toFixed(2)}`;
  document.getElementById('grandTaxDisplay').innerText = `€ ${grandTax.toFixed(2)}`;
  document.getElementById('grandTotalDisplay').innerText = `€ ${grandTotalTaxed.toFixed(2)}`;
}

function addArticleRow() {
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card) return;
  
  if (!Array.isArray(card.articles)) card.articles = [];
  card.articles.push({ code: '', desc: '', qty: '', price: '', tax: 22, discount: 0 });
  
  renderArticlesTable(card);
  saveArticlesEdits(true);
}

function removeArticleRow(idx) {
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card || !card.articles || !card.articles[idx]) return;
  
  const artName = card.articles[idx].desc || "Riga Vuota";
  confirmDeletion(`Articolo: ${artName}`, () => {
    card.articles.splice(idx, 1);
    renderArticlesTable(card);
    saveLocal();
    syncCardToCloud(card);
    setSyncStatus('saved');
  });
}

function openDetail(id) {
  if (isMasterMode) return;
  
  const card = state.cards.find(c => c.id === id);
  if (!card) return;
  activeCardId = id;
  
  const currentStageObj = COLUMNS_CONFIG.find(col => col.id === card.stage); 
  const badge = document.getElementById('detailBadge'); 
  badge.textContent = currentStageObj ? currentStageObj.label : (card.stage === 'archiviato' ? 'Archiviata' : 'N/A'); 
  badge.className = `px-2 py-0.5 rounded text-[11px] font-bold text-white uppercase ${currentStageObj ? currentStageObj.color.split(' ')[0] : 'bg-slate-600'}`;
  
  let syncIndicator = document.getElementById('syncIndicator');
  if (!syncIndicator) {
    syncIndicator = document.createElement('span');
    syncIndicator.id = 'syncIndicator';
    syncIndicator.className = 'ml-3 flex items-center gap-1.5 text-[11px] font-semibold transition-opacity duration-300 opacity-0 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700 shadow-inner';
    if (badge && badge.parentNode) {
      badge.parentNode.insertBefore(syncIndicator, badge.nextSibling);
    }
  }
  
  if (syncIndicator) {
    syncIndicator.classList.remove('opacity-100');
    syncIndicator.classList.add('opacity-0');
  }

  document.getElementById('editClientSelector').value = ''; 
  document.getElementById('editTitle').value = card.title || ''; 
  document.getElementById('editReferent').value = card.referent || ''; 
  document.getElementById('editEmail').value = card.email || ''; 
  document.getElementById('editWhatsapp').value = card.whatsapp || ''; 
  document.getElementById('editDeliveryDate').value = card.deliveryDate || ''; 
  populateMachinesDropdowns(); 
  document.getElementById('editMachine').value = card.machine || '';
  fillJobTypeSelect(document.getElementById('editJobType'), card.jobType || '', true);
  checkEditCustomJobType('');
  const editJobNotesEl = document.getElementById('editJobNotes');
  if (editJobNotesEl) editJobNotesEl.value = card.jobNotes || '';
  
  const editOrderRefEl = document.getElementById('editOrderRef');
  if (editOrderRefEl) editOrderRefEl.value = card.orderRef || '';
  
  const colDef = COLUMNS_CONFIG.find(col => col.id === card.stage);
  const defaultColor = colDef ? colDef.hexDefault : '#4f46e5'; 
  const colorInput = document.getElementById('editCardColor');
  colorInput.value = card.customColor || defaultColor;
  colorInput.dataset.defaultColor = defaultColor; 
  
  const editFields = ['editTitle', 'editReferent', 'editEmail', 'editWhatsapp', 'editDeliveryDate', 'editMachine', 'editOrderRef', 'editJobNotes', 'editCustomJobType', 'editJobType', 'editClientSelector', 'editCardColor'];
  
  editFields.forEach(fieldId => {
    const el = document.getElementById(fieldId);
    if (el && !el.dataset.autosave) {
      el.addEventListener('input', () => setSyncStatus('typing'));
      el.addEventListener('change', () => {
        if (fieldId === 'editClientSelector') autofillClientFromSelect(el.value, 'edit');
        if (fieldId === 'editJobType') checkEditCustomJobType(el.value);
        saveCardEdits(true);
      });
      el.dataset.autosave = "true";
    }
  });

  renderArticlesTable(card);
  renderAttachments(card);
  renderChecklist(card);
  
  const timeline = document.getElementById('storyboardTimeline');
  timeline.innerHTML = '';
  
  if (Array.isArray(card.history)) {
    card.history.forEach((h, idx) => {
      const hStageObj = COLUMNS_CONFIG.find(col => col.id === h.stage);
      const circleBg = hStageObj ? hStageObj.color.split(' ')[0] : (h.stage === 'archiviato' ? 'bg-slate-600' : 'bg-slate-700');
      const item = document.createElement('div');
      item.className = "flex items-start gap-3 relative";
      item.innerHTML = `
        <div class="absolute -left-[23px] mt-1.5 w-4.5 h-4.5 rounded-full border border-slate-900 ${circleBg} flex items-center justify-center text-[8px] font-bold text-slate-100 shadow-sm">${idx+1}</div>
        <div class="flex-1 bg-slate-950/40 p-2.5 rounded border border-slate-800/80">
          <div class="flex justify-between items-center mb-0.5">
            <span class="font-bold text-xs text-slate-200 uppercase">${esc(h.label)}</span>
            <span class="text-[10px] text-slate-500">${new Date(h.timestamp).toLocaleString('it-IT')}</span>
          </div>
        </div>
      `;
      timeline.appendChild(item);
    });
  }
  
  const restoreBtn = document.getElementById('restoreCardBtnContainer');
  if (restoreBtn) {
    if (card.stage === 'archiviato') {
      restoreBtn.classList.remove('hidden');
    } else {
      restoreBtn.classList.add('hidden');
    }
  }
  
  openModal('detailModal');
  setTimeout(autoGrowAllDescs, 30);
}

// ==========================================
// CHECKLIST PER COMMESSA
// ==========================================
const DEFAULT_CHECKLIST_SUGGESTIONS = ['File ricevuto', 'Bozza approvata', 'Materiale arrivato', 'Acconto ricevuto', 'Controllo qualità'];

function renderChecklist(card) {
  const listEl = document.getElementById('checklistItems');
  const sugEl = document.getElementById('checklistSuggestions');
  const counterEl = document.getElementById('checklistCounter');
  if (!listEl || !card) return;
  const items = Array.isArray(card.checklist) ? card.checklist : [];
  const done = items.filter(i => i.done).length;
  if (counterEl) counterEl.textContent = items.length ? `(${done}/${items.length})` : '';

  listEl.innerHTML = items.length === 0
    ? '<p class="text-xs text-slate-500 italic">Nessuna voce.</p>'
    : items.map(i => `
      <div class="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded px-2 py-1.5">
        <input type="checkbox" ${i.done ? 'checked' : ''} onchange="toggleChecklistItem('${esc(i.id)}')" class="w-4 h-4 accent-emerald-500 cursor-pointer shrink-0">
        <span class="flex-1 text-xs ${i.done ? 'line-through text-slate-500' : 'text-slate-200'}">${esc(i.text)}</span>
        <button onclick="removeChecklistItem('${esc(i.id)}')" class="text-slate-600 hover:text-red-400 p-1 cursor-pointer" title="Rimuovi voce"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
      </div>`).join('');

  if (sugEl) {
    const existing = items.map(i => (i.text || '').toLowerCase());
    sugEl.innerHTML = DEFAULT_CHECKLIST_SUGGESTIONS
      .filter(s => !existing.includes(s.toLowerCase()))
      .map(s => `<button onclick="addChecklistItem(this.dataset.text)" data-text="${esc(s)}" class="text-[11px] px-2 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors">+ ${esc(s)}</button>`)
      .join('');
  }
  lucide.createIcons();
}

function persistChecklist(card) {
  saveLocal();
  syncCardToCloud(card);
  renderChecklist(card);
}

function addChecklistItem(text) {
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card) return;
  const input = document.getElementById('checklistNewItem');
  const fromChip = (typeof text === 'string');
  const t = (fromChip ? text : (input ? input.value : '')).trim();
  if (!t) return;
  if (!Array.isArray(card.checklist)) card.checklist = [];
  card.checklist.push({ id: 'k' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6), text: t, done: false });
  if (!fromChip && input) input.value = '';
  playSound('click');
  persistChecklist(card);
}

function toggleChecklistItem(itemId) {
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card || !Array.isArray(card.checklist)) return;
  const item = card.checklist.find(i => i.id === itemId);
  if (!item) return;
  item.done = !item.done;
  playSound('click');
  persistChecklist(card);
}

function removeChecklistItem(itemId) {
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card || !Array.isArray(card.checklist)) return;
  card.checklist = card.checklist.filter(i => i.id !== itemId);
  persistChecklist(card);
}

// ==========================================
// DUPLICA COMMESSA
// ==========================================
function duplicateCurrentCard() {
  const src = state.cards.find(c => c.id === activeCardId);
  if (!src) return;
  showInAppConfirm(`Creare una nuova commessa copiando "${src.title || 'Senza titolo'}"?`, () => doDuplicateCard(src.id), 'Duplica');
}

function doDuplicateCard(srcId) {
  const src = state.cards.find(c => c.id === srcId);
  if (!src) return;

  saveCardEdits(true); // salva eventuali modifiche appena digitate
  const stage = 'prev-da-fare';
  const stageLabel = (COLUMNS_CONFIG.find(col => col.id === stage) || {}).label || 'Prev. da fare';
  const now = new Date().toISOString();

  const newCard = {
    id: 'c' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
    title: src.title || '',
    client: src.client || '',
    referent: src.referent || '',
    email: src.email || '',
    whatsapp: src.whatsapp || '',
    orderRef: '',
    machine: src.machine || '',
    jobType: src.jobType || '',
    jobNotes: src.jobNotes || '',
    deliveryDate: '',
    articles: JSON.parse(JSON.stringify(src.articles || [])),
    checklist: (src.checklist || []).map(i => ({ id: 'k' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6), text: i.text, done: false })),
    stage: stage,
    order: Date.now(),
    createdAt: now,
    photos: [],
    history: [{ stage: stage, label: `Duplicata da "${src.title || 'Senza titolo'}" - inserita in "${stageLabel}"`, timestamp: now }]
  };

  state.cards.unshift(newCard);
  saveLocal();
  syncCardToCloud(newCard);
  populateGlobalFilterDropdown();
  playSound('success');
  showToast('Commessa duplicata!');
  openDetail(newCard.id); // apre subito la nuova per aggiornare data consegna, riferimento, ecc.
}

function restoreCardFromArchive() {
  const card = state.cards.find(c => c.id === activeCardId);
  if (card && card.stage === 'archiviato') {
    playSound('success');
    card.stage = 'fatturato';
    card.history.push({
      stage: 'fatturato',
      label: 'Ripristinata dall\'archivio in Fatturato',
      timestamp: new Date().toISOString()
    });
    
    saveLocal();
    syncCardToCloud(card);
    closeModal('detailModal');
    
    if (activeSubSettingsType === 'archive') {
      const list = document.getElementById('archiveSettingsList');
      if (list) {
        list.innerHTML = renderArchiveList();
        lucide.createIcons();
      }
    }
  }
}

function renderAttachments(card) {
  const container = document.getElementById('attachmentsContainer');
  container.innerHTML = '';
  
  if (isCardUploading(card) && !(card.photos && card.photos.length > 0)) {
    container.innerHTML = `
      <div class="col-span-2 md:col-span-4 flex items-center justify-center gap-3 py-6 text-indigo-300 border border-dashed border-indigo-500/40 rounded-lg bg-indigo-950/30">
        <span class="inline-block w-5 h-5 rounded-full border-2 border-indigo-300 border-t-transparent animate-spin"></span>
        <span class="text-xs font-semibold">Caricamento allegato in corso...</span>
      </div>`;
    return;
  }
  if (card.photos && card.photos.length > 0) {
    card.photos.forEach((photoObj, index) => {
      const thumb = document.createElement('div');
      thumb.className = "relative group w-full h-24 bg-slate-900 rounded border border-slate-700 overflow-hidden flex items-center justify-center cursor-pointer";
      thumb.innerHTML = `
        <img src="${photoObj.image}" onclick="playSound('click'); openGallery(${index})" style="transform: rotate(${photoObj.rotation || 0}deg);" class="min-w-full min-h-full object-cover bg-white">
        <button onclick="removePhoto(event, ${index})" class="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white p-1.5 rounded shadow active:scale-90 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      `;
      container.appendChild(thumb);
    });
    lucide.createIcons();
  } else {
    container.innerHTML = `
      <div class="col-span-2 md:col-span-4 flex flex-col items-center justify-center py-6 text-slate-500 border border-dashed border-slate-800 rounded-lg bg-slate-950/50">
        <i data-lucide="file-question" class="w-6 h-6 mb-2 opacity-50"></i>
        <span class="text-xs italic">Nessun file o foto allegata</span>
      </div>
    `;
  }
}

// Copia gli articoli da una commessa precedente dello stesso cliente
async function openCopyArticles() {
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card) return;
  await loadArchivedCards();
  const key = normKey(card.title || card.client);
  const list = state.cards.filter(c => c && c.id !== card.id && normKey(c.title || c.client) === key && Array.isArray(c.articles) && c.articles.some(a => a && String(a.desc || '').trim()))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
  if (!list.length) { showInAppNotice('Non ci sono altre commesse di questo cliente con articoli da copiare.'); return; }
  const old = document.getElementById('sgaCopyArt');
  if (old) old.remove();
  const box = document.createElement('div');
  box.id = 'sgaCopyArt';
  box.className = 'fixed inset-0 z-[450] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4';
  box.innerHTML = `<div class="max-w-lg w-full max-h-[85vh] flex flex-col bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl p-5 space-y-3">
    <div class="text-indigo-300 font-bold text-base">Copia articoli da una commessa di ${esc(card.title || card.client)}</div>
    <div class="overflow-y-auto space-y-2 pr-1">${list.map(c => {
      const arts = c.articles.filter(a => a && String(a.desc || '').trim());
      return `<button type="button" data-id="${esc(c.id)}" class="w-full text-left bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 rounded-lg p-3 cursor-pointer">
        <div class="text-xs text-slate-400">${c.createdAt ? new Date(c.createdAt).toLocaleDateString('it-IT') : ''}${c.orderRef ? ' · Rif. ' + esc(c.orderRef) : ''}${c.stage === 'archiviato' ? ' · archivio' : ''} · ${arts.length} ${arts.length === 1 ? 'articolo' : 'articoli'}</div>
        <div class="text-sm text-slate-100 font-semibold">${esc(c.jobType || 'Commessa')}</div>
        <div class="text-xs text-slate-300 truncate">${arts.slice(0, 3).map(a => esc(String(a.desc).slice(0, 60))).join(' · ')}</div></button>`;
    }).join('')}</div>
    <button type="button" data-id="" class="bg-transparent border border-slate-600 hover:bg-slate-800 text-slate-300 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer">Annulla</button></div>`;
  box.addEventListener('click', async (e) => {
    const b = e.target.closest('button[data-id]');
    if (!b) return;
    box.remove();
    if (!b.dataset.id) return;
    const src = state.cards.find(c => c.id === b.dataset.id);
    if (src) applyCopiedArticles(card, src);
  });
  document.body.appendChild(box);
}

async function applyCopiedArticles(card, src) {
  const copy = JSON.parse(JSON.stringify(src.articles.filter(a => a && (String(a.desc || '').trim() || String(a.code || '').trim()))));
  const hasOwn = card.articles && card.articles.some(a => a && (String(a.desc || '').trim() || String(a.code || '').trim()));
  let mode = 'replace';
  if (hasOwn) mode = await askCopyMode();
  if (!mode) return;
  if (mode === 'append') card.articles = (card.articles || []).filter(a => a && (String(a.desc || '').trim() || String(a.code || '').trim())).concat(copy);
  else card.articles = copy;
  renderArticlesTable(card);
  saveLocal();
  syncCardToCloud(card);
  playSound('success');
  showToast(copy.length + (copy.length === 1 ? ' articolo copiato' : ' articoli copiati'));
}

function askCopyMode() {
  return new Promise((resolve) => {
    const box = document.createElement('div');
    box.className = 'fixed inset-0 z-[460] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4';
    box.innerHTML = `<div class="max-w-sm w-full bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl p-5 space-y-3">
      <div class="text-sm text-slate-200">Questa commessa ha già degli articoli. Cosa faccio?</div>
      <div class="flex flex-col gap-2">
        <button type="button" data-v="append" class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg cursor-pointer">Aggiungi in coda</button>
        <button type="button" data-v="replace" class="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg cursor-pointer">Sostituisci gli articoli</button>
        <button type="button" data-v="" class="bg-transparent border border-slate-600 text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-lg cursor-pointer">Annulla</button></div></div>`;
    box.addEventListener('click', (e) => { const b = e.target.closest('button[data-v]'); if (!b) return; box.remove(); resolve(b.dataset.v); });
    document.body.appendChild(box);
  });
}

// Domanda dopo la lettura di un PDF allegato: importare gli articoli o solo allegare il file
function askImportChoice(fileName, count, hasOwnArticles) {
  return new Promise((resolve) => {
    const old = document.getElementById('sgaImportChoice');
    if (old) old.remove();
    const box = document.createElement('div');
    box.id = 'sgaImportChoice';
    box.className = 'fixed inset-0 z-[450] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4';
    const btn = (label, value, cls) => `<button type="button" data-v="${value}" class="${cls} text-sm font-semibold px-4 py-2.5 rounded-lg cursor-pointer transition-colors">${label}</button>`;
    const buttons = hasOwnArticles
      ? btn('Aggiungi in coda agli articoli', 'append', 'bg-indigo-600 hover:bg-indigo-500 text-white') + btn('Sostituisci gli articoli', 'replace', 'bg-amber-600 hover:bg-amber-500 text-white') + btn('Solo allega il file', 'attach', 'bg-slate-700 hover:bg-slate-600 text-slate-100')
      : btn('Importa gli articoli', 'import', 'bg-indigo-600 hover:bg-indigo-500 text-white') + btn('Solo allega il file', 'attach', 'bg-slate-700 hover:bg-slate-600 text-slate-100');
    box.innerHTML = `<div class="max-w-md w-full bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl p-5 space-y-3">
      <div class="text-indigo-300 font-bold text-base">Importare i dati del documento?</div>
      <div class="text-sm text-slate-300"><span class="font-mono text-xs text-slate-400 break-all">${esc(fileName)}</span><br>Ho trovato <b>${count}</b> ${count === 1 ? 'articolo' : 'articoli'}. ${hasOwnArticles ? 'La commessa ha già degli articoli: cosa faccio?' : 'Li importo nel dettaglio articoli (con riferimento ordine e data di consegna) oppure alleghi solo il file?'}</div>
      <div class="flex flex-col gap-2 pt-1">${buttons}</div></div>`;
    box.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]');
      if (!b) return;
      box.remove();
      resolve(b.dataset.v);
    });
    document.body.appendChild(box);
  });
}

async function handleDocumentUpload(event) {
  const files = Array.from(event.target.files);
  if (!files || files.length === 0) return;
  
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card) return;
  if (!card.photos) card.photos = [];
  
  let imgbbKey = IMGBB_API_KEY && IMGBB_API_KEY !== "INSERISCI_QUI_LA_TUA_CHIAVE_IMGBB" ? IMGBB_API_KEY : null;
  warnNoImgbbOnce();
  
  const uploadNotes = [];
  const pendingImages = [];
  for (const file of files) {
    try {
      let imgData = "";
      if (file.type === 'application/pdf') {
        const imgPromise = convertPdfToImage(file, imgbbKey ? 3.0 : 2.0, imgbbKey ? 0.90 : 0.8).catch(() => "");
        const exRes = await extractArticlesSafe(file);
        let extractedArticles = exRes.articles;
        const exMeta = exRes.meta || {};
        const isPlaceholderOnly = extractedArticles.length === 1 && String(extractedArticles[0].desc || '').indexOf('Preventivo: ') === 0 && !extractedArticles[0].price;
        if (isPlaceholderOnly) extractedArticles = [];
        let choice = 'attach';
        if (extractedArticles.length > 0) {
          const hasOwn = card.articles && card.articles.some(a => a && (String(a.desc || '').trim() || String(a.code || '').trim()));
          choice = await askImportChoice(file.name, extractedArticles.length, hasOwn);
        }
        if (choice === 'replace' || choice === 'append' || choice === 'import') {
          if (!card.orderRef && exMeta.orderRef) {
            const okRef = await resolveOrderRefDuplicate(card.title || card.client, exMeta.orderRef, card.id);
            if (okRef !== null) {
              card.orderRef = okRef;
              const oe = document.getElementById('editOrderRef');
              if (oe) oe.value = card.orderRef;
            }
          }
          if (!card.deliveryDate && exMeta.deliveryDate) {
            card.deliveryDate = exMeta.deliveryDate;
            const de = document.getElementById('editDeliveryDate');
            if (de) de.value = card.deliveryDate;
          }
          const note = checkImportTotals(extractedArticles, exMeta);
          if (note) uploadNotes.push(note);
          const empty = !card.articles || card.articles.length === 0 || card.articles.every(a => !a || (!String(a.desc || '').trim() && !String(a.code || '').trim()));
          if (choice === 'replace' || empty) card.articles = extractedArticles;
          else card.articles.push(...extractedArticles);
        }
        imgData = await imgPromise;
      } else {
        imgData = await compressImage(file, imgbbKey ? 2400 : 1600, imgbbKey ? 2400 : 1600, imgbbKey ? 0.90 : 0.8);
      }
      if (imgData) pendingImages.push(imgData);
    } catch (e) { console.error(e); }
  }
  
  // Gli articoli entrano subito; le immagini si caricano in secondo piano con la rotellina
  if (pendingImages.length) card.uploading = Date.now();
  renderArticlesTable(card);
  saveLocal();
  renderAttachments(card);
  syncCardToCloud(card);
  
  event.target.value = '';
  playSound('success');
  showToast(pendingImages.length ? "Documento letto: carico l'allegato..." : "Documento importato correttamente!");
  if (uploadNotes.length) showInAppNotice(uploadNotes.join("\n\n"), 'Controlla gli articoli importati');
  setSyncStatus('saved');

  // Invio sequenziale delle immagini; la rotellina si spegne dopo l'ultima
  (async () => {
    for (let i = 0; i < pendingImages.length; i++) {
      await finishBackgroundUpload(card.id, pendingImages[i], imgbbKey, i < pendingImages.length - 1);
    }
  })();
}

function removePhoto(event, index) { 
  event.stopPropagation();
  const card = state.cards.find(c => c.id === activeCardId);
  
  if (card && card.photos) {
    confirmDeletion(`Allegato / Foto #${index + 1}`, () => {
      card.photos.splice(index, 1);
      saveLocal();
      renderAttachments(card);
      syncCardToCloud(card);
      setSyncStatus('saved');
    });
  } 
}

function openGallery(index) {
  currentGalleryIndex = index;
  updateGalleryView();
  openModal('galleryModal');
}

function closeGallery() {
  closeModal('galleryModal');
}

function updateGalleryView() {
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card || !card.photos || card.photos.length === 0) return closeGallery();
  
  const item = card.photos[currentGalleryIndex];
  const imgEl = document.getElementById('galleryImage');
  imgEl.src = item.image;
  imgEl.style.transform = `rotate(${item.rotation || 0}deg)`;
  
  document.getElementById('galleryCounter').innerText = `${currentGalleryIndex + 1} / ${card.photos.length}`;
  document.getElementById('btnPrevGallery').style.display = currentGalleryIndex === 0 ? 'none' : 'block';
  document.getElementById('btnNextGallery').style.display = currentGalleryIndex === card.photos.length - 1 ? 'none' : 'block';
  
  lucide.createIcons();
}

function prevGalleryImage() {
  if (currentGalleryIndex > 0) {
    currentGalleryIndex--;
    updateGalleryView();
  }
}

function nextGalleryImage() {
  const card = state.cards.find(c => c.id === activeCardId);
  if (card && currentGalleryIndex < card.photos.length - 1) {
    currentGalleryIndex++;
    updateGalleryView();
  }
}

function rotateGalleryImage() { 
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card || !card.photos) return;
  
  const item = card.photos[currentGalleryIndex];
  item.rotation = ((item.rotation || 0) + 90) % 360;
  
  saveLocal();
  updateGalleryView();
  renderAttachments(card);
  syncCardToCloud(card);
  setSyncStatus('saved');
}

function deleteCurrentCard() {
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card) return;
  
  confirmDeletion(`Commessa: ${card.title || 'Senza Nome'}`, () => {
    moveCardToTrash(card);
    state.cards = state.cards.filter(c => c.id !== activeCardId);
    saveLocal();
    syncDeleteToCloud(activeCardId);
    closeModal('detailModal');
    populateGlobalFilterDropdown();
  });
}

// ============================================
// STAMPA ETICHETTE COLLI (A6 Landscape Puro 148x105mm)
// ============================================
function openLabelPrintModal(cardId) {
  playSound('click');
  const card = state.cards.find(c => c.id === cardId);
  if (!card) return;
  
  activeLabelCardId = cardId;
  document.getElementById('labelClientName').innerText = card.client || 'N/D';
  document.getElementById('labelTaskTitle').innerText = card.title || 'Senza Titolo';
  
  const notesInput = document.getElementById('labelNotesInput');
  if (notesInput) {
    if (card.labelNotes !== undefined && card.labelNotes !== '') {
      notesInput.value = card.labelNotes;
    } else {
      notesInput.value = '';
    }
  }
  
  window.tempLabelArticles = [];
  const savedLabelItems = card.labelPackages && Array.isArray(card.labelPackages.items)
    ? card.labelPackages.items
    : null;
  if (savedLabelItems) {
    window.tempLabelArticles = savedLabelItems
      .filter(art => art && art.desc && art.desc.trim())
      .map(art => ({
        code: art.code || '',
        desc: art.desc,
        qty: art.qty || 1,
        packageNum: Math.max(1, parseInt(art.packageNum, 10) || 1)
      }));
  } else if (card.articles && card.articles.length > 0) {
    card.articles.forEach(art => {
      if(!art.desc || art.desc.trim() === '') return;
      window.tempLabelArticles.push({
        code: art.code || '',
        desc: art.desc,
        qty: art.qty || 1,
        packageNum: 1
      });
    });
  }
  
  renderLabelArticlesTable();
  openModal('labelPrintModal');
  lucide.createIcons();
}

function renderLabelArticlesTable() {
  const tbody = document.getElementById('labelArticlesBody');
  tbody.innerHTML = '';
  
  if (window.tempLabelArticles.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-slate-500 italic">Nessun articolo associato.</td></tr>`;
  } else {
    window.tempLabelArticles.forEach((art, idx) => {
      const tr = document.createElement('tr');
      tr.className = "hover:bg-slate-900/50 transition-colors";
      tr.innerHTML = `
        <td class="py-2 px-2 w-24"><input type="text" value="${esc(art.code || '')}" onchange="updateLabelRow(${idx}, 'code', this.value)" class="w-full bg-transparent border-b border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"></td>
        <td class="py-2 px-2"><input type="text" value="${esc(art.desc)}" onchange="updateLabelRow(${idx}, 'desc', this.value)" class="w-full bg-transparent border-b border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500"></td>
        <td class="py-2 px-2 text-center"><input type="number" min="1" value="${art.qty}" onchange="updateLabelRow(${idx}, 'qty', this.value)" class="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-sm text-center focus:outline-none focus:border-blue-500"></td>
        <td class="py-2 px-2 text-center"><input type="number" min="1" value="${art.packageNum}" onchange="updateLabelRow(${idx}, 'packageNum', this.value)" class="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-sm text-center focus:outline-none focus:border-blue-500"></td>
        <td class="py-2 px-2 text-center flex items-center justify-center gap-2">
          <button onclick="splitLabelRow(${idx})" class="p-1.5 bg-slate-800 hover:bg-blue-900/50 text-blue-400 rounded cursor-pointer transition-colors" title="Dividi Riga"><i data-lucide="split-square-vertical" class="w-4 h-4"></i></button>
          <button onclick="removeLabelRow(${idx})" class="p-1.5 bg-slate-800 hover:bg-red-900/50 text-red-400 rounded cursor-pointer transition-colors" title="Rimuovi"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
  lucide.createIcons();
}

function updateLabelRow(index, field, value) {
  if (field === 'qty' || field === 'packageNum') {
    window.tempLabelArticles[index][field] = parseInt(value) || 1;
  } else {
    window.tempLabelArticles[index][field] = value;
  }
}

function splitLabelRow(index) {
  playSound('click');
  const item = window.tempLabelArticles[index];
  const newItem = { code: item.code, desc: item.desc, qty: item.qty, packageNum: item.packageNum + 1 };
  window.tempLabelArticles.splice(index + 1, 0, newItem);
  renderLabelArticlesTable();
}

function removeLabelRow(index) {
  playSound('click');
  window.tempLabelArticles.splice(index, 1);
  renderLabelArticlesTable();
}

async function generateAndPrintLabels() {
  const card = state.cards.find(c => c.id === activeLabelCardId);
  if (!card) return;
  
  const packages = {};
  let hasValidArticles = false;
  
  if (window.tempLabelArticles.length > 0) {
    window.tempLabelArticles.forEach(art => {
      if(!art.desc || art.desc.trim() === '') return;
      const pkgNum = art.packageNum || 1;
      if (!packages[pkgNum]) packages[pkgNum] = [];
      packages[pkgNum].push({ code: art.code || '', desc: art.desc, qty: art.qty });
      hasValidArticles = true;
    });
  }
  
  if (!hasValidArticles) {
    packages[1] = [{code: '', desc: 'Materiale Commessa (Varie)', qty: 1}];
  }
  
  const packageNumbers = Object.keys(packages).map(Number).sort((a, b) => a - b);
  const totalPackages = packageNumbers.length;
  
  if (totalPackages === 0) {
    showToast("Nessun articolo selezionato per i colli.");
    return;
  }
  
  const labelNotes = document.getElementById('labelNotesInput') ? document.getElementById('labelNotesInput').value.trim() : '';
  const savedLabelItems = packageNumbers.flatMap((pkgNum, index) =>
    packages[pkgNum].map(item => ({
      code: item.code || '',
      desc: item.desc,
      qty: item.qty,
      packageNum: index + 1
    }))
  );
  const previousLabelPackages = card.labelPackages;
  const previousLabelNotes = card.labelNotes;
  card.labelNotes = labelNotes;
  card.labelPackages = {
    items: savedLabelItems,
    savedAt: new Date().toISOString(),
    totalPackages
  };

  if (!db) {
    if (previousLabelPackages === undefined) delete card.labelPackages;
    else card.labelPackages = previousLabelPackages;
    if (previousLabelNotes === undefined) delete card.labelNotes;
    else card.labelNotes = previousLabelNotes;
    showToast("Database non disponibile: i colli non sono stati salvati e le etichette non sono state generate.");
    return;
  }

  try {
    await db.collection('workflow_sga_cards').doc(card.id).set(card, { merge: true });
  } catch (error) {
    console.error(error);
    if (previousLabelPackages === undefined) delete card.labelPackages;
    else card.labelPackages = previousLabelPackages;
    if (previousLabelNotes === undefined) delete card.labelNotes;
    else card.labelNotes = previousLabelNotes;
    showToast("Salvataggio colli non riuscito: etichette non generate.");
    return;
  }

  saveLocal();
  setSyncStatus('saved');
  
  playSound('success');
  
  let labelsHtml = '';
  const senderText = "<strong style='font-size: 11px;'>Studio Grafico Associato di Gastaldi Antonio Francesco</strong><br>Via Mario Groppo 4 - 12048 Sommariva del Bosco (CN)<br>Tel: 0172 560087 - info@studiograficoassociato.com<br>www.studiograficoassociato.com";
  let logoHtml = sharedCompanyLogo ? `<img src="${sharedCompanyLogo}" class="print-logo">` : `<div class="logo-area">SGA</div><div class="logo-sub">STUDIO GRAFICO ASSOCIATO</div>`;

  let orderRefHtml = "";
  if (card.orderRef && card.orderRef.trim() !== "") {
    orderRefHtml = `
      <div style="margin-top: 8px; font-size: 11.5px; font-weight: bold; border-top: 1px dashed #888; padding-top: 4px;">
        Rif. Ordine: <span style="font-weight: normal;">${esc(card.orderRef)}</span>
      </div>
    `;
  }

  packageNumbers.forEach((pkgNum, idx) => {
    const currentPkgIndex = idx + 1;
    const articlesInPkg = packages[pkgNum];
    
    const articlesListHtml = articlesInPkg.map(a => `
      <tr>
        <td style="width: 45px; font-weight: bold; text-align: center; vertical-align: top; padding-top: 5px;">${a.qty}x</td>
        <td style="width: 75px; vertical-align: top; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding-top: 5px;">${esc(a.code)}</td>
        <td style="vertical-align: top; padding-bottom: 5px; padding-top: 5px;">${esc(a.desc)}</td>
      </tr>`).join('');
      
    const notesBoxHtml = labelNotes ? `
        <div class="box notes-box" style="margin-top: 2mm; flex-shrink: 0; min-height: 10mm; max-height: 16mm;">
          <div class="box-header" style="background: #555; padding: 2px 6px;">NOTE / RIFERIMENTI:</div>
          <div class="box-body" style="font-size: 11px; padding: 4px 6px; line-height: 1.2;">
            ${labelNotes.replace(/\n/g, '<br>')}
          </div>
        </div>
    ` : '';
    
    labelsHtml += `
      <div class="label-page">
        <div class="top-row">
          <div class="logo-box">${logoHtml}</div>
          <div class="sender-info">${senderText}</div>
          <div class="qr-code"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.studiograficoassociato.com" alt="QR Code" style="width: 100%; height: 100%; object-fit: contain;"></div>
        </div>
        <div class="middle-row">
          <div class="box dest-box">
            <div class="box-header">DESTINATARIO:</div>
            <div class="box-body" style="font-size: 16px; font-weight: bold; padding-top: 6px;">
              ${esc(card.client || 'Cliente N/D')}<br><span style="font-weight: normal; font-size: 12px;">${card.referent ? 'Rif: ' + esc(card.referent) : ''}</span>
            </div>
          </div>
          <div class="collo-box">Collo ${currentPkgIndex} di ${totalPackages}</div>
        </div>
        <div class="box content-box" style="flex: 1; display: flex; flex-direction: column;">
          <div class="box-header">CONTENUTO DEL COLLO:</div>
          <div class="box-body" style="padding: 4px; flex: 1; overflow: hidden; display: flex; flex-direction: column;">
            <table class="content-table" style="flex: 1; margin-bottom: auto;">
              <thead><tr><th style="width: 45px; text-align: center;">Q.T&Agrave;</th><th style="width: 75px;">CODICE</th><th>DESCRIZIONE MATERIALE</th></tr></thead>
              <tbody>${articlesListHtml}</tbody>
            </table>
            ${orderRefHtml}
          </div>
        </div>
        ${notesBoxHtml}
      </div>
    `;
  });

  const fullHtml = `<!DOCTYPE html>
  <html>
  <head>
    <title>Etichette_${esc(card.title)}</title>
    <style>
      @page { size: 148mm 105mm; margin: 0; }
      body, html { margin: 0; padding: 0; width: 148mm; background: #fff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .label-page { width: 148mm; height: 105mm; padding: 5mm; box-sizing: border-box; display: flex; flex-direction: column; page-break-after: always; break-after: page; background: #fff; overflow: hidden; position: relative; }
      .top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3.5mm; padding-bottom: 2.5mm; border-bottom: 2px solid #333; }
      .logo-box { width: 38mm; display: flex; flex-direction: column; justify-content: center; }
      .print-logo { max-height: 15mm; max-width: 100%; object-fit: contain; filter: brightness(0); object-position: left center; }
      .logo-area { font-weight: 900; font-size: 32px; line-height: 0.9; letter-spacing: -2px; color: #000; display: flex; align-items: center; }
      .logo-sub { font-size: 9px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 1px;}
      .sender-info { flex: 1; text-align: center; font-size: 9.5px; line-height: 1.35; color: #000; padding: 0 3mm; }
      .qr-code { width: 18mm; height: 18mm; border: 1.5px solid #333; padding: 1px; border-radius: 4px; flex-shrink: 0;}
      .box { border: 2px solid #333; border-radius: 6px; overflow: hidden; display: flex; flex-direction: column;}
      .box-header { background: #555; color: #fff; font-weight: bold; font-size: 11px; padding: 3px 8px; text-transform: uppercase; letter-spacing: 0.5px;}
      .box-body { background: #EBE8D8; padding: 6px 8px; font-size: 12px; line-height: 1.25; color: #000; flex: 1; }
      .middle-row { display: flex; gap: 3mm; height: 19mm; margin-bottom: 3mm;}
      .dest-box { flex: 1; }
      .dest-box .box-header { background: #444; }
      .collo-box { width: 42mm; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; background: #EBE8D8; border: 2px solid #333; border-radius: 6px; color: #000;}
      .content-box { flex: 1; }
      .content-box .box-header { background: #fff; color: #000; border-bottom: 2px solid #333;}
      .content-table { width: 100%; border-collapse: collapse; font-size: 13px; table-layout: auto; }
      .content-table tr { page-break-inside: avoid; height: auto !important; }
      .content-table th { background: #D9D9D9; border-bottom: 2px solid #888; text-align: left; padding: 3px 4px; font-size: 10.5px; font-weight: bold;}
      .content-table td { padding: 3px 4px; border-bottom: 1px solid #ddd; background: #EBE8D8; font-size: 11.5px;}
      .content-table tr:nth-child(even) td { background: #E1DECD; }
    </style>
  </head>
  <body>
    ${labelsHtml}
  </body>
  </html>`;

  const blob = new Blob([fullHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Etichetta_${card.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast("File etichetta generato! (148x105mm)");
  closeModal('labelPrintModal');
}

// ============================================
// STAMPA ETICHETTE COLLI LIBERA (SENZA COMMESSA)
// ============================================
function printFreeLabels() {
  const client = document.getElementById('freeLabelClient').value.trim();
  if(!client) {
    return showToast("Inserisci il destinatario!");
  }
  
  const referent = document.getElementById('freeLabelReferent').value.trim();
  const orderRef = document.getElementById('freeLabelOrderRef').value.trim();
  const labelNotes = document.getElementById('freeLabelNotes').value.trim();

  const packages = {};
  let hasValidArticles = false;

  if (window.tempFreeLabelArticles && window.tempFreeLabelArticles.length > 0) {
    window.tempFreeLabelArticles.forEach(art => {
      if(!art.desc || art.desc.trim() === '') return;
      const pkgNum = art.packageNum || 1;
      if (!packages[pkgNum]) packages[pkgNum] = [];
      packages[pkgNum].push({ code: art.code || '', desc: art.desc, qty: art.qty });
      hasValidArticles = true;
    });
  }

  if (!hasValidArticles) {
    packages[1] = [{code: '', desc: 'Materiale Vario', qty: 1}];
  }

  const packageNumbers = Object.keys(packages).map(Number).sort((a, b) => a - b);
  const totalPackages = packageNumbers.length;

  playSound('success');

  let labelsHtml = '';
  const senderText = "<strong style='font-size: 11px;'>Studio Grafico Associato di Gastaldi Antonio Francesco</strong><br>Via Mario Groppo 4 - 12048 Sommariva del Bosco (CN)<br>Tel: 0172 560087 - info@studiograficoassociato.com<br>www.studiograficoassociato.com";
  let logoHtml = sharedCompanyLogo ? `<img src="${sharedCompanyLogo}" class="print-logo">` : `<div class="logo-area">SGA</div><div class="logo-sub">STUDIO GRAFICO ASSOCIATO</div>`;

  let orderRefHtml = "";
  if (orderRef) {
    orderRefHtml = `
      <div style="margin-top: 8px; font-size: 11.5px; font-weight: bold; border-top: 1px dashed #888; padding-top: 4px;">
        Rif. Ordine: <span style="font-weight: normal;">${orderRef}</span>
      </div>
    `;
  }

  packageNumbers.forEach((pkgNum, idx) => {
    const currentPkgIndex = idx + 1;
    const articlesInPkg = packages[pkgNum];

    const articlesListHtml = articlesInPkg.map(a => `
      <tr>
        <td style="width: 45px; font-weight: bold; text-align: center; vertical-align: top; padding-top: 5px;">${a.qty}x</td>
        <td style="width: 75px; vertical-align: top; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding-top: 5px;">${esc(a.code)}</td>
        <td style="vertical-align: top; padding-bottom: 5px; padding-top: 5px;">${esc(a.desc)}</td>
      </tr>`).join('');

    const notesBoxHtml = labelNotes ? `
        <div class="box notes-box" style="margin-top: 2mm; flex-shrink: 0; min-height: 10mm; max-height: 16mm;">
          <div class="box-header" style="background: #555; padding: 2px 6px;">NOTE / RIFERIMENTI:</div>
          <div class="box-body" style="font-size: 11px; padding: 4px 6px; line-height: 1.2;">
            ${labelNotes.replace(/\n/g, '<br>')}
          </div>
        </div>
    ` : '';

    labelsHtml += `
      <div class="label-page">
        <div class="top-row">
          <div class="logo-box">${logoHtml}</div>
          <div class="sender-info">${senderText}</div>
          <div class="qr-code"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.studiograficoassociato.com" alt="QR Code" style="width: 100%; height: 100%; object-fit: contain;"></div>
        </div>
        <div class="middle-row">
          <div class="box dest-box">
            <div class="box-header">DESTINATARIO:</div>
            <div class="box-body" style="font-size: 16px; font-weight: bold; padding-top: 6px;">
              ${client}<br><span style="font-weight: normal; font-size: 12px;">${referent ? 'Rif: ' + referent : ''}</span>
            </div>
          </div>
          <div class="collo-box">Collo ${currentPkgIndex} di ${totalPackages}</div>
        </div>
        <div class="box content-box" style="flex: 1; display: flex; flex-direction: column;">
          <div class="box-header">CONTENUTO DEL COLLO:</div>
          <div class="box-body" style="padding: 4px; flex: 1; overflow: hidden; display: flex; flex-direction: column;">
            <table class="content-table" style="flex: 1; margin-bottom: auto;">
              <thead><tr><th style="width: 45px; text-align: center;">Q.T&Agrave;</th><th style="width: 75px;">CODICE</th><th>DESCRIZIONE MATERIALE</th></tr></thead>
              <tbody>${articlesListHtml}</tbody>
            </table>
            ${orderRefHtml}
          </div>
        </div>
        ${notesBoxHtml}
      </div>
    `;
  });

  const fullHtml = `<!DOCTYPE html>
  <html>
  <head>
    <title>Etichetta_Libera</title>
    <style>
      @page { size: 148mm 105mm; margin: 0; }
      body, html { margin: 0; padding: 0; width: 148mm; background: #fff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .label-page { width: 148mm; height: 105mm; padding: 5mm; box-sizing: border-box; display: flex; flex-direction: column; page-break-after: always; break-after: page; background: #fff; overflow: hidden; position: relative; }
      .top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3.5mm; padding-bottom: 2.5mm; border-bottom: 2px solid #333; }
      .logo-box { width: 38mm; display: flex; flex-direction: column; justify-content: center; }
      .print-logo { max-height: 15mm; max-width: 100%; object-fit: contain; filter: brightness(0); object-position: left center; }
      .logo-area { font-weight: 900; font-size: 32px; line-height: 0.9; letter-spacing: -2px; color: #000; display: flex; align-items: center; }
      .logo-sub { font-size: 9px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 1px;}
      .sender-info { flex: 1; text-align: center; font-size: 9.5px; line-height: 1.35; color: #000; padding: 0 3mm; }
      .qr-code { width: 18mm; height: 18mm; border: 1.5px solid #333; padding: 1px; border-radius: 4px; flex-shrink: 0;}
      .box { border: 2px solid #333; border-radius: 6px; overflow: hidden; display: flex; flex-direction: column;}
      .box-header { background: #555; color: #fff; font-weight: bold; font-size: 11px; padding: 3px 8px; text-transform: uppercase; letter-spacing: 0.5px;}
      .box-body { background: #EBE8D8; padding: 6px 8px; font-size: 12px; line-height: 1.25; color: #000; flex: 1; }
      .middle-row { display: flex; gap: 3mm; height: 19mm; margin-bottom: 3mm;}
      .dest-box { flex: 1; }
      .dest-box .box-header { background: #444; }
      .collo-box { width: 42mm; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; background: #EBE8D8; border: 2px solid #333; border-radius: 6px; color: #000;}
      .content-box { flex: 1; }
      .content-box .box-header { background: #fff; color: #000; border-bottom: 2px solid #333;}
      .content-table { width: 100%; border-collapse: collapse; font-size: 13px; table-layout: auto; }
      .content-table tr { page-break-inside: avoid; height: auto !important; }
      .content-table th { background: #D9D9D9; border-bottom: 2px solid #888; text-align: left; padding: 3px 4px; font-size: 10.5px; font-weight: bold;}
      .content-table td { padding: 3px 4px; border-bottom: 1px solid #ddd; background: #EBE8D8; font-size: 11.5px;}
      .content-table tr:nth-child(even) td { background: #E1DECD; }
    </style>
  </head>
  <body>
    ${labelsHtml}
  </body>
  </html>`;

  const blob = new Blob([fullHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Etichetta_Libera_${client.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast("Etichetta Libera generata!");
}

// ============================================
// STAMPA SCHEDA COMPLETA
// ============================================
function printCard() {
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card) return; 
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    showInAppNotice("Il pop-up per la stampa è stato bloccato dal browser. Consenti i pop-up per questo sito e riprova.");
    return;
  }

  const deliveryStr = card.deliveryDate ? new Date(card.deliveryDate).toLocaleDateString('it-IT') : 'Non specificata';
  
  const historyHtml = (card.history || []).map((h, i) => {
    return `
      <div style="margin-bottom: 8px; padding-left: 12px; border-left: 2px solid #cbd5e1; position: relative;">
        <div style="position: absolute; left: -5px; top: 2px; width: 8px; height: 8px; border-radius: 50%; background: #475569;"></div>
        <div style="font-weight: bold; font-size: 11px; color: #1e293b;">Passaggio #${i+1}: ${esc(h.label)}</div>
        <div style="font-size: 9px; color: #64748b;">Data: ${new Date(h.timestamp).toLocaleString('it-IT')}</div>
      </div>`; 
  }).join('');

  let articlesRowsHtml = '';
  let grandSubtotal = 0;
  let grandDiscount = 0;
  let grandTax = 0;
  let grandTotalTaxed = 0;
  
  if (card.articles && card.articles.length > 0) {
    card.articles.forEach(art => {
      const amounts = calculateArticleAmounts(art);
      
      grandSubtotal += amounts.rowTotalNet;
      grandDiscount += amounts.discountAmount;
      grandTax += amounts.taxAmount;
      grandTotalTaxed += amounts.rowTotalTaxed;
      
      articlesRowsHtml += `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; font-size: 11px; color: #0f172a; word-break: break-word;">${esc(art.code || '-')}</td>
          <td style="padding: 6px 4px; font-size: 11px; color: #0f172a;">${esc(art.desc || '-')}</td>
          <td class="n" style="text-align: center; font-size: 11px; color: #334155;">${art.qty !== undefined && art.qty !== '' ? art.qty : '-'}</td>
          <td class="n" style="text-align: right; font-size: 11px; color: #334155;">${art.price !== undefined && art.price !== '' ? '€ ' + parseFloat(art.price).toFixed(2) : '-'}</td>
          <td class="n" style="text-align: center; font-size: 11px; color: #334155;">${amounts.discountRate}%</td>
          <td class="n" style="text-align: center; font-size: 11px; color: #334155;">${amounts.taxRate}%</td>
          <td class="n" style="text-align: right; font-size: 11px; color: #334155;">${(art.qty !== undefined && art.price !== undefined && art.qty !== '' && art.price !== '') ? '€ ' + amounts.unitTaxPrice.toFixed(2) : '-'}</td>
          <td class="n" style="text-align: right; font-size: 11px; font-weight: bold; color: #0f172a;">${(art.qty !== undefined && art.price !== undefined && art.qty !== '' && art.price !== '') ? '€ ' + amounts.rowTotalTaxed.toFixed(2) : '-'}</td>
        </tr>`;
    });
  } else {
    articlesRowsHtml = `<tr><td colspan="8" style="padding: 10px; text-align: center; color: #64748b; font-size: 11px;">Nessun articolo inserito</td></tr>`;
  }

  let attachmentsPrintHtml = '';
  if (card.photos && card.photos.length > 0) {
    attachmentsPrintHtml = card.photos.map((p, idx) => {
      return `<div class="print-page"><img src="${p.image}" style="transform: rotate(${p.rotation || 0}deg);"></div>`; 
    }).join(''); 
  }
  
  const stageObj = COLUMNS_CONFIG.find(col => col.id === card.stage);
  const stageLabel = stageObj ? stageObj.label.toUpperCase() : card.stage.toUpperCase();
  const cardIdLabel = card.id ? card.id.slice(-4).toUpperCase() : 'N/D';
  const cardDateLabel = card.createdAt ? new Date(card.createdAt).toLocaleDateString('it-IT') : '-';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Commessa SGA #${cardIdLabel}</title>
      <style>
        @page { size: auto; margin: 0mm; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; color: #0f172a; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .sheet { width: 100%; min-height: 100vh; padding: 12mm 15mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
        .header { border-bottom: 3px solid #4f46e5; padding-bottom: 12mm; margin-bottom: 20px; }
        .logo-text { font-size: 12px; color: #64748b; font-weight: bold; letter-spacing: 1px; margin-bottom: 3px; }
        .title { font-size: 22px; font-weight: 800; margin: 0 0 5px; color: #1e293b; text-transform: uppercase; }
        .badge { font-size: 10px; font-weight: bold; background: #e0e7ff; color: #4338ca; padding: 3px 8px; border-radius: 4px; display: inline-block; }
        .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #475569; margin-top: 15px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 12mm; margin-bottom: 10px; }
        .details div { background: #f8fafc; padding: 8px 10px; border-radius: 6px; border: 1px solid #e2e8f0; }
        .details label { font-size: 9px; color: #64748b; font-weight: bold; display: block; text-transform: uppercase; margin-bottom: 2px; }
        .details strong { font-size: 12px; color: #0f172a; }
        table.articles { width: 100%; border-collapse: collapse; margin-top: 5px; }
        table.articles th { background: #f1f5f9; color: #334155; font-size: 10px; text-transform: uppercase; padding: 6px 4px; text-align: left; border-bottom: 2px solid #cbd5e1; }
        table.articles th.n { width: 1%; white-space: nowrap; padding-left: 8px; padding-right: 8px; }
        table.articles td.n { width: 1%; white-space: nowrap; padding: 6px 8px; }
        table.articles td { vertical-align: top; }
        .print-page { page-break-before: always; break-before: page; width: 100%; height: 98vh; display: block; text-align: center; padding: 0; margin: 0; box-sizing: border-box; }
        .print-page img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; margin: 0 auto; }
      </style>
    </head>
    <body>
      <div class="sheet">
        <div>
          <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div>
                <div class="logo-text">SGA STUDIO GRAFICO ASSOCIATO</div>
                <h1 class="title">SCHEDA COMMESSA</h1>
                <span class="badge">STATO: ${stageLabel}</span>
              </div>
              <div style="text-align: right; font-size: 11px; color: #64748b; line-height: 1.3;">
                Rif. Ordine: <strong style="color: #0f172a;">#${cardIdLabel}</strong><br>
                Data: <strong style="color: #0f172a;">${cardDateLabel}</strong>
              </div>
            </div>
          </div>
          <div class="details">
            <div><label>Cliente / Azienda</label><strong>${esc(card.title || '-')}</strong></div>
            <div><label>Tipo Lavorazione</label><strong>${esc(card.jobType || '-')} ${card.machine ? ' | Macchina: ' + esc(card.machine) : ''}</strong></div>
            <div><label>Referente & Contatti</label><strong>${esc(card.client || 'N/D')} ${card.referent ? '(' + esc(card.referent) + ')' : ''}</strong></div>
            <div><label>Data di Consegna</label><strong style="color: #ea580c;">${deliveryStr}</strong></div>
          </div>
          ${card.jobNotes && String(card.jobNotes).trim() ? `<div class="section-title">Note Commessa</div><div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 6px; padding: 10px; font-size: 12px; color: #0f172a; white-space: pre-wrap; margin-bottom: 8px;">${esc(card.jobNotes)}</div>` : ''}
          <div class="section-title">Articoli & Specifiche Lavorazione</div>
          <table class="articles">
            <thead>
              <tr>
                <th style="width: 15%;">Codice</th>
                <th>Descrizione</th>
                <th class="n" style="text-align: center;">Q.tà</th>
                <th class="n" style="text-align: right;">Prezzo Un.</th>
                <th class="n" style="text-align: center;">Sconto %</th>
                <th class="n" style="text-align: center;">IVA</th>
                <th class="n" style="text-align: right;">Pr. Ivato</th>
                <th class="n" style="text-align: right;">Tot. Ivato</th>
              </tr>
            </thead>
            <tbody>${articlesRowsHtml}</tbody>
          </table>
          <div style="text-align: right; margin-top: 10px; font-size: 12px; color: #475569;">
            Sconti: € ${grandDiscount.toFixed(2)} &nbsp;|&nbsp; Imponibile: € ${grandSubtotal.toFixed(2)} &nbsp;|&nbsp; Totale IVA: € ${grandTax.toFixed(2)}
          </div>
          <div style="text-align: right; margin-top: 4px; font-size: 14px;">
            <strong>Totale Ordine Ivato: <span style="color: #059669;">€ ${grandTotalTaxed.toFixed(2)}</span></strong>
          </div>
        </div>
        <div>
          <div class="section-title">Storyboard Lavorazione</div>
          <div style="background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">${historyHtml}</div>
        </div>
      </div>
      ${attachmentsPrintHtml}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 800);
}

// ==========================================
// TIPI DI LAVORAZIONE MODIFICABILI
// ==========================================
function fillJobTypeSelect(sel, current, allowEmpty) {
  if (!sel) return;
  const list = JOB_TYPES_DB.slice();
  if (current && !list.includes(current)) list.push(current);
  let opts = '';
  if (allowEmpty && !current) opts += '<option value="">Generico (nessuno)</option>';
  opts += list.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('');
  opts += '<option value="custom">Personalizza...</option>';
  const keep = current !== undefined && current !== null ? current : sel.value;
  sel.innerHTML = opts;
  if (keep === '' && allowEmpty && !current) sel.value = '';
  else if (keep && list.includes(keep)) sel.value = keep;
  else sel.selectedIndex = 0;
}

function populateJobTypeSelects() {
  fillJobTypeSelect(document.getElementById('formJobType'), undefined, false);
}

function saveJobTypes() {
  localStorage.setItem('workflow_sga_jobtypes_db', JSON.stringify(JOB_TYPES_DB));
  populateJobTypeSelects();
  populateGlobalFilterDropdown();
  if (db) db.collection('workflow_sga_settings').doc('config').set({ jobTypes: JOB_TYPES_DB }, { merge: true }).catch(e => console.error(e));
}

function addJobType() {
  const input = document.getElementById('newJobTypeInput');
  if (!input) return;
  const name = input.value.trim();
  if (!name) return;
  if (JOB_TYPES_DB.some(t => t.toLowerCase() === name.toLowerCase())) {
    playSound('alert');
    return showInAppNotice('Questa lavorazione è già nell\'elenco.');
  }
  JOB_TYPES_DB.push(name);
  saveJobTypes();
  playSound('success');
  openSubSettings('jobtypes');
}

function renameJobType(idx, value) {
  const oldName = JOB_TYPES_DB[idx];
  const name = String(value || '').trim();
  if (oldName === undefined || name === oldName) return;
  if (!name) { openSubSettings('jobtypes'); return showInAppNotice('Il nome non può essere vuoto.'); }
  if (JOB_TYPES_DB.some((t, i) => i !== idx && t.toLowerCase() === name.toLowerCase())) {
    openSubSettings('jobtypes');
    return showInAppNotice('Esiste già una lavorazione con questo nome.');
  }
  JOB_TYPES_DB[idx] = name;
  // Le commesse in corso con il vecchio nome passano al nuovo
  let changed = 0;
  state.cards.forEach(c => {
    if (c.jobType === oldName) { c.jobType = name; changed++; syncCardToCloud(c); }
  });
  if (changed) saveLocal();
  saveJobTypes();
  playSound('success');
  showToast(changed ? `Rinominata anche su ${changed} commess${changed === 1 ? 'a' : 'e'}.` : 'Lavorazione rinominata.');
  renderBoard();
}

function removeJobType(idx) {
  const name = JOB_TYPES_DB[idx];
  if (name === undefined) return;
  confirmDeletion(`Lavorazione: ${name} (le commesse che la usano restano com'è)`, () => {
    JOB_TYPES_DB.splice(idx, 1);
    if (JOB_TYPES_DB.length === 0) JOB_TYPES_DB = ['Altro'];
    saveJobTypes();
    openSubSettings('jobtypes');
  });
}

function resetJobTypes() {
  showInAppConfirm("Rimettere l'elenco originale delle lavorazioni? Le voci aggiunte da te verranno tolte dal menu (le commesse già fatte non cambiano).", () => {
    JOB_TYPES_DB = JOB_TYPES_DEFAULT.slice();
    saveJobTypes();
    openSubSettings('jobtypes');
  }, 'Ripristina');
}

// ==========================================
// STORICO LAVORI DEL CLIENTE
// Ogni voce e' un documento a parte (collezione workflow_sga_settings, id "chist_...")
// ==========================================
let historyCtx = null;

function historyKeyOf(name) { return String(name || '').trim().toLowerCase().replace(/\s+/g, ' '); }
function histPad(n) { return String(n).padStart(2, '0'); }
function histToday() { const d = new Date(); return d.getFullYear() + '-' + histPad(d.getMonth() + 1) + '-' + histPad(d.getDate()); }
function histDateIt(iso) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? m[3] + '/' + m[2] + '/' + m[1] : (iso || ''); }

function ensureHistoryModal() {
  if (document.getElementById('clientHistoryModal')) return;
  const el = document.createElement('div');
  el.id = 'clientHistoryModal';
  el.className = 'hidden fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[60] flex items-center justify-center p-4';
  el.innerHTML = `
    <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl">
      <div class="p-4 border-b border-slate-800 flex items-center justify-between gap-3">
        <h3 id="histTitle" class="font-bold text-base text-slate-100 flex items-center gap-2"></h3>
        <button onclick="closeClientHistory()" class="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer" title="Chiudi"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>
      <div class="p-4 overflow-y-auto space-y-3 flex-1">
        <div class="flex gap-2">
          <input id="histSearch" type="text" autocomplete="off" placeholder="Cerca nello storico (titolo, note, data)..." oninput="renderHistoryList()" class="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500">
          <button onclick="openHistoryForm()" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded-lg font-semibold cursor-pointer flex items-center gap-1.5"><i data-lucide="plus" class="w-3.5 h-3.5"></i> Nuova voce</button>
        </div>
        <div id="histForm" class="hidden bg-slate-950 border border-indigo-500/40 rounded-xl p-3 space-y-2">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input id="histFormTitle" type="text" autocomplete="off" placeholder="Titolo del lavoro *" class="sm:col-span-2 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500">
            <input id="histFormDate" type="date" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500">
          </div>
          <textarea id="histFormNotes" rows="5" placeholder="Note: codici filo, posizione, quantità, prezzo, specifiche..." class="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"></textarea>
          <div id="histFormPhotos" class="flex flex-wrap gap-2"></div>
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <label class="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 text-slate-200">
              <i data-lucide="camera" class="w-3.5 h-3.5"></i> Aggiungi foto
              <input type="file" accept="image/*" multiple class="hidden" onchange="histAddFiles(event)">
            </label>
            <div class="flex gap-2">
              <button onclick="cancelHistoryForm()" class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer">Annulla</button>
              <button id="histSaveBtn" onclick="saveHistoryEntry()" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-1.5 rounded-lg font-semibold cursor-pointer">Salva voce</button>
            </div>
          </div>
        </div>
        <div id="histList" class="space-y-2"></div>
      </div>
    </div>`;
  document.body.appendChild(el);
}

async function openClientHistory(clientId, preset) {
  const c = CLIENTS_DB.find(x => x.id === clientId);
  if (!c) return;
  ensureHistoryModal();
  const ctx = { key: historyKeyOf(c.name), name: c.name, entries: [], editingId: null, formPhotos: [], fromCardId: null, loading: true };
  historyCtx = ctx;
  document.getElementById('histTitle').innerHTML = `<i data-lucide="history" class="w-5 h-5 text-indigo-400"></i> Storico lavori — ${esc(c.name)}`;
  document.getElementById('histSearch').value = '';
  document.getElementById('histForm').classList.add('hidden');
  renderHistoryList();
  openModal('clientHistoryModal');
  lucide.createIcons();
  try {
    const snap = await db.collection('workflow_sga_settings').where('clientKey', '==', ctx.key).get();
    ctx.entries = snap.docs.map(d => d.data()).filter(x => x && x.kind === 'client_history');
    ctx.entries.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  } catch (e) {
    console.error(e);
    showInAppNotice('Non riesco a leggere lo storico di questo cliente. Controlla la connessione e riprova.\n\nDettaglio tecnico: ' + (e && e.message ? e.message : e));
  }
  if (historyCtx !== ctx) return;
  ctx.loading = false;
  renderHistoryList();
  if (preset) openHistoryForm(null, preset);
}

function closeClientHistory() {
  if (historyCtx) histRevokePreviews();
  closeModal('clientHistoryModal');
  historyCtx = null;
}

function histRevokePreviews() {
  (historyCtx && historyCtx.formPhotos || []).forEach(p => { if (p.preview) { try { URL.revokeObjectURL(p.preview); } catch (e) {} } });
}

function renderHistoryList() {
  const box = document.getElementById('histList');
  if (!box || !historyCtx) return;
  if (historyCtx.loading) { box.innerHTML = '<p class="text-xs text-slate-500 italic py-4 text-center">Carico lo storico...</p>'; return; }
  const q = String((document.getElementById('histSearch') || {}).value || '').trim().toLowerCase();
  const all = historyCtx.entries;
  const list = q ? all.filter(e => (String(e.title || '') + ' ' + String(e.notes || '') + ' ' + histDateIt(e.date)).toLowerCase().includes(q)) : all;
  if (all.length === 0) { box.innerHTML = '<p class="text-xs text-slate-500 italic py-4 text-center">Ancora nessun lavoro salvato per questo cliente. Premi "Nuova voce" oppure usa "Salva nello storico" dentro una commessa.</p>'; return; }
  if (list.length === 0) { box.innerHTML = '<p class="text-xs text-slate-500 italic py-4 text-center">Nessun risultato.</p>'; return; }
  box.innerHTML = list.map(e => `
    <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="text-[11px] text-indigo-300 font-mono">${esc(histDateIt(e.date))}</div>
          <div class="text-sm font-bold text-white break-words">${esc(e.title || 'Senza titolo')}</div>
        </div>
        <div class="flex gap-1 shrink-0">
          <button onclick="openHistoryForm('${esc(e.id)}')" class="text-slate-400 hover:text-indigo-300 p-1.5 cursor-pointer" title="Modifica"><i data-lucide="pencil" class="w-3.5 h-3.5"></i></button>
          <button onclick="deleteHistoryEntry('${esc(e.id)}')" class="text-slate-500 hover:text-red-400 p-1.5 cursor-pointer" title="Elimina"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        </div>
      </div>
      ${e.notes ? `<div class="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">${esc(e.notes)}</div>` : ''}
      ${(e.photos && e.photos.length) ? `<div class="flex flex-wrap gap-2">${e.photos.map((p, i) => `<img src="${esc(p.image)}" onclick="openHistLightbox('${esc(e.id)}', ${i})" class="h-20 w-20 object-cover rounded border border-slate-700 cursor-zoom-in bg-slate-900">`).join('')}</div>` : ''}
    </div>`).join('');
  lucide.createIcons();
}

function openHistLightbox(entryId, idx) {
  if (!historyCtx) return;
  const e = historyCtx.entries.find(x => x.id === entryId);
  const p = e && e.photos && e.photos[idx];
  if (!p) return;
  const ov = document.createElement('div');
  ov.className = 'fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 cursor-zoom-out';
  const img = document.createElement('img');
  img.src = p.image;
  img.className = 'max-h-[94vh] max-w-[96vw] object-contain rounded';
  ov.appendChild(img);
  ov.onclick = () => ov.remove();
  document.body.appendChild(ov);
}

function openHistoryForm(entryId, preset) {
  if (!historyCtx) return;
  histRevokePreviews();
  const e = entryId ? historyCtx.entries.find(x => x.id === entryId) : null;
  historyCtx.editingId = e ? e.id : null;
  historyCtx.fromCardId = (preset && preset.fromCardId) || (e && e.fromCardId) || null;
  const src = e ? e.photos : ((preset && preset.photos) || []);
  historyCtx.formPhotos = (src || []).map(p => ({ kind: 'saved', image: p.image }));
  document.getElementById('histFormTitle').value = e ? (e.title || '') : ((preset && preset.title) || '');
  document.getElementById('histFormDate').value = e ? (e.date || histToday()) : ((preset && preset.date) || histToday());
  document.getElementById('histFormNotes').value = e ? (e.notes || '') : ((preset && preset.notes) || '');
  document.getElementById('histSaveBtn').textContent = e ? 'Aggiorna voce' : 'Salva voce';
  document.getElementById('histSaveBtn').disabled = false;
  document.getElementById('histForm').classList.remove('hidden');
  renderHistFormPhotos();
  const f = document.getElementById('histForm');
  if (f.scrollIntoView) f.scrollIntoView({ block: 'nearest' });
  document.getElementById('histFormTitle').focus();
}

function cancelHistoryForm() {
  if (historyCtx) { histRevokePreviews(); historyCtx.formPhotos = []; historyCtx.editingId = null; }
  document.getElementById('histForm').classList.add('hidden');
}

function renderHistFormPhotos() {
  const box = document.getElementById('histFormPhotos');
  if (!box || !historyCtx) return;
  box.innerHTML = historyCtx.formPhotos.map((p, i) => `
    <div class="relative">
      <img src="${esc(p.kind === 'saved' ? p.image : p.preview)}" class="h-16 w-16 object-cover rounded border border-slate-700 bg-slate-900">
      <button onclick="removeHistFormPhoto(${i})" class="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[11px] leading-none cursor-pointer" title="Togli foto">&times;</button>
    </div>`).join('');
}

function histAddFiles(event) {
  if (!historyCtx) return;
  Array.from(event.target.files || []).forEach(file => {
    if (!file.type || !file.type.startsWith('image/')) return;
    historyCtx.formPhotos.push({ kind: 'new', file: file, preview: URL.createObjectURL(file) });
  });
  event.target.value = '';
  renderHistFormPhotos();
}

function removeHistFormPhoto(i) {
  if (!historyCtx) return;
  const p = historyCtx.formPhotos[i];
  if (p && p.preview) { try { URL.revokeObjectURL(p.preview); } catch (e) {} }
  historyCtx.formPhotos.splice(i, 1);
  renderHistFormPhotos();
}

// Invia una foto a ImgBB; se non riesce la tiene dentro la voce (alta qualita')
async function histUploadImage(dataUrl) {
  const key = IMGBB_API_KEY && IMGBB_API_KEY !== "INSERISCI_QUI_LA_TUA_CHIAVE_IMGBB" ? IMGBB_API_KEY : null;
  if (!key) return { image: dataUrl, failed: false };
  try {
    const fd = new FormData();
    fd.append('image', dataUrl.split(',')[1]);
    const r = await fetch('https://api.imgbb.com/1/upload?key=' + key, { method: 'POST', body: fd });
    let data = null;
    try { data = await r.json(); } catch (je) {}
    if (data && data.success) return { image: data.data.url, failed: false };
    throw new Error('Risposta ImgBB: stato ' + r.status);
  } catch (e) {
    console.error(e);
    return { image: dataUrl, failed: true, reason: (e && e.message) ? e.message : String(e) };
  }
}

async function saveHistoryEntry() {
  if (!historyCtx) return;
  const ctx = historyCtx;
  const title = document.getElementById('histFormTitle').value.trim();
  if (!title) return showInAppNotice('Scrivi un titolo per il lavoro (es. "Ricamo logo cappellini").');
  const btn = document.getElementById('histSaveBtn');
  btn.disabled = true;

  const photos = [];
  const failures = [];
  const toSend = ctx.formPhotos.filter(p => p.kind === 'new').length;
  let sent = 0;
  for (const fp of ctx.formPhotos) {
    if (fp.kind === 'saved') { photos.push({ image: fp.image }); continue; }
    sent++;
    btn.textContent = `Carico foto ${sent}/${toSend}...`;
    try {
      const data = await compressImage(fp.file, 2400, 2400, 0.90);
      const up = await histUploadImage(data);
      photos.push({ image: up.image });
      if (up.failed) failures.push(up.reason);
    } catch (e) { console.error(e); failures.push('foto non leggibile'); }
  }

  const nowIso = new Date().toISOString();
  const old = ctx.editingId ? ctx.entries.find(x => x.id === ctx.editingId) : null;
  const entry = {
    id: old ? old.id : 'h' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    kind: 'client_history',
    clientKey: ctx.key,
    clientName: ctx.name,
    title: title,
    date: document.getElementById('histFormDate').value || histToday(),
    notes: document.getElementById('histFormNotes').value.trim(),
    photos: photos,
    createdAt: old ? (old.createdAt || nowIso) : nowIso,
    updatedAt: nowIso
  };
  if (ctx.fromCardId) entry.fromCardId = ctx.fromCardId;

  if (JSON.stringify(entry).length > 900000) {
    btn.disabled = false;
    btn.textContent = old ? 'Aggiorna voce' : 'Salva voce';
    return showInAppNotice('Le foto sono troppo pesanti per essere tenute dentro la voce (ImgBB non ha risposto). Riprova tra poco, oppure metti meno foto.', 'Voce non salvata');
  }
  try {
    await db.collection('workflow_sga_settings').doc('chist_' + entry.id).set(entry);
  } catch (e) {
    console.error(e);
    btn.disabled = false;
    btn.textContent = old ? 'Aggiorna voce' : 'Salva voce';
    return showInAppNotice('Salvataggio non riuscito. Controlla la connessione e riprova.\n\nDettaglio tecnico: ' + (e && e.message ? e.message : e), 'Voce non salvata');
  }
  if (historyCtx !== ctx) return;
  const i = ctx.entries.findIndex(x => x.id === entry.id);
  if (i >= 0) ctx.entries[i] = entry; else ctx.entries.push(entry);
  ctx.entries.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  histRevokePreviews();
  ctx.formPhotos = [];
  ctx.editingId = null;
  document.getElementById('histForm').classList.add('hidden');
  renderHistoryList();
  playSound('success');
  showToast('Voce salvata nello storico.');
  if (failures.length) {
    showInAppNotice(failures.length + ' foto non sono state caricate su ImgBB: sono state salvate comunque dentro la voce, in alta qualità.\n\nDettaglio tecnico: ' + failures[0], 'Caricamento su ImgBB non riuscito');
  }
}

function deleteHistoryEntry(entryId) {
  if (!historyCtx) return;
  const ctx = historyCtx;
  const e = ctx.entries.find(x => x.id === entryId);
  if (!e) return;
  confirmDeletion(`Voce dello storico: ${e.title || 'Senza titolo'}`, async () => {
    try {
      await db.collection('workflow_sga_settings').doc('chist_' + e.id).delete();
      ctx.entries = ctx.entries.filter(x => x.id !== e.id);
      if (historyCtx === ctx) renderHistoryList();
    } catch (err) {
      console.error(err);
      showInAppNotice('Eliminazione non riuscita. Controlla la connessione e riprova.');
    }
  });
}

// Dalla commessa aperta: apre lo storico del cliente con la voce gia' compilata
function saveCardToClientHistory() {
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card) return;
  saveCardEdits(true);
  const nm = historyKeyOf(card.title);
  const client = CLIENTS_DB.find(x => historyKeyOf(x.name) === nm) ||
    CLIENTS_DB.find(x => { const k = historyKeyOf(x.name); return k && nm && (k.includes(nm) || nm.includes(k)); });
  if (!client) {
    playSound('alert');
    return showInAppNotice('Il cliente "' + (card.title || 'senza nome') + '" non è nel database clienti.\n\nAggiungilo da Impostazioni → Clienti e poi riprova: lo storico si salva dentro la scheda del cliente.', 'Cliente non trovato');
  }
  const arts = (card.articles || []).filter(a => a && a.desc && String(a.desc).trim());
  const lines = [];
  if (card.orderRef) lines.push(card.orderRef);
  arts.forEach(a => {
    const q = parseFloat(a.qty), p = parseFloat(a.price), d = parseFloat(a.discount);
    let l = (isFinite(q) && q > 0 ? q + ' x ' : '') + String(a.desc).trim();
    if (isFinite(p) && p > 0) l += ' — ' + p.toFixed(2).replace('.', ',') + ' € cad.';
    if (isFinite(d) && d > 0) l += ' (sconto ' + d + '%)';
    lines.push(l);
  });
  if (card.machine) lines.push('Macchina: ' + card.machine);
  if (card.jobNotes && String(card.jobNotes).trim()) { lines.push(''); lines.push('Note: ' + String(card.jobNotes).trim()); }
  const firstDesc = arts.length ? String(arts[0].desc).trim() : '';
  openClientHistory(client.id, {
    title: (firstDesc || card.jobType || card.title || 'Lavoro').substring(0, 80),
    date: card.deliveryDate || histToday(),
    notes: lines.join('\n'),
    photos: (card.photos || []).filter(p => p && p.image).map(p => ({ image: p.image })),
    fromCardId: card.id
  });
}

// ============================================
// SVEGLIE
// ============================================
function addAlarmRule() {
  USER_ALARMS.push({ id: 'a' + Date.now(), time: "09:00", active: true, days: [1, 2, 3, 4, 5] });
  renderAlarmsList();
}

function removeAlarmRule(id) {
  const a = USER_ALARMS.find(x => x.id === id);
  if(!a) return;
  confirmDeletion(`Sveglia delle ore ${a.time}`, () => {
    USER_ALARMS = USER_ALARMS.filter(x => x.id !== id);
    renderAlarmsList();
  });
}

function updateAlarmTime(id, val) {
  const alarm = USER_ALARMS.find(a => a.id === id);
  if (alarm) alarm.time = val;
}

function toggleAlarmActive(id, val) {
  const alarm = USER_ALARMS.find(a => a.id === id);
  if (alarm) alarm.active = val;
}

function toggleAlarmDay(id, dayVal) {
  playSound('click');
  const alarm = USER_ALARMS.find(a => a.id === id);
  if (alarm) {
    if (!Array.isArray(alarm.days)) alarm.days = [];
    const index = alarm.days.indexOf(dayVal);
    if (index >= 0) {
      alarm.days.splice(index, 1);
    } else {
      alarm.days.push(dayVal);
    }
    renderAlarmsList();
  }
}

function renderAlarmsList() {
  const container = document.getElementById('alarmsListContainer');
  if (!container) return;
  container.innerHTML = '';
  
  if (USER_ALARMS.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-500 italic py-3 text-center">Nessuna sveglia impostata.</p>`;
    return;
  }
  
  const daysDef = [
    {val: 1, label: "L"},
    {val: 2, label: "M"},
    {val: 3, label: "M"},
    {val: 4, label: "G"},
    {val: 5, label: "V"},
    {val: 6, label: "S"},
    {val: 0, label: "D"}
  ];
  
  USER_ALARMS.forEach(alarm => {
    const card = document.createElement('div');
    card.className = "bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-3";
    
    let daysBtnsHtml = daysDef.map(d => {
      const isSelected = Array.isArray(alarm.days) && alarm.days.includes(d.val);
      const btnClass = isSelected ? "w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow cursor-pointer transition-all" : "w-7 h-7 rounded-full bg-slate-950 text-slate-400 font-semibold text-xs flex items-center justify-center border border-slate-800 hover:border-slate-700 cursor-pointer transition-all";
      return `<button type="button" onclick="toggleAlarmDay('${alarm.id}', ${d.val})" class="${btnClass}">${d.label}</button>`;
    }).join('');
    
    card.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <input type="time" value="${alarm.time || '09:00'}" onchange="updateAlarmTime('${alarm.id}', this.value)" class="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-base text-emerald-400 font-mono font-bold focus:outline-none focus:border-indigo-500">
          <label class="flex items-center cursor-pointer select-none text-xs text-slate-300 gap-1.5">
            <input type="checkbox" ${alarm.active ? 'checked' : ''} onchange="toggleAlarmActive('${alarm.id}', this.checked)" class="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 cursor-pointer">
            <span>Attiva</span>
          </label>
        </div>
        <button onclick="removeAlarmRule('${alarm.id}')" class="text-red-400 hover:text-red-300 p-1.5 rounded-lg bg-red-950/35 hover:bg-red-950/60 transition-colors cursor-pointer">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
      <div class="flex items-center justify-between pt-1 border-t border-slate-800/60 flex-wrap gap-2">
        <span class="text-[10px] text-slate-400 uppercase font-semibold">Giorni attivo:</span>
        <div class="flex gap-1.5">${daysBtnsHtml}</div>
      </div>
    `;
    container.appendChild(card);
  });
  
  lucide.createIcons();
}

function openModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
  if (modalId === 'cloudModal') prepareCloudModal();
}

function prepareCloudModal() {
  const f = document.getElementById('cfgImgbbKey');
  if (f) { f.value = IMGBB_API_KEY || ''; f.type = 'password'; }
  const st = document.getElementById('cfgImgbbStatus');
  if (st) st.innerHTML = IMGBB_API_KEY ? '<span class="text-emerald-400">Chiave impostata: le foto vanno su ImgBB.</span>' : '<span class="text-amber-400">Nessuna chiave: gli allegati restano dentro le commesse (alta qualità).</span>';
}

function toggleImgbbKeyVisible() {
  const f = document.getElementById('cfgImgbbKey');
  if (f) f.type = f.type === 'password' ? 'text' : 'password';
}

function saveImgbbConfig() {
  const f = document.getElementById('cfgImgbbKey');
  const v = f ? f.value.trim() : '';
  if (!v) {
    showInAppConfirm('Il campo è vuoto: tolgo la chiave ImgBB da tutti i dispositivi? Le foto già caricate restano visibili.', () => {
      IMGBB_API_KEY = '';
      try { localStorage.removeItem('workflow_sga_imgbb_key'); } catch (e) {}
      if (db) db.collection('workflow_sga_settings').doc('config').set({ imgbbKey: '' }, { merge: true }).catch(e => console.error(e));
      updateCloudStatus(true); prepareCloudModal(); showToast('Chiave ImgBB rimossa');
    }, 'Rimuovi');
    return;
  }
  if (!/^[A-Za-z0-9]{24,48}$/.test(v)) {
    showInAppNotice('La chiave non sembra corretta (deve essere una sola parola di lettere e numeri, senza spazi). Controlla di averla copiata intera.');
    return;
  }
  IMGBB_API_KEY = v;
  try { localStorage.setItem('workflow_sga_imgbb_key', v); } catch (e) {}
  if (db) db.collection('workflow_sga_settings').doc('config').set({ imgbbKey: v }, { merge: true }).then(() => showToast('Chiave ImgBB salvata per tutti i dispositivi')).catch(e => { console.error(e); showToast('⚠️ Salvataggio sul cloud non riuscito'); });
  updateCloudStatus(true);
  prepareCloudModal();
  closeModal('cloudModal');
}

function warnNoImgbbOnce() {
  if (IMGBB_API_KEY) return;
  if (window.__noImgbbWarned) return;
  window.__noImgbbWarned = true;
  showToast('ℹ️ Chiave ImgBB non impostata: l\'allegato resta dentro la commessa. La inserisci in Impostazioni Cloud (clic su "Cloud Attivo").');
}

// Versione del software (Impostazioni Generali)
async function updateVersionLabel() {
  const el = document.getElementById('appVersionLabel');
  const st = document.getElementById('appVersionStatus');
  if (el) el.textContent = 'Versione ' + APP_VERSION + ' · ' + APP_VERSION_DATE;
  if (!st) return;
  st.innerHTML = '<span class="text-slate-500">controllo...</span>';
  try {
    const r = await fetch('./app.js?_=' + Date.now(), { cache: 'no-store', headers: { Range: 'bytes=0-6000' } });
    const t = await r.text();
    const m = t.match(/const APP_VERSION = (\d+);/);
    if (!m) { st.innerHTML = ''; return; }
    const pub = parseInt(m[1], 10);
    if (pub === APP_VERSION) st.innerHTML = '<span class="text-emerald-400">✓ è l\'ultima versione pubblicata</span>';
    else st.innerHTML = '<span class="text-amber-400">⚠ Pubblicata la versione ' + pub + '.</span> <button onclick="reloadAppNow()" class="underline text-amber-300 cursor-pointer">Ricarica ora</button>';
  } catch (e) { st.innerHTML = ''; }
}

function reloadAppNow() {
  const u = new URL(location.href);
  u.searchParams.set('_v', Date.now());
  location.replace(u.toString());
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

// ============================================
// GESTIONE ARCHIVIO
// ============================================
function deleteArchivedCard(cardId) {
  const card = state.cards.find(c => c.id === cardId);
  if (!card) return;
  
  confirmDeletion(`Sei sicuro di voler eliminare DEFINITIVAMENTE l'ordine "${card.title}" dall'archivio? Questa operazione non è reversibile.`, () => {
    state.cards = state.cards.filter(c => c.id !== cardId);
    saveLocal();
    syncDeleteToCloud(cardId);
    
    const searchInput = document.getElementById('archiveSearchInput');
    filterArchive(searchInput ? searchInput.value : '');
    updateStorageIndicator();
  });
}

function updateStorageIndicator() {
  const indicator = document.getElementById('storageUsageIndicator');
  if (!indicator) return;
  
  let lsTotal = 0;
  for (let x in localStorage) {
    if (!localStorage.hasOwnProperty(x)) continue;
    lsTotal += ((localStorage[x].length + x.length) * 2);
  }
  
  const kbTotal = (lsTotal / 1024).toFixed(2);
  const maxKb = 5120;
  const percentage = ((kbTotal / maxKb) * 100).toFixed(1);
  
  indicator.innerText = `${percentage}% (${kbTotal} KB)`;
  
  if (percentage > 80) {
    indicator.classList.replace('text-emerald-400', 'text-red-500');
    indicator.classList.add('animate-pulse');
  } else if (percentage > 50) {
    indicator.classList.replace('text-emerald-400', 'text-yellow-400');
  } else {
    indicator.classList.replace('text-red-500', 'text-emerald-400');
    indicator.classList.replace('text-yellow-400', 'text-emerald-400');
    indicator.classList.remove('animate-pulse');
  }
}

function printArchiveReport() {
  const archivedCards = state.cards.filter(c => c.stage === 'archiviato');
  if (archivedCards.length === 0) {
    showToast("Nessuna commessa in archivio da stampare.");
    return;
  }
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    showInAppNotice("Il pop-up per la stampa è stato bloccato dal browser. Consenti i pop-up per questo sito e riprova.");
    return;
  }
  
  let rowsHtml = '';
  let grandTotalNet = 0;
  let grandTotalTax = 0;
  let grandTotalGross = 0;

  archivedCards.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(card => {
    let cardNet = 0;
    let cardTax = 0;
    let cardGross = 0;
    
    if (card.articles && card.articles.length > 0) {
      card.articles.forEach(art => {
        const amounts = calculateArticleAmounts(art);
        cardNet += amounts.rowTotalNet;
        cardTax += amounts.taxAmount;
        cardGross += amounts.rowTotalTaxed;
      });
    }
    
    grandTotalNet += cardNet;
    grandTotalTax += cardTax;
    grandTotalGross += cardGross;
    
    const dateStr = card.createdAt ? new Date(card.createdAt).toLocaleDateString('it-IT') : '-';
    rowsHtml += `
      <tr>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0;">${dateStr}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${esc(card.title)}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0;">${esc(card.client || '-')}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">€ ${cardNet.toFixed(2)}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0f172a;">€ ${cardGross.toFixed(2)}</td>
      </tr>
    `;
  });

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Report Archivio Fatturato SGA</title>
      <style>
        @page { size: A4 portrait; margin: 15mm; } 
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; color: #0f172a; font-size: 11px; } 
        .header { border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-bottom: 20px; text-align: center;} 
        .title { font-size: 18px; font-weight: 800; margin: 0 0 5px; color: #1e293b; text-transform: uppercase; } 
        .subtitle { color: #64748b; font-size: 11px; } 
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; } 
        th { background: #f1f5f9; color: #334155; font-size: 10px; text-transform: uppercase; padding: 8px; text-align: left; border-bottom: 2px solid #cbd5e1; } 
        .totals-box { width: 100%; border: 2px solid #e2e8f0; border-radius: 8px; padding: 15px; display: flex; justify-content: space-around; background: #f8fafc; margin-top: 20px; page-break-inside: avoid; } 
        .totals-box div { text-align: center; } 
        .totals-box label { display: block; font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 5px; } 
        .totals-box span { font-size: 16px; font-weight: bold; color: #0f172a; } 
        .totals-box .highlight span { color: #059669; font-size: 18px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">Report Archivio Commesse Fatturate</h1>
        <div class="subtitle">SGA Studio Grafico Associato - Generato il ${new Date().toLocaleString('it-IT')}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 15%;">Data</th>
            <th style="width: 35%;">Titolo Commessa</th>
            <th style="width: 25%;">Cliente</th>
            <th style="width: 12%; text-align: right;">Imponibile</th>
            <th style="width: 13%; text-align: right;">Tot. Ivato</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <div class="totals-box">
        <div>
          <label>Totale Imponibile</label>
          <span>€ ${grandTotalNet.toFixed(2)}</span>
        </div>
        <div>
          <label>Totale IVA</label>
          <span>€ ${grandTotalTax.toFixed(2)}</span>
        </div>
        <div class="highlight">
          <label>Fatturato Totale (Ivato)</label>
          <span>€ ${grandTotalGross.toFixed(2)}</span>
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 800);
}

// ============================================
// GESTIONE DATABASE ARTICOLI BASE
// ============================================
function filterSettingsArticles() {
  const box = document.getElementById('settingsArticlesList');
  if (!box) return;
  box.innerHTML = renderArticlesSettingsList();
  lucide.createIcons();
}

function renderArticlesSettingsList() {
  const qEl = document.getElementById('settingsArticlesSearch');
  const q = qEl ? qEl.value.trim().toLowerCase() : '';
  // si tiene l'indice vero dell'articolo anche filtrando, cosi modifica ed elimina colpiscono quello giusto
  const entries = ARTICLES_DB.map((a, idx) => ({ a: a, idx: idx })).filter(e => !q || (String(e.a.code || '') + ' ' + String(e.a.desc || '')).toLowerCase().includes(q));
  if (ARTICLES_DB.length === 0) return '<p class="text-xs text-slate-500 italic py-2">Nessun articolo salvato.</p>';
  if (entries.length === 0) return '<p class="text-xs text-slate-500 italic py-2">Nessun articolo trovato.</p>';
  return entries.map(({ a, idx }) => `
    <div class="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800 text-xs hover:border-indigo-500/50 transition-colors">
      <div>
        <span class="text-white font-bold">${esc(a.desc)}</span>
        <div class="text-[10px] text-slate-400 font-mono">Cod: ${esc(a.code || 'N/D')} | Prezzo base: € ${parseFloat(a.price).toFixed(2)}</div>
      </div>
      <div class="flex gap-1.5">
        <button onclick="editArticleFromDB(${idx})" class="text-slate-600 hover:text-indigo-400 p-1 cursor-pointer transition-colors" title="Modifica Articolo"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
        <button onclick="removeArticleFromDB(${idx})" class="text-slate-600 hover:text-red-400 p-1 cursor-pointer transition-colors" title="Elimina Articolo"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
      </div>
    </div>
  `).join('');
}

function editArticleFromDB(idx) {
  playSound('click');
  window.editingArticleIdx = idx;
  const a = ARTICLES_DB[idx];
  
  document.getElementById('artModalCode').value = a.code || '';
  document.getElementById('artModalDesc').value = a.desc || '';
  document.getElementById('artModalPrice').value = a.price || 0;
  
  const btn = document.getElementById('btnSaveArticle');
  if (btn) {
    btn.innerText = "Aggiorna Articolo";
    btn.classList.replace('bg-emerald-600', 'bg-indigo-600');
    btn.classList.replace('hover:bg-emerald-500', 'hover:bg-indigo-500');
  }
}

function addArticleFromSettings() {
  const code = document.getElementById('artModalCode').value.trim();
  const desc = document.getElementById('artModalDesc').value.trim();
  const price = parseFloat(document.getElementById('artModalPrice').value) || 0;
  
  if (!desc) return showInAppNotice("Inserisci almeno la descrizione dell'articolo.");
  
  if (window.editingArticleIdx !== null) {
    ARTICLES_DB[window.editingArticleIdx] = { code, desc, price };
    window.editingArticleIdx = null; 
    
    const btn = document.getElementById('btnSaveArticle');
    if (btn) {
      btn.innerText = "Salva Articolo nel Database";
      btn.classList.replace('bg-indigo-600', 'bg-emerald-600');
      btn.classList.replace('hover:bg-indigo-500', 'hover:bg-emerald-500');
    }
  } else {
    ARTICLES_DB.push({ code, desc, price });
  }
  
  ARTICLES_DB.sort((a,b) => a.desc.localeCompare(b.desc));
  localStorage.setItem('workflow_sga_articles_db', JSON.stringify(ARTICLES_DB));
  syncArticlesToCloud();
  openSubSettings('articles');
  playSound('success');
  
  document.getElementById('artModalCode').value = '';
  document.getElementById('artModalDesc').value = '';
  document.getElementById('artModalPrice').value = '';
}

function removeArticleFromDB(idx) {
  const a = ARTICLES_DB[idx];
  confirmDeletion(`Articolo base: ${a.desc}`, () => {
    ARTICLES_DB.splice(idx, 1);
    localStorage.setItem('workflow_sga_articles_db', JSON.stringify(ARTICLES_DB));
    syncArticlesToCloud();
    openSubSettings('articles');
  });
}

// ==========================================
// AGGIORNAMENTO AUTOMATICO (GitHub Pages)
// Confronta index.html, app.js e style.css con quelli in esecuzione.
// Non serve incrementare nessun numero di versione.
// ==========================================
(function setupAutoUpdate() {
  const CHECK_EVERY_MS = 120 * 1000;
  const FILES = ['./index.html', './app.js', './style.css'];
  let toastShown = false;
  let baseline = null;

  // Impronta leggera: usa ETag / Last-Modified / Content-Length restituiti da GitHub (HEAD: non scarica il file)
  async function fetchSignature() {
    try {
      const sigs = await Promise.all(FILES.map(async (f) => {
        const r = await fetch(f + '?_=' + Date.now(), { method: 'HEAD', cache: 'no-store' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const etag = (r.headers.get('etag') || '').replace(/^W\//, '');
        const lm = r.headers.get('last-modified') || '';
        const len = r.headers.get('content-length') || '';
        if (!etag && !lm) throw new Error('nessuna intestazione utile');
        return etag || (lm + '|' + len);
      }));
      return sigs.join('#');
    } catch (e) { return null; }
  }
  function isBusy() {
    if (isMasterMode) return false; // il proiettore si aggiorna subito
    const ids = ['detailModal','addCardModal','settingsModal','subSettingsModal','clientHistoryModal','labelPrintModal','clientNotifyModal','cloudModal','galleryModal','deleteConfirmModal'];
    return ids.some(id => { const el = document.getElementById(id); return el && !el.classList.contains('hidden'); });
  }
  async function check() {
    const sig = await fetchSignature();
    if (!sig) return;                       // se non riesco a leggerla, non faccio nulla
    if (baseline === null) { baseline = sig; return; }   // prima lettura = versione in uso
    if (sig === baseline) return;           // nessuna novità

    if (isBusy()) {
      if (!toastShown) { showToast('\ud83d\udd04 Nuova versione disponibile: si installer\u00e0 appena chiudi la finestra aperta.'); toastShown = true; }
      return;
    }
    // Limite: massimo un ricaricamento ogni 10 minuti, anche se qualcosa va storto
    const last = parseInt(localStorage.getItem('sga_last_reload') || '0', 10);
    if (Date.now() - last < 10 * 60 * 1000) return;
    localStorage.setItem('sga_last_reload', String(Date.now()));
    showToast('\ud83d\udd04 Aggiornamento in corso...');
    setTimeout(() => {
      const u = new URL(location.href);
      u.searchParams.set('_v', Date.now());
      location.replace(u.toString());
    }, 700);
  }

  setTimeout(check, 5000);   // fotografa la versione in uso poco dopo l'avvio
  setInterval(check, CHECK_EVERY_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
  window.addEventListener('online', check);
})();


// ==========================================
// Il browser a volte compila da solo la barra di ricerca (es. con l'email salvata del login)
// e nasconde le commesse. Se il testo non l'ha scritto l'utente, lo tolgo e azzero il filtro.
// ==========================================
(function guardSearchAutofill() {
  let userTyped = false;
  const mark = () => { userTyped = true; };
  function init() {
    const inp = document.getElementById('globalSearchInput');
    if (!inp) return;
    inp.addEventListener('keydown', mark);
    inp.addEventListener('paste', mark);
    const wipe = () => {
      if (userTyped) return;
      if (document.activeElement === inp) return;
      if (inp.value || globalSearchQuery) {
        inp.value = '';
        handleGlobalSearch('');
      }
    };
    [100, 600, 1500, 3000, 6000, 10000, 15000].forEach(ms => setTimeout(wipe, ms));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
