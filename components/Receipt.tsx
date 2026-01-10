import React from 'react';
import { Order, OrderItem, Restaurant } from '@/lib/data';

interface ReceiptProps {
    order: Order;
    restaurant: Restaurant;
    items: OrderItem[];
}

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(({ order, restaurant, items }, ref) => {
    return (
        <div ref={ref} className="hidden print:block p-4 max-w-[80mm] mx-auto bg-white text-black font-mono text-sm">
            <div className="text-center mb-4 border-b border-black pb-2">
                <h1 className="text-xl font-bold uppercase">{restaurant.name}</h1>
                <p className="text-xs mt-1">Tarih: {new Date().toLocaleString('tr-TR')}</p>
                <p className="text-xs">Masa: {order.table_no}</p>
                <p className="text-xs">Sipariş No: #{order.id.slice(0, 8)}</p>
            </div>

            <div className="space-y-1 mb-4">
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start">
                        <div className="flex gap-2">
                            <span>{item.quantity}x</span>
                            <span>{item.product_name}</span>
                        </div>
                        <span>{(item.price * item.quantity).toFixed(2)} ₺</span>
                    </div>
                ))}
            </div>

            <div className="border-t border-black pt-2 space-y-1">
                <div className="flex justify-between font-bold text-lg">
                    <span>TOPLAM</span>
                    <span>{order.total_amount.toFixed(2)} ₺</span>
                </div>
                <div className="text-center text-[10px] mt-4">
                    Teşekkür Ederiz, Yine Bekleriz!
                </div>
                <div className="text-center text-[10px] mt-1">
                    Powered by QR Menu
                </div>
            </div>
        </div>
    );
});

Receipt.displayName = 'Receipt';
