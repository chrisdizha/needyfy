
import React from 'react';
import { useReviews } from '@/hooks/useReviews';
import ReviewCard from './ReviewCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ReviewsListProps {
  equipmentId?: string;
  showAddButton?: boolean;
  onAddReview?: () => void;
}

const ReviewsList = ({ equipmentId, showAddButton = false, onAddReview }: ReviewsListProps) => {
  const { reviews, isLoading } = useReviews(equipmentId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Reviews {reviews?.length ? `(${reviews.length})` : ''}
        </h3>
        {showAddButton && (
          <Button onClick={onAddReview} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Write Review
          </Button>
        )}
      </div>

      {!reviews || reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.003 8.003 0 01-7.93-6.84c-.042-.311-.07-.623-.07-.94a8 8 0 118 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
          <p className="text-muted-foreground">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
