import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Set up axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const authAPI = {
  // User registration
  register: async (userData) => {
    try {
      const response = await axios.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error.response?.data || { message: "Registration failed" };
    }
  },

  // User login
  login: async (credentials) => {
    try {
      const response = await axios.post("/auth/login", credentials);

      if (response.data.success && response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error.response?.data || { message: "Login failed" };
    }
  },

  // User logout
  logout: async () => {
    try {
      await axios.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await axios.get("/auth/profile");
      return response.data;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error.response?.data || { message: "Failed to fetch profile" };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await axios.put("/auth/profile", profileData);

      if (response.data.success && response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error.response?.data || { message: "Profile update failed" };
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await axios.put("/auth/change-password", passwordData);
      return response.data;
    } catch (error) {
      console.error("Change password error:", error);
      throw error.response?.data || { message: "Password change failed" };
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await axios.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error.response?.data || { message: "Failed to send reset email" };
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axios.post("/auth/reset-password", {
        token,
        password: newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error.response?.data || { message: "Password reset failed" };
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await axios.post("/auth/verify-email", { token });
      return response.data;
    } catch (error) {
      console.error("Email verification error:", error);
      throw error.response?.data || { message: "Email verification failed" };
    }
  },

  // Resend verification email
  resendVerificationEmail: async () => {
    try {
      const response = await axios.post("/auth/resend-verification");
      return response.data;
    } catch (error) {
      console.error("Resend verification error:", error);
      throw (
        error.response?.data || {
          message: "Failed to resend verification email",
        }
      );
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");
    return !!(token && user);
  },

  // Get stored user data
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },

  // Get stored auth token
  getAuthToken: () => {
    return localStorage.getItem("authToken");
  },

  // Clear auth data
  clearAuthData: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },
};

export default authAPI;
