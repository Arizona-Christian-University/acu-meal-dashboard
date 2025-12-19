'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MetricCard from '@/components/MetricCard';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

interface DashboardData {
  metrics: any;
  timeSeries: any;
  cohortAnalysis: any[];
  usagePatterns: any;
  deniedTransactions: any;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [crosstabData, setCrosstabData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cohortField, setCohortField] = useState('Meal_Plan_Type');
  const [dimension1, setDimension1] = useState('Meal_Plan_Type');
  const [dimension2, setDimension2] = useState('Housing_Status');

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [cohortField]);

  useEffect(() => {
    fetchCrosstabData();
  }, [dimension1, dimension2]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard?cohortField=${cohortField}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCrosstabData = async () => {
    try {
      const response = await fetch(`/api/crosstab?dimension1=${dimension1}&dimension2=${dimension2}`);
      if (!response.ok) throw new Error('Failed to fetch crosstab data');
      const result = await response.json();
      setCrosstabData(result);
    } catch (err) {
      console.error('Error fetching crosstab data:', err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return <ErrorMessage message="No data available" />;

  const { metrics, timeSeries, cohortAnalysis, usagePatterns, deniedTransactions } = data;

  // Transform data for charts
  const mealPlanData = Object.entries(metrics.mealPlanDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const housingData = Object.entries(metrics.housingDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const genderData = Object.entries(metrics.genderDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const raceData = Object.entries(metrics.raceDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const dayOfWeekData = Object.entries(usagePatterns.byDayOfWeek)
    .map(([name, value]) => ({
      name,
      count: value as number,
    }))
    .sort((a, b) => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return days.indexOf(a.name) - days.indexOf(b.name);
    });

  const hourData = Object.entries(usagePatterns.byHour)
    .map(([name, value]) => ({
      name: `${name}:00`,
      count: value as number,
    }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name));

  const cohortChartData = cohortAnalysis.map((c) => ({
    cohort: c.cohort,
    transactions: c.totalTransactions,
    avgPerPerson: Math.round(c.averagePerPerson),
  }));

  // Transform crosstab data for display
  const crosstabDisplay = crosstabData
    ? Object.entries(crosstabData.crosstab).flatMap(([dim1Value, dim2Values]: [string, any]) =>
        Object.entries(dim2Values).map(([dim2Value, count]) => ({
          [dimension1]: dim1Value,
          [dimension2]: dim2Value,
          count: count as number,
        }))
      )
    : [];

  const dimensionOptions = [
    { value: 'Meal_Plan_Type', label: 'Meal Plan Type' },
    { value: 'Housing_Status', label: 'Housing Status' },
    { value: 'Is_Athlete', label: 'Athlete Status' },
    { value: 'Gender', label: 'Gender' },
    { value: 'Class', label: 'Class Year' },
    { value: 'IPEDS Race/Ethnicity', label: 'Race/Ethnicity' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Arizona Christian University</h1>
              <p className="text-blue-100 mt-1">Meal Accounting Dashboard - Fall 2025</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Students"
              value={metrics.totalStudents.toLocaleString()}
              subtitle="Enrolled with meal plans"
            />
            <MetricCard
              title="Total Transactions"
              value={metrics.totalTransactions.toLocaleString()}
              subtitle="All meal and flex transactions"
            />
            <MetricCard
              title="Meal Swipes"
              value={metrics.totalMealSwipes.toLocaleString()}
              subtitle={`Avg: ${metrics.averageMealsPerStudent.toFixed(1)} per student`}
            />
            <MetricCard
              title="Flex Dollars Spent"
              value={`$${metrics.totalFlexDollarsSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={`Avg: $${metrics.averageFlexPerStudent.toFixed(2)} per student`}
            />
          </div>
        </section>

        {/* Time Series */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage Trends</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChart
              data={timeSeries.mealDaily}
              dataKeys={[{ key: 'count', color: '#3b82f6', name: 'Meal Swipes' }]}
              xAxisKey="date"
              title="Daily Meal Swipes"
            />
            <LineChart
              data={timeSeries.flexDaily}
              dataKeys={[
                { key: 'count', color: '#10b981', name: 'Transactions' },
                { key: 'amount', color: '#f59e0b', name: 'Amount ($)' },
              ]}
              xAxisKey="date"
              title="Daily Flex Dollar Activity"
            />
          </div>
        </section>

        {/* Usage Patterns */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage Patterns</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChart
              data={dayOfWeekData}
              dataKey="count"
              xAxisKey="name"
              title="Meal Swipes by Day of Week"
              color="#3b82f6"
            />
            <BarChart
              data={hourData}
              dataKey="count"
              xAxisKey="name"
              title="Meal Swipes by Hour of Day"
              color="#10b981"
            />
          </div>
        </section>

        {/* Demographics */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Demographics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChart data={mealPlanData} title="Meal Plan Distribution" />
            <PieChart data={housingData} title="Housing Distribution" />
            <PieChart data={genderData} title="Gender Distribution" />
            <PieChart data={raceData} title="Race/Ethnicity Distribution" />
          </div>
        </section>

        {/* Cohort Analysis */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cohort Analysis</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analyze by:
            </label>
            <select
              value={cohortField}
              onChange={(e) => setCohortField(e.target.value)}
              className="mt-1 block w-full md:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              {dimensionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <BarChart
            data={cohortChartData}
            dataKey="transactions"
            xAxisKey="cohort"
            title={`Total Transactions by ${cohortField}`}
            color="#8b5cf6"
          />
        </section>

        {/* Crosstab Analysis */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Crosstab Analysis</h2>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimension 1:
                </label>
                <select
                  value={dimension1}
                  onChange={(e) => setDimension1(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  {dimensionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimension 2:
                </label>
                <select
                  value={dimension2}
                  onChange={(e) => setDimension2(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  {dimensionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {dimension1}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {dimension2}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {crosstabDisplay.slice(0, 20).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row[dimension1]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row[dimension2]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {crosstabDisplay.length > 20 && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Showing 20 of {crosstabDisplay.length} combinations
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Denied Transactions */}
        {deniedTransactions.count > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Denied Transactions</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-800 font-semibold mb-2">
                Total Denied: {deniedTransactions.count}
              </p>
              <p className="text-red-600 text-sm">
                There are {deniedTransactions.count} denied transactions that may require attention.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm">
            © 2025 Arizona Christian University - Meal Accounting Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
}
