import assert from "node:assert/strict";
import test from "node:test";
import sendWhatsApp from "./whatsapp.js";

const setWhatsAppConfig = () => {
  process.env.WHATSAPP_PHONE_NUMBER_ID = "test-phone-id";
  process.env.WHATSAPP_ACCESS_TOKEN = "test-access-token";
  process.env.WHATSAPP_API_VERSION = "v23.0";
  process.env.WHATSAPP_TEMPLATE_NAME = "vaccine_reminder";
  process.env.WHATSAPP_TEMPLATE_LANGUAGE = "en_US";
};

test("sends a template reminder using configured WhatsApp settings", async (t) => {
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };
  t.after(() => {
    globalThis.fetch = originalFetch;
    process.env = originalEnv;
  });
  setWhatsAppConfig();

  let requestUrl;
  let requestOptions;
  globalThis.fetch = async (url, options) => {
    requestUrl = url;
    requestOptions = options;
    return {
      ok: true,
      json: async () => ({ messages: [{ id: "test-message-id" }] })
    };
  };

  const response = await sendWhatsApp(
    "+14155552671",
    "Flu vaccine",
    3,
    "Sat Nov 07 2026"
  );
  const body = JSON.parse(requestOptions.body);

  assert.equal(
    requestUrl,
    "https://graph.facebook.com/v23.0/test-phone-id/messages"
  );
  assert.equal(requestOptions.headers.Authorization, "Bearer test-access-token");
  assert.equal(body.to, "14155552671");
  assert.equal(body.template.name, "vaccine_reminder");
  assert.deepEqual(
    body.template.components[0].parameters.map((parameter) => parameter.text),
    ["Flu vaccine", "3", "Sat Nov 07 2026"]
  );
  assert.equal(response.messages[0].id, "test-message-id");
});

test("reports errors returned by the WhatsApp Cloud API", async (t) => {
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };
  t.after(() => {
    globalThis.fetch = originalFetch;
    process.env = originalEnv;
  });
  setWhatsAppConfig();

  globalThis.fetch = async () => ({
    ok: false,
    status: 400,
    json: async () => ({ error: { message: "Template is not approved." } })
  });

  await assert.rejects(
    sendWhatsApp("+14155552671", "Flu vaccine", 3, "Nov 07 2026"),
    /Template is not approved/
  );
});

test("fails explicitly when WhatsApp credentials are missing", async (t) => {
  const originalEnv = { ...process.env };
  t.after(() => {
    process.env = originalEnv;
  });
  delete process.env.WHATSAPP_PHONE_NUMBER_ID;
  delete process.env.WHATSAPP_ACCESS_TOKEN;

  await assert.rejects(
    sendWhatsApp("+14155552671", "Flu vaccine", 3, "Nov 07 2026"),
    /not configured/
  );
});
