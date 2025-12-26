import { useMenu } from '@/lib/store';
import { Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Flame, Leaf, Wheat } from 'lucide-react'; // Icons for tags
import Image from 'next/image';

interface ProductCardProps {
    product: Product;
    language: 'tr' | 'en';
}

export default function ProductCard({ product, language }: ProductCardProps) {
    const { settings } = useMenu();

    const displayName = language === 'en' && product.nameEn ? product.nameEn : product.name;
    const displayDescription = language === 'en' && product.descriptionEn ? product.descriptionEn : product.description;

    // Helper to get icon
    const getIcon = (iconName?: string) => {
        switch (iconName) {
            case 'pepper': return <Flame className="h-3 w-3" />; // Using flame for spice
            case 'leaf': return <Leaf className="h-3 w-3" />;
            case 'wheat': return <Wheat className="h-3 w-3" />;
            default: return null;
        }
    };

    // Dynamic Text Color based on theme
    const themeTextColors: Record<string, string> = {
        black: 'text-amber-600', // Black theme uses Amber for contrast
        white: 'text-black', // White theme uses Black for prices
        blue: 'text-blue-600',
        orange: 'text-orange-600',
        red: 'text-red-600',
        green: 'text-green-600'
    };

    // Fallback to amber if unknown
    const activeColorClass = themeTextColors[settings.themeColor || 'black'] || 'text-amber-600';

    // Fallback image logic
    const imageSrc = (product.image && product.image.length > 5)
        ? product.image
        : (settings.defaultProductImage && settings.defaultProductImage.length > 5)
            ? settings.defaultProductImage
            : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';

    return (
        <div className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-md">

            {/* Large Top Image */}
            <div className="relative aspect-square w-full bg-white">
                <Image
                    src={imageSrc}
                    alt={displayName}
                    fill
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
                    <h3 className="font-serif text-xl font-bold uppercase leading-tight tracking-wide text-gray-900">
                        {displayName}
                    </h3>
                    <div className="flex flex-col items-end">
                        {product.discountPrice ? (
                            <>
                                <span className="text-xs text-gray-400 line-through">₺{product.price}</span>
                                <span className={cn("text-xl font-bold", activeColorClass)}>₺{product.discountPrice}</span>
                            </>
                        ) : (
                            <span className={cn("text-xl font-bold", activeColorClass)}>₺{product.price}</span>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className="mb-4 text-sm leading-relaxed text-gray-500">
                    {displayDescription}
                </p>

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
