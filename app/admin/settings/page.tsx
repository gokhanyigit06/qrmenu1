
'use client';

import { useMenu } from '@/lib/store';
import * as Services from '@/lib/services';
import { Eye, EyeOff, Save, Upload, Globe } from 'lucide-react';
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

    // --- DOMAIN LOGIC ---
    const [domain, setDomain] = useState('');
    const [loadingDomain, setLoadingDomain] = useState(false);

    useEffect(() => {
        const loadDomain = async () => {
            const session = localStorage.getItem('qr_admin_session');
            if (!session) return;
            try {
                const data = JSON.parse(session);
                if (data.slug) {
                    const r = await Services.getRestaurantBySlug(data.slug);
                    if (r && r.custom_domain) setDomain(r.custom_domain);
                }
            } catch (e) { console.error(e); }
        };
        loadDomain();
    }, []);

    const handleDomainSave = async () => {
        const session = localStorage.getItem('qr_admin_session');
        if (!session) return;

        const confirm = window.confirm('Bu domain için DNS ayarlarını (CNAME) yaptığınızdan emin misiniz? Yanlış ayar menünüzün çalışmamasına neden olabilir.');
        if (!confirm) return;

        try {
            setLoadingDomain(true);
            const data = JSON.parse(session);
            const rId = data.restaurantId || data.id;
            await Services.updateRestaurantDomain(rId, domain);
            alert('Domain başarıyla kaydedildi! CNAME yönlendirmesinin aktif olması biraz zaman alabilir.');
        } catch (e) {
            console.error(e);
            alert('Hata: Bu domain başka bir restoran tarafından kullanılıyor olabilir veya geçersiz.');
        } finally {
            setLoadingDomain(false);
        }
    };

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

    const handleChange = (key: string, value: string | string[] | number) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleBannerUrlChange = (index: number, value: string) => {
        const newUrls = [...localSettings.bannerUrls];
        newUrls[index] = value;
        setLocalSettings(prev => ({ ...prev, bannerUrls: newUrls }));
    };

    const handleMobileBannerUrlChange = (index: number, value: string) => {
        const newUrls = [...(localSettings.mobileBannerUrls || [])];
        // Ensure array is long enough, though addBannerUrl should handle this, strictly speaking safer here
        while (newUrls.length <= index) newUrls.push('');
        newUrls[index] = value;
        setLocalSettings(prev => ({ ...prev, mobileBannerUrls: newUrls }));
    };

    const handleBannerUpload = async (file: File, index: number, type: 'desktop' | 'mobile') => {
        if (!file) return;
        setIsUploading(true);
        try {
            const url = await uploadImage(file);
            if (type === 'desktop') {
                handleBannerUrlChange(index, url);
            } else {
                handleMobileBannerUrlChange(index, url);
            }
        } catch (error) {
            alert('Resim yüklenirken hata oluştu.');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const addBannerUrl = () => {
        if (localSettings.bannerUrls.length < 5) {
            setLocalSettings(prev => ({
                ...prev,
                bannerUrls: [...prev.bannerUrls, ''],
                mobileBannerUrls: [...(prev.mobileBannerUrls || []), '']
            }));
        }
    };

    const removeBannerUrl = (index: number) => {
        const newUrls = localSettings.bannerUrls.filter((_, i) => i !== index);
        const newMobileUrls = (localSettings.mobileBannerUrls || []).filter((_, i) => i !== index);
        setLocalSettings(prev => ({ ...prev, bannerUrls: newUrls, mobileBannerUrls: newMobileUrls }));
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
                        <h3 className="text-lg font-bold text-gray-900">Görünüm & Tema</h3>
                        <p className="text-sm text-gray-500">Menünüzün genel renk, font ve stilini belirleyin.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Theme Color */}
                        <div>
                            <label className="mb-3 block text-sm font-bold text-gray-700">Ana Renk</label>
                            <div className="flex flex-wrap gap-3">
                                {themeColors.map(color => (
                                    <button
                                        key={color.value}
                                        onClick={() => handleChange('themeColor', color.value)}
                                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${localSettings.themeColor === color.value ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                                        title={color.name}
                                    >
                                        <div className={`h-6 w-6 rounded-full shadow-sm ${color.class}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Font Family Selection */}
                        <div>
                            <label className="mb-3 block text-sm font-bold text-gray-700">Yazı Fontu</label>
                            <select
                                value={localSettings.fontFamily || 'Inter'}
                                onChange={(e) => handleChange('fontFamily', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            >
                                <option value="Inter">Inter (Standart Modern)</option>
                                <option value="Roboto">Roboto (Android Tarzı)</option>
                                <option value="Lato">Lato (Yuvarlak & Samimi)</option>
                                <option value="Montserrat">Montserrat (Geometrik & Şık)</option>
                                <option value="Open Sans">Open Sans (Okunaklı)</option>
                                <option value="Playfair Display">Playfair Display (Serif & Zarif)</option>
                                <option value="Merriweather">Merriweather (Klasik Serif)</option>
                                <option value="Oswald">Oswald (Dik & Sıkışık)</option>
                                <option value="Raleway">Raleway (İnce & Modern)</option>
                            </select>
                        </div>

                        {/* Dark Mode */}
                        <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4 border border-gray-100 h-full">
                            <div>
                                <h4 className="font-bold text-gray-900">Koyu Mod</h4>
                                <p className="text-xs text-gray-500">Müşteriler için koyu tema seçeneği.</p>
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

                {/* Category Styling Settings */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Kategori Görünümü</h3>
                        <p className="text-sm text-gray-500">Müşteri menüsündeki kategorilerin boyut ve yerleşim ayarları.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Font Size */}
                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">Başlık Boyutu</label>
                            <div className="flex gap-2">
                                {['medium', 'large', 'xl'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => handleChange('categoryFontSize', size as any)}
                                        className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all ${localSettings.categoryFontSize === size
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {size === 'medium' ? 'Orta' : size === 'large' ? 'Büyük' : 'Çok Büyük'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Font Weight */}
                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">Başlık Kalınlığı</label>
                            <div className="flex gap-2">
                                {['normal', 'bold', 'black'].map((weight) => (
                                    <button
                                        key={weight}
                                        onClick={() => handleChange('categoryFontWeight', weight as any)}
                                        className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all ${localSettings.categoryFontWeight === weight
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {weight === 'normal' ? 'Normal' : weight === 'bold' ? 'Kalın' : 'Extra Kalın'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Row Height */}
                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">Kategori Yüksekliği</label>
                            <div className="flex gap-2">
                                {['small', 'medium', 'large'].map((height) => (
                                    <button
                                        key={height}
                                        onClick={() => handleChange('categoryRowHeight', height as any)}
                                        className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all ${localSettings.categoryRowHeight === height
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {height === 'small' ? 'İnce' : height === 'medium' ? 'Orta' : 'Geniş'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Gap */}
                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">Boşluklar</label>
                            <div className="flex gap-2">
                                {['small', 'medium', 'large'].map((gap) => (
                                    <button
                                        key={gap}
                                        onClick={() => handleChange('categoryGap', gap as any)}
                                        className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all ${localSettings.categoryGap === gap
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {gap === 'small' ? 'Az' : gap === 'medium' ? 'Normal' : 'Seyrek'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Overlay Opacity */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="mb-2 flex justify-between text-sm font-bold text-gray-700">
                                <span>Görsel Karartma (Overlay)</span>
                                <span className="text-gray-500 font-normal">%{localSettings.categoryOverlayOpacity ?? 50}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="90"
                                step="10"
                                value={localSettings.categoryOverlayOpacity ?? 50}
                                onChange={(e) => handleChange('categoryOverlayOpacity', parseInt(e.target.value))}
                                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-black"
                            />
                            <div className="mt-1 flex justify-between text-xs text-gray-400">
                                <span>Yok (Aydınlık)</span>
                                <span>Koyu</span>
                            </div>
                        </div>

                    </div>
                </div>



                {/* Product Card Styling */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Ürün Kartı Görünümü</h3>
                        <p className="text-sm text-gray-500">Ürün listesindeki kartların yazı tipi ve renk ayarları.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                        {/* Product Title Styling */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-gray-900">Ürün Başlığı</label>

                            {/* Color */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={localSettings.productTitleColor || '#111827'}
                                    onChange={(e) => handleChange('productTitleColor', e.target.value)}
                                    className="h-8 w-8 cursor-pointer rounded border-0 p-0"
                                />
                                <span className="text-sm text-gray-500 font-mono">{localSettings.productTitleColor || '#111827'}</span>
                            </div>

                            {/* Size */}
                            <div className="flex gap-2">
                                {['medium', 'large', 'xl'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => handleChange('productTitleSize', size as any)}
                                        className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-all ${localSettings.productTitleSize === size
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {size === 'medium' ? 'Normal' : size === 'large' ? 'Büyük' : 'XL'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Description Styling */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-gray-900">Açıklama Metni</label>

                            {/* Color */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={localSettings.productDescriptionColor || '#6b7280'}
                                    onChange={(e) => handleChange('productDescriptionColor', e.target.value)}
                                    className="h-8 w-8 cursor-pointer rounded border-0 p-0"
                                />
                                <span className="text-sm text-gray-500 font-mono">{localSettings.productDescriptionColor || '#6b7280'}</span>
                            </div>

                            {/* Size */}
                            <div className="flex gap-2">
                                {['small', 'medium', 'large'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => handleChange('productDescriptionSize', size as any)}
                                        className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-all ${localSettings.productDescriptionSize === size
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {size === 'small' ? 'Küçük' : size === 'medium' ? 'Normal' : 'Büyük'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Price Styling */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-gray-900">Fiyat Etiketi</label>

                            {/* Color */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={localSettings.productPriceColor || '#d97706'}
                                    onChange={(e) => handleChange('productPriceColor', e.target.value)}
                                    className="h-8 w-8 cursor-pointer rounded border-0 p-0"
                                />
                                <span className="text-sm text-gray-500 font-mono">{localSettings.productPriceColor || '#d97706'}</span>
                            </div>

                            {/* Size */}
                            <div className="flex gap-2">
                                {['medium', 'large', 'xl'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => handleChange('productPriceSize', size as any)}
                                        className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-all ${localSettings.productPriceSize === size
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {size === 'medium' ? 'Normal' : size === 'large' ? 'Büyük' : 'XL'}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Live Preview Tip */}
                    <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border-l-4 border-amber-500">
                        <p><strong>İpucu:</strong> Değişiklikleri kaydettikten sonra menü sayfasını yenileyerek sonucu görebilirsiniz.</p>
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
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-gray-400"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Genişlik (px)</label>
                                <input
                                    type="number"
                                    value={localSettings.logoWidth || 150}
                                    onChange={(e) => handleChange('logoWidth', parseInt(e.target.value) || 150)}
                                    className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-gray-400"
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
                                        onChange={(e) => handleChange('defaultProductImage', e.target.value)}
                                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-gray-400"
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
                                <div key={index} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Slayt {index + 1}</span>
                                        {localSettings.bannerUrls.length > 1 && (
                                            <button
                                                onClick={() => removeBannerUrl(index)}
                                                className="text-xs font-medium text-red-600 hover:text-red-800"
                                            >
                                                Sil
                                            </button>
                                        )}
                                    </div>

                                    {/* Desktop Banner */}
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                                        <span className="w-20 text-xs font-medium text-gray-500">Masaüstü:</span>
                                        <div className="flex flex-1 gap-2">
                                            <input
                                                type="text"
                                                value={url || ''}
                                                onChange={(e) => handleBannerUrlChange(index, e.target.value)}
                                                onChange={(e) => handleBannerUrlChange(index, e.target.value)}
                                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-gray-400"
                                                placeholder="Masaüstü görsel URL..."
                                            />
                                            <label className="cursor-pointer rounded-lg bg-white border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                                Yükle
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => e.target.files?.[0] && handleBannerUpload(e.target.files[0], index, 'desktop')}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Mobile Banner */}
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                                        <span className="w-20 text-xs font-medium text-gray-500">Mobil:</span>
                                        <div className="flex flex-1 gap-2">
                                            <input
                                                type="text"
                                                value={localSettings.mobileBannerUrls?.[index] || ''}
                                                onChange={(e) => handleMobileBannerUrlChange(index, e.target.value)}
                                                onChange={(e) => handleMobileBannerUrlChange(index, e.target.value)}
                                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-gray-400"
                                                placeholder="Mobil görsel URL (isteğe bağlı)..."
                                            />
                                            <label className="cursor-pointer rounded-lg bg-white border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                                Yükle
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => e.target.files?.[0] && handleBannerUpload(e.target.files[0], index, 'mobile')}
                                                />
                                            </label>
                                        </div>
                                    </div>
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

                        {/* Banner Text Settings */}
                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <h4 className="mb-4 font-bold text-gray-900">Banner Metin Ayarları</h4>

                            <div className="mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={localSettings.bannerOverlayVisible !== false}
                                        onChange={(e) => handleChange('bannerOverlayVisible', e.target.checked as any)}
                                        className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Metin ve Karartma Göster</span>
                                </label>
                                <p className="ml-6 mt-1 text-xs text-gray-500">
                                    Seçili değilse banner üzerinde yazı ve karatma efekti görünmez, sadece resim görünür.
                                </p>
                            </div>

                            {localSettings.bannerOverlayVisible !== false && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Etiket (Örn: FIRSAT)</label>
                                        <input
                                            type="text"
                                            value={localSettings.bannerTag || ''}
                                            onChange={(e) => handleChange('bannerTag', e.target.value)}
                                            value={localSettings.bannerTag || ''}
                                            onChange={(e) => handleChange('bannerTag', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-gray-400"
                                            placeholder="FIRSAT"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Başlık (Örn: Kampanya)</label>
                                        <input
                                            type="text"
                                            value={localSettings.bannerTitle || ''}
                                            onChange={(e) => handleChange('bannerTitle', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-gray-400"
                                            placeholder="Kampanya"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Alt Başlık (Örn: %20 İndirim)</label>
                                        <input
                                            type="text"
                                            value={localSettings.bannerSubtitle || ''}
                                            onChange={(e) => handleChange('bannerSubtitle', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-gray-400"
                                            placeholder="%20 İndirim"
                                        />
                                    </div>
                                </div>
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
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-gray-400"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Footer Settings */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Footer (Alt Alan) Ayarları</h3>
                        <p className="text-sm text-gray-500">Sayfanın en alt kısmında görünecek sosyal medya ve metin bilgileri.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Social Media Links */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-900 text-sm border-b pb-2">Sosyal Medya Linkleri</h4>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Instagram</label>
                                <div className="flex rounded-lg shadow-sm">
                                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">@</span>
                                    <input
                                        type="text"
                                        value={localSettings.socialInstagram || ''}
                                        onChange={(e) => handleChange('socialInstagram', e.target.value)}
                                        className="block w-full min-w-0 flex-1 rounded-r-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-gray-400"
                                        placeholder="kullaniciadi (veya tam link)"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Facebook</label>
                                <input
                                    type="text"
                                    value={localSettings.socialFacebook || ''}
                                    onChange={(e) => handleChange('socialFacebook', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-gray-400"
                                    placeholder="https://facebook.com/sayfaniz"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Twitter (X)</label>
                                <input
                                    type="text"
                                    value={localSettings.socialTwitter || ''}
                                    onChange={(e) => handleChange('socialTwitter', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-gray-400"
                                    placeholder="https://twitter.com/kullanici"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Whatsapp</label>
                                <input
                                    type="text"
                                    value={localSettings.socialWhatsapp || ''}
                                    onChange={(e) => handleChange('socialWhatsapp', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-gray-400"
                                    placeholder="+90 5xx xxx xx xx (Link için)"
                                />
                            </div>
                        </div>

                        {/* Footer Texts */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-900 text-sm border-b pb-2">Metin Alanları</h4>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Alt Bilgi / İmza (Made By)</label>
                                <input
                                    type="text"
                                    value={localSettings.footerText || ''}
                                    onChange={(e) => handleChange('footerText', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-gray-400"
                                    placeholder="Powered by AntiGravity"
                                />
                                <p className="mt-1 text-xs text-gray-500">En altta görünecek 'Tarafından yapılmıştır' yazısı.</p>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Telif Hakkı (Copyright)</label>
                                <input
                                    type="text"
                                    value={localSettings.footerCopyright || `© ${new Date().getFullYear()} ${localSettings.siteName || 'İşletme Adı'}`}
                                    onChange={(e) => handleChange('footerCopyright', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-gray-400"
                                    placeholder="© 2024 Tüm Hakları Saklıdır"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Domain Settings */}
                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 shadow-sm lg:col-span-2">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-1">
                            <Globe className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-bold text-gray-900">Özel Domain (Alan Adı)</h3>
                        </div>
                        <p className="text-sm text-gray-500">Restoran menünüzü kendi web sitenize bağlayın. Örn: <code>menu.restoranadi.com</code></p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Domain Adresi</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-gray-400"
                                    placeholder="menu.siteniz.com"
                                />
                                <button
                                    onClick={handleDomainSave}
                                    disabled={loadingDomain}
                                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loadingDomain ? 'Kaydediliyor...' : 'Kaydet'}
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                <strong>Kurulum:</strong> Domain sağlayıcınızda (GoDaddy, Namecheap vb.) bir <code>CNAME</code> kaydı oluşturun. <br />
                                <span className="inline-block mt-1 bg-white p-1 rounded border">Host: <code>{domain.split('.')[0] || 'menu'}</code></span> <span className="text-gray-400">&rarr;</span> <span className="inline-block mt-1 bg-white p-1 rounded border">Hedef: <code>qrmenu1-mu.vercel.app</code></span>
                            </p>
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
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder:text-gray-400"
                                placeholder="******"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-bold text-gray-700">Yeni Şifre (Tekrar)</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder:text-gray-400"
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
        </div >
    );
}
