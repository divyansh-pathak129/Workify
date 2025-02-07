import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      if (response.ok) {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="login-page">
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
  )
}

export default Login
