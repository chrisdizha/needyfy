
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Hammer, 
  Camera, 
  Home, 
  Zap, 
  Car, 
  Wrench,
  Gamepad2,
  Music,
  ChefHat,
  Briefcase,
  Heart,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';

const Categories = () => {
  useSEO({
    title: 'Equipment Categories - Find Tools & Equipment to Rent | Needyfy',
    description: 'Browse our comprehensive categories of rental equipment including construction tools, photography gear, home & garden, electronics, and more.',
    keywords: ['equipment categories', 'tool rental', 'construction equipment', 'photography gear', 'home improvement'],
    canonical: `${window.location.origin}/categories`
  });

  const categories = [
    {
      id: 'construction',
      name: 'Construction',
      description: 'Heavy machinery, power tools, and construction equipment',
      icon: <Hammer className="h-8 w-8" />,
      count: 245,
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356ddc?auto=format&fit=crop&w=400&q=80',
      color: 'bg-orange-500'
    },
    {
      id: 'photography',
      name: 'Photography',
      description: 'Cameras, lenses, lighting, and video equipment',
      icon: <Camera className="h-8 w-8" />,
      count: 189,
      image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64b?auto=format&fit=crop&w=400&q=80',
      color: 'bg-purple-500'
    },
    {
      id: 'home-garden',
      name: 'Home & Garden',
      description: 'Lawn care, cleaning, and home improvement tools',
      icon: <Home className="h-8 w-8" />,
      count: 312,
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80',
      color: 'bg-green-500'
    },
    {
      id: 'electronics',
      name: 'Electronics',
      description: 'Audio equipment, projectors, and tech gadgets',
      icon: <Zap className="h-8 w-8" />,
      count: 156,
      image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80',
      color: 'bg-blue-500'
    },
    {
      id: 'automotive',
      name: 'Automotive',
      description: 'Car tools, diagnostic equipment, and garage tools',
      icon: <Car className="h-8 w-8" />,
      count: 98,
      image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80',
      color: 'bg-red-500'
    },
    {
      id: 'industrial',
      name: 'Industrial',
      description: 'Specialized industrial and manufacturing equipment',
      icon: <Wrench className="h-8 w-8" />,
      count: 87,
      image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=400&q=80',
      color: 'bg-gray-500'
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      description: 'Party supplies, gaming equipment, and event gear',
      icon: <Gamepad2 className="h-8 w-8" />,
      count: 134,
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
      color: 'bg-pink-500'
    },
    {
      id: 'music',
      name: 'Music',
      description: 'Instruments, sound systems, and recording equipment',
      icon: <Music className="h-8 w-8" />,
      count: 76,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
      color: 'bg-indigo-500'
    },
    {
      id: 'food-beverage',
      name: 'Food & Beverage',
      description: 'Commercial kitchen equipment and catering supplies',
      icon: <ChefHat className="h-8 w-8" />,
      count: 65,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80',
      color: 'bg-yellow-500'
    },
    {
      id: 'office-business',
      name: 'Office & Business',
      description: 'Office equipment, printers, and business tools',
      icon: <Briefcase className="h-8 w-8" />,
      count: 92,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
      color: 'bg-slate-500'
    },
    {
      id: 'health-fitness',
      name: 'Health & Fitness',
      description: 'Exercise equipment and health monitoring devices',
      icon: <Heart className="h-8 w-8" />,
      count: 54,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
      color: 'bg-rose-500'
    },
    {
      id: 'education',
      name: 'Education',
      description: 'Educational equipment and learning tools',
      icon: <GraduationCap className="h-8 w-8" />,
      count: 43,
      image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=400&q=80',
      color: 'bg-teal-500'
    }
  ];

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Equipment Categories</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover thousands of tools and equipment available for rent across various categories. 
              Find exactly what you need for your next project.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-white/90 text-foreground">
                      {category.count} items
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <div className={`p-3 rounded-full ${category.color} text-white`}>
                      {category.icon}
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild className="w-full">
                    <Link to={`/equipment?category=${category.id}`}>
                      Browse {category.name}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Can't Find What You Need?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're constantly adding new categories and equipment. If you have something specific in mind, 
            let us know and we'll help you find it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/contact">Request Equipment</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/list-equipment">List Your Equipment</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Categories;
