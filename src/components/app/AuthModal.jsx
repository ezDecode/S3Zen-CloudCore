/**
 * Auth Modal
 * Terracotta-themed OTP authentication with ncdai design system
 */

import { useState, useEffect, useRef } from 'react';
import { X, Mail, ArrowRight, Loader2, CheckCircle, Cloud } from 'lucide-react';

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
        try {
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
            if (pasted.length === 6) {
                const newOtp = pasted.split('');
                setOtp(newOtp);
                handleVerifyOTP(pasted);
            }
        } catch {
            // Ignore clipboard errors
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
            <div
                className="modal bg-card shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-modal-title"
            >
                {/* Header */}
                <div className="modal-header px-6 py-5 flex items-center justify-between bg-secondary/30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                            <Cloud className="w-4 h-4 text-brand" />
                        </div>
                        <div>
                            <h2 id="auth-modal-title" className="font-semibold text-base text-foreground">
                                {step === 'email' && 'Sign In'}
                                {step === 'otp' && 'Verify Code'}
                                {step === 'success' && 'Welcome Back'}
                            </h2>
                            <p className="text-xs text-muted-foreground">CloudCore Secure Access</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close authentication dialog"
                        className="rounded-lg w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body p-6">
                    {/* Email Step */}
                    {step === 'email' && (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Enter your email address and we'll send you a secure one-time code to access your account.
                            </p>

                            <div className="space-y-2">
                                <label className="text-xs tracking-widest text-muted-foreground uppercase font-medium px-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        ref={emailInputRef}
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        className="input pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive text-xs font-medium" role="alert" aria-live="polite">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="btn btn-brand w-full h-11 rounded-lg text-sm font-medium"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        Send Verification Code
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            <p className="text-[10px] text-muted-foreground/60 text-center">
                                By continuing, you agree to our Terms of Service
                            </p>
                        </form>
                    )}

                    {/* OTP Step */}
                    {step === 'otp' && (
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    We sent a 6-digit code to
                                </p>
                                <p className="font-semibold text-foreground text-base">
                                    {email}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs tracking-widest text-muted-foreground uppercase font-medium px-1">
                                    Verification Code
                                </label>
                                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
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
                                            className="w-11 h-13 text-center text-xl font-bold rounded-lg border-2 border-edge bg-card focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                                            style={{ borderStyle: digit ? 'solid' : 'dotted' }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive text-xs font-medium text-center" role="alert" aria-live="polite">
                                    {error}
                                </div>
                            )}

                            {loading && (
                                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Verifying...</span>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStep('email')}
                                    className="btn btn-ghost w-full h-10 rounded-lg text-sm font-medium"
                                >
                                    Use Different Email
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSendOTP({ preventDefault: () => { } })}
                                    disabled={loading}
                                    className="text-xs text-brand hover:text-brand/80 transition-colors font-medium"
                                >
                                    Resend Code
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Success Step */}
                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-brand" />
                            </div>
                            <p className="text-xl font-semibold text-foreground mb-2">
                                You're In!
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Redirecting to your dashboard...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
