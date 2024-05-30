import { db } from "./db/db"
import { Contact } from "./db/schema";

const express = require('express')
const app = express()
const port = 3000

app.get('/identify', (req: any, res: { send: (arg0: string) => void; }) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

export default async function InsertContact() {
    type NewContact = typeof Contact.$inferInsert;

    const InsertContact = async (user: NewContact) => {
        return db.insert(Contact).values(user);
    }

    const newContact: NewContact = { phoneNumber: "1234567890", email: "John@gmail.com", linkedId: null, linkPrecedence: "primary" };
    await InsertContact(newContact);
}
