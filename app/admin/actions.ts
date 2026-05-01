'use server';

import { prisma } from '@/prisma/prisma-client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/app/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { OrderStatus } from '@prisma/client';

const CAKE_CATEGORIES = ['Авторские', 'Бенто-торты', 'Свадебные'];

async function saveImage(file: File | null, currentUrl?: string): Promise<string> {
  if (!file || file.size === 0) {
    return currentUrl || '/img/placeholder.jpg';
  }
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const extension = file.name.split('.').pop();
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
  const folderPath = path.join(process.cwd(), 'public', 'img');
  await mkdir(folderPath, { recursive: true });
  const filePath = path.join(folderPath, uniqueName);
  await writeFile(filePath, buffer);
  return `/img/${uniqueName}`;
}

export async function updateUserRole(userId: number, newRole: 'USER' | 'ADMIN') {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Не авторизован');
  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (currentUser?.id === userId) throw new Error('Нельзя менять роль самому себе');
  await prisma.user.update({ where: { id: userId }, data: { role: newRole } });
  revalidatePath('/admin/users');
}

export async function deleteUser(userId: number) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Не авторизован');
  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (currentUser?.id === userId) throw new Error('Нельзя удалить свой аккаунт');
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath('/admin/users');
}

export async function updateOrderStatus(orderId: number, status: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Не авторизован');
  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  });
  revalidatePath('/admin/orders');
}

async function syncProductItems(productId: number, weights: Array<{ price: number; weight: number | null }>) {
  await prisma.productItem.deleteMany({ where: { productId } });
  if (weights.length > 0) {
    await prisma.productItem.createMany({ 
      data: weights.map(w => ({ productId, price: w.price, weight: w.weight })) 
    });
  }
}

async function syncProductFillings(productId: number, fillingIds: number[]) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { items: { include: { fillings: true } } }
  });
  const existingItem = product?.items[0];
  if (!existingItem) return;
  await prisma.productItem.update({
    where: { id: existingItem.id },
    data: {
      fillings: { set: fillingIds.map(id => ({ id })) }
    }
  });
}


export async function createProduct(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Не авторизован');
  const name = formData.get('name') as string;
  const categoryId = Number(formData.get('categoryId'));
  const occasionId = Number(formData.get('occasionId'));
  const imageFile = formData.get('imageFile') as File;
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  const isCake = CAKE_CATEGORIES.includes(category?.name.trim() || '');
  const imageUrl = await saveImage(imageFile);
  const product = await prisma.product.create({
    data: { name, imageUrl, categoryId, occasionId },
  });
  if (isCake) {
    const prices = formData.getAll('price[]');
    const weights = formData.getAll('weight[]');
    const weightVariants: Array<{ price: number; weight: number | null }> = [];
    for (let i = 0; i < prices.length; i++) {
      const price = Number(prices[i]);
      if (!price) continue;
      const weightRaw = weights[i];
      const weight = weightRaw && weightRaw !== '' ? Number(weightRaw) : null;
      weightVariants.push({ price, weight });
    }
    await syncProductItems(product.id, weightVariants);
    const fillingIds = formData.getAll('fillingId[]').map(id => Number(id)).filter(id => id > 0);
    await syncProductFillings(product.id, fillingIds);
  } else {
    const price = Number(formData.get('price'));
    await syncProductItems(product.id, [{ price, weight: null }]);
  }
  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export async function updateProduct(id: number, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Не авторизован');
  const name = formData.get('name') as string;
  const categoryId = Number(formData.get('categoryId'));
  const occasionId = Number(formData.get('occasionId'));
  const imageFile = formData.get('imageFile') as File;
  const currentImageUrl = formData.get('currentImageUrl') as string;
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  const isCake = CAKE_CATEGORIES.includes(category?.name.trim() || '');
  const imageUrl = await saveImage(imageFile, currentImageUrl);
  await prisma.product.update({
    where: { id },
    data: { name, imageUrl, categoryId, occasionId },
  });
  if (isCake) {
    const prices = formData.getAll('price[]');
    const weights = formData.getAll('weight[]');
    const weightVariants: Array<{ price: number; weight: number | null }> = [];
    for (let i = 0; i < prices.length; i++) {
      const price = Number(prices[i]);
      if (!price) continue;
      const weightRaw = weights[i];
      const weight = weightRaw && weightRaw !== '' ? Number(weightRaw) : null;
      weightVariants.push({ price, weight });
    }
    await syncProductItems(id, weightVariants);
    const fillingIds = formData.getAll('fillingId[]').map(id => Number(id)).filter(id => id > 0);
    await syncProductFillings(id, fillingIds);
  } else {
    const price = Number(formData.get('price'));
    await syncProductItems(id, [{ price, weight: null }]);
  }
  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export async function deleteProduct(id: number) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Не авторизован');
  await prisma.productItem.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  revalidatePath('/admin/products');
}