
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ImageUpload from '@/components/ui/image-upload';

interface EquipmentPhotosFieldProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
}

const EquipmentPhotosField = ({ photos, onPhotosChange }: EquipmentPhotosFieldProps) => {
  return (
    <FormItem>
      <FormLabel>
        Equipment Photos <span className="text-destructive">*</span>
      </FormLabel>
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
      <FormMessage />
    </FormItem>
  );
};

export default EquipmentPhotosField;
