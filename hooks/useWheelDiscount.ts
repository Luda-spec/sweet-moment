'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

function getInitialDiscount(): { discount: number; expiresAt: number | null } {
  if (typeof window === 'undefined') {
    return { discount: 0, expiresAt: null };
  }
  
  const saved = localStorage.getItem('wheelDiscount');
  if (saved) {
    try {
      const { value, expiresAt: exp } = JSON.parse(saved);
      if (Date.now() < exp) {
        return { discount: value, expiresAt: exp };
      } else {
        localStorage.removeItem('wheelDiscount');
      }
    } catch (e) {
      localStorage.removeItem('wheelDiscount');
    }
  }
  return { discount: 0, expiresAt: null };
}

export function useWheelDiscount() {
  const [{ discount, expiresAt }, setState] = useState(() => getInitialDiscount());
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  const expiresAtRef = useRef(expiresAt);
  useEffect(() => {
    expiresAtRef.current = expiresAt;
  }, [expiresAt]);

  const clearDiscount = useCallback(() => {
    setState({ discount: 0, expiresAt: null });
    setTimeLeft('');
    localStorage.removeItem('wheelDiscount');
  }, []);

  useEffect(() => {
    if (!expiresAtRef.current) {
      setTimeLeft('');
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const currentExpires = expiresAtRef.current;
      
      if (!currentExpires) return;
      
      const diff = currentExpires - now;

      if (diff <= 0) {
        setTimeLeft('Истекла');
        clearDiscount();
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [clearDiscount]); 

  const applyDiscount = useCallback((value: number, expDate: Date) => {
    const expTime = expDate.getTime();
    setState({ discount: value, expiresAt: expTime });
    localStorage.setItem('wheelDiscount', JSON.stringify({ value, expiresAt: expTime }));
  }, []);

  return { discount, applyDiscount, clearDiscount, expiresAt, timeLeft };
}