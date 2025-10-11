# 🗄️ Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `lead-scraper-crm`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your location
6. Click "Create new project"

## Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `database-schema.sql`
3. Paste it into the SQL editor
4. Click **Run** to execute the schema

This will create:
- ✅ `leads` table with all lead data
- ✅ `scraper_runs` table for tracking scraper activity
- ✅ `conversion_events` table for tracking conversions
- ✅ `scoring_performance` table for ML accuracy tracking
- ✅ Proper indexes for performance
- ✅ Row Level Security policies
- ✅ Sample test data

## Step 3: Get API Keys

1. Go to **Settings** → **API**
2. Copy these values (you'll need them for your `.env.local`):
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon/public key**: `eyJ...` (starts with eyJ)
   - **service_role key**: `eyJ...` (starts with eyJ)

## Step 4: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure your site URL:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback`

## Step 5: Test the Setup

1. Go to **Table Editor**
2. You should see your tables:
   - `leads` (with 3 sample leads)
   - `scraper_runs`
   - `conversion_events`
   - `scoring_performance`

## Step 6: Environment Variables

Create `.env.local` in your Next.js project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# n8n Integration
N8N_WEBHOOK_SECRET=your-webhook-secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 7: Real-time Features

Supabase automatically enables real-time subscriptions for your tables. This means:
- ✅ New leads appear instantly in your dashboard
- ✅ Status updates sync across all users
- ✅ Scraper progress updates in real-time

## Next Steps

1. ✅ Database is ready
2. 🔄 Create Next.js project (after Node.js install)
3. 🔄 Set up Supabase client
4. 🔄 Build dashboard with real-time updates
5. 🔄 Test lead management features

Your database is now ready to power your Lead Scraper CRM! 🚀
