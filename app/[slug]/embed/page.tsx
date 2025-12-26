'use client';

import CategoryAccordion from '@/components/CategoryAccordion';
import EmbedResizer from '@/components/EmbedResizer';
import { useMenu } from '@/lib/store';
import { trackPageView } from '@/lib/services';
import { useEffect, useState } from 'react';

export default function EmbedPage() {
    const { products, categories, settings } = useMenu();
    const [loading, setLoading] = useState(true);
    const [viewTracked, setViewTracked] = useState(false);

    // Dark Mode Logic for Embed
    useEffect(() => {
        if (settings.darkMode) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, [settings.darkMode]);

    // Track Views (Embed üzerinden de sayılmalı)
    useEffect(() => {
        if (settings.restaurantId && !viewTracked) {
            trackPageView(settings.restaurantId).catch(console.error);
            setViewTracked(true);
        }
    }, [settings.restaurantId, viewTracked]);

    useEffect(() => {
        // Data simulation or wait for hydratation
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <div className="p-4 text-center text-gray-500 text-sm">Menü Yükleniyor...</div>;
    }

    return (
        <div className="bg-transparent min-h-px pb-4">
            <EmbedResizer />

            <main className="max-w-4xl mx-auto">
                <CategoryAccordion
                    categories={categories}
                    products={products}
                    language="tr" // Embed'de dil yönetimi şu an sabit TR, ileride prop ile alınabilir
                />
            </main>
        </div>
    );
}
