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
    addCategory: (category: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    uploadImage: (file: File) => Promise<string>;
    refreshData: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        setLoading(true);
        try {
            const [fetchedCategories, fetchedProducts, fetchedSettings] = await Promise.all([
                Services.getCategories(),
                Services.getProducts(),
                Services.getSettings()
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

    useEffect(() => {
        refreshData();
    }, []);

    const addProduct = async (product: Partial<Product>) => {
        try {
            const newProduct = await Services.createProduct(product);
            // Optimistic update or just push the response
            // The service returns the mapped DB response which might be in snake_case if not handled well in service
            // Wait, createProduct in service returns raw DB response. I should probably map it or just refetch.
            // For simplicity in this turn, I will refetch to ensure consistency, 
            // but for UX speed, I'll append locally if I can map it.
            // Let's just refetch products to be safe and simple.
            await refreshData();
        } catch (error) {
            console.error("Error adding product:", error);
            throw error;
        }
    };

    const updateProduct = async (product: Product) => {
        // Optimistic update
        setProducts(prev => prev.map(p => p.id === product.id ? product : p));
        try {
            await Services.updateProduct(product.id, product);
        } catch (error) {
            console.error("Error updating product:", error);
            // Revert on error?
            await refreshData();
        }
    };

    const deleteProduct = async (id: string) => {
        // Optimistic
        setProducts(prev => prev.filter(p => p.id !== id));
        try {
            await Services.deleteProduct(id);
        } catch (error) {
            console.error("Error deleting product:", error);
            await refreshData();
        }
    };

    const updateSettings = async (newSettings: Partial<SiteSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
        try {
            await Services.updateSettings(newSettings);
        } catch (error) {
            console.error("Error updating settings:", error);
        }
    };

    // Special handling for Bulk Category update (e.g. reorder)
    const updateCategories = async (newCategories: Category[]) => {
        setCategories(newCategories); // Optimistic
        try {
            // Update sort_order for each
            const updates = newCategories.map((cat, index) =>
                Services.updateCategory(cat.id, { order: index, name: cat.name }) // Passing name just in case, primarily order
            );
            await Promise.all(updates);
        } catch (error) {
            console.error("Error updating categories:", error);
            await refreshData();
        }
    };

    const addCategory = async (category: Partial<Category>) => {
        try {
            await Services.createCategory(category);
            await refreshData();
        } catch (error: any) {
            console.error("Error adding category:", error);
            alert("Kategori eklenirken hata: " + (error?.message || JSON.stringify(error)));
            throw error;
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
            addCategory,
            deleteCategory,
            uploadImage,
            refreshData
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
