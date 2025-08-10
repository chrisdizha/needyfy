import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import AuthenticatedNavbar from '@/components/layout/AuthenticatedNavbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Copy, Gift, Share2, Trophy } from 'lucide-react';

const Rewards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [refCode, setRefCode] = useState<string>('');
  const [claimCode, setClaimCode] = useState('');
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Array<{ id: string; points: number; reason: string; created_at: string }>>([]);

  const myReferralLink = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return refCode ? `${origin}/register?ref=${refCode}` : '';
  }, [refCode]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!user) return;
      setLoading(true);

      // Ensure referral code exists
      const { data: existing } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing?.code) {
        setRefCode(existing.code);
      } else {
        // Simple deterministic code: first 8 chars of user id + random 3
        const newCode = `${user.id.replace(/-/g, '').slice(0, 8)}${Math.random().toString(36).slice(2, 5)}`.toUpperCase();
        const { error: upsertErr } = await supabase
          .from('referral_codes')
          .insert({ user_id: user.id, code: newCode });
        if (!upsertErr) setRefCode(newCode);
      }

      // Load points total
      const { data: pointsTotal } = await supabase.rpc('get_user_points_total');
      if (typeof pointsTotal === 'number') setTotalPoints(pointsTotal);

      // Load recent transactions
      const { data: tx } = await supabase
        .from('points_transactions')
        .select('id, points, reason, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      setTransactions(tx || []);

      setLoading(false);
    };

    bootstrap();
  }, [user]);

  const copyLink = async () => {
    if (!myReferralLink) return;
    await navigator.clipboard.writeText(myReferralLink);
    toast({ title: 'Copied', description: 'Referral link copied to clipboard.' });
  };

  const shareLink = async () => {
    if (!myReferralLink) return;
    try {
      // @ts-ignore - Web Share API may not exist in all browsers
      if (navigator.share) {
        // @ts-ignore
        await navigator.share({ title: 'Join me on Needyfy', text: 'Get started with Needyfy!', url: myReferralLink });
      } else {
        await copyLink();
      }
    } catch (_) {
      await copyLink();
    }
  };

  const claimReferral = async () => {
    if (!claimCode.trim() || !user) return;
    try {
      const { data: referrerId } = await supabase.rpc('get_referrer_by_code', { p_code: claimCode.trim() });
      if (!referrerId) {
        toast({ title: 'Invalid code', description: 'Please check the referral code and try again.', variant: 'destructive' });
        return;
      }
      if (referrerId === user.id) {
        toast({ title: 'Not allowed', description: 'You cannot refer yourself.', variant: 'destructive' });
        return;
      }

      const { error } = await supabase.from('referrals').insert({ referrer_id: referrerId, referred_id: user.id });
      if (error) {
        toast({ title: 'Already claimed?', description: 'You may have already claimed a referral.', variant: 'destructive' });
      } else {
        toast({ title: 'Referral recorded', description: 'Thanks! Your referral has been recorded.' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Could not claim referral. Try again later.', variant: 'destructive' });
    }
  };

  const badges = useMemo(() => {
    const items: { label: string; icon: JSX.Element }[] = [];
    if (totalPoints >= 1000) items.push({ label: 'Top Lister', icon: <Trophy className="h-4 w-4" /> });
    if (totalPoints >= 200) items.push({ label: 'Trusted Renter', icon: <Trophy className="h-4 w-4" /> });
    return items;
  }, [totalPoints]);

  return (
    <div className="min-h-screen flex flex-col">
      <AuthenticatedNavbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> Referral Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Your referral link</div>
                <div className="flex gap-2">
                  <Input readOnly value={myReferralLink} />
                  <Button variant="outline" onClick={copyLink}><Copy className="h-4 w-4 mr-1" /> Copy</Button>
                  <Button onClick={shareLink}><Share2 className="h-4 w-4 mr-1" /> Share</Button>
                </div>
                <div className="text-xs text-muted-foreground">Invite friends. When they join and rent, you both earn points.</div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="text-sm text-muted-foreground">Have a friend’s code?</div>
                <div className="flex gap-2">
                  <Input placeholder="Enter referral code" value={claimCode} onChange={(e) => setClaimCode(e.target.value)} />
                  <Button onClick={claimReferral}>Claim</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Your Points & Badges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">{totalPoints}</div>
              <div className="flex flex-wrap gap-2">
                {badges.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No badges yet — keep renting and inviting!</span>
                ) : badges.map((b, i) => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-1">{b.icon}{b.label}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Points</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-sm text-muted-foreground">No activity yet.</div>
              ) : (
                <div className="space-y-2">
                  {transactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between border rounded-md p-3">
                      <div className="text-sm font-medium capitalize">{tx.reason}</div>
                      <div className="text-sm text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</div>
                      <div className="text-sm font-semibold">+{tx.points}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Rewards;
