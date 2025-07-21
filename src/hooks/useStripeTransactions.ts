import { useState, useEffect } from 'react';
import { 
  fetchStripeTransactions, 
  fetchStripeCustomer, 
  fetchStripePaymentMethod,
  mapStripeStatus,
  mapStripePaymentMethod,
  StripeTransaction 
} from '../services/stripeService';

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

export const useStripeTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

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
    } catch (err) {
      console.error('Error loading Stripe transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const refreshTransactions = () => {
    loadTransactions();
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return {
    transactions,
    loading,
    error,
    refreshTransactions,
  };
};