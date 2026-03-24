import { useState, useEffect } from "react";
import { RefreshCw, Zap, CheckCircle2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
    getBikeCarFundLivePool,
    getBikeCarFundPools,
    triggerBikeCarFund,
    applyBikeCarFundCredits
} from "@/services/adminService";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminBikeCarFund() {
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingPools, setLoadingPools] = useState(true);
    const [triggering, setTriggering] = useState(false);
    const [applying, setApplying] = useState(false);

    const today = new Date();
    const [actionMonth, setActionMonth] = useState<string>((today.getMonth() + 1).toString());
    const [actionYear, setActionYear] = useState<string>(today.getFullYear().toString());

    const [livePoolData, setLivePoolData] = useState<any>(null);
    const [activeUsers, setActiveUsers] = useState<any[]>([]);
    const [pools, setPools] = useState<any[]>([]);
    const [poolPagination, setPoolPagination] = useState({ page: 1, totalPages: 1 });

    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
        fetchPools(1);
    }, []);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await getBikeCarFundLivePool();
            if (res.success && res.data) {
                setLivePoolData(res.data.pool);
                setActiveUsers(res.data.users || []);
            }
        } catch (error) {
            console.error("Failed to fetch live pool data:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchPools = async (page: number) => {
        setLoadingPools(true);
        try {
            const res = await getBikeCarFundPools(page, 12);
            if (res.data && Array.isArray(res.data.pools)) {
                setPools(res.data.pools);
                setPoolPagination({
                    page: res.data.page || page,
                    totalPages: Math.ceil((res.data.total || 1) / 12)
                });
            }
        } catch (error) {
            console.error("Failed to fetch pools:", error);
        } finally {
            setLoadingPools(false);
        }
    };

    const handleTrigger = async () => {
        setTriggering(true);
        try {
            const y = parseInt(actionYear);
            const m = parseInt(actionMonth);
            const res = await triggerBikeCarFund(y, m);
            if (res) {
                toast({ title: "Trigger Successful", description: "Bike & Car Fund month-end computation staged." });
                fetchPools(1);
            }
        } catch (error: any) {
            toast({ title: "Trigger Failed", description: error.response?.data?.error || error.response?.data?.message || "Failed to trigger.", variant: "destructive" });
        } finally {
            setTriggering(false);
        }
    };

    const handleApplyCredits = async () => {
        setApplying(true);
        try {
            const y = parseInt(actionYear);
            const m = parseInt(actionMonth);
            const res = await applyBikeCarFundCredits(y, m);
            if (res) {
                toast({ title: "Credits Applied", description: "Bike & Car Fund wallet credits applied successfully." });
                fetchPools(1);
            }
        } catch (error: any) {
            toast({ title: "Apply Failed", description: error.response?.data?.error || error.response?.data?.message || "Failed to apply credits.", variant: "destructive" });
        } finally {
            setApplying(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-lg glass premium-shadow border-primary/10">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bike & Car Fund Admin</h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor live eligible users, manage monthly pools — <strong>1,00,000 BV = 1 Unit, No Capping, 5% Pool</strong>
                    </p>
                </div>

                {/* Management Actions */}
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                    <span className="text-sm font-medium text-muted-foreground mr-2">Action Target:</span>
                    <Select value={actionMonth} onValueChange={setActionMonth}>
                        <SelectTrigger className="w-[110px] h-9">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <SelectItem key={m} value={m.toString()}>
                                    {new Date(2000, m - 1).toLocaleString('default', { month: 'short' })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={actionYear} onValueChange={setActionYear}>
                        <SelectTrigger className="w-[90px] h-9">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {[today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].map(y => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="mx-2 w-px h-6 bg-border"></div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" disabled={triggering} className="gap-1 border-primary/30 text-primary hover:bg-primary/10">
                                <Zap className="h-4 w-4" /> {triggering ? "..." : "Stage"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Stage Pool Distribution?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will compute Bike & Car Fund pool amounts and unit values for <strong>{actionMonth}/{actionYear}</strong>.
                                    It creates wallet credit records but does <strong>NOT</strong> apply the money to wallets yet.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleTrigger} className="bg-primary text-primary-foreground">Confirm Stage</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="sm" disabled={applying} className="gap-1 shadow-glow-primary">
                                <CheckCircle2 className="h-4 w-4" /> {applying ? "..." : "Apply"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass border-green-500/20">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-green-600">Apply Bike & Car Fund Credits?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will irrevocably apply the staged bonus to user wallets for <strong>{actionMonth}/{actionYear}</strong>.
                                    This action is <strong>final</strong>.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleApplyCredits} className="bg-green-600 hover:bg-green-700 text-white">Execute Final Payout</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <Tabs defaultValue="estimates" className="w-full">
                <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-6">
                    <TabsTrigger value="estimates">Live Estimates (Active Users)</TabsTrigger>
                    <TabsTrigger value="pools">Monthly Pools History</TabsTrigger>
                </TabsList>

                {/* TAB: Live Estimates */}
                <TabsContent value="estimates">
                    <div className="space-y-6">
                        {/* Live Pool Metrics */}
                        {livePoolData && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card className="glass premium-shadow">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Company Total BV</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{livePoolData.companyTotalBV?.toLocaleString() || 0}</div>
                                    </CardContent>
                                </Card>
                                <Card className="glass premium-shadow border-indigo-500/20 bg-indigo-500/5">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-indigo-600">5% Pool Amount</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-indigo-600">₹{livePoolData.poolAmount?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || 0}</div>
                                    </CardContent>
                                </Card>
                                <Card className="glass premium-shadow">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Units Generated</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{livePoolData.totalUnits || 0}</div>
                                        <p className="text-xs text-muted-foreground mt-1">{livePoolData.eligibleUserCount || 0} Eligible · 1,00,000 BV/Unit</p>
                                    </CardContent>
                                </Card>
                                <Card className="glass premium-shadow border-green-500/20">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-green-600">Per Unit Value</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">₹{livePoolData.perUnitValue?.toFixed(2) || '0.00'}</div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        <Card className="glass premium-shadow overflow-hidden border-t-4 border-t-indigo-500">
                            <CardHeader className="flex flex-row items-center justify-between bg-muted/20 pb-4">
                                <div>
                                    <CardTitle>Current Month Live Tracker</CardTitle>
                                    <CardDescription>Real-time Bike & Car Fund unit estimates — no capping applied.</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={fetchUsers}>
                                    <RefreshCw className={`h-4 w-4 ${loadingUsers ? 'animate-spin text-primary' : ''}`} />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Total Left BV</TableHead>
                                                <TableHead>Total Right BV</TableHead>
                                                <TableHead className="text-blue-600 text-xs">Self BV (Add-on)</TableHead>
                                                <TableHead>Adjusted Weaker Leg</TableHead>
                                                <TableHead>Projected Units</TableHead>
                                                <TableHead className="text-right">Est. Net Final (₹)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loadingUsers ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-40 text-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : activeUsers.length > 0 ? (
                                                activeUsers.map((u, i) => (
                                                    <TableRow key={i} className="hover:bg-accent/40">
                                                        <TableCell>
                                                            <div className="font-medium">{u.fullName || u.memberId}</div>
                                                            <div className="text-xs text-muted-foreground">{u.memberId}</div>
                                                        </TableCell>
                                                        <TableCell>{(u.leftBV || u.adjustedLeft || 0).toLocaleString()}</TableCell>
                                                        <TableCell>{(u.rightBV || u.adjustedRight || 0).toLocaleString()}</TableCell>
                                                        <TableCell className="text-blue-500 font-medium">+{(u.personalBV || 0).toLocaleString()}</TableCell>
                                                        <TableCell className="font-semibold text-primary/80">
                                                            {(u.adjustedWeakerLeg || Math.min(u.adjustedLeft || 0, u.adjustedRight || 0)).toLocaleString()} BV
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="border-indigo-500/30 text-indigo-600 bg-indigo-500/5">
                                                                {u.finalUnits || 0}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="text-green-600 font-bold">₹{u.estimatedNet?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0'}</div>
                                                            <div className="text-[10px] text-muted-foreground mt-0.5">Gross: ₹{u.estimatedGross?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0'}</div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                                                        No active members currently qualifying for the Bike & Car Fund pool.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB: Monthly Pools */}
                <TabsContent value="pools">
                    <Card className="glass premium-shadow overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between bg-muted/20 pb-4">
                            <div>
                                <CardTitle>Pool Distributions</CardTitle>
                                <CardDescription>History of Bike & Car Fund pool computations and payouts.</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => fetchPools(1)}>
                                <RefreshCw className={`h-4 w-4 ${loadingPools ? 'animate-spin text-primary' : ''}`} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Target Month</TableHead>
                                            <TableHead>Total Company BV</TableHead>
                                            <TableHead className="text-indigo-600">5% Pool Cash</TableHead>
                                            <TableHead>Total Units</TableHead>
                                            <TableHead className="text-green-600">Per Unit Value</TableHead>
                                            <TableHead>Qualifiers</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingPools ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-40 text-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                                </TableCell>
                                            </TableRow>
                                        ) : pools.length > 0 ? (
                                            pools.map((p, i) => (
                                                <TableRow key={i} className="hover:bg-accent/40">
                                                    <TableCell className="font-medium whitespace-nowrap flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        {new Date(p.year, p.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
                                                    </TableCell>
                                                    <TableCell>{(p.companyTotalBV || 0).toLocaleString()}</TableCell>
                                                    <TableCell className="font-bold text-indigo-600">₹{(p.poolAmount || 0).toLocaleString('en-IN')}</TableCell>
                                                    <TableCell>{p.totalUnits}</TableCell>
                                                    <TableCell className="font-bold text-green-600">₹{(p.perUnitValue || 0).toFixed(2)}</TableCell>
                                                    <TableCell>{p.eligibleUserCount}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={p.status === 'distributed' ? 'default' : 'secondary'} className={p.status === 'distributed' ? 'bg-green-500' : 'bg-orange-500'}>
                                                            {p.status ? p.status.toUpperCase() : 'PENDING'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                                                    No bike & car fund pools have been staged yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {poolPagination.totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        Page {poolPagination.page} of {poolPagination.totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" disabled={poolPagination.page <= 1} onClick={() => fetchPools(poolPagination.page - 1)}>Previous</Button>
                                        <Button variant="outline" size="sm" disabled={poolPagination.page >= poolPagination.totalPages} onClick={() => fetchPools(poolPagination.page + 1)}>Next</Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
