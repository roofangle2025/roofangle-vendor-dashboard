import React, { useState, useRef } from 'react';
import { Upload, Download, Trash2, FileText, Image, File, Plus } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  file?: File; // Made optional for sample files
  uploadedAt: Date;
  uploadedBy: string;
  size: number;
  type: string;
  isSample?: boolean; // Flag to identify sample files
}

interface FileUploadCenterProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  maxFiles?: number;
  existingFiles?: UploadedFile[];
}

// Sample files data
const sampleFiles: UploadedFile[] = [
  {
    id: 'sample-1',
    name: '20728 Woodvine Av.zip',
    uploadedAt: new Date('2025-01-06'),
    uploadedBy: 'ricciardo',
    size: 2547892, // ~2.5MB
    type: 'application/zip',
    isSample: true
  },
  {
    id: 'sample-2',
    name: 'Property_Report_ESX.pdf',
    uploadedAt: new Date('2025-01-05'),
    uploadedBy: 'ricciardo',
    size: 1847392, // ~1.8MB
    type: 'application/pdf',
    isSample: true
  },
  {
    id: 'sample-3',
    name: 'Damage_Assessment_DAD.pdf',
    uploadedAt: new Date('2025-01-04'),
    uploadedBy: 'jane.smith',
    size: 3247892, // ~3.2MB
    type: 'application/pdf',
    isSample: true
  },
  {
    id: 'sample-4',
    name: 'Reference_Image_001.jpg',
    uploadedAt: new Date('2025-01-03'),
    uploadedBy: 'mike.johnson',
    size: 847392, // ~847KB
    type: 'image/jpeg',
    isSample: true
  },
  {
    id: 'sample-5',
    name: 'Wall_Inspection_Report.docx',
    uploadedAt: new Date('2025-01-02'),
    uploadedBy: 'ricciardo',
    size: 1247892, // ~1.2MB
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    isSample: true
  }
];

export const FileUploadCenter: React.FC<FileUploadCenterProps> = ({
  onFilesUploaded,
  maxFileSize = 10,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  maxFiles = 10,
  existingFiles = []
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Initialize with sample files plus any existing files
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([...sampleFiles, ...existingFiles]);

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
      case 'zip':
        return <File className="w-4 h-4 text-purple-600" />;
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
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    const extension = '.' + file.name.toLowerCase().split('.').pop();
    if (!acceptedTypes.includes(extension)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    // Check if adding these files would exceed the limit
    if (uploadedFiles.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: UploadedFile[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          file,
          uploadedAt: new Date(),
          uploadedBy: 'ricciardo', // In a real app, this would come from user context
          size: file.size,
          type: file.type,
          isSample: false
        });
      }
    });

    if (errors.length > 0) {
      alert('Some files were not uploaded:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      const newFiles = [...uploadedFiles, ...validFiles];
      setUploadedFiles(newFiles);
      onFilesUploaded?.(newFiles);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = (uploadedFile: UploadedFile) => {
    if (uploadedFile.file) {
      // For real uploaded files
      const url = URL.createObjectURL(uploadedFile.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = uploadedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // For sample files, simulate download
      alert(`Downloading ${uploadedFile.name}...`);
      // In a real app, you would download from a server URL
    }
  };

  const handleDelete = (fileId: string) => {
    const fileToDelete = uploadedFiles.find(f => f.id === fileId);
    
    if (fileToDelete?.isSample) {
      // For sample files, just show a message
      if (confirm('This is a sample file. Are you sure you want to remove it from the list?')) {
        const newFiles = uploadedFiles.filter(f => f.id !== fileId);
        setUploadedFiles(newFiles);
        onFilesUploaded?.(newFiles);
      }
    } else {
      // For real uploaded files
      if (confirm('Are you sure you want to delete this file?')) {
        const newFiles = uploadedFiles.filter(f => f.id !== fileId);
        setUploadedFiles(newFiles);
        onFilesUploaded?.(newFiles);
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">File Upload Center</h2>
          <button
            onClick={handleFileSelect}
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
          >
            Upload New File
          </button>
        </div>
        
        {/* File Input - Multiple files enabled */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* File Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                User
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Size
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {uploadedFiles.map((file) => (
              <tr key={file.id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.name)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        {file.isSample && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                            Sample
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{file.type}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">
                    {formatDate(file.uploadedAt)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">{file.uploadedBy}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">
                    {formatFileSize(file.size)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleDownload(file)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200 rounded hover:bg-blue-50"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200 rounded hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with file count */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {uploadedFiles.length} files total ({uploadedFiles.filter(f => !f.isSample).length} uploaded, {uploadedFiles.filter(f => f.isSample).length} sample files)
          </p>
          <p className="text-xs text-gray-500">
            Maximum {maxFiles} files allowed
          </p>
        </div>
      </div>
    </div>
  );
};