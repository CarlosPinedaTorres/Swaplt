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
  descripcion: string;
  precio?: number;
  categoria: { nombre: string }; 
  tipo: { nombre: string };
  estado: { nombre: string };
  userId: number;
  ubicacion?: string;
  disponibilidad: boolean;
}
