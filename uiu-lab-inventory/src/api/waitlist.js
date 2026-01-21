// src/api/waitlist.js
import api from "./axios";

export const waitlistAPI = {
  // GET /waitlist/my – get current user's waitlist entries
  getMyWaitlist: () => api.get("/waitlist/my"),

  // GET /waitlist/:waitlistId – get waitlist entry by ID
  getWaitlistById: (waitlistId) => api.get(`/waitlist/${waitlistId}`),

  // POST /waitlist – add to waitlist
  addToWaitlist: (payload) => api.post("/waitlist", payload),

  // PUT /waitlist/:waitlistId – update waitlist entry
  updateWaitlist: (waitlistId, payload) =>
    api.put(`/waitlist/${waitlistId}`, payload),

  // PATCH /waitlist/:waitlistId/cancel – cancel waitlist entry
  cancelWaitlist: (waitlistId) => api.patch(`/waitlist/${waitlistId}/cancel`),
};
