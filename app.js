  // ==========================================
// CONFIGURAZIONE FIREBASE HARDCODED
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAVbSA7g_08qp3C4KVXPqaPGf1YCqsT7Ag",
  authDomain: "workflow-sga.firebaseapp.com",
  projectId: "workflow-sga",
  storageBucket: "workflow-sga.firebasestorage.app"
};

// ==========================================
// CHIAVE IMGBB (FOTO 4K)
// ==========================================
const IMGBB_API_KEY = "4452dd184d4f0efb701cba820e8c8f81";

// ==========================================
// STILI DINAMICI PER ZOOM TESTO FLUIDO (MASTER & APP VIEW)
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

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();

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
window.tempLabelArticles = [];

let arcadeTimer = null;
let sirenInterval = null;
let activeLabelCardId = null;

const DEFAULT_COLUMNS_CONFIG = [
  { id: "prev-da-fare", label: "Prev. da fare", color: "bg-orange-600/20 border-orange-500/50 text-orange-400", border: "border-l-4 border-l-orange-500", hexDefault: "#c2410c" },
  { id: "prev-inviato", label: "Prev. inviato", color: "bg-amber-600/20 border-amber-500/50 text-amber-400", border: "border-l-4 border-l-amber-500", hexDefault: "#d97706" },
  { id: "da-ordinare", label: "Da ordinare", color: "bg-rose-600/20 border-rose-500/50 text-rose-400", border: "border-l-4 border-l-rose-500", hexDefault: "#e11d48" },
  { id: "ordinato", label: "Ordinato", color: "bg-pink-600/20 border-pink-500/50 text-pink-400", border: "border-l-4 border-l-pink-500", hexDefault: "#db2777" },
  { id: "magazzino", label: "In magazzino", color: "bg-fuchsia-600/20 border-fuchsia-500/50 text-fuchsia-400", border: "border-l-4 border-l-fuchsia-500", hexDefault: "#c026d3" },
  { id: "da-lavorare", label: "Da lavorare", color: "bg-violet-600/20 border-violet-500/50 text-violet-400", border: "border-l-4 border-l-violet-500", hexDefault: "#7c3aed" },
  { id: "in-lavorazione", label: "In lavorazione", color: "bg-cyan-600/20 border-cyan-500/50 text-cyan-400", border: "border-l-4 border-l-cyan-500", hexDefault: "#0891b2" },
  { id: "lavorato-da-bollettare", label: "Lavorato da bollettare", color: "bg-emerald-600/20 border-emerald-500/50 text-emerald-400", border: "border-l-4 border-l-emerald-500", hexDefault: "#059669" },
  { id: "bollettato-da-consegnare", label: "Bollettato da consegnare", color: "bg-teal-600/20 border-teal-500/50 text-teal-400", border: "border-l-4 border-l-teal-500", hexDefault: "#0d9488" },
  { id: "fatturato", label: "Fatturato", color: "bg-blue-600/20 border-blue-500/50 text-blue-400", border: "border-l-4 border-l-blue-500", hexDefault: "#2563eb" }
];

const DEFAULT_MSG_TEMPLATE = `Buongiorno {SALUTO},\n\nquesto è il sistema di automazione di SGA Studio Grafico Associato.\n\nVolevamo comunicarle che l'ordine da lei effettuato ("{TITOLO}"){ARTICOLI}\n\nè pronto per il ritiro.\n\nCordiali saluti,\nSGA Studio Grafico Associato`;

let COLUMNS_CONFIG = JSON.parse(JSON.stringify(DEFAULT_COLUMNS_CONFIG));
let USER_ALARMS = []; 
let CLIENTS_DB = [];
let ARTICLES_DB = []; // Database articoli
let MACHINES_DB = ["Roland TrueVIS SG2-540", "Epson SureColor T7200", "Epson F1000 DTF", "Xerox PrimeLink C9200", "Happy Japan HCH Embroidery"];
let masterFontSizePx = 24; 
let appFontSizePx = 15;
let sharedCompanyLogo = "";
let sharedMsgTemplate = "";
let activeSubSettingsType = null;
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
  if (confirm("Vuoi disconnetterti da SGA Workflow?")) {
    auth.signOut();
  }
}

function checkAutoArchive() {
  const now = Date.now();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  let localMigrated = false;
  
  state.cards.forEach(card => {
    if (card.stage === 'fatturato') {
      let fatturatoTime = card.createdAt; 
      if (card.history && card.history.length > 0) {
        const lastFatturato = [...card.history].reverse().find(h => h.stage === 'fatturato');
        if (lastFatturato && lastFatturato.timestamp) {
          fatturatoTime = lastFatturato.timestamp;
        }
      }
      
      if ((now - new Date(fatturatoTime).getTime()) > SEVEN_DAYS) {
        card.stage = 'archiviato';
        if (!card.history) card.history = [];
        card.history.push({ stage: 'archiviato', label: 'Archiviata automaticamente (7+ giorni in Fatturato)', timestamp: new Date().toISOString() });
        localMigrated = true;
        syncCardToCloud(card);
      }
    }
  });
  
  if (localMigrated) saveLocal();
}

function init() {
  loadUserSettings(); 
  loadState(); 
  let localMigrated = false;
  state.cards.forEach(c => { 
    if (c.stage === 'lavorato') { c.stage = 'lavorato-da-bollettare'; localMigrated = true; } 
    if (c.stage === 'consegnato') { c.stage = 'bollettato-da-consegnare'; localMigrated = true; } 
  });
  state.cards.sort((a,b) => (a.order || 0) - (b.order || 0)); 
  if (localMigrated) { saveLocal(); state.cards.forEach(c => syncCardToCloud(c)); }
  
  checkAutoArchive();
  setInterval(checkAutoArchive, 60 * 60 * 1000);

  renderBoard(); 
  updateCloudStatus(true); 
  listenToCloudUpdates(); 
  lucide.createIcons(); 
  
  const cfgImgbbKeyInput = document.getElementById('cfgImgbbKey');
  if (cfgImgbbKeyInput && IMGBB_API_KEY !== "INSERISCI_QUI_LA_TUA_CHIAVE_IMGBB") {
    cfgImgbbKeyInput.value = IMGBB_API_KEY;
    cfgImgbbKeyInput.disabled = true;
  }
}

