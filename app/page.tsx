import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        QR Menü Sistemi
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600">
        Restoranınız için dijital menü oluşturun, siparişleri kolayca yönetin.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Link
          href="/mickeys"
          className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Örnek Menüyü Gör (Mickey's)
        </Link>
        <Link href="/admin" className="text-sm font-semibold leading-6 text-gray-900">
          Yönetici Girişi <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
