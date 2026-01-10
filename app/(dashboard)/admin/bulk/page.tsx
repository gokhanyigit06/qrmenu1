
'use client';

import { Product } from '@/lib/data';
import * as Services from '@/lib/services';
import { useMenu } from '@/lib/store';
import { AlertCircle, CheckCircle, Download, FileSpreadsheet, Percent, Upload } from 'lucide-react';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function BulkOperationsPage() {
    const { products, categories, reorderProducts, refreshData } = useMenu();
    const [priceUpdateRate, setPriceUpdateRate] = useState<string>('');
    const [importStatus, setImportStatus] = useState<{
        type: 'success' | 'error' | 'info';
        message: string;
    } | null>(null);

    // Unified Headers for consistency
    const HEADERS = ['ID', 'Name', 'Name_EN', 'Description', 'Description_EN', 'Price', 'DiscountPrice', 'Image', 'CategoryId', 'Badge', 'Active'];

    // EXPORT FUNCTION
    const handleExport = () => {
        try {
            // Prepare data for export
            const dataToExport = products.map(p => ({
                ID: p.id,
                Name: p.name,
                Name_EN: p.nameEn || '',
                Description: p.description,
                Description_EN: p.descriptionEn || '',
                Price: p.price,
                DiscountPrice: p.discountPrice || '',
                Image: p.image,
                CategoryId: p.categoryId,
                Badge: p.badge || '',
                Active: p.isActive === false ? 'Hayır' : 'Evet'
            }));

            const wb = XLSX.utils.book_new();

            // 1. Products Sheet (with strict header order)
            const ws = XLSX.utils.json_to_sheet(dataToExport, { header: HEADERS });
            XLSX.utils.book_append_sheet(wb, ws, "Products");

            // 2. Categories Reference Sheet (for ease of editing)
            const categoriesData = categories.map(c => ({
                "Kategori Adı": c.name,
                "Kategori ID (Bunu Kopyala)": c.id
            }));
            const wsCategories = XLSX.utils.json_to_sheet(categoriesData);
            XLSX.utils.book_append_sheet(wb, wsCategories, "Kategori_Listesi");

            XLSX.writeFile(wb, "QR_Menu_Products.xlsx");

            setImportStatus({
                type: 'success',
                message: 'Ürün listesi ve kategori referansları başarıyla Excel olarak indirildi.'
            });
        } catch (error) {
            console.error(error);
            setImportStatus({
                type: 'error',
                message: 'Dışa aktarma sırasında bir hata oluştu.'
            });
        }
    };

    // IMPORT FUNCTION
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const binaryStr = event.target?.result;
                const workbook = XLSX.read(binaryStr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0]; // Assumes first sheet is Products
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet);

                processImportedData(data);
            } catch (error) {
                console.error(error);
                setImportStatus({
                    type: 'error',
                    message: 'Dosya okunurken hata oluştu.'
                });
            }
        };

        reader.readAsBinaryString(file);
    };

    const processImportedData = async (data: any[]) => {
        setImportStatus({ type: 'info', message: 'Veriler işleniyor, lütfen bekleyin... (Kategoriler kontrol ediliyor)' });
        let updatedCount = 0;
        let addedCount = 0;

        try {
            // 1. Manage Categories
            // Build a map of existing categories: Name -> ID
            const categoryMap = new Map<string, string>();
            categories.forEach(c => {
                categoryMap.set(c.name.trim().toLowerCase(), c.id);
                if (c.nameEn) categoryMap.set(c.nameEn.trim().toLowerCase(), c.id);
            });

            // Find all unique category names in the Excel file
            const newCategoryNames = new Set<string>();
            data.forEach((row: any) => {
                const catName = row.Category || row.Kategori || row['Category Name'] || row.CategoryName;
                if (catName && typeof catName === 'string') {
                    const normalized = catName.trim().toLowerCase();
                    if (!categoryMap.has(normalized)) {
                        newCategoryNames.add(catName.trim());
                    }
                }
            });

            // Create missing categories
            if (newCategoryNames.size > 0) {
                setImportStatus({ type: 'info', message: `${newCategoryNames.size} yeni kategori oluşturuluyor...` });
                for (const catName of Array.from(newCategoryNames)) {
                    try {
                        const newCat = await Services.createCategory({
                            name: catName,
                            slug: catName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
                        });
                        if (newCat && newCat.id) {
                            categoryMap.set(catName.trim().toLowerCase(), newCat.id);
                        }
                    } catch (err) {
                        console.error(`Failed to create category ${catName}`, err);
                    }
                }
            }

            // 2. Process Products
            setImportStatus({ type: 'info', message: `Ürünler işleniyor (${data.length} adet)...` });

            for (const row of data) {
                // Name is required
                const name = row.Name || row.UrunAdi || row['Ürün Adı'];
                if (!name) continue;

                // Price Parsing (handle "165 ₺", "165 TL", etc)
                const parsePrice = (val: any) => {
                    if (!val) return 0;
                    if (typeof val === 'number') return val;
                    // Keep digits, comma, dot. Replace comma with dot if needed.
                    // Simple approach: remove all non-digit/dot/comma. 
                    // Then replace comma with dot.
                    // But "1.200,50" -> "1200.50" vs "1,200.50".
                    // Let's assume standard Turkish format: X.XXX,YY or English X,XXX.YY
                    // Safest: remove non-numeric chars except last separator?
                    // Let's stick to simple: remove non-digit-dot-comma.
                    let clean = val.toString().replace(/[^0-9.,]/g, '');
                    if (clean.includes(',')) clean = clean.replace(',', '.');
                    return parseFloat(clean) || 0;
                };
                const price = parsePrice(row.Price || row.Fiyat);

                // Category ID Resolution
                const catNameInRow = row.Category || row.Kategori || row['Category Name'] || row.CategoryName;
                let catId = row.CategoryId || row['Category ID'];

                if (!catId && catNameInRow && typeof catNameInRow === 'string') {
                    catId = categoryMap.get(catNameInRow.trim().toLowerCase());
                }

                // Prepare Product Data
                const productData: Partial<Product> = {
                    name: name,
                    nameEn: row.Name_EN || row.NameEn,
                    description: row.Description || row.Aciklama,
                    descriptionEn: row.Description_EN || row.DescriptionEn,
                    price: price,
                    discountPrice: row.DiscountPrice ? parsePrice(row.DiscountPrice) : undefined,
                    image: row.Image || row.Gorsel || row.Resim,
                    categoryId: catId,
                    badge: row.Badge || row.Rozet,
                    isActive: (row.Active === 'Hayır' || row.Aktif === 'Hayır' || row.Active === false) ? false : true
                };

                // Remove undefined keys
                Object.keys(productData).forEach(key => (productData as any)[key] === undefined && delete (productData as any)[key]);

                // Check existence
                const existingProduct = products.find(p =>
                    (row.ID && p.id === row.ID) ||
                    (p.name.trim().toLowerCase() === name.toString().trim().toLowerCase())
                );

                if (existingProduct) {
                    await Services.updateProduct(existingProduct.id, productData);
                    updatedCount++;
                } else {
                    await Services.createProduct(productData);
                    addedCount++;
                }
            }

            // 3. Refresh & Finish
            await refreshData();

            setImportStatus({
                type: 'success',
                message: `İşlem tamamlandı: ${addedCount} yeni ürün eklendi, ${updatedCount} ürün güncellendi.`
            });

            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (error: any) {
            console.error("Import error:", error);
            setImportStatus({
                type: 'error',
                message: 'İçe aktarma sırasında hata: ' + (error.message || 'Bilinmeyen hata')
            });
        }
    };

    // BULK PRICE UPDATE
    const handlePriceUpdate = () => {
        const rate = parseFloat(priceUpdateRate);
        if (isNaN(rate) || rate === 0) {
            setImportStatus({ type: 'error', message: 'Lütfen geçerli bir oran girin.' });
            return;
        }

        if (!confirm(`Tüm ürünlerin fiyatlarını %${rate} oranında ${rate > 0 ? 'artırmak' : 'azaltmak'} istediğinize emin misiniz?`)) return;

        const updatedProducts = products.map(p => {
            const currentPrice = p.price ?? 0;
            const newPrice = currentPrice * (1 + rate / 100);
            const newDiscount = p.discountPrice ? p.discountPrice * (1 + rate / 100) : undefined;

            return {
                ...p,
                price: p.price !== undefined && p.price !== null ? parseFloat(newPrice.toFixed(2)) : p.price,
                discountPrice: newDiscount ? parseFloat(newDiscount.toFixed(2)) : undefined
            };
        });

        reorderProducts(updatedProducts);

        setImportStatus({
            type: 'success',
            message: `Tüm fiyatlar %${rate} oranında güncellendi.`
        });
        setPriceUpdateRate('');
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Toplu İşlemler</h1>
                <p className="text-sm text-gray-500">Excel ile ürünlerinizi yönetin veya toplu fiyat güncellemesi yapın.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Export Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col items-center text-center">
                    <div className="mb-4 rounded-full bg-amber-50 p-4">
                        <Download className="h-8 w-8 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Dışa Aktar</h3>
                    <p className="mt-2 text-sm text-gray-500 mb-6">
                        Yedek almak veya düzenlemek için Excel indir.
                    </p>
                    <button
                        onClick={handleExport}
                        className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-bold text-white transition-transform active:scale-95 hover:bg-gray-800"
                    >
                        Excel İndir
                    </button>
                </div>

                {/* Import Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col items-center text-center">
                    <div className="mb-4 rounded-full bg-blue-50 p-4">
                        <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">İçe Aktar</h3>
                    <p className="mt-2 text-sm text-gray-500 mb-6">
                        Excel dosyasını yükleyerek güncelle.
                    </p>

                    <div className="w-full space-y-3">
                        <div className="relative w-full">
                            <input
                                id="file-upload"
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <button className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:bg-blue-700">
                                Excel Yükle
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                const wb = XLSX.utils.book_new();

                                // 1. Product Template Sheet (Strict Header Order)
                                const wsProducts = XLSX.utils.json_to_sheet([{
                                    ID: "", // Place holder for new items
                                    Name: "Örnek Ürün",
                                    Name_EN: "Example Product",
                                    Description: "Açıklama buraya",
                                    Description_EN: "Description here",
                                    Price: 150,
                                    DiscountPrice: 120,
                                    Image: "https://example.com/image.jpg",
                                    CategoryId: categories[0]?.id || "kategori-id",
                                    Badge: "Yeni",
                                    Active: "Evet"
                                }], { header: HEADERS });
                                XLSX.utils.book_append_sheet(wb, wsProducts, "Products");

                                // 2. Categories Reference Sheet
                                const categoriesData = categories.map(c => ({
                                    "Kategori Adı": c.name,
                                    "Kategori ID (Bunu Kopyala)": c.id
                                }));
                                const wsCategories = XLSX.utils.json_to_sheet(categoriesData);
                                XLSX.utils.book_append_sheet(wb, wsCategories, "Kategori_Listesi");

                                XLSX.writeFile(wb, "urun_yukleme_sablonu.xlsx");
                            }}
                            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Şablon İndir (Kategoriler ile)
                        </button>

                    </div>
                </div>

                {/* Price Update Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col items-center text-center">
                    <div className="mb-4 rounded-full bg-green-50 p-4">
                        <Percent className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Fiyat Güncelle</h3>
                    <p className="mt-2 text-sm text-gray-500 mb-4">
                        Tüm fiyatları % oranında artır/azalt.
                    </p>
                    <div className="w-full flex gap-2">
                        <input
                            type="number"
                            placeholder="% Oran (Örn: 10)"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium outline-none focus:border-green-500 placeholder:text-gray-400"
                            value={priceUpdateRate}
                            onChange={(e) => setPriceUpdateRate(e.target.value)}
                        />
                        <button
                            onClick={handlePriceUpdate}
                            disabled={!priceUpdateRate}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                            Uygula
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Message */}
            {importStatus && (
                <div className={`flex items-center gap-3 rounded-lg p-4 ${importStatus.type === 'success' ? 'bg-green-50 text-green-700' :
                    importStatus.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                    {importStatus.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <p className="text-sm font-medium">{importStatus.message}</p>
                </div>
            )}

            {/* Preview Table (Last 5 Items) */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-gray-500" />
                        <h3 className="text-sm font-bold text-gray-700">Son Güncel Ürünler Önizleme</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-500">
                                <th className="px-6 py-3 font-medium">Ürün Adı</th>
                                <th className="px-6 py-3 font-medium">Fiyat</th>
                                <th className="px-6 py-3 font-medium">Kategori ID</th>
                                <th className="px-6 py-3 font-medium">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.slice(-5).map((product) => (
                                <tr key={product.id}>
                                    <td className="px-6 py-3 text-gray-900">{product.name}</td>
                                    <td className="px-6 py-3 text-gray-600">
                                        ₺{product.price}
                                        {product.discountPrice && <span className="ml-2 text-amber-600 font-bold">(₺{product.discountPrice})</span>}
                                    </td>
                                    <td className="px-6 py-3 text-gray-500">{product.categoryId}</td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${product.isActive === false ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                            {product.isActive === false ? 'Pasif' : 'Aktif'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
