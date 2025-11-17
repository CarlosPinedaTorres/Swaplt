import api from "../api"; 

export const createOfferOperation = async ({
  requesterId,
  mainProductId,
  moneyOffered,
  offeredProductIds = [],
}: {
  requesterId: number;
  mainProductId: number;
  moneyOffered?: number;
  offeredProductIds?: number[];
}) => {
  const response = await api.post("/payments/operation/create-offer", {
    requesterId,
    mainProductId,
    moneyOffered,
    offeredProductIds,
  });

  return response.data;
};

export const getUserOperations = async () => {
  try {
    const response = await api.get("/payments/operation/get-user-operations");
    return response.data;
  } catch (error) {
    console.error("Error obteniendo operaciones del usuario:", error);
    throw error;
  }
};
