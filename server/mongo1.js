const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://divyanshpathak129:qxyUYuq8ylKsc9FN@workify-data.hzaze.mongodb.net/?retryWrites=true&w=majority&appName=workify-data";
const { getClient, closeClient, releaseClient } = require('./clientChecker.js');

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

module.exports = {login, fetchUserData, fetchJobs};