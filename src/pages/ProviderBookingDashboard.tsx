
import ProviderBookingList from "@/components/provider/ProviderBookingList";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ProviderAnalyticsOverview from "@/components/provider/ProviderAnalyticsOverview";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ProviderBookingDashboard = () => (
  <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-white to-gray-50">
    {/* Navigation Header */}
    <div className="flex items-center justify-between mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Provider Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <Link to="/">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </Link>
    </div>

    <ProviderAnalyticsOverview />
    <Card>
      <CardHeader>
        <CardTitle>Provider Booking Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <ProviderBookingList />
      </CardContent>
    </Card>
  </div>
);

export default ProviderBookingDashboard;
