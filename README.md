# ACU Meal Accounting Dashboard

A professional, password-protected data analytics dashboard for Arizona Christian University's Meal Accounting System.

## 🔒 Security

This dashboard is **password-protected** and requires authentication to access. All data is secured with industry-standard session management.

## Features

- **Key Metrics**: Total students, transactions, meal swipes, and flex dollars spent
- **Time Series Analysis**: Daily and weekly trends for meal and flex dollar usage
- **Usage Patterns**: Analysis by day of week and hour of day
- **Demographics**: Visual breakdown by meal plan, housing, gender, and race/ethnicity
- **Cohort Analysis**: Interactive analysis by various student attributes
- **Crosstab Analysis**: Multi-dimensional comparison of any two student attributes
- **Denied Transactions**: Tracking and alerts for failed transactions

## Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Data Processing**: PapaParse for CSV parsing
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git (for deployment)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:

Copy `.env.example` to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DASHBOARD_PASSWORD=YourSecurePassword
SESSION_SECRET=your_random_32_character_secret_here
NODE_ENV=development
```

3. Ensure your data files are in the `Data/` directory:
   - `Atrium Members - Students.csv`
   - `Atrium Transactions - Student Meals - Fall 2025 - 7 Meals.csv`
   - `Atrium Transactions - Student Meals - Fall 2025 - 14 Meals.csv`
   - `Atrium Transactions - Student Meals - Fall 2025 - 19 Meals.csv`
   - `Atrium Transactions - Student Flex Dollars - Fall 2025 - Student Flex Dollars (1).csv`

### Running the Dashboard

Development mode:
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser. You'll be redirected to the login page.

**Default Login for Local Development:**
- Password: (whatever you set in `DASHBOARD_PASSWORD` in `.env.local`)

Production build:
```bash
npm run build
npm start
```

### Deploying to Cloudflare Pages

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete deployment instructions.

Quick start:
```bash
# Build for Cloudflare
npm run pages:build

# Deploy
npm run pages:deploy
```

Or use the Cloudflare Dashboard (recommended) - see [CLOUDFLARE_QUICKSTART.md](./CLOUDFLARE_QUICKSTART.md)

## Dashboard Sections

### Key Metrics
Four main KPI cards showing:
- Total number of enrolled students
- Total transactions (meals + flex)
- Total meal swipes with average per student
- Total flex dollars spent with average per student

### Usage Trends
Line charts showing:
- Daily meal swipe patterns over time
- Daily flex dollar transactions and spending

### Usage Patterns
Bar charts displaying:
- Meal usage by day of week (Monday-Sunday)
- Meal usage by hour of day (showing peak dining times)

### Student Demographics
Pie charts breaking down:
- Meal plan distribution (7, 14, 19 meals)
- Housing status (On-Campus vs Off-Campus)
- Gender distribution
- Race/Ethnicity distribution

### Cohort Analysis
Interactive analysis allowing you to:
- Select different student attributes (meal plan, housing, athlete status, gender, class year, race/ethnicity)
- View total transactions by cohort
- Compare usage patterns across different student groups

### Crosstab Analysis
Multi-dimensional comparison tool:
- Select any two dimensions to analyze
- View transaction counts for each combination
- Identify patterns and correlations between student attributes

## Data Structure

### Student Members
Contains demographic and enrollment information:
- Student ID, Name, Email
- Meal Plan Type, Housing Status
- Athletic participation
- Demographics (Gender, Age, Race/Ethnicity)
- Academic information (Class, Degrees, Specializations)

### Transactions
Contains meal swipe and flex dollar transaction data:
- Date/Time of transaction
- Student ID and Name
- Location, Transaction Type, Amount
- Transaction Response (Approved/Denied)
- Derived fields: Week Number, Day of Week, Hour

## Customization

### Adding New Charts
Create new chart components in `components/charts/` and import them into `app/page.tsx`.

### Adding New Metrics
Extend the analytics functions in `lib/analytics.ts` to calculate additional metrics.

### Adding New Cohort Fields
Add new options to the `dimensionOptions` array in `app/page.tsx`.

## Performance Notes

- The dashboard loads all data on initial page load
- Data is processed server-side via Next.js API routes
- Client-side caching is used to prevent unnecessary re-fetches
- Large datasets are automatically truncated for display (e.g., crosstab shows top 20 combinations)

## Future Enhancements

Potential additions:
- Export functionality (CSV, PDF reports)
- Date range filtering
- Predictive analytics
- Real-time data updates
- Email alerts for anomalies
- Mobile-responsive improvements
- User authentication for sensitive data

## License

Proprietary - Arizona Christian University

## Contact

For questions or support, contact the ACU IT Department.
