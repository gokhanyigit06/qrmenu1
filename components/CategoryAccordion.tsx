
'use client';

import { Category, Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import ProductCard from './ProductCard';

interface CategoryAccordionProps {
    categories: Category[];
    products: Product[];
    language: 'tr' | 'en';
}

export default function CategoryAccordion({ categories, products, language }: CategoryAccordionProps) {
    // Track open state for each category. Set first one open by default.
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
        if (categories.length > 0) {
            return { [categories[0].id]: true };
        }
        return {};
    });

    const toggleCategory = (id: string) => {
        setOpenCategories(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="space-y-4">
            {categories.map((category) => {
                const categoryProducts = products.filter(p => p.categoryId === category.id);
                const isOpen = openCategories[category.id];
                const displayName = language === 'en' && category.nameEn ? category.nameEn : category.name;

                // Filter out categories with no products
                if (categoryProducts.length === 0) return null;

                return (
                    <div
                        key={category.id}
                        className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300"
                    >
                        {/* Accordion Header / Trigger */}
                        <button
                            onClick={() => toggleCategory(category.id)}
                            className="relative flex h-28 w-full items-center overflow-hidden text-left"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src={category.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'}
                                    alt={displayName}
                                    fill
                                    className={cn(
                                        "object-cover transition-transform duration-700",
                                        isOpen ? "scale-110 blur-[2px]" : "scale-100"
                                    )}
                                />
                                {/* Dynamic Gradient Overlay based on state */}
                                <div className={cn(
                                    "absolute inset-0 transition-opacity duration-300",
                                    isOpen ? "bg-black/70" : "bg-black/50"
                                )} />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 flex w-full items-center justify-between px-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-2xl font-black text-white drop-shadow-md tracking-tight">
                                            {displayName}
                                        </h3>
                                        {category.badge && (
                                            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                                                {category.badge}
                                            </span>
                                        )}
                                    </div>

                                    {category.description && (
                                        <p className="text-sm font-medium text-white/90 line-clamp-1">
                                            {category.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-white/70">
                                            {categoryProducts.length} {language === 'en' ? 'Items' : 'Çeşit'}
                                        </p>
                                        {category.discountRate && (
                                            <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                                %{category.discountRate} {language === 'en' ? 'Off' : 'İndirim'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform duration-300 shrink-0",
                                    isOpen ? "rotate-180 bg-white text-black" : "text-white"
                                )}>
                                    <ChevronDown className="h-6 w-6" />
                                </div>
                            </div>
                        </button>

                        {/* Accordion Body / Products Grid */}
                        <div
                            className={cn(
                                "grid transition-all duration-500 ease-in-out",
                                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                            )}
                        >
                            <div className="overflow-hidden">
                                <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 bg-white">
                                    {categoryProducts.map((product) => (
                                        <ProductCard key={product.id} product={product} language={language} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
