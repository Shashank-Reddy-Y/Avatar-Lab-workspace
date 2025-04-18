import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './VideoOutput.css';

const VideoOutput = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { videoTemplate, audioTemplate, transcript } = location.state || {};

  if (!videoTemplate || !audioTemplate || !transcript) {
    // Redirect back if any data is missing
    navigate('/template-select');
    return null;
  }

  return (
    <div className="video-output-page">
      <h2>🎉 Your Talking Head Video Is Ready!</h2>

      <div className="output-container">
        <div className="template-preview">
          <img src={videoTemplate.imageUrl} alt={videoTemplate.name} />
          <audio controls>
            <source src={audioTemplate.audioUrl} type="audio/wav" />
          </audio>
          <p><strong>{videoTemplate.name}</strong></p>
        </div>

        <div className="transcript-block">
          <h3>📝 Transcript</h3>
          <p>{transcript}</p>
        </div>

        <div className="video-block">
          <h3>📹 Generated Video</h3>
          {/* Replace with your actual generated video URL if you have */}
          <video width="480" height="280" controls>
            <source src="/video/generated-demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      <button className="restart-btn" onClick={() => navigate('/templates')}>
        Generate Another Video
      </button>
    </div>
  );
};

export default VideoOutput;
