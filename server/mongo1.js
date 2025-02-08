const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://divyanshpathak129:qxyUYuq8ylKsc9FN@workify-data.hzaze.mongodb.net/?retryWrites=true&w=majority&appName=workify-data";
const { getClient, closeClient, releaseClient } = require('./clientChecker.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyDfd1sWQARRkqOQFf-9DXXpmTK5I_86up0");

// Create a MongoClient instance
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB once
async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

// Initialize connection
connectToMongo();

async function fetchUserData(id) {
  try {
    const database = client.db('application-data');
    const collection = database.collection('userData');
    const mainId = new ObjectId(id);
    const query = { _id: mainId };
    const user = await collection.findOne(query);
    if(user){
      return {status: "ok", message: "Login Successful", content: user};
    }
    return {status: "error", message: "Invalid Credentials"};
  } catch (error) {
    console.error("Error in fetchUserData:", error);
    return {status: "error", message: "Database error"};
  }
}

async function login({credentials}) {
  try {
    const database = client.db('application-data');
    const collection = database.collection('userData');
    const query = { name: credentials.username };
    const user = await collection.findOne(query);
    
    if(user && user.password === credentials.password){
      return {status: "ok", message: "Login Successful", content: user};
    }
    return {status: "error", message: "Invalid Credentials"};
  } catch (error) {
    console.error("Error in login:", error);
    return {status: "error", message: "Database error"};
  }
}

async function fetchJobs(requestIds) {
  try {
    const database = client.db("application-data");
    const collection = database.collection("jobsData");
    
    const promises = requestIds.map(id => {
      if (typeof id !== "string" || id.length !== 24) return Promise.resolve(null);
      return collection.findOne({ _id: new ObjectId(id) });
    });

    const jobDocs = await Promise.all(promises);
    const jobs = jobDocs.filter(job => job !== null);
    
    return {status: "ok", content: jobs};
  } catch (error) {
    console.error("Error in fetchJobs:", error);
    return {status: "error", message: "Database error"};
  }
}

// Clean up on application termination
process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error while closing MongoDB connection:', error);
    process.exit(1);
  }
});



async function evalate(jobId) {
  try {
    const database = client.db("application-data");
    const collection = database.collection("jobsData");
    const job = await collection.findOne({ _id: new ObjectId(jobId) });
    
    if (!job) {
      return { status: "error", message: "Job not found" };
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Prepare the prompt
    const prompt = `
    Analyze this job posting and provide a detailed report:
    
    Title: ${job.title}
    Description: ${job.description}
    Requirements: ${job.requirements}
    
    Please provide:
    1. Overview of the job posting
    2. Key skills required
    3. Suggested improvements
    4. Clarity score (1-10)
    5. Completeness score (1-10)
    `;

    // Generate analysis
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      status: "ok",
      content: {
        jobDetails: job,
        analysis: text
      }
    };

  } catch (error) {
    console.error("Error in evaluation:", error);
    return { status: "error", message: "Evaluation failed" };
  }
}

async function getRawData (jobId) {
  try {
    const database = client.db("application-data");
    const collection = database.collection("jobsData");
    const job = await collection.findOne({ _id: new ObjectId(jobId) });
    return job;

  } catch (error) {
    console.error("Error in getRawData:", error);
    return null;
  }
}

async function applicationData (applicationIds) {
  try {
    const database = client.db("application-data");
    const collection = database.collection("applicationsData");
    
    const promises = applicationIds.map(id => {
      if (typeof id !== "string" || id.length !== 24) return Promise.resolve(null);
      return collection.findOne({ _id: new ObjectId(id) });
    });

    const applicationDocs = await Promise.all(promises);
    const applications = applicationDocs.filter(application => application !== null);
    return {
      status: "ok",
      content: applications
    };
  } catch (error) {
    console.error("Error in applicationData:", error);
    return {status: "error", message: "Database error"};
  }
}

async function generatePrompt(jobData, applicationsData) {
  try {
    console.log(JSON.stringify(applicationsData, null, 2));
    const prompt = `
    As an AI hiring assistant, analyze this job posting and its applications to provide a detailed evaluation report.
      
    JOB DETAILS:
    Title: ${jobData.jobPosition}
    Salary: ${jobData.salary}
    Company Values: ${jobData.companyValues}
      
    EVALUATION CRITERIA:
    For each application, provide scores on a scale of 1-10 for:
    - Competence Value Score: Based on education, experience, and achievements
    - Skill Value Score: Match between required skills and candidate's skillset
    - Cultural Value Score: Based on soft skills, notes, and overall profile alignment
      
    ${applicationsData.content.map((app, index) => `
    APPLICATION ${index + 1} (ID: ${app._id}):
    General Info:
    - Name: ${app.content.general.name}
    - Email: ${app.content.general.email}
    - Education: ${app.content.education.degree} in ${app.content.education.field} from ${app.content.education.school}
    - Experience: ${app.content.experience.map(exp => `${exp.position} at ${exp.company} (${exp.year})`).join(', ')}
    - Skills: ${app.content.skills.join(', ')}
    - Achievements: ${app.content.achievements.join(', ')}
    - Notes: ${app.content.notes}
    `).join('\n')}
    
    Provide your analysis in the following strict JSON format with no additional text:
    {
      "applicationAnalysis": [
        {
          "applicationId": "string",
          "applicantName": "string",
          "applicantEmail": "string",
          "competenceScore": number,
          "skillScore": number,
          "culturalScore": number,
          "overallScore": number,
          "justification": "string"
        }
      ],
      "comparativeAnalysis": [
        {
          "applicationId": "string",
          "applicantName": "string",
          "overallScore": number,
          "explanation": "string"
        }
      ],
      "hiringRecommendations": {
        "topCandidate": {
          "applicationId": "string",
          "applicantName": "string"
        },
        "nextSteps": "string",
        "additionalInformationNeeded": "string",
        "potentialRedFlags": "string"
      }
    }

    Return ONLY the JSON object with no additional text or explanation. Ensure the response is valid JSON that can be parsed directly.
    `;

    return prompt;
  } catch (error) {
    console.error("Error in generatePrompt:", error);
    return null;
  }
}

module.exports = {login, fetchUserData, fetchJobs, evalate, getRawData, applicationData, generatePrompt};