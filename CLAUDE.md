# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MyWorkLog** is a local-first Progressive Web App (PWA) for time tracking, built as a single-file HTML application with embedded CSS and JavaScript. It's designed for German-speaking users (apprentices and employees) who need a privacy-focused time tracking solution that runs entirely in the browser with no server required.

- **Tech Stack**: Vanilla JavaScript, HTML5, CSS3, LocalStorage API
- **Version**: v2.8.1 (index.html), v2.7.2 (README), v2.1.1 (package.json)
- **Architecture**: Single-file app with modular helper scripts
- **Data Storage**: LocalStorage (key: `tg_pro_data`), with JSON export/import
- **Language**: German (de-DE)

## Development Commands

```bash
# Setup
npm install

# Testing
npm test                    # Run Jest test suite
npm run test:watch          # Auto-reload tests during development
npm run test:coverage       # Generate coverage report (60%+ threshold)

# Linting
npm run lint                # Check code style with ESLint
npm run lint --fix          # Auto-fix linting issues

# Development
npm run dev                 # Watch mode for tests
npm run build               # Verify build (no actual build step needed)
```

## Architecture Overview

### Core Application Structure

The app is primarily contained in **`index.html`** (~7000+ lines) with:
- Inline CSS using CSS variables for theming (dark/light mode via `data-theme` attribute)
- Inline JavaScript with timer logic, data management, and UI rendering
- SVG-based charts and visualizations (rings, trend lines, bars, heatmaps)
- Progressive Web App features (Service Worker, Web Manifest)

### Key External Scripts

Located in `Assets/js/`:
- **`icons.js`**: Icon management system
- **`shortcuts.js`**: Keyboard shortcuts
- **`touch-mobile-optimizations.js`**: Touch and mobile UX enhancements
- **`pinch-zoom.js`**: Pinch-to-zoom functionality

### AI Bot System

Two-part architecture in `AI-Bot/`:

1. **`data-analyzer-pro.js`** (`DataAnalyzerPro` class)
   - Analyzes time tracking data from LocalStorage
   - Provides statistics: weekly, monthly, productivity trends
   - Pattern detection and behavioral analysis
   - Handles data aggregation and calculations

2. **`aibot-engine-pro.js`** (`AIBotEnginePro` class)
   - Conversation engine with intent detection
   - Integrates with DataAnalyzerPro for real-time insights
   - User profiling (consistency, performance level, work style)
   - Stores conversation history in LocalStorage (`aiBotHistoryPro`)
   - Graceful fallback if analyzer is unavailable

### PWA Components

- **`service-worker.js`**: Cache-first strategy for assets, network-first for data (cache version: `v4`)
- **`manifest.json`**: PWA configuration with shortcuts, icons (SVG-based), theme colors
- **Offline support**: `Pages/Info/offline.html` for offline page

### Data Model

Entries stored in LocalStorage with structure:
```javascript
{
  entries: [
    {
      date: "2025-12-23",
      worked: 8.5,
      expected: 8.0,
      category: "work" | "school" | "vacation" | "sick" | "holiday",
      // ... additional fields
    }
  ]
}
```

### Feature Modules

The app includes several advanced features documented in `README´s/`:

- **iCalendar Export**: RFC 5545 compliant `.ics` export for Google/Outlook/Apple Calendar
- **Multi-Profile Support**: Team mode for multiple users sharing one device
- **Encrypted Backup**: AES-256-GCM encryption with PBKDF2 key derivation
- **Gleitzeit (Flextime)**: German flextime accounting system
- **Charts & Visualizations**: SVG-based with animation support, multiple chart types (area, smooth, bar)

## Testing Infrastructure

### Test Organization

No `tests/` directory currently exists in the codebase, but testing infrastructure is configured:

- **Framework**: Jest v29.7.0 with jsdom environment
- **Coverage threshold**: 60%+
- **Test files documented** (but not present in codebase):
  - `timer.test.js` (15 tests)
  - `backup.test.js` (18 tests)
  - `calendar.test.js` (16 tests)
  - `multiProfile.test.js` (24 tests)

### CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci-cd.yml`):
- **Lint**: ESLint checks (continues on error)
- **Test**: Jest with coverage on Node 18.x and 20.x
- **Coverage**: Codecov upload
- **Build**: Verification step
- **Lighthouse CI**: Performance, accessibility, PWA scores
- **Security**: npm audit and OWASP dependency check

## Code Style & Patterns

### CSS Custom Properties

Theme system using CSS variables defined in `:root`:
- Colors: `--bg-deep`, `--bg-glass`, `--primary`, `--text-main`, etc.
- Category colors: `--work-color`, `--school`, `--holiday`, `--ihk`
- Goal colors: `--goal-work`, `--goal-saldo`, `--goal-weeks`
- Light theme overrides via `[data-theme="light"]`

### JavaScript Patterns

- **No build step**: Pure vanilla JavaScript (ES6+)
- **LocalStorage-centric**: All data persistence via Web Storage API
- **Event-driven**: Heavy use of DOM event listeners
- **RequestAnimationFrame**: For smooth 60fps animations
- **Graceful degradation**: Fallbacks for missing dependencies (see AI Bot analyzer fallback)

