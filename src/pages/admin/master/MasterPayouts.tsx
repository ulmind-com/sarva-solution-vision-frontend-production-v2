import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertTriangle, ShieldCheck, Banknote, Target, TrendingUp, Filter, RefreshCw, Layers } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface PayoutRecord {
    _id: string;
    masterId: { shopName: string; vendorId: string; phone: string; name: string };
    sourceFranchiseId: { shopName: string; vendorId: string } | null;
    earningType: 'OWN_DIFFERENTIAL' | 'SUB_OVERRIDE';
    month: number;
    year: number;
    baseBv: number;
    basePv: number;
    grossPayout: number;
    adminCharge: number;
    tdsCharge: number;
    netPayout: number;
    status: 'pending' | 'paid';
    paidAt?: string;
    transactionId?: string;
    paymentNotes?: string;
}

const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount || 0);

const AdminMasterPayouts = () => {
    const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const currentDate = new Date();
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [year, setYear] = useState(currentDate.getFullYear());
    const [statusFilter, setStatusFilter] = useState("All");

    // Payment Form State
    const [payingId, setPayingId] = useState<string | null>(null);
    const [transactionId, setTransactionId] = useState("");
    const [paymentNotes, setPaymentNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPayouts = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/api/v1/admin/master-payouts?month=${month}&year=${year}&status=${statusFilter}`);
            setPayouts(res.data?.data || []);
        } catch (error) {
            console.error("Failed to fetch master payouts:", error);
            toast.error("Failed to load payout records");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, [month, year, statusFilter]);

    const handleMarkPaid = async (payoutId: string) => {
        try {
            setIsSubmitting(true);
            const payload = { transactionId, paymentNotes };
            await api.patch(`/api/v1/admin/master-payouts/${payoutId}/mark-paid`, payload);
            
            toast.success("Payout marked as paid successfully!");
            setPayingId(null);
            setTransactionId("");
            setPaymentNotes("");
            fetchPayouts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to mark payout as paid");
        } finally {
            setIsSubmitting(false);
        }
    };

    const stats = {
        totalPending: payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.netPayout, 0),
        totalPaid: payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.netPayout, 0),
        differentialCount: payouts.filter(p => p.earningType === 'OWN_DIFFERENTIAL').length,
        overrideCount: payouts.filter(p => p.earningType === 'SUB_OVERRIDE').length
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Banknote className="h-6 w-6 text-yellow-500" />
                        Master Franchise Payouts
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Isolated Top-Tier Earnings (15% BV / ₹50 PV Differentials & 5% BV / ₹10 PV Overrides)
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchPayouts} disabled={isLoading} className="gap-2">
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh Ledger
                </Button>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass premium-shadow border-red-500/20">
                    <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payouts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(stats.totalPending)}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass premium-shadow border-green-500/20">
                    <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Cleared (Paid)</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(stats.totalPaid)}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass premium-shadow border-blue-500/20">
                    <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Own Differentials</CardTitle>
                        <Target className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <div className="text-2xl font-bold text-foreground">
                            {stats.differentialCount} <span className="text-base font-normal text-muted-foreground">records</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass premium-shadow border-purple-500/20">
                    <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Sub Overrides</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <div className="text-2xl font-bold text-foreground">
                            {stats.overrideCount} <span className="text-base font-normal text-muted-foreground">records</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Ledger Card */}
            <Card className="glass premium-shadow border-yellow-500/10">
                <CardHeader className="border-b space-y-4 pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Layers className="h-5 w-5 text-yellow-500" />
                            Differential Ledger
                        </CardTitle>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-lg border">
                                <Filter className="h-4 w-4 text-muted-foreground ml-2" />
                                <select 
                                    className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none pr-3"
                                    value={month.toString()}
                                    onChange={(e) => setMonth(Number(e.target.value))}
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                        <option key={m} value={m}>{getMonthName(m)}</option>
                                    ))}
                                </select>
                                <span className="text-muted-foreground">/</span>
                                <select 
                                    className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none pr-3"
                                    value={year.toString()}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                >
                                    {[2025, 2026, 2027, 2028].map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>

                            <select 
                                className="h-9 px-3 rounded-lg border bg-background text-sm font-medium"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="p-0 overflow-x-auto">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : payouts.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                            <h3 className="text-lg font-medium text-foreground">No Differential Records</h3>
                            <p>No master franchise extra earnings found for this month.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="font-semibold text-xs uppercase">Master Franchise</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase">Type / Source</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase text-right">Base Trigger</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase text-right">Gross</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase text-right">Net Payout</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase text-center">Status</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payouts.map((p) => {
                                    const isSelf = p.earningType === 'OWN_DIFFERENTIAL';
                                    
                                    return (
                                        <TableRow key={p._id} className="hover:bg-yellow-50/50 dark:hover:bg-yellow-900/10">
                                            {/* 1. Master Info */}
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground">{p.masterId.shopName}</span>
                                                    <span className="text-xs text-muted-foreground font-mono">{p.masterId.vendorId}</span>
                                                </div>
                                            </TableCell>
                                            
                                            {/* 2. Type and Source */}
                                            <TableCell>
                                                <div className="flex flex-col gap-1 items-start">
                                                    <Badge className={isSelf ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-purple-100 text-purple-800 border-purple-200"}>
                                                        {isSelf ? "Self Differential" : "Sub Override"}
                                                    </Badge>
                                                    {!isSelf && p.sourceFranchiseId && (
                                                        <span className="text-xs text-muted-foreground">
                                                            from: <b>{p.sourceFranchiseId.shopName}</b>
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            
                                            {/* 3. Base Stats */}
                                            <TableCell className="text-right">
                                                <div className="flex flex-col text-xs text-muted-foreground">
                                                    <span>BV: <b>{p.baseBv}</b></span>
                                                    <span>PV: <b>{p.basePv}</b></span>
                                                </div>
                                            </TableCell>
                                            
                                            {/* 4. Gross */}
                                            <TableCell className="text-right">
                                                <span className="font-medium text-foreground">{formatCurrency(p.grossPayout)}</span>
                                                <div className="flex flex-col text-[10px] text-muted-foreground mt-0.5">
                                                    <span>- Admin: {formatCurrency(p.adminCharge)}</span>
                                                    <span>- TDS: {formatCurrency(p.tdsCharge)}</span>
                                                </div>
                                            </TableCell>
                                            
                                            {/* 5. Net */}
                                            <TableCell className="text-right">
                                                <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                                    {formatCurrency(p.netPayout)}
                                                </span>
                                            </TableCell>

                                            {/* 6. Status */}
                                            <TableCell className="text-center">
                                                {p.status === 'paid' ? (
                                                    <Badge className="bg-emerald-100/50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 w-fit mx-auto">
                                                        <CheckCircle2 className="h-3 w-3" /> Paid
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                                                        Pending
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* 7. Action */}
                                            <TableCell className="text-right">
                                                {p.status === 'pending' ? (
                                                    payingId === p._id ? (
                                                        <div className="flex flex-col gap-2 min-w-[200px] bg-background p-2 rounded-lg border shadow-lg absolute right-6 z-10">
                                                            <div className="text-xs font-semibold text-left mb-1">Clear Payment for {formatCurrency(p.netPayout)}</div>
                                                            <Input 
                                                                placeholder="Txn ID (e.g. UTR NO)" 
                                                                className="h-8 text-xs"
                                                                value={transactionId}
                                                                onChange={e => setTransactionId(e.target.value)}
                                                            />
                                                            <Input 
                                                                placeholder="Notes (Optional)" 
                                                                className="h-8 text-xs"
                                                                value={paymentNotes}
                                                                onChange={e => setPaymentNotes(e.target.value)}
                                                            />
                                                            <div className="flex justify-end gap-2 mt-1">
                                                                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setPayingId(null)}>Cancel</Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" 
                                                                    disabled={isSubmitting}
                                                                    onClick={() => handleMarkPaid(p._id)}
                                                                >
                                                                    Confirm Pay
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200 h-8"
                                                            onClick={() => {
                                                                setPayingId(p._id);
                                                                setTransactionId("");
                                                                setPaymentNotes("");
                                                            }}
                                                        >
                                                            Pay Out
                                                        </Button>
                                                    )
                                                ) : (
                                                    <div className="flex flex-col text-xs text-muted-foreground items-end justify-center">
                                                        <span className="font-mono text-[10px] break-all max-w-[120px]" title={p.transactionId}>
                                                            {p.transactionId ? `Txn: ${p.transactionId}` : '-'}
                                                        </span>
                                                        <span>{new Date(p.paidAt!).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminMasterPayouts;
