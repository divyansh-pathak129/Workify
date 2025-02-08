import React, { useEffect, useState } from 'react';
import { Link, useParams} from 'react-router-dom';
import './Dashboard.scss';
import { io } from 'socket.io-client';

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

  const [userData, setUserData] = useState({});
  const [jobsData, setJobsData] = useState([]);
  const { id } = useParams();

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
    console.log('Evaluating job:', jobId);
    // Add your evaluation logic here
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className='dashboard-sidebar-top'>
          <h2 className="highlight">Workify</h2>
        </div>
        <div className='dashboard-sidebar-middle'>
          {/* Navigation items will go here */}
        </div>
        <div className='dashboard-sidebar-bottom'>
          {/* User profile/logout will go here */}
        </div>
      </div>
      <div className='dashboard-content'>
        <div className='dashboard-content-header'>
          <div className='dashboard-content-header-left'>
            <h1>Welcome Back, {userData.name}</h1>
          </div>
          <div className='dashboard-content-header-right'>
            {/* Add your header actions here */}
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
    </div>
  );
}

export default Dashboard;
