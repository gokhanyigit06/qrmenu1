
import {
    CreditCard,
    LayoutDashboard,
    Menu,
    Settings,
    Store,
    Users
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 pb-10 pt-5 transition-transform">
                <div className="px-6 mb-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
                            <Store className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">QR Admin</span>
                    </Link>
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

                <div className="mt-auto px-4 pt-10">
                    <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                                GY
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Gökhan Y.</p>
                                <p className="text-xs text-gray-500">Restoran Sahibi</p>
                            </div>
                        </div>
                    </div>
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
