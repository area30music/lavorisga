// ==========================================
// CONFIGURAZIONE FIREBASE HARDCODED
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAVbSA7g_08qp3C4KVXPqaPGf1YCqsT7Ag",
  authDomain: "workflow-sga.firebaseapp.com",
  projectId: "workflow-sga",
  storageBucket: "workflow-sga.firebasestorage.app"
};

const IMGBB_API_KEY = "4452dd184d4f0efb701cba820e8c8f81";

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

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.firestore();
const auth = firebase.auth();

let isMasterMode = false;
let autoScrollId = null;
let autoScrollDir = 1;
let autoScrollPause = 0;
let lastScrollTime = 0;
let isAutoScrollPaused = false;
let masterScrollSpeed = 0.08;
window.editingClientId = null;
window.editingMachineIndex = null;
window.tempLabelArticles = [];
let arcadeTimer = null;
let sirenInterval = null;
let activeLabelCardId = null;
let currentSettingsView = 'main';

const DEFAULT_COLUMNS_CONFIG = [
  { id: "prev-da-fare", label: "Prev. da fare", color: "bg-orange-600/20 border-orange-500/50 text-orange-400", border: "border-l-4 border-l-orange-500", hexDefault: "#c2410c" },
  { id: "prev-inviato", label: "Prev. inviato", color: "bg-amber-600/20 border-amber-500/50 text-amber-400", border: "border-l-4 border-l-amber-500", hexDefault: "#d97706" },
  { id: "da-ordinare", label: "Da ordinare", color: "bg-rose-600/20 border-rose-500/50 text-rose-400", border: "border-l-4 border-l-rose-500", hexDefault: "#e11d48" },
  { id: "ordinato", label: "Ordinato", color: "bg-pink-600/20 border-pink-500/50 text-pink-400", border: "border-l-4 border-l-pink-500", hexDefault: "#db2777" },
  { id: "da-lavorare", label: "In magazzino da lavorare", color: "bg-violet-600/20 border-violet-500/50 text-violet-400", border: "border-l-4 border-l-violet-500", hexDefault: "#7c3aed" },
  { id: "in-lavorazione", label: "In lavorazione", color: "bg-cyan-600/20 border-cyan-500/50 text-cyan-400", border: "border-l-4 border-l-cyan-500", hexDefault: "#0891b2" },
  { id: "lavorato-da-bollettare", label: "Lavorato da bollettare", color: "bg-emerald-600/20 border-emerald-500/50 text-emerald-400", border: "border-l-4 border-l-emerald-500", hexDefault: "#059669" },
  { id: "bollettato-da-consegnare", label: "Bollettato da consegnare", color: "bg-teal-600/20 border-teal-500/50 text-teal-400", border: "border-l-4 border-l-teal-500", hexDefault: "#0d9488" },
  { id: "fatturato", label: "Fatturato", color: "bg-blue-600/20 border-blue-500/50 text-blue-400", border: "border-l-4 border-l-blue-500", hexDefault: "#2563eb" }
];

const DEFAULT_MSG_TEMPLATE = `Buongiorno {SALUTO},\n\nquesto è il sistema di automazione di SGA Studio Grafico Associato.\n\nVolevamo comunicarle che l'ordine da lei effettuato ("{TITOLO}"){ARTICOLI}\n\nè pronto per il ritiro.\n\nCordiali saluti,\nSGA Studio Grafico Associato`;

let COLUMNS_CONFIG = JSON.parse(JSON.stringify(DEFAULT_COLUMNS_CONFIG));
let USER_ALARMS = []; 
let CLIENTS_DB = [];
let MACHINES_DB = ["Roland TrueVIS SG2-540", "Epson SureColor T7200", "Epson F1000 DTF", "Xerox PrimeLink C9200", "Happy Japan HCH Embroidery"];
let masterFontSizePx = 24; 
let appFontSizePx = 15;
let sharedCompanyLogo = "";
let sharedMsgTemplate = "";
let globalSearchQuery = "";
let globalFilterJobType = "";
let activeNotifyCard = null;

const COLOR_OPTIONS = [
  { label: "Arancione", value: "bg-orange-600/20 border-orange-500/50 text-orange-400", border: "border-l-4 border-l-orange-500" },
  { label: "Ambra", value: "bg-amber-600/20 border-amber-500/50 text-amber-400", border: "border-l-4 border-l-amber-500" },
  { label: "Giallo", value: "bg-yellow-600/20 border-yellow-500/50 text-yellow-300", border: "border-l-4 border-l-yellow-500" },
  { label: "Rosso / Rosa", value: "bg-rose-600/20 border-rose-500/50 text-rose-400", border: "border-l-4 border-l-rose-500" },
  { label: "Fucsia", value: "bg-fuchsia-600/20 border-fuchsia-500/50 text-fuchsia-400", border: "border-l-4 border-l-fuchsia-500" },
  { label: "Viola", value: "bg-violet-600/20 border-violet-500/50 text-violet-400", border: "border-l-4 border-l-violet-500" },
  { label: "Ciano / Azzurro", value: "bg-cyan-600/20 border-cyan-500/50 text-cyan-400", border: "border-l-4 border-l-cyan-500" },
  { label: "Verde Smeraldo", value: "bg-emerald-600/20 border-emerald-500/50 text-emerald-400", border: "border-l-4 border-l-emerald-500" },
  { label: "Verde Teal", value: "bg-teal-600/20 border-teal-500/50 text-teal-400", border: "border-l-4 border-l-teal-500" },
  { label: "Blu", value: "bg-blue-600/20 border-blue-500/50 text-blue-400", border: "border-l-4 border-l-blue-500" },
  { label: "Grigio Neutro", value: "bg-slate-800/60 border-slate-700 text-slate-300", border: "border-l-4 border-l-slate-500" }
];

auth.onAuthStateChanged((user) => {
  const loginScreen = document.getElementById('loginScreen');
  if (user) { loginScreen.classList.add('hidden'); init(); } 
  else { loginScreen.classList.remove('hidden'); lucide.createIcons(); }
});

function handleLogin(event) {
  event.preventDefault(); playSound('success');
  const email = document.getElementById('loginEmail').value.trim();
  const pwInput = document.getElementById('loginPassword').value.trim();
  const errorMsg = document.getElementById('loginError');
  
  auth.signInWithEmailAndPassword(email, pwInput).then(() => { errorMsg.classList.add('hidden'); document.getElementById('loginPassword').value = ''; })
    .catch((error) => { console.error(error); playSound('alert'); errorMsg.classList.remove('hidden'); document.getElementById('loginPassword').value = ''; });
}

function logoutApp() { if (confirm("Vuoi disconnetterti da SGA Workflow?")) auth.signOut(); }

function checkAutoArchive() {
  const now = Date.now(); const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; let localMigrated = false;
  state.cards.forEach(card => {
    if (card.stage === 'fatturato') {
      let fatturatoTime = card.createdAt; 
      if (card.history && card.history.length > 0) { const lastFatturato = [...card.history].reverse().find(h => h.stage === 'fatturato'); if (lastFatturato && lastFatturato.timestamp) fatturatoTime = lastFatturato.timestamp; }
      if ((now - new Date(fatturatoTime).getTime()) > SEVEN_DAYS) { card.stage = 'archiviato'; if (!card.history) card.history = []; card.history.push({ stage: 'archiviato', label: 'Archiviata automaticamente (7+ giorni in Fatturato)', timestamp: new Date().toISOString() }); localMigrated = true; syncCardToCloud(card); }
    }
  });
  if (localMigrated) saveLocal();
}

function init() {
  loadUserSettings(); loadState(); 
  let localMigrated = false;
  state.cards.forEach(c => { 
    if (c.stage === 'magazzino') { c.stage = 'da-lavorare'; localMigrated = true; }
    if (c.stage === 'lavorato') { c.stage = 'lavorato-da-bollettare'; localMigrated = true; } 
    if (c.stage === 'consegnato') { c.stage = 'bollettato-da-consegnare'; localMigrated = true; } 
  });
  state.cards.sort((a,b) => (a.order || 0) - (b.order || 0)); 
  if (localMigrated) { saveLocal(); state.cards.forEach(c => syncCardToCloud(c)); }
  
  checkAutoArchive(); setInterval(checkAutoArchive, 60 * 60 * 1000);
  renderBoard(); updateCloudStatus(true); listenToCloudUpdates(); lucide.createIcons(); 
}

function updateLiveClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeEl = document.getElementById('headerClockTime'); const dateEl = document.getElementById('headerClockDate');
  if (timeEl) timeEl.innerText = timeStr; if (dateEl) dateEl.innerText = dateStr; checkScheduledAlarms(now);
}
setInterval(updateLiveClock, 1000);

let lastTriggeredMinute = "";
function checkScheduledAlarms(now) {
  if (!USER_ALARMS || USER_ALARMS.length === 0) return;
  const currentDay = now.getDay(); const currentHours = String(now.getHours()).padStart(2, '0'); const currentMinutes = String(now.getMinutes()).padStart(2, '0'); const currentTimeStr = `${currentHours}:${currentMinutes}`;
  if (now.getSeconds() === 0 && lastTriggeredMinute !== currentTimeStr) { USER_ALARMS.forEach(alarm => { if (alarm.active && Array.isArray(alarm.days) && alarm.days.includes(currentDay) && alarm.time === currentTimeStr) { lastTriggeredMinute = currentTimeStr; triggerAlarmAlert(); } }); }
}

function triggerAlarmAlert() {
  const urgentCards = state.cards.filter(card => {
    if (card.stage === 'bollettato-da-consegnare' || card.stage === 'fatturato' || card.stage === 'archiviato') return false;
    if (!card.deliveryDate) return false;
    const delivery = new Date(card.deliveryDate); delivery.setHours(0,0,0,0); const today = new Date(); today.setHours(0,0,0,0);
    const diffDays = Math.ceil((delivery - today) / (1000 * 60 * 60 * 24)); return diffDays <= 7;
  });
  const cardsToDisplay = urgentCards.length > 0 ? urgentCards : state.cards.filter(card => card.stage !== 'bollettato-da-consegnare' && card.stage !== 'fatturato' && card.stage !== 'archiviato');
  if (cardsToDisplay.length > 0) showArcadeAlert(cardsToDisplay);
}

function showArcadeAlert(cards) {
  playSound('alert'); const listEl = document.getElementById('arcadeAlertList'); listEl.innerHTML = '';
  cards.forEach(card => {
    const stageObj = COLUMNS_CONFIG.find(c => c.id === card.stage); const stageName = stageObj ? stageObj.label : card.stage; let timeText = ''; let badgeColor = 'bg-orange-600 text-white';
    if (card.deliveryDate) { const delivery = new Date(card.deliveryDate); delivery.setHours(0,0,0,0); const today = new Date(); today.setHours(0,0,0,0); const diffDays = Math.ceil((delivery - today) / (1000 * 60 * 60 * 24)); if (diffDays < 0) { timeText = `SCADUTA da ${Math.abs(diffDays)} giorni!`; badgeColor = 'bg-red-600 text-white animate-pulse'; } else if (diffDays === 0) { timeText = 'Scade OGGI!'; badgeColor = 'bg-red-600 text-white animate-pulse'; } else if (diffDays <= 3) { timeText = `Scade tra ${diffDays} giorni (URGENTE)`; badgeColor = 'bg-amber-600 text-white'; } else { timeText = `Scade tra ${diffDays} giorni`; badgeColor = 'bg-yellow-600 text-slate-950 font-bold'; } } 
    else { timeText = 'In Lavorazione'; badgeColor = 'bg-indigo-600 text-white'; }
    const item = document.createElement('div'); item.className = "bg-black/70 border-2 border-red-500/60 p-4 rounded-xl flex justify-between items-center gap-4 shadow-lg"; item.innerHTML = `<div class="overflow-hidden space-y-1"><h4 class="font-bold text-lg text-white truncate">${card.title}</h4><p class="text-sm text-slate-300">Cliente: <span class="text-indigo-300">${card.client || 'N/D'}</span> | Stato: <span class="text-yellow-300">${stageName}</span></p></div><div class="shrink-0 text-right space-y-1"><span class="text-xs px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider ${badgeColor}">${timeText}</span></div>`; listEl.appendChild(item);
  });
  document.getElementById('arcadeAlertModal').classList.remove('hidden'); lucide.createIcons();
  const progressBar = document.getElementById('arcadeProgressBar'); if (progressBar) { progressBar.style.transition = 'none'; progressBar.style.width = '100%'; setTimeout(() => { progressBar.style.transition = 'width 60s linear'; progressBar.style.width = '0%'; }, 50); }
  if (arcadeTimer) clearTimeout(arcadeTimer); arcadeTimer = setTimeout(() => { closeArcadeAlert(); }, 60000); 
}
function closeArcadeAlert() { playSound('close'); if (sirenInterval) { clearInterval(sirenInterval); sirenInterval = null; } document.getElementById('arcadeAlertModal').classList.add('hidden'); if (arcadeTimer) { clearTimeout(arcadeTimer); arcadeTimer = null; } }

let audioCtx = null;
function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); }

function playSound(type) {
  try {
    initAudio(); if (!audioCtx) return; const now = audioCtx.currentTime;
    if (type === 'click') { const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(300, now + 0.05); gain.gain.setValueAtTime(0.15, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.05); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now + 0.05); } 
    else if (type === 'close') { const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(440, now); osc.frequency.exponentialRampToValueAtTime(220, now + 0.12); gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.12); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now + 0.12); } 
    else if (type === 'success') { const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = 'triangle'; osc.frequency.setValueAtTime(523.25, now); osc.frequency.setValueAtTime(659.25, now + 0.08); osc.frequency.setValueAtTime(783.99, now + 0.16); gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.3); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now + 0.3); } 
    else if (type === 'alert') { if (sirenInterval) clearInterval(sirenInterval); let startTime = Date.now(); sirenInterval = setInterval(() => { if (Date.now() - startTime > 2500) { clearInterval(sirenInterval); sirenInterval = null; return; } try { const sNow = audioCtx.currentTime; const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(350, sNow); osc.frequency.linearRampToValueAtTime(880, sNow + 0.35); osc.frequency.linearRampToValueAtTime(350, sNow + 0.7); gain.gain.setValueAtTime(0.25, sNow); gain.gain.linearRampToValueAtTime(0.01, sNow + 0.7); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(sNow); osc.stop(sNow + 0.7); } catch(e){} }, 700); } 
    else if (type === 'delete') { const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = 'square'; osc.frequency.setValueAtTime(250, now); osc.frequency.linearRampToValueAtTime(80, now + 0.2); gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.2); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now + 0.2); }
  } catch (e) { console.error(e); }
}

let state = { cards: [] };
let activeCardId = null;
let currentGalleryIndex = 0;
let tempFormFile = null;

function confirmDeletion(message, onConfirmCallback) {
  playSound('click'); document.getElementById('deleteConfirmText').innerText = message;
  const confirmBtn = document.getElementById('btnConfirmDelete'); confirmBtn.onclick = () => { playSound('delete'); onConfirmCallback(); closeModal('deleteConfirmModal'); };
  openModal('deleteConfirmModal'); lucide.createIcons();
}

function loadCompanyLogo() {
  const defaultIcon = document.getElementById('logoDefaultIcon'); const logoImg = document.getElementById('logoImageDisplay'); const logoContainer = document.getElementById('companyLogoContainer');
  let faviconLink = document.querySelector("link[rel~='icon']"); if (!faviconLink) { faviconLink = document.createElement('link'); faviconLink.rel = 'icon'; document.head.appendChild(faviconLink); }
  if (sharedCompanyLogo) {
    if (defaultIcon) defaultIcon.classList.add('hidden'); if (logoImg) { logoImg.src = sharedCompanyLogo; logoImg.classList.remove('hidden'); }
    if (logoContainer) { logoContainer.classList.remove('bg-indigo-600'); logoContainer.style.background = 'transparent'; }
    const img = new Image(); img.onload = function() { const canvas = document.createElement('canvas'); const size = 64; canvas.width = size; canvas.height = size; const ctx = canvas.getContext('2d'); const scale = Math.min(size / img.width, size / img.height); const x = (size / 2) - ((img.width * scale) / 2); const y = (size / 2) - ((img.height * scale) / 2); ctx.drawImage(img, x, y, img.width * scale, img.height * scale); faviconLink.href = canvas.toDataURL('image/png'); }; img.src = sharedCompanyLogo;
  } else {
    if (defaultIcon) defaultIcon.classList.remove('hidden'); if (logoImg) logoImg.classList.add('hidden');
    if (logoContainer) logoContainer.className = "relative group cursor-pointer bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-900/20 flex items-center justify-center overflow-hidden shrink-0";
    faviconLink.href = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🖨️</text></svg>";
  }
}

