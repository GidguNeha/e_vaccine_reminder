
const sendWhatsApp = async (phone, vaccineName, daysLeft, dueDate) => {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const apiVersion = process.env.WHATSAPP_API_VERSION || "v23.0";
    const templateName =
      process.env.WHATSAPP_TEMPLATE_NAME || "vaccine_reminder";
    const templateLanguage =
      process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US";

    if (!phoneNumberId || !token) {
      throw new Error(
        "WhatsApp is not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN."
      );
    }

    if (!/^v\d+\.\d+$/.test(apiVersion)) {
      throw new Error("WHATSAPP_API_VERSION must look like v23.0.");
    }

    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone.replace(/\D/g, ""),
          type: "template",
          template: {
            name: templateName,
            language: { code: templateLanguage },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: vaccineName },
                  { type: "text", text: String(daysLeft) },
                  { type: "text", text: dueDate }
                ]
              }
            ]
          }
        })
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.error?.message || `WhatsApp API returned HTTP ${response.status}.`
      );
    }

    return result;
  } catch (error) {
    throw new Error(`WhatsApp sending failed: ${error.message}`, {
      cause: error
    });
  }
};

export default sendWhatsApp;
