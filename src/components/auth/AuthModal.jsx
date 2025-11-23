import { useState } from 'react';
import { X, ChevronDown, Lock, Key, Database, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AWS_REGIONS = [
    { value: 'us-east-1', label: 'US East (N. Virginia)' },
    { value: 'us-east-2', label: 'US East (Ohio)' },
    { value: 'us-west-1', label: 'US West (N. California)' },
    { value: 'us-west-2', label: 'US West (Oregon)' },
    { value: 'af-south-1', label: 'Africa (Cape Town)' },
    { value: 'ap-east-1', label: 'Asia Pacific (Hong Kong)' },
    { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
    { value: 'ap-south-2', label: 'Asia Pacific (Hyderabad)' },
    { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
    { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
    { value: 'ap-southeast-3', label: 'Asia Pacific (Jakarta)' },
    { value: 'ap-southeast-4', label: 'Asia Pacific (Melbourne)' },
    { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
    { value: 'ap-northeast-2', label: 'Asia Pacific (Seoul)' },
    { value: 'ap-northeast-3', label: 'Asia Pacific (Osaka)' },
    { value: 'ca-central-1', label: 'Canada (Central)' },
    { value: 'ca-west-1', label: 'Canada West (Calgary)' },
    { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
    { value: 'eu-central-2', label: 'Europe (Zurich)' },
    { value: 'eu-west-1', label: 'Europe (Ireland)' },
    { value: 'eu-west-2', label: 'Europe (London)' },
    { value: 'eu-west-3', label: 'Europe (Paris)' },
    { value: 'eu-north-1', label: 'Europe (Stockholm)' },
    { value: 'eu-south-1', label: 'Europe (Milan)' },
    { value: 'eu-south-2', label: 'Europe (Spain)' },
    { value: 'il-central-1', label: 'Israel (Tel Aviv)' },
    { value: 'me-south-1', label: 'Middle East (Bahrain)' },
    { value: 'me-central-1', label: 'Middle East (UAE)' },
    { value: 'sa-east-1', label: 'South America (São Paulo)' }
];

export const AuthModal = ({ isOpen, onClose, onAuthenticate }) => {
    const [formData, setFormData] = useState({
        accessKeyId: '',
        secretAccessKey: '',
        bucketName: '',
        region: 'eu-north-1'
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-md z-50"
                    >
                        {/* Modal Card */}
                        <div className="relative bg-[var(--color-surface-dark)] backdrop-blur-xl shadow-2xl border border-white/10 rounded-2xl overflow-hidden">
                            {/* Decorative Top Highlight */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

                            {/* Header */}
                            <div className="flex items-start justify-between p-6 pb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Connect to S3</h2>
                                    <p className="text-sm text-white/60 mt-1.5">
                                        Enter your AWS credentials to continue
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-white/40 hover:text-white hover:bg-white/10 transition-all rounded-lg -mr-2 -mt-1"
                                    aria-label="Close modal"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-3 text-sm bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg"
                                    >
                                        <Lock className="w-4 h-4 shrink-0" />
                                        {error}
                                    </motion.div>
                                )}

                                {/* Access Key ID */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-medium text-white/70 uppercase tracking-wide">
                                        <Key className="w-4 h-4 text-purple-400" />
                                        Access Key ID
                                    </label>
                                    <input
                                        name="accessKeyId"
                                        placeholder="AKIAIOSFODNN7EXAMPLE"
                                        value={formData.accessKeyId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-lg outline-none focus:border-purple-500/50 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Secret Access Key */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-medium text-white/70 uppercase tracking-wide">
                                        <Lock className="w-4 h-4 text-pink-400" />
                                        Secret Access Key
                                    </label>
                                    <input
                                        name="secretAccessKey"
                                        type="password"
                                        placeholder="Your secret key"
                                        value={formData.secretAccessKey}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-lg outline-none focus:border-pink-500/50 focus:bg-white/10 focus:ring-2 focus:ring-pink-500/20 transition-all"
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Bucket Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-medium text-white/70 uppercase tracking-wide">
                                        <Database className="w-4 h-4 text-blue-400" />
                                        Bucket Name
                                    </label>
                                    <input
                                        name="bucketName"
                                        placeholder="my-awesome-bucket"
                                        value={formData.bucketName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-lg outline-none focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Region Select */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-medium text-white/70 uppercase tracking-wide">
                                        <MapPin className="w-4 h-4 text-green-400" />
                                        AWS Region
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="region"
                                            value={formData.region}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 pr-10 text-sm bg-white/5 border border-white/10 text-white appearance-none cursor-pointer rounded-lg outline-none focus:border-green-500/50 focus:bg-white/10 focus:ring-2 focus:ring-green-500/20 transition-all"
                                            style={{
                                                backgroundImage: 'none'
                                            }}
                                        >
                                            {AWS_REGIONS.map((region) => (
                                                <option 
                                                    key={region.value} 
                                                    value={region.value} 
                                                    className="bg-zinc-900 text-white py-2"
                                                >
                                                    {region.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none w-5 h-5" />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full mt-2 px-6 py-3.5 font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/30 rounded-xl flex items-center justify-center gap-2"
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
                                <p className="text-xs text-center text-white/40 pt-1">
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