/**
 * Auth Modal
 * Black/White/Orange themed OTP authentication with ncdai design system
 */

import { useState, useEffect, useRef } from 'react';
import { X, Mail, ArrowRight, Loader2, CheckCircle, Cloud } from 'lucide-react';
import { Button } from '../ui/button';

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
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
        if (index === 5 && value && newOtp.every(d => d)) handleVerifyOTP(newOtp.join(''));
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
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
        } catch { }
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
            setError(err?.message || 'Verification failed');
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-lg bg-card shadow-2xl border border-border/50 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 flex items-center justify-between border-b border-dotted border-border/50">
                    <div className="flex items-center gap-4">
                        <img src="/logos/logo-black.svg" alt="Orbit" className="h-10 block dark:hidden" />
                        <img src="/logos/logo-white.svg" alt="Orbit" className="h-10 hidden dark:block" />
                        <div className="h-8 w-px bg-border/50" />
                        <div>
                            <h2 className="font-display font-medium text-xl tracking-tight">
                                {step === 'email' && 'Authenticate'}
                                {step === 'otp' && 'Verify Session'}
                                {step === 'success' && 'Authenticated'}
                            </h2>
                            {/* <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Secure Access</p> */}
                        </div>
                    </div>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="icon"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Body */}
                <div className="p-8">
                    {step === 'email' && (
                        <form onSubmit={handleSendOTP} className="space-y-8">
                            <p className="text-base text-muted-foreground leading-relaxed">
                                Enter your email for a zero-knowledge handshake. We'll send a one-time secure code.
                            </p>

                            <div className="space-y-3">
                                <label className="text-xs tracking-widest text-muted-foreground uppercase font-medium px-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        ref={emailInputRef}
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="user@orbit.xyz"
                                        className="input h-14 pl-12 rounded-xl text-base"
                                        required
                                    />
                                </div>
                            </div>

                            {error && <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive text-sm">{error}</div>}

                            <Button
                                type="submit"
                                disabled={loading || !email}
                                size="lg"
                                className="w-full"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Generate Code <ArrowRight className="w-5 h-5 ml-2" /></>}
                            </Button>
                        </form>
                    )}

                    {step === 'otp' && (
                        <div className="space-y-8 text-center">
                            <div>
                                <p className="text-muted-foreground mb-1">Code sent to</p>
                                <p className="font-medium text-lg text-foreground">{email}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
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
                                            className="w-12 h-16 text-center text-2xl font-mono font-medium rounded-xl border-2 border-dotted border-border focus:border-brand focus:border-solid focus:ring-4 focus:ring-brand/10 outline-none transition-all"
                                            style={{ borderColor: digit ? 'var(--brand)' : '', borderStyle: digit ? 'solid' : 'dotted' }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {error && <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive text-sm">{error}</div>}

                            <div className="flex flex-col gap-4">
                                <Button variant="link" size="sm" onClick={() => setStep('email')}>Use different email</Button>
                                <Button variant="ghost" size="sm" className="text-brand hover:text-brand/80" onClick={() => handleSendOTP({ preventDefault: () => { } })} disabled={loading}>Resend code</Button>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-10">
                            <div className="w-20 h-20 bg-brand/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-brand" />
                            </div>
                            <h3 className="text-2xl font-display font-bold mb-2 uppercase tracking-tight">Access Granted</h3>
                            <p className="text-muted-foreground">Synchronizing your S3 environment...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
