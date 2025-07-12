
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { FileText } from "lucide-react";
import { ConditionVerificationModal } from "@/components/equipment/ConditionVerificationModal";

interface BookingActionsProps {
  booking: {
    id: string;
    status: string;
    equipment_id: string;
    equipment_title: string | null;
  };
  onUpdateStatus: (status: string) => void;
}

/**
 * Providers can accept (confirm) or reject (cancel) a booking if status is pending.
 */
const BookingActions = ({ booking, onUpdateStatus }: BookingActionsProps) => {
  const [showConditionForm, setShowConditionForm] = useState(false);
  const handleUpdate = async (newStatus: "confirmed" | "cancelled") => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", booking.id);
    if (error) {
      toast.error(`Error updating booking: ${error.message}`);
    } else {
      toast.success(`Booking ${newStatus === "confirmed" ? "accepted" : "rejected"}.`);
      onUpdateStatus(newStatus);
    }
  };

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {booking.status === "pending" && (
          <>
            <Button
              variant="default"
              onClick={() => handleUpdate("confirmed")}
            >
              Accept
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleUpdate("cancelled")}
            >
              Reject
            </Button>
          </>
        )}
        
        {(booking.status === "confirmed" || booking.status === "completed") && (
          <Button
            variant="outline"
            onClick={() => setShowConditionForm(true)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Condition Form
          </Button>
        )}
      </div>

      <ConditionVerificationModal
        isOpen={showConditionForm}
        onClose={() => setShowConditionForm(false)}
        bookingId={booking.id}
        equipmentId={booking.equipment_id}
        equipmentTitle={booking.equipment_title || 'Equipment'}
        handoverType="pickup"
        userRole="provider"
      />
    </>
  );
};

export default BookingActions;
