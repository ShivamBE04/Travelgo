import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import "../App.css";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";


const HotelDetails = () => {
  const { id } = useParams();
  const location = useLocation();
    const navigate = useNavigate();   // ⭐ IMPORTANT!
  const { hotelData, searchParams } = location.state || {};

  const [details, setDetails] = useState(null);
  const [roomList, setRoomList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(false);

  // GALLERY STATES
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [galleryTitle, setGalleryTitle] = useState("");

  const [expandedAmenities, setExpandedAmenities] = useState({});
  const [showMoreAttractions, setShowMoreAttractions] = useState(false);

  // ---------- GALLERY ----------
  const openGallery = (images, index, title = "") => {
    const processedImages = images
      .map((img) => extractImageUrl(img, "Xxl"))
      .filter(Boolean);

    const finalImages =
      processedImages.length > 0
        ? processedImages
        : ["https://via.placeholder.com/800x600?text=Image+Not+Found"];

    setGalleryImages(finalImages);
    setCurrentImage(index);
    setGalleryTitle(title);
    setGalleryOpen(true);
  };

  const closeGallery = () => setGalleryOpen(false);
  const prevImage = () => setCurrentImage((i) => i - 1);
  const nextImage = () => setCurrentImage((i) => i + 1);

  // ---------- FETCH HOTEL CONTENT ----------
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/hotels/content/${id}`
        );
        setDetails(res.data);
      } catch (err) {
        console.error("Error fetching content", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [id]);

  // ---------- FETCH ROOMS ----------
  useEffect(() => {
    if (searchParams) fetchRooms();
  }, [id, searchParams]);

const fetchRooms = async () => {
  setRoomsLoading(true);
  try {
    const res = await axios.post(
      `http://localhost:5000/api/hotels/rooms/${id}`,
      searchParams
    );

    const hotel = res.data.hotel || {};
    const stdRooms = hotel.standardizedRooms || [];
    const stdRoomGroups = hotel.standardizedRoomGroups || [];

    // ⭐ Exchange Rates → INR
    const FX = {
      INR: 1,
      USD: 85,
      EUR: 92,
      GBP: 104,
      SGD: 63,
      AED: 23
    };

    const rateMap = {};
    (hotel.rates || []).forEach((r) => (rateMap[r.id] = r));

    const nights =
      (new Date(searchParams.checkOut) - new Date(searchParams.checkIn)) /
      (1000 * 60 * 60 * 24);

    const adults = Number(searchParams.adults || 1);
    const children = Number(searchParams.children || 0);

    const cards = stdRoomGroups
      .map((grp) => {
        const srId = grp.standardRoomIds?.[0];
        if (!srId) return null;

        const stdRoom = stdRooms.find((r) => r.id === srId);
        if (!stdRoom) return null;

        const options = grp.options || [];

        // ⭐ Match occupancy
        const exactMatches = options.filter((opt) => {
          const occ = opt.occupancy || {};
          return (
            Number(occ.adult || 0) === adults &&
            Number(occ.child || 0) === children
          );
        });

        const optionsToUse = exactMatches.length ? exactMatches : options;
        if (!optionsToUse.length) return null;

        // ⭐ Best price option
        const bestOption = optionsToUse.reduce((a, b) => {
          const priceA =
            a.convertedRate?.amountAfterTax ??
            a.convertedRate?.amountBeforeTax ??
            a.totalRate ??
            Infinity;

          const priceB =
            b.convertedRate?.amountAfterTax ??
            b.convertedRate?.amountBeforeTax ??
            b.totalRate ??
            Infinity;

          return priceA < priceB ? a : b;
        });

        const srInfo = bestOption.standardRooms?.[0] || {};
        const rateId = srInfo.rateIds?.[0];
        const rate = rateMap[rateId];

        // ⭐ API Currency & Conversion
        const apiCurr = bestOption.convertedRate?.currency || "USD";
        const fxRate = FX[apiCurr] || 85; // default USD→INR

        // ⭐ Convert to INR
        const apiAmount =
          bestOption.convertedRate?.amountAfterTax ??
          bestOption.convertedRate?.amountBeforeTax ??
          bestOption.totalRate ??
          0;

        const perNightINR = Math.round(apiAmount * fxRate);
        const totalPriceINR = perNightINR * nights;

        return {
          ...stdRoom,
          perNight: perNightINR,
          totalPrice: totalPriceINR,
          nights,
          rate,
          rateId,
          bestOption
        };
      })
      .filter(Boolean);

    setRoomList(cards);
  } catch (err) {
    console.error("Error fetching rooms", err);
    setRoomList([]);
  } finally {
    setRoomsLoading(false);
  }
};

