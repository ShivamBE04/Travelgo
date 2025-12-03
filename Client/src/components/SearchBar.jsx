import React, { useState } from "react";

const SearchBar = ({
    setShowSuggestions,
  destination,
  setDestination,
  suggestions,
  showSuggestions,
  loadingSuggestions,
  handleDestinationChange,
  handleSelectSuggestion,
  calendarOpen,
  setCalendarOpen,
  checkIn,
  checkOut,
  formatDateDisplay,
  rooms,
  adults,
  kids,
  setRooms,
  setAdults,
  setKids,
  handleFindRooms,
  handleRangeChange
}) => {
const CalendarIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="black"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginLeft: 6, marginTop: 2 }}
  >
    <path d="M7 2C7 1.44772 7.44772 1 8 1C8.55228 1 9 1.44772 9 2V4H15V2C15 1.44772 15.4477 1 16 1C16.5523 1 17 1.44772 17 2V4H19C20.6569 4 22 5.34315 22 7V20C22 21.6569 20.6569 23 19 23H5C3.34315 23 2 21.6569 2 20V7C2 5.34315 3.34315 4 5 4H7V2ZM5 8V20H19V8H5Z"/>
  </svg>
);


  // ⭐⭐⭐ INLINE CALENDARPOPUP (INSIDE THIS FILE)
const CalendarPopup = ({ open, onClose, checkIn, checkOut, onChangeRange }) => {
  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

  const [offset, setOffset] = useState(0);

  const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  const sameDay = (a, b) =>
    a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const isBefore = (a, b) => a.getTime() < b.getTime();
  const isAfter = (a, b) => a.getTime() > b.getTime();

  const getMonthDays = (year, month) => {
    const days = [];
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const gap = first.getDay();

    for (let i = 0; i < gap; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const handleDayClick = (date) => {
    if (!date) return;

    if (!checkIn || (checkIn && checkOut)) {
      onChangeRange(date, null);
    } else if (checkIn && !checkOut) {
      if (isBefore(date, checkIn)) onChangeRange(date, null);
      else onChangeRange(checkIn, date);
    }
  };

  if (!open) return null;

  const month1 = addMonths(minDate, offset);
  const month2 = addMonths(minDate, offset + 1);

  return (
    <div className="calendar-popup">

      {/* HEADER WITH BOOKING.COM STYLE ARROWS */}
      <div className="cal-header">
        
        <button
          className="cal-nav-btn"
          disabled={offset === 0}
          onClick={() => setOffset(o => o - 1)}
        >
          <span className="arrow-icon">‹</span>
        </button>

        <button
          className="cal-nav-btn"
          disabled={offset >= 10}
          onClick={() => setOffset(o => o + 1)}
        >
          <span className="arrow-icon">›</span>
        </button>

      </div>

      {/* TWO MONTHS SIDE-BY-SIDE */}
      <div className="cal-months">
        {[month1, month2].map((m, idx) => {
          const y = m.getFullYear();
          const mo = m.getMonth();
          const label = m.toLocaleString("default", { month: "long", year: "numeric" });
          const days = getMonthDays(y, mo);

          return (
            <div className="cal-month" key={idx}>
              
              <div className="cal-month-title">{label}</div>

              <div className="cal-weekdays">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                  <div key={d} className="cal-weekday">{d}</div>
                ))}
              </div>

              <div className="cal-days">
                {days.map((d, i) => {
                  if (!d) return <div key={i} className="cal-day empty" />;

                  const disabled = isBefore(d, minDate) || isAfter(d, maxDate);
                  const start = sameDay(d, checkIn);
                  const end = sameDay(d, checkOut);
                  const inRange =
                    checkIn && checkOut && isAfter(d, checkIn) && isBefore(d, checkOut);

                  let cls = "cal-day";
                  if (disabled) cls += " disabled";
                  if (start) cls += " start selected";
                  if (end) cls += " end selected";
                  if (inRange) cls += " in-range";

                  return (
                    <div
                      key={i}
                      className={cls}
                      onClick={() => !disabled && handleDayClick(d)}
                    >
                      {d.getDate()}
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="cal-footer">
        <button className="cal-clear" onClick={() => onChangeRange(null, null)}>
          Clear Dates
        </button>
        <button className="cal-done" onClick={onClose}>
          Done
        </button>
      </div>

    </div>
  );
};

  // ⭐⭐⭐ MAIN SEARCH BAR UI
  return (
    <div className="search-bar-wrapper">
      <div className="search-bar">

        {/* DESTINATION */}
        <div className="sb-field destination-field" style={{ position: "relative" }}>
          <label>Destination</label>

          <input
            type="text"
            placeholder="Where are you going?"
            value={destination}
            onChange={handleDestinationChange}
            onFocus={() => destination.length >= 2 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />

          {showSuggestions && (
            <div className="suggestions-dropdown">
              {loadingSuggestions && (
                <div className="suggestion-item">Loading...</div>
              )}

              {!loadingSuggestions && suggestions.length === 0 && (
                <div className="suggestion-item">No matches found</div>
              )}

              {!loadingSuggestions &&
                suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    className="suggestion-item"
                    onMouseDown={() => handleSelectSuggestion(item)}
                  >
                    <div className="suggestion-main">
                      {item.displayName ||
                        item.cityName ||
                        item.name ||
                        item.label}
                    </div>

                    {item.cityId && (
                      <div className="suggestion-sub">City · {item.country}</div>
                    )}

                    {item.hotelId && (
                      <div className="suggestion-sub">
                        Hotel · {item.cityName}, {item.country}
                      </div>
                    )}

                    {item.country && (
                      <div className="suggestion-sub">{item.country}</div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="sb-divider"></div>

        {/* CHECK-IN */}
        <div className="sb-field date-field" onClick={() => setCalendarOpen(!calendarOpen)}>
          <div className="date-group">
            <label>Check-in:</label>
            <div className="date-value">
  {checkIn ? formatDateDisplay(checkIn) : "Add date"}
  <span style={{ marginLeft: 6, display: "inline-flex", alignItems: "center" }}>
    <CalendarIcon />
  </span>
</div>
          </div>
        </div>

        <div className="sb-divider"></div>

       {/* CHECK-OUT */}
        <div className="sb-field date-field" onClick={() => setCalendarOpen(!calendarOpen)}>
          <div className="date-group">
            <label>Check-out:</label>
            
            <div className="date-value">
              {/* ✅ FIX: Use checkOut here, not checkIn */}
              {checkOut ? formatDateDisplay(checkOut) : "Add date"}
              <span style={{ marginLeft: 6, display: "inline-flex", alignItems: "center" }}>
                <CalendarIcon />
              </span>
            </div>
            
          </div>
        </div>

        <div className="sb-divider"></div>

        {/* ROOMS */}
        <div className="sb-field select-field">
          <label>Rooms:</label>
          <select value={rooms} onChange={(e) => setRooms(e.target.value)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="sb-divider"></div>

        {/* ADULTS */}
        <div className="sb-field select-field">
          <label>Adults:</label>
          <select value={adults} onChange={(e) => setAdults(e.target.value)}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="sb-divider"></div>

        {/* KIDS */}
        <div className="sb-field select-field">
          <label>Kids:</label>
          <select value={kids} onChange={(e) => setKids(e.target.value)}>
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* FIND ROOMS BUTTON */}
        <button className="sb-button" onClick={handleFindRooms}>
          FIND ROOMS
        </button>

        {/* INLINE CALENDAR POPUP HERE */}
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
  );
};

export default SearchBar;
