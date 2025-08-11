
import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, ZoomIn, ZoomOut, Crop as CropIcon, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import 'react-image-crop/dist/ReactCrop.css';

interface PhotoEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onSave: (editedFile: File) => void;
}

const PhotoEditor = ({ isOpen, onClose, imageFile, onSave }: PhotoEditorProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imageUrl, setImageUrl] = useState<string>('');

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Create a default crop that's centered and square
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        1, // aspect ratio 1:1 for square
        width,
        height,
      ),
      width,
      height,
    );
    
    setCrop(crop);
  }, []);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const getCroppedImg = useCallback(async (): Promise<File | null> => {
    if (!imgRef.current || !completedCrop) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const file = new File([blob], `cropped-${imageFile?.name || 'image.jpg'}`, {
          type: 'image/jpeg',
        });
        resolve(file);
      }, 'image/jpeg', 0.9);
    });
  }, [completedCrop, imageFile]);

  const handleSave = async () => {
    try {
      const croppedFile = await getCroppedImg();
      if (croppedFile) {
        onSave(croppedFile);
        onClose();
        toast.success('Photo edited successfully!');
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Error editing photo');
    }
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const crop = centerCrop(
        makeAspectCrop({ unit: '%', width: 80 }, 1, width, height),
        width,
        height,
      );
      setCrop(crop);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5" />
            Edit Photo
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 max-h-[70vh] overflow-auto">
          {imageUrl && (
            <div className="relative flex justify-center bg-gray-50 rounded-lg p-4">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop={false}
              >
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={imageUrl}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    maxWidth: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain',
                  }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ZoomOut className="h-4 w-4" />
                <span className="text-sm font-medium">Zoom: {Math.round(zoom * 100)}%</span>
                <ZoomIn className="h-4 w-4" />
              </div>
              <Slider
                value={[zoom]}
                onValueChange={([value]) => setZoom(value)}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                <span className="text-sm font-medium">Rotation: {rotation}°</span>
              </div>
              <Slider
                value={[rotation]}
                onValueChange={([value]) => setRotation(value)}
                min={-180}
                max={180}
                step={15}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoEditor;
