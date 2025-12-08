import api from "../api"; 


export const acceptOperation = async (operationId: number) => {
  const response = await api.post("/payments/operation/accept-operation", { operationId });
  return response.data;
};
export const rejectOperation = async (operationId: number) => {
  const response = await api.post("/payments/operation/reject-operation", { operationId });
  return response.data;
};


export const getOperationById = async (operationId: number) => {
  try {
    const response = await api.get(`/payments/operation/${operationId}`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo operacion", error);
    throw error;
  }
};



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

export const deleteOfferOperation = async (operationId: number) => {
  try {
    const response = await api.delete(`/payments/operation/${operationId}/delete`);
    return response.data;
  } catch (error) {
    console.error("Error eliminando operación:", error);
    throw error;
  }
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
