require('dotenv').config();
const MongoClient = require("mongodb").MongoClient;
const express = require('express');
const mongoConnectionApp = express();

const urlDB = process.env.MONGODB_URL;

async function createDatabaseAndCollections(userData) {
    console.log("Inside create database");
    try {
      // Connect to MongoDB
      const client = await MongoClient.connect(urlDB);
  
      // Create database
      const db = client.db("example_db");
      console.log("Database created!");
  
      // Create collection
      await db.createCollection("example_schema");
      console.log("Collection created!");
  
      // Insert a document
      const collection = db.collection("example_schema");
      let currentName = userData;
      const myobj = {
        name: currentName
      };
      await collection.insertOne(myobj);
      console.log(userData + " inserted into database.");
  
      // Close the connection
      client.close();
    } catch (err) {
      console.error("Error:", err);
    }
  }


  module.exports = { mongoConnectionApp, createDatabaseAndCollections };