
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const ProviderGuidelines = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Provider Guidelines</h1>
      <p className="text-gray-500 mb-8">Important rules and standards for Needyfy equipment providers</p>
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-needyfy-blue" />
              <CardTitle>Equipment Quality Standards</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>All equipment listed on Needyfy must meet the following quality standards:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Equipment must be in good working condition with no major defects</li>
              <li>All safety features must be functional and up-to-date</li>
              <li>Equipment must be clean and well-maintained</li>
              <li>Any wear and tear or minor issues must be clearly disclosed in the listing</li>
              <li>Equipment performance must match the described specifications</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-needyfy-blue" />
              <CardTitle>Listing Requirements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>All equipment listings must include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Clear, accurate title describing the equipment</li>
              <li>Detailed description of features, condition, and usage instructions</li>
              <li>At least 3 high-quality photos showing different angles</li>
              <li>Clear pricing information including any deposits required</li>
              <li>Accurate availability calendar</li>
              <li>Any restrictions or requirements for renters</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-needyfy-blue" />
              <CardTitle>Rental Policies</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Providers must adhere to the following rental policies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Respond to booking requests within 24 hours</li>
              <li>Honor all confirmed bookings unless there are extenuating circumstances</li>
              <li>Provide the exact equipment that was listed and booked</li>
              <li>Ensure equipment is ready for pickup/delivery at the agreed time</li>
              <li>Clearly document equipment condition before and after rental</li>
              <li>Process security deposit returns within 3 business days after rental completion</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-needyfy-blue" />
              <CardTitle>Cancellation and Dispute Resolution</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Guidelines for handling cancellations and disputes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Providers may set their own cancellation policy from our available options</li>
              <li>All cancellation policies must be clearly stated on listings</li>
              <li>In case of disputes, providers must respond to Needyfy support within 48 hours</li>
              <li>Provide documentation and evidence when requested for dispute resolution</li>
              <li>Abide by the final decision made by the Needyfy dispute resolution team</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderGuidelines;
