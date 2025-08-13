import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, X, Clock, CheckCircle, AlertCircle, Package, Eye, Users, FileText, Calendar, ArrowRight, RotateCcw, XCircle, MapPin, Hash, Home, FileCheck, UserPlus } from 'lucide-react';
import { mockOrders } from '../data/mockData';
import { Order } from '../types';

type SortField = 'orderNumber' | 'customerName' | 'deliveryDate' | 'businessGroup' | 'status' | 'address' | 'propertyType';
type SortDirection = 'asc' | 'desc';
type TabType = 'new' | 'sketch' | 'qa' | 'ready' | 'rollback' | 'cancelled';

interface FilterState {
  businessGroup: 'all' | 'Ridgetop' | 'Skyline';
  rushOrder: 'all' | 'yes' | 'no';
  dateRange: 'all' | 'today' | 'week' | 'month';
  propertyType: 'all' | 'Residential' | 'Commercial';
  reportType: 'all' | 'ESX Report' | 'DAD Report' | 'Wall Report';
}

interface OrderProcessPageProps {
  onSelectOrder: (orderId: string) => void;
}

export const OrderProcessPage: React.FC<OrderProcessPageProps> = ({ onSelectOrder }) => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [activeTab, setActiveTab] = useState<TabType>('new');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [bulkAssignData, setBulkAssignData] = useState({
    sketchPersonId: '',
  });
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [managerAction, setManagerAction] = useState<'qa' | 'rollback'>('qa');
  const [selectedOrderForManager, setSelectedOrderForManager] = useState<Order | null>(null);
  const [managerData, setManagerData] = useState({
    managerId: '',
    comment: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('deliveryDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<FilterState>({
    businessGroup: 'all',
    rushOrder: 'all',
    dateRange: 'all',
    propertyType: 'all',
    reportType: 'all'
  });

  // Get available users for assignment
  const sketchUsers = [
    { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' },
    { id: '4', firstName: 'Sarah', lastName: 'Wilson', email: 'sarah.wilson@example.com' }
  ];
  const managerUsers = [
    { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
    { id: '5', firstName: 'David', lastName: 'Brown', email: 'david.brown@example.com' }
  ];
  const qaUsers = [
    { id: '3', firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@example.com' },
    { id: '5', firstName: 'David', lastName: 'Brown', email: 'david.brown@example.com' }
  ];

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'unassigned': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'qa-review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready-for-delivery': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'rollback': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'new': return Package;
      case 'sketch': return FileText;
      case 'qa': return CheckCircle;
      case 'ready': return ArrowRight;
      case 'rollback': return RotateCcw;
      case 'cancelled': return XCircle;
      default: return Package;
    }
  };

  const getTabOrders = (tab: TabType) => {
    switch (tab) {
      case 'new':
        return orders.filter(order => order.status === 'unassigned');
      case 'sketch':
        return orders.filter(order => order.status === 'in-progress');
      case 'qa':
        return orders.filter(order => order.status === 'qa-review');
      case 'ready':
        return orders.filter(order => order.status === 'ready-for-delivery');
      case 'rollback':
        return orders.filter(order => order.status === 'rollback');
      case 'cancelled':
        return orders.filter(order => order.status === 'cancelled');
      default:
        return [];
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
      rushOrder: 'all',
      dateRange: 'all',
      propertyType: 'all',
      reportType: 'all'
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return searchTerm !== '' || 
           filters.businessGroup !== 'all' || 
           filters.rushOrder !== 'all' || 
           filters.dateRange !== 'all' ||
           filters.propertyType !== 'all' ||
           filters.reportType !== 'all';
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

  const formatDueTime = (date?: Date) => {
    if (!date) return 'Not set';
    return formatDate(date) + ' ' + formatTime(date);
  };

  const getItemNumber = (order: Order) => {
    // Extract item number from order data or use a default
    return order.items?.[0]?.id || '1';
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = getTabOrders(activeTab);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.businessGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.service?.toLowerCase().includes(searchTerm.toLowerCase())
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

    // Report Type filter
    if (filters.reportType !== 'all') {
      filtered = filtered.filter(order => order.service === filters.reportType);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const daysDiff = Math.floor((now.getTime() - order.orderDate.getTime()) / (1000 * 60 * 60 * 24));
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
        case 'customerName':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case 'businessGroup':
          aValue = a.businessGroup.toLowerCase();
          bValue = b.businessGroup.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'deliveryDate':
          aValue = a.deliveryDate ? a.deliveryDate.getTime() : 0;
          bValue = b.deliveryDate ? b.deliveryDate.getTime() : 0;
          break;
        case 'address':
          aValue = (a.address || '').toLowerCase();
          bValue = (b.address || '').toLowerCase();
          break;
        case 'propertyType':
          aValue = (a.propertyType || '').toLowerCase();
          bValue = (b.propertyType || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [orders, activeTab, searchTerm, filters, sortField, sortDirection]);

  const getTabCount = (tab: TabType) => {
    return getTabOrders(tab).length;
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    const currentTabOrderIds = getTabOrders(activeTab).map(order => order.id);
    if (selectedOrders.length === currentTabOrderIds.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentTabOrderIds);
    }
  };

  const handleBulkAssign = () => {
    if (selectedOrders.length === 0) {
      alert('Please select at least one order to assign.');
      return;
    }
    
    setBulkAssignData({
      sketchPersonId: '',
    });
    setShowBulkAssignModal(true);
  };

  const handleBulkAssignSubmit = () => {
    if (bulkAssignData.sketchPersonId) {
      const sketchUser = sketchUsers.find(u => u.id === bulkAssignData.sketchPersonId);
      
      if (sketchUser) {
        // Update selected orders
        setOrders(prev => prev.map(order => 
          selectedOrders.includes(order.id) 
            ? {
                ...order,
                status: 'in-progress' as const,
                processStatus: 'sketch' as any,
                sketchPersonId: bulkAssignData.sketchPersonId,
                assignedTo: `${sketchUser.firstName} ${sketchUser.lastName}`
              }
            : order
        ));
        
        setShowBulkAssignModal(false);
        setBulkAssignData({ sketchPersonId: '' });
        setSelectedOrders([]);
        
        alert(`${selectedOrders.length} orders assigned successfully to ${sketchUser.firstName} ${sketchUser.lastName} for sketch work!`);
      }
    }
  };

  const handleMoveToQA = (order: Order) => {
    setSelectedOrderForManager(order);
    setManagerAction('qa');
    setManagerData({ managerId: '', comment: '' });
    setShowManagerModal(true);
  };

  const handleRollback = (order: Order) => {
    setSelectedOrderForManager(order);
    setManagerAction('rollback');
    setManagerData({ managerId: '', comment: '' });
    setShowManagerModal(true);
  };

  const handleManagerActionSubmit = () => {
    if (managerData.managerId && managerData.comment.trim() && selectedOrderForManager) {
      const manager = managerUsers.find(u => u.id === managerData.managerId);
      
      if (manager) {
        const newStatus = managerAction === 'qa' ? 'qa-review' : 'rollback';
        const newProcessStatus = managerAction === 'qa' ? 'qa' : 'rollback';
        
        // Update the order
        setOrders(prev => prev.map(order => 
          order.id === selectedOrderForManager.id 
            ? {
                ...order,
                status: newStatus as const,
                processStatus: newProcessStatus as any
              }
            : order
        ));
        
        setShowManagerModal(false);
        setSelectedOrderForManager(null);
        setManagerData({ managerId: '', comment: '' });
        
        const actionText = managerAction === 'qa' ? 'moved to QA Review' : 'rolled back';
        alert(`Order ${selectedOrderForManager.orderNumber} has been ${actionText} by ${manager.firstName} ${manager.lastName}!`);
      }
    }
  };

  const tabs: { id: TabType; label: string; description: string }[] = [
    { id: 'new', label: 'New Orders', description: 'Unassigned orders ready for processing' },
    { id: 'sketch', label: 'Sketch', description: 'Orders in progress' },
    { id: 'qa', label: 'QA', description: 'Orders in QA review' },
    { id: 'ready', label: 'Ready', description: 'Ready for delivery' },
    { id: 'rollback', label: 'Rollback', description: 'Rolled back orders' },
    { id: 'cancelled', label: 'Cancelled', description: 'Cancelled orders' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Order Process</h1>
        {selectedOrders.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleBulkAssign}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Assign Selected
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max">
            {tabs.map(({ id, label, description }) => {
              const Icon = getTabIcon(id);
              const count = getTabCount(id);
              
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 cursor-pointer'
                  }`}
                  title={description}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{id === 'new' ? 'New' : id === 'sketch' ? 'Sketch' : id === 'qa' ? 'QA' : id === 'ready' ? 'Ready' : id === 'rollback' ? 'Rollback' : 'Cancelled'}</span>
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

                  {/* Report Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                    <select
                      value={filters.reportType}
                      onChange={(e) => setFilters(prev => ({ ...prev, reportType: e.target.value as FilterState['reportType'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    >
                      <option value="all">All Reports</option>
                      <option value="ESX Report">ESX Report</option>
                      <option value="DAD Report">DAD Report</option>
                      <option value="Wall Report">Wall Report</option>
                    </select>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Date</label>
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
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredAndSortedOrders.length} of {getTabOrders(activeTab).length} orders in {tabs.find(t => t.id === activeTab)?.label}
                {hasActiveFilters() && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Filtered
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Mobile Card View */}
            <div className="block xl:hidden">
              {filteredAndSortedOrders.length === 0 ? (
                <div className="p-6 text-center">
                  <Package className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
                  <p className="text-gray-500 text-lg font-medium">No orders found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {hasActiveFilters() 
                      ? 'Try adjusting your search or filters'
                      : `No orders in ${tabs.find(t => t.id === activeTab)?.label}`
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
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredAndSortedOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      onClick={() => onSelectOrder(order.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium text-gray-900">{order.orderNumber}</p>
                            {order.rushOrder && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                RUSH
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">Item #{getItemNumber(order)}</p>
                          <p className="text-sm text-gray-500">{order.address || 'Address not specified'}</p>
                        </div>
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
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-xs">{formatDueTime(order.deliveryDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <FileCheck className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-xs">PDF: {order.pdfRequired ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-xs">{order.service || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                          <Home className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-xs">{order.propertyType || 'N/A'}</span>
                        </div>
                      </div>
                      {order.status === 'in-progress' && (
                        <div className="flex items-center space-x-1 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveToQA(order);
                            }}
                            className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200 text-xs font-medium"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Move to QA
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRollback(order);
                            }}
                            className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors duration-200 text-xs font-medium"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Rollback
                          </button>
                        </div>
                      )}
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={getTabOrders(activeTab).length > 0 && selectedOrders.length === getTabOrders(activeTab).length}
                        onChange={handleSelectAll}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort('deliveryDate')}
                    >
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Due Time</span>
                        <span className="text-blue-600">{getSortIcon('deliveryDate')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort('orderNumber')}
                    >
                      <div className="flex items-center space-x-1">
                        <Package className="w-4 h-4" />
                        <span>Order Number</span>
                        <span className="text-blue-600">{getSortIcon('orderNumber')}</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <Hash className="w-4 h-4" />
                        <span>Item Number</span>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort('address')}
                    >
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>Address</span>
                        <span className="text-blue-600">{getSortIcon('address')}</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>Rush</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <FileCheck className="w-4 h-4" />
                        <span>PDF</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span>Report Type</span>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort('propertyType')}
                    >
                      <div className="flex items-center space-x-1">
                        <Home className="w-4 h-4" />
                        <span>Property Type</span>
                        <span className="text-blue-600">{getSortIcon('propertyType')}</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                          <p className="text-gray-500 text-lg font-medium">No orders found</p>
                          <p className="text-gray-400 text-sm mt-1">
                            {hasActiveFilters() 
                              ? 'Try adjusting your search or filters'
                              : `No orders in ${tabs.find(t => t.id === activeTab)?.label}`
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
                    filteredAndSortedOrders.map((order) => (
                      <tr 
                        key={order.id} 
                        className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                        onClick={() => onSelectOrder(order.id)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectOrder(order.id);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDueTime(order.deliveryDate)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                            {order.rushOrder && (
                              <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                RUSH
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">#{getItemNumber(order)}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={order.address}>
                            {order.address || 'Address not specified'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.rushOrder 
                              ? 'bg-red-100 text-red-800 border border-red-200' 
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {order.rushOrder ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.pdfRequired 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {order.pdfRequired ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.service || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.propertyType || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
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
                          {order.status === 'in-progress' && (
                            <div className="flex items-center space-x-1 mt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveToQA(order);
                                }}
                                className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200 text-xs font-medium"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Move to QA
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRollback(order);
                                }}
                                className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors duration-200 text-xs font-medium"
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Rollback
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Assign Modal */}
      {showBulkAssignModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowBulkAssignModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full mx-4">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Bulk Assign Orders</h3>
                  </div>
                  <button 
                    onClick={() => setShowBulkAssignModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Assigning {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} to team members
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sketch Person *
                    </label>
                    <select
                      value={bulkAssignData.sketchPersonId}
                      onChange={(e) => setBulkAssignData(prev => ({ ...prev, sketchPersonId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      required
                    >
                      <option value="">Select sketch person...</option>
                      {sketchUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  onClick={handleBulkAssignSubmit}
                  disabled={!bulkAssignData.sketchPersonId}
                  className={`w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:w-auto sm:text-sm transition-colors duration-200 ${
                    bulkAssignData.sketchPersonId
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign {selectedOrders.length} Order{selectedOrders.length !== 1 ? 's' : ''}
                </button>
                <button
                  onClick={() => setShowBulkAssignModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manager Action Modal */}
      {showManagerModal && selectedOrderForManager && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowManagerModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full mx-4">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {managerAction === 'qa' ? (
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2" />
                    ) : (
                      <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mr-2" />
                    )}
                    <h3 className="text-lg font-medium text-gray-900">
                      {managerAction === 'qa' ? 'Move to QA Review' : 'Rollback Order'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowManagerModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                {/* Order Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Order Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="font-medium text-gray-900">{selectedOrderForManager.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium text-gray-900">{selectedOrderForManager.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Business Group:</span>
                      <span className="font-medium text-gray-900">{selectedOrderForManager.businessGroup}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Status:</span>
                      <span className="font-medium text-gray-900">In Progress</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Manager *
                    </label>
                    <select
                      value={managerData.managerId}
                      onChange={(e) => setManagerData(prev => ({ ...prev, managerId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      required
                    >
                      <option value="">Select manager...</option>
                      {managerUsers.map(manager => (
                        <option key={manager.id} value={manager.id}>
                          {manager.firstName} {manager.lastName} ({manager.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comment *
                    </label>
                    <textarea
                      value={managerData.comment}
                      onChange={(e) => setManagerData(prev => ({ ...prev, comment: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder={`Add a comment about ${managerAction === 'qa' ? 'moving to QA review' : 'rolling back the order'}...`}
                      rows={4}
                      required
                    />
                  </div>
                  
                  {/* Action Description */}
                  <div className={`p-3 rounded-lg border ${
                    managerAction === 'qa' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-orange-50 border-orange-200'
                  }`}>
                    <div className="flex items-start">
                      {managerAction === 'qa' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <RotateCcw className="w-5 h-5 text-orange-600 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="text-sm font-medium text-gray-800">
                          {managerAction === 'qa' ? 'Move to QA Review' : 'Rollback Order'}
                        </h4>
                        <p className="text-sm text-gray-700 mt-1">
                          {managerAction === 'qa' 
                            ? 'This will move the order to QA review stage for quality assurance.'
                            : 'This will rollback the order for corrections or additional work.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  onClick={handleManagerActionSubmit}
                  disabled={!managerData.managerId || !managerData.comment.trim()}
                  className={`w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:w-auto sm:text-sm transition-colors duration-200 ${
                    managerData.managerId && managerData.comment.trim()
                      ? managerAction === 'qa'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {managerAction === 'qa' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Move to QA
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Rollback Order
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowManagerModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
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