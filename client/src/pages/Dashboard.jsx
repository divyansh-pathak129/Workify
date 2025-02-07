import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Welcome to Workify</h1>
      </header>
      <div className="section-content">
        <p className="section-intro">Manage your postings and keep track of your job listings below:</p>
        <div className="cards-section">
          <div className="dashboard-options">
            <div className="option-card">
              <h2>Post New Job</h2>
              <p>Create a new job posting</p>
              <Link to="/post-job" className="dashboard-btn">Create Post</Link>
            </div>
            <div className="option-card">
              <h2>My Job Posts</h2>
              <p>View and manage your job postings</p>
              <Link to="/my-posts" className="dashboard-btn">View Posts</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
