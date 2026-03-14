import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Info, CheckCircle2, XCircle, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getSelfRepurchaseBonusStatus } from "@/services/userService";

export default function RepurchaseBonus() {
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [statusData, setStatusData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getSelfRepurchaseBonusStatus();
            if (res.success) {
                setStatusData(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch Self Repurchase Bonus data:", error);
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

    if (!statusData) {
        return (
            <div className="p-8 text-center bg-card rounded-lg border mt-6">
                <p className="text-muted-foreground">Unable to load Self Repurchase Bonus data.</p>
            </div>
        );
    }

    const { currentMonth, lastMonth } = statusData;
    const progressPercent = currentMonth 
        ? Math.min(100, (currentMonth.windowBV / (currentMonth.windowBV + currentMonth.bvNeededForEligibility)) * 100)
        : 0;

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Self Repurchase Bonus</h1>
                    <p className="text-muted-foreground mt-1">
                        Track your current month eligibility and view your latest bonus payout
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Current Month Tracking Card */}
                <Card className="glass premium-shadow border-primary/20 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Calendar className="w-32 h-32" />
                    </div>
                    
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center mb-1">
                            <Badge variant="outline" className="font-semibold px-3 py-1 bg-primary/5">
                                Current Window: {format(new Date(currentMonth.year, currentMonth.month - 1), 'MMMM yyyy')}
                            </Badge>
                            {currentMonth.isEligible ? (
                                <Badge className="bg-green-500 hover:bg-green-600 gap-1.5 px-2.5 py-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="gap-1.5 px-2.5 py-1">
                                    <XCircle className="w-3.5 h-3.5" /> Not Yet Eligible
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-xl">Eligibility Tracking</CardTitle>
                        <CardDescription>
                            Purchase window runs from the 1st to the {currentMonth.eligibilityWindowDay}th of the month.
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6 mt-2 relative z-10">
                        {/* Progress Section */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-sm font-medium text-muted-foreground">Accumulated window BV</span>
                                <span className="text-2xl font-bold text-primary">{currentMonth.windowBV} BV</span>
                            </div>
                            <Progress value={progressPercent} className="h-2.5" />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                                <span>0 BV</span>
                                <span>Min. 500 BV Target</span>
                            </div>
                        </div>

                        {/* Status Messages */}
                        <div className="bg-card/50 rounded-lg p-4 border border-border/40">
                            {currentMonth.isEligible ? (
                                <div className="flex gap-3 items-start">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-green-600 dark:text-green-400">Target Achieved!</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            You are eligible to claim a share of the Company's 7% pooling bonus at the end of this month.
                                        </p>
                                    </div>
                                </div>
                            ) : currentMonth.windowClosed ? (
                                <div className="flex gap-3 items-start">
                                    <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-destructive">Window Closed</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            The eligibility window for this month has closed. You accumulated {currentMonth.windowBV} BV.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-3 items-start">
                                    <Clock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-amber-600 dark:text-amber-400">Action Required</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            You need <strong>{currentMonth.bvNeededForEligibility} more BV</strong> before {format(parseISO(currentMonth.windowClosesAt), 'MMM do')} to qualify for this month's pool!
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Rules section */}
                        <div className="pt-4 border-t border-border/40">
                            <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                                <Info className="w-4 h-4 text-primary" /> How it works
                            </h4>
                            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-5">
                                <li>Earn <strong>≥ 500 BV</strong> via self-purchases between <strong>Day 1 to 17</strong>.</li>
                                <li>Eligible members equally share <strong>7%</strong> of the company's total monthly BV.</li>
                                <li>Bonus is automatically credited on the last day of the month.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Last Month Credit Card */}
                <Card className="glass premium-shadow flex flex-col">
                    <CardHeader className="pb-4">
                        <div className="flex justify-between items-center mb-1">
                            <Badge variant="secondary" className="font-semibold px-3 py-1">
                                Last Month: {lastMonth ? format(new Date(lastMonth.year, lastMonth.month - 1), 'MMMM yyyy') : 'Previous'}
                            </Badge>
                        </div>
                        <CardTitle className="text-xl">Latest Payout Details</CardTitle>
                        <CardDescription>
                            Your credited self repurchase bonus from the previous cycle.
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col justify-center">
                        {lastMonth ? (
                            lastMonth.bonusReceived ? (
                                <div className="space-y-6">
                                    <div className="text-center p-6 bg-green-500/10 rounded-xl border border-green-500/20">
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Net Credited Amount</p>
                                        <div className="text-4xl font-bold pl-1 text-primary">
                                            ₹{lastMonth.netAmount?.toLocaleString('en-IN') || 0}
                                        </div>
                                        {lastMonth.creditedAt && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Credited on {format(parseISO(lastMonth.creditedAt), 'MMM dd, yyyy - hh:mm a')}
                                            </p>
                                        )}
                                    </div>

                                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between items-center text-sm border-b pb-2">
                                            <span className="text-muted-foreground">Gross Share</span>
                                            <span className="font-medium">₹{lastMonth.grossAmount?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-destructive">
                                            <span>Admin Charge (5%)</span>
                                            <span>-₹{lastMonth.adminCharge?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-destructive border-b pb-2">
                                            <span>TDS (2%)</span>
                                            <span>-₹{lastMonth.tdsDeducted?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between items-center font-medium pt-1">
                                            <span>Net Wallet Credit</span>
                                            <span className="text-primary font-bold">₹{lastMonth.netAmount?.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/20 rounded-xl border border-dashed h-full">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <XCircle className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-medium text-lg mb-1">Did Not Qualify</h3>
                                    <p className="text-sm text-muted-foreground max-w-[250px]">
                                        You did not meet the 500 BV requirement in the first 17 days of {format(new Date(lastMonth.year, lastMonth.month - 1), 'MMMM')}.
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/20 rounded-xl border border-dashed h-full">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Clock className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <h3 className="font-medium text-lg mb-1">No Previous Data</h3>
                                <p className="text-sm text-muted-foreground max-w-[250px]">
                                    There are no self repurchase bonus records from the previous month.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
