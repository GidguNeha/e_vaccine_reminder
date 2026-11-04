const normalizeWhatsAppPhone = (phone) => {
  if (typeof phone !== "string" || !phone.trim()) {
    return "";
  }

  const normalized = phone.trim().replace(/[\s().-]/g, "");
  return /^\+[1-9]\d{7,14}$/.test(normalized) ? normalized : null;
};

export { normalizeWhatsAppPhone };
