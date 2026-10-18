export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";

export interface Page<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Payment {
  id: number;
  description: string;
  amount: number;
  dueDate: string;
  recurring: boolean;
  method: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInput {
  description: string;
  amount: number;
  dueDate: string;
  recurring: boolean;
  method: string;
}

export interface Income {
  id: number;
  description: string;
  amount: number;
  receivedDate: string;
}

export interface IncomeInput {
  description: string;
  amount: number;
  receivedDate: string;
}

export interface Summary {
  totalIncome: number;
  totalPayments: number;
  balance: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
