import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConditionVerificationForm } from './ConditionVerificationForm';

interface ConditionVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  equipmentId: string;
  equipmentTitle: string;
  handoverType: 'pickup' | 'return';
  userRole: 'renter' | 'provider';
}

export const ConditionVerificationModal: React.FC<ConditionVerificationModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  equipmentId,
  equipmentTitle,
  handoverType,
  userRole
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Equipment Condition Verification</DialogTitle>
          <DialogDescription>
            Document the condition of the equipment during {handoverType === 'pickup' ? 'pickup' : 'return'}.
            Both parties should review and sign this form.
          </DialogDescription>
        </DialogHeader>
        
        <ConditionVerificationForm
          bookingId={bookingId}
          equipmentId={equipmentId}
          equipmentTitle={equipmentTitle}
          handoverType={handoverType}
          userRole={userRole}
          onComplete={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};