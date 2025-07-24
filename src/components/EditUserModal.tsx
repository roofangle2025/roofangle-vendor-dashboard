import React, { useState, useEffect } from 'react';
import { X, FolderEdit as UserEdit, Shield } from 'lucide-react';
import type { User } from '../types';
import { mockRoles } from '../data/mockData';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveUser: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    status: User['status'];
  }) => void;
  user: User | null;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ 
  isOpen, 
  onClose, 
  onSaveUser,
  user 
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    selectedRoles: [] as string[],
    status: 'active' as User['status']
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        selectedRoles: user.roles,
        status: user.status
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName.trim() && formData.lastName.trim() && formData.email.trim()) {
      onSaveUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        roles: formData.selectedRoles,
        status: formData.status
      });
      onClose();
    }
  };

  const handleRoleToggle = (roleName: string) => {
    setFormData(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(roleName)
        ? prev.selectedRoles.filter(r => r !== roleName)
        : [...prev.selectedRoles, roleName]
    }));
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full mx-4">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <UserEdit className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900">
                  Edit User
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as User['status'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Assign Roles
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {mockRoles.map((role) => (
                    <label key={role.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selectedRoles.includes(role.name)}
                        onChange={() => handleRoleToggle(role.name)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5 flex-shrink-0"
                      />
                      <div className="flex items-start space-x-2 min-w-0 flex-1">
                        <Shield className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-gray-900 block">{role.name}</span>
                          <p className="text-xs text-gray-500">{role.description}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </form>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
            <button
              onClick={handleSubmit}
              className="w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm transition-colors duration-200"
            >
              <UserEdit className="w-4 h-4 mr-2" />
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};