import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const pool = mysql.createPool(process.env.DATABASE_URL)

export const db = drizzle({ client: pool })
