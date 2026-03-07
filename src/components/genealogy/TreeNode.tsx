import { motion } from 'framer-motion';
import { UserPlus, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TreeNodeData {
  memberId: string;
  fullName: string;
  rank: string;
  position: 'root' | 'left' | 'right';
  avatar?: string;
  profileImage?: string;
  joiningDate?: string;
  totalDownline?: number;
  parentId?: string;
  sponsorId?: string;
  directSponsors?: number;
  isActive?: boolean;
  isStar?: boolean;
  status?: string;
  // Complete Team Stats (Total Business)
  leftCompleteActive?: number;
  leftCompleteInactive?: number;
  rightCompleteActive?: number;
  rightCompleteInactive?: number;
  // Legacy Direct Business Stats (for backwards compatibility)
  leftDirectActive?: number;
  leftDirectInactive?: number;
  rightDirectActive?: number;
  rightDirectInactive?: number;
  // Total Team Counts
  leftTeamCount?: number;
  rightTeamCount?: number;
  // Business Volume
  leftLegBV?: number;
  rightLegBV?: number;
  thisMonthLeftLegBV?: number;
  thisMonthRightLegBV?: number;
  // Stars
  leftLegStars?: number;
  rightLegStars?: number;
  left: TreeNodeData | null;
  right: TreeNodeData | null;
}

interface TreeNodeProps {
  node: TreeNodeData | null;
  level: number;
  maxLevel?: number;
  onNodeClick?: (memberId: string) => void;
  isRoot?: boolean;
}

const getRankStyles = (rank: string): { ring: string; badge: string; glow: string } => {
  const rankLower = rank?.toLowerCase() || '';

  if (rankLower.includes('crown')) {
    return {
      ring: 'ring-4 ring-chart-4',
      badge: 'bg-chart-4 text-foreground',
      glow: 'shadow-[0_0_20px_rgba(var(--chart-4),0.4)]'
    };
  }
  if (rankLower.includes('diamond')) {
    return {
      ring: 'ring-4 ring-chart-1',
      badge: 'bg-chart-1 text-primary-foreground',
      glow: 'shadow-[0_0_20px_rgba(var(--chart-1),0.4)]'
    };
  }
  if (rankLower.includes('platinum')) {
    return {
      ring: 'ring-4 ring-chart-3',
      badge: 'bg-chart-3 text-primary-foreground',
      glow: 'shadow-[0_0_15px_rgba(var(--chart-3),0.3)]'
    };
  }
  if (rankLower.includes('gold')) {
    return {
      ring: 'ring-4 ring-chart-2',
      badge: 'bg-chart-2 text-foreground',
      glow: 'shadow-[0_0_15px_rgba(var(--chart-2),0.3)]'
    };
  }
  if (rankLower.includes('silver')) {
    return {
      ring: 'ring-3 ring-muted-foreground/50',
      badge: 'bg-muted text-muted-foreground',
      glow: ''
    };
  }
  if (rankLower.includes('bronze')) {
    return {
      ring: 'ring-3 ring-secondary',
      badge: 'bg-secondary text-secondary-foreground',
      glow: ''
    };
  }
  // Default for Associate, Starter, etc.
  return {
    ring: 'ring-3 ring-primary',
    badge: 'bg-primary text-primary-foreground',
    glow: 'shadow-[0_0_12px_rgba(var(--primary),0.25)]'
  };
};

const EmptyNode = () => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.3, type: 'spring' }}
    className="flex flex-col items-center"
  >
    <div className="w-14 h-14 rounded-full border-2 border-dashed border-border/60 bg-muted/20 flex items-center justify-center cursor-default opacity-50 hover:opacity-70 transition-all duration-300">
      <UserPlus className="h-5 w-5 text-muted-foreground/50" />
    </div>
    <span className="text-[10px] text-muted-foreground/50 mt-1.5 font-medium">Empty</span>
  </motion.div>
);

