
'use client';

import { Category } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface CategoryNavProps {
    categories: Category[];
    activeCategoryId?: string;
    onCategorySelect?: (id: string) => void;
}

export default function CategoryNav({ categories, activeCategoryId, onCategorySelect }: CategoryNavProps) {
    const [activeId, setActiveId] = useState(activeCategoryId || categories[0]?.id);

    useEffect(() => {
        if (activeCategoryId) {
            setActiveId(activeCategoryId);
        }
    }, [activeCategoryId]);

    const handleClick = (id: string) => {
        setActiveId(id);
        if (onCategorySelect) {
            onCategorySelect(id);
        }
        const element = document.getElementById(`category-${id}`);
        if (element) {
            const yOffset = -140; // Adjust for sticky header
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 py-3 shadow-sm">
            <div className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar scroll-smooth">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => handleClick(category.id)}
                        className={cn(
                            "whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all duration-300",
                            activeId === category.id
                                ? "bg-black text-white shadow-md transform scale-105"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
