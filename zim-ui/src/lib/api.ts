import axios from "axios";

// API base URL - environment variable'dan al
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

// Axios instance oluştur
export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// API response interceptor - hata yönetimi için
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API endpoint'leri
export const endpoints = {
  // Items
  items: "/api/items",
  item: (id: number) => `/api/items/${id}`,
  
  // Employees
  employees: "/api/employees",
  employee: (id: number) => `/api/employees/${id}`,
  
  // Assignments
  assignments: "/api/assignments",
  activeAssignments: "/api/assignments/active",
  assignmentsByEmployee: (employeeId: number) => `/api/assignments/by-employee/${employeeId}`,
  returnAssignment: (id: number) => `/api/assignments/${id}/return`,
  
  // Categories & Locations
  categories: "/api/categories",
  category: (id: number) => `/api/categories/${id}`,
  locations: "/api/locations",
  location: (id: number) => `/api/locations/${id}`,
} as const;
