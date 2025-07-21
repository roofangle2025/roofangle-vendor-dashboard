import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, X, Download, Calendar, FileText, BarChart3, TrendingUp, Star, User, Package, Clock } from 'lucide-react';
import { ReportData } from '../types';
import { mockReportsData } from '../data/mockData';

type SortField = 'orderNumber' | 'itemNumber' | 'deliverTimestamp' | 'sketchPersonName' | 'qaPersonName' | 'sketchPersonQuality' | 'qaPersonQuality';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  businessGroup: 'all' | 'Ridgetop' | 'Skyline';
  status: 'all' | 'completed' | 'delivered' | 'in-progress';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'quarter';
  qualityRange: 'all' | '1-2' | '3' | '4-5';
  sketchPerson: 'all' | string;
  qaPerson: 'all' | string;
}

export const ReportsManagementPage: React.FC = () => {
  const [reports, setReports] = useState<ReportData[]>(mockReportsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('deliverTimestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<FilterState>({
    businessGroup: 'all',
    status: 'all',
    dateRange: 'all',
    qualityRange: 'all',
    sketchPerson: 'all',
    qaPerson: 'all'
  });

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
      businessGroup: 'all',
      status: 'all',
      dateRange: 'all',
      qualityRange: 'all',
      sketchPerson: 'all',
      qaPerson: 'all'
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return searchTerm !== '' || 
           filters.businessGroup !== 'all' || 
           filters.status !== 'all' || 
           filters.dateRange !== 'all' ||
           filters.qualityRange !== 'all' ||
           filters.sketchPerson !== 'all' ||
           filters.qaPerson !== 'all';
  };

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

  const getQualityColor = (quality: number) => {
    if (quality >= 4) return 'text-green-600';
    if (quality >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityStars = (quality: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < quality ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredAndSortedReports = useMemo(() => {
    let filtered = reports;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.itemNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.sketchPersonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.qaPersonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Business Group filter
    if (filters.businessGroup !== 'all') {
      filtered = filtered.filter(report => report.businessGroup === filters.businessGroup);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(report => report.status.toLowerCase() === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'all' && filters.dateRange !== 'quarter') {
      const now = new Date();
      filtered = filtered.filter(report => {
        if (!report.deliverTimestamp) return false;
        const daysDiff = Math.floor((now.getTime() - report.deliverTimestamp.getTime()) / (1000 * 60 * 60 * 24));
        switch (filters.dateRange) {
          case 'today': return daysDiff === 0;
          case 'week': return daysDiff <= 7;
          case 'month': return daysDiff <= 30;
          default: return true;
        }
      });
    } else if (filters.dateRange === 'quarter') {
      const now = new Date();
      filtered = filtered.filter(report => {
        if (!report.deliverTimestamp) return false;
        const daysDiff = Math.floor((now.getTime() - report.deliverTimestamp.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 90;
      });
    }

    // Quality range filter
    if (filters.qualityRange !== 'all') {
      filtered = filtered.filter(report => {
        const avgQuality = (report.sketchPersonQuality + report.qaPersonQuality) / 2;
        switch (filters.qualityRange) {
          case '1-2': return avgQuality >= 1 && avgQuality <= 2;
          case '3': return avgQuality >= 2.5 && avgQuality <= 3.5;
          case '4-5': return avgQuality >= 3.5 && avgQuality <= 5;
          default: return true;
        }
      });
    }

    // Sketch person filter
    if (filters.sketchPerson !== 'all') {
      filtered = filtered.filter(report => report.sketchPersonName === filters.sketchPerson);
    }

    // QA person filter
    if (filters.qaPerson !== 'all') {
      filtered = filtered.filter(report => report.qaPersonName === filters.qaPerson);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'orderNumber':
          aValue = a.orderNumber.toLowerCase();
          bValue = b.orderNumber.toLowerCase();
          break;
        case 'itemNumber':
          aValue = a.itemNumber.toLowerCase();
          bValue = b.itemNumber.toLowerCase();
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
        case 'sketchPersonQuality':
          aValue = a.sketchPersonQuality;
          bValue = b.sketchPersonQuality;
          break;
        case 'qaPersonQuality':
          aValue = a.qaPersonQuality;
          bValue = b.qaPersonQuality;
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
    // Create CSV content
    const headers = [
      'Order Number',
      'Item Number', 
      'Deliver Timestamp',
      'Sketch Person',
      'QA Person',
      'Sketch Quality',
      'QA Quality',
      'Business Group',
      'Status',
      'Customer Name'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredAndSortedReports.map(report => [
        report.orderNumber,
        report.itemNumber,
        report.deliverTimestamp ? report.deliverTimestamp.toISOString() : 'Not delivered',
        report.sketchPersonName,
        report.qaPersonName,
        report.sketchPersonQuality,
        report.qaPersonQuality,
        report.businessGroup,
        report.status,
        `"${report.customerName}"`
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reports_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get unique values for filter dropdowns
  const uniqueSketchPersons = [...new Set(reports.map(r => r.sketchPersonName))];
  const uniqueQAPersons = [...new Set(reports.map(r => r.qaPersonName))];

  // Calculate summary stats
  const totalReports = filteredAndSortedReports.length;
  const avgSketchQuality = totalReports > 0 ? 
    filteredAndSortedReports.reduce((sum, r) => sum + r.sketchPersonQuality, 0) / totalReports : 0;
  const avgQAQuality = totalReports > 0 ? 
    filteredAndSortedReports.reduce((sum, r) => sum + r.qaPersonQuality, 0) / totalReports : 0;
  const deliveredCount = filteredAndSortedReports.filter(r => r.deliverTimestamp).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Reports Management</h1>
        <button 
          onClick={handleExportReports}
          className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Export Reports</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{totalReports}</p>
              <p className="text-gray-600 text-sm sm:text-base">Total Reports</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{deliveredCount}</p>
              <p className="text-gray-600 text-sm sm:text-base">Delivered</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{avgSketchQuality.toFixed(1)}</p>
              <p className="text-gray-600 text-sm sm:text-base">Avg Sketch Quality</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{avgQAQuality.toFixed(1)}</p>
              <p className="text-gray-600 text-sm sm:text-base">Avg QA Quality</p>
            </div>
          </div>
        </div>
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
                placeholder="Search by order number, item number, person name, or customer..."
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as FilterState['status'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="delivered">Delivered</option>
                  <option value="in-progress">In Progress</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as FilterState['dateRange'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                </select>
              </div>

              {/* Quality Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quality Range</label>
                <select
                  value={filters.qualityRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, qualityRange: e.target.value as FilterState['qualityRange'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Quality</option>
                  <option value="4-5">High (4-5 stars)</option>
                  <option value="3">Medium (3 stars)</option>
                  <option value="1-2">Low (1-2 stars)</option>
                </select>
              </div>

              {/* Sketch Person Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sketch Person</label>
                <select
                  value={filters.sketchPerson}
                  onChange={(e) => setFilters(prev => ({ ...prev, sketchPerson: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Sketch</option>
                  {uniqueSketchPersons.map(person => (
                    <option key={person} value={person}>{person}</option>
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
                  <option value="all">All QA</option>
                  {uniqueQAPersons.map(person => (
                    <option key={person} value={person}>{person}</option>
                  ))}
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

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Mobile Card View */}
        <div className="block xl:hidden">
          {filteredAndSortedReports.length === 0 ? (
            <div className="p-6 text-center">
              <FileText className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
              <p className="text-gray-500 text-lg font-medium">No reports found</p>
              <p className="text-gray-400 text-sm mt-1">
                {hasActiveFilters() 
                  ? 'Try adjusting your search or filters'
                  : 'No reports available'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAndSortedReports.map((report) => (
                <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-gray-900">{report.orderNumber}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Item #{report.itemNumber}</p>
                      <p className="text-sm text-gray-500">{report.customerName}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-600 font-medium">Sketch Person:</p>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{report.sketchPersonName}</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        {getQualityStars(report.sketchPersonQuality)}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">QA Person:</p>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{report.qaPersonName}</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        {getQualityStars(report.qaPersonQuality)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                    <span>{formatTimestamp(report.deliverTimestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden xl:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('orderNumber')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Order Number</span>
                    <span className="text-blue-600">{getSortIcon('orderNumber')}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('itemNumber')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Item Number</span>
                    <span className="text-blue-600">{getSortIcon('itemNumber')}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('deliverTimestamp')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Deliver Timestamp</span>
                    <span className="text-blue-600">{getSortIcon('deliverTimestamp')}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('sketchPersonName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Sketch Person</span>
                    <span className="text-blue-600">{getSortIcon('sketchPersonName')}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('qaPersonName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>QA Person</span>
                    <span className="text-blue-600">{getSortIcon('qaPersonName')}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('sketchPersonQuality')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Sketch Quality</span>
                    <span className="text-blue-600">{getSortIcon('sketchPersonQuality')}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('qaPersonQuality')}
                >
                  <div className="flex items-center space-x-1">
                    <span>QA Quality</span>
                    <span className="text-blue-600">{getSortIcon('qaPersonQuality')}</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
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
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.orderNumber}</div>
                      <div className="text-xs text-gray-500">{report.customerName}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">#{report.itemNumber}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatTimestamp(report.deliverTimestamp)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{report.sketchPersonName}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{report.qaPersonName}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {getQualityStars(report.sketchPersonQuality)}
                        <span className={`ml-2 text-sm font-medium ${getQualityColor(report.sketchPersonQuality)}`}>
                          {report.sketchPersonQuality}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {getQualityStars(report.qaPersonQuality)}
                        <span className={`ml-2 text-sm font-medium ${getQualityColor(report.qaPersonQuality)}`}>
                          {report.qaPersonQuality}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};