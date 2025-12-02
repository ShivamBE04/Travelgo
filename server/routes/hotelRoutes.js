const express = require("express");
const { 
  autosuggestLocation, 
  initHotelSearch, 
  getHotelSearchResult,
  getHotelDetails,  // <--- Make sure this is imported
  getRoomsAndRates  // <--- Make sure this is imported
} = require("../controllers/hotelController.js");

const router = express.Router();

// --- Existing Routes ---
router.get("/autosuggest", autosuggestLocation);
router.post("/search/init", initHotelSearch);
router.get("/search/result/:token", getHotelSearchResult);

// --- ✅ NEW ROUTES (These were missing/not active) ---
router.get("/content/:hotelId", getHotelDetails);
router.post("/rooms/:hotelId", getRoomsAndRates);

module.exports = router;