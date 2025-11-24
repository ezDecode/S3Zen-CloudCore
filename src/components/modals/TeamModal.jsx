/**
 * TeamModal Component
 * Manage team members and roles
 */

import { useState } from 'react';
import { Cancel01Icon, UserGroupIcon, Add01Icon, Delete02Icon, Tick02Icon } from 'hugeicons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../common/Toast';
import { useTeam } from '../../hooks/useTeam';
import { ROLES, ACTIONS, getRoleLabel } from '../../utils/permissions';

export const TeamModal = ({ isOpen, onClose }) => {
    const toast = useToast();
    const { members, currentUser, addMember, updateMemberRole, removeMember, can } = useTeam();
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberRole, setNewMemberRole] = useState(ROLES.VIEWER);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddMember = (e) => {
        e.preventDefault();
        if (!newMemberEmail || !newMemberName) return;

        addMember({
            name: newMemberName,
            email: newMemberEmail,
            role: newMemberRole
        });

        setNewMemberName('');
        setNewMemberEmail('');
        setNewMemberRole(ROLES.VIEWER);
        setIsAdding(false);
        toast.success('Team member added');
    };

    const handleRemoveMember = (id) => {
        if (confirm('Are you sure you want to remove this member?')) {
            removeMember(id);
            toast.success('Member removed');
        }
    };

    const handleRoleChange = (id, newRole) => {
        updateMemberRole(id, newRole);
        toast.success('Role updated');
    };

    if (!isOpen) return null;

    const canManage = can(ACTIONS.MANAGE_TEAM);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-zinc-900/98 backdrop-blur-2xl rounded-2xl shadow-2xl w-full max-w-2xl border border-white/10 z-50 overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-2">
                                <UserGroupIcon className="w-5 h-5 text-blue-400" />
                                <h2 className="text-lg font-bold text-white">Team Management</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            >
                                <Cancel01Icon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                            {/* Add Member Section */}
                            {canManage && (
                                <div className="mb-8">
                                    {!isAdding ? (
                                        <button
                                            onClick={() => setIsAdding(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <Add01Icon className="w-4 h-4" />
                                            <span>Add Member</span>
                                        </button>
                                    ) : (
                                        <form onSubmit={handleAddMember} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-semibold text-white">Add New Member</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAdding(false)}
                                                    className="text-zinc-400 hover:text-white"
                                                >
                                                    <Cancel01Icon className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-zinc-400 mb-1.5">Name</label>
                                                    <input
                                                        type="text"
                                                        value={newMemberName}
                                                        onChange={(e) => setNewMemberName(e.target.value)}
                                                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50"
                                                        placeholder="John Doe"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-zinc-400 mb-1.5">Email</label>
                                                    <input
                                                        type="email"
                                                        value={newMemberEmail}
                                                        onChange={(e) => setNewMemberEmail(e.target.value)}
                                                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50"
                                                        placeholder="john@example.com"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-zinc-400 mb-1.5">Role</label>
                                                <div className="flex gap-2">
                                                    {Object.values(ROLES).map((role) => (
                                                        <button
                                                            key={role}
                                                            type="button"
                                                            onClick={() => setNewMemberRole(role)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${newMemberRole === role
                                                                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                                                : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            {getRoleLabel(role)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex justify-end pt-2">
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Add Member
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* Members List */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                                    Team Members ({members.length})
                                </h3>

                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/[0.07] transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-white">{member.name}</p>
                                                    {member.id === currentUser.id && (
                                                        <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-zinc-300">You</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-400">{member.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {canManage && member.id !== currentUser.id ? (
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                    className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-blue-500/50 cursor-pointer"
                                                >
                                                    {Object.values(ROLES).map((role) => (
                                                        <option key={role} value={role} className="bg-zinc-900">
                                                            {getRoleLabel(role)}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className="px-2 py-1 bg-white/5 rounded-lg text-xs text-zinc-400 border border-white/5">
                                                    {getRoleLabel(member.role)}
                                                </span>
                                            )}

                                            {canManage && member.id !== currentUser.id && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Remove member"
                                                >
                                                    <Delete02Icon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Disclaimer */}
                        <div className="p-4 bg-white/5 border-t border-white/10 text-center">
                            <p className="text-xs text-zinc-500">
                                Note: This is a frontend-only demonstration. In a production environment,
                                these roles would be enforced by backend security policies.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
