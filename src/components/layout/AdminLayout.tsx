import { useState } from 'react';
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
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Menu,
  Shield,
  UserCog,
  Package,
  Plus,
  List,
  Store,
  ShoppingCart,
  History,
  FileText,
  Warehouse,
  AlertTriangle,
  LayoutDashboard,
  Gift,
  Wallet,
  TrendingUp,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageTransition } from '@/components/PageTransition';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuSection {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
}

const simpleMenuItems: MenuItem[] = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'User Management', icon: Users },
  { path: '/admin/user-wallets', label: 'User Wallets', icon: Wallet },
  { path: '/admin/wallet-logs', label: 'Wallet Logs', icon: Clock },
  { path: '/admin/payouts', label: 'Payout Requests', icon: CreditCard },
  { path: '/admin/profile', label: 'My Profile', icon: UserCog },
  { path: '/admin/company-bv-history', label: 'Company BV History', icon: TrendingUp },
];

const menuSections: MenuSection[] = [
  {
    label: 'Product Management',
    icon: Package,
    items: [
      { path: '/admin/products/add', label: 'Add Product', icon: Plus },
      { path: '/admin/products/list', label: 'Product List', icon: List },
    ],
  },
  {
    label: 'Franchise Management',
    icon: Store,
    items: [
      { path: '/admin/franchise/add', label: 'Add New Franchise', icon: Plus },
      { path: '/admin/franchise/list', label: 'All Franchises', icon: List },
      { path: '/admin/franchise/sale', label: 'Sale to Franchise', icon: ShoppingCart },
      { path: '/admin/franchise/history', label: 'Sale History', icon: History },
      { path: '/admin/franchise/requests', label: 'Product Requests', icon: FileText },
    ],
  },
  {
    label: 'Stock/Inventory',
    icon: Warehouse,
    items: [
      { path: '/admin/stock/dashboard', label: 'Stock Dashboard', icon: AlertTriangle },
    ],
  },
  {
    label: 'Self Repurchase Bonus',
    icon: Gift,
    items: [
      { path: '/admin/bonus/repurchase/pools', label: 'Repurchase Pools', icon: List },
      { path: '/admin/bonus/repurchase/live', label: 'Live Qualifiers', icon: Users },
      { path: '/admin/bonus/repurchase/history', label: 'Global History', icon: History },
    ],
  },
  {
    label: 'Beginner Matching Bonus',
    icon: Gift,
    items: [
      { path: '/admin/bonus/beginner/pools', label: 'Manage & Distribute', icon: List },
    ],
  },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(['Product Management', 'Franchise Management', 'Stock/Inventory']);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSection = (label: string) => {
    setOpenSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const isPathActive = (path: string) => location.pathname === path;
  const isSectionActive = (section: MenuSection) =>
    section.items.some((item) => location.pathname.startsWith(item.path));

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Darker Admin Theme with Glass */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-secondary/95 backdrop-blur-md border-r border-border/30 transition-all duration-300 overflow-hidden",
        collapsed ? "w-16" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-secondary-foreground/10">
          {!collapsed && (
            <Link to="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary shadow-glow-primary flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-secondary-foreground">Admin Panel</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex text-secondary-foreground hover:bg-secondary-foreground/10"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Simple Menu Items */}
          {simpleMenuItems.map((item) => {
            const isActive = isPathActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-glow-primary"
                    : "text-secondary-foreground/70 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}

          {/* Divider */}
          {!collapsed && <div className="border-t border-secondary-foreground/10 my-3" />}

          {/* Collapsible Sections */}
          {menuSections.map((section) => (
            <Collapsible
              key={section.label}
              open={!collapsed && openSections.includes(section.label)}
              onOpenChange={() => !collapsed && toggleSection(section.label)}
            >
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isSectionActive(section)
                      ? "text-primary bg-primary/10"
                      : "text-secondary-foreground/70 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
                  )}
                >
                  <section.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="font-medium flex-1 text-left">{section.label}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          openSections.includes(section.label) ? "rotate-180" : ""
                        )}
                      />
                    </>
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-4 mt-1 space-y-1">
                {section.items.map((item) => {
                  const isActive = isPathActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-glow-primary"
                          : "text-secondary-foreground/60 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </nav>

        {/* Admin Info */}
        {!collapsed && user && (
          <div className="p-4 border-t border-secondary-foreground/10">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                <AvatarImage src={user.profilePicture?.url} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-secondary-foreground truncate">{user.fullName}</p>
                <p className="text-xs text-secondary-foreground/60">Administrator</p>
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
            {user?.role === 'admin' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/dashboard')}
                    className="hover:bg-accent/50"
                  >
                    <LayoutDashboard className="h-[1.2rem] w-[1.2rem]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Switch to User View</TooltipContent>
              </Tooltip>
            )}
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profilePicture?.url} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
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

export default AdminLayout;
