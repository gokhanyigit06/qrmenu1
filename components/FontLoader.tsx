'use client';

import { useMenu } from '@/lib/store';
import { useEffect } from 'react';

export default function FontLoader() {
    const { settings } = useMenu();

    useEffect(() => {
        const fontFamily = settings.fontFamily || 'Inter';

        // Define google font import link
        const linkId = 'dynamic-font-loader';
        const existingLink = document.getElementById(linkId) as HTMLLinkElement;

        const isSystemFont = ['Times New Roman', 'Arial', 'Helvetica', 'Courier New'].includes(fontFamily);

        if (!isSystemFont) {
            const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@300;400;500;700;900&display=swap`;

            if (existingLink) {
                existingLink.href = fontUrl;
            } else {
                const link = document.createElement('link');
                link.id = linkId;
                link.href = fontUrl;
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }
        }

        // Apply font to body
        document.body.style.fontFamily = `"${fontFamily}", sans-serif`;

    }, [settings.fontFamily]);

    return null;
}