### Important Conventions

1. **LocalStorage keys**:
   - `tg_pro_data`: Main time tracking data
   - `aiBotHistoryPro`: AI conversation history
   - `tt_chart_style`: Chart customization settings

2. **German language**: All UI strings, comments, and documentation in German

3. **Single-file approach**: Prefer inline code in `index.html` over external files (except for modular helpers)

## External Dependencies

CDN-loaded libraries (preloaded in `<head>`):
- **SimplePeer** v9: WebRTC peer-to-peer
- **QRCode.js** v1.0.0: QR code generation
- **Chart.js** v3.9.1: Alternative charting (complementary to custom SVG)
- **jsPDF** v2.5.1: PDF generation
- **html2canvas** v1.4.1: DOM to canvas conversion
- **Plausible Analytics**: Privacy-friendly analytics

## Browser Compatibility

Minimum versions:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- IE 11: Not supported

## File Structure Context

```
MyWorkLog/
├── index.html                    # Main application (7000+ lines)
├── manifest.json                 # PWA manifest
├── service-worker.js             # Service Worker (cache v4)
├── package.json                  # npm dependencies & scripts
│
├── AI-Bot/
│   ├── aibot-engine-pro.js      # Conversation engine
│   └── data-analyzer-pro.js     # Data analytics
│
├── Assets/js/
│   ├── icons.js
│   ├── shortcuts.js
│   ├── touch-mobile-optimizations.js
│   └── pinch-zoom.js
│
├── Pages/
│   ├── DE-Gestz/                # DSGVO & Impressum (legal pages)
│   └── Info/                    # App info pages & offline fallback
│
├── README´s/                    # Documentation folder
│   ├── FEATURES.md              # Feature list & implementation details
│   ├── INDEX-DOCUMENTATION.md   # Documentation index
│   ├── PWA-README.md
│   └── AI-Bot/
│       └── INTEGRATION-NOTES.md
│
├── Rechtliches/                 # Legal documents (German)
│   ├── LICENSE.md               # MIT License
│   ├── PRIVACY.md
│   ├── SECURITY.md
│   └── ...
│
├── DB/                          # Static data files
│   ├── admin_token.json
│   └── updates.json
│
└── .github/workflows/
    └── ci-cd.yml                # GitHub Actions pipeline
```

## Working with AI Bot

When modifying AI Bot functionality:

1. **Data Analyzer** (`data-analyzer-pro.js`):
   - Always load data via `loadTimeTrackerData()` from LocalStorage
   - Cache calculations in `this.cache` for performance
   - Provide fallback values for empty datasets
   - Methods return formatted strings (e.g., `"8.50"` for hours)

2. **Bot Engine** (`aibot-engine-pro.js`):
   - Must handle missing analyzer gracefully (fallback pattern implemented)
   - Save conversation history via `saveHistory()` after each interaction
   - Build user profile from analyzer data in `buildUserProfile()`
   - Classifications: consistency, performance, work style, focus pattern

## Special Considerations

### German Flextime (Gleitzeit)

The app implements German-style flextime accounting:
- Tracks worked vs. expected hours
- Maintains running balance (Saldo)
- Monthly and weekly statistics
- Considers different entry categories (work, school, vacation, sick, holiday)

### Data Privacy (DSGVO Compliance)

- **100% local**: No server communication for data storage
- Legal pages: `Pages/DE-Gestz/DSGVO.html` and `Impressum.html`
- Encrypted backup option available
- Documentation in `Rechtliches/PRIVACY.md`

### Progressive Web App

When working with PWA features:
- Update `CACHE_NAME` version in `service-worker.js` when assets change
- Test offline functionality via `Pages/Info/offline.html`
- PWA shortcuts defined in `manifest.json` (start timer, new entry, backup)
- Supports installation on mobile and desktop

## Common Patterns to Follow

### Adding New Features to index.html

1. **CSS**: Add variables to `:root`, provide light theme overrides in `[data-theme="light"]`
2. **JavaScript**: Use existing patterns (LocalStorage access, event listeners, SVG rendering)
3. **UI**: Follow glassmorphism design with `--bg-glass` and border-radius `--radius`
4. **Data**: Always validate and provide fallbacks for missing LocalStorage data
5. **Mobile**: Consider touch interactions and responsive design

### Chart Customization

Chart style stored in LocalStorage (`tt_chart_style`):
```javascript
{
  type: 'area-smooth' | 'bar' | 'line' | 'smooth',
  color: 'var(--primary)' | hex,
  animation: boolean,
  gradient: boolean,
  glow: boolean,
  blur: boolean,
  dots: boolean,
  rainbow: boolean
}
```

## Version Discrepancies Note

Version numbers differ across files:
- `index.html` title: "V2.8.1"
- `README.md`: "v2.7.2" (web app), "v2.4.0" (release)
- `package.json`: "2.1.1"

When updating versions, check all three locations for consistency.
