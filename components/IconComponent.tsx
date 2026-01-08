'use client';

import * as LucideIcons from 'lucide-react';
import React, { useMemo } from 'react';

// Filter out non-icon exports if necessary
// Usually Lucide icons are React components.
// We can try to include all exports that look like components.
const iconList = Object.keys(LucideIcons).filter(key => key !== 'createLucideIcon' && key !== 'default');

interface IconComponentProps {
    name: string;
    className?: string;
    style?: React.CSSProperties;
}

export default function IconComponent({ name, className, style }: IconComponentProps) {
    if (!name) return null;

    // Normalize name: case-insensitive match
    const normalizedName = name.trim().toLowerCase();

    // Find the actual export name (case-insensitive)
    const iconName = iconList.find(k => k.toLowerCase() === normalizedName);

    if (iconName) {
        // @ts-ignore
        const LucideIcon = LucideIcons[iconName];
        if (LucideIcon) {
            return <LucideIcon className={className} style={style} />;
        }
    }

    return null;
}

export const AVAILABLE_ICONS = iconList;
