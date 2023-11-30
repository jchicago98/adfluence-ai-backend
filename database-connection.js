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
      let listOfCurrentMessages = null;
      const result = await collection.find(query).toArray();
      if (result.length == 0) {
        await collection.insertOne(userConversations);
      }
      else if(result.length > 0){
        const resultUserConversation = result[0].user_conversation;
        resultUserConversation.forEach((obj)=>{
          if(obj.topic == userConversations.user_conversation[0].topic){
            listOfCurrentMessages = obj.list_of_messages;
          }
        });
        listOfCurrentMessages = listOfCurrentMessages.concat(userConversations.user_conversation[0].list_of_messages);
        userConversations.user_conversation[0].list_of_messages = listOfCurrentMessages;
        const filter = query;
        const update = {
          $set: {
            "user_conversation.$[element].list_of_messages": userConversations.user_conversation[0].list_of_messages,
          },
        };
        const arrayFilters = [{ "element.topic": userConversations.user_conversation[0].topic }];
        const options = { upsert: true, arrayFilters };
        await collection.updateOne(filter, update, options);
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
