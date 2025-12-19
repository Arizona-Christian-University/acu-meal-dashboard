import { StudentMember, Transaction, DashboardMetrics, TimeSeriesData, CohortData } from './types';
import { format, parseISO } from 'date-fns';

export function calculateDashboardMetrics(
  students: StudentMember[],
  mealTransactions: Transaction[],
  flexTransactions: Transaction[]
): DashboardMetrics {
  const totalStudents = students.length;
  const totalTransactions = mealTransactions.length + flexTransactions.length;

  // Calculate meal swipes (non-deposit transactions)
  const mealSwipes = mealTransactions.filter(
    (t) => t['Transaction Type'] !== 'deposit' && t['Transaction Response'] === 'Approved'
  );
  const totalMealSwipes = mealSwipes.length;

  // Calculate flex dollars spent (non-deposit transactions)
  const flexSpending = flexTransactions.filter(
    (t) => t['Transaction Type'] !== 'deposit' && t['Transaction Response'] === 'Approved'
  );
  const totalFlexDollarsSpent = Math.abs(
    flexSpending.reduce((sum, t) => sum + parseFloat(t['Net Transaction Amount'] || '0'), 0)
  );

  // Calculate averages
  const averageMealsPerStudent = totalMealSwipes / totalStudents;
  const averageFlexPerStudent = totalFlexDollarsSpent / totalStudents;

  // Meal plan distribution
  const mealPlanDistribution: { [key: string]: number } = {};
  students.forEach((s) => {
    const plan = s.Meal_Plan_Type || 'Unknown';
    mealPlanDistribution[plan] = (mealPlanDistribution[plan] || 0) + 1;
  });

  // Housing distribution
  const housingDistribution: { [key: string]: number } = {};
  students.forEach((s) => {
    const housing = s.Housing_Status || 'Unknown';
    housingDistribution[housing] = (housingDistribution[housing] || 0) + 1;
  });

  // Athlete distribution
  const athleteDistribution: { [key: string]: number } = {};
  students.forEach((s) => {
    const athlete = s.Is_Athlete || 'Non-Athlete';
    athleteDistribution[athlete] = (athleteDistribution[athlete] || 0) + 1;
  });

  // Gender distribution
  const genderDistribution: { [key: string]: number } = {};
  students.forEach((s) => {
    const gender = s.Gender || 'Unknown';
    genderDistribution[gender] = (genderDistribution[gender] || 0) + 1;
  });

  // Race distribution
  const raceDistribution: { [key: string]: number } = {};
  students.forEach((s) => {
    const race = s['IPEDS Race/Ethnicity'] || 'Unknown';
    raceDistribution[race] = (raceDistribution[race] || 0) + 1;
  });

  return {
    totalStudents,
    totalTransactions,
    totalMealSwipes,
    totalFlexDollarsSpent,
    averageMealsPerStudent,
    averageFlexPerStudent,
    mealPlanDistribution,
    housingDistribution,
    athleteDistribution,
    genderDistribution,
    raceDistribution,
  };
}

