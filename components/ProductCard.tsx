import { useMenu } from '@/lib/store';
import { Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Flame, Leaf, Wheat } from 'lucide-react'; // Icons for tags
import { ALLERGENS } from '@/lib/allergens';
import Image from 'next/image';

interface ProductCardProps {
    product: Product;
    language: 'tr' | 'en';
    onClick?: () => void;
    layoutMode?: 'grid' | 'list' | 'list-no-image';
}

export default function ProductCard({ product, language, onClick, layoutMode = 'grid' }: ProductCardProps) {
    const { settings } = useMenu();

    const displayName = language === 'en' && product.nameEn ? product.nameEn : product.name;
    const displayDescription = language === 'en' && product.descriptionEn ? product.descriptionEn : product.description;

    // Helper to get icon
    const getIcon = (iconName?: string) => {
        switch (iconName) {
            case 'pepper': return <Flame className="h-3 w-3" />;
            case 'leaf': return <Leaf className="h-3 w-3" />;
            case 'wheat': return <Wheat className="h-3 w-3" />;
            default: return null;
        }
    };

    // Dynamic Styles from Settings
    const titleSize = {
        medium: 'text-lg',
        large: 'text-xl',
        xl: 'text-2xl'
    }[settings.productTitleSize || 'large'];

    const descriptionSize = {
        small: 'text-xs',
        medium: 'text-sm',
        large: 'text-base'
    }[settings.productDescriptionSize || 'medium'];

    const priceSize = {
        medium: 'text-lg',
        large: 'text-xl',
        xl: 'text-2xl'
    }[settings.productPriceSize || 'large'];

    // Fallback image logic
    const imageSrc = (product.image && product.image.length > 5)
        ? product.image
        : (settings.defaultProductImage && settings.defaultProductImage.length > 5)
            ? settings.defaultProductImage
            : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';

    // RENDER: LIST-NO-IMAGE (Minimal / Cocktail Style)
    if (layoutMode === 'list-no-image') {
        return (
            <div
                onClick={onClick}
                className="group flex flex-col overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer p-4 md:p-6"
            >
                <div className="flex items-center justify-between gap-4">
                    <h3
                        className={cn("font-serif font-bold leading-tight tracking-wide", titleSize)}
                        style={{ color: settings.productTitleColor }}
                    >
                        {displayName.toLocaleUpperCase('tr-TR')}
                    </h3>
                    <div className="flex flex-col items-end shrink-0">
                        {(product.price !== undefined && product.price !== null && (!product.variants || product.variants.length === 0)) && (
                            product.discountPrice ? (
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-gray-400 line-through">₺{product.price}</span>
                                    <span
                                        className={cn("font-bold", priceSize)}
                                        style={{ color: settings.productPriceColor }}
                                    >
                                        ₺{product.discountPrice}
                                    </span>
                                </div>
                            ) : (
                                <span
                                    className={cn("font-bold", priceSize)}
                                    style={{ color: settings.productPriceColor }}
                                >
                                    ₺{product.price}
                                </span>
                            )
                        )}
                    </div>
                </div>
                {displayDescription && (
                    <p
                        className={cn("mt-2 leading-relaxed opacity-80", descriptionSize)}
                        style={{ color: settings.productDescriptionColor }}
                    >
                        {displayDescription}
                    </p>
                )}
            </div>
        );
    }

    // RENDER: LIST (Wine / Gin Style with Variants List)
    if (layoutMode === 'list') {
        return (
            <div
                onClick={onClick}
                className="group flex flex-col overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer p-4 md:p-6"
            >
                {/* Header */}
                <h3
                    className={cn("font-serif font-bold leading-tight tracking-wide mb-3 pb-3 border-b border-gray-100 border-dashed", titleSize)}
                    style={{ color: settings.productTitleColor }}
                >
                    {displayName.toLocaleUpperCase('tr-TR')}
                </h3>

                {/* Variants List (Explicit) */}
                {product.variants && product.variants.length > 0 ? (
                    <div className="space-y-2">
                        {product.variants.map((variant, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    {/* Simple Icon Logic based on variant name keywords */}
                                    {(variant.name.toLowerCase().includes('kadeh') || variant.name.toLowerCase().includes('glass') || variant.name.includes('cl')) && (
                                        <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="currentColor"><path d="M11 21h2v-2h-2v2zm1-18c-2.76 0-5 2.24-5 5v5c0 1.29.39 2.49 1.05 3.48L7 19v2h10v-2l-1.05-2.52C16.61 15.49 17 14.29 17 11V6c0-2.76-2.24-5-5-5z" /></svg>
                                    )}
                                    {(variant.name.toLowerCase().includes('şişe') || variant.name.toLowerCase().includes('bottle')) && (
                                        <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="currentColor"><path d="M17.06.88l-6.09 6.09 3.19 3.19 2.56-2.56c.19-.19.31-.47.31-.76 0-.3-.11-.57-.31-.76l-1.87-1.87.53-.53 1.68 1.68c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-1.68-1.68.53-.53 2.52 2.52c.29.29.77.29 1.06 0 .29-.29.29-.77 0-1.06L17.06.88zM4.3 9l3.07 3.07-2.56 2.56c-.59.59-.59 1.54 0 2.12l5.5 5.5c.59.59 1.54.59 2.12 0l2.56-2.56 3.07 3.07c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L4.3 9z" /></svg>
                                    )}
                                    {variant.name}
                                </span>
                                <span className="font-bold text-gray-900">
                                    {variant.price} ₺
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Tek Fiyat</span>
                        {(product.price !== undefined && product.price !== null) && (
                            product.discountPrice ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 line-through">₺{product.price}</span>
                                    <span
                                        className={cn("font-bold", priceSize)}
                                        style={{ color: settings.productPriceColor }}
                                    >
                                        ₺{product.discountPrice}
                                    </span>
                                </div>
                            ) : (
                                <span
                                    className={cn("font-bold", priceSize)}
                                    style={{ color: settings.productPriceColor }}
                                >
                                    ₺{product.price}
                                </span>
                            )
                        )}
                    </div>
                )}
            </div>
        );
    }

    // RENDER: GRID (Standard with Image)
    return (
        <div
            onClick={onClick}
            className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer"
        >

            {/* Large Top Image */}
            <div className="relative aspect-square w-full bg-white">
                <Image
                    src={imageSrc}
                    alt={displayName}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.discountPrice && (
                    <div className="absolute top-3 left-3 rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-sm">
                        {language === 'en' ? 'Sale' : 'İndirim'}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col p-6">
                {/* Title and Price Row */}
                <div className="mb-2 flex items-start justify-between gap-4">
                    <h3
                        className={cn("font-serif font-bold leading-tight tracking-wide", titleSize)}
                        style={{ color: settings.productTitleColor }}
                    >
                        {displayName.toLocaleUpperCase('tr-TR')}
                    </h3>
                    <div className="flex flex-col items-end">
                        {(product.price !== undefined && product.price !== null && (!product.variants || product.variants.length === 0)) && (
                            product.discountPrice ? (
                                <>
                                    <span className="text-xs text-gray-400 line-through">₺{product.price}</span>
                                    <span
                                        className={cn("font-bold", priceSize)}
                                        style={{ color: settings.productPriceColor }}
                                    >
                                        ₺{product.discountPrice}
                                    </span>
                                </>
                            ) : (
                                <span
                                    className={cn("font-bold", priceSize)}
                                    style={{ color: settings.productPriceColor }}
                                >
                                    ₺{product.price}
                                </span>
                            )
                        )}
                    </div>
                </div>

                {/* Description */}
                <p
                    className={cn("mb-4 leading-relaxed", descriptionSize)}
                    style={{ color: settings.productDescriptionColor }}
                >
                    {displayDescription}
                </p>

                {/* Allergen Icons */}
                {product.allergens && product.allergens.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {product.allergens.map((allergenId) => {
                            const allergen = ALLERGENS.find(a => a.id === allergenId);
                            if (!allergen) return null;
                            const Icon = allergen.icon;
                            return (
                                <div
                                    key={allergenId}
                                    className="flex items-center justify-center rounded-full bg-gray-100 p-1.5 text-gray-500"
                                    title={language === 'en' ? allergen.nameEn : allergen.nameTr}
                                >
                                    <Icon className={cn("h-4 w-4", allergen.color)} />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Variants List */}
                {product.variants && product.variants.length > 0 && (
                    <div className="mb-4 mt-2 space-y-2 border-t border-dashed border-gray-200 pt-3">
                        {product.variants.map((variant, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="font-bold text-gray-700">{variant.name}</span>
                                <span
                                    className={cn("font-bold text-base")}
                                    style={{ color: settings.productPriceColor }}
                                >
                                    {variant.price} ₺
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tags / Allergens Footer */}
                {product.tags && product.tags.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-2 pt-2">
                        {product.tags.map((tag) => (
                            <span
                                key={tag.id}
                                className={cn(
                                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                                    tag.color || "bg-gray-100 text-gray-600"
                                )}
                            >
                                {getIcon(tag.icon)}
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
