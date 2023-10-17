require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { Server } = require("ws");
var bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const adfluenceController = express.Router();
const path = require("path");
const openAIApiKey = process.env.API_KEY_OPEN_AI;
const PORT = process.env.PORT || 443;
const INDEX = "/index.html";

const server = express()
  // .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .use(cors({ origin: "*" }))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }))
  .use("/", adfluenceController)
  .listen(PORT, () =>
    console.log(
      `Server is Successfully Running,and App is listening on port: ${PORT}`
    )
  );
const sockserver = new Server({ server });

adfluenceController.get("/", (req, res) => {
  res.sendFile(`${__dirname}/index.html`, (err) => {
    if (err) {
      console.log(err);
      res.end(err.message);
    }
  });
});

adfluenceController.get('/get', (req, res) => {
  res.send('Welcome');
})

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

const openai = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openAIApiKey}`,
  },
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