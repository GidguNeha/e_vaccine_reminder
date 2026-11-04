# E-Vaccine Reminder

## Run locally

1. Start MongoDB locally, or set `MONGODB_URI` to your MongoDB connection string.
2. In `server`, copy `.env.example` to `.env` and set `MONGODB_URI` and a private `JWT_SECRET`.
3. Start the API in a terminal:

   ```powershell
   cd server
   npm install
   npm run dev
   ```

4. Start the web app in a second terminal:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

Open the Vite URL shown in the client terminal (normally `http://localhost:5173`).

## WhatsApp reminders

1. Create a WhatsApp Business app in Meta for Developers and add a WhatsApp
   sender. Copy its **Phone Number ID** and a permanent access token into
   `server/.env`. Keep the token private and never commit `.env`.
2. In WhatsApp Manager, create and get approval for a utility template named
   `vaccine_reminder`. Its body must contain these three placeholders, in order:
   vaccine name (`{{1}}`), days remaining (`{{2}}`), and due date (`{{3}}`).
   Set `WHATSAPP_TEMPLATE_LANGUAGE` to the approved template's language code.
3. Set `ENABLE_WHATSAPP=true`, `WHATSAPP_PHONE_NUMBER_ID`, and
   `WHATSAPP_ACCESS_TOKEN` in `server/.env`. The remaining WhatsApp settings
   are listed in `server/.env.example`.
4. Register with a phone number in international format (for example
   `+14155552671`) and consent to WhatsApp reminders. Existing users can set
   their number and consent from the dashboard's **WhatsApp Reminder Settings**.
5. Press **Save reminder settings**, then **Send WhatsApp test**. The test button
   sends a real template message to the signed-in user's opted-in number. Meta
   developer/test accounts may require adding that recipient as a test number.
   Leave `ENABLE_WHATSAPP=false` until your Meta sender and approved template
   are ready; the test button will not send while reminders are disabled.

The server checks each morning at 9:00 AM India time and sends reminders three
days and two days before an incomplete vaccine's due date. Keep the server
running for scheduled reminders to be sent. For email reminders, set
`ENABLE_EMAIL=true` and provide the SMTP settings in `server/.env`.

## Tests

Run the backend unit tests with `cd server` followed by `npm test`. The tests
verify reminder timing, phone-number validation, and WhatsApp template requests
without sending any real messages.

For deployment, set `VITE_API_URL` in the client environment and set
`CLIENT_ORIGIN` in the server environment to the client URL. Use a persistent
MongoDB instance and keep the reminder worker running continuously.
