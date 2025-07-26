
import AuthenticatedNavbar from '@/components/layout/AuthenticatedNavbar';
import Footer from '@/components/layout/Footer';

const Equipment = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AuthenticatedNavbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Equipment Listings</h1>
        <p>Equipment listings will be displayed here.</p>
      </main>
      <Footer />
    </div>
  );
};

export default Equipment;