// KEYBOARD NAVIGATION
useEffect(() => {
  if (!galleryOpen) return;

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      if (currentImage > 0) prevImage();
    } 
    else if (e.key === "ArrowRight") {
      if (currentImage < galleryImages.length - 1) nextImage();
    } 
    else if (e.key === "Escape") {
      closeGallery();
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => window.removeEventListener("keydown", handleKeyDown);
}, [galleryOpen, currentImage, galleryImages]);

  // ---------- IMAGE HELPERS ----------
  const extractImageUrl = (img, preferred = "Xxl") => {
    if (!img) return null;
    const links = img.links || [];
    const best =
      links.find((l) => l.size === preferred) ||
      links.find((l) => l.size === "Large") ||
      links.find((l) => l.size === "Standard") ||
      links[0];
    return best?.url || null;
  };

  const getHotelImageUrls = () => {
    const data = details || hotelData || {};
    const imgs = data.images || [];
    let urls = imgs.map((img) => extractImageUrl(img, "Xxl")).filter(Boolean);

    while (urls.length < 5) {
      urls.push("https://via.placeholder.com/800x600?text=Hotel");
    }
    return urls;
  };

  const hotelImages = getHotelImageUrls();

  const getRoomImage = (room) => {
    if (room.images?.length) {
      const link = extractImageUrl(room.images[0]);
      if (link) return link;
    }
    return "https://via.placeholder.com/300x200?text=Room";
  };

  const toggleAmenities = (i) => {
    setExpandedAmenities((p) => ({ ...p, [i]: !p[i] }));
  };
