require('dotenv').config();
const http = require('http');
const express  = require('express');
const { Server } = require('socket.io');
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://divyanshpathak129:<db_password>@workify-data.hzaze.mongodb.net/?retryWrites=true&w=majority&appName=workify-data";

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

const app = express()
app.use(cors());
const server = http.createServer(app)
const io = new Server(server, {
    cors:{
        // origin: process.env.CORS_URL,
        origin: '*',
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {

    console.log(`User Connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
    })
})

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server is Running on " + PORT));
