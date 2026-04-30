'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct } from '../actions';
import { Category, Occasion, Filling, ProductItem } from '@prisma/client';
import { toast } from 'sonner';
import { Cake, Plus, Trash2, Weight, Upload, ImageIcon, Check } from 'lucide-react';

type ProductItemWithFillings = ProductItem & { fillings: Filling[] };
type FillingWithImage = Filling & { imageUrl?: string };
type WeightVariant = { price: string; weight: string };

type Props = {
  categories: Category[];
  occasions: Occasion[];
  fillings: FillingWithImage[];
  initialData?: {
    id: number;
    name: string;
    imageUrl: string;
    categoryId: number;
    occasionId: number;
    items: ProductItemWithFillings[];
  };
  isEdit?: boolean;
};

export function ProductForm({ categories, occasions, fillings, initialData, isEdit = false }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(String(initialData?.categoryId || ''));
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CAKE_CATEGORIES = ['Авторские', 'Бенто-торты', 'Свадебные'];
  const selectedCategory = categories.find(c => c.id === Number(selectedCategoryId));
  const isCake = CAKE_CATEGORIES.includes(selectedCategory?.name.trim() || '');

  const [weightVariants, setWeightVariants] = useState<WeightVariant[]>(() => {
    if (initialData?.items?.length) {
      return initialData.items.map(item => ({
        price: String(item.price),
        weight: String(item.weight || ''),
      }));
    }
    return [{ price: '', weight: '' }];
  });

  const [selectedFillingIds, setSelectedFillingIds] = useState<string[]>(() => {
    if (initialData?.items?.[0]?.fillings?.length) {
      return initialData.items[0].fillings.map(f => String(f.id));
    }
    return [];
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);

    const fileInput = fileInputRef.current;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      formData.append('imageFile', fileInput.files[0]);
    }

    weightVariants.forEach((variant, index) => {
      formData.append('price[]', variant.price);
      formData.append('weight[]', variant.weight);
    });

    selectedFillingIds.forEach(id => formData.append('fillingId[]', id));

    try {
      if (isEdit && initialData) {
        await updateProduct(initialData.id, formData);
        toast.success('Товар обновлён');
      } else {
        await createProduct(formData);
        toast.success('Товар добавлен');
      }
      router.push('/admin/products');
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при сохранении товара');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addWeightVariant = () => setWeightVariants([...weightVariants, { price: '', weight: '' }]);
  const removeWeightVariant = (index: number) => {
    if (weightVariants.length === 1) return toast.error('Должен быть хотя бы один вариант');
    setWeightVariants(weightVariants.filter((_, i) => i !== index));
  };
  const updateWeightVariant = (index: number, field: keyof WeightVariant, value: string) => {
    const newVariants = [...weightVariants];
    newVariants[index][field] = value;
    setWeightVariants(newVariants);
  };

  const toggleFilling = (fillingId: string) => {
    setSelectedFillingIds(prev => 
      prev.includes(fillingId) 
        ? prev.filter(id => id !== fillingId)
        : [...prev, fillingId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold mb-6">{isEdit ? '✏️ Редактировать товар' : '➕ Добавить товар'}</h2>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Фото товара</label>

            <label 
              htmlFor="product-image-upload" 
              className="relative block border-2 border-dashed border-gray-300 rounded-xl p-2 text-center hover:bg-gray-50 transition h-48 cursor-pointer overflow-hidden"
            >
              <input 
                id="product-image-upload"
                ref={fileInputRef}
                type="file" 
                name="imageFile" 
                accept="image/png, image/jpeg, image/jpg" 
                onChange={handleFileChange} 
                className="hidden" 
              />
              
              {filePreview || (isEdit && initialData?.imageUrl) ? (
                <img src={filePreview || initialData!.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Upload size={32} className="mb-2" />
                  <span className="text-xs">Нажми, чтобы загрузить</span>
                  <span className="text-[10px] text-gray-300 mt-1">JPG или PNG</span>
                </div>
              )}
            </label>
            
            {isEdit && <input type="hidden" name="currentImageUrl" defaultValue={initialData?.imageUrl} />}
          </div>

          <div className="w-full md:w-2/3 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Название товара *</label>
              <input name="name" defaultValue={initialData?.name} required placeholder="Например: Торт Красный бархат" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Категория *</label>
                <select name="categoryId" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                  <option value="">Выберите</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Повод *</label>
                <select name="occasionId" defaultValue={initialData?.occasionId || ''} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                  <option value="">Выберите</option>
                  {occasions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {isCake && (
          <div className="space-y-6 pt-4 border-t border-gray-100">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Weight className="text-blue-600" size={20} />
                  <h3 className="text-lg font-bold text-gray-900">Ценовые варианты (вес)</h3>
                </div>
                <button type="button" onClick={addWeightVariant} className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium">
                  <Plus size={16} /> Добавить
                </button>
              </div>
              {weightVariants.map((variant, index) => (
                <div key={index} className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Цена (₽)" value={variant.price} onChange={(e) => updateWeightVariant(index, 'price', e.target.value)} required className="px-3 py-2 border rounded-lg" />
                    <input type="number" placeholder="Вес (г)" value={variant.weight} onChange={(e) => updateWeightVariant(index, 'weight', e.target.value)} className="px-3 py-2 border rounded-lg" />
                  </div>
                  {weightVariants.length > 1 && (
                    <button type="button" onClick={() => removeWeightVariant(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={16} /></button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Cake className="text-purple-600" size={20} />
                <h3 className="text-lg font-bold text-gray-900">Доступные начинки</h3>
              </div>
              <p className="text-sm text-gray-500">Выберите начинки, которые доступны для этого торта (клиент выберет при заказе)</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {fillings.map((filling) => {
                  const isSelected = selectedFillingIds.includes(String(filling.id));
                  return (
                    <button
                      key={filling.id}
                      type="button"
                      onClick={() => toggleFilling(String(filling.id))}
                      className={`p-3 rounded-xl border-2 text-left transition ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {filling.imageUrl ? (
                          <img src={filling.imageUrl} alt={filling.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <ImageIcon size={20} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">{filling.name}</p>
                            {isSelected && <Check size={16} className="text-purple-600 shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{filling.composition}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!isCake && (
          <div className="space-y-1.5 pt-4 border-t border-gray-100">
            <label className="text-sm font-medium text-gray-700">Цена (₽) *</label>
            <input name="price" type="number" defaultValue={initialData?.items[0]?.price || ''} required placeholder="500" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
        <button type="button" onClick={() => window.history.back()} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer font-medium">Отмена</button>
        <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition disabled:opacity-50 shadow-lg shadow-primary/20 font-medium">
          {isSubmitting ? 'Сохранение...' : isEdit ? 'Готово' : 'Готово'}
        </button>
      </div>
    </form>
  );
}