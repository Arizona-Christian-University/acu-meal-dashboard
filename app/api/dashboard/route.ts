import { NextResponse } from 'next/server';
import { loadAllData } from '@/lib/dataLoader';
import {
  calculateDashboardMetrics,
  getTimeSeriesData,
  getCohortAnalysis,
  getUsageByDayOfWeek,
  getUsageByHour,
  getDeniedTransactions,
} from '@/lib/analytics';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cohortField = searchParams.get('cohortField') || 'Meal_Plan_Type';

    // Load all data
    const { students, mealTransactions, flexTransactions, allTransactions } = await loadAllData();

    // Calculate metrics
    const metrics = calculateDashboardMetrics(students, mealTransactions, flexTransactions);

    // Get time series data
    const mealTimeSeriesDaily = getTimeSeriesData(mealTransactions, 'day');
    const flexTimeSeriesDaily = getTimeSeriesData(flexTransactions, 'day');
    const mealTimeSeriesWeekly = getTimeSeriesData(mealTransactions, 'week');

    // Get cohort analysis
    const cohortAnalysis = getCohortAnalysis(
      students,
      allTransactions,
      cohortField as keyof typeof students[0]
    );

    // Get usage patterns
    const usageByDayOfWeek = getUsageByDayOfWeek(mealTransactions);
    const usageByHour = getUsageByHour(mealTransactions);

    // Get denied transactions
    const deniedTransactions = getDeniedTransactions(allTransactions);

    return NextResponse.json({
      metrics,
      timeSeries: {
        mealDaily: mealTimeSeriesDaily,
        flexDaily: flexTimeSeriesDaily,
        mealWeekly: mealTimeSeriesWeekly,
      },
      cohortAnalysis,
      usagePatterns: {
        byDayOfWeek: usageByDayOfWeek,
        byHour: usageByHour,
      },
      deniedTransactions: {
        count: deniedTransactions.length,
        transactions: deniedTransactions.slice(0, 100), // Limit to first 100
      },
    });
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data', details: (error as Error).message },
      { status: 500 }
    );
  }
}
