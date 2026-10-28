export interface ApiPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface Order {
  id: number;
  title: string;
  description: string;
  amount: number;
  stock: number;
  status: 'Pendiente' | 'Completada';
}