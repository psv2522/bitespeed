# bitespeedtask

This project is built using Node.js with TypeScript and utilizes the drizzle-orm library for database operations. It also uses the Supabase PostgreSQL database.

## Project Overview

The purpose of this project is to provide an endpoint that can be accessed to retrieve specific output, as stated in the problem statement.

## Endpoint

The project exposes an endpoint called `/identify`. When this endpoint is accessed, it returns the desired output as specified in the problem statement.
Takes around 1s on localhost, the endpoint can be optimised mayber further, the render.com endpoint takes around 2-4s to respond 

## Getting Started

To get started with this project, follow these steps:

1. Clone the repository to your local machine.
2. Install the required dependencies by running `npm install`.
3. Configure the Supabase PostgreSQL database connection in the project, generate schema, migrate and push.
4. Start the application by running `npm start`.
5. Access the `/identify` endpoint and make a POST request to retrieve the desired output.
6. Deployed on render.com at [text](https://bitespeed-fgsx.onrender.com/identify)
