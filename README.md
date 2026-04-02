# Dietl Housing Admin Panel

A Next.js admin panel for managing contacts from Supabase with password-only login.

## Features

- Password-only login
- View contacts from Supabase
- Search by email or name
- Filter by call status, interested, meeting type
- Table view on desktop, card view on mobile
- Responsive Tailwind styling

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase URL and **service role key** (Project Settings > API > `service_role` secret) – required when using RLS
   - Set `ADMIN_PASSWORD` for login

3. **Supabase table**
   Ensure your Supabase table is named `Contacts` and has these columns:
   - `id` (uuid, optional - email can be primary key)
   - `first_name` (text)
   - `last_name` (text)
   - `email` (text, unique)
   - `whatsapp_number` (text)
   - `phone_number` (text)
   - `call_status` (text)
   - `interested` (text: NOT_INTERESTED, COULD_NOT_CALL, or call_status values)
   - `call_summary` (text)
   - `create_date` (timestamp)
   - `meeting_type` (text)
   - `call_date` (timestamptz, optional)
   - `call_recording` (text, URL)

4. **Run locally**
   ```bash
   npm run dev
   ```

5. **Deploy to Vercel**
   - Connect your GitHub repo to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy

## Upload to GitHub

Run `upload.bat` to add, commit, and push to GitHub. Ensure you have:
- Git initialized: `git init`
- Remote added: `git remote add origin https://github.com/youruser/yourrepo.git`
