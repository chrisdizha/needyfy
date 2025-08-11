
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Edit2, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import PhotoEditor from './PhotoEditor';
import VerifiedBadge from '@/components/badges/VerifiedBadge';

interface ProfilePhotoManagerProps {
  avatarUrl?: string;
  displayName: string;
  isVerified?: boolean;
  onPhotoUpload: (file: File) => Promise<void>;
  onPhotoRemove?: () => Promise<void>;
  onImportSocialPhoto?: () => Promise<void>;
  uploading?: boolean;
  hasSocialPhoto?: boolean;
}

const ProfilePhotoManager = ({
  avatarUrl,
  displayName,
  isVerified,
  onPhotoUpload,
  onPhotoRemove,
  onImportSocialPhoto,
  uploading = false,
  hasSocialPhoto = false
}: ProfilePhotoManagerProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setIsEditorOpen(true);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handlePhotoSave = async (editedFile: File) => {
    try {
      await onPhotoUpload(editedFile);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    }
  };

  const handleRemovePhoto = async () => {
    if (onPhotoRemove) {
      try {
        await onPhotoRemove();
        toast.success('Photo removed successfully');
      } catch (error) {
        console.error('Error removing photo:', error);
        toast.error('Failed to remove photo');
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="text-lg">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>

        {avatarUrl && (
          <Button
            variant="outline"
            size="sm"
            className="absolute -top-2 -right-2 h-8 w-8 p-0 rounded-full"
            onClick={() => document.getElementById('photo-input')?.click()}
            disabled={uploading}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isVerified && <VerifiedBadge label="ID Verified" />}
      
      <div className="flex flex-col items-center space-y-2">
        <div className="flex gap-2">
          <input
            id="photo-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {!avatarUrl ? (
            <Button
              variant="outline"
              onClick={() => document.getElementById('photo-input')?.click()}
              disabled={uploading}
            >
              <Camera className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('photo-input')?.click()}
                disabled={uploading}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Change
              </Button>
              
              {onPhotoRemove && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemovePhoto}
                  disabled={uploading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </>
          )}
        </div>
        
        {hasSocialPhoto && onImportSocialPhoto && (
          <Button variant="ghost" size="sm" onClick={onImportSocialPhoto}>
            <Upload className="h-4 w-4 mr-2" />
            Use Social Media Photo
          </Button>
        )}
      </div>

      <PhotoEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedFile(null);
        }}
        imageFile={selectedFile}
        onSave={handlePhotoSave}
      />
    </div>
  );
};

export default ProfilePhotoManager;
