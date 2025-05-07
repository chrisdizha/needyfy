
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Categories = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Equipment Categories</h1>
        <p className="text-gray-600 mb-8">
          Browse through our wide range of equipment categories to find what you need.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder category cards */}
          {['Construction', 'Gardening', 'Painting', 'Cleaning', 'Moving', 'Events'].map((category) => (
            <div key={category} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              <h3 className="text-xl font-semibold mb-2">{category}</h3>
              <p className="text-gray-600 mb-4">Find high-quality {category.toLowerCase()} equipment for rent.</p>
              <a href="#" className="text-needyfy-blue hover:underline">Browse {category} →</a>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
