import React from 'react';
import { FileText, BarChart3, TrendingUp, Download } from 'lucide-react';

interface ReportsSidebarProps {
  isVisible: boolean;
  currentPage: string;
  onNavigate: (page: 'reports-management' | 'quality-analytics') => void;
  sidebarOffset: boolean;
}

export const ReportsSidebar: React.FC<ReportsSidebarProps> = ({ 
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
      <div className="text-lg font-semibold mb-6 text-gray-800">Reports Management</div>
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <button 
              onClick={() => onNavigate('reports-management')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                currentPage === 'reports-management'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium">Reports Dashboard</span>
                <p className="text-xs text-gray-500 mt-0.5">View and manage all reports</p>
              </div>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onNavigate('quality-analytics')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                currentPage === 'quality-analytics'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium">Quality Analytics</span>
                <p className="text-xs text-gray-500 mt-0.5">Performance metrics and trends</p>
              </div>
            </button>
          </li>
          <li>
            <button 
              className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors duration-200 text-gray-700 hover:bg-gray-50"
              onClick={() => alert('Performance Reports coming soon!')}
            >
              <TrendingUp className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium">Performance Reports</span>
                <p className="text-xs text-gray-500 mt-0.5">Team and individual performance</p>
              </div>
            </button>
          </li>
          <li>
            <button 
              className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors duration-200 text-gray-700 hover:bg-gray-50"
              onClick={() => alert('Export Center coming soon!')}
            >
              <Download className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium">Export Center</span>
                <p className="text-xs text-gray-500 mt-0.5">Bulk export and scheduling</p>
              </div>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};