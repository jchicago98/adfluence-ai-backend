const MongoClient = require("mongodb").MongoClient;
const express = require("express");
const mongoConnectionApp = express();

const urlDB = process.env.MONGO_URL;

async function createDatabaseAndCollections(userData) {
  try {
    const client = await MongoClient.connect(urlDB);
    const db = client.db("adfluence_db");
    console.log("Adfluence Database created!");

    // Create collection
    await db.createCollection("users");
    console.log("Users Collection created!");
    const collection = db.collection("users");

    const query = { emailAddress: userData.emailAddress };

    try {
      const result = await collection.find(query).toArray();
      if (result.length == 0) {
        await collection.insertOne(userData);
      }
    } catch (err) {
      console.error("Error querying the collection:", err);
    }

    client.close();

  } catch (err) {
    console.error("Error:", err);
  }
}

async function updateUserConversations(userConversations) {
  try {
    const client = await MongoClient.connect(urlDB);
    const db = client.db("adfluence_db");
    console.log("Adfluence Database created!");
    await db.createCollection("user_conversations");
    console.log("User_Conversations Collection created!");
    const collection = db.collection("user_conversations");
    const query = { emailAddress: userConversations.emailAddress };

    try {
      const result = await collection.find(query).toArray();
      if (result.length == 0) {
        await collection.insertOne(userConversations);
      }
      else if(result.length > 0){
        const filter = query;
        const options = { upsert: true };
        await collection.updateOne(filter, userConversations, options);
      }
    } catch (err) {
      console.error("Error querying the collection:", err);
    }

    client.close();

  } catch (err) {
    console.error("Error:", err);
  }
}

module.exports = { mongoConnectionApp, createDatabaseAndCollections, updateUserConversations };
