'use client';

import { getDashboardStats } from '@/lib/services';
import { Eye, Package, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ todayViews: 0, yesterdayViews: 0, totalProducts: 0 });
    const [loading, setLoading] = useState(true);
    const [restaurantName, setRestaurantName] = useState('');

    useEffect(() => {
        const loadStats = async () => {
            const session = localStorage.getItem('qr_admin_session');
            if (!session) return;

            try {
                const data = JSON.parse(session);
                setRestaurantName(data.name || 'Restoran Sahibi');
                const rId = data.restaurantId || data.id;

                if (rId) {
                    const s = await getDashboardStats(rId);
                    setStats(s);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hoşgeldin, {restaurantName} 👋</h1>
                <p className="text-gray-500 mt-2">İşte restoranının bugünkü performans özeti.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Stats Card 1: Views */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                            <Eye className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Bugünkü Görüntülenme</p>
                            <h3 className="text-3xl font-black text-gray-900">
                                {loading ? '...' : stats.todayViews}
                            </h3>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium">
                        {stats.yesterdayViews > 0 ? (
                            stats.todayViews >= stats.yesterdayViews ?
                                (<span className="text-green-600 flex items-center gap-1"><TrendingUp size={14} /> Düne göre artışta</span>) :
                                (<span className="text-red-500">Düne göre düşüşte</span>)
                        ) : (
                            <span className="text-gray-400">Dün veri yok</span>
                        )}
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-400">Dün: {stats.yesterdayViews}</span>
                    </div>
                </div>

                {/* Stats Card 2: Products */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Toplam Ürün</p>
                            <h3 className="text-3xl font-black text-gray-900">
                                {loading ? '...' : stats.totalProducts}
                            </h3>
                        </div>
                    </div>
                    <div className="mt-4 text-xs font-medium text-purple-600 bg-purple-50 inline-block px-2 py-1 rounded-md">
                        Aktif Menü
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Hızlı İşlemler</h3>
                        <p className="text-sm text-gray-500">Menünü güncellemeye buradan başla.</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4">
                    <Link href="/admin/products" className="flex items-center gap-2 rounded-xl bg-black px-6 py-4 text-sm font-bold text-white hover:bg-gray-800 transition active:scale-95 shadow-lg shadow-gray-200">
                        <Package size={18} />
                        Yeni Ürün Ekle
                    </Link>
                    <Link href="/admin/categories" className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-700 hover:bg-gray-50 transition active:scale-95 hover:border-gray-300">
                        Kategorileri Düzenle
                    </Link>
                </div>
            </div>
        </div>
    );
}
