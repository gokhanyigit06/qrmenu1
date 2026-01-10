
import { supabase } from './supabase';
import { Category, Product, SiteSettings, Restaurant, Order, OrderItem } from './data';

// --- RESTAURANT ---

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) return null;
    return data as Restaurant;
}

export async function getRestaurantByDomain(domain: string): Promise<Restaurant | null> {
    const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('custom_domain', domain)
        .single();

    if (error) return null;
    return data as Restaurant;
}

export async function updateRestaurantPassword(restaurantId: string, newPassword: string) {
    const { error } = await supabase
        .from('restaurants')
        .update({ password: newPassword })
        .eq('id', restaurantId);

    if (error) throw error;
}

export async function updateRestaurantDomain(restaurantId: string, domain: string) {
    let cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').toLowerCase();

    if (!cleanDomain) {
        const { error } = await supabase.from('restaurants').update({ custom_domain: null }).eq('id', restaurantId);
        if (error) throw error;
        return;
    }

    const { error } = await supabase.from('restaurants').update({ custom_domain: cleanDomain }).eq('id', restaurantId);
    if (error) throw error;
}

// --- SUPER ADMIN SERVICES ---

export async function getAllRestaurants() {
    const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function createRestaurant(name: string, slug: string, password: string) {
    // 1. Create Restaurant
    const { data: rest, error: restError } = await supabase
        .from('restaurants')
        .insert([{ name, slug, password }])
        .select()
        .single();

    if (restError) throw restError;

    // 2. Create Default Settings
    // Note: We let DB handle 'id' generation.
    const { error: setError } = await supabase
        .from('settings')
        .insert([{
            restaurant_id: rest.id,
            theme_color: 'black',
            dark_mode: false,
            banner_active: true,
            banner_urls: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'],
            popup_active: false,
            logo_width: 150,
            default_product_image: ''
        }]);

    if (setError) {
        console.error("Error creating settings for new restaurant", setError);
    }

    return rest;
}

export async function deleteRestaurant(id: string) {
    // Delete related data first (products, categories, settings)
    // Assuming Cascade is NOT set up, we do it manually to be safe
    await supabase.from('products').delete().eq('restaurant_id', id);
    await supabase.from('categories').delete().eq('restaurant_id', id);
    await supabase.from('settings').delete().eq('restaurant_id', id);

    const { error } = await supabase.from('restaurants').delete().eq('id', id);
    if (error) throw error;
}

// --- CATEGORIES ---

export async function getCategories(restaurantId: string) {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error(`Error fetching categories (id: ${restaurantId}):`, JSON.stringify(error, null, 2));
        return [];
    }

    return data.map((item: any) => ({
        id: item.id,
        restaurantId: item.restaurant_id,
        name: item.name,
        nameEn: item.name_en,
        slug: item.slug,
        image: item.image,
        icon: item.icon,
        description: item.description,
        badge: item.badge,
        discountRate: item.discount_rate,
        parentId: item.parent_id,
        order: item.sort_order,
        isActive: item.is_active,
        layoutMode: item.layout_mode || 'grid'
    })) as Category[];
}

export async function createCategory(category: Partial<Category>) {
    if (!category.restaurantId) throw new Error("Restaurant ID is required");
    const dbData = {
        restaurant_id: category.restaurantId,
        name: category.name,
        name_en: category.nameEn,
        slug: category.slug,
        image: category.image,
        icon: category.icon,
        description: category.description,
        badge: category.badge,
        discount_rate: category.discountRate,
        sort_order: category.order || 0,
        layout_mode: category.layoutMode || 'grid'
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
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.badge !== undefined) dbUpdates.badge = updates.badge;
    if (updates.discountRate !== undefined) dbUpdates.discount_rate = updates.discountRate;
    if (updates.order !== undefined) dbUpdates.sort_order = updates.order;
    if (updates.layoutMode !== undefined) dbUpdates.layout_mode = updates.layoutMode;

    const { error } = await supabase.from('categories').update(dbUpdates).eq('id', id);
    if (error) throw error;
}

