import type { User, BusinessGroup, Role, ActivityLog, Order, OrderStats, UserRole } from '../types';
import { ReportData } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    lastLogin: new Date('2025-01-15T10:00:00'),
    status: 'active',
    roles: ['Admin', 'Manager'],
    businessGroups: ['ridgetop', 'skyline']
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    lastLogin: new Date('2025-01-14T15:30:00'),
    status: 'active',
    roles: ['Sketch'],
    businessGroups: ['ridgetop']
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@example.com',
    lastLogin: new Date('2025-01-13T09:15:00'),
    status: 'active',
    roles: ['QA'],
    businessGroups: ['skyline']
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@example.com',
    lastLogin: null,
    status: 'pending',
    roles: ['Sketch'],
    businessGroups: []
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@example.com',
    lastLogin: new Date('2025-01-12T14:20:00'),
    status: 'active',
    roles: ['Manager'],
    businessGroups: ['ridgetop', 'skyline']
  }
];

export const mockUserRoles: UserRole[] = [
  {
    id: 'sketch',
    name: 'sketch',
    permissions: ['view_assigned_orders', 'upload_files', 'update_order_status'],
    canViewOrders: true,
    canAssignOrders: false,
    canProcessOrders: true
  },
  {
    id: 'qa',
    name: 'qa',
    permissions: ['view_qa_orders', 'approve_sketches', 'reject_sketches'],
    canViewOrders: true,
    canAssignOrders: false,
    canProcessOrders: true
  },
  {
    id: 'manager',
    name: 'manager',
    permissions: ['view_all_orders', 'assign_orders', 'final_approval'],
    canViewOrders: true,
    canAssignOrders: true,
    canProcessOrders: true
  },
  {
    id: 'admin',
    name: 'admin',
    permissions: ['full_access'],
    canViewOrders: true,
    canAssignOrders: true,
    canProcessOrders: true
  }
];

export const mockBusinessGroups: BusinessGroup[] = [
  {
    id: 'ridgetop',
    name: 'Ridgetop',
    description: 'Main construction division focused on residential projects',
    userCount: 5,
    createdAt: new Date('2024-12-01'),
    users: mockUsers.filter(user => user.businessGroups.includes('ridgetop')),
    status: 'active'
  },
  {
    id: 'skyline',
    name: 'Skyline',
    description: 'Commercial construction and high-rise projects',
    userCount: 3,
    createdAt: new Date('2024-11-15'),
    users: mockUsers.filter(user => user.businessGroups.includes('skyline')),
    status: 'active'
  }
];

export const mockRoles: Role[] = [
  {
    id: 'admin',
    name: 'Admin',
    permissions: ['read', 'write', 'delete', 'manage_users', 'manage_groups'],
    description: 'Full system access with user and group management'
  },
  {
    id: 'manager',
    name: 'Manager',
    permissions: ['read', 'write', 'manage_users', 'assign_orders', 'final_approval'],
    description: 'Project management with user oversight and order assignment'
  },
  {
    id: 'sketch',
    name: 'Sketch',
    permissions: ['read', 'write', 'view_assigned_orders', 'upload_files'],
    description: 'Sketch role for creating property sketches and reports'
  },
  {
    id: 'qa',
    name: 'QA',
    permissions: ['read', 'write', 'view_qa_orders', 'approve_sketches'],
    description: 'Quality assurance role for reviewing and approving sketches'
  }
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Doe',
    action: 'User Login',
    timestamp: new Date('2025-01-15T10:00:00'),
    details: 'Successful login from IP 192.168.1.100',
    groupId: 'ridgetop'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Jane Smith',
    action: 'Order Assigned',
    timestamp: new Date('2025-01-14T15:30:00'),
    details: 'Order ORD-2025-001 assigned to sketch team',
    groupId: 'ridgetop'
  },
  {
    id: '3',
    userId: '1',
    userName: 'John Doe',
    action: 'User Added to Group',
    timestamp: new Date('2025-01-13T11:20:00'),
    details: 'Added user Sarah Wilson to Skyline group',
    groupId: 'skyline'
  },
  {
    id: '4',
    userId: '3',
    userName: 'Mike Johnson',
    action: 'QA Review Completed',
    timestamp: new Date('2025-01-12T16:45:00'),
    details: 'QA review completed for order ORD-2025-002',
    groupId: 'skyline'
  }
];

