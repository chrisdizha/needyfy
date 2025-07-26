
import AuthenticatedNavbar from '@/components/layout/AuthenticatedNavbar';
import Footer from '@/components/layout/Footer';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AuthenticatedNavbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Forgot Password</h1>
        <p>Password reset form will be displayed here.</p>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
