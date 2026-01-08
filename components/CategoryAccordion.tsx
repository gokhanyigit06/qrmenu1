
'use client';

import { Category, Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { useMenu } from '@/lib/store';
import { useLenis } from 'lenis/react';

interface CategoryAccordionProps {
    categories: Category[];
    products: Product[];
    language: 'tr' | 'en';
}

export default function CategoryAccordion({ categories, products, language }: CategoryAccordionProps) {
    const { settings } = useMenu();
    const lenis = useLenis(); // Get lenis instance

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Track open state for active categories (multiple can be open at a time).
    const [activeCategoryIds, setActiveCategoryIds] = useState<string[]>(() => {
        if (categories.length > 0) {
            return [categories[0].id];
        }
        return [];
    });

    const toggleCategory = (id: string) => {
        const isOpening = !activeCategoryIds.includes(id);

        setActiveCategoryIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(c => c !== id);
            } else {
                return [...prev, id];
            }
        });

        if (isOpening) {
            setTimeout(() => {
                const element = document.getElementById(`category-${id}`);
                if (element && lenis) {
                    const headerOffset = 150;
                    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                    const offsetPosition = elementPosition - headerOffset;

                    lenis.scrollTo(offsetPosition, {
                        duration: 1.2,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) // Exponential out easing
                    });
                } else if (element) {
                    // Fallback if lenis isn't ready
                    const headerOffset = 150;
                    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                    const offsetPosition = elementPosition - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            }, 300);
        }
    };

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Delay clearing product to allow close animation
        setTimeout(() => setSelectedProduct(null), 300);
    };

    // Styling Maps
    const gapMap = {
        small: 'space-y-2',
        medium: 'space-y-4',
        large: 'space-y-8'
    };

    const heightMap = {
        small: 'h-20',
        medium: 'h-28',
        large: 'h-40'
    };

    const fontSizeMap = {
        medium: 'text-xl',
        large: 'text-3xl',
        xl: 'text-5xl'
    };

    const fontWeightMap = {
        normal: 'font-medium',
        bold: 'font-bold',
        black: 'font-black'
    };

    const currentGap = gapMap[settings.categoryGap || 'medium'];
    const currentHeight = heightMap[settings.categoryRowHeight || 'medium'];
    const currentFontSize = fontSizeMap[settings.categoryFontSize || 'large'];
    const currentFontWeight = fontWeightMap[settings.categoryFontWeight || 'black'];

    return (
        <>
            <ProductModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                product={selectedProduct}
                language={language}
            />

            <div className={currentGap}>
                {categories.map((category) => {
                    // ... (rest of mapping logic) ...
                    const categoryProducts = products.filter(p => p.categoryId === category.id);
                    const isOpen = activeCategoryIds.includes(category.id);
                    const displayName = language === 'en' && category.nameEn ? category.nameEn : category.name;

                    // Filter out categories with no products
                    if (categoryProducts.length === 0) return null;

                    return (
                        <div
                            key={category.id}
                            id={`category-${category.id}`}
                            className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300"
                        >
                            {/* ... header button ... */}
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className={`relative flex ${currentHeight} w-full items-center overflow-hidden text-left`}
                            >
                                {/* ... background image ... */}
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
                                    <div
                                        className={cn(
                                            "absolute inset-0 transition-opacity duration-300",
                                            isOpen ? "bg-black/70" : ""
                                        )}
                                        style={{
                                            backgroundColor: isOpen ? undefined : `rgba(0,0,0, ${settings.categoryOverlayOpacity !== undefined && settings.categoryOverlayOpacity !== null ? settings.categoryOverlayOpacity / 100 : 0.5})`
                                        }}
                                    />
                                </div>

                                {/* ... Content ... */}
                                {/* (Same header content code) */}
                                <div className="relative z-10 flex w-full items-center justify-between px-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            {/* Category Icon */}
                                            {category.icon && (
                                                <div className="relative h-12 w-12 shrink-0 drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
                                                    {(category.icon.startsWith('http') || category.icon.startsWith('/')) ? (
                                                        <Image
                                                            src={category.icon}
                                                            alt=""
                                                            fill
                                                            className="object-contain"
                                                        />
                                                    ) : (
                                                        <span className="text-4xl">{category.icon}</span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <h3 className={`${currentFontSize} ${currentFontWeight} text-white drop-shadow-md tracking-tight`}>
                                                        {displayName}
                                                    </h3>
                                                    {category.badge && (
                                                        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white shadow-sm">
                                                            {category.badge.toLocaleUpperCase('tr-TR')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
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
                                    "grid transition-all duration-300 ease-in-out",
                                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                )}
                            >
                                <div className="overflow-hidden">
                                    <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 bg-white">
                                        {categoryProducts.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                language={language}
                                                layoutMode={category.layoutMode || 'grid'}
                                                onClick={() => handleProductClick(product)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
