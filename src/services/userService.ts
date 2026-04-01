import api from '@/lib/api';

export interface Product {
  _id: string;
  productId: string;
  productName: string;
  productImage?: {
    url?: string;
  };
  category?: string;
  description?: string;
  mrp: number;
  productDP: number;
  bv: number;
  pv: number;
  stockQuantity: number;
  isInStock: boolean;
  hsnCode?: string;
  cgst?: number;
  sgst?: number;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface ProductDetailsResponse {
  success: boolean;
  message: string;
  data: {
    product: Product;
  };
}

// Fetch all products with pagination
export const getAllProducts = async (page = 1, limit = 12): Promise<ProductsResponse> => {
  const response = await api.get('/api/v1/user/products', {
    params: { page, limit }
  });
  return response.data;
};

// Fetch single product details
export const getProductDetails = async (productId: string): Promise<ProductDetailsResponse> => {
  const response = await api.get(`/api/v1/user/products/${productId}`);
  return response.data;
};

// Fetch wallet summary
export const getWalletSummary = async () => {
  const response = await api.get('/api/v1/user/wallet');
  const body = response.data;
  // Handle nested response structures
  if (body?.data?.wallet) return body.data.wallet;
  if (body?.wallet) return body.wallet;
  return body;
};

// Fetch payout history
export const getPayoutHistory = async () => {
  const response = await api.get('/api/v1/user/payouts');
  const body = response.data;
  if (body?.data && Array.isArray(body.data)) return body.data;
  if (Array.isArray(body)) return body;
  if (body?.data?.payouts) return body.data.payouts;
  if (body?.payouts) return body.payouts;
  return [];
};

// Fetch direct team by leg
export const getDirectTeam = async (page = 1, limit = 10, leg?: 'all' | 'left' | 'right') => {
  const params: Record<string, any> = { page, limit };
  if (leg && leg !== 'all') params.leg = leg;
  const response = await api.get('/api/v1/user/direct-team', { params });
  return response.data;
};

// Fetch fast track bonus status
export const getFastTrackStatus = async () => {
  const response = await api.get('/api/v1/user/fast-track-status');
  return response.data;
};

// Fetch star matching bonus status
export const getStarMatchingStatus = async () => {
  const response = await api.get('/api/v1/user/star-matching-status');
  return response.data;
};

// Fetch complete downline team (leg is required)
export const getDownlineTeam = async (leg: 'left' | 'right', page = 1, limit = 10) => {
  const response = await api.get('/api/v1/user/team/complete', {
    params: { leg, page, limit }
  });
  return response.data;
};

// Fetch user tree data (team counts)
export const getUserTree = async (memberId: string) => {
  const response = await api.get(`/api/v1/user/tree/${memberId}`);
  return response.data;
};

// Fetch repurchase bonus status
export const getSelfRepurchaseBonusStatus = async () => {
  const response = await api.get('/api/v1/user/self-repurchase-bonus/status');
  return response.data;
};

// Fetch user's beginner matching bonus status
export const getBeginnerMatchingStatus = async () => {
  const response = await api.get('/api/v1/user/beginner-bonus/status');
  return response.data;
};

// Fetch user's beginner matching bonus history
export const getBeginnerMatchingHistory = async (page = 1, limit = 10) => {
  const response = await api.get('/api/v1/user/beginner-bonus/history', {
    params: { page, limit }
  });
  return response.data;
};

// Fetch beginner matching bonus status for any public member
export const getPublicBeginnerBonusStatus = async (memberId: string) => {
  const response = await api.get(`/api/v1/user/beginner-bonus/status/${memberId}`);
  return response.data;
};

// Fetch user's beginner matching bonus live estimate
export const getBeginnerBonusLiveEstimate = async () => {
  const response = await api.get('/api/v1/user/beginner-bonus/live-estimate');
  return response.data;
};

// ===== Startup Bonus User APIs =====

export const getStartupBonusStatus = async () => {
  const response = await api.get('/api/v1/user/startup-bonus/status');
  return response.data;
};

export const getStartupBonusHistory = async (page = 1, limit = 10) => {
  const response = await api.get('/api/v1/user/startup-bonus/history', {
    params: { page, limit }
  });
  return response.data;
};

export const getStartupBonusLiveEstimate = async () => {
  const response = await api.get('/api/v1/user/startup-bonus/live-estimate');
  return response.data;
};

export const getPublicStartupBonusStatus = async (memberId: string) => {
  const response = await api.get(`/api/v1/user/startup-bonus/status/${memberId}`);
  return response.data;
};

// ===== Leadership Bonus User APIs =====

export const getLeadershipBonusStatus = async () => {
  const response = await api.get('/api/v1/user/leadership-bonus/status');
  return response.data;
};

export const getLeadershipBonusHistory = async (page = 1, limit = 10) => {
  const response = await api.get('/api/v1/user/leadership-bonus/history', {
    params: { page, limit }
  });
  return response.data;
};

export const getLeadershipBonusLiveEstimate = async () => {
  const response = await api.get('/api/v1/user/leadership-bonus/live-estimate');
  return response.data;
};

export const getPublicLeadershipBonusStatus = async (memberId: string) => {
  const response = await api.get(`/api/v1/user/leadership-bonus/status/${memberId}`);
  return response.data;
};

// ===== Tour Fund User APIs =====

export const getTourFundStatus = async () => {
  const response = await api.get('/api/v1/user/tour-fund/status');
  return response.data;
};

export const getTourFundHistory = async (page = 1, limit = 10) => {
  const response = await api.get('/api/v1/user/tour-fund/history', {
    params: { page, limit }
  });
  return response.data;
};

export const getTourFundLiveEstimate = async () => {
  const response = await api.get('/api/v1/user/tour-fund/live-estimate');
  return response.data;
};

export const getPublicTourFundStatus = async (memberId: string) => {
  const response = await api.get(`/api/v1/user/tour-fund/status/${memberId}`);
  return response.data;
};

// ===== Health & Education Bonus User APIs =====

export const getHealthEducationBonusStatus = async () => {
  const response = await api.get('/api/v1/user/health-education-bonus/status');
  return response.data;
};

export const getHealthEducationBonusHistory = async (page = 1, limit = 10) => {
  const response = await api.get('/api/v1/user/health-education-bonus/history', {
    params: { page, limit }
  });
  return response.data;
};

export const getHealthEducationBonusLiveEstimate = async () => {
  const response = await api.get('/api/v1/user/health-education-bonus/live-estimate');
  return response.data;
};

export const getPublicHealthEducationBonusStatus = async (memberId: string) => {
  const response = await api.get(`/api/v1/user/health-education-bonus/status/${memberId}`);
  return response.data;
};

// ===== Bike & Car Fund User APIs =====

export const getBikeCarFundStatus = async () => {
  const response = await api.get('/api/v1/user/bike-car-fund/status');
  return response.data;
};

export const getBikeCarFundHistory = async (page = 1, limit = 10) => {
  const response = await api.get('/api/v1/user/bike-car-fund/history', {
    params: { page, limit }
  });
  return response.data;
};

export const getBikeCarFundLiveEstimate = async () => {
  const response = await api.get('/api/v1/user/bike-car-fund/live-estimate');
  return response.data;
};

export const getPublicBikeCarFundStatus = async (memberId: string) => {
  const response = await api.get(`/api/v1/user/bike-car-fund/status/${memberId}`);
  return response.data;
};

// ===== House Fund User APIs =====

export const getHouseFundStatus = async () => {
  const response = await api.get('/api/v1/user/house-fund/status');
  return response.data;
};

export const getHouseFundHistory = async (page = 1, limit = 10) => {
  const response = await api.get('/api/v1/user/house-fund/history', {
    params: { page, limit }
  });
  return response.data;
};

export const getHouseFundLiveEstimate = async () => {
  const response = await api.get('/api/v1/user/house-fund/live-estimate');
  return response.data;
};

export const getPublicHouseFundStatus = async (memberId: string) => {
  const response = await api.get(`/api/v1/user/house-fund/status/${memberId}`);
  return response.data;
};

// ===== Royalty Fund User APIs =====

export const getRoyaltyFundStatus = async () => {
  const response = await api.get('/api/v1/user/royalty-fund/status');
  return response.data;
};

export const getRoyaltyFundHistory = async (page = 1, limit = 10) => {
  const response = await api.get('/api/v1/user/royalty-fund/history', {
    params: { page, limit }
  });
  return response.data;
};

export const getRoyaltyFundLiveEstimate = async () => {
  const response = await api.get('/api/v1/user/royalty-fund/live-estimate');
  return response.data;
};

export const getPublicRoyaltyFundStatus = async (memberId: string) => {
  const response = await api.get(`/api/v1/user/royalty-fund/status/${memberId}`);
  return response.data;
};

// ===== SSVPL Super Bonus User APIs =====

export const getSsvplSuperBonusStatus = async () => {
  const response = await api.get('/api/v1/user/ssvpl-super-bonus/status');
  return response.data;
};

export const getSsvplSuperBonusHistory = async (page = 1, limit = 10) => {
  const response = await api.get('/api/v1/user/ssvpl-super-bonus/history', {
    params: { page, limit }
  });
  return response.data;
};

export const getSsvplSuperBonusLiveEstimate = async () => {
  const response = await api.get('/api/v1/user/ssvpl-super-bonus/live-estimate');
  return response.data;
};

export const getPublicSsvplSuperBonusStatus = async (memberId: string) => {
  const response = await api.get(`/api/v1/user/ssvpl-super-bonus/status/${memberId}`);
  return response.data;
};

// Fetch user's purchase history
export const getMyPurchases = async (page = 1, limit = 20) => {
  const response = await api.get('/api/v1/user/purchases', {
    params: { page, limit }
  });
  return response.data;
};

// Fetch Tree BV Summary for the user
export const getUserTreeBVSummary = async (memberId?: string) => {
  const url = memberId 
    ? `/api/v1/user/tree-bv-summary/${memberId}` 
    : '/api/v1/user/tree-bv-summary';
  const response = await api.get(url);
  return response.data;
};

// Fetch Personal Repurchase BV
export const getPersonalRepurchaseBV = async () => {
  const response = await api.get('/api/v1/user/self-repurchase-bonus/personal-bv');
  return response.data;
};

// ============================================
// ISOLATED HISTORICAL BV TRACKING APIS
// ============================================

export const getMonthlyBvHistory = async (count = 12) => {
  const response = await api.get('/api/v1/user/bv-history/monthly', { params: { count } });
  return response.data;
};

export const getHalfYearlyBvHistory = async (count = 4) => {
  const response = await api.get('/api/v1/user/bv-history/half-yearly', { params: { count } });
  return response.data;
};

export const getYearlyBvHistory = async (count = 3) => {
  const response = await api.get('/api/v1/user/bv-history/yearly', { params: { count } });
  return response.data;
};
