import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

interface StarCountCardProps {
  memberId?: string;
}

const fetchStarCount = async (memberId: string) => {
  const response = await api.get(`/api/v1/user/network/star-count/${memberId}`);
  return response.data;
};

const StarCountCard: React.FC<StarCountCardProps> = ({ memberId }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['starCount', memberId],
    queryFn: async () => {
      if (!memberId) {
        throw new Error("Member ID is required");
      }
      return await fetchStarCount(memberId);
    },
    enabled: !!memberId,
    staleTime: 60000,
  });

  if (!memberId || isLoading) {
    return (
      <Card className="mb-6 border-border h-full min-h-[200px]">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data?.success) {
    return (
      <Card className="mb-6 border-destructive/50 bg-destructive/5 h-full min-h-[200px] flex items-center justify-center">
        <CardContent className="flex items-center gap-2 py-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>Failed to load Star counts. {(error as any)?.message || 'Something went wrong.'}</p>
        </CardContent>
      </Card>
    );
  }

  const { leftStarCount, rightStarCount } = data.data;

  return (
    <Card className="mb-6 border-border overflow-hidden shadow-sm flex flex-col">
      <CardHeader className="pb-3 bg-muted/30 border-b border-border">
        <div className="flex justify-between items-center max-sm:flex-col max-sm:items-start gap-2">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
            <CardTitle className="text-lg">Star Network Summary</CardTitle>
          </div>
          <Badge variant="outline" className="bg-background text-amber-600 border-amber-200">
            {memberId}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Left Star Count */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card shadow-sm hover:border-amber-400/50 hover:shadow-md transition-all group">
            <div className="flex items-center gap-2 text-primary mb-3">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-semibold text-sm">Left Leg Stars</span>
            </div>
            <div className="text-5xl font-extrabold text-foreground group-hover:text-amber-500 transition-colors">
              {leftStarCount}
            </div>
            <span className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest font-medium">Qualified</span>
          </div>

          {/* Right Star Count */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card shadow-sm hover:border-amber-400/50 hover:shadow-md transition-all group">
            <div className="flex items-center gap-2 text-primary mb-3">
              <span className="font-semibold text-sm">Right Leg Stars</span>
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="text-5xl font-extrabold text-foreground group-hover:text-amber-500 transition-colors">
              {rightStarCount}
            </div>
            <span className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest font-medium">Qualified</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StarCountCard;
