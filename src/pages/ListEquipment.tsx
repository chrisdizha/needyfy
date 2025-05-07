
import { Toaster } from "@/components/ui/sonner";
import EquipmentForm from "@/components/equipment/EquipmentForm";

const ListEquipment = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">List Your Equipment</h1>
      <EquipmentForm />
      <Toaster />
    </div>
  );
};

export default ListEquipment;
