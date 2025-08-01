import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool } from '@neondatabase/serverless'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Create Drizzle instance
export const db = drizzle(pool, { schema })

// Export schema for type inference
export * from './schema'