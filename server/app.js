require('dotenv').config();
const http = require('http');
const express  = require('express');
const { Server } = require('socket.io');
const cors = require("cors");

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

