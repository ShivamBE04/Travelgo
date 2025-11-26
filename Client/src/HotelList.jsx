import React from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";

// --- DATA: Static Hotel List ---
const hotelList = [
  {
    id: 1,
    name: "Hotel Ocean",
    address: "Sipai Mal, Sipai Mandimbu Devi Temple, Hadimba Devi Temple, Manali, 175131",
    price: "₹837",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400",
    amenities: ["Free Internet"],
  },
  {
    id: 2,
    name: "Hotel Yak",
    address: "The Mall Manali (Distt. Kullu), Manali, 175131",
    price: "₹913",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=400",
    amenities: ["Internet Access"],
  },
  {
    id: 3,
    name: "Hotel Royal",
    address: "School Road Near Gurudwara The Mall Manali, Manali, 175131",
    price: "₹955",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=400",
    amenities: ["Free Internet", "Free Parking"],
  },
  {
    id: 4,
    name: "The Nush Stays",
    address: "The Nush Stays, Aleo, Manali, 175131",
    price: "₹1,033",
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=400",
    amenities: ["Free Internet", "Free Parking"],
    rating: "⭐⭐⭐⭐",
  },
  {
    id: 5,
    name: "Apple Field House",
    address: "Manu Temple Road, Manali, 175131",
    price: "₹1,051",
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=400",
    amenities: ["Free Internet", "Free Parking"],
  },
  {
    id: 6,
    name: "Indian Backpackers Hostel",
    address: "Kullu - Naggar - Manali Road Oppositepunjab National Bank Atm, Manali, 175143",
    price: "₹1,071",
    image: "https://images.unsplash.com/photo-1506462945848-ac8ea6f6ad2d?q=80&w=400",
    amenities: ["Free Internet", "Free Parking"],
  },
  {
    id: 7,
    name: "Doghan Stays - Auberge",
    address: "Manu Temple Road, Manali, 175131",
    price: "₹1,082",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=400",
    amenities: ["Free Internet"],
  },
  {
    id: 8,
    name: "Hotel New Ocean",
    address: "Sipai Mahadev Temple Rd, Manali, 175131",
    price: "₹1,094",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=400",
    amenities: ["Free Internet"],
  }
];

export default function HotelList() {

  const navigate = useNavigate();

  return (
    <div className="page-container">
      {/* 1. HEADER (Compact for List Page) */}
      <header className="site-header compact">
        <div className="header-content">
          <div
            className="logo-section"
            onClick={() => navigate("/")}
            style={{ cursor: 'pointer' }}
          >
            <span className="logo-icon">🏯</span>
            <div className="brand-name">
              <span>Beyond Trips</span>
            </div>
          </div>
          <nav className="top-nav">
            <a href="#">Groups (9+ Rooms)</a>
            <a href="#">Travel Guides</a>
            <a href="#">My Booking</a>
            <div className="nav-divider"></div>
            <a href="#">English ▾</a>
            <div className="call-us-small">
              <span>Call now</span> 80 0040 2670
            </div>
          </nav>
        </div>
      </header>

      {/* 2. SEARCH SUMMARY BAR */}
      <div className="search-summary-section">
        <div
          className="breadcrumbs-small"
          onClick={() => navigate("/")}
          style={{ cursor: 'pointer' }}
        >
          Home / Countries / India / Manali
        </div>
        <h1>Manali, Himachal Pradesh, India</h1>

        <div className="search-filters-bar">
          <div className="filter-group">
            <div className="f-label">Check-in</div>
            <div className="f-value">Fri, Nov 28</div>
          </div>
          <div className="filter-group">
            <div className="f-label">Check-out</div>
            <div className="f-value">Sat, Dec 6</div>
          </div>
          <div className="filter-group">
            <div className="f-label">Rooms</div>
            <div className="f-value">1</div>
          </div>
          <div className="filter-group">
            <div className="f-label">Adults</div>
            <div className="f-value">2</div>
          </div>
          <div className="change-dates-link">Change dates</div>

          <div className="right-filters">
            <div className="price-slider-mock">
              <span className="price-label">Price per night</span>
              <div className="slider-track">
                <div className="slider-thumb left"></div>
                <div className="slider-thumb right"></div>
              </div>
            </div>
            <select className="filter-select"><option>All hotels</option></select>
            <select className="filter-select"><option>Lowest price</option></select>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT: LIST + MAP */}
      <div className="list-page-layout">

        {/* LEFT COLUMN: Hotel List */}
        <div className="hotel-list-col">
          <div className="list-count">172 Manali hotels available</div>

          <div className="hotel-cards-container">
            {hotelList.map((hotel) => (
              <div key={hotel.id} className="list-card">
                <div className="lc-image">
                  <img src={hotel.image} alt={hotel.name} />
                </div>

                <div className="lc-content">
                  <div className="lc-header">
                    <h3
                      onClick={() => navigate(`/hotel/${hotel.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {hotel.name}
                    </h3>
                    {hotel.rating && <span className="stars">{hotel.rating}</span>}
                  </div>

                  <p className="lc-address">{hotel.address}</p>

                  <div className="lc-amenities">
                    {hotel.amenities.map(am => (
                      <span key={am}>📶 {am}</span>
                    ))}
                    <div className="more-am">More amenities...</div>
                  </div>
                </div>

                <div className="lc-price-col">
                  <div className="lc-price">{hotel.price}</div>
                  <button
                    className="book-now-small"
                    onClick={() => navigate(`/hotel/${hotel.id}`)}
                  >
                    BOOK NOW
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Map */}
        <div className="map-col">
          <div className="sticky-map">
            <div className="map-header-btns">
              <button className="map-btn active">Map</button>
              <button className="map-btn">Satellite</button>
            </div>
            <div className="map-placeholder">
              <img
                src="https://mt1.google.com/vt/lyrs=m&x=23&y=13&z=5"
                alt="Map View"
                className="map-img-bg"
              />
              <div className="map-pin p1">📍</div>
              <div className="map-pin p2">📍</div>
              <div className="map-pin p3">📍</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
