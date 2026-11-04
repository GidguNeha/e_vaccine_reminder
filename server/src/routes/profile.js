import express from "express";
import User from "../models/user.js";
import protect from "../middleware/auth.js";
import { normalizeWhatsAppPhone } from "../utils/whatsappPhone.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email phone whatsappOptIn"
    );

    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/", protect, async (req, res) => {
  try {
    const { phone, whatsappOptIn } = req.body;

    if (typeof phone !== "string" || typeof whatsappOptIn !== "boolean") {
      return res.status(400).json({
        message: "Provide a phone number and WhatsApp reminder preference."
      });
    }

    const normalizedPhone = normalizeWhatsAppPhone(phone);
    if (phone && !normalizedPhone) {
      return res.status(400).json({
        message: "Enter a valid phone number in international format, such as +14155552671."
      });
    }

    if (whatsappOptIn && !normalizedPhone) {
      return res.status(400).json({
        message: "Enter a WhatsApp number before enabling WhatsApp reminders."
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        phone: normalizedPhone || "",
        whatsappOptIn
      },
      {
        new: true,
        runValidators: true,
        select: "name email phone whatsappOptIn"
      }
    );

    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