export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2025-001',
    customerName: 'ABC Construction Co.',
    businessGroup: 'Ridgetop',
    status: 'unassigned',
    processStatus: 'new',
    orderDate: new Date('2025-01-15T09:00:00'),
    deliveryDate: new Date('2025-01-20T10:00:00'),
    items: [
      { id: '1', name: 'ESX Report', quantity: 1, description: 'Residential property inspection report' },
      { id: '2', name: 'DAD Report', quantity: 1, description: 'Damage assessment documentation' }
    ],
    notes: 'New order - awaiting assignment',
    address: '123 Main Street, Downtown, City 12345',
    propertyType: 'Residential',
    service: 'ESX Report',
    rushOrder: true,
    pdfRequired: true,
    additionalInstructions: 'Handle with care - high priority client',
    insuredName: 'John Smith Insurance',
    claimNumber: 'CLM-2025-001',
    assignedTo: 'Unassigned',
    workflowHistory: [
      {
        id: '1',
        step: 'new',
        userId: '1',
        userName: 'John Doe',
        timestamp: new Date('2025-01-15T09:00:00'),
        notes: 'Order created and awaiting assignment'
      }
    ]
  },
  {
    id: '2',
    orderNumber: 'ORD-2025-002',
    customerName: 'Metro Building Solutions',
    businessGroup: 'Skyline',
    status: 'in-progress',
    processStatus: 'sketch',
    orderDate: new Date('2025-01-14T14:30:00'),
    deliveryDate: new Date('2025-01-18T08:00:00'),
    items: [
      { id: '3', name: 'Wall Report', quantity: 1, description: 'Commercial wall inspection' },
      { id: '4', name: 'DAD Report', quantity: 1, description: 'Damage assessment for commercial property' }
    ],
    notes: 'Standard processing - commercial property',
    address: '456 Oak Avenue, Business District, City 12345',
    propertyType: 'Commercial',
    service: 'Wall Report',
    rushOrder: false,
    pdfRequired: true,
    additionalInstructions: 'Standard commercial inspection protocol',
    insuredName: 'Metro Insurance Corp',
    claimNumber: 'CLM-2025-002',
    assignedTo: 'Jane Smith',
    sketchPersonId: '2',
    workflowHistory: [
      {
        id: '1',
        step: 'new',
        userId: '1',
        userName: 'John Doe',
        timestamp: new Date('2025-01-14T14:30:00'),
        notes: 'Order created'
      },
      {
        id: '2',
        step: 'assigned',
        userId: '1',
        userName: 'John Doe',
        timestamp: new Date('2025-01-14T15:00:00'),
        notes: 'Assigned to Jane Smith for sketch work'
      },
      {
        id: '3',
        step: 'sketch',
        userId: '2',
        userName: 'Jane Smith',
        timestamp: new Date('2025-01-14T16:00:00'),
        notes: 'Started sketch work'
      }
    ]
  },
  {
    id: '3',
    orderNumber: 'ORD-2025-003',
    customerName: 'Residential Builders Inc.',
    businessGroup: 'Ridgetop',
    status: 'qa-review',
    processStatus: 'qa',
    orderDate: new Date('2025-01-12T11:15:00'),
    deliveryDate: new Date('2025-01-15T16:00:00'),
    items: [
      { id: '5', name: 'ESX Report', quantity: 1, description: 'Residential inspection completed' },
      { id: '6', name: 'PDF Documentation', quantity: 1, description: 'Digital report package' }
    ],
    notes: 'Sketch completed - awaiting QA review',
    address: '789 Pine Road, Residential Area, City 12345',
    propertyType: 'Residential',
    service: 'ESX Report',
    rushOrder: false,
    pdfRequired: true,
    additionalInstructions: 'Standard residential inspection',
    insuredName: 'Residential Insurance LLC',
    claimNumber: 'CLM-2025-003',
    assignedTo: 'Mike Johnson',
    sketchPersonId: '2',
    qaPersonId: '3',
    workflowHistory: [
      {
        id: '1',
        step: 'new',
        userId: '1',
        userName: 'John Doe',
        timestamp: new Date('2025-01-12T11:15:00'),
        notes: 'Order created'
      },
      {
        id: '2',
        step: 'assigned',
        userId: '1',
        userName: 'John Doe',
        timestamp: new Date('2025-01-12T12:00:00'),
        notes: 'Assigned to Jane Smith for sketch work'
      },
      {
        id: '3',
        step: 'sketch',
        userId: '2',
        userName: 'Jane Smith',
        timestamp: new Date('2025-01-12T14:00:00'),
        notes: 'Sketch work completed, moving to QA',
        qualityRating: 4
      },
      {
        id: '4',
        step: 'qa',
        userId: '3',
        userName: 'Mike Johnson',
        timestamp: new Date('2025-01-13T09:00:00'),
        notes: 'QA review in progress',
        qualityRating: 5
      }
    ]
  },
  {
    id: '4',
    orderNumber: 'ORD-2025-004',
    customerName: 'Downtown Development LLC',
    businessGroup: 'Skyline',
    status: 'ready-for-delivery',
    processStatus: 'ready',
    orderDate: new Date('2025-01-13T16:45:00'),
    deliveryDate: new Date('2025-01-22T12:00:00'),
    items: [
      { id: '7', name: 'DAD Report', quantity: 1, description: 'High-rise building assessment' },
      { id: '8', name: 'Wall Report', quantity: 1, description: 'Structural wall analysis' }
    ],
    notes: 'QA approved - ready for delivery',
    address: '321 Elm Drive, Commercial Zone, City 12345',
    propertyType: 'Commercial',
    service: 'DAD Report',
    rushOrder: true,
    pdfRequired: true,
    additionalInstructions: 'Expedited processing for development timeline',
    insuredName: 'Downtown Insurance Group',
    claimNumber: 'CLM-2025-004',
    assignedTo: 'David Brown',
    sketchPersonId: '2',
    qaPersonId: '3',
    workflowHistory: [
      {
        id: '1',
        step: 'new',
        userId: '1',
        userName: 'John Doe',
        timestamp: new Date('2025-01-13T16:45:00'),
        notes: 'Rush order created'
      },
      {
        id: '2',
        step: 'assigned',
        userId: '1',
        userName: 'John Doe',
        timestamp: new Date('2025-01-13T17:00:00'),
        notes: 'Assigned to Jane Smith for urgent sketch work'
      },
      {
        id: '3',
        step: 'sketch',
        userId: '2',
        userName: 'Jane Smith',
        timestamp: new Date('2025-01-14T10:00:00'),
        notes: 'Rush sketch completed',
        qualityRating: 5
      },
      {
        id: '4',
        step: 'qa',
        userId: '3',
        userName: 'Mike Johnson',
        timestamp: new Date('2025-01-14T14:00:00'),
        notes: 'QA review completed and approved',
        qualityRating: 5
      },
      {
        id: '5',
        step: 'ready',
        userId: '3',
        userName: 'Mike Johnson',
        timestamp: new Date('2025-01-14T15:00:00'),
        notes: 'Ready for delivery to customer',
        qualityRating: 5
      }
    ]
  },
  {
    id: '5',
    orderNumber: 'ORD-2025-005',
    customerName: 'Green Valley Homes',
    businessGroup: 'Ridgetop',
    status: 'delivered',
    processStatus: 'delivered',
    orderDate: new Date('2025-01-11T10:20:00'),
    deliveryDate: new Date('2025-01-17T14:00:00'),
    items: [
      { id: '9', name: 'ESX Report', quantity: 1, description: 'Eco-friendly home inspection' },
      { id: '10', name: 'Environmental Assessment', quantity: 1, description: 'Sustainability compliance check' }
    ],
    notes: 'Delivered to customer',
    address: '654 Cedar Lane, Green Valley, City 12345',
    propertyType: 'Residential',
    service: 'ESX Report',
    rushOrder: false,
    pdfRequired: true,
    additionalInstructions: 'Focus on environmental compliance',
    insuredName: 'Green Insurance Co',
    claimNumber: 'CLM-2025-005',
    assignedTo: 'David Brown',
    sketchPersonId: '2',
    qaPersonId: '3',
    managerApproval: true,
    workflowHistory: [
      {
        id: '1',
        step: 'new',
        userId: '1',
        userName: 'John Doe',
        timestamp: new Date('2025-01-11T10:20:00'),
        notes: 'Order created'
      },
      {
        id: '2',
        step: 'assigned',
        userId: '1',
        userName: 'John Doe',
        timestamp: new Date('2025-01-11T11:00:00'),
        notes: 'Assigned to Jane Smith'
      },
      {
        id: '3',
        step: 'sketch',
        userId: '2',
        userName: 'Jane Smith',
        timestamp: new Date('2025-01-12T09:00:00'),
        notes: 'Sketch work completed',
        qualityRating: 4
      },
      {
        id: '4',
        step: 'qa',
        userId: '3',
        userName: 'Mike Johnson',
        timestamp: new Date('2025-01-13T10:00:00'),
        notes: 'QA review completed and approved',
        qualityRating: 3
      },
      {
        id: '5',
        step: 'ready',
        userId: '3',
        userName: 'Mike Johnson',
        timestamp: new Date('2025-01-13T11:00:00'),
        notes: 'Ready for delivery',
        qualityRating: 4
      },
      {
        id: '6',
        step: 'delivered',
        userId: '5',
        userName: 'David Brown',
        timestamp: new Date('2025-01-13T15:00:00'),
        notes: 'Order delivered to customer',
        qualityRating: 4
      }
    ]
  },
  {
    id: '6',
    orderNumber: 'ORD-2025-006',
    customerName: 'Tech Startup Office',
    businessGroup: 'Skyline',
    status: 'rollback',
    processStatus: 'rollback',
    orderDate: new Date('2025-01-10T08:30:00'),
    deliveryDate: new Date('2025-01-16T10:00:00'),
    items: [
      { id: '11', name: 'Wall Report', quantity: 1, description: 'Office space wall inspection' }
    ],
    notes: 'Rolled back due to incomplete documentation',
    address: '987 Innovation Blvd, Tech District, City 12345',
    propertyType: 'Commercial',
    service: 'Wall Report',
    rushOrder: false,
    pdfRequired: true,
    additionalInstructions: 'Requires additional documentation',
    insuredName: 'Tech Insurance Solutions',
    claimNumber: 'CLM-2025-006',
    assignedTo: 'Rollback',
    sketchPersonId: '2',
    qaPersonId: '3',
    workflowHistory: [
      {
        id: '1',
        step: 'new',
        userId: '1',
        userName: 'John Doe',
        timestamp: new Date('2025-01-10T08:30:00'),
        notes: 'Order created'
      },
      {
        id: '2',
        step: 'rollback',
        userId: '3',
        userName: 'Mike Johnson',
        timestamp: new Date('2025-01-12T14:30:00'),
        notes: 'Rolled back due to incomplete documentation - requires additional information'
      }
    ]
  },
  {
    id: '7',
    orderNumber: 'ORD-2025-007',
    customerName: 'Cancelled Project LLC',
    businessGroup: 'Ridgetop',
    status: 'cancelled',
    processStatus: 'cancelled',
    orderDate: new Date('2025-01-09T12:00:00'),
    deliveryDate: new Date('2025-01-14T16:00:00'),
    items: [
      { id: '12', name: 'ESX Report', quantity: 1, description: 'Cancelled residential inspection' }
    ],
    notes: 'Order cancelled by customer request',
    address: '555 Cancelled St, Residential Area, City 12345',
    propertyType: 'Residential',
    service: 'ESX Report',
    rushOrder: false,
    pdfRequired: false,
    additionalInstructions: 'Customer cancelled project',
    insuredName: 'Cancelled Insurance',
    claimNumber: 'CLM-2025-007',
    assignedTo: 'Cancelled',
    workflowHistory: [
      {
        id: '1',
        step: 'new',
        userId: '1',
        userName: 'John Doe',
        timestamp: new Date('2025-01-09T12:00:00'),
        notes: 'Order created'
      },
      {
        id: '2',
        step: 'cancelled',
        userId: '1',
        userName: 'John Doe',
        timestamp: new Date('2025-01-10T10:00:00'),
        notes: 'Order cancelled by customer request'
      }
    ]
  },
  {
    id: '8',
    orderNumber: 'ORD-2025-008',
    customerName: 'Urban Homes Ltd.',
    businessGroup: 'Ridgetop',
    status: 'delivered',
    processStatus: 'delivered',
    orderDate: new Date('2025-01-08T09:00:00'),
    deliveryDate: new Date('2025-01-14T12:00:00'),
    items: [
      { id: '13', name: 'ESX Report', quantity: 1, description: 'Urban residential inspection' },
      { id: '14', name: 'Structural Report', quantity: 1, description: 'Structural integrity assessment' }
    ],
    notes: 'Delivered to customer',
    address: '101 Maple Drive, Urban Area, City 12345',
    propertyType: 'Residential',
    service: 'ESX Report',
    rushOrder: false,
    pdfRequired: true,
    additionalInstructions: 'Standard urban residential inspection',
    insuredName: 'Urban Insurance Co',
    claimNumber: 'CLM-2025-008',
    assignedTo: 'David Brown',
    sketchPersonId: '2',
    qaPersonId: '3',
    managerApproval: true,
    workflowHistory: [
      {
        id: '1',
        step: 'new',
        userId: '1',
        userName: 'John Doe',
        timestamp: new Date('2025-01-08T09:00:00'),
        notes: 'Order created'
      },
      {
        id: '2',
        step: 'assigned',
        userId: '1',
        userName: 'John Doe',
        timestamp: new Date('2025-01-08T10:00:00'),
        notes: 'Assigned to Jane Smith'
      },
      {
        id: '3',
        step: 'sketch',
        userId: '2',
        userName: 'Jane Smith',
        timestamp: new Date('2025-01-09T09:00:00'),
        notes: 'Sketch work completed',
        qualityRating: 4
      },
      {
        id: '4',
        step: 'qa',
        userId: '3',
        userName: 'Mike Johnson',
        timestamp: new Date('2025-01-10T10:00:00'),
        notes: 'QA review completed and approved',
        qualityRating: 4
      },
      {
        id: '5',
        step: 'ready',
        userId: '3',
        userName: 'Mike Johnson',
        timestamp: new Date('2025-01-10T11:00:00'),
        notes: 'Ready for delivery',
        qualityRating: 4
      },
      {
        id: '6',
        step: 'delivered',
        userId: '5',
        userName: 'David Brown',
        timestamp: new Date('2025-01-11T15:00:00'),
        notes: 'Order delivered to customer',
        qualityRating: 4
      }
    ]
  }
];

