import { useMenu } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Category } from '@/lib/data';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (category: Category) => void;
    category?: Category;
}

export function CategoryModal({ isOpen, onClose, onSave, category }: CategoryModalProps) {
    const { uploadImage } = useMenu();
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState<Partial<Category>>({
        name: '',
        nameEn: '',
        image: '',
        description: '',
        badge: '',
        discountRate: undefined
    });

    useEffect(() => {
        if (category) {
            setFormData(category);
        } else {
            setFormData({
                name: '',
                nameEn: '',
                image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
                description: '',
                badge: '',
                discountRate: undefined
            });
        }
    }, [category, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Category);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        {category ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100"
                    >
                        <span className="sr-only">Kapat</span>
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Kategori Adı</label>
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
                            <span>🇬🇧</span> Kategori Adı (İngilizce)
                        </label>
                        <input
                            type="text"
                            value={formData.nameEn || ''}
                            onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black bg-gray-50"
                            placeholder="Opsiyonel"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Açıklama / Slogan</label>
                        <input
                            type="text"
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black"
                            placeholder="Örn: Odun ateşinde pişen lezzetler"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Görünüm Modu</label>
                        <select
                            value={formData.layoutMode || 'grid'}
                            onChange={e => setFormData({ ...formData, layoutMode: e.target.value as any })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black"
                        >
                            <option value="grid">Standart (Görsel + Kart)</option>
                            <option value="list">Liste (Görselsiz + Varyasyonlu)</option>
                            <option value="list-no-image">Minimal (Görselsiz + Sade)</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            {formData.layoutMode === 'list'
                                ? 'Şarap/İçecek menüsü için uygundur. Ürün adı ve varyasyonlar alt alta listelenir.'
                                : formData.layoutMode === 'list-no-image'
                                    ? 'Kokteyl menüsü için uygundur. Sadece isim ve fiyat görünür.'
                                    : 'Standart yemek menüsü görünümü.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">İndirim Oranı (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.discountRate || ''}
                                onChange={e => setFormData({ ...formData, discountRate: e.target.value ? parseInt(e.target.value) : undefined })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black"
                                placeholder="Örn: 20"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Rozet (Badge)</label>
                            <input
                                type="text"
                                value={formData.badge || ''}
                                onChange={e => setFormData({ ...formData, badge: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black"
                                placeholder="Örn: Yeni"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Arkaplan Görseli</label>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black text-sm"
                                    placeholder="Görsel URL..."
                                />
                            </div>

                            {/* File Input */}
                            <div className="flex items-center justify-center w-full flex-col">
                                <label className={cn(
                                    "flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors",
                                    isUploading && "opacity-50 cursor-not-allowed"
                                )}>
                                    <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                        <p className="mb-1 text-xs text-gray-500"><span className="font-semibold">Yüklemek için tıkla</span></p>
                                        <p className="text-[10px] text-gray-400">PNG, JPG or WEBP</p>
                                    </div>
                                    <input
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

                            {formData.image && (
                                <div className="mt-2 relative h-32 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                    <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                                </div>
                            )}
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
                            {category ? 'Güncelle' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
