const axios = require("axios");
const crypto = require("crypto"); // Built-in Node module for UUIDs

// =========================================================
// 1. AUTOSUGGEST (Existing & Working)
// =========================================================
const autosuggestLocation = async (req, res) => {
  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({ message: "Query param 'term' is required" });
    }

    const url = `${process.env.ZENTRUM_AUTOSUGGEST_URL}/api/locations/LocationContent/autosuggest`;

    const response = await axios.get(url, {
      params: { term }, 
      headers: {
        apikey: process.env.ZENTRUM_API_KEY,
        "Content-Type": "application/json",
      },
    });

    return res.json(response.data);
  } catch (err) {
    console.error("Autosuggest error:", err.response?.data || err.message);
    return res.status(500).json({
      message: "Failed to fetch autosuggest locations",
      error: err.response?.data || err.message,
    });
  }
};

// =========================================================
// 2. INIT HOTEL SEARCH (Fixed Headers & Body)
// =========================================================
const initHotelSearch = async (req, res) => {
  try {
    const { destination, checkIn, checkOut, rooms, adults, kids } = req.body;

    // Helper: Format Date
    const format = (date) => new Date(date).toISOString().split('T')[0];

    // 1. Generate Security Headers
    const correlationId = crypto.randomUUID();
    const customerIp = "127.0.0.1";
    
    // 2. Get IDs from .env (Fallback to sandbox defaults if missing)
    const accountId = process.env.ZENTRUM_ACCOUNT_ID || "zentrum-demo-account";
    const channelId = process.env.ZENTRUM_CHANNEL_ID || "theobeglobal-sandbox";

    if (!destination || !destination.coordinates) {
      return res.status(400).json({ message: "Invalid destination: Missing coordinates" });
    }

    // 3. Prepare Payload (Matching Postman)
    const payload = {
      channelId: channelId,
      currency: "USD",
      culture: "en-US",
      checkIn: format(checkIn),
      checkOut: format(checkOut),
      occupancies: [
        {
          numOfAdults: parseInt(adults) || 2,
          numOfChildren: parseInt(kids) || 0,
          childAges: [] 
        }
      ],
      circularRegion: {
        centerLat: destination.coordinates.lat,
        centerLong: destination.coordinates.long,
        radiusInKm: 30
      },
      // Important: Add Search Location Details
      searchLocationDetails: {
        id: destination.id,
        name: destination.name,
        type: destination.type || "City",
        coordinates: destination.coordinates
      },
      nationality: "US",
      countryOfResidence: "US",
      destinationCountryCode: destination.country || "US",
      travelPurpose: "Leisure"
    };

    const url = `${process.env.ZENTRUM_SEARCH_URL}/availability/init`;

    console.log(`DEBUG: Init Search -> Account: ${accountId} | Channel: ${channelId}`);

    // 4. Call API with ALL Headers
    const response = await axios.post(url, payload, {
      headers: { 
        "apikey": process.env.ZENTRUM_API_KEY,
        "accountId": accountId,
        "channelId": channelId,
        "customer-ip": customerIp,
        "correlationId": correlationId,
        "Content-Type": "application/json"
      }
    });

    res.json(response.data); 

  } catch (error) {
    console.error("INIT search error:", error.response?.data || error.message);
    res.status(500).json({ 
      message: "Search init failed", 
      details: error.response?.data 
    });
  }
};

