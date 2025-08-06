
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Navigate } from 'react-router-dom';
import AuthenticatedNavbar from '@/components/layout/AuthenticatedNavbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewsList from '@/components/reviews/ReviewsList';
import ReviewModal from '@/components/reviews/ReviewModal';

const Reviews = () => {
  const { user, loading } = useAuth();
  const [showReviewModal, setShowReviewModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <AuthenticatedNavbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="flex items-center gap-1">
                      <Home className="h-4 w-4" />
                      Home
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Reviews</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Reviews & Feedback
            </h1>
            <p className="text-muted-foreground">
              Share your experience and read what others have to say
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Write Review Section */}
            <div className="lg:col-span-1">
              <ReviewForm onSuccess={() => window.location.reload()} />
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2">
              <ReviewsList 
                showAddButton={true}
                onAddReview={() => setShowReviewModal(true)}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <ReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
      />
    </div>
  );
};

export default Reviews;