function uploadCompanyLogo(event) {
  const file = event.target.files[0]; if (!file) return; const reader = new FileReader();
  reader.onload = function(e) { sharedCompanyLogo = e.target.result; localStorage.setItem('workflow_sga_company_logo', sharedCompanyLogo); loadCompanyLogo(); playSound('success'); if (db) db.collection('workflow_sga_settings').doc('config').set({ companyLogo: sharedCompanyLogo }, { merge: true }).catch(e => console.error(e)); alert("Logo aziendale caricato con successo!"); };
  reader.readAsDataURL(file); event.target.value = '';
}

function removeCompanyLogo() { confirmDeletion(`Logo Aziendale`, () => { sharedCompanyLogo = ""; localStorage.removeItem('workflow_sga_company_logo'); loadCompanyLogo(); if (db) db.collection('workflow_sga_settings').doc('config').set({ companyLogo: "" }, { merge: true }).catch(e => console.error(e)); openSubSettings('logo'); }); }

function loadUserSettings() {
  const localLogo = localStorage.getItem('workflow_sga_company_logo'); if (localLogo) sharedCompanyLogo = localLogo;
  const localMsg = localStorage.getItem('workflow_sga_msg_template'); if (localMsg) sharedMsgTemplate = localMsg; else sharedMsgTemplate = DEFAULT_MSG_TEMPLATE;

  const savedCols = localStorage.getItem('workflow_sga_columns_config');
  if (savedCols) {
    try { 
      const parsedCols = JSON.parse(savedCols);
      const hasOldCols = parsedCols.some(c => c.id === 'accettato-mod' || c.id === 'lavorato' || c.id === 'consegnato' || c.id === 'magazzino' || c.label === 'Da lavorare');
      if (hasOldCols) { COLUMNS_CONFIG = JSON.parse(JSON.stringify(DEFAULT_COLUMNS_CONFIG)); localStorage.setItem('workflow_sga_columns_config', JSON.stringify(COLUMNS_CONFIG)); } 
      else { COLUMNS_CONFIG = parsedCols; }
    } catch(e) { COLUMNS_CONFIG = JSON.parse(JSON.stringify(DEFAULT_COLUMNS_CONFIG)); }
  } else { COLUMNS_CONFIG = JSON.parse(JSON.stringify(DEFAULT_COLUMNS_CONFIG)); }

  const savedAlarms = localStorage.getItem('workflow_sga_alarms');
  if (savedAlarms) { try { USER_ALARMS = JSON.parse(savedAlarms); USER_ALARMS = USER_ALARMS.map(a => { if (!Array.isArray(a.days)) a.days = a.day !== undefined ? [parseInt(a.day)] : [1,2,3,4,5]; return a; }); } catch(e){ USER_ALARMS = []; } }

  const savedClients = localStorage.getItem('workflow_sga_clients_db');
  if (savedClients) { try { CLIENTS_DB = JSON.parse(savedClients); let migrated = false; CLIENTS_DB.forEach((c, idx) => { if(!c.id) { c.id = 'crm_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6) + idx; migrated = true; } }); if(migrated) localStorage.setItem('workflow_sga_clients_db', JSON.stringify(CLIENTS_DB)); } catch(e) { CLIENTS_DB = []; } } 
  else { const oldClients = localStorage.getItem('workflow_sga_clients'); if (oldClients) { try { const arr = JSON.parse(oldClients); CLIENTS_DB = arr.map((c,idx) => ({ id: 'crm_old'+idx, name: c, referent: '', email: '', whatsapp: '' })); } catch(e){ CLIENTS_DB = []; } } }

  const savedMachines = localStorage.getItem('workflow_sga_machines_db'); if (savedMachines) { try { MACHINES_DB = JSON.parse(savedMachines); } catch(e){} }
  
  const savedMasterFont = localStorage.getItem('workflow_sga_master_fontsize_px'); if (savedMasterFont) masterFontSizePx = parseInt(savedMasterFont); applyMasterFontSize(masterFontSizePx);
  const savedAppFont = localStorage.getItem('workflow_sga_app_fontsize_px'); if (savedAppFont) appFontSizePx = parseInt(savedAppFont); applyAppFontSize(appFontSizePx);

  loadCompanyLogo(); populateMachinesDropdowns(); populateGlobalFilterDropdown(); populateClientSelectors();
}

function applyMasterFontSize(pxVal) { masterFontSizePx = pxVal; document.documentElement.style.setProperty('--master-font-size', pxVal + 'px'); const rangeEl = document.getElementById('masterFontRange'); const valEl = document.getElementById('masterFontSizeVal'); if (rangeEl) rangeEl.value = pxVal; if (valEl) valEl.innerText = pxVal + 'px'; }
function previewMasterFontSize(pxVal) { applyMasterFontSize(parseInt(pxVal)); }
function resetMasterFont() { playSound('click'); applyMasterFontSize(24); }

function applyAppFontSize(pxVal) { appFontSizePx = pxVal; document.documentElement.style.setProperty('--app-font-size', pxVal + 'px'); const rangeEl = document.getElementById('appFontRange'); const valEl = document.getElementById('appFontSizeVal'); if (rangeEl) rangeEl.value = pxVal; if (valEl) valEl.innerText = pxVal + 'px'; }
function previewAppFontSize(pxVal) { applyAppFontSize(parseInt(pxVal)); }
function resetAppFont() { playSound('click'); applyAppFontSize(15); }
function updateMasterSpeed(val) { masterScrollSpeed = parseFloat(val); }

function syncClientsToCloud() { if (db) db.collection('workflow_sga_settings').doc('clients').set({ db: CLIENTS_DB }).catch(err => console.error(err)); }

function registerClientAdvanced(name, referent, email, whatsapp) {
  if (!name || !name.trim()) return;
  const cleanName = name.trim(); const cleanRef = referent ? referent.trim() : '';
  const existing = CLIENTS_DB.find(c => c.name.toLowerCase() === cleanName.toLowerCase() && (c.referent || '').toLowerCase() === cleanRef.toLowerCase());
  if (existing) { if (email && !existing.email) existing.email = email.trim(); if (whatsapp && !existing.whatsapp) existing.whatsapp = whatsapp.trim(); } 
  else { const newId = 'crm_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6); CLIENTS_DB.push({ id: newId, name: cleanName, referent: cleanRef, email: email ? email.trim() : '', whatsapp: whatsapp ? whatsapp.trim() : '' }); }
  CLIENTS_DB.sort((a,b) => a.name.localeCompare(b.name)); localStorage.setItem('workflow_sga_clients_db', JSON.stringify(CLIENTS_DB)); populateClientSelectors(); syncClientsToCloud();
}

function populateClientSelectors() {
  const editSelector = document.getElementById('editClientSelector'); const formSelector = document.getElementById('formClientSelector');
  let optionsHtml = `<option value="">-- Seleziona dal CRM --</option>`; CLIENTS_DB.forEach(c => { let label = c.name; if (c.referent) label += ` (${c.referent})`; optionsHtml += `<option value="${c.id}">${label}</option>`; });
  if (editSelector) { editSelector.innerHTML = optionsHtml; editSelector.value = ''; } if (formSelector) { formSelector.innerHTML = optionsHtml; formSelector.value = ''; }
}

function autofillClientFromSelect(clientId, prefix) {
  if (!clientId) return; playSound('click'); const c = CLIENTS_DB.find(client => client.id === clientId); if (!c) return;
  const titleEl = document.getElementById(prefix + 'Title'); const refEl = document.getElementById(prefix + 'Referent'); const emailEl = document.getElementById(prefix + 'Email'); const waEl = document.getElementById(prefix + 'Whatsapp');
  if (titleEl) titleEl.value = c.name || ''; if (refEl) refEl.value = c.referent || ''; if (emailEl) emailEl.value = c.email || ''; if (waEl) waEl.value = c.whatsapp || '';
  const sugContainer = document.getElementById(prefix + 'ClientSuggestions'); if (sugContainer) sugContainer.classList.add('hidden');
}

function handleClientInput(query, containerId, refInputId, emailInputId, waInputId) {
  const container = document.getElementById(containerId); if (!container) return; const q = query.toLowerCase().trim();
  if (!q) { container.classList.add('hidden'); container.innerHTML = ''; return; }
  const matches = CLIENTS_DB.filter(c => c.name.toLowerCase().includes(q) || (c.referent && c.referent.toLowerCase().includes(q)));
  if (matches.length === 0) { container.classList.add('hidden'); container.innerHTML = ''; return; }
  container.innerHTML = matches.map(m => `<div onclick="selectClientSuggestion('${m.name.replace(/'/g, "\\'")}', '${m.referent.replace(/'/g, "\\'")}', '${m.email}', '${m.whatsapp}', '${containerId}', '${refInputId}', '${emailInputId}', '${waInputId}')" class="px-3 py-2 hover:bg-indigo-600/30 text-slate-200 cursor-pointer text-xs border-b border-slate-800/60 last:border-0 truncate"><span class="font-bold text-white">${m.name}</span> ${m.referent ? `<span class="text-indigo-300">(${m.referent})</span>` : ''}</div>`).join('');
  container.classList.remove('hidden');
}

function selectClientSuggestion(name, referent, email, whatsapp, containerId, refInputId, emailInputId, waInputId) {
  const clientInputId = containerId === 'formClientSuggestions' ? 'formTitle' : 'editTitle'; document.getElementById(clientInputId).value = name;
  if (refInputId && document.getElementById(refInputId)) document.getElementById(refInputId).value = referent || ''; if (emailInputId && document.getElementById(emailInputId)) document.getElementById(emailInputId).value = email || ''; if (waInputId && document.getElementById(waInputId)) document.getElementById(waInputId).value = whatsapp || '';
  document.getElementById(containerId).classList.add('hidden');
}

function populateMachinesDropdowns() {
  const selects = [document.getElementById('formMachine'), document.getElementById('editMachine')];
  selects.forEach(select => { if (!select) return; const currentVal = select.value; select.innerHTML = `<option value="">Nessuno / Manuale</option>` + MACHINES_DB.map(m => `<option value="${m}">${m}</option>`).join(''); select.value = currentVal; });
}

function populateGlobalFilterDropdown() {
  const select = document.getElementById('globalFilterType'); if (!select) return;
  let typesSet = new Set(); state.cards.forEach(c => { if (c.jobType) typesSet.add(c.jobType); });
  select.innerHTML = `<option value="">Tutte le lavorazioni</option>` + Array.from(typesSet).map(t => `<option value="${t}" ${globalFilterJobType === t ? 'selected' : ''}>${t}</option>`).join('');
}

function handleGlobalSearch(val) { globalSearchQuery = val.trim().toLowerCase(); const clearBtn = document.getElementById('btnClearSearch'); if (clearBtn) { if (globalSearchQuery) clearBtn.classList.remove('hidden'); else clearBtn.classList.add('hidden'); } renderBoard(); }
function handleGlobalFilterChange() { globalFilterJobType = document.getElementById('globalFilterType').value; renderBoard(); }
function clearGlobalSearch() { document.getElementById('globalSearchInput').value = ''; globalSearchQuery = ''; document.getElementById('btnClearSearch').classList.add('hidden'); renderBoard(); }

function openSettingsModal() { currentSettingsView = 'main'; renderSettingsContent(); openModal('settingsModal'); }

function renderSettingsContent() {
  const titleEl = document.getElementById('settingsModalTitle');
  const backBtn = document.getElementById('settingsBackBtn');
  const bodyEl = document.getElementById('settingsModalBody');

  if (currentSettingsView === 'main') {
    if (backBtn) backBtn.classList.add('hidden');
    titleEl.innerHTML = `<i data-lucide="settings" class="w-4 h-4 text-indigo-400"></i> Impostazioni di Sistema & Archivio`;
    bodyEl.innerHTML = `
      <div onclick="openSubSettings('crm')" class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-colors flex items-center justify-between group">
        <div class="flex items-center gap-3"><div class="p-2 bg-indigo-950 text-indigo-400 rounded-lg"><i data-lucide="users" class="w-5 h-5"></i></div><div><h4 class="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">Gestione Clienti (CRM)</h4><p class="text-[10px] text-slate-400">Anagrafica aziende, referenti, email e WhatsApp</p></div></div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600 group-hover:text-white transition-colors"></i>
      </div>
      <div onclick="openSubSettings('archive')" class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-colors flex items-center justify-between group">
        <div class="flex items-center gap-3"><div class="p-2 bg-slate-900 text-slate-300 rounded-lg"><i data-lucide="archive" class="w-5 h-5"></i></div><div><h4 class="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">Archivio Commesse & Fatturato</h4><p class="text-[10px] text-slate-400">Storico commesse archiviate automaticamente</p></div></div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600 group-hover:text-white transition-colors"></i>
      </div>
      <div onclick="openSubSettings('messages')" class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-pink-500/50 cursor-pointer transition-colors flex items-center justify-between group">
        <div class="flex items-center gap-3"><div class="p-2 bg-pink-950 text-pink-400 rounded-lg"><i data-lucide="message-square" class="w-5 h-5"></i></div><div><h4 class="text-xs font-bold text-white group-hover:text-pink-400 transition-colors">Testo Notifiche WhatsApp / Email</h4><p class="text-[10px] text-slate-400">Personalizza il messaggio di pronto ritiro</p></div></div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600 group-hover:text-white transition-colors"></i>
      </div>
      <div onclick="openSubSettings('machines')" class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-colors flex items-center justify-between group">
        <div class="flex items-center gap-3"><div class="p-2 bg-cyan-950 text-cyan-400 rounded-lg"><i data-lucide="cpu" class="w-5 h-5"></i></div><div><h4 class="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">Gestione Macchinari</h4><p class="text-[10px] text-slate-400">Aggiungi o modifica stampanti e plotter</p></div></div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600 group-hover:text-white transition-colors"></i>
      </div>
      <div onclick="openSubSettings('logo')" class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-colors flex items-center justify-between group">
        <div class="flex items-center gap-3"><div class="p-2 bg-indigo-950 text-indigo-400 rounded-lg"><i data-lucide="image" class="w-5 h-5"></i></div><div><h4 class="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">Logo Aziendale</h4><p class="text-[10px] text-slate-400">Carica il logo in PNG trasparente</p></div></div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600 group-hover:text-white transition-colors"></i>
      </div>
      <div onclick="openSubSettings('alarms')" class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-colors flex items-center justify-between group">
        <div class="flex items-center gap-3"><div class="p-2 bg-indigo-950 text-indigo-400 rounded-lg"><i data-lucide="alarm-clock" class="w-5 h-5"></i></div><div><h4 class="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">Sveglie Alert Scadenze</h4><p class="text-[10px] text-slate-400">Configura orari per avvisi scadenze urgenti</p></div></div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600 group-hover:text-white transition-colors"></i>
      </div>
      <div onclick="openSubSettings('colors')" class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-colors flex items-center justify-between group">
        <div class="flex items-center gap-3"><div class="p-2 bg-indigo-950 text-indigo-400 rounded-lg"><i data-lucide="palette" class="w-5 h-5"></i></div><div><h4 class="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">Colori Fasi / Colonne</h4><p class="text-[10px] text-slate-400">Personalizza la colorazione del workflow</p></div></div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600 group-hover:text-white transition-colors"></i>
      </div>
      <div onclick="openSubSettings('zoom')" class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-colors flex items-center justify-between group">
        <div class="flex items-center gap-3"><div class="p-2 bg-indigo-950 text-indigo-400 rounded-lg"><i data-lucide="type" class="w-5 h-5"></i></div><div><h4 class="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">Visualizzazione & Zoom Caratteri</h4><p class="text-[10px] text-slate-400">Regola la dimensione del testo della board</p></div></div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600 group-hover:text-white transition-colors"></i>
      </div>

      <div class="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
        <button onclick="exportBackup()" class="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer"><i data-lucide="download" class="w-3.5 h-3.5 text-indigo-400"></i> Esporta Backup</button>
        <label class="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
          <i data-lucide="upload" class="w-3.5 h-3.5 text-emerald-400"></i> Importa Backup <input type="file" accept=".json" onchange="importBackup(event)" class="hidden">
        </label>
      </div>
      <div class="pt-2"><button onclick="resetDefaultSettings()" class="w-full text-center text-[11px] text-red-400 hover:text-red-300 py-1">Ripristina tutte le impostazioni predefinite</button></div>
    `;
  } else {
    if (backBtn) backBtn.classList.remove('hidden');
    if (currentSettingsView === 'crm') {
      titleEl.innerHTML = `<i data-lucide="users" class="w-5 h-5 text-indigo-400"></i> Gestione Clienti (CRM)`;
      bodyEl.innerHTML = `<div class="space-y-4"><p class="text-xs text-slate-400">Gestisci l'anagrafica clienti con azienda, referente, email e WhatsApp:</p><div class="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2.5"><h5 class="text-xs font-bold text-indigo-400 uppercase">Aggiungi / Modifica Cliente</h5><div class="grid grid-cols-2 gap-2"><input type="text" id="crmModalName" placeholder="Azienda / Cliente *" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"><input type="text" id="crmModalRef" placeholder="Referente" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"></div><div class="grid grid-cols-2 gap-2"><input type="email" id="crmModalEmail" placeholder="Email" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"><input type="text" id="crmModalWa" placeholder="WhatsApp" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"></div><button type="button" id="btnSaveCrmClient" onclick="addClientFromSettings()" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded font-semibold w-full cursor-pointer transition-colors">Salva Cliente in Archivio</button></div><div id="settingsClientsList" class="space-y-1.5 max-h-56 overflow-y-auto pr-1">${renderCrmSettingsList()}</div></div>`;
    } else if (currentSettingsView === 'archive') {
      titleEl.innerHTML = `<i data-lucide="archive" class="w-5 h-5 text-slate-400"></i> Archivio Commesse`;
      bodyEl.innerHTML = `<div class="space-y-4"><div class="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center gap-2 flex-wrap"><div><p class="text-xs font-bold text-slate-200 uppercase tracking-wider">Gestione Dati & Report</p><p class="text-[10px] text-slate-400 mt-0.5">Memoria Locale Usata: <span id="storageUsageIndicator" class="font-mono font-bold text-emerald-400">Calcolo...</span></p></div><button onclick="playSound('click'); printArchiveReport();" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-transform"><i data-lucide="printer" class="w-4 h-4"></i> Stampa Report Fatturato</button></div><div class="relative w-full"><i data-lucide="search" class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400"></i><input type="text" id="archiveSearchInput" oninput="filterArchive(this.value)" placeholder="Cerca nell'archivio..." class="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-500"></div><div id="archiveSettingsList" class="space-y-2 max-h-[350px] overflow-y-auto pr-1">${renderArchiveList()}</div></div>`;
      setTimeout(() => { updateStorageIndicator(); }, 50);
    } else if (currentSettingsView === 'messages') {
      titleEl.innerHTML = `<i data-lucide="message-square" class="w-5 h-5 text-pink-400"></i> Testo Notifiche (WhatsApp / Email)`;
      bodyEl.innerHTML = `<div class="space-y-4"><p class="text-xs text-slate-400">Personalizza il testo inviato ai clienti per il ritiro merce. La modifica viene salvata <strong class="text-pink-400">su Cloud</strong> ed è attiva su tutti i dispositivi. Usa le variabili magiche:</p><div class="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px] text-indigo-300"><div><strong class="text-pink-400 text-xs">{SALUTO}</strong> -> "Nome Referente della ditta Azienda"</div><div><strong class="text-pink-400 text-xs">{TITOLO}</strong> -> Titolo della commessa</div><div><strong class="text-pink-400 text-xs">{ARTICOLI}</strong> -> Elenco articoli in lista</div></div><textarea id="msgTemplateText" rows="8" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-pink-500 font-sans leading-relaxed">${sharedMsgTemplate}</textarea><button onclick="saveSubSettingsAction('messages')" class="bg-pink-600 hover:bg-pink-500 text-white text-xs px-4 py-2 rounded font-semibold w-full cursor-pointer shadow">Salva Modifiche Testo</button></div>`;
    } else if (currentSettingsView === 'machines') {
      titleEl.innerHTML = `<i data-lucide="cpu" class="w-5 h-5 text-cyan-400"></i> Gestione Macchinari`;
      bodyEl.innerHTML = `<div class="space-y-3"><p class="text-xs text-slate-400">Aggiungi, modifica o rimuovi i macchinari utilizzati in laboratorio:</p><div class="flex gap-2"><input type="text" id="newMachineInput" placeholder="Nome macchinario..." class="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"><button type="button" id="btnSaveMachine" onclick="saveMachine()" class="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-3 py-2 rounded font-semibold cursor-pointer">Aggiungi</button></div><div id="settingsMachinesList" class="space-y-1.5 max-h-56 overflow-y-auto pr-1">${renderMachinesSettingsList()}</div></div>`;
    } else if (currentSettingsView === 'logo') {
      titleEl.innerHTML = `<i data-lucide="image" class="w-5 h-5 text-indigo-400"></i> Logo Aziendale`;
      bodyEl.innerHTML = `<div class="space-y-3"><p class="text-xs text-slate-400">Carica il logo in PNG trasparente: verrà salvato nel Cloud e visibile su tutti i dispositivi.</p><div class="flex items-center gap-4"><div class="w-32 h-14 bg-slate-950 border border-slate-700 rounded flex items-center justify-center overflow-hidden">${sharedCompanyLogo ? `<img src="${sharedCompanyLogo}" class="max-h-full max-w-full object-contain">` : '<span class="text-[10px] text-slate-500">Nessun Logo</span>'}</div><div class="flex gap-2"><label class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded font-semibold cursor-pointer transition-colors flex items-center gap-1.5"><i data-lucide="upload" class="w-3.5 h-3.5"></i> Carica Logo PNG<input type="file" accept="image/png, image/jpeg" class="hidden" onchange="uploadCompanyLogo(event); openSubSettings('logo');"></label><button onclick="removeCompanyLogo();" class="bg-slate-800 hover:bg-slate-700 text-red-400 text-xs px-3 py-2 rounded font-semibold transition-colors cursor-pointer">Rimuovi</button></div></div></div>`;
    } else if (currentSettingsView === 'alarms') {
      titleEl.innerHTML = `<i data-lucide="alarm-clock" class="w-5 h-5 text-indigo-400"></i> Gestione Sveglie Alert Scadenze`;
      bodyEl.innerHTML = `<div class="space-y-3"><div class="flex justify-between items-center"><p class="text-xs text-slate-400">Crea sveglie per visualizzare l'avviso delle scadenze.</p><button onclick="playSound('click'); addAlarmRule(); openSubSettings('alarms');" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded font-semibold flex items-center gap-1 cursor-pointer"><i data-lucide="plus" class="w-3.5 h-3.5"></i> Aggiungi Sveglia</button></div><div id="alarmsListContainer" class="space-y-3 max-h-60 overflow-y-auto pr-1"></div><button onclick="saveSubSettingsAction('alarms')" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded font-semibold w-full cursor-pointer shadow mt-2">Salva Sveglie</button></div>`;
      setTimeout(renderAlarmsList, 50);
    } else if (currentSettingsView === 'colors') {
      titleEl.innerHTML = `<i data-lucide="palette" class="w-5 h-5 text-indigo-400"></i> Colori delle Fasi / Colonne`;
      bodyEl.innerHTML = `<div class="space-y-3"><p class="text-xs text-slate-400 mb-2">Personalizza la colorazione di ciascuna colonna del workflow:</p><div id="columnsColorSettingsList" class="space-y-2 max-h-52 overflow-y-auto pr-2"></div><button onclick="saveSubSettingsAction('colors')" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded font-semibold w-full cursor-pointer shadow mt-2">Salva Colori</button></div>`;
      setTimeout(() => {
        const container = document.getElementById('columnsColorSettingsList');
        if (container) {
          container.innerHTML = '';
          COLUMNS_CONFIG.forEach(col => {
            const row = document.createElement('div');
            row.className = "flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800 gap-3";
            let optionsHtml = COLOR_OPTIONS.map(opt => `<option value="${opt.label}" ${opt.value === col.color ? 'selected' : ''}>${opt.label}</option>`).join('');
            row.innerHTML = `<div class="font-semibold text-xs text-slate-200 truncate w-1/3">${col.label}</div><div class="w-2/3"><select id="colColorSelect-${col.id}" class="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500">${optionsHtml}</select></div>`;
            container.appendChild(row);
          });
        }
      }, 50);
    } else if (currentSettingsView === 'zoom') {
      titleEl.innerHTML = `<i data-lucide="type" class="w-5 h-5 text-indigo-400"></i> Visualizzazione & Zoom Caratteri`;
      bodyEl.innerHTML = `<div class="space-y-5"><div class="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2"><div class="flex justify-between items-center"><h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider">Zoom Programmazione</h4><span id="appFontSizeVal" class="font-mono text-indigo-400 font-bold text-xs bg-slate-900 px-2.5 py-1 rounded border border-slate-800">${appFontSizePx}px</span></div><input type="range" id="appFontRange" min="12" max="24" value="${appFontSizePx}" step="1" oninput="previewAppFontSize(this.value)" class="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-900 rounded-lg"></div><div class="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2"><div class="flex justify-between items-center"><h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Zoom Master View</h4><span id="masterFontSizeVal" class="font-mono text-emerald-400 font-bold text-xs bg-slate-900 px-2.5 py-1 rounded border border-slate-800">${masterFontSizePx}px</span></div><input type="range" id="masterFontRange" min="16" max="50" value="${masterFontSizePx}" step="1" oninput="previewMasterFontSize(this.value)" class="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-900 rounded-lg"></div><button onclick="saveSubSettingsAction('zoom')" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded font-semibold w-full cursor-pointer shadow">Salva Zoom</button></div>`;
    }
  }
  lucide.createIcons();
}

function openSubSettings(type) { playSound('click'); currentSettingsView = type; window.editingMachineIndex = null; renderSettingsContent(); }
function backToMainSettings() { playSound('click'); currentSettingsView = 'main'; window.editingMachineIndex = null; renderSettingsContent(); }

function saveSubSettingsAction(type) {
  if (type === 'colors') {
    COLUMNS_CONFIG.forEach(col => { const select = document.getElementById(`colColorSelect-${col.id}`); if (select) { const matchedOpt = COLOR_OPTIONS.find(o => o.label === select.value); if (matchedOpt) { col.color = matchedOpt.value; col.border = matchedOpt.border; } } });
    localStorage.setItem('workflow_sga_columns_config', JSON.stringify(COLUMNS_CONFIG)); renderBoard();
  } else if (type === 'alarms') {
    localStorage.setItem('workflow_sga_alarms', JSON.stringify(USER_ALARMS));
  } else if (type === 'zoom') {
    localStorage.setItem('workflow_sga_master_fontsize_px', masterFontSizePx); localStorage.setItem('workflow_sga_app_fontsize_px', appFontSizePx);
  } else if (type === 'messages') {
    const newTemplate = document.getElementById('msgTemplateText').value; sharedMsgTemplate = newTemplate; localStorage.setItem('workflow_sga_msg_template', sharedMsgTemplate);
    if (db) db.collection('workflow_sga_settings').doc('config').set({ msgTemplate: sharedMsgTemplate }, { merge: true }).catch(e => console.error(e));
  }
  playSound('success'); alert("Impostazioni salvate con successo!"); backToMainSettings();
}

function renderCrmSettingsList() { return CLIENTS_DB.length === 0 ? '<p class="text-xs text-slate-500 italic py-2">Nessun cliente in archivio.</p>' : CLIENTS_DB.map(c => `<div onclick="loadClientForEdit('${c.id}')" class="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800 text-xs hover:border-indigo-500/50 cursor-pointer transition-colors group"><div><span class="text-white font-bold">${c.name}</span> ${c.referent ? `<span class="text-indigo-300">(${c.referent})</span>` : ''}<div class="text-[10px] text-slate-400">${c.email ? 'Email: ' + c.email : ''} ${c.whatsapp ? '| WA: ' + c.whatsapp : ''}</div></div><button onclick="event.stopPropagation(); removeClient('${c.id}')" class="text-slate-600 group-hover:text-red-400 hover:!text-red-300 p-1 cursor-pointer transition-colors"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button></div>`).join(''); }

function loadClientForEdit(clientId) {
  playSound('click'); window.editingClientId = clientId; const c = CLIENTS_DB.find(client => client.id === clientId); if(!c) return;
  document.getElementById('crmModalName').value = c.name || ''; document.getElementById('crmModalRef').value = c.referent || ''; document.getElementById('crmModalEmail').value = c.email || ''; document.getElementById('crmModalWa').value = c.whatsapp || '';
  const btn = document.getElementById('btnSaveCrmClient'); btn.innerText = "Aggiorna Cliente"; btn.classList.replace('bg-indigo-600', 'bg-emerald-600'); btn.classList.replace('hover:bg-indigo-500', 'hover:bg-emerald-500');
}

function addClientFromSettings() {
  const name = document.getElementById('crmModalName').value.trim(); const ref = document.getElementById('crmModalRef').value.trim(); const email = document.getElementById('crmModalEmail').value.trim(); const wa = document.getElementById('crmModalWa').value.trim();
  if (!name) return alert("Inserisci almeno il nome del cliente/azienda.");
  const isDuplicate = CLIENTS_DB.find(c => c.name.toLowerCase() === name.toLowerCase() && (c.referent || '').toLowerCase() === ref.toLowerCase() && c.id !== window.editingClientId);
  if (isDuplicate) { playSound('alert'); return alert(`ATTENZIONE: Esiste già il referente "${ref || 'Nessuno'}" per l'azienda "${name}".\nModifica la voce esistente per non creare duplicati.`); }
  if (window.editingClientId) { const idx = CLIENTS_DB.findIndex(c => c.id === window.editingClientId); if(idx >= 0) CLIENTS_DB[idx] = { id: window.editingClientId, name, referent: ref, email, whatsapp: wa }; CLIENTS_DB.sort((a,b) => a.name.localeCompare(b.name)); localStorage.setItem('workflow_sga_clients_db', JSON.stringify(CLIENTS_DB)); window.editingClientId = null; populateClientSelectors(); syncClientsToCloud(); } 
  else { registerClientAdvanced(name, ref, email, wa); }
  renderSettingsContent(); playSound('success');
}

function removeClient(clientId) { const c = CLIENTS_DB.find(client => client.id === clientId); if(!c) return; confirmDeletion(`Cliente dal CRM: ${c.name}`, () => { CLIENTS_DB = CLIENTS_DB.filter(client => client.id !== clientId); localStorage.setItem('workflow_sga_clients_db', JSON.stringify(CLIENTS_DB)); populateClientSelectors(); syncClientsToCloud(); renderSettingsContent(); }); }

function renderMachinesSettingsList() {
  return MACHINES_DB.map((m, idx) => `
    <div class="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800 text-xs">
      <span class="text-slate-200 font-medium">${m}</span>
      <div class="flex items-center gap-1.5">
        <button onclick="loadMachineForEdit(${idx})" class="p-1 text-slate-400 hover:text-white cursor-pointer" title="Modifica"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
        <button onclick="removeMachine(${idx})" class="p-1 text-red-400 hover:text-red-300 cursor-pointer" title="Elimina"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
      </div>
    </div>
  `).join('');
}

function loadMachineForEdit(idx) {
  playSound('click'); window.editingMachineIndex = idx;
  const input = document.getElementById('newMachineInput');
  const btn = document.getElementById('btnSaveMachine');
  if (input && btn) {
    input.value = MACHINES_DB[idx];
    btn.innerText = "Aggiorna";
    btn.classList.replace('bg-cyan-600', 'bg-emerald-600');
    btn.classList.replace('hover:bg-cyan-500', 'hover:bg-emerald-500');
    input.focus();
  }
}

function saveMachine() {
  const input = document.getElementById('newMachineInput');
  if (!input || !input.value.trim()) return;
  const mName = input.value.trim();
  if (window.editingMachineIndex !== null && window.editingMachineIndex >= 0) {
    MACHINES_DB[window.editingMachineIndex] = mName;
    window.editingMachineIndex = null;
  } else {
    if (!MACHINES_DB.includes(mName)) MACHINES_DB.push(mName);
  }
  localStorage.setItem('workflow_sga_machines_db', JSON.stringify(MACHINES_DB));
  populateMachinesDropdowns();
  renderSettingsContent();
  playSound('success');
  input.value = '';
}

function removeMachine(idx) { 
  const m = MACHINES_DB[idx]; 
  confirmDeletion(`Macchinario: ${m}`, () => { 
    MACHINES_DB.splice(idx, 1); 
    localStorage.setItem('workflow_sga_machines_db', JSON.stringify(MACHINES_DB)); 
    populateMachinesDropdowns(); 
    renderSettingsContent(); 
  }); 
}

function resetDefaultSettings() { if (confirm("Vuoi ripristinare tutti i valori predefiniti?")) { COLUMNS_CONFIG = JSON.parse(JSON.stringify(DEFAULT_COLUMNS_CONFIG)); USER_ALARMS = []; masterFontSizePx = 24; appFontSizePx = 15; sharedMsgTemplate = DEFAULT_MSG_TEMPLATE; localStorage.removeItem('workflow_sga_columns_config'); localStorage.removeItem('workflow_sga_alarms'); localStorage.removeItem('workflow_sga_master_fontsize_px'); localStorage.removeItem('workflow_sga_app_fontsize_px'); localStorage.removeItem('workflow_sga_msg_template'); applyMasterFontSize(24); applyAppFontSize(15); closeModal('settingsModal'); renderBoard(); alert("Ripristino completato."); } }

function togglePlayPauseMaster() { isAutoScrollPaused = !isAutoScrollPaused; const icon = document.getElementById('masterPlayPauseIcon'); const text = document.getElementById('masterPlayPauseText'); if (isAutoScrollPaused) { if(icon) { icon.setAttribute('data-lucide', 'play'); icon.classList.replace('text-amber-400', 'text-emerald-400'); } if(text) text.innerText = 'Play'; } else { if(icon) { icon.setAttribute('data-lucide', 'pause'); icon.classList.replace('text-emerald-400', 'text-amber-400'); } if(text) text.innerText = 'Pausa'; } lucide.createIcons(); }

function toggleMasterMode() {
  isMasterMode = !isMasterMode; const body = document.body; const board = document.getElementById('board'); const backBtns = document.querySelectorAll('.master-back-btn');
  if (isMasterMode) { body.classList.add('master-mode'); backBtns.forEach(el => { el.classList.remove('hidden'); el.style.display = 'flex'; }); isAutoScrollPaused = false; renderBoard(); startAutoScroll(); } 
  else { body.classList.remove('master-mode'); backBtns.forEach(el => { el.classList.add('hidden'); el.style.display = 'none'; }); stopAutoScroll(); if(board) board.scrollLeft = 0; renderBoard(); }
}

function startAutoScroll() {
  stopAutoScroll(); autoScrollDir = 1; autoScrollPause = 0; const board = document.getElementById('board');
  function step(timestamp) {
    if (!isMasterMode) return; if (!lastScrollTime) lastScrollTime = timestamp; const elapsed = timestamp - lastScrollTime;
    if (isAutoScrollPaused) { lastScrollTime = timestamp; autoScrollId = requestAnimationFrame(step); return; }
    if (board) {
      const activeCols = board.querySelectorAll('.board-column');
      activeCols.forEach(col => { const dropzone = col.querySelector('.card-dropzone'); if (dropzone && dropzone.scrollHeight > dropzone.clientHeight) { if (!dropzone.dataset.vDir) dropzone.dataset.vDir = 1; if (!dropzone.dataset.vPause) dropzone.dataset.vPause = 0; let vPause = parseFloat(dropzone.dataset.vPause); if (vPause > 0) { dropzone.dataset.vPause = vPause - elapsed; } else { let vDir = parseInt(dropzone.dataset.vDir); const pxToScrollV = (elapsed * masterScrollSpeed * 0.6); dropzone.scrollTop += (pxToScrollV * vDir); if (vDir === 1 && dropzone.scrollTop >= (dropzone.scrollHeight - dropzone.clientHeight - 2)) { dropzone.dataset.vDir = -1; dropzone.dataset.vPause = 2000; } else if (vDir === -1 && dropzone.scrollTop <= 0) { dropzone.dataset.vDir = 1; dropzone.dataset.vPause = 2000; } } } });
      if (board.scrollWidth > board.clientWidth) { if (autoScrollPause > 0) { autoScrollPause -= elapsed; } else { const pxToScroll = elapsed * masterScrollSpeed; board.scrollLeft += (pxToScroll * autoScrollDir); if (autoScrollDir === 1 && board.scrollLeft >= (board.scrollWidth - board.clientWidth - 2)) { autoScrollDir = -1; autoScrollPause = 2500; } else if (autoScrollDir === -1 && board.scrollLeft <= 0) { autoScrollDir = 1; autoScrollPause = 2500; } } }
    }
    lastScrollTime = timestamp; autoScrollId = requestAnimationFrame(step);
  }
  autoScrollId = requestAnimationFrame(step);
}
function stopAutoScroll() { if (autoScrollId) cancelAnimationFrame(autoScrollId); autoScrollId = null; lastScrollTime = 0; }

function updateCloudStatus(isOnline) {
  const statusEl = document.getElementById('cloudStatus'); let hasImgbb = IMGBB_API_KEY && IMGBB_API_KEY.trim() !== "" && IMGBB_API_KEY !== "INSERISCI_QUI_LA_TUA_CHIAVE_IMGBB";
  if (isOnline) { const hqIcon = hasImgbb ? `<span class="ml-1 px-1 bg-emerald-900 text-emerald-200 rounded text-[9px] font-bold border border-emerald-700">4K ON</span>` : ''; statusEl.innerHTML = `<i data-lucide="wifi" class="w-3.5 h-3.5 text-emerald-500"></i> <span class="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">Cloud Attivo${hqIcon}</span>`; } 
  else { statusEl.innerHTML = `<i data-lucide="hard-drive" class="w-3.5 h-3.5 text-slate-400"></i> <span class="text-slate-400 hover:text-slate-200 transition-colors">Modalità Locale</span>`; }
  lucide.createIcons();
}

function listenToCloudUpdates() {
  if (!db) return;
  db.collection('workflow_sga_settings').doc('config').onSnapshot((doc) => { if (doc.exists) { const data = doc.data(); if (data.companyLogo !== undefined && data.companyLogo !== sharedCompanyLogo) { sharedCompanyLogo = data.companyLogo; localStorage.setItem('workflow_sga_company_logo', sharedCompanyLogo); loadCompanyLogo(); } if (data.msgTemplate !== undefined && data.msgTemplate !== sharedMsgTemplate) { sharedMsgTemplate = data.msgTemplate; localStorage.setItem('workflow_sga_msg_template', sharedMsgTemplate); const msgArea = document.getElementById('msgTemplateText'); if (msgArea) msgArea.value = sharedMsgTemplate; } } });
  db.collection('workflow_sga_settings').doc('clients').onSnapshot((doc) => { if (doc.exists) { const data = doc.data(); if (data.db && Array.isArray(data.db)) { CLIENTS_DB = data.db; localStorage.setItem('workflow_sga_clients_db', JSON.stringify(CLIENTS_DB)); populateClientSelectors(); if (currentSettingsView === 'crm') { renderSettingsContent(); } } } else { syncClientsToCloud(); } });
  db.collection('workflow_sga_cards').onSnapshot((snapshot) => {
    if (snapshot.empty && state.cards.length > 0) { state.cards.forEach(card => syncCardToCloud(card)); return; }
    let needsMigration = false;
    snapshot.docChanges().forEach((change) => {
      let docData = change.doc.data();
      if (docData.stage === 'magazzino') { docData.stage = 'da-lavorare'; needsMigration = true; }
      if (docData.stage === 'lavorato') { docData.stage = 'lavorato-da-bollettare'; needsMigration = true; } 
      if (docData.stage === 'consegnato') { docData.stage = 'bollettato-da-consegnare'; needsMigration = true; }
      if (change.type === "added" || change.type === "modified") { const existingIndex = state.cards.findIndex(c => c.id === docData.id); if (existingIndex >= 0) state.cards[existingIndex] = sanitizeCard(docData); else state.cards.push(sanitizeCard(docData)); }
      if (change.type === "removed") { state.cards = state.cards.filter(c => c.id !== docData.id); }
    });
    state.cards.sort((a,b) => (a.order || 0) - (b.order || 0) || new Date(b.createdAt) - new Date(a.createdAt));
    const board = document.getElementById('board'); const currentScroll = board ? board.scrollLeft : 0;
    saveLocal(); if (needsMigration) { state.cards.forEach(c => syncCardToCloud(c)); } populateGlobalFilterDropdown(); if (isMasterMode && board) board.scrollLeft = currentScroll;
  });
}

function syncCardToCloud(card) { if (!db || !card) return; db.collection('workflow_sga_cards').doc(card.id).set(card).catch(err => console.error(err)); }
function syncDeleteToCloud(cardId) { if (!db || !cardId) return; db.collection('workflow_sga_cards').doc(cardId).delete().catch(e => console.error(e)); }

function compressImage(file, maxWidth, maxHeight, quality) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = (e) => { const img = new Image(); img.onload = () => { let width = img.width; let height = img.height; if (width > maxWidth || height > maxHeight) { if (width / height > maxWidth / maxHeight) { height = Math.round((height * maxWidth) / width); width = maxWidth; } else { width = Math.round((width * maxHeight) / height); height = maxHeight; } } const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height); resolve(canvas.toDataURL('image/jpeg', quality)); }; img.onerror = reject; img.src = e.target.result; }; reader.onerror = reject; reader.readAsDataURL(file); }); }
function convertPdfToImage(file, scaleFactor, quality) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = async function(e) { try { const typedarray = new Uint8Array(e.target.result); const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise; const page = await pdf.getPage(1); const viewport = page.getViewport({ scale: scaleFactor }); const canvas = document.createElement('canvas'); const context = canvas.getContext('2d'); canvas.height = viewport.height; canvas.width = viewport.width; context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height); await page.render({ canvasContext: context, viewport: viewport }).promise; resolve(canvas.toDataURL('image/jpeg', quality)); } catch (err) { reject(err); } }; reader.readAsArrayBuffer(file); }); }

