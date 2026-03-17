import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, ChevronDown, ChevronRight, Clock, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import api from '@/lib/api';

interface WalletLog {
    userId: string;
    memberId: string;
    username: string;
    amount: number;
    grossAmount: number;
    purpose: string;
    status: string;
    time: string;
    createdAt: string;
}

interface GroupedLog {
    date: string;
    logs: WalletLog[];
}

interface WalletLogsResponse {
    success: boolean;
    message: string;
    data: {
        groupedLogs: GroupedLog[];
        pagination: {
            total: number;
            page: number;
            pages: number;
        };
    };
}

const WalletLogs = () => {
    const [groupedLogs, setGroupedLogs] = useState<GroupedLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
    
    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 50;

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await api.get<WalletLogsResponse>(`/api/v1/admin/wallet-logs?page=${page}&limit=${limit}`);
                
                if (response.data.success) {
                    setGroupedLogs(response.data.data.groupedLogs);
                    setTotalPages(response.data.data.pagination.pages);
                    setTotalRecords(response.data.data.pagination.total);
                    
                    // Auto-expand the first date if available and we are on page 1
                    if (page === 1 && response.data.data.groupedLogs.length > 0) {
                        const newExpanded = new Set<string>();
                        newExpanded.add(response.data.data.groupedLogs[0].date);
                        setExpandedDates(newExpanded);
                    }
                } else {
                    setError('Failed to fetch wallet logs');
                }
            } catch (err: any) {
                console.error('Error fetching wallet logs:', err);
                setError(err.response?.data?.message || 'Failed to fetch wallet logs');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [page]);

    const toggleDate = (date: string) => {
        const newExpanded = new Set(expandedDates);
        if (newExpanded.has(date)) {
            newExpanded.delete(date);
        } else {
            newExpanded.add(date);
        }
        setExpandedDates(newExpanded);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(amount || 0);
    };

    const formatDateHeading = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'success':
                return 'text-green-600 bg-green-50';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50';
            case 'failed':
            case 'rejected':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };
    
    const getAmountColor = (purpose: string, amount: number) => {
        if (purpose.toLowerCase().includes('withdraw') || amount < 0) {
            return 'text-red-600';
        }
        return 'text-green-600';
    };

    const formatPurpose = (purpose: string) => {
        return purpose
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-sm gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Wallet Logs</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Global transaction history across all users
                    </p>
                </div>
                {totalRecords > 0 && (
                    <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                        Total Records: {totalRecords}
                    </div>
                )}
            </div>

            <Card>
                <CardHeader className="border-b space-y-4 pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            Transaction Timeline
                        </CardTitle>
                        
                        {/* Pagination Controls */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium">
                                Page {page} of {totalPages || 1}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages || isLoading}
                            >
                                <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {error ? (
                        <div className="p-8 text-center text-red-500 bg-red-50 rounded-b-lg">
                            <p>{error}</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => window.location.reload()}
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : isLoading ? (
                        <div className="p-4 space-y-4">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="space-y-2">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : groupedLogs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Wallet className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-lg font-medium text-gray-900">No transactions found</p>
                            <p>There are no wallet logs to display.</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {groupedLogs.map((group) => {
                                const isExpanded = expandedDates.has(group.date);
                                
                                return (
                                    <div key={group.date} className="bg-white">
                                        <button
                                            onClick={() => toggleDate(group.date)}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 transition-colors focus:outline-none"
                                        >
                                            <div className="flex items-center gap-2">
                                                {isExpanded ? (
                                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                                ) : (
                                                    <ChevronRight className="h-5 w-5 text-gray-500" />
                                                )}
                                                <h3 className="font-semibold text-gray-900">
                                                    {formatDateHeading(group.date)}
                                                </h3>
                                            </div>
                                            <span className="text-sm font-medium text-gray-500 bg-white px-2.5 py-1 rounded-full border">
                                                {group.logs.length} transaction{group.logs.length !== 1 ? 's' : ''}
                                            </span>
                                        </button>

                                        {isExpanded && (
                                            <div className="p-0 overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-white hover:bg-white border-none">
                                                            <TableHead className="font-semibold w-[100px]">Time</TableHead>
                                                            <TableHead className="font-semibold">Member</TableHead>
                                                            <TableHead className="font-semibold">Purpose</TableHead>
                                                            <TableHead className="font-semibold text-right">Amount</TableHead>
                                                            <TableHead className="font-semibold text-right">Gross Amount</TableHead>
                                                            <TableHead className="font-semibold text-center">Status</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {group.logs.map((log) => (
                                                            <TableRow key={log.createdAt} className="hover:bg-gray-50/50">
                                                                <TableCell className="text-sm text-gray-500 font-medium whitespace-nowrap">
                                                                    {log.time}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium text-gray-900 whitespace-nowrap">{log.username}</span>
                                                                        <span className="text-xs text-gray-500">{log.memberId}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md whitespace-nowrap">
                                                                        {formatPurpose(log.purpose)}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="text-right whitespace-nowrap">
                                                                    <span className={`font-bold ${getAmountColor(log.purpose, log.amount)}`}>
                                                                        {log.amount > 0 ? '+' : ''}{formatCurrency(log.amount)}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="text-right text-gray-500 font-medium whitespace-nowrap">
                                                                    {formatCurrency(log.grossAmount)}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(log.status)}`}>
                                                                        {log.status}
                                                                    </span>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default WalletLogs;
