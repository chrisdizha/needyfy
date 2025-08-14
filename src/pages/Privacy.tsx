
import { useAuth } from '@/contexts/OptimizedAuthContext';

const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p className="mb-4">
          We take your privacy seriously. This policy describes how we collect, use, and protect your information.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
        <p className="mb-4">
          We collect information you provide directly to us, such as when you create an account or contact us.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">2. How We Use Your Information</h2>
        <p className="mb-4">
          We use the information we collect to provide, maintain, and improve our services.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">3. Information Sharing</h2>
        <p className="mb-4">
          We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
