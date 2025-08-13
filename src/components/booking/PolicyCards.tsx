
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Info, Clock, AlertTriangle, Shield } from 'lucide-react';

interface PolicyCardsProps {
  onPolicyAccepted: (accepted: boolean) => void;
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict';
  depositAmount?: number;
  lateFeePolicy?: string;
  damagePolicy?: string;
}

const PolicyCards = ({ 
  onPolicyAccepted,
  cancellationPolicy = 'moderate',
  depositAmount = 0,
  lateFeePolicy,
  damagePolicy
}: PolicyCardsProps) => {
  const [accepted, setAccepted] = useState(false);

  const handleAcceptanceChange = (checked: boolean) => {
    setAccepted(checked);
    onPolicyAccepted(checked);
  };

  const getPolicyColor = (policy: string) => {
    switch (policy) {
      case 'flexible': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'strict': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCancellationDetails = (policy: string) => {
    switch (policy) {
      case 'flexible':
        return 'Full refund if cancelled 24 hours before the rental start time.';
      case 'moderate':
        return 'Full refund if cancelled 5 days before rental. 50% refund if cancelled 24-120 hours before.';
      case 'strict':
        return 'Full refund if cancelled 14 days before rental. 50% refund if cancelled 7-14 days before.';
      default:
        return 'Please review the specific cancellation terms for this item.';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Rental Policies</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cancellation Policy */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Cancellation Policy
              <Badge className={getPolicyColor(cancellationPolicy)}>
                {cancellationPolicy.charAt(0).toUpperCase() + cancellationPolicy.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {getCancellationDetails(cancellationPolicy)}
            </p>
          </CardContent>
        </Card>

        {/* Deposit Policy */}
        {depositAmount > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Security Deposit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                A security deposit of ${(depositAmount / 100).toFixed(2)} will be held on your payment method. 
                This will be released within 7 days after the rental period ends, provided the item is returned in good condition.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Late Fee Policy */}
        {lateFeePolicy && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4" />
                Late Return Fee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {lateFeePolicy}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Damage Policy */}
        {damagePolicy && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4" />
                Damage Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {damagePolicy}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Policy Acceptance */}
      <div className="flex items-start space-x-2 p-4 bg-muted/50 rounded-lg">
        <Checkbox 
          id="policy-acceptance"
          checked={accepted}
          onCheckedChange={handleAcceptanceChange}
          className="mt-1"
        />
        <label 
          htmlFor="policy-acceptance" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          I have read and agree to the rental policies, terms and conditions, and understand the cancellation, deposit, and fee structure outlined above.
        </label>
      </div>
    </div>
  );
};

export default PolicyCards;
