import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, X, Truck, Calendar, MapPin, CheckCircle, Eye } from 'lucide-react';
import { mockOrders } from '../data/mockData';
import { Order } from '../types';

type SortField = 'orderNumber' | 'customerName' | 'deliveryDate' | 'businessGroup';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  businessGroup: 'all' | 'Ridgetop' | 'Skyline';
  deliveryStatus: 'all' | 'pending' | 'in-transit' | 'delivered';
  dateRange: 'all' | 'today' | 'week' | 'month';
}

interface OrdersDeliveryPageProps {
  onSelectOrder: (orderId: string) => void;
}

export const OrdersDeliveryPage: React.FC<OrdersDeliveryPageProps> = ({ onSelectOrder }) => {
  // Show ALL orders including completed ones for delivery tracking
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('deliveryDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<FilterState>({
    businessGroup: 'all',
    deliveryStatus: 'all',
    dateRange: 'all'
  });

  // Add delivery status to orders (simulated)
  const ordersWithDelivery = orders.map(order => ({
    ...order,
    deliveryStatus: order.status === 'completed' ? 'delivered' : 
                   order.status === 'in-progress' ? 'in-transit' : 'pending'
  }));

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-transit': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'deliveryDate' ? 'asc' : 'asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const clearFilters = () => {
    setFilters({
      businessGroup: 'all',
      deliveryStatus: 'all',
      dateRange: 'all'
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return searchTerm !== '' || 
           filters.businessGroup !== 'all' || 
           filters.deliveryStatus !== 'all' || 
           filters.dateRange !== 'all';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (deliveryDate: Date, status: string) => {
    return status !== 'delivered' && deliveryDate < new Date();
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = ordersWithDelivery;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.businessGroup.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Business Group filter
    if (filters.businessGroup !== 'all') {
      filtered = filtered.filter(order => order.businessGroup === filters.businessGroup);
    }

    // Delivery Status filter
    if (filters.deliveryStatus !== 'all') {
      filtered = filtered.filter(order => order.deliveryStatus === filters.deliveryStatus);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        if (!order.deliveryDate) return false;
        const daysDiff = Math.floor((order.deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        switch (filters.dateRange) {
          case 'today': return daysDiff === 0;
          case 'week': return daysDiff >= 0 && daysDiff <= 7;
          case 'month': return daysDiff >= 0 && daysDiff <= 30;
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
        case 'customerName':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case 'businessGroup':
          aValue = a.businessGroup.toLowerCase();
          bValue = b.businessGroup.toLowerCase();
          break;
        case 'deliveryDate':
          aValue = a.deliveryDate ? a.deliveryDate.getTime() : 0;
          bValue = b.deliveryDate ? b.deliveryDate.getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [ordersWithDelivery, searchTerm, filters, sortField, sortDirection]);

  const handleUpdateDeliveryStatus = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { 
        ...order, 
        status: newStatus === 'delivered' ? 'completed' : 
               newStatus === 'in-transit' ? 'in-progress' : 'new'
      } : order
    ));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Orders Delivery</h1>
      </div>

      {/* Delivery Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {ordersWithDelivery.filter(o => o.deliveryStatus === 'pending').length}
              </p>
              <p className="text-gray-600 text-sm sm:text-base">Pending</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {ordersWithDelivery.filter(o => o.deliveryStatus === 'in-transit').length}
              </p>
              <p className="text-gray-600 text-sm sm:text-base">In Transit</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {ordersWithDelivery.filter(o => o.deliveryStatus === 'delivered').length}
              </p>
              <p className="text-gray-600 text-sm sm:text-base">Delivered</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {ordersWithDelivery.filter(o => o.deliveryDate && isOverdue(o.deliveryDate, o.deliveryStatus)).length}
              </p>
              <p className="text-gray-600 text-sm sm:text-base">Overdue</p>
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
                placeholder="Search deliveries by order number, customer, or business group..."
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

              {/* Delivery Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Status</label>
                <select
                  value={filters.deliveryStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, deliveryStatus: e.target.value as FilterState['deliveryStatus'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
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
                  <option value="week">Next 7 Days</option>
                  <option value="month">Next 30 Days</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredAndSortedOrders.length} of {ordersWithDelivery.length} deliveries
            {hasActiveFilters() && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Filtered
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {filteredAndSortedOrders.length === 0 ? (
            <div className="p-6 text-center">
              <Truck className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
              <p className="text-gray-500 text-lg font-medium">No deliveries found</p>
              <p className="text-gray-400 text-sm mt-1">
                {hasActiveFilters() 
                  ? 'Try adjusting your search or filters'
                  : 'No deliveries scheduled'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAndSortedOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                onClick={() => onSelectOrder(order.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.customerName}</p>
                      <p className="text-sm text-gray-500">{order.businessGroup}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {order.deliveryDate && isOverdue(order.deliveryDate, order.deliveryStatus) && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Overdue
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrder(order.id);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      Delivery: {order.deliveryDate ? formatDate(order.deliveryDate) : 'Not scheduled'}
                      {order.deliveryDate && (
                        <span className="ml-2 text-gray-500">
                          at {formatTime(order.deliveryDate)}
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getDeliveryStatusColor(order.deliveryStatus)}`}>
                      {order.deliveryStatus.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <div className="mt-3">
                    <select
                      value={order.deliveryStatus}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleUpdateDeliveryStatus(order.id, e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
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
                  onClick={() => handleSort('orderNumber')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Order Number</span>
                    <span className="text-blue-600">{getSortIcon('orderNumber')}</span>
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
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('businessGroup')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Business Group</span>
                    <span className="text-blue-600">{getSortIcon('businessGroup')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('deliveryDate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Delivery Date</span>
                    <span className="text-blue-600">{getSortIcon('deliveryDate')}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Truck className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No deliveries found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {hasActiveFilters() 
                          ? 'Try adjusting your search or filters'
                          : 'No deliveries scheduled'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedOrders.map((order) => (
                  <tr key={order.id} className={`hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                    order.deliveryDate && isOverdue(order.deliveryDate, order.deliveryStatus) ? 'bg-red-50' : ''
                  }`}
                  onClick={() => onSelectOrder(order.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        {order.deliveryDate && isOverdue(order.deliveryDate, order.deliveryStatus) && (
                          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Overdue
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.businessGroup}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.deliveryDate ? (
                          <>
                            {formatDate(order.deliveryDate)}
                            <div className="text-xs text-gray-500">
                              {formatTime(order.deliveryDate)}
                            </div>
                          </>
                        ) : (
                          'Not scheduled'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getDeliveryStatusColor(order.deliveryStatus)}`}>
                        {order.deliveryStatus.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <select
                          value={order.deliveryStatus}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleUpdateDeliveryStatus(order.id, e.target.value);
                          }}
                          className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOrder(order.id);
                          }}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-xs font-medium"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </button>
                      </div>
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