
'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface PromoPopupProps {
    imageUrl: string;
    isActive: boolean;
}

export default function PromoPopup({ imageUrl, isActive }: PromoPopupProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Show popup immediately or after short delay if active
        if (isActive) {
            const timer = setTimeout(() => setIsOpen(true), 500);
            return () => clearTimeout(timer);
        }
    }, [isActive]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-300">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-gray-900 shadow-md transition-transform hover:scale-110 active:scale-95"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="relative aspect-square w-full">
                    <Image
                        src={imageUrl}
                        alt="Promosyon"
                        fill
                        className="object-cover"
                    />
                    {/* Gradient Overlay for better text visibility if needed */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-center text-white">
                        <h3 className="text-2xl font-black uppercase tracking-tight text-amber-400 drop-shadow-lg">
                            Fırsatı Kaçırma!
                        </h3>
                        <p className="mt-2 text-sm font-medium drop-shadow-md">
                            Günün belirli saatlerinde %20'ye varan indirimler seni bekliyor.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