// ==========================================
// FUNZIONI CORE (Orologio, Suoni, Avvisi)
// ==========================================
function updateLiveClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  const timeEl = document.getElementById('headerClockTime');
  const dateEl = document.getElementById('headerClockDate');
  if (timeEl) timeEl.innerText = timeStr;
  if (dateEl) dateEl.innerText = dateStr;
  checkScheduledAlarms(now);
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

  const cardsToDisplay = urgentCards.length > 0 ? urgentCards : state.cards.filter(card => card.stage !== 'bollettato-da-consegnare' && card.stage !== 'fatturato' && card.stage !== 'archiviato');
  if (cardsToDisplay.length > 0) showArcadeAlert(cardsToDisplay);
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
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(300, now + 0.05); gain.gain.setValueAtTime(0.15, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.05); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'close') {
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(440, now); osc.frequency.exponentialRampToValueAtTime(220, now + 0.12); gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.12); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now + 0.12);
    } else if (type === 'success') {
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = 'triangle'; osc.frequency.setValueAtTime(523.25, now); osc.frequency.setValueAtTime(659.25, now + 0.08); osc.frequency.setValueAtTime(783.99, now + 0.16); gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.3); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'alert') {
      if (sirenInterval) clearInterval(sirenInterval);
      let startTime = Date.now();
      sirenInterval = setInterval(() => {
        if (Date.now() - startTime > 2500) { clearInterval(sirenInterval); sirenInterval = null; return; }
        try { const sNow = audioCtx.currentTime; const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(350, sNow); osc.frequency.linearRampToValueAtTime(880, sNow + 0.35); osc.frequency.linearRampToValueAtTime(350, sNow + 0.7); gain.gain.setValueAtTime(0.25, sNow); gain.gain.linearRampToValueAtTime(0.01, sNow + 0.7); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(sNow); osc.stop(sNow + 0.7); } catch(e){}
      }, 700);
    } else if (type === 'delete') {
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = 'square'; osc.frequency.setValueAtTime(250, now); osc.frequency.linearRampToValueAtTime(80, now + 0.2); gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.2); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now + 0.2);
    }
  } catch (e) { console.error(e); }
}

let state = { cards: [] };
let activeCardId = null;
let currentGalleryIndex = 0;
let tempFormFile = null;

