
import { useAuth } from '@/contexts/OptimizedAuthContext';

const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <div className="prose max-w-none">
        <p className="mb-4">
          Welcome to our equipment rental platform. By using our service, you agree to these terms.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">2. Equipment Rental</h2>
        <p className="mb-4">
          All equipment rentals are subject to availability and the terms set by individual equipment providers.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">3. User Responsibilities</h2>
        <p className="mb-4">
          Users are responsible for the proper care and timely return of rented equipment.
        </p>
      </div>
    </div>
  );
};

export default Terms;
