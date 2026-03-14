import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Plus, AlertCircle, Building, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { getSelfRepurchaseCompanyBv, getSelfRepurchaseDistribution, triggerSelfRepurchaseDistribution } from "@/services/adminService";
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

export default function RepurchasePools() {
    const [loading, setLoading] = useState(false);
    const [triggering, setTriggering] = useState(false);
    
    // Default to current local month
    const currentDate = new Date();
    const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1); // 1-12
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [companyBvData, setCompanyBvData] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [distributionData, setDistributionData] = useState<any>(null);

    const { toast } = useToast();

    // Generate last 12 months for select
    const monthOptions = Array.from({ length: 12 }).map((_, i) => {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        return {
            value: `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`,
            label: format(d, 'MMMM yyyy'),
            year: d.getFullYear(),
            month: d.getMonth() + 1
        };
    });

    useEffect(() => {
        fetchData();
    }, [selectedYear, selectedMonth]);

    const fetchData = async () => {
        setLoading(true);
        const monthStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;
        
        try {
            const [bvRes, distRes] = await Promise.all([
                getSelfRepurchaseCompanyBv(monthStr).catch(() => ({ success: false, data: null })),
                getSelfRepurchaseDistribution(monthStr).catch(() => ({ success: false, data: null }))
            ]);

            if (bvRes.success) {
                setCompanyBvData(bvRes.data);
            } else {
                setCompanyBvData(null);
            }

            if (distRes.success) {
                setDistributionData(distRes.data);
            } else {
                setDistributionData(null);
            }
        } catch (error) {
            console.error("Failed to fetch Repurchase Bonus context:", error);
            setCompanyBvData(null);
            setDistributionData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleTriggerDistribution = async () => {
        setTriggering(true);
        try {
            const res = await triggerSelfRepurchaseDistribution(selectedYear, selectedMonth);
            if (res.success) {
                toast({
                    title: "Distribution Triggered Successfully",
                    description: res.message || "The repurchase bonus has been distributed.",
                    variant: "default",
                });
                fetchData(); // Refresh current month view
            } else {
                toast({
                    title: "Distribution Failed",
                    description: res.message || "Failed to trigger distribution.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Distribution Error",
                description: error.response?.data?.message || "An unexpected error occurred during distribution.",
                variant: "destructive",
                action: (
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                    </div>
                ),
            });
        } finally {
            setTriggering(false);
        }
    };

    const pool = distributionData?.pool;
    const credits = distributionData?.credits || [];

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-lg glass premium-shadow border-primary/10">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Self Repurchase Bonus</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        View monthly company BV metrics and manage pool distributions
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <Select 
                        value={`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`}
                        onValueChange={(val) => {
                            const opt = monthOptions.find(o => o.value === val);
                            if (opt) {
                                setSelectedYear(opt.year);
                                setSelectedMonth(opt.month);
                            }
                        }}
                    >
                        <SelectTrigger className="w-[180px] bg-background">
                            <Calendar className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {monthOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button disabled={triggering} className="shadow-glow-primary min-w-[180px]">
                                {triggering ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Trigger {format(new Date(selectedYear, selectedMonth - 1), 'MMM')} Distribution
                                    </>
                                )}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Trigger Distribution for {format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will distribute 7% of the company's total BV ({companyBvData?.companyTotalBV || 0} BV) among all eligible users. This action cannot be undone. Are you sure you want to proceed?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleTriggerDistribution} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                    Yes, Distribute Now
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12 min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    {/* Metrics Grid */}
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Company BV Card */}
                        <Card className="glass">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Company BV
                                </CardTitle>
                                <Building className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{companyBvData?.companyTotalBV?.toLocaleString() || 0} BV</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    From {companyBvData?.totalTransactions || 0} repurchase transactions
                                </p>
                            </CardContent>
                        </Card>

                        {/* Projected Pool */}
                        <Card className="glass">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total 7% Pool Amount
                                </CardTitle>
                                <div className="h-4 w-4 text-primary rounded-full bg-primary/10 flex items-center justify-center font-bold text-[10px]">₹</div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">₹{(companyBvData?.projectedPool || pool?.poolAmount || 0).toLocaleString('en-IN')}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Distributed to eligible qualifiers
                                </p>
                            </CardContent>
                        </Card>

                        {/* Status/Qualifiers */}
                        <Card className="glass border-primary/20 bg-primary/5">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Qualifiers
                                </CardTitle>
                                <Users className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">{pool?.eligibleUserCount || pool?.totalQualifiers || credits.length || 0}</div>
                                <div className="mt-1 flex items-center">
                                    <span className="text-xs mr-2">Status:</span>
                                    <Badge variant={pool?.status === 'distributed' ? 'default' : 'secondary'} className={`text-[10px] h-4 px-1 py-0 ${pool?.status === 'distributed' ? 'bg-green-500 hover:bg-green-600' : ''}`}>
                                        {pool?.status ? pool?.status.toUpperCase() : 'PENDING'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Credits Table */}
                    <Card className="glass premium-shadow overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-muted/20">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Distribution Details</CardTitle>
                                    <CardDescription>Per-user breakdown for {format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')}</CardDescription>
                                </div>
                                {pool?.status === 'distributed' && (
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-primary">₹{pool?.netSharePerUser?.toLocaleString('en-IN') || 0}</div>
                                        <div className="text-xs text-muted-foreground">Net Per User</div>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>Member ID</TableHead>
                                            <TableHead className="text-right">Gross Share</TableHead>
                                            <TableHead className="text-right">Admin (5%)</TableHead>
                                            <TableHead className="text-right">TDS (2%)</TableHead>
                                            <TableHead className="text-right font-semibold">Net Credit</TableHead>
                                            <TableHead className="w-[180px] text-right">Credited At</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {credits.length > 0 ? (
                                            credits.map((credit: any, idx: number) => (
                                                <TableRow key={idx} className="hover:bg-accent/40 transition-colors">
                                                    <TableCell className="font-medium whitespace-nowrap">
                                                        {credit.memberId}
                                                    </TableCell>
                                                    <TableCell className="text-right">₹{credit.grossAmount?.toLocaleString('en-IN')}</TableCell>
                                                    <TableCell className="text-right text-destructive">-₹{credit.adminCharge?.toLocaleString('en-IN')}</TableCell>
                                                    <TableCell className="text-right text-destructive">-₹{credit.tdsDeducted?.toLocaleString('en-IN')}</TableCell>
                                                    <TableCell className="text-right text-primary font-bold">₹{credit.netAmount?.toLocaleString('en-IN')}</TableCell>
                                                    <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                                                        {credit.creditedAt ? format(parseISO(credit.creditedAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                                    {pool?.status === 'pending' || !pool 
                                                        ? "Distribution has not been triggered for this month yet." 
                                                        : "No eligible users found for this month."}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
