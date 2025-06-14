
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookingActionsProps {
  booking: {
    id: string;
    status: string;
  };
  onUpdateStatus: (status: string) => void;
}

/**
 * Providers can accept (confirm) or reject (cancel) a booking if status is pending.
 */
const BookingActions = ({ booking, onUpdateStatus }: BookingActionsProps) => {
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

  if (booking.status !== "pending") {
    return null;
  }

  return (
    <div className="flex gap-2">
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
    </div>
  );
};

export default BookingActions;
