import api from "../api";



export const getWallet = async () => {
  try {
    const { data } = await api.get("/payments/wallet");
    return data;
  } catch (error) {
    console.log("Error obteniendo wallet:", error);
    throw error;
  }
};