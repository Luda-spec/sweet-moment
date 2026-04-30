'use client';

import { useState } from 'react';
import { WheelOfFortune } from './wheel-of-fortune';
import { useWheelDiscount } from '@/hooks/useWheelDiscount';
import { Gift } from 'lucide-react';

export function WheelButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { discount, applyDiscount } = useWheelDiscount();
  

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 sm:bottom-6 sm:top-auto sm:right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-2 sm:px-5 sm:py-3 rounded-full shadow-xl hover:scale-105 transition font-bold z-50 flex items-center gap-2 text-sm sm:text-base"
      >
        <Gift size={18} className="sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Колесо удачи</span>
        <span className="sm:hidden">🎡</span>
        

      </button>

      <WheelOfFortune 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onWin={({ discount, expiresAt }) => applyDiscount(discount, expiresAt)}
      />
    </>
  );
}