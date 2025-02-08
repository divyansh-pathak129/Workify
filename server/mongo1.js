const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://divyanshpathak129:qxyUYuq8ylKsc9FN@workify-data.hzaze.mongodb.net/?retryWrites=true&w=majority&appName=workify-data";
const { getClient, closeClient, releaseClient } = require('./clientChecker.js');


const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });



async function fetchUserData(id) {

    let client = await getClient();
    try {
        const database = client.db('application-data');
        const collection = database.collection('userData');
        const mainId = new ObjectId(id);
        const query = { _id: mainId };
        const user = await collection.findOne(query);
        if(user){
            return {status: "ok", message: "Login Successful", content: user};
        }
        else{
            return {status: "error", message: "Invalid Credentials"};
        }
      } finally {
       releaseClient();
      }

}

async function login ({credentials}) {
  let client = await getClient();
  try {
      const database = client.db('application-data');
      const collection = database.collection('userData');
      const query = { username: credentials.name, password: credentials.password };
      const user = await collection.findOne(query);
      if(user){
        return {status: "ok", message: "Login Successful", content: user};
      }
      else{
        return {status: "error", message: "Invalid Credentials"};
      }
    } finally {
      releaseClient();
    }

}

module.exports = {login, fetchUserData};