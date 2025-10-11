# CRM Setup Guide

## Environment Variables

Create a `.env.local` file in the `lead-scraper-crm` directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

1. Run the SQL schema from `supabase-schema-fixed.sql` in your Supabase SQL editor
2. This will create the `leads` table with all necessary columns
3. Add some sample data to test the interface

## Features Implemented

✅ **Modern Apple-inspired Design**
- Clean, minimalistic interface with lots of whitespace
- Smooth animations and hover effects
- Elegant typography and rounded corners
- Subtle shadows and gradients

✅ **Complete Lead Management**
- View all leads in a beautiful table
- Search by name, address, phone, or email
- Filter by status and tier
- Real-time statistics dashboard

✅ **Lead Details Modal**
- Elegant modal with full lead information
- Update lead status directly
- Add/edit notes functionality
- Contact information display

✅ **Responsive Design**
- Works perfectly on desktop and mobile
- Adaptive layouts for different screen sizes

✅ **Smooth Interactions**
- Hover effects on all interactive elements
- Smooth transitions between states
- Loading states and empty state illustrations

## Property Type Formatting

The `property_type` field is automatically formatted from "SINGLE FAMILY" to "Single Family" using proper case conversion.

## Status Management

- **New**: Blue badge with alert icon
- **Contacted**: Yellow badge with clock icon  
- **Interested**: Green badge with check icon
- **Not Interested**: Red badge with X icon
- **Closed**: Gray badge with check icon

## Running the Application

```bash
cd lead-scraper-crm
npm install
npm run dev
```

The CRM will be available at `http://localhost:3000`