function confirmDeletion(message, onConfirmCallback) {
  playSound('click');
  document.getElementById('deleteConfirmText').innerText = message;
  const confirmBtn = document.getElementById('btnConfirmDelete');
  confirmBtn.onclick = () => { playSound('delete'); onConfirmCallback(); closeModal('deleteConfirmModal'); };
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
    if (logoImg) { logoImg.src = sharedCompanyLogo; logoImg.classList.remove('hidden'); }
    if (logoContainer) { logoContainer.classList.remove('bg-indigo-600'); logoContainer.style.background = 'transparent'; }
    
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
    loadCompanyLogo(); playSound('success');
    if (db) db.collection('workflow_sga_settings').doc('config').set({ companyLogo: sharedCompanyLogo }, { merge: true }).catch(e => console.error(e));
    alert("Logo aziendale caricato e condiviso con successo!");
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function loadUserSettings() {
  const localLogo = localStorage.getItem('workflow_sga_company_logo');
  if (localLogo) sharedCompanyLogo = localLogo;

  const localMsg = localStorage.getItem('workflow_sga_msg_template');
  if (localMsg) sharedMsgTemplate = localMsg; else sharedMsgTemplate = DEFAULT_MSG_TEMPLATE;

  const savedCols = localStorage.getItem('workflow_sga_columns_config');
  if (savedCols) {
    try { 
      const parsedCols = JSON.parse(savedCols);
      COLUMNS_CONFIG = parsedCols;
    } catch(e) { COLUMNS_CONFIG = JSON.parse(JSON.stringify(DEFAULT_COLUMNS_CONFIG)); }
  } else { COLUMNS_CONFIG = JSON.parse(JSON.stringify(DEFAULT_COLUMNS_CONFIG)); }

  const savedAlarms = localStorage.getItem('workflow_sga_alarms');
  if (savedAlarms) {
    try { USER_ALARMS = JSON.parse(savedAlarms); } catch(e){ USER_ALARMS = []; }
  }

  const savedClients = localStorage.getItem('workflow_sga_clients_db');
  if (savedClients) { 
    try { CLIENTS_DB = JSON.parse(savedClients); } catch(e) { CLIENTS_DB = []; } 
  }

  // Caricamento database articoli
  const savedArticles = localStorage.getItem('workflow_sga_articles_db');
  if (savedArticles) {
    try { ARTICLES_DB = JSON.parse(savedArticles); } catch(e) { ARTICLES_DB = []; }
  }

  const savedMachines = localStorage.getItem('workflow_sga_machines_db');
  if (savedMachines) { try { MACHINES_DB = JSON.parse(savedMachines); } catch(e){} }
  
  const savedMasterFont = localStorage.getItem('workflow_sga_master_fontsize_px');
  if (savedMasterFont) masterFontSizePx = parseInt(savedMasterFont);
  applyMasterFontSize(masterFontSizePx);

  const savedAppFont = localStorage.getItem('workflow_sga_app_fontsize_px');
  if (savedAppFont) appFontSizePx = parseInt(savedAppFont);
  applyAppFontSize(appFontSizePx);

  loadCompanyLogo(); populateMachinesDropdowns(); populateGlobalFilterDropdown(); populateClientSelectors();
}

function applyMasterFontSize(pxVal) {
  masterFontSizePx = pxVal; document.documentElement.style.setProperty('--master-font-size', pxVal + 'px');
}
function applyAppFontSize(pxVal) {
  appFontSizePx = pxVal; document.documentElement.style.setProperty('--app-font-size', pxVal + 'px');
}
function updateMasterSpeed(val) { masterScrollSpeed = parseFloat(val); }

function syncClientsToCloud() { if (db) db.collection('workflow_sga_settings').doc('clients').set({ db: CLIENTS_DB }).catch(err => console.error(err)); }
function syncArticlesToCloud() { if (db) db.collection('workflow_sga_settings').doc('articles').set({ db: ARTICLES_DB }).catch(err => console.error(err)); }

function registerClientAdvanced(name, referent, email, whatsapp) {
  if (!name || !name.trim()) return;
  const cleanName = name.trim(); const cleanRef = referent ? referent.trim() : '';
  const existing = CLIENTS_DB.find(c => c.name.toLowerCase() === cleanName.toLowerCase() && (c.referent || '').toLowerCase() === cleanRef.toLowerCase());
  
  if (!existing) {
    const newId = 'crm_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    CLIENTS_DB.push({ id: newId, name: cleanName, referent: cleanRef, email: email ? email.trim() : '', whatsapp: whatsapp ? whatsapp.trim() : '' }); 
  }
  
  CLIENTS_DB.sort((a,b) => a.name.localeCompare(b.name));
  localStorage.setItem('workflow_sga_clients_db', JSON.stringify(CLIENTS_DB));
  populateClientSelectors(); syncClientsToCloud();
}

// Funzione per registrare/aggiornare il database articoli dalle impostazioni
function registerArticleDb(code, desc, price) {
  if (!code && !desc) return;
  const cleanCode = code ? code.trim() : '';
  const cleanDesc = desc ? desc.trim() : '';
  const cleanPrice = parseFloat(price) || 0;

  if (!cleanCode) return;

  const existing = ARTICLES_DB.find(a => a.code.toLowerCase() === cleanCode.toLowerCase());
  if (existing) {
    if (cleanDesc) existing.desc = cleanDesc;
    if (cleanPrice > 0) existing.price = cleanPrice;
  } else {
    ARTICLES_DB.push({ id: 'art_' + Date.now().toString(36), code: cleanCode, desc: cleanDesc, price: cleanPrice });
  }
  localStorage.setItem('workflow_sga_articles_db', JSON.stringify(ARTICLES_DB));
  syncArticlesToCloud();
}

function populateClientSelectors() {
  const editSelector = document.getElementById('editClientSelector'); const formSelector = document.getElementById('formClientSelector');
  let optionsHtml = `<option value="">-- Seleziona dal CRM --</option>`;
  CLIENTS_DB.forEach(c => { let label = c.name; if (c.referent) label += ` (${c.referent})`; optionsHtml += `<option value="${c.id}">${label}</option>`; });
  if (editSelector) { editSelector.innerHTML = optionsHtml; editSelector.value = ''; }
  if (formSelector) { formSelector.innerHTML = optionsHtml; formSelector.value = ''; }
}

function autofillClientFromSelect(clientId, prefix) {
  if (!clientId) return;
  playSound('click');
  const c = CLIENTS_DB.find(client => client.id === clientId); if (!c) return;
  const titleEl = document.getElementById(prefix + 'Title'); const refEl = document.getElementById(prefix + 'Referent'); const emailEl = document.getElementById(prefix + 'Email'); const waEl = document.getElementById(prefix + 'Whatsapp');
  if (titleEl) titleEl.value = c.name || ''; if (refEl) refEl.value = c.referent || ''; if (emailEl) emailEl.value = c.email || ''; if (waEl) waEl.value = c.whatsapp || '';
  const sugContainer = document.getElementById(prefix + 'ClientSuggestions'); if (sugContainer) sugContainer.classList.add('hidden');
}

function handleClientInput(query, containerId, refInputId, emailInputId, waInputId) {
  const container = document.getElementById(containerId); if (!container) return;
  const q = query.toLowerCase().trim();
  if (!q) { container.classList.add('hidden'); container.innerHTML = ''; return; }
  const matches = CLIENTS_DB.filter(c => c.name.toLowerCase().includes(q) || (c.referent && c.referent.toLowerCase().includes(q)));
  if (matches.length === 0) { container.classList.add('hidden'); container.innerHTML = ''; return; }
  container.innerHTML = matches.map(m => `<div onclick="selectClientSuggestion('${m.name.replace(/'/g, "\\'")}', '${m.referent.replace(/'/g, "\\'")}', '${m.email}', '${m.whatsapp}', '${containerId}', '${refInputId}', '${emailInputId}', '${waInputId}')" class="px-3 py-2 hover:bg-indigo-600/30 text-slate-200 cursor-pointer text-xs border-b border-slate-800/60 last:border-0 truncate"><span class="font-bold text-white">${m.name}</span> ${m.referent ? `<span class="text-indigo-300">(${m.referent})</span>` : ''}</div>`).join('');
  container.classList.remove('hidden');
}

function selectClientSuggestion(name, referent, email, whatsapp, containerId, refInputId, emailInputId, waInputId) {
  const clientInputId = containerId === 'formClientSuggestions' ? 'formTitle' : 'editTitle';
  document.getElementById(clientInputId).value = name;
  if (refInputId && document.getElementById(refInputId)) document.getElementById(refInputId).value = referent || '';
  if (emailInputId && document.getElementById(emailInputId)) document.getElementById(emailInputId).value = email || '';
  if (waInputId && document.getElementById(waInputId)) document.getElementById(waInputId).value = whatsapp || '';
  document.getElementById(containerId).classList.add('hidden');
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
  const select = document.getElementById('globalFilterType'); if (!select) return;
  let typesSet = new Set(); state.cards.forEach(c => { if (c.jobType) typesSet.add(c.jobType); });
  select.innerHTML = `<option value="">Tutte le lavorazioni</option>` + Array.from(typesSet).map(t => `<option value="${t}" ${globalFilterJobType === t ? 'selected' : ''}>${t}</option>`).join('');
}

function handleGlobalSearch(val) {
  globalSearchQuery = val.trim().toLowerCase();
  const clearBtn = document.getElementById('btnClearSearch');
  if (clearBtn) { if (globalSearchQuery) clearBtn.classList.remove('hidden'); else clearBtn.classList.add('hidden'); }
  renderBoard();
}
function handleGlobalFilterChange() { globalFilterJobType = document.getElementById('globalFilterType').value; renderBoard(); }
function clearGlobalSearch() { document.getElementById('globalSearchInput').value = ''; globalSearchQuery = ''; document.getElementById('btnClearSearch').classList.add('hidden'); renderBoard(); }

function openSettingsModal() { openModal('settingsModal'); }

// Render della schermata Gestione Articoli nelle Impostazioni
function renderArticlesSettingsList() {
  return ARTICLES_DB.length === 0 ? '<p class="text-xs text-slate-500 italic py-2">Nessun articolo in database.</p>' : 
  ARTICLES_DB.map((art, idx) => `
    <div class="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800 text-xs">
      <div>
        <span class="font-mono font-bold text-indigo-300">[${art.code}]</span> <span class="text-white font-medium">${art.desc}</span>
        <div class="text-[10px] text-slate-400">Prezzo: € ${(parseFloat(art.price) || 0).toFixed(2)}</div>
      </div>
      <div class="flex items-center gap-1">
        <button onclick="editArticleDbModal(${idx})" class="text-slate-400 hover:text-white p-1 cursor-pointer"><i data-lucide="edit" class="w-3.5 h-3.5"></i></button>
        <button onclick="removeArticleDb(${idx})" class="text-slate-600 hover:text-red-400 p-1 cursor-pointer"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
      </div>
    </div>
  `).join('');
}

function addOrUpdateArticleFromSettings() {
  const code = document.getElementById('artModalCode').value.trim();
  const desc = document.getElementById('artModalDesc').value.trim();
  const price = document.getElementById('artModalPrice').value.trim();
  if (!code) return alert("Inserisci il codice articolo.");
  
  registerArticleDb(code, desc, price);
  openSubSettings('articles_mgmt');
  playSound('success');
}

function removeArticleDb(idx) {
  confirmDeletion("Articolo da database", () => {
    ARTICLES_DB.splice(idx, 1);
    localStorage.setItem('workflow_sga_articles_db', JSON.stringify(ARTICLES_DB));
    syncArticlesToCloud();
    openSubSettings('articles_mgmt');
  });
}

function editArticleDbModal(idx) {
  const art = ARTICLES_DB[idx];
  if (!art) return;
  document.getElementById('artModalCode').value = art.code;
  document.getElementById('artModalDesc').value = art.desc;
  document.getElementById('artModalPrice').value = art.price;
  ARTICLES_DB.splice(idx, 1); // Rimuove temporaneamente per aggiornare
}

function openSubSettings(type) {
  activeSubSettingsType = type; const titleEl = document.getElementById('subSettingsTitle'); const contentEl = document.getElementById('subSettingsContent'); contentEl.innerHTML = '';
  if (type === 'crm') {
    window.editingClientId = null;
    titleEl.innerHTML = `<i data-lucide="users" class="w-5 h-5 text-indigo-400"></i> Gestione Clienti (CRM)`;
    contentEl.innerHTML = `<div class="space-y-4"><p class="text-xs text-slate-400">Gestisci l'anagrafica clienti con azienda, referente, email e WhatsApp:</p><div class="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2.5"><h5 class="text-xs font-bold text-indigo-400 uppercase">Aggiungi / Modifica Cliente</h5><div class="grid grid-cols-2 gap-2"><input type="text" id="crmModalName" placeholder="Azienda / Cliente *" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"><input type="text" id="crmModalRef" placeholder="Referente" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"></div><div class="grid grid-cols-2 gap-2"><input type="email" id="crmModalEmail" placeholder="Email" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"><input type="text" id="crmModalWa" placeholder="WhatsApp" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"></div><button type="button" id="btnSaveCrmClient" onclick="addClientFromSettings()" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded font-semibold w-full cursor-pointer transition-colors">Salva Cliente in Archivio</button></div><div id="settingsClientsList" class="space-y-1.5 max-h-44 overflow-y-auto pr-1">${renderCrmSettingsList()}</div></div>`;
  } else if (type === 'articles_mgmt') {
    titleEl.innerHTML = `<i data-lucide="package" class="w-5 h-5 text-indigo-400"></i> Gestione Articoli e Database`;
    contentEl.innerHTML = `<div class="space-y-4"><p class="text-xs text-slate-400">Gestisci il database degli articoli frequenti (Codice, Descrizione, Prezzo):</p><div class="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2.5"><h5 class="text-xs font-bold text-indigo-400 uppercase">Aggiungi / Modifica Articolo</h5><div class="grid grid-cols-3 gap-2"><input type="text" id="artModalCode" placeholder="Codice *" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"><input type="text" id="artModalDesc" placeholder="Descrizione articolo" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"><input type="number" step="any" id="artModalPrice" placeholder="Prezzo (€)" class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"></div><button type="button" onclick="addOrUpdateArticleFromSettings()" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded font-semibold w-full cursor-pointer transition-colors">Salva Articolo nel Database</button></div><div id="settingsArticlesList" class="space-y-1.5 max-h-44 overflow-y-auto pr-1">${renderArticlesSettingsList()}</div></div>`;
  } else if (type === 'archive') {
    titleEl.innerHTML = `<i data-lucide="archive" class="w-5 h-5 text-slate-400"></i> Archivio Commesse`;
    contentEl.innerHTML = `<div class="space-y-4"><div class="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center gap-2 flex-wrap"><div><p class="text-xs font-bold text-slate-200 uppercase tracking-wider">Gestione Dati & Report</p></div><button onclick="playSound('click'); printArchiveReport();" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-transform"><i data-lucide="printer" class="w-4 h-4"></i> Stampa Report Fatturato</button></div><div class="relative w-full"><i data-lucide="search" class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400"></i><input type="text" id="archiveSearchInput" oninput="filterArchive(this.value)" placeholder="Cerca nell'archivio..." class="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-500"></div><div id="archiveSettingsList" class="space-y-2 max-h-[400px] overflow-y-auto pr-1">${renderArchiveList()}</div></div>`;
    setTimeout(() => { lucide.createIcons(); }, 50);
  } else if (type === 'messages') {
    titleEl.innerHTML = `<i data-lucide="message-square" class="w-5 h-5 text-pink-400"></i> Testo Notifiche`;
    contentEl.innerHTML = `<div class="space-y-4"><p class="text-xs text-slate-400">Personalizza il testo inviato ai clienti per il ritiro merce:</p><textarea id="msgTemplateText" rows="10" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-pink-500 font-sans leading-relaxed">${sharedMsgTemplate}</textarea></div>`;
  } else if (type === 'machines') {
    titleEl.innerHTML = `<i data-lucide="cpu" class="w-5 h-5 text-cyan-400"></i> Gestione Macchinari`;
    contentEl.innerHTML = `<div class="space-y-3"><p class="text-xs text-slate-400">Aggiungi o rimuovi i macchinari utilizzati:</p><div class="flex gap-2"><input type="text" id="newMachineInput" placeholder="Nuovo macchinario..." class="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"><button type="button" onclick="addMachine()" class="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-3 py-2 rounded font-semibold cursor-pointer">Aggiungi</button></div><div id="settingsMachinesList" class="space-y-1.5 max-h-56 overflow-y-auto pr-1">${MACHINES_DB.map((m, idx) => `<div class="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 text-xs"><span class="text-slate-200 font-medium">${m}</span><button onclick="removeMachine(${idx})" class="text-red-400 hover:text-red-300 p-1 cursor-pointer"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button></div>`).join('')}</div></div>`;
  } else if (type === 'logo') {
    titleEl.innerHTML = `<i data-lucide="image" class="w-5 h-5 text-indigo-400"></i> Logo Aziendale`;
    contentEl.innerHTML = `<div class="space-y-3"><p class="text-xs text-slate-400">Carica il logo:</p></div>`;
  } else if (type === 'alarms') {
    titleEl.innerHTML = `<i data-lucide="alarm-clock" class="w-5 h-5 text-indigo-400"></i> Programmazione Sveglie`;
    contentEl.innerHTML = `<div class="space-y-3"><button onclick="playSound('click'); addAlarmRule(); openSubSettings('alarms');" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded font-semibold flex items-center gap-1 cursor-pointer"><i data-lucide="plus" class="w-3.5 h-3.5"></i> Aggiungi Sveglia</button><div id="alarmsListContainer" class="space-y-3 max-h-60 overflow-y-auto pr-1"></div></div>`;
    setTimeout(renderAlarmsList, 50);
  }
  openModal('subSettingsModal'); lucide.createIcons();
}

function closeSubSettings() { closeModal('subSettingsModal'); activeSubSettingsType = null; }

function saveSubSettings() {
  if (activeSubSettingsType === 'messages') { 
    const newTemplate = document.getElementById('msgTemplateText').value; 
    sharedMsgTemplate = newTemplate; 
    localStorage.setItem('workflow_sga_msg_template', sharedMsgTemplate); 
  }
  playSound('success'); closeSubSettings(); alert("Impostazioni salvate con successo!");
}

function renderArchiveList(query = '') {
  const q = query.toLowerCase().trim();
  let archived = state.cards.filter(c => c.stage === 'archiviato');
  if (q) {
    archived = archived.filter(c => (c.title||'').toLowerCase().includes(q) || (c.client||'').toLowerCase().includes(q));
  }
  archived.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (archived.length === 0) return '<p class="text-xs text-slate-500 italic py-4 text-center">Nessuna commessa in archivio.</p>';
  return archived.map(c => `
    <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
      <div onclick="openDetail('${c.id}')" class="flex-1 cursor-pointer">
        <h5 class="text-sm font-bold text-slate-200">${c.title}</h5>
        <div class="text-[10px] text-slate-400 mt-0.5">Cliente: <span class="text-indigo-300 font-semibold">${c.client || 'N/D'}</span></div>
      </div>
      <button onclick="deleteArchivedCard('${c.id}')" class="text-slate-600 hover:text-red-400 p-1.5 cursor-pointer"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
    </div>
  `).join('');
}
function filterArchive(val) {
  const list = document.getElementById('archiveSettingsList');
  if (list) { list.innerHTML = renderArchiveList(val); lucide.createIcons(); }
}

function renderCrmSettingsList() {
  return CLIENTS_DB.length === 0 ? '<p class="text-xs text-slate-500 italic py-2">Nessun cliente in archivio.</p>' : 
  CLIENTS_DB.map(c => `
    <div class="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800 text-xs">
      <div><span class="text-white font-bold">${c.name}</span></div>
      <button onclick="removeClient('${c.id}')" class="text-slate-600 hover:text-red-400 p-1 cursor-pointer"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
    </div>
  `).join('');
}

function addClientFromSettings() {
  const name = document.getElementById('crmModalName').value.trim(); 
  const ref = document.getElementById('crmModalRef').value.trim(); 
  const email = document.getElementById('crmModalEmail').value.trim(); 
  const wa = document.getElementById('crmModalWa').value.trim();
  if (!name) return alert("Inserisci il nome.");
  registerClientAdvanced(name, ref, email, wa);
  openSubSettings('crm'); playSound('success');
}

function removeClient(clientId) {
  CLIENTS_DB = CLIENTS_DB.filter(c => c.id !== clientId);
  localStorage.setItem('workflow_sga_clients_db', JSON.stringify(CLIENTS_DB));
  populateClientSelectors(); syncClientsToCloud(); openSubSettings('crm');
}

function addMachine() {
  const input = document.getElementById('newMachineInput'); if (!input || !input.value.trim()) return;
  MACHINES_DB.push(input.value.trim());
  localStorage.setItem('workflow_sga_machines_db', JSON.stringify(MACHINES_DB));
  populateMachinesDropdowns(); openSubSettings('machines');
}
function removeMachine(idx) {
  MACHINES_DB.splice(idx, 1);
  localStorage.setItem('workflow_sga_machines_db', JSON.stringify(MACHINES_DB));
  populateMachinesDropdowns(); openSubSettings('machines');
}

function addAlarmRule() { USER_ALARMS.push({ id: 'a' + Date.now(), time: "09:00", active: true, days: [1, 2, 3, 4, 5] }); renderAlarmsList(); }
function removeAlarmRule(id) { USER_ALARMS = USER_ALARMS.filter(x => x.id !== id); renderAlarmsList(); }
function updateAlarmTime(id, val) { const a = USER_ALARMS.find(x => x.id === id); if (a) a.time = val; }
function toggleAlarmActive(id, val) { const a = USER_ALARMS.find(x => x.id === id); if (a) a.active = val; }
function toggleAlarmDay(id, dayVal) {
  const a = USER_ALARMS.find(x => x.id === id);
  if (a) { if (!Array.isArray(a.days)) a.days = []; const idx = a.days.indexOf(dayVal); if (idx >= 0) a.days.splice(idx, 1); else a.days.push(dayVal); renderAlarmsList(); }
}
function renderAlarmsList() {
  const container = document.getElementById('alarmsListContainer'); if (!container) return; container.innerHTML = '';
  USER_ALARMS.forEach(alarm => {
    const div = document.createElement('div'); div.className = "bg-slate-900 p-2 rounded text-xs flex justify-between items-center";
    div.innerHTML = `<span class="text-white font-mono">${alarm.time}</span><button onclick="removeAlarmRule('${alarm.id}')" class="text-red-400"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>`;
    container.appendChild(div);
  });
  lucide.createIcons();
}

function showArcadeAlert(cards) {}
function closeArcadeAlert() {}
function togglePlayPauseMaster() {}
function toggleMasterMode() {}
function startAutoScroll() {}
function stopAutoScroll() {}
function updateCloudStatus(isOnline) {}
function listenToCloudUpdates() {}

function compressImage(file, maxWidth, maxHeight, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width; let height = img.height;
        if (width > maxWidth || height > maxHeight) { if (width / height > maxWidth / maxHeight) { height = Math.round((height * maxWidth) / width); width = maxWidth; } else { width = Math.round((width * maxHeight) / height); height = maxHeight; } }
        const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height); resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject; img.src = e.target.result;
    };
    reader.onerror = reject; reader.readAsDataURL(file);
  });
}

