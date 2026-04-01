import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Info, TrendingUp, Calendar, ArrowRight, ArrowLeft, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IsolatedBvHistory from "@/components/dashboard/IsolatedBvHistory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getHouseFundStatus, getHouseFundHistory, getHouseFundLiveEstimate } from "@/services/userService";

export default function HouseFund() {
    const [loading, setLoading] = useState(true);
    const [estimateLoading, setEstimateLoading] = useState(true);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [statusData, setStatusData] = useState<any>(null);
    const [liveEstimate, setLiveEstimate] = useState<any>(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    useEffect(() => {
        fetchData(1);
    }, []);

    const fetchData = async (page: number) => {
        setLoading(true);
        try {
            // Phase 1: Fast APIs — status + history (instant)
            const [statusRes, historyRes] = await Promise.allSettled([
                getHouseFundStatus(),
                getHouseFundHistory(page, 10)
            ]);

            if (statusRes.status === 'fulfilled' && statusRes.value?.success) {
                setStatusData(statusRes.value.data);
            }

            if (historyRes.status === 'fulfilled' && historyRes.value?.success) {
                const historyArray = historyRes.value.data || [];
                setHistoryData(Array.isArray(historyArray) ? historyArray : (historyArray.docs || []));

                if (historyRes.value.data?.pagination) {
                    setPagination({
                        page: historyRes.value.data.pagination.currentPage || historyRes.value.data.pagination.page || page,
                        totalPages: historyRes.value.data.pagination.totalPages || historyRes.value.data.pagination.pages || 1
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch House Fund data:", error);
        } finally {
            setLoading(false);
        }

        // Phase 2: Slow API — live estimate (loads in background)
        setEstimateLoading(true);
        try {
            const estimateRes = await getHouseFundLiveEstimate();
            if (estimateRes?.success) {
                setLiveEstimate(estimateRes.data);
            }
        } catch (error) {
            console.error("Failed to fetch live estimate:", error);
        } finally {
            setEstimateLoading(false);
        }
    };

    if (loading && historyData.length === 0 && !statusData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const { bvBreakdown, units, activeCycle } = statusData || {};

    const formatCycle = (cycle?: any) => {
        if (!cycle) return "Current Cycle";
        const cycleNum = cycle.cycleNumber || cycle.number;
        const cycleYear = cycle.cycleYear || cycle.year;
        if (cycleNum === 1) return `Apr - Sep ${cycleYear}`;
        if (cycleNum === 2) return `Oct ${cycleYear} - Mar ${cycleYear + 1}`;
        return `Cycle ${cycleNum} ${cycleYear}`;
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">House Fund</h1>
                    <p className="text-muted-foreground mt-1">
                        Track your 3% BV Half-Yearly Pool earnings — <strong>2,50,000 BV = 1 Unit</strong>, <strong>No Capping</strong>
                    </p>
                </div>
                <Badge variant="outline" className="text-sm border-emerald-500/30 text-emerald-600 bg-emerald-500/10 px-3 py-1.5 self-start">
                    <Home className="h-3.5 w-3.5 mr-1" /> 3% Half-Yearly Pool
                </Badge>
            </div>

            {/* Live Pool & Earning Estimate */}
            {estimateLoading ? (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Live Pool & Earning Estimate
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <Card key={i} className="glass premium-shadow border-primary/10">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                                        <span className="text-sm text-muted-foreground">Calculating...</span>
                                    </div>
                                    <div className="h-8 mt-2 bg-muted/50 rounded animate-pulse" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : liveEstimate && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                        Live Pool Estimate ({formatCycle(liveEstimate.activeCycle || liveEstimate.currentCycle)})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="glass premium-shadow border-emerald-500/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Company 6-Month BV</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{liveEstimate.companyBV?.totalBV?.toLocaleString() || liveEstimate.pool?.companyTotalBV?.toLocaleString() || 0}</div>
                            </CardContent>
                        </Card>
                        <Card className="glass premium-shadow border-emerald-500/20 bg-emerald-500/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-emerald-700">3% Pool Value</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-700">₹{(liveEstimate.companyBV?.poolAmount || liveEstimate.pool?.poolAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                            </CardContent>
                        </Card>
                        <Card className="glass premium-shadow border-emerald-500/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Unit Value</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-muted-foreground">₹{(liveEstimate.pool?.perUnitValue || 0).toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card className="glass premium-shadow border-green-500/30 bg-green-500/10 hover:border-green-500/50 transition-colors">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-green-700">Live Net Estimate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">₹{(liveEstimate.myEstimate?.netEarning || liveEstimate.estimatedNet || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                                <p className="text-xs text-green-700/80 mt-1">Based on {liveEstimate.myEstimate?.myUnits || liveEstimate.projectedUnits || 0} units (2,50,000 BV each)</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Status Breakdown */}
            {statusData && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-3 flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-emerald-500" />
                                Your Qualification Status
                            </span>
                            <Badge variant="outline" className="text-sm border-emerald-500/20 bg-emerald-500/5 text-emerald-700">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatCycle(activeCycle)}
                            </Badge>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Left Leg */}
                            <Card className="glass premium-shadow border-emerald-500/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                        <ArrowLeft className="h-3.5 w-3.5 text-emerald-500" /> Left Branch BV
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{(bvBreakdown?.adjustedLeft || bvBreakdown?.leftBV || 0).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">Total</span></div>
                                    <div className="space-y-1 mt-3">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Fresh (6m):</span>
                                            <span className="font-semibold text-foreground">{(bvBreakdown?.freshLeftBV || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Carry Fwd:</span>
                                            <span className="font-semibold text-foreground">{(bvBreakdown?.carryLeftBV || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Right Leg */}
                            <Card className="glass premium-shadow border-emerald-500/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-end gap-1">
                                        Right Branch BV <ArrowRight className="h-3.5 w-3.5 text-emerald-500" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-right">{(bvBreakdown?.adjustedRight || bvBreakdown?.rightBV || 0).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">Total</span></div>
                                    <div className="space-y-1 mt-3">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Fresh (6m):</span>
                                            <span className="font-semibold text-foreground">{(bvBreakdown?.freshRightBV || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Carry Fwd:</span>
                                            <span className="font-semibold text-foreground">{(bvBreakdown?.carryRightBV || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Personal BV Add-on */}
                            <Card className="glass premium-shadow border-teal-500/20 bg-teal-500/5">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-teal-700">Personal Add-on</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-teal-700">
                                        +{(bvBreakdown?.personalBV || 0).toLocaleString()} <span className="text-sm font-normal text-teal-700/70">BV</span>
                                    </div>
                                    <p className="text-xs text-teal-700/80 mt-2">
                                        Added to weaker side ({bvBreakdown?.weakerSide || 'N/A'}) to boost pairs.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Estimated Units — No Capping */}
                            <Card className="glass premium-shadow border-emerald-500/20 bg-emerald-500/10">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-emerald-700 mb-1">Projected Units</p>
                                            <div className="text-4xl font-black text-emerald-700 tracking-tight">
                                                {units?.estimated || units?.projected || 0}
                                            </div>
                                        </div>
                                        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                                            No Cap
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-emerald-700/80 mt-3 font-medium">
                                        2,50,000 BV = 1 Unit
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            
            {/* History Tabs */}
            <Tabs defaultValue="payouts" className="mt-8">
                <TabsList className="mb-4 bg-muted/50 p-1 border border-border/50">
                    <TabsTrigger value="payouts" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Bonus Payout History</TabsTrigger>
                    <TabsTrigger value="bv-match" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">BV Match History</TabsTrigger>
                </TabsList>

                <TabsContent value="payouts" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                    {/* Payout History */}
            <Card className="glass premium-shadow overflow-hidden border-emerald-500/10 mt-8">
                <CardHeader className="border-b border-border/50 bg-emerald-50/50 dark:bg-emerald-950/20 pb-4">
                    <CardTitle className="text-emerald-900 dark:text-emerald-100">House Fund Payout History</CardTitle>
                    <CardDescription>Records of your half-yearly distributed units and payouts.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto min-h-[300px]">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="w-[180px]">Cycle</TableHead>
                                    <TableHead>Matched Units</TableHead>
                                    <TableHead className="text-right">Gross Credit</TableHead>
                                    <TableHead className="text-right text-orange-500">Deductions (7%)</TableHead>
                                    <TableHead className="text-right text-emerald-600">Net Credited</TableHead>
                                    <TableHead>Credited At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historyData.length > 0 ? (
                                    historyData.map((record, index) => (
                                        <TableRow key={index} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors">
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {formatCycle({ cycleNumber: record.cycleNumber, cycleYear: record.cycleYear || record.year })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-700">
                                                    {record.finalUnits} Units
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                ₹{(record.grossCredit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-right text-orange-500 text-sm">
                                                -₹{((record.adminCharge || 0) + (record.tds || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                                    Admin: ₹{(record.adminCharge || 0).toLocaleString('en-IN')} | TDS: ₹{(record.tds || 0).toLocaleString('en-IN')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-emerald-600 font-bold text-base">
                                                +₹{(record.netCredit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {record.creditedAt ? format(new Date(record.creditedAt), 'dd MMM yyyy, hh:mm a') : 'Pending'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                            No half-yearly house fund payout history found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t bg-emerald-50/30 dark:bg-emerald-950/10">
                            <div className="text-sm text-muted-foreground">
                                Page {pagination.page} of {pagination.totalPages}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="border-emerald-200 hover:bg-emerald-50" disabled={pagination.page <= 1} onClick={() => fetchData(pagination.page - 1)}>Previous</Button>
                                <Button variant="outline" size="sm" className="border-emerald-200 hover:bg-emerald-50" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchData(pagination.page + 1)}>Next</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
                </TabsContent>

                <TabsContent value="bv-match" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                    <IsolatedBvHistory type="half-yearly" />
                </TabsContent>
            </Tabs>

        </div>
    );
}
