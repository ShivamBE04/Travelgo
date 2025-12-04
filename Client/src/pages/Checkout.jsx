import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../App.css";

// import Checkout from "./pages/Checkout";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { hotel, room, searchParams, image } = location.state || {};

  if (!hotel || !room || !searchParams) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>No booking selected</h2>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 20px",
            background: "#0056d2",
            color: "white",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const formatDate = (dateValue) => {
    try {
      if (!dateValue) return "";
      return new Date(dateValue).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const checkInDate = formatDate(searchParams.checkIn);
  const checkOutDate = formatDate(searchParams.checkOut);

  return (
    <>
      <Header />

      <div className="checkout-wrapper">

        {/* -------- TOP IMAGE -------- */}
        <div className="checkout-hero">
          <img src={image} alt="Room" className="checkout-hero-img" />
        </div>

        {/* -------- HOTEL INFO -------- */}
        <div className="checkout-hotel-top">
          <h1>{hotel.name}</h1>

          <p>
            📍 {hotel.contact?.address?.line1},{" "}
            {hotel.contact?.address?.city?.name},{" "}
            {hotel.contact?.address?.state?.name},{" "}
            {hotel.contact?.address?.country?.name}
          </p>

          <h3>{room.name}</h3>

          <p>
            {checkInDate} → {checkOutDate}
            <br />
            Guests: {searchParams.adults} Adults, {searchParams.children} Children
          </p>
        </div>

        {/* -------- MAIN LAYOUT -------- */}
        <div className="checkout-container">

          {/* ============ LEFT SIDE ============ */}
          <div className="checkout-left">

            {/* -------- FORM CARD -------- */}
            <div className="booking-form-card">

              {/* <div className="booking-form-header">
                <p>Are you traveling for work?</p>

                <div className="work-options">
                  <label><input type="radio" name="work" /> Yes</label>
                  <label><input type="radio" name="work" defaultChecked /> No</label>
                </div>

                <span className="required-banner">
                  Almost done! Just fill in the * required info
                </span>
              </div>
 */}
              {/* TITLE + FIRST + LAST */}
              <div className="form-row-3">
                <div>
                  <label>Title</label>
                  <select>
                    <option>Mr</option>
                    <option>Ms</option>
                    <option>Mrs</option>
                  </select>
                </div>

                <div>
                  <label>First Name *</label>
                  <input type="text" placeholder="First Name" />
                </div>

                <div>
                  <label>Last Name *</label>
                  <input type="text" placeholder="Last Name" />
                </div>
              </div>

              {/* EMAIL */}
              <div className="form-row-1">
                <label>Email Address *</label>
                <input type="email" placeholder="Double-check for typos" />
              </div>

              <div className="form-row-1">
                <label>Confirm Email Address *</label>
                <input type="email" placeholder="Confirm your email" />
              </div>

              {/* PHONE */}
              <div className="form-row-1">
                <label>Telephone (mobile number preferred) *</label>

                <div className="phone-flex">
                  <select className="country-code-select">
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                  </select>

                  <input type="text" placeholder="Phone Number" />
                </div>
              </div>
            </div>

            {/* -------- ROOM SUMMARY BOX -------- */}
            {/* ======== ROOM AMENITIES BLOCK ======== */}
<div className="room-amenities-box">

    <h3 className="room-amenities-title">{room.name}</h3>

    <ul className="room-amenities-list">

      {(() => {
        const desc = hotel?.descriptions?.find(d => d.type === "amenities");
        if (!desc || !desc.text) return <li>No amenities available</li>;

        const amenities = desc.text
          .replace(/such as/i, "")
          .split(/and|,|\.|;/i)
          .map(a => a.trim())
          .filter(a => a.length > 3);

        return amenities.slice(0, 6).map((a, index) => (
          <li key={index}>• {a}</li>
        ));
      })()}

    </ul>

</div>


            {/* -------- PAYMENT SECTION -------- */}
            <div className="payment-section">
              <h3>Payment Details</h3>

              <label>Card Number *</label>
              <input type="text" placeholder="XXXX XXXX XXXX XXXX" />

              <div className="bform-grid">
                <div>
                  <label>Expiry *</label>
                  <input type="text" placeholder="MM/YY" />
                </div>

                <div>
                  <label>CVV *</label>
                  <input type="password" placeholder="123" />
                </div>
              </div>
            </div>

            {/* -------- BUTTON -------- */}
            <button className="checkout-btn booking-next-btn">
              Complete Booking →
            </button>

            <p className="no-charge-note">
              Don’t worry — you won’t be charged yet!
            </p>

          </div>

          {/* ============ RIGHT SIDE (SUMMARY) ============ */}
          <div className="checkout-summary">
            <h3>Your Booking Summary</h3>

            <p>
              {checkInDate} → {checkOutDate} <br />
              Guests: {searchParams.adults} Adults, {searchParams.children} Children
            </p>

            <p><b>Room:</b> {room.name}</p>

            <p><b>Price/Night:</b> ₹{room.perNight?.toLocaleString()}</p>

            <p><b>Total:</b> ₹{room.totalPrice?.toLocaleString()}</p>

            <p className="summary-note">
              Taxes included. Free cancellation if allowed by hotel policy.
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default Checkout;
