import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  User,
  Wallet,
  FileCheck,
  Building2,
  Mail,
  Phone,
  Calendar,
  Users,
  TrendingUp,
  Car,
  Home,
  Crown,
  Rocket,
  Award,
  AlertCircle,
  ZoomIn,
  Pencil,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  LockKeyhole,
  Eye,
  EyeOff,
} from 'lucide-react';
import api from '@/lib/api';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import EditUserModal from '@/components/admin/EditUserModal';
import RejectKYCModal from '@/components/admin/RejectKYCModal';
import { toast } from 'sonner';

interface UserDetailData {
  _id: string;
  fullName: string;
  memberId: string;
  email: string;
  phone: string;
  rank: string;
  status: 'active' | 'inactive';
  joiningDate: string;
  sponsorId: string;
  parentId: string;
  position: 'left' | 'right';
  joiningPackage: number;
  profilePicture?: { url: string } | null;
  personalBV: number;
  totalBV: number;
  leftLegBV: number;
  rightLegBV: number;
  wallet: {
    availableBalance: number;
    totalEarnings: number;
    withdrawnAmount: number;
    pendingWithdrawal: number;
  };
  bikeFund: { totalBVContributed: number; nextTargetBV: number };
  carFund: { totalBVContributed: number; nextTargetBV: number };
  houseFund: { totalBVContributed: number; nextTargetBV: number };
  royaltyFund: { totalBVContributed: number };
  startupBonus: { earned: number };
  leadershipBonus: { earned: number };
  kyc: {
    status: 'none' | 'pending' | 'approved' | 'rejected';
    aadhaarNumber?: string;
    panCardNumber?: string;
    aadhaarFront?: { url: string };
    aadhaarBack?: { url: string };
    panImage?: { url: string };
    verifiedAt?: string;
    rejectionReason?: string;
  };
}

interface BankAccount {
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branch: string;
}

