require("dotenv").config();
const express = require("express");
const axios = require("axios");
const WebSocket = require("websocket").w3cwebsocket;
const { WebSocketServer } = require("ws");
var bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const openAIApiKey = process.env.API_KEY_OPEN_AI;

const sockserver = new WebSocketServer({ port: 443 });
sockserver.on("connection", (ws) => {
  console.log("New client connected!");
  ws.on("close", () => {
    console.log("Client has disconnected!");
  });
  ws.on("message", (data) => {
    console.log(`${data}`);
    //createDatabaseAndCollections(`${data}`);
  });
  ws.onerror = function () {
    console.log("websocket error");
  };
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
