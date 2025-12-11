import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { refreshUserToken } from "./user/userService";
// http://192.168.18.27:3000
// https://back-production-7b31.up.railway.app
const api = axios.create({
  baseURL: "https://back-production-7b31.up.railway.app",
  timeout: 10000,
});
// Queueing concurrent 401 requests during token refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    const { refreshToken, setToken, setRefreshToken, logout } = useAuthStore.getState();

    if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
      if (isRefreshing) {
        
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const data = await refreshUserToken(refreshToken.trim());
        setToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

        onRefreshed(data.accessToken); 
        return api(originalRequest);
      } catch (err) {
        logout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export default api;