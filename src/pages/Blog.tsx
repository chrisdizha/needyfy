import React, { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Blog: React.FC = () => {
  useEffect(() => {
    document.title = 'Equipment Rental Tips & Resources | Needyfy Blog';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      m.setAttribute('content', 'Needyfy blog with safety tips, maintenance advice, and best practices for renting and listing equipment.');
      document.head.appendChild(m);
    } else {
      metaDesc.setAttribute('content', 'Needyfy blog with safety tips, maintenance advice, and best practices for renting and listing equipment.');
    }
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', window.location.origin + '/blog');
    if (!canonical.parentNode) document.head.appendChild(canonical);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <header className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold">Equipment Rental Tips & Resources</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">Best practices for safe renting, equipment care, and getting the most from Needyfy.</p>
          </div>
        </header>

        <section className="container mx-auto px-4 py-10 grid gap-6 md:grid-cols-3">
          <article className="p-5 border rounded-lg bg-background">
            <h2 className="text-xl font-semibold">Safety Checklist for Renters</h2>
            <p className="text-sm text-muted-foreground mt-2">Inspect equipment, verify providers, and document condition to avoid disputes.</p>
            <ul className="list-disc pl-5 mt-4 text-sm space-y-1">
              <li>Verify provider identity and listing details</li>
              <li>Capture photos at pickup and return</li>
              <li>Use our condition verification form</li>
            </ul>
          </article>

          <article className="p-5 border rounded-lg bg-background">
            <h2 className="text-xl font-semibold">Maintenance Tips for Providers</h2>
            <p className="text-sm text-muted-foreground mt-2">Keep your equipment in top shape to earn better reviews and higher demand.</p>
            <ul className="list-disc pl-5 mt-4 text-sm space-y-1">
              <li>Follow a regular inspection schedule</li>
              <li>Replace wear parts proactively</li>
              <li>Provide clear usage instructions</li>
            </ul>
          </article>

          <article className="p-5 border rounded-lg bg-background">
            <h2 className="text-xl font-semibold">How to Get ID-Verified</h2>
            <p className="text-sm text-muted-foreground mt-2">Build trust by completing verification for the Verified badge on your profile.</p>
            <ul className="list-disc pl-5 mt-4 text-sm space-y-1">
              <li>Complete your profile information</li>
              <li>Submit required documents securely</li>
              <li>Await quick review for badge</li>
            </ul>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
