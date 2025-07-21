import { useState, useCallback } from 'react';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  uploadedAt: Date;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface UseFileUploadOptions {
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  maxFiles?: number;
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    maxFileSize = 10,
    acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxFiles = 10,
    onUploadComplete,
    onUploadError
  } = options;

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
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
  }, [maxFileSize, acceptedTypes]);

  const createFilePreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  }, []);

  const simulateUpload = useCallback((uploadedFile: UploadedFile): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          setUploadedFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, status: 'completed', progress: 100 }
              : f
          ));
          
          resolve();
        } else {
          setUploadedFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, progress }
              : f
          ));
        }
      }, 200);

      // Simulate occasional upload errors
      if (Math.random() < 0.1) { // 10% chance of error
        setTimeout(() => {
          clearInterval(interval);
          setUploadedFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, status: 'error', error: 'Upload failed. Please try again.' }
              : f
          ));
          reject(new Error('Upload failed'));
        }, 1000);
      }
    });
  }, []);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check if adding these files would exceed the limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      const error = `Maximum ${maxFiles} files allowed`;
      onUploadError?.(error);
      return;
    }

    setIsUploading(true);
    const newFiles: UploadedFile[] = [];
    const errors: string[] = [];

    // Validate and prepare files
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        const preview = await createFilePreview(file);
        const uploadedFile: UploadedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          file,
          preview,
          uploadedAt: new Date(),
          status: 'uploading',
          progress: 0
        };
        newFiles.push(uploadedFile);
      }
    }

    if (errors.length > 0) {
      onUploadError?.(errors.join('\n'));
    }

    if (newFiles.length > 0) {
      // Add files to state
      setUploadedFiles(prev => [...prev, ...newFiles]);

      // Upload files (simulated)
      try {
        await Promise.all(newFiles.map(file => simulateUpload(file)));
        onUploadComplete?.(newFiles);
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setIsUploading(false);
  }, [uploadedFiles.length, maxFiles, validateFile, createFilePreview, simulateUpload, onUploadComplete, onUploadError]);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const retryUpload = useCallback(async (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file && file.status === 'error') {
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'uploading', progress: 0, error: undefined }
          : f
      ));

      try {
        await simulateUpload(file);
      } catch (error) {
        console.error('Retry upload error:', error);
      }
    }
  }, [uploadedFiles, simulateUpload]);

  const clearAllFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  const getUploadStats = useCallback(() => {
    const total = uploadedFiles.length;
    const completed = uploadedFiles.filter(f => f.status === 'completed').length;
    const uploading = uploadedFiles.filter(f => f.status === 'uploading').length;
    const errors = uploadedFiles.filter(f => f.status === 'error').length;
    
    return { total, completed, uploading, errors };
  }, [uploadedFiles]);

  return {
    uploadedFiles,
    isUploading,
    uploadFiles,
    removeFile,
    retryUpload,
    clearAllFiles,
    getUploadStats,
    validateFile
  };
};