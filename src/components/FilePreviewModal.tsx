import React from 'react';
import { X, Download, FileText, Image, File } from 'lucide-react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
    preview?: string;
    uploadedAt: Date;
    uploadedBy: string;
  } | null;
  onDownload: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  file,
  onDownload
}) => {
  if (!isOpen || !file) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (fileName: string) => {
    return fileName.toLowerCase().split('.').pop() || '';
  };

  const isImageFile = (fileName: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes(getFileExtension(fileName));
  };

  const isPDFFile = (fileName: string) => {
    return getFileExtension(fileName) === 'pdf';
  };

  const renderFilePreview = () => {
    if (isImageFile(file.name) && (file.preview || file.url)) {
      return (
        <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
          <img
            src={file.preview || file.url}
            alt={file.name}
            className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
          />
        </div>
      );
    }

    if (isPDFFile(file.name) && file.url) {
      return (
        <div className="bg-gray-100 rounded-lg p-4">
          <iframe
            src={file.url}
            className="w-full h-96 border-0 rounded-lg"
            title={file.name}
          />
        </div>
      );
    }

    // For other file types, show a file icon and info
    return (
      <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-8">
        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm">
          {isImageFile(file.name) ? (
            <Image className="w-8 h-8 text-green-600" />
          ) : isPDFFile(file.name) ? (
            <FileText className="w-8 h-8 text-red-600" />
          ) : (
            <File className="w-8 h-8 text-blue-600" />
          )}
        </div>
        <p className="text-gray-600 text-center mb-2">
          Preview not available for this file type
        </p>
        <p className="text-sm text-gray-500 text-center">
          Click download to view the file
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{file.name}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <span>Uploaded by {file.uploadedBy}</span>
              <span>•</span>
              <span>{file.uploadedAt.toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={onDownload}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {renderFilePreview()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            File type: {getFileExtension(file.name).toUpperCase()}
          </div>
          <div className="text-xs text-gray-500">
            Click outside or press ESC to close
          </div>
        </div>
      </div>
    </div>
  );
};