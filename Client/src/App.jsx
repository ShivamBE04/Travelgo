import React, { useState } from 'react';
import './App.css';

// Import all your pages
import Dashboard from "./dashboard";
import HotelList from "./HotelList";
import HotelDetails from "./HotelDetails";

function App() {
  // State to toggle between pages
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Helper to render the correct component
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'list':
        return <HotelList />;
      case 'details':
        return <HotelDetails />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div>
      {/* --- DEV NAVIGATION BAR (Centered & Simple White Buttons) --- */}
      <div style={{
        position: 'fixed', 
        top: 0, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        zIndex: 99999, 
        background: 'rgba(0,0,0,0.8)', 
        padding: '10px 20px', 
        borderRadius: '0 0 10px 10px',
        display: 'flex',
        gap: '15px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(5px)'
      }}>
        <button 
          onClick={() => setCurrentPage('dashboard')} 
          style={{
            cursor: 'pointer', 
            background: 'white', 
            color: 'black',
            border: 'none', 
            padding: '8px 15px', 
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          1. Dashboard
        </button>
        <button 
          onClick={() => setCurrentPage('list')} 
          style={{
            cursor: 'pointer', 
            background: 'white', 
            color: 'black',
            border: 'none', 
            padding: '8px 15px', 
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          2. Hotel List
        </button>
        <button 
          onClick={() => setCurrentPage('details')} 
          style={{
            cursor: 'pointer', 
            background: 'white', 
            color: 'black',
            border: 'none', 
            padding: '8px 15px', 
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          3. Hotel Details
        </button>
      </div>

      {/* Render the active page */}
      {renderPage()}
    </div>
  );
}

export default App;