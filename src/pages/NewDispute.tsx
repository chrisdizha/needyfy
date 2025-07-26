
import AuthenticatedNavbar from '@/components/layout/AuthenticatedNavbar';
import Footer from '@/components/layout/Footer';

const NewDispute = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AuthenticatedNavbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">File New Dispute</h1>
        <p>Dispute submission form will be displayed here.</p>
      </main>
      <Footer />
    </div>
  );
};

export default NewDispute;
