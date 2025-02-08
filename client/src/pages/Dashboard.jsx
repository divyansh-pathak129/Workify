import React, { useEffect, useState } from 'react';
import { Link, useParams} from 'react-router-dom';
import './Dashboard.scss'
import { io } from 'socket.io-client';

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
    setUserData(content.content)  
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
          <h1>Welcome Back, {userData.name}</h1>
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
