
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import vaccineRoutes from "./routes/vaccines.js";
import reminderRoutes from "./routes/reminders.js";

import {
  startReminderService
} from "./services/reminderService.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ]
}));

app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("E-Vaccine Reminder API is running!");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/vaccines", vaccineRoutes);
app.use("/api/reminders", reminderRoutes);

// Server configuration
const PORT = process.env.PORT || 5000;

// Connect MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

    // Start vaccine reminder scheduler
    startReminderService();

  } catch (error) {
    console.error("Connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
