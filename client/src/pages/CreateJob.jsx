import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { toast, Toaster } from 'react-hot-toast';
import './CreateJob.scss';

const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

function JobForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: [],
    location: '',
    salary: '',
<<<<<<< HEAD
    type: 'Full-time',
    experience: '',
    skills: []
=======
    companyValues: '',
    applications: []
>>>>>>> 2a959b44a132c7c9033aec1353768f03f1c4fdd3
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("createJob", { ...formData, parentUserId: id });
    toast.success('Job posted successfully!');
    setTimeout(() => navigate(`/dashboard/${id}`), 1500);
  };

  const handleChange = (e, field) => {
    const { value } = e.target;
    if (field === 'requirements' || field === 'skills') {
      setFormData(prev => ({
        ...prev,
        [field]: value.split(',').map(item => item.trim())
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

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
          <h2 className="highlight">Workify</h2>
        </div>
      </div>

      <div className="create-job-content">
        <div className="form-card">
          <h1>Create New Job Post</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange(e, 'title')}
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>

              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleChange(e, 'company')}
                  placeholder="Your company name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange(e, 'location')}
                  placeholder="e.g., New York, NY (Remote)"
                  required
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange(e, 'type')}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="form-group">
                <label>Experience Level</label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => handleChange(e, 'experience')}
                  placeholder="e.g., 3-5 years"
                  required
                />
              </div>

              <div className="form-group">
                <label>Salary Range</label>
                <input
                  type="text"
                  value={formData.salary}
                  onChange={(e) => handleChange(e, 'salary')}
                  placeholder="e.g., $80,000 - $120,000"
                  required
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Required Skills (comma-separated)</label>
              <input
                type="text"
                value={formData.skills.join(', ')}
                onChange={(e) => handleChange(e, 'skills')}
                placeholder="e.g., React, Node.js, TypeScript"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Requirements (comma-separated)</label>
              <input
                type="text"
                value={formData.requirements.join(', ')}
                onChange={(e) => handleChange(e, 'requirements')}
                placeholder="e.g., Bachelor's degree, 3+ years experience"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Job Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange(e, 'description')}
                placeholder="Detailed job description..."
                rows={6}
                required
              />
            </div>

            <div className="button-group">
              <button type="button" onClick={() => navigate(`/dashboard/${id}`)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Create Job Post
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default JobForm;
