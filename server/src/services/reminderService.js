
import cron from "node-cron";
import Vaccine from "../models/Vaccine.js";
import User from "../models/user.js";
import sendEmail from "./email.js";
import sendWhatsApp from "./whatsapp.js";

const isReminderDay = (daysLeft) => daysLeft === 3 || daysLeft === 2;

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

      if (!isReminderDay(daysLeft)) {
        continue;
      }

      const user = await User.findById(vaccine.user);

      if (!user) {
        console.warn(`No user found for vaccine ${vaccine._id}.`);
        continue;
      }

      const message =
        `Reminder: Your ${vaccine.vaccineName} vaccine is due in ${daysLeft} day(s), on ${dueDate.toDateString()}.`;

      if (process.env.ENABLE_EMAIL === "true" && user.email) {
        try {
          await sendEmail(user.email, "E-Vaccine Reminder", message);
        } catch (error) {
          console.error(
            `Email reminder failed for vaccine ${vaccine._id}:`,
            error.message
          );
        }
      }

      if (
        process.env.ENABLE_WHATSAPP === "true" &&
        user.phone &&
        user.whatsappOptIn
      ) {
        try {
          await sendWhatsApp(
            user.phone,
            vaccine.vaccineName,
            daysLeft,
            dueDate.toDateString()
          );
          console.log(`WhatsApp reminder sent for vaccine ${vaccine._id}.`);
        } catch (error) {
          console.error(
            `WhatsApp reminder failed for vaccine ${vaccine._id}:`,
            error.message
          );
        }
      } else if (
        process.env.ENABLE_WHATSAPP === "true" &&
        user.phone &&
        !user.whatsappOptIn
      ) {
        console.log(
          `WhatsApp reminder skipped for vaccine ${vaccine._id}: user has not opted in.`
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

export { startReminderService, checkReminders, isReminderDay };