async function extractArticlesFromArubaPdf(file) {
  try {
    const arrayBuffer = await file.arrayBuffer(); const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise; let items = []; let inProductsSection = false;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i); const textContent = await page.getTextContent(); let rowsMap = {};
      textContent.items.forEach(item => { let str = item.str.trim(); if (!str) return; let y = Math.round(item.transform[5]); let x = Math.round(item.transform[4]); let foundY = Object.keys(rowsMap).find(yKey => Math.abs(parseFloat(yKey) - y) <= 5); let targetY = foundY !== undefined ? foundY : y; if (!rowsMap[targetY]) rowsMap[targetY] = []; rowsMap[targetY].push({ text: str, x: x }); });
      let sortedYKeys = Object.keys(rowsMap).sort((a, b) => parseFloat(b) - parseFloat(a));
      for (let yKey of sortedYKeys) {
        let rowItems = rowsMap[yKey]; rowItems.sort((a, b) => a.x - b.x); let rowTextFull = rowItems.map(r => r.text).join(' '); let lower = rowTextFull.toLowerCase();
        if (inProductsSection && (lower.includes('metodo di pagamento') || lower.includes('totale imponibile') || lower.includes('totale documento'))) { inProductsSection = false; break; }
        if (lower.includes('prodotti e servizi')) { inProductsSection = true; continue; }
        if (inProductsSection) {
          if (lower.includes('descrizione') && lower.includes('prezzo')) continue;
          let moneyItems = rowItems.filter(r => r.text.includes('€') || r.text.match(/^(\d{1,3}(\.\d{3})*|\d+)[,\.]\d{2}$/));
          if (moneyItems.length >= 1) { let unitPriceItem = moneyItems[0]; let priceVal = parseFloat(unitPriceItem.text.replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.')); let qty = 1; let possibleQtys = rowItems.filter(r => r.x < unitPriceItem.x && r.text.match(/^\d+$/)); if (possibleQtys.length > 0) qty = parseInt(possibleQtys[possibleQtys.length - 1].text); let tax = 22; let taxItem = rowItems.find(r => r.text.includes('%')); if (taxItem) { let taxMatch = taxItem.text.match(/(\d+)\s*%/); if (taxMatch) tax = parseInt(taxMatch[1]); } let rightBoundX = possibleQtys.length > 0 ? possibleQtys[possibleQtys.length - 1].x : unitPriceItem.x; let descItems = rowItems.filter(r => r.x < rightBoundX); if (descItems.length > 0 && descItems[0].text.match(/^\d+$/)) descItems.shift(); let desc = descItems.map(r => r.text).join(' ').trim(); if (desc) items.push({ code: '', desc: desc, qty: qty, price: priceVal, tax: tax }); }
        }
      }
    }
    if (items.length === 0) items.push({ code: '', desc: 'Preventivo: ' + file.name, qty: 1, price: 0, tax: 22 }); return items;
  } catch (e) { return [{ code: '', desc: 'Preventivo: ' + file.name, qty: 1, price: 0, tax: 22 }]; }
}

