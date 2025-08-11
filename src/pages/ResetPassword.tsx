
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const ResetPassword = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Reset Password</h1>
        <p>Password reset form will be displayed here.</p>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
