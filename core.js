// --- STATE & CONFIG ---
let data = { 
    entries: [], 
    settings: { 
        name:'User', 
        theme:'#a855f7', 
        hours:[0,8.75,8.75,8.75,8.75,4.5,0], 
        break:{thresh:6, min:30}, 
        vacation:{total:30, used:0, usedManual:0},
        ihk: {
            start: '',
            end: '',
            exam_zwischen: '',
            note_zwischen: '', 
            note_abschluss: '' 
        },
        school: {
            grades: {
                'Kernprozesse': [],
                'Wirtschaftslehre': [],
                'IT-Systeme': [],
                'Deutsch/Kommunikation': [],
            }
        },
        goals: [] 
    } 
};
let timer = { id:null, start:0, paused:0, running:false, log:[] }; 
let editId = null;
let isSidebarOpen = true; // Für Desktop standardmäßig offen


// --- CORE FUNCTIONS (Init, Save, UI) ---

window.onload = () => {
    // Lade Daten aus LocalStorage
    if(localStorage.getItem('tg_pro_data')) data = JSON.parse(localStorage.getItem('tg_pro_data'));
    
    // Strukturprüfungen für Updates/Migration
    if(!data.settings.break) data.settings.break = {thresh:6, min:30};
    if(!data.settings.vacation) data.settings.vacation = {total:30, used:0, usedManual:0};
    if(!data.settings.ihk || !data.settings.ihk.note_zwischen) {
         data.settings.ihk = {start: '', end: '', exam_zwischen: '', note_zwischen: '', note_abschluss: ''};
    }
    if(!data.settings.school || !data.settings.school.grades) {
         data.settings.school = {
            grades: {
                'Kernprozesse': [],
                'Wirtschaftslehre': [],
                'IT-Systeme': [],
                'Deutsch/Kommunikation': [],
            }
         };
    }
    if(!data.settings.goals) data.settings.goals = [];
    if (data.settings.ihk.exam) { 
         data.settings.ihk.end = data.settings.ihk.exam;
         delete data.settings.ihk.exam;
    }

    // Mobile View Initialisierung
    if (window.innerWidth < 1024) {
         isSidebarOpen = false;
         document.getElementById('sidebar').classList.add('hidden');
         document.getElementById('mainContent').classList.add('full-width');
    }

    applyTheme(data.settings.theme);
    updateUI();
    
    setTimeout(checkAndBookHolidays, 500);

    // Timer Check und Log laden (Logik in features.js)
    const savedTimer = localStorage.getItem('tg_timer');
    if(savedTimer) {
        const t = JSON.parse(savedTimer);
        Object.assign(timer, t); 
        
        if (timer.running) {
            timerRun();
            document.getElementById('timerBox').classList.add('timer-active');
        } else if (timer.paused > 0) {
            displayTimerTime(timer.paused);
        }
    }
    
    const savedLog = localStorage.getItem('tg_timer_log');
    if (savedLog) timer.log = JSON.parse(savedLog);
    renderTimerLogBar(); 

    setInterval(() => {
        const now = new Date();
        document.getElementById('currentDate').textContent = now.toLocaleDateString('de-DE', {weekday:'long', day:'2-digit', month:'long'});
    }, 1000);
    document.getElementById('inpDate').valueAsDate = new Date();

    // Initialisierung je nach View
    if (document.getElementById('schoolGradesInputGrid')) {
         renderSchoolGradesInputs();
    }
    renderLists(); 
    const perfData = calculatePerformanceData();
    const deepData = calculateDeepPerformanceData();
    renderPerformanceView(perfData, deepData);
    
    // Initiales Laden des aktiven Tabs
    const activeViewId = document.querySelector('.view-section.active').id.replace('view-', '');
    if (activeViewId === 'history') renderHistoryView();
    if (activeViewId === 'goals') renderGoalsView();
    if (activeViewId === 'ihk') renderIHKView();
};

function save() { 
    localStorage.setItem('tg_pro_data', JSON.stringify(data)); 
    localStorage.setItem('tg_last_save', Date.now()); 
    updateUI(); 
}
function saveTimerState() { 
    localStorage.setItem('tg_timer', JSON.stringify({
        id: timer.id, start: timer.start, paused: timer.paused, running: timer.running
    })); 
    localStorage.setItem('tg_timer_log', JSON.stringify(timer.log));
}

