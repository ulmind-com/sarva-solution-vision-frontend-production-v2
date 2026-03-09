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
import { Search, Wallet, Eye } from 'lucide-react';
import api from '@/lib/api';

interface WalletData {
    availableBalance: number;
    totalEarnings: number;
    withdrawnAmount: number;
    pendingWithdrawal: number;
}

interface UserWallet {
    _id: string;
    fullName: string;
    memberId: string;
    phone: string;
    status: 'active' | 'inactive';
    wallet: WalletData;
}

interface WalletResponse {
    statusCode: number;
    data: UserWallet[];
    success: boolean;
}

const UserWalletList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserWallet[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWallets = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await api.get<WalletResponse>('/api/v1/admin/users/wallets');
                setUsers(response.data.data);
            } catch (err: any) {
                console.error('Error fetching user wallets:', err);
                setError(err.response?.data?.message || 'Failed to fetch user wallets');
            } finally {
                setIsLoading(false);
            }
        };

        fetchWallets();
    }, []);

    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase();
        return (
            user.fullName.toLowerCase().includes(query) ||
            user.memberId.toLowerCase().includes(query) ||
            user.phone.includes(query)
        );
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Wallet Balance</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Real-time financial overview of all members
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader className="border-b space-y-4 pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-green-600" />
                            Wallet Balances
                        </CardTitle>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, ID or phone..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
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
                                        <TableHead className="font-semibold">Member</TableHead>
                                        <TableHead className="font-semibold text-right">Available Balance</TableHead>
                                        <TableHead className="font-semibold text-right">Total Earnings</TableHead>
                                        <TableHead className="font-semibold text-right">Pending Withdraw</TableHead>
                                        <TableHead className="text-right font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, index) => (
                                            <TableRow key={index}>
                                                <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                                                <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                {searchQuery ? 'No users found matching your search' : 'No users found'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">{user.fullName}</span>
                                                        <span className="text-sm text-gray-500">{user.memberId}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="font-bold text-green-600 text-lg">
                                                        {formatCurrency(user.wallet.availableBalance)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-gray-700">
                                                    {formatCurrency(user.wallet.totalEarnings)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-yellow-600">
                                                    {formatCurrency(user.wallet.pendingWithdrawal)}
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
