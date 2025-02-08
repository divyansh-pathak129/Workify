import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.scss'
import { io } from 'socket.io-client';

const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});


function Dashboard() {

  useEffect(() => {
    socket.emit("fetchUserData", {username: 'admin'})
  })


  return (
   <div className="dashboard-container">
    <div className="dashboard-sidebar">
      <div className='dashboard-sidebar-top'>

      </div>
      <div className='dashboard-sidebar-middle'>

      </div>
      <div className='dashboard-sidebar-bottom'>

      </div>
    </div>
    <div className='dashboard-content'>
      <div className='dashboard-content-header'>
        <div className='dashboard-content-header-left'>
          <h1>Welcome Back</h1>
        </div>
        <div className='dashboard-content-header-right'>

        </div>
      </div>
      <div className='dashboard-content-body'>

      </div>
    </div>
   </div>
  );
}

export default Dashboard;
