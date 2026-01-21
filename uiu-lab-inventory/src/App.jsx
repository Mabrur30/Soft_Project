import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/common/Toast.jsx";
import HomePage from "./pages/HomePage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import PenaltiesPage from "./pages/PenaltiesPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import BookingRequests from "./pages/admin/BookingRequests.jsx";
import StockManagement from "./pages/admin/StockManagement.jsx";
import PenaltyManagement from "./pages/admin/PenaltyManagement.jsx";
import StudentManagement from "./pages/admin/StudentManagement.jsx";
import BookingHistory from "./pages/admin/BookingHistory.jsx";
import Components from "./pages/admin/Components.jsx";
import AddComponent from "./pages/admin/AddComponent.jsx";
import EditComponent from "./pages/admin/EditComponent.jsx";
import Analytics from "./pages/admin/Analytics.jsx";
export default function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bookings" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/penalties" element={<PenaltiesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/bookings" element={<BookingRequests />} />
          <Route path="/admin/stock" element={<StockManagement />} />
          <Route path="/admin/penalties" element={<PenaltyManagement />} />
          <Route path="/admin/students" element={<StudentManagement />} />
          <Route path="/admin/history" element={<BookingHistory />} />
          <Route path="/admin/components" element={<Components />} />
          <Route path="/admin/add-component" element={<AddComponent />} />
          <Route path="/admin/edit-component/:id" element={<EditComponent />} />
          <Route path="/admin/analytics" element={<Analytics />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