export async function deleteCategory(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
}

// --- PRODUCTS ---

export async function getProducts(restaurantId: string) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error(`Error fetching products (id: ${restaurantId}):`, JSON.stringify(error, null, 2));
        return [];
    }

    return data.map((item: any) => ({
        id: item.id,
        restaurantId: item.restaurant_id,
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
        allergens: item.allergens || [],
        variants: item.variants || [],
        isActive: item.is_active
    })) as Product[];
}

export async function createProduct(product: Partial<Product>) {
    if (!product.restaurantId) throw new Error("Restaurant ID is required");
    const dbData = {
        restaurant_id: product.restaurantId,
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
        allergens: product.allergens,
        variants: product.variants,
        is_active: product.isActive,
        sort_order: product.sortOrder || 0
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
    if (updates.allergens !== undefined) dbUpdates.allergens = updates.allergens;
    if (updates.variants !== undefined) dbUpdates.variants = updates.variants;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

    const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
    if (error) throw error;
}

export async function deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
}


// --- SETTINGS ---

// --- SETTINGS ---

export async function getSettings(restaurantId: string) {
    const { data, error } = await supabase.from('settings').select('*').eq('restaurant_id', restaurantId).single();
    if (error) return null;

    return {
        id: data.id,
        restaurantId: data.restaurant_id,
        themeColor: data.theme_color,
        fontFamily: data.font_family || 'Inter',
        darkMode: data.dark_mode,
        bannerActive: data.banner_active,
        bannerUrls: data.banner_urls,
        mobileBannerUrls: data.mobile_banner_urls || [],
        bannerOverlayVisible: data.banner_overlay_visible !== false, // default true
        bannerTag: data.banner_tag || 'FIRSAT',
        bannerTitle: data.banner_title || 'Kampanya',
        bannerSubtitle: data.banner_subtitle || '%20 İndirim',
        popupActive: data.popup_active,
        popupUrl: data.popup_url,
        logoUrl: data.logo_url,
        logoWidth: data.logo_width || 150,
        defaultProductImage: data.default_product_image,
        categoryFontSize: data.category_font_size || 'large',
        categoryFontWeight: data.category_font_weight || 'black',
        categoryRowHeight: data.category_row_height || 'medium',
        categoryGap: data.category_gap || 'medium',
        categoryOverlayOpacity: data.category_overlay_opacity !== null ? data.category_overlay_opacity : 50,
        productTitleColor: data.product_title_color || '#111827',
        productDescriptionColor: data.product_description_color || '#6b7280',
        productPriceColor: data.product_price_color || '#d97706',
        productTitleSize: data.product_title_size || 'large',
        productDescriptionSize: data.product_description_size || 'medium',
        productPriceSize: data.product_price_size || 'large',
    } as SiteSettings;
}

