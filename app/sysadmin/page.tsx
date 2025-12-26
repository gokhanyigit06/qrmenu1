'use client';

import { useEffect, useState } from 'react';
import * as Services from '@/lib/services';
import { LayoutDashboard, LogOut, Plus, ShieldCheck, Trash2, ExternalLink, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SysAdminPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');

    // Data
    const [restaurants, setRestaurants] = useState<any[]>([]);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newSlug, setNewSlug] = useState('');
    const [newPassword, setNewPassword] = useState('123456');
    const [loading, setLoading] = useState(false);

    // MASTER PASSWORD (In production, use ENV var checks or real auth)
    const MASTER_KEY = 'supersecret';

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === MASTER_KEY) {
            setIsAuthenticated(true);
            loadRestaurants();
        } else {
            alert('Yanlış şifre!');
        }
    };

    const loadRestaurants = async () => {
        try {
            const data = await Services.getAllRestaurants();
            setRestaurants(data || []);
        } catch (error) {
            console.error(error);
            alert('Veriler çekilemedi.');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await Services.createRestaurant(newName, newSlug, newPassword);
            alert('Restoran başarıyla oluşturuldu!');
            setShowForm(false);
            setNewName('');
            setNewSlug('');
            loadRestaurants();
        } catch (error: any) {
            console.error(error);
            alert('Hata: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu restoranı ve tüm verilerini silmek istediğinize emin misiniz?')) return;
        try {
            await Services.deleteRestaurant(id);
            loadRestaurants();
        } catch (error) {
            console.error(error);
            alert('Silinemedi.');
        }
    };

    // Impersonate (Yönetici Olarak Gir)
    const handleImpersonate = (rest: any) => {
        // LocalStorage'a session yazıp admin paneline fırlat
        localStorage.setItem('qr_admin_session', JSON.stringify({
            restaurantId: rest.id,
            slug: rest.slug,
            name: rest.name,
            loginTime: new Date().toISOString(),
            isSuperAdmin: true // Belki ilerde işe yarar
        }));

        // Admin paneline git
        window.open('/admin', '_blank'); // Yeni sekmede aç
    };

    // --- LOGIN SCREEN ---
    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
                <div className="w-full max-w-sm rounded-2xl bg-gray-800 p-8 shadow-2xl border border-gray-700">
                    <div className="text-center mb-6">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-white">Süper Admin</h2>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            autoFocus
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full rounded-lg bg-gray-700 border-gray-600 px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Master Key"
                        />
                        <button className="w-full rounded-lg bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-500 transition">
                            Giriş Yap
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // --- DASHBOARD SCREEN ---
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gray-900 text-white shadow-md">
                <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-8 w-8 text-indigo-400" />
                        <h1 className="text-xl font-bold">Platform Yönetimi</h1>
                    </div>
                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
                    >
                        <LogOut className="h-4 w-4" /> Çıkış
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8">

                {/* Stats & Actions */}
                <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Restoranlar</h2>
                        <p className="text-gray-500">Sistemdeki tüm kayıtlı işletmeler ({restaurants.length})</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 font-bold text-white hover:bg-gray-800 transition"
                    >
                        {showForm ? 'İptal' : <><Plus className="h-5 w-5" /> Yeni Restoran Ekle</>}
                    </button>
                </div>

                {/* Create Form */}
                {showForm && (
                    <div className="mb-8 rounded-xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
                        <h3 className="mb-4 text-lg font-bold text-indigo-900">Yeni Restoran Kurulumu</h3>
                        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-4 items-end">
                            <div>
                                <label className="mb-1 block text-xs font-bold text-indigo-700">Restoran Adı</label>
                                <input
                                    required
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    className="w-full rounded-lg border-indigo-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Örn: Burger King"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-bold text-indigo-700">URL Slug</label>
                                <input
                                    required
                                    value={newSlug}
                                    onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/ /g, '-'))}
                                    className="w-full rounded-lg border-indigo-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="örn: burger-king"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-bold text-indigo-700">Yönetici Şifresi</label>
                                <input
                                    required
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full rounded-lg border-indigo-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <button
                                disabled={loading}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? 'Kuruluyor...' : 'Kurulumu Başlat'}
                            </button>
                        </form>
                    </div>
                )}

                {/* List Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                            <tr>
                                <th className="px-6 py-4">Restoran</th>
                                <th className="px-6 py-4">URL Kodu (Slug)</th>
                                <th className="px-6 py-4">Şifre</th>
                                <th className="px-6 py-4">Kayıt Tarihi</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {restaurants.map((rest) => (
                                <tr key={rest.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">{rest.name}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-indigo-600">/{rest.slug}</td>
                                    <td className="px-6 py-4 font-mono text-xs">{rest.password}</td>
                                    <td className="px-6 py-4">
                                        {new Date(rest.created_at).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => handleImpersonate(rest)}
                                            className="group flex items-center gap-1 rounded-md bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 border border-amber-200 transition"
                                            title="Yönetici Paneline Git"
                                        >
                                            Yönet
                                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                                        </button>
                                        <a
                                            href={`/${rest.slug}`}
                                            target="_blank"
                                            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 transition"
                                        >
                                            Menüyü Gör
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(rest.id)}
                                            className="rounded-md p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                                            title="Sil"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {restaurants.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Henüz hiç restoran yok.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </main>
        </div>
    );
}
