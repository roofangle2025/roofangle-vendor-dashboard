import React, { useState, useMemo } from 'react';
import { ArrowLeft, Users, Shield, Activity, Plus, UserPlus, Settings, RotateCcw, Trash2, UserX, UserCheck, Edit, Power, PowerOff, Search, Filter, ChevronDown, X } from 'lucide-react';
import type { BusinessGroup, User, Role, ActivityLog } from '../types';
import { mockBusinessGroups, mockRoles, mockActivityLogs } from '../data/mockData';
import { AddUserToGroupModal } from './AddUserToGroupModal';
import { EditUserModal } from './EditUserModal';

interface GroupDetailsPageProps {
  groupId: string;
  onBack: () => void;
}

type TabType = 'users' | 'roles' | 'logs';
type SortField = 'name' | 'status' | 'email';
type SortDirection = 'asc' | 'desc';

interface UserFilterState {
  status: 'all' | 'active' | 'inactive' | 'pending';
  roles: 'all' | 'admin' | 'manager' | 'user';
}

export const GroupDetailsPage: React.FC<GroupDetailsPageProps> = ({ groupId, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<UserFilterState>({
    status: 'all',
    roles: 'all'
  });
  
  const [groupData, setGroupData] = useState(() => {
    const group = mockBusinessGroups.find(g => g.id === groupId);
    return group || null;
  });
  const [groupUsers, setGroupUsers] = useState(() => {
    const group = mockBusinessGroups.find(g => g.id === groupId);
    return group?.users || [];
  });
  
  const groupLogs = mockActivityLogs.filter(log => log.groupId === groupId);
  
  if (!groupData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Group not found</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:text-blue-700">
          Go back
        </button>
      </div>
    );
  }

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
      status: 'all',
      roles: 'all'
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return searchTerm !== '' || 
           filters.status !== 'all' || 
           filters.roles !== 'all';
  };

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = groupUsers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    // Roles filter
    if (filters.roles !== 'all') {
      const roleFilter = filters.roles.charAt(0).toUpperCase() + filters.roles.slice(1);
      filtered = filtered.filter(user => user.roles.includes(roleFilter));
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
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
  }, [groupUsers, searchTerm, filters, sortField, sortDirection]);

  const handleAddUser = (userData: {
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
  }) => {
    // In a real app, this would make an API call
    console.log('Adding user to group:', { groupId, userData });
    alert(`Invitation sent to ${userData.email} for ${groupData.name} group`);
  };

  const handleResetPassword = (userId: string) => {
    alert(`Password reset email sent to user ${userId}`);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to remove this user from the group?')) {
      setGroupUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setGroupUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' as const }
        : user
    ));
  };

  const handleToggleGroupStatus = () => {
    setGroupData(prev => prev ? {
      ...prev,
      status: prev.status === 'active' ? 'inactive' : 'active' as const
    } : null);
  };

  const handleEditUser = (userId: string) => {
    const user = groupUsers.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowEditModal(true);
    }
  };

  const handleSaveUser = (userData: {
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    status: User['status'];
  }) => {
    if (selectedUser) {
      setGroupUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...userData }
          : user
      ));
      alert(`User ${userData.firstName} ${userData.lastName} has been updated successfully!`);
    }
  };

  const formatLogTime = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGroupStatusColor = (status: BusinessGroup['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <button 
          onClick={onBack}
          className="self-start p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">{groupData.name}</h1>
            <span className={`inline-flex px-3 py-1 text-xs sm:text-sm font-semibold rounded-full self-start ${getGroupStatusColor(groupData.status)}`}>
              {groupData.status}
            </span>
          </div>
          {groupData.description && (
            <p className="text-gray-600 mt-1 text-sm sm:text-base">{groupData.description}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button 
            onClick={handleToggleGroupStatus}
            className={`inline-flex items-center justify-center px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm ${
              groupData.status === 'active' 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {groupData.status === 'active' ? (
              <>
                <PowerOff className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Disable Group</span>
                <span className="sm:hidden">Disable</span>
              </>
            ) : (
              <>
                <Power className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Enable Group</span>
                <span className="sm:hidden">Enable</span>
              </>
            )}
          </button>
          <button className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm">
            <Settings className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Group Settings</span>
            <span className="sm:hidden">Settings</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{groupUsers.length}</p>
              <p className="text-gray-600 text-sm sm:text-base">Total Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{mockRoles.length}</p>
              <p className="text-gray-600 text-sm sm:text-base">Available Roles</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{groupLogs.length}</p>
              <p className="text-gray-600 text-sm sm:text-base">Recent Activities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max">
            {[
              { id: 'users', label: 'Users', icon: Users },
              { id: 'roles', label: 'Roles', icon: Shield },
              { id: 'logs', label: 'Activity Logs', icon: Activity }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center space-x-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{id === 'logs' ? 'Logs' : label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'users' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h3 className="text-lg font-medium text-gray-900">Group Members</h3>
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Add User</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>

              {/* Search and Filters for Users */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search users by name, email, or role..."
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as UserFilterState['status'] }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>

                      {/* Roles Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                        <select
                          value={filters.roles}
                          onChange={(e) => setFilters(prev => ({ ...prev, roles: e.target.value as UserFilterState['roles'] }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        >
                          <option value="all">All Roles</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="user">User</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Results Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing {filteredAndSortedUsers.length} of {groupUsers.length} users in this group
                    {hasActiveFilters() && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        Filtered
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              {/* Users Table - Mobile Card View / Desktop Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Mobile Card View */}
                <div className="block lg:hidden">
                  {filteredAndSortedUsers.length === 0 ? (
                    <div className="p-6 text-center">
                      <Users className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
                      <p className="text-gray-500 text-lg font-medium">No users found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {hasActiveFilters() 
                          ? 'Try adjusting your search or filters'
                          : 'Add your first user to this group'
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
                      {filteredAndSortedUsers.map((user) => (
                        <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-blue-700">
                                  {user.firstName[0]}{user.lastName[0]}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusColor(user.status)}`}>
                                  {user.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map(role => (
                                <span key={role} className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => handleEditUser(user.id)}
                              className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 text-xs font-medium"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleToggleUserStatus(user.id)}
                              className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                                user.status === 'active' 
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {user.status === 'active' ? (
                                <>
                                  <UserX className="w-3 h-3 mr-1" />
                                  Revoke
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Enable
                                </>
                              )}
                            </button>
                            <button 
                              onClick={() => handleResetPassword(user.id)}
                              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-xs font-medium"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Reset
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
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
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>User</span>
                            <span className="text-blue-600">{getSortIcon('name')}</span>
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => handleSort('email')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Email</span>
                            <span className="text-blue-600">{getSortIcon('email')}</span>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAndSortedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <Users className="w-12 h-12 text-gray-300 mb-4" />
                              <p className="text-gray-500 text-lg font-medium">No users found</p>
                              <p className="text-gray-400 text-sm mt-1">
                                {hasActiveFilters() 
                                  ? 'Try adjusting your search or filters'
                                  : 'Add your first user to this group'
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
                        filteredAndSortedUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-700">
                                    {user.firstName[0]}{user.lastName[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {user.roles.map(role => (
                                  <span key={role} className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                    {role}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button 
                                  onClick={() => handleEditUser(user.id)}
                                  className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 text-xs font-medium"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleToggleUserStatus(user.id)}
                                  className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                                    user.status === 'active' 
                                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                >
                                  {user.status === 'active' ? (
                                    <>
                                      <UserX className="w-3 h-3 mr-1" />
                                      Revoke
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-3 h-3 mr-1" />
                                      Enable
                                    </>
                                  )}
                                </button>
                                <button 
                                  onClick={() => handleResetPassword(user.id)}
                                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-xs font-medium"
                                >
                                  <RotateCcw className="w-3 h-3 mr-1" />
                                  Reset
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(user.id)}
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
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h3 className="text-lg font-medium text-gray-900">Available Roles</h3>
                <button className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {mockRoles.map((role) => (
                  <div key={role.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900">{role.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                      </div>
                      <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 ml-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700 uppercase tracking-wider">Permissions</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map(permission => (
                          <span key={permission} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              
              <div className="space-y-3">
                {groupLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 border border-gray-200 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">{log.action}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{formatLogTime(log.timestamp)}</p>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">by {log.userName}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AddUserToGroupModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onAddUser={handleAddUser}
        groupName={groupData.name}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSaveUser={handleSaveUser}
        user={selectedUser}
      />
    </div>
  );
};