# SaafSaksham Setup Guide

## 1. Supabase Configuration
You have provided the credentials. Now you need to create the following resources in your Supabase Project Dashboard:

### Database (SQL Editor)
Run the content of `supabase/migrations/20260111_init_schema.sql` in the **SQL Editor**. 
This will:
- Enable PostGIS (required for maps).
- Create the `tasks` table.

### Storage
1. Go to **Storage** -> **New Bucket**.
2. Name it `reports`.
3. Set it to **Public** (or configure Policies for read access).
4. (Optional) Set file size limit to 10MB.

### Authentication
1. Go to **Authentication** -> **Providers**.
2. Enable **Email** (and Google if you want OAuth).
3. (Important) Since we removed Firebase, Supabase Auth will be the primary identity provider.

## 2. API Keys Required
We need the following keys to proceed with AI and Maps integration:

### Google Gemini API (Free Tier)
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Create a new API Key.
3. Add it to `frontend/.env.local` and `backend/.env` as `GEMINI_API_KEY`.

### Map Tiles (Optional)
By default, we are using free Carto basemaps. If you want high-res maps:
1. Get a key from key from MapTiler or Mapbox.
2. Update `frontend/components/map/task-map.tsx` and `.env.local`.

## 3. Deployment
- **Frontend**: Connect your GitHub repo to Vercel/Netlify.
- **Backend**: Deploy `backend/` to Railway, Render, or Fly.io (Dockerfile coming soon).
