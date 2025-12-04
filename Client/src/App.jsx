import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import HotelList from "./pages/HotelList.jsx";
import HotelDetails from "./pages/HotelDetails.jsx"; // We will create this next
import Footer from "./components/Footer"; 
import Checkout from "./pages/Checkout.jsx";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/hotels" element={<HotelList />} />
       <Route path="/hotel/:id" element={<HotelDetails />} />
      <Route path="/checkout" element={<Checkout />} />

      </Routes>
         <Footer />
    </Router>
    
  );
}

export default App;
