'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMenu } from '@/lib/store';
import { Order } from '@/lib/data';
import * as Services from '@/lib/services';
import { Receipt } from '@/components/Receipt';
import { ArrowLeft, Plus, Printer, CreditCard, ChefHat, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import PaymentModal from '@/components/PaymentModal';

export default function TableDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const { settings, products } = useMenu();
    const tableId = params.tableId as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        if (!settings.restaurantId) return;
        loadOrder();
    }, [settings.restaurantId, tableId]);

    const loadOrder = async () => {
        if (!settings.restaurantId) return;
        const data = await Services.getActiveTableOrder(settings.restaurantId, tableId);
        setOrder(data);
        setLoading(false);
    };

    const handlePrint = () => {
        window.print();
    };

    const onPaymentCompleted = async () => {
        setIsPaymentModalOpen(false);
        router.push('/pos');
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    // EMPTY STATE
    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/pos" className="p-2 bg-white rounded-xl shadow-sm border border-gray-200">
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Masa {tableId}</h1>
                    <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">Boş</span>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                        <ChefHat className="h-10 w-10 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-medium text-gray-500">Bu masada açık sipariş yok.</h2>

                    <Link
                        href={`/pos/order/${tableId}`}
                        className="bg-black text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition-transform flex items-center gap-3"
                    >
                        <Plus className="h-6 w-6" />
                        Sipariş Oluştur
                    </Link>
                </div>
            </div>
        );
    }

    // ACTIVE ORDER STATE
    return (
        <div className="min-h-screen bg-gray-50">
            {/* SCREEN VIEW */}
            <div className="print:hidden p-6 max-w-2xl mx-auto flex flex-col min-h-screen">
                <header className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/pos" className="p-2 bg-white rounded-xl shadow-sm border border-gray-200">
                            <ArrowLeft className="h-6 w-6 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Masa {tableId}</h1>
                            <p className="text-xs text-gray-500">Sipariş #{order.id.slice(0, 8)}</p>
                        </div>
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                        Açık
                    </span>
                </header>

                {/* Info Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Sipariş Özeti</h3>
                        <span className="text-xs font-mono text-gray-400">
                            {new Date(order.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {order.items?.map((item) => (
                            <div key={item.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold font-mono">
                                        {item.quantity}x
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{item.product_name}</p>
                                        <p className="text-[10px] text-gray-400 capitalize">{item.status === 'pending' ? 'Bekliyor' : item.status}</p>
                                    </div>
                                </div>
                                <div className="font-bold text-gray-900">
                                    {(item.price * item.quantity).toFixed(2)} ₺
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-gray-900 p-4 flex justify-between items-center text-white">
                        <span className="font-medium">TOPLAM</span>
                        <span className="text-xl font-bold">{order.total_amount.toFixed(2)} ₺</span>
                    </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-4">
                    <Link
                        href={`/pos/order/${tableId}`}
                        className="col-span-2 bg-white border-2 border-dashed border-gray-300 text-gray-600 p-4 rounded-xl flex items-center justify-center gap-2 font-bold hover:border-black hover:text-black transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Ürün Ekle
                    </Link>

                    <button
                        onClick={handlePrint}
                        className="bg-white border border-gray-200 text-gray-900 p-4 rounded-xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        <Printer className="h-6 w-6 mb-1" />
                        Fiş Yazdır
                    </button>

                    <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="bg-green-600 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-colors"
                    >
                        <CreditCard className="h-6 w-6 mb-1" />
                        Ödeme Al
                    </button>
                </div>
            </div>

            {/* PRINT VIEW (Hidden on Screen) */}
            <div className="hidden print:block">
                {order.items && (
                    <Receipt
                        order={order}
                        items={order.items}
                        restaurant={{ name: 'Restoran', ...settings } as any} // Mocking restaurant data for receipt title
                    />
                )}
            </div>

            {/* Payment Modal */}
            {settings.restaurantId && order && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onCompleted={onPaymentCompleted}
                    order={order}
                    restaurantId={settings.restaurantId}
                />
            )}
        </div>
    );
}
