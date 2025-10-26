import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LogoImg from '../../assets/aecus-logo.png';
// import NotificationBadge from '../common/NotificationBadge'; // Moved to sidebar
import './css/WorkerNavbar.css';

const WorkerNavbar = ({ modalOpen }) => {
  const navigate = useNavigate();
  const auth = useAuth();
  console.log('auth from navbar', auth);
  console.log('user profile picture:', auth?.user?.profilePicture);
  console.log('user profilepicture (lowercase):', auth?.user?.profilepicture);
  console.log('user data:', auth?.user);
  console.log('Google auth provider:', localStorage.getItem('auth_provider'));
  // Handle case where auth context might not be available
  if (!auth) {
    return (
      <header className="wrk-dashboard-header">
        <div className="wrk-dashboard-header-content">
          <div className="wrk-dashboard-logo-wrapper" onClick={() => navigate('/dashboard')}>
            <img 
              src={LogoImg} 
              alt="Aecus Care Logo" 
              className="wrk-dashboard-logo-image"
            />
          </div>
          <div className="wrk-dashboard-user-actions">
            <div className="wrk-dashboard-user-info">
              <span className="wrk-dashboard-user-name">Loading...</span>
            </div>
          </div>
        </div>
      </header>
    );
  }
  
  const { signOut, user } = auth;
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
        <div className="wrk-dashboard-logo-wrapper" onClick={() => navigate('/dashboard')}>
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
          
          {/* Notification Badge - Moved to Sidebar */}
          {/* <div className="wrk-dashboard-notifications">
            <NotificationBadge 
              onNavigateToNotifications={() => navigate('/notifications')}
            />
          </div> */}
          
          <div className="wrk-dashboard-user-menu">
            {!modalOpen && (
              <button
                className="wrk-dashboard-user-menu-button"
                aria-label="User menu"
                onClick={toggleMenu}
                aria-expanded={isMenuOpen}
              >
                <div className="wrk-dashboard-user-avatar">
                  {(user?.profilePicture || user?.profilepicture) ? (
                    <img
                      src={user.profilePicture || user.profilepicture}
                      alt={`${user?.firstName} ${user?.lastName}`}
                      className="wrk-dashboard-user-avatar-image"
                      onError={(e) => {
                        console.log('Profile picture failed to load:', user.profilePicture || user.profilepicture);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    style={{ 
                      display: (user?.profilePicture || user?.profilepicture) ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '50%',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#666'
                    }}
                  >
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </div>
                </div>
              </button>
            )}
            {!modalOpen && isMenuOpen && ( // Only show menu if modal is not open
              <div className="wrk-dashboard-dropdown-menu">
                <div className="wrk-dashboard-dropdown-header">
                  <div className="wrk-dashboard-dropdown-avatar">
                    {(user?.profilePicture || user?.profilepicture) ? (
                      <img
                        src={user.profilePicture || user.profilepicture}
                        alt={`${user?.firstName} ${user?.lastName}`}
                        className="wrk-dashboard-dropdown-avatar-image"
                        onError={(e) => {
                          console.log('Dropdown profile picture failed to load:', user.profilePicture || user.profilepicture);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      style={{ 
                        display: (user?.profilePicture || user?.profilepicture) ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '50%',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#666'
                      }}
                    >
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </div>
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