function sanitizeCard(card) {
  if (!card) return null;
  if (!Array.isArray(card.photos)) card.photos = [];
  card.photos = card.photos.map(p => { if (typeof p === 'string') return { image: p, rotation: 0 }; if (!p.rotation) p.rotation = 0; return p; });
  if (!Array.isArray(card.history)) card.history = []; if (card.order === undefined) card.order = 0;
  if (!card.referent) card.referent = ''; if (!card.email) card.email = ''; if (!card.whatsapp) card.whatsapp = ''; if (!card.machine) card.machine = '';
  if (!card.customerRef) card.customerRef = '';
  if (card.stage === 'magazzino') card.stage = 'da-lavorare';
  if (card.stage === 'lavorato') card.stage = 'lavorato-da-bollettare'; if (card.stage === 'consegnato') card.stage = 'bollettato-da-consegnare';
  if (!Array.isArray(card.articles)) { card.articles = []; if (card.notes && card.notes.trim()) card.articles.push({ code: '', desc: card.notes, qty: 1, price: 0, tax: 22 }); } 
  else { card.articles = card.articles.map(art => { if (art.tax === undefined || art.tax === 0 || art.tax === '0') art.tax = 22; return art; }); }
  return card;
}

function loadState() {
  const saved = localStorage.getItem('workflow_sga_state');
  if (saved) { try { const parsed = JSON.parse(saved); if (parsed && Array.isArray(parsed.cards)) { state.cards = parsed.cards.map(c => sanitizeCard(c)).filter(c => c !== null); } else { state = { cards: [] }; } } catch(e) { state = { cards: [] }; } } 
  else { state = { cards: [] }; }
}

function saveLocal() { renderBoard(); try { localStorage.setItem('workflow_sga_state', JSON.stringify(state)); } catch(e){} }
function exportBackup() { const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state)); const downloadAnchorNode = document.createElement('a'); downloadAnchorNode.setAttribute("href", dataStr); downloadAnchorNode.setAttribute("download", "workflow_sga_backup.json"); document.body.appendChild(downloadAnchorNode); downloadAnchorNode.click(); downloadAnchorNode.remove(); }
function importBackup(event) {
  const file = event.target.files[0]; if (!file) return; const reader = new FileReader();
  reader.onload = function(e) { try { const importedState = JSON.parse(e.target.result); if (importedState && Array.isArray(importedState.cards)) { let count = 0; importedState.cards.forEach(card => { const safeCard = sanitizeCard(card); if (safeCard) { safeCard.id = 'c' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7); state.cards.push(safeCard); syncCardToCloud(safeCard); if (safeCard.client) registerClientAdvanced(safeCard.client, safeCard.referent, safeCard.email, safeCard.whatsapp); count++; } }); state.cards.sort((a,b) => (a.order || 0) - (b.order || 0)); saveLocal(); playSound('success'); alert(`Backup ripristinato con successo! Importate ${count} commesse.`); } } catch(err) { alert("Errore lettura file."); } }; reader.readAsText(file); event.target.value = ''; 
}

