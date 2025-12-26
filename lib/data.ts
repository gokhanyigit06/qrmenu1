
export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  parentId?: string;
  image?: string;
  description?: string;
  discountRate?: number;
  badge?: string;
  order?: number;
  isActive?: boolean;
}

export interface ProductTag {
  id: string;
  name: string;
  icon?: 'pepper' | 'leaf' | 'wheat';
  color?: string;
}

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  discountPrice?: number;
  image: string;
  categoryId: string;
  badge?: string;
  tags?: ProductTag[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface SiteSettings {
  themeColor: 'black' | 'red' | 'blue' | 'green' | 'orange';
  darkMode: boolean;
  bannerActive: boolean;
  bannerUrls: string[];
  popupActive: boolean;
  popupUrl: string;
  logoUrl: string;
  logoWidth: number;
  defaultProductImage?: string;
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

