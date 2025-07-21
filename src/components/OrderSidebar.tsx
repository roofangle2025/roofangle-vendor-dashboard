import React from 'react';
import { BarChart3, Plus, Clock, Truck } from 'lucide-react';

interface OrderSidebarProps {
  isVisible: boolean;
  currentPage: string;
  onNavigate: (page: 'order-dashboard' | 'place-order' | 'order-process' | 'orders-delivery') => void;
  sidebarOffset: boolean;
}

export const OrderSidebar: React.FC<OrderSidebarProps> = ({ 
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
      <div className="text-lg font-semibold mb-6 text-gray-800">Order Management</div>
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <button 
              onClick={() => onNavigate('order-dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                currentPage === 'order-dashboard'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium">Dashboard</span>
                <p className="text-xs text-gray-500 mt-0.5">Order overview and analytics</p>
              </div>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onNavigate('place-order')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                currentPage === 'place-order'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Plus className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium">Place Order</span>
                <p className="text-xs text-gray-500 mt-0.5">Create new orders</p>
              </div>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onNavigate('order-process')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                currentPage === 'order-process'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Clock className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium">Order Process</span>
                <p className="text-xs text-gray-500 mt-0.5">Track order progress</p>
              </div>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onNavigate('orders-delivery')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                currentPage === 'orders-delivery'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Truck className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium">Orders Delivery</span>
                <p className="text-xs text-gray-500 mt-0.5">Manage deliveries</p>
              </div>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};