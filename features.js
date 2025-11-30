// Abhängigkeiten: data, save, saveTimerState, getWeek, openCorrection, closeSettings, applyTheme, recalculateVacationUsed, predictEndTime (aus core.js)

// --- TIMER LOGIC (Unverändert) ---
function logTimerAction(action, time = Date.now()) {
    const lastAction = timer.log.at(-1);
    
    const today = new Date().toISOString().split('T')[0];
    if (lastAction && lastAction.date !== today) {
        timer.log = []; 
    }

    if (action === 'start') {
        if (timer.running && lastAction && lastAction.action === 'start') return;
        timer.log.push({ action: 'start', time, date: today });
    } else if (action === 'pause') {
        timer.log.push({ action: 'pause', time, duration: time - (lastAction?.time || time), date: today });
    } else if (action === 'stop') {
        timer.log.push({ action: 'stop', time, date: today });
        timer.log = []; 
    }
    
    saveTimerState();
    renderTimerLogBar();
}

function timerAction(act) {
    const now = Date.now();
    if (act === 'start') {
        if (!timer.running) { 
            timer.start = now; 
            timer.running = true; 
            timerRun(); 
            document.getElementById('timerBox').classList.add('timer-active');
            logTimerAction('start', now);
        }
    } else if (act === 'pause') {
        if (timer.running) {
            timer.running = false; 
            timer.paused += now - timer.start;
            document.getElementById('timerBox').classList.remove('timer-active');
            logTimerAction('pause', now);
        }
    } else if (act === 'stop') {
        timer.running = false; 
        document.getElementById('timerBox').classList.remove('timer-active');
        let total = timer.paused + (timer.start > 0 ? now - timer.start : 0);
        let h = total / 3.6e6;
        
        const breakThresholdHours = data.settings.break.thresh;
        const breakMinutes = data.settings.break.min;
        if (h >= breakThresholdHours) {
            h -= (breakMinutes / 60);
            alert(`Hinweis: ${breakMinutes} Minuten Auto-Pause abgezogen.`);
        }


        if (confirm(`Zeit stoppen: ${h.toFixed(2)}h?`)) {
            document.getElementById('inpHours').value = h.toFixed(2);
            document.getElementById('inpType').value = 'work';
            document.getElementById('inpDate').valueAsDate = new Date();
            handleEntry(); 
            
            logTimerAction('stop', now); 
            timer = {id:null, start:0, paused:0, running:false, log:[]};
            displayTimerTime(0);
            saveTimerState(); 
        }
    }
    saveTimerState();
}

function timerRun() {
    if (!timer.running) return;
    requestAnimationFrame(timerRun);
    
    const now = Date.now();
    const rawRunningTimeMs = now - timer.start;
    const totalWorkedMs = rawRunningTimeMs + timer.paused;
    
    const totalWorkedHours = totalWorkedMs / 3.6e6;
    const breakThresholdHours = data.settings.break.thresh;
    const breakMinutes = data.settings.break.min;
    
    let adjustedTimeMs = totalWorkedMs;
    
    if (totalWorkedHours >= breakThresholdHours && !timer.autoPaused) {
        
        if (breakMinutes > 0) {
             const breakMs = breakMinutes * 60000;
             adjustedTimeMs = totalWorkedMs - breakMs;
             
             timer.autoPaused = true;
             
             document.getElementById('timerStatus').innerText = `LÄUFT (PAUSE ${breakMinutes}M abgezogen)`;
             document.getElementById('timerStatus').classList.add('paused');
        }
    } else if (totalWorkedHours < breakThresholdHours && timer.autoPaused) {
         timer.autoPaused = false;
         document.getElementById('timerStatus').classList.remove('paused');
    }


    displayTimerTime(adjustedTimeMs);
    renderTimerLogBar();
}

function displayTimerTime(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    document.getElementById('timerDisplay').innerText = `${h<10?'0'+h:h}:${m<10?'0'+m:m}:${s<10?'0'+s:s}`;
}

function renderTimerLogBar() {
    const logBar = document.getElementById('timerLogBar');
    const statusEl = document.getElementById('timerStatus');
    logBar.innerHTML = '';
    
    if (timer.log.length === 0) {
        statusEl.innerText = 'STOP';
        statusEl.classList.remove('running', 'paused', 'max');
        return;
    }

    const firstStart = timer.log.find(l => l.action === 'start')?.time || Date.now();
    const totalDuration = (timer.running ? Date.now() : timer.log.at(-1)?.time || firstStart) - firstStart;
    
    if (totalDuration <= 0) return;

    let cumulativeTime = 0;
    let lastTime = firstStart;
    
    statusEl.innerText = timer.running ? 'LÄUFT' : 'PAUSIERT';
    statusEl.classList.remove('paused');
    statusEl.classList.add(timer.running ? 'running' : 'paused');

    if (timer.autoPaused) {
         statusEl.innerText = `MAX-ZEIT ERREICHT (Auto-Pause)`;
         statusEl.classList.add('max');
    }

    for (let i = 0; i < timer.log.length; i++) {
        const logEntry = timer.log[i];
        
        if (logEntry.action === 'pause' || logEntry.action === 'stop') {
            const segmentDuration = logEntry.time - lastTime;
            
            if (segmentDuration > 0) {
                const widthPercent = (segmentDuration / totalDuration) * 100;
                const leftPercent = (cumulativeTime / totalDuration) * 100;
                
                const runningSegment = document.createElement('div');
                runningSegment.className = 'timer-log-segment';
                runningSegment.style.background = 'var(--primary)';
                runningSegment.style.width = `${widthPercent}%`;
                runningSegment.style.left = `${leftPercent}%`;
                logBar.appendChild(runningSegment);
                
                cumulativeTime += segmentDuration;
            }
            
            if (logEntry.action === 'pause' && timer.log[i+1]?.action === 'start') {
                const pauseStart = logEntry.time;
                const pauseEnd = timer.log[i+1].time;
                const pauseDuration = pauseEnd - pauseStart;
                
                if (pauseDuration > 0) {
                    const widthPercent = (pauseDuration / totalDuration) * 100;
                    const leftPercent = (cumulativeTime / totalDuration) * 100;

                    const pauseSegment = document.createElement('div');
                    pauseSegment.className = 'timer-log-segment';
                    pauseSegment.style.background = 'var(--audit-warn)';
                    pauseSegment.style.width = `${widthPercent}%`;
                    pauseSegment.style.left = `${leftPercent}%`;
                    logBar.appendChild(pauseSegment);
                    
                    cumulativeTime += pauseDuration;
                }
                lastTime = pauseEnd;
            } else if (logEntry.action === 'stop') {
                 lastTime = logEntry.time;
            }
            
        } else if (logEntry.action === 'start') {
             lastTime = logEntry.time;
        }
    }
    
    if (timer.running) {
         const segmentDuration = Date.now() - lastTime;
         if (segmentDuration > 0) {
             const widthPercent = (segmentDuration / totalDuration) * 100;
             const leftPercent = (cumulativeTime / totalDuration) * 100;

             const runningSegment = document.createElement('div');
             runningSegment.className = 'timer-log-segment';
             runningSegment.style.background = 'var(--primary)';
             runningSegment.style.width = `${widthPercent}%`;
             runningSegment.style.left = `${leftPercent}%`;
             logBar.appendChild(runningSegment);
         }
    }
}


