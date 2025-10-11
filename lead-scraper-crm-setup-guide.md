# 🚀 Lead Scraper CRM - Setup Guide

## Prerequisites Installation

### 1. Install Node.js
- Download from [nodejs.org](https://nodejs.org) (LTS version)
- Run installer and restart terminal
- Verify: `node --version` and `npm --version`

### 2. Create Project
```bash
npx create-next-app@latest lead-scraper-crm --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
cd lead-scraper-crm
```

### 3. Install Dependencies
```bash
npm install @supabase/supabase-js @tanstack/react-query zustand recharts react-hook-form zod @hookform/resolvers date-fns sonner
```

### 4. Setup shadcn/ui
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add card table button badge dialog dropdown-menu input select tabs progress textarea toast form sheet separator skeleton checkbox
```

### 5. Start Development
```bash
npm run dev
```

## Next Steps After Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Copy database schema from our specification

2. **Environment Variables**
   - Create `.env.local` file
   - Add Supabase keys

3. **Build Dashboard**
   - Start with stat cards
   - Add real-time updates
   - Implement lead management

## Project Structure Preview

```
lead-scraper-crm/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Main dashboard
│   │   ├── leads/              # Lead management
│   │   ├── analytics/          # Analytics dashboard
│   │   ├── scraper/            # Scraper control
│   │   └── settings/           # Settings
│   ├── components/
│   │   ├── ui/                 # shadcn components
│   │   ├── charts/             # Chart components
│   │   ├── forms/              # Form components
│   │   └── layout/             # Layout components
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client
│   │   ├── utils.ts            # Utility functions
│   │   └── validations.ts      # Zod schemas
│   └── types/
│       └── index.ts            # TypeScript types
```

## Key Features to Build

- ✅ Real-time dashboard with stats
- ✅ Advanced lead table with filtering
- ✅ Lead detail views with scoring breakdown
- ✅ Analytics with conversion tracking
- ✅ Scraper management and control
- ✅ n8n webhook integration
- ✅ Dark mode support
- ✅ Mobile responsive design

Ready to build the best lead scraper CRM! 🎉
