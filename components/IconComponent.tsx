'use client';

import {
    UtensilsCrossed, Coffee, Pizza, Beer, Wine, Cake,
    Sandwich, Salad, Soup, IceCream, Martini, Fish,
    Drumstick, Croissant, Carrot, Bean, Grape, Nut,
    Apple, Cherry, Citrus, Banana, Beef, Milk
} from 'lucide-react';
import React from 'react';

// Map of available icons
const ICON_MAP = {
    'UtensilsCrossed': UtensilsCrossed,
    'Coffee': Coffee,
    'Pizza': Pizza,
    'Beer': Beer,
    'Wine': Wine,
    'Cake': Cake,
    'Sandwich': Sandwich,
    'Salad': Salad,
    'Soup': Soup,
    'IceCream': IceCream,
    'Martini': Martini,
    'Fish': Fish,
    'Drumstick': Drumstick,
    'Croissant': Croissant,
    'Carrot': Carrot,
    'Bean': Bean,
    'Grape': Grape,
    'Nut': Nut,
    'Apple': Apple,
    'Cherry': Cherry,
    'Citrus': Citrus,
    'Banana': Banana,
    'Beef': Beef,
    'Milk': Milk
};

interface IconComponentProps {
    name: string;
    className?: string;
    style?: React.CSSProperties;
}

export default function IconComponent({ name, className, style }: IconComponentProps) {
    if (!name) return null;

    // Normalize name: case-insensitive match
    const normalizedName = name.trim().toLowerCase();
    const match = Object.keys(ICON_MAP).find(k => k.toLowerCase() === normalizedName);

    if (match) {
        const LucideIcon = ICON_MAP[match as keyof typeof ICON_MAP];
        return <LucideIcon className={className} style={style} />;
    }

    // Direct match try (fallback)
    const ExactIcon = ICON_MAP[name as keyof typeof ICON_MAP];
    if (ExactIcon) {
        return <ExactIcon className={className} style={style} />;
    }

    return null;
}

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
