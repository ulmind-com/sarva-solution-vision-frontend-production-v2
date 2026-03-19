import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Clock, Loader2, CheckCircle, PlusCircle, MinusCircle, History } from 'lucide-react';
import { getWalletSummary, getPayoutHistory } from '@/services/userService';
import { api } from '@/lib/api';
import { formatDateIST } from '@/lib/dateUtils';

interface WalletSummary {
  totalEarnings: number;
  availableBalance: number;
  withdrawnAmount: number;
  pendingWithdrawal: number;
}

interface PayoutRecord {
  _id: string;
  payoutType: string;
  grossAmount: number;
  adminCharge: number;
  tdsDeducted: number;
  netAmount: number;
  status: string;
  createdAt: string;
  createdAt_IST?: string;
  updatedAt_IST?: string;
}

interface AdjustmentLog {
  _id: string;
  admin: { fullName: string; memberId: string };
  action: 'Credit' | 'Debit';
  amount: number;
  remarks: string;
  createdAt: string;
}

const Wallet = () => {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [adjustments, setAdjustments] = useState<AdjustmentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [walletData, payoutData, adjustmentsRes] = await Promise.all([
        getWalletSummary(),
        getPayoutHistory(),
        api.get('/api/v1/user/wallet-adjustments').catch(() => ({ data: { data: [] } }))
      ]);
      setWallet(walletData);
      setPayouts(payoutData);
      setAdjustments(adjustmentsRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPayoutType = (type: string): string => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
      completed: 'bg-green-500/20 text-green-600 border-green-500/30',
      processed: 'bg-green-500/20 text-green-600 border-green-500/30',
      paid: 'bg-green-500/20 text-green-600 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-600 border-red-500/30',
    };
    return styles[status?.toLowerCase()] || styles.pending;
  };

  const availableBalance = wallet?.availableBalance || 0;
  const totalEarnings = wallet?.totalEarnings || 0;
  const pendingAmount = wallet?.pendingWithdrawal || 0;
  const withdrawnAmount = wallet?.withdrawnAmount || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
        <p className="text-muted-foreground">Your earnings and payout history</p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Balance</CardTitle>
            <WalletIcon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">₹{availableBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            <ArrowUpRight className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">₹{totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime income</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Withdrawal</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">₹{pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Processing</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Withdrawn</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">₹{withdrawnAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully paid out</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout History Table */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Payout History</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchData}>Refresh</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Date & Time</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-right text-muted-foreground">Gross</TableHead>
                    <TableHead className="text-right text-muted-foreground">Deductions</TableHead>
                    <TableHead className="text-right text-muted-foreground">Net Amount</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No payouts yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    payouts.map((row) => {
                      const totalDeductions = (row.adminCharge || 0) + (row.tdsDeducted || 0);
                      const isWithdrawal = row.payoutType?.toLowerCase().includes('withdrawal');

                      return (
                        <TableRow key={row._id} className="border-border">
                          <TableCell className="text-muted-foreground">
                            <div className="flex flex-col">
                              <span className="font-medium">{formatDateIST(row.createdAt, row.createdAt_IST).split(' ').slice(0, -1).join(' ')}</span>
                              <span className="text-xs">{row.createdAt_IST?.split(' ')[1] || formatDateIST(row.createdAt).split(', ').pop() || ''}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isWithdrawal ? (
                                <ArrowDownRight className="h-4 w-4 text-destructive" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                              )}
                              <span className="text-foreground">{formatPayoutType(row.payoutType)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-foreground">
                            ₹{(row.grossAmount || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {totalDeductions > 0 ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-destructive cursor-help underline decoration-dotted">
                                    -₹{totalDeductions.toLocaleString()}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-xs space-y-1">
                                    <p>TDS: ₹{(row.tdsDeducted || 0).toLocaleString()}</p>
                                    <p>Admin: ₹{(row.adminCharge || 0).toLocaleString()}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-bold text-green-500">
                            ₹{(row.netAmount || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadge(row.status)}>
                              {row.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Manual Adjustments Table */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <History className="h-5 w-5" />
            Manual Adjustments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Date & Time</TableHead>
                  <TableHead className="text-muted-foreground">Action</TableHead>
                  <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No manual adjustments have been made to your wallet
                    </TableCell>
                  </TableRow>
                ) : (
                  adjustments.map((log) => (
                    <TableRow key={log._id} className="border-border">
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {log.action === 'Credit' ? (
                            <PlusCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <MinusCircle className="h-4 w-4 text-destructive" />
                          )}
                          <span className={log.action === 'Credit' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {log.action}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-foreground font-medium">
                        {log.action === 'Credit' ? '+' : '-'}₹{(log.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="text-foreground">{log.remarks || 'No remarks provided'}</span>
                          <span className="text-xs text-muted-foreground mt-0.5">By: {log.admin?.fullName || 'Admin'}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;
