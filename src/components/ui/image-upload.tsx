
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  images?: File[];
  onChange?: (images: File[]) => void;
  onUpload?: (files: File[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
  loading?: boolean;
  accept?: string;
  maxFiles?: number;
  children?: React.ReactNode;
}

const ImageUpload = ({
  images = [],
  onChange,
  onUpload,
  maxImages = 10,
  maxFiles = 10,
  maxFileSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = '',
  loading = false,
  accept = 'image/*',
  children
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!acceptedTypes.includes(file.type)) {
      toast.error(`File type ${file.type} is not supported. Please use JPG, PNG, or WebP.`);
      return false;
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxFileSize}MB`);
      return false;
    }

    return true;
  };

  const processFiles = async (fileList: FileList) => {
    const validFiles: File[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (validateFile(file)) {
        validFiles.push(file);
      }
    }

    const maxFilesToProcess = Math.min(maxFiles || 10, maxImages);
    if (images.length + validFiles.length > maxFilesToProcess) {
      toast.error(`You can only upload up to ${maxFilesToProcess} images`);
      return;
    }

    if (validFiles.length > 0) {
      setUploading(true);
      // Simulate compression/processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (onUpload) {
        onUpload(validFiles);
      }
      
      if (onChange) {
        onChange([...images, ...validFiles]);
      }
      
      setUploading(false);
      toast.success(`${validFiles.length} image(s) uploaded successfully`);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    if (onChange) {
      onChange(newImages);
    }
    toast.success('Image removed');
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // If children are provided, render them as a button
  if (children) {
    return (
      <div className={className}>
        <div onClick={openFileDialog} className="cursor-pointer">
          {children}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          {uploading || loading ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          ) : (
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          )}
          
          <h3 className="font-semibold mb-2">
            {uploading || loading ? 'Processing images...' : 'Upload Images'}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop images here, or click to select files
          </p>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Supported formats: JPG, PNG, WebP</p>
            <p>Max file size: {maxFileSize}MB</p>
            <p>Max images: {maxImages}</p>
          </div>
          
          <Button type="button" variant="outline" className="mt-4" disabled={uploading || loading}>
            <ImageIcon className="w-4 h-4 mr-2" />
            Choose Files
          </Button>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      onLoad={() => URL.revokeObjectURL(URL.createObjectURL(image))}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground truncate">
                      {image.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(image.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Upload status */}
      {images.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {images.length} of {maxImages} images uploaded
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
