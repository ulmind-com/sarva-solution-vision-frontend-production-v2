import api from '@/lib/api';

// ===== Franchise Request Types =====

export interface FranchiseRequestProduct {
  _id: string;
  productName: string;
  productDP: number;
  mrp: number;
  cgst: number;
  sgst: number;
}

export interface FranchiseRequestItem {
  product: FranchiseRequestProduct;
  requestedQuantity: number;
  _id: string;
}

export interface FranchiseInfo {
  _id: string;
  name: string;
  shopName: string;
  vendorId: string;
  city: string;
}

export interface FranchiseRequest {
  _id: string;
  requestNo: string;
  franchise: FranchiseInfo;
  items: FranchiseRequestItem[];
  status: 'pending' | 'approved' | 'rejected';
  estimatedTotal: number;
  grandTotal?: number;
  totalTaxableValue?: number;
  totalCGST?: number;
  totalSGST?: number;
  requestDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface FranchiseRequestsResponse {
  requests: FranchiseRequest[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRequests: number;
    limit: number;
  };
}

// ===== API Functions =====

/**
 * Fetch all franchise product requests
 * API: GET /api/v1/admin/requests/list
 */
export const getFranchiseRequests = async (page = 1, limit = 10): Promise<FranchiseRequestsResponse> => {
  const response = await api.get('/api/v1/admin/requests/list', {
    params: { page, limit },
  });
  // Handle nested response: response.data may contain { success, data: { requests, pagination } }
  const body = response.data;
  if (body?.data?.requests) {
    return body.data;
  }
  if (body?.requests) {
    return body;
  }
  return { requests: [], pagination: { currentPage: 1, totalPages: 1, totalRequests: 0, limit } };
};

/**
 * Approve a franchise product request
 * API: PATCH /api/v1/admin/requests/{requestId}/approve
 */
export const approveFranchiseRequest = async (requestId: string) => {
  const response = await api.patch(`/api/v1/admin/requests/${requestId}/approve`);
  return response.data;
};

// ===== Product Management =====

/**
 * Update a product
 * API: PUT /api/v1/admin/product/update/{productId}
 */
export const updateProduct = async (productId: string, formData: FormData) => {
  const response = await api.put(`/api/v1/admin/product/update/${productId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Delete a product
 * API: DELETE /api/v1/admin/product/{productId}
 */
export const deleteProduct = async (productId: string) => {
  const response = await api.delete(`/api/v1/admin/product/${productId}`);
  return response.data;
};

// ===== Franchise Management =====

/**
 * Update a franchise
 * API: PUT /api/v1/admin/franchise/{franchiseId}
 */
export const updateFranchise = async (franchiseId: string, data: { name?: string; shopName?: string; phone?: string; city?: string; password?: string }) => {
  const response = await api.put(`/api/v1/admin/franchise/${franchiseId}`, data);
  return response.data;
};

/**
 * Delete (soft delete) a franchise
 * API: DELETE /api/v1/admin/franchise/{franchiseId}
 */
export const deleteFranchise = async (franchiseId: string) => {
  const response = await api.delete(`/api/v1/admin/franchise/${franchiseId}`);
  return response.data;
};

// ===== Bonus Management =====

export const getSelfRepurchaseCompanyBv = async (month?: string) => {
  const params: Record<string, unknown> = {};
  if (month) params.month = month;
  const response = await api.get('/api/v1/admin/self-repurchase-bonus/company-bv', { params });
  return response.data;
};

export const getSelfRepurchaseDistribution = async (month?: string) => {
  const params: Record<string, unknown> = {};
  if (month) params.month = month;
  const response = await api.get('/api/v1/admin/self-repurchase-bonus/distribution', { params });
  return response.data;
};

export const triggerSelfRepurchaseDistribution = async (year: number, month: number) => {
  const response = await api.post('/api/v1/admin/self-repurchase-bonus/trigger-distribution', { year, month });
  return response.data;
};

export const getSelfRepurchaseLivePool = async () => {
  const response = await api.get('/api/v1/admin/self-repurchase-bonus/live-pool');
  return response.data;
};

export const getSelfRepurchaseEligibleUsers = async (month?: string) => {
  const params: Record<string, unknown> = {};
  if (month) params.month = month;
  const response = await api.get('/api/v1/admin/self-repurchase-bonus/eligible-users', { params });
  return response.data;
};

export const getSelfRepurchaseBvHistory = async () => {
  const response = await api.get('/api/v1/admin/self-repurchase-bonus/bv-history');
  return response.data;
};

export const getGlobalRepurchaseHistory = async (page = 1, limit = 20, memberId?: string) => {
  const params: Record<string, unknown> = { page, limit };
  if (memberId) params.memberId = memberId;
  const response = await api.get('/api/v1/admin/bonus/repurchase-history', { params });
  return response.data;
};

export const getLiveQualifiers = async (page = 1, limit = 20) => {
  const response = await api.get('/api/v1/admin/bonus/live-qualifiers', {
    params: { page, limit }
  });
  return response.data;
};

export const triggerRepurchaseDistribution = async () => {
  const response = await api.post('/api/v1/admin/bonus/trigger-repurchase-distribution');
  return response.data;
};

// ===== Beginner Matching Bonus Management =====

export const getBeginnerBonusPools = async (page = 1, limit = 12) => {
  const response = await api.get('/api/v1/admin/beginner-bonus/pools', {
    params: { page, limit }
  });
  return response.data;
};

export const getBeginnerBonusPoolDetail = async (year: number, month: number) => {
  const response = await api.get(`/api/v1/admin/beginner-bonus/pools/${year}/${month}`);
  return response.data;
};

export const getActiveBeginnerBonusUsers = async () => {
  const response = await api.get('/api/v1/admin/beginner-bonus/users');
  return response.data;
};

export const getBeginnerBonusLivePool = async () => {
  const response = await api.get('/api/v1/admin/beginner-bonus/live-pool');
  return response.data;
};

export const getBeginnerBonusUserDetail = async (memberId: string) => {
  const response = await api.get(`/api/v1/admin/beginner-bonus/users/${memberId}`);
  return response.data;
};

export const triggerBeginnerBonus = async (year: number, month: number) => {
  const response = await api.post('/api/v1/admin/beginner-bonus/trigger', { year, month });
  return response.data;
};

export const applyBeginnerBonusCredits = async (year: number, month: number) => {
  const response = await api.post('/api/v1/admin/beginner-bonus/apply-credits', { year, month });
  return response.data;
};

// Fetch Tree BV Summary for a specific user (Admin)
export const getAdminTreeBVSummary = async (memberId: string) => {
  const response = await api.get(`/api/v1/admin/tree-bv-summary/${memberId}`);
  return response.data;
};
