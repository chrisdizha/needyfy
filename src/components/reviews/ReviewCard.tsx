
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StarRating from './StarRating';
import type { Review } from '@/hooks/useReviews';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img 
              src={review.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.profiles?.full_name || 'anonymous'}`}
              alt={review.profiles?.full_name || 'Anonymous'}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-sm">
                {review.profiles?.full_name || 'Anonymous User'}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(review.created_at)}
              </p>
            </div>
          </div>
          {review.is_featured && (
            <Badge variant="secondary">Featured</Badge>
          )}
        </div>

        <div className="mb-3">
          <StarRating rating={review.rating} readonly size="sm" />
        </div>

        <h3 className="font-semibold text-base mb-2">{review.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {review.content}
        </p>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
