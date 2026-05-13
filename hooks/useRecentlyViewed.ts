import { useState, useCallback } from 'react';

export type ViewedProduct = { 
  id: number; 
  name: string; 
  imageUrl: string; 
  price: number; 
};

export function useRecentlyViewed() {
  const [products, setProducts] = useState<ViewedProduct[]>(() => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('recentlyViewed');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const track = useCallback((product: ViewedProduct) => {
    setProducts(prev => {
      const updated = [product, ...prev.filter(p => p.id !== product.id)].slice(0, 5);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));
        
        window.dispatchEvent(new CustomEvent('recentlyViewedChange', { 
          detail: updated 
        }));
      }
      
      return updated;
    });
  }, []);

  return { products, track };
}