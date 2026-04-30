import { axiosInstance } from './instance';
import { ApiRoutes } from './constans';
import { Occasion } from '@prisma/client';

export const getAll = async (): Promise<Occasion[]> => {
  return (await axiosInstance.get<Occasion[]>(ApiRoutes.OCCASIONS)).data;
};