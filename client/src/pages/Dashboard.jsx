import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation, useNavigate} from 'react-router-dom';
import './Dashboard.scss';
import { io } from 'socket.io-client';
import {Toaster, toast} from 'react-hot-toast';
import Loading from '../Modals/Loading/Loading';


const poppinsFont = document.createElement('link');
poppinsFont.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap';
poppinsFont.rel = 'stylesheet';
document.head.appendChild(poppinsFont);

const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});


function Dashboard() {
  const [tempTheme, setTempTheme] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [userData, setUserData] = useState({});
  const [jobsData, setJobsData] = useState([]);
  const { id } = useParams();
  const [reportDataSide, setReportDataSide] = useState({});
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const [loadingModal, setLoadingModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  socket.on("reportData", (content) => {
    console.log(content);
    setReportDataSide(content);
    localStorage.setItem("reportData", JSON.stringify(content));
    navigate(`/report/${id}/${content.jobId}`);
  })


  useEffect(() => {
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

  useEffect(() => {
    socket.emit("fetchUserData", id)
  },[])

  socket.on("userData", (content) => {
    setUserData(content.content)
    socket.emit("jobsFetch", content.content.jobs)
  })

  socket.on("jobsData", async(data) => {
    console.log(data)
    setJobsData(data.content)
  })

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
    toast(
      'Evaluating job...',
     );
    setLoadingModal(true);
    // navigate(`/report/${id}/${jobId}`);
    // console.log('Evaluating job:', jobId);
  };

  const handleLogout = () => {
    navigate('/');
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

  const handleNavClick = (path) => {
    navigate(path);
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

  const handleCreateJobPost = () => {
    // Ensure we have the user ID before navigating
    if (id) {
      navigate(`/createjob/${id}`);
    } else {
      toast.error('Session error. Please try logging in again.');
    }
  };

  const handleShare = (jobId) => {
    const applicationLink = `${window.location.origin}/application/${jobId}`;
    navigator.clipboard.writeText(applicationLink);
    toast('Application link copied to clipboard!', {
      style: getToastSuccessStyle(),
    });
  };

  const handleRowClick = (jobId) => {
    setExpandedRow(expandedRow === jobId ? null : jobId);
  };

  const handleDeleteJob = (jobId, e) => {
    e.stopPropagation(); // Prevent row from toggling
    if (window.confirm('Are you sure you want to delete this job post?')) {
      // Remove job from local state only
      setJobsData(prevJobs => prevJobs.filter(job => job._id !== jobId));
      setExpandedRow(null); // Close expanded row
      toast.success('Job post removed from view');
    }
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
          <div 
            className={`nav-card ${isActivePath(`/dashboard/${id}`) ? 'active' : ''}`}
            onClick={() => handleNavClick(`/dashboard/${id}`)}
          >
            <Link to={`/dashboard/${id}`}>Home</Link>
          </div>
          <div 
            className="nav-card" 
            onClick={handleSettingsClick}
          >
            <a href="#">Settings</a>
          </div>
          <div 
            className="nav-card job-posts-btn"
            onClick={() => handleNavClick(`/createjob/${id}`)}
          >
            <Link>Create Job Post</Link>
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
                    onClick={handleLogout}
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
            <h1>Welcome Back, {userData.name}</h1>
          </div>
          <div className='dashboard-content-header-right'>
            <button 
              className="new-post-btn" 
              onClick={handleCreateJobPost}
            >
              Create Job Post
            </button>
          </div>
        </div>
        <div className='dashboard-content-body'>
          <div className="card">
            <div className="table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Sr No.</th>
                    {getHeaders().map(header => (
                      <th key={header}>
                        {header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1')}
                      </th>
                    ))}
                    <th>Actions</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {jobsData.map((job, index) => {
                    console.log(job);
                    return(
                      <React.Fragment key={job._id || index}>
                        <tr 
                          className="expandable"
                          onClick={() => handleRowClick(job._id)}
                        >
                          <td>{index + 1}</td>
                          {getHeaders().map(header => (
                            <td key={header}>{formatValue(job[header], header)}</td>
                          ))}
                          <td>
                            <button 
                              className="evaluate-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEvaluate(job._id);
                              }}
                            >
                              Evaluate
                            </button>
                          </td>
                          <td>
                            <button 
                              className="share-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(job._id);
                              }}
                              title="Copy application link"
                            >
                              <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                              >
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                        {expandedRow === job._id && (
                          <tr className="expanded-content">
                            <td colSpan={getHeaders().length + 3}>
                              <div className="expanded-details">
                                <div className="details-grid">
                                  <div className="detail-item">
                                    <h4>Description</h4>
                                    <p style={{whiteSpace: 'pre-wrap'}}>{job.jobDescription || 'No description available'}</p>
                                  </div>
                                  <div className="detail-item">
                                    <h4>Requirements</h4>
                                    <p>{Array.isArray(job.requirements) ? job.requirements.join(', ') : job.requirements || 'None specified'}</p>
                                  </div>
                                  <div className="detail-item">
                                    <h4>Job Location</h4>
                                    <p>{job.jobLocation || 'Not specified'}</p>
                                  </div>
                                  <div className="detail-item">
                                    <h4>Company Values</h4>
                                    <p>{Array.isArray(job.companyValues) ? job.companyValues.join(', ') : job.companyValues || 'None specified'}</p>
                                  </div>
                                </div>
                                <button 
                                  className="remove-btn"
                                  onClick={(e) => handleDeleteJob(job._id, e)}
                                >
                                  Remove Job Post
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
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
              background: 'rgba(255, 86, 86, 0.1)',
              border: '1px solid rgba(255, 86, 86, 0.4)',
              color: '#ff5b5b',
            },
          },
        }}
      />
      {loadingModal && <Loading />}
    </div>
  );
}

export default Dashboard;
