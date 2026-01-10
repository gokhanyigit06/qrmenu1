'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useMenu } from '@/lib/store'; // For product/category metadata
import * as Services from '@/lib/services';
import { Order, OrderItem } from '@/lib/data';
import { Check, Clock, Coffee, Loader2 } from 'lucide-react';

interface OrderBoardProps {
    stationFilter?: string; // 'Mutfak', 'Bar', or undefined (All)
    title: string;
}

export default function OrderBoard({ stationFilter, title }: OrderBoardProps) {
    const { products, categories, settings } = useMenu();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initial Load
    useEffect(() => {
        if (!settings.restaurantId) return;
        loadOrders();

        // Realtime Subscription
        const channel = supabase
            .channel('orders-realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${settings.restaurantId}` },
                (payload) => {
                    console.log('New Order!', payload);
                    playNotificationSound();
                    loadOrders(); // easy way, refresh all
                }
            )
            .on(
                'postgres_changes', // Listen to item updates too if status changes?
                { event: '*', schema: 'public', table: 'order_items' },
                () => {
                    loadOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [settings.restaurantId]);

    const loadOrders = async () => {
        if (!settings.restaurantId) return;
        const data = await Services.getActiveOrders(settings.restaurantId);
        setOrders(data || []);
        setLoading(false);
    };

    const playNotificationSound = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log('Audio play failed', e));
        }
    };

    // Helper to check if item belongs to station
    const isItemInStation = (item: OrderItem) => {
        if (!stationFilter) return true; // Show all
        if (!item.product_id) return true; // Fallback

        const product = products.find(p => p.id === item.product_id);
        if (!product) return false;

        const category = categories.find(c => c.id === product.categoryId);
        if (!category) return false;

        // Default station is 'Mutfak' if undefined
        const station = category.station_name || 'Mutfak';
        return station === stationFilter;
    };

    // Calculate elapsed time
    const getElapsedMinutes = (dateString: string) => {
        const diff = new Date().getTime() - new Date(dateString).getTime();
        return Math.floor(diff / 60000);
    };

    const handleItemClick = async (item: OrderItem) => {
        // Toggle status: pending -> prepared/served
        // For Kitchen: pending -> prepared
        // For Waiter: prepared -> served
        // Simplified: Click to toggle 'completed' (prepared)

        const newStatus = item.status === 'pending' ? 'prepared' : 'pending';
        // Optimization: Optimistic update
        setOrders(prev => prev.map(o => ({
            ...o,
            items: o.items?.map(i => i.id === item.id ? { ...i, status: newStatus as any } : i)
        })));

        await Services.updateOrderItemStatus(item.id, newStatus);
    };

    const handleOrderComplete = async (order: Order) => {
        // Mark all filtered items as completed? 
        // Or just mark Order as 'ready' if all items are done?
        // Let's just mark the Order status for now.
        const newStatus = order.status === 'ready' ? 'completed' : 'ready';
        await Services.updateOrderStatus(order.id, newStatus);
        loadOrders();
    };

    // Filter logic
    const filteredOrders = orders.filter(order => {
        // Does order have any items for this station?
        const hasItems = order.items?.some(i => isItemInStation(i));
        // And is not fully completed? (getActiveOrders handles this filter mostly, but double check)
        return hasItems && order.status !== 'completed' && order.status !== 'cancelled';
    });

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <audio ref={audioRef} src="/sounds/notification.mp3" />

            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    {title}
                    <span className="bg-indigo-100 text-indigo-700 text-sm px-3 py-1 rounded-full">{filteredOrders.length} Sipariş</span>
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-white border border-gray-300 rounded-full"></span> Bekliyor</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 border border-green-300 rounded-full"></span> Hazır</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredOrders.map(order => {
                    const elapsed = getElapsedMinutes(order.created_at);
                    const stationItems = order.items?.filter(isItemInStation) || [];

                    if (stationItems.length === 0) return null;

                    // Check if all station items are ready
                    const allReady = stationItems.every(i => i.status !== 'pending');

                    return (
                        <div key={order.id} className={`flex flex-col rounded-xl border-2 shadow-sm overflow-hidden ${allReady ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}>
                            {/* Card Header */}
                            <div className={`px-4 py-3 flex items-center justify-between border-b ${allReady ? 'border-green-200 bg-green-100' : 'border-gray-100 bg-gray-50'}`}>
                                <h3 className="font-black text-xl text-gray-800">Masa {order.table_no}</h3>
                                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${elapsed > 15 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-white text-gray-600'}`}>
                                    <Clock className="h-3 w-3" />
                                    {elapsed} dk
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="flex-1 p-2 space-y-1">
                                {stationItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleItemClick(item)}
                                        className={`w-full text-left p-3 rounded-lg border transition-all flex items-start justify-between group ${item.status === 'prepared' || item.status === 'served'
                                                ? 'bg-green-200 border-green-300 opacity-60'
                                                : 'bg-white border-gray-100 hover:border-indigo-300 hover:shadow-sm'
                                            }`}
                                    >
                                        <div>
                                            <div className="font-bold text-gray-900 flex items-center gap-2">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-900 text-white text-xs">
                                                    {item.quantity}x
                                                </span>
                                                {item.product_name}
                                            </div>
                                            {item.options && Object.keys(item.options).length > 0 && (
                                                <ul className="mt-1 text-xs text-gray-500 pl-8 list-disc">
                                                    {Object.entries(item.options).map(([key, val]) => (
                                                        <li key={key}>{key}: {val as any}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        {item.status !== 'pending' && <Check className="h-5 w-5 text-green-700" />}
                                    </button>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="p-3 border-t border-gray-100 bg-white/50">
                                {order.customer_note && (
                                    <div className="mb-3 text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-200">
                                        Note: {order.customer_note}
                                    </div>
                                )}
                                {allReady ? (
                                    <button
                                        onClick={() => handleOrderComplete(order)}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Check className="h-4 w-4" />
                                        Tamamlandı
                                    </button>
                                ) : (
                                    <div className="text-center text-xs text-gray-400 font-medium py-2">
                                        Tüm ürünleri hazırla
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Coffee className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-lg">Şu an aktif sipariş yok.</p>
                </div>
            )}
        </div>
    );
}
