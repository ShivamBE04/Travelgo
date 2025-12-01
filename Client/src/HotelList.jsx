import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

// ✅ HEADER IMPORT
import Header from "./components/Header";

const HotelList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { destination, checkIn, checkOut, rooms, adults, kids } = location.state || {};

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Initializing search...");

  // Prevent double-firing in strict mode
  const searchStarted = useRef(false);

  useEffect(() => {
    if (destination && !searchStarted.current) {
      searchStarted.current = true;
      startHotelSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- HELPERS ---
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
    return addr || destination?.name || "City Center";
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
        searchParams: { checkIn, checkOut, rooms, adults, kids },
      },
    });
  };

  // --- SEARCH LOGIC ---
  const startHotelSearch = async () => {
    try {
      setStatus("Finding best hotels for you...");
      const initRes = await axios.post(
        "http://localhost:5000/api/hotels/search/init",
        {
          destination,
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

  // ---------- RETURN ----------
  return (
    <>
      {/* ✅ FULL-WIDTH HEADER */}
      <Header />

      {/* PAGE CONTENT */}
      <div className="page-wrapper">
        {/* 1. CENTERED DESTINATION HEADER */}
        <div className="main-header">
          <h1>{destination?.fullName || destination?.name || "Destination"}</h1>
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
              {hotels.length} {destination?.name} hotels available
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
                  <div className="card-address">
                    📍 {getAddress(hotel)}
                  </div>
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