function renderBoard() {
  const board = document.getElementById('board'); if (!board) return; board.innerHTML = ''; if (!state || !Array.isArray(state.cards)) state = { cards: [] };
  let columnsToRender = COLUMNS_CONFIG;
  if (isMasterMode) {
    columnsToRender = COLUMNS_CONFIG.filter(col => state.cards.some(c => c && c.stage === col.id));
    if (columnsToRender.length === 0) { board.innerHTML = `<div class="w-full flex flex-col items-center justify-center text-slate-500 py-20"><i data-lucide="check-circle-2" class="w-16 h-16 mb-4 text-emerald-500/50"></i><h2 class="text-2xl font-bold">Nessuna commessa attiva.</h2></div>`; lucide.createIcons(); return; }
  }
  columnsToRender.forEach(col => {
    let colCards = state.cards.filter(c => c && c.stage === col.id);
    if (globalSearchQuery) { colCards = colCards.filter(c => { const t = (c.title || '').toLowerCase(); const cl = (c.client || '').toLowerCase(); const ref = (c.referent || '').toLowerCase(); const jt = (c.jobType || '').toLowerCase(); const mach = (c.machine || '').toLowerCase(); const idMatch = c.id && c.id.toLowerCase().includes(globalSearchQuery); return t.includes(globalSearchQuery) || cl.includes(globalSearchQuery) || ref.includes(globalSearchQuery) || jt.includes(globalSearchQuery) || mach.includes(globalSearchQuery) || idMatch; }); }
    if (globalFilterJobType) { colCards = colCards.filter(c => c.jobType === globalFilterJobType); }
    colCards.sort((a,b) => (a.order || 0) - (b.order || 0));
    const colEl = document.createElement('div'); 
    colEl.className = `board-column flex flex-col h-full bg-slate-900/60 rounded-xl border border-slate-800 w-80 shrink-0 overflow-hidden`;
    colEl.innerHTML = `<div class="p-3 border-b border-slate-800 ${col.color} ${col.border} flex justify-between items-center bg-opacity-30"><h3 class="font-bold uppercase tracking-wide truncate max-w-[80%]">${col.label}</h3><span class="font-semibold bg-slate-950/60 px-2 py-0.5 rounded-full shadow-inner">${colCards.length}</span></div><div class="flex-1 overflow-y-auto p-2 space-y-2 card-dropzone" data-col="${col.id}" ondragover="allowDrop(event)" ondrop="handleDrop(event)">${colCards.map(card => createCardHTML(card)).join('')}</div>`;
    board.appendChild(colEl);
  });
  lucide.createIcons();
}

function getContrastTextColor(hexColor) {
  if (!hexColor) return '#f8fafc'; let c = hexColor.replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16); return ((r * 299 + g * 587 + b * 114) / 1000) >= 128 ? '#0f172a' : '#f8fafc';
}

function createCardHTML(card) {
  if (!card) return ''; const badgeStyle = getJobTypeClass(card.jobType);
  let isUrgent = false;
  if (card.deliveryDate && card.stage !== 'bollettato-da-consegnare' && card.stage !== 'fatturato' && card.stage !== 'archiviato') { const delivery = new Date(card.deliveryDate); delivery.setHours(0,0,0,0); const today = new Date(); today.setHours(0,0,0,0); if (Math.ceil((delivery - today) / (1000 * 60 * 60 * 24)) <= 7) isUrgent = true; }
  let customCardStyle = '', customTextStyle = '', customSubTextStyle = 'text-slate-400', baseCardClass = 'bg-slate-900 border border-slate-800';
  if (card.customColor && card.customColor !== '') { const contrastColor = getContrastTextColor(card.customColor); customCardStyle = `background-color: ${card.customColor}; border-color: ${card.customColor};`; customTextStyle = `color: ${contrastColor};`; baseCardClass = 'border shadow-md'; customSubTextStyle = contrastColor === '#0f172a' ? 'text-slate-800 font-semibold' : 'text-slate-200'; }
  const deliveryHTML = card.deliveryDate ? `<div class="flex items-center gap-1.5 mt-1 mb-1 font-bold ${isUrgent && !card.customColor ? 'text-red-400 bg-red-950/40 border border-red-900/60 animate-pulse' : ''} px-2 py-1 rounded w-fit text-xs" style="${card.customColor ? `background: rgba(0,0,0,0.15); ${customTextStyle}` : ''}"><i data-lucide="calendar" class="w-3.5 h-3.5"></i> Consegna: ${new Date(card.deliveryDate).toLocaleDateString('it-IT')}</div>` : '';
  const machineBadgeHTML = card.machine ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 mt-1"><i data-lucide="cpu" class="w-3 h-3"></i> ${card.machine}</span>` : '';
  const thumbnailHTML = card.photos && card.photos.length > 0 ? `<div class="mt-2 flex gap-1 overflow-hidden h-14">${card.photos.map(p => `<div class="w-14 h-14 shrink-0 overflow-hidden rounded border border-slate-700 bg-slate-900 flex items-center justify-center"><img src="${p.image}" style="transform: rotate(${p.rotation || 0}deg);" class="min-w-full min-h-full object-cover bg-white"></div>`).join('')}</div>` : '';
  const cardIdShort = card.id ? card.id.slice(-4).toUpperCase() : '0000';
  const notifyIconHTML = (card.stage === 'bollettato-da-consegnare' && (card.email || card.whatsapp)) ? `<button onclick="event.stopPropagation(); triggerNotifyById('${card.id}')" class="ml-2 p-1 bg-emerald-500/20 hover:bg-emerald-500/50 text-emerald-400 rounded cursor-pointer transition-colors" title="Invia Notifica Pronto Ritiro"><i data-lucide="mail" class="w-3.5 h-3.5"></i></button>` : '';
  
  const printStages = ['in-lavorazione', 'lavorato-da-bollettare', 'bollettato-da-consegnare', 'fatturato'];
  const printLabelIconHTML = printStages.includes(card.stage) ? `<button onclick="event.stopPropagation(); openLabelPrintModal('${card.id}')" class="ml-2 p-1 bg-blue-500/20 hover:bg-blue-500/50 text-blue-400 rounded cursor-pointer transition-colors" title="Stampa Etichette Colli"><i data-lucide="printer" class="w-3.5 h-3.5"></i></button>` : '';

  return `<div draggable="true" ondragstart="handleDragStart(event)" id="card-${card.id}" data-id="${card.id}" onclick="${isMasterMode ? '' : `playSound('click'); openDetail('${card.id}')`}" style="${customCardStyle}" class="${baseCardClass} hover:border-indigo-500/50 p-3.5 rounded-lg shadow-md cursor-pointer transition-all active:scale-95 space-y-2 group relative ${isUrgent ? 'card-urgent' : ''}"><div class="flex justify-between items-start gap-1"><span class="px-2 py-0.5 rounded font-medium text-[11px] ${badgeStyle}">${card.jobType || 'Generico'}</span><span class="text-xs" style="${card.customColor ? customTextStyle : 'color: #64748b;'}">${card.createdAt ? new Date(card.createdAt).toLocaleDateString('it-IT', {day: 'numeric', month: 'short'}) : ''}</span></div><h4 class="font-bold text-sm leading-snug truncate transition-colors" style="${card.customColor ? customTextStyle : 'color: #f8fafc;'}">${card.title || 'Senza Titolo'}</h4>${card.client ? `<p class="truncate text-xs flex items-center gap-1.5 ${customSubTextStyle}"><i data-lucide="building-2" class="w-3.5 h-3.5 shrink-0"></i> ${card.client}${card.referent ? ` <span class="text-indigo-300 font-semibold">(${card.referent})</span>` : ''}</p>` : ''}${machineBadgeHTML}${deliveryHTML}${thumbnailHTML}<div class="pt-2 border-t flex justify-between items-center text-xs" style="${card.customColor ? 'border-color: rgba(0,0,0,0.15);' : 'border-color: #1e293b;'}" onclick="event.stopPropagation()"><div class="flex items-center gap-1"><span class="font-mono text-[11px]" style="${card.customColor ? customTextStyle : 'color: #475569;'}">#${cardIdShort}</span>${notifyIconHTML}${printLabelIconHTML}<div class="hide-in-master flex items-center bg-black/20 rounded ml-2"><button onclick="moveCardVertical('${card.id}', -1)" class="p-0.5 hover:bg-black/30 rounded px-1.5 cursor-pointer" title="Sposta su" style="${card.customColor ? customTextStyle : 'color: #cbd5e1;'}">▲</button><button onclick="moveCardVertical('${card.id}', 1)" class="p-0.5 hover:bg-black/30 rounded px-1.5 cursor-pointer" title="Sposta giù" style="${card.customColor ? customTextStyle : 'color: #cbd5e1;'}">▼</button></div></div><div class="flex gap-1.5 hide-in-master"><button onclick="moveCardStep('${card.id}', -1)" class="p-1 rounded bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" title="Indietro"><i data-lucide="chevron-left" class="w-4 h-4"></i></button><button onclick="moveCardStep('${card.id}', 1)" class="p-1 rounded bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" title="Avanti"><i data-lucide="chevron-right" class="w-4 h-4"></i></button></div></div></div>`;
}

function moveCardVertical(cardId, direction) {
  playSound('click'); const card = state.cards.find(c => c.id === cardId); if (!card) return;
  const colCards = state.cards.filter(c => c.stage === card.stage); colCards.sort((a, b) => (a.order || 0) - (b.order || 0));
  const currentIndex = colCards.findIndex(c => c.id === cardId); const targetIndex = currentIndex + direction;
  if (targetIndex >= 0 && targetIndex < colCards.length) { const tempOrder = colCards[currentIndex].order; colCards[currentIndex].order = colCards[targetIndex].order; colCards[targetIndex].order = tempOrder; if (colCards[currentIndex].order === colCards[targetIndex].order) { colCards[currentIndex].order = targetIndex; colCards[targetIndex].order = currentIndex; } saveLocal(); syncCardToCloud(colCards[currentIndex]); syncCardToCloud(colCards[targetIndex]); }
}

function getJobTypeClass(type) {
  switch (type) { case 'Stampa Digitale / Banner': return 'bg-blue-900/40 text-blue-300 border border-blue-800'; case 'Abbigliamento / Ricamo': return 'bg-purple-900/40 text-purple-300 border border-purple-800'; case 'Insegne & Vetrofanie': return 'bg-amber-900/40 text-amber-300 border border-amber-800'; case 'Etichette & Adesivi': return 'bg-teal-900/40 text-teal-300 border border-teal-800'; case 'Grafica / Progettazione': return 'bg-rose-900/40 text-rose-300 border border-rose-800'; default: return 'bg-slate-800 text-slate-300 border border-slate-700'; }
}

function allowDrop(ev) { ev.preventDefault(); }
function handleDragStart(ev) { ev.dataTransfer.setData("text/plain", ev.target.dataset.id); }
function handleDrop(ev) { ev.preventDefault(); const cardId = ev.dataTransfer.getData("text"); const targetColId = ev.currentTarget.dataset.col; if (cardId && targetColId) changeCardStage(cardId, targetColId); }

function moveCardStep(cardId, direction) { const card = state.cards.find(c => c.id === cardId); if (!card) return; const currentIndex = COLUMNS_CONFIG.findIndex(col => col.id === card.stage); let targetIndex = currentIndex + direction; if (targetIndex >= 0 && targetIndex < COLUMNS_CONFIG.length) changeCardStage(cardId, COLUMNS_CONFIG[targetIndex].id); }

function changeCardStage(cardId, targetStageId) {
  const card = state.cards.find(c => c.id === cardId);
  if (card && card.stage !== targetStageId) {
    playSound('click'); card.stage = targetStageId; card.order = Date.now();
    const stageLabel = COLUMNS_CONFIG.find(col => col.id === targetStageId)?.label || targetStageId;
    if (!Array.isArray(card.history)) card.history = []; card.history.push({ stage: targetStageId, label: stageLabel, timestamp: new Date().toISOString() });
    saveLocal(); syncCardToCloud(card);
    if (targetStageId === 'bollettato-da-consegnare') { checkAndTriggerClientNotification(card); }
  }
}

function triggerNotifyById(id) { playSound('click'); const card = state.cards.find(c => c.id === id); if (card) checkAndTriggerClientNotification(card); }
function checkAndTriggerClientNotification(card) {
  if (!card.whatsapp && !card.email && !card.client) return; activeNotifyCard = card;
  document.getElementById('notifyClientName').innerText = card.client || 'N/D'; document.getElementById('notifyClientRef').innerText = card.referent || 'Nessun referente'; document.getElementById('notifyClientWa').innerText = card.whatsapp || 'Non disponibile'; document.getElementById('notifyClientEmail').innerText = card.email || 'Non disponibile';
  const btnWa = document.getElementById('btnSendWa'); const btnEmail = document.getElementById('btnSendEmail');
  if (card.whatsapp) { btnWa.classList.remove('opacity-50', 'pointer-events-none'); } else { btnWa.classList.add('opacity-50', 'pointer-events-none'); }
  if (card.email) { btnEmail.classList.remove('opacity-50', 'pointer-events-none'); } else { btnEmail.classList.add('opacity-50', 'pointer-events-none'); }
  openModal('clientNotifyModal'); lucide.createIcons();
}

function getNotificationMessage(card) {
  let template = sharedMsgTemplate || DEFAULT_MSG_TEMPLATE; let saluto = "";
  if (card.referent && card.client) { saluto = `${card.referent} della ditta ${card.client}`; } else if (card.referent) { saluto = `${card.referent}`; } else if (card.client) { saluto = `ditta ${card.client}`; } else { saluto = `Cliente`; }
  let articlesList = "";
  if (card.articles && card.articles.length > 0) { const validArticles = card.articles.filter(a => a.desc && a.desc.trim() !== ""); if (validArticles.length > 0) { articlesList = "\n" + validArticles.map(a => `- ${a.qty || 1} pezzi ${a.desc.trim()}`).join('\n'); } }
  return template.replace(/{SALUTO}/g, saluto).replace(/{TITOLO}/g, card.title || '').replace(/{ARTICOLI}/g, articlesList);
}

function sendWhatsAppNotification() { if (!activeNotifyCard || !activeNotifyCard.whatsapp) return; const msgTesto = getNotificationMessage(activeNotifyCard); const msg = encodeURIComponent(msgTesto); let phone = activeNotifyCard.whatsapp.replace(/[^0-9+]/g, ''); window.open(`https://wa.me/${phone}?text=${msg}`, '_blank'); closeModal('clientNotifyModal'); }
function sendEmailNotification() { if (!activeNotifyCard || !activeNotifyCard.email) return; const msgTesto = getNotificationMessage(activeNotifyCard); const subject = encodeURIComponent(`Avviso: Ordine pronto per il ritiro - ${activeNotifyCard.title}`); const body = encodeURIComponent(msgTesto); window.location.href = `mailto:${activeNotifyCard.email}?subject=${subject}&body=${body}`; closeModal('clientNotifyModal'); }

function checkNewCustomJobType(val) { const customInput = document.getElementById('formCustomJobType'); if (val === 'custom') { customInput.classList.remove('hidden'); customInput.required = true; } else { customInput.classList.add('hidden'); customInput.required = false; customInput.value = ''; } }
function checkEditCustomJobType(val) { const customInput = document.getElementById('editCustomJobType'); if (val === 'custom') customInput.classList.remove('hidden'); else { customInput.classList.add('hidden'); customInput.value = ''; } }
function resetCardCustomColor() { const card = state.cards.find(c => c.id === activeCardId); if (card) { card.customColor = ""; const colDef = COLUMNS_CONFIG.find(col => col.id === card.stage); const colorInput = document.getElementById('editCardColor'); colorInput.value = colDef ? colDef.hexDefault : '#4f46e5'; colorInput.dataset.defaultColor = colorInput.value; saveLocal(); syncCardToCloud(card); alert("Colore personalizzato rimosso."); } }

function handleFormFileSelect(event) { const file = event.target.files[0]; if (!file) return; tempFormFile = file; const previewEl = document.getElementById('formFilePreview'); previewEl.innerText = `Selezionato: ${file.name}`; previewEl.classList.remove('hidden'); }