const NodeCard = ({
  data,
  onNodeClick,
  isRoot
}: {
  data: TreeNodeData;
  onNodeClick?: (memberId: string) => void;
  isRoot?: boolean;
}) => {
  const { ring, badge, glow } = getRankStyles(data.rank);
  const initials = data.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const avatarUrl = data.profileImage || data.avatar;
  const hasChildren = data.left !== null || data.right !== null;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNodeClick?.(data.memberId)}
            className="flex flex-col items-center cursor-pointer group relative"
          >
            {/* Avatar with glow effect */}
            <div className={cn('relative', glow && 'transition-shadow duration-300')}>
              <Avatar
                className={cn(
                  'w-16 h-16 border-2 border-background transition-all duration-300',
                  ring,
                  glow,
                  'group-hover:shadow-xl'
                )}
              >
                <AvatarImage src={avatarUrl} alt={data.fullName} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Drill-down indicator for nodes with children */}
              {hasChildren && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Glassmorphism Info Badge */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-center"
            >
              <div className="bg-background/80 backdrop-blur-md border border-border/50 rounded-lg px-2.5 py-1.5 shadow-sm">
                <p className="text-xs font-semibold text-foreground truncate max-w-[90px]">
                  {data.fullName.split(' ')[0]}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {data.memberId}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn('text-[9px] px-2 py-0 mt-1 border-0 shadow-sm', badge)}
              >
                {data.rank}
              </Badge>
            </motion.div>
          </motion.div>
        </TooltipTrigger>

        <TooltipContent
          side="right"
          className="p-0 overflow-hidden bg-popover/95 backdrop-blur-md border-border/50 shadow-xl rounded-xl max-w-[240px]"
        >
          <div className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3">
              <Avatar className={cn('w-10 h-10', ring)}>
                <AvatarImage src={avatarUrl} alt={data.fullName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground text-sm">{data.fullName}</p>
                <Badge className={cn('text-[10px] mt-0.5', badge)}>{data.rank}</Badge>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                <span className="text-muted-foreground">Member ID</span>
                <span className="font-mono font-medium text-foreground">{data.memberId}</span>
              </div>

              {data.parentId && (
                <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground">Parent ID</span>
                  <span className="font-mono font-medium text-primary">{data.parentId}</span>
                </div>
              )}

              {data.position !== 'root' && (
                <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground">Position</span>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {data.position} Leg
                  </Badge>
                </div>
              )}

              {data.joiningDate && (
                <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="font-medium text-foreground">
                    {new Date(data.joiningDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {data.directSponsors !== undefined && (
                <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground">Direct Sponsors</span>
                  <span className="font-semibold text-foreground">{data.directSponsors}</span>
                </div>
              )}

              {data.totalDownline !== undefined && (
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-muted-foreground">Total Downline</span>
                  <span className="font-semibold text-foreground">{data.totalDownline}</span>
                </div>
              )}
            </div>

            {/* Click hint */}
            <div className="pt-2 border-t border-border/30">
              <p className="text-[10px] text-muted-foreground text-center">
                Click to view this member's network
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Orthogonal (right-angle) connector component - high contrast, corporate org chart style
const TreeConnectors = () => {
  const verticalHeight = 20;

  return (
    <div className="flex flex-col items-center">
      {/* Vertical line down from parent */}
      <div
        className="w-0.5 bg-muted-foreground/70 dark:bg-muted-foreground/60"
        style={{ height: verticalHeight }}
      />
    </div>
  );
};

// Horizontal bar connector for children level
const ChildrenConnectorWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative">
      {/* Horizontal bar spanning across children */}
      <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-muted-foreground/70 dark:bg-muted-foreground/60" />

      {/* Children container */}
      <div className="flex gap-12 lg:gap-16">
        {children}
      </div>
    </div>
  );
};

// Vertical connector from horizontal bar to child node
const ChildConnector = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center">
      {/* Vertical line from horizontal bar to child */}
      <div className="w-0.5 h-5 bg-muted-foreground/70 dark:bg-muted-foreground/60" />
      {children}
    </div>
  );
};

const TreeNode = ({ node, level, maxLevel = 3, onNodeClick, isRoot = false }: TreeNodeProps) => {
  if (level > maxLevel) return null;

  if (!node) {
    return <EmptyNode />;
  }

  const hasLeft = node.left !== null;
  const hasRight = node.right !== null;
  const hasChildren = hasLeft || hasRight;
  const showChildren = level < maxLevel;

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: level * 0.1 }}
    >
      <NodeCard data={node} onNodeClick={onNodeClick} isRoot={isRoot} />

      {showChildren && hasChildren && (
        <>
          {/* Orthogonal Connector - Vertical line from parent */}
          <TreeConnectors />

          {/* Children container with horizontal bar */}
          <ChildrenConnectorWrapper>
            {/* Left child */}
            <ChildConnector>
              <TreeNode
                node={node.left}
                level={level + 1}
                maxLevel={maxLevel}
                onNodeClick={onNodeClick}
              />
            </ChildConnector>

            {/* Right child */}
            <ChildConnector>
              <TreeNode
                node={node.right}
                level={level + 1}
                maxLevel={maxLevel}
                onNodeClick={onNodeClick}
              />
            </ChildConnector>
          </ChildrenConnectorWrapper>
        </>
      )}
    </motion.div>
  );
};

export default TreeNode;
