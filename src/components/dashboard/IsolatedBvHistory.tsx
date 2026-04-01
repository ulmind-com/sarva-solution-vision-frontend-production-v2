import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMonthlyBvHistory, getHalfYearlyBvHistory, getYearlyBvHistory } from "@/services/userService";
import { History, TrendingDown, ArrowRight, ArrowLeft } from "lucide-react";

interface IsolatedBvHistoryProps {
    type: 'monthly' | 'half-yearly' | 'yearly';
}

export default function IsolatedBvHistory({ type }: IsolatedBvHistoryProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                let res;
                if (type === 'monthly') {
                    res = await getMonthlyBvHistory(12);
                } else if (type === 'half-yearly') {
                    res = await getHalfYearlyBvHistory(4);
                } else {
                    res = await getYearlyBvHistory(3);
                }

                if (res?.success) {
                    setData(res.data || []);
                } else {
                    setError("Failed to load historical data.");
                }
            } catch (err: any) {
                console.error("Historical BV Error:", err);
                setError(err.response?.data?.message || "Failed to load historical data.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [type]);

    return (
        <Card className="glass premium-shadow overflow-hidden mt-6 border-slate-200/50">
            <CardHeader className="border-b border-border/50 bg-slate-50/50 pb-4">
                <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-slate-500" />
                    <div>
                        <CardTitle className="text-base text-slate-800">BV Performance History</CardTitle>
                        <CardDescription className="text-xs mt-1">
                            A completely isolated view of your historical Left, Right, and Personal BV matching.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto min-h-[250px]">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
                                <TableHead className="w-[160px] font-semibold text-slate-900">Period</TableHead>
                                <TableHead className="font-semibold text-slate-700">Left Branch BV</TableHead>
                                <TableHead className="font-semibold text-slate-700">Right Branch BV</TableHead>
                                <TableHead className="font-semibold text-blue-700">Personal Add-on</TableHead>
                                <TableHead className="text-right font-semibold text-indigo-700">Total Match</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48">
                                        <div className="flex flex-col items-center justify-center h-full space-y-3">
                                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-slate-600" />
                                            <span className="text-sm text-slate-500">Loading historical data...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-red-500">
                                        {error}
                                    </TableCell>
                                </TableRow>
                            ) : data.length > 0 ? (
                                data.map((record, index) => (
                                    <TableRow key={index} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-medium whitespace-nowrap text-slate-800">
                                            {record.period}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="font-medium text-slate-700">{(record.leftBV || 0).toLocaleString()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-medium text-slate-700">{(record.rightBV || 0).toLocaleString()}</span>
                                                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                +{(record.personalBV || 0).toLocaleString()} BV
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="font-bold text-indigo-600">
                                                {(record.totalMatch || 0).toLocaleString()} BV
                                            </span>
                                            <div className="text-[10px] text-slate-500 mt-0.5">
                                                Weaker Side
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48">
                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                            <TrendingDown className="h-8 w-8 mb-2 opacity-20" />
                                            <p>No historical BV data found for your account.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
