
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
    photos: [] as File[]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      toast.error("Please enter a title");
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.category) {
      toast.error("Please select a category");
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.price || isNaN(Number(formData.price))) {
      toast.error("Please enter a valid price");
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success
      toast.success("Equipment listed successfully!");
      setIsSubmitting(false);
      
      // Redirect to dashboard or equipment page
      setTimeout(() => {
        navigate('/bookings');
      }, 1500);
    } catch (error) {
      toast.error("Failed to list equipment. Please try again.");
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Professional DSLR Camera"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your equipment, condition, special features, etc."
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          
          {/* Category and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CategorySelector 
              categories={equipmentCategories} 
              selectedCategory={formData.category} 
              onCategoryChange={(value) => handleSelectChange('category', value)} 
            />
            
            <PriceField 
              price={formData.price} 
              priceUnit={formData.priceUnit} 
              onPriceChange={handleInputChange} 
              onPriceUnitChange={(value) => handleSelectChange('priceUnit', value)} 
            />
          </div>
          
          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">
              Location
            </label>
            <Input
              id="location"
              name="location"
              placeholder="Enter city, state or zip code"
              value={formData.location}
              onChange={handleInputChange}
            />
          </div>
          
          {/* Photos */}
          <PhotoUploader 
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
  );
};

export default EquipmentForm;
