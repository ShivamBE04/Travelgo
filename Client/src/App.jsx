import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import HotelList from "./HotelList";
import HotelDetails from "./HotelDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/hotels" element={<HotelList />} />
        <Route path="/details" element={<HotelDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
