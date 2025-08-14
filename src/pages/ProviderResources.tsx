
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Award, HelpCircle, List, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ProviderResources = () => {
  const resources = [
    {
      title: "Provider Guidelines",
      description: "Important rules and standards for equipment providers.",
      link: "/provider-guidelines",
      icon: <FileText className="h-8 w-8 text-needyfy-blue" />
    },
    {
      title: "Provider FAQ",
      description: "Answers to common questions from our providers.",
      link: "/provider-faq",
      icon: <HelpCircle className="h-8 w-8 text-needyfy-blue" />
    },
    {
      title: "Success Stories",
      description: "Learn from other providers who are succeeding on Needyfy.",
      link: "/success-stories",
      icon: <Award className="h-8 w-8 text-needyfy-blue" />
    },
    {
      title: "List Your Equipment",
      description: "Ready to start earning? List your equipment now.",
      link: "/list-equipment",
      icon: <List className="h-8 w-8 text-needyfy-blue" />
    }
  ];

  const relatedLinks = [
    { title: "How It Works", link: "/how-it-works" },
    { title: "Pricing", link: "/pricing" },
    { title: "Contact Support", link: "/contact" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
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
              <BreadcrumbPage>Provider Resources</BreadcrumbPage>
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
        <h1 className="text-3xl font-bold mb-2">Provider Resources</h1>
        <p className="text-gray-500 mb-4">Helpful resources to maximize your success as an equipment provider</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {resources.map((resource, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              {resource.icon}
              <div>
                <CardTitle>{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Link 
                to={resource.link} 
                className="text-needyfy-blue hover:underline font-medium"
              >
                View Resource →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Related Links Section */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>You might also be interested in</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {relatedLinks.map((link, index) => (
              <Link
                key={index}
                to={link.link}
                className="text-needyfy-blue hover:underline font-medium"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderResources;
