'use server';

import { prisma } from '@/prisma/prisma-client';
import { auth } from '@/app/auth';

export async function checkWheelSpinStatus() {
  const session = await auth();
  if (!session?.user?.id) return { canSpin: false, hasSpunToday: false };

  const userId = Number(session.user.id);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySpin = await prisma.wheelSpin.findFirst({
    where: { userId, spunAt: { gte: today } }
  });

  if (todaySpin) {
    return { canSpin: false, hasSpunToday: true, discount: todaySpin.discount };
  }

  return { canSpin: true, hasSpunToday: false };
}

export async function spinWheel() {
  'use server';
  
  const session = await auth();
  if (!session?.user?.id) throw new Error('Войдите в аккаунт, чтобы крутить колесо!');

  const userId = Number(session.user.id);

  const { canSpin } = await checkWheelSpinStatus();
  if (!canSpin) {
    throw new Error('Ты уже крутил колесо сегодня!');
  }

  const rand = Math.random() * 100;
  let discount = 0;
  
  if (rand < 40) discount = 0;
  else if (rand < 70) discount = 5;
  else if (rand < 90) discount = 10;
  else if (rand < 98) discount = 15;
  else discount = 20;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); 

  await prisma.wheelSpin.create({
     data:{ userId, discount, expiresAt }
  });

  return { 
    discount, 
    expiresAt: expiresAt.toISOString() 
  };
}