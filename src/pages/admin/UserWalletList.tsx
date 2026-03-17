import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Search, Wallet, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

interface UserWallet {
    userId: string;
    memberId: string;
    username: string;
    walletBalance: number;
}

interface WalletResponse {
    success: boolean;
    message: string;
    data: {
        wallets: UserWallet[];
        pagination: {
            total: number;
            page: number;
            pages: number;
        };
    };
}

const UserWalletList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserWallet[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 50;

    useEffect(() => {
        const fetchWallets = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await api.get<WalletResponse>(`/api/v1/admin/user-wallets?page=${page}&limit=${limit}`);
                
                if (response.data.success) {
                    setUsers(response.data.data.wallets);
                    setTotalPages(response.data.data.pagination.pages);
                    setTotalRecords(response.data.data.pagination.total);
                } else {
                    setError('Failed to fetch user wallets');
                }
            } catch (err: any) {
                console.error('Error fetching user wallets:', err);
                setError(err.response?.data?.message || 'Failed to fetch user wallets');
            } finally {
                setIsLoading(false);
            }
        };

        fetchWallets();
    }, [page]); // Re-fetch when page changes

    // Filter purely frontend based on fetched data for quick search (not hitting API right now)
    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase();
        return (
            user.username.toLowerCase().includes(query) ||
            user.memberId.toLowerCase().includes(query)
        );
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(amount || 0);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-sm gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Wallet Balance</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Real-time financial overview of all members
                    </p>
                </div>
                {totalRecords > 0 && (
                    <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                        Total Users: {totalRecords}
                    </div>
                )}
            </div>

            <Card>
                <CardHeader className="border-b space-y-4 pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-green-600" />
                            Wallet Balances
                        </CardTitle>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search on this page..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            {/* Pagination Controls */}
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1 || isLoading}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium px-2 whitespace-nowrap">
                                    Page {page} of {totalPages || 1}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages || isLoading}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
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
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50">
                                        <TableHead className="font-semibold">Member Details</TableHead>
                                        <TableHead className="font-semibold text-right">Wallet Balance</TableHead>
                                        <TableHead className="text-right font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, index) => (
                                            <TableRow key={index}>
                                                <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-32 ml-auto" /></TableCell>
                                                <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                                                <Wallet className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                                <p className="text-lg font-medium text-gray-900">
                                                    {searchQuery ? 'No users found matching your search' : 'No user wallets found'}
                                                </p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.userId || user.memberId} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">{user.username}</span>
                                                        <span className="text-sm text-gray-500">{user.memberId}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="font-bold text-green-600 text-lg">
                                                        {formatCurrency(user.walletBalance)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => navigate(`/admin/users/${user.memberId}`)}
                                                        title="View Details"
                                                        className="hover:bg-green-50 hover:text-green-600"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default UserWalletList;
