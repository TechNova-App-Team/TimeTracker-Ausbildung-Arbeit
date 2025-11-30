// Abhängigkeiten: data, getWeek, getNoteColor (aus features.js)

function setRadial(ringId, txtId, val) {
    const el = document.getElementById(ringId);
    const txt = document.getElementById(txtId);
    let pct = 0.5 + (val / 40); 
    if(pct > 1) pct = 1; if(pct < 0) pct = 0;
    const offset = 276 - (pct * 276);
    el.style.strokeDashoffset = offset;
    if(val < 0) el.style.stroke = 'var(--danger)';
    else el.style.stroke = 'var(--primary)';
    txt.innerText = (val>=0?'+':'') + val.toFixed(1) + 'h';
}

function renderTrend(dataPoints, elementId, areaFill = true) {
    const c = document.getElementById(elementId);
    if(!c) return; 
    if(dataPoints.length < 2) { c.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100%; color:#555;">Noch keine Daten</div>'; return; }
    
    const subset = dataPoints.slice(-30); 
    const max = Math.max(...subset);
    const min = Math.min(...subset);
    const range = max - min || 1;
    
    const w = c.clientWidth;
    const h = 200;
    
    let path = '';
    subset.forEach((val, i) => {
        const x = (i / (subset.length - 1)) * w;
        const y = h - ((val - min) / range * (h - 40)) - 20;
        path += `${i===0?'M':'L'} ${x} ${y} `;
    });

    let areaPath = '';
    let defs = '';
    if(areaFill) {
         areaPath = `L ${w} ${h} L 0 ${h} Z`;
         defs = `
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:var(--primary);stop-opacity:0.2" />
                    <stop offset="100%" style="stop-color:var(--primary);stop-opacity:0" />
                </linearGradient>
            </defs>`;
    }

    c.innerHTML = `
        <svg class="trend-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
            ${defs}
            ${areaFill ? `<path d="${path} ${areaPath}" fill="url(#grad)" />` : ''}
            <path d="${path}" class="trend-line" />
        </svg>
    `;
}

function renderDonut(work, vac, sick, school, holiday) { 
    const total = work + vac + sick + school + holiday || 1; 
    const c = 251; 
    
    const setSeg = (id, val, offset) => {
        const el = document.getElementById(id);
        if (!el) return offset; 
        const dash = (val / total) * c;
        el.style.strokeDasharray = `${dash} ${c}`;
        el.style.strokeDashoffset = -offset;
        return offset + dash;
    };

    let off = 0;
    off = setSeg('donutWork', work, off);
    off = setSeg('donutSchool', school, off); 
    off = setSeg('donutVac', vac, off);
    off = setSeg('donutSick', sick, off);
    off = setSeg('donutHoliday', holiday, off); 
}

function calculatePerformanceData() {
    const now = new Date();
    const oneDay = 86400000;
    const oneWeek = 7 * oneDay;

    const weeklyData = [];
    let weekTotalActual = 0;
    let weekTotalExpected = 0;
    let earliestDate = now.getTime() - (90 * oneDay);

    for (let i = 0; i < 8; i++) {
        const startOfWeek = new Date(now.getTime() - (i * oneWeek));
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() || 7) + 1); 

        const weekEntries = data.entries.filter(e => {
            const eDate = new Date(e.date);
            return eDate >= startOfWeek && eDate < new Date(startOfWeek.getTime() + oneWeek);
        });

        let actual = 0;
        let expected = 0;

        weekEntries.forEach(e => {
            actual += e.worked;
            expected += e.expected;

            const eTime = new Date(e.date).getTime();
            if (eTime >= earliestDate) {
                weekTotalActual += e.worked;
                weekTotalExpected += e.expected;
            }
        });
        
        const weekNum = getWeek(startOfWeek);
        weeklyData.unshift({ 
            actual: actual, 
            expected: expected, 
            label: `KW ${weekNum}`, 
            date: startOfWeek.getTime()
        });
    }
    
    const monthlyTrend = {};
    for (let i = 0; i < 12; i++) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
        monthlyTrend[monthKey] = { diff: 0, label: monthDate.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }) };
    }
    
    data.entries.forEach(e => {
        const date = new Date(e.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (monthlyTrend[monthKey]) {
            monthlyTrend[monthKey].diff += e.diff;
        }
    });
    
    const monthlyTrendData = Object.values(monthlyTrend).reverse();
    
    const performanceScore = weekTotalExpected > 0 ? (weekTotalActual / weekTotalExpected) * 100 : 0;
    const totalMonthlyDiff = monthlyTrendData.reduce((sum, item) => sum + item.diff, 0);
    const validMonthlyCount = monthlyTrendData.filter(d => d.diff !== 0).length || 1; 
    const avgMonthlyDiff = totalMonthlyDiff / validMonthlyCount;


    return {
        weekly: weeklyData,
        monthly: monthlyTrendData,
        kpiScore: performanceScore,
        kpiExpected90: weekTotalExpected,
        kpiAvgMonthlyDiff: avgMonthlyDiff
    };
}

