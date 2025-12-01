import React from "react";

const Header = ({ isLoggedIn, setIsLoginOpen }) => {
  return (
    <header className="site-header">
      <div className="header-content">
        <div className="logo-section">
          <span className="logo-icon">🏯</span>
          <div className="brand-name">
            <span>BeyondTrips</span>
            <span className="brand-sub">An independent travel network</span>
          </div>
        </div>

        <nav className="top-nav">
          <a href="#">Travel Guides</a>
          <a href="#">My Booking</a>
          <div className="nav-divider"></div>

          {isLoggedIn ? (
            <span className="user-greeting">Hi, Traveler</span>
          ) : (
            <span className="login-link" onClick={() => setIsLoginOpen(true)}>
              LOGIN
            </span>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
