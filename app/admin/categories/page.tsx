'use client';

import { Category } from '@/lib/data';
import { useMenu } from '@/lib/store';
import {
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit2, GripVertical, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { CategoryModal } from './CategoryModal';

function SortableItem({
    id,
    category,
    onEdit,
    onDelete
}: {
    id: string;
    category: Category;
    onEdit: (cat: Category) => void;
    onDelete: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: 'relative' as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center justify-between rounded-xl border p-4 shadow-sm transition-all
        ${isDragging ? 'bg-amber-50 border-amber-200 shadow-md scale-105' : 'bg-white border-gray-200 hover:border-gray-300'}
      `}
        >
            <div className="flex items-center gap-3">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab touch-none rounded-lg p-1 text-gray-400 group-hover:text-gray-600 hover:bg-gray-100 active:cursor-grabbing"
                >
                    <GripVertical className="h-5 w-5" />
                </button>

                {/* Image Preview Small */}
                {category.image && (
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                        <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                    </div>
                )}

                <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        {category.name}
                        {category.badge && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                {category.badge}
                            </span>
                        )}
                        {category.discountRate && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                                %{category.discountRate} İndirim
                            </span>
                        )}
                    </h3>
                    <div className="flex items-center gap-2">
                        <code className="text-[10px] text-gray-400 bg-gray-50 px-1 rounded border border-gray-100 font-mono select-all">
                            ID: {category.id}
                        </code>
                        {category.description && (
                            <p className="text-xs text-gray-400 line-clamp-1 border-l border-gray-200 pl-2">
                                {category.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onEdit(category)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-amber-600 transition-colors"
                >
                    <Edit2 className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onDelete(category.id)}
                    className="rounded-lg p-2 text-red-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export default function CategoriesPage() {
    const { categories, updateCategories, addCategory, updateCategory, deleteCategory } = useMenu();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = categories.findIndex((item) => item.id === active.id);
            const newIndex = categories.findIndex((item) => item.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                updateCategories(arrayMove(categories, oldIndex, newIndex));
            }
        }
    }

    const handleAddNew = () => {
        setEditingCategory(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Kategoriyi silmek istediğinize emin misiniz?')) {
            await deleteCategory(id);
        }
    };

    const handleSave = async (savedCategory: Category) => {
        try {
            if (editingCategory) {
                // Update
                await updateCategory(editingCategory.id, savedCategory);
            } else {
                // Add new
                const newCat = {
                    ...savedCategory,
                    slug: savedCategory.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
                };
                await addCategory(newCat);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Save failed", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kategori Yönetimi</h1>
                    <p className="text-sm text-gray-500">Menü kategorilerini düzenleyin ve sıralayın.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Yeni Kategori
                </button>
            </div>

            <div className="max-w-2xl">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={categories.map(i => i.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {categories.map((category) => (
                                <SortableItem
                                    key={category.id}
                                    id={category.id}
                                    category={category}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                category={editingCategory}
            />
        </div>
    );
}
