'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/context.js';
import { ProtectedRoute } from '../../../components/auth/index.js';
import { DashboardLayout } from '../../../components/dashboard/index.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/index.js';
import { USER_ROLES } from '../../../types/index.js';

const StatCard = ({ title, value, subtitle, color = 'blue' }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </CardContent>
  </Card>
);

const ChartCard = ({ title, children }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

const BarChart = ({ data, title }) => {
  const maxValue = Math.max(...Object.values(data));

  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex items-center">
          <div className="w-24 text-sm text-gray-600 mr-3">{key}</div>
          <div className="flex-1">
            <div className="bg-gray-200 rounded-full h-4 relative">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${(value / maxValue) * 100}%` }}
              ></div>
              <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-800 font-medium">
                {value}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const PieChart = ({ data, title }) => {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  return (
    <div className="space-y-2">
      {Object.entries(data).map(([key, value], index) => {
        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];

        return (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2`}></div>
              <span className="text-sm text-gray-600">{key}</span>
            </div>
            <div className="text-sm font-medium">
              {value} ({percentage}%)
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DepartmentTable = ({ data }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Department
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total Students
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Placed
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Placement Rate
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((dept) => (
          <tr key={dept.department}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {dept.department}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {dept.totalStudents}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {dept.placed}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div className="flex items-center">
                <span className={`font-medium ${
                  dept.placementRate >= 80 ? 'text-green-600' :
                  dept.placementRate >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {dept.placementRate.toFixed(1)}%
                </span>
                <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      dept.placementRate >= 80 ? 'bg-green-500' :
                      dept.placementRate >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(dept.placementRate, 100)}%` }}
                  ></div>
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TopCompaniesTable = ({ data }) => (
  <div className="space-y-3">
    {data.map((company, index) => (
      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
            {index + 1}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{company.name}</h4>
            <p className="text-sm text-gray-600">₹{company.ctc} LPA • {company.category}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">{company.applicationCount}</div>
          <div className="text-sm text-gray-500">applications</div>
        </div>
      </div>
    ))}
  </div>
);

export default function AnalyticsPage() {
  const { user, token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/overview', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== USER_ROLES.COORDINATOR) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-8">
            <p className="text-gray-600">Only coordinators can access analytics.</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-8">
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-8">
            <p className="text-red-600">Error loading analytics: {error}</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Placement Analytics</h1>
            <p className="text-gray-600">
              Comprehensive insights into placement activities and performance
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Students"
              value={analytics.overview.totalStudents}
              color="blue"
            />
            <StatCard
              title="Total Companies"
              value={analytics.overview.totalCompanies}
              color="green"
            />
            <StatCard
              title="Applications"
              value={analytics.overview.totalApplications}
              color="purple"
            />
            <StatCard
              title="Placed Students"
              value={analytics.overview.selectedApplications}
              color="green"
            />
            <StatCard
              title="Placement Rate"
              value={`${analytics.overview.placementRate}%`}
              color={analytics.overview.placementRate >= 70 ? 'green' : analytics.overview.placementRate >= 50 ? 'yellow' : 'red'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application Status Distribution */}
            <ChartCard title="Applications by Status">
              <PieChart data={analytics.applicationsByStatus} />
            </ChartCard>

            {/* Company Category Distribution */}
            <ChartCard title="Applications by Company Category">
              <PieChart data={analytics.categoryStats} />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Package Distribution */}
            <ChartCard title="Package Distribution (Placed Students)">
              <BarChart data={analytics.packageDistribution} />
            </ChartCard>

            {/* CGPA Distribution */}
            <ChartCard title="CGPA Distribution (Placed Students)">
              <BarChart data={analytics.cgpaDistribution} />
            </ChartCard>
          </div>

          {/* Top Companies */}
          <ChartCard title="Top Companies by Applications">
            {analytics.topCompanies.length > 0 ? (
              <TopCompaniesTable data={analytics.topCompanies} />
            ) : (
              <p className="text-gray-500 text-center py-4">No application data available</p>
            )}
          </ChartCard>

          {/* Department-wise Performance */}
          <ChartCard title="Department-wise Placement Performance">
            {analytics.departmentAnalytics.length > 0 ? (
              <DepartmentTable data={analytics.departmentAnalytics} />
            ) : (
              <p className="text-gray-500 text-center py-4">No department data available</p>
            )}
          </ChartCard>

          {/* Monthly Trends */}
          {Object.keys(analytics.monthlyStats).length > 0 && (
            <ChartCard title="Monthly Application Trends">
              <div className="space-y-2">
                {Object.entries(analytics.monthlyStats)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([month, stats]) => (
                    <div key={month} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{month}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          Applications: {stats.total}
                        </span>
                        <span className="text-sm text-green-600">
                          Placed: {stats.selected}
                        </span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </ChartCard>
          )}

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Overall Performance</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {analytics.overview.placementRate >= 70
                      ? 'Excellent placement rate! The system is performing very well.'
                      : analytics.overview.placementRate >= 50
                      ? 'Good placement rate with room for improvement.'
                      : 'Placement rate needs attention. Consider more company outreach.'
                    }
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">Top Performer</h4>
                  <p className="text-sm text-green-700 mt-1">
                    {analytics.departmentAnalytics.length > 0
                      ? `${analytics.departmentAnalytics.reduce((top, current) =>
                          current.placementRate > top.placementRate ? current : top
                        ).department} leads with ${analytics.departmentAnalytics.reduce((top, current) =>
                          current.placementRate > top.placementRate ? current : top
                        ).placementRate.toFixed(1)}% placement rate.`
                      : 'No department data available yet.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}