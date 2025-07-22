
import { useFeaturedReviews } from '@/hooks/useReviews';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  rating: number;
  image: string;
}

const Testimonial = ({ quote, author, role, rating, image }: TestimonialProps) => (
  <Card className="h-full needyfy-shadow">
    <CardContent className="p-6 flex flex-col h-full">
      {/* Rating */}
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        ))}
      </div>
      
      {/* Quote */}
      <p className="text-gray-700 flex-grow mb-6 italic">"{quote}"</p>
      
      {/* Author */}
      <div className="flex items-center">
        <img 
          src={image} 
          alt={author} 
          className="w-12 h-12 rounded-full object-cover mr-4" 
        />
        <div>
          <p className="font-semibold">{author}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Testimonials = () => {
  const { data: reviews, isLoading } = useFeaturedReviews();

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">What People Are Saying</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers and equipment providers
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-full animate-pulse">
                <CardContent className="p-6">
                  <div className="flex mb-4 space-x-1">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="h-5 w-5 bg-gray-300 rounded"></div>
                    ))}
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <Testimonial 
                key={review.id} 
                quote={review.content}
                author={review.profiles?.full_name || 'Anonymous User'}
                role="Verified Renter"
                rating={review.rating}
                image={review.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.profiles?.full_name || 'anonymous'}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.003 8.003 0 01-7.93-6.84c-.042-.311-.07-.623-.07-.94a8 8 0 118 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500">Be among the first to experience great equipment rentals!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
