const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://divyanshpathak129:qxyUYuq8ylKsc9FN@workify-data.hzaze.mongodb.net/?retryWrites=true&w=majority&appName=workify-data";



const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let isClientConnected = false; // Tracks if the client is connected
let activeOperations = 0; // Tracks the connection status

// Function to get a connected client
async function getClient() {
  if (!isClientConnected) {
    console.log("Connecting to MongoDB...");
    await client.connect();
    isClientConnected = true;
  }
  activeOperations++; // Increment active operations
  console.log("Active operations:", activeOperations);
  return client;
}
async function closeClient() {
  if (activeOperations > 0) {
    console.log(
      "Cannot close the client connection because there are active operations."
    );
    return; // Exit without closing
  }
  if (isClientConnected) {
    console.log("Closing MongoDB connection...");
    await client.close();
    isClientConnected = false;
    console.log("MongoDB connection closed.");
  }
}

// Function to indicate an operation has finished
function releaseClient() {
  if (activeOperations > 0) {
    activeOperations--; // Decrement active operations
    if (activeOperations === 0) {
      closeClient(client);
    }
  } else if (activeOperations === 0) {
    closeClient(client);
  }
  console.log("Operation finished. Active operations:", activeOperations);
}

module.exports = { getClient, closeClient, releaseClient };
