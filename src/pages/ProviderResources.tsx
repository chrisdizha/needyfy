
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const ProviderResources = () => {
  const resources = [
    {
      title: "Equipment Listing Guide",
      description: "Learn how to create effective equipment listings",
      link: "#",
      icon: <FileText className="h-8 w-8 text-needyfy-blue" />
    },
    {
      title: "Pricing Strategies",
      description: "How to set competitive and profitable rental rates",
      link: "#",
      icon: <FileText className="h-8 w-8 text-needyfy-blue" />
    },
    {
      title: "Photography Tips",
      description: "Take better photos of your equipment",
      link: "#",
      icon: <FileText className="h-8 w-8 text-needyfy-blue" />
    },
    {
      title: "Maintenance Guide",
      description: "Keep your rental equipment in top condition",
      link: "#",
      icon: <FileText className="h-8 w-8 text-needyfy-blue" />
    },
    {
      title: "Customer Service Best Practices",
      description: "How to provide excellent service to renters",
      link: "#",
      icon: <FileText className="h-8 w-8 text-needyfy-blue" />
    },
    {
      title: "Tax Guidelines for Equipment Rental",
      description: "Understanding your tax obligations as a provider",
      link: "#",
      icon: <FileText className="h-8 w-8 text-needyfy-blue" />
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
              <a 
                href={resource.link} 
                className="text-needyfy-blue hover:underline font-medium"
              >
                View Resource →
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProviderResources;
