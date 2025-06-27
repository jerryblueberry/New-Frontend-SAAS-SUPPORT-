import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LogoImg from '../../assets/Aecus LOGO.webp';
import './css/WorkerNavbar.css';

const WorkerNavbar = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const isGoogleUser = localStorage.getItem('auth_provider') === 'google';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(false, isGoogleUser);
    navigate('/login', { replace: true });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="wrk-dashboard-header">
      <div className="wrk-dashboard-header-content">
        <div className="wrk-dashboard-logo-wrapper">
          <img 
            src={LogoImg} 
            alt="Aecus Care Logo" 
            className="wrk-dashboard-logo-image"
          />
        </div>

        <div className="wrk-dashboard-user-actions">
          <div className="wrk-dashboard-user-info">
            <span className="wrk-dashboard-user-name">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
          <div className="wrk-dashboard-user-menu">
            <button
              className="wrk-dashboard-user-menu-button"
              aria-label="User menu"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
            >
              <div className="wrk-dashboard-user-avatar">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
            </button>
            
            {isMenuOpen && (
              <div className="wrk-dashboard-dropdown-menu">
                <div className="wrk-dashboard-dropdown-header">
                  <div className="wrk-dashboard-dropdown-avatar">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </div>
                  <div className="wrk-dashboard-dropdown-user-info">
                    <span className="wrk-dashboard-dropdown-name">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="wrk-dashboard-dropdown-email">
                      {user?.email}
                    </span>
                  </div>
                </div>
                <div className="wrk-dashboard-dropdown-divider" />
                {/* <button 
                  className="wrk-dashboard-dropdown-item"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </button> */}
                <button 
                  className="wrk-dashboard-dropdown-item"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default WorkerNavbar;