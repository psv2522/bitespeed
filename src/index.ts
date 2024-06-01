import e from "express";
import { db } from "./db/db"
import { Contact } from "./db/schema";
import { or, eq } from 'drizzle-orm';


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

async function checkIfContactExists(email, phoneNumber) {
    try {
        const result = await db.select().from(Contact).where(
            or(
                eq(Contact.email, email),
                eq(Contact.phoneNumber, phoneNumber)
            ));
        return result;
    } catch (error) {
        console.log(error)
    }
}

async function InsertContact(email, phoneNumber) {
    const existingUser = await checkIfContactExists(email, phoneNumber);
    try { 
        //set link Precedence
        if (!Array.isArray(existingUser) || existingUser.length === 0) {
            var precedenceVal = "primary"    
        } else { 
            precedenceVal = "secondary"
        }

        const user = db.insert(Contact).values({
            email: email,
            phoneNumber: phoneNumber,
            linkPrecedence: precedenceVal,
        }).returning({
            id: Contact.id,
        });
        return user;
    } catch (error) {
        console.log(error);
    }
}

app.post('/identify', async (req, res) => {
    try {
        // Extract data from request body
        const { email, phoneNumber } = req.body;

        // InsertContact(email, phoneNumber);
        const user = await InsertContact(email, phoneNumber);
        console.log(user)

    } catch (error: any) {
        res.status(500).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})