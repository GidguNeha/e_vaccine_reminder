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

## Email and WhatsApp reminders

The server checks each morning at 9:00 AM India time and sends reminders three
days and two days before an incomplete vaccine's due date. Set
`ENABLE_EMAIL=true` and provide the SMTP settings in `server/.env` to enable
email. To enable WhatsApp, set `ENABLE_WHATSAPP=true`, provide the WhatsApp
Cloud API credentials, and enter a phone number with country code when
registering. Configure an approved WhatsApp message template named by
`WHATSAPP_TEMPLATE_NAME` with three body placeholders, in order: vaccine name,
days remaining, and due date. The `.env.example` file lists all supported
settings.
