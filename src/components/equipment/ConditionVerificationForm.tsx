import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Star, Camera, Upload, Download, FileImage } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConditionVerificationFormProps {
  bookingId: string;
  equipmentId: string;
  equipmentTitle: string;
  handoverType: 'pickup' | 'return';
  userRole: 'renter' | 'provider';
  onComplete?: () => void;
}

const commonDamages = [
  'Scratches or scuff marks',
  'Dents or dings', 
  'Missing parts or accessories',
  'Electrical/mechanical issues',
  'Wear and tear beyond normal use',
  'Cleanliness issues',
  'Other damage (specify in notes)'
];

export const ConditionVerificationForm = ({
  bookingId,
  equipmentId,
  equipmentTitle,
  handoverType,
  userRole,
  onComplete
}: ConditionVerificationFormProps) => {
  const [conditionRating, setConditionRating] = useState<number>(5);
  const [conditionNotes, setConditionNotes] = useState('');
  const [damagesReported, setDamagesReported] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [renterName, setRenterName] = useState('');
  const [providerName, setProviderName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleDamageToggle = (damage: string) => {
    setDamagesReported(prev => 
      prev.includes(damage) 
        ? prev.filter(d => d !== damage)
        : [...prev, damage]
    );
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos = Array.from(files);
      if (photos.length + newPhotos.length > 10) {
        toast({
          title: "Too many photos",
          description: "Maximum 10 photos allowed",
          variant: "destructive"
        });
        return;
      }
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const generateSignaturePad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let isDrawing = false;

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const stopDrawing = () => {
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const getSignatureDataURL = (): string => {
    const canvas = canvasRef.current;
    return canvas ? canvas.toDataURL() : '';
  };

  const handleSubmit = async () => {
    if (!renterName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter the renter's name",
        variant: "destructive"
      });
      return;
    }

    if (userRole === 'provider' && !providerName.trim()) {
      toast({
        title: "Missing information", 
        description: "Please enter the provider's name",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create the form record first
      const { data: formData, error: formError } = await supabase
        .from('condition_verification_forms')
        .insert({
          booking_id: bookingId,
          equipment_id: equipmentId,
          equipment_title: equipmentTitle,
          handover_type: handoverType,
          condition_rating: conditionRating,
          condition_notes: conditionNotes,
          damages_reported: damagesReported,
          renter_name: renterName,
          provider_name: providerName || null,
          renter_signed_at: userRole === 'renter' ? new Date().toISOString() : null,
          provider_signed_at: userRole === 'provider' ? new Date().toISOString() : null,
          renter_signature: userRole === 'renter' ? getSignatureDataURL() : null,
          provider_signature: userRole === 'provider' ? getSignatureDataURL() : null,
          completed: false
        })
        .select()
        .single();

      if (formError) throw formError;

      // Upload photos if any
      const photoUrls: string[] = [];
      if (photos.length > 0) {
        setUploading(true);
        
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          const fileName = `${formData.id}/photo_${i + 1}_${Date.now()}.jpg`;
          
          const { error: uploadError } = await supabase.storage
            .from('condition-photos')
            .upload(fileName, photo);

          if (uploadError) throw uploadError;
          photoUrls.push(fileName);
        }

        // Update form with photo URLs
        const { error: updateError } = await supabase
          .from('condition_verification_forms')
          .update({ photos: photoUrls })
          .eq('id', formData.id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Form submitted successfully",
        description: `Condition verification form for ${handoverType} has been saved`
      });

      onComplete?.();

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error submitting form",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  useEffect(() => {
    const cleanup = generateSignaturePad();
    return cleanup;
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">
          Condition Verification Form - {handoverType === 'pickup' ? 'Equipment Pickup' : 'Equipment Return'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Equipment: {equipmentTitle}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Equipment Condition Rating */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Overall Equipment Condition</Label>
          <RadioGroup 
            value={conditionRating.toString()} 
            onValueChange={(value) => setConditionRating(parseInt(value))}
            className="flex flex-wrap gap-4"
          >
            {[1, 2, 3, 4, 5].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1">
                  {rating} <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </Label>
              </div>
            ))}
          </RadioGroup>
          <p className="text-xs text-muted-foreground">
            1 = Poor condition, 5 = Excellent condition
          </p>
        </div>

        {/* Damages Checklist */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Report any damages or issues</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonDamages.map((damage) => (
              <div key={damage} className="flex items-center space-x-2">
                <Checkbox
                  id={damage}
                  checked={damagesReported.includes(damage)}
                  onCheckedChange={() => handleDamageToggle(damage)}
                />
                <Label htmlFor={damage} className="text-sm">{damage}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Condition Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-base font-medium">Additional Notes</Label>
          <Textarea
            id="notes"
            placeholder="Describe any additional details about the equipment condition..."
            value={conditionNotes}
            onChange={(e) => setConditionNotes(e.target.value)}
            rows={4}
          />
        </div>

        {/* Photo Upload */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Photos (Optional - up to 10)</Label>
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Camera className="h-4 w-4 mr-2" />
              Add Photos
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Condition photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removePhoto(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Names */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="renterName" className="text-base font-medium">Renter Name *</Label>
            <Input
              id="renterName"
              value={renterName}
              onChange={(e) => setRenterName(e.target.value)}
              placeholder="Enter renter's full name"
              required
            />
          </div>
          
          {userRole === 'provider' && (
            <div className="space-y-2">
              <Label htmlFor="providerName" className="text-base font-medium">Provider Name *</Label>
              <Input
                id="providerName"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="Enter provider's full name"
                required
              />
            </div>
          )}
        </div>

        {/* Digital Signature */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Digital Signature - {userRole === 'renter' ? 'Renter' : 'Provider'}
          </Label>
          <div className="border-2 border-dashed border-muted-foreground rounded-lg p-4">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full h-32 border rounded cursor-crosshair"
              style={{ touchAction: 'none' }}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">
                Sign above with your mouse or finger
              </p>
              <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit} 
          disabled={submitting || uploading}
          className="w-full"
          size="lg"
        >
          {submitting ? 'Submitting...' : uploading ? 'Uploading Photos...' : 'Submit Condition Verification Form'}
        </Button>
      </CardContent>
    </Card>
  );
};
