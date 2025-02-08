import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import './ApplicationForm.scss';
import { toast, Toaster } from 'react-hot-toast';

const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

function ApplicationForm() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobDetails, setJobDetails] = useState(null);
  const [formData, setFormData] = useState({
    general: {
      name: '',
      email: '',
      phone: '',
    },
    education: {
      degree: '',
      field: '',
      school: '',
      year: '',
    },
    experience: [{
      position: '',
      company: '',
      year: '',
      description: '',
    }],
    skills: [],
    achievements: [],
    notes: '',
  });

  useEffect(() => {
    if (jobId) {
      socket.emit("fetchJobDetails", jobId);
    }

    const handleJobDetails = (data) => {
      if (data.status === "ok") {
        setJobDetails(data.content);
      } else {
        toast.error('Failed to load job details');
      }
    };

    socket.on("jobDetails", handleJobDetails);

    return () => {
      socket.off("jobDetails", handleJobDetails);
    };
  }, [jobId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("submitApplication", {
      jobId,
      application: formData
    });
  };

  return (
    <div className="application-container">
      <div className="application-header">
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
          <h2 className="highlight">Workify</h2>
        </div>
      </div>

      <div className="application-content">
        {jobDetails ? (
          <>
            <div className="job-details">
              <h1>{jobDetails.title}</h1>
              <p className="company">{jobDetails.company}</p>
              <div className="job-description">
                <h3>Job Description</h3>
                <p>{jobDetails.description}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="application-form">
              <h2>Application Form</h2>
              <section className="form-section">
                <h3>Personal Information</h3>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.general.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      general: { ...formData.general, name: e.target.value }
                    })}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.general.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      general: { ...formData.general, email: e.target.value }
                    })}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={formData.general.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      general: { ...formData.general, phone: e.target.value }
                    })}
                    required
                  />
                </div>
              </section>
              <button type="submit" className="submit-btn">
                Submit Application
              </button>
            </form>
          </>
        ) : (
          <div className="loading">Loading job details...</div>
        )}
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default ApplicationForm;
