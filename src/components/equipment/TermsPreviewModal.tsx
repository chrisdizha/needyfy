
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TermsPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  terms: string;
}

const TermsPreviewModal = ({ isOpen, onClose, terms }: TermsPreviewModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancellation Policy Preview</DialogTitle>
          <DialogDescription>
            This is how your cancellation policy will appear to renters.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 my-4 border rounded-md bg-muted text-sm max-h-[50vh] overflow-y-auto">
          {terms ? (
            <p style={{ whiteSpace: 'pre-wrap' }}>{terms}</p>
          ) : (
            <p className="text-muted-foreground">No policy entered yet.</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsPreviewModal;
