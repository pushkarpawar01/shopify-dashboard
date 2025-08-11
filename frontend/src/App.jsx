import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import OrderDetails from './pages/OrderDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
