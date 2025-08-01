#!/usr/bin/env tsx

import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load environment variables from .env.local manually
const envPath = resolve(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf8')
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    const value = valueParts.join('=').replace(/^"(.*)"$/, '$1')
    process.env[key] = value
  }
})

import { db, projects } from './index'

async function seed() {
  console.log('🌱 Seeding database...')

  try {
    // Insert sample projects
    const sampleProjects = [
      {
        name: 'Villa Zeitblom',
        slug: 'villa-zeitblom',
        location: 'Ulm-Söflingen',
        address: 'Zeitblomstraße 31, 89073 Ulm',
        status: 'verfügbar' as const,
        type: 'villa' as const,
        priceFrom: '850000',
        description: 'Exklusive Villa in ruhiger Lage mit großzügigem Garten und modernem Wohnkomfort. Die Villa besticht durch ihre hochwertige Ausstattung und die optimale Raumaufteilung.',
        shortDescription: 'Exklusive Villa in ruhiger Lage mit großzügigem Garten',
        details: {
          rooms: '5 Zimmer',
          bedrooms: 4,
          bathrooms: 3,
          livingSpace: '180 m²',
          totalSpace: '200 m²',
          plotSize: '800 m²',
          floors: 2,
          buildYear: 2024,
          energyClass: 'A+',
          heatingType: 'Wärmepumpe',
          parking: '2 Stellplätze',
          balcony: true,
          terrace: true,
          garden: true,
          basement: true,
          elevator: false
        },
        features: [
          'Moderne Küche',
          'Großer Garten',
          'Terrasse',
          'Balkon',
          'Keller',
          'Garage',
          'Wärmepumpe',
          'Smart Home'
        ],
        locationDetails: {
          district: 'Söflingen',
          nearbyAmenities: ['Grundschule', 'Kindergarten', 'Einkaufszentrum', 'Park'],
          transportation: ['Bushaltestelle (2 Min.)', 'S-Bahn (10 Min.)', 'Autobahn (5 Min.)']
        },
        isPublished: true,
        publishedAt: new Date(),
        metaTitle: 'Villa Zeitblom - Exklusive Villa in Ulm-Söflingen | NAMLA',
        metaDescription: 'Exklusive Villa in ruhiger Lage mit großzügigem Garten und modernem Wohnkomfort. 5 Zimmer, 180 m² Wohnfläche, ab 850.000 €.'
      },
      {
        name: 'Penthouse Panorama',
        slug: 'penthouse-panorama',
        location: 'Ulm-Mitte',
        address: 'Neue Straße 15, 89073 Ulm',
        status: 'in_bau' as const,
        type: 'penthouse' as const,
        priceFrom: '1200000',
        description: 'Luxuriöses Penthouse mit atemberaubendem Panoramablick über die Stadt. Hochwertige Ausstattung und exklusive Lage im Herzen von Ulm.',
        shortDescription: 'Luxuriöses Penthouse mit Panoramablick über Ulm',
        details: {
          rooms: '4 Zimmer',
          bedrooms: 3,
          bathrooms: 2,
          livingSpace: '140 m²',
          totalSpace: '180 m²',
          floors: 1,
          buildYear: 2024,
          energyClass: 'A',
          heatingType: 'Fernwärme',
          parking: '2 Tiefgaragenplätze',
          balcony: false,
          terrace: true,
          garden: false,
          basement: false,
          elevator: true
        },
        features: [
          'Dachterrasse',
          'Panoramablick',
          'Aufzug',
          'Tiefgarage',
          'Fußbodenheizung',
          'Klimaanlage',
          'Premium-Ausstattung'
        ],
        locationDetails: {
          district: 'Mitte',
          nearbyAmenities: ['Münster', 'Einkaufsmeile', 'Restaurants', 'Theater'],
          transportation: ['Hauptbahnhof (5 Min.)', 'Stadtbus (1 Min.)', 'Autobahn (8 Min.)']
        },
        isPublished: true,
        publishedAt: new Date(),
        metaTitle: 'Penthouse Panorama - Luxus-Penthouse in Ulm-Mitte | NAMLA',
        metaDescription: 'Luxuriöses Penthouse mit Panoramablick im Herzen von Ulm. 4 Zimmer, 140 m² Wohnfläche, ab 1.200.000 €.'
      },
      {
        name: 'Einfamilienhaus Gartenstadt',
        slug: 'einfamilienhaus-gartenstadt',
        location: 'Neu-Ulm',
        address: 'Gartenstraße 42, 89231 Neu-Ulm',
        status: 'verkauft' as const,
        type: 'einfamilienhaus' as const,
        priceFrom: '---',
        description: 'Charmantes Einfamilienhaus mit idyllischem Garten in familienfreundlicher Nachbarschaft. Perfekt für Familien mit Kindern.',
        shortDescription: 'Charmantes Einfamilienhaus in familienfreundlicher Lage',
        details: {
          rooms: '6 Zimmer',
          bedrooms: 4,
          bathrooms: 2,
          livingSpace: '150 m²',
          totalSpace: '160 m²',
          plotSize: '600 m²',
          floors: 2,
          buildYear: 2023,
          energyClass: 'B',
          heatingType: 'Gas',
          parking: '1 Garage + 1 Stellplatz',
          balcony: true,
          terrace: true,
          garden: true,
          basement: true,
          elevator: false
        },
        features: [
          'Familienfreundlich',
          'Großer Garten',
          'Garage',
          'Keller',
          'Ruhige Lage'
        ],
        locationDetails: {
          district: 'Gartenstadt',
          nearbyAmenities: ['Grundschule', 'Spielplatz', 'Supermarkt'],
          transportation: ['Bushaltestelle (3 Min.)', 'Bahnhof (15 Min.)']
        },
        isPublished: true,
        publishedAt: new Date(),
        metaTitle: 'Einfamilienhaus Gartenstadt - Verkauft | NAMLA',
        metaDescription: 'Charmantes Einfamilienhaus in Neu-Ulm wurde erfolgreich verkauft. Vielen Dank für Ihr Vertrauen.'
      }
    ]

    console.log('📝 Inserting sample projects...')
    await db.insert(projects).values(sampleProjects)

    console.log('✅ Database seeded successfully!')
    console.log(`   • ${sampleProjects.length} projects added`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run seed if called directly
if (require.main === module) {
  seed().then(() => {
    console.log('🌱 Seeding complete!')
    process.exit(0)
  })
}

export default seed