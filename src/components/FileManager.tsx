import React, { useState } from 'react';
import { FileText, Download, Trash2, Eye, Upload, Search, Filter, Grid, List } from 'lucide-react';

interface ManagedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  uploadedBy: string;
  category: 'document' | 'image' | 'report' | 'other';
  url?: string;
  preview?: string;
}

interface FileManagerProps {
  files: ManagedFile[];
  onFileUpload: (files: File[]) => void;
  onFileDelete: (fileId: string) => void;
  onFileDownload: (file: ManagedFile) => void;
  onFilePreview: (file: ManagedFile) => void;
  allowUpload?: boolean;
  allowDelete?: boolean;
  viewMode?: 'grid' | 'list';
}

export const FileManager: React.FC<FileManagerProps> = ({
  files,
  onFileUpload,
  onFileDelete,
  onFileDownload,
  onFilePreview,
  allowUpload = true,
  allowDelete = true,
  viewMode: initialViewMode = 'list'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const getFileIcon = (fileName: string, category: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    
    if (category === 'image' || ['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
        <span className="text-green-600 text-xs font-bold">IMG</span>
      </div>;
    }
    
    if (extension === 'pdf') {
      return <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
        <span className="text-red-600 text-xs font-bold">PDF</span>
      </div>;
    }
    
    if (['doc', 'docx'].includes(extension || '')) {
      return <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
        <span className="text-blue-600 text-xs font-bold">DOC</span>
      </div>;
    }
    
    return <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
      <FileText className="w-4 h-4 text-gray-600" />
    </div>;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'document': return 'bg-blue-100 text-blue-800';
      case 'image': return 'bg-green-100 text-green-800';
      case 'report': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedFiles.length > 0 && confirm(`Delete ${selectedFiles.length} selected files?`)) {
      selectedFiles.forEach(fileId => onFileDelete(fileId));
      setSelectedFiles([]);
    }
  };

  const handleFileUploadInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">File Manager</h3>
          <span className="text-sm text-gray-500">({filteredFiles.length} files)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
          
          {/* Upload Button */}
          {allowUpload && (
            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUploadInput}
                className="hidden"
              />
            </label>
          )}
          
          {/* Bulk Actions */}
          {selectedFiles.length > 0 && allowDelete && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedFiles.length})
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search files by name or uploader..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
        
        <div className="sm:w-48">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Categories</option>
            <option value="document">Documents</option>
            <option value="image">Images</option>
            <option value="report">Reports</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No files found</p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm || filterCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Upload your first file to get started'
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
          {filteredFiles.map((file) => (
            <div key={file.id} className={`bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 ${
              viewMode === 'grid' ? 'p-4' : 'p-3'
            } ${selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
              {viewMode === 'grid' ? (
                // Grid View
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    {getFileIcon(file.name, file.category)}
                  </div>
                  
                  <h4 className="font-medium text-gray-900 text-sm mb-2 truncate" title={file.name}>
                    {file.name}
                  </h4>
                  
                  <div className="space-y-1 mb-3">
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(file.category)}`}>
                      {file.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-1">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => handleFileSelect(file.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <button
                      onClick={() => onFilePreview(file)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onFileDownload(file)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {allowDelete && (
                      <button
                        onClick={() => onFileDelete(file.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                // List View
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => handleFileSelect(file.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    
                    {getFileIcon(file.name, file.category)}
                    
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate text-sm">{file.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>by {file.uploadedBy}</span>
                        <span>•</span>
                        <span>{file.uploadedAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(file.category)}`}>
                      {file.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onFilePreview(file)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200 rounded hover:bg-blue-50"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onFileDownload(file)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200 rounded hover:bg-green-50"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {allowDelete && (
                      <button
                        onClick={() => onFileDelete(file.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};