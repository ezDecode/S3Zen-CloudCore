/**
 * Auth Modal
 * Black/White/Orange themed OTP authentication with ncdai design system
 */

import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';



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
                const errMsg = result?.error || 'Failed to send code';
                setError(errMsg);
                throw new Error(errMsg);
            }
        } catch (err) {
            setError('Failed to send code. Please try again.');
            throw err;
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
                const errMsg = result?.error || 'Invalid code';
                setError(errMsg);
                setOtp(['', '', '', '', '', '']);
                otpRefs.current[0]?.focus();
                throw new Error(errMsg);
            }
        } catch (err) {
            const errMsg = err?.message || 'Verification failed';
            setError(errMsg);
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
            throw new Error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-md bg-card shadow-2xl border border-border/50 rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <img src="/logos/logo-black.svg" alt="Orbit" className="h-7 block dark:hidden" />
                        <img src="/logos/logo-white.svg" alt="Orbit" className="h-7 hidden dark:block" />
                        <div className="h-5 w-px bg-border/50" />
                        <h2 className="font-display font-medium text-lg tracking-tight">
                            {step === 'email' && 'Authenticate'}
                            {step === 'otp' && 'Verify Session'}
                            {step === 'success' && 'Authenticated'}
                        </h2>
                    </div>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground/50 hover:text-foreground transition-colors"
                    >
                        <Icon icon="solar:close-circle-linear" className="w-5 h-5" />
                    </Button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {step === 'email' && (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <p className="text-description">
                                Enter your email for a zero-knowledge handshake. We'll send a one-time secure code.
                            </p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-label px-1">Email Address</label>
                                    <div className="relative">
                                        <Icon icon="solar:letter-linear" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                                        <Input
                                            ref={emailInputRef}
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="user@orbit.xyz"
                                            className="h-11 pl-10 rounded-md text-sm bg-secondary/20 border-transparent focus:bg-background transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive text-xs">{error}</div>}

                            <Button
                                type="submit"
                                onClick={handleSendOTP}
                                disabled={loading || !email}
                                className="w-full bg-brand hover:bg-brand/90 hover:ring-brand"
                            >
                                Generate Code
                            </Button>
                        </form>
                    )}

                    {step === 'otp' && (
                        <div className="space-y-6 text-center">
                            <div>
                                <p className="text-label mb-1">Code sent to</p>
                                <p className="font-medium text-base text-foreground">{email}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-2.5 justify-center" onPaste={handleOtpPaste}>
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
                                            className="w-12 h-12 text-center text-lg font-mono font-medium rounded-md border-dashed border border-border bg-secondary/10 focus:border-brand focus:border-solid focus:ring-4 focus:ring-brand/5 outline-none transition-all"
                                            style={{
                                                borderColor: digit ? 'var(--brand)' : '',
                                                borderStyle: digit ? 'solid' : 'dashed',
                                                background: digit ? 'transparent' : ''
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {error && <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive text-xs">{error}</div>}

                            <div className="flex flex-col gap-2">
                                <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setStep('email')}>Use different email</Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 px-4 text-brand hover:text-brand hover:bg-brand/5 cursor-pointer transition-all"
                                    onClick={() => handleSendOTP({ preventDefault: () => { } })}
                                    disabled={loading}
                                >
                                    Resend code
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-14 h-14 bg-brand/10 rounded-lg flex items-center justify-center mx-auto mb-5">
                                <Icon icon="solar:check-circle-linear" className="w-7 h-7 text-brand" />
                            </div>
                            <h3 className="font-display font-bold text-xl mb-1.5 tracking-tight">Access Granted</h3>
                            <p className="text-description px-8">Your environment is synchronized and ready for use.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
