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
        console.log(credentials.username)
        const query = { name: credentials.username };
        const user = await collection.findOne(query);
        console.log(query);
        console.log(user);

        if(user && user.password === credentials.password){
          return {status: "ok", message: "Login Successful", content: user};
        }
        else{
          return {status: "error", message: "Invalid Credentials"};
        }
      } finally {
        releaseClient();
      }

  }

  // async function fetchJobs (jobIds) {
  //   let client = await getClient();
  //   try {
  //       const database = client.db('application-data');
  //       const collection = database.collection('jobsData');
  //       const query = { _id: { $in: jobIds } };
  //       const jobs = await collection.find(query).toArray();
  //       return {status: "ok", content: jobs};
  //     } finally {
  //       releaseClient();
  //     }
  // }

  async function fetchJobs(requestIds) {
      const jobs = [];
      let client;
      try {
          client = await getClient();
          const database = client.db("application-data");
          const collection = database.collection("jobsData");

          const promises = requestIds.map(id => {
              if (typeof id !== "string" || id.length !== 24) return Promise.resolve(null);
              return collection.findOne({ _id: new ObjectId(id) });
          });

          const jobDocs = await Promise.all(promises);
          for (const job of jobDocs) {
              if (!job) continue;
              // jobs.push({
              //     position: job.jobPosition,
              //     id: job._id,
              //     salary: job.salary ? parseFloat(job.salary) : undefined,
              //     parentUserId: job.parentUserId ? job.parentUserId.toString() : undefined,
              //     isOpen: job.isOpen,
              //     applications: job.applications ? job.applications : [],
              //     companyValues: job.companyValues ? job.companyValues : [],
              //     dateOfCreation: job.dateOfCreation ? new Date(job.dateOfCreation).toISOString() : undefined
              // });
              jobs.push(job);
              
          }
          return {status: "ok", content: jobs};
      } catch (error) {
          console.log(error, "error while fetching jobs data");
      } finally {
          if (client) {
              await closeClient(client);
              await client.close();
          }
      }
  }

  module.exports = {login, fetchUserData, fetchJobs};