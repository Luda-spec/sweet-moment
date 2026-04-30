import { Api } from '@/services/api-client';
import { Occasion } from '@prisma/client';
import React from 'react';
import { useSet } from 'react-use';

interface ReturnProps {
    occasions: Occasion[];
    loading: boolean;
    selectedIds: Set<string>;
    onAddId: (id: string) => void;
}

export const useFilterOccasions = (): ReturnProps => {
    const [occasions, setOccasions] = React.useState<Occasion[]>([]);
    const [loading, setLoading] = React.useState(true);

    const [selectedIds, { toggle }] = useSet(new Set<string>());

  React.useEffect(() => {
    async function fetchOccasions() {
      try {
        setLoading(true);
        const occasions = await Api.occasions.getAll();
        setOccasions(occasions);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    fetchOccasions();
  }, []);

  return { occasions, loading, onAddId: toggle, selectedIds };
};