export async function updateSettings(restaurantId: string, settings: Partial<SiteSettings>) {
    const dbUpdates: any = {};
    if (settings.themeColor !== undefined) dbUpdates.theme_color = settings.themeColor;
    if (settings.fontFamily !== undefined) dbUpdates.font_family = settings.fontFamily;
    if (settings.darkMode !== undefined) dbUpdates.dark_mode = settings.darkMode;
    if (settings.bannerActive !== undefined) dbUpdates.banner_active = settings.bannerActive;
    if (settings.bannerUrls !== undefined) dbUpdates.banner_urls = settings.bannerUrls;
    if (settings.mobileBannerUrls !== undefined) dbUpdates.mobile_banner_urls = settings.mobileBannerUrls;
    if (settings.bannerOverlayVisible !== undefined) dbUpdates.banner_overlay_visible = settings.bannerOverlayVisible;
    if (settings.bannerTag !== undefined) dbUpdates.banner_tag = settings.bannerTag;
    if (settings.bannerTitle !== undefined) dbUpdates.banner_title = settings.bannerTitle;
    if (settings.bannerSubtitle !== undefined) dbUpdates.banner_subtitle = settings.bannerSubtitle;
    if (settings.popupActive !== undefined) dbUpdates.popup_active = settings.popupActive;
    if (settings.popupUrl !== undefined) dbUpdates.popup_url = settings.popupUrl;
    if (settings.logoUrl !== undefined) dbUpdates.logo_url = settings.logoUrl;
    if (settings.logoWidth !== undefined) dbUpdates.logo_width = settings.logoWidth;
    if (settings.defaultProductImage !== undefined) dbUpdates.default_product_image = settings.defaultProductImage;
    if (settings.categoryFontSize !== undefined) dbUpdates.category_font_size = settings.categoryFontSize;
    if (settings.categoryFontWeight !== undefined) dbUpdates.category_font_weight = settings.categoryFontWeight;
    if (settings.categoryRowHeight !== undefined) dbUpdates.category_row_height = settings.categoryRowHeight;
    if (settings.categoryGap !== undefined) dbUpdates.category_gap = settings.categoryGap;
    if (settings.categoryOverlayOpacity !== undefined) dbUpdates.category_overlay_opacity = settings.categoryOverlayOpacity;

    // Product Styling
    if (settings.productTitleColor !== undefined) dbUpdates.product_title_color = settings.productTitleColor;
    if (settings.productDescriptionColor !== undefined) dbUpdates.product_description_color = settings.productDescriptionColor;
    if (settings.productPriceColor !== undefined) dbUpdates.product_price_color = settings.productPriceColor;
    if (settings.productTitleSize !== undefined) dbUpdates.product_title_size = settings.productTitleSize;
    if (settings.productDescriptionSize !== undefined) dbUpdates.product_description_size = settings.productDescriptionSize;
    if (settings.productPriceSize !== undefined) dbUpdates.product_price_size = settings.productPriceSize;

    if (Object.keys(dbUpdates).length === 0) return;
    const { error } = await supabase.from('settings').update(dbUpdates).eq('restaurant_id', restaurantId);
    if (error) throw error;
}

// --- STORAGE ---

export async function uploadImage(file: File, bucketName: string = 'qrmenu1-images'): Promise<string> {
    // 1. Client-side Compression
    const compressedFile = await new Promise<File>((resolve, reject) => {
        // If not an image, return original
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;

        img.onload = () => {
            URL.revokeObjectURL(objectUrl); // Clean up memory
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                resolve(file);
                return;
            }

            // Draw and resize
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG with 0.8 quality
            canvas.toBlob((blob) => {
                if (blob) {
                    // Create new file with .jpg extension
                    const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                    const newFile = new File([blob], newName, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    resolve(newFile);
                } else {
                    resolve(file);
                }
            }, 'image/jpeg', 0.8);
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(file); // Fallback to original
        };
    });

    // 2. Upload
    const fileExt = compressedFile.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, compressedFile);

    if (uploadError) {
        throw uploadError;
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return data.publicUrl;
}

// --- ANALYTICS ---

export async function trackPageView(restaurantId: string) {
    try {
        await supabase.from('analytics').insert([{ restaurant_id: restaurantId, event_type: 'view' }]);
    } catch (error) {
        console.error("Error tracking view:", error);
    }
}

export async function getDashboardStats(restaurantId: string) {
    // Get start of today (00:00:00)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get start of yesterday
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    // Get end of yesterday (which is start of today)
    // We use >= startOfYesterday AND < startOfToday for yesterday Stats
    // We use >= startOfToday for today Stats

    // Today's Views
    const { count: todayCount, error: todayError } = await supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .eq('event_type', 'view')
        .gte('created_at', startOfToday.toISOString());

    if (todayError) console.error("Error fetching today stats:", todayError);

    // Yesterday's Views
    const { count: yesterdayCount, error: yesterdayError } = await supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .eq('event_type', 'view')
        .gte('created_at', startOfYesterday.toISOString())
        .lt('created_at', startOfToday.toISOString());

    if (yesterdayError) console.error("Error fetching yesterday stats:", yesterdayError);

    // Total Products
    const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId);

    return {
        todayViews: todayCount || 0,
        yesterdayViews: yesterdayCount || 0,
        totalProducts: productCount || 0
    };
}

