
import AuthenticatedNavbar from '@/components/layout/AuthenticatedNavbar';
import Footer from '@/components/layout/Footer';

const DisputeDetails = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AuthenticatedNavbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dispute Details</h1>
        <p>Dispute details will be displayed here.</p>
      </main>
      <Footer />
    </div>
  );
};

export default DisputeDetails;
