import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";   // ✅ UPDATED
import axios from "axios";
import "./App.css";

const HotelList = () => {
  const location = useLocation();
  const navigate = useNavigate();   // ✅ ADDED

  const { destination, checkIn, checkOut, rooms, adults, kids } = location.state || {};

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Initializing search...");

  useEffect(() => {
    if (destination) {
      startHotelSearch();
    }
  }, []);

  // 🔵 NEW: Navigate with hotel data + search params
  const handleViewDeal = (hotel) => {
    navigate(`/hotel/${hotel.id}`, {
      state: {
        hotelData: hotel,
        searchParams: { checkIn, checkOut, rooms, adults, kids }
      }
    });
  };

  // --- 1. DATA MAPPING HELPERS ---

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
    return addr || destination?.name || "View details for address";
  };

  const getPrice = (hotel) => {
    if (hotel.minRate) return Math.round(hotel.minRate);
    if (hotel.rates?.length > 0)
      return Math.round(hotel.rates[0].rate || hotel.rates[0].net || 0);
    return null;
  };

  const renderStars = (rating) => {
    const count = parseInt(rating) || 0;
    return "★".repeat(count);
  };

  // --- 2. SEARCH FUNCTIONS ---

  const startHotelSearch = async () => {
    try {
      setStatus("Contacting server...");
      const initRes = await axios.post("http://localhost:5000/api/hotels/search/init", {
        destination,
        checkIn,
        checkOut,
        rooms,
        adults,
        kids,
      });

      const token = initRes.data.token || initRes.data.asyncToken;
      if (token) pollResults(token);
      else {
        alert("Could not start search.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const pollResults = async (token) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/hotels/search/result/${token}`
      );

      if (res.data.hotels?.length > 0) {
        console.log("First Hotel Data:", res.data.hotels[0]);
        setHotels(res.data.hotels);
        setLoading(false);
      }

      if (res.data.status !== "Completed") {
        setStatus(`Found ${res.data.hotels?.length || 0} hotels...`);
        setTimeout(() => pollResults(token), 2000);
      } else {
        setStatus("Search Completed");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- 3. RENDER UI ---

  return (
    <div className="page-wrapper">
      <div className="search-summary">
        <h1>{hotels.length} hotels available in {destination?.name}</h1>
        <p className="date-range">
          {new Date(checkIn).toDateString()} — {new Date(checkOut).toDateString()}
        </p>
        {loading && <div className="loader-status">🔄 {status}</div>}
      </div>

      <div className="hotel-results-list">
        {hotels.map((hotel, index) => {
          const price = getPrice(hotel);

          return (
            <div key={index} className="hotel-card-horizontal">

              {/* LEFT: IMAGE */}
              <div className="card-left">
                <img
                  src={getHotelImage(hotel)}
                  alt={hotel.name}
                  onClick={() => handleViewDeal(hotel)}     // ✅ ADDED
                  style={{ cursor: "pointer" }}              // ✅ ADDED
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/300x200?text=Image+Error")
                  }
                />
              </div>

              {/* MIDDLE */}
              <div className="card-middle">
                <h3 className="card-title">{hotel.name}</h3>
                <div className="card-stars">{renderStars(hotel.starRating)}</div>

                <div className="card-address">{getAddress(hotel)}</div>

                <div className="card-amenities">
                  <span>📶 Free WiFi</span>
                  <span>❄️ AC</span>
                </div>

                <div className="more-amenities">More amenities</div>
              </div>

              {/* RIGHT */}
              <div className="card-right">
                {price ? (
                  <div className="price-box">
                    <span className="price-currency">₹</span>
                    <span className="price-amount">{price.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="price-box-check">Check Rates</div>
                )}

                <button
                  className="btn-book"
                  onClick={() => handleViewDeal(hotel)}   // ✅ ADDED
                >
                  BOOK NOW
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HotelList;
