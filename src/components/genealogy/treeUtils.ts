import type { TreeNodeData } from './TreeNode';
import type { D3TreeNodeDatum } from './D3TreeNode';

// Transform API data to D3 tree format
export const transformToD3Format = (node: TreeNodeData | null, position: 'root' | 'left' | 'right' = 'root'): D3TreeNodeDatum => {
    if (!node) {
        return {
            name: 'Empty',
            attributes: {
                memberId: '',
                fullName: 'Empty Slot',
                rank: '',
                position,
                isEmpty: true,
            },
        };
    }

    const children: D3TreeNodeDatum[] = [];

    // Always add both children for binary structure (even if null)
    if (node.left !== null || node.right !== null) {
        children.push(transformToD3Format(node.left, 'left'));
        children.push(transformToD3Format(node.right, 'right'));
    }

    return {
        name: node.fullName,
        attributes: {
            memberId: node.memberId,
            fullName: node.fullName,
            rank: node.rank,
            position: node.position || position,
            avatar: node.avatar,
            profileImage: node.profileImage,
            joiningDate: node.joiningDate,
            totalDownline: node.totalDownline,
            parentId: node.parentId,
            sponsorId: node.sponsorId,
            directSponsors: node.directSponsors,
            isEmpty: false,
            isActive: node.isActive ?? (node.status?.toLowerCase() === 'active'),
            isStar: (node as any).isStar ?? false,
            status: node.status,
            // Complete Team Stats
            leftCompleteActive: node.leftDirectActive ?? node.leftCompleteActive ?? 0,
            leftCompleteInactive: node.leftDirectInactive ?? node.leftCompleteInactive ?? 0,
            rightCompleteActive: node.rightDirectActive ?? node.rightCompleteActive ?? 0,
            rightCompleteInactive: node.rightDirectInactive ?? node.rightCompleteInactive ?? 0,
            // Total Team Counts
            leftTeamCount: node.leftTeamCount ?? 0,
            rightTeamCount: node.rightTeamCount ?? 0,
            // Business Volume
            leftLegBV: node.leftLegBV ?? 0,
            rightLegBV: node.rightLegBV ?? 0,
            thisMonthLeftLegBV: node.thisMonthLeftLegBV ?? 0,
            thisMonthRightLegBV: node.thisMonthRightLegBV ?? 0,
            // Stars
            leftLegStars: node.leftLegStars ?? 0,
            rightLegStars: node.rightLegStars ?? 0,
        },
        children: children.length > 0 ? children : undefined,
    };
};
