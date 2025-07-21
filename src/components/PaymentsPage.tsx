import React, { useState, useMemo } from 'react';
import { CreditCard, DollarSign, Calendar, User, Search, Filter, ChevronDown, X, Download, CheckCircle, Clock, AlertCircle, Eye, RefreshCw, Loader, RotateCcw } from 'lucide-react';
import { useStripeTransactions } from '../hooks/useStripeTransactions';

type SortField = 'transactionId' | 'customerName' | 'amount' | 'transactionDate' | 'status';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  status: 'all' | 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'all' | 'credit_card' | 'bank_transfer' | 'check' | 'paypal';
  businessGroup: 'all' | 'Ridgetop' | 'Skyline';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'quarter';
  amountRange: 'all' | '0-100' | '100-500' | '500-1000' | '1000+';
}

export const PaymentsPage: React.FC = () => {
  const { transactions, loading, error, usingMockData, refreshTransactions, processRefund, refunding } = useStripeTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [refundData, setRefundData] = useState({
    amount: '',
    reason: '',
    isPartial: false
  });
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
    const headers = ['Transaction ID', 'Customer Name', 'Order Number', 'Amount', 'Status', 'Payment Method', 'Date', 'Business Group', 'Description'];

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
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewTransaction = (transactionId: string) => {
    alert(`View transaction details for ${transactionId}`);
  };

  const handleRefundClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setRefundData({
      amount: transaction.amount.toString(),
      reason: '',
      isPartial: false
    });
    setShowRefundModal(true);
  };

  const handleRefundSubmit = async () => {
    if (!selectedTransaction) return;
    
    const refundAmount = refundData.isPartial ? parseFloat(refundData.amount) : undefined;
    
    if (refundData.isPartial && (!refundAmount || refundAmount <= 0 || refundAmount > selectedTransaction.amount)) {
      alert('Please enter a valid refund amount');
      return;
    }
    
    const success = await processRefund({
      transactionId: selectedTransaction.transactionId,
      amount: refundAmount,
      reason: refundData.reason || 'Customer refund request'
    });
    
    if (success) {
      alert(`Refund of ${formatCurrency(refundAmount || selectedTransaction.amount)} processed successfully!`);
      setShowRefundModal(false);
      setSelectedTransaction(null);
      setRefundData({ amount: '', reason: '', isPartial: false });
    } else {
      alert('Failed to process refund. Please try again.');
    }
  };

  const handleCloseRefundModal = () => {
    setShowRefundModal(false);
    setSelectedTransaction(null);
    setRefundData({ amount: '', reason: '', isPartial: false });
  };

  // Calculate summary statistics
  const totalAmount = filteredAndSortedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const completedTransactions = filteredAndSortedTransactions.filter(t => t.status === 'completed').length;
  const pendingTransactions = filteredAndSortedTransactions.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Payments</h1>
          {loading && <Loader className="w-5 h-5 text-blue-600 animate-spin" />}
          {usingMockData && (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
              Sample Data
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={refreshTransactions}
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{usingMockData ? 'Try Stripe Connection' : 'Refresh from Stripe'}</span>
            <span className="sm:hidden">Refresh</span>
          </button>
          <button 
            onClick={handleExportTransactions}
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export Transactions</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && !usingMockData && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading Transactions</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={refreshTransactions}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mock Data Notice */}
      {usingMockData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Using Sample Transaction Data</h3>
              <p className="text-sm text-blue-700 mt-1">
                Configure your Stripe secret key in the .env file to see real payment data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{formatCurrency(totalAmount)}</p>
              <p className="text-gray-600 text-sm sm:text-base">Total Revenue</p>
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
              <p className="text-gray-600 text-sm sm:text-base">Total Transactions</p>
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
                placeholder="Search by transaction ID, customer name, order number, or description..."
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
            Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions
            {hasActiveFilters() && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Filtered
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {filteredAndSortedTransactions.length === 0 ? (
            <div className="p-6 text-center">
              <CreditCard className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
              <p className="text-gray-500 text-lg font-medium">
                {loading ? 'Loading transactions from Stripe...' : 'No transactions found'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {loading ? 'Please wait while we fetch your payment data' :
                 hasActiveFilters() 
                  ? 'Try adjusting your search or filters'
                  : 'No transactions available from Stripe'
                }
              </p>
              {!loading && !hasActiveFilters() && (
                <button
                  onClick={refreshTransactions}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Refresh from Stripe
                </button>
              )}
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
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleViewTransaction(transaction.transactionId)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {transaction.status === 'completed' && (
                          <button
                            onClick={() => handleRefundClick(transaction)}
                            disabled={refunding === transaction.transactionId}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Process Refund"
                          >
                            {refunding === transaction.transactionId ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
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
                    <span>Customer</span>
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
                      <p className="text-gray-500 text-lg font-medium">
                        {loading ? 'Loading transactions from Stripe...' : 'No transactions found'}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {loading ? 'Please wait while we fetch your payment data' :
                         hasActiveFilters() 
                          ? 'Try adjusting your search or filters'
                          : 'No transactions available from Stripe'
                        }
                      </p>
                      {!loading && !hasActiveFilters() && (
                        <button
                          onClick={refreshTransactions}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          Refresh from Stripe
                        </button>
                      )}
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
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewTransaction(transaction.transactionId)}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-xs font-medium"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </button>
                        {transaction.status === 'completed' && (
                          <button
                            onClick={() => handleRefundClick(transaction)}
                            disabled={refunding === transaction.transactionId}
                            className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {refunding === transaction.transactionId ? (
                              <Loader className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3 h-3 mr-1" />
                            )}
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && selectedTransaction && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseRefundModal} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full mx-4">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Process Refund</h3>
                  </div>
                  <button 
                    onClick={handleCloseRefundModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                {/* Transaction Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Transaction Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Original Amount:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(selectedTransaction.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.orderNumber}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Refund Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Refund Type
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={!refundData.isPartial}
                          onChange={() => setRefundData(prev => ({ ...prev, isPartial: false, amount: selectedTransaction.amount.toString() }))}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-900">
                          Full Refund ({formatCurrency(selectedTransaction.amount)})
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={refundData.isPartial}
                          onChange={() => setRefundData(prev => ({ ...prev, isPartial: true, amount: '' }))}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-900">Partial Refund</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Partial Refund Amount */}
                  {refundData.isPartial && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Refund Amount *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={selectedTransaction.amount}
                          value={refundData.amount}
                          onChange={(e) => setRefundData(prev => ({ ...prev, amount: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm"
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum refund amount: {formatCurrency(selectedTransaction.amount)}
                      </p>
                    </div>
                  )}
                  
                  {/* Refund Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Refund Reason
                    </label>
                    <textarea
                      value={refundData.reason}
                      onChange={(e) => setRefundData(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="Enter reason for refund (optional)"
                      rows={3}
                    />
                  </div>
                  
                  {/* Warning */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Important</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          {usingMockData 
                            ? 'This will simulate a refund process using sample data.'
                            : 'This will process a real refund through Stripe. The customer will receive the refund to their original payment method.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  onClick={handleRefundSubmit}
                  disabled={refunding === selectedTransaction.transactionId || (refundData.isPartial && (!refundData.amount || parseFloat(refundData.amount) <= 0))}
                  className={`w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:w-auto sm:text-sm transition-colors duration-200 ${
                    refunding === selectedTransaction.transactionId || (refundData.isPartial && (!refundData.amount || parseFloat(refundData.amount) <= 0))
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  {refunding === selectedTransaction.transactionId ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Process Refund
                    </>
                  )}
                </button>
                <button
                  onClick={handleCloseRefundModal}
                  disabled={refunding === selectedTransaction.transactionId}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};