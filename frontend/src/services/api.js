import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("nabha_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem("nabha_token");
        window.location.href = "/login";
        return Promise.reject(
          new Error("Session expired. Please login again.")
        );
      }

      if (status === 403) {
        return Promise.reject(new Error("Access denied"));
      }

      if (status === 404) {
        return Promise.reject(new Error("Resource not found"));
      }

      if (status >= 500) {
        return Promise.reject(
          new Error("Server error. Please try again later.")
        );
      }

      // Return specific error message from server
      return Promise.reject(new Error(data?.message || "An error occurred"));
    } else if (error.request) {
      // Network error
      return Promise.reject(
        new Error("Network error. Please check your connection.")
      );
    } else {
      // Something else happened
      return Promise.reject(
        new Error(error.message || "An unexpected error occurred")
      );
    }
  }
);

export default api;
