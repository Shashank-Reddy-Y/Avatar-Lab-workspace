import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './HomePage';
import TemplateSelect from './TemplateSelect';
import EnterTranscript from './EnterTranscript';
import VideoOutput from './VideoOutput';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import ProtectedRoute from './ProtectedRoute'; // ✅ import the new component

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />

        {/* ✅ Now these are protected */}
        <ProtectedRoute path="/templates" component={TemplateSelect} />
        <ProtectedRoute path="/enter-transcript" component={EnterTranscript} />
        <ProtectedRoute path="/video-output" component={VideoOutput} />
      </Switch>
    </Router>
  );
};

export default App;
