import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AccessSidebar } from './components/AccessSidebar';
import { OrderSidebar } from './components/OrderSidebar';
import { ReportsSidebar } from './components/ReportsSidebar';
import { UsersPage } from './components/UsersPage';
import { BusinessGroupsPage } from './components/BusinessGroupsPage';
import { GroupDetailsPage } from './components/GroupDetailsPage';
import { RARolePage } from './components/RARolePage';
import { RAAuditLogsPage } from './components/RAAuditLogsPage';
import { OrderDashboardPage } from './components/OrderDashboardPage';
import { PlaceOrderPage } from './components/PlaceOrderPage';
import { OrderProcessPage } from './components/OrderProcessPage';
import { OrdersDeliveryPage } from './components/OrdersDeliveryPage';
import { OrderDetailsPage } from './components/OrderDetailsPage';
import { CreateGroupModal } from './components/CreateGroupModal';
import { ReportsManagementPage } from './components/ReportsManagementPage';
import { QualityAnalyticsPage } from './components/QualityAnalyticsPage';
import { VendorReportPage } from './components/VendorReportPage';
import { PaymentsPage } from './components/PaymentsPage';
import { useNavigation } from './hooks/useNavigation';

function App() {
  const { navigationState, navigateToPage, toggleMenuSidebar, closeMenuSidebar } = useNavigation();
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  const handleCreateGroup = (name: string, description: string) => {
    // In a real app, this would make an API call
    console.log('Creating group:', { name, description });
  };

  const renderCurrentPage = () => {
    switch (navigationState.currentPage) {
      case 'users':
        return <UsersPage />;
      case 'business-groups':
        return (
          <BusinessGroupsPage 
            onCreateGroup={() => setShowCreateGroupModal(true)}
            onSelectGroup={(groupId) => navigateToPage('group-details', groupId)}
          />
        );
      case 'group-details':
        return (
          <GroupDetailsPage 
            groupId={navigationState.selectedGroupId!}
            onBack={() => navigateToPage('business-groups')}
          />
        );
      case 'ra-role':
        return <RARolePage />;
      case 'ra-audit-logs':
        return <RAAuditLogsPage />;
      case 'order-dashboard':
        return <OrderDashboardPage onSelectOrder={(orderId) => navigateToPage('order-details', undefined, orderId)} />;
      case 'place-order':
        return <PlaceOrderPage />;
      case 'order-process':
        return <OrderProcessPage onSelectOrder={(orderId) => navigateToPage('order-details', undefined, orderId)} />;
      case 'orders-delivery':
        return <OrdersDeliveryPage onSelectOrder={(orderId) => navigateToPage('order-details', undefined, orderId)} />;
      case 'order-details':
        return (
          <OrderDetailsPage 
            orderId={navigationState.selectedOrderId!}
            onBack={() => {
              // Go back to the previous order-related page
              if (navigationState.showOrderSidebar) {
                navigateToPage('order-dashboard');
              } else {
                navigateToPage('order-dashboard');
              }
            }}
          />
        );
      case 'reports-management':
        return <ReportsManagementPage />;
      case 'quality-analytics':
        return <QualityAnalyticsPage />;
      case 'vendor-report':
        return <VendorReportPage />;
      case 'transaction-management':
        return <PaymentsPage />;
      default:
        return <OrderDashboardPage onSelectOrder={(orderId) => navigateToPage('order-details', undefined, orderId)} />;
    }
  };

  const getSidebarOffset = () => {
    return navigationState.showMenuSidebar;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onToggleMenu={toggleMenuSidebar} />
      
      <div className="flex pt-20">
        <Sidebar 
          isOpen={navigationState.showMenuSidebar}
          onNavigate={(page) => {
            navigateToPage(page);
            closeMenuSidebar();
          }}
          onClose={closeMenuSidebar}
        />
        
        <AccessSidebar 
          isVisible={navigationState.showAccessSidebar}
          currentPage={navigationState.currentPage}
          onNavigate={navigateToPage}
          sidebarOffset={getSidebarOffset()}
        />
        
        <OrderSidebar 
          isVisible={navigationState.showOrderSidebar}
          currentPage={navigationState.currentPage}
          onNavigate={navigateToPage}
          sidebarOffset={getSidebarOffset()}
        />
        
        <ReportsSidebar 
          isVisible={navigationState.showReportsSidebar}
          currentPage={navigationState.currentPage}
          onNavigate={navigateToPage}
          sidebarOffset={getSidebarOffset()}
        />
        
        <main 
          className={`flex-1 p-3 sm:p-4 lg:p-6 transition-all duration-300 ease-in-out ${
            navigationState.showMenuSidebar ? 'lg:ml-64' : ''
          } ${(navigationState.showAccessSidebar || navigationState.showOrderSidebar || navigationState.showReportsSidebar) ? 'lg:ml-64' : ''}`}
        >
          {renderCurrentPage()}
        </main>
      </div>

      <CreateGroupModal 
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onCreateGroup={handleCreateGroup}
      />
      
      {navigationState.showMenuSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeMenuSidebar}
        />
      )}
    </div>
  );
}

export default App;