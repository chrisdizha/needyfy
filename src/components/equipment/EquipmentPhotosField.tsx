
import ImageUpload from '@/components/ui/image-upload';

interface EquipmentPhotosFieldProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
}

const EquipmentPhotosField = ({ photos, onPhotosChange }: EquipmentPhotosFieldProps) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        Equipment Photos <span className="text-destructive">*</span>
      </label>
      <ImageUpload
        images={photos}
        onChange={onPhotosChange}
        maxImages={10}
        maxFileSize={5}
        acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
      />
      <p className="text-sm text-muted-foreground">
        Upload high-quality photos of your equipment. The first photo will be used as the main image.
      </p>
    </div>
  );
};

export default EquipmentPhotosField;
