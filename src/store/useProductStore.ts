import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";

interface Categoria {
  id: number;
  nombre: string;
}

interface Tipo {
  id: number;
  nombre: string;
}

interface Estado {
  id: number;
  nombre: string;
}

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number | null;
  categoria: { nombre: string };
  tipo: { nombre: string };
  estado: { nombre: string };
  ubicacion?: string;
  disponibilidad: boolean;
  visibilidad: boolean;
}

interface ProductState extends ProductOptionState {

  productosUsuario: Product[];
  setProductosUsuario: (productos: Product[]) => void;

  productosGlobales: Product[];
  setProductosGlobales: (productos: Product[]) => void;
}

interface ProductOptionState {
  categorias: { id: number; nombre: string }[];
  tipos: { id: number; nombre: string }[];
  estados: { id: number; nombre: string }[];
  setCategorias: (cats: Categoria[]) => void;
  setTipos: (tipos: Tipo[]) => void;
  setEstados: (estados: Estado[]) => void;
}
export const useProductStore = create<ProductState>()((set) => ({
  categorias: [],
  tipos: [],
  estados: [],
  productosUsuario: [],
  productosGlobales: [],

  setCategorias: (cats) => set({ categorias: cats }),
  setTipos: (tipos) => set({ tipos }),
  setEstados: (estados) => set({ estados }),

  setProductosUsuario: (productos) => set({ productosUsuario: productos }),
  setProductosGlobales: (productos) => set({ productosGlobales: productos }),
}));