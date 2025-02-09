require('dotenv').config();
const http = require('http');
const express  = require('express');
const { Server } = require('socket.io');
const cors = require("cors");
const { login, fetchUserData, fetchJobs, evalate, getRawData, applicationData, generatePrompt, insertApplication, updateJobApplications, createJob, insertJob } = require('./mongo1');

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

    socket.on(
        "createJob", async (jobData, id) => {
            console.log(jobData, id);
            const data = await createJob(jobData, id);
            console.log(data);
            insertJob(data, id);
            
        }
    )

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
            if (!jobData) {
                throw new Error("Job data not found");
            }
            
            const applicationsData = await applicationData(jobData.applications);
            if (!applicationsData || !applicationsData.content) {
                throw new Error("Applications data not found");
            }

            const prompt = await generatePrompt(jobData, applicationsData);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(prompt);
            const analysisText = await result.response.text();
            
            // Validate that we have valid JSON before sending
            try {
                const parsedAnalysis = JSON.parse(analysisText);
                console.log("Sending report data:", parsedAnalysis);
                socket.emit("reportData", parsedAnalysis);
            } catch (parseError) {
                console.error("Invalid JSON response:", parseError);
                socket.emit("reportError", { 
                    status: "error", 
                    message: "Invalid analysis format" 
                });
            }
        } catch (error) {
            console.error("Error in evaluateJob handler:", error);
            socket.emit("reportError", { 
                status: "error", 
                message: error.message || "Failed to generate analysis" 
            });
        }
    })

})



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server is Running on " + PORT));
