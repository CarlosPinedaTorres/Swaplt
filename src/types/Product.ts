export interface ProductImage {
  id?: number; 
  url: string;
}

export interface UpdateProductData {
  nombre: string;
  descripcion: string;
  precio?: number;
  categoriaId: number;
  tipoId: number;
  estadoId: number;
  userId: number;
  ubicacion?: string;
  fotos?: ProductImage[];
  disponibilidad?: boolean;
}


export interface ProductData {
  nombre: string;
  descripcion: string;
  precio?: number;
  categoriaId: number;
  tipoId: number;
  estadoId: number;
  userId: number;
  ubicacion?: string;
  fotos?: string[];
}

export interface OperationPaymentIntentData {
  clientSecret: string;
  operationId: number;
  productId: number;
  productName: string;
  productPrice: number;
  requesterId: number;
  receiverId: number;
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
  fotos?: { url: string }[];


}
export interface Operation {
  id: number;
  type: 'SALE' | 'EXCHANGE';
  status:
  | 'PENDING'
  | 'ACCEPTED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  requesterId: number;
  receiverId: number;
  requester?: { nombre: string };
  receiver?: { nombre: string };
  mainProduct?: { nombre: string };
  moneyOffered?: number;
  offeredProducts?: { product: { nombre: string } }[];
}
