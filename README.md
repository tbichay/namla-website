# NAMLA Bauträger Website

Eine minimalistische Website für die Bauträgerfirma NAMLA im modernen Architekten-Stil.

## Features

- **Responsive Design** mit Tailwind CSS
- **Moderne Navigation** mit klarer Struktur
- **Projektübersicht** mit Filterung (Verfügbar/Verkauft)
- **Projekt-Detailseiten** mit Bildergalerie und Grundrissen
- **Über uns Seite** mit Firmenphilosophie
- **Kontaktformular** mit Standortinformationen

## Technologie-Stack

- Next.js 15 mit App Router
- React 18
- TypeScript
- Tailwind CSS
- Inter Font (Google Fonts)

## Installation

```bash
npm install
npm run dev
```

Die Website ist dann unter http://localhost:3000 verfügbar.

## Projektstruktur

```
src/
├── app/                 # Next.js App Router
│   ├── page.tsx        # Startseite
│   ├── projekte/       # Projekte Seiten
│   ├── ueber-uns/      # Über uns Seite
│   └── kontakt/        # Kontakt Seite
├── components/         # React Komponenten
│   ├── Layout/         # Header & Footer
│   └── ui/            # UI Komponenten
└── data/              # JSON Daten
```

## Deployment

Die Website kann einfach auf Vercel deployed werden:

```bash
# Mit Vercel CLI
npx vercel

# Oder direkt über GitHub Integration
```

## Design-Prinzipien

- **Minimalistisch**: Viel Weißraum, klare Linien
- **Typografie**: Modern und serifenlos (Inter)
- **Farben**: Schwarz, Weiß, Hellgrau
- **Keine Effekte**: Keine Schatten oder Verläufe
- **Architektonisch**: Sachlich und professionell

## Anpassungen

Die Projektdaten können in `src/data/projects.json` bearbeitet werden.
Bilder sollten im `public/images/` Ordner platziert werden.

---

Entwickelt für NAMLA Bauträger GmbH
