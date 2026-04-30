import { prisma } from "@/prisma/prisma-client";
import { Prisma } from "@prisma/client";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    occasion: true;
    items: { 
      include: { 
        fillings: true 
      } 
    };
  };
}>;

export async function getHomePageData(searchParams: Promise<{ [key: string]: string | string[] | undefined }>) {
  const params = await searchParams;
  
  const priceFrom = params.priceFrom ? Number(params.priceFrom) : undefined;
  const priceTo = params.priceTo ? Number(params.priceTo) : undefined;
  
  const occasions = params.occasions 
    ? (Array.isArray(params.occasions) ? params.occasions : params.occasions.split(',')).map(Number) 
    : undefined;

  const types = params.types 
    ? (Array.isArray(params.types) ? params.types : params.types.split(','))
    : [];

  const sortBy = (Array.isArray(params.sortBy) ? params.sortBy[0] : params.sortBy) === 'desc' ? 'desc' : 'asc';

  const whereConditions: Prisma.ProductWhereInput[] = [];

  if (priceFrom || priceTo) {
    whereConditions.push({
      items: {
        some: {
          price: {
            ...(priceFrom && { gte: priceFrom }),
            ...(priceTo && { lte: priceTo }),
          },
        },
      },
    });
  }

  if (occasions && occasions.length > 0) {
    whereConditions.push({
      occasionId: { in: occasions },
    });
  }

  if (types.length > 0) {
    if (types.includes('cake') && !types.includes('other')) {
      whereConditions.push({
        items: { some: { fillings: { some: {} } } }
      });
    } else if (types.includes('other') && !types.includes('cake')) {
      whereConditions.push({
        items: { every: { fillings: { none: {} } } }
      });
    }
  }

  const productsWhere: Prisma.ProductWhereInput = 
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  const categories = await prisma.category.findMany({
    include: {
      products: {
        where: productsWhere, 
        include: {
          occasion: true,
          items: {
            include: {
              fillings: true,
            },
          },
        },
      },
    },
  });

  const sortedCategories = categories.map(cat => ({
    ...cat,
    products: [...cat.products].sort((a, b) => {
      const priceA = a.items[0]?.price || 0;
      const priceB = b.items[0]?.price || 0;
      return sortBy === 'asc' ? priceA - priceB : priceB - priceA;
    })
  }));

  const categoriesWithProducts = sortedCategories.filter(cat => cat.products.length > 0);

  let selectedProduct: ProductWithRelations | null = null;
  if (params.product) {
    const productId = Array.isArray(params.product) ? params.product[0] : params.product;
    selectedProduct = await prisma.product.findFirst({
      where: { id: Number(productId) },
      include: {
        occasion: true,
        items: { include: { fillings: true } },
      },
    }) as ProductWithRelations | null;
  }

  const isCake = selectedProduct?.items.some((item) => item.fillings.length > 0) ?? false;

  return {
    categories: categoriesWithProducts,
    selectedProduct,
    isCake
  };
}