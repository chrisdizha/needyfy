import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CategorySelector from './CategorySelector';
import PriceField from './PriceField';
import PhotoUploader from './PhotoUploader';
import TermsPreviewModal from './TermsPreviewModal';
import TermsEditor from "./TermsEditor";
import EquipmentPolicyInfo from './EquipmentPolicyInfo';
import EquipmentTitleField from './EquipmentTitleField';
import EquipmentDescriptionField from './EquipmentDescriptionField';
import EquipmentCategoryPriceFields from './EquipmentCategoryPriceFields';
import EquipmentLocationField from './EquipmentLocationField';
import EquipmentPhotosField from './EquipmentPhotosField';

const SAMPLE_TERMS = `Full refund for cancellations made at least 48 hours before the rental start date.
50% refund for cancellations within 48 hours, no refund if cancelled on the day of rental.
Equipment must be returned in the same condition as provided; damage or loss may result in fees.
Late return incurs a penalty fee of $25/hour.`;

const equipmentCategories = [
  "Construction Equipment",
  "Landscaping Tools",
  "Photography Gear",
  "Audio/Visual Equipment",
  "Party Supplies",
  "Sports Equipment",
  "Camping Gear",
  "Moving Equipment",
  "Power Tools",
  "Other"
];

const EquipmentForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    priceUnit: 'day', // day, hour, week
    location: '',
    cancellationPolicy: SAMPLE_TERMS,
    photos: [] as File[]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [termsHistory, setTermsHistory] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };
  
  const handlePhotosChange = (photos: File[]) => {
    setFormData({ ...formData, photos });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a title for your equipment.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please describe your equipment.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.category) {
      toast.error("Please select a category.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.price || isNaN(Number(formData.price))) {
      toast.error("Please enter a valid price.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Please enter your location.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.cancellationPolicy.trim() || formData.cancellationPolicy.trim().length < 20) {
      toast.error("Please provide detailed rental terms/cancellation policy.");
      setIsSubmitting(false);
      return;
    }
    if (formData.photos.length === 0) {
      toast.error("Please upload at least one photo of your equipment.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success
      toast.success("Equipment listed successfully!");
      setIsSubmitting(false);
      setTimeout(() => {
        navigate('/bookings');
      }, 1500);
    } catch (error) {
      toast.error("Failed to list equipment. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Intercept for our terms editor
  const handleTermsChange = (terms: string) => {
    setFormData({ ...formData, cancellationPolicy: terms });
  };
  const handleSaveVersion = (terms: string) => {
    setTermsHistory([terms, ...termsHistory]);
    toast.success("Version saved.");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Equipment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <EquipmentPolicyInfo />
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <EquipmentTitleField
              title={formData.title}
              onChange={handleInputChange}
            />
            {/* Description */}
            <EquipmentDescriptionField
              description={formData.description}
              onChange={handleInputChange}
            />
            {/* Category and Price */}
            <EquipmentCategoryPriceFields
              categories={equipmentCategories}
              selectedCategory={formData.category}
              price={formData.price}
              priceUnit={formData.priceUnit}
              onCategoryChange={value => handleSelectChange('category', value)}
              onPriceChange={handleInputChange}
              onPriceUnitChange={value => handleSelectChange('priceUnit', value)}
            />
            {/* Cancellation Policy (now using TermsEditor) */}
            <div>
              <label htmlFor="cancellationPolicy" className="block text-sm font-medium mb-1">
                Rental Terms / Cancellation Policy <span className="text-destructive">*</span>
              </label>
              <TermsEditor
                value={formData.cancellationPolicy}
                onChange={handleTermsChange}
                versionHistory={termsHistory}
                onSaveVersion={handleSaveVersion}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.cancellationPolicy.trim() === SAMPLE_TERMS
                  ? "Sample terms provided. Edit as needed for your situation."
                  : ""}
              </p>
            </div>
            {/* Location */}
            <EquipmentLocationField
              location={formData.location}
              onChange={handleInputChange}
            />
            {/* Photos */}
            <EquipmentPhotosField
              photos={formData.photos}
              onPhotosChange={handlePhotosChange}
            />
            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "List Equipment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <TermsPreviewModal
        isOpen={isPreviewing}
        onClose={() => setIsPreviewing(false)}
        terms={formData.cancellationPolicy}
      />
    </>
  );
};

export default EquipmentForm;
