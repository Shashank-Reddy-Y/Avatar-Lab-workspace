import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { Brain, User, LogOut, Video, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const Navbar = ({ isAuthenticated, user, logout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const navbarRef = useRef(null);
  const profileButtonRef = useRef(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Close profile popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setShowProfilePopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for profile popup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showProfilePopup) {
        setShowProfilePopup(false);
        profileButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showProfilePopup]);

  const handleLogout = () => {
    logout();
    history.push('/');
  };

  const handleHomeClick = (e) => {
    if (isAuthenticated && location.pathname !== '/dashboard') {
      e.preventDefault();
      history.push('/dashboard');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const toggleProfilePopup = () => {
    if (window.innerWidth < 768) {
      setIsMenuOpen(!isMenuOpen);
    } else {
      setShowProfilePopup(!showProfilePopup);
    }
  };

  const navVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", damping: 10, stiffness: 100 }
    }
  };

  const linkVariants = {
    hover: { y: -2, transition: { type: "spring", stiffness: 400, damping: 10 } },
    tap: { y: 0 }
  };

  return (
    <>
      <motion.nav
        ref={navbarRef}
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        initial="hidden"
        animate="visible"
        variants={navVariants}
        aria-label="Main navigation"
      >
        <div className="navbar-container">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link 
              to="/" 
              className="navbar-brand" 
              onClick={handleHomeClick}
              aria-label="TalkHead AI Home"
            >
              <motion.div
                animate={{
                  rotate: isHoveringAvatar ? [0, 10, -10, 0] : 0,
                  scale: isHoveringAvatar ? 1.1 : 1
                }}
                transition={{ duration: 0.5 }}
              >
                <Brain className="navbar-logo" size={24} aria-hidden="true" />
              </motion.div>
              <motion.span
                animate={{ x: isHoveringAvatar ? [0, 2, -2, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                🎤 TalkHead AI
              </motion.span>
            </Link>
          </motion.div>

          <div className="navbar-menu">
            <ul className="navbar-links" role="menubar">
              <motion.li
                className={`navbar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                whileHover="hover"
                whileTap="tap"
                variants={linkVariants}
                role="none"
              >
                <Link 
                  to="/dashboard" 
                  onClick={handleHomeClick}
                  role="menuitem"
                  aria-current={location.pathname === '/dashboard' ? 'page' : undefined}
                >
                  Home
                </Link>
              </motion.li>
              <motion.li
                className={`navbar-link ${location.pathname === '/templates' ? 'active' : ''}`}
                whileHover="hover"
                whileTap="tap"
                variants={linkVariants}
                role="none"
              >
                <Link 
                  to="/templates"
                  role="menuitem"
                  aria-current={location.pathname === '/templates' ? 'page' : undefined}
                >
                  Create Avatar
                </Link>
              </motion.li>
            </ul>
          </div>

          <div className="navbar-right-section">
            {isAuthenticated && (
              <motion.div
                className="user-profile"
                onClick={toggleProfilePopup}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleProfilePopup();
                  }
                }}
                onHoverStart={() => setIsHoveringAvatar(true)}
                onHoverEnd={() => setIsHoveringAvatar(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                tabIndex="0"
                ref={profileButtonRef}
                aria-haspopup="true"
                aria-expanded={showProfilePopup || isMenuOpen}
                aria-label="User profile menu"
              >
                <motion.div
                  className="user-avatar"
                  animate={{
                    rotate: isHoveringAvatar ? [0, 5, -5, 0] : 0,
                    boxShadow: isHoveringAvatar ?
                      '0 5px 15px rgba(var(--dark-glow-color-1-rgb), 0.4)' :
                      '0 2px 10px rgba(var(--dark-glow-color-1-rgb), 0.2)'
                  }}
                  transition={{ duration: 0.3 }}
                  aria-hidden="true"
                >
                  {getInitials(user?.username)}
                </motion.div>
                <motion.div
                  animate={{ x: isHoveringAvatar ? [0, 2, -2, 0] : 0 }}
                  transition={{ duration: 0.5 }}
                  aria-hidden="true"
                >
                  <ChevronDown size={16} className={`dropdown-icon ${showProfilePopup ? 'rotate' : ''}`} />
                </motion.div>
              </motion.div>
            )}

            <AnimatePresence>
              {showProfilePopup && window.innerWidth >= 768 && (
                <motion.div
                  className="profile-popup"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  role="menu"
                >
                  <div className="profile-popup-content">
                    <div className="profile-header">
                      <motion.div
                        className="user-avatar large"
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5 }}
                        aria-hidden="true"
                      >
                        {getInitials(user?.username)}
                      </motion.div>
                      <div>
                        <div className="user-name">{user?.username || 'User'}</div>
                        <div className="user-email">{user?.email || ''}</div>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleLogout}
                      className="btn-nav btn-nav-secondary"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      role="menuitem"
                    >
                      <LogOut size={16} className="mobile-link-icon" aria-hidden="true" />
                      Logout
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -20, scaleY: 0.9 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -20, scaleY: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            role="menu"
          >
            <div className="mobile-menu-content">
              <ul className="mobile-links">
                <motion.li 
                  className="mobile-link" 
                  initial={{ x: -20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }}
                  role="none"
                >
                  <Link 
                    to="/dashboard"
                    role="menuitem"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={16} className="mobile-link-icon" aria-hidden="true" />
                    Home
                  </Link>
                </motion.li>
                <motion.li 
                  className="mobile-link" 
                  initial={{ x: -20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }}
                  role="none"
                >
                  <Link 
                    to="/template/select"
                    role="menuitem"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Video size={16} className="mobile-link-icon" aria-hidden="true" />
                    Create Avatar
                  </Link>
                </motion.li>
              </ul>
              {isAuthenticated && (
                <motion.div 
                  className="mobile-actions" 
                  initial={{ y: 20, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }}
                >
                  <div className="user-profile mobile-user-profile">
                    <motion.div 
                      className="user-avatar" 
                      whileHover={{ rotate: 360 }} 
                      transition={{ duration: 0.5 }}
                      aria-hidden="true"
                    >
                      {getInitials(user?.username)}
                    </motion.div>
                    <div>
                      <div className="user-name">{user?.username || 'User'}</div>
                      <div className="user-email">{user?.email || ''}</div>
                    </div>
                  </div>
                  <motion.button 
                    onClick={handleLogout} 
                    className="btn-nav btn-nav-secondary" 
                    whileHover={{ scale: 1.03 }} 
                    whileTap={{ scale: 0.98 }}
                    role="menuitem"
                  >
                    <LogOut size={16} className="mobile-link-icon" aria-hidden="true" />
                    Logout
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;