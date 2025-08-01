# Database Branching Workflow

## 📋 Überblick

NAMLA Website verwendet eine **Branch-per-Feature-Entwicklung** mit isolierten Umgebungen:

- **Neon Database Branches**: Jeder Feature Branch bekommt eine isolierte Datenbank-Kopie
- **R2 Storage Isolation**: Separate Ordner für jede Branch 
- **Vercel Preview Deployments**: Automatische Deployments mit branch-spezifischen Umgebungsvariablen
- **Saubere Vercel Dashboard**: Nur Production-Variablen im Dashboard, Feature-Branch-Variablen über API

## 🚀 Workflow

### 1. Feature Branch erstellen

```bash
# Neuen Feature Branch von main erstellen
git checkout main
git pull origin main
git checkout -b feature/neue-funktion

# Branch Setup ausführen
npm run branch:setup
```

Das `branch:setup` Script:
- ✅ Erstellt Neon Database Branch von Production DB
- ✅ Setzt lokale `.env.feature/neue-funktion` Datei
- ✅ Konfiguriert Vercel Environment Variablen via API
- ✅ Führt Database Migrations aus
- ✅ Erstellt isolierten R2 Storage Ordner

### 2. Entwicklung

```bash
# Lokale Entwicklung mit Branch-spezifischen Variablen
cp .env.feature/neue-funktion .env.local
npm run dev
```

**Isolation garantiert:**
- 🔒 Eigene Database mit Production-Daten als Basis
- 🔒 Eigener R2 Ordner: `branch-feature/neue-funktion/`
- 🔒 Eigene Vercel Preview URL
- 🔒 Keine Beeinflussung der Production-Umgebung

### 3. Preview Deployment

```bash
# Automatisches Preview Deployment mit isolated Database
npm run deploy:preview
```

**Das Script führt aus:**
- ✅ Validiert Feature Branch Setup
- ✅ Führt Feature Branch Database Migrations aus
- ✅ Committet und pusht aktuelle Änderungen
- ✅ Überwacht Vercel Preview Deployment
- ✅ Zeigt Preview URL an

**Automatisch erstellt:**
- 🚀 Vercel Preview Deployment mit isolierter Database
- 🚀 GitHub Actions laufen mit branch-spezifischen Variablen
- 🚀 Preview URL: `https://namla-website-git-feature-neue-funktion-tombichay.vercel.app`

### 4. Testing & Review

**Verfügbare Umgebungen:**
- 🧪 **Lokale Entwicklung**: `localhost:3000` mit Branch-DB
- 🧪 **Vercel Preview**: Automatische URL mit Branch-DB  
- 🧪 **Production**: Unverändert auf `namla.de`

### 5. Production Deployment

```bash
# Automatisches Production Deployment
npm run deploy:prod
```

**Das Script führt aus:**
- ✅ Committet aktuelle Änderungen 
- ✅ Wechselt zu Main Branch und mergt Feature
- ✅ Führt Production Database Migrations aus
- ✅ Pusht zu Production
- ✅ Überwacht Production Deployment
- ✅ Optional: Branch Cleanup mit Bestätigung

### 6. Manual Cleanup (optional)

```bash
# Manuelles Cleanup falls nicht automatisch gemacht
npm run branch:cleanup feature/neue-funktion
```

Das `branch:cleanup` Script:
- 🧹 Löscht Neon Database Branch
- 🧹 Stellt Original `.env.local` wieder her
- 🧹 Löscht Vercel Environment Variablen
- 🧹 R2 Ordner bleibt für Debugging (manuell löschbar)

## ⚙️ Konfiguration

### Erforderliche Environment Variablen

In `.env.local`:

```bash
# Neon Database API
NEON_API_KEY=napi_xxx
NEON_PROJECT_ID=small-feather-xxx

# Vercel API (für sauberes Dashboard)  
VERCEL_TOKEN=xxx
VERCEL_PROJECT_ID=xxx

# Production Database (Basis für Branches)
DATABASE_URL=postgresql://xxx

# R2 Storage
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx  
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=namla-prod
```

### Vercel Token erstellen

1. **Vercel Dashboard** → Settings → Tokens
2. **Neuen Token erstellen** mit `Full Access`
3. **Token in .env.local** einfügen

### Vercel Project ID finden

```bash
# Via Vercel CLI
vercel ls

# Oder im Vercel Dashboard → Settings → General
```

## 🔧 Verfügbare Scripts

### `npm run branch:setup`

**Automatische Branch-Erstellung:**
- Erkennt aktuellen Git Branch
- Erstellt Neon Database Branch mit Endpoint
- Konfiguriert `.env.local` mit Branch-Variablen
- Erstellt Backup der Original-Konfiguration
- Konfiguriert Vercel Variables via API
- Führt Database Migrations aus

