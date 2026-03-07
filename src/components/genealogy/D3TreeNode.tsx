import { useState } from 'react';
import { UserPlus, ChevronDown, Users, CheckCircle2, XCircle, TrendingUp, Star as StarIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TreeNodeData } from './TreeNode';

// D3 Tree Node Datum format
export interface D3TreeNodeDatum {
  name: string;
  attributes: {
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
    isEmpty?: boolean;
    isActive?: boolean;
    isStar?: boolean;
    status?: string;
    // Complete Team Stats (replacing Direct Business)
    leftCompleteActive?: number;
    leftCompleteInactive?: number;
    rightCompleteActive?: number;
    rightCompleteInactive?: number;
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
  };
  children?: D3TreeNodeDatum[];
}



const getRankStyles = (rank: string): { ring: string; badge: string; glow: string; border: string } => {
  const rankLower = rank?.toLowerCase() || '';

  // SSVPL Legend - Ultimate gradient ring
  if (rankLower.includes('ssvpl')) {
    return {
      ring: 'ring-4 ring-purple-500 ring-offset-2 ring-offset-background',
      badge: 'bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white',
      glow: 'shadow-[0_0_35px_rgba(168,85,247,0.8)]',
      border: 'border-transparent bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 bg-clip-border',
    };
  }
  // Legend (non-SSVPL) - Black/Gold
  if (rankLower.includes('legend')) {
    return {
      ring: 'ring-4 ring-amber-500 ring-offset-2 ring-offset-background',
      badge: 'bg-neutral-900 text-amber-400',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.7)]',
      border: 'border-neutral-900',
    };
  }
  // Royal - Deep Gold
  if (rankLower.includes('royal')) {
    return {
      ring: 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-background',
      badge: 'bg-yellow-600 text-white',
      glow: 'shadow-[0_0_28px_rgba(202,138,4,0.6)]',
      border: 'border-yellow-600',
    };
  }
  // Elite - Silver/Red shield
  if (rankLower.includes('elite')) {
    return {
      ring: 'ring-4 ring-red-500 ring-offset-2 ring-offset-background',
      badge: 'bg-slate-500 text-white',
      glow: 'shadow-[0_0_25px_rgba(239,68,68,0.6)]',
      border: 'border-slate-500',
    };
  }
  // Crown / Ambassador
  if (rankLower.includes('crown') || rankLower.includes('ambassador')) {
    return {
      ring: 'ring-4 ring-purple-600 ring-offset-2 ring-offset-background',
      badge: 'bg-purple-600 text-white',
      glow: 'shadow-[0_0_25px_rgba(147,51,234,0.5)]',
      border: 'border-purple-600',
    };
  }
  if (rankLower.includes('sapphire')) {
    return {
      ring: 'ring-4 ring-blue-700 ring-offset-2 ring-offset-background',
      badge: 'bg-blue-700 text-white',
      glow: 'shadow-[0_0_25px_rgba(29,78,216,0.5)]',
      border: 'border-blue-700',
    };
  }
  if (rankLower.includes('emerald')) {
    return {
      ring: 'ring-4 ring-emerald-600 ring-offset-2 ring-offset-background',
      badge: 'bg-emerald-600 text-white',
      glow: 'shadow-[0_0_25px_rgba(5,150,105,0.5)]',
      border: 'border-emerald-600',
    };
  }
  if (rankLower.includes('ruby')) {
    return {
      ring: 'ring-4 ring-red-600 ring-offset-2 ring-offset-background',
      badge: 'bg-red-600 text-white',
      glow: 'shadow-[0_0_25px_rgba(220,38,38,0.5)]',
      border: 'border-red-600',
    };
  }
  if (rankLower.includes('diamond')) {
    return {
      ring: 'ring-4 ring-sky-500 ring-offset-2 ring-offset-background',
      badge: 'bg-sky-500 text-white',
      glow: 'shadow-[0_0_25px_rgba(14,165,233,0.5)]',
      border: 'border-sky-500',
    };
  }
  if (rankLower.includes('platinum')) {
    return {
      ring: 'ring-4 ring-cyan-200 ring-offset-2 ring-offset-background',
      badge: 'bg-cyan-200 text-cyan-900',
      glow: 'shadow-[0_0_20px_rgba(165,243,252,0.5)]',
      border: 'border-cyan-200',
    };
  }
  if (rankLower.includes('gold')) {
    return {
      ring: 'ring-4 ring-yellow-500 ring-offset-2 ring-offset-background',
      badge: 'bg-yellow-500 text-yellow-950',
      glow: 'shadow-[0_0_20px_rgba(234,179,8,0.5)]',
      border: 'border-yellow-500',
    };
  }
  if (rankLower.includes('silver')) {
    return {
      ring: 'ring-3 ring-slate-300',
      badge: 'bg-slate-300 text-slate-800',
      glow: 'shadow-[0_0_15px_rgba(203,213,225,0.4)]',
      border: 'border-slate-300',
    };
  }
  if (rankLower.includes('bronze')) {
    return {
      ring: 'ring-3 ring-amber-700',
      badge: 'bg-amber-700 text-white',
      glow: 'shadow-[0_0_15px_rgba(180,83,9,0.4)]',
      border: 'border-amber-700',
    };
  }
  // Associate / default
  return {
    ring: 'ring-3 ring-emerald-500',
    badge: 'bg-emerald-500 text-white',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    border: 'border-emerald-500',
  };
};

