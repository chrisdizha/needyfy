
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StarRating from './StarRating';
import { useReviews } from '@/hooks/useReviews';

interface ReviewFormProps {
  equipmentId?: string;
  bookingId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReviewForm = ({ equipmentId, bookingId, onSuccess, onCancel }: ReviewFormProps) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { createReview, isCreating } = useReviews();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      return;
    }

    createReview({
      equipment_id: equipmentId || null,
      booking_id: bookingId || null,
      rating,
      title: title.trim(),
      content: content.trim(),
      context: 'equipment_rental',
      user_id: '', // This will be set by the mutation
      is_featured: false
    });

    onSuccess?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="rating">Rating</Label>
            <StarRating 
              rating={rating} 
              onRatingChange={setRating} 
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="title">Review Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="content">Your Review</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share details about your rental experience..."
              required
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isCreating || !title.trim() || !content.trim()}
            >
              {isCreating ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
