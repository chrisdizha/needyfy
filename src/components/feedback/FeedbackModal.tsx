import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Star, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  category: z.string().min(1, 'Please select a category'),
  feedback: z.string().min(10, 'Please provide at least 10 characters of feedback'),
});

type FeedbackData = z.infer<typeof feedbackSchema>;

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
  title?: string;
}

export const FeedbackModal = ({ 
  isOpen, 
  onClose, 
  context = 'general',
  title = 'Share Your Feedback'
}: FeedbackModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<FeedbackData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      category: '',
      feedback: '',
    },
  });

  const handleSubmit = async (data: FeedbackData) => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Store feedback in database (you'll need to create a feedback table)
      const feedbackRecord = {
        user_id: user?.id,
        rating: data.rating,
        category: data.category,
        feedback: data.feedback,
        context: context,
        created_at: new Date().toISOString(),
      };

      // For now, just log it (implement proper storage later)
      console.log('Feedback submitted:', feedbackRecord);
      
      toast.success('Thank you for your feedback! We appreciate your input.');
      form.reset();
      setRating(0);
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = () => (
    <div className="flex items-center gap-1 mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`p-1 transition-colors ${
            star <= (hoveredRating || rating) 
              ? 'text-yellow-400' 
              : 'text-gray-300 hover:text-yellow-300'
          }`}
          onClick={() => {
            setRating(star);
            form.setValue('rating', star);
          }}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          <Star className="h-6 w-6 fill-current" />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        {rating > 0 && (
          rating === 5 ? 'Excellent!' :
          rating === 4 ? 'Good' :
          rating === 3 ? 'Average' :
          rating === 2 ? 'Below Average' :
          'Poor'
        )}
      </span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div>
              <FormLabel>How would you rate your experience?</FormLabel>
              <StarRating />
              {rating === 0 && (
                <p className="text-sm text-destructive">Please select a rating</p>
              )}
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select feedback category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="onboarding">Onboarding Experience</SelectItem>
                      <SelectItem value="ui">User Interface</SelectItem>
                      <SelectItem value="features">Features & Functionality</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="support">Customer Support</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="suggestion">Feature Request</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your experience..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="flex-1"
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};