function calculateDeepPerformanceData() {
    // 1. Produktiver Wochentag (0=So, 6=Sa)
    const dayStats = [
        { totalDiff: 0, count: 0, label: 'So' }, // 0
        { totalDiff: 0, count: 0, label: 'Mo' }, // 1
        { totalDiff: 0, count: 0, label: 'Di' }, // 2
        { totalDiff: 0, count: 0, label: 'Mi' }, // 3
        { totalDiff: 0, count: 0, label: 'Do' }, // 4
        { totalDiff: 0, count: 0, label: 'Fr' }, // 5
        { totalDiff: 0, count: 0, label: 'Sa' }  // 6
    ];
    
    // 2. Produktivitäts-Heatmap (Stunden 8 bis 23 Uhr)
    // Index 0 = 8 Uhr, Index 15 = 23 Uhr
    const hourlyStats = new Array(16).fill(null).map(() => ({ totalWorked: 0, count: 0 }));
    
    data.entries.forEach(e => {
        const d = new Date(e.date);
        const dayIndex = d.getDay();
        
        // Wochentag Statistik (nur Arbeitstage mit Soll-Zeit > 0 und Diff != 0)
        if (data.settings.hours[dayIndex] > 0 && e.diff !== 0) {
             dayStats[dayIndex].totalDiff += e.diff;
             dayStats[dayIndex].count++;
        }

        // Stunden-Statistik (Nur 'work'-Typ, mit tatsächlicher Zeitangabe)
        if (e.type === 'work' && e.info && e.info.includes('-')) {
            try {
                const infoParts = e.info.split(' ');
                const timeRange = infoParts[0]; // z.B. "08:00-17:00"
                
                if (!timeRange.includes('-')) return;

                const [timeStartStr, timeEndStr] = timeRange.split('-');
                let [h1, m1] = timeStartStr.split(':').map(Number);
                let [h2, m2] = timeEndStr.split(':').map(Number);
                
                const netWorkedMinutes = e.worked * 60;
                
                let startTimeMins = h1 * 60 + m1;
                let endTimeMins = h2 * 60 + m2;

                if (endTimeMins < startTimeMins) endTimeMins += 24 * 60; // Nächster Tag

                const totalShiftMinutes = endTimeMins - startTimeMins;
                if (totalShiftMinutes <= 0) return;

                // Start- und End-Stunde (8:00 = 8)
                const startHour = Math.floor(startTimeMins / 60);
                const endHour = Math.ceil(endTimeMins / 60);

                for (let hour = startHour; hour < endHour; hour++) {
                    const effectiveHour = hour % 24;
                    
                    if (effectiveHour >= 8 && effectiveHour <= 23) {
                        // Index ist Stunde - 8 (8 Uhr = 0, 23 Uhr = 15)
                        const index = effectiveHour - 8;
                        
                        const hourStartMins = hour * 60;
                        const hourEndMins = (hour + 1) * 60;
                        
                        // Berechne die Schnittmenge der Schichtzeit mit der aktuellen Stunde (in Minuten)
                        const segmentStart = Math.max(startTimeMins, hourStartMins);
                        const segmentEnd = Math.min(endTimeMins, hourEndMins);
                        const minutesInHour = Math.max(0, segmentEnd - segmentStart);
                        
                        // Anteil der Nettoarbeitszeit, die in diese Stunde fällt
                        const workedFraction = minutesInHour / totalShiftMinutes;
                        const workedInThisHour = workedFraction * netWorkedMinutes / 60; // In Stunden
                        
                        if (index >= 0 && index < hourlyStats.length) {
                            hourlyStats[index].totalWorked += workedInThisHour;
                            hourlyStats[index].count++;
                        }
                    }
                }
            } catch(e) {
                console.error("Fehler bei Heatmap-Berechnung:", e);
            }
        }
    });
    
    return { dayStats, hourlyStats };
}

