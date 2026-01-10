'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Armchair, ArrowRight, Loader2, LogOut, Plus } from 'lucide-react';
import * as Services from '@/lib/services';
import { Restaurant } from '@/lib/data';

export default function PosTableSelection() {
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const session = localStorage.getItem('qr_admin_session');
        if (session) {
            const data = JSON.parse(session);
            Services.getRestaurantBySlug(data.slug).then(res => {
                setRestaurant(res);
                setLoading(false);
            });
        }
    }, []);

    const handleTableClick = (tableNo: number) => {
        router.push(`/pos/table/${tableNo}`);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!restaurant) return <div>Restoran bulunamadı.</div>;

    if (!restaurant.is_ordering_active && !restaurant.is_waiter_mode_active) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 text-center p-8">
                <div className="rounded-full bg-red-100 p-4 text-red-600">
                    <LogOut className="h-8 w-8" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Modül Aktif Değil</h1>
                <p className="text-gray-500 max-w-md">
                    Bu işletme için Sipariş veya Garson modülü aktif edilmemiştir. Lütfen yönetici ile iletişime geçin.
                </p>
                <button
                    onClick={() => window.location.href = '/admin'}
                    className="text-indigo-600 font-bold hover:underline"
                >
                    Yönetim Paneline Dön
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
                    <p className="text-xs text-indigo-600 font-mono font-medium tracking-wider">POS TERMINAL</p>
                </div>
                <button
                    onClick={() => router.push('/admin')}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                >
                    <ArrowRight className="h-4 w-4" />
                    Panele Dön
                </button>
            </header>

            {/* Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="mx-auto max-w-7xl">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Armchair className="h-5 w-5" />
                        Masa Seçimi
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {/* Static 20 Tables for MVP */}
                        {Array.from({ length: 20 }).map((_, i) => {
                            const tableNo = i + 1;
                            return (
                                <button
                                    key={tableNo}
                                    onClick={() => handleTableClick(tableNo)}
                                    className="aspect-square flex flex-col items-center justify-center rounded-2xl border-2 border-gray-200 bg-white hover:border-indigo-500 hover:bg-indigo-50 transition-all group relative overflow-hidden"
                                >
                                    <span className="text-3xl font-black text-gray-300 group-hover:text-indigo-300 transition-colors">
                                        {tableNo}
                                    </span>
                                    <span className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wide group-hover:text-indigo-700">
                                        Masa
                                    </span>
                                </button>
                            );
                        })}

                        {/* Add Table Button (Mock) */}
                        <button className="aspect-square flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-transparent hover:border-gray-400 hover:bg-gray-50 transition-all text-gray-400">
                            <Plus className="h-6 w-6 mb-2" />
                            <span className="text-xs font-bold">Ekle</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
