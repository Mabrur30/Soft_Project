import api from "./axios";

export const bookingsAPI = {
  // GET /components – fetch all components
  getComponents: (params = {}) => api.get("/components", { params }),

  // GET /components/categories – fetch all categories
  getCategories: () => api.get("/components/categories"),

  // GET /bookings/my – get current user's bookings
  getMyBookings: () => api.get("/bookings/my"),

  // GET /bookings/:bookingId – get booking by ID
  getBookingById: (bookingId) => api.get(`/bookings/${bookingId}`),

  // POST /bookings – create new booking
  createBooking: (payload) => api.post("/bookings", payload),

  // PATCH /bookings/:id/return – mark booking as returned
  returnBooking: (bookingId) => api.patch(`/bookings/${bookingId}/return`),

  // DELETE /bookings/:id – cancel/delete booking
  cancelBooking: (bookingId) => api.delete(`/bookings/${bookingId}`),
};
