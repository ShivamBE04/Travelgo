import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import HotelList from "./HotelList";
import HotelDetails from "./HotelDetails"; // We will create this next
import Footer from "./components/Footer"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/hotels" element={<HotelList />} />
       <Route path="/hotel/:id" element={<HotelDetails />} />
      </Routes>
         <Footer />
    </Router>
    
  );
}

export default App;
