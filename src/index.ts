import { db } from "./db/db"
import { Contact } from "./db/schema";



export default async function InsertContact() {
    type NewContact = typeof Contact.$inferInsert;

    const InsertContact = async (user: NewContact) => {
        return db.insert(Contact).values(user);
    }

    const newContact: NewContact = { phoneNumber: "1234567890", email: "John@gmail.com", linkedId: null, linkPrecedence: "primary" };
    await InsertContact(newContact);
}
