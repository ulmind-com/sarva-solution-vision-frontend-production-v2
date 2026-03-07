import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Tree, { RawNodeDatum, CustomNodeElementProps } from 'react-d3-tree';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw, Users, ArrowUp, Home, Settings2, ZoomIn, ZoomOut, Move, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { TreeNodeData } from './TreeNode';
import { D3TreeNodeDatum, EmptyD3Node, ActiveD3Node } from './D3TreeNode';
import { transformToD3Format } from './treeUtils';

interface TreeApiResponse {
  data: TreeNodeData;
}

const fetchTreeData = async (depth: number = 3, memberId?: string): Promise<TreeNodeData> => {
  const endpoint = memberId
    ? `/api/v1/user/tree/${memberId}?depth=${depth}`
    : `/api/v1/user/tree_view?depth=${depth}`;
  const response = await api.get<TreeApiResponse>(endpoint);
  return response.data.data;
};

const TreeLegend = () => (
  <div className="flex flex-wrap gap-3 text-xs">
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-full bg-chart-2 ring-2 ring-chart-2/50 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
      <span className="text-muted-foreground">Active</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-full bg-destructive ring-2 ring-destructive/50 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
      <span className="text-muted-foreground">Inactive</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-full border-2 border-dashed border-border bg-muted/30" />
      <span className="text-muted-foreground">Empty</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-full bg-yellow-400 ring-2 ring-yellow-300" />
      <span className="text-muted-foreground">Search Match</span>
    </div>
  </div>
);

const TreeSkeleton = () => (
  <div className="flex flex-col items-center py-8">
    <Skeleton className="w-16 h-16 rounded-full" />
    <Skeleton className="w-20 h-12 mt-2 rounded-lg" />
    <Skeleton className="w-14 h-5 mt-1 rounded-full" />

    <div className="flex gap-16 mt-12">
      <div className="flex flex-col items-center">
        <Skeleton className="w-14 h-14 rounded-full" />
        <Skeleton className="w-16 h-10 mt-2 rounded-lg" />
      </div>
      <div className="flex flex-col items-center">
        <Skeleton className="w-14 h-14 rounded-full" />
        <Skeleton className="w-16 h-10 mt-2 rounded-lg" />
      </div>
    </div>
  </div>
);

// Navigation Breadcrumb
const NavigationBreadcrumb = ({
  history,
  onNavigate,
  onReset
}: {
  history: Array<{ id: string; name: string }>;
  onNavigate: (id: string) => void;
  onReset: () => void;
}) => {
  if (history.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="gap-1.5 h-8 bg-background/80 backdrop-blur-sm"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">My Network</span>
      </Button>

      {history.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <span className="text-muted-foreground">/</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(item.id)}
            className={cn(
              'h-8 px-2',
              index === history.length - 1 && 'text-primary font-medium'
            )}
          >
            {item.name}
          </Button>
        </div>
      ))}
    </div>
  );
};

// Depth Control Card
const DepthControlCard = ({
  depth,
  onApply
}: {
  depth: number;
  onApply: (depth: number) => void;
}) => {
  const [inputValue, setInputValue] = useState(depth.toString());
  const [warning, setWarning] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      setWarning(null);
    } else if (numValue < 1) {
      setWarning('Minimum depth is 1 level');
    } else if (numValue > 50) {
      setWarning('Large trees may take longer to load');
    } else {
      setWarning(null);
    }
  };

  const handleApply = () => {
    let numValue = parseInt(inputValue, 10);

    if (isNaN(numValue) || numValue < 1) {
      numValue = 1;
    }

    setInputValue(numValue.toString());
    setWarning(null);
    onApply(numValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium text-foreground">Tree Depth Control</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1 max-w-[180px]">
            <Label htmlFor="tree-depth" className="text-xs text-muted-foreground mb-1.5 block">
              Tree Depth:
            </Label>
            <Input
              id="tree-depth"
              type="number"
              min={1}
              max={999}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className={cn(
                'h-9',
                warning && 'border-destructive focus-visible:ring-destructive/50'
              )}
            />
          </div>
          <Button
            onClick={handleApply}
            size="sm"
            className="h-9 px-4"
          >
            Apply
          </Button>
        </div>

        {warning ? (
          <p className="text-xs text-destructive mt-2 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {warning}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mt-2">
            Enter any depth level. Higher values show more generations but may affect performance.
          </p>
        )}

        {/* Quick select buttons */}
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground mr-1 self-center">Quick:</span>
          {[3, 5, 10, 20, 50, 100].map((d) => (
            <Button
              key={d}
              variant={depth === d ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                setInputValue(d.toString());
                setWarning(null);
                onApply(d);
              }}
              className="h-7 px-2 text-xs"
            >
              {d}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Zoom controls component
const ZoomControls = ({
  onZoomIn,
  onZoomOut,
  onReset,
  zoom
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  zoom: number;
}) => (
  <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-1.5 shadow-lg z-10">
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomIn}>
      <ZoomIn className="h-4 w-4" />
    </Button>
    <div className="text-[10px] text-center text-muted-foreground font-mono">
      {Math.round(zoom * 100)}%
    </div>
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomOut}>
      <ZoomOut className="h-4 w-4" />
    </Button>
    <div className="border-t border-border my-1" />
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onReset} title="Reset view">
      <Move className="h-4 w-4" />
    </Button>
  </div>
);

// Search helper function - recursive search through tree
const findNodeInTree = (node: D3TreeNodeDatum | null, searchTerm: string): D3TreeNodeDatum | null => {
  if (!node) return null;

  const term = searchTerm.toLowerCase().trim();
  const name = node.name?.toLowerCase() || '';
  const memberId = node.attributes?.memberId?.toLowerCase() || '';

  // Check if current node matches (skip empty nodes)
  if (!node.attributes?.isEmpty && (name.includes(term) || memberId.includes(term))) {
    return node;
  }

  // Recursive check in children
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeInTree(child, searchTerm);
      if (found) return found;
    }
  }

  return null;
};

