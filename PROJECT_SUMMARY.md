# Snowball Debt Calculator - Project Summary

## Overview
A modern, single-page application for managing and visualizing debt payoff strategies using the Snowball and Avalanche methods. Built with Next.js 15, React 18, TypeScript, Tailwind CSS, and Supabase.

**Live URL**: http://localhost:3001

---

## What We Built

### Complete Single-Page Application
Built a fully functional SPA from scratch in the root directory with:
- Client-side routing (no page reloads)
- Persistent authentication via Supabase
- Real-time data synchronization
- Responsive dark theme with teal accents

### Design System
- **Color Scheme**: Dark blue-gray backgrounds (#191919, #1e293b) with teal accent (#14b8a6)
- **Typography**: System fonts (SF Pro Display, Segoe UI)
- **Components**: Reusable Button, Card, Input components
- **Icons**: Lucide React icons throughout

---

## Technologies Used

### Frontend Stack
- **Next.js 15** - App Router for modern React applications
- **React 18.3.1** - UI library with hooks
- **TypeScript 5.3.3** - Type safety
- **Tailwind CSS 3.4.1** - Utility-first styling

### Backend & Database
- **Supabase** - PostgreSQL database with Row Level Security
- **@supabase/ssr** - Server-side rendering support
- **@supabase/supabase-js** - Client SDK

### Visualization
- **Recharts 2.12.0** - Charts for debt visualization
- **Lucide React 0.460.0** - Icon library

### Form Handling
- **React Hook Form 7.51.0** - Form state management
- **Zod 3.22.4** - Schema validation

---

## Features Implemented

### 1. Authentication System ✅
**Files**: `app/page.tsx`, `components/views/AuthView.tsx`

- Login with email/password
- Sign up with email confirmation support
- Session management with Supabase Auth
- Persistent login across page refreshes
- Logout functionality
- Error handling with user-friendly messages

### 2. Dashboard View ✅
**Files**: `components/views/DashboardView.tsx`

- **Total Debt Overview**: Sum of all debt balances
- **Debt-Free Date Estimation**: Calculated based on current payments
- **Monthly Payment Summary**: Total minimum + extra payments
- **High APR Debt Warnings**: Alerts for debts above 15% APR
- **Extra Payment Input**: Set monthly extra payment with live updates
- **Debt Summary Table**: All debts with balances, APR, and minimum payments
- Real-time calculations that update as data changes

### 3. Manage Debts View ✅
**Files**: `components/views/ManageDebtsView.tsx`

- **Add New Debts**: Form with validation for:
  - Debt name (required)
  - Current balance (must be positive)
  - Minimum payment (must be positive)
  - APR (0-100%, warnings for high rates)
- **Edit Debts**: Click pencil icon to modify existing debt
- **Delete Debts**: Trash icon with confirmation dialog
- **Real-time Validation**:
  - Required fields
  - Numeric validation
  - APR warnings for rates > 30%
- **Currency Formatting**: Dollar signs on inputs
- **Hover Actions**: Edit/Delete buttons appear on row hover

### 4. Results View (Enhanced) ✅
**Files**: `components/views/ResultsView.tsx`, `components/charts/`

#### Comparison Features
- **Side-by-Side Comparison Card**:
  - Snowball vs Avalanche in single view
  - Payoff dates for each method
  - Total interest paid comparison
  - Total amount paid
  - Time to freedom (years/months)
- **Method Toggle**: Switch between Snowball and Avalanche instantly
- **Savings Calculation**: Shows which method saves more money

#### Visualizations
1. **Debt Payoff Flow**
   - Visual timeline of payoff order
   - Icons auto-selected by debt type (credit card, medical, car, student)
   - First debt highlighted in teal
   - "Debt Free!" celebration at the end
   - Shows balance for each debt

2. **Debt Balance Over Time Chart**
   - Interactive line chart
   - Shows total debt decreasing monthly
   - Teal gradient styling
   - Tooltips with exact amounts
   - X-axis: Month number
   - Y-axis: Total debt ($)

3. **Debt Payoff Timeline Chart**
   - Stacked area chart
   - Each debt shown in different shade of teal
   - Shows individual debts being paid off
   - Gradient fills for visual appeal
   - Updates when switching methods

#### Month-by-Month Breakdown
- **Detailed Payment Table**:
  - Month (formatted: "Jan 2024")
  - Debt name
  - Payment amount
  - Principal paid
  - Interest paid
  - Remaining balance
- **Search/Filter**: Filter by debt name
- **Highlighting**: Paid-off debts shown in teal
- **Pagination**: First 20 rows, "Load More" button
- **Responsive**: Scrollable on mobile

### 5. Sidebar Navigation ✅
**Files**: `components/Sidebar.tsx`

- Infinity logo with "Snowball" branding
- Three main views:
  - Dashboard (grid icon)
  - Debts (wallet icon with count badge)
  - Results (trending chart icon)
- Active state highlighting in teal
- Logout button at bottom
- Responsive design

---

## Project Structure

```
debtcalculator/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main SPA container (auth, routing, state)
│   └── globals.css         # Global Tailwind styles
│
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx      # Primary, secondary, danger variants
│   │   ├── Card.tsx        # Container with dark styling
│   │   └── Input.tsx       # Form input with label and error states
│   │
│   ├── views/              # Main view components
│   │   ├── AuthView.tsx    # Login/signup form
│   │   ├── DashboardView.tsx    # Overview and stats
│   │   ├── ManageDebtsView.tsx  # CRUD for debts
│   │   └── ResultsView.tsx      # Strategy comparison
│   │
│   ├── charts/             # Recharts visualizations
│   │   ├── DebtBalanceChart.tsx        # Line chart
│   │   └── DebtPayoffTimelineChart.tsx # Stacked area chart
│   │
│   └── Sidebar.tsx         # Navigation sidebar
│
├── lib/
│   ├── supabase.ts         # Supabase client initialization
│   ├── calculations.ts     # Snowball/Avalanche algorithms
│   └── formatters.ts       # Currency and number formatting
│
├── types/
│   └── debt.types.ts       # TypeScript interfaces
│
├── .env.local              # Supabase credentials (gitignored)
├── .env.example            # Template for environment variables
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind theme customization
├── next.config.js          # Next.js configuration
└── README.md               # Setup instructions
```

---

## Key Algorithms

### Debt Payoff Calculations
**File**: `lib/calculations.ts`

#### Snowball Method
1. Sort debts by balance (smallest first)
2. Pay minimums on all debts
3. Apply extra payment to smallest debt
4. When debt is paid off, roll payment to next smallest

#### Avalanche Method
1. Sort debts by APR (highest first)
2. Pay minimums on all debts
3. Apply extra payment to highest APR debt
4. When debt is paid off, roll payment to next highest APR

#### Common Features
- Tracks monthly payments for each debt
- Calculates principal vs interest breakdown
- Handles debt payoff transitions
- Validates all inputs
- Prevents infinite loops (600 month maximum)

---

## Database Schema

### Supabase Tables

#### `debts` Table
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

#### `user_settings` Table
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  extra_payment DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Row Level Security (RLS)
Both tables have RLS enabled with policies that ensure:
- Users can only read their own data
- Users can only modify their own data
- No cross-user data access

---

## Environment Variables

**File**: `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: Supabase Dashboard → Your Project → Settings → API

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Add your Supabase credentials to .env.local
```

### 3. Set Up Supabase
1. Create a new project at https://supabase.com
2. Run the SQL schema from the Database Schema section above
3. Enable Row Level Security on both tables
4. Add RLS policies for user isolation
5. Enable Email authentication in Auth → Providers

### 4. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000 (or 3001 if 3000 is in use)

### 5. Build for Production
```bash
npm run build
npm start
```

---

## State Management

### Global State (app/page.tsx)
- **user**: Current authenticated user
- **debts**: Array of all user's debts
- **extraPayment**: Monthly extra payment amount
- **currentView**: Active view (dashboard, debts, results)
- **loading**: Auth loading state

### Data Flow
1. User authenticates → Supabase Auth
2. Load user data → debts + settings from Supabase
3. User modifies data → Update local state + Supabase
4. View calculations → Recalculate on state change
5. Persist changes → Auto-save to Supabase

---

## API Integration

### Supabase Operations

#### Authentication
```typescript
// Login
await supabase.auth.signInWithPassword({ email, password })

// Signup
await supabase.auth.signUp({ email, password })

// Logout
await supabase.auth.signOut()

// Get current user
await supabase.auth.getUser()
```

#### Debts CRUD
```typescript
// Create
await supabase.from('debts').insert({ user_id, name, balance, ... })

// Read
await supabase.from('debts').select('*').eq('user_id', userId)

// Update
await supabase.from('debts').update({ name, balance }).eq('id', debtId)

// Delete
await supabase.from('debts').delete().eq('id', debtId)
```

#### User Settings
```typescript
// Read
await supabase.from('user_settings').select('*').eq('user_id', userId).single()

// Update
await supabase.from('user_settings').update({ extra_payment }).eq('user_id', userId)
```

---

## Styling System

### Tailwind Custom Theme
**File**: `tailwind.config.ts`

```typescript
colors: {
  background: {
    light: '#f7f7f7',
    dark: '#191919',
  },
  surface: {
    dark: '#1e293b',
    darker: '#0f172a',
  },
  teal: {
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
  },
  border: {
    dark: '#334155',
    darker: '#1e293b',
  },
}
```

### Component Patterns

#### Buttons
- Primary: Teal background, white text
- Secondary: Gray background, gray text
- Danger: Red background, white text
- Sizes: sm, md, lg

#### Cards
- Dark surface background
- Rounded corners (xl)
- Border in dark gray
- Padding of 6 units

#### Inputs
- Dark background
- Teal focus ring
- Error states in red
- Label + helper text support

---

## Data Validation

### Client-Side Validation
**Implemented in**: `components/views/ManageDebtsView.tsx`

- **Debt Name**: Required, non-empty string
- **Balance**: Positive number, finite
- **Minimum Payment**: Positive number, finite
- **APR**: Between 0-100, warning if > 30%

### Backend Validation
- Handled by Supabase with DECIMAL constraints
- NOT NULL constraints on required fields
- Foreign key constraints for user_id

---

## Performance Optimizations

### React Optimization
- `useMemo` for expensive calculations
- Conditional rendering for large lists
- Pagination on month-by-month table (20 rows initial)

### Chart Optimization
- Memoized data transformations
- Recharts lazy loading
- Gradient fills cached via `<defs>`

### Supabase Optimization
- Single query for all debts
- Batch updates where possible
- RLS policies with indexed user_id

---

## Error Handling

### User-Facing Errors
- Form validation errors shown inline
- Supabase errors shown via `alert()`
- Network errors logged to console
- Graceful fallbacks for missing data

### Developer Errors
- TypeScript type checking
- Console logging for debugging
- Try-catch blocks around async operations

---

## Testing Checklist

### Authentication
- ✅ Login with valid credentials
- ✅ Login with invalid credentials shows error
- ✅ Signup creates new user
- ✅ Email confirmation flow (if enabled)
- ✅ Session persists on refresh
- ✅ Logout clears session

### Dashboard
- ✅ Shows correct total debt
- ✅ Calculates debt-free date
- ✅ Displays monthly payment
- ✅ Warns about high APR debts
- ✅ Extra payment input updates calculations
- ✅ Empty state when no debts

### Manage Debts
- ✅ Add new debt saves to database
- ✅ Edit debt updates correctly
- ✅ Delete debt removes from database
- ✅ Form validation works
- ✅ APR warning triggers above 30%
- ✅ Table updates in real-time

### Results
- ✅ Snowball calculation is correct
- ✅ Avalanche calculation is correct
- ✅ Toggle switches methods
- ✅ Charts render correctly
- ✅ Month-by-month table is accurate
- ✅ Search filters work
- ✅ Load more pagination works
- ✅ Paid-off debts highlighted

---

## Known Limitations

1. **No Mobile App**: Web-only, responsive design
2. **Single Currency**: USD only
3. **Simple Interest**: Doesn't account for compound interest
4. **No Recurring Charges**: Assumes static balances
5. **No Data Export**: Can't export calculations to CSV/PDF
6. **Email-Only Auth**: No OAuth providers (Google, GitHub)

---

## Future Enhancements

### Potential Features
1. **Data Export**:
   - Export results to PDF
   - Download month-by-month as CSV

2. **Advanced Analytics**:
   - Interest saved graph over time
   - Payoff milestone celebrations
   - Progress tracking dashboard

3. **Payment Reminders**:
   - Email notifications for upcoming payments
   - SMS reminders (via Twilio)

4. **Debt Categories**:
   - Tag debts (credit card, medical, student, auto)
   - Filter by category
   - Category-specific recommendations

5. **Multiple Users**:
   - Shared household debt tracking
   - Partner collaboration features

6. **Custom Payment Strategies**:
   - Create custom payoff orders
   - "Debt Tsunami" method
   - Hybrid approaches

7. **Budget Integration**:
   - Link bank accounts (Plaid)
   - Automatic payment tracking
   - Spending insights

8. **Goal Setting**:
   - Set payoff date targets
   - Track progress toward goals
   - Adjust strategies to meet targets

---

## Deployment Options

### Vercel (Recommended)
1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy automatically on git push

### Netlify
1. Connect to GitHub
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables

### Self-Hosted
1. Build: `npm run build`
2. Start: `npm start`
3. Use PM2 or systemd for process management
4. Nginx for reverse proxy

---

## Maintenance

### Regular Tasks
- Update dependencies: `npm update`
- Check for security vulnerabilities: `npm audit`
- Monitor Supabase usage and limits
- Review and optimize slow queries
- Back up database regularly

### Monitoring
- Supabase Dashboard for database metrics
- Vercel Analytics for page views
- Error tracking with Sentry (optional)

---

## Credits & References

### Original Inspiration
- Prototype wireframes in `prototype-ui/` folder
- Previous implementation in `snowball-calculator/` folder
- Results design in `results/` folder

### Libraries Used
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [Lucide Icons](https://lucide.dev)
- [React Hook Form](https://react-hook-form.com)

### Methodology
- Snowball Method: Dave Ramsey
- Avalanche Method: Financial optimization

---

## License
ISC

---

## Support

For issues or questions:
- Check the README.md for setup help
- Review this document for architecture details
- Check Supabase dashboard for database issues
- Review browser console for frontend errors

---

**Built with ❤️ using Next.js, React, TypeScript, Tailwind CSS, and Supabase**

Last Updated: November 2, 2025
