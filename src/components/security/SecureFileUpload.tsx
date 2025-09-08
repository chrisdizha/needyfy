import { useState, useCallback } from 'react';
import { Upload, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useSecureFormValidation } from '@/hooks/useSecureFormValidation';
import { supabase } from '@/integrations/supabase/client';

interface SecureFileUploadProps {
  bucket: string;
  folder?: string;
  allowedTypes?: string[];
  maxSize?: number;
  maxFiles?: number;
  onUploadComplete?: (filePaths: string[]) => void;
  onUploadError?: (error: string) => void;
}

interface FileUploadStatus {
  file: File;
  status: 'validating' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  path?: string;
}

export const SecureFileUpload = ({
  bucket,
  folder = '',
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 5,
  onUploadComplete,
  onUploadError
}: SecureFileUploadProps) => {
  const [files, setFiles] = useState<FileUploadStatus[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { validateSecureFile } = useSecureFormValidation();

  const handleFileValidation = useCallback(async (file: File): Promise<boolean> => {
    // Enhanced file validation with security checks
    try {
      // Check file size
      if (file.size > maxSize) {
        toast.error(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`);
        return false;
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        toast.error('File type not allowed');
        return false;
      }

      // Check for dangerous file extensions
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.vbs', '.js', '.jar', '.php', '.asp'];
      if (dangerousExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        toast.error('File type not permitted for security reasons');
        return false;
      }

      // Validate file signature for images
      if (file.type.startsWith('image/')) {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        
        // Check for common image signatures
        const isValidImage = (
          (bytes[0] === 0xFF && bytes[1] === 0xD8) || // JPEG
          (bytes[0] === 0x89 && bytes[1] === 0x50) || // PNG
          (bytes[0] === 0x47 && bytes[1] === 0x49) || // GIF
          (bytes[0] === 0x42 && bytes[1] === 0x4D) || // BMP
          (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[8] === 0x57 && bytes[9] === 0x45) // WEBP
        );
        
        if (!isValidImage) {
          toast.error('Invalid image file format');
          return false;
        }
      }

      // Use secure validation hook for additional checks
      const validation = await validateSecureFile(file, allowedTypes, maxSize);
      if (!validation.isValid) {
        toast.error(validation.error || 'File validation failed');
        return false;
      }

      return true;
    } catch (error) {
      console.error('File validation error:', error);
      toast.error('File validation failed');
      return false;
    }
  }, [validateSecureFile, allowedTypes, maxSize]);

  const uploadFile = useCallback(async (fileStatus: FileUploadStatus): Promise<void> => {
    try {
      // Generate secure file name with enhanced security
      const timestamp = Date.now();
      const randomId = crypto.getRandomValues(new Uint8Array(16))
        .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
      
      // Sanitize and validate file extension
      const originalExtension = fileStatus.file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = allowedTypes.map(type => type.split('/')[1]);
      
      if (!originalExtension || !allowedExtensions.includes(originalExtension)) {
        throw new Error('Invalid file extension');
      }
      
      const secureFileName = `${timestamp}_${randomId}.${originalExtension}`;
      const filePath = folder ? `${folder}/${secureFileName}` : secureFileName;

      // Update status to uploading
      setFiles(prev => prev.map(f => 
        f.file === fileStatus.file ? { ...f, status: 'uploading' as const, progress: 0 } : f
      ));

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileStatus.file, {
          cacheControl: '3600',
          upsert: false,
          contentType: fileStatus.file.type
        });

      if (error) {
        throw error;
      }

      // Update status to completed
      setFiles(prev => prev.map(f => 
        f.file === fileStatus.file ? { 
          ...f, 
          status: 'completed' as const, 
          progress: 100,
          path: data.path
        } : f
      ));

    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.file === fileStatus.file ? { 
          ...f, 
          status: 'error' as const, 
          error: error instanceof Error ? error.message : 'Upload failed'
        } : f
      ));
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    }
  }, [bucket, folder, onUploadError]);

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    
    // Check file limits
    if (files.length + newFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate and process files
    const validatedFiles: FileUploadStatus[] = [];
    
    for (const file of newFiles) {
      const isValid = await handleFileValidation(file);
      if (isValid) {
        validatedFiles.push({
          file,
          status: 'validating',
          progress: 0
        });
      }
    }

    if (validatedFiles.length === 0) {
      return;
    }

    // Add files to state
    setFiles(prev => [...prev, ...validatedFiles]);

    // Start uploads
    validatedFiles.forEach(fileStatus => {
      uploadFile(fileStatus);
    });
  }, [files.length, maxFiles, handleFileValidation, uploadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      handleFiles(selectedFiles);
    }
    // Reset input
    e.target.value = '';
  }, [handleFiles]);

  const removeFile = useCallback((fileToRemove: File) => {
    setFiles(prev => prev.filter(f => f.file !== fileToRemove));
  }, []);

  // Trigger callback when all uploads complete
  const completedFiles = files.filter(f => f.status === 'completed');
  const allUploadsComplete = files.length > 0 && completedFiles.length === files.length;

  if (allUploadsComplete && onUploadComplete) {
    const filePaths = completedFiles.map(f => f.path!);
    onUploadComplete(filePaths);
  }

  return (
    <div className="space-y-4">
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
          ${files.length >= maxFiles ? 'opacity-50 pointer-events-none' : 'hover:border-primary/50'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Drop files here or click to browse</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Supports: {allowedTypes.join(', ')} (max {Math.round(maxSize / 1024 / 1024)}MB each)
        </p>
        <input
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          disabled={files.length >= maxFiles}
        />
        <Button asChild variant="outline" disabled={files.length >= maxFiles}>
          <label htmlFor="file-upload" className="cursor-pointer">
            Choose Files ({files.length}/{maxFiles})
          </label>
        </Button>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Upload Progress</h4>
          {files.map((fileStatus, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileStatus.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(fileStatus.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {fileStatus.status === 'uploading' && (
                  <Progress value={fileStatus.progress} className="mt-1" />
                )}
                {fileStatus.error && (
                  <p className="text-xs text-destructive mt-1">{fileStatus.error}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {fileStatus.status === 'validating' && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
                {fileStatus.status === 'uploading' && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
                {fileStatus.status === 'completed' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {fileStatus.status === 'error' && (
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(fileStatus.file)}
                  disabled={fileStatus.status === 'uploading'}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};