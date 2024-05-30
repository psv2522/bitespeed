/* eslint-disable @typescript-eslint/no-explicit-any */
import { integer, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';


//Enum for linkPrecedence
export const LinkPrecedence = pgEnum('linkPrecedence', ['primary', 'secondary']);
//Contact table
export const Contact : any = pgTable('contact', {
    id: serial('id').primaryKey().notNull(),
    phoneNumber: text('phone_number'),
    email: text('email'),
    linkedId: integer('linked_id').references(() => Contact.id, { onDelete: 'cascade' }),
    linkPrecedence: LinkPrecedence("linkPrecedence").default('primary').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),
});

// Define types for insert and select operations
export type InsertContact = typeof Contact.$inferInsert;
export type SelectContact = typeof Contact.$inferSelect;
