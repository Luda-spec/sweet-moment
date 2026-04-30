'use client';

import { useState, useEffect, useRef } from 'react';
import { checkWheelSpinStatus } from '@/app/actions';
import { toast } from 'sonner';
import { Gift, X, Loader2 } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onWin: (data: { discount: number; expiresAt: Date }) => void;
};

export function WheelOfFortune({ isOpen, onClose, onWin }: Props) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [canSpin, setCanSpin] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  const onWinRef = useRef(onWin);
  onWinRef.current = onWin;

  const segments = [0, 5, 10, 15, 20, 15, 10, 5];

  function getRotationForDiscount(discount: number, currentRotation: number) {
    const segmentAngle = 360 / segments.length;

    const possibleIndexes = segments
      .map((v, i) => (v === discount ? i : -1))
      .filter(i => i !== -1);

    const index =
      possibleIndexes[Math.floor(Math.random() * possibleIndexes.length)];

    const angleToSegment = index * segmentAngle + segmentAngle / 2;

    const spins = 360 * 5;

    return currentRotation + spins + (360 - angleToSegment);
  }

  useEffect(() => {
    if (isOpen && !hasChecked) {
      checkWheelSpinStatus().then((status) => {
        setCanSpin(!status.hasSpunToday);
        setHasChecked(true);
      });
    }

    if (!isOpen) {
      setHasChecked(false);
    }
  }, [isOpen, hasChecked]);

  const handleSpin = async () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);

    try {
      const result = await import('@/app/actions').then(m => m.spinWheel());

      const newRotation = getRotationForDiscount(result.discount, rotation);
      setRotation(newRotation);

      await new Promise(resolve => setTimeout(resolve, 4000));

      if (result.discount > 0) {
        toast.success(`Поздравляем! Скидка ${result.discount}%!`);
        onWinRef.current({
          discount: result.discount,
          expiresAt: new Date(result.expiresAt),
        });
      } else {
        toast.info('Не повезло, но попробуй завтра!');
      }

      setCanSpin(false);

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка при вращении';
      toast.error(message);
    } finally {
      setIsSpinning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-3">
            <Gift className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Колесо удачи!</h3>
          <p className="text-sm text-gray-500 mt-1">
            {canSpin
              ? 'Крути и выиграй скидку до 20%!'
              : 'Приходи завтра за новой удачей!'}
          </p>
        </div>

        <div className="relative mx-auto mb-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-10">
            <div className="w-0 h-0 border-l-10 border-r-10 border-t-12 border-l-transparent border-r-transparent border-t-red-500" />
          </div>

          <div
            className="w-64 h-64 mx-auto rounded-full border-4 border-gray-200 shadow-lg transition-transform duration-[4000ms] ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(
                #9ca3af 0deg 45deg,
                #fbbf24 45deg 90deg,
                #f87171 90deg 135deg,
                #60a5fa 135deg 180deg,
                #34d399 180deg 225deg,
                #a78bfa 225deg 270deg,
                #60a5fa 270deg 315deg,
                #f87171 315deg 360deg
              )`,
            }}
          >
            {segments.map((val, i) => {
              const angle = (i * 45 + 22.5) * (Math.PI / 180);
              const x = 50 + 35 * Math.cos(angle - Math.PI / 2);
              const y = 50 + 35 * Math.sin(angle - Math.PI / 2);

              return (
                <span
                  key={i}
                  className={`absolute text-xs font-bold drop-shadow-md select-none ${
                    val === 0 ? 'text-gray-800' : 'text-white'
                  }`}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {val}%
                </span>
              );
            })}
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-gray-200 flex items-center justify-center shadow-md">
            <Gift className="text-primary" size={24} />
          </div>
        </div>

        <button
          onClick={handleSpin}
          disabled={isSpinning || !canSpin}
          className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
        >
          {isSpinning ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Крутим...
            </>
          ) : canSpin ? (
            'Крутить колесо!'
          ) : (
            'Вы уже крутили сегодня'
          )}
        </button>

        <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center space-y-1">
          <p>Скидка действует 1 час после выигрыша</p>
          <p>Крутить можно раз в сутки</p>
          <p>Скидка применяется к корзине автоматически</p>
        </div>
      </div>
    </div>
  );
}