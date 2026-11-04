
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { normalizeWhatsAppPhone } from "../utils/whatsappPhone.js";

const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, whatsappOptIn } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Please fill all fields"
      });
    }

    if (
      whatsappOptIn !== undefined &&
      typeof whatsappOptIn !== "boolean"
    ) {
      return res.status(400).json({
        message: "WhatsApp reminder consent must be true or false."
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

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone: normalizedPhone || "",
      whatsappOptIn: Boolean(whatsappOptIn)
    });

    res.status(201).json({
      message: "Registration successful",
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: typeof email === "string" ? email.trim().toLowerCase() : ""
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        whatsappOptIn: user.whatsappOptIn
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
