
import { Toaster } from "@/components/ui/sonner";
import EquipmentForm from "@/components/equipment/EquipmentForm";
import { Wrench, ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ListEquipment = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
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
                <BreadcrumbPage>List Equipment</BreadcrumbPage>
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

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-needyfy-darkgray">
            List Your Equipment
          </h1>
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

        {/* Quick Links Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Need help getting started?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/provider-resources">
              <Button variant="outline">Provider Resources</Button>
            </Link>
            <Link to="/provider-guidelines">
              <Button variant="outline">Guidelines</Button>
            </Link>
            <Link to="/provider-faq">
              <Button variant="outline">FAQ</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default ListEquipment;
