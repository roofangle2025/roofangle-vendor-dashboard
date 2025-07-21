import { useState, useEffect } from 'react';

interface RefundRequest {
  transactionId: string;
  amount?: number;
  reason?: string;
}

interface Transaction {
  id: string;
  transactionId: string;
  customerName: string;
  orderNumber: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'bank_transfer' | 'check' | 'paypal';
  transactionDate: Date;
  description: string;
  businessGroup: string;
}

// Mock transactions for fallback when Stripe is not available
const mockTransactions: Transaction[] = [
  {
    id: '1',
    transactionId: 'pi_1234567890',
    customerName: 'ABC Construction Co.',
    orderNumber: 'ORD-2025-001',
    amount: 1250.00,
    status: 'completed',
    paymentMethod: 'credit_card',
    transactionDate: new Date('2025-01-15T10:30:00'),
    description: 'ESX Report - Residential Property Inspection',
    businessGroup: 'Ridgetop'
  },
  {
    id: '2',
    transactionId: 'pi_0987654321',
    customerName: 'Metro Building Solutions',
    orderNumber: 'ORD-2025-002',
    amount: 2100.00,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    transactionDate: new Date('2025-01-14T14:15:00'),
    description: 'Wall Report - Commercial Property Assessment',
    businessGroup: 'Skyline'
  },
  {
    id: '3',
    transactionId: 'pi_1122334455',
    customerName: 'Residential Builders Inc.',
    orderNumber: 'ORD-2025-003',
    amount: 875.50,
    status: 'pending',
    paymentMethod: 'credit_card',
    transactionDate: new Date('2025-01-13T09:45:00'),
    description: 'DAD Report - Damage Assessment Documentation',
    businessGroup: 'Ridgetop'
  },
  {
    id: '4',
    transactionId: 'pi_5566778899',
    customerName: 'Downtown Development LLC',
    orderNumber: 'ORD-2025-004',
    amount: 3200.00,
    status: 'completed',
    paymentMethod: 'check',
    transactionDate: new Date('2025-01-12T16:20:00'),
    description: 'Rush Order - High-rise Building Assessment',
    businessGroup: 'Skyline'
  },
  {
    id: '5',
    transactionId: 'pi_9988776655',
    customerName: 'Green Valley Homes',
    orderNumber: 'ORD-2025-005',
    amount: 1450.75,
    status: 'failed',
    paymentMethod: 'credit_card',
    transactionDate: new Date('2025-01-11T11:30:00'),
    description: 'ESX Report - Eco-friendly Home Inspection',
    businessGroup: 'Ridgetop'
  }
];
export const useStripeTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [refunding, setRefunding] = useState<string | null>(null);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingMockData(false);

      // Check if Stripe is configured
      const stripeKey = import.meta.env.VITE_STRIPE_SECRET_KEY;
      if (!stripeKey || stripeKey === 'sk_test_your_stripe_secret_key_here') {
        console.warn('Stripe not configured, using mock data');
        setTransactions(mockTransactions);
        setUsingMockData(true);
        return;
      }

      try {
        // Try to import and use Stripe service
        const { 
          fetchStripeTransactions, 
          fetchStripeCustomer, 
          fetchStripePaymentMethod,
          mapStripeStatus,
          mapStripePaymentMethod 
        } = await import('../services/stripeService');

        // Fetch transactions from Stripe
        const stripeTransactions = await fetchStripeTransactions(100);

        // Process each transaction to get customer and payment method details
        const processedTransactions = await Promise.all(
          stripeTransactions.map(async (stripeTransaction) => {
            let customerName = 'Unknown Customer';
            let orderNumber = 'N/A';
            let businessGroup = 'Unknown';

            // Get customer details if customer ID exists
            if (stripeTransaction.customer) {
              try {
                const customer = await fetchStripeCustomer(stripeTransaction.customer);
                if (customer) {
                  customerName = customer.name || customer.email || 'Unknown Customer';
                }
              } catch (err) {
                console.warn('Failed to fetch customer details:', err);
              }
            }

            // Extract order number and business group from metadata
            if (stripeTransaction.metadata) {
              orderNumber = stripeTransaction.metadata.order_number || stripeTransaction.metadata.orderNumber || 'N/A';
              businessGroup = stripeTransaction.metadata.business_group || stripeTransaction.metadata.businessGroup || 'Unknown';
            }

            // Get payment method details
            let paymentMethodType = 'credit_card';
            if (stripeTransaction.payment_method) {
              try {
                const paymentMethod = await fetchStripePaymentMethod(stripeTransaction.payment_method);
                if (paymentMethod) {
                  paymentMethodType = mapStripePaymentMethod(paymentMethod.type);
                }
              } catch (err) {
                console.warn('Failed to fetch payment method details:', err);
              }
            }

            return {
              id: stripeTransaction.id,
              transactionId: stripeTransaction.id,
              customerName,
              orderNumber,
              amount: stripeTransaction.amount,
              status: mapStripeStatus(stripeTransaction.status),
              paymentMethod: paymentMethodType,
              transactionDate: new Date(stripeTransaction.created * 1000), // Convert Unix timestamp
              description: stripeTransaction.description || 'Payment processed',
              businessGroup,
            };
          })
        );

        setTransactions(processedTransactions);
      } catch (stripeError) {
        console.warn('Stripe integration failed, falling back to mock data:', stripeError);
        setTransactions(mockTransactions);
        setUsingMockData(true);
      }
    } catch (err) {
      console.error('Error loading Stripe transactions:', err);
      // Fallback to mock data on any error
      setTransactions(mockTransactions);
      setUsingMockData(true);
      setError('Using sample data - Stripe integration not available');
    } finally {
      setLoading(false);
    }
  };

  const refreshTransactions = () => {
    loadTransactions();
  };

  const processRefund = async (refundRequest: RefundRequest): Promise<boolean> => {
    try {
      setRefunding(refundRequest.transactionId);
      setError(null);

      // Check if using mock data
      if (usingMockData) {
        // Simulate refund processing for mock data
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update transaction status to refunded
        setTransactions(prev => prev.map(t => 
          t.transactionId === refundRequest.transactionId 
            ? { ...t, status: 'refunded' as const }
            : t
        ));
        
        return true;
      }

      // Process real refund through Stripe
      const { createStripeRefund } = await import('../services/stripeService');
      
      const refund = await createStripeRefund(
        refundRequest.transactionId,
        refundRequest.amount,
        refundRequest.reason
      );
      
      if (refund) {
        // Update transaction status to refunded
        setTransactions(prev => prev.map(t => 
          t.transactionId === refundRequest.transactionId 
            ? { ...t, status: 'refunded' as const }
            : t
        ));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error processing refund:', error);
      setError(error instanceof Error ? error.message : 'Failed to process refund');
      return false;
    } finally {
      setRefunding(null);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return {
    transactions,
    loading,
    error,
    usingMockData,
    refreshTransactions,
    processRefund,
    refunding,
  };
};