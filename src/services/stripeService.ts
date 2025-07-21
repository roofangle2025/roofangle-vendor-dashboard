import Stripe from 'stripe';

// Initialize Stripe with your secret key from environment variables
const getStripeInstance = () => {
  const stripeKey = import.meta.env.VITE_STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey === 'sk_test_your_stripe_secret_key_here') {
    throw new Error('Stripe secret key not configured');
  }
  
  return new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
  });
};

export interface StripeTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'canceled' | 'requires_action';
  created: number;
  description: string | null;
  customer: string | null;
  payment_method: string | null;
  receipt_email: string | null;
  metadata: { [key: string]: string };
}

export interface StripeCustomer {
  id: string;
  name: string | null;
  email: string | null;
  created: number;
}

export interface StripePaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'us_bank_account' | string;
  card?: {
    brand: string;
    last4: string;
  };
}

// Fetch payment intents (transactions) from Stripe
export const fetchStripeTransactions = async (limit: number = 100): Promise<StripeTransaction[]> => {
  try {
    const stripe = getStripeInstance();
    const paymentIntents = await stripe.paymentIntents.list({
      limit,
      expand: ['data.customer', 'data.payment_method'],
    });

    return paymentIntents.data.map(intent => ({
      id: intent.id,
      amount: intent.amount / 100, // Convert from cents to dollars
      currency: intent.currency.toUpperCase(),
      status: intent.status,
      created: intent.created,
      description: intent.description,
      customer: typeof intent.customer === 'string' ? intent.customer : intent.customer?.id || null,
      payment_method: typeof intent.payment_method === 'string' ? intent.payment_method : intent.payment_method?.id || null,
      receipt_email: intent.receipt_email,
      metadata: intent.metadata,
    }));
  } catch (error) {
    console.error('Error fetching Stripe transactions:', error);
    throw new Error('Failed to fetch transactions from Stripe');
  }
};

// Fetch customer details from Stripe
export const fetchStripeCustomer = async (customerId: string): Promise<StripeCustomer | null> => {
  try {
    const stripe = getStripeInstance();
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer.deleted) {
      return null;
    }

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      created: customer.created,
    };
  } catch (error) {
    console.error('Error fetching Stripe customer:', error);
    return null;
  }
};

// Fetch payment method details from Stripe
export const fetchStripePaymentMethod = async (paymentMethodId: string): Promise<StripePaymentMethod | null> => {
  try {
    const stripe = getStripeInstance();
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    return {
      id: paymentMethod.id,
      type: paymentMethod.type,
      card: paymentMethod.card ? {
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
      } : undefined,
    };
  } catch (error) {
    console.error('Error fetching Stripe payment method:', error);
    return null;
  }
};

// Fetch charges (for additional transaction details)
export const fetchStripeCharges = async (limit: number = 100) => {
  try {
    const stripe = getStripeInstance();
    const charges = await stripe.charges.list({
      limit,
      expand: ['data.customer', 'data.payment_method'],
    });

    return charges.data.map(charge => ({
      id: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency.toUpperCase(),
      status: charge.status,
      created: charge.created,
      description: charge.description,
      customer: typeof charge.customer === 'string' ? charge.customer : charge.customer?.id || null,
      payment_method: charge.payment_method,
      receipt_email: charge.receipt_email,
      metadata: charge.metadata,
      outcome: charge.outcome,
    }));
  } catch (error) {
    console.error('Error fetching Stripe charges:', error);
    throw new Error('Failed to fetch charges from Stripe');
  }
};

// Convert Stripe status to our internal status
export const mapStripeStatus = (stripeStatus: string): 'completed' | 'pending' | 'failed' | 'refunded' => {
  switch (stripeStatus) {
    case 'succeeded':
      return 'completed';
    case 'pending':
    case 'requires_action':
    case 'requires_confirmation':
    case 'requires_payment_method':
      return 'pending';
    case 'canceled':
    case 'failed':
      return 'failed';
    default:
      return 'pending';
  }
};

// Convert Stripe payment method type to our internal type
export const mapStripePaymentMethod = (type: string): 'credit_card' | 'bank_transfer' | 'check' | 'paypal' => {
  switch (type) {
    case 'card':
      return 'credit_card';
    case 'us_bank_account':
    case 'bank_account':
      return 'bank_transfer';
    case 'paypal':
      return 'paypal';
    default:
      return 'credit_card';
  }
};