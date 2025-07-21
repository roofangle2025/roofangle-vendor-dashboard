import React, { useState, useMemo } from 'react';
import { BarChart3, User, Star, TrendingUp, Award, Users, Search, Filter, ChevronDown, X } from 'lucide-react';
import { mockReportsData } from '../data/mockData';

type TabType = 'sketch' | 'qa';

interface FilterState {
  searchTerm: string;
  businessGroup: 'all' | 'Ridgetop' | 'Skyline';
  performanceLevel: 'all' | 'excellent' | 'good' | 'needs-improvement';
  orderCountRange: 'all' | '1-5' | '6-10' | '11+';
  dateRange: 'all' | 'week' | 'month' | 'quarter';
}

interface EmployeeStats {
  employeeName: string;
  numberOfOrders: number;
  averagePercentage: number;
  totalQualityPoints: number;
  businessGroups: string[];
}

export const QualityAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('sketch');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    businessGroup: 'all',
    performanceLevel: 'all',
    orderCountRange: 'all',
    dateRange: 'all'
  });

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
      averagePercentage: Math.round((data.totalQuality / (data.orders * 5)) * 100), // Convert 1-5 scale to percentage
      businessGroups: [...new Set(deliveredReports.filter(r => r.sketchPersonName === name).map(r => r.businessGroup))]
    }));

    // Sort by average percentage descending
    return stats.sort((a, b) => b.averagePercentage - a.averagePercentage);
  }, [filters.dateRange]);

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
      averagePercentage: Math.round((data.totalQuality / (data.orders * 5)) * 100), // Convert 1-5 scale to percentage
      businessGroups: [...new Set(deliveredReports.filter(r => r.qaPersonName === name).map(r => r.businessGroup))]
    }));

    // Sort by average percentage descending
    return stats.sort((a, b) => b.averagePercentage - a.averagePercentage);
  }, [filters.dateRange]);

  // Apply filters to current stats
  const filteredStats = useMemo(() => {
    const currentStats = activeTab === 'sketch' ? sketchStats : qaStats;
    let filtered = currentStats;

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(stat =>
        stat.employeeName.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Business Group filter
    if (filters.businessGroup !== 'all') {
      filtered = filtered.filter(stat =>
        stat.businessGroups.includes(filters.businessGroup)
      );
    }

    // Performance Level filter
    if (filters.performanceLevel !== 'all') {
      filtered = filtered.filter(stat => {
        switch (filters.performanceLevel) {
          case 'excellent': return stat.averagePercentage >= 80;
          case 'good': return stat.averagePercentage >= 60 && stat.averagePercentage < 80;
          case 'needs-improvement': return stat.averagePercentage < 60;
          default: return true;
        }
      });
    }

    // Order Count Range filter
    if (filters.orderCountRange !== 'all') {
      filtered = filtered.filter(stat => {
        switch (filters.orderCountRange) {
          case '1-5': return stat.numberOfOrders >= 1 && stat.numberOfOrders <= 5;
          case '6-10': return stat.numberOfOrders >= 6 && stat.numberOfOrders <= 10;
          case '11+': return stat.numberOfOrders >= 11;
          default: return true;
        }
      });
    }

    return filtered;
  }, [sketchStats, qaStats, activeTab, filters]);

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      businessGroup: 'all',
      performanceLevel: 'all',
      orderCountRange: 'all',
      dateRange: 'all'
    });
  };

  const hasActiveFilters = () => {
    return filters.searchTerm !== '' || 
           filters.businessGroup !== 'all' || 
           filters.performanceLevel !== 'all' || 
           filters.orderCountRange !== 'all' || 
           filters.dateRange !== 'all';
  };

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

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search employees by name..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-lg border transition-colors duration-200 text-sm ${
                showFilters || hasActiveFilters()
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Business Group Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Group</label>
                <select
                  value={filters.businessGroup}
                  onChange={(e) => setFilters(prev => ({ ...prev, businessGroup: e.target.value as FilterState['businessGroup'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Groups</option>
                  <option value="Ridgetop">Ridgetop</option>
                  <option value="Skyline">Skyline</option>
                </select>
              </div>

              {/* Performance Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Performance Level</label>
                <select
                  value={filters.performanceLevel}
                  onChange={(e) => setFilters(prev => ({ ...prev, performanceLevel: e.target.value as FilterState['performanceLevel'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="excellent">Excellent (≥80%)</option>
                  <option value="good">Good (60-79%)</option>
                  <option value="needs-improvement">Needs Improvement (<60%)</option>
                </select>
              </div>

              {/* Order Count Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Count</label>
                <select
                  value={filters.orderCountRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, orderCountRange: e.target.value as FilterState['orderCountRange'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Ranges</option>
                  <option value="1-5">1-5 Orders</option>
                  <option value="6-10">6-10 Orders</option>
                  <option value="11+">11+ Orders</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as FilterState['dateRange'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredStats.length} of {currentStats.length} {activeTab === 'sketch' ? 'sketch' : 'QA'} employees
            {hasActiveFilters() && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Filtered
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{filteredStats.length}</p>
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
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{filteredStats.reduce((sum, stat) => sum + stat.numberOfOrders, 0)}</p>
              <p className="text-gray-600 text-sm sm:text-base">Total Orders</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {filteredStats.length > 0 
                  ? Math.round(filteredStats.reduce((sum, stat) => sum + stat.averagePercentage, 0) / filteredStats.length)
                  : 0}%
              </p>
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
                {filteredStats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <BarChart3 className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">
                          {hasActiveFilters() ? 'No employees found' : 'No quality data available'}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          {hasActiveFilters() 
                            ? 'Try adjusting your search or filters'
                            : 'Complete some orders to see quality analytics'
                          }
                        </p>
                        {hasActiveFilters() && (
                          <button
                            onClick={clearFilters}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStats.map((stat, index) => (
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
          {filteredStats.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredStats.filter(s => s.averagePercentage >= 80).length}
                  </div>
                  <div className="text-sm text-green-700 font-medium">Excellent Performers</div>
                  <div className="text-xs text-green-600">≥80% Quality</div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">
                    {filteredStats.filter(s => s.averagePercentage >= 60 && s.averagePercentage < 80).length}
                  </div>
                  <div className="text-sm text-yellow-700 font-medium">Good Performers</div>
                  <div className="text-xs text-yellow-600">60-79% Quality</div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="text-2xl font-bold text-red-600">
                    {filteredStats.filter(s => s.averagePercentage < 60).length}
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