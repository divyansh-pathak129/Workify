const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://divyanshpathak129:qxyUYuq8ylKsc9FN@workify-data.hzaze.mongodb.net/?retryWrites=true&w=majority&appName=workify-data";


const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });



async function login({credentials}) {

    try {
        await client.connect();
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
        await client.close();
      }

}

async function fetchUserData({credentials}) {

  try {
      await client.connect();
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
      await client.close();
    }

}

module.exports = {login, fetchUserData};