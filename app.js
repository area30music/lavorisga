// ==========================================
// CONFIGURAZIONE FIREBASE HARDCODED
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAVbSA7g_08qp3C4KVXPqaPGf1YCqsT7Ag",
  authDomain: "workflow-sga.firebaseapp.com",
  projectId: "workflow-sga",
  storageBucket: "workflow-sga.firebasestorage.app"
};

// (L'aggiornamento automatico e' in fondo a questo file: nessun numero di versione da incrementare)

// ==========================================
// CHIAVE IMGBB (FOTO 4K)
// ==========================================
const IMGBB_API_KEY = "4452dd184d4f0efb701cba820e8c8f81";

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
let ARTICLES_DB = [];
let MACHINES_DB = ["Roland TrueVIS SG2-540", "Epson SureColor T7200", "Epson F1000 DTF", "Xerox PrimeLink C9200", "Happy Japan HCH Embroidery"];
let masterFontSizePx = 24; 
let appFontSizePx = 15;
let sharedCompanyLogo = "";
let sharedMsgTemplate = "";
let activeSubSettingsType = null;
let globalSearchQuery = "";
let globalFilterJobType = "";
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

// Controllo Archivio Automatico
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
        card.history.push({
          stage: 'archiviato',
          label: 'Archiviata automaticamente (7+ giorni in Fatturato)',
          timestamp: new Date().toISOString()
        });
        localMigrated = true;
        syncCardToCloud(card);
      }
    }
  });
  
  if (localMigrated) {
    saveLocal();
  }
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
  
  const cardsToDisplay = urgentCards.length > 0 ? urgentCards : state.cards.filter(card => card.stage !== 'bollettato-da-consegnare' && card.stage !== 'fatturato' && card.stage !== 'archiviato');
  
  if (cardsToDisplay.length > 0) {
    showArcadeAlert(cardsToDisplay);
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
      COLUMNS_CONFIG = parsedCols;
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
  
  const savedMasterFont = localStorage.getItem('workflow_sga_master_fontsize_px');
  if (savedMasterFont) masterFontSizePx = parseInt(savedMasterFont);
  applyMasterFontSize(masterFontSizePx);
  
  const savedAppFont = localStorage.getItem('workflow_sga_app_fontsize_px');
  if (savedAppFont) appFontSizePx = parseInt(savedAppFont);
  applyAppFontSize(appFontSizePx);

  loadCompanyLogo();
  populateMachinesDropdowns();
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
    <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 hover:border-slate-500/50 transition-colors group flex justify-between items-center">
      <div onclick="openDetail('${c.id}')" class="flex-1 cursor-pointer">
        <h5 class="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">${esc(c.title)}</h5>
        <div class="text-[10px] text-slate-400 mt-0.5">Cliente: <span class="text-indigo-300 font-semibold">${esc(c.client || 'N/D')}</span> | Inserimento: ${new Date(c.createdAt).toLocaleDateString('it-IT')}</div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="openDetail('${c.id}')" class="text-slate-600 hover:text-indigo-400 p-1.5 transition-colors cursor-pointer" title="Apri Dettaglio"><i data-lucide="external-link" class="w-4 h-4"></i></button>
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

function renderCrmSettingsList() {
  return CLIENTS_DB.length === 0 ? '<p class="text-xs text-slate-500 italic py-2">Nessun cliente in archivio.</p>' : 
  CLIENTS_DB.map(c => `
    <div onclick="loadClientForEdit('${c.id}')" class="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800 text-xs hover:border-indigo-500/50 cursor-pointer transition-colors group">
      <div>
        <span class="text-white font-bold">${esc(c.name)}</span> ${c.referent ? `<span class="text-indigo-300">(${esc(c.referent)})</span>` : ''}
        <div class="text-[10px] text-slate-400">${c.email ? 'Email: ' + esc(c.email) : ''} ${c.whatsapp ? '| WA: ' + esc(c.whatsapp) : ''}</div>
      </div>
      <button onclick="event.stopPropagation(); removeClient('${c.id}')" class="text-slate-600 group-hover:text-red-400 hover:!text-red-300 p-1 cursor-pointer transition-colors"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
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

function closeArcadeAlert() {
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
    const activeMap = new Map();

    snapshot.docs.forEach((d) => {
      let docData = d.data();
      if (!docData.id) docData.id = d.id;
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
    if (!window.__firstCardsSnapshotDone) {
      window.__firstCardsSnapshotDone = true;
      checkAutoArchive();
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
  if (/SABELT\s+S\.?\s?p\.?\s?A/i.test(all) && /Ordine fornitore/i.test(all)) return 'sabelt';
  if (/O\.\s?M\.\s?LER/i.test(all) && /Ordine d['’`]acquisto/i.test(all)) return 'omler';
  return '';
}

