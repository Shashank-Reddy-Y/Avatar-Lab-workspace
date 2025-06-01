import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Video, Clock, Search, Film, Filter, Download, X } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ParticleBackgroundSimple from './FirstParticleBackgroundSimple';
import './Dashboard.css';

const Dashboard = ({ isAuthenticated, user, logout }) => {
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const videoRef = useRef(null);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsLightMode(savedTheme === 'light');
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
    document.documentElement.classList.toggle('light', isLightMode);
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode(prev => !prev);
  };

  useEffect(() => {
    const fetchAvatars = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockAvatars = [
        {
          id: '1',
          name: 'Corporate Spokesperson',
          thumbnail: 'https://images.pexels.com/photos/7567437/pexels-photo-7567437.jpeg',
          duration: '0:35',
          createdAt: '2024-01-15T10:30:00Z',
          status: 'completed',
          videoUrl: '/assets/demo1_video.mp4'
        },
        // ... other avatar objects
      ];
      
      setAvatars(mockAvatars);
      setIsLoading(false);
    };
    
    fetchAvatars();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleDownload = (avatarId) => {
    const avatar = avatars.find(a => a.id === avatarId);
    if (!avatar) return;
    
    const link = document.createElement('a');
    link.href = avatar.videoUrl;
    link.download = `${avatar.name.replace(/\s+/g, '_')}_avatar.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openVideoModal = (avatar) => {
    setSelectedVideo(avatar);
  };

  const closeVideoModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setSelectedVideo(null);
  };

  const filteredAvatars = avatars.filter(avatar => {
    const matchesSearch = avatar.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || avatar.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={`dashboard-page ${isLightMode ? 'light' : 'dark'}`}>
      <div className="dashboard-background">
        <ParticleBackgroundSimple />
        <div className="background-overlay"></div>
      </div>

      <div className="dashboard-content" style={{ paddingTop: '80px' }}>
        <motion.header 
          ref={heroRef}
          style={{ opacity }}
          className="dashboard-header glassmorphism"
        >
          <div className="header-left">
            <h1>My Avatars</h1>
            <p>Create and manage your digital avatars</p>
          </div>
        </motion.header>

        <main className="dashboard-main">
          <div className="controls glassmorphism">
            <div className="search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search avatars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="controls-right">
              <button 
                className="filter-btn glassmorphism"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} />
                <span>Filters</span>
              </button>
              
              <Link to="/templates/select" className="create-btn glassmorphism">
                <Plus size={16} />
                <span>Create Avatar</span>
              </Link>
            </div>
          </div>

          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="filter-options glassmorphism"
            >
              <h4>Filter by Status</h4>
              <div className="filter-buttons">
                <button
                  className={filterStatus === 'all' ? 'active' : ''}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </button>
                <button
                  className={filterStatus === 'completed' ? 'active' : ''}
                  onClick={() => setFilterStatus('completed')}
                >
                  Completed
                </button>
                <button
                  className={filterStatus === 'processing' ? 'active' : ''}
                  onClick={() => setFilterStatus('processing')}
                >
                  Processing
                </button>
              </div>
            </motion.div>
          )}

          {isLoading ? (
            <div className="loading-spinner glassmorphism">
              <div className="spinner"></div>
              <p>Loading your avatars...</p>
            </div>
          ) : (
            <div className="avatars-grid">
              {filteredAvatars.map((avatar) => (
                <motion.div 
                  key={avatar.id}
                  whileHover={{ scale: 1.03 }}
                  className="avatar-card glassmorphism"
                >
                  <div className="card-media-wrapper">
                    <video
                      src={avatar.videoUrl}
                      poster={avatar.thumbnail}
                      muted
                      loop
                      playsInline
                      autoPlay
                      className="avatar-video-preview"
                    />
                    <div className="media-overlay"></div>
                    <div className="card-badge">
                      <Video size={14} />
                      <span>{avatar.duration}</span>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <h3>{avatar.name}</h3>
                    <div className="card-meta">
                      <Clock size={14} />
                      <span>{formatDate(avatar.createdAt)}</span>
                    </div>
                    <div className={`status-badge ${avatar.status}`}>
                      {avatar.status}
                    </div>
                    
                    <div className="card-actions">
                      <button 
                        className="action-btn"
                        onClick={() => handleDownload(avatar.id)}
                      >
                        <Download size={16} />
                        <span>Download</span>
                      </button>
                      <button 
                        className="action-btn primary"
                        onClick={() => openVideoModal(avatar)}
                      >
                        <Film size={16} />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="video-modal-overlay"
          onClick={closeVideoModal}
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="video-modal-content glassmorphism"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-modal-btn" onClick={closeVideoModal}>
              <X size={24} />
            </button>
            <h3>{selectedVideo.name}</h3>
            <div className="video-container">
              <video
                ref={videoRef}
                src={selectedVideo.videoUrl}
                controls
                autoPlay
                className="modal-video-player"
              />
            </div>
            <div className="video-meta">
              <span>Duration: {selectedVideo.duration}</span>
              <span>Created: {formatDate(selectedVideo.createdAt)}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;