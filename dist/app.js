"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const app = express_1.default();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
    pingInterval: 10000,
    pingTimeout: 5000
});
const cron = require("node-cron");
const axios = require("axios");
const WebSocket = require("ws");
const pricesUrl = "wss://ws.coincap.io/prices?assets=bitcoin,ethereum,litecoin,dogecoin,ripple";
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv/config");
//IMPORT ROUTES
const userRoute = require("./routes/user");
const postsRoute = require("./routes/posts");
const newsRoute = require("./routes/news");
//MIDDLEWARE
app.use(cors());
app.use(express_1.json());
app.use(bodyParser.json());
//ROUTES
app.use("/api/user", userRoute);
app.use("/api/posts", postsRoute);
app.use("/api/news", newsRoute);
//MAIN ENDPOINT
app.get("/", (req, res) => {
    res.send("CODERS WHO...API");
});
//PRICE DATA WEB SOCKETS
io.on("connection", function (socket) {
    console.log("Connected to: " + socket.id);
});
io.on("end", function (socket) {
    console.log(socket.id + " disconnected.");
});
//GETS DATA FROM API SENDS TO CLIENT
const pricesWs = new WebSocket(pricesUrl);
pricesWs.onmessage = function (msg) {
    let priceData = JSON.parse(msg.data);
    //socket.emit('request', priceData = priceData); // emit an event to the socket when 'request' comes through
    io.emit("broadcast", priceData);
};
//CONNECT TO DB
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true }, () => {
    console.log("Connected to database.");
});
app.listen("3005", () => console.log("Listening on port 3005."));
//server.listen("80", () => console.log("Listening on port 80."));
