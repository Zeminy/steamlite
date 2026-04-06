export type Role = "CUSTOMER" | "DEVELOPER" | "ADMIN";

export type User = {
  id: number;
  username: string;
  email: string;
  role: Role;
  isBanned?: boolean;
  createdAt?: string;
};

export type Game = {
  id: number;
  title: string;
  description: string;
  price: number;
  genre?: string | null;
  coverImageUrl?: string | null;
  releaseDate: string;
  createdAt?: string;
  updatedAt?: string;
  developerId?: number | null;
  developerUserId?: number | null;
  developerCompany?: string;
  reviewCount?: number;
  averageRating?: number;
};

export type Review = {
  id: number;
  userId: number;
  username?: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
};

export type GameDetail = Game & {
  reviews: Review[];
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

export type LibraryItem = {
  id: number;
  purchasedAt: string;
  game: Game;
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
  isBanned: boolean;
  developerCompany?: string | null;
  createdAt: string;
  orderCount: number;
  reviewCount: number;
};

export type AdminDeveloper = {
  id: number;
  userId: number;
  username: string;
  email: string;
  company: string;
  profile?: string | null;
  role: Role;
  isBanned: boolean;
  gamesCount: number;
};

export type GamePayload = {
  title: string;
  description: string;
  price: number;
  genre?: string;
  coverImageUrl?: string;
  releaseDate: string;
  developerId?: number | "";
};
