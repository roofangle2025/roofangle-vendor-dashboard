import React, { useState } from 'react';
import { ArrowLeft, Package, Calendar, MapPin, User, Building2, Clock, FileText, Shield, AlertCircle, Edit, Save, X, Upload, Download, Trash2, Check, Image, ZoomIn, MessageSquare, Send, Plus, CheckCircle, ArrowRight, PlayCircle, Truck, UserPlus, Star } from 'lucide-react';
import { Order } from '../types';
import { mockOrders, getSketchUsers, getQAUsers } from '../data/mockData';
import { FileUploadCenter } from './FileUploadCenter';

interface OrderDetailsPageProps {
  orderId: string;
  onBack: () => void;
}

interface UploadedFile {
  id: string;
  name: string;
  file: File;
  uploadedAt: Date;
  uploadedBy: string;
  size: number;
  type: string;
}

interface Comment {
  id: string;
  message: string;
  timestamp: Date;
  author: string;
  authorInitials: string;
  type: 'comment' | 'issue' | 'update' | 'resolved';
}

interface ReadyModalData {
  percentage: number;
  comment: string;
  quality?: number;
}

interface AssignModalData {
  sketchPersonId: string;
  qaPersonId: string;
  comment: string;
}

export const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ orderId, onBack }) => {
  const [orderData, setOrderData] = useState(() => {
    const order = mockOrders.find(o => o.id === orderId);
    return order || null;
  });
  
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<Comment['type']>('comment');
  const [showReadyModal, setShowReadyModal] = useState(false);
  const [readyModalType, setReadyModalType] = useState<'ready' | 'complete' | 'deliver'>('ready');
  const [readyModalData, setReadyModalData] = useState<ReadyModalData>({
    percentage: 100,
    comment: '',
    quality: 5
  });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignModalData, setAssignModalData] = useState<AssignModalData>({
    sketchPersonId: '',
    qaPersonId: '',
    comment: ''
  });
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      message: 'Order received and assigned to sketch team. Expected completion within 4 hours.',
      timestamp: new Date('2025-01-15T09:30:00'),
      author: 'John Doe',
      authorInitials: 'JD',
      type: 'update'
    },
    {
      id: '2',
      message: 'Issue with property access - customer needs to provide gate code.',
      timestamp: new Date('2025-01-15T11:15:00'),
      author: 'Jane Smith',
      authorInitials: 'JS',
      type: 'issue'
    },
    {
      id: '3',
      message: 'Gate code received: 1234. Proceeding with inspection.',
      timestamp: new Date('2025-01-15T11:45:00'),
      author: 'Jane Smith',
      authorInitials: 'JS',
      type: 'resolved'
    },
    {
      id: '4',
      message: 'Sketch completed. Moving to QA review.',
      timestamp: new Date('2025-01-15T14:20:00'),
      author: 'Mike Johnson',
      authorInitials: 'MJ',
      type: 'update'
    }
  ]);

  const [editValues, setEditValues] = useState({
    sketchName: 'John Doe',
    qaPersonName: 'Jane Smith',
    rushOrder: orderData?.rushOrder || false,
    orderNumber: orderData?.orderNumber || '',
    itemNumber: '1',
    address: orderData?.address || '',
    propertyType: orderData?.propertyType || 'Residential',
    reportType: orderData?.service || 'ESX Report',
    latitude: '30.476659',
    longitude: '-97.548888',
    pdfRequired: orderData?.pdfRequired || false,
    insuredName: orderData?.insuredName || '',
    claimNumber: orderData?.claimNumber || '',
    additionalInstructions: orderData?.additionalInstructions || '',
    orderNotes: orderData?.notes || ''
  });

  // Sample reference image URL (in a real app, this would come from the order data)
  const referenceImageUrl = "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800";

  // Get available users for assignment
  const sketchUsers = getSketchUsers();
  const qaUsers = getQAUsers();

  if (!orderData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:text-blue-700">
          Go back
        </button>
      </div>
    );
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'unassigned': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'qa-review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready-for-delivery': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'rollback': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCommentTypeColor = (type: Comment['type']) => {
    switch (type) {
      case 'comment': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'issue': return 'bg-red-100 text-red-800 border-red-200';
      case 'update': return 'bg-green-100 text-green-800 border-green-200';
      case 'resolved': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCommentTypeIcon = (type: Comment['type']) => {
    switch (type) {
      case 'comment': return '💬';
      case 'issue': return '⚠️';
      case 'update': return '📝';
      case 'resolved': return '✅';
      default: return '💬';
    }
  };

  const handleSaveField = (field: string) => {
    // In a real app, this would make an API call to update the order
    console.log('Saving field:', field, 'with value:', editValues[field as keyof typeof editValues]);
    setEditingField(null);
    
    // Update the order data
    if (orderData) {
      setOrderData({
        ...orderData,
        [field]: editValues[field as keyof typeof editValues]
      });
    }
    
    // Show success message
    const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    alert(`${fieldName} updated successfully!`);
  };

  const handleCancelEdit = (field: string) => {
    // Reset the edit value to original
    if (orderData) {
      setEditValues(prev => ({
        ...prev,
        [field]: (orderData as any)[field] || ''
      }));
    }
    setEditingField(null);
  };

  const handleFilesUploaded = (files: UploadedFile[]) => {
    console.log('Files uploaded to order:', files);
    // In a real app, you would associate these files with the order
  };

  const handleMoveToQA = () => {
    // Direct action without popup - just move to QA
    const comment: Comment = {
      id: Date.now().toString(),
      message: 'Sketch work completed and moved to QA Review - Ready for quality assurance review.',
      timestamp: new Date(),
      author: 'Yashwnath K',
      authorInitials: 'YK',
      type: 'update'
    };
    
    setComments(prev => [...prev, comment]);
    
    // Update order status
    if (orderData) {
      setOrderData({
        ...orderData,
        status: 'qa-review',
        processStatus: 'qa' as any
      });
    }
    
    alert('Order moved to QA Review successfully!');
  };

  const handleReady = () => {
    setReadyModalType('ready');
    setReadyModalData({ percentage: 100, comment: '', quality: 5 });
    setShowReadyModal(true);
  };

  const handleComplete = () => {
    setReadyModalType('complete');
    setReadyModalData({ percentage: 100, comment: '', quality: 5 });
    setShowReadyModal(true);
  };

  const handleDeliver = () => {
    setReadyModalType('deliver');
    setReadyModalData({ percentage: 100, comment: '', quality: 5 });
    setShowReadyModal(true);
  };

  const handleAssignTo = () => {
    setAssignModalData({
      sketchPersonId: '',
      qaPersonId: '',
      comment: ''
    });
    setShowAssignModal(true);
  };

  const handleAssignSubmit = () => {
    if (assignModalData.sketchPersonId && assignModalData.qaPersonId && assignModalData.comment.trim()) {
      const sketchUser = sketchUsers.find(u => u.id === assignModalData.sketchPersonId);
      const qaUser = qaUsers.find(u => u.id === assignModalData.qaPersonId);
      
      if (sketchUser && qaUser) {
        // Add comment to the communication log
        const comment: Comment = {
          id: Date.now().toString(),
          message: `Order assigned - Sketch: ${sketchUser.firstName} ${sketchUser.lastName}, QA: ${qaUser.firstName} ${qaUser.lastName}. ${assignModalData.comment}`,
          timestamp: new Date(),
          author: 'Yashwnath K',
          authorInitials: 'YK',
          type: 'update'
        };
        
        setComments(prev => [...prev, comment]);
        
        // Update order status and assignments
        if (orderData) {
          setOrderData({
            ...orderData,
            status: 'in-progress',
            processStatus: 'sketch' as any,
            sketchPersonId: assignModalData.sketchPersonId,
            qaPersonId: assignModalData.qaPersonId,
            assignedTo: `${sketchUser.firstName} ${sketchUser.lastName}`
          });
          
          // Update edit values to reflect the assignment
          setEditValues(prev => ({
            ...prev,
            sketchName: `${sketchUser.firstName} ${sketchUser.lastName}`,
            qaPersonName: `${qaUser.firstName} ${qaUser.lastName}`
          }));
        }
        
        setShowAssignModal(false);
        setAssignModalData({ sketchPersonId: '', qaPersonId: '', comment: '' });
        
        alert('Order assigned successfully!');
      }
    }
  };

  const handleReadySubmit = () => {
    if (readyModalData.comment.trim() && readyModalData.quality) {
      let actionType = '';
      let newStatus: Order['status'] = orderData.status;
      let newProcessStatus = orderData.processStatus;
      
      switch (readyModalType) {
        case 'ready':
          actionType = 'Ready for Delivery';
          newStatus = 'ready-for-delivery';
          newProcessStatus = 'ready';
          break;
        case 'complete':
          actionType = 'Order Completed';
          newStatus = 'completed';
          newProcessStatus = 'completed';
          break;
        case 'deliver':
          actionType = 'Order Delivered to Customer';
          newStatus = 'completed';
          newProcessStatus = 'completed';
          break;
      }
      
      // Add comment to the communication log
      const comment: Comment = {
        id: Date.now().toString(),
        message: `${actionType} - ${readyModalData.percentage}% complete. Quality Rating: ${readyModalData.quality}/5 stars. ${readyModalData.comment}`,
        timestamp: new Date(),
        author: 'Yashwnath K',
        authorInitials: 'YK',
        type: 'update'
      };
      
      setComments(prev => [...prev, comment]);
      
      // Update order status
      if (orderData) {
        setOrderData({
          ...orderData,
          status: newStatus,
          processStatus: newProcessStatus as any
        });
      }
      
      setShowReadyModal(false);
      setReadyModalData({ percentage: 100, comment: '', quality: 5 });
      
      alert(`${actionType} successfully!`);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        message: newComment.trim(),
        timestamp: new Date(),
        author: 'Yashwnath K', // In a real app, this would come from user context
        authorInitials: 'YK',
        type: commentType
      };
      
      setComments(prev => [...prev, comment]);
      setNewComment('');
      setCommentType('comment');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determine which button to show based on order status
  const getActionButton = () => {
    switch (orderData.status) {
      case 'unassigned':
        return {
          show: true,
          text: 'Assign To',
          icon: UserPlus,
          color: 'bg-blue-600 hover:bg-blue-700',
          action: handleAssignTo
        };
      case 'in-progress':
        return {
          show: true,
          text: 'Move to QA',
          icon: CheckCircle,
          color: 'bg-blue-600 hover:bg-blue-700',
          action: handleMoveToQA
        };
      case 'qa-review':
        return {
          show: true,
          text: 'Ready',
          icon: ArrowRight,
          color: 'bg-green-600 hover:bg-green-700',
          action: handleReady
        };
      case 'ready-for-delivery':
        return {
          show: true,
          text: 'Deliver',
          icon: Truck,
          color: 'bg-purple-600 hover:bg-purple-700',
          action: handleDeliver
        };
      default:
        return { show: false };
    }
  };

  const actionButton = getActionButton();

  // Fixed Key-Value Row Component with proper horizontal alignment
  const KeyValueRow: React.FC<{ 
    label: string; 
    value: string | React.ReactNode; 
    field?: string;
    editable?: boolean;
    type?: 'text' | 'select' | 'boolean' | 'textarea';
    options?: string[];
  }> = ({ 
    label, 
    value, 
    field,
    editable = false,
    type = 'text',
    options = []
  }) => {
    const isEditing = editingField === field;
    
    return (
      <div className="flex items-center py-2 hover:bg-gray-50 transition-colors duration-200 group rounded-lg px-3 min-h-[2.5rem]">
        <div className="w-44 flex-shrink-0">
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex-1 flex items-center justify-between">
          <div className="flex-1 mr-3">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                {type === 'text' && (
                  <input
                    type="text"
                    value={editValues[field as keyof typeof editValues] as string}
                    onChange={(e) => setEditValues(prev => ({ ...prev, [field!]: e.target.value }))}
                    className="flex-1 px-2 py-1 border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    autoFocus
                  />
                )}
                
                {type === 'textarea' && (
                  <textarea
                    value={editValues[field as keyof typeof editValues] as string}
                    onChange={(e) => setEditValues(prev => ({ ...prev, [field!]: e.target.value }))}
                    className="flex-1 px-2 py-1 border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm resize-none"
                    rows={2}
                    autoFocus
                  />
                )}
                
                {type === 'select' && (
                  <select
                    value={editValues[field as keyof typeof editValues] as string}
                    onChange={(e) => setEditValues(prev => ({ ...prev, [field!]: e.target.value }))}
                    className="flex-1 px-2 py-1 border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    autoFocus
                  >
                    {options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                )}
                
                {type === 'boolean' && (
                  <select
                    value={editValues[field as keyof typeof editValues] ? 'true' : 'false'}
                    onChange={(e) => setEditValues(prev => ({ ...prev, [field!]: e.target.value === 'true' }))}
                    className="flex-1 px-2 py-1 border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    autoFocus
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                )}
                
                <button
                  onClick={() => handleSaveField(field!)}
                  className="p-1 text-green-600 hover:text-green-700 transition-colors duration-200"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleCancelEdit(field!)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="text-gray-900 text-sm font-medium">{value}</div>
            )}
          </div>
          {editable && !isEditing && (
            <button
              onClick={() => setEditingField(field || '')}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all duration-200"
            >
              <Edit className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with Order Info and Action Buttons */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left side - Order info */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-gray-900">Order Details</h1>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(orderData.status)}`}>
                  {orderData.status.replace('-', ' ').toUpperCase()}
                </span>
                {orderData.rushOrder && (
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-purple-200 text-purple-900 border border-purple-400 animate-pulse">
                    🚀 RUSH
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Order: {orderData.orderNumber} | Process Status: <span className="font-medium capitalize">{orderData.processStatus || 'new'}</span>
              </p>
            </div>
          </div>

          {/* Right side - Assignment and Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Assignment Details - Only show if order is assigned */}
            {orderData.status !== 'unassigned' && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-600">Sketch:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-700">
                        {editValues.sketchName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{editValues.sketchName}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-600">QA:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-green-700">
                        {editValues.qaPersonName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{editValues.qaPersonName}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            {actionButton.show && (
              <div className="flex items-center">
                <button
                  onClick={actionButton.action}
                  className={`inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors duration-200 font-medium text-sm ${actionButton.color}`}
                >
                  <actionButton.icon className="w-4 h-4 mr-2" />
                  {actionButton.text}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Order Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 text-blue-600 mr-2" />
                Order Information
              </h2>
            </div>
            
            <div className="p-4 space-y-1">
              <KeyValueRow 
                label="Rush" 
                value={editValues.rushOrder ? 'Yes' : 'No'}
                field="rushOrder"
                editable={true}
                type="boolean"
              />
              
              <KeyValueRow 
                label="Order Number" 
                value={editValues.orderNumber}
                field="orderNumber"
                editable={true}
              />
              
              <KeyValueRow 
                label="Item Number" 
                value={editValues.itemNumber}
                field="itemNumber"
                editable={true}
              />
              
              <KeyValueRow 
                label="Address" 
                value={editValues.address || 'Address not specified'}
                field="address"
                editable={true}
              />
              
              <KeyValueRow 
                label="Property type" 
                value={editValues.propertyType}
                field="propertyType"
                editable={true}
                type="select"
                options={['Residential', 'Commercial']}
              />
              
              <KeyValueRow 
                label="Report type" 
                value={editValues.reportType}
                field="reportType"
                editable={true}
                type="select"
                options={['ESX Report', 'DAD Report', 'Wall Report']}
              />
              
              <KeyValueRow 
                label="Lat / Lng" 
                value={`${editValues.latitude}, ${editValues.longitude}`}
              />
              
              <KeyValueRow 
                label="PDF" 
                value={editValues.pdfRequired ? 'Yes' : 'No'}
                field="pdfRequired"
                editable={true}
                type="boolean"
              />
              
              <KeyValueRow 
                label="Insured Name" 
                value={editValues.insuredName || 'Not specified'}
                field="insuredName"
                editable={true}
              />
              
              <KeyValueRow 
                label="Claim Number" 
                value={editValues.claimNumber || 'Not specified'}
                field="claimNumber"
                editable={true}
              />
              
              <KeyValueRow 
                label="Additional Instructions" 
                value={editValues.additionalInstructions || 'None'}
                field="additionalInstructions"
                editable={true}
                type="textarea"
              />
              
              <KeyValueRow 
                label="Order Notes" 
                value={editValues.orderNotes || 'None'}
                field="orderNotes"
                editable={true}
                type="textarea"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Reference Image */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-fit">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Image className="w-5 h-5 text-green-600 mr-2" />
                Reference Image
              </h3>
            </div>
            
            <div className="p-4">
              {/* Reference Image */}
              <div className="aspect-square bg-gray-100 rounded-lg border border-gray-200 overflow-hidden relative group cursor-pointer hover:shadow-lg transition-all duration-300">
                <img 
                  src={referenceImageUrl}
                  alt="Reference property image"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onClick={() => setShowImagePopup(true)}
                />
                
                {/* Hover Overlay */}
                <div 
                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center"
                  onClick={() => setShowImagePopup(true)}
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-3 shadow-lg">
                    <ZoomIn className="w-6 h-6 text-gray-700" />
                  </div>
                </div>
              </div>
              
              {/* Image Info */}
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-600 font-medium">Property Reference</p>
                <p className="text-xs text-gray-500 mt-1">
                  Click image to view full size
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Communication Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
            Communication & Issues
            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {comments.length}
            </span>
          </h2>
        </div>
        
        <div className="p-4">
          {/* Add New Comment */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">YK</span>
              </div>
              
              <div className="flex-1 space-y-3">
                {/* Comment Type Selector */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Type:</label>
                  <select
                    value={commentType}
                    onChange={(e) => setCommentType(e.target.value as Comment['type'])}
                    className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="comment">💬 Comment</option>
                    <option value="issue">⚠️ Issue</option>
                    <option value="update">📝 Update</option>
                    <option value="resolved">✅ Resolved</option>
                  </select>
                </div>
                
                {/* Comment Input */}
                <div className="flex space-x-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment, report an issue, or provide an update..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                      newComment.trim()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Post</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-lg font-medium">No comments yet</p>
                <p className="text-sm">Start the conversation by adding a comment above.</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-gray-700">{comment.authorInitials}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">{comment.author}</span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getCommentTypeColor(comment.type)}`}>
                        <span className="mr-1">{getCommentTypeIcon(comment.type)}</span>
                        {comment.type.charAt(0).toUpperCase() + comment.type.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</span>
                    </div>
                    
                    <p className="text-gray-700 text-sm leading-relaxed">{comment.message}</p>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all duration-200 rounded hover:bg-red-50"
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="mt-6">
        <FileUploadCenter
          onFilesUploaded={handleFilesUploaded}
          maxFileSize={10}
          acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']}
          maxFiles={10}
        />
      </div>

      {/* Assign Modal - For unassigned orders */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAssignModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full mx-4">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Assign Order</h3>
                  </div>
                  <button 
                    onClick={() => setShowAssignModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sketch Person *
                    </label>
                    <select
                      value={assignModalData.sketchPersonId}
                      onChange={(e) => setAssignModalData(prev => ({ ...prev, sketchPersonId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      required
                    >
                      <option value="">Select sketch person...</option>
                      {sketchUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      QA Person *
                    </label>
                    <select
                      value={assignModalData.qaPersonId}
                      onChange={(e) => setAssignModalData(prev => ({ ...prev, qaPersonId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      required
                    >
                      <option value="">Select QA person...</option>
                      {qaUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assignment Comment *
                    </label>
                    <textarea
                      value={assignModalData.comment}
                      onChange={(e) => setAssignModalData(prev => ({ ...prev, comment: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="Add a comment about the assignment..."
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  onClick={handleAssignSubmit}
                  disabled={!assignModalData.sketchPersonId || !assignModalData.qaPersonId || !assignModalData.comment.trim()}
                  className={`w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:w-auto sm:text-sm transition-colors duration-200 ${
                    assignModalData.sketchPersonId && assignModalData.qaPersonId && assignModalData.comment.trim()
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Order
                </button>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ready Modal - For Ready, Complete, and Deliver actions */}
      {showReadyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowReadyModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full mx-4">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {readyModalType === 'ready' ? (
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2" />
                    ) : readyModalType === 'deliver' ? (
                      <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mr-2" />
                    ) : (
                      <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mr-2" />
                    )}
                    <h3 className="text-lg font-medium text-gray-900">
                      {readyModalType === 'ready' ? 'Ready for Delivery' : 
                       readyModalType === 'deliver' ? 'Deliver to Customer' : 
                       'Complete Order'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowReadyModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Completion Percentage
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={readyModalData.percentage}
                        onChange={(e) => setReadyModalData(prev => ({ ...prev, percentage: parseInt(e.target.value) }))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {readyModalData.percentage}%
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {readyModalType === 'ready' ? 'QA Quality Rating' : 
                       readyModalType === 'deliver' ? 'Overall Quality Rating' : 
                       'Sketch Quality Rating'} *
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={readyModalData.quality || 5}
                        onChange={(e) => setReadyModalData(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < (readyModalData.quality || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-sm font-medium text-gray-900 ml-2">
                          {readyModalData.quality}/5
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Rate the quality of work completed (1 = Poor, 5 = Excellent)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comment *
                    </label>
                    <textarea
                      value={readyModalData.comment}
                      onChange={(e) => setReadyModalData(prev => ({ ...prev, comment: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder={`Add a comment about ${
                        readyModalType === 'ready' ? 'readiness for delivery' : 
                        readyModalType === 'deliver' ? 'delivery to customer' :
                        'order completion'
                      }...`}
                      rows={4}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  onClick={handleReadySubmit}
                  disabled={!readyModalData.comment.trim() || !readyModalData.quality}
                  className={`w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:w-auto sm:text-sm transition-colors duration-200 ${
                    readyModalData.comment.trim() && readyModalData.quality
                      ? readyModalType === 'ready'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {readyModalType === 'ready' ? (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Mark as Ready
                    </>
                  ) : readyModalType === 'deliver' ? (
                    <>
                      <Truck className="w-4 h-4 mr-2" />
                      Deliver Order
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Complete Order
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowReadyModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Popup Modal */}
      {showImagePopup && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <button
              onClick={() => setShowImagePopup(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Full Size Image */}
            <img 
              src={referenceImageUrl}
              alt="Reference property image - Full size"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={() => setShowImagePopup(false)}
            />
            
            {/* Image Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Property Reference Image</h3>
              <p className="text-sm opacity-90">
                Location: {editValues.address || 'Address not specified'}
              </p>
              <p className="text-sm opacity-90">
                Coordinates: {editValues.latitude}, {editValues.longitude}
              </p>
              <p className="text-xs opacity-75 mt-2">
                Click anywhere to close
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};