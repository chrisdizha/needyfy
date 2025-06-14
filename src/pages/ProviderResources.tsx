
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Award, HelpCircle, List } from "lucide-react";

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

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Provider Resources</h1>
      <p className="text-gray-500 mb-8">Helpful resources to maximize your success as an equipment provider</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
};

export default ProviderResources;