// --- ENTRY & CRUD LOGIC ---

function handleEntry() {
    const dateStr = document.getElementById('inpDate').value;
    const type = document.getElementById('inpType').value;
    const start = document.getElementById('inpStart').value;
    const end = document.getElementById('inpEnd').value;
    const direct = document.getElementById('inpHours').value;

    if(!dateStr) return alert('Bitte Datum wählen');
    
    const date = new Date(dateStr);
    let worked = 0;
    let dayIndex = date.getDay(); 
    let expected = data.settings.hours[dayIndex] || 0;
    let info = '';
    let diff = 0; 
    
    let breakMinutes = 0;
    let shiftEnd = '';
    let shiftWarning = false;

    if(type === 'work') {
        if(start && end) {
            let d1 = new Date(`2000-01-01T${start}`);
            let d2 = new Date(`2000-01-01T${end}`);
            let hoursDiff = (d2 - d1) / 3.6e6;
            if(hoursDiff < 0) hoursDiff += 24;
            
            if(data.settings.break.thresh > 0 && hoursDiff >= data.settings.break.thresh) {
                breakMinutes = data.settings.break.min;
                hoursDiff -= (breakMinutes / 60);
                info = `${start} - ${end} (Auto-Pause ${breakMinutes}m)`;
            } else {
                info = `${start} - ${end}`;
            }
            worked = hoursDiff;
            
            const endTime = d2.getTime();
            const endOfShift = new Date(endTime);
            endOfShift.setMinutes(endOfShift.getMinutes() + breakMinutes);
            shiftEnd = endOfShift.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});
            shiftWarning = worked > 10.0;

        } else if (direct) {
            worked = parseFloat(direct);
            info = 'Manuell';
        } else return alert('Bitte Zeit oder Stunden eingeben');
        
        diff = worked - expected;

    } else if (type === 'school') { 
        const SCHOOL_HOURS = 6.75;
        
        if (dayIndex === 3) {
            worked = SCHOOL_HOURS;
            info = `Berufsschule - Mittwoch (${SCHOOL_HOURS.toFixed(2)}h)`;
        } else if (dayIndex === 4 && isOddWeek(date)) {
            worked = SCHOOL_HOURS;
            info = `Berufsschule - Do. (Ungerade Woche, ${SCHOOL_HOURS.toFixed(2)}h)`;
        } else if (direct) {
            worked = parseFloat(direct);
            info = 'Berufsschule - Manuell';
        } else {
            worked = expected;
            info = 'Keine Berufsschule (Regulär)';
        }
        
        if (worked > 0 && (dayIndex === 3 || (dayIndex === 4 && isOddWeek(date)) || direct)) {
             diff = 0; 
        } else {
             diff = worked - expected;
        }

    } else if (type === 'vacation' || type === 'sick' || type === 'holiday') {
        worked = expected;
        info = type === 'vacation' ? 'Urlaubstag' : (type === 'sick' ? 'Krankmeldung' : 'Feiertag');
        diff = 0;
    }

    const entry = {
        id: editId || Date.now(),
        date: dateStr, type, worked, expected, 
        diff: diff, 
        info, isPeriod: false,
        breakMins: breakMinutes,
        shiftEnd: shiftEnd,
        shiftWarning: shiftWarning
    };

    if(editId) {
        const idx = data.entries.findIndex(e => e.id === editId);
        if(idx > -1) {
            const oldType = data.entries[idx].type;
            data.entries[idx] = entry;
            if (oldType !== 'vacation' || type !== 'vacation') recalculateVacationUsed();
        }
        resetEdit();
    } else {
        data.entries.push(entry);
        if (type === 'vacation') recalculateVacationUsed();
    }
    
    data.entries.sort((a,b) => new Date(b.date) - new Date(a.date));
    save();
    
    document.getElementById('inpStart').value = '';
    document.getElementById('inpEnd').value = '';
    document.getElementById('inpHours').value = '';
    
    document.getElementById('startPrediction').innerHTML = '';
    
    if (document.getElementById('view-history').classList.contains('active')) {
         renderHistoryView();
    }
    renderGoalsView();
}

