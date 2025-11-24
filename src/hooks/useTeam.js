import { useTeamContext } from '../contexts/TeamContext';

/**
 * Hook to access team and permissions state
 * @returns {Object} Team context values
 */
export const useTeam = () => {
    return useTeamContext();
};
