import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Banknote, CheckCircle2, AlertCircle, AlertTriangle, ArrowLeft, Store, Activity, ListOrdered } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useFranchiseAuthStore } from "@/stores/useFranchiseAuthStore";
import api from "@/lib/api";

interface PayoutRecord {
    _id: string;
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
}

const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount || 0);

const FranchiseMasterPayouts = () => {
    const [isMaster, setIsMaster] = useState<boolean | null>(null);
    const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
    const [liveData, setLiveData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const currentDate = new Date();
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [year, setYear] = useState(currentDate.getFullYear());

    const { franchise, franchiseToken, isAuthenticated } = useFranchiseAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) navigate('/franchise/login');
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const fetchPayouts = async () => {
            try {
                if (!franchiseToken) return;
                setIsLoading(true);
                const config = { headers: { Authorization: `Bearer ${franchiseToken}` } };
                // First check if Master
                const netRes = await api.get('/api/v1/franchise/master-portal/network', config);
                setIsMaster(netRes.data?.data?.isMaster);

                if (netRes.data?.data?.isMaster) {
                    const [payRes, liveRes] = await Promise.all([
                        api.get(`/api/v1/franchise/master-payout?month=${month}&year=${year}`, config),
                        api.get('/api/v1/franchise/master-portal/live-earnings', config)
                    ]);
                    setPayouts(payRes.data?.data || []);
                    setLiveData(liveRes.data?.data || null);
                }
            } catch (error) {
                console.error("Failed to fetch payouts", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPayouts();
    }, [month, year]);

    if (isLoading || !franchise) return <div className="p-10 space-y-4"><Skeleton className="h-10 w-full"/><Skeleton className="h-40 w-full"/></div>;

    const HeaderLayout = () => (
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/franchise/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold">{franchise.shopName}</p>
                        <p className="text-xs text-muted-foreground">{franchise.vendorId}</p>
                    </div>
                </div>
            </div>
        </header>
    );

    if (isMaster === false) {
        return (
            <div className="min-h-screen bg-background">
                <HeaderLayout />
                <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
                    <Card className="max-w-md w-full glass border-dashed shadow-none bg-muted/20">
                        <CardContent className="pt-8 text-center flex flex-col items-center">
                            <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="h-8 w-8" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                            <p className="text-muted-foreground text-sm">
                                Master Payouts are exclusive to Master Franchises. Standard franchise payouts are located in the primary Payouts tab.
                            </p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <HeaderLayout />
            <main className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Banknote className="h-6 w-6 text-emerald-600" />
                        Master Bonus Ledger
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Your extra 15% BV and ₹50 PV earnings + Override commissions from your sub-network.
                    </p>
                </div>
            </div>

            {/* Live Projection Banner */}
            {liveData && (
                <Card className="glass border-emerald-500/30 shadow-[0_4px_24px_rgba(16,185,129,0.1)] relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                            <Activity className="h-4 w-4 animate-pulse" />
                            Live Projected MTD Earnings ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Own Differential (+15% BV, ₹50/PV)</p>
                                <p className="text-xl font-semibold text-foreground">{formatCurrency(liveData.projectedOwnDifferential)}</p>
                                {liveData.projectedOwnDifferential > 0 && (
                                    <div className="text-[10px] mt-1 flex flex-col gap-0.5">
                                        <span className="text-red-500/80">- {formatCurrency(liveData.ownAdminCharge + liveData.ownTdsCharge)} (7% Deduction)</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Net Expected: {formatCurrency(liveData.ownNet)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center w-full">
                                    <p className="text-xs text-muted-foreground">Sub-Network (+5% BV, ₹10/PV)</p>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button className="text-[10px] text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 font-medium cursor-pointer ml-2">
                                                <ListOrdered className="h-3 w-3" /> Details
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                    <ListOrdered className="h-4 w-4 text-emerald-600" />
                                                    Sub-Network Breakdown
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="max-h-[350px] overflow-y-auto space-y-2 mt-2 pr-1">
                                                {liveData.subNetworkDetails && liveData.subNetworkDetails.length > 0 ? (
                                                    liveData.subNetworkDetails.map((sub: any, i: number) => (
                                                        <div key={i} className="flex justify-between items-center p-3 border rounded-lg bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors">
                                                            <div>
                                                                <p className="font-semibold text-sm line-clamp-1">{sub.shopName}</p>
                                                                <p className="text-xs font-mono text-muted-foreground">{sub.vendorId}</p>
                                                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                                                    BV: {sub.bvContribution} | PV: {sub.pvContribution}
                                                                </p>
                                                            </div>
                                                            <div className="text-right flex flex-col items-end">
                                                                <p className="text-[10px] text-muted-foreground line-through">₹{sub.earnedOverride.toFixed(2)}</p>
                                                                <p className="text-[10px] text-red-500/80 mb-0.5">-₹{(sub.adminCharge + sub.tdsCharge).toFixed(2)}</p>
                                                                <p className="font-bold text-sm text-emerald-600 block">₹{sub.netOverride.toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 text-muted-foreground text-sm glass rounded-lg">
                                                        No sub-network business generated yet this month.
                                                    </div>
                                                )}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <p className="text-xl font-semibold text-foreground">{formatCurrency(liveData.projectedSubOverride)}</p>
                                {liveData.projectedSubOverride > 0 && (
                                    <div className="text-[10px] mt-1 flex flex-col gap-0.5">
                                        <span className="text-red-500/80">- {formatCurrency(liveData.subAdminCharge + liveData.subTdsCharge)} (7% Deduction)</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Net Expected: {formatCurrency(liveData.subNet)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1 hidden md:block">
                                <p className="text-xs text-muted-foreground">Total Pre-Deduction</p>
                                <p className="text-sm font-semibold text-muted-foreground">
                                    {formatCurrency(liveData.totalProjectedGross)}
                                </p>
                            </div>
                            <div className="space-y-1 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Projected Net Credit</p>
                                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(liveData.totalProjectedNet)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="glass premium-shadow">
                <CardHeader className="border-b space-y-4 pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle className="text-lg">Bonus Timeline</CardTitle>
                        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-lg border">
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
                    </div>
                </CardHeader>

                <CardContent className="p-0 overflow-x-auto">
                    {payouts.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Banknote className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                            <h3 className="text-lg font-medium text-foreground">No Bonuses Generated</h3>
                            <p className="text-sm">There are no differentials or overrides for the selected month.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="font-semibold text-xs uppercase lg:pl-6">Earning Origin</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase text-right">Target Base</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase text-right">Gross Bonus</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase text-right">Deductions</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase text-right">Net Credit</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase text-center lg:pr-6">Clearance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payouts.map((p) => {
                                    const isSelf = p.earningType === 'OWN_DIFFERENTIAL';
                                    
                                    return (
                                        <TableRow key={p._id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10">
                                            <TableCell className="lg:pl-6">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <Badge className={isSelf ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-purple-100 text-purple-800 border-purple-200"}>
                                                        {isSelf ? "Extra +5% BV / +₹10 PV" : "Sub-Network Override"}
                                                    </Badge>
                                                    {!isSelf && p.sourceFranchiseId && (
                                                        <span className="text-xs text-muted-foreground mt-1">
                                                            Source: <b className="text-foreground">{p.sourceFranchiseId.shopName}</b>
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <div className="flex flex-col text-xs text-muted-foreground">
                                                    <span>BV Base: <b>{p.baseBv}</b></span>
                                                    <span>PV Base: <b>{p.basePv}</b></span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-right font-medium text-foreground">
                                                {formatCurrency(p.grossPayout)}
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <div className="flex flex-col text-[10px] text-red-500/80">
                                                    <span>Adm 5%: -{formatCurrency(p.adminCharge)}</span>
                                                    <span>TDS 2%: -{formatCurrency(p.tdsCharge)}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-right font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(p.netPayout)}
                                            </TableCell>

                                            <TableCell className="text-center lg:pr-6">
                                                {p.status === 'paid' ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Badge className="bg-emerald-100/50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Cleared
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground">{new Date(p.paidAt!).toLocaleDateString()}</span>
                                                    </div>
                                                ) : (
                                                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 gap-1 pb-0.5 pt-0.5">
                                                        <AlertTriangle className="h-3 w-3 mr-1" /> Pending Admin
                                                    </Badge>
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
            </main>
        </div>
    );
};

export default FranchiseMasterPayouts;
