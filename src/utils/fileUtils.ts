export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (fileName: string): string => {
  return fileName.toLowerCase().split('.').pop() || '';
};

export const getFileType = (fileName: string): 'image' | 'document' | 'pdf' | 'other' => {
  const extension = getFileExtension(fileName);
  
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
    return 'image';
  }
  
  if (extension === 'pdf') {
    return 'pdf';
  }
  
  if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) {
    return 'document';
  }
  
  return 'other';
};

export const isImageFile = (fileName: string): boolean => {
  return getFileType(fileName) === 'image';
};

export const isPDFFile = (fileName: string): boolean => {
  return getFileType(fileName) === 'pdf';
};

export const isDocumentFile = (fileName: string): boolean => {
  return getFileType(fileName) === 'document';
};

export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  const extension = '.' + getFileExtension(file.name);
  return allowedTypes.includes(extension);
};

export const createFilePreview = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!isImageFile(file.name)) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

export const downloadFile = (file: File, fileName?: string): void => {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadFromUrl = (url: string, fileName: string): void => {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// File validation rules
export const FILE_VALIDATION_RULES = {
  maxFileSize: 10, // MB
  allowedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  maxFiles: 10
} as const;

// MIME type mappings
export const MIME_TYPE_MAP: Record<string, string> = {
  'pdf': 'application/pdf',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

export const getMimeType = (fileName: string): string => {
  const extension = getFileExtension(fileName);
  return MIME_TYPE_MAP[extension] || 'application/octet-stream';
};