import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Home,
  Users,
  ShoppingBag,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  User,
  Menu,
  IndianRupee,
  Award,

  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { ThemeToggle } from '@/components/ThemeToggle';
import { PageTransition } from '@/components/PageTransition';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  path?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { path: string; label: string }[];
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Overview', icon: Home },
  {
    label: 'Team Details',
    icon: Users,
    children: [
      { path: '/dashboard/genealogy', label: 'Genealogy Tree' },
      { path: '/dashboard/direct-team', label: 'My Direct Team' },
      { path: '/dashboard/complete-team', label: 'My Downline' }
    ]
  },
  { path: '/dashboard/welcome-letter', label: 'Welcome Letter', icon: Award },
  { path: '/dashboard/purchase-history', label: 'Purchase History', icon: ShoppingBag },
  { path: '/user/products', label: 'Product Store', icon: ShoppingBag },
  { path: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  {
    label: 'My Incomes',
    icon: IndianRupee,
    children: [
      { path: '/dashboard/incomes/fast-track', label: 'Fast Track Bonus' },
      { path: '/dashboard/incomes/star-matching', label: 'Star Matching Bonus' },
      { path: '/dashboard/incomes/rank', label: 'Rank Bonus' },
      { path: '/dashboard/incomes/self-repurchase', label: 'Self Repurchase Bonus' },
      { path: '/dashboard/incomes/beginner-matching', label: 'Beginner Matching Bonus' },
      { path: '/dashboard/incomes/startup-bonus', label: 'Start Up Bonus' },
      { path: '/dashboard/incomes/leadership-bonus', label: 'Leadership Bonus' },
      { path: '/dashboard/incomes/tour-fund-bonus', label: 'Tour Fund' },
      { path: '/dashboard/incomes/health-education-bonus', label: 'Health & Education Bonus' },
      { path: '/dashboard/incomes/bike-car-fund-bonus', label: 'Bike & Car Fund' },
      { path: '/dashboard/incomes/house-fund', label: 'House Fund' },
      { path: '/dashboard/incomes/royalty-fund', label: 'Royalty Fund' },
      { path: '/dashboard/incomes/super-performance', label: 'Super Performance Bonus' },
    ]
  },
  {
    label: 'My Profile',
    icon: User,
    children: [
      { path: '/dashboard/profile', label: 'Update Profile' },
      { path: '/dashboard/change-password', label: 'Change Password' }
    ]
  },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [liveWalletBalance, setLiveWalletBalance] = useState<number | null>(null);
  const { user, logout, fetchProfile } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Use real user data
  const userName = user?.fullName || 'User';
  const userEmail = user?.email || '';
  const userRank = user?.currentRank || user?.rank || 'Member';
  const walletBalance = liveWalletBalance ?? user?.wallet?.availableBalance ?? 0;
  const profileImage = user?.profilePicture?.url;

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch fresh profile to get currentRank and other fields
        await fetchProfile();
        const { getWalletSummary } = await import('@/services/userService');
        const wallet = await getWalletSummary();
        if (wallet?.availableBalance != null) {
          setLiveWalletBalance(wallet.availableBalance);
        }
      } catch (err) {
        console.error('Dashboard init error:', err);
      }
    };
    if (user) init();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Glassmorphism */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 flex flex-col glass border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <img
                src="https://res.cloudinary.com/dkgwi1xvx/image/upload/v1769630007/sdfsdf_q4ziyu.png"
                alt="Sarva Solution Vision"
                className="h-8 w-auto"
              />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex hover:bg-accent/50"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            if (item.children) {
              const isChildActive = item.children.some(child => location.pathname === child.path);
              return (
                <Collapsible key={item.label} defaultOpen={isChildActive}>
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200",
                        isChildActive
                          ? "bg-accent/80 text-accent-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="font-medium">{item.label}</span>}
                      </div>
                      {!collapsed && <ChevronDown className="h-4 w-4 transition-transform duration-200" />}
                    </button>
                  </CollapsibleTrigger>
                  {!collapsed && (
                    <CollapsibleContent className="pl-8 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const isActive = location.pathname === child.path;
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "block px-3 py-2 rounded-lg text-sm transition-all duration-200",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-glow-primary"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                            )}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </CollapsibleContent>
                  )}
                </Collapsible>
              );
            }

            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path!}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-glow-primary"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        {!collapsed && user && (
          <div className="p-4 border-t border-border/50">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={profileImage} alt={userName} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground">{userRank}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar - Glassmorphism */}
        <header className="h-16 glass border-b border-border/50 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-foreground">₹{walletBalance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Wallet Balance</p>
              </div>
            )}

            {user?.role === 'admin' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/admin')}
                    className="relative hover:bg-accent/50"
                  >
                    <ShieldCheck className="h-[1.2rem] w-[1.2rem] text-destructive" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Back to Admin Panel</TooltipContent>
              </Tooltip>
            )}
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profileImage} alt={userName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem asChild className="hover:bg-accent/50 cursor-pointer">
                  <Link to="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive hover:bg-destructive/10 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content with transition */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <PageTransition key={location.pathname}>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
