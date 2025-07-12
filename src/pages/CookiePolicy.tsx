import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Separator } from '@/components/ui/separator';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8 text-primary">Cookie Policy</h1>
            <p className="text-center text-muted-foreground mb-12">
              Last updated: January 12, 2025
            </p>
            
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">1. What Are Cookies</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Cookies are small text files that are stored on your device when you visit our website. They help us provide 
                  you with a better experience by remembering your preferences and improving our services.
                </p>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">2. Types of Cookies We Use</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-3 text-primary">Essential Cookies</h3>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    These cookies are necessary for the website to function properly and cannot be disabled:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Authentication and security cookies</li>
                    <li>Session management cookies</li>
                    <li>Shopping cart and booking functionality</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-3 text-primary">Functional Cookies</h3>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    These cookies enhance your experience by remembering your preferences:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Language and region preferences</li>
                    <li>Display settings and customizations</li>
                    <li>Previously viewed equipment and searches</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-3 text-primary">Analytics Cookies</h3>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    These cookies help us understand how you use our website:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Page views and navigation patterns</li>
                    <li>Time spent on different sections</li>
                    <li>Popular equipment categories and features</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-3 text-primary">Marketing Cookies</h3>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    These cookies are used to show you relevant advertisements:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Personalized equipment recommendations</li>
                    <li>Targeted promotions and offers</li>
                    <li>Social media integration</li>
                  </ul>
                </div>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">3. Third-Party Cookies</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may use third-party services that set their own cookies:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                  <li><strong>Stripe:</strong> For secure payment processing</li>
                  <li><strong>Social Media Platforms:</strong> For social sharing and authentication</li>
                  <li><strong>Customer Support Tools:</strong> For live chat and support services</li>
                </ul>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">4. Managing Your Cookie Preferences</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You can control and manage cookies in several ways:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies</li>
                  <li><strong>Cookie Banner:</strong> Use our cookie preference center when you first visit</li>
                  <li><strong>Opt-out Links:</strong> Use opt-out mechanisms provided by third-party services</li>
                  <li><strong>Account Settings:</strong> Manage marketing preferences in your account</li>
                </ul>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">5. Impact of Disabling Cookies</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Disabling certain cookies may affect your experience:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>You may need to re-enter information frequently</li>
                  <li>Some features may not work as expected</li>
                  <li>Personalized recommendations may not be available</li>
                  <li>Your preferences may not be saved between visits</li>
                </ul>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">6. Updates to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may update this Cookie Policy to reflect changes in our practices or for legal compliance. 
                  We will notify you of any significant changes through our website or by email.
                </p>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">7. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about our use of cookies, please contact us at{' '}
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

export default CookiePolicy;