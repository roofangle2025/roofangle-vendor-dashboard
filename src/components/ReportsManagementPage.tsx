import React, { useState, useMemo } from 'react';
import { Download, FileText, User, Star, Clock, Search, Filter, ChevronDown, X, Calendar } from 'lucide-react';
import { ReportData } from '../types';
import { mockReportsData } from '../data/mockData';

type ViewType = 'vendor' | 'internal';
type SortField = 'orderNumber' | 'deliverTimestamp' | 'sketchPersonName' | 'qaPersonName';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  sketchPerson: 'all' | string;
  qaPerson: 'all' | string;
  businessGroup: 'all' | 'Ridgetop' | 'Skyline';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  deliveryStatus: 'all' | 'delivered' | 'pending';
}

export const ReportsManagementPage: React.FC = () => {
  const [reports, setReports] = useState<ReportData[]>(mockReportsData);
  const [activeView, setActiveView] = useState<ViewType>('vendor');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('deliverTimestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<FilterState>({
    sketchPerson: 'all',
    qaPerson: 'all',
    businessGroup: 'all',
    dateRange: 'all',
    deliveryStatus: 'all'
  });

  const formatTimestamp = (date: Date | null) => {
    if (!date) return 'Not delivered';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQualityStars = (quality: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < quality ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 4) return 'text-green-600';
    if (quality >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'deliverTimestamp' ? 'desc' : 'asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const clearFilters = () => {
    setFilters({
      sketchPerson: 'all',
      qaPerson: 'all',
      businessGroup: 'all',
      dateRange: 'all',
      deliveryStatus: 'all'
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return searchTerm !== '' || 
           filters.sketchPerson !== 'all' || 
           filters.qaPerson !== 'all' || 
           filters.businessGroup !== 'all' || 
           filters.dateRange !== 'all' ||
           filters.deliveryStatus !== 'all';
  };

  // Get unique names for filter dropdowns
  const uniqueSketchPersons = [...new Set(reports.map(r => r.sketchPersonName))].sort();
  const uniqueQAPersons = [...new Set(reports.map(r => r.qaPersonName))].sort();

  const filteredAndSortedReports = useMemo(() => {
    let filtered = reports;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.sketchPersonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.qaPersonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.businessGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.service && report.service.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sketch Person filter
    if (filters.sketchPerson !== 'all') {
      filtered = filtered.filter(report => report.sketchPersonName === filters.sketchPerson);
    }

    // QA Person filter
    if (filters.qaPerson !== 'all') {
      filtered = filtered.filter(report => report.qaPersonName === filters.qaPerson);
    }

    // Business Group filter
    if (filters.businessGroup !== 'all') {
      filtered = filtered.filter(report => report.businessGroup === filters.businessGroup);
    }

    // Delivery Status filter
    if (filters.deliveryStatus !== 'all') {
      if (filters.deliveryStatus === 'delivered') {
        filtered = filtered.filter(report => report.deliverTimestamp !== null);
      } else {
        filtered = filtered.filter(report => report.deliverTimestamp === null);
      }
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(report => {
        if (!report.deliverTimestamp) return filters.dateRange === 'all';
        
        const daysDiff = Math.floor((now.getTime() - report.deliverTimestamp.getTime()) / (1000 * 60 * 60 * 24));
        switch (filters.dateRange) {
          case 'today': return daysDiff === 0;
          case 'week': return daysDiff <= 7;
          case 'month': return daysDiff <= 30;
          default: return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'orderNumber':
          aValue = a.orderNumber.toLowerCase();
          bValue = b.orderNumber.toLowerCase();
          break;
        case 'deliverTimestamp':
          aValue = a.deliverTimestamp ? a.deliverTimestamp.getTime() : 0;
          bValue = b.deliverTimestamp ? b.deliverTimestamp.getTime() : 0;
          break;
        case 'sketchPersonName':
          aValue = a.sketchPersonName.toLowerCase();
          bValue = b.sketchPersonName.toLowerCase();
          break;
        case 'qaPersonName':
          aValue = a.qaPersonName.toLowerCase();
          bValue = b.qaPersonName.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [reports, searchTerm, filters, sortField, sortDirection]);

  const handleExportReports = () => {
    const headers = activeView === 'vendor' 
      ? ['Delivery Timestamp', 'Order Number', 'Item Number', 'Business Group', 'Address', 'Rush', 'PDF', 'Property Type', 'Report Type']
      : ['Delivery Timestamp', 'Order Number', 'Item Number', 'Business Group', 'Address', 'Rush', 'PDF', 'Property Type', 'Report Type', 'QA Name', 'Sketch Name', 'Sketch Quality', 'QA Quality'];

    const csvContent = [
      headers.join(','),
      ...filteredAndSortedReports.map(report => {
        if (activeView === 'vendor') {
          return [
            report.deliverTimestamp ? report.deliverTimestamp.toISOString() : 'Not delivered',
            report.orderNumber,
            report.itemNumber,
            report.businessGroup,
            `"${report.propertyType || 'Not specified'}"`, // Using propertyType as address placeholder
            report.service?.includes('Rush') ? 'Yes' : 'No', // Rush order indicator
            'Yes', // PDF - assuming all reports have PDF
            report.propertyType || 'Not specified',
            report.service || 'Not specified'
          ].join(',');
        } else {
          return [
            report.deliverTimestamp ? report.deliverTimestamp.toISOString() : 'Not delivered',
            report.orderNumber,
            report.itemNumber,
            report.businessGroup,
            `"${report.propertyType || 'Not specified'}"`, // Using propertyType as address placeholder
            report.service?.includes('Rush') ? 'Yes' : 'No', // Rush order indicator
            'Yes', // PDF - assuming all reports have PDF
            report.propertyType || 'Not specified',
            report.service || 'Not specified',
            report.qaPersonName,
            report.sketchPersonName,
            report.sketchPersonQuality,
            report.qaPersonQuality
          ].join(',');
        }
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeView}_reports_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Reports Dashboard</h1>
        <button 
          onClick={handleExportReports}
          className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Export {activeView === 'vendor' ? 'Vendor' : 'Internal'} Report</span>
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
                placeholder="Search by order number, customer name, sketch person, QA person, or business group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Sketch Person Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sketch Person</label>
                <select
                  value={filters.sketchPerson}
                  onChange={(e) => setFilters(prev => ({ ...prev, sketchPerson: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Sketch Persons</option>
                  {uniqueSketchPersons.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* QA Person Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">QA Person</label>
                <select
                  value={filters.qaPerson}
                  onChange={(e) => setFilters(prev => ({ ...prev, qaPerson: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All QA Persons</option>
                  {uniqueQAPersons.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

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

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as FilterState['dateRange'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                </select>
              </div>

              {/* Delivery Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.deliveryStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, deliveryStatus: e.target.value as FilterState['deliveryStatus'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="delivered">Delivered</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredAndSortedReports.length} of {reports.length} reports
            {hasActiveFilters() && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Filtered
              </span>
            )}
          </p>
        </div>
      </div>

      {/* View Toggle and Tables */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveView('vendor')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeView === 'vendor'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Vendor Report</span>
              </div>
            </button>
            <button
              onClick={() => setActiveView('internal')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeView === 'internal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Internal Report</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Vendor Report View */}
          {activeView === 'vendor' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort('orderNumber')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Order Number</span>
                        <span className="text-blue-600">{getSortIcon('orderNumber')}</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Number
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort('deliverTimestamp')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Deliver Timestamp</span>
                        <span className="text-blue-600">{getSortIcon('deliverTimestamp')}</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedReports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FileText className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-gray-500 text-lg font-medium">No reports found</p>
                          <p className="text-gray-400 text-sm mt-1">
                            {hasActiveFilters() 
                              ? 'Try adjusting your search or filters'
                              : 'No reports available'
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{report.orderNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">#{report.itemNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {formatTimestamp(report.deliverTimestamp)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{report.businessGroup}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{report.customerName}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Internal Report View */}
          {activeView === 'internal' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort('orderNumber')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Order Number</span>
                        <span className="text-blue-600">{getSortIcon('orderNumber')}</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Number
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort('deliverTimestamp')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Deliver Timestamp</span>
                        <span className="text-blue-600">{getSortIcon('deliverTimestamp')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort('sketchPersonName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Sketch Person</span>
                        <span className="text-blue-600">{getSortIcon('sketchPersonName')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort('qaPersonName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>QA Person</span>
                        <span className="text-blue-600">{getSortIcon('qaPersonName')}</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sketch Quality
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QA Quality
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <User className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-gray-500 text-lg font-medium">No reports found</p>
                          <p className="text-gray-400 text-sm mt-1">
                            {hasActiveFilters() 
                              ? 'Try adjusting your search or filters'
                              : 'No reports available'
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{report.orderNumber}</div>
                          <div className="text-xs text-gray-500">{report.customerName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">#{report.itemNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {formatTimestamp(report.deliverTimestamp)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">{report.sketchPersonName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">{report.qaPersonName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            {getQualityStars(report.sketchPersonQuality)}
                            <span className={`ml-2 text-sm font-medium ${getQualityColor(report.sketchPersonQuality)}`}>
                              {report.sketchPersonQuality}/5
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            {getQualityStars(report.qaPersonQuality)}
                            <span className={`ml-2 text-sm font-medium ${getQualityColor(report.qaPersonQuality)}`}>
                              {report.qaPersonQuality}/5
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};