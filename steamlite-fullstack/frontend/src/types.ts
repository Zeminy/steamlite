export type Role = "CUSTOMER" | "DEVELOPER" | "ADMIN";

export type User = {
  id: number;
  username: string;
  email: string;
  role: Role;
  createdAt?: string;
};

export type Game = {
  id: number;
  title: string;
  description: string;
  price: number;
  releaseDate: string;
  createdAt?: string;
  updatedAt?: string;
  developerId?: number | null;
  developerCompany?: string;
  reviewCount?: number;
  averageRating?: number;
};

export type CartItem = {
  id: number;
  quantity: number;
  lineTotal: number;
  game: Game;
};

export type Cart = {
  id: number;
  userId: number;
  totalItems: number;
  totalAmount: number;
  items: CartItem[];
};

export type WishlistItem = {
  id: number;
  game: Game;
};

export type Wishlist = {
  id: number;
  items: WishlistItem[];
};

export type OrderItem = {
  id: number;
  quantity: number;
  lineTotal: number;
  game: Game;
};

export type Payment = {
  id: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
};

export type Order = {
  id: number;
  userId: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  payment: Payment | null;
  items: OrderItem[];
  user?: {
    username: string;
    email: string;
  };
};

export type AdminOverview = {
  usersCount: number;
  gamesCount: number;
  ordersCount: number;
  revenue: number;
  recentOrders: Order[];
};

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
  orderCount: number;
  reviewCount: number;
};

export type GamePayload = {
  title: string;
  description: string;
  price: number;
  releaseDate: string;
  developerId?: number | "";
};
