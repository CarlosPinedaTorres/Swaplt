
export type UpdateProductData = Partial<Omit<ProductData, "userId">> & {
  disponibilidad?: boolean;
};

export interface ProductData {
  nombre: string;
  descripcion: string;
  precio?: number;
  categoriaId: number;
  tipoId: number;
  estadoId: number;
  userId: number;
  ubicacion?: string;

}


export interface ProductDetailsData {
  id: number;
  nombre: string;
  precio?: number;
  descripcion?: string;
  categoria: { nombre: string };
  tipo: { nombre: string };
  estado: { nombre: string };
  disponibilidad: boolean;
  ubicacion?: string;
  userId: number;
  usuario: {
    id: number;
    nombre: string; 
  };

}
