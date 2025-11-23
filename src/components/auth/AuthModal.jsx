import React, { useState } from 'react';
import { X, ChevronDown, Lock, Key, Database, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AuthModal = ({ isOpen, onClose, onAuthenticate }) => {
    const [formData, setFormData] = useState({
        accessKeyId: '',
        secretAccessKey: '',
        bucketName: '',
        region: 'us-east-1'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.accessKeyId || !formData.secretAccessKey || !formData.bucketName) {
            setError('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await onAuthenticate(formData);
        } catch (err) {
            setError(err.message || 'Connection failed');
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-[var(--space-md)]">
                    {/* Backdrop with Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-lg"
                    >
                        {/* Modal Card */}
                        <div
                            className="relative bg-[var(--color-surface-dark)]/95 backdrop-blur-xl shadow-2xl border border-white/10 overflow-hidden"
                            style={{
                                borderRadius: 'var(--radius-2xl)',
                                padding: 'var(--space-xl)'
                            }}
                        >
                            {/* Decorative Top Highlight */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-purple-500 via-pink-500 to-purple-500 opacity-50" />

                            {/* Header */}
                            <div className="flex items-start justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Connect to S3</h2>
                                    <p className="text-sm text-white/50 mt-1">
                                        Enter your AWS credentials to continue
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                                    style={{ borderRadius: 'var(--radius-lg)' }}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-3 text-sm bg-red-500/10 border border-red-500/20 text-red-200"
                                        style={{
                                            padding: 'var(--space-sm) var(--space-md)',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                    >
                                        <Lock className="w-4 h-4 shrink-0" />
                                        {error}
                                    </motion.div>
                                )}

                                {/* Access Key ID */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-white/70 uppercase tracking-wider">
                                        <Key className="w-3.5 h-3.5 text-purple-400" />
                                        Access Key ID
                                    </label>
                                    <input
                                        name="accessKeyId"
                                        placeholder="AKIAIOSFODNN7EXAMPLE"
                                        value={formData.accessKeyId}
                                        onChange={handleChange}
                                        className="w-full text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                        style={{
                                            padding: '0.75rem 1rem', // Custom padding for inputs
                                            borderRadius: 'var(--radius-lg)'
                                        }}
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Secret Access Key */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-white/70 uppercase tracking-wider">
                                        <Lock className="w-3.5 h-3.5 text-pink-400" />
                                        Secret Access Key
                                    </label>
                                    <input
                                        name="secretAccessKey"
                                        type="password"
                                        placeholder="Your secret key"
                                        value={formData.secretAccessKey}
                                        onChange={handleChange}
                                        className="w-full text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all"
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: 'var(--radius-lg)'
                                        }}
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Bucket Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-white/70 uppercase tracking-wider">
                                        <Database className="w-3.5 h-3.5 text-blue-400" />
                                        Bucket Name
                                    </label>
                                    <input
                                        name="bucketName"
                                        placeholder="my-awesome-bucket"
                                        value={formData.bucketName}
                                        onChange={handleChange}
                                        className="w-full text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: 'var(--radius-lg)'
                                        }}
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Region Select */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-white/70 uppercase tracking-wider">
                                        <MapPin className="w-3.5 h-3.5 text-green-400" />
                                        AWS Region
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="region"
                                            value={formData.region}
                                            onChange={handleChange}
                                            className="w-full text-sm bg-white/5 border border-white/10 text-white appearance-none cursor-pointer outline-none focus:border-green-500/50 focus:bg-white/10 transition-all"
                                            style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: 'var(--radius-lg)'
                                            }}
                                        >
                                            <option value="us-east-1" className="bg-slate-900">US East (N. Virginia)</option>
                                            <option value="us-east-2" className="bg-slate-900">US East (Ohio)</option>
                                            <option value="us-west-1" className="bg-slate-900">US West (N. California)</option>
                                            <option value="us-west-2" className="bg-slate-900">US West (Oregon)</option>
                                            <option value="eu-west-1" className="bg-slate-900">EU (Ireland)</option>
                                            <option value="eu-central-1" className="bg-slate-900">EU (Frankfurt)</option>
                                            <option value="ap-south-1" className="bg-slate-900">Asia Pacific (Mumbai)</option>
                                            <option value="ap-southeast-1" className="bg-slate-900">Asia Pacific (Singapore)</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none w-5 h-5" />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full font-semibold text-white bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
                                    style={{
                                        marginTop: 'var(--space-sm)',
                                        padding: 'var(--space-md)',
                                        borderRadius: 'var(--radius-xl)'
                                    }}
                                >
                                    {isLoading ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                            <span>Connecting...</span>
                                        </>
                                    ) : (
                                        <span>Connect to Bucket</span>
                                    )}
                                </button>

                                {/* Help Text */}
                                <p className="text-xs text-center text-white/30">
                                    Credentials are encrypted and stored locally
                                </p>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};