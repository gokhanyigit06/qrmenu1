'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChefHat, Lock, User } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [slug, setSlug] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Restoranı bul ve şifreyi kontrol et
            // (Güvenlik Notu: Gerçek projede şifre backend'de kontrol edilmeli. 
            // Şimdilik client-side yapıyoruz ama production için RLS veya Edge Function gerekir)

            const { data: restaurant, error: fetchError } = await supabase
                .from('restaurants')
                .select('*')
                .eq('slug', slug)
                .single();

            if (fetchError || !restaurant) {
                throw new Error('Restoran bulunamadı.');
            }

            // Basit şifre kontrolü (Düz metin)
            if (restaurant.password !== password) {
                throw new Error('Hatalı şifre.');
            }

            // 2. Başarılı! Giriş bilgisini kaydet (LocalStorage)
            // Daha güvenli yol: Cookie kullanmak.
            localStorage.setItem('qr_admin_session', JSON.stringify({
                restaurantId: restaurant.id,
                slug: restaurant.slug,
                name: restaurant.name,
                loginTime: new Date().toISOString()
            }));

            // 3. Admin paneline yönlendir
            router.push('/admin');

        } catch (err: any) {
            setError(err.message || 'Giriş yapılamadı.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-10 shadow-xl rounded-2xl border border-gray-100">
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-white shadow-lg">
                        <ChefHat className="h-8 w-8" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Yönetici Girişi
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        QR Menü sisteminizi yönetmek için giriş yapın.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                required
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="block w-full rounded-xl border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 bg-gray-50/50"
                                placeholder="Restoran Kodu (Örn: mickeys)"
                            />
                        </div>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-xl border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 bg-gray-50/50"
                                placeholder="Şifre"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end text-sm">
                        <a
                            href="https://wa.me/905434081806?text=Merhaba,%20QR%20Menü%20şifremi%20unuttum.%20Yardımcı%20olabilir%20misiniz?"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-gray-600 hover:text-black transition-colors"
                        >
                            Şifremi unuttum?
                        </a>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500 text-center font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-xl bg-black px-3 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Kontrol Ediliyor...
                                </span>
                            ) : (
                                'Giriş Yap'
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center text-xs text-gray-400">
                    <p>Varsayılan Şifre: 123456</p>
                    <p className="mt-1">© 2025 Antigravity QR Menü</p>
                </div>
            </div>
        </div>
    );
}
