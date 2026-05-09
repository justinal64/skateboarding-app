import { useTrickStore } from '@/store/trickStore';

export function useUserScore(): number {
  const tricks = useTrickStore((state) => state.tricks);
  return tricks.reduce((sum, trick) => {
    if (trick.status === 'COMPLETED') {
      return sum + (trick.points ?? 10);
    }
    return sum;
  }, 0);
}