function convertPdfToImage(file, scaleFactor, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        const typedarray = new Uint8Array(e.target.result); const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise; const page = await pdf.getPage(1); const viewport = page.getViewport({ scale: scaleFactor }); const canvas = document.createElement('canvas'); const context = canvas.getContext('2d'); canvas.height = viewport.height; canvas.width = viewport.width; context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height); await page.render({ canvasContext: context, viewport: viewport }).promise; resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (err) { reject(err); }
    };
    reader.readAsArrayBuffer(file);
  });
}

async function extractArticlesFromArubaPdf(file) {
  return [{ code: '', desc: 'Preventivo: ' + file.name, qty: 1, price: 0, tax: 22 }];
}

function sanitizeCard(card) {
  if (!card) return null;
  if (!Array.isArray(card.photos)) card.photos = [];
  if (!Array.isArray(card.history)) card.history = []; if (card.order === undefined) card.order = 0;
  if (!card.referent) card.referent = ''; if (!card.email) card.email = ''; if (!card.whatsapp) card.whatsapp = ''; if (!card.machine) card.machine = '';
  if (!card.orderRef) card.orderRef = ''; // Riferimento ordine
  if (!Array.isArray(card.articles)) { card.articles = []; } 
  return card;
}

function loadState() {
  const saved = localStorage.getItem('workflow_sga_state');
  if (saved) {
    try { const parsed = JSON.parse(saved); if (parsed && Array.isArray(parsed.cards)) { state.cards = parsed.cards.map(c => sanitizeCard(c)).filter(c => c !== null); } } catch(e) {}
  }
}

