import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Network, Plus, Trash2, Shield, Search, CheckCircle2, Activity, IndianRupee, AlertCircle, Check, X } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface FranchiseBasic {
    _id: string;
    name: string;
    shopName: string;
    vendorId: string;
    city: string;
}

interface MasterFranchiseResponse {
    _id: string;
    master: FranchiseBasic;
    subFranchiseCount: number;
    subFranchises: FranchiseBasic[];
    pendingSubFranchises: FranchiseBasic[];
    assignedAt: string;
}

const MasterFranchiseManagement = () => {
    const [masters, setMasters] = useState<MasterFranchiseResponse[]>([]);
    const [eligibleForMaster, setEligibleForMaster] = useState<FranchiseBasic[]>([]);
    const [eligibleForSub, setEligibleForSub] = useState<FranchiseBasic[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMasterId, setSelectedMasterId] = useState("");
    const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Live Projection Modal State
    const [liveDataModalOpen, setLiveDataModalOpen] = useState(false);
    const [liveDataLoading, setLiveDataLoading] = useState(false);
    const [activeLiveMaster, setActiveLiveMaster] = useState<{ id: string, name: string } | null>(null);
    const [liveData, setLiveData] = useState<any>(null);

    const fetchAllData = async () => {
        try {
            setIsLoading(true);
            const [mastersRes, eligibleRes] = await Promise.all([
                api.get('/api/v1/admin/master-franchises'),
                api.get('/api/v1/admin/master-franchises/eligible')
            ]);
            
            setMasters(mastersRes.data?.data || []);
            setEligibleForMaster(eligibleRes.data?.data?.eligibleForMaster || []);
            setEligibleForSub(eligibleRes.data?.data?.eligibleForSub || []);
        } catch (error) {
            console.error("Failed to fetch master franchises:", error);
            toast.error("Failed to load master franchise data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const toggleSubFranchise = (id: string) => {
        setSelectedSubIds(prev => 
            prev.includes(id) ? prev.filter(subId => subId !== id) : [...prev, id]
        );
    };

    const handleAssignMaster = async () => {
        if (!selectedMasterId) {
            toast.error("Please select a franchise to be the Master");
            return;
        }

        try {
            const formData = {
                masterId: selectedMasterId,
                subFranchises: selectedSubIds
            };
            
            await api.post('/api/v1/admin/master-franchises', formData);
            toast.success("Master Franchise assigned successfully!");
            
            // Reset form and refresh
            setIsDialogOpen(false);
            setSelectedMasterId("");
            setSelectedSubIds([]);
            fetchAllData();
        } catch (error: any) {
             toast.error(error.response?.data?.message || "Failed to assign master franchise");
        }
    };

    const handleRemoveMaster = async (relationId: string) => {
        if (!window.confirm("Are you sure you want to remove Master privileges from this franchise? This will convert it back to a normal franchise.")) return;

        try {
            await api.delete(`/api/v1/admin/master-franchises/${relationId}`);
            toast.success("Master privileges removed");
            fetchAllData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to remove master privilege");
        }
    };

    const filteredSubs = eligibleForSub.filter(sub => 
        sub.shopName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        sub.vendorId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const checkLiveEarnings = async (masterId: string, shopName: string) => {
        setActiveLiveMaster({ id: masterId, name: shopName });
        setLiveDataModalOpen(true);
        setLiveDataLoading(true);
        try {
            const res = await api.get(`/api/v1/admin/master-franchises/${masterId}/live-earnings`);
            setLiveData(res.data?.data);
        } catch (error) {
            toast.error("Failed to load live earnings");
            setLiveDataModalOpen(false);
        } finally {
            setLiveDataLoading(false);
        }
    };

    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0);

    const handleApproveLink = async (masterId: string, subId: string) => {
        try {
            await api.put(`/api/v1/admin/master-franchises/${masterId}/approve-request/${subId}`);
            toast.success("Sub-franchise officially linked to Master Network!");
            fetchAllData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to approve link request");
        }
    };

    const handleRejectLink = async (masterId: string, subId: string) => {
        if (!confirm("Are you sure you want to reject this network link request?")) return;
        try {
            await api.delete(`/api/v1/admin/master-franchises/${masterId}/reject-request/${subId}`);
            toast.success("Link Request rejected and cleared.");
            fetchAllData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reject link request");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                        Master Franchises
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Assign Top-Level Franchises and map their subordinate networks (Zero-Touch Layer)
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white border-0 shadow-lg cursor-pointer">
                            <Plus className="h-4 w-4" />
                            Assign Master Franchise
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col glass premium-shadow">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-yellow-500" />
                                Create Master Network
                            </DialogTitle>
                            <DialogDescription>
                                Select an existing franchise to upgrade to Master, then select its sub-network.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-6 mt-4">
                            {/* Step 1: Select Master */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-foreground">Step 1: Select Master Franchise <span className="text-destructive">*</span></label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                    value={selectedMasterId}
                                    onChange={(e) => setSelectedMasterId(e.target.value)}
                                >
                                    <option value="">-- Choose a Franchise to Upgrade --</option>
                                    {eligibleForMaster.map(f => (
                                        <option key={f._id} value={f._id}>{f.shopName} ({f.vendorId}) - {f.city}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Step 2: Select Subs */}
                            {selectedMasterId && (
                                <div className="space-y-3 border-t pt-4 border-border/50">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-foreground">
                                            Step 2: Assign Sub-Franchises
                                            <Badge variant="outline" className="ml-2 bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                                {selectedSubIds.length} Selected
                                            </Badge>
                                        </label>
                                    </div>
                                    
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search franchises to assign..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 bg-background/50"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-[300px] overflow-y-auto p-1">
                                        {filteredSubs.filter(sub => sub._id !== selectedMasterId).map(sub => {
                                            const isSelected = selectedSubIds.includes(sub._id);
                                            return (
                                                <div 
                                                    key={sub._id}
                                                    onClick={() => toggleSubFranchise(sub._id)}
                                                    className={`
                                                        p-3 rounded-lg border cursor-pointer transition-all duration-200
                                                        ${isSelected 
                                                            ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                                                            : 'border-border/50 hover:border-yellow-500/50 bg-background/40'}
                                                    `}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold text-sm truncate w-[150px]">{sub.shopName}</p>
                                                            <p className="text-xs text-muted-foreground">{sub.vendorId}</p>
                                                        </div>
                                                        {isSelected && <CheckCircle2 className="h-5 w-5 text-yellow-500" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {filteredSubs.length === 0 && (
                                            <div className="col-span-full text-center py-4 text-sm text-muted-foreground">
                                                No eligible sub-franchises found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-border/50 flex justify-end gap-3 mt-auto">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button 
                                onClick={handleAssignMaster} 
                                disabled={!selectedMasterId}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                            >
                                Assign Master
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="text-center py-10">Loading Network...</div>
            ) : masters.length === 0 ? (
                <Card className="glass border-dashed text-center py-16">
                    <CardContent>
                        <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground">No Master Franchises Yet</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                            Upgrade an existing franchise to Master to empower them with a sub-network and higher commissions.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {masters.map(masterNode => (
                        <Card key={masterNode._id} className="glass premium-shadow border-yellow-500/20 overflow-hidden group">
                            <div className="h-1 w-full bg-gradient-to-r from-yellow-400 to-amber-600"></div>
                            <CardHeader className="pb-3 relative">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleRemoveMaster(masterNode._id)}
                                    className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                                        <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg text-foreground truncate max-w-[200px]">
                                            {masterNode.master.shopName}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <span className="font-mono text-xs">{masterNode.master.vendorId}</span>
                                            <span>•</span>
                                            <span className="text-xs truncate">{masterNode.master.city}</span>
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-muted/30 rounded-lg p-3 border">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-semibold flex items-center gap-2">
                                            <Network className="h-4 w-4 text-teal-600" />
                                            Sub-Network
                                        </h4>
                                        <Badge variant="secondary" className="bg-background">
                                            {masterNode.subFranchiseCount} Subs
                                        </Badge>
                                    </div>
                                    
                                    <div className="space-y-2 mt-3 max-h-[150px] overflow-y-auto pr-1">
                                        {masterNode.subFranchises.map(sub => (
                                            <div key={sub._id} className="flex justify-between items-center text-sm p-2 rounded bg-background border border-border/50">
                                                <span className="font-medium truncate mr-2">{sub.shopName}</span>
                                                <span className="text-xs text-muted-foreground font-mono">{sub.vendorId}</span>
                                            </div>
                                        ))}
                                        {masterNode.subFranchises.length === 0 && (
                                            <div className="text-xs text-muted-foreground text-center py-2 italic">
                                                No sub-franchises assigned yet
                                            </div>
                                        )}
                                    </div>
                                    
                                    {masterNode.pendingSubFranchises && masterNode.pendingSubFranchises.length > 0 && (
                                        <div className="mt-3 pt-3 border-t">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-sm font-semibold flex items-center gap-2 text-amber-600">
                                                    <AlertCircle className="h-4 w-4" />
                                                    Pending Links
                                                </h4>
                                                <Badge variant="outline" className="bg-amber-100/50 text-amber-700 border-amber-300">
                                                    {masterNode.pendingSubFranchises.length} New
                                                </Badge>
                                            </div>
                                            <div className="space-y-2 mt-2 max-h-[150px] overflow-y-auto pr-1">
                                                {masterNode.pendingSubFranchises.map(pending => (
                                                    <div key={pending._id} className="flex flex-col text-sm p-2 rounded bg-amber-50 border border-amber-200 shadow-sm">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="max-w-[70%]">
                                                                <span className="font-medium truncate block">{pending.shopName}</span>
                                                                <span className="text-[10px] text-muted-foreground font-mono">{pending.vendorId}</span>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Button 
                                                                    size="icon" 
                                                                    variant="ghost" 
                                                                    className="h-7 w-7 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-300 rounded cursor-pointer"
                                                                    onClick={() => handleApproveLink(masterNode.master._id, pending._id)}
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    size="icon" 
                                                                    variant="ghost" 
                                                                    className="h-7 w-7 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded cursor-pointer"
                                                                    onClick={() => handleRejectLink(masterNode.master._id, pending._id)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-3 pt-3 border-t">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full gap-2 text-emerald-600 border-emerald-500/20 hover:bg-emerald-50"
                                            onClick={() => checkLiveEarnings(masterNode.master._id, masterNode.master.shopName)}
                                        >
                                            <Activity className="h-4 w-4" />
                                            Live Earnings Projection
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Live Earnings Modal */}
            <Dialog open={liveDataModalOpen} onOpenChange={setLiveDataModalOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-emerald-500 animate-pulse" />
                            Live Projection
                        </DialogTitle>
                        <DialogDescription>
                            Current Month-to-Date (MTD) Earnings for {activeLiveMaster?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {liveDataLoading ? (
                            <div className="flex flex-col items-center justify-center py-6 space-y-4">
                                <Activity className="h-8 w-8 text-emerald-500 animate-spin" />
                                <span className="text-sm font-medium">Calculating network data...</span>
                            </div>
                        ) : liveData ? (
                            <div className="space-y-4">
                                <div className="flex flex-col bg-blue-50/50 p-4 rounded-md border border-blue-200 shadow-sm">
                                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Own Differential (15% BV, ₹50/PV)</h4>
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="text-blue-700/80">Gross Earnings</span>
                                        <span className="font-semibold text-blue-700">{formatCurrency(liveData.projectedOwnDifferential)}</span>
                                    </div>
                                    {liveData.projectedOwnDifferential > 0 && (
                                        <div className="flex justify-between items-center text-[11px] text-red-500 mb-2 pb-2 border-b border-blue-100">
                                            <span>Deductions (Admin 5% + TDS 2%)</span>
                                            <span>-{formatCurrency(liveData.ownAdminCharge + liveData.ownTdsCharge)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-sm font-bold text-blue-900">Net Expected</span>
                                        <span className="font-bold text-lg text-blue-700">{formatCurrency(liveData.ownNet)}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex flex-col bg-purple-50/50 p-4 rounded-md border border-purple-200 shadow-sm">
                                        <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">Sub-Network Override</h4>
                                        <div className="flex justify-between items-center text-sm mb-1">
                                            <span className="text-purple-700/80">Gross Earnings</span>
                                            <span className="font-semibold text-purple-700">{formatCurrency(liveData.projectedSubOverride)}</span>
                                        </div>
                                        {liveData.projectedSubOverride > 0 && (
                                            <div className="flex justify-between items-center text-[11px] text-red-500 mb-2 pb-2 border-b border-purple-100">
                                                <span>Deductions (Admin 5% + TDS 2%)</span>
                                                <span>-{formatCurrency(liveData.subAdminCharge + liveData.subTdsCharge)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-sm font-bold text-purple-900">Net Expected</span>
                                            <span className="font-bold text-lg text-purple-700">{formatCurrency(liveData.subNet)}</span>
                                        </div>
                                    </div>
                                    
                                    {liveData.subNetworkDetails && liveData.subNetworkDetails.length > 0 && (
                                        <div className="border border-purple-100 rounded-md bg-purple-50/30 p-2 max-h-[140px] overflow-y-auto space-y-1">
                                            {liveData.subNetworkDetails.map((sub: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center text-xs p-2 hover:bg-purple-100/50 rounded transition-colors border-b border-purple-100/30 last:border-b-0">
                                                    <div>
                                                        <span className="font-medium block truncate max-w-[120px]">{sub.shopName}</span>
                                                        <span className="text-[9px] text-muted-foreground">{sub.vendorId}</span>
                                                        <span className="text-[9px] text-muted-foreground block mt-0.5">BV:{sub.bvContribution} | PV:{sub.pvContribution}</span>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end">
                                                        <span className="text-[9px] text-muted-foreground line-through">₹{sub.earnedOverride.toFixed(2)}</span>
                                                        <span className="text-[9px] text-red-500/80 mb-0.5">-₹{(sub.adminCharge + sub.tdsCharge).toFixed(2)}</span>
                                                        <span className="font-bold text-emerald-600 block">₹{sub.netOverride.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                
                                {/* Total Deductions Block Removed to ensure focus on Individual Category breakdowns */}

                                <div className="pt-2 border-t mt-4 flex justify-between items-center">
                                    <span className="font-bold uppercase tracking-wider text-sm">Net Payout Expected</span>
                                    <span className="text-2xl font-black text-emerald-600">{formatCurrency(liveData.totalProjectedNet)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground">Error loading live data</div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MasterFranchiseManagement;
