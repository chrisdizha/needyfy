import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AIDescriptionGenerator } from '@/components/ai/AIDescriptionGenerator';
import { AIPricingSuggestion } from '@/components/ai/AIPricingSuggestion';
import { Sparkles, Save } from 'lucide-react';

interface EquipmentFormData {
  title: string;
  category: string;
  description: string;
  price: number;
  location: string;
  condition: string;
  keyFeatures: string;
}

interface AIEquipmentFormProps {
  initialData?: Partial<EquipmentFormData>;
  onSave: (data: EquipmentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const categories = [
  'Tools & Hardware',
  'Construction Equipment',
  'Photography & Video',
  'Sports & Outdoor',
  'Electronics',
  'Home & Garden',
  'Vehicles',
  'Party & Events',
  'Other'
];

const conditions = ['Excellent', 'Very Good', 'Good', 'Fair'];

export const AIEquipmentForm = ({ 
  initialData = {}, 
  onSave, 
  onCancel, 
  isLoading = false 
}: AIEquipmentFormProps) => {
  const [formData, setFormData] = useState<EquipmentFormData>({
    title: initialData.title || '',
    category: initialData.category || '',
    description: initialData.description || '',
    price: initialData.price || 0,
    location: initialData.location || '',
    condition: initialData.condition || 'Good',
    keyFeatures: initialData.keyFeatures || ''
  });

  const handleInputChange = (field: keyof EquipmentFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDescriptionGenerated = (description: string) => {
    setFormData(prev => ({
      ...prev,
      description
    }));
  };

  const handlePriceSuggested = (price: number) => {
    setFormData(prev => ({
      ...prev,
      price
    }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.category || !formData.location || !formData.price) {
      return;
    }
    onSave(formData);
  };

  const isFormValid = formData.title && formData.category && formData.location && formData.price > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Enhanced Equipment Listing
          </CardTitle>
          <CardDescription>
            Create professional equipment listings with AI assistance
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Details</TabsTrigger>
          <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Equipment Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Professional DSLR Camera"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., New York, NY"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition} value={condition}>
                          {condition}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Daily Rental Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', Number(e.target.value))}
                    placeholder="0"
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keyFeatures">Key Features</Label>
                  <Input
                    id="keyFeatures"
                    value={formData.keyFeatures}
                    onChange={(e) => handleInputChange('keyFeatures', e.target.value)}
                    placeholder="e.g., 4K video, wireless, waterproof"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your equipment, its features, and ideal use cases..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-tools" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIDescriptionGenerator
              title={formData.title}
              category={formData.category}
              keyFeatures={formData.keyFeatures}
              condition={formData.condition}
              currentDescription={formData.description}
              onDescriptionGenerated={handleDescriptionGenerated}
            />

            <AIPricingSuggestion
              title={formData.title}
              category={formData.category}
              condition={formData.condition}
              location={formData.location}
              features={formData.keyFeatures}
              currentPrice={formData.price}
              onPriceSuggested={handlePriceSuggested}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            'Saving...'
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Listing
            </>
          )}
        </Button>
      </div>
    </div>
  );
};