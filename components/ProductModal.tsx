'use client';

import { Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useMenu } from '@/lib/store';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    language: 'tr' | 'en';
}

export default function ProductModal({ isOpen, onClose, product, language }: ProductModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const { settings } = useMenu();

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;
    if (!product) return null;

    const displayName = language === 'en' && product.nameEn ? product.nameEn : product.name;
    const displayDescription = language === 'en' && product.descriptionEn ? product.descriptionEn : product.description;

    // Theme Color Logic
    const themeTextColors: Record<string, string> = {
        black: 'text-amber-600',
        white: 'text-black',
        blue: 'text-blue-600',
        orange: 'text-orange-600',
        red: 'text-red-600',
        green: 'text-green-600'
    };
    const activeColorClass = themeTextColors[settings.themeColor || 'black'] || 'text-amber-600';

    // Image Source Logic
    const imageSrc = (product.image && product.image.length > 5)
        ? product.image
        : (settings.defaultProductImage && settings.defaultProductImage.length > 5)
            ? settings.defaultProductImage
            : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';

    return (
        <div className={cn(
            "fixed inset-0 z-[60] flex items-center justify-center px-4 transition-all duration-300",
            isOpen ? "visible opacity-100" : "invisible opacity-0"
        )}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={cn(
                    "relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 transform",
                    isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
                )}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md backdrop-blur transition-transform hover:scale-110 active:scale-95"
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Product Image */}
                <div className="relative aspect-square w-full bg-gray-100">
                    <Image
                        src={imageSrc}
                        alt={displayName}
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Details */}
                <div className="p-8">
                    <h2 className="font-serif text-3xl font-black leading-tight tracking-wide text-gray-900 mb-2">
                        {displayName.toLocaleUpperCase('tr-TR')}
                    </h2>

                    <div className="flex items-center gap-3 mb-6">
                        {(product.variants && product.variants.length > 0) ? (
                            null
                        ) : (
                            product.discountPrice ? (
                                <>
                                    <span className={cn("text-3xl font-bold", activeColorClass)}>
                                        ₺{product.discountPrice}
                                    </span>
                                    <span className="text-lg text-gray-400 line-through font-medium">
                                        ₺{product.price}
                                    </span>
                                </>
                            ) : (
                                <span className={cn("text-3xl font-bold", activeColorClass)}>
                                    ₺{product.price}
                                </span>
                            )
                        )}
                    </div>

                    {displayDescription && (
                        <p className="text-lg text-gray-600 leading-relaxed font-medium">
                            {displayDescription}
                        </p>
                    )}

                    {/* Variants if any */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="mt-6 space-y-3 bg-gray-50 p-4 rounded-xl">
                            {product.variants.map((variant, idx) => (
                                <div key={idx} className="flex items-center justify-between text-base">
                                    <span className="font-bold text-gray-700">{variant.name}</span>
                                    <span className={cn("font-bold text-lg", activeColorClass)}>
                                        {variant.price} ₺
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
