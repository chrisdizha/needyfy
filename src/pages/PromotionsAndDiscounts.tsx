
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Placeholder type
interface Promotion {
  id: string;
  title: string;
  description: string;
  percentOff: number;
  active: boolean;
}

const initialPromotions: Promotion[] = [
  {
    id: "summer24",
    title: "Summer 2024 Launch Discount",
    description: "10% off all rentals in June & July!",
    percentOff: 10,
    active: true,
  },
];

export default function PromotionsAndDiscounts() {
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  // In a true app, you would fetch & mutate promotions from your backend

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">Promotions & Discounts</h1>
        <p className="text-muted-foreground mb-8">
          Manage your site-wide and equipment-specific promotions here. These help attract more bookings.
        </p>
        <div className="mb-8">
          <h2 className="font-semibold mb-2">Current Promotions</h2>
          <div className="space-y-4">
            {promotions.length === 0 && (
              <p className="text-sm text-muted-foreground">No promotions set yet.</p>
            )}
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className={`border rounded-lg p-4 flex justify-between items-center ${promo.active ? "bg-green-50" : "bg-gray-50"}`}
              >
                <div>
                  <div className="font-semibold">{promo.title}</div>
                  <div className="text-sm">{promo.description}</div>
                  <div className="text-xs text-gray-500">Discount: {promo.percentOff}%</div>
                  <div className={`text-xs font-medium ${promo.active ? "text-green-600" : "text-gray-400"}`}>{promo.active ? "Active" : "Inactive"}</div>
                </div>
                <Button size="sm" variant={promo.active ? "secondary" : "default"}>
                  {promo.active ? "Disable" : "Enable"}
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Add a New Promotion</h2>
          <div className="bg-white rounded p-4 border flex items-end gap-3">
            {/* In a real app, replace below with a form and logic */}
            <Button disabled variant="outline">Coming Soon</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
