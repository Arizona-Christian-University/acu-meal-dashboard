import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { loadAllData } from '@/lib/dataLoader';
import {
  calculateDashboardMetrics,
  getTimeSeriesData,
  getCohortAnalysis,
  getUsageByDayOfWeek,
  getUsageByHour,
  getDeniedTransactions,
  getMonthlyAnalysis,
  getWeeklyAnalysis,
} from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cohortField = searchParams.get('cohortField') || 'Meal_Plan_Type';

    // Get D1 database from Cloudflare context
    const { env } = getCloudflareContext();
    const db = env.DB;
    if (!db) {
      console.error('D1 database not available');
      throw new Error('D1 database not available');
    }

    // Load all data from D1 database
    const { students, mealTransactions, flexTransactions, allTransactions } = await loadAllData(db);

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

    // Get monthly and weekly analysis
    const monthlyAnalysis = getMonthlyAnalysis(mealTransactions, flexTransactions);
    const weeklyAnalysis = getWeeklyAnalysis(mealTransactions, flexTransactions);

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
      monthlyAnalysis,
      weeklyAnalysis,
    });
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data', details: (error as Error).message },
      { status: 500 }
    );
  }
}
