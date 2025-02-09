import React from 'react';
import './Loading.scss';

const Loading = () => {
    return (
        <div className="modal-overlay">
            <div className='modal-wrapper'></div>
            <div className="loading-modal">
                <div className="loading-container">
                    <div className="circle-loader"></div>
                    <div className="circle-loader circle-loader-2"></div>
                    <div className="circle-loader circle-loader-3"></div>
                </div>
                <p className="loading-text">Loading<span>.</span><span>.</span><span>.</span></p>
            </div>
        </div>
    );
};

export default Loading;