import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './application.scss';
import { toast, Toaster } from 'react-hot-toast';
import demoData from '../assets/applicationDemoData.json';
import { saveSubmission } from '../utils/fileOperations';
import { io } from 'socket.io-client';


const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});



const ApplicationForm = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    general: {
      name: '',
      email: '',
      phone: ''
    },
    education: {
      school: '',
      degree: '',
      field: '',
      year: ''
    },
    experience: [{
      company: '',
      position: '',
      year: ''
    }],
    skills: [],
    notes: '',
    achievements: [],
    links: {
      linkedin: '',
      github: ''
    },
    associatedWords: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');

  // Remove the demo data loading
  // useEffect(() => {
  //   if (process.env.NODE_ENV === 'development') {
  //     setFormData(demoData);
  //   }
  // }, []);

  const handleChange = (e, section, field, index) => {
    const { value } = e.target;
    setFormData(prev => {
      const newData = { ...prev };
      
      if (section === 'experience' && typeof index === 'number') {
        newData[section][index][field] = value;
      } else if (section === 'skills' || section === 'achievements' || section === 'associatedWords') {
        newData[section] = value.split(',').map(item => item.trim());
      } else if (field) {
        newData[section][field] = value;
      } else {
        newData[section] = value;
      }
      
      return newData;
    });
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', position: '', year: '' }]
    }));
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/msword' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFormData(prev => ({
          ...prev,
          resume: file
        }));
        setFileName(file.name);
      } else {
        toast.error('Please upload a PDF or Word document');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    socket.emit("applicationSubmit", formData, jobId);
    console.log('formData:', formData);

    try {
      const submission = {
        jobId, // Using the jobId from URL params
        submittedAt: new Date().toISOString(),
        ...formData
      };

      if (process.env.NODE_ENV === 'development') {
        const saved = await saveSubmission(submission);
        if (!saved) throw new Error('Failed to save submission');
      }

      toast.success('Application submitted successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="application-container">
      <div className="application-form-wrapper">
        <div className="form-header">
          <h1>Job Application</h1>
          <p>Please fill out the form below to apply for this position</p>
        </div>
        <form onSubmit={handleSubmit}>
          {/* General Information */}
          <div className="form-section">
            <h2>General Information</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.general.name}
                onChange={(e) => handleChange(e, 'general', 'name')}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.general.email}
                onChange={(e) => handleChange(e, 'general', 'email')}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.general.phone}
                onChange={(e) => handleChange(e, 'general', 'phone')}
                required
              />
            </div>
          </div>

          {/* Education */}
          <div className="form-section">
            <h2>Education</h2>
            <div className="form-group">
              <label>School/University</label>
              <input
                type="text"
                value={formData.education.school}
                onChange={(e) => handleChange(e, 'education', 'school')}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Degree</label>
                <input
                  type="text"
                  value={formData.education.degree}
                  onChange={(e) => handleChange(e, 'education', 'degree')}
                  required
                />
              </div>
              <div className="form-group">
                <label>Field of Study</label>
                <input
                  type="text"
                  value={formData.education.field}
                  onChange={(e) => handleChange(e, 'education', 'field')}
                  required
                />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input
                  type="number"
                  value={formData.education.year}
                  onChange={(e) => handleChange(e, 'education', 'year')}
                  required
                />
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="form-section">
            <h2>Experience</h2>
            {formData.experience.map((exp, index) => (
              <div key={index} className="experience-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleChange(e, 'experience', 'company', index)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Position</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => handleChange(e, 'experience', 'position', index)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Year</label>
                    <input
                      type="number"
                      value={exp.year}
                      onChange={(e) => handleChange(e, 'experience', 'year', index)}
                      required
                    />
                  </div>
                </div>
                {index > 0 && (
                  <div className="remove-btn-wrapper">
                    <button 
                      type="button" 
                      className="remove-btn" 
                      onClick={() => removeExperience(index)}
                    >
                      Remove Experience
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button type="button" className="add-btn" onClick={addExperience}> 
              Add Experience
            </button>
          </div>

          {/* Skills & Keywords */}
          <div className="form-section">
            <h2>Skills & Keywords</h2>
            <div className="form-group">
              <label>Skills (comma-separated)</label>
              <input
                type="text"
                value={formData.skills.join(', ')}
                onChange={(e) => handleChange(e, 'skills')}
                placeholder="e.g., JavaScript, React, Node.js"
              />
            </div>
            <div className="form-group">
              <label>Associated Keywords (comma-separated)</label>
              <input
                type="text"
                value={formData.associatedWords.join(', ')}
                onChange={(e) => handleChange(e, 'associatedWords')}
                placeholder="e.g., Leadership, Team Player, Problem Solver"
              />
            </div>
          </div>

          {/* Links */}
          <div className="form-section">
            <h2>Professional Links</h2>
            <div className="form-group">
              <label>LinkedIn Profile</label>
              <input
                type="url"
                value={formData.links.linkedin}
                onChange={(e) => handleChange(e, 'links', 'linkedin')}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="form-group">
              <label>GitHub Profile</label>
              <input
                type="url"
                value={formData.links.github}
                onChange={(e) => handleChange(e, 'links', 'github')}
                placeholder="https://github.com/username"
              />
            </div>
          </div>

          {/* Resume Upload */}
          {/* <div className="form-group file-upload">
            <label>Resume</label>
            <div className="upload-btn">
              <input
                type="file"
                id="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
              />
              <label htmlFor="resume">
                {fileName ? fileName : 'Click to upload your resume (PDF or Word)'}
              </label>
            </div>
          </div> */}

          {/* Notes */}
          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange(e, 'notes')}
              placeholder="Add any additional information you'd like to share..."
              rows={4}
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default ApplicationForm;
