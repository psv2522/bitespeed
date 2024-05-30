/* eslint-disable @typescript-eslint/no-explicit-any */
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

//Contact table
export const Contact : any = pgTable('contacts', {
    id: serial('id').primaryKey(),
    phoneNumber: text('phone_number'),
    email: text('email'),
    linkedId: integer('linked_id').references(() => Contact.id, { onDelete: 'cascade' }),
    linkPrecedence: text('link_precedence').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),
});

// Define types for insert and select operations
export type InsertContact = typeof Contact.$inferInsert;
export type SelectContact = typeof Contact.$inferSelect;