function editEntry(id) {
    const e = data.entries.find(x => x.id === id);
    editId = id;
    // Prefill modal inputs
    document.getElementById('edit_inpDate').value = e.date;
    document.getElementById('edit_inpType').value = e.type;
    document.getElementById('edit_inpStart').value = e.start || '';
    document.getElementById('edit_inpEnd').value = e.end || '';
    document.getElementById('edit_inpHours').value = e.worked || '';

    // Open modal
    const m = document.getElementById('editEntryModal');
    if (m) m.classList.add('active');
}

function closeEditModal() {
    const m = document.getElementById('editEntryModal');
    if (m) m.classList.remove('active');
}

function saveEditModal() {
    // Copy modal inputs to main inputs and call existing handler to reuse validation/logic
    const dateVal = document.getElementById('edit_inpDate').value;
    const typeVal = document.getElementById('edit_inpType').value;
    const startVal = document.getElementById('edit_inpStart').value;
    const endVal = document.getElementById('edit_inpEnd').value;
    const hoursVal = document.getElementById('edit_inpHours').value;

    document.getElementById('inpDate').value = dateVal;
    document.getElementById('inpType').value = typeVal;
    document.getElementById('inpStart').value = startVal;
    document.getElementById('inpEnd').value = endVal;
    document.getElementById('inpHours').value = hoursVal;

    // Ensure UI shows update mode
    document.getElementById('mainBtn').innerText = "Update Speichern";
    document.getElementById('cancelBtn').style.display = "block";

    // Call handler which detects editId and updates the entry
    handleEntry();

    closeEditModal();
}

function resetEdit() {
    editId = null;
    document.getElementById('mainBtn').innerText = "Eintrag speichern";
    document.getElementById('cancelBtn').style.display = "none";
    document.getElementById('inpStart').value = '';
    document.getElementById('inpEnd').value = '';
    document.getElementById('inpHours').value = '';
    document.getElementById('startPrediction').innerHTML = ''; 
}

function delEntry(id) {
    if(confirm('Löschen?')) {
        data.entries = data.entries.filter(e => e.id !== id);
        recalculateVacationUsed(); 
        save();
        if (document.getElementById('view-history').classList.contains('active')) {
             renderHistoryView();
        }
    }
}

// --- SMART TIME PREDICTION ---

function predictEndTime() {
    const dateStr = document.getElementById('inpDate').value;
    const startStr = document.getElementById('inpStart').value;
    const predictionEl = document.getElementById('startPrediction');
    
    predictionEl.innerHTML = '';
    
    if (!dateStr || !startStr) {
        return;
    }

    const date = new Date(dateStr);
    const dayIndex = date.getDay(); 
    const expectedHours = data.settings.hours[dayIndex] || 0;
    
    if (expectedHours === 0) {
        predictionEl.innerHTML = `<strong>Keine Soll-Zeit</strong> für ${date.toLocaleDateString('de-DE', { weekday: 'long' })}`;
        return;
    }

    // 1. Startzeit in Minuten umrechnen
    const [startHour, startMin] = startStr.split(':').map(Number);
    if (isNaN(startHour) || isNaN(startMin)) return;
    let totalMinutes = startHour * 60 + startMin;
    
    // 2. Sollzeit addieren
    totalMinutes += expectedHours * 60;
    
    // 3. Automatischer Pausenabzug berücksichtigen
    const breakThresholdHours = data.settings.break.thresh;
    const breakMinutes = data.settings.break.min;
    
    if (expectedHours >= breakThresholdHours) {
        totalMinutes += breakMinutes; // Die Pause muss HINZUgerechnet werden, da die Sollzeit die NETTO-Zeit ist
    }

    // 4. Zurückrechnen zu HH:MM
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMin = totalMinutes % 60;
    
    const endHourStr = String(endHour).padStart(2, '0');
    const endMinStr = String(endMin).padStart(2, '0');
    
    const predictedTime = `${endHourStr}:${endMinStr}`;
    
    document.getElementById('inpEnd').value = predictedTime;
    
    predictionEl.innerHTML = `Voraussichtliches Ende: <strong>${predictedTime}</strong> (inkl. Pause)`;
}

function toggleTimeInputs() {
    const t = document.getElementById('inpType').value;
    const els = [document.getElementById('inpStart'), document.getElementById('inpEnd')];
    const disableTime = (t !== 'work');
    els.forEach(e => e.disabled = disableTime);
    document.getElementById('inpHours').disabled = false; 
    
    // Smart Autofill Trigger
    if (t === 'work') {
         predictEndTime();
    } else {
         document.getElementById('inpEnd').value = '';
         document.getElementById('startPrediction').innerHTML = '';
    }
}


// --- HOLIDAY / VACATION LOGIC ---

function calculateProRataVacation(totalAnnualDays = 30) {
    const startStr = data.settings.ihk.start;
    const now = new Date();
    
    if (!startStr) {
        return totalAnnualDays; 
    }

    const startDate = new Date(startStr);
    const startYear = startDate.getFullYear();
    const currentYear = now.getFullYear();

    if (currentYear > startYear) {
        return totalAnnualDays;
    }

    const entryMonth = startDate.getMonth(); // 0 = Januar
    const remainingMonths = 12 - entryMonth;
    
    const proRata = (totalAnnualDays / 12) * remainingMonths;
    return Math.ceil(proRata); 
}

function recalculateVacationUsed() {
    const vacationEntries = data.entries.filter(e => e.type === 'vacation' && e.expected > 0);
    const autoUsedDays = vacationEntries.length;
    data.settings.vacation.used = autoUsedDays + parseFloat(data.settings.vacation.usedManual || 0);
}

