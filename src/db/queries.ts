import { db } from './db';
import { eq } from 'drizzle-orm';
import { Contact, InsertContact, SelectContact } from './schema';

export async function createContact(data: InsertContact) {
    await db.insert(Contact).values(data);
}

export async function updateContact(id: SelectContact['id'], data: Partial<Omit<SelectContact, 'id'>>) {
    await db.update(Contact).set(data).where(eq(Contact.id, id));
}

export async function deleteUser(id: SelectContact['id']) {
    await db.delete(Contact).where(eq(Contact.id, id));
}