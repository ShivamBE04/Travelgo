import React, { useState } from "react";
import "./App.css";
const otherCities = [
  "Honolulu Hotels", "Miami Beach Hotels", "Reno Hotels", "Memphis Hotels",
  "Washington D.C. Hotels", "Sydney Hotels", "Phoenix Hotels", "Philadelphia Hotels",
  "New Orleans Hotels", "Melbourne Hotels", "Salt Lake City Hotels", "Manila Hotels",
  "Houston Hotels", "Seattle Hotels", "Denver Hotels", "Tampa Hotels",
  "Paris Hotels", "Austin Hotels", "Scottsdale Hotels", "Omaha Hotels",
  "Dallas Hotels", "Los Angeles Hotels", "Columbus Hotels", "Louisville Hotels",
  "San Diego Hotels", "San Antonio Hotels", "Amsterdam Hotels", "Saint Louis Hotels",
  "Atlanta Hotels", "Dubai Hotels", "Atlantic City Hotels", "Charlotte Hotels"
];
const featuredHotels = [
  { id: 1, name: "Golden Nugget Hotel & Casino Las Vegas", location: "Las Vegas, NV", image: "https://media.gettyimages.com/id/642047654/photo/glittering-facades-the-golden-nugget-and-binions-hotels-and-casinos-of-fremont-casino-in.jpg?s=612x612&w=0&k=20&c=mopvf0Z-l1JWlCplnchNTKoVwHSyMLETd9EXCK5hAPs=" },
  { id: 2, name: "Caesars Palace Las Vegas", location: "Las Vegas, NV", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=800" },
  { id: 3, name: "Disney's Animal Kingdom Lodge", location: "Orlando, FL", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800" },
  { id: 4, name: "Fontainebleau Resort Miami Beach", location: "Miami Beach, FL", image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=800" },
  { id: 5, name: "New York Hilton Midtown", location: "New York City, NY", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800" },
  { id: 6, name: "Tropicana Atlantic City", location: "Atlantic City, NJ", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800" }
];
// --- DATA: Top Destinations (This was missing!) ---
const destinations = [
  { id: 1, name: "Las Vegas", count: "177 hotels available", image: "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?q=80&w=800&auto=format&fit=crop" },
  { id: 2, name: "Chicago", count: "154 hotels available", image: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?q=80&w=800&auto=format&fit=crop" },
  { id: 3, name: "Miami", count: "155 hotels available", image: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?q=80&w=800&auto=format&fit=crop" },
  { id: 4, name: "London", count: "641 hotels available", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop" },
  { id: 5, name: "New York City", count: "369 hotels available", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop" },
  { id: 6, name: "Orlando", count: "278 hotels available", image: "https://images.unsplash.com/photo-1597466599360-3b9775841aec?q=80&w=800&auto=format&fit=crop" },
  { id: 7, name: "Nashville", count: "176 hotels available", image: "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?q=80&w=800&auto=format&fit=crop" },
  { id: 8, name: "Boston", count: "73 hotels available", image: "https://plus.unsplash.com/premium_photo-1694475434235-12413ec38b3e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
];

// ---------- Date helpers ----------
function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function sameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBefore(a, b) {
  return a.getTime() < b.getTime();
}

function isAfter(a, b) {
  return a.getTime() > b.getTime();
}

function formatDateDisplay(d) {
  if (!d) return "—";
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

function getMonthDays(year, month) {
  const days = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekDay = firstDay.getDay(); 

  for (let i = 0; i < startWeekDay; i++) {
    days.push(null); 
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

// ---------- Calendar Popup Component ----------
function CalendarPopup({ open, onClose, checkIn, checkOut, onChangeRange }) {
  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const maxDate = addMonths(minDate, 12);

  const [startMonthOffset, setStartMonthOffset] = useState(0); 

  const firstMonthDate = addMonths(minDate, startMonthOffset);
  const secondMonthDate = addMonths(minDate, startMonthOffset + 1);
  const canGoPrev = startMonthOffset > 0;
  const canGoNext = startMonthOffset < 10;

  const handleDayClick = (date) => {
    if (!date) return;
    if (isBefore(date, minDate) || isAfter(date, maxDate)) return;

    if (!checkIn || (checkIn && checkOut)) {
      onChangeRange(date, null);
    } else if (checkIn && !checkOut) {
      if (isBefore(date, checkIn)) {
        onChangeRange(date, null);
      } else {
        onChangeRange(checkIn, date);
      }
    }
  };

  const renderMonth = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const label = monthDate.toLocaleString("default", { month: "long", year: "numeric" });
    const days = getMonthDays(year, month);
    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    return (
      <div className="cal-month" key={`${year}-${month}`}>
        <div className="cal-month-title">{label}</div>
        <div className="cal-weekdays">
          {weekDays.map((w) => <div key={w} className="cal-weekday">{w}</div>)}
        </div>
        <div className="cal-days">
          {days.map((d, idx) => {
            if (!d) return <div key={idx} className="cal-day empty" />;
            const disabled = isBefore(d, minDate) || isAfter(d, maxDate);
            const isStart = sameDay(d, checkIn);
            const isEnd = sameDay(d, checkOut);
            const inRange = checkIn && checkOut && isAfter(d, checkIn) && isBefore(d, checkOut);

            let classes = "cal-day";
            if (disabled) classes += " disabled";
            if (isStart || isEnd) classes += " selected";
            if (inRange) classes += " in-range";

            return (
              <div key={idx} className={classes} onClick={() => !disabled && handleDayClick(d)}>
                {d.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!open) return null;

  return (
    <div className="calendar-popup">
      <div className="cal-header">
        <button className="cal-nav-btn" disabled={!canGoPrev} onClick={() => canGoPrev && setStartMonthOffset(startMonthOffset - 1)}>‹</button>
        <div className="cal-months">
          {renderMonth(firstMonthDate)}
          {renderMonth(secondMonthDate)}
        </div>
        <button className="cal-nav-btn" disabled={!canGoNext} onClick={() => canGoNext && setStartMonthOffset(startMonthOffset + 1)}>›</button>
      </div>
      <div className="cal-footer">
        <button className="cal-clear" onClick={() => onChangeRange(null, null)}>Clear Dates</button>
        <button className="cal-done" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

// ---------- LOGIN MODAL COMPONENT ----------
function LoginModal({ isOpen, onClose, onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  
  if (!isOpen) return null;

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="login-header">
          <div className="login-logo-icon">🏯</div>
          <h2>Beyond Trips</h2>
          <p className="login-subtitle">Welcome Back!</p>
        </div>

        <button className="google-btn">
          <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.769 -21.864 51.959 -21.864 51.129 C -21.864 50.299 -21.734 49.489 -21.484 48.729 L -21.484 45.639 L -25.464 45.639 C -26.284 47.269 -26.754 49.129 -26.754 51.129 C -26.754 53.129 -26.284 54.989 -25.464 56.619 L -21.484 53.529 Z" />
              <path fill="#EA4335" d="M -14.754 43.769 C -12.984 43.769 -11.404 44.379 -10.154 45.579 L -6.714 42.139 C -8.804 40.189 -11.514 38.989 -14.754 38.989 C -19.444 38.989 -23.494 41.689 -25.464 45.639 L -21.484 48.729 C -20.534 45.879 -17.884 43.769 -14.754 43.769 Z" />
            </g>
          </svg>
          Sign in with Google
        </button>

        <div className="login-form">
          <div className="input-group">
            <label>Email *</label>
            <input type="email" />
          </div>

          <div className="input-group">
            <label>Enter your password *</label>
            <div className="password-wrapper">
              <input type={showPassword ? "text" : "password"} />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </span>
            </div>
          </div>

          <div className="forgot-password">
            Password playing hide and seek? Find it here!
          </div>

          <div className="checkbox-group">
            <input type="checkbox" id="marketing" />
            <label htmlFor="marketing">Opt in for marketing communications</label>
          </div>

          <button className="login-submit-btn" onClick={onLogin}>
            LOGIN
          </button>

          <div className="login-footer-link">
            Don't have an account, Sign-up!
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- MAIN DASHBOARD ----------
export default function Dashboard() {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);

  const handleRangeChange = (start, end) => {
    setCheckIn(start);
    setCheckOut(end);
  };

  const handleFindRooms = () => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
    } else {
      alert("Searching for rooms...");
    }
  };

  const performLogin = () => {
    setIsLoggedIn(true);
    setIsLoginOpen(false);
    alert("Logged in successfully!");
  };

  return (
    <div className="page-container">
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLogin={performLogin}
      />

      {/* 1. TOP HEADER */}
      <header className="site-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-icon">🏯</span>
            <div className="brand-name">
              <span>Beyond Trips</span>
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
               <span className="login-link" onClick={() => setIsLoginOpen(true)}>LOGIN</span>
            )}
          </nav>
        </div>
      </header>

      {/* 2. INTRO SECTION */}
      <section className="intro-section">
        <div className="intro-text">
          <h1>Book your perfect trip</h1>
          <p>A proudly independent travel network with over 100,000 hotels worldwide</p>
        </div>
      </section>

      {/* 3. SEARCH BAR */}
      <div className="search-bar-wrapper">
        <div className="search-bar">
          <div className="sb-field destination-field">
            <label>Destination</label>
            <input type="text" placeholder="Where are you going?" />
          </div>
          <div className="sb-divider"></div>

          <div className="sb-field date-field" onClick={() => setCalendarOpen(!calendarOpen)}>
            <div className="date-group">
              <label>Check-in:</label>
              <div className="date-value">
                {checkIn ? formatDateDisplay(checkIn) : "Add date"} 📅
              </div>
            </div>
          </div>
          <div className="sb-divider"></div>

          <div className="sb-field date-field" onClick={() => setCalendarOpen(!calendarOpen)}>
             <div className="date-group">
              <label>Check-out:</label>
              <div className="date-value">
                {checkOut ? formatDateDisplay(checkOut) : "Add date"} 📅
              </div>
            </div>
          </div>
          <div className="sb-divider"></div>

          <div className="sb-field select-field">
            <label>Rooms:</label>
            <select value={rooms} onChange={(e) => setRooms(e.target.value)}>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="sb-divider"></div>

          <div className="sb-field select-field">
            <label>Adults:</label>
            <select value={adults} onChange={(e) => setAdults(e.target.value)}>
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="sb-divider"></div>

          <div className="sb-field select-field">
            <label>Kids:</label>
            <select value={kids} onChange={(e) => setKids(e.target.value)}>
              {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <button className="sb-button" onClick={handleFindRooms}>
            FIND ROOMS
          </button>

          <div className="calendar-anchor">
            <CalendarPopup 
              open={calendarOpen} 
              onClose={() => setCalendarOpen(false)}
              checkIn={checkIn}
              checkOut={checkOut}
              onChangeRange={handleRangeChange}
            />
          </div>
        </div>
      </div>

      {/* 4. HERO IMAGE */}
      <div className="hero-image">
         <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4" alt="Mountains" />
      </div>
      
      {/* 5. TOP DESTINATIONS SECTION */}
      <section className="destinations-section">
        <div className="section-header">
          <h2>Top Destinations</h2>
          <p>Still deciding where to go? Here are some of our favorite places</p>
        </div>

        <div className="destinations-grid">
          {destinations.map((city) => (
            <div key={city.id} className="dest-card">
              <div className="dest-image-wrapper">
                <img src={city.image} alt={city.name} />
                <div className="dest-overlay"></div>
                <span className="dest-name">{city.name}</span>
              </div>
              <div className="dest-footer">
                {city.count}
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* 7. FEATURED HOTELS */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Featured Hotels</h2>
          <p>Trending properties from around the world</p>
        </div>
        
        <div className="featured-grid">
          {featuredHotels.map((hotel) => (
            <div key={hotel.id} className="featured-card">
              <img src={hotel.image} alt={hotel.name} />
              <div className="featured-info">
                <span className="feat-location">{hotel.location}</span>
                <h3 className="feat-name">{hotel.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* 8. HOTELS IN OTHER CITIES SECTION */}
      <section className="other-cities-section">
        <div className="cities-header">
          <h2>Hotels in Other Top Cities</h2>
          <button className="see-all-btn">SEE ALL CITIES</button>
        </div>

        <div className="cities-grid">
          {otherCities.map((city, index) => (
            <button key={index} className="city-btn">
              <span>{city}</span>
              <span className="city-arrow">›</span>
            </button>
          ))}
        </div>
      </section>
      {/* 9. FOOTER SECTION */}
      <footer className="site-footer">
        <div className="footer-top">
          
          {/* Left Side: Brand & Socials */}
          <div className="footer-brand-col">
            <div className="footer-logo">
              <span className="footer-icon">🏯</span>
              <div className="footer-brand-text">
                <span className="f-brand-name">Beyond Trips™</span>
                <span className="f-brand-sub">An independent travel network</span>
              </div>
            </div>
            
            {/* Social Icons (using text placeholders for simplicity) */}
            <div className="social-icons">
              <span className="s-icon">f</span>
              <span className="s-icon">🐦</span>
              <span className="s-icon">📸</span>
              <span className="s-icon">P</span>
              <span className="s-icon">▶</span>
            </div>
          </div>

          {/* Right Side: Links Columns */}
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
                <li><a href="#">Privacy Choices <span className="check-icon">✓</span></a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="copyright">Copyright 2025 Beyond Trips™.</div>
          <div className="disclaimer">Beyond Trips™ is an independent travel network offering over 100,000 hotels worldwide.</div>
        </div>
      </footer>


    </div>
  );
}