export const getOrderStats = (): OrderStats[] => {
  const stats: { [key: string]: OrderStats } = {};

  mockOrders.forEach(order => {
    if (!stats[order.businessGroup]) {
      stats[order.businessGroup] = {
        businessGroup: order.businessGroup,
        newOrders: 0,
        sketch: 0,
        qa: 0,
        ready: 0,
        rollback: 0,
        cancelled: 0,
        delivered: 0
      };
    }

    switch (order.processStatus) {
      case 'new':
        stats[order.businessGroup].newOrders++;
        break;
      case 'sketch':
        stats[order.businessGroup].sketch++;
        break;
      case 'qa':
        stats[order.businessGroup].qa++;
        break;
      case 'ready':
        stats[order.businessGroup].ready++;
        break;
      case 'rollback':
        stats[order.businessGroup].rollback++;
        break;
      case 'cancelled':
        stats[order.businessGroup].cancelled++;
        break;
      case 'delivered':
        stats[order.businessGroup].delivered++;
        break;
    }
  });

  return Object.values(stats);
};

// Helper functions for role-based access
export const getUsersByRole = (role: string): User[] => {
  return mockUsers.filter(user => user.roles.includes(role));
};

export const getSketchUsers = (): User[] => {
  return getUsersByRole('Sketch');
};