function saveLocal() { renderBoard(); try { localStorage.setItem('workflow_sga_state', JSON.stringify(state)); } catch(e){} }
function syncCardToCloud(card) { if (!db || !card) return; db.collection('workflow_sga_cards').doc(card.id).set(card).catch(err => console.error(err)); }
function syncDeleteToCloud(cardId) { if (!db || !cardId) return; db.collection('workflow_sga_cards').doc(cardId).delete().catch(e => console.error(e)); }

function renderBoard() {
  const board = document.getElementById('board'); if (!board) return; board.innerHTML = '';
  COLUMNS_CONFIG.forEach(col => {
    let colCards = state.cards.filter(c => c && c.stage === col.id);
    if (globalSearchQuery) { colCards = colCards.filter(c => (c.title || '').toLowerCase().includes(globalSearchQuery) || (c.client || '').toLowerCase().includes(globalSearchQuery)); }
    if (globalFilterJobType) { colCards = colCards.filter(c => c.jobType === globalFilterJobType); }
    colCards.sort((a,b) => (a.order || 0) - (b.order || 0));
    
    const colEl = document.createElement('div'); colEl.className = `board-column flex flex-col h-full bg-slate-900/60 rounded-xl border border-slate-800 shrink-0 overflow-hidden`;
    colEl.innerHTML = `<div class="p-3 border-b border-slate-800 ${col.color} ${col.border} flex justify-between items-center"><h3 class="font-bold uppercase tracking-wide truncate max-w-[80%]">${col.label}</h3><span class="font-semibold bg-slate-950/60 px-2 py-0.5 rounded-full">${colCards.length}</span></div><div class="flex-1 overflow-y-auto p-2 space-y-2 card-dropzone" data-col="${col.id}" ondragover="allowDrop(event)" ondrop="handleDrop(event)">${colCards.map(card => createCardHTML(card)).join('')}</div>`;
    board.appendChild(colEl);
  });
  lucide.createIcons();
}

