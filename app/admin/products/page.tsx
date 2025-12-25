
'use client';

import { Product } from '@/lib/data';
import { useMenu } from '@/lib/store';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { ProductModal } from './ProductModal';
import { SortableProductCard } from './SortableProductCard';

export default function ProductsPage() {
    const { products, categories, addProduct, updateProduct, deleteProduct, reorderProducts } = useMenu();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // We need to work with the global 'products' list index
            // But we are dragging within 'filteredProducts' view
            // If we are filtering, reordering the global list based on filtered view is tricky.
            // Strategy: 
            // 1. If we are viewing ALL products (no search, no category filter), reorder global list directly.
            // 2. If we are viewing a specific CATEGORY, we can reorder within that category relative to each other in the global list.
            //    (This is complex), for now let's only allow reordering when showing ALL products to avoid index mismatches.

            const isFiltered = searchTerm !== '' || selectedCategory !== 'all';

            if (isFiltered) {
                // If filtered, we can't easily reorder the global list without complex logic.
                // For now, let's just disabling reordering effect or doing nothing.
                // Or, better, we implement reordering logic:
                // Find the items in the global list and swap their positions?
                // No, arrayMove shifts items between them.

                // Let's implement robust reorder:
                // We move 'active' item to the position of 'over' item.
                // In the global list, we extract 'active' item and insert it at the index of 'over' item.
                const oldIndex = products.findIndex((p) => p.id === active.id);
                const newIndex = products.findIndex((p) => p.id === over.id);

                if (oldIndex !== -1 && newIndex !== -1) {
                    reorderProducts(arrayMove(products, oldIndex, newIndex));
                }
            } else {
                const oldIndex = products.findIndex((p) => p.id === active.id);
                const newIndex = products.findIndex((p) => p.id === over.id);

                if (oldIndex !== -1 && newIndex !== -1) {
                    reorderProducts(arrayMove(products, oldIndex, newIndex));
                }
            }
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
            deleteProduct(id);
        }
    };

    const handleToggleActive = (product: Product) => {
        updateProduct({ ...product, isActive: !product.isActive });
    };

    const handleAddNew = () => {
        setEditingProduct(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleSave = (savedProduct: Product) => {
        if (editingProduct) {
            updateProduct(savedProduct);
        } else {
            addProduct({ ...savedProduct, id: Math.random().toString(36).substr(2, 9) });
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h1>
                    <p className="text-sm text-gray-500">Menüdeki ürünleri, fiyatları ve özellikleri yönetin.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Yeni Ürün
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
                    <Search className="h-5 w-5 text-gray-400 ml-2" />
                    <input
                        type="text"
                        placeholder="Ürün ismiyle ara..."
                        className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-sm min-w-[200px]"
                >
                    <option value="all">Tüm Kategoriler</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Search Result Info */}
            {(searchTerm || selectedCategory !== 'all') && (
                <div className="text-sm text-gray-500">
                    {filteredProducts.length} ürün bulundu. (Sıralama yapmak için filtreleri temizleyin veya kategori seçin)
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={filteredProducts.map(p => p.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredProducts.map((product) => (
                            <SortableProductCard
                                key={product.id}
                                product={product}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onToggleActive={handleToggleActive}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                product={editingProduct}
            />
        </div>
    );
}
