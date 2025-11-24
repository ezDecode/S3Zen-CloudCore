import { createContext, useState, useContext, useEffect } from 'react';
import { ROLES, canPerform } from '../utils/permissions';

const TeamContext = createContext(null);

export const TeamProvider = ({ children }) => {
    // Mock current user
    const [currentUser, setCurrentUser] = useState({
        id: 'user-1',
        name: 'Demo User',
        email: 'user@example.com',
        role: ROLES.OWNER
    });

    // Mock team members
    const [members, setMembers] = useState([
        {
            id: 'user-1',
            name: 'Demo User',
            email: 'user@example.com',
            role: ROLES.OWNER
        },
        {
            id: 'user-2',
            name: 'Alice Admin',
            email: 'alice@example.com',
            role: ROLES.ADMIN
        },
        {
            id: 'user-3',
            name: 'Bob Editor',
            email: 'bob@example.com',
            role: ROLES.EDITOR
        },
        {
            id: 'user-4',
            name: 'Charlie Viewer',
            email: 'charlie@example.com',
            role: ROLES.VIEWER
        }
    ]);

    const setCurrentUserRole = (role) => {
        setCurrentUser(prev => ({ ...prev, role }));
        // Also update in members list
        setMembers(prev => prev.map(m =>
            m.id === currentUser.id ? { ...m, role } : m
        ));
    };

    const addMember = ({ name, email, role }) => {
        const newMember = {
            id: `user-${Date.now()}`,
            name,
            email,
            role
        };
        setMembers(prev => [...prev, newMember]);
    };

    const updateMemberRole = (id, newRole) => {
        setMembers(prev => prev.map(m =>
            m.id === id ? { ...m, role: newRole } : m
        ));

        // If updating self, update currentUser state too
        if (id === currentUser.id) {
            setCurrentUser(prev => ({ ...prev, role: newRole }));
        }
    };

    const removeMember = (id) => {
        setMembers(prev => prev.filter(m => m.id !== id));
    };

    const can = (action) => {
        return canPerform(currentUser.role, action);
    };

    return (
        <TeamContext.Provider value={{
            currentUser,
            members,
            setCurrentUserRole,
            addMember,
            updateMemberRole,
            removeMember,
            can
        }}>
            {children}
        </TeamContext.Provider>
    );
};

export const useTeamContext = () => {
    const context = useContext(TeamContext);
    if (!context) {
        throw new Error('useTeamContext must be used within a TeamProvider');
    }
    return context;
};