const UserDetail = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetailData | null>(null);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isKYCActionLoading, setIsKYCActionLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!memberId) return;
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setIsPasswordLoading(true);
      await api.patch(`/api/v1/admin/users/${memberId}/change-password`, {
        newPassword,
      });
      toast.success('Password updated successfully');
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const fetchUserDetail = useCallback(async () => {
    if (!memberId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/api/v1/admin/users/${memberId}`);
      setUser(response.data.data.user);
      setBankAccount(response.data.data.bankAccount || null);
    } catch (err: any) {
      console.error('Error fetching user details:', err);
      setError(err.response?.data?.message || 'Failed to fetch user details');
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  const handleKYCVerify = async () => {
    if (!memberId) return;

    try {
      setIsKYCActionLoading(true);
      await api.patch(`/api/v1/admin/kyc/verify/${memberId}`, {
        status: 'approved',
      });
      toast.success('KYC verified successfully');
      setIsApproveDialogOpen(false);
      fetchUserDetail();
    } catch (err: any) {
      console.error('Error verifying KYC:', err);
      toast.error(err.response?.data?.message || 'Failed to verify KYC');
    } finally {
      setIsKYCActionLoading(false);
    }
  };

  const handleKYCReject = async (reason: string) => {
    if (!memberId) return;

    try {
      setIsKYCActionLoading(true);
      await api.patch(`/api/v1/admin/kyc/verify/${memberId}`, {
        status: 'rejected',
        rejectionReason: reason,
      });
      toast.success('KYC rejected successfully');
      setIsRejectModalOpen(false);
      fetchUserDetail();
    } catch (err: any) {
      console.error('Error rejecting KYC:', err);
      toast.error(err.response?.data?.message || 'Failed to reject KYC');
    } finally {
      setIsKYCActionLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  const handleEditSuccess = () => {
    fetchUserDetail(); // Re-fetch user data after successful edit
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-4 py-8">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="font-medium text-foreground">User not found</p>
              <p className="text-sm text-muted-foreground">{error || 'The requested user could not be found.'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/admin/users')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Users
      </Button>

      {/* Header Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.profilePicture?.url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {user.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{user.fullName}</h1>
                <p className="text-muted-foreground font-mono">{user.memberId}</p>
                <Badge
                  variant="outline"
                  className={user.status === 'active'
                    ? 'bg-primary/20 text-primary border-primary/30 mt-1'
                    : 'bg-destructive/20 text-destructive border-destructive/30 mt-1'
                  }
                >
                  {user.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                <LockKeyhole className="mr-2 h-4 w-4" />
                Change Password
              </Button>
              <Badge className="text-sm px-4 py-2">
                <Crown className="mr-2 h-4 w-4" />
                {user.rank || 'Member'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={(open) => {
        setIsPasswordModalOpen(open);
        if (!open) {
          setNewPassword('');
          setConfirmPassword('');
          setShowNewPassword(false);
          setShowConfirmPassword(false);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5" />
              Change Password for {memberId}
            </DialogTitle>
            <DialogDescription>
              Set a new password for this user. No old password is required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-destructive">Passwords do not match</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)} disabled={isPasswordLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6 || isPasswordLoading}
            >
              {isPasswordLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      {user && (
        <EditUserModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          memberId={memberId || ''}
          userData={{
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            rank: user.rank,
            status: user.status as 'active' | 'inactive' | 'blocked',
            joiningPackage: user.joiningPackage,
            panCardNumber: user.kyc?.panCardNumber,
            aadharCardNumber: user.kyc?.aadhaarNumber,
            bankDetails: bankAccount ? {
              accountName: bankAccount.accountName,
              accountNumber: bankAccount.accountNumber,
              bankName: bankAccount.bankName,
              ifscCode: bankAccount.ifscCode,
              branch: bankAccount.branch,
            } : undefined,
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="kyc" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">KYC</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Bank</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview & Network */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{user.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">Joined: {formatDate(user.joiningDate)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Network Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Network Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sponsor ID</span>
                  <span className="font-mono text-foreground">{user.sponsorId || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Parent ID</span>
                  <span className="font-mono text-foreground">{user.parentId || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Position</span>
                  <Badge variant="outline">{user.position || 'N/A'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Joining Package</span>
                  <span className="font-medium text-foreground">{formatCurrency(user.joiningPackage)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wallet Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Available Balance</span>
                  <span className="font-bold text-green-600 text-lg">{formatCurrency(user.wallet?.availableBalance || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Earnings</span>
                  <span className="font-medium text-foreground">{formatCurrency(user.wallet?.totalEarnings || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Withdrawn Amount</span>
                  <span className="font-medium text-foreground">{formatCurrency(user.wallet?.withdrawnAmount || 0)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t">
                  <span className="text-muted-foreground">Pending Withdraw</span>
                  <span className="font-medium text-yellow-600">{formatCurrency(user.wallet?.pendingWithdrawal || 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Personal BV</span>
                </div>
                <p className="text-2xl font-bold mt-2">{user.personalBV || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Total BV</span>
                </div>
                <p className="text-2xl font-bold mt-2">{user.totalBV || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Left Leg BV</span>
                </div>
                <p className="text-2xl font-bold mt-2">{user.leftLegBV || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <ArrowLeft className="h-5 w-5 text-muted-foreground rotate-180" />
                  <span className="text-sm text-muted-foreground">Right Leg BV</span>
                </div>
                <p className="text-2xl font-bold mt-2">{user.rightLegBV || 0}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: KYC Documents */}
        <TabsContent value="kyc" className="space-y-6">
          {/* Status Banners */}
          {user.kyc?.status === 'approved' && (
            <Alert className="border-primary/30 bg-primary/10">
              <CheckCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">
                ✅ KYC Verified{user.kyc?.verifiedAt && ` on ${formatDate(user.kyc.verifiedAt)}`}
              </AlertDescription>
            </Alert>
          )}

          {user.kyc?.status === 'rejected' && (
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p>❌ KYC Rejected</p>
                  {user.kyc?.rejectionReason && (
                    <p className="text-sm opacity-80">Reason: {user.kyc.rejectionReason}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* KYC Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-muted/50 rounded-lg border">
            <div>
              <p className="text-sm text-muted-foreground">KYC Status</p>
              <Badge
                variant="outline"
                className={
                  user.kyc?.status === 'approved'
                    ? 'bg-primary/20 text-primary border-primary/30 mt-1'
                    : user.kyc?.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30 mt-1'
                      : user.kyc?.status === 'rejected'
                        ? 'bg-destructive/20 text-destructive border-destructive/30 mt-1'
                        : 'bg-muted text-muted-foreground mt-1'
                }
              >
                {user.kyc?.status ? user.kyc.status.charAt(0).toUpperCase() + user.kyc.status.slice(1) : 'Not Submitted'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aadhaar Number</p>
              <p className="font-mono text-lg font-semibold text-foreground">
                {user.kyc?.aadhaarNumber || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PAN Number</p>
              <p className="font-mono text-lg font-semibold text-foreground uppercase">
                {(user as any).panCardNumber || user.kyc?.panCardNumber || 'N/A'}
              </p>
            </div>
          </div>

          {/* Document Images */}
          {(user.kyc?.aadhaarFront?.url || user.kyc?.aadhaarBack?.url || user.kyc?.panImage?.url) && (
            <div className="grid gap-4 md:grid-cols-3">
              {user.kyc?.aadhaarFront?.url && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Bank PassBook 1st Page</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="relative group cursor-pointer">
                          <img
                            src={user.kyc.aadhaarFront.url}
                            alt="Bank PassBook 1st Page"
                            className="w-full h-32 object-contain bg-muted/50 border rounded-md"
                          />
                          <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                            <ZoomIn className="h-6 w-6 text-background" />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <img
                          src={user.kyc.aadhaarFront.url}
                          alt="Bank PassBook 1st Page"
                          className="w-full max-h-[80vh] object-contain rounded-md"
                        />
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )}

              {user.kyc?.aadhaarBack?.url && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Aadhaar Back</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="relative group cursor-pointer">
                          <img
                            src={user.kyc.aadhaarBack.url}
                            alt="Aadhaar Back"
                            className="w-full h-32 object-contain bg-muted/50 border rounded-md"
                          />
                          <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                            <ZoomIn className="h-6 w-6 text-background" />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <img
                          src={user.kyc.aadhaarBack.url}
                          alt="Aadhaar Back"
                          className="w-full max-h-[80vh] object-contain rounded-md"
                        />
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )}

              {user.kyc?.panImage?.url && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">PAN Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="relative group cursor-pointer">
                          <img
                            src={user.kyc.panImage.url}
                            alt="PAN Card"
                            className="w-full h-32 object-contain bg-muted/50 border rounded-md"
                          />
                          <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                            <ZoomIn className="h-6 w-6 text-background" />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <img
                          src={user.kyc.panImage.url}
                          alt="PAN Card"
                          className="w-full max-h-[80vh] object-contain rounded-md"
                        />
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!user.kyc?.aadhaarFront?.url && !user.kyc?.aadhaarBack?.url && !user.kyc?.panImage?.url && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No KYC documents uploaded yet.
              </CardContent>
            </Card>
          )}

          {/* Action Bar */}
          {user.kyc?.status === 'pending' && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => setIsApproveDialogOpen(true)}
                    disabled={isKYCActionLoading}
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Approve / Verify
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={isKYCActionLoading}
                  >
                    <XCircle className="mr-2 h-5 w-5" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Re-verify option for rejected KYC */}
          {user.kyc?.status === 'rejected' && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => setIsApproveDialogOpen(true)}
                    disabled={isKYCActionLoading}
                  >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Re-verify KYC
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 4: Bank Details */}
        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Bank Account Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bankAccount ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Account Holder Name</p>
                    <p className="font-medium">{bankAccount.accountName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Account Number</p>
                    <p className="font-mono">{bankAccount.accountNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Bank Name</p>
                    <p className="font-medium">{bankAccount.bankName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">IFSC Code</p>
                    <p className="font-mono">{bankAccount.ifscCode}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Branch Name</p>
                    <p className="font-medium">{bankAccount.branch}</p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No bank details linked to this account.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve KYC Confirmation Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Confirm KYC Verification
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to verify this user's KYC documents? This action will mark the user as verified and grant them full access to platform features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isKYCActionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleKYCVerify}
              disabled={isKYCActionLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isKYCActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Confirm Verification'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject KYC Modal */}
      <RejectKYCModal
        open={isRejectModalOpen}
        onOpenChange={setIsRejectModalOpen}
        onConfirm={handleKYCReject}
        isLoading={isKYCActionLoading}
      />
    </div>
  );
};

export default UserDetail;
