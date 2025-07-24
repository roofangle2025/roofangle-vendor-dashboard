export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  lastLogin: Date | null;
  status: 'active' | 'inactive' | 'pending';
  roles: string[];
  businessGroups: string[];
}

export interface BusinessGroup {
  id: string;
  name: string;
  description?: string;
  userCount: number;
  createdAt: Date;
  users: User[];
  status: 'active' | 'inactive';
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: Date;
  details: string;
  groupId?: string;
}

export interface NavigationState {
  currentPage: 'users' | 'business-groups' | 'group-details' | 'ra-role' | 'ra-audit-logs' | 'order-dashboard' | 'place-order' | 'order-process' | 'orders-delivery' | 'order-details' | 'reports-management' | 'quality-analytics' | 'vendor-report' | 'payments' | 'vendor-payments' | 'runtime-management';
  selectedGroupId?: string;
  selectedOrderId?: string;
  showAccessSidebar: boolean;
  showMenuSidebar: boolean;
  showOrderSidebar: boolean;
  showReportsSidebar: boolean;
  showFinancialSidebar: boolean;
  showRuntimeSidebar: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  businessGroup: string;
  status: 'unassigned' | 'in-progress' | 'qa-review' | 'ready-for-delivery' | 'completed' | 'rollback' | 'cancelled';
  orderDate: Date;
  deliveryDate?: Date;
  items: OrderItem[];
  notes?: string;
  // New fields for enhanced order details
  address?: string;
  propertyType?: string;
  service?: string;
  rushOrder?: boolean;
  pdfRequired?: boolean;
  additionalInstructions?: string;
  insuredName?: string;
  claimNumber?: string;
  // Process workflow fields
  processStatus?: 'new' | 'assigned' | 'sketch' | 'qa' | 'ready' | 'completed' | 'rollback' | 'cancelled';
  assignedTo?: string;
  sketchPersonId?: string;
  qaPersonId?: string;
  managerApproval?: boolean;
  workflowHistory?: WorkflowStep[];
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  description?: string;
}

export interface OrderStats {
  businessGroup: string;
  newOrders: number;
  inProgress: number;
  completed: number;
  total: number;
}

export interface WorkflowStep {
  id: string;
  step: 'new' | 'assigned' | 'sketch' | 'qa' | 'ready' | 'completed' | 'rollback' | 'cancelled';
  userId: string;
  userName: string;
  timestamp: Date;
  notes?: string;
  files?: string[];
  qualityRating?: number; // 1-5 star rating for completed work
}

export interface UserRole {
  id: string;
  name: 'sketch' | 'qa' | 'manager' | 'admin';
  permissions: string[];
  canViewOrders: boolean;
  canAssignOrders: boolean;
  canProcessOrders: boolean;
}

export interface ReportData {
  id: string;
  orderNumber: string;
  itemNumber: string;
  deliverTimestamp: Date | null;
  sketchPersonName: string;
  qaPersonName: string;
  sketchPersonQuality: number; // 1-5 rating
  qaPersonQuality: number; // 1-5 rating
  businessGroup: string;
  status: string;
  customerName: string;
  propertyType?: string;
  service?: string;
}