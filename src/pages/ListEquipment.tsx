
import { Toaster } from "@/components/ui/sonner";
import EquipmentForm from "@/components/equipment/EquipmentForm";
import { Wrench, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ListEquipment = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-needyfy-darkgray">
            List Your Equipment
          </h1>
          <div className="mb-4">
            <Link
              to="/"
              className="inline-flex items-center text-needyfy-blue hover:text-needyfy-darkgray text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
          <div className="flex items-center justify-center mb-2">
            <div className="bg-needyfy-orange h-1 w-16 rounded-full mr-3"></div>
            <p className="tagline-primary">List. Rent. Earn.</p>
            <div className="bg-needyfy-orange h-1 w-16 rounded-full ml-3"></div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Got stuff lying around? Turn your idle equipment into income by listing it on Needyfy.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-needyfy-blue/10 rounded-full">
              <Wrench className="h-8 w-8 text-needyfy-blue" />
            </div>
          </div>
          <EquipmentForm />
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default ListEquipment;