// Empty node component for D3 tree
export const EmptyD3Node = () => (
  <div className="flex flex-col items-center">
    <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/40 bg-muted/30 flex items-center justify-center opacity-60">
      <UserPlus className="h-4 w-4 text-muted-foreground/50" />
    </div>
    <span className="text-[10px] text-muted-foreground/50 mt-1 font-medium">Empty</span>
  </div>
);

// Custom Hover Tooltip (works inside SVG foreignObject)
const HoverTooltip = ({
  data,
  name,
  isVisible
}: {
  data: D3TreeNodeDatum['attributes'];
  name: string;
  isVisible: boolean;
}) => {
  const { ring, badge } = getRankStyles(data.rank);
  const initials = data.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  const avatarUrl = data.profileImage || data.avatar;
  const isActive = data.isActive ?? (data.status?.toLowerCase() === 'active');
  const isStar = data.isStar ?? false;

  // Format joining date
  const formattedJoiningDate = data.joiningDate
    ? new Date(data.joiningDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    : null;

  // Get sponsor display value
  const sponsorDisplay = data.sponsorId || data.parentId || 'N/A';

  if (!isVisible) return null;

  return (
    <div
      className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200"
      style={{ minWidth: '260px' }}
    >
      <div className="bg-popover/98 backdrop-blur-lg border border-border shadow-2xl rounded-xl overflow-hidden">
        {/* Section A: Identity Header */}
        <div className="bg-gradient-to-r from-primary/10 to-transparent p-3 border-b border-border/50 relative">
          {/* Status Badge - Top Right */}
          <Badge
            className={cn(
              'absolute top-2 right-2 text-[9px] px-1.5 py-0.5',
              isActive
                ? 'bg-chart-2/20 text-chart-2 border-chart-2/30'
                : 'bg-destructive/20 text-destructive border-destructive/30'
            )}
            variant="outline"
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
          {isStar && (
            <Badge
              className="absolute top-2 right-16 text-[9px] px-1.5 py-0.5 bg-yellow-400/20 text-yellow-600 border-yellow-500/30"
              variant="outline"
            >
              <StarIcon className="w-3 h-3 mr-0.5 fill-yellow-500 text-yellow-600" /> Star
            </Badge>
          )}

          <div className="flex items-center gap-3">
            <Avatar className={cn('w-12 h-12', ring)}>
              <AvatarImage src={avatarUrl} alt={data.fullName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="pr-16">
              <p className="font-bold text-foreground text-sm">{name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{data.memberId}</p>
            </div>
          </div>
        </div>

        {/* Section B: Core Info - 3 Column Grid (Removed Position) */}
        <div className="p-3 grid grid-cols-3 gap-2 text-xs border-b border-border/50">
          <div className="flex flex-col gap-0.5 p-2 bg-muted/30 rounded-lg">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Sponsor</span>
            <span className="font-mono font-semibold text-primary truncate text-[10px]">{sponsorDisplay}</span>
          </div>

          <div className="flex flex-col gap-0.5 p-2 bg-muted/30 rounded-lg">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Joined</span>
            <span className="font-medium text-foreground text-[10px]">{formattedJoiningDate || 'N/A'}</span>
          </div>

          <div className="flex flex-col gap-0.5 p-2 bg-muted/30 rounded-lg">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Rank</span>
            <Badge className={cn('text-[9px] w-fit', badge)}>{data.rank || 'N/A'}</Badge>
          </div>
        </div>

        {/* Section C: Total Business Stats */}
        <div className="p-3 bg-muted/40">
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Total Business
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Left Leg Stats */}
            <div className="p-2 bg-background/60 rounded-lg border border-border/30 space-y-2">
              {/* Header with Total Team Count */}
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-medium text-muted-foreground">Left Side PV</p>
                <span className="text-[10px] font-bold text-primary flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded">
                  <Users className="w-3 h-3" /> {data.leftTeamCount ?? 0}
                </span>
              </div>

              {/* Row 1: Member Status (Active/Inactive) */}
              <div className="flex justify-center gap-3 py-1 border-b border-border/20">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-chart-2" />
                  <span className="text-xs font-bold text-chart-2">{data.leftCompleteActive ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-destructive" />
                  <span className="text-xs font-bold text-destructive">{data.leftCompleteInactive ?? 0}</span>
                </div>
              </div>

              {/* Row 2: Business Volume (BV) */}
              <div className="flex flex-col gap-1 py-1.5 px-2 bg-chart-1/10 rounded">
                <div className="flex justify-between items-center text-[9px] text-chart-1/80 font-medium tracking-wide">
                  <span>THIS MONTH</span>
                  <span className="font-bold text-chart-1 text-[10px]">{(data.thisMonthLeftLegBV ?? 0).toLocaleString()} BV</span>
                </div>
                <div className="flex justify-between items-center text-[9px] text-chart-1/80 font-medium tracking-wide">
                  <span>LIFETIME</span>
                  <span className="font-bold text-chart-1 text-[10px]">{(data.leftLegBV ?? 0).toLocaleString()} BV</span>
                </div>
              </div>

              {/* Row 3: Stars */}
              <div className="flex items-center justify-center gap-1.5 py-1 bg-chart-2/10 rounded">
                <StarIcon className="h-3 w-3 text-chart-2 fill-chart-2" />
                <span className="text-[10px] font-bold text-chart-2">{data.leftLegStars ?? 0} Stars</span>
              </div>
            </div>

            {/* Right Leg Stats */}
            <div className="p-2 bg-background/60 rounded-lg border border-border/30 space-y-2">
              {/* Header with Total Team Count */}
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-medium text-muted-foreground">Right Side PV</p>
                <span className="text-[10px] font-bold text-primary flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded">
                  <Users className="w-3 h-3" /> {data.rightTeamCount ?? 0}
                </span>
              </div>

              {/* Row 1: Member Status (Active/Inactive) */}
              <div className="flex justify-center gap-3 py-1 border-b border-border/20">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-chart-2" />
                  <span className="text-xs font-bold text-chart-2">{data.rightCompleteActive ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-destructive" />
                  <span className="text-xs font-bold text-destructive">{data.rightCompleteInactive ?? 0}</span>
                </div>
              </div>

              {/* Row 2: Business Volume (BV) */}
              <div className="flex flex-col gap-1 py-1.5 px-2 bg-chart-1/10 rounded">
                <div className="flex justify-between items-center text-[9px] text-chart-1/80 font-medium tracking-wide">
                  <span>THIS MONTH</span>
                  <span className="font-bold text-chart-1 text-[10px]">{(data.thisMonthRightLegBV ?? 0).toLocaleString()} BV</span>
                </div>
                <div className="flex justify-between items-center text-[9px] text-chart-1/80 font-medium tracking-wide">
                  <span>LIFETIME</span>
                  <span className="font-bold text-chart-1 text-[10px]">{(data.rightLegBV ?? 0).toLocaleString()} BV</span>
                </div>
              </div>

              {/* Row 3: Stars */}
              <div className="flex items-center justify-center gap-1.5 py-1 bg-chart-2/10 rounded">
                <StarIcon className="h-3 w-3 text-chart-2 fill-chart-2" />
                <span className="text-[10px] font-bold text-chart-2">{data.rightLegStars ?? 0} Stars</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-3 py-2 bg-muted/20 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground text-center">
            Click to view this member's network
          </p>
        </div>
      </div>

      {/* Arrow pointer */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-3 h-3 bg-popover border-l border-b border-border rotate-45" />
    </div>
  );
};

interface ActiveD3NodeProps {
  data: D3TreeNodeDatum['attributes'];
  name: string;
  onNodeClick?: (memberId: string) => void;
  hasChildren?: boolean;
  isHighlighted?: boolean;
}

export const ActiveD3Node = ({ data, name, onNodeClick, hasChildren, isHighlighted }: ActiveD3NodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const rankStyle = getRankStyles(data.rank);
  const initials = data.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const avatarUrl = data.profileImage || data.avatar;

  // Determine active/inactive status
  const isActive = data.isActive ?? (data.status?.toLowerCase() === 'active');
  const isStar = data.isStar ?? false;

  // Priority: Inactive = red override, Active = rank-based styling
  const avatarStyles = !isActive
    ? {
      border: 'border-destructive',
      ring: 'ring-2 ring-destructive/70',
      shadow: 'shadow-[0_0_25px_rgba(239,68,68,0.9)]',
    }
    : {
      border: rankStyle.border,
      ring: rankStyle.ring,
      shadow: rankStyle.glow,
    };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={() => onNodeClick?.(data.memberId)}
        className={cn(
          'flex flex-col items-center cursor-pointer group transition-all duration-300',
          isHighlighted
            ? 'scale-110 z-50'
            : 'hover:scale-105'
        )}
      >
        {/* Highlight glow effect for search */}
        {isHighlighted && (
          <div
            className="absolute -inset-3 rounded-2xl animate-pulse pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(250,204,21,0.4), rgba(234,179,8,0.3))',
              boxShadow: '0 0 30px rgba(250,204,21,0.6), 0 0 60px rgba(250,204,21,0.3)',
              zIndex: -1
            }}
          />
        )}

        {/* Avatar with rank-based styling */}
        <div className="relative transition-shadow duration-300">
          <Avatar
            className={cn(
              'w-16 h-16 border-4 transition-all duration-300 bg-background',
              isHighlighted
                ? 'border-yellow-400 ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.9)]'
                : cn(
                  avatarStyles.border,
                  avatarStyles.ring,
                  avatarStyles.shadow,
                  'group-hover:scale-105'
                )
            )}
          >
            <AvatarImage src={avatarUrl} alt={data.fullName} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Star Badge - Golden star on top-right of avatar */}
          {isStar && (
            <div className="absolute -top-1 -right-1 z-10 animate-pulse">
              <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center shadow-[0_0_12px_rgba(250,204,21,0.8)] border-2 border-yellow-500">
                <StarIcon className="w-3.5 h-3.5 text-yellow-700 fill-yellow-600" />
              </div>
            </div>
          )}

          {/* Drill-down indicator */}
          {hasChildren && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Name Label */}
        <div className="mt-2.5 text-center">
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-full px-3 py-1 shadow-md">
            <p className="text-[12px] font-extrabold text-foreground tracking-wide truncate max-w-[90px]">
              {name.split(' ')[0]}
            </p>
          </div>

          {/* Member ID */}
          <p className="mt-1 text-[9px] font-bold text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full">
            {data.memberId}
          </p>

          {/* Rank Badge */}
          <Badge
            variant="outline"
            className={cn('text-[8px] px-1.5 py-0 mt-0.5 border-0 shadow-sm', rankStyle.badge)}
          >
            {data.rank}
          </Badge>
        </div>
      </div>

      {/* Custom Hover Tooltip */}
      <HoverTooltip data={data} name={name} isVisible={isHovered} />
    </div>
  );
};
