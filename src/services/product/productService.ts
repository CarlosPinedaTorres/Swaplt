import api from "../api";
import { ProductData } from "../../types/Product";


export const getProductOptions = async () => {
  try {
    const { data } = await api.get("/products/getOptions");
    return data;
  } catch (error) {
    console.log("Error obteniendo opciones:", error);
    throw error;
  }
};

export const createProduct = async (productData:ProductData) => {
  try {
    const { data } = await api.post("/products/create", productData);
    return data;
  } catch (error) {
    console.log("Error creando producto:", error);
    throw error;
  }
};

export const getMyProducts=async()=>{
  try{
    const res=await api.get("/products/user");
    return res.data;

  }catch(err){
        console.log("Error obteniendo productos del usuario:", err);
    throw err;
  }
}
export const getAllProducts=async()=>{
  try{
      const {data}=await api.get("/products/allProducts")
      return data;

  }catch(err){
      console.log("Error obteniendo productos ")
      throw err
    }
}