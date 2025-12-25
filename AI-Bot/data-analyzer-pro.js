/**
 * AI-Bot Data Analyzer PRO v2.0
 * Advanced Analytics, Predictive Models, Pattern Detection
 */

class DataAnalyzerPro {
    constructor() {
        this.data = this.loadTimeTrackerData();
        this.cache = {};
    }

    loadTimeTrackerData() {
        try {
            const rawData = localStorage.getItem('tg_pro_data');
            return rawData ? JSON.parse(rawData) : { entries: [] };
        } catch (e) {
            console.error('Fehler beim Laden der Daten:', e);
            return { entries: [] };
        }
    }

    // ===== BASICS =====
    getCurrentWeek() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1);
        return {
            start: startOfWeek,
            end: new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000)
        };
    }

    getCurrentMonth() {
        const today = new Date();
        return {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: new Date(today.getFullYear(), today.getMonth() + 1, 0)
        };
    }

    // ===== WEEKLY STATS =====
    getWeeklyStats() {
        const week = this.getCurrentWeek();
        const entries = this.data.entries.filter(e => {
            const date = new Date(e.date);
            return date >= week.start && date <= week.end;
        });

        const worked = entries.reduce((sum, e) => sum + (e.worked || 0), 0);
        const expected = entries.reduce((sum, e) => sum + (e.expected || 0), 0);
        const diff = worked - expected;

        return {
            worked: worked.toFixed(2),
            expected: expected.toFixed(2),
            diff: diff.toFixed(2),
            percentage: expected > 0 ? ((worked / expected) * 100).toFixed(1) : 0,
            days: entries.length,
            entries: entries
        };
    }

    // ===== MONTHLY STATS =====
    getMonthlyStats() {
        const month = this.getCurrentMonth();
        const entries = this.data.entries.filter(e => {
            const date = new Date(e.date);
            return date >= month.start && date <= month.end;
        });

        const worked = entries.reduce((sum, e) => sum + (e.worked || 0), 0);
        const expected = entries.reduce((sum, e) => sum + (e.expected || 0), 0);
        const diff = worked - expected;

        return {
            worked: worked.toFixed(2),
            expected: expected.toFixed(2),
            diff: diff.toFixed(2),
            percentage: expected > 0 ? ((worked / expected) * 100).toFixed(1) : 0,
            days: entries.length,
            entries: entries
        };
    }

    // ===== PRODUCTIVITY TRENDS =====
    getProductivityTrends() {
        const entries = this.data.entries.slice(-30);
        if (entries.length === 0) return {
            average: '0.00',
            total: '0.00',
            days: 0,
            bestDay: 'N/A',
            bestHours: 0,
            worstDay: 'N/A',
            worstHours: 0
        };

        const worked = entries.reduce((sum, e) => sum + (e.worked || 0), 0);
        const avg = (worked / entries.length).toFixed(2);

        const best = entries.reduce((max, e) => (e.worked || 0) > (max.worked || 0) ? e : max);
        const worst = entries.reduce((min, e) => (e.worked || 0) < (min.worked || 0) ? e : min);

        return {
            average: avg,
            total: worked.toFixed(2),
            days: entries.length,
            bestDay: best.date,
            bestHours: best.worked,
            worstDay: worst.date,
            worstHours: worst.worked
        };
    }

    // ===== BREAK ANALYSIS =====
    getBreakAnalysis() {
        const week = this.getCurrentWeek();
        const entries = this.data.entries.filter(e => {
            const date = new Date(e.date);
            return date >= week.start && date <= week.end;
        });

        const totalBreak = entries.reduce((sum, e) => sum + (e.breakMins || 0), 0);
        const avgBreak = entries.length > 0 ? (totalBreak / entries.length).toFixed(0) : 0;

        return {
            totalBreakMinutes: totalBreak,
            averageBreakMinutes: avgBreak,
            entries: entries.length
        };
    }

    // ===== FORECAST =====
    predictMonthEnd() {
        const month = this.getCurrentMonth();
        const today = new Date();
        const daysInMonth = month.end.getDate();
        const daysPassed = today.getDate();
        const daysRemaining = daysInMonth - daysPassed;

        const entries = this.data.entries.filter(e => {
            const date = new Date(e.date);
            return date >= month.start && date <= today;
        });

        const workedSoFar = entries.reduce((sum, e) => sum + (e.worked || 0), 0);
        const avgPerDay = daysPassed > 0 ? workedSoFar / daysPassed : 0;
        const predictedTotal = (workedSoFar + (daysRemaining * avgPerDay)).toFixed(2);

        return {
            predictedTotal,
            currentTotal: workedSoFar.toFixed(2),
            daysRemaining,
            avgPerDay: avgPerDay.toFixed(2)
        };
    }

    // ===== CATEGORY BREAKDOWN =====
    getCategoryBreakdown() {
        const entries = this.data.entries.slice(-60);
        const breakdown = {};

        entries.forEach(e => {
            const type = e.type || 'work';
            if (!breakdown[type]) {
                breakdown[type] = { count: 0, hours: 0 };
            }
            breakdown[type].count++;
            breakdown[type].hours += e.worked || 0;
        });

        return breakdown;
    }

    // ===== SMART RECOMMENDATIONS =====
    getSmartRecommendations() {
        const weekly = this.getWeeklyStats();
        const productivity = this.getProductivityTrends();
        const breaks = this.getBreakAnalysis();
        const recommendations = [];

        if (parseFloat(weekly.diff) < -5) {
            recommendations.push({
                emoji: '⚠️',
                title: 'KRITISCHES DEFIZIT',
                action: `Du brauchst noch ${Math.abs(weekly.diff)}h diese Woche!`,
                impact: 'CRITICAL'
            });
        }

        if (parseFloat(weekly.diff) > 2 && parseFloat(weekly.diff) < 5) {
            recommendations.push({
                emoji: '✅',
                title: 'Großartig!',
                action: `Du hast ${weekly.diff}h Vorsprung - halte diesen Rhythmus!`,
                impact: 'POSITIVE'
            });
        }

        if (parseFloat(productivity.average) < 6) {
            recommendations.push({
                emoji: '📈',
                title: 'PRODUKTIVITÄT STEIGERN',
                action: 'Versuche fokussierte, ununterbrochene Arbeitsblöcke',
                impact: 'HIGH'
            });
        }

        if (parseFloat(breaks.averageBreakMinutes) < 15) {
            recommendations.push({
                emoji: '☕',
                title: 'MEHR PAUSEN NÖTIG',
                action: 'Gönne dir 15-20 Min pro 2 Stunden Arbeit',
                impact: 'MEDIUM'
            });
        }

        return recommendations;
    }

    // ===== TREND ANALYSIS =====
    getTrendAnalysis() {
        const recent = this.data.entries.slice(-7);
        const previous = this.data.entries.slice(-14, -7);

        if (recent.length === 0 || previous.length === 0) {
            return { trend7d: 0, direction: 'INSUFFICIENT_DATA' };
        }

        const recentSum = recent.reduce((s, e) => s + (e.worked || 0), 0);
        const previousSum = previous.reduce((s, e) => s + (e.worked || 0), 0);

        const trend7d = previousSum > 0 ? ((recentSum - previousSum) / previousSum * 100) : 0;

        return {
            trend7d: trend7d.toFixed(1),
            direction: trend7d > 0 ? 'UP' : trend7d < 0 ? 'DOWN' : 'STABLE',
            recent7d: recentSum.toFixed(2),
            previous7d: previousSum.toFixed(2)
        };
    }

    // ===== ADVANCED ANALYTICS =====
    getConsistencyScore() {
        const entries = this.data.entries.slice(-30);
        if (entries.length < 5) return { score: 0, rating: 'INSUFFICIENT_DATA' };

        const hours = entries.map(e => e.worked || 0);
        const avg = hours.reduce((a, b) => a + b, 0) / hours.length;
        const variance = hours.reduce((sum, h) => sum + Math.pow(h - avg, 2), 0) / hours.length;
        const stdDev = Math.sqrt(variance);

        let rating = '';
        if (stdDev < 1.5) rating = 'VERY_HIGH';
        else if (stdDev < 2.5) rating = 'HIGH';
        else if (stdDev < 3.5) rating = 'MEDIUM';
        else rating = 'LOW';

        return {
            score: (100 - (stdDev * 10)).toFixed(0),
            rating: rating,
            stdDev: stdDev.toFixed(2),
            variance: variance.toFixed(2)
        };
    }

    // ===== PERFORMANCE METRICS =====
    getPerformanceMetrics() {
        const weekly = this.getWeeklyStats();
        const monthly = this.getMonthlyStats();
        const productivity = this.getProductivityTrends();
        const consistency = this.getConsistencyScore();

        return {
            weeklyScore: weekly.percentage,
            monthlyScore: monthly.percentage,
            averageDaily: productivity.average,
            consistency: consistency.rating,
            peakDay: productivity.bestHours,
            slackDay: productivity.worstHours
        };
    }

    // ===== SMART INSIGHTS =====
    getSmartInsight() {
        const trends = this.getTrendAnalysis();
        const productivity = this.getProductivityTrends();
        const weekly = this.getWeeklyStats();

        if (trends.direction === 'UP') {
            return `📈 Starker Aufwärtstrend! +${trends.trend7d}% vs. letzte Woche - halte das Momentum!`;
        } else if (trends.direction === 'DOWN') {
            return `📉 Aufmerksamkeit: ${trends.trend7d}% weniger als letzte Woche. Refokussiere!`;
        }

        if (parseFloat(weekly.percentage) > 100) {
            return `🚀 Übererfüller! Du bist ${weekly.percentage}% deiner Quote - Großartig!`;
        } else if (parseFloat(weekly.percentage) > 80) {
            return `✨ Du bist auf dem Weg - noch ein bisschen Push!`;
        }

        return `📊 Status quo - halte deinen aktuellen Rhythmus!`;
    }

    // ===== COMPARATIVE ANALYSIS =====
    compareWeeks(weeks = 2) {
        const allEntries = this.data.entries;
        const weekStats = [];

        for (let i = 0; i < weeks; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (i * 7));
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay() + 1);
            const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

            const entries = allEntries.filter(e => {
                const d = new Date(e.date);
                return d >= weekStart && d <= weekEnd;
            });

            const worked = entries.reduce((sum, e) => sum + (e.worked || 0), 0);
            weekStats.push({
                week: `W${i + 1}`,
                hours: worked.toFixed(2),
                days: entries.length
            });
        }

        return weekStats;
    }

    // ===== STREAK CALCULATION =====
    getWorkingStreak() {
        let streak = 0;
        const entries = this.data.entries.slice().reverse();

        for (let entry of entries) {
            if ((entry.worked || 0) > 0) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    // ===== GOAL TRACKING =====
    getGoalProgress(targetHours = 180) {
        const month = this.getCurrentMonth();
        const today = new Date();
        const daysPassed = today.getDate();
        const daysInMonth = month.end.getDate();

        const entries = this.data.entries.filter(e => {
            const date = new Date(e.date);
            return date >= month.start && date <= today;
        });

        const currentHours = entries.reduce((sum, e) => sum + (e.worked || 0), 0);
        const expectedForDay = (targetHours / daysInMonth) * daysPassed;
        const remaining = Math.max(0, targetHours - currentHours);

        return {
            target: targetHours,
            current: currentHours.toFixed(2),
            expected: expectedForDay.toFixed(2),
            remaining: remaining.toFixed(2),
            progress: ((currentHours / targetHours) * 100).toFixed(1),
            onTrack: currentHours >= expectedForDay
        };
    }

    // ===== WEEKLY COMPARISON =====
    compareToLastWeek() {
        const current = this.getWeeklyStats();
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const lastWeekStart = new Date(lastWeek);
        lastWeekStart.setDate(lastWeek.getDate() - lastWeek.getDay() + 1);
        const lastWeekEnd = new Date(lastWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

        const lastWeekEntries = this.data.entries.filter(e => {
            const date = new Date(e.date);
            return date >= lastWeekStart && date <= lastWeekEnd;
        });

        const lastWeekHours = lastWeekEntries.reduce((sum, e) => sum + (e.worked || 0), 0);
        const currentHours = parseFloat(current.worked);
        const diff = currentHours - lastWeekHours;
        const percent = lastWeekHours > 0 ? ((diff / lastWeekHours) * 100).toFixed(1) : 0;

        return {
            current: current.worked,
            previous: lastWeekHours.toFixed(2),
            diff: diff.toFixed(2),
            percentChange: percent,
            trend: diff > 0 ? 'UP' : diff < 0 ? 'DOWN' : 'STABLE'
        };
    }

    // ===== DAILY AVERAGES =====
    getDailyAverages() {
        const categoryData = {};

        this.data.entries.forEach(e => {
            const type = e.type || 'work';
            if (!categoryData[type]) {
                categoryData[type] = { total: 0, count: 0 };
            }
            categoryData[type].total += e.worked || 0;
            categoryData[type].count++;
        });

        const averages = {};
        for (const [type, data] of Object.entries(categoryData)) {
            averages[type] = (data.total / data.count).toFixed(2);
        }

        return averages;
    }
}

// Export (PRO Version - doesn't overwrite base analyzer)
const aiAnalyzerPro = new DataAnalyzerPro();
