const express = require("express");
// 1. IMPORT the new functions here
const { 
  autosuggestLocation, 
  initHotelSearch, 
  getHotelSearchResult ,
   getHotelDetails,
   getRoomsAndRates
} = require("../controllers/hotelController.js");

const router = express.Router();

// --- Define your routes below ---

// 1. Autosuggest (Existing)
router.get("/autosuggest", autosuggestLocation);

// 2. Initialize Search (POST)
// This matches: axios.post(".../api/hotels/search/init", ...)
router.post("/search/init", initHotelSearch);

// 3. Get Search Results (GET)
// This matches: axios.get(".../api/hotels/search/result/{token}")
router.get("/search/result/:token", getHotelSearchResult);
router.get("/content/:hotelId", getHotelDetails); // New Route
router.post("/rooms/:hotelId", getRoomsAndRates); // POST because we send dates

module.exports = router;