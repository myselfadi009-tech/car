import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AdminRoute from './routes/AdminRoute.jsx';
import IntroScreen from './components/IntroScreen.jsx';

import HomePage from './pages/home/HomePage.jsx';
import CarsPage from './pages/cars/CarsPage.jsx';
import CarDetailPage from './pages/cars/CarDetailPage.jsx';
import BookingPage from './pages/booking/BookingPage.jsx';
import BookingSuccessPage from './pages/booking/BookingSuccessPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ContactPage from './pages/contact/ContactPage.jsx';

import UserDashboard from './pages/dashboard/UserDashboard.jsx';
import UserBookings from './pages/dashboard/UserBookings.jsx';
import UserWishlist from './pages/dashboard/UserWishlist.jsx';
import UserProfile from './pages/dashboard/UserProfile.jsx';
import UserReviews from './pages/dashboard/UserReviews.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminCars from './pages/admin/AdminCars.jsx';
import AdminBookings from './pages/admin/AdminBookings.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminPayments from './pages/admin/AdminPayments.jsx';
import AdminContacts from './pages/admin/AdminContacts.jsx';
import AdminCoupons from './pages/admin/AdminCoupons.jsx';

import { fetchCurrentUser } from './redux/slices/authSlice.js';

function App() {
  const dispatch = useDispatch();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => { dispatch(fetchCurrentUser()); }, [dispatch]);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <>
      <AnimatePresence>
        {showIntro && <IntroScreen onComplete={handleIntroComplete} />}
      </AnimatePresence>

      <Routes>
        {/* Auth pages — no navbar/footer */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/cars/:id" element={<CarDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/booking/:carId" element={<BookingPage />} />
            <Route path="/booking/success/:bookingId" element={<BookingSuccessPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/dashboard/bookings" element={<UserBookings />} />
            <Route path="/dashboard/wishlist" element={<UserWishlist />} />
            <Route path="/dashboard/profile" element={<UserProfile />} />
            <Route path="/dashboard/reviews" element={<UserReviews />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/cars" element={<AdminCars />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/contacts" element={<AdminContacts />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
