import api from "../api";
import { ProductData,ProductDetailsData,UpdateProductData } from "../../types/Product";



export const updateProduct = async (id: number, updatedData: Partial<UpdateProductData>) => {
  try {
    const { data } = await api.patch(`/products/updateProduct/${id}`, updatedData);
    return data;
  } catch (error) {
    console.log("Error actualizando producto:", error);
    throw error;
  }
};
export const deleteProduct = async (id: number) => {
  try {
    const { data } = await api.delete(`/products/deleteProduct/${id}`);
    return data;
  } catch (error) {
    console.log("Error eliminando producto:", error);
    throw error;
  }
};




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