function getJobTypeClass(type) { return 'bg-slate-800 text-slate-300 border border-slate-700'; }

function createCardHTML(card) {
  if (!card) return '';
  const badgeStyle = getJobTypeClass(card.jobType);
  const orderRefHtml = card.orderRef ? `<div class="text-[11px] text-amber-400 font-mono mt-1">Rif. Ordine: ${card.orderRef}</div>` : '';
  
  // Icone sempre visibili da lavorato-da-bollettare fino a fatturato
  const isAlwaysVisibleStage = ['lavorato-da-bollettare', 'bollettato-da-consegnare', 'fatturato'].includes(card.stage);
  const notifyIconHTML = (isAlwaysVisibleStage && (card.email || card.whatsapp)) ? `<button onclick="event.stopPropagation(); triggerNotifyById('${card.id}')" class="p-1 bg-emerald-500/20 hover:bg-emerald-500/50 text-emerald-400 rounded cursor-pointer transition-colors" title="Invia Messaggio"><i data-lucide="mail" class="w-3.5 h-3.5"></i></button>` : '';
  const printLabelIconHTML = isAlwaysVisibleStage ? `<button onclick="event.stopPropagation(); openLabelPrintModal('${card.id}')" class="p-1 bg-blue-500/20 hover:bg-blue-500/50 text-blue-400 rounded cursor-pointer transition-colors ml-1" title="Stampa Collo"><i data-lucide="printer" class="w-3.5 h-3.5"></i></button>` : '';

  return `<div draggable="true" ondragstart="handleDragStart(event)" id="card-${card.id}" data-id="${card.id}" onclick="playSound('click'); openDetail('${card.id}')" class="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-3.5 rounded-lg shadow-md cursor-pointer transition-all active:scale-95 space-y-2 group relative"><div class="flex justify-between items-start"><span class="px-2 py-0.5 rounded font-medium text-[11px] ${badgeStyle}">${card.jobType || 'Generico'}</span></div><h4 class="font-bold text-sm text-white">${card.title || 'Senza Titolo'}</h4>${orderRefHtml}<div class="pt-2 border-t border-slate-800 flex justify-between items-center text-xs" onclick="event.stopPropagation()"><div class="flex items-center gap-1">${notifyIconHTML}${printLabelIconHTML}</div><div class="flex gap-1.5"><button onclick="moveCardStep('${card.id}', -1)" class="p-1 rounded bg-slate-900 text-slate-400"><i data-lucide="chevron-left" class="w-4 h-4"></i></button><button onclick="moveCardStep('${card.id}', 1)" class="p-1 rounded bg-slate-900 text-slate-400"><i data-lucide="chevron-right" class="w-4 h-4"></i></button></div></div></div>`;
}

