# Arbeitszeiterfassung — Zeit_Rechner

Eine kleine, lokale HTML-App zur schnellen Erfassung und Auswertung von Arbeitszeiten. Die App speichert Einträge in `localStorage`, bietet Export/Import als JSON, einfache Bearbeitung von Einträgen, Undo für Löschvorgänge und eine "Alle löschen"-Funktion.

Weitere Details, Contribution-Guidelines und Lizenzinformation findest du weiter unten.

## Schnelle Nutzung

1. Datei `Rechner.html` per Doppelklick im Browser öffnen oder per einfachem HTTP-Server (siehe unten).
2. Einstellungen öffnen (Zahnradsymbol), Arbeitszeiten anpassen und speichern.
3. In das Eingabefeld Stunden eintragen und auf "Eintrag speichern" klicken oder Enter drücken.
4. Einträge werden in der Liste angezeigt — bearbeiten oder löschen möglich.
5. Export/Import zur Datensicherung verwenden.

## HTTP-Server (optional)

Wenn du statische Dateien per HTTP bereitstellen möchtest (z. B. für bequemes Testen), kannst du einen einfachen Server starten. Öffne PowerShell im Projektordner und führe aus:

```powershell
# Python (wenn installiert)
python -m http.server 8000

# Alternativ: wenn du Node.js installiert hast, kannst du z. B. 'npx serve' nutzen
```

Dann im Browser zu `http://localhost:8000/Rechner.html` navigieren.

## Datenformat (Export / Import)

Beim Export wird eine JSON-Datei erzeugt mit diesem Schema (vereinfachtes Beispiel):

```json
{
  "entries": [
    {
      "id": 1630000000000,
      "date": "2023-08-27",
      "worked": 8.5,
      "expected": 8.75,
      "diff": -0.25,
      "type": "work"
    }
  ],
  "settings": {
    "hours": [0, 8.75, 8.75, 8.75, 8.75, 4.5, 0]
  }
}
```

Beim Import werden vorhandene `entries` und `settings` übernommen. Die App validiert nur oberflächlich; prüfe die Datei, falls der Import fehlschlägt.

## Datenschutz & Sicherheit

- Alle Daten bleiben lokal in deinem Browser (`localStorage`). Es findet keine Übertragung an Dritte statt.
- Exportierte Dateien enthalten alle gespeicherten Daten unverschlüsselt. Bewahre sie sicher auf.

## Vorschläge zur Weiterentwicklung

- CSV-Export für Excel/Sheets.
- Verbesserte Editier-UI (kein `prompt()`, sondern eigenes Modal — teilweise bereits vorhanden).
- Filter (Datum/Monat/Jahr) und Druck-Export.
- PWA / Desktop-Paket (Tauri/Electron) für Installierbarkeit.

---

## Beitrag leisten

Wenn du mitarbeiten möchtest, folge bitte den Anweisungen in `CONTRIBUTING.md`. Kurz:

- Fork das Repository und erstelle Branches pro Feature.
- Schreibe aussagekräftige Commits und PR-Beschreibungen.
- Füge Tests hinzu, wenn du Logik änderst.

Für Bugreports oder Feature-Requests nutze bitte die Issue-Templates (`.github/ISSUE_TEMPLATE`).

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz — siehe `LICENSE`.
**Weiterentwicklung (Vorschläge)**
- CSV-Export für Excel/Sheets.
- Datumsauswahl beim Anlegen eines Eintrags (aktuell wird heutiges Datum verwendet).
- UI-Modal für Bearbeitung statt `prompt()`.
- Filter (Datum/Monat/Jahr) und Druck-Export.

**Mitwirken / Hinweise**
- Einfach Änderungen lokal in `Rechner.html` vornehmen. Wenn du möchtest, kann ich beim Einbauen von Features helfen (z. B. Modal, CSV-Export, Datumsauswahl).

**Lizenz**
Dieses Projekt ist minimal — verwende und passe es frei für private Zwecke. Wenn du eine spezifische Lizenz wünschst (z. B. MIT), kann ich eine `LICENSE`-Datei hinzufügen.

---

Bei Fragen oder wenn ich ein Feature (z. B. Edit-Modal oder CSV-Export) direkt implementieren soll: sag Bescheid, ich mache das gern.
