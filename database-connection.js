const MongoClient = require("mongodb").MongoClient;
const express = require('express');
const mongoConnectionApp = express();

const urlDB = process.env.MONGO_URL;

async function createDatabaseAndCollections(userData) {
  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(urlDB);

    // Create database
    const db = client.db("adfluence_db");

    console.log("Adfluence Database created!");

    // Create collection
    await db.createCollection("users");
    console.log("Users Collection created!");

    // Insert a document
    const collection = db.collection("users");

    // Query collection
    const query = { emailAddress: userData.emailAddress };

    try {
      const result = await collection.find(query).toArray();
      if(result.length == 0){
        await collection.insertOne(userData);
      }
    } catch (err) {
      console.error("Error querying the collection:", err);
    }

    // Close the connection
    client.close();
  } catch (err) {
    console.error("Error:", err);
  }
}

module.exports = { mongoConnectionApp, createDatabaseAndCollections };
