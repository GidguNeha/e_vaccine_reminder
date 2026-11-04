
import express from "express";
import Vaccine from "../models/Vaccine.js";
import User from "../models/user.js";
import protect from "../middleware/auth.js";
import sendWhatsApp from "../services/whatsapp.js";

const router = express.Router();

router.post("/test-whatsapp", protect, async (req, res) => {
  if (process.env.ENABLE_WHATSAPP !== "true") {
    return res.status(503).json({
      message: "WhatsApp reminders are disabled. Set ENABLE_WHATSAPP=true in server/.env."
    });
  }

  let user;

  try {
    user = await User.findById(req.user.id);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  if (!user) {
    return res.status(404).json({ message: "Account not found." });
  }

  if (!user.phone || !user.whatsappOptIn) {
    return res.status(400).json({
      message: "Add a WhatsApp number and enable WhatsApp reminders in your profile first."
    });
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 3);

  try {
    await sendWhatsApp(
      user.phone,
      "WhatsApp setup test",
      3,
      dueDate.toDateString()
    );

    res.json({ message: "WhatsApp test reminder sent successfully." });
  } catch (error) {
    console.error("WhatsApp test reminder failed:", error.message);
    const status = error.message.includes("not configured") ? 503 : 502;
    res.status(status).json({ message: error.message });
  }
});

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