function deletePeriod() {
    const startStr = document.getElementById('periodStart').value;
    const endStr = document.getElementById('periodEnd').value;
    
    if (!startStr || !endStr) return alert('Bitte Start- und Enddatum für die zu löschende Periode wählen.');

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    
    if (startDate > endDate) return alert('Startdatum muss vor Enddatum liegen.');
    
    if (!confirm(`Sicher? Alle Periodenbuchungen (Urlaub/Feiertag) zwischen ${startStr} und ${endStr} werden unwiderruflich gelöscht!`)) {
        return;
    }

    let deletedCount = 0;

    data.entries = data.entries.filter(e => {
        const eDate = new Date(e.date);
        
        const isTargetType = (e.type === 'vacation' || e.type === 'holiday');
        const isWithinPeriod = eDate >= startDate && eDate <= endDate;
        
        if (isTargetType && isWithinPeriod) {
            deletedCount++;
            return false;
        }
        return true;
    });
    
    recalculateVacationUsed();
    
    alert(`${deletedCount} Perioden-Buchungen wurden gelöscht.`);
    save();
    document.getElementById('settingsModal').classList.remove('active');
}


function bookPeriod() {
    const startStr = document.getElementById('periodStart').value;
    const endStr = document.getElementById('periodEnd').value;
    const periodType = document.getElementById('periodType').value;
    
    if (!startStr || !endStr) return alert('Bitte Start- und Enddatum wählen.');

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    if (startDate > endDate) return alert('Startdatum muss vor Enddatum liegen.');
    
    const tempEntries = [];
    const daysToOverride = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const dayIndex = currentDate.getDay(); 
        const expected = data.settings.hours[dayIndex] || 0;
        
        if (expected > 0) { 
            
            const existingEntry = data.entries.find(e => e.date === dateKey);

            if (existingEntry) {
                 daysToOverride.push(dateKey);
            }
            
            tempEntries.push({
                id: Date.now() + Math.random(),
                date: dateKey,
                type: periodType,
                worked: expected,
                expected: expected,
                diff: 0,
                info: periodType === 'vacation' ? 'Urlaub (Block)' : 'Firmen-Frei/Feiertag (Block)',
                isPeriod: true,
                breakMins: 0, shiftEnd: '', shiftWarning: false
            });
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    if (daysToOverride.length > 0) {
        if (!confirm(`Achtung! ${daysToOverride.length} Tage haben bereits Einträge (z.B. Arbeit oder Schule). Sollen diese überschrieben/gelöscht werden?`)) {
            return;
        }
        data.entries = data.entries.filter(e => !daysToOverride.includes(e.date));
    }
    
    data.entries = data.entries.filter(e => {
        const eDate = new Date(e.date);
        return !(e.type === 'holiday' && !e.isPeriod && eDate >= startDate && eDate <= endDate);
    });

    data.entries.push(...tempEntries);
    recalculateVacationUsed();
    
    alert(`${tempEntries.length} Tage vom Typ "${periodType}" erfolgreich gebucht!`);
    save();
    document.getElementById('settingsModal').classList.remove('active');
}

function checkAndBookHolidays() {
    // Implementierung der Feiertagsbuchung (unverändert)
    const now = new Date();
    const year = now.getFullYear();
    
    let holidays = getGermanHolidays(year);
    holidays = holidays.concat(getGermanHolidays(year + 1));
    
    const existingDates = data.entries.map(e => e.date);

    let bookedHolidays = [];

    holidays.forEach(h => {
        const hDate = h.date;
        const dateObj = new Date(hDate);
        
        if (!existingDates.includes(hDate)) {
            
            const dayIndex = dateObj.getDay();
            const expected = data.settings.hours[dayIndex] || 0;

            if (expected > 0 && dayIndex >= 1 && dayIndex <= 5 && new Date(hDate).getTime() < now.getTime() + (30 * 86400000)) { 
                const entry = {
                    id: Date.now() + Math.random(),
                    date: hDate,
                    type: 'holiday',
                    worked: expected, 
                    expected: expected,
                    diff: 0,
                    info: h.name, 
                    isPeriod: false, 
                    breakMins: 0, shiftEnd: '', shiftWarning: false
                };
                data.entries.push(entry);
                bookedHolidays.push(entry);
            }
        }
    });
    
    localStorage.setItem('tg_last_holiday_check', JSON.stringify({
        timestamp: Date.now(),
        count: bookedHolidays.length,
        next: holidays.find(h => new Date(h.date).getTime() > now.getTime())
    }));

    if (bookedHolidays.length > 0) {
        data.entries.sort((a,b) => new Date(b.date) - new Date(a.date));
        save();
    } else {
        updateUI(); 
    }
}

function getGermanHolidays(year) {
    const holidays = [];
    const pad = n => (n < 10 ? '0' : '') + n;
    const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

    const getEasterSunday = (Y) => {
        const a = Y % 19; const b = Y % 4; const c = Y % 7;
        const k = Math.floor(Y / 100); const p = Math.floor((13 * k + 8) / 25);
        const q = Math.floor(k / 4);
        const M = (15 - p + k - q) % 30;
        const N = (4 + k - q) % 7;
        const d = (19 * a + M) % 30;
        const e = (2 * b + 4 * c + 6 * d + N) % 7;
        let days = (22 + d + e);
        let month = 3; 

        if (days > 31) { month = 4; days -= 31; }
        if (days === 26 && month === 4) days = 19; 
        if (days === 25 && month === 4 && d === 28 && e === 6 && a > 10) days = 18; 

        return new Date(Y, month - 1, days);
    };

    const easter = getEasterSunday(year);
    const addDays = (d, days) => {
        const result = new Date(d);
        result.setDate(result.getDate() + days);
        return result;
    };
    const add = (date, name) => holidays.push({ date: toKey(date), name, type: 'holiday' });

    add(new Date(year, 0, 1), "Neujahr");
    add(new Date(year, 4, 1), "Tag der Arbeit");
    add(new Date(year, 9, 3), "Tag der Deutschen Einheit");
    add(new Date(year, 11, 25), "1. Weihnachtstag");
    add(new Date(year, 11, 26), "2. Weihnachtstag");
    
    add(addDays(easter, -2), "Karfreitag");
    add(addDays(easter, 1), "Ostermontag");
    add(addDays(easter, 39), "Christi Himmelfahrt");
    add(addDays(easter, 50), "Pfingstmontag");
    add(addDays(easter, 60), "Fronleichnam"); 
    add(new Date(year, 0, 6), "Heilige Drei Könige");
    add(new Date(year, 10, 1), "Allerheiligen");

    return holidays.filter((h, i, a) => a.findIndex(h2 => h2.date === h.date) === i); 
}


// --- IHK LOGIC ---

function renderIHKView() {
    const { start, end, exam_zwischen, note_zwischen, note_abschluss } = data.settings.ihk;
    const now = new Date().getTime();
    
    // **FIX: Laden der Daten in die UI Felder**
    document.getElementById('confIHKStart').value = start;
    document.getElementById('confIHKEnd').value = end;
    document.getElementById('confIHKExamAbschluss').value = end; 
    document.getElementById('confIHKExamZwischen').value = exam_zwischen;
    document.getElementById('confIHKNoteZwischen').value = note_zwischen;
    document.getElementById('confIHKNoteAbschluss').value = note_abschluss;


    // Hilfsfunktion zur Formatierung der Note
    const formatNote = (note) => {
         const n = parseFloat(note);
         if (isNaN(n) || n === 0) return '---';
         const color = n <= 2.0 ? 'var(--success)' : (n <= 3.0 ? 'var(--audit-warn)' : 'var(--danger)');
         return `<span style="color:${color};">${n.toFixed(1)}</span>`;
    };
    
    // Anzeigen der Noten im Audit-Bereich
    document.getElementById('ihkDisplayNoteZwischen').innerHTML = formatNote(note_zwischen);
    document.getElementById('ihkDisplayNoteAbschluss').innerHTML = formatNote(note_abschluss);
    
    // 1. Ausbildungsfortschritt (Prozente)
    if (start && end) {
        const startDate = new Date(start).getTime();
        const endDate = new Date(end).getTime();
        
        const totalDuration = endDate - startDate;
        const elapsedDuration = now - startDate;
        const daysInTraining = Math.ceil(elapsedDuration / (1000 * 60 * 60 * 24));
        
        if (totalDuration > 0 && elapsedDuration >= 0) {
            const progressPct = Math.min((elapsedDuration / totalDuration) * 100, 100);
            document.getElementById('ihkProgress').innerText = `${progressPct.toFixed(1)}%`;
            document.getElementById('ihkProgressBar').style.width = `${progressPct}%`;
            document.getElementById('ihkStartEndDates').innerText = `${daysInTraining} Tage absolviert.`;
        } else {
            document.getElementById('ihkProgress').innerText = '0%';
            document.getElementById('ihkProgressBar').style.width = '0%';
            document.getElementById('ihkStartEndDates').innerText = `Daten fehlen/Ungültig.`;
        }
    } else {
         document.getElementById('ihkProgress').innerText = 'Daten fehlen';
         document.getElementById('ihkProgressBar').style.width = '0%';
         document.getElementById('ihkStartEndDates').innerText = `Daten fehlen/Ungültig.`;
    }
    
    // 2. Gesamt Soll-Stunden Audit
    if (start && end) {
        let totalExpectedHours = 0;
        let currentDate = new Date(start);
        const endDateObj = new Date(end);
        
        const bookedDays = new Map(); 
        data.entries.forEach(e => {
            bookedDays.set(e.date, e.type);
        });
        
        while (currentDate <= endDateObj) {
            const dateKey = currentDate.toISOString().split('T')[0];
            const dayIndex = currentDate.getDay(); 
            const expected = data.settings.hours[dayIndex] || 0;
            
            if (expected > 0) {
                const bookedType = bookedDays.get(dateKey);
                
                if (bookedType !== 'vacation' && bookedType !== 'holiday' && bookedType !== 'sick') {
                    totalExpectedHours += expected;
                }
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }
        document.getElementById('ihkTotalExpectedHours').innerText = `${totalExpectedHours.toFixed(0)}h`;
    } else {
         document.getElementById('ihkTotalExpectedHours').innerText = '0h';
    }

    // 3. Fehlzeiten Protokoll 
    const sickDays = data.entries.filter(e => e.type === 'sick' && e.expected > 0).length;
    const schoolDays = data.entries.filter(e => e.type === 'school' && e.expected > 0).length;

    document.getElementById('ihkSickDays').innerText = sickDays;
    document.getElementById('ihkSchoolDays').innerText = schoolDays;
    
    const elapsedDurationDays = start ? Math.ceil((now - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const totalMissedDays = sickDays; 
    
    const warningEl = document.getElementById('ihkMissedTimeWarning');
    
    if (elapsedDurationDays > 0) {
        const currentMissedPct = (totalMissedDays / elapsedDurationDays) * 100;
        
        warningEl.innerText = `${currentMissedPct.toFixed(1)}%`;

        if (currentMissedPct >= 10.0) {
            warningEl.style.color = 'var(--danger)';
        } else if (currentMissedPct >= 5.0) {
            warningEl.style.color = 'var(--audit-warn)';
        } else {
            warningEl.style.color = 'var(--success)';
        }

    } else {
        warningEl.innerText = 'Daten fehlen';
        warningEl.style.color = 'var(--text-muted)';
    }

    // 4. Countdown Anzeigen
    const countdownEndAuditEl = document.getElementById('ihkCountdownEndAudit');
    const countdownZwischenEl = document.getElementById('ihkCountdownZwischen');
    
    if (end) {
        const examDate = new Date(end).getTime();
        const diffMs = examDate - now;
        
        document.getElementById('ihkExamDateEnd').innerText = new Date(end).toLocaleDateString('de-DE');

        if (diffMs > 0) {
            const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            countdownEndAuditEl.innerText = daysLeft;
            countdownEndAuditEl.style.color = daysLeft < 90 ? 'var(--danger)' : 'var(--ihk)';
        } else {
            countdownEndAuditEl.innerText = '0';
            countdownEndAuditEl.style.color = 'var(--success)';
        }
    } else {
        countdownEndAuditEl.innerText = '---';
        document.getElementById('ihkExamDateEnd').innerText = 'Datum fehlt';
    }
    
    if (exam_zwischen) {
        const examDate = new Date(exam_zwischen).getTime();
        const diffMs = examDate - now;

        if (diffMs > 0) {
            const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            countdownZwischenEl.innerText = daysLeft;
            countdownZwischenEl.style.color = daysLeft < 60 ? 'var(--danger)' : 'var(--ihk)';
        } else {
            countdownZwischenEl.innerText = '0';
            countdownZwischenEl.style.color = 'var(--success)';
        }
    } else {
        countdownZwischenEl.innerText = '---';
    }
}

function saveIHKSettings() {
    data.settings.ihk.start = document.getElementById('confIHKStart').value;
    data.settings.ihk.end = document.getElementById('confIHKEnd').value;
    data.settings.ihk.exam_zwischen = document.getElementById('confIHKExamZwischen').value;
    data.settings.ihk.note_zwischen = document.getElementById('confIHKNoteZwischen').value;
    data.settings.ihk.note_abschluss = document.getElementById('confIHKNoteAbschluss').value;
    
    save();
    renderIHKView();
    alert('IHK Daten (inkl. Noten) gespeichert und berechnet.');
}


// --- SCHOOL LOGIC ---

function getNoteColor(note) {
     const n = parseFloat(note);
     if (isNaN(n) || n === 0) return 'var(--text-muted)';
     if (n <= 2.0) return 'var(--note-good)';
     if (n <= 3.0) return 'var(--note-mid)';
     return 'var(--note-bad)';
}

function renderSchoolGradesInputs() {
    const inputGrid = document.getElementById('schoolGradesInputGrid');
    let html = '';
    
    for (const subject in data.settings.school.grades) {
         const grades = data.settings.school.grades[subject];
         
         html += `
            <div style="background:rgba(255,255,255,0.05); padding:1rem; border-radius:12px;">
                <h5 style="color:var(--school); margin-bottom:10px;">${subject}</h5>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    ${grades.map((grade, index) => `
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <label style="font-size:0.8rem; color:var(--text-muted);">Note ${index + 1}:</label>
                            <input type="number" step="0.1" min="1.0" max="6.0" 
                                class="glass-input school-grade-input" data-subject="${subject}" data-index="${index}" value="${grade}"
                                style="width:80px; padding:8px; text-align:center; font-family:var(--font-mono);">
                        </div>
                    `).join('')}
                    
                    <button class="btn btn-ghost" onclick="addSchoolGrade('${subject}')" style="background:transparent; border:1px solid var(--school); color:var(--school); padding:8px;">+ Note hinzufügen</button>
                </div>
            </div>
         `;
    }
    
    inputGrid.innerHTML = html + `
         <div style="grid-column: 1 / -1; display:flex; justify-content:flex-end; margin-top:1rem;">
            <button class="btn btn-primary" onclick="saveSchoolGrades()" style="width: 300px; background:var(--school);">Noten speichern & berechnen</button>
        </div>
    `;
    
    renderSchoolView();
}

function addSchoolGrade(subject) {
     data.settings.school.grades[subject].push(''); 
     renderSchoolGradesInputs();
}

function saveSchoolGrades() {
    const inputs = document.querySelectorAll('.school-grade-input');
    const newGrades = {};
    
    for (const subject in data.settings.school.grades) {
        newGrades[subject] = [];
    }

    inputs.forEach(input => {
        const subject = input.getAttribute('data-subject');
        const grade = parseFloat(input.value);

        if (!isNaN(grade) && grade >= 1.0 && grade <= 6.0) {
             newGrades[subject].push(grade);
        }
    });
    
    data.settings.school.grades = newGrades;
    save();
    renderSchoolGradesInputs(); 
    alert('Berufsschulnoten gespeichert!');
}

function calculateSchoolKPIs() {
    let totalSum = 0;
    let totalCount = 0;
    let bestNote = 6.1; 
    let worstNote = 0.9; 
    let bestSubject = '---';
    let worstSubject = '---';
    
    let gradeListHTML = '';
    
    for (const subject in data.settings.school.grades) {
        const grades = data.settings.school.grades[subject];
        
        if (grades.length > 0) {
            let subjectSum = 0;
            grades.forEach(grade => {
                const n = parseFloat(grade);
                if (!isNaN(n) && n >= 1.0 && n <= 6.0) {
                    totalSum += n;
                    totalCount++;
                    subjectSum += n;

                    if (n < bestNote) {
                        bestNote = n;
                        bestSubject = subject;
                    }
                    if (n > worstNote) {
                        worstNote = n;
                        worstSubject = subject;
                    }
                }
            });
            
            if (grades.filter(n => !isNaN(parseFloat(n))).length > 0) {
                const subjectAvg = subjectSum / grades.filter(n => !isNaN(parseFloat(n))).length;
                const avgColor = getNoteColor(subjectAvg);

                gradeListHTML += `
                    <div class="card" style="padding:1rem; border-left:5px solid ${avgColor}; margin-bottom:0;">
                        <h5 style="color:var(--text-main); margin-bottom:5px;">${subject}</h5>
                        <div style="font-size:1.5rem; font-weight:700; color:${avgColor};">${subjectAvg.toFixed(2)}</div>
                        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:5px;">(${grades.filter(n => !isNaN(parseFloat(n))).length} Noten)</div>
                    </div>
                `;
            }
        }
    }
    
    const overallAvg = totalCount > 0 ? totalSum / totalCount : 0;
    
    if (totalCount === 0) {
        bestNote = 0;
        worstNote = 0;
    } else if (bestNote === 6.1) {
         bestNote = worstNote;
         bestSubject = worstSubject;
    } else if (worstNote === 0.9) {
         worstNote = bestNote;
         worstSubject = bestSubject;
    }
    
    return {
        overallAvg: overallAvg,
        bestNote: bestNote, 
        worstNote: worstNote, 
        bestSubject,
        worstSubject,
        gradeListHTML
    };
}

function renderSchoolView() {
    const kpis = calculateSchoolKPIs();
    
    const avgEl = document.getElementById('schoolOverallAvg');
    const bestNoteEl = document.getElementById('schoolBestNote');
    const bestSubjectEl = document.getElementById('schoolBestSubject');
    const worstNoteEl = document.getElementById('schoolWorstNote');
    const worstSubjectEl = document.getElementById('schoolWorstSubject');
    const kpiBestCard = document.getElementById('kpiBestNote');
    const kpiWorstCard = document.getElementById('kpiWorstNote');
    const kpiOverallCard = document.getElementById('kpiOverallAvg');

    
    if (kpis.overallAvg > 0) {
        avgEl.innerText = kpis.overallAvg.toFixed(2);
        avgEl.style.color = getNoteColor(kpis.overallAvg);
        
        // Beste Note
        bestNoteEl.innerText = kpis.bestNote > 0 ? kpis.bestNote.toFixed(1) : '---';
        bestNoteEl.style.color = getNoteColor(kpis.bestNote);
        bestSubjectEl.innerText = kpis.bestSubject;
        kpiBestCard.style.borderLeftColor = getNoteColor(kpis.bestNote);
        
        // Schlechteste Note
        worstNoteEl.innerText = kpis.worstNote > 0 ? kpis.worstNote.toFixed(1) : '---';
        worstNoteEl.style.color = getNoteColor(kpis.worstNote);
        worstSubjectEl.innerText = kpis.worstSubject;
        kpiWorstCard.style.borderLeftColor = getNoteColor(kpis.worstNote);
        
        // Overall Avg card border coloring
        if (!isNaN(kpis.overallAvg) && kpis.overallAvg > 0) {
            kpiOverallCard.style.borderLeftColor = getNoteColor(kpis.overallAvg);
        } else {
            kpiOverallCard.style.borderLeftColor = 'var(--school)';
        }

    } else {
        avgEl.innerText = '---';
        avgEl.style.color = 'var(--school)';
        
        bestNoteEl.innerText = '---';
        worstNoteEl.innerText = '---';
        bestSubjectEl.innerText = '';
        worstSubjectEl.innerText = '';
        kpiBestCard.style.borderLeftColor = 'var(--note-good)';
        kpiWorstCard.style.borderLeftColor = 'var(--note-bad)';
        kpiOverallCard.style.borderLeftColor = 'var(--school)';
    }
    
    document.getElementById('schoolGradesList').innerHTML = kpis.gradeListHTML;
}


// --- HISTORY / ANALYSE LOGIC ---

function filterHistoryData() {
    const startStr = document.getElementById('historyFilterStart').value;
    const endStr = document.getElementById('historyFilterEnd').value;
    const type = document.getElementById('historyFilterType').value;
    const minHours = parseFloat(document.getElementById('historyFilterMinHours').value) || 0;
    const searchText = document.getElementById('historyFilterSearch').value.toLowerCase();

    let filtered = data.entries;

    if (startStr) {
        filtered = filtered.filter(e => new Date(e.date) >= new Date(startStr));
    }
    if (endStr) {
        const endDate = new Date(endStr);
        endDate.setDate(endDate.getDate() + 1); 
        filtered = filtered.filter(e => new Date(e.date) < endDate);
    }
    if (type !== 'all') {
        filtered = filtered.filter(e => e.type === type);
    }
    if (minHours > 0) {
        filtered = filtered.filter(e => e.worked >= minHours);
    }
    if (searchText) {
        filtered = filtered.filter(e => e.info.toLowerCase().includes(searchText));
    }

    return filtered;
}

function renderHistoryView() {
    const filteredData = filterHistoryData();
    const historyListEl = document.getElementById('entryListFull');
    
    document.getElementById('historyCount').innerText = `${filteredData.length} Einträge`;

    if (filteredData.length === 0) {
        historyListEl.innerHTML = '<p style="color:var(--text-muted); text-align:center;">Keine Einträge gefunden, Filter anpassen.</p>';
        return;
    }

    const createRow = (e) => `
        <div class="entry-row type-${e.type}">
            <div>
                <div class="entry-date">${new Date(e.date).toLocaleDateString('de-DE')}</div>
                <div class="entry-meta">${e.isPeriod ? e.label : e.info} (${e.worked.toFixed(2)}h) ${e.shiftWarning ? '<span style="color:var(--danger); font-weight:700;">⚠ MAX!</span>' : ''}</div>
            </div>
            <div style="display:flex; align-items:center; gap:15px;">
                <span class="tag">${e.type === 'school' ? 'SCHULE' : (e.type === 'holiday' ? 'FEIERTAG' : e.type.toUpperCase())}</span>
                <div style="font-weight:700; width:60px; text-align:right; color:${e.diff>=0?'var(--success)':'var(--danger)'}">
                    ${e.diff>=0?'+':''}${e.diff.toFixed(2)}
                </div>
                <div>
                    <button class="btn-ghost" style="padding:5px;" onclick="editEntry(${e.id})">✎</button>
                    <button class="btn-ghost" style="padding:5px; color:var(--danger)" onclick="delEntry(${e.id})">×</button>
                </div>
            </div>
        </div>
    `;

    historyListEl.innerHTML = filteredData.map(createRow).join('');
}

function exportHistoryData(format) {
    const filtered = filterHistoryData(); 

    if (filtered.length === 0) {
        return alert('Keine Daten für den Export gefunden. Bitte Filter prüfen.');
    }

    let fileContent;
    let fileName;
    let mimeType;

    if (format === 'json') {
        fileContent = JSON.stringify(filtered, null, 2);
        fileName = 'time_pro_export_filtered.json';
        mimeType = 'application/json';
    } else if (format === 'csv') {
        fileContent = convertToCSV(filtered);
        fileName = 'time_pro_export_filtered.csv';
        mimeType = 'text/csv';
    } else {
        return;
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    
    alert(`Export von ${filtered.length} gefilterten Einträgen als ${format.toUpperCase()} gestartet.`);
}

function convertToCSV(dataArray) {
    if (dataArray.length === 0) return '';
    
    const headers = ['Datum', 'Typ', 'Arbeitszeit_h', 'Sollzeit_h', 'Differenz_h', 'Info', 'Break_Min', 'Shift_Warning'];
    
    const csvRows = [headers.join(';')]; 

    for (const entry of dataArray) {
        const row = [
            entry.date,
            entry.type,
            entry.worked.toFixed(2).replace('.', ','),
            entry.expected.toFixed(2).replace('.', ','),
            entry.diff.toFixed(2).replace('.', ','),
            entry.info.replace(/,/g, ''),
            entry.breakMins,
            entry.shiftWarning ? 'JA' : 'NEIN'
        ];
        csvRows.push(row.join(';'));
    }

    return csvRows.join('\n');
}

// --- UI LISTS & AUDIT HELPERS ---
function renderLists() {
    const el = document.getElementById('entryListShort');
    if (!el) return;

    const latest = [...data.entries].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,5);
    if (latest.length === 0) {
        el.innerHTML = '<p style="color:var(--text-muted); text-align:center;">Keine Einträge</p>';
        return;
    }

    const rows = latest.map(e => {
        const dateStr = new Date(e.date).toLocaleDateString('de-DE');
        const info = e.info || '';
        const diffSign = e.diff >= 0 ? '+' : '';
        const typeLabel = e.type === 'school' ? 'SCHULE' : (e.type === 'holiday' ? 'FEIERTAG' : e.type.toUpperCase());
        // map entry type to a color variable
        const typeColor = (e.type === 'school' && 'var(--school)') || (e.type === 'vacation' && 'var(--success)') || (e.type === 'sick' && 'var(--danger)') || (e.type === 'holiday' && 'var(--holiday)') || 'var(--primary)';

        return `
            <div class="entry-row type-${e.type}">
                <div>
                    <div class="entry-date">${dateStr}</div>
                    <div class="entry-meta">${info}</div>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="dot" style="width:12px; height:12px; border-radius:3px; background:${typeColor}"></div>
                    <div style="font-weight:700; width:70px; text-align:right; color:${e.diff>=0?'var(--success)':'var(--danger)'}">${diffSign}${e.diff.toFixed(2)}h</div>
                    <div style="display:flex; gap:6px;">
                        <button class="btn-ghost" style="padding:6px; font-size:0.9rem;" onclick="editEntry(${e.id})">✎</button>
                        <button class="btn-ghost" style="padding:6px; font-size:0.9rem; color:var(--danger)" onclick="delEntry(${e.id})">×</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    el.innerHTML = rows;
}

function renderAuditProtocol() {
    // Holidays: read last holiday check summary
    const lastHolidayRaw = localStorage.getItem('tg_last_holiday_check');
    let holidayTxt = 'Wird geladen...';
    if (!lastHolidayRaw) {
        holidayTxt = 'Noch nicht geprüft';
    } else {
        try {
            const obj = JSON.parse(lastHolidayRaw);
            const count = obj.count || 0;
            const next = obj.next ? (`${obj.next.date} (${obj.next.name || ''})`) : '---';
            holidayTxt = `${count} gebucht. Nächster: ${next}`;
        } catch (e) {
            holidayTxt = 'Fehler beim Lesen';
        }
    }
    const hv = document.getElementById('auditHolidayValue'); if (hv) hv.innerText = holidayTxt;

    // Shift warnings: latest entry with shiftWarning
    const lastShift = [...data.entries].sort((a,b) => new Date(b.date) - new Date(a.date)).find(x => x.shiftWarning);
    const sv = document.getElementById('auditShiftValue');
    if (sv) sv.innerText = lastShift ? `${new Date(lastShift.date).toLocaleDateString('de-DE')} (${lastShift.shiftEnd || ''})` : 'Keine Warnung';

    // Last autosave
    const lastSave = localStorage.getItem('tg_last_save');
    const saveEl = document.getElementById('auditSaveValue');
    if (saveEl) {
        if (!lastSave) saveEl.innerText = 'Nie';
        else {
            const diffSec = Math.floor((Date.now() - parseInt(lastSave || 0, 10)) / 1000);
            let txt = '';
            if (diffSec < 60) txt = 'Vor Sekunden';
            else if (diffSec < 3600) txt = `Vor ${Math.floor(diffSec/60)} Minuten`;
            else if (diffSec < 86400) txt = `Vor ${Math.floor(diffSec/3600)} Stunden`;
            else txt = `Vor ${Math.floor(diffSec/86400)} Tagen`;
            saveEl.innerText = txt;
        }
    }
}
