import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { refreshUserToken } from "./user/userService";

const api = axios.create({
  baseURL: "http://192.168.18.27:3000",
  timeout: 5000,
});

api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token && config.headers) {
  
      config.headers.set?.("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { refreshToken, setToken, logout } = useAuthStore.getState();

    if (
      error.response?.status === 401 &&
      refreshToken &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const data = await refreshUserToken(refreshToken);
        setToken(data.accessToken);
        originalRequest.headers.set?.(
          "Authorization",
          `Bearer ${data.accessToken}`
        );
        return api(originalRequest);
      } catch (err) {
        logout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
