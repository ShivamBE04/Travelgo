import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/hotels",
});

// ✅ Named export – required for Dashboard.jsx
export const fetchLocationSuggestions = async (term) => {
  if (!term || term.length < 2) return [];

  const res = await API.get("/autosuggest", {
    params: { term },
  });

  return res.data;
};
