import os
import sys
from collections import defaultdict
import random
import time # Hinzugefügt, um die Anzeige schöner zu machen

# --- Konfiguration ---
EXCLUDED_FOLDERS = ('.git', '.venv', 'node_modules', '.idea', '__pycache__', 'dist', 'build', 'temp', 'vendor')
EXCLUDED_EXTENSIONS = ('.pyc', '.zip', '.png', '.jpg', '.jpeg', '.gif', '.pdf', '.exe', '.ico', '.lock', '.svg', '.woff', '.ttf', '.eot')

# --- Hilfsfunktion: Zählt die Gesamtanzahl der Dateien im Voraus ---
def get_total_files(root_dir):
    """Zählt, wie viele Dateien analysiert werden, um den Fortschritt zu kennen."""
    count = 0
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Ordner von der Rekursion ausschließen
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_FOLDERS]
        
        for filename in filenames:
            file_extension = os.path.splitext(filename)[1].lower()
            if file_extension in EXCLUDED_EXTENSIONS or filename.startswith('.'):
                continue
            count += 1
    return count

# --- Haupt-Analysefunktion (mit Fortschrittszähler) ---
def count_project_stats(root_dir, total_files):
    """
    Zählt rekursiv Zeilen und Zeichen, aggregiert und aktualisiert den Fortschritt.
    """
    total_lines = 0
    total_chars = 0
    stats_by_extension = defaultdict(lambda: [0, 0, 0])
    top_files_list = []
    files_processed = 0
    
    # os.walk geht rekursiv durch alle Verzeichnisse
    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_FOLDERS]
        
        for filename in filenames:
            file_extension = os.path.splitext(filename)[1].lower()
            if file_extension in EXCLUDED_EXTENSIONS or filename.startswith('.'):
                files_processed += 1 # Zähle auch die ausgeschlossenen Dateien, um den Zähler korrekt zu halten
                continue
            
            filepath = os.path.join(dirpath, filename)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    lines = content.count('\n') + 1
                    chars = len(content)
                    
                    total_lines += lines
                    total_chars += chars
                    stats_by_extension[file_extension][0] += lines
                    stats_by_extension[file_extension][1] += chars
                    stats_by_extension[file_extension][2] += 1
                    
                    relative_path = os.path.relpath(filepath, root_dir)
                    top_files_list.append((lines, relative_path))
                    
            except UnicodeDecodeError:
                pass
            except Exception:
                pass

            # --- Fortschritts-Aktualisierung ---
            files_processed += 1
            if total_files > 0:
                percentage = (files_processed / total_files) * 100
                # Der \r sorgt dafür, dass die Zeile in der Konsole überschrieben wird
                print(f"\r[STATUS] ⚙️ {percentage:.1f}% ({files_processed}/{total_files} Dateien) – Bearbeite: {relative_path[:60]}...", end="", flush=True)

    # Nach Abschluss eine neue Zeile starten
    print("\r[STATUS] ✅ Analyse abgeschlossen. 100.0% aller Dateien verarbeitet.  " + " " * 80)

    top_10_files = sorted(top_files_list, key=lambda x: x[0], reverse=True)[:10]
    
    return total_lines, total_chars, stats_by_extension, top_10_files

# --- Formatierungs- und HTML-Funktionen (Unverändert) ---

def format_number(num):
    """Gibt eine Zahl mit Tausender-Trennzeichen als String zurück (z.B. 123.456)."""
    return f"{num:,}".replace(",", ".")

def generate_random_color():
    """Generiert eine zufällige, helle Hex-Farbe für die Charts."""
    r = lambda: random.randint(100, 255)
    return f'#{r():02X}{r():02X}{r():02X}'

