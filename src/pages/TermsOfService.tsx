import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Separator } from '@/components/ui/separator';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8 text-primary">Terms of Service</h1>
            <p className="text-center text-muted-foreground mb-12">
              Last updated: January 12, 2025
            </p>
            
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  By accessing and using Needyfy, you accept and agree to be bound by the terms and provision of this agreement.
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">2. Equipment Rental Services</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Needyfy provides a platform connecting equipment owners with renters. We facilitate transactions but are not responsible 
                  for the actual equipment, its condition, or the rental agreements between parties.
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>All equipment listings must be accurate and truthful</li>
                  <li>Renters must use equipment responsibly and return it in the same condition</li>
                  <li>Both parties are responsible for inspecting equipment before and after rental</li>
                  <li>Disputes should be resolved directly between renters and equipment owners</li>
                </ul>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">3. User Responsibilities</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Users are responsible for:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Providing accurate personal and contact information</li>
                  <li>Maintaining the security of their account credentials</li>
                  <li>Following all applicable laws and regulations</li>
                  <li>Treating other users with respect and professionalism</li>
                  <li>Reporting any issues or violations to Needyfy support</li>
                </ul>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">4. Payment and Fees</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Needyfy charges service fees for successful rentals. Payment processing is handled securely through our payment partners.
                  All fees are clearly disclosed before completing any transaction.
                </p>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">5. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Needyfy is not liable for any damages, injuries, or losses arising from the use of rented equipment or interactions 
                  between users. Our platform facilitates connections but does not guarantee the quality, safety, or condition of equipment.
                </p>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">6. Modifications to Terms</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Needyfy reserves the right to modify these terms at any time. Users will be notified of significant changes via email 
                  or platform notifications. Continued use of the service constitutes acceptance of modified terms.
                </p>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">7. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these Terms of Service, please contact us at{' '}
                  <a href="mailto:legal@needyfy.com" className="text-primary hover:underline">
                    legal@needyfy.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;