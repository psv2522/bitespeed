/* eslint-disable @typescript-eslint/no-explicit-any */
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

//Contact table
export const Contact : any = pgTable('contact', {
    id: serial('id').primaryKey().notNull(),
    phoneNumber: text('phone_number'),
    email: text('email'),
    linkedId: integer('linked_id').references(() => Contact.id, { onDelete: 'cascade' }),
    linkPrecedence: text("link_precedence").$type<"primary"| "secondary">(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),
});