import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {io} from 'socket.io-client'

const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    socket.emit("login", credentials, (response) => {
       if (response.status === "ok") {
         navigate('/dashboard')
       } else {
         alert(response.message)
       }
     })
  }
 
  socket.on("loginCreds", async (content) => {
    console.log(content);
  })

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
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
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default Login