export function getTimeSeriesData(
  transactions: Transaction[],
  groupBy: 'day' | 'week' = 'day'
): TimeSeriesData[] {
  const transactionsByDate: { [key: string]: { count: number; amount: number } } = {};

  transactions
    .filter((t) => t['Transaction Type'] !== 'deposit' && t['Transaction Response'] === 'Approved')
    .forEach((t) => {
      try {
        const date = parseISO(t.Date);
        let key: string;

        if (groupBy === 'week') {
          // Group by week number
          key = `Week ${t.Week_Number}`;
        } else {
          // Group by day
          key = format(date, 'yyyy-MM-dd');
        }

        if (!transactionsByDate[key]) {
          transactionsByDate[key] = { count: 0, amount: 0 };
        }

        transactionsByDate[key].count += 1;
        transactionsByDate[key].amount += Math.abs(parseFloat(t['Net Transaction Amount'] || '0'));
      } catch (e) {
        // Skip invalid dates
      }
    });

  return Object.entries(transactionsByDate)
    .map(([date, data]) => ({
      date,
      count: data.count,
      amount: data.amount,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getCohortAnalysis(
  students: StudentMember[],
  transactions: Transaction[],
  cohortField: keyof StudentMember
): CohortData[] {
  const cohortMap: {
    [key: string]: { ids: Set<string>; totalTransactions: number; totalAmount: number };
  } = {};

  // Group students by cohort
  students.forEach((s) => {
    const cohort = (s[cohortField] as string) || 'Unknown';
    if (!cohortMap[cohort]) {
      cohortMap[cohort] = { ids: new Set(), totalTransactions: 0, totalAmount: 0 };
    }
    cohortMap[cohort].ids.add(s['Student ID']);
  });

  // Calculate transactions per cohort
  transactions
    .filter((t) => t['Transaction Type'] !== 'deposit' && t['Transaction Response'] === 'Approved')
    .forEach((t) => {
      const studentId = t['Person Campus ID'];

      // Find which cohort this student belongs to
      for (const [cohort, data] of Object.entries(cohortMap)) {
        if (data.ids.has(studentId)) {
          data.totalTransactions += 1;
          data.totalAmount += Math.abs(parseFloat(t['Net Transaction Amount'] || '0'));
          break;
        }
      }
    });

  return Object.entries(cohortMap)
    .map(([cohort, data]) => ({
      cohort,
      totalTransactions: data.totalTransactions,
      totalAmount: data.totalAmount,
      averagePerPerson: data.ids.size > 0 ? data.totalTransactions / data.ids.size : 0,
    }))
    .sort((a, b) => b.totalTransactions - a.totalTransactions);
}

export function getUsageByDayOfWeek(transactions: Transaction[]): { [key: string]: number } {
  const usageByDay: { [key: string]: number } = {};

  transactions
    .filter((t) => t['Transaction Type'] !== 'deposit' && t['Transaction Response'] === 'Approved')
    .forEach((t) => {
      const day = t.Day_of_Week || 'Unknown';
      usageByDay[day] = (usageByDay[day] || 0) + 1;
    });

  return usageByDay;
}

export function getUsageByHour(transactions: Transaction[]): { [key: string]: number } {
  const usageByHour: { [key: string]: number } = {};

  transactions
    .filter((t) => t['Transaction Type'] !== 'deposit' && t['Transaction Response'] === 'Approved')
    .forEach((t) => {
      const hour = t.Hour || 'Unknown';
      usageByHour[hour] = (usageByHour[hour] || 0) + 1;
    });

  return usageByHour;
}

export function getDeniedTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter((t) => t['Transaction Response'] === 'Denied');
}

export function getCrosstabAnalysis(
  students: StudentMember[],
  transactions: Transaction[],
  dimension1: keyof StudentMember,
  dimension2: keyof StudentMember
): { [key: string]: { [key: string]: number } } {
  const crosstab: { [key: string]: { [key: string]: number } } = {};

  // Create a map of student ID to student data
  const studentMap = new Map<string, StudentMember>();
  students.forEach((s) => studentMap.set(s['Student ID'], s));

  // Count transactions by both dimensions
  transactions
    .filter((t) => t['Transaction Type'] !== 'deposit' && t['Transaction Response'] === 'Approved')
    .forEach((t) => {
      const student = studentMap.get(t['Person Campus ID']);
      if (student) {
        const dim1Value = (student[dimension1] as string) || 'Unknown';
        const dim2Value = (student[dimension2] as string) || 'Unknown';

        if (!crosstab[dim1Value]) {
          crosstab[dim1Value] = {};
        }
        crosstab[dim1Value][dim2Value] = (crosstab[dim1Value][dim2Value] || 0) + 1;
      }
    });

  return crosstab;
}
