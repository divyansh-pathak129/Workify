import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Report from './pages/Report'

function App() {
  return (
    <Routes>
      <Route path="/report/:id/:jobId" element={<Report />} />
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard/:id" element={<Dashboard />} />
    </Routes>
  )
}

export default App
