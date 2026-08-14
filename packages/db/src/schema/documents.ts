import { mysqlTable, varchar, text, timestamp, index } from 'drizzle-orm/mysql-core'

import { user } from './auth.js'

export const documents = mysqlTable(
  'documents',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('documents_userId_idx').on(table.userId)],
)
