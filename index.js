require("dotenv").config();
const express = require("express");
const axios = require("axios");
const WebSocket = require("ws");
var bodyParser = require("body-parser");
const app = express();
const http = require("http");
const cors = require("cors");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  cors({
    origin: "*",
  })
);

const openAIApiKey = process.env.API_KEY_OPEN_AI;

const openai = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openAIApiKey}`,
  },
});

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World!');
});
const sockserver = new WebSocket.Server({ server });

sockserver.on("connection", (ws) => {
  console.log("New client connected!");
  ws.on("close", () => {
    console.log("Client has disconnected!");
  });
  ws.on("message", (data) => {
    sockserver.clients.forEach(async (client) => {
      let dataString = `${data}`;
      const userMessageObj = { user: dataString };
      const userMessage = JSON.stringify(userMessageObj);
      client.send(userMessage);
      const aiResponse = await sendChatGPT(dataString);
      const aiMessageObj = { ai: aiResponse };
      const aiMessage = JSON.stringify(aiMessageObj);
      client.send(aiMessage);
    });
    console.log(`${data}`);
    //createDatabaseAndCollections(`${data}`);
  });
  ws.onerror = function () {
    console.log("websocket error");
  };
});

async function sendChatGPT(content) {
  const userContent =
    content + ":" + "Please keep your response to 20 words or less.";
  const messages = [{ role: "user", content: userContent }];
  return new Promise(async (resolve, reject) => {
    try {
      const chatGPTResponse = await openai.post("/chat/completions", {
        model: "gpt-3.5-turbo",
        messages,
      });
      const replyMessage = chatGPTResponse.data.choices[0].message.content;
      resolve(replyMessage);
    } catch (error) {
      console.error("Error sending message to OpenAI:", error.message);
      reject(error);
    }
  });
}

const port = 443;
const INDEX = "/index.html";
app.use((req, res) => {
  res.sendFile(INDEX, { root: __dirname });
});

server.listen(port, (error) => {
  if (!error) {
    console.log(
      "Server is Successfully Running,and App is listening on port " + port
    );
  } else {
    console.log("Error occurred, server can't start", error);
  }
});
