const axios = require("axios");
const crypto = require("crypto");

// 1. AUTOSUGGEST
const autosuggestLocation = async (req, res) => {
  try {
    const { term } = req.query;
    if (!term) return res.status(400).json({ message: "Query param 'term' is required" });

    const url = `${process.env.ZENTRUM_AUTOSUGGEST_URL}/api/locations/LocationContent/autosuggest`;
    
    const response = await axios.get(url, {
      params: { term }, 
      headers: {
        apikey: process.env.ZENTRUM_API_KEY,
        "Content-Type": "application/json",
      },
    });
    
    // Helper: Format response for frontend
    const rawList = response.data.locationSuggestions || [];
    const formattedList = rawList.map(item => ({
      id: item.id,
      name: item.name,
      fullName: item.fullName,
      type: item.type, // 'Hotel', 'City', etc.
      country: item.country,
      coordinates: item.coordinates,
      cityId: item.cityId,
      hotelId: item.hotelId
    }));

    return res.json({ locationSuggestions: formattedList });
  } catch (err) {
    console.error("Autosuggest error:", err.message);
    return res.status(500).json({ message: "Autosuggest failed" });
  }
};

// 2. INIT SEARCH (List of Hotels)
const initHotelSearch = async (req, res) => {
  try {
    const { destination, checkIn, checkOut, rooms, adults, kids } = req.body;
    const format = (date) => new Date(date).toISOString().split('T')[0];

    const accountId = process.env.ZENTRUM_ACCOUNT_ID || "zentrum-demo-account";
    const channelId = process.env.ZENTRUM_CHANNEL_ID || "theobeglobal-sandbox";
    const correlationId = crypto.randomUUID();

    if (!destination || !destination.coordinates) {
      return res.status(400).json({ message: "Invalid destination coordinates" });
    }

    // Prepare Search Payload
    const payload = {
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
        centerLat: destination.coordinates.lat,
        centerLong: destination.coordinates.long,
        radiusInKm: 30 // Search 30km radius around the point (City OR Hotel)
      },
      nationality: "US",
      countryOfResidence: "US",
      destinationCountryCode: destination.country || "US",
      travelPurpose: "Leisure"
    };

    const url = `${process.env.ZENTRUM_SEARCH_URL}/availability/init`;
    const response = await axios.post(url, payload, {
      headers: { 
        "apikey": process.env.ZENTRUM_API_KEY,
        "accountId": accountId,
        "channelId": channelId,
        "customer-ip": "127.0.0.1",
        "correlationId": correlationId,
        "Content-Type": "application/json"
      }
    });

    res.json(response.data); 
  } catch (error) {
    console.error("INIT error:", error.message);
    res.status(500).json({ message: "Search init failed" });
  }
};

// 3. GET SEARCH RESULTS
const getHotelSearchResult = async (req, res) => {
  try {
    const { token } = req.params;
    const accountId = process.env.ZENTRUM_ACCOUNT_ID || "zentrum-demo-account";
    const channelId = process.env.ZENTRUM_CHANNEL_ID || "theobeglobal-sandbox";

    // A. Availability
    const searchUrl = `${process.env.ZENTRUM_SEARCH_URL}/availability/async/${token}/results`;
    const searchRes = await axios.get(searchUrl, { headers: { "apikey": process.env.ZENTRUM_API_KEY } });

    const availabilityData = searchRes.data;
    const hotelsFound = availabilityData.hotels || [];

    if (hotelsFound.length === 0) return res.json(availabilityData);

    // B. Content (Images/Names)
    const hotelIds = hotelsFound.map(h => h.id);
    const contentUrl = "https://nexus.prod.zentrumhub.com/api/content/hotelcontent/getHotelContent";
    let enrichedHotels = hotelsFound;

    try {
      const contentRes = await axios.post(contentUrl, {
        channelId: channelId,
        culture: "en-US",
        hotelIds: hotelIds, 
        contentFields: ["All"],
        includeAllProviders: true
      }, {
        headers: { 
          "apikey": process.env.ZENTRUM_API_KEY,
          "accountId": accountId,
          "Content-Type": "application/json",
          "customer-ip": "127.0.0.1",
          "correlationId": crypto.randomUUID()
        }
      });

      const contentMap = {};
      if (contentRes.data.hotels) {
        contentRes.data.hotels.forEach(h => { contentMap[h.id] = h; });
      }

      enrichedHotels = hotelsFound.map(h => {
        const details = contentMap[h.id] || {};
        return {
          ...h,
          name: details.name || h.name,
          heroImage: details.heroImage || (details.images ? details.images[0]?.url : null),
          address: details.contact?.address?.line1,
          city: details.contact?.address?.city?.name,
          starRating: details.starRating || h.starRating,
          // Pass coordinates to frontend
          coordinates: details.coordinates || h.geoCode || h.coordinates 
        };
      });

    } catch (contentErr) {
      console.error("Content Fetch Warning:", contentErr.message);
    }

    res.json({ ...availabilityData, hotels: enrichedHotels });
  } catch (error) {
    console.error("RESULT search error:", error.message);
    res.status(500).json({ message: "Search result failed" });
  }
};

