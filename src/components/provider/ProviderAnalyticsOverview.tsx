
import { useProviderEarnings } from "@/hooks/useProviderEarnings";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { BarChart2, TrendingUp, TrendingDown } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { format } from "date-fns";

function currency(val: number) {
  return "$" + (val / 100).toLocaleString();
}

const ProviderAnalyticsOverview = () => {
  const { data: bookings, isLoading, error } = useProviderEarnings();

  if (isLoading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Earnings Yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You haven't earned any revenue yet! Once you start hosting, your analytics will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  // Aggregate earnings & count by status
  const totalEarnings = bookings
    .filter((b: any) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum: number, b: any) => sum + (b.total_price ?? 0), 0);

  const statusCounts: Record<string, number> = {};
  for (let b of bookings) {
    statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
  }

  // Revenue trend - group by month (last 6 months)
  const now = new Date();
  const months: string[] = [];
  const revenueByMonth: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = format(d, "MMM yyyy");
    months.push(m);
    revenueByMonth[m] = 0;
  }
  for (const b of bookings) {
    const m = format(new Date(b.created_at), "MMM yyyy");
    if (revenueByMonth[m] !== undefined && (b.status === "confirmed" || b.status === "completed")) {
      revenueByMonth[m] += b.total_price ?? 0;
    }
  }
  const chartData = months.map((m) => ({
    month: m,
    revenue: revenueByMonth[m] ?? 0,
  }));

  return (
    <div className="mb-8 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="text-green-600" />
            <div>
              <CardTitle>Total Earnings</CardTitle>
              <CardDescription>All time revenue</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{currency(totalEarnings)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart2 className="text-blue-600" />
            <div>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>By status</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <span className="text-green-800">Confirmed/Completed: <b>{(statusCounts["confirmed"] ?? 0) + (statusCounts["completed"] ?? 0)}</b></span>
              <span className="text-yellow-700">Pending: <b>{statusCounts["pending"] ?? 0}</b></span>
              <span className="text-red-700">Cancelled: <b>{statusCounts["cancelled"] ?? 0}</b></span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={currency} fontSize={12} />
                  <Tooltip formatter={(v: number) => currency(v)} />
                  <Bar dataKey="revenue" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderAnalyticsOverview;
