
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-16">
        <div className="text-center px-4">
          <div className="mb-8">
            <div className="bg-needyfy-blue text-white font-bold p-4 rounded-full text-5xl inline-block">
              404
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Page Not Found</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
            We couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link to="/">Go Back Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/categories">Browse Equipment</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