export const getQAUsers = (): User[] => {
  return getUsersByRole('QA');
};

export const getManagerUsers = (): User[] => {
  return getUsersByRole('Manager');
};

export const canUserViewOrder = (userId: string, order: Order): boolean => {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return false;

  // Admins can see everything
  if (user.roles.includes('Admin')) return true;

  // Managers can see all orders
  if (user.roles.includes('Manager')) return true;

  // Sketch users can only see orders assigned to them
  if (user.roles.includes('Sketch')) {
    return order.sketchPersonId === userId || order.assignedTo === `${user.firstName} ${user.lastName}`;
  }

  // QA users can only see orders in QA stage or assigned to them
  if (user.roles.includes('QA')) {
    return order.processStatus === 'qa' || order.qaPersonId === userId;
  }

  return false;
};

export const canUserAssignOrders = (userId: string): boolean => {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return false;

  return user.roles.includes('Admin') || user.roles.includes('Manager');
};

export const canUserProcessOrder = (userId: string, order: Order): boolean => {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return false;

  // Admins can process any order
  if (user.roles.includes('Admin')) return true;

  // Managers can process any order
  if (user.roles.includes('Manager')) return true;

  // Sketch users can only process orders assigned to them
  if (user.roles.includes('Sketch')) {
    return order.sketchPersonId === userId;
  }

  // QA users can only process orders in QA stage
  if (user.roles.includes('QA')) {
    return order.processStatus === 'qa';
  }

  return false;
};

