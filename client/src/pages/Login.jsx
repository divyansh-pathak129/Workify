import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {io} from 'socket.io-client'
import './Login.scss'

const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    socket.emit("login", credentials)
  }
 
  socket.on("loginCreds", async (content) => {
    // console.log(content);
    navigate(`/dashboard/${content.content._id}`)
  })

  return (
    <div className="login-page">
      <div className="login-content">
        <header className="product-header">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g clip-path="url(#clip0_231_793)">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M50 0H200V50V150L150 200L150 50H0L50 0ZM0 165.067V100L65.067 100L0 165.067ZM100 200H35.7777L100 135.778L100 200Z" 
      fill="url(#paint0_linear_231_793)"/>
  </g>
  <defs>
    <linearGradient id="paint0_linear_231_793" x1="177" y1="-9.23648e-06" x2="39.5" y2="152.5" gradientUnits="userSpaceOnUse">
      <stop stop-color="#5ef7cd"/>
      <stop offset="1" stop-color="#00d0a3"/>
    </linearGradient>
    <clipPath id="clip0_231_793">
      <rect width="200" height="200" fill="white"/>
    </clipPath>
  </defs>
</svg>
          <h1 className="product-title">WORKIFY</h1>
        </header>
        <div className="login-container">
          <div className="login-box">
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Username"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              />
              <input
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
              <button type="submit">Sign In</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
