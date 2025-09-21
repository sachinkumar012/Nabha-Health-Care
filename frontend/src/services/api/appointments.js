import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const appointmentsAPI = {
  // Get all appointments for current user
  getAppointments: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error.response?.data || { message: "Failed to fetch appointments" };
    }
  },

  // Get single appointment by ID
  getAppointment: async (appointmentId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/${appointmentId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching appointment:", error);
      throw error.response?.data || { message: "Failed to fetch appointment" };
    }
  },

  // Create new appointment
  createAppointment: async (appointmentData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/appointments`,
        appointmentData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error.response?.data || { message: "Failed to create appointment" };
    }
  },

  // Update appointment
  updateAppointment: async (appointmentId, updateData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/appointments/${appointmentId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw error.response?.data || { message: "Failed to update appointment" };
    }
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId, reason = "") => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/appointments/${appointmentId}/cancel`,
        { reason }
      );
      return response.data;
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      throw error.response?.data || { message: "Failed to cancel appointment" };
    }
  },

  // Reschedule appointment
  rescheduleAppointment: async (appointmentId, newDateTime) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/appointments/${appointmentId}/reschedule`,
        {
          dateTime: newDateTime,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      throw (
        error.response?.data || { message: "Failed to reschedule appointment" }
      );
    }
  },

  // Get available time slots for a doctor
  getAvailableSlots: async (doctorId, date) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/available-slots`,
        {
          params: { doctorId, date },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching available slots:", error);
      throw (
        error.response?.data || { message: "Failed to fetch available slots" }
      );
    }
  },

  // Get doctors list
  getDoctors: async (specialization = "") => {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctors`, {
        params: specialization ? { specialization } : {},
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching doctors:", error);
      throw error.response?.data || { message: "Failed to fetch doctors" };
    }
  },

  // Get doctor details
  getDoctor: async (doctorId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctors/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      throw (
        error.response?.data || { message: "Failed to fetch doctor details" }
      );
    }
  },

  // Rate appointment
  rateAppointment: async (appointmentId, rating, review = "") => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/appointments/${appointmentId}/rate`,
        {
          rating,
          review,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error rating appointment:", error);
      throw error.response?.data || { message: "Failed to rate appointment" };
    }
  },

  // Get appointment history
  getAppointmentHistory: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments/history`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching appointment history:", error);
      throw (
        error.response?.data || {
          message: "Failed to fetch appointment history",
        }
      );
    }
  },

  // Send prescription
  sendPrescription: async (appointmentId, prescription) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/appointments/${appointmentId}/prescription`,
        {
          prescription,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending prescription:", error);
      throw error.response?.data || { message: "Failed to send prescription" };
    }
  },

  // Get upcoming appointments count
  getUpcomingCount: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/upcoming-count`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching upcoming appointments count:", error);
      throw (
        error.response?.data || {
          message: "Failed to fetch upcoming appointments count",
        }
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
    avatar: null,
    location: "Nabha",
    availability: ["09:00-17:00"],
  },
  {
    _id: "2",
    name: "Dr. Priya Sharma",
    specialization: "Pediatrics",
    qualification: "MBBS, DCH",
    experience: 12,
    rating: 4.9,
    avatar: null,
    location: "Nabha",
    availability: ["10:00-16:00"],
  },
];

const mockAppointments = [
  {
    _id: "1",
    doctor: mockDoctors[0],
    patient: { name: "Current User", phone: "+91 98765 43210" },
    dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    status: "scheduled",
    type: "consultation",
    reason: "Regular checkup",
    createdAt: new Date().toISOString(),
  },
];

// Mock API for development
export const mockAppointmentsAPI = {
  getAppointments: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, data: mockAppointments };
  },

  getAppointment: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const appointment = mockAppointments.find((apt) => apt._id === id);
    return { success: true, data: appointment };
  },

  createAppointment: async (appointmentData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newAppointment = {
      _id: (mockAppointments.length + 1).toString(),
      ...appointmentData,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };
    mockAppointments.push(newAppointment);
    return { success: true, data: newAppointment };
  },

  updateAppointment: async (id, updateData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, message: "Appointment updated successfully" };
  },

  cancelAppointment: async (id, reason) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, message: "Appointment cancelled successfully" };
  },

  rescheduleAppointment: async (id, newDateTime) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, message: "Appointment rescheduled successfully" };
  },

  getAvailableSlots: async (doctorId, date) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      data: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
    };
  },

  getDoctors: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { success: true, data: mockDoctors };
  },

  getDoctor: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const doctor = mockDoctors.find((doc) => doc._id === id);
    return { success: true, data: doctor };
  },

  rateAppointment: async (id, rating, review) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, message: "Rating submitted successfully" };
  },

  getAppointmentHistory: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { success: true, data: [] };
  },

  sendPrescription: async (id, prescription) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { success: true, message: "Prescription sent successfully" };
  },

  getUpcomingCount: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { success: true, data: { count: mockAppointments.length } };
  },
};

// Use mock in development or when backend is not available
const isDevelopment = process.env.NODE_ENV === "development";
export default isDevelopment ? mockAppointmentsAPI : appointmentsAPI;
