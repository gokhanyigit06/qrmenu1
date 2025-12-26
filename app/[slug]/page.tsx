
'use client';

// Removed CategoryNav import as we are switching to Accordion + Banner layout
// import CategoryNav from '@/components/CategoryNav'; 
import CategoryAccordion from '@/components/CategoryAccordion';
import HeroBanner from '@/components/HeroBanner';
import PromoPopup from '@/components/PromoPopup';
import { Skeleton } from '@/components/ui/skeleton';
import { useMenu } from '@/lib/store'; // Import context hook
import { trackPageView } from '@/lib/services';
import { useEffect, useState } from 'react';

export default function Home() {
  const { products, categories, settings } = useMenu(); // Use global state
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');
  const [viewTracked, setViewTracked] = useState(false);

  // Apply Dark Mode to body
  useEffect(() => {
    if (settings.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Track Page View
  useEffect(() => {
    if (settings.restaurantId && !viewTracked) {
      trackPageView(settings.restaurantId).catch(console.error);
      setViewTracked(true);
    }
  }, [settings.restaurantId, viewTracked]);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Dynamic Theme Colors
  const themeColors: Record<string, string> = {
    black: 'text-gray-900',
    white: 'text-gray-900',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    red: 'text-red-700',
    green: 'text-green-700'
  };

  const accentColor = themeColors[settings.themeColor || 'black'] || 'text-gray-900';

  return (
    <div className={`min-h-screen bg-gray-50 pb-24 ${settings.darkMode ? 'dark:bg-gray-950' : ''}`}>
      {/* 
         Pop-up Component 
         Checks 'popupActive' from settings
      */}
      <PromoPopup
        imageUrl={settings.popupUrl}
        isActive={settings.popupActive}
      />

      {/* Header / Brand Area */}
      <div className={`bg-white px-4 pb-4 pt-8 shadow-sm sticky top-0 z-30 ${settings.darkMode ? 'dark:bg-gray-900 dark:border-b dark:border-gray-800' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo"
                style={{ width: settings.logoWidth ? `${settings.logoWidth}px` : '150px' }}
                className="object-contain mb-1 h-auto max-h-20"
              />
            ) : (
              <h1 className={`text-2xl font-black tracking-tight ${settings.darkMode ? 'dark:text-white' : 'text-gray-900'}`}>
                MICKEY'S <span className={`${accentColor} text-3xl leading-3`}>.</span>
              </h1>
            )}
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Cafe & Bistro
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-xs font-bold text-gray-900 uppercase tracking-wide hover:text-amber-600 transition-colors">
              {language === 'en' ? 'Allergens' : 'Alerjenler'}
            </button>
            <button
              onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
              className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wide hover:text-amber-600 transition-colors"
            >
              {language === 'tr' ? (
                <><span className="text-base">🇬🇧</span> English</>
              ) : (
                <><span className="text-base">🇹🇷</span> Türkçe</>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="px-4 pt-6 max-w-lg mx-auto md:max-w-4xl">
        {loading ? (
          <div className="space-y-6">
            {/* Banner Skeleton */}
            <Skeleton className="h-48 w-full rounded-xl" />

            {/* Accordion Skeletons */}
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Banner Section */}
            {settings.bannerActive && (
              <HeroBanner bannerUrls={settings.bannerUrls} />
            )}

            {/* Title before list */}
            <div className="mb-4 flex items-center justify-between px-1">
              <h2 className="text-lg font-bold text-gray-800">{language === 'en' ? 'Menu' : 'Menü'}</h2>

            </div>

            {/* Category Accordion List */}
            <CategoryAccordion
              categories={categories}
              products={products}
              language={language}
            />
          </>
        )}
      </main>

      {/* Floating Action / Cart Button */}

    </div>
  );
}
