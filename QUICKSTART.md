# Quick Start Guide

## Dashboard is Running!

Your ACU Meal Accounting Dashboard is now running at:
**http://localhost:3001**

## What You'll See

### Dashboard Overview
When you open the dashboard, you'll see:

1. **Header** - Arizona Christian University branding with page title
2. **Key Metrics Cards** - 4 main KPIs at the top:
   - Total Students
   - Total Transactions
   - Meal Swipes (with average per student)
   - Flex Dollars Spent (with average per student)

3. **Usage Trends** - Line charts showing:
   - Daily meal swipes over time
   - Daily flex dollar transactions and spending

4. **Usage Patterns** - Bar charts displaying:
   - Meal usage by day of week
   - Meal usage by hour of day

5. **Student Demographics** - Pie charts showing:
   - Meal plan distribution (7, 14, 19 meals)
   - Housing distribution
   - Gender distribution
   - Race/Ethnicity distribution

6. **Cohort Analysis** - Interactive section where you can:
   - Select different dimensions (meal plan, housing, athlete status, etc.)
   - View usage patterns for each cohort
   - Compare transaction volumes across groups

7. **Crosstab Analysis** - Multi-dimensional analysis where you can:
   - Select any two dimensions to compare
   - View a detailed table of transaction counts
   - Identify correlations between student attributes

8. **Denied Transactions** - Alert section showing any failed transactions

## Interactive Features

### Cohort Analysis Controls
- Use the dropdown menu to switch between different cohort dimensions:
  - Meal Plan Type
  - Housing Status
  - Athlete Status
  - Gender
  - Class Year
  - Race/Ethnicity

### Crosstab Analysis Controls
- Select two different dimensions from the dropdown menus
- The table will automatically update to show transaction counts for each combination
- The table shows the top 20 combinations (if there are more, a count is shown)

## Data Sources

The dashboard automatically loads data from:
- `Data/Atrium Members - Students.csv` - Student demographics
- `Data/Atrium Transactions - Student Meals - Fall 2025 - 7 Meals.csv`
- `Data/Atrium Transactions - Student Meals - Fall 2025 - 14 Meals.csv`
- `Data/Atrium Transactions - Student Meals - Fall 2025 - 19 Meals.csv`
- `Data/Atrium Transactions - Student Flex Dollars - Fall 2025 - Student Flex Dollars (1).csv`

## Tips for University Leadership

### Questions You Can Answer:
1. **Utilization**: Are students using their meal plans effectively?
2. **Patterns**: When are peak dining times? Which days are busiest?
3. **Demographics**: How does usage differ between on-campus vs off-campus students?
4. **Athletes**: Do athletes have different usage patterns than non-athletes?
5. **Meal Plans**: Which meal plan types have the highest transaction volumes?
6. **Trends**: Are there any concerning trends in meal swipe or flex dollar usage?

### Example Insights to Look For:
- Compare athlete vs non-athlete meal usage
- Analyze if students on different meal plans are maximizing their benefits
- Identify peak dining hours to inform staffing decisions
- Look for unusual patterns that might indicate issues
- Cross-reference housing status with meal plan usage to inform future offerings

## Stopping the Server

To stop the development server, press `Ctrl+C` in the terminal where it's running.

## Troubleshooting

### Dashboard won't load
- Make sure all CSV files are in the `Data/` directory
- Check the terminal for any error messages
- Refresh the browser page

### Data looks incorrect
- Verify the CSV files are properly formatted
- Check that file names match exactly what's expected
- Look for any errors in the browser console (F12)

### Need to restart
```bash
# Stop the server (Ctrl+C) then restart:
npm run dev
```

## Next Steps

### For Production Deployment:
```bash
npm run build
npm start
```

This will create an optimized production build and start the server.

### For Cloudflare Pages Deployment:
The project is already configured for Cloudflare Pages deployment. Simply push to your repository and connect it to Cloudflare Pages.

## Support

For questions or issues, please contact the development team.
