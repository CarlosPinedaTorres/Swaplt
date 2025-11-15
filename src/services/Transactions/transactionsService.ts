import api from "../api";


export const getMyTransactions = async () => {
  try {
    const { data } = await api.get("/payments/transactions");
    return data;
  } catch (error) {
    console.log("Error obteniendo transacciones del usuario:", error);
    throw error;
  }
};
