import React from 'react';
import { CreditCard, Users } from 'lucide-react';

interface FinancialSidebarProps {
  isVisible: boolean;
  currentPage: string;
  onNavigate: (page: 'payments' | 'vendor-payments') => void;
  sidebarOffset: boolean;
}

export const FinancialSidebar: React.FC<FinancialSidebarProps> = ({ 
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
      <div className="text-lg font-semibold mb-6 text-gray-800">Financial Management</div>
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <button 
              onClick={() => onNavigate('vendor-payments')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                currentPage === 'vendor-payments'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium">Vendor Payments</span>
                <p className="text-xs text-gray-500 mt-0.5">Payments to vendors and contractors</p>
              </div>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onNavigate('payments')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                currentPage === 'payments'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CreditCard className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium">Payments</span>
                <p className="text-xs text-gray-500 mt-0.5">Customer payments and transactions</p>
              </div>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};