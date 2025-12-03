import React from "react";

const Header = ({ isLoggedIn, setIsLoginOpen }) => {
  return (
    <header className="site-header">
      <div className="header-content">
        <div className="logo-section">
         {/* SVG LOGO ICON (Temple / Travel Icon) */}
          <svg
  width="36"
  height="36"
  viewBox="0 0 24 24"
  fill="white"       // ← now white
  xmlns="http://www.w3.org/2000/svg"
  className="footer-icon"
>
  <path d="M12 2L2 7h20L12 2zm7 9v9h3v2H2v-2h3v-9H2V9h20v2h-3zm-2 0H7v9h10v-9z" />
</svg>

          <div className="brand-name">
            <span>BEONTRIP</span>
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
