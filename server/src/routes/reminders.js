
import express from "express";
import Vaccine from "../models/Vaccine.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Get upcoming vaccine reminders
router.get("/", protect, async (req, res) => {
  try {
    const today = new Date();

    const vaccines = await Vaccine.find({
      user: req.user.id,
      dueDate: { $gte: today },
      isCompleted: false
    }).sort({ dueDate: 1 });

    res.json(vaccines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
