import { notEqual } from "assert";
import { db } from "./db/db"
import { Contact } from "./db/schema";
import { or, eq, and, ne } from 'drizzle-orm';
import { link } from "fs";


const express = require('express')
const app = express()
app.use(express.json());

const port = 3000

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/identify', (req, res) => {
    res.send('POST request in the format at /identify')
})

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

async function fetchRelatedContacts(primaryContactId, ) {
    try {
        const allContacts = await db.select().from(Contact)
            .where(eq(Contact.linkedId, primaryContactId));
        return allContacts;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function conflictUpdate(email: string, phoneNumber: string) {
    var conflictDetected = false;
    const conflictUsers = await db.select().from(Contact).where(and(or(eq(Contact.email, email), eq(Contact.phoneNumber, phoneNumber)), eq(Contact.linkPrecedence, 'primary')));
    console.log("Conflict Users:" + conflictUsers)
    if (conflictUsers.length > 1) {
        conflictDetected = true;
    }
    return { conflictDetected, conflictUsers };
}

app.post('/identify', async (req, res) => {
    try {
        // Extract data from request body
        const { email, phoneNumber } = req.body;

        if (!email && !phoneNumber) {
            return res.status(400).json({ error: 'Either email or phoneNumber is required' });
        }
        let primaryContactId = await findPrimaryContactId(email, phoneNumber);

        let precedenceVal: 'primary' | 'secondary' = 'primary';
        //If user exists, make it secondary
        if (Array.isArray(primaryContactId) && primaryContactId.length > 0) {
            precedenceVal = 'secondary';
            var linkedId = primaryContactId[0].id;
        } else {
            linkedId = null;
        }

        const { conflictDetected, conflictUsers } = await conflictUpdate(email, phoneNumber);
        conflictUsers.sort((a, b) => a.id - b.id);

        console.log("Conflict value:" + conflictDetected);
        let user; // Initialize user variable with null
        if (conflictDetected) {
            console.log("Updating contact")
            user = await UpdateContact(conflictUsers, linkedId);
        } else {
            console.log("Inserting new contact")
            user = await InsertContact(email, phoneNumber, precedenceVal, linkedId); // Assign the value inside the if block
        }

        primaryContactId = await findPrimaryContactId(email, phoneNumber);
        console.log(primaryContactId+ "Primary Contact Id")
        const allContacts = await fetchRelatedContacts(primaryContactId); // Fetch all related contacts
        console.log(allContacts)

        res.status(200).send(user);
    } catch (error: any) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})