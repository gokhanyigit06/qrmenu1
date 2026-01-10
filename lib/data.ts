
export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
  custom_domain?: string | null;
  is_ordering_active?: boolean;
  is_waiter_mode_active?: boolean;
}

export interface Category {
  id: string;
  restaurantId?: string;
  name: string;
  nameEn?: string;
  slug: string;
  parentId?: string;
  image?: string;
  icon?: string;
  iconColor?: string;
  iconSize?: 'small' | 'medium' | 'large';
  description?: string;
  discountRate?: number;
  badge?: string;
  order?: number;
  isActive?: boolean;
  layoutMode?: 'grid' | 'list' | 'list-no-image';
  station_name?: 'Mutfak' | 'Bar' | string;
}

export interface ProductTag {
  id: string;
  name: string;
  icon?: 'pepper' | 'leaf' | 'wheat';
  color?: string;
}

export interface Product {
  id: string;
  restaurantId?: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price?: number;
  discountPrice?: number;
  image: string;
  categoryId: string;
  badge?: string;
  tags?: ProductTag[];
  allergens?: string[];
  isActive?: boolean;
  sortOrder?: number;
  variants?: { name: string; price: number }[];
}

export interface SiteSettings {
  id?: string;
  restaurantId?: string;
  themeColor: 'black' | 'red' | 'blue' | 'green' | 'orange';
  fontFamily?: string;
  darkMode: boolean;
  bannerActive: boolean;
  bannerUrls: string[];
  bannerOverlayVisible?: boolean;
  bannerTag?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  mobileBannerUrls?: string[];
  popupActive: boolean;
  popupUrl: string;
  logoUrl: string;
  logoWidth: number;
  siteName?: string;
  siteDescription?: string;
  defaultProductImage?: string;
  categoryFontSize?: 'medium' | 'large' | 'xl';
  categoryFontWeight?: 'normal' | 'bold' | 'black';
  categoryRowHeight?: 'small' | 'medium' | 'large';
  categoryGap?: 'small' | 'medium' | 'large';
  categoryOverlayOpacity?: number;

  // Product Card Styling
  productTitleColor?: string;
  productDescriptionColor?: string;
  productPriceColor?: string;
  productTitleSize?: 'medium' | 'large' | 'xl';
  productDescriptionSize?: 'small' | 'medium' | 'large';
  productPriceSize?: 'medium' | 'large' | 'xl';

  // Footer & Social
  socialInstagram?: string;
  socialFacebook?: string;
  socialTwitter?: string;
  socialWhatsapp?: string;
  footerText?: string;
  footerCopyright?: string;
}

export const defaultSettings: SiteSettings = {
  themeColor: 'black',
  darkMode: false,
  bannerActive: true,
  bannerUrls: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836'],
  popupActive: false,
  popupUrl: '',
  logoUrl: '',
  logoWidth: 150,
  defaultProductImage: ''
};

export const categories: Category[] = [
  {
    id: '1',
    name: 'Popüler',
    nameEn: 'Popular',
    slug: 'populer',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    description: 'En çok tercih edilen lezzetler',
    order: 0
  },
  // ... keep minimal mock just in case
];

export const products: Product[] = [];


export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  price: number;
  quantity: number;
  options?: any;
  status: 'pending' | 'prepared' | 'served';
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_no: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total_amount: number;
  final_amount?: number;
  is_paid?: boolean;
  customer_note?: string;
  created_at: string;
  items?: OrderItem[];
  payments?: Payment[];
}

export interface Payment {
  id: string;
  order_id: string;
  restaurant_id: string;
  amount: number;
  payment_method: 'cash' | 'credit_card' | 'meal_card' | 'other';
  discount_amount: number;
  created_at: string;
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_no: string;
  qr_code_url?: string;
}
