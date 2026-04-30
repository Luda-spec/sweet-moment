import { Product } from '@prisma/client';
import { axiosInstance } from './instance';
import { ApiRoutes } from './constans';

export const search = async (query: string): Promise<Product[]> => {
  return (await axiosInstance.get<Product[]>(ApiRoutes.SEARCH_PRODUCTS, { params: { query } }))
    .data;
};