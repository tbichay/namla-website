import { pgTable, uuid, varchar, text, timestamp, json, decimal, boolean, pgEnum } from 'drizzle-orm/pg-core'

// Project status enum
export const projectStatusEnum = pgEnum('project_status', [
  'verfügbar',
  'verkauft', 
  'in_planung',
  'in_bau',
  'fertiggestellt'
])

// Project type enum  
export const projectTypeEnum = pgEnum('project_type', [
  'einfamilienhaus',
  'mehrfamilienhaus',
  'eigentumswohnung',
  'penthouse',
  'villa',
  'reihenhaus',
  'doppelhaushälfte'
])

// Projects table
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  location: varchar('location', { length: 255 }).notNull(),
  address: varchar('address', { length: 500 }),
  status: projectStatusEnum('status').notNull().default('in_planung'),
  type: projectTypeEnum('type').notNull().default('einfamilienhaus'),
  
  // Pricing
  priceFrom: varchar('price_from', { length: 50 }),
  priceExact: decimal('price_exact', { precision: 12, scale: 2 }),
  
  // Basic info
  description: text('description'),
  shortDescription: varchar('short_description', { length: 500 }),
  
  // Property details (stored as JSON for flexibility)
  details: json('details').$type<{
    rooms?: string
    bedrooms?: number
    bathrooms?: number
    livingSpace?: string
    totalSpace?: string
    plotSize?: string
    floors?: number
    buildYear?: number
    energyClass?: string
    heatingType?: string
    parking?: string
    balcony?: boolean
    terrace?: boolean
    garden?: boolean
    basement?: boolean
    elevator?: boolean
  }>(),
  
  // Images (stored as array of R2 URLs)
  images: json('images').$type<string[]>().default([]),
  
  // SEO fields
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: varchar('meta_description', { length: 500 }),
  
  // Features
  features: json('features').$type<string[]>().default([]),
  
  // Location details
  locationDetails: json('location_details').$type<{
    coordinates?: { lat: number; lng: number }
    district?: string
    nearbyAmenities?: string[]
    transportation?: string[]
  }>(),
  
  // Publication
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert

// Project images table for better organization
export const projectImages = pgTable('project_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }),
  url: varchar('url', { length: 1000 }).notNull(),
  originalUrl: varchar('original_url', { length: 1000 }), // Backup original URL before AI enhancement
  alt: varchar('alt', { length: 255 }),
  caption: varchar('caption', { length: 500 }),
  sortOrder: decimal('sort_order', { precision: 5, scale: 2 }).default('0'),
  isMainImage: boolean('is_main_image').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type ProjectImage = typeof projectImages.$inferSelect
export type NewProjectImage = typeof projectImages.$inferInsert