function allowDrop(ev) { ev.preventDefault(); }
function handleDragStart(ev) { ev.dataTransfer.setData("text/plain", ev.target.dataset.id); }
function handleDrop(ev) { ev.preventDefault(); const cardId = ev.dataTransfer.getData("text"); const targetColId = ev.currentTarget.dataset.col; if (cardId && targetColId) changeCardStage(cardId, targetColId); }
function moveCardStep(cardId, direction) { const card = state.cards.find(c => c.id === cardId); if (!card) return; const idx = COLUMNS_CONFIG.findIndex(col => col.id === card.stage); let tIdx = idx + direction; if (tIdx >= 0 && tIdx < COLUMNS_CONFIG.length) changeCardStage(cardId, COLUMNS_CONFIG[tIdx].id); }

function changeCardStage(cardId, targetStageId) {
  const card = state.cards.find(c => c.id === cardId);
  if (card && card.stage !== targetStageId) {
    card.stage = targetStageId; card.order = Date.now();
    saveLocal(); syncCardToCloud(card);
  }
}

function triggerNotifyById(id) { const card = state.cards.find(c => c.id === id); if (card) checkAndTriggerClientNotification(card); }
function checkAndTriggerClientNotification(card) {
  activeNotifyCard = card;
  document.getElementById('notifyClientName').innerText = card.client || 'N/D';
  document.getElementById('notifyClientWa').innerText = card.whatsapp || 'Non disponibile';
  document.getElementById('notifyClientEmail').innerText = card.email || 'Non disponibile';
  openModal('clientNotifyModal'); lucide.createIcons();
}

function sendWhatsAppNotification() { if (!activeNotifyCard || !activeNotifyCard.whatsapp) return; window.open(`https://wa.me/${activeNotifyCard.whatsapp.replace(/[^0-9+]/g, '')}`, '_blank'); closeModal('clientNotifyModal'); }
function sendEmailNotification() { if (!activeNotifyCard || !activeNotifyCard.email) return; window.location.href = `mailto:${activeNotifyCard.email}`; closeModal('clientNotifyModal'); }

async function createNewCard(event) {
  event.preventDefault(); playSound('success');
  const title = document.getElementById('formTitle').value.trim();
  const orderRef = document.getElementById('formOrderRef') ? document.getElementById('formOrderRef').value.trim() : ''; // Riferimento ordine
  const client = title;
  const referent = document.getElementById('formReferent').value.trim();
  const email = document.getElementById('formEmail').value.trim();
  const whatsapp = document.getElementById('formWhatsapp').value.trim();
  const machine = document.getElementById('formMachine').value;
  const deliveryDate = document.getElementById('formDeliveryDate').value;
  const jobType = document.getElementById('formJobType').value;
  const initialStage = document.getElementById('formInitialStage').value;

  const newCard = {
    id: 'c' + Date.now().toString(36),
    title, orderRef, client, referent, email, whatsapp, machine, jobType, deliveryDate,
    articles: [], stage: initialStage, order: Date.now(), createdAt: new Date().toISOString(), photos: [], history: []
  };

  state.cards.unshift(newCard); saveLocal(); syncCardToCloud(newCard);
  document.getElementById('newCardForm').reset(); closeModal('addCardModal');
}

function saveCardEdits() {
  const card = state.cards.find(c => c.id === activeCardId); if (!card) return;
  card.title = document.getElementById('editTitle').value.trim();
  card.orderRef = document.getElementById('editOrderRef') ? document.getElementById('editOrderRef').value.trim() : '';
  card.referent = document.getElementById('editReferent').value.trim();
  card.email = document.getElementById('editEmail').value.trim();
  card.whatsapp = document.getElementById('editWhatsapp').value.trim();
  card.machine = document.getElementById('editMachine').value;
  saveLocal(); syncCardToCloud(card); playSound('success'); alert("Aggiornato con successo!");
}

