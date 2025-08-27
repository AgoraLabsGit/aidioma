import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../../../shared/schema'

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon requires SSL
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased timeout for Neon
})

// Create Drizzle instance
export const db = drizzle(pool, { schema })

// Export pool for manual queries if needed
export { pool }

// Connection health check
export async function checkDatabaseConnection() {
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    return { connected: true, error: null }
  } catch (error) {
    console.error('Database connection failed:', error)
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
