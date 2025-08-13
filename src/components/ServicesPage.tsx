import React, { useState, useMemo } from 'react';
import { Plus, Wrench, Edit, Trash2, DollarSign, Search, Filter, ChevronDown, X, Save, Building2, AlertCircle } from 'lucide-react';
import { Service, BusinessGroupPricing } from '../types';
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
      commercialPrice: 1400.00,
      residentialPrice: 1200.00,
      deliveryTimeHours: 48, // 48 hours = 2 days
      basePrice: 1200.00,
      isActive: true,
      createdAt: new Date('2024-12-01'),
      modifiedAt: new Date('2024-12-01')
    },
    {
      id: '2',
      name: 'Wall Report',
      description: 'Detailed wall inspection and structural analysis',
      commercialPrice: 1100.00,
      residentialPrice: 900.00,
      deliveryTimeHours: 72, // 72 hours = 3 days
      basePrice: 900.00,
      isActive: true,
      createdAt: new Date('2024-12-01'),
      modifiedAt: new Date('2024-12-01')
    },
    {
      id: '3',
      name: 'DAD Report',
      description: 'Damage assessment documentation and analysis',
      commercialPrice: 1300.00,
      residentialPrice: 1050.00,
      deliveryTimeHours: 60, // 60 hours = 2.5 days
      basePrice: 1050.00,
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
      servicePrices: {
        '1': { commercialPrice: 1450.00, residentialPrice: 1250.00 }, // ESX Report
        '2': { commercialPrice: 1150.00, residentialPrice: 950.00 },  // Wall Report
        '3': { commercialPrice: 1350.00, residentialPrice: 1100.00 }  // DAD Report
      },
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
      servicePrices: {
        '1': { commercialPrice: 1600.00, residentialPrice: 1400.00 }, // ESX Report
        '2': { commercialPrice: 1300.00, residentialPrice: 1100.00 }, // Wall Report
        '3': { commercialPrice: 1500.00, residentialPrice: 1300.00 }  // DAD Report
      },
      rushOrderPrice: 600.00,
      pdfPrice: 200.00,
      isActive: true,
      createdAt: new Date('2024-12-01'),
      modifiedAt: new Date('2024-12-01')
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [editingPricing, setEditingPricing] = useState<BusinessGroupPricing | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<FilterState>({
    status: 'all'
  });

  const [newService, setNewService] = useState({
    name: '',
    description: '',
    commercialPrice: 0,
    residentialPrice: 0,
    deliveryTimeHours: 48,
    basePrice: 0,
    isActive: true
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

  const getServicePricing = (businessGroup: BusinessGroupPricing, serviceId: string) => {
    return businessGroup.servicePrices[serviceId] || { commercialPrice: 0, residentialPrice: 0 };
  };

  const updateServicePricing = (serviceId: string, type: 'commercial' | 'residential', price: number) => {
    if (!editingPricing) return;
    
    setEditingPricing(prev => {
      if (!prev) return null;
      const currentPricing = prev.servicePrices[serviceId] || { commercialPrice: 0, residentialPrice: 0 };
      return {
        ...prev,
        servicePrices: {
          ...prev.servicePrices,
          [serviceId]: {
            ...currentPricing,
            [type === 'commercial' ? 'commercialPrice' : 'residentialPrice']: price
          }
        }
      };
    });
  };

  const updateServiceDeliveryTime = (serviceId: string, type: 'commercial' | 'residential', hours: number) => {
    if (!editingPricing) return;
    
    setEditingPricing(prev => {
      if (!prev) return null;
      const currentPricing = prev.servicePrices[serviceId] || { 
        commercialPrice: 0, 
        residentialPrice: 0,
        commercialDeliveryTimeHours: 48,
        residentialDeliveryTimeHours: 48
      };
      return {
        ...prev,
        servicePrices: {
          ...prev.servicePrices,
          [serviceId]: {
            ...currentPricing,
            [type === 'commercial' ? 'commercialDeliveryTimeHours' : 'residentialDeliveryTimeHours']: hours
          }
        }
      };
    });
  };

  const formatDeliveryTime = (hours: number): string => {
    if (hours < 24) {
      return `${hours} hrs`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      if (remainingHours === 0) {
        return `${days} ${days === 1 ? 'day' : 'days'}`;
      } else {
        return `${days}d ${remainingHours}h`;
      }
    }
  };

  const handleAddService = () => {
    if (newService.name.trim() && newService.description.trim() && newService.commercialPrice > 0 && newService.residentialPrice > 0) {
      const service: Service = {
        id: Date.now().toString(),
        name: newService.name.trim(),
        description: newService.description.trim(),
        commercialPrice: newService.commercialPrice,
        residentialPrice: newService.residentialPrice,
        deliveryTimeHours: newService.deliveryTimeHours,
        basePrice: newService.basePrice,
        isActive: newService.isActive,
        createdAt: new Date(),
        modifiedAt: new Date()
      };
      
      setServices(prev => [...prev, service]);
      
      // Add the new service to all business group pricing with commercial/residential prices
      setBusinessGroupPricing(prev => prev.map(bg => ({
        ...bg,
        servicePrices: {
          ...bg.servicePrices,
          [service.id]: {
            commercialPrice: service.commercialPrice,
            residentialPrice: service.residentialPrice,
            commercialDeliveryTimeHours: service.deliveryTimeHours,
            residentialDeliveryTimeHours: service.deliveryTimeHours
          }
        },
        modifiedAt: new Date()
      })));
      
      setNewService({
        name: '',
        description: '',
        commercialPrice: 0,
        residentialPrice: 0,
        deliveryTimeHours: 48,
        basePrice: 0,
        isActive: true
      });
      setShowAddServiceModal(false);
      alert(`Service "${service.name}" added successfully and is now available for all business groups!`);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service && confirm(`Are you sure you want to delete "${service.name}"? This will remove it from all business group pricing.`)) {
      setServices(prev => prev.filter(s => s.id !== serviceId));
      
      // Remove the service from all business group pricing
      setBusinessGroupPricing(prev => prev.map(bg => {
        const { [serviceId]: removed, ...remainingPrices } = bg.servicePrices;
        return {
          ...bg,
          servicePrices: remainingPrices,
          modifiedAt: new Date()
        };
      }));
      
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

  const getServicePrice = (businessGroup: BusinessGroupPricing, serviceId: string): number => {
    const pricing = businessGroup.servicePrices[serviceId];
    return pricing ? (pricing.commercialPrice + pricing.residentialPrice) / 2 : 0; // Average for display
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
                    service.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleToggleServiceStatus(service.id)}
                  className={\`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
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
          
          {filteredAndSortedServices.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium">No services found</p>
              <p className="text-sm">
                {hasActiveFilters() 
                  ? 'Try adjusting your search or filters'
                  : 'Add your first service to get started'
                }
              </p>
            </div>
          )}
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
                <button
                  onClick={() => handleManagePricing(bgPricing)}
                  className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Pricing
                </button>
              </div>

              {/* Services Pricing Grid */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Service Pricing</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {services.filter(service => service.isActive).map((service, index) => {
                    const colors = [
                      'bg-blue-50 border-blue-200 text-blue-800',
                      'bg-green-50 border-green-200 text-green-800', 
                      'bg-purple-50 border-purple-200 text-purple-800',
                      'bg-orange-50 border-orange-200 text-orange-800',
                      'bg-pink-50 border-pink-200 text-pink-800'
                    ];
                    const colorClass = colors[index % colors.length];
                    const pricing = getServicePricing(bgPricing, service.id);
                    
                    return (
                      <div key={service.id} className={\`rounded-lg p-3 text-center border ${colorClass}`}>
                        <div className="text-sm font-medium mb-1">{service.name}</div>
                        <div className="text-xs space-y-1">
                          <div>C: {formatCurrency(pricing.commercialPrice)} | {formatDeliveryTime(pricing.commercialDeliveryTimeHours)}</div>
                          <div>R: {formatCurrency(pricing.residentialPrice)} | {formatDeliveryTime(pricing.residentialDeliveryTimeHours)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Default Pricing (Rush Order & PDF) */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Default Add-on Pricing</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-red-50 border-red-200 text-red-800 rounded-lg p-3 text-center border">
                    <div className="text-sm font-medium mb-1">Rush Order</div>
                    <div className="text-lg font-bold">{formatCurrency(bgPricing.rushOrderPrice)}</div>
                  </div>
                  <div className="bg-yellow-50 border-yellow-200 text-yellow-800 rounded-lg p-3 text-center border">
                    <div className="text-sm font-medium mb-1">PDF Required</div>
                    <div className="text-lg font-bold">{formatCurrency(bgPricing.pdfPrice)}</div>
                  </div>
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
                      placeholder="e.g., Roof Inspection, Foundation Report"
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commercial Price *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newService.commercialPrice}
                        onChange={(e) => setNewService(prev => ({ ...prev, commercialPrice: parseFloat(e.target.value) || 0 }))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Price for commercial properties</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Residential Price *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newService.residentialPrice}
                        onChange={(e) => setNewService(prev => ({ ...prev, residentialPrice: parseFloat(e.target.value) || 0 }))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Price for residential properties</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Time (Hours) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="720"
                      value={newService.deliveryTimeHours}
                      onChange={(e) => setNewService(prev => ({ ...prev, deliveryTimeHours: parseInt(e.target.value) || 48 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="48"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Estimated delivery time: {formatDeliveryTime(newService.deliveryTimeHours)}
                    </p>
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
                  disabled={!newService.name.trim() || !newService.description.trim() || newService.commercialPrice <= 0 || newService.residentialPrice <= 0}
                  className={\`w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:w-auto sm:text-sm transition-colors duration-200 ${
                    newService.name.trim() && newService.description.trim() && newService.commercialPrice > 0 && newService.residentialPrice > 0
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
                
                <div className="space-y-6">
                  {/* Service Pricing Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Wrench className="w-4 h-4 text-blue-600 mr-2" />
                      Service Pricing
                    </h4>
                    <div className="space-y-4">
                      {services.filter(service => service.isActive).map((service) => (
                        <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <Wrench className="w-4 h-4 text-blue-600" />
                            <h5 className="text-sm font-medium text-gray-900">{service.name}</h5>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {formatDeliveryTime(service.deliveryTimeHours)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-3">{service.description}</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Commercial Delivery Time *
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="720"
                                value={getServicePricing(editingPricing, service.id).commercialDeliveryTimeHours || 48}
                                onChange={(e) => updateServiceDeliveryTime(service.id, 'commercial', parseInt(e.target.value) || 48)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                                placeholder="48"
                                required
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Current: {formatDeliveryTime(getServicePricing(editingPricing, service.id).commercialDeliveryTimeHours || 48)}
                              </p>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Residential Delivery Time *
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="720"
                                value={getServicePricing(editingPricing, service.id).residentialDeliveryTimeHours || 36}
                                onChange={(e) => updateServiceDeliveryTime(service.id, 'residential', parseInt(e.target.value) || 36)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                                placeholder="36"
                                required
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Current: {formatDeliveryTime(getServicePricing(editingPricing, service.id).residentialDeliveryTimeHours || 36)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {services.filter(service => service.isActive).length === 0 && (
                        <div className="col-span-full text-center py-6 text-gray-500">
                          <Wrench className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm">No active services available</p>
                          <p className="text-xs">Add services above to configure pricing</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Default Add-on Pricing Section */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <AlertCircle className="w-4 h-4 text-orange-600 mr-2" />
                      Default Add-on Pricing
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rush Order Price *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editingPricing.rushOrderPrice}
                            onChange={(e) => setEditingPricing(prev => prev ? { ...prev, rushOrderPrice: parseFloat(e.target.value) || 0 } : null)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Additional charge for rush orders</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rush Order Delivery Time *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="168"
                          value={editingPricing.rushOrderDeliveryTimeHours}
                          onChange={(e) => setEditingPricing(prev => prev ? { ...prev, rushOrderDeliveryTimeHours: parseInt(e.target.value) || 24 } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                          placeholder="24"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Faster delivery time for rush orders - Current: {formatDeliveryTime(editingPricing.rushOrderDeliveryTimeHours)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          PDF Required Price *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editingPricing.pdfPrice}
                            onChange={(e) => setEditingPricing(prev => prev ? { ...prev, pdfPrice: parseFloat(e.target.value) || 0 } : null)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Additional charge for PDF delivery</p>
                      </div>
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
                  Save Changes
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
    </div>
  );
};