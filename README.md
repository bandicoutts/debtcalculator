# Snowball Debt Calculator

A modern single-page application for managing and visualizing debt payoff strategies using the Snowball and Avalanche methods.

## Features

- **Single Page Application**: Smooth navigation without page reloads
- **Debt Management**: Add, edit, and delete debts with real-time validation
- **Strategy Comparison**: Compare Snowball vs Avalanche payoff methods
- **Visual Analytics**: See your debt-free date and total interest savings
- **Secure Authentication**: Login with Supabase Auth
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4
- **Database & Auth**: Supabase
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd debtcalculator
npm install
```

### 2. Set up Environment Variables

Copy `.env.example` to `.env.local` and add your Supabase credentials:

```bash
cp .env.example .env.local
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

Make sure you have the following tables in your Supabase project:

### debts
```sql
CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  balance DECIMAL(10, 2) NOT NULL,
  minimum_payment DECIMAL(10, 2) NOT NULL,
  apr DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### user_settings
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  extra_payment DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

Enable Row Level Security (RLS) on both tables with policies that allow users to access only their own data.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main SPA container
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── views/              # Main view components
│   │   ├── AuthView.tsx
│   │   ├── DashboardView.tsx
│   │   ├── ManageDebtsView.tsx
│   │   └── ResultsView.tsx
│   └── Sidebar.tsx         # Navigation sidebar
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── calculations.ts     # Debt payoff algorithms
│   └── formatters.ts       # Formatting utilities
└── types/
    └── debt.types.ts       # TypeScript interfaces
```

## License

ISC
