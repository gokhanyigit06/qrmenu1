
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface HeroBannerProps {
    bannerUrls: string[];
}

export default function HeroBanner({ bannerUrls }: HeroBannerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (bannerUrls.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % bannerUrls.length);
        }, 5000); // 5 seconds auto slide

        return () => clearInterval(timer);
    }, [bannerUrls]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + bannerUrls.length) % bannerUrls.length);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % bannerUrls.length);
    };

    if (bannerUrls.length === 0) return null;

    return (
        <div className="relative mb-6 h-48 w-full overflow-hidden rounded-xl shadow-lg sm:h-64 group">
            {/* Slides */}
            {bannerUrls.map((url, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0 z-0'
                        } ${index === currentIndex ? 'z-10' : ''}`}
                >
                    <Image
                        src={url}
                        alt={`Kampanya Banner ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-900/40 to-transparent" />
                </div>
            ))}

            {/* Content Overlay (Static for now, but could be dynamic per slide) */}
            <div className="absolute bottom-6 left-6 z-20 max-w-xs text-white">
                <span className="inline-block rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                    Fırsat
                </span>
                <h2 className="mt-2 text-2xl font-black leading-tight drop-shadow-lg">
                    Kokteyllerde <br />
                    <span className="text-amber-400">%20 İndirim</span>
                </h2>
            </div>

            {/* Navigation Controls (Only if multiple) */}
            {bannerUrls.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/20 p-1 text-white opacity-0 transition-opacity hover:bg-black/40 group-hover:opacity-100 backdrop-blur-sm"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/20 p-1 text-white opacity-0 transition-opacity hover:bg-black/40 group-hover:opacity-100 backdrop-blur-sm"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-4 right-4 z-20 flex gap-1.5">
                        {bannerUrls.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`h-1.5 rounded-full transition-all shadow-sm ${index === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
