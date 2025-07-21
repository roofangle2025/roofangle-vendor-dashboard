import React from 'react';
import { BarChart3, Package, Clock, CheckCircle, TrendingUp, Calendar, Plus, Eye, Truck } from 'lucide-react';
import { getOrderStats, mockOrders } from '../data/mockData';
import { Order } from '../types';

interface OrderDashboardPageProps {
  onSelectOrder: (orderId: string) => void;
}

export const OrderDashboardPage: React.FC<OrderDashboardPageProps> = ({ onSelectOrder }) => {
  const orderStats = getOrderStats();
  const newOrders = mockOrders.filter(o => o.status === 'new').length;
  const sketchOrders = mockOrders.filter(o => o.status === 'sketch').length;
  const qaOrders = mockOrders.filter(o => o.status === 'qa').length;
  const readyOrders = mockOrders.filter(o => o.status === 'ready').length;
  const rollbackOrders = mockOrders.filter(o => o.status === 'rollback').length;
  const cancelledOrders = mockOrders.filter(o => o.status === 'cancelled').length;
  const deliveredOrders = mockOrders.filter(o => o.status === 'delivered').length;
  const recentOrders = mockOrders.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sketch': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'qa': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'rollback': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'delivered': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Order Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Overall Stats - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Plus className="w-[clamp(1.25rem,2.5vw,1.75rem)] h-[clamp(1.25rem,2.5vw,1.75rem)] text-blue-600" />
            <div className="ml-[clamp(0.5rem,1.5vw,1rem)]">
              <p className="text-[clamp(1rem,2.5vw,1.5rem)] font-semibold text-gray-900">{newOrders}</p>
              <p className="text-gray-600 text-[clamp(0.75rem,1.5vw,1rem)]">New Orders</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Package className="w-[clamp(1.25rem,2.5vw,1.75rem)] h-[clamp(1.25rem,2.5vw,1.75rem)] text-purple-600" />
            <div className="ml-[clamp(0.5rem,1.5vw,1rem)]">
              <p className="text-[clamp(1rem,2.5vw,1.5rem)] font-semibold text-gray-900">{sketchOrders}</p>
              <p className="text-gray-600 text-[clamp(0.75rem,1.5vw,1rem)]">Sketch</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="w-[clamp(1.25rem,2.5vw,1.75rem)] h-[clamp(1.25rem,2.5vw,1.75rem)] text-orange-600" />
            <div className="ml-[clamp(0.5rem,1.5vw,1rem)]">
              <p className="text-[clamp(1rem,2.5vw,1.5rem)] font-semibold text-gray-900">{qaOrders}</p>
              <p className="text-gray-600 text-[clamp(0.75rem,1.5vw,1rem)]">QA</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <TrendingUp className="w-[clamp(1.25rem,2.5vw,1.75rem)] h-[clamp(1.25rem,2.5vw,1.75rem)] text-green-600" />
            <div className="ml-[clamp(0.5rem,1.5vw,1rem)]">
              <p className="text-[clamp(1rem,2.5vw,1.5rem)] font-semibold text-gray-900">{readyOrders}</p>
              <p className="text-gray-600 text-[clamp(0.75rem,1.5vw,1rem)]">Ready</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="w-[clamp(1.25rem,2.5vw,1.75rem)] h-[clamp(1.25rem,2.5vw,1.75rem)] text-red-600" />
            <div className="ml-[clamp(0.5rem,1.5vw,1rem)]">
              <p className="text-[clamp(1rem,2.5vw,1.5rem)] font-semibold text-gray-900">{rollbackOrders}</p>
              <p className="text-gray-600 text-[clamp(0.75rem,1.5vw,1rem)]">Rollback</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Package className="w-[clamp(1.25rem,2.5vw,1.75rem)] h-[clamp(1.25rem,2.5vw,1.75rem)] text-gray-600" />
            <div className="ml-[clamp(0.5rem,1.5vw,1rem)]">
              <p className="text-[clamp(1rem,2.5vw,1.5rem)] font-semibold text-gray-900">{cancelledOrders}</p>
              <p className="text-gray-600 text-[clamp(0.75rem,1.5vw,1rem)]">Cancelled</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Truck className="w-[clamp(1.25rem,2.5vw,1.75rem)] h-[clamp(1.25rem,2.5vw,1.75rem)] text-teal-600" />
            <div className="ml-[clamp(0.5rem,1.5vw,1rem)]">
              <p className="text-[clamp(1rem,2.5vw,1.5rem)] font-semibold text-gray-900">{deliveredOrders}</p>
              <p className="text-gray-600 text-[clamp(0.75rem,1.5vw,1rem)]">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders by Business Group - Table Format */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center mb-6">
          <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Orders by Business Group</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Group
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Orders
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sketch
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QA
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ready
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rollback
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cancelled
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivered
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orderStats.map((stat) => (
                <tr key={stat.businessGroup} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{stat.businessGroup}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border bg-blue-100 text-blue-800 border-blue-200">
                      {stat.newOrders}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border bg-purple-100 text-purple-800 border-purple-200">
                      {stat.sketch}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border bg-orange-100 text-orange-800 border-orange-200">
                      {stat.qa}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border bg-green-100 text-green-800 border-green-200">
                      {stat.ready}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border bg-red-100 text-red-800 border-red-200">
                      {stat.rollback}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border bg-gray-100 text-gray-800 border-gray-200">
                      {stat.cancelled}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border bg-teal-100 text-teal-800 border-teal-200">
                      {stat.delivered}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Recent Orders</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Group
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rush
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Time
                </th>
                <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => onSelectOrder(order.id)}
                >
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.businessGroup}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.rushOrder ? 'Yes' : 'No'}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(order.deliveryDate)}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrder(order.id);
                      }}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-xs font-medium"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};