async function createNewCard(event) {
  event.preventDefault(); playSound('success');
  const title = document.getElementById('formTitle').value.trim(); const client = title;
  const referent = document.getElementById('formReferent') ? document.getElementById('formReferent').value.trim() : ''; 
  const email = document.getElementById('formEmail') ? document.getElementById('formEmail').value.trim() : ''; 
  const whatsapp = document.getElementById('formWhatsapp') ? document.getElementById('formWhatsapp').value.trim() : ''; 
  const machine = document.getElementById('formMachine') ? document.getElementById('formMachine').value : ''; 
  const deliveryDate = document.getElementById('formDeliveryDate') ? document.getElementById('formDeliveryDate').value : '';
  const customerRef = document.getElementById('formCustomerRef') ? document.getElementById('formCustomerRef').value.trim() : '';
  
  let jobType = document.getElementById('formJobType').value; if (jobType === 'custom') jobType = document.getElementById('formCustomJobType').value.trim() || 'Altro';
  const initialStage = document.getElementById('formInitialStage').value; const initialStageLabel = COLUMNS_CONFIG.find(col => col.id === initialStage)?.label || 'Prev. da fare'; const initialNote = document.getElementById('formNotes') ? document.getElementById('formNotes').value.trim() : '';
  
  if (!title) return; if (client) registerClientAdvanced(client, referent, email, whatsapp);

  let extractedArticles = [], initialPhotos = [];
  if (tempFormFile) {
    let imgbbKey = IMGBB_API_KEY && IMGBB_API_KEY !== "INSERISCI_QUI_LA_TUA_CHIAVE_IMGBB" ? IMGBB_API_KEY : null;
    try {
      let imgData = "";
      if (tempFormFile.type === 'application/pdf') { extractedArticles = await extractArticlesFromArubaPdf(tempFormFile); imgData = await convertPdfToImage(tempFormFile, imgbbKey ? 3.0 : 2.0, imgbbKey ? 0.90 : 0.8); } else { imgData = await compressImage(tempFormFile, imgbbKey ? 2400 : 1600, imgbbKey ? 2400 : 1600, imgbbKey ? 0.90 : 0.8); }
      if (imgData) {
        if (imgbbKey) { try { const base64Str = imgData.split(',')[1]; const formData = new FormData(); formData.append("image", base64Str); const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, { method: 'POST', body: formData }); const data = await response.json(); initialPhotos.push({ image: data.success ? data.data.url : imgData, rotation: 0 }); } catch(e) { initialPhotos.push({ image: imgData, rotation: 0 }); } } 
        else { initialPhotos.push({ image: imgData, rotation: 0 }); }
      }
    } catch(e) {}
  }
  if (extractedArticles.length === 0) { extractedArticles = initialNote ? [{ code: '', desc: initialNote, qty: 1, price: 0, tax: 22 }] : []; }

  const newCard = {
    id: 'c' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
    title, client, referent, email, whatsapp, machine, jobType, deliveryDate, customerRef,
    articles: extractedArticles, stage: initialStage, order: Date.now(), createdAt: new Date().toISOString(), photos: initialPhotos, history: [{ stage: initialStage, label: `Inserito in "${initialStageLabel}"`, timestamp: new Date().toISOString() }]
  };

  state.cards.unshift(newCard); saveLocal(); syncCardToCloud(newCard); populateGlobalFilterDropdown();
  document.getElementById('newCardForm').reset(); document.getElementById('formClientSelector').value = ''; document.getElementById('formCustomJobType').classList.add('hidden'); document.getElementById('formFilePreview').classList.add('hidden'); tempFormFile = null; closeModal('addCardModal');
}

function saveCardEdits() {
  const card = state.cards.find(c => c.id === activeCardId); if (!card) return;
  card.title = document.getElementById('editTitle').value.trim(); card.client = card.title; card.referent = document.getElementById('editReferent').value.trim(); card.email = document.getElementById('editEmail').value.trim(); card.whatsapp = document.getElementById('editWhatsapp').value.trim(); card.machine = document.getElementById('editMachine').value;
  if (document.getElementById('editCustomerRef')) card.customerRef = document.getElementById('editCustomerRef').value.trim();
  if (card.client) registerClientAdvanced(card.client, card.referent, card.email, card.whatsapp);
  card.deliveryDate = document.getElementById('editDeliveryDate').value;
  const colorInput = document.getElementById('editCardColor'); const selectedColor = colorInput.value.toLowerCase(); const defaultColor = colorInput.dataset.defaultColor ? colorInput.dataset.defaultColor.toLowerCase() : "";
  if (selectedColor === defaultColor) { card.customColor = ""; } else { card.customColor = colorInput.value; }
  let newJobType = document.getElementById('editJobType').value; if (newJobType === 'custom') newJobType = document.getElementById('editCustomJobType').value.trim() || card.jobType; card.jobType = newJobType;
  saveLocal(); syncCardToCloud(card); populateGlobalFilterDropdown(); playSound('success'); alert("Aggiornato con successo!");
}

function renderArticlesTable(card) {
  const tbody = document.getElementById('articlesTableBody'); tbody.innerHTML = '';
  if (!card.articles || card.articles.length === 0) card.articles = [{ code: '', desc: '', qty: '', price: '', tax: 22 }];
  card.articles.forEach((art, idx) => {
    const qty = parseFloat(art.qty) || 0, price = parseFloat(art.price) || 0, taxRate = parseFloat(art.tax) !== undefined && !isNaN(parseFloat(art.tax)) ? parseFloat(art.tax) : 22; const rowTotalNet = qty * price, unitTaxPrice = price * (1 + taxRate / 100), rowTotalTaxed = rowTotalNet * (1 + taxRate / 100);
    const tr = document.createElement('tr'); tr.className = "hover:bg-slate-900/50 transition-colors";
    tr.innerHTML = `<td class="py-1.5 px-1 text-center align-middle"><div class="flex items-center justify-center gap-0.5 bg-slate-900 rounded p-0.5 border border-slate-800"><button onclick="moveArticleRowVertical(${idx}, -1)" class="hover:bg-slate-800 text-slate-300 text-xs px-1 rounded cursor-pointer">▲</button><button onclick="moveArticleRowVertical(${idx}, 1)" class="hover:bg-slate-800 text-slate-300 text-xs px-1 rounded cursor-pointer">▼</button></div></td><td class="py-1.5 px-1"><input type="text" value="${art.code || ''}" data-field="code" data-index="${idx}" oninput="updateArticleField(this)" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:outline-none"></td><td class="py-1.5 px-1"><input type="text" value="${art.desc || ''}" data-field="desc" data-index="${idx}" oninput="updateArticleField(this)" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none"></td><td class="py-1.5 px-1"><input type="number" step="any" value="${art.qty !== undefined ? art.qty : ''}" data-field="qty" data-index="${idx}" oninput="updateArticleField(this)" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs text-center focus:outline-none"></td><td class="py-1.5 px-1"><input type="number" step="any" value="${art.price !== undefined ? art.price : ''}" data-field="price" data-index="${idx}" oninput="updateArticleField(this)" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs text-right focus:outline-none"></td><td class="py-1.5 px-1"><input type="number" step="any" value="${taxRate}" data-field="tax" data-index="${idx}" oninput="updateArticleField(this)" class="w-full bg-slate-900 border border-slate-700 rounded px-1 py-1 text-slate-200 text-xs text-center focus:outline-none"></td><td class="py-1.5 px-1 text-right font-mono text-slate-300 align-middle"><span id="row-net-${idx}">€ ${rowTotalNet.toFixed(2)}</span></td><td class="py-1.5 px-1 text-right font-mono text-slate-300 align-middle"><span id="row-unit-taxed-${idx}">€ ${unitTaxPrice.toFixed(2)}</span></td><td class="py-1.5 px-2 text-right font-mono font-bold text-slate-300 align-middle"><span id="row-total-${idx}">€ ${rowTotalTaxed.toFixed(2)}</span></td><td class="py-1.5 px-1 text-center align-middle"><button onclick="removeArticleRow(${idx})" class="text-red-400 hover:text-red-300 p-1 cursor-pointer"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button></td>`;
    tbody.appendChild(tr);
  });
  calculateGrandTotals(); lucide.createIcons();
}

function moveArticleRowVertical(idx, direction) { playSound('click'); const card = state.cards.find(c => c.id === activeCardId); if (!card || !card.articles) return; const targetIdx = idx + direction; if (targetIdx >= 0 && targetIdx < card.articles.length) { const temp = card.articles[idx]; card.articles[idx] = card.articles[targetIdx]; card.articles[targetIdx] = temp; renderArticlesTable(card); saveLocal(); syncCardToCloud(card); } }

function updateArticleField(input) {
  const idx = parseInt(input.dataset.index), field = input.dataset.field; const card = state.cards.find(c => c.id === activeCardId); if (!card || !card.articles[idx]) return; card.articles[idx][field] = input.value;
  if (['qty', 'price', 'tax'].includes(field)) { const qty = parseFloat(card.articles[idx].qty) || 0, price = parseFloat(card.articles[idx].price) || 0, taxRate = parseFloat(card.articles[idx].tax) !== undefined && !isNaN(parseFloat(card.articles[idx].tax)) ? parseFloat(card.articles[idx].tax) : 22; const rowTotalNet = qty * price, unitTaxPrice = price * (1 + taxRate / 100), rowTotalTaxed = rowTotalNet * (1 + taxRate / 100); document.getElementById(`row-net-${idx}`).innerText = `€ ${rowTotalNet.toFixed(2)}`; document.getElementById(`row-unit-taxed-${idx}`).innerText = `€ ${unitTaxPrice.toFixed(2)}`; document.getElementById(`row-total-${idx}`).innerText = `€ ${rowTotalTaxed.toFixed(2)}`; calculateGrandTotals(); }
}

function calculateGrandTotals() {
  const card = state.cards.find(c => c.id === activeCardId); if (!card || !card.articles) return; let grandSubtotal = 0, grandTax = 0, grandTotalTaxed = 0;
  card.articles.forEach(art => { const qty = parseFloat(art.qty) || 0, price = parseFloat(art.price) || 0, taxRate = parseFloat(art.tax) !== undefined && !isNaN(parseFloat(art.tax)) ? parseFloat(art.tax) : 22; const sub = qty * price, taxAmt = sub * (taxRate / 100); grandSubtotal += sub; grandTax += taxAmt; grandTotalTaxed += (sub + taxAmt); });
  document.getElementById('grandSubtotalDisplay').innerText = `€ ${grandSubtotal.toFixed(2)}`; document.getElementById('grandTaxDisplay').innerText = `€ ${grandTax.toFixed(2)}`; document.getElementById('grandTotalDisplay').innerText = `€ ${grandTotalTaxed.toFixed(2)}`;
}

function addArticleRow() { const card = state.cards.find(c => c.id === activeCardId); if (!card) return; if (!Array.isArray(card.articles)) card.articles = []; card.articles.push({ code: '', desc: '', qty: 1, price: 0, tax: 22 }); renderArticlesTable(card); }
function removeArticleRow(idx) { const card = state.cards.find(c => c.id === activeCardId); if (!card || !card.articles || !card.articles[idx]) return; const artName = card.articles[idx].desc || "Riga Vuota"; confirmDeletion(`Articolo: ${artName}`, () => { card.articles.splice(idx, 1); renderArticlesTable(card); saveLocal(); syncCardToCloud(card); }); }
function saveArticlesEdits() { const card = state.cards.find(c => c.id === activeCardId); if (!card) return; saveLocal(); syncCardToCloud(card); playSound('success'); alert("Articoli salvati."); }

function openDetail(id) {
  if (isMasterMode) return; const card = state.cards.find(c => c.id === id); if (!card) return; activeCardId = id;
  const currentStageObj = COLUMNS_CONFIG.find(col => col.id === card.stage); const badge = document.getElementById('detailBadge'); badge.textContent = currentStageObj ? currentStageObj.label : (card.stage === 'archiviato' ? 'Archiviata' : 'N/A'); badge.className = `px-2 py-0.5 rounded text-[11px] font-bold text-white uppercase ${currentStageObj ? currentStageObj.color.split(' ')[0] : 'bg-slate-600'}`;
  
  document.getElementById('editClientSelector').value = ''; document.getElementById('editTitle').value = card.title || ''; document.getElementById('editReferent').value = card.referent || ''; document.getElementById('editEmail').value = card.email || ''; document.getElementById('editWhatsapp').value = card.whatsapp || ''; document.getElementById('editDeliveryDate').value = card.deliveryDate || ''; populateMachinesDropdowns(); document.getElementById('editMachine').value = card.machine || '';
  if (document.getElementById('editCustomerRef')) document.getElementById('editCustomerRef').value = card.customerRef || '';
  
  const colDef = COLUMNS_CONFIG.find(col => col.id === card.stage); const defaultColor = colDef ? colDef.hexDefault : '#4f46e5'; const colorInput = document.getElementById('editCardColor'); colorInput.value = card.customColor || defaultColor; colorInput.dataset.defaultColor = defaultColor; 
  renderArticlesTable(card); renderAttachments(card);
  
  const timeline = document.getElementById('storyboardTimeline'); timeline.innerHTML = '';
  if (Array.isArray(card.history)) { card.history.forEach((h, idx) => { const hStageObj = COLUMNS_CONFIG.find(col => col.id === h.stage); const circleBg = hStageObj ? hStageObj.color.split(' ')[0] : (h.stage === 'archiviato' ? 'bg-slate-600' : 'bg-slate-700'); const item = document.createElement('div'); item.className = "flex items-start gap-3 relative"; item.innerHTML = `<div class="absolute -left-[23px] mt-1.5 w-4.5 h-4.5 rounded-full border border-slate-900 ${circleBg} flex items-center justify-center text-[8px] font-bold text-slate-100 shadow-sm">${idx+1}</div><div class="flex-1 bg-slate-950/40 p-2.5 rounded border border-slate-800/80"><div class="flex justify-between items-center mb-0.5"><span class="font-bold text-xs text-slate-200 uppercase">${h.label}</span><span class="text-[10px] text-slate-500">${new Date(h.timestamp).toLocaleString('it-IT')}</span></div></div>`; timeline.appendChild(item); }); }
  
  const restoreBtn = document.getElementById('restoreCardBtnContainer'); if (restoreBtn) { if (card.stage === 'archiviato') restoreBtn.classList.remove('hidden'); else restoreBtn.classList.add('hidden'); }
  openModal('detailModal');
}

function restoreCardFromArchive() { const card = state.cards.find(c => c.id === activeCardId); if (card && card.stage === 'archiviato') { playSound('success'); card.stage = 'fatturato'; card.history.push({ stage: 'fatturato', label: 'Ripristinata dall\'archivio in Fatturato', timestamp: new Date().toISOString() }); saveLocal(); syncCardToCloud(card); closeModal('detailModal'); if (currentSettingsView === 'archive') { const list = document.getElementById('archiveSettingsList'); if (list) { list.innerHTML = renderArchiveList(); lucide.createIcons(); } } } }

function renderAttachments(card) {
  const container = document.getElementById('attachmentsContainer'); container.innerHTML = '';
  if (card.photos && card.photos.length > 0) { card.photos.forEach((photoObj, index) => { const thumb = document.createElement('div'); thumb.className = "relative group w-full h-24 bg-slate-900 rounded border border-slate-700 overflow-hidden flex items-center justify-center cursor-pointer"; thumb.innerHTML = `<img src="${photoObj.image}" onclick="playSound('click'); openGallery(${index})" style="transform: rotate(${photoObj.rotation || 0}deg);" class="min-w-full min-h-full object-cover bg-white"><button onclick="removePhoto(event, ${index})" class="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white p-1.5 rounded shadow active:scale-90 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>`; container.appendChild(thumb); }); lucide.createIcons(); } 
  else { container.innerHTML = `<div class="col-span-2 md:col-span-4 flex flex-col items-center justify-center py-6 text-slate-500 border border-dashed border-slate-800 rounded-lg bg-slate-950/50"><i data-lucide="file-question" class="w-6 h-6 mb-2 opacity-50"></i><span class="text-xs italic">Nessun file o foto allegata</span></div>`; }
}

