import React, { useState, useMemo } from 'react';
import { Plus, Settings, Edit, Trash2, Key, Eye, EyeOff, Search, Filter, ChevronDown, X, Save, Shield, Database, CreditCard, Zap } from 'lucide-react';
import { Property } from '../types';

type SortField = 'key' | 'category' | 'lastModified' | 'isRequired';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  category: 'all' | 'stripe' | 'payment' | 'api' | 'system' | 'other';
  required: 'all' | 'required' | 'optional';
  secure: 'all' | 'secure' | 'public';
}

export const PropertiesPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [visibleSecureValues, setVisibleSecureValues] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('key');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    required: 'all',
    secure: 'all'
  });

  const [newProperty, setNewProperty] = useState({
    key: '',
    value: '',
    description: '',
    category: 'stripe' as Property['category'],
    isSecure: false,
    isRequired: false
  });

  const getCategoryIcon = (category: Property['category']) => {
    switch (category) {
      case 'stripe': return <CreditCard className="w-4 h-4 text-purple-600" />;
      case 'payment': return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'api': return <Key className="w-4 h-4 text-blue-600" />;
      case 'system': return <Database className="w-4 h-4 text-gray-600" />;
      case 'other': return <Settings className="w-4 h-4 text-orange-600" />;
      default: return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: Property['category']) => {
    switch (category) {
      case 'stripe': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'payment': return 'bg-green-100 text-green-800 border-green-200';
      case 'api': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'system': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'other': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const maskSecureValue = (value: string) => {
    if (value.length <= 8) return '••••••••';
    return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4);
  };

  const toggleSecureValueVisibility = (propertyId: string) => {
    setVisibleSecureValues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
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
      category: 'all',
      required: 'all',
      secure: 'all'
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return searchTerm !== '' || 
           filters.category !== 'all' || 
           filters.required !== 'all' || 
           filters.secure !== 'all';
  };

  const filteredAndSortedProperties = useMemo(() => {
    let filtered = properties;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (!property.isSecure && property.value.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(property => property.category === filters.category);
    }

    // Required filter
    if (filters.required !== 'all') {
      filtered = filtered.filter(property => 
        filters.required === 'required' ? property.isRequired : !property.isRequired
      );
    }

    // Secure filter
    if (filters.secure !== 'all') {
      filtered = filtered.filter(property => 
        filters.secure === 'secure' ? property.isSecure : !property.isSecure
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'key':
          aValue = a.key.toLowerCase();
          bValue = b.key.toLowerCase();
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'lastModified':
          aValue = a.lastModified.getTime();
          bValue = b.lastModified.getTime();
          break;
        case 'isRequired':
          aValue = a.isRequired;
          bValue = b.isRequired;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [properties, searchTerm, filters, sortField, sortDirection]);

  const handleAddProperty = () => {
    if (newProperty.key.trim() && newProperty.value.trim()) {
      const property: Property = {
        id: Date.now().toString(),
        key: newProperty.key.trim(),
        value: newProperty.value.trim(),
        description: newProperty.description.trim(),
        category: newProperty.category,
        isSecure: newProperty.isSecure,
        isRequired: newProperty.isRequired,
        lastModified: new Date(),
        modifiedBy: 'Yashwnath K'
      };
      
      setProperties(prev => [...prev, property]);
      setNewProperty({
        key: '',
        value: '',
        description: '',
        category: 'stripe',
        isSecure: false,
        isRequired: false
      });
      setShowAddModal(false);
      alert(`Property "${property.key}" added successfully!`);
    }
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty({ ...property });
  };

  const handleSaveEdit = () => {
    if (editingProperty) {
      setProperties(prev => prev.map(property => 
        property.id === editingProperty.id 
          ? { 
              ...editingProperty, 
              lastModified: new Date(),
              modifiedBy: 'Yashwnath K'
            }
          : property
      ));
      setEditingProperty(null);
      alert(`Property "${editingProperty.key}" updated successfully!`);
    }
  };

  const handleDeleteProperty = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (property && confirm(`Are you sure you want to delete "${property.key}"?`)) {
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      alert(`Property "${property.key}" deleted successfully!`);
    }
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Properties Configuration</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Property</span>
          <span className="sm:hidden">Add</span>
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
                placeholder="Search properties by key or description..."
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
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as FilterState['category'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="stripe">Stripe</option>
                  <option value="payment">Payment</option>
                  <option value="api">API</option>
                  <option value="system">System</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Required Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required</label>
                <select
                  value={filters.required}
                  onChange={(e) => setFilters(prev => ({ ...prev, required: e.target.value as FilterState['required'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Properties</option>
                  <option value="required">Required Only</option>
                  <option value="optional">Optional Only</option>
                </select>
              </div>

              {/* Secure Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Security</label>
                <select
                  value={filters.secure}
                  onChange={(e) => setFilters(prev => ({ ...prev, secure: e.target.value as FilterState['secure'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Properties</option>
                  <option value="secure">Secure Only</option>
                  <option value="public">Public Only</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredAndSortedProperties.length} of {properties.length} properties
            {hasActiveFilters() && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Filtered
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {filteredAndSortedProperties.length === 0 ? (
            <div className="p-6 text-center">
              <Settings className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
              <p className="text-gray-500 text-lg font-medium">No properties found</p>
              <p className="text-gray-400 text-sm mt-1">
                {hasActiveFilters() 
                  ? 'Try adjusting your search or filters'
                  : 'Add your first property to get started'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAndSortedProperties.map((property) => (
                <div key={property.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getCategoryIcon(property.category)}
                        <h3 className="font-medium text-gray-900">{property.key}</h3>
                        {property.isRequired && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Required
                          </span>
                        )}
                        {property.isSecure && (
                          <Shield className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{property.description}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(property.category)}`}>
                        {property.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3 p-2 bg-gray-50 rounded border">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono text-gray-900 break-all flex-1">
                        {property.isSecure && !visibleSecureValues.has(property.id) 
                          ? maskSecureValue(property.value)
                          : property.value
                        }
                      </p>
                      {property.isSecure && (
                        <button
                          onClick={() => toggleSecureValueVisibility(property.id)}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          {visibleSecureValues.has(property.id) ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleEditProperty(property)}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-xs font-medium"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteProperty(property.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                  onClick={() => handleSort('key')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Property Key</span>
                    <span className="text-blue-600">{getSortIcon('key')}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Category</span>
                    <span className="text-blue-600">{getSortIcon('category')}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Security
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('lastModified')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Last Modified</span>
                    <span className="text-blue-600">{getSortIcon('lastModified')}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedProperties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Settings className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No properties found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {hasActiveFilters() 
                          ? 'Try adjusting your search or filters'
                          : 'Add your first property to get started'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(property.category)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{property.key}</span>
                            {property.isRequired && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{property.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 max-w-xs">
                        <div className="text-sm font-mono text-gray-900 break-all bg-gray-50 p-2 rounded border flex-1">
                          {property.isSecure && !visibleSecureValues.has(property.id) 
                            ? maskSecureValue(property.value)
                            : property.value
                          }
                        </div>
                        {property.isSecure && (
                          <button
                            onClick={() => toggleSecureValueVisibility(property.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          >
                            {visibleSecureValues.has(property.id) ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(property.category)}`}>
                        {getCategoryIcon(property.category)}
                        <span className="ml-1">{property.category}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {property.isSecure && (
                          <Shield className="w-4 h-4 text-yellow-600" />
                        )}
                        <span className={`text-xs font-medium ${property.isSecure ? 'text-yellow-700' : 'text-gray-600'}`}>
                          {property.isSecure ? 'Secure' : 'Public'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(property.lastModified)}</div>
                      <div className="text-xs text-gray-500">by {property.modifiedBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => handleEditProperty(property)}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-xs font-medium"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProperty(property.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full mx-4">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Add Property</h3>
                  </div>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Key *
                    </label>
                    <input
                      type="text"
                      value={newProperty.key}
                      onChange={(e) => setNewProperty(prev => ({ ...prev, key: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="e.g., STRIPE_SECRET_KEY"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={newProperty.category}
                      onChange={(e) => setNewProperty(prev => ({ ...prev, category: e.target.value as Property['category'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    >
                      <option value="stripe">Stripe</option>
                      <option value="payment">Payment</option>
                      <option value="api">API</option>
                      <option value="system">System</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value *
                    </label>
                    <input
                      type={newProperty.isSecure ? 'password' : 'text'}
                      value={newProperty.value}
                      onChange={(e) => setNewProperty(prev => ({ ...prev, value: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="Enter property value..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newProperty.description}
                      onChange={(e) => setNewProperty(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="Describe what this property is used for..."
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newProperty.isSecure}
                        onChange={(e) => setNewProperty(prev => ({ ...prev, isSecure: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Secure property (hide value)
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newProperty.isRequired}
                        onChange={(e) => setNewProperty(prev => ({ ...prev, isRequired: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Required property
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  onClick={handleAddProperty}
                  disabled={!newProperty.key.trim() || !newProperty.value.trim()}
                  className={`w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:w-auto sm:text-sm transition-colors duration-200 ${
                    newProperty.key.trim() && newProperty.value.trim()
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setEditingProperty(null)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full mx-4">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Edit Property</h3>
                  </div>
                  <button 
                    onClick={() => setEditingProperty(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Key
                    </label>
                    <input
                      type="text"
                      value={editingProperty.key}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Key cannot be modified</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value *
                    </label>
                    <input
                      type={editingProperty.isSecure ? 'password' : 'text'}
                      value={editingProperty.value}
                      onChange={(e) => setEditingProperty(prev => prev ? { ...prev, value: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editingProperty.description}
                      onChange={(e) => setEditingProperty(prev => prev ? { ...prev, description: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  onClick={handleSaveEdit}
                  disabled={!editingProperty.value.trim()}
                  className={`w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:w-auto sm:text-sm transition-colors duration-200 ${
                    editingProperty.value.trim()
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingProperty(null)}
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