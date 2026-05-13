'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Prisma } from '@prisma/client';
import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    occasion: true;
    items: true;
  };
}>;

interface Props {
  product: ProductWithRelations;
  className?: string;
}

export const ChooseProductModal: React.FC<Props> = ({
  product,
  className,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCartStore();
  const { track } = useRecentlyViewed();

  const price = product.items[0]?.price || 0;

  useEffect(() => {
    if (product) {
      track({
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        price: price,
      });
    }
  }, [product, track, price]);

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('product');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${price}`,
      productId: product.id,
      name: product.name,
      price,
      imageUrl: product.imageUrl,
    });

    toast.success('Добавлено в корзину');
    handleClose();
  };

  return (
    <Dialog open={Boolean(product)} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          'p-0 w-[95vw] h-auto max-h-[90vh] md:w-[850px] max-w-[850px] bg-white overflow-hidden rounded-2xl md:rounded-3xl shadow-xl',
          className,
        )}
      >
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Просмотр товара {product.name}
        </DialogDescription>

        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-[400px] p-3 md:p-6 flex items-center justify-center bg-gray-50 shrink-0">
            <div className="w-full max-w-[280px] md:w-[320px] aspect-square overflow-hidden rounded-2xl md:rounded-3xl shadow-lg bg-white relative">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="w-full md:w-[450px] p-4 md:p-6 flex flex-col justify-center">
            <h2 className="text-xl md:text-3xl font-extrabold mb-3 md:mb-4 leading-tight">
              {product.name}
            </h2>

            {product.occasion && (
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 w-fit mb-4 md:mb-6">
                <span className="text-xs md:text-sm font-medium text-gray-600">
                  Повод: {product.occasion.name}
                </span>
              </div>
            )}

            <Button
              onClick={handleAddToCart}
              className="w-full text-white h-12 md:h-14 rounded-xl font-medium text-sm md:text-base mt-auto shadow-lg md:shadow-none cursor-pointer"
            >
              Добавить в корзину за {price} ₽
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};