import React, { useState } from 'react';
import { Menu, ChevronDown, X } from 'lucide-react';

interface HeaderProps {
  onToggleMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMenu }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <div className="bg-slate-900 h-6 flex items-center px-2 sm:px-4 text-xs text-white fixed top-0 left-0 right-0 z-50">
        <span className="truncate">RoofAngle LLC</span>
      </div>
      
      <header className="flex items-center justify-between px-2 sm:px-4 py-3 bg-white shadow-sm border-b border-gray-200 fixed top-6 left-0 right-0 z-50">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <button 
            onClick={onToggleMenu}
            className="text-gray-600 hover:text-gray-900 focus:outline-none transition-colors duration-200 p-1"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <span className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
            <span className="hidden sm:inline">Vendor Platform</span>
            <span className="sm:hidden">Platform</span>
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          <button className="hidden sm:flex px-3 py-1.5 lg:px-4 lg:py-2 border border-blue-500 text-blue-600 rounded-full hover:bg-blue-50 transition-colors duration-200 text-xs sm:text-sm font-medium items-center">
            <span className="hidden lg:inline">🏢 RoofAngle</span>
            <span className="lg:hidden">🏢</span>
            <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 ml-1" />
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold hover:bg-blue-700 hover:ring-2 sm:hover:ring-4 hover:ring-blue-100 focus:outline-none transition-all duration-200 text-xs sm:text-sm"
            >
              YK
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800 truncate">Yashwnath K</p>
                  <p className="text-xs text-gray-500 truncate">yk@roofangle.com</p>
                </div>
                <button className="w-full text-left px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                  ⚙️ Settings
                </button>
                <button className="w-full text-left px-3 sm:px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200">
                  🚪 Sign Out
                </button>
                <div className="text-center text-xs text-gray-500 border-t border-gray-100 py-2 italic px-2">
                  Logged in as <span className="font-medium text-gray-700">Yashwnath</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};