function switchTab(tabId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById('view-' + tabId).classList.add('active');
    const navEl = document.getElementById('nav-' + tabId);
    if(navEl) navEl.classList.add('active');
    
    const titles = { 
        'dashboard': 'Übersicht', 
        'history': 'Daten-Analyse & Historie', 
        'performance': 'Performance Analyse', 
        'ihk': 'IHK / Karriere', 
        'school': 'Berufsschule Audit', 
        'goals': 'Ziele & Trophäen',
    };
    document.querySelector('.page-title').textContent = titles[tabId];

    if (window.innerWidth < 1024 && tabId !== 'dashboard') {
         toggleSidebar(); 
    }

    // Trigger Render functions for new views
    if (tabId === 'performance') {
        const perfData = calculatePerformanceData();
        const deepData = calculateDeepPerformanceData();
        renderPerformanceView(perfData, deepData);
    }
    if (tabId === 'ihk') {
        renderIHKView();
    }
    if (tabId === 'school') {
        renderSchoolView();
    }
    if (tabId === 'goals') {
        renderGoalsView();
    }
    if (tabId === 'history') {
        renderHistoryView();
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('mainContent');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (window.innerWidth < 1024) {
         isSidebarOpen = !isSidebarOpen;
         sidebar.classList.toggle('hidden', !isSidebarOpen);
         overlay.classList.toggle('active', isSidebarOpen);
    } else {
         isSidebarOpen = !isSidebarOpen;
         sidebar.classList.toggle('hidden', !isSidebarOpen);
         main.classList.toggle('full-width', !isSidebarOpen);
    }
}

function updateUI() {
    document.getElementById('userGreeting').innerText = `Hallo, ${data.settings.name}`;
    
    const now = new Date();
    let week=0, month=0, total=0, totalWorked=0, countDays=0;
    let sickSum=0, vacSum=0, workSum=0, schoolSum=0, holidaySum=0; 
    let usedVacationDays = 0; 
    let trendData = [];
    let runningTotal = 0;

    let ascEntries = [...data.entries].sort((a,b) => new Date(a.date) - new Date(b.date));
    
    ascEntries.forEach(e => {
        runningTotal += e.diff;
        trendData.push(runningTotal);
        if(e.type==='sick') sickSum += e.worked;
        else if(e.type==='vacation') { vacSum += e.worked; usedVacationDays++; }
        else if(e.type==='school') schoolSum += e.worked;
        else if(e.type==='holiday') holidaySum += e.worked;
        else workSum += e.worked;
    });
    
    data.settings.vacation.used = usedVacationDays + parseFloat(data.settings.vacation.usedManual || 0);

    data.entries.forEach(e => {
        const d = new Date(e.date);
        total += e.diff;
        if(e.type === 'work' || e.type === 'school' || e.type === 'vacation' || e.type === 'sick' || e.type === 'holiday') { 
            totalWorked += e.worked; 
            countDays++; 
        }

        if(d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
            month += e.diff;
            if(getWeek(d) === getWeek(now)) week += e.diff;
        }
    });

    setRadial('ringWeek', 'valWeek', week);
    setRadial('ringMonth', 'valMonth', month);
    
    const totEl = document.getElementById('valTotal');
    totEl.innerText = (total>=0?'+':'') + total.toFixed(2) + 'h';
    totEl.style.color = total>=0 ? 'var(--primary)' : 'var(--danger)';
    
    const avg = countDays > 0 ? totalWorked/countDays : 0;
    document.getElementById('valAvg').innerText = avg.toFixed(1) + 'h';

    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const dailyDrift = dayOfYear > 0 ? total / dayOfYear : 0;
    const projected = total + (dailyDrift * (365 - dayOfYear));
    document.getElementById('valProjected').innerText = (projected>=0?'+':'') + projected.toFixed(0) + 'h';

    const totalVacation = parseFloat(data.settings.vacation.total);
    const usedVacation = data.settings.vacation.used;
    document.getElementById('valVacationUsed').innerText = `${usedVacation} / ${totalVacation}`;
    const vacPct = (usedVacation / totalVacation) * 100;
    document.getElementById('vacationProgressBar').style.width = `${Math.min(vacPct, 100)}%`;

    renderLists();
    renderTrend(trendData, 'trendChart');
    renderDonut(workSum, vacSum, sickSum, schoolSum, holidaySum);
    renderAuditProtocol();
}

function getWeek(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

function isOddWeek(d) { return getWeek(d) % 2 !== 0; }

// --- MODAL / SETTINGS / UTILS (werden von features.js verwendet) ---

function openCorrection(type) {
    const modal = document.getElementById('corrModal');
    const sel = document.getElementById('corrSelect');
    sel.innerHTML = '';
    const now = new Date();
    if(type === 'week') {
        for(let i=0; i<20; i++) {
            let d = new Date(now); d.setDate(d.getDate() - i*7);
            sel.add(new Option(`KW ${getWeek(d)}`, `KW ${getWeek(d)}`));
        }
    } else {
        for(let i=0; i<12; i++) {
            let d = new Date(now.getFullYear(), now.getMonth()-i, 1);
            sel.add(new Option(d.toLocaleDateString('de-DE',{month:'long', year:'numeric'}), d.toISOString()));
        }
    }
    modal.classList.add('active');
}

function saveCorrection() {
    const val = parseFloat(document.getElementById('corrVal').value);
    if(!val) return;
    const sel = document.getElementById('corrSelect');
    data.entries.push({
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        isPeriod: true,
        label: `Korrektur: ${sel.value}`,
        diff: val, worked:0, expected:0, type:'work', info:'Manuelle Korrektur',
        breakMins: 0, shiftEnd: '', shiftWarning: false
    });
    save();
    document.getElementById('corrModal').classList.remove('active');
}

function closeSettings() { document.getElementById('settingsModal').classList.remove('active'); }
function openSettings() {
    document.getElementById('settingsModal').classList.add('active');
    document.getElementById('confName').value = data.settings.name;
    document.getElementById('confBreakThresh').value = data.settings.break.thresh;
    document.getElementById('confBreakMin').value = data.settings.break.min;
    for(let i=1; i<=5; i++) document.getElementById('h'+i).value = data.settings.hours[i];
    
    // Urlaub: Pro-rata Anspruch berechnen und anzeigen
    const proRata = calculateProRataVacation(30); 
    document.getElementById('vacationProRata').innerText = proRata;
    
    document.getElementById('confVacationTotal').value = data.settings.vacation.total || 30;
    document.getElementById('confVacationUsedManual').value = data.settings.vacation.usedManual || 0;
    document.getElementById('vacationRemaining').innerText = (data.settings.vacation.total - data.settings.vacation.used).toFixed(0);
}
function saveSettings() {
    data.settings.name = document.getElementById('confName').value;
    data.settings.break.thresh = parseFloat(document.getElementById('confBreakThresh').value);
    data.settings.break.min = parseFloat(document.getElementById('confBreakMin').value);
    
    for(let i=1; i<=5; i++) {
         data.settings.hours[i] = parseFloat(document.getElementById('h'+i).value);
    }
    
    const newTotalVacation = calculateProRataVacation(30); 
    data.settings.vacation.total = newTotalVacation;
    
    data.settings.vacation.usedManual = parseFloat(document.getElementById('confVacationUsedManual').value);
    recalculateVacationUsed();
    
    save();
    document.getElementById('settingsModal').classList.remove('active');
}
function setTheme(hex) {
    data.settings.theme = hex;
    applyTheme(hex);
}
function applyTheme(hex) {
    document.documentElement.style.setProperty('--primary', hex);
    const r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
    document.documentElement.style.setProperty('--primary-rgb', `${r},${g},${b}`);
    document.documentElement.style.setProperty('--primary-dim', `rgba(${r},${g},${b}, 0.15)`);
}

// Export/Import werden von features.js implementiert
function exportData(format) {
    if (format === 'json') {
         const a = document.createElement('a');
         a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], {type:'application/json'}));
         a.download = 'time_pro_backup.json';
         a.click();
    } else if (format === 'csv') {
        const csv = convertToCSV(data.entries);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'}));
        a.download = 'time_pro_full_export.csv';
        a.click();
    }
}

function importData(e) {
    const r = new FileReader();
    r.onload = ev => { 
        try { 
            const importedData = JSON.parse(ev.target.result);
            data = importedData;
            save(); 
            location.reload(); 
        } catch(x){
            alert('Fehler beim Importieren der Datei. Stelle sicher, dass es eine gültige JSON-Backup-Datei ist.');
        } 
    };
    r.readAsText(e.target.files[0]);
}