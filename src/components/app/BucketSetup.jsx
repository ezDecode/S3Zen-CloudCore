/**
 * Bucket Setup
 * ncdai design system implementation
 * AWS configuration with grid lines and screen-line separators
 */

import { useState } from 'react';
import bucketManagerService from '../../services/bucketManagerService';
import { toast } from 'sonner';
import { Shield, Database, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { DiagonalSeparator as Separator } from '../ui/DiagonalSeparator';

export const BucketSetup = ({ user, onComplete }) => {
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
            // Step 1: Validate connection
            const verifyResult = await bucketManagerService.validateBucket(formData);
            if (!verifyResult.success) {
                throw new Error(verifyResult.error || 'Connection failed');
            }

            toast.success('Connection verified');

            // Step 2: Save bucket configuration
            const saveResult = await bucketManagerService.addBucket(formData);
            if (!saveResult.success && saveResult.error) {
                throw new Error(saveResult.error);
            }

            // Step 3: Success - now mark as complete and clear sensitive data
            setConnectionStatus('success');
            const bucket = saveResult.bucket || saveResult;

            // Clear sensitive credentials from memory
            setFormData(prev => ({
                ...prev,
                accessKeyId: '',
                secretAccessKey: ''
            }));

            // Navigate after brief delay
            setTimeout(() => onComplete(bucket), 1000);

        } catch (err) {
            if (bucketManagerService.useMock) {
                setConnectionStatus('success');
                // Clear credentials even in mock mode
                const bucketData = { bucketName: formData.bucketName, region: formData.region, id: 'mock-' + Date.now() };
                setFormData(prev => ({ ...prev, accessKeyId: '', secretAccessKey: '' }));
                onComplete(bucketData);
                return;
            }
            setConnectionStatus('error');
            setError(err.message || 'Failed to connect to cluster');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-screen overflow-x-hidden px-2">
            <div className="mx-auto border-x border-edge md:max-w-4xl min-h-screen flex flex-col">
                {/* top diagonal separator */}
                <Separator />

                {/* header */}
                <header className="screen-line-after px-4 py-4 flex items-center gap-3 opacity-60">
                    <Database className="w-4 h-4 text-brand" />
                    <span className="text-xs tracking-widest uppercase font-medium text-muted-foreground">Infrastructure Setup</span>
                </header>

                {/* main content */}
                <main className="flex-1 flex flex-col items-center justify-center py-12">
                    <div className="w-full max-w-md px-4 space-y-10">
                        {/* title section */}
                        <div className="space-y-4">
                            <h1 className="screen-line-after text-3xl tracking-tight pb-4 font-medium">
                                Connect Storage
                            </h1>
                        </div>

                        <div className="p-0">
                            <p className="font-mono text-sm text-balance text-muted-foreground" style={{ opacity: 0.7 }}>
                                Link AWS S3. Keys processed in-memory. Zero logging.
                            </p>
                        </div>

                        <Separator />

                        {/* form */}
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs tracking-widest uppercase font-medium text-muted-foreground px-1">Bucket Name</label>
                                    <input
                                        type="text"
                                        name="bucketName"
                                        value={formData.bucketName}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="e.g. production-assets"
                                    />
                                </div>

                                {/* 2 column grid with background lines */}
                                <div className="relative">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2 text-left">
                                            <label className="text-xs tracking-widest uppercase font-medium text-muted-foreground px-1">Data Region</label>
                                            <select
                                                name="region"
                                                value={formData.region}
                                                onChange={handleChange}
                                                className="input appearance-none bg-background pr-10 border-input/50 focus:border-brand"
                                            >
                                                {regions.map(r => (
                                                    <option key={r.value} value={r.value}>{r.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs tracking-widest uppercase font-medium text-muted-foreground px-1">Access Key ID</label>
                                            <input
                                                type="text"
                                                name="accessKeyId"
                                                value={formData.accessKeyId}
                                                onChange={handleChange}
                                                className="input font-mono bg-input/10 border-input/50 focus:border-brand placeholder:text-muted-foreground/30"
                                                placeholder="AKIA..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs tracking-widest uppercase font-medium text-muted-foreground px-1">Secret Access Key</label>
                                    <input
                                        type="password"
                                        name="secretAccessKey"
                                        value={formData.secretAccessKey}
                                        onChange={handleChange}
                                        className="input font-mono bg-input/10 border-input/50 focus:border-brand placeholder:text-muted-foreground/30"
                                        placeholder="••••••••••••••••"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="screen-line-before screen-line-after p-4 rounded-md bg-red-500/5 text-red-500 text-xs tracking-wide" style={{ border: '1px dotted rgba(239, 68, 68, 0.2)' }}>
                                    {error}
                                </div>
                            )}

                            <div className="screen-line-before pt-6">
                                <button
                                    type="submit"
                                    disabled={loading || connectionStatus === 'success'}
                                    className="btn btn-brand w-full h-11 rounded-md text-sm tracking-wide"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : connectionStatus === 'success' ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <>
                                            Connect
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>

                {/* diagonal separator */}
                <Separator />

                {/* footer */}
                <footer className="screen-line-before mt-auto">
                    <div className="px-4 py-6 flex items-center justify-between text-muted-foreground opacity-40">
                        <div className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5" />
                            <span className="text-xs tracking-widest uppercase font-medium">Encrypted Handshake Protocol</span>
                        </div>
                        <span className="text-xs font-medium">© {new Date().getFullYear()} CloudCore Lab</span>
                    </div>
                </footer>

                {/* bottom spacing */}
                <div className="h-4" />
            </div>
        </div>
    );
};

export default BucketSetup;
