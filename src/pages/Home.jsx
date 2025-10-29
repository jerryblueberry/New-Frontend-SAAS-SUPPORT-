import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import './css/Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [authState, setAuthState] = useState(isAuthenticated);

  // Update local state when auth context changes
  useEffect(() => {
    setAuthState(isAuthenticated);
  }, [isAuthenticated]);

  // Listen for logout events to immediately update UI
  useEffect(() => {
    const handleLogout = () => {
      setAuthState(false);
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">AecusTech</h1>
        <p className="home-subtitle">Connecting Support Workers with Meaningful Opportunities</p>
      </header>

      <main className="home-main">
        {authState ? (
          <div className="auth-links">
            <h2>Welcome Back!</h2>
            <div className="button-group">
              <Link to="/dashboard" className="home-button primary">
                My Dashboard
              </Link>
              <Link to="/browse-jobs" className="home-button secondary">
                Browse Jobs
              </Link>
            </div>
          </div>
        ) : (
          <div className="guest-links">
            <h2>Find Your Perfect Care Match</h2>
            <p className="home-description">
              Whether you're a support worker looking for opportunities or an employer seeking 
              compassionate professionals, we're here to help you connect.
            </p>
            <div className="button-group">
              <Link to="/login" className="home-button primary">
                Login
              </Link>
              <Link to="/register" className="home-button secondary">
                Register as a Support Worker
              </Link>
              <Link to="/client/register" className="home-button secondary">
                Register as an Organization
              </Link>
            </div>
          </div>
        )}
      </main>

      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">👥</div>
          <h3>Personalized Matches</h3>
          <p>We connect you with opportunities that match your skills and preferences.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💼</div>
          <h3>Verified Employers</h3>
          <p>All employers are vetted to ensure quality job opportunities.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🤝</div>
          <h3>Supportive Community</h3>
          <p>Join a network of professionals dedicated to quality care.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;