'use client';

import { useMenu } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Facebook, Instagram, Twitter, Phone } from 'lucide-react';
import React from 'react';

export default function Footer() {
    const { settings } = useMenu();

    // If no social links and no footer text, maybe hide or show minimal?
    // User wants a modern footer.

    const currentYear = new Date().getFullYear();
    const copyrightText = settings.footerCopyright || `© ${currentYear} ${settings.siteName || 'QR Menu'}. Tüm hakları saklıdır.`;

    const hasSocials = settings.socialInstagram || settings.socialFacebook || settings.socialTwitter || settings.socialWhatsapp;

    return (
        <footer className="w-full bg-white border-t border-gray-100 mt-12 pb-24 md:pb-12">
            <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-8 text-center">

                    {/* Logo if exists */}
                    {settings.logoUrl && (
                        <div className="relative h-12 w-auto overflow-hidden opacity-80 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                            <img
                                src={settings.logoUrl}
                                alt="Logo"
                                className="h-full w-auto object-contain"
                            />
                        </div>
                    )}

                    {/* Social Icons */}
                    {hasSocials && (
                        <div className="flex items-center gap-6">
                            {settings.socialInstagram && (
                                <a
                                    href={settings.socialInstagram.startsWith('http') ? settings.socialInstagram : `https://instagram.com/${settings.socialInstagram.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group rounded-full bg-gray-50 p-3 text-gray-500 transition-all hover:bg-gradient-to-tr hover:from-amber-500 hover:to-purple-600 hover:text-white hover:shadow-lg hover:shadow-purple-500/30"
                                >
                                    <Instagram className="h-5 w-5" />
                                </a>
                            )}
                            {settings.socialFacebook && (
                                <a
                                    href={settings.socialFacebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group rounded-full bg-gray-50 p-3 text-gray-500 transition-all hover:bg-[#1877F2] hover:text-white hover:shadow-lg hover:shadow-blue-500/30"
                                >
                                    <Facebook className="h-5 w-5" />
                                </a>
                            )}
                            {settings.socialTwitter && (
                                <a
                                    href={settings.socialTwitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group rounded-full bg-gray-50 p-3 text-gray-500 transition-all hover:bg-black hover:text-white hover:shadow-lg hover:shadow-gray-500/30"
                                >
                                    <Twitter className="h-5 w-5" />
                                </a>
                            )}
                            {settings.socialWhatsapp && (
                                <a
                                    href={`https://wa.me/${settings.socialWhatsapp.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group rounded-full bg-gray-50 p-3 text-gray-500 transition-all hover:bg-[#25D366] hover:text-white hover:shadow-lg hover:shadow-green-500/30"
                                >
                                    <Phone className="h-5 w-5" />
                                </a>
                            )}
                        </div>
                    )}

                    {/* Divider */}
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                    {/* Footer Text & Copyright */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">
                            {copyrightText}
                        </p>
                        {settings.footerText && (
                            <p className="text-xs text-gray-400">
                                {settings.footerText}
                            </p>
                        )}
                        {!settings.footerText && (
                            <p className="text-[10px] text-gray-300">
                                Powered by <span className="font-bold text-gray-400">QR Menu System</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}
