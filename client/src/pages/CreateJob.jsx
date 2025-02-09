import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import './CreateJob.scss';
import { toast, Toaster } from 'react-hot-toast';

const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

function CreateJob() {
  const navigate = useNavigate();
  const {id} = useParams();
  const [jobData, setJobData] = useState({
    jobPosition: '',
    // company: '',
    // location: '',
    salary: '',
    // employmentType: 'Full-time',
    // description: '',
    // requirements: '',
    // companyValues: '',
    // responsibilities: '',
    // benefits: '',
    applications: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    socket.emit("createJob", jobData, id );
  };

  const validateForm = () => {
    const requiredFields = ['jobPosition', 'salary'];
    return requiredFields.every(field => jobData[field].trim() !== '');
  };

  // Setup socket listener for response
  React.useEffect(() => {
    socket.on("jobCreated", (response) => {
      if (response.status === "ok") {
        toast.success('Job posted successfully!');
        navigate('/dashboard');
        toast.error(response.message || 'Failed to create job');
      }
    });

    return () => {
      socket.off("jobCreated");
    };
  }, [navigate]);

  return (
    <div className="create-job-container">
      <div className="create-job-header">
        <div className="logo-container">
          <svg width="32" height="32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_231_793)">
              <path fillRule="evenodd" clipRule="evenodd" d="M50 0H200V50V150L150 200L150 50H0L50 0ZM0 165.067V100L65.067 100L0 165.067ZM100 200H35.7777L100 135.778L100 200Z" 
                fill="url(#paint0_linear_231_793)"/>
            </g>
            <defs>
              <linearGradient id="paint0_linear_231_793" x1="177" y1="-9.23648e-06" x2="39.5" y2="152.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#5ef7cd"/>
                <stop offset="1" stopColor="#00d0a3"/>
              </linearGradient>
              <clipPath id="clip0_231_793">
                <rect width="200" height="200" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          <h2 className="highlight">Create New Position</h2>
        </div>
      </div>

      <div className="create-job-content">
        <form onSubmit={handleSubmit} className="job-form">
          <section className="form-section">
            <h3>Basic Information</h3>
            <div className="input-group">
              <input
                type="text"
                placeholder="Job Position*"
                value={jobData.jobPosition}
                onChange={(e) => setJobData({ ...jobData, jobPosition: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Company Name*"
                value={jobData.company}
                onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={jobData.location}
                onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
              />
              <input
                type="text"
                placeholder="Salary Range*"
                value={jobData.salary}
                onChange={(e) => setJobData({ ...jobData, salary: e.target.value })}
                required
              />
            </div>
          </section>

          <section className="form-section">
            <h3>Job Details</h3>
            <div className="input-group">
              <select
                value={jobData.employmentType}
                onChange={(e) => setJobData({ ...jobData, employmentType: e.target.value })}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
              
              <textarea
                placeholder="Job Description*"
                value={jobData.description}
                onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                required
                rows={4}
              />
              
              <textarea
                placeholder="Requirements*"
                value={jobData.requirements}
                onChange={(e) => setJobData({ ...jobData, requirements: e.target.value })}
                required
                rows={4}
              />
              
              <textarea
                placeholder="Company Values*"
                value={jobData.companyValues}
                onChange={(e) => setJobData({ ...jobData, companyValues: e.target.value })}
                required
                rows={4}
              />
              
              <textarea
                placeholder="Responsibilities"
                value={jobData.responsibilities}
                onChange={(e) => setJobData({ ...jobData, responsibilities: e.target.value })}
                rows={4}
              />
              
              <textarea
                placeholder="Benefits"
                value={jobData.benefits}
                onChange={(e) => setJobData({ ...jobData, benefits: e.target.value })}
                rows={4}
              />
            </div>
          </section>

          <button type="submit" className="submit-btn">
            Create Position
          </button>
        </form>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default CreateJob;
