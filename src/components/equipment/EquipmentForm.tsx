
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EquipmentPolicyInfo from './EquipmentPolicyInfo';
import EquipmentTitleField from './EquipmentTitleField';
import EquipmentDescriptionField from './EquipmentDescriptionField';
import EquipmentCategoryPriceFields from './EquipmentCategoryPriceFields';
import EquipmentLocationField from './EquipmentLocationField';
import EquipmentPhotosField from './EquipmentPhotosField';
import TermsPreviewModal from './TermsPreviewModal';
import TermsEditor from './TermsEditor';
import { useForm, type FieldErrors, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEquipmentListings } from '@/hooks/useEquipmentListings';
import { useAuth } from '@/contexts/OptimizedAuthContext';

const SAMPLE_TERMS = `Full refund for cancellations made at least 48 hours before the rental start date.
50% refund for cancellations within 48 hours, no refund if cancelled on the day of rental.
Equipment must be returned in the same condition as provided; damage or loss may result in fees.
Late return incurs a penalty fee of $25/hour.`;

const equipmentCategories = [
  'Construction Equipment',
  'Landscaping Tools',
  'Photography Gear',
  'Audio/Visual Equipment',
  'Party Supplies',
  'Sports Equipment',
  'Camping Gear',
  'Moving Equipment',
  'Power Tools',
  'Other',
];

const equipmentFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Please enter a title for your equipment.'),
  description: z
    .string()
    .trim()
    .min(1, 'Please describe your equipment.'),
  category: z.string().min(1, 'Please select a category.'),
  price: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Please enter a valid price.',
    }),
  priceUnit: z.enum(['day', 'hour', 'week']),
  location: z
    .string()
    .trim()
    .min(1, 'Please enter your location.'),
  cancellationPolicy: z
    .string()
    .trim()
    .min(20, 'Please provide detailed rental terms/cancellation policy.'),
  photos: z
    .array(z.instanceof(File))
    .min(1, 'Please upload at least one photo of your equipment.'),
});

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

const EquipmentForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createListing, isCreating } = useEquipmentListings();

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [termsHistory, setTermsHistory] = useState<string[]>([]);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      price: '',
      priceUnit: 'day',
      location: '',
      cancellationPolicy: SAMPLE_TERMS,
      photos: [],
    },
  });

  const onSubmit: SubmitHandler<EquipmentFormValues> = async (data) => {
    if (!user) {
      toast.error('You must be logged in to list equipment.');
      return;
    }

    try {
      // Convert photos to URLs (in a real app, you'd upload these to storage first)
      const photoUrls = data.photos.map((file, index) => 
        URL.createObjectURL(file) // This is temporary - in production you'd upload to Supabase storage
      );

      const listingData = {
        owner_id: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        price: Number(data.price) * 100, // Convert to cents
        price_unit: data.priceUnit,
        location: data.location,
        photos: photoUrls,
        terms_and_conditions: data.cancellationPolicy,
        status: 'active' as const,
        availability_calendar: {},
        is_verified: false,
      };

      createListing(listingData);
      
      // Navigate to dashboard after a short delay to show success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Failed to list equipment. Please try again.');
    }
  };

  const onError = (errors: FieldErrors<EquipmentFormValues>) => {
    const firstError = Object.values(errors)[0];
    if (firstError && 'message' in firstError && firstError?.message) {
      toast.error(String(firstError.message));
    } else {
      toast.error('Please fix the errors and try again.');
    }
  };

  // Terms editor callbacks
  const handleTermsChange = (terms: string) => {
    setValue('cancellationPolicy', terms, { shouldValidate: true });
  };
  const handleSaveVersion = (terms: string) => {
    setTermsHistory([terms, ...termsHistory]);
    toast.success('Version saved.');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Equipment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <EquipmentPolicyInfo />
          <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
            <EquipmentTitleField
              title={watch('title')}
              onChange={(e) =>
                setValue('title', e.target.value, { shouldValidate: true })
              }
            />

            <EquipmentDescriptionField
              description={watch('description')}
              onChange={(e) =>
                setValue('description', e.target.value, {
                  shouldValidate: true,
                })
              }
            />

            <EquipmentCategoryPriceFields
              categories={equipmentCategories}
              selectedCategory={watch('category')}
              price={watch('price')}
              priceUnit={watch('priceUnit')}
              onCategoryChange={(value) =>
                setValue('category', value, { shouldValidate: true })
              }
              onPriceChange={(e) =>
                setValue('price', e.target.value, { shouldValidate: true })
              }
              onPriceUnitChange={(value) =>
                setValue('priceUnit', value as EquipmentFormValues['priceUnit'], {
                  shouldValidate: true,
                })
              }
            />

            <div>
              <label htmlFor="cancellationPolicy" className="block text-sm font-medium mb-1">
                Rental Terms / Cancellation Policy <span className="text-destructive">*</span>
              </label>
              <TermsEditor
                value={watch('cancellationPolicy')}
                onChange={handleTermsChange}
                versionHistory={termsHistory}
                onSaveVersion={handleSaveVersion}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {watch('cancellationPolicy').trim() === SAMPLE_TERMS
                  ? 'Sample terms provided. Edit as needed for your situation.'
                  : ''}
              </p>
            </div>

            <EquipmentLocationField
              location={watch('location')}
              onChange={(e) =>
                setValue('location', e.target.value, { shouldValidate: true })
              }
            />

            <EquipmentPhotosField
              photos={watch('photos')}
              onPhotosChange={(photos) =>
                setValue('photos', photos, { shouldValidate: true })
              }
            />

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isSubmitting || isCreating}>
                {isSubmitting || isCreating ? 'Listing Equipment...' : 'List Equipment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <TermsPreviewModal
        isOpen={isPreviewing}
        onClose={() => setIsPreviewing(false)}
        terms={watch('cancellationPolicy')}
      />
    </>
  );
};

export default EquipmentForm;