**Ausgabe-Beispiel:**
```
✅ Branch setup completed successfully!

📋 Summary:
   Branch: feature/neue-funktion  
   Database: feature/neue-funktion
   R2 Folder: branch-feature/neue-funktion/
   Environment: .env.local (backed up)
   Vercel Preview: Same configuration as local

🚀 Ready to use:
   npm run dev  # Uses branch database & isolated R2
```

### `npm run deploy:preview`

**Automatisches Preview Deployment:**
- Validiert Feature Branch Setup
- Führt Feature Branch Database Migrations aus
- Committet und pusht aktuelle Änderungen
- Überwacht Vercel Preview Deployment
- Zeigt Preview URL an

**Ausgabe-Beispiel:**
```
✅ Preview deployment completed!

📋 Summary:
   Branch: feature/neue-funktion
   Database: Isolated feature branch database
   Preview URL: https://namla-website-git-feature-neue-funktion-tombichay.vercel.app

🎯 Next steps:
   1. Test your feature on the preview URL
   2. If everything works: npm run deploy:prod
```

### `npm run deploy:prod`

**Automatisches Production Deployment:**
- Committet aktuelle Änderungen
- Wechselt zu Main Branch und mergt Feature
- Führt Production Database Migrations aus
- Pusht zu Production
- Überwacht Production Deployment
- Optional: Branch Cleanup mit Bestätigung

**Ausgabe-Beispiel:**
```
✅ Production deployment completed!

📋 Summary:
   Feature Branch: feature/neue-funktion
   Merged to: main
   Status: Live on production
   Production URL: https://namla.de

🧹 Clean up feature branch resources? (y/N):
```

### `npm run branch:cleanup`

**Automatisches Cleanup:**
- Löscht Neon Database Branch
- Stellt Original `.env.local` aus Backup wieder her
- Löscht Vercel Environment Variablen
- Bestätigungsprompt (außer mit `--force`)

**Optionen:**
```bash
# Aktuellen Branch cleanup
npm run branch:cleanup

# Bestimmten Branch cleanup
npm run branch:cleanup feature/andere-funktion

# Ohne Bestätigung
npm run branch:cleanup -- --force

# R2 Ordner behalten
npm run branch:cleanup -- --keep-r2
```

## 🤖 GitHub Actions Integration

Die `.github/workflows/database-branching.yml` läuft automatisch:

**Bei Pull Request:**
- ✅ Erstellt Database Branch
- ✅ Führt Migrations aus
- ✅ Kommentiert PR mit Branch-Info

**Bei PR Close:**
- ✅ Löscht Database Branch automatisch
- ✅ Kommentiert PR mit Cleanup-Info

**Bei Main Push:**
- ✅ Führt Production Database Migrations aus

## 🏗️ Projektstruktur

```
namla-website/
├── scripts/
│   ├── branch-setup.js      # Branch-Erstellung
│   └── branch-cleanup.js    # Branch-Cleanup
├── .github/workflows/
│   └── database-branching.yml  # Automatische Actions
├── .env.local               # Development Variablen
├── .env.feature/*           # Branch-spezifische Variablen
└── BRANCH_WORKFLOW.md       # Diese Dokumentation
```

## 🛠️ Troubleshooting

### Script Fehler

**"Missing required environment variable":**
```bash
# .env.local überprüfen
cat .env.local | grep NEON_API_KEY
cat .env.local | grep VERCEL_TOKEN
```

**"Failed to create Neon branch":**
- Neon API Key überprüfen
- Neon Project ID korrekt?
- Branch existiert bereits?

**Database Migrations fehlen:**
```bash
# Manuell ausführen
DATABASE_URL="postgresql://..." npm run db:push
```

### Vercel Dashboard

**Environment Variablen nicht gesetzt:**
- Vercel Token korrekt?
- Vercel Project ID korrekt?  
- API Rate Limits erreicht?

**Preview Deployment fehlt:**
```bash
# Branch zu Vercel pushen
git push origin feature/branch-name

# Vercel Status prüfen
vercel ls
```

### Branch Cleanup

**Branch lässt sich nicht löschen:**
```bash
# Force cleanup
npm run branch:cleanup -- --force

# Manuell über Neon Console
# https://console.neon.tech/
```

## 📞 Support

**Für Entwickler:**
- Branch Scripts sind Node.js basiert
- Neon API v2 wird verwendet
- Vercel API v10 für Environment Variables

**Best Practices:**
- Immer von `main` Branch abzweigen
- Branch Setup vor Entwicklung ausführen
- Nach Merge Branch cleanup durchführen
- R2 Ordner regelmäßig manuell aufräumen

**Logs & Debugging:**
- Scripts geben detaillierte Logs aus
- Neon Console für Database-Details
- Vercel Dashboard für Deployment-Status
- GitHub Actions Logs für Workflow-Probleme