async function handleDocumentUpload(event) {
  const files = Array.from(event.target.files); if (!files || files.length === 0) return; const card = state.cards.find(c => c.id === activeCardId); if (!card) return; if (!card.photos) card.photos = [];
  let imgbbKey = IMGBB_API_KEY && IMGBB_API_KEY !== "INSERISCI_QUI_LA_TUA_CHIAVE_IMGBB" ? IMGBB_API_KEY : null;
  for (const file of files) { try { let imgData = ""; if (file.type === 'application/pdf') { const extractedArticles = await extractArticlesFromArubaPdf(file); if (extractedArticles && extractedArticles.length > 0) { if (!card.articles || card.articles.length === 0 || (card.articles.length === 1 && !card.articles[0].desc)) card.articles = extractedArticles; else card.articles.push(...extractedArticles); } imgData = await convertPdfToImage(file, imgbbKey ? 3.0 : 2.0, imgbbKey ? 0.90 : 0.8); } else { imgData = await compressImage(file, imgbbKey ? 2400 : 1600, imgbbKey ? 2400 : 1600, imgbbKey ? 0.90 : 0.8); } if (imgData) { if (imgbbKey) { try { const base64Str = imgData.split(',')[1]; const formData = new FormData(); formData.append("image", base64Str); const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, { method: 'POST', body: formData }); const data = await response.json(); card.photos.push({ image: data.success ? data.data.url : imgData, rotation: 0 }); } catch(e) { card.photos.push({ image: imgData, rotation: 0 }); } } else { card.photos.push({ image: imgData, rotation: 0 }); } } } catch (e) {} }
  renderArticlesTable(card); saveLocal(); renderAttachments(card); syncCardToCloud(card); event.target.value = ''; playSound('success'); alert("Documento importato correttamente!");
}

function removePhoto(event, index) { event.stopPropagation(); const card = state.cards.find(c => c.id === activeCardId); if (card && card.photos) { confirmDeletion(`Allegato / Foto #${index + 1}`, () => { card.photos.splice(index, 1); saveLocal(); renderAttachments(card); syncCardToCloud(card); }); } }
function openGallery(index) { currentGalleryIndex = index; updateGalleryView(); openModal('galleryModal'); }
function closeGallery() { closeModal('galleryModal'); }
function updateGalleryView() { const card = state.cards.find(c => c.id === activeCardId); if (!card || !card.photos || card.photos.length === 0) return closeGallery(); const item = card.photos[currentGalleryIndex]; const imgEl = document.getElementById('galleryImage'); imgEl.src = item.image; imgEl.style.transform = `rotate(${item.rotation || 0}deg)`; document.getElementById('galleryCounter').innerText = `${currentGalleryIndex + 1} / ${card.photos.length}`; document.getElementById('btnPrevGallery').style.display = currentGalleryIndex === 0 ? 'none' : 'block'; document.getElementById('btnNextGallery').style.display = currentGalleryIndex === card.photos.length - 1 ? 'none' : 'block'; lucide.createIcons(); }
function prevGalleryImage() { if (currentGalleryIndex > 0) { currentGalleryIndex--; updateGalleryView(); } }
function nextGalleryImage() { const card = state.cards.find(c => c.id === activeCardId); if (card && currentGalleryIndex < card.photos.length - 1) { currentGalleryIndex++; updateGalleryView(); } }
function rotateGalleryImage() { const card = state.cards.find(c => c.id === activeCardId); if (!card || !card.photos) return; const item = card.photos[currentGalleryIndex]; item.rotation = ((item.rotation || 0) + 90) % 360; saveLocal(); updateGalleryView(); renderAttachments(card); syncCardToCloud(card); }
function deleteCurrentCard() { const card = state.cards.find(c => c.id === activeCardId); if (!card) return; confirmDeletion(`Commessa: ${card.title || 'Senza Nome'}`, () => { state.cards = state.cards.filter(c => c.id !== activeCardId); saveLocal(); syncDeleteToCloud(activeCardId); closeModal('detailModal'); populateGlobalFilterDropdown(); }); }

function openLabelPrintModal(cardId) {
  playSound('click'); const card = state.cards.find(c => c.id === cardId); if (!card) return; activeLabelCardId = cardId;
  document.getElementById('labelClientName').innerText = card.client || 'N/D'; document.getElementById('labelTaskTitle').innerText = card.title || 'Senza Titolo';
  const notesInput = document.getElementById('labelNotesInput');
  if (notesInput) { if (card.labelNotes !== undefined) notesInput.value = card.labelNotes; else if (card.customerRef) notesInput.value = `Rif. Ordine: ${card.customerRef}`; else notesInput.value = ''; }
  window.tempLabelArticles = [];
  if (card.labelArticles && card.labelArticles.length > 0) { window.tempLabelArticles = JSON.parse(JSON.stringify(card.labelArticles)); } 
  else if (card.articles && card.articles.length > 0) { card.articles.forEach(art => { if(!art.desc || art.desc.trim() === '') return; window.tempLabelArticles.push({ code: art.code || '', desc: art.desc, qty: art.qty || 1, packageNum: 1 }); }); }
  renderLabelArticlesTable(); openModal('labelPrintModal'); lucide.createIcons();
}

