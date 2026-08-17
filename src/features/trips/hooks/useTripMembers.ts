import { useMemo } from 'react';
import { useTripStore } from '@/stores/tripStore';

export const useTripMembers = (tripId: string) => {
  const trips = useTripStore((state) => state.trips);
  
  const members = useMemo(() => {
    const trip = trips.find(t => t.id === tripId);
    return trip?.members || [];
  }, [tripId, trips]);

  const inviteMember = useTripStore((state) => state.inviteMember);
  const removeMember = useTripStore((state) => state.removeMember);
  const cancelInvitation = useTripStore((state) => state.cancelInvitation);
  const searchUsers = useTripStore((state) => state.searchUsers);

  return {
    members,
    inviteMember,
    removeMember,
    cancelInvitation,
    searchUsers,
  };
};
