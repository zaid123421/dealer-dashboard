export type DealerMeCurrentUser = {
  email: string;
  firstName: string;
  lastName: string;
  roleName: string;
  accessLevel: string;
  userActive: boolean;
};

export type DealerMeDealer = {
  id: number;
  legalName: string;
  businessName: string;
  email: string;
  phoneNumber: string;
  dealerUniqueId: string;
  status: string;
  streetNumber: string;
  streetName: string;
  aptUnitBldg: string;
  postalCode: string;
  createdAt: string | null;
  updatedAt: string | null;
  totalUsers: number;
  userRoles: Record<string, number>;
};

export type DealerMeSubscription = {
  id: number;
  dealerId: number;
  dealerName: string;
  planId: number;
  planName: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  amountPaid: number;
  autoRenew: boolean;
  billingWeekday: string | null;
  cancellationDate: string | null;
  cancellationReason: string | null;
  totalUsers: number;
  userRoles: Record<string, number>;
  createdAt: string | null;
  updatedAt: string | null;
};

export type DealerMeUsage = {
  totalStaff: number;
  activeStaff: number;
  activeStaffLimit: number;
  remainingStaffSlots: number;
  tireCount: number;
  tireStorageLimit: number;
  remainingTireSlots: number;
  totalUsers: number;
  hasActiveSubscription: boolean;
  daysToSubscriptionExpiry: number | null;
  subscriptionStatus: string;
};

export type DealerMeRoleUsageEntry = {
  canAddMore: boolean;
  currentCount: number;
  remainingSlots: number;
  usagePercentage: number;
  maxCount: number;
};

export type DealerMeRoleUsage = {
  roleLimits: Record<string, number>;
  totalRemainingSlots: number;
  roleUsage: Record<string, DealerMeRoleUsageEntry>;
  hasUserRolesConfig: boolean;
  totalMaxStaff: number;
  totalCurrentStaff: number;
};

/** Normalized body from GET /v1/dealer/me */
export type DealerProfile = {
  dealer: DealerMeDealer;
  currentUser: DealerMeCurrentUser;
  activeSubscription: DealerMeSubscription | null;
  usage: DealerMeUsage | null;
  roleUsage: DealerMeRoleUsage | null;
  availableRoles: string[];
  alerts: string[];
};
