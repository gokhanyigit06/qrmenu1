'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMenu } from '@/lib/store';
import { Product, Category, Order } from '@/lib/data';
import * as Services from '@/lib/services';
import { ArrowLeft, Search, ShoppingBag, Plus, Minus, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PosOrderPage() {
    const params = useParams();
    const router = useRouter();
    const tableId = params.tableId as string;
    const { categories, products, settings } = useMenu();

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<{ product: Product; quantity: number; options?: any }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);

    // Initial load: Check for existing order
    useEffect(() => {
        if (!settings.restaurantId) return;
        Services.getActiveTableOrder(settings.restaurantId, tableId).then(order => {
            if (order) {
                setActiveOrder(order);
            }
        });
    }, [settings.restaurantId, tableId]);


    // Filter Products
    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategoryId === 'all' || product.categoryId === selectedCategoryId;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch && product.isActive;
    });

    const filteredCategories = categories.filter(c => c.isActive).sort((a, b) => (a.order || 0) - (b.order || 0));

    // Cart Operations
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);

    const handleSubmitOrder = async () => {
        if (cart.length === 0 || !settings.restaurantId) return;
        setIsSubmitting(true);

        try {
            const itemsToSubmit = cart.map(item => ({
                product_id: item.product.id,
                name: item.product.name,
                price: item.product.price || 0,
                quantity: item.quantity,
                options: item.options
            }));

            if (activeOrder) {
                // Append, Append to existing order
                await Services.addOrderItems(activeOrder.id, itemsToSubmit);
            } else {
                // Create New Order
                await Services.createOrder(settings.restaurantId, tableId, itemsToSubmit);
            }

            // Success!
            // Clear cart and redirect back to Table Dashboard
            setCart([]);
            router.push(`/pos/table/${tableId}`);

        } catch (error) {
            console.error("Order submit failed", error);
            alert("Sipariş gönderilirken hata oluştu!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* LEFT SIDE: Menu & Products */}
            <div className="flex-1 flex flex-col min-w-0 pb-20">
                {/* Header - Sticky */}
                <header className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-30">
                    <div className="flex items-center gap-4">
                        <Link href={`/pos/table/${tableId}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="h-6 w-6 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Masa {tableId}</h1>
                            <p className="text-xs text-gray-500">{activeOrder ? `#${activeOrder.id.slice(0, 8)} (Ek Sipariş)` : 'Yeni Sipariş'}</p>
                        </div>
                    </div>

                    <div className="relative w-64">
                        <input
                            type="text"
                            placeholder="Ürün ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 border-none text-sm focus:ring-2 focus:ring-black"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                </header>

                {/* Categories Tab - Sticky below Header */}
                <div className="sticky top-[73px] z-20 bg-white border-b border-gray-200 w-full shadow-sm">
                    <div
                        className="flex overflow-x-auto px-6 py-3 gap-2 whitespace-nowrap pb-4 select-none scrollbar-hide"
                        onWheel={(e) => {
                            if (e.deltaY !== 0) {
                                e.currentTarget.scrollLeft += e.deltaY;
                            }
                        }}
                    >
                        <button
                            onClick={() => setSelectedCategoryId('all')}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${selectedCategoryId === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Tümü
                        </button>
                        {filteredCategories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategoryId(cat.id)}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${selectedCategoryId === cat.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid - Natural Flow */}
                <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-start text-left hover:border-black hover:shadow-md transition-all group h-full select-none"
                            >
                                <div className="relative w-full aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                                    {product.image ? (
                                        <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                                    )}
                                    <div className="absolute right-2 bottom-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-900 shadow-sm">
                                        {product.price} ₺
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1">{product.name}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Cart - Sticky & Scrollable internally */}
            <div className="sticky top-0 h-screen w-96 bg-white border-l border-gray-200 flex flex-col shadow-xl z-40 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        Sepet
                    </h2>
                    <span className="bg-black text-white px-2 py-1 rounded text-xs font-bold">{cart.length} Ürün</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                            <ShoppingBag className="h-10 w-10 opacity-20" />
                            <p className="text-sm">Sepetiniz boş</p>
                            <p className="text-xs text-center px-8">Sol taraftan ürün seçerek sipariş oluşturabilirsiniz.</p>
                        </div>
                    ) : (
                        cart.map((item, idx) => (
                            <div key={item.product.id + idx} className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 group">
                                {item.product.image && (
                                    <div className="w-16 h-16 bg-white rounded-lg relative overflow-hidden flex-shrink-0">
                                        <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm truncate">{item.product.name}</h4>
                                        <p className="text-xs text-gray-500">{(item.product.price || 0) * item.quantity} ₺</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 bg-white border rounded hover:bg-gray-100">
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 bg-white border rounded hover:bg-gray-100">
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.product.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all self-center"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-4 z-10">
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-medium text-gray-500">Toplam Tutar</span>
                        <span className="text-2xl font-black text-gray-900">{cartTotal.toFixed(2)} ₺</span>
                    </div>
                    <button
                        onClick={handleSubmitOrder}
                        disabled={cart.length === 0 || isSubmitting}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Gönderiliyor...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-5 w-5" />
                                Siparişi Onayla
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
