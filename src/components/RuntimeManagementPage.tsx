import React, { useState, useMemo } from 'react';
import { Settings, Plus, Edit, Save, X, Search, Filter, ChevronDown, Key, Database, Zap, Palette, Building, AlertCircle, CheckCircle, RotateCcw, Trash2 } from 'lucide-react';
import { RuntimeConfig } from '../types';

type SortField = 'key' | 'category' | 'lastModified' | 'value';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  category: 'all' | 'system' | 'features' | 'integrations' | 'ui' | 'business';
  type: 'all' | 'string' | 'number' | 'boolean' | 'json';
  required: 'all' | 'required' | 'optional';
}

// Mock runtime configuration data
const mockRuntimeConfigs: RuntimeConfig[] = [];

export const RuntimeManagementPage: React.FC = () => {
  const [configs, setConfigs] = useState<RuntimeConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<RuntimeConfig | null>(null);
  const [sortField, setSortField] = useState<SortField>('key');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    type: 'all',
    required: 'all'
  });

  const [newConfig, setNewConfig] = useState({
    key: '',
    value: '',
    description: '',
    category: 'system' as RuntimeConfig['category'],
    type: 'string' as RuntimeConfig['type'],
    isRequired: false
  });

  const getCategoryIcon = (category: RuntimeConfig['category']) => {
    switch (category) {
      case 'system': return <Database className="w-4 h-4 text-blue-600" />;
      case 'features': return <Zap className="w-4 h-4 text-green-600" />;
      case 'integrations': return <Key className="w-4 h-4 text-purple-600" />;
      case 'ui': return <Palette className="w-4 h-4 text-pink-600" />;
      case 'business': return <Building className="w-4 h-4 text-orange-600" />;
      default: return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: RuntimeConfig['category']) => {
    switch (category) {
      case 'system': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'features': return 'bg-green-100 text-green-800 border-green-200';
      case 'integrations': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ui': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'business': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: RuntimeConfig['type']) => {
    switch (type) {
      case 'string': return 'bg-gray-100 text-gray-800';
      case 'number': return 'bg-blue-100 text-blue-800';
      case 'boolean': return 'bg-green-100 text-green-800';
      case 'json': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      type: 'all',
      required: 'all'
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return searchTerm !== '' || 
           filters.category !== 'all' || 
           filters.type !== 'all' || 
           filters.required !== 'all';
  };

  const filteredAndSortedConfigs = useMemo(() => {
    let filtered = configs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(config =>
        config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(config => config.category === filters.category);
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(config => config.type === filters.type);
    }

    // Required filter
    if (filters.required !== 'all') {
      filtered = filtered.filter(config => 
        filters.required === 'required' ? config.isRequired : !config.isRequired
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
        case 'value':
          aValue = a.value.toLowerCase();
          bValue = b.value.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [configs, searchTerm, filters, sortField, sortDirection]);

  const handleAddConfig = () => {
    if (newConfig.key.trim() && newConfig.value.trim()) {
      const config: RuntimeConfig = {
        id: Date.now().toString(),
        key: newConfig.key.trim(),
        value: newConfig.value.trim(),
        description: newConfig.description.trim(),
        category: newConfig.category,
        type: newConfig.type,
        isRequired: newConfig.isRequired,
        lastModified: new Date(),
        modifiedBy: 'Yashwnath K'
      };
      
      setConfigs(prev => [...prev, config]);
      setNewConfig({
        key: '',
        value: '',
        description: '',
        category: 'system',
        type: 'string',
        isRequired: false
      });
      setShowAddModal(false);
      alert(`Configuration "${config.key}" added successfully!`);
    }
  };

  const handleEditConfig = (config: RuntimeConfig) => {
    setEditingConfig({ ...config });
  };

  const handleSaveEdit = () => {
    if (editingConfig) {
      setConfigs(prev => prev.map(config => 
        config.id === editingConfig.id 
          ? { 
              ...editingConfig, 
              lastModified: new Date(),
              modifiedBy: 'Yashwnath K'
            }
          : config
      ));
      setEditingConfig(null);
      alert(`Configuration "${editingConfig.key}" updated successfully!`);
    }
  };

  const handleDeleteConfig = (configId: string) => {
    const config = configs.find(c => c.id === configId);
    if (config && confirm(`Are you sure you want to delete "${config.key}"?`)) {
      setConfigs(prev => prev.filter(c => c.id !== configId));
      alert(`Configuration "${config.key}" deleted successfully!`);
    }
  };

  const handleResetToDefault = (configId: string) => {
    const config = configs.find(c => c.id === configId);
    if (config && confirm(`Reset "${config.key}" to default value?`)) {
      // In a real app, you would have default values stored
      alert(`Configuration "${config.key}" reset to default value!`);
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

  const validateValue = (value: string, type: RuntimeConfig['type']): boolean => {
    switch (type) {
      case 'number':
        return !isNaN(Number(value));
      case 'boolean':
        return value === 'true' || value === 'false';
      case 'json':
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      default:
        return true;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Runtime Management</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Configuration</span>
          <span className="sm:hidden">Add Config</span>
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
                placeholder="Search configurations by key, value, or description..."
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
                  <option value="system">System</option>
                  <option value="features">Features</option>
                  <option value="integrations">Integrations</option>
                  <option value="ui">UI/UX</option>
                  <option value="business">Business</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as FilterState['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="json">JSON</option>
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
                  <option value="all">All Configs</option>
                  <option value="required">Required Only</option>
                  <option value="optional">Optional Only</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredAndSortedConfigs.length} of {configs.length} configurations
            {hasActiveFilters() && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Filtered
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Configuration Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {filteredAndSortedConfigs.length === 0 ? (
            <div className="p-6 text-center">
              <Settings className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
              <p className="text-gray-500 text-lg font-medium">No configurations found</p>
              <p className="text-gray-400 text-sm mt-1">
                {hasActiveFilters() 
                  ? 'Try adjusting your search or filters'
                  : 'Add your first configuration to get started'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAndSortedConfigs.map((config) => (
                <div key={config.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getCategoryIcon(config.category)}
                        <p className="font-medium text-gray-900 truncate">{config.key}</p>
                        {config.isRequired && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{config.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(config.category)}`}>
                          {config.category}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(config.type)}`}>
                          {config.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3 p-2 bg-gray-50 rounded border">
                    <p className="text-sm font-mono text-gray-900 break-all">
                      {config.type === 'json' ? JSON.stringify(JSON.parse(config.value), null, 2) : config.value}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleEditConfig(config)}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-xs font-medium"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleResetToDefault(config.id)}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 text-xs font-medium"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset
                    </button>
                    <button 
                      onClick={() => handleDeleteConfig(config.id)}
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
                    <span>Configuration Key</span>
                    <span className="text-blue-600">{getSortIcon('key')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('value')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Value</span>
                    <span className="text-blue-600">{getSortIcon('value')}</span>
                  </div>
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
                  Type
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
              {filteredAndSortedConfigs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Settings className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No configurations found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {hasActiveFilters() 
                          ? 'Try adjusting your search or filters'
                          : 'Add your first configuration to get started'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedConfigs.map((config) => (
                  <tr key={config.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(config.category)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{config.key}</span>
                            {config.isRequired && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-mono text-gray-900 break-all bg-gray-50 p-2 rounded border">
                          {config.type === 'json' ? (
                            <pre className="text-xs whitespace-pre-wrap">
                              {JSON.stringify(JSON.parse(config.value), null, 2)}
                            </pre>
                          ) : (
                            config.value
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(config.category)}`}>
                        {getCategoryIcon(config.category)}
                        <span className="ml-1">{config.category}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(config.type)}`}>
                        {config.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(config.lastModified)}</div>
                      <div className="text-xs text-gray-500">by {config.modifiedBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => handleEditConfig(config)}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-xs font-medium"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleResetToDefault(config.id)}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 text-xs font-medium"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Reset
                        </button>
                        <button 
                          onClick={() => handleDeleteConfig(config.id)}
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

      {/* Add Configuration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full mx-4">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Add Configuration</h3>
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
                      Configuration Key *
                    </label>
                    <input
                      type="text"
                      value={newConfig.key}
                      onChange={(e) => setNewConfig(prev => ({ ...prev, key: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="e.g., STRIPE_SECRET_KEY"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        value={newConfig.category}
                        onChange={(e) => setNewConfig(prev => ({ ...prev, category: e.target.value as RuntimeConfig['category'] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      >
                        <option value="system">System</option>
                        <option value="features">Features</option>
                        <option value="integrations">Integrations</option>
                        <option value="ui">UI/UX</option>
                        <option value="business">Business</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                      <select
                        value={newConfig.type}
                        onChange={(e) => setNewConfig(prev => ({ ...prev, type: e.target.value as RuntimeConfig['type'] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value *
                    </label>
                    {newConfig.type === 'boolean' ? (
                      <select
                        value={newConfig.value}
                        onChange={(e) => setNewConfig(prev => ({ ...prev, value: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      >
                        <option value="">Select value...</option>
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    ) : newConfig.type === 'json' ? (
                      <textarea
                        value={newConfig.value}
                        onChange={(e) => setNewConfig(prev => ({ ...prev, value: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm font-mono"
                        placeholder='{"key": "value"}'
                        rows={4}
                        required
                      />
                    ) : (
                      <input
                        type={newConfig.type === 'number' ? 'number' : 'text'}
                        value={newConfig.value}
                        onChange={(e) => setNewConfig(prev => ({ ...prev, value: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder={newConfig.type === 'number' ? '123' : 'Enter value...'}
                        required
                      />
                    )}
                    {!validateValue(newConfig.value, newConfig.type) && newConfig.value && (
                      <p className="text-xs text-red-600 mt-1">Invalid {newConfig.type} format</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newConfig.description}
                      onChange={(e) => setNewConfig(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="Describe what this configuration does..."
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newConfig.isRequired}
                      onChange={(e) => setNewConfig(prev => ({ ...prev, isRequired: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Required configuration
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  onClick={handleAddConfig}
                  disabled={!newConfig.key.trim() || !newConfig.value.trim() || !validateValue(newConfig.value, newConfig.type)}
                  className={`w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:w-auto sm:text-sm transition-colors duration-200 ${
                    newConfig.key.trim() && newConfig.value.trim() && validateValue(newConfig.value, newConfig.type)
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Configuration
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

      {/* Edit Configuration Modal */}
      {editingConfig && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setEditingConfig(null)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full mx-4">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Edit Configuration</h3>
                  </div>
                  <button 
                    onClick={() => setEditingConfig(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Configuration Key
                    </label>
                    <input
                      type="text"
                      value={editingConfig.key}
                      onChange={(e) => setEditingConfig(prev => prev ? { ...prev, key: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Key cannot be modified</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value *
                    </label>
                    {editingConfig.type === 'boolean' ? (
                      <select
                        value={editingConfig.value}
                        onChange={(e) => setEditingConfig(prev => prev ? { ...prev, value: e.target.value } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      >
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    ) : editingConfig.type === 'json' ? (
                      <textarea
                        value={editingConfig.value}
                        onChange={(e) => setEditingConfig(prev => prev ? { ...prev, value: e.target.value } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm font-mono"
                        rows={6}
                        required
                      />
                    ) : (
                      <input
                        type={editingConfig.type === 'number' ? 'number' : 'text'}
                        value={editingConfig.value}
                        onChange={(e) => setEditingConfig(prev => prev ? { ...prev, value: e.target.value } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        required
                      />
                    )}
                    {!validateValue(editingConfig.value, editingConfig.type) && (
                      <p className="text-xs text-red-600 mt-1">Invalid {editingConfig.type} format</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editingConfig.description}
                      onChange={(e) => setEditingConfig(prev => prev ? { ...prev, description: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  onClick={handleSaveEdit}
                  disabled={!editingConfig.value.trim() || !validateValue(editingConfig.value, editingConfig.type)}
                  className={`w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:w-auto sm:text-sm transition-colors duration-200 ${
                    editingConfig.value.trim() && validateValue(editingConfig.value, editingConfig.type)
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingConfig(null)}
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