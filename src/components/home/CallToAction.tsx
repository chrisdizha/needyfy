
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section className="relative py-20 bg-needyfy-blue text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Rent Equipment */}
          <div className="text-center md:text-left bg-white/10 rounded-xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-4">Need Equipment?</h3>
            <p className="mb-6 text-white/80">
              Browse thousands of items available for rent from local providers. 
              Find exactly what you need without the high cost of buying.
            </p>
            <Button variant="secondary" size="lg" className="bg-white text-needyfy-blue hover:bg-gray-100" asChild>
              <Link to="/categories">Rent Equipment</Link>
            </Button>
          </div>
          
          {/* List Equipment */}
          <div className="text-center md:text-left bg-white/10 rounded-xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-4">Own Equipment?</h3>
            <p className="mb-6 text-white/80">
              Turn your idle equipment into income. List your items on Needyfy 
              and start earning money from rentals.
            </p>
            <Button variant="secondary" size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90" asChild>
              <Link to="/list-equipment">List Your Equipment</Link>
            </Button>
          </div>
        </div>
        
        <div className="text-center mt-16">
          <p className="text-xl font-semibold mb-3">Join Our Growing Community</p>
          <div className="flex items-center justify-center space-x-8">
            <div>
              <p className="text-3xl font-bold">5,000+</p>
              <p className="text-white/80">Equipment Items</p>
            </div>
            <div>
              <p className="text-3xl font-bold">2,500+</p>
              <p className="text-white/80">Providers</p>
            </div>
            <div>
              <p className="text-3xl font-bold">15,000+</p>
              <p className="text-white/80">Happy Customers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
