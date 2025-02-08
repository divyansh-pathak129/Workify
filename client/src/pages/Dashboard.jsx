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

  const { id } = useParams();

  useEffect(() => {
    socket.emit("fetchUserData", id)
  },[])

  socket.on("userData", (content) => {
    console.log(content)
    setUserData(content.content)  
  })


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
            {/* Your dashboard content will go here */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
