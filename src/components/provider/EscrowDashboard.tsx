import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEscrowBalance, useEscrowReleases } from "@/hooks/useEscrowBalance";
import { format } from "date-fns";
import { DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";

export function EscrowDashboard() {
  const { data: balance, isLoading: balanceLoading } = useEscrowBalance();
  const { data: releases, isLoading: releasesLoading } = useEscrowReleases();

  if (balanceLoading || releasesLoading) {
    return <div>Loading escrow information...</div>;
  }

  const formatCurrency = (amount: number) => `$${(amount / 100).toFixed(2)}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Held in Escrow</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balance?.total_held || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Funds being held for active rentals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Releases</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balance?.pending_releases || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Ready to be released to your account
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available for Payout</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balance?.available_for_payout || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Released funds ready for withdrawal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Release Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Escrow Release Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {releases && releases.length > 0 ? (
            <div className="space-y-4">
              {releases.map((release) => (
                <div key={release.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{release.bookings?.equipment_title}</h4>
                      <Badge className={getStatusColor(release.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(release.status)}
                          {release.status.charAt(0).toUpperCase() + release.status.slice(1)}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {release.release_type.charAt(0).toUpperCase() + release.release_type.slice(1)} release
                      {release.scheduled_for && (
                        <> • Scheduled for {format(new Date(release.scheduled_for), 'PPP')}</>
                      )}
                    </p>
                    {release.released_at && (
                      <p className="text-sm text-green-600">
                        Released on {format(new Date(release.released_at), 'PPP')}
                      </p>
                    )}
                    {release.failure_reason && (
                      <p className="text-sm text-red-600">
                        Failed: {release.failure_reason}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(release.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No escrow releases found.</p>
          )}
        </CardContent>
      </Card>

      {/* How Escrow Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Escrow Protection Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Release Schedule:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <strong>Short rentals (1-3 days):</strong> 100% released after rental completion</li>
              <li>• <strong>Medium rentals (4-14 days):</strong> 50% at start, 50% after completion</li>
              <li>• <strong>Long rentals (15+ days):</strong> Weekly installments throughout the rental period</li>
            </ul>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium">Platform Fee:</h4>
            <p className="text-sm text-muted-foreground">
              A 5% platform fee is automatically deducted from each booking before funds are held in escrow.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}