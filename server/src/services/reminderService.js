
import cron from "node-cron";
import Vaccine from "../models/Vaccine.js";
import User from "../models/user.js";
import sendEmail from "./email.js";
import sendWhatsApp from "./whatsapp.js";

const checkReminders = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const vaccines = await Vaccine.find({
      isCompleted: false
    });

    for (const vaccine of vaccines) {
      const dueDate = new Date(vaccine.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const daysLeft = Math.round(
        (dueDate - today) / (1000 * 60 * 60 * 24)
      );

      if (daysLeft !== 3 && daysLeft !== 2) {
        continue;
      }

      const user = await User.findById(vaccine.user);

      if (!user) continue;

      const message =
        `Reminder: Your ${vaccine.vaccineName} vaccine is due in ${daysLeft} day(s), on ${dueDate.toDateString()}.`;

      if (process.env.ENABLE_EMAIL === "true" && user.email) {
        await sendEmail(
          user.email,
          "E-Vaccine Reminder",
          message
        );
      }

      if (
        process.env.ENABLE_WHATSAPP === "true" &&
        user.phone
      ) {
        await sendWhatsApp(
          user.phone,
          vaccine.vaccineName,
          daysLeft,
          dueDate.toDateString()
        );
      }
    }

    console.log("Vaccine reminder check completed.");
  } catch (error) {
    console.error("Reminder error:", error.message);
  }
};

const startReminderService = () => {
  cron.schedule(
    "0 9 * * *",
    checkReminders,
    { timezone: "Asia/Kolkata" }
  );

  console.log("Reminder scheduler started.");
};

export { startReminderService, checkReminders };