// 4. GET SINGLE HOTEL DETAILS
const getHotelDetails = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const accountId = process.env.ZENTRUM_ACCOUNT_ID || "zentrum-demo-account";
    const channelId = process.env.ZENTRUM_CHANNEL_ID || "theobeglobal-sandbox";
    
    const url = "https://nexus.prod.zentrumhub.com/api/content/hotelcontent/getHotelContent";
    const response = await axios.post(url, {
      channelId: channelId,
      culture: "en-US",
      hotelIds: [hotelId],
      contentFields: ["All"]
    }, {
      headers: {
        "apikey": process.env.ZENTRUM_API_KEY,
        "accountId": accountId,
        "Content-Type": "application/json",
        "customer-ip": "127.0.0.1",
        "correlationId": crypto.randomUUID()
      }
    });

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

// 5. GET ROOMS & RATES
const getRoomsAndRates = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { checkIn, checkOut, adults, kids, hotelLocation } = req.body;
    const format = (date) => new Date(date).toISOString().split('T')[0];
    const accountId = process.env.ZENTRUM_ACCOUNT_ID || "zentrum-demo-account";
    const channelId = process.env.ZENTRUM_CHANNEL_ID || "theobeglobal-sandbox";
    const correlationId = crypto.randomUUID();

    const commonHeaders = {
      "apikey": process.env.ZENTRUM_API_KEY,
      "accountId": accountId,
      "channelId": channelId,
      "customer-ip": "127.0.0.1",
      "correlationId": correlationId,
      "Content-Type": "application/json"
    };

    let centerLat, centerLong;

    // Use Frontend coords if available, otherwise fetch
    if (hotelLocation && (hotelLocation.lat || hotelLocation.latitude)) {
       centerLat = hotelLocation.lat || hotelLocation.latitude;
       centerLong = hotelLocation.long || hotelLocation.longitude;
    } else {
       const contentUrl = "https://nexus.prod.zentrumhub.com/api/content/hotelcontent/getHotelContent";
       const contentRes = await axios.post(contentUrl, {
         channelId: channelId, culture: "en-US", hotelIds: [hotelId], contentFields: ["Basic"]
       }, { headers: commonHeaders });

       const hotelData = contentRes.data.hotels?.[0];
       const locationObj = hotelData ? (hotelData.coordinates || hotelData.geoCode) : null;

       if (!locationObj) return res.status(404).json({ message: "Hotel coordinates not found" });
       centerLat = locationObj.lat;
       centerLong = locationObj.long;
    }

    // Init Search for this specific hotel context
    const initUrl = `${process.env.ZENTRUM_SEARCH_URL}/availability/init`;
    const initRes = await axios.post(initUrl, {
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
      filter: { hotelIds: [hotelId] },
      nationality: "US",
      countryOfResidence: "US",
      destinationCountryCode: "US",
      travelPurpose: "Leisure"
    }, { headers: commonHeaders });

    const token = initRes.data.token;
    await new Promise(r => setTimeout(r, 1000)); // Brief wait

    const roomsUrl = `${process.env.ZENTRUM_SEARCH_URL}/${hotelId}/roomsandrates/${token}`;
    const roomsRes = await axios.post(roomsUrl, { "searchSpecificProviders": false }, { headers: commonHeaders });

    res.json(roomsRes.data);

  } catch (error) {
    console.error("Rooms Fetch Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
};

module.exports = {
  autosuggestLocation,
  initHotelSearch,
  getHotelSearchResult,
  getHotelDetails,
  getRoomsAndRates
};