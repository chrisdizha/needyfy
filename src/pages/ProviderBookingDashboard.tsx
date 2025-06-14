
import ProviderBookingList from "@/components/provider/ProviderBookingList";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ProviderBookingDashboard = () => (
  <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
    <Navbar />
    <main className="flex-grow container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Provider Booking Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <ProviderBookingList />
        </CardContent>
      </Card>
    </main>
    <Footer />
  </div>
);

export default ProviderBookingDashboard;
