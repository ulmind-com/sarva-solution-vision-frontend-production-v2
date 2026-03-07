import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getLiveQualifiers } from "@/services/adminService";

export default function LiveQualifiers() {
    const [loading, setLoading] = useState(true);
    const [qualifiers, setQualifiers] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalUsers: 0 });

    useEffect(() => {
        fetchData(1);
    }, []);

    const fetchData = async (page: number) => {
        setLoading(true);
        try {
            const res = await getLiveQualifiers(page, 20);
            if (res.success) {
                setQualifiers(res.data?.qualifiers || res.data?.docs || []);
                if (res.data?.pagination) {
                    setPagination({
                        page: res.data.pagination.currentPage || page,
                        totalPages: res.data.pagination.totalPages || 1,
                        totalUsers: res.data.pagination.totalItems || res.data.pagination.totalUsers || 0
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch live qualifiers:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-lg glass premium-shadow border-primary/10">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Live Qualifiers</h1>
                    <p className="text-muted-foreground mt-1">
                        Users who have crossed 500+ BV in the current active repurchase window (1st to 10th).
                    </p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold border border-primary/20">
                    {pagination.totalUsers} Qualified Users
                </div>
            </div>

            <Card className="glass premium-shadow overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                    <CardTitle>Current Qualifiers Directory</CardTitle>
                    <CardDescription>Live update of users eligible for this month's pool.</CardDescription>
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
                                        <TableHead>User</TableHead>
                                        <TableHead>Member ID</TableHead>
                                        <TableHead>Current BV</TableHead>
                                        <TableHead>Rank</TableHead>
                                        <TableHead>Join Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {qualifiers.length > 0 ? (
                                        qualifiers.map((user) => (
                                            <TableRow key={user._id || user.memberId} className="hover:bg-accent/40 transition-colors">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 border border-primary/20">
                                                            <AvatarImage src={user.profileImage || user.profilePicture?.url} />
                                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                                {user.fullName ? user.fullName.charAt(0) : 'U'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{user.fullName}</p>
                                                            {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium text-primary">{user.memberId}</TableCell>
                                                <TableCell>
                                                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                                        {user.currentBV || user.repurchaseBV || '500+'} BV
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs font-normal">
                                                        {user.currentRank || user.rank || 'Member'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {user.createdAt ? format(new Date(user.createdAt), 'dd MMM yyyy') : 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                                No qualifiers found for the current window.
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