function minIsoDate(list) {
  const ok = list.filter(Boolean).sort();
  return ok.length ? ok[0] : '';
}

// SABELT: Riga | Articolo | Nome | Quantita' UM | Consegna | Valuta | Prezzo | Unita' di prezzo | Sconto | Importo
function extractSabeltOrder(rows) {
  const meta = {};
  const items = [];
  const dates = [];

  // Riferimento ordine: "Ordine OF00049323 del 15/10/2026"
  for (let i = 0; i < rows.length - 1; i++) {
    const r = rows[i];
    if (r.items.length && /^Ordine$/i.test(r.items[0].text) && r.items.some(x => /^Data$/i.test(x.text))) {
      const nr = rows[i + 1];
      const num = nr.items[0];
      const dt = nr.items.find(x => IT_DATE_RE.test(x.text));
      if (num) meta.orderRef = 'Ordine ' + num.text + (dt ? ' del ' + dt.text : '');
      break;
    }
  }
  if (!meta.orderRef) {
    const all = rows.map(r => r.text).join('\n');
    const m = all.match(/\b(OF\d{6,})\b/);
    if (m) meta.orderRef = 'Ordine ' + m[1];
  }

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

    const head = row.items.filter(i => i.x < 150).map(i => i.text).join(' ');
    const mh = head.match(/^(\d+)\s+([A-Za-z0-9][A-Za-z0-9\-_.\/]*)/);
    const qtyIt = row.items.find(i => /^\d{1,3}(?:\.\d{3})*,\d{1,3}\s*[A-Za-z]{1,4}$/.test(i.text));
    const dateIt = row.items.find(i => IT_DATE_RE.test(i.text));
    if (mh && qtyIt) {
      const qty = parseItNumber(qtyIt.text.replace(/\s*[A-Za-z]+$/, ''));
      const eurIdx = row.items.findIndex(i => /^[A-Z]{3}$/.test(i.text));
      const nums = (eurIdx >= 0 ? row.items.slice(eurIdx + 1) : []).map(i => parseItNumber(i.text)).filter(v => !isNaN(v));
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
      const descItems = row.items.filter(i => i.x >= 150 && i.x < qtyIt.x - 2 && !/^\d+$/.test(i.text));
      const art = {
        code: mh[2],
        desc: descItems.map(i => i.text).join(' ').trim() || mh[2],
        qty: (isNaN(qty) || qty <= 0) ? 1 : qty,
        price: Math.round(price * 10000) / 10000,
        tax: 22
      };
      if (disc > 0 && disc <= 100) art.discount = disc;
      items.push(art);
      if (dateIt) dates.push(itDateToIso(dateIt.text));
      cur = { item: art, qtyX: qtyIt.x, lastY: row.y };
    } else if (cur && row.items.length && row.items.every(i => i.x >= 150 && i.x < cur.qtyX - 2) && (cur.lastY - row.y) < 20 && (cur.lastY - row.y) > 0) {
      cur.item.desc += ' ' + t.trim();
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
    const hNum = r.items.find(x => /^Numero doc\.?$/i.test(x.text));
    const hDat = r.items.find(x => /^Data doc\.?$/i.test(x.text));
    if (hNum && hDat) {
      // i valori possono stare su una o due righe sotto l'intestazione (es. il numero di pagina e' un po' piu' in alto)
      const nr = { items: [] };
      for (let k = 1; k <= 4 && rows[i + k]; k++) {
        if (r.y - rows[i + k].y < 30) nr.items.push(...rows[i + k].items);
      }
      const closest = (hx, test) => nr.items.filter(test).sort((a, b) => Math.abs(a.x - hx) - Math.abs(b.x - hx))[0];
      const num = closest(hNum.x, it => /\d/.test(it.text) && it.text.length <= 20 && !IT_DATE_RE.test(it.text));
      const dat = closest(hDat.x, it => IT_DATE_RE.test(it.text));
      if (num) meta.orderRef = 'Ordine ' + num.text + (dat ? ' del ' + dat.text : '');
      break;
    }
  }

  let cols = null; // { descX, descEnd, umX }
  let cur = null;  // { item, lastY }
  for (const row of rows) {
    const t = row.text;
    if (!cols) {
      if (/\bPos\b/.test(t) && /Cod\.\s*Articolo/i.test(t) && /Importo/i.test(t)) {
        const d = row.items.find(i => /^Descrizione/i.test(i.text));
        const u = row.items.find(i => /^U\.?\s?M\.?$/i.test(i.text));
        if (d && u) {
          const next = row.items.filter(i => i.x > d.x + 20).sort((a, b) => a.x - b.x)[0];
          cols = { descX: d.x, descEnd: (next ? next.x : u.x) - 3, umX: u.x };
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

    const first = row.items[0];
    const dateIt = row.items.find(i => IT_DATE_RE.test(i.text));
    const isArticleRow = first && /^\d+$/.test(first.text) && first.x < 60 && dateIt;
    if (isArticleRow) {
      const nums = row.items.filter(i => i.x >= cols.umX - 5 && !IT_DATE_RE.test(i.text)).map(i => parseItNumber(i.text)).filter(v => !isNaN(v));
      if (nums.length < 3) { cur = null; continue; }
      const qty = nums[0], price = nums[1], amount = nums[nums.length - 1];
      let disc = 0;
      if (nums.length >= 4) disc = Math.abs(nums[2]);
      else if (qty * price > 0 && Math.abs(qty * price - amount) > 0.02) disc = Math.round((1 - amount / (qty * price)) * 10000) / 100;
      const codeIt = row.items.slice(1).find(i => i.x < cols.descX - 3);
      const code = codeIt && codeIt.text !== '-' ? codeIt.text : '';
      const descItems = row.items.filter(i => i.x >= cols.descX - 5 && i.x < cols.descEnd);
      const art = {
        code: code,
        desc: descItems.map(i => i.text).join(' ').trim() || code || 'Articolo',
        qty: qty > 0 ? qty : 1,
        price: Math.round(price * 10000) / 10000,
        tax: 22
      };
      if (disc > 0 && disc <= 100) art.discount = disc;
      items.push(art);
      dates.push(itDateToIso(dateIt.text));
      cur = { item: art, lastY: row.y };
    } else if (cur && row.items.length && row.items.every(i => i.x >= cols.descX - 5 && i.x < cols.descEnd) && (cur.lastY - row.y) < 20 && (cur.lastY - row.y) > 0) {
      cur.item.desc += ' ' + t.trim();
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
    const sup = rows.length ? extractSupplierOrder(rows) : null;
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
  return { articles: items.map(a => Object.assign({}, a)), meta: meta };
}

// Confronta il totale imponibile letto dal PDF con la somma degli articoli importati
function checkImportTotals(items, meta) {
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

function renderBoard() {
  const board = document.getElementById('board');
  if (!board) return;
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
    default: return 'bg-slate-800 text-slate-300 border border-slate-700';
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
        <input type="text" value="${esc(art.code || '')}" data-field="code" data-index="${idx}" autocomplete="off" oninput="updateArticleField(this); handleArticleCodeAutocomplete(this.value, ${idx})" onchange="saveArticlesEdits(true)" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500">
        <div id="articleCodeSuggestions-${idx}" class="hidden absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-600 rounded shadow-xl z-50 max-h-32 overflow-y-auto min-w-[200px]"></div>
      </td>
      <td class="py-1.5 px-1 relative">
        <input type="text" value="${esc(art.desc || '')}" data-field="desc" data-index="${idx}" autocomplete="off" oninput="updateArticleField(this); handleArticleAutocomplete(this.value, ${idx})" onchange="saveArticlesEdits(true)" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500">
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
        <button onclick="removeArticleRow(${idx})" class="text-red-400 hover:text-red-300 p-1 cursor-pointer"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  calculateGrandTotals();
  lucide.createIcons();
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
  card.articles.push({ code: '', desc: '', qty: 1, price: 0, tax: 22, discount: 0 });
  
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
  
  const editOrderRefEl = document.getElementById('editOrderRef');
  if (editOrderRefEl) editOrderRefEl.value = card.orderRef || '';
  
  const colDef = COLUMNS_CONFIG.find(col => col.id === card.stage);
  const defaultColor = colDef ? colDef.hexDefault : '#4f46e5'; 
  const colorInput = document.getElementById('editCardColor');
  colorInput.value = card.customColor || defaultColor;
  colorInput.dataset.defaultColor = defaultColor; 
  
  const editFields = ['editTitle', 'editReferent', 'editEmail', 'editWhatsapp', 'editDeliveryDate', 'editMachine', 'editOrderRef', 'editCustomJobType', 'editJobType', 'editClientSelector', 'editCardColor'];
  
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

async function handleDocumentUpload(event) {
  const files = Array.from(event.target.files);
  if (!files || files.length === 0) return;
  
  const card = state.cards.find(c => c.id === activeCardId);
  if (!card) return;
  if (!card.photos) card.photos = [];
  
  let imgbbKey = IMGBB_API_KEY && IMGBB_API_KEY !== "INSERISCI_QUI_LA_TUA_CHIAVE_IMGBB" ? IMGBB_API_KEY : null;
  
  const uploadNotes = [];
  const pendingImages = [];
  for (const file of files) {
    try {
      let imgData = "";
      if (file.type === 'application/pdf') {
        const imgPromise = convertPdfToImage(file, imgbbKey ? 3.0 : 2.0, imgbbKey ? 0.90 : 0.8).catch(() => "");
        const exRes = await extractArticlesSafe(file);
        const extractedArticles = exRes.articles;
        const exMeta = exRes.meta || {};
        if (extractedArticles && extractedArticles.length) {
          if (!card.orderRef && exMeta.orderRef) {
            card.orderRef = exMeta.orderRef;
            const oe = document.getElementById('editOrderRef');
            if (oe) oe.value = card.orderRef;
          }
          if (!card.deliveryDate && exMeta.deliveryDate) {
            card.deliveryDate = exMeta.deliveryDate;
            const de = document.getElementById('editDeliveryDate');
            if (de) de.value = card.deliveryDate;
          }
          const note = checkImportTotals(extractedArticles, exMeta);
          if (note) uploadNotes.push(note);
        }
        if (extractedArticles && extractedArticles.length > 0) {
          if (!card.articles || card.articles.length === 0 || (card.articles.length === 1 && !card.articles[0].desc)) {
            card.articles = extractedArticles;
          } else {
            card.articles.push(...extractedArticles);
          }
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
          <td style="padding: 8px; font-family: monospace; font-size: 11px; color: #334155;">${esc(art.code || '-')}</td>
          <td style="padding: 8px; font-size: 11px; color: #0f172a;">${esc(art.desc || '-')}</td>
          <td style="padding: 8px; text-align: center; font-size: 11px; color: #334155;">${art.qty !== undefined && art.qty !== '' ? art.qty : '-'}</td>
          <td style="padding: 8px; text-align: right; font-size: 11px; color: #334155;">${art.price !== undefined && art.price !== '' ? '€ ' + parseFloat(art.price).toFixed(2) : '-'}</td>
          <td style="padding: 8px; text-align: center; font-size: 11px; color: #334155;">${amounts.discountRate}%</td>
          <td style="padding: 8px; text-align: center; font-size: 11px; color: #334155;">${amounts.taxRate}%</td>
          <td style="padding: 8px; text-align: right; font-size: 11px; color: #334155;">${(art.qty !== undefined && art.price !== undefined && art.qty !== '' && art.price !== '') ? '€ ' + amounts.unitTaxPrice.toFixed(2) : '-'}</td>
          <td style="padding: 8px; text-align: right; font-size: 11px; font-weight: bold; color: #0f172a;">${(art.qty !== undefined && art.price !== undefined && art.qty !== '' && art.price !== '') ? '€ ' + amounts.rowTotalTaxed.toFixed(2) : '-'}</td>
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
        table.articles th { background: #f1f5f9; color: #334155; font-size: 10px; text-transform: uppercase; padding: 6px 8px; text-align: left; border-bottom: 2px solid #cbd5e1; }
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
          <div class="section-title">Articoli & Specifiche Lavorazione</div>
          <table class="articles">
            <thead>
              <tr>
                <th style="width: 20%;">Codice</th>
                <th>Descrizione</th>
                <th style="width: 10%; text-align: center;">Q.tà</th>
                <th style="width: 13%; text-align: right;">Prezzo Un.</th>
                <th style="width: 8%; text-align: center;">Sconto %</th>
                <th style="width: 8%; text-align: center;">IVA</th>
                <th style="width: 13%; text-align: right;">Pr. Ivato</th>
                <th style="width: 15%; text-align: right;">Tot. Ivato</th>
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
function renderArticlesSettingsList() {
  return ARTICLES_DB.length === 0 ? '<p class="text-xs text-slate-500 italic py-2">Nessun articolo salvato.</p>' : 
  ARTICLES_DB.map((a, idx) => `
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
    const ids = ['detailModal','addCardModal','settingsModal','subSettingsModal','labelPrintModal','clientNotifyModal','cloudModal','galleryModal','deleteConfirmModal'];
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
