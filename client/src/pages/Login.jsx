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
    console.log(content);
    navigate(`/dashboard/${content.content._id}`)
  })

  return (
    <div className="login-page">
      <div className="login-content">
        <header className="product-header">
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
