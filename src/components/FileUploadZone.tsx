import React, { useRef, useState } from 'react';
import { Upload, FileText, Image, File, X, Download, Eye } from 'lucide-react';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  uploadedAt: Date;
}

interface FileUploadZoneProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  maxFiles?: number;
  existingFiles?: UploadedFile[];
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesUploaded,
  maxFileSize = 10,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  maxFiles = 10,
  existingFiles = []
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(existingFiles);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="w-5 h-5 text-green-600" />;
      case 'doc':
      case 'docx':
        return <File className="w-5 h-5 text-blue-600" />;
      default:
        return <File className="w-5 h-5 text-gray-600" />;
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

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Check if adding these files would exceed the limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: UploadedFile[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        const preview = await createFilePreview(file);
        validFiles.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          file,
          preview,
          uploadedAt: new Date()
        });
      }
    }

    if (errors.length > 0) {
      alert('Some files were not uploaded:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      const newFiles = [...uploadedFiles, ...validFiles];
      setUploadedFiles(newFiles);
      onFilesUploaded(newFiles);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId: string) => {
    const newFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(newFiles);
    onFilesUploaded(newFiles);
  };

  const downloadFile = (uploadedFile: UploadedFile) => {
    const url = URL.createObjectURL(uploadedFile.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = uploadedFile.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const previewFileContent = (uploadedFile: UploadedFile) => {
    if (uploadedFile.file.type.startsWith('image/')) {
      setPreviewFile(uploadedFile);
    } else {
      // For non-image files, trigger download
      downloadFile(uploadedFile);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className={`w-10 h-10 mx-auto mb-3 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="text-gray-700 mb-1 font-medium">
          {dragActive ? 'Drop files here' : 'Drop files here or click to upload'}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Supports: PDF, JPG, PNG, DOC, DOCX (Max {maxFileSize}MB per file)
        </p>
        <p className="text-xs text-gray-400">
          Maximum {maxFiles} files • {uploadedFiles.length}/{maxFiles} uploaded
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-green-600" />
            Uploaded Files ({uploadedFiles.length})
          </h3>
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile) => (
              <div key={uploadedFile.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="p-1 bg-white rounded border">
                    {getFileIcon(uploadedFile.file.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate text-sm">{uploadedFile.file.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{formatFileSize(uploadedFile.file.size)}</span>
                      <span>•</span>
                      <span>Uploaded {uploadedFile.uploadedAt.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => previewFileContent(uploadedFile)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200 rounded hover:bg-blue-50"
                    title={uploadedFile.file.type.startsWith('image/') ? 'Preview' : 'Download'}
                  >
                    {uploadedFile.file.type.startsWith('image/') ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => downloadFile(uploadedFile)}
                    className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200 rounded hover:bg-green-50"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200 rounded hover:bg-red-50"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
            
            {previewFile.preview && (
              <img 
                src={previewFile.preview}
                alt={previewFile.file.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={() => setPreviewFile(null)}
              />
            )}
            
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">{previewFile.file.name}</h3>
              <p className="text-sm opacity-90">
                Size: {formatFileSize(previewFile.file.size)}
              </p>
              <p className="text-sm opacity-90">
                Uploaded: {previewFile.uploadedAt.toLocaleString()}
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