'use client';

import { Category, Product, SiteSettings, defaultSettings } from '@/lib/data';
import * as Services from '@/lib/services';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface MenuContextType {
    products: Product[];
    categories: Category[];
    settings: SiteSettings;
    loading: boolean;
    addProduct: (product: Partial<Product>) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    reorderProducts: (products: Product[]) => Promise<void>;
    updateSettings: (settings: Partial<SiteSettings>) => Promise<void>;
    updateCategories: (categories: Category[]) => Promise<void>;
    updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
    addCategory: (category: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    uploadImage: (file: File) => Promise<string>;
    refreshData: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    const refreshData = async (overrideId?: string) => {
        const targetId = overrideId || restaurantId;
        if (!targetId) return;

        setLoading(true);
        try {
            const [fetchedCategories, fetchedProducts, fetchedSettings] = await Promise.all([
                Services.getCategories(targetId),
                Services.getProducts(targetId),
                Services.getSettings(targetId)
            ]);

            setCategories(fetchedCategories || []);
            setProducts(fetchedProducts || []);
            if (fetchedSettings) {
                setSettings({ ...defaultSettings, ...fetchedSettings });
            }
        } catch (error) {
            console.error("Failed to fetch menu data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial Load - Multi-tenant Support
    useEffect(() => {
        const init = async () => {
            // TODO: In the future, getting slug from URL or Domain
            // For now, we hardcode 'mickeys' as the primary tenant
            const slug = 'mickeys';
            const restaurant = await Services.getRestaurantBySlug(slug);

            if (restaurant) {
                setRestaurantId(restaurant.id);
                refreshData(restaurant.id);
            } else {
                console.error("Restaurant not found:", slug);
                setLoading(false);
            }
        };
        init();
    }, []);

    const addProduct = async (product: Partial<Product>) => {
        if (!restaurantId) return;
        try {
            await Services.createProduct({ ...product, restaurantId });
            await refreshData();
        } catch (error) {
            console.error("Error adding product:", error);
            throw error;
        }
    };

    const updateProduct = async (product: Product) => {
        setProducts(prev => prev.map(p => p.id === product.id ? product : p));
        try {
            await Services.updateProduct(product.id, product);
        } catch (error) {
            console.error("Error updating product:", error);
            await refreshData();
        }
    };

    const deleteProduct = async (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        try {
            await Services.deleteProduct(id);
        } catch (error) {
            console.error("Error deleting product:", error);
            await refreshData();
        }
    };

    const updateSettings = async (newSettings: Partial<SiteSettings>) => {
        if (!restaurantId) return;
        setSettings(prev => ({ ...prev, ...newSettings }));
        try {
            await Services.updateSettings(restaurantId, newSettings);
        } catch (error) {
            console.error("Error updating settings:", error);
        }
    };

    const updateCategories = async (newCategories: Category[]) => {
        setCategories(newCategories);
        try {
            const updates = newCategories.map((cat, index) =>
                Services.updateCategory(cat.id, { order: index, name: cat.name })
            );
            await Promise.all(updates);
        } catch (error) {
            console.error("Error updating categories:", error);
            await refreshData();
        }
    };

    const addCategory = async (category: Partial<Category>) => {
        if (!restaurantId) return;
        try {
            await Services.createCategory({ ...category, restaurantId });
            await refreshData();
        } catch (error: any) {
            console.error("Error adding category:", error);
            alert("Kategori eklenirken hata: " + (error?.message || JSON.stringify(error)));
            throw error;
        }
    };

    const updateCategory = async (id: string, category: Partial<Category>) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...category } : c));
        try {
            await Services.updateCategory(id, category);
        } catch (error) {
            console.error("Error updating category:", error);
            await refreshData();
        }
    };

    const deleteCategory = async (id: string) => {
        setCategories(prev => prev.filter(c => c.id !== id));
        try {
            await Services.deleteCategory(id);
        } catch (error) {
            console.error("Error deleting category:", error);
            await refreshData();
        }
    };

    const reorderProducts = async (newProducts: Product[]) => {
        setProducts(newProducts);
        try {
            const updates = newProducts.map((prod, index) =>
                Services.updateProduct(prod.id, { sortOrder: index })
            );
            await Promise.all(updates);
        } catch (error) {
            console.error("Error reordering products:", error);
        }
    };

    const uploadImage = async (file: File) => {
        return await Services.uploadImage(file);
    };

    return (
        <MenuContext.Provider value={{
            products,
            categories,
            settings,
            loading,
            addProduct,
            updateProduct,
            deleteProduct,
            reorderProducts,
            updateSettings,
            updateCategories,
            updateCategory,
            addCategory,
            deleteCategory,
            uploadImage,
            refreshData: () => refreshData()
        }}>
            {children}
        </MenuContext.Provider>
    );
}

export function useMenu() {
    const context = useContext(MenuContext);
    if (context === undefined) {
        throw new Error('useMenu must be used within a MenuProvider');
    }
    return context;
}