function renderLabelArticlesTable() {
  const tbody = document.getElementById('labelArticlesBody'); tbody.innerHTML = '';
  if (window.tempLabelArticles.length === 0) { tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-slate-500 italic">Nessun articolo associato.</td></tr>`; } 
  else {
    window.tempLabelArticles.forEach((art, idx) => {
      const tr = document.createElement('tr'); tr.className = "hover:bg-slate-900/50 transition-colors";
      tr.innerHTML = `
        <td class="py-2 px-2 w-1/5"><input type="text" value="${art.code || ''}" onchange="updateLabelRow(${idx}, 'code', this.value)" class="w-full bg-transparent border-b border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500" placeholder="Codice"></td>
        <td class="py-2 px-2 w-2/5"><input type="text" value="${art.desc || ''}" onchange="updateLabelRow(${idx}, 'desc', this.value)" class="w-full bg-transparent border-b border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500" placeholder="Descrizione"></td>
        <td class="py-2 px-2 text-center w-20"><input type="number" min="1" value="${art.qty}" onchange="updateLabelRow(${idx}, 'qty', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded px-1 py-1 text-slate-200 text-sm text-center focus:outline-none focus:border-blue-500"></td>
        <td class="py-2 px-2 text-center w-20"><input type="number" min="1" value="${art.packageNum}" onchange="updateLabelRow(${idx}, 'packageNum', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded px-1 py-1 text-slate-200 text-sm text-center focus:outline-none focus:border-blue-500"></td>
        <td class="py-2 px-2 text-center w-16 flex items-center justify-center gap-2"><button onclick="splitLabelRow(${idx})" class="p-1.5 bg-slate-800 hover:bg-blue-900/50 text-blue-400 rounded cursor-pointer transition-colors" title="Dividi Riga"><i data-lucide="split-square-vertical" class="w-4 h-4"></i></button><button onclick="removeLabelRow(${idx})" class="p-1.5 bg-slate-800 hover:bg-red-900/50 text-red-400 rounded cursor-pointer transition-colors" title="Rimuovi"><i data-lucide="trash-2" class="w-4 h-4"></i></button></td>
      `;
      tbody.appendChild(tr);
    });
  }
  lucide.createIcons();
}

function updateLabelRow(index, field, value) { if (field === 'qty' || field === 'packageNum') window.tempLabelArticles[index][field] = parseInt(value) || 1; else window.tempLabelArticles[index][field] = value; }
function splitLabelRow(index) { playSound('click'); const item = window.tempLabelArticles[index]; const newItem = { code: item.code || '', desc: item.desc, qty: item.qty, packageNum: item.packageNum + 1 }; window.tempLabelArticles.splice(index + 1, 0, newItem); renderLabelArticlesTable(); }
function removeLabelRow(index) { playSound('click'); window.tempLabelArticles.splice(index, 1); renderLabelArticlesTable(); }

async function generateAndPrintLabels() {
  const card = state.cards.find(c => c.id === activeLabelCardId); if (!card) return;
  const packages = {}; let hasValidArticles = false;
  if (window.tempLabelArticles.length > 0) { window.tempLabelArticles.forEach(art => { if(!art.desc || art.desc.trim() === '') return; const pkgNum = art.packageNum || 1; if (!packages[pkgNum]) packages[pkgNum] = []; packages[pkgNum].push({ code: art.code || '', desc: art.desc, qty: art.qty }); hasValidArticles = true; }); }
  if (!hasValidArticles) { packages[1] = [{code: '', desc: 'Materiale Commessa (Varie)', qty: 1}]; }
  
  const packageNumbers = Object.keys(packages).map(Number).sort((a, b) => a - b); const totalPackages = packageNumbers.length;
  if (totalPackages === 0) { alert("Nessun articolo selezionato per i colli."); return; }
  
  const labelNotes = document.getElementById('labelNotesInput') ? document.getElementById('labelNotesInput').value.trim() : '';
  card.labelArticles = JSON.parse(JSON.stringify(window.tempLabelArticles)); card.labelNotes = labelNotes; 
  
  playSound('success');
  
  let labelsHtml = ''; const senderText = "<strong style='font-size: 11px;'>Studio Grafico Associato di Gastaldi Antonio Francesco</strong><br>Via Mario Groppo 4 - 12048 Sommariva del Bosco (CN)<br>Tel: 0172 560087 - info@studiograficoassociato.com<br>www.studiograficoassociato.com";
  let logoHtml = sharedCompanyLogo ? `<img src="${sharedCompanyLogo}" class="print-logo">` : `<div class="logo-area">SGA</div><div class="logo-sub">STUDIO GRAFICO ASSOCIATO</div>`;

  packageNumbers.forEach((pkgNum, idx) => {
    const currentPkgIndex = idx + 1; const articlesInPkg = packages[pkgNum];
    const articlesListHtml = articlesInPkg.map(a => `<tr><td style="width: 45px; font-weight: bold; text-align: center; vertical-align: top;">${a.qty}x</td><td style="padding-bottom: 4px; vertical-align: top;">${a.desc}</td><td style="width: 80px; font-family: monospace; font-size: 11px; padding-bottom: 4px; vertical-align: top;">${a.code}</td></tr>`).join('');
    
    labelsHtml += `<div class="label-page"><div class="top-row"><div class="logo-box">${logoHtml}</div><div class="sender-info">${senderText}</div><div class="qr-code"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.studiograficoassociato.com" alt="QR Code" style="width: 100%; height: 100%; object-fit: contain;"></div></div><div class="middle-row"><div class="box dest-box"><div class="box-header">DESTINATARIO:</div><div class="box-body" style="font-size: 16px; font-weight: bold; padding-top: 6px;">${card.client || 'Cliente N/D'}<br><span style="font-weight: normal; font-size: 12px;">${card.referent ? 'Rif: ' + card.referent : ''}</span></div></div><div class="collo-box">Collo ${currentPkgIndex} di ${totalPackages}</div></div><div class="box content-box" style="flex: 1; display: flex; flex-direction: column;"><div class="box-header">CONTENUTO DEL COLLO:</div><div class="box-body" style="padding: 0; flex: 1;"><table class="content-table"><thead><tr><th style="width: 45px; text-align: center;">Q.TÀ</th><th>DESCRIZIONE MATERIALE</th><th style="width: 80px;">CODICE</th></tr></thead><tbody>${articlesListHtml}</tbody></table></div></div>${labelNotes ? `<div class="box notes-box" style="margin-top: 3mm; height: 18mm; flex-shrink: 0;"><div class="box-header" style="background: #555;">NOTE / RIFERIMENTI:</div><div class="box-body" style="font-size: 12px;">${labelNotes.replace(/\n/g, '<br>')}</div></div>` : ''}</div>`;
  });

  const fullHtml = `<!DOCTYPE html><html><head><title>Etichette_${card.title}</title><style>
    @page { size: 148mm 105mm; margin: 0; } body, html { margin: 0; padding: 0; width: 148mm; background: #fff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .label-page { width: 148mm; height: 105mm; padding: 5mm; box-sizing: border-box; display: flex; flex-direction: column; page-break-after: always; break-after: page; background: #fff; overflow: hidden; position: relative; } .top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3.5mm; padding-bottom: 2.5mm; border-bottom: 2px solid #333; } .logo-box { width: 38mm; display: flex; flex-direction: column; justify-content: center; } .print-logo { max-height: 15mm; max-width: 100%; object-fit: contain; filter: brightness(0); object-position: left center; } .logo-area { font-weight: 900; font-size: 32px; line-height: 0.9; letter-spacing: -2px; color: #000; display: flex; align-items: center; } .logo-sub { font-size: 9px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 1px;} .sender-info { flex: 1; text-align: center; font-size: 9.5px; line-height: 1.35; color: #000; padding: 0 3mm; } .qr-code { width: 18mm; height: 18mm; border: 1.5px solid #333; padding: 1px; border-radius: 4px; flex-shrink: 0;} .box { border: 2px solid #333; border-radius: 6px; overflow: hidden; display: flex; flex-direction: column;} .box-header { background: #555; color: #fff; font-weight: bold; font-size: 11px; padding: 3px 8px; text-transform: uppercase; letter-spacing: 0.5px;} .box-body { background: #EBE8D8; padding: 6px 8px; font-size: 12px; line-height: 1.25; color: #000; flex: 1; } .middle-row { display: flex; gap: 3mm; height: 19mm; margin-bottom: 3mm;} .dest-box { flex: 1; } .dest-box .box-header { background: #444; } .collo-box { width: 42mm; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; background: #EBE8D8; border: 2px solid #333; border-radius: 6px; color: #000;} .content-box { flex: 1; } .content-box .box-header { background: #fff; color: #000; border-bottom: 2px solid #333;} .content-table { width: 100%; border-collapse: collapse; font-size: 13px; } .content-table th { background: #D9D9D9; border-bottom: 2px solid #888; text-align: left; padding: 4px 6px; font-size: 11px; font-weight: bold;} .content-table td { padding: 5px 6px; border-bottom: 1px solid #ddd; background: #EBE8D8;} .content-table tr:nth-child(even) td { background: #E1DECD; }
  </style></head><body>${labelsHtml}</body></html>`;

  const blob = new Blob([fullHtml], { type: 'text/html' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `Etichetta_${card.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.html`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); 
  alert("✅ File etichetta generato a dimensione reale A6 e modifiche salvate!"); 
  closeModal('labelPrintModal');

  if (card.stage !== 'bollettato-da-consegnare' && card.stage !== 'fatturato' && card.stage !== 'archiviato') {
    card.stage = 'bollettato-da-consegnare';
    card.order = Date.now();
    card.history.push({ stage: 'bollettato-da-consegnare', label: 'Stampa Etichette -> Spostata in Bollettato', timestamp: new Date().toISOString() });
  }
  
  saveLocal(); syncCardToCloud(card);
}

function printCard() {
  const card = state.cards.find(c => c.id === activeCardId); if (!card) return; 
  const printWindow = window.open('', '_blank'); if (!printWindow) { alert("⚠️ ATTENZIONE: Il pop-up per la stampa è stato bloccato dal browser."); return; }
  const deliveryStr = card.deliveryDate ? new Date(card.deliveryDate).toLocaleDateString('it-IT') : 'Non specificata';
  const historyHtml = (card.history || []).map((h, i) => { return `<div style="margin-bottom: 8px; padding-left: 12px; border-left: 2px solid #cbd5e1; position: relative;"><div style="position: absolute; left: -5px; top: 2px; width: 8px; height: 8px; border-radius: 50%; background: #475569;"></div><div style="font-weight: bold; font-size: 11px; color: #1e293b;">Passaggio #${i+1}: ${h.label}</div><div style="font-size: 9px; color: #64748b;">Data: ${new Date(h.timestamp).toLocaleString('it-IT')}</div></div>`; }).join('');

  let articlesRowsHtml = ''; let grandSubtotal = 0; let grandTax = 0; let grandTotalTaxed = 0;
  if (card.articles && card.articles.length > 0) { card.articles.forEach(art => { const qty = parseFloat(art.qty) || 0; const price = parseFloat(art.price) || 0; const taxRate = parseFloat(art.tax) !== undefined && !isNaN(parseFloat(art.tax)) ? parseFloat(art.tax) : 22; const sub = qty * price; const taxAmt = sub * (taxRate / 100); const rowTotalTaxed = sub + taxAmt; const unitTaxed = price * (1 + taxRate / 100); grandSubtotal += sub; grandTax += taxAmt; grandTotalTaxed += rowTotalTaxed; articlesRowsHtml += `<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-family: monospace; font-size: 11px; color: #334155;">${art.code || '-'}</td><td style="padding: 8px; font-size: 11px; color: #0f172a;">${art.desc || '-'}</td><td style="padding: 8px; text-align: center; font-size: 11px; color: #334155;">${art.qty !== undefined && art.qty !== '' ? art.qty : '-'}</td><td style="padding: 8px; text-align: right; font-size: 11px; color: #334155;">${art.price !== undefined && art.price !== '' ? '€ ' + parseFloat(art.price).toFixed(2) : '-'}</td><td style="padding: 8px; text-align: center; font-size: 11px; color: #334155;">${taxRate}%</td><td style="padding: 8px; text-align: right; font-size: 11px; color: #334155;">${(art.qty !== undefined && art.price !== undefined && art.qty !== '' && art.price !== '') ? '€ ' + unitTaxed.toFixed(2) : '-'}</td><td style="padding: 8px; text-align: right; font-size: 11px; font-weight: bold; color: #0f172a;">${(art.qty !== undefined && art.price !== undefined && art.qty !== '' && art.price !== '') ? '€ ' + rowTotalTaxed.toFixed(2) : '-'}</td></tr>`; }); } 
  else { articlesRowsHtml = `<tr><td colspan="7" style="padding: 10px; text-align: center; color: #64748b; font-size: 11px;">Nessun articolo inserito</td></tr>`; }

  let attachmentsPrintHtml = ''; if (card.photos && card.photos.length > 0) { attachmentsPrintHtml = card.photos.map((p, idx) => { return `<div class="print-page"><img src="${p.image}" style="transform: rotate(${p.rotation || 0}deg);"></div>`; }).join(''); }
  
  const stageObj = COLUMNS_CONFIG.find(col => col.id === card.stage); const stageLabel = stageObj ? stageObj.label.toUpperCase() : card.stage.toUpperCase(); const cardIdLabel = card.id ? card.id.slice(-4).toUpperCase() : 'N/D'; const cardDateLabel = card.createdAt ? new Date(card.createdAt).toLocaleDateString('it-IT') : '-';

  printWindow.document.write(`<!DOCTYPE html><html><head><title>Commessa SGA #${cardIdLabel}</title><style>
      @page { size: auto; margin: 0mm; } body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; color: #0f172a; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .sheet { width: 100%; min-height: 100vh; padding: 12mm 15mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; } .header { border-bottom: 3px solid #4f46e5; padding-bottom: 12mm; margin-bottom: 20px; } .logo-text { font-size: 12px; color: #64748b; font-weight: bold; letter-spacing: 1px; margin-bottom: 3px; } .title { font-size: 22px; font-weight: 800; margin: 0 0 5px; color: #1e293b; text-transform: uppercase; } .badge { font-size: 10px; font-weight: bold; background: #e0e7ff; color: #4338ca; padding: 3px 8px; border-radius: 4px; display: inline-block; } .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #475569; margin-top: 15px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; } .details { display: grid; grid-template-columns: 1fr 1fr; gap: 12mm; margin-bottom: 10px; } .details div { background: #f8fafc; padding: 8px 10px; border-radius: 6px; border: 1px solid #e2e8f0; } .details label { font-size: 9px; color: #64748b; font-weight: bold; display: block; text-transform: uppercase; margin-bottom: 2px; } .details strong { font-size: 12px; color: #0f172a; } table.articles { width: 100%; border-collapse: collapse; margin-top: 5px; } table.articles th { background: #f1f5f9; color: #334155; font-size: 10px; text-transform: uppercase; padding: 6px 8px; text-align: left; border-bottom: 2px solid #cbd5e1; } .print-page { page-break-before: always; break-before: page; width: 100%; height: 98vh; display: block; text-align: center; padding: 0; margin: 0; box-sizing: border-box; } .print-page img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; margin: 0 auto; }
    </style></head><body><div class="sheet"><div><div class="header"><div style="display: flex; justify-content: space-between; align-items: start;"><div><div class="logo-text">SGA STUDIO GRAFICO ASSOCIATO</div><h1 class="title">SCHEDA COMMESSA</h1><span class="badge">STATO: ${stageLabel}</span></div><div style="text-align: right; font-size: 11px; color: #64748b; line-height: 1.3;">Rif. Ordine: <strong style="color: #0f172a;">#${cardIdLabel}</strong><br>Data: <strong style="color: #0f172a;">${cardDateLabel}</strong></div></div></div><div class="details"><div><label>Cliente / Azienda</label><strong>${card.title || '-'}</strong></div><div><label>Tipo Lavorazione</label><strong>${card.jobType || '-'} ${card.machine ? ' | Macchina: ' + card.machine : ''}</strong></div><div><label>Referente & Contatti</label><strong>${card.client || 'N/D'} ${card.referent ? '(' + card.referent + ')' : ''}</strong></div><div><label>Data di Consegna</label><strong style="color: #ea580c;">${deliveryStr}</strong></div></div><div class="section-title">Articoli & Specifiche Lavorazione</div><table class="articles"><thead><tr><th style="width: 20%;">Codice</th><th>Descrizione</th><th style="width: 10%; text-align: center;">Q.tà</th><th style="width: 13%; text-align: right;">Prezzo Un.</th><th style="width: 8%; text-align: center;">IVA</th><th style="width: 13%; text-align: right;">Pr. Ivato</th><th style="width: 15%; text-align: right;">Tot. Ivato</th></tr></thead><tbody>${articlesRowsHtml}</tbody></table><div style="text-align: right; margin-top: 10px; font-size: 12px; color: #475569;">Imponibile: € ${grandSubtotal.toFixed(2)} &nbsp;|&nbsp; Totale IVA: € ${grandTax.toFixed(2)}</div><div style="text-align: right; margin-top: 4px; font-size: 14px;"><strong>Totale Ordine Ivato: <span style="color: #059669;">€ ${grandTotalTaxed.toFixed(2)}</span></strong></div></div><div><div class="section-title">Storyboard Lavorazione</div><div style="background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">${historyHtml}</div></div></div>${attachmentsPrintHtml}</body></html>`);
  printWindow.document.close(); setTimeout(() => { printWindow.focus(); printWindow.print(); }, 800);
}

function addAlarmRule() { USER_ALARMS.push({ id: 'a' + Date.now(), time: "09:00", active: true, days: [1, 2, 3, 4, 5] }); renderAlarmsList(); }
function removeAlarmRule(id) { const a = USER_ALARMS.find(x => x.id === id); if(!a) return; confirmDeletion(`Sveglia delle ore ${a.time}`, () => { USER_ALARMS = USER_ALARMS.filter(x => x.id !== id); renderAlarmsList(); }); }
function updateAlarmTime(id, val) { const alarm = USER_ALARMS.find(a => a.id === id); if (alarm) alarm.time = val; }
function toggleAlarmActive(id, val) { const alarm = USER_ALARMS.find(a => a.id === id); if (alarm) alarm.active = val; }
function toggleAlarmDay(id, dayVal) { playSound('click'); const alarm = USER_ALARMS.find(a => a.id === id); if (alarm) { if (!Array.isArray(alarm.days)) alarm.days = []; const index = alarm.days.indexOf(dayVal); if (index >= 0) alarm.days.splice(index, 1); else alarm.days.push(dayVal); renderAlarmsList(); } }

function renderAlarmsList() {
  const container = document.getElementById('alarmsListContainer'); if (!container) return; container.innerHTML = '';
  if (USER_ALARMS.length === 0) { container.innerHTML = `<p class="text-xs text-slate-500 italic py-3 text-center">Nessuna sveglia impostata.</p>`; return; }
  const daysDef = [{val:1,label:"L"},{val:2,label:"M"},{val:3,label:"M"},{val:4,label:"G"},{val:5,label:"V"},{val:6,label:"S"},{val:0,label:"D"}];
  USER_ALARMS.forEach(alarm => {
    const card = document.createElement('div'); card.className = "bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-3";
    let daysBtnsHtml = daysDef.map(d => { const isSelected = Array.isArray(alarm.days) && alarm.days.includes(d.val); const btnClass = isSelected ? "w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow cursor-pointer transition-all" : "w-7 h-7 rounded-full bg-slate-950 text-slate-400 font-semibold text-xs flex items-center justify-center border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"; return `<button type="button" onclick="toggleAlarmDay('${alarm.id}', ${d.val})" class="${btnClass}">${d.label}</button>`; }).join('');
    card.innerHTML = `<div class="flex items-center justify-between gap-3"><div class="flex items-center gap-3"><input type="time" value="${alarm.time || '09:00'}" onchange="updateAlarmTime('${alarm.id}', this.value)" class="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-base text-emerald-400 font-mono font-bold focus:outline-none focus:border-indigo-500"><label class="flex items-center cursor-pointer select-none text-xs text-slate-300 gap-1.5"><input type="checkbox" ${alarm.active ? 'checked' : ''} onchange="toggleAlarmActive('${alarm.id}', this.checked)" class="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 cursor-pointer"><span>Attiva</span></label></div><button onclick="removeAlarmRule('${alarm.id}')" class="text-red-400 hover:text-red-300 p-1.5 rounded-lg bg-red-950/35 hover:bg-red-950/60 transition-colors cursor-pointer"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div><div class="flex items-center justify-between pt-1 border-t border-slate-800/60 flex-wrap gap-2"><span class="text-[10px] text-slate-400 uppercase font-semibold">Giorni attivo:</span><div class="flex gap-1.5">${daysBtnsHtml}</div></div>`;
    container.appendChild(card);
  });
  lucide.createIcons();
}

function openModal(modalId) { document.getElementById(modalId).classList.remove('hidden'); }
function closeModal(modalId) { document.getElementById(modalId).classList.add('hidden'); }

function deleteArchivedCard(cardId) { const card = state.cards.find(c => c.id === cardId); if (!card) return; confirmDeletion(`Sei sicuro di voler eliminare DEFINITIVAMENTE l'ordine "${card.title}" dall'archivio? Questa operazione non è reversibile.`, () => { state.cards = state.cards.filter(c => c.id !== cardId); saveLocal(); syncDeleteToCloud(cardId); const searchInput = document.getElementById('archiveSearchInput'); filterArchive(searchInput ? searchInput.value : ''); updateStorageIndicator(); }); }

function updateStorageIndicator() {
  const indicator = document.getElementById('storageUsageIndicator'); if (!indicator) return; let lsTotal = 0;
  for (let x in localStorage) { if (!localStorage.hasOwnProperty(x)) continue; lsTotal += ((localStorage[x].length + x.length) * 2); }
  const kbTotal = (lsTotal / 1024).toFixed(2); const maxKb = 5120; const percentage = ((kbTotal / maxKb) * 100).toFixed(1); indicator.innerText = `${percentage}% (${kbTotal} KB)`;
  if (percentage > 80) { indicator.classList.replace('text-emerald-400', 'text-red-500'); indicator.classList.add('animate-pulse'); } else if (percentage > 50) { indicator.classList.replace('text-emerald-400', 'text-yellow-400'); } else { indicator.classList.replace('text-red-500', 'text-emerald-400'); indicator.classList.replace('text-yellow-400', 'text-emerald-400'); indicator.classList.remove('animate-pulse'); }
}

function filterArchive(val) { const list = document.getElementById('archiveSettingsList'); if (list) { list.innerHTML = renderArchiveList(val); lucide.createIcons(); } }

function renderArchiveList(query = '') {
  const q = query.toLowerCase().trim(); let archived = state.cards.filter(c => c.stage === 'archiviato');
  if (q) archived = archived.filter(c => (c.title||'').toLowerCase().includes(q) || (c.client||'').toLowerCase().includes(q));
  archived.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (archived.length === 0) return '<p class="text-xs text-slate-500 italic py-4 text-center">Nessuna commessa in archivio.</p>';
  return archived.map(c => `<div class="bg-slate-950 p-3 rounded-lg border border-slate-800 hover:border-slate-500/50 transition-colors group flex justify-between items-center"><div onclick="openDetail('${c.id}')" class="flex-1 cursor-pointer"><h5 class="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">${c.title}</h5><div class="text-[10px] text-slate-400 mt-0.5">Cliente: <span class="text-indigo-300 font-semibold">${c.client || 'N/D'}</span> | Inserimento: ${new Date(c.createdAt).toLocaleDateString('it-IT')}</div></div><div class="flex items-center gap-2"><button onclick="openDetail('${c.id}')" class="text-slate-600 hover:text-indigo-400 p-1.5 transition-colors cursor-pointer" title="Apri Dettaglio"><i data-lucide="external-link" class="w-4 h-4"></i></button><button onclick="deleteArchivedCard('${c.id}')" class="text-slate-600 hover:text-red-400 p-1.5 transition-colors cursor-pointer" title="Elimina Definitivamente"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div></div>`).join('');
}

function printArchiveReport() {
  const archivedCards = state.cards.filter(c => c.stage === 'archiviato'); if (archivedCards.length === 0) { alert("Nessuna commessa in archivio da stampare."); return; }
  const printWindow = window.open('', '_blank'); if (!printWindow) { alert("⚠️ ATTENZIONE: Il pop-up per la stampa è stato bloccato dal browser."); return; }
  let rowsHtml = ''; let grandTotalNet = 0; let grandTotalTax = 0; let grandTotalGross = 0;

  archivedCards.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(card => {
    let cardNet = 0; let cardTax = 0; let cardGross = 0;
    if (card.articles && card.articles.length > 0) { card.articles.forEach(art => { const qty = parseFloat(art.qty) || 0; const price = parseFloat(art.price) || 0; const taxRate = parseFloat(art.tax) !== undefined && !isNaN(parseFloat(art.tax)) ? parseFloat(art.tax) : 22; const sub = qty * price; const taxAmt = sub * (taxRate / 100); cardNet += sub; cardTax += taxAmt; cardGross += (sub + taxAmt); }); }
    grandTotalNet += cardNet; grandTotalTax += cardTax; grandTotalGross += cardGross;
    const dateStr = card.createdAt ? new Date(card.createdAt).toLocaleDateString('it-IT') : '-';
    rowsHtml += `<tr><td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0;">${dateStr}</td><td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${card.title}</td><td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0;">${card.client || '-'}</td><td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">€ ${cardNet.toFixed(2)}</td><td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0f172a;">€ ${cardGross.toFixed(2)}</td></tr>`;
  });

  printWindow.document.write(`<!DOCTYPE html><html><head><title>Report Archivio Fatturato SGA</title><style>
      @page { size: A4 portrait; margin: 15mm; } body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; color: #0f172a; font-size: 11px; } .header { border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-bottom: 20px; text-align: center;} .title { font-size: 18px; font-weight: 800; margin: 0 0 5px; color: #1e293b; text-transform: uppercase; } .subtitle { color: #64748b; font-size: 11px; } table { width: 100%; border-collapse: collapse; margin-bottom: 20px; } th { background: #f1f5f9; color: #334155; font-size: 10px; text-transform: uppercase; padding: 8px; text-align: left; border-bottom: 2px solid #cbd5e1; } .totals-box { width: 100%; border: 2px solid #e2e8f0; border-radius: 8px; padding: 15px; display: flex; justify-content: space-around; background: #f8fafc; margin-top: 20px; page-break-inside: avoid; } .totals-box div { text-align: center; } .totals-box label { display: block; font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 5px; } .totals-box span { font-size: 16px; font-weight: bold; color: #0f172a; } .totals-box .highlight span { color: #059669; font-size: 18px; }
    </style></head><body><div class="header"><h1 class="title">Report Archivio Commesse Fatturate</h1><div class="subtitle">SGA Studio Grafico Associato - Generato il ${new Date().toLocaleString('it-IT')}</div></div><table><thead><tr><th style="width: 15%;">Data</th><th style="width: 35%;">Titolo Commessa</th><th style="width: 25%;">Cliente</th><th style="width: 12%; text-align: right;">Imponibile</th><th style="width: 13%; text-align: right;">Tot. Ivato</th></tr></thead><tbody>${rowsHtml}</tbody></table><div class="totals-box"><div><label>Totale Imponibile</label><span>€ ${grandTotalNet.toFixed(2)}</span></div><div><label>Totale IVA</label><span>€ ${grandTotalTax.toFixed(2)}</span></div><div class="highlight"><label>Fatturato Totale (Ivato)</label><span>€ ${grandTotalGross.toFixed(2)}</span></div></div></body></html>`);
  printWindow.document.close(); setTimeout(() => { printWindow.focus(); printWindow.print(); }, 800);
}