'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/lib/data';
import * as Services from '@/lib/services';
import { CreditCard, Banknote, Ticket, Percent, Check, X, Loader2 } from 'lucide-react';

interface PaymentModalProps {
    order: Order;
    restaurantId: string;
    isOpen: boolean;
    onClose: () => void;
    onCompleted: () => void;
}

export default function PaymentModal({ order, restaurantId, isOpen, onClose, onCompleted }: PaymentModalProps) {
    const [amountToPay, setAmountToPay] = useState<number>(order.total_amount);
    // TODO: Calculate remaining amount if partial payments exist in future
    const [remainingTotal, setRemainingTotal] = useState<number>(order.total_amount);

    // For Split Bill logic, we'll keep it simple for now:
    // User enters amount -> chooses method -> we record payment.
    // If entered amount < remaining, it's partial.
    // If entered amount >= remaining, it's final.

    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount'); // 'amount' or 'percent'
    const [discountValue, setDiscountValue] = useState<number>(0);

    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // Reset when modal opens
        if (isOpen) {
            setAmountToPay(order.total_amount);
            setRemainingTotal(order.total_amount);
            setDiscountValue(0);
            setDiscountAmount(0);
        }
    }, [isOpen, order.total_amount]);

    useEffect(() => {
        // Recalculate discount
        let disc = 0;
        if (discountType === 'amount') {
            disc = discountValue;
        } else {
            disc = (order.total_amount * discountValue) / 100;
        }
        setDiscountAmount(disc);

        // Update remaining to pay (TOTAL - DISCOUNT - ALREADY_PAID)
        // For now ALREADY_PAID is assumed 0 as we do split within this session or not nicely tracked yet in UI
        const newRemaining = Math.max(0, order.total_amount - disc);
        setRemainingTotal(newRemaining);
        setAmountToPay(newRemaining); // Default to full remaining
    }, [discountValue, discountType, order.total_amount]);

    if (!isOpen) return null;

    const handlePayment = async (method: 'cash' | 'credit_card' | 'meal_card') => {
        if (amountToPay <= 0) return;
        setIsProcessing(true);

        try {
            const isFinal = amountToPay >= (remainingTotal - 0.01); // Epsilon check

            await Services.processPayment(
                restaurantId,
                order.id,
                amountToPay,
                method,
                isFinal ? discountAmount : 0, // Only record discount on final payment or distribute it? Simplified: Record on final.
                isFinal
            );

            if (isFinal) {
                onCompleted();
            } else {
                // Partial payment success
                // Recalculate remaining?
                // Ideally we should refetch order payments, but for this session let's just close and let user re-open for next part or update local state
                // For simplified UX, let's close and refresh order page
                alert(`${amountToPay.toFixed(2)} ₺ Ödeme Alındı. Kalan: ${(remainingTotal - amountToPay).toFixed(2)} ₺`);
                onCompleted(); // Temporarily close to refresh state
            }

        } catch (error) {
            console.error(error);
            alert('Ödeme işleminde hata oluştu.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Ödeme Al</h2>
                        <p className="text-xs text-gray-500">Masa {order.table_no}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Totals */}
                    <div className="text-center space-y-1">
                        <p className="text-sm text-gray-500">Toplam Tutar</p>
                        <div className="text-4xl font-black text-gray-900">{remainingTotal.toFixed(2)} ₺</div>
                        {discountAmount > 0 && (
                            <p className="text-xs text-green-600 font-bold">
                                {discountAmount.toFixed(2)} ₺ İndirim Uygulandı
                            </p>
                        )}
                    </div>

                    {/* Discount Section */}
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Percent className="h-4 w-4 text-orange-500" />
                            <span className="text-xs font-bold text-gray-700">İndirim Uygula</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    min="0"
                                    value={discountValue || ''}
                                    onChange={(e) => setDiscountValue(parseFloat(e.target.value))}
                                    className="w-full rounded-lg border border-gray-300 bg-white text-sm py-2 pl-3 pr-8 focus:ring-black focus:border-black"
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                                <button
                                    onClick={() => setDiscountType('amount')}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${discountType === 'amount' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    TL
                                </button>
                                <button
                                    onClick={() => setDiscountType('percent')}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${discountType === 'percent' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    %
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Partial Payment Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Tahsil Edilecek Tutar</label>
                        <input
                            type="number"
                            value={amountToPay || ''}
                            onChange={(e) => setAmountToPay(parseFloat(e.target.value) || 0)}
                            className="w-full text-center text-xl font-bold p-3 rounded-xl border border-gray-300 focus:ring-black focus:border-black"
                        />
                        <p className="text-[10px] text-center text-gray-400 mt-1">
                            Parçalı ödeme için tutarı değiştirebilirsiniz.
                        </p>
                    </div>

                    {/* Payment Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => handlePayment('cash')}
                            disabled={isProcessing}
                            className="bg-green-50 border border-green-200 hover:bg-green-100 hover:border-green-300 text-green-700 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Banknote className="h-6 w-6" />}
                            <span className="text-xs font-bold">Nakit</span>
                        </button>

                        <button
                            onClick={() => handlePayment('credit_card')}
                            disabled={isProcessing}
                            className="bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 text-indigo-700 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <CreditCard className="h-6 w-6" />}
                            <span className="text-xs font-bold">Kredi Kartı</span>
                        </button>

                        <button
                            onClick={() => handlePayment('meal_card')}
                            disabled={isProcessing}
                            className="bg-orange-50 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 text-orange-700 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Ticket className="h-6 w-6" />}
                            <span className="text-xs font-bold">Yemek Kartı</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
