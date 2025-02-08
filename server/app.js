require('dotenv').config();
const http = require('http');
const express  = require('express');
const { Server } = require('socket.io');
const cors = require("cors");
const { login, fetchUserData } = require('./mongo1');



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

    socket.on("login", async (credentials, callback) => {
       if(credentials){
        console.log(credentials);
        const content = await login({credentials});
        console.log(content);
        if(content.status === "ok"){
            socket.emit("loginCreds", content )   
        }else{
            socket.emit("loginDenied", content )
        }
       }
    })

    socket.on("fetchUserData", async (credentials, callback) => {
        const data = await fetchUserData({credentials});
        console.log(data);
        callback(data);
    })

    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
    })
})

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server is Running on " + PORT));
