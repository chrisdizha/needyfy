
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Shield, DollarSign, Clock } from 'lucide-react';
import OptimizedImage from '@/components/performance/ImageOptimizer';
import { usePrefetch } from '@/hooks/usePrefetch';

const OptimizedHeroSection = () => {
  const { prefetchOnHover } = usePrefetch();

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Rent Anything,
                <span className="text-blue-600 block">Anytime</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Access thousands of items from your neighbors. From power tools to party supplies, 
                find what you need without buying.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" aria-hidden="true" />
                <span>Verified Items</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" aria-hidden="true" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" aria-hidden="true" />
                <span>24/7 Support</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/equipment" 
                className="flex-1 sm:flex-initial"
                {...prefetchOnHover('Equipment')}
              >
                <Button size="lg" className="w-full sm:w-auto px-8 py-3 text-lg">
                  <Search className="mr-2 h-5 w-5" aria-hidden="true" />
                  Start Browsing
                </Button>
              </Link>
              <Link 
                to="/list-equipment" 
                className="flex-1 sm:flex-initial"
                {...prefetchOnHover('ListEquipment')}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-3 text-lg border-2 hover:bg-blue-50"
                >
                  <DollarSign className="mr-2 h-5 w-5" aria-hidden="true" />
                  Earn Money
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative lg:h-96">
            <OptimizedImage
              src="/lovable-uploads/49fb9ab1-3945-4c06-8d58-a45f786e28fd.png"
              alt="People sharing and renting various items including tools, cameras, and outdoor equipment"
              className="w-full h-full rounded-2xl shadow-2xl"
              aspectRatio="16/10"
              priority={true}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            
            {/* Floating Stats */}
            <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg border">
              <div className="text-2xl font-bold text-blue-600">10k+</div>
              <div className="text-sm text-gray-600">Items Available</div>
            </div>
            
            <div className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg border">
              <div className="text-2xl font-bold text-green-600">98%</div>
              <div className="text-sm text-gray-600">Happy Renters</div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 -z-10 opacity-20">
        <div className="w-96 h-96 bg-blue-200 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </section>
  );
};

export default OptimizedHeroSection;
