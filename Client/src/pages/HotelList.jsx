import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import { fetchLocationSuggestions } from "../api/zentrum";


const HotelList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ---------- NEW AbortController ----------
  const searchController = useRef(null);

  // ---------- INITIAL VALUES ----------
  const {
    destination: initialDestinationObj,
    checkIn: initialCheckIn,
    checkOut: initialCheckOut,
    rooms: initialRooms,
    adults: initialAdults,
    kids: initialKids,
  } = location.state || {};

  // ---------- SEARCH UI STATE ----------
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

  // ---------- HOTEL SEARCH STATE ----------
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Initializing search...");

  const [confirmedDestination, setConfirmedDestination] =
    useState(initialDestinationObj);

  const effectiveDestinationObj =
    selectedLocationObj || initialDestinationObj;

  // ---------- HELPERS ----------
  const formatDateDisplay = (d) => {
    if (!d) return "—";
    const opts = { weekday: "short", month: "short", day: "numeric" };
    return new Date(d).toLocaleDateString("en-US", opts);
  };

  const handleRangeChange = (s, e) => {
    setCheckIn(s);
    setCheckOut(e);
  };

  // ---------- AUTOSUGGEST ----------
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

      let list = [];
      if (data?.locationSuggestions) list = data.locationSuggestions;
      else if (Array.isArray(data)) list = data;
      else if (data?.locations) list = data.locations;
      else if (data?.suggestions) list = data.suggestions;

      setSuggestions(list);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Autosuggest error:", err);
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

    if (item.hotelId) {
      navigate(`/hotel/${item.hotelId}`, {
        state: {
          hotelData: item,
          searchParams: {
            checkIn,
            checkOut,
            rooms,
            adults,
            kids,
          },
        },
      });
    }
  };

  // ---------- UPDATED handleFindRooms ----------
  const handleFindRooms = () => {
    if (!checkIn || !checkOut || !selectedLocationObj) {
      alert("Please select a destination and dates");
      return;
    }

    if (selectedLocationObj.hotelId) {
      navigate(`/hotel/${selectedLocationObj.hotelId}`, {
        state: {
          hotelData: selectedLocationObj,
          searchParams: { checkIn, checkOut, rooms, adults, kids },
        },
      });
      return;
    }

    setConfirmedDestination(selectedLocationObj);

    // Abort previous search
    if (searchController.current) {
      searchController.current.abort();
    }

    // New controller
    const newController = new AbortController();
    searchController.current = newController;

    setHotels([]);
    setStatus("Initializing search...");
    setLoading(true);

    // Start new search
    startHotelSearch(newController.signal);
  };

  // ---------- SEARCH LOGIC ----------
  const startHotelSearch = async (signal) => {
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
        },
        { signal }
      );

      const token = initRes.data.token || initRes.data.asyncToken;
      if (token) {
        pollResults(token, 1, signal);
      } else {
        alert("Could not start search.");
        setLoading(false);
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error(err);
      setLoading(false);
    }
  };

  // ---------- UPDATED pollResults ----------
  const pollResults = async (token, attempt = 1, signal) => {
    if (signal.aborted) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/hotels/search/result/${token}`,
        { signal }
      );

      if (res.data.hotels?.length > 0) {
        setHotels(res.data.hotels);
      }

      const isComplete =
        res.data.status === "Completed" || res.data.completed === true;

      if (!isComplete && attempt < 30) {
        const count =
          res.data.completedHotelCount || res.data.hotels?.length || 0;

        setStatus(`Finding best hotels for you... (${count} found)`);

        if (!signal.aborted) {
          setTimeout(
            () => pollResults(token, attempt + 1, signal),
            2000
          );
        }
      } else {
        setStatus("Search Completed");
        setLoading(false);
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error(err);
      setLoading(false);
    }
  };

  // ---------- UPDATED useEffect ----------
  useEffect(() => {
    const controller = new AbortController();
    searchController.current = controller;

    startHotelSearch(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  const destinationTitle =
    confirmedDestination?.fullName ||
    confirmedDestination?.name ||
    "Destination";

  // ---------- RETURN ----------
  return (
    <>
      <Header />

      <div className="searchbar-container">
        <SearchBar
          destination={destination}
          setDestination={setDestination}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          loadingSuggestions={loadingSuggestions}
          handleDestinationChange={handleDestinationChange}
          handleSelectSuggestion={handleSelectSuggestion}
          setShowSuggestions={setShowSuggestions}
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

      <div className="page-wrapper">
        <div className="main-header">
          <h1>{destinationTitle}</h1>
        </div>

        <div className="search-summary-box">
          <div className="search-info">
            <strong>Check-in:</strong>{" "}
            {checkIn ? new Date(checkIn).toDateString().slice(4) : "--"}
            &nbsp;|&nbsp;
            <strong>Check-out:</strong>{" "}
            {checkOut ? new Date(checkOut).toDateString().slice(4) : "--"}
            &nbsp;|&nbsp;
            <strong>Guests:</strong> {adults} Adults, {kids} Kids
          </div>
        </div>

        {loading && hotels.length === 0 && (
          <div className="skeleton-wrapper">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-img"></div>
                <div className="skeleton-content">
                  <div className="skeleton-line w-60"></div>
                  <div className="skeleton-line w-40"></div>
                  <div className="skeleton-line w-80"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hotels.length > 0 && (
  <div className="results-count-header">
    <h2>
      {hotels.length}{" "}
      {confirmedDestination?.name ||
        confirmedDestination?.cityName ||
        initialDestinationObj?.name ||
        "hotels"}{" "}
      hotels available 
    </h2>
  </div>
)}


        <div className="hotel-results-list">
          {hotels.map((hotel, index) => {
            const price = hotel.minRate
              ? Math.round(hotel.minRate)
              : hotel.rates?.length
              ? Math.round(
                  hotel.rates[0].rate || hotel.rates[0].net || 0
                )
              : null;

            const img =
              hotel.heroImage ||
              hotel.image ||
              hotel.thumbnail ||
              "https://via.placeholder.com/400x300?text=No+Image";

            const addressObj =
              hotel.contact?.address || hotel.address;

            let address;
            if (typeof addressObj === "object") {
              const line1 =
                addressObj.line1 || addressObj.address1 || "";
              const city =
                addressObj.city?.name ||
                addressObj.city ||
                "";
              address = `${line1}, ${city}`;
            } else {
              address =
                addressObj ||
                selectedLocationObj?.name ||
                selectedLocationObj?.cityName ||
                initialDestinationObj?.name ||
                "City Center";
            }

            const renderStars = (rating) =>
              "★".repeat(parseInt(rating) || 0);
            
const buildHotelUrl = (hotelId) => {
  const formattedCheckIn = checkIn?.toLocaleDateString("en-US");
  const formattedCheckOut = checkOut?.toLocaleDateString("en-US");

  const params = new URLSearchParams();
  params.set("checkIn", formattedCheckIn);
  params.set("checkOut", formattedCheckOut);
  params.set("rooms", rooms);
  params.set("adults[1]", adults);
  params.set("children[1]", kids);
  params.set("currency", "INR");

  // DESTINATION PARAMS
  params.set(
    "destinationName",
    confirmedDestination?.fullName ||
      confirmedDestination?.name ||
      initialDestinationObj?.fullName ||
      initialDestinationObj?.name ||
      ""
  );

  params.set(
    "destinationId",
    confirmedDestination?.id || initialDestinationObj?.id || ""
  );

  params.set(
    "destinationType",
    confirmedDestination?.type || initialDestinationObj?.type || ""
  );

  params.set(
    "lat",
    confirmedDestination?.latitude ||
      confirmedDestination?.lat ||
      initialDestinationObj?.latitude ||
      initialDestinationObj?.lat ||
      ""
  );

  params.set(
    "lng",
    confirmedDestination?.longitude ||
      confirmedDestination?.lng ||
      initialDestinationObj?.longitude ||
      initialDestinationObj?.lng ||
      ""
  );

  return `/hotel/${hotelId}?${params.toString()}`;
};

            return (
              <div key={index} className="hotel-card-horizontal">
                <div className="card-left">
                  <img
                    src={img}
                    alt={hotel.name}
                   onClick={() =>
  navigate(buildHotelUrl(hotel.id), {
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
  })
}

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
                   onClick={() =>
  navigate(buildHotelUrl(hotel.id), {
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
  })
}

                    style={{ cursor: "pointer" }}
                  >
                    {hotel.name}
                  </h3>
                  <div className="card-address">📍 {address}</div>
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
                   onClick={() =>
  navigate(buildHotelUrl(hotel.id), {
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
  })
}
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
