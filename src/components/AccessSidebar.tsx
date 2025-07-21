import React from 'react';
import { Building2, Users, Shield, Activity } from 'lucide-react';

interface AccessSidebarProps {
  isVisible: boolean;
  currentPage: string;
  onNavigate: (page: 'users' | 'business-groups' | 'ra-role' | 'ra-audit-logs') => void;
  sidebarOffset: boolean;
}

export const AccessSidebar: React.FC<AccessSidebarProps> = ({ 
  isVisible, 
  currentPage, 
  onNavigate, 
  sidebarOffset 
}) => {
  if (!isVisible) return null;

  return (
    <aside 
      className={`fixed top-20 left-0 h-[calc(100vh-5rem)] w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col p-4 transition-transform duration-300 ease-in-out z-20 ${
        sidebarOffset ? 'transform translate-x-64' : ''
      } hidden lg:flex`}
    >
      <div className="text-lg font-semibold mb-6 text-gray-800">Access Management</div>
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <button 
              onClick={() => onNavigate('users')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                currentPage === 'users'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium">RA Users</span>
                <p className="text-xs text-gray-500 mt-0.5">Platform-wide user management</p>
              </div>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onNavigate('business-groups')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                currentPage === 'business-groups' || currentPage === 'group-details'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium">Business Groups</span>
                <p className="text-xs text-gray-500 mt-0.5">Group-specific user management</p>
              </div>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onNavigate('ra-role')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                currentPage === 'ra-role'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium">RA Role</span>
                <p className="text-xs text-gray-500 mt-0.5">Role and permission management</p>
              </div>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onNavigate('ra-audit-logs')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                currentPage === 'ra-audit-logs'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Activity className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium">RA Audit Logs</span>
                <p className="text-xs text-gray-500 mt-0.5">System activity tracking</p>
              </div>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};