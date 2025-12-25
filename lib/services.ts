
import { supabase } from './supabase';
import { Category, Product, SiteSettings } from './data';

// --- CATEGORIES ---

export async function getCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    // Convert DB fields format to App Interface format if needed
    // DB: name_en, discount_rate
    // App: nameEn, discountRate
    return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        nameEn: item.name_en,
        slug: item.slug,
        image: item.image,
        description: item.description,
        badge: item.badge,
        discountRate: item.discount_rate,
        parentId: item.parent_id,
        order: item.sort_order,
        isActive: item.is_active
    })) as Category[];
}

export async function createCategory(category: Partial<Category>) {
    const dbData = {
        name: category.name,
        name_en: category.nameEn,
        slug: category.slug,
        image: category.image,
        description: category.description,
        badge: category.badge,
        discount_rate: category.discountRate,
        sort_order: category.order || 0
    };

    const { data, error } = await supabase.from('categories').insert([dbData]).select().single();
    if (error) throw error;
    return data;
}

export async function updateCategory(id: string, updates: Partial<Category>) {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.nameEn !== undefined) dbUpdates.name_en = updates.nameEn;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.badge !== undefined) dbUpdates.badge = updates.badge;
    if (updates.discountRate !== undefined) dbUpdates.discount_rate = updates.discountRate;

    const { error } = await supabase.from('categories').update(dbUpdates).eq('id', id);
    if (error) throw error;
}

export async function deleteCategory(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
}

// --- PRODUCTS ---

export async function getProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        nameEn: item.name_en,
        description: item.description,
        descriptionEn: item.description_en,
        price: item.price,
        discountPrice: item.discount_price,
        image: item.image,
        categoryId: item.category_id,
        badge: item.badge,
        tags: item.tags || [],
        isActive: item.is_active
    })) as Product[];
}

export async function createProduct(product: Partial<Product>) {
    const dbData = {
        name: product.name,
        name_en: product.nameEn,
        description: product.description,
        description_en: product.descriptionEn,
        price: product.price,
        discount_price: product.discountPrice,
        image: product.image,
        category_id: product.categoryId,
        badge: product.badge,
        tags: product.tags,
        is_active: product.isActive
    };

    const { data, error } = await supabase.from('products').insert([dbData]).select().single();
    if (error) throw error;
    return data;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
    const dbUpdates: any = {};
    // Map fields
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.nameEn !== undefined) dbUpdates.name_en = updates.nameEn;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.descriptionEn !== undefined) dbUpdates.description_en = updates.descriptionEn;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.discountPrice !== undefined) dbUpdates.discount_price = updates.discountPrice;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
    if (updates.badge !== undefined) dbUpdates.badge = updates.badge;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
    if (error) throw error;
}

export async function deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
}


// --- SETTINGS ---

export async function getSettings() {
    const { data, error } = await supabase.from('settings').select('*').single();
    if (error) return null;

    return {
        themeColor: data.theme_color,
        darkMode: data.dark_mode,
        bannerActive: data.banner_active,
        bannerUrls: data.banner_urls,
        popupActive: data.popup_active,
        popupUrl: data.popup_url,
        logoUrl: data.logo_url,
        logoWidth: data.logo_width
    } as SiteSettings;
}

export async function updateSettings(settings: Partial<SiteSettings>) {
    const dbUpdates: any = {};
    if (settings.themeColor !== undefined) dbUpdates.theme_color = settings.themeColor;
    if (settings.darkMode !== undefined) dbUpdates.dark_mode = settings.darkMode;
    if (settings.bannerActive !== undefined) dbUpdates.banner_active = settings.bannerActive;
    if (settings.bannerUrls !== undefined) dbUpdates.banner_urls = settings.bannerUrls;
    if (settings.popupActive !== undefined) dbUpdates.popup_active = settings.popupActive;
    if (settings.popupUrl !== undefined) dbUpdates.popup_url = settings.popupUrl;
    if (settings.logoUrl !== undefined) dbUpdates.logo_url = settings.logoUrl;
    if (settings.logoWidth !== undefined) dbUpdates.logo_width = settings.logoWidth;

    const { error } = await supabase.from('settings').update(dbUpdates).eq('id', 1);
    if (error) throw error;
}

// --- STORAGE ---

export async function uploadImage(file: File, bucketName: string = 'qrmenu1-images') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return data.publicUrl;
}