function renderArticlesTable(card) {
  const tbody = document.getElementById('articlesTableBody'); tbody.innerHTML = '';
  if (!card.articles || card.articles.length === 0) card.articles = [{ code: '', desc: '', qty: 1, price: 0, tax: 22 }];
  
  card.articles.forEach((art, idx) => {
    const tr = document.createElement('tr'); tr.className = "hover:bg-slate-900/50 transition-colors";
    tr.innerHTML = `
      <td class="py-1.5 px-1"><input type="text" value="${art.code || ''}" data-field="code" data-index="${idx}" oninput="updateArticleField(this)" onblur="checkArticleDatabaseMatch(this)" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:outline-none" placeholder="Codice..."></td>
      <td class="py-1.5 px-1"><input type="text" value="${art.desc || ''}" data-field="desc" data-index="${idx}" oninput="updateArticleField(this)" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none" placeholder="Descrizione..."></td>
      <td class="py-1.5 px-1"><input type="number" value="${art.qty || 1}" data-field="qty" data-index="${idx}" oninput="updateArticleField(this)" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs text-center focus:outline-none"></td>
      <td class="py-1.5 px-1"><input type="number" step="any" value="${art.price || 0}" data-field="price" data-index="${idx}" oninput="updateArticleField(this)" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs text-right focus:outline-none"></td>
      <td class="py-1.5 px-1 text-center"><button onclick="removeArticleRow(${idx})" class="text-red-400 p-1"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button></td>
    `;
    tbody.appendChild(tr);
  });
  lucide.createIcons();
}

// Controllo database articoli digitando il codice
function checkArticleDatabaseMatch(input) {
  const val = input.value.trim().toLowerCase();
  if (!val) return;
  const matched = ARTICLES_DB.find(a => a.code.toLowerCase() === val);
  if (matched) {
    const idx = parseInt(input.dataset.index);
    const card = state.cards.find(c => c.id === activeCardId);
    if (card && card.articles[idx]) {
      card.articles[idx].desc = matched.desc;
      card.articles[idx].price = matched.price;
      renderArticlesTable(card);
    }
  }
}

function updateArticleField(input) {
  const idx = parseInt(input.dataset.index), field = input.dataset.field; 
  const card = state.cards.find(c => c.id === activeCardId); if (!card || !card.articles[idx]) return; 
  card.articles[idx][field] = input.value;

  // Inserimento automatico nel database articoli se viene inserito codice e descrizione
  if (card.articles[idx].code && card.articles[idx].desc) {
    registerArticleDb(card.articles[idx].code, card.articles[idx].desc, card.articles[idx].price);
  }
}

function addArticleRow() { 
  const card = state.cards.find(c => c.id === activeCardId); if (!card) return; 
  if (!Array.isArray(card.articles)) card.articles = []; 
  card.articles.push({ code: '', desc: '', qty: 1, price: 0, tax: 22 }); 
  renderArticlesTable(card); 
}

function removeArticleRow(idx) {
  const card = state.cards.find(c => c.id === activeCardId); if (!card) return;
  card.articles.splice(idx, 1); renderArticlesTable(card);
}

function saveArticlesEdits() { 
  const card = state.cards.find(c => c.id === activeCardId); if (!card) return; 
  saveLocal(); syncCardToCloud(card); playSound('success'); alert("Articoli salvati."); 
}

function openDetail(id) {
  const card = state.cards.find(c => c.id === id); if (!card) return; activeCardId = id;
  document.getElementById('editTitle').value = card.title || '';
  if (document.getElementById('editOrderRef')) document.getElementById('editOrderRef').value = card.orderRef || '';
  document.getElementById('editReferent').value = card.referent || '';
  document.getElementById('editEmail').value = card.email || '';
  document.getElementById('editWhatsapp').value = card.whatsapp || '';
  renderArticlesTable(card);
  openModal('detailModal');
}

// ============================================
// STAMPA ETICHETTE COLLI (A6)
// ============================================
function openLabelPrintModal(cardId) {
  playSound('click'); const card = state.cards.find(c => c.id === cardId); if (!card) return; activeLabelCardId = cardId;
  document.getElementById('labelClientName').innerText = card.client || 'N/D'; 
  document.getElementById('labelTaskTitle').innerText = card.title || 'Senza Titolo';
  
  window.tempLabelArticles = [];
  if (card.articles && card.articles.length > 0) {
    card.articles.forEach(art => {
      window.tempLabelArticles.push({ code: art.code || '', desc: art.desc || '', qty: art.qty || 1, packageNum: 1 });
    });
  }
  renderLabelArticlesTable();
  openModal('labelPrintModal'); lucide.createIcons();
}

function renderLabelArticlesTable() {
  const tbody = document.getElementById('labelArticlesBody');
  tbody.innerHTML = '';
  window.tempLabelArticles.forEach((art, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="py-2 px-2"><input type="text" value="${art.code}" onchange="updateLabelRow(${idx}, 'code', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"></td>
      <td class="py-2 px-2"><input type="text" value="${art.desc}" onchange="updateLabelRow(${idx}, 'desc', this.value)" class="w-full bg-transparent border-b border-slate-700 text-slate-200 text-xs"></td>
      <td class="py-2 px-2 text-center"><input type="number" value="${art.qty}" onchange="updateLabelRow(${idx}, 'qty', this.value)" class="w-16 bg-slate-900 border border-slate-700 rounded text-center text-xs"></td>
      <td class="py-2 px-2 text-center"><input type="number" value="${art.packageNum}" onchange="updateLabelRow(${idx}, 'packageNum', this.value)" class="w-16 bg-slate-900 border border-slate-700 rounded text-center text-xs"></td>
    `;
    tbody.appendChild(tr);
  });
}

function updateLabelRow(index, field, value) {
  window.tempLabelArticles[index][field] = value;
}

async function generateAndPrintLabels() {
  const card = state.cards.find(c => c.id === activeLabelCardId); if (!card) return;
  alert("Generazione etichette con Codice e Riferimento Ordine in corso...");
  closeModal('labelPrintModal');
}

function printCard() {}
function openModal(modalId) { document.getElementById(modalId).classList.add('flex'); document.getElementById(modalId).classList.remove('hidden'); }
function closeModal(modalId) { document.getElementById(modalId).classList.remove('flex'); document.getElementById(modalId).classList.add('hidden'); }