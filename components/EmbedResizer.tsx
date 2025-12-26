'use client';

import { useEffect, useRef } from 'react';

export default function EmbedResizer() {
    const observer = useRef<ResizeObserver | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const sendHeight = () => {
            // Toplam yükseklik (body scrollHeight)
            const height = document.body.scrollHeight;
            // Parent pencereye mesaj gönder
            window.parent.postMessage({ type: 'qr-menu-resize', height }, '*');
        };

        // 1. İlk yüklemede gönder
        sendHeight();

        // 2. İçerik değiştikçe gönder (ResizeObserver)
        observer.current = new ResizeObserver(() => {
            sendHeight();
        });

        observer.current.observe(document.body);

        // 3. Her ihtimale karşı periyodik kontrol (resim yüklenmeleri vs için)
        const interval = setInterval(sendHeight, 1000);

        return () => {
            if (observer.current) observer.current.disconnect();
            clearInterval(interval);
        };
    }, []);

    return null;
}