export const mockReportsData: ReportData[] = [
  {
    id: '1',
    orderNumber: 'ORD-2025-001',
    itemNumber: '1',
    deliverTimestamp: new Date('2025-01-14T15:30:00'),
    sketchPersonName: 'Jane Smith',
    qaPersonName: 'Mike Johnson',
    sketchPersonQuality: 4,
    qaPersonQuality: 5,
    businessGroup: 'Ridgetop',
    status: 'delivered',
    customerName: 'ABC Construction Co.',
    propertyType: 'Residential',
    service: 'ESX Report'
  },
  {
    id: '2',
    orderNumber: 'ORD-2025-002',
    itemNumber: '1',
    deliverTimestamp: new Date('2025-01-13T10:15:00'),
    sketchPersonName: 'Jane Smith',
    qaPersonName: 'Mike Johnson',
    sketchPersonQuality: 5,
    qaPersonQuality: 4,
    businessGroup: 'Skyline',
    status: 'delivered',
    customerName: 'Metro Building Solutions',
    propertyType: 'Commercial',
    service: 'Wall Report'
  },
  {
    id: '3',
    orderNumber: 'ORD-2025-003',
    itemNumber: '1',
    deliverTimestamp: new Date('2025-01-12T14:45:00'),
    sketchPersonName: 'Jane Smith',
    qaPersonName: 'Mike Johnson',
    sketchPersonQuality: 3,
    qaPersonQuality: 4,
    businessGroup: 'Ridgetop',
    status: 'delivered',
    customerName: 'Residential Builders Inc.',
    propertyType: 'Residential',
    service: 'ESX Report'
  },
  {
    id: '4',
    orderNumber: 'ORD-2025-004',
    itemNumber: '1',
    deliverTimestamp: new Date('2025-01-11T16:20:00'),
    sketchPersonName: 'Jane Smith',
    qaPersonName: 'Mike Johnson',
    sketchPersonQuality: 5,
    qaPersonQuality: 5,
    businessGroup: 'Skyline',
    status: 'delivered',
    customerName: 'Downtown Development LLC',
    propertyType: 'Commercial',
    service: 'DAD Report'
  },
  {
    id: '5',
    orderNumber: 'ORD-2025-005',
    itemNumber: '1',
    deliverTimestamp: new Date('2025-01-10T11:30:00'),
    sketchPersonName: 'Jane Smith',
    qaPersonName: 'Mike Johnson',
    sketchPersonQuality: 4,
    qaPersonQuality: 3,
    businessGroup: 'Ridgetop',
    status: 'delivered',
    customerName: 'Green Valley Homes',
    propertyType: 'Residential',
    service: 'ESX Report'
  },
  {
    id: '6',
    orderNumber: 'ORD-2025-006',
    itemNumber: '1',
    deliverTimestamp: null,
    sketchPersonName: 'Jane Smith',
    qaPersonName: 'Mike Johnson',
    sketchPersonQuality: 2,
    qaPersonQuality: 2,
    businessGroup: 'Skyline',
    status: 'in-progress',
    customerName: 'Tech Startup Office',
    propertyType: 'Commercial',
    service: 'Wall Report'
  },
  {
    id: '7',
    orderNumber: 'ORD-2025-008',
    itemNumber: '1',
    deliverTimestamp: new Date('2025-01-09T13:15:00'),
    sketchPersonName: 'Jane Smith',
    qaPersonName: 'Mike Johnson',
    sketchPersonQuality: 4,
    qaPersonQuality: 4,
    businessGroup: 'Ridgetop',
    status: 'delivered',
    customerName: 'Urban Homes Ltd.',
    propertyType: 'Residential',
    service: 'ESX Report'
  },
  {
    id: '8',
    orderNumber: 'ORD-2025-009',
    itemNumber: '1',
    deliverTimestamp: new Date('2025-01-08T09:45:00'),
    sketchPersonName: 'Sarah Wilson',
    qaPersonName: 'David Brown',
    sketchPersonQuality: 5,
    qaPersonQuality: 5,
    businessGroup: 'Skyline',
    status: 'delivered',
    customerName: 'Corporate Plaza LLC',
    propertyType: 'Commercial',
    service: 'DAD Report'
  },
  {
    id: '9',
    orderNumber: 'ORD-2025-010',
    itemNumber: '1',
    deliverTimestamp: new Date('2025-01-07T12:00:00'),
    sketchPersonName: 'Sarah Wilson',
    qaPersonName: 'David Brown',
    sketchPersonQuality: 3,
    qaPersonQuality: 4,
    businessGroup: 'Ridgetop',
    status: 'delivered',
    customerName: 'Family Homes Inc.',
    propertyType: 'Residential',
    service: 'ESX Report'
  },
  {
    id: '10',
    orderNumber: 'ORD-2025-011',
    itemNumber: '1',
    deliverTimestamp: null,
    sketchPersonName: 'Sarah Wilson',
    qaPersonName: 'David Brown',
    sketchPersonQuality: 4,
    qaPersonQuality: 0,
    businessGroup: 'Ridgetop',
    status: 'completed',
    customerName: 'Suburban Development',
    propertyType: 'Residential',
    service: 'Wall Report'
  }
];