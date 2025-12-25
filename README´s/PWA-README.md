# 📱 PWA - Progressive Web App Documentation

TimeTracker ist jetzt eine **vollständig funktionsfähige Progressive Web App (PWA)**! Das bedeutet, es funktioniert auf deinem Smartphone und Desktop wie eine normale App.

## 🎯 Besonderheiten

### ✅ Installation
- **Android:** Klick auf "Zum Startbildschirm hinzufügen" oder nutze den Install-Button in Settings
- **iPhone:** Öffne in Safari → Teilen → Zum Home-Bildschirm → Öffne als App
- **Desktop:** Adressleiste → Install-Icon oder Settings → "Installieren"

### 📡 Offline-Fähigkeit
- Funktioniert **100% offline** — keine Internetverbindung erforderlich
- Service Worker cacht alle wichtigen Assets automatisch
- Daten bleiben lokal auf deinem Gerät
- Offline-Fallback-Page bei Verbindungsproblemen

### ⚡ Performance
- Schnellere Ladezeiten durch lokales Caching
- App-ähnliches Verhalten ohne App-Store
- Minimale Dateigröße, maximal Funktionalität

### 🔐 Datenschutz
- 100% lokal — keine Cloud-Verbindung erforderlich
- Service Worker cacht nur lokal
- Keine Tracking-Pixel in der App
- Daten bleiben auf deinem Gerät

## 📋 Technische Details

### Files
- **manifest.json** — App-Metadaten, Icons, Display-Mode
- **service-worker.js** — Offline-Caching & Cache-Strategien
- **offline.html** — Fallback-Page wenn offline

### Caching-Strategie

| Typ | Strategie | Beschreibung |
|-----|-----------|------------|
| HTML/Navigation | Network-First | Immer neueste Version versuchen |
| Static Assets | Cache-First | Schneller vom Cache laden |
| CDN/External | Network-First | Externe Ressourcen mit Fallback |

### Icons (Dynamisch generiert)
- Alle Icons werden als **SVG** generiert (keine statischen Dateien nötig)
- Automatisch skalierbar auf allen Bildschirmgrößen
- Gradient-Effekt (Grün → Lila)

## 🚀 Verwendung

### Installation Trigger
```javascript
// Manuell im Settings unter "App Installation (PWA)"
triggerInstallPrompt();

// Oder via Code
if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(({ outcome }) => {
        console.log(`User response: ${outcome}`);
    });
}
```

### Status Prüfen
```javascript
checkPWAStatus(); // Zeigt PWA Status an
```

### Service Worker Updates
Der Service Worker prüft automatisch jede Minute nach Updates und zeigt eine Notification, wenn eine neue Version verfügbar ist.

## 📱 Plattform-spezifische Hinweise

### Android
- **Best:** Chrome, Firefox, Edge
- Installation über Install-Prompt oder "Zum Startbildschirm hinzufügen"
- App läuft im Standalone-Mode (ohne Browser-UI)
- Notifications funktionieren vollständig

### iOS/iPadOS
- **Best:** Safari (ab iOS 15.1)
- Installation über "Teilen" → "Zum Home-Bildschirm"
- Fullscreen-Modus mit notch-support (`viewport-fit=cover`)
- Status-Bar wird automatisch angepasst

### Desktop (Windows/Mac/Linux)
- **Best:** Chrome, Edge, Firefox
- Installation via Adressleisten-Icon oder Settings
- Kann wie normale Desktop-App verwendet werden
- Offline-Mode funktioniert vollständig

## 🔄 Service Worker Lifecycle

```
[Install] → Cache Assets
    ↓
[Activate] → Clean old Caches
    ↓
[Fetch] → Intercept Requests
    ↓
[Update] → Check für neue Version (alle 60 Sekunden)
```

## 🛠️ Debugging

### Browser DevTools
```
Chrome/Edge: F12 → Application → Service Workers
Firefox: about:debugging#/runtime/this-firefox
Safari: Develop → Service Workers
```

### Console Logs
```
[Service Worker] Installing...
[Service Worker] Activating...
[Cache] HIT: /index.html
[Network] Fetching: /api/data
[PWA] Online
[PWA] Offline
```

## ⚠️ Wichtig für Deployment

### HTTPS erforderlich!
Service Worker funktioniert **nur über HTTPS** (außer localhost).

Wenn du HTTPs nicht hast, wird die PWA Installation deaktiviert.

### Cache-Busting
Wenn du änderungen machst, wird durch `updateViaCache: 'none'` sichergestellt, dass der Service Worker immer aktuell ist.

### Manifest.json
Die `manifest.json` **muss** auf der selben Domain wie deine App liegen.

```html
<!-- Richtig -->
<link rel="manifest" href="/manifest.json">

<!-- Falsch -->
<link rel="manifest" href="https://cdn.example.com/manifest.json">
```

## 🧪 Test-Szenarien

### Offline-Test
1. Öffne DevTools (F12)
2. Gehe zu "Network" → "Offline"
3. App sollte immer noch funktionieren

### Service Worker Update-Test
1. Ändere etwas in `service-worker.js`
2. App zeigt "Update verfügbar"
3. Nach Refresh lädt neue Version

### Installation-Test
1. App muss über HTTPS sein
2. Nach 10 Sekunden sollte Install-Prompt erscheinen
3. Klick "Installieren" → App wird zum Startbildschirm hinzugefügt

## 📚 Weitere Ressourcen

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev: PWA Checklist](https://web.dev/pwa-checklist/)
- [Manifest.json Spec](https://www.w3.org/TR/appmanifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## 🎓 Tipps für Nutzer

✅ **App installieren** — Schnellerer Zugriff vom Startbildschirm
✅ **Regelmäßig updaten** — Neue Features & Sicherheitspatches
✅ **Offline-Mode nutzen** — Funktioniert überall ohne Netz
✅ **Backup machen** — Besonders wichtig: verschlüsseltes Backup!

---

**Version:** 1.0 (PWA)  
**Datum:** Dezember 2025  
**Status:** ✅ Production Ready
