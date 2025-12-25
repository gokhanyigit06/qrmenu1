import { useMenu } from '@/lib/store';
import { cn } from '@/lib/utils';

import { Product, ProductTag } from '@/lib/data';
import { Flame, Leaf, Wheat, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// ... (comments)

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => void;
    product?: Product;
}

const availableTags: ProductTag[] = [
    { id: '1', name: 'Acılı', icon: 'pepper', color: 'bg-red-50 text-red-600' },
    { id: '2', name: 'Vegan', icon: 'leaf', color: 'bg-green-50 text-green-600' },
    { id: '3', name: 'Glutensiz', icon: 'wheat', color: 'bg-amber-50 text-amber-600' },
];

function ProductModal({ isOpen, onClose, onSave, product }: ProductModalProps) {
    const { categories, uploadImage } = useMenu();
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        nameEn: '',
        description: '',
        descriptionEn: '',
        price: 0,
        discountPrice: undefined,
        image: '',
        categoryId: '',
        tags: [],
    });

    useEffect(() => {
        if (product) {
            setFormData(product);
        } else {
            setFormData({
                name: '',
                nameEn: '',
                description: '',
                descriptionEn: '',
                price: 0,
                discountPrice: undefined,
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
                categoryId: categories[0]?.id || '',
                tags: [],
            });
        }
    }, [product, isOpen, categories]);

    if (!isOpen) return null;

    // ... (toggleTag same)

    // ... (handleSubmit same)

    // ... (render)


    const toggleTag = (tag: ProductTag) => {
        const currentTags = formData.tags || [];
        const exists = currentTags.find((t) => t.id === tag.id);

        if (exists) {
            setFormData({ ...formData, tags: currentTags.filter((t) => t.id !== tag.id) });
        } else {
            setFormData({ ...formData, tags: [...currentTags, tag] });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Product);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        {product ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100"
                    >
                        <span className="sr-only">Kapat</span>
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Left Column */}
                        <div className="space-y-4">

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Ürün Adı</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 flex items-center gap-1">
                                    <span>🇬🇧</span> Ürün Adı (İngilizce)
                                </label>
                                <input
                                    type="text"
                                    value={formData.nameEn || ''}
                                    onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black bg-gray-50"
                                    placeholder="Opsiyonel (English Name)"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Açıklama</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 flex items-center gap-1">
                                    <span>🇬🇧</span> Açıklama (İngilizce)
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.descriptionEn || ''}
                                    onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black bg-gray-50"
                                    placeholder="Opsiyonel (English Description)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Fiyat</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={e => {
                                                const newPrice = parseFloat(e.target.value);
                                                setFormData({ ...formData, price: newPrice });
                                            }}
                                            className="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">İndirimli Fiyat</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.discountPrice || ''}
                                            onChange={e => setFormData({ ...formData, discountPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                                            className="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black"
                                            placeholder="Opsiyonel"
                                        />
                                    </div>
                                    {/* Quick Discount Calculator */}
                                    {(formData.price || 0) > 0 && (
                                        <div className="mt-2 flex gap-2">
                                            {[10, 20, 50].map(rate => (
                                                <button
                                                    key={rate}
                                                    type="button"
                                                    onClick={() => {
                                                        const currentPrice = formData.price || 0;
                                                        const discount = currentPrice * (rate / 100);
                                                        setFormData({ ...formData, discountPrice: currentPrice - discount });
                                                    }}
                                                    className="px-2 py-1 text-[10px] bg-red-50 text-red-600 rounded border border-red-100 hover:bg-red-100"
                                                >
                                                    %{rate} İndirim
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Etiket (Badge)</label>
                                    <select
                                        value={formData.badge || ''}
                                        onChange={e => setFormData({ ...formData, badge: e.target.value || undefined })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black"
                                    >
                                        <option value="">Yok</option>
                                        <option value="Çok Satan">Çok Satan</option>
                                        <option value="Yeni">Yeni</option>
                                        <option value="Şefin Seçimi">Şefin Seçimi</option>
                                        <option value="Fırsat">Fırsat</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-3 pt-6">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.isActive !== false}
                                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                        <span className="ms-3 text-sm font-medium text-gray-700">Yayında</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Kategori</label>
                                <select
                                    value={formData.categoryId}
                                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Görsel</label>
                                <div className="space-y-3">
                                    {/* URL Input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Görsel URL..."
                                            value={formData.image}
                                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black text-sm"
                                        />
                                    </div>

                                    {/* OR Separator */}
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-gray-200" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white px-2 text-gray-500">veya bilgisayardan yükle</span>
                                        </div>
                                    </div>

                                    {/* File Input */}
                                    <div className="flex items-center justify-center w-full flex-col">
                                        <label className={cn(
                                            "flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors",
                                            isUploading && "opacity-50 cursor-not-allowed"
                                        )}>
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                                </svg>
                                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Yüklemek için tıkla</span></p>
                                                <p className="text-xs text-gray-500">PNG, JPG or WEBP</p>
                                            </div>
                                            <input
                                                id="dropzone-file"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                disabled={isUploading}
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setIsUploading(true);
                                                        try {
                                                            const url = await uploadImage(file);
                                                            setFormData(prev => ({ ...prev, image: url }));
                                                        } catch (error) {
                                                            console.error("Upload failed", error);
                                                            alert("Resim yüklenirken hata oluştu.");
                                                        } finally {
                                                            setIsUploading(false);
                                                        }
                                                    }
                                                }}
                                            />
                                        </label>
                                        {isUploading && (
                                            <div className="text-xs text-center text-blue-600 mt-2 flex items-center justify-center gap-1">
                                                <Loader2 className="h-3 w-3 animate-spin" /> Yükleniyor...
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {formData.image && (
                                    <div className="mt-4 relative h-40 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 group">
                                        <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image: '' })}
                                            className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-gray-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Özellikler / Alerjenler</label>
                                <div className="flex flex-wrap gap-2">
                                    {availableTags.map(tag => {
                                        const isSelected = formData.tags?.some(t => t.id === tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => toggleTag(tag)}
                                                className={cn(
                                                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                                                    isSelected
                                                        ? "bg-black text-white border-black"
                                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                                )}
                                            >
                                                {tag.icon === 'pepper' && <Flame className="h-3 w-3" />}
                                                {tag.icon === 'leaf' && <Leaf className="h-3 w-3" />}
                                                {tag.icon === 'wheat' && <Wheat className="h-3 w-3" />}
                                                {tag.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            {product ? 'Güncelle' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export { ProductModal }