def generate_html_report(root_dir, total_lines, total_chars, extension_stats, top_files):
    """Erstellt den HTML-Bericht mit Diagrammen."""
    
    # 1. Daten für das Diagramm vorbereiten
    sorted_stats = sorted(extension_stats.items(), key=lambda item: item[1][0], reverse=True)
    chart_labels = []
    chart_data = []
    chart_colors = []
    
    for ext, (ext_lines, _, _) in sorted_stats:
        if ext_lines > 0:
            chart_labels.append(ext if ext else "(Other)")
            chart_data.append(ext_lines)
            chart_colors.append(generate_random_color())

    # 2. Tabellen-Inhalt generieren (Extension Summary)
    table_rows = ""
    for ext, (ext_lines, ext_chars, ext_count) in sorted_stats:
        percentage = (ext_lines / total_lines) * 100 if total_lines > 0 else 0
        ext_display = ext if ext else " (Ohne Endung)"
        
        table_rows += f"""
        <tr>
            <td>{ext_display}</td>
            <td data-sort="{ext_count}">{format_number(ext_count)}</td>
            <td data-sort="{ext_lines}">{format_number(ext_lines)}</td>
            <td data-sort="{ext_chars}">{format_number(ext_chars)}</td>
            <td>{percentage:.2f}%</td>
        </tr>
        """
        
    # 3. Tabellen-Inhalt generieren (Top 10 Files)
    top_files_rows = ""
    for file_lines, filepath in top_files:
        top_files_rows += f"""
        <tr>
            <td data-sort="{file_lines}">{format_number(file_lines)}</td>
            <td><code>{filepath}</code></td>
        </tr>
        """
        
    # 4. Gesamten HTML-Code zusammenstellen (Unverändert für die Kürze)
    html_content = f"""
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Code-Analyse-Bericht für {os.path.basename(os.path.abspath(root_dir))}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; background-color: #f4f7f9; color: #333; }}
        .container {{ max-width: 1200px; margin: auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }}
        h1 {{ color: #007bff; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; }}
        h2 {{ color: #555; margin-top: 30px; border-bottom: 1px solid #e0e0e0; padding-bottom: 5px; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 15px; background: #fff; }}
        th, td {{ padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; }}
        th {{ background-color: #f0f0f0; font-weight: 600; cursor: pointer; }}
        tr:hover {{ background-color: #f9f9f9; }}
        .summary-box {{ display: flex; justify-content: space-around; text-align: center; margin-bottom: 30px; }}
        .metric {{ padding: 20px; border-radius: 8px; background-color: #e9f7ff; width: 45%; }}
        .metric h3 {{ margin: 0; color: #007bff; font-size: 2.5em; }}
        .metric p {{ margin: 5px 0 0 0; font-size: 1.1em; color: #777; }}
        .chart-container {{ max-width: 600px; margin: 30px auto; }}
        code {{ background-color: #f0f0f0; padding: 2px 4px; border-radius: 4px; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Code-Analyse-Bericht: {os.path.basename(os.path.abspath(root_dir))}</h1>
        <p>Bericht erstellt am: {time.strftime('%Y-%m-%d %H:%M:%S')}</p>

        <h2>📊 Projekt-Zusammenfassung</h2>
        <div class="summary-box">
            <div class="metric">
                <h3>{format_number(total_lines)}</h3>
                <p>Gesamte Zeilen (LoC)</p>
            </div>
            <div class="metric">
                <h3>{format_number(total_chars)}</h3>
                <p>Gesamte Zeichen</p>
            </div>
        </div>

        <h2>📈 Code-Verteilung nach Dateityp</h2>
        <div class="chart-container">
            <canvas id="extensionChart"></canvas>
        </div>
        
        <p style="text-align: center; color: #777;">Das Diagramm zeigt die Verteilung der Codezeilen (LoC) auf die verschiedenen Dateitypen.</p>

        <h2>📋 Detaillierte Statistik</h2>
        <table>
            <thead>
                <tr>
                    <th>Erweiterung</th>
                    <th>Dateien</th>
                    <th>Zeilen (LoC)</th>
                    <th>Zeichen</th>
                    <th>% des Gesamten</th>
                </tr>
            </thead>
            <tbody>
                {table_rows}
            </tbody>
        </table>

        <h2>🏆 Top 10 größte Dateien (nach Zeilenanzahl)</h2>
        <table>
            <thead>
                <tr>
                    <th>Zeilen (LoC)</th>
                    <th>Pfad</th>
                </tr>
            </thead>
            <tbody>
                {top_files_rows}
            </tbody>
        </table>

    </div>

    <script>
        const ctx = document.getElementById('extensionChart').getContext('2d');
        new Chart(ctx, {{
            type: 'doughnut',
            data: {{
                labels: {chart_labels},
                datasets: [{{
                    label: 'Zeilen (LoC)',
                    data: {chart_data},
                    backgroundColor: {chart_colors},
                    hoverOffset: 4
                }}]
            }},
            options: {{
                responsive: true,
                plugins: {{
                    legend: {{
                        position: 'top',
                    }},
                    title: {{
                        display: true,
                        text: 'Verteilung der Codezeilen (LoC)'
                    }}
                }}
            }}
        }});
    </script>
</body>
</html>
"""
    return html_content

# --- Hauptteil des Skripts ---
if __name__ == "__main__":
    # Bestimmt den Pfad (entweder Argument oder aktueller Ordner)
    if len(sys.argv) > 1:
        project_path = sys.argv[1]
    else:
        project_path = "."
    
    print(f"✨ Starte visuelle Code-Analyse in: {os.path.abspath(project_path)}")
    
    # Schritt 1: Total-Dateien bestimmen
    print("... Berechne die Gesamtanzahl der zu analysierenden Dateien.")
    total_files = get_total_files(project_path)
    print(f"... {format_number(total_files)} relevante Dateien gefunden.")

    if total_files == 0:
        print("\n[FEHLER] Es wurden keine relevanten Dateien gefunden. Überprüfen Sie den Pfad oder die Ausschlussregeln.")
        sys.exit(1)
        
    # Schritt 2: Analyse mit Fortschrittszähler
    print("... Beginne Analyse und Zählung (Fortschritt unten sichtbar).")
    lines, chars, extension_stats, top_files = count_project_stats(project_path, total_files)
    
    # Schritt 3: HTML-Bericht generieren
    print("... HTML-Bericht wird generiert.")
    html_report = generate_html_report(project_path, lines, chars, extension_stats, top_files)
    
    output_filename = "code_analysis_report.html"
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write(html_report)
        
    print("\n======================================================")
    print("             🎉 Analyse erfolgreich! 🎉               ")
    print("======================================================")
    print(f"Öffnen Sie diese Datei in Ihrem Browser, um den Bericht zu sehen:")
    print(f"** {os.path.abspath(output_filename)} **")
    print("------------------------------------------------------")