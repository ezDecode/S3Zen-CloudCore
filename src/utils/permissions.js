/**
 * Permissions & Roles System
 * Defines the roles and capabilities for the application.
 * 
 * NOTE: This is currently a front-end only enforcement model.
 * Real security must be enforced server-side in a production environment.
 */

export const ROLES = {
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    EDITOR: 'EDITOR',
    VIEWER: 'VIEWER'
};

export const ACTIONS = {
    READ: 'READ',           // List objects, view details, download
    WRITE: 'WRITE',         // Upload files, create folders, rename
    SHARE: 'SHARE',         // Generate presigned URLs
    DELETE: 'DELETE',       // Delete objects
    MANAGE_TEAM: 'MANAGE_TEAM' // Add/remove members, change roles
};

const ROLE_PERMISSIONS = {
    [ROLES.OWNER]: [ACTIONS.READ, ACTIONS.WRITE, ACTIONS.SHARE, ACTIONS.DELETE, ACTIONS.MANAGE_TEAM],
    [ROLES.ADMIN]: [ACTIONS.READ, ACTIONS.WRITE, ACTIONS.SHARE, ACTIONS.DELETE, ACTIONS.MANAGE_TEAM],
    [ROLES.EDITOR]: [ACTIONS.READ, ACTIONS.WRITE, ACTIONS.SHARE, ACTIONS.DELETE],
    [ROLES.VIEWER]: [ACTIONS.READ]
};

/**
 * Check if a role can perform a specific action
 * @param {string} role - The user's role
 * @param {string} action - The action to perform
 * @returns {boolean}
 */
export const canPerform = (role, action) => {
    if (!role || !ROLE_PERMISSIONS[role]) return false;
    return ROLE_PERMISSIONS[role].includes(action);
};

/**
 * Get human-readable label for a role
 * @param {string} role 
 * @returns {string}
 */
export const getRoleLabel = (role) => {
    switch (role) {
        case ROLES.OWNER: return 'Owner';
        case ROLES.ADMIN: return 'Admin';
        case ROLES.EDITOR: return 'Editor';
        case ROLES.VIEWER: return 'Viewer';
        default: return role;
    }
};