//shimmer 
  if (loading) {
  return (
    <div className="hotel-details-skeleton">

      <div className="skeleton-title"></div>
      <div className="skeleton-location"></div>

      <div className="skeleton-gallery">
        <div className="skeleton-main-img"></div>

        <div className="skeleton-side-imgs">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-thumb"></div>
          ))}
        </div>
      </div>

      <div className="skeleton-about">
        <div className="skeleton-line w-80"></div>
        <div className="skeleton-line w-60"></div>
        <div className="skeleton-line w-90"></div>
        <div className="skeleton-line w-70"></div>
      </div>

    </div>
  );
}


  const activeData = details || hotelData || {};

  // ------------------- RENDER -------------------
  return (
     <>
    {/* ⭐ FULL-WIDTH HEADER */}
    <Header />
    <div className="hotel-page-wrapper">
      <div className="details-page">
        {/* HEADER */}
        <div className="details-header-container">
          <h1>{activeData?.name}</h1>

          {activeData?.contact?.address?.line1 && (
           <p>
  📍  {[
    activeData?.contact?.address?.line1,
    activeData?.contact?.address?.city?.name,
    activeData?.contact?.address?.state?.name,
    activeData?.contact?.address?.postalCode,
    activeData?.contact?.address?.country?.name,
  ]
    .filter(Boolean)
    .join(", ")}
</p>

          )}
        </div>

        
        <div className="hotel-photo-grid">
          {/* BIG IMAGE LEFT */}
          <div
            className="hotel-main-photo hotel-photo-zoom"
            onClick={() =>
              openGallery(
                activeData.images || [],
                0,
                activeData.name || "Hotel Photos"
              )
            }
          >
            <img src={hotelImages[0]} alt="Main hotel" />
          </div>

          {/* FOUR SMALL IMAGES */}
          <div className="hotel-side-photos">
            {hotelImages.slice(1, 5).map((img, idx) => (
              <div
                key={idx}
                className="hotel-thumb hotel-photo-zoom"
                onClick={() =>
                  openGallery(
                    activeData.images || [],
                    idx + 1,
                    activeData.name || "Hotel Photos"
                  )
                }
              >
                <img src={img} alt={`Photo ${idx + 2}`} />

                {/* Overlay for last tile */}
                {idx === 3 && (
                  <div className="show-more-tile">
                    <span>Show more photos</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="details-container">
          <div className="details-left">
            {/* ABOUT */}
            <section className="info-box">
              <h2>About this hotel</h2>
              <div
                className="hotel-desc"
                dangerouslySetInnerHTML={{
                  __html:
                    activeData.descriptions?.find((d) => d.type === "location")
                      ?.text || "",
                }}
              />
            </section>

            {/* AMENITIES */}
            <section className="info-box">
              <h2>Amenities</h2>
              <div className="amenities-grid">
                {activeData.facilities?.slice(0, 12).map((f, i) => (
                  <div key={i} className="amenity-item">
                    ✅ {f.name}
                  </div>
                ))}
              </div>
            </section>

            {/* NEARBY PLACES */}
            {(activeData.nearbyPlaces || activeData.nearByAttractions) && (
              <section className="info-box">
                <h2>Nearby Places</h2>

                {(activeData.nearbyPlaces || activeData.nearByAttractions)
                  .slice(
                    0,
                    showMoreAttractions
                      ? (activeData.nearbyPlaces ||
                          activeData.nearByAttractions).length
                      : 6
                  )
                  .map((place, idx) => (
                    <div key={idx} className="nearby-item">
                      ⭐ {place.name} — {place.distance} km
                    </div>
                  ))}

                {(activeData.nearbyPlaces || activeData.nearByAttractions)
                  .length > 6 && (
                  <button
                    className="show-more-btn"
                    onClick={() =>
                      setShowMoreAttractions(!showMoreAttractions)
                    }
                  >
                    {showMoreAttractions
                      ? "Show less"
                      : "Show more places"}
                  </button>
                )}
              </section>
            )}

            {/* ROOMS */}
          {/* ROOMS */}
<section className="info-box" id="rooms">
  <h2>Available Rooms</h2>

  {roomsLoading ? (
    <div className="room-list">
      {/* ⭐ SHIMMER ROOM CARD 1 */}
      <div className="room-card shimmer-room">
        <div className="room-image-col">
          <div className="shimmer room-img"></div>
        </div>
        <div className="room-info-col">
          <div className="shimmer room-title"></div>
          <div className="shimmer room-line"></div>
          <div className="shimmer room-line short"></div>
          <div className="shimmer room-badge"></div>
          <div className="shimmer room-badge"></div>
        </div>
        <div className="room-price-col">
          <div className="shimmer price-box"></div>
        </div>
      </div>

      {/* ⭐ SHIMMER ROOM CARD 2 */}
      <div className="room-card shimmer-room">
        <div className="room-image-col">
          <div className="shimmer room-img"></div>
        </div>
        <div className="room-info-col">
          <div className="shimmer room-title"></div>
          <div className="shimmer room-line"></div>
          <div className="shimmer room-line short"></div>
          <div className="shimmer room-badge"></div>
          <div className="shimmer room-badge"></div>
        </div>
        <div className="room-price-col">
          <div className="shimmer price-box"></div>
        </div>
      </div>

      {/* ⭐ SHIMMER ROOM CARD 3 */}
      <div className="room-card shimmer-room">
        <div className="room-image-col">
          <div className="shimmer room-img"></div>
        </div>
        <div className="room-info-col">
          <div className="shimmer room-title"></div>
          <div className="shimmer room-line"></div>
          <div className="shimmer room-line short"></div>
          <div className="shimmer room-badge"></div>
          <div className="shimmer room-badge"></div>
        </div>
        <div className="room-price-col">
          <div className="shimmer price-box"></div>
        </div>
      </div>
    </div>
  ) : roomList.length === 0 ? (
    <p>No rooms found.</p>
  ) : (
    <div className="room-list">
      {roomList.map((room, idx) => {
        const roomImage = getRoomImage(room);
        const facilities = room.facilities || [];
        const isOpen = expandedAmenities[idx];

        return (
          <div key={idx} className="room-card">
            <div className="room-image-col">
              <div
                className="room-image-wrapper"
                onClick={() =>
                  openGallery(
                    room.images || [],
                    0,
                    room.name || "Room Photos"
                  )
                }
              >
                <img src={roomImage} alt="" />
                <div className="room-photo-overlay">
                  View room photos
                </div>
              </div>
            </div>

            <div className="room-info-col">
              <h3>{room.name}</h3>

              <div
                className="room-desc-html"
                dangerouslySetInnerHTML={{
                  __html:
                    room.description?.split("<br/>")[0] || "",
                }}
              />

              <div className="room-amenities-list">
                {(isOpen ? facilities : facilities.slice(0, 4)).map(
                  (f, i) => (
                    <span key={i} className="room-badge">
                      {f.name}
                    </span>
                  )
                )}
              </div>

              {facilities.length > 4 && (
                <button
                  className="room-amenities-toggle"
                  onClick={() => toggleAmenities(idx)}
                >
                  {isOpen
                    ? "Show fewer amenities"
                    : `Show ${
                        facilities.length - 4
                      } more amenities`}
                </button>
              )}
            </div>

            <div className="room-price-col">
              <div className="price-main">
                <span className="price-current">
                  ₹{room.perNight.toLocaleString()}
                </span>
                {room.strikePrice && (
                  <span className="price-old">
                    ₹{room.strikePrice.toLocaleString()}
                  </span>
                )}
                <span className="price-night">/ night</span>
              </div>

              <div className="price-tax-info">
                Includes taxes and charges
              </div>

              <div className="price-total">
                Total: ₹{room.totalPrice.toLocaleString()}
              </div>

              {room.rate?.cancellationPolicy?.includes("non") ? (
                <div className="tag-bad">Non-Refundable</div>
              ) : (
                <div className="tag-good">Free Cancellation</div>
              )}

<button
  className="book-btn"
  onClick={() =>
    navigate("/checkout", {
      state: {
        hotel: activeData,
        room: room,
        searchParams: searchParams,
        image: getRoomImage(room),
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
  )}
</section>

          </div>

          {/* SIDEBAR */}
          <div className="details-right">
            <div className="booking-card">
              <h3>Your Stay</h3>
              {searchParams?.checkIn && (
                <p>
                  Check-in:{" "}
                  {new Date(searchParams.checkIn).toLocaleDateString()}
                </p>
              )}
              {searchParams?.checkOut && (
                <p>
                  Check-out:{" "}
                  {new Date(searchParams.checkOut).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* FULL SCREEN GALLERY */}
       {/* FULL SCREEN GALLERY */}
{galleryOpen && (
  <div className="gallery-overlay" onClick={closeGallery}>
    <div
      className="gallery-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <button className="gallery-close" onClick={closeGallery}>
        Close ✕
      </button>

      <h3 className="gallery-title">{galleryTitle}</h3>

      <div className="gallery-image-wrapper">
        {currentImage > 0 && (
          <button className="gallery-arrow left" onClick={prevImage}>
            ❮
          </button>
        )}

        <img
          className="gallery-main"
          src={galleryImages[currentImage]}
          alt="main"
        />

        {currentImage < galleryImages.length - 1 && (
          <button className="gallery-arrow right" onClick={nextImage}>
            ❯
          </button>
        )}
      </div>

      <div className="gallery-thumbs">
        {galleryImages.map((src, idx) => (
          <img
            key={idx}
            src={src}
            className={idx === currentImage ? "active" : ""}
            onClick={() => setCurrentImage(idx)}
            alt={`thumb-${idx}`}
          />
        ))}
      </div>
    </div>
  </div>
)}

      </div>
    </div>
      </>
  );
};

export default HotelDetails;
