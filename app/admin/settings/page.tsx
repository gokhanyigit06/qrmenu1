
'use client';

import { useMenu } from '@/lib/store';
import * as Services from '@/lib/services';
import { Eye, EyeOff, Save, Upload } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const { settings, updateSettings, uploadImage } = useMenu();
    // Local state for editing before save, initialized with store settings
    // But since store updates are instant in this app architecture, we can use local state and save to store on "Save".
    // Or just bind directly. For 'Save' button feeling, let's use local state.
    const [localSettings, setLocalSettings] = useState(settings);
    const [isUploading, setIsUploading] = useState(false);

    // Password Update State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingPass, setLoadingPass] = useState(false);

    const handleChangePassword = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            alert('Şifreler uyuşmuyor veya boş!');
            return;
        }

        // Get Restaurant ID safely
        let targetId = (settings as any).restaurantId;
        if (!targetId) {
            const session = localStorage.getItem('qr_admin_session');
            if (session) {
                try { targetId = JSON.parse(session).restaurantId; } catch { }
            }
        }

        if (!targetId) {
            alert('Hata: Oturum bilgisi bulunamadı.');
            return;
        }

        setLoadingPass(true);
        try {
            await Services.updateRestaurantPassword(targetId, newPassword);
            alert('Şifreniz güncellendi.');
            setNewPassword('');
            setConfirmPassword('');
        } catch (e) {
            console.error(e);
            alert('Şifre güncellenemedi.');
        } finally {
            setLoadingPass(false);
        }
    };

    // Sync local state if context changes (e.g. initial load)
    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleImageUpload = async (file: File, field: 'logoUrl' | 'defaultProductImage') => {
        if (!file) return;
        setIsUploading(true);
        try {
            const url = await uploadImage(file);
            setLocalSettings(prev => ({ ...prev, [field]: url }));
        } catch (error) {
            alert('Resim yüklenirken hata oluştu.');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleToggle = (key: 'bannerActive' | 'popupActive' | 'darkMode') => {
        setLocalSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChange = (key: 'bannerUrls' | 'popupUrl' | 'themeColor' | 'logoUrl' | 'logoWidth' | 'defaultProductImage', value: string | string[] | number) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleBannerUrlChange = (index: number, value: string) => {
        const newUrls = [...localSettings.bannerUrls];
        newUrls[index] = value;
        setLocalSettings(prev => ({ ...prev, bannerUrls: newUrls }));
    };

    const addBannerUrl = () => {
        if (localSettings.bannerUrls.length < 5) {
            setLocalSettings(prev => ({ ...prev, bannerUrls: [...prev.bannerUrls, ''] }));
        }
    };

    const removeBannerUrl = (index: number) => {
        const newUrls = localSettings.bannerUrls.filter((_, i) => i !== index);
        setLocalSettings(prev => ({ ...prev, bannerUrls: newUrls }));
    };

    const handleSave = async () => {
        try {
            await updateSettings(localSettings);
            alert("Ayarlar başarıyla kaydedildi.");
        } catch (error) {
            console.error(error);
            alert("Ayarlar kaydedilirken hata oluştu! Geliştirici konsolunu kontrol edin.");
        }
    };

    // Theme Colors
    const themeColors = [
        { name: 'Siyah (Varsayılan)', value: 'black', class: 'bg-black' },
        { name: 'Beyaz', value: 'white', class: 'bg-white border border-gray-200' },
        { name: 'Mavi', value: 'blue', class: 'bg-blue-600' },
        { name: 'Turuncu', value: 'orange', class: 'bg-orange-500' },
        { name: 'Kırmızı', value: 'red', class: 'bg-red-600' },
        { name: 'Yeşil', value: 'green', class: 'bg-green-600' },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Görünüm Ayarları</h1>
                <p className="text-sm text-gray-500">Müşteri arayüzünü, bannerları ve temayı yönetin.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Theme Settings */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Tema ve Renkler</h3>
                        <p className="text-sm text-gray-500">Menünüzün genel renk temasını belirleyin.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-3 block text-sm font-bold text-gray-700">Ana Renk</label>
                            <div className="flex flex-wrap gap-3">
                                {themeColors.map(color => (
                                    <button
                                        key={color.value}
                                        onClick={() => handleChange('themeColor', color.value)}
                                        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${localSettings.themeColor === color.value ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                                        title={color.name}
                                    >
                                        <div className={`h-8 w-8 rounded-full shadow-sm ${color.class}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4 border border-gray-100">
                            <div>
                                <h4 className="font-bold text-gray-900">Koyu Mod (Dark Mode)</h4>
                                <p className="text-xs text-gray-500">Müşteriler için koyu tema seçeneğini aktif et.</p>
                            </div>
                            <button
                                onClick={() => handleToggle('darkMode')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${localSettings.darkMode ? 'bg-black' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition shadow duration-200 ease-in-out ${localSettings.darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Logo Settings */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Logo Ayarları</h3>
                        <p className="text-sm text-gray-500">Menü başlığında görünecek işletme logosu.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="relative flex h-32 w-full md:w-32 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
                            {localSettings.logoUrl ? (
                                <img
                                    src={localSettings.logoUrl}
                                    alt="Logo Preview"
                                    className="max-h-full max-w-full object-contain p-2"
                                />
                            ) : (
                                <div className="text-center text-xs text-gray-400">
                                    <Upload className="mx-auto mb-1 h-5 w-5 opacity-50" />
                                    Logo Yok
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Logo URL</label>
                                <input
                                    type="text"
                                    value={localSettings.logoUrl || ''}
                                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Genişlik (px)</label>
                                <input
                                    type="number"
                                    value={localSettings.logoWidth || 150}
                                    onChange={(e) => handleChange('logoWidth', parseInt(e.target.value) || 150)}
                                    className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    placeholder="150"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Default Product Image Settings */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Varsayılan Ürün Görseli</h3>
                        <p className="text-sm text-gray-500">Resmi olmayan ürünler için gösterilecek standart görsel.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 group">
                            {localSettings.defaultProductImage ? (
                                <img
                                    src={localSettings.defaultProductImage}
                                    alt="Default Product Preview"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="text-center text-xs text-gray-400">
                                    <Upload className="mx-auto mb-1 h-5 w-5 opacity-50" />
                                    Görsel Yok
                                </div>
                            )}

                            <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'defaultProductImage')}
                                />
                            </label>

                            {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-amber-600" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Görsel URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={localSettings.defaultProductImage || ''}
                                        onChange={(e) => handleChange('defaultProductImage', e.target.value)}
                                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                        placeholder="https://..."
                                    />
                                    <label className="cursor-pointer rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                                        Yükle
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'defaultProductImage')}
                                        />
                                    </label>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Bilgisayarınızdan yüklemek için "Yükle" butonunu kullanın veya kutuya tıklayın.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Banner Settings */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Ana Sayfa Banner</h3>
                            <p className="text-sm text-gray-500">Kaydırmalı kampanya görselleri.</p>
                        </div>
                        <button
                            onClick={() => handleToggle('bannerActive')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${localSettings.bannerActive ? 'bg-amber-500' : 'bg-gray-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition shadow duration-200 ease-in-out ${localSettings.bannerActive ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100 border border-gray-200 group">
                            {localSettings.bannerUrls && localSettings.bannerUrls.length > 0 && localSettings.bannerUrls[0] ? (
                                <Image
                                    src={localSettings.bannerUrls[0]}
                                    alt="Banner Preview"
                                    fill
                                    className={`object-cover transition-opacity ${localSettings.bannerActive ? 'opacity-100' : 'opacity-50 grayscale'}`}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                    Görsel Yok
                                </div>
                            )}
                            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-md">
                                {localSettings.bannerUrls.length} Slayt
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Görsel URL'leri</label>
                            {localSettings.bannerUrls.map((url, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={url || ''}
                                        onChange={(e) => handleBannerUrlChange(index, e.target.value)}
                                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                        placeholder="https://..."
                                    />
                                    {localSettings.bannerUrls.length > 1 && (
                                        <button
                                            onClick={() => removeBannerUrl(index)}
                                            className="rounded-lg bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100"
                                        >
                                            Sil
                                        </button>
                                    )}
                                </div>
                            ))}
                            {localSettings.bannerUrls.length < 5 && (
                                <button
                                    onClick={addBannerUrl}
                                    className="text-sm text-amber-600 font-medium hover:underline"
                                >
                                    + Yeni Slayt Ekle
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Promo Popup Settings */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Açılır Pop-up</h3>
                            <p className="text-sm text-gray-500">Açılışta görünen tam ekran reklam.</p>
                        </div>
                        <button
                            onClick={() => handleToggle('popupActive')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${localSettings.popupActive ? 'bg-amber-500' : 'bg-gray-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition shadow duration-200 ease-in-out ${localSettings.popupActive ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="relative aspect-square w-1/2 mx-auto overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
                            {localSettings.popupUrl ? (
                                <Image
                                    src={localSettings.popupUrl}
                                    alt="Popup Preview"
                                    fill
                                    className={`object-cover transition-opacity ${localSettings.popupActive ? 'opacity-100' : 'opacity-50 grayscale'}`}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                    Önizleme Yok
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Görsel URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={localSettings.popupUrl || ''}
                                    onChange={(e) => handleChange('popupUrl', e.target.value)}
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 shadow-sm lg:col-span-2">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Hesap Güvenliği</h3>
                        <p className="text-sm text-gray-500">Yönetici şifrenizi buradan değiştirebilirsiniz.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-bold text-gray-700">Yeni Şifre</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                placeholder="******"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-bold text-gray-700">Yeni Şifre (Tekrar)</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                placeholder="******"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleChangePassword}
                            disabled={!newPassword || newPassword !== confirmPassword || loadingPass}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {loadingPass ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200 lg:col-span-2">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-bold text-white hover:bg-gray-800 transition-transform active:scale-95"
                    >
                        <Save className="h-4 w-4" />
                        Değişiklikleri Kaydet
                    </button>
                </div>
            </div>
        </div>
    );
}
