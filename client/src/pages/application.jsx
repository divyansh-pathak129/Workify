import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './application.scss';
import { toast, Toaster } from 'react-hot-toast';

const ApplicationForm = () => {
  const { jobId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    qualifications: '',
    experience: '',
    achievements: '',
    certifications: '',
    resume: null,
    note: '',
    keywords: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    try {
      // Here you would normally send the data to your backend
      // const response = await axios.post('/api/applications', formData);
      toast.success('Application submitted successfully!');
      
      // Clear form after successful submission
      setFormData({
        name: '',
        qualifications: '',
        experience: '',
        achievements: '',
        certifications: '',
        resume: null,
        note: '',
        keywords: ''
      });
      setFileName('');
    } catch (error) {
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
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Qualifications</label>
            <textarea
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Previous Roles / Experience</label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Achievements</label>
            <textarea
              name="achievements"
              value={formData.achievements}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Certifications</label>
            <textarea
              name="certifications"
              value={formData.certifications}
              onChange={handleChange}
            />
          </div>

          <div className="form-group file-upload">
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
          </div>

          <div className="form-group">
            <label>Note to the Employer</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Add a personal note to your application..."
            />
          </div>

          <div className="form-group">
            <label>Keywords</label>
            <input
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              placeholder="Separate keywords with commas"
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
