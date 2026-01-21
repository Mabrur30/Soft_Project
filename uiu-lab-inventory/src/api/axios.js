// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
  withCredentials: true,
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to home
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
