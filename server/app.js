require('dotenv').config();
const http = require('http');
const express  = require('express');
const { Server } = require('socket.io');
const cors = require("cors");
const { login, fetchUserData,deleteJob, removeJob, fetchJobs, evalate, getRawData, applicationData, generatePrompt, insertApplication, updateJobApplications, insertJob, createJob, fetchJobsAll } = require('./mongo1');

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyDfd1sWQARRkqOQFf-9DXXpmTK5I_86up0");

const app = express()
app.use(cors());
const server = http.createServer(app)
const io = new Server(server, {
    cors:{
        origin: '*',
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {

    socket.on("login", async (credentials) => {
       if(credentials){
        // console.log(credentials);
        const content = await login({credentials});
        console.log(content);
        if(content.status === "ok"){
            socket.emit("loginCreds", content )   
        }else{
            socket.emit("loginDenied", content )
        }
       }
    })

    socket.on("applicationSubmit", async (formData, jobId) => {
        console.log(formData, jobId);
        const applicationId = await insertApplication(formData, jobId);
        console.log("Application ID:", applicationId);
        await updateJobApplications(jobId, applicationId);
    })

    socket.on("jobsFetch", async (jobs) => {
        const data = await fetchJobs(jobs); 
        // console.log(data);
        if(data.status === "ok"){
            socket.emit("jobsData", data)
        }
    })

    socket.on("deleteJob", async (jobId, id) => {
        await deleteJob(jobId, id); 
        await removeJob(jobId, id);
    })

    socket.on ("jobsFetchAll", async () => {
        const data = await fetchJobsAll(); 
        // console.log(data);
        if(data.status === "ok"){
            console.log("ok")
            socket.emit("jobsData", data)
        }
    })

    socket.on("createJob", async (formData, id) => {
        // console.log(formData, id);
        const jobId = await createJob(formData, id);
        await insertJob(jobId, id);
        socket.emit("jobCreated", { status: "ok", jobId });
    })

    socket.on("fetchUserData", async (id) => {
        const data = await fetchUserData(id);
        // console.log(data);
        if(data.status === "ok"){
            socket.emit("userData", data)
        }
    })

    socket.on("evaluateJob", async (jobId) => {
        try {
            console.log('Evaluating job:', jobId);
            const jobData = await getRawData(jobId);
            const applicationsData = await applicationData(jobData.applications);
            const prompt = await generatePrompt(jobData, applicationsData);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(prompt);
            const analysisText = await result.response.text();
            const analysis = JSON.parse(analysisText);
            console.log(analysis);
            socket.emit("reportData", analysis);
        } catch (error) {
            console.error("Error in evaluateJob handler:", error);
            socket.emit("error", { 
                status: "error", 
                message: "Failed to generate analysis" 
            });
        }
    })

})



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server is Running on " + PORT));
