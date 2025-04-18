import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TemplateSelect.css';

const templates = [
  {
    id: 'template1',
    name: 'Person A',
    imageUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    audioUrl: '/assets/audio/demo1_audio.wav',
  },
  {
    id: 'template2',
    name: 'Person B',
    imageUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    audioUrl: '/assets/audio/demo1_audio.wav',
  },
  {
    id: 'template3',
    name: 'Person C',
    imageUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    audioUrl: '/assets/audio/demo3_audio.mp3',
  },
  {
    id: 'template4',
    name: 'Person D',
    imageUrl: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    audioUrl: '/assets/audio/demo3_audio.mp3',
  },
  {
    id: 'template5',
    name: 'Person E',
    imageUrl: 'https://images.pexels.com/photos/428339/pexels-photo-428339.jpeg',
    audioUrl: '/assets/audio/demo3_audio.mp3',
  },
  {
    id: 'template6',
    name: 'Person F',
    imageUrl: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg',
    audioUrl: '/assets/audio/demo3_audio.mp3',
  },
  {
    id: 'template7',
    name: 'Person C',
    imageUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    audioUrl: '/assets/audio/demo3_audio.mp3',
  },
  {
    id: 'template8',
    name: 'Person D',
    imageUrl: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    audioUrl: '/assets/audio/demo3_audio.mp3',
  }
];

const TemplateSelect = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const navigate = useNavigate();

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const handleConfirm = () => {
    if (!selectedTemplate) {
      alert('Please select a template before continuing.');
      return;
    }

    navigate('/enter-transcript', {
      state: {
        videoTemplate: selectedTemplate,
        audioTemplate: selectedTemplate,
      },
    });
  };

  return (
    <div className="template-select-page">
      <h2>Select a Talking Head Template</h2>
      <div className="template-grid">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`template-card ${selectedTemplateId === template.id ? 'selected' : ''}`}
            onClick={() => setSelectedTemplateId(template.id)}
          >
            <img src={template.imageUrl} alt={template.name} />
            <div className="template-info">
              <p>{template.name}</p>
              <audio controls>
                <source src={template.audioUrl} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        ))}
      </div>

      <button className="confirm-btn" onClick={handleConfirm}>
        Confirm Selection
      </button>
    </div>
  );
};

export default TemplateSelect;
