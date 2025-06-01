import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import HomePage from './HomePage';
import TemplateSelect from './TemplateSelect';
import EnterTranscript from './EnterTranscript';
import VideoOutput from './VideoOutput';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from './Dashboard';
import Navbar from './Navbar'; // ✅ import Navbar

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // ✅ Simulate auth logic (adjust based on your real auth system)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user'));
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(userData);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} user={user} logout={logout} /> {/* ✅ Add Navbar */}
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/templates" component={TemplateSelect} />
        <ProtectedRoute path="/enter-transcript" component={EnterTranscript} />
        <ProtectedRoute path="/video-output" component={VideoOutput} />
      </Switch>
    </Router>
  );
};

export default App;
