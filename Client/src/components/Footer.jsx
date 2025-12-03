import React from "react";
// import "./Footer.css"; // <-- keep your footer styling here

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-top">

        {/* BRAND + LOGO */}
        <div className="footer-brand-col">
          <div className="footer-logo">
            {/* SVG LOGO ICON (Temple / Travel Icon) */}
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="footer-icon"
            >
              <path d="M12 2L2 7h20L12 2zm7 9v9h3v2H2v-2h3v-9H2V9h20v2h-3zm-2 0H7v9h10v-9z" />
            </svg>

            <div className="footer-brand-text">
              <span className="f-brand-name">BEONTRIP™</span>
              <span className="f-brand-sub">An independent travel network</span>
            </div>
          </div>

          {/* SOCIAL ICONS */}
          <div className="social-icons">
            {/* Facebook */}
            <svg className="s-icon" viewBox="0 0 24 24">
              <path d="M13 3h4V0h-4c-3.3 0-6 2.7-6 6v3H4v4h3v11h4V13h3.5l.5-4H11V6c0-1.1.9-2 2-2z" />
            </svg>

            {/* Twitter / X */}
            <svg className="s-icon" viewBox="0 0 24 24">
              <path d="M22 4.5l-6.4 7.4 6 7.6H17l-4-5-4 5H2.4l6-7.6L2 4.5h5l4 5 4-5h7z" />
            </svg>

            {/* Instagram */}
            <svg className="s-icon" viewBox="0 0 24 24">
              <path d="M7 2h10c2.8 0 5 2.2 5 5v10c0 2.8-2.2 5-5 5H7c-2.8 0-5-2.2-5-5V7c0-2.8 2.2-5 5-5zm5 5a5 5 0 100 10 5 5 0 000-10zm6-1a1 1 0 110 2 1 1 0 010-2z" />
            </svg>

            {/* Pinterest */}
            <svg className="s-icon" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 00-4 19.2c-.1-.8-.2-2 .1-3 .2-.7 1.3-5 1.3-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.7-2.4.8 0 1.1.6 1.1 1.3 0 .8-.5 2-0.8 3-.2.9.5 1.6 1.4 1.6 1.6 0 2.9-1.8 2.9-4.4C17.4 7.6 15.5 6 12.9 6c-2.9 0-4.7 2.2-4.7 4.5 0 .8.3 1.7.7 2.1.1.1.2.1.2 0 .1-.2.4-1.3.5-1.7 0-.2 0-.3-.2-.6-.2-.3-.5-.8-.5-1.4 0-1.8 1.3-3.4 3.6-3.4 1.9 0 3.3 1.3 3.3 3.1 0 2-.9 5.3-3.1 5.3-.9 0-1.7-.7-1.4-1.6.3-1 .9-2.1.9-2.8 0-.7-.3-1.4-1.1-1.4-1 0-1.8 1-1.8 2.4 0 .9.3 1.5.3 1.5S9.4 16.3 9.3 17c-.2.9-.1 2.3 0 3A10 10 0 1012 2z" />
            </svg>

            {/* YouTube */}
            <svg className="s-icon" viewBox="0 0 24 24">
              <path d="M23 7s-.2-1.6-.8-2.3c-.7-.8-1.5-.8-1.8-.9C17.6 3.5 12 3.5 12 3.5h0s-5.6 0-8.4.3c-.3 0-1.1.1-1.8.9C1.2 5.4 1 7 1 7S.8 8.8.8 10.5v3C.8 15.2 1 17 1 17s.2 1.6.8 2.3c.7.8 1.6.8 2 .9 1.5.1 6.2.3 8.2.3 0 0 5.6 0 8.4-.3.3 0 1.1-.1 1.8-.9.6-.7.8-2.3.8-2.3s.2-1.8.2-3.5v-3C23.2 8.8 23 7 23 7zm-13 8V9l6 3-6 3z" />
            </svg>
          </div>
        </div>

        {/* LINK SECTION */}
        <div className="footer-links-group">
          <div className="footer-col">
            <h4>Learn more</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">News</a></li>
              <li><a href="#">Customer Reviews</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Sitemap</a></li>
              <li><a href="#">Property Listing</a></li>
              <li><a href="#">Hotel Non-Affiliation</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Get in Touch</h4>
            <ul>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">My Booking</a></li>
              <li><a href="#">Group Rates</a></li>
              <li><a href="#">Weddings</a></li>
              <li><a href="#">Extended Stay</a></li>
              <li>
                <a href="#">
                  Privacy Choices <span className="check-icon">✓</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* FOOTER BOTTOM */}
      <div className="footer-bottom">
        <div className="copyright">
          Copyright 2025 BEONTRIP™.
        </div>
        <div className="disclaimer">
          BEONTRIP™ is an independent travel network offering over 100,000 hotels worldwide.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
