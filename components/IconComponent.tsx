'use client';

import dynamic from 'next/dynamic';
import dynamicIconImports from 'lucide-react/dynamicIconImports'; // Available in lucide-react ^0.291.0
import React, { useMemo, Suspense } from 'react';

// Define the type for icon names
export type IconName = keyof typeof dynamicIconImports;

interface IconComponentProps {
    name: string;
    className?: string;
    style?: React.CSSProperties;
}

// Create a lookup map for resilient matching
// We assume this runs once on module load.
// This handles converting PascalCase, camelCase, or mismatched-case to the correct kebab-case key.
const iconLookup = new Map<string, IconName>();

Object.keys(dynamicIconImports).forEach((key) => {
    // key is "kebab-case" e.g. "align-right"
    const normalized = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    iconLookup.set(normalized, key as IconName);
});

// Helper to find the correct icon name
const findIconName = (name: string): IconName | null => {
    if (!name) return null;

    // 1. Strip "Lucide" prefix if present (case insensitive) e.g. "LucideCookingPot" -> "CookingPot"
    const withoutPrefix = name.replace(/^Lucide/i, '');

    // 2. Normalize input: remove non-alphanumeric, lowercase
    // e.g. "CookingPot" -> "cookingpot", "Glass Water" -> "glasswater"
    const normalized = withoutPrefix.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    return iconLookup.get(normalized) || null;
};

export default function IconComponent({ name, className, style }: IconComponentProps) {
    const iconName = findIconName(name);

    // Memoize the icon component so we don't recreate the dynamic component on every render
    const Icon = useMemo(() => {
        if (!iconName) return null;

        return dynamic(dynamicIconImports[iconName], {
            loading: () => (
                <span
                    className={className}
                    style={{
                        ...style,
                        display: 'inline-block',
                        minWidth: '1em',
                        minHeight: '1em',
                        // Optional: clear background usually, but can be helpful for debugging
                    }}
                />
            ),
            ssr: false
        });
    }, [iconName]); // Only recreate if resolved name changes

    if (!Icon) return null;

    return (
        <Suspense fallback={<span className={className} />}>
            <Icon className={className} style={style} />
        </Suspense>
    );
}

// Export available icons for the picker
export const AVAILABLE_ICONS = Object.keys(dynamicIconImports);
