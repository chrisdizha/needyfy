
import AuthenticatedNavbar from '@/components/layout/AuthenticatedNavbar';
import Footer from '@/components/layout/Footer';
import EquipmentForm from '@/components/equipment/EquipmentForm';

const NewEquipment = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AuthenticatedNavbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">List New Equipment</h1>
        <EquipmentForm />
      </main>
      <Footer />
    </div>
  );
};

export default NewEquipment;
