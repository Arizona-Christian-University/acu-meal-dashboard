'use client';

import { useState, useEffect } from 'react';
import {
  LineChart as RechartsLine,
  BarChart as RechartsBar,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyData {
  month: string;
  mealSwipes: number;
  flexDollars: number;
  transactions: number;
  uniqueStudents: number;
  avgMealsPerStudent: number;
  avgFlexPerStudent: number;
}

interface WeeklyData {
  week: string;
  weekNumber: number;
  mealSwipes: number;
  flexDollars: number;
  transactions: number;
  uniqueStudents: number;
  avgMealsPerDay: number;
  avgFlexPerDay: number;
}

interface Props {
  monthlyData: MonthlyData[];
  weeklyData: WeeklyData[];
}

export default function PeriodAnalysis({ monthlyData, weeklyData }: Props) {
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [metric, setMetric] = useState<'totals' | 'averages'>('totals');
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar');

  useEffect(() => {
    console.log('[PeriodAnalysis] Component mounted');
    console.log('[PeriodAnalysis] monthlyData:', monthlyData);
    console.log('[PeriodAnalysis] weeklyData:', weeklyData);
  }, [monthlyData, weeklyData]);

  const totalChartData = period === 'monthly'
    ? monthlyData.map((d) => ({
        name: d.month,
        'Meal Swipes': d.mealSwipes,
        'Flex Dollars': d.flexDollars,
        'Total Transactions': d.transactions,
        'Active Students': d.uniqueStudents,
      }))
    : weeklyData.map((d) => ({
        name: d.week,
        'Meal Swipes': d.mealSwipes,
        'Flex Dollars': d.flexDollars,
        'Total Transactions': d.transactions,
        'Active Students': d.uniqueStudents,
      }));

  const avgChartData = period === 'monthly'
    ? monthlyData.map((d) => ({
        name: d.month,
        'Avg Meals/Student': d.avgMealsPerStudent,
        'Avg Flex/Student': d.avgFlexPerStudent,
      }))
    : weeklyData.map((d) => ({
        name: d.week,
        'Avg Meals/Student': d.avgMealsPerDay,
        'Avg Flex/Student': d.avgFlexPerDay,
      }));

  const chartData = metric === 'totals' ? totalChartData : avgChartData;

  useEffect(() => {
    console.log('[PeriodAnalysis] Chart settings:', { period, metric, chartType });
    console.log('[PeriodAnalysis] chartData length:', chartData?.length);
    console.log('[PeriodAnalysis] chartData sample:', chartData?.[0]);
  }, [period, metric, chartType, chartData]);

  // Check if we have data
  const hasData = monthlyData?.length > 0 || weeklyData?.length > 0;
  const currentData = period === 'monthly' ? monthlyData : weeklyData;
  const hasCurrentData = currentData?.length > 0;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Period Analysis</h2>
        <div className="flex gap-4">
          {/* Period Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                period === 'monthly'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                period === 'weekly'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Weekly
            </button>
          </div>

          {/* Metric Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMetric('totals')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                metric === 'totals'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Totals
            </button>
            <button
              onClick={() => setMetric('averages')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                metric === 'averages'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Averages
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('bar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                chartType === 'bar'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                chartType === 'line'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Line
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {period === 'monthly' ? 'Month' : 'Week'}-by-{period === 'monthly' ? 'Month' : 'Week'} {metric === 'totals' ? 'Totals' : 'Averages'}
        </h3>

        {!hasCurrentData ? (
          <div className="flex items-center justify-center h-96 text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium">No data available</p>
              <p className="text-sm mt-2">
                No {period} data found. Try switching to {period === 'monthly' ? 'weekly' : 'monthly'} view.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <p className="text-sm text-blue-600 mb-4">DEBUG: Rendering {period} chart with {chartData?.length} data points</p>

            {/* Test with hardcoded simple data */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-2">TEST CHART (hardcoded data):</h4>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsBar data={[
                  { name: 'A', value: 100 },
                  { name: 'B', value: 200 },
                  { name: 'C', value: 150 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#FF0000" />
                </RechartsBar>
              </ResponsiveContainer>
            </div>

            <h4 className="text-sm font-semibold mb-2">ACTUAL CHART (your data):</h4>
            <ResponsiveContainer width="100%" height={400}>
              {chartType === 'bar' ? (
                <RechartsBar data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {metric === 'totals' ? (
                  <>
                    <Bar dataKey="Meal Swipes" fill="#FF0000" />
                    <Bar dataKey="Flex Dollars" fill="#00FF00" />
                    <Bar dataKey="Total Transactions" fill="#0000FF" />
                    <Bar dataKey="Active Students" fill="#FFFF00" />
                  </>
                ) : (
                  <>
                    <Bar dataKey="Avg Meals/Student" fill="#FF0000" />
                    <Bar dataKey="Avg Flex/Student" fill="#00FF00" />
                  </>
                )}
              </RechartsBar>
            ) : (
              <RechartsLine data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {metric === 'totals' ? (
                  <>
                    <Line type="monotone" dataKey="Meal Swipes" stroke="#FF0000" strokeWidth={3} />
                    <Line type="monotone" dataKey="Flex Dollars" stroke="#00FF00" strokeWidth={3} />
                    <Line type="monotone" dataKey="Total Transactions" stroke="#0000FF" strokeWidth={3} />
                    <Line type="monotone" dataKey="Active Students" stroke="#FFFF00" strokeWidth={3} />
                  </>
                ) : (
                  <>
                    <Line type="monotone" dataKey="Avg Meals/Student" stroke="#FF0000" strokeWidth={3} />
                    <Line type="monotone" dataKey="Avg Flex/Student" stroke="#00FF00" strokeWidth={3} />
                  </>
                )}
              </RechartsLine>
            )}
          </ResponsiveContainer>
          </div>
        )}

        {/* Data Table */}
        {hasCurrentData && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {period === 'monthly' ? 'Month' : 'Week'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meal Swipes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flex Dollars
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Students
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Meals/{period === 'monthly' ? 'Student' : 'Day'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Flex/${period === 'monthly' ? 'Student' : 'Day'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {period === 'monthly'
                ? monthlyData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {row.mealSwipes.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        ${row.flexDollars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {row.transactions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {row.uniqueStudents.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {row.avgMealsPerStudent.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        ${row.avgFlexPerStudent.toFixed(2)}
                      </td>
                    </tr>
                  ))
                : weeklyData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.week}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {row.mealSwipes.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        ${row.flexDollars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {row.transactions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {row.uniqueStudents.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {row.avgMealsPerDay.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        ${row.avgFlexPerDay.toFixed(2)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </section>
  );
}
