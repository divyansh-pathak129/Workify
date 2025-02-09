import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Report from './pages/Report'
import ApplicationForm from './pages/application'
import JobForm from './pages/CreateJob'
import Forum from './pages/Forum'

function App() {
  return (
    <Routes>
      <Route path="/report/:id/:jobId" element={<Report />} />
      <Route path="/createjob/:id" element={<JobForm />} />
      <Route path="/" element={<Login />} />
      <Route path="/application/:jobId" element={<ApplicationForm />} />
      <Route path="/forum/" element={<Forum />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard/:id" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
