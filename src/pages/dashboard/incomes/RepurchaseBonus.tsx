import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Copy, Check, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getRepurchaseStatus, getRepurchaseHistory } from "@/services/userService";

export default function RepurchaseBonus() {
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [statusData, setStatusData] = useState<any>(null);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    useEffect(() => {
        fetchData(1);
    }, []);

    const fetchData = async (page: number) => {
        setLoading(true);
        try {
            const [statusRes, historyRes] = await Promise.all([
                getRepurchaseStatus(),
                getRepurchaseHistory(page, 10),
            ]);

            if (statusRes.success) {
                setStatusData({
                    isEligible: statusRes.data?.currentStatus?.eligibleForRepurchaseBonus || false,
                    currentMonthRepurchaseBV: statusRes.data?.currentStatus?.repurchaseWindowBV || 0,
                    totalEarned: statusRes.data?.currentStatus?.bonusEarned || 0,
                    recentDistributions: statusRes.data?.recentHistory?.map((h: any) => ({
                        month: h.monthYear || h.month || 'N/A',
                        amount: h.netAmount || h.grossAmount || 0
                    })) || []
                });
            }
            if (historyRes.success) {
                // Handle varying response structures from the backend 
                const historyArray = historyRes.data?.history || historyRes.data?.docs || [];
                setHistoryData(historyArray.map((h: any) => ({
                    ...h,
                    amount: h.netAmount || h.grossAmount || 0
                })));
                if (historyRes.data?.pagination) {
                    setPagination({
                        page: historyRes.data.pagination.currentPage || page,
                        totalPages: historyRes.data.pagination.totalPages || 1
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch Repurchase Bonus data:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Self Repurchase Bonus</h1>
                    <p className="text-muted-foreground mt-1">
                        Track your current BV and repurchase bonus eligibility
                    </p>
                </div>
            </div>

            {statusData && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Eligibility Card */}
                    <Card className="glass premium-shadow border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium text-muted-foreground flex items-center justify-between">
                                Eligibility Status
                                <Info className="h-4 w-4 text-primary" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">
                                {statusData.isEligible ? (
                                    <span className="text-green-500">Eligible</span>
                                ) : (
                                    <span className="text-amber-500">Not Eligible</span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Current month window: 1st to 10th
                            </p>
                            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-sm">
                                <span>Personal BV (This Month):</span>
                                <span className="font-semibold">{statusData.currentMonthRepurchaseBV || 0} BV</span>
                            </div>
                            {!statusData.isEligible && (
                                <p className="text-xs text-amber-500 mt-2">
                                    * Reach {statusData.minimumRequiredBV || 500} BV by the 10th to qualify.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Wallet Earnings Card */}
                    <Card className="glass premium-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium text-muted-foreground">
                                Total Earned
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">
                                ₹{statusData.totalEarned?.toLocaleString('en-IN') || 0}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Total repurchase bonus credited
                            </p>
                        </CardContent>
                    </Card>

                    {/* Recent Distributions Card */}
                    <Card className="glass premium-shadow md:col-span-2 lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium text-muted-foreground">
                                Recent Distributions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {statusData.recentDistributions && statusData.recentDistributions.length > 0 ? (
                                <ul className="space-y-3">
                                    {statusData.recentDistributions.slice(0, 3).map((dist: any, idx: number) => (
                                        <li key={idx} className="flex justify-between items-center text-sm">
                                            <span className="font-medium">{dist.month}</span>
                                            <span className="text-primary font-semibold">₹{dist.amount}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No recent distributions found.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* History Table */}
            <Card className="glass premium-shadow overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                    <CardTitle>Bonus History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[120px]">Date</TableHead>
                                    <TableHead>Pool Month</TableHead>
                                    <TableHead>Required BV</TableHead>
                                    <TableHead className="text-right">Amount (₹)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historyData.length > 0 ? (
                                    historyData.map((record) => (
                                        <TableRow key={record._id} className="hover:bg-accent/40 transition-colors">
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {record.createdAt ? format(new Date(record.createdAt), 'dd MMM yyyy') : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal">
                                                    {record.monthYear || record.month}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{record.minimumRequiredBV || '500'} BV</TableCell>
                                            <TableCell className="text-right text-primary font-medium">
                                                +₹{record.amount?.toLocaleString('en-IN')}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                            No repurchase bonus history found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t">
                            <div className="text-sm text-muted-foreground">
                                Page {pagination.page} of {pagination.totalPages}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page <= 1}
                                    onClick={() => fetchData(pagination.page - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => fetchData(pagination.page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
