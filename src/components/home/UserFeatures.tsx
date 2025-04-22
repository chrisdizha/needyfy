
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Calendar, CreditCard, MessageSquare, Bell, MapPin, Star, Shield } from "lucide-react";

const UserFeatures = () => {
  const features = [
    {
      title: "Advanced Search",
      description: "Find exactly what you need with powerful filters by category, price, and location.",
      icon: <Search className="h-10 w-10 text-needyfy-blue p-2 bg-blue-100 rounded-full" />
    },
    {
      title: "Easy Booking",
      description: "Book equipment with real-time availability and flexible rental options.",
      icon: <Calendar className="h-10 w-10 text-needyfy-blue p-2 bg-blue-100 rounded-full" />
    },
    {
      title: "Secure Payments",
      description: "Pay securely with multiple payment options and optional security deposits.",
      icon: <CreditCard className="h-10 w-10 text-needyfy-blue p-2 bg-blue-100 rounded-full" />
    },
    {
      title: "In-App Messaging",
      description: "Chat directly with equipment owners to ask questions before booking.",
      icon: <MessageSquare className="h-10 w-10 text-needyfy-blue p-2 bg-blue-100 rounded-full" />
    },
    {
      title: "Smart Notifications",
      description: "Get real-time updates on bookings, pickups, and special promotions.",
      icon: <Bell className="h-10 w-10 text-needyfy-blue p-2 bg-blue-100 rounded-full" />
    },
    {
      title: "Local Discovery",
      description: "Discover equipment available near you with our interactive map view.",
      icon: <MapPin className="h-10 w-10 text-needyfy-blue p-2 bg-blue-100 rounded-full" />
    },
    {
      title: "Ratings & Reviews",
      description: "Make informed decisions based on reviews from other renters.",
      icon: <Star className="h-10 w-10 text-needyfy-blue p-2 bg-blue-100 rounded-full" />
    },
    {
      title: "Trust & Safety",
      description: "ID verification and secure transactions for peace of mind.",
      icon: <Shield className="h-10 w-10 text-needyfy-blue p-2 bg-blue-100 rounded-full" />
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Renters Choose Needyfy</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock access to thousands of items without the hassle of ownership. Rent only what you need, when you need it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-col items-center pb-2">
                {feature.icon}
                <CardTitle className="mt-4 text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600">
                <p>{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserFeatures;
