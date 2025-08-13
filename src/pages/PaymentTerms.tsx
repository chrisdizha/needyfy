
import React, { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useSEO } from '@/hooks/useSEO';

const PaymentTerms: React.FC = () => {
  useSEO({
    title: 'Payment Terms of Service | Needyfy - Secure Equipment Rental Payments',
    description: 'Needyfy Payment Terms: Learn about our secure payment processing, fees, payouts, refunds, escrow services, and dispute resolution for equipment rentals.',
    keywords: [
      'payment terms',
      'payment policy',
      'rental payments',
      'escrow',
      'refunds',
      'fees',
      'secure payments',
      'needyfy'
    ],
    ogTitle: 'Needyfy Payment Terms - Secure Rental Payments',
    ogDescription: 'Comprehensive payment terms covering fees, payouts, refunds, and secure escrow services for equipment rentals.',
    canonical: `${window.location.origin}/payment-terms`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Payment Terms of Service",
      "description": "Payment terms and conditions for Needyfy equipment rental platform",
      "url": window.location.href,
      "isPartOf": {
        "@type": "WebSite",
        "name": "Needyfy",
        "url": window.location.origin
      }
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <header className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold">Payment Terms of Service</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">These Payment Terms govern payments, escrow, fees, and payouts on Needyfy.</p>
          </div>
        </header>

        <section className="container mx-auto px-4 py-10 space-y-6">
          <article className="prose prose-sm max-w-none">
            <h2>1. Payments & Escrow</h2>
            <p>Payments are processed via trusted third parties (e.g., Stripe, PayPal). Funds for provider earnings may be held in escrow until rental completion according to your booking's release schedule.</p>

            <h2>2. Fees</h2>
            <p>Platform service fees apply to both renters and providers and are disclosed at checkout. Fees help cover secure payments, insurance, and platform operations.</p>

            <h2>3. Refunds & Cancellations</h2>
            <p>Refund eligibility depends on booking status, cancellation timing, and the equipment's condition. Certain fees may be non-refundable.</p>

            <h2>4. Chargebacks & Disputes</h2>
            <p>If a chargeback is filed, we may suspend payouts while the matter is investigated. Use in-app <strong>Disputes</strong> and <strong>Messages</strong> for faster resolution.</p>

            <h2>5. Payouts to Providers</h2>
            <p>Payouts follow the escrow release schedule and your selected payout method. Ensure your profile and payment details are accurate to avoid delays.</p>

            <h2>6. Fraud & Abuse</h2>
            <p>We reserve the right to suspend accounts for suspected fraud, abuse, or policy violations. Such actions may affect pending payouts.</p>

            <h2>7. Changes</h2>
            <p>We may update these terms periodically. Continued use of Needyfy after updates constitutes acceptance of the revised terms.</p>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentTerms;