const D3GenealogyTree = () => {
  const { toast } = useToast();
  const [depth, setDepth] = useState(3);
  const [currentRootId, setCurrentRootId] = useState<string | undefined>(undefined);
  const [navigationHistory, setNavigationHistory] = useState<Array<{ id: string; name: string }>>([]);
  const [zoom, setZoom] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    data: treeData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['genealogyTree', depth, currentRootId],
    queryFn: () => fetchTreeData(depth, currentRootId),
    staleTime: 0,
    gcTime: 0,
    retry: 2,
  });

  // Center tree on load with proper initial position
  useEffect(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 100 });
    }
  }, [treeData]);

  // Transform data for D3 tree
  const d3TreeData = useMemo(() => {
    if (!treeData) return null;
    return transformToD3Format(treeData) as RawNodeDatum;
  }, [treeData]);

  const handleNodeClick = useCallback((memberId: string) => {
    if (memberId === currentRootId || !memberId) return;

    const findNodeName = (node: TreeNodeData | null, targetId: string): string | null => {
      if (!node) return null;
      if (node.memberId === targetId) return node.fullName;
      return findNodeName(node.left, targetId) || findNodeName(node.right, targetId);
    };

    const nodeName = treeData ? findNodeName(treeData, memberId) : memberId;

    setNavigationHistory(prev => [...prev, { id: memberId, name: nodeName || memberId }]);
    setCurrentRootId(memberId);
  }, [currentRootId, treeData]);

  const handleNavigateToHistoryItem = (memberId: string) => {
    const itemIndex = navigationHistory.findIndex(item => item.id === memberId);
    if (itemIndex !== -1) {
      setNavigationHistory(prev => prev.slice(0, itemIndex + 1));
      setCurrentRootId(memberId);
    }
  };

  const handleResetToMyNetwork = () => {
    setNavigationHistory([]);
    setCurrentRootId(undefined);
    setHighlightedId(null);
    setSearchQuery('');
  };

  // Search handler
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setHighlightedId(null);
      return;
    }

    if (!d3TreeData) {
      toast({
        title: 'No data',
        description: 'Tree data is not loaded yet.',
        variant: 'destructive',
      });
      return;
    }

    const foundNode = findNodeInTree(d3TreeData as D3TreeNodeDatum, searchQuery);

    if (foundNode && foundNode.attributes?.memberId) {
      setHighlightedId(foundNode.attributes.memberId);
      toast({
        title: 'Member found!',
        description: `Highlighting ${foundNode.name} (${foundNode.attributes.memberId})`,
      });
    } else {
      setHighlightedId(null);
      toast({
        title: 'Not found',
        description: 'Member not found in current tree view. Try increasing tree depth.',
        variant: 'destructive',
      });
    }
  }, [searchQuery, d3TreeData, toast]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setHighlightedId(null);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Custom node renderer with highlight support
  const renderCustomNode = useCallback(({ nodeDatum }: CustomNodeElementProps) => {
    const nodeData = nodeDatum as unknown as D3TreeNodeDatum;
    const isEmpty = nodeData.attributes?.isEmpty;
    const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;
    const isHighlighted = nodeData.attributes?.memberId === highlightedId;

    const nodeWidth = isEmpty ? 80 : 120;
    const nodeHeight = isEmpty ? 70 : 100;

    return (
      <g>
        <foreignObject
          width={nodeWidth}
          height={nodeHeight}
          x={-nodeWidth / 2}
          y={-nodeHeight / 2}
          style={{ overflow: 'visible' }}
        >
          <div className="flex justify-center items-start h-full pt-2">
            {isEmpty ? (
              <EmptyD3Node />
            ) : (
              <ActiveD3Node
                data={nodeData.attributes}
                name={nodeData.name}
                onNodeClick={handleNodeClick}
                hasChildren={hasChildren}
                isHighlighted={isHighlighted}
              />
            )}
          </div>
        </foreignObject>
      </g>
    );
  }, [handleNodeClick, highlightedId]);

  // Zoom handlers - increased max zoom to 4x
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.3, 4));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.3, 0.1));
  const handleResetView = () => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 100 });
      setZoom(1); // Start at 100% zoom
    }
  };

  const isDrilledDown = currentRootId !== undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Genealogy Tree</h1>
          <p className="text-muted-foreground">
            {isDrilledDown
              ? 'Viewing member network - click nodes to drill deeper'
              : 'View your binary network structure • Drag to pan, scroll to zoom'
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDrilledDown && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToMyNetwork}
              className="gap-2"
            >
              <ArrowUp className="h-4 w-4" />
              Back to Top
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Name or Member ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={handleClearSearch}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              Find Member
            </Button>
          </div>
          {highlightedId && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-400" />
              Highlighted: <span className="font-mono font-medium text-foreground">{highlightedId}</span>
              <Button variant="link" size="sm" className="h-auto p-0 ml-2 text-xs" onClick={handleClearSearch}>
                Clear
              </Button>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Navigation Breadcrumb */}
      {navigationHistory.length > 0 && (
        <NavigationBreadcrumb
          history={navigationHistory}
          onNavigate={handleNavigateToHistoryItem}
          onReset={handleResetToMyNetwork}
        />
      )}

      {/* Main Tree Card */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="border-b border-border bg-card/50 backdrop-blur-sm flex flex-row items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-foreground">
              {isDrilledDown ? 'Member Network' : 'Your Network'} (Binary Tree)
            </CardTitle>
          </div>
          <TreeLegend />
        </CardHeader>

        <CardContent className="p-0 relative">
          <div
            ref={containerRef}
            className="w-full h-[70vh] bg-muted/20"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <TreeSkeleton />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="p-4 rounded-full bg-destructive/10 mb-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Failed to load tree</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                  {(error as Error)?.message || 'Unable to fetch network data. Please try again.'}
                </p>
                <Button onClick={() => refetch()} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : d3TreeData ? (
              <Tree
                data={d3TreeData}
                orientation="vertical"
                pathFunc="step"
                translate={translate}
                zoom={zoom}
                scaleExtent={{ min: 0.1, max: 4 }}
                onUpdate={({ zoom: newZoom, translate: newTranslate }) => {
                  setZoom(newZoom);
                  setTranslate(newTranslate);
                }}
                renderCustomNodeElement={renderCustomNode}
                nodeSize={{ x: 220, y: 200 }}
                separation={{ siblings: 1.3, nonSiblings: 1.6 }}
                enableLegacyTransitions
                transitionDuration={300}
                pathClassFunc={() => 'tree-step-link'}
                rootNodeClassName="tree-root-node"
                branchNodeClassName="tree-branch-node"
                leafNodeClassName="tree-leaf-node"
              />
            ) : (
              <div className="flex items-center justify-center h-full py-12 text-center text-muted-foreground">
                No network data available
              </div>
            )}
          </div>

          {/* Zoom Controls */}
          {d3TreeData && !isLoading && !isError && (
            <ZoomControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onReset={handleResetView}
              zoom={zoom}
            />
          )}
        </CardContent>
      </Card>

      {/* Depth Control */}
      <DepthControlCard depth={depth} onApply={setDepth} />

      {/* Rank Legend */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">Rank Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Crown Diamond', style: 'bg-chart-4 text-foreground' },
              { name: 'Diamond', style: 'bg-chart-1 text-primary-foreground' },
              { name: 'Platinum', style: 'bg-chart-3 text-primary-foreground' },
              { name: 'Gold', style: 'bg-chart-2 text-foreground' },
              { name: 'Silver', style: 'bg-muted text-muted-foreground' },
              { name: 'Bronze', style: 'bg-secondary text-secondary-foreground' },
              { name: 'Associate', style: 'bg-primary text-primary-foreground' },
            ].map((rank) => (
              <Badge
                key={rank.name}
                variant="outline"
                className={cn('text-xs border-0', rank.style)}
              >
                {rank.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CSS for D3 tree links */}
      <style>{`
        .tree-step-link {
          stroke: hsl(var(--muted-foreground) / 0.5);
          stroke-width: 2px;
          fill: none;
        }
        
        .dark .tree-step-link {
          stroke: hsl(var(--muted-foreground) / 0.4);
        }
      `}</style>
    </div>
  );
};

export default D3GenealogyTree;
