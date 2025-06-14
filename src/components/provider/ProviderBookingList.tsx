
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import BookingActions from "./BookingActions";
import BookingMessages from "./BookingMessages";
import { Badge } from "@/components/ui/badge";

interface ProviderBooking {
  id: string;
  user_id: string | null;
  owner_id: string | null;
  equipment_title: string | null;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
}

const ProviderBookingList = () => {
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerId, setOwnerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Get provider user id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setBookings([]);
        setLoading(false);
        return;
      }
      setOwnerId(user.id);
      // Load provider's bookings
      const { data, error } = await supabase
        .from("bookings")
        .select("id, user_id, owner_id, equipment_title, start_date, end_date, total_price, status")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      setBookings(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading bookings...</div>;

  if (!ownerId || bookings.length === 0)
    return (
      <div className="p-8 text-center border rounded-md">
        No incoming booking requests for your equipment.
      </div>
    );

  return (
    <div className="space-y-8">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row md:justify-between items-start gap-4">
              <div>
                <div>
                  <span className="font-bold">Equipment:</span>{" "}
                  {booking.equipment_title || <em>Untitled</em>}
                </div>
                <div>
                  <span className="font-bold">Dates:</span>{" "}
                  {new Date(booking.start_date).toLocaleDateString()}–{new Date(booking.end_date).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-bold">Price:</span> ${booking.total_price / 100}
                </div>
                <div>
                  <span className="font-bold">Status:</span>{" "}
                  <Badge variant="outline">{booking.status}</Badge>
                </div>
              </div>
              <BookingActions
                booking={booking}
                onUpdateStatus={(status) =>
                  setBookings(bs => bs.map(b => b.id === booking.id ? { ...b, status } : b))
                }
              />
            </div>
            <div className="mt-4">
              <BookingMessages bookingId={booking.id} ownerId={ownerId} userId={booking.user_id} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProviderBookingList;
