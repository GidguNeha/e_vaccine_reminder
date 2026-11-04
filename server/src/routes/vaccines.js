
import express from "express";
import Vaccine from "../models/Vaccine.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Add a vaccine
router.post("/", protect, async (req, res) => {
  try {
    const { vaccineName, dueDate, doseNumber, notes } = req.body;

    const vaccine = await Vaccine.create({
      user: req.user.id,
      vaccineName,
      dueDate,
      doseNumber,
      notes
    });

    res.status(201).json(vaccine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all vaccines
router.get("/", protect, async (req, res) => {
  try {
    const vaccines = await Vaccine.find({
      user: req.user.id
    }).sort({ dueDate: 1 });

    res.json(vaccines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a vaccine
router.put("/:id", protect, async (req, res) => {
  try {
    const vaccine = await Vaccine.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!vaccine) {
      return res.status(404).json({
        message: "Vaccine not found"
      });
    }

    res.json(vaccine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a vaccine
router.delete("/:id", protect, async (req, res) => {
  try {
    const vaccine = await Vaccine.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!vaccine) {
      return res.status(404).json({
        message: "Vaccine not found"
      });
    }

    res.json({ message: "Vaccine deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
