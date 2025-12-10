[![Datenschutz: DSGVO lesen](https://img.shields.io/badge/DSGVO-Wichtig-red?style=for-the-badge)](./DSGVO.html) [![Impressum](https://img.shields.io/badge/Impressum-Info-blue?style=for-the-badge)](./Impressum.html) [![Lizenz: MIT](https://img.shields.io/badge/License-MIT-green.svg)](Rechtliches/LICENSE.md)

# ⏱ Time.Tracker.SingleFile

> Eine moderne, lokal laufende Single-File Zeiterfassungs-App — aktuell, minimal, performant.

---

**Grafische Kurzansicht**

[![Timer Badge](https://img.shields.io/badge/Timer-live-yellow?style=for-the-badge)](#) [![Backup](https://img.shields.io/badge/Backup-JSON-orange?style=for-the-badge)](#)

**Version:** `v2.0.1`  •  **Build:** `local`  •  **Stand:** 2025-12-10

---

## 🛡️ Rechtliches & wichtige Dateien (Schnellzugriff)

- `DSGVO.html` — [DSGVO anzeigen](./DSGVO.html)
- `Impressum.html` — [Impressum anzeigen](./Impressum.html)
- `Rechtliches/` (alle Markdown-Dateien):
  - [Rechtliches/CODE_OF_CONDUCT.md](Rechtliches/CODE_OF_CONDUCT.md)
  - [Rechtliches/CONTRIBUTING.md](Rechtliches/CONTRIBUTING.md)
  - [Rechtliches/LICENSE.md](Rechtliches/LICENSE.md)
  - [Rechtliches/NOTICE.md](Rechtliches/NOTICE.md)
  - [Rechtliches/PRIVACY.md](Rechtliches/PRIVACY.md)
  - [Rechtliches/SECURITY.md](Rechtliches/SECURITY.md)

> Alle rechtlichen Dateien liegen im Ordner `Rechtliches/` — die obigen Links öffnen die lokal vorhandenen Markdown-Dateien.


## 🌟 Kurzüberblick

`TimeTracker-Ausbildung-Arbeit` ist eine einfache, aber mächtige Browser-Anwendung zur lokalen Zeiterfassung (kein Server). Sie speichert Daten ausschließlich lokal und eignet sich für Mitarbeiter, Auszubildende oder Einzelpersonen, die ein schnelles, datenschutzfreundliches Tool suchen.

## 🎯 Aktueller Projektstand (Stand: 2025-12-10)
- **Fertig / stabil:** Kernfunktionen (Timer, Buchen, Export/Import, Gleitzeit) funktionieren lokal.
- **In Arbeit:** Erweiterte Analytics, UI-Polish, optionale Synchronisation (ausstehend).
- **Datenhaltung:** Alle Daten in `localStorage` / JSON-Export möglich.

---

## 📸 Grafische Darstellung (Quick-Preview)

```
┌───────────────────────────────────────────────┐
│  ╔═ Dashboard ═══════════╗  ╔═ Live-Timer ══╗  │
│  ║ KPI Ringe  ░░▒▓▓  72% ║  ║ ▶ 02:24:15     ║  │
│  ║ Trend +12.5h          ║  ║ Pause: II      ║  │
│  ╚═══════════════════════╝  ╚════════════════╝  │
└───────────────────────────────────────────────┘
```

## ✨ Features (kurz)
- Live-Timer mit Start/Pause/Stop
- Automatische Pausenregel (konfigurierbar)
- Gleitzeit-Konto und Monatsprognose
- JSON Export/Import (Backup/Restore)
- Farblich codierte Einträge (Work / School / Vacation / Sick / Holiday)

---

## 🧭 Schnellstart
1. Dateien lokal öffnen: Doppelklick auf `index.html` oder `index.html` im Browser öffnen.
2. Einstellungen → Name, Arbeitszeiten, Urlaub setzen.
3. Timer starten (▶) – Stop → Eintrag gespeichert.
4. Backup → `Export` für JSON herunterladen.

---

## 🛠 Entwicklung & Beitrag
- Fork → Branch → PR
- Bitte `Rechtliches/CONTRIBUTING.md` lesen bevor du Änderungen vorschlägst: [Contributing](Rechtliches/CONTRIBUTING.md)

---

## 📌 Nächste Schritte (empfohlen)
- UI-Feinschliff & Accessibility-Checks
- Optional: Automatisches Test-Backup (download on interval)

---

## 📂 Dateien die du jetzt prüfen solltest
- `index.html` — Hauptdatei der App
- `DSGVO.html`, `Impressum.html` — rechtliche Seiten (HTML)
- `Rechtliches/` — Markdown mit Lizenz & Richtlinien

---

## Kontakt
- Bei Fragen: `XXX` oder GitHub Issues

Vielen Dank — wenn du noch mehr grafische Elemente (Screenshots, GIFs, echte SVGs) möchtest, füge kurz ein, ob ich die Dateien anlegen oder nur die README-Markdown-Referenzen erstellen soll.

### Implementierte Konzepte
- LocalStorage API (Web Storage)
- RequestAnimationFrame (60fps Animationen)
- SVG Charts (Skalierbare Vektorgrafiken)
- CSS Glassmorphism (Moderne UI-Trends)
- Datum/Zeit-Arithmetik (JavaScript Date API)
- Event-Listeners & DOM-Manipulation

### Weiterführende Themen
- [ ] IndexedDB Migration
- [ ] Service Worker (Offline Support)
- [ ] Progressive Web App (PWA)
- [ ] Cloud Sync (Firebase/Supabase)
- [ ] Mobile Native App (React Native)

---

## 📊 Statistiken

```
├─ Code-Zeilen:          ~10K (HTML/CSS/JS gemischt)
├─ Komponenten:          15+ (Cards, Charts, Modals)
├─ CSS-Variablen:        20+ (Theme System)
├─ JavaScript-Funktionen:30+
├─ SVG-Charts:           5 (Rings, Donut, Trend, Bars)
└─ Unterstützte Sprachen: Deutsch (de-DE)
```

---

## 🌍 Browser-Kompatibilität

```
┌─────────────┬──────────┐
│ Chrome      │ ✅ 90+   │
├─────────────┼──────────┤
│ Firefox     │ ✅ 88+   │
├─────────────┼──────────┤
│ Safari      │ ✅ 14+   │
├─────────────┼──────────┤
│ Edge        │ ✅ 90+   │
├─────────────┼──────────┤
│ IE 11       │ ❌ Nein  │
└─────────────┴──────────┘
```

---

<div align="center">

### ⭐ Gefällt dir das Projekt?

**Gib uns einen Star! ⭐** → [GitHub](https://github.com)

---

**Made with ❤️ by the TechNova App Team**

*Eine moderne Lösung für intelligente Zeiterfassung*

</div>

---

**TimeTracker-Ausbildung-Arbeit V2.0.1** | Gebaut mit modernstem Web-Standard | 🚀 Production Ready
