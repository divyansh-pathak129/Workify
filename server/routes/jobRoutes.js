// ...existing imports...

module.exports = (socket) => {
  // ...existing socket handlers...

  socket.on("deleteJob", async (data) => {
    try {
      const { jobId, userId } = data;
      console.log("Deleting job:", jobId, "for user:", userId); // Debug log

      // Delete the job from the database
      const deletedJob = await Job.findByIdAndDelete(jobId);
      if (!deletedJob) {
        throw new Error('Job not found');
      }

      // Remove job reference from user's jobs array
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { jobs: jobId } },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error('User not found');
      }

      // Send success response
      socket.emit("jobDeleted", {
        status: "ok",
        jobId: jobId
      });

    } catch (error) {
      console.error("Error deleting job:", error);
      socket.emit("jobDeleted", {
        status: "error",
        message: error.message
      });
    }
  });

  // ...rest of socket handlers...
};
