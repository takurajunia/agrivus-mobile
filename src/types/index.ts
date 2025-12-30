// User Types
export type UserRole =
  | "farmer"
  | "buyer"
  | "transporter"
  | "agro_supplier"
  | "admin";

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  isVerified: boolean;
  isActive?: boolean;

  // Activity metrics
  platformScore: number;
  totalTransactions: number;
  totalVolume: string;
  lastActiveDate?: string | null;

  // Boost metrics
  recentTransactions30d?: number;
  recentTransactions7d?: number;
  avgResponseTimeHours?: number;
  qualityScore?: string;
  streakDays?: number;
  lastStreakUpdate?: string | null;
  boostMultiplier?: string;

  createdAt: string;
  updatedAt?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  role: UserRole;
  profile?: Record<string, any>;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}
