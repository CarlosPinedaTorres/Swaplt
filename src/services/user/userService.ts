
import api from "../api";
import { UserData, UserDataLogin } from '../../types/User';

export const registerUser=async(userData:UserData)=>{
    try{
        const {data}=await api.post("/auth/register",userData)
        return data;
    }catch(error){
        console.log(error);
        throw error;
    }
}

export const loginUser=async(userDataLogin:UserDataLogin)=>{
    try{
        const {data}=await api.post("/auth/login",userDataLogin)
        return data;
    }catch(error){
        console.log(error);
        throw error;
    }
}

export const logoutUser=async(refreshToken:string)=>{
    try{
      console.log("funcion",refreshToken)
        const {data}=await api.post("/auth/logout",{refreshToken:refreshToken.trim()});
        return data;

    }catch(error){
        console.log(error);
        throw error;
    }
}

export const logoutAllDevices = async (userId: number) => {
  try {
    const { data } = await api.post("/auth/logoutAll", { userId });
    return data; 
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const refreshUserToken=async(refreshToken:string)=>{
    const{data}=await api.post("/auth/refresh",{refreshToken});
    return data;
}


//Obtener info del usuario

export const getUserProfile = async (userId: string) => {
  try {
    const { data } = await api.get(`/users/${userId}`);
    return data;
  } catch (err: any) {
    console.error("Error al obtener perfil:", err.response?.data || err.message);
    throw err; 
  }
};
