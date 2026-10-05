import type { Household } from '../domain/schemas';

// Obviously fictional placeholder people. Real members come from accounts in a later phase.
export const mockHousehold: Household = {
  id: 'household-demo',
  name: 'Example Household',
  members: [
    { id: 'member-1', displayName: 'Alex Example', role: 'owner' },
    { id: 'member-2', displayName: 'Sam Sample', role: 'member' },
  ],
};
