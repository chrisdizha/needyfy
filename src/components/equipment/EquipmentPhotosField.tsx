
import PhotoUploader from "./PhotoUploader";

interface EquipmentPhotosFieldProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
}

const EquipmentPhotosField = ({ photos, onPhotosChange }: EquipmentPhotosFieldProps) => (
  <PhotoUploader photos={photos} onPhotosChange={onPhotosChange} />
);

export default EquipmentPhotosField;
