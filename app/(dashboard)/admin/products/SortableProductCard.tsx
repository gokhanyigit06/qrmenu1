
import { Product } from '@/lib/data';
import { useMenu } from '@/lib/store';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit2, Eye, EyeOff, GripVertical, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface SortableProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
    onToggleActive: (product: Product) => void;
}

export function SortableProductCard({ product, onEdit, onDelete, onToggleActive }: SortableProductCardProps) {
    const { settings } = useMenu();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: product.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md ${product.isActive === false ? 'opacity-70 border-gray-200 grayscale-[0.5]' : 'border-gray-200 hover:border-amber-200'}`}
        >
            {/* Image & Badge */}
            <div className="relative h-48 w-full bg-gray-100">
                <Image
                    src={product.image && product.image.length > 5 ? product.image : (settings.defaultProductImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c')}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-cover"
                />

                {/* Drag Handle */}
                <div {...attributes} {...listeners} className="absolute top-2 left-2 z-20 cursor-grab active:cursor-grabbing rounded-lg bg-black/50 p-1.5 text-white backdrop-blur-sm hover:bg-black/70">
                    <GripVertical className="h-4 w-4" />
                </div>

                <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                    <div className="flex gap-2">
                        <button
                            onClick={() => onToggleActive(product)}
                            className={`rounded-lg p-2 shadow-sm backdrop-blur-sm transition-colors ${product.isActive === false ? 'bg-red-100 text-red-600' : 'bg-white/90 text-gray-700 hover:text-amber-600'}`}
                            title={product.isActive === false ? "Yayına Al" : "Yayından Kaldır"}
                        >
                            {product.isActive === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                            onClick={() => onEdit(product)}
                            className="rounded-lg bg-white/90 p-2 text-gray-700 shadow-sm backdrop-blur-sm hover:text-amber-600"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onDelete(product.id)}
                            className="rounded-lg bg-white/90 p-2 text-red-500 shadow-sm backdrop-blur-sm hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                {product.badge && (
                    <span className="absolute left-10 top-2 rounded-md bg-amber-500 px-2 py-1 text-xs font-bold text-white shadow-sm">
                        {product.badge}
                    </span>
                )}
                {product.isActive === false && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                        <span className="rotate-[-12deg] rounded border-2 border-red-600 px-2 py-1 text-sm font-bold uppercase text-red-600 bg-white/50">Pasif</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="mb-2">
                    <code className="text-[10px] text-gray-400 bg-gray-50 px-1 rounded border border-gray-100 font-mono select-all block w-fit mb-1">
                        ID: {product.id}
                    </code>
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900">{product.name}</h3>
                        <div className="flex flex-col items-end">
                            {product.discountPrice ? (
                                <>
                                    <span className="text-xs text-gray-400 line-through">₺{product.price}</span>
                                    <span className="text-lg font-bold text-amber-600">₺{product.discountPrice}</span>
                                </>
                            ) : (
                                <span className="text-lg font-bold text-gray-900">₺{product.price}</span>
                            )}
                        </div>
                    </div>
                    <p className="line-clamp-2 text-xs text-gray-500 mt-1">{product.description}</p>

                    {/* Tags Preview */}
                    {product.tags && product.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {product.tags.map(tag => (
                                <span key={tag.id} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
