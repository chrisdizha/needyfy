
import AuthenticatedNavbar from '@/components/layout/AuthenticatedNavbar';
import Footer from '@/components/layout/Footer';

const EquipmentDetails = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AuthenticatedNavbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Equipment Details</h1>
        <p>Equipment details will be displayed here.</p>
      </main>
      <Footer />
    </div>
  );
};

export default EquipmentDetails;
