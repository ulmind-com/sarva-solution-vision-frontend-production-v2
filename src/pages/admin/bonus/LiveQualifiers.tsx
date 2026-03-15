import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Users, Timer, TrendingUp, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getSelfRepurchaseLivePool } from "@/services/adminService";

export default function LiveQualifiers() {
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [poolData, setPoolData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getSelfRepurchaseLivePool();
            if (res.success) {
                setPoolData(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch live qualifiers:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!poolData) {
        return (
            <div className="p-8 text-center bg-card rounded-lg border mt-6">
                <p className="text-muted-foreground">Unable to load the live pool data at this time.</p>
            </div>
        );
    }

    const { eligibleUsers = [] } = poolData;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-lg glass premium-shadow border-primary/10">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Live Qualifiers Pool</h1>
                    <p className="text-muted-foreground mt-1">
                        Real-time tracking of members eligible for the SRB pool (Day 1 to {poolData.eligibilityWindowDay}).
                    </p>
                </div>
                {poolData.windowClosed ? (
                    <Badge variant="secondary" className="px-4 py-2 font-semibold">
                        Window Closed
                    </Badge>
                ) : (
                    <Badge variant="outline" className="px-4 py-2 font-semibold bg-green-500/10 text-green-600 border-green-500/20">
                        <Timer className="w-4 h-4 mr-2" />
                        Closes {poolData.windowClosesAt ? format(parseISO(poolData.windowClosesAt), 'MMM dd, HH:mm') : 'Soon'}
                    </Badge>
                )}
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="glass border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-muted-foreground">
                        <CardTitle className="text-sm font-medium">Eligible Members</CardTitle>
                        <Users className="w-4 h-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{poolData.eligibleUserCount || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total qualifiers found</p>
                    </CardContent>
                </Card>

                <Card className="glass border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-muted-foreground">
                        <CardTitle className="text-sm font-medium">Company BV (All)</CardTitle>
                        <TrendingUp className="w-4 h-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{poolData.companyTotalBV?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Company-wide repurchase BV</p>
                    </CardContent>
                </Card>

                <Card className="glass border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-muted-foreground">
                        <CardTitle className="text-sm font-medium">7% Projected Pool</CardTitle>
                        <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center font-bold text-[10px] text-primary">₹</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">₹{poolData.projectedPool?.toLocaleString('en-IN') || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">To be distributed evenly</p>
                    </CardContent>
                </Card>

                <Card className="glass bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Net Est. Share / User</CardTitle>
                        <IndianRupee className="w-4 h-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">₹{poolData.projectedNetSharePerUser?.toLocaleString('en-IN') || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Gross: ₹{poolData.projectedGrossSharePerUser?.toLocaleString('en-IN') || 0}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Live Qualifiers Table */}
            <Card className="glass premium-shadow overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                    <CardTitle>Qualifiers Directory</CardTitle>
                    <CardDescription>Live update of users eligible for this month's pool.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto min-h-[400px]">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>User</TableHead>
                                    <TableHead>Member ID</TableHead>
                                    <TableHead>Window BV Accumulated</TableHead>
                                    <TableHead className="text-right">Projected Net Bonus</TableHead>
                                    <TableHead className="text-right w-[80px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {eligibleUsers.length > 0 ? (
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    eligibleUsers.map((user: any) => (
                                        <TableRow key={user.userId || user.memberId} className="hover:bg-accent/40 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-primary/20">
                                                        <AvatarImage src={user.profileImage} />
                                                        <AvatarFallback className="bg-primary/10 text-primary">
                                                            {user.fullName ? user.fullName.charAt(0) : 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{user.fullName}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-primary">{user.memberId}</TableCell>
                                            <TableCell>
                                                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                                    {user.windowBV || 0} BV
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-green-600">
                                                ₹{user.projectedNetBonus?.toLocaleString('en-IN') || 0}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link to={`/admin/users/${user.memberId}`}>
                                                    <Button variant="ghost" size="icon" className="hover:bg-primary/10 text-primary transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
