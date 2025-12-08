import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";

interface OpcionesState {
  categorias: any[];
  tipos: any[];
  estados: any[];
  opcionesCargadas: boolean;
  setOpciones: (data: { categorias: any[]; tipos: any[]; estados: any[] }) => void;
}

export const useOptionsStore = create<OpcionesState>()(
  persist(
    (set) => ({
      categorias: [],
      tipos: [],
      estados: [],
      opcionesCargadas: false,

      setOpciones: (data) =>
        set({
          categorias: data.categorias,
          tipos: data.tipos,
          estados: data.estados,
          opcionesCargadas: true,
        }),
    }),
    {
      name: "options-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
