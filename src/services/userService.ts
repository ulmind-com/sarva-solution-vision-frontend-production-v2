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
  const response = await api.get('/api/v1/user/bonus/beginner-matching-status');
  return response.data;
};

// Fetch user's beginner matching bonus history
export const getBeginnerMatchingHistory = async (page = 1, limit = 10) => {
  const response = await api.get('/api/v1/user/bonus/beginner-matching-history', {
    params: { page, limit }
  });
  return response.data;
};

// Fetch user's purchase history
export const getMyPurchases = async (page = 1, limit = 20) => {
  const response = await api.get('/api/v1/user/purchases', {
    params: { page, limit }
  });
  return response.data;
};
