import React, { useState, useMemo } from 'react';
import { BarChart3, User, Star, TrendingUp, Award, Users } from 'lucide-react';
import { mockReportsData } from '../data/mockData';

type TabType = 'sketch' | 'qa';

interface EmployeeStats {
  employeeName: string;
  numberOfOrders: number;
  averagePercentage: number;
  totalQualityPoints: number;
}

export const QualityAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('sketch');

  const getQualityColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 80) return <Award className="w-4 h-4 text-green-600" />;
    if (percentage >= 60) return <TrendingUp className="w-4 h-4 text-yellow-600" />;
    return <User className="w-4 h-4 text-red-600" />;
  };

  // Calculate Sketch Quality Statistics
  const sketchStats = useMemo(() => {
    const employeeMap = new Map<string, { orders: number; totalQuality: number }>();
    
    // Only include delivered reports for accurate statistics
    const deliveredReports = mockReportsData.filter(report => report.deliverTimestamp !== null);
    
    deliveredReports.forEach(report => {
      const name = report.sketchPersonName;
      const quality = report.sketchPersonQuality;
      
      if (employeeMap.has(name)) {
        const existing = employeeMap.get(name)!;
        employeeMap.set(name, {
          orders: existing.orders + 1,
          totalQuality: existing.totalQuality + quality
        });
      } else {
        employeeMap.set(name, {
          orders: 1,
          totalQuality: quality
        });
      }
    });

    const stats: EmployeeStats[] = Array.from(employeeMap.entries()).map(([name, data]) => ({
      employeeName: name,
      numberOfOrders: data.orders,
      totalQualityPoints: data.totalQuality,
      averagePercentage: Math.round((data.totalQuality / (data.orders * 5)) * 100) // Convert 1-5 scale to percentage
    }));

    // Sort by average percentage descending
    return stats.sort((a, b) => b.averagePercentage - a.averagePercentage);
  }, []);

  // Calculate QA Quality Statistics
  const qaStats = useMemo(() => {
    const employeeMap = new Map<string, { orders: number; totalQuality: number }>();
    
    // Only include delivered reports for accurate statistics
    const deliveredReports = mockReportsData.filter(report => report.deliverTimestamp !== null);
    
    deliveredReports.forEach(report => {
      const name = report.qaPersonName;
      const quality = report.qaPersonQuality;
      
      if (employeeMap.has(name)) {
        const existing = employeeMap.get(name)!;
        employeeMap.set(name, {
          orders: existing.orders + 1,
          totalQuality: existing.totalQuality + quality
        });
      } else {
        employeeMap.set(name, {
          orders: 1,
          totalQuality: quality
        });
      }
    });

    const stats: EmployeeStats[] = Array.from(employeeMap.entries()).map(([name, data]) => ({
      employeeName: name,
      numberOfOrders: data.orders,
      totalQualityPoints: data.totalQuality,
      averagePercentage: Math.round((data.totalQuality / (data.orders * 5)) * 100) // Convert 1-5 scale to percentage
    }));

    // Sort by average percentage descending
    return stats.sort((a, b) => b.averagePercentage - a.averagePercentage);
  }, []);

  const currentStats = activeTab === 'sketch' ? sketchStats : qaStats;
  const totalOrders = currentStats.reduce((sum, stat) => sum + stat.numberOfOrders, 0);
  const overallAverage = currentStats.length > 0 
    ? Math.round(currentStats.reduce((sum, stat) => sum + stat.averagePercentage, 0) / currentStats.length)
    : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Quality Analytics</h1>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{currentStats.length}</p>
              <p className="text-gray-600 text-sm sm:text-base">
                {activeTab === 'sketch' ? 'Sketch' : 'QA'} Employees
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{totalOrders}</p>
              <p className="text-gray-600 text-sm sm:text-base">Total Orders</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{overallAverage}%</p>
              <p className="text-gray-600 text-sm sm:text-base">Overall Average</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Quality Analytics Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max">
            <button
              onClick={() => setActiveTab('sketch')}
              className={`flex items-center space-x-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                activeTab === 'sketch'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Sketch Quality</span>
              <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                activeTab === 'sketch' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {sketchStats.length}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('qa')}
              className={`flex items-center space-x-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                activeTab === 'qa'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>QA Quality</span>
              <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                activeTab === 'qa' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {qaStats.length}
              </span>
            </button>
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {/* Quality Analytics Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. of Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <BarChart3 className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No quality data available</p>
                        <p className="text-gray-400 text-sm mt-1">
                          Complete some orders to see quality analytics
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentStats.map((stat, index) => (
                    <tr key={stat.employeeName} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-700">
                              {stat.employeeName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{stat.employeeName}</div>
                            <div className="text-xs text-gray-500">
                              {activeTab === 'sketch' ? 'Sketch Specialist' : 'QA Specialist'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BarChart3 className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{stat.numberOfOrders}</span>
                          <span className="text-xs text-gray-500 ml-1">orders</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                stat.averagePercentage >= 80 ? 'bg-green-500' :
                                stat.averagePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${stat.averagePercentage}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold px-2 py-1 rounded-full ${getQualityColor(stat.averagePercentage)}`}>
                            {stat.averagePercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getPerformanceIcon(stat.averagePercentage)}
                          <span className={`text-sm font-medium ${
                            stat.averagePercentage >= 80 ? 'text-green-600' :
                            stat.averagePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {stat.averagePercentage >= 80 ? 'Excellent' :
                             stat.averagePercentage >= 60 ? 'Good' : 'Needs Improvement'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Statistics */}
          {currentStats.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-2xl font-bold text-green-600">
                    {currentStats.filter(s => s.averagePercentage >= 80).length}
                  </div>
                  <div className="text-sm text-green-700 font-medium">Excellent Performers</div>
                  <div className="text-xs text-green-600">≥80% Quality</div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">
                    {currentStats.filter(s => s.averagePercentage >= 60 && s.averagePercentage < 80).length}
                  </div>
                  <div className="text-sm text-yellow-700 font-medium">Good Performers</div>
                  <div className="text-xs text-yellow-600">60-79% Quality</div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="text-2xl font-bold text-red-600">
                    {currentStats.filter(s => s.averagePercentage < 60).length}
                  </div>
                  <div className="text-sm text-red-700 font-medium">Need Improvement</div>
                  <div className="text-xs text-red-600">&lt;60% Quality</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};