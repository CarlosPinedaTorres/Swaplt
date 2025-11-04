import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { refreshUserToken } from "./user/userService";

const api = axios.create({
  baseURL: "http://192.168.18.27:3000",
  timeout: 5000,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { refreshToken, setToken, setRefreshToken, logout } = useAuthStore.getState();

    if (
      error.response?.status === 401 &&
      refreshToken &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        console.log("🚀 API.TS RefreshToken que se envía:", JSON.stringify(refreshToken));

        const data = await refreshUserToken(refreshToken.trim().replace(/[\s\r\n]+/g, ""));
        // console.log("🔁 Respuesta del refresh:", data);

        setToken(data.accessToken);
        setRefreshToken(data.refreshToken);


        originalRequest.headers.set?.("Authorization", `Bearer ${data.accessToken}`);

      
        return api(originalRequest);
      } catch (err) {
        console.error("Error al refrescar token:", err);
        logout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);


export default api;
