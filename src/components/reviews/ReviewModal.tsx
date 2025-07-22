
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ReviewForm from './ReviewForm';

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentId?: string;
  bookingId?: string;
  equipmentTitle?: string;
}

const ReviewModal = ({ 
  open, 
  onOpenChange, 
  equipmentId, 
  bookingId, 
  equipmentTitle 
}: ReviewModalProps) => {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Review {equipmentTitle || 'Equipment'}
          </DialogTitle>
        </DialogHeader>
        <ReviewForm
          equipmentId={equipmentId}
          bookingId={bookingId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
