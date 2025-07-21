import React, { useState, useMemo } from 'react';
import { Users, Package, TrendingUp, Search, Filter, ChevronDown, X, Download, Star, Calendar } from 'lucide-react';
import { mockReportsData } from '../data/mockData';

type SortField = 'vendorName' | 'numberOfDeliveries' | 'averageQuality' | 'totalOrders';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  searchTerm: string;
  performanceLevel: 'all' | 'excellent' | 'good' | 'needs-improvement';
  deliveryCountRange: 'all' | '1-5' | '6-10' | '11+';
  dateRange: 'all' | 'week' | 'month' | 'quarter';
}

interface VendorStats {
  vendorName: string;
  numberOfDeliveries: number;
  totalOrders: number;
  averageQuality: number;
  lastDelivery: Date | null;
}

export const VendorReportPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('numberOfDeliveries');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    performanceLevel: 'all',
    deliveryCountRange: 'all',
    dateRange: 'all'
  });

  // Calculate vendor statistics from reports data
  const vendorStats = useMemo(() => {
    // Group by customer name (treating customers as vendors)
    const vendorMap = new Map<string, { deliveries: number; totalOrders: number; qualitySum: number; qualityCount: number; lastDelivery: Date | null }>();
    
    mockReportsData.forEach(report => {
      const vendorName = report.customerName;
      const isDelivered = report.deliverTimestamp !== null;
      const quality = (report.sketchPersonQuality + report.qaPersonQuality) / 2; // Average quality
      
      if (vendorMap.has(vendorName)) {
        const existing = vendorMap.get(vendorName)!;
        vendorMap.set(vendorName, {
          deliveries: existing.deliveries + (isDelivered ? 1 : 0),
          totalOrders: existing.totalOrders + 1,
          qualitySum: existing.qualitySum + quality,
          qualityCount: existing.qualityCount + 1,
          lastDelivery: isDelivered && report.deliverTimestamp && (!existing.lastDelivery || report.deliverTimestamp > existing.lastDelivery) 
            ? report.deliverTimestamp 
            : existing.lastDelivery
        });
      } else {
        vendorMap.set(vendorName, {
          deliveries: isDelivered ? 1 : 0,
          totalOrders: 1,
          qualitySum: quality,
          qualityCount: 1,
          lastDelivery: isDelivered ? report.deliverTimestamp : null
        });
      }
    });

    const stats: VendorStats[] = Array.from(vendorMap.entries()).map(([name, data]) => ({
      vendorName: name,
      numberOfDeliveries: data.deliveries,
      totalOrders: data.totalOrders,
      averageQuality: Math.round((data.qualitySum / data.qualityCount) * 20), // Convert 1-5 scale to percentage
      lastDelivery: data.lastDelivery
    }));

    return stats;
  }, []);

  const getQualityColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQualityStars = (quality: number) => {
    const stars = Math.round(quality / 20); // Convert percentage to 1-5 stars
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'vendorName' ? 'asc' : 'desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      performanceLevel: 'all',
      deliveryCountRange: 'all',
      dateRange: 'all'
    });
  };

  const hasActiveFilters = () => {
    return filters.searchTerm !== '' || 
           filters.performanceLevel !== 'all' || 
           filters.deliveryCountRange !== 'all' || 
           filters.dateRange !== 'all';
  };

  const filteredAndSortedVendors = useMemo(() => {
    let filtered = vendorStats;

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.vendorName.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Performance Level filter
    if (filters.performanceLevel !== 'all') {
      filtered = filtered.filter(vendor => {
        switch (filters.performanceLevel) {
          case 'excellent': return vendor.averageQuality >= 80;
          case 'good': return vendor.averageQuality >= 60 && vendor.averageQuality < 80;
          case 'needs-improvement': return vendor.averageQuality < 60;
          default: return true;
        }
      });
    }

    // Delivery Count Range filter
    if (filters.deliveryCountRange !== 'all') {
      filtered = filtered.filter(vendor => {
        switch (filters.deliveryCountRange) {
          case '1-5': return vendor.numberOfDeliveries >= 1 && vendor.numberOfDeliveries <= 5;
          case '6-10': return vendor.numberOfDeliveries >= 6 && vendor.numberOfDeliveries <= 10;
          case '11+': return vendor.numberOfDeliveries >= 11;
          default: return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'vendorName':
          aValue = a.vendorName.toLowerCase();
          bValue = b.vendorName.toLowerCase();
          break;
        case 'numberOfDeliveries':
          aValue = a.numberOfDeliveries;
          bValue = b.numberOfDeliveries;
          break;
        case 'averageQuality':
          aValue = a.averageQuality;
          bValue = b.averageQuality;
          break;
        case 'totalOrders':
          aValue = a.totalOrders;
          bValue = b.totalOrders;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [vendorStats, filters, sortField, sortDirection]);

  const handleExportVendorReport = () => {
    const headers = ['Vendor Name', 'Number of Deliveries', 'Total Orders', 'Average Quality %', 'Last Delivery'];

    const csvContent = [
      headers.join(','),
      ...filteredAndSortedVendors.map(vendor => [
        `"${vendor.vendorName}"`,
        vendor.numberOfDeliveries,
        vendor.totalOrders,
        vendor.averageQuality,
        vendor.lastDelivery ? vendor.lastDelivery.toISOString() : 'No deliveries'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vendor_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'No deliveries';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalDeliveries = filteredAndSortedVendors.reduce((sum, vendor) => sum + vendor.numberOfDeliveries, 0);
  const totalOrders = filteredAndSortedVendors.reduce((sum, vendor) => sum + vendor.totalOrders, 0);
  const overallAverage = filteredAndSortedVendors.length > 0 
    ? Math.round(filteredAndSortedVendors.reduce((sum, vendor) => sum + vendor.averageQuality, 0) / filteredAndSortedVendors.length)
    : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Vendor Report</h1>
        <button 
          onClick={handleExportVendorReport}
          className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Export Vendor Report</span>
          <span className="sm:hidden">Export</span>
        </button>
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
                placeholder="Search vendors by name..."
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <option value="needs-improvement">Needs Improvement (&lt;60%)</option>
                </select>
              </div>

              {/* Delivery Count Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Count</label>
                <select
                  value={filters.deliveryCountRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, deliveryCountRange: e.target.value as FilterState['deliveryCountRange'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Ranges</option>
                  <option value="1-5">1-5 Deliveries</option>
                  <option value="6-10">6-10 Deliveries</option>
                  <option value="11+">11+ Deliveries</option>
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
            Showing {filteredAndSortedVendors.length} of {vendorStats.length} vendors
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
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{filteredAndSortedVendors.length}</p>
              <p className="text-gray-600 text-sm sm:text-base">Active Vendors</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{totalDeliveries}</p>
              <p className="text-gray-600 text-sm sm:text-base">Total Deliveries</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{overallAverage}%</p>
              <p className="text-gray-600 text-sm sm:text-base">Average Quality</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Report Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 text-blue-600 mr-2" />
            Vendor Performance Report
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('vendorName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Vendor Name</span>
                    <span className="text-blue-600">{getSortIcon('vendorName')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('numberOfDeliveries')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Number of Deliveries</span>
                    <span className="text-blue-600">{getSortIcon('numberOfDeliveries')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('totalOrders')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Total Orders</span>
                    <span className="text-blue-600">{getSortIcon('totalOrders')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('averageQuality')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Average Quality</span>
                    <span className="text-blue-600">{getSortIcon('averageQuality')}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Delivery
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedVendors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">
                        {hasActiveFilters() ? 'No vendors found' : 'No vendor data available'}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {hasActiveFilters() 
                          ? 'Try adjusting your search or filters'
                          : 'Complete some orders to see vendor analytics'
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
                filteredAndSortedVendors.map((vendor, index) => (
                  <tr key={vendor.vendorName} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700">
                            {vendor.vendorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{vendor.vendorName}</div>
                          <div className="text-xs text-gray-500">Vendor Partner</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{vendor.numberOfDeliveries}</span>
                        <span className="text-xs text-gray-500 ml-1">delivered</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vendor.totalOrders}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {getQualityStars(vendor.averageQuality)}
                        </div>
                        <span className={`text-sm font-bold px-2 py-1 rounded-full ${getQualityColor(vendor.averageQuality)}`}>
                          {vendor.averageQuality}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{formatDate(vendor.lastDelivery)}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Statistics */}
        {filteredAndSortedVendors.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="text-lg font-bold text-green-600">
                  {filteredAndSortedVendors.filter(v => v.averageQuality >= 80).length}
                </div>
                <div className="text-xs text-green-700 font-medium">High Quality Vendors</div>
                <div className="text-xs text-green-600">≥80% Quality</div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="text-lg font-bold text-yellow-600">
                  {filteredAndSortedVendors.filter(v => v.averageQuality >= 60 && v.averageQuality < 80).length}
                </div>
                <div className="text-xs text-yellow-700 font-medium">Good Quality Vendors</div>
                <div className="text-xs text-yellow-600">60-79% Quality</div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="text-lg font-bold text-red-600">
                  {filteredAndSortedVendors.filter(v => v.averageQuality < 60).length}
                </div>
                <div className="text-xs text-red-700 font-medium">Need Improvement</div>
                <div className="text-xs text-red-600">&lt;60% Quality</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};