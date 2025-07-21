import React, { useState, useMemo } from 'react';
import { Download, FileText, User, Star, Clock } from 'lucide-react';
import { ReportData } from '../types';
import { mockReportsData } from '../data/mockData';

type ViewType = 'vendor' | 'internal';

export const ReportsManagementPage: React.FC = () => {
  const [reports, setReports] = useState<ReportData[]>(mockReportsData);
  const [activeView, setActiveView] = useState<ViewType>('vendor');

  const formatTimestamp = (date: Date | null) => {
    if (!date) return 'Not delivered';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQualityStars = (quality: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < quality ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 4) return 'text-green-600';
    if (quality >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleExportReports = () => {
    const headers = activeView === 'vendor' 
      ? ['Order Number', 'Item Number', 'Deliver Timestamp', 'Business Group', 'Customer Name']
      : ['Order Number', 'Item Number', 'Deliver Timestamp', 'Sketch Person', 'QA Person', 'Sketch Quality', 'QA Quality', 'Business Group', 'Customer Name'];

    const csvContent = [
      headers.join(','),
      ...reports.map(report => {
        if (activeView === 'vendor') {
          return [
            report.orderNumber,
            report.itemNumber,
            report.deliverTimestamp ? report.deliverTimestamp.toISOString() : 'Not delivered',
            report.businessGroup,
            `"${report.customerName}"`
          ].join(',');
        } else {
          return [
            report.orderNumber,
            report.itemNumber,
            report.deliverTimestamp ? report.deliverTimestamp.toISOString() : 'Not delivered',
            report.sketchPersonName,
            report.qaPersonName,
            report.sketchPersonQuality,
            report.qaPersonQuality,
            report.businessGroup,
            `"${report.customerName}"`
          ].join(',');
        }
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeView}_reports_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Reports Dashboard</h1>
        <button 
          onClick={handleExportReports}
          className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Export {activeView === 'vendor' ? 'Vendor' : 'Internal'} Report</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveView('vendor')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeView === 'vendor'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Vendor Report</span>
              </div>
            </button>
            <button
              onClick={() => setActiveView('internal')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeView === 'internal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Internal Report</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Vendor Report View */}
          {activeView === 'vendor' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deliver Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{report.orderNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">#{report.itemNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {formatTimestamp(report.deliverTimestamp)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{report.businessGroup}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{report.customerName}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Internal Report View */}
          {activeView === 'internal' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deliver Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sketch Person
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QA Person
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sketch Quality
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QA Quality
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{report.orderNumber}</div>
                        <div className="text-xs text-gray-500">{report.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">#{report.itemNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {formatTimestamp(report.deliverTimestamp)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{report.sketchPersonName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{report.qaPersonName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          {getQualityStars(report.sketchPersonQuality)}
                          <span className={`ml-2 text-sm font-medium ${getQualityColor(report.sketchPersonQuality)}`}>
                            {report.sketchPersonQuality}/5
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          {getQualityStars(report.qaPersonQuality)}
                          <span className={`ml-2 text-sm font-medium ${getQualityColor(report.qaPersonQuality)}`}>
                            {report.qaPersonQuality}/5
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};