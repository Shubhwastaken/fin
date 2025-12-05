# Frontend Quick Start Guide

## Prerequisites Check

Before starting, verify you have:
- Node.js 18+ installed
- npm or yarn package manager
- Backend API running on http://localhost:8000

## Step-by-Step Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

Or with yarn:
```bash
yarn install
```

### 3. Create Environment File

Create a file named `.env.local` in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Run Development Server

```bash
npm run dev
```

Or with yarn:
```bash
yarn dev
```

### 5. Open Application

Open your browser and navigate to:
http://localhost:3000

The app will automatically redirect to `/dashboard`

## Available Scripts

### Development Mode
```bash
npm run dev
```
Runs the app in development mode with hot reload.

### Build for Production
```bash
npm run build
```
Creates an optimized production build.

### Start Production Server
```bash
npm run build
npm start
```
Runs the production build.

### Lint Code
```bash
npm run lint
```
Runs ESLint to check code quality.

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── dashboard/       # Dashboard page
│   │   ├── goals/          # Goals pages
│   │   │   └── [id]/       # Goal details (dynamic route)
│   │   ├── portfolio/      # Portfolio page
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page (redirects)
│   │   └── globals.css     # Global styles
│   ├── components/         # Reusable React components
│   │   ├── GoalCard.tsx
│   │   ├── GoalProgressChart.tsx
│   │   └── AssetAllocationChart.tsx
│   ├── lib/                # Utilities and API client
│   │   ├── api.ts          # Axios API client
│   │   └── utils.ts        # Helper functions
│   └── types/              # TypeScript type definitions
│       └── index.ts
├── public/                 # Static assets
├── .env.local             # Environment variables
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies
```

## Key Features

### Pages
- **Dashboard** (`/dashboard`) - Portfolio overview, goal cards, asset allocation
- **Goals List** (`/goals`) - All goals with filters
- **Goal Details** (`/goals/[id]`) - Individual goal with charts and simulations
- **Portfolio** (`/portfolio`) - All investments table

### Components
- **GoalCard** - Compact goal display with status
- **GoalProgressChart** - Line chart showing goal progress over time
- **AssetAllocationChart** - Pie chart for asset distribution

### API Integration
All API calls are centralized in `src/lib/api.ts`:
- Automatic JWT token injection
- Axios interceptors for auth
- Organized by feature (auth, dashboard, goals, portfolio, family)

## Styling

This project uses:
- **Tailwind CSS** for utility-first styling
- **Custom color palette** for goal statuses
- **Lucide React** for icons
- **Responsive design** for mobile/tablet/desktop

### Color Scheme
- Primary (Blue): `#0ea5e9`
- Success (Green): `#22c55e`
- Warning (Yellow): `#f59e0b`
- Danger (Red): `#ef4444`

## Charts and Visualizations

Uses **Recharts** library for:
- Line charts (goal progress)
- Pie charts (asset allocation)
- Customizable tooltips and legends

## Common Issues

### Issue: Cannot connect to API
**Solution:** 
- Verify backend is running on port 8000
- Check NEXT_PUBLIC_API_URL in .env.local
- Check browser console for CORS errors

### Issue: Module not found
**Solution:** 
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Restart dev server

### Issue: TypeScript errors
**Solution:** 
- Check type definitions in `src/types/index.ts`
- Ensure all imports use correct paths with `@/` alias
- Run `npm run build` to see all TS errors

### Issue: Styling not applied
**Solution:** 
- Verify Tailwind is configured correctly
- Check `tailwind.config.js` content paths
- Restart dev server

## Authentication Flow

1. User registers/logs in via backend API
2. Backend returns JWT token
3. Token stored in localStorage
4. API client automatically adds token to requests
5. Protected routes check for valid token

## Data Flow

```
User Action → React Component → API Client (axios) → Backend API
                     ↓
              Update State
                     ↓
             Re-render UI
```

## Performance Optimization

- **Code splitting** - Automatic with Next.js
- **Image optimization** - Use Next.js Image component
- **Route prefetching** - Automatic with Link component
- **Static generation** - Can be enabled for specific pages

## Building for Production

### 1. Build the application
```bash
npm run build
```

### 2. Test production build locally
```bash
npm start
```

### 3. Deploy

**Vercel (Recommended):**
```bash
npm install -g vercel
vercel
```

**Other platforms:**
- Build folder: `.next`
- Start command: `npm start`
- Node version: 18+

## Environment Variables for Production

Update `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

## Next Steps

After setup:
1. Register a user via backend API
2. Login through the application
3. Explore dashboard and features
4. Add family members, portfolios, goals
5. View charts and run simulations

## Troubleshooting

**Port already in use:**
```bash
# Change port in package.json
"dev": "next dev -p 3001"
```

**Clear cache:**
```bash
rm -rf .next
npm run dev
```

**Check logs:**
- Browser console (F12)
- Terminal output
- Network tab for API calls

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/)
