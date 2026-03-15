import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, LayoutList, IndianRupee } from 'lucide-react';
import { getSelfRepurchaseBvHistory } from '@/services/adminService';
import { toast } from 'sonner';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CompanyBvHistory() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBvHistory();
    }, []);

    const fetchBvHistory = async () => {
        try {
            setLoading(true);
            const res = await getSelfRepurchaseBvHistory();
            if (res.success) {
                setHistory(res.data || []);
            } else {
                toast.error(res.message || 'Failed to fetch company BV history');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch company BV history');
        } finally {
            setLoading(false);
        }
    };

    const currentMonthData = history.length > 0 ? history[0] : null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Company BV Tracking</h1>
                <p className="text-muted-foreground">Month-wise breakdown of total Business Volume generated for Self Repurchase Bonus.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Current Month BV</CardTitle>
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {currentMonthData?.companyTotalBV?.toLocaleString('en-IN') || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Total active franchise BV this month</p>
                    </CardContent>
                </Card>
                <Card className="glass border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Projected Pool (7%)</CardTitle>
                        <IndianRupee className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">
                            ₹{(currentMonthData?.projectedPool || 0).toLocaleString('en-IN')}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Estimated pool for distribution</p>
                    </CardContent>
                </Card>
                <Card className="glass border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
                        <LayoutList className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {(currentMonthData?.totalTransactions || 0).toLocaleString('en-IN')}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Repurchases this month</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass border-border/50 overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LayoutList className="w-5 h-5 text-primary" />
                        Monthly BV History
                    </CardTitle>
                    <CardDescription>Comprehensive record of past business volume generation and pool distribution.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto min-h-[400px] border-t border-border/50">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="pl-6">Month</TableHead>
                                    <TableHead>Total BV</TableHead>
                                    <TableHead>Transactions</TableHead>
                                    <TableHead>Pool Status</TableHead>
                                    <TableHead>Pool Amount</TableHead>
                                    <TableHead>Qualifiers</TableHead>
                                    <TableHead className="text-right pr-6">Net Share / User</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                                Loading history...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : history.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                            No historical BV data found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    history.map((record, idx) => (
                                        <TableRow key={`${record.year}-${record.month}-${idx}`} className="hover:bg-accent/40 transition-colors">
                                            <TableCell className="font-semibold whitespace-nowrap pl-6">
                                                {format(new Date(record.year, record.month - 1), 'MMMM yyyy')}
                                            </TableCell>
                                            <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">
                                                {record.companyTotalBV?.toLocaleString('en-IN') || 0} BV
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {record.totalTransactions || 0}
                                            </TableCell>
                                            <TableCell>
                                                {record.poolStatus === 'distributed' && (
                                                    <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none font-semibold text-white tracking-wide">DISTRIBUTED</Badge>
                                                )}
                                                {record.poolStatus === 'pending' && (
                                                    <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10 font-semibold tracking-wide">PENDING</Badge>
                                                )}
                                                {record.poolStatus === 'held' && (
                                                    <Badge variant="secondary" className="font-semibold tracking-wide">HELD</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-semibold text-foreground">
                                                ₹{record.actualPoolAmount ? record.actualPoolAmount.toLocaleString('en-IN') : record.projectedPool?.toLocaleString('en-IN') || 0}
                                                <span className="text-xs text-muted-foreground ml-1 font-normal">
                                                    {record.actualPoolAmount ? '(Actual)' : '(Proj)'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {record.eligibleUserCount ?? '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-primary pr-6">
                                                {record.netSharePerUser ? `₹${record.netSharePerUser.toLocaleString('en-IN')}` : '-'}
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
}
