import { apiClient } from "@/config/api";
import type {
  AuthTokens,
  Income,
  IncomeInput,
  Page,
  Payment,
  PaymentInput,
  PaymentStatus,
  Summary,
  User,
} from "@/types/api";

type PageParams = { page?: number; size?: number; sort?: string };

const query = (params: Record<string, string | number | null | undefined>) =>
  Object.entries(params)
    .filter(([, value]) => value != null && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join("&");

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    apiClient<AuthTokens>("auth/login", "POST", { email, password }, { auth: false }),
  register: (name: string, email: string, password: string) =>
    apiClient<User>("users", "POST", { name, email, password }, { auth: false }),
  logout: () => apiClient<null>("auth/logout", "POST"),
};

// Users
export const usersApi = {
  me: () => apiClient<User>("users/me"),
  update: (id: number, data: { name: string; email: string; password: string | null }) =>
    apiClient<User>(`users/${id}`, "PUT", data),
  remove: (id: number) => apiClient<null>(`users/${id}`, "DELETE"),
  getProfilePicture: async () => {
    try {
      const response = await apiClient<{ url: string | null }>("users/profile-picture");
      return response?.url ?? null;
    } catch {
      // The backend errors when the user never uploaded a picture.
      return null;
    }
  },
  uploadProfilePicture: (id: number, uri: string) => {
    const form = new FormData();
    form.append("file", { uri, name: "profilePicture.jpg", type: "image/jpeg" } as any);
    return apiClient<{ url: string }>(`users/profile-picture/${id}`, "PUT", form);
  },
};

// Payments
export const paymentsApi = {
  list: ({ page = 0, size = 10, sort = "dueDate,desc", status }: PageParams & { status?: PaymentStatus | null }) =>
    apiClient<Page<Payment>>(`payment?${query({ page, size, sort, status })}`),
  get: (id: number) => apiClient<Payment>(`payment/${id}`),
  create: (data: PaymentInput) => apiClient<Payment>("payment", "POST", data),
  update: (id: number, data: PaymentInput) => apiClient<Payment>(`payment/${id}`, "PUT", data),
  markPaid: (id: number) => apiClient<Payment>(`payment/mark-paid/${id}`, "POST"),
  markCancelled: (id: number) => apiClient<Payment>(`payment/mark-cancelled/${id}`, "POST"),
  remove: (id: number) => apiClient<null>(`payment/${id}`, "DELETE"),
};

// Incomes (the backend filters by receivedDate BETWEEN startDate AND endDate, so both are required)
export const incomesApi = {
  list: ({
    page = 0,
    size = 10,
    sort = "receivedDate,desc",
    startDate,
    endDate,
  }: PageParams & { startDate: string; endDate: string }) =>
    apiClient<Page<Income>>(`incomes?${query({ page, size, sort, startDate, endDate })}`),
  get: (id: number) => apiClient<Income>(`incomes/${id}`),
  create: (data: IncomeInput) => apiClient<Income>("incomes", "POST", data),
  update: (id: number, data: IncomeInput) => apiClient<Income>(`incomes/${id}`, "PUT", data),
  remove: (id: number) => apiClient<null>(`incomes/${id}`, "DELETE"),
};

// Summary
export const summaryApi = {
  get: (startDate: string, endDate: string) =>
    apiClient<Summary>(`summary?${query({ startDate, endDate })}`),
};
