import express, { Application, Request, Response, Router, json } from "express";

const app: Application = express();

const server: Application = require("http").Server(app);
const io = require("socket.io")(server, {
  pingInterval: 10000,
  pingTimeout: 5000
});

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv/config");

//IMPORT ROUTES
const userRoute: Router = require("./routes/user");
const postsRoute: Router = require("./routes/posts");
const newsRoute: Router = require("./routes/news");

//MIDDLEWARE
app.use(cors());
app.use(json());
app.use(bodyParser.json());

//ROUTES
app.use("/api/user", userRoute);
app.use("/api/posts", postsRoute);
app.use("/api/news", newsRoute);

//MAIN ENDPOINT
app.get("/", (req: Request, res: Response): void => {
  res.send("CODERS WHO...API");
});

//CONNECT TO DB
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true }, () => {
  console.log("Connected to database.");
});

app.listen("3005", () => console.log("Listening on port 3005."));

//server.listen("80", () => console.log("Listening on port 80."));

// const cron = require("node-cron");
// const axios = require("axios");

// const WebSocket = require("ws");
// const pricesUrl: string =
//   "wss://ws.coincap.io/prices?assets=bitcoin,ethereum,litecoin,dogecoin,ripple";

// //PRICE DATA WEB SOCKETS
// io.on("connection", function(socket: any): void {
//   console.log("Connected to: " + socket.id);
// });

// io.on("end", function(socket: any): void {
//   console.log(socket.id + " disconnected.");
// });

// //GETS DATA FROM API SENDS TO CLIENT
// const pricesWs = new WebSocket(pricesUrl);
// pricesWs.onmessage = function(msg: any): void {
//   let priceData = JSON.parse(msg.data);
//   //socket.emit('request', priceData = priceData); // emit an event to the socket when 'request' comes through
//   io.emit("broadcast", priceData);
// };
