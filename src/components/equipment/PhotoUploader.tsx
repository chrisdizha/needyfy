
import { useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoUploaderProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
}

const PhotoUploader = ({ photos, onPhotosChange }: PhotoUploaderProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Add new photos to existing array (up to 5 total)
      const newPhotos = Array.from(e.target.files);
      if (photos.length + newPhotos.length > 5) {
        toast.error("Maximum 5 photos allowed");
        return;
      }
      onPhotosChange([...photos, ...newPhotos]);
    }
  };
  
  const handleRemovePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };
  
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Photos (max 5)
      </label>
      
      {/* Display selected photos preview */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
          {photos.map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index}`}
                className="w-full h-24 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      {photos.length < 5 && (
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, WebP (MAX 5MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
