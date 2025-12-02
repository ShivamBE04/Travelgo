import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import { fetchLocationSuggestions } from "./api/zentrum";

const HotelList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ---------- INITIAL VALUES FROM DASHBOARD ----------
  const {
    destination: initialDestinationObj,
    checkIn: initialCheckIn,
    checkOut: initialCheckOut,
    rooms: initialRooms,
    adults: initialAdults,
    kids: initialKids,
  } = location.state || {};

  // ---------- SEARCH UI STATE (FULL SEARCH BAR) ----------
  const [destination, setDestination] = useState(
    initialDestinationObj?.fullName ||
      initialDestinationObj?.name ||
      ""
  );
  const [selectedLocationObj, setSelectedLocationObj] = useState(
    initialDestinationObj || null
  );

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [checkIn, setCheckIn] = useState(
    initialCheckIn ? new Date(initialCheckIn) : null
  );
  const [checkOut, setCheckOut] = useState(
    initialCheckOut ? new Date(initialCheckOut) : null
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [rooms, setRooms] = useState(initialRooms || 1);
  const [adults, setAdults] = useState(initialAdults || 2);
  const [kids, setKids] = useState(initialKids || 0);

  // ---------- HOTEL RESULT STATE ----------
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Initializing search...");

  // Prevent double-firing in strict mode
  const searchStarted = useRef(false);

  // Effective destination object for search (initial OR newly selected)
  const effectiveDestinationObj = selectedLocationObj || initialDestinationObj;

  // ---------- HELPERS ----------
  const formatDateDisplay = (d) => {
    if (!d) return "—";
    const options = { weekday: "short", month: "short", day: "numeric" };
    return new Date(d).toLocaleDateString("en-US", options);
  };

  const handleRangeChange = (start, end) => {
    setCheckIn(start);
    setCheckOut(end);
  };

  // FULL SearchBar: destination change (autosuggest)
  const handleDestinationChange = async (e) => {
    const value = e.target.value;
    setDestination(value);

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoadingSuggestions(true);
      const data = await fetchLocationSuggestions(value);

      console.log("HotelList Autosuggest API Response:", data);

      let list = [];

      if (data && Array.isArray(data.locationSuggestions)) {
        list = data.locationSuggestions;
      } else if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.locations)) {
        list = data.locations;
      } else if (data && Array.isArray(data.suggestions)) {
        list = data.suggestions;
      }

      setSuggestions(list);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Autosuggest error (HotelList):", err);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

 const handleSelectSuggestion = (item) => {
  const label = item.fullName || item.name || "";
  setDestination(label);
  setSelectedLocationObj(item);
  setShowSuggestions(false);

  // ⭐ NEW: If user clicked a HOTEL suggestion → open hotel page
  if (item.hotelId) {
    navigate(`/hotel/${item.hotelId}`, {
      state: {
        hotelData: item,  // or fetch details inside HotelDetails
        searchParams: {
          checkIn,
          checkOut,
          rooms,
          adults,
          kids,
        }
      }
    });
  }
};


  // ---------- MAIN SEARCH TRIGGER (Option A: reload on same page) ----------
  const handleFindRooms = () => {
  if (!checkIn || !checkOut || !selectedLocationObj) {
    alert("Please select a destination and dates");
    return;
  }

  // ⭐ If user selected a HOTEL → OPEN HOTEL DETAILS
  if (selectedLocationObj.hotelId) {
    navigate(`/hotel/${selectedLocationObj.hotelId}`, {
      state: {
        hotelData: selectedLocationObj,
        searchParams: {
          checkIn,
          checkOut,
          rooms,
          adults,
          kids
        }
      }
    });
    return;
  }

  // ⭐ Otherwise, this is a CITY → run hotel list search (YOUR ORIGINAL LOGIC)
  setHotels([]);
  setStatus("Initializing search...");
  setLoading(true);
  searchStarted.current = true;
  startHotelSearch();
};


  // ---------- DATA HELPERS ----------
  const getHotelImage = (hotel) => {
    const img = hotel.heroImage || hotel.image || hotel.thumbnail;
    if (img) return img;
    return "https://via.placeholder.com/400x300?text=No+Image";
  };

  const getAddress = (hotel) => {
    const addr = hotel.contact?.address || hotel.address;
    if (typeof addr === "object") {
      const line1 = addr.line1 || addr.address1 || "";
      const city = addr.city?.name || addr.city || "";
      return `${line1}, ${city}`;
    }
    const fallbackName =
      selectedLocationObj?.name ||
      selectedLocationObj?.cityName ||
      initialDestinationObj?.name ||
      "City Center";
    return addr || fallbackName;
  };

  const getPrice = (hotel) => {
    if (hotel.minRate) return Math.round(hotel.minRate);
    if (hotel.rates && hotel.rates.length > 0) {
      return Math.round(hotel.rates[0].rate || hotel.rates[0].net || 0);
    }
    return null;
  };

  const renderStars = (rating) => {
    const count = parseInt(rating) || 0;
    return "★".repeat(count);
  };

  const handleViewDeal = (hotel) => {
    navigate(`/hotel/${hotel.id}`, {
      state: {
        hotelData: hotel,
        searchParams: {
          checkIn,
          checkOut,
          rooms,
          adults,
          kids,
        },
      },
    });
  };

  // ---------- SEARCH LOGIC (API CALLS) ----------
  const startHotelSearch = async () => {
    try {
      if (!effectiveDestinationObj || !checkIn || !checkOut) {
        setStatus("Please select destination and dates");
        setLoading(false);
        return;
      }

      setStatus("Finding best hotels for you...");

      const initRes = await axios.post(
        "http://localhost:5000/api/hotels/search/init",
        {
          destination: effectiveDestinationObj,
          checkIn,
          checkOut,
          rooms,
          adults,
          kids,
        }
      );

      const token = initRes.data.token || initRes.data.asyncToken;
      if (token) {
        pollResults(token);
      } else {
        alert("Could not start search.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const pollResults = async (token, attempt = 1) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/hotels/search/result/${token}`
      );

      if (res.data.hotels && res.data.hotels.length > 0) {
        setHotels(res.data.hotels);
      }

      const isComplete =
        res.data.status === "Completed" || res.data.completed === true;

      if (!isComplete && attempt < 30) {
        const count =
          res.data.completedHotelCount || res.data.hotels?.length || 0;
        setStatus(`Finding best hotels for you... (${count} found)`);

        setTimeout(() => pollResults(token, attempt + 1), 2000);
      } else {
        setStatus("Search Completed");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };
useEffect(() => {
  if (!destination) return;

  // ⭐ If destination is a HOTEL, skip API search
  if (destination.hotelId) {
    // No need to fetch hotel list at all
    return;
  }

  if (!searchStarted.current) {
    searchStarted.current = true;
    startHotelSearch();
  }
}, [destination]);
  // ---------- RUN FIRST SEARCH (from Dashboard params) ----------
  useEffect(() => {
    if (
      effectiveDestinationObj &&
      checkIn &&
      checkOut &&
      !searchStarted.current
    ) {
      searchStarted.current = true;
      startHotelSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveDestinationObj, checkIn, checkOut]);

  const destinationTitle =
    selectedLocationObj?.fullName ||
    selectedLocationObj?.name ||
    initialDestinationObj?.fullName ||
    initialDestinationObj?.name ||
    "Destination";

  // ---------- RETURN ----------
  return (
    <>
      {/* FULL-WIDTH HEADER */}
      <Header />

      {/* FULL SEARCH BAR (same as Dashboard) */}
      
<div className="searchbar-container">
  <SearchBar
    destination={destination}
    setDestination={setDestination}
    suggestions={suggestions}
    showSuggestions={showSuggestions}
    loadingSuggestions={loadingSuggestions}
    handleDestinationChange={handleDestinationChange}
    handleSelectSuggestion={handleSelectSuggestion}
    calendarOpen={calendarOpen}
    setCalendarOpen={setCalendarOpen}
    checkIn={checkIn}
    checkOut={checkOut}
    formatDateDisplay={formatDateDisplay}
    rooms={rooms}
    adults={adults}
    kids={kids}
    setRooms={setRooms}
    setAdults={setAdults}
    setKids={setKids}
    handleFindRooms={handleFindRooms}
    handleRangeChange={handleRangeChange}
  />
</div>
      {/* PAGE CONTENT */}
      <div className="page-wrapper">
        {/* 1. CENTERED DESTINATION HEADER */}
        <div className="main-header">
          <h1>{destinationTitle}</h1>
        </div>

        {/* 2. SEARCH SUMMARY BAR (Dates, etc.) */}
        <div className="search-summary-box">
          <div className="search-info">
            <strong>Check-in:</strong>{" "}
            {checkIn ? new Date(checkIn).toDateString().slice(4) : "--"}{" "}
            &nbsp;|&nbsp;
            <strong>Check-out:</strong>{" "}
            {checkOut ? new Date(checkOut).toDateString().slice(4) : "--"}{" "}
            &nbsp;|&nbsp;
            <strong>Guests:</strong> {adults} Adults, {kids} Kids
          </div>
        </div>

        {/* 3. LOADER (Only visible while searching) */}
        {status !== "Search Completed" && hotels.length === 0 && (
          <div className="loader-status">
            <span className="spinner">🔄</span> {status}
          </div>
        )}

        {/* 4. RESULTS COUNT (Aligned Left) */}
        {hotels.length > 0 && (
          <div className="results-count-header">
            <h2>
              {hotels.length}{" "}
              {selectedLocationObj?.name ||
                selectedLocationObj?.cityName ||
                initialDestinationObj?.name ||
                "hotels"}{" "}
              hotels available
            </h2>
          </div>
        )}

        {/* 5. HOTEL LIST */}
        <div className="hotel-results-list">
          {hotels.map((hotel, index) => {
            const price = getPrice(hotel);

            return (
              <div key={index} className="hotel-card-horizontal">
                <div className="card-left">
                  <img
                    src={getHotelImage(hotel)}
                    alt={hotel.name}
                    onClick={() => handleViewDeal(hotel)}
                    style={{ cursor: "pointer" }}
                    onError={(e) =>
                      (e.target.src =
                        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400&auto=format&fit=crop")
                    }
                  />
                </div>

                <div className="card-middle">
                  <h3
                    className="card-title"
                    onClick={() => handleViewDeal(hotel)}
                    style={{ cursor: "pointer" }}
                  >
                    {hotel.name}
                  </h3>
                  <div className="card-address">📍 {getAddress(hotel)}</div>
                  <div className="card-stars">
                    {renderStars(hotel.starRating)}
                  </div>

                  <div className="card-amenities">
                    <span>📶 Free WiFi</span>
                    <span>❄️ AC</span>
                    <span>🛁 Private Bath</span>
                  </div>
                </div>

                <div className="card-right">
                  {price ? (
                    <div className="price-box">
                      <span className="price-currency">₹</span>
                      <span className="price-amount">
                        {price.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <div className="price-box-check">Check Rates</div>
                  )}
                  <button
                    className="btn-book"
                    onClick={() => handleViewDeal(hotel)}
                  >
                    BOOK NOW
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default HotelList;
