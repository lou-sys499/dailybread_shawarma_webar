export interface Dish {
  id: string;
  name: string;
  description?: string;
  price: number;
  calories?: number;
  ingredients?: string[];
  allergens?: string[];
  modelUrl: string;
  imageUrl?: string;
  categoryId?: string;
  isSeasonal?: boolean;
  isAvailable: boolean;
  portionSize?: string;
}

export interface Category {
  id: string;
  name: string;
  order?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
}
