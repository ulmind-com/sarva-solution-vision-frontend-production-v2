import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { ThemeProvider } from "@/components/ThemeProvider";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import FranchiseLogin from "./pages/FranchiseLogin";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Dashboard
import DashboardLayout from "./components/layout/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import Genealogy from "./pages/dashboard/Genealogy";
import DirectTeam from "./pages/dashboard/DirectTeam";
import CompleteTeam from "./pages/dashboard/CompleteTeam";
import Store from "./pages/dashboard/Store";
import Wallet from "./pages/dashboard/Wallet";
import UpdateProfile from "./pages/dashboard/UpdateProfile";
import ChangePassword from "./pages/dashboard/ChangePassword";
import CappingReport from "./pages/dashboard/CappingReport";
import IncomeReport from "./pages/dashboard/IncomeReport";
import FastTrackBonus from "./pages/dashboard/FastTrackBonus";
import StarMatchingBonus from "./pages/dashboard/StarMatchingBonus";
import RepurchaseBonus from "./pages/dashboard/incomes/RepurchaseBonus";
import BeginnerMatchingBonus from "./pages/dashboard/incomes/BeginnerMatchingBonus";
import StartupBonus from "./pages/dashboard/incomes/StartupBonus";
import LeadershipBonus from "./pages/dashboard/incomes/LeadershipBonus";
import TourFund from "./pages/dashboard/incomes/TourFund";
import HealthEducationBonus from "./pages/dashboard/incomes/HealthEducationBonus";
import BikeCarFund from "./pages/dashboard/incomes/BikeCarFund";
import WelcomeLetter from "./pages/dashboard/WelcomeLetter";
import PurchaseHistory from "./pages/dashboard/PurchaseHistory";
import ProductCatalog from "./pages/user/ProductCatalog";

// Admin
import AdminLayout from "./components/layout/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import UserManagement from "./pages/admin/UserManagement";
import UserWalletList from "./pages/admin/UserWalletList";
import WalletLogs from "./pages/admin/WalletLogs";
import UserDetail from "./pages/admin/UserDetail";
import PayoutRequests from "./pages/admin/PayoutRequests";
import CompanyBvHistory from "./pages/admin/CompanyBvHistory";

// Admin - Bonus Management
import RepurchasePools from "./pages/admin/bonus/RepurchasePools";
import LiveQualifiers from "./pages/admin/bonus/LiveQualifiers";
import GlobalRepurchaseHistory from "./pages/admin/bonus/RepurchaseHistory";
import AdminBeginnerBonus from "./pages/admin/bonus/AdminBeginnerBonus";
import AdminStartupBonus from "./pages/admin/bonus/AdminStartupBonus";
import AdminLeadershipBonus from "./pages/admin/bonus/AdminLeadershipBonus";
import AdminTourFund from "./pages/admin/bonus/AdminTourFund";
import AdminHealthEducationBonus from "./pages/admin/bonus/AdminHealthEducationBonus";
import AdminBikeCarFund from "./pages/admin/bonus/AdminBikeCarFund";
import WalletAdjustment from "./pages/admin/WalletAdjustment";

// Admin - Products
import AddProduct from "./pages/admin/products/AddProduct";
import ProductList from "./pages/admin/products/ProductList";

// Admin - Stock
import StockDashboard from "./pages/admin/stock/StockDashboard";

// Admin - Franchise
import AddFranchise from "./pages/admin/franchise/AddFranchise";
import FranchiseList from "./pages/admin/franchise/FranchiseList";
import SaleToFranchise from "./pages/admin/franchise/SaleToFranchise";
import SaleHistory from "./pages/admin/franchise/SaleHistory";
import FranchiseRequests from "./pages/admin/franchise/FranchiseRequests";

