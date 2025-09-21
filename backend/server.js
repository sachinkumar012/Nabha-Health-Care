const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const appointmentRoutes = require("./src/routes/appointmentRoutes");
const healthRecordRoutes = require("./src/routes/healthRecordRoutes");
const medicineRoutes = require("./src/routes/medicineRoutes");
const pharmacyRoutes = require("./src/routes/pharmacyRoutes");
const symptomCheckerRoutes = require("./src/routes/symptomCheckerRoutes");

// Import middleware
const errorHandler = require("./src/middleware/errorHandler");
const notFound = require("./src/middleware/notFound");

const app = express();
const server = createServer(app);

// Socket.IO setup for real-time features
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// MongoDB connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/nabha-healthcare",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/health-records", healthRecordRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/pharmacies", pharmacyRoutes);
app.use("/api/symptom-checker", symptomCheckerRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Nabha Healthcare API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Socket.IO connection handling for real-time features
io.on("connection", (socket) => {
  console.log("👤 User connected:", socket.id);

  // Join appointment room for video consultation
  socket.on("join-appointment", (appointmentId) => {
    socket.join(appointmentId);
    socket.to(appointmentId).emit("user-joined", socket.id);
  });

  // Handle video call signaling
  socket.on("offer", (data) => {
    socket.to(data.appointmentId).emit("offer", {
      offer: data.offer,
      socketId: socket.id,
    });
  });

  socket.on("answer", (data) => {
    socket.to(data.appointmentId).emit("answer", {
      answer: data.answer,
      socketId: socket.id,
    });
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.appointmentId).emit("ice-candidate", {
      candidate: data.candidate,
      socketId: socket.id,
    });
  });

  // Handle medicine stock updates
  socket.on("medicine-stock-update", (data) => {
    io.emit("stock-updated", data);
  });

  // Handle appointment status updates
  socket.on("appointment-update", (data) => {
    io.to(data.appointmentId).emit("appointment-status-changed", data);
  });

  socket.on("disconnect", () => {
    console.log("👋 User disconnected:", socket.id);
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Nabha Healthcare Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `📱 Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`
  );
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down gracefully...");
  await mongoose.connection.close();
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

module.exports = { app, io };
