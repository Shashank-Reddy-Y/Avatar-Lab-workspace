import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import EnterTranscript from './EnterTranscript';
import TemplateSelect from './TemplateSelect';
import VideoOutput from './VideoOutput';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/templates" element={<TemplateSelect />} />
        <Route path="/enter-transcript" element={<EnterTranscript />} />
        <Route path="/video-output" element={<VideoOutput />} />
      </Routes>
    </Router>
  );
};

export default App;
