
import nodemailer from "nodemailer";

const sendEmail = async (to, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: message
    });

    console.log("Email sent to:", to);
  } catch (error) {
    console.error("Email sending failed:", error.message);
  }
};

export default sendEmail;
