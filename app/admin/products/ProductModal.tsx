import { useMenu } from '@/lib/store';
import { cn } from '@/lib/utils';

import { Product, ProductTag } from '@/lib/data';
import { ALLERGENS } from '@/lib/allergens';
import { Flame, Leaf, Wheat, Loader2, Trash2, Plus } from 'lucide-react';
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
        allergens: [],
        variants: [],
    });

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (product) {
            setFormData(product);
        } else {
            setFormData({
                name: '',
                nameEn: '',
                description: '',
                descriptionEn: '',
                price: undefined,
                discountPrice: undefined,
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
                categoryId: categories[0]?.id || '',
                tags: [],
                allergens: [],
                variants: [],
            });
        }
    }, [product, isOpen, categories]);

    if (!isOpen) return null;

    // ... (toggleTag same)

    // ... (handleSubmit same)

    // ... (render)


    const addVariant = () => {
        const currentVariants = formData.variants || [];
        setFormData({ ...formData, variants: [...currentVariants, { name: '', price: 0 }] });
    };

    const removeVariant = (index: number) => {
        const currentVariants = formData.variants || [];
        setFormData({ ...formData, variants: currentVariants.filter((_, i) => i !== index) });
    };

    const updateVariant = (index: number, field: 'name' | 'price', value: string | number) => {
        const currentVariants = [...(formData.variants || [])];
        if (field === 'price') value = parseFloat(value as string) || 0;

        currentVariants[index] = { ...currentVariants[index], [field]: value };
        setFormData({ ...formData, variants: currentVariants });
    };

    const toggleTag = (tag: ProductTag) => {
        const currentTags = formData.tags || [];
        const exists = currentTags.find((t) => t.id === tag.id);

        if (exists) {
            setFormData({ ...formData, tags: currentTags.filter((t) => t.id !== tag.id) });
        } else {
            setFormData({ ...formData, tags: [...currentTags, tag] });
        }
    };

    const toggleAllergen = (allergenId: string) => {
        const currentAllergens = formData.allergens || [];
        const exists = currentAllergens.includes(allergenId);

        if (exists) {
            setFormData({ ...formData, allergens: currentAllergens.filter(id => id !== allergenId) });
        } else {
            setFormData({ ...formData, allergens: [...currentAllergens, allergenId] });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Product);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="flex flex-col w-full max-w-5xl rounded-2xl bg-white shadow-2xl max-h-[90vh]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                    <h2 className="text-lg font-bold text-gray-900">
                        {product ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <span className="sr-only">Kapat</span>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        <div className="grid gap-6 md:grid-cols-12 h-full">
                            {/* Left Column: Product Info (7 cols) */}
                            <div className="md:col-span-7 space-y-4">
                                {/* Row 1: Names */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-0.5 block text-xs font-medium text-gray-700">Ürün Adı</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-0.5 block text-xs font-medium text-gray-700 flex items-center gap-1">
                                            <span>🇬🇧</span> İngilizce Adı
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.nameEn || ''}
                                            onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black bg-gray-50 text-gray-900"
                                            placeholder="Opsiyonel"
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Prices */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-0.5 block text-xs font-medium text-gray-700">Fiyat</label>
                                        <div className="relative">
                                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₺</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.price === undefined || formData.price === null ? '' : formData.price}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    const newPrice = val === '' ? undefined : parseFloat(val);
                                                    setFormData({ ...formData, price: newPrice });
                                                }}
                                                placeholder="0.00"
                                                className="w-full rounded-lg border border-gray-300 pl-7 pr-2 py-1.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black text-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-0.5 block text-xs font-medium text-gray-700">İndirimli Fiyat</label>
                                        <div className="relative">
                                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₺</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.discountPrice || ''}
                                                onChange={e => setFormData({ ...formData, discountPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                                                className="w-full rounded-lg border border-gray-300 pl-7 pr-2 py-1.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black text-gray-900"
                                                placeholder="Opsiyonel"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 3: Category & Badge & Active */}
                                <div className="grid grid-cols-12 gap-3">
                                    <div className="col-span-12 sm:col-span-5">
                                        <label className="mb-0.5 block text-xs font-medium text-gray-700">Kategori</label>
                                        <select
                                            value={formData.categoryId}
                                            onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black text-gray-900"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-8 sm:col-span-4">
                                        <label className="mb-0.5 block text-xs font-medium text-gray-700">Etiket</label>
                                        <select
                                            value={formData.badge || ''}
                                            onChange={e => setFormData({ ...formData, badge: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black text-gray-900"
                                        >
                                            <option value="">Yok</option>
                                            <option value="Çok Satan">Çok Satan</option>
                                            <option value="Yeni">Yeni</option>
                                            <option value="Şefin Seçimi">Şefin Seçimi</option>
                                            <option value="Fırsat">Fırsat</option>
                                        </select>
                                    </div>
                                    <div className="col-span-4 sm:col-span-3 flex items-end pb-2">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.isActive !== false}
                                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                            />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                            <span className="ms-2 text-xs font-medium text-gray-700">Aktif</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Row 4: Descriptions (Reduced Rows) */}
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-0.5 block text-xs font-medium text-gray-700">Açıklama</label>
                                        <textarea
                                            rows={2}
                                            value={formData.description || ''}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black text-gray-900 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-0.5 block text-xs font-medium text-gray-700 flex items-center gap-1">
                                            <span>🇬🇧</span> İngilizce Açıklama
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={formData.descriptionEn || ''}
                                            onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black bg-gray-50 text-gray-900 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Image & Extras (5 cols) */}
                            <div className="md:col-span-5 space-y-4 border-l border-gray-100 md:pl-6">
                                {/* Compact Image Uploader */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">Görsel</label>
                                    <div className="flex gap-3 h-20">
                                        {/* Preview or Placeholder */}
                                        <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 group">
                                            {formData.image ? (
                                                <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-gray-300">
                                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                </div>
                                            )}
                                            {formData.image && (
                                                <button type="button" onClick={() => setFormData({ ...formData, image: '' })} className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-3 w-3" /></button>
                                            )}
                                        </div>

                                        {/* Input Area */}
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Görsel URL..."
                                                value={formData.image || ''}
                                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                                                className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs outline-none focus:border-black"
                                            />
                                            <label className={cn("flex items-center justify-center w-full h-8 border border-gray-300 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 text-xs text-gray-500 transition-colors gap-2", isUploading && "opacity-50")}>
                                                {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
                                                <span>Bilgisayardan Yükle</span>
                                                <input type="file" className="hidden" accept="image/*" disabled={isUploading} onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setIsUploading(true);
                                                        try {
                                                            const url = await uploadImage(file);
                                                            setFormData(prev => ({ ...prev, image: url }));
                                                        } catch (error) { console.error(error); alert("Hata oluştu."); } finally { setIsUploading(false); }
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Features & Allocations Compact */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">Özellikler</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {availableTags.map(tag => {
                                            const isSelected = formData.tags?.some(t => t.id === tag.id);
                                            return (
                                                <button key={tag.id} type="button" onClick={() => toggleTag(tag)} className={cn("flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium border transition-colors", isSelected ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300")}>
                                                    {tag.icon === 'pepper' && <Flame className="h-2.5 w-2.5" />}
                                                    {tag.icon === 'leaf' && <Leaf className="h-2.5 w-2.5" />}
                                                    {tag.icon === 'wheat' && <Wheat className="h-2.5 w-2.5" />}
                                                    {tag.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">Alerjenler</label>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {ALLERGENS.map(allergen => {
                                            const isSelected = formData.allergens?.includes(allergen.id);
                                            const Icon = allergen.icon;
                                            return (
                                                <button key={allergen.id} type="button" onClick={() => toggleAllergen(allergen.id)} className={cn("flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] font-medium border text-left transition-colors", isSelected ? "bg-amber-50 text-amber-900 border-amber-200" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
                                                    <Icon className={cn("h-3 w-3 shrink-0", allergen.color)} />
                                                    <span className="truncate">{allergen.nameTr}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-medium text-gray-700">Varyantlar</label>
                                        <button type="button" onClick={addVariant} className="text-[10px] text-blue-600 hover:underline font-medium">+ Ekle</button>
                                    </div>
                                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                        {(formData.variants || []).map((variant, index) => (
                                            <div key={index} className="flex gap-1.5 items-center">
                                                <input
                                                    type="text"
                                                    placeholder="İsim"
                                                    value={variant.name}
                                                    onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                                    className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs outline-none focus:border-black text-gray-900"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Fiyat"
                                                    value={variant.price}
                                                    onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                                    className="w-16 rounded-md border border-gray-300 px-2 py-1 text-xs outline-none focus:border-black text-right text-gray-900"
                                                />
                                                <button type="button" onClick={() => removeVariant(index)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="h-3 w-3" /></button>
                                            </div>
                                        ))}
                                        {(formData.variants?.length === 0) && <div className="text-[10px] text-gray-400 italic">Varyant eklenmedi.</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-black px-6 py-2 text-sm font-bold text-white hover:bg-gray-800 shadow-lg shadow-black/10 transition-all active:scale-95"
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
