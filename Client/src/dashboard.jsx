import React, { useState, useRef, useEffect } from "react";
import "./App.css";

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
  // Format: "Mon, Nov 24"
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

// build grid for a month
function getMonthDays(year, month) {
  const days = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekDay = firstDay.getDay(); // 0-6 (Sun-Sat)

  for (let i = 0; i < startWeekDay; i++) {
    days.push(null); // empty boxes
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

// ---------- Calendar Popup ----------
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
        // Optional: Close on selection
        // onClose(); 
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

// ---------- MAIN DASHBOARD ----------
export default function Dashboard() {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Guest States
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);

  const handleRangeChange = (start, end) => {
    setCheckIn(start);
    setCheckOut(end);
  };

  return (
    <div className="page-container">
      {/* 1. TOP HEADER (Dark) */}
      <header className="site-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-icon">🏯</span> {/* Placeholder Icon */}
            <div className="brand-name">
              <span>Beyond Trips</span>
              <span className="brand-sub">An independent travel network</span>
            </div>
          </div>
          
          <nav className="top-nav">
            <a href="#">LOGIN</a>
            <a href="#">Travel Guides</a>
            <a href="#">My Booking</a>
            <div className="nav-divider"></div>
            <div className="lang-selector">English ▾</div>
            <div className="call-us">
              <small>Call now</small>
              <span>8851052124</span>
            </div>
          </nav>
        </div>
      </header>

      {/* 2. MAIN HERO SECTION (White Background Area) */}
      <section className="intro-section">
        <div className="intro-text">
          <h1>Book your perfect trip</h1>
          <p>A proudly independent travel network with over 100,000 hotels worldwide</p>
        </div>
      </section>

      {/* 3. SEARCH BAR (Overlapping) */}
      <div className="search-bar-wrapper">
        <div className="search-bar">
          
          {/* Destination */}
          <div className="sb-field destination-field">
            <label>Destination</label>
            <input type="text" placeholder="Where are you going?" />
          </div>

          <div className="sb-divider"></div>

          {/* Dates (Trigger Calendar) */}
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

          {/* Rooms / Guests */}
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

          {/* Submit Button */}
          <button className="sb-button">
            FIND ROOMS
          </button>

          {/* Calendar Dropdown */}
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

      {/* 4. HERO IMAGE (Bottom) */}
      <div className="hero-image">
         {/* Using a mountain image similar to the screenshot */}
         <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4" alt="Mountains" />
      </div>

    </div>
  );
}