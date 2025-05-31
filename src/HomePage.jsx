// app/page.jsx (or similar route)
"use client"; // ** REQUIRED for hooks like useState, useEffect, useRef **

import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import './HomePage.css'; // Adjust path if needed, or move styles to globals.css

// Custom Hook: Intersection Observer animation trigger
const useScrollAnimate = (ref, options = { threshold: 0.1, triggerOnce: true }) => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (options.triggerOnce) obs.unobserve(element);
        } else {
          if (!options.triggerOnce) setIsInView(false);
        }
      },
      { threshold: options.threshold }
    );

    observer.observe(element);
    return () => {
      if (element) {
         observer.unobserve(element);
      }
      observer.disconnect();
    };
  }, [ref, options.threshold, options.triggerOnce]);

  return isInView;
};

// Page component
export default function HomePage() {
  const history = useHistory();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const logoutTimerRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    const savedTheme = localStorage.getItem('theme');
    setIsLightMode(savedTheme === 'light');
  }, []);

  useEffect(() => {
    if (isClient) {
        localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
    }
  }, [isLightMode, isClient]);

     // Decode JWT payload safely
  const decodeJWT = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    setIsAuthenticated(false);
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };



   useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      logout();
      return;
    }

    const payload = decodeJWT(token);
    if (!payload || !payload.exp) {
      logout();
      return;
    }

    const expiryTimeMs = payload.exp * 1000;
    const now = Date.now();

    if (expiryTimeMs <= now) {
      logout();
      return;
    }

    // Set auto logout timer
    const timeUntilExpiry = expiryTimeMs - now;
    logoutTimerRef.current = setTimeout(() => {
      logout();
      alert("Session expired. Please log in again.");
      history.push("/login");
    }, timeUntilExpiry);

    // Validate token with backend
    fetch("http://localhost:5000/api/validate-token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          logout();
        }
      })
      .catch(() => {
        logout();
      });

    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    };
  }, [history]);



  const handleTryItNow = () => {
    if (isAuthenticated) {
      history.push("/templates/select");
    } else {
      history.push("/login");
    }
  };


  const toggleTheme = () => {
    setIsLightMode(prev => !prev);
  };

  const heroRef = useRef(null);
  const howItWorksRef = useRef(null);
  const templatesRef = useRef(null);
  const footerRef = useRef(null);
  const timelineRef = useRef(null);
  const heroVisualRef = useRef(null); // Ref for the container div

  const heroInView = useScrollAnimate(heroRef);
  const howItWorksInView = useScrollAnimate(howItWorksRef);
  const templatesInView = useScrollAnimate(templatesRef);
  const footerInView = useScrollAnimate(footerRef);
  const timelineInView = useScrollAnimate(timelineRef);
  // We still observe the container for its animation
  const heroVisualInView = useScrollAnimate(heroVisualRef); // Corrected this line from your previous code


  if (!isClient) {
    // Optional: Render null or loading state to prevent hydration mismatch
    // return null;
  }

  return (
    <div className={`homepage ${isLightMode ? 'light' : 'dark'}`}> {/* Corrected */}
      <div className="background-animation-container"></div> {/* Ensure this is uncommented if you want the animated gradient background */}

      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      >
        {isLightMode ? '🌙' : '☀️'}
      </button>

      <header ref={heroRef} className={`hero ${heroInView ? 'in-view' : ''}`}> {/* Corrected */}
        <div className="hero-content">
          <h1 className="hero-title">
            <span>T</span><span>a</span><span>l</span><span>k</span><span>H</span><span>e</span><span>a</span><span>d</span> <span>A</span><span>I</span>
          </h1>
          <p className="hero-subtitle">
            Create realistic talking head videos using just an image, audio, and your script.
          </p>
          <button className="cta-button" onClick={handleTryItNow}>
          <span>Try It Now ✨</span>
        </button>
        </div>
        <div ref={heroVisualRef} className={`hero-visual ${heroVisualInView ? 'in-view' : ''}`}> {/* Corrected (and used heroVisualInView) */}
          <img
            src="/QVko.gif"
            alt="Animated realistic face illustration"
            className="hero-visual-gif"
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/350x350/7e7e9a/ffffff?text=GIF+Load+Error'; }}
          />
        </div>
      </header>

      <section ref={howItWorksRef} className={`how-it-works ${howItWorksInView ? 'in-view' : ''}`}>
        <h2 className="section-title">How It Works</h2>
        <div ref={timelineRef} className={`steps-timeline ${timelineInView ? 'is-visible' : ''}`}>
          {[1, 2, 3].map(num => (
            <div key={num} className="step-item">
              <div className="step-number">{num}</div>
              <div className="step-content">
                <h3>{num === 1 ? 'Choose a Face' : num === 2 ? 'Pick a Voice' : 'Enter Text'}</h3>
                <p>{num === 1 ? 'Select from our image templates...' : num === 2 ? 'Choose a matching voice...' : 'Write the script you\'d like...'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section ref={templatesRef} className={`templates-preview ${templatesInView ? 'in-view' : ''}`}> {/* Corrected */}
        <h2 className="section-title">Templates Preview</h2>
        <div className="template-gallery">
          {[
                { type: 'img', src: 'https://images.pexels.com/photos/6150527/pexels-photo-6150527.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', alt: 'Person A template', label: 'Person A' },
            { type: 'img', src: 'https://images.pexels.com/photos/1015568/pexels-photo-1015568.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', alt: 'Person B template', label: 'Person B' },
            { type: 'audio', src: 'demo1_audio.wav', label: 'Voice A' },
            { type: 'audio', src: 'demo2_audio.wav', label: 'Voice B' },
          ].map((template, index) => (
            <div key={index} className="template animated-item"> {/* This one was already correct */}
              <div className={`template-media ${template.type === 'audio' ? 'audio-template' : ''}`}> {/* Corrected */}
                {template.type === 'img' ? (
                  <img src={template.src} alt={template.alt} loading="lazy" />
                ) : (
                  <audio controls>
                    <source src={template.src} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
              <div className="template-info">
                <p>{template.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      

      <footer ref={footerRef} className={`footer ${footerInView ? 'in-view' : ''}`}> {/* Corrected */}
        <p>© {new Date().getFullYear()} TalkHead AI • Crafted with Precision</p>
         <a href="/privacy">Privacy</a> • <a href="/terms">Terms</a>
      </footer>
    </div>
  );
}