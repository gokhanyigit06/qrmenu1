import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
    ],
};

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;

    // Hostname'i al (örn: menu.mickeys.com veya qrmenu1.vercel.app)
    let hostname = req.headers.get("host") || '';

    // Yerel geliştirmede portu temizle (localhost:3000 -> localhost)
    hostname = hostname.replace(':3000', '');

    // Ana domainimiz veya localhost ise bir şey yapma, normal çalışsın
    // (Buraya kendi production domaininizi de eklemelisiniz örn: qrmenu.com)
    if (
        hostname.includes("vercel.app") ||
        hostname.includes("localhost")
    ) {
        return NextResponse.next();
    }

    // --- ÖZEL DOMAIN MANTIĞI ---
    // Buraya gelen istekler "menu.mickeys.com" gibi CUSTOM domainlerdir.
    // Bizim bu domainin hangi slug'a ait olduğunu bilmemiz lazım.

    // YÖNTEM 1: Subdomain ise direkt slug olarak kabul et (kolay yöntem)
    // Örn: mickeys.qrmenu.com -> mickeys
    /*
    const subdomain = hostname.split('.')[0];
    url.pathname = `/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
    */

    // YÖNTEM 2: Tam Özel Domain (Sizin istediğiniz: menu.mickeys.com)
    // Bu durumda veritabanından "menu.mickeys.com kimin?" diye sormamız lazım.
    // Middleware içinde doğrudan DB sorgusu (Supabase) Edge Runtime'da mümkündür ama yapılandırma gerektirir.

    // Şimdilik test amaçlı manuel bir eşleşme yapalım, 
    // İleride burayı DB'den çekecek hale getirebiliriz.

    // ÖRNEK MANTIK:
    // Eğer hostname 'menu.mickeys.com' ise, bunu '/mickeys' sayfasına yönlendir (REWRITE).
    // Kullanıcı URL'de hala menu.mickeys.com görür.

    /*
    if (hostname === 'menu.mickeys.com') {
        url.pathname = `/mickeys${url.pathname}`;
        return NextResponse.rewrite(url);
    }
    */

    return NextResponse.next();
}
