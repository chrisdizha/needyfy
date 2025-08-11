
import { useAuth } from '@/contexts/OptimizedAuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Equipment = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Equipment Listings</h1>
        <p>Equipment listings will be displayed here.</p>
      </main>
      <Footer />
    </div>
  );
};

export default Equipment;
