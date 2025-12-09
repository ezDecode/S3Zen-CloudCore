/**
 * Supabase Authentication Modal
 * Email OTP (One-Time Password) Authentication
 * 
 * NOTE: By default, Supabase sends Magic Links, not OTP codes.
 * To receive 6-digit OTP codes instead of links, you must configure 
 * the email template in Supabase Dashboard.
 * 
 * See: docs/SUPABASE_OTP_SETUP.md for configuration instructions
 */

import { useState } from 'react';
import { Cancel01Icon, Mail01Icon, LockKeyIcon } from 'hugeicons-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SupabaseAuthModal = ({ isOpen, onClose, onSendOTP, onVerifyOTP }) => {
    const [step, setStep] = useState('email'); // 'email' or 'otp'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOTP = async (e) => {
        e.preventDefault();
        
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await onSendOTP(email);
            setStep('otp');
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        
        const otpString = otp.join('');
        if (!otpString || otpString.length !== 6) {
            setError('Please enter the 6-digit code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await onVerifyOTP(email, otpString);
            // Only reset form on successful verification
            if (result?.success) {
                setEmail('');
                setOtp(['', '', '', '', '', '']);
                setStep('email');
            }
        } catch (err) {
            // Show error inline, do NOT trigger logout
            setError(err.message || 'Invalid code. Please try again.');
            // Clear OTP fields for retry
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } finally {
            setIsLoading(false);
        }
    };
    const handleBack = () => {
        setStep('email');
        setOtp(['', '', '', '', '', '']);
        setError('');
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);
        setError('');
        
        const nextEmptyIndex = newOtp.findIndex(val => !val);
        if (nextEmptyIndex !== -1) {
            document.getElementById(`otp-${nextEmptyIndex}`)?.focus();
        } else {
            document.getElementById('otp-5')?.focus();
        }
    };

    const handleResendOTP = async () => {
        setIsLoading(true);
        setError('');
        try {
            await onSendOTP(email);
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } catch (err) {
            setError(err.message || 'Failed to resend OTP');
        } finally {
            setIsLoading(false);
        }
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
                            {step === 'email' ? 'Welcome to CloudCore' : 'Verify Your Email'}
                        </h2>
                        <p className="text-sm text-white/50">
                            {step === 'email' 
                                ? 'Sign in or create an account with your email' 
                                : `We sent a 6-digit code to ${email}`}
                        </p>
                    </div>

                    {/* Email Step */}
                    {step === 'email' && (
                        <form onSubmit={handleSendOTP} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail01Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="you@example.com"
                                        className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 transition-colors"
                                        disabled={isLoading}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-white/30 text-white font-semibold rounded-lg transition-colors duration-150"
                            >
                                {isLoading ? 'Sending code...' : 'Send verification code'}
                            </button>

                            <p className="text-xs text-center text-white/40">
                                We'll send a 6-digit code to your email. New users will be automatically registered.
                            </p>
                        </form>
                    )}
                    {/* OTP Step */}
                    {step === 'otp' && (
                        <form onSubmit={handleVerifyOTP} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2 text-center">
                                    Enter Verification Code
                                </label>
                                <div className="flex justify-center gap-2 mt-4">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            onPaste={handleOtpPaste}
                                            maxLength={1}
                                            className="w-12 h-14 bg-zinc-800 border-2 border-zinc-700 rounded-lg text-white text-2xl text-center font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                                            disabled={isLoading}
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={isLoading || otp.join('').length !== 6}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-white/30 text-white font-semibold rounded-lg transition-colors duration-150"
                            >
                                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                            </button>

                            <div className="flex items-center justify-between text-sm">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="text-white/50 hover:text-white transition-colors"
                                >
                                    ← Change email
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={isLoading}
                                    className="text-emerald-500 hover:text-emerald-400 disabled:text-white/30 transition-colors"
                                >
                                    Resend code
                                </button>
                            </div>

                            <p className="text-xs text-center text-white/40">
                                Code expires in 1 hour. Check your spam folder if you don't see it.
                            </p>
                        </form>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
