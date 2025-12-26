'use client';

import {
    CreditCard,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    Store,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<{ name: string, slug: string } | null>(null);

    useEffect(() => {
        const session = localStorage.getItem('qr_admin_session');
        if (!session) {
            router.push('/login');
            return;
        }
        try {
            const data = JSON.parse(session);
            setRestaurant(data);
        } catch {
            router.push('/login');
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('qr_admin_session');
        window.location.href = '/login'; // Hard reload to clear all states
    };

    if (!restaurant) return null;

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 pb-10 pt-5 transition-transform flex flex-col">
                <div className="px-6 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-black flex items-center justify-center shadow-lg shadow-gray-200">
                            <Store className="h-5 w-5 text-white" />
                        </div>
                        <div className="overflow-hidden">
                            <h2 className="truncate text-sm font-bold text-gray-900">{restaurant.name}</h2>
                            <p className="truncate text-xs text-gray-500">Yönetim Paneli</p>
                        </div>
                    </div>

                    <a
                        href={`/${restaurant.slug}`}
                        target="_blank"
                        className="group flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-gray-700 shadow-sm transition-all hover:border-amber-400 hover:text-amber-600 hover:shadow-md active:scale-95"
                    >
                        <span>Menüyü Önizle</span>
                        <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <Link
                        href="/admin/categories"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-amber-600 transition-colors"
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        Kategoriler
                    </Link>
                    <Link
                        href="/admin/products"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-amber-600 transition-colors"
                    >
                        <Menu className="h-5 w-5" />
                        Ürünler
                    </Link>
                    <Link
                        href="/admin/bulk"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-amber-600 transition-colors"
                    >
                        <CreditCard className="h-5 w-5" />
                        Toplu İşlemler
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-amber-600 transition-colors"
                    >
                        <Settings className="h-5 w-5" />
                        Ayarlar
                    </Link>
                </nav>

                <div className="mt-auto px-4 pt-4 border-t border-gray-100">
                    <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 mb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold uppercase">
                                {restaurant.name.substring(0, 2)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 truncate">{restaurant.name}</p>
                                <p className="text-xs text-gray-500 truncate">@{restaurant.slug}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8">
                <div className="mx-auto max-w-5xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
