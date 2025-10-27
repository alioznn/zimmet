// API Response Types
export interface Item {
  id: number;
  name: string;
  sku: string;
  category: string;
  location: string | null;
  quantityOnHand: number;
  quantityAssigned: number;
  totalQuantity: number;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  department: string;
}

export interface Assignment {
  id: number;
  itemName: string;
  itemSku: string;
  employeeName: string;
  quantity: number;
  status: "Assigned" | "Returned";
  assignedAt: string;
  returnedAt: string | null;
}

export interface ActiveAssignment {
  id: number;
  item: string;
  employee: string;
  quantity: number;
  status: string;
  assignedAt: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Location {
  id: number;
  name: string;
}

// Form Types
export interface CreateItemForm {
  name: string;
  sku: string;
  categoryId: number;
  locationId: number | null;
  quantityOnHand: number;
}

export interface CreateEmployeeForm {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
}

export interface CreateAssignmentForm {
  itemId: number;
  employeeId: number;
  quantity: number;
}
