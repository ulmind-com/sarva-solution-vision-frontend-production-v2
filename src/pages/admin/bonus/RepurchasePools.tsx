import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Copy, Plus, AlertCircle } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { getRepurchasePools, triggerRepurchaseDistribution } from "@/services/adminService";
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
    const [loading, setLoading] = useState(true);
    const [triggering, setTriggering] = useState(false);
    const [poolsData, setPoolsData] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const { toast } = useToast();

    useEffect(() => {
        fetchData(1);
    }, []);

    const fetchData = async (page: number) => {
        setLoading(true);
        try {
            const res = await getRepurchasePools(page, 10);
            if (res.success) {
                const poolArray = res.data?.pools || res.data?.docs || [];
                setPoolsData(poolArray);
                if (res.data?.pagination) {
                    setPagination({
                        page: res.data.pagination.currentPage || page,
                        totalPages: res.data.pagination.totalPages || 1
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch Repurchase Pools data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTriggerDistribution = async () => {
        setTriggering(true);
        try {
            const res = await triggerRepurchaseDistribution();
            if (res.success) {
                toast({
                    title: "Distribution Triggered Successfully",
                    description: res.message || "The repurchase bonus has been distributed.",
                    variant: "default",
                });
                fetchData(1); // Refresh pools
            } else {
                toast({
                    title: "Distribution Failed",
                    description: res.message || "Failed to trigger distribution. Maybe it was already processed for this month.",
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-lg glass premium-shadow border-primary/10">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Repurchase Bonus Pools</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage company-wide repurchase pools and trigger manual distributions
                    </p>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button disabled={triggering} className="shadow-glow-primary">
                            {triggering ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Trigger Distribution
                                </>
                            )}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Trigger Repurchase Distribution?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will calculate the total company repurchase BV for the previous month and distribute 7% of it among all eligible users (500+ BV). This action cannot be undone. Are you sure you want to proceed?
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

            {/* History Table */}
            <Card className="glass premium-shadow overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                    <CardTitle>Pool History</CardTitle>
                    <CardDescription>A record of all monthly pools created and processed.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto min-h-[400px]">
                        {loading ? (
                            <div className="flex items-center justify-center p-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Month</TableHead>
                                        <TableHead>Total Company BV</TableHead>
                                        <TableHead>7% Distribution Pool (₹)</TableHead>
                                        <TableHead>Eligible Qualifiers</TableHead>
                                        <TableHead>Bonus Per Qualifier (₹)</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {poolsData.length > 0 ? (
                                        poolsData.map((pool) => (
                                            <TableRow key={pool._id} className="hover:bg-accent/40 transition-colors">
                                                <TableCell className="font-medium whitespace-nowrap">
                                                    {pool.monthYear || pool.month}
                                                </TableCell>
                                                <TableCell>{pool.totalCompanyBV?.toLocaleString() || '0'} BV</TableCell>
                                                <TableCell className="text-primary font-medium">₹{pool.poolAmount?.toLocaleString('en-IN') || '0'}</TableCell>
                                                <TableCell>{pool.totalQualifiers || '0'} Users</TableCell>
                                                <TableCell className="font-semibold text-green-600">₹{pool.amountPerQualifier?.toLocaleString('en-IN') || '0'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={pool.status === 'distributed' ? 'default' : 'secondary'} className={pool.status === 'distributed' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                                        {pool.status ? pool.status.toUpperCase() : 'UNKNOWN'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                                No pool history found. Distributions may not have been triggered yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    {/* Pagination */}
                    {!loading && pagination.totalPages > 1 && (
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
