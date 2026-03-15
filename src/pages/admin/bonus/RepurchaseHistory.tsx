import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getSelfRepurchaseBvHistory } from "@/services/adminService";

export default function GlobalRepurchaseHistory() {
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getSelfRepurchaseBvHistory();
            if (res.success) {
                setHistory(res.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch BV history:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-lg glass premium-shadow border-primary/10">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">SRB Company BV History</h1>
                    <p className="text-muted-foreground mt-1">
                        Month-wise log of Company total BV and Self Repurchase Bonus pool distribution status.
                    </p>
                </div>
            </div>

            <Card className="glass premium-shadow overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                    <CardTitle>Monthly Aggregated Records</CardTitle>
                    <CardDescription>Company BV totals by calendar month.</CardDescription>
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
                                        <TableHead>Total BV Generated</TableHead>
                                        <TableHead>Transactions</TableHead>
                                        <TableHead>Pool Status</TableHead>
                                        <TableHead>Pool Amount</TableHead>
                                        <TableHead>Qualifiers</TableHead>
                                        <TableHead className="text-right">Net Share / User</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.length > 0 ? (
                                        history.map((record, index) => (
                                            <TableRow key={`${record.year}-${record.month}-${index}`} className="hover:bg-accent/40 transition-colors">
                                                <TableCell className="font-semibold whitespace-nowrap">
                                                    {format(new Date(record.year, record.month - 1), 'MMMM yyyy')}
                                                </TableCell>
                                                <TableCell className="font-bold text-primary">
                                                    {record.companyTotalBV?.toLocaleString('en-IN') || 0} BV
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {record.totalTransactions || 0}
                                                </TableCell>
                                                <TableCell>
                                                    {record.poolStatus === 'distributed' && (
                                                        <Badge className="bg-green-500 hover:bg-green-600">Distributed</Badge>
                                                    )}
                                                    {record.poolStatus === 'pending' && (
                                                        <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/10">Pending</Badge>
                                                    )}
                                                    {record.poolStatus === 'held' && (
                                                        <Badge variant="secondary">Held</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium text-green-600">
                                                    ₹{record.actualPoolAmount ? record.actualPoolAmount.toLocaleString('en-IN') : record.projectedPool?.toLocaleString('en-IN') || 0}
                                                </TableCell>
                                                <TableCell>
                                                    {record.eligibleUserCount ?? '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    ₹{record.netSharePerUser?.toLocaleString('en-IN') ?? '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                                No Company BV history records found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
