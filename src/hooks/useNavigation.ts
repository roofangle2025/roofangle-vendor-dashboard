import { useState } from 'react';
import { NavigationState } from '../types';

export const useNavigation = () => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentPage: 'services',
    showAccessSidebar: false,
    showMenuSidebar: false,
    showOrderSidebar: false,
    showReportsSidebar: false,
    showFinancialSidebar: false,
    showRuntimeSidebar: true,
    showVendorPlatformSidebar: false
  });

  const navigateToPage = (page: NavigationState['currentPage'], groupId?: string, orderId?: string) => {
    const isOrderPage = ['order-dashboard', 'place-order', 'order-process', 'orders-delivery', 'order-details'].includes(page);
    const isAccessPage = ['users', 'business-groups', 'group-details', 'ra-role', 'ra-audit-logs'].includes(page);
    const isReportsPage = ['reports-management', 'quality-analytics', 'vendor-report'].includes(page);
    const isFinancialPage = ['payments', 'vendor-payments'].includes(page);
    const isRuntimePage = ['services', 'properties'].includes(page);
    
    setNavigationState(prev => ({
      ...prev,
      currentPage: page,
      selectedGroupId: groupId,
      selectedOrderId: orderId,
      showAccessSidebar: isAccessPage,
      showOrderSidebar: isOrderPage,
      showMenuSidebar: false,
      showReportsSidebar: isReportsPage,
      showFinancialSidebar: isFinancialPage,
      showRuntimeSidebar: isRuntimePage,
      showVendorPlatformSidebar: false
    }));
  };

  const toggleMenuSidebar = () => {
    setNavigationState(prev => ({
      ...prev,
      showMenuSidebar: !prev.showMenuSidebar
    }));
  };

  const closeMenuSidebar = () => {
    setNavigationState(prev => ({
      ...prev,
      showMenuSidebar: false
    }));
  };

  return {
    navigationState,
    navigateToPage,
    toggleMenuSidebar,
    closeMenuSidebar
  };
};