function renderPerformanceView(data, deepData) {
    
    // KPI Render (unverändert)
    const scoreEl = document.getElementById('kpiPerformance');
    scoreEl.innerText = `${data.kpiScore.toFixed(0)}%`;
    scoreEl.style.color = data.kpiScore >= 100 ? 'var(--success)' : (data.kpiScore >= 95 ? '#fbbf24' : 'var(--danger)');

    document.getElementById('kpiExpected90').innerText = `${data.kpiExpected90.toFixed(1)}h`;
    
    const avgDiffEl = document.getElementById('kpiAvgMonthlyDiff');
    avgDiffEl.innerText = `${data.kpiAvgMonthlyDiff >= 0 ? '+' : ''}${data.kpiAvgMonthlyDiff.toFixed(1)}h`;
    avgDiffEl.style.color = data.kpiAvgMonthlyDiff >= 0 ? 'var(--primary)' : 'var(--danger)';
    
    // Wöchentlicher Soll/Ist Vergleich (unverändert)
    const barContainer = document.getElementById('chartWeeklyPerformance');
    const weeklyBars = data.weekly;
    
    const maxVal = Math.max(...weeklyBars.map(d => Math.max(d.actual, d.expected, 1))); 
    const chartHeight = 250;
    const scaleFactor = (chartHeight - 40) / maxVal; 
    
    barContainer.innerHTML = '';
    const barGrid = document.createElement('div');
    barGrid.className = 'bar-chart-grid';
    
    weeklyBars.forEach((d) => {
        const actualH = d.actual * scaleFactor;
        const expectedH = d.expected * scaleFactor;
        
        const col = document.createElement('div');
        col.className = 'bar-col';
        
        const barExp = document.createElement('div');
        barExp.className = 'bar bar-expected';
        barExp.style.height = `${expectedH}px`;
        
        const barAct = document.createElement('div');
        barAct.className = 'bar bar-actual';
        barAct.style.height = `${actualH}px`;
        
        const label = document.createElement('span');
        label.className = 'bar-label';
        label.innerText = d.label;

        col.appendChild(barExp);
        col.appendChild(barAct);
        col.appendChild(label);
        barGrid.appendChild(col);
    });
    
    barContainer.appendChild(barGrid);


    // Saldo Trend (unverändert)
    const monthlyDiffs = data.monthly.map(d => d.diff);
    const monthlyLabels = data.monthly.map(d => d.label);
    
    const trendContainer = document.getElementById('chartMonthlyTrend');
    if (monthlyDiffs.length < 2) {
        trendContainer.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100%; color:#555;">Für den Trend werden mehr Daten benötigt (mind. 2 Monate).</div>';
        return;
    }

    const h = 200;
    const w = trendContainer.clientWidth;
    
    const max = Math.max(...monthlyDiffs);
    const min = Math.min(...monthlyDiffs);
    const range = max - min || 1;
    
    let path = '';
    monthlyDiffs.forEach((val, i) => {
        const x = (i / (monthlyDiffs.length - 1)) * w;
        const y = h - ((val - min) / range * (h - 40)) - 20; 
        path += `${i===0?'M':'L'} ${x} ${y} `;
    });

    const zeroLineY = h - ((0 - min) / range * (h - 40)) - 20;
    
    trendContainer.innerHTML = `
        <svg class="trend-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="overflow: visible;">
            <line x1="0" y1="${zeroLineY}" x2="${w}" y2="${zeroLineY}" stroke="rgba(148, 163, 184, 0.4)" stroke-dasharray="4" stroke-width="1"/>
            
            <path d="${path}" class="trend-line" style="stroke: var(--primary); stroke-width: 3;" />
            
            ${monthlyDiffs.map((val, i) => {
                const x = (i / (monthlyDiffs.length - 1)) * w;
                const y = h - ((val - min) / range * (h - 40)) - 20;
                return `
                    <circle cx="${x}" cy="${y}" r="4" fill="var(--primary)"/>
                    <text x="${x}" y="${h + 15}" text-anchor="middle" font-size="10" fill="var(--text-muted)">${monthlyLabels[i]}</text>
                `;
            }).join('')}
        </svg>
    `;
    
    // --- DEEP DIVE RENDER ---
    
    // 1. Produktiver Wochentag (FIXED)
    const dayChartContainer = document.getElementById('chartProductivityByDay');
    const dayStats = deepData.dayStats.slice(1, 6); // Nur Mo-Fr (Index 1 bis 5)
    const dayAverages = dayStats.map(d => d.count > 0 ? d.totalDiff / d.count : 0);
    
    // Findet den Maximalwert (Absolut) über alle positiven und negativen Durchschnitte
    const maxAbsDiff = Math.max(1, ...dayAverages.map(Math.abs)); // Minimum 1, um Division durch Null zu vermeiden
    const chartHeightPx = 200;
    const chartCenterY = chartHeightPx / 2;
    const barMaxHeight = chartCenterY - 20; // 80px max Höhe

    dayChartContainer.innerHTML = '';
    const dayBarGrid = document.createElement('div');
    dayBarGrid.className = 'bar-chart-grid';
    dayBarGrid.style.gridTemplateColumns = 'repeat(5, 1fr)';
    dayBarGrid.style.height = `${chartHeightPx}px`;
    dayBarGrid.style.paddingBottom = '30px'; 
    
    const dayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
    
    dayAverages.forEach((avgDiff, index) => {
        const absHeight = Math.abs(avgDiff) / maxAbsDiff * barMaxHeight;
        const isPositive = avgDiff >= 0;
        const barColor = isPositive ? 'var(--success)' : 'var(--danger)'; // Grün/Rot für Saldo-Differenz
        
        const col = document.createElement('div');
        col.className = 'bar-col';
        col.style.height = '100%';
        col.style.position = 'relative'; 

        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${absHeight}px`;
        bar.style.width = '25px';
        bar.style.background = barColor;
        
        // Positionierung relativ zur Y-Mitte (chartCenterY)
        if (isPositive) {
            bar.style.bottom = `${chartCenterY}px`;
            bar.style.transform = 'translateY(0)';
            bar.style.borderRadius = '3px 3px 0 0';
        } else {
            bar.style.bottom = `${chartCenterY}px`;
            bar.style.transform = 'translateY(100%)'; // Beginnt an der Mittellinie und wächst nach unten
            bar.style.borderRadius = '0 0 3px 3px';
        }
        
        // Value Label
        const valueLabel = document.createElement('span');
        valueLabel.style.position = 'absolute';
        valueLabel.style.fontSize = '0.7rem';
        valueLabel.style.fontWeight = '600';
        valueLabel.style.color = barColor;
        valueLabel.style.bottom = isPositive ? `${chartCenterY + absHeight + 5}px` : `${chartCenterY - absHeight - 20}px`; 
        valueLabel.style.left = '50%';
        valueLabel.style.transform = 'translateX(-50%)';
        valueLabel.innerText = avgDiff.toFixed(1) + 'h';

        const label = document.createElement('span');
        label.className = 'bar-label';
        label.innerText = dayLabels[index];
        label.style.bottom = '10px'; // Fester Abstand zum Boden des Containers

        col.appendChild(bar);
        col.appendChild(valueLabel);
        col.appendChild(label);
        dayBarGrid.appendChild(col);
    });
    
    // Mittellinie (Y=100px)
    const zeroLine = document.createElement('div');
    zeroLine.style.position = 'absolute';
    zeroLine.style.top = `${chartCenterY}px`;
    zeroLine.style.left = '0';
    zeroLine.style.width = '100%';
    zeroLine.style.height = '1px';
    zeroLine.style.background = 'rgba(255,255,255,0.2)';
    
    dayChartContainer.style.position = 'relative';
    dayChartContainer.innerHTML = '';
    dayChartContainer.appendChild(zeroLine);
    dayChartContainer.appendChild(dayBarGrid);


    // 2. Produktivitäts-Heatmap (FIXED)
    const heatmapContainer = document.getElementById('chartProductivityHeatmap');
    const hourlyStats = deepData.hourlyStats;
    
    // Find Max for scaling colors
    const maxWorked = Math.max(0.1, ...hourlyStats.map(h => h.count > 0 ? h.totalWorked / h.count : 0));
    
    let heatmapHTML = '';
    
    // Render Hour Labels (8:00 - 23:00)
    let columns = window.innerWidth < 1024 ? 8 : 16;
    let labelHTML = '<div style="display:grid; grid-template-columns: repeat(' + columns + ', 1fr); gap:5px; margin-bottom:5px; margin-top:20px;">';
    for (let i = 8; i <= 23; i++) {
         if (window.innerWidth >= 1024 || (i % 2 === 0)) {
            labelHTML += `<span class="heatmap-label">${i}:00</span>`;
         }
    }
    labelHTML += '</div>';
    heatmapHTML += labelHTML;

    // Helper for color
    function getHeatmapColor(ratio) {
         const alpha = 0.15 + ratio * 0.7; // Startet bei 15%, max 85%
         return `rgba(168, 85, 247, ${alpha})`; 
    }

    // Render Cells
    heatmapHTML += `<div class="heatmap-grid" style="grid-template-columns: repeat(${columns}, 1fr);">`;
    for (let i = 0; i < 16; i++) {
        const avgWorked = hourlyStats[i].count > 0 ? hourlyStats[i].totalWorked / hourlyStats[i].count : 0;
        const hour = 8 + i;
        
        const ratio = avgWorked / maxWorked;
        
        let color = 'rgba(255,255,255, 0.03)';
        let displayValue = avgWorked > 0 ? avgWorked.toFixed(1) + 'h' : '0.0h';

        if (ratio > 0.05) {
             color = getHeatmapColor(ratio);
        }
        
        // Mobile Filter (Nur jede zweite Zelle anzeigen)
        if (window.innerWidth >= 1024 || (hour % 2 === 0)) {
            heatmapHTML += `
                <div class="heatmap-cell" style="background-color: ${color};" title="Ø ${displayValue} gearbeitet um ${hour}:00">
                    
                </div>
            `;
        }
    }
    
    heatmapHTML += '</div>';
    heatmapContainer.innerHTML = heatmapHTML;
}