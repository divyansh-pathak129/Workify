import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import './Forum.scss';
import { io } from 'socket.io-client';
import {Toaster, toast} from 'react-hot-toast';
import demoData from '../assets/forumDemoData.json';

const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

function Forum() {
  const [userData, setUserData] = useState({});
  const [jobsData, setJobsData] = useState([]);
  const { id } = useParams();
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempTheme, setTempTheme] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("fetchUserData", id);
    socket.emit("jobsFetchAll");
    setJobsData(demoData.content);
  }, [id]);

  // Handle user data
  socket.on("userData", (content) => {
    setUserData(content.content);
  });

  // Handle applications data with fallback to demo data
  socket.on("jobsData", (data) => {
    console.log(data.content);
    console.log(demoData.content);
    // if (data.content && data.content.length > 0) {
      setJobsData(data.content);
    // } else {
    //   setJobsData(demoData.content);
    // }
  });

//   useEffect(() => {
//     console.log(jobsData);
//   },[jobsData])

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(salary);
  };

  const formatDate = (dateValue) => {
    let timestamp;
    if (typeof dateValue === 'object' && dateValue.$date) {
      // Handle MongoDB $date format
      timestamp = parseInt(dateValue.$date.$numberLong);
    } else {
      // Handle regular date string
      timestamp = new Date(dateValue).getTime();
    }
    
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApply = (jobId) => {
    const string = JSON.stringify(jobId._id)
    navigate(`/application/${jobId._id}`);
  };

  const handleJobRequirements = (requirements) => {
    if (!requirements) return ['No requirements specified'];
    if (Array.isArray(requirements)) return requirements;
    return ['No requirements specified'];
  };

  const handleCompanyValues = (values) => {
    if (!values) return ['Not specified'];
    if (Array.isArray(values)) return values;
    if (typeof values === 'string') return [values];
    return ['Not specified'];
  };

  return (
    <div className="dashboard-container">
      <div className='dashboard-content'>
        <div className='dashboard-content-header'>
          <div className='dashboard-content-header-left'>
            <h1>Job Opportunities</h1>
          </div>
        </div>
        <div className='dashboard-content-body'>
          <div className="jobs-grid">
            {jobsData?.map((job) => (
              <div key={job._id} className="job-card">
                <div className="job-header">
                  <div className="job-title-section">
                    <h3>{job.jobPositon || 'Position Not Specified'}</h3>
                    <span className="location-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {job.jobLocation || 'Location Not Specified'}
                    </span>
                  </div>
                  <div className="job-meta">
                    <span className="salary">{formatSalary(job.salary)}/year</span>
                    <span className="date">Posted {formatDate(job.dateOfCreation)}</span>
                  </div>
                </div>
                
                <div className="job-content">
                  {job.jobDescription && (
                    <div className="description-section">
                      <h4>Description</h4>
                      <p>{job.jobDescription}</p>
                    </div>
                  )}

                  <div className="requirements-section">
                    <h4>Requirements</h4>
                    <ul>
                      {handleJobRequirements(job.jobRequirements).map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="values-section">
                    <h4>Company Values</h4>
                    <div className="values-container">
                      {handleCompanyValues(job.companyValues).map((value, index) => (
                        <span key={index} className="value-badge">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="job-footer">
                    <span className="applications-count">
                      {Array.isArray(job.applications) ? job.applications.length : 0} applications
                    </span>
                    <button 
                      className="apply-btn"
                      onClick={() => handleApply(job)}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* ... existing settings modal and toaster code ... */}
    </div>
  );
}

export default Forum;