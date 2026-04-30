'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Plus, AlertTriangle, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { deleteProduct } from "../actions";
import { toast } from 'sonner';

type Product = {
  id: number;
  name: string;
  imageUrl: string;
  category: { name: string };
  occasion: { name: string };
  items: { price: number }[];
};

function DeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isProcessing 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  isProcessing: boolean; 
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative animate-in fade-in zoom-in duration-200" 
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          disabled={isProcessing}
        >
          <X size={20} />
        </button>
        
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto">
          <AlertTriangle className="text-primary" size={24} />
        </div>
        
        <h3 className="text-lg font-bold mb-2 text-center">Удалить товар?</h3>
        <p className="text-sm text-gray-500 mb-5 text-center">
          Это действие нельзя отменить. Товар будет удален из каталога.
        </p>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
          >
            Отмена
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/80 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/products') 
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Ошибка загрузки:", err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget);
      toast.success("Товар удален");
      
      setProducts(prev => prev.filter(p => p.id !== deleteTarget));
      setDeleteTarget(null);
 
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error(error);
      toast.error("Ошибка при удалении");
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-8 ">
        <h1 className="text-3xl font-extrabold text-gray-900">Товары</h1>
        <Link
          href="/admin/products/create"
          className="flex items-center ml-2 gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition text-sm font-medium shadow-lg shadow-primary/20"
        >
          <Plus size={16} />
          Добавить
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.map((product) => {
          const minPrice = product.items.length > 0 
            ? Math.min(...product.items.map(i => i.price)) 
            : 0;

          return (
            <div
              key={product.id}
              className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover rounded-xl mb-3"
              />

              <h3 className="font-semibold text-gray-900 mb-1 truncate">
                {product.name}
              </h3>

              <div className="space-y-1 flex-1">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Категория:</span> {product.category.name}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Повод:</span> {product.occasion.name}
                </p>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <Link
                  href={`/admin/products/edit/${product.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                >
                  <Edit size={16} />
                  Ред.
                </Link>
                <button 
                  onClick={() => setDeleteTarget(product.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                >
                  <Trash2 size={16} />
                  Удалить
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <DeleteModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isProcessing={isDeleting}
      />
    </div>
  );
}