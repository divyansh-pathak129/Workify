// ...existing imports and setup...

io.on("connection", (socket) => {
  // ...existing socket handlers...

  socket.on("fetchJobDetails", async (jobId) => {
    try {
      const database = client.db("application-data");
      const collection = database.collection("jobsData");
      const job = await collection.findOne({ _id: new ObjectId(jobId) });
      
      if (job) {
        socket.emit("jobDetails", {
          status: "ok",
          content: job
        });
      } else {
        socket.emit("jobDetails", {
          status: "error",
          message: "Job not found"
        });
      }
    } catch (error) {
      console.error("Error in fetchJobDetails:", error);
      socket.emit("jobDetails", {
        status: "error",
        message: "Failed to fetch job details"
      });
    }
  });

  socket.on("submitApplication", async (data) => {
    try {
      const database = client.db("application-data");
      const collection = database.collection("applicationsData");
      const result = await collection.insertOne({
        jobId: data.jobId,
        content: data.application,
        dateSubmitted: new Date()
      });
      
      socket.emit("applicationSubmitted", {
        status: "ok",
        message: "Application submitted successfully"
      });
    } catch (error) {
      console.error("Error in submitApplication:", error);
      socket.emit("applicationSubmitted", {
        status: "error",
        message: "Failed to submit application"
      });
    }
  });

  socket.on("fetchReport", async (jobId) => {
    try {
      const database = client.db("application-data");
      const collection = database.collection("reportsData");
      
      const report = await collection.findOne({ jobId: jobId });
      
      if (report) {
        socket.emit("report", {
          status: "ok",
          content: report
        });
      } else {
        socket.emit("report", {
          status: "error",
          message: "No report found for this job"
        });
      }
    } catch (error) {
      console.error("Error in fetchReport:", error);
      socket.emit("report", {
        status: "error",
        message: "Failed to fetch report"
      });
    }
  });
});
