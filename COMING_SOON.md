# Coming Soon Mode - Anleitung

## 📋 Überblick

Die NAMLA Website verfügt über einen "Coming Soon" Modus, der es ermöglicht:
- Eine professionelle Coming Soon Seite für die Öffentlichkeit zu zeigen
- Gleichzeitig Admins vollen Zugang zur Website zu geben (für Tests und Content-Einpflege)

## 🔧 Aktivierung/Deaktivierung

### Lokale Entwicklung (.env.local):
```bash
# Coming Soon Modus deaktiviert (normale Website)
NEXT_PUBLIC_COMING_SOON_MODE=false

# Coming Soon Modus aktiviert
NEXT_PUBLIC_COMING_SOON_MODE=true
```

### Vercel Production Environment:
1. Gehe zu Vercel Dashboard → Settings → Environment Variables
2. Füge hinzu: `NEXT_PUBLIC_COMING_SOON_MODE` = `true`
3. Redployment startet automatisch

## 🎯 Funktionsweise

### Für die Öffentlichkeit (nicht eingeloggt):
- **COMING_SOON_MODE=true**: Sieht nur Coming Soon Seite
- **COMING_SOON_MODE=false**: Sieht normale Website

### Für Admins (eingeloggt):
- **Immer**: Vollständige Website verfügbar
- **Mit Banner**: "Admin Preview Modus" angezeigt wenn Coming Soon aktiv

## 🚀 Launch-Workflow

### Phase 1: Coming Soon Live
```bash
# Vercel Environment Variable setzen:
NEXT_PUBLIC_COMING_SOON_MODE=true
```
- ✅ Öffentlichkeit sieht Coming Soon
- ✅ Admin kann sich einloggen und testen
- ✅ Alle Seiten (/projekte, /admin, etc.) für Admin verfügbar

### Phase 2: Website Live
```bash
# Vercel Environment Variable ändern:
NEXT_PUBLIC_COMING_SOON_MODE=false
```
- ✅ Vollständige Website für alle verfügbar
- ✅ Nahtloser Übergang ohne Code-Changes

## 🔐 Admin Zugang während Coming Soon

### Login-Prozess:
1. **Coming Soon Seite** besuchen
2. **"Admin" Button** (unten rechts) klicken
3. **Login** mit Admin-Credentials
4. **Vollständige Website** ist verfügbar
5. **Banner** zeigt "Admin Preview Modus"

### Admin kann testen:
- ✅ Homepage mit echten Inhalten
- ✅ Projekt-Seiten (/projekte, /projekte/[id])
- ✅ Admin Dashboard (/admin)
- ✅ Alle API Endpoints
- ✅ Media Upload & AI Enhancement

## 📱 Coming Soon Features

### Design-Elemente:
- ✅ NAMLA Branding (Logo, Farben, Fonts)
- ✅ "Bald ist es soweit" Hero Section
- ✅ Newsletter Anmeldung
- ✅ Firmen-Info (Seit 1974, 170+ Wohneinheiten)
- ✅ Kontakt-CTA Buttons
- ✅ Diskreter Admin Login

### Verfügbare Seiten:
- ✅ `/` - Coming Soon Page
- ✅ `/kontakt` - Echte Kontakt-Seite
- ✅ `/impressum` - Legal Pages
- ✅ `/datenschutz` - Legal Pages
- ✅ `/admin/*` - Admin Bereich

## 🛠️ Technische Details

### Session-basierte Logik:
```typescript
const isAdmin = session?.user?.role === 'admin'
const comingSoonMode = process.env.NEXT_PUBLIC_COMING_SOON_MODE === 'true'

if (comingSoonMode && !isAdmin) {
  // Zeige Coming Soon
} else {
  // Zeige normale Website
}
```

### Komponenten:
- `ComingSoonPage.tsx` - Hauptseite
- `AdminPreviewBanner.tsx` - Admin Banner
- `SessionBasedLayout.tsx` - Layout-Logik

## 📞 Support

### Für Content-Manager:
- Login-Daten sind in der .env.local gespeichert
- Bei Problemen: Admin kann sich immer über `/admin/login` einloggen

### Für Entwickler:
- Environment Variable togglet den Modus
- Keine Code-Changes nötig für Launch
- Session-System bleibt unverändert

## ✅ Testing Checklist

### Before Launch:
- [ ] Coming Soon Seite lädt korrekt
- [ ] Admin Login funktioniert
- [ ] Admin sieht vollständige Website
- [ ] Preview Banner wird angezeigt
- [ ] Legal Pages sind erreichbar
- [ ] Newsletter-Form funktioniert

### After Launch:
- [ ] Environment Variable auf `false` setzen
- [ ] Website ist öffentlich verfügbar
- [ ] Alle Features funktionieren
- [ ] Admin Preview Banner verschwindet