import React, { useState, useMemo } from 'react';
import { Plus, Wrench, Edit, Trash2, DollarSign, Users, Search, Filter, ChevronDown, X, Save, Building2, Star } from 'lucide-react';
import { Service, BusinessGroupPricing, CustomerSpecificPricing } from '../types';
import { mockBusinessGroups } from '../data/mockData';

type SortField = 'name' | 'isActive' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  status: 'all' | 'active' | 'inactive';
}

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'ESX Report',
      description: 'Comprehensive property inspection and reporting service',
      isActive: true,
      createdAt: new Date('2024-12-01'),
      modifiedAt: new Date('2024-12-01')
    },
    {
      id: '2',
      name: 'Wall Report',
      description: 'Detailed wall inspection and structural analysis',
      isActive: true,
      createdAt: new Date('2024-12-01'),
      modifiedAt: new Date('2024-12-01')
    },
    {
      id: '3',
      name: 'DAD Report',
      description: 'Damage assessment documentation and analysis',
      isActive: true,
      createdAt: new Date('2024-12-01'),
      modifiedAt: new Date('2024-12-01')
    }
  ]);
  
  const [businessGroupPricing, setBusinessGroupPricing] = useState<BusinessGroupPricing[]>([
    {
      id: '1',
      businessGroupId: 'ridgetop',
      businessGroupName: 'Ridgetop',
      esxPrice: 1250.00,
      wallReportPrice: 950.00,
      dadReportPrice: 1100.00,
      rushOrderPrice: 500.00,
      pdfPrice: 150.00,
      isActive: true,
      createdAt: new Date('2024-12-01'),
      modifiedAt: new Date('2024-12-01')
    },
    {
      id: '2',
      businessGroupId: 'skyline',
      businessGroupName: 'Skyline',
      esxPrice: 1400.00,
      wallReportPrice: 1100.00,
      dadReportPrice: 1300.00,
      rushOrderPrice: 600.00,
      pdfPrice: 200.00,
      isActive: true,
      createdAt: new Date('2024-12-01'),
      modifiedAt: new Date('2024-12-01')
    }
  ]);
  
  const [customerPricing, setCustomerPricing] = useState<CustomerSpecificPricing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showCustomerPricingModal, setShowCustomerPricingModal] = useState(false);
  const [selectedBusinessGroup, setSelectedBusinessGroup] = useState<BusinessGroupPricing | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<FilterState>({
    status: 'all'
  });

  const [newService, setNewService] = useState({
    name: '',
    description: '',
    isActive: true
  });

  const [editingPricing, setEditingPricing] = useState<BusinessGroupPricing | null>(null);
  
  const [newCustomerPricing, setNewCustomerPricing] = useState({
    customerName: '',
    serviceType: services.length > 0 ? services[0].name as CustomerSpecificPricing['serviceType'] : 'ESX Report' as CustomerSpecificPricing['serviceType'],
    price: ''
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const clearFilters = () => {
    setFilters({
      status: 'all'
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return searchTerm !== '' || filters.status !== 'all';
  };

  const filteredAndSortedServices = useMemo(() => {
    let filtered = services;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(service => 
        filters.status === 'active' ? service.isActive : !service.isActive
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'isActive':
          aValue = a.isActive;
          bValue = b.isActive;
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [services, searchTerm, filters, sortField, sortDirection]);

  const handleAddService = () => {
    if (newService.name.trim() && newService.description.trim()) {
      const service: Service = {
        id: Date.now().toString(),
        name: newService.name.trim(),
        description: newService.description.trim(),
        isActive: newService.isActive,
        createdAt: new Date(),
        modifiedAt: new Date()
      };
      
      setServices(prev => [...prev, service]);
      setNewService({
        name: '',
        description: '',
        isActive: true
      });
      setShowAddServiceModal(false);
      alert(`Service "${service.name}" added successfully!`);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service && confirm(`Are you sure you want to delete "${service.name}"?`)) {
      setServices(prev => prev.filter(s => s.id !== serviceId));
      alert(`Service "${service.name}" deleted successfully!`);
    }
  };

  const handleToggleServiceStatus = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, isActive: !service.isActive, modifiedAt: new Date() }
        : service
    ));
  };

  const handleManagePricing = (businessGroup: BusinessGroupPricing) => {
    setSelectedBusinessGroup(businessGroup);
    setEditingPricing({ ...businessGroup });
    setShowPricingModal(true);
  };

  const handleSavePricing = () => {
    if (editingPricing) {
      setBusinessGroupPricing(prev => prev.map(bg => 
        bg.id === editingPricing.id 
          ? { ...editingPricing, modifiedAt: new Date() }
          : bg
      ));
      setShowPricingModal(false);
      setEditingPricing(null);
      alert(`Pricing for ${editingPricing.businessGroupName} updated successfully!`);
    }
  };

  const handleManageCustomerPricing = (businessGroup: BusinessGroupPricing) => {
    setSelectedBusinessGroup(businessGroup);
    setNewCustomerPricing({
      customerName: '',
      serviceType: filteredAndSortedServices.length > 0 ? filteredAndSortedServices[0].name as CustomerSpecificPricing['serviceType'] : 'ESX Report',
      price: ''
    });
    setShowCustomerPricingModal(true);
  };

  const handleAddCustomerPricing = () => {
    if (selectedBusinessGroup && newCustomerPricing.customerName.trim() && newCustomerPricing.price) {
      const customerPrice: CustomerSpecificPricing = {
        id: Date.now().toString(),
        businessGroupId: selectedBusinessGroup.businessGroupId,
        customerName: newCustomerPricing.customerName.trim(),
        serviceType: newCustomerPricing.serviceType,
        price: parseFloat(newCustomerPricing.price),
        isActive: true,
        createdAt: new Date(),
        modifiedAt: new Date()
      };
      
      setCustomerPricing(prev => [...prev, customerPrice]);
      setNewCustomerPricing({
        customerName: '',
        serviceType: 'ESX Report',
        price: ''
      });
      alert(`Custom pricing for "${customerPrice.customerName}" added successfully!`);
    }
  };

  const getCustomerPricingForGroup = (businessGroupId: string) => {
    return customerPricing.filter(cp => cp.businessGroupId === businessGroupId);
  };

  const handleDeleteCustomerPricing = (customerPricingId: string) => {
    if (confirm('Are you sure you want to delete this custom pricing?')) {
      setCustomerPricing(prev => prev.filter(cp => cp.id !== customerPricingId));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Services Management</h1>
        <button 
          onClick={() => setShowAddServiceModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Service</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Available Services Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Wrench className="w-5 h-5 text-blue-600 mr-2" />
            Available Services
          </h2>
        </div>

        {/* Search and Filters for Services */}
        <div className="mb-4 bg-gray-50 rounded-lg border border-gray-200 p-3">
          <div className="flex flex-col gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 rounded-lg border transition-colors duration-200 text-sm ${
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

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as FilterState['status'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedServices.map((service) => (
            <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                      service.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{service.description}</p>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleToggleServiceStatus(service.id)}
                  className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                    service.isActive 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {service.isActive ? 'Disable' : 'Enable'}
                </button>
                <button 
                  onClick={() => handleDeleteService(service.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Group Pricing Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Building2 className="w-5 h-5 text-purple-600 mr-2" />
            Business Group Pricing
          </h2>
        </div>

        <div className="space-y-6">
          {businessGroupPricing.map((bgPricing) => (
            <div key={bgPricing.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{bgPricing.businessGroupName}</h3>
                    <p className="text-sm text-gray-500">Business Group Pricing Configuration</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleManageCustomerPricing(bgPricing)}
                    className="inline-flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200 text-sm font-medium"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Customer Pricing
                  </button>
                  <button
                    onClick={() => handleManagePricing(bgPricing)}
                    className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Pricing
                  </button>
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Display all active services */}
                {filteredAndSortedServices.filter(service => service.isActive).map((service, index) => {
                  const colors = [
                    'bg-blue-50 border-blue-200 text-blue-800',
                    'bg-green-50 border-green-200 text-green-800', 
                    'bg-purple-50 border-purple-200 text-purple-800',
                    'bg-red-50 border-red-200 text-red-800',
                    'bg-yellow-50 border-yellow-200 text-yellow-800',
                    'bg-indigo-50 border-indigo-200 text-indigo-800',
                    'bg-pink-50 border-pink-200 text-pink-800'
                  ];
                  const colorClass = colors[index % colors.length];
                  
                  // Get price for this service from business group pricing
                  const getServicePrice = (serviceName: string) => {
                    switch (serviceName) {
                      case 'ESX Report': return bgPricing.esxPrice;
                      case 'Wall Report': return bgPricing.wallReportPrice;
                      case 'DAD Report': return bgPricing.dadReportPrice;
                      case 'Rush Order': return bgPricing.rushOrderPrice;
                      case 'PDF': return bgPricing.pdfPrice;
                      default: return 0; // For newly added services, default to 0
                    }
                  };
                  
                  return (
                    <div key={service.id} className={`rounded-lg p-3 text-center border ${colorClass}`}>
                      <div className="text-sm font-medium mb-1">{service.name}</div>
                      <div className="text-lg font-bold">{formatCurrency(getServicePrice(service.name))}</div>
                    </div>
                  );
                })}
                
                {/* Show message if no active services */}
                {filteredAndSortedServices.filter(service => service.isActive).length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Wrench className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm">No active services available</p>
                    <p className="text-xs">Add services above to see pricing options</p>
                  </div>
                )}
              </div>

              {/* Customer-Specific Pricing Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Custom customer pricing: {getCustomerPricingForGroup(bgPricing.businessGroupId).length} customers
                  </div>
                  {getCustomerPricingForGroup(bgPricing.businessGroupId).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {getCustomerPricingForGroup(bgPricing.businessGroupId).slice(0, 3).map(cp => (
                        <span key={cp.id} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          {cp.customerName}
                        </span>
                      ))}
                      {getCustomerPricingForGroup(bgPricing.businessGroupId).length > 3 && (
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          +{getCustomerPricingForGroup(bgPricing.businessGroupId).length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddServiceModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full mx-4">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Add New Service</h3>
                  </div>
                  <button 
                    onClick={() => setShowAddServiceModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Name *
                    </label>
                    <input
                      type="text"
                      value={newService.name}
                      onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="e.g., ESX Report, DAD Report, Wall Report"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={newService.description}
                      onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="Describe what this service includes..."
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newService.isActive}
                      onChange={(e) => setNewService(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Service is active
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  onClick={handleAddService}
                  disabled={!newService.name.trim() || !newService.description.trim()}
                  className={`w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:w-auto sm:text-sm transition-colors duration-200 ${
                    newService.name.trim() && newService.description.trim()
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </button>
                <button
                  onClick={() => setShowAddServiceModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Group Pricing Modal */}
      {showPricingModal && editingPricing && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPricingModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full mx-4">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Edit Pricing for {editingPricing.businessGroupName}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowPricingModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {editingPricing.businessGroupName} - Service Pricing *
                    </label>
                    <div className="space-y-4">
                      {/* Dynamic pricing inputs for all active services */}
                      {filteredAndSortedServices.filter(service => service.isActive).map((service) => (
                        <div key={service.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {service.name} Price *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={(() => {
                                // Get the current price for this service
                                switch (service.name) {
                                  case 'ESX Report': return editingPricing?.esxPrice || 0;
                                  case 'Wall Report': return editingPricing?.wallReportPrice || 0;
                                  case 'DAD Report': return editingPricing?.dadReportPrice || 0;
                                  case 'Rush Order': return editingPricing?.rushOrderPrice || 0;
                                  case 'PDF': return editingPricing?.pdfPrice || 0;
                                  default: return 0;
                                }
                              })()}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                setEditingPricing(prev => {
                                  if (!prev) return null;
                                  switch (service.name) {
                                    case 'ESX Report': return { ...prev, esxPrice: value };
                                    case 'Wall Report': return { ...prev, wallReportPrice: value };
                                    case 'DAD Report': return { ...prev, dadReportPrice: value };
                                    case 'Rush Order': return { ...prev, rushOrderPrice: value };
                                    case 'PDF': return { ...prev, pdfPrice: value };
                                    default: return prev;
                                  }
                                });
                              }}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                              required
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                        </div>
                      ))}
                      
                      {filteredAndSortedServices.filter(service => service.isActive).length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                          <Wrench className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm">No active services available</p>
                          <p className="text-xs">Add services above to configure pricing</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  onClick={handleSavePricing}
                  className="w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Pricing
                </button>
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer-Specific Pricing Modal */}
      {showCustomerPricingModal && selectedBusinessGroup && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCustomerPricingModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full mx-4">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Customer Pricing for {selectedBusinessGroup.businessGroupName}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowCustomerPricingModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                {/* Add New Customer Pricing */}
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Add Customer-Specific Pricing</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <input
                        type="text"
                        value={newCustomerPricing.customerName}
                        onChange={(e) => setNewCustomerPricing(prev => ({ ...prev, customerName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="Customer name"
                      />
                    </div>
                    <div>
                      <select
                        value={newCustomerPricing.serviceType}
                        onChange={(e) => setNewCustomerPricing(prev => ({ ...prev, serviceType: e.target.value as CustomerSpecificPricing['serviceType'] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      >
                        {filteredAndSortedServices.filter(service => service.isActive).map(service => (
                          <option key={service.id} value={service.name}>{service.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newCustomerPricing.price}
                          onChange={(e) => setNewCustomerPricing(prev => ({ ...prev, price: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                          placeholder="0.00"
                        />
                      </div>
                      <button
                        onClick={handleAddCustomerPricing}
                        disabled={!newCustomerPricing.customerName.trim() || !newCustomerPricing.price}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 text-sm ${
                          newCustomerPricing.customerName.trim() && newCustomerPricing.price
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Existing Customer Pricing List */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Existing Customer Pricing</h4>
                  {getCustomerPricingForGroup(selectedBusinessGroup.businessGroupId).length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm">No custom pricing set</p>
                      <p className="text-xs">All customers use standard business group pricing</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {getCustomerPricingForGroup(selectedBusinessGroup.businessGroupId).map((customerPrice) => (
                        <div key={customerPrice.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{customerPrice.customerName}</div>
                              <div className="text-xs text-gray-500">
                                {customerPrice.serviceType} • Added {customerPrice.createdAt.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-green-600">
                              {formatCurrency(customerPrice.price)}
                            </span>
                            <button
                              onClick={() => handleDeleteCustomerPricing(customerPrice.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowCustomerPricingModal(false)}
                  className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};