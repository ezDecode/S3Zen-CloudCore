/**
 * Bucket Setup
 * ncdai design system implementation
 * AWS configuration with grid lines and screen-line separators
 */

import { useState } from 'react';
import bucketManagerService from '../../services/bucketManagerService';
import { toast } from 'sonner';
import { Shield, Database, ArrowRight, CheckCircle, Loader2, Sun, Moon, Twitter, Github, Linkedin, Cloud } from 'lucide-react';
import { DiagonalSeparator as Separator } from '../ui/DiagonalSeparator';
import { Button } from '../ui/button';

export const BucketSetup = ({ user, onComplete }) => {
    // ... state and handlers remain the same ...
    const [formData, setFormData] = useState({
        bucketName: '',
        region: 'eu-north-1',
        accessKeyId: '',
        secretAccessKey: '',
        endpoint: ''
    });

    const [loading, setLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('idle');
    const [error, setError] = useState(null);

    const regions = [
        { value: 'us-east-1', label: 'US East (N. Virginia)' },
        { value: 'us-east-2', label: 'US East (Ohio)' },
        { value: 'us-west-1', label: 'US West (N. California)' },
        { value: 'us-west-2', label: 'US West (Oregon)' },
        { value: 'af-south-1', label: 'Africa (Cape Town)' },
        { value: 'ap-east-1', label: 'Asia Pacific (Hong Kong)' },
        { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
        { value: 'ap-northeast-3', label: 'Asia Pacific (Osaka)' },
        { value: 'ap-northeast-2', label: 'Asia Pacific (Seoul)' },
        { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
        { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
        { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
        { value: 'ca-central-1', label: 'Canada (Central)' },
        { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
        { value: 'eu-west-1', label: 'Europe (Ireland)' },
        { value: 'eu-west-2', label: 'Europe (London)' },
        { value: 'eu-south-1', label: 'Europe (Milan)' },
        { value: 'eu-west-3', label: 'Europe (Paris)' },
        { value: 'eu-north-1', label: 'Europe (Stockholm)' },
        { value: 'me-south-1', label: 'Middle East (Bahrain)' },
        { value: 'sa-east-1', label: 'South America (São Paulo)' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const validate = () => {
        if (!formData.bucketName) return 'Bucket name is required';
        if (!formData.accessKeyId) return 'Access Key ID is required';
        if (!formData.secretAccessKey) return 'Secret Access Key is required';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) { toast.error(validationError); return; }

        setLoading(true);
        setConnectionStatus('testing');
        setError(null);

        try {
            const verifyResult = await bucketManagerService.validateBucket(formData);
            if (!verifyResult.success) throw new Error(verifyResult.error || 'Connection failed');
            toast.success('Connection verified');
            const saveResult = await bucketManagerService.addBucket(formData);
            if (!saveResult.success && saveResult.error) throw new Error(saveResult.error);
            setConnectionStatus('success');
            const bucket = saveResult.bucket || saveResult;
            setFormData(prev => ({ ...prev, accessKeyId: '', secretAccessKey: '' }));
            setTimeout(() => onComplete(bucket), 1000);
        } catch (err) {
            if (bucketManagerService.useMock) {
                setConnectionStatus('success');
                const bucketData = { bucketName: formData.bucketName, region: formData.region, id: 'mock-' + Date.now() };
                onComplete(bucketData);
                return;
            }
            setConnectionStatus('error');
            setError(err.message || 'Failed to connect to cluster');
        } finally { setLoading(false); }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 w-full">
            <main className="flex min-h-screen flex-col bg-background border-x max-w-[70rem] w-full">
                <div className="flex-1 w-full flex flex-col">
                    {/* Header */}
                    <header className="flex items-center justify-between w-full md:p-16 p-8 pb-4 md:pb-8">
                        <div className="flex items-center gap-4">
                            <img src="/logos/logo-black.svg" alt="Orbit" className="h-10 block dark:hidden" />
                            <img src="/logos/logo-white.svg" alt="Orbit" className="h-10 hidden dark:block" />
                            <div className="h-8 w-px bg-border/50" />
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Setup Phase</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => document.documentElement.classList.toggle('dark')}
                            >
                                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                            </Button>
                        </div>
                    </header>

                    <div className="md:px-16 px-8 flex-1 flex flex-col items-center justify-center py-10">
                        <div className="w-full max-w-2xl space-y-12">
                            <div className="space-y-6">
                                <h1 className="text-4xl font-display font-bold tracking-tight text-foreground uppercase">
                                    Connect Storage <span className="text-brand">Cluster.</span>
                                </h1>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Link your AWS S3 bucket. Credentials are processed in-memory and never stored on our servers. Zero logging, full transparency.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8 bg-secondary/5 p-8 rounded-3xl border border-border/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-xs tracking-widest uppercase font-medium text-muted-foreground px-1">Bucket Name</label>
                                        <input
                                            type="text"
                                            name="bucketName"
                                            value={formData.bucketName}
                                            onChange={handleChange}
                                            className="input h-14 text-base rounded-xl"
                                            placeholder="production-assets-s3"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs tracking-widest uppercase font-medium text-muted-foreground px-1">Data Region</label>
                                        <select
                                            name="region"
                                            value={formData.region}
                                            onChange={handleChange}
                                            className="input h-14 text-base rounded-xl appearance-none bg-background pr-10"
                                        >
                                            {regions.map(r => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs tracking-widest uppercase font-medium text-muted-foreground px-1">Access Key ID</label>
                                        <input
                                            type="text"
                                            name="accessKeyId"
                                            value={formData.accessKeyId}
                                            onChange={handleChange}
                                            className="input h-14 text-base rounded-xl font-mono"
                                            placeholder="AKIA..."
                                        />
                                    </div>

                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-xs tracking-widest uppercase font-medium text-muted-foreground px-1">Secret Access Key</label>
                                        <input
                                            type="password"
                                            name="secretAccessKey"
                                            value={formData.secretAccessKey}
                                            onChange={handleChange}
                                            className="input h-14 text-base rounded-xl font-mono"
                                            placeholder="••••••••••••••••••••••••••••"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive text-sm">
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading || connectionStatus === 'success'}
                                    size="lg"
                                    className="w-full"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : connectionStatus === 'success' ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        <>
                                            Establish Connection
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="w-full flex items-center justify-between md:p-16 p-8 pt-8 border-t border-dotted border-border/50 mt-auto">
                        <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-brand" />
                            <span className="text-xs tracking-widest uppercase font-medium opacity-60">Encrypted Handshake Protocol</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <ul className="flex items-center gap-6">
                                <li><a href="https://twitter.com/ezdecode" className="text-muted-foreground hover:text-brand transition-all block"><Twitter className="size-5" /></a></li>
                                <li><a href="https://github.com/ezDecode" className="text-muted-foreground hover:text-brand transition-all block"><Github className="size-5" /></a></li>
                            </ul>
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default BucketSetup;
