import React, { useState, useMemo } from 'react';
import { DollarSign, Users, Clock, AlertCircle, Search, Filter, ChevronDown, X, Download, Plus, Calendar, CreditCard, CheckCircle, Eye, Edit, Trash2, Upload, FileText, Image, File } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';

interface VendorPayment {
  id: string;
  vendorName: string;
  vendorEmail: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: 'bank_transfer' | 'check' | 'paypal' | 'wire_transfer';
  paymentDate: Date;
  dueDate: Date;
  description: string;
  invoiceNumber: string;
  businessGroup: string;
  category: 'contractor_fees' | 'materials' | 'services' | 'equipment' | 'other';
  approvedBy?: string;
  paidBy?: string;
  paidAt?: Date;
  attachments?: {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadedAt: Date;
  }[];
}

type SortField = 'vendorName' | 'amount' | 'paymentDate' | 'dueDate' | 'status';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  status: 'all' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: 'all' | 'bank_transfer' | 'check' | 'paypal' | 'wire_transfer';
  businessGroup: 'all' | 'Ridgetop' | 'Skyline';
  category: 'all' | 'contractor_fees' | 'materials' | 'services' | 'equipment' | 'other';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'overdue';
  amountRange: 'all' | '0-500' | '500-2000' | '2000-5000' | '5000+';
}

// Mock vendor payments data
const mockVendorPayments: VendorPayment[] = [
  {
    id: '1',
    vendorName: 'ABC Construction Co.',
    vendorEmail: 'billing@abcconstruction.com',
    amount: 2500.00,
    status: 'pending',
    paymentMethod: 'bank_transfer',
    paymentDate: new Date('2025-01-20T10:00:00'),
    dueDate: new Date('2025-01-18T23:59:59'),
    description: 'Residential property inspection services - January 2025',
    invoiceNumber: 'INV-2025-001',
    businessGroup: 'Ridgetop',
    category: 'contractor_fees',
    approvedBy: 'John Doe',
    notes: 'Monthly contractor payment for inspection services'
  },
  {
    id: '2',
    vendorName: 'Metro Building Solutions',
    vendorEmail: 'accounts@metrobuilding.com',
    amount: 4200.00,
    status: 'completed',
    paymentMethod: 'wire_transfer',
    paymentDate: new Date('2025-01-15T14:30:00'),
    dueDate: new Date('2025-01-15T23:59:59'),
    description: 'Commercial building assessment and reporting',
    invoiceNumber: 'INV-2025-002',
    businessGroup: 'Skyline',
    category: 'services',
    approvedBy: 'Jane Smith',
    paidBy: 'David Brown',
    notes: 'Payment for high-rise building assessment project'
  },
  {
    id: '3',
    vendorName: 'Quality Materials Inc.',
    vendorEmail: 'finance@qualitymaterials.com',
    amount: 850.75,
    status: 'processing',
    paymentMethod: 'check',
    paymentDate: new Date('2025-01-16T09:00:00'),
    dueDate: new Date('2025-01-14T23:59:59'),
    description: 'Construction materials and supplies',
    invoiceNumber: 'INV-2025-003',
    businessGroup: 'Ridgetop',
    category: 'materials',
    approvedBy: 'Mike Johnson',
    notes: 'Materials for residential project completion'
  },
  {
    id: '4',
    vendorName: 'Tech Equipment Rental',
    vendorEmail: 'billing@techequipment.com',
    amount: 1200.00,
    status: 'failed',
    paymentMethod: 'bank_transfer',
    paymentDate: new Date('2025-01-12T11:30:00'),
    dueDate: new Date('2025-01-10T23:59:59'),
    description: 'Equipment rental for inspection tools',
    invoiceNumber: 'INV-2025-004',
    businessGroup: 'Skyline',
    category: 'equipment',
    approvedBy: 'Sarah Wilson',
    notes: 'Payment failed - need to retry with updated bank details'
  },
  {
    id: '5',
    vendorName: 'Professional Services LLC',
    vendorEmail: 'payments@professionalservices.com',
    amount: 3500.00,
    status: 'pending',
    paymentMethod: 'paypal',
    paymentDate: new Date('2025-01-22T16:00:00'),
    dueDate: new Date('2025-01-25T23:59:59'),
    description: 'Consulting and advisory services',
    invoiceNumber: 'INV-2025-005',
    businessGroup: 'Ridgetop',
    category: 'services',
    approvedBy: 'John Doe',
    notes: 'Quarterly consulting payment'
  }
];

