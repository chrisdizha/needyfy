
import AuthenticatedNavbar from '@/components/layout/AuthenticatedNavbar';
import Footer from '@/components/layout/Footer';

const EditDispute = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AuthenticatedNavbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Edit Dispute</h1>
        <p>Dispute editing form will be displayed here.</p>
      </main>
      <Footer />
    </div>
  );
};

export default EditDispute;
