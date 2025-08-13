import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronDown, X, Clock, Package, CheckCircle, AlertCircle, RotateCcw, XCircle, Eye, UserPlus, Users } from 'lucide-react';
import { mockOrders, getSketchUsers, getQAUsers } from '../data/mockData';
import { Order } from '../types';

type TabType = 'new' | 'sketch' | 'qa' | 'ready' | 'rollback' | 'cancelled';
type SortField = 'orderNumber' | 'customerName' | 'businessGroup' | 'dueTime';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  businessGroup: 'all' | 'Ridgetop' | 'Skyline';
  rushOrder: 'all' | 'yes' | 'no';
  propertyType: 'all' | 'Residential' | 'Commercial';
  service: 'all' | 'ESX Report' | 'DAD Report' | 'Wall Report';
}

interface OrderProcessPageProps {
  onSelectOrder: (orderId: string) => void;
}

export const OrderProcessPage: React.FC<OrderProcessPageProps> = ({ onSelectOrder }) => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<TabType>('new');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('dueTime');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<FilterState>({
    businessGroup: 'all',
    rushOrder: 'all',
    propertyType: 'all',
    service: 'all'
  });

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTabOrders = (tab: TabType) => {
    switch (tab) {
      case 'new':
        return orders.filter(o => o.processStatus === 'new' || o.status === 'unassigned');
      case 'sketch':
        return orders.filter(o => o.processStatus === 'sketch' || (o.status === 'in-progress' && o.processStatus !== 'qa'));
      case 'qa':
        return orders.filter(o => o.processStatus === 'qa' || o.status === 'qa-review');
      case 'ready':
        return orders.filter(o => o.processStatus === 'ready' || o.status === 'ready-for-delivery');
      case 'rollback':
        return orders.filter(o => o.processStatus === 'rollback' || o.status === 'rollback');
      case 'cancelled':
        return orders.filter(o => o.processStatus === 'cancelled' || o.status === 'cancelled');
      default:
        return [];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sketch': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'qa': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'rollback': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'new': return Package;
      case 'sketch': return Users;
      case 'qa': return CheckCircle;
      case 'ready': return Clock;
      case 'rollback': return RotateCcw;
      case 'cancelled': return XCircle;
      default: return Package;
    }
  };

  const formatCountdownTime = (deliveryDate: Date): { display: string; isOverdue: boolean } => {
    const now = currentTime.getTime();
    const due = deliveryDate.getTime();
    const diff = due - now;

    if (diff <= 0) {
      return { display: '00:00:00', isOverdue: true };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return { 
      display: `${formattedHours}:${formattedMinutes}:${formattedSeconds}`, 
      isOverdue: false 
    };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'dueTime' ? 'asc' : 'asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const clearFilters = () => {
    setFilters({
      businessGroup: 'all',
      rushOrder: 'all',
      propertyType: 'all',
      service: 'all'
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return searchTerm !== '' || 
           filters.businessGroup !== 'all' || 
           filters.rushOrder !== 'all' || 
           filters.propertyType !== 'all' ||
           filters.service !== 'all';
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = getTabOrders(activeTab);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.businessGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.address && order.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.service && order.service.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Business Group filter
    if (filters.businessGroup !== 'all') {
      filtered = filtered.filter(order => order.businessGroup === filters.businessGroup);
    }

    // Rush Order filter
    if (filters.rushOrder !== 'all') {
      filtered = filtered.filter(order => 
        filters.rushOrder === 'yes' ? order.rushOrder : !order.rushOrder
      );
    }

    // Property Type filter
    if (filters.propertyType !== 'all') {
      filtered = filtered.filter(order => order.propertyType === filters.propertyType);
    }

    // Service filter
    if (filters.service !== 'all') {
      filtered = filtered.filter(order => order.service === filters.service);
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
        case 'dueTime':
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
  }, [orders, activeTab, searchTerm, filters, sortField, sortDirection, currentTime]);

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleBulkAssign = () => {
    if (selectedOrders.length > 0) {
      setShowBulkAssignModal(true);
    }
  };

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'new', label: 'New Orders', count: getTabOrders('new').length },
    { id: 'sketch', label: 'Sketch', count: getTabOrders('sketch').length },
    { id: 'qa', label: 'QA', count: getTabOrders('qa').length },
    { id: 'ready', label: 'Ready', count: getTabOrders('ready').length },
    { id: 'rollback', label: 'Rollback', count: getTabOrders('rollback').length },
    { id: 'cancelled', label: 'Cancelled', count: getTabOrders('cancelled').length }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Order Process</h1>
        {selectedOrders.length > 0 && (
          <button 
            onClick={handleBulkAssign}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Assign Selected ({selectedOrders.length})
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max">
            {tabs.map(({ id, label, count }) => {
              const Icon = getTabIcon(id);
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{id.charAt(0).toUpperCase() + id.slice(1)}</span>
                  <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                    activeTab === id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {/* Search and Filters */}
          <div className="mb-6 bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search orders by number, customer, address, or report type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
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

                  {/* Rush Order Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rush Order</label>
                    <select
                      value={filters.rushOrder}
                      onChange={(e) => setFilters(prev => ({ ...prev, rushOrder: e.target.value as FilterState['rushOrder'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    >
                      <option value="all">All Orders</option>
                      <option value="yes">Rush Orders</option>
                      <option value="no">Standard Orders</option>
                    </select>
                  </div>

                  {/* Property Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                    <select
                      value={filters.propertyType}
                      onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value as FilterState['propertyType'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>

                  {/* Service Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                    <select
                      value={filters.service}
                      onChange={(e) => setFilters(prev => ({ ...prev, service: e.target.value as FilterState['service'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    >
                      <option value="all">All Services</option>
                      <option value="ESX Report">ESX Report</option>
                      <option value="DAD Report">DAD Report</option>
                      <option value="Wall Report">Wall Report</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredAndSortedOrders.length} of {getTabOrders(activeTab).length} orders in {activeTab === 'new' ? 'New Orders' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                {hasActiveFilters() && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Filtered
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === filteredAndSortedOrders.length && filteredAndSortedOrders.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(filteredAndSortedOrders.map(o => o.id));
                        } else {
                          setSelectedOrders([]);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleSort('dueTime')}
                  >
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Due Time</span>
                      <span className="text-blue-600">{getSortIcon('dueTime')}</span>
                    </div>
                  </th>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rush
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PDF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property Type
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Package className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">
                          No orders found in {activeTab === 'new' ? 'New Orders' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          {hasActiveFilters() 
                            ? 'Try adjusting your search or filters'
                            : `No orders in ${activeTab} status`
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedOrders.map((order) => {
                    const countdown = order.deliveryDate ? formatCountdownTime(order.deliveryDate) : null;
                    
                    return (
                      <tr key={order.id} className={`hover:bg-gray-50 transition-colors duration-200 ${
                        countdown?.isOverdue ? 'bg-red-50' : ''
                      }`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => handleOrderSelect(order.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-center">
                            {countdown ? (
                              <>
                                <div className={`text-lg font-mono font-bold ${
                                  countdown.isOverdue ? 'text-red-600' : 'text-gray-900'
                                }`}>
                                  {countdown.display}
                                  {countdown.isOverdue && (
                                    <span className="text-xs font-normal text-red-600 block">
                                      (Overdue)
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Due: {formatDate(order.deliveryDate!)}
                                </div>
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">No due date</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                          <div className="text-xs text-gray-500">{order.customerName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">#1</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {order.address || 'Address not specified'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.rushOrder 
                              ? 'bg-red-100 text-red-800 border border-red-200' 
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {order.rushOrder ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.pdfRequired 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {order.pdfRequired ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.service || 'Not specified'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.propertyType || 'Not specified'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => onSelectOrder(order.id)}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-xs font-medium"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};