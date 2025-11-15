import api from "../api";

export interface PaymentIntentData {
  clientSecret: string;
  transactionId: number;
}

export interface ConfirmPaymentResponse {
  message: string;
}


export const createPaymentIntent = async (
  amount: number,
  currency: string,
  buyerId: number,
  sellerId: number,
  productId: number,
  metadata?: { [key: string]: any } 
) => {
  const response = await api.post("/payments/create-intent", {
    amount,
    currency,
    buyerId,
    sellerId,
    productId,
    metadata, 
  });

  return response.data;
};

export const confirmPayment = async (transactionId: number) => {
  const response = await api.post("/payments/confirm", {
    transactionId,
  });

  return response.data;
};