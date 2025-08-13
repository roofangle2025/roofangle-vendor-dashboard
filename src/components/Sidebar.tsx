import React from 'react';
import { Shield, ShoppingCart, X, FileText, DollarSign, Settings, Building } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onNavigate: (page: 'business-groups' | 'order-dashboard' | 'reports-management' | 'payments' | 'runtime-management' | 'vendor-platform') => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onNavigate, onClose }) => {
  return (
    <aside 
      className={`fixed top-20 left-0 h-[calc(100vh-5rem)] bg-slate-800 text-white shadow-lg z-40 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700 lg:hidden">
        <span className="text-lg font-semibold">Menu</span>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-3">
          <li>
            <button 
              onClick={() => onNavigate('order-dashboard')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-white hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <ShoppingCart className="w-5 h-5 flex-shrink-0" />
              <span className="truncate font-medium">Order Management</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onNavigate('business-groups')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-white hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span className="truncate font-medium">Access Management</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onNavigate('reports-management')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-white hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <FileText className="w-5 h-5 flex-shrink-0" />
              <span className="truncate font-medium">Reports Management</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onNavigate('payments')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-white hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <DollarSign className="w-5 h-5 flex-shrink-0" />
              <span className="truncate font-medium">Financial Management</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onNavigate('vendor-platform')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-white hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <Building className="w-5 h-5 flex-shrink-0" />
              <span className="truncate font-medium">Vendor Platform</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onNavigate('runtime-management')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-white hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="truncate font-medium">Runtime Management</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};