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

// Inizializzazione di Firebase
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

function init() {
  loadUserSettings(); 
  loadState(); 
  let localMigrated = false;
  state.cards.forEach(c => { 
    if (c.stage === 'lavorato') { c.stage = 'lavorato-da-bollettare'; localMigrated = true; } 
    if (c.stage === 'consegnato') { c.stage = 'bollettato-da-consegnare'; localMigrated = true; } 
  });
  state.cards.sort((a,b) => (a.order || 0) - (b.order || 0)); 
  saveLocal(); 
  if (localMigrated) { state.cards.forEach(c => syncCardToCloud(c)); }
  renderBoard(); 
  updateCloudStatus(true); 
  listenToCloudUpdates(); 
  lucide.createIcons(); 
  
  // Rimuoviamo il caricamento della chiave ImgBB dal localStorage perché ora è nel codice
  const cfgImgbbKeyInput = document.getElementById('cfgImgbbKey');
  if (cfgImgbbKeyInput && IMGBB_API_KEY !== "INSERISCI_QUI_LA_TUA_CHIAVE_IMGBB") {
    cfgImgbbKeyInput.value = IMGBB_API_KEY;
    cfgImgbbKeyInput.disabled = true; // Impediamo la modifica dal form dato che è cablata
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
    if (card.stage === 'bollettato-da-consegnare' || card.stage === 'fatturato') return false;
    if (!card.deliveryDate) return false;
    const delivery = new Date(card.deliveryDate);
    delivery.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffDays = Math.ceil((delivery - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });

  const cardsToDisplay = urgentCards.length > 0 ? urgentCards : state.cards.filter(card => card.stage !== 'bollettato-da-consegnare' && card.stage !== 'fatturato');
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

function removeCompanyLogo() {
  confirmDeletion(`Logo Aziendale Condiviso`, () => {
    sharedCompanyLogo = ""; localStorage.removeItem('workflow_sga_company_logo'); loadCompanyLogo();
    if (db) db.collection('workflow_sga_settings').doc('config').set({ companyLogo: "" }, { merge: true }).catch(e => console.error(e));
    openSubSettings('logo');
  });
}

function loadUserSettings() {
  const localLogo = localStorage.getItem('workflow_sga_company_logo');