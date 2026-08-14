import { mysqlTable, varchar, timestamp, boolean, index } from 'drizzle-orm/mysql-core'

import { user } from './auth.js'

export const apiKeys = mysqlTable(
  'api_keys',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { fsp: 3 }).notNull(),
    revoked: boolean('revoked').default(false).notNull(),
    createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
  },
  (table) => [index('api_keys_userId_idx').on(table.userId)],
)
