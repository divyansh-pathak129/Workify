import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation, useNavigate} from 'react-router-dom';
import './Dashboard.scss';
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


function Dashboard() {
  // Add tempTheme state to track unsaved changes
  const [tempTheme, setTempTheme] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [userData, setUserData] = useState({});
  const [jobsData, setJobsData] = useState([]);
  const { id } = useParams();
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  // Add theme effect
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
    console.log(content)
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
    navigate(`/report/${id}/${jobId}`);
    // console.log('Evaluating job:', jobId);
    // Add your evaluation logic here
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className='dashboard-sidebar-top'>
          <h2 className="highlight">Workify</h2>
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
            onClick={() => handleNavClick("/job-posts")}
          >
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
            <button className="new-post-btn" onClick={() => toast("Coming Soon!")}>Create Job Post</button>
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
                    <th></th> {/* Empty header for evaluate button column */}
                  </tr>
                </thead>
                <tbody>
                  {jobsData.map((job, index) => (
                    <tr key={job.id || index}>
                      <td>{index + 1}</td>
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
              background: 'rgba(255, 86, 86, 0.1)',
              border: '1px solid rgba(255, 86, 86, 0.4)',
              color: '#ff5b5b',
            },
          },
        }}
      />
    </div>
  );
}

export default Dashboard;
