'use client';

import { useMenu } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Category } from '@/lib/data';
import { Loader2, Ban } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import IconComponent, { AVAILABLE_ICONS } from '@/components/IconComponent';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (category: Category) => void;
    category?: Category;
}

export function CategoryModal({ isOpen, onClose, onSave, category }: CategoryModalProps) {
    const { uploadImage } = useMenu();
    const [isUploading, setIsUploading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [iconSearch, setIconSearch] = useState('');

    const [formData, setFormData] = useState<Partial<Category>>({
        name: '',
        nameEn: '',
        image: '',
        description: '',
        badge: '',
        discountRate: undefined,
        icon: '',
        iconColor: '#ffffff',
        iconSize: 'medium'
    });

    useEffect(() => {
        setMounted(true);
    }, []);

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
                discountRate: undefined,
                icon: '',
                iconColor: '#ffffff',
                iconSize: 'medium'
            });
        }
    }, [category, isOpen]);

    // Aggressive scroll locking
    useEffect(() => {
        if (isOpen) {
            document.body.style.setProperty('overflow', 'hidden', 'important');
            document.documentElement.style.setProperty('overflow', 'hidden', 'important');
        } else {
            document.body.style.removeProperty('overflow');
            document.documentElement.style.removeProperty('overflow');
        }
        return () => {
            document.body.style.removeProperty('overflow');
            document.documentElement.style.removeProperty('overflow');
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Category);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex min-h-full items-center justify-center p-4">
                {/* Modal Container */}
                <div className="relative w-full max-w-3xl flex flex-col rounded-xl bg-white shadow-2xl my-4">

                    {/* Header - Fixed */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                {category ? 'Kategoriyi Düzenle' : 'Yeni Kategori Oluştur'}
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">Menü kategorilerinizi buradan yönetebilirsiniz.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                            <span className="sr-only">Kapat</span>
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-5">
                        <form id="category-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-5">

                            {/* LEFT COLUMN: Basic Info (Span 7) */}
                            <div className="md:col-span-7 space-y-4">
                                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
                                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <span className="w-1 h-4 bg-black rounded-full"></span>
                                        Temel Bilgiler
                                    </h3>

                                    <div className="grid gap-4">
                                        <div>
                                            <label className="mb-1 block text-xs font-bold text-gray-900">Kategori Adı</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-black focus:ring-1 focus:ring-black placeholder:text-gray-400 transition-all shadow-sm"
                                                placeholder="Örn: Başlangıçlar"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1 block text-xs font-bold text-gray-900 flex items-center gap-1">
                                                    <span>🇬🇧</span> İngilizce Adı
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.nameEn || ''}
                                                    onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black placeholder:text-gray-400 transition-all shadow-sm"
                                                    placeholder="Örn: Starters"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-bold text-gray-900">Rozet (Badge)</label>
                                                <input
                                                    type="text"
                                                    value={formData.badge || ''}
                                                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black placeholder:text-gray-400 transition-all shadow-sm"
                                                    placeholder="Örn: Yeni"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-bold text-gray-900">Açıklama / Slogan</label>
                                            <input
                                                type="text"
                                                value={formData.description || ''}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black placeholder:text-gray-400 transition-all shadow-sm"
                                                placeholder="Örn: Odun ateşinde pişen özel lezzetler"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
                                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <span className="w-1 h-4 bg-black rounded-full"></span>
                                        Görünüm Ayarları
                                    </h3>

                                    <div className="grid gap-4">
                                        <div>
                                            <label className="mb-1 block text-xs font-bold text-gray-900">Liste Modu</label>
                                            <select
                                                value={formData.layoutMode || 'grid'}
                                                onChange={e => setFormData({ ...formData, layoutMode: e.target.value as any })}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black shadow-sm"
                                            >
                                                <option value="grid">Standart Grid (Görsel + Kart)</option>
                                                <option value="list">Liste (Görselsiz + Varyasyon)</option>
                                                <option value="list-no-image">Minimal Liste (Sadece İsim)</option>
                                            </select>
                                            <p className="mt-1 text-[10px] text-gray-500 font-medium">Kategorideki ürünlerin nasıl listeleneceğini belirler.</p>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-bold text-gray-900">İndirim Oranı (%)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={formData.discountRate || ''}
                                                onChange={e => setFormData({ ...formData, discountRate: e.target.value ? parseInt(e.target.value) : undefined })}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black shadow-sm"
                                                placeholder="Tüm ürünlerde geçerli indirim"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Visuals (Span 5) */}
                            <div className="md:col-span-5 space-y-4">

                                {/* Icon Selection Block */}
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-bold text-gray-900">Kategori İkonu</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={formData.iconColor || '#ffffff'}
                                                onChange={e => setFormData({ ...formData, iconColor: e.target.value })}
                                                className="h-8 w-8 cursor-pointer rounded-lg border border-gray-200 p-1"
                                                title="İkon Rengi"
                                            />
                                            <select
                                                value={formData.iconSize || 'medium'}
                                                onChange={e => setFormData({ ...formData, iconSize: e.target.value as any })}
                                                className="h-8 rounded-lg border border-gray-200 text-xs font-bold text-gray-900 px-2 outline-none focus:border-black"
                                            >
                                                <option value="small">Küçük</option>
                                                <option value="medium">Orta</option>
                                                <option value="large">Büyük</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Icon Search */}
                                    <input
                                        type="text"
                                        value={iconSearch}
                                        onChange={(e) => setIconSearch(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-900 outline-none focus:border-black placeholder:text-gray-400"
                                        placeholder="İkon ara..."
                                    />

                                    <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                                        {/* No Icon Option */}
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon: '' })}
                                            className={cn(
                                                "aspect-square flex items-center justify-center rounded-xl transition-all duration-200",
                                                !formData.icon
                                                    ? "bg-red-50 text-red-600 ring-2 ring-offset-2 ring-red-500 shadow-sm"
                                                    : "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                            )}
                                            title="İkon Yok / Kaldır"
                                        >
                                            <Ban className="h-5 w-5" />
                                        </button>

                                        {AVAILABLE_ICONS.filter(i => i.toLowerCase().includes(iconSearch.toLowerCase())).map((iconName) => (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon: iconName })}
                                                className={cn(
                                                    "aspect-square flex items-center justify-center rounded-xl transition-all duration-200",
                                                    formData.icon === iconName
                                                        ? "bg-black text-white shadow-md scale-105 ring-2 ring-offset-2 ring-black"
                                                        : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                                                )}
                                            >
                                                <IconComponent name={iconName} className="h-5 w-5" />
                                            </button>
                                        ))}
                                    </div>

                                    <div className="pt-2 border-t border-gray-100">
                                        <p className="text-[10px] text-gray-400 mb-1">Manuel Giriş (veya URL)</p>
                                        <input
                                            type="text"
                                            value={formData.icon || ''}
                                            onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-black placeholder:text-gray-400"
                                            placeholder="örn: Pizza veya https://..."
                                        />
                                    </div>
                                </div>

                                {/* Background Image Block */}
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                                    <label className="block text-sm font-bold text-gray-900">Arkaplan Fotoğrafı</label>

                                    <div className="relative group overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100 aspect-video flex flex-col items-center justify-center text-center p-4">
                                        {formData.image ? (
                                            <>
                                                <img src={formData.image} alt="Preview" className="absolute inset-0 h-full w-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <p className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Değiştirmek için tıkla</p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="pointer-events-none">
                                                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                </div>
                                                <p className="text-xs font-medium text-gray-500">Görsel Yükle</p>
                                            </div>
                                        )}

                                        <input
                                            type="file"
                                            className="absolute inset-0 cursor-pointer opacity-0"
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
                                                        console.error(error);
                                                    } finally {
                                                        setIsUploading(false);
                                                    }
                                                }
                                            }}
                                        />
                                        {isUploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                                                <Loader2 className="h-6 w-6 animate-spin text-black" />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.image || ''}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-black placeholder:text-gray-400"
                                        placeholder="veya Görsel URL'si yapıştır..."
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer - Fixed */}
                    <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
                        >
                            Vazgeç
                        </button>
                        <button
                            type="submit"
                            form="category-form"
                            className="rounded-xl bg-black px-8 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-gray-900 hover:shadow-black/20 transition-all transform hover:-translate-y-0.5"
                        >
                            {category ? 'Değişiklikleri Kaydet' : 'Kategori Oluştur'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
