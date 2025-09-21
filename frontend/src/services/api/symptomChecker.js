import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Symptom checker API endpoints
const symptomCheckerAPI = {
  // Check symptoms and get diagnosis
  checkSymptoms: async (symptoms, patientData = {}) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/symptom-checker/check`,
        {
          symptoms,
          patientData,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error checking symptoms:", error);
      throw error.response?.data || { message: "Failed to check symptoms" };
    }
  },

  // Get common symptoms list
  getCommonSymptoms: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/symptom-checker/symptoms`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching symptoms:", error);
      throw error.response?.data || { message: "Failed to fetch symptoms" };
    }
  },

  // Get symptom categories
  getSymptomCategories: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/symptom-checker/categories`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching symptom categories:", error);
      throw error.response?.data || { message: "Failed to fetch categories" };
    }
  },

  // Search symptoms
  searchSymptoms: async (query) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/symptom-checker/search`,
        {
          params: { q: query },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error searching symptoms:", error);
      throw error.response?.data || { message: "Failed to search symptoms" };
    }
  },

  // Get health recommendations
  getHealthRecommendations: async (diagnosis) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/symptom-checker/recommendations`,
        {
          diagnosis,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      throw (
        error.response?.data || { message: "Failed to fetch recommendations" }
      );
    }
  },

  // Save symptom check history
  saveSymptomCheckHistory: async (checkData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/symptom-checker/history`,
        checkData
      );
      return response.data;
    } catch (error) {
      console.error("Error saving symptom check history:", error);
      throw error.response?.data || { message: "Failed to save history" };
    }
  },

  // Get user's symptom check history
  getSymptomCheckHistory: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/symptom-checker/history`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching symptom check history:", error);
      throw error.response?.data || { message: "Failed to fetch history" };
    }
  },
};

// Mock data for development when backend is not available
const mockSymptoms = [
  { id: 1, name: "Fever", category: "general", severity: "medium" },
  { id: 2, name: "Headache", category: "neurological", severity: "low" },
  { id: 3, name: "Cough", category: "respiratory", severity: "medium" },
  { id: 4, name: "Fatigue", category: "general", severity: "low" },
  { id: 5, name: "Nausea", category: "gastrointestinal", severity: "medium" },
  {
    id: 6,
    name: "Abdominal Pain",
    category: "gastrointestinal",
    severity: "high",
  },
  { id: 7, name: "Chest Pain", category: "cardiac", severity: "high" },
  {
    id: 8,
    name: "Shortness of Breath",
    category: "respiratory",
    severity: "high",
  },
  { id: 9, name: "Dizziness", category: "neurological", severity: "medium" },
  {
    id: 10,
    name: "Joint Pain",
    category: "musculoskeletal",
    severity: "medium",
  },
];

const mockCategories = [
  { id: 1, name: "General", code: "general" },
  { id: 2, name: "Neurological", code: "neurological" },
  { id: 3, name: "Respiratory", code: "respiratory" },
  { id: 4, name: "Gastrointestinal", code: "gastrointestinal" },
  { id: 5, name: "Cardiac", code: "cardiac" },
  { id: 6, name: "Musculoskeletal", code: "musculoskeletal" },
];

// Mock version for development
export const mockSymptomCheckerAPI = {
  checkSymptoms: async (symptoms) => {
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay

    const severity = symptoms.some((s) => s.severity === "high")
      ? "high"
      : symptoms.some((s) => s.severity === "medium")
      ? "medium"
      : "low";

    return {
      success: true,
      data: {
        diagnosis: {
          primaryCondition:
            severity === "high"
              ? "Urgent medical attention required"
              : severity === "medium"
              ? "Consider consulting a doctor"
              : "Monitor symptoms, may be mild condition",
          confidence: Math.random() * 0.3 + 0.7, // 70-100%
          severity,
          recommendations: [
            "Stay hydrated",
            "Get adequate rest",
            severity === "high"
              ? "Seek immediate medical attention"
              : "Monitor symptoms",
          ],
          possibleCauses: [
            "Viral infection",
            "Bacterial infection",
            "Environmental factors",
          ],
        },
      },
    };
  },

  getCommonSymptoms: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, data: mockSymptoms };
  },

  getSymptomCategories: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, data: mockCategories };
  },

  searchSymptoms: async (query) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const filtered = mockSymptoms.filter((symptom) =>
      symptom.name.toLowerCase().includes(query.toLowerCase())
    );
    return { success: true, data: filtered };
  },

  getHealthRecommendations: async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: true,
      data: {
        recommendations: [
          "Maintain proper hygiene",
          "Exercise regularly",
          "Eat a balanced diet",
          "Get adequate sleep",
        ],
      },
    };
  },

  saveSymptomCheckHistory: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, message: "History saved successfully" };
  },

  getSymptomCheckHistory: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, data: [] };
  },
};

// Use mock in development or when backend is not available
const isDevelopment = process.env.NODE_ENV === "development";
export default isDevelopment ? mockSymptomCheckerAPI : symptomCheckerAPI;
