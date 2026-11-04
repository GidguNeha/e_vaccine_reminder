import assert from "node:assert/strict";
import test from "node:test";
import { normalizeWhatsAppPhone } from "./whatsappPhone.js";

test("normalizes international phone numbers for WhatsApp", () => {
  assert.equal(normalizeWhatsAppPhone("+1 (415) 555-2671"), "+14155552671");
  assert.equal(normalizeWhatsAppPhone("+919876543210"), "+919876543210");
});

test("rejects phone numbers without a valid international country code", () => {
  assert.equal(normalizeWhatsAppPhone("4155552671"), null);
  assert.equal(normalizeWhatsAppPhone("+0123456789"), null);
  assert.equal(normalizeWhatsAppPhone(""), "");
});
