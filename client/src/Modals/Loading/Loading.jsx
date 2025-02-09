import React from 'react';
import './Loading.scss';

const Loading = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <p>Evaluating applications...</p>
      </div>
    </div>
  );
};

export default Loading;