import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wallet, PlusCircle, MinusCircle, History, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface AdjustmentLog {
  _id: string;
  memberId: string;
  admin: { fullName: string; memberId: string };
  action: 'Credit' | 'Debit';
  amount: number;
  previousBalance: number;
  newBalance: number;
  remarks: string;
  createdAt: string;
}

const WalletAdjustment = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logs, setLogs] = useState<AdjustmentLog[]>([]);
  
  const [formData, setFormData] = useState({
    memberId: '',
    action: 'Credit',
    amount: '',
    remarks: ''
  });

  const [memberName, setMemberName] = useState<string | null>(null);
  const [isVerifyingMember, setIsVerifyingMember] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await api.get('/api/v1/admin/wallet/adjustment-logs');
      setLogs(res.data.data.logs);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Debounced member verification
  useEffect(() => {
    const memberId = formData.memberId.trim();
    if (!memberId) {
      setMemberName(null);
      setMemberError(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsVerifyingMember(true);
      setMemberName(null);
      setMemberError(null);
      try {
        const res = await api.get(`/api/v1/user-name/${encodeURIComponent(memberId)}`);
        if (res.data?.success && res.data?.data?.fullName) {
          setMemberName(res.data.data.fullName);
        } else {
          setMemberError('Invalid Member ID');
        }
      } catch {
        setMemberError('Invalid Member ID');
      } finally {
        setIsVerifyingMember(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formData.memberId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId || !formData.amount || isNaN(Number(formData.amount)) || memberError || !memberName) {
      toast({ title: 'Invalid Input', description: 'Please fill all required fields correctly', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/api/v1/admin/wallet/adjust', {
        ...formData,
        amount: Number(formData.amount)
      });
      
      toast({
        title: "Success",
        description: res.data.message,
      });

      // Reset form and fetch updated logs
      setFormData({ memberId: '', action: 'Credit', amount: '', remarks: '' });
      fetchLogs();
    } catch (error: any) {
      toast({
        title: "Adjustment Failed",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          Wallet Management
        </h1>
        <p className="text-muted-foreground">Manually add or deduct funds from a user's wallet (Isolated Feature)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adjustment Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Adjust Wallet Balance</CardTitle>
            <CardDescription>Credit or Debit a user's available balance securely.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Member ID <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="e.g. SVS12345678"
                  value={formData.memberId}
                  onChange={e => setFormData({ ...formData, memberId: e.target.value.toUpperCase() })}
                  className={memberError ? 'border-destructive' : memberName ? 'border-green-500' : ''}
                  required
                />
                {isVerifyingMember && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Verifying...
                  </p>
                )}
                {!isVerifyingMember && memberName && (
                  <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Member: {memberName}
                  </p>
                )}
                {!isVerifyingMember && memberError && (
                  <p className="text-xs text-destructive mt-1">{memberError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Action Type <span className="text-red-500">*</span></Label>
                <Select value={formData.action} onValueChange={(val) => setFormData({ ...formData, action: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit">
                      <div className="flex items-center text-green-600 font-medium">
                        <PlusCircle className="w-4 h-4 mr-2" /> Add Funds (Credit)
                      </div>
                    </SelectItem>
                    <SelectItem value="Debit">
                      <div className="flex items-center text-red-600 font-medium">
                        <MinusCircle className="w-4 h-4 mr-2" /> Deduct Funds (Debit)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount (₹) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  min="1"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Remarks / Reason (Optional)</Label>
                <Input
                  placeholder="Reason for adjustment"
                  value={formData.remarks}
                  onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>

              <Button type="submit" disabled={isLoading || !!memberError || !memberName} className="w-full">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wallet className="w-4 h-4 mr-2" />}
                {formData.action === 'Credit' ? 'Process Credit' : 'Process Debit'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Adjustment History
            </CardTitle>
            <CardDescription>Recent manual wallet interventions.</CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center p-8 border rounded-lg bg-muted/20 text-muted-foreground">
                No manual adjustments have been made yet.
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Target User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Admin Logs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell className="text-xs whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{log.memberId}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.action === 'Credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${
                            log.action === 'Credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {log.action === 'Credit' ? '+' : '-'}₹{log.amount}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-xs">
                            <span className="truncate max-w-[200px]" title={log.remarks}>
                              "{log.remarks}"
                            </span>
                            <span className="text-muted-foreground mt-1 text-[10px]">
                              By: {log.admin?.fullName} ({log.admin?.memberId})
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletAdjustment;
