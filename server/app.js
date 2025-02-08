require('dotenv').config();
const http = require('http');
const express  = require('express');
const { Server } = require('socket.io');
const cors = require("cors");
const { login, fetchUserData, fetchJobs } = require('./mongo1');



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

    socket.on("jobsFetch", async (jobs) => {
        const data = await fetchJobs(jobs); 
        console.log(data);
        if(data.status === "ok"){
            socket.emit("jobsData", data)
        }
    })

    socket.on("fetchUserData", async (id) => {
        const data = await fetchUserData(id);
        console.log(data);
        if(data.status === "ok"){
            // console.log("Done dune")
            socket.emit("userData", data)
        }
        // callback(data);
    })

})

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server is Running on " + PORT));
