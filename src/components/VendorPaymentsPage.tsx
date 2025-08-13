import React, { useState, useMemo } from 'react';
import { CreditCard, DollarSign, Calendar, User, Search, Filter, ChevronDown, X, Download, CheckCircle, Clock, AlertCircle, Eye, RefreshCw, Loader, RotateCcw } from 'lucide-react';
import { User as UserType } from '../types';

type SortField = 'transactionId' | 'customerName' | 'amount' | 'transactionDate' | 'status';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  status: 'all' | 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'all' | 'credit_card' | 'bank_transfer' | 'check' | 'paypal';
  businessGroup: 'all' | 'Ridgetop' | 'Skyline';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'quarter';
  amountRange: 'all' | '0-100' | '100-500' | '500-1000' | '1000+';
}

interface Transaction {
  id: string;
  transactionId: string;
  customerName: string;
  orderNumber: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'bank_transfer' | 'check' | 'paypal';
  transactionDate: Date;
  description: string;
  businessGroup: string;
}

// Mock vendor payment transactions
const mockVendorTransactions: Transaction[] = [
  {
    id: '1',
    transactionId: 'vp_1234567890',
    customerName: 'Jane Smith',
    orderNumber: 'ORD-2025-001',
    amount: 850.00,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    transactionDate: new Date('2025-01-15T10:30:00'),
    description: 'Payment for ESX Report - Sketch Work',
    businessGroup: 'Ridgetop'
  },
  {
    id: '2',
    transactionId: 'vp_0987654321',
    customerName: 'Mike Johnson',
    orderNumber: 'ORD-2025-002',
    amount: 1200.00,
    status: 'completed',
    paymentMethod: 'credit_card',
    transactionDate: new Date('2025-01-14T14:15:00'),
    description: 'Payment for Wall Report - QA Review',
    businessGroup: 'Skyline'
  },
  {
    id: '3',
    transactionId: 'vp_1122334455',
    customerName: 'Sarah Wilson',
    orderNumber: 'ORD-2025-003',
    amount: 675.50,
    status: 'pending',
    paymentMethod: 'check',
    transactionDate: new Date('2025-01-13T09:45:00'),
    description: 'Payment for DAD Report - Sketch Work',
    businessGroup: 'Ridgetop'
  },
  {
    id: '4',
    transactionId: 'vp_5566778899',
    customerName: 'David Brown',
    orderNumber: 'ORD-2025-004',
    amount: 1450.00,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    transactionDate: new Date('2025-01-12T16:20:00'),
    description: 'Payment for Rush Order - Manager Approval',
    businessGroup: 'Skyline'
  },
  {
    id: '5',
    transactionId: 'vp_9988776655',
    customerName: 'Jane Smith',
    orderNumber: 'ORD-2025-005',
    amount: 950.75,
    status: 'failed',
    paymentMethod: 'credit_card',
    transactionDate: new Date('2025-01-11T11:30:00'),
    description: 'Payment for ESX Report - QA Review',
    businessGroup: 'Ridgetop'
  }
];

