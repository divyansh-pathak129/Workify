import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import './Report.scss';
import { io } from 'socket.io-client';
import {Toaster, toast} from 'react-hot-toast';

// Add Poppins font import
const poppinsFont = document.createElement('link');
poppinsFont.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap';
poppinsFont.rel = 'stylesheet';
document.head.appendChild(poppinsFont);

const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});


function Report() {

  const [userData, setUserData] = useState({});
  const [jobsData, setJobsData] = useState([]);
  const [reportData, setReportData] = useState({});
  const { id } = useParams();
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempTheme, setTempTheme] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  socket.on("report", (content) => {
    setReportData(content);
    console.log("This is the main content for the report: ", JSON.parse(content), content);
  })

  useEffect(() => {
    socket.emit("fetchUserData", id)
  },[])

  socket.on("userData", (content) => {
    console.log(content)
    setUserData(content.content)
    socket.emit("jobsFetch", content.content.jobs)
  })

  socket.on("jobsData", async(data) => {
    // console.log(data)
    setJobsData(data.content)
  })

  useEffect(() => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setIsDarkTheme(savedTheme === 'dark');
    setTempTheme(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleThemeToggle = () => {
    setTempTheme(!tempTheme);
  };

  const handleSaveSettings = () => {
    setIsDarkTheme(tempTheme);
    localStorage.setItem('theme', tempTheme ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', tempTheme ? 'dark' : 'light');
    setIsSettingsOpen(false);
    toast.success('Theme settings saved!');
  };

  const formatValue = (value, field) => {
    if (field === 'dateOfCreation') {
      return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    if (field === 'applications') {
      if (!Array.isArray(value)) return '0';
      const uniqueApps = new Set(value);
      return uniqueApps.size.toString();
    }
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (value === undefined || value === null) return '-';
    return value;
  };

  const getHeaders = () => {
    if (jobsData.length === 0) return [];
    const exclude = ['id', '_id', 'parentUserId']; // added parentUserId to exclude list
    return Object.keys(jobsData[0]).filter(key => !exclude.includes(key));
  };

  const handleEvaluate = (jobId) => {
    socket.emit("evaluateJob", jobId)
    navigate("/report")
    // console.log('Evaluating job:', jobId);
    // Add your evaluation logic here
  };

  const handleLogout = () => {
    // Add logout logic here
    console.log('Logging out...');
  };

  const handleProfileClick = () => {
    if (isProfileExpanded) {
      setIsClosing(true);
      setTimeout(() => {
        setIsProfileExpanded(false);
        setIsClosing(false);
      }, 300);
    } else {
      setIsProfileExpanded(true);
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path || 
           (path === `/dashboard/${id}` && location.pathname === `/dashboard/${id}`);
  };

  const handleSettingsClick = (e) => {
    e.preventDefault();
    setIsSettingsOpen(true);
  };

  const calculateReportMetrics = () => {
    return {
      totalJobs: jobsData.length,
      activeJobs: jobsData.filter(job => job.status === 'active').length,
      totalApplications: jobsData.reduce((acc, job) => acc + (job.applications?.length || 0), 0),
      averageApplications: (jobsData.reduce((acc, job) => acc + (job.applications?.length || 0), 0) / jobsData.length || 0).toFixed(2)
    };
  };

  const getToastStyle = () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return isLight ? {
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)',
      backdropFilter: 'blur(8px)',
    } : {
      background: 'rgba(20, 20, 28, 0.95)',
      color: 'var(--caribbean-green-100)',
      border: '1px solid var(--caribbean-green-900)',
      backdropFilter: 'blur(8px)',
    };
  };

  const getToastSuccessStyle = () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return isLight ? {
      background: 'rgba(0, 208, 163, 0.1)',
      border: '1px solid var(--caribbean-green-300)',
      color: 'var(--caribbean-green-800)',
    } : {
      background: 'rgba(0, 208, 163, 0.15)',
      border: '1px solid var(--caribbean-green-600)',
      color: 'var(--caribbean-green-200)',
    };
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className='dashboard-sidebar-top'>
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
        <div className='dashboard-sidebar-middle'>
          <div className={`nav-card ${isActivePath(`/dashboard/${id}`) ? 'active' : ''}`}>
            <Link to={`/dashboard/${id}`}>Home</Link>
          </div>
          <div className="nav-card" onClick={handleSettingsClick}>
            <a href="#">Settings</a>
          </div>
          <div className="nav-card job-posts-btn">
            <Link to="/job-posts">Create Job Post</Link>
          </div>
        </div>
        <div className='dashboard-sidebar-bottom'>
          <div 
            className={`profile-card ${isProfileExpanded ? 'expanded' : ''}`}
            onClick={handleProfileClick}
          >
            <div className="profile-info">
              <div className="profile-header">
                <div className="profile-avatar">
                  {userData.name ? userData.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h3>{userData.name}</h3>
                  <p>{userData.email || 'user@workify.com'}</p>
                </div>
              </div>
              {isProfileExpanded && (
                <div className={`profile-expanded ${isClosing ? 'hiding' : ''}`}>
                  <div className="profile-detail">
                    <span>Company</span>
                    <strong>Workify Solutions</strong>
                  </div>
                  <div className="profile-detail">
                    <span>Role</span>
                    <strong>Hiring Manager</strong>
                  </div>
                  <button 
                    className="logout-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                    }}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className='dashboard-content'>
        <div className='dashboard-content-header'>
          <div className='dashboard-content-header-left'>
            <h1>Report</h1>
          </div>
          <div className='dashboard-content-header-right'>
            <button className="new-post-btn" onClick={() => toast("Coming Soon!")}>Create Job Post</button>
          </div>
        </div>
        <div className='dashboard-content-body'>
          <div className="report-box">
            <h3 className="report-title">Job Posting Analytics</h3>
            <div className="report-content">
              {Object.entries(calculateReportMetrics()).map(([key, value]) => (
                <div key={key} className="metric">
                  <span className="metric-label">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <span className="metric-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card">
            <div className="table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    {getHeaders().map(header => (
                      <th key={header}>
                        {header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1')}
                      </th>
                    ))}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {jobsData.map((job, index) => (
                    <tr key={job.id || index}>
                      {getHeaders().map(header => (
                        <td key={header}>{formatValue(job[header], header)}</td>
                      ))}
                      <td>
                        <button 
                          className="evaluate-btn"
                          onClick={() => handleEvaluate(job._id)}
                        >
                          Evaluate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {isSettingsOpen && (
        <div className="settings-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="settings-card" onClick={e => e.stopPropagation()}>
            <div className="settings-header">
              <h3>Settings</h3>
              <button className="close-btn" onClick={() => setIsSettingsOpen(false)}>×</button>
            </div>
            <div className="settings-content">
              <div className="setting-item">
                <span>Theme Mode</span>
                <div className="theme-toggle">
                  <input 
                    type="checkbox"
                    id="theme-switch"
                    checked={tempTheme}
                    onChange={handleThemeToggle}
                  />
                  <label htmlFor="theme-switch">
                    <span className="toggle-track"></span>
                    <span className="toggle-label">{tempTheme ? 'Dark' : 'Light'}</span>
                  </label>
                </div>
              </div>
              <button className="settings-save-btn" onClick={handleSaveSettings}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            ...getToastStyle(),
            fontSize: '0.95rem',
            fontFamily: 'Poppins, sans-serif',
            padding: '12px 20px',
          },
          success: {
            style: getToastSuccessStyle(),
            iconTheme: {
              primary: 'var(--caribbean-green-600)',
              secondary: 'var(--bg-card)',
            },
          },
          error: {
            style: {
              background: 'rgba(255, 86, 86, 0.15)',
              border: '1px solid rgba(255, 86, 86, 0.4)',
              color: '#ffa6a6',
            },
          },
        }}
      />
    </div>
  );
}

export default Report;
