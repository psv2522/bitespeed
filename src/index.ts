import { db } from "./db/db"
import { Contact } from "./db/schema";
import { or, eq, and, ne } from 'drizzle-orm';

const express = require('express')
const cors = require('cors')
const app = express()
app.use(express.json());
app.use(cors())

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello World!')
})

//GET request for identify
app.get('/identify', (req, res) => {
    res.send('POST request in the format at /identify')
})

//Insert contact into the database
async function InsertContact(email: string, phoneNumber: string, precedenceVal: 'primary' | 'secondary' = 'primary', linkedId) {
    try {
        const user = db.insert(Contact).values({
            email: email,
            phoneNumber: phoneNumber,
            linkPrecedence: precedenceVal,
            linkedId: linkedId
        }).returning({
            id: Contact.id,
        });
        return user;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//Update contact from primary to secondary if conflict is detected
async function UpdateContact(conflictUsers: any, linkedId: number) {
    try {
        let precedenceVal = 'secondary';
        //Update the query such that all users in conflictUsers except the first value are updated to secondary
        const usersToUpdate = conflictUsers.slice(1).map(user => user.id);
        const updatedUsers = await db.update(Contact)
            .set({
                linkPrecedence: precedenceVal,
                linkedId: linkedId
            })
            .where(
                and(
                    ne(Contact.id, linkedId),
                    eq(Contact.id, usersToUpdate)
                )
            )
            .returning({
                id: Contact.id
            });

        console.log("Updated Users");
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//Find primary contact id
async function findPrimaryContactId(email: string, phoneNumber: string) {
    try {
        const primaryContact = await db.select().from(Contact)
            .where(
                and(
                    or(
                        eq(Contact.email, email),
                        eq(Contact.phoneNumber, phoneNumber)
                    ), eq(Contact.linkPrecedence, 'primary')
                )).limit(1);
        return primaryContact;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//Fetch all related contacts
async function fetchRelatedContacts(primaryContactId) {
    try {
        const allContacts = await db.select().from(Contact)
            .where(or(eq(Contact.linkedId, primaryContactId), eq(Contact.id, primaryContactId)));
        return allContacts;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//Conflict detection for updating contact from primary to secondary
async function conflictUpdate(email: string, phoneNumber: string) {
    var conflictDetected = false;
    const conflictUsers = await db.select().from(Contact).where(and(or(eq(Contact.email, email), eq(Contact.phoneNumber, phoneNumber)), eq(Contact.linkPrecedence, 'primary')));
    console.log("Conflict Users:" + conflictUsers)
    if (conflictUsers.length > 1) {
        conflictDetected = true;
    }
    return { conflictDetected, conflictUsers };
}

//Response formatting
function processResponse(allContacts) {
    let primaryContatctId: number | null = null;
    const emails: Set<string> = new Set();
    const phoneNumbers: Set<string> = new Set();
    const secondaryContactIds: number[] = [];

    allContacts.forEach(contact => {
        if (contact.linkPrecedence === 'primary') {
            primaryContatctId = contact.id;
        }
        emails.add(contact.email);
        phoneNumbers.add(contact.phoneNumber);
        if (contact.linkPrecedence === 'secondary') {
            secondaryContactIds.push(contact.id);
        }
    });

    if (primaryContatctId === null) {
        throw new Error('Primary contact not found');
    }

    return {
        primaryContatctId,
        emails: Array.from(emails),
        phoneNumbers: Array.from(phoneNumbers),
        secondaryContactIds
    };
}

//POST request at /identify to identify the user
app.post('/identify', async (req, res) => {
    try {
        // Extract data from request body
        const { email, phoneNumber } = req.body;

        // If both null return 
        if (!email && !phoneNumber) {
            return res.status(400).json({ error: 'Either email or phoneNumber is required' });
        }

        //Find primary contact id if contact exists
        let primaryContactId = await findPrimaryContactId(email, phoneNumber);

        let precedenceVal: 'primary' | 'secondary' = 'primary';
        //If user exists, make it secondary
        if (Array.isArray(primaryContactId) && primaryContactId.length > 0) {
            precedenceVal = 'secondary';
            var linkedId = primaryContactId[0].id;
        } else {
            linkedId = null;
        }

        //Conlict detection for updation of contact from primary to secondary
        const { conflictDetected, conflictUsers } = await conflictUpdate(email, phoneNumber);
        conflictUsers.sort((a, b) => a.id - b.id);

        console.log("Conflict value:" + conflictDetected);

        //If conflict is detected, update the contact else insert a new or secondary contact
        if (conflictDetected) {
            console.log("Updating contact")
            await UpdateContact(conflictUsers, linkedId);
        } else {
            console.log("Inserting new contact")
            await InsertContact(email, phoneNumber, precedenceVal, linkedId); 
        }

        //Find all related contacts after finding the primary contact
        primaryContactId = await findPrimaryContactId(email, phoneNumber);
        const allContacts = await fetchRelatedContacts(primaryContactId[0].id); 

        // Process the response and send
        const processedContact = processResponse(allContacts);
        const output = {
            contact: processedContact
        };
        console.log(output)

        res.status(200).json(output);
    } catch (error: any) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})