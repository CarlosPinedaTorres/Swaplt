import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";

interface User{
    id:string;
    nombre:string;
    email:string;
}

interface Perfil{
  id:string;
  nombre:string;
  apellidos:string;
  email:string;
  edad:string;
  ciudad:string;
  fotoPerfil:string|null;


}

interface AuthState{
    user:User|null;
    token:string|null;
    refreshToken:string|null;
    perfil:Perfil|null,
    isLoggedIn:boolean;
    login:(data:{user:User;token:string,refreshToken:string})=>void;
    logout:()=>void;
    setToken: (token: string) => void;         
    setRefreshToken: (refreshToken: string) => void; 
    setPerfil:(perfil:Perfil|null)=>void;
      setHydrated: () => void; 
}

export const useAuthStore = create<AuthState & { hydrated: boolean }>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      perfil:null,
      isLoggedIn: false,
      hydrated: false, 

      login: (data) =>
        set({
          user: data.user,
          token: data.token,
          refreshToken: data.refreshToken,
          isLoggedIn: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          perfil:null,
          isLoggedIn: false,
        }),

      setToken: (token: string) => set({ token }),
      setRefreshToken: (refreshToken: string) => set({ refreshToken }),
      setPerfil:(perfil)=>set({perfil}),
      setHydrated: () => set({ hydrated: true }), 
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error("Error rehidratando store:", error);
        else if (state) state.setHydrated?.();
      },
    }
  )
);


