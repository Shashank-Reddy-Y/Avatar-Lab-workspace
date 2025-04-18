import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './EnterTranscript.css';

const EnterTranscript = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { videoTemplate, audioTemplate } = location.state || {};
  const [transcript, setTranscript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!videoTemplate || !audioTemplate) {
      navigate('/templates');
    }
  }, [videoTemplate, audioTemplate, navigate]);

  
  

  const handleGenerate = () => {
    if (!transcript.trim()) {
      alert('Please enter a transcript!');
      return;
    }

    setIsGenerating(true);

    // Simulate processing delay, then route to final page
    setTimeout(() => {
      navigate('/video-output', {
        state: {
          videoTemplate,
          audioTemplate,
          transcript,
        },
      });
    }, 3000);
  };

  return (
    <div className="transcript-page">
      <h2>Enter Your Transcript</h2>

      <div className="template-preview">
        <img src={videoTemplate?.imageUrl} alt={videoTemplate?.name} />
        <p><strong>{videoTemplate?.name}</strong></p>
        <audio controls>
                <source src={audioTemplate.audioUrl} type="audio/wav" />
                Your browser does not support the audio element.
        </audio>
       
      </div>

      <textarea
        placeholder="Type your transcript here..."
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
      />

      <button className="generate-btn" onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Talking Head Video'}
      </button>

      {isGenerating && <div className="loader">⏳ Processing your video...</div>}
    </div>
  );
};

export default EnterTranscript;
