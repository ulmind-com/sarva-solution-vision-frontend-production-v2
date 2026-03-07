import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getGlobalRepurchaseHistory } from "@/services/adminService";
import { useDebounce } from "@/hooks/useDebounce";

export default function GlobalRepurchaseHistory() {
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    useEffect(() => {
        fetchData(1, debouncedSearch);
    }, [debouncedSearch]);

    const fetchData = async (page: number, memberId = "") => {
        setLoading(true);
        try {
            const res = await getGlobalRepurchaseHistory(page, 20, memberId);
            if (res.success) {
                setHistory(res.data?.history || res.data?.docs || []);
                if (res.data?.pagination) {
                    setPagination({
                        page: res.data.pagination.currentPage || page,
                        totalPages: res.data.pagination.totalPages || 1
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch global history:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-lg glass premium-shadow border-primary/10">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Global Repurchase History</h1>
                    <p className="text-muted-foreground mt-1">
                        Log of all repurchase bonuses distributed to network members.
                    </p>
                </div>
            </div>

            <Card className="glass premium-shadow overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Distribution Log</CardTitle>
                            <CardDescription>Search distributions by Member ID.</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by Member ID..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
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
                                        <TableHead>Date / Time</TableHead>
                                        <TableHead>Member ID</TableHead>
                                        <TableHead>User Name</TableHead>
                                        <TableHead>Month Pool</TableHead>
                                        <TableHead>Bonus Amount (₹)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.length > 0 ? (
                                        history.map((record) => (
                                            <TableRow key={record._id} className="hover:bg-accent/40 transition-colors">
                                                <TableCell className="text-muted-foreground whitespace-nowrap">
                                                    {record.createdAt ? format(new Date(record.createdAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                                                </TableCell>
                                                <TableCell className="font-semibold text-primary">
                                                    {record.user?.memberId || record.memberId}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {record.user?.fullName || record.fullName || 'Unknown'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-normal bg-background/50">
                                                        {record.monthYear || record.month || 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-green-600 font-bold">
                                                    +₹{record.amount?.toLocaleString('en-IN') || '0'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                                {searchTerm ? "No distributions found for this member." : "No global repurchase distributions logged."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>

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
                                    onClick={() => fetchData(pagination.page - 1, debouncedSearch)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => fetchData(pagination.page + 1, debouncedSearch)}
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