// --- ORDER MODULE ---

export async function createOrder(restaurantId: string, tableNo: string, items: any[], customerNote?: string): Promise<Order | null> {
    // 1. Calculate Total
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 2. Create Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
            restaurant_id: restaurantId,
            table_no: tableNo,
            total_amount: totalAmount,
            customer_note: customerNote,
            status: 'pending'
        }])
        .select()
        .single();

    if (orderError || !order) {
        console.error("Order creation failed", orderError);
        return null;
    }

    // 3. Create Order Items
    const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        options: item.options,
        status: 'pending'
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

    if (itemsError) {
        console.error("Order items creation failed", itemsError);
        // We might want to rollback here or mark order as failed, but for now log it.
    }

    return order as Order;
}

export async function getActiveOrders(restaurantId: string): Promise<Order[]> {
    // Get orders that are NOT completed or cancelled
    // Also fetch items nested
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            items:order_items(*)
        `)
        .eq('restaurant_id', restaurantId)
        .in('status', ['pending', 'preparing', 'ready'])
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        return [];
    }
    return data as any as Order[];
}

export async function updateOrderStatus(orderId: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', orderId);
}

export async function updateOrderItemStatus(itemId: string, status: string) {
    await supabase.from('order_items').update({ status }).eq('id', itemId);
}

export async function updateRestaurantFeatures(restaurantId: string, features: { is_ordering_active?: boolean, is_waiter_mode_active?: boolean }) {
    await supabase.from('restaurants').update(features).eq('id', restaurantId);
}

export async function getActiveTableOrder(restaurantId: string, tableNo: string): Promise<Order | null> {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            items:order_items(*)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('table_no', tableNo)
        .in('status', ['pending', 'preparing', 'ready'])
        .single();

    if (error) return null;
    return data as any as Order;
}

export async function processPayment(
    restaurantId: string,
    orderId: string,
    amount: number,
    paymentMethod: 'cash' | 'credit_card' | 'meal_card' | 'other',
    discountAmount: number = 0,
    isFinalPayment: boolean = false
) {
    // 1. Record Payment
    const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
            restaurant_id: restaurantId,
            order_id: orderId,
            amount: amount,
            payment_method: paymentMethod,
            discount_amount: discountAmount
        }]);

    if (paymentError) throw paymentError;

    // 2. Update Order if Final
    if (isFinalPayment) {
        // Calculate total including discount logic if needed, but for now we trust `isFinalPayment` flag
        // Or we could summing up all payments + discount and check against total?
        // Let's trust the frontend logic for "Close Table" for now, or just mark as paid.

        const { error: updateError } = await supabase
            .from('orders')
            .update({
                is_paid: true,
                status: 'completed',
                // We might want to store final collected amount or just rely on payments table
            })
            .eq('id', orderId);

        if (updateError) throw updateError;
    }
}

export async function addOrderItems(orderId: string, items: any[]) {
    // 1. Prepare items
    const orderItems = items.map(item => ({
        order_id: orderId,
        product_id: item.product_id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        options: item.options,
        status: 'pending'
    }));

    // 2. Insert items
    const { error } = await supabase
        .from('order_items')
        .insert(orderItems);

    if (error) throw error;

    // 3. Update Order Total
    // Fetch order to get current total
    const { data: order } = await supabase.from('orders').select('total_amount').eq('id', orderId).single();
    if (order) {
        const newItemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newTotal = (order.total_amount || 0) + newItemsTotal;

        await supabase.from('orders').update({ total_amount: newTotal }).eq('id', orderId);
    }
}