export const VendorPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<VendorPayment[]>(mockVendorPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<VendorPayment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'manual'>('stripe');
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<VendorPayment | null>(null);
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    paymentMethod: 'all',
    businessGroup: 'all',
    category: 'all',
    dateRange: 'all',
    amountRange: 'all'
  });

  const [newPayment, setNewPayment] = useState({
    vendorName: '',
    vendorEmail: '',
    amount: '',
    paymentMethod: 'bank_transfer' as VendorPayment['paymentMethod'],
    dueDate: '',
    description: '',
    invoiceNumber: '',
    businessGroup: 'Ridgetop' as string,
    description: '',
    attachments: [] as any[]
    notes: ''
  });

  // File upload hook for payment documents
  const {
    uploadedFiles,
    isUploading,
    uploadFiles,
    removeFile,
    clearAllFiles
  } = useFileUpload({
    maxFileSize: 10,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxFiles: 5,
    onUploadComplete: (files) => {
      console.log('Payment documents uploaded:', files);
    },
    onUploadError: (error) => {
      alert('Upload error: ' + error);
    }
  });</parameter>

  const getStatusColor = (status: VendorPayment['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: VendorPayment['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled': return <X className="w-4 h-4 text-gray-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: VendorPayment['category']) => {
    switch (category) {
      case 'contractor_fees': return 'bg-blue-100 text-blue-800';
      case 'materials': return 'bg-green-100 text-green-800';
      case 'services': return 'bg-purple-100 text-purple-800';
      case 'equipment': return 'bg-orange-100 text-orange-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodDisplay = (method: VendorPayment['paymentMethod']) => {
    switch (method) {
      case 'bank_transfer': return 'Bank Transfer';
      case 'check': return 'Check';
      case 'paypal': return 'PayPal';
      case 'wire_transfer': return 'Wire Transfer';
      default: return method;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'paymentDate' || field === 'amount' || field === 'dueDate' ? 'desc' : 'asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      paymentMethod: 'all',
      businessGroup: 'all',
      category: 'all',
      dateRange: 'all',
      amountRange: 'all'
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return searchTerm !== '' || 
           filters.status !== 'all' || 
           filters.paymentMethod !== 'all' || 
           filters.businessGroup !== 'all' || 
           filters.category !== 'all' ||
           filters.dateRange !== 'all' ||
           filters.amountRange !== 'all';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate: Date, status: VendorPayment['status']) => {
    return (status === 'pending' || status === 'processing') && dueDate < new Date();
  };

  const filteredAndSortedPayments = useMemo(() => {
    let filtered = payments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.vendorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(payment => payment.status === filters.status);
    }

    // Payment Method filter
    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(payment => payment.paymentMethod === filters.paymentMethod);
    }

    // Business Group filter
    if (filters.businessGroup !== 'all') {
      filtered = filtered.filter(payment => payment.businessGroup === filters.businessGroup);
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(payment => payment.category === filters.category);
    }

    // Amount Range filter
    if (filters.amountRange !== 'all') {
      filtered = filtered.filter(payment => {
        switch (filters.amountRange) {
          case '0-500': return payment.amount >= 0 && payment.amount <= 500;
          case '500-2000': return payment.amount > 500 && payment.amount <= 2000;
          case '2000-5000': return payment.amount > 2000 && payment.amount <= 5000;
          case '5000+': return payment.amount > 5000;
          default: return true;
        }
      });
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(payment => {
        if (filters.dateRange === 'overdue') {
          return isOverdue(payment.dueDate, payment.status);
        }
        
        const daysDiff = Math.floor((now.getTime() - payment.paymentDate.getTime()) / (1000 * 60 * 60 * 24));
        switch (filters.dateRange) {
          case 'today': return daysDiff === 0;
          case 'week': return daysDiff <= 7;
          case 'month': return daysDiff <= 30;
          default: return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'vendorName':
          aValue = a.vendorName.toLowerCase();
          bValue = b.vendorName.toLowerCase();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'paymentDate':
          aValue = a.paymentDate.getTime();
          bValue = b.paymentDate.getTime();
          break;
        case 'dueDate':
          aValue = a.dueDate.getTime();
          bValue = b.dueDate.getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [payments, searchTerm, filters, sortField, sortDirection]);

  const handleAddPayment = () => {
    if (newPayment.vendorName.trim() && newPayment.amount && newPayment.dueDate) {
      const payment: VendorPayment = {
        id: Date.now().toString(),
        vendorName: newPayment.vendorName.trim(),
        vendorEmail: newPayment.vendorEmail.trim(),
        amount: parseFloat(newPayment.amount),
        status: 'pending',
        paymentMethod: newPayment.paymentMethod,
        paymentDate: new Date(),
        dueDate: new Date(newPayment.dueDate),
        description: newPayment.description.trim(),
        invoiceNumber: newPayment.invoiceNumber.trim(),
        businessGroup: newPayment.businessGroup,
        createdAt: new Date(),
        attachments: uploadedFiles.map(f => ({
          id: f.id,
          name: f.file.name,
          size: f.file.size,
          type: f.file.type,
          uploadedAt: f.uploadedAt
        }))
        approvedBy: 'Yashwnath K',
        notes: newPayment.notes.trim()
      };
      
      setPayments(prev => [...prev, payment]);
      setNewPayment({
        vendorName: '',
        vendorEmail: '',
        amount: '',
        paymentMethod: 'bank_transfer',
        dueDate: '',
        description: '',
        invoiceNumber: '',
        businessGroup: 'Ridgetop',
        description: '',
        attachments: []
        notes: ''
      });
      clearAllFiles();
      setShowAddModal(false);
      alert(`Vendor payment for ${payment.vendorName} added successfully!`);
    }
  };

  const handleUpdateStatus = (paymentId: string, newStatus: VendorPayment['status']) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId 
        ? { 
            ...payment, 
            status: newStatus,
            paidBy: newStatus === 'completed' ? 'Yashwnath K' : payment.paidBy
          }
        : payment
    ));
  };

  const handleDeletePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (payment && confirm(`Are you sure you want to delete payment to ${payment.vendorName}?`)) {
      setPayments(prev => prev.filter(p => p.id !== paymentId));
    }
  };

  const handlePayClick = (payment: VendorPayment) => {
    setSelectedPayment(payment);
    setPaymentMethod('stripe');
    setShowPayModal(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedPayment) return;
    
    setProcessingPayment(selectedPayment.id);
    
    try {
      if (paymentMethod === 'stripe') {
        // Simulate Stripe payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update payment status to completed
        setPayments(prev => prev.map(p => 
          p.id === selectedPayment.id 
            ? { ...p, status: 'completed', paidAt: new Date() }
            : p
        ));
        
        alert(`Payment of ${formatCurrency(selectedPayment.amount)} to ${selectedPayment.vendorName} processed successfully via Stripe!`);
      } else {
        // Manual payment - just update status
        setPayments(prev => prev.map(p => 
          p.id === selectedPayment.id 
            ? { ...p, status: 'processing' }
            : p
        ));
        
        alert(`Payment marked as processing. Upload supporting documents to complete the record.`);
      }
      
      setShowPayModal(false);
      setSelectedPayment(null);
    } catch (error) {
      alert('Payment processing failed. Please try again.');
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleFileUpload = (paymentId: string, files: FileList) => {
    // In a real app, you would upload files to server and associate with payment
    const fileArray = Array.from(files);
    console.log(`Uploading ${fileArray.length} files for payment ${paymentId}:`, fileArray);
    
    // Update payment with file attachments
    setPayments(prev => prev.map(p => 
      p.id === paymentId 
        ? { 
            ...p, 
            attachments: [
              ...(p.attachments || []),
              ...fileArray.map(file => ({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: file.size,
                type: file.type,
                uploadedAt: new Date()
              }))
            ]
          }
        : p
    ));
    
    alert(`${fileArray.length} document(s) uploaded successfully!`);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="w-4 h-4 text-green-600" />;
      case 'doc':
      case 'docx':
        return <File className="w-4 h-4 text-blue-600" />;
      default:
        return <File className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };</parameter>

  const handleExportPayments = () => {
    const headers = ['Vendor Name', 'Vendor Email', 'Amount', 'Status', 'Payment Method', 'Due Date', 'Payment Date', 'Invoice Number', 'Business Group', 'Category', 'Description'];

    const csvContent = [
      headers.join(','),
      ...filteredAndSortedPayments.map(payment => [
        `"${payment.vendorName}"`,
        payment.vendorEmail,
        payment.amount,
        payment.status,
        getPaymentMethodDisplay(payment.paymentMethod),
        payment.dueDate.toISOString(),
        payment.paymentDate.toISOString(),
        payment.invoiceNumber,
        payment.businessGroup,
        payment.category,
        `"${payment.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vendor_payments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate summary statistics
  const totalAmount = filteredAndSortedPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = filteredAndSortedPayments.filter(p => p.status === 'pending').length;
  const overduePayments = filteredAndSortedPayments.filter(p => isOverdue(p.dueDate, p.status)).length;
  const completedPayments = filteredAndSortedPayments.filter(p => p.status === 'completed').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Vendor Payments</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add Payment</span>
            <span className="sm:hidden">Add</span>
          </button>
          <button 
            onClick={handleExportPayments}
            className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export Payments</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{formatCurrency(totalAmount)}</p>
              <p className="text-gray-600 text-sm sm:text-base">Total Amount</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{pendingPayments}</p>
              <p className="text-gray-600 text-sm sm:text-base">Pending</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{overduePayments}</p>
              <p className="text-gray-600 text-sm sm:text-base">Overdue</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{completedPayments}</p>
              <p className="text-gray-600 text-sm sm:text-base">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by vendor name, email, invoice number, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-lg border transition-colors duration-200 text-sm ${
                showFilters || hasActiveFilters()
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as FilterState['status'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value as FilterState['paymentMethod'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Methods</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="paypal">PayPal</option>
                  <option value="wire_transfer">Wire Transfer</option>
                </select>
              </div>

              {/* Business Group Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Group</label>
                <select
                  value={filters.businessGroup}
                  onChange={(e) => setFilters(prev => ({ ...prev, businessGroup: e.target.value as FilterState['businessGroup'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Groups</option>
                  <option value="Ridgetop">Ridgetop</option>
                  <option value="Skyline">Skyline</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as FilterState['category'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="contractor_fees">Contractor Fees</option>
                  <option value="materials">Materials</option>
                  <option value="services">Services</option>
                  <option value="equipment">Equipment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Amount Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
                <select
                  value={filters.amountRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, amountRange: e.target.value as FilterState['amountRange'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Amounts</option>
                  <option value="0-500">$0 - $500</option>
                  <option value="500-2000">$500 - $2,000</option>
                  <option value="2000-5000">$2,000 - $5,000</option>
                  <option value="5000+">$5,000+</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as FilterState['dateRange'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredAndSortedPayments.length} of {payments.length} vendor payments
            {hasActiveFilters() && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Filtered
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Vendor Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {filteredAndSortedPayments.length === 0 ? (
            <div className="p-6 text-center">
              <Users className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
              <p className="text-gray-500 text-lg font-medium">No vendor payments found</p>
              <p className="text-gray-400 text-sm mt-1">
                {hasActiveFilters() 
                  ? 'Try adjusting your search or filters'
                  : 'Add your first vendor payment to get started'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAndSortedPayments.map((payment) => (
                <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-gray-900">{payment.vendorName}</p>
                        {isOverdue(payment.dueDate, payment.status) && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{payment.vendorEmail}</p>
                      <p className="text-sm text-gray-500">{payment.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-xs">Due: {formatDate(payment.dueDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(payment.category)}`}>
                        {payment.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <select
                      value={payment.status}
                      onChange={(e) => handleUpdateStatus(payment.id, e.target.value as VendorPayment['status'])}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('vendorName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Vendor</span>
                    <span className="text-blue-600">{getSortIcon('vendorName')}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Number
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Amount</span>
                    <span className="text-blue-600">{getSortIcon('amount')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <span className="text-blue-600">{getSortIcon('status')}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('dueDate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Due Date</span>
                    <span className="text-blue-600">{getSortIcon('dueDate')}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No vendor payments found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {hasActiveFilters() 
                          ? 'Try adjusting your search or filters'
                          : 'Add your first vendor payment to get started'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedPayments.map((payment) => (
                  <tr key={payment.id} className={`hover:bg-gray-50 transition-colors duration-200 ${
                    isOverdue(payment.dueDate, payment.status) ? 'bg-red-50' : ''
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-blue-600 mr-2" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{payment.vendorName}</span>
                            {isOverdue(payment.dueDate, payment.status) && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Overdue
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{payment.vendorEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{payment.invoiceNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(payment.amount)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(payment.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{getPaymentMethodDisplay(payment.paymentMethod)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{formatDate(payment.dueDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(payment.category)}`}>
                        {payment.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => handlePayClick(payment)}
                          disabled={payment.status === 'completed' || processingPayment === payment.id}
                          className={`inline-flex items-center px-3 py-1 rounded-md transition-colors duration-200 text-xs font-medium ${
                            payment.status === 'completed' 
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : processingPayment === payment.id
                                ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {processingPayment === payment.id ? (
                            <>
                              <div className="w-3 h-3 mr-1 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              Processing
                            </>
                          ) : payment.status === 'completed' ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Paid
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-3 h-3 mr-1" />
                              Pay
                            </>
                          )}
                        </button>
                        
                        {/* File Upload Button */}
                        <label className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-xs font-medium cursor-pointer">
                          <Upload className="w-3 h-3 mr-1" />
                          Upload
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => e.target.files && handleFileUpload(payment.id, e.target.files)}
                            className="hidden"
                          />
                        </label>
                        
                        <select
                          value={payment.status}
                          onChange={(e) => handleUpdateStatus(payment.id, e.target.value as VendorPayment['status'])}
                          className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                          onClick={() => handlePayClick(payment)}
                          disabled={payment.status === 'completed' || processingPayment === payment.id}
                          className={`inline-flex items-center px-3 py-1 rounded-md transition-colors duration-200 text-xs font-medium ${
                            payment.status === 'completed' 
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : processingPayment === payment.id
                                ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                          {processingPayment === payment.id ? (
                            <>
                              <div className="w-3 h-3 mr-1 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              Processing
                            </>
                          ) : payment.status === 'completed' ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Paid
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-3 h-3 mr-1" />
                              Pay
                            </>
                          )}
                        </button>
                        
                        {/* File Upload Button */}
                        <label className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-xs font-medium cursor-pointer">
                          <Upload className="w-3 h-3 mr-1" />
                          Upload
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => e.target.files && handleFileUpload(payment.id, e.target.files)}
                            className="hidden"
                          />
                        </label></parameter>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full mx-4">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Add Vendor Payment</h3>
                  </div>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Name *
                    </label>
                    <input
                      type="text"
                      value={newPayment.vendorName}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, vendorName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="Enter vendor name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Email
                    </label>
                    <input
                      type="email"
                      value={newPayment.vendorEmail}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, vendorEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="vendor@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={newPayment.dueDate}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <select
                      value={newPayment.paymentMethod}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, paymentMethod: e.target.value as VendorPayment['paymentMethod'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="check">Check</option>
                      <option value="paypal">PayPal</option>
                      <option value="wire_transfer">Wire Transfer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Number *
                    </label>
                    <input
                      type="text"
                      value={newPayment.invoiceNumber}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="INV-2025-001"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Group *
                    </label>
                    <select
                      value={newPayment.businessGroup}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, businessGroup: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    >
                      <option value="Ridgetop">Ridgetop</option>
                      <option value="Skyline">Skyline</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={newPayment.category}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, category: e.target.value as VendorPayment['category'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    >
                      <option value="contractor_fees">Contractor Fees</option>
                      <option value="materials">Materials</option>
                      <option value="services">Services</option>
                      <option value="equipment">Equipment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={newPayment.description}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="Describe the payment purpose..."
                      rows={2}
                      required
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={newPayment.notes}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="Additional notes (optional)..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  onClick={handleAddPayment}
                  disabled={!newPayment.vendorName.trim() || !newPayment.amount || !newPayment.dueDate || !newPayment.description.trim()}
                  className={`w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:w-auto sm:text-sm transition-colors duration-200 ${
                    newPayment.vendorName.trim() && newPayment.amount && newPayment.dueDate && newPayment.description.trim()
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
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