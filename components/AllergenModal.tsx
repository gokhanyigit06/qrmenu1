import { ALLERGENS, DIETS } from '@/lib/allergens';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AllergenModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: 'tr' | 'en';
}

export default function AllergenModal({ isOpen, onClose, language }: AllergenModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
            <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Title */}
                <div className="mb-6">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                        {language === 'tr' ? 'Alerjen Tablosu' : 'Allergen Table'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {language === 'tr'
                            ? 'Siparişinizi verirken, sağlığınızın güvenliği için ürünlerin yanında yer alan alerjen ikonlarını dikkate almanızı rica ederiz.'
                            : 'For your safety, please consider the allergen icons next to products when ordering.'}
                    </p>
                </div>

                {/* Allergens Grid */}
                <div className="space-y-4">
                    {ALLERGENS.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-3 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 dark:bg-gray-800">
                                <item.icon className={`h-6 w-6 ${item.color}`} />
                            </div>
                            <span className="font-bold text-gray-700 dark:text-gray-200">
                                {language === 'tr' ? item.nameTr : item.nameEn}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Diet Section */}
                <div className="mt-8 mb-4">
                    <h3 className="mb-4 text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                        {language === 'tr' ? 'Vegan / Vejetaryen' : 'Vegan / Vegetarian'}
                    </h3>
                    <div className="space-y-4">
                        {DIETS.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-3 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 dark:bg-gray-800">
                                    <item.icon className={`h-6 w-6 ${item.color}`} />
                                </div>
                                <span className="font-bold text-gray-700 dark:text-gray-200">
                                    {language === 'tr' ? item.nameTr : item.nameEn}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
