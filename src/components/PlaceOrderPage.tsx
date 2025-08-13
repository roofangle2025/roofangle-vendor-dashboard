import React, { useState, useRef } from 'react';
import { Save, Upload, Download, X } from 'lucide-react';
import { Service } from '../types';

// Get services from a centralized location (in a real app, this would come from a service/API)
const getAvailableServices = (): Service[] => {
  // This would typically come from a context or API call
  // For now, we'll use the default services
  return [
    {
      id: '1',
      name: 'ESX Report',
      description: 'Comprehensive property inspection and reporting service',
      basePrice: 1200.00,
      isActive: true,
      createdAt: new Date('2024-12-01'),
      modifiedAt: new Date('2024-12-01')
    },
    {
      id: '2',
      name: 'Wall Report',
      description: 'Detailed wall inspection and structural analysis',
      basePrice: 900.00,
      isActive: true,
      createdAt: new Date('2024-12-01'),
      modifiedAt: new Date('2024-12-01')
    },
    {
      id: '3',
      name: 'DAD Report',
      description: 'Damage assessment documentation and analysis',
      basePrice: 1050.00,
      isActive: true,
      createdAt: new Date('2024-12-01'),
      modifiedAt: new Date('2024-12-01')
    }
  ];
};

export const PlaceOrderPage: React.FC = () => {
  const availableServices = getAvailableServices().filter(service => service.isActive);
  
  const [orderData, setOrderData] = useState({
    propertyType: 'Residential',
    address: '',
    service: availableServices.length > 0 ? availableServices[0].name : '',
    rushOrder: 'No',
    pdfRequired: 'Yes',
    additionalInstructions: '',
    insuredName: '',
    claimNumber: '',
    businessGroup: 'Ridgetop',
    notes: ''
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get delivery time based on rush order, property type, and business group
  const getDeliveryTime = () => {
    const selectedService = availableServices.find(s => s.name === orderData.service);
    if (!selectedService) return '48 hrs';
    
    // Mock business group pricing (in real app, this would come from context/API)
    const businessGroupPricing = {
      'Ridgetop': {
        'ESX Report': { commercialDeliveryTimeHours: 48, residentialDeliveryTimeHours: 36 },
        'Wall Report': { commercialDeliveryTimeHours: 72, residentialDeliveryTimeHours: 60 },
        'DAD Report': { commercialDeliveryTimeHours: 60, residentialDeliveryTimeHours: 48 },
        rushOrderDeliveryTimeHours: 24
      },
      'Skyline': {
        'ESX Report': { commercialDeliveryTimeHours: 36, residentialDeliveryTimeHours: 24 },
        'Wall Report': { commercialDeliveryTimeHours: 60, residentialDeliveryTimeHours: 48 },
        'DAD Report': { commercialDeliveryTimeHours: 48, residentialDeliveryTimeHours: 36 },
        rushOrderDeliveryTimeHours: 12
      }
    };
    
    const groupPricing = businessGroupPricing[orderData.businessGroup as keyof typeof businessGroupPricing];
    if (!groupPricing) return '48 hrs';
    
    // If rush order, use rush delivery time
    if (orderData.rushOrder === 'Yes') {
      const rushHours = groupPricing.rushOrderDeliveryTimeHours;
      return formatDeliveryTime(rushHours);
    }
    
    // Otherwise, use service-specific delivery time based on property type
    const servicePricing = groupPricing[orderData.service as keyof Omit<typeof groupPricing, 'rushOrderDeliveryTimeHours'>];
    if (!servicePricing) return '48 hrs';
    
    const deliveryHours = orderData.propertyType === 'Commercial' 
      ? servicePricing.commercialDeliveryTimeHours 
      : servicePricing.residentialDeliveryTimeHours;
    
    return formatDeliveryTime(deliveryHours);
  };
  
  const formatDeliveryTime = (hours: number): string => {
    if (hours < 24) {
      return `${hours} hrs`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      if (remainingHours === 0) {
        return `${days} ${days === 1 ? 'day' : 'days'}`;
      } else {
        return `${days}d ${remainingHours}h`;
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
    const newOrder = {
      ...orderData,
      orderNumber,
      orderDate: new Date(),
      status: 'new' as const
    };

    console.log('New Order:', newOrder);
    alert(`Order ${orderNumber} has been placed successfully!`);
    
    // Reset form
    setOrderData({
      propertyType: 'Residential',
      address: '',
      service: 'ESX Report',
      rushOrder: 'No',
      pdfRequired: 'Yes',
      additionalInstructions: '',
      insuredName: '',
      claimNumber: '',
      businessGroup: 'Ridgetop',
      notes: ''
    });
  };

  const handleDownloadTemplate = () => {
    // Create CSV template content
    const csvContent = [
      'Property Type,Address,Service,Rush Order,PDF Required,Additional Instructions,Insured Name,Claim Number,Business Group,Notes',
      'Residential,123 Main St,ESX Report,No,Yes,Handle with care,John Smith Insurance,CLM-2025-001,Ridgetop,Sample order',
      'Commercial,456 Oak Ave,DAD Report,Yes,No,Rush delivery required,Metro Insurance Corp,CLM-2025-002,Skyline,Handle with care'
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'bulk_order_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setUploadFile(file);
    } else {
      alert('Please select a valid CSV file.');
    }
  };

  const handleUploadSubmit = () => {
    if (uploadFile) {
      // Here you would typically process the CSV file
      console.log('Processing CSV file:', uploadFile.name);
      alert(`Successfully uploaded ${uploadFile.name}. Orders will be processed.`);
      setShowUploadModal(false);
      setUploadFile(null);
    }
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Place New Order</h1>
        
        {/* Bulk Upload Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={handleDownloadTemplate}
            className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Download Template</span>
            <span className="sm:hidden">Template</span>
          </button>
          <button 
            onClick={handleUploadClick}
            className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium text-sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Upload Bulk Orders</span>
            <span className="sm:hidden">Bulk Upload</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Information</h2>
          
          {/* Delivery Time Display */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-800">Estimated Delivery Time</h3>
                <p className="text-xs text-blue-600 mt-1">
                  Based on {orderData.rushOrder === 'Yes' ? 'rush order' : 'standard service'} delivery time
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">{getDeliveryTime()}</div>
                <div className="text-xs text-blue-700">
                  {orderData.rushOrder === 'Yes' ? '🚀 Rush Delivery' : '📦 Standard Delivery'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                value={orderData.propertyType}
                onChange={(e) => setOrderData(prev => ({ ...prev, propertyType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Address *
              </label>
              <input
                type="text"
                value={orderData.address}
                onChange={(e) => setOrderData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter property address"
                required
              />
            </div>

            {/* Service */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Service *
              </label>
              <select
                value={orderData.service}
                onChange={(e) => setOrderData(prev => ({ ...prev, service: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              >
                {availableServices.map(service => (
                  <option key={service.id} value={service.name}>
                    {service.name}
                  </option>
                ))}
              </select>
              {availableServices.length === 0 && (
                <p className="text-xs text-red-600 mt-1">
                  No active services available. Please add services in Runtime Management → Services Management.
                </p>
              )}
            </div>

            {/* Rush Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rush Order *
              </label>
              <select
                value={orderData.rushOrder}
                onChange={(e) => setOrderData(prev => ({ ...prev, rushOrder: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {/* PDF Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF Required *
              </label>
              <select
                value={orderData.pdfRequired}
                onChange={(e) => setOrderData(prev => ({ ...prev, pdfRequired: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Insured Name - Now Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insured Name
              </label>
              <input
                type="text"
                value={orderData.insuredName}
                onChange={(e) => setOrderData(prev => ({ ...prev, insuredName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter insured name (optional)"
              />
            </div>

            {/* Claim Number - Now Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Number
              </label>
              <input
                type="text"
                value={orderData.claimNumber}
                onChange={(e) => setOrderData(prev => ({ ...prev, claimNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter claim number (optional)"
              />
            </div>
            
            {/* Business Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Group *
              </label>
              <select
                value={orderData.businessGroup}
                onChange={(e) => setOrderData(prev => ({ ...prev, businessGroup: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="Ridgetop">Ridgetop</option>
                <option value="Skyline">Skyline</option>
              </select>
            </div>

            {/* Additional Instructions */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Instructions
              </label>
              <textarea
                value={orderData.additionalInstructions}
                onChange={(e) => setOrderData(prev => ({ ...prev, additionalInstructions: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter any additional instructions or special requirements"
                rows={3}
              />
            </div>
            
            {/* Order Notes */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Notes
              </label>
              <textarea
                value={orderData.notes}
                onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Brief description of the group's purpose"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Save className="w-4 h-4 mr-2" />
            Place Order
          </button>
        </div>
      </form>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseUploadModal} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full mx-4">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Upload Bulk Orders</h3>
                  </div>
                  <button 
                    onClick={handleCloseUploadModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors duration-200">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to select a CSV file or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Only CSV files are accepted
                    </p>
                    <button
                      type="button"
                      onClick={handleFileSelect}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Select File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  
                  {uploadFile && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">
                            File selected: {uploadFile.name}
                          </p>
                          <p className="text-sm text-green-600">
                            Size: {(uploadFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">CSV Format Requirements:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Property Type, Address, Service, Rush Order, PDF Required, Additional Instructions</li>
                      <li>• Insured Name (optional), Claim Number (optional), Business Group, Notes</li>
                      <li>• Use the template for proper formatting</li>
                      <li>• Property Type: Residential or Commercial</li>
                      <li>• Service: ESX Report, DAD Report, or Wall Report</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  onClick={handleUploadSubmit}
                  disabled={!uploadFile}
                  className={`w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:w-auto sm:text-sm transition-colors duration-200 ${
                    uploadFile 
                      ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Orders
                </button>
                <button
                  onClick={handleCloseUploadModal}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};