import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const healthRecordsAPI = {
  // Get all health records for current user
  getHealthRecords: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health-records`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching health records:", error);
      throw (
        error.response?.data || { message: "Failed to fetch health records" }
      );
    }
  },

  // Get single health record by ID
  getHealthRecord: async (recordId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/health-records/${recordId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching health record:", error);
      throw (
        error.response?.data || { message: "Failed to fetch health record" }
      );
    }
  },

  // Create new health record
  createHealthRecord: async (recordData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/health-records`,
        recordData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating health record:", error);
      throw (
        error.response?.data || { message: "Failed to create health record" }
      );
    }
  },

  // Update health record
  updateHealthRecord: async (recordId, updateData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/health-records/${recordId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating health record:", error);
      throw (
        error.response?.data || { message: "Failed to update health record" }
      );
    }
  },

  // Delete health record
  deleteHealthRecord: async (recordId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/health-records/${recordId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting health record:", error);
      throw (
        error.response?.data || { message: "Failed to delete health record" }
      );
    }
  },

  // Upload attachment to health record
  uploadAttachment: async (recordId, file) => {
    try {
      const formData = new FormData();
      formData.append("attachment", file);

      const response = await axios.post(
        `${API_BASE_URL}/health-records/${recordId}/attachments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading attachment:", error);
      throw error.response?.data || { message: "Failed to upload attachment" };
    }
  },

  // Delete attachment from health record
  deleteAttachment: async (recordId, attachmentId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/health-records/${recordId}/attachments/${attachmentId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting attachment:", error);
      throw error.response?.data || { message: "Failed to delete attachment" };
    }
  },

  // Share health record with doctor
  shareHealthRecord: async (recordId, doctorId, permissions = ["read"]) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/health-records/${recordId}/share`,
        {
          doctorId,
          permissions,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error sharing health record:", error);
      throw (
        error.response?.data || { message: "Failed to share health record" }
      );
    }
  },

  // Get shared health records
  getSharedRecords: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health-records/shared`);
      return response.data;
    } catch (error) {
      console.error("Error fetching shared records:", error);
      throw (
        error.response?.data || { message: "Failed to fetch shared records" }
      );
    }
  },

  // Get patient summary for doctor
  getPatientSummary: async (patientId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/health-records/summary/${patientId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching patient summary:", error);
      throw (
        error.response?.data || { message: "Failed to fetch patient summary" }
      );
    }
  },

  // Search health records
  searchHealthRecords: async (query, filters = {}) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/health-records/search`,
        {
          params: { q: query, ...filters },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error searching health records:", error);
      throw (
        error.response?.data || { message: "Failed to search health records" }
      );
    }
  },

  // Get health record types
  getRecordTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health-records/types`);
      return response.data;
    } catch (error) {
      console.error("Error fetching record types:", error);
      throw error.response?.data || { message: "Failed to fetch record types" };
    }
  },

  // Get health statistics
  getHealthStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health-records/stats`);
      return response.data;
    } catch (error) {
      console.error("Error fetching health stats:", error);
      throw (
        error.response?.data || { message: "Failed to fetch health statistics" }
      );
    }
  },

  // Export health records
  exportHealthRecords: async (format = "pdf", recordIds = []) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/health-records/export`,
        {
          format,
          recordIds,
        },
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error exporting health records:", error);
      throw (
        error.response?.data || { message: "Failed to export health records" }
      );
    }
  },
};

// Mock data for development
const mockHealthRecords = [
  {
    _id: "1",
    type: "consultation",
    title: "General Checkup",
    description: "Routine health checkup with Dr. Rajesh Kumar",
    date: "2025-09-20",
    doctor: {
      _id: "1",
      name: "Dr. Rajesh Kumar",
      specialization: "General Medicine",
    },
    diagnosis: "Normal health parameters",
    prescription: ["Rest and adequate hydration", "Multivitamin supplements"],
    attachments: [],
    vitals: {
      bloodPressure: "120/80",
      temperature: "98.6°F",
      heartRate: "72 bpm",
      weight: "65 kg",
    },
    isShared: false,
    createdAt: "2025-09-20T10:30:00.000Z",
  },
  {
    _id: "2",
    type: "lab_report",
    title: "Blood Test Results",
    description: "Complete blood count and lipid profile",
    date: "2025-09-18",
    doctor: {
      _id: "1",
      name: "Dr. Rajesh Kumar",
      specialization: "General Medicine",
    },
    diagnosis: "Mild vitamin D deficiency",
    prescription: ["Vitamin D3 supplements", "Increase sun exposure"],
    attachments: [
      {
        _id: "att1",
        fileName: "blood_test_report.pdf",
        fileUrl: "#",
        fileSize: "2.3 MB",
        uploadedAt: "2025-09-18T14:00:00.000Z",
      },
    ],
    testResults: {
      hemoglobin: "12.5 g/dL",
      wbc: "7200/μL",
      cholesterol: "185 mg/dL",
      vitaminD: "18 ng/mL (Low)",
    },
    isShared: true,
    createdAt: "2025-09-18T14:00:00.000Z",
  },
];

const mockRecordTypes = [
  { id: "consultation", name: "Consultation", icon: "medical_services" },
  { id: "lab_report", name: "Lab Report", icon: "biotech" },
  { id: "prescription", name: "Prescription", icon: "medication" },
  { id: "imaging", name: "Medical Imaging", icon: "scanner" },
  { id: "surgery", name: "Surgery Record", icon: "healing" },
  { id: "vaccination", name: "Vaccination", icon: "vaccines" },
];

// Mock API for development
export const mockHealthRecordsAPI = {
  getHealthRecords: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    let records = [...mockHealthRecords];

    if (params.type) {
      records = records.filter((record) => record.type === params.type);
    }

    return { success: true, data: records, count: records.length };
  },

  getHealthRecord: async (recordId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const record = mockHealthRecords.find((r) => r._id === recordId);
    return { success: true, data: record };
  },

  createHealthRecord: async (recordData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newRecord = {
      _id: (mockHealthRecords.length + 1).toString(),
      ...recordData,
      createdAt: new Date().toISOString(),
      attachments: [],
    };
    mockHealthRecords.push(newRecord);
    return { success: true, data: newRecord };
  },

  updateHealthRecord: async (recordId, updateData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, message: "Health record updated successfully" };
  },

  deleteHealthRecord: async (recordId) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { success: true, message: "Health record deleted successfully" };
  },

  uploadAttachment: async (recordId, file) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newAttachment = {
      _id: `att_${Date.now()}`,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString(),
    };
    return { success: true, data: newAttachment };
  },

  deleteAttachment: async (recordId, attachmentId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true, message: "Attachment deleted successfully" };
  },

  shareHealthRecord: async (recordId, doctorId, permissions) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, message: "Health record shared successfully" };
  },

  getSharedRecords: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { success: true, data: mockHealthRecords.filter((r) => r.isShared) };
  },

  getPatientSummary: async (patientId) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      success: true,
      data: {
        patient: { name: "John Doe", age: 30, gender: "Male" },
        totalRecords: mockHealthRecords.length,
        recentRecords: mockHealthRecords.slice(0, 3),
        chronicConditions: [],
        allergies: [],
        currentMedications: [],
      },
    };
  },

  searchHealthRecords: async (query) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const results = mockHealthRecords.filter(
      (record) =>
        record.title.toLowerCase().includes(query.toLowerCase()) ||
        record.description.toLowerCase().includes(query.toLowerCase())
    );
    return { success: true, data: results };
  },

  getRecordTypes: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { success: true, data: mockRecordTypes };
  },

  getHealthStats: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      data: {
        totalRecords: mockHealthRecords.length,
        recordsByType: {
          consultation: 1,
          lab_report: 1,
        },
        recentActivity: mockHealthRecords.length,
      },
    };
  },

  exportHealthRecords: async (format, recordIds) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return new Blob(["Mock PDF content"], { type: "application/pdf" });
  },
};

// Use mock in development or when backend is not available
const isDevelopment = process.env.NODE_ENV === "development";
export default isDevelopment ? mockHealthRecordsAPI : healthRecordsAPI;
