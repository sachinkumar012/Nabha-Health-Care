import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const doctorsAPI = {
  // Get all doctors
  getDoctors: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctors`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching doctors:", error);
      throw error.response?.data || { message: "Failed to fetch doctors" };
    }
  },

  // Get doctor by ID
  getDoctor: async (doctorId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctors/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching doctor:", error);
      throw error.response?.data || { message: "Failed to fetch doctor" };
    }
  },

  // Search doctors
  searchDoctors: async (query, filters = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctors/search`, {
        params: { q: query, ...filters },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching doctors:", error);
      throw error.response?.data || { message: "Failed to search doctors" };
    }
  },

  // Get doctors by specialization
  getDoctorsBySpecialization: async (specialization) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/doctors/specialization/${specialization}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching doctors by specialization:", error);
      throw error.response?.data || { message: "Failed to fetch doctors" };
    }
  },

  // Get doctor's availability
  getDoctorAvailability: async (doctorId, date) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/doctors/${doctorId}/availability`,
        {
          params: { date },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching doctor availability:", error);
      throw error.response?.data || { message: "Failed to fetch availability" };
    }
  },

  // Get doctor's schedule
  getDoctorSchedule: async (doctorId, startDate, endDate) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/doctors/${doctorId}/schedule`,
        {
          params: { startDate, endDate },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching doctor schedule:", error);
      throw error.response?.data || { message: "Failed to fetch schedule" };
    }
  },

  // Get doctor reviews
  getDoctorReviews: async (doctorId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/doctors/${doctorId}/reviews`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching doctor reviews:", error);
      throw error.response?.data || { message: "Failed to fetch reviews" };
    }
  },

  // Get specializations
  getSpecializations: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/doctors/specializations`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching specializations:", error);
      throw (
        error.response?.data || { message: "Failed to fetch specializations" }
      );
    }
  },

  // Get featured doctors
  getFeaturedDoctors: async (limit = 6) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctors/featured`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching featured doctors:", error);
      throw (
        error.response?.data || { message: "Failed to fetch featured doctors" }
      );
    }
  },

  // Book consultation
  bookConsultation: async (doctorId, appointmentData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/doctors/${doctorId}/book`,
        appointmentData
      );
      return response.data;
    } catch (error) {
      console.error("Error booking consultation:", error);
      throw error.response?.data || { message: "Failed to book consultation" };
    }
  },

  // Get doctor statistics
  getDoctorStats: async (doctorId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/doctors/${doctorId}/stats`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching doctor stats:", error);
      throw (
        error.response?.data || { message: "Failed to fetch doctor statistics" }
      );
    }
  },
};

// Mock data for development
const mockDoctors = [
  {
    _id: "1",
    name: "Dr. Rajesh Kumar",
    specialization: "General Medicine",
    qualification: "MBBS, MD",
    experience: 15,
    rating: 4.8,
    reviewsCount: 127,
    consultationFee: 500,
    languages: ["Hindi", "English", "Punjabi"],
    location: "Nabha Civil Hospital",
    avatar: null,
    availability: {
      monday: "09:00-17:00",
      tuesday: "09:00-17:00",
      wednesday: "09:00-17:00",
      thursday: "09:00-17:00",
      friday: "09:00-17:00",
      saturday: "09:00-13:00",
      sunday: "Closed",
    },
    bio: "Experienced general physician with 15+ years of practice in rural healthcare.",
    isOnline: true,
    nextAvailable: "2025-09-22T09:00:00.000Z",
  },
  {
    _id: "2",
    name: "Dr. Priya Sharma",
    specialization: "Pediatrics",
    qualification: "MBBS, DCH",
    experience: 12,
    rating: 4.9,
    reviewsCount: 89,
    consultationFee: 600,
    languages: ["Hindi", "English", "Punjabi"],
    location: "Nabha Child Care Center",
    avatar: null,
    availability: {
      monday: "10:00-16:00",
      tuesday: "10:00-16:00",
      wednesday: "10:00-16:00",
      thursday: "10:00-16:00",
      friday: "10:00-16:00",
      saturday: "10:00-14:00",
      sunday: "Closed",
    },
    bio: "Specialized pediatrician focusing on child healthcare and development.",
    isOnline: false,
    nextAvailable: "2025-09-22T10:00:00.000Z",
  },
  {
    _id: "3",
    name: "Dr. Amit Singh",
    specialization: "Cardiology",
    qualification: "MBBS, DM Cardiology",
    experience: 18,
    rating: 4.7,
    reviewsCount: 156,
    consultationFee: 800,
    languages: ["Hindi", "English"],
    location: "Heart Care Clinic, Nabha",
    avatar: null,
    availability: {
      monday: "14:00-18:00",
      tuesday: "14:00-18:00",
      wednesday: "14:00-18:00",
      thursday: "14:00-18:00",
      friday: "14:00-18:00",
      saturday: "Closed",
      sunday: "Closed",
    },
    bio: "Expert cardiologist specializing in heart disease prevention and treatment.",
    isOnline: true,
    nextAvailable: "2025-09-22T14:00:00.000Z",
  },
];

const mockSpecializations = [
  { id: 1, name: "General Medicine", count: 5 },
  { id: 2, name: "Pediatrics", count: 3 },
  { id: 3, name: "Cardiology", count: 2 },
  { id: 4, name: "Orthopedics", count: 2 },
  { id: 5, name: "Dermatology", count: 1 },
  { id: 6, name: "Gynecology", count: 2 },
];

// Mock API for development
export const mockDoctorsAPI = {
  getDoctors: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    let doctors = [...mockDoctors];

    if (params.specialization) {
      doctors = doctors.filter((doc) =>
        doc.specialization
          .toLowerCase()
          .includes(params.specialization.toLowerCase())
      );
    }

    return { success: true, data: doctors, count: doctors.length };
  },

  getDoctor: async (doctorId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const doctor = mockDoctors.find((doc) => doc._id === doctorId);
    return { success: true, data: doctor };
  },

  searchDoctors: async (query) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const results = mockDoctors.filter(
      (doc) =>
        doc.name.toLowerCase().includes(query.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(query.toLowerCase())
    );
    return { success: true, data: results };
  },

  getDoctorsBySpecialization: async (specialization) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const doctors = mockDoctors.filter(
      (doc) => doc.specialization.toLowerCase() === specialization.toLowerCase()
    );
    return { success: true, data: doctors };
  },

  getDoctorAvailability: async (doctorId, date) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      data: {
        availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      },
    };
  },

  getDoctorSchedule: async (doctorId) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { success: true, data: { schedule: [] } };
  },

  getDoctorReviews: async (doctorId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      data: [
        {
          _id: "1",
          patientName: "Anonymous",
          rating: 5,
          review: "Excellent doctor, very caring and professional.",
          date: new Date().toISOString(),
        },
      ],
    };
  },

  getSpecializations: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true, data: mockSpecializations };
  },

  getFeaturedDoctors: async (limit = 6) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { success: true, data: mockDoctors.slice(0, limit) };
  },

  bookConsultation: async (doctorId, appointmentData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true, message: "Consultation booked successfully" };
  },

  getDoctorStats: async (doctorId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      data: {
        totalConsultations: 245,
        averageRating: 4.8,
        totalReviews: 127,
        responseTime: "< 1 hour",
      },
    };
  },
};

// Use mock in development or when backend is not available
const isDevelopment = process.env.NODE_ENV === "development";
export default isDevelopment ? mockDoctorsAPI : doctorsAPI;
