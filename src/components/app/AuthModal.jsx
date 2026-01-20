/**
 * Neo-Brutalism Auth Modal
 * Simple OTP-based authentication
 */

import { useState, useEffect, useRef } from 'react';
import { X, Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, onSendOTP, onVerifyOTP }) => {
    const [step, setStep] = useState('email'); // 'email' | 'otp' | 'success'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const otpRefs = useRef([]);
    const emailInputRef = useRef(null);

    // Focus email input when modal opens
    useEffect(() => {
        if (isOpen && step === 'email') {
            setTimeout(() => emailInputRef.current?.focus(), 100);
        }
    }, [isOpen, step]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep('email');
                setEmail('');
                setOtp(['', '', '', '', '', '']);
                setError('');
                setLoading(false);
            }, 300);
        }
    }, [isOpen]);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!email || loading) return;

        setError('');
        setLoading(true);

        try {
            const result = await onSendOTP(email);
            if (result?.success !== false) {
                setStep('otp');
                setTimeout(() => otpRefs.current[0]?.focus(), 100);
            } else {
                setError(result?.error || 'Failed to send code');
            }
        } catch (err) {
            setError('Failed to send code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        // Auto-submit when complete
        if (index === 5 && value && newOtp.every(d => d)) {
            handleVerifyOTP(newOtp.join(''));
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            const newOtp = pasted.split('');
            setOtp(newOtp);
            handleVerifyOTP(pasted);
        }
    };

    const handleVerifyOTP = async (code) => {
        if (loading) return;

        setError('');
        setLoading(true);

        try {
            const result = await onVerifyOTP(email, code);
            if (result?.success !== false) {
                setStep('success');
                setTimeout(() => onClose(), 1500);
            } else {
                setError(result?.error || 'Invalid code');
                setOtp(['', '', '', '', '', '']);
                otpRefs.current[0]?.focus();
            }
        } catch (err) {
            // Handle both thrown errors and error messages
            const errorMessage = err?.message || err?.error || 'Verification failed. Please try again.';
            setError(errorMessage);
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title">
                        {step === 'email' && 'Sign In'}
                        {step === 'otp' && 'Enter Code'}
                        {step === 'success' && 'Welcome!'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 border-3 border-[var(--border-color)] bg-white flex items-center justify-center hover:bg-[var(--color-pink)] hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {/* Email Step */}
                    {step === 'email' && (
                        <form onSubmit={handleSendOTP}>
                            <p className="text-[var(--color-text-secondary)] mb-6">
                                Enter your email address. We'll send you a magic code.
                            </p>

                            <div className="relative mb-4">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                                <input
                                    ref={emailInputRef}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@email.com"
                                    className="input pl-12"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="badge badge-error mb-4 w-full justify-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="btn btn-primary w-full"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Send Magic Code
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* OTP Step */}
                    {step === 'otp' && (
                        <div>
                            <p className="text-[var(--color-text-secondary)] mb-2">
                                We sent a 6-digit code to
                            </p>
                            <p className="font-bold text-[var(--color-ink)] mb-6">
                                {email}
                            </p>

                            <div className="flex gap-2 justify-center mb-6" onPaste={handleOtpPaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (otpRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-2xl font-bold border-3 border-[var(--border-color)] bg-white focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                                    />
                                ))}
                            </div>

                            {error && (
                                <div className="badge badge-error mb-4 w-full justify-center">
                                    {error}
                                </div>
                            )}

                            {loading && (
                                <div className="flex items-center justify-center gap-2 text-[var(--color-text-secondary)]">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Verifying...</span>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="btn btn-ghost w-full mt-4"
                            >
                                Use Different Email
                            </button>
                        </div>
                    )}

                    {/* Success Step */}
                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-[var(--color-success)] border-4 border-[var(--border-color)] flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-[var(--color-ink)]" />
                            </div>
                            <p className="font-display text-xl font-bold uppercase">
                                You're in!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
