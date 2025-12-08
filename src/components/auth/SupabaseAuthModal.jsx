/**
 * Supabase Authentication Modal
 * Sign Up / Sign In with email and password
 */

import { useState } from 'react';
import { Cancel01Icon, Mail01Icon, LockPasswordIcon } from 'hugeicons-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SupabaseAuthModal = ({ isOpen, onClose, onSignUp, onSignIn }) => {
    const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Password validation
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        // Confirm password for signup
        if (mode === 'signup' && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            if (mode === 'signup') {
                await onSignUp(formData.email, formData.password);
            } else {
                await onSignIn(formData.email, formData.password);
            }
            
            // Reset form on success
            setFormData({ email: '', password: '', confirmPassword: '' });
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = () => {
        setMode(mode === 'signin' ? 'signup' : 'signin');
        setError('');
        setFormData({ email: '', password: '', confirmPassword: '' });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-md bg-zinc-900 rounded-2xl shadow-2xl border border-white/10"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <Cancel01Icon className="w-5 h-5" />
                    </button>

                    {/* Header */}
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-1">
                            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-sm text-white/50">
                            {mode === 'signin' 
                                ? 'Sign in to manage your S3 buckets' 
                                : 'Get started with CloudCore'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail01Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 transition-colors"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <LockPasswordIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 transition-colors"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Confirm Password (Sign Up only) */}
                        {mode === 'signup' && (
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <LockPasswordIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 transition-colors"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-white/30 text-white font-semibold rounded-lg transition-colors duration-150"
                        >
                            {isLoading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                        </button>

                        {/* Switch Mode */}
                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={switchMode}
                                className="text-sm text-white/50 hover:text-white transition-colors"
                            >
                                {mode === 'signin' 
                                    ? "Don't have an account? Sign up" 
                                    : 'Already have an account? Sign in'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
