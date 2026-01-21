// src/api/auth.js
import axios from "axios";

const authApi = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000,
  withCredentials: true,
});

export const authAPI = {
  // POST /login – user login
  login: (email, password) => authApi.post("/login", { email, password }),

  // Logout (client-side only - remove token)
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return Promise.resolve();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  // Get current user info from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },
};
