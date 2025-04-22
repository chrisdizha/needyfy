
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

const testimonials = [
  {
    quote: "Needyfy made it incredibly easy to rent a truck for our move. We saved so much money compared to traditional rental companies.",
    author: "Sarah Johnson",
    role: "Homeowner",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    quote: "As a small construction business, we can now access equipment that was previously too expensive to purchase. Game-changer!",
    author: "Michael Thompson",
    role: "Construction Manager",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    quote: "My excavator was sitting idle most of the time. Now it earns money when I'm not using it. The extra income is substantial.",
    author: "David Rodriguez",
    role: "Equipment Owner",
    rating: 4,
    image: "https://randomuser.me/api/portraits/men/75.jpg"
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">What People Are Saying</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers and equipment providers
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
