import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import VehicleDetail from './pages/VehicleDetail';
import VehicleList from './pages/VehicleList';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import HowToUse from './pages/HowToUse';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Stations from './pages/Stations';
import Wallet from './pages/Wallet';
import Overview from './pages/admin/Overview';
import Users from './pages/admin/Users';
import Vehicles from './pages/admin/Vehicles';
import AdminStations from './pages/admin/AdminStations';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest / User Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="about" element={<About />} />
          <Route path="how-to-use" element={<HowToUse />} />
          <Route path="forgot-password" element={<div className="container mt-8">Quên mật khẩu (Flow)</div>} />
          
          <Route path="vehicles" element={<VehicleList />} />
          <Route path="vehicles/:id" element={<VehicleDetail />} />
          <Route path="book/:id" element={<Booking />} />
          
          <Route path="profile" element={<Profile />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="stations" element={<Stations />} />
          <Route path="wallet" element={<Wallet />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="users" element={<Users />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="stations" element={<AdminStations />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
