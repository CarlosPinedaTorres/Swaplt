import api from "../api";

import { OperationPaymentIntentData } from "../../types/Product";

export interface ConfirmOperationPaymentResponse {
  message: string;
}


export const createDirectPurchaseOperation = async (
  requesterId: number,
  receiverId: number,
  mainProductId: number,
  moneyOffered?: number
) => {
  const response = await api.post("/payments/operation/create", {
    requesterId,
    receiverId,
    mainProductId,
    type: "SALE",      
    isDirectPurchase: true,
    moneyOffered,
  });

  return response.data; 
};


export const createOperationPaymentIntent = async (
  operationId: number
) => {
  const response = await api.post("/payments/operation/create-payment-intent", {
    operationId,
  });

  return response.data as OperationPaymentIntentData;
};

export const confirmOperationPayment = async (
  operationId: number
) => {
  const response = await api.post("/payments/operation/confirm-payment", {
    operationId,
  });

  return response.data as ConfirmOperationPaymentResponse;
};
