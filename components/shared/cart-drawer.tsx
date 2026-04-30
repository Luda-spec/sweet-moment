'use client';

import { cn } from '@/lib/utils';
import {
  useCartStore,
  useCartTotalPrice,
  useCartTotalCount,
  CartItem,
} from '@/store/cart';
import {
  X,
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Clock,
  Gift,
} from 'lucide-react';
import { Button } from '../ui';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useWheelDiscount } from '@/hooks/useWheelDiscount';

export const CartDrawer: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  
  const { discount, timeLeft, clearDiscount } = useWheelDiscount();

  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const restoreItem = useCartStore((state) => state.restoreItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const isOpen = useCartStore((state) => state.isOpen);
  const setIsOpen = useCartStore((state) => state.setIsOpen);

  const totalPrice = useCartTotalPrice();
  const totalCount = useCartTotalCount();

  const [confirmType, setConfirmType] = useState<
    null | 'clear' | { type: 'remove'; id: string }
  >(null);

  const [lastRemovedItem, setLastRemovedItem] = useState<CartItem | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // 💰 Расчёт суммы со скидкой
  const productsTotal = totalPrice;
  const discountAmount = discount > 0 ? Math.round(productsTotal * (discount / 100)) : 0;
  const finalTotal = productsTotal - discountAmount;

  const handleCheckout = () => {
    if (!session) {
      toast.error('Войдите в аккаунт для оформления заказа', {
        position: 'top-right',
      });
      return;
    }
    
    setIsOpen(false);
    router.push(`/checkout?discount=${discount}`);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed top-0 right-0 h-full bg-white z-50 shadow-2xl transition-transform duration-300',
          'w-full md:w-[450px]',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-xl font-bold">
                Корзина <span className="text-gray-400">({totalCount})</span>
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag size={40} className="text-primary" />
                </div>
                <h3 className="font-bold mb-2">Корзина пуста</h3>
                <Button onClick={() => setIsOpen(false)}>Вернуться</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        backgroundColor:
                          highlightId === item.id
                            ? 'rgba(16,185,129,0.1)'
                            : '#f9fafb',
                      }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-4 p-4 rounded-2xl relative"
                    >
                      <img
                        src={item.imageUrl}
                        className="w-20 h-20 rounded-xl object-cover"
                      />

                      <div className="flex-1">
                        <h4 className="text-sm font-semibold">
                          {item.name}
                        </h4>

                        {(item.weight || item.fillingName) && (
                          <p className="text-xs text-gray-500 mt-1">
                            {[item.weight && `${item.weight}г`, item.fillingName]
                              .filter(Boolean)
                              .join(' • ')}
                          </p>
                        )}

                        <div className="flex justify-between mt-3">
                          <div className="flex items-center gap-1 border rounded-lg p-1">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="p-1 hover:bg-gray-100 rounded cursor-pointer"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="w-8 text-center">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="p-1 hover:bg-gray-100 rounded cursor-pointer"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <b>{item.price * item.quantity} ₽</b>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setConfirmType({
                            type: 'remove',
                            id: item.id,
                          });
                          setLastRemovedItem(item);
                        }}
                        className="absolute top-3 right-3 cursor-pointer text-gray-400 hover:text-primary"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-5 border-t">
              {discount > 0 && (
                <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="text-orange-500" size={18} />
                      <span className="font-medium text-sm">
                        Скидка {discount}%
                      </span>
                    </div>
                    {timeLeft && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={14} />
                        <span>{timeLeft}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right text-green-600 font-bold mt-1">
                    -{discountAmount} ₽
                  </div>
                </div>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Товары</span>
                  <span>{productsTotal} ₽</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Скидка</span>
                    <span>-{discountAmount} ₽</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Итого</span>
                  <span>{finalTotal} ₽</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleCheckout}
              >
                Оформить заказ
              </Button>

              <button
                onClick={() => setConfirmType('clear')}
                className="w-full mt-3 text-sm text-gray-500 hover:text-primary cursor-pointer"
              >
                Очистить корзину
              </button>
            </div>
          )}
        </div>
      </div>

      {confirmType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-lg mb-2">Вы уверены?</h3>

            <p className="text-sm text-gray-500 mb-5">
              {confirmType === 'clear'
                ? 'Очистить всю корзину?'
                : 'Удалить товар из корзины?'}
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmType(null)}
              >
                Отмена
              </Button>

              <Button
                className="flex-1 bg-primary text-white"
                onClick={() => {
                  if (confirmType === 'clear') {
                    clearCart();
                    toast.success('Корзина очищена', {
                      position: 'top-right', 
                    });
                  } else {
                    const itemToRestore = lastRemovedItem;

                    removeItem(confirmType.id);

                    toast('Товар удалён', {
                      position: 'top-right',
                      action: {
                        label: 'Вернуть',
                        onClick: () => {
                          if (!itemToRestore) return;

                          restoreItem(itemToRestore);

                          setHighlightId(itemToRestore.id);
                          setTimeout(() => setHighlightId(null), 1500);
                        },
                      },
                    });
                  }

                  setConfirmType(null);
                }}
              >
                Да
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};