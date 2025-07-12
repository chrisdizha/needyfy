import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Separator } from '@/components/ui/separator';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8 text-primary">Privacy Policy</h1>
            <p className="text-center text-muted-foreground mb-12">
              Last updated: January 12, 2025
            </p>
            
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">1. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect information you provide directly to us, such as when you create an account, list equipment, 
                  make a rental, or contact us for support.
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Personal information (name, email, phone number)</li>
                  <li>Account credentials and profile information</li>
                  <li>Equipment listings and rental history</li>
                  <li>Payment and billing information</li>
                  <li>Communications with other users and support</li>
                </ul>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">2. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the information we collect to provide, maintain, and improve our services:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>To create and manage your account</li>
                  <li>To process equipment rentals and payments</li>
                  <li>To communicate with you about your account and transactions</li>
                  <li>To provide customer support</li>
                  <li>To prevent fraud and ensure platform security</li>
                  <li>To improve our services and develop new features</li>
                </ul>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">3. Information Sharing</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share information in limited circumstances:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>With other users as necessary to facilitate rentals</li>
                  <li>With service providers who help us operate our platform</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In connection with a business transfer or acquisition</li>
                </ul>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">4. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We implement appropriate security measures to protect your personal information against unauthorized access, 
                  alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.
                </p>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">5. Your Privacy Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request a copy of your data</li>
                  <li>Lodge a complaint with data protection authorities</li>
                </ul>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">6. Cookies and Tracking</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, and improve our services. 
                  You can control cookie settings through your browser preferences.
                </p>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">7. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting 
                  the new policy on this page and updating the "last updated" date.
                </p>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">8. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at{' '}
                  <a href="mailto:privacy@needyfy.com" className="text-primary hover:underline">
                    privacy@needyfy.com
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

export default PrivacyPolicy;