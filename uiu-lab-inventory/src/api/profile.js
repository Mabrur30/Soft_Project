// src/api/profile.js
import api from "./axios";

export const profileAPI = {
  // GET /users/profile – fetch current user profile
  getProfile: () => api.get("/users/profile"),

  // PUT /users/profile – update profile info
  updateProfile: (payload) => api.put("/users/profile", payload),

  // PUT /users/change-password – change password
  changePassword: (currentPassword, newPassword) =>
    api.put("/users/change-password", { currentPassword, newPassword }),
};