// Franchise Portal
import FranchiseDashboard from "./pages/franchise/FranchiseDashboard";
import FranchiseCreateBill from "./pages/franchise/FranchiseCreateBill";
import FranchiseInventory from "./pages/franchise/FranchiseInventory";
import FranchiseRequestStock from "./pages/franchise/FranchiseRequestStock";
import FranchiseOrderHistory from "./pages/franchise/FranchiseOrderHistory";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) => {
  const { user, token } = useAuthStore();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Admin check - redirect non-admin users to dashboard profile
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard/profile" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/join/:referralId" element={<Register />} />
      <Route path="/franchise/login" element={<FranchiseLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Dashboard Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Overview />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/genealogy" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Genealogy />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/direct-team" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DirectTeam />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/complete-team" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CompleteTeam />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/store" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Store />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/wallet" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Wallet />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/profile" element={
        <ProtectedRoute>
          <DashboardLayout>
            <UpdateProfile />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/change-password" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ChangePassword />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/capping" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CappingReport />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/incomes/fast-track" element={
        <ProtectedRoute>
          <DashboardLayout>
            <FastTrackBonus />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/incomes/star-matching" element={
        <ProtectedRoute>
          <DashboardLayout>
            <StarMatchingBonus />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/incomes/self-repurchase" element={
        <ProtectedRoute>
          <DashboardLayout>
            <RepurchaseBonus />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/incomes/beginner-matching" element={
        <ProtectedRoute>
          <DashboardLayout>
            <BeginnerMatchingBonus />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/incomes/startup-bonus" element={
        <ProtectedRoute>
          <DashboardLayout>
            <StartupBonus />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/incomes/leadership-bonus" element={
        <ProtectedRoute>
          <DashboardLayout>
            <LeadershipBonus />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/incomes/tour-fund-bonus" element={
        <ProtectedRoute>
          <DashboardLayout>
            <TourFund />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/incomes/health-education-bonus" element={
        <ProtectedRoute>
          <DashboardLayout>
            <HealthEducationBonus />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/incomes/bike-car-fund-bonus" element={
        <ProtectedRoute>
          <DashboardLayout>
            <BikeCarFund />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/incomes/:type" element={
        <ProtectedRoute>
          <DashboardLayout>
            <IncomeReport />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/user/products" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ProductCatalog />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/welcome-letter" element={
        <ProtectedRoute>
          <DashboardLayout>
            <WelcomeLetter />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/purchase-history" element={
        <ProtectedRoute>
          <DashboardLayout>
            <PurchaseHistory />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <AdminHome />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <UserManagement />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/user-wallets" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <UserWalletList />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/wallet-logs" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <WalletLogs />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/wallet-adjustments" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <WalletAdjustment />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users/:memberId" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <UserDetail />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/profile" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <UpdateProfile />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/company-bv-history" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <CompanyBvHistory />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/payouts" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <PayoutRequests />
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Admin - Bonus Management */}
      <Route path="/admin/bonus/repurchase/pools" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <RepurchasePools />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/bonus/repurchase/live" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <LiveQualifiers />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/bonus/repurchase/history" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <GlobalRepurchaseHistory />
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Admin - Beginner Bonus Management */}
      <Route path="/admin/bonus/beginner/pools" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <AdminBeginnerBonus />
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Admin - Startup Bonus Management */}
      <Route path="/admin/bonus/startup/pools" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <AdminStartupBonus />
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Admin - Leadership Bonus Management */}
      <Route path="/admin/bonus/leadership/pools" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <AdminLeadershipBonus />
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Admin - Tour Fund Management */}
      <Route path="/admin/bonus/tour-fund/pools" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <AdminTourFund />
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Admin - Health & Education Bonus Management */}
      <Route path="/admin/bonus/health-education/pools" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <AdminHealthEducationBonus />
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Admin - Bike & Car Fund Management */}
      <Route path="/admin/bonus/bike-car-fund/pools" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <AdminBikeCarFund />
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Admin - Product Management */}
      <Route path="/admin/products/add" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <AddProduct />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/products/list" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <ProductList />
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Admin - Stock Management */}
      <Route path="/admin/stock/dashboard" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <StockDashboard />
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Admin - Franchise Management */}
      <Route path="/admin/franchise/add" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <AddFranchise />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/franchise/list" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <FranchiseList />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/franchise/sale" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <SaleToFranchise />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/franchise/history" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <SaleHistory />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/franchise/requests" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <FranchiseRequests />
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Franchise Portal Routes */}
      <Route path="/franchise/dashboard" element={<FranchiseDashboard />} />
      <Route path="/franchise/inventory" element={<FranchiseInventory />} />
      <Route path="/franchise/sale/create" element={<FranchiseCreateBill />} />
      <Route path="/franchise/request-stock" element={<FranchiseRequestStock />} />
      <Route path="/franchise/order-history" element={<FranchiseOrderHistory />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