export const VendorPaymentsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockVendorTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('transactionDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    paymentMethod: 'all',
    businessGroup: 'all',
    dateRange: 'all',
    amountRange: 'all'
  });

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'refunded': return <AlertCircle className="w-4 h-4 text-purple-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPaymentMethodDisplay = (method: Transaction['paymentMethod']) => {
    switch (method) {
      case 'credit_card': return 'Credit Card';
      case 'bank_transfer': return 'Bank Transfer';
      case 'check': return 'Check';
      case 'paypal': return 'PayPal';
      default: return method;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'transactionDate' || field === 'amount' ? 'desc' : 'asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      paymentMethod: 'all',
      businessGroup: 'all',
      dateRange: 'all',
      amountRange: 'all'
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return searchTerm !== '' || 
           filters.status !== 'all' || 
           filters.paymentMethod !== 'all' || 
           filters.businessGroup !== 'all' || 
           filters.dateRange !== 'all' ||
           filters.amountRange !== 'all';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === filters.status);
    }

    // Payment Method filter
    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(transaction => transaction.paymentMethod === filters.paymentMethod);
    }

    // Business Group filter
    if (filters.businessGroup !== 'all') {
      filtered = filtered.filter(transaction => transaction.businessGroup === filters.businessGroup);
    }

    // Amount Range filter
    if (filters.amountRange !== 'all') {
      filtered = filtered.filter(transaction => {
        switch (filters.amountRange) {
          case '0-100': return transaction.amount >= 0 && transaction.amount <= 100;
          case '100-500': return transaction.amount > 100 && transaction.amount <= 500;
          case '500-1000': return transaction.amount > 500 && transaction.amount <= 1000;
          case '1000+': return transaction.amount > 1000;
          default: return true;
        }
      });
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(transaction => {
        const daysDiff = Math.floor((now.getTime() - transaction.transactionDate.getTime()) / (1000 * 60 * 60 * 24));
        switch (filters.dateRange) {
          case 'today': return daysDiff === 0;
          case 'week': return daysDiff <= 7;
          case 'month': return daysDiff <= 30;
          case 'quarter': return daysDiff <= 90;
          default: return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'transactionId':
          aValue = a.transactionId.toLowerCase();
          bValue = b.transactionId.toLowerCase();
          break;
        case 'customerName':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'transactionDate':
          aValue = a.transactionDate.getTime();
          bValue = b.transactionDate.getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transactions, searchTerm, filters, sortField, sortDirection]);

  const handleExportTransactions = () => {
    const headers = ['Transaction ID', 'Vendor Name', 'Order Number', 'Amount', 'Status', 'Payment Method', 'Date', 'Business Group', 'Description'];

    const csvContent = [
      headers.join(','),
      ...filteredAndSortedTransactions.map(transaction => [
        transaction.transactionId,
        `"${transaction.customerName}"`,
        transaction.orderNumber,
        transaction.amount,
        transaction.status,
        getPaymentMethodDisplay(transaction.paymentMethod),
        transaction.transactionDate.toISOString(),
        transaction.businessGroup,
        `"${transaction.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vendor_payments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewTransaction = (transactionId: string) => {
    alert(`View vendor payment details for ${transactionId}`);
  };

  // Calculate summary statistics
  const totalAmount = filteredAndSortedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const completedTransactions = filteredAndSortedTransactions.filter(t => t.status === 'completed').length;
  const pendingTransactions = filteredAndSortedTransactions.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Vendor Payments</h1>
        <button 
          onClick={handleExportTransactions}
          className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Export Vendor Payments</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{formatCurrency(totalAmount)}</p>
              <p className="text-gray-600 text-sm sm:text-base">Total Paid</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{completedTransactions}</p>
              <p className="text-gray-600 text-sm sm:text-base">Completed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{pendingTransactions}</p>
              <p className="text-gray-600 text-sm sm:text-base">Pending</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{filteredAndSortedTransactions.length}</p>
              <p className="text-gray-600 text-sm sm:text-base">Total Payments</p>
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
                placeholder="Search by transaction ID, vendor name, order number, or description..."
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
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value as FilterState['paymentMethod'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Methods</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="paypal">PayPal</option>
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

              {/* Amount Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
                <select
                  value={filters.amountRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, amountRange: e.target.value as FilterState['amountRange'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Amounts</option>
                  <option value="0-100">$0 - $100</option>
                  <option value="100-500">$100 - $500</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="1000+">$1,000+</option>
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
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredAndSortedTransactions.length} of {transactions.length} vendor payments
            {hasActiveFilters() && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Filtered
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Vendor Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {filteredAndSortedTransactions.length === 0 ? (
            <div className="p-6 text-center">
              <CreditCard className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
              <p className="text-gray-500 text-lg font-medium">No vendor payments found</p>
              <p className="text-gray-400 text-sm mt-1">
                {hasActiveFilters() 
                  ? 'Try adjusting your search or filters'
                  : 'No vendor payments available'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAndSortedTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-gray-900">{transaction.transactionId}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{transaction.customerName}</p>
                      <p className="text-sm text-gray-500">{transaction.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(transaction.amount)}</p>
                      <button
                        onClick={() => handleViewTransaction(transaction.transactionId)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-xs">{formatDate(transaction.transactionDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-xs">{getPaymentMethodDisplay(transaction.paymentMethod)}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{transaction.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('transactionId')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Transaction ID</span>
                    <span className="text-blue-600">{getSortIcon('transactionId')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('customerName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Vendor Name</span>
                    <span className="text-blue-600">{getSortIcon('customerName')}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Number
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Amount</span>
                    <span className="text-blue-600">{getSortIcon('amount')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <span className="text-blue-600">{getSortIcon('status')}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('transactionDate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    <span className="text-blue-600">{getSortIcon('transactionDate')}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <CreditCard className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No vendor payments found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {hasActiveFilters() 
                          ? 'Try adjusting your search or filters'
                          : 'No vendor payments available'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{transaction.transactionId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{transaction.customerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{transaction.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(transaction.amount)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(transaction.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{getPaymentMethodDisplay(transaction.paymentMethod)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{formatDate(transaction.transactionDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleViewTransaction(transaction.transactionId)}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-xs font-medium"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </button>
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