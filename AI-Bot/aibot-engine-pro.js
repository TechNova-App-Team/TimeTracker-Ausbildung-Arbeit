/**
 * AI-Bot Engine PRO v2.0
 * Advanced Intelligence, Real-time Analytics, Predictive Insights
 * Machine Learning inspired pattern recognition & behavioral analysis
 */

class AIBotEnginePro {
    constructor() {
        this.conversationHistory = [];
        // Use PRO analyzer with safe fallback
        if (typeof aiAnalyzerPro !== 'undefined' && aiAnalyzerPro) {
            this.analyzer = aiAnalyzerPro;
        } else {
            console.warn('[AI-Bot] aiAnalyzerPro nicht verfügbar, verwende Fallback');
            // Create minimal analyzer fallback for graceful degradation
            this.analyzer = {
                getWeeklyStats: () => ({ worked: 0, expected: 0, diff: 0, days: 0, percentage: 0 }),
                getProductivityTrends: () => ({ average: 0 }),
                getTrendAnalysis: () => ({ trend: 'stable', average: 0 }),
                getMonthlyStats: () => ({ worked: 0, expected: 0, diff: 0 }),
                predictMonthEnd: () => ({ predicted: 0 }),
                data: { entries: [] }
            };
        }
        this.userProfile = {};
        this.insights = [];
        this.loadHistory();
        this.buildUserProfile();
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('aiBotHistoryPro');
            this.conversationHistory = saved ? JSON.parse(saved) : [];
        } catch (e) {
            this.conversationHistory = [];
        }
    }

    saveHistory() {
        localStorage.setItem('aiBotHistoryPro', JSON.stringify(this.conversationHistory));
    }

    buildUserProfile() {
        const weekly = this.analyzer.getWeeklyStats();
        const productivity = this.analyzer.getProductivityTrends();
        // getTrendAnalysis exists in PRO version, fallback gracefully
        const trends = (this.analyzer.getTrendAnalysis && typeof this.analyzer.getTrendAnalysis === 'function') 
            ? this.analyzer.getTrendAnalysis() 
            : { trend: 'stable', average: 0 };

        this.userProfile = {
            consistency: this.calculateConsistency(),
            performanceLevel: this.classifyPerformance(parseFloat(productivity.average)),
            workStyle: this.analyzeWorkStyle(),
            focusPattern: this.detectFocusPattern(),
            riskLevel: this.assessRiskLevel(),
            growthPotential: this.estimateGrowth()
        };
    }

    calculateConsistency() {
        const entries = this.analyzer.data.entries.slice(-30);
        if (entries.length < 5) return 'INSUFFICIENT_DATA';

        const hours = entries.map(e => e.worked || 0);
        const avg = hours.reduce((a, b) => a + b, 0) / hours.length;
        const variance = hours.reduce((sum, h) => sum + Math.pow(h - avg, 2), 0) / hours.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev < 1.5) return 'VERY_HIGH';
        if (stdDev < 2.5) return 'HIGH';
        if (stdDev < 3.5) return 'MEDIUM';
        return 'LOW';
    }

    classifyPerformance(avgHours) {
        if (avgHours > 9) return 'ELITE';
        if (avgHours > 8) return 'EXCELLENT';
        if (avgHours > 7) return 'GOOD';
        if (avgHours > 5) return 'ADEQUATE';
        return 'NEEDS_IMPROVEMENT';
    }

    analyzeWorkStyle() {
        const entries = this.analyzer.data.entries.slice(-60);
        if (entries.length === 0) return 'UNKNOWN';

        const hours = entries.map(e => e.worked || 0);
        const maxH = Math.max(...hours);
        const minH = Math.min(...hours);
        const range = maxH - minH;

        if (range > 6) return 'FLEXIBLE';
        if (range > 3) return 'MODERATELY_CONSISTENT';
        return 'HIGHLY_CONSISTENT';
    }

    detectFocusPattern() {
        const entries = this.analyzer.data.entries.slice(-30);
        if (entries.length < 5) return 'INSUFFICIENT_DATA';

        const categories = {};
        entries.forEach(e => {
            const type = e.type || 'work';
            categories[type] = (categories[type] || 0) + (e.worked || 0);
        });

        const dominant = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
        return dominant ? `FOCUS_${dominant[0].toUpperCase()}` : 'BALANCED';
    }

    assessRiskLevel() {
        const weekly = this.analyzer.getWeeklyStats();
        const productivity = this.analyzer.getProductivityTrends();

        const diff = parseFloat(weekly.diff);
        const avg = parseFloat(productivity.average);

        if (diff < -5 && avg < 5) return 'CRITICAL';
        if (diff < -2 || avg < 6) return 'HIGH';
        if (diff < 0) return 'MEDIUM';
        return 'LOW';
    }

    estimateGrowth() {
        const entries = this.analyzer.data.entries.slice(-14);
        if (entries.length < 2) return 0;

        const firstWeek = entries.slice(0, 7).reduce((s, e) => s + (e.worked || 0), 0) / 7;
        const secondWeek = entries.slice(7).reduce((s, e) => s + (e.worked || 0), 0) / 7;
        
        return ((secondWeek - firstWeek) / firstWeek * 100).toFixed(1);
    }

    // ===== ADVANCED INTENT RECOGNITION =====
    recognizeIntent(message) {
        const msg = message.toLowerCase();
        
        // WICHTIG: Spezifischere Patterns zuerst prüfen!
        // Sonst matchen allgemeine Patterns (z.B. "analysi") frühere spezifische
        
        const patterns = {
            // Spezifische Patterns (zuerst prüfen!)
            'ANNUAL': /jahres|annual|komplettes jahr|2025|ganzes jahr|jahresbericht/i,
            'GOALS_DETAIL': /meine ziele|wie stehe ich|fortschritt bei|meilenstein/i,
            'YEAR_COMP': /vergleich.*letztem jahr|vs.*2024|jahresvergleich|jahr.*vergleich/i,
            'INSIGHTS': /personalisiert|einsicht(?!en-mix)/i,  // einsicht aber nicht "einsichten-mix"
            
            // Allgemeine Patterns (danach)
            'ANALYSIS': /analy[sz]|arbeitsgewohnheit|verhalten|statistik|tiefe/i,
            'WEEKLY': /woche|wöch|diese.*woche|letzte.*woche/i,
            'MONTHLY': /monat|monatlich|diese.*monat|gesamt/i,
            'PRODUCTIVITY': /produktiv|effizienz|durchschnitt|leistung|performance/i,
            'FORECAST': /prognose|vorhersag|ende|prediction|forecast/i,
            'RECOMMENDATIONS': /tipp|empfehlung|rat|helfen|verbesser|wie|besser/i,
            'BREAKS': /pause|break|ruhe|entspann|erholung/i,
            'CATEGORIES': /kategorie|verteilung|typ|art|klasse/i,
            'COMPARISON': /vergleich|unterschied|versus|gegen|schneller|langsamer/i,
            'MOTIVATION': /motiv|inspir|challenge|erfolg|record/i,
            'HEALTH': /gesundheit|wellness|balance|stress|fitness|ermudet|müde/i,
            'GOALS': /ziel|target|plan|sollen|wunsch|ideal/i
        };

        // Spezifischere Patterns haben Vorrang
        const specialOrder = ['ANNUAL', 'GOALS_DETAIL', 'YEAR_COMP', 'INSIGHTS'];
        for (const intent of specialOrder) {
            if (patterns[intent].test(msg)) return intent;
        }
        
        // Dann allgemeine Patterns
        for (const [intent, pattern] of Object.entries(patterns)) {
            if (!specialOrder.includes(intent) && pattern.test(msg)) return intent;
        }

        return 'GENERAL';
    }

    // ===== MAIN RESPONSE GENERATOR =====
    generateResponse(userMessage) {
        const intent = this.recognizeIntent(userMessage);
        let response = '';
        let metadata = { intent, confidence: 0.95 };

        switch (intent) {
            case 'ANNUAL':
                response = this.generateAnnualReport();
                break;
            case 'GOALS_DETAIL':
                response = this.generateGoalsReport();
                break;
            case 'YEAR_COMP':
                response = this.generateYearComparison();
                break;
            case 'INSIGHTS':
                response = this.generatePersonalizedInsights();
                break;
            case 'WEEKLY':
                response = this.getAdvancedWeeklyResponse();
                break;
            case 'MONTHLY':
                response = this.getAdvancedMonthlyResponse();
                break;
            case 'ANALYSIS':
                response = this.getDeepAnalysisResponse();
                break;
            case 'PRODUCTIVITY':
                response = this.getProductivityIntelligenceResponse();
                break;
            case 'FORECAST':
                response = this.getAdvancedForecastResponse();
                break;
            case 'RECOMMENDATIONS':
                response = this.getSmartRecommendationsResponse();
                break;
            case 'BREAKS':
                response = this.getBreakWellnessResponse();
                break;
            case 'CATEGORIES':
                response = this.getAdvancedCategoriesResponse();
                break;
            case 'COMPARISON':
                response = this.getComparisonResponse(userMessage);
                break;
            case 'MOTIVATION':
                response = this.getMotivationResponse();
                break;
            case 'HEALTH':
                response = this.getHealthBalanceResponse();
                break;
            case 'GOALS':
                response = this.getGoalPlanningResponse();
                break;
            default:
                response = this.getIntelligentGeneralResponse(userMessage);
                metadata.confidence = 0.75;
        }

        // Save conversation
        this.conversationHistory.push({
            timestamp: new Date().toISOString(),
            user: userMessage,
            bot: response,
            ...metadata
        });
        this.saveHistory();

        return response;
    }

    // ===== RESPONSE BUILDERS (ADVANCED) =====
    getAdvancedWeeklyResponse() {
        const stats = this.analyzer.getWeeklyStats();
        const weekly = this.analyzer.data.entries.filter(e => {
            const date = new Date(e.date);
            const week = this.analyzer.getCurrentWeek();
            return date >= week.start && date <= week.end;
        });

        const statusIcon = parseFloat(stats.diff) >= 0 ? '✅' : '⚠️';
        const trend = weekly.length > 3 ? this.getTrendDirection(weekly) : '→';

        const breakdown = weekly.map(e => e.worked || 0);
        const consistency = breakdown.length > 0 ? Math.abs(1 - (Math.min(...breakdown) / Math.max(...breakdown || 1))) * 100 : 0;

        return `📊 **WEEKLY PERFORMANCE DASHBOARD**

┌─────────────────────────────────┐
│ Gearbeitet: ${stats.worked.padEnd(6)}h  ${statusIcon}
│ Erwartet:   ${stats.expected.padEnd(6)}h
│ Saldo:      ${stats.diff.padEnd(6)}h  ${trend}
│ Quote:      ${stats.percentage}%
└─────────────────────────────────┘

📈 **Deine Stats:**
• Arbeitstage: ${stats.days}
• Konsistenz: ${(100 - consistency).toFixed(0)}%
• Status: ${parseFloat(stats.diff) >= 0 ? '🚀 IM PLAN' : '📍 NACHARBEITEN NÖTIG'}

🎯 ${parseFloat(stats.diff) >= 0 ? `Großartig! Du bist ${stats.diff}h voraus!` : `Du brauchst noch ${Math.abs(stats.diff)}h für dein Ziel!`}`;
    }

    getAdvancedMonthlyResponse() {
        const stats = this.analyzer.getMonthlyStats();
        const prediction = this.analyzer.predictMonthEnd();
        const monthName = new Date().toLocaleDateString('de-DE', { month: 'long' });

        const trend = parseFloat(stats.diff) >= 0 ? '📈' : '📉';

        return `📅 **MONTHLY OVERVIEW - ${monthName.toUpperCase()}**

┌─────────────────────────────────┐
│ Gearbeitet: ${stats.worked.padEnd(6)}h
│ Erwartet:   ${stats.expected.padEnd(6)}h
│ Saldo:      ${stats.diff.padEnd(6)}h  ${trend}
│ Fortschritt: ${stats.percentage}%
└─────────────────────────────────┘

🔮 **Prognose für Monatsende:**
• Prognostiziert: ${prediction.predictedTotal}h
• Verbleibende Tage: ${prediction.daysRemaining}
• Tägl. Durchschnitt: ${prediction.avgPerDay}h

${parseFloat(prediction.predictedTotal) >= parseFloat(stats.expected) ? '✅ Auf Kurs!' : '⚠️ Aufpassen!'}`;
    }

    getDeepAnalysisResponse() {
        const weekly = this.analyzer.getWeeklyStats();
        const trends = this.analyzer.getTrendAnalysis();
        const breakdown = this.analyzer.getCategoryBreakdown();
        const productivity = this.analyzer.getProductivityTrends();

        const avgCategory = Object.entries(breakdown)
            .map(([cat, data]) => ({ cat, avg: data.hours / data.count }))
            .sort((a, b) => b.avg - a.avg)[0];

        return `🔬 **TIEFENANALYSE - Advanced Insights**

**Produktivitäts-Score:**
${this.buildScoreBar(parseFloat(productivity.average) / 10)}  ${productivity.average}h/Tag

**Top Kategorie:**
🏆 ${avgCategory ? avgCategory.cat + ': ' + avgCategory.avg.toFixed(2) + 'h/Einsatz' : 'N/A'}

**Trend Analyse (letzte 30 Tage):**
${trends.trend7d > 0 ? '📈' : '📉'} ${Math.abs(trends.trend7d).toFixed(1)}% ${trends.trend7d > 0 ? 'Anstieg' : 'Rückgang'}

**Kategorien-Mix:**
${Object.entries(breakdown).slice(0, 5).map(([cat, data]) => `• ${cat}: ${data.count}x (${data.hours.toFixed(1)}h)`).join('\n')}

**Empfehlung:**
${this.analyzer.getSmartInsight()}`;
    }

    getProductivityIntelligenceResponse() {
        const productivity = this.analyzer.getProductivityTrends();
        const consistency = this.calculateConsistency();
        const avg = parseFloat(productivity.average);

        let level = '';
        let emoji = '';
        if (avg >= 9) { level = 'ELITE'; emoji = '🌟'; }
        else if (avg >= 8) { level = 'EXCELLENT'; emoji = '⭐'; }
        else if (avg >= 7) { level = 'GOOD'; emoji = '✨'; }
        else if (avg >= 5) { level = 'ADEQUATE'; emoji = '📊'; }
        else { level = 'NEEDS BOOST'; emoji = '📍'; }

        return `💪 **PRODUKTIVITÄTS-INTELLIGENZ**

Performance Level: ${emoji} ${level}

${this.buildScoreBar(avg / 10)}
${avg}h/Tag

**Dein Profil:**
• Konsistenz: ${consistency}
• Work Style: ${this.analyzeWorkStyle()}
• Focus Pattern: ${this.detectFocusPattern()}
• Growth Rate: ${this.estimateGrowth()}%

**Vergleich mit Dir selbst:**
• Best Day: ${productivity.bestDay} (${productivity.bestHours}h)
• Durchschnitt: ${productivity.average}h
• Schwach: ${productivity.worstDay} (${productivity.worstHours}h)

${avg >= 8 ? '🚀 Du bist auf dem richtigen Weg - mach weiter so!' : '💡 Kleine Optimierungen könnten dir helfen!'}`;
    }

    getAdvancedForecastResponse() {
        const prediction = this.analyzer.predictMonthEnd();
        const risk = this.assessRiskLevel();
        const daysRemaining = parseInt(prediction.daysRemaining);
        const avgNeeded = daysRemaining > 0 ? ((parseFloat(prediction.predictedTotal) - parseFloat(prediction.currentTotal)) / daysRemaining).toFixed(2) : 0;

        let riskEmoji = '✅';
        if (risk === 'CRITICAL') riskEmoji = '🔴';
        else if (risk === 'HIGH') riskEmoji = '🟠';
        else if (risk === 'MEDIUM') riskEmoji = '🟡';
        else riskEmoji = '🟢';

        return `🔮 **ADVANCED FORECAST ENGINE**

Risiko-Level: ${riskEmoji} ${risk}

**Szenario:**
├─ Aktuell: ${prediction.currentTotal}h
├─ Prognose: ${prediction.predictedTotal}h
├─ Tage übrig: ${daysRemaining}
└─ Nötig/Tag: ${avgNeeded}h

**Wahrscheinlichkeiten:**
• ${parseFloat(prediction.predictedTotal) >= 180 ? '✅' : '⚠️'} 100%+ Stundenerfüllung: ${parseFloat(prediction.predictedTotal) >= 180 ? 'JA' : 'KRITISCH'}
• Saldo-Ziel erreichbar: ${this.calculateGoalProbability()}%

**Action Items:**
${daysRemaining > 7 ? '✨ Du hast Zeit - alles entspannt!' : `⚡ ${daysRemaining} Tage left - push it!`}`;
    }

    getSmartRecommendationsResponse() {
        const recommendations = this.analyzer.getSmartRecommendations();
        const profile = this.userProfile;

        let response = `💡 **AI-POWERED RECOMMENDATIONS**

**Basiert auf Deinem Profil:**
├─ Konsistenz: ${profile.consistency}
├─ Performance: ${profile.performanceLevel}
└─ Risk: ${profile.riskLevel}

`;

        if (recommendations.length === 0) {
            response += `✨ **PERFECT!** Du machst alles richtig - bleib dran! 🎯`;
        } else {
            recommendations.slice(0, 3).forEach((rec, i) => {
                response += `\n${i + 1}. ${rec.emoji} ${rec.title}\n   → ${rec.action}\n   💪 Impact: ${rec.impact}\n`;
            });
        }

        return response;
    }

    getBreakWellnessResponse() {
        const breaks = this.analyzer.getBreakAnalysis();
        const avgMin = parseFloat(breaks.averageBreakMinutes);

        let wellnessScore = '';
        if (avgMin < 10) wellnessScore = 'NIEDRIG - Du brauchst mehr Erholung!';
        else if (avgMin < 20) wellnessScore = 'MODERAT - Gutes Gleichgewicht!';
        else wellnessScore = 'HOCH - Perfekte Work-Life Balance!';

        return `☕ **WELLNESS & RECOVERY ANALYSIS**

**Pause-Metriken diese Woche:**
├─ Total: ${breaks.totalBreakMinutes} Min
├─ Durchschnitt: ${breaks.averageBreakMinutes} Min/Tag
└─ Arbeitstage: ${breaks.entries}

Wellness Score: ${this.buildScoreBar(avgMin / 30)}  ${wellnessScore}

**Experten-Tipps für Balance:**
• 15-20 Min pro 2h Arbeit (ideal)
• Mache Pausen *bevor* du müde wirst
• Nutze Pausen für echte Erholung

📌 **Dein Status:** ${avgMin < 15 ? '⚠️ Mehr Pausen nötig!' : '✅ Gesundes Gleichgewicht!'}`;
    }

    getAdvancedCategoriesResponse() {
        const breakdown = this.analyzer.getCategoryBreakdown();
        const total = Object.values(breakdown).reduce((s, d) => s + d.hours, 0);

        let response = `📂 **KATEGORIE-INTELLIGENZ (letzte 60 Tage)**\n\n`;

        // Sortiert nach Stunden
        const sorted = Object.entries(breakdown)
            .sort((a, b) => b[1].hours - a[1].hours)
            .slice(0, 5);

        sorted.forEach(([category, data], i) => {
            const percent = ((data.hours / total) * 100).toFixed(0);
            const bar = this.buildBar(parseFloat(percent));
            response += `${i + 1}. ${category.toUpperCase()}\n   ${bar} ${percent}% (${data.hours.toFixed(1)}h, ${data.count}x)\n\n`;
        });

        response += `**Insights:**
• Fokus: ${sorted[0]?.[0] || 'N/A'}
• Diversität: ${Object.keys(breakdown).length} Kategorien`;

        return response;
    }

    getComparisonResponse(message) {
        const weekly = this.analyzer.getWeeklyStats();
        const productivity = this.analyzer.getProductivityTrends();

        return `📊 **VERGLEICHS-ANALYSE**

**Diese Woche vs. Erwartung:**
${this.buildComparisonBar(parseFloat(weekly.worked), parseFloat(weekly.expected))}

**Dein Durchschnitt vs. Dein Best:**
Ø ${productivity.average}h vs. Best ${productivity.bestHours}h
${this.buildScoreBar(parseFloat(productivity.average) / parseFloat(productivity.bestHours || 10))}

**Fazit:**
${parseFloat(weekly.worked) > parseFloat(weekly.expected) ? '✅ Du übertriffst deine Ziele!' : '📈 Noch etwas Luft nach oben!'}`;
    }

    getMotivationResponse() {
        const growth = this.estimateGrowth();
        const streak = this.calculateStreak();
        const weekly = this.analyzer.getWeeklyStats();

        const motivations = [
            `🚀 Du hast ${growth}% Wachstum in den letzten 2 Wochen!`,
            `🔥 ${streak}-Tage Streak! Du bist unaufhaltsam!`,
            `⭐ Dein Durchschnitt: ${this.analyzer.getProductivityTrends().average}h/Tag - beeindruckend!`,
            `🏆 Du erreichst ${weekly.percentage}% deiner Ziele!`
        ];

        return `🎯 **MOTIVATION BOOST**

${motivations[Math.floor(Math.random() * motivations.length)]}

**Deine Achievements:**
• Konsistenz: ${this.calculateConsistency()}
• Performance: ${this.userProfile.performanceLevel}
• Saldo: ${parseFloat(weekly.diff) >= 0 ? `+${weekly.diff}h` : weekly.diff + 'h'}

💪 **Du schaffst das! Bleib fokussiert!**`;
    }

    getHealthBalanceResponse() {
        const breaks = this.analyzer.getBreakAnalysis();
        const productivity = this.analyzer.getProductivityTrends();

        return `🧘 **HEALTH & BALANCE REPORT**

**Burnout-Risk: ${this.assessRiskLevel()}**

**Recovery Score:**
${this.buildScoreBar(parseFloat(breaks.averageBreakMinutes) / 30)}
Pausen: ${breaks.averageBreakMinutes}min/Tag

**Empfehlungen:**
1. Nutze Pausen aktiv (nicht am Handy!)
2. Regelmäßiger Rhythmus ist wichtiger als Länge
3. Achte auf deine Gesundheit 💚

**Status:** ${parseFloat(breaks.averageBreakMinutes) > 20 ? '✅ Balance ist gut!' : '⚠️ Mehr Erholung nötig!'}`;
    }

    getGoalPlanningResponse() {
        const prediction = this.analyzer.predictMonthEnd();
        const weekly = this.analyzer.getWeeklyStats();

        return `🎯 **GOAL PLANNING & TRACKING**

**Monatliches Ziel:** 180h
**Aktueller Stand:** ${prediction.currentTotal}h
**Prognose:** ${prediction.predictedTotal}h

${this.buildProgressBar(parseFloat(prediction.currentTotal) / 180)}

**Was brauchst du:**
${Math.max(0, 180 - parseFloat(prediction.predictedTotal)).toFixed(2)}h noch für 100%

**Strategie:**
${parseInt(prediction.daysRemaining) > 0 ? `Arbeite ${prediction.avgPerDay}h/Tag um zu erreichen!` : 'Der Monat neigt sich dem Ende'}

${parseFloat(prediction.predictedTotal) >= 180 ? '🎉 Du erreichst dein Ziel!' : '📍 Noch erreichbar!'}`;
    }

    getIntelligentGeneralResponse(message) {
        const userProfile = this.userProfile;
        const suggestions = [
            `Basierend auf deinem ${userProfile.performanceLevel} Performance Level - wie kann ich dir helfen?`,
            `Du bist sehr ${userProfile.consistency} konsistent! Fragen zu deinen Trends?`,
            `Mit deinem ${userProfile.workStyle} Arbeitsstil - magst du Analysen oder Tipps?`,
            `Interessante Frage! Magst du deine Wochenstats, Prognosen oder Empfehlungen sehen?`
        ];

        return `🤖 **AI ASSISTANT**

${suggestions[Math.floor(Math.random() * suggestions.length)]}

**Meine Features:**
📊 Weekly/Monthly Analytics | 🔮 Predictions | 💡 Smart Tips | 📈 Trends | 🎯 Goals | 💪 Motivation`;
    }

    // ===== HELPER FUNCTIONS =====
    buildScoreBar(score) {
        const filled = Math.round(score * 10);
        const empty = 10 - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }

    buildBar(percentage) {
        const filled = Math.round(percentage / 10);
        const empty = 10 - filled;
        return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
    }

    buildProgressBar(progress) {
        const filled = Math.round(progress * 20);
        const empty = 20 - filled;
        return '[' + '='.repeat(filled) + ' '.repeat(empty) + ']';
    }

    buildComparisonBar(actual, expected) {
        const percent = (actual / expected) * 100;
        return `Actual: ${actual}h | Target: ${expected}h | ${this.buildBar(percent)} ${percent.toFixed(0)}%`;
    }

    getTrendDirection(entries) {
        if (entries.length < 2) return '→';
        const recent = entries.slice(-3);
        const older = entries.slice(-6, -3);
        const recentAvg = recent.reduce((s, e) => s + (e.worked || 0), 0) / recent.length;
        const olderAvg = older.reduce((s, e) => s + (e.worked || 0), 0) / older.length;
        if (recentAvg > olderAvg) return '📈';
        if (recentAvg < olderAvg) return '📉';
        return '→';
    }

    calculateStreak() {
        let streak = 0;
        const entries = this.analyzer.data.entries.slice().reverse();
        for (let e of entries) {
            if ((e.worked || 0) > 0) streak++;
            else break;
        }
        return streak;
    }

    calculateGoalProbability() {
        const prediction = this.analyzer.predictMonthEnd();
        const needed = 180;
        const predicted = parseFloat(prediction.predictedTotal);
        const probability = Math.min(100, (predicted / needed * 100));
        return probability.toFixed(0);
    }

    // Erweiterte Empfehlungen
    getSmartRecommendations() {
        const weekly = this.analyzer.getWeeklyStats();
        const productivity = this.analyzer.getProductivityTrends();
        const breaks = this.analyzer.getBreakAnalysis();
        const trend = this.estimateGrowth();
        const recommendations = [];

        if (parseFloat(weekly.diff) < -5) {
            recommendations.push({
                emoji: '⚠️',
                title: 'KRITISCHES DEFIZIT',
                action: '5+ Stunden fehlen - erhöhe deine tägliche Leistung!',
                impact: 'CRITICAL'
            });
        }

        if (parseFloat(productivity.average) < 5) {
            recommendations.push({
                emoji: '📈',
                title: 'PRODUKTIVITÄT BOOST',
                action: 'Fokussiere auf längere, konzentrierte Arbeitsblöcke',
                impact: 'HIGH'
            });
        }

        if (parseFloat(breaks.averageBreakMinutes) < 10) {
            recommendations.push({
                emoji: '☕',
                title: 'MEHR ERHOLUNG',
                action: 'Gönne dir 15-20 Min Pausen zur Regeneration',
                impact: 'MEDIUM'
            });
        }

        if (parseFloat(trend) > 10) {
            recommendations.push({
                emoji: '🚀',
                title: 'MOMENTUM NUTZEN',
                action: 'Du bist im Aufwärtstrend - diese Energie halten!',
                impact: 'POSITIVE'
            });
        }

        return recommendations.length > 0 ? recommendations : [];
    }

    getTrendAnalysis() {
        const recent = this.analyzer.data.entries.slice(-7);
        const previous = this.analyzer.data.entries.slice(-14, -7);

        const recentSum = recent.reduce((s, e) => s + (e.worked || 0), 0);
        const previousSum = previous.reduce((s, e) => s + (e.worked || 0), 0);

        const trend7d = previousSum > 0 ? ((recentSum - previousSum) / previousSum * 100) : 0;

        return {
            trend7d: trend7d,
            direction: trend7d > 0 ? 'UP' : trend7d < 0 ? 'DOWN' : 'STABLE'
        };
    }

    // ===== ADVANCED: ANNUAL REPORT =====
    generateAnnualReport() {
        const entries = this.analyzer.data.entries.filter(e => {
            const date = new Date(e.date);
            const year = new Date().getFullYear();
            return date.getFullYear() === year;
        });

        const totalWorked = entries.reduce((s, e) => s + (e.worked || 0), 0);
        const avgPerDay = entries.length > 0 ? (totalWorked / entries.length).toFixed(1) : 0;
        const workDays = entries.filter(e => (e.worked || 0) > 0).length;
        const sickDays = entries.filter(e => e.type === 'sick').length;
        const vacationDays = entries.filter(e => e.type === 'vacation').length;

        const best = entries.reduce((max, e) => (e.worked || 0) > (max.worked || 0) ? e : max, { worked: 0 });
        const trend = entries.length > 60 
            ? (totalWorked / (entries.length / 4) > 8 ? 'GROWING' : 'STABLE')
            : 'LIMITED_DATA';

        return `📅 **JAHRESBERICHT ${new Date().getFullYear()}**

┌──────────────────────────────────┐
│ Gesamtarbeitszeit: ${totalWorked.toFixed(1).padEnd(8)}h
│ Arbeitstage:       ${workDays.toString().padEnd(8)}
│ Ø pro Arbeitstag:  ${avgPerDay.padEnd(8)}h
│ Kranktage:         ${sickDays.toString().padEnd(8)}
│ Urlaubstage:       ${vacationDays.toString().padEnd(8)}
└──────────────────────────────────┘

🏆 **Highlights:**
• Beste Schicht: ${best.date} (${best.worked}h)
• Trend: ${trend === 'GROWING' ? '📈 Wachstumstrend' : '→ Stabil'}
• Konsistenz: ${this.userProfile.consistency}
• Performance: ${this.userProfile.performanceLevel}

💡 **Fazit:** Du hast ${totalWorked.toFixed(0)}h im Jahr 2025 gearbeitet - ${
  totalWorked > 1800 ? '🎯 Ausgezeichnet!' : 
  totalWorked > 1500 ? '👍 Solide Performance!' : 
  '📍 Noch Luft nach oben!'
}`;
    }

    // ===== ADVANCED: GOALS PROGRESS =====
    generateGoalsReport() {
        const entries = this.analyzer.data.entries;
        const totalWorked = entries.reduce((s, e) => s + (e.worked || 0), 0);
        
        // Predefined goals
        const goals = [
            { name: '200 Stunden gearbeitet', target: 200, current: totalWorked, icon: '🎯', unit: 'h' },
            { name: 'Strikesträhne', target: 20, current: this.calculateStreak(), icon: '🔥', unit: 'Tage' },
            { name: 'Durchschnitt 8h/Tag', target: 8, current: entries.length > 0 ? (totalWorked / entries.length).toFixed(1) : 0, icon: '⚡', unit: 'h' }
        ];

        const progress = goals.map(g => {
            const pct = Math.min((g.current / g.target) * 100, 100);
            const bar = this.buildProgressBar(pct, 20);
            return `${g.icon} ${g.name}: ${g.current}${g.unit} / ${g.target}${g.unit}\n   ${bar} ${pct.toFixed(0)}%`;
        }).join('\n\n');

        return `🏆 **ZIEL-FORTSCHRITT**

${progress}

💪 **Status:** ${goals.every(g => g.current >= g.target) ? '✅ ALLE ZIELE ERREICHT!' : '📍 Weitermachen!'}`;
    }

    // ===== ADVANCED: YEAR-OVER-YEAR COMPARISON =====
    generateYearComparison() {
        const entries = this.analyzer.data.entries;
        const now = new Date();
        const currentYear = now.getFullYear();
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);

        const currentYearWorked = entries
            .filter(e => new Date(e.date).getFullYear() === currentYear)
            .reduce((s, e) => s + (e.worked || 0), 0);

        const lastYearWorked = entries
            .filter(e => {
                const date = new Date(e.date);
                return date.getFullYear() === currentYear - 1 && 
                       Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000) <= dayOfYear;
            })
            .reduce((s, e) => s + (e.worked || 0), 0);

        const diff = currentYearWorked - lastYearWorked;
        const trend = diff > 0 ? '📈' : '📉';
        const pctChange = lastYearWorked > 0 ? ((diff / lastYearWorked) * 100).toFixed(1) : 0;

        return `📊 **JAHRESVERGLEICH (${currentYear} vs ${currentYear - 1})**

Bis zum ${now.toLocaleDateString('de-DE')}:

${currentYear}:  ${currentYearWorked.toFixed(1).padEnd(8)}h ${this.buildBar(currentYearWorked / 200, 25)}
${currentYear - 1}: ${lastYearWorked.toFixed(1).padEnd(8)}h ${this.buildBar(lastYearWorked / 200, 25)}

Differenz: ${diff.toFixed(1)}h ${trend} (${pctChange}%)

${diff > 0 ? '🚀 Du läufst besser als letztes Jahr!' : '⚠️ Achte auf deine Leistung!'}`;
    }

    // ===== HELPER: STREAK CALCULATION =====
    calculateStreak() {
        const entries = this.analyzer.data.entries.slice().reverse();
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            
            const hasEntry = entries.some(e => {
                const eDate = new Date(e.date);
                eDate.setHours(0, 0, 0, 0);
                return eDate.getTime() === checkDate.getTime() && (e.worked || 0) > 0;
            });

            if (hasEntry) streak++;
            else break;
        }

        return streak;
    }

    // ===== HELPER: PROGRESS BAR =====
    buildProgressBar(percent, width = 20) {
        const filled = Math.round((percent / 100) * width);
        const empty = width - filled;
        return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
    }

    // ===== HELPER: SIMPLE BAR =====
    buildBar(ratio, width = 20) {
        const filled = Math.round(Math.min(ratio, 1) * width);
        const empty = width - filled;
        return '[' + '▓'.repeat(filled) + '░'.repeat(empty) + ']';
    }

    // ===== ADVANCED: PERSONALIZED INSIGHTS =====
    generatePersonalizedInsights() {
        const weekly = this.analyzer.getWeeklyStats();
        const monthly = this.analyzer.getMonthlyStats();
        const trends = (this.analyzer.getTrendAnalysis && typeof this.analyzer.getTrendAnalysis === 'function') 
            ? this.analyzer.getTrendAnalysis() 
            : { trend: 'stable', average: 0 };
        const consistency = this.userProfile.consistency;
        const performance = this.userProfile.performanceLevel;
        const entries = this.analyzer.data?.entries || [];

        let insight = '💡 **DEINE PERSÖNLICHEN EINSICHTEN**\n\n';

        // ===== ARBEITSVERHALTEN ANALYSE =====
        if (entries.length > 0) {
            // Berechne durchschnittliche tägliche Arbeit
            const dailyAverage = entries.reduce((s, e) => s + (e.worked || 0), 0) / Math.max(entries.length, 1);
            insight += `📊 **Deine durchschnittliche tägliche Leistung:** ${dailyAverage.toFixed(1)} Stunden\n`;
            
            // Bester Tag ermitteln
            const bestDay = entries.reduce((prev, curr) => (curr.worked > prev.worked) ? curr : prev, entries[0] || {});
            if (bestDay.worked) {
                insight += `🏆 **Bester Tag:** ${bestDay.worked.toFixed(1)}h (${bestDay.date || 'kürzlich'})\n`;
            }
            insight += '\n';
        }

        // ===== WÖCHENTLICHE ANALYSE =====
        if (weekly.worked) {
            insight += `📈 **Diese Woche:** ${weekly.worked.toFixed(1)}h von ${weekly.expected.toFixed(1)}h erwartet\n`;
            if (weekly.percentage) {
                insight += `   → ${weekly.percentage.toFixed(0)}% deines Solls ✓\n`;
            }
            insight += '\n';
        }

        // ===== TREND ANALYSE =====
        if (trends.trend) {
            const trendEmoji = {
                'improving': '📈',
                'declining': '📉',
                'stable': '➡️'
            };
            const trendText = {
                'improving': 'Du wirst immer besser!',
                'declining': 'Deine Performance sinkt - Zeit für Anpassungen!',
                'stable': 'Du hältst dein Niveau konsistent'
            };
            insight += `${trendEmoji[trends.trend] || '➡️'} **Trend:** ${trendText[trends.trend] || 'Stabil'}\n`;
            if (trends.average) {
                insight += `   Durchschnitt: ${trends.average.toFixed(1)} Stunden\n`;
            }
            insight += '\n';
        }

        // ===== KONSISTENZ FEEDBACK =====
        if (consistency === 'VERY_HIGH') {
            insight += '✅ **Konsistenz Stark:** Dein Arbeitsrhythmus ist vorbildlich! Du brauchst kaum Anpassungen.\n';
        } else if (consistency === 'HIGH') {
            insight += '✨ **Gute Konsistenz:** Du hältst deine Routinen gut ein.\n';
        } else if (consistency === 'MEDIUM') {
            insight += '⚡ **Mittlere Konsistenz:** Es gibt einige Schwankungen. Versuche, regelmäßigere Muster zu etablieren.\n';
        } else if (consistency === 'LOW') {
            insight += '⚠️ **Schwache Konsistenz:** Deine Arbeitszeiten schwanken stark. Eine feste Routine würde helfen!\n';
        }
        insight += '\n';

        // ===== PERFORMANCE LEVEL =====
        const perfIcons = {
            'ELITE': '👑',
            'EXCELLENT': '⭐',
            'GOOD': '👍',
            'AVERAGE': '➡️',
            'NEEDS_IMPROVEMENT': '📍'
        };
        insight += `${perfIcons[performance] || '➡️'} **Performance Level:** ${performance}\n`;
        insight += '\n';

        // ===== KONKRETE EMPFEHLUNGEN =====
        insight += '💪 **Personalisierte Tipps für dich:**\n';
        
        if (consistency === 'LOW') {
            insight += '• Setze feste Arbeitszeiten fest (z.B. täglich 09:00-17:00)\n';
        }
        if (performance === 'NEEDS_IMPROVEMENT') {
            insight += '• Nutze Fokus-Sessions: 2-3 Stunden ohne Unterbrechungen\n';
        }
        if (parseFloat(weekly.diff) < -5) {
            insight += `• Dein Saldo ist negativ (${weekly.diff.toFixed(1)}h). Plane nächste Woche intensiver!\n`;
        } else if (parseFloat(weekly.diff) > 10) {
            insight += `• Du schuldest dir ${weekly.diff.toFixed(1)}h Freizeit! Gönne dir eine Pause 😎\n`;
        }
        if (trends.trend === 'declining') {
            insight += '• Deine Performance sinkt - überprüfe deine Prioritäten!\n';
        }
        if (trends.trend === 'improving') {
            insight += '• Wunderbar! Du machst Fortschritte - Momentum halten!\n';
        }
        
        insight += '• Überprüfe deine Ziele jede Woche\n';
        insight += '• Feierer deine Erfolge! 🎉';

        return insight;
    }

    // ===== UTILITY: CLEAR HISTORY & GET HISTORY =====
    clearHistory() {
        this.conversationHistory = [];
        localStorage.removeItem('aiBotHistoryPro');
    }

    getHistory() {
        return this.conversationHistory;
    }
}

// Export
const aiBotEnginePro = new AIBotEnginePro();
