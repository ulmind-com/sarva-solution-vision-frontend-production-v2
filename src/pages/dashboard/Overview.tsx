import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { getWalletSummary, getUserTree } from '@/services/userService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  Users,
  Wallet,
  Award,
  Copy,
  ArrowUpRight,
  ArrowDownRight,
  LineChart,
  ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const Overview = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [walletData, setWalletData] = useState({ availableBalance: 0, totalEarnings: 0 });
  const [teamData, setTeamData] = useState({ leftTeamCount: 0, rightTeamCount: 0 });

  const rank = user?.currentRank || user?.rank || 'Member';
  const userName = user?.fullName?.split(' ')[0] || 'User';
  const memberId = user?.memberId || '';

  const getRankColor = (r: string): string => {
    const rl = r.toLowerCase();
    if (rl.includes('ssvpl')) return 'text-purple-500';
    if (rl === 'legend') return 'text-amber-500';
    if (rl === 'royal') return 'text-yellow-600';
    if (rl === 'elite') return 'text-red-500';
    if (rl === 'crown') return 'text-purple-600';
    if (rl === 'emerald') return 'text-emerald-600';
    if (rl === 'sapphire') return 'text-blue-700';
    if (rl === 'ruby') return 'text-red-600';
    if (rl === 'diamond') return 'text-sky-500';
    if (rl === 'platinum') return 'text-cyan-400';
    if (rl === 'gold') return 'text-yellow-500';
    if (rl === 'silver') return 'text-slate-400';
    if (rl === 'bronze') return 'text-amber-700';
    if (rl === 'star') return 'text-indigo-500';
    return 'text-emerald-500'; // Associate / default
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [walletRes, treeRes] = await Promise.allSettled([
          getWalletSummary(),
          memberId ? getUserTree(memberId) : Promise.resolve(null),
        ]);

        if (walletRes.status === 'fulfilled' && walletRes.value) {
          const w = walletRes.value;
          setWalletData({
            availableBalance: w.availableBalance || 0,
            totalEarnings: w.totalEarnings || 0,
          });
        }

        if (treeRes.status === 'fulfilled' && treeRes.value) {
          const t = treeRes.value?.data || treeRes.value;
          setTeamData({
            leftTeamCount: t.leftTeamCount || 0,
            rightTeamCount: t.rightTeamCount || 0,
          });
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [memberId]);

  const copyReferralLink = () => {
    const link = `${window.location.origin}/join/${memberId}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied to clipboard!');
  };

  const stats: Array<{
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: typeof TrendingUp;
  }> = [
      {
        title: 'Total Earnings',
        value: `₹${walletData.totalEarnings.toLocaleString()}`,
        change: 'Lifetime',
        changeType: 'neutral',
        icon: TrendingUp
      },
      {
        title: 'Wallet Balance',
        value: `₹${walletData.availableBalance.toLocaleString()}`,
        change: 'Available',
        changeType: 'positive',
        icon: Wallet
      },
      {
        title: 'Member ID',
        value: memberId || 'N/A',
        change: 'Your unique ID',
        changeType: 'neutral',
        icon: Users
      },
      {
        title: 'Current Rank',
        value: rank,
        change: 'Keep growing!',
        changeType: 'neutral',
        icon: Award
      },
      {
        title: 'Lifetime BV',
        value: `${((user as any)?.totalBV || 0).toLocaleString()} BV`,
        change: 'Total accumulated BV',
        changeType: 'neutral',
        icon: LineChart
      },
      {
        title: 'Monthly Personal BV',
        value: `${((user as any)?.thisMonthBV || (user as any)?.selfPurchase?.thisMonthBV || 0).toLocaleString()} BV`,
        change: `Reset every month (${format(new Date(), 'MMMM')})`,
        changeType: 'neutral',
        icon: ShoppingBag
      }
    ];

  const recentActivity = [
    { type: 'info', message: 'Welcome to Sarva Solution Vision!', time: 'Just now' },
    { type: 'info', message: 'Complete your profile for better experience', time: 'Tip' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your network today.</p>
        </div>
        <Button onClick={copyReferralLink} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy Referral Link
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className={`text-2xl font-bold ${stat.title === 'Current Rank' ? getRankColor(rank) : 'text-foreground'}`}>
                    {stat.value}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.changeType === 'positive' && (
                      <ArrowUpRight className="h-3 w-3 text-primary" />
                    )}
                    {stat.changeType === 'negative' && (
                      <ArrowDownRight className="h-3 w-3 text-destructive" />
                    )}
                    <span className={`text-xs ${stat.changeType === 'positive' ? 'text-primary' :
                      stat.changeType === 'negative' ? 'text-destructive' :
                        'text-muted-foreground'
                      }`}>
                      {stat.change}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Status */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Network Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Left Team</p>
                {isLoading ? (
                  <Skeleton className="h-9 w-16 mx-auto" />
                ) : (
                  <p className="text-3xl font-bold text-accent-foreground">
                    {teamData.leftTeamCount.toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Members</p>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Right Team</p>
                {isLoading ? (
                  <Skeleton className="h-9 w-16 mx-auto" />
                ) : (
                  <p className="text-3xl font-bold text-accent-foreground">
                    {teamData.rightTeamCount.toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Members</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Tip: </span>
                Grow your team to unlock higher ranks
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Card */}
      <Card className="border-border bg-primary text-primary-foreground">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Invite Friends & Earn More</h3>
              <p className="text-primary-foreground/80 mt-1">
                Share your unique referral link and grow your network!
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={copyReferralLink}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;