// =========================================================
// 3. GET SEARCH RESULTS (Fixed Content Fetch 400 Error)
// =========================================================
// =========================================================
// 3. GET SEARCH RESULTS (Fixed: Now includes Coordinates)
// =========================================================
const getHotelSearchResult = async (req, res) => {
  try {
    const { token } = req.params;

    // 1. Get Availability
    const searchUrl = `${process.env.ZENTRUM_SEARCH_URL}/availability/async/${token}/results`;
    const searchRes = await axios.get(searchUrl, {
      headers: { "apikey": process.env.ZENTRUM_API_KEY }
    });

    const availabilityData = searchRes.data;
    const hotelsFound = availabilityData.hotels || [];

    if (hotelsFound.length === 0) {
      return res.json(availabilityData);
    }

    // 2. Prepare for Content Fetching
    const hotelIds = hotelsFound.map(h => h.id);
    const accountId = process.env.ZENTRUM_ACCOUNT_ID || "zentrum-demo-account";
    const channelId = process.env.ZENTRUM_CHANNEL_ID || "theobeglobal-sandbox";

    // 3. Call Content API
    const contentPayload = {
      channelId: channelId,
      culture: "en-US",
      hotelIds: hotelIds, 
      contentFields: ["All"],
      includeAllProviders: true
    };

    const contentUrl = "https://nexus.prod.zentrumhub.com/api/content/hotelcontent/getHotelContent";
    let enrichedHotels = hotelsFound;

    try {
      const contentRes = await axios.post(contentUrl, contentPayload, {
        headers: { 
          "apikey": process.env.ZENTRUM_API_KEY,
          "accountId": accountId,
          "channelId": channelId,
          "Content-Type": "application/json",
          "customer-ip": "127.0.0.1",
          "correlationId": crypto.randomUUID()
        }
      });

      // 4. Merge Data
      const contentMap = {};
      if (contentRes.data.hotels) {
        contentRes.data.hotels.forEach(h => {
          contentMap[h.id] = h;
        });
      }

      enrichedHotels = hotelsFound.map(h => {
        const details = contentMap[h.id] || {};
        
        // ✅ CRITICAL FIX: Prioritize Content Coordinates, then Search GeoCode
        const coords = details.coordinates || h.geoCode || h.coordinates;

        return {
          ...h,
          name: details.name || h.name,
          heroImage: details.heroImage || (details.images ? details.images[0]?.url : null),
          address: details.contact?.address?.line1,
          city: details.contact?.address?.city?.name,
          starRating: details.starRating || h.starRating,
          coordinates: coords // <--- THIS IS THE FIX
        };
      });

    } catch (contentErr) {
      console.error("Content Fetch Warning:", contentErr.message);
    }

    // 6. Return Final Data
    res.json({
      ...availabilityData,
      hotels: enrichedHotels
    });

  } catch (error) {
    console.error("RESULT search error:", error.message);
    res.status(500).json({ message: "Search result failed" });
  }
}; 
// =========================================================
// 4. GET SINGLE HOTEL DETAILS (Content API)
// =========================================================
const getHotelDetails = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const url = "https://nexus.prod.zentrumhub.com/api/content/hotelcontent/getHotelContent";

    const payload = {
      channelId: process.env.ZENTRUM_CHANNEL_ID || "theobeglobal-sandbox",
      culture: "en-US",
      hotelIds: [hotelId], // Send just the one ID
      contentFields: ["All"] // Get description, facilities, images, etc.
    };

    const response = await axios.post(url, payload, {
      headers: {
        "apikey": process.env.ZENTRUM_API_KEY,
        "accountId": process.env.ZENTRUM_ACCOUNT_ID || "zentrum-demo-account",
        "Content-Type": "application/json",
        "customer-ip": "127.0.0.1",
        "correlationId": crypto.randomUUID()
      }
    });

    // Return just the first hotel object
    if (response.data.hotels && response.data.hotels.length > 0) {
      res.json(response.data.hotels[0]);
    } else {
      res.status(404).json({ message: "Hotel details not found" });
    }

  } catch (error) {
    console.error("Details Fetch Error:", error.message);
    res.status(500).json({ message: "Failed to fetch hotel details" });
  }
};
// =========================================================
// =========================================================
// =========================================================
// 5. GET ROOMS & RATES (Fixed: Handles 'geoCode' mismatch)
// =========================================================
const getRoomsAndRates = async (req, res) => {
  try {
    const { hotelId } = req.params;
    // Extract hotelLocation from the request body (Frontend might send it)
    const { checkIn, checkOut, adults, kids, hotelLocation } = req.body;

    const format = (date) => new Date(date).toISOString().split('T')[0];
    const accountId = process.env.ZENTRUM_ACCOUNT_ID || "zentrum-demo-account";
    const channelId = process.env.ZENTRUM_CHANNEL_ID || "theobeglobal-sandbox";
    const customerIp = "127.0.0.1";
    const correlationId = crypto.randomUUID();

    const commonHeaders = {
      "apikey": process.env.ZENTRUM_API_KEY,
      "accountId": accountId,
      "channelId": channelId,
      "customer-ip": customerIp,
      "correlationId": correlationId,
      "Content-Type": "application/json"
    };

    let centerLat, centerLong;

    // --- STEP 1: Determine Coordinates ---
    // Priority 1: Use coordinates from Frontend (if available)
    if (hotelLocation && (hotelLocation.lat || hotelLocation.latitude)) {
       console.log(`DEBUG: Using provided coordinates for ${hotelId}`);
       centerLat = hotelLocation.lat || hotelLocation.latitude;
       centerLong = hotelLocation.long || hotelLocation.longitude;
    } else {
       // Priority 2: Fetch from Content API
       console.log(`DEBUG: Fetching coordinates from API for ${hotelId}`);
       const contentUrl = "https://nexus.prod.zentrumhub.com/api/content/hotelcontent/getHotelContent";
       const contentRes = await axios.post(contentUrl, {
         channelId: channelId,
         culture: "en-US",
         hotelIds: [hotelId],
         contentFields: ["Basic"] 
       }, { headers: commonHeaders });

       const hotelData = contentRes.data.hotels?.[0];
       
       // ✅ FIX: Check for 'geoCode' OR 'coordinates'
       const locationObj = hotelData ? (hotelData.coordinates || hotelData.geoCode) : null;

       if (!locationObj) {
         console.error("DEBUG: Hotel coordinates/geoCode not found in Content API");
         return res.status(404).json({ message: "Hotel coordinates not found" });
       }
       centerLat = locationObj.lat;
       centerLong = locationObj.long;
    }

    // --- STEP 2: Initialize Search ---
    console.log(`DEBUG: Initializing Room Search around: ${centerLat}, ${centerLong}`);
    
    const initUrl = `${process.env.ZENTRUM_SEARCH_URL}/availability/init`;
    
    const searchPayload = {
      channelId: channelId,
      currency: "USD",
      culture: "en-US",
      checkIn: format(checkIn),
      checkOut: format(checkOut),
      occupancies: [{
        numOfAdults: parseInt(adults) || 2,
        numOfChildren: parseInt(kids) || 0,
        childAges: []
      }],
      circularRegion: {
        centerLat: centerLat,
        centerLong: centerLong,
        radiusInKm: 1 
      },
      filter: { hotelIds: [hotelId] }, // Filter for this specific hotel
      nationality: "US",
      countryOfResidence: "US",
      destinationCountryCode: "US",
      travelPurpose: "Leisure"
    };

    const initRes = await axios.post(initUrl, searchPayload, { headers: commonHeaders });
    const token = initRes.data.token;
    
    console.log("DEBUG: Room Search Token:", token);

    // --- STEP 3: Get Rooms ---
    // Allow a brief moment for the search to register
    await new Promise(r => setTimeout(r, 1000));

    const roomsUrl = `${process.env.ZENTRUM_SEARCH_URL}/${hotelId}/roomsandrates/${token}`;
    const roomsRes = await axios.post(roomsUrl, { "searchSpecificProviders": false }, { headers: commonHeaders });

    // Log success
    const roomCount = roomsRes.data?.hotel?.rooms?.length || roomsRes.data?.hotel?.recommendations?.length || 0;
    console.log(`DEBUG: Found ${roomCount} rooms`);

    res.json(roomsRes.data);

  } catch (error) {
    console.error("Rooms Fetch Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch rooms", details: error.response?.data });
  }
};
// Export it
module.exports = {
  autosuggestLocation,
  initHotelSearch,
  getHotelSearchResult,
  getHotelDetails,
  getRoomsAndRates // <--- Ensure this is exported
};