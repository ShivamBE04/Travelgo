import React, { useState } from "react";
import "./App.css";

// --- DATA: Static Listing Data ---
const hotelData = {
  name: "Indian Backpackers Hostel",
  address: "Kullu - Naggar - Manali Road Oppositepunjab National Bank Atm, Manali, 175143, India",
  description: "At indian backpackers hostel, exceptional service and top-notch amenities create a memorable experience for guests. Complimentary internet access is available in the hostel to ensure you stay connected during your visit. Chilly nights become more delightful than balmy ones, as you snuggle near the hostel's inviting hearth. At the hostel, utilize the convenient laundry service to maintain your preferred travel attire fresh, allowing you to pack lighter. Desire to unwind? Make the most of your visit at indian backpackers hostel with accessible amenities such as daily housekeeping. Accommodations come equipped with all the conveniences required for a restful night's slumber.",
  amenities: [
    "Car Rental", "Children's Play Area", "24 hour front desk",
    "Property is cleaned with disinfectant", "Restaurant", "Property confirms they are implementing guest safety measures",
    "Bed sheets and towels are washed at 60°C", "Contactless check-in available", "Guests are provided with free hand sanitizer",
    "Individually-wrapped food options", "Social distancing measures", "Internet Access - Free Public Access",
    "Game Room", "BBQ Grills", "Full Kitchen",
    "Laundry", "Pet Friendly"
  ],
  faqs: [
    { q: "What Is The Address For Indian Backpackers Hostel?", a: "The property is located at Kullu - Naggar - Manali Road Oppositepunjab National Bank Atm, Manali." },
    { q: "How Much Does It Cost Per Night To Stay At Indian Backpackers Hostel?", a: "Prices vary by date, but average start around ₹766 per night." },
    { q: "What Times Are Check-In And Check-Out?", a: "Check-in is at 12:00 PM and Check-out is at 11:00 AM." },
    { q: "Does Indian Backpackers Hostel Have A Pool?", a: "No, this property does not have a pool." },
    { q: "Is There A Restaurant At Indian Backpackers Hostel?", a: "Yes, there is an on-site restaurant serving local cuisine." }
  ]
};

// --- FAQ Item Component ---
const FAQItem = ({ question, answer, isOpen, toggle }) => {
  return (
    <div className="faq-item">
      <div className="faq-question" onClick={toggle}>
        <span>{question}</span>
        <span className={`faq-arrow ${isOpen ? "open" : ""}`}>›</span>
      </div>
      {isOpen && <div className="faq-answer">{answer}</div>}
    </div>
  );
};

export default function HotelDetails() {
  // State for FAQ toggles
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="page-container">
      {/* 1. HEADER (Reused) */}
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
            <a href="#">LOGIN</a>
          </nav>
        </div>
      </header>

      {/* 2. MAIN LISTING CONTENT */}
      <main className="listing-main">
        
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <span>Dashboard</span> › <span>Countries</span> › <span>India</span> › <span>Manali</span> › <span className="active">Indian Backpackers Hostel</span>
        </div>

        {/* Image Gallery */}
        <div className="gallery-section">
          <div className="gallery-main">
            <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800" alt="Main Hostel View" />
          </div>
          <div className="gallery-grid">
            <img src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=400" alt="Room" />
            <img src="https://images.unsplash.com/photo-1517840901100-8179e982acb7?q=80&w=400" alt="View" />
            <img src="https://images.unsplash.com/photo-1506462945848-ac8ea6f6ad2d?q=80&w=400" alt="People" />
            <div className="gallery-more">
              <img src="https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=400" alt="More" />
              <div className="more-overlay">+ Show all photos</div>
            </div>
          </div>
        </div>

        {/* Title & Info */}
        <section className="listing-header">
          <h1>{hotelData.name}</h1>
          <p className="listing-address">{hotelData.address}</p>
          <div className="listing-badge">
             <span className="badge-icon">ℹ️</span> 
             "Beyond Trips" is an independent travel network offering over 100,000 hotels worldwide. <a href="#">Learn more</a>
          </div>
        </section>

        {/* Rooms & Rates Section */}
        <section className="rooms-section">
          <h3>Rooms & Rates</h3>
          <p className="trip-summary">
            Your trip summary: Wed, Nov 26 - Mon, Dec 1 | Rooms: 1, Adults: 2 <a href="#">Change dates</a>
          </p>

          {/* Room Card */}
          <div className="room-card-container">
             <div className="best-value-banner">
                <span>💰 BEST VALUE!</span>
             </div>
             
             <div className="room-card">
                <div className="room-card-image">
                  <img src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=400" alt="King Bed Room" />
                  <span className="pop-tag">★ Most popular!</span>
                </div>

                <div className="room-card-details">
                  <h4>1 King Bed, Mountain View</h4>
                  <div className="room-amenities-list">
                    <div className="amenity-item">📶 Free Internet</div>
                    <div className="amenity-item">🅿️ Free Parking</div>
                  </div>
                  <div className="room-extras">Room amenities and details ⌄</div>
                </div>

                <div className="room-card-price">
                  <span className="price-val">₹766</span>
                  <button className="book-now-btn">BOOK NOW</button>
                </div>
             </div>
          </div>
        </section>

        {/* About Section */}
        <section className="about-section">
          <h3>About {hotelData.name}</h3>
          <p>{hotelData.description}</p>
        </section>

        {/* Amenities Section */}
        <section className="amenities-section">
          <h3>Amenities</h3>
          <div className="amenities-grid">
            {hotelData.amenities.map((item, index) => (
              <div key={index} className="amenity-check">
                <span className="check-mark">✓</span> {item}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <h3>Frequently Asked Questions</h3>
          <div className="faq-list">
            {hotelData.faqs.map((faq, index) => (
              <FAQItem 
                key={index}
                question={faq.q}
                answer={faq.a}
                isOpen={openFaqIndex === index}
                toggle={() => toggleFaq(index)}
              />
            ))}
          </div>
        </section>

      </main>

      {/* 3. FOOTER (Reused) */}
      <footer className="site-footer">
        <div className="footer-bottom">
           <div className="copyright">Copyright 2025 Beyond Trips™.</div>
        </div>
      </footer>
